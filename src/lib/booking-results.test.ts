import { describe, expect, it } from "vitest";
import { buildBookingResults, formatExcludedReport } from "./booking-results";
import type { AvailabilityResult, PublicRoom } from "./booking-api";

/* בדיקות רגרסיה לנקודה שבה זמינות ותוכן נפגשים.
   הבאג שהן נועדו למנוע: כרטיסי ההזמנה מופו לפי שם סוג החדר, ולכן שלוש דירות
   פיזיות שונות קיבלו את אותה כותרת, אותו תיאור ואותן תמונות סטטיות. */

const ROOM_A = "11111111-1111-1111-1111-111111111111";
const ROOM_B = "22222222-2222-2222-2222-222222222222";
const ROOM_NO_IMG = "33333333-3333-3333-3333-333333333333";
const ROOM_S = "55555555-5555-5555-5555-555555555555"; // יחידה קטנה — ל-2 מבוגרים בלבד
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
  room({ id: ROOM_S, roomNumber: "1130", title: "סטודיו", maxOccupancy: 2 }),
];

/* יחידה כפי שהיא חוזרת מ-GuestHub עם guests (D195): partyPrices לכל חדר בחיפוש.
   ברירת המחדל — חדר אחד, והמחיר להרכב הוא totalPrice */
const unit = (
  suId: string,
  roomId: string,
  code: string,
  totalPrice: number,
  partyPrices: Array<number | null> = [totalPrice],
) => ({
  suId,
  roomId,
  code,
  totalPrice,
  partyPrices,
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

const build = (
  av: Extract<AvailabilityResult, { ok: true }>,
  rooms = ROOMS,
  guestRooms = [{ adults: 2, children: 0 }],
) =>
  buildBookingResults({
    availability: av,
    rooms,
    guestRooms,
    nights: 2,
    checkIn: "2026-08-04",
    checkOut: "2026-08-06",
    guestsParam: guestRooms.map((r) => `${r.adults}-${r.children}`).join(","),
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
    expect(a.apartment.title).toBe("דירה 1102 · סוויטת הים");
    expect(a.apartment.roomNumber).toBe("1102");
    expect(b.apartment.title).toBe("דירה 1237 · סוויטה משפחתית");
    expect(b.apartment.roomNumber).toBe("1237");
  });

  it("לא מדביק לדירה אחת את הפרופיל של אחרת", () => {
    const { items } = build(
      availability([unit("su-a", ROOM_A, "1102", 1400), unit("su-b", ROOM_B, "1237", 1600)]),
    );
    const titles = items.map((i) => i.apartment.title);
    const images = items.map((i) => i.apartment.images[0].src);
    expect(new Set(titles).size).toBe(items.length);
    expect(new Set(images).size).toBe(items.length);
    expect(items.find((i) => i.roomId === ROOM_A)!.apartment.shortDescription).toBe("מרפסת פונה לים");
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
    const srcs = items[0].apartment.images.map((i) => i.src);
    /* כל תמונה חייבת להיות נתיב GuestHub. תמונות האתר הסטטיות פסולות */
    expect(srcs.every((s) => s.startsWith("/room-images/"))).toBe(true);
    expect(srcs.some((s) => s.includes("/images/"))).toBe(false);
    expect(items[0].apartment.shortDescription).toBe("מרפסת פונה לים");
    /* שם סוג החדר מהזמינות אינו הכותרת */
    expect(items[0].apartment.title).not.toBe("חדר שינה וסלון");
  });

  it("מסנן כתובת תמונה שאינה תואמת את תבנית GuestHub", () => {
    const { items } = build(availability([unit("su-a", ROOM_A, "1102", 1400)]));
    expect(items[0].apartment.images).toHaveLength(1);
    expect(items[0].apartment.images[0].src).not.toContain("..");
  });

  it("מתקנים וגודל מגיעים מהקטלוג", () => {
    const { items } = build(availability([unit("su-a", ROOM_A, "1102", 1400)]));
    expect(items[0].apartment.amenities).toEqual(["מטבחון", "מיזוג"]);
    expect(items[0].apartment.sqm).toBe(55);
    expect(items[0].apartment.guestsMax).toBe(4);
    expect(items[0].apartment.beds).toBe("2 מיטות");
  });

  it("שדה שלא הוגדר ב-GuestHub לא מייצר תווית ריקה", () => {
    const bare = room({ id: ROOM_A, roomNumber: "1102", title: "דירה חשופה" });
    const { items } = build(availability([unit("su-a", ROOM_A, "1102", 1400)]), [bare]);
    expect(items[0].apartment.sqm).toBeNull();
    expect(items[0].apartment.beds).toBeNull();
    expect(items[0].apartment.shortDescription).toBeNull();
    expect(items[0].apartment.amenities).toEqual([]);
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

  it("דירה שאינה מארחת את ההרכב (partyPrices[0] null) לא מקבלת כרטיס — גם כשהסוג מתיר", () => {
    /* הכרטיס לעולם לא מוביל ל-unit_party_mismatch: הדירה שבוחרים חייבת לארח את חדר 1 */
    const { items, availableBeforeJoin } = build(
      availability([unit("su-a", ROOM_A, "1102", 1400, [null]), unit("su-b", ROOM_B, "1237", 1600, [1600])]),
      ROOMS,
      [{ adults: 2, children: 2 }],
    );
    expect(items.map((i) => i.roomId)).toEqual([ROOM_B]);
    expect(availableBeforeJoin).toBe(1);
  });

  it("הסוג לא חוסם: הכשירות היא לפי הדירה, לא לפי maxOccupancy של הסוג (הבאג של 1235)", () => {
    /* הסוג מצהיר 4 אבל GuestHub תמחר את הדירה ל-5+1 — הדירה מוצגת, במחיר שלה */
    const { items } = build(
      availability([unit("su-a", ROOM_A, "1102", 1400, [2600])]),
      ROOMS,
      [{ adults: 5, children: 1 }],
    );
    expect(items.map((i) => i.roomId)).toEqual([ROOM_A]);
    expect(items[0].totalPrice).toBe(2600);
  });

  it("יחידה בלי partyPrices (תשובה בלי guests) לא מקבלת כרטיס — המחיר שלה הוא מחיר 2 המבוגרים הישן", () => {
    const av = availability([]);
    av.roomTypes[0].units = [{ suId: "su-a", roomId: ROOM_A, code: "1102", totalPrice: 1400 }];
    expect(build(av).items).toHaveLength(0);
  });
});

describe("מחיר לפי הרכב — partyPrices בלבד (D195)", () => {
  it("חדר אחד: המחיר ללילה והסה״כ הם partyPrices[0], לא totalPrice", () => {
    /* totalPrice סוטה בכוונה: אם הכרטיס היה קורא אותו, הבדיקה הייתה נופלת */
    const { items } = build(
      availability([unit("su-a", ROOM_A, "1102", 1500, [2700])]),
      ROOMS,
      [{ adults: 2, children: 3 }],
    );
    expect(items[0].totalPrice).toBe(2700);
    expect(items[0].pricePerNight).toBe(1350);
    expect(new URL(items[0].checkoutHref, "https://x.test").searchParams.get("guests")).toBe("2-3");
  });

  it("רב-חדרי, הרכבים שונים: כרטיס רק לדירה שמארחת את חדר 1; הסה״כ = ההקצאה הזולה מ-partyPrices", () => {
    /* חדר 1 = 2+2, חדר 2 = 2+0. הסטודיו מתאים רק לחדר 2 */
    const { items, availableBeforeJoin } = build(
      availability([
        unit("su-a", ROOM_A, "1102", 2400, [2400, 1600]),
        unit("su-b", ROOM_B, "1237", 2400, [2400, 1600]),
        unit("su-s", ROOM_S, "1130", 1600, [null, 1600]),
      ]),
      ROOMS,
      [{ adults: 2, children: 2 }, { adults: 2, children: 0 }],
    );
    expect(items.map((i) => i.roomId).sort()).toEqual([ROOM_A, ROOM_B].sort());
    expect(availableBeforeJoin).toBe(2);
    for (const item of items) {
      expect(item.totalPrice).toBe(2400 + 1600); // חדר 1 בדירה שבכרטיס + הזולה לחדר 2
      expect(item.pricePerNight).toBe(1200); // 2400 / 2 לילות — הדירה שבכרטיס להרכב 2+2
      expect(new URL(item.checkoutHref, "https://x.test").searchParams.get("guests")).toBe("2-2,2-0");
    }
  });

  it("רב-חדרי: דירה שאין לה שילוב תקין לשאר החדרים לא מקבלת כרטיס", () => {
    /* חדר 1 = 2+0, חדר 2 = 2+2. הדירה הגדולה זולה יותר ל-2+0, אבל אם היא
       נלקחת לחדר 1 לא נשאר מי שיארח 2+2 — ולכן הכרטיס הוא לסטודיו, והגדולה
       הולכת לחדר 2 */
    const { items } = build(
      availability([
        unit("su-a", ROOM_A, "1102", 600, [600, 868]),
        unit("su-s", ROOM_S, "1130", 926, [926, null]),
      ]),
      ROOMS,
      [{ adults: 2, children: 0 }, { adults: 2, children: 2 }],
    );
    expect(items.map((i) => i.roomId)).toEqual([ROOM_S]);
    expect(items[0].totalPrice).toBe(926 + 868);
  });
});

describe("דוח ההסתרות לשרת", () => {
  const report = (excluded: Parameters<typeof formatExcludedReport>[0]["excluded"]) =>
    formatExcludedReport({
      excluded,
      availableBeforeJoin: 5,
      checkIn: "2026-08-04",
      checkOut: "2026-08-06",
    });

  it("שקט כשלא הוסתרה אף דירה", () => {
    expect(report([])).toBeNull();
  });

  it("מדווח כל דירה מוסתרת עם המזהה, הסיבה ומה חסר ב-GuestHub", () => {
    const out = report([
      { roomId: ROOM_NO_IMG, code: "1245", reason: "no-public-image" },
      { roomId: "aaaa", code: "1130", reason: "no-public-profile" },
    ])!;
    expect(out).toContain("2 מתוך 5");
    expect(out).toContain("2026-08-04 → 2026-08-06");
    /* מספר הדירה ומזהה החדר — שניהם, כדי שאפשר יהיה לאתר את הרשומה ב-PMS */
    expect(out).toContain("דירה 1245");
    expect(out).toContain(`roomId=${ROOM_NO_IMG}`);
    expect(out).toContain("דירה 1130");
    /* לכל סיבה הסבר בעברית, לא רק המזהה הטכני */
    expect(out).toContain("תמונה פעילה");
    expect(out).toContain("הצג באתר");
  });

  it("מקבץ לפי סיבה וממיין לפי מספר דירה — אותו מצב נותן אותו טקסט", () => {
    const excluded: Parameters<typeof report>[0] = [
      { roomId: "c", code: "1329", reason: "no-public-image" },
      { roomId: "a", code: "1242", reason: "no-public-image" },
      { roomId: "b", code: "1238", reason: "no-public-image" },
    ];
    const out = report(excluded)!;
    expect(out.split("\n").filter((l) => l.includes("דירה "))).toEqual([
      "    · דירה 1238 · roomId=b",
      "    · דירה 1242 · roomId=a",
      "    · דירה 1329 · roomId=c",
    ]);
    /* סדר קלט אחר, אותו פלט */
    expect(report([...excluded].reverse())).toBe(out);
  });

  it("הדוח נשאר בשרת — בונה התוצאות לא מחזיר אותו לכרטיסים", () => {
    const { items, excluded } = build(
      availability([unit("su-a", ROOM_A, "1102", 1400), unit("su-n", ROOM_NO_IMG, "1245", 1400)]),
    );
    expect(excluded).toHaveLength(1);
    expect(JSON.stringify(items)).not.toContain("1245");
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
