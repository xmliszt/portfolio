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
    id: '3d-rolling-slider',
    title: '3D rolling slider',
    tags: ['transform-3d'],
    description: `Really love how skeuomorphic design adds depth to a UI and it is so much fun to make them on the web. This crafting exercise is heavily inspired by @jh3yy post on X: https://x.com/jh3yy/status/1907979817032597689. Though not real skeumorphic design as real-world slider doesn't really look like that, still kind of fun making this 3D illusion! And yeah, don't design your birthday picker like this... 🤪`,
    code: stationCode.ThreeDRollingSlider,
  },
];
