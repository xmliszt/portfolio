import type { CraftStation } from './types';

export const stations: CraftStation[] = [
  {
    id: '1',
    title: 'Apple Vision OS resize handle animation',
    tags: ['AnimatePresence', 'MotionConfig'],
    description:
      'Use react-motion to re-create the Apple Vision OS window resize handle animation with real resizing functionality.',
    code: `import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { useState, useRef, useEffect, useCallback } from 'react';

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
}

export default function App() {
  const [resizingCorner, setResizingCorner] = useState<'br' | 'bl' | undefined>(undefined);
  const [size, setSize] = useState({ width: 256, height: 256 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const activeCornerRef = useRef<'br' | 'bl' | undefined>(undefined);
   
  const handlePointerMove = useCallback((e: PointerEvent) => {
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    
    // Calculate new dimensions based on which corner is being dragged
    // Using a 2x multiplier to sync corner position with pointer movement
    let newWidth = startPosRef.current.width;
    let newHeight = startPosRef.current.height;
    
    if (activeCornerRef.current === 'br') {
      // Apply scaling factor for bottom-right corner
      newWidth = Math.max(100, startPosRef.current.width + deltaX * 2);
      newHeight = Math.max(100, startPosRef.current.height + deltaY * 2);
    } else if (activeCornerRef.current === 'bl') {
      // Apply scaling factor for bottom-left corner
      newWidth = Math.max(100, startPosRef.current.width - deltaX * 2);
      newHeight = Math.max(100, startPosRef.current.height + deltaY * 2);
    }
    
    // Check bounds
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const maxWidth = window.innerWidth - containerRect.left - 32; // Add some padding
      const maxHeight = window.innerHeight - containerRect.top - 32;
      
      newWidth = Math.min(newWidth, maxWidth);
      newHeight = Math.min(newHeight, maxHeight);
    }
    
    setSize({ width: newWidth, height: newHeight });
  }, []);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setResizingCorner(undefined);
    activeCornerRef.current = undefined;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  const handlePointerDown = useCallback((e: React.PointerEvent, corner: 'br' | 'bl') => {
    setIsDragging(true);
    setResizingCorner(corner);
    activeCornerRef.current = corner;
    
    // Store initial position and size
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
    
    // Add event listeners for dragging
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [size, handlePointerMove, handlePointerUp]);
  
  return (
    <div 
      className='flex justify-center items-center h-screen w-screen'
      style={{
        background: 'url(https://images.unsplash.com/photo-1564078516393-cf04bd966897?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) no-repeat center bottom',
        backgroundSize: 'cover'
      }}
      ref={containerRef}
    >
      <div 
        className='relative rounded-[20px] bg-neutral-500/30 backdrop-blur-md shadow-[inset_0_0_5px_rgba(255,255,255,0.2)] select-none'
        style={{ 
          width: \`\${size.width}px\`, 
          height: \`\${size.height}px\`,
          transition: isDragging ? 'none' : 'width 0.2s, height 0.2s'
        }}
      >
        <div className="flex flex-col gap-y-2 justify-center items-center size-full">
          <div className="text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paw-print"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>
          </div>
          <div className="text-neutral-400 text-xs">
            {Math.round(size.width)} × {Math.round(size.height)}
          </div>
        </div>
        <MotionConfig transition={{ duration: 0.275, type: 'spring', bounce: 0 }}>
        <AnimatePresence>
          {(() => {
            switch (resizingCorner) {
              // bottom right corner resize handle
              case 'br':
                return (
                  <motion.div 
                    className="absolute bottom-0 right-0 size-10 overflow-visible"
                    initial={{ scale: 1, x: 16, y: 16 }}
                    animate={{ scale: isDragging ? 0.9 : 1, x: 16, y: 16 }}
                  >
                    <motion.svg 
                      viewBox="0 0 30 30"
                      className="size-full"
                      fill="none"
                    >
                      <motion.path 
                        d="M10,24 Q22,22 24,10" 
                        stroke="white" 
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity="0.7"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      />
                    </motion.svg>
                  </motion.div>
                );
              // bottom left corner resize handle
              case 'bl':
                return (
                  <motion.div 
                    className="absolute bottom-0 left-0 size-10 overflow-visible"
                    initial={{ scale: 1, x: -16, y: 16 }}
                    animate={{ scale: isDragging ? 0.9 : 1, x: -16, y: 16 }}
                  >
                    <motion.svg 
                      viewBox="0 0 30 30"
                      className="size-full"
                      fill="none"
                    >
                      <motion.path 
                        d="M20,24 Q8,22 6,10" 
                        stroke="white" 
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity="0.7"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      />
                    </motion.svg>
                  </motion.div>
                );
              default:
                return null;
            }
          })()}
          </AnimatePresence>
        </MotionConfig>
        
        {/* pointer capture areas */}
        <div 
          className='absolute bottom-0 right-0 size-16 translate-x-4 translate-y-4 cursor-nwse-resize' 
          onPointerEnter={useCallback(() => !isDragging && setResizingCorner('br'), [isDragging])} 
          onPointerLeave={useCallback(() => !isDragging && setResizingCorner(undefined), [isDragging])} 
          onPointerDown={(event) => handlePointerDown(event, 'br')}
        />
        <div 
          className='absolute bottom-0 left-0 size-16 -translate-x-4 translate-y-4 cursor-nesw-resize' 
          onPointerEnter={useCallback(() => !isDragging && setResizingCorner('bl'), [isDragging])} 
          onPointerLeave={useCallback(() => !isDragging && setResizingCorner(undefined), [isDragging])} 
          onPointerDown={(event) => handlePointerDown(event, 'bl')}
        />
      </div>

      <p className='fixed text-neutral-400 text-xs bottom-6 px-4 text-center'>
        Drag the bottom corners to resize the card
      </p>
    </div>
  );
}`,
  },
];
