"use client";

import { useEffect } from "react";

/* מנוע התנועה — גרסה מרוסנת (DESIGN-AUDIT ממצא 5).
   נשארו: חשיפות בגלילה (IntersectionObserver, פעם אחת, transform/opacity
   בלבד) וצל ה-header. הוסרו: פיצול כותרות למילים, מוני ספירה, פרלקסה,
   פס התקדמות, מכונת כתיבה ומהירות מרקיזה. */

const STAGGER_MS = 100;
const STAGGER_CAP_MS = 500;

function revealEl(el: HTMLElement) {
  if (el.classList.contains("stm-in")) return;
  el.classList.add("stm-in");
  el.addEventListener(
    "animationend",
    () => {
      el.classList.remove("stm-in");
      el.removeAttribute("data-rev");
      el.style.removeProperty("animation-delay");
    },
    { once: true }
  );
}

function forceVisible(el: HTMLElement) {
  el.removeAttribute("data-rev");
}

export function MotionEngine() {
  useEffect(() => {
    const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];
    const timers: number[] = [];

    /* --- צל header אחרי גלילה --- */
    const header = document.querySelector<HTMLElement>("header[data-site-header]");
    if (header) {
      const onScroll = () => header.classList.toggle("stm-scrolled", window.scrollY > 40);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    /* --- חשיפות --- */
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-rev]"));
    if (RM) {
      targets.forEach(forceVisible);
    } else if (targets.length) {
      // סטאגר לקבוצה (לפי הורה משותף)
      const groupIdx = new Map<HTMLElement | null, number>();
      targets.forEach((el) => {
        const p = el.parentElement;
        const n = groupIdx.get(p) ?? 0;
        groupIdx.set(p, n + 1);
        el.style.animationDelay = Math.min(n * STAGGER_MS, STAGGER_CAP_MS) + "ms";
      });

      const vh = window.innerHeight || 800;
      const io = new IntersectionObserver(
        (ents) => {
          ents.forEach((e) => {
            if (e.isIntersecting) {
              revealEl(e.target as HTMLElement);
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -18% 0px", threshold: 0.05 }
      );
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > 0) revealEl(el); // מעל הקפל → קסקדת טעינה
        else io.observe(el);
      });
      cleanups.push(() => io.disconnect());

      // רשתות ביטחון: לעולם לא משאירים תוכן מוסתר
      timers.push(
        window.setTimeout(() => {
          targets.forEach((el) => {
            if (
              el.hasAttribute("data-rev") &&
              el.getBoundingClientRect().top < (window.innerHeight || 800)
            ) {
              revealEl(el);
            }
          });
        }, 4000),
        window.setTimeout(() => targets.forEach(forceVisible), 14000)
      );
    }

    return () => {
      cleanups.forEach((fn) => fn());
      timers.forEach((t) => window.clearTimeout(t));
      // ניווט צד-לקוח לעמוד אחר: מסירים את שער החשיפה כדי לא להסתיר בו תוכן
      document.documentElement.classList.remove("stm-js");
    };
  }, []);

  return null;
}
