import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { MotionEngine } from "@/components/site/MotionEngine";
import { RoomCard } from "@/components/site/RoomCard";
import { fetchWebsiteRooms } from "@/lib/booking-api";
import { pageMeta, buildBreadcrumbLd } from "@/lib/seo";

/* קטלוג הדירות — כל הדירות שסומנו "הצג באתר" ב-GuestHub, עם אותם כרטיסים
   בדיוק של הקרוסלה בעמוד הבית (RoomCard). לא מנוע הזמנות: כאן מעיינים,
   ובודקים זמינות ומחיר ב-/booking */

export const revalidate = 300;

export const metadata: Metadata = pageMeta({
  title: "הדירות שלנו — מגדל הים | סוויטות ודירות נופש מול הים בחיפה",
  description:
    "כל הדירות והסוויטות של מגדל הים בחיפה — סטודיו זוגי, דירות חדר שינה וסלון וסוויטות משפחתיות מול הים, 50 מטר מקו המים. גודל, תפוסה ותמונות לכל דירה.",
  path: "/rooms",
});

const CARD_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

export default async function Rooms() {
  const rooms = (await fetchWebsiteRooms()) ?? [];

  return (
    <>
      {/* שער חשיפות: רץ לפני ה-hydration כך שתוכן מסומן לא מהבהב לפני האנימציה */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('stm-js')",
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbLd([
              { name: "ראשי", path: "/" },
              { name: "הדירות שלנו", path: "/rooms" },
            ])
          ),
        }}
      />
      <MotionEngine />

      {/* Hero — פירורי לחם, כותרת גרדיאנט וגל תחתון */}
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,var(--color-navy-900)_0%,var(--color-ocean-700)_58%,var(--color-ocean-600)_100%)] pt-12 pb-24 text-center text-white md:pt-[70px] md:pb-[150px]">
        <div
          aria-hidden="true"
          className="stm-blob absolute -top-[120px] -left-20 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.35),transparent_68%)] blur-[10px]"
        />
        <Container className="relative z-[2]">
          <nav
            aria-label="פירורי לחם"
            className="mb-[26px] inline-flex items-center gap-2 text-[13.5px] font-medium text-[#acc8dd]"
          >
            {/* min-h + margin שלילי: אזור מגע 44px בלי לשנות את הזרימה (כלל ברזל #6) */}
            <Link href="/" className="stm-link -my-2 inline-flex min-h-11 items-center py-2">
              ראשי
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span aria-current="page" className="font-semibold text-white">
              הדירות שלנו
            </span>
          </nav>
          <h1
            data-ws=""
            className="mb-[22px] text-[40px]/[1.1] font-extrabold tracking-heading md:text-[62px]/[1.06]"
          >
            הדירות
            <br />
            <span className="bg-[linear-gradient(120deg,var(--color-aqua),var(--color-sea-400))] bg-clip-text text-transparent">
              והסוויטות שלנו
            </span>
          </h1>
          <p
            data-rev="up"
            className="mx-auto max-w-[600px] text-[19px]/[1.66] font-light text-[#cdddea]"
          >
            סטודיו זוגי, דירת חדר שינה וסלון או סוויטה משפחתית — כולן במגדל אחד מול הים,
            50 מטר מקו המים. בחרו את מה שמתאים לכם ובדקו זמינות ומחיר לתאריכים שלכם.
          </p>
        </Container>
        <WaveSeparator position="bottom" fill="var(--color-cloud)" />
      </section>

      {/* הקטלוג. הריפוד התחתון כולל את גובה גל הפוטר (70/120px) */}
      <section className="bg-cloud pt-14 pb-[126px] md:pt-20 md:pb-[204px]">
        <Container>
          {rooms.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} sizes={CARD_SIZES} />
                ))}
              </div>
              <p className="mt-8 text-center text-[14.5px] leading-relaxed text-ink-dim">
                המחיר והזמינות משתנים לפי תאריכים — בדקו את התאריכים שלכם במנוע ההזמנות.
              </p>
            </>
          ) : (
            /* GuestHub לא זמין — העמוד לא נופל, והמבקר ממשיך למנוע ההזמנות */
            <div className="rounded-card-lg border border-line bg-white p-6 text-center text-[15.5px] leading-relaxed text-ink-dim md:p-10">
              רשימת הדירות מתעדכנת ברגעים אלה — אפשר לבדוק זמינות ומחירים ישירות במנוע
              ההזמנות.
            </div>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Button href="/booking">בדקו זמינות</Button>
            <Button href="/#contact" variant="outline">
              צרו קשר
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
