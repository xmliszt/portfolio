import { useCallback, useRef, useState } from 'react';
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
            dragMomentum={false}
            dragListener={false}
            className='relative rounded-[20px] bg-neutral-500/30 shadow-[inset_0_0_5px_rgba(255,255,255,0.5)] backdrop-blur-md select-none'
            style={{
              width: `${size.width}px`,
              height: `${size.height}px`,
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
