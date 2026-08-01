"use client";

import { useEffect, useState } from "react";
import { HE_MONTHS, HE_WEEKDAYS, addDays, fmtHe, todayInIsrael } from "./dates";

/* בורר טווח תאריכים — פורט React של sea-tower-datepicker.js מהרפרנס:
   מודאל עם שני חודשים RTL, בחירת הגעה→עזיבה, סימון טווח, ניקוי וסגירה.
   העיצוב (מחלקות stm-dp-*) יושב ב-styles/booking.css — הועתק מהרפרנס. */

type Props = {
  open: boolean;
  initialArrival: string | null;
  initialDeparture: string | null;
  onClose: (arrival: string | null, departure: string | null) => void;
};

function monthStart(d: string): string {
  return `${d.slice(0, 7)}-01`;
}

function addMonths(d: string, n: number): string {
  const year = Number(d.slice(0, 4));
  const month = Number(d.slice(5, 7)) - 1 + n;
  const y = year + Math.floor(month / 12);
  const m = ((month % 12) + 12) % 12;
  return `${y}-${String(m + 1).padStart(2, "0")}-01`;
}

function daysInMonth(first: string): number {
  const y = Number(first.slice(0, 4));
  const m = Number(first.slice(5, 7));
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function firstWeekday(first: string): number {
  return new Date(`${first}T12:00:00Z`).getUTCDay();
}

export function DateRangePicker({ open, initialArrival, initialDeparture, onClose }: Props) {
  const today = todayInIsrael();
  const [arrival, setArrival] = useState<string | null>(initialArrival);
  const [departure, setDeparture] = useState<string | null>(initialDeparture);
  const [active, setActive] = useState<"in" | "out">("in");
  const [view, setView] = useState<string>(monthStart(initialArrival ?? today));

  useEffect(() => {
    if (!open) return;
    setArrival(initialArrival);
    setDeparture(initialDeparture);
    setActive(initialArrival && !initialDeparture ? "out" : "in");
    setView(monthStart(initialArrival ?? today));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(null, null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const pick = (d: string) => {
    if (active === "in" || (arrival && departure) || !arrival) {
      setArrival(d);
      setDeparture(null);
      setActive("out");
    } else if (d <= arrival) {
      setArrival(d);
      setDeparture(null);
      setActive("out");
    } else {
      setDeparture(d);
      setActive("in");
    }
  };

  const done = () => onClose(arrival, departure);

  const renderMonth = (first: string) => {
    const y = Number(first.slice(0, 4));
    const m = Number(first.slice(5, 7));
    const blanks = firstWeekday(first);
    const days = daysInMonth(first);
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < blanks; i++) {
      cells.push(<span key={`b${i}`} className="stm-dp-day off" />);
    }
    for (let d = 1; d <= days; d++) {
      const date = `${first.slice(0, 8)}${String(d).padStart(2, "0")}`;
      const past = date < today;
      const isSel = date === arrival || date === departure;
      const inRange = arrival && departure && date > arrival && date < departure;
      const cls = [
        "stm-dp-day",
        past ? "off" : "",
        date === today ? "today" : "",
        isSel ? "sel" : "",
        isSel && arrival && departure ? (date === arrival ? "s-start" : "s-end") : "",
        inRange ? "rng" : "",
      ]
        .filter(Boolean)
        .join(" ");
      cells.push(
        <button key={date} type="button" className={cls} disabled={past} onClick={() => pick(date)}>
          <span>{d}</span>
        </button>,
      );
    }
    return (
      <div className="stm-dp-month">
        <div className="stm-dp-mtitle">{`${HE_MONTHS[m - 1]} ${y}`}</div>
        <div className="stm-dp-wd">
          {HE_WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="stm-dp-grid">{cells}</div>
      </div>
    );
  };

  const prevDisabled = view <= monthStart(today);

  return (
    <div
      className="stm-dp-back stm-dp-show"
      onClick={(e) => {
        if (e.target === e.currentTarget) done();
      }}
    >
      <div className="stm-dp-card" role="dialog" aria-modal="true" aria-label="בחירת תאריכים">
        <div className="stm-dp-top">
          <div>
            <p className="stm-dp-ey">תאריכים</p>
            <h2 className="stm-dp-title">מתי תרצו להגיע?</h2>
          </div>
          <button type="button" className="stm-dp-x" aria-label="סגירה" onClick={done}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="stm-dp-segs">
          <button
            type="button"
            className={`stm-dp-seg${active === "in" ? " on" : ""}`}
            onClick={() => setActive("in")}
          >
            <span className="lab">מתי מגיעים?</span>
            <div className={`val${arrival ? "" : " ph"}`}>{arrival ? fmtHe(arrival) : "—"}</div>
          </button>
          <svg className="stm-dp-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M14 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <button
            type="button"
            className={`stm-dp-seg${active === "out" ? " on" : ""}`}
            onClick={() => setActive("out")}
          >
            <span className="lab">מתי יוצאים?</span>
            <div className={`val${departure ? "" : " ph"}`}>{departure ? fmtHe(departure) : "—"}</div>
          </button>
        </div>

        <div className="stm-dp-nav">
          <button
            type="button"
            className="stm-dp-navbtn"
            aria-label="חודש קודם"
            disabled={prevDisabled}
            onClick={() => setView(addMonths(view, -1))}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="stm-dp-months">
            {renderMonth(view)}
            {renderMonth(addMonths(view, 1))}
          </div>
          <button
            type="button"
            className="stm-dp-navbtn"
            aria-label="חודש הבא"
            onClick={() => setView(addMonths(view, 1))}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="stm-dp-foot">
          <button type="button" className="stm-dp-close" onClick={done}>
            סגרו
          </button>
          <button
            type="button"
            className="stm-dp-clear"
            onClick={() => {
              setArrival(null);
              setDeparture(null);
              setActive("in");
            }}
          >
            ניקוי
          </button>
        </div>
      </div>
    </div>
  );
}

export { addDays };
