import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Chevron } from "@/components/ui/Chevron";
import type { PublicRoom } from "@/lib/booking-api";
import { roomBlurb, roomChips, roomCoverImage, roomTypeBadge } from "@/lib/rooms-view";
import { apartmentTitle } from "@/lib/apartment-view";

/* כרטיס דירה — התוכן מגיע חי מ-GuestHub (/api/public/rooms).
   גרסה image-led: הצילום תופס את רוב הכרטיס (4:3), הכותרת בסריף,
   והמאפיינים הם שורת טקסט שקטה במקום צ'יפים (DESIGN-AUDIT ממצא 4).
   אותו כרטיס משרת את הקרוסלה בעמוד הבית ואת הרשת ב-/rooms */

export function RoomCard({
  room,
  className,
  sizes,
  imagePriority = false,
}: {
  room: PublicRoom;
  className?: string;
  sizes: string;
  /* לתמונות מעל הקפל (הכרטיסים הראשונים ב-/rooms) — LCP (SEO-AUDIT A2) */
  imagePriority?: boolean;
}) {
  const cover = roomCoverImage(room);
  const badge = roomTypeBadge(room);
  const chips = roomChips(room);
  const blurb = roomBlurb(room);

  return (
    <article
      data-rev="card"
      className={cn("stm-card group flex flex-col overflow-hidden bg-white", className)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-chip">
        {cover && (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes={sizes}
            priority={imagePriority}
            className="stm-zoom object-cover"
          />
        )}
        {badge && (
          <span className="absolute top-3.5 right-3.5 bg-white/95 px-3 py-1.5 text-[12.5px] font-bold text-navy-800">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 border-x border-b border-line p-5">
        {/* אותה כותרת שעמוד ההזמנות מציג ("דירה 1102 · חדר שינה וסלון") */}
        <h3 className="ed-h3 text-navy-800">{apartmentTitle(room)}</h3>
        {chips.length > 0 && (
          <p className="text-[13.5px] font-semibold text-ink-dim">{chips.join(" · ")}</p>
        )}
        {blurb && (
          <p className="line-clamp-2 text-[14.5px] leading-[1.6] text-ink-dim">{blurb}</p>
        )}
        <Link
          href="/booking"
          className="stm-link mt-auto -mb-2 inline-flex min-h-11 items-center gap-[9px] py-2 text-[15px] font-bold text-kicker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-500"
        >
          <span>
            לפרטים והזמנה
            {/* הכותרת הנראית כבר ייחודית; לקורא המסך נשאר ההקשר לאיזו דירה */}
            <span className="sr-only"> — {apartmentTitle(room)}</span>
          </span>
          <Chevron dir="end" />
        </Link>
      </div>
    </article>
  );
}
