#!/usr/bin/env bash
# בדיקות ללא רשת לשומר המייל (scripts/mail-watchdog.sh).
# מריץ את מכונת המצבים על קלט journal מקובץ (שורות JSON כמו journalctl -o json),
# כשהשליחה מוחלפת ב-echo (או ב-false לסימולציית כשל שליחה). יוצא 1 אם תרחיש נכשל.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WD="$HERE/mail-watchdog.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
STATE="$TMP/state.json"
BASE_TS=1790800000   # 2026-10-01 ~ 06:26 UTC
run_no=0
fails=0

# fixture F S K O W V ... > file   (F=failed, S=sent רב-שורתי, K=skipped, O=שורה לא רלוונטית,
#                                  W=whatsapp failed, V=whatsapp sent)
fixture() {
  run_no=$((run_no + 1))
  local i=0 tok m
  for tok in "$@"; do
    i=$((i + 1))
    case "$tok" in
      F) m="leads: mail failed { code: 'ECONNECTION', attempts: 4 }" ;;
      K) m="leads: mail skipped { code: 'ENV_MISSING' }" ;;
      S) m="leads: mail sent {"$'\n'"  messageId: '<redacted@sea-tower.bios.co.il>',"$'\n'"  attempts: 1"$'\n'"}" ;;
      O) m="GET /api/leads 200 in 42ms" ;;
      W) m="leads: whatsapp failed { code: 'HTTP_401' }" ;;
      V) m="leads: whatsapp sent { idMessage: 'BAE5F4886AD7B1A1' }" ;;
      *) echo "bad token $tok" >&2; exit 2 ;;
    esac
    jq -cn --arg m "$m" --arg c "s=run${run_no};i=${i}" \
      --arg t "$(( (BASE_TS + run_no * 3600 + i * 60) * 1000000 ))" \
      '{MESSAGE: $m, __CURSOR: $c, __REALTIME_TIMESTAMP: $t}'
  done
}

# check NAME EXPECTED_ALERTS EXPECTED_RECOVERIES EXPECTED_RC SEND_CMD JOURNAL_FILE [CHANNEL]
check() {
  local name="$1" exp_a="$2" exp_r="$3" exp_rc="$4" sendcmd="$5" journal="$6" channel="${7:-mail}"
  local out rc=0
  out="$("$WD" --channel "$channel" --journal-file "$journal" --state-file "$STATE" --send-cmd "$sendcmd" 2>"$TMP/stderr")" || rc=$?
  local alerts recov state verdict="PASS"
  alerts="$(grep -c '^🔴' <<<"$out" || true)"
  recov="$(grep -c '^🟢' <<<"$out" || true)"
  state="$(jq -c '{consecutive, alerted, cursor, last_success_ts, last_error_code}' "$STATE" 2>/dev/null || echo '{}')"
  if [[ $alerts != "$exp_a" || $recov != "$exp_r" || $rc != "$exp_rc" ]]; then
    verdict="FAIL"; fails=$((fails + 1))
  fi
  printf '\n### %s  [%s]\n    alerts=%s (צפוי %s)  recovered=%s (צפוי %s)  rc=%s (צפוי %s)\n    state: %s\n' \
    "$name" "$verdict" "$alerts" "$exp_a" "$recov" "$exp_r" "$rc" "$exp_rc" "$state"
  out_last="$out"
  if [[ -n $out ]]; then
    while IFS= read -r line; do printf '    │ %s\n' "$line"; done <<<"$out"
  fi
  sed 's/^/    ⋮ /' "$TMP/stderr"
}

fresh() { rm -f "$STATE" "$STATE.lock"; }

echo "=== A. סף בודד: 3 כשלים בסריקה אחת → התראה אחת ==="
fresh
fixture F F F > "$TMP/a1.json";                       check "A1: F F F" 1 0 0 echo "$TMP/a1.json"

echo; echo "=== B. התרחיש מהמפרט (state נשמר בין הסריקות) ==="
fresh
fixture F F > "$TMP/b1.json";                         check "B1: 2 כשלים — אין התראה" 0 0 0 echo "$TMP/b1.json"
fixture F F F > "$TMP/b2.json";                       check "B2: 3 כשלים — התראה אחת" 1 0 0 echo "$TMP/b2.json"
fixture F F F F F > "$TMP/b3.json";                   check "B3: עוד 5 כשלים — שקט" 0 0 0 echo "$TMP/b3.json"
fixture S > "$TMP/b4.json";                           check "B4: sent — הודעת חזר לעבוד" 0 1 0 echo "$TMP/b4.json"
fixture F > "$TMP/b5.json";                           check "B5: כשל אחד אחרי — אין התראה" 0 0 0 echo "$TMP/b5.json"

echo; echo "=== C. שליחה נכשלת → state לפני האירוע, cursor לפניו, ניסיון חוזר בלי ספירה כפולה ==="
fresh
fixture F F F > "$TMP/c.json";                        check "C1: F F F, השליחה נכשלת (false)" 0 0 1 false "$TMP/c.json"
                                                      check "C2: אותו journal, השליחה עובדת" 1 0 0 echo "$TMP/c.json"

echo; echo "=== D. שורות אחרות, skipped כ-כשל, sent רב-שורתי — באותה סריקה ==="
fresh
fixture O K F O F S O > "$TMP/d.json";                check "D1: O K F O F S O → התראה + חזר לעבוד" 1 1 0 echo "$TMP/d.json"
fixture O O > "$TMP/d2.json";                         check "D2: בלי אירועים — שקט, cursor מתקדם" 0 0 0 echo "$TMP/d2.json"

echo; echo "=== E. ערוץ whatsapp: אותו כלל, state נפרד, כל ערוץ מתעלם מהשורות של השני ==="
fresh
fixture W F W F W > "$TMP/e1.json";                  check "E1: whatsapp — 3 W (עם F ביניהם) → התראה אחת" 1 0 0 echo "$TMP/e1.json" whatsapp
if grep -q 'וואטסאפ' <<<"$out_last" && ! grep -q 'מייל' <<<"$out_last"; then echo "    E1 text: PASS"; else echo "    E1 text: FAIL"; fails=$((fails + 1)); fi
fixture V S > "$TMP/e2.json";                         check "E2: whatsapp — V → חזר לעבוד" 0 1 0 echo "$TMP/e2.json" whatsapp
fresh
                                                      check "E3: mail על אותו journal — 2 F בלבד, שקט" 0 0 0 echo "$TMP/e1.json" mail
fixture V V V > "$TMP/e4.json";                       check "E4: אחרי E3 — whatsapp sent לא מאפס את mail" 0 0 0 echo "$TMP/e4.json" mail
if [[ $(jq -r .consecutive "$STATE") == 2 ]]; then echo "    E4 consecutive=2: PASS"; else echo "    E4 consecutive: FAIL"; fails=$((fails + 1)); fi

echo; echo "=== F. שם ה-state לפי ערוץ (בלי --state-file) ==="
SD="$TMP/sd"; mkdir -p "$SD"
STATE_DIRECTORY="$SD" "$WD" --journal-file "$TMP/e4.json" --send-cmd echo 2>/dev/null
STATE_DIRECTORY="$SD" "$WD" --channel whatsapp --journal-file "$TMP/e4.json" --send-cmd echo 2>/dev/null
if [[ -s $SD/watchdog.state && -s $SD/watchdog-whatsapp.state ]] \
   && [[ $(jq -r .last_success_ts "$SD/watchdog.state") == null ]] \
   && [[ $(jq -r .last_success_ts "$SD/watchdog-whatsapp.state") != null ]]; then
  echo "    F1: watchdog.state + watchdog-whatsapp.state, נפרדים  [PASS]"
else
  echo "    F1: [FAIL]"; fails=$((fails + 1))
fi
if "$WD" --channel sms --journal-file "$TMP/e4.json" --send-cmd echo 2>/dev/null; then
  echo "    F2: ערוץ לא מוכר נדחה  [FAIL]"; fails=$((fails + 1))
else
  echo "    F2: ערוץ לא מוכר נדחה  [PASS]"
fi

echo
if [[ $fails -eq 0 ]]; then echo "ALL PASS"; else echo "FAILED: $fails"; exit 1; fi
