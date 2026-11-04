import { Metadata } from "next";

import { openGraph } from "@/app/metadata";
import { CustomLink } from "@/components/ui/custom-link";
import { Ratings } from "@/components/ui/ratings";

import { AutumnPlanetContainer } from "./autumn-planet-container";
import { GaitDemo } from "./gait-demo";

export function generateMetadata(): Metadata {
  return {
    title: "Cat Planet (Fall) | 猫咪星球（秋）",
    alternates: {
      canonical: "https://liyuxuan.dev/playground/autumn-planet",
    },
    openGraph: {
      ...openGraph,
      title: "Li Yuxuan | Cat Planet (Fall)",
      description:
        "A tiny watercolor planet of autumn crops where two cats chase, pounce and nap while the wind moves the field. Built with ThreeJS and procedural animation.",
    },
  };
}

export default function Page() {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <h1 className="text-center font-bold">Cat Planet (Fall)</h1>
      <p>
        A tiny planet of autumn crops with a watercolor look, made with{" "}
        <CustomLink href="https://threejs.org/">ThreeJS</CustomLink>. Two cats
        play tag across the planet. The crops bend out of their way as they run.
      </p>

      <AutumnPlanetContainer />
      <p className="text-muted-foreground text-sm">
        Drag to spin the planet. Click for full screen, where you can also use
        WASD, the arrow keys and scrolling.
      </p>

      <h2 className="mt-6 w-full text-left font-bold">How the cats move</h2>
      <p className="w-full text-left">
        Every pose is calculated as you watch, with no prerecorded animations.
        The idea came from the slugcat in{" "}
        <CustomLink href="https://rainworldgame.com/">Rain World</CustomLink>.
      </p>
      <p className="w-full text-left">
        <strong>Body.</strong> Each cat has three connected parts: hips, chest
        and head. They can stretch apart, but only so far. The cats are only
        told which way to go and how fast. Spring-like forces pull their parts
        along, so the hips trail behind in turns, and the body stretches in a
        pounce and squashes on landing. Changing the height each part aims for
        makes the cat sit, crouch, rear up or flop onto its side.
      </p>
      <p className="w-full text-left">
        <strong>Legs.</strong> Each paw stays where it lands until the body
        moves too far ahead, then lifts and steps to a new spot. The cats walk
        at low speeds and gallop when running. Each leg has two sections that
        bend to reach the paw, drawn as one curve that narrows from hip to paw.
      </p>
      <GaitDemo />
      <p className="w-full text-left">
        <strong>Tail.</strong> Twelve springy joints form the tail, firmer at
        the base. The cat’s mood sets the shape it holds: a question mark when
        happy, low and twitching while stalking, or wrapped around the body when
        resting. Turns send ripples to the tip, and the wind moves it too.
      </p>
      <p className="w-full text-left">
        <strong>Face.</strong> Each eye is one rounded shape that changes
        length, width and angle to blink, squint, focus or look surprised.
      </p>
      <p className="w-full text-left">
        <strong>Behavior.</strong> The cats cycle through twelve behaviors:
        sniffing noses, bowing to play, flopping over, hopping sideways, playing
        tag, stalking, ambushing, pouncing, boxing on their hind legs, grooming,
        napping and stretching. They walk back together before most of them, and
        only pounce from close by. Trees, hay bales and the barn are solid, so
        the cats steer around them.
      </p>

      <Ratings id="autumn-planet" />
    </div>
  );
}
