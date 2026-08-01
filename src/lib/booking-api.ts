// שכבת הדיבור מול GuestHub — צד שרת בלבד (route handlers / server components).
// ה-hop הוא loopback בלבד (127.0.0.1:3007); אם guesthub יעבור אי-פעם לשרת אחר —
// חובה HTTPS/mTLS במקום. ה-secret לעולם לא נשלח לדפדפן.

export type AvailableUnit = {
  suId: string;
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

const BASE = process.env.GUESTHUB_API_URL ?? "http://127.0.0.1:3007";

async function guesthubFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const secret = process.env.GUESTHUB_BOOKING_SECRET;
  if (!secret) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      cache: "no-store",
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

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<CreateBookingResult | null> {
  return guesthubFetch<CreateBookingResult>(`/api/public/bookings`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
