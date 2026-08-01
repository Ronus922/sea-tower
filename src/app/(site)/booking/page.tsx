import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { MotionEngine } from "@/components/site/MotionEngine";
import { BUSINESS } from "@/lib/business";
import { fetchAvailability } from "@/lib/booking-api";
import { apartmentFor } from "@/lib/apartments";
import { BookingSearchBar } from "./BookingSearchBar";
import { ResultsList, type BookingItem } from "./ResultsList";
import {
  addDays,
  fmtRange,
  guestsParam,
  guestsSummary,
  isDateOnly,
  nightsBetween,
  parseGuestsParam,
  todayInIsrael,
} from "./dates";

/* מנוע ההזמנות — בדיקת זמינות חיה מול GuestHub לפי עיצוב
   "Sea Tower - מנוע הזמנה" (Claude Design). SSR מלא: כל חיפוש = ניווט
   עם פרמטרים חדשים והעמוד מרונדר עם נתונים טריים. */

const DESCRIPTION =
  "בדקו זמינות והזמינו דירת נופש מול הים בחיפה — סטודיו, דירת חדר שינה וסלון או סוויטה משפחתית בבניין אלמוג, 50 מ׳ מהחוף. מחיר סופי כולל הכול, ביטול חינם עד 48 שעות.";

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.siteUrl),
  title: "בדיקת זמינות והזמנה | Sea Tower דירות נופש מול הים בחיפה",
  description: DESCRIPTION,
  alternates: { canonical: "/booking" },
  openGraph: {
    title: "בדיקת זמינות והזמנה | Sea Tower דירות נופש מול הים בחיפה",
    description: DESCRIPTION,
    url: "/booking",
    siteName: "מגדל הים — Sea Tower",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "/images/hero-terrace.jpg",
        width: 1376,
        height: 768,
        alt: "מרפסת פנטהאוז מול מפרץ חיפה בשעת שקיעה",
      },
    ],
  },
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Booking({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const one = (k: string) => {
    const v = params[k];
    return typeof v === "string" ? v : undefined;
  };

  /* ברירת מחדל: מחר, שני לילות, 2 מבוגרים — העמוד תמיד מציג תוצאות חיות */
  const today = todayInIsrael();
  let checkIn = one("checkin") ?? "";
  let checkOut = one("checkout") ?? "";
  if (!isDateOnly(checkIn) || checkIn < today) checkIn = addDays(today, 1);
  if (!isDateOnly(checkOut) || checkOut <= checkIn) checkOut = addDays(checkIn, 2);
  if (nightsBetween(checkIn, checkOut) > 30) checkOut = addDays(checkIn, 30);
  const rooms = parseGuestsParam(one("guests"));
  const nights = nightsBetween(checkIn, checkOut);

  const availability = await fetchAvailability(checkIn, checkOut);

  /* כרטיס לכל דירה פנויה (לא קטגוריות), ממוין מהזול ליקר. בהזמנה רב-חדרית
     המחיר הכולל = הדירה שבכרטיס + הזולות הבאות מאותו סוג */
  let items: BookingItem[] = [];
  if (availability?.ok) {
    const maxParty = Math.max(...rooms.map((r) => r.adults + r.children));
    for (const t of availability.roomTypes) {
      if (t.units.length < rooms.length || t.maxOccupancy < maxParty) continue;
      const cfg = apartmentFor(t.name);
      for (const unit of t.units) {
        const others = t.units.filter((u) => u.suId !== unit.suId);
        const stayTotal =
          unit.totalPrice +
          others.slice(0, rooms.length - 1).reduce((s, u) => s + u.totalPrice, 0);
        const qs = new URLSearchParams({
          type: t.roomTypeId,
          unit: unit.suId,
          checkin: checkIn,
          checkout: checkOut,
          guests: guestsParam(rooms),
        });
        items.push({
          roomTypeId: unit.suId,
          title: `${cfg.title} · דירה ${unit.code}`,
          tag: cfg.tag,
          tagStyle: cfg.tagStyle,
          guestsMax: t.maxOccupancy,
          sqm: cfg.sqm,
          rooms: cfg.rooms,
          beds: cfg.beds,
          amenities: cfg.amenities,
          description: cfg.description,
          images: cfg.images,
          pricePerNight: Math.round(unit.totalPrice / nights),
          totalPrice: Math.round(stayTotal),
          checkoutHref: `/booking/checkout?${qs}`,
        });
      }
    }
    items = items.sort((a, b) => a.totalPrice - b.totalPrice);
  }

  const countLabel = items.length === 1 ? "דירה אחת זמינה" : `${items.length} דירות זמינות`;
  const rangeLabel = `${fmtRange(checkIn, checkOut)} ${checkIn.slice(0, 4)} · ${
    nights === 1 ? "לילה אחד" : `${nights} לילות`
  } · ${guestsSummary(rooms)}`;

  return (
    <>
      {/* שער חשיפות: רץ לפני ה-hydration כך שתוכן מסומן לא מהבהב לפני האנימציה */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('stm-js')",
        }}
      />
      <MotionEngine />

      {/* Hero — פירורי לחם, כותרת גרדיאנט וגל תחתון */}
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,var(--color-navy-900)_0%,var(--color-ocean-700)_58%,var(--color-ocean-600)_100%)] pt-12 pb-[100px] text-center text-white md:pt-[60px] md:pb-[120px]">
        <div
          aria-hidden="true"
          className="stm-blob absolute -top-[120px] -left-20 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.35),transparent_68%)] blur-[10px]"
        />
        <div
          aria-hidden="true"
          className="stm-blob absolute -right-[60px] bottom-[60px] size-[300px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.18),transparent_70%)]"
        />
        <Container className="relative z-[2]">
          <nav
            aria-label="פירורי לחם"
            className="hero-in-1 mb-[22px] inline-flex items-center gap-2 text-[13.5px] font-medium text-[#acc8dd]"
          >
            <Link href="/" className="stm-link -my-2 inline-flex min-h-11 items-center py-2">
              ראשי
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span aria-current="page" className="font-semibold text-white">
              בדיקת זמינות והזמנה
            </span>
          </nav>
          <h1
            data-ws=""
            className="mb-4 text-[40px]/[1.1] font-extrabold tracking-heading md:text-[54px]/[1.08]"
          >
            בחרו את הדירה
            <br />
            <span className="bg-[linear-gradient(120deg,var(--color-aqua),var(--color-sea-400))] bg-clip-text text-transparent">
              לתאריכים שלכם
            </span>
          </h1>
          <p className="hero-in-3 mx-auto max-w-[560px] text-[18px]/[1.6] font-light text-[#cdddea]">
            בחרו תאריכים ומספר אורחים, וצפו במחיר ללילה, בסה״כ לשהייה ובכל הפרטים — הכול
            במקום אחד.
          </p>
        </Container>
        <WaveSeparator position="bottom" fill="var(--color-cloud)" />
      </section>

      {/* פס חיפוש צף — חופף לגל ה-Hero */}
      <section className="relative z-10 -mt-[66px] bg-cloud">
        <div className="mx-auto w-full max-w-shell px-5 sm:px-8">
          <BookingSearchBar checkIn={checkIn} checkOut={checkOut} rooms={rooms} />
        </div>
      </section>

      {/* תוצאות */}
      <section id="results" className="bg-cloud pt-14 pb-20">
        <div className="mx-auto w-full max-w-shell px-5 sm:px-8">
          {availability?.ok ? (
            items.length > 0 ? (
              <>
                <ResultsList
                  items={items}
                  nights={nights}
                  countLabel={countLabel}
                  rangeLabel={rangeLabel}
                />
                <div className="mt-8 text-center text-[14px] font-medium text-ink-dim">
                  המחירים כוללים מע״מ, ניקיון ומצעים · ללא עמלות נסתרות
                </div>
              </>
            ) : (
              <div className="rounded-card-lg border border-line bg-white p-10 text-center shadow-e1">
                <h2 className="mb-2 text-[24px] font-extrabold text-navy-800">
                  אין דירות פנויות בתאריכים שנבחרו
                </h2>
                <p className="mx-auto max-w-[480px] text-[15.5px] leading-relaxed text-ink-dim">
                  נסו לשנות את התאריכים או את הרכב האורחים — או דברו איתנו ונשמח למצוא לכם
                  פתרון מתאים.
                </p>
              </div>
            )
          ) : (
            <div className="rounded-card-lg border border-line bg-white p-10 text-center shadow-e1">
              <h2 className="mb-2 text-[24px] font-extrabold text-navy-800">
                שירות ההזמנות אינו זמין כרגע
              </h2>
              <p className="mx-auto max-w-[480px] text-[15.5px] leading-relaxed text-ink-dim">
                נסו לרענן את העמוד בעוד מספר דקות, או התקשרו אלינו ל־
                <a href={BUSINESS.phones.office.tel} className="font-bold text-ocean-400">
                  {BUSINESS.phones.office.label}
                </a>{" "}
                ונשמח לבדוק זמינות עבורכם.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* עזרה בבחירה — המקטע האחרון: הריפוד התחתון כולל את גובה גל הפוטר (70/120px) */}
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,var(--color-navy-900),var(--color-ocean-700)_70%,var(--color-ocean-600))] pt-16 pb-[150px] md:pt-20 md:pb-[200px]">
        <div
          aria-hidden="true"
          className="stm-blob absolute -top-[90px] -left-[50px] size-[340px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.25),transparent_70%)]"
        />
        <Container className="relative z-[2] max-w-[760px] text-center text-white">
          <h2 data-ws="" className="mb-3.5 text-[32px]/[1.12] font-black tracking-heading md:text-[40px]/[1.12]">
            צריכים עזרה בבחירה?
          </h2>
          <p className="mx-auto mb-[30px] max-w-[600px] text-[17px]/[1.6] text-[#bcd4e6]">
            נשמח להמליץ על הדירה שמתאימה בדיוק לתאריכים, להרכב ולתקציב שלכם — לנופש, לעבודה
            או לתקופה ארוכה.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Button surface="dark" href="/contact">
              דברו איתנו
            </Button>
            <Button variant="outline" surface="dark" href={BUSINESS.phones.office.tel}>
              {BUSINESS.phones.office.label}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
