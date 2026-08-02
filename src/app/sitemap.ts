import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo";
import { ARTICLES } from "@/data/articles";

/* מפת אתר — כל העמודים הציבוריים הניתנים לאינדוקס + כל המאמרים.
   /design-system חסום ב-robots; /booking/checkout הוא noindex ולכן לא נכלל.

   lastModified נכתב רק כשיש לו מקור אמת (publishedAt/updatedAt של מאמר).
   קודם לכן כל הערכים היו new Date() — כלומר "עכשיו" בכל בקשה — ואות כזה
   גורם לסורקים להתעלם מ-lastmod לגמרי. עדיף להשמיט מאשר לדווח ערך שקרי. */

const PATHS = [
  "/",
  "/about",
  "/rooms",
  "/solutions",
  "/booking",
  "/articles",
  "/faq",
  "/house-rules",
  "/terms",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PATHS.map((p) => ({ url: absUrl(p) })),
    ...ARTICLES.map((a) => {
      const stamp = a.updatedAt ?? a.publishedAt;
      return {
        url: absUrl(`/articles/${a.slug}`),
        ...(stamp ? { lastModified: new Date(stamp) } : {}),
      };
    }),
  ];
}
