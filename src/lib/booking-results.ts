import type { AvailabilityResult, PublicRoom } from "./booking-api";
import {
  bedsLabel,
  roomBlurb,
  roomFacts,
  roomGallery,
  roomTypeBadge,
  type RoomImage,
} from "./rooms-view";

/* חיבור זמינות לתוכן — הלוגיקה שמאחורי כרטיסי /booking.
   פונקציה טהורה בכוונה: זו הנקודה שבה שני מקורות אמת נפגשים, ולכן זו הנקודה
   שצריכה להיות ניתנת לבדיקה בלי דפדפן, בלי רשת ובלי React.

   חלוקת הסמכות (D121) — אין שדה שמגיע משני המקורות:
   • זמינות, מחיר ומזהי ההזמנה → /api/public/availability בלבד
   • שם, קופי, תמונות, מתקנים, גודל ומיטות → /api/public/rooms בלבד
   • המפתח המחבר → roomId, מזהה החדר הפיזי. לא מספר חדר, לא שם, לא סוג
     ולא מיקום במערך: כל אחד מאלה משתנה, ושינוי כזה מדביק לדירה אחת את
     התמונות של אחרת. */

export type BookingRoomsView = {
  title: string;
  roomNumber: string;
  typeTag: string | null;
  description: string | null;
  guests: number | null;
  sizeSqm: number | null;
  bedsLabel: string | null;
  amenities: string[];
  images: RoomImage[];
};

export type BookingItem = {
  /** מפתח הכרטיס — מזהה החדר הפיזי, ייחודי לכל שורה */
  roomId: string;
  /** מזהי ההזמנה, בדיוק כפי שהגיעו מ-availability */
  roomTypeId: string;
  suId: string;
  pricePerNight: number;
  totalPrice: number;
  checkoutHref: string;
  room: BookingRoomsView;
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

      const facts = roomFacts(room);
      items.push({
        roomId: room.id,
        roomTypeId: type.roomTypeId,
        suId: unit.suId,
        pricePerNight: Math.round(unit.totalPrice / nights),
        totalPrice: Math.round(stayTotal),
        checkoutHref: `/booking/checkout?${qs}`,
        room: {
          title: room.title,
          roomNumber: room.roomNumber,
          typeTag: roomTypeBadge(room),
          description: roomBlurb(room),
          guests: facts.guests,
          sizeSqm: facts.sizeSqm,
          /* אין ב-GuestHub שדה "מספר חדרים" נפרד: ההרכב מתואר בשם סוג החדר
             ("2 חדרי שינה וסלון"), שכבר מוצג — כתג מעל התמונה או ככותרת
             עצמה. צ'יפ נוסף היה חזרה על אותן מילים */
          bedsLabel: facts.beds ? bedsLabel(facts.beds) : null,
          amenities: room.amenities,
          images,
        },
      });
    }
  }

  items.sort((a, b) => a.totalPrice - b.totalPrice);
  return { items, excluded, availableBeforeJoin };
}
