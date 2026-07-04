import { cn } from "@/lib/cn";

/* צ'יפ מאפיינים: "4 אורחים" · "86 מ״ר" */
export function Chip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg bg-chip px-[11px] py-[5px] text-[13px] font-semibold text-chip-ink",
        className
      )}
    >
      {children}
    </span>
  );
}

/* תג על תמונה: "ג׳קוזי" (brand) / "נוף חזיתי" (light) */
export function ImageBadge({
  variant = "brand",
  className,
  children,
}: {
  variant?: "brand" | "light";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-[12.5px] font-bold",
        variant === "brand"
          ? "bg-sea-500 text-white"
          : "bg-white text-navy-800 shadow-[0_4px_10px_rgba(0,0,0,0.1)]",
        className
      )}
    >
      {children}
    </span>
  );
}
