"use client";

import { useEffect } from "react";
import { guestsSummary, type RoomParty } from "./dates";

/* מודאל בחירת אורחים — לפי עיצוב מנוע ההזמנה: חדרים עם ספירת מבוגרים/ילדים,
   הוספת/הסרת חדר, סיכום ואישור. כל כפתורי המגע 44px (Iron Rule #6). */

type Props = {
  open: boolean;
  rooms: RoomParty[];
  onChange: (rooms: RoomParty[]) => void;
  onClose: () => void;
};

function Stepper({
  value,
  min,
  max,
  incLabel,
  decLabel,
  onDelta,
}: {
  value: number;
  min: number;
  max: number;
  incLabel: string;
  decLabel: string;
  onDelta: (d: 1 | -1) => void;
}) {
  const canDec = value > min;
  const canInc = value < max;
  return (
    <div className="flex h-11 w-[132px] items-center overflow-hidden rounded-[11px] border-[1.5px] border-field">
      <button
        type="button"
        aria-label={incLabel}
        disabled={!canInc}
        onClick={() => onDelta(1)}
        className="flex h-full flex-1 items-center justify-center border-l border-chip bg-white text-ocean-400 disabled:text-[#cdd6df]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <div className="flex-1 text-center text-[16px] font-bold text-navy-800">{value}</div>
      <button
        type="button"
        aria-label={decLabel}
        disabled={!canDec}
        onClick={() => onDelta(-1)}
        className="flex h-full flex-1 items-center justify-center border-r border-chip bg-white text-ocean-400 disabled:text-[#cdd6df]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function GuestsPopover({ open, rooms, onChange, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const adjust = (i: number, key: keyof RoomParty, delta: 1 | -1) => {
    onChange(
      rooms.map((r, k) => {
        if (k !== i) return r;
        const min = key === "adults" ? 1 : 0;
        const max = key === "adults" ? 6 : 4;
        return { ...r, [key]: Math.max(min, Math.min(max, r[key] + delta)) };
      }),
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-[rgba(10,29,49,0.5)] p-5 backdrop-blur-[3px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="בחירת אורחים"
        className="max-h-[90vh] w-full max-w-[560px] overflow-auto rounded-[22px] bg-white px-[30px] pt-[26px] pb-[22px] text-[#14283d] shadow-[0_40px_90px_rgba(10,29,49,0.4)]"
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-[22px] font-extrabold tracking-heading text-navy-800">בחירת אורחים</h3>
          {rooms.length < 5 && (
            <button
              type="button"
              onClick={() => onChange([...rooms, { adults: 2, children: 0 }])}
              className="-my-2 inline-flex min-h-11 items-center gap-2 py-2 text-[15px] font-bold text-ocean-400"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              הוספת חדר
            </button>
          )}
        </div>

        {rooms.map((room, i) => (
          <div key={i} className="mt-[18px] border-t border-chip pt-[18px]">
            <div className="mb-3.5 flex items-center justify-between">
              <span className="text-[16px] font-extrabold text-navy-800">חדר #{i + 1}</span>
              {rooms.length > 1 && (
                <button
                  type="button"
                  aria-label={`מחיקת חדר ${i + 1}`}
                  onClick={() => onChange(rooms.filter((_, k) => k !== i))}
                  className="-m-2.5 flex size-11 items-center justify-center p-2.5 text-ink-muted"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 7h14M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[15px] font-medium text-ink-strong">מבוגרים</span>
              <Stepper
                value={room.adults}
                min={1}
                max={6}
                incLabel="הוספת מבוגר"
                decLabel="הפחתת מבוגר"
                onDelta={(d) => adjust(i, "adults", d)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium text-ink-strong">ילדים</span>
              <Stepper
                value={room.children}
                min={0}
                max={4}
                incLabel="הוספת ילד"
                decLabel="הפחתת ילד"
                onDelta={(d) => adjust(i, "children", d)}
              />
            </div>
          </div>
        ))}

        <div className="mt-5 flex items-center justify-between border-t border-chip pt-[18px]">
          <span className="text-[14px] font-semibold text-[#7c93a6]">{guestsSummary(rooms)}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[11px] bg-[linear-gradient(135deg,var(--color-sea-500),var(--color-ocean-400))] px-[30px] py-3 text-[15px] font-bold text-white shadow-[0_8px_18px_rgba(43,127,184,0.28)]"
          >
            אישור
          </button>
        </div>
      </div>
    </div>
  );
}
