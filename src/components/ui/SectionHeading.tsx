import { cn } from "@/lib/cn";

export function SectionKicker({
  dark = false,
  reveal = false,
  className,
  children,
}: {
  dark?: boolean;
  /* מסמן את הקיקר כפריט תנועה עבור PageMotionRoot. ברירת מחדל: ללא תנועה */
  reveal?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      data-motion-item={reveal ? "" : undefined}
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
  reveal = "words",
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  lead?: string;
  dark?: boolean;
  center?: boolean;
  /* חשיפת הכותרת בכניסה לפריים. ws מפעיל אותה; reveal בוחר מי מנפיש:
     "words" — MotionEngine, מילה-אחר-מילה (ברירת המחדל, כל האתר).
     "lines" — HomeMotionRoot, שורה-אחר-שורה ב-GSAP SplitText (עמוד הבית).
     שני המנועים קוראים attributes שונים, ולעולם לא את שניהם על אותו אלמנט */
  ws?: boolean;
  reveal?: "words" | "lines";
  className?: string;
}) {
  const lines = ws && reveal === "lines";
  return (
    <div className={cn("flex flex-col gap-3.5", center && "items-center text-center", className)}>
      {kicker && <SectionKicker dark={dark}>{kicker}</SectionKicker>}
      <h2
        data-ws={ws && !lines ? "" : undefined}
        data-line-reveal={lines ? "" : undefined}
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
