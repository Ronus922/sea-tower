import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

/* פתיח עמוד שקט — טיפוגרפיה על נייר חם, מיושר להתחלה.
   מחליף את תבנית ה"hero נייבי-גרדיאנט + גל" שהייתה משוכפלת ב-7 עמודים
   (DESIGN-AUDIT ממצא 1). ה-H1 בסריף; בלי גרדיאנט-טקסט, בלי blobs, בלי גל. */
export function PageIntro({
  crumbs,
  kicker,
  title,
  lead,
  children,
  className,
}: {
  crumbs: Array<{ name: string; href?: string }>;
  kicker?: string;
  title: React.ReactNode;
  lead?: string;
  /* תוכן נוסף מתחת ל-lead (חיפוש, עוגנים, כפתורים) */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("ed-intro", className)}>
      <Container className="pt-9 pb-12 md:pt-12 md:pb-16">
        <Breadcrumbs trail={crumbs} />
        {kicker && <p className="ed-overline mt-7">{kicker}</p>}
        <h1 className={cn("ed-h1 max-w-[22ch] text-navy-800", kicker ? "mt-4" : "mt-7")}>
          {title}
        </h1>
        {lead && <p className="mt-5 max-w-[560px] text-lead text-ink">{lead}</p>}
        {children}
      </Container>
    </section>
  );
}
