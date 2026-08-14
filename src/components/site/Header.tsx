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

/* CTA סטטי ושקט — מכונת הכתיבה הוסרה (DESIGN-AUDIT ממצא 5) */
function CtaLink({ className }: { className?: string }) {
  return (
    <Link
      href="/booking"
      className={cn(
        "stm-btn-primary inline-flex items-center gap-2 rounded-[10px] bg-navy-800 px-[22px] py-3 text-[15px] font-bold whitespace-nowrap text-white hover:bg-navy-700",
        className
      )}
    >
      בדיקת זמינות
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-[11px]">
      <Image src="/images/logo.png" alt="" width={40} height={40} className="object-contain" />
      <span className="flex flex-col leading-[1.05]">
        <span className="font-serif text-[23px] font-semibold whitespace-nowrap text-navy-800 md:text-[26px]">
          מגדל הים
        </span>
        <span className="hidden text-[11.5px] font-normal tracking-[0.14em] whitespace-nowrap text-ink-dim min-[420px]:block md:text-[12.5px]">
          דירות בוטיק על הים · חיפה
        </span>
      </span>
    </Link>
  );
}

/* וריאנט checkout — header לבן מינימלי (לוגו · תשלום מאובטח · טלפון),
   לפי עיצוב "Sea Tower - תשלום". לא דביק: בר הסיכום של האשף הוא הדביק */
function CheckoutHeader() {
  return (
    <header data-site-header="" className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-shell items-center justify-between gap-6 px-5 py-3.5 sm:px-8 lg:px-14">
        <Wordmark />
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

  // נעילת גלילת הרקע כשהיריעה פתוחה
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
      className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-[10px]"
    >
      <div className="mx-auto flex max-w-shell items-center justify-between gap-6 px-5 py-3.5 sm:px-8 lg:px-14">
        <Wordmark />

        <nav
          aria-label="ניווט ראשי"
          className="hidden items-center gap-6 text-[15px] font-medium text-ink-strong lg:flex"
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

      {/* יריעת מובייל — נשלפת מימין (RTL) עם fade לרקע. מרונדרת תמיד כדי
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
