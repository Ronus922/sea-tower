import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading, SectionKicker } from "@/components/ui/SectionHeading";
import { StatCard } from "@/components/ui/StatCard";
import { PageIntro } from "@/components/ui/PageIntro";
import { MotionEngine } from "@/components/site/MotionEngine";
import { pageMeta, buildBreadcrumbLd, buildWebPageLd } from "@/lib/seo";

/* עמוד אודות — גרסה אדיטוריאלית: הצילום האווירי האמיתי של בניין אלמוג מוביל,
   הערכים והיתרונות הם רשימות מסמך עם קווי hairline (בלי כרטיסים ואריחים) */

const DESCRIPTION =
  "הסיפור של מגדל הים — מלון דירות בוטיק בבניין אלמוג, מגדלי חוף הכרמל בחיפה, 50 מטר מקו המים. אירוח שמרגיש כמו בית, ברמה של מלון: שירות אישי, נוף לים וזמינות 24/7.";

export const metadata: Metadata = pageMeta({
  title: "אודות — מגדל הים | מלון דירות בוטיק מול הים בחיפה",
  description: DESCRIPTION,
  path: "/about",
  /* הצילום האווירי האמיתי של הבניין — תמונת השיתוף הנכונה לעמוד הסיפור */
  image: {
    url: "/images/articles/furnished-apartments-haifa.jpg",
    alt: "מבט אווירי על בניין אלמוג וחוף הכרמל בחיפה",
  },
});

/* ---------- תוכן ---------- */

/* רק עובדות הניתנות לאימות מהקטלוג ומ-business.ts — הספירה "14+" הוסרה
   (סתרה את הספירה החיה מ-GuestHub); דירוג 4.8 הוסר עוד קודם */
const STATS = [
  { value: "50 מ׳", label: "מקו המים והטיילת" },
  { value: "34–110", label: "מ״ר לכל דירה" },
  { value: "24/7", label: "שירות וזמינות" },
];

const VALUES = [
  {
    title: "מיקום ללא פשרות",
    text: "מול הים, צעדים מהטיילת והמסעדות, ובלב נגישות לכל חיפה.",
  },
  {
    title: "רמה מלונאית",
    text: "מצעים ומגבות 5 כוכבים, מטבח מאובזר, נספרסו וואי־פיי מהיר.",
  },
  {
    title: "שירות אישי",
    text: "צ׳ק־אין חלק, זמינות לאורך כל השהייה ויחס אנושי לכל בקשה.",
  },
  {
    title: "פשטות וגמישות",
    text: "הזמנה מהירה, אישור מיידי, ללא בירוקרטיה — לכל תקופה.",
  },
];

/* שמות ארגונים לא-מאומתים הוסרו (SEO-AUDIT A14) — נשארו עובדות על האירוח עצמו */
const WHY_FEATURES = [
  {
    title: "מיקום פריים לוקיישן",
    text: "50 מ׳ מהים, דקות מהטיילת, מסעדות, כביש 2/4, רכבת חוף הכרמל ומת״ם.",
  },
  {
    title: "נוף עוצר נשימה",
    text: "חלון חזיתי הפונה אל הים התיכון בכל אחת מהדירות — שקיעות בכל ערב.",
  },
  {
    title: "אירוח לכל מטרה",
    text: "משפחות בחופשה, אנשי מקצוע בתקופות עבודה וזוגות שמחפשים מנוחה — לשהיות קצרות וארוכות.",
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
      {/* AboutPage — ה-builder היה קיים ולא היה בשימוש (SEO-AUDIT A8) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildWebPageLd({
              type: "AboutPage",
              name: "אודות מגדל הים",
              description: DESCRIPTION,
              path: "/about",
            })
          ),
        }}
      />
      <MotionEngine />

      <PageIntro
        crumbs={[{ name: "ראשי", href: "/" }, { name: "אודות" }]}
        kicker="הסיפור שלנו"
        title={
          <>
            הבית שלכם מול
            <br />
            הים התיכון
          </>
        }
        lead="מגדל הים הוא מלון דירות בוטיק בבניין אלמוג, מגדלי חוף הכרמל — מקום שבו אדריכלות, נוף ושירות אישי נפגשים, 50 מטר בלבד מקו המים."
      />

      {/* הסיפור — הצילום האווירי האמיתי של הבניין מול הטקסט + נתונים חשופים */}
      <section className="bg-white py-14 md:py-24">
        <Container className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-20">
          <div className="w-full lg:flex-1">
            <Image
              src="/images/articles/furnished-apartments-haifa.jpg"
              alt="מבט אווירי על בניין אלמוג ומגדלי חוף הכרמל, על קו החוף של חיפה"
              width={768}
              height={574}
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="w-full object-cover"
            />
            <p className="ed-hairline mt-3 pt-3 text-[13px] font-semibold text-ink-dim">
              בניין אלמוג, מגדלי חוף הכרמל — הכניסה הדרומית לחיפה, על קו המים
            </p>
          </div>
          <div className="w-full lg:flex-[1.15]">
            <SectionKicker className="mb-4">אירוח שמרגיש כמו בית</SectionKicker>
            <h2 className="ed-h2 mb-6 text-navy-800">אירוח שמרגיש כמו בית, ברמה של מלון</h2>
            <p data-rev="up" className="mb-4 max-w-[62ch] text-[17px] leading-[1.8] text-ink">
              מגדל הים נולד מתוך אהבה לחיפה ולים התיכון, ומתוך הרצון לתת לאורחים חוויה שונה
              מחדר מלון רגיל — מרחב פרטי, מרווח ומאובזר, עם כל הנוחות של בית אמיתי וכל הפינוק
              של אירוח מלונאי.
            </p>
            <p data-rev="up" className="mb-10 max-w-[62ch] text-[17px] leading-[1.8] text-ink">
              אנחנו מארחים משפחות בחופשה, אנשי מקצוע בתקופות עבודה וזוגות שמחפשים מנוחה מול
              הים. כל דירה מעוצבת בקפידה, מאובזרת עד הפרט האחרון, ומנוהלת באכפתיות ובשירות
              אישי לאורך כל השהייה.
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3">
              {STATS.map((s) => (
                <StatCard key={s.label} rev value={s.value} label={s.label} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* הערכים — רשימת מסמך בשתי עמודות, בלי כרטיסים */}
      <section className="bg-paper py-14 md:py-24">
        <Container>
          <SectionHeading
            kicker="הערכים שלנו"
            title="מה שמנחה אותנו"
            lead="ארבעה עקרונות שמלווים כל אירוח, מהפנייה הראשונה ועד הצ׳ק־אאוט"
            className="mb-12"
          />
          <div className="grid gap-x-16 lg:grid-cols-2">
            {VALUES.map((v, i) => (
              <div key={v.title} data-rev="up" className="ed-row">
                <span aria-hidden="true" className="ed-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="ed-h3 text-navy-800">{v.title}</h3>
                  <p className="mt-1 text-[15px] leading-[1.6] text-ink-dim">{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* למה לבחור בנו — מקטע כהה שקט */}
      <section className="bg-navy-900 py-14 text-white md:py-24">
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
            <div className="on-dark mt-8">
              {WHY_FEATURES.map((f) => (
                <div key={f.title} data-rev="up" className="ed-row flex-col gap-1.5 sm:flex-row sm:gap-5">
                  <h3 className="ed-h3 min-w-[200px] text-white">{f.title}</h3>
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
            <p className="mt-3 border-t border-white/20 pt-3 text-[13px] font-semibold text-on-navy">
              הכול כלול — חשבונות, ניקיון, נטפליקס ושירות אישי
            </p>
          </div>
        </Container>
      </section>

      {/* CTA — פס שקט על נייר; מפנה לעמודים הקנוניים (לא לעוגני הבית) */}
      <section className="ed-wave-clear bg-paper pt-14 md:pt-24">
        <Container className="flex flex-wrap items-center justify-between gap-10">
          <div className="min-w-[280px] flex-1">
            <h2 className="ed-h2 text-navy-800">מוכנים לגלות את מגדל הים?</h2>
            <p data-rev="up" className="mt-4 max-w-[460px] text-[17px] leading-[1.6] text-ink">
              השאירו פרטים ונחזור אליכם עם הצעה אישית לדירה המושלמת — לנופש, לעסקים או
              לתקופה ארוכה.
            </p>
          </div>
          <div data-rev="sm" className="flex flex-wrap items-center gap-4">
            <Button href="/contact">צרו קשר</Button>
            <Button href="/rooms" variant="outline" className="px-6">
              לדירות והסוויטות
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
