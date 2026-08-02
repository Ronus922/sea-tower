"use client";

import { useState } from "react";
import Link from "next/link";

/* שלב התשלום — טופס כרטיס אשראי עם זיהוי מותג חי, הסכמות וכפתור אישור,
   ותצוגת כרטיס מונפשת (CardPreview, מוצגת ב-aside). הכרטיס נשמר כבטוחה
   מוצפנת ב-GuestHub — אין סליקה באתר. PAN/CVV חיים רק ב-state עד השליחה. */

export type CardDetails = {
  holder: string;
  number: string;
  expiry: string;
  cvv: string;
  idNumber: string;
  consents: { terms: boolean; privacy: boolean; marketing: boolean };
};

export const EMPTY_CARD: CardDetails = {
  holder: "",
  number: "",
  expiry: "",
  cvv: "",
  idNumber: "",
  consents: { terms: false, privacy: false, marketing: false },
};

type Brand = "visa" | "mc" | "amex" | "isracard" | "";

function detectBrand(digits: string): Brand {
  if (/^3[47]/.test(digits)) return "amex";
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mc";
  if (/^[6-9]/.test(digits)) return "isracard";
  return "";
}

function luhnValid(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

const fmt = (n: number) => `₪${n.toLocaleString("en-US")}`;

const inputCls = (invalid?: boolean) =>
  `w-full rounded-[11px] border-[1.5px] px-[15px] py-[13px] text-[15px] text-[#14283d] outline-none transition-all focus:border-ocean-400 focus:shadow-[0_0_0_3px_rgba(43,127,184,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-400 ${
    invalid ? "border-error" : "border-field"
  }`;

/* ---------- לוגו מותגים (SVG מהעיצוב) ---------- */

function BrandBadge({ active, dimmed, children }: { active: boolean; dimmed: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex rounded-[5px] transition-all ${active ? "shadow-[0_0_0_2px_var(--color-ocean-400)]" : ""} ${
        dimmed ? "opacity-30 grayscale" : ""
      }`}
    >
      {children}
    </span>
  );
}

function BrandRow({ brand }: { brand: Brand }) {
  const state = (k: Brand) => ({ active: brand === k, dimmed: brand !== "" && brand !== k });
  return (
    <div className="flex items-center gap-1.5">
      <BrandBadge {...state("isracard")}>
        <svg width="40" height="26" viewBox="0 0 40 26" aria-label="ישראכרט">
          <rect width="40" height="26" rx="3" fill="#fff" stroke="#e6edf3" />
          <polygon points="15,3 24,13 15,23 6,13" fill="#d81f26" />
          <polygon points="25,3 34,13 25,23 16,13" fill="#1b3a8f" />
          <rect x="1" y="9.3" width="38" height="7.4" fill="#fff" />
          <text x="20" y="15" fontFamily="Arial" fontSize="7" fontWeight="bold" fill="#1b3a8f" textAnchor="middle" letterSpacing="-.3">
            ישראכרט
          </text>
        </svg>
      </BrandBadge>
      <BrandBadge {...state("amex")}>
        <svg width="40" height="26" viewBox="0 0 40 26" aria-label="American Express">
          <rect width="40" height="26" rx="3" fill="#2671B9" />
          <rect x="3" y="3.5" width="34" height="19" rx="1" fill="none" stroke="#fff" strokeWidth="1" />
          <text x="20" y="12" fontFamily="Arial" fontSize="5.1" fontWeight="bold" fill="#fff" textAnchor="middle" letterSpacing=".2">
            AMERICAN
          </text>
          <text x="20" y="18.5" fontFamily="Arial" fontSize="5.1" fontWeight="bold" fill="#fff" textAnchor="middle" letterSpacing=".2">
            EXPRESS
          </text>
        </svg>
      </BrandBadge>
      <BrandBadge {...state("visa")}>
        <svg width="40" height="26" viewBox="0 0 40 26" aria-label="Visa">
          <rect width="40" height="26" rx="3" fill="#fff" stroke="#e6edf3" />
          <text x="20" y="15.5" fontFamily="Arial" fontSize="11" fontWeight="bold" fontStyle="italic" fill="#1A1F71" textAnchor="middle" letterSpacing=".3">
            VISA
          </text>
          <rect x="9" y="18" width="22" height="2" fill="#F7A600" />
        </svg>
      </BrandBadge>
      <BrandBadge {...state("mc")}>
        <svg width="40" height="26" viewBox="0 0 40 26" aria-label="Mastercard">
          <rect width="40" height="26" rx="3" fill="#fff" stroke="#e6edf3" />
          <circle cx="16" cy="12" r="7.3" fill="#EB001B" />
          <circle cx="24" cy="12" r="7.3" fill="#F79F1A" />
          <path d="M20 6.4a7.3 7.3 0 000 11.2 7.3 7.3 0 000-11.2z" fill="#FF5F00" />
        </svg>
      </BrandBadge>
    </div>
  );
}

/* ---------- תצוגת כרטיס חיה (aside, לפי העיצוב) ---------- */

export function CardPreview({ card }: { card: CardDetails }) {
  const digits = card.number.replace(/\D/g, "");
  const brand = detectBrand(digits);
  let pn = "";
  for (let i = 0; i < 16; i++) pn += i < digits.length ? digits[i] : "•";
  pn = pn.replace(/(.{4})/g, "$1 ").trim();
  const brandName = { visa: "VISA", mc: "Mastercard", amex: "AMEX", isracard: "isracard", "": "CARD" }[brand];

  return (
    <div
      dir="ltr"
      className="relative mb-[22px] flex aspect-[1.586/1] flex-col justify-between overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,var(--color-navy-800),var(--color-ocean-600))] p-6 text-white shadow-[0_14px_30px_rgba(14,37,64,0.3)]"
    >
      <div
        aria-hidden="true"
        className="absolute -top-[30px] -right-[25px] size-[140px] rounded-full bg-[radial-gradient(circle,rgba(124,208,247,0.25),transparent_70%)]"
      />
      <div className="relative z-[1] flex items-center justify-between">
        <div className="h-[31px] w-[42px] rounded-[7px] bg-[linear-gradient(135deg,#f0d488,#cda53a)]" />
        <span className="text-[15px] font-extrabold tracking-[0.5px]">{brandName}</span>
      </div>
      <div className="relative z-[1] text-[20px] font-semibold tracking-[2px] whitespace-nowrap">{pn}</div>
      <div className="relative z-[1] flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-[3px] text-[8.5px] tracking-[0.5px] opacity-60">CARD HOLDER</div>
          <div className="max-w-[150px] overflow-hidden text-[13px] font-semibold text-ellipsis whitespace-nowrap">
            {card.holder ? card.holder.toUpperCase() : "שם בעל הכרטיס"}
          </div>
        </div>
        <div className="shrink-0 text-left">
          <div className="mb-[3px] text-[8.5px] tracking-[0.5px] opacity-60">VALID THRU</div>
          <div className="text-[13px] font-semibold">{card.expiry || "MM/YY"}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- שלב הטופס ---------- */

type SubmitError = { message: string; backToSearch?: boolean } | null;

export function CardStep({
  card,
  onChange,
  total,
  onBack,
  onSubmit,
  backHref,
}: {
  card: CardDetails;
  onChange: (c: CardDetails) => void;
  total: number;
  onBack: () => void;
  onSubmit: (card: CardDetails) => Promise<SubmitError>;
  backHref: string;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<SubmitError>(null);
  const [sending, setSending] = useState(false);

  const digits = card.number.replace(/\D/g, "");
  const brand = detectBrand(digits);
  const consentsOk = card.consents.terms && card.consents.privacy;

  const set = (patch: Partial<CardDetails>) => onChange({ ...card, ...patch });
  const setNumber = (raw: string) =>
    set({ number: raw.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim() });
  const setExpiry = (raw: string) => {
    const d = raw.replace(/\D/g, "").slice(0, 4);
    set({ expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (card.holder.trim().length < 2) e.holder = "נא למלא את שם בעל הכרטיס";
    if (digits.length < 13 || digits.length > 19 || !luhnValid(digits)) e.number = "מספר הכרטיס אינו תקין";
    const m = /^(\d{2})\/(\d{2})$/.exec(card.expiry);
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) e.expiry = "תוקף אינו תקין";
    else {
      const now = new Date();
      const yy = 2000 + Number(m[2]);
      if (yy < now.getFullYear() || (yy === now.getFullYear() && Number(m[1]) < now.getMonth() + 1))
        e.expiry = "תוקף הכרטיס פג";
    }
    if (!/^\d{3,4}$/.test(card.cvv)) e.cvv = "CVV אינו תקין";
    if (!/^\d{5,9}$/.test(card.idNumber)) e.idNumber = "תעודת זהות אינה תקינה";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!consentsOk || sending) return;
    if (!validate()) return;
    setSending(true);
    setServerError(null);
    try {
      const err = await onSubmit(card);
      if (err) setServerError(err);
    } catch {
      setServerError({ message: "אירעה שגיאה, נסו שוב" });
    } finally {
      setSending(false);
    }
  };

  const consentRow = (
    key: "terms" | "privacy" | "marketing",
    label: React.ReactNode,
  ) => (
    <label className="flex cursor-pointer items-start gap-[11px] text-[13.5px] leading-relaxed text-ink-strong">
      <input
        type="checkbox"
        checked={card.consents[key]}
        onChange={() => set({ consents: { ...card.consents, [key]: !card.consents[key] } })}
        className="mt-px size-[19px] shrink-0 cursor-pointer accent-[var(--color-ocean-400)]"
      />
      <span>{label}</span>
    </label>
  );

  return (
    <div className="rounded-[20px] bg-white px-6 py-8 shadow-e2 md:px-9 md:py-[34px]">
      <h2 className="mb-1.5 text-[25px] font-extrabold tracking-heading text-navy-800">פרטי תשלום</h2>
      <p className="mb-[26px] text-[14.5px] text-ink-dim">
        הפרטים מאובטחים ומוצפנים. הכרטיס משמש כבטוחה להזמנה — החיוב יתבצע בהתאם למדיניות
        ההזמנות והביטולים.
      </p>

      <div className="mb-4">
        <label className="mb-[7px] block text-[13px] font-semibold text-ink-dim" htmlFor="cc-holder">
          שם בעל הכרטיס <span className="text-error">*</span>
        </label>
        <input
          id="cc-holder"
          type="text"
          autoComplete="cc-name"
          placeholder="כפי שמופיע על הכרטיס"
          value={card.holder}
          onChange={(e) => set({ holder: e.target.value })}
          className={inputCls(!!errors.holder)}
        />
        {errors.holder && <p className="mt-1.5 text-[12.5px] font-semibold text-error">{errors.holder}</p>}
      </div>

      <div className="mb-4">
        <div className="mb-[7px] flex items-center justify-between gap-2">
          <label className="text-[13px] font-semibold whitespace-nowrap text-ink-dim" htmlFor="cc-number">
            מספר כרטיס <span className="text-error">*</span>
          </label>
          <BrandRow brand={brand} />
        </div>
        <input
          id="cc-number"
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          dir="ltr"
          value={card.number}
          onChange={(e) => setNumber(e.target.value)}
          className={`${inputCls(!!errors.number)} text-right tracking-[1px]`}
        />
        {errors.number && <p className="mt-1.5 text-[12.5px] font-semibold text-error">{errors.number}</p>}
      </div>

      <div className="mb-4 flex gap-3.5 max-sm:flex-col">
        <div className="flex-1">
          <label className="mb-[7px] block text-[13px] font-semibold text-ink-dim" htmlFor="cc-exp">
            תוקף <span className="text-error">*</span>
          </label>
          <input
            id="cc-exp"
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            dir="ltr"
            value={card.expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className={`${inputCls(!!errors.expiry)} text-right`}
          />
          {errors.expiry && <p className="mt-1.5 text-[12.5px] font-semibold text-error">{errors.expiry}</p>}
        </div>
        <div className="flex-1">
          <label className="mb-[7px] block text-[13px] font-semibold text-ink-dim" htmlFor="cc-cvv">
            CVV <span className="text-error">*</span>
          </label>
          <input
            id="cc-cvv"
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            dir="ltr"
            maxLength={4}
            value={card.cvv}
            onChange={(e) => set({ cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
            className={`${inputCls(!!errors.cvv)} text-right`}
          />
          {errors.cvv && <p className="mt-1.5 text-[12.5px] font-semibold text-error">{errors.cvv}</p>}
        </div>
      </div>

      <div className="mb-[22px]">
        <label className="mb-[7px] block text-[13px] font-semibold text-ink-dim" htmlFor="cc-id">
          תעודת זהות <span className="text-error">*</span>
        </label>
        <input
          id="cc-id"
          type="text"
          inputMode="numeric"
          placeholder="9 ספרות"
          dir="ltr"
          value={card.idNumber}
          onChange={(e) => set({ idNumber: e.target.value.replace(/\D/g, "").slice(0, 9) })}
          className={`${inputCls(!!errors.idNumber)} text-right`}
        />
        {errors.idNumber && <p className="mt-1.5 text-[12.5px] font-semibold text-error">{errors.idNumber}</p>}
      </div>

      <div className="mb-6 flex flex-col gap-3.5 border-t border-chip pt-5">
        {consentRow(
          "terms",
          <>
            קראתי ואישרתי את{" "}
            <Link href="/terms" className="font-bold text-ocean-400" target="_blank">
              מדיניות ההזמנות והביטולים
            </Link>{" "}
            <span className="text-error">*</span>
          </>,
        )}
        {consentRow(
          "privacy",
          <>
            קראתי את המידע אודות השימוש בפרטים האישיים שלי ואני מאשר/ת את השימוש —{" "}
            <Link href="/terms" className="font-bold text-ocean-400" target="_blank">
              מדיניות פרטיות
            </Link>{" "}
            <span className="text-error">*</span>
          </>,
        )}
        {consentRow("marketing", "מאשר/ת קבלת דברי פרסום והודעות על מבצעים ממגדל הים")}
      </div>

      {/* role=alert: כשל תשלום היה עד כה שקט לחלוטין לקורא מסך */}
      {serverError && (
        <div
          role="alert"
          className="mb-4 rounded-[11px] border border-error-line bg-error-bg px-4 py-3 text-[14px] font-semibold text-error"
        >
          {serverError.message}
          {serverError.backToSearch && (
            <>
              {" "}
              <Link href={backHref} className="underline">
                חזרה לחיפוש
              </Link>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!consentsOk || sending}
        aria-describedby={!consentsOk ? "pay-consent-hint" : undefined}
        className={`flex w-full items-center justify-center gap-[9px] rounded-xl px-4 py-[15px] text-[16.5px] font-bold text-white transition-all ${
          !consentsOk || sending
            ? "cursor-not-allowed bg-[#c2d2df]"
            : "bg-[linear-gradient(135deg,var(--color-sea-500),var(--color-ocean-400))] shadow-[0_12px_26px_rgba(43,127,184,0.32)]"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="11" width="14" height="9" rx="2" stroke="#fff" strokeWidth="1.7" />
          <path d="M8 11V8a4 4 0 018 0v3" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        {sending ? "מאשרים את ההזמנה…" : `אישור הזמנה מאובטח — ${fmt(total)}`}
      </button>
      {/* קודם לכן הכפתור פשוט היה אפור, בלי שום הסבר מה חוסם את ההמשך */}
      {!consentsOk && (
        <p id="pay-consent-hint" className="mt-2 text-center text-[13px] font-semibold text-ink-dim">
          כדי להמשיך יש לאשר את התקנון ואת מדיניות הפרטיות.
        </p>
      )}
      <button
        type="button"
        onClick={onBack}
        className="mt-3.5 w-full p-1.5 text-[14px] font-bold text-ink-dim"
      >
        חזרה לפרטים
      </button>
    </div>
  );
}
