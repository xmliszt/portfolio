import { beginSocial } from "./begin-social";
import { emitCatSound } from "./emit-cat-sound";
import { isCatLeaving } from "./is-cat-leaving";
import { isCatOnstage } from "./is-cat-onstage";
import type { SimCat, Tick } from "./sim-types";

const isFree = (cat: SimCat) =>
  isCatOnstage(cat) &&
  cat.social === undefined &&
  cat.focusId === undefined &&
  !isCatLeaving(cat) &&
  cat.state !== "paw" &&
  cat.state !== "zoom";

/** Start a greeting, chase, tail bat or snuggle between `cat` and the nearest free cat within `range`; return `true` if one started. */
export function startSocial(options: {
  tick: Tick;
  cat: SimCat;
  range: number;
}) {
  const { tick, cat } = options;
  const { world } = tick;
  const gapTo = (other: SimCat) => Math.hypot(cat.x - other.x, cat.y - other.y);
  const partner = Object.values(world.cats)
    .filter(
      (other) => other !== cat && isFree(other) && gapTo(other) < options.range
    )
    .toSorted((a, b) => gapTo(a) - gapTo(b))
    .at(0);
  if (partner === undefined) return false;
  const isResting =
    partner.rest !== undefined &&
    (partner.state === "sit" || partner.state === "sleep");
  const isPlayful = cat.playful + partner.playful > 0.6;
  if (
    isResting &&
    partner.state === "sit" &&
    isPlayful &&
    world.random() < 0.4
  ) {
    beginSocial({
      cat,
      partner,
      play: { kind: "chase", durationSeconds: 4 + world.random() * 3 },
    });
  } else if (isResting && world.random() < 0.55) {
    beginSocial({
      cat,
      partner,
      play: { kind: "bat", durationSeconds: 5 + world.random() * 4 },
    });
  } else if (isResting) {
    beginSocial({
      cat,
      partner,
      play: { kind: "snuggle", side: world.random() < 0.5 ? -1 : 1 },
    });
  } else if (isPlayful && world.random() < 0.7) {
    beginSocial({
      cat,
      partner,
      play: { kind: "chase", durationSeconds: 4 + world.random() * 3 },
    });
  } else {
    beginSocial({ cat, partner, play: { kind: "greet" } });
    emitCatSound({ tick, cat, sound: "meow" });
  }
  cat.socialCooldownUntil = world.time + 14 + world.random() * 20;
  partner.socialCooldownUntil = world.time + 14 + world.random() * 20;
  return true;
}
