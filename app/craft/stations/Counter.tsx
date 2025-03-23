import { useEffect, useRef, useState } from 'react';
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
                  initial={{ opacity: 0, y: `${-1 * 110 * direction}%` }}
                  animate={{ opacity: 1, y: '0%' }}
                >
                  {count}
                </motion.div>
                <motion.div
                  key={count - direction}
                  className='absolute inset-0 grid place-self-center'
                  initial={{ opacity: 1, y: '0%' }}
                  animate={{ opacity: 0, y: `${1 * 110 * direction}%` }}
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
