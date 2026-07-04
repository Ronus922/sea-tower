import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/business";
import { ARTICLES } from "@/data/articles";

/* מפת אתר — כל העמודים הציבוריים + כל המאמרים. /design-system חסום ב-robots. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = BUSINESS.siteUrl;
  const now = new Date();
  const paths = [
    "",
    "/about",
    "/solutions",
    "/articles",
    "/faq",
    "/house-rules",
    "/terms",
    "/contact",
  ];

  return [
    ...paths.map((p) => ({
      url: `${base}${p}`,
      lastModified: now,
    })),
    ...ARTICLES.map((a) => ({
      url: `${base}/articles/${a.slug}`,
      lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
    })),
  ];
}
