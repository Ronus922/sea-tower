import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionKicker } from "@/components/ui/SectionHeading";
import { IconTile } from "@/components/ui/IconTile";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { MotionEngine } from "@/components/site/MotionEngine";
import { pageMeta, buildBreadcrumbLd } from "@/lib/seo";

/* עמוד אודות — נבנה 1:1 לפי design-reference/exports/About.html */

export const metadata: Metadata = pageMeta({
  title: "אודות — מגדל הים | מלון דירות בוטיק מול הים בחיפה",
  description:
    "הסיפור של מגדל הים — מלון דירות בוטיק בבניין אלמוג, מגדלי חוף הכרמל בחיפה, 50 מטר מקו המים. אירוח שמרגיש כמו בית, ברמה של מלון: שירות אישי, נוף לים וזמינות 24/7.",
  path: "/about",
});

/* ---------- תוכן ---------- */

const STATS = [
  { value: "50 מ׳", label: "מקו המים והטיילת" },
  { value: "14+", label: "דירות וסוויטות" },
  { value: "4.8", label: "דירוג ממוצע מאורחים" },
  { value: "24/7", label: "שירות וזמינות" },
];

const VALUES = [
  {
    title: "מיקום ללא פשרות",
    text: "מול הים, צעדים מהטיילת והמסעדות, ובלב נגישות לכל חיפה.",
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
    title: "רמה מלונאית",
    text: "מצעים ומגבות 5 כוכבים, מטבח מאובזר, נספרסו וואי־פיי מהיר.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3l2.5 5.2 5.5.8-4 3.9 1 5.6L12 17l-5 2.5 1-5.6-4-3.9 5.5-.8z"
          stroke="var(--color-aqua)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "שירות אישי",
    text: "צ׳ק־אין חלק, זמינות לאורך כל השהייה ויחס אנושי לכל בקשה.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.4" stroke="var(--color-aqua)" strokeWidth="1.7" />
        <path
          d="M5 20c0-3.3 3-5.5 7-5.5s7 2.2 7 5.5"
          stroke="#fff"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "פשטות וגמישות",
    text: "הזמנה מהירה, אישור מיידי, ללא בירוקרטיה — לכל תקופה.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 13l4 4L19 7"
          stroke="var(--color-aqua)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const WHY_FEATURES = [
  {
    title: "מיקום פריים לוקיישן",
    text: "50 מ׳ מהים, דקות מהטיילת, מסעדות, כביש 2/4, רכבת חוף הכרמל ומת״ם.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"
          stroke="var(--color-aqua)"
          strokeWidth="1.7"
        />
        <circle cx="12" cy="10" r="2.2" stroke="var(--color-aqua)" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    title: "נוף עוצר נשימה",
    text: "חלון חזיתי הפונה אל הים התיכון בכל אחת מהדירות — שקיעות בכל ערב.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
          stroke="var(--color-aqua)"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="12" r="2.6" stroke="var(--color-aqua)" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    title: "ותק וניסיון באירוח",
    text: "אירחנו אנשי הייטק, רפואה וטכנולוגיה מאינטל, רמב״ם, הטכניון ועוד.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6z"
          stroke="var(--color-aqua)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke="var(--color-aqua)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

/* ---------- העמוד ---------- */

export default function About() {
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
              { name: "אודות", path: "/about" },
            ])
          ),
        }}
      />
      <MotionEngine />

      {/* Hero — פירורי לחם, כותרת גרדיאנט וגל תחתון */}
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
              אודות
            </span>
          </nav>
          <h1
            data-ws=""
            className="mb-[22px] text-[40px]/[1.1] font-extrabold tracking-heading md:text-[62px]/[1.06]"
          >
            הבית שלכם מול
            <br />
            <span className="bg-[linear-gradient(120deg,var(--color-aqua),var(--color-sea-400))] bg-clip-text text-transparent">
              הים התיכון
            </span>
          </h1>
          <p data-rev="up" className="mx-auto max-w-[600px] text-[19px]/[1.66] font-light text-[#cdddea]">
            מגדל הים הוא מלון דירות בוטיק בבניין אלמוג, מגדלי חוף הכרמל — מקום שבו אדריכלות,
            נוף ושירות אישי נפגשים, 50 מטר בלבד מקו המים.
          </p>
        </Container>
        <WaveSeparator position="bottom" fill="var(--color-cloud)" />
      </section>

      {/* הסיפור שלנו — תמונה + תג "בניין אלמוג" מול טקסט */}
      <section className="bg-cloud py-14 md:py-[84px]">
        <Container className="flex flex-col items-center gap-12 lg:flex-row lg:gap-[60px]">
          <div className="relative w-full lg:flex-1">
            <Image
              src="/images/living-room.jpg"
              alt="סלון מעוצב עם ספה כחולה ונוף לים במגדל הים"
              width={1024}
              height={1024}
              data-rev="media"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="h-[300px] w-full rounded-card-lg object-cover md:h-[460px]"
            />
            <div className="absolute -bottom-6 left-4 flex items-center gap-3.5 rounded-card bg-white px-6 py-[18px] shadow-[0_18px_40px_rgba(14,37,64,0.16)] md:-bottom-[30px] md:-left-[22px]">
              <IconTile size={46} className="rounded-xl">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-5h6v5"
                    stroke="var(--color-aqua)"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconTile>
              <div>
                <div className="text-[22px] leading-none font-extrabold text-navy-800">
                  בניין אלמוג
                </div>
                <div className="mt-0.5 text-[13px] font-semibold text-ink-dim">
                  מגדלי חוף הכרמל, חיפה
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:flex-[1.08]">
            <SectionKicker className="mb-4">הסיפור שלנו</SectionKicker>
            <h2
              data-ws=""
              className="mb-[22px] text-[32px]/[1.2] font-extrabold tracking-heading text-navy-800 md:text-[44px]/[1.14]"
            >
              אירוח שמרגיש כמו בית, ברמה של מלון
            </h2>
            <p data-rev="up" className="mb-4 text-[17px] leading-[1.8] text-ink">
              מגדל הים נולד מתוך אהבה לחיפה ולים התיכון, ומתוך הרצון לתת לאורחים חוויה שונה
              מחדר מלון רגיל — מרחב פרטי, מרווח ומאובזר, עם כל הנוחות של בית אמיתי וכל הפינוק
              של אירוח מלונאי.
            </p>
            <p data-rev="up" className="text-[17px] leading-[1.8] text-ink">
              לאורך השנים אירחנו מאות אורחים — משפחות בחופשה, אנשי הייטק ורפואה בתקופות
              עבודה, וזוגות שחיפשו מנוחה מול הים. כל דירה מעוצבת בקפידה, מאובזרת עד הפרט
              האחרון, ומנוהלת באכפתיות ובשירות אישי לאורך כל השהייה.
            </p>
          </div>
        </Container>
      </section>

      {/* רצועת נתונים — ארבעה מונים עם מפרידים */}
      <section className="bg-white">
        <Container className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={
                "px-4 py-7 text-center md:px-6 md:py-12" +
                (i === 0 ? " border-b border-l border-[#eef2f6] lg:border-b-0" : "") +
                (i === 1 ? " border-b border-[#eef2f6] lg:border-b-0 lg:border-l" : "") +
                (i === 2 ? " border-l border-[#eef2f6]" : "")
              }
            >
              <div
                data-countup=""
                className="text-[34px] leading-none font-extrabold tracking-heading text-kicker md:text-[46px]"
              >
                {s.value}
              </div>
              <div className="mt-2 text-sm font-semibold text-ink-dim">{s.label}</div>
            </div>
          ))}
        </Container>
      </section>

      {/* הערכים שלנו — ארבעה כרטיסים בקסקדה איטית */}
      <section className="border-t border-[#eef2f6] bg-white py-14 md:py-[84px]">
        <Container>
          <div className="mb-[52px] flex flex-col items-center gap-3.5 text-center">
            <SectionKicker>
              הערכים שלנו
              <span aria-hidden="true" className="h-0.5 w-[22px] rounded-full bg-current" />
            </SectionKicker>
            <h2
              data-ws=""
              className="text-[32px]/[1.2] font-extrabold tracking-heading text-navy-800 md:text-[44px]/[1.14]"
            >
              מה שמנחה אותנו
            </h2>
            <p data-rev="up" className="max-w-[560px] text-[17px] leading-[1.6] text-ink-dim">
              ארבעה עקרונות שמלווים כל אירוח, מהפנייה הראשונה ועד הצ׳ק־אאוט
            </p>
          </div>
          <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                data-rev="card"
                className="vcard rounded-card border border-line bg-mist px-[26px] py-[30px]"
              >
                <IconTile size={54} className="mb-[18px]">
                  {v.icon}
                </IconTile>
                <h3 className="mb-2 text-[19px] font-bold text-navy-800">{v.title}</h3>
                <p className="text-[14.5px] leading-[1.6] text-ink-dim">{v.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* למה לבחור בנו — מקטע כהה עם תמונה ותג צף */}
      <section className="relative overflow-hidden bg-navy-900 py-14 text-white md:py-[84px]">
        <div
          aria-hidden="true"
          className="stm-blob absolute -top-[100px] -right-[60px] size-[380px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.22),transparent_70%)]"
        />
        <Container className="relative z-[2] flex flex-col items-center gap-12 lg:flex-row lg:gap-14">
          <div className="w-full lg:flex-[1.05]">
            <SectionKicker dark className="mb-4">
              למה לבחור בנו
            </SectionKicker>
            <h2
              data-ws=""
              className="mb-7 text-[32px]/[1.2] font-extrabold tracking-heading md:text-[44px]/[1.14]"
            >
              ההבדל נמצא <br />
              בפרטים הקטנים
            </h2>
            <div className="flex flex-col gap-[22px]">
              {WHY_FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="flex size-[46px] shrink-0 items-center justify-center rounded-xl bg-aqua/14">
                    {f.icon}
                  </div>
                  <div>
                    <h3 data-ws="" className="mb-[5px] text-lg font-bold">
                      {f.title}
                    </h3>
                    <p data-rev="up" className="text-[14.5px] leading-[1.55] text-on-navy">
                      {f.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative w-full lg:flex-[0.95]">
            <Image
              src="/images/bedroom-classic.jpg"
              alt="חדר שינה קלאסי עם דלתות למרפסת ונוף לים"
              width={928}
              height={1152}
              data-rev="media"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="h-[320px] w-full rounded-card-lg object-cover md:h-[460px]"
            />
            <div className="absolute -bottom-6 right-4 flex animate-float items-center gap-[13px] rounded-2xl bg-white px-5 py-[15px] shadow-[0_20px_40px_rgba(0,0,0,0.3)] [animation-duration:6.5s] md:-right-5">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect
                  x="3"
                  y="6"
                  width="18"
                  height="13"
                  rx="2"
                  stroke="var(--color-ocean-400)"
                  strokeWidth="1.7"
                />
                <path d="M3 10h18" stroke="var(--color-ocean-400)" strokeWidth="1.7" />
              </svg>
              <div>
                <div className="text-[15px] leading-[1.1] font-extrabold text-navy-800">
                  הכול כלול
                </div>
                <div className="text-[12.5px] font-semibold text-ink-dim">
                  חשבונות · ניקיון · נטפליקס
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA — באנר גרדיאנט מעוגל. הריפוד התחתון כולל את גובה גל הפוטר (70/120px)
          שחופף למקטע האחרון — כך הבאנר שומר על מרווח 56/84px מהקימור */}
      <section className="bg-white pt-14 pb-[126px] md:pt-[84px] md:pb-[204px]">
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
                  מוכנים לגלות את מגדל הים?
                </h2>
                <p data-rev="up" className="max-w-[460px] text-[17px] leading-[1.6] font-light text-[#bcd4e6]">
                  השאירו פרטים ונחזור אליכם עם הצעה אישית לדירה המושלמת — לנופש, לעסקים או
                  לתקופה ארוכה.
                </p>
              </div>
              <div data-rev="sm" className="flex flex-wrap items-center gap-3.5">
                <Button href="/#contact" surface="dark">
                  צרו קשר
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
