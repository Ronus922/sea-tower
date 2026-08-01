import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchAvailability, fetchWebsiteRooms } from "@/lib/booking-api";
import { roomCoverImage } from "@/lib/rooms-view";
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

export const metadata: Metadata = {
  title: "השלמת הזמנה | Sea Tower דירות נופש מול הים בחיפה",
  robots: { index: false },
};

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
    fetchAvailability(checkIn, checkOut),
    fetchWebsiteRooms(),
  ]);
  if (!availability?.ok) redirect(backHref);
  const type = availability.roomTypes.find((t) => t.roomTypeId === roomTypeId);
  const maxParty = Math.max(...rooms.map((r) => r.adults + r.children));
  if (!type || type.units.length < rooms.length || type.maxOccupancy < maxParty) {
    redirect(backHref);
  }

  /* אותו סדר בחירה כמו בשרת ההזמנות: הדירה שנבחרה קודם, השאר מהזול ליקר */
  const preferred = unitId ? type.units.find((u) => u.suId === unitId) : type.units[0];
  if (!preferred) redirect(backHref);
  const picked = [preferred, ...type.units.filter((u) => u.suId !== preferred.suId)].slice(
    0,
    rooms.length,
  );
  const total = Math.round(picked.reduce((s, u) => s + u.totalPrice, 0));
  const nights = nightsBetween(checkIn, checkOut);

  /* שם ותמונה מקטלוג התוכן, מחוברים לפי מזהה החדר הפיזי — אותה דירה בדיוק
     שהוצגה בתוצאות. אם הקטלוג לא נענה כאן, ההזמנה לא נעצרת: מוצג מספר
     הדירה בלי תמונה, ולא תוכן של דירה אחרת */
  const room = catalog?.find((r) => r.id === preferred.roomId) ?? null;
  const quote: CheckoutQuote = {
    roomTypeId,
    preferredUnitId: preferred.suId,
    title: room ? `${room.title} · דירה ${room.roomNumber}` : `דירה ${preferred.code}`,
    image: room ? roomCoverImage(room) : null,
    checkIn,
    checkOut,
    nights,
    rooms,
    pricePerNight: Math.round(preferred.totalPrice / nights),
    total,
    backHref,
  };

  return <CheckoutWizard quote={quote} />;
}
