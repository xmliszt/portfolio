import { FEATURE_TAKES } from "./features-takes";
import { TAKES as FILM_TAKES } from "./takes";

const TAKES = { ...FILM_TAKES, ...FEATURE_TAKES };
import { runTake } from "./run-take";

const name = process.argv[2] ?? Object.keys(TAKES)[0];
const take = TAKES[name];
const phases: string[] = [];
let lastPhase = "";
const boxPhases: { [id: string]: string } = {};
const { frames } = runTake(take, (world) => {
  for (const cat of Object.values(world.cats)) {
    const p = cat.boxVisit?.phase ?? "-";
    if (boxPhases[cat.userId] !== p) console.log(world.time.toFixed(2), cat.userId, "box", p);
    boxPhases[cat.userId] = p;
  }
  const hero = Object.values(world.cats)[0];
  const phase = hero ? hero.legs.map((leg) => leg.reach?.phase ?? "-").join(",") + " sniff=" + (hero.state === "sniff") : "";
  if (phase !== lastPhase) phases.push(world.time.toFixed(2) + " reach " + phase);
  lastPhase = phase;
});
for (const p of phases) console.log(p);
let last: { [id: string]: string } = {};
frames.forEach((f, i) => {
  const t = f.time.toFixed(2);
  for (const [id, s] of Object.entries(f.states)) if (last[id] !== s) console.log(t, id, "state", s);
  last = f.states;
  for (const e of f.events) if (e.kind === "pawPrint" && f.time < 2.5 && process.env.PRINTS) console.log("PRINT", t, Math.round(e.x), Math.round(e.y), (e as { angle?: number }).angle); else if (e.kind !== "pawPrint") console.log(t, JSON.stringify(e));
  if (i % take.fps === 0 && f.toys.length > 0) console.log(t, "toys", f.toys.map((y) => `${y.id}@${Math.round(y.x)},${Math.round(y.y)}${y.kind === "roll" ? (y.isStanding ? " standing" : ` unrolled=${Math.round(y.unrolled)}`) : y.kind === "yarn" ? ` left=${y.left.toFixed(2)}` : y.kind === "bowl" && y.spill ? ` SPILLED ${Math.round(y.spill.x)},${Math.round(y.spill.y)}` : ""}`).join(" "), "ripples", f.marks.ripples.length, "wet", f.marks.wetPrints.length);
  if (i % take.fps === 0) console.log(t, "cats", f.snapshots.map((c) => `${c.userId}@${Math.round(c.x)},${Math.round(c.y)}`).join(" "));
});
// front paws in the hero's own frame while it walks
if (name !== "room") process.exit(0);
const hero0 = frames.slice(0, take.fps * 3).map((f) => f.snapshots.find((c) => c.userId === "film-hero")!);
const local = hero0.map((h) => { const c = Math.cos(h.heading), s = Math.sin(h.heading); const fx = (h.legs[0].x + h.legs[1].x) / 2 - h.x, fy = (h.legs[0].y + h.legs[1].y) / 2 - h.y; return [fx * c + fy * s, -fx * s + fy * c]; });
console.log("front paws local avg", (local.reduce((a, l) => a + l[0], 0) / local.length).toFixed(1), (local.reduce((a, l) => a + l[1], 0) / local.length).toFixed(1), "legs0", JSON.stringify(hero0[100].legs[0]), "hero", hero0[100].x.toFixed(0), hero0[100].y.toFixed(0));
