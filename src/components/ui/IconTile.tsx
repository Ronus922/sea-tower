import { cn } from "@/lib/cn";

/* אריח אייקון — ריבוע מעוגל בגרדיאנט נייבי, אייקון קו לבן/ציאן בפנים.
   רדיוס 14px לפי הרכיב בפרק 09 של ספר המותג (הסולם בפרק 06 אומר 11 — הספר לא עקבי) */
export function IconTile({
  size = 52,
  className,
  children,
}: {
  size?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-tile bg-[linear-gradient(135deg,var(--color-navy-800),var(--color-ocean-600))] text-white",
        className
      )}
    >
      {children}
    </div>
  );
}
