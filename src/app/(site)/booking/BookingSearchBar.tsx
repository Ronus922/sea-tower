"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateRangePicker } from "./DateRangePicker";
import { GuestsPopover } from "./GuestsPopover";
import { fmtRange, guestsParam, guestsSummary, type RoomParty } from "./dates";

/* פס החיפוש הצף — תאריכים · אורחים · כפתור בדיקת זמינות (לפי עיצוב מנוע ההזמנה).
   שינוי חיפוש = ניווט לאותו עמוד עם פרמטרים חדשים (SSR מרנדר תוצאות טריות). */

type Props = {
  checkIn: string;
  checkOut: string;
  rooms: RoomParty[];
};

export function BookingSearchBar({ checkIn, checkOut, rooms: initialRooms }: Props) {
  const router = useRouter();
  const [arrival, setArrival] = useState(checkIn);
  const [departure, setDeparture] = useState(checkOut);
  const [rooms, setRooms] = useState<RoomParty[]>(initialRooms);
  const [datesOpen, setDatesOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);

  const submit = () => {
    const qs = new URLSearchParams({
      checkin: arrival,
      checkout: departure,
      guests: guestsParam(rooms),
    });
    router.push(`/booking?${qs}#results`);
  };

  return (
    <>
      <div
        id="stm-searchbar"
        className="flex items-stretch overflow-hidden rounded-[18px] border border-chip bg-white shadow-[0_22px_55px_rgba(14,37,64,0.16)] max-md:flex-col"
      >
        <button
          type="button"
          onClick={() => setDatesOpen(true)}
          className="flex flex-[1.5] items-center justify-between gap-3.5 border-l border-chip px-6 py-[18px] text-right max-md:border-l-0 max-md:border-b"
        >
          <span className="min-w-0 flex-1">
            <span className="mb-1 block text-[12.5px] font-semibold text-ink-muted">תאריכים</span>
            <span className="block text-[16px] font-bold text-[#14283d]">
              {fmtRange(arrival, departure)}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="var(--color-ocean-400)" strokeWidth="1.7" />
              <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="var(--color-ocean-400)" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setGuestsOpen(true)}
          className="flex flex-1 items-center justify-between gap-3.5 border-l border-chip px-6 py-[18px] text-right max-md:border-l-0 max-md:border-b"
        >
          <span>
            <span className="mb-1 block text-[12.5px] font-semibold text-ink-muted">אורחים</span>
            <span className="block text-[16px] font-bold text-[#14283d]">{guestsSummary(rooms)}</span>
          </span>
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-chip"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="8" r="3.2" stroke="var(--color-ocean-400)" strokeWidth="1.7" />
              <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" stroke="var(--color-ocean-400)" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M16 5.5a3 3 0 010 5.6M18 19c0-2.2-1-3.8-2.5-4.6" stroke="var(--color-ocean-400)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
        </button>

        <button
          type="button"
          onClick={submit}
          className="flex shrink-0 items-center justify-center gap-2.5 bg-[linear-gradient(135deg,var(--color-sea-500),var(--color-ocean-400))] px-[38px] py-4 text-[16.5px] font-bold text-white md:py-0"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="#fff" strokeWidth="1.9" />
            <path d="M16 16l4 4" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
          בדיקת זמינות
        </button>
      </div>

      <DateRangePicker
        open={datesOpen}
        initialArrival={arrival}
        initialDeparture={departure}
        onClose={(a, d) => {
          setDatesOpen(false);
          if (a && d) {
            setArrival(a);
            setDeparture(d);
          }
        }}
      />
      <GuestsPopover
        open={guestsOpen}
        rooms={rooms}
        onChange={setRooms}
        onClose={() => setGuestsOpen(false)}
      />
    </>
  );
}
