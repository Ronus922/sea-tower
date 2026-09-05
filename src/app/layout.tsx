import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { openSans } from "@/lib/fonts";
import { BUSINESS } from "@/lib/business";
import { Analytics } from "@/components/site/Analytics";
import "./globals.css";

/* Open Sans = הגופן הראשי של כל האתר (‎--font-sans‎ ב-tokens.css מצביע עליו).
   Frank Ruhl (‎--font-serif‎) נטען בעמוד design-system בלבד — קודם לכן הוא
   נטען כאן ו-61.6KB שלו עברו preload בכל עמוד ציבורי, בתחרות ישירה עם
   ה-woff2 העברי של Open Sans שקובע את מהירות ה-swap של הטקסט. */
const TITLE = "מגדל הים — דירות בוטיק וסוויטות על הים בחיפה";
const DESCRIPTION =
  "מלון דירות בוטיק בבניין אלמוג על חוף הכרמל בחיפה — דירות וסוויטות מאובזרות ברמה מלונאית, 50 מטר מקו המים. לנופש, לעסקים, לרילוקיישן ולכל תקופה.";

/* צבע ערכת הנושא לדפדפן — תואם ל-theme_color שב-manifest */
export const viewport: Viewport = {
  themeColor: "#0e2540",
};

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.siteUrl),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: BUSINESS.name,
  /* PWA — חוויית standalone ב-iOS לאחר "הוספה למסך הבית" */
  appleWebApp: {
    capable: true,
    title: BUSINESS.name,
    statusBarStyle: "default",
  },
  /* canonical של הבית יושב ב-(site)/page.tsx ולא כאן: עמוד ה-404 מרונדר
     בתבנית השורש, וקנוניקל גלובלי היה מוצמד גם אליו (SEO-AUDIT A5) */
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: BUSINESS.name,
    url: BUSINESS.siteUrl,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/images/hero-terrace.jpg",
        width: 1376,
        height: 768,
        alt: "מגדל הים — דירות נופש וסוויטות על חוף הכרמל בחיפה",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/hero-terrace.jpg"],
  },
  /* robots יושב ב-(site)/layout ולא כאן: not-found.tsx מרונדר בתבנית השורש,
     וכל הנחיית index גלובלית הייתה נכתבת לצידה של ה-noindex של עמוד ה-404
     ויוצרת שני תגי robots סותרים באותו עמוד. */
  /* אימות בעלות — התג נכתב רק כשהערך קיים ב-env; אין ערכי דמה */
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={openSans.variable}>
      <body className="antialiased">
        <Analytics />
        {children}
        <script
          id="nagishli-config"
          dangerouslySetInnerHTML={{
            __html: 'window.nagishli_config = { language: "he", color: "turquoise" };',
          }}
        />
        <Script
          src="/nagishli/nagishli_beta.js?v=3.0b"
          strategy="lazyOnload"
          charSet="utf-8"
        />
      </body>
    </html>
  );
}
