import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/business";

/* robots — פתוח לכל הסורקים (כולל סורקי AI); חוסם עמודים פנימיים/API */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/design-system", "/api/"],
    },
    sitemap: `${BUSINESS.siteUrl}/sitemap.xml`,
    host: BUSINESS.siteUrl,
  };
}
