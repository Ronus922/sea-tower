/* נתון חשוף עם קו חול אנכי — בלי קופסה, בלי צל, בלי רדיוס.
   ה-props ‏rev/countUp נשמרים בחתימה לתאימות; מוני הספירה הוסרו
   (DESIGN-AUDIT ממצאים 3+5) */
export function StatCard({
  value,
  label,
  rev = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  countUp = false,
}: {
  value: string;
  label: string;
  rev?: boolean;
  countUp?: boolean;
}) {
  return (
    <div data-rev={rev ? "sm" : undefined} className="ed-stat">
      <div className="ed-stat-value">{value}</div>
      <div className="ed-stat-label">{label}</div>
    </div>
  );
}
