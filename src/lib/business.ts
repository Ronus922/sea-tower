/* פרטי העסק — מקור אמת יחיד (אין לפזר טלפונים/כתובות בקומפוננטות).
   הערכים לקוחים מהתוכן הקיים באתר (עמוד הבית + הפוטר) — לא להמציא ערכים */

export const BUSINESS = {
  name: "מגדל הים",
  nameEn: "Sea Tower",
  tagline: "דירות בוטיק על הים",
  address: {
    street: "דוד אלעזר 10",
    city: "חיפה",
    building: "בניין אלמוג, מגדלי חוף הכרמל",
    full: "בניין אלמוג, דוד אלעזר 10, חיפה",
  },
  phones: {
    office: { label: "04-6891689", tel: "tel:+97246891689" },
    mobile: { label: "055-9994880", tel: "tel:+972559994880" },
  },
  email: "office@sea-tower.co.il",
  /* וואטסאפ — נגזר מהנייד הקיים 055-9994880 */
  whatsappNumber: "972559994880",
  hours: "שירות וזמינות 24/7",
  /* הדומיין הקנוני המיועד הוא https://sea-tower.co.il (SEO-AUDIT B2), אך נכון
     ל-2026-08 ה-DNS שלו עדיין מצביע לשרת האתר הישן (35.246.215.141) — החלפה
     לפני העברת ה-DNS תפנה קנוניקלים/sitemap לאתר זר. כל ה-URL-ים המוחלטים
     (metadataBase, robots, sitemap, JSON-LD @id) נגזרים מהשדה הזה בלבד;
     כשה-DNS יעבור לשרת הזה: לעדכן כאן → build+deploy → תעודה + vhost
     ו-301 מ-sea-tower.bios.co.il ב-nginx. */
  siteUrl: "https://sea-tower.bios.co.il",
} as const;

/* רשתות חברתיות — כתובות רשמיות שסיפקו הבעלים (2026-08-15). סדר המערך =
   סדר ה-DOM בפוטר: פייסבוק ראשון (ימני ב-RTL) → לינקדאין אחרון (שמאלי),
   כך שהסדר הוויזואלי משמאל לימין הוא לינקדאין, יוטיוב, אינסטגרם, פייסבוק */
export const SOCIAL_LINKS = [
  { id: "facebook", label: "מגדל הים בפייסבוק", href: "https://www.facebook.com/SeaTowerHaifa" },
  {
    id: "instagram",
    label: "מגדל הים באינסטגרם",
    href: "https://www.instagram.com/sea_tower_haifa/",
  },
  { id: "youtube", label: "מגדל הים ביוטיוב", href: "https://www.youtube.com/@sea-tower" },
  {
    id: "linkedin",
    label: "מגדל הים בלינקדאין",
    href: "https://www.linkedin.com/in/sea-tower-27999a23b/?skipRedirect=true",
  },
] as const;

export type SocialId = (typeof SOCIAL_LINKS)[number]["id"];

export function whatsappUrl(text?: string): string {
  return `https://wa.me/${BUSINESS.whatsappNumber}${
    text ? `?text=${encodeURIComponent(text)}` : ""
  }`;
}

const MAPS_QUERY = encodeURIComponent(BUSINESS.address.full);
export const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
export const MAPS_EMBED = `https://maps.google.com/maps?q=${MAPS_QUERY}&z=16&hl=he&output=embed`;

/* סוגי פנייה בטופס צור קשר — משותף לטופס (client) ולאימות בשרת */
export const INQUIRY_TYPES = [
  "חופשה מול הים",
  "אירוח עסקי",
  "רילוקיישן",
  "השכרה לטווח קצר",
  "השכרה לטווח ארוך",
  "ניהול דירה",
  "שאלה כללית",
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];
