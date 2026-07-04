import { Open_Sans } from "next/font/google";

/* Open Sans — הגופן הראשי של האתר כולו (כפי שבכל הרפרנסים למעט ספר המותג).
   נטען פעם אחת ומוזרק כמשתנה ‎--font-open-sans על ‎<html>‎ ב-layout;
   ‎--font-sans ב-tokens.css מצביע עליו כך שכל העמודים יורשים Open Sans.
   משקלים 300–800, עברית + לטינית, font-display: swap. */
export const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});
