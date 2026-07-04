"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/* קישורי הניווט מהרפרנס. יעדים שהם עמודים עתידיים (מנוע הזמנה)
   מפנים בינתיים לעוגני הבית — יוחלפו כשהעמודים ייבנו */
const NAV = [
  { href: "/", label: "ראשי" },
  { href: "/about", label: "אודות" },
  { href: "/solutions", label: "פתרונות" },
  { href: "/#apartments", label: "הדירות שלנו" },
  { href: "/#contact", label: "בדיקת זמינות" },
  { href: "/articles", label: "מאמרים" },
  { href: "/contact", label: "צור קשר" },
  { href: "/terms", label: "תקנון" },
];

function CtaLink({ className }: { className?: string }) {
  return (
    <Link
      href="/#contact"
      className={cn(
        "stm-btn-primary inline-flex items-center gap-2 rounded-[10px] bg-[linear-gradient(135deg,var(--color-sea-500),var(--color-ocean-400))] px-[22px] py-3 text-[15px] font-bold whitespace-nowrap text-white shadow-[0_8px_20px_rgba(43,127,184,0.32)]",
        className
      )}
    >
      הזמינו עכשיו
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

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // נעילת גלילת הרקע כשהיריעה פתוחה (כמו במנוע המובייל של הרפרנס)
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    <header
      data-site-header=""
      className="sticky top-0 z-50 border-b border-[#e3ebf2] bg-white/94 backdrop-blur-[10px]"
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-5 py-3.5 sm:px-8 lg:px-14">
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

        <nav className="hidden items-center gap-7 text-[15px] font-medium text-ink-strong lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
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
        <span className="hidden lg:block">
          <CtaLink />
        </span>

        {/* המבורגר — מובייל/טאבלט */}
        <button
          type="button"
          aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
          aria-expanded={open}
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
