"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin, useGSAP);

/* מעטפת /v3 — "שמש ששוקעת לאורך הגלילה" + שלושת אלמנטי /v2 מוגברים.
   גלילה = יום שעובר מול הים: שמש נעה על קשת מימין-למעלה לשמאל-למטה
   (כיוון השקיעה האמיתי בחוף הכרמל, תואם RTL), קו מצטייר מאחוריה,
   והרקע עובר תכלת בוקר → אור יום → זהב → נייבי לילה.

   עיקרון הבטיחות של /v2 נשמר: שום מצב מוסתר ב-CSS. ברירות המחדל של
   המשתנים (v3.css) נותנות סצנה סטטית קריאה — זה גם מצב no-JS וגם
   מצב reduced-motion (שמש קבועה, רקע אחד, אפס תנועה) */

/* ארבע תחנות היום — הזהב הוא --color-sand מהברנדבוק, הלילה navy-800 */
const SKY = ["#9fd4f0", "#e8f4fb", "#c2a16a", "#0e2540"];
const SUN = ["#fff3cf", "#ffe08a", "#ff9e4f", "#ff6b35"];
const INK_DARK = "#0e2540";
const INK_LIGHT = "#eaf4fb";

export function V3Root({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      document.fonts.ready.then(() => ScrollTrigger.refresh());
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad, { once: true });

      const mm = gsap.matchMedia();

      /* ---- השמש, הקו והרקע — בכל הרוחבים (לב העמוד, נשאר גם במובייל);
         ‏reduced-motion: אף תנאי לא נרשם — הסצנה הסטטית של ה-CSS ---- */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const path = root.querySelector<SVGPathElement>(".v3-sun-path");
        const sun = root.querySelector<HTMLElement>(".v3-sun");
        const pageScrub = {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        } as const;

        if (path && sun) {
          /* השמש על הקשת — MotionPathPlugin ממפה את קואורדינטות ה-SVG
             (viewBox נמתח על ה-viewport) אל ה-div דרך align */
          gsap.to(sun, {
            motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
            ease: "none",
            scrollTrigger: pageScrub,
          });
          /* הקו מצטייר מאחוריה — dashoffset על אותה התקדמות */
          const len = path.getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
          gsap.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: pageScrub });
        }

        /* רקע + צבע שמש + צבע טקסט — משתני CSS על השורש בלבד, לא רקעים
           פר-אלמנט. היפוך הטקסט כהה→בהיר נעשה בחלון צר (2.45–2.63 מתוך 3)
           בתוך מעבר זהב→לילה, כדי שלא יהיה אזור שבו טקסט-ביניים אפרפר
           יושב על רקע-ביניים באותה בהירות */
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 1 },
        });
        tl.fromTo(root, { "--v3-sky": SKY[0] }, { "--v3-sky": SKY[1], duration: 1, ease: "none" }, 0)
          .to(root, { "--v3-sky": SKY[2], duration: 1, ease: "none" }, 1)
          .to(root, { "--v3-sky": SKY[3], duration: 1, ease: "none" }, 2)
          .fromTo(root, { "--v3-sun-c": SUN[0] }, { "--v3-sun-c": SUN[1], duration: 1, ease: "none" }, 0)
          .to(root, { "--v3-sun-c": SUN[2], duration: 1, ease: "none" }, 1)
          .to(root, { "--v3-sun-c": SUN[3], duration: 1, ease: "none" }, 2)
          .fromTo(
            root,
            { "--v3-ink": INK_DARK },
            { "--v3-ink": INK_LIGHT, duration: 0.18, ease: "none" },
            2.45
          );
      });

      /* ---- אלמנט 1 (מוגבר): כותרות שורה-שורה — stagger 0.14, משך 0.9 ---- */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const revealed = new Set<Element>();
        gsap.utils.toArray<HTMLElement>("[data-v3-title]", root).forEach((h) => {
          try {
            SplitText.create(h, {
              type: "lines",
              mask: "lines",
              linesClass: "v3-line",
              autoSplit: true,
              onSplit(self) {
                if (revealed.has(h)) return;
                return gsap.from(self.lines, {
                  yPercent: 100,
                  duration: 0.9,
                  stagger: 0.14,
                  ease: "power3.out",
                  scrollTrigger: { trigger: h, start: "top 85%", once: true },
                  onComplete: () => revealed.add(h),
                });
              },
            });
          } catch {
            /* SplitText נכשל — הכותרת נשארת גלויה כפי שהיא */
          }
        });
      });

      /* ---- אלמנט 3 (מוגבר): תמונות דירות — משך 1.2, ‏scale 1.14 ---- */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const container = root.querySelector("[data-v3-cards]");
        if (!container) return;
        const media = gsap.utils.toArray<HTMLElement>(".v3-room-media", container);
        const imgs = media
          .map((m) => m.querySelector("img"))
          .filter((i): i is HTMLImageElement => i !== null);
        if (!media.length) return;

        gsap.set(media, { clipPath: "inset(0 0 100% 0)" });
        gsap.set(imgs, { scale: 1.14 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: container, start: "top 80%", once: true },
          onComplete: () => {
            gsap.set(media, { clearProps: "clipPath" });
            gsap.set(imgs, { clearProps: "transform" });
          },
        });
        tl.to(media, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.12,
        }).to(imgs, { scale: 1, duration: 1.2, ease: "power2.out", stagger: 0.12 }, 0);
      });

      /* ---- אלמנט 2 (מוגבר): פרלקסת וידאו — מהלך 30% מהמיכל (דסקטופ בלבד).
         הווידאו בגובה 130% (‏v3.css); ‏yPercent נמדד מגובה האלמנט, ולכן
         30% מהמיכל = ‏30/1.3 ≈ ‏23.08 — כך העודף מכסה את המהלך במדויק ---- */
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const hero = root.querySelector("[data-v3-hero]");
        const video = root.querySelector("[data-v3-video]");
        if (!hero || !video) return;
        gsap.to(video, {
          yPercent: 23.08,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
        });
      });

      return () => {
        window.removeEventListener("load", onLoad);
      };
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="v3-root" dir="rtl">
      {/* שכבת השמיים — fixed, מאחורי כל התוכן, לא תופסת אירועים */}
      <div className="v3-sky" aria-hidden="true">
        <svg className="v3-sun-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          {/* קשת רדודה: ימין-למעלה → שמאל-למטה (שקיעה מערבה, RTL).
              ‏vectorEffect שומר על עובי קו קבוע גם כשה-viewBox נמתח */}
          <path
            className="v3-sun-path"
            d="M 935 140 Q 470 55 70 845"
            fill="none"
            stroke="#ffb25e"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0"
          />
        </svg>
        <div className="v3-sun" />
      </div>
      {children}
    </div>
  );
}
