import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { MotionEngine } from "@/components/site/MotionEngine";
import { FaqEnhancer } from "@/components/site/FaqEnhancer";
import { pageMeta, buildBreadcrumbLd } from "@/lib/seo";
import { FAQ_CATEGORIES, FaqAnswer, FaqPlusIcon, buildFaqJsonLd } from "./faq-data";

/* עמוד שאלות ותשובות — נבנה 1:1 לפי design-reference/exports/Faq.html.
   גופן Open Sans גלובלי (‎--font-sans‎). השלד (Hero + גל + כרטיס מסמך + TOC
   דביק) והתנועה (חשיפת Hero + כרטיס כיחידה + זוהר נושם) משותפים עם /terms;
   האינטראקציה (אקורדיון details נייטיבי, חיפוש חי, singleOpen) ב-FaqEnhancer. */

export const metadata: Metadata = pageMeta({
  title: "שאלות ותשובות | מגדל הים",
  description:
    "כל מה שחשוב לדעת לפני ההגעה למגדל הים — צ׳ק-אין ושעות קבלה, חניה, בריכה, ציוד הדירות, שירותי אירוח, תשלומים וביטולים. חיפוש חכם בכל השאלות הנפוצות.",
  path: "/faq",
});

const TOC = [
  { id: "c1", label: "כללי — על המקום" },
  { id: "c2", label: "הגעה, קבלה ועזיבה" },
  { id: "c3", label: "הדירות והציוד" },
  { id: "c4", label: "שירותים ואירוח" },
  { id: "c5", label: "תשלומים, ביטולים וחשבוניות" },
];

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

      {/* Hero — גרדיאנט אלכסוני, זוהר כחול, פירורי לחם, כותרת, פסקה, שדה חיפוש וגל תחתון */}
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,var(--color-navy-900)_0%,var(--color-ocean-700)_58%,var(--color-ocean-600)_100%)] pt-16 pb-[120px] text-center text-white md:pb-[150px]">
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
              שאלות נפוצות
            </span>
          </nav>
          <h1
            data-rev="up"
            className="mb-[18px] text-[38px]/[1.08] font-extrabold tracking-[-0.01em] md:text-[54px]/[1.08]"
          >
            שאלות ותשובות
          </h1>
          <p
            data-rev="up"
            className="mx-auto mb-[34px] max-w-[680px] text-[17px]/[1.66] font-light text-[#cdddea] md:text-[18px]/[1.66]"
          >
            כל מה שחשוב לדעת לפני ההגעה — השירותים שאנחנו מספקים, ההבדל בין בית מלון למלון דירות, ומה
            מחכה לכם באזור. לא מצאתם תשובה? נשמח שתעדכנו אותנו ונדאג להנגיש אותה לכולם.
          </p>
          <div data-rev="up" className="faq-search-wrap">
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
        </Container>
        <WaveSeparator position="bottom" fill="var(--color-cloud)" />
      </section>

      {/* מקטע השאלות — רקע תכלת-אפרפר, TOC דביק + כרטיס תוכן.
          ריפוד תחתון = 84px (מרווח הרפרנס) + גובה גל הפוטר המשותף (70/120px) */}
      <section className="bg-cloud px-5 pt-[54px] pb-[154px] sm:px-8 md:pb-[204px] lg:px-14">
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
                  <span className="tk-num">{ci + 1}</span>
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
              <strong>אימייל:</strong> office@sea-tower.co.il&nbsp;&nbsp;·&nbsp;&nbsp;
              <strong>טלפון:</strong> 04-6891689
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
