import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { INQUIRY_TYPES } from "@/lib/business";

/* קליטת לידים מטופס צור קשר: אימות, סניטציה, honeypot, rate-limit,
   מניעת כפילויות, ושמירה ב-sea_tower.leads דרך service_role בלבד */

const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 5;
const DUP_WINDOW_MS = 5 * 60_000;

/* ponytail: מוני in-memory — התהליך רץ כ-instance יחיד (systemd standalone).
   מעבר ל-multi-instance יחייב העברה ל-DB/Redis */
const rateHits = new Map<string, number[]>();
const recentSubmissions = new Map<string, number>();

function sanitize(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());
}

function todayInIsrael(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());
}

type FieldErrors = Record<string, string>;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "בקשה לא תקינה" }, { status: 400 });
  }

  /* honeypot — בוטים ממלאים את השדה הנסתר; מחזירים "הצלחה" בלי לשמור */
  if (sanitize(body.company, 100)) {
    return NextResponse.json({ ok: true });
  }

  /* rate limit לפי IP */
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const now = Date.now();
  const hits = (rateHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    return NextResponse.json(
      { ok: false, error: "נשלחו יותר מדי פניות. נסו שוב מאוחר יותר או פנו אלינו ב־WhatsApp." },
      { status: 429 }
    );
  }

  /* אימות + סניטציה */
  const name = sanitize(body.name, 80);
  const phoneRaw = sanitize(body.phone, 30);
  const phone = phoneRaw.replace(/[\s\-().]/g, "");
  const email = sanitize(body.email, 120);
  const inquiryType = sanitize(body.inquiryType, 40);
  const arrival = sanitize(body.arrival, 10);
  const departure = sanitize(body.departure, 10);
  const guestsRaw = sanitize(body.guests, 4);
  const message = sanitize(body.message, 1500);
  const privacy = body.privacy === true;

  const errors: FieldErrors = {};
  const today = todayInIsrael();

  if (name.length < 2) errors.name = "נא למלא שם מלא";
  if (!/^\+?\d{8,15}$/.test(phone)) errors.phone = "נא למלא מספר טלפון תקין";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "כתובת הדוא״ל אינה תקינה";
  }
  if (!(INQUIRY_TYPES as readonly string[]).includes(inquiryType)) {
    errors.inquiryType = "נא לבחור סוג פנייה";
  }
  if (arrival) {
    if (!isValidDate(arrival)) errors.arrival = "תאריך הגעה לא תקין";
    else if (arrival < today) errors.arrival = "תאריך ההגעה לא יכול להיות בעבר";
  }
  if (departure) {
    if (!isValidDate(departure)) errors.departure = "תאריך עזיבה לא תקין";
    else if (!arrival) errors.departure = "נא לבחור קודם תאריך הגעה";
    else if (departure <= arrival) errors.departure = "תאריך העזיבה חייב להיות אחרי תאריך ההגעה";
  }
  const guests = guestsRaw ? Number.parseInt(guestsRaw, 10) : null;
  if (guestsRaw && (!Number.isInteger(guests) || guests! < 1 || guests! > 50)) {
    errors.guests = "מספר אורחים לא תקין";
  }
  if (!privacy) errors.privacy = "נא לאשר את שליחת הפרטים";

  if (Object.keys(errors).length) {
    return NextResponse.json(
      { ok: false, error: "חלק מהפרטים חסרים או שגויים", fieldErrors: errors },
      { status: 422 }
    );
  }

  /* מניעת כפילויות — אותה פנייה בדיוק בתוך 5 דקות מוחזרת כהצלחה בלי insert נוסף */
  const dupKey = `${phone}|${name}|${inquiryType}|${message}`;
  const dupAt = recentSubmissions.get(dupKey);
  if (dupAt && now - dupAt < DUP_WINDOW_MS) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("leads: missing SUPABASE_SERVICE_ROLE_KEY / URL");
    return NextResponse.json(
      { ok: false, error: "לא הצלחנו לשלוח את הפנייה כרגע. נסו שוב או פנו אלינו ב־WhatsApp." },
      { status: 500 }
    );
  }

  const admin = createClient(url, serviceKey, {
    db: { schema: "sea_tower" },
    auth: { persistSession: false },
  });

  const { error } = await admin.from("leads").insert({
    name,
    phone: phoneRaw,
    email: email || null,
    inquiry_type: inquiryType,
    arrival_date: arrival || null,
    departure_date: departure || null,
    guests,
    message: message || null,
    source: "contact-page",
    ip,
    user_agent: sanitize(req.headers.get("user-agent"), 300) || null,
  });

  if (error) {
    console.error("leads insert failed:", error.message);
    return NextResponse.json(
      { ok: false, error: "לא הצלחנו לשלוח את הפנייה כרגע. נסו שוב או פנו אלינו ב־WhatsApp." },
      { status: 500 }
    );
  }

  rateHits.set(ip, [...hits, now]);
  recentSubmissions.set(dupKey, now);
  /* ניקוי רשומות ישנות כדי שהמפות לא יגדלו ללא גבול */
  if (recentSubmissions.size > 500) {
    for (const [k, t] of recentSubmissions) if (now - t > DUP_WINDOW_MS) recentSubmissions.delete(k);
  }
  if (rateHits.size > 500) {
    for (const [k, ts] of rateHits) {
      const live = ts.filter((t) => now - t < RATE_WINDOW_MS);
      if (live.length) rateHits.set(k, live);
      else rateHits.delete(k);
    }
  }

  return NextResponse.json({ ok: true });
}
