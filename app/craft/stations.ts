import { stationCode } from './__generated__/generated-stations';
import type { CraftStation } from './types';

export const stations: CraftStation[] = [
  {
    id: 'counter',
    title: 'Animate counter',
    tags: ['AnimatePresence', 'MotionConfig'],
    description: 'Use react-motion to animate a counter.',
    code: stationCode.Counter,
  },
  {
    id: 'apple-vision-resize-handle',
    title: 'Apple Vision OS resize handle animation',
    tags: ['AnimatePresence', 'MotionConfig'],
    description:
      'Use react-motion to re-create the Apple Vision OS window resize handle animation with real resizing functionality.',
    code: stationCode.AppleVisionResizeHandle,
  },
];
