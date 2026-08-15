import { preload } from "react-dom";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { MotionEngine } from "@/components/site/MotionEngine";
import { SplitWords } from "@/components/ui/SplitWords";
import { Bubbles, type Bubble } from "@/components/site/Bubbles";
import { HomeSections } from "@/components/site/home/HomeSections";
import { buildSiteJsonLd } from "@/lib/seo";
import { BUSINESS } from "@/lib/business";

/* עמוד הבית — נבנה לפי design-reference (Home.html / Home.png).
   כל המקטעים שאחרי ה-hero חולצו ל-HomeSections (משותפים עם טיוטת /aerial) */

/* ---------- רקע "גלי הים": בועות ה-hero ---------- */

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

/* ---------- העמוד ---------- */

/* כותרת/תיאור/OG יורשים מתבנית השורש; הקנוניקל מוצהר כאן כדי שעמוד ה-404
   (שמרונדר בתבנית השורש) לא יירש קנוניקל שמצביע על הבית (SEO-AUDIT A5) */
export const metadata = { alternates: { canonical: "/" } };

/* קטלוג החדרים נמשך מ-GuestHub ומתרענן כל 5 דקות (ISR) — שאר העמוד סטטי */
export const revalidate = 300;

export default function Home() {
  /* הפוסטר של וידאו ה-hero הוא ה-LCP של עמוד הבית; preload=metadata על
     הווידאו לא מקדים אותו, ולכן מכריזים עליו מפורשות */
  preload("/videos/hero-sea-poster.jpg", { as: "image", fetchPriority: "high" });

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
            {/* מצב PLUS ברפרנס: פיצול מילים בנוסף ל-heroIn — מפוצל בשרת
                (SplitWords) כך ששתי האנימציות יוצאות יחד ב-paint הראשון */}
            <h1 className="hero-in-2 stm-ws-auto mb-5 text-[40px]/[1.1] font-extrabold tracking-heading md:text-display">
              <SplitWords>
                לחיות מול הים,
                <br />
                <span className="bg-[linear-gradient(120deg,var(--color-aqua),var(--color-sea-400))] bg-clip-text text-transparent">
                  ברמה מלונאית
                </span>
              </SplitWords>
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
            {/* דירוג 4.8 הוסר יחד עם מקטע חוות הדעת: אין מקור ביקורות שניתן
                לאמת. במקומו — עובדות מאומתות מתוך business.ts */}
            <div className="hero-in-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[15px] font-semibold text-[#e6f0f7]">
              <span>בניין אלמוג, חוף הכרמל בחיפה</span>
              <span aria-hidden="true" className="text-[#7fa8c6]">
                ·
              </span>
              <span>{BUSINESS.hours}</span>
            </div>
          </div>
          <div className="hero-img-in relative w-full lg:flex-[0.95]">
            <video
              src="/videos/hero-sea.mp4"
              poster="/videos/hero-sea-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="נוף לים התיכון ממגדלי חוף הכרמל"
              data-parallax=""
              className="h-[280px] w-full rounded-img object-cover shadow-[0_30px_60px_rgba(0,0,0,0.4)] md:h-[460px]"
            />
            <div className="absolute -bottom-6 right-4 animate-float rounded-card bg-white px-5 py-4 shadow-e4 md:-right-5">
              <div className="text-[26px] leading-none font-extrabold text-navy-800 md:text-[30px]">
                {/* ספירה 0→50 ב-CSS (cnt50); "50" סטטי ל-reduced-motion דרך ה-media query */}
                {/* role=img: aria-label אסור על span חסר role, והמספר עצמו
                    נוצר ב-CSS (::after) ולכן אין לו טקסט אמיתי לחשוף */}
                <span className="cnt50" role="img" aria-label="50" />{" "}
                <span className="text-base">מ׳</span>
              </div>
              <div className="mt-1 text-[13px] font-semibold text-ink-dim">מקו המים והטיילת</div>
            </div>
            <div className="absolute -top-5 left-4 animate-float-sm rounded-tile border border-white/20 bg-navy-900/60 px-4 py-3 shadow-e3 backdrop-blur-[6px] md:-left-4">
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

      {/* כל שאר מקטעי הבית — קומפוננטה משותפת עם טיוטת /aerial */}
      <HomeSections />
    </>
  );
}
