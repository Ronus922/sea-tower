import { describe, expect, it } from "vitest";
import { assignUnitsToRooms } from "./unit-assignment";
import type { AvailableUnit } from "./booking-api";

/* השתקפות של assign-units.ts ב-GuestHub (D195). אותם מקרים שהגארד
   check:public-availability-guests בודק שם — כדי ששני הצדדים יסכימו תמיד על
   איזו דירה משרתת איזה חדר, ולכן על expectedTotal. */

const u = (suId: string, partyPrices?: Array<number | null>): AvailableUnit => ({
  suId,
  roomId: `room-${suId}`,
  code: suId,
  totalPrice: partyPrices?.find((p): p is number => p !== null) ?? 0,
  ...(partyPrices ? { partyPrices } : {}),
});

/* brute force עצמאי: כל הסידורים של יחידות שונות, המינימום של הסכום */
function bruteBest(units: AvailableUnit[], rooms: number, fixedFirst: string | null = null): number | null {
  let best: number | null = null;
  const rec = (i: number, chosen: AvailableUnit[], total: number) => {
    if (i === rooms) {
      if (best === null || total < best) best = total;
      return;
    }
    for (const x of units) {
      const price = x.partyPrices?.[i] ?? null;
      if (chosen.includes(x) || price === null) continue;
      if (i === 0 && fixedFirst && x.suId !== fixedFirst) continue;
      rec(i + 1, [...chosen, x], total + price);
    }
  };
  rec(0, [], 0);
  return best;
}

describe("הקצאת דירות לחדרים", () => {
  const A = u("A", [600, 868]); // גדולה, זולה
  const B = u("B", [640, 900]); // גדולה
  const S = u("S", [926, null]); // סטודיו — רק 2+0

  it("חדר אחד: הדירה שנבחרה, במחיר partyPrices[0]", () => {
    const r = assignUnitsToRooms([A, B, S], 1, "B");
    expect(r).toEqual({ ok: true, units: [B], prices: [640], total: 640 });
  });

  it("חדר אחד בלי בחירה: הזולה שמארחת את ההרכב", () => {
    const r = assignUnitsToRooms([S, B, A], 1, null);
    expect(r.ok && r.units.map((x) => x.suId)).toEqual(["A"]);
  });

  it("הרכבים שווים: בדיוק N היחידות הזולות, הדירה שנבחרה קודם", () => {
    const eq = [u("P", [700, 700]), u("Q", [650, 650]), u("R", [900, 900])];
    const r = assignUnitsToRooms(eq, 2, "R");
    expect(r.ok && r.units.map((x) => x.suId)).toEqual(["R", "Q"]);
    expect(r.ok && r.total).toBe(1550);
  });

  it("השילוב הזול ביותר — brute force מסכים, לכל דירה נבחרת", () => {
    for (const pref of [null, "A", "B"]) {
      const r = assignUnitsToRooms([A, B, S], 2, pref);
      expect(r.ok).toBe(true);
      expect(r.ok && r.total).toBe(bruteBest([A, B, S], 2, pref));
      expect(r.ok && r.units[0].partyPrices?.[0]).not.toBeNull();
      expect(r.ok && r.units[1].partyPrices?.[1]).not.toBeNull();
      expect(r.ok && new Set(r.units.map((x) => x.suId)).size).toBe(2);
    }
  });

  it("המלכודת של בחירה חמדנית: הזולה לחדר 1 נשמרת לחדר 2 כשרק היא מארחת אותו", () => {
    /* A זולה מ-S ל-2+0, אבל רק A מארחת 2+2 — S לחדר 1, A לחדר 2 */
    const r = assignUnitsToRooms([A, S], 2, null);
    expect(r.ok && r.units.map((x) => x.suId)).toEqual(["S", "A"]);
    expect(r.ok && r.prices).toEqual([926, 868]);
    expect(r.ok && r.total).toBe(1794);
  });

  it("הדירה שנבחרה לא מארחת את חדר 1 — שגיאה מפורשת, לא החלפה", () => {
    /* S נבחרה כשחדר 1 הוא 2+2 (partyPrices[0] null) */
    const S22 = u("S", [null, 926]);
    expect(assignUnitsToRooms([A, S22], 2, "S")).toEqual({ ok: false, reason: "preferred_mismatch" });
    expect(assignUnitsToRooms([S22], 1, "S")).toEqual({ ok: false, reason: "preferred_mismatch" });
    /* ולעומת זאת S שנבחרה כשחדר 1 הוא 2+0 — מכובדת, ו-A הולכת לחדר 2 */
    const r = assignUnitsToRooms([A, S], 2, "S");
    expect(r.ok && r.units.map((x) => x.suId)).toEqual(["S", "A"]);
  });

  it("הדירה שנבחרה לא ברשימה", () => {
    expect(assignUnitsToRooms([A, B], 1, "zzz")).toEqual({ ok: false, reason: "preferred_unavailable" });
  });

  it("אין שילוב: הדירה שנבחרה משאירה חדר בלי דירה מתאימה", () => {
    /* A לחדר 1 (2+0) → לחדר 2 (2+2) נשארת רק S, שלא מארחת */
    expect(assignUnitsToRooms([A, S], 2, "A")).toEqual({ ok: false, reason: "no_combination" });
    expect(assignUnitsToRooms([A], 2, null)).toEqual({ ok: false, reason: "no_combination" });
  });

  it("יחידות בלי partyPrices (תשובה בלי guests) לא מארחות אף חדר", () => {
    expect(assignUnitsToRooms([u("X"), u("Y")], 1, null)).toEqual({ ok: false, reason: "no_combination" });
    expect(assignUnitsToRooms([u("X")], 1, "X")).toEqual({ ok: false, reason: "preferred_mismatch" });
  });

  it("מספר חדרים מחוץ לגבולות GuestHub (1–5)", () => {
    expect(assignUnitsToRooms([A], 0, null)).toEqual({ ok: false, reason: "no_combination" });
    expect(assignUnitsToRooms([A], 6, null)).toEqual({ ok: false, reason: "no_combination" });
  });

  it("הסכום הוא סכום partyPrices של ההקצאה, בדיוק — בלי חישוב אחר", () => {
    const r = assignUnitsToRooms([u("C", [1000.5, 700.25]), u("D", [999, 650.1])], 2, "C");
    expect(r.ok && r.prices).toEqual([1000.5, 650.1]);
    expect(r.ok && r.total).toBe(1650.6);
  });
});
