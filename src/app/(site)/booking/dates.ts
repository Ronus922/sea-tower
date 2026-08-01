/* עזרי תאריכים לעמוד ההזמנות — פונקציות טהורות, בטוחות לקליינט ולשרת */

export const HE_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
] as const;

export const HE_WEEKDAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"] as const;

/* "YYYY-MM-DD" בלבד — כל התאריכים בעמוד עוברים כמחרוזות date-only */
export function isDateOnly(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
}

export function todayInIsrael(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());
}

export function addDays(d: string, days: number): string {
  const t = new Date(`${d}T12:00:00Z`);
  t.setUTCDate(t.getUTCDate() + days);
  return t.toISOString().slice(0, 10);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round(
    (Date.parse(`${checkOut}T12:00:00Z`) - Date.parse(`${checkIn}T12:00:00Z`)) / 86_400_000,
  );
}

/* "28 ביוני" */
export function fmtHe(d: string): string {
  return `${Number(d.slice(8, 10))} ב${HE_MONTHS[Number(d.slice(5, 7)) - 1]}`;
}

/* "28 ביוני – 1 ביולי" */
export function fmtRange(checkIn: string, checkOut: string): string {
  return `${fmtHe(checkIn)} – ${fmtHe(checkOut)}`;
}

/* "יום א׳, 28 ביוני" */
export function fmtHeWithDay(d: string): string {
  const HE_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "שבת"];
  const idx = new Date(`${d}T12:00:00Z`).getUTCDay();
  return `יום ${HE_DAYS[idx]}, ${fmtHe(d)}`;
}

/* הרכב חדרים ב-URL: "2-0,2-1" = שני חדרים, (2 מבוגרים) + (2 מבוגרים וילד) */
export type RoomParty = { adults: number; children: number };

export function parseGuestsParam(raw: string | undefined): RoomParty[] {
  const rooms = (raw ?? "")
    .split(",")
    .map((part) => {
      const m = /^([1-6])-([0-4])$/.exec(part.trim());
      return m ? { adults: Number(m[1]), children: Number(m[2]) } : null;
    })
    .filter((r): r is RoomParty => r !== null);
  return rooms.length >= 1 && rooms.length <= 5 ? rooms : [{ adults: 2, children: 0 }];
}

export function guestsParam(rooms: RoomParty[]): string {
  return rooms.map((r) => `${r.adults}-${r.children}`).join(",");
}

/* "2 מבוגרים · ילד אחד · חדר אחד" */
export function guestsSummary(rooms: RoomParty[]): string {
  const adults = rooms.reduce((s, r) => s + r.adults, 0);
  const children = rooms.reduce((s, r) => s + r.children, 0);
  const parts = [adults === 1 ? "מבוגר אחד" : `${adults} מבוגרים`];
  if (children > 0) parts.push(children === 1 ? "ילד אחד" : `${children} ילדים`);
  parts.push(rooms.length === 1 ? "חדר אחד" : `${rooms.length} חדרים`);
  return parts.join(" · ");
}
