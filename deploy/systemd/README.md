# שומר המייל — התקנה

`scripts/mail-watchdog.sh` סורק את ה-journal של `sea-tower.service` כל 15 דקות ושולח
הודעת WhatsApp (Green API) אחרי 3 כשלים רצופים של `leads: mail failed`, ושוב כשהמייל
חוזר לעבוד. הוא לא נוגע באפליקציה. פירוט מלא של הכללים — בכותרת הסקריפט.

## דרישות

- `jq`, `curl`, `flock`, `journalctl` (קיימים בשרת). בלי node.
- ארבעה משתנים ב-`/etc/sea-tower/sea-tower.env` (ראו `.env.example`):
  `GREEN_API_URL`, `GREEN_API_ID_INSTANCE`, `GREEN_API_TOKEN_INSTANCE`,
  `ALERT_WHATSAPP_CHAT_ID` (בפורמט `972XXXXXXXXX@c.us`).
  הקובץ הוא `root:root 600` — עורכים ב-`sudoedit`, לא מעתיקים ערכים לשום מקום אחר.

## התקנה (פעם אחת, אחרי מיזוג ל-main ו-`git pull` בעץ הפרודקשן)

```bash
sudo cp /var/www/sea-tower/deploy/systemd/sea-tower-mail-watchdog.{service,timer} /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now sea-tower-mail-watchdog.timer
systemctl list-timers sea-tower-mail-watchdog.timer --no-pager
```

מעתיקים ולא מקשרים (symlink): `systemctl enable` לא עובד על יחידות מקושרות מחוץ
ל-`/etc`, ושינוי בריפו צריך לעבור דרך `cp` + `daemon-reload` במודע.

## הפעלה ידנית ובדיקה

```bash
# סריקה אחת עכשיו (אותה זהות ואותו env כמו ה-timer)
sudo systemctl start sea-tower-mail-watchdog.service
journalctl -u sea-tower-mail-watchdog.service -n 20 --no-pager

# הודעת בדיקה אחת ל-WhatsApp, בלי לגעת ב-state. הסודות נטענים ע"י systemd — לא עוברים ב-argv
sudo systemd-run --wait --collect --pipe --uid=ubuntu --gid=devops-www \
  -p EnvironmentFile=/etc/sea-tower/sea-tower.env \
  /var/www/sea-tower/scripts/mail-watchdog.sh --test-send

# מצב נוכחי
cat /var/lib/sea-tower/watchdog.state
```

ללוג יוצאים רק קוד HTTP ו-`idMessage`. הטוקן לא מודפס לעולם.

## בדיקות ללא רשת

```bash
scripts/mail-watchdog.test.sh
```

מריץ את תרחישי מכונת המצבים על קלט journal מקובץ, עם `--dry-run` (השליחה = `echo`).

## הסרה

```bash
sudo systemctl disable --now sea-tower-mail-watchdog.timer
sudo rm /etc/systemd/system/sea-tower-mail-watchdog.{service,timer}
sudo systemctl daemon-reload
sudo rm -rf /var/lib/sea-tower   # ה-state בלבד; אין בו סודות
```

## איפוס ה-state

אם רוצים שהסריקה הבאה תתחיל מחדש (24 שעות אחורה, בלי זיכרון של התראות):

```bash
sudo rm /var/lib/sea-tower/watchdog.state
```
