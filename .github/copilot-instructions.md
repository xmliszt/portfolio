# Project Guidelines

## Build and Verify
- Install dependencies with `npm install`.
- Start local development with `npm run dev`.
- Create production build with `npm run build`.
- Run lint checks with `npm run lint` (or `npm run lint:fix` when requested).
- Format with `npm run format:fix` when style drift appears.

## Architecture
- This is a Next.js App Router project. Route files live in `app/` and content-driven pages consume generated Velite data.
- Author source content in `content/`. Velite compiles this into `.velite/`, which is imported through `#site/content`.
- Shared UI primitives live in `components/ui/`; product-specific UI lives in `components/custom/`.
- Core helpers and integrations live in `lib/` (including i18n and Supabase helpers).
- Craft demo stations are defined in `app/craft/stations/` and surfaced through generated code in `app/craft/__generated__/`.

## Conventions
- Use TypeScript with strict typing. Prefer `type` over `interface`.
- Prefer `@/` imports for workspace code; keep relative imports only when same-folder and simple.
- Keep imports sorted to satisfy `simple-import-sort` rules.
- Prefer named exports for reusable components.
- Use Tailwind utility classes for layout; prefer flex/grid with `gap-*` over margin/space utility chains.
- Use `cn` from `@/lib/utils` when class composition is conditional.
- Avoid `any` and avoid unsafe `as` assertions unless there is no practical alternative.

## Content and Generation Pitfalls
- Do not edit generated output in `.velite/` or `app/craft/__generated__/` directly.
- `npm run build` already runs `scripts/generate-station-code.js` before `next build`; keep this ordering when changing build flow.
- When changing craft station source files, regenerate with `npm run codegen:craft`.
- App docs/changelog/FAQ content supports localized paths under `content/apps/<appId>/<locale>/...` with fallback to default locale.
- Velite path metadata can vary in shape; prefer segment-based path parsing over rigid single-regex assumptions.
- Post drafts are filtered in production via Velite prepare logic; keep this behavior intact unless explicitly changing publishing rules.

## Knowledge Base

- Refer to `.claude/` folder for best way to work.
- Never exceed 60% context. 
- Split work into 4 phases: Research → Plan → Implement → Validate. Clear context between each. 
- Track your progress in `.github/memories` folder with your own file structure to keep track of important specs and decisions made.

## Key References
- `package.json`
- `velite.config.ts`
- `.eslintrc.json`
- `.rules`
- `tsconfig.json`
- `scripts/generate-station-code.js`
- `app/posts/[slug]/page.tsx`
- `app/apps/[app_id]/changelogs/page.tsx`