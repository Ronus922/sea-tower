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

/**
 * כללי התבנית אינם חלק מהמפה הסטטית ולכן נבדקים בנפרד. כתובות ה-feed נפתרות בשני
 * hops במכוון: הכלל הגנרי מקלף את הסיומת, והנתיב שנותר נופל למפה הסטטית.
 */
describe.skipIf(!baseUrl)("כללי תבנית מול שרת חי", () => {
  /** עוקב אחרי שרשרת ההפניות עד 200, ומחזיר את הנתיב הסופי ואת מספר ה-hops */
  const chase = async (path: string, label: string) => {
    let current = new URL(`${baseUrl}${path}`);
    let hops = 0;
    for (;;) {
      const response = await fetch(current, { redirect: "manual" });
      if (response.status === 200) break;
      expect(response.status, `${label}: ${current.pathname}`).toBe(301);
      current = new URL(response.headers.get("location") ?? "", baseUrl);
      hops += 1;
      expect(hops, `${label}: שרשרת ארוכה מדי`).toBeLessThanOrEqual(4);
    }
    return { pathname: decodeURIComponent(current.pathname), hops };
  };

  it.each([
    ["/author/de646f9bb8cf4378/page/2", "/articles", 1],
    ["/author/1a2b3c4d/page/7", "/articles", 1],
    ["/מאמרים/feed", "/articles", 2],
    ["/property/feed", "/rooms", 2],
    ["/חוקי-הבית/feed", "/house-rules", 2],
    ["/category/בסביבה/feed", "/articles", 2],
  ] as const)("%s מגיע אל %s בכל צורות הקידוד", async (from, to, expectedHops) => {
    for (const { label, path } of requestForms(from)) {
      const { pathname, hops } = await chase(path, label);
      expect(pathname, `${label}: ${path}`).toBe(to);
      expect(hops, `${label}: ${path}`).toBe(expectedHops);
    }
  });

  /* `:path+` דורש מקטע לפני `/feed`, כך שהשורש עצמו אינו נתפס */
  it("/feed לבדו אינו מופנה", async () => {
    const response = await fetch(`${baseUrl}/feed`, { redirect: "manual" });
    expect(response.status).toBe(404);
  });

  /* נשאר 404 במכוון — ההפניה היחידה המותרת היא נורמליזציית הסלאש */
  it.each(["/elementor-1439", "/elementor-1439/"])("%s נשאר 404", async (path) => {
    let response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
    if (response.status === 308) {
      response = await fetch(new URL(response.headers.get("location") ?? "", baseUrl), {
        redirect: "manual",
      });
    }
    expect(response.status).toBe(404);
  });

  /* המסלולים החיים חייבים להמשיך להחזיר 200 — הכלל הגנרי אינו בולע אותם */
  it.each(["/", "/articles", "/rooms", "/solutions", "/house-rules", "/faq", "/booking"])(
    "%s נשאר 200",
    async (path) => {
      const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
      expect(response.status).toBe(200);
    },
  );
});
