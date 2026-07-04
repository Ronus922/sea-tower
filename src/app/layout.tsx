import type { Metadata } from "next";
import { Frank_Ruhl_Libre } from "next/font/google";
import { openSans } from "@/lib/fonts";
import { BUSINESS } from "@/lib/business";
import "./globals.css";

/* Open Sans = הגופן הראשי של כל האתר (‎--font-sans‎ ב-tokens.css מצביע עליו).
   Frank Ruhl נשמר כ-‎--font-serif‎ עבור עמוד ה-design-system הפנימי בלבד. */
const frank = Frank_Ruhl_Libre({
  variable: "--font-frank",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const TITLE = "מגדל הים — דירות בוטיק וסוויטות על הים בחיפה";
const DESCRIPTION =
  "מלון דירות בוטיק בבניין אלמוג על חוף הכרמל בחיפה — דירות וסוויטות מאובזרות ברמה מלונאית, 50 מטר מקו המים. לנופש, לעסקים, לרילוקיישן ולכל תקופה.";

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.siteUrl),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: BUSINESS.name,
  alternates: { canonical: "/" },
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${openSans.variable} ${frank.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
