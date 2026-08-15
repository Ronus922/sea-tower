import { cn } from "@/lib/cn";

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
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[13.5px] font-bold tracking-label",
        dark ? "text-aqua" : "text-kicker",
        className
      )}
    >
      <span aria-hidden="true" className="h-0.5 w-[22px] rounded-full bg-current" />
      {children}
    </span>
  );
}

export function SectionHeading({
  kicker,
  title,
  lead,
  dark = false,
  center = false,
  ws = false,
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  lead?: string;
  dark?: boolean;
  center?: boolean;
  /* חשיפת מילה-אחר-מילה ע"י MotionEngine (מצב PLUS של הרפרנס) */
  ws?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3.5", center && "items-center text-center", className)}>
      {kicker && <SectionKicker dark={dark}>{kicker}</SectionKicker>}
      <h2
        data-ws={ws ? "" : undefined}
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
