import { Open_Sans } from "next/font/google";

/* Open Sans — הגופן הנראה בעמודי המסמך של הרפרנס (regulations/Faq/House-rules).
   מוגבל לעמודים אלו בלבד (עוטפים ב-className); שאר האתר נשאר Rubik.
   מופע יחיד משותף כדי שכל שלושת העמודים יחלקו את אותם קובצי גופן ו-preload.
   משקלים 300–800, עברית + לטינית, font-display: swap. */
export const openSans = Open_Sans({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});
