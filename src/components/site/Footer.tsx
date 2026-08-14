import Image from "next/image";
import Link from "next/link";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { BUSINESS, MAPS_LINK } from "@/lib/business";

const LINK_COLUMNS: Array<{
  id: string;
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    id: "links",
    title: "קישורים",
    links: [
      { label: "ראשי", href: "/" },
      { label: "אודות", href: "/about" },
      { label: "הדירות והסוויטות", href: "/rooms" },
      { label: "בדיקת זמינות והזמנה", href: "/booking" },
      { label: "מאמרים", href: "/articles" },
      { label: "שאלות נפוצות", href: "/faq" },
      { label: "חוקי הבית", href: "/house-rules" },
      { label: "צור קשר", href: "/contact" },
    ],
  },
  {
    /* כל תווית מקשרת לעוגן האמיתי שלה בעמוד הפתרונות — קודם לכן ארבע
       תוויות שונות הצביעו על אותו URL עירום (SEO-AUDIT A10) */
    id: "solutions",
    title: "פתרונות אירוח",
    links: [
      { label: "נופש מול הים בחיפה", href: "/solutions#sol-1" },
      { label: "אירוח לעסקים", href: "/solutions#sol-2" },
      { label: "רילוקיישן ומגורים זמניים", href: "/solutions#sol-3" },
      { label: "השכרה לטווח קצר", href: "/solutions#sol-4" },
      { label: "סוויטות מול הים", href: "/rooms" },
    ],
  },
];

export function Footer() {
  return (
    /* השוליים השליליים מרימים את גל הפתיחה מעל תחתית המקטע הקודם — כך הגל
       עובד מעל כל רקע עמוד. מקטע אחרון בעמוד חייב ריפוד תחתון בגובה הגל
       (70/120px) — ראו ‎.ed-wave-clear‎ ב-editorial.css */
    <footer className="-mt-[70px] text-[#9fb6c8] md:-mt-[120px]">
      <WaveSeparator flow position="bottom" fill="var(--color-navy-950)" />
      <div className="bg-navy-950 px-5 pt-14 pb-6 sm:px-8 lg:px-14">
        <div className="mx-auto grid max-w-shell grid-cols-1 gap-10 border-b border-white/8 pb-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr]">
          <div>
            <div className="mb-4 flex items-center gap-[11px]">
              <Image
                src="/images/logo.png"
                alt=""
                width={40}
                height={40}
                className="object-contain opacity-92 brightness-0 invert"
              />
              <span className="flex flex-col leading-[1.05]">
                <span className="font-serif text-[26px] font-semibold text-white">מגדל הים</span>
                <span className="text-[13px] font-light tracking-[0.12em] text-white">
                  דירות בוטיק על הים
                </span>
              </span>
            </div>
            <p className="mb-[18px] text-sm leading-[1.65]">
              מגדל הים בבניין אלמוג בחיפה, הינו מלון דירות להשכרה יומית, המכיל דירות ויחידות נופש
              להשכרה לטווח קצר, בינוני או ארוך. בבניין אלמוג, מגדלי חוף הכרמל (לשעבר מלון מרידיאן),
              בכניסה הדרומית לחיפה ממש על חוף הכרמל, רק כ-50 מטר מקו המים, תוכלו ליהנות מחדרים
              גדולים, יפים ומאובזרים בכל מה שיש בבית, עם נוף עוצר נשימה.
            </p>
            {/* אייקוני הרשתות החברתיות המתים הוסרו — יוחזרו רק עם כתובות
                אמיתיות מהבעלים (DESIGN-AUDIT ממצא 7) */}
          </div>

          {/* כותרות העמודות הן div עם aria-labelledby — לא h2: כותרת בפוטר
              אינה חלק ממתאר התוכן של העמוד (SEO-AUDIT A13) */}
          {LINK_COLUMNS.map((col) => (
            <nav key={col.title} aria-labelledby={`ft-${col.id}`}>
              <div
                id={`ft-${col.id}`}
                className="mb-4 text-sm font-bold tracking-[0.03em] text-white"
              >
                {col.title}
              </div>
              <ul className="flex flex-col gap-[11px] text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="stm-link hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <div className="mb-4 text-sm font-bold tracking-[0.03em] text-white">דברו איתנו</div>
            <ul className="flex flex-col gap-[11px] text-sm">
              <li>
                <a
                  href={BUSINESS.phones.office.tel}
                  className="stm-link hover:text-white"
                  dir="ltr"
                >
                  {BUSINESS.phones.office.label}
                </a>
              </li>
              <li>
                <a
                  href={BUSINESS.phones.mobile.tel}
                  className="stm-link hover:text-white"
                  dir="ltr"
                >
                  {BUSINESS.phones.mobile.label}
                </a>
              </li>
              <li>
                <a href={`mailto:${BUSINESS.email}`} className="stm-link hover:text-white" dir="ltr">
                  {BUSINESS.email}
                </a>
              </li>
              <li>
                <a
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="stm-link hover:text-white"
                >
                  {BUSINESS.address.full}
                </a>
              </li>
              <li className="text-[#9fb6c8]">{BUSINESS.hours}</li>
            </ul>
            <Link
              href="/contact"
              className="stm-link mt-4 inline-flex min-h-11 items-center text-sm font-bold text-white"
            >
              שליחת פנייה מהטופס ›
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-[18px] flex max-w-shell flex-wrap items-center justify-between gap-2.5 text-[13px] text-[#6c869a]">
          <span>© 2026 מגדל הים — כל הזכויות שמורות</span>
          {/* "הצהרת נגישות" ו"מדיניות ביטולים" היו ספאנים מתים שנראו כקישורים.
              הוסרו עד שיהיו עמודים אמיתיים (SEO-AUDIT B7) */}
          <span className="flex gap-5">
            <Link href="/terms" className="transition-colors hover:text-white">
              תקנון האתר
            </Link>
            <Link href="/house-rules" className="transition-colors hover:text-white">
              חוקי הבית
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
