import { emitCatSound } from "./emit-cat-sound";
import { isCatLeaving } from "./is-cat-leaving";
import { isCatOnstage } from "./is-cat-onstage";
import { setCatState } from "./set-cat-state";
import type { SimCat, Tick } from "./sim-types";

const isFree = (cat: SimCat) =>
  isCatOnstage(cat) &&
  cat.social === undefined &&
  cat.focusId === undefined &&
  !isCatLeaving(cat) &&
  cat.state !== "paw";

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
  if (isResting && world.random() < 0.55) {
    cat.social = {
      kind: "bat",
      t: 0,
      durationSeconds: 5 + world.random() * 4,
      phase: "go",
    };
    cat.partnerId = partner.userId;
    setCatState(cat, "bat");
  } else if (isResting) {
    const side = world.random() < 0.5 ? -1 : 1;
    const gap = 85 * (cat.build.scale + partner.build.scale);
    cat.wander = {
      x: partner.x - Math.sin(partner.heading) * side * gap,
      y: partner.y + Math.cos(partner.heading) * side * gap,
    };
    cat.isSnuggling = true;
    cat.partnerId = partner.userId;
    setCatState(cat, "approach");
  } else if (cat.playful + partner.playful > 0.9 && world.random() < 0.5) {
    cat.social = {
      kind: "chase",
      t: 0,
      durationSeconds: 2.5 + world.random() * 1.5,
    };
    partner.social = { kind: "chased", t: 0 };
    cat.partnerId = partner.userId;
    partner.partnerId = cat.userId;
    partner.rest = undefined;
    setCatState(cat, "chase");
    setCatState(partner, "chased");
  } else {
    cat.social = {
      kind: "greet",
      t: 0,
      sniffT: 0,
      sniffing: false,
      lead: true,
      printed: false,
    };
    partner.social = {
      kind: "greet",
      t: 0,
      sniffT: 0,
      sniffing: false,
      lead: false,
      printed: false,
    };
    cat.partnerId = partner.userId;
    partner.partnerId = cat.userId;
    partner.rest = undefined;
    setCatState(cat, "greet");
    setCatState(partner, "greet");
    emitCatSound({ tick, cat, sound: "meow" });
  }
  cat.socialCooldownUntil = world.time + 14 + world.random() * 20;
  partner.socialCooldownUntil = world.time + 14 + world.random() * 20;
  return true;
}
