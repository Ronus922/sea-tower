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
  siteUrl: "https://sea-tower.bios.co.il",
} as const;

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
