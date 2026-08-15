import { cn } from "@/lib/cn";
import { SectionKicker } from "@/components/ui/SectionHeading";

/* עותק /v2 של SectionHeading (ניסוי התנועה): בלי מצב ws של MotionEngine —
   חשיפת הכותרת שורה-שורה שייכת ל-GSAP ‏(V3Root, אלמנט 1) דרך data-v3-title.
   ה-lead שומר על data-rev של MotionEngine — אין חפיפה בין המנועים */
export function V3SectionHeading({
  kicker,
  title,
  lead,
  dark = false,
  center = false,
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  lead?: string;
  dark?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3.5", center && "items-center text-center", className)}>
      {kicker && <SectionKicker dark={dark}>{kicker}</SectionKicker>}
      <h2
        data-v3-title=""
        className={cn(
          "text-[32px]/[1.2] font-extrabold tracking-heading md:text-h2",
          dark ? "text-white" : "text-navy-800"
        )}
      >
        {title}
      </h2>
      {lead && (
        <p data-rev="up" className={cn("max-w-[640px] text-lead", dark ? "text-on-navy" : "text-ink")}>
          {lead}
        </p>
      )}
    </div>
  );
}
