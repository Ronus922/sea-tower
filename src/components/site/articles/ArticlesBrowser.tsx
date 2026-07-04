"use client";

import { useMemo, useState } from "react";
import { ArticleCard, type ArticleCardData } from "./ArticleCard";
import type { ArticleCategory } from "@/data/articles";

/* בקרות המאמרים — סינון לפי קטגוריה, מעבר גריד/רשימה, ועימוד.
   הכול פונקציונלי ונגזר מהנתונים: הספירות, הכרטיסים המוצגים והעמודים.
   State בצד-לקוח בלבד (topic/view/page). */

const PAGE_SIZE = 6;

type Topic = "all" | ArticleCategory;
type View = "grid" | "list";

const TABS: { topic: Topic; label: string }[] = [
  { topic: "all", label: "הכל" },
  { topic: "general", label: "כללי" },
  { topic: "area", label: "בסביבה" },
];

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" fill="currentColor" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" fill="currentColor" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" fill="currentColor" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" fill="currentColor" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="5" height="5" rx="1.2" fill="currentColor" />
      <rect x="3" y="15" width="5" height="5" rx="1.2" fill="currentColor" />
      <rect x="10.5" y="5" width="10.5" height="2.4" rx="1.2" fill="currentColor" />
      <rect x="10.5" y="16" width="10.5" height="2.4" rx="1.2" fill="currentColor" />
    </svg>
  );
}
function ArrowPrev() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ArrowNext() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArticlesBrowser({ articles }: { articles: ArticleCardData[] }) {
  const [topic, setTopic] = useState<Topic>("all");
  const [view, setView] = useState<View>("grid");
  const [page, setPage] = useState(1);

  const counts = useMemo(
    () => ({
      all: articles.length,
      general: articles.filter((a) => a.category === "general").length,
      area: articles.filter((a) => a.category === "area").length,
    }),
    [articles]
  );

  const filtered = useMemo(
    () => (topic === "all" ? articles : articles.filter((a) => a.category === topic)),
    [articles, topic]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function selectTopic(next: Topic) {
    setTopic(next);
    setPage(1); // איפוס עימוד בעת החלפת קטגוריה
  }

  return (
    <>
      <div className="art-controls">
        <div className="art-tabs" role="tablist" aria-label="סינון מאמרים לפי נושא">
          {TABS.map((t) => (
            <button
              key={t.topic}
              type="button"
              className={`art-tab${topic === t.topic ? " is-active" : ""}`}
              role="tab"
              aria-selected={topic === t.topic}
              onClick={() => selectTopic(t.topic)}
            >
              {t.label} <span className="art-count">{counts[t.topic]}</span>
            </button>
          ))}
        </div>
        <div className="art-view">
          <span className="art-view-label">תצוגה:</span>
          <button
            type="button"
            className={`art-vbtn${view === "grid" ? " is-active" : ""}`}
            aria-pressed={view === "grid"}
            aria-label="תצוגת גריד"
            title="תצוגת גריד"
            onClick={() => setView("grid")}
          >
            <GridIcon />
          </button>
          <button
            type="button"
            className={`art-vbtn${view === "list" ? " is-active" : ""}`}
            aria-pressed={view === "list"}
            aria-label="תצוגת רשימה"
            title="תצוגת רשימה / טבלה"
            onClick={() => setView("list")}
          >
            <ListIcon />
          </button>
        </div>
      </div>

      <div
        className={`art-wrap ${view === "grid" ? "is-grid" : "is-list"}`}
        role="region"
        aria-label="רשימת מאמרים"
      >
        {visible.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="art-pagination" aria-label="ניווט עמודים">
          <button
            type="button"
            className={`pg-link pg-edge${current === 1 ? " is-disabled" : ""}`}
            aria-disabled={current === 1}
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            <span>הקודם</span>
            <ArrowPrev />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={`pg-link${p === current ? " is-current" : ""}`}
              aria-current={p === current ? "page" : undefined}
              aria-label={`עמוד ${p}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className={`pg-link pg-edge${current === totalPages ? " is-disabled" : ""}`}
            aria-disabled={current === totalPages}
            disabled={current === totalPages}
            rel="next"
            onClick={() => setPage(current + 1)}
          >
            <ArrowNext />
            <span>הבא</span>
          </button>
        </nav>
      )}
    </>
  );
}
