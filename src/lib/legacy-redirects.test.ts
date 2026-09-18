import { readdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { LEGACY_PATTERN_REDIRECTS, LEGACY_REDIRECTS, toLowercaseEncodedPath } from "./legacy-redirects";
import { ARTICLES } from "@/data/articles";
import nextConfig from "../../next.config";

const siteDir = fileURLToPath(new URL("../app/(site)", import.meta.url));

/** כל נתיב שהאתר החדש מגיש בפועל — תיקיות מסלול תחת ‎(site)‎ פלוס עמודי המאמרים */
const servedPaths = new Set<string>([
  "/",
  ...readdirSync(siteDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(`${siteDir}/${entry.name}/page.tsx`))
    .map((entry) => `/${entry.name}`),
  ...ARTICLES.map((article) => `/articles/${article.slug}`),
]);

describe("מפת ההפניות מהאתר הישן", () => {
  it("מכילה את 79 כללי האינוונטר ועוד 8 מדוח ה-404", () => {
    expect(LEGACY_REDIRECTS).toHaveLength(87);
  });

  it("אין נתיב מקור כפול", () => {
    const sources = LEGACY_REDIRECTS.map(({ from }) => from);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it("כל נתיב מקור מתחיל בסלאש ובלי סלאש נגרר", () => {
    for (const { from } of LEGACY_REDIRECTS) {
      expect(from.startsWith("/"), from).toBe(true);
      expect(from.endsWith("/"), from).toBe(false);
    }
  });

  it("אין הפניה שמצביעה על עצמה", () => {
    const selfReferential = LEGACY_REDIRECTS.filter(({ from, to }) => from === to);
    expect(selfReferential).toEqual([]);
  });

  /* אכיפת hop אחד ברמת הנתונים: אם יעד של כלל אחד הוא מקור של כלל אחר, הדפדפן
     יקבל 301 ואז 301 נוסף — בדיוק השרשרת שאסור שתיווצר */
  it("אף יעד אינו מקור של כלל אחר — אין שרשרת 301→301", () => {
    const sources = new Set(LEGACY_REDIRECTS.map(({ from }) => from));
    const chained = LEGACY_REDIRECTS.filter(({ to }) => sources.has(to));
    expect(chained).toEqual([]);
  });

  it("כל יעד הוא נתיב שהאתר החדש מגיש בפועל", () => {
    const missing = LEGACY_REDIRECTS.filter(({ to }) => !servedPaths.has(to));
    expect(missing).toEqual([]);
  });
});

describe("קידוד נתיבים עבריים", () => {
  it("מקודד לאותיות קטנות — הצורה שאליה Next מנרמל בקשות נכנסות", () => {
    expect(toLowercaseEncodedPath("/תקנון")).toBe("/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f");
  });

  it("משמר נתיבי ASCII ללא שינוי", () => {
    expect(toLowercaseEncodedPath("/property/abc-123")).toBe("/property/abc-123");
  });

  it("כל נתיב מקודד חוזר לצורתו המפוענחת", () => {
    for (const { from } of LEGACY_REDIRECTS) {
      expect(decodeURIComponent(toLowercaseEncodedPath(from))).toBe(from);
    }
  });

  it("אין תו יוניקוד גלוי באף נתיב מקודד", () => {
    for (const { from } of LEGACY_REDIRECTS) {
      expect(toLowercaseEncodedPath(from), from).toMatch(/^[\x20-\x7E]*$/);
    }
  });
});


/* ------------------------------------------------------------------ *
 * אימות מול הכללים שהקונפיג פולט בפועל
 *
 * הבדיקות הבאות לא בוחנות את המפה אלא את `redirects()` עצמו, ומריצות נתיב דרך
 * הכללים עם אותו מנוע התאמה ש-Next משתמש בו (`path-to-regexp` המקומפל שלו) ובאותן
 * אפשרויות. כך נבדקים גם הסדר בין הכללים וגם השרשור בין כלל תבנית למפה הסטטית.
 * האימות ההתנהגותי המלא מול שרת חי נשאר ב-`legacy-redirects.live.test.ts`.
 * ------------------------------------------------------------------ */

type Matched = { params: Record<string, string | string[]> };
type PathToRegexp = {
  match: (source: string, options: object) => (path: string) => Matched | false;
  compile: (
    destination: string,
    options: object,
  ) => (params: Record<string, string | string[]>) => string;
};

const { match, compile } = createRequire(import.meta.url)(
  "next/dist/compiled/path-to-regexp",
) as PathToRegexp;

/* אותן אפשרויות שבהן Next מתאים כללי redirects: סלאש נגרר מובחן (`strict`), רישיות
   אינה מובחנת (`sensitive: false`), ובלי פענוח — הנתיב כבר מגיע מנורמל לקידוד אחוזים.
   `encode` זהותי ביעד, אחרת הקומפילציה הייתה מקודדת שוב את ה-% של מקטע עברי שנתפס */
const MATCH_OPTIONS = { strict: true, sensitive: false, delimiter: "/", decode: undefined };

const emitted = (await nextConfig.redirects!()).map((rule) => ({
  source: rule.source,
  statusCode: rule.statusCode,
  test: match(rule.source, MATCH_OPTIONS),
  build: compile(rule.destination, { validate: false, encode: (value: string) => value }),
}));

/** מריץ נתיב דרך הכללים לפי סדרם עד שאין התאמה, ומחזיר את היעד הסופי ואת ה-hops */
const follow = (path: string) => {
  const hops: { status: number | undefined; to: string }[] = [];
  let current = path;
  while (hops.length < 5) {
    const hit = emitted.find((rule) => rule.test(current) !== false);
    const matched = hit?.test(current);
    if (!hit || !matched) break;
    current = hit.build(matched.params);
    hops.push({ status: hit.statusCode, to: current });
  }
  return { final: decodeURIComponent(current), hops };
};

/** הכתובות מדוח ה-404 של Search Console (2026-09-18) והיעד הנדרש לכל אחת */
const SEARCH_CONSOLE_404 = [
  ["/HomePage", "/"],
  ["/homepage", "/"],
  ["/en", "/"],
  ["/ru", "/"],
  ["/סוויטת-חתן-כלה", "/articles/bridal-suite"],
  ["/השכרות-לטווח-קצר", "/articles/short-term-furnished-rental"],
  ["/corporate", "/solutions"],
  ["/השכרת-חדרים-לימי-הולדת-ומסיבות-הפתעה", "/solutions"],
  ["/author/de646f9bb8cf4378/page/2", "/articles"],
  ["/author/de646f9bb8cf4378/page/13", "/articles"],
  ["/author/1a2b3c4d/page/1", "/articles"],
] as const;

describe("דוח ה-404 של Search Console — 2026-09-18", () => {
  it.each(SEARCH_CONSOLE_404)("%s מופנה ב-301 אל %s, עם ובלי סלאש נגרר", (from, to) => {
    const encoded = toLowercaseEncodedPath(from);
    for (const path of [encoded, `${encoded}/`]) {
      const { final, hops } = follow(path);
      expect(final, path).toBe(to);
      expect(hops.map(({ status }) => status), path).toEqual([301]);
    }
  });

  /* `/elementor-1439/` נותר 404 במכוון — אסור שכלל כלשהו יתחיל לתפוס אותו */
  it("/elementor-1439 נשאר ללא הפניה", () => {
    expect(follow("/elementor-1439").hops).toEqual([]);
    expect(follow("/elementor-1439/").hops).toEqual([{ status: 308, to: "/elementor-1439" }]);
  });
});

describe("כלל ה-feed הגנרי", () => {
  /* הכלל מקלף את הסיומת, והנתיב שנותר נופל למפה הסטטית — 301 ואז 301 */
  it.each([
    ["/מאמרים/feed", "/articles"],
    ["/property/feed", "/rooms"],
    ["/category/בסביבה/feed", "/articles"],
    ["/חוקי-הבית/feed", "/house-rules"],
  ])("%s נפתר דרך המפה הסטטית אל %s", (from, to) => {
    const encoded = toLowercaseEncodedPath(from);
    for (const path of [encoded, `${encoded}/`]) {
      const { final, hops } = follow(path);
      expect(final, path).toBe(to);
      expect(hops.map(({ status }) => status), path).toEqual([301, 301]);
    }
  });

  it("אינו תופס את /feed לבדו — `:path+` דורש מקטע קודם", () => {
    expect(follow("/feed").hops).toEqual([]);
  });

  it("נפלט לפני המפה הסטטית, וה-normaliser נשאר אחרון", () => {
    const feed = emitted.findIndex(({ source }) => source === "/:path+/feed");
    const firstStatic = emitted.findIndex(
      ({ source }) => source === `${toLowercaseEncodedPath("/הצהרת-נגישות")}/`,
    );
    expect(feed).toBeGreaterThanOrEqual(0);
    expect(feed).toBeLessThan(firstStatic);
    expect(emitted.at(-1)?.source).toBe("/:path+/");
  });
});

describe("כללי התבנית", () => {
  it("שני הכללים, בסדר שבו feed קודם", () => {
    expect(LEGACY_PATTERN_REDIRECTS.map(({ from }) => from)).toEqual([
      "/:path+/feed",
      "/author/:id/page/:n",
    ]);
  });

  it.each(LEGACY_PATTERN_REDIRECTS.map(({ from }) => from))(
    "%s נפלט בשתי צורות הסלאש עם statusCode 301",
    (from) => {
      for (const source of [`${from}/`, from]) {
        const rule = emitted.find((candidate) => candidate.source === source);
        expect(rule, source).toBeDefined();
        expect(rule?.statusCode, source).toBe(301);
      }
    },
  );

  /* כללי התבנית הם ASCII בלבד: קידוד אחוזים היה בורח את הנקודתיים ושובר את הפרמטר */
  it("אינם מכילים תו שאינו ASCII", () => {
    for (const { from, to } of LEGACY_PATTERN_REDIRECTS) {
      expect(from, from).toMatch(/^[\x20-\x7E]*$/);
      expect(to, to).toMatch(/^[\x20-\x7E]*$/);
    }
  });
});

describe("הכללים אינם בולעים נתיב חי", () => {
  /* מסלולים מקוננים ונתיבי נכסים שאינם נגזרים מתיקיות ‎(site)‎ */
  const nestedLivePaths = [
    "/booking/checkout",
    "/room-images/deluxe-king/01.webp",
    "/api/leads",
    "/sitemap.xml",
    "/robots.txt",
  ];

  it.each([...servedPaths, ...nestedLivePaths])("%s אינו מופנה", (path) => {
    expect(follow(path).hops).toEqual([]);
  });
});
