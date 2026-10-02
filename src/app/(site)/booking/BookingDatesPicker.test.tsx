import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { setViewportWidth } from "@/test/viewport";
import { BookingDatesPicker, OPEN_CLASS } from "./BookingDatesPicker";

/* "היום" = 2026-07-04 בישראל (12:00 UTC = 15:00 בישראל) */
vi.mock("./dates", async (orig) => ({
  ...(await orig<typeof import("./dates")>()),
  todayInIsrael: () => "2026-07-04",
}));

/* מדמה את BookingSearchBar: כפתור טריגר משלו, מצב פתוח, והחוזה onClose(arrival, departure) */
function Bar({ onClose }: { onClose: (a: string | null, d: string | null) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState({ a: "2026-10-04", d: "2026-10-10" });
  return (
    <>
      <button ref={ref} type="button" onClick={() => setOpen(true)}>
        תאריכים
      </button>
      <output data-testid="range">{`${range.a}|${range.d}`}</output>
      <BookingDatesPicker
        open={open}
        anchorRef={ref}
        initialArrival={range.a}
        initialDeparture={range.d}
        onClose={(a, d) => {
          onClose(a, d);
          setOpen(false);
          if (a && d) setRange({ a, d });
        }}
      />
    </>
  );
}

const range = () => screen.getByTestId("range").textContent;

beforeEach(() => setViewportWidth(1280));
afterEach(() => cleanup());

describe("BookingDatesPicker — החוזה מול פס החיפוש", () => {
  it("מוסיף class ל-body בפתיחה ומסיר בסגירה וב-unmount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Bar onClose={vi.fn()} />);
    const bodyHas = () => document.body.classList.contains(OPEN_CLASS);
    expect(bodyHas()).toBe(false);
    await user.click(screen.getByRole("button", { name: "תאריכים" }));
    expect(bodyHas()).toBe(true);
    await user.keyboard("{Escape}");
    expect(bodyHas()).toBe(false);
    await user.click(screen.getByRole("button", { name: "תאריכים" }));
    expect(bodyHas()).toBe(true);
    unmount();
    expect(bodyHas()).toBe(false);
  });

  it("נפתח מהטריגר החיצוני, בלי שדה ובלי סטפר משלו", async () => {
    const user = userEvent.setup();
    render(<Bar onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "תאריכים" }));
    const d = screen.getByRole("dialog");
    expect(d).toHaveClass("drp-pop", "stm-drp");
    expect(document.querySelector(".drp-field")).toBeNull();
    expect(screen.queryByRole("group", { name: "מספר לילות" })).toBeNull();
    expect(within(d).getByText("אוקטובר 2026")).toBeInTheDocument();
  });

  it('"סגור" מחזיר מחרוזות YYYY-MM-DD בלבד', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Bar onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "תאריכים" }));
    await user.click(screen.getByRole("button", { name: "12 באוקטובר 2026" }));
    await user.click(screen.getByRole("button", { name: "15 באוקטובר 2026" }));
    await user.click(screen.getByRole("button", { name: "סגור" }));
    expect(onClose).toHaveBeenCalledWith("2026-10-12", "2026-10-15");
    expect(range()).toBe("2026-10-12|2026-10-15");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("ביטול ו-Esc מחזירים (null, null) והפס לא משתנה", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Bar onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "תאריכים" }));
    await user.click(screen.getByRole("button", { name: "12 באוקטובר 2026" }));
    await user.click(screen.getByRole("button", { name: "ביטול" }));
    expect(onClose).toHaveBeenLastCalledWith(null, null);

    await user.click(screen.getByRole("button", { name: "תאריכים" }));
    await user.click(screen.getByRole("button", { name: "20 באוקטובר 2026" }));
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenLastCalledWith(null, null);
    expect(range()).toBe("2026-10-04|2026-10-10");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("פתיחה חוזרת מתחילה מהערכים של הפס, לא מהבחירה שבוטלה", async () => {
    const user = userEvent.setup();
    render(<Bar onClose={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "תאריכים" }));
    await user.click(screen.getByRole("button", { name: "20 באוקטובר 2026" }));
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "תאריכים" }));
    expect(within(screen.getByRole("dialog")).getByText("6 לילות")).toBeInTheDocument();
  });

  it("ימים לפני היום בישראל חסומים", async () => {
    const user = userEvent.setup();
    render(<Bar onClose={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "תאריכים" }));
    await user.click(screen.getByRole("button", { name: "חודש קודם" }));
    await user.click(screen.getByRole("button", { name: "חודש קודם" }));
    await user.click(screen.getByRole("button", { name: "חודש קודם" }));
    /* הסקיל מסמן aria-disabled (היום נשאר בניווט המקלדת) ולחיצה עליו לא בוחרת */
    const past = screen.getByRole("button", { name: "3 ביולי 2026" });
    expect(past).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "4 ביולי 2026" })).not.toHaveAttribute("aria-disabled");
    await user.click(past);
    expect(within(screen.getByRole("dialog")).getByText("6 לילות")).toBeInTheDocument();
  });

  it("לחיצה על הטריגר כשהבורר פתוח אינה לחיצה בחוץ", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Bar onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "תאריכים" }));
    await user.click(screen.getByRole("button", { name: "תאריכים" }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("במובייל נפתח Bottom Sheet מודאלי", async () => {
    setViewportWidth(375);
    const user = userEvent.setup();
    render(<Bar onClose={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "תאריכים" }));
    const d = screen.getByRole("dialog");
    expect(d).toHaveAttribute("aria-modal", "true");
    expect(d.closest(".stm-drp")).not.toBeNull();
  });
});
