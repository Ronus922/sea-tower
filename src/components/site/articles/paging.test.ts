import { describe, expect, it } from "vitest";
import { PAGE_SIZE, isOnPage, totalPagesFor } from "./paging";
import { ARTICLES, CATEGORY_LABEL, LISTED_ARTICLES, type ArticleCategory } from "@/data/articles";

/* רגרסיה לחוקי "עד 16 בתצוגה" (2026-08-15): גודל עמוד, אי-שכפול,
   אי-פברוק, ושלמות הטקסונומיה — הכול מול הנתונים האמיתיים. */

const CATEGORIES = Object.keys(CATEGORY_LABEL) as ArticleCategory[];

describe("עימוד המאמרים — 16 לתצוגה", () => {
  it("גודל עמוד הוא בדיוק 16", () => {
    expect(PAGE_SIZE).toBe(16);
  });

  it("כל תצוגה מציגה עד 16, ומספר אמיתי כשיש פחות — בלי שכפול ובלי פברוק", () => {
    const views: Array<[string, typeof LISTED_ARTICLES]> = [
      ["all", LISTED_ARTICLES],
      ...CATEGORIES.map(
        (c): [string, typeof LISTED_ARTICLES] => [c, LISTED_ARTICLES.filter((a) => a.category === c)]
      ),
    ];
    for (const [name, filtered] of views) {
      const shown = filtered.filter((_, i) => isOnPage(i, 1));
      // עד 16 בעמוד; כשיש פחות מ-16 תואמים — מוצג המספר האמיתי במלואו
      expect(shown.length, name).toBe(Math.min(filtered.length, PAGE_SIZE));
      // אין כרטיס כפול בתוך תצוגה
      expect(new Set(shown.map((a) => a.slug)).size, name).toBe(shown.length);
      // אין מאמר זר בקטגוריה (פברוק שיוך כדי להגיע ל-16)
      if (name !== "all") {
        expect(shown.every((a) => a.category === name), name).toBe(true);
      }
      // כל העמודים יחד = בדיוק הרשימה המסוננת, בלי חזרות בין עמודים
      const pages = totalPagesFor(filtered.length);
      const union = new Set<string>();
      for (let p = 1; p <= pages; p++) {
        filtered.forEach((a, i) => {
          if (isOnPage(i, p)) {
            expect(union.has(a.slug), `${name} p${p} dup`).toBe(false);
            union.add(a.slug);
          }
        });
      }
      expect(union.size, name).toBe(filtered.length);
    }
  });

  it("מתמטיקת עמודים: 22→2, 16→1, 6→1, 0→1", () => {
    expect(totalPagesFor(22)).toBe(2);
    expect(totalPagesFor(16)).toBe(1);
    expect(totalPagesFor(6)).toBe(1);
    expect(totalPagesFor(0)).toBe(1);
  });
});

describe("טקסונומיית המאמרים", () => {
  it("לכל קטגוריה בשימוש יש תווית, ולכל תווית יש לפחות מאמר אחד", () => {
    const used = new Set(ARTICLES.map((a) => a.category));
    for (const c of used) expect(CATEGORY_LABEL[c], `label for ${c}`).toBeTruthy();
    for (const c of CATEGORIES)
      expect(LISTED_ARTICLES.some((a) => a.category === c), `empty category ${c}`).toBe(true);
  });

  it("קורפוס המאמרים לא נשחק: 23 בסך הכול, 22 מוצגים, slugs ייחודיים", () => {
    expect(ARTICLES.length).toBe(23);
    expect(LISTED_ARTICLES.length).toBe(22);
    expect(new Set(ARTICLES.map((a) => a.slug)).size).toBe(23);
  });
});
