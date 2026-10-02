import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { setViewportWidth } from '../../test/viewport';
import { DateRangePicker } from './DateRangePicker';
import { computePopoverPosition } from './DesktopPopover';
import type { DateRange, DateRangePickerProps } from './types';

const TODAY = '2026-07-04';

/** עוטף מבוקר: מחזיק את הערך כמו טופס מארח */
function Host(props: Partial<DateRangePickerProps> & { initial?: DateRange; onValue?: (r: DateRange) => void }) {
  const { initial = { start: '2026-10-04', end: '2026-10-10' }, onValue, ...rest } = props;
  const [range, setRange] = useState<DateRange>(initial);
  return (
    <div>
      <input aria-label="שדה אחר" />
      <DateRangePicker
        value={range}
        onChange={(r) => {
          setRange(r);
          onValue?.(r);
        }}
        today={TODAY}
        {...rest}
      />
      <output data-testid="value">{`${range.start ?? ''}|${range.end ?? ''}`}</output>
    </div>
  );
}

const value = () => screen.getByTestId('value').textContent;
const day = (label: string) => screen.getByRole('button', { name: label });
const trigger = () => screen.getByRole('button', { expanded: false, name: /בחרו|באוקטובר|בנובמבר|בדצמבר|בינואר/ });
const dialog = () => screen.getByRole('dialog');

beforeEach(() => setViewportWidth(1280));
afterEach(() => cleanup());

describe('DateRangePicker — טריגר ותבנית', () => {
  it('מציג את הטווח בשדה, סגור כברירת מחדל', () => {
    render(<Host />);
    expect(screen.getByRole('button', { name: '4 באוקטובר – 10 באוקטובר 2026' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('768px → פופאובר (לא מודאלי) עם שני חודשים: נוכחי והבא', async () => {
    setViewportWidth(768);
    const user = userEvent.setup();
    render(<Host />);
    await user.click(trigger());
    const d = dialog();
    expect(d).toHaveAttribute('aria-modal', 'false');
    expect(d).toHaveClass('drp-pop');
    expect(within(d).getAllByRole('grid')).toHaveLength(2);
    expect(within(d).getByText('אוקטובר 2026')).toBeInTheDocument();
    expect(within(d).getByText('נובמבר 2026')).toBeInTheDocument();
    expect(within(d).getByText('6 לילות')).toBeInTheDocument();
  });

  it('767px → Bottom Sheet מודאלי, 3 חודשים מחודש ההגעה, body נעול', async () => {
    setViewportWidth(767);
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole('button', { name: '4 באוקטובר – 10 באוקטובר 2026' }));
    const d = dialog();
    expect(d).toHaveAttribute('aria-modal', 'true');
    expect(d).toHaveClass('drp-sheet');
    expect(within(d).getAllByRole('grid')).toHaveLength(3);
    expect(within(d).getByText('אוקטובר 2026')).toBeInTheDocument();
    expect(within(d).getByText('דצמבר 2026')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    await user.click(within(d).getByRole('button', { name: 'חודשים נוספים' }));
    expect(within(d).getAllByRole('grid')).toHaveLength(6);
    expect(within(d).getByText('מרץ 2027')).toBeInTheDocument();
    await user.click(within(d).getByRole('button', { name: 'סגירה' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('שינוי רוחב בזמן ריצה מחליף תבנית', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(trigger());
    expect(dialog()).toHaveClass('drp-pop');
    act(() => setViewportWidth(600));
    expect(dialog()).toHaveClass('drp-sheet');
    act(() => setViewportWidth(900));
    expect(dialog()).toHaveClass('drp-pop');
  });

  it('layout="sheet" כופה Sheet גם בדסקטופ; layout="stacked" מוסיף את הקלאס לפופאובר', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Host layout="sheet" />);
    await user.click(screen.getByRole('button', { name: /באוקטובר/ }));
    expect(dialog()).toHaveClass('drp-sheet');
    unmount();
    render(<Host layout="stacked" />);
    await user.click(screen.getByRole('button', { name: /באוקטובר/ }));
    expect(dialog().querySelector('.drp-cal')).toHaveClass('drp-stacked');
  });

  it('במובייל אין סטפר ליד השדה — הוא בתוך ה-Sheet', async () => {
    setViewportWidth(390);
    const user = userEvent.setup();
    render(<Host />);
    expect(screen.queryByRole('group', { name: 'מספר לילות' })).toBeNull();
    await user.click(screen.getByRole('button', { name: /באוקטובר/ }));
    expect(within(dialog()).getByRole('group', { name: 'מספר לילות' })).toBeInTheDocument();
  });
});

describe('DateRangePicker — בחירה והפס', () => {
  it('4→10 באוקטובר: 6 לילות, פס רציף, שני הקצוות כחולים, תאי הקצה חצי-שקופים', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(trigger());
    const d = dialog();
    const cellOf = (label: string) => within(d).getByRole('button', { name: label }).parentElement as HTMLElement;
    expect(cellOf('4 באוקטובר 2026')).toHaveClass('drp-bs');
    expect(cellOf('4 באוקטובר 2026')).not.toHaveClass('drp-be');
    expect(cellOf('4 באוקטובר 2026')).toHaveAttribute('aria-selected', 'true');
    for (const n of [5, 6, 7, 8, 9]) expect(cellOf(`${n} באוקטובר 2026`)).toHaveClass('drp-in');
    expect(cellOf('10 באוקטובר 2026')).toHaveClass('drp-be');
    expect(cellOf('11 באוקטובר 2026')).not.toHaveClass('drp-in');
    expect(day('4 באוקטובר 2026')).toHaveClass('drp-sel');
    expect(day('10 באוקטובר 2026')).toHaveClass('drp-sel');
    expect(within(d).getByText('04/10/2026')).toBeInTheDocument();
    expect(within(d).getByText('10/10/2026')).toBeInTheDocument();
  });

  it('שתי לחיצות בוחרות טווח (onChange חי), לחיצה מוקדמת מחליפה הגעה, שלישית מתחילה מחדש', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Host initial={{ start: null, end: null }} onValue={onValue} />);
    await user.click(screen.getByRole('button', { name: 'בחרו תאריכים' }));
    // בלי הגעה: הלוח נפתח בחודש של היום (יולי 2026)
    expect(within(dialog()).getByText('יולי 2026')).toBeInTheDocument();
    expect(within(dialog()).getByText('בחרו תאריך יציאה')).toBeInTheDocument();
    expect(within(dialog()).getByText('לחצו על תאריך היציאה כדי לסיים את הבחירה')).toBeInTheDocument();

    await user.click(day('10 ביולי 2026'));
    expect(value()).toBe('2026-07-10|');
    expect(onValue).toHaveBeenLastCalledWith({ start: '2026-07-10', end: null });

    await user.click(day('6 ביולי 2026'));
    expect(value()).toBe('2026-07-06|');

    await user.click(day('12 ביולי 2026'));
    expect(value()).toBe('2026-07-06|2026-07-12');
    expect(within(dialog()).getByText('6 לילות')).toBeInTheDocument();
    expect(within(dialog()).getByText('התאריכים עודכנו בטופס — לשמירה לחצו שמור שינויים')).toBeInTheDocument();

    await user.click(day('20 ביולי 2026'));
    expect(value()).toBe('2026-07-20|');
  });

  it('טווח שחוצה שורה וחודש (28/10 → 3/11) מצויר בשני החודשים', async () => {
    const user = userEvent.setup();
    render(<Host initial={{ start: '2026-10-28', end: '2026-11-03' }} />);
    await user.click(trigger());
    const d = dialog();
    const cellOf = (label: string) => within(d).getByRole('button', { name: label }).parentElement as HTMLElement;
    expect(cellOf('28 באוקטובר 2026')).toHaveClass('drp-bs');
    expect(cellOf('31 באוקטובר 2026')).toHaveClass('drp-in');
    expect(cellOf('1 בנובמבר 2026')).toHaveClass('drp-in');
    expect(cellOf('3 בנובמבר 2026')).toHaveClass('drp-be');
  });

  it('hover אחרי הגעה מצייר תצוגה מקדימה; יציאה מהלוח מנקה אותה', async () => {
    const user = userEvent.setup();
    render(<Host initial={{ start: '2026-10-04', end: null }} />);
    await user.click(screen.getByRole('button', { name: /באוקטובר/ }));
    const d = dialog();
    await user.hover(day('8 באוקטובר 2026'));
    expect(day('8 באוקטובר 2026')).toHaveClass('drp-prev');
    expect((day('6 באוקטובר 2026').parentElement as HTMLElement)).toHaveClass('drp-in');
    fireEvent.mouseLeave(d.querySelector('.drp-cal') as HTMLElement);
    expect(day('8 באוקטובר 2026')).not.toHaveClass('drp-prev');
  });

  it('היום מסומן ב-aria-current', async () => {
    const user = userEvent.setup();
    render(<Host initial={{ start: null, end: null }} />);
    await user.click(screen.getByRole('button', { name: 'בחרו תאריכים' }));
    expect(day('4 ביולי 2026')).toHaveAttribute('aria-current', 'date');
    expect(day('4 ביולי 2026')).toHaveClass('drp-today');
  });
});

describe('DateRangePicker — סטפר', () => {
  it('+ ו− מזיזים רק את היציאה; נעול בלי יציאה; מכבד maxNights', async () => {
    const user = userEvent.setup();
    render(<Host maxNights={7} />);
    const inc = screen.getByRole('button', { name: 'עוד לילה' });
    const dec = screen.getByRole('button', { name: 'פחות לילה' });
    await user.click(inc);
    expect(value()).toBe('2026-10-04|2026-10-11');
    expect(inc).toBeDisabled();
    await user.click(dec);
    await user.click(dec);
    expect(value()).toBe('2026-10-04|2026-10-09');
    expect(dec).toBeEnabled();

    // בלי יציאה — נעול ומציג —
    await user.click(trigger());
    await user.click(day('20 באוקטובר 2026'));
    expect(value()).toBe('2026-10-20|');
    expect(inc).toBeDisabled();
    expect(dec).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'מספר לילות' })).toHaveValue('—');
  });

  it('בלי maxNights: "+" לא נעול גם אחרי 40 לילות', async () => {
    const user = userEvent.setup();
    render(<Host initial={{ start: '2026-10-04', end: '2026-11-13' }} />);
    const inc = screen.getByRole('button', { name: 'עוד לילה' });
    expect(inc).toBeEnabled();
    await user.click(inc);
    expect(value()).toBe('2026-10-04|2026-11-14');
    expect(inc).toBeEnabled();
  });

  it('מינימום לילה אחד', () => {
    render(<Host initial={{ start: '2026-10-04', end: '2026-10-05' }} />);
    expect(screen.getByRole('button', { name: 'פחות לילה' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /באוקטובר/ })).toHaveTextContent('4 באוקטובר – 5 באוקטובר 2026');
  });
});

describe('NightsStepper — שדה הלילות', () => {
  const nightsInput = () => screen.getByRole<HTMLInputElement>('textbox', { name: 'מספר לילות' });

  it('הקלדת 30 + Enter מזיזה את היציאה ל-start + 30, בלי לשלוח את הטופס', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Host />
      </form>,
    );
    const input = nightsInput();
    expect(input).toHaveValue('6');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('dir', 'ltr');
    await user.click(input);
    // הטקסט נבחר כולו בכניסה — ההקלדה מחליפה אותו
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(1);
    await user.keyboard('30');
    expect(input).toHaveValue('30');
    expect(value()).toBe('2026-10-04|2026-10-10'); // עדיין לא חוּיַל
    await user.keyboard('{Enter}');
    expect(value()).toBe('2026-10-04|2026-11-03');
    expect(input).toHaveValue('30');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('אחרי Enter הפוקוס נשאר בשדה וכל הטקסט נבחר מחדש — הקלדה נוספת מחליפה ולא מצרפת', async () => {
    const user = userEvent.setup();
    render(<Host />);
    const input = nightsInput();
    await user.click(input);
    await user.keyboard('30{Enter}');
    expect(value()).toBe('2026-10-04|2026-11-03');
    expect(input).toHaveFocus();
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(2);
    await user.keyboard('5{Enter}');
    expect(input).toHaveValue('5');
    expect(value()).toBe('2026-10-04|2026-10-09');
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(1);
  });

  it('blur מחיל את הערך', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(nightsInput());
    await user.keyboard('12');
    await user.tab();
    expect(value()).toBe('2026-10-04|2026-10-16');
  });

  it('Esc משחזר את הערך הקודם ולא סוגר את הבורר', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(trigger());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const input = nightsInput();
    await user.click(input);
    await user.keyboard('9');
    expect(input).toHaveValue('9');
    await user.keyboard('{Escape}');
    expect(input).toHaveValue('6');
    expect(value()).toBe('2026-10-04|2026-10-10');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('ריק ו-0 לא משנים כלום', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Host onValue={onValue} />);
    const input = nightsInput();
    await user.click(input);
    await user.keyboard('{Backspace}{Enter}');
    expect(input).toHaveValue('6');
    // יציאה מהשדה וכניסה מחדש — הטקסט נבחר כולו שוב בכניסה
    await user.tab();
    await user.click(input);
    await user.keyboard('0{Enter}');
    expect(input).toHaveValue('6');
    await user.tab();
    await user.click(input);
    await user.keyboard('abc{Enter}');
    expect(input).toHaveValue('6');
    expect(onValue).not.toHaveBeenCalled();
    expect(value()).toBe('2026-10-04|2026-10-10');
  });

  it('מקבל ספרות בלבד', async () => {
    const user = userEvent.setup();
    render(<Host />);
    const input = nightsInput();
    await user.click(input);
    await user.keyboard('1a2-');
    expect(input).toHaveValue('12');
  });

  it('מעל maxNights נחתך ל-maxNights', async () => {
    const user = userEvent.setup();
    render(<Host maxNights={7} />);
    await user.click(nightsInput());
    await user.keyboard('30{Enter}');
    expect(value()).toBe('2026-10-04|2026-10-11');
    expect(nightsInput()).toHaveValue('7');
  });

  it('בלי maxNights אין תקרה', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(nightsInput());
    await user.keyboard('400{Enter}');
    expect(value()).toBe('2026-10-04|2027-11-08');
  });

  it('תוצאה שחוצה isDateDisabled נקטעת בחסימה הראשונה', async () => {
    const user = userEvent.setup();
    render(
      <Host initial={{ start: '2026-10-04', end: '2026-10-06' }} isDateDisabled={(d) => d === '2026-10-07'} />,
    );
    await user.click(nightsInput());
    await user.keyboard('10{Enter}');
    expect(value()).toBe('2026-10-04|2026-10-07');
    expect(nightsInput()).toHaveValue('3');
  });

  it('נעול (readOnly, —) בלי תאריך הגעה', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Host initial={{ start: null, end: null }} onValue={onValue} />);
    const input = nightsInput();
    expect(input).toHaveValue('—');
    expect(input).toHaveAttribute('readonly');
    await user.click(input);
    await user.keyboard('5{Enter}');
    expect(input).toHaveValue('—');
    expect(onValue).not.toHaveBeenCalled();
  });

  it('עם הגעה בלבד: הקלדת מספר קובעת את היציאה', async () => {
    const user = userEvent.setup();
    render(<Host initial={{ start: '2026-10-04', end: null }} />);
    const input = nightsInput();
    expect(input).toHaveValue('—');
    expect(input).not.toHaveAttribute('readonly');
    await user.click(input);
    await user.keyboard('3{Enter}');
    expect(value()).toBe('2026-10-04|2026-10-07');
    expect(input).toHaveValue('3');
  });

  it('חיצים למעלה/למטה בתוך השדה = ±1', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(nightsInput());
    await user.keyboard('{ArrowUp}');
    expect(value()).toBe('2026-10-04|2026-10-11');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(value()).toBe('2026-10-04|2026-10-09');
  });

  it('במובייל השדה בתוך ה-Sheet ועובד באותו אופן', async () => {
    setViewportWidth(390);
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole('button', { name: /באוקטובר/ }));
    const d = dialog();
    const input = within(d).getByRole('textbox', { name: 'מספר לילות' });
    await user.click(input);
    await user.keyboard('30{Enter}');
    expect(value()).toBe('2026-10-04|2026-11-03');
    expect(within(d).getByText('30 לילות')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('DateRangePicker — סגור / ביטול', () => {
  it('"סגור" נעול בלי יציאה; עם יציאה קורא ל-onCommit וסוגר', async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(<Host initial={{ start: null, end: null }} onCommit={onCommit} />);
    await user.click(screen.getByRole('button', { name: 'בחרו תאריכים' }));
    const close = within(dialog()).getByRole('button', { name: 'סגור' });
    expect(close).toBeDisabled();
    await user.click(day('10 ביולי 2026'));
    expect(close).toBeDisabled();
    await user.click(day('14 ביולי 2026'));
    expect(close).toBeEnabled();
    await user.click(close);
    expect(onCommit).toHaveBeenCalledWith({ start: '2026-07-10', end: '2026-07-14' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(value()).toBe('2026-07-10|2026-07-14');
    expect(screen.getByRole('button', { name: /ביולי/ })).toHaveFocus();
  });

  it('"ביטול" מחזיר את הערך מהפתיחה וקורא ל-onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<Host onCancel={onCancel} />);
    await user.click(trigger());
    await user.click(day('20 באוקטובר 2026'));
    await user.click(day('25 באוקטובר 2026'));
    expect(value()).toBe('2026-10-20|2026-10-25');
    await user.click(within(dialog()).getByRole('button', { name: 'ביטול' }));
    expect(value()).toBe('2026-10-04|2026-10-10');
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Esc מבטל ומחזיר פוקוס לטריגר', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(trigger());
    await user.click(day('20 באוקטובר 2026'));
    await user.keyboard('{Escape}');
    expect(value()).toBe('2026-10-04|2026-10-10');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /באוקטובר/ })).toHaveFocus();
  });

  it('לחיצה מחוץ לפופאובר מבטלת; לחיצה על הסטפר החיצוני לא', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(trigger());
    await user.click(day('20 באוקטובר 2026'));
    await user.click(screen.getByRole('button', { name: 'עוד לילה' })); // נעול, אבל הלחיצה לא סוגרת
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByLabelText('שדה אחר'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(value()).toBe('2026-10-04|2026-10-10');
  });

  it('במובייל: רקע ו-X מבטלים', async () => {
    setViewportWidth(390);
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole('button', { name: /באוקטובר/ }));
    await user.click(day('20 באוקטובר 2026'));
    await user.click(document.querySelector('.drp-backdrop') as HTMLElement);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(value()).toBe('2026-10-04|2026-10-10');
  });
});

describe('DateRangePicker — חיצים ומעבר שנה', () => {
  it('דצמבר → ינואר: חיצים משותפים, כותרות עם שנה, לילות נכונים', async () => {
    const user = userEvent.setup();
    render(<Host initial={{ start: '2026-11-20', end: '2026-11-22' }} />);
    await user.click(trigger());
    const d = dialog();
    expect(within(d).getByText('נובמבר 2026')).toBeInTheDocument();
    expect(within(d).getByText('דצמבר 2026')).toBeInTheDocument();
    await user.click(within(d).getByRole('button', { name: 'חודש הבא' }));
    expect(within(d).getByText('דצמבר 2026')).toBeInTheDocument();
    expect(within(d).getByText('ינואר 2027')).toBeInTheDocument();
    await user.click(day('28 בדצמבר 2026'));
    await user.click(day('3 בינואר 2027'));
    expect(value()).toBe('2026-12-28|2027-01-03');
    expect(within(d).getByText('6 לילות')).toBeInTheDocument();
    expect(within(d).getByText('28 בדצמבר 2026 – 3 בינואר 2027')).toBeInTheDocument();
    await user.click(within(d).getByRole('button', { name: 'חודש קודם' }));
    await user.click(within(d).getByRole('button', { name: 'חודש קודם' }));
    expect(within(d).getByText('אוקטובר 2026')).toBeInTheDocument();
    expect(within(d).getByText('נובמבר 2026')).toBeInTheDocument();
  });

  it('הסטפר מחזיר את התצוגה לחודש ההגעה', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(trigger());
    const d = dialog();
    await user.click(within(d).getByRole('button', { name: 'חודש הבא' }));
    await user.click(within(d).getByRole('button', { name: 'חודש הבא' }));
    expect(within(d).queryByText('אוקטובר 2026')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'עוד לילה' }));
    expect(within(d).getByText('אוקטובר 2026')).toBeInTheDocument();
  });
});

describe('DateRangePicker — חסימות', () => {
  it('minDate: תא חסום לא לחיץ, לחיצה לא משנה ערך', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Host initial={{ start: null, end: null }} minDate="2026-07-10" onValue={onValue} />);
    await user.click(screen.getByRole('button', { name: 'בחרו תאריכים' }));
    expect(day('9 ביולי 2026')).toHaveAttribute('aria-disabled', 'true');
    expect(day('10 ביולי 2026')).not.toHaveAttribute('aria-disabled');
    await user.click(day('9 ביולי 2026'));
    expect(onValue).not.toHaveBeenCalled();
    await user.click(day('10 ביולי 2026'));
    expect(value()).toBe('2026-07-10|');
  });

  it('isDateDisabled: טווח לא חוצה חסימה — היציאה נקבעת עד התאריך החסום הראשון', async () => {
    const user = userEvent.setup();
    render(
      <Host initial={{ start: null, end: null }} isDateDisabled={(d) => d === '2026-07-14'} />,
    );
    await user.click(screen.getByRole('button', { name: 'בחרו תאריכים' }));
    expect(day('14 ביולי 2026')).toHaveAttribute('aria-disabled', 'true');
    await user.click(day('10 ביולי 2026'));
    await user.click(day('20 ביולי 2026'));
    expect(value()).toBe('2026-07-10|2026-07-14');
    expect(screen.getByRole('button', { name: 'עוד לילה' })).toBeDisabled();
  });
});

describe('DateRangePicker — נגישות ומקלדת', () => {
  it('הפוקוס נכנס לדיאלוג על תאריך ההגעה; חץ שמאלה = יום הבא; Enter בוחר', async () => {
    const user = userEvent.setup();
    render(<Host initial={{ start: '2026-10-04', end: null }} />);
    await user.click(screen.getByRole('button', { name: /באוקטובר/ }));
    expect(day('4 באוקטובר 2026')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(day('5 באוקטובר 2026')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(day('12 באוקטובר 2026')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(day('11 באוקטובר 2026')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(value()).toBe('2026-10-04|2026-10-11');
  });

  it('PageDown מעביר חודש, וחץ מעבר לחודש השני מזיז את התצוגה', async () => {
    const user = userEvent.setup();
    render(<Host initial={{ start: '2026-11-30', end: null }} />);
    await user.click(screen.getByRole('button', { name: /בנובמבר/ }));
    const d = dialog();
    expect(day('30 בנובמבר 2026')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(day('1 בדצמבר 2026')).toHaveFocus();
    expect(within(d).getByText('דצמבר 2026')).toBeInTheDocument();
    await user.keyboard('{PageDown}');
    expect(day('1 בינואר 2027')).toHaveFocus();
    expect(within(d).getByText('ינואר 2027')).toBeInTheDocument();
    await user.keyboard('{PageUp}');
    await user.keyboard('{PageUp}');
    expect(day('1 בנובמבר 2026')).toHaveFocus();
  });

  it('Tab מסתובב בתוך הבורר: הדיאלוג + השורה העליונה (שדה, סטפר ושדה הלילות)', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(trigger());
    const d = dialog();
    const close = within(d).getByRole('button', { name: 'סגור' });
    const field = screen.getByRole('button', { expanded: true });
    close.focus();
    await user.tab();
    expect(document.activeElement).toBe(field);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'פחות לילה' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'מספר לילות' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'עוד לילה' }));
    await user.tab();
    expect(document.activeElement).toBe(within(d).getByRole('button', { name: 'חודש קודם' }));
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(close);
  });

  it('הטריגר מכריז על הדיאלוג; ללוח יש role=grid ולכל יום aria-label מלא', async () => {
    const user = userEvent.setup();
    render(<Host />);
    const t = trigger();
    expect(t).toHaveAttribute('aria-haspopup', 'dialog');
    await user.click(t);
    expect(t).toHaveAttribute('aria-expanded', 'true');
    expect(t).toHaveAttribute('aria-controls', dialog().id);
    expect(within(dialog()).getAllByRole('grid')[0]).toHaveAccessibleName('אוקטובר 2026');
    expect(day('4 באוקטובר 2026')).toHaveAttribute('aria-label', '4 באוקטובר 2026');
  });
});

describe('DateRangePicker — פריסה: הרכיב לא דוחף תוכן', () => {
  /** ה-DOM של המיכל בלי מצב הטריגר (aria-expanded / drp-on / aria-controls / כיוון החץ) */
  const containerSignature = (root: HTMLElement) =>
    root.innerHTML.replace(
      // החץ (expand_more/expand_less) הוא SVG inline — הנתיב שלו משתנה בין סגור לפתוח
      / aria-expanded="(true|false)"| aria-controls="[^"]*"| drp-on|<svg class="drp-mi drp-chev"[^]*?<\/svg>/g,
      '',
    );

  it('הפופאובר מרונדר ב-portal מחוץ לעץ הטופס, והמיכל של הרכיב זהה בין סגור לפתוח', async () => {
    const user = userEvent.setup();
    render(
      <form data-testid="form">
        <Host />
      </form>,
    );
    const form = screen.getByTestId('form');
    const root = form.querySelector('.drp') as HTMLElement;
    const closedChildren = root.children.length;
    const closedSignature = containerSignature(root);
    const closedHeight = root.getBoundingClientRect().height;

    await user.click(trigger());
    const d = dialog();
    expect(form.contains(d)).toBe(false);
    expect(root.contains(d)).toBe(false);
    expect(d.parentElement).toBe(document.body);
    expect(d).toHaveClass('drp-pop'); // position: fixed מגיע מה-CSS של .drp-pop
    expect(d.style.top).toMatch(/px$/);
    expect(d.style.left).toMatch(/px$/);
    // המיכל: אותו מספר ילדים, אותו DOM, אותו גובה (ב-jsdom הגובה הוא 0 בשני המצבים; המדידה האמיתית ב-Playwright)
    expect(root.children.length).toBe(closedChildren);
    expect(containerSignature(root)).toBe(closedSignature);
    expect(root.getBoundingClientRect().height).toBe(closedHeight);
    expect(root.querySelector('[role="dialog"]')).toBeNull();
  });

  it('במובייל ה-Sheet והרקע שלו מרונדרים מחוץ לטופס', async () => {
    setViewportWidth(390);
    const user = userEvent.setup();
    render(
      <form data-testid="form">
        <Host />
      </form>,
    );
    const form = screen.getByTestId('form');
    await user.click(screen.getByRole('button', { name: /באוקטובר/ }));
    const d = dialog();
    expect(form.contains(d)).toBe(false);
    expect(document.body.contains(d)).toBe(true);
    expect(form.querySelector('.drp-backdrop')).toBeNull();
    expect(document.body.querySelector('.drp-backdrop')).not.toBeNull();
  });

  it('במצב סגור המיכל מכיל רק את השורה העליונה (שדה + סטפר + תווית)', () => {
    render(<Host />);
    const root = document.querySelector('.drp') as HTMLElement;
    expect(root.children.length).toBe(1);
    expect(root.firstElementChild).toHaveClass('drp-top');
    expect(root.querySelector('.drp-field')).not.toBeNull();
    expect(root.querySelector('.drp-step')).not.toBeNull();
    expect(root.querySelector('.drp-hint')).toHaveTextContent('שינוי מזיז את תאריך היציאה');
  });
});

describe('DateRangePicker — בלי מגבלת לילות', () => {
  it('בחירה של שנה קדימה דרך החיצים: 365 לילות, הסטפר לא נעול', async () => {
    const user = userEvent.setup();
    render(<Host initial={{ start: '2026-10-04', end: null }} />);
    await user.click(screen.getByRole('button', { name: /באוקטובר/ }));
    const d = dialog();
    // הכפתור מתחלף בכל רינדור (החודש השני נבנה מחדש), לכן שולפים אותו מחדש בכל לחיצה
    for (let i = 0; i < 12; i++) await user.click(within(d).getByRole('button', { name: 'חודש הבא' }));
    expect(within(d).getByText('אוקטובר 2027')).toBeInTheDocument();
    await user.click(day('4 באוקטובר 2027'));
    expect(value()).toBe('2026-10-04|2027-10-04');
    expect(within(d).getByText('365 לילות')).toBeInTheDocument();
    expect(within(d).getByText('4 באוקטובר 2026 – 4 באוקטובר 2027')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'עוד לילה' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'עוד לילה' }));
    expect(value()).toBe('2026-10-04|2027-10-05');
  });

  it('מקלדת: PageDown שנה שלמה קדימה ו-Enter בוחרים בלי גבול', async () => {
    const user = userEvent.setup();
    render(<Host initial={{ start: '2026-10-04', end: null }} />);
    await user.click(screen.getByRole('button', { name: /באוקטובר/ }));
    expect(day('4 באוקטובר 2026')).toHaveFocus();
    for (let i = 0; i < 12; i++) await user.keyboard('{PageDown}');
    expect(day('4 באוקטובר 2027')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(value()).toBe('2026-10-04|2027-10-04');
  });
});

describe('computePopoverPosition', () => {
  const anchor = { top: 100, bottom: 152, right: 1200, width: 600 };
  it('מתחת לשדה, מיושר לימין, 16px, רוחב 700–940', () => {
    expect(computePopoverPosition(anchor, 500, 1280, 900, 'side-by-side')).toEqual({ top: 168, left: 500, width: 700 });
    expect(computePopoverPosition({ ...anchor, width: 1000 }, 500, 1280, 900, 'side-by-side').width).toBe(940);
  });
  it('אין מקום מתחת → מעל', () => {
    expect(computePopoverPosition({ ...anchor, top: 700, bottom: 752 }, 500, 1280, 900, 'side-by-side').top).toBe(184);
  });
  it('חורג מהצד → מוצמד לשוליים 16px', () => {
    expect(computePopoverPosition({ ...anchor, right: 600 }, 500, 1280, 900, 'side-by-side').left).toBe(16);
    expect(computePopoverPosition({ ...anchor, right: 1400 }, 500, 1280, 900, 'side-by-side').left).toBe(564);
  });
  it('גבוה מהחלון מכל צד → מוצמד לשוליים התחתונים (ולא נחתך)', () => {
    expect(computePopoverPosition(anchor, 1200, 1280, 900, 'stacked').top).toBe(16);
    expect(computePopoverPosition(anchor, 800, 1280, 900, 'stacked').top).toBe(84);
  });
  it('stacked = רוחב השורה, לכל היותר 640 (מתחת לסף העטיפה); חלון צר מכווץ לרוחב החלון פחות שוליים', () => {
    expect(computePopoverPosition(anchor, 500, 1280, 900, 'stacked').width).toBe(600);
    expect(computePopoverPosition({ ...anchor, width: 900 }, 500, 1280, 900, 'stacked').width).toBe(640);
    expect(computePopoverPosition({ ...anchor, width: 200 }, 500, 1280, 900, 'stacked').width).toBe(320);
    expect(computePopoverPosition(anchor, 500, 720, 900, 'side-by-side').width).toBe(688);
  });
});
