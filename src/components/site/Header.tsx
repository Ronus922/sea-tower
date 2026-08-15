"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BUSINESS } from "@/lib/business";

/* הניווט הראשי — /rooms נוסף (העמוד המסחרי המרכזי נעדר ממנו לחלוטין,
   SEO-AUDIT A7); "תקנון" ירד לפוטר, שם מקומו של קישור משפטי */
const NAV = [
  { href: "/", label: "ראשי" },
  { href: "/rooms", label: "הדירות והסוויטות" },
  { href: "/solutions", label: "פתרונות אירוח" },
  { href: "/articles", label: "מאמרים" },
  { href: "/faq", label: "שאלות נפוצות" },
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "צור קשר" },
];

/* CTA יחיד ל-/booking — הטקסט מתחלף באפקט מכונת כתיבה בין "הזמינו עכשיו"
   ל"בדיקת זמינות" (איחוד שני כפתורים שהובילו לאותו יעד): מחיקה אות-אות,
   הקלדה אות-אות וסמן מהבהב. שני הטקסטים יושבים כרוחות-רפאים שקופות באותו תא
   grid כדי שרוחב הכפתור יינעל על הארוך מביניהם — בלי קפיצת layout */
const CTA_TEXTS = ["הזמינו עכשיו", "בדיקת זמינות"] as const;
const TYPE_MS = 55; // הקלדת אות
const DELETE_MS = 30; // מחיקת אות
const HOLD_MS = 1300; // השהיה על טקסט מלא

function CtaLink({ className }: { className?: string }) {
  const [display, setDisplay] = useState<string>(CTA_TEXTS[0]);
  useEffect(() => {
    // prefers-reduced-motion: בלי הקלדה — החלפה שקטה של טקסט מלא
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      let idx = 0;
      const id = setInterval(() => {
        idx = (idx + 1) % CTA_TEXTS.length;
        setDisplay(CTA_TEXTS[idx]);
      }, 3000);
      return () => clearInterval(id);
    }
    let idx = 0;
    let pos = CTA_TEXTS[0].length;
    let deleting = true; // מתחילים מטקסט מלא (כמו ה-SSR) → קודם מוחקים
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const full = CTA_TEXTS[idx];
      pos += deleting ? -1 : 1;
      setDisplay(full.slice(0, pos));
      let delay = deleting ? DELETE_MS : TYPE_MS;
      if (deleting && pos === 0) {
        deleting = false;
        idx = (idx + 1) % CTA_TEXTS.length;
        delay = 200; // נשימה קצרה לפני שמתחילים להקליד
      } else if (!deleting && pos === full.length) {
        deleting = true;
        delay = HOLD_MS;
      }
      t = setTimeout(tick, delay);
    };
    t = setTimeout(tick, HOLD_MS);
    return () => clearTimeout(t);
  }, []);
  return (
    <Link
      href="/booking"
      aria-label="הזמינו עכשיו — בדיקת זמינות"
      className={cn(
        "stm-btn-primary inline-flex items-center gap-2 rounded-[10px] bg-[linear-gradient(135deg,var(--color-sea-500),var(--color-ocean-400))] px-[22px] py-3 text-[15px] font-bold whitespace-nowrap text-white shadow-[0_8px_20px_rgba(43,127,184,0.32)]",
        className
      )}
    >
      <span className="grid" aria-hidden="true">
        {/* רוחות-רפאים לקיבוע הרוחב על הטקסט הרחב מבין השניים */}
        {CTA_TEXTS.map((text) => (
          <span key={text} className="invisible col-start-1 row-start-1">
            {text}
          </span>
        ))}
        {/* השורה החיה: הטקסט המוקלד + סמן מהבהב, מעוגן לימין (RTL) */}
        <span className="col-start-1 row-start-1 flex items-center justify-start">
          {display}
          <span className="ms-0.5 inline-block h-[1.05em] w-px animate-pulse bg-white/90" />
        </span>
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 6l-6 6 6 6"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

/* וריאנט checkout — header לבן מינימלי (לוגו · תשלום מאובטח · טלפון),
   לפי עיצוב "Sea Tower - תשלום". לא דביק: בר הסיכום של האשף הוא הדביק */
function CheckoutHeader() {
  return (
    <header data-site-header="" className="border-b border-[#e3ebf2] bg-white">
      <div className="mx-auto flex max-w-shell items-center justify-between gap-6 px-5 py-3.5 sm:px-8 lg:px-14">
        <Link href="/" className="flex items-center gap-[11px]">
          <Image src="/images/logo.png" alt="" width={40} height={40} className="object-contain" />
          <span className="flex flex-col leading-[1.05]">
            <span className="text-[22px] font-extrabold whitespace-nowrap text-[#385668] md:text-[26px]">
              מגדל הים
            </span>
            <span className="hidden text-[12px] font-normal tracking-[0.12em] whitespace-nowrap text-[#395769] min-[420px]:block md:text-[13px]">
              דירות בוטיק על הים
            </span>
          </span>
        </Link>
        <span className="flex items-center gap-2 rounded-full bg-success-bg px-4 py-2 text-[14px] font-semibold text-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" />
            <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          תשלום מאובטח · SSL
        </span>
        <a
          href={BUSINESS.phones.office.tel}
          className="hidden min-h-11 items-center gap-2 text-[15px] font-bold text-ink-strong sm:inline-flex"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          {BUSINESS.phones.office.label}
        </a>
      </div>
    </header>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  // נעילת גלילת הרקע כשהיריעה פתוחה (כמו במנוע המובייל של הרפרנס)
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* התנהגות מקלדת ליריעה: Escape סוגר, הפוקוס נכנס לקישור הראשון בפתיחה
     וחוזר לכפתור ההמבורגר בסגירה. ה-inert על היריעה הסגורה כבר מוציא אותה
     מסדר הטאב, ולכן אין צורך בלכידת פוקוס ידנית מעבר לכך */
  useEffect(() => {
    if (!open) return;
    const opener = openerRef.current;
    navRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open]);

  if (pathname.startsWith("/booking/checkout")) return <CheckoutHeader />;

  return (
    <>
    <header
      data-site-header=""
      className="sticky top-0 z-50 border-b border-[#e3ebf2] bg-white/94 backdrop-blur-[10px]"
    >
      <div className="mx-auto flex max-w-shell items-center justify-between gap-6 px-5 py-3.5 sm:px-8 lg:px-14">
        <Link href="/" className="flex items-center gap-[11px]">
          <Image src="/images/logo.png" alt="" width={40} height={40} className="object-contain" />
          <span className="flex flex-col leading-[1.05]">
            <span className="text-[22px] font-extrabold whitespace-nowrap text-[#385668] md:text-[26px]">
              מגדל הים
            </span>
            <span className="hidden text-[12px] font-normal tracking-[0.12em] whitespace-nowrap text-[#395769] min-[420px]:block md:text-[13px]">
              דירות בוטיק על הים
            </span>
          </span>
        </Link>

        <nav
          aria-label="ניווט ראשי"
          className="hidden items-center gap-7 text-[15px] font-medium text-ink-strong lg:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.href === pathname ? "page" : undefined}
              className={cn(
                "stm-link py-2 hover:text-navy-800",
                item.href === pathname && "font-bold text-navy-800"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* עטיפה במקום className מתנגש — cn לא פותר קונפליקט hidden/inline-flex */}
        <span className="hidden items-center lg:flex">
          <CtaLink />
        </span>

        {/* המבורגר — מובייל/טאבלט */}
        <button
          ref={openerRef}
          type="button"
          aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
          aria-expanded={open}
          aria-controls="site-mobile-nav"
          onClick={() => setOpen(!open)}
          className="flex size-11 items-center justify-center rounded-[10px] text-navy-800 lg:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

    </header>

      {/* יריעת מובייל — נשלפת מימין (RTL) עם fade לרקע, לפי מנוע המובייל של
         הרפרנס: overlay 0.3s ease · יריעה 0.34s ease-brand. מרונדרת תמיד כדי
         שתהיה גם אנימציית יציאה; inert חוסם פוקוס כשהיא סגורה. מחוץ ל-header:
         backdrop-blur הופך אותו ל-containing block של position:fixed */}
      <div
        inert={!open}
        className={cn(
          "fixed inset-0 top-[69px] z-40 transition-opacity duration-300 ease-out lg:hidden motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-navy-900/40"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
        <nav
          ref={navRef}
          id="site-mobile-nav"
          aria-label="תפריט נייד"
          className={cn(
            "absolute inset-y-0 right-0 flex w-[78vw] max-w-[330px] flex-col gap-1 overflow-y-auto bg-white p-6 shadow-[-12px_0_40px_rgba(7,22,37,0.28)] transition-transform duration-[340ms] ease-brand motion-reduce:transition-none",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={item.href === pathname ? "page" : undefined}
              className="rounded-[10px] px-4 py-3 text-[16px] font-semibold text-ink-strong hover:bg-mist"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-4 px-4" onClick={() => setOpen(false)}>
            <CtaLink className="w-full justify-center" />
          </div>
        </nav>
      </div>
    </>
  );
}
