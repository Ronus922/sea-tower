/* חוקי העימוד של דפדפן המאמרים — מודול טהור כדי שגם הקומפוננטה וגם
   הטסטים ניזונים מאותו מקור אמת (בלי לייבא קומפוננטת client לטסט).

   הדרישה (2026-08-15): עד 16 מאמרים רלוונטיים בכל תצוגת קטגוריה/טאב.
   כשיש פחות מ-16 אמיתיים — מציגים את המספר האמיתי; לעולם לא משכפלים
   ולא ממציאים מאמרים כדי להגיע ל-16. */

export const PAGE_SIZE = 16;

export function totalPagesFor(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

/* האם פריט באינדקס i (בתוך הרשימה המסוננת) שייך לעמוד current (1-based) */
export function isOnPage(index: number, current: number): boolean {
  return index >= (current - 1) * PAGE_SIZE && index < current * PAGE_SIZE;
}
