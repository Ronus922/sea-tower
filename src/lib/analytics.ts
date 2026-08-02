/* שכבת מדידה מרכזית — נקודת הכניסה היחידה לכל תג שיווקי/אנליטי באתר.

   מצב נוכחי: לא מוגדר שום מזהה מדידה, ולכן השכבה כולה היא no-op ולא נטען
   שום סקריפט צד-שלישי. אין למלא כאן מזהי דמה — קובץ .env.example מתעד את
   שמות המשתנים, והערכים מגיעים מבעל העסק בלבד.

   כללי ברזל של השכבה:
   1. אין מזהה → אין dataLayer, אין סקריפט, אין אירועים.
   2. אין הסכמה → Consent Mode v2 מאותחל ל-denied לפני כל תג.
   3. אף פרט מזהה (שם, טלפון, דוא״ל, תוכן חופשי, פרטי אשראי, מספר הזמנה)
      לא נשלח באירוע. הטיפוסים למטה מגבילים את הפרמטרים המותרים.
   4. אירוע המרה נורה רק אחרי אישור הצלחה מהשרת — לא על קליק. */

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

/** האם קיימת הגדרת מדידה תקפה. בלעדיה השכבה שקטה לחלוטין. */
export const analyticsEnabled = /^GTM-[A-Z0-9]+$/.test(GTM_ID);

/* קטלוג האירועים. כל אירוע מוגדר עם הפרמטרים המותרים לו בלבד — הטיפוס הוא
   מנגנון האכיפה שמונע העברת PII בטעות. */
export type SiteEvent =
  /** נורה רק אחרי ש-/api/leads החזיר הצלחה מאומתת */
  | {
      name: "generate_lead";
      inquiry_type: string;
      has_dates: boolean;
      guests_count: number | null;
      form_location: "home" | "contact";
    }
  | { name: "booking_cta_click"; cta_location: string }
  | {
      name: "booking_search_submit";
      nights: number;
      rooms_count: number;
      adults: number;
      children: number;
    }
  | { name: "room_spec_open"; room_type_id: string }
  | { name: "phone_click"; phone_line: "office" | "mobile"; link_location: string }
  | { name: "whatsapp_click"; link_location: string }
  | { name: "email_click"; link_location: string }
  | { name: "article_click"; article_slug: string };

type DataLayerWindow = Window & { dataLayer?: Array<Record<string, unknown>> };

/** דחיפת אירוע ל-dataLayer. no-op בשרת וכשאין מזהה מדידה. */
export function track(event: SiteEvent): void {
  if (!analyticsEnabled || typeof window === "undefined") return;
  const { name, ...params } = event;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event: name, ...params });
}
