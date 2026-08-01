import type { PublicRoom } from "./booking-api";
import {
  amenityGroups,
  detailParagraphs,
  differentiatingTag,
  parseRoomCopy,
  shortDescription,
  topAmenities,
  type AmenityGroup,
} from "./room-copy";
import { bedsLabel, roomFacts, roomGallery, roomTypeBadge, type RoomImage } from "./rooms-view";
import { STAY_TERMS } from "./stay-terms";

/* מודל התצוגה של דירה — מקור אחד לשתי התצוגות (§5 ברפרנס).
   כרטיס השורה + האקורדיון וכרטיס הגריד + המגירה קוראים מכאן ולא ממירים
   נתונים בעצמם: כך אי אפשר שהמגירה תציג משהו אחר ממה שהכרטיס הבטיח.

   השדות הכלליים מזינים את הכרטיס, `details` מזין את המפרט המורחב בלבד —
   התיאור המלא לעולם לא נכנס לכרטיס. */

/* מיקום: הבניין והמרחק מהחוף הם עובדות של הנכס (זהות לכל הדירות), הקומה
   מגיעה מ-GuestHub לכל דירה בנפרד */
const BUILDING = "בניין אלמוג";
const DISTANCE_FROM_BEACH = "50 מ׳ מהחוף";

export const TITLE_MAX = 34;

export type ApartmentView = {
  /** מזהה החדר הפיזי — גם מפתח הרשימה וגם מזהה האקורדיון/המגירה */
  id: string;
  title: string;
  roomNumber: string;
  tag: string | null;

  building: string;
  floor: string | null;
  distanceFromBeach: string;
  locationLine: string;

  /* ארבעת נתוני היסוד. שדה שלא הוגדר ב-GuestHub הוא null — הכרטיס לא
     מרנדר שבב ריק ולא ממציא מספר */
  guestsMax: number | null;
  sqm: number | null;
  rooms: string | null;
  beds: string | null;

  images: RoomImage[];
  amenities: string[];
  /** ארבעת המובילים ו-+N — מחושבים מ-amenities, לא מוזנים ידנית */
  topAmenities: string[];
  moreAmenities: number;

  shortDescription: string | null;
  details: { paragraphs: string[]; groups: AmenityGroup[] };
  terms: readonly string[];
};

const clamp = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;

/* מספר החדרים אינו עמודה ב-guesthub.rooms — ההרכב מקודד בשם סוג החדר, שאותו
   הבעלים מתחזק ("חדר שינה וסלון", "2 חדרי שינה וסלון", "סטודיו"). כאן הוא
   מפוענח, ולא מנוחש: תבנית שלא זוהתה מחזירה null והשבב פשוט לא נוצר */
export function roomsCountLabel(typeName: string | null): string | null {
  if (!typeName) return null;
  if (/סטודיו/.test(typeName)) return "חדר אחד";
  const bedrooms = /(\d+)\s*חדרי\s+שינה/.exec(typeName);
  if (bedrooms) {
    const n = Number(bedrooms[1]) + (/וסלון/.test(typeName) ? 1 : 0);
    return `${n} חדרים`;
  }
  if (/חדר\s+שינה\s+וסלון/.test(typeName)) return "2 חדרים";
  return null;
}

/* כותרת הכרטיס לפי §2: "דירה 1102 · חדר שינה וסלון", עד 34 תווים */
export const apartmentTitle = (room: PublicRoom): string =>
  clamp(`דירה ${room.roomNumber} · ${room.title}`, TITLE_MAX);

export function buildApartmentView(room: PublicRoom): ApartmentView {
  const facts = roomFacts(room);
  const copy = parseRoomCopy(room.description);
  const { top, more } = topAmenities(room.amenities);
  const title = apartmentTitle(room);
  const location = [BUILDING, facts.floor ? `קומה ${facts.floor}` : null, DISTANCE_FROM_BEACH]
    .filter(Boolean)
    .join(" · ");

  return {
    id: room.id,
    title,
    roomNumber: room.roomNumber,
    tag: differentiatingTag(room.amenities, roomTypeBadge(room)),

    building: BUILDING,
    floor: facts.floor,
    distanceFromBeach: DISTANCE_FROM_BEACH,
    locationLine: location,

    guestsMax: facts.guests,
    sqm: facts.sizeSqm,
    rooms: roomsCountLabel(facts.typeName),
    beds: facts.beds ? bedsLabel(facts.beds) : null,

    /* alt תיאורי לכל תמונה (§9): מה שהבעלים כתב ב-GuestHub, ואם לא כתב —
       שם הדירה ומיקום התמונה בגלריה, ולא "תמונה" סתם */
    images: roomGallery(room, (i) => `${title} — תמונה ${i + 1}`),
    amenities: room.amenities,
    topAmenities: top,
    moreAmenities: more,

    shortDescription: shortDescription(copy, room.summary),
    details: {
      paragraphs: detailParagraphs(copy),
      groups: amenityGroups(copy.items, room.amenities),
    },
    terms: STAY_TERMS,
  };
}

/* המפרט המורחב נפתח רק כשיש בו תוכן אמיתי — פס "מפרט מלא" שפותח פאנל עם
   תנאי השהייה בלבד הוא הבטחה ריקה */
export const hasSpec = (a: ApartmentView): boolean =>
  a.details.paragraphs.length > 0 || a.details.groups.length > 0;
