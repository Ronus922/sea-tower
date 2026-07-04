import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "outline" | "link";
type Surface = "light" | "dark";

type ButtonProps = {
  variant?: ButtonVariant;
  surface?: Surface;
  href?: string;
  type?: "button" | "submit";
  className?: string;
  children: React.ReactNode;
};

/* חץ RTL-קדימה (שמאלה) — כמו ברפרנס */
function Chevron({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* שפת ה-hover (מחלקות stm-*) מוגדרת ב-motion.css — פורט מהמנוע של הרפרנס */
const base =
  "inline-flex items-center justify-center gap-[9px] focus-visible:outline-2 focus-visible:outline-offset-2";

const primary =
  "stm-btn-primary rounded-btn bg-[linear-gradient(135deg,var(--color-sea-500),var(--color-ocean-400))] px-7 py-[15px] text-[16px] font-bold text-white shadow-glow";
/* min-h + margin שלילי: אזור מגע 44px בלי לשנות את הזרימה הוויזואלית (Iron Rule #6) */
const linkHitArea = "-my-2 min-h-11 py-2";

const styles: Record<ButtonVariant, Record<Surface, string>> = {
  primary: {
    light: `${primary} focus-visible:outline-sea-500`,
    dark: `${primary} focus-visible:outline-aqua`,
  },
  outline: {
    light:
      "stm-btn-outline rounded-btn border border-edge px-[26px] py-[15px] text-[16px] font-semibold text-ocean-500 hover:border-ocean-400 focus-visible:outline-sea-500",
    dark: "stm-btn-outline stm-on-dark rounded-btn border border-white/28 px-[26px] py-[15px] text-[16px] font-semibold text-white hover:border-white/60 focus-visible:outline-aqua",
  },
  link: {
    light: `stm-link ${linkHitArea} text-[15px] font-bold text-kicker focus-visible:outline-sea-500`,
    dark: `stm-link ${linkHitArea} text-[15px] font-bold text-aqua focus-visible:outline-aqua`,
  },
};

export function Button({
  variant = "primary",
  surface = "light",
  href,
  type = "button",
  className,
  children,
}: ButtonProps) {
  const classes = cn(base, styles[variant][surface], className);
  const chevron =
    variant === "primary" ? <Chevron size={17} /> : variant === "link" ? <Chevron size={15} /> : null;

  if (href) {
    /* יעדים חיצוניים (וואטסאפ/טלפון/מייל) — <a> רגיל; next/link לנתיבים פנימיים בלבד */
    if (/^(https?:|tel:|mailto:)/.test(href)) {
      return (
        <a
          href={href}
          className={classes}
          {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
        >
          {children}
          {chevron}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
        {chevron}
      </Link>
    );
  }
  return (
    <button type={type} className={classes}>
      {children}
      {chevron}
    </button>
  );
}
