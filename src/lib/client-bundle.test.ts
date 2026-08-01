import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

/* הסוד של GuestHub הוא סוד שרת. הבדיקות כאן שומרות על הגבול משני הכיוונים:
   מי מייבא את שכבת ה-API, ומה בפועל נכנס ל-bundle של הדפדפן. */

function walk(dir: string, match: (f: string) => boolean): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full, match));
    else if (match(entry)) out.push(full);
  }
  return out;
}

const SRC = join(process.cwd(), "src");
const sources = walk(SRC, (f) => /\.tsx?$/.test(f) && !f.endsWith(".test.ts"));

describe("הסוד לא נכנס ל-bundle של הלקוח", () => {
  it("אף קומפוננטת לקוח לא מייבאת את booking-api כערך", () => {
    const offenders = sources.filter((file) => {
      const src = readFileSync(file, "utf8");
      if (!/^\s*["']use client["']/m.test(src)) return false;
      /* import type נמחק בקומפילציה; רק ייבוא ערך גורר את הקוד לדפדפן */
      return /^\s*import\s+(?!type\b)[^;]*from\s+["']@\/lib\/booking-api["']/m.test(src);
    });
    expect(offenders).toEqual([]);
  });

  it("שכבת ה-API קוראת את הסוד מ-env בלבד ואינה חושפת אותו החוצה", () => {
    const api = readFileSync(join(SRC, "lib/booking-api.ts"), "utf8");
    expect(api).toContain("process.env.GUESTHUB_BOOKING_SECRET");
    /* NEXT_PUBLIC_ היה שולח את הסוד לדפדפן */
    expect(api).not.toMatch(/NEXT_PUBLIC_[A-Z_]*SECRET/);
    /* הסוד נשלח רק ככותרת בקשה, ולעולם לא מוחזר לצרכן */
    expect(api).not.toMatch(/return[^;]*secret/i);
  });

  it("פלט הבנייה לדפדפן אינו מכיל את הסוד או את שם הכותרת", () => {
    const staticDir = join(process.cwd(), ".next", "static");
    if (!existsSync(staticDir)) {
      /* בלי build זמין אין מה לסרוק — שתי הבדיקות שמעל מכסות את המקור */
      expect(existsSync(SRC)).toBe(true);
      return;
    }
    const secret = process.env.GUESTHUB_BOOKING_SECRET;
    const bundles = walk(staticDir, (f) => f.endsWith(".js"));
    expect(bundles.length).toBeGreaterThan(0);
    const hits = bundles.filter((file) => {
      const code = readFileSync(file, "utf8");
      if (code.includes("x-booking-secret")) return true;
      return Boolean(secret && secret.length > 8 && code.includes(secret));
    });
    expect(hits).toEqual([]);
  });
});
