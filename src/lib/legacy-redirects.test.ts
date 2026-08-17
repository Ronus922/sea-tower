import { readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { LEGACY_REDIRECTS, toLowercaseEncodedPath } from "./legacy-redirects";
import { ARTICLES } from "@/data/articles";

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
  it("מכילה את 79 הכללים של האינוונטר", () => {
    expect(LEGACY_REDIRECTS).toHaveLength(79);
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
