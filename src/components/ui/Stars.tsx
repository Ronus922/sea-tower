const STAR_PATH =
  "M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 18l-6.1 3 1.2-6.8-5-4.9 6.9-1z";

export function Stars({ count = 5, size = 20 }: { count?: number; size?: number }) {
  return (
    <span className="inline-flex gap-[3px] text-gold" role="img" aria-label={`${count} כוכבים`}>
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="fill-current" aria-hidden="true">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}
