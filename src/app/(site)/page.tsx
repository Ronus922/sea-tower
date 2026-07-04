import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Chip, ImageBadge } from "@/components/ui/Chip";
import { Stars } from "@/components/ui/Stars";
import { StatCard } from "@/components/ui/StatCard";
import { IconTile } from "@/components/ui/IconTile";
import { CheckItem } from "@/components/ui/CheckItem";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { Testimonials } from "@/components/site/Testimonials";
import { MotionEngine } from "@/components/site/MotionEngine";
import { buildSiteJsonLd } from "@/lib/seo";

/* עמוד הבית — נבנה לפי design-reference (Home.html / Home.png) */

/* ---------- רקע "גלי הים": בועות ---------- */

/* וריאנט המסלול (a/b/c = stRise/stRiseB/stRiseC) לפי הבועה המקבילה ברפרנס */
type Bubble = { left: string; size: number; dur: number; delay: number; v: "a" | "b" | "c" };

const HERO_BUBBLES: Bubble[] = [
  { left: "8%", size: 14, dur: 13, delay: 0, v: "a" },
  { left: "16%", size: 8, dur: 11, delay: 4, v: "b" },
  { left: "24%", size: 9, dur: 16, delay: 3, v: "c" },
  { left: "31%", size: 12, dur: 14, delay: 7, v: "b" },
  { left: "38%", size: 18, dur: 18, delay: 6, v: "a" },
  { left: "47%", size: 7, dur: 12, delay: 1, v: "c" },
  { left: "55%", size: 11, dur: 14, delay: 2, v: "a" },
  { left: "62%", size: 9, dur: 17, delay: 9, v: "b" },
  { left: "68%", size: 7, dur: 15, delay: 8, v: "c" },
  { left: "74%", size: 13, dur: 16, delay: 4, v: "a" },
  { left: "80%", size: 15, dur: 13, delay: 5, v: "b" },
  { left: "86%", size: 8, dur: 18, delay: 11, v: "c" },
  { left: "92%", size: 10, dur: 19, delay: 10, v: "a" },
  { left: "96%", size: 6, dur: 14, delay: 2, v: "b" },
];

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

function Bubbles({ items }: { items: Bubble[] }) {
  return (
    <>
      {items.map((b, i) => (
        <span
          key={i}
          className={`st-bub${b.v === "a" ? "" : ` st-bub-${b.v}`}`}
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </>
  );
}

/* ---------- תוכן ---------- */

const SOLUTIONS = [
  {
    num: "01",
    title: "נופש מול הים",
    text: "חופשה זוגית או משפחתית בסוויטה מפנקת עם נוף לים, במרחק נגיעה מהטיילת.",
    checks: ["נוף חזיתי לים מכל דירה", "50 מ׳ מהטיילת והחוף", "מאובזר ברמה מלונאית"],
    img: { src: "/images/hero-terrace.jpg", alt: "מרפסת סוויטה מול הים" },
    sticky: "lg:top-[90px]",
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
    num: "02",
    title: "אירוח לעסקים",
    text: "מרחב עבודה שקט ומאובזר לצוותים ולשהייה ממושכת — שהעובדים יגיעו רעננים.",
    checks: ["מרחב עבודה שקט ואינטרנט מהיר", "חשבוניות וקבלות לחברה", "מתאים לצוותים ולשהייה ארוכה"],
    img: { src: "/images/living-room.jpg", alt: "סלון מרווח המתאים לעבודה" },
    sticky: "lg:top-[112px]",
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
    num: "03",
    title: "רילוקיישן",
    text: "נחיתה רכה בחיפה — דירה מרוהטת ומוכנה, כולל כל החשבונות, ללא התחייבות.",
    checks: ["דירה מרוהטת ומוכנה מהיום הראשון", "כל החשבונות כלולים", "ליווי אישי וגמישות מלאה"],
    img: { src: "/images/bedroom-classic.jpg", alt: "חדר שינה עם יציאה למרפסת ונוף לים" },
    sticky: "lg:top-[134px]",
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
    num: "04",
    title: "השכרה לטווח קצר",
    text: "לילה, שבוע או חודש — גמישות מלאה ואישור מיידי, בלי בירוקרטיה מיותרת.",
    checks: ["אישור מיידי, ללא בירוקרטיה", "מלילה בודד ועד חודש", "מדיניות ביטול גמישה"],
    img: { src: "/images/suite-royal.jpg", alt: "חדר שינה בסוויטה עם נוף פנורמי לים" },
    sticky: "lg:top-[156px]",
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
    num: "05",
    title: "השכרה לטווח ארוך",
    text: "מגורים זמניים בזמן שיפוץ, תיירות מרפא או תקופת מעבר — בנוחות של בית.",
    checks: ["תנאים משתלמים לטווח ארוך", "אחזקה ושירות שוטף", "פתרון מושלם לתקופת מעבר"],
    img: { src: "/images/suite-jacuzzi.jpg", alt: "סוויטה עם ג׳קוזי מול הים" },
    sticky: "lg:top-[178px]",
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
    num: "06",
    title: "ניהול דירות",
    text: "בעלי נכסים? ננהל עבורכם את הדירה להשכרה — תפעול, אירוח ותחזוקה מקצה לקצה.",
    checks: ["תפעול, אירוח ותחזוקה מקצה לקצה", "שיווק הנכס למקסום תפוסה", "דוחות הכנסה שקופים"],
    img: { src: "/images/living-room.jpg", alt: "סלון דירה מנוהלת במגדל הים" },
    sticky: "lg:top-[200px]",
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

const APARTMENTS = [
  {
    title: "סוויטת רויאל קינג משפחתית",
    badge: { label: "נוף חזיתי", variant: "light" as const },
    chips: ["4 אורחים", "86 מ״ר", "2 חדרים"],
    text: "אירוח משפחתי בנוחות מקסימלית מול הנוף המרהיב של הים התיכון, בהרגשה ביתית.",
    img: { src: "/images/suite-royal.jpg", alt: "סוויטת רויאל קינג — חדר שינה עם נוף לים" },
  },
  {
    title: "לאקצ׳רי סוויט קווין",
    badge: { label: "ג׳קוזי", variant: "brand" as const },
    chips: ["2 אורחים", "86 מ״ר", "לופט"],
    text: "לופט ענק זוגי עם חדר שינה, מטבח מרווח וג׳קוזי — מול הנוף המרהיב של הים.",
    img: { src: "/images/suite-jacuzzi.jpg", alt: "לאקצ׳רי סוויט עם ג׳קוזי מול הים" },
  },
  {
    title: "סוויטה עם מרפסת פנורמית",
    badge: { label: "מרפסת", variant: "light" as const },
    chips: ["6 אורחים", "110 מ״ר", "3 חדרים"],
    text: "דירת שלושה חדרים מרווחת עם מרפסת פנורמית — מושלמת לאירוח משפחתי גדול.",
    img: { src: "/images/hero-terrace.jpg", alt: "מרפסת פנורמית מול מפרץ חיפה" },
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

const ORGS = ["intel", "רמב״ם", "הטכניון", "ZIM", "אגד", "מקורות", "מת״ם"];

const BLOG_POSTS = [
  {
    tag: "מדריך עיר",
    title: "10 דברים לעשות בחיפה במרחק הליכה מהמגדל",
    text: "מהטיילת ועד הקולינריה — כל מה ששווה לגלות מסביב.",
  },
  {
    tag: "רילוקיישן",
    title: "המדריך לרילוקיישן חלק לחיפה",
    text: "איך עוברים עיר בלי כאב ראש — צ׳ק־ליסט מלא לעובדים ולמשפחות.",
  },
  {
    tag: "טיפים",
    title: "למה מלון דירות עדיף על חדר מלון רגיל",
    text: "המרחב, החופש והמטבח שעושים את כל ההבדל בשהייה.",
  },
];

const CONTACT_DETAILS = [
  {
    label: "office@sea-tower.co.il",
    href: "mailto:office@sea-tower.co.il",
    dir: undefined,
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
    label: "04-6891689 · 055-9994880",
    href: "tel:04-6891689",
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
    label: "בניין אלמוג, דוד אלעזר 10, חיפה",
    href: undefined,
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

const FORM_FIELD =
  "h-[46px] w-full rounded-btn border border-field bg-[#f7fafc] px-3.5 text-[15px] text-[#14283d] placeholder:text-ink-muted";
const FORM_LABEL = "mb-[7px] block text-[13px] font-semibold text-ink-dim";

/* ---------- העמוד ---------- */

export default function Home() {
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,var(--color-navy-900)_0%,var(--color-ocean-700)_58%,var(--color-ocean-600)_100%)] pt-12 pb-28 text-white md:pt-[78px] md:pb-[150px]">
        <div className="st-bg" aria-hidden="true">
          <div className="st-orb st-orb-a right-[8%] -top-[60px] size-[320px] bg-[radial-gradient(circle,rgba(86,192,240,0.34),transparent_68%)]" />
          <div className="st-orb st-orb-b left-[14%] -bottom-10 size-[260px] bg-[radial-gradient(circle,rgba(58,155,214,0.28),transparent_70%)]" />
          <div className="st-orb st-orb-c left-[42%] top-[34%] size-[200px] bg-[radial-gradient(circle,rgba(124,208,247,0.22),transparent_72%)]" />
          <Bubbles items={HERO_BUBBLES} />
        </div>
        <div
          aria-hidden="true"
          className="stm-blob absolute -top-[120px] -left-20 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.35),transparent_68%)] blur-[10px]"
        />
        <div
          aria-hidden="true"
          className="stm-blob absolute -right-[60px] bottom-10 size-[300px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.18),transparent_70%)]"
        />
        <Container className="relative z-[2] flex flex-col items-center gap-12 lg:flex-row lg:gap-[52px]">
          <div className="w-full lg:flex-[1.05]">
            <div className="hero-in-1 mb-6 inline-flex items-center gap-[9px] rounded-full border border-white/18 bg-white/12 px-4 py-2 text-[13.5px] font-semibold tracking-[0.02em]">
              <span
                aria-hidden="true"
                className="size-[7px] rounded-full bg-spark shadow-[0_0_10px_var(--color-spark)]"
              />
              מלון דירות מול הים · 50 מ׳ מהחוף
            </div>
            {/* data-ws: מצב PLUS ברפרנס מפצל גם את ה-H1 למילים, בנוסף ל-heroIn */}
            <h1
              data-ws=""
              className="hero-in-2 mb-5 text-[40px]/[1.1] font-extrabold tracking-heading md:text-display"
            >
              לחיות מול הים,
              <br />
              <span className="bg-[linear-gradient(120deg,var(--color-aqua),var(--color-sea-400))] bg-clip-text text-transparent">
                ברמה מלונאית
              </span>
            </h1>
            <p className="hero-in-3 mb-8 max-w-[520px] text-lead text-[#cdddea]">
              דירות בוטיק וסוויטות מרווחות בבניין אלמוג, מגדלי חוף הכרמל — מאובזרות עד הפרט
              האחרון, עם חלון חזיתי לים התיכון. לנופש, לעסקים, לרילוקיישן ולכל תקופה.
            </p>
            <div className="hero-in-4 mb-9 flex flex-wrap items-center gap-3.5">
              <Button href="#contact">הזמינו עכשיו</Button>
              <Button href="#apartments" variant="outline" surface="dark">
                צפו בדירות
              </Button>
            </div>
            <div className="hero-in-5 flex items-center gap-2.5">
              <Stars size={18} />
              <span className="text-[15px] font-semibold text-[#e6f0f7]">
                4.8 · מאות אורחים מרוצים
              </span>
            </div>
          </div>
          <div className="hero-img-in relative w-full lg:flex-[0.95]">
            <Image
              src="/images/hero-terrace.jpg"
              alt="מרפסת פנטהאוז מול מפרץ חיפה בשעת שקיעה"
              width={1376}
              height={768}
              priority
              data-parallax=""
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="h-[280px] w-full rounded-img object-cover shadow-[0_30px_60px_rgba(0,0,0,0.4)] md:h-[460px]"
            />
            <div className="absolute -bottom-6 right-4 animate-float rounded-card bg-white px-5 py-4 shadow-e4 md:-right-5">
              <div className="text-[26px] leading-none font-extrabold text-navy-800 md:text-[30px]">
                {/* ספירה 0→50 ב-CSS (cnt50); "50" סטטי ל-reduced-motion דרך ה-media query */}
                <span className="cnt50" aria-label="50" /> <span className="text-base">מ׳</span>
              </div>
              <div className="mt-1 text-[13px] font-semibold text-ink-dim">מקו המים והטיילת</div>
            </div>
            <div className="absolute -top-5 left-4 animate-float-sm rounded-tile border border-white/25 bg-white/14 px-4 py-3 backdrop-blur-[6px] md:-left-4">
              <div className="flex items-center gap-[7px] text-[13px] font-semibold text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M3 13c3 0 3-2 6-2s3 2 6 2 3-2 6-2"
                    stroke="var(--color-aqua)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3 18c3 0 3-2 6-2s3 2 6 2 3-2 6-2"
                    stroke="var(--color-aqua)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                נוף חזיתי לים
              </div>
            </div>
          </div>
        </Container>
        <WaveSeparator position="bottom" fill="var(--color-cloud)" />
      </section>

      {/* אודות */}
      <section id="about" className="bg-cloud py-14 md:py-[74px]">
        <Container className="flex flex-col items-center gap-12 lg:flex-row lg:gap-14">
          <div className="relative w-full lg:flex-1">
            <Image
              src="/images/living-room.jpg"
              alt="סלון מעוצב עם ספה כחולה ונוף לים"
              width={1024}
              height={1024}
              data-rev="media"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="h-[300px] w-full rounded-card-lg object-cover md:h-[420px]"
            />
            <div className="absolute -bottom-7 left-2 flex size-32 flex-col items-center justify-center rounded-full bg-white text-center shadow-e3 md:-left-5">
              <div className="text-[30px] leading-none font-extrabold text-navy-800">5★</div>
              <div className="mt-0.5 text-[11px] font-semibold text-ink-dim">רמה מלונאית</div>
            </div>
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
            <div className="mt-8 grid grid-cols-2 gap-4">
              <StatCard rev countUp value="34–110" label="מ״ר לכל דירה" />
              <StatCard rev countUp value="14+" label="דירות וסוויטות" />
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
            {SOLUTIONS.map((sol) => (
              <div
                key={sol.num}
                className={`sol-card flex flex-col-reverse overflow-hidden rounded-[26px] border border-[#ecf1f6] bg-white shadow-[0_28px_60px_-26px_rgba(14,37,64,0.36)] lg:sticky lg:min-h-[336px] lg:flex-row ${sol.sticky}`}
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
                    {sol.text}
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

      {/* הדירות שלנו */}
      <section id="apartments" className="bg-cloud py-14 md:py-20">
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SectionHeading ws kicker="הדירות שלנו" title="סוויטות נבחרות מול הים" />
            <Button href="#contact" variant="link">
              לכל הדירות
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {APARTMENTS.map((apt) => (
              <article
                key={apt.title}
                data-rev="card"
                className="stm-card overflow-hidden rounded-card-lg bg-white shadow-e2"
              >
                <div className="relative">
                  <Image
                    src={apt.img.src}
                    alt={apt.img.alt}
                    width={800}
                    height={440}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="stm-zoom h-[220px] w-full object-cover"
                  />
                  <ImageBadge variant={apt.badge.variant} className="absolute top-3.5 right-3.5">
                    {apt.badge.label}
                  </ImageBadge>
                </div>
                <div className="p-6">
                  <h3 className="mb-3 text-h4 text-navy-800">{apt.title}</h3>
                  <div className="mb-3.5 flex flex-wrap gap-2">
                    {apt.chips.map((c) => (
                      <Chip key={c}>{c}</Chip>
                    ))}
                  </div>
                  <p className="mb-4 text-[14.5px] leading-[1.6] text-ink-dim">{apt.text}</p>
                  <Button href="#contact" variant="link">
                    לפרטים והזמנה
                  </Button>
                </div>
              </article>
            ))}
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
              src="/images/bedroom-classic.jpg"
              alt="חדר שינה קלאסי עם דלתות למרפסת ונוף לים"
              width={928}
              height={1152}
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

      {/* אורחים מספרים */}
      <Testimonials />

      {/* מרקיזת ארגונים */}
      <section className="overflow-hidden border-y border-line bg-white py-10">
        <div className="mb-6 text-center text-[12.5px] font-bold tracking-overline text-ink-muted">
          מארחים את צוותי הארגונים המובילים בצפון
        </div>
        <div className="mqq relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_11%,#000_89%,transparent)]">
          <div dir="ltr" className="mqq-track flex w-max animate-marquee">
            {[0, 1].map((set) => (
              <div
                key={set}
                aria-hidden={set === 1}
                className="mqq-set flex items-center gap-[74px] pr-[74px]"
              >
                {ORGS.map((org) => (
                  <span
                    key={org}
                    className="text-xl font-extrabold whitespace-nowrap text-[#33506e] opacity-50"
                  >
                    {org}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* בלוג */}
      <section id="blog" className="bg-white py-14 md:py-20">
        <Container>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <SectionHeading ws kicker="מאמרים ותובנות" title="מהבלוג של מגדל הים" />
            <Button href="#blog" variant="link">
              לכל המאמרים
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.title}
                data-rev="card"
                className="stm-card overflow-hidden rounded-card border border-line bg-white"
              >
                {/* תמונות הבלוג חסרות בנכסי הרפרנס — משטח placeholder עד שיסופקו.
                    stm-zoom: אותה תגובת hover שהמנוע ברפרנס נותן למדיה של הכרטיס */}
                <div className="overflow-hidden">
                  <div aria-hidden="true" className="stm-zoom h-[190px] w-full bg-[#dfe9f1]" />
                </div>
                <div className="p-6">
                  <span className="text-[12.5px] font-bold tracking-[0.03em] text-kicker">
                    {post.tag}
                  </span>
                  <h3 className="mt-2.5 mb-2 text-[18.5px]/[1.35] font-bold text-navy-800">
                    {post.title}
                  </h3>
                  <p className="text-sm leading-[1.55] text-ink-dim">{post.text}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* צור קשר */}
      <section
        id="contact"
        className="relative overflow-hidden bg-[linear-gradient(120deg,var(--color-navy-900),var(--color-ocean-700)_70%,var(--color-ocean-600))] py-28 md:py-[150px]"
      >
        <WaveSeparator position="top2" fill="#fff" className="z-[3]" />
        <div
          aria-hidden="true"
          className="stm-blob absolute -top-[90px] -left-[50px] size-[340px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.25),transparent_70%)]"
        />
        <div className="st-bg" aria-hidden="true">
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
            {/* ponytail: אין עדיין backend לטופס — שליחה תחובר ל-Supabase בשלב הבא */}
            <form action="#contact" className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-3.5 sm:flex-row">
                <div className="flex-1">
                  <label htmlFor="lf-name" className={FORM_LABEL}>
                    שם מלא
                  </label>
                  <input
                    id="lf-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="השם שלכם"
                    className={FORM_FIELD}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="lf-phone" className={FORM_LABEL}>
                    טלפון
                  </label>
                  <input
                    id="lf-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="050-0000000"
                    className={FORM_FIELD}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lf-email" className={FORM_LABEL}>
                  אימייל
                </label>
                <input
                  id="lf-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@email.com"
                  className={FORM_FIELD}
                />
              </div>
              <div className="flex flex-col gap-3.5 sm:flex-row">
                <div className="flex-1">
                  <label htmlFor="lf-dates" className={FORM_LABEL}>
                    תאריכים
                  </label>
                  <input
                    id="lf-dates"
                    name="dates"
                    type="text"
                    placeholder="הגעה — עזיבה"
                    className={FORM_FIELD}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="lf-guests" className={FORM_LABEL}>
                    מספר אורחים
                  </label>
                  <input
                    id="lf-guests"
                    name="guests"
                    type="text"
                    placeholder="2 מבוגרים"
                    className={FORM_FIELD}
                  />
                </div>
              </div>
              <Button type="submit" className="mt-1.5 w-full">
                שלחו פנייה
              </Button>
            </form>
          </div>
        </Container>
        {/* גל הפתיחה של הפוטר מגיע מה-Footer המשותף (חופף לריפוד התחתון כאן) */}
      </section>
    </>
  );
}
