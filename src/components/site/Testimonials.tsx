"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionKicker } from "@/components/ui/SectionHeading";
import { Stars } from "@/components/ui/Stars";

/* חוות דעת לדוגמה מהרפרנס — תוכן מומצא, להחליף בביקורות אמיתיות לפני השקה */
const REVIEWS = [
  {
    quote:
      "״הדירה הייתה נקייה, מעוצבת ומאובזרת בדיוק כמו בתמונות. הנוף לים פשוט מושלם והמיקום קרוב להכול. נחזור בלי ספק!״",
    name: "שרה מ.",
    meta: "חופשה זוגית · אוגוסט",
    initial: "ש",
    avatarBg: "linear-gradient(135deg,var(--color-ocean-600),var(--color-navy-800))",
  },
  {
    quote:
      "״הגעתי לרילוקיישן של חצי שנה בעבודה. הכול היה מסודר מהיום הראשון — דירה מאובזרת, אינטרנט מהיר ושקט מוחלט. בדיוק מה שצריך.״",
    name: "דניאל ל.",
    meta: "רילוקיישן · אינטל",
    initial: "ד",
    avatarBg: "linear-gradient(135deg,#2f80b4,var(--color-ocean-700))",
  },
  {
    quote:
      "״הזמנו סוויטה משפחתית לחופשת הקיץ והילדים פשוט לא רצו לעזוב. המרפסת מול הים, הניקיון והיחס האישי — חמישה כוכבים בלי הנחות.״",
    name: "מיכל ב.",
    meta: "חופשה משפחתית · יולי",
    initial: "מ",
    avatarBg: "linear-gradient(135deg,var(--color-ocean-600),var(--color-ocean-400))",
  },
  {
    quote:
      "״אירחנו צוות מחו״ל לשבוע עבודה. הדירות מרווחות, הצ׳ק-אין היה חלק והתמיכה זמינה בכל שעה. נזמין שוב בלי היסוס.״",
    name: "יוסי ק.",
    meta: "אירוח עסקי · ZIM",
    initial: "י",
    avatarBg: "linear-gradient(135deg,#2f80b4,var(--color-ocean-700))",
  },
];

const GAP = 22;
const per = () => (window.innerWidth < 640 ? 1 : 2);
const lastStart = () => Math.max(0, REVIEWS.length - per());

/* קרוסלה בדפדוף עמודים — פורט מהמנוע של הרפרנס: מציגה בדיוק PER כרטיסים
   (ללא חיתוך), מדפדפת ב-PER, translateX נמדד מגיאומטריה בפועל (אגנוסטי ל-RTL),
   מעבר 0.55s ease-pop, חצים מנוטרלים בקצוות. ponytail: אין autoplay ואין
   גרירת מגע — גם ברפרנס אין. */
export function Testimonials() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const cards = useCallback((): HTMLElement[] => {
    const track = trackRef.current;
    return track ? Array.from(track.querySelectorAll<HTMLElement>("[data-card]")) : [];
  }, []);

  const sizeCards = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const n = per();
    const w = Math.floor((vp.clientWidth - GAP * (n - 1)) / n);
    if (w < 120) return;
    cards().forEach((c) => {
      c.style.flex = `0 0 ${w}px`;
      c.style.width = `${w}px`;
    });
  }, [cards]);

  const goToIndex = useCallback(
    (i: number) => {
      const vp = viewportRef.current;
      const track = trackRef.current;
      if (!vp || !track) return;
      const cs = cards();
      if (!cs.length) return;
      i = Math.max(0, Math.min(lastStart(), i));
      indexRef.current = i;

      // מדידה במצב לא-מוזז. חובה לנטרל את ה-transition בזמן המדידה:
      // הצבת transform באמצע מעבר פעיל מתחילה מעבר חדש, ו-getBoundingClientRect
      // מחזיר את המיקום המונפש הישן — המדידה יוצאת מוסטת (באג סמוי גם ברפרנס)
      const visual = getComputedStyle(track).transform;
      track.style.transition = "none";
      track.style.transform = "translateX(0px)";
      const vpRect = vp.getBoundingClientRect();
      const trRect = track.getBoundingClientRect();
      const rights = cs.map((c) => c.getBoundingClientRect().right - vpRect.left);
      const lo = Math.min(0, -(trRect.right - vpRect.right));
      const hi = Math.max(0, -(trRect.left - vpRect.left));

      // חזרה למיקום הוויזואלי הנוכחי בלי אנימציה, ואז מעבר חלק אל היעד
      track.style.transform = visual === "none" ? "translateX(0px)" : visual;
      void track.getBoundingClientRect();
      track.style.transition = "";

      const tx = Math.max(lo, Math.min(hi, vpRect.width - rights[i]));
      track.style.transform = `translateX(${Math.round(tx)}px)`;
      setAtStart(i <= 0);
      setAtEnd(i >= lastStart());
    },
    [cards]
  );

  useEffect(() => {
    const relayout = () => {
      sizeCards();
      goToIndex(indexRef.current);
    };
    relayout();
    const t = window.setTimeout(relayout, 300); // אחרי טעינת גופנים
    window.addEventListener("resize", relayout, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", relayout);
    };
  }, [sizeCards, goToIndex]);

  const arrowCls =
    "flex size-[52px] items-center justify-center rounded-full border-[1.5px] border-[#cdd9e4] bg-white text-navy-800 transition-[background-color,color,border-color,opacity,transform] duration-300 hover:enabled:-translate-y-0.5 hover:enabled:border-navy-800 hover:enabled:bg-navy-800 hover:enabled:text-white disabled:cursor-default disabled:opacity-[0.32] motion-reduce:transition-none motion-reduce:hover:enabled:translate-y-0";

  return (
    <section id="testimonials" className="bg-cloud py-14 md:py-20">
      <Container>
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-3.5">
            <SectionKicker>אורחים מספרים</SectionKicker>
            <h2
              data-ws=""
              className="text-[32px]/[1.2] font-extrabold tracking-heading text-navy-800 md:text-h2"
            >
              מה שאומרים עלינו
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="הקודם"
              disabled={atStart}
              onClick={() => goToIndex(indexRef.current - per())}
              className={arrowCls}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="הבא"
              disabled={atEnd}
              onClick={() => goToIndex(indexRef.current + per())}
              className={arrowCls}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-[22px] lg:flex-row">
          <div className="flex flex-col justify-center rounded-card-lg bg-[linear-gradient(155deg,var(--color-navy-800),var(--color-ocean-600))] p-7 text-white lg:w-[300px] lg:shrink-0">
            <div data-count="" className="text-[58px] leading-none font-extrabold">
              4.8
            </div>
            <div className="my-3">
              <Stars size={18} />
            </div>
            <p data-rev="up" className="text-[14.5px] leading-[1.55] text-[#bcd4e6]">
              דירוג ממוצע ממאות אורחים מרוצים בגוגל ובבוקינג
            </p>
          </div>

          <div
            ref={viewportRef}
            className="-my-2 min-w-0 flex-1 overflow-hidden py-2"
          >
            <div
              ref={trackRef}
              className="flex w-max gap-[22px] transition-transform duration-[550ms] ease-pop will-change-transform motion-reduce:transition-none"
            >
              {REVIEWS.map((r) => (
                <figure
                  key={r.name}
                  data-card=""
                  className="w-[300px] shrink-0 rounded-card-lg bg-white p-7 shadow-e2"
                >
                  <Stars size={16} />
                  <blockquote className="mt-3.5 mb-5 text-[16px] leading-[1.65] font-medium text-[#2c4257]">
                    {r.quote}
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-[46px] shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                      style={{ background: r.avatarBg }}
                    >
                      {r.initial}
                    </span>
                    <span>
                      <span className="block text-[15px] font-bold text-navy-800">{r.name}</span>
                      <span className="block text-[13px] text-ink-muted">{r.meta}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
