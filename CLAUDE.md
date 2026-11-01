# CLAUDE.md

## Laundromat (laundro.cafe)

- Before finishing a laundromat change, decide whether it gets a notice board entry, following `docs/laundromat-board-updates.md`. Say the decision in the PR body.
- Before drawing or editing scene objects, read `docs/laundromat-isometric.md`.

## Paws (paws.garden)

- Invite link previews (`/cards/<version>/<code>`) are cached forever. When a change alters how a cat is drawn (`lib/paws/render/`, `lib/paws/sim/`, `lib/paws/share/draw-cat-card.ts`), raise `CAT_CARD.version` in `lib/paws/share/cat-card.ts`. `lib/paws/share/cat-card-source.test.ts` fails until you update it.
