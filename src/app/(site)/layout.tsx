import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { InstallPrompt } from "@/components/site/InstallPrompt";
import { WhatsAppWidget } from "@/components/site/WhatsAppWidget";

/* הנחיות האינדוקס של האתר הציבורי. הן יושבות כאן ולא בתבנית השורש כדי שעמוד
   ה-404 (המרונדר בתבנית השורש) לא יקבל "index, follow" לצד ה-noindex שלו.
   עמוד בודד רשאי לדרוס — /booking/checkout מגדיר noindex משלו. */
export const metadata: Metadata = {
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

/* התבנית הקבועה של האתר הציבורי: Header + Footer מרונדרים רק כאן.
   עמודי page.tsx מספקים תוכן בלבד — לעולם לא Header/Footer משלהם */

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* דילוג לתוכן — מוסתר עד קבלת פוקוס מהמקלדת. בלעדיו כל ניווט מקלדת
          עובר מחדש בכל עמוד דרך תפריט הניווט וכפתור ההזמנה */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:right-3 focus:z-[100] focus:rounded-btn focus:bg-white focus:px-4 focus:py-2.5 focus:text-[15px] focus:font-bold focus:text-navy-800 focus:shadow-e3 focus:outline-2 focus:outline-offset-2 focus:outline-sea-500"
      >
        דילוג לתוכן הראשי
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      {/* הצעת התקנה כ-PWA — בקר גלובלי יחיד, מוצג רק במובייל לפי המדיניות שבקומפוננטה */}
      <InstallPrompt />
      {/* כפתור וואטסאפ צף — כאן ולא בתבנית השורש, כדי שעמוד 404 ו-design-system
          הפנימי לא יקבלו אותו */}
      <WhatsAppWidget />
    </>
  );
}
