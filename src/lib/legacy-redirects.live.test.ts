import { describe, expect, it } from "vitest";

import { LEGACY_REDIRECTS, toLowercaseEncodedPath } from "./legacy-redirects";

/**
 * אימות ריצה של ההפניות מול שרת חי. רץ רק כאשר `REDIRECT_BASE_URL` מוגדר —
 * ‎`REDIRECT_BASE_URL=http://127.0.0.1:3010 npm run test:redirects`‎ אחרי
 * ‎`next build && next start`‎. בלי המשתנה הסוויטה מדולגת, כך ש-`npm test` הרגיל
 * נשאר מהיר ואינו תלוי בשרת.
 */
const baseUrl = process.env.REDIRECT_BASE_URL;

/** ארבע הצורות שבהן הכתובת הישנה מגיעה בפועל: מגוגל, מדפדפן, ומקישור ישן */
const requestForms = (from: string): { label: string; path: string }[] => {
  const lower = toLowercaseEncodedPath(from);
  const upper = encodeURI(from);
  return [
    { label: "encoded-lower + slash", path: `${lower}/` },
    { label: "encoded-lower", path: lower },
    { label: "encoded-upper + slash", path: `${upper}/` },
    { label: "unicode + slash", path: `${from}/` },
  ];
};

describe.skipIf(!baseUrl)("הפניות 301 מול שרת חי", () => {
  const targets = [...new Set(LEGACY_REDIRECTS.map(({ to }) => to))];

  it.each(targets)("היעד %s מחזיר 200", async (to) => {
    const response = await fetch(`${baseUrl}${to}`, { redirect: "manual" });
    expect(response.status).toBe(200);
  });

  it.each(LEGACY_REDIRECTS.map(({ from, to }) => [from, to] as const))(
    "%s מפנה ב-301 אל %s בכל צורות הקידוד",
    async (from, to) => {
      for (const { label, path } of requestForms(from)) {
        const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
        expect(response.status, `${label}: ${path}`).toBe(301);
        expect(new URL(response.headers.get("location") ?? "", baseUrl).pathname, label).toBe(to);
      }
    },
  );

  /* hop אחד: היעד של ההפניה חייב להחזיר 200 ישירות. אם הוא מחזיר 301/308 נוסף,
     נוצרה שרשרת — וזה נכשל כאן */
  it.each(LEGACY_REDIRECTS.map(({ from }) => from))("%s נפתר ב-hop אחד בלבד", async (from) => {
    const [{ path }] = requestForms(from);
    const first = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
    const location = new URL(first.headers.get("location") ?? "", baseUrl);
    const second = await fetch(location, { redirect: "manual" });
    expect(second.status, `${path} -> ${location.pathname}`).toBe(200);
  });

  /* שתי הכתובות שההפניה הדומיינית מכסה ואין להן כלל ייעודי — חייבות להישאר תקינות */
  it.each(["/?jet-theme-core=footer", "/?jet-theme-core=header", "/faq/", "/"])(
    "%s נשאר תקין ללא כלל ייעודי",
    async (path) => {
      const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
      expect([200, 308]).toContain(response.status);
      if (response.status === 308) {
        const location = new URL(response.headers.get("location") ?? "", baseUrl);
        expect((await fetch(location, { redirect: "manual" })).status).toBe(200);
      }
    },
  );
});
