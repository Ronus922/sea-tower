// שכבת הדיבור מול GuestHub — צד שרת בלבד (route handlers / server components).
// ה-hop הוא loopback בלבד (127.0.0.1:3007); אם guesthub יעבור אי-פעם לשרת אחר —
// חובה HTTPS/mTLS במקום. ה-secret לעולם לא נשלח לדפדפן.

export type AvailableUnit = {
  suId: string; // מזהה היחידה למכירה — מה שההזמנה נסגרת עליו
  roomId: string; // מזהה החדר הפיזי — המפתח היחיד לחיבור לתוכן מ-/api/public/rooms
  code: string; // מספר הדירה (room_number ב-GuestHub)
  totalPrice: number; // לכל השהות, לדירה זו
};

export type RoomTypeAvailability = {
  roomTypeId: string;
  name: string;
  maxOccupancy: number;
  basePrice: number;
  availableUnits: number;
  totalPrice: number | null;
  pricePerNight: number | null;
  nightly: Array<{ date: string; price: number }>;
  units: AvailableUnit[]; // ממוין מהזול ליקר — סדר הבחירה בהזמנה
};

export type AvailabilityResult =
  | {
      ok: true;
      checkIn: string;
      checkOut: string;
      nights: number;
      currency: string;
      roomTypes: RoomTypeAvailability[];
    }
  | { ok: false; code: string; message?: string };

export type CreateBookingPayload = {
  checkIn: string;
  checkOut: string;
  roomTypeId: string;
  preferredUnitId: string | null;
  rooms: Array<{ adults: number; children: number }>;
  expectedTotal: number;
  guest: { firstName: string; lastName: string; phone: string; email: string };
  card: {
    pan: string;
    cvv: string;
    holderName: string;
    holderIdNumber: string | null;
    expMonth: number;
    expYear: number;
  };
  consents: { terms: boolean; privacy: boolean; marketing: boolean };
  meta: { ip: string | null; userAgent: string | null };
};

export type CreateBookingResult =
  | {
      ok: true;
      reservationId: string;
      reservationNumber: string;
      total: number;
      checkIn: string;
      checkOut: string;
      nights: number;
    }
  | { ok: false; code: string; message?: string; newTotal?: number };

/* קטלוג החדרים לאתר — תוכן בלבד (שמות, קופי, מתקנים, גלריה). זמינות ומחיר
   לעולם לא מגיעים מכאן אלא מ-fetchAvailability, שהוא לפי תאריכים */
export type PublicRoom = {
  id: string;
  roomNumber: string;
  slug: string | null;
  title: string;
  /* מאיזו חוליה בשרשרת הגיעה הכותרת — "type" אומר שאין לחדר שם עברי ב-GuestHub
     ולכן הכותרת היא שם סוג החדר, ואין להדפיס אותו שוב כתג */
  titleSource: "translation" | "room" | "type" | "number";
  summary: string | null;
  description: string | null;
  floor: string | null;
  sizeSqm: number | null;
  maxOccupancy: number | null;
  roomType: { id: string; name: string } | null;
  beds: { single: number; double: number; queen: number; sofa: number; cribs: number };
  amenities: string[];
  images: Array<{ url: string; alt: string | null }>;
};

export type PublicRoomsResult =
  | { ok: true; lang: string; rooms: PublicRoom[] }
  | { ok: false; code: string; message?: string };

const BASE = process.env.GUESTHUB_API_URL ?? "http://127.0.0.1:3007";

/* revalidate: מספר שניות ל-ISR (קטלוג החדרים), או no-store לנתונים חיים */
async function guesthubFetch<T>(
  path: string,
  init?: RequestInit,
  revalidate?: number,
): Promise<T | null> {
  const secret = process.env.GUESTHUB_BOOKING_SECRET;
  if (!secret) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      ...(revalidate === undefined
        ? { cache: "no-store" as const }
        : { next: { revalidate } }),
      signal: controller.signal,
      headers: {
        "x-booking-secret": secret,
        "content-type": "application/json",
        ...init?.headers,
      },
    });
    return (await res.json()) as T;
  } catch {
    // guesthub למטה / timeout — המתקשר מציג "שירות ההזמנות אינו זמין כרגע"
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAvailability(
  checkIn: string,
  checkOut: string,
): Promise<AvailabilityResult | null> {
  const qs = new URLSearchParams({ check_in: checkIn, check_out: checkOut });
  return guesthubFetch<AvailabilityResult>(`/api/public/availability?${qs}`);
}

/* קטלוג החדרים המסומנים "הצג באתר" ב-GuestHub. ISR של 5 דקות: התוכן משתנה
   נדירות, ונפילה של guesthub לא מפילה את עמוד הבית — המתקשר מקבל null */
export async function fetchWebsiteRooms(): Promise<PublicRoom[] | null> {
  const res = await guesthubFetch<PublicRoomsResult>("/api/public/rooms?lang=he", undefined, 300);
  return res?.ok ? res.rooms : null;
}

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<CreateBookingResult | null> {
  return guesthubFetch<CreateBookingResult>(`/api/public/bookings`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
