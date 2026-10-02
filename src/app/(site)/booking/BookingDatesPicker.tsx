"use client";

import { useEffect, useState, type RefObject } from "react";
import { DateRangePicker, type DateRange } from "@/components/date-range-picker";
import { todayInIsrael } from "./dates";

/* מתאם דק בין פס החיפוש לבורר של סקיל datePicker. שומר על החוזה הקיים:
   "סגור" → onClose(arrival, departure); ביטול / X / רקע / Esc / לחיצה בחוץ → onClose(null, null).
   הטווח בזמן הבחירה נשמר כאן (draft) ולא בפס החיפוש — הפס מתעדכן רק בסגירה.
   הכפתור בפס החיפוש הוא הטריגר (anchorRef); הבורר לא מרנדר שדה משלו.
   בזמן שהבורר פתוח ל-body נוסף OPEN_CLASS, שמסתיר את NagishLi ואת כפתור ה-WhatsApp הצפים
   (booking.css) — אחרת הם מכסים את "ביטול" ואת הפוטר. מוסר בסגירה וב-unmount. */

export const OPEN_CLASS = "stm-drp-open";

type Props = {
  open: boolean;
  initialArrival: string | null;
  initialDeparture: string | null;
  onClose: (arrival: string | null, departure: string | null) => void;
  anchorRef: RefObject<HTMLElement | null>;
};

export function BookingDatesPicker({
  open,
  initialArrival,
  initialDeparture,
  onClose,
  anchorRef,
}: Props) {
  const [draft, setDraft] = useState<DateRange>({ start: initialArrival, end: initialDeparture });
  const [wasOpen, setWasOpen] = useState(open);

  /* בכל פתיחה ה-draft מתאפס לערכי הפס — עוד לפני שהבורר שומר snapshot לשחזור */
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft({ start: initialArrival, end: initialDeparture });
  }

  useEffect(() => {
    if (!open) return;
    document.body.classList.add(OPEN_CLASS);
    return () => document.body.classList.remove(OPEN_CLASS);
  }, [open]);

  const today = todayInIsrael();

  return (
    <DateRangePicker
      value={draft}
      onChange={setDraft}
      onCommit={(r) => onClose(r.start, r.end)}
      onCancel={() => onClose(null, null)}
      today={today}
      minDate={today}
      showStepper={false}
      open={open}
      anchorRef={anchorRef}
      hideTrigger
      className="stm-drp"
    />
  );
}
