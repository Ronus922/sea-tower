import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchAvailability, fetchWebsiteRooms } from "@/lib/booking-api";
import { assignUnitsToRooms } from "@/lib/unit-assignment";
import { apartmentTitle } from "@/lib/apartment-view";
import { roomCoverImage } from "@/lib/rooms-view";
import { pageMeta } from "@/lib/seo";
import {
  isDateOnly,
  nightsBetween,
  parseGuestsParam,
  guestsParam,
  todayInIsrael,
} from "../dates";
import { CheckoutWizard, type CheckoutQuote } from "./CheckoutWizard";

/* עמוד התשלום — אשף שלושה שלבים (פרטים → תשלום → אישור) לפי עיצוב
   "Sea Tower - תשלום". השרת מאמת זמינות ובונה הצעת מחיר; ההזמנה עצמה
   נוצרת דרך POST /api/booking/checkout מול GuestHub. */

/* עמוד תנועתי בתוך משפך ההזמנה — noindex, וה-canonical מצביע על /booking
   (עמוד ההזמנה הציבורי) ולא נופל בירושה לעמוד הבית */
export const metadata: Metadata = pageMeta({
  title: "השלמת הזמנה | מגדל הים — דירות נופש מול הים בחיפה",
  description:
    "השלמת פרטי ההזמנה והתשלום עבור דירת נופש במגדל הים, חוף הכרמל בחיפה.",
  path: "/booking",
  robots: { index: false, follow: true },
});

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Checkout({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const one = (k: string) => {
    const v = params[k];
    return typeof v === "string" ? v : undefined;
  };

  const today = todayInIsrael();
  const checkIn = one("checkin") ?? "";
  const checkOut = one("checkout") ?? "";
  const roomTypeId = one("type") ?? "";
  const unitId = one("unit") ?? "";
  const rooms = parseGuestsParam(one("guests"));

  if (
    !isDateOnly(checkIn) ||
    !isDateOnly(checkOut) ||
    checkIn < today ||
    checkOut <= checkIn ||
    !/^[0-9a-f-]{36}$/i.test(roomTypeId) ||
    (unitId && !/^[0-9a-f-]{36}$/i.test(unitId))
  ) {
    redirect("/booking");
  }

  const backHref = `/booking?checkin=${checkIn}&checkout=${checkOut}&guests=${guestsParam(rooms)}#results`;

  const [availability, catalog] = await Promise.all([
    fetchAvailability(checkIn, checkOut, rooms),
    fetchWebsiteRooms(true),
  ]);
  if (!availability?.ok) redirect(backHref);
  const type = availability.roomTypes.find((t) => t.roomTypeId === roomTypeId);
  if (!type) redirect(backHref);

  /* אותו כלל הקצאה כמו בשרת ההזמנות (D195): הדירה שנבחרה → חדר 1, שאר החדרים
     השילוב התקין הזול ביותר; כל מחיר מ-partyPrices. הדירה שנבחרה לא מארחת את
     ההרכב, או שאין שילוב — חזרה לחיפוש, לא הצעת מחיר שההזמנה תדחה */
  const assignment = assignUnitsToRooms(type.units, rooms.length, unitId || null);
  if (!assignment.ok) redirect(backHref);
  const preferred = assignment.units[0];
  const total = Math.round(assignment.total);
  const nights = nightsBetween(checkIn, checkOut);

  /* שם ותמונה מקטלוג התוכן, מחוברים לפי מזהה החדר הפיזי — אותה דירה בדיוק
     שהוצגה בתוצאות. אם הקטלוג לא נענה כאן, ההזמנה לא נעצרת: מוצג מספר
     הדירה בלי תמונה, ולא תוכן של דירה אחרת */
  const room = catalog?.find((r) => r.id === preferred.roomId) ?? null;
  const quote: CheckoutQuote = {
    roomTypeId,
    preferredUnitId: preferred.suId,
    title: room ? apartmentTitle(room) : `דירה ${preferred.code}`,
    image: room ? roomCoverImage(room) : null,
    checkIn,
    checkOut,
    nights,
    rooms,
    pricePerNight: Math.round(assignment.prices[0] / nights),
    total,
    backHref,
  };

  return <CheckoutWizard quote={quote} />;
}
