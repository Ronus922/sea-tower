"use client";

import { useEffect } from "react";

/* מנוע התנועה של עמוד הבית — פורט מהמנוע האוניברסלי של הרפרנס.
   ה-CSS ב-motion.css; כאן רק ה-JS: חשיפות (IntersectionObserver, פעם אחת),
   פיצול כותרות למילים, מוני ספירה, צל header, פרלקסה, פס התקדמות,
   מהירות מרקיזה וזרימת שליחת טפסים. הכול transform/opacity בלבד. */

const WORD_DELAY_MS = 68;
const WORD_DELAY_CAP_MS = 780;
const STAGGER_MS = 100;
const STAGGER_CAP_MS = 500;
const MARQUEE_PX_PER_MS = 0.055;

function splitWords(el: HTMLElement) {
  if (el.dataset.split) return;
  el.dataset.split = "1";
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((c) => {
      if (c.nodeType === Node.TEXT_NODE) {
        if (!c.nodeValue?.trim()) return;
        const frag = document.createDocumentFragment();
        c.nodeValue.split(/(\s+)/).forEach((p) => {
          if (!p) return;
          if (!p.trim()) {
            frag.appendChild(document.createTextNode(p));
            return;
          }
          const s = document.createElement("span");
          s.className = "stm-w";
          s.textContent = p;
          frag.appendChild(s);
        });
        node.replaceChild(frag, c);
      } else if (c.nodeType === Node.ELEMENT_NODE && (c as HTMLElement).tagName !== "BR") {
        // ביטוי עם bg-clip:text (הגרדיאנט ב-H1) = יחידה אחת, כדי לשמור על המילוי
        const child = c as HTMLElement;
        const g = getComputedStyle(child);
        if (g.webkitBackgroundClip === "text" || g.backgroundClip === "text") {
          child.classList.add("stm-w");
        } else {
          walk(child);
        }
      }
    });
  };
  walk(el);
  el.classList.add("stm-ws-ready");
}

function revealWords(el: HTMLElement) {
  if (el.dataset.wdone) return;
  el.dataset.wdone = "1";
  el.querySelectorAll<HTMLElement>(".stm-w").forEach((w, i) => {
    w.style.animationDelay = Math.min(i * WORD_DELAY_MS, WORD_DELAY_CAP_MS) + "ms";
    w.classList.add("stm-win");
  });
}

function revealEl(el: HTMLElement) {
  if (el.hasAttribute("data-ws")) {
    revealWords(el);
    return;
  }
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
  el.classList.add("stm-ws-ready");
  el.querySelectorAll<HTMLElement>(".stm-w").forEach((w) => {
    w.style.opacity = "1";
  });
}

/* ספירת כל מספר בטקסט (טווחים כמו "34–110", יחסים כמו "24/7") — animNumbers מהרפרנס */
function countUpText(el: HTMLElement, durMs: number) {
  if (el.dataset.cu) return;
  el.dataset.cu = "1";
  const tpl = el.textContent ?? "";
  const re = /\d+(?:\.\d+)?/g;
  const nums = Array.from(tpl.matchAll(re)).map((m) => ({
    v: parseFloat(m[0]),
    dec: (m[0].split(".")[1] || "").length,
  }));
  if (!nums.length) return;
  let t0: number | null = null;
  const frame = (t: number) => {
    if (t0 === null) t0 = t;
    const p = Math.min((t - t0) / durMs, 1);
    const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
    let i = 0;
    el.textContent = tpl.replace(re, () => {
      const n = nums[i++];
      return (n.v * e).toFixed(n.dec);
    });
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = tpl;
  };
  requestAnimationFrame(frame);
  window.setTimeout(() => {
    el.textContent = tpl;
  }, durMs + 2700); // רשת ביטחון אם rAF הושהה
}

function setupForm(form: HTMLFormElement) {
  if (form.dataset.wired) return;
  form.dataset.wired = "1";
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!btn || btn.hasAttribute("data-stm-loading")) return;
    const fields = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input,textarea")
    );
    let ok = true;
    fields.forEach((f) => {
      const v = f.value.trim();
      let bad = !v;
      if (!bad && f.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      f.classList.toggle("stm-invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) {
      form.querySelector<HTMLElement>(".stm-invalid")?.focus();
      return;
    }
    const single = fields.length === 1 && fields[0].type === "email";
    const html = btn.innerHTML;
    btn.setAttribute("data-stm-loading", "");
    btn.innerHTML =
      '<span class="stm-spin"></span><span>' + (single ? "נרשם…" : "שולח…") + "</span>";
    window.setTimeout(() => {
      btn.innerHTML = "<span>" + (single ? "✓ נרשמת!" : "✓ נשלח, נחזור אליכם") + "</span>";
      window.setTimeout(() => {
        btn.removeAttribute("data-stm-loading");
        btn.innerHTML = html;
        if (single) fields[0].value = "";
      }, 2200);
    }, 1300);
  });
}

export function MotionEngine() {
  useEffect(() => {
    const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const MOBILE = matchMedia("(max-width: 768px)").matches;
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

    /* --- זרימת שליחה לטפסים (כולל ניוזלטר בפוטר) --- */
    document.querySelectorAll<HTMLFormElement>("main form, footer form").forEach(setupForm);

    /* --- מוני ספירה --- */
    const countTargets = document.querySelectorAll<HTMLElement>("[data-countup]");
    const ratingTargets = document.querySelectorAll<HTMLElement>("[data-count]");
    if (RM) {
      // סטטי — הטקסט כבר מכיל את הערכים הסופיים
    } else if (countTargets.length || ratingTargets.length) {
      const io = new IntersectionObserver(
        (ents) => {
          ents.forEach((e) => {
            if (!e.isIntersecting) return;
            const el = e.target as HTMLElement;
            countUpText(el, el.hasAttribute("data-count") ? 1450 : 1500);
            io.unobserve(el);
          });
        },
        { threshold: 0.4 }
      );
      [...countTargets, ...ratingTargets].forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    /* --- חשיפות --- */
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-rev], [data-ws]"));
    if (RM) {
      targets.forEach(forceVisible);
    } else if (targets.length) {
      // פיצול כותרות + סטאגר לקבוצה (לפי הורה משותף)
      const groupIdx = new Map<HTMLElement | null, number>();
      targets.forEach((el) => {
        if (el.hasAttribute("data-ws")) {
          splitWords(el);
          return;
        }
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

      // רשתות ביטחון (מהרפרנס): לעולם לא משאירים תוכן מוסתר
      timers.push(
        window.setTimeout(() => {
          targets.forEach((el) => {
            const gated =
              el.hasAttribute("data-rev") ||
              (el.hasAttribute("data-ws") && !el.dataset.wdone);
            if (gated && el.getBoundingClientRect().top < (window.innerHeight || 800)) {
              revealEl(el);
            }
          });
        }, 4000),
        window.setTimeout(() => targets.forEach(forceVisible), 14000)
      );
    }

    /* --- פרלקסה עדינה על תמונת ה-Hero (דסקטופ בלבד) --- */
    const px = document.querySelector<HTMLElement>("[data-parallax]");
    if (px && !RM && !MOBILE) {
      const base = px.getBoundingClientRect().top + window.scrollY;
      let ticking = false;
      const upd = () => {
        ticking = false;
        const rel = window.scrollY + window.innerHeight * 0.32 - base;
        const off = Math.max(-20, Math.min(20, rel * 0.04));
        px.style.transform = `translateY(${-off}px)`;
      };
      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(upd);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
      upd();
    }

    /* --- פס התקדמות גלילה (PLUS) --- */
    if (!RM) {
      let bar = document.getElementById("stm-prog");
      if (!bar) {
        bar = document.createElement("div");
        bar.id = "stm-prog";
        document.body.appendChild(bar);
      }
      const el = bar;
      let ticking = false;
      const upd = () => {
        ticking = false;
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight || 1;
        el.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / max))})`;
      };
      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(upd);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", upd, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", upd);
        el.remove();
      });
      upd();
    }

    /* --- מהירות מרקיזה: ‎55px/s קבועים, לפי רוחב סדרה נמדד --- */
    const track = document.querySelector<HTMLElement>(".mqq-track");
    if (track && !RM) {
      const setDur = () => {
        const set = track.querySelector<HTMLElement>(".mqq-set");
        const w = set?.getBoundingClientRect().width ?? 0;
        if (w > 0) track.style.animationDuration = Math.round(w / MARQUEE_PX_PER_MS) + "ms";
      };
      setDur();
      window.addEventListener("resize", setDur, { passive: true });
      cleanups.push(() => window.removeEventListener("resize", setDur));
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
