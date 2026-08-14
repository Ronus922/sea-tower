import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui/PageIntro";
import { MotionEngine } from "@/components/site/MotionEngine";
import { FaqEnhancer } from "@/components/site/FaqEnhancer";
import { pageMeta, buildBreadcrumbLd } from "@/lib/seo";
import { BUSINESS } from "@/lib/business";
import { FAQ_CATEGORIES, FaqAnswer, FaqPlusIcon, buildFaqJsonLd } from "./faq-data";

/* עמוד שאלות ותשובות — פתיח מסמך שקט + שלד ה-TOC המשותף עם /terms.
   האינטראקציה (אקורדיון details נייטיבי, חיפוש חי, singleOpen) ב-FaqEnhancer. */

export const metadata: Metadata = pageMeta({
  title: "שאלות ותשובות | מגדל הים",
  description:
    "כל מה שחשוב לדעת לפני ההגעה למגדל הים — צ׳ק-אין ושעות קבלה, חניה, בריכה, ציוד הדירות, שירותי אירוח, תשלומים וביטולים. חיפוש חכם בכל השאלות הנפוצות.",
  path: "/faq",
});

/* ה-TOC נגזר מהקטגוריות עצמן — לא רשימה ידנית שמתיישנת (SEO-AUDIT A16) */
const TOC = FAQ_CATEGORIES.map((cat) => ({ id: cat.id, label: cat.title }));

export default function Faq() {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbLd([
              { name: "ראשי", path: "/" },
              { name: "שאלות נפוצות", path: "/faq" },
            ])
          ),
        }}
      />
      <MotionEngine />
      <FaqEnhancer />

      <PageIntro
        crumbs={[{ name: "ראשי", href: "/" }, { name: "שאלות נפוצות" }]}
        kicker="מדריך האירוח"
        title="שאלות ותשובות"
        lead="כל מה שחשוב לדעת לפני ההגעה — השירותים שאנחנו מספקים, ההבדל בין בית מלון למלון דירות, ומה מחכה לכם באזור. לא מצאתם תשובה? נשמח שתעדכנו אותנו ונדאג להנגיש אותה לכולם."
      >
        <div className="mt-8 max-w-[560px]">
          <div className="faq-search-wrap">
            <svg
              className="faq-search-ic"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" stroke="#7d97ac" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="#7d97ac" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              id="faq-search"
              type="text"
              aria-label="חיפוש בשאלות ותשובות"
              placeholder="חיפוש בשאלות… למשל: חניה, בריכה, צ׳ק אין"
              className="faq-search"
            />
            <button id="faq-clear" type="button" aria-label="ניקוי החיפוש" className="faq-clear" hidden>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="#5d7184"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div id="faq-count" className="faq-count" role="status" aria-live="polite" hidden />
        </div>
      </PageIntro>

      {/* מקטע השאלות — TOC דביק + מסמך.
          ריפוד תחתון = 84px (מרווח הרפרנס) + גובה גל הפוטר המשותף (70/120px) */}
      <section className="bg-white px-5 pt-[54px] pb-[154px] sm:px-8 md:pb-[204px] lg:px-14">
        <div className="tk-grid">
          <aside className="tk-toc">
            <nav aria-label="קטגוריות">
              <div className="tk-toc-title">קטגוריות</div>
              <ol>
                {TOC.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.label}</a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="tk-toc-help">
              <div className="tk-toc-help-title">לא מצאתם תשובה?</div>
              <Link href="/contact">צרו איתנו קשר ›</Link>
            </div>
          </aside>

          <div className="tk-pad" data-rev="card">
            {FAQ_CATEGORIES.map((cat, ci) => (
              <div key={cat.id} id={cat.id} className="tk-sec faq-sec">
                <h2 className="tk-h">
                  {/* aria-hidden: אחרת השם הנגיש נקרא כאסימון אחד ("1כללי — על המקום") */}
                  <span className="tk-num" aria-hidden="true">{ci + 1}</span>
                  {cat.title}
                </h2>
                {cat.items.map((item) => (
                  <details key={item.q} className="faq-item">
                    <summary>
                      {item.q}
                      <FaqPlusIcon />
                    </summary>
                    <div className="faq-a">
                      <FaqAnswer blocks={item.a} />
                    </div>
                  </details>
                ))}
              </div>
            ))}

            <div className="faq-empty" hidden>
              <div className="faq-empty-title">לא נמצאו תוצאות</div>
              <div>
                נסו מילת חיפוש אחרת, או{" "}
                <Link href="/contact">שאלו אותנו ישירות ›</Link>
              </div>
            </div>

            <div className="tk-info">
              <strong>חסרה לכם תשובה?</strong> נשמח שתעדכנו אותנו ונדאג להנגיש אותה לכולם.
              <br />
              <strong>אימייל:</strong>{" "}
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
