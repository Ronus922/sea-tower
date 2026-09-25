import type { AvailableUnit } from "./booking-api";

/* איזו דירה משרתת איזה חדר — השתקפות מדויקת של הכלל ב-GuestHub
   (src/lib/public-booking/assign-units.ts, D195). ההזמנה ב-GuestHub מריצה את
   אותו כלל על אותה רשימת יחידות, ולכן הסכום שמוצג כאן הוא הסכום שההזמנה
   תיסגר עליו. כל מחיר מגיע מ-partyPrices כמו שהוא — אין כאן תמחור.

   הכלל:
   1. הדירה שנבחרה בכרטיס משרתת את חדר 1. היא חייבת להיות ברשימה ולארח את
      ההרכב של חדר 1 (partyPrices[0] מספר) — אחרת שגיאה מפורשת, לא החלפה.
   2. שאר החדרים מקבלים את השילוב התקין הזול ביותר מהיחידות שנותרו: מינימום של
      Σ partyPrices[i], כל יחידה פעם אחת לכל היותר. שוויון: השילוב שנמצא ראשון
      כשמנסים יחידות לפי סדר הרשימה (מחיר ↑, קוד), חדר אחרי חדר.
   עם הרכבים שווים זו בדיוק בחירת "N היחידות הזולות" הקודמת. */

export const MAX_BOOKING_ROOMS = 5;

export type UnitAssignment =
  | { ok: true; units: AvailableUnit[]; prices: number[]; total: number }
  | { ok: false; reason: "preferred_unavailable" | "preferred_mismatch" | "no_combination" };

export function assignUnitsToRooms(
  offered: AvailableUnit[],
  roomCount: number,
  preferredSuId: string | null,
): UnitAssignment {
  /* יחידה בלי partyPrices (תשובה שנשלחה בלי guests) לא מארחת אף חדר — המחיר
     שלה הוא מחיר 2 המבוגרים ההיסטורי, בדיוק הבאג ש-D195 סגר */
  const priceOf = (u: AvailableUnit, room: number): number | null => u.partyPrices?.[room] ?? null;
  if (roomCount < 1 || roomCount > MAX_BOOKING_ROOMS) return { ok: false, reason: "no_combination" };

  const fixed: AvailableUnit[] = [];
  if (preferredSuId) {
    const pref = offered.find((u) => u.suId === preferredSuId);
    if (!pref) return { ok: false, reason: "preferred_unavailable" };
    if (priceOf(pref, 0) === null) return { ok: false, reason: "preferred_mismatch" };
    fixed.push(pref);
  }
  const rest = offered.filter((u) => u !== fixed[0]);

  /* חיפוש ממצה על ≤ MAX_BOOKING_ROOMS חדרים; המחירים חיוביים, ולכן סכום חלקי
     שכבר הגיע לטוב ביותר לא ישתפר (גיזום) */
  const best: { units: AvailableUnit[] | null; total: number } = { units: null, total: Infinity };
  const chosen: AvailableUnit[] = [];
  const used = new Set<string>();
  const walk = (room: number, total: number): void => {
    if (total >= best.total) return;
    if (room === roomCount) {
      best.units = [...chosen];
      best.total = total;
      return;
    }
    for (const u of rest) {
      if (used.has(u.suId)) continue;
      const price = priceOf(u, room);
      if (price === null) continue;
      used.add(u.suId);
      chosen.push(u);
      walk(room + 1, total + price);
      chosen.pop();
      used.delete(u.suId);
    }
  };
  walk(fixed.length, 0);
  if (!best.units) return { ok: false, reason: "no_combination" };

  const units = [...fixed, ...best.units];
  const prices = units.map((u, i) => priceOf(u, i) as number);
  const total = Math.round(prices.reduce((s, x) => s + x, 0) * 100) / 100;
  return { ok: true, units, prices, total };
}
