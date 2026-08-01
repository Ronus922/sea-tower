import { NextRequest, NextResponse } from "next/server";
import { createBooking, type CreateBookingPayload } from "@/lib/booking-api";

/* יצירת הזמנה מהאתר: אימות בסיסי, honeypot, rate-limit, והעברה ל-GuestHub.
   אבטחה: הגוף מכיל PAN+CVV — לעולם לא ללוגים, לעולם לא ב-echo של תשובה.
   האימות המלא (Luhn, תוקף, זמינות, מחיר) נעשה ב-GuestHub; כאן רק סינון צורה
   כדי שזבל לא יעזוב את המכונה. */

const RATE_WINDOW_MS = 60 * 60_000;
const RATE_MAX = 5;

/* ponytail: מונה in-memory — התהליך רץ כ-instance יחיד (systemd standalone) */
const rateHits = new Map<string, number[]>();

function s(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

const GENERIC_ERROR = "לא הצלחנו להשלים את ההזמנה כרגע. נסו שוב או התקשרו אלינו.";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "בקשה לא תקינה" }, { status: 400 });
  }

  /* honeypot — בוטים ממלאים את השדה הנסתר; מחזירים "שגיאה כללית" בלי לפנות ל-PMS */
  if (s(body.company, 100)) {
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 400 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const now = Date.now();
  const hits = (rateHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    return NextResponse.json(
      { ok: false, error: "נשלחו יותר מדי ניסיונות הזמנה. נסו שוב מאוחר יותר או התקשרו אלינו." },
      { status: 429 },
    );
  }

  const guest = (body.guest ?? {}) as Record<string, unknown>;
  const card = (body.card ?? {}) as Record<string, unknown>;
  const consents = (body.consents ?? {}) as Record<string, unknown>;
  const roomsRaw = Array.isArray(body.rooms) ? (body.rooms as Array<Record<string, unknown>>) : [];

  const payload: CreateBookingPayload = {
    checkIn: s(body.checkIn, 10),
    checkOut: s(body.checkOut, 10),
    roomTypeId: s(body.roomTypeId, 36),
    preferredUnitId: s(body.preferredUnitId, 36) || null,
    rooms: roomsRaw.slice(0, 5).map((r) => ({
      adults: Number(r.adults) || 0,
      children: Number(r.children) || 0,
    })),
    expectedTotal: Number(body.expectedTotal) || 0,
    guest: {
      firstName: s(guest.firstName, 60),
      lastName: s(guest.lastName, 60),
      phone: s(guest.phone, 30).replace(/[\s\-().]/g, ""),
      email: s(guest.email, 120),
    },
    card: {
      pan: s(card.pan, 30).replace(/\D/g, ""),
      cvv: s(card.cvv, 4),
      holderName: s(card.holderName, 120),
      holderIdNumber: s(card.holderIdNumber, 9) || null,
      expMonth: Number(card.expMonth) || 0,
      expYear: Number(card.expYear) || 0,
    },
    consents: {
      terms: consents.terms === true,
      privacy: consents.privacy === true,
      marketing: consents.marketing === true,
    },
    meta: {
      ip,
      userAgent: s(req.headers.get("user-agent"), 300) || null,
    },
  };

  /* צורה מינימלית לפני שהבקשה עוזבת את התהליך */
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(payload.checkIn) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(payload.checkOut) ||
    payload.rooms.length < 1 ||
    payload.guest.firstName.length < 2 ||
    payload.card.pan.length < 8 ||
    !payload.consents.terms ||
    !payload.consents.privacy
  ) {
    return NextResponse.json(
      { ok: false, error: "חלק מהפרטים חסרים או שגויים" },
      { status: 422 },
    );
  }

  const result = await createBooking(payload);
  rateHits.set(ip, [...hits, now]);
  if (rateHits.size > 500) {
    for (const [k, ts] of rateHits) {
      const live = ts.filter((t) => now - t < RATE_WINDOW_MS);
      if (live.length) rateHits.set(k, live);
      else rateHits.delete(k);
    }
  }

  if (!result) {
    return NextResponse.json(
      { ok: false, error: "שירות ההזמנות אינו זמין כרגע. נסו שוב בעוד מספר דקות או התקשרו אלינו." },
      { status: 503 },
    );
  }

  if (result.ok) {
    return NextResponse.json(result, { status: 201 });
  }

  /* מיפוי קודי GuestHub להודעה ידידותית; price_changed מעביר את המחיר החדש */
  const messages: Record<string, string> = {
    no_availability: "הדירה כבר אינה זמינה בתאריכים שנבחרו. חזרו לחיפוש ובחרו מחדש.",
    price_changed: "המחיר התעדכן מאז הצגת ההצעה. אשרו את המחיר החדש והמשיכו.",
    invalid_card: result.message ?? "פרטי הכרטיס אינם תקינים",
    validation: result.message ?? "חלק מהפרטים חסרים או שגויים",
    card_vault_unavailable: "שירות ההזמנות אינו זמין כרגע. התקשרו אלינו ונשמח לעזור.",
    rate_limited: "יותר מדי בקשות. נסו שוב בעוד רגע.",
  };
  const status =
    result.code === "no_availability" || result.code === "price_changed" ? 409
    : result.code === "invalid_card" || result.code === "validation" ? 422
    : 503;
  return NextResponse.json(
    {
      ok: false,
      code: result.code,
      error: messages[result.code] ?? GENERIC_ERROR,
      ...(result.newTotal != null ? { newTotal: result.newTotal } : {}),
    },
    { status },
  );
}
