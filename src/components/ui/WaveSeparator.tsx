import { cn } from "@/lib/cn";

/* חוצץ גלים — ה-paths המדויקים של מעברי המקטעים ב-Home.html (לא מוטיב הגל
   הדקורטיבי מפרק 12 בספר המותג). ממוקם אבסולוטית; ההורה חייב position:relative.
   fill = צבע המקטע הסמוך (למשל "var(--color-cloud)" או "#fff") */
const PATHS = {
  bottom: "M0 70 C 200 20 380 110 640 70 C 900 30 1080 100 1280 60 L1280 120 L0 120 Z",
  top: "M0 64 C 160 110 320 110 480 70 C 640 30 800 30 960 66 C 1080 94 1180 96 1280 72 L1280 0 L0 0 Z",
  /* וריאציות נוספות מ-Home.html — תחתית "למה אנחנו" וראש "צור קשר" */
  bottom2:
    "M0 56 C 160 12 320 12 480 50 C 640 88 800 88 960 54 C 1080 28 1180 26 1280 48 L1280 120 L0 120 Z",
  top2: "M0 50 C 200 100 380 10 640 50 C 900 90 1080 20 1280 60 L1280 0 L0 0 Z",
} as const;

export function WaveSeparator({
  position = "bottom",
  fill,
  flow = false,
  className,
}: {
  position?: keyof typeof PATHS;
  fill: string;
  /* גל בזרימה (לא אבסולוטי) — לראש הפוטר: השטח שמעל הקימור שקוף כך שרקע
     המקטע הקודם נראה דרכו. relative כדי להיצבע מעל רקעי המקטע בחפיפה,
     ‎-mb-px מונע תפר סאב-פיקסל מול התוכן שמתחתיו */
  flow?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1280 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn(
        "pointer-events-none block h-[70px] w-full md:h-[120px]",
        flow
          ? "relative -mb-px"
          : cn("absolute inset-x-0", position.startsWith("bottom") ? "-bottom-px" : "-top-px"),
        className
      )}
    >
      <path d={PATHS[position]} fill={fill} />
    </svg>
  );
}
