"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { track } from "@/lib/analytics";

/* באנר "התקינו כאפליקציה" — בקר יחיד ברמת תבנית האתר (לא פר-עמוד).

   מדיניות תצוגה: רק גולשי מובייל, רק כשהאתר לא רץ כבר כאפליקציה מותקנת,
   פעם אחת לכל ביקור (session), ועם השתקה של 7 ימים לאחר סגירה ידנית.
   אנדרואיד/כרומיום: beforeinstallprompt נתפס ומופעל רק מלחיצת המשתמש.
   iOS: אין beforeinstallprompt — מוצגות הוראות "הוספה למסך הבית".
   דפדפני מובייל אחרים: הוראות תפריט-דפדפן במקום כפתור שלא עושה כלום. */

const DISMISS_KEY = "st-pwa-dismissed-at";
const INSTALLED_KEY = "st-pwa-installed";
const SESSION_KEY = "st-pwa-shown";
const DISMISS_DAYS = 7;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Mode = "native" | "ios" | "menu";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isMobileViewport(): boolean {
  return window.matchMedia("(max-width: 900px) and (pointer: coarse)").matches;
}

function isIos(): boolean {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (/mac/i.test(ua) && navigator.maxTouchPoints > 1);
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="inline-block align-[-2px]">
      <path d="M12 3v12M8 6.5 12 3l4 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 11H5a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 5 21h14a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 19 11h-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function InstallPrompt() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const bipRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    try {
      if (isStandalone() || !isMobileViewport()) return;
      if (localStorage.getItem(INSTALLED_KEY)) return;
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return; // אחסון חסום (מצב פרטי מחמיר) — לא מציגים כדי לא להטריד בכל עמוד
    }

    let cancelled = false;
    const show = (m: Mode) => {
      if (cancelled || isStandalone()) return;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* noop */
      }
      setMode(m);
      track({ name: "pwa_install_prompt_shown", platform: m });
    };

    const onBip = (e: Event) => {
      e.preventDefault();
      bipRef.current = e as BeforeInstallPromptEvent;
      show("native");
    };
    window.addEventListener("beforeinstallprompt", onBip);

    const onInstalled = () => {
      try {
        localStorage.setItem(INSTALLED_KEY, "1");
      } catch {
        /* noop */
      }
      track({ name: "pwa_installed" });
      setMode(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    /* בלי אירוע התקנה נטיבי: iOS מקבל הוראות שיתוף, שאר הדפדפנים הוראות
       תפריט. ההשהיה מפנה את הרגע הראשון להידרציה ולתוכן עצמו. */
    const fallback = window.setTimeout(() => {
      if (bipRef.current) return;
      show(isIos() ? "ios" : "menu");
    }, 3500);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mode) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* noop */
    }
    track({ name: "pwa_install_dismissed" });
    setMode(null);
  };

  const install = async () => {
    if (mode === "native" && bipRef.current) {
      track({ name: "pwa_install_clicked", platform: "native" });
      const bip = bipRef.current;
      bipRef.current = null;
      await bip.prompt();
      const choice = await bip.userChoice.catch(() => null);
      if (choice?.outcome === "accepted") {
        track({ name: "pwa_install_accepted" });
        setMode(null);
      } else {
        /* החלון הנטיבי נדחה — האירוע נוצל ולא יירה שוב בסשן הזה, לכן
           הכפתור עובר להוראות תפריט כדי שלא יבטיח התקנה שאינה זמינה */
        setMode("menu");
      }
      return;
    }
    const platform = mode === "ios" ? "ios" : "menu";
    if (!showHelp) track({ name: "pwa_install_instructions_shown", platform });
    setShowHelp((v) => !v);
  };

  return (
    <div
      role="region"
      aria-label="התקנת האפליקציה"
      className="fixed inset-x-3 bottom-3 z-[80] pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="rounded-card border border-black/10 bg-white p-4 shadow-e3">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={44}
            height={44}
            className="shrink-0 rounded-btn"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold leading-snug text-navy-800">התקינו את מגדל הים</p>
            <p className="mt-0.5 text-[13px] leading-snug text-slate-600">
              הוסיפו את האתר למסך הבית לגישה מהירה, בחוויית אפליקציה מלאה.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="סגירת הצעת ההתקנה"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate-500 transition-colors hover:bg-black/5"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {showHelp && (
          <ol className="mt-3 flex list-none flex-col gap-1.5 border-t border-black/10 pt-3 text-[13.5px] leading-relaxed text-slate-700">
            {mode === "ios" ? (
              <>
                <li>
                  1. פתחו את תפריט השיתוף <ShareIcon /> בסרגל הדפדפן
                </li>
                <li>2. בחרו ״הוספה למסך הבית״</li>
                <li>3. אשרו — והאפליקציה תופיע במסך הבית</li>
              </>
            ) : (
              <>
                <li>1. פתחו את תפריט הדפדפן (⋮)</li>
                <li>2. בחרו ״הוספה למסך הבית״ או ״התקנת אפליקציה״</li>
                <li>3. אשרו — והאפליקציה תופיע במסך הבית</li>
              </>
            )}
          </ol>
        )}

        <button
          type="button"
          onClick={install}
          className="mt-3 h-11 w-full rounded-btn bg-navy-800 px-4 text-[14.5px] font-bold text-white transition-colors hover:bg-navy-700"
        >
          {mode === "native" ? "התקנה" : showHelp ? "הסתרת ההוראות" : "איך מתקינים?"}
        </button>
      </div>
    </div>
  );
}
