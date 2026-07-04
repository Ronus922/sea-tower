/* מאגר המאמרים — מקור אמת יחיד ל-/articles ול-/articles/[slug].
   התוכן חולץ 1:1 מהרפרנסים design-reference/exports/Article.html + Full-article.html.
   רק למאמר הדגל ("המדריך המלא…") קיים גוף עריכתי מלא ברפרנס; שאר הכרטיסים
   מגיעים עם כותרת/תקציר/קטגוריה/תמונה בלבד — לא ממציאים גוף שלא קיים במקור. */

export type ArticleCategory = "general" | "area";

/* בלוק תוכן מובנה — נטול HTML גולמי, נרנדר ע"י ArticleBody */
export type Run = string | { b: string } | { a: { href: string; text: string } };
export type ArticleBlock =
  | { t: "lead" | "p" | "h2" | "h3"; runs: Run[] }
  | { t: "ul"; items: Run[][] }
  | { t: "quote"; runs: Run[]; cite: string };

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  image: string; // תחת public/, נתיב מוחלט מהשורש
  imageAlt: string;
  /* מוצג ברשת /articles. הדגל (המאמר המלא) אינו כרטיס בקטלוג — נגיש דרך
     סלוג ישיר ודרך "מאמרים נוספים" של מאמרי הסביבה */
  listed: boolean;
  featured?: boolean;
  publishedAt?: string; // ISO; רק כשקיים במקור
  author: string;
  readingMinutes?: number; // מהמקור כשקיים, אחרת נגזר בזמן ריצה
  breadcrumbLabel?: string; // תווית הפירור למאמר (ברירת מחדל: title)
  figCaption?: string;
  body?: ArticleBlock[];
  relatedSlugs?: string[];
  seoTitle: string;
  seoDescription: string;
}

export const CATEGORY_LABEL: Record<ArticleCategory, string> = {
  general: "כללי",
  area: "בסביבה",
};

const DEFAULT_AUTHOR = "צוות מגדל הים";

/* ------------------------------------------------------------------ */

export const ARTICLES: Article[] = [
  {
    slug: "furnished-apartments-haifa",
    title: "השכרת דירות מרוהטות בחיפה",
    excerpt:
      "השכרת דירות מרוהטות בחיפה לטווח קצר — פתרון מושלם לנופש או למגורים זמניים. אם אתם מחפשים סאבלט נוח או השכרה ללא התחייבות, לתקופה קצרה או בינונית.",
    category: "general",
    image: "/images/articles/furnished-apartments-haifa.jpg",
    imageAlt: "השכרת דירות מרוהטות בחיפה",
    listed: true,
    author: DEFAULT_AUTHOR,
    seoTitle: "השכרת דירות מרוהטות בחיפה | מגדל הים",
    seoDescription:
      "השכרת דירות מרוהטות בחיפה לטווח קצר — פתרון מושלם לנופש או למגורים זמניים, סאבלט נוח והשכרה ללא התחייבות.",
  },
  {
    slug: "bahai-gardens-haifa",
    title: "טיול באזור מגדל הים – הגנים הבהאים",
    excerpt:
      "אם אתם מתארחים אצלנו במגדל הים בניין אלמוג, אנו ממליצים לבקר בגנים הבהאים בחיפה ובעכו, המושכים למעלה מחצי מיליון מבקרים בשנה ונמנים על אתרי התיירות המובילים.",
    category: "area",
    image: "/images/articles/bahai-gardens-haifa.jpg",
    imageAlt: "הגנים הבהאים חיפה",
    listed: true,
    author: DEFAULT_AUTHOR,
    relatedSlugs: ["dining-carmel-beach", "haifa-cable-car", "complete-vacation-guide-haifa"],
    seoTitle: "טיול באזור מגדל הים – הגנים הבהאים | מגדל הים",
    seoDescription:
      "הגנים הבהאים בחיפה ובעכו — מחצי מיליון מבקרים בשנה, מאתרי התיירות המובילים בישראל, דקות נסיעה ממגדל הים.",
  },
  {
    slug: "bridal-suite",
    title: "סוויטת התארגנות כלה",
    excerpt:
      "סוויטת התארגנות כלה גדולה ומרווחת מול הים. בדרך אל החתונה עוצרים במגדל הים — ההתלבשות, האיפור והצילומים עוברים ברוגע, ואתם מגיעים לאירוע רגועים וקורנים.",
    category: "general",
    image: "/images/articles/bridal-suite.jpg",
    imageAlt: "סוויטת התארגנות כלה",
    listed: true,
    author: DEFAULT_AUTHOR,
    seoTitle: "סוויטת התארגנות כלה מול הים | מגדל הים",
    seoDescription:
      "סוויטת התארגנות כלה גדולה ומרווחת מול הים במגדל הים — התלבשות, איפור וצילומים ברוגע לפני החתונה.",
  },
  {
    slug: "renovation-temporary-housing",
    title: "משפצים דירה? זקוקים למגורים זמניים",
    excerpt:
      "שיפוץ דירה הוא שלב חשוב לפני הכניסה אליה, אך לעיתים נתקלים בעיכובים בלוחות הזמנים. אנחנו כאן עם פתרון לינה גמיש ונוח לתקופת הביניים.",
    category: "general",
    image: "/images/articles/renovation-temporary-housing.jpg",
    imageAlt: "משפצים דירה — מגורים זמניים",
    listed: true,
    author: DEFAULT_AUTHOR,
    seoTitle: "משפצים דירה? מגורים זמניים בחיפה | מגדל הים",
    seoDescription:
      "פתרון לינה גמיש ונוח לתקופת הביניים בזמן שיפוץ הדירה — מגורים זמניים במגדל הים, חוף הכרמל בחיפה.",
  },
  {
    slug: "short-term-furnished-rental",
    title: "השכרת דירות מרוהטות לטווח קצר",
    excerpt:
      "השכרת דירה לטווח קצר נולדה מהביקוש לפתרון לינה חלופי. בשנים האחרונות חל גידול של עשרות אחוזים בהשכרת דירות מרוהטות על בסיס יומי, שבועי וחודשי.",
    category: "general",
    image: "/images/articles/bridal-suite.jpg",
    imageAlt: "השכרת דירות מרוהטות לטווח קצר",
    listed: true,
    author: DEFAULT_AUTHOR,
    seoTitle: "השכרת דירות מרוהטות לטווח קצר | מגדל הים",
    seoDescription:
      "השכרת דירות מרוהטות לטווח קצר על בסיס יומי, שבועי וחודשי — פתרון לינה חלופי נוח וגמיש במגדל הים.",
  },
  {
    slug: "long-term-rental",
    title: "השכרת דירות לטווח ארוך",
    excerpt:
      "השכרת דירות מרוהטות לטווח בינוני וארוך. שוק השכירות בישראל מאתגר — מחירים גבוהים באזורי הביקוש מצד אחד, ודירות במצב ירוד באזורים זולים מצד שני. אנחנו מציעים איזון.",
    category: "general",
    image: "/images/articles/long-term-rental.jpg",
    imageAlt: "השכרת דירות לטווח ארוך",
    listed: true,
    author: DEFAULT_AUTHOR,
    seoTitle: "השכרת דירות מרוהטות לטווח ארוך | מגדל הים",
    seoDescription:
      "השכרת דירות מרוהטות לטווח בינוני וארוך במגדל הים — איזון בין מחיר, מיקום ואיכות בשוק שכירות מאתגר.",
  },
  {
    slug: "business-lodging",
    title: "פתרונות לינה לעסקים",
    excerpt:
      "השכרת דירות לעסקים ולצוותי עבודה. בעלי עסקים רבים נדרשים להיפגש מחוץ לעירם לצורך פגישות והצעות מחיר — ואנו מספקים פתרון לינה נוח, מרכזי וגמיש.",
    category: "general",
    image: "/images/articles/business-lodging.jpg",
    imageAlt: "פתרונות לינה לעסקים",
    listed: true,
    author: DEFAULT_AUTHOR,
    seoTitle: "פתרונות לינה לעסקים ולצוותי עבודה | מגדל הים",
    seoDescription:
      "השכרת דירות לעסקים ולצוותי עבודה — פתרון לינה נוח, מרכזי וגמיש בחיפה, לפגישות ולשהייה ממושכת.",
  },
  {
    slug: "dining-carmel-beach",
    title: "לאכול ולגור במגדל הים – חוף הכרמל",
    excerpt:
      "מגדל הים שוכן על טיילת הים של חיפה ושופע מסעדות שף, מסעדות חוף ופאבים — אוכל משובח ומשקה מול הזריחה והשקיעה, במרחק צעדים מהדירה.",
    category: "area",
    image: "/images/articles/dining-carmel-beach.jpg",
    imageAlt: "לאכול ולגור במגדל הים חוף הכרמל",
    listed: true,
    author: DEFAULT_AUTHOR,
    relatedSlugs: ["bahai-gardens-haifa", "haifa-cable-car", "complete-vacation-guide-haifa"],
    seoTitle: "לאכול ולגור במגדל הים – חוף הכרמל | מגדל הים",
    seoDescription:
      "מסעדות שף, מסעדות חוף ופאבים על טיילת הים של חיפה — אוכל משובח מול הזריחה והשקיעה, במרחק צעדים ממגדל הים.",
  },
  {
    slug: "haifa-cable-car",
    title: "רכבל חיפה – העלייה השנייה",
    excerpt:
      "סמוך למגדל הים נמצא רכבל חיפה, המחבר בין קצה טיילת בת גלים לתצפית סטלה מאריס. הנסיעה ברכבל השקוף נמשכת כ-5 דקות, עם נוף מרהיב על המפרץ.",
    category: "area",
    image: "/images/articles/haifa-cable-car.png",
    imageAlt: "רכבל חיפה",
    listed: true,
    author: DEFAULT_AUTHOR,
    relatedSlugs: ["bahai-gardens-haifa", "dining-carmel-beach", "complete-vacation-guide-haifa"],
    seoTitle: "רכבל חיפה – העלייה השנייה | מגדל הים",
    seoDescription:
      "רכבל חיפה מחבר בין טיילת בת גלים לתצפית סטלה מאריס — נסיעה שקופה של כ-5 דקות עם נוף מרהיב על המפרץ, סמוך למגדל הים.",
  },

  /* ---------- מאמר הדגל: הגוף העריכתי המלא היחיד שקיים ברפרנס ---------- */
  {
    slug: "complete-vacation-guide-haifa",
    title: "המדריך המלא לחופשה מושלמת מול הים בחיפה",
    excerpt:
      "חיפה היא אחת הערים היפות והמגוונות בישראל — שילוב נדיר של ים תכלת, רכס כרמל ירוק ותרבות עשירה. כל מה שצריך לדעת כדי להפיק ממנה את המקסימום.",
    category: "area",
    image: "/images/articles/complete-vacation-guide-haifa.jpg",
    imageAlt: "הגנים הבהאים בחיפה",
    figCaption: "הגנים הבהאים, חיפה — מאתרי התיירות המוכרים בעולם, דקות נסיעה ממגדל הים",
    listed: false,
    featured: true,
    publishedAt: "2026-06-15",
    author: DEFAULT_AUTHOR,
    readingMinutes: 6,
    breadcrumbLabel: "חופשה מול הים",
    relatedSlugs: ["bahai-gardens-haifa", "haifa-cable-car", "dining-carmel-beach"],
    seoTitle: "המדריך המלא לחופשה מושלמת מול הים בחיפה | מגדל הים",
    seoDescription:
      "כל מה שצריך לדעת על חופשה מול הים בחיפה — מיקום, אטרקציות, מסעדות והדירה המושלמת על חוף הכרמל, במגדל הים.",
    body: [
      {
        t: "lead",
        runs: [
          "חיפה היא אחת הערים היפות והמגוונות בישראל — שילוב נדיר של ים תכלת, רכס כרמל ירוק ותרבות עשירה. אם תכננתם חופשה מול הים, ריכזנו עבורכם את כל מה שצריך לדעת כדי להפיק ממנה את המקסימום.",
        ],
      },
      { t: "h2", runs: ["חיפה — עיר של ים, הר ותרבות"] },
      {
        t: "p",
        runs: [
          "בין הטיילת התוססת לבין מדרונות הכרמל, חיפה מציעה חוויה שמתאימה לכל סוג של מטייל. בבוקר אפשר לשחות בים, בצהריים לטייל בין הגנים הבהאים המטופחים, ובערב ליהנות מארוחה במסעדת שף על קו המים. ",
          { b: "הכול במרחק הליכה" },
          " או נסיעה קצרה זה מזה.",
        ],
      },
      {
        t: "p",
        runs: [
          "העיר מחולקת לשלוש קומות אופי: העיר התחתית עם הנמל והבארים, מרכז הכרמל עם החנויות והקפה, וקצה הכרמל המשקיף על הים. כל שכונה והקסם שלה — וכולן נגישות בקלות מהמיקום המרכזי של מגדל הים.",
        ],
      },
      { t: "h2", runs: ["המיקום: לב חוף הכרמל"] },
      {
        t: "p",
        runs: [
          "מגדל הים שוכן בבניין אלמוג, בכניסה הדרומית לחיפה, ממש על חוף הכרמל — כ-50 מטר בלבד מקו המים. מסביבכם תמצאו את מיטב האטרקציות של האזור:",
        ],
      },
      {
        t: "ul",
        items: [
          [{ b: "טיילת חוף הכרמל" }, " — לריצת בוקר, רכיבה על אופניים או שקיעה רגועה מול הים."],
          [{ b: "מסעדות חוף ופאבים" }, " — מאוכל ים טרי ועד בתי קפה איטלקיים, במרחק צעדים."],
          [{ b: "רכבל חיפה" }, " — נסיעה שקופה ומרהיבה אל תצפית סטלה מאריס."],
          [{ b: "הגנים הבהאים" }, " — אחד מאתרי התיירות המוכרים בעולם, כעשר דקות נסיעה."],
          [{ b: "מרכז הקונגרסים הבינלאומי" }, " — לכנסים, אירועים ומופעים לאורך כל השנה."],
        ],
      },
      {
        t: "quote",
        runs: [
          "„הים הוא לא רק נוף מהחלון — הוא קצב חיים. כשמתעוררים אליו בבוקר, החופשה מתחילה עוד לפני שיוצאים מהדלת.”",
        ],
        cite: "— מתוך ספר האורחים של מגדל הים",
      },
      { t: "h2", runs: ["הדירה שלכם מול הים"] },
      {
        t: "p",
        runs: [
          "בשונה מחדר מלון סטנדרטי, דירת נופש נותנת לכם מרחב אמיתי לנשום. דירות מגדל הים גדולות, מוארות ומאובזרות בכל מה שיש בבית — מטבח מלא, פינת אוכל, סלון מרווח ונוף עוצר נשימה אל המפרץ.",
        ],
      },
      { t: "h3", runs: ["מה כולל האירוח"] },
      {
        t: "p",
        runs: [
          "כל יחידה מגיעה עם מצעים ומגבות ברמה מלונאית, מכונת קפה, ואי-פיי מהיר. הצ׳ק-אין פשוט וגמיש, והצוות זמין לאורך כל השהייה לכל בקשה — בדיוק כמו במלון, אבל עם הפרטיות והחופש של בית.",
        ],
      },
      {
        t: "p",
        runs: [
          "לפרטים נוספים על היחידות והזמינות תוכלו לעיין ב",
          { a: { href: "/#apartments", text: "עמוד הדירות שלנו" } },
          ", או לפנות אלינו ישירות ונשמח לעזור.",
        ],
      },
      { t: "h2", runs: ["טיפים אחרונים לפני שמגיעים"] },
      {
        t: "p",
        runs: [
          "הזמינו מראש בעונת השיא, ארזו בגדי ים ונעלי הליכה נוחות, ושריינו לפחות ערב אחד לשקיעה על הטיילת — זה הרגע שכולם זוכרים. ומעל הכול, אל תמהרו: חיפה היא עיר שמתגלה לאט, פינה אחר פינה.",
        ],
      },
      {
        t: "p",
        runs: [
          "מוכנים לתכנן את החופשה? אנחנו כאן כדי להפוך אותה לפשוטה, נוחה ובלתי נשכחת — ממש על קו המים.",
        ],
      },
    ],
  },
];

/* ------------------------------- helpers ------------------------------- */

export const LISTED_ARTICLES = ARTICLES.filter((a) => a.listed);

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/* ספירות טאבים נגזרות מהנתונים (מהמאמרים המוצגים בלבד) */
export function categoryCounts(): { all: number; general: number; area: number } {
  return {
    all: LISTED_ARTICLES.length,
    general: LISTED_ARTICLES.filter((a) => a.category === "general").length,
    area: LISTED_ARTICLES.filter((a) => a.category === "area").length,
  };
}

/* מאמרים קשורים: relatedSlugs מפורש → אחרת מאותה קטגוריה (ללא עצמו) → השלמה.
   תמיד עד 3, לעולם לא כולל את המאמר הנוכחי, וכל כרטיס מקושר לסלוג שלו. */
export function getRelated(slug: string, limit = 3): Article[] {
  const current = getArticle(slug);
  if (!current) return [];
  const out: Article[] = [];
  const push = (a?: Article) => {
    if (a && a.slug !== slug && !out.some((x) => x.slug === a.slug)) out.push(a);
  };
  (current.relatedSlugs ?? []).forEach((s) => push(getArticle(s)));
  LISTED_ARTICLES.filter((a) => a.category === current.category).forEach(push);
  LISTED_ARTICLES.forEach(push);
  return out.slice(0, limit);
}

/* זמן קריאה: מהמקור כשקיים, אחרת נגזר מהטקסט הזמין (≈200 מילים/דקה) */
export function readingMinutes(a: Article): number {
  if (a.readingMinutes) return a.readingMinutes;
  const text = a.body
    ? a.body
        .flatMap((b) =>
          "runs" in b
            ? b.runs
            : "items" in b
              ? b.items.flat()
              : []
        )
        .map((r) => (typeof r === "string" ? r : "b" in r ? r.b : r.a.text))
        .join(" ")
    : a.excerpt;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
