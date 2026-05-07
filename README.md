# Welcome to my personal website!

Shield: [![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

 [cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
 [cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
 [cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

## Supabase schema workflow

This project uses declarative Supabase schemas with one table per file under `supabase/schemas/public/`.

To bootstrap or re-sync from production baseline:

1. Link the project: `supabase link --project-ref tvstbbuidvwgelgidaqy`
2. (Optional) Dump production public schema: `supabase db dump --linked --schema public --file supabase/schemas/prod.sql`
3. Break `prod.sql` into per-table files under `supabase/schemas/public/` or reconcile incrementally.

When schema changes are made:

1. Edit the SQL files under `supabase/schemas/public/` (one table per file).
2. Generate a migration from the declared state: `supabase db diff -f <migration_name>`.
3. Apply migrations to the linked project: `npm run db:push`.
4. Regenerate TypeScript types: `npm run db:gen-types`.

Development with Turbopack and Velite

This project uses Velite for crafting demo stations which historically ran via a webpack plugin. Turbopack (Next's Rust bundler) doesn't run webpack plugins. To run the dev server with Turbopack while keeping Velite's watch process:

1. Start dev (runs velite watcher and Next with Turbopack):

   npm run dev

   (The `dev` script exports NEXT_TURBOPACK=1 and runs `velite --watch` in the background before `next dev --turbo`.)

2. If you prefer not to use Turbopack, run the old flow:

   npm run velite:dev
   npm run dev:webpack  # not present by default; use `next dev` to run Webpack-based dev server

Notes
- Ensure your shell supports `bash -c` when running `npm run dev` locally (macOS/Linux). For Windows PowerShell/CMD, run the steps manually or install `concurrently` and update scripts accordingly.
- When running in CI or environments that don't support background processes, run Velite build separately (e.g., `npm run velite:build`) during the build step.

Storage buckets (local dev)

To mirror production storage buckets locally, configure them in `supabase/config.toml` under `[storage.buckets.<name>]` (this repo already defines a `photos` bucket). Then link the CLI and create them in the linked project:

1. Link supabase CLI to your project: `supabase link --project-ref tvstbbuidvwgelgidaqy`
2. Create buckets with the helper script: `bash scripts/supabase-create-buckets.sh`
3. (Optional) Place image files under `supabase/storage/photos/` and upload them using the dashboard or a small Node script using `@supabase/supabase-js`.

Note: The local `supabase start` process may also create buckets declared in `config.toml` depending on CLI version. If you need seeded files in storage for CI/dev, run an upload step after linking the project.
