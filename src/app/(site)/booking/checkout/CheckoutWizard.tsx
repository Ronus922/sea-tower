"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fmtHeWithDay, guestsSummary, type RoomParty } from "../dates";
import { PhoneField, COUNTRIES } from "./PhoneField";
import { CardPreview, CardStep, EMPTY_CARD, type CardDetails } from "./CardStep";
import { Confirmation } from "./Confirmation";

/* אשף ההזמנה — שלושה שלבים (פרטים → תשלום → אישור) לפי עיצוב "Sea Tower - תשלום".
   ללא חשבונות אורחים בשלב זה; הכרטיס נשמר כבטוחה מוצפנת ב-GuestHub. */

export type CheckoutQuote = {
  roomTypeId: string;
  preferredUnitId: string;
  title: string;
  image: { src: string; alt: string };
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: RoomParty[];
  pricePerNight: number;
  total: number;
  backHref: string;
};

export type GuestDetails = {
  firstName: string;
  lastName: string;
  iso: string;
  phone: string;
  email: string;
  emailConfirm: string;
};

const fmt = (n: number) => `₪${n.toLocaleString("en-US")}`;

const inputCls = (invalid?: boolean) =>
  `w-full rounded-[11px] border-[1.5px] px-[15px] py-[13px] text-[15px] text-[#14283d] outline-none transition-all focus:border-ocean-400 focus:shadow-[0_0_0_3px_rgba(43,127,184,0.12)] ${
    invalid ? "border-error" : "border-field"
  }`;

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1">
      <label className="mb-[7px] block text-[13px] font-semibold text-ink-dim" htmlFor={id}>
        {label} <span className="text-error">*</span>
      </label>
      {children}
      {error && <p className="mt-1.5 text-[12.5px] font-semibold text-error">{error}</p>}
    </div>
  );
}

/* ---------- מחוון שלבים ---------- */

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { num: 1, label: "פרטים" },
    { num: 2, label: "תשלום" },
    { num: 3, label: "אישור" },
  ];
  return (
    <div className="mx-auto mb-10 flex max-w-[580px] items-center">
      {steps.map((s, i) => (
        <div key={s.num} className="flex min-w-0 flex-1 items-center last:flex-none">
          <div className="flex w-16 shrink-0 flex-col items-center gap-2">
            <div
              className={`flex size-[42px] items-center justify-center rounded-full text-[16px] font-extrabold transition-all ${
                step >= s.num ? "bg-ocean-400 text-white" : "bg-[#e3ebf2] text-ink-muted"
              }`}
            >
              {step > s.num ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 13l4 4 10-10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                s.num
              )}
            </div>
            <span
              className={`text-[13px] font-bold whitespace-nowrap ${step >= s.num ? "text-navy-800" : "text-ink-muted"}`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mx-1 mb-[26px] h-[3px] flex-1 rounded-sm transition-all ${
                step > s.num ? "bg-ocean-400" : "bg-[#e3ebf2]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------- בר סיכום דביק ---------- */

function SummaryBar({ quote }: { quote: CheckoutQuote }) {
  return (
    <div className="sticky top-0 z-40 bg-navy-800 text-white shadow-[0_6px_20px_rgba(10,29,49,0.2)]">
      <div
        id="pay-summary"
        className="mx-auto flex max-w-shell flex-wrap items-center gap-x-[22px] gap-y-2.5 px-5 py-3.5 sm:px-8 lg:px-14"
      >
        <div className="flex shrink-0 items-center gap-3.5">
          <span className="relative block size-[62px] shrink-0 overflow-hidden rounded-xl">
            <Image src={quote.image.src} alt={quote.image.alt} fill sizes="62px" className="object-cover" />
          </span>
          <span className="leading-tight">
            <span className="block text-[11.5px] font-semibold tracking-label text-[#7cb4dc]">
              החדר שנבחר
            </span>
            <span className="block text-[17px] font-extrabold text-white">{quote.title}</span>
          </span>
        </div>
        <div className="hidden h-10 w-px shrink-0 bg-white/15 md:block" />
        <div className="flex flex-1 flex-wrap items-center gap-x-[26px] gap-y-2.5">
          <div>
            <div className="mb-0.5 text-[11.5px] font-semibold text-[#9fc0d8]">הגעה</div>
            <div className="text-[14.5px] font-bold">{fmtHeWithDay(quote.checkIn)}</div>
          </div>
          <svg className="opacity-50" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <div className="mb-0.5 text-[11.5px] font-semibold text-[#9fc0d8]">עזיבה</div>
            <div className="text-[14.5px] font-bold">{fmtHeWithDay(quote.checkOut)}</div>
          </div>
          <span className="flex items-center gap-[7px] rounded-[9px] bg-white/10 px-[13px] py-[7px] text-[13.5px] font-semibold text-[#cfe2ef]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" stroke="var(--color-aqua)" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            {quote.nights === 1 ? "לילה אחד" : `${quote.nights} לילות`}
          </span>
          <span className="flex items-center gap-[7px] rounded-[9px] bg-white/10 px-[13px] py-[7px] text-[13.5px] font-semibold text-[#cfe2ef]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="9" cy="8" r="3" stroke="var(--color-aqua)" strokeWidth="1.6" />
              <path d="M3.5 18c0-2.8 2.5-4.5 5.5-4.5s5.5 1.7 5.5 4.5M16 6a2.6 2.6 0 010 5" stroke="var(--color-aqua)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {guestsSummary(quote.rooms)}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-[18px]">
          <div className="text-left">
            <div className="text-[11.5px] font-semibold text-[#9fc0d8]">סה״כ לתשלום</div>
            <div className="text-[23px] leading-tight font-extrabold text-white">{fmt(quote.total)}</div>
          </div>
          <Link
            href={quote.backHref}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] border border-aqua/40 px-[15px] py-[9px] text-[13.5px] font-bold whitespace-nowrap text-aqua"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12h16M10 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            שינוי
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------- סיכום צד ---------- */

function AsideSummary({ quote, total }: { quote: CheckoutQuote; total: number }) {
  return (
    <>
      <div className="mb-[18px] flex items-center gap-[13px] border-b border-chip pb-[18px]">
        <span className="relative block size-16 shrink-0 overflow-hidden rounded-xl">
          <Image src={quote.image.src} alt={quote.image.alt} fill sizes="64px" className="object-cover" />
        </span>
        <div>
          <div className="text-[16px] leading-tight font-extrabold text-navy-800">{quote.title}</div>
          <div className="mt-0.5 text-[12.5px] font-medium text-ink-dim">בניין אלמוג · נוף לים</div>
        </div>
      </div>
      <div className="mb-[18px] flex flex-col gap-[11px] border-b border-chip pb-[18px] text-[14px] text-ink-strong">
        <div className="flex justify-between">
          <span className="text-ink-dim">צ׳ק־אין</span>
          <span className="font-bold">{fmtHeWithDay(quote.checkIn)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-dim">צ׳ק־אאוט</span>
          <span className="font-bold">{fmtHeWithDay(quote.checkOut)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-dim">אורחים</span>
          <span className="font-bold">{guestsSummary(quote.rooms)}</span>
        </div>
      </div>
      <div className="mb-[18px] flex flex-col gap-[11px] border-b border-chip pb-[18px] text-[14px] text-ink-strong">
        <div className="flex justify-between">
          <span className="text-ink-dim">
            {quote.rooms.length > 1
              ? `${quote.rooms.length} דירות · ${quote.nights === 1 ? "לילה" : `${quote.nights} לילות`}`
              : `${fmt(quote.pricePerNight)} × ${quote.nights === 1 ? "לילה" : `${quote.nights} לילות`}`}
          </span>
          <span className="font-bold">{fmt(total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-dim">ניקיון ומצעים</span>
          <span className="font-bold text-success">כלול</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-dim">מע״מ</span>
          <span className="font-bold text-success">כלול</span>
        </div>
      </div>
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-[16px] font-extrabold text-navy-800">סה״כ לתשלום</span>
        <span className="text-[26px] font-extrabold text-navy-800">{fmt(total)}</span>
      </div>
      <div className="flex items-center gap-2 rounded-[11px] bg-success-bg px-3.5 py-[11px] text-[12.5px] font-semibold text-success">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        ביטול חינם עד 48 שעות לפני ההגעה
      </div>
    </>
  );
}

/* ---------- שלב 1: פרטי המזמין ---------- */

function GuestStep({
  guest,
  onChange,
  onNext,
}: {
  guest: GuestDetails;
  onChange: (g: GuestDetails) => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (guest.firstName.trim().length < 2) e.firstName = "נא למלא שם פרטי";
    if (guest.lastName.trim().length < 2) e.lastName = "נא למלא שם משפחה";
    const digits = guest.phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 12) e.phone = "נא למלא מספר טלפון תקין";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(guest.email.trim())) e.email = "כתובת הדוא״ל אינה תקינה";
    if (guest.emailConfirm.trim() !== guest.email.trim() || !guest.email.trim())
      e.emailConfirm = "כתובות הדוא״ל אינן תואמות";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="rounded-[20px] bg-white px-6 py-8 shadow-e2 md:px-9 md:py-[34px]">
      <h2 className="mb-1.5 text-[25px] font-extrabold tracking-heading text-navy-800">פרטי המזמין</h2>
      <p className="mb-[26px] text-[14.5px] text-ink-dim">
        אישור ההזמנה ופרטי ההגעה יישלחו לפרטים שתמלאו כאן.
      </p>

      <div className="mb-4 flex gap-3.5 max-sm:flex-col">
        <Field id="bk-first" label="שם פרטי" error={errors.firstName}>
          <input
            id="bk-first"
            type="text"
            autoComplete="given-name"
            placeholder="ישראל"
            value={guest.firstName}
            onChange={(e) => onChange({ ...guest, firstName: e.target.value })}
            className={inputCls(!!errors.firstName)}
          />
        </Field>
        <Field id="bk-last" label="שם משפחה" error={errors.lastName}>
          <input
            id="bk-last"
            type="text"
            autoComplete="family-name"
            placeholder="ישראלי"
            value={guest.lastName}
            onChange={(e) => onChange({ ...guest, lastName: e.target.value })}
            className={inputCls(!!errors.lastName)}
          />
        </Field>
      </div>

      <div className="mb-4">
        <PhoneField
          iso={guest.iso}
          value={guest.phone}
          error={errors.phone}
          onIsoChange={(iso) => onChange({ ...guest, iso })}
          onValueChange={(phone) => onChange({ ...guest, phone })}
        />
      </div>

      <div className="mb-4">
        <Field id="bk-email" label="דואר אלקטרוני" error={errors.email}>
          <input
            id="bk-email"
            type="email"
            autoComplete="email"
            placeholder="name@email.com"
            dir="ltr"
            value={guest.email}
            onChange={(e) => onChange({ ...guest, email: e.target.value })}
            className={`${inputCls(!!errors.email)} text-right`}
          />
        </Field>
      </div>
      <div className="mb-[26px]">
        <Field id="bk-email2" label="אישור דואר אלקטרוני" error={errors.emailConfirm}>
          <input
            id="bk-email2"
            type="email"
            autoComplete="email"
            placeholder="name@email.com"
            dir="ltr"
            value={guest.emailConfirm}
            onChange={(e) => onChange({ ...guest, emailConfirm: e.target.value })}
            className={`${inputCls(!!errors.emailConfirm)} text-right`}
          />
        </Field>
      </div>

      <button
        type="button"
        onClick={() => {
          if (validate()) onNext();
        }}
        className="flex w-full items-center justify-center gap-[9px] rounded-xl bg-[linear-gradient(135deg,var(--color-sea-500),var(--color-ocean-400))] px-4 py-[15px] text-[16.5px] font-bold text-white shadow-[0_12px_26px_rgba(43,127,184,0.32)]"
      >
        המשך לתשלום
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/* ---------- האשף ---------- */

export function CheckoutWizard({ quote }: { quote: CheckoutQuote }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [guest, setGuest] = useState<GuestDetails>({
    firstName: "",
    lastName: "",
    iso: "IL",
    phone: "",
    email: "",
    emailConfirm: "",
  });
  const [card, setCard] = useState<CardDetails>(EMPTY_CARD);
  const [total, setTotal] = useState(quote.total);
  const [confirmation, setConfirmation] = useState<{ reservationNumber: string; total: number } | null>(null);

  const go = (n: 1 | 2 | 3) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toPayment = () => {
    /* ברירת מחדל לשם בעל הכרטיס — שם המזמין */
    if (!card.holder) setCard({ ...card, holder: `${guest.firstName} ${guest.lastName}`.trim() });
    go(2);
  };

  const dial = COUNTRIES.find((c) => c.iso === guest.iso)?.dial ?? "+972";
  const fullPhone = `${dial}${guest.phone.replace(/\D/g, "").replace(/^0/, "")}`;

  const submitBooking = async (card: CardDetails) => {
    const res = await fetch("/api/booking/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        checkIn: quote.checkIn,
        checkOut: quote.checkOut,
        roomTypeId: quote.roomTypeId,
        preferredUnitId: quote.preferredUnitId,
        rooms: quote.rooms,
        expectedTotal: total,
        guest: {
          firstName: guest.firstName.trim(),
          lastName: guest.lastName.trim(),
          phone: fullPhone,
          email: guest.email.trim(),
        },
        card: {
          pan: card.number.replace(/\D/g, ""),
          cvv: card.cvv,
          holderName: card.holder.trim(),
          holderIdNumber: card.idNumber || null,
          expMonth: Number(card.expiry.slice(0, 2)),
          expYear: 2000 + Number(card.expiry.slice(3, 5)),
        },
        consents: card.consents,
      }),
    });
    const data = (await res.json()) as {
      ok: boolean;
      reservationNumber?: string;
      total?: number;
      code?: string;
      error?: string;
      newTotal?: number;
    };
    if (data.ok && data.reservationNumber) {
      setConfirmation({ reservationNumber: data.reservationNumber, total: data.total ?? total });
      setCard(EMPTY_CARD); /* פרטי הכרטיס נמחקים מהזיכרון מיד עם ההצלחה */
      go(3);
      return null;
    }
    if (data.code === "price_changed" && data.newTotal != null) {
      setTotal(data.newTotal);
      return { message: `${data.error ?? "המחיר התעדכן"} — הסכום המעודכן: ${fmt(data.newTotal)}` };
    }
    return { message: data.error ?? "אירעה שגיאה, נסו שוב", backToSearch: data.code === "no_availability" };
  };

  return (
    <div className="min-h-screen bg-cloud">
      <SummaryBar quote={{ ...quote, total }} />

      <section className="px-5 pt-10 pb-[130px] sm:px-8 md:pb-[190px] lg:px-14">
        <div className="mx-auto max-w-shell">
          <StepIndicator step={step} />

          {step < 3 ? (
            <div className="flex items-start gap-7 max-lg:flex-col">
              <div className="min-w-0 flex-[1.7] max-lg:w-full">
                {step === 1 ? (
                  <GuestStep guest={guest} onChange={setGuest} onNext={toPayment} />
                ) : (
                  <CardStep
                    card={card}
                    onChange={setCard}
                    total={total}
                    onBack={() => go(1)}
                    onSubmit={submitBooking}
                    backHref={quote.backHref}
                  />
                )}
              </div>
              <aside className="w-full flex-1 rounded-[20px] bg-white p-[26px] shadow-e2 lg:sticky lg:top-24">
                {step === 2 && <CardPreview card={card} />}
                <AsideSummary quote={quote} total={total} />
              </aside>
            </div>
          ) : (
            confirmation && (
              <Confirmation
                quote={quote}
                reservationNumber={confirmation.reservationNumber}
                total={confirmation.total}
              />
            )
          )}

          <div className="mt-[34px] flex flex-wrap items-center justify-center gap-[22px] text-[13px] font-semibold text-[#7c93a6]">
            <span className="inline-flex items-center gap-[7px]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              פרטי הכרטיס מוצפנים
            </span>
            <span className="inline-flex items-center gap-[7px]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              הנתונים שלכם מוגנים
            </span>
            <span className="inline-flex items-center gap-[7px]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              ביטול חינם עד 48 שעות
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
