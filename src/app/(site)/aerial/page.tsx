import type { Metadata } from "next";
import { preload } from "react-dom";
import { MotionEngine } from "@/components/site/MotionEngine";
import { AerialScroller } from "@/components/site/AerialScroller";
import { HomeSections } from "@/components/site/home/HomeSections";
import { pageMeta } from "@/lib/seo";

/* ‏/aerial — טיוטת "דף בית עם פתיח scrollytelling": רצועת וידאו בגובה 500px
   שמתנגנת עם הגלילה (סקראב), ומתחת למסלול — כל מקטעי עמוד הבית
   (HomeSections), להערכת הבעלים האם זה יכול לשמש כדף הבית.

   טיוטה שאינה מקושרת משום מקום (הכרעת בעלים, 2026-08-15): לא בניווט, לא
   בפוטר ולא ב-sitemap (רשימת PATHS ידנית), ו-noindex עד אישור פרסום —
   אז מסירים את בלוק ה-robots ומוסיפים את הראוט ל-sitemap.ts. */

export const metadata: Metadata = {
  ...pageMeta({
    title: "מגדל הים מהאוויר — טיסה מעל חוף הכרמל | מגדל הים",
    description:
      "צילום אוויר של בניין אלמוג וחוף הכרמל בחיפה — טיסה שנשלטת בגלילה, מקו המים ועד הכניסה למגדל הים.",
    path: "/aerial",
    image: { url: "/videos/aerial-poster.jpg", alt: "מבט אווירי על בניין אלמוג וחוף הכרמל בחיפה" },
  }),
  robots: { index: false, follow: false },
};

/* קטלוג החדרים (בתוך HomeSections) נמשך מ-GuestHub ומתרענן כל 5 דקות (ISR) */
export const revalidate = 300;

export default function Aerial() {
  /* הפוסטר של רצועת הווידאו הוא ה-LCP של העמוד — כמו בעמוד הבית */
  preload("/videos/aerial-poster.jpg", { as: "image", fetchPriority: "high" });

  return (
    <>
      {/* שער חשיפות: רץ לפני ה-hydration כך שתוכן מסומן לא מהבהב לפני האנימציה */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('stm-js')",
        }}
      />
      <MotionEngine />

      {/* הסרטון הוא הכותרת — רצועת סקראב דביקה, ואחריה גל המעבר אל הבית */}
      <AerialScroller />

      {/* כל מקטעי עמוד הבית — אותה קומפוננטה בדיוק שמרונדרת ב-/ */}
      <HomeSections />
    </>
  );
}
