/* טרנספורמציה של הקופי הגולמי מ-GuestHub לתוכן מוכן לתצוגה.

   ב-GuestHub שדה ה-description הוא מסמך Markdown ארוך שהבעלים כותב: פסקת
   פתיחה, "**תיאור הדירה**", "**פרטים מרכזיים**" ו-"## מה תמצאו בדירה" עם
   רשימת פריטים. גוש כזה לא נכנס לכרטיס — לא כטקסט ולא כ-Markdown גולמי.
   כאן הוא נפרק פעם אחת, בשרת, למשפט קצר לכרטיס ולמפרט המורחב.

   הפירוק סובלני בכוונה: חדר בלי כותרות, בלי תבליטים או בלי תיאור בכלל
   מחזיר מבנה ריק, והצרכן פשוט לא מרנדר את החלק הזה. */

const HEADING_RE = /^\s*(?:#{1,6}\s*(.+?)|\*\*\s*(.+?)\s*\*\*)\s*:?\s*$/;
const BULLET_RE = /^\s*[*\-•]\s+/;

/* Markdown שנשאר בטקסט הופך לרעש ויזואלי בכרטיס ("**תיאור הדירה**") */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/^#{1,6}\s*/, "")
    .replace(BULLET_RE, "")
    .replace(/\s+/g, " ")
    .trim();
}

const SECTION = {
  prose: /תיאור\s+הדירה/,
  facts: /פרטים\s+מרכזיים/,
  items: /מה\s+(?:תמצאו|יש)\s+ב?דירה/,
} as const;

type SectionKey = "lead" | "prose" | "facts" | "items";

export type RoomCopy = {
  /** הפסקה שלפני הכותרת הראשונה — הקופי השיווקי של הדירה */
  lead: string[];
  /** "תיאור הדירה" — הפסקאות של המפרט המורחב */
  prose: string[];
  /** "מה תמצאו בדירה" — פריטי הציוד, כבר בלי תבליטים */
  items: string[];
};

/* פירוק ה-Markdown לסקציות. שורה שכולה כותרת (## או **…**) פותחת סקציה;
   שורה עם טקסט אחרי ה-** היא תוכן ("**גודל הדירה:** 54 מ״ר") ולא כותרת */
export function parseRoomCopy(description: string | null): RoomCopy {
  const out: RoomCopy = { lead: [], prose: [], items: [] };
  if (!description) return out;

  let section: SectionKey = "lead";
  for (const raw of description.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    const heading = HEADING_RE.exec(line);
    if (heading) {
      const name = (heading[1] ?? heading[2] ?? "").trim();
      section = SECTION.prose.test(name)
        ? "prose"
        : SECTION.items.test(name)
          ? "items"
          : SECTION.facts.test(name)
            ? "facts"
            : "lead";
      continue;
    }

    /* "פרטים מרכזיים" חוזר על נתוני השבבים (גודל, תפוסה, מיטות) — הוא נשאר
       מחוץ למפרט המורחב כדי לא להציג את אותו נתון פעמיים */
    if (section === "facts") continue;

    const text = stripMarkdown(line);
    if (!text) continue;
    if (section === "items" || BULLET_RE.test(raw)) out.items.push(text);
    else out[section === "prose" ? "prose" : "lead"].push(text);
  }
  return out;
}

/* חיתוך על גבול מילה — בלי לחתוך באמצע מילה ובלי להשאיר פיסוק תלוי */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:־–—-]+$/, "")}…`;
}

const SHORT_MIN = 90;
const SHORT_MAX = 160;

/* המשפט הראשון, ואם הוא קצר מדי — גם השני, עד התקרה של §6 ברפרנס */
function firstSentences(text: string): string {
  const parts = text.split(/(?<=[.!?])\s+/);
  let out = parts[0] ?? "";
  for (let i = 1; i < parts.length && out.length < SHORT_MIN; i++) {
    const next = `${out} ${parts[i]}`;
    if (next.length > SHORT_MAX) break;
    out = next;
  }
  return out.replace(/\s*[.!]+$/, ".");
}

/* התיאור הקצר של הכרטיס: משפט אחד, 90–160 תווים כשאפשר. מועמדים — פסקת
   הפתיחה של התיאור (העשירה יותר) והתקציר שהבעלים כתב; נבחר זה שנופל בטווח,
   ואם אף אחד לא — הארוך מביניהם, מקוצר. אין המצאה: אם אין קופי, אין משפט */
export function shortDescription(copy: RoomCopy, summary: string | null): string | null {
  const candidates = [copy.lead[0], summary, copy.prose[0]]
    .filter((c): c is string => Boolean(c?.trim()))
    .map((c) => firstSentences(stripMarkdown(c)));
  if (candidates.length === 0) return null;

  const inRange = candidates.find((c) => c.length >= SHORT_MIN && c.length <= SHORT_MAX);
  if (inRange) return inRange;
  const fits = candidates.filter((c) => c.length <= SHORT_MAX);
  if (fits.length > 0) return fits.reduce((a, b) => (a.length >= b.length ? a : b));
  return truncate(candidates[0], SHORT_MAX);
}

/* פסקאות המפרט המורחב. אין סקציית "תיאור הדירה" — משתמשים בפסקת הפתיחה,
   כך שגם דירה עם תיאור קצר בלבד מקבלת מפרט אמיתי ולא ריק */
export function detailParagraphs(copy: RoomCopy): string[] {
  return (copy.prose.length > 0 ? copy.prose : copy.lead).slice(0, 6);
}

/* ---------- קבוצות מתקנים ---------- */

export type AmenityGroup = { name: string; items: string[] };

/* ארבע הקבוצות של הרפרנס (§3, גריד 2×2). כל פריט נופל לקבוצה הראשונה
   שמילת מפתח שלה מופיעה בו; מה שלא זוהה נכנס ל"נוחות" */
const GROUPS: Array<{ name: string; re: RegExp }> = [
  {
    name: "מטבח",
    re: /מטבח|מקרר|מיקרוגל|קומקום|כיריים|תנור|מדיח|סיר|מחבת|צלחות|סכו|כלי אוכל|פינת אוכל|דלפק אוכל|מיני בר|כוסות/,
  },
  {
    name: "סלון ומדיה",
    re: /טלוויזי|נטפליקס|כבלים|HOT|אינטרנט|Wi-?Fi|wifi|סלון|ספה|ספות|מזנון|שולחן קפה|פינת ישיבה|פינת עבודה|שולחן כתיבה/i,
  },
  {
    name: "חדר רחצה",
    re: /מקלח|אמבט|רחצה|מגבות|מייבש שיער|שמפו|סבון|חלוקי|שירותים/,
  },
  { name: "נוחות", re: /.*/ },
];

const ITEM_MAX = 48;
const PER_GROUP_MAX = 6;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/["'׳״]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

/* פריט שכל מילותיו כבר נאמרו בפריט מפורט יותר הוא כפילות: "מטבחון" מול
   "מטבח מאובזר הכולל מטבחון…", "מיזוג אוויר" מול "מיזוג אוויר וחימום".
   הרשימה מציגה את המפורט בלבד */
const containedIn = (needle: string, haystacks: string[]) => {
  const words = normalize(needle).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  return haystacks.some((h) => {
    const have = new Set(normalize(h).split(" "));
    return words.every((w) => have.has(w));
  });
};

/* "מה יש בדירה" — פריטי הציוד מהתיאור, ואחריהם המתקנים המובנים של GuestHub
   שעוד לא נאמרו. אין קבוצה ריקה ואין פריט שחוזר פעמיים */
export function amenityGroups(items: string[], amenities: string[]): AmenityGroup[] {
  const buckets = new Map<string, string[]>(GROUPS.map((g) => [g.name, []]));
  const seen: string[] = [];

  for (const raw of [...items, ...amenities]) {
    const text = truncate(stripMarkdown(raw), ITEM_MAX);
    if (!text || containedIn(text, seen)) continue;
    const group = GROUPS.find((g) => g.re.test(text)) ?? GROUPS[GROUPS.length - 1];
    const bucket = buckets.get(group.name);
    if (!bucket || bucket.length >= PER_GROUP_MAX) continue;
    bucket.push(text);
    seen.push(text);
  }

  return GROUPS.map((g) => ({ name: g.name, items: buckets.get(g.name) ?? [] })).filter(
    (g) => g.items.length > 0,
  );
}

/* ---------- מתקנים מובילים לכרטיס ---------- */

/* סדר הערך השיווקי מ-§2 ברפרנס: Wi-Fi ← מטבח ← מיזוג ← מאפיין ייחודי */
const MARKETING_ORDER = [
  /Wi-?Fi|אינטרנט/i,
  /מטבח/,
  /מיזוג/,
  /נוף|מרפסת|ג׳קוזי|ג'קוזי|בריכה/,
];

const rank = (a: string) => {
  const i = MARKETING_ORDER.findIndex((re) => re.test(a));
  return i === -1 ? MARKETING_ORDER.length : i;
};

export const TOP_AMENITIES = 4;

/* ארבעת המובילים + מונה. שניהם נגזרים מהרשימה, לעולם לא מוזנים ידנית */
export function topAmenities(amenities: string[]): { top: string[]; more: number } {
  const sorted = amenities
    .map((a, i) => ({ a, i, r: rank(a) }))
    .sort((x, y) => x.r - y.r || x.i - y.i)
    .map((x) => x.a);
  return { top: sorted.slice(0, TOP_AMENITIES), more: Math.max(0, sorted.length - TOP_AMENITIES) };
}

/* התגית: מאפיין מבדל אחד, עד 18 תווים (§2). נלקחת מהמתקנים האמיתיים של
   הדירה; אין מאפיין מבדל — אין תגית, ולא ממציאים "מומלץ" או "פופולרי" */
const TAG_PRIORITY = [/ג׳קוזי|ג'קוזי/, /נוף/, /מרפסת/, /מכונת כביסה/, /מיני בר/];
export const TAG_MAX = 18;

export function differentiatingTag(amenities: string[], fallback: string | null): string | null {
  for (const re of TAG_PRIORITY) {
    const hit = amenities.find((a) => re.test(a) && a.length <= TAG_MAX);
    if (hit) return hit;
  }
  return fallback && fallback.length <= TAG_MAX ? fallback : null;
}
