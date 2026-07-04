import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { WaveSeparator } from "@/components/ui/WaveSeparator";
import { MotionEngine } from "@/components/site/MotionEngine";
import { ArticlesBrowser } from "@/components/site/articles/ArticlesBrowser";
import { LISTED_ARTICLES } from "@/data/articles";
import { pageMeta, buildBreadcrumbLd } from "@/lib/seo";

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
      <MotionEngine />

      {/* Hero — גרדיאנט נייבי, זוהר כחול, פירורי לחם, קיקר, כותרת, פסקה וגל תחתון */}
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,var(--color-navy-900)_0%,var(--color-ocean-700)_58%,var(--color-ocean-600)_100%)] pt-[60px] pb-[110px] text-center text-white md:pb-[130px]">
        <div
          aria-hidden="true"
          className="absolute -top-[120px] -left-20 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.35),transparent_68%)] blur-[10px]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-[60px] bottom-[60px] size-[300px] rounded-full bg-[radial-gradient(circle,rgba(58,155,214,0.18),transparent_70%)]"
        />
        <Container className="relative z-[2]">
          <nav
            aria-label="פירורי לחם"
            className="mb-[18px] inline-flex items-center gap-2 text-[13.5px] font-medium text-[#acc8dd]"
          >
            <Link
              href="/"
              className="-my-2 inline-flex min-h-11 items-center py-2 transition-colors hover:text-white"
            >
              ראשי
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="#acc8dd"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-semibold text-white">מאמרים</span>
          </nav>
          <div
            data-rev="up"
            className="mb-3.5 text-sm font-semibold tracking-[0.14em] text-[#5fa8d8]"
          >
            פוסטים מומלצים
          </div>
          <h1
            data-ws=""
            className="mb-[18px] text-[40px]/[1.08] font-extrabold tracking-[-0.01em] md:text-[54px]/[1.08]"
          >
            מאמרים
          </h1>
          <p
            data-rev="up"
            className="mx-auto max-w-[640px] text-[17px]/[1.66] font-light text-[#cdddea] md:text-[18px]/[1.66]"
          >
            {INTRO}
          </p>
        </Container>
        <WaveSeparator position="bottom" fill="var(--color-cloud)" />
      </section>

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
