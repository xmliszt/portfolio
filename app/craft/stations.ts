import { stationCode } from './__generated__/generated-stations';
import type { CraftStation } from './types';

export const stations: CraftStation[] = [
  {
    id: 'counter',
    title: 'Animate counter',
    tags: ['AnimatePresence'],
    description: 'Use react-motion to animate a counter.',
    code: stationCode.Counter,
  },
  {
    id: 'apple-vision-resize-handle',
    title: 'Apple Vision OS resize handle animation',
    tags: ['AnimatePresence', 'MotionConfig', 'useDragControls'],
    description:
      'Use react-motion to re-create the Apple Vision OS window resize handle animation with real resizing functionality.',
    code: stationCode.AppleVisionResizeHandle,
  },
  {
    id: 'skeuomorphism-rolling-slider',
    title: 'Skeuomorphism rolling slider',
    tags: ['transform-3d'],
    description:
      'Really love how skeuomorphic design adds depth to a UI and it is so much fun to make them on the web. This crafting exercise is heavily inspired by @jh3yy post on X: https://x.com/jh3yy/status/1907979817032597689. A fun but definitely not recommended way to pick a date of birth. 🤪',
    code: stationCode.SkeuomorphismRollingSlider,
  },
];
