import type { NextConfig } from "next";

import { LEGACY_REDIRECTS, toLowercaseEncodedPath } from "./src/lib/legacy-redirects";

/* גלריית החדרים נשמרת ב-GuestHub ומוגשת משם (/uploads/rooms/...). במקום לחשוף
   את דומיין הבק-אופיס לדפדפן, האתר מגיש אותה מאותו origin דרך rewrite ל-loopback
   — כך next/image מייעל אותה כתמונה מקומית */
const GUESTHUB = process.env.GUESTHUB_API_URL ?? "http://127.0.0.1:3007";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    /* AVIF לפני WebP — ברירת המחדל של Next היא WebP בלבד (SEO-AUDIT A3) */
    formats: ["image/avif", "image/webp"],
  },
  /* כל כתובות האתר הישן מאונדקסות עם סלאש נגרר. נורמליזציית הסלאש המובנית של Next
     רצה לפני `redirects()`, כך ש-`/מאמרים/` היה נענה ב-308 אל `/מאמרים` ורק אז ב-301
     אל היעד — שרשרת של שני hops. כיבוי הנורמליזציה מאפשר להתאים את הצורה עם הסלאש
     ישירות (hop אחד), וכלל ה-normaliser בסוף הרשימה משחזר את התנהגות ברירת המחדל
     לכל שאר האתר. */
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [{ source: "/room-images/:path*", destination: `${GUESTHUB}/uploads/rooms/:path*` }];
  },
  async redirects() {
    return [
      /* הפניות 301 מהאתר הישן. לכל נתיב שתי צורות source — עם סלאש נגרר ובלי — שתיהן
         בקידוד אחוזים באותיות קטנות, הצורה שאליה Next מנרמל כל בקשה נכנסת. כך גם URL
         מקודד באותיות גדולות (%D7, מה שדפדפנים שולחים) וגם URL עם יוניקוד גלוי נתפסים
         באותו כלל. `statusCode: 301` ולא `permanent: true` — האחרון מייצר 308. */
      ...LEGACY_REDIRECTS.flatMap(({ from, to }) => {
        const encoded = toLowercaseEncodedPath(from);
        return [
          { source: `${encoded}/`, destination: to, statusCode: 301 as const },
          { source: encoded, destination: to, statusCode: 301 as const },
        ];
      }),
      /* משחזר את נורמליזציית הסלאש הנגרר שכיבינו למעלה — חייב להישאר אחרון, אחרי כל
         כללי ה-301, אחרת יבלע אותם ויחזיר את שרשרת שני ה-hops */
      { source: "/:path+/", destination: "/:path+", statusCode: 308 },
    ];
  },
};

export default nextConfig;
