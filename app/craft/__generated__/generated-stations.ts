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

export default function AppleVisionResizeHandle() {
  const [draggingResizingCorner, setDraggingResizingCorner] = useState<
    'br' | 'bl' | undefined
  >(undefined);
  const activeResizingHandle = useRef<'br' | 'bl' | undefined>(undefined);

  const [size, setSize] = useState({ width: 256, height: 256 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const dragControls = useDragControls();

  function startDragging(event: React.PointerEvent) {
    dragControls.start(event, { snapToCursor: false });
  }

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;

    // Calculate new dimensions based on which corner is being dragged
    // Using a 2x multiplier as container expands in both directions
    let newWidth = startPosRef.current.width;
    let newHeight = startPosRef.current.height;

    if (activeResizingHandle.current === 'br') {
      newWidth = Math.max(200, startPosRef.current.width + deltaX * 2);
      newHeight = Math.max(200, startPosRef.current.height + deltaY * 2);
    } else if (activeResizingHandle.current === 'bl') {
      newWidth = Math.max(200, startPosRef.current.width - deltaX * 2);
      newHeight = Math.max(200, startPosRef.current.height + deltaY * 2);
    }

    // Limit the size to the container
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const maxWidth = containerRect.width - 32;
      const maxHeight = containerRect.height - 32;

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
                    <div
                      key={draggingResizingCorner}
                      className='h-full w-20 overflow-visible'
                    >
                      <svg
                        viewBox='0 0 80 30'
                        className='size-full'
                        fill='none'
                      >
                        <motion.path
                          d='M4,9 L76,9'
                          stroke='white'
                          strokeWidth='5.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          fill='none'
                          onPointerDown={(event) => startDragging(event)}
                          style={{ touchAction: 'none' }}
                          initial={{ scale: 1, opacity: 0.7 }}
                          exit={{ scale: 1, opacity: 0 }}
                          whileHover={{ scale: 1, opacity: 1 }}
                          whileTap={{ scale: 0.9, opacity: 1 }}
                        />
                      </svg>
                    </div>
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
  'SkeuomorphismRollingSlider': `import { useCallback, useState } from 'react';
import { clamp, motion } from 'motion/react';

type SliderProps = {
  /**
   * The value of the slider, between 0 and 100.
   */
  value: number;
  /**
   * The function to call when the slider value changes.
   */
  onChange: (value: number) => void;
};

function Slider({ value, onChange }: SliderProps) {
  const [trackDivX, setTrackDivX] = useState(0);
  const [trackDivWidth, setTrackDivWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const thumbXValue = value * 3;
  const thumbRotationValue = value * 3.6;

  const updateProgress = useCallback(
    (clientX: number) => {
      const percentage = ((clientX - trackDivX) / trackDivWidth) * 100;
      onChange(clamp(0, 100, percentage));
    },
    [onChange, trackDivWidth, trackDivX]
  );

  const handlePointerDown = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
    updateProgress(event.clientX);

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      updateProgress(event.clientX);
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
      ref={(el) => {
        if (!el) return;
        setTrackDivWidth(el.clientWidth);
        setTrackDivX(el.getBoundingClientRect().x);
      }}
      className='relative h-5 w-[300px]'
    >
      {/* Slider track */}
      <motion.div className='absolute inset-0 rounded-full bg-neutral-900 shadow-[inset_0_0_10px_rgba(0,0,0,0.9)]'>
        {/* Slider range */}
        <motion.div
          className='absolute top-1/2 left-0 h-full origin-center rounded-full'
          animate={{ backgroundColor: isDragging ? '#05df72' : '#f7c331' }}
          style={{
            width: \`calc(100% * \${value / 100})\`,
            translateY: '-50%',
          }}
        />
        {/* Slider thumb */}
        <motion.div
          className='absolute top-1/2 size-14 cursor-grab touch-none overflow-hidden rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]'
          style={{
            x: thumbXValue,
            translateX: '-50%',
            translateY: '-50%',
          }}
          onPointerDown={(event) => handlePointerDown(event.nativeEvent)}
        >
          <div
            className='relative size-full bg-[radial-gradient(circle_at_center,#FFFFFF_0%,#444444_10%,#222222_34%,#000000_100%)]'
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
                  className='absolute top-1/2 left-1/2 origin-center'
                  style={{
                    transform: \`translate(-50%,-50%) rotateY(\${rotationDeg}deg) translateZ(28px)\`,
                  }}
                >
                  <motion.svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='size-5'
                    animate={{
                      color: isDragging ? '#05df72' : '#f7c331',
                      filter: isDragging
                        ? 'drop-shadow(0 0 2px #05df72)'
                        : 'drop-shadow(0 0 2px #f7c331)',
                    }}
                  >
                    <path d='M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8' />
                    <path d='M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1' />
                    <path d='M2 21h20' />
                    <path d='M7 8v3' />
                    <path d='M12 8v3' />
                    <path d='M17 8v3' />
                    <path d='M7 4h.01' />
                    <path d='M12 4h.01' />
                    <path d='M17 4h.01' />
                  </motion.svg>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SkeuomorphismRollingSlider() {
  const LOWEST_RANGE = new Date('1900-01-01');
  const HIGHEST_RANGE = new Date('2025-12-31');
  const [birthday, setBirthday] = useState(new Date('1900-01-01'));
  const birthdayPercentage =
    ((birthday.getTime() - LOWEST_RANGE.getTime()) /
      (HIGHEST_RANGE.getTime() - LOWEST_RANGE.getTime())) *
    100;

  return (
    <div className='relative flex h-screen w-screen flex-col items-center justify-center gap-y-12 bg-neutral-900'>
      <div className='text-sm text-neutral-600'>Date of birth</div>
      <Slider
        value={birthdayPercentage}
        onChange={(value) =>
          setBirthday(
            new Date(
              LOWEST_RANGE.getTime() +
                (value / 100) *
                  (HIGHEST_RANGE.getTime() - LOWEST_RANGE.getTime())
            )
          )
        }
      />
      <div className='text-sm text-neutral-600'>
        {(() => {
          const year = birthday.getFullYear();
          const month = (() => {
            const monthValue = birthday.getMonth() + 1;
            switch (monthValue) {
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
          const day = birthday.getDate();
          return \`\${day} \${month}, \${year}\`;
        })()}
      </div>
    </div>
  );
}
`,
} as const;
