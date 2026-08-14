import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading, SectionKicker } from "@/components/ui/SectionHeading";
import { PageIntro } from "@/components/ui/PageIntro";
import { MotionEngine } from "@/components/site/MotionEngine";
import { ContactForm } from "@/components/site/ContactForm";
import { BUSINESS, MAPS_EMBED, MAPS_LINK, whatsappUrl } from "@/lib/business";
import { pageMeta, buildBreadcrumbLd, buildWebPageLd } from "@/lib/seo";

/* עמוד צור קשר — פתיח שקט, ערוצי קשר כרשימת מסמך, טופס על משטח לבן יחיד.
   פרטי הקשר מגיעים אך ורק מ-src/lib/business.ts */

const DESCRIPTION =
  "צרו קשר עם מגדל הים לקבלת מידע והצעה מותאמת לדירות וסוויטות מול הים בחיפה — לנופש, עסקים, מגורים זמניים וניהול דירות.";

/* טקסט הפתיחה לוואטסאפ — פעם אחת, לא שלוש (SEO-AUDIT A16) */
const WHATSAPP_PREFILL = "שלום, אשמח לקבל פרטים על אירוח במגדל הים.";

export const metadata: Metadata = pageMeta({
  title: "צור קשר | מגדל הים — דירות וסוויטות מול הים בחיפה",
  description: DESCRIPTION,
  path: "/contact",
});

/* ContactPage — מפנה לישות העסק ב-@id במקום להגדיר LodgingBusiness מתחרה.
   פרטי הקשר עצמם מוגדרים פעם אחת ב-buildSiteJsonLd (עמוד הבית). */
const STRUCTURED_DATA = buildWebPageLd({
  type: "ContactPage",
  name: "צור קשר — מגדל הים",
  description: DESCRIPTION,
  path: "/contact",
});

/* ---------- ערוצי קשר ---------- */

const CHANNELS: Array<{
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  ltr?: boolean;
}> = [
  {
    label: "WhatsApp",
    value: BUSINESS.phones.mobile.label,
    href: whatsappUrl(WHATSAPP_PREFILL),
    external: true,
    ltr: true,
  },
  {
    label: "טלפון",
    value: `${BUSINESS.phones.office.label} · ${BUSINESS.phones.mobile.label}`,
    href: BUSINESS.phones.office.tel,
    ltr: true,
  },
  { label: "דוא״ל", value: BUSINESS.email, href: `mailto:${BUSINESS.email}`, ltr: true },
  { label: "כתובת", value: BUSINESS.address.full, href: MAPS_LINK, external: true },
  { label: "שעות שירות", value: BUSINESS.hours },
];

const LOCATION_FACTS = [
  "כ־50 מטר מקו המים והטיילת",
  "דקות מכביש 2/4, רכבת חוף הכרמל ומת״ם",
  "קרוב למסעדות ולטיילת חוף הכרמל",
];

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbLd([
              { name: "ראשי", path: "/" },
              { name: "צור קשר", path: "/contact" },
            ]),
          ),
        }}
      />
      <MotionEngine />

      <PageIntro
        crumbs={[{ name: "ראשי", href: "/" }, { name: "צור קשר" }]}
        kicker="בואו נדבר"
        title={
          <>
            בואו נדבר
            <br />
            על האירוח הבא שלכם
          </>
        }
        lead="בין אם אתם מחפשים חופשה מול הים, אירוח עסקי, מגורים לתקופה או ניהול לדירה שלכם — השאירו פרטים ונחזור אליכם עם הפתרון המתאים."
      >
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button href={whatsappUrl(WHATSAPP_PREFILL)}>דברו איתנו ב־WhatsApp</Button>
          <Button variant="outline" href={BUSINESS.phones.office.tel}>
            התקשרו אלינו
          </Button>
        </div>
      </PageIntro>

      {/* טופס + ערוצי קשר כרשימת מסמך */}
      <section className="bg-white py-14 md:py-24">
        <Container className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.45fr_1fr] lg:gap-16">
          <div data-rev="card" className="border border-line bg-white p-6 md:p-10">
            <h2 className="ed-h2 mb-2.5 text-navy-800">ספרו לנו מה אתם מחפשים</h2>
            <p className="mb-7 text-[15.5px] leading-[1.65] text-ink-dim">
              השאירו פרטים קצרים ונציג שלנו יחזור אליכם בהקדם עם מידע והצעה מותאמת.
            </p>
            <ContactForm />
          </div>

          <aside>
            <h2 className="ed-h2 mb-2 text-navy-800">אנחנו כאן בשבילכם</h2>
            <p className="mb-6 text-[15.5px] leading-[1.65] text-ink-dim">
              צריכים עזרה בבחירת דירה או פתרון אירוח? אפשר ליצור איתנו קשר בדרך שנוחה לכם.
            </p>
            {CHANNELS.map((ch) => (
              <div key={ch.label} data-rev="up" className="ed-row flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-5">
                <span className="min-w-[110px] text-[13px] font-bold tracking-[0.06em] text-ink-dim">
                  {ch.label}
                </span>
                {ch.href ? (
                  <a
                    href={ch.href}
                    dir={ch.ltr ? "ltr" : undefined}
                    className="stm-link min-h-11 py-1 text-[16px] font-bold text-navy-800 sm:min-h-0"
                    {...(ch.external ? { target: "_blank", rel: "noopener" } : {})}
                  >
                    {ch.value}
                  </a>
                ) : (
                  <span className="text-[16px] font-bold text-navy-800">{ch.value}</span>
                )}
              </div>
            ))}
          </aside>
        </Container>
      </section>

      {/* מיקום — מפה מול פרטי הגעה */}
      <section className="overflow-hidden bg-paper py-14 md:py-24">
        <Container>
          <SectionHeading
            kicker="מגיעים אלינו"
            title="מול הים, בלב חיפה"
            lead="מגדל הים שוכן בבניין אלמוג, מגדלי חוף הכרמל, בכניסה הדרומית לחיפה — ממש על חוף הכרמל, כ־50 מטר בלבד מקו המים והטיילת."
            className="mb-11"
          />
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div data-rev="media" className="overflow-hidden border border-hairline">
              <iframe
                src={MAPS_EMBED}
                title="מפה — מגדל הים, בניין אלמוג, דוד אלעזר 10, חיפה"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-[300px] w-full border-0 md:h-[400px]"
              />
            </div>
            <div data-rev="up">
              <h3 className="ed-h3 mb-3 text-navy-800">{BUSINESS.address.full}</h3>
              <p className="mb-6 text-[15.5px] leading-[1.7] text-ink-dim">
                בניין אלמוג, מגדלי חוף הכרמל (לשעבר מלון מרידיאן) — דירות ויחידות נופש עם נוף
                לים התיכון, במרחק הליכה מהחוף והטיילת.
              </p>
              <ul className="mb-7 max-w-[420px]">
                {LOCATION_FACTS.map((fact) => (
                  <li key={fact} className="ed-row py-3 text-[15px] font-medium text-ink-strong">
                    {fact}
                  </li>
                ))}
              </ul>
              <Button variant="outline" href={MAPS_LINK} className="gap-2">
                פתחו ב־Google Maps
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* שלושה צעדים — רשימה ממוספרת, בלי כרטיסים */}
      <section className="bg-white py-14 md:py-24">
        <Container className="lg:grid lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div className="mb-10 lg:mb-0">
            <SectionKicker>פשוט לדבר איתנו</SectionKicker>
            <h2 className="ed-h2 mt-4 text-navy-800">
              שלושה צעדים
              <br />
              לפתרון המתאים
            </h2>
          </div>
          <div>
            {STEPS.map((step, i) => (
              <div key={step.title} data-rev="up" className="ed-row">
                <span aria-hidden="true" className="ed-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="ed-h3 text-navy-800">{step.title}</h3>
                  <p className="mt-1 text-[15px] leading-[1.6] text-ink-dim">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* סיום שקט — מפנה לעמודים הקנוניים */}
      <section className="ed-wave-clear bg-paper pt-14 md:pt-20">
        <Container className="flex flex-wrap items-center justify-between gap-10">
          <div className="min-w-[280px] flex-1">
            <h2 className="ed-h2 text-navy-800">מוכנים למצוא את הדירה שלכם מול הים?</h2>
            <p data-rev="up" className="mt-4 max-w-[460px] text-[17px] leading-[1.6] text-ink">
              השאירו פרטים או דברו איתנו עכשיו — ונעזור לכם למצוא את פתרון האירוח המתאים.
            </p>
          </div>
          <div data-rev="sm" className="flex flex-wrap items-center gap-4">
            <Button href={whatsappUrl(WHATSAPP_PREFILL)}>דברו איתנו</Button>
            <Button href="/rooms" variant="outline" className="px-6">
              לדירות והסוויטות
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
