import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui/PageIntro";
import { MotionEngine } from "@/components/site/MotionEngine";
import { pageMeta, buildBreadcrumbLd } from "@/lib/seo";
import { BUSINESS } from "@/lib/business";
import { HOUSE_RULES, HrIcon } from "./house-rules-data";

/* עמוד חוקי הבית — מסמך שקט; תוכן סטטי מונע-נתונים. השלד (TOC דביק +
   גיליון tk-*) משותף עם /terms ו-/faq. */

export const metadata: Metadata = pageMeta({
  title: "חוקי הבית | מגדל הים",
  description:
    "תנאי אירוח והוראות שימוש בדירה במגדל הים — אורחים ומסיבות, עישון וניקיון, ציוד וטקסטיל, שעות מנוחה, פינוי הנכס ואחריות לנזקים ופיקדון. כדי שכולם ייהנו משהות נעימה ובטוחה.",
  path: "/house-rules",
});

/* ה-TOC נגזר מהנתונים עצמם — לא רשימה ידנית שמתיישנת (SEO-AUDIT A16) */
const TOC = HOUSE_RULES.map((sec) => ({ id: sec.id, label: sec.title }));

export default function HouseRules() {
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
              { name: "חוקי הבית", path: "/house-rules" },
            ])
          ),
        }}
      />
      <MotionEngine />

      <PageIntro
        crumbs={[{ name: "ראשי", href: "/" }, { name: "חוקי הבית" }]}
        kicker="מסמכי האירוח"
        title="חוקי הבית"
        lead="תנאי אירוח והוראות שימוש בדירה — כדי שכולם ייהנו משהות נעימה ובטוחה. אנא הקפידו על הכללים הבאים לאורך כל שהותכם בנכס."
      />

      {/* מקטע החוקים — TOC דביק + גיליון מסמך.
          ריפוד תחתון = 84px (מרווח הרפרנס) + גובה גל הפוטר המשותף (70/120px) */}
      <section className="bg-white px-5 pt-[54px] pb-[154px] sm:px-8 md:pb-[204px] lg:px-14">
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

          <div className="hr tk-pad" data-rev="card">
            {HOUSE_RULES.map((sec, si) => (
              <div key={sec.id} id={sec.id} className="tk-sec">
                <h2 className="tk-h">
                  {/* aria-hidden: אחרת השם הנגיש נקרא כאסימון אחד ("2הגעה, קבלה ועזיבה") */}
                  <span className="tk-num" aria-hidden="true">{si + 1}</span>
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
              מול הים. תנאי ההזמנה והביטול המלאים מפורטים ב
              <Link className="stm-link font-semibold text-ocean-400" href="/terms">
                תקנון האתר
              </Link>
              .
              <br />
              <strong>לכל שאלה:</strong>{" "}
              <a className="stm-link" href={`mailto:${BUSINESS.email}`} dir="ltr">
                {BUSINESS.email}
              </a>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <strong>טלפון:</strong>{" "}
              <a className="stm-link" href={BUSINESS.phones.office.tel} dir="ltr">
                {BUSINESS.phones.office.label}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
