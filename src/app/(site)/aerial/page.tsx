import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { AerialScroller } from "@/components/site/AerialScroller";
import { pageMeta } from "@/lib/seo";

/* ‏/aerial — עמוד scrollytelling: צילום הרחפן של בניין אלמוג "מפורק" לגלילה.
   הכותרת של העמוד היא הסרטון עצמו (פרק הפתיחה יושב על הפריים הראשון).

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

export default function Aerial() {
  return (
    <>
      {/* שער חשיפות: רץ לפני ה-hydration כך שתוכן מסומן לא מהבהב לפני האנימציה */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('stm-js')",
        }}
      />

      {/* הסרטון הוא הכותרת — במה דביקה שמתקדמת עם הגלילה */}
      <AerialScroller />

      {/* סגירה בשפת הבית; הריפוד התחתון כולל את גובה גל הפוטר (70/120px) */}
      <section className="relative bg-cloud pt-20 pb-[126px] md:pt-24 md:pb-[204px]">
        {/* הגל בראש המקטע ממולא בצבע המקטע הקודם (המסלול הנייבי) — כמו בבית */}
        <WaveSeparator position="top" fill="var(--color-navy-950)" />
        <Container className="flex flex-col items-center gap-8 text-center">
          <SectionHeading
            center
            kicker="מהמסך אל החוף"
            title="רוצים לראות את זה מקרוב?"
            lead="הדירות והסוויטות של מגדל הים מחכות בבניין שראיתם עכשיו — 50 מ׳ מקו המים."
          />
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Button href="/booking">בדקו זמינות</Button>
            <Button href="/rooms" variant="outline">
              לכל הדירות שלנו
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
