import type { Metadata } from "next";
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BUSINESS } from "./business";
import { absUrl, buildBreadcrumbLd, buildSiteJsonLd, buildWebPageLd, pageMeta } from "./seo";
import { ARTICLES, LISTED_ARTICLES } from "@/data/articles";
import { buildFaqJsonLd } from "@/app/(site)/faq/faq-data";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

/* שומרי-סף ל-SEO/GEO. הם רצים על מקור האמת (הנתונים והעזרים) ולא על HTML
   מרונדר, כך שהם מהירים ויציבים — ונכשלים ברגע שעמוד חדש נוסף בלי מטא-דאטה. */

const SITE = BUSINESS.siteUrl;

/* כל עמוד ציבורי הניתן לאינדוקס, עם ה-metadata שהוא מייצא בפועל */
const INDEXABLE = [
  "/",
  "/about",
  "/rooms",
  "/solutions",
  "/booking",
  "/articles",
  "/faq",
  "/house-rules",
  "/terms",
  "/contact",
];

describe("מפת האתר", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("כוללת כל עמוד ציבורי הניתן לאינדוקס", () => {
    for (const path of INDEXABLE) expect(urls).toContain(absUrl(path));
  });

  it("כוללת כל מאמר קיים, ורק אותם", () => {
    for (const a of ARTICLES) expect(urls).toContain(absUrl(`/articles/${a.slug}`));
    const articleUrls = urls.filter((u) => u.includes("/articles/"));
    expect(articleUrls).toHaveLength(ARTICLES.length);
  });

  it("לא כוללת עמודים חסומים או פנימיים", () => {
    for (const u of urls) {
      expect(u).not.toContain("/design-system");
      expect(u).not.toContain("/api/");
      expect(u).not.toContain("/booking/checkout");
    }
  });

  it("כל הכתובות מוחלטות ועל דומיין הייצור, בלי פרמטרי מעקב", () => {
    for (const u of urls) {
      expect(u.startsWith(`${SITE}/`) || u === SITE).toBe(true);
      expect(u).not.toContain("?");
      expect(u).not.toContain("#");
    }
  });

  it("אין כתובות כפולות", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("lastModified נכתב רק כשיש לו מקור אמת", () => {
    for (const e of entries) {
      if (!e.lastModified) continue;
      const slug = e.url.split("/articles/")[1];
      const article = ARTICLES.find((a) => a.slug === slug);
      expect(article?.updatedAt ?? article?.publishedAt).toBeTruthy();
    }
  });
});

describe("robots", () => {
  const r = robots();
  it("חוסם עמודים פנימיים בלבד ומפנה למפת האתר", () => {
    const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    const disallow = [rules?.disallow ?? []].flat();
    expect(disallow).toContain("/design-system");
    expect(disallow).toContain("/api/");
    expect(r.sitemap).toBe(`${SITE}/sitemap.xml`);
  });

  it("לא חוסם עמוד ציבורי, CSS, JS או תמונות", () => {
    const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    const disallow = [rules?.disallow ?? []].flat();
    for (const path of INDEXABLE) {
      expect(disallow.some((d) => d !== "/" && path.startsWith(d))).toBe(false);
    }
    for (const asset of ["/_next/static", "/images", "/videos"]) {
      expect(disallow.some((d) => asset.startsWith(d))).toBe(false);
    }
  });
});

describe("pageMeta", () => {
  it("מייצר canonical מוחלט על דומיין הייצור", () => {
    const m = pageMeta({ title: "כ", description: "ת", path: "/about" });
    expect(m.alternates?.canonical).toBe(`${SITE}/about`);
    expect(pageMeta({ title: "כ", description: "ת", path: "/" }).alternates?.canonical).toBe(SITE);
  });

  it("מייצר Open Graph ו-Twitter תואמים לעמוד (ולא של עמוד הבית)", () => {
    const m = pageMeta({
      title: "כותרת העמוד",
      description: "תיאור העמוד",
      path: "/rooms",
      image: { url: "/images/suite-royal.jpg", alt: "סוויטה" },
    });
    expect(m.openGraph?.title).toBe("כותרת העמוד");
    expect(m.twitter?.title).toBe("כותרת העמוד");
    expect(JSON.stringify(m.twitter?.images)).toContain(`${SITE}/images/suite-royal.jpg`);
  });

  it("הופך ל-og:type=article רק כשיש נתוני מאמר", () => {
    /* ‎OpenGraph‎ הוא איחוד טיפוסים ו-‎type‎ קיים רק בחלק מהענפים — הקריאה
       דרך רשומה גנרית היא הדרך לבדוק את הערך שנכתב בפועל */
    const ogType = (m: Metadata) => (m.openGraph as Record<string, unknown>).type;
    expect(ogType(pageMeta({ title: "כ", description: "ת", path: "/x" }))).toBe("website");
    expect(ogType(pageMeta({ title: "כ", description: "ת", path: "/x", article: {} }))).toBe(
      "article",
    );
  });
});

describe("מאמרים", () => {
  it("לכל מאמר יש כותרת SEO ותיאור ייחודיים", () => {
    const titles = ARTICLES.map((a) => a.seoTitle);
    const descs = ARTICLES.map((a) => a.seoDescription);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descs).size).toBe(descs.length);
    for (const a of ARTICLES) {
      expect(a.seoTitle.length).toBeGreaterThan(10);
      expect(a.seoDescription.length).toBeGreaterThan(50);
    }
  });

  it("כל תמונת מאמר קיימת בפועל תחת public/ ואינה משותפת לשני מאמרים", () => {
    const images = ARTICLES.map((a) => a.image);
    expect(new Set(images).size).toBe(images.length);
    for (const a of ARTICLES) {
      expect(() => readFileSync(join(process.cwd(), "public", a.image))).not.toThrow();
      expect(a.imageAlt.trim().length).toBeGreaterThan(3);
    }
  });

  it("סלאגים ייחודיים וידידותיים לכתובת", () => {
    const slugs = ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it("תאריכים, כשהם קיימים, תקינים ולא עתידיים לאין שיעור", () => {
    for (const a of ARTICLES) {
      for (const d of [a.publishedAt, a.updatedAt].filter(Boolean) as string[]) {
        expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Number.isNaN(new Date(d).getTime())).toBe(false);
      }
    }
  });

  it("עמוד הבית מקשר למאמרים אמיתיים מהקטלוג", () => {
    expect(LISTED_ARTICLES.length).toBeGreaterThanOrEqual(3);
  });
});

describe("JSON-LD", () => {
  const parse = (o: unknown) => JSON.parse(JSON.stringify(o));

  it("גרף האתר תקין, עם ישות עסק אחת ומזהים יציבים", () => {
    const ld = parse(buildSiteJsonLd());
    expect(ld["@context"]).toBe("https://schema.org");
    const ids = ld["@graph"].map((n: { "@id": string }) => n["@id"]);
    expect(ids).toContain(`${SITE}/#website`);
    expect(ids).toContain(`${SITE}/#business`);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("אין דירוג או ביקורות מומצאים בשום מבנה נתונים", () => {
    const blobs = [
      buildSiteJsonLd(),
      buildFaqJsonLd(),
      buildWebPageLd({ name: "n", description: "d", path: "/contact" }),
      buildBreadcrumbLd([{ name: "ראשי", path: "/" }]),
    ].map((b) => JSON.stringify(b));
    for (const b of blobs) {
      for (const banned of ["aggregateRating", "ratingValue", "reviewCount", '"Review"']) {
        expect(b).not.toContain(banned);
      }
    }
  });

  it("כל כתובת בפירורי הלחם מוחלטת ומדורגת", () => {
    const ld = parse(
      buildBreadcrumbLd([
        { name: "ראשי", path: "/" },
        { name: "מאמרים", path: "/articles" },
      ]),
    );
    expect(ld.itemListElement.map((i: { position: number }) => i.position)).toEqual([1, 2]);
    for (const item of ld.itemListElement) expect(item.item.startsWith("https://")).toBe(true);
  });

  it("עמוד תוכן מקושר לאתר ולעסק ואינו מגדיר ישות מתחרה", () => {
    const ld = parse(
      buildWebPageLd({ type: "ContactPage", name: "צור קשר", description: "ת", path: "/contact" }),
    );
    expect(ld.isPartOf["@id"]).toBe(`${SITE}/#website`);
    expect(ld.about["@id"]).toBe(`${SITE}/#business`);
    expect(ld["@type"]).toBe("ContactPage");
  });

  it("FAQPage — לכל שאלה נראית יש תשובה לא ריקה", () => {
    const ld = parse(buildFaqJsonLd());
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity.length).toBeGreaterThan(10);
    for (const q of ld.mainEntity) {
      expect(q.name.trim().length).toBeGreaterThan(3);
      expect(q.acceptedAnswer.text.trim().length).toBeGreaterThan(20);
      /* שאריות Markdown/עיטור לא אמורות לדלוף לטקסט המובנה */
      expect(q.acceptedAnswer.text).not.toContain("**");
      expect(q.acceptedAnswer.text).not.toContain("›");
    }
  });
});

describe("מקור אמת יחיד לפרטי העסק", () => {
  it("אין טלפון/אימייל/כתובת מקודדים קשיח בעמודים ובקומפוננטות", () => {
    const banned = [/office@sea-tower\.co\.il/, /04-6891689/, /055-9994880/];
    const files = [
      "src/app/(site)/page.tsx",
      "src/app/(site)/contact/page.tsx",
      "src/app/(site)/faq/page.tsx",
      "src/app/(site)/house-rules/page.tsx",
      "src/components/site/Footer.tsx",
      "src/components/site/Header.tsx",
    ];
    for (const f of files) {
      const src = readFileSync(join(process.cwd(), f), "utf8")
        /* הערות מסבירות רשאיות לצטט את הערך הישן */
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "");
      for (const re of banned) expect(src, `${f} מכיל ערך מקודד קשיח`).not.toMatch(re);
    }
  });

  it("כתובות ה-tel הן E.164 תקינות", () => {
    for (const phone of Object.values(BUSINESS.phones)) {
      expect(phone.tel).toMatch(/^tel:\+\d{9,15}$/);
    }
  });
});

describe("אין תוכן זמני או מומצא בייצור", () => {
  it("אין placeholder גלוי בעמודים הציבוריים", () => {
    const files = [
      "src/app/(site)/page.tsx",
      "src/app/(site)/about/page.tsx",
      "src/app/(site)/rooms/page.tsx",
      "src/app/(site)/solutions/page.tsx",
    ];
    for (const f of files) {
      const src = readFileSync(join(process.cwd(), f), "utf8");
      for (const banned of ["lorem", "Lorem", "טקסט לדוגמה", "placeholder עד שיסופק"]) {
        expect(src, `${f}`).not.toContain(banned);
      }
    }
  });

  it("MotionEngine אינו חוטף טפסים ואינו מזייף הצלחת שליחה", () => {
    const src = readFileSync(join(process.cwd(), "src/components/site/MotionEngine.tsx"), "utf8");
    expect(src).not.toContain("setupForm");
    expect(src).not.toContain("נשלח, נחזור אליכם");
    expect(src).not.toContain("נרשמת");
  });
});
