import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
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
import { BUSINESS } from "@/lib/business";

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
  const url = `${BUSINESS.siteUrl}/articles/${article.slug}`;
  const img = `${BUSINESS.siteUrl}${article.image}`;
  return {
    title: article.seoTitle,
    description: article.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.seoTitle,
      description: article.seoDescription,
      url,
      siteName: BUSINESS.name,
      locale: "he_IL",
      images: [{ url: img, alt: article.imageAlt }],
      ...(article.publishedAt ? { publishedTime: article.publishedAt } : {}),
      authors: [article.author],
    },
  };
}

function MetaRow({ article }: { article: Article }) {
  const items = [
    article.publishedAt && (
      <span className="ar-m" key="date">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="#cdddea" strokeWidth="1.7" />
          <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="#cdddea" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        {formatHebrewDate(article.publishedAt)}
      </span>
    ),
    <span className="ar-m" key="author">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.4" stroke="#cdddea" strokeWidth="1.7" />
        <path d="M5 20c0-3.4 3.1-5.6 7-5.6s7 2.2 7 5.6" stroke="#cdddea" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      מאת {article.author}
    </span>,
    <span className="ar-m" key="reading">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.4" stroke="#cdddea" strokeWidth="1.7" />
        <path d="M12 7.4V12l3 2" stroke="#cdddea" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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

  const url = `${BUSINESS.siteUrl}/articles/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seoDescription,
    image: `${BUSINESS.siteUrl}${article.image}`,
    inLanguage: "he-IL",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: BUSINESS.nameEn,
      url: BUSINESS.siteUrl,
    },
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ראשי", item: BUSINESS.siteUrl },
      { "@type": "ListItem", position: 2, name: "מאמרים", item: `${BUSINESS.siteUrl}/articles` },
      { "@type": "ListItem", position: 3, name: article.breadcrumbLabel ?? article.title, item: url },
    ],
  };

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

      {/* Hero — פירורי לחם, תגית קטגוריה, כותרת דינמית, שורת מטא, וגל תחתון */}
      <section className="ar-hero">
        <div className="ar-blob b1" aria-hidden="true" />
        <div className="ar-blob b2" aria-hidden="true" />
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
        <WaveSeparator position="bottom" fill="var(--color-cloud)" />
      </section>

      {/* תמונת נושא — עם שכבת פרלקסה (דסקטופ) וכיתוב */}
      <section className="ar-featsec">
        <div className="ar-featwrap" data-rev="media">
          <div className="ar-featparallax" data-parallax>
            <Image
              className="ar-featimg"
              src={article.image}
              alt={article.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1000px"
            />
          </div>
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
