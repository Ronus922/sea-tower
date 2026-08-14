/* פתרונות האירוח — מקור אמת יחיד לעמוד הבית ולעמוד /solutions.
   קודם לכן המערך הזה היה משוכפל במלואו בשני העמודים (אותם צ'קים, אותן
   תמונות, אותם SVG) — DESIGN-AUDIT ממצא 6 / SEO-AUDIT A16.
   כרטיסיות עם hidden:true מוסתרות מהאתר. להחזרה — הסירו את הדגל. */

export type Solution = {
  id: string;
  num: string;
  title: string;
  /* תווית קצרה לצ'יפ עוגן, כשהכותרת ארוכה */
  pill?: string;
  /* התיאור המלא (עמוד הפתרונות) */
  text: string;
  /* תיאור מקוצר לעמוד הבית */
  teaser: string;
  checks: string[];
  img: { src: string; alt: string; width: number; height: number };
  hidden?: boolean;
  icon: React.ReactNode;
};

export const SOLUTIONS: Solution[] = [
  {
    id: "sol-1",
    num: "01",
    title: "נופש מול הים",
    text: "חופשה זוגית או משפחתית בסוויטה מפנקת עם נוף לים, במרחק נגיעה מהטיילת. כל מה שצריך כדי להתנתק, מול הים התיכון.",
    teaser: "חופשה זוגית או משפחתית בסוויטה מפנקת עם נוף לים, במרחק נגיעה מהטיילת.",
    checks: ["נוף חזיתי לים מכל דירה", "50 מ׳ מהטיילת והחוף", "מאובזר ברמה מלונאית"],
    img: {
      src: "/images/vacation-sea-view.jpg",
      alt: "זוג מטייל על חוף הים בשקיעה מול בניין אלמוג בחיפה",
      width: 1376,
      height: 768,
    },
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
    id: "sol-2",
    num: "02",
    title: "אירוח לעסקים",
    text: "מרחב עבודה שקט ומאובזר לצוותים ולשהייה ממושכת — שהעובדים יגיעו רעננים. מתאים לצוותים, לאנשי מקצוע ולשהיות עבודה ארוכות.",
    teaser: "מרחב עבודה שקט ומאובזר לצוותים ולשהייה ממושכת — שהעובדים יגיעו רעננים.",
    checks: ["מרחב עבודה שקט ואינטרנט מהיר", "חשבוניות וקבלות לחברה", "מתאים לצוותים ולשהייה ארוכה"],
    img: {
      src: "/images/business-stay.jpg",
      alt: "איש עסקים עובד מול מחשב נייד בדירה עם נוף לים",
      width: 1376,
      height: 768,
    },
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
    id: "sol-3",
    num: "03",
    title: "רילוקיישן",
    text: "נחיתה רכה בחיפה — דירה מרוהטת ומוכנה, כולל כל החשבונות, ללא התחייבות. הפתרון המושלם למעבר עיר חלק ונטול דאגות.",
    teaser: "נחיתה רכה בחיפה — דירה מרוהטת ומוכנה, כולל כל החשבונות, ללא התחייבות.",
    checks: ["דירה מרוהטת ומוכנה מהיום הראשון", "כל החשבונות כלולים", "ליווי אישי וגמישות מלאה"],
    img: {
      src: "/images/relocation-stay.jpg",
      alt: "זוג עם מזוודות נכנס לדירה מרוהטת עם נוף לים",
      width: 1376,
      height: 768,
    },
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
    id: "sol-4",
    num: "04",
    title: "השכרה לטווח קצר",
    pill: "טווח קצר",
    text: "לילה, שבוע או חודש — גמישות מלאה ואישור מיידי, בלי בירוקרטיה מיותרת. מגיעים, נכנסים ונהנים.",
    teaser: "לילה, שבוע או חודש — גמישות מלאה ואישור מיידי, בלי בירוקרטיה מיותרת.",
    checks: ["אישור מיידי, ללא בירוקרטיה", "מלילה בודד ועד חודש", "ניתן לבטל את ההזמנה בכל שלב, ללא דמי ביטול"],
    img: {
      src: "/images/short-term-rental.jpg",
      alt: "חדר שינה עם מיטה זוגית מול חלון פנורמי לים ולטיילת",
      width: 1376,
      height: 768,
    },
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
    id: "sol-5",
    num: "05",
    hidden: true,
    title: "השכרה לטווח ארוך",
    pill: "טווח ארוך",
    text: "מגורים זמניים בזמן שיפוץ, תיירות מרפא או תקופת מעבר — בנוחות של בית, בתנאים משתלמים ובשירות שוטף.",
    teaser: "מגורים זמניים בזמן שיפוץ, תיירות מרפא או תקופת מעבר — בנוחות של בית.",
    checks: ["תנאים משתלמים לטווח ארוך", "אחזקה ושירות שוטף", "פתרון מושלם לתקופת מעבר"],
    img: {
      src: "/images/suite-jacuzzi.jpg",
      alt: "סוויטת ג׳קוזי עם חלונות פנורמיים אל קו החוף בערב",
      width: 1376,
      height: 768,
    },
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
    id: "sol-6",
    num: "06",
    hidden: true,
    title: "ניהול דירות",
    text: "בעלי נכסים? ננהל עבורכם את הדירה להשכרה — תפעול, אירוח ותחזוקה מקצה לקצה, עם שיווק חכם ודוחות שקופים.",
    teaser: "ננהל עבורכם את הדירה להשכרה — תפעול, אירוח ותחזוקה מקצה לקצה.",
    checks: ["תפעול, אירוח ותחזוקה מקצה לקצה", "שיווק הנכס למקסום תפוסה", "דוחות הכנסה שקופים"],
    img: {
      src: "/images/living-room.jpg",
      alt: "סלון דירת בוטיק מנוהלת, מעוצב ומוכן לאירוח",
      width: 1024,
      height: 1024,
    },
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

export const VISIBLE_SOLUTIONS = SOLUTIONS.filter((s) => !s.hidden);
