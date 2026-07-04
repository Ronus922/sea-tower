import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading, SectionKicker } from "@/components/ui/SectionHeading";
import { Chip, ImageBadge } from "@/components/ui/Chip";
import { Stars } from "@/components/ui/Stars";
import { StatCard } from "@/components/ui/StatCard";
import { IconTile } from "@/components/ui/IconTile";
import { CheckItem } from "@/components/ui/CheckItem";
import { WaveSeparator } from "@/components/ui/WaveSeparator";

/* רפרנס פנימי של מערכת העיצוב — לפיתוח בלבד: בפרודקשן מחזיר 404,
   ואסור לקשר אליו משום ניווט ציבורי */

const CORE_COLORS = [
  { name: "Deep Sea", hex: "#081625" },
  { name: "Midnight", hex: "#0a1d31" },
  { name: "Primary Navy", hex: "#0e2540" },
  { name: "Ocean Deep", hex: "#143c61" },
  { name: "Ocean", hex: "#1d5888" },
  { name: "Ocean Bright", hex: "#2b7fb8" },
  { name: "Sky", hex: "#3a9bd6" },
  { name: "Aqua Light", hex: "#7cd0f7" },
  { name: "Card Mist", hex: "#f5f9fc" },
  { name: "Section Cloud", hex: "#eaf0f6" },
  { name: "Gold", hex: "#f5b942" },
  { name: "Sand Gold", hex: "#c2a16a" },
];

const PHOTOS = [
  { src: "/images/hero-terrace.jpg", alt: "מרפסת פנטהאוז מול מפרץ חיפה בשעת שקיעה" },
  { src: "/images/suite-royal.jpg", alt: "חדר שינה בסוויטה עם חלונות פנורמיים לים" },
  { src: "/images/suite-jacuzzi.jpg", alt: "סוויטה עם ג׳קוזי בשעת ערב מול הים" },
  { src: "/images/bedroom-classic.jpg", alt: "חדר שינה קלאסי עם דלתות למרפסת ונוף לים" },
  { src: "/images/living-room.jpg", alt: "סלון מעוצב עם ספה כחולה ונוף לים" },
];

function DemoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-12">
      <Container className="flex flex-col gap-7">
        <h2 className="text-h3 text-navy-800">{title}</h2>
        {children}
      </Container>
    </section>
  );
}

export default function DesignSystemPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main>
      {/* כותרת העמוד */}
      <header className="relative overflow-hidden bg-[linear-gradient(120deg,#0a1d31_0%,#143c61_58%,#1d5888_100%)] pt-16 pb-32 text-white">
        <Container className="flex flex-col items-start gap-5">
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="" width={44} height={44} />
            <div className="leading-tight">
              <div className="text-lg font-extrabold">מגדל הים</div>
              <div className="text-[11px] font-semibold tracking-overline text-[#9fc0d8]">
                DESIGN SYSTEM · PHASE 2
              </div>
            </div>
          </div>
          <h1 className="text-[40px]/[1.1] font-extrabold tracking-heading md:text-display">
            מערכת העיצוב
            <br />
            של{" "}
            <span className="bg-[linear-gradient(120deg,#7cd0f7,#46a6dd)] bg-clip-text text-transparent">
              מגדל הים
            </span>
          </h1>
          <p className="max-w-[560px] text-lead text-[#cdddea]">
            עמוד תצוגה זמני — צבעים, טיפוגרפיה, כפתורים ורכיבי הבסיס שמהם ייבנה האתר.
          </p>
        </Container>
        <WaveSeparator position="bottom" fill="#fff" />
      </header>

      <DemoSection title="צבעוניות">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CORE_COLORS.map((c) => (
            <div key={c.hex} className="overflow-hidden rounded-card border border-line shadow-e1">
              <div className="h-16" style={{ background: c.hex }} />
              <div className="bg-white px-3 py-2">
                <div className="text-[13px] font-bold text-navy-800">{c.name}</div>
                <div className="text-[12px] text-ink-dim" dir="ltr">
                  {c.hex}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DemoSection>

      <DemoSection title="טיפוגרפיה — Rubik + Frank Ruhl Libre">
        <div className="flex flex-col gap-4">
          <div className="text-[40px]/[1.1] font-extrabold tracking-heading text-navy-800 md:text-display">
            לחיות מול הים
          </div>
          <div className="text-h2 tracking-heading text-navy-800">כותרת מקטע</div>
          <div className="text-h3 text-navy-800">כותרת משנה</div>
          <div className="font-serif text-h3 font-medium text-navy-800">
            ״לחיות מול הים, ברמה מלונאית.״ — Frank Ruhl Libre לציטוטים והקשרי יוקרה
          </div>
          <p className="max-w-[640px] text-lead">
            פסקת פתיחה גדולה ואוורירית שמציגה את המקטע ומזמינה להמשיך לקרוא.
          </p>
          <p className="max-w-[640px] text-body">
            טקסט גוף רגיל לתיאורים ולפסקאות תוכן. נוח לקריאה לאורך זמן עם גובה שורה מרווח.
          </p>
        </div>
      </DemoSection>

      <DemoSection title="כפתורים">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-5 rounded-card-lg border border-line bg-white p-8">
            <span className="text-[13px] font-bold text-ink-dim">על רקע בהיר</span>
            <Button variant="primary">הזמינו עכשיו</Button>
            <Button variant="outline">צפו בדירות</Button>
            <Button variant="link">לפרטים והזמנה</Button>
          </div>
          <div className="flex flex-col items-start gap-5 rounded-card-lg bg-navy-900 p-8">
            <span className="text-[13px] font-bold text-[#6d94b3]">על רקע כהה</span>
            <Button variant="primary" surface="dark">
              הזמינו עכשיו
            </Button>
            <Button variant="outline" surface="dark">
              צפו בדירות
            </Button>
            <Button variant="link" surface="dark">
              לפרטים והזמנה
            </Button>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="רכיבים">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-card border border-line bg-mist p-7">
            <span className="text-[12px] font-bold text-ink-dim">תווית מקדימה + כותרת</span>
            <SectionHeading kicker="אודות מגדל הים" title="לחוות את החיים" />
          </div>
          <div className="flex flex-col gap-4 rounded-card border border-line bg-mist p-7">
            <span className="text-[12px] font-bold text-ink-dim">צ׳יפים ותגיות</span>
            <div className="flex flex-wrap gap-2">
              <Chip>4 אורחים</Chip>
              <Chip>86 מ״ר</Chip>
              <Chip>2 חדרים</Chip>
            </div>
            <div className="flex flex-wrap gap-2">
              <ImageBadge variant="brand">ג׳קוזי</ImageBadge>
              <ImageBadge variant="light">נוף חזיתי</ImageBadge>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-card border border-line bg-mist p-7">
            <span className="text-[12px] font-bold text-ink-dim">דירוג</span>
            <Stars />
            <div className="flex items-center gap-2 text-[15px] font-semibold text-navy-800">
              <span>4.8</span>
              <span className="font-normal text-ink-dim">· מאות אורחים מרוצים</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-card border border-line bg-mist p-7">
            <span className="text-[12px] font-bold text-ink-dim">בלוקי נתון</span>
            <div className="grid grid-cols-2 gap-3">
              <StatCard value="50 מ׳" label="מקו החוף" />
              <StatCard value="14+" label="דירות וסוויטות" />
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-card border border-line bg-mist p-7">
            <span className="text-[12px] font-bold text-ink-dim">אריח אייקון + שורות וי</span>
            <IconTile>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 13c3 0 3-2 6-2s3 2 6 2 3-2 6-2"
                  stroke="#7cd0f7"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M3 18c3 0 3-2 6-2s3 2 6 2 3-2 6-2"
                  stroke="#fff"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </IconTile>
            <div className="flex flex-col gap-2">
              <CheckItem>נוף חזיתי לים מכל דירה</CheckItem>
              <CheckItem>50 מ׳ מהטיילת והחוף</CheckItem>
              <CheckItem>מאובזר ברמה מלונאית</CheckItem>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-card border border-line bg-mist p-7">
            <span className="text-[12px] font-bold text-ink-dim">ריחוף צף (Motion)</span>
            <div className="flex h-24 items-center justify-center">
              <div className="animate-float rounded-tile border border-line bg-white px-5 py-3 shadow-float">
                <div className="text-[22px] leading-none font-extrabold text-navy-800">50 מ׳</div>
                <div className="text-[11px] font-semibold text-ink-dim">מקו המים</div>
              </div>
            </div>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="תמונות (placeholder מהרפרנס — יוחלפו בצילום אמיתי)">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {PHOTOS.map((p) => (
            <Image
              key={p.src}
              src={p.src}
              alt={p.alt}
              width={400}
              height={300}
              sizes="(min-width: 768px) 20vw, 50vw"
              className="h-36 w-full rounded-card object-cover shadow-e2"
            />
          ))}
        </div>
      </DemoSection>

      {/* חוצץ גלים לדוגמה */}
      <section className="relative bg-navy-900 py-24 text-center">
        <WaveSeparator position="top" fill="#fff" />
        <Container>
          <SectionKicker dark>חוצץ גלים</SectionKicker>
          <p className="mt-3 text-h3 font-bold text-white">מעבר בין מקטע בהיר למקטע כהה</p>
        </Container>
        <WaveSeparator position="bottom" fill="var(--color-cloud)" />
      </section>

      <footer className="bg-cloud py-10 text-center text-sm text-ink-dim">
        מגדל הים — רפרנס מערכת עיצוב · פנימי לפיתוח בלבד
      </footer>
    </main>
  );
}
