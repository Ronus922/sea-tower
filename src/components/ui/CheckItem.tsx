/* שורת יתרון עם וי — כמו בכרטיסי הפתרונות ברפרנס */
export function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[11px]">
      <span
        aria-hidden="true"
        className="flex size-[23px] shrink-0 items-center justify-center rounded-full bg-sea-500/15"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12l4 4 10-10"
            stroke="var(--color-ocean-400)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[14.5px] font-medium text-ink-strong">{children}</span>
    </div>
  );
}
