"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chevron } from "@/components/ui/Chevron";
import { RoomCard } from "@/components/site/RoomCard";
import type { PublicRoom } from "@/lib/booking-api";

/* קרוסלת "סוויטות נבחרות מול הים" — הכרטיסים מגיעים חיים מ-GuestHub
   (/api/public/rooms). גלילה נטיבית עם scroll-snap: החלקה באצבע עובדת בלי JS,
   והחיצים רק דוחפים את אותו scroller. 4/3/2/1 כרטיסים לפי רוחב המסך. */

const GAP_PX = 24; /* gap-6 — חייב להתאים ל-className של ה-scroller */

const CARD_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 86vw";

function ArrowButton({
  dir,
  label,
  disabled,
  onClick,
}: {
  dir: "start" | "end";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`absolute top-[86px] z-10 flex size-11 items-center justify-center rounded-full border border-line bg-white/95 p-2 text-navy-800 shadow-e2 backdrop-blur-[2px] transition-[opacity,transform] duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-500 disabled:pointer-events-none disabled:opacity-0 md:top-[104px] ${
        dir === "start" ? "start-1.5" : "end-1.5"
      }`}
    >
      <Chevron dir={dir} />
    </button>
  );
}

export function RoomsCarousel({ rooms }: { rooms: PublicRoom[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    /* ב-RTL scrollLeft יורד לשלילי ככל שמתקדמים — abs מנרמל את שני הכיוונים */
    const pos = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(pos > 4);
    setCanNext(max > 4 && pos < max - 4);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sync, rooms.length]);

  const go = (forward: boolean) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth ?? el.clientWidth) + GAP_PX;
    /* כיוון הגלילה נגזר מכיוון הכתיבה בפועל, לא מהנחה על RTL */
    const sign = getComputedStyle(el).direction === "rtl" ? -1 : 1;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: (forward ? 1 : -1) * sign * step, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className="relative">
      <ArrowButton dir="start" label="הדירה הקודמת" disabled={!canPrev} onClick={() => go(false)} />
      <ArrowButton dir="end" label="הדירה הבאה" disabled={!canNext} onClick={() => go(true)} />

      <div
        ref={scroller}
        onScroll={sync}
        tabIndex={0}
        role="group"
        aria-label="סוויטות נבחרות מול הים"
        className="rooms-scroller flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sea-500"
      >
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            sizes={CARD_SIZES}
            className="w-[86%] shrink-0 snap-start md:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] xl:w-[calc((100%-72px)/4)]"
          />
        ))}
      </div>
    </div>
  );
}
