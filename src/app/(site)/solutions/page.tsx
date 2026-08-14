import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageIntro } from "@/components/ui/PageIntro";
import { MotionEngine } from "@/components/site/MotionEngine";
import { VISIBLE_SOLUTIONS } from "@/data/solutions";
import { pageMeta, buildBreadcrumbLd, buildWebPageLd } from "@/lib/seo";

/* עמוד פתרונות — שורות אדיטוריאליות מתחלפות. הנתונים מגיעים ממקור האמת
   המשותף data/solutions.tsx (קודם היו משוכפלים כאן ובעמוד הבית) */

const DESCRIPTION =
  "פתרון אירוח לכל צורך במגדל הים: נופש מול הים, אירוח לעסקים, רילוקיישן והשכרה לטווח קצר — דירות בוטיק 50 מ׳ מהטיילת בחיפה, ללא בירוקרטיה.";

export const metadata: Metadata = pageMeta({
  title: "פתרונות אירוח — מגדל הים | דירות בוטיק מול הים בחיפה",
  description: DESCRIPTION,
  path: "/solutions",
  image: {
    url: "/images/vacation-sea-view.jpg",
    alt: "זוג מטייל על חוף הים בשקיעה מול בניין אלמוג בחיפה",
  },
});

const STEPS = [
  {
    title: "בוחרים פתרון",
    text: "מספרים לנו מה אתם מחפשים — ונתאים לכם את הדירה והפתרון המדויקים.",
  },
  {
    title: "מאשרים מהר",
    text: "הצעה אישית ואישור מיידי, ללא בירוקרטיה והתחייבות — תוך דקות.",
  },
  {
    title: "נכנסים ונהנים",
    text: "צ׳ק־אין חלק, הדירה מוכנה ומאובזרת — ואתם מול הים התיכון.",
  },
];

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildWebPageLd({
              name: "פתרונות אירוח — מגדל הים",
              description: DESCRIPTION,
              path: "/solutions",
            })
          ),
        }}
      />
      <MotionEngine />

      <PageIntro
        crumbs={[{ name: "ראשי", href: "/" }, { name: "פתרונות" }]}
        kicker="הפתרונות שלנו"
        title={
          <>
            פתרון אירוח
            <br />
            לכל צורך
          </>
        }
        lead="דירה אחת, אינסוף סיבות להגיע. בין אם לנופש קצר, לתקופת עבודה ממושכת או למעבר עיר — נתאים לכם בדיוק את מה שצריך, ללא בירוקרטיה."
      >
        <div className="mt-8 flex flex-wrap gap-x-7 gap-y-2">
          {VISIBLE_SOLUTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="stm-link inline-flex min-h-11 items-center gap-2 py-2 text-[14.5px] font-bold text-kicker"
            >
              <span aria-hidden="true" className="font-serif text-sand">
                {s.num}
              </span>
              {s.pill ?? s.title}
            </a>
          ))}
        </div>
      </PageIntro>

      {/* הפתרונות — שורות אדיטוריאליות מתחלפות: צילום גדול, ספרה סריפית,
          רשימת יתרונות עם קווי hairline (בלי כרטיסים, בלי אריחי אייקון) */}
      <section className="bg-white pt-16 pb-10 md:pt-24 md:pb-14">
        <Container className="flex flex-col gap-20 md:gap-28">
          {VISIBLE_SOLUTIONS.map((s, i) => (
            <div
              id={s.id}
              key={s.id}
              className={
                "group flex scroll-mt-24 flex-col gap-8 lg:items-center lg:gap-16 " +
                (i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row")
              }
            >
              <div className="w-full overflow-hidden lg:flex-[1.15]">
                <Image
                  src={s.img.src}
                  alt={s.img.alt}
                  width={s.img.width}
                  height={s.img.height}
                  data-rev="media"
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="h-[280px] w-full object-cover transition-transform duration-[1200ms] ease-pop group-hover:scale-[1.02] md:h-[460px]"
                />
              </div>
              <div className="w-full lg:flex-1">
                <span
                  aria-hidden="true"
                  className="font-serif text-[52px] leading-none font-medium text-sand"
                >
                  {s.num}
                </span>
                <h2 className="ed-h2 mt-3 text-navy-800">{s.title}</h2>
                <p data-rev="up" className="mt-4 max-w-[52ch] text-body">
                  {s.text}
                </p>
                <ul data-rev="up" className="mt-7 max-w-[440px]">
                  {s.checks.map((c) => (
                    <li key={c} className="ed-row py-3 text-[15px] font-medium text-ink-strong">
                      {c}
                    </li>
                  ))}
                </ul>
                <div data-rev="sm" className="mt-6">
                  <Button href="/contact" variant="link">
                    לפרטים והזמנה
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* שלושה צעדים — רשימה ממוספרת על נייר, בלי כרטיסים */}
      <section className="bg-paper py-16 md:py-24">
        <Container className="lg:grid lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <SectionHeading
            kicker="פשוט להתארח"
            title={
              <>
                שלושה צעדים
                <br />
                עד הים
              </>
            }
            className="mb-10 lg:mb-0"
          />
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

      {/* CTA — פס כהה full-bleed (לא קופסה מעוגלת); מפנה לעמודים הקנוניים */}
      <section className="ed-wave-clear bg-navy-900 pt-16 md:pt-24">
        <Container className="flex flex-wrap items-center justify-between gap-10">
          <div className="min-w-[280px] flex-1">
            <h2 className="ed-h2 text-white">לא בטוחים איזה פתרון מתאים לכם?</h2>
            <p data-rev="up" className="mt-4 max-w-[460px] text-[17px] leading-[1.6] text-[#bcd4e6]">
              ספרו לנו על הצרכים שלכם ונמצא יחד את הדירה והפתרון המושלמים — לכל תקופה ולכל
              מטרה.
            </p>
          </div>
          <div data-rev="sm" className="flex flex-wrap items-center gap-4">
            <Button href="/contact" surface="dark">
              דברו איתנו
            </Button>
            <Button href="/rooms" variant="outline" surface="dark" className="px-6">
              לדירות והסוויטות
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
