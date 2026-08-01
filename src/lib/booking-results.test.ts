import { describe, expect, it } from "vitest";
import { buildBookingResults } from "./booking-results";
import type { AvailabilityResult, PublicRoom } from "./booking-api";

/* בדיקות רגרסיה לנקודה שבה זמינות ותוכן נפגשים.
   הבאג שהן נועדו למנוע: כרטיסי ההזמנה מופו לפי שם סוג החדר, ולכן שלוש דירות
   פיזיות שונות קיבלו את אותה כותרת, אותו תיאור ואותן תמונות סטטיות. */

const ROOM_A = "11111111-1111-1111-1111-111111111111";
const ROOM_B = "22222222-2222-2222-2222-222222222222";
const ROOM_NO_IMG = "33333333-3333-3333-3333-333333333333";
const IMG = (n: string) => `/uploads/rooms/${n}/44444444-4444-4444-4444-44444444444${n[0]}.jpg`;

function room(over: Partial<PublicRoom> & { id: string }): PublicRoom {
  return {
    roomNumber: "000",
    slug: null,
    title: "דירה",
    titleSource: "translation",
    summary: null,
    description: null,
    floor: null,
    sizeSqm: null,
    maxOccupancy: null,
    roomType: null,
    beds: { single: 0, double: 0, queen: 0, sofa: 0, cribs: 0 },
    amenities: [],
    images: [{ url: IMG(over.id), alt: null }],
    ...over,
  };
}

const ROOMS: PublicRoom[] = [
  room({
    id: ROOM_A,
    roomNumber: "1102",
    title: "סוויטת הים",
    summary: "מרפסת פונה לים",
    sizeSqm: 55,
    maxOccupancy: 4,
    beds: { single: 0, double: 2, queen: 0, sofa: 0, cribs: 0 },
    amenities: ["מטבחון", "מיזוג"],
    roomType: { id: "t1", name: "חדר שינה וסלון" },
    images: [
      { url: IMG(ROOM_A), alt: "סלון 1102" },
      { url: "/uploads/rooms/../../etc/passwd", alt: "לא תקין" },
    ],
  }),
  room({
    id: ROOM_B,
    roomNumber: "1237",
    title: "סוויטה משפחתית",
    summary: "אגף הבריכה",
    sizeSqm: 60,
    maxOccupancy: 4,
    amenities: ["חניה"],
    roomType: { id: "t1", name: "חדר שינה וסלון" },
  }),
  room({ id: ROOM_NO_IMG, roomNumber: "1245", title: "בלי תמונות", images: [] }),
];

const unit = (suId: string, roomId: string, code: string, totalPrice: number) => ({
  suId,
  roomId,
  code,
  totalPrice,
});

function availability(units: ReturnType<typeof unit>[]): Extract<AvailabilityResult, { ok: true }> {
  return {
    ok: true,
    checkIn: "2026-08-04",
    checkOut: "2026-08-06",
    nights: 2,
    currency: "ILS",
    roomTypes: [
      {
        roomTypeId: "type-1",
        name: "חדר שינה וסלון",
        maxOccupancy: 4,
        basePrice: 500,
        availableUnits: units.length,
        totalPrice: 1400,
        pricePerNight: 700,
        nightly: [],
        units,
      },
    ],
  };
}

const build = (av: Extract<AvailabilityResult, { ok: true }>, rooms = ROOMS) =>
  buildBookingResults({
    availability: av,
    rooms,
    guestRooms: [{ adults: 2, children: 0 }],
    nights: 2,
    checkIn: "2026-08-04",
    checkOut: "2026-08-06",
    guestsParam: "2-0",
  });

describe("החיבור בין זמינות לתוכן", () => {
  it("מחבר לפי roomId — לא לפי מספר חדר, שם, סוג או מיקום במערך", () => {
    /* המספרים והסדר הפוכים בכוונה: חיבור לפי code או לפי אינדקס ייתן
       לדירה 1102 את התוכן של 1237 */
    const { items } = build(
      availability([unit("su-b", ROOM_B, "1237", 1600), unit("su-a", ROOM_A, "1102", 1400)]),
    );
    const a = items.find((i) => i.roomId === ROOM_A)!;
    const b = items.find((i) => i.roomId === ROOM_B)!;
    expect(a.room.title).toBe("סוויטת הים");
    expect(a.room.roomNumber).toBe("1102");
    expect(b.room.title).toBe("סוויטה משפחתית");
    expect(b.room.roomNumber).toBe("1237");
  });

  it("לא מדביק לדירה אחת את הפרופיל של אחרת", () => {
    const { items } = build(
      availability([unit("su-a", ROOM_A, "1102", 1400), unit("su-b", ROOM_B, "1237", 1600)]),
    );
    const titles = items.map((i) => i.room.title);
    const images = items.map((i) => i.room.images[0].src);
    expect(new Set(titles).size).toBe(items.length);
    expect(new Set(images).size).toBe(items.length);
    expect(items.find((i) => i.roomId === ROOM_A)!.room.description).toBe("מרפסת פונה לים");
  });

  it("מזהה חדר שאין לו התאמה בקטלוג — ולא ממציא לו תוכן", () => {
    const unknown = "99999999-9999-9999-9999-999999999999";
    const { items, excluded } = build(availability([unit("su-x", unknown, "1500", 1400)]));
    expect(items).toHaveLength(0);
    expect(excluded).toEqual([{ roomId: unknown, code: "1500", reason: "no-public-profile" }]);
  });
});

describe("סמכות הנתונים", () => {
  it("מחיר מגיע מהזמינות בלבד, גם כשהתוכן משתנה", () => {
    const { items } = build(availability([unit("su-a", ROOM_A, "1102", 1400)]));
    expect(items[0].totalPrice).toBe(1400);
    expect(items[0].pricePerNight).toBe(700); // 1400 / 2 לילות

    /* אותה זמינות, קטלוג עם תוכן אחר לגמרי — המחיר לא זז */
    const other = build(
      availability([unit("su-a", ROOM_A, "1102", 1400)]),
      [room({ id: ROOM_A, roomNumber: "1102", title: "שם אחר", sizeSqm: 999 })],
    );
    expect(other.items[0].totalPrice).toBe(1400);
    expect(other.items[0].pricePerNight).toBe(700);
  });

  it("תמונות ותיאור לעולם לא מגיעים מהזמינות או מקטלוג סטטי", () => {
    const { items } = build(availability([unit("su-a", ROOM_A, "1102", 1400)]));
    const srcs = items[0].room.images.map((i) => i.src);
    /* כל תמונה חייבת להיות נתיב GuestHub. תמונות האתר הסטטיות פסולות */
    expect(srcs.every((s) => s.startsWith("/room-images/"))).toBe(true);
    expect(srcs.some((s) => s.includes("/images/"))).toBe(false);
    expect(items[0].room.description).toBe("מרפסת פונה לים");
    /* שם סוג החדר מהזמינות אינו הכותרת */
    expect(items[0].room.title).not.toBe("חדר שינה וסלון");
  });

  it("מסנן כתובת תמונה שאינה תואמת את תבנית GuestHub", () => {
    const { items } = build(availability([unit("su-a", ROOM_A, "1102", 1400)]));
    expect(items[0].room.images).toHaveLength(1);
    expect(items[0].room.images[0].src).not.toContain("..");
  });

  it("מתקנים וגודל מגיעים מהקטלוג", () => {
    const { items } = build(availability([unit("su-a", ROOM_A, "1102", 1400)]));
    expect(items[0].room.amenities).toEqual(["מטבחון", "מיזוג"]);
    expect(items[0].room.sizeSqm).toBe(55);
    expect(items[0].room.guests).toBe(4);
    expect(items[0].room.bedsLabel).toBe("2 מיטות");
  });

  it("שדה שלא הוגדר ב-GuestHub לא מייצר תווית ריקה", () => {
    const bare = room({ id: ROOM_A, roomNumber: "1102", title: "דירה חשופה" });
    const { items } = build(availability([unit("su-a", ROOM_A, "1102", 1400)]), [bare]);
    expect(items[0].room.sizeSqm).toBeNull();
    expect(items[0].room.bedsLabel).toBeNull();
    expect(items[0].room.description).toBeNull();
    expect(items[0].room.amenities).toEqual([]);
  });
});

describe("מי נכנס לתוצאות", () => {
  it("דירה שאינה פנויה בתאריכים לא מוצגת", () => {
    /* ROOM_B יש לו פרופיל מלא, אבל הוא לא ביחידות הפנויות */
    const { items } = build(availability([unit("su-a", ROOM_A, "1102", 1400)]));
    expect(items.map((i) => i.roomId)).toEqual([ROOM_A]);
  });

  it("דירה בלי תמונה ציבורית לא מוצגת, ומדווחת כמוסתרת", () => {
    const { items, excluded, availableBeforeJoin } = build(
      availability([unit("su-a", ROOM_A, "1102", 1400), unit("su-n", ROOM_NO_IMG, "1245", 1400)]),
    );
    expect(items.map((i) => i.roomId)).toEqual([ROOM_A]);
    expect(excluded).toEqual([
      { roomId: ROOM_NO_IMG, code: "1245", reason: "no-public-image" },
    ]);
    expect(availableBeforeJoin).toBe(2);
  });

  it("הרכב אורחים שחורג מהתפוסה חוסם את הסוג כולו", () => {
    const res = buildBookingResults({
      availability: availability([unit("su-a", ROOM_A, "1102", 1400)]),
      rooms: ROOMS,
      guestRooms: [{ adults: 5, children: 1 }], // 6 > maxOccupancy 4
      nights: 2,
      checkIn: "2026-08-04",
      checkOut: "2026-08-06",
      guestsParam: "6-0",
    });
    expect(res.items).toHaveLength(0);
  });
});

describe("מעבר ל-checkout", () => {
  it("שומר את מזהי ההזמנה המקוריים מתשובת הזמינות", () => {
    const { items } = build(availability([unit("su-a", ROOM_A, "1102", 1400)]));
    const url = new URL(items[0].checkoutHref, "https://example.test");
    expect(url.pathname).toBe("/booking/checkout");
    expect(url.searchParams.get("type")).toBe("type-1"); // roomTypeId מהזמינות
    expect(url.searchParams.get("unit")).toBe("su-a"); // suId מהזמינות, לא roomId
    expect(url.searchParams.get("checkin")).toBe("2026-08-04");
    expect(url.searchParams.get("checkout")).toBe("2026-08-06");
    expect(url.searchParams.get("guests")).toBe("2-0");
    /* המזהה שנשלח ל-checkout הוא היחידה למכירה, לא החדר הפיזי */
    expect(items[0].suId).toBe("su-a");
    expect(items[0].roomId).toBe(ROOM_A);
  });
});
