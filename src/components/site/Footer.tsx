import Image from "next/image";
import Link from "next/link";
import { WaveSeparator } from "@/components/ui/WaveSeparator";

const LINK_COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "קישורים",
    links: [
      { label: "ראשי", href: "/" },
      { label: "אודות", href: "/about" },
      { label: "הדירות שלנו", href: "/#apartments" },
      { label: "מאמרים", href: "/articles" },
      { label: "שאלות נפוצות", href: "/faq" },
      { label: "צור קשר", href: "/contact" },
    ],
  },
  {
    title: "פתרונות",
    links: [
      { label: "נופש בחיפה", href: "/#solutions" },
      { label: "אירוח לעסקים", href: "/#solutions" },
      { label: "רילוקיישן", href: "/#solutions" },
      { label: "השכרה לטווח קצר", href: "/#solutions" },
      { label: "ניהול דירות", href: "/#solutions" },
      { label: "סוויטות מול הים", href: "/#apartments" },
    ],
  },
];

/* אייקוני רשתות — ברפרנס הם מוצגים ללא קישורים; דקורטיביים עד שיתקבלו כתובות */
const SOCIAL_PATHS = [
  "M13 22v-8h3l.5-3.5H13V8.3c0-1 .3-1.7 1.8-1.7H17V3.4c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v2.6H7V14h3v8z",
  "M12 8.7A3.3 3.3 0 1012 15.3 3.3 3.3 0 0012 8.7zm0 5.4a2.1 2.1 0 110-4.2 2.1 2.1 0 010 4.2zm4.2-5.5a.77.77 0 11-1.54 0 .77.77 0 011.54 0zM19 9c-.05-1.05-.3-2-1.08-2.77C17.15 5.46 16.2 5.2 15.15 5.16 14.07 5.1 9.93 5.1 8.85 5.16c-1.05.05-2 .3-2.77 1.07C5.3 7 5.05 7.95 5 9c-.06 1.08-.06 5.22 0 6.3.05 1.05.3 2 1.08 2.77.77.77 1.72 1.03 2.77 1.08 1.08.06 5.22.06 6.3 0 1.05-.05 2-.3 2.77-1.08.77-.77 1.03-1.72 1.08-2.77.06-1.08.06-5.22 0-6.3z",
  "M21.6 7.2s-.2-1.4-.8-2c-.76-.8-1.6-.8-2-.85C16 4.1 12 4.1 12 4.1h0s-4 0-6.8.25c-.4.05-1.24.05-2 .85-.6.6-.8 2-.8 2S2.1 8.85 2.1 10.5v1.4c0 1.65.2 3.3.2 3.3s.2 1.4.8 2c.76.8 1.76.77 2.2.86 1.6.15 6.7.2 6.7.2s4 0 6.8-.26c.4-.05 1.24-.05 2-.85.6-.6.8-2 .8-2s.2-1.65.2-3.3v-1.4c0-1.65-.2-3.3-.2-3.3zM9.9 14.6V8.9l5.15 2.86z",
  "M6.94 5a1.94 1.94 0 11-3.88 0 1.94 1.94 0 013.88 0zM3.4 8.5h3.1V21H3.4zM9 8.5h2.96v1.7h.04c.41-.78 1.42-1.6 2.92-1.6 3.12 0 3.7 2.05 3.7 4.72V21h-3.1v-5.5c0-1.3-.02-3-1.83-3-1.84 0-2.12 1.43-2.12 2.9V21H9z",
];

export function Footer() {
  return (
    /* השוליים השליליים מרימים את גל הפתיחה מעל תחתית המקטע הקודם (כמו ברפרנס,
       שם הגל ישב אבסולוטית בתחתית המקטע במילוי צבע הפוטר) — כך הגל עובד מעל
       כל רקע עמוד. מקטע אחרון בעמוד חייב ריפוד תחתון בגובה הגל (70/120px) */
    <footer className="-mt-[70px] text-[#9fb6c8] md:-mt-[120px]">
      <WaveSeparator flow position="bottom" fill="var(--color-navy-950)" />
      <div className="bg-navy-950 px-5 pt-14 pb-6 sm:px-8 lg:px-14">
        <div className="mx-auto grid max-w-[1160px] grid-cols-1 gap-10 border-b border-white/8 pb-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr]">
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
            <p className="mb-[18px] text-sm leading-[1.65]">
              מגדל הים בבניין אלמוג בחיפה, הינו מלון דירות להשכרה יומית, המכיל דירות ויחידות נופש
              להשכרה לטווח קצר, בינוני או ארוך. בבניין אלמוג, מגדלי חוף הכרמל (לשעבר מלון מרידיאן),
              בכניסה הדרומית לחיפה ממש על חוף הכרמל, רק כ-50 מטר מקו המים, תוכלו ליהנות מחדרים
              גדולים, יפים ומאובזרים בכל מה שיש בבית, עם נוף עוצר נשימה.
            </p>
            <div className="flex gap-2.5" aria-hidden="true">
              {SOCIAL_PATHS.map((d, i) => (
                <span
                  key={i}
                  className="flex size-[38px] items-center justify-center rounded-[10px] bg-white/6"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#9fb6c8">
                    <path d={d} />
                  </svg>
                </span>
              ))}
            </div>
          </div>

          {LINK_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-bold tracking-[0.03em] text-white">{col.title}</h4>
              <ul className="flex flex-col gap-[11px] text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="stm-link hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-4 text-sm font-bold tracking-[0.03em] text-white">הישארו מעודכנים</h4>
            <p className="mb-3.5 text-[13.5px] leading-[1.6]">
              מבצעים ועדכונים על דירות חדשות, ישירות למייל
            </p>
            {/* ponytail: אין עדיין backend לניוזלטר — הטופס ויזואלי בלבד */}
            <form action="#" className="flex gap-[5px] rounded-btn border border-white/12 bg-white/7 p-[5px]">
              <input
                type="email"
                required
                aria-label="המייל שלכם"
                placeholder="המייל שלכם"
                className="h-[38px] min-w-0 flex-1 bg-transparent px-3 text-[13.5px] text-white placeholder:text-[#9fb6c8] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-sea-500 px-[18px] py-2 text-sm font-bold whitespace-nowrap text-white transition-[background-color,transform] duration-300 ease-brand hover:-translate-y-0.5 hover:bg-[#46a6dd] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                הרשמה
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto mt-[18px] flex max-w-[1160px] flex-wrap items-center justify-between gap-2.5 text-[13px] text-[#6c869a]">
          <span>© 2026 מגדל הים — כל הזכויות שמורות</span>
          <span className="flex gap-5">
            <Link href="/terms" className="transition-colors hover:text-white">
              תקנון האתר
            </Link>
            <Link href="/house-rules" className="transition-colors hover:text-white">
              חוקי הבית
            </Link>
            <span>הצהרת נגישות</span>
            <span>מדיניות ביטולים</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
