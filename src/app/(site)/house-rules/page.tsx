import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { MotionEngine } from "@/components/site/MotionEngine";
import { HOUSE_RULES, HrIcon } from "./house-rules-data";

/* עמוד חוקי הבית — נבנה 1:1 לפי design-reference/exports/House-rules.html.
   Server component: תוכן סטטי מונע-נתונים; השלד (Hero + גל + TOC דביק + כרטיס)
   משותף עם /terms ו-/faq. */

export const metadata: Metadata = {
  title: "חוקי הבית | מגדל הים",
  description:
    "תנאי אירוח והוראות שימוש בדירה במגדל הים — אורחים ומסיבות, עישון וניקיון, ציוד וטקסטיל, שעות מנוחה, פינוי הנכס ואחריות לנזקים ופיקדון. כדי שכולם ייהנו משהות נעימה ובטוחה.",
};

const TOC = [
  { id: "h1", label: "כללי ואחריות" },
  { id: "h2", label: "אורחים, מסיבות ורעש" },
  { id: "h3", label: "עישון, ניקיון ושמירה על הנכס" },
  { id: "h4", label: "ציוד, טקסטיל וטלוויזיות" },
  { id: "h5", label: "יציאה ופינוי הנכס" },
  { id: "h6", label: "אחריות, נזקים ופיקדון" },
];

export default function HouseRules() {
  return (
    <>
      {/* שער חשיפות: רץ לפני ה-hydration כך שתוכן מסומן לא מהבהב לפני האנימציה */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('stm-js')",
        }}
      />
      <MotionEngine />

      {/* Hero — גרדיאנט אלכסוני, זוהר כחול, פירורי לחם, כותרת, פסקה וגל תחתון */}
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,var(--color-navy-900)_0%,var(--color-ocean-700)_58%,var(--color-ocean-600)_100%)] pt-16 pb-[110px] text-center text-white md:pb-[140px]">
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
            className="mb-6 inline-flex items-center gap-2 text-[13.5px] font-medium text-[#acc8dd]"
          >
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
              חוקי הבית
            </span>
          </nav>
          <h1
            data-ws=""
            className="mb-[18px] text-[38px]/[1.08] font-extrabold tracking-[-0.01em] md:text-[54px]/[1.08]"
          >
            חוקי הבית
          </h1>
          <p
            data-rev="up"
            className="mx-auto max-w-[660px] text-[17px]/[1.66] font-light text-[#cdddea] md:text-[18px]/[1.66]"
          >
            תנאי אירוח והוראות שימוש בדירה — כדי שכולם ייהנו משהות נעימה ובטוחה. אנא הקפידו על הכללים
            הבאים לאורך כל שהותכם בנכס.
          </p>
        </Container>
        <WaveSeparator position="bottom" fill="var(--color-cloud)" />
      </section>

      {/* מקטע החוקים — רקע תכלת-אפרפר, TOC דביק + כרטיס תוכן.
          ריפוד תחתון = 84px (מרווח הרפרנס) + גובה גל הפוטר המשותף (70/120px) */}
      <section className="bg-cloud px-5 pt-[54px] pb-[154px] sm:px-8 md:pb-[204px] lg:px-14">
        <div className="tk-grid">
          <aside className="tk-toc">
            <nav aria-label="בעמוד זה">
              <div className="tk-toc-title">בעמוד זה</div>
              <ol>
                {TOC.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.label}</a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="tk-toc-help">
              <div className="tk-toc-help-title">שאלות לפני ההגעה?</div>
              <Link href="/contact">צרו איתנו קשר ›</Link>
            </div>
          </aside>

          <div className="hr tk-pad">
            {HOUSE_RULES.map((sec, si) => (
              <div key={sec.id} id={sec.id} className="tk-sec">
                <h2 className="tk-h">
                  <span className="tk-num">{si + 1}</span>
                  {sec.title}
                </h2>

                {sec.kind === "rules" ? (
                  <div className="hr-list">
                    {sec.rules.map((rule, ri) => (
                      <div key={ri} className="hr-rule">
                        <span className={`hr-ic hr-${rule.icon}`} aria-hidden="true">
                          <HrIcon type={rule.icon} />
                        </span>
                        <p>{rule.c}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {sec.clauses.map((clause, ci) => (
                      <p key={ci} className="tk-clause">
                        {clause}
                      </p>
                    ))}
                    <div className="tk-warn">
                      <p>{sec.warn}</p>
                    </div>
                  </>
                )}
              </div>
            ))}

            <div className="tk-info">
              <strong>תודה על שיתוף הפעולה</strong> — שמירה על הכללים מאפשרת לכולם ליהנות משהות נעימה
              מול הים.
              <br />
              <strong>לכל שאלה:</strong> office@sea-tower.co.il&nbsp;&nbsp;·&nbsp;&nbsp;
              <strong>טלפון:</strong> 04-6891689
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
