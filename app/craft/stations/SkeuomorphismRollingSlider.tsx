import { useCallback, useState } from 'react';
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
            width: `calc(100% * ${value / 100})`,
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
                    transform: `translate(-50%,-50%) rotateY(${rotationDeg}deg) translateZ(28px)`,
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
          return `${day} ${month}, ${year}`;
        })()}
      </div>
    </div>
  );
}
