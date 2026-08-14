import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/PageIntro";
import { MotionEngine } from "@/components/site/MotionEngine";
import { ArticlesBrowser } from "@/components/site/articles/ArticlesBrowser";
import { LISTED_ARTICLES } from "@/data/articles";
import { pageMeta, buildBreadcrumbLd, buildWebPageLd } from "@/lib/seo";

const INTRO =
  "טיפים, מדריכים והמלצות על נופש בחיפה, השכרת דירות מרוהטות, ומה כדאי לראות ולעשות סביב מגדל הים — חוף הכרמל.";

export const metadata: Metadata = pageMeta({
  title: "מאמרים — טיפים ומדריכים לנופש בחיפה | מגדל הים",
  description: INTRO,
  path: "/articles",
});

/* רק שדות הכרטיס עוברים ל-Client Component */
const cards = LISTED_ARTICLES.map((a) => ({
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt,
  category: a.category,
  image: a.image,
  imageAlt: a.imageAlt,
}));

export default function ArticlesIndex() {
  return (
    <>
      {/* שער חשיפות MotionEngine — רץ לפני ה-hydration כדי למנוע הבהוב */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('stm-js')",
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbLd([
              { name: "ראשי", path: "/" },
              { name: "מאמרים", path: "/articles" },
            ])
          ),
        }}
      />
      {/* CollectionPage — ה-builder היה קיים ולא היה בשימוש (SEO-AUDIT A8) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildWebPageLd({
              type: "CollectionPage",
              name: "מאמרים — מגדל הים",
              description: INTRO,
              path: "/articles",
            })
          ),
        }}
      />
      <MotionEngine />

      <PageIntro
        crumbs={[{ name: "ראשי", href: "/" }, { name: "מאמרים" }]}
        kicker="מהבלוג של מגדל הים"
        title="מאמרים ומדריכים"
        lead={INTRO}
      />

      {/* בקרות + אוסף המאמרים + עימוד (אינטראקטיבי) */}
      <section className="art-section" aria-labelledby="art-all-heading">
        <div className="art-inner">
          {/* היררכיית כותרות תקינה (H1→H2); כרטיסי המאמרים הם H3 */}
          <h2 id="art-all-heading" className="sr-only">
            כל המאמרים
          </h2>
          <ArticlesBrowser articles={cards} />
        </div>
      </section>
    </>
  );
}
