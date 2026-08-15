"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  HE_MONTHS,
  HE_WEEKDAYS,
  addDays,
  addMonths,
  daysInMonth,
  firstWeekday,
  fmtHe,
  monthStart,
  nightsBetween,
  todayInIsrael,
} from "@/app/(site)/booking/dates";

/* תאריכון "תאריכי שהות" לטופס הצעת המחיר — לפי תמונת רפרנס מהבעלים
   (2026-08-15): שדה טווח + מונה לילות בשורה אחת, ומתחתיהם פאנל נפתח
   אינליין עם סיכום, לוח דו-חודשי RTL וכפתורי סגור/ביטול. הערכים מוחלים
   על הטופס בזמן אמת ("ביטול" משחזר את מצב הפתיחה). העיצוב (stm-sd-*)
   ב-styles/stay-dates.css. children — שדות נוספים באותה שורה (אורחים) */

type Props = {
  idPrefix: string;
  arrival: string;
  departure: string;
  onChange: (arrival: string, departure: string) => void;
  /* פאנל צף מעל התוכן (popover) במקום אינליין שדוחף את העמוד — ‏/v2.
     ברירת המחדל (אינליין) נשארת זהה לחלוטין ל-/ ול-/contact */
  floating?: boolean;
  children?: React.ReactNode;
};

/* "19 באוגוסט – 20 באוגוסט 2026" (שנה כפולה רק כשהטווח חוצה שנים) */
function fmtFieldRange(a: string, d: string): string {
  const ya = a.slice(0, 4);
  const yd = d.slice(0, 4);
  return ya === yd ? `${fmtHe(a)} – ${fmtHe(d)} ${yd}` : `${fmtHe(a)} ${ya} – ${fmtHe(d)} ${yd}`;
}

/* "19/08/2026" */
function fmtSlash(d: string): string {
  return `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;
}

function MoonIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.4 14.2A8.6 8.6 0 0 1 9.8 3.6a8.6 8.6 0 1 0 10.6 10.6z"
        fill="currentColor"
      />
    </svg>
  );
}

export function StayDatesField({ idPrefix, arrival, departure, onChange, floating, children }: Props) {
  const today = todayInIsrael();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<string>(() => monthStart(arrival || today));
  const [active, setActive] = useState<"in" | "out">("in");
  const snapshot = useRef<{ arrival: string; departure: string }>({ arrival, departure });
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const panelId = useId();

  const nights = arrival && departure ? nightsBetween(arrival, departure) : 0;

  /* סגירה עם החזרת פוקוס לשדה — מקלדת, כפתורי הפאנל והשלמת טווח (במצב צף).
     לחיצה מחוץ לפאנל סוגרת בלי לגנוב את הפוקוס מהיעד שנלחץ */
  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus && floating) fieldRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        if (floating) fieldRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, floating]);

  /* מצב צף: סגירה בלחיצה מחוץ לרכיב */
  useEffect(() => {
    if (!floating || !open) return;
    const onDown = (e: PointerEvent) => {
      if (e.target instanceof Node && !rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [floating, open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  /* מצב צף: מיקום הפאנל יחסית לשדה — מתחתיו, ומתהפך מעליו כשאין מקום;
     הצמדה אופקית לגבולות המסך כך שלעולם אין גלילה אופקית. רץ גם על
     resize/scroll כי המרווח מהשוליים תלוי ב-viewport */
  useLayoutEffect(() => {
    if (!floating || !open) return;
    const update = () => {
      const rootEl = rootRef.current;
      const panel = panelRef.current;
      const field = fieldRef.current;
      if (!rootEl || !panel || !field) return;
      const fr = field.getBoundingClientRect();
      const spaceBelow = window.innerHeight - fr.bottom - 12;
      const spaceAbove = fr.top - 12;
      const up = panel.scrollHeight > spaceBelow && spaceAbove > spaceBelow;
      /* גובה מקסימלי לפי הצד שנבחר — הפאנל נגלל פנימית במסכים נמוכים */
      panel.style.maxHeight = `${Math.max(up ? spaceAbove : spaceBelow, 220)}px`;
      if (up) {
        panel.style.top = "auto";
        panel.style.bottom = `${rootEl.offsetHeight - field.offsetTop + 8}px`;
      } else {
        panel.style.bottom = "auto";
        panel.style.top = `${field.offsetTop + field.offsetHeight + 8}px`;
      }
      panel.style.transform = "";
      const pr = panel.getBoundingClientRect();
      const dx =
        pr.left < 8
          ? 8 - pr.left
          : pr.right > window.innerWidth - 8
            ? window.innerWidth - 8 - pr.right
            : 0;
      if (dx) panel.style.transform = `translateX(${dx}px)`;
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [floating, open, view, arrival, departure]);

  const toggle = () => {
    if (!open) {
      snapshot.current = { arrival, departure };
      setView(monthStart(arrival || today));
      setActive(arrival && !departure ? "out" : "in");
    }
    setOpen(!open);
  };

  const cancel = () => {
    onChange(snapshot.current.arrival, snapshot.current.departure);
    close(true);
  };

  /* המונה מזיז את תאריך היציאה בלבד; בלי תאריכים — מתחיל מהיום */
  const addNight = () => {
    if (!arrival) onChange(today, addDays(today, 1));
    else if (!departure) onChange(arrival, addDays(arrival, 1));
    else onChange(arrival, addDays(departure, 1));
  };
  const removeNight = () => {
    if (nights > 1) onChange(arrival, addDays(departure, -1));
  };

  const pick = (d: string) => {
    if (active === "in" || (arrival && departure) || !arrival || d <= arrival) {
      onChange(d, "");
      setActive("out");
    } else {
      onChange(arrival, d);
      setActive("in");
      /* מצב צף: הטווח הושלם — הפאנל נסגר מעצמו (השהיה קצרה כדי שהבחירה תיראה) */
      if (floating) {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = window.setTimeout(() => close(true), 350);
      }
    }
  };

  const renderMonth = (first: string) => {
    const y = Number(first.slice(0, 4));
    const m = Number(first.slice(5, 7));
    const blanks = firstWeekday(first);
    const days = daysInMonth(first);
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < blanks; i++) {
      cells.push(<span key={`b${i}`} className="stm-sd-day off" />);
    }
    for (let d = 1; d <= days; d++) {
      const date = `${first.slice(0, 8)}${String(d).padStart(2, "0")}`;
      const past = date < today;
      const isSel = date === arrival || date === departure;
      const inRange = arrival && departure && date > arrival && date < departure;
      const cls = [
        "stm-sd-day",
        past ? "off" : "",
        date === today ? "today" : "",
        isSel ? "sel" : "",
        inRange ? "rng" : "",
      ]
        .filter(Boolean)
        .join(" ");
      cells.push(
        <button
          key={date}
          type="button"
          className={cls}
          disabled={past}
          aria-label={`${d} ב${HE_MONTHS[m - 1]} ${y}`}
          aria-pressed={isSel || undefined}
          onClick={() => pick(date)}
        >
          <span>{d}</span>
        </button>,
      );
    }
    return (
      <div className="stm-sd-month">
        <div className="stm-sd-mtitle">{`${HE_MONTHS[m - 1]} ${y}`}</div>
        <div className="stm-sd-wd">
          {HE_WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="stm-sd-grid">{cells}</div>
      </div>
    );
  };

  const prevDisabled = view <= monthStart(today);

  return (
    <div ref={rootRef} className={`stm-sd${floating ? " stm-sd-float" : ""}`}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="min-w-0 flex-1">
          <label htmlFor={`${idPrefix}-dates`} className="mb-[7px] block text-[13px] font-semibold text-ink-dim">
            תאריכי שהות
          </label>
          <button
            id={`${idPrefix}-dates`}
            ref={fieldRef}
            type="button"
            className={`stm-sd-field${open ? " open" : ""}`}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={toggle}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="stm-sd-cal">
              <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <span className={`stm-sd-val${arrival && departure ? "" : " ph"}`}>
              {arrival && departure
                ? fmtFieldRange(arrival, departure)
                : arrival
                  ? `${fmtHe(arrival)} ${arrival.slice(0, 4)} — בחרו תאריך יציאה`
                  : "בחרו תאריכים"}
            </span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className={`stm-sd-chev${open ? " up" : ""}`}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="sm:w-[150px]">
          <label htmlFor={`${idPrefix}-nights`} className="mb-[7px] block text-[13px] font-semibold text-ink-dim">
            לילות
          </label>
          {/* ‏RTL: הפריט הראשון ב-DOM (מינוס) מוצג מימין — כמו ברפרנס: −  ערך  + */}
          <div className="stm-sd-step">
            <button
              type="button"
              className="stm-sd-stepbtn"
              aria-label="הפחתת לילה"
              disabled={nights <= 1}
              onClick={removeNight}
            >
              −
            </button>
            {/* ‏0 ולא "—" במצב ריק — קו מפריד ליד כפתור המינוס נראה כמו שני מינוסים */}
            <output id={`${idPrefix}-nights`} className="stm-sd-stepval" aria-label="מספר לילות">
              {nights}
            </output>
            <button type="button" className="stm-sd-stepbtn plus" aria-label="הוספת לילה" onClick={addNight}>
              +
            </button>
          </div>
          <p className="mt-1.5 text-[12px] text-ink-muted">שינוי מזיז את תאריך היציאה</p>
        </div>

        {children}
      </div>

      {open && (
        <div ref={panelRef} id={panelId} className="stm-sd-panel" role="group" aria-label="בחירת תאריכי שהות">
          <div className="stm-sd-head">
            <div className="stm-sd-sum">
              <span className="stm-sd-sumicon">
                <MoonIcon size={18} />
              </span>
              <span className="stm-sd-sumtext">
                <strong>{nights > 0 ? `${nights} לילות` : "בחרו תאריכים"}</strong>
                {arrival && departure && <small>{fmtFieldRange(arrival, departure)}</small>}
              </span>
            </div>
            {arrival && departure && (
              <div className="stm-sd-fromto">
                <span className="stm-sd-ft">
                  <small>מתאריך</small>
                  <strong>{fmtSlash(arrival)}</strong>
                </span>
                <span className="stm-sd-ftn" aria-hidden="true">
                  {nights}
                  <MoonIcon size={11} />
                </span>
                <span className="stm-sd-ft">
                  <small>עד תאריך</small>
                  <strong>{fmtSlash(departure)}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="stm-sd-nav">
            <button
              type="button"
              className="stm-sd-navbtn prev"
              aria-label="חודש קודם"
              disabled={prevDisabled}
              onClick={() => setView(addMonths(view, -1))}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="stm-sd-months">
              {renderMonth(view)}
              {renderMonth(addMonths(view, 1))}
            </div>
            <button
              type="button"
              className="stm-sd-navbtn next"
              aria-label="חודש הבא"
              onClick={() => setView(addMonths(view, 1))}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="stm-sd-foot">
            <p className="stm-sd-note">התאריכים עודכנו בטופס — לשליחה לחצו ״שלחו לי הצעה״</p>
            <span className="stm-sd-actions">
              <button type="button" className="stm-sd-cancel" onClick={cancel}>
                ביטול
              </button>
              <button type="button" className="stm-sd-close" onClick={() => close(true)}>
                סגור
              </button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
