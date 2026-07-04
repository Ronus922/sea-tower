import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionKicker } from "@/components/ui/SectionHeading";
import { IconTile } from "@/components/ui/IconTile";
import { CheckItem } from "@/components/ui/CheckItem";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { MotionEngine } from "@/components/site/MotionEngine";
import { ContactForm } from "@/components/site/ContactForm";
import { BUSINESS, MAPS_EMBED, MAPS_LINK, whatsappUrl } from "@/lib/business";

/* עמוד צור קשר — שפת העיצוב של design-reference/exports/Solutions.html.
   פרטי הקשר מגיעים אך ורק מ-src/lib/business.ts */

const DESCRIPTION =
  "צרו קשר עם Sea Tower לקבלת מידע והצעה מותאמת לדירות וסוויטות מול הים בחיפה — לנופש, עסקים, מגורים זמניים וניהול דירות.";

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.siteUrl),
  title: "צור קשר | Sea Tower דירות וסוויטות מול הים בחיפה",
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "צור קשר | Sea Tower דירות וסוויטות מול הים בחיפה",
    description: DESCRIPTION,
    url: "/contact",
    siteName: "מגדל הים — Sea Tower",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "/images/hero-terrace.jpg",
        width: 1376,
        height: 768,
        alt: "מרפסת פנטהאוז מול מפרץ חיפה בשעת שקיעה",
      },
    ],
  },
};

/* ContactPage + LodgingBusiness — פרטים מאומתים בלבד (business.ts) */
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      name: "צור קשר — מגדל הים",
      url: `${BUSINESS.siteUrl}/contact`,
      inLanguage: "he",
    },
    {
      "@type": "LodgingBusiness",
      name: "מגדל הים — Sea Tower",
      url: BUSINESS.siteUrl,
      image: `${BUSINESS.siteUrl}/images/hero-terrace.jpg`,
      telephone: "+972-4-6891689",
      email: BUSINESS.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: BUSINESS.address.street,
        addressLocality: BUSINESS.address.city,
        addressCountry: "IL",
      },
    },
  ],
};

/* ---------- ערוצי קשר ---------- */

type Channel = {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  ltr?: boolean;
  icon: React.ReactNode;
};

const CHANNELS: Channel[] = [
  {
    label: "WhatsApp",
    value: BUSINESS.phones.mobile.label,
    href: whatsappUrl("שלום, אשמח לקבל פרטים על אירוח במגדל הים."),
    external: true,
    ltr: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3z"
          stroke="var(--color-aqua)"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9.2 8.4c.5 3 3.4 5.9 6.4 6.4l.9-.9c.2-.2.6-.3.9-.1l1.5.7"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "טלפון",
    value: `${BUSINESS.phones.office.label} · ${BUSINESS.phones.mobile.label}`,
    href: BUSINESS.phones.office.tel,
    ltr: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z"
          stroke="var(--color-aqua)"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "דוא״ל",
    value: BUSINESS.email,
    href: `mailto:${BUSINESS.email}`,
    ltr: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 6l8 5 8-5"
          stroke="var(--color-aqua)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="4" y="5" width="16" height="14" rx="2" stroke="#fff" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    label: "כתובת",
    value: BUSINESS.address.full,
    href: MAPS_LINK,
    external: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"
          stroke="#fff"
          strokeWidth="1.7"
        />
        <circle cx="12" cy="10" r="2.2" stroke="var(--color-aqua)" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    label: "שעות שירות",
    value: BUSINESS.hours,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" stroke="#fff" strokeWidth="1.7" />
        <path
          d="M12 7.5V12l3 2"
          stroke="var(--color-aqua)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

/* ---------- שלושת הצעדים ---------- */

const STEPS = [
  { title: "משאירים פרטים", text: "מספרים לנו מה אתם מחפשים ובאילו תאריכים." },
  { title: "מקבלים התאמה", text: "נציג שלנו בודק את האפשרויות ומתאים לכם את הפתרון הנכון." },
  { title: "מתקדמים להזמנה", text: "מקבלים את כל הפרטים וממשיכים להזמנה בצורה פשוטה וברורה." },
];

/* ---------- העמוד ---------- */

export default function Contact() {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <MotionEngine />

      {/* Hero — פירורי לחם, כותרת גרדיאנט, שני CTA וגל תחתון */}
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
            className="hero-in-1 mb-[26px] inline-flex items-center gap-2 text-[13.5px] font-medium text-[#acc8dd]"
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
              צור קשר
            </span>
          </nav>
          <h1
            data-ws=""
            className="mb-[22px] text-[40px]/[1.1] font-extrabold tracking-heading md:text-[62px]/[1.06]"
          >
            בואו נדבר
            <br />
            <span className="bg-[linear-gradient(120deg,var(--color-aqua),var(--color-sea-400))] bg-clip-text text-transparent">
              על האירוח הבא שלכם
            </span>
          </h1>
          <p className="hero-in-3 mx-auto mb-[34px] max-w-[600px] text-[19px]/[1.66] font-light text-[#cdddea]">
            בין אם אתם מחפשים חופשה מול הים, אירוח עסקי, מגורים לתקופה או ניהול לדירה שלכם —
            השאירו פרטים ונחזור אליכם עם הפתרון המתאים.
          </p>
          <div className="hero-in-4 flex flex-wrap items-center justify-center gap-3.5">
            <Button
              surface="dark"
              href={whatsappUrl("שלום, אשמח לקבל פרטים על אירוח במגדל הים.")}
            >
              דברו איתנו ב־WhatsApp
            </Button>
            <Button variant="outline" surface="dark" href={BUSINESS.phones.office.tel}>
              התקשרו אלינו
            </Button>
          </div>
        </Container>
        <WaveSeparator position="bottom" fill="var(--color-cloud)" />
      </section>

      {/* טופס + פאנל ערוצי קשר */}
      <section className="bg-cloud py-14 md:py-[84px]">
        <Container className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.45fr_1fr] lg:gap-11">
          <div
            data-rev="card"
            className="rounded-[26px] border border-[#ecf1f6] bg-white p-6 shadow-[0_28px_60px_-26px_rgba(14,37,64,0.36)] md:p-10"
          >
            <h2 className="mb-2.5 text-[26px] font-extrabold tracking-heading text-navy-800 md:text-[30px]">
              ספרו לנו מה אתם מחפשים
            </h2>
            <p className="mb-7 text-[15.5px] leading-[1.65] text-ink-dim">
              השאירו פרטים קצרים ונציג שלנו יחזור אליכם בהקדם עם מידע והצעה מותאמת.
            </p>
            <ContactForm />
          </div>

          <aside className="flex flex-col gap-3.5">
            <div data-rev="up" className="mb-1.5">
              <h2 className="mb-2 text-[26px] font-extrabold tracking-heading text-navy-800">
                אנחנו כאן בשבילכם
              </h2>
              <p className="text-[15.5px] leading-[1.65] text-ink-dim">
                צריכים עזרה בבחירת דירה או פתרון אירוח? אפשר ליצור איתנו קשר בדרך שנוחה לכם.
              </p>
            </div>

            {CHANNELS.map((ch) => {
              const inner = (
                <>
                  <IconTile size={46}>{ch.icon}</IconTile>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-ink-dim">
                      {ch.label}
                    </span>
                    <span
                      dir={ch.ltr ? "ltr" : undefined}
                      className="block truncate text-[15.5px] font-bold text-navy-800"
                    >
                      {ch.value}
                    </span>
                  </span>
                </>
              );
              const cardClass =
                "ctc-card flex min-h-11 items-center gap-3.5 rounded-card border border-line bg-white px-5 py-4";
              return ch.href ? (
                <a
                  key={ch.label}
                  href={ch.href}
                  data-rev="card"
                  className={cardClass}
                  {...(ch.external ? { target: "_blank", rel: "noopener" } : {})}
                >
                  {inner}
                </a>
              ) : (
                <div key={ch.label} data-rev="card" className={cardClass}>
                  {inner}
                </div>
              );
            })}

            <div
              data-rev="card"
              className="mt-1.5 flex items-center gap-3.5 rounded-card bg-[linear-gradient(135deg,var(--color-navy-800),var(--color-ocean-600))] px-5 py-[18px] text-white"
            >
              <span
                aria-hidden="true"
                className="flex size-[46px] shrink-0 items-center justify-center rounded-tile bg-aqua/14"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 12A10 10 0 1112 2"
                    stroke="var(--color-aqua)"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                  <path
                    d="M22 4L12 14l-3-3"
                    stroke="#fff"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>
                <span className="block text-[16px] font-extrabold">חוזרים אליכם במהירות</span>
                <span className="block text-[13.5px] leading-[1.5] text-on-navy">
                  השאירו פרטים ונציג שלנו יחזור אליכם בהקדם האפשרי.
                </span>
              </span>
            </div>
          </aside>
        </Container>
      </section>

      {/* מיקום — מפה מול פרטי הגעה */}
      <section className="overflow-hidden bg-white py-14 md:py-[84px]">
        <Container>
          <div className="mb-11 flex flex-col items-center gap-3.5 text-center">
            <SectionKicker>מגיעים אלינו</SectionKicker>
            <h2
              data-ws=""
              className="text-[32px]/[1.2] font-extrabold tracking-heading text-navy-800 md:text-h2"
            >
              מול הים, בלב חיפה
            </h2>
            <p data-rev="up" className="max-w-[620px] text-[17px] leading-[1.7] text-ink">
              מגדל הים שוכן בבניין אלמוג, מגדלי חוף הכרמל, בכניסה הדרומית לחיפה — ממש על חוף
              הכרמל, כ־50 מטר בלבד מקו המים והטיילת.
            </p>
          </div>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div
              data-rev="right"
              className="overflow-hidden rounded-card-lg border border-line shadow-e2"
            >
              <iframe
                src={MAPS_EMBED}
                title="מפה — מגדל הים, בניין אלמוג, דוד אלעזר 10, חיפה"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-[300px] w-full border-0 md:h-[400px]"
              />
            </div>
            <div data-rev="left">
              <h3 className="mb-3 text-[22px] font-extrabold tracking-heading text-navy-800">
                {BUSINESS.address.full}
              </h3>
              <p className="mb-6 text-[15.5px] leading-[1.7] text-ink-dim">
                בניין אלמוג, מגדלי חוף הכרמל (לשעבר מלון מרידיאן) — דירות ויחידות נופש עם נוף
                לים התיכון, במרחק הליכה מהחוף והטיילת.
              </p>
              <div className="mb-7 flex flex-col gap-3">
                <CheckItem>כ־50 מטר מקו המים והטיילת</CheckItem>
                <CheckItem>דקות מכביש 2/4, רכבת חוף הכרמל ומת״ם</CheckItem>
                <CheckItem>קרוב למסעדות ולטיילת חוף הכרמל</CheckItem>
              </div>
              <Button variant="outline" href={MAPS_LINK} className="gap-2">
                פתחו ב־Google Maps
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* שלושה צעדים */}
      <section className="border-t border-[#eef2f6] bg-white py-14 md:py-20">
        <Container>
          <div className="mb-[46px] flex flex-col items-center gap-3.5 text-center">
            <SectionKicker>
              פשוט לדבר איתנו
              <span aria-hidden="true" className="h-0.5 w-[22px] rounded-full bg-current" />
            </SectionKicker>
            <h2
              data-ws=""
              className="text-[32px]/[1.2] font-extrabold tracking-heading text-navy-800 md:text-[40px]/[1.14]"
            >
              שלושה צעדים לפתרון המתאים
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                data-rev="card"
                className="rounded-card border border-line bg-mist px-7 py-8"
              >
                <div className="mb-4 flex size-[46px] items-center justify-center rounded-[12px] bg-navy-800 text-[20px] font-extrabold text-aqua">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-[19px] font-bold text-navy-800">{step.title}</h3>
                <p className="text-[14.5px] leading-[1.6] text-ink-dim">{step.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA סיום — הריפוד התחתון כולל את גובה גל הפוטר (70/120px) שחופף למקטע */}
      <section className="bg-cloud pt-14 pb-[126px] md:pt-20 md:pb-[204px]">
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
                  מוכנים למצוא את הדירה שלכם מול הים?
                </h2>
                <p
                  data-rev="up"
                  className="max-w-[460px] text-[17px] leading-[1.6] font-light text-[#bcd4e6]"
                >
                  השאירו פרטים או דברו איתנו עכשיו — ונעזור לכם למצוא את פתרון האירוח המתאים.
                </p>
              </div>
              <div data-rev="sm" className="flex flex-wrap items-center gap-3.5">
                <Button
                  surface="dark"
                  href={whatsappUrl("שלום, אשמח לקבל פרטים על אירוח במגדל הים.")}
                >
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
