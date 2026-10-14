# Laundromat notice board updates

The notice board in the laundromat lists what changed, newest first. The stand shows the three newest entries; pressing it opens every entry since opening day. Visitors read it, so an entry is for them, not for developers.

The "refresh for updated laundromat" button in the toolbar is separate. It appears on its own after every deploy and needs no entry. The board shows the deployed build's entries (served by `/version?locale=`). It lights up with an accent frame only when the deploy has an entry this tab has not seen; that entry gets an accent dot and the same refresh button.

## When a change gets an entry

Add an entry when a visitor would notice the change without being told:

- a new object in the room, or a new thing to do with one (brew coffee, write in the notebook)
- something new shared with other visitors (shared machines, a shared flask, hearing someone walk in)
- a new way to do something they already do (drag a page edge to turn it)
- a visible change to the room they would wonder about (sunlight through the window, the street outside)
- a new language, or new stations on the TV

Do not add an entry for:

- bug fixes, including sync and timing fixes that make a feature work as it already claimed to (coffee clock sync)
- performance, loading, fonts, caching, service worker or build changes
- refactors, tests, docs, the lab page, dev tooling
- SEO, share images, metadata, toolbar links, the update notice itself
- moderation and safety (report thresholds, word masking); do not advertise these
- polish on an existing feature that does not change what a visitor can do or see (shading, spacing, tooltip timing)

If several changes ship together around one feature, write one entry for the feature. Skip the board when unsure and say so in the PR body, so the user can decide.

## How to add an entry

1. In `lib/laundromat/board/board-updates.ts`, add the id to the front of `BOARD_UPDATE_IDS` and a row to the top of `BOARD_UPDATES`: `{ id, tag, date }`. `date` is the day it ships, as `YYYY-MM-DD`. Pick a tag from `BOARD_TAGS`; add a new tag only when none fits, with its label in every copy file.
2. Add `board.updates[id]` with `title` and `body` to all 18 files in `lib/laundromat/i18n/copy/`. The typecheck fails when a language is missing the entry.
3. Run `npm run test:laundromat`.

## Writing the entry

Match the existing entries in `lib/laundromat/i18n/copy/en.ts`:

- `title`: lowercase, about 3 to 6 words, no full stop. Names the thing: "share a pot of coffee", "turn pages by dragging".
- `body`: one or two plain sentences that say what the visitor can now do or see. Second person, no exclamation marks, no version numbers, no technical terms.
