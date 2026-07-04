import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABEL, type Article } from "@/data/articles";

/* כרטיס מאמר יחיד — משמש גם ברשת האינדקס (גריד/רשימה) וגם ב"מאמרים נוספים".
   המעטפת (.art-wrap.is-grid / .is-list) קובעת את הפריסה; הכרטיס זהה בשני המצבים.
   חשיפה מדורגת: אנימציית CSS על .art-item (בטוחה לרנדור-מחדש בסינון/עימוד,
   בשונה מ-MotionEngine החד-פעמי; מכבדת prefers-reduced-motion). */

/* רק השדות הדרושים לכרטיס — בטוח למעבר ל-Client Component */
export type ArticleCardData = Pick<
  Article,
  "slug" | "title" | "excerpt" | "category" | "image" | "imageAlt"
>;

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

export function ArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <article className="art-item" data-topic={article.category}>
      <Link className="art-link" href={`/articles/${article.slug}`}>
        <div className="art-media">
          <Image
            className="art-img"
            src={article.image}
            alt={article.imageAlt}
            fill
            sizes="(max-width: 560px) 100vw, (max-width: 820px) 50vw, 360px"
          />
        </div>
        <div className="art-body">
          <span className={`art-tag tag-${article.category}`}>
            {CATEGORY_LABEL[article.category]}
          </span>
          <h3 className="art-title">{article.title}</h3>
          <p className="art-excerpt">{article.excerpt}</p>
          <span className="art-more">
            קראו עוד <Chevron size={15} />
          </span>
        </div>
        <span className="art-chev" aria-hidden="true">
          <Chevron size={20} />
        </span>
      </Link>
    </article>
  );
}
