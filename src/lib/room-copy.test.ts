import { describe, expect, it } from "vitest";
import { apartmentTitle, buildApartmentView, hasSpec, roomsCountLabel, TITLE_MAX } from "./apartment-view";
import type { PublicRoom } from "./booking-api";
import { amenityGroups, detailParagraphs, parseRoomCopy, shortDescription, TAG_MAX, topAmenities } from "./room-copy";

/* בדיקות רגרסיה לטרנספורמציה של הקופי.
   הבאג שהן נועדו למנוע: שדה ה-description של GuestHub הוא מסמך Markdown של
   אלפי תווים, והוא הודפס כמו שהוא בתוך כרטיס ההזמנה — כולל "**תיאור הדירה**"
   ורשימת הציוד המלאה. הכרטיס מקבל משפט אחד; כל השאר נכנס למפרט המורחב. */

/* טקסט אמיתי מ-GuestHub (דירה 926), מקוצר באמצע הפסקאות */
const RAW = `דירת סטודיו מרווחת ומעוצבת לזוג, עם נוף לים ולחיפה, מטבח מאובזר, פינת אוכל וחלל אירוח נעים המתאים לחופשה זוגית או לשהייה עסקית.

**תיאור הדירה**

דירת סטודיו וחצי מציעה חוויית אירוח רגועה ומדויקת מול הנוף של חיפה והים.
במרכז החלל נמצאת מיטה זוגית נוחה, ולצדה מטבח מאובזר.

**פרטים מרכזיים**
גודל הדירה: 39 מ"ר
תפוסה מרבית: עד 2 אורחים

**מה תמצאו בדירה**
מטבח מאובזר הכולל מטבחון, מיני בר, מיקרוגל וקומקום
טלוויזיה חכמה בגודל 50 אינץ'
חדר רחצה ומקלחת פרטיים
מייבש שיער
מיזוג אוויר וחימום`;

const base = (over: Partial<PublicRoom> = {}): PublicRoom => ({
  id: "11111111-1111-1111-1111-111111111111",
  roomNumber: "926",
  slug: null,
  title: "סטודיו פנורמי לים",
  titleSource: "room",
  summary: null,
  description: RAW,
  floor: "9",
  sizeSqm: 43,
  maxOccupancy: 2,
  roomType: { id: "t", name: "סטודיו וחצי" },
  beds: { single: 0, double: 1, queen: 0, sofa: 0, cribs: 0 },
  amenities: ["מיזוג אוויר", "מטבחון", "Wi-Fi חינם", "נוף לים", "מקרר", "כספת", "מגבות"],
  images: [{ url: `/uploads/rooms/11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222.jpg`, alt: null }],
  ...over,
});

describe("פירוק הקופי הגולמי", () => {
  it("מפריד פתיחה, תיאור ורשימת ציוד — ומדלג על 'פרטים מרכזיים'", () => {
    const copy = parseRoomCopy(RAW);
    expect(copy.lead).toHaveLength(1);
    expect(copy.prose).toHaveLength(2);
    expect(copy.items).toHaveLength(5);
    /* "גודל הדירה: 39 מ״ר" חוזר על השבבים ולכן לא נכנס לשום מקום */
    expect(JSON.stringify(copy)).not.toContain("תפוסה מרבית");
  });

  it("תיאור ריק מחזיר מבנה ריק ולא נופל", () => {
    expect(parseRoomCopy(null)).toEqual({ lead: [], prose: [], items: [] });
  });
});

describe("התיאור הקצר של הכרטיס", () => {
  it("משפט אחד עד 160 תווים, בלי סימני Markdown", () => {
    const short = shortDescription(parseRoomCopy(RAW), null)!;
    expect(short.length).toBeLessThanOrEqual(160);
    expect(short).not.toMatch(/[*#]/);
    expect(short.split(/(?<=[.!?])\s+/)).toHaveLength(1);
  });

  it("לא מכניס לכרטיס את גוף המפרט", () => {
    const short = shortDescription(parseRoomCopy(RAW), null)!;
    expect(short).not.toContain("מה תמצאו בדירה");
    expect(short).not.toContain("מייבש שיער");
    expect(short.length).toBeLessThan(RAW.length / 3);
  });

  it("בוחר את המועמד שנופל בטווח 90–160 ולא את התקציר הקצר", () => {
    const short = shortDescription(parseRoomCopy(RAW), "קצר מדי");
    expect(short).not.toBe("קצר מדי");
    expect(short!.length).toBeGreaterThanOrEqual(90);
  });

  it("אין קופי — אין משפט מומצא", () => {
    expect(shortDescription(parseRoomCopy(null), null)).toBeNull();
  });
});

describe("המפרט המורחב", () => {
  it("הפסקאות מגיעות מסקציית 'תיאור הדירה'", () => {
    expect(detailParagraphs(parseRoomCopy(RAW))).toHaveLength(2);
  });

  it("אין סקציית תיאור — נופלים לפסקת הפתיחה ולא לפאנל ריק", () => {
    const paragraphs = detailParagraphs(parseRoomCopy("פסקה בודדת על הדירה."));
    expect(paragraphs).toEqual(["פסקה בודדת על הדירה."]);
  });

  it("מקבץ את הציוד לקטגוריות, בלי כפילות ובלי קבוצה ריקה", () => {
    const copy = parseRoomCopy(RAW);
    const groups = amenityGroups(copy.items, base().amenities);
    expect(groups.map((g) => g.name)).toEqual(["מטבח", "סלון ומדיה", "חדר רחצה", "נוחות"]);
    for (const g of groups) {
      expect(g.items.length).toBeGreaterThan(0);
      expect(g.items.length).toBeLessThanOrEqual(6);
      expect(g.items.every((i) => !/[*#]/.test(i))).toBe(true);
    }
    const all = groups.flatMap((g) => g.items);
    expect(new Set(all).size).toBe(all.length);
    /* "מטבחון" כבר מופיע בתוך "מטבח מאובזר הכולל מטבחון…" */
    expect(all).not.toContain("מטבחון");
  });
});

describe("מתקנים ותגית", () => {
  it("ארבעה מובילים לפי ערך שיווקי + מונה לשאר", () => {
    const { top, more } = topAmenities(base().amenities);
    expect(top).toHaveLength(4);
    expect(top[0]).toBe("Wi-Fi חינם");
    expect(more).toBe(3);
  });

  it("המונה מתאפס כשיש עד ארבעה מתקנים", () => {
    expect(topAmenities(["מקרר", "כספת"])).toEqual({ top: ["מקרר", "כספת"], more: 0 });
  });

  it("התגית היא מאפיין מבדל אמיתי, עד 18 תווים", () => {
    const view = buildApartmentView(base());
    expect(view.tag).toBe("נוף לים");
    expect(view.tag!.length).toBeLessThanOrEqual(TAG_MAX);
  });

  it("אין מאפיין מבדל ואין סוג חדר — אין תגית", () => {
    const view = buildApartmentView(base({ amenities: [], roomType: null }));
    expect(view.tag).toBeNull();
  });
});

describe("מודל התצוגה של הדירה", () => {
  it("כותרת בפורמט הרפרנס ועד 34 תווים", () => {
    expect(apartmentTitle(base())).toBe("דירה 926 · סטודיו פנורמי לים");
    const long = apartmentTitle(base({ title: "סוויטה משפחתית פנורמית עם מרפסת ענקית מול הים" }));
    expect(long.length).toBeLessThanOrEqual(TITLE_MAX);
  });

  it("מספר החדרים מפוענח משם סוג החדר, ולא מנוחש", () => {
    expect(roomsCountLabel("סטודיו")).toBe("חדר אחד");
    expect(roomsCountLabel("חדר שינה וסלון")).toBe("2 חדרים");
    expect(roomsCountLabel("2 חדרי שינה וסלון")).toBe("3 חדרים");
    expect(roomsCountLabel("סוויטה")).toBeNull();
    expect(roomsCountLabel(null)).toBeNull();
  });

  it("שורת המיקום מצרפת את הקומה מ-GuestHub", () => {
    expect(buildApartmentView(base()).locationLine).toBe("בניין אלמוג · קומה 9 · 50 מ׳ מהחוף");
    expect(buildApartmentView(base({ floor: null })).locationLine).toBe("בניין אלמוג · 50 מ׳ מהחוף");
  });

  it("שדה שלא הוגדר נשאר null — הכרטיס לא ירנדר שבב ריק", () => {
    const bare = buildApartmentView(
      base({ description: null, summary: null, sizeSqm: null, maxOccupancy: null, amenities: [], roomType: null, beds: { single: 0, double: 0, queen: 0, sofa: 0, cribs: 0 } }),
    );
    expect(bare.sqm).toBeNull();
    expect(bare.guestsMax).toBeNull();
    expect(bare.beds).toBeNull();
    expect(bare.rooms).toBeNull();
    expect(bare.shortDescription).toBeNull();
    expect(bare.topAmenities).toEqual([]);
    /* בלי תוכן אין מה לפתוח — פס "מפרט מלא" לא מוצג */
    expect(hasSpec(bare)).toBe(false);
  });

  it("alt תיאורי לכל תמונה גם כשאין alt ב-GuestHub", () => {
    expect(buildApartmentView(base()).images[0].alt).toBe("דירה 926 · סטודיו פנורמי לים — תמונה 1");
  });

  it("תנאי השהייה זהים לכל הדירות ואינם מגיעים מקטלוג התוכן", () => {
    const a = buildApartmentView(base());
    const b = buildApartmentView(base({ id: "x", roomNumber: "1102", amenities: [] }));
    expect(a.terms).toEqual(b.terms);
    expect(a.terms.length).toBeGreaterThan(0);
  });
});
