import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { MotionEngine } from "@/components/site/MotionEngine";
import { pageMeta, buildBreadcrumbLd } from "@/lib/seo";
import { BUSINESS } from "@/lib/business";

/* עמוד הצהרת נגישות — שלד 1:1 עם /terms (Hero + גל + TOC דביק + כרטיס
   מסמך) ואותם פרימיטיבים מ-terms.css. מקטע 3 ("מה כבר הונגש") נבדק מול הקוד
   לפני שנכתב: כל פריט מצביע על מימוש אמיתי (root layout, (site)/layout,
   ContactForm/CheckoutWizard, MotionEngine, NagishLi ב-root layout). פריט
   שלא מתקיים בכל האתר (אזורי מגע 44px — שורת הקישורים המשפטיים בפוטר
   ותוכן העניינים קטנים מכך) הועבר למקטע 4. */

export const metadata: Metadata = pageMeta({
  title: "הצהרת נגישות | מגדל הים",
  description:
    "הצהרת הנגישות של אתר מגדל הים: התקן ורמת הנגישות, מה כבר הונגש באתר, מה נמצא בתהליך, נגישות המקום ופרטי אחראי הנגישות.",
  path: "/accessibility",
});

/* תאריך עדכון ההצהרה — ההצהרה מתארת את המצב בפועל נכון לתאריך זה; לעדכן
   בכל שינוי במקטעים 3–5 */
const UPDATED = "5 בספטמבר 2026";

const TOC = [
  { id: "a1", label: "המחויבות שלנו" },
  { id: "a2", label: "התקן ורמת הנגישות" },
  { id: "a3", label: "מה כבר הונגש באתר" },
  { id: "a4", label: "מה נמצא בתהליך" },
  { id: "a5", label: "נגישות המקום" },
  { id: "a6", label: "פנייה בנושא נגישות" },
];

/* מה כבר הונגש — כל שורה מגובה בקוד (ראו הערת הפתיחה) */
const DONE = [
  "שפת האתר עברית וכיוון הקריאה מימין לשמאל, כך שקוראי מסך מקריאים בסדר ובהגייה נכונים.",
  "קישור “דילוג לתוכן הראשי” בתחילת כל עמוד, נחשף בניווט מקלדת.",
  "מבנה סמנטי: אזורי ניווט, פירורי לחם ותוכן עניינים מסומנים בשמות מוקראים.",
  "גרפיקה דקורטיבית (גלים, זוהר, אייקונים) מוסתרת מקוראי מסך.",
  "כיבוד העדפת “תנועה מופחתת” של מערכת ההפעלה — אנימציות הגלילה והרקע מבוטלות.",
  "טפסים עם תוויות, הודעות שגיאה מקושרות לשדה וסימון aria-invalid.",
  "תפריט נגישות (נגיש לי) בכל עמוד: הגדלת טקסט, מצבי צבע וניגודיות, הדגשת קישורים, ניווט מקלדת.",
];

/* מה בתהליך — הפריט האחרון הועבר לכאן ממקטע 3 אחרי בדיקה בקוד */
const IN_PROGRESS = [
  "ניגודיות צבעים וקריאות טקסט בעמודי ההזמנה.",
  "בדיקה מלאה עם קוראי מסך (NVDA).",
  "התאמת לוח השנה בעמוד ההזמנה לניווט מקלדת.",
  "תיקוני אנימציה לתנועה מופחתת.",
  "הגדלת אזורי המגע ל-44 פיקסלים לפחות בכל הקישורים, כולל שורת הקישורים המשפטיים בתחתית העמוד ותוכן העניינים בעמודי המסמכים.",
];

export default function Accessibility() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbLd([
              { name: "ראשי", path: "/" },
              { name: "הצהרת נגישות", path: "/accessibility" },
            ])
          ),
        }}
      />
      {/* שער חשיפות: רץ לפני ה-hydration כך שתוכן מסומן לא מהבהב לפני האנימציה.
          רשת ביטחון של המנוע + no-JS (המחלקה לא נוספת) מבטיחים שהטקסט לעולם
          לא יישאר מוסתר */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('stm-js')",
        }}
      />
      <MotionEngine />

      {/* Hero — גרדיאנט אלכסוני, זוהר כחול עליון-שמאלי ותחתון-ימני, פירורי לחם,
          כותרת ופסקת פתיחה, וגל תחתון הנמזג לרקע הבהיר של המקטע הבא */}
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
            {/* min-h + margin שלילי: אזור מגע 44px בלי לשנות את הזרימה (Iron Rule #6) */}
            <Link
              href="/"
              className="stm-link -my-2 inline-flex min-h-11 items-center py-2 transition-colors hover:text-white"
            >
              ראשי
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="#acc8dd"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-semibold text-white">הצהרת נגישות</span>
          </nav>
          <h1 className="stm-load-up mb-[18px] text-[38px]/[1.08] font-extrabold tracking-[-0.01em] md:text-[54px]/[1.08]">
            הצהרת נגישות
          </h1>
          <p className="stm-load-up stm-d1 mx-auto max-w-[640px] text-[17px]/[1.66] font-light text-[#cdddea] md:text-[18px]/[1.66]">
            מגדל הים רואה בהנגשת האתר והשירות חלק מהמחויבות לכל אורחיו. כאן מפורט מה כבר
            הונגש, מה נמצא בתהליך, ואיך פונים אלינו בכל קושי.
          </p>
        </Container>
        <WaveSeparator position="bottom" fill="var(--color-cloud)" />
      </section>

      {/* מקטע ההצהרה — רקע תכלת-אפרפר, פריסת שתי עמודות (TOC דביק + כרטיס מסמך).
          הריפוד התחתון = 84px (מרווח הרפרנס) + גובה גל הפוטר המשותף (70/120px) */}
      <section className="bg-cloud px-5 pt-[54px] pb-[154px] sm:px-8 md:pb-[204px] lg:px-14">
        <div className="tk-grid">
          <aside className="tk-toc">
            <nav aria-label="תוכן עניינים">
              <div className="tk-toc-title">תוכן עניינים</div>
              <ol>
                {TOC.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.label}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="tk-pad" data-rev="card">
            <div id="a1" className="tk-sec">
              <h2 className="tk-h">1. המחויבות שלנו</h2>
              <p className="tk-clause">
                אנו רואים בהנגשת האתר והשירות תהליך מתמשך ולא פעולה חד-פעמית: בכל שינוי באתר
                נבדקת גם הנגישות שלו, ופריטים שנמצאו חסרים נכנסים לתוכנית העבודה.
              </p>
              <p className="tk-clause">
                הצהרה זו מתארת את מצב הנגישות בפועל נכון לתאריך העדכון המופיע בסופה — לא יעד
                עתידי ולא הבטחה כללית.
              </p>
            </div>

            <div id="a2" className="tk-sec">
              <h2 className="tk-h">2. התקן ורמת הנגישות</h2>
              <p className="tk-clause">
                האתר מונגש בהתאם ל<strong>תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות
                לשירות), התשע&quot;ג-2013</strong>, תקנה 35, ולפי <strong>תקן ישראלי ת&quot;י 5568
                חלק 1</strong>, המאמץ את הנחיות <strong>WCAG 2.0 ברמה AA</strong>.
              </p>
              <p className="tk-clause">
                אנו פועלים להשלמת התאמת האתר לדרישות ת&quot;י 5568 ברמה AA עד לתאריך
                31.12.2026.
              </p>
              <p className="tk-clause">
                <strong>דפדפנים נתמכים:</strong> Chrome, Firefox, Safari ו-Edge בגרסאות
                עדכניות.
              </p>
            </div>

            <div id="a3" className="tk-sec">
              <h2 className="tk-h">3. מה כבר הונגש באתר</h2>
              <div className="tk-checks">
                {DONE.map((text) => (
                  <div key={text} className="tk-check">
                    <span className="tk-check-ic" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M5 12l4 4 10-10"
                          stroke="#2b7fb8"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="tk-check-tx">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div id="a4" className="tk-sec">
              <h2 className="tk-h">4. מה נמצא בתהליך</h2>
              <ul className="mb-3 flex list-disc flex-col gap-2 pr-5 text-[15px]/[1.78] text-[#4a5d6f] marker:text-ocean-400">
                {IN_PROGRESS.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
              <div className="tk-warn">
                <p>
                  נתקלתם בקושי?{" "}
                  <a className="underline underline-offset-2" href="#a6">
                    פנו אלינו (מקטע 6)
                  </a>{" "}
                  ונטפל בהקדם.
                </p>
              </div>
            </div>

            <div id="a5" className="tk-sec">
              <h2 className="tk-h">5. נגישות המקום</h2>
              <p className="tk-clause">
                הבניין והדירות אינם מונגשים כיום לאנשים עם מוגבלות בניידות: אין כניסה נגישה,
                ואין התאמות נגישות בתוך הדירות. אורחים עם צרכי נגישות מוזמנים ליצור איתנו קשר
                לפני ההזמנה כדי שנוכל לבדוק יחד אם השהייה מתאימה.
              </p>
            </div>

            <div id="a6" className="tk-sec" style={{ marginBottom: "8px" }}>
              <h2 className="tk-h">6. פנייה בנושא נגישות</h2>
              <div className="tk-info">
                <strong>לפניות בנושא נגישות</strong> ניתן לפנות לאחראי הנגישות של מגדל הים
                בטלפון{" "}
                <a className="stm-link" href={BUSINESS.phones.mobile.tel} dir="ltr">
                  {BUSINESS.phones.mobile.label}
                </a>{" "}
                או בדוא&quot;ל{" "}
                <a className="stm-link" href={`mailto:${BUSINESS.email}`} dir="ltr">
                  {BUSINESS.email}
                </a>
                . נשתדל להשיב תוך 7 ימי עסקים.
                <br />
                <strong>כתובת:</strong> {BUSINESS.address.full}
                {"  ·  "}
                <strong>שעות:</strong> {BUSINESS.hours}
                <br />
                ניתן לפנות גם דרך{" "}
                <Link className="stm-link font-semibold text-ocean-400" href="/contact">
                  טופס יצירת הקשר
                </Link>
                .
                <br />
                <strong>תאריך עדכון ההצהרה:</strong> {UPDATED}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
