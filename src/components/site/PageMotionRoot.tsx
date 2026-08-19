"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/* מעטפת תנועה רוחבית לעמודי תוכן — GSAP בלבד, אנכי בלבד.

   למה היא קיימת: מנוע החשיפה הישן (MotionEngine + data-rev/data-ws) נותן
   לכל אלמנט IntersectionObserver משלו, עם מרחקים שונים (46px לפסקה, 30px
   לתמונה, 20px לכפתור), משכים שונים והשהיות שונות. בגלילה העין רואה חמישה
   דברים זזים בחמש מהירויות במקביל — זה מה שנקרא "קפיצות". כאן כל בלוק הוא
   יחידה כוריאוגרפית אחת: טריגר יחיד, גל אחד, מרחקים קצרים.

   עיקרון בטיחות (זהה ל-HomeMotionRoot): שום מצב-התחלה מוסתר לא יושב ב-CSS.
   ההסתרה מוחלת רק כאן, אחרי ש-GSAP נטען בפועל — JS כבוי או נכשל ⇒ כל התוכן
   גלוי. reduced-motion: לא נרשם שום תנאי, כלום לא מונפש ודבר לא מוסתר.

   ה-API הוא attributes בלבד, כך שכל עמוד יכול לאמץ אותה בלי קוד חדש:

     data-motion-group   בלוק שנחשף כיחידה אחת (טריגר יחיד לכל צאצאיו)
     data-line-reveal    כותרת — שורה-אחר-שורה מתוך מסכה (אותו attribute
                         שכבר משמש את SectionHeading reveal="lines")
     data-motion-media   עוטף מדיה — clip-path נפתח מלמטה + zoom-out פנימי
     data-motion-item    פריט טקסט/כפתור — עלייה קצרה ב-stagger לפי סדר DOM
     data-motion-batch   מיכל כרטיסים; הצאצאים המסומנים ב-data-motion-card
                         נחשפים ב-ScrollTrigger.batch (מי שנכנס יחד — יחד)

   אלמנט מנוהל כאן לא יישא לעולם data-rev / data-ws — אפס חפיפה בין המנועים. */

const EASE_IN = "power3.out";
const EASE_MEDIA = "power2.out";

/* זהה ל-HomeMotionRoot. הפינות המעוגלות נשמרות דרך ה-overflow:hidden של
   העוטף (חיתוך ה-clip-path מצטלב איתו), ולכן אין צורך ב-round שמכניס
   יחידות שונות לשני קצות ה-tween */
const CLIP_HIDDEN = "inset(0% 0% 100% 0%)";
const CLIP_SHOWN = "inset(0% 0% 0% 0%)";

/* נקודות ההצתה: הבלוק מתחיל כשרבע העליון שלו כבר בפריים — לא ב-5% כמו
   ה-IntersectionObserver הישן, שגרם לתוכן להיפתח כשבקושי הציץ */
const START_GROUP = "top 78%";
const START_HEADING = "top 85%";
const START_LOOSE = "top 90%";
const START_CARDS = "top 88%";

/* עמדות בגל: המדיה פותחת, הכותרת נכנסת אחריה, הפריטים סוגרים */
const AT_HEADING = 0.12;
const AT_ITEMS = 0.26;

export function PageMotionRoot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      /* נקודות ההתחלה מחושבות על ה-layout הסופי: פונטים משנים גובה שורה,
         תמונות משנות גובה מקטע. בלי ה-refresh האלה טריגרים יורים מוקדם */
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad, { once: true });

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* ---- בלוקים כוריאוגרפיים ---- */
        gsap.utils.toArray<HTMLElement>("[data-motion-group]", root).forEach((group) => {
          const media = group.querySelector<HTMLElement>("[data-motion-media]");
          const mediaImg = media?.querySelector("img") ?? null;
          const items = gsap.utils.toArray<HTMLElement>("[data-motion-item]", group);
          const headings = gsap.utils.toArray<HTMLElement>("[data-line-reveal]", group);
          if (!media && !items.length && !headings.length) return;

          /* המצב המוסתר מוחל רק כאן — אחרי ש-GSAP נטען בפועל */
          if (media) gsap.set(media, { clipPath: CLIP_HIDDEN });
          if (mediaImg) {
            /* ה-transition של זום ה-hover רודף אחרי כל פריים של GSAP ויוצר
               גרירה. מנטרלים למשך החשיפה ומחזירים ב-clearProps */
            gsap.set(mediaImg, { scale: 1.06, transition: "none" });
          }
          if (items.length) gsap.set(items, { autoAlpha: 0, y: 18 });

          const tl = gsap.timeline({
            scrollTrigger: { trigger: group, start: START_GROUP, once: true },
            onComplete: () => {
              if (media) gsap.set(media, { clearProps: "clipPath" });
              if (mediaImg) gsap.set(mediaImg, { clearProps: "transform,transition" });
              if (items.length) gsap.set(items, { clearProps: "opacity,visibility,transform" });
            },
          });

          if (media) tl.to(media, { clipPath: CLIP_SHOWN, duration: 0.9, ease: EASE_MEDIA }, 0);
          if (mediaImg) tl.to(mediaImg, { scale: 1, duration: 1.1, ease: EASE_MEDIA }, 0);
          if (items.length) {
            tl.to(
              items,
              { autoAlpha: 1, y: 0, duration: 0.55, ease: EASE_IN, stagger: 0.07 },
              AT_ITEMS
            );
          }

          /* הכותרת מקבלת tween עצמאי עם ScrollTrigger משלה (ולא ילד של ה-tl):
             SplitText מפצל מחדש אחרי טעינת פונט/שינוי רוחב, והוספת tween
             לטיימליין שכבר הסתיים הייתה מקפיאה את השורות במצב המוסתר */
          headings.forEach((h) => revealLines(h, group, START_GROUP, AT_HEADING));
        });

        /* ---- כותרות עצמאיות (מחוץ לכל בלוק) ---- */
        gsap.utils.toArray<HTMLElement>("[data-line-reveal]", root).forEach((h) => {
          if (h.closest("[data-motion-group]")) return;
          revealLines(h, h, START_HEADING, 0);
        });

        /* ---- פריטים עצמאיים ---- */
        const loose = gsap.utils
          .toArray<HTMLElement>("[data-motion-item]", root)
          .filter((el) => !el.closest("[data-motion-group]"));
        if (loose.length) {
          gsap.set(loose, { autoAlpha: 0, y: 18 });
          batchIn(loose, START_LOOSE, 0.55, 0.07);
        }

        /* ---- כרטיסים ב-batch ---- */
        gsap.utils.toArray<HTMLElement>("[data-motion-batch]", root).forEach((box) => {
          const cards = gsap.utils.toArray<HTMLElement>("[data-motion-card]", box);
          if (!cards.length) return;
          gsap.set(cards, { autoAlpha: 0, y: 24 });
          batchIn(cards, START_CARDS, 0.7, 0.1);
        });
      });

      return () => {
        window.removeEventListener("load", onLoad);
      };
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className={className ? `page-motion ${className}` : "page-motion"}>
      {children}
    </div>
  );
}

function batchIn(targets: HTMLElement[], start: string, duration: number, stagger: number) {
  ScrollTrigger.batch(targets, {
    start,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration,
        ease: EASE_IN,
        stagger,
        onComplete: () => gsap.set(batch, { clearProps: "opacity,visibility,transform" }),
      }),
  });
}

/* פיצול כותרת לשורות וחשיפתן מתוך מסכה.
   lines בלבד — לעולם לא chars/words: פיצול לתווים שובר ניקוד ואותיות
   סופיות בעברית. mask עוטף כל שורה ב-overflow:hidden, כך שהעלייה נראית
   כחשיפה מאחורי קו ולא כטקסט מרחף. */
function revealLines(h: HTMLElement, trigger: Element, start: string, delay: number) {
  try {
    SplitText.create(h, {
      type: "lines",
      mask: "lines",
      linesClass: "page-motion-line",
      /* פיצול מחדש אחרי טעינת פונטים ובשינוי רוחב (סיבוב מסך) */
      autoSplit: true,
      onSplit(self) {
        /* כותרת שכבר נחשפה לא חוזרת למצב מוסתר אחרי re-split */
        if (h.dataset.lineDone) return;
        return gsap.from(self.lines, {
          yPercent: 100,
          duration: 0.7,
          stagger: 0.08,
          ease: EASE_IN,
          delay,
          scrollTrigger: { trigger, start, once: true },
          onComplete: () => {
            h.dataset.lineDone = "1";
          },
        });
      },
    });
  } catch {
    /* SplitText נכשל (טקסט חריג וכו') — הכותרת נשארת גלויה כפי שהיא */
  }
}
