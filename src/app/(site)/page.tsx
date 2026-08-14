import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading, SectionKicker } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { MotionEngine } from "@/components/site/MotionEngine";
import { RoomsCarousel } from "@/components/site/RoomsCarousel";
import { ContactForm } from "@/components/site/ContactForm";
import { ArticleCard } from "@/components/site/articles/ArticleCard";
import { LISTED_ARTICLES } from "@/data/articles";
import { VISIBLE_SOLUTIONS } from "@/data/solutions";
import { buildSiteJsonLd } from "@/lib/seo";
import { fetchWebsiteRooms } from "@/lib/booking-api";
import { BUSINESS, MAPS_LINK } from "@/lib/business";

/* עמוד הבית — גרסה אדיטוריאלית ("בית על קו המים", ראו DESIGN-AUDIT.md).
   הצילום האמיתי מוביל; הבועות, האורבים, הכרטיסים הצפים, המרקיזה ומוני
   הספירה הוסרו. הנתונים החיים (GuestHub) והטופס נשארו כפי שהיו. */

/* שלושת המאמרים הראשונים מהקטלוג האמיתי — מקור אמת יחיד: data/articles.ts */
const HOME_ARTICLES = LISTED_ARTICLES.slice(0, 3);

const WHY_FEATURES = [
  {
    title: "מיקום פריים לוקיישן",
    text: "50 מ׳ מהים, דקות מהטיילת, מסעדות, כביש 2/4, רכבת חוף הכרמל ומת״ם.",
  },
  {
    title: "רמה מלונאית אמיתית",
    text: "מצעים ומגבות 5 כוכבים, מטבח מאובזר, נספרסו, סמארט TV וואי־פיי מהיר.",
  },
  {
    title: "נוף עוצר נשימה",
    text: "חלון חזיתי הפונה אל הים התיכון בכל אחת מהדירות — שקיעות בכל ערב.",
  },
  {
    title: "הכול כלול, בלי הפתעות",
    text: "חשבונות, ניקיון, נטפליקס ושירות אישי 24/7 — מחיר אחד, בלי עמלות נסתרות.",
  },
];

const STEPS = [
  { title: "בוחרים דירה", text: "לפי גודל, נוף ותקציב — נתאים לכם את הסוויטה המושלמת." },
  { title: "מזמינים אונליין", text: "אישור מיידי, ללא בירוקרטיה והתחייבות — תוך דקות." },
  { title: "נכנסים ונהנים", text: "צ׳ק־אין חלק, הדירה מוכנה ומאובזרת — ואתם מול הים." },
];

const FAQS = [
  {
    q: "מה כולל מחיר הדירה?",
    a: "כל הדירות מרוהטות ומאובזרות במלואן: מטבח, מצעים ומגבות מלונאיים, ואי־פיי מהיר, סמארט TV, נטפליקס ונספרסו — והחשבונות כלולים.",
  },
  {
    q: "מהי תקופת השכירות המינימלית?",
    a: "אנו מציעים השכרה לטווח קצר, בינוני וארוך — מלילה בודד ועד חודשים, בגמישות מלאה.",
  },
  {
    q: "מה המרחק מהים ומהטיילת?",
    a: "כ־50 מטר בלבד מקו המים ומהטיילת, בכניסה הדרומית לחיפה, על חוף הכרמל.",
  },
  {
    q: "האם הדירות מתאימות לעבודה ורילוקיישן?",
    a: "בהחלט. מרחב עבודה שקט ומאובזר, אידאלי לצוותים, לשהייה ממושכת ולתקופות מעבר.",
  },
];

const CONTACT_DETAILS = [
  { label: BUSINESS.phones.office.label, href: BUSINESS.phones.office.tel, dir: "ltr" as const },
  { label: BUSINESS.phones.mobile.label, href: BUSINESS.phones.mobile.tel, dir: "ltr" as const },
  { label: BUSINESS.email, href: `mailto:${BUSINESS.email}`, dir: "ltr" as const },
  { label: BUSINESS.address.full, href: MAPS_LINK, dir: undefined },
];

/* כותרת/תיאור/OG יורשים מתבנית השורש; הקנוניקל מוצהר כאן כדי שעמוד ה-404
   (שמרונדר בתבנית השורש) לא יירש קנוניקל שמצביע על הבית (SEO-AUDIT A5) */
export const metadata = { alternates: { canonical: "/" } };

/* קטלוג החדרים נמשך מ-GuestHub ומתרענן כל 5 דקות (ISR) — שאר העמוד סטטי */
export const revalidate = 300;

export default async function Home() {
  /* GuestHub מחזיר רק חדרים שסומנו לאתר ויש להם גלריה. נפילת השירות מחזירה
     null, ואז המקטע מציג הודעה במקום קרוסלה במקום להפיל את העמוד */
  const rooms = (await fetchWebsiteRooms()) ?? [];

  return (
    <>
      {/* שער חשיפות: רץ לפני ה-hydration כך שתוכן מסומן לא מהבהב לפני האנימציה */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('stm-js')",
        }}
      />
      {/* JSON-LD: WebSite + LodgingBusiness — בסיס לפאנל הידע ולמנועי חיפוש/AI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSiteJsonLd()) }}
      />
      <MotionEngine />

      {/* Hero צילומי — וידאו הים האמיתי ממלא את המסך; הטקסט מעוגן לתחתית,
          מיושר להתחלה (לא ממורכז). preload="metadata": הפוסטר הוא ה-LCP,
          הווידאו נטען רק כשמתחיל לנגן (SEO-AUDIT A1) */}
      <section className="hm-hero">
        <div className="hm-hero-media" aria-hidden="false">
          <video
            src="/videos/hero-sea.mp4"
            poster="/videos/hero-sea-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="נוף לים התיכון ממגדלי חוף הכרמל"
          />
          <div className="hm-hero-scrim" aria-hidden="true" />
        </div>
        <Container className="relative z-[2] pt-40 pb-16 text-white md:pt-48 md:pb-24">
          <p className="ed-enter ed-overline on-dark">
            מלון דירות בוטיק · חוף הכרמל, חיפה
          </p>
          <h1 className="ed-enter-1 ed-display mt-5 max-w-[13ch] text-white">
            לחיות מול הים,
            <br />
            ברמה מלונאית
          </h1>
          <p className="ed-enter-2 mt-6 max-w-[500px] text-lead text-[#dbe8f2]">
            דירות בוטיק וסוויטות מרווחות בבניין אלמוג — מאובזרות עד הפרט האחרון, עם חלון
            חזיתי לים התיכון. 50 מטר מקו המים.
          </p>
          <div className="ed-enter-3 mt-9 flex flex-wrap items-center gap-5">
            <Button href="/booking">בדיקת זמינות</Button>
            <Button href="/rooms" variant="link" surface="dark">
              לדירות והסוויטות
            </Button>
          </div>
          <p className="ed-enter-3 mt-10 border-t border-white/20 pt-4 text-[14px] font-semibold text-[#c9dbe8]">
            {BUSINESS.address.full} · {BUSINESS.hours}
          </p>
        </Container>
      </section>

      {/* פתיחה אדיטוריאלית — הסיפור + נתונים חשופים, על נייר חם */}
      <section id="about" className="bg-paper py-16 md:py-24">
        <Container className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
          <div className="w-full lg:flex-[1.1]">
            <SectionKicker>אודות מגדל הים</SectionKicker>
            <h2 className="ed-h2 mt-4 text-navy-800">
              לחוות את החיים,
              <br />
              מול הים התיכון
            </h2>
            <p data-rev="up" className="mt-6 max-w-[540px] text-body">
              במגדל הים תמצאו מגוון דירות בוטיק וסוויטות, מעוצבות בקפידה ומאובזרות ברמה מלונאית —
              שילוב מושלם בין מגורים בלב העיר השוקקת לבין חופשה על הים. מתאים לנופש, לעבודה,
              לרילוקיישן ולכל תקופה, ללא בירוקרטיה.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3">
              <StatCard rev value="50 מ׳" label="מקו החוף והטיילת" />
              <StatCard rev value="34–110" label="מ״ר לכל דירה" />
              <StatCard rev value="24/7" label="שירות אישי" />
            </div>
            <div data-rev="sm" className="mt-9">
              <Button href="/about" variant="link">
                הסיפור המלא שלנו
              </Button>
            </div>
          </div>
          <div className="w-full lg:flex-[0.9]">
            <Image
              src="/images/sea-view-sunset.jpg"
              alt="נוף שקיעה על הים והחוף ממרפסת מגדל הים"
              width={1600}
              height={1200}
              data-rev="media"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="h-[320px] w-full object-cover md:h-[480px]"
            />
            <p className="ed-hairline mt-3 pt-3 text-[13px] font-semibold text-ink-dim">
              שקיעה מהמרפסת — בניין אלמוג, חוף הכרמל
            </p>
          </div>
        </Container>
      </section>

      {/* הדירות — הצילום החי מ-GuestHub מוביל */}
      <section id="apartments" className="border-t border-hairline bg-white py-16 md:py-24">
        <Container>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <SectionHeading kicker="הדירות שלנו" title="סוויטות נבחרות מול הים" />
            <Button href="/rooms" variant="link">
              לכל הדירות והסוויטות
            </Button>
          </div>
          {rooms.length > 0 ? (
            <RoomsCarousel rooms={rooms} />
          ) : (
            /* GuestHub לא זמין — העמוד לא נופל, והמבקר ממשיך למנוע ההזמנות */
            <div className="ed-hairline-cool py-10 text-center text-[15.5px] leading-relaxed text-ink-dim">
              רשימת הדירות מתעדכנת ברגעים אלה — אפשר לבדוק זמינות ומחירים ישירות במנוע
              ההזמנות.
            </div>
          )}
          <div className="mt-10 flex justify-center">
            <Button href="/booking">בדקו זמינות ומחיר</Button>
          </div>
        </Container>
      </section>

      {/* פתרונות — רשימה אדיטוריאלית ממוספרת שמקשרת לעמוד המלא
          (מחליפה את ערימת הכרטיסים הדביקה; התוכן המלא חי ב-/solutions) */}
      <section id="solutions" className="bg-paper-deep py-16 md:py-24">
        <Container className="lg:grid lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div className="mb-10 lg:mb-0">
            <SectionKicker>הפתרונות שלנו</SectionKicker>
            <h2 className="ed-h2 mt-4 text-navy-800">
              פתרון אירוח
              <br />
              לכל צורך
            </h2>
            <p data-rev="up" className="mt-5 max-w-[380px] text-body">
              דירה אחת, אינסוף סיבות להגיע — מנופש קצר ועד רילוקיישן מלא.
            </p>
            <div data-rev="sm" className="mt-8">
              <Button href="/solutions" variant="link">
                לכל פתרונות האירוח
              </Button>
            </div>
          </div>
          <div>
            {VISIBLE_SOLUTIONS.map((sol) => (
              <Link
                key={sol.id}
                href={`/solutions#${sol.id}`}
                className="ed-row group items-baseline no-underline"
              >
                <span aria-hidden="true" className="ed-num">
                  {sol.num}
                </span>
                <span className="flex-1">
                  <span className="ed-h3 block text-navy-800 transition-colors duration-200 group-hover:text-ocean-400">
                    {sol.title}
                  </span>
                  <span className="mt-1.5 block max-w-[52ch] text-[15px] leading-[1.65] text-ink-dim">
                    {sol.teaser}
                  </span>
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0 self-center text-ocean-400 transition-transform duration-300 group-hover:-translate-x-1"
                >
                  <path
                    d="M15 6l-6 6 6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* למה לבחור בנו — מקטע כהה שקט (נייבי אחיד, בלי גרדיאנט ובלי blobs) */}
      <section id="why" className="relative bg-navy-900 pt-24 pb-16 text-white md:pt-32 md:pb-24">
        <WaveSeparator position="top" fill="var(--color-paper-deep)" />
        <Container className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
          <div className="w-full lg:flex-[1.05]">
            <SectionHeading
              dark
              kicker="למה לבחור בנו"
              title={
                <>
                  ההבדל נמצא <br />
                  בפרטים הקטנים
                </>
              }
            />
            <div className="on-dark mt-9">
              {WHY_FEATURES.map((f) => (
                <div key={f.title} data-rev="up" className="ed-row flex-col gap-1.5 sm:flex-row sm:gap-5">
                  <h3 className="ed-h3 min-w-[210px] text-white">{f.title}</h3>
                  <p className="text-[15px] leading-[1.65] text-on-navy">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full lg:flex-[0.95]">
            <Image
              src="/images/suite-details.jpg"
              alt="חדר שינה בסוויטה מוכן לאירוח — מגבות מקופלות, עלי ורדים ויין"
              width={1376}
              height={768}
              data-rev="media"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="h-[320px] w-full object-cover md:h-[460px]"
            />
          </div>
        </Container>
      </section>

      {/* שלושה צעדים + שאלות נפוצות — רשימות מסמך, בלי קופסאות */}
      <section id="process" className="bg-white py-16 md:py-24">
        <Container className="flex flex-col gap-16 lg:flex-row lg:gap-20">
          <div className="lg:flex-1">
            <SectionHeading
              kicker="פשוט להתארח"
              title={
                <>
                  שלושה צעדים <br />
                  עד הים
                </>
              }
            />
            <div className="mt-8">
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
          </div>
          <div className="lg:flex-1">
            <SectionHeading kicker="שאלות נפוצות" title="כל מה שרציתם לדעת" />
            <div className="mt-8">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group ed-hairline">
                  <summary className="flex min-h-14 items-center justify-between gap-4 py-3 text-[16.5px] font-bold text-navy-800">
                    {faq.q}
                    <span
                      aria-hidden="true"
                      className="inline-block text-[22px] font-normal text-ocean-400 transition-transform duration-300 ease-brand group-open:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-5 text-[15px] leading-[1.65] text-ink-dim">{faq.a}</p>
                </details>
              ))}
              <div className="ed-hairline pt-5">
                <Button href="/faq" variant="link">
                  לכל השאלות והתשובות
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* מקטע "אורחים מספרים" ומרקיזת הארגונים הוסרו: תוכן שאינו ניתן לאימות
          (חוות דעת, דירוג, שמות ארגונים) יוחזר רק מול מקור אמיתי מהבעלים */}

      {/* בלוג */}
      <section id="blog" className="bg-paper py-16 md:py-24">
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SectionHeading kicker="מאמרים ותובנות" title="מהבלוג של מגדל הים" />
            <Button href="/articles" variant="link">
              לכל המאמרים
            </Button>
          </div>
          {/* .art-wrap.is-grid — אותה מעטפת שמעצבת את הכרטיסים ב-/articles */}
          <div className="art-wrap is-grid">
            {HOME_ARTICLES.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </Container>
      </section>

      {/* צור קשר — נייבי אחיד; navy-900 כדי שגל הפוטר (navy-950) ייקרא מעליו */}
      <section id="contact" className="ed-wave-clear bg-navy-900 pt-16 md:pt-24">
        <Container className="flex flex-col gap-12 lg:flex-row lg:gap-20">
          <div className="w-full text-white lg:flex-1">
            <SectionHeading
              dark
              kicker="בואו נתחיל"
              title={
                <>
                  מתכננים הגעה <br />
                  לחיפה?
                </>
              }
            />
            <p data-rev="up" className="mt-4 mb-8 max-w-[440px] text-[17px] leading-[1.65] text-[#bcd4e6]">
              השאירו פרטים ונחזור אליכם עם הצעה אישית לדירה המושלמת — לנופש, לעסקים או לתקופה
              ארוכה.
            </p>
            <div className="on-dark">
              {CONTACT_DETAILS.map((item) => (
                <div key={item.label} className="ed-row py-3.5">
                  <a
                    href={item.href}
                    dir={item.dir}
                    className="stm-link py-1 text-[15.5px] font-medium text-[#dceaf3] hover:text-white"
                  >
                    {item.label}
                  </a>
                </div>
              ))}
              <div className="ed-row py-3.5">
                <span className="text-[15.5px] font-medium text-[#9fb6c8]">{BUSINESS.hours}</span>
              </div>
            </div>
          </div>

          {/* משטח לבן יחיד — טופס זקוק לרקע בהיר עבור השדות */}
          <div data-rev="card" className="w-full bg-white p-6 md:p-9 lg:flex-1 lg:self-start">
            <h3 className="ed-h3 mb-5 text-navy-800">בקשת הצעה מהירה</h3>
            {/* אותו טופס עובד של /contact בגרסה קומפקטית: שולח באמת ל-/api/leads
                עם אותה ולידציה, honeypot, הגבלת קצב וטיפול בשגיאות */}
            <ContactForm variant="compact" idPrefix="lf" />
          </div>
        </Container>
        {/* גל הפתיחה של הפוטר מגיע מה-Footer המשותף (חופף לריפוד התחתון כאן) */}
      </section>
    </>
  );
}
