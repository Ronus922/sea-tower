import { describe, expect, it } from 'vitest';
import {
  addDays, addMonths, daysInMonth, diffDays, firstWeekday, formatLong, formatRangeText,
  formatShort, isValidKey, key, monthOf, monthRows, monthTitle, parse, todayKey,
} from './dateUtils';

describe('dateUtils — מחרוזות YYYY-MM-DD בלבד', () => {
  it('key / parse הם הופכיים', () => {
    expect(key(2026, 9, 4)).toBe('2026-10-04');
    expect(key(2026, 0, 1)).toBe('2026-01-01');
    expect(parse('2026-10-04')).toEqual({ y: 2026, m: 9, d: 4 });
  });

  it('isValidKey מזהה מחרוזות תקינות בלבד', () => {
    expect(isValidKey('2026-10-04')).toBe(true);
    expect(isValidKey('2026-02-29')).toBe(false);
    expect(isValidKey('2028-02-29')).toBe(true);
    expect(isValidKey('2026-13-01')).toBe(false);
    expect(isValidKey('04/10/2026')).toBe(false);
    expect(isValidKey(null)).toBe(false);
  });

  it('addDays חוצה חודש ושנה', () => {
    expect(addDays('2026-10-04', 6)).toBe('2026-10-10');
    expect(addDays('2026-10-28', 6)).toBe('2026-11-03');
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2027-01-02', -3)).toBe('2026-12-30');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('addDays לא מושפע ממעבר שעון קיץ/חורף (DST)', () => {
    // ישראל: מעבר לשעון חורף סביב סוף אוקטובר; חישוב ב-UTC מחזיר יום שלם תמיד
    expect(addDays('2026-10-24', 1)).toBe('2026-10-25');
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
    expect(addDays('2026-03-27', 1)).toBe('2026-03-28');
  });

  it('diffDays = לילות כש-end הוא יום העזיבה', () => {
    expect(diffDays('2026-10-04', '2026-10-10')).toBe(6);
    expect(diffDays('2026-10-04', '2026-10-05')).toBe(1);
    expect(diffDays('2026-12-28', '2027-01-03')).toBe(6);
    expect(diffDays('2026-10-10', '2026-10-04')).toBe(-6);
    expect(diffDays('2026-10-24', '2026-10-26')).toBe(2);
  });

  it('daysInMonth / firstWeekday / monthRows', () => {
    expect(daysInMonth(2026, 9)).toBe(31);
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2028, 1)).toBe(29);
    expect(firstWeekday(2026, 9)).toBe(4); // 1.10.2026 = יום חמישי
    expect(firstWeekday(2026, 10)).toBe(0); // 1.11.2026 = יום ראשון
    expect(monthRows(2026, 9)).toBe(5);
    expect(monthRows(2026, 10)).toBe(5);
    expect(monthRows(2026, 7)).toBe(6); // אוגוסט 2026 מתחיל בשבת, 31 ימים → 6 שורות
  });

  it('addMonths חוצה שנים לשני הכיוונים', () => {
    expect(addMonths(2026, 11, 1)).toEqual({ y: 2027, m: 0 });
    expect(addMonths(2027, 0, -1)).toEqual({ y: 2026, m: 11 });
    expect(addMonths(2026, 9, 3)).toEqual({ y: 2027, m: 0 });
    expect(addMonths(2026, 0, -13)).toEqual({ y: 2024, m: 11 });
  });

  it('monthOf', () => {
    expect(monthOf('2026-10-04')).toEqual({ y: 2026, m: 9 });
  });

  it('todayKey משתמש ברכיבי התאריך המקומי ולא ב-toISOString', () => {
    // 23:30 בזמן מקומי — toISOString היה עלול להחזיר את היום הבא
    expect(todayKey(new Date(2026, 9, 4, 23, 30))).toBe('2026-10-04');
    expect(todayKey(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
  });

  it('פורמטים', () => {
    expect(formatShort('2026-10-04')).toBe('04/10/2026');
    expect(formatLong('2026-10-04', false)).toBe('4 באוקטובר');
    expect(formatLong('2026-10-04', true)).toBe('4 באוקטובר 2026');
    expect(monthTitle(2026, 9)).toBe('אוקטובר 2026');
    expect(monthTitle(2027, 0)).toBe('ינואר 2027');
  });

  it('formatRangeText — אותה שנה, שנים שונות, רק הגעה, ריק', () => {
    expect(formatRangeText('2026-10-04', '2026-10-10')).toBe('4 באוקטובר – 10 באוקטובר 2026');
    expect(formatRangeText('2026-12-28', '2027-01-03')).toBe('28 בדצמבר 2026 – 3 בינואר 2027');
    expect(formatRangeText('2026-10-04', null)).toBe('4 באוקטובר 2026 – בחרו תאריך יציאה');
    expect(formatRangeText(null, null)).toBe('בחרו תאריכים');
    expect(formatRangeText(null, null, 'טווח דוח')).toBe('טווח דוח');
  });
});
