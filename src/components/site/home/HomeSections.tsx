import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";
import { IconTile } from "@/components/ui/IconTile";
import { CheckItem } from "@/components/ui/CheckItem";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { RoomsCarousel } from "@/components/site/RoomsCarousel";
import { ContactForm } from "@/components/site/ContactForm";
import { ArticleCard } from "@/components/site/articles/ArticleCard";
import { Bubbles, type Bubble } from "@/components/site/Bubbles";
import { LISTED_ARTICLES } from "@/data/articles";
import { VISIBLE_SOLUTIONS } from "@/data/solutions";
import { fetchWebsiteRooms } from "@/lib/booking-api";
import { BUSINESS, MAPS_LINK } from "@/lib/business";

/* כל מקטעי עמוד הבית שאחרי ה-hero (אודות ← צור קשר) — חולצו מ-page.tsx
   כדי שגם טיוטת /aerial (מועמדת לדף בית עם פתיח scrollytelling) תרנדר את
   אותו תוכן בדיוק, בלי כפילות קוד. שינוי כאן משפיע על שני העמודים. */

/* שלושת המאמרים הראשונים מהקטלוג האמיתי — מקור אמת יחיד: data/articles.ts */
const HOME_ARTICLES = LISTED_ARTICLES.slice(0, 3);

const CONTACT_BUBBLES: Bubble[] = [
  { left: "10%", size: 13, dur: 15, delay: 1, v: "a" },
  { left: "22%", size: 8, dur: 12, delay: 6, v: "b" },
  { left: "34%", size: 9, dur: 18, delay: 5, v: "c" },
  { left: "46%", size: 15, dur: 14, delay: 2, v: "b" },
  { left: "58%", size: 7, dur: 13, delay: 8, v: "c" },
  { left: "70%", size: 12, dur: 16, delay: 3, v: "a" },
  { left: "82%", size: 10, dur: 19, delay: 9, v: "b" },
  { left: "91%", size: 14, dur: 15, delay: 4, v: "c" },
];

/* נתוני הפתרונות — מקור אמת יחיד: data/solutions.tsx (SEO-AUDIT A16).
   ההיסטים הדביקים של ערימת הכרטיסים נשארים כאן — הם עניין של המקטע הזה */
const SOLUTION_STICKY = ["lg:top-[90px]", "lg:top-[112px]", "lg:top-[134px]", "lg:top-[156px]", "lg:top-[178px]", "lg:top-[200px]"];

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
    title: "רמה מלונאית אמיתית",
    text: "מצעים ומגבות 5 כוכבים, מטבח מאובזר, נספרסו, סמארט TV וואי־פיי מהיר.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    /* "ותק וניסיון" עם שמות ארגונים הוחלף בעובדה ניתנת לאימות — הרשימה
       הוסרה יחד עם המרקיזה (אין אסמכתה; SEO-AUDIT) */
    title: "הכול כלול, בלי הפתעות",
    text: "חשבונות, ניקיון, נטפליקס ושירות אישי 24/7 — מחיר אחד, בלי עמלות נסתרות.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="6"
          width="18"
          height="13"
          rx="2"
          stroke="var(--color-aqua)"
          strokeWidth="1.7"
        />
        <path d="M3 10h18" stroke="var(--color-aqua)" strokeWidth="1.7" />
      </svg>
    ),
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
  {
    label: BUSINESS.email,
    href: `mailto:${BUSINESS.email}`,
    dir: "ltr" as const,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 6l8 5 8-5"
          stroke="var(--color-aqua)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="4" y="5" width="16" height="14" rx="2" stroke="var(--color-aqua)" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    /* היה כאן ‎tel:04-6891689‎ — לא URI תקין, ולא ניתן היה לחייג לנייד כלל */
    label: BUSINESS.phones.office.label,
    href: BUSINESS.phones.office.tel,
    dir: "ltr" as const,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    label: BUSINESS.phones.mobile.label,
    href: BUSINESS.phones.mobile.tel,
    dir: "ltr" as const,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="7" y="3" width="10" height="18" rx="2" stroke="var(--color-aqua)" strokeWidth="1.7" />
        <path d="M11 18h2" stroke="var(--color-aqua)" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: BUSINESS.address.full,
    href: MAPS_LINK,
    dir: undefined,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"
          stroke="var(--color-aqua)"
          strokeWidth="1.7"
        />
        <circle cx="12" cy="10" r="2.2" stroke="var(--color-aqua)" strokeWidth="1.7" />
      </svg>
    ),
  },
];

export async function HomeSections() {
  /* GuestHub מחזיר רק חדרים שסומנו לאתר ויש להם גלריה. נפילת השירות מחזירה
     null, ואז המקטע מציג הודעה במקום קרוסלה במקום להפיל את העמוד */
  const rooms = (await fetchWebsiteRooms()) ?? [];

  return (
    <>
      {/* אודות */}
      <section id="about" className="bg-cloud py-14 md:py-[74px]">
        <Container className="flex flex-col items-center gap-12 lg:flex-row lg:gap-14">
          <div className="relative w-full lg:flex-1">
            <Image
              src="/images/sea-view-sunset.jpg"
              alt="נוף שקיעה על הים והחוף ממרפסת מגדל הים"
              width={1600}
              height={1200}
              data-rev="media"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="h-[300px] w-full rounded-card-lg object-cover md:h-[420px]"
            />
            {/* עיגול "5★" הוסר — דירוג ללא מקור ניתן לאימות (תקדים no-fabricated-social-proof) */}
          </div>
          <div className="w-full lg:flex-[1.1]">
            <SectionHeading
              ws
              kicker="אודות מגדל הים"
              title={
                <>
                  לחוות את החיים, <br />
                  מול הים התיכון
                </>
              }
            />
            <p data-rev="up" className="mt-5 text-body">
              במגדל הים תמצאו מגוון דירות בוטיק וסוויטות, מעוצבות בקפידה ומאובזרות ברמה מלונאית —
              שילוב מושלם בין מגורים בלב העיר השוקקת לבין חופשה על הים. מתאים לנופש, לעבודה,
              לרילוקיישן ולכל תקופה, ללא בירוקרטיה.
            </p>
            {/* מספר הדירות הוחזר עם ערך שמסרו הבעלים במפורש — 22 (2026-08-15;
                קודם לכן "14+" הוסר באין אסמכתה, SEO-AUDIT B4) */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <StatCard rev countUp value="34–110" label="מ״ר לכל דירה" />
              <StatCard rev countUp value="+22" label="דירות וסוויטות" />
              <StatCard rev countUp value="50 מ׳" label="מקו החוף" />
              <StatCard rev countUp value="24/7" label="שירות אישי" />
            </div>
          </div>
        </Container>
      </section>

      {/* פתרונות — ערימת כרטיסים דביקה */}
      <section id="solutions" className="bg-white py-14 md:py-20">
        <Container>
          <SectionHeading
            center
            ws
            kicker="הפתרונות שלנו"
            title="פתרון אירוח לכל צורך"
            lead="דירה אחת, אינסוף סיבות להגיע — בחרו את הפתרון שמתאים בדיוק לכם"
            className="mb-12"
          />
          <div className="relative mx-auto flex max-w-[1040px] flex-col gap-9">
            {VISIBLE_SOLUTIONS.map((sol, i) => (
              <div
                key={sol.id}
                id={sol.id}
                className={`sol-card flex flex-col-reverse overflow-hidden rounded-[26px] border border-[#ecf1f6] bg-white shadow-[0_28px_60px_-26px_rgba(14,37,64,0.36)] lg:sticky lg:min-h-[336px] lg:flex-row ${SOLUTION_STICKY[i]}`}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 z-[3] h-1 bg-[linear-gradient(90deg,var(--color-aqua),var(--color-sea-500),var(--color-ocean-400))]"
                />
                <div className="flex flex-col p-6 md:p-11 lg:flex-[1.12]">
                  <div className="mb-5 flex items-center gap-4">
                    <IconTile>{sol.icon}</IconTile>
                    <span
                      aria-hidden="true"
                      className="text-[48px] leading-none font-extrabold tracking-heading text-[#eef2f7]"
                    >
                      {sol.num}
                    </span>
                  </div>
                  <h3 className="mb-2.5 text-[26px] font-extrabold tracking-heading text-navy-800 md:text-[30px]">
                    {sol.title}
                  </h3>
                  <p className="mb-6 max-w-[430px] text-[15.5px] leading-[1.65] text-ink-dim">
                    {sol.teaser}
                  </p>
                  <div className="mt-auto flex flex-col gap-3">
                    {sol.checks.map((c) => (
                      <CheckItem key={c}>{c}</CheckItem>
                    ))}
                  </div>
                </div>
                <div className="relative h-52 lg:h-auto lg:min-h-[336px] lg:flex-[0.92]">
                  <Image
                    src={sol.img.src}
                    alt={sol.img.alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(270deg,rgba(14,37,64,0.1),rgba(14,37,64,0.3))]"
                  />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* הדירות שלנו — כרטיסים חיים מ-GuestHub */}
      <section id="apartments" className="bg-cloud py-14 md:py-20">
        <Container>
          <SectionHeading ws kicker="הדירות שלנו" title="סוויטות נבחרות מול הים" className="mb-10" />
          {rooms.length > 0 ? (
            <RoomsCarousel rooms={rooms} />
          ) : (
            /* GuestHub לא זמין — העמוד לא נופל, והמבקר ממשיך למנוע ההזמנות */
            <div className="rounded-card-lg border border-line bg-white p-6 text-center text-[15.5px] leading-relaxed text-ink-dim md:p-10">
              רשימת הדירות מתעדכנת ברגעים אלה — אפשר לבדוק זמינות ומחירים ישירות במנוע
              ההזמנות.
            </div>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Button href="/rooms" variant="outline">
              לכל החדרים שלנו
            </Button>
            <Button href="/booking">בדקו זמינות</Button>
          </div>
        </Container>
      </section>

      {/* למה לבחור בנו */}
      <section
        id="why"
        className="relative overflow-hidden bg-navy-900 py-28 text-white md:pt-[150px] md:pb-[140px]"
      >
        <WaveSeparator position="top" fill="var(--color-cloud)" className="z-[3]" />
        <div
          aria-hidden="true"
          className="stm-blob absolute -top-[100px] -right-[60px] size-[380px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.22),transparent_70%)]"
        />
        <Container className="relative z-[2] flex flex-col items-center gap-12 lg:flex-row lg:gap-14">
          <div className="w-full lg:flex-[1.05]">
            <SectionHeading
              dark
              ws
              kicker="למה לבחור בנו"
              title={<>ההבדל נמצא <br />בפרטים הקטנים</>}
            />
            <div className="mt-7 flex flex-col gap-[22px]">
              {WHY_FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="flex size-[46px] shrink-0 items-center justify-center rounded-xl bg-aqua/14">
                    {f.icon}
                  </div>
                  <div>
                    <h3 data-ws="" className="mb-1 text-lg font-bold">
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
              src="/images/suite-details.jpg"
              alt="חדר שינה בסוויטה מוכן לאירוח — מגבות מקופלות, עלי ורדים ויין"
              width={1376}
              height={768}
              data-rev="media"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="h-[320px] w-full rounded-card-lg object-cover md:h-[480px]"
            />
            <div className="absolute -bottom-6 right-4 flex animate-float items-center gap-3 rounded-card bg-white px-5 py-3.5 shadow-e4 [animation-duration:6.5s] md:-right-5">
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
        <WaveSeparator position="bottom2" fill="#fff" className="z-[3]" />
      </section>

      {/* שלושה צעדים + שאלות נפוצות */}
      <section id="process" className="bg-white py-14 md:py-20">
        <Container className="flex flex-col gap-14 lg:flex-row">
          <div className="lg:flex-1">
            <SectionHeading ws kicker="פשוט להתארח" title={<>שלושה צעדים <br />עד הים</>} />
            {/* רצף אנכי 1→2→3 */}
            <div className="mt-8 flex flex-col gap-3.5">
              {STEPS.map((step, i) => (
                <div
                  key={step.title}
                  data-rev="card"
                  className="flex items-start gap-[18px] rounded-card border border-line bg-mist p-6"
                >
                  <div className="flex size-[42px] shrink-0 items-center justify-center rounded-btn bg-navy-800 text-lg font-extrabold text-aqua">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-navy-800">{step.title}</h3>
                    <p className="text-[14.5px] leading-[1.55] text-ink-dim">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:flex-1">
            <SectionHeading ws kicker="שאלות נפוצות" title="כל מה שרציתם לדעת" />
            <div className="mt-8 flex flex-col gap-3">
              {FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-tile border border-line bg-mist px-5 py-[18px]"
                >
                  <summary className="flex min-h-11 items-center justify-between gap-4 text-base font-bold text-navy-800">
                    {faq.q}
                    <span
                      aria-hidden="true"
                      className="inline-block text-[22px] font-normal text-ocean-400 transition-transform duration-300 ease-brand group-open:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3.5 text-[14.5px] leading-[1.6] text-ink-dim">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* מקטע "אורחים מספרים" הוסר: חוות הדעת שהיו כאן היו תוכן מומצא, שתיים
          מהן מיוחסות לחברות אמיתיות בשם, לצד דירוג 4.8 ללא מקור ניתן לאימות.
          יוחזר רק מול מקור ביקורות אמיתי. */}

      {/* מרקיזת הארגונים הוסרה — רשימת שמות ללא אסמכתה (תוכן לא ניתן לאימות) */}

      {/* בלוג */}
      <section id="blog" className="bg-white py-14 md:py-20">
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SectionHeading ws kicker="מאמרים ותובנות" title="מהבלוג של מגדל הים" />
            <Button href="/articles" variant="link">
              לכל המאמרים
            </Button>
          </div>
          {/* קודם לכן ישבו כאן שלושה מאמרים מומצאים שלא קיימים ב-/articles, עם
              משטחי תמונה אפורים ובלי קישור, מתחת לכפתור שהצביע על עצמו (#blog).
              עכשיו: שלושת המאמרים האמיתיים מהקטלוג, עם התמונות והקישורים שלהם */}
          {/* .art-wrap.is-grid — אותה מעטפת שמעצבת את הכרטיסים ב-/articles,
              כדי שכרטיס המאמר ייראה זהה בשני המקומות (ללא שכפול CSS) */}
          <div className="art-wrap is-grid">
            {HOME_ARTICLES.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </Container>
      </section>

      {/* צור קשר — בלי overflow-hidden על המקטע: פאנל התאריכון צף וגולש
          מתחת לגבולו; הדקורציות נחתכות ממילא בתוך .st-bg */}
      <section
        id="contact"
        className="relative bg-[linear-gradient(120deg,var(--color-navy-900),var(--color-ocean-700)_70%,var(--color-ocean-600))] py-28 md:py-[150px]"
      >
        <WaveSeparator position="top2" fill="#fff" className="z-[3]" />
        <div className="st-bg" aria-hidden="true">
          <div className="stm-blob absolute -top-[90px] -left-[50px] size-[340px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.25),transparent_70%)]" />
          <div className="st-orb st-orb-b right-[18%] top-[6%] size-[280px] bg-[radial-gradient(circle,rgba(86,192,240,0.26),transparent_70%)]" />
          <div className="st-orb st-orb-c left-[30%] bottom-[4%] size-[220px] bg-[radial-gradient(circle,rgba(124,208,247,0.2),transparent_72%)]" />
          <Bubbles items={CONTACT_BUBBLES} />
        </div>
        <Container className="relative z-[2] flex flex-col items-center gap-12 lg:flex-row">
          <div className="w-full text-white lg:flex-1">
            <SectionHeading dark ws kicker="בואו נתחיל" title={<>מתכננים הגעה <br />לחיפה?</>} />
            <p data-rev="up" className="mt-4 mb-7 max-w-[440px] text-[17.5px] leading-[1.65] text-[#bcd4e6]">
              השאירו פרטים ונחזור אליכם עם הצעה אישית לדירה המושלמת — לנופש, לעסקים או לתקופה
              ארוכה.
            </p>
            <div className="flex flex-col gap-3.5">
              {CONTACT_DETAILS.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex size-[42px] shrink-0 items-center justify-center rounded-btn bg-aqua/14">
                    {item.icon}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      dir={item.dir}
                      className="stm-link py-2 text-[15.5px] font-medium text-[#dceaf3] hover:text-white"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span dir={item.dir} className="text-[15.5px] font-medium text-[#dceaf3]">
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            data-rev="card"
            className="w-full rounded-img bg-white p-6 shadow-[0_30px_60px_rgba(0,0,0,0.3)] md:p-8 lg:flex-1"
          >
            <h3 className="mb-5 text-[23px] font-extrabold text-navy-800">בקשת הצעה מהירה</h3>
            {/* אותו טופס עובד של /contact בגרסה קומפקטית: שולח באמת ל-/api/leads
                עם אותה ולידציה, honeypot, הגבלת קצב וטיפול בשגיאות. קודם לכן
                ישב כאן ‎<form action="#contact">‎ ש-MotionEngine חטף והציג
                "✓ נשלח, נחזור אליכם" בזמן שהליד נזרק לפח */}
            <ContactForm variant="compact" idPrefix="lf" />
          </div>
        </Container>
        {/* גל הפתיחה של הפוטר מגיע מה-Footer המשותף (חופף לריפוד התחתון כאן) */}
      </section>
    </>
  );
}
