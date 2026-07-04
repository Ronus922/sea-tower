"use client";

import { useRef, useState } from "react";
import { INQUIRY_TYPES, whatsappUrl } from "@/lib/business";

/* טופס צור קשר — שולח ל-/api/leads (אימות מלא גם בשרת).
   data-wired על ה-form מונע מ-MotionEngine לחווט אליו את זרימת הדמו */

type FormState = {
  name: string;
  phone: string;
  email: string;
  inquiryType: string;
  arrival: string;
  departure: string;
  guests: string;
  message: string;
  privacy: boolean;
};

type Status = "idle" | "validating" | "submitting" | "success" | "error";

const EMPTY: FormState = {
  name: "",
  phone: "",
  email: "",
  inquiryType: "",
  arrival: "",
  departure: "",
  guests: "",
  message: "",
  privacy: false,
};

const FIELD =
  "h-12 w-full rounded-btn border border-field bg-[#f7fafc] px-3.5 text-[15px] text-[#14283d] placeholder:text-ink-muted";
const LABEL = "mb-[7px] block text-[13px] font-semibold text-ink-dim";
const ERR = "mt-1.5 text-[13px] font-semibold text-error";

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const today = todayLocal();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function validate(): Partial<Record<keyof FormState, string>> {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 2) e.name = "נא למלא שם מלא";
    if (!/^\+?\d{8,15}$/.test(form.phone.replace(/[\s\-().]/g, ""))) {
      e.phone = "נא למלא מספר טלפון תקין";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      e.email = "כתובת הדוא״ל אינה תקינה";
    }
    if (!form.inquiryType) e.inquiryType = "נא לבחור סוג פנייה";
    if (form.arrival && form.arrival < today) e.arrival = "תאריך ההגעה לא יכול להיות בעבר";
    if (form.departure) {
      if (!form.arrival) e.departure = "נא לבחור קודם תאריך הגעה";
      else if (form.departure <= form.arrival) {
        e.departure = "תאריך העזיבה חייב להיות אחרי תאריך ההגעה";
      }
    }
    if (form.message.length > 1500) e.message = "ההודעה ארוכה מדי";
    if (!form.privacy) e.privacy = "נא לאשר את שליחת הפרטים";
    return e;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("validating");
    setServerError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus("idle");
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"], .stm-invalid')
          ?.focus();
      });
      return;
    }
    setStatus("submitting");
    try {
      const honeypot = formRef.current?.querySelector<HTMLInputElement>('input[name="company"]');
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, company: honeypot?.value ?? "" }),
      });
      const data: { ok?: boolean; error?: string; fieldErrors?: Record<string, string> } | null =
        await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setStatus("success");
      } else {
        if (data?.fieldErrors) setErrors(data.fieldErrors);
        setServerError(
          data?.error ?? "לא הצלחנו לשלוח את הפנייה כרגע. נסו שוב או פנו אלינו ב־WhatsApp."
        );
        setStatus("error");
      }
    } catch {
      setServerError("לא הצלחנו לשלוח את הפנייה כרגע. נסו שוב או פנו אלינו ב־WhatsApp.");
      setStatus("error");
    }
  }

  function openWhatsApp() {
    const lines = [
      "שלום, אשמח לקבל הצעה לאירוח במגדל הים.",
      form.name && `שם: ${form.name}`,
      form.inquiryType && `סוג הפנייה: ${form.inquiryType}`,
      form.arrival && `הגעה: ${form.arrival}`,
      form.departure && `עזיבה: ${form.departure}`,
      form.guests && `אורחים: ${form.guests}`,
      form.message && `הודעה: ${form.message}`,
    ].filter(Boolean);
    window.open(whatsappUrl(lines.join("\n")), "_blank", "noopener");
  }

  const aria = (key: keyof FormState) =>
    errors[key]
      ? { "aria-invalid": true as const, "aria-describedby": `cf-${key}-err` }
      : {};
  const invalid = (key: keyof FormState) => (errors[key] ? " stm-invalid" : "");

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-success-bg ring-1 ring-success-line">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 13l4 4L19 7"
              stroke="var(--color-success)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="text-[24px] font-extrabold text-navy-800">תודה, הפרטים התקבלו</h3>
        <p className="text-[16px] text-ink">נציג שלנו יחזור אליכם בהקדם.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} data-wired="1" noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* honeypot — מוסתר מאנשים, בוטים ממלאים */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="cf-company">חברה</label>
        <input id="cf-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="cf-name" className={LABEL}>
            שם מלא <span aria-hidden="true" className="text-error">*</span>
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="השם שלכם"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={`${FIELD}${invalid("name")}`}
            {...aria("name")}
          />
          {errors.name && (
            <p id="cf-name-err" className={ERR}>
              {errors.name}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label htmlFor="cf-phone" className={LABEL}>
            טלפון <span aria-hidden="true" className="text-error">*</span>
          </label>
          <input
            id="cf-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            dir="ltr"
            placeholder="050-0000000"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={`${FIELD} text-left${invalid("phone")}`}
            {...aria("phone")}
          />
          {errors.phone && (
            <p id="cf-phone-err" className={ERR}>
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="cf-email" className={LABEL}>
            דוא״ל
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            placeholder="name@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={`${FIELD} text-left${invalid("email")}`}
            {...aria("email")}
          />
          {errors.email && (
            <p id="cf-email-err" className={ERR}>
              {errors.email}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label htmlFor="cf-type" className={LABEL}>
            סוג הפנייה <span aria-hidden="true" className="text-error">*</span>
          </label>
          <div className="relative">
            <select
              id="cf-type"
              name="inquiryType"
              required
              value={form.inquiryType}
              onChange={(e) => set("inquiryType", e.target.value)}
              className={`${FIELD} ctc-select appearance-none pl-10 ${
                form.inquiryType ? "" : "text-ink-muted"
              } ${errors.inquiryType ? "stm-invalid" : ""}`}
              aria-invalid={errors.inquiryType ? true : undefined}
              aria-describedby={errors.inquiryType ? "cf-type-err" : undefined}
            >
              <option value="" disabled>
                בחרו סוג פנייה
              </option>
              {INQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-dim"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {errors.inquiryType && (
            <p id="cf-type-err" className={ERR}>
              {errors.inquiryType}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="cf-arrival" className={LABEL}>
            תאריך הגעה
          </label>
          <input
            id="cf-arrival"
            name="arrival"
            type="date"
            min={today}
            value={form.arrival}
            onChange={(e) => set("arrival", e.target.value)}
            className={`${FIELD}${invalid("arrival")}`}
            {...aria("arrival")}
          />
          {errors.arrival && (
            <p id="cf-arrival-err" className={ERR}>
              {errors.arrival}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label htmlFor="cf-departure" className={LABEL}>
            תאריך עזיבה
          </label>
          <input
            id="cf-departure"
            name="departure"
            type="date"
            min={form.arrival || today}
            value={form.departure}
            onChange={(e) => set("departure", e.target.value)}
            className={`${FIELD}${invalid("departure")}`}
            {...aria("departure")}
          />
          {errors.departure && (
            <p id="cf-departure-err" className={ERR}>
              {errors.departure}
            </p>
          )}
        </div>
        <div className="sm:w-[150px]">
          <label htmlFor="cf-guests" className={LABEL}>
            מספר אורחים
          </label>
          <input
            id="cf-guests"
            name="guests"
            type="number"
            min={1}
            max={50}
            inputMode="numeric"
            placeholder="2"
            value={form.guests}
            onChange={(e) => set("guests", e.target.value)}
            className={`${FIELD}${invalid("guests")}`}
            {...aria("guests")}
          />
          {errors.guests && (
            <p id="cf-guests-err" className={ERR}>
              {errors.guests}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="cf-message" className={LABEL}>
          הודעה
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={4}
          maxLength={1500}
          placeholder="ספרו לנו בכמה מילים מה אתם צריכים"
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className={`${FIELD.replace("h-12", "")} min-h-[110px] resize-y py-3${invalid("message")}`}
          {...aria("message")}
        />
        {errors.message && (
          <p id="cf-message-err" className={ERR}>
            {errors.message}
          </p>
        )}
      </div>

      <div>
        {/* אזור מגע 44px לצ׳קבוקס דרך ריפוד ה-label */}
        <label htmlFor="cf-privacy" className="flex min-h-11 cursor-pointer items-center gap-2.5 py-1.5">
          <input
            id="cf-privacy"
            name="privacy"
            type="checkbox"
            required
            checked={form.privacy}
            onChange={(e) => set("privacy", e.target.checked)}
            aria-invalid={errors.privacy ? true : undefined}
            aria-describedby={errors.privacy ? "cf-privacy-err" : undefined}
            className="size-[18px] shrink-0 accent-[var(--color-ocean-400)]"
          />
          <span className="text-[13.5px] leading-snug text-ink">
            אני מאשר/ת את שליחת הפרטים בהתאם למדיניות הפרטיות
          </span>
        </label>
        {errors.privacy && (
          <p id="cf-privacy-err" className={ERR}>
            {errors.privacy}
          </p>
        )}
      </div>

      <div className="mt-1 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="stm-btn-primary inline-flex min-h-12 flex-1 items-center justify-center gap-[9px] rounded-btn bg-[linear-gradient(135deg,var(--color-sea-500),var(--color-ocean-400))] px-7 py-[15px] text-[16px] font-bold text-white shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-500 disabled:pointer-events-none disabled:opacity-85"
        >
          {status === "submitting" ? (
            <>
              <span className="stm-spin" aria-hidden="true" />
              שולחים…
            </>
          ) : (
            "שלחו לי הצעה"
          )}
        </button>
        <button
          type="button"
          onClick={openWhatsApp}
          className="stm-btn-outline inline-flex min-h-12 items-center justify-center gap-2 rounded-btn border border-edge px-5 py-3 text-[14.5px] font-semibold text-ocean-500 hover:border-ocean-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-500"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="M9.2 8.4c.5 3 3.4 5.9 6.4 6.4l.9-.9c.2-.2.6-.3.9-.1l1.5.7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          שליחה מהירה ב־WhatsApp
        </button>
      </div>

      {/* אזור סטטוס — aria-live קבוע כדי שהודעות יוקראו בלי לקפוץ בפריסה */}
      <div aria-live="polite">
        {status === "error" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-btn border border-error-line bg-error-bg px-4 py-3">
            <p className="text-[14px] font-semibold text-error">{serverError}</p>
            <button
              type="button"
              onClick={openWhatsApp}
              className="stm-link -my-2 min-h-11 py-2 text-[14px] font-bold text-ocean-400"
            >
              פנו אלינו ב־WhatsApp
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
