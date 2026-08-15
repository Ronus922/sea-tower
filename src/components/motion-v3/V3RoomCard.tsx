import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Chip, ImageBadge } from "@/components/ui/Chip";
import { Chevron } from "@/components/ui/Chevron";
import type { PublicRoom } from "@/lib/booking-api";
import { roomBlurb, roomChips, roomCoverImage, roomTypeBadge } from "@/lib/rooms-view";
import { apartmentTitle } from "@/lib/apartment-view";

/* עותק /v2 של RoomCard (ניסוי התנועה): בלי data-rev="card" של MotionEngine —
   חשיפת התמונה (clip-path + ‏scale) שייכת ל-GSAP ‏(V3Root, אלמנט 3) דרך
   מחלקת v3-room-media על עטיפת התמונה */
export function V3RoomCard({
  room,
  className,
  sizes,
  imagePriority = false,
}: {
  room: PublicRoom;
  className?: string;
  sizes: string;
  imagePriority?: boolean;
}) {
  const cover = roomCoverImage(room);
  const badge = roomTypeBadge(room);
  const chips = roomChips(room);
  const blurb = roomBlurb(room);

  return (
    <article
      className={cn(
        "stm-card flex flex-col overflow-hidden rounded-card-lg bg-white shadow-e2",
        className
      )}
    >
      <div className="v3-room-media relative h-[200px] w-full bg-chip md:h-[220px]">
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
          <ImageBadge variant="light" className="absolute top-3.5 right-3.5">
            {badge}
          </ImageBadge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-3 text-h4 text-navy-800">{apartmentTitle(room)}</h3>
        {chips.length > 0 && (
          <div className="mb-3.5 flex flex-wrap gap-2">
            {chips.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
        )}
        {blurb && (
          <p className="mb-4 line-clamp-3 text-[14.5px] leading-[1.6] text-ink-dim">{blurb}</p>
        )}
        <Link
          href="/booking"
          className="stm-link mt-auto -mb-2 inline-flex min-h-11 items-center gap-[9px] py-2 text-[15px] font-bold text-kicker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sea-500"
        >
          <span>
            לפרטים והזמנה
            <span className="sr-only"> — {apartmentTitle(room)}</span>
          </span>
          <Chevron dir="end" />
        </Link>
      </div>
    </article>
  );
}
