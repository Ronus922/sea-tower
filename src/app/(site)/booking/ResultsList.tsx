"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BookingItem } from "@/lib/booking-results";
import type { RoomImage } from "@/lib/rooms-view";

/* רשימת התוצאות — כרטיסי דירות בתצוגת שורות/גריד עם קרוסלת תמונות, לפי
   עיצוב מנוע ההזמנה. כל כרטיס הוא דירה פיזית אחת: המחיר והזמינות מגיעים
   מ-availability, והשם, הקופי, התמונות והמתקנים מקטלוג החדרים — מחוברים
   בשרת לפי roomId (ראו lib/booking-results.ts). */

const LOCATION_LINE = "בניין אלמוג · נוף חזיתי לים · 50 מ׳ מהחוף";

/* מדיניות ביטול של האתר, לא נתון של דירה — לא מגיעה מקטלוג התוכן */
const CANCELLATION = "ביטול חינם עד 48 שעות";

const fmt = (n: number) => `₪${n.toLocaleString("en-US")}`;

/* ---------- קרוסלה ---------- */

function Carousel({
  images,
  tag,
  sizes,
  heightClass,
}: {
  images: RoomImage[];
  tag: string | null;
  sizes: string;
  heightClass: string;
}) {
  const [idx, setIdx] = useState(0);
  const count = images.length;
  const step = (n: number) => setIdx((idx + n + count) % count);

  return (
    <div className={`relative overflow-hidden bg-[#dfe9f1] ${heightClass}`}>
      {images.map((im, i) => (
        <Image
          key={im.src + i}
          src={im.src}
          alt={im.alt}
          fill
          sizes={sizes}
          className={`object-cover transition-opacity duration-[400ms] ${i === idx ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="תמונה קודמת"
            onClick={() => step(-1)}
            className="absolute top-1/2 right-3 z-[6] flex size-[38px] -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy-800 shadow-[0_4px_12px_rgba(14,37,64,0.22)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="תמונה הבאה"
            onClick={() => step(1)}
            className="absolute top-1/2 left-3 z-[6] flex size-[38px] -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy-800 shadow-[0_4px_12px_rgba(14,37,64,0.22)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="absolute inset-x-0 bottom-3 z-[6] flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`size-[7px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${i === idx ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
      {/* סוג החדר מ-GuestHub. אין סוג להציג (הוא כבר הכותרת) — אין תג ריק */}
      {tag && (
        <span className="absolute top-3.5 right-3.5 z-[6] rounded-full bg-white px-3 py-1.5 text-[12.5px] font-bold text-navy-800 shadow-[0_4px_10px_rgba(0,0,0,0.14)]">
          {tag}
        </span>
      )}
    </div>
  );
}

/* ---------- אייקוני צ'יפים (מהעיצוב) ---------- */

function ChipIcon({ kind }: { kind: "guests" | "sqm" | "beds" }) {
  const paths: Record<typeof kind, React.ReactNode> = {
    guests: (
      <>
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M3.5 18c0-2.8 2.5-4.5 5.5-4.5s5.5 1.7 5.5 4.5M16 6a2.6 2.6 0 010 5M20 18c0-2-.9-3.4-2.3-4.2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    ),
    sqm: (
      <path
        d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    beds: (
      <path
        d="M3 18v-5a2 2 0 012-2h14a2 2 0 012 2v5M3 18h18M3 18v2M21 18v2M6 11V8a2 2 0 012-2h8a2 2 0 012 2v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  };
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths[kind]}
    </svg>
  );
}

function FeatureChip({ kind, children }: { kind: "guests" | "sqm" | "beds"; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-chip px-3 py-1.5 text-[13px] font-semibold text-chip-ink">
      <ChipIcon kind={kind} />
      {children}
    </span>
  );
}

function Amenity({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold text-[#4a6076] ${small ? "text-[12px]" : "text-[12.5px]"}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="var(--color-sea-500)" strokeWidth="1.5" />
        <path
          d="M8.3 12.2l2.4 2.4 4.8-5"
          stroke="var(--color-sea-500)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </span>
  );
}

function BookCta({ href, compact }: { href: string; compact?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center gap-2 rounded-[11px] bg-[linear-gradient(135deg,var(--color-sea-500),var(--color-ocean-400))] font-bold text-white shadow-[0_8px_18px_rgba(43,127,184,0.28)] ${
        compact ? "px-4 py-2.5 text-[14px] whitespace-nowrap" : "px-[18px] py-3 text-[15px]"
      }`}
    >
      {compact ? "הזמינו" : "הזמינו עכשיו"}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

/* ---------- כרטיס שורה ---------- */

/* בלי data-rev על הכרטיסים: הם נוצרים מחדש בהחלפת שורות/גריד, אחרי שמנוע
   התנועה כבר רץ — אלמנט data-rev חדש לא נצפה לעולם ונשאר שקוף (הבאג שתקע
   את תצוגת הגריד) */
function RowCard({ item, nights }: { item: BookingItem; nights: number }) {
  return (
    <article className="flex overflow-hidden rounded-[20px] border border-[#e9eef4] bg-white shadow-e2 max-lg:flex-col">
      <div className="relative shrink-0 basis-[320px] max-lg:basis-auto">
        <Carousel
          images={item.room.images}
          tag={item.room.typeTag}
          sizes="(max-width: 1024px) 100vw, 340px"
          heightClass="h-full min-h-64 max-lg:h-[220px] max-lg:min-h-0"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[13px] p-6 md:px-7">
        <div>
          <h3 className="mb-1.5 text-[22px] font-extrabold text-navy-800">
            {item.room.title} · דירה {item.room.roomNumber}
          </h3>
          <div className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink-dim">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21c4-4 7-7.4 7-11a7 7 0 10-14 0c0 3.6 3 7 7 11z" stroke="var(--color-sea-500)" strokeWidth="1.6" />
              <circle cx="12" cy="10" r="2.4" stroke="var(--color-sea-500)" strokeWidth="1.6" />
            </svg>
            {LOCATION_LINE}
          </div>
        </div>
        {/* צ'יפ נוצר רק לשדה שמוגדר ב-GuestHub — אין צ'יפ ריק ואין מספר מומצא */}
        {(item.room.guests || item.room.sizeSqm || item.room.bedsLabel) && (
          <div className="flex flex-wrap gap-2">
            {item.room.guests && <FeatureChip kind="guests">עד {item.room.guests} אורחים</FeatureChip>}
            {item.room.sizeSqm && <FeatureChip kind="sqm">{item.room.sizeSqm} מ״ר</FeatureChip>}
            {item.room.bedsLabel && <FeatureChip kind="beds">{item.room.bedsLabel}</FeatureChip>}
          </div>
        )}
        {item.room.amenities.length > 0 && (
          <div className="mt-px flex flex-wrap gap-x-4 gap-y-2">
            {item.room.amenities.map((a) => (
              <Amenity key={a}>{a}</Amenity>
            ))}
          </div>
        )}
        {item.room.description && (
          <p className="mt-auto mb-0 text-[14px] leading-relaxed text-ink-dim">
            {item.room.description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 basis-[232px] flex-col justify-center gap-1 border-r border-chip bg-[#fbfdfe] px-6 py-[26px] max-lg:basis-auto max-lg:border-r-0 max-lg:border-t">
        <div className="text-[12.5px] font-semibold text-ink-muted">מחיר ללילה</div>
        <div className="flex items-baseline gap-[5px]">
          <span className="text-[32px] leading-none font-extrabold text-navy-800">
            {fmt(item.pricePerNight)}
          </span>
          <span className="text-[13.5px] font-semibold text-ink-dim">/ לילה</span>
        </div>
        <div className="mt-2.5 border-t border-dashed border-[#dde6ee] pt-3">
          <div className="mb-0.5 text-[12.5px] font-semibold text-ink-dim">סה״כ ל־{nights} לילות</div>
          <div className="text-[19px] font-extrabold text-ocean-400">{fmt(item.totalPrice)}</div>
        </div>
        <div className="mt-4">
          <BookCta href={item.checkoutHref} />
        </div>
        <div className="mt-[9px] text-center text-[12px] font-semibold text-[#7c93a6]">
          {CANCELLATION}
        </div>
      </div>
    </article>
  );
}

/* ---------- כרטיס גריד ---------- */

function GridCard({ item, nights }: { item: BookingItem; nights: number }) {
  const extra = Math.max(0, item.room.amenities.length - 3);
  const pills = [
    item.room.guests ? `עד ${item.room.guests} אורחים` : null,
    item.room.sizeSqm ? `${item.room.sizeSqm} מ״ר` : null,
    item.room.bedsLabel,
  ].filter((p): p is string => Boolean(p));
  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] border border-[#e9eef4] bg-white shadow-e2">
      <Carousel
        images={item.room.images}
        tag={item.room.typeTag}
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        heightClass="h-[210px]"
      />
      <div className="flex flex-1 flex-col gap-[11px] px-[22px] py-5">
        <h3 className="text-[19px] font-extrabold text-navy-800">
          {item.room.title} · דירה {item.room.roomNumber}
        </h3>
        {pills.length > 0 && (
          <div className="flex flex-wrap gap-[7px]">
            {pills.map((p) => (
              <span
                key={p}
                className="rounded-[7px] bg-chip px-2.5 py-[5px] text-[12px] font-semibold text-chip-ink"
              >
                {p}
              </span>
            ))}
          </div>
        )}
        {item.room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-x-3.5 gap-y-[7px]">
            {item.room.amenities.slice(0, 3).map((a) => (
              <Amenity key={a} small>
                {a}
              </Amenity>
            ))}
            {extra > 0 && (
              <span className="text-[12px] font-bold text-ocean-400">+{extra} מתקנים</span>
            )}
          </div>
        )}
        <div className="mt-auto flex items-end justify-between gap-2.5 border-t border-chip pt-3.5">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[23px] leading-none font-extrabold text-navy-800">
                {fmt(item.pricePerNight)}
              </span>
              <span className="text-[12.5px] font-semibold text-ink-dim">/ לילה</span>
            </div>
            <div className="mt-[3px] text-[12.5px] font-bold text-ocean-400">
              סה״כ ל־{nights} לילות · {fmt(item.totalPrice)}
            </div>
          </div>
          <BookCta href={item.checkoutHref} compact />
        </div>
      </div>
    </article>
  );
}

/* ---------- הרשימה + מתג תצוגה ---------- */

export function ResultsList({
  items,
  nights,
  countLabel,
  rangeLabel,
}: {
  items: BookingItem[];
  nights: number;
  countLabel: string;
  rangeLabel: string;
}) {
  const [view, setView] = useState<"rows" | "grid">("rows");

  const toggleBtn = (v: "rows" | "grid", label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setView(v)}
      aria-pressed={view === v}
      className={`flex min-h-11 items-center gap-[7px] rounded-[9px] px-4 py-2 text-[14px] font-bold transition-all ${
        view === v ? "bg-white text-navy-800 shadow-[0_2px_8px_rgba(14,37,64,0.12)]" : "text-ink-dim"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2 className="mb-[7px] text-[30px] font-extrabold tracking-heading text-navy-800">
            {countLabel}
          </h2>
          <p className="text-[14.5px] font-medium text-ink-dim">{rangeLabel}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-[#e3ebf2] bg-white p-[5px]">
          {toggleBtn(
          "rows",
          "שורות",
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <rect x="3" y="14" width="18" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>,
        )}
        {toggleBtn(
          "grid",
          "גריד",
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>,
          )}
        </div>
      </div>

      {view === "rows" ? (
        <div className="flex flex-col gap-5">
          {items.map((item) => (
            <RowCard key={item.roomId} item={item} nights={nights} />
          ))}
        </div>
      ) : (
        <div className="grid gap-[22px] md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <GridCard key={item.roomId} item={item} nights={nights} />
          ))}
        </div>
      )}
    </>
  );
}
