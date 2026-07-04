import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionKicker } from "@/components/ui/SectionHeading";
import { IconTile } from "@/components/ui/IconTile";
import { CheckItem } from "@/components/ui/CheckItem";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { MotionEngine } from "@/components/site/MotionEngine";
import { pageMeta, buildBreadcrumbLd } from "@/lib/seo";

/* עמוד פתרונות — נבנה 1:1 לפי design-reference/exports/Solutions.html */

export const metadata: Metadata = pageMeta({
  title: "פתרונות אירוח — מגדל הים | דירות בוטיק מול הים בחיפה",
  description:
    "פתרון אירוח לכל צורך במגדל הים: נופש מול הים, אירוח לעסקים, רילוקיישן, השכרה לטווח קצר וארוך וניהול דירות — דירות בוטיק 50 מ׳ מהטיילת בחיפה, ללא בירוקרטיה.",
  path: "/solutions",
});

/* ---------- תוכן ---------- */

const SOLUTIONS = [
  {
    id: "sol-1",
    num: "01",
    title: "נופש מול הים",
    text: "חופשה זוגית או משפחתית בסוויטה מפנקת עם נוף לים, במרחק נגיעה מהטיילת. כל מה שצריך כדי להתנתק, מול הים התיכון.",
    checks: ["נוף חזיתי לים מכל דירה", "50 מ׳ מהטיילת והחוף", "מאובזר ברמה מלונאית"],
    img: {
      src: "/images/hero-terrace.jpg",
      alt: "מרפסת סלון פונה לשקיעה מעל הים במגדל הים",
      width: 1376,
      height: 768,
    },
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.4" stroke="var(--color-aqua)" strokeWidth="1.7" />
        <path
          d="M3 18c3 0 3-2 6-2s3 2 6 2 3-2 6-2"
          stroke="#fff"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "sol-2",
    num: "02",
    title: "אירוח לעסקים",
    text: "מרחב עבודה שקט ומאובזר לצוותים ולשהייה ממושכת — שהעובדים יגיעו רעננים. פתרון אידאלי לחברות הייטק, רפואה וטכנולוגיה.",
    checks: ["מרחב עבודה שקט ואינטרנט מהיר", "חשבוניות וקבלות לחברה", "מתאים לצוותים ולשהייה ארוכה"],
    img: {
      src: "/images/living-room.jpg",
      alt: "סלון מעוצב עם ספה כחולה ופינת ישיבה שקטה לעבודה",
      width: 1024,
      height: 1024,
    },
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="7" width="18" height="12" rx="2" stroke="#fff" strokeWidth="1.7" />
        <path
          d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7"
          stroke="var(--color-aqua)"
          strokeWidth="1.7"
        />
      </svg>
    ),
  },
  {
    id: "sol-3",
    num: "03",
    title: "רילוקיישן",
    text: "נחיתה רכה בחיפה — דירה מרוהטת ומוכנה, כולל כל החשבונות, ללא התחייבות. הפתרון המושלם למעבר עיר חלק ונטול דאגות.",
    checks: ["דירה מרוהטת ומוכנה מהיום הראשון", "כל החשבונות כלולים", "ליווי אישי וגמישות מלאה"],
    img: {
      src: "/images/bedroom-classic.jpg",
      alt: "חדר שינה קלאסי עם דלתות למרפסת ונוף לים",
      width: 928,
      height: 1152,
    },
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"
          stroke="#fff"
          strokeWidth="1.7"
        />
        <circle cx="12" cy="10" r="2.4" stroke="var(--color-aqua)" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    id: "sol-4",
    num: "04",
    title: "השכרה לטווח קצר",
    pill: "טווח קצר",
    text: "לילה, שבוע או חודש — גמישות מלאה ואישור מיידי, בלי בירוקרטיה מיותרת. מגיעים, נכנסים ונהנים.",
    checks: ["אישור מיידי, ללא בירוקרטיה", "מלילה בודד ועד חודש", "מדיניות ביטול גמישה"],
    img: {
      src: "/images/suite-royal.jpg",
      alt: "סוויטה מרווחת עם מיטה זוגית ונוף פתוח לחוף",
      width: 1376,
      height: 768,
    },
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="5" width="16" height="16" rx="2" stroke="#fff" strokeWidth="1.7" />
        <path
          d="M4 9h16M8 3v4M16 3v4"
          stroke="var(--color-aqua)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "sol-5",
    num: "05",
    title: "השכרה לטווח ארוך",
    pill: "טווח ארוך",
    text: "מגורים זמניים בזמן שיפוץ, תיירות מרפא או תקופת מעבר — בנוחות של בית, בתנאים משתלמים ובשירות שוטף.",
    checks: ["תנאים משתלמים לטווח ארוך", "אחזקה ושירות שוטף", "פתרון מושלם לתקופת מעבר"],
    img: {
      src: "/images/suite-jacuzzi.jpg",
      alt: "סוויטת ג׳קוזי עם חלונות פנורמיים אל קו החוף בערב",
      width: 1376,
      height: 768,
    },
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 11l8-6 8 6"
          stroke="var(--color-aqua)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 10v9h12v-9"
          stroke="#fff"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "sol-6",
    num: "06",
    title: "ניהול דירות",
    text: "בעלי נכסים? ננהל עבורכם את הדירה להשכרה — תפעול, אירוח ותחזוקה מקצה לקצה, עם שיווק חכם ודוחות שקופים.",
    checks: ["תפעול, אירוח ותחזוקה מקצה לקצה", "שיווק הנכס למקסום תפוסה", "דוחות הכנסה שקופים"],
    img: {
      src: "/images/living-room.jpg",
      alt: "סלון דירת בוטיק מנוהלת, מעוצב ומוכן לאירוח",
      width: 1024,
      height: 1024,
    },
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7L5.6 5.6"
          stroke="var(--color-aqua)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3.2" stroke="#fff" strokeWidth="1.7" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    num: "1",
    title: "בוחרים פתרון",
    text: "מספרים לנו מה אתם מחפשים — ונתאים לכם את הדירה והפתרון המדויקים.",
  },
  {
    num: "2",
    title: "מאשרים מהר",
    text: "הצעה אישית ואישור מיידי, ללא בירוקרטיה והתחייבות — תוך דקות.",
  },
  {
    num: "3",
    title: "נכנסים ונהנים",
    text: "צ׳ק־אין חלק, הדירה מוכנה ומאובזרת — ואתם מול הים התיכון.",
  },
];

/* ---------- העמוד ---------- */

export default function Solutions() {
  return (
    <>
      {/* שער חשיפות: רץ לפני ה-hydration כך שתוכן מסומן לא מהבהב לפני האנימציה */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('stm-js')",
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbLd([
              { name: "ראשי", path: "/" },
              { name: "פתרונות", path: "/solutions" },
            ])
          ),
        }}
      />
      <MotionEngine />

      {/* Hero — פירורי לחם, כותרת גרדיאנט, צ'יפי עוגן לפתרונות וגל תחתון */}
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,var(--color-navy-900)_0%,var(--color-ocean-700)_58%,var(--color-ocean-600)_100%)] pt-12 pb-24 text-center text-white md:pt-[70px] md:pb-[150px]">
        <div
          aria-hidden="true"
          className="stm-blob absolute -top-[120px] -left-20 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.35),transparent_68%)] blur-[10px]"
        />
        <div
          aria-hidden="true"
          className="stm-blob absolute -right-[60px] bottom-[60px] size-[300px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.18),transparent_70%)]"
        />
        <Container className="relative z-[2]">
          <nav
            aria-label="פירורי לחם"
            className="mb-[26px] inline-flex items-center gap-2 text-[13.5px] font-medium text-[#acc8dd]"
          >
            {/* min-h + margin שלילי: אזור מגע 44px בלי לשנות את הזרימה (Iron Rule #6) */}
            <Link href="/" className="stm-link -my-2 inline-flex min-h-11 items-center py-2">
              ראשי
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span aria-current="page" className="font-semibold text-white">
              פתרונות
            </span>
          </nav>
          <h1
            data-ws=""
            className="mb-[22px] text-[40px]/[1.1] font-extrabold tracking-heading md:text-[62px]/[1.06]"
          >
            פתרון אירוח
            <br />
            <span className="bg-[linear-gradient(120deg,var(--color-aqua),var(--color-sea-400))] bg-clip-text text-transparent">
              לכל צורך
            </span>
          </h1>
          <p
            data-rev="up"
            className="mx-auto mb-[34px] max-w-[600px] text-[19px]/[1.66] font-light text-[#cdddea]"
          >
            דירה אחת, אינסוף סיבות להגיע. בין אם לנופש קצר, לתקופת עבודה ממושכת או למעבר עיר —
            נתאים לכם בדיוק את מה שצריך, ללא בירוקרטיה.
          </p>
          <div data-rev="sm" className="flex flex-wrap justify-center gap-2.5">
            {SOLUTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex min-h-11 items-center rounded-full border border-white/28 px-4 py-[9px] text-sm font-semibold text-[#dceaf3] transition-colors duration-200 hover:border-navy-800 hover:bg-navy-800 hover:text-white"
              >
                {s.pill ?? s.title}
              </a>
            ))}
          </div>
        </Container>
        <WaveSeparator position="bottom" fill="var(--color-cloud)" />
      </section>

      {/* ששת הפתרונות — שורות תמונה/טקסט מתחלפות */}
      <section className="bg-cloud pt-14 pb-8 md:pt-20 md:pb-[30px]">
        <Container className="flex flex-col gap-14 md:gap-[72px]">
          {SOLUTIONS.map((s, i) => (
            <div
              id={s.id}
              key={s.id}
              className={
                "group flex scroll-mt-24 flex-col items-center gap-8 lg:gap-14 " +
                (i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row")
              }
            >
              <div className="w-full overflow-hidden rounded-img shadow-[0_22px_50px_rgba(14,37,64,0.14)] lg:flex-1">
                <Image
                  src={s.img.src}
                  alt={s.img.alt}
                  width={s.img.width}
                  height={s.img.height}
                  data-rev="media"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="h-[260px] w-full object-cover transition-transform duration-[1200ms] ease-pop group-hover:scale-[1.03] md:h-[420px]"
                />
              </div>
              <div className="w-full lg:flex-[1.04]">
                <div data-rev="sm" className="mb-4 flex items-center gap-4">
                  <IconTile size={54}>{s.icon}</IconTile>
                  <span
                    aria-hidden="true"
                    className="text-[44px] leading-none font-extrabold tracking-[-0.02em] text-[#dde6ee]"
                  >
                    {s.num}
                  </span>
                </div>
                <h2
                  data-ws=""
                  className="mb-3.5 text-[28px]/[1.15] font-extrabold tracking-heading text-navy-800 md:text-[34px]/[1.15]"
                >
                  {s.title}
                </h2>
                <p data-rev="up" className="mb-[22px] text-[16.5px] leading-[1.75] text-ink">
                  {s.text}
                </p>
                <div data-rev="up" className="flex flex-col gap-[13px]">
                  {s.checks.map((c) => (
                    <CheckItem key={c}>{c}</CheckItem>
                  ))}
                </div>
                <div data-rev="sm" className="mt-[22px]">
                  <Button href="/contact" variant="link">
                    לפרטים והזמנה
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* שלושה צעדים — כרטיסי תהליך על רקע לבן */}
      <section className="border-t border-[#eef2f6] bg-white py-14 md:py-20">
        <Container>
          <div className="mb-[46px] flex flex-col items-center gap-3.5 text-center">
            <SectionKicker>
              פשוט להתארח
              <span aria-hidden="true" className="h-0.5 w-[22px] rounded-full bg-current" />
            </SectionKicker>
            <h2
              data-ws=""
              className="text-[32px]/[1.2] font-extrabold tracking-heading text-navy-800 md:text-[40px]/[1.14]"
            >
              שלושה צעדים עד הים
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-[22px] md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.num}
                data-rev="card"
                className="rounded-card border border-line bg-mist px-7 py-8"
              >
                <div
                  aria-hidden="true"
                  className="mb-4 flex size-[46px] items-center justify-center rounded-xl bg-navy-800 text-xl font-extrabold text-aqua"
                >
                  {step.num}
                </div>
                <h3 className="mb-2 text-[19px] font-bold text-navy-800">{step.title}</h3>
                <p className="text-[14.5px] leading-[1.6] text-ink-dim">{step.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA — באנר גרדיאנט מעוגל. הריפוד התחתון כולל את גובה גל הפוטר (70/120px)
          שחופף למקטע האחרון — כך הבאנר שומר על מרווח 56/84px מהקימור */}
      <section className="bg-cloud pb-[126px] md:pb-[204px]">
        <Container>
          <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(120deg,var(--color-navy-900),var(--color-ocean-700)_70%,var(--color-ocean-600))] px-6 py-10 md:px-[60px] md:py-16">
            <div
              aria-hidden="true"
              className="stm-blob absolute -top-20 -left-10 size-[300px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.22),transparent_70%)]"
            />
            <div className="relative z-[2] flex flex-wrap items-center justify-between gap-10">
              <div className="min-w-[280px] flex-1">
                <h2
                  data-ws=""
                  className="mb-3 text-[30px]/[1.12] font-extrabold tracking-heading text-white md:text-[38px]/[1.12]"
                >
                  לא בטוחים איזה פתרון מתאים לכם?
                </h2>
                <p
                  data-rev="up"
                  className="max-w-[460px] text-[17px] leading-[1.6] font-light text-[#bcd4e6]"
                >
                  ספרו לנו על הצרכים שלכם ונמצא יחד את הדירה והפתרון המושלמים — לכל תקופה ולכל
                  מטרה.
                </p>
              </div>
              <div data-rev="sm" className="flex flex-wrap items-center gap-3.5">
                <Button href="/contact" surface="dark">
                  דברו איתנו
                </Button>
                <Button href="/#apartments" variant="outline" surface="dark" className="px-6">
                  לדירות שלנו
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
