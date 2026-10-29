# RUNBOOK — Sea Tower (מגדל הים)

נוהל תגובה לתקלה. שמות משתנים ושמות שירותים בלבד, בלי ערכי סודות.
שדה שלא נבדק מסומן "לא אומת". שדה שאין לו תיעוד מסומן "לא מתועד".
הריפו ציבורי (נבדק 29/10/2026), ולכן אין כאן נתיבי שרת, פורטים וכתובות פנימיות. הם בקובץ ה-env של השרת,
ביחידות ה-systemd ובקובצי התצורה של השרת, לא בגיט.

העובדות נאספו ב-29/10/2026 בקריאה בלבד: קוד מ-`origin/main`, יחידות systemd, קובצי nginx, לוג nginx,
journal של השירות, בקשות GET ציבוריות. לא בוצעה התחברות ל-DB ולא נקראו ערכי סודות.

עודכן באותו יום, אחרי תיקוני חלק ב': תיקון שומר המייל ו-`OnFailure=` ליחידה שלו (PR #59), ואישור ה-relay של
Google Workspace לכתובת החדשה של השרת. הסעיפים "ניטור" ו"תקלות מוכרות" משקפים את המצב אחרי התיקון.

## זהות

- דומיין קנוני: <https://www.sea-tower.co.il>. nginx מסיים TLS (Let's Encrypt, Certbot). התעודה של `www` תקפה עד
  04/12/2026 (נבדק 29/10/2026). התשובה הציבורית מגיעה מ-nginx ישירות, בלי כותרות Cloudflare (נבדק 29/10/2026).
- הפניות (301, נבדק בקובצי nginx החיים וב-`curl`):
  - `sea-tower.co.il` ← `www.sea-tower.co.il`, עם שמירת הנתיב.
  - `sea-tower.bios.co.il` ← `www.sea-tower.co.il`.
  - `seartower.bios.co.il` ← `sea-tower.bios.co.il` (ואז ל-`www`: שני hops).
  - HTTP ← HTTPS.
  - הפניות 301 מהאתר הישן (וורדפרס) מוגדרות ב-`redirects()` ב-`next.config.ts`. המפה: `docs/legacy-urls.md`,
    האימות: `docs/redirects-verification.md`, ובדיקה מול האתר החי: `npm run test:redirects` (ברירת מחדל: `www`).
- קובצי ה-nginx של האתר אינם בגיט (`deploy/` מכיל רק את יחידות ה-watchdog).
- תהליכים (systemd, לא pm2):
  - `sea-tower.service`: שרת ה-Next במצב standalone (`.next/standalone/server.js`), עם ה-Node של המערכת.
    `Restart=always`, `RestartSec=5`, `User=ubuntu`, `Group=devops-www`, וקובץ env ייעודי ב-`EnvironmentFile`.
    פעיל מ-22/10/2026 03:28 UTC, `NRestarts=0` (נבדק 29/10/2026). אין `OnFailure=` ואין הגבלת זיכרון.
    קובץ היחידה מותקן בשרת בלבד ואינו בגיט.
  - `sea-tower-mail-watchdog.timer`: כל 15 דקות (`OnCalendar=*:0/15`, השהיה אקראית עד דקה, `Persistent=true`).
    מפעיל את `sea-tower-mail-watchdog.service`. הקבצים ב-`deploy/systemd/` והמותקנים זהים להם מבחינה
    פונקציונלית; ההבדל היחיד הוא שתי שורות הערה שקיימות בריפו ולא ביחידה המותקנת (נבדק 29/10/2026).
    פירוט: "ניטור" ו-`deploy/systemd/README.md`.
  - `site-health.timer`: משותף לכל האתרים בשרת. בודק את האתר מקומית ומאתחל את `sea-tower.service` (ראה "ניטור").
  - אין worker נפרד ואין cron של האתר (לא נמצאו הפניות ל-sea-tower בתיקיות ה-cron של המערכת וב-crontab של המשתמש).
- קובץ env: שמות המשתנים ב-`.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `GUESTHUB_API_URL`, `GUESTHUB_BOOKING_SECRET`, `NEXT_PUBLIC_GTM_ID`,
  `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `GMAIL_USER`,
  `GMAIL_APP_PASSWORD`, `SMTP_EHLO_NAME`, `GREEN_API_URL`, `GREEN_API_ID_INSTANCE`, `GREEN_API_TOKEN_INSTANCE`,
  `ALERT_WHATSAPP_CHAT_ID`.
  - ערכי הריצה נקראים מקובץ ה-env של השרת (`EnvironmentFile` ב-`sea-tower.service`).
  - משתני `NEXT_PUBLIC_*` נצרבים ב-build, ולכן הפריסה דורשת גם `.env.local` ב-worktree שבונים בו.
- DB: schema `sea_tower` בתוך מסד `postgres` של ה-Supabase המשותף (קונטיינר `supabase-db`). הטבלה `sea_tower.leads`
  עם RLS ובלי policies ל-anon; הגישה מהשרת בלבד דרך `SUPABASE_SERVICE_ROLE_KEY` (`CLAUDE.md`).
  - מיגרציות בקבצים ב-`db/migrations/` (`000_init_schema.sql`, `001_leads.sql`, `002_leads_is_spam.sql`).
    איך מחילים אותן בפרודקשן, ולדג'ר: לא מתועד. מה הוחל בפועל: לא אומת.
- אין העלאת קבצים באתר, ואין DB מקומי.

## ניטור

- Health: אין. אין route כזה באפליקציה (ה-API הוא `/api/leads` ו-`/api/booking/checkout` בלבד).
  תקינות האתר נבדקת דרך הדף הראשי.
- UptimeRobot: קיים מוניטור על `GET /` של `www.sea-tower.co.il`. בלוג nginx של 29/10/2026 נראות בקשות עם
  `UptimeRobot/2.0` בתשובה 200, במרווח של כ-5 דקות. שם המוניטור ואנשי הקשר: לא מתועדים.
  המוניטור בודק רק שהדף הראשי עונה. הוא לא בודק את טופס הלידים, את ה-DB או את GuestHub.
- Sentry: אין. Renovate: אין. CI: אין (`.github` לא קיים). ל-`main` יש ruleset עם PR חובה, בלי checks נדרשים.
- `site-health` (watchdog מקומי, משותף): בודק את הדף הראשי מקומית כל דקה (קודי תשובה תקינים: 200 ו-307) ומאתחל את
  `sea-tower.service` אחרי 2 כשלים רצופים. בלוג מופיע `strike N/2` (`journalctl -t site-health`). ההגדרה נמצאת בקובץ
  התצורה של השרת, לא בגיט. מהסקריפט המשותף (נקרא 29/10/2026): מרווח מינימלי של 15 דקות בין אתחולים של אותו אתר,
  ו-30 דקות בין התרעות חוזרות. ההתרעה יוצאת ב-WhatsApp כשהערוץ מוגדר, ואחרת נכתבת ללוג בלבד; האם הערוץ מוגדר
  בפועל: לא אומת. כשל של `site-health.service` עצמו לא מתריע (אין לו `OnFailure=`).
- שומר המייל: `scripts/mail-watchdog.sh`, רץ מ-`sea-tower-mail-watchdog.service`. סורק את ה-journal של
  `sea-tower.service` בשני ערוצים, ברצף, ושולח הודעת WhatsApp (Green API) אחרי 3 כשלים רצופים, ושוב כשהערוץ חוזר.
  - הערוץ `mail` מזהה `leads: mail failed` ו-`leads: mail skipped`. הערוץ `whatsapp` מזהה `leads: whatsapp failed`.
  - ההודעה כוללת רק את שם האתר, מספר הכשלים, קוד שגיאה, מועד ההצלחה האחרונה ופקודת `journalctl`. בלי תוכן ליד.
  - ליחידה יש `OnFailure=` לתבנית ההתרעה המשותפת של השרת (`billing-alert@…`, אותה תבנית של גיבויי rentbook
    ו-guesthub, לפי הערה ביחידה). נוסף ב-29/10/2026 (PR #59) ואומת ב-`systemctl show`. אחרי שבוע של כשלים שקטים
    (ראה "תקלות מוכרות") כשל של השומר עצמו אמור להתריע. האם ההתרעה נבדקה בירי מבוקר: לא אומת.
  - המצב נשמר בקובצי state של השירות. ערוץ `mail` שהגיע ל-`alerted=true` חוזר ל-`alerted=false` רק אחרי ליד שנשלח
    בהצלחה ונרשם ב-journal כ-`leads: mail sent`, ולא ממייל בדיקה שנשלח מחוץ לאפליקציה.
- לוגים:
  - האפליקציה: journald, `journalctl -u sea-tower.service`. אין קובצי לוג. מדיניות השמירה של journald: ברירת מחדל
    של המערכת, לא הוגדרה ייעודית.
  - nginx: לוג ה-access המשותף של השרת, בפורמט `combined_host`. השדה האחרון בשורה הוא ה-host.

## שירותים חיצוניים

- Supabase (משותף, self-hosted): שמירת לידים. משתנים: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`.
- GuestHub: מקור הזמינות והמחירים ל-`/booking` ול-`/api/booking/checkout`. משתנים: `GUESTHUB_API_URL`,
  `GUESTHUB_BOOKING_SECRET`. כשחסר `GUESTHUB_API_URL` הקוד פונה לכתובת loopback מקומית (`src/lib/booking-api.ts`).
  התנהגות האתר כש-GuestHub לא עונה: לא אומת.
- Gmail SMTP: מייל התראה על ליד (`src/lib/mailer.ts`, עד 4 ניסיונות). משתנים: `GMAIL_USER`, `GMAIL_APP_PASSWORD`,
  `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_EHLO_NAME`. שם ה-EHLO מפורש כי ה-relay דחה את שם ברירת המחדל (כתובת loopback) ב-421.
  ה-relay הוא ה-SMTP relay של Google Workspace, והוא מאשר שולחים לפי כתובת ה-IP הציבורית של השרת. הקמה מחדש של
  השרת או שינוי כתובת מחייבים עדכון הרשימה בקונסולת Google Workspace, אחרת כל מייל ליד נדחה (ראה "תקלות מוכרות").
- Green API (WhatsApp): התראה על כל ליד (`src/lib/whatsapp.ts`) והתראות ה-watchdog. משתנים: `GREEN_API_URL`,
  `GREEN_API_ID_INSTANCE`, `GREEN_API_TOKEN_INSTANCE`, `ALERT_WHATSAPP_CHAT_ID`. הטוקן לא מודפס ללוג.
- Google Tag Manager ואימות אתר: `NEXT_PUBLIC_GTM_ID`, `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`.

## תגובה לקריסה

1. מצב האתר מבחוץ ומהשירות:
   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' https://www.sea-tower.co.il/
   systemctl is-active sea-tower.service
   ```
   - 502 או 504 — התהליך למטה או תקוע.
   - 200 אבל הדף בלי עיצוב: `/_next/static` מחזיר 400. זה מצב של `.next` חסר או לא שלם (ראה "תקלות מוכרות").
   - אין מוניטור חיצוני לטופס הלידים. בודקים אותו דרך הלוג (צעד 3).
2. שירות ולוגים:
   ```bash
   systemctl status sea-tower.service --no-pager
   journalctl -u sea-tower.service -n 50 --no-pager
   journalctl -t site-health -n 50 --no-pager
   ```
   ייתכן שה-`site-health` כבר אתחל את השירות. הלוג שלו מראה אם כן.
3. נתיב הלידים (מייל ו-WhatsApp), בלי תוכן ליד:
   ```bash
   journalctl -u sea-tower.service --since '3 days ago' --no-pager | grep -E 'leads: (mail|whatsapp)'
   systemctl status sea-tower-mail-watchdog.service --no-pager
   ```
4. Sentry: אין. שגיאות שרת רק ב-journal.
5. DB: טופס הלידים תלוי ב-`supabase-db` המשותף:
   ```bash
   docker ps --filter name=supabase-db
   docker logs --tail 50 supabase-db
   ```
   ה-DB משותף לפרויקטים אחרים על השרת. restart לקונטיינר — רק באישור רונן.
6. פריסה אחרונה חשודה. אפשרויות לפי הדחיפות:
   - **חזרה ל-build הקודם** (`.next.rollback`, נשמר build אחד בלבד). בעץ הפרודקשן, אחרי שאימתת ש-`pwd` הוא
     עץ הפרודקשן ולא worktree אחר. הפקודות נגזרות מקריאת `scripts/deploy-worktree.sh` ולא הורצו:
     ```bash
     pwd
     mv .next .next.failed && mv .next.rollback .next && sudo systemctl restart sea-tower.service
     ```
     ההודעה שהסקריפט מדפיס בכשל (`mv .next.rollback .next`) מדלגת על הצעד הראשון. כש-`.next` קיים,
     `mv` יכניס את `.next.rollback` לתוכו.
   - **המסלול הקנוני: revert דרך PR** ופריסה רגילה (סעיף "פריסה"). ‏`main` מוגן ב-ruleset: PR חובה, בלי checks נדרשים.
     ה-merge של רונן.
   - אסור `rm -rf .next` בעץ הפרודקשן, ואסור `;` אחרי `cd` בשרשרת פקודות (ראה "תקלות מוכרות", 01/10/2026).
7. DB פגוע: שחזור מגיבוי ה-cluster של billing (סעיף "גיבויים"), קודם לקונטיינר בדיקה. שחזור על פרוד — רק עם גיבוי
   טרי ובאישור מפורש של רונן. נוהל שחזור של schema `sea_tower` בלבד מתוך ה-dump: לא מתועד.
8. כל פעולה שמשנה מצב מדווחת לרונן לפני ביצוע. עצירת תהליך: `sudo systemctl stop sea-tower.service` או `kill <PID>`.
   לעולם לא `pkill -f` או `killall`, כי על השרת רצים תהליכי production של פרויקטים אחרים.

### תקלות מוכרות

- **`rm -rf .next` בעץ הפרודקשן (01/10/2026, כשתי דקות):** שרשרת פקודות עם `;` אחרי `cd` שנכשל המשיכה לרוץ
  בעץ הפרודקשן. התהליך הרץ המשיך להחזיר HTML עם 200, אבל כל קובצי ה-CSS וה-JS החזירו 400. שוחזר בבנייה מחדש של
  אותו commit, הרכבת ה-standalone ו-restart. הכללים: worktree חדש לכל משימה, `cd` רק עם `&&`, בדיקת `pwd` לפני
  `git checkout` / `git reset` / `rm -rf`, ופריסה רק דרך `scripts/deploy-worktree.sh` (`docs/decisions.md`).
- **מייל לידים שנכשל בשקט (09/09 עד 01/10/2026, שלושה שבועות):** אף אחד לא קרא את ה-journal. בעקבות זה נוסף
  שומר המייל. הסיבה לאותו כשל: ה-relay דחה את שם ה-EHLO שנבחר כברירת מחדל (כתובת loopback) ב-421, ולכן נוסף `SMTP_EHLO_NAME`.
- **פריסה שנפלה על `Module not found` (nodemailer):** `node_modules` ב-worktree לא תאם ל-`package-lock.json`.
  הסקריפט מריץ עכשיו `npm ci` לפני הבנייה ועוצר בכשל.
- **מייל לידים נדחה ב-`EENVELOPE` (נצפה ב-29/10/2026, אושר ותוקן באותו יום):** שלושת הלידים האחרונים בלוג של 5 ימים
  (25/10, ו-28/10 פעמיים) הסתיימו ב-`leads: mail failed { code: 'EENVELOPE', attempts: 4 }`, כשהתראת ה-WhatsApp על
  אותם לידים נשלחה (`leads: whatsapp sent`). `EENVELOPE` הוא קוד שגיאה של nodemailer.
  - הסיבה (אומתה בבדיקת מעטפה מול ה-relay: EHLO, MAIL FROM, RCPT TO, בלי DATA): ה-relay של Google Workspace דחה
    את השולח עם `550 5.7.1 Invalid credentials for relay`. השרת הוקם מחדש ב-21/10/2026 וכתובת ה-IP הציבורית שלו
    השתנתה, אבל הרשימה ב-Google עדיין כללה את הכתובת הישנה.
  - התיקון: עדכון הרשימה בקונסולת Google Workspace (ידני, בוצע על ידי הבעלים ב-29/10/2026). בדיקת המעטפה
    החזירה 250 (MAIL ו-RCPT) בסביבות 18:00 UTC, ומייל בדיקה אחד נשלח לכתובת הבעלים בסקריפט, לא דרך האפליקציה.
  - **עדיין לא אומת עם ליד אמיתי:** בלוג של `sea-tower.service` אין שורת `leads: mail …` אחרי התיקון. עד שיגיע ליד
    ויירשם `leads: mail sent`, שומר המייל ממשיך להציג `consecutive=3 alerted=true` (נצפה ב-19:45 UTC). זה צפוי ולא תקלה.
- **שומר המייל נכשל בשקט כשבוע (21/10 עד 29/10/2026, תוקן ב-PR #59):** ‏`sea-tower-mail-watchdog.service` הסתיים בקוד 1
  בכל ריצה של 15 דקות, החל מ-21/10/2026 21:15 UTC, עם `mail-watchdog.sh: line 197: fields[N]: unbound variable`
  (נצפו `fields[3]` ב-21/10 ו-`fields[4]` ב-29/10). הכשל לא התחיל ב-29/10; הוא רק התגלה אז.
  - הסיבה: הסקריפט רץ עם `set -u`, וקרא שדות מתוך `mapfile` של פלט `jq`. כשקוד השגיאה האחרון או מועד ההצלחה האחרונה
    ב-state ריקים, מספר השורות קטן ממספר השדות והגישה לשדה החסר קורסת. אומת בשחזור (29/10/2026).
  - התיקון: ‏`${fields[N]:-}` בשורה 199, ו-`OnFailure=` ליחידה (PR #59). מאז התיקון כל הריצות מסתיימות ב-`Result=success`
    (נבדק 29/10/2026 עד 19:45 UTC). התראה על כשל שלו לא הייתה אז אפשרית, כי ליחידה לא היה `OnFailure=`.
- **הודעת `[booking] … הוסתרו מ-/booking` ב-journal:** הודעה צפויה. דירה פנויה שאין לה תמונה ציבורית פעילה לא
  מוצגת, והתיקון הוא להעלות ב-GuestHub תמונה פעילה אחת לפחות.
- **מוני rate-limit ומניעת כפילויות ב-`/api/leads`:** נשמרים בזיכרון התהליך (instance יחיד) ומתאפסים בכל restart.

## פריסה

- סקריפט יחיד: `scripts/deploy-worktree.sh`, מורץ **מתוך worktree** שבו נבנה הקוד, לא מעץ הפרודקשן, ובאישור
  מפורש של רונן ("תדחוף"). חיוני: פריסה אחת לכל שינוי לוגי, כדי שתקלה תיוחס לשינוי אחד (`CLAUDE.md`).
- מה הסקריפט עושה, לפי הסדר:
  1. `git fetch origin main` ובדיקה ש-`origin/main` הוא אב קדמון של `HEAD`. ענף שלא מכיל אותו נדחה, כי הפריסה
     הייתה מחזירה בשקט עבודה שמוזגה.
  2. דורש עץ פרודקשן קיים ו-`.env.local` ב-worktree.
  3. `npm ci` (עוצר בכשל).
  4. `rm -rf .next` (ב-worktree), ואז `npm run build`.
  5. מרכיב את ה-standalone: מעתיק `.next/static` ו-`public` לתוכו.
  6. בודק ש-`server.js`, `.next/static` ו-`public` קיימים ב-standalone.
  7. מעתיק את `.next` לעץ הפרודקשן כ-`.next.new`, מוחק את `.next.rollback` הישן, מעביר `.next` ל-`.next.rollback`
     ואת `.next.new` ל-`.next`.
  8. `sudo systemctl restart sea-tower.service`, המתנה, ובדיקה ש-`is-active`, ושהדף הראשי המקומי מחזיר 200.
- מגבלות הסקריפט (נקראו בקוד, 29/10/2026):
  - לא בודק שהענף הוא `main`, שהוא מוזג, או שהעץ נקי. ה-commit שנפרס הוא מה שיושב ב-worktree.
  - אימות אחרי ה-restart הוא `is-active` ותשובה 200 מהדף הראשי בלבד. אין health, אין בדיקת BUILD_ID, ואין בדיקה של
    לידים או GuestHub.
  - אין rollback אוטומטי: כשל מדפיס הוראת שחזור ידנית (ראה "תגובה לקריסה", צעד 6).
  - נשמר build קודם אחד בלבד. כל פריסה מוחקת את ה-`.next.rollback` שלפניה.
  - אין `flock`.
- אחרי פריסה:
  ```bash
  systemctl is-active sea-tower.service
  curl -s -o /dev/null -w '%{http_code}\n' https://www.sea-tower.co.il/
  ```
- בדיקות: `npm test` (vitest). אין CI, ולכן הבדיקות רצות ידנית לפני PR. הפניות ה-301 מול האתר החי: `npm run test:redirects`.
- אסור לבנות או למחוק קבצים בעץ הפרודקשן מחוץ לסקריפט (ראה "תקלות מוכרות", 01/10/2026).

## גיבויים

- ל-Sea Tower אין גיבוי ייעודי. הנתונים היחידים הם הלידים ב-`sea_tower.leads`, בתוך ה-cluster המשותף של Supabase,
  והקוד נמצא בגיט. ה-cluster מכוסה בגיבוי של billing (לפי ה-RUNBOOK שלו ו-`docs/DATABASE.md` של bios-bot):
  - `billing-backup.timer`, יומי 03:00 UTC (נבדק 29/10/2026: active, ריצה אחרונה `Result=success`).
  - `pg_dumpall` של כל ה-cluster של `supabase-db`, ואחריו restic לדלי B2, שמירה 7d/4w/6m.
  - ש-schema `sea_tower` נמצא בפועל ב-dump האחרון: לא אומת.
- **תלות:** הגיבוי של Sea Tower נשען כולו על `billing-backup.service`. שינוי או השבתה שם מפסיקים גם את הגיבוי כאן.
  הנוהל המלא: `docs/backup.md` בריפו almogbilling.
- דריל שחזור: אין ל-Sea Tower. גם ל-billing אין דריל אוטומטי (לפי ה-RUNBOOK שלו).
- לא מכוסים בגיבוי הזה: קובץ ה-env של השרת, קונפיג nginx, יחידות systemd (ובהן `sea-tower.service`, שאינה בגיט),
  וקבצי ה-state של שומר המייל. מנגנון אחר שמגבה אותם: לא אומת.
- משמורת מפתחות: מפתח ה-restic של billing במנהל הסיסמאות של רונן, ולא ניתן לאימות מתוך הריפו הזה.
