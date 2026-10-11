# Laundromat isometric drawing

Rules for drawing objects in the laundromat scene, adapted from the Anatomy skill (`.claude/skills/anatomy/`, MIT, https://github.com/wheresryan22/anatomy at `dbf697a`). Read its `SKILL.md` and `references/craft.md` for the full reasoning; this file says which rules apply to our code and how.

Our world unit is about 1 m (`COLUMN_RADIUS = 0.06`), and Anatomy's is about 1 screen px. Anatomy's sizes below are given in screen px at our default camera; convert with `projection.unit`.

## Rules that apply

### Volume
- **Four side tones, not two.** We paint every box with `--lm-face` (front), `--lm-wall` (side) and `--lm-face-top`. Anatomy buckets each visible side by how it faces the light into four shades about 3% apart in luminance (dark: `#0f0f0f`, `#121212`, `#151515`, `#181818`), plus a lighter top. For us that means two more tokens between `wall` and `face`, used by rounded corners and cylinders.
- **Rounded corners on boxes.** Anatomy's slabs are rounded rectangles (`slabOf(plan, z, h, P, steps, bevel)`), so each corner is a few narrow facets that step through the shades. That is where most of its sense of volume comes from. Our `getBoxFaces` returns three sharp quads. A rounded variant would return the corner facets as extra polygons with their shade index.
- **Bevel highlight.** A thin line inset 0.4–1.6 px on the top face, along the visible edges, running into the silhouette corners. Cheap: one extra path per box.
- **Cylinders shade by facet.** `getIsoCylinder` returns one `body` path with one fill. Split the visible half into facets (about 3 px wide on screen) and give each a shade by its angle to the light. Stools, the table, the mug, the plant pot and the basket all use it.
- **Halo under anything that stands or is lifted.** A blurred fill under the base (`filter: blur(9px)`, opacity 0.9 in dark, shifted 3 px down). Nothing in our scene has one, so objects sit on the floor without weight. Add it per object in its own paint slot, before the object.

### Parts
- **Many small parts, each with a job.** At 4× every region should still show something real. A large bare face is unfinished work.
- **Everything is held.** Every part rests on, or is fixed to, another part: feet under a machine, brackets under a shelf, spokes or a collar holding a footrest ring.
- **Screws and rivets** are dots 0.4–0.55 px with a faint ring, at the corners of plates and panels.
- **Knurls** on knobs and dials: short lines around the side band.
- **Seams wrap corners.** A seam or panel line on a box runs edge to edge and wraps the visible corners. Never inset it a few units from each end.

### Lines
- **Every line ends on something:** a face edge, another line or a terminal dot. A line that must stop on a bare face fades out instead (a gradient along the line).
- **A texture ends on a real edge or fades.** Rows of ribs, ticks, holes and bolt dots never stop in the middle of a surface.
- **Ticks hang from a strip or a dial edge**, never from bare face.

### Painter's order
- Draw base first, then what rests on it; within a level, far before near.
- **Split wrapping parts** into a back half and a front half around the inner part. `stool-drawing.tsx` already does this for the footrest ring.
- `sortByDepth` sorts by `x + y` of an object's position. That is enough while objects don't overlap on the floor; a long object next to a short one can sort wrong, and the fix is to split the long one.

### Tones
- Base and feet are `lo`, structure is `mid`, the subject is `hi`. Exactly one part is `lit`: the one the visitor should look at now (our `partStroke(highlighted)` and `--lm-ink-hi` play this role).
- Grooves and inset outlines `faint`, minor ticks `lo`, major ticks `mid`.

### Review
- **Look at 4×.** Set the scene `<svg>`'s `viewBox` to a 160 × 100 window over one object in the browser and screenshot it. Anatomy's owner found most faults this way; at 1× the scene hides them.

## Rules that do not apply
- **Light theme first.** Anatomy ships light. We ship dark only.
- **No text in the drawing.** The washer readouts, `No. 1` and `welcome` are text that the objects show, which Anatomy allows (`craft.md`, section 10).
- **Monochrome.** The window sky, moon and accent readout are deliberate colour.
- **The card, legend and caption.** Anatomy draws single figures in a card. Ours is a room.
- **The audit pipeline** (`kit/audit.mjs`, `recorder`, `settle`) and `scripts/lines.mjs`. They need the kit's own shapes and `.iso-line` classes, and we have no pipes or turned parts.
- **WebGL and 3D modes.** Not needed for the current objects.

## Findings at 4× (2026-10-11)
- **Washer and dryer stacks:** large bare top faces and a blank side face on each stack (Anatomy's "one big plain slab"). No plinth, kick plate or feet. No bevels. Dials have no knurl. Panel lines are inset from the face edges instead of running edge to edge.
- **Stools:** cylinders are one flat tone. The footrest ring has nothing holding it to the post. The base has no feet or screws.
- **Table:** one flat tone on the top and base. The pen lies on the top with no shadow.
- **Mug:** flat body.
- **All objects:** no halo under them.
