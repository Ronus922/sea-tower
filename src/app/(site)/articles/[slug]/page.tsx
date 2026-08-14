import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MotionEngine } from "@/components/site/MotionEngine";
import { ArticleBody } from "@/components/site/articles/ArticleBody";
import { RelatedArticles } from "@/components/site/articles/RelatedArticles";
import {
  ARTICLES,
  CATEGORY_LABEL,
  getArticle,
  readingMinutes,
  type Article,
} from "@/data/articles";
import { absUrl, businessRef, buildBreadcrumbLd, pageMeta, WEBSITE_ID } from "@/lib/seo";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

/* תאריך עברי מדויק ("15 ביוני 2026") — מפה ידנית, דטרמיניסטי, בלי תלות ב-Intl */
const HE_MONTHS = [
  "בינואר", "בפברואר", "במרץ", "באפריל", "במאי", "ביוני",
  "ביולי", "באוגוסט", "בספטמבר", "באוקטובר", "בנובמבר", "בדצמבר",
];
function formatHebrewDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${HE_MONTHS[m - 1]} ${y}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return pageMeta({
    title: article.seoTitle,
    description: article.seoDescription,
    path: `/articles/${article.slug}`,
    image: { url: article.image, alt: article.imageAlt },
    article: {
      ...(article.publishedAt ? { publishedTime: article.publishedAt } : {}),
      ...(article.updatedAt ? { modifiedTime: article.updatedAt } : {}),
      authors: [article.author],
    },
  });
}

function MetaRow({ article }: { article: Article }) {
  const items = [
    article.publishedAt && (
      <span className="ar-m" key="date">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        {formatHebrewDate(article.publishedAt)}
      </span>
    ),
    <span className="ar-m" key="author">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5 20c0-3.4 3.1-5.6 7-5.6s7 2.2 7 5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      מאת {article.author}
    </span>,
    <span className="ar-m" key="reading">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 7.4V12l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {readingMinutes(article)} דקות קריאה
    </span>,
  ].filter(Boolean) as React.ReactNode[];

  return (
    <div className="ar-meta" data-rev="up">
      {items.map((node, i) => (
        <span key={i} className="contents">
          {i > 0 && <span className="ar-dot" aria-hidden="true" />}
          {node}
        </span>
      ))}
    </div>
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const url = absUrl(`/articles/${article.slug}`);
  /* BlogPosting — הסוג המדויק לתוכן מערכתי; המוציא לאור מפנה לישות העסק
     היחידה ב-@id במקום להגדיר ארגון מתחרה. תאריכים נכתבים רק כשהם קיימים
     במקור — לא ממציאים datePublished/dateModified. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.seoDescription,
    image: absUrl(article.image),
    inLanguage: "he-IL",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@type": "Organization", name: article.author, url: absUrl("/about") },
    publisher: businessRef,
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    ...(article.updatedAt ?? article.publishedAt
      ? { dateModified: article.updatedAt ?? article.publishedAt }
      : {}),
  };
  const breadcrumbLd = buildBreadcrumbLd([
    { name: "ראשי", path: "/" },
    { name: "מאמרים", path: "/articles" },
    {
      name: article.breadcrumbLabel ?? article.title,
      path: `/articles/${article.slug}`,
    },
  ]);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('stm-js')",
        }}
      />
      <MotionEngine />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* פתיח מאמר — עמוד מגזין שקט: קטגוריה, כותרת סריפית ושורת מטא */}
      <section className="ar-hero">
        <div className="ar-heroinner">
          <nav className="ar-crumb" aria-label="פירורי לחם">
            <Link href="/">ראשי</Link>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="#acc8dd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Link href="/articles">מאמרים</Link>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="#acc8dd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="cur" aria-current="page">
              {article.breadcrumbLabel ?? article.title}
            </span>
          </nav>
          <div className="ar-tagline" data-rev="up">
            {CATEGORY_LABEL[article.category]}
          </div>
          <h1 className="ar-title" data-ws="">
            {article.title}
          </h1>
          <MetaRow article={article} />
        </div>
      </section>

      {/* תמונת נושא — הפתיח החדש קצר, כך שהתמונה כבר בתחום הקיפול בדסקטופ */}
      <section className="ar-featsec">
        <div className="ar-featwrap" data-rev="media">
          <Image
            className="ar-featimg"
            src={article.image}
            alt={article.imageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1000px"
          />
        </div>
        {article.figCaption && <div className="ar-figcap">{article.figCaption}</div>}
      </section>

      {/* גוף המאמר */}
      <section className="ar-bodysec">
        <article className="ar-body">
          {article.body ? (
            <ArticleBody blocks={article.body} />
          ) : (
            <p className="ar-lead" data-rev="up">
              {article.excerpt}
            </p>
          )}
        </article>
        <div className="ar-divider" data-rev="up" />
        <div className="ar-backwrap">
          <Link className="ar-back" href="/articles">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            חזרה לכל המאמרים
          </Link>
        </div>
      </section>

      {/* מאמרים נוספים */}
      <RelatedArticles slug={article.slug} />
    </>
  );
}
