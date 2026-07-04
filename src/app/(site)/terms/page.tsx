import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { MotionEngine } from "@/components/site/MotionEngine";
import { openSans } from "@/lib/fonts";

/* עמוד תקנון — נבנה 1:1 לפי design-reference/exports/regulations.html.
   הגופן הנראה ברפרנס הוא Open Sans (לא Frank Ruhl / לא Rubik הגלובלי) —
   נטען דרך @/lib/fonts ומוגבל לעמוד זה בלבד. התנועה: מנוע התנועה המשותף
   (חשיפת Hero + כרטיס המסמך כיחידה אחת + זוהר נושם) — ללא מצב PLUS. */

export const metadata: Metadata = {
  title: "תקנון — תנאי הזמנה וביטול | מגדל הים",
  description:
    "תנאי ההזמנה, הביטול והשימוש בשירותי מגדל הים. השימוש באתר ו/או ביצוע הזמנה דרכו מהווים אישור והסכמה מלאה לתנאים אלו.",
};

/* תוכן עניינים — 22 פריטים, טקסט קישור מדויק מהרפרנס (שים לב: פריט 9 קצר
   מכותרת ה-h2 המלאה בכוונה, כפי שבמקור) */
const TOC = [
  { id: "s1", label: "מבוא" },
  { id: "s2", label: "תנאי שימוש באתר" },
  { id: "s3", label: "ביצוע הזמנות ותשלום" },
  { id: "s4", label: "פרטי רכישה ואחריות המשתמש" },
  { id: "s5", label: "מחירים ושינויים" },
  { id: "s6", label: "כוח עליון ומדיניות חירום" },
  { id: "s7", label: "ביטולים, שינויים ואי הגעה" },
  { id: "s8", label: "הגעה, צ׳ק-אין וזיהוי" },
  { id: "s9", label: "אחריות לנזקים, רכוש ופיקדון" },
  { id: "s10", label: "אחריות מוגבלת ותקלות טכניות" },
  { id: "s11", label: "החלפת חדרים ותקלה במבנה" },
  { id: "s12", label: "ביטול מצד החברה" },
  { id: "s13", label: "מדיניות פרטיות ושמירת מידע" },
  { id: "s14", label: "ילדים ותוספות מיטה" },
  { id: "s15", label: "חיות מחמד" },
  { id: "s16", label: "סעיפים כלליים" },
  { id: "s17", label: "סוכנויות צד שלישי" },
  { id: "s18", label: "שיפוי" },
  { id: "s19", label: "עדכון התקנון" },
  { id: "s20", label: "חל איסור מוחלט" },
  { id: "s21", label: "חוקי הבית" },
  { id: "s22", label: "אחריות ושיפוט" },
];

export default function Terms() {
  return (
    <div className={openSans.className}>
      {/* שער חשיפות: רץ לפני ה-hydration כך שתוכן מסומן לא מהבהב לפני האנימציה.
          רשת ביטוחון של המנוע + no-JS (המחלקה לא נוספת) מבטיחים שהטקסט לעולם
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
            <span className="font-semibold text-white">תקנון</span>
          </nav>
          <h1
            data-rev="up"
            className="mb-[18px] text-[38px]/[1.08] font-extrabold tracking-[-0.01em] md:text-[54px]/[1.08]"
          >
            תקנון — תנאי הזמנה וביטול
          </h1>
          <p
            data-rev="up"
            className="mx-auto max-w-[640px] text-[17px]/[1.66] font-light text-[#cdddea] md:text-[18px]/[1.66]"
          >
            תנאי ההזמנה, הביטול והשימוש בשירותי מגדל הים. השימוש באתר ו/או ביצוע הזמנה דרכו
            מהווים אישור והסכמה מלאה לתנאים אלו.
          </p>
        </Container>
        <WaveSeparator position="bottom" fill="var(--color-cloud)" />
      </section>

      {/* מקטע התקנון — רקע תכלת-אפרפר, פריסת שתי עמודות (TOC דביק + כרטיס מסמך).
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
            <div id="s1" className="tk-sec">
              <h2 className="tk-h">1. מבוא</h2>
              <p className="tk-clause">תקנון זה מהווה הסכם מחייב בין <strong>דירות נופש מגדל הים</strong> (להלן: &quot;החברה&quot;) לבין כל אדם המשתמש באתר האינטרנט sea-tower.co.il (להלן: &quot;האתר&quot;) ו/או המזמין באמצעותו שירותי אירוח, לינה או חבילות נופש (להלן: &quot;השירותים&quot;). השימוש באתר מהווה אישור והסכמה לכל תנאי התקנון במלואם.</p>
              <p className="tk-clause">
                <strong>התקנון מנוסח בלשון זכר לצרכי נוחות בלבד, אך מתייחס לנשים וגברים כאחד.</strong>
              </p>
            </div>
            <div id="s2" className="tk-sec">
              <h2 className="tk-h">2. תנאי שימוש באתר</h2>
              <p className="tk-clause">
                <strong>2.1.</strong> המשתמש מצהיר כי קרא את התקנון, הבין את תנאיו והסכים להם במלואם.</p>
              <p className="tk-clause">
                <strong>2.2.</strong> האתר נועד לשם קבלת מידע, ביצוע הזמנות ותשלום עבור שירותי אירוח בלבד.</p>
              <p className="tk-clause">
                <strong>2.3.</strong> חל איסור מוחלט על העתקה, הפצה, שיכפול, העברה או שימוש בתכני האתר ללא אישור בכתב מהחברה.</p>
              <p className="tk-clause">
                <strong>2.4.</strong> החברה אינה אחראית ללינקים חיצוניים המופיעים באתר. השימוש בהם באחריות המשתמש בלבד.</p>
              <p className="tk-clause">
                <strong>2.5.</strong> החברה שומרת לעצמה את הזכות לשנות, לעדכן או להסיר תכנים באתר בכל עת.</p>
            </div>
            <div id="s3" className="tk-sec">
              <h2 className="tk-h">3. ביצוע הזמנות ותשלום</h2>
              <p className="tk-clause">
                <strong>3.1.</strong> הזמנה תתבצע באמצעות כרטיס אשראי תקף (ויזה, ישראכרט, מאסטרקארד או אמריקן אקספרס).</p>
              <p className="tk-clause">
                <strong>3.2.</strong> החיוב יתבצע בהתאם למדיניות הביטול כפי שפורטה בעת ההזמנה.</p>
              <p className="tk-clause">
                <strong>3.3.</strong> המחירים באתר מוצגים בשקלים חדשים וכוללים מע&quot;מ לפי חוק.</p>
              <p className="tk-clause">
                <strong>3.4.</strong> תיירים שאינם תושבי ישראל, המחזיקים בדרכון זר וספח מעבר B2, עשויים להיות זכאים לפטור ממע&quot;מ בהתאם לאישור רשות המיסים.</p>
              <p className="tk-clause">
                <strong>3.5.</strong> החברה רשאית לשמור פרטי תשלום לצורכי ביטחון בלבד, לרבות בגין נזקים או חיובים חריגים.</p>
              <p className="tk-clause">
                <strong>3.6.</strong> התמונות באתר הן להמחשה בלבד. ייתכנו הבדלים בין התמונות לבין המציאות.</p>
            </div>
            <div id="s4" className="tk-sec">
              <h2 className="tk-h">4. פרטי רכישה ואחריות המשתמש</h2>
              <p className="tk-clause">
                <strong>4.1.</strong> המשתמש מתחייב להזין פרטים מדויקים, מלאים ואמיתיים בעת ביצוע ההזמנה.</p>
              <p className="tk-clause">
                <strong>4.2.</strong> החברה אינה אחראית להזמנה שהתבצעה עקב טעות בהזנת הנתונים.</p>
              <p className="tk-clause">
                <strong>4.3.</strong> מסירת פרטים כוזבים מהווה עבירה פלילית. החברה רשאית לנקוט צעדים משפטיים בגין כך.</p>
              <p className="tk-clause">
                <strong>4.4.</strong> החברה רשאית שלא לאשר הזמנה לפי שיקול דעתה הבלעדי.</p>
            </div>
            <div id="s5" className="tk-sec">
              <h2 className="tk-h">5. מחירים ושינויים</h2>
              <p className="tk-clause">
                <strong>5.1.</strong> המחירים עשויים להשתנות מעת לעת ללא הודעה מוקדמת.</p>
              <p className="tk-clause">
                <strong>5.2.</strong> במקרה של טעות תמחור, תציע החברה למזמין לשמור את ההזמנה במחיר המתוקן או לבטלה ללא קנס.</p>
              <p className="tk-clause">
                <strong>5.4.</strong> החברה שומרת לעצמה את הזכות להפסיק או לשנות הצעת מחיר, זמינות חדרים או שירותים בכל עת.</p>
            </div>
            <div id="s6" className="tk-sec">
              <h2 className="tk-h">6. כוח עליון ומדיניות חירום</h2>
              <p className="tk-clause">
                <strong>6.1.</strong> החברה לא תישא באחריות לכל עיכוב, שינוי או ביטול הנובע מכוח עליון – לרבות שביתות, מגפות, מלחמות, תקלות חשמל, סגרים או אירועים שאינם בשליטתה.</p>
            </div>
            <div id="s7" className="tk-sec">
              <h2 className="tk-h">7. ביטולים, שינויים ואי הגעה</h2>
              <p className="tk-clause">
                <strong>7.1.</strong> במקרה של ביטול – לא יינתן החזר כספי.</p>
              <p className="tk-clause">
                <strong>7.2.</strong> ההזמנה שבוטלה תוכל להתממש במועד אחר בתוך עד 3 חודשים ממועד הביטול, בכפוף לזמינות ולתעריפי החברה ביום המימוש.</p>
              <p className="tk-clause">
                <strong>7.3.</strong> החברה אינה מחויבת לשמור על המחיר המקורי. במקרה של שינוי במחירים, יידרש המזמין להשלים את ההפרש.</p>
              <p className="tk-clause">
                <strong>7.4.</strong> הזמנה ששונתה פעם אחת – לא תוכל להשתנות שוב, ואם תבוטל תיחשב כמבוטלת ללא החזר.</p>
              <p className="tk-clause">
                <strong>7.5.</strong> בקשה לביטול או שינוי תוגש בכתב לכתובת office@sea-tower.co.il לפחות 7 ימי עסקים לפני מועד ההגעה.</p>
              <p className="tk-clause">
                <strong>7.6.</strong> כלל ההזמנות הינן ללא אפשרות ביטול, אלא אם צוין אחרת במפורש ובכפוף לאישור בכתב מאת החברה.</p>
              <p className="tk-clause">
                <strong>7.7.</strong> ככל שההזמנה עומדת בתנאי הביטול, ניתן לבצע את הביטול באמצעות קטגוריית „תיק ההזמנות” באתר או בפנייה בכתב לכתובת: office@sea-tower.co.il.</p>
              <p className="tk-clause">
                <strong>7.8.</strong> במקרה של אי הגעה (No-Show), יחויב המזמין במלוא סכום ההזמנה (100%), ולא תינתן אפשרות לשינוי מועדי האירוח.</p>
              <p className="tk-clause">
                <strong>7.9.</strong> בקשות ביטול או שינוי שיתקבלו ביום שבת או ביום מנוחה רשמי בישראל ייחשבו כאילו הוגשו ביום העבודה העוקב.</p>
              <p className="tk-clause">
                <strong>7.10.</strong> כל שינוי בהזמנה (לרבות: תאריכים, יעד, מספר נופשים וכדומה) עשוי להיות כרוך בתשלום דמי שינוי נוספים, בהתאם לתעריפים הנהוגים במועד ביצוע השינוי.</p>
              <p className="tk-clause">
                <strong>7.11.</strong> ביצוע שינויים יתאפשר באמצעות פנייה בכתב בלבד, בהתאם להוראות חוק הגנת הצרכן, התשמ״א-1981.</p>
              <p className="tk-clause">
                <strong>7.12.</strong> לחברה שמורה הזכות לאשר או לדחות בקשות ביטול ושינוי, על פי תנאי המחירון ובכפוף להוראות הדין.</p>
            </div>
            <div id="s8" className="tk-sec">
              <h2 className="tk-h">8. הגעה, צ׳ק-אין וזיהוי</h2>
              <p className="tk-clause">
                <strong>8.1.</strong> על האורח להציג בעת ההגעה <strong>תעודת זהות תקפה ופרטי אשראי תואמים לשם ההזמנה</strong>.</p>
              <p className="tk-clause">
                <strong>8.2.</strong> לא תתאפשר כניסה ללא אימות זהות ותיאום עם פרטי ההזמנה.</p>
              <p className="tk-clause">
                <strong>8.3.</strong> לא ניתן להעביר הזמנה לאדם אחר.</p>
              <p className="tk-clause">
                <strong>8.4.</strong> לאחר שעת הצ׳ק-אין לא תתאפשר קבלת האורח ולא יינתן החזר כספי.</p>
              <p className="tk-clause">
                <strong>8.5.</strong> החברה רשאית למנוע כניסה או לשלול שהייה עקב התנהגות בלתי הולמת, העלבות, קללות או הפרת חוקי המקום – ללא החזר כספי.</p>
            </div>
            <div id="s9" className="tk-sec">
              <h2 className="tk-h">9. אחריות לנזקים, רכוש ופיקדון ביטחון</h2>
              <p className="tk-clause">
                <strong>9.1.</strong> החברה רשאית לגבות פיקדון ביטחון. האורח אחראי לכל נזק לרכוש, למבנה או לציוד. הפיקדון יוחזר לאחר בדיקה, ואם יימצא נזק – החברה רשאית לחייב בכרטיס האשראי שסופק.</p>
            </div>
            <div id="s10" className="tk-sec">
              <h2 className="tk-h">10. אחריות מוגבלת ותקלות טכניות</h2>
              <p className="tk-clause">
                <strong>10.1.</strong> החברה אינה אחראית להפסקות חשמל, תקלות אינטרנט, תקלות מים או כל תקלה אחרת הנובעת מגורם שלישי או שאינה בשליטתה.</p>
              <p className="tk-clause">
                <strong>10.2.</strong> במקרה שתתרחש תקלה שלא ניתן לתקנה במהלך השהות, לא תישא החברה בכל אחריות או חבות כלפי המזמין.</p>
              <p className="tk-clause">
                <strong>10.3.</strong> למען הסר ספק, אחריות החברה – ככל שתקום – <strong>מוגבלת לסכום ששילם המזמין בפועל עבור ההזמנה</strong>, ולא תעלה על סכום זה בשום מקרה.</p>
            </div>
            <div id="s11" className="tk-sec">
              <h2 className="tk-h">11. החלפת חדרים ותקלה במבנה</h2>
              <p className="tk-clause">
                <strong>11.1.</strong> לחברה שמורה הזכות להחליף בין החדרים לפי שיקול דעתה, ובלבד שתספק חדר זהה או משודרג במפרטו.</p>
              <p className="tk-clause">
                <strong>11.2.</strong> במקרה של תקלה בחדר, תהיה החברה רשאית, לפי שיקול דעתה, להציע למזמין חדר חלופי ברמת סטנדרט זהה או גבוהה ממנה.</p>
              <p className="tk-clause">
                <strong>11.3.</strong> במידה ולא ניתן לספק חלופה הולמת, תהיה החברה רשאית לבטל את העסקה ולהשיב למזמין את מלוא התמורה ששולמה — וזאת מבלי שהדבר ייחשב כהפרת התחייבות ומבלי שתקום למזמין כל זכות לפיצוי נוסף.</p>
            </div>
            <div id="s12" className="tk-sec">
              <h2 className="tk-h">12. ביטול מצד החברה</h2>
              <p className="tk-clause">
                <strong>12.1.</strong> החברה רשאית לבטל הזמנה במקרה של תקלה טכנית, טעות אנוש, חשד להונאה או נסיבות חריגות. במקרה כזה יושב ללקוח מלוא הסכום ששולם ללא פיצוי נוסף.</p>
            </div>
            <div id="s13" className="tk-sec">
              <h2 className="tk-h">13. מדיניות פרטיות ושמירת מידע</h2>
              <p className="tk-clause">
                <strong>13.1.</strong> בעת ביצוע הזמנה נאספים פרטים אישיים הדרושים להשלמת העסקה.</p>
              <p className="tk-clause">
                <strong>13.2.</strong> החברה מתחייבת לשמור את המידע בהתאם לחוק הגנת הפרטיות, התשמ&quot;א-1981, ולא להעבירו לצדדים שלישיים אלא לפי דרישת רשויות מוסמכות.</p>
            </div>
            <div id="s14" className="tk-sec">
              <h2 className="tk-h">14. ילדים ותוספות מיטה</h2>
              <p className="tk-clause">
                <strong>14.1.</strong> כל ילד, בכל גיל – לרבות תינוקות – חייב בתשלום מלא בהתאם למדיניות התעריפים של החברה.</p>
              <p className="tk-clause">
                <strong>14.2.</strong> תוספת תשלום תחול בגין בקשת מיטה נוספת, והדבר יתאפשר בכפוף לזמינות ובאישור מראש בלבד.</p>
            </div>
            <div id="s15" className="tk-sec">
              <h2 className="tk-h">15. חיות מחמד</h2>
              <p className="tk-clause">
                <strong>15.1.</strong> אירוח בעלי חיים יתאפשר רק באישור מראש ובכפוף לתשלום נוסף.</p>
              <p className="tk-clause">
                <strong>15.2.</strong> הכנסת חיות מחמד למקום האירוח ללא אישור מראש ובכתב מהחברה תיחשב כהפרה של תנאי ההזמנה ותגרור סילוק מיידי של האורח מהנכס, ללא כל החזר כספי או דמי פיצוי מכל סוג שהוא.</p>
            </div>
            <div id="s16" className="tk-sec">
              <h2 className="tk-h">16. סעיפים כלליים</h2>
              <p className="tk-clause">
                <strong>16.1.</strong> עד אישור ההזמנה מהחברה, ההזמנה אינה מחייבת את החברה.</p>
              <p className="tk-clause">
                <strong>16.2.</strong> הזמנות באתר נחשבות כעסקת מכר מרחוק רק אם עומדות בדרישות חוק הגנת הצרכן.</p>
              <p className="tk-clause">
                <strong>16.3.</strong> נוסח בלשון זכר מתייחס גם לנקבה ולהיפך.</p>
              <p className="tk-clause">
                <strong>16.4.</strong> מקום האירוח רשאי לבטל הזמנה שאינה עומדת בתנאי וחוקי המקום.</p>
              <p className="tk-clause">
                <strong>16.5.</strong> מקום האירוח רשאי שלא לקבל אורחים שמטרתם או אופן התנהגותם איננו תואם את תנאי וחוקי המקום.</p>
              <p className="tk-clause">
                <strong>16.6.</strong> החברה רשאית לשנות מחירים, זמינות שירותים או מבנה האתר בכל עת, ללא הודעה מוקדמת.</p>
              <p className="tk-clause">
                <strong>16.7.</strong> אי אכיפת זכות מסוימת בתקנון זה לא מהווה ויתור על זכות זו.</p>
            </div>
            <div id="s17" className="tk-sec">
              <h2 className="tk-h">17. סוכנויות צד שלישי</h2>
              <p className="tk-clause">
                <strong>17.1.</strong> הזמנות המתבצעות דרך סוכנויות או אתרים חיצוניים (כגון Booking.com, Expedia וכיו״ב) כפופות לתנאי ולמדיניות של אותה סוכנות, כפי שנקבעו בעת ההזמנה.</p>
              <p className="tk-clause">
                <strong>17.2.</strong> מבלי לגרוע מן האמור, חוקי הבית, כללי הבטיחות, מדיניות הזיהוי וההתנהגות, ומדיניות הנזקים/פיקדון של החברה יחולו על כל אורח השוהה בנכס, בנוסף לתנאי הסוכנות, ובכפוף להוראות כל דין.</p>
              <p className="tk-clause">
                <strong>17.3.</strong> במקרה של סתירה בעניינים תפעוליים/בטיחותיים/התנהגותיים יחולו תנאי החברה כפי שנקבע בתקנון.</p>
            </div>
            <div id="s18" className="tk-sec">
              <h2 className="tk-h">18. שיפוי</h2>
              <p className="tk-clause">
                <strong>18.1.</strong> המזמין מתחייב לשפות את החברה בגין כל נזק, הפסד, הוצאה או תביעה שתוגש נגדה עקב הפרת תנאי תקנון זה או התנהגות שאינה הולמת.</p>
            </div>
            <div id="s19" className="tk-sec">
              <h2 className="tk-h">19. עדכון התקנון</h2>
              <p className="tk-clause">
                <strong>19.1.</strong> עד אישור סופי מהחברה – ההזמנה אינה מחייבת. החברה רשאית לעדכן את התקנון מעת לעת, והשינויים יחולו ממועד פרסומם באתר.</p>
            </div>
            <div id="s20" className="tk-sec">
              <h2 className="tk-h">20. חל איסור מוחלט</h2>
              <p className="tk-clause">
                <strong>20.1.</strong> לעשות שימוש באתר למטרות בלתי חוקיות או לא מורשות.</p>
              <p className="tk-clause">
                <strong>20.2.</strong> לקיים אירועים, מסיבות או &quot;ישיבות&quot; בשטחי מקום האירוח.</p>
              <p className="tk-clause">
                <strong>20.3.</strong> הכנסת אורחים נוספים ללא ידיעת החברה מהווה הפרה יסודית של התקנון, ותגרור חיוב נוסף, ואף עלולה להביא לסילוק מיידי מהחדר ללא כל פיצוי או החזר כספי.</p>
              <p className="tk-clause">
                <strong>20.4.</strong> לעשן או להדליק נרגילה בחדר.</p>
              <p className="tk-clause">
                <strong>20.5.</strong> להשמיע מוזיקה ברמקולים חיצוניים או בעוצמה גבוהה.</p>
              <p className="tk-clause">
                <strong>20.6.</strong> להכניס אורחים נוספים מעבר למוסכם בהזמנה.</p>
              <p className="tk-clause">
                <strong>20.7.</strong> לקיים מסיבות או אירועים מכל סוג שהוא.</p>
              <p className="tk-clause">
                <strong>20.8.</strong> להוציא מגבות או ציוד מהחדר.</p>
              <p className="tk-clause">
                <strong>20.9.</strong> להפעיל מזגן כאשר חלונות פתוחים.</p>
              <div className="tk-warn">
                <p>כל הפרה של סעיף זה תיחשב כהפרה יסודית של תנאי האירוח ועלולה להוביל לסילוק מיידי מהחדר, לחיובים כספיים בגין נזקים, וכן לחיובים נוספים לפי שיקול דעת החברה ובהתאם להוראות הדין.</p>
              </div>
            </div>
            <div id="s21" className="tk-sec">
              <h2 className="tk-h">21. חוקי הבית</h2>
              <div className="tk-checks">
                <div className="tk-check">
                  <span className="tk-check-ic" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12l4 4 10-10" stroke="#2b7fb8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="tk-check-tx">צ׳ק-אאוט עד 11:00, כולל שבתות וחגים.</span>
                </div>
                <div className="tk-check">
                  <span className="tk-check-ic" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12l4 4 10-10" stroke="#2b7fb8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="tk-check-tx">יציאה מאוחרת — לפי זמינות ובתשלום נוסף.</span>
                </div>
                <div className="tk-check">
                  <span className="tk-check-ic" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12l4 4 10-10" stroke="#2b7fb8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="tk-check-tx">חל איסור לעשן, להדליק נרגילה, לקיים מסיבות או להשמיע מוזיקה חזקה.</span>
                </div>
              </div>
            </div>
            <div id="s22" className="tk-sec" style={{ marginBottom: "8px" }}>
              <h2 className="tk-h">22. אחריות ושיפוט</h2>
              <p className="tk-clause">
                <strong>22.1.</strong> כל סכסוך או מחלוקת בקשר עם התקנון או עם האתר יתבררו בבתי המשפט המוסמכים בעיר חיפה בלבד, בהתאם לדיני מדינת ישראל.</p>
              <p className="tk-clause">
                <strong>22.2.</strong> החברה אינה אחראית לנזקים עקיפים או בלתי ישירים הנגרמים למשתמש עקב שימוש באתר או עקב אי עמידה בהוראות התקנון.</p>
            </div>
            <div className="tk-info">
              <strong>עדכון אחרון:</strong> אוקטובר 2025<br />
              <strong>שם החברה:</strong> מגדל הים דירות נופש וסוויטות · Sea Tower – Vacation Apartments and Suites<br />
              <strong>אימייל:</strong> office@sea-tower.co.il  ·  <strong>טלפון:</strong> 04-6891689
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
