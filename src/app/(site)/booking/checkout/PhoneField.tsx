"use client";

import { useState } from "react";

/* שדה טלפון עם בורר קידומת בינלאומית + חיפוש — לפי עיצוב עמוד התשלום */

export type Country = { iso: string; name: string; dial: string; flag: string };

export const COUNTRIES: Country[] = [
  { iso: "IL", name: "ישראל", dial: "+972", flag: "🇮🇱" },
  { iso: "US", name: "ארצות הברית", dial: "+1", flag: "🇺🇸" },
  { iso: "GB", name: "בריטניה", dial: "+44", flag: "🇬🇧" },
  { iso: "FR", name: "צרפת", dial: "+33", flag: "🇫🇷" },
  { iso: "DE", name: "גרמניה", dial: "+49", flag: "🇩🇪" },
  { iso: "IT", name: "איטליה", dial: "+39", flag: "🇮🇹" },
  { iso: "ES", name: "ספרד", dial: "+34", flag: "🇪🇸" },
  { iso: "RU", name: "רוסיה", dial: "+7", flag: "🇷🇺" },
  { iso: "UA", name: "אוקראינה", dial: "+380", flag: "🇺🇦" },
  { iso: "CA", name: "קנדה", dial: "+1", flag: "🇨🇦" },
  { iso: "AU", name: "אוסטרליה", dial: "+61", flag: "🇦🇺" },
  { iso: "NL", name: "הולנד", dial: "+31", flag: "🇳🇱" },
  { iso: "BE", name: "בלגיה", dial: "+32", flag: "🇧🇪" },
  { iso: "CH", name: "שווייץ", dial: "+41", flag: "🇨🇭" },
  { iso: "AT", name: "אוסטריה", dial: "+43", flag: "🇦🇹" },
  { iso: "SE", name: "שוודיה", dial: "+46", flag: "🇸🇪" },
  { iso: "NO", name: "נורווגיה", dial: "+47", flag: "🇳🇴" },
  { iso: "DK", name: "דנמרק", dial: "+45", flag: "🇩🇰" },
  { iso: "PL", name: "פולין", dial: "+48", flag: "🇵🇱" },
  { iso: "GR", name: "יוון", dial: "+30", flag: "🇬🇷" },
  { iso: "PT", name: "פורטוגל", dial: "+351", flag: "🇵🇹" },
  { iso: "TR", name: "טורקיה", dial: "+90", flag: "🇹🇷" },
  { iso: "AE", name: "איחוד האמירויות", dial: "+971", flag: "🇦🇪" },
  { iso: "EG", name: "מצרים", dial: "+20", flag: "🇪🇬" },
  { iso: "JO", name: "ירדן", dial: "+962", flag: "🇯🇴" },
  { iso: "IN", name: "הודו", dial: "+91", flag: "🇮🇳" },
  { iso: "CN", name: "סין", dial: "+86", flag: "🇨🇳" },
  { iso: "JP", name: "יפן", dial: "+81", flag: "🇯🇵" },
  { iso: "BR", name: "ברזיל", dial: "+55", flag: "🇧🇷" },
  { iso: "MX", name: "מקסיקו", dial: "+52", flag: "🇲🇽" },
  { iso: "ZA", name: "דרום אפריקה", dial: "+27", flag: "🇿🇦" },
  { iso: "TH", name: "תאילנד", dial: "+66", flag: "🇹🇭" },
  { iso: "SG", name: "סינגפור", dial: "+65", flag: "🇸🇬" },
  { iso: "CY", name: "קפריסין", dial: "+357", flag: "🇨🇾" },
  { iso: "RO", name: "רומניה", dial: "+40", flag: "🇷🇴" },
  { iso: "HU", name: "הונגריה", dial: "+36", flag: "🇭🇺" },
  { iso: "CZ", name: "צ׳כיה", dial: "+420", flag: "🇨🇿" },
  { iso: "IE", name: "אירלנד", dial: "+353", flag: "🇮🇪" },
];

type Props = {
  iso: string;
  value: string;
  error?: string;
  onIsoChange: (iso: string) => void;
  onValueChange: (v: string) => void;
};

export function PhoneField({ iso, value, error, onIsoChange, onValueChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = COUNTRIES.find((c) => c.iso === iso) ?? COUNTRIES[0];
  const q = query.trim().toLowerCase();
  const filtered = COUNTRIES.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.dial.replace("+", "").includes(q),
  );

  return (
    <div className="relative">
      <label className="mb-[7px] block text-[13px] font-semibold text-ink-dim" htmlFor="bk-phone">
        טלפון נייד <span className="text-error">*</span>
      </label>
      <div
        className={`flex overflow-hidden rounded-[11px] border-[1.5px] ${error ? "border-error" : "border-field"}`}
      >
        <button
          type="button"
          onClick={() => {
            setOpen(!open);
            setQuery("");
          }}
          className="flex shrink-0 items-center gap-2 border-l-[1.5px] border-field bg-mist px-3.5"
        >
          <span className="text-[19px] leading-none">{selected.flag}</span>
          <span dir="ltr" className="text-[15px] font-bold text-[#14283d]">
            {selected.dial}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="var(--color-ink-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <input
          id="bk-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="50-000-0000"
          dir="ltr"
          value={value}
          onChange={(e) => onValueChange(e.target.value.replace(/[^\d\s-]/g, ""))}
          className="min-w-0 flex-1 px-[15px] py-[13px] text-right text-[15px] text-[#14283d] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-400"
        />
      </div>
      {error && <p className="mt-1.5 text-[12.5px] font-semibold text-error">{error}</p>}

      {open && (
        <>
          <div className="fixed inset-0 z-[25]" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-[14px] border border-[#e6edf3] bg-white shadow-[0_20px_50px_rgba(14,37,64,0.18)]">
            <div className="border-b border-chip px-3.5 py-3">
              <div className="flex items-center gap-[9px] rounded-[10px] bg-mist px-[13px] py-[9px]">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" stroke="var(--color-ink-muted)" strokeWidth="1.8" />
                  <path d="M16 16l4 4" stroke="var(--color-ink-muted)" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="חיפוש מדינה או קידומת"
                  className="flex-1 bg-transparent text-[14.5px] text-[#14283d] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-400"
                />
              </div>
            </div>
            <div className="max-h-[248px] overflow-auto">
              {filtered.map((c) => (
                <button
                  key={c.iso + c.dial}
                  type="button"
                  onClick={() => {
                    onIsoChange(c.iso);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 border-b border-[#f3f6f9] px-4 py-[11px] hover:bg-[#f0f6fb] ${
                    c.iso === selected.iso ? "bg-mist" : "bg-white"
                  }`}
                >
                  <span className="min-w-0 flex-1 text-right text-[15px] font-bold text-[#14283d]">
                    {c.name}
                  </span>
                  <span dir="ltr" className="text-[14px] font-bold text-ink-dim">
                    {c.dial}
                  </span>
                  <span className="shrink-0 text-[20px] leading-none">{c.flag}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
