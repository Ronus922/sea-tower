import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageIntro } from "@/components/ui/PageIntro";
import { MotionEngine } from "@/components/site/MotionEngine";
import { RoomCard } from "@/components/site/RoomCard";
import { fetchWebsiteRooms, type PublicRoom } from "@/lib/booking-api";
import { roomBlurb, roomCoverImage } from "@/lib/rooms-view";
import { apartmentTitle } from "@/lib/apartment-view";
import { pageMeta, buildBreadcrumbLd, buildWebPageLd, absUrl, businessRef } from "@/lib/seo";

/* קטלוג הדירות — כל הדירות שסומנו "הצג באתר" ב-GuestHub. גריד אדיטוריאלי:
   הדירה הראשונה מובילה בגדול, השאר ברשת — הצילום שולט (DESIGN-AUDIT ממצא 4).
   לא מנוע הזמנות: כאן מעיינים, ובודקים זמינות ומחיר ב-/booking */

export const revalidate = 300;

const DESCRIPTION =
  "כל הדירות והסוויטות של מגדל הים בחיפה — סטודיו זוגי, דירות חדר שינה וסלון וסוויטות משפחתיות מול הים, 50 מטר מקו המים. גודל, תפוסה ותמונות לכל דירה.";

export const metadata: Metadata = pageMeta({
  title: "הדירות שלנו — מגדל הים | סוויטות ודירות נופש מול הים בחיפה",
  description: DESCRIPTION,
  path: "/rooms",
  /* תמונת שיתוף מדירה אמיתית במקום ברירת המחדל האתרית (SEO-AUDIT A9) */
  image: { url: "/images/short-term-rental.jpg", alt: "חדר שינה עם מיטה זוגית מול חלון פנורמי לים ולטיילת" },
});

/* ItemList של הדירות החיות — ישויות אירוח אמיתיות מ-GuestHub בלבד; שדות
   נכתבים רק כשיש להם ערך (SEO-AUDIT A8, בלי להמציא נתונים) */
function buildRoomsItemListLd(rooms: PublicRoom[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": absUrl("/rooms") + "#rooms",
    name: "הדירות והסוויטות של מגדל הים",
    numberOfItems: rooms.length,
    itemListElement: rooms.map((room, i) => {
      const cover = roomCoverImage(room);
      const blurb = roomBlurb(room);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Accommodation",
          name: apartmentTitle(room),
          ...(blurb ? { description: blurb } : {}),
          ...(cover ? { image: absUrl(cover.src) } : {}),
          ...(room.roomType?.name ? { accommodationCategory: room.roomType.name } : {}),
          ...(room.maxOccupancy
            ? { occupancy: { "@type": "QuantitativeValue", maxValue: room.maxOccupancy } }
            : {}),
          ...(room.sizeSqm
            ? { floorSize: { "@type": "QuantitativeValue", value: room.sizeSqm, unitCode: "MTK" } }
            : {}),
          containedInPlace: businessRef,
        },
      };
    }),
  };
}

const CARD_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";
const FEATURED_SIZES = "(min-width: 1024px) 66vw, 100vw";

export default async function Rooms() {
  const rooms = (await fetchWebsiteRooms()) ?? [];
  const [featured, ...rest] = rooms;

  return (
    <>
      {/* שער חשיפות: רץ לפני ה-hydration כך שתוכן מסומן לא מהבהב לפני האנימציה */}
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
              { name: "הדירות והסוויטות", path: "/rooms" },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildWebPageLd({
              type: "CollectionPage",
              name: "הדירות והסוויטות — מגדל הים",
              description: DESCRIPTION,
              path: "/rooms",
            })
          ),
        }}
      />
      {rooms.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildRoomsItemListLd(rooms)) }}
        />
      )}
      <MotionEngine />

      <PageIntro
        crumbs={[{ name: "ראשי", href: "/" }, { name: "הדירות והסוויטות" }]}
        kicker="הקטלוג המלא"
        title={
          <>
            הדירות והסוויטות
            <br />
            של מגדל הים
          </>
        }
        lead="סטודיו זוגי, דירת חדר שינה וסלון או סוויטה משפחתית — כולן במגדל אחד מול הים, 50 מטר מקו המים. בחרו את מה שמתאים לכם ובדקו זמינות ומחיר לתאריכים שלכם."
      />

      {/* הקטלוג — דירה מובילה בגדול, השאר ברשת. הריפוד התחתון מפנה לגל הפוטר */}
      <section className="ed-wave-clear bg-white pt-12 md:pt-16">
        <Container>
          {rooms.length > 0 ? (
            <>
              {/* כותרת המקטע. בלעדיה העמוד קפץ מ-h1 ישר ל-h3 של הכרטיסים */}
              <h2 className="ed-h2 mb-9 text-navy-800">
                {rooms.length === 1
                  ? "דירה אחת פנויה לאירוח"
                  : `${rooms.length} דירות וסוויטות בבניין אלמוג`}
              </h2>
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {featured && (
                  <RoomCard
                    room={featured}
                    sizes={FEATURED_SIZES}
                    imagePriority
                    className="sm:col-span-2"
                  />
                )}
                {rest.map((room, i) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    sizes={CARD_SIZES}
                    imagePriority={i === 0}
                  />
                ))}
              </div>
              <p className="ed-hairline mt-12 pt-5 text-[14.5px] leading-relaxed text-ink-dim">
                המחיר והזמינות משתנים לפי תאריכים — בדקו את התאריכים שלכם במנוע ההזמנות.
              </p>
            </>
          ) : (
            /* GuestHub לא זמין — העמוד לא נופל, והמבקר ממשיך למנוע ההזמנות */
            <div className="ed-hairline py-12 text-center text-[15.5px] leading-relaxed text-ink-dim">
              רשימת הדירות מתעדכנת ברגעים אלה — אפשר לבדוק זמינות ומחירים ישירות במנוע
              ההזמנות.
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button href="/booking">בדקו זמינות ומחיר</Button>
            <Button href="/contact" variant="outline">
              צרו קשר
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
