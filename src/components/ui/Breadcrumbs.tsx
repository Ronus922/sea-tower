import Link from "next/link";
import { cn } from "@/lib/cn";

/* פירורי לחם — קודם לכן ה-markup הזה היה מועתק-מודבק בכל עמוד (7 עותקים).
   ה-JSON-LD המקביל (BreadcrumbList) נשאר באחריות העמוד. */
export function Breadcrumbs({
  trail,
  dark = false,
  className,
}: {
  /* הפריט האחרון הוא העמוד הנוכחי (מרונדר כטקסט עם aria-current) */
  trail: Array<{ name: string; href?: string }>;
  dark?: boolean;
  className?: string;
}) {
  return (
    <nav
      aria-label="פירורי לחם"
      className={cn(
        "inline-flex flex-wrap items-center gap-2 text-[13.5px] font-medium",
        dark ? "text-[#acc8dd]" : "text-ink-dim",
        className
      )}
    >
      {trail.map((item, i) => {
        const last = i === trail.length - 1;
        return (
          <span key={item.name} className="inline-flex items-center gap-2">
            {item.href && !last ? (
              /* min-h + margin שלילי: אזור מגע 44px בלי לשנות את הזרימה (כלל ברזל #6) */
              <Link
                href={item.href}
                className="stm-link -my-2 inline-flex min-h-11 items-center py-2"
              >
                {item.name}
              </Link>
            ) : (
              <span
                aria-current={last ? "page" : undefined}
                className={cn("font-semibold", dark ? "text-white" : "text-navy-800")}
              >
                {item.name}
              </span>
            )}
            {!last && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        );
      })}
    </nav>
  );
}
