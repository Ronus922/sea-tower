"use client";

import { useCallback, useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import type { ApartmentView } from "@/lib/apartment-view";

/* המפרט המורחב — שתי התבניות של הרפרנס מעל אותו תוכן:
   • תבנית A (§3): אקורדיון מתחת לכרטיס, בתצוגת השורות ובכל תצוגת מובייל.
   • תבנית B (§4): מגירה נשלפת משמאל, בתצוגת הגריד בדסקטופ.
   שתיהן מרנדרות את SpecBody מאותו ApartmentView — אין המרת נתונים כפולה. */

/* מתחת ל-820px גם הגריד עובר לאקורדיון (§8). useSyncExternalStore ולא
   useEffect: אין הבהוב של מגירה שנפתחת ונסגרת ברינדור הראשון */
const NARROW = "(max-width: 819px)";

function subscribe(cb: () => void): () => void {
  const mq = window.matchMedia(NARROW);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useNarrowViewport(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(NARROW).matches,
    () => false, // בשרת אין viewport — הדסקטופ הוא ברירת המחדל של ה-HTML
  );
}

/* ---------- אבני הבניין של הפאנל ---------- */

const H4 = ({ children }: { children: React.ReactNode }) => (
  <h4 className="mb-3 text-[15px] font-extrabold text-navy-800">{children}</h4>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className="mt-[3px] shrink-0"
  >
    <path
      d="M5 12.5l4.2 4.2L19 7"
      stroke="var(--color-sea-500)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function DescriptionColumn({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div>
      <H4>תיאור הדירה</H4>
      {paragraphs.map((p) => (
        <p key={p} className="mb-3 text-[14px]/[1.72] text-pretty text-[#4a6076] last:mb-0">
          {p}
        </p>
      ))}
    </div>
  );
}

function AmenitiesColumn({ groups }: { groups: ApartmentView["details"]["groups"] }) {
  return (
    <div>
      <H4>מה יש בדירה</H4>
      <div className="grid gap-x-[26px] gap-y-[18px] sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.name}>
            <div className="mb-2 text-[12px] font-extrabold tracking-[0.05em] text-ink-muted">
              {g.name}
            </div>
            <div className="flex flex-col gap-[7px]">
              {g.items.map((item) => (
                <span
                  key={item}
                  className="flex items-start gap-[7px] text-[13.5px]/[1.45] text-chip-ink"
                >
                  <CheckIcon />
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TermsColumn({ terms }: { terms: readonly string[] }) {
  return (
    <div>
      <H4>תנאי שהייה</H4>
      <div className="flex flex-col gap-[9px]">
        {terms.map((t) => (
          <span key={t} className="flex items-start gap-[7px] text-[13.5px]/[1.5] text-[#4a6076]">
            <span
              aria-hidden="true"
              className="mt-[7px] size-[5px] shrink-0 rounded-full bg-[#9dc3dd]"
            />
            {t}
          </span>
        ))}
      </div>
      <Link
        href="/house-rules"
        className="stm-link mt-3.5 inline-flex min-h-11 items-center text-[13px] font-bold text-ocean-400"
      >
        חוקי הבית המלאים ›
      </Link>
    </div>
  );
}

/* גוף המפרט. `layout="columns"` הוא שלוש העמודות של האקורדיון בדסקטופ
   (1.15fr / 1.5fr / 0.9fr, מרווח 34px); `stack` הוא עמודה אחת — מובייל
   ומגירה. עמודה בלי תוכן לא נוצרת, ולכן אין כותרת שמעליה ריק */
function SpecBody({
  apartment,
  layout,
}: {
  apartment: ApartmentView;
  layout: "columns" | "stack";
}) {
  const { paragraphs, groups } = apartment.details;
  const columns: Array<{ node: React.ReactNode; fr: string }> = [];
  if (paragraphs.length > 0)
    columns.push({ node: <DescriptionColumn paragraphs={paragraphs} />, fr: "1.15fr" });
  if (groups.length > 0) columns.push({ node: <AmenitiesColumn groups={groups} />, fr: "1.5fr" });
  columns.push({ node: <TermsColumn terms={apartment.terms} />, fr: "0.9fr" });

  return (
    <div
      className={layout === "columns" ? "grid gap-[34px]" : "flex flex-col gap-7"}
      style={
        layout === "columns"
          ? { gridTemplateColumns: columns.map((c) => c.fr).join(" ") }
          : undefined
      }
    >
      {columns.map((c, i) => (
        <div key={i}>{c.node}</div>
      ))}
    </div>
  );
}

/* ---------- תבנית A: אקורדיון ---------- */

export function SpecAccordion({
  apartment,
  open,
  onToggle,
}: {
  apartment: ApartmentView;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `spec-${apartment.id}`;
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex min-h-12 w-full items-center justify-between border-t border-[#eef2f6] px-6 py-3.5 text-[14.5px] font-bold text-ocean-400 transition-colors md:px-7 ${
          open ? "bg-[#f7fafd]" : "bg-white"
        }`}
      >
        <span>{open ? "סגירת המפרט המלא" : "מפרט מלא של הדירה"}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={`transition-transform duration-[250ms] ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          id={panelId}
          className="stm-spec-panel border-t border-[#eef2f6] bg-[#f7fafd] px-7 pt-7 pb-[30px] max-lg:px-5"
        >
          <SpecBody apartment={apartment} layout="columns" />
        </div>
      )}
    </>
  );
}

/* מתחת ל-820px הפאנל הופך לעמודה אחת — הכלל היחיד שהוא באמת תצוגתי, ולכן
   הוא נאכף ב-CSS על הגריד שנוצר למעלה (ראו booking.css) */

/* ---------- תבנית B: מגירה ---------- */

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function SpecDrawer({
  apartment,
  priceLabel,
  totalLabel,
  cancellation,
  checkoutHref,
  onClose,
}: {
  apartment: ApartmentView;
  priceLabel: string;
  totalLabel: string;
  cancellation: string;
  checkoutHref: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  /* מלכודת פוקוס + Esc (§9). הגלילה של הרשימה מאחור מוקפאת כדי שהכרטיס
     יישאר בדיוק במקום שבו האורח השאיר אותו */
  useEffect(() => {
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const cover = apartment.images[0];

  return createPortal(
    <div
      className="stm-drawer-back fixed inset-0 z-[200] bg-[rgba(10,29,49,0.5)] backdrop-blur-[3px]"
      onClick={onClose}
    >
      {/* נשלפת מצד שמאל (§4). מיקום מוחלט ולא flex — בתוך עמוד RTL הכיוון
          של flex-start מתהפך, והמגירה הייתה נצמדת לצד הנגדי לאנימציה */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="stm-drawer absolute top-0 left-0 flex h-full w-[min(560px,94vw)] flex-col bg-white shadow-[0_0_60px_rgba(8,22,37,0.35)]"
      >
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="relative h-[250px] bg-[#dfe9f1]">
            {cover ? (
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(max-width: 596px) 94vw, 560px"
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder title={apartment.title} />
            )}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="סגירת המפרט"
              className="absolute top-4 left-4 z-[4] flex size-[38px] items-center justify-center rounded-full bg-white/95 shadow-[0_4px_12px_rgba(14,37,64,0.22)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="var(--color-navy-800)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(8,22,37,0.88),transparent)] px-[26px] py-5 text-white">
              <h3 id={titleId} className="mb-1 text-[25px] font-extrabold">
                {apartment.title}
              </h3>
              <div className="text-[13.5px] font-medium text-[#cfe1ee]">
                {apartment.locationLine}
              </div>
            </div>
          </div>

          <div className="px-[26px] pt-[22px] pb-[30px]">
            <BaseChips apartment={apartment} className="mb-4" />
            <SpecBody apartment={apartment} layout="stack" />
          </div>
        </div>

        {/* פס תחתון דביק — נשאר גלוי בזמן גלילה במפרט (§4) */}
        <div className="flex items-center justify-between gap-4 border-t border-[#eef2f6] bg-white/[0.97] px-[26px] py-4 backdrop-blur-[8px]">
          <div>
            <div className="flex items-baseline gap-[5px]">
              <span className="text-[26px] leading-none font-extrabold text-navy-800">
                {priceLabel}
              </span>
              <span className="text-[13px] font-semibold text-ink-dim">/ לילה</span>
            </div>
            <div className="mt-[3px] text-[12px] font-semibold text-[#7c93a6]">
              {totalLabel} · {cancellation}
            </div>
          </div>
          <Link
            href={checkoutHref}
            className="flex items-center gap-2 rounded-[11px] bg-[linear-gradient(135deg,var(--color-sea-500),var(--color-ocean-400))] px-[26px] py-[13px] text-[15px] font-bold text-white shadow-[0_8px_18px_rgba(43,127,184,0.28)]"
          >
            הזמינו עכשיו
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ---------- משותף לכרטיס ולמגירה ---------- */

/* נתוני היסוד. שבב נוצר רק לשדה שקיים ב-GuestHub — אין שבב ריק */
export function BaseChips({
  apartment,
  className = "",
  small,
}: {
  apartment: ApartmentView;
  className?: string;
  small?: boolean;
}) {
  const chips = [
    apartment.guestsMax ? `עד ${apartment.guestsMax} אורחים` : null,
    apartment.sqm ? `${apartment.sqm} מ״ר` : null,
    apartment.rooms,
    apartment.beds,
  ].filter((c): c is string => Boolean(c));
  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {chips.map((c) => (
        <span
          key={c}
          className={`rounded-lg bg-chip font-semibold text-chip-ink ${
            small ? "px-2.5 py-[5px] text-[12px]" : "px-3 py-1.5 text-[13px]"
          }`}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

/* דירה בלי תמונה תקפה לא אמורה להגיע לתוצאות בכלל (ראו booking-results),
   אבל אם הגיעה — מצב ריק נקי עם שם הדירה, ולא אייקון תמונה שבורה ולעולם
   לא תמונה של דירה אחרת */
export function ImagePlaceholder({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[linear-gradient(135deg,#dfe9f1,#eef4f9)] px-4 text-center">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2.5"
          stroke="var(--color-ink-muted)"
          strokeWidth="1.5"
        />
        <path
          d="M3 16l4.5-4.5 4 4L15 12l6 5.5"
          stroke="var(--color-ink-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[13px] font-semibold text-ink-dim">{title}</span>
      <span className="text-[12px] font-medium text-ink-muted">תמונות בהכנה</span>
    </div>
  );
}

/* רמז "מפרט מלא ›" של כרטיס הגריד — כפתור אמיתי, כדי שהמגירה תיפתח גם
   במקלדת ולא רק בלחיצה על הכרטיס */
export function SpecHint({
  apartmentId,
  onOpen,
  expanded,
  controls,
}: {
  apartmentId: string;
  onOpen: () => void;
  expanded?: boolean;
  controls?: string;
}) {
  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onOpen();
    },
    [onOpen],
  );
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={controls}
      /* עוגן להחזרת הפוקוס: המגירה נפתחת גם בלחיצה על שטח הכרטיס, שאינו
         אלמנט ממוקד, ולכן הפוקוס חוזר לרמז ולא ל-body */
      data-spec-trigger={apartmentId}
      className="inline-flex items-center gap-1 text-[12.5px] font-bold text-ocean-400"
    >
      מפרט מלא
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 6l-6 6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
