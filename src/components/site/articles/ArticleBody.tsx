import Link from "next/link";
import type { ArticleBlock, Run } from "@/data/articles";

/* מרנדר גוף מאמר מתוכן מובנה (ArticleBlock[]) — ללא HTML גולמי / dangerouslySetInnerHTML.
   חשיפה בגלילה: data-rev דרך MotionEngine. */

function Runs({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((r, i) => {
        if (typeof r === "string") return <span key={i}>{r}</span>;
        if ("b" in r) return <strong key={i}>{r.b}</strong>;
        return (
          <Link key={i} className="inl" href={r.a.href}>
            {r.a.text}
          </Link>
        );
      })}
    </>
  );
}

export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.t) {
          case "lead":
            return (
              <p key={i} className="ar-lead" data-rev="up">
                <Runs runs={block.runs} />
              </p>
            );
          case "p":
            return (
              <p key={i} data-rev="up">
                <Runs runs={block.runs} />
              </p>
            );
          case "h2":
            return (
              <h2 key={i} data-rev="up">
                <Runs runs={block.runs} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} data-rev="up">
                <Runs runs={block.runs} />
              </h3>
            );
          case "ul":
            return (
              <ul key={i} data-rev="up">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Runs runs={item} />
                  </li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={i} className="ar-quote" data-rev="up">
                <Runs runs={block.runs} />
                <cite>{block.cite}</cite>
              </blockquote>
            );
        }
      })}
    </>
  );
}
