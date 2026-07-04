# Sea Tower — Project Rules

## Site architecture (permanent)

All public Sea Tower pages must be created inside `src/app/(site)/`. The shared Header and Footer are rendered exclusively by `src/app/(site)/layout.tsx`. Public `page.tsx` files must contain page-specific content only and must never duplicate or independently render the Header or Footer.

- `src/app/(site)/page.tsx` → `/` (route group is invisible in the URL)
- `src/app/(site)/about/page.tsx` → `/about`
- `src/app/(site)/contact/page.tsx` → `/contact`
- Business contact details (phones, email, address, WhatsApp, hours) live ONLY in `src/lib/business.ts` — never hardcode them in components or pages.
- Contact leads: POST `/api/leads` → `sea_tower.leads` (RLS on, no anon policies; server-side `SUPABASE_SERVICE_ROLE_KEY` only — key lives in `.env.local` + `/etc/sea-tower/sea-tower.env`, never `NEXT_PUBLIC_*`).
- The `(site)` layout owns `<main>` — pages return sections/fragments, not `<main>`.
- One Header (`src/components/site/Header.tsx`), one Footer (`src/components/site/Footer.tsx`). No page-specific copies (no `AboutHeader` etc.); per-page differences via props / `usePathname` / CSS only.
- `src/app/design-system/` stays OUTSIDE `(site)` — internal only, returns `notFound()` in production, never linked from public navigation.
- Nav links use canonical routes (`/`, `/about`, `/#section`) via `next/link`.

## Global Header and Footer Architecture (permanent)

- The site uses one shared global `Header` and one shared global `Footer`.
- Internal pages must never recreate, duplicate, replace, or locally modify the Header, Footer, newsletter area, footer wave, or their SVG markup.
- Any change to the shared Header or Footer must automatically apply to every public page.
- The footer opening wave is owned exclusively by the shared `Footer`.
- The shared Footer must use:

```tsx
<WaveSeparator
  flow
  position="bottom"
  fill="var(--color-navy-950)"
/>
```

- The footer wave must reuse the existing `PATHS.bottom` geometry. Do not approximate, redraw, or duplicate the SVG path inside page components.
- Page components must contain zero footer-wave markup.
- Every public page must leave enough bottom clearance in its final section so that the shared footer wave does not cover or clip content.
- The final section must include responsive bottom padding equal to:
  - its intended visual spacing;
  - plus the footer wave height: `70px` on mobile and `120px` from `md` upward.
- This padding may be implemented in the page's final section, unless a future shared layout solution safely centralizes it without changing existing visuals.
- The footer wave must remain responsive, full-width, seamless, and non-interactive:
  - `preserveAspectRatio="none"`
  - no horizontal overflow
  - no side gaps
  - no white seam
  - `pointer-events: none`
- Before completing any new public page, verify that:
  1. it uses the shared Header and Footer;
  2. it contains no duplicated footer wave;
  3. its final content clears the footer wave on desktop, tablet, and mobile;
  4. the page has no horizontal overflow or visible seam above the Footer.

## Deploy

`npm run build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/ && sudo systemctl restart sea-tower.service` (port 3005).
