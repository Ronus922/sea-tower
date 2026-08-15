export function StatCard({
  value,
  label,
  rev = false,
  countUp = false,
}: {
  value: string;
  label: string;
  /* חשיפה בגלילה כקבוצה מדורגת (MotionEngine) */
  rev?: boolean;
  /* ספירת המספרים שבערך בעת החשיפה (MotionEngine) */
  countUp?: boolean;
}) {
  return (
    <div
      data-rev={rev ? "card" : undefined}
      className="rounded-tile bg-white px-[22px] py-5 shadow-e1"
    >
      <div
        data-countup={countUp ? "" : undefined}
        className="text-[32px] leading-none font-extrabold text-kicker"
      >
        {value}
      </div>
      <div className="mt-1 text-sm font-semibold text-ink-dim">{label}</div>
    </div>
  );
}
