// Auto-generated file - DO NOT EDIT
// Generated by generate-station-code.js

export const stationCode = {
  'AppleVisionResizeHandle': `import { useCallback, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useDragControls,
} from 'motion/react';

const variants = {
  initial: {
    opacity: 0,
    pathLength: 0,
  },
  animate: {
    opacity: 1,
    pathLength: 1,
  },
  exit: {
    opacity: 0,
    pathLength: 0,
  },
};

const PADDING = 8;
const MIN_SIZE = 100;

export default function AppleVisionResizeHandle() {
  const [draggingResizingCorner, setDraggingResizingCorner] = useState<
    'br' | 'bl' | undefined
  >(undefined);
  const activeResizingHandle = useRef<'br' | 'bl' | undefined>(undefined);

  const [size, setSize] = useState({ width: 250, height: 250 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const dragControls = useDragControls();

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;

    // Calculate new dimensions based on which corner is being dragged
    // Using a 2x multiplier as container expands in both directions
    let newWidth = startPosRef.current.width;
    let newHeight = startPosRef.current.height;

    if (activeResizingHandle.current === 'br') {
      newWidth = Math.max(MIN_SIZE, startPosRef.current.width + deltaX * 2);
      newHeight = Math.max(MIN_SIZE, startPosRef.current.height + deltaY * 2);
    } else if (activeResizingHandle.current === 'bl') {
      newWidth = Math.max(MIN_SIZE, startPosRef.current.width - deltaX * 2);
      newHeight = Math.max(MIN_SIZE, startPosRef.current.height + deltaY * 2);
    }

    // Limit the size to the container
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const maxWidth = containerRect.width - PADDING;
      const maxHeight = containerRect.height - PADDING;

      newWidth = Math.min(newWidth, maxWidth);
      newHeight = Math.min(newHeight, maxHeight);
    }

    setSize({ width: newWidth, height: newHeight });
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDraggingResizingCorner(undefined);
    activeResizingHandle.current = undefined;

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, handle: 'br' | 'bl') => {
      setIsDragging(true);
      setDraggingResizingCorner(handle);
      activeResizingHandle.current = handle;

      // Store initial position and size
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height,
      };

      // Add event listeners for dragging
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [size, handlePointerMove, handlePointerUp]
  );

  return (
    <MotionConfig transition={{ duration: 0.375, type: 'spring', bounce: 0 }}>
      <div
        className='relative flex h-screen w-screen items-center justify-center'
        style={{
          background:
            'url(https://images.unsplash.com/photo-1564078516393-cf04bd966897?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) no-repeat center bottom',
          backgroundSize: 'cover',
        }}
      >
        <div
          className='absolute inset-24 flex items-center justify-center'
          ref={containerRef}
        >
          <motion.div
            drag
            dragConstraints={containerRef}
            dragControls={dragControls}
            dragMomentum={false}
            dragListener={false}
            className='relative rounded-[20px] bg-neutral-500/30 shadow-[inset_0_0_5px_rgba(255,255,255,0.5)] backdrop-blur-md select-none'
            style={{
              width: \`\${size.width}px\`,
              height: \`\${size.height}px\`,
              transition: isDragging ? 'none' : 'width 0.2s, height 0.2s',
            }}
          >
            <div className='absolute inset-4 flex flex-col items-center justify-center gap-y-2 overflow-hidden rounded-[12px] backdrop-blur-md'>
              {/* Background with gradient fade effect */}
              <div
                className='absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]'
                style={{
                  background:
                    'url(https://images.unsplash.com/photo-1742603096268-0efc93dcc95a?q=80&w=3359&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) no-repeat center center',
                  backgroundSize: 'cover',
                }}
              />

              {/* Content */}
              <div className='relative z-10 flex flex-col items-center justify-center gap-y-2'>
                <div className='text-xs text-neutral-200'>
                  {Math.round(size.width)} × {Math.round(size.height)}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {(() => {
                if (!draggingResizingCorner) return null;
                switch (draggingResizingCorner) {
                  // bottom right corner resize handle
                  case 'br':
                    return (
                      <motion.div
                        key={draggingResizingCorner}
                        className='absolute right-0 bottom-0 size-10 overflow-visible'
                        initial={{ scale: 1, x: 16, y: 16 }}
                        animate={{ scale: isDragging ? 0.9 : 1, x: 16, y: 16 }}
                      >
                        <motion.svg
                          viewBox='0 0 30 30'
                          className='size-full'
                          fill='none'
                        >
                          <motion.path
                            d='M10,24 Q22,22 24,10'
                            stroke='white'
                            strokeWidth='4'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            fill='none'
                            opacity='0.7'
                            variants={variants}
                            initial='initial'
                            animate='animate'
                            exit='exit'
                          />
                        </motion.svg>
                      </motion.div>
                    );
                  // bottom left corner resize handle
                  case 'bl':
                    return (
                      <motion.div
                        key={draggingResizingCorner}
                        className='absolute bottom-0 left-0 size-10 overflow-visible'
                        initial={{ scale: 1, x: -16, y: 16 }}
                        animate={{ scale: isDragging ? 0.9 : 1, x: -16, y: 16 }}
                      >
                        <motion.svg
                          viewBox='0 0 30 30'
                          className='size-full'
                          fill='none'
                        >
                          <motion.path
                            d='M20,24 Q8,22 6,10'
                            stroke='white'
                            strokeWidth='4'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            fill='none'
                            opacity='0.7'
                            variants={variants}
                            initial='initial'
                            animate='animate'
                            exit='exit'
                          />
                        </motion.svg>
                      </motion.div>
                    );
                }
              })()}
              {/* bottom middle drag handle */}
              {draggingResizingCorner !== 'bl' &&
                draggingResizingCorner !== 'br' && (
                  <div className='absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[32px]'>
                    <motion.div
                      key={draggingResizingCorner}
                      className='h-full w-20 touch-none overflow-visible opacity-70'
                      onPointerDown={(event) =>
                        dragControls.start(event, { snapToCursor: false })
                      }
                      exit={{ scale: 1, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      whileTap={{ scale: 0.9, opacity: 1 }}
                    >
                      <svg
                        viewBox='0 0 80 30'
                        className='size-full'
                        fill='none'
                      >
                        <path
                          d='M4,9 L76,9'
                          stroke='white'
                          strokeWidth='5.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          fill='none'
                        />
                      </svg>
                    </motion.div>
                  </div>
                )}
            </AnimatePresence>

            {/* pointer capture areas */}
            {/* bottom right corner resize handle capture area */}
            <div
              className='absolute right-0 bottom-0 size-10 translate-x-4 translate-y-4 cursor-default'
              onPointerEnter={useCallback(
                () => !isDragging && setDraggingResizingCorner('br'),
                [isDragging]
              )}
              onPointerLeave={useCallback(
                () => !isDragging && setDraggingResizingCorner(undefined),
                [isDragging]
              )}
              onPointerDown={(event) => handlePointerDown(event, 'br')}
              style={{ touchAction: 'none' }}
            />
            {/* bottom left corner resize handle capture area */}
            <div
              className='absolute bottom-0 left-0 size-10 -translate-x-4 translate-y-4 cursor-default'
              onPointerEnter={useCallback(
                () => !isDragging && setDraggingResizingCorner('bl'),
                [isDragging]
              )}
              onPointerLeave={useCallback(
                () => !isDragging && setDraggingResizingCorner(undefined),
                [isDragging]
              )}
              onPointerDown={(event) => handlePointerDown(event, 'bl')}
              style={{ touchAction: 'none' }}
            />
          </motion.div>
        </div>
        <p className='absolute bottom-6 px-4 text-center text-xs text-neutral-400 select-none'>
          Drag the bottom corners to resize the card. Drag the bottom middle to
          move the card.
        </p>
      </div>
    </MotionConfig>
  );
}
`,
  'Counter': `import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export default function Counter() {
  const [direction, setDirection] = useState(1);
  const [count, setCount] = useState(0);
  const previousCountRef = useRef(count);

  useEffect(() => {
    previousCountRef.current = count;
  }, [count]);

  return (
    <div className='flex h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-300'>
      <motion.div className='rounded-lg bg-white shadow-md'>
        <div className='flex flex-col gap-y-4 p-6'>
          <div className='font-bold text-gray-800'>Animate counter</div>
          <p className='text-gray-600'>
            Click the buttons to increment and decrement the counter.
          </p>
          <div className='flex items-center justify-center space-x-4'>
            <button
              className='cursor-default rounded-lg bg-gray-800 px-4 py-2 text-white transition hover:bg-gray-600'
              onClick={() => {
                setCount(count - 1);
                setDirection(-1);
              }}
            >
              Decrement
            </button>
            <div className='relative size-10 overflow-hidden text-center font-mono font-bold text-gray-800'>
              <AnimatePresence mode='popLayout'>
                <motion.div
                  key={count}
                  className='absolute inset-0 grid place-content-center place-self-center'
                  initial={{ opacity: 0, y: \`\${-1 * 110 * direction}%\` }}
                  animate={{ opacity: 1, y: '0%' }}
                >
                  {count}
                </motion.div>
                <motion.div
                  key={count - direction}
                  className='absolute inset-0 grid place-self-center'
                  initial={{ opacity: 1, y: '0%' }}
                  animate={{ opacity: 0, y: \`\${1 * 110 * direction}%\` }}
                >
                  {previousCountRef.current}
                </motion.div>
              </AnimatePresence>
            </div>
            <button
              className='cursor-default rounded-lg bg-gray-800 px-4 py-2 text-white transition hover:bg-gray-600'
              onClick={() => {
                setCount(count + 1);
                setDirection(1);
              }}
            >
              Increment
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
`,
  'SkeuomorphismRollingSlider': `import { useCallback, useRef, useState } from 'react';
import { clamp, motion } from 'motion/react';

import { cn } from './utils';

type SliderProps = {
  /**
   * The value of the slider, between 0 and 100.
   */
  value: number;
  /**
   * The function to call when the slider value changes.
   */
  onChange: (value: number) => void;
  /**
   * The content to display on the ball.
   */
  icon?: React.ReactNode;
  /**
   * Oritentation of the slider
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Lenght of the slider
   */
  length?: number;
  /**
   * Lights up the positive range
   */
  showRange?: boolean;
  /**
   * Accent color
   */
  accentColor?: string;
};

function Slider({
  value,
  onChange,
  icon,
  orientation,
  length,
  showRange,
  accentColor,
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const accent = accentColor ?? '150 98% 57%';
  const sliderLength = length ?? 300;
  const direction = orientation ?? 'horizontal';

  const thumbValue = value * (sliderLength / 100);
  const thumbRotationValue = value * 3.6;

  const updateProgress = useCallback(
    (client: number) => {
      const containerElement = containerRef.current;
      if (!containerElement) return;
      const rect = containerElement.getBoundingClientRect();
      const clientPositionInContainer =
        client - (direction === 'horizontal' ? rect.x : rect.y);
      const effectiveClient =
        ((clientPositionInContainer - 28) / (sliderLength - 56)) * sliderLength;

      const percentage =
        (effectiveClient /
          (direction === 'horizontal' ? rect.width : rect.height)) *
        100;
      const effectivePercentage =
        direction === 'horizontal' ? percentage : 100 - percentage;
      onChange(clamp(0, 100, effectivePercentage));
    },
    [direction, sliderLength, onChange]
  );

  const handlePointerDown = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
    updateProgress(direction === 'horizontal' ? event.clientX : event.clientY);

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      updateProgress(
        direction === 'horizontal' ? event.clientX : event.clientY
      );
      setIsDragging(true);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      ref={containerRef}
      className='relative'
      style={{
        width: direction === 'horizontal' ? sliderLength : 24,
        height: direction === 'vertical' ? sliderLength : 24,
      }}
    >
      {/* Slider track */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'overflow-hidden bg-neutral-900'
        )}
      >
        {/* Slider range */}
        <motion.div
          className={cn(
            'absolute',
            direction === 'horizontal'
              ? 'top-1/2 left-0 origin-left rounded-l-full'
              : 'bottom-0 left-1/2 origin-bottom rounded-b-full'
          )}
          animate={{
            backgroundColor:
              isDragging || showRange === true ? \`hsl(\${accent})\` : '#171717',
            filter:
              isDragging || showRange === true
                ? \`drop-shadow(0 0 5px hsl(\${accent} / 60%))\`
                : \`drop-shadow(0 0 0px black))\`,
          }}
          style={{
            height:
              direction === 'vertical' ? \`calc(100% * \${value / 100})\` : '100%',
            width:
              direction === 'horizontal'
                ? \`calc(100% * \${value / 100})\`
                : '100%',
            translateX: direction === 'vertical' ? '-50%' : 0,
            translateY: direction === 'horizontal' ? '-50%' : 0,
          }}
        />

        {/* drop shadow overlay */}
        <div
          className={cn(
            'absolute inset-0 size-full rounded-[12px] shadow-[inset_0_0_10px_rgba(0,0,0,0.9)]'
          )}
        />
      </div>
      {/* Slider thumb */}
      <motion.div
        className={cn(
          'absolute size-14 cursor-grab touch-none overflow-hidden rounded-full',
          'shadow-[0_0_10px_rgba(0,0,0,0.5)]',
          direction === 'horizontal' ? 'top-1/2' : 'left-1/2'
        )}
        style={{
          y:
            direction === 'vertical'
              ? (sliderLength - 56) *
                  ((sliderLength - thumbValue) / sliderLength) +
                28
              : 0,
          x:
            direction === 'horizontal'
              ? (sliderLength - 56) * (thumbValue / sliderLength) + 28
              : 0,
          translateX: '-50%',
          translateY: '-50%',
        }}
        onPointerDown={(event) => handlePointerDown(event.nativeEvent)}
      >
        <div
          className={cn(
            'relative size-full',
            'bg-[radial-gradient(circle_at_center,#FFFFFF_0%,#444444_10%,#222222_34%,#000000_100%)]'
          )}
          style={{
            transformStyle: 'preserve-3d',
            perspective: '100px',
          }}
        >
          {Array.from({ length: 3 }).map((_, index, array) => {
            const rotationDeg =
              thumbRotationValue + index * (360 / array.length);

            return (
              <div
                key={index}
                className={cn('absolute top-1/2 left-1/2 origin-center')}
                style={{
                  transform:
                    direction === 'horizontal'
                      ? \`translate(-50%,-50%) rotateY(\${rotationDeg}deg) translateZ(28px)\`
                      : \`translate(-50%,-50%) rotateX(\${rotationDeg}deg) translateZ(28px)\`,
                }}
              >
                <span
                  className={cn('font-mono text-xs transition-colors')}
                  style={{
                    color: isDragging ? \`hsl(\${accent})\` : '#a1a1a1',
                    filter: isDragging
                      ? \`drop-shadow(0 0 4px hsl(\${accent}))\`
                      : 'drop-shadow(0 0 0px black)',
                  }}
                >
                  {icon ?? \`\${Math.round(value)}%\`}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default function SkeuomorphismRollingSlider() {
  const MAX_YEAR = 2025;
  const MIN_YEAR = 1900;
  const [year, setYear] = useState(1900);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);

  // For equalizer example
  const [eqValues, setEqValues] = useState<number[]>(Array(6).fill(0));

  const maxDay = (() => {
    switch (month) {
      case 1:
      case 3:
      case 5:
      case 7:
      case 8:
      case 10:
      case 12:
        return 31;
      case 2:
        return year % 4 === 0 ? 29 : 28;
      case 4:
      case 6:
      case 9:
      case 11:
        return 30;
      default:
        throw new Error('Non existed month');
    }
  })();

  // Clamp the day maximum at maxDay.
  const adjustedDay = Math.min(maxDay, day);

  return (
    <div className='relative flex h-screen w-screen flex-col items-center justify-center gap-y-4 bg-neutral-900 p-4 font-mono'>
      <div className='flex w-full flex-col items-center gap-y-4'>
        <div className='flex flex-col gap-y-4'>
          <div className='text-sm text-neutral-600'>Year</div>
          <Slider
            length={250}
            value={((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}
            onChange={(value) =>
              setYear(
                Math.round((value / 100) * (MAX_YEAR - MIN_YEAR) + MIN_YEAR)
              )
            }
            icon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='size-4 animate-spin'
              >
                <path d='M14 11a2 2 0 1 1-4 0 4 4 0 0 1 8 0 6 6 0 0 1-12 0 8 8 0 0 1 16 0 10 10 0 1 1-20 0 11.93 11.93 0 0 1 2.42-7.22 2 2 0 1 1 3.16 2.44' />
              </svg>
            }
          />
        </div>
        <div className='flex flex-col gap-y-4'>
          <div className='text-sm text-neutral-600'>Month</div>
          <Slider
            length={250}
            value={((month - 1) * 100) / 11}
            onChange={(value) => setMonth(Math.round((value / 100) * 11) + 1)}
            icon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='size-4'
              >
                <path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' />
              </svg>
            }
          />
        </div>
        <div className='flex flex-col gap-y-4'>
          <div className='text-sm text-neutral-600'>Day</div>
          <Slider
            length={250}
            value={((adjustedDay - 1) * 100) / (maxDay - 1)}
            onChange={(value) =>
              setDay(Math.round((value / 100) * (maxDay - 1)) + 1)
            }
            icon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='size-4'
              >
                <circle cx='12' cy='12' r='4' />
                <path d='M12 2v2' />
                <path d='M12 20v2' />
                <path d='m4.93 4.93 1.41 1.41' />
                <path d='m17.66 17.66 1.41 1.41' />
                <path d='M2 12h2' />
                <path d='M20 12h2' />
                <path d='m6.34 17.66-1.41 1.41' />
                <path d='m19.07 4.93-1.41 1.41' />
              </svg>
            }
          />
        </div>
        <div className='text-sm text-neutral-600'>
          {(() => {
            const monthText = (() => {
              switch (month) {
                case 1:
                  return 'Jan';
                case 2:
                  return 'Feb';
                case 3:
                  return 'Mar';
                case 4:
                  return 'Apr';
                case 5:
                  return 'May';
                case 6:
                  return 'Jun';
                case 7:
                  return 'Jul';
                case 8:
                  return 'Aug';
                case 9:
                  return 'Sep';
                case 10:
                  return 'Oct';
                case 11:
                  return 'Nov';
                case 12:
                  return 'Dec';
                default:
                  return '';
              }
            })();
            return \`\${adjustedDay} \${monthText}, \${year}\`;
          })()}
        </div>
      </div>
      <div className='text-center text-xs text-neutral-400'>Equalizer</div>
      <div className='flex w-full justify-center gap-x-7 overflow-auto px-4'>
        {eqValues.map((val, idx) => (
          <div key={idx} className='flex flex-col items-center gap-y-4'>
            <div className='text-xs text-neutral-300'>dB</div>
            <Slider
              length={250}
              orientation='vertical'
              value={eqValues[idx]}
              onChange={(value) =>
                setEqValues((eqValues) => [
                  ...eqValues.slice(0, idx),
                  value,
                  ...eqValues.slice(idx + 1),
                ])
              }
              showRange
              accentColor={\`\${360 * (idx / eqValues.length)} 75% 60%\`}
            />
            <div className='text-xs text-neutral-300'>
              {(() => {
                switch (idx) {
                  case 0:
                    return '32Hz';
                  case 1:
                    return '64Hz';
                  case 2:
                    return '125Hz';
                  case 3:
                    return '250Hz';
                  case 4:
                    return '500Hz';
                  case 5:
                    return '1KHz';
                }
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`,
} as const;
