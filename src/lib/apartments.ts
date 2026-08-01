// קונפיג שיווקי לעמוד ההזמנות — התוכן (כותרות, תיאורים, מתקנים, תמונות) לכל
// סוג חדר. ה-key חייב להיות שם ה-room_type המדויק ב-GuestHub; זמינות, מחיר
// ותפוסה מקסימלית מגיעים תמיד חיים מה-API — הקונפיג הזה הוא תצוגה בלבד.
// הקופי נלקח מכרטיסי העיצוב של מנוע ההזמנה (Claude Design).

export type ApartmentConfig = {
  key: string; // guesthub room_types.name
  title: string;
  tag: string;
  tagStyle: "light" | "sea" | "navy";
  sqm: string;
  rooms: string;
  beds: string;
  amenities: string[];
  description: string;
  images: Array<{ src: string; alt: string }>;
};

export const APARTMENTS: ApartmentConfig[] = [
  {
    key: "סטודיו",
    title: "סטודיו זוגי דה־לוקס",
    tag: "לזוגות ולעבודה",
    tagStyle: "light",
    sqm: "34–45",
    rooms: "חלל אחד",
    beds: "מיטה זוגית",
    amenities: ["Wi‑Fi מהיר", "מטבחון מאובזר", "מיזוג", "סמארט TV", "כניסה עצמית"],
    description:
      "יחידה חכמה וקומפקטית עם פינת עבודה ומקלחת מפנקת — מושלמת לזוגות, לאנשי עסקים ולשהייה קצרה ליד הים.",
    images: [
      { src: "/images/bedroom-classic.jpg", alt: "סטודיו — חלל מגורים" },
      { src: "/images/living-room.jpg", alt: "סטודיו — פינת ישיבה" },
    ],
  },
  {
    key: "חדר שינה וסלון",
    title: "דירת חדר שינה וסלון מול הים",
    tag: "נוף חזיתי",
    tagStyle: "light",
    sqm: "86",
    rooms: "2 חדרים",
    beds: "מיטה זוגית + ספה",
    amenities: ["Wi‑Fi מהיר", "מטבח מלא", "מיזוג בכל חדר", "חניה", "נוף חזיתי לים"],
    description:
      "חדר שינה נפרד, מטבח מלא וסלון מרווח עם נוף חזיתי לים — בית אמיתי למשפחות ולזוגות בנוחות מלונאית.",
    images: [
      { src: "/images/suite-royal.jpg", alt: "דירת חדר שינה וסלון — סלון" },
      { src: "/images/living-room.jpg", alt: "דירת חדר שינה וסלון — פינת אירוח" },
      { src: "/images/bedroom-classic.jpg", alt: "דירת חדר שינה וסלון — חדר שינה" },
    ],
  },
  {
    key: "סוויטה",
    title: "סוויטה משפחתית פנורמית",
    tag: "מרפסת פנורמית",
    tagStyle: "navy",
    sqm: "110",
    rooms: "3 חדרים",
    beds: "6 מיטות",
    amenities: ["Wi‑Fi מהיר", "מרפסת ענקית", "מטבח מלא", "מיזוג בכל חדר", "חניה", "נוף חזיתי לים"],
    description:
      "סוויטה מרווחת עם מרפסת ענקית הפונה לים — אירוח מושלם לקבוצות ולמשפחות גדולות.",
    images: [
      { src: "/images/hero-terrace.jpg", alt: "סוויטה — מרפסת מול הים" },
      { src: "/images/suite-royal.jpg", alt: "סוויטה — סלון" },
      { src: "/images/suite-jacuzzi.jpg", alt: "סוויטה — פינת שינה" },
    ],
  },
];

export function apartmentFor(roomTypeName: string): ApartmentConfig {
  return (
    APARTMENTS.find((a) => a.key === roomTypeName) ?? {
      // fallback גנרי — סוג חדש ב-GuestHub לעולם לא מוסתר בגלל קונפיג חסר
      key: roomTypeName,
      title: roomTypeName,
      tag: "דירת נופש",
      tagStyle: "light",
      sqm: "",
      rooms: "",
      beds: "",
      amenities: [],
      description: "דירת נופש מאובזרת בבניין אלמוג, 50 מ׳ מהחוף.",
      images: [{ src: "/images/living-room.jpg", alt: roomTypeName }],
    }
  );
}
