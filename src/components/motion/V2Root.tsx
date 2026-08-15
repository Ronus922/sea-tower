"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/* מעטפת /v2 — שלושת אלמנטי התנועה של הניסוי, GSAP בלבד, אנכי בלבד.
   עיקרון בטיחות (סעיף 2 של המפרט): שום מצב-התחלה מוסתר לא יושב ב-CSS.
   ההסתרה מוחלת רק כאן, אחרי ש-GSAP נטען בפועל — JS כבוי/נכשל ⇒ הכול גלוי */
export function V2Root({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      /* פיצול שורות לפי הפונט האמיתי: refresh אחרי document.fonts.ready,
         וגם אחרי window.load (תמונות ה-ISR של GuestHub משנות את הגובה —
         בלעדיו נקודות ההתחלה מחושבות על layout שגוי) */
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad, { once: true });

      const mm = gsap.matchMedia();

      /* reduced-motion: לא נרשם שום תנאי — כלום לא מונפש, התוכן נשאר גלוי
         סטטית (מעולם לא הוסתר) */

      /* ---- אלמנט 1: חשיפת כותרות משורה (כל הרוחבים) ---- */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const revealed = new Set<Element>();
        gsap.utils.toArray<HTMLElement>("[data-v2-title]", root).forEach((h) => {
          try {
            SplitText.create(h, {
              /* lines בלבד — לעולם לא chars/words: שובר ניקוד ואותיות
                 סופיות בעברית. mask: עטיפת overflow:hidden לכל שורה */
              type: "lines",
              mask: "lines",
              linesClass: "v2-line",
              /* פיצול מחדש אחרי טעינת פונטים ובשינוי רוחב (סיבוב מסך) */
              autoSplit: true,
              onSplit(self) {
                /* כותרת שכבר נחשפה לא חוזרת למצב מוסתר אחרי re-split */
                if (revealed.has(h)) return;
                return gsap.from(self.lines, {
                  yPercent: 100,
                  duration: 0.7,
                  stagger: 0.08,
                  ease: "power3.out",
                  scrollTrigger: { trigger: h, start: "top 85%", once: true },
                  onComplete: () => revealed.add(h),
                });
              },
            });
          } catch {
            /* SplitText נכשל (טקסט חריג וכו') — הכותרת נשארת גלויה כפי שהיא */
          }
        });
      });

      return () => {
        window.removeEventListener("load", onLoad);
      };
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="v2-root" dir="rtl">
      {children}
    </div>
  );
}
