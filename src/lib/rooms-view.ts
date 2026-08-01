import type { PublicRoom } from "./booking-api";

/* נורמליזציה משותפת לכרטיס דירה — עמוד הבית ו-/rooms מציגים את אותו התוכן
   בדיוק, ולכן ההחלטות "מה מציגים ומה מסתירים" יושבות כאן ולא בכל עמוד בנפרד */

/* GuestHub מגיש את התמונות מ-/uploads/rooms/<roomId>/<file>, ושם הקובץ ומזהה
   החדר הם UUID שהשרת ייצר. אותה תבנית מחמירה נאכפת גם כאן: כתובת שלא נראית
   כך לא מגיעה ל-rewrite, ולכן ערך משובש בבסיס הנתונים לא יכול להפוך את
   ה-rewrite לנתיב שרירותי או ל-proxy פתוח */
const IMAGE_URL_RE =
  /^\/uploads\/rooms\/([0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpg|png|webp))$/i;

export function roomImageSrc(url: string): string | null {
  const m = IMAGE_URL_RE.exec(url);
  return m ? `/room-images/${m[1]}` : null;
}

export type RoomImage = { src: string; alt: string };

/* הגלריה המלאה, בסדר של GuestHub (is_main ואז sort_order), אחרי סינון
   כתובות שלא עברו את התבנית. חדר בלי אף תמונה תקפה מחזיר מערך ריק — הצרכן
   מחליט מה לעשות, ולעולם לא שואל תמונה מדירה אחרת */
export function roomGallery(room: PublicRoom): RoomImage[] {
  const out: RoomImage[] = [];
  for (const image of room.images) {
    const src = roomImageSrc(image.url);
    if (src) out.push({ src, alt: image.alt ?? room.title });
  }
  return out;
}

/* התמונה הראשונה בגלריה שעברה את הבדיקה (GuestHub כבר ממיין is_main קודם) */
export function roomCoverImage(room: PublicRoom): { src: string; alt: string } | null {
  for (const image of room.images) {
    const src = roomImageSrc(image.url);
    if (src) return { src, alt: image.alt ?? room.title };
  }
  return null;
}

/* העובדות המדידות של החדר, כפי שהן ב-GuestHub. שדה שלא הוגדר הוא null —
   אף מספר לא מומצא ואף ברירת מחדל לא מושתלת. עמוד הבית ו-/rooms מרנדרים את
   אלה כצ'יפי טקסט, ועמוד ההזמנות כצ'יפים עם אייקונים; המקור זהה */
export type RoomFacts = {
  guests: number | null;
  sizeSqm: number | null;
  beds: number | null;
  floor: string | null;
  typeName: string | null;
};

export function roomFacts(room: PublicRoom): RoomFacts {
  const beds = room.beds.single + room.beds.double + room.beds.queen + room.beds.sofa;
  return {
    guests: room.maxOccupancy || null,
    sizeSqm: room.sizeSqm ? Math.round(room.sizeSqm) : null,
    beds: beds > 0 ? beds : null,
    floor: room.floor,
    typeName: room.roomType?.name ?? null,
  };
}

export const bedsLabel = (beds: number): string => (beds === 1 ? "מיטה אחת" : `${beds} מיטות`);

/* צ'יפים — רק מה שקיים באמת ב-GuestHub. שדה חסר לא מייצר צ'יפ ריק */
export function roomChips(room: PublicRoom): string[] {
  const f = roomFacts(room);
  const chips: string[] = [];
  if (f.guests) chips.push(`עד ${f.guests} אורחים`);
  if (f.sizeSqm) chips.push(`${f.sizeSqm} מ״ר`);
  if (f.beds) chips.push(bedsLabel(f.beds));
  if (f.floor) chips.push(`קומה ${f.floor}`);
  return chips;
}

/* הקופי הקצר של הכרטיס. GuestHub כבר סינן טקסט שאינו בשפה המבוקשת, ולכן
   ערך שקיים כאן בטוח להצגה */
export const roomBlurb = (room: PublicRoom): string | null => room.summary ?? room.description;

/* כשהכותרת עצמה נלקחה מסוג החדר (חדר בלי שם עברי ב-GuestHub) אין טעם להדפיס
   את אותן מילים גם בתג שמעל התמונה */
export const roomTypeBadge = (room: PublicRoom): string | null =>
  room.titleSource === "type" ? null : (room.roomType?.name ?? null);
