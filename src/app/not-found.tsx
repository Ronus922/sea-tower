import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/business";

/* עמוד 404 — מרונדר בתבנית השורש (לא בתוך (site)), ולכן אין לו Header/Footer;
   הניווט למטה הוא הדרך חזרה. Next מוסיף noindex בעצמו; אין להוסיף כאן robots
   נוסף כדי לא ליצור שני תגים סותרים. ה-metadata כאן מעניק לעמוד כותרת משלו
   במקום כותרת עמוד הבית שירש קודם (SEO-AUDIT A5). */

export const metadata: Metadata = {
  title: "הדף לא נמצא | מגדל הים",
  description: "הדף שחיפשתם לא נמצא — אפשר להמשיך לדירות, לבדיקת זמינות או לעמוד הבית.",
};

const LINKS = [
  { href: "/", label: "עמוד הבית" },
  { href: "/rooms", label: "הדירות והסוויטות" },
  { href: "/booking", label: "בדיקת זמינות והזמנה" },
  { href: "/articles", label: "מאמרים" },
  { href: "/contact", label: "צור קשר" },
];

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 py-20 text-center">
      <p className="ed-overline mb-4">שגיאה 404</p>
      <h1 className="ed-h1 mb-4 text-navy-800">הדף שחיפשתם לא נמצא</h1>
      <p className="mb-9 max-w-[520px] text-[17px]/[1.6] text-ink">
        ייתכן שהכתובת השתנתה או שהוקלדה בטעות. אפשר להמשיך מכאן לדירות, לבדיקת
        זמינות או לכל אחד מהעמודים הבאים.
      </p>

      <nav aria-label="ניווט מעמוד שגיאה" className="mb-9">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[15.5px] font-semibold">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="stm-link inline-flex min-h-11 items-center text-navy-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-500"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="ed-hairline pt-5 text-[14.5px] text-ink-dim">
        צריכים עזרה?{" "}
        <a
          href={BUSINESS.phones.office.tel}
          dir="ltr"
          className="font-bold text-ocean-400 underline-offset-4 hover:underline"
        >
          {BUSINESS.phones.office.label}
        </a>
      </p>
    </main>
  );
}
