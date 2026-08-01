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

/* התמונה הראשונה בגלריה שעברה את הבדיקה (GuestHub כבר ממיין is_main קודם) */
export function roomCoverImage(room: PublicRoom): { src: string; alt: string } | null {
  for (const image of room.images) {
    const src = roomImageSrc(image.url);
    if (src) return { src, alt: image.alt ?? room.title };
  }
  return null;
}

/* צ'יפים — רק מה שקיים באמת ב-GuestHub. שדה חסר לא מייצר צ'יפ ריק */
export function roomChips(room: PublicRoom): string[] {
  const chips: string[] = [];
  if (room.maxOccupancy) chips.push(`עד ${room.maxOccupancy} אורחים`);
  if (room.sizeSqm) chips.push(`${Math.round(room.sizeSqm)} מ״ר`);
  const beds = room.beds.single + room.beds.double + room.beds.queen + room.beds.sofa;
  if (beds > 0) chips.push(beds === 1 ? "מיטה אחת" : `${beds} מיטות`);
  if (room.floor) chips.push(`קומה ${room.floor}`);
  return chips;
}

/* הקופי הקצר של הכרטיס. GuestHub כבר סינן טקסט שאינו בשפה המבוקשת, ולכן
   ערך שקיים כאן בטוח להצגה */
export const roomBlurb = (room: PublicRoom): string | null => room.summary ?? room.description;

/* כשהכותרת עצמה נלקחה מסוג החדר (חדר בלי שם עברי ב-GuestHub) אין טעם להדפיס
   את אותן מילים גם בתג שמעל התמונה */
export const roomTypeBadge = (room: PublicRoom): string | null =>
  room.titleSource === "type" ? null : (room.roomType?.name ?? null);
