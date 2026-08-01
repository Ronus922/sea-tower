"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ApartmentView } from "@/lib/apartment-view";
import type { BookingItem } from "@/lib/booking-results";
import { CANCELLATION_NOTE } from "@/lib/stay-terms";
import {
  BaseChips,
  ImagePlaceholder,
  SpecAccordion,
  SpecDrawer,
  SpecHint,
  useNarrowViewport,
} from "./ApartmentSpec";

/* רשימת התוצאות — כרטיס לכל דירה פיזית, לפי "כרטיס דירה ומפרט מורחב"
   (design-reference/assets/ExtendedSpecifications).

   הכרטיס מוכר, המפרט משכנע (§1): בכרטיס יש מידע כללי בלבד — תמונה, תגית,
   שם, מיקום, ארבעה נתוני יסוד, עד ארבעה מתקנים, משפט אחד ומחיר. התיאור
   המלא, קבוצות הציוד ותנאי השהייה נפתחים באקורדיון או במגירה, לעולם לא
   בתוך הכרטיס.

   כל התוכן מגיע מ-ApartmentView שנבנה בשרת (lib/apartment-view.ts) —
   הקומפוננטה לא חותכת טקסט, לא מקבצת מתקנים ולא ממציאה ברירות מחדל. */

const fmt = (n: number) => `₪${n.toLocaleString("en-US")}`;

/* ---------- קרוסלה ---------- */

/* מסגרת התמונה נקבעת בידי הקורא דרך className, ולא כאן: בכרטיס הגריד היחס
   הקבוע 4:3 הוא מה ששומר על התמונה לרוחב (§2), ובכרטיס השורה הרוחב כבר קבוע
   (‏320px) ולכן המסגרת נמתחת לגובה גוף הכרטיס. מה שמשותף לשתיהן: למסגרת יש
   תמיד גובה משלה, והתמונה ממלאת אותה ב-object-cover — כך תמונה אנכית לא
   מותחת את הכרטיס ותמונת נוף לא נחתכת לרצועה */
function Carousel({
  apartment,
  sizes,
  className,
}: {
  apartment: ApartmentView;
  sizes: string;
  className: string;
}) {
  const [idx, setIdx] = useState(0);
  const images = apartment.images;
  const count = images.length;
  /* הגלריה מתרעננת בכל חיפוש; אינדקס שנשאר מגלריה קודמת לא ישאיר מסגרת ריקה */
  const current = count > 0 ? idx % count : 0;
  const step = (n: number) => setIdx((v) => (v + n + count) % count);

  return (
    <div className={`relative overflow-hidden bg-[#dfe9f1] ${className}`}>
      {count === 0 ? (
        <ImagePlaceholder title={apartment.title} />
      ) : (
        images.map((im, i) => (
          <Image
            key={im.src}
            src={im.src}
            alt={im.alt}
            fill
            sizes={sizes}
            className={`object-cover object-center transition-opacity duration-[400ms] ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))
      )}
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="תמונה קודמת"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute top-1/2 right-3 z-[6] flex size-[38px] -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy-800 shadow-[0_4px_12px_rgba(14,37,64,0.22)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="תמונה הבאה"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute top-1/2 left-3 z-[6] flex size-[38px] -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy-800 shadow-[0_4px_12px_rgba(14,37,64,0.22)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="absolute inset-x-0 bottom-3 z-[6] flex justify-center gap-1.5">
            {images.map((im, i) => (
              <span
                key={im.src}
                className={`size-[7px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${
                  i === current ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
      {/* מאפיין מבדל אחד, עד 18 תווים. אין מאפיין — אין תגית ריקה */}
      {apartment.tag && (
        <span className="absolute top-3.5 right-3.5 z-[6] rounded-full bg-white px-3 py-1.5 text-[12.5px] font-bold text-navy-800 shadow-[0_4px_10px_rgba(0,0,0,0.14)]">
          {apartment.tag}
        </span>
      )}
    </div>
  );
}

/* ---------- חלקים משותפים לשתי התצוגות ---------- */

function LocationLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink-dim">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
        <path d="M12 21c4-4 7-7.4 7-11a7 7 0 10-14 0c0 3.6 3 7 7 11z" stroke="var(--color-sea-500)" strokeWidth="1.6" />
        <circle cx="12" cy="10" r="2.4" stroke="var(--color-sea-500)" strokeWidth="1.6" />
      </svg>
      {text}
    </div>
  );
}

/* ארבעת המתקנים המובילים + "‎+N מתקנים" — שניהם נגזרו מהרשימה המלאה בשרת */
function TopAmenities({ apartment, small }: { apartment: ApartmentView; small?: boolean }) {
  if (apartment.topAmenities.length === 0) return null;
  return (
    <div className={`flex flex-wrap ${small ? "gap-x-3.5 gap-y-[7px]" : "gap-x-4 gap-y-2"}`}>
      {apartment.topAmenities.map((a) => (
        <span
          key={a}
          className={`inline-flex items-center gap-1.5 font-semibold text-[#4a6076] ${
            small ? "text-[12px]" : "text-[12.5px]"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
            <circle cx="12" cy="12" r="9" stroke="var(--color-sea-500)" strokeWidth="1.5" />
            <path d="M8.3 12.2l2.4 2.4 4.8-5" stroke="var(--color-sea-500)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {a}
        </span>
      ))}
      {apartment.moreAmenities > 0 && (
        <span className={`font-bold text-ocean-400 ${small ? "text-[12px]" : "text-[12.5px]"}`}>
          +{apartment.moreAmenities} מתקנים
        </span>
      )}
    </div>
  );
}

function BookCta({ href, compact }: { href: string; compact?: boolean }) {
  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
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

/* ---------- תבנית A: כרטיס שורה + אקורדיון ---------- */

function RowCard({
  item,
  nights,
  open,
  onToggle,
}: {
  item: BookingItem;
  nights: number;
  open: boolean;
  onToggle: () => void;
}) {
  const a = item.apartment;
  return (
    <article className="overflow-hidden rounded-[20px] border border-[#e9eef4] bg-white shadow-e2">
      <div className="flex max-lg:flex-col">
        {/* עמודת המדיה נמתחת לגובה גוף הכרטיס (‏align-items: stretch), והתמונה
            ממלאת אותה עד למטה — עד לרצועת האקורדיון, בלי שטח לבן מתחתיה.
            ‏min-h שומר על גובה סביר כשהטקסט קצר במיוחד. מתחת ל-lg הכרטיס
            נערם, אין לעמודה גובה להימתח אליו, ולכן חוזרים ליחס 4:3 הקבוע */}
        <div className="shrink-0 basis-[320px] self-stretch max-lg:basis-auto">
          <Carousel
            apartment={a}
            sizes="(max-width: 1024px) 100vw, 340px"
            className="aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[248px]"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-[13px] p-6 md:px-7">
          <div>
            <h3 className="mb-1.5 text-[22px] font-extrabold text-navy-800">{a.title}</h3>
            <LocationLine text={a.locationLine} />
          </div>
          <BaseChips apartment={a} />
          <TopAmenities apartment={a} />
          {/* משפט אחד, שתי שורות לכל היותר — המפרט המלא נמצא באקורדיון */}
          {a.shortDescription && (
            <p className="stm-clamp-2 mt-auto text-[14px]/[1.6] text-ink-dim">
              {a.shortDescription}
            </p>
          )}
        </div>

        <div className="flex shrink-0 basis-[232px] flex-col justify-center gap-1 border-r border-chip bg-[#fbfdfe] px-6 py-[26px] max-lg:basis-auto max-lg:border-t max-lg:border-r-0">
          <div className="text-[12.5px] font-semibold text-ink-muted">מחיר ללילה</div>
          <div className="flex items-baseline gap-[5px]">
            <span className="text-[32px] leading-none font-extrabold text-navy-800">
              {fmt(item.pricePerNight)}
            </span>
            <span className="text-[13.5px] font-semibold text-ink-dim">/ לילה</span>
          </div>
          <div className="mt-2.5 border-t border-dashed border-[#dde6ee] pt-3">
            <div className="mb-0.5 text-[12.5px] font-semibold text-ink-dim">
              סה״כ ל־{nights} לילות
            </div>
            <div className="text-[19px] font-extrabold text-ocean-400">{fmt(item.totalPrice)}</div>
          </div>
          <div className="mt-4">
            <BookCta href={item.checkoutHref} />
          </div>
          <div className="mt-[9px] text-center text-[12px] font-semibold text-[#7c93a6]">
            {CANCELLATION_NOTE}
          </div>
        </div>
      </div>

      {item.hasSpec && <SpecAccordion apartment={a} open={open} onToggle={onToggle} />}
    </article>
  );
}

/* ---------- תבנית B: כרטיס גריד + מגירה (אקורדיון מתחת ל-820px) ---------- */

function GridCard({
  item,
  nights,
  open,
  onOpen,
}: {
  item: BookingItem;
  nights: number;
  /** אקורדיון פתוח — רלוונטי רק במסך צר, שבו אין מגירה */
  open: boolean;
  onOpen: () => void;
}) {
  const a = item.apartment;
  return (
    <article
      onClick={item.hasSpec ? onOpen : undefined}
      className={`flex flex-col overflow-hidden rounded-[20px] border border-[#e9eef4] bg-white shadow-e2 ${
        item.hasSpec ? "cursor-pointer" : ""
      }`}
    >
      <Carousel
        apartment={a}
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="aspect-[4/3] w-full"
      />
      <div className="flex flex-1 flex-col gap-[11px] px-[22px] py-5">
        <h3 className="text-[19px] font-extrabold text-navy-800">{a.title}</h3>
        <LocationLine text={a.locationLine} />
        <BaseChips apartment={a} small />
        <TopAmenities apartment={a} small />
        {a.shortDescription && (
          <p className="stm-clamp-2 text-[13px]/[1.6] text-ink-dim">{a.shortDescription}</p>
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
          <div className="flex flex-col items-end gap-[7px]">
            {item.hasSpec && (
              <SpecHint
                apartmentId={a.id}
                onOpen={onOpen}
                expanded={open}
                controls={`spec-${a.id}`}
              />
            )}
            <BookCta href={item.checkoutHref} compact />
          </div>
        </div>
      </div>
      {/* מתחת ל-820px אין מגירה — אותו מפרט נפתח כאקורדיון מתחת לכרטיס */}
      {item.hasSpec && open && <SpecAccordion apartment={a} open onToggle={onOpen} />}
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
  /* אקורדיון אחד פתוח בכל רגע נתון (§3) */
  const [openId, setOpenId] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const narrow = useNarrowViewport();
  const openerRef = useRef<string | null>(null);

  const toggleSpec = useCallback((id: string) => setOpenId((v) => (v === id ? null : id)), []);

  /* גריד רחב → מגירה; מתחת ל-820px אותו לחיץ פותח אקורדיון (§8) */
  const openSpec = useCallback(
    (id: string) => {
      if (view === "grid" && !narrow) {
        openerRef.current = id;
        setDrawerId(id);
      } else {
        toggleSpec(id);
      }
    },
    [view, narrow, toggleSpec],
  );

  /* החזרת הפוקוס לכרטיס שממנו נפתחה המגירה (§9). העוגן הוא רמז "מפרט מלא"
     של אותו כרטיס — הכרטיס עצמו אינו אלמנט ממוקד */
  const closeDrawer = useCallback(() => {
    const id = openerRef.current;
    setDrawerId(null);
    openerRef.current = null;
    if (id) {
      document.querySelector<HTMLElement>(`[data-spec-trigger="${CSS.escape(id)}"]`)?.focus();
    }
  }, []);

  const switchView = (v: "rows" | "grid") => {
    setView(v);
    setOpenId(null);
    setDrawerId(null);
  };

  const drawerItem = items.find((i) => i.roomId === drawerId) ?? null;

  const toggleBtn = (v: "rows" | "grid", label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => switchView(v)}
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
            <RowCard
              key={item.roomId}
              item={item}
              nights={nights}
              open={openId === item.roomId}
              onToggle={() => toggleSpec(item.roomId)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-[22px] md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <GridCard
              key={item.roomId}
              item={item}
              nights={nights}
              open={openId === item.roomId}
              onOpen={() => openSpec(item.roomId)}
            />
          ))}
        </div>
      )}

      {drawerItem && (
        <SpecDrawer
          apartment={drawerItem.apartment}
          priceLabel={fmt(drawerItem.pricePerNight)}
          totalLabel={`סה״כ ל־${nights} לילות · ${fmt(drawerItem.totalPrice)}`}
          cancellation={CANCELLATION_NOTE}
          checkoutHref={drawerItem.checkoutHref}
          onClose={closeDrawer}
        />
      )}
    </>
  );
}
