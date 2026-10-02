import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { DateRange } from './types';
import {
  DEFAULT_RULES, buildMonths, effectiveEnd, isDateBlocked, isDateSelectable, monthSequence,
  nightsOf, pickRange, resolveEnd, setNightsRange, useRangeSelection, type RangeRules,
} from './useRangeSelection';

const empty: DateRange = { start: null, end: null };
const TODAY = '2026-07-04';

describe('pickRange — לוגיקת הלחיצה מהדמו', () => {
  it('לחיצה ראשונה = הגעה, היציאה מתאפסת', () => {
    expect(pickRange(empty, '2026-10-04')).toEqual({ start: '2026-10-04', end: null });
  });

  it('לחיצה שנייה על תאריך מאוחר = יציאה והטווח ננעל', () => {
    expect(pickRange({ start: '2026-10-04', end: null }, '2026-10-10')).toEqual({
      start: '2026-10-04',
      end: '2026-10-10',
    });
  });

  it('לחיצה על תאריך מוקדם מחליפה את ההגעה', () => {
    expect(pickRange({ start: '2026-10-10', end: null }, '2026-10-04')).toEqual({
      start: '2026-10-04',
      end: null,
    });
  });

  it('לחיצה על אותו תאריך לא יוצרת 0 לילות — נשאר הגעה בלבד', () => {
    expect(pickRange({ start: '2026-10-04', end: null }, '2026-10-04')).toEqual({
      start: '2026-10-04',
      end: null,
    });
  });

  it('לחיצה שלישית כשיש טווח מלא מתחילה בחירה חדשה', () => {
    expect(pickRange({ start: '2026-10-04', end: '2026-10-10' }, '2026-10-20')).toEqual({
      start: '2026-10-20',
      end: null,
    });
    expect(pickRange({ start: '2026-10-04', end: '2026-10-10' }, '2026-10-01')).toEqual({
      start: '2026-10-01',
      end: null,
    });
  });

  it('שנה קדימה: אין מקסימום לילות בלוח', () => {
    const r = pickRange({ start: '2026-10-04', end: null }, '2027-10-04');
    expect(r).toEqual({ start: '2026-10-04', end: '2027-10-04' });
    expect(nightsOf(r)).toBe(365);
    expect(setNightsRange(r, 366)).toEqual({ start: '2026-10-04', end: '2027-10-05' });
    expect(setNightsRange(r, 1000)).toEqual({ start: '2026-10-04', end: '2029-06-30' });
  });

  it('מעבר שנה: דצמבר → ינואר נותן את הלילות הנכונים', () => {
    const r = pickRange({ start: '2026-12-28', end: null }, '2027-01-03');
    expect(r).toEqual({ start: '2026-12-28', end: '2027-01-03' });
    expect(nightsOf(r)).toBe(6);
  });
});

describe('חסימות — minDate / maxDate / isDateDisabled', () => {
  const closed = (d: string) => d === '2026-10-07';
  const rules: RangeRules = { ...DEFAULT_RULES, minDate: '2026-10-02', isDateDisabled: closed };

  it('isDateBlocked: לפני minDate, אחרי maxDate, חסימה נקודתית', () => {
    expect(isDateBlocked('2026-10-01', rules)).toBe(true);
    expect(isDateBlocked('2026-10-02', rules)).toBe(false);
    expect(isDateBlocked('2026-10-07', rules)).toBe(true);
    expect(isDateBlocked('2026-10-31', { ...DEFAULT_RULES, maxDate: '2026-10-30' })).toBe(true);
    expect(isDateBlocked('2026-10-30', { ...DEFAULT_RULES, maxDate: '2026-10-30' })).toBe(false);
  });

  it('טווח לא חוצה חסימה: היציאה נקבעת עד התאריך החסום הראשון', () => {
    expect(resolveEnd('2026-10-04', '2026-10-10', rules)).toBe('2026-10-07');
    expect(resolveEnd('2026-10-04', '2026-10-06', rules)).toBe('2026-10-06');
    expect(pickRange({ start: '2026-10-04', end: null }, '2026-10-10', rules)).toEqual({
      start: '2026-10-04',
      end: '2026-10-07',
    });
  });

  it('תצוגה מקדימה (hover) מכבדת את אותה חסימה', () => {
    expect(effectiveEnd({ start: '2026-10-04', end: null }, '2026-10-10', rules)).toBe('2026-10-07');
    expect(effectiveEnd({ start: '2026-10-04', end: null }, '2026-10-02', rules)).toBeNull();
    expect(effectiveEnd({ start: '2026-10-04', end: '2026-10-06' }, '2026-10-20', rules)).toBe('2026-10-06');
  });

  it('maxDate גוזר את היציאה', () => {
    const r: RangeRules = { ...DEFAULT_RULES, maxDate: '2026-10-08' };
    expect(resolveEnd('2026-10-04', '2026-10-10', r)).toBe('2026-10-08');
    expect(resolveEnd('2026-10-08', '2026-10-10', r)).toBeNull();
  });

  it('isDateSelectable: חסום אינו לחיץ, כל השאר לחיץ (אין מינימום לילות מעבר ל-1)', () => {
    expect(isDateSelectable('2026-10-01', rules)).toBe(false);
    expect(isDateSelectable('2026-10-07', rules)).toBe(false);
    expect(isDateSelectable('2026-10-05', rules)).toBe(true);
    expect(isDateSelectable('2026-10-05', DEFAULT_RULES)).toBe(true);
  });
});

describe('setNightsRange — הסטפר משנה רק את היציאה', () => {
  it('start + n', () => {
    expect(setNightsRange({ start: '2026-10-04', end: '2026-10-10' }, 7)).toEqual({
      start: '2026-10-04',
      end: '2026-10-11',
    });
    expect(setNightsRange({ start: '2026-10-04', end: '2026-10-10' }, 5)).toEqual({
      start: '2026-10-04',
      end: '2026-10-09',
    });
  });

  it('גבולות: מינימום 1 תמיד; מקסימום רק אם maxNights הוגדר', () => {
    expect(setNightsRange({ start: '2026-10-04', end: '2026-10-05' }, 0)).toEqual({
      start: '2026-10-04',
      end: '2026-10-05',
    });
    expect(setNightsRange({ start: '2026-10-04', end: '2026-10-05' }, -5)).toEqual({
      start: '2026-10-04',
      end: '2026-10-05',
    });
    // בלי maxNights — אין תקרה
    expect(setNightsRange({ start: '2026-10-04', end: '2026-10-10' }, 99)).toEqual({
      start: '2026-10-04',
      end: '2027-01-11',
    });
    expect(setNightsRange({ start: '2026-10-04', end: '2026-10-10' }, 99, { maxNights: 10 })).toEqual({
      start: '2026-10-04',
      end: '2026-10-14',
    });
  });

  it('בלי הגעה — לא משתנה', () => {
    expect(setNightsRange(empty, 3)).toEqual(empty);
  });

  it('לא חוצה חסימה', () => {
    const rules: RangeRules = { ...DEFAULT_RULES, isDateDisabled: (d) => d === '2026-10-07' };
    expect(setNightsRange({ start: '2026-10-04', end: '2026-10-06' }, 6, rules)).toEqual({
      start: '2026-10-04',
      end: '2026-10-07',
    });
  });

  it('מעבר שנה בסטפר', () => {
    expect(setNightsRange({ start: '2026-12-30', end: '2026-12-31' }, 3)).toEqual({
      start: '2026-12-30',
      end: '2027-01-02',
    });
  });
});

describe('buildMonths — הפס (band) ומצבי התא', () => {
  const ctx = (range: DateRange, effEnd: string | null, rules: RangeRules = DEFAULT_RULES) => ({
    range,
    effEnd,
    today: TODAY,
    rules,
  });
  const cell = (months: ReturnType<typeof buildMonths>, k: string) => {
    for (const m of months) {
      const c = m.cells.find((x) => x.key === k);
      if (c) return c;
    }
    throw new Error(`cell ${k} not found`);
  };

  it('4→10 באוקטובר: 6 לילות, פס רציף, שני הקצוות כחולים', () => {
    const range = { start: '2026-10-04', end: '2026-10-10' };
    const months = buildMonths([{ y: 2026, m: 9 }], true, ctx(range, range.end));
    expect(nightsOf(range)).toBe(6);
    expect(cell(months, '2026-10-04')).toMatchObject({ band: 'bs', state: 'sel' });
    for (const d of ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09']) {
      expect(cell(months, d)).toMatchObject({ band: 'in', state: '' });
    }
    expect(cell(months, '2026-10-10')).toMatchObject({ band: 'be', state: 'sel' });
    expect(cell(months, '2026-10-03')).toMatchObject({ band: '', state: '' });
    expect(cell(months, '2026-10-11')).toMatchObject({ band: '', state: '' });
  });

  it('רק הגעה, בלי hover: אין פס בכלל', () => {
    const range = { start: '2026-10-04', end: null };
    const months = buildMonths([{ y: 2026, m: 9 }], true, ctx(range, null));
    expect(cell(months, '2026-10-04')).toMatchObject({ band: '', state: 'sel' });
    expect(cell(months, '2026-10-05').band).toBe('');
  });

  it('תצוגה מקדימה: היציאה המרחפת מקבלת prev, הפס נמשך עד אליה', () => {
    const range = { start: '2026-10-04', end: null };
    const months = buildMonths([{ y: 2026, m: 9 }], true, ctx(range, '2026-10-08'));
    expect(cell(months, '2026-10-04')).toMatchObject({ band: 'bs', state: 'sel' });
    expect(cell(months, '2026-10-06').band).toBe('in');
    expect(cell(months, '2026-10-08')).toMatchObject({ band: 'be', state: 'prev' });
  });

  it('טווח שחוצה שורה וחודש (28/10 → 3/11) ממשיך בשני החודשים', () => {
    const range = { start: '2026-10-28', end: '2026-11-03' };
    const months = buildMonths([{ y: 2026, m: 9 }, { y: 2026, m: 10 }], true, ctx(range, range.end));
    expect(cell(months, '2026-10-28')).toMatchObject({ band: 'bs', state: 'sel' });
    expect(cell(months, '2026-10-31').band).toBe('in');
    expect(cell(months, '2026-11-01').band).toBe('in');
    expect(cell(months, '2026-11-02').band).toBe('in');
    expect(cell(months, '2026-11-03')).toMatchObject({ band: 'be', state: 'sel' });
  });

  it('דסקטופ: גובה אחיד — שני החודשים מקבלים את מספר השורות המקסימלי; מובייל: לכל חודש משלו', () => {
    // אוגוסט 2026 = 6 שורות, ספטמבר 2026 = 5 שורות
    const uniform = buildMonths([{ y: 2026, m: 7 }, { y: 2026, m: 8 }], true, ctx(empty, null));
    expect(uniform.map((m) => m.rows)).toEqual([6, 6]);
    expect(uniform.map((m) => m.cells.length)).toEqual([42, 42]);
    const own = buildMonths([{ y: 2026, m: 7 }, { y: 2026, m: 8 }], false, ctx(empty, null));
    expect(own.map((m) => m.rows)).toEqual([6, 5]);
  });

  it('כותרות עם שנה ומעבר דצמבר → ינואר', () => {
    const months = buildMonths(monthSequence({ y: 2026, m: 11 }, 2), true, ctx(empty, null));
    expect(months.map((m) => m.title)).toEqual(['דצמבר 2026', 'ינואר 2027']);
    expect(months[1]).toMatchObject({ y: 2027, m: 0 });
  });

  it('היום מסומן today; תאריך לפני minDate וחסימה נקודתית — disabled', () => {
    const rules: RangeRules = { ...DEFAULT_RULES, minDate: '2026-07-04', isDateDisabled: (d) => d === '2026-07-10' };
    const months = buildMonths([{ y: 2026, m: 6 }], true, ctx(empty, null, rules));
    expect(cell(months, '2026-07-04')).toMatchObject({ state: 'today', disabled: false });
    expect(cell(months, '2026-07-03').disabled).toBe(true);
    expect(cell(months, '2026-07-10').disabled).toBe(true);
    expect(cell(months, '2026-07-11').disabled).toBe(false);
  });

  it('תאים ריקים לפני תחילת החודש ואחרי סופו; aria-label מלא', () => {
    const months = buildMonths([{ y: 2026, m: 9 }], true, ctx(empty, null));
    // אוקטובר 2026 מתחיל ביום חמישי → 4 תאים ריקים
    expect(months[0].cells.slice(0, 4).every((c) => c.key === null)).toBe(true);
    expect(months[0].cells[4]).toMatchObject({ key: '2026-10-01', day: 1, label: '1 באוקטובר 2026' });
    expect(months[0].cells.filter((c) => c.key).length).toBe(31);
  });

  it('monthSequence חוצה שנה', () => {
    expect(monthSequence({ y: 2026, m: 10 }, 3)).toEqual([
      { y: 2026, m: 10 },
      { y: 2026, m: 11 },
      { y: 2027, m: 0 },
    ]);
  });
});

describe('useRangeSelection — ה-hook', () => {
  function setup(initial: DateRange, extra: Partial<Parameters<typeof useRangeSelection>[0]> = {}) {
    let value = initial;
    const onChange = vi.fn((r: DateRange) => {
      value = r;
      hook.rerender({ value });
    });
    const hook = renderHook(
      (p: { value: DateRange }) => useRangeSelection({ value: p.value, onChange, ...extra }),
      { initialProps: { value } },
    );
    return { hook, onChange, get value() { return value; } };
  }

  it('בחירת טווח בשתי לחיצות דרך onChange', () => {
    const s = setup(empty);
    act(() => s.hook.result.current.pick('2026-10-04'));
    expect(s.value).toEqual({ start: '2026-10-04', end: null });
    act(() => s.hook.result.current.pick('2026-10-10'));
    expect(s.value).toEqual({ start: '2026-10-04', end: '2026-10-10' });
    expect(s.hook.result.current.nights).toBe(6);
    expect(s.hook.result.current.canCommit).toBe(true);
  });

  it('לחיצה על תאריך חסום לא עושה כלום', () => {
    const s = setup(empty, { minDate: '2026-10-05' });
    act(() => s.hook.result.current.pick('2026-10-04'));
    expect(s.onChange).not.toHaveBeenCalled();
  });

  it('hover מצייר תצוגה מקדימה רק אחרי הגעה ולפני יציאה', () => {
    const s = setup(empty);
    act(() => s.hook.result.current.setHover('2026-10-08'));
    expect(s.hook.result.current.effEnd).toBeNull();
    act(() => s.hook.result.current.pick('2026-10-04'));
    act(() => s.hook.result.current.setHover('2026-10-08'));
    expect(s.hook.result.current.effEnd).toBe('2026-10-08');
    act(() => s.hook.result.current.setHover('2026-10-02'));
    expect(s.hook.result.current.effEnd).toBeNull();
    act(() => s.hook.result.current.setHover(null));
    expect(s.hook.result.current.hover).toBeNull();
  });

  it('סטפר: הכפתורים נעולים בלי טווח, מינימום 1, מקסימום maxNights; setNights עובד גם עם הגעה בלבד', () => {
    const s = setup({ start: '2026-10-04', end: null }, { maxNights: 3 });
    expect(s.hook.result.current.canDec).toBe(false);
    expect(s.hook.result.current.canInc).toBe(false);
    act(() => s.hook.result.current.setNights(2));
    expect(s.value).toEqual({ start: '2026-10-04', end: '2026-10-06' });
    const none = setup(empty);
    act(() => none.hook.result.current.setNights(2));
    expect(none.onChange).not.toHaveBeenCalled();
    act(() => s.hook.result.current.pick('2026-10-04'));
    act(() => s.hook.result.current.pick('2026-10-04'));
    expect(s.value).toEqual({ start: '2026-10-04', end: null });

    act(() => s.hook.result.current.pick('2026-10-05'));
    expect(s.hook.result.current.nights).toBe(1);
    expect(s.hook.result.current.canDec).toBe(false);
    expect(s.hook.result.current.canInc).toBe(true);

    act(() => s.hook.result.current.setNights(3));
    expect(s.value).toEqual({ start: '2026-10-04', end: '2026-10-07' });
    expect(s.hook.result.current.canInc).toBe(false);
    act(() => s.hook.result.current.setNights(4));
    expect(s.value.end).toBe('2026-10-07');
  });

  it('בלי maxNights: "+" לא נעול לעולם; "−" נעול בלילה אחד', () => {
    const s = setup({ start: '2026-10-04', end: '2026-11-13' });
    expect(s.hook.result.current.nights).toBe(40);
    expect(s.hook.result.current.canInc).toBe(true);
    const year = setup({ start: '2026-10-04', end: '2027-10-04' });
    expect(year.hook.result.current.nights).toBe(365);
    expect(year.hook.result.current.canInc).toBe(true);
    expect(year.hook.result.current.canDec).toBe(true);
    act(() => s.hook.result.current.setNights(41));
    expect(s.value.end).toBe('2026-11-14');
    const one = setup({ start: '2026-10-04', end: '2026-10-05' });
    expect(one.hook.result.current.canDec).toBe(false);
    expect(one.hook.result.current.canInc).toBe(true);
  });

  it('סטפר: "+" נעול כשהלילה הבא חסום או כש-maxDate נגמר', () => {
    const blocked = setup({ start: '2026-10-04', end: '2026-10-07' }, { isDateDisabled: (d) => d === '2026-10-07' });
    expect(blocked.hook.result.current.canInc).toBe(false);
    expect(blocked.hook.result.current.canDec).toBe(true);
    const capped = setup({ start: '2026-10-04', end: '2026-10-08' }, { maxDate: '2026-10-08' });
    expect(capped.hook.result.current.canInc).toBe(false);
  });

  it('ביטול משחזר את הערך מהפתיחה (snapshot) ומחזיר אותו', () => {
    const s = setup({ start: '2026-10-04', end: '2026-10-10' });
    act(() => s.hook.result.current.snapshot());
    act(() => s.hook.result.current.pick('2026-10-20'));
    act(() => s.hook.result.current.pick('2026-10-25'));
    expect(s.value).toEqual({ start: '2026-10-20', end: '2026-10-25' });
    let restored: DateRange | undefined;
    act(() => {
      restored = s.hook.result.current.cancel();
    });
    expect(restored).toEqual({ start: '2026-10-04', end: '2026-10-10' });
    expect(s.value).toEqual({ start: '2026-10-04', end: '2026-10-10' });
  });

  it('ביטול בלי שינוי לא קורא ל-onChange', () => {
    const s = setup({ start: '2026-10-04', end: '2026-10-10' });
    act(() => s.hook.result.current.snapshot());
    act(() => s.hook.result.current.cancel());
    expect(s.onChange).not.toHaveBeenCalled();
  });

  it('commit שומר את הטווח כבסיס חדש, וביטול אחריו לא מחזיר אחורה', () => {
    const s = setup({ start: '2026-10-04', end: '2026-10-10' });
    act(() => s.hook.result.current.snapshot());
    act(() => s.hook.result.current.pick('2026-10-20'));
    act(() => s.hook.result.current.pick('2026-10-22'));
    let committed: DateRange | undefined;
    act(() => {
      committed = s.hook.result.current.commit();
    });
    expect(committed).toEqual({ start: '2026-10-20', end: '2026-10-22' });
    s.onChange.mockClear();
    act(() => s.hook.result.current.cancel());
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.value).toEqual({ start: '2026-10-20', end: '2026-10-22' });
  });
});
