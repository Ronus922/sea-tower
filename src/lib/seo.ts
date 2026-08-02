import type { Metadata } from "next";
import { BUSINESS } from "./business";

/* עזרי SEO/GEO משותפים — מקור אמת יחיד ל-canonical, Open Graph, Twitter ו-JSON-LD.
   ברירות המחדל הגלובליות (metadataBase, robots) יושבות ב-app/layout.tsx;
   כאן בונים מטא-דאטה ספציפי לעמוד + מבני נתונים.

   כלל זהות: לכל האתר ישות עסקית אחת — ‎#business‎ — ואתר אחד — ‎#website‎.
   עמודים שמזכירים את העסק מפנים אליו ב-@id ולא מגדירים ישות מתחרה. */

export const SITE = BUSINESS.siteUrl;

/* מזהים יציבים לגרף הישויות — אסור לשנות אחרי שנסרקו */
export const BUSINESS_ID = `${SITE}/#business`;
export const WEBSITE_ID = `${SITE}/#website`;

/* הפניה לישות העסק במקום הגדרה חוזרת (מונע ישויות ארגון סותרות) */
export const businessRef = { "@id": BUSINESS_ID } as const;

export const OG_IMAGE = {
  url: "/images/hero-terrace.jpg",
  width: 1376,
  height: 768,
  alt: "מגדל הים — דירות נופש וסוויטות על חוף הכרמל בחיפה",
};

export function absUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return path === "/" ? SITE : `${SITE}${path}`;
}

type PageImage = { url: string; width?: number; height?: number; alt: string };

/* מטא-דאטה לעמוד: כותרת + תיאור + canonical + Open Graph + Twitter.
   Next מחליף את openGraph/twitter של ה-layout ולא ממזג לעומק, ולכן כל עמוד
   חייב לקבל את שני הבלוקים במלואם — אחרת כרטיס Twitter יישאר של עמוד הבית. */
export function pageMeta({
  title,
  description,
  path,
  image,
  robots,
  article,
}: {
  title: string;
  description: string;
  path: string;
  image?: PageImage;
  robots?: Metadata["robots"];
  /* נוכחותו הופכת את og:type ל-article ומוסיפה את שדות המאמר */
  article?: { publishedTime?: string; modifiedTime?: string; authors?: string[] };
}): Metadata {
  const url = absUrl(path);
  const img = image ?? OG_IMAGE;
  const images = [{ ...img, url: absUrl(img.url) }];
  return {
    title,
    description,
    alternates: { canonical: url },
    ...(robots ? { robots } : {}),
    openGraph: article
      ? {
          type: "article",
          locale: "he_IL",
          siteName: BUSINESS.name,
          url,
          title,
          description,
          images,
          ...article,
        }
      : {
          type: "website",
          locale: "he_IL",
          siteName: BUSINESS.name,
          url,
          title,
          description,
          images,
        },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absUrl(img.url)],
    },
  };
}

/* פירורי לחם ל-JSON-LD — תואם לפירורי הלחם הנראים בעמוד */
export function buildBreadcrumbLd(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absUrl(item.path),
    })),
  };
}

/* עמוד תוכן רגיל (About/Contact/Terms/HouseRules/Articles) — מקושר לאתר
   ולעסק דרך @id, כך שכל העמודים נקראים כישות אחת ולא כאוסף אתרים */
export function buildWebPageLd({
  type = "WebPage",
  name,
  description,
  path,
}: {
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
  name: string;
  description: string;
  path: string;
}) {
  const url = absUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "he",
    isPartOf: { "@id": WEBSITE_ID },
    about: businessRef,
  };
}

/* JSON-LD של עמוד הבית: WebSite + העסק (LodgingBusiness) — בסיס לפאנל הידע
   ולמנועי חיפוש/AI. פרטים מאומתים בלבד מ-business.ts.
   אין SearchAction: לאתר אין חיפוש ציבורי אמיתי.
   אין aggregateRating: אין מקור ביקורות מאומת שניתן להצביע עליו. */
export function buildSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE,
        name: BUSINESS.name,
        alternateName: BUSINESS.nameEn,
        inLanguage: "he",
        publisher: businessRef,
      },
      {
        "@type": ["LodgingBusiness", "LocalBusiness"],
        "@id": BUSINESS_ID,
        name: `${BUSINESS.name} — ${BUSINESS.nameEn}`,
        description:
          "מלון דירות בוטיק בבניין אלמוג על חוף הכרמל בחיפה — דירות וסוויטות מאובזרות ברמה מלונאית, כ-50 מטר מקו המים.",
        url: SITE,
        image: absUrl(OG_IMAGE.url),
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE}/#logo`,
          url: absUrl("/images/logo.png"),
        },
        telephone: BUSINESS.phones.office.tel.replace("tel:", ""),
        email: BUSINESS.email,
        priceRange: "₪₪",
        address: {
          "@type": "PostalAddress",
          streetAddress: BUSINESS.address.street,
          addressLocality: BUSINESS.address.city,
          addressCountry: "IL",
        },
        areaServed: "חיפה",
      },
    ],
  };
}
