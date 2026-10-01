#!/usr/bin/env bash
# שומר המייל של מגדל הים — התראת WhatsApp על כשל חוזר בשליחת מייל הלידים.
#
# רקע: ה-mailer (src/lib/mailer.ts) נכשל בשקט שלושה שבועות (9.9–1.10.2026) כי אף אחד
# לא קרא את ה-journal. השומר רץ מ-systemd timer כל 15 דקות, סורק את ה-journal של
# sea-tower.service מאז הסריקה הקודמת, ושולח הודעת WhatsApp (Green API) אחרי 3 כשלים
# רצופים — ושוב כשהמייל חוזר לעבוד. הוא לא נוגע באפליקציה ולא ב-mailer.ts.
#
# שורות שהוא מזהה (מודפסות ע"י mailer.ts; ההודעה של "sent" נשברת לכמה שורות ב-journal):
#   leads: mail sent { messageId: '...', attempts: 1 }
#   leads: mail failed { code: 'ECONNECTION', attempts: 4 }
#   leads: mail skipped { code: 'ENV_MISSING' }      ← נספר ככשל: המייל לא יצא
#
# מכונת המצבים (נשמרת כ-JSON בקובץ ה-state):
#   failed → consecutive+1; אם לא alerted ו-consecutive הגיע לסף → התראה אחת, alerted=true
#   sent   → אם alerted → הודעת "חזר לעבוד", alerted=false; בכל מקרה consecutive=0
#   כשלון בשליחת ההודעה עצמה: ה-state נשמר כפי שהיה לפני האירוע וה-cursor נעצר לפניו,
#   כך שהסריקה הבאה מעבדת את אותו אירוע שוב ומנסה לשלוח שוב — בלי ספירה כפולה.
#   ריצה ראשונה (אין cursor): 24 שעות אחורה.
#
# פרטיות: להודעה יוצאים רק שם האתר, מספר הכשלים, קוד השגיאה, מועד ההצלחה האחרונה
# ופקודת journalctl. שום תוכן ליד, שום PII. הטוקן של Green API לא מודפס לעולם:
# xtrace כבוי, הכתובת עוברת ל-curl דרך stdin (לא בארגומנטים, לא ב-ps) ו-stderr של
# curl נזרק. ללוג יוצאים רק קוד HTTP ו-idMessage.
#
# שימוש:
#   mail-watchdog.sh                    סריקה (ברירת מחדל — כך ה-timer מריץ)
#   mail-watchdog.sh --test-send        הודעת בדיקה אחת ל-WhatsApp, בלי לגעת ב-state
#   mail-watchdog.sh --journal-file F   קלט journal מקובץ (שורות JSON כמו journalctl -o json)
#   mail-watchdog.sh --state-file F     קובץ state חלופי
#   mail-watchdog.sh --send-cmd CMD     במקום Green API מריץ: CMD "<message>" (למשל echo, false)
#   mail-watchdog.sh --dry-run          קיצור ל---send-cmd echo
#
# סביבה (בייצור מ-/etc/sea-tower/sea-tower.env דרך EnvironmentFile=):
#   GREEN_API_URL  GREEN_API_ID_INSTANCE  GREEN_API_TOKEN_INSTANCE  ALERT_WHATSAPP_CHAT_ID
# אופציונלי: WATCHDOG_UNIT WATCHDOG_STATE_FILE WATCHDOG_THRESHOLD WATCHDOG_SITE_NAME
#   WATCHDOG_JOURNAL_FILE WATCHDOG_SEND_CMD WATCHDOG_FIRST_RUN_SINCE
#
# תלויות: bash, journalctl, curl, jq, flock. בלי node.
set -euo pipefail
set +x  # גם אם הופעל עם bash -x — הטוקן לא יוצא ל-trace

UNIT="${WATCHDOG_UNIT:-sea-tower.service}"
SITE_NAME="${WATCHDOG_SITE_NAME:-מגדל הים}"
STATE_FILE="${WATCHDOG_STATE_FILE:-${STATE_DIRECTORY:-/var/lib/sea-tower}/watchdog.state}"
JOURNAL_FILE="${WATCHDOG_JOURNAL_FILE:-}"
SEND_CMD="${WATCHDOG_SEND_CMD:-}"
THRESHOLD="${WATCHDOG_THRESHOLD:-3}"
FIRST_RUN_SINCE="${WATCHDOG_FIRST_RUN_SINCE:--24h}"
IL_TZ="Asia/Jerusalem"
SEND_TIMEOUT=15
MODE="scan"

log() { printf 'mail-watchdog: %s\n' "$*" >&2; }
die() { log "$*"; exit 2; }

usage() {
  sed -n '2,/^set -euo/{/^set -euo/d;s/^# \{0,1\}//;p}' "$0"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --journal-file) JOURNAL_FILE="${2:?--journal-file needs a path}"; shift 2 ;;
    --state-file)   STATE_FILE="${2:?--state-file needs a path}"; shift 2 ;;
    --send-cmd)     SEND_CMD="${2:?--send-cmd needs a command}"; shift 2 ;;
    --dry-run)      SEND_CMD="echo"; shift ;;
    --test-send)    MODE="test-send"; shift ;;
    -h|--help)      usage; exit 0 ;;
    *) die "unknown argument: $1 (see --help)" ;;
  esac
done

for tool in jq curl; do
  command -v "$tool" >/dev/null 2>&1 || die "missing dependency: $tool"
done
[[ $THRESHOLD =~ ^[1-9][0-9]*$ ]] || die "WATCHDOG_THRESHOLD must be a positive integer"

# ---------------------------------------------------------------------------
# שליחה. $1 = הודעה. מחזיר 0 רק כששליחה אושרה (HTTP 200). לעולם לא מדפיס את ה-URL.
# ---------------------------------------------------------------------------
send_message() {
  local message="$1"

  if [[ -n $SEND_CMD ]]; then
    local -a argv
    read -r -a argv <<<"$SEND_CMD"
    "${argv[@]}" "$message"
    return $?
  fi

  local missing=()
  local name
  for name in GREEN_API_URL GREEN_API_ID_INSTANCE GREEN_API_TOKEN_INSTANCE ALERT_WHATSAPP_CHAT_ID; do
    [[ -n ${!name:-} ]] || missing+=("$name")
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    log "cannot send: missing env ${missing[*]}"
    return 1
  fi
  if [[ ! $ALERT_WHATSAPP_CHAT_ID =~ ^[0-9]{10,15}@c\.us$ ]]; then
    log "cannot send: ALERT_WHATSAPP_CHAT_ID must look like 972XXXXXXXXX@c.us"
    return 1
  fi

  local url body escaped
  url="${GREEN_API_URL%/}/waInstance${GREEN_API_ID_INSTANCE}/sendMessage/${GREEN_API_TOKEN_INSTANCE}"
  body="$(jq -cn --arg chatId "$ALERT_WHATSAPP_CHAT_ID" --arg message "$message" \
    '{chatId: $chatId, message: $message}')"
  # קובץ קונפיגורציה של curl: backslash ומרכאות כפולות נמלטים
  escaped="${body//\\/\\\\}"
  escaped="${escaped//\"/\\\"}"

  # ה-URL (עם הטוקן) וה-body עוברים ב-stdin כ-config: לא בארגומנטים, לא ב-ps, לא
  # בהודעת שגיאה. stderr של curl נזרק — הוא עלול להכיל את הכתובת.
  local response http_code curl_rc=0
  response="$(curl --silent --show-error --max-time "$SEND_TIMEOUT" \
      --output - --write-out '\n%{http_code}' --config - 2>/dev/null <<CURLCFG
url = "${url}"
request = "POST"
header = "Content-Type: application/json"
data = "${escaped}"
CURLCFG
  )" || curl_rc=$?

  http_code="${response##*$'\n'}"
  if [[ $curl_rc -ne 0 ]]; then
    log "send failed: curl exit ${curl_rc} (timeout ${SEND_TIMEOUT}s / network)"
    return 1
  fi
  if [[ $http_code != "200" ]]; then
    log "send failed: Green API HTTP ${http_code:-000}"
    return 1
  fi
  local id_message
  id_message="$(printf '%s' "${response%$'\n'*}" | jq -r '.idMessage // empty' 2>/dev/null || true)"
  log "sent: HTTP 200 idMessage=${id_message:-?}"
  return 0
}

il_time() {  # $1 = epoch seconds → "01.10.2026 19:42"
  TZ="$IL_TZ" date -d "@$1" '+%d.%m.%Y %H:%M'
}

alert_message() {  # $1 = מספר כשלים, $2 = קוד שגיאה, $3 = epoch הצלחה אחרונה או ריק
  local last_ok
  if [[ -n ${3:-} ]]; then last_ok="$(il_time "$3") (שעון ישראל)"; else last_ok="לא ידועה (אין הצלחה בטווח הסריקה)"; fi
  printf '🔴 %s — כשל בשליחת מייל לידים\n%s כשלים רצופים בשליחת התראת המייל על פנייה חדשה.\nשגיאה אחרונה: %s\nהצלחה אחרונה: %s\nלבדיקה: journalctl -u %s -n 200\n' \
    "$SITE_NAME" "$1" "$2" "$last_ok" "$UNIT"
}

recovery_message() {  # $1 = מספר כשלים לפני ההחלמה, $2 = epoch ההצלחה
  printf '🟢 %s — מייל הלידים חזר לעבוד\nנשלח בהצלחה ב-%s (שעון ישראל), אחרי %s כשלים רצופים.\nלבדיקה: journalctl -u %s -n 200\n' \
    "$SITE_NAME" "$(il_time "$2")" "$1" "$UNIT"
}

if [[ $MODE == "test-send" ]]; then
  send_message "$(printf '🧪 %s — הודעת בדיקה של שומר המייל (mail-watchdog --test-send, %s שעון ישראל)' \
    "$SITE_NAME" "$(il_time "$(date +%s)")")"
  exit $?
fi

# ---------------------------------------------------------------------------
# state
# ---------------------------------------------------------------------------
cursor=""; consecutive=0; alerted="false"; last_success_ts=""; last_error_code=""

mkdir -p "$(dirname "$STATE_FILE")"
exec 9>"${STATE_FILE}.lock"
flock -n 9 || { log "another scan is running; skipping"; exit 0; }

if [[ -s $STATE_FILE ]]; then
  if state_lines="$(jq -r '
        (.cursor // ""), (.consecutive // 0), (if .alerted == true then "true" else "false" end),
        (.last_success_ts // "" | tostring), (.last_error_code // "")' "$STATE_FILE" 2>/dev/null)"; then
    mapfile -t fields <<<"$state_lines"
    cursor="${fields[0]}"; consecutive="${fields[1]}"; alerted="${fields[2]}"
    last_success_ts="${fields[3]}"; last_error_code="${fields[4]}"
    [[ $consecutive =~ ^[0-9]+$ ]] || consecutive=0
    [[ $last_success_ts =~ ^[0-9]+$ ]] || last_success_ts=""
  else
    log "state file unreadable; starting fresh"
  fi
fi

write_state() {
  jq -n --arg cursor "$cursor" --argjson consecutive "$consecutive" --argjson alerted "$alerted" \
        --arg last_success_ts "$last_success_ts" --arg last_error_code "$last_error_code" \
        --arg updated_at "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" '{
    cursor: $cursor, consecutive: $consecutive, alerted: $alerted,
    last_success_ts: (if $last_success_ts == "" then null else ($last_success_ts | tonumber) end),
    last_error_code: $last_error_code, updated_at: $updated_at }' > "${STATE_FILE}.tmp"
  mv -f "${STATE_FILE}.tmp" "$STATE_FILE"
}

# ---------------------------------------------------------------------------
# קריאת ה-journal → אירועים: ts<TAB>kind<TAB>cursor<TAB>code  (ריק מסומן "-")
# ---------------------------------------------------------------------------
workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT
raw="$workdir/raw.json"

if [[ -n $JOURNAL_FILE ]]; then
  [[ -r $JOURNAL_FILE ]] || die "journal file not readable: $JOURNAL_FILE"
  cp -- "$JOURNAL_FILE" "$raw"
else
  command -v journalctl >/dev/null 2>&1 || die "missing dependency: journalctl"
  if [[ -n $cursor ]]; then
    if ! journalctl -u "$UNIT" --after-cursor="$cursor" -o json --no-pager -q >"$raw" 2>/dev/null; then
      log "journalctl --after-cursor failed (journal rotated?); falling back to --since $FIRST_RUN_SINCE"
      journalctl -u "$UNIT" --since "$FIRST_RUN_SINCE" -o json --no-pager -q >"$raw" 2>/dev/null \
        || die "journalctl failed"
    fi
  else
    log "first run: scanning journal since $FIRST_RUN_SINCE"
    journalctl -u "$UNIT" --since "$FIRST_RUN_SINCE" -o json --no-pager -q >"$raw" 2>/dev/null \
      || die "journalctl failed"
  fi
fi

# MESSAGE רב-שורתי מגיע כמחרוזת; גרסאות ישנות מחזירות מערך בתים — מטופל.
# קוד השגיאה מוגבל ל-[A-Za-z0-9_-]{1,40} — זה כל מה שמגיע להודעה.
jq -r '
  def msg: (.MESSAGE // "") | if type == "array" then implode else tostring end;
  msg as $m
  | (if   ($m | startswith("leads: mail sent"))    then "sent"
     elif ($m | startswith("leads: mail failed"))  then "failed"
     elif ($m | startswith("leads: mail skipped")) then "failed"
     else "other" end) as $kind
  | (if $kind == "failed"
       then ([$m | capture("code: [^A-Za-z0-9_-](?<c>[A-Za-z0-9_-]{1,40})[^A-Za-z0-9_-]")] | if length > 0 then .[0].c else "unknown" end)
       else "-" end) as $code
  | [ ((.__REALTIME_TIMESTAMP // "0") | tonumber / 1000000 | floor),
      $kind,
      ((.__CURSOR // "") | if . == "" then "-" else . end),
      $code ]
  | @tsv' "$raw" >"$workdir/events.tsv" || die "journal input is not valid JSON lines"

# במצב קובץ: אם ה-cursor השמור מופיע בקובץ, מדלגים עד אליו (כמו --after-cursor)
skipping="false"
if [[ -n $JOURNAL_FILE && -n $cursor ]] && grep -qF -- "$cursor" "$workdir/events.tsv"; then
  skipping="true"
fi

# ---------------------------------------------------------------------------
# מכונת המצבים
# ---------------------------------------------------------------------------
prev_cursor="$cursor"
events=0; sent_seen=0; failed_seen=0

fail_and_stop() {  # שליחה נכשלה: שומרים state כפי שהיה לפני האירוע, cursor לפניו
  cursor="$prev_cursor"
  write_state
  log "$1 — state kept before the event; next scan retries"
  exit 1
}

while IFS=$'\t' read -r ts kind cur code; do
  [[ $cur == "-" ]] && cur=""
  if [[ $skipping == "true" ]]; then
    [[ $cur == "$cursor" ]] && skipping="false"
    continue
  fi
  events=$((events + 1))
  case "$kind" in
    failed)
      failed_seen=$((failed_seen + 1))
      next=$((consecutive + 1))
      if [[ $alerted == "false" && $next -ge $THRESHOLD ]]; then
        send_message "$(alert_message "$next" "$code" "$last_success_ts")" \
          || fail_and_stop "alert not delivered"
        alerted="true"
      fi
      consecutive=$next
      last_error_code="$code"
      ;;
    sent)
      sent_seen=$((sent_seen + 1))
      if [[ $alerted == "true" ]]; then
        send_message "$(recovery_message "$consecutive" "$ts")" \
          || fail_and_stop "recovery notice not delivered"
        alerted="false"
      fi
      consecutive=0
      last_success_ts="$ts"
      ;;
  esac
  [[ -n $cur ]] && prev_cursor="$cur"
done <"$workdir/events.tsv"

cursor="$prev_cursor"
write_state
log "scan ok: entries=${events} sent=${sent_seen} failed=${failed_seen} consecutive=${consecutive} alerted=${alerted}"
