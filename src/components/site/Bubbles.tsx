/* רקע "גלי הים": בועות עולות — משותף ל-hero ולמקטע צור-קשר בעמוד הבית
   ולבמת /aerial. וריאנט המסלול (a/b/c = stRise/stRiseB/stRiseC) לפי הבועה
   המקבילה ברפרנס */

export type Bubble = { left: string; size: number; dur: number; delay: number; v: "a" | "b" | "c" };

export function Bubbles({ items }: { items: Bubble[] }) {
  return (
    <>
      {items.map((b, i) => (
        <span
          key={i}
          className={`st-bub${b.v === "a" ? "" : ` st-bub-${b.v}`}`}
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </>
  );
}
