import { ArticleCard } from "./ArticleCard";
import { getRelated } from "@/data/articles";

/* "מאמרים נוספים" — נבחרים דינמית (getRelated): לעולם לא המאמר הנוכחי,
   עד 3, כל כרטיס מקושר לסלוג שלו. משתמש ב-ArticleCard הגרידי (DRY). */

export function RelatedArticles({ slug }: { slug: string }) {
  const related = getRelated(slug);
  if (related.length === 0) return null;

  return (
    <section className="rel-sec">
      <div className="rel-inner">
        <div className="rel-head" data-rev="up">
          <span aria-hidden="true" />
          להמשך קריאה
        </div>
        <h2 className="rel-h2" data-rev="up">
          מאמרים נוספים
        </h2>
        <div className="art-wrap is-grid">
          {related.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}
