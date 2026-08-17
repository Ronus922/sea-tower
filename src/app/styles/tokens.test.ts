import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/* שער ניגודיות על ה-gradient של כפתור ה-CTA.

   הכפתור הראשי נושא טקסט לבן 16px/700 — מתחת ל-18.66px bold, ולכן הסף
   של WCAG 2.1 AA הוא 4.5:1 ולא 3:1. הערך בפועל הוא 4.57:1: מרווח של
   0.07 בלבד, וכל כוונון גוון בגרדיאנט מפיל אותו בלי שאיש ישים לב.

   הבדיקה קוראת את ה-token מהקובץ עצמו — לא עותק — ובודקת את שתי נקודות
   הקצה. הכהה מביניהן היא הרלוונטית לניגודיות, אבל שתיהן חייבות לעבור
   כי הטקסט פרוס על כל רוחב הכפתור. */

const TOKENS = readFileSync(
  fileURLToPath(new URL("./tokens.css", import.meta.url)),
  "utf8"
);

const MIN_RATIO = 4.5;

/* יחס הניגודיות של WCAG 2.1 — ‎(L1+0.05)/(L2+0.05)‎ על בהירות יחסית */
function relativeLuminance(hex: string): number {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastWithWhite(hex: string): number {
  return 1.05 / (relativeLuminance(hex) + 0.05);
}

describe("--gradient-cta", () => {
  const declaration = TOKENS.match(/--gradient-cta:\s*([^;]+);/)?.[1];

  it("מוגדר ב-tokens.css", () => {
    expect(declaration).toBeDefined();
  });

  const stops = declaration?.match(/#[0-9a-fA-F]{6}/g) ?? [];

  it("בנוי משתי נקודות קצה בכתיב hex", () => {
    expect(stops).toHaveLength(2);
  });

  it.each(stops)("נקודת הקצה %s נותנת ≥ 4.5:1 מול טקסט לבן", (stop) => {
    const ratio = contrastWithWhite(stop);
    expect(
      ratio,
      `${stop} נותן ${ratio.toFixed(2)}:1 — מתחת לסף ${MIN_RATIO}:1 של WCAG AA לטקסט 16px/700`
    ).toBeGreaterThanOrEqual(MIN_RATIO);
  });
});
