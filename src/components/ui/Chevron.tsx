/* חץ כיווני. האתר RTL קבוע (כלל ברזל #1): start = ימין, end = שמאל */
export function Chevron({ dir, size = 20 }: { dir: "start" | "end"; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={dir === "start" ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
