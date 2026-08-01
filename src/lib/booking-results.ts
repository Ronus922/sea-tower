import { buildApartmentView, hasSpec, type ApartmentView } from "./apartment-view";
import type { AvailabilityResult, PublicRoom } from "./booking-api";
import { roomGallery } from "./rooms-view";

/* חיבור זמינות לתוכן — הלוגיקה שמאחורי כרטיסי /booking.
   פונקציה טהורה בכוונה: זו הנקודה שבה שני מקורות אמת נפגשים, ולכן זו הנקודה
   שצריכה להיות ניתנת לבדיקה בלי דפדפן, בלי רשת ובלי React.

   חלוקת הסמכות (D121) — אין שדה שמגיע משני המקורות:
   • זמינות, מחיר ומזהי ההזמנה → /api/public/availability בלבד
   • שם, קופי, תמונות, מתקנים, גודל ומיטות → /api/public/rooms בלבד
   • המפתח המחבר → roomId, מזהה החדר הפיזי. לא מספר חדר, לא שם, לא סוג
     ולא מיקום במערך: כל אחד מאלה משתנה, ושינוי כזה מדביק לדירה אחת את
     התמונות של אחרת. */

export type BookingItem = {
  /** מפתח הכרטיס — מזהה החדר הפיזי, ייחודי לכל שורה */
  roomId: string;
  /** מזהי ההזמנה, בדיוק כפי שהגיעו מ-availability */
  roomTypeId: string;
  suId: string;
  pricePerNight: number;
  totalPrice: number;
  checkoutHref: string;
  /** מודל התצוגה המנורמל — אותו אובייקט לכרטיס, לאקורדיון ולמגירה */
  apartment: ApartmentView;
  /** יש מה לפתוח במפרט המורחב — נקבע בשרת כדי שהכרטיס לא יבטיח פאנל ריק */
  hasSpec: boolean;
};

/* "no-public-profile" — הקטלוג הציבורי לא החזיר את החדר בכלל. מנקודת המבט
   של האתר זו סיבה אחת: או שהוא לא מסומן להצגה באתר, או שאין לו תמונה
   ציבורית (‏/api/public/rooms מסנן את שניהם). "no-public-image" — הרשומה
   חזרה אבל אף כתובת תמונה לא עברה את תבנית האבטחה. */
export type ExcludedRoom = {
  roomId: string;
  code: string;
  reason: "no-public-profile" | "no-public-image";
};

/* מה בדיוק חסר ב-GuestHub, בניסוח של מי שהולך לתקן את זה שם. הטקסט הזה
   נכתב ללוג השרת ולכן הוא לא מניח היכרות עם הקוד או עם שמות השדות */
const REASON_LABEL: Record<ExcludedRoom["reason"], string> = {
  "no-public-profile":
    "לא חזר מקטלוג האתר — הדירה לא מסומנת ״הצג באתר״ ב-GuestHub, או שאין לה אף תמונה פעילה",
  "no-public-image":
    "חזרה מהקטלוג בלי אף תמונה תקפה — צריך להעלות ב-GuestHub תמונה פעילה אחת לפחות",
};

/* סדר קבוע לדוח: קודם מה שחסר לו פרופיל, אחר כך מה שחסרות לו תמונות */
const REASON_ORDER: ExcludedRoom["reason"][] = ["no-public-profile", "no-public-image"];

export type BookingResults = {
  items: BookingItem[];
  excluded: ExcludedRoom[];
  /** כמה דירות היו פנויות לפני דרישת הפרופיל הציבורי */
  availableBeforeJoin: number;
};

export type GuestRoom = { adults: number; children: number };

/* דירה נכנסת לתוצאות רק כשארבעת התנאים מתקיימים: פנויה בתאריכים, מסומנת
   להצגה באתר (‏GuestHub מחזיר רק כאלה), יש לה רשומת תוכן ציבורית, ויש לה
   לפחות תמונה תקפה אחת. חסר אחד מהם — הדירה לא מוצגת, ולא ממציאים לה
   תמונה או תיאור של דירה אחרת. */
export function buildBookingResults({
  availability,
  rooms,
  guestRooms,
  nights,
  checkIn,
  checkOut,
  guestsParam,
}: {
  availability: Extract<AvailabilityResult, { ok: true }>;
  rooms: PublicRoom[];
  guestRooms: GuestRoom[];
  nights: number;
  checkIn: string;
  checkOut: string;
  guestsParam: string;
}): BookingResults {
  const byRoomId = new Map(rooms.map((r) => [r.id, r]));
  const maxParty = Math.max(...guestRooms.map((r) => r.adults + r.children));

  const items: BookingItem[] = [];
  const excluded: ExcludedRoom[] = [];
  let availableBeforeJoin = 0;

  for (const type of availability.roomTypes) {
    /* כשירות ההזמנה נקבעת בזמינות בלבד: מספיק יחידות להרכב, ותפוסה מותרת */
    if (type.units.length < guestRooms.length || type.maxOccupancy < maxParty) continue;

    for (const unit of type.units) {
      availableBeforeJoin++;

      const room = byRoomId.get(unit.roomId);
      if (!room) {
        excluded.push({ roomId: unit.roomId, code: unit.code, reason: "no-public-profile" });
        continue;
      }
      const images = roomGallery(room);
      if (images.length === 0) {
        excluded.push({ roomId: unit.roomId, code: unit.code, reason: "no-public-image" });
        continue;
      }

      /* בהזמנה רב-חדרית הסה״כ = הדירה שבכרטיס + הזולות הבאות מאותו סוג.
         הסכומים נלקחים כמו שהם מ-availability ולא מחושבים מחדש */
      const others = type.units.filter((u) => u.suId !== unit.suId);
      const stayTotal =
        unit.totalPrice +
        others.slice(0, guestRooms.length - 1).reduce((s, u) => s + u.totalPrice, 0);

      const qs = new URLSearchParams({
        type: type.roomTypeId,
        unit: unit.suId,
        checkin: checkIn,
        checkout: checkOut,
        guests: guestsParam,
      });

      const apartment = buildApartmentView(room);
      items.push({
        roomId: room.id,
        roomTypeId: type.roomTypeId,
        suId: unit.suId,
        pricePerNight: Math.round(unit.totalPrice / nights),
        totalPrice: Math.round(stayTotal),
        checkoutHref: `/booking/checkout?${qs}`,
        apartment,
        hasSpec: hasSpec(apartment),
      });
    }
  }

  items.sort((a, b) => a.totalPrice - b.totalPrice);
  return { items, excluded, availableBeforeJoin };
}

/* דוח ההסתרות — לשרת בלבד. מסכם לאיש התפעול איזו דירה פנויה לא הופיעה
   באתר ומה חסר לה ב-GuestHub, מקובץ לפי סיבה וממוין לפי מספר דירה כדי
   שאותו מצב ייתן תמיד אותו טקסט (השוואה בין ריצות היא הדרך לראות שתיקון
   ב-PMS באמת עבד). מחזיר null כשאין מה לדווח — קריאה שקטה היא המצב התקין.
   הטקסט לא מגיע לדפדפן: ההתנהגות הציבורית היא הסתרה שקטה, בלי כרטיס חלופי */
export function formatExcludedReport({
  excluded,
  availableBeforeJoin,
  checkIn,
  checkOut,
}: {
  excluded: ExcludedRoom[];
  availableBeforeJoin: number;
  checkIn: string;
  checkOut: string;
}): string | null {
  if (excluded.length === 0) return null;

  const lines = [
    `[booking] ${excluded.length} מתוך ${availableBeforeJoin} דירות פנויות הוסתרו מ-/booking ` +
      `(${checkIn} → ${checkOut})`,
  ];

  for (const reason of REASON_ORDER) {
    const group = excluded
      .filter((e) => e.reason === reason)
      .sort((a, b) => a.code.localeCompare(b.code, "en"));
    if (group.length === 0) continue;

    lines.push(`  ${reason} (${group.length}) — ${REASON_LABEL[reason]}`);
    for (const e of group) lines.push(`    · דירה ${e.code} · roomId=${e.roomId}`);
  }

  return lines.join("\n");
}
