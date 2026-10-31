import { setCatState } from "./set-cat-state";
import type { SimCat } from "./sim-types";

/** Start `play` between `cat` and `partner`: a greeting or chase both join, a tail bat or snuggle only `cat` starts. */
export function beginSocial(options: {
  cat: SimCat;
  partner: SimCat;
  play:
    | { kind: "greet" }
    | { kind: "chase"; durationSeconds: number }
    | { kind: "bat"; durationSeconds: number }
    | { kind: "snuggle"; side: -1 | 1 };
}) {
  const { cat, partner, play } = options;
  cat.partnerId = partner.userId;
  switch (play.kind) {
    case "greet":
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
      partner.partnerId = cat.userId;
      partner.rest = undefined;
      setCatState(cat, "greet");
      setCatState(partner, "greet");
      break;
    case "chase":
      cat.social = {
        kind: "chase",
        t: 0,
        durationSeconds: play.durationSeconds,
      };
      partner.social = { kind: "chased", t: 0 };
      partner.partnerId = cat.userId;
      partner.rest = undefined;
      setCatState(cat, "chase");
      setCatState(partner, "chased");
      break;
    case "bat":
      cat.social = {
        kind: "bat",
        t: 0,
        durationSeconds: play.durationSeconds,
        phase: "go",
      };
      setCatState(cat, "bat");
      break;
    case "snuggle": {
      const gap = 85 * (cat.build.scale + partner.build.scale);
      cat.wander = {
        x: partner.x - Math.sin(partner.heading) * play.side * gap,
        y: partner.y + Math.cos(partner.heading) * play.side * gap,
      };
      cat.isSnuggling = true;
      setCatState(cat, "approach");
      break;
    }
    default: {
      const unknown: never = play;
      return unknown;
    }
  }
}
