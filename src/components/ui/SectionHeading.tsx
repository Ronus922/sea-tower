import { cn } from "@/lib/cn";

/* תווית מקדימה שקטה — overline מרווח עם קו חול קצר (editorial.css) */
export function SectionKicker({
  dark = false,
  className,
  children,
}: {
  dark?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("ed-overline", dark && "on-dark", className)}>{children}</span>
  );
}

/* כותרת מקטע אדיטוריאלית — Frank Ruhl Libre.
   ה-prop ‏ws (פיצול מילים) נשמר בחתימה לתאימות אך אינו פעיל עוד —
   מנוע פיצול המילים הוסר (DESIGN-AUDIT ממצא 5) */
export function SectionHeading({
  kicker,
  title,
  lead,
  dark = false,
  center = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ws = false,
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  lead?: string;
  dark?: boolean;
  center?: boolean;
  ws?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", center && "items-center text-center", className)}>
      {kicker && <SectionKicker dark={dark}>{kicker}</SectionKicker>}
      <h2 className={cn("ed-h2", dark ? "text-white" : "text-navy-800")}>{title}</h2>
      {lead && (
        <p data-rev="up" className={cn("max-w-[620px] text-lead", dark ? "text-on-navy" : "text-ink")}>
          {lead}
        </p>
      )}
    </div>
  );
}
