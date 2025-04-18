import { stations as generatedStations } from './__generated__/generated-stations';
import type { CraftStation } from './types';

export const stations: CraftStation[] = [
  {
    id: 'apple-vision-resize-handle',
    title: 'Apple Vision OS resize handle animation',
    tags: ['AnimatePresence', 'MotionConfig', 'useDragControls'],
    description:
      'Use react-motion to re-create the Apple Vision OS window resize handle animation with real resizing functionality.',
    codes: generatedStations['apple-vision-resize-handle'],
  },
  {
    id: '3d-rolling-slider',
    title: '3D rolling slider',
    tags: ['transform-3d'],
    description: `Really love how skeuomorphic design adds depth to a UI and it is so much fun to make them on the web. This crafting exercise is heavily inspired by @jh3yy post on X: https://x.com/jh3yy/status/1907979817032597689. Though not real skeumorphic design as real-world slider doesn't really look like that, still kind of fun making this 3D illusion! And yeah, don't design your birthday picker like this... 🤪`,
    codes: generatedStations['three-d-rolling-slider'],
  },
  {
    id: 'simple-stagger-paragraphs-enter-animation',
    title: 'Simple stagger paragraphs enter animation',
    tags: ['keyframes', 'animation-delay', 'animation-fill-mode'],
    description: `Use simple CSS keyframe animation with CSS variable to create a staggered entering animation for paragraphs. Added subtle blur animation to make it look more natural. This simple yet elegant transition is inspired by Paco Coursey's portfolio site: https://paco.me/.`,
    codes: generatedStations['simple-stagger-paragraphs-enter-animation'],
  },
];
