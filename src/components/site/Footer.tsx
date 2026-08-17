import Image from "next/image";
import Link from "next/link";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { BUSINESS, MAPS_LINK, SOCIAL_LINKS, type SocialId } from "@/lib/business";

/* אייקוני מותג רשמיים (simple-icons, viewBox 24) — בפרויקט אין ספריית
   אייקונים; הדפוס הקיים הוא SVG מוטבע, וכאן fill=currentColor */
const SOCIAL_ICON_PATHS: Record<SocialId, string> = {
  facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  youtube:
    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
};

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

/* רשימת אייקוני הרשתות — מיקום אחיד בכל העמודים (הנחיית בעלים 2026-08-17):
   בעמודה הראשונה (הימנית ב-RTL), מתחת לתיאור העסק ומעל הקו המפריד — המיקום
   שהיה עד כה בעמוד הבית בלבד. סדר DOM: פייסבוק→לינקדאין, שב-RTL נותן את הסדר
   הוויזואלי לינקדאין, יוטיוב, אינסטגרם, פייסבוק (משמאל לימין) לפי הרפרנס */
function SocialList({ className }: { className: string }) {
  return (
    <ul className={`flex-wrap items-center gap-3 ${className}`}>
      {SOCIAL_LINKS.map((s) => (
        <li key={s.id}>
          {/* מצב פוקוס: טבעת ה-focus-visible הגלובלית (base.css — ‏2px
              sea-500) חלה כאן כמו על כל קישור באתר */}
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="flex size-11 items-center justify-center rounded-[10px] border border-white/12 bg-white/6 text-[#9fb6c8] transition-colors hover:bg-white/14 hover:text-white"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={SOCIAL_ICON_PATHS[s.id]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    /* השוליים השליליים מרימים את גל הפתיחה מעל תחתית המקטע הקודם — כך הגל
       עובד מעל כל רקע עמוד. מקטע אחרון בעמוד חייב ריפוד תחתון בגובה הגל
       (70/120px) */
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
                <span className="text-[26px] font-extrabold text-white">מגדל הים</span>
                <span className="text-[13px] font-light tracking-[0.12em] text-white">
                  דירות בוטיק על הים
                </span>
              </span>
            </div>
            <p className="text-sm leading-[1.65]">
              מגדל הים בבניין אלמוג בחיפה, הינו מלון דירות להשכרה יומית, המכיל דירות ויחידות נופש
              להשכרה לטווח קצר, בינוני או ארוך. בבניין אלמוג, מגדלי חוף הכרמל (לשעבר מלון מרידיאן),
              בכניסה הדרומית לחיפה ממש על חוף הכרמל, רק כ-50 מטר מקו המים, תוכלו ליהנות מחדרים
              גדולים, יפים ומאובזרים בכל מה שיש בבית, עם נוף עוצר נשימה.
            </p>
            {/* האייקונים באזור הריק שמתחת לתיאור, מעל הקו המפריד —
                הכתובות הרשמיות מהבעלים (2026-08-15) */}
            <SocialList className="mt-6 flex" />
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
              <ul className="stm-footer-links flex flex-col gap-[11px] text-sm">
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
            <ul className="stm-footer-links flex flex-col gap-[11px] text-sm">
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

        {/* שורת הזכויות צמודה לקו המפריד של הגריד — בלי border-t משלה,
            אחרת נוצרים שני קווים צמודים */}
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-2.5 pt-4 text-[13px] text-[#6c869a]">
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
