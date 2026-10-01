# החלטות ותקלות

רשומות קצרות על החלטות תפעול ועל תקלות שהולידו כלל חדש. הרשומה החדשה ביותר למעלה.

## 2026-10-01 — `rm -rf .next` רץ בעץ הפרודקשן

**מה קרה.** ב-16:29 UTC רצה שרשרת פקודות שנועדה להכין worktree לפיתוח:
`cd <worktree> && …; git checkout -b … && rm -rf .next`. ה-worktree שהסקיל sea-ship
הפנה אליו (`/home/ubuntu/dev/sea-tower-sd-round`) כבר לא היה קיים. ה-`cd` נכשל, ה-`;`
המשיך, וההמשך רץ ב-cwd ברירת המחדל — `/var/www/sea-tower`. נוצר ענף בעץ הפרודקשן
ו-`.next` החי נמחק. התהליך הרץ המשיך להגיש HTML (200), אבל כל קובצי ה-CSS/JS
החזירו 400.

**שחזור.** הענף נמחק, נבנה מחדש אותו קומיט בדיוק (`4641c42`, ה-main שרץ), הורכב
ה-standalone והשירות הופעל מחדש ב-16:30:44 UTC. ‏`.next.rollback` (מ-19.9, בלי
PR #49 ו-#51) לא שימש. משך: כשתי דקות.

**למה.** נתיב worktree קבוע בסקיל שהתיישן, ו-`;` אחרי `cd` — שילוב שמפנה כל כשל
של `cd` אל עץ הפרודקשן.

**הכלל מעכשיו.**
- worktree חדש לכל משימה: `git worktree add` תחת `/home/ubuntu/dev/<branch-name>`,
  והסרה בסוף. אין נתיב worktree קבוע בשום הוראה.
- `cd` בשרשרת רק עם `&&` או `|| exit 1` — לעולם לא `;`.
- לפני `git checkout` / `git reset` / `rm -rf`: לוודא ש-`pwd` אינו `/var/www/sea-tower`.
- פריסה רק דרך `scripts/deploy-worktree.sh`; ‏rollback דרך `.next.rollback`.

הסקיל sea-ship עודכן בהתאם (Ronus922/claude-skills#1).
