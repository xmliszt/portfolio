import { TOY_DELIVERY_TIMING } from "@/lib/laundromat/toy/toy-delivery-timing";

import { TOY_DELIVERY_BALLOONS } from "./toy-delivery-balloons";

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function paintToyDeliveryEffects(options: {
  balloons: SVGGElement | null;
  thrusters: SVGGElement | null;
  ground: SVGGElement | null;
  kind: "arriving" | "departing";
  elapsedMs: number;
  heightPx: number;
  reducedMotion: boolean;
  travelPx: number;
}) {
  const { elapsedMs, heightPx } = options;
  const isArrival = options.kind === "arriving" && !options.reducedMotion;
  options.balloons?.setAttribute("opacity", isArrival ? "1" : "0");
  if (isArrival) {
    const releaseY =
      -options.travelPx *
      Math.pow(clamp((elapsedMs - TOY_DELIVERY_TIMING.releaseMs) / 1700), 1.5);
    Array.from(options.balloons?.children ?? []).forEach((node, index) => {
      const balloon = TOY_DELIVERY_BALLOONS.at(index);
      if (balloon === undefined) return;
      const sway = Math.sin(elapsedMs / 1050 + index * 0.7) * 3;
      const x = balloon.x + sway;
      const y = balloon.y + releaseY;
      const bottom = y + balloon.radius * 1.17;
      node
        .querySelector("[data-envelope]")
        ?.setAttribute("transform", `translate(${x} ${y})`);
      node
        .querySelector("path")
        ?.setAttribute(
          "d",
          `M ${((index % 3) - 1) * 3} ${releaseY} Q ${x + sway} ${(bottom + releaseY) / 2} ${x} ${bottom}`
        );
    });
  }
  const active =
    options.kind === "departing" &&
    elapsedMs >= TOY_DELIVERY_TIMING.packMs &&
    !options.reducedMotion;
  options.thrusters?.setAttribute("opacity", active ? "1" : "0");
  options.ground?.setAttribute(
    "opacity",
    active ? String(clamp(1 - heightPx / 240)) : "0"
  );
  if (!active) return;
  const thrustMs = elapsedMs - TOY_DELIVERY_TIMING.packMs;
  const prime = clamp(thrustMs / TOY_DELIVERY_TIMING.primeMs);
  const pulse =
    prime < 1 ? 0.35 + 0.65 * Math.pow(Math.sin(prime * Math.PI * 2), 2) : 1;
  const strength = clamp(prime * 4) * pulse;
  const lengthPx = Math.min(45 + heightPx * 0.85, 180, heightPx) * strength;
  Array.from(options.thrusters?.children ?? []).forEach((node, index) => {
    const length =
      lengthPx * (1 + Math.sin(thrustMs / 330 + index * 1.7) * 0.07);
    node
      .querySelector("[data-exhaust]")
      ?.setAttribute("opacity", String(strength * 0.72 * clamp(heightPx / 8)));
    Array.from(node.querySelectorAll("[data-vapor]")).forEach(
      (puff, puffIndex) => {
        const age = (thrustMs / 1350 + puffIndex / 18 + index * 0.19) % 1;
        const drift =
          (Math.sin(puffIndex * 2.1 + index) * 22 +
            Math.sin(thrustMs / 620 + puffIndex) * 11) *
          age;
        puff.setAttribute("cx", String(drift));
        puff.setAttribute("cy", String(age * length * 0.92));
        puff.setAttribute(
          "rx",
          String(7 + age * 34 + Math.sin(puffIndex * 2.4) * age * 7)
        );
        puff.setAttribute(
          "ry",
          String(Math.min(10 + age * 28, heightPx * 0.24))
        );
        puff.setAttribute(
          "opacity",
          String(Math.pow(Math.sin(age * Math.PI), 1.4) * 0.33)
        );
      }
    );
    const ground = options.ground?.children.item(index);
    const wash = ground?.querySelector("[data-wash]");
    wash?.setAttribute("rx", String(22 + strength * 38));
    wash?.setAttribute("ry", String(10 + strength * 16));
    wash?.setAttribute("opacity", String(strength * 0.24));
    const wave = (thrustMs / 750 + index * 0.2) % 1;
    const ring = ground?.querySelector("[data-ring]");
    ring?.setAttribute("rx", String(10 + wave * 48));
    ring?.setAttribute("ry", String(5 + wave * 21));
    ring?.setAttribute(
      "opacity",
      String(Math.sin(wave * Math.PI) * strength * 0.17)
    );
  });
}
