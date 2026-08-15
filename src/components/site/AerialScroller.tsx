"use client";

import { useEffect, useRef } from "react";

/* מנוע ה-scrollytelling של עמוד /aerial — הסרטון "מפורק" לגלילה:
   ההתקדמות בעמוד קובעת את currentTime של הווידאו (סקראב), במקום ניגון רגיל.

   עקרונות, בהמשך לכללי היציבות של PR #10:
   • הווידאו קודד עם keyframe כל 4 פריימים (g=4) — בלעדיו seek דו-כיווני מגמגם.
   • ה-target נרדף ב-lerp בתוך rAF — הגלילה מרגישה אינרציאלית ולא "מדרגות".
   • שכבת ההרכבה בלבד: transform/opacity לכיתובים ולפס ההתקדמות; אין layout.
   • prefers-reduced-motion: בלי חטיפת גלילה — הסרטון מקבל פקדים רגילים
     והכיתובים מוצגים סטטית (המסלול מתקצר ל-100vh דרך .is-static).
   • בחירת קובץ לפי רוחב מסך: 540p לנייד (9.8MB), 1080p לדסקטופ (31MB). */

const SRC_DESKTOP = "/videos/aerial-scrub-1080.mp4";
const SRC_MOBILE = "/videos/aerial-scrub-540.mp4";
const LERP = 0.22;

export function AerialScroller() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const video = videoRef.current;
    const bar = barRef.current;
    if (!track || !video) return;

    const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const MOBILE = matchMedia("(max-width: 900px)").matches;
    video.src = MOBILE ? SRC_MOBILE : SRC_DESKTOP;
    const chapters = Array.from(track.querySelectorAll<HTMLElement>("[data-ae-from]"));

    if (RM) {
      /* ללא סקראב: וידאו רגיל עם פקדים, כל הכיתובים גלויים */
      track.classList.add("is-static");
      video.controls = true;
      video.preload = "metadata";
      chapters.forEach((c) => c.classList.add("is-on"));
      return;
    }

    video.preload = "auto";
    video.pause();

    let target = 0;
    let current = 0;
    let raf = 0;
    let running = false;

    const measure = () => {
      const vh = window.innerHeight || 800;
      const top = track.getBoundingClientRect().top + window.scrollY;
      return { start: top, span: Math.max(1, track.offsetHeight - vh) };
    };
    let geo = measure();

    const progress = () => Math.min(1, Math.max(0, (window.scrollY - geo.start) / geo.span));

    const frame = () => {
      raf = 0;
      const dur = video.duration;
      if (dur && video.readyState >= 2) {
        target = progress() * dur;
        current += (target - current) * LERP;
        if (Math.abs(target - current) < 0.004) current = target;
        video.currentTime = current;
      }
      const p = dur ? current / dur : progress();
      if (bar) bar.style.transform = `scaleX(${p})`;
      chapters.forEach((c) => {
        const on = p >= Number(c.dataset.aeFrom) && p <= Number(c.dataset.aeTo);
        c.classList.toggle("is-on", on);
      });
      /* ממשיכים לרדוף את היעד עד התכנסות — גם אחרי שהגלילה נעצרה */
      if (Math.abs(target - current) > 0.004) schedule();
      running = false;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      if (!running) {
        running = true;
        schedule();
      }
    };
    const onResize = () => {
      geo = measure();
      schedule();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    video.addEventListener("loadedmetadata", schedule);
    schedule();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      video.removeEventListener("loadedmetadata", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={trackRef} className="ae-track">
      <div className="ae-stage">
        <video
          ref={videoRef}
          className="ae-video"
          poster="/videos/aerial-poster.jpg"
          muted
          playsInline
          preload="none"
          aria-label="צילום אוויר של בניין אלמוג וחוף הכרמל בחיפה"
        />
        <div className="ae-scrim" aria-hidden="true" />

        {/* פרק הפתיחה — הכותרת של העמוד, על הפריים הרחב של קו החוף */}
        <div className="ae-chapter ae-title" data-ae-from="0" data-ae-to="0.18">
          <div className="ae-badge">
            <span aria-hidden="true" className="ae-badge-dot" />
            מגדל הים מהאוויר
          </div>
          <h1 className="ae-h1">
            חוף הכרמל,
            <br />
            <span className="ae-grad">בגובה מבט של שחף</span>
          </h1>
          <p className="ae-lead">
            טיסה אחת מעל קו המים — מהטיילת והחוף ועד דלת הכניסה של בניין אלמוג.
          </p>
          <div className="ae-hint" aria-hidden="true">
            גללו כדי לטוס
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* הפרקים — כיתובים בשפת עמוד הבית, מוצמדים לקטעי ההתקדמות */}
        <div className="ae-chapter ae-cap" data-ae-from="0.2" data-ae-to="0.42">
          <span className="ae-kicker">קו המים</span>
          <h2 className="ae-h2">50 מ׳ מהחוף והטיילת</h2>
          <p className="ae-text">
            החוף, שובר הגלים והטיילת של חוף הכרמל — הכול במרחק צעדים מהבניין.
          </p>
        </div>

        <div className="ae-chapter ae-cap" data-ae-from="0.46" data-ae-to="0.7">
          <span className="ae-kicker">הבניין</span>
          <h2 className="ae-h2">בניין אלמוג, מגדלי חוף הכרמל</h2>
          <p className="ae-text">
            החזית פונה אל הים התיכון — זה הנוף שמחכה בחלון של כל דירה.
          </p>
        </div>

        <div className="ae-chapter ae-cap" data-ae-from="0.76" data-ae-to="1">
          <span className="ae-kicker">הגעתם</span>
          <h2 className="ae-h2">ברוכים הבאים למגדל הים</h2>
          <p className="ae-text">הכניסה לבניין אלמוג — מכאן מתחילה החופשה שלכם.</p>
          <a href="/booking" className="ae-cta stm-btn-primary">
            בדיקת זמינות
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="#fff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* פס התקדמות הטיסה — aqua על תחתית הבמה, RTL */}
        <div className="ae-progress" aria-hidden="true">
          <div ref={barRef} className="ae-progress-fill" />
        </div>
      </div>
    </div>
  );
}
