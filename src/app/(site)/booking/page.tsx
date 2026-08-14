import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageIntro } from "@/components/ui/PageIntro";
import { MotionEngine } from "@/components/site/MotionEngine";
import { BUSINESS } from "@/lib/business";
import { pageMeta, buildBreadcrumbLd, buildWebPageLd } from "@/lib/seo";
import { fetchAvailability, fetchWebsiteRooms } from "@/lib/booking-api";
import { buildBookingResults, formatExcludedReport } from "@/lib/booking-results";
import { BookingSearchBar } from "./BookingSearchBar";
import { ResultsList } from "./ResultsList";
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

/* מדיניות הביטולים הקנונית (הכרעת בעלים, סוגרת את SEO-AUDIT B1) מופיעה
   בתיאור — הנוסח היחיד: "ניתן לבטל את ההזמנה בכל שלב, ללא דמי ביטול" */
const DESCRIPTION =
  "בדקו זמינות והזמינו דירת נופש מול הים בחיפה — סטודיו, דירה או סוויטה משפחתית בבניין אלמוג, 50 מ׳ מהחוף. מחיר סופי כולל הכול; ניתן לבטל את ההזמנה בכל שלב, ללא דמי ביטול.";

export const metadata: Metadata = pageMeta({
  title: "בדיקת זמינות והזמנה | מגדל הים — דירות נופש מול הים בחיפה",
  description: DESCRIPTION,
  path: "/booking",
});

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

  /* שתי קריאות במקביל, פעם אחת לעמוד (לא קריאה לכל תוצאה), שתיהן ללא cache:
     גם הזמינות וגם קטלוג התוכן חייבים להיות מה שיש עכשיו ב-GuestHub. מחיקת
     תמונות או שינוי תיאור במערכת הניהול מופיעים כאן בחיפוש הבא — אין ISR,
     אין קטלוג סטטי ואין נתוני דמו שמחליפים נתונים אמיתיים */
  const [availability, catalog] = await Promise.all([
    fetchAvailability(checkIn, checkOut),
    fetchWebsiteRooms(true),
  ]);

  /* כרטיס לכל דירה פנויה (לא קטגוריות), ממוין מהזול ליקר */
  const results =
    availability?.ok && catalog
      ? buildBookingResults({
          availability,
          rooms: catalog,
          guestRooms: rooms,
          nights,
          checkIn,
          checkOut,
          guestsParam: guestsParam(rooms),
        })
      : null;

  /* דיאגנוסטיקה לשרת בלבד: איזו דירה פנויה לא הוצגה ולמה, מקובץ לפי סיבה.
     המזהים האלה לא מגיעים לדפדפן — הם קיימים כדי שאפשר יהיה להשלים את מה
     שחסר ב-GuestHub. שקט בלוג = לא הוסתרה אף דירה */
  if (results) {
    const excludedReport = formatExcludedReport({
      excluded: results.excluded,
      availableBeforeJoin: results.availableBeforeJoin,
      checkIn,
      checkOut,
    });
    if (excludedReport) console.warn(excludedReport);
  }

  const items = results?.items ?? [];
  /* זמינות עלתה אבל קטלוג התוכן נפל — לא נופלים לקטלוג סטטי ולא מציגים
     כרטיסים שגויים; מציגים הודעה זמנית והתאריכים נשמרים ב-URL */
  const catalogDown = Boolean(availability?.ok) && !catalog;
  const retryHref = `/booking?checkin=${checkIn}&checkout=${checkOut}&guests=${guestsParam(rooms)}#results`;

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildWebPageLd({
              name: "בדיקת זמינות והזמנה — מגדל הים",
              description: DESCRIPTION,
              path: "/booking",
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbLd([
              { name: "ראשי", path: "/" },
              { name: "בדיקת זמינות והזמנה", path: "/booking" },
            ]),
          ),
        }}
      />

      {/* פתיח משימתי שקט — עמוד הזמנה הוא כלי עבודה, לא עמוד שיווק */}
      <PageIntro
        crumbs={[{ name: "ראשי", href: "/" }, { name: "בדיקת זמינות והזמנה" }]}
        title="בחרו את הדירה לתאריכים שלכם"
        lead="בחרו תאריכים ומספר אורחים, וצפו במחיר ללילה, בסה״כ לשהייה ובכל הפרטים — הכול במקום אחד."
      />

      {/* פס החיפוש — ישירות מתחת לפתיח */}
      <section className="bg-cloud pt-6">
        <div className="mx-auto w-full max-w-shell px-5 sm:px-8">
          <BookingSearchBar checkIn={checkIn} checkOut={checkOut} rooms={rooms} />
        </div>
      </section>

      {/* תוצאות */}
      <section id="results" className="bg-cloud pt-14 pb-20">
        <div className="mx-auto w-full max-w-shell px-5 sm:px-8">
          {catalogDown ? (
            /* פרטי הדירות אינם זמינים כרגע — התאריכים והאורחים נשמרו ב-URL,
               והכפתור מריץ את אותו חיפוש בדיוק מחדש */
            <div className="rounded-card-lg border border-line bg-white p-10 text-center shadow-e1">
              <h2 className="mb-2 text-[24px] font-extrabold text-navy-800">
                פרטי הדירות אינם זמינים כרגע
              </h2>
              <p className="mx-auto mb-6 max-w-[480px] text-[15.5px] leading-relaxed text-ink-dim">
                יש דירות פנויות בתאריכים שבחרתם, אבל אנחנו לא מצליחים לטעון את פרטי
                הדירות ברגע זה. נסו שוב בעוד רגע — התאריכים והאורחים שלכם נשמרו.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <Button href={retryHref}>נסו שוב</Button>
                <Button href={BUSINESS.phones.office.tel} variant="outline">
                  {BUSINESS.phones.office.label}
                </Button>
              </div>
            </div>
          ) : availability?.ok ? (
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

      {/* עזרה בבחירה — נייבי אחיד; הריפוד התחתון כולל את גובה גל הפוטר (70/120px) */}
      <section className="ed-wave-clear bg-navy-900 pt-16 md:pt-20">
        <Container className="max-w-[760px] text-center text-white">
          <h2 className="ed-h2 mb-3.5 text-white">צריכים עזרה בבחירה?</h2>
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
