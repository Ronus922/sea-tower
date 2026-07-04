"use client";

import { useEffect } from "react";

/* התנהגות ה-FAQ — פורט 1:1 מסקריפט הרפרנס (design-reference/exports/Faq.html):
   • singleOpen: פתיחת שאלה סוגרת אוטומטית את השאר (ברירת מחדל ברפרנס)
   • חיפוש חי: מסנן details.faq-item לפי textContent, פותח התאמות, מסתיר
     סעיפים ריקים, מעדכן מונה + מצב "לא נמצאו תוצאות"
   התוכן מרונדר בשרת (SEO + עובד ללא JS); כאן רק שכבת ההתנהגות. */

export function FaqEnhancer() {
  useEffect(() => {
    const input = document.getElementById("faq-search") as HTMLInputElement | null;
    const clear = document.getElementById("faq-clear");
    const count = document.getElementById("faq-count");
    const empty = document.querySelector<HTMLElement>(".faq-empty");
    const secs = Array.from(document.querySelectorAll<HTMLElement>(".faq-sec"));
    if (!input) return;

    let filtering = false;

    /* singleOpen — סגירת יתר האקורדיונים כשאחד נפתח (מדלג בזמן סינון) */
    const onToggle = (e: Event) => {
      const d = e.target as HTMLElement;
      if (filtering || !(d instanceof HTMLDetailsElement) || !d.classList.contains("faq-item"))
        return;
      if (!d.open) return;
      document.querySelectorAll<HTMLDetailsElement>("details.faq-item[open]").forEach((o) => {
        if (o !== d) o.removeAttribute("open");
      });
    };
    document.addEventListener("toggle", onToggle, true);

    const applyFilter = (raw: string) => {
      const q = raw.trim().toLowerCase();
      filtering = true;
      let shown = 0;
      secs.forEach((sec) => {
        let vis = 0;
        sec.querySelectorAll<HTMLDetailsElement>("details.faq-item").forEach((d) => {
          const match = !q || d.textContent!.toLowerCase().includes(q);
          d.style.display = match ? "" : "none";
          if (match) {
            vis++;
            if (q) d.setAttribute("open", "");
          }
        });
        sec.style.display = vis ? "" : "none";
        shown += vis;
      });
      if (!q) {
        document
          .querySelectorAll<HTMLDetailsElement>("details.faq-item[open]")
          .forEach((d) => d.removeAttribute("open"));
      }
      filtering = false;

      const hasQ = q.length > 0;
      if (empty) empty.hidden = !hasQ || shown > 0;
      if (count) {
        count.hidden = !hasQ;
        count.textContent = `נמצאו ${shown} תשובות`;
      }
      if (clear) clear.hidden = !hasQ;
    };

    const onInput = () => applyFilter(input.value);
    const onClear = () => {
      input.value = "";
      applyFilter("");
      input.focus();
    };
    input.addEventListener("input", onInput);
    clear?.addEventListener("click", onClear);

    return () => {
      document.removeEventListener("toggle", onToggle, true);
      input.removeEventListener("input", onInput);
      clear?.removeEventListener("click", onClear);
    };
  }, []);

  return null;
}
