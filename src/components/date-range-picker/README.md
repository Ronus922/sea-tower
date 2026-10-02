# `<DateRangePicker />` — בורר טווח תאריכים (GuestHub)

רכיב React עצמאי לבחירת טווח שהייה: תאריך הגעה, תאריך עזיבה וסטפר לילות.
בדסקטופ (‎≥768px) נפתח פופאובר עם שני חודשים זה לצד זה; במובייל (‎<768px) נפתח Bottom Sheet
עם חודשים בגלילה אנכית. RTL, פונט Assistant, אייקונים Material Symbols Outlined, צבעים מטבלת הטוקנים.

הרכיב **מבוקר** (controlled): המסך המארח מחזיק את הערך, הרכיב מחזיק את הלוגיקה, התצוגה והרספונסיביות.

## שימוש

```tsx
import { useState } from 'react';
import { DateRangePicker, type DateRange } from '@/components/date-range-picker';

export function StayField() {
  const [range, setRange] = useState<DateRange>({ start: '2026-10-04', end: '2026-10-10' });

  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      minDate={today}
    />
  );
}
```

- `onChange` נקרא תוך כדי הבחירה — הטופס מתעדכן חי. השמירה בפועל נשארת ב"שמור שינויים" של הטופס.
- `onCommit` נקרא בלחיצה על "סגור". `onCancel` נקרא אחרי שהערך שוחזר (ביטול / X / רקע / Esc / לחיצה בחוץ).

## תאריכים

- מחרוזות `YYYY-MM-DD` בלבד. השוואה לקסיקוגרפית, בלי `Date` ב-state ובלי `toISOString`.
- `end` הוא **יום העזיבה**, לא הלילה האחרון. לילות = `diffDays(start, end)`.
- ב-API של סגירת חדר `endDate` הוא הלילה האחרון — ההמרה נעשית מחוץ לרכיב:

```ts
import { addDays } from '@/components/date-range-picker';
const endDate = range.end ? addDays(range.end, -1) : null; // הלילה האחרון
```

## Props

| prop | סוג | ברירת מחדל | תיאור |
|---|---|---|---|
| `value` | `DateRange` | — | `{ start, end }` כמחרוזות `YYYY-MM-DD` או `null` |
| `onChange` | `(r: DateRange) => void` | — | נקרא בזמן הבחירה (עדכון חי) |
| `onCommit` | `(r: DateRange) => void` | — | "סגור" |
| `onCancel` | `() => void` | — | אחרי שחזור הערך מהפתיחה |
| `minDate` | `string` | אין | תאריכים לפניו חסומים (במקום `blockPast`) |
| `maxDate` | `string` | אין | תאריכים אחריו חסומים |
| `maxNights` | `number` | אין | מקסימום לילות בסטפר. בלי ערך — אין מגבלה, `[+]` לא נעול לעולם. המינימום הוא תמיד לילה אחד |
| `isDateDisabled` | `(d: string) => boolean` | — | חסימות נקודתיות (חדר סגור, תפוסה). טווח לא חוצה חסימה — היציאה נקבעת עד התאריך החסום הראשון |
| `showStepper` | `boolean` | `true` | סטפר לילות (ליד השדה בדסקטופ, בתוך ה-Sheet במובייל) |
| `stepperHint` | `string` | `"שינוי מזיז את תאריך היציאה"` | התווית מתחת לסטפר |
| `layout` | `'auto' \| 'side-by-side' \| 'stacked' \| 'sheet'` | `'auto'` | `auto`: ‎≥768px → `side-by-side`, אחרת `sheet`. `stacked` = פופאובר צר (ברוחב השורה, עד 640px) שבו החודש השני יורד מתחת לראשון, כמו בגיבוי של הדמו (ל-Drawer צר מ-700px) |
| `footerHint` | `{ done: string; pending: string }` | טקסטי ברירת המחדל | ההסבר בפוטר, עם/בלי תאריך יציאה |
| `sheetTitle` | `string` | `"בחירת תאריכי שהייה"` | תת-הכותרת ב-Sheet |
| `today` | `string` | התאריך המקומי | ניתן להזרקה לבדיקות/דמו |
| `placeholder` | `string` | `"בחרו תאריכים"` | טקסט השדה כשאין בחירה |

ההחלטה דסקטופ/מובייל ב-`auto` היא לפי **רוחב החלון** (`matchMedia('(max-width: 767px)')`), לא לפי רוחב המיכל —
כך בורר בתוך Drawer צר בדסקטופ נשאר פופאובר. ל-Drawer צר מ-700px מעבירים `layout="stacked"`.

## התנהגות

| פעולה | תוצאה |
|---|---|
| לחיצה ראשונה | תאריך הגעה (היציאה מתאפסת) |
| לחיצה על תאריך מאוחר | תאריך יציאה, הטווח ננעל |
| לחיצה על תאריך זהה / מוקדם | מחליפה את ההגעה |
| לחיצה כשיש טווח מלא | מתחילה בחירה חדשה |
| ריחוף (דסקטופ) אחרי הגעה | תצוגה מקדימה של הפס |
| סטפר `[−] N [+]` | משנה רק את היציאה (`start + N`). מינימום לילה אחד, מקסימום `maxNights` אם הוגדר. הכפתורים נעולים בלי טווח מלא |
| שדה הלילות (N) | שדה קלט: מקלידים מספר (למשל 30), Enter או blur מחילים: `end = start + N`. Esc משחזר ולא סוגר. חיצים ±1. ריק/0/לא מספר → הערך הקודם. חיתוך ל-`maxNights`, קטיעה בחסימה. readOnly (—) בלי תאריך הגעה |
| "סגור" | נעול עד שיש יציאה. שומר את הטווח כבסיס וסוגר |
| ביטול / X / רקע / Esc / לחיצה בחוץ | מחזירים את הטווח שהיה בפתיחה וסוגרים |

## שדה הלילות

הערך בין `[−]` ל-`[+]` הוא `<input inputmode="numeric">` שנראה בדיוק כמו הטקסט (אותו רוחב, 17px/800 בדסקטופ, 15px ב-Sheet, בלי מסגרת ורקע). בפוקוס: טבעת `rgba(37,64,200,.12)` ב-radius 10px, והטקסט נבחר כולו כדי להקליד ישר מספר חדש.

- חילול ב-**Enter** וב-**blur** בלבד. Enter לא שולח את הטופס המארח; אחרי Enter הפוקוס נשאר בשדה וכל הטקסט נבחר מחדש, כך שהקלדה נוספת מחליפה את הערך.
- **Esc** מחזיר את הערך הקודם ומשאיר את הבורר פתוח. **חיצים למעלה/למטה** = ±1.
- חילול עושה בדיוק מה ש-`[+]`/`[−]` עושים: `end = start + N`, התצוגה חוזרת לחודש ההגעה, `onChange` נקרא.
- ריק / 0 / לא מספר → הערך הקודם. מעל `maxNights` → נחתך. חוצה `isDateDisabled` → נקטע בחסימה הראשונה. בלי `maxNights` אין תקרה.
- בלי תאריך הגעה השדה `readOnly` ומציג `—`. עם הגעה בלבד אפשר להקליד מספר והיציאה נקבעת.
- `aria-label="מספר לילות"`. בדסקטופ מלכודת הפוקוס של הפופאובר כוללת את השורה העליונה (שדה, סטפר ושדה הלילות); ב-Sheet השדה בפנים ממילא.

## נגישות ומקלדת

- טריגר: `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`.
- פופאובר / Sheet: `role="dialog"` (`aria-modal="true"` במובייל), מלכודת פוקוס, החזרת פוקוס לטריגר בסגירה.
- לוח: `role="grid"`, לכל יום `aria-label` מלא ("4 באוקטובר 2026"), `aria-selected` על התא, `aria-disabled` ליום חסום, `aria-current="date"` להיום.
- מקלדת: חץ שמאלה = יום הבא (RTL), חץ ימינה = יום קודם, למעלה/למטה = שבוע, PageUp/PageDown = חודש, Enter = בחירה, Esc = ביטול, Tab מסתובב בתוך הדיאלוג.

## פריסה: הרכיב לא דוחף תוכן

- במצב סגור הרכיב תופס **שורה אחת בלבד**: שדה התאריכים, הסטפר והתווית מתחתיו. בלי רקע, בלי פאנל, בלי `min-height`, בלי מקום שמור.
- הפופאובר **צף**: React Portal ל-`document.body`, `position: fixed` לפי `getBoundingClientRect` של השדה, עדכון ב-`scroll` וב-`resize`. פתיחה לא משנה את גובה הטופס, הטבלה, הכרטיס או העמוד.
- מיקום: מתחת לשורה, מיושר לימין, 16px. אין מקום למטה → מעל השדה. אין מקום גם למעלה → מוצמד לתחתית החלון עם שוליים 16px, והלוח גולל בפנים (הכותרת והפוטר קבועים).
- **z-index**: `var(--drp-z, 100000)`. הרכיב לא מגדיר את המשתנה, כך שאפשר לכוונן מהפרויקט: `:root { --drp-z: 5000; }`. ה-Sheet במובייל והרקע שלו משתמשים באותו משתנה.

## דרישות מהמסך המארח (sea-tower)

- **פונט:** הרכיב קורא את `--drp-font` (ברירת מחדל Assistant). ב-sea-tower המארח מגדיר `--drp-font: var(--font-sans)`.
- **אייקונים:** SVG inline (`Icon.tsx`, גאומטריית Material Symbols Outlined) — בלי פונט אייקונים.
- **CSS:** `src/app/styles/date-range-picker.css`, מיובא מ-`globals.css` (כלל ברזל 7). כל הקלאסים בקידומת `drp-`.
- **צבעים:** כל צבע הוא משתנה `--drp-*`. מארח דורס אותם דרך `className` (מגיע לשורש, לפופאובר ול-Sheet),
  למשל `.drp-root.stm-drp { --drp-primary: ... }` ב-`styles/booking.css`.
- **Client Component:** הקבצים מסומנים `'use client'`.
- הפופאובר וה-Sheet מרונדרים ב-portal ל-`document.body` עם `z-index: var(--drp-z, 100000)`.

## טריגר חיצוני (תוספת ב-sea-tower)

כשלמסך כבר יש כפתור משלו (פס החיפוש ב-/booking):

```tsx
<DateRangePicker
  value={draft}
  onChange={setDraft}
  open={open}                 // פתיחה מבוקרת; הסגירה מדווחת ב-onCommit / onCancel
  anchorRef={buttonRef}       // עוגן מיקום + החזרת פוקוס; לחיצה עליו אינה "לחיצה בחוץ"
  hideTrigger                 // בלי שדה ובלי סטפר משלו
  className="stm-drp"         // דריסת משתני הצבע
  onCommit={(r) => ...}
  onCancel={() => ...}
/>
```

## מבנה הקבצים

```
components/date-range-picker/
  DateRangePicker.tsx       ← טריגר + בחירת תבנית (auto/side-by-side/stacked/sheet)
  DesktopPopover.tsx        ← פופאובר 2 חודשים + מיקום (מתחת לשדה, מיושר לימין, 16px; מעל אם אין מקום)
  MobileSheet.tsx           ← Bottom Sheet
  MonthGrid.tsx             ← חודש אחד, משותף
  NightsStepper.tsx         ← סטפר, משותף
  useRangeSelection.ts      ← start/end/hover/base, pick, setNights, cancel, commit + build של התאים
  dateUtils.ts              ← key/parse/addDays/diff/format — מחרוזות YYYY-MM-DD בלבד
  hooks.ts                  ← matchMedia, מלכודת פוקוס, נעילת גלילה, ניווט מקלדת
  texts.ts                  ← כל הטקסטים הקבועים (עברית)
  types.ts                  ← DateRange, DateRangePickerProps
  Icon.tsx                  ← אייקונים כ-SVG inline
  (CSS: src/app/styles/date-range-picker.css)
  index.ts
  *.test.ts(x)              ← Vitest + Testing Library
```

## בדיקות

רצות ב-vitest של הפרויקט, בפרויקט `dom` (jsdom + Testing Library, ראו `vitest.config.ts`):

```bash
npx vitest run src/components/date-range-picker
```
