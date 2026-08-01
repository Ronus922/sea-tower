"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { BUSINESS } from "@/lib/business";
import { fmtRange, type RoomParty } from "../dates";
import type { CheckoutQuote } from "./CheckoutWizard";

/* שלב האישור — קונפטי, מספר הזמנה אמיתי מ-GuestHub וסיכום, לפי העיצוב */

const fmt = (n: number) => `₪${n.toLocaleString("en-US")}`;

const CONFETTI_COLORS = ["#3a9bd6", "#7cd0f7", "#2b7fb8", "#f0d488", "#2f7d52", "#ffffff"];

export function Confirmation({
  quote,
  reservationNumber,
  total,
}: {
  quote: CheckoutQuote;
  reservationNumber: string;
  total: number;
}) {
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = confettiRef.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.innerHTML = "";
    for (let i = 0; i < 70; i++) {
      const p = document.createElement("div");
      const w = 6 + Math.random() * 8;
      p.style.cssText = `position:absolute;top:-24px;left:${Math.random() * 100}%;width:${w}px;height:${w * 0.5}px;background:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};opacity:.92;border-radius:1px;transform:rotate(${Math.random() * 360}deg);animation:stConfetti ${2.6 + Math.random() * 2.2}s linear ${Math.random() * 0.7}s forwards`;
      root.appendChild(p);
    }
    const t = setTimeout(() => {
      root.innerHTML = "";
    }, 6500);
    return () => clearTimeout(t);
  }, []);

  const nightsLabel = quote.nights === 1 ? "לילה אחד" : `${quote.nights} לילות`;
  const roomsLabel = (rooms: RoomParty[]) =>
    rooms.length === 1 ? quote.title : `${quote.title} × ${rooms.length}`;

  return (
    <div className="relative mx-auto max-w-[560px] overflow-hidden rounded-[22px] bg-white p-8 text-center shadow-e2 md:px-11 md:py-[46px]">
      <div ref={confettiRef} className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" />
      <div className="relative z-[1] mx-auto mb-6 flex size-[78px] items-center justify-center rounded-full bg-success-bg">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="var(--color-success)" strokeWidth="1.6" />
          <path d="M7.5 12.5l3 3 6-6.5" stroke="var(--color-success)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="mb-2.5 text-[30px] font-extrabold tracking-heading text-navy-800">
        ההזמנה אושרה!
      </h2>
      <p className="mb-[26px] text-[16px] leading-relaxed text-ink-dim">
        תודה שבחרתם במגדל הים. שמרו את מספר האישור — ניצור איתכם קשר עם כל פרטי ההגעה
        והצ׳ק־אין.
      </p>
      <div className="mb-7 rounded-[14px] bg-mist px-6 py-5 text-right">
        <div className="mb-[11px] flex justify-between">
          <span className="text-[13.5px] text-ink-dim">מספר אישור</span>
          <span dir="ltr" className="text-[14.5px] font-extrabold text-navy-800">
            {reservationNumber}
          </span>
        </div>
        <div className="mb-[11px] flex justify-between">
          <span className="text-[13.5px] text-ink-dim">החדר</span>
          <span className="text-[14.5px] font-bold text-navy-800">{roomsLabel(quote.rooms)}</span>
        </div>
        <div className="mb-[11px] flex justify-between">
          <span className="text-[13.5px] text-ink-dim">תאריכים</span>
          <span className="text-[14.5px] font-bold text-navy-800">
            {fmtRange(quote.checkIn, quote.checkOut)} · {nightsLabel}
          </span>
        </div>
        <div className="flex justify-between border-t border-[#e6edf3] pt-[11px]">
          <span className="text-[14px] font-extrabold text-navy-800">סה״כ להזמנה</span>
          <span className="text-[16px] font-extrabold text-success">{fmt(total)}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--color-sea-500),var(--color-ocean-400))] px-[26px] py-[13px] text-[15.5px] font-bold text-white shadow-[0_10px_24px_rgba(43,127,184,0.3)]"
        >
          חזרה לדף הבית
        </Link>
        <a
          href={BUSINESS.phones.office.tel}
          className="inline-flex items-center gap-2 rounded-xl border border-field px-[22px] py-[13px] text-[15.5px] font-bold text-ink-strong"
        >
          צרו קשר · {BUSINESS.phones.office.label}
        </a>
      </div>
    </div>
  );
}
