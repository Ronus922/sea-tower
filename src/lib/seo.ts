import type { Metadata } from "next";
import { BUSINESS } from "./business";

/* עזרי SEO/GEO משותפים — מקור אמת יחיד ל-canonical, Open Graph ו-JSON-LD.
   ברירות המחדל הגלובליות (metadataBase, twitter, robots, siteName) יושבות
   ב-app/layout.tsx; כאן בונים מטא-דאטה ספציפי לעמוד + מבני נתונים. */

const OG_IMAGE = {
  url: "/images/hero-terrace.jpg",
  width: 1376,
  height: 768,
  alt: "מגדל הים — דירות נופש וסוויטות על חוף הכרמל בחיפה",
};

/* מטא-דאטה לעמוד: כותרת + תיאור + canonical + Open Graph מלא (כולל תמונה
   ו-siteName, כי Next מחליף את openGraph של ה-layout ולא ממזג עומק). */
export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = path === "/" ? BUSINESS.siteUrl : `${BUSINESS.siteUrl}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "he_IL",
      siteName: BUSINESS.name,
      url,
      title,
      description,
      images: [OG_IMAGE],
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
      item: `${BUSINESS.siteUrl}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

/* JSON-LD של עמוד הבית: WebSite + העסק (LodgingBusiness) — בסיס לפאנל הידע
   ולמנועי חיפוש/AI. פרטים מאומתים בלבד מ-business.ts. */
export function buildSiteJsonLd() {
  const site = BUSINESS.siteUrl;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site}/#website`,
        url: site,
        name: BUSINESS.name,
        inLanguage: "he",
        publisher: { "@id": `${site}/#business` },
      },
      {
        "@type": ["LodgingBusiness", "LocalBusiness"],
        "@id": `${site}/#business`,
        name: `${BUSINESS.name} — ${BUSINESS.nameEn}`,
        description:
          "מלון דירות בוטיק בבניין אלמוג על חוף הכרמל בחיפה — דירות וסוויטות מאובזרות ברמה מלונאית, כ-50 מטר מקו המים.",
        url: site,
        image: `${site}${OG_IMAGE.url}`,
        logo: `${site}/images/logo.png`,
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
