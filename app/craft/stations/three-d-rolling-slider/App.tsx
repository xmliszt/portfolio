import { useCallback, useRef, useState } from "react";
import { Volume, Volume1, Volume2 } from "lucide-react";
import { clamp, motion } from "motion/react";

import { cn } from "./utils";

type SliderProps = {
  /**
   * The value of the slider, between 0 and 100.
   */
  value: number;
  /**
   * The function to call when the slider value changes.
   */
  onChange?: (value: number) => void;
  /**
   * The content to display on the ball.
   */
  icon?: React.ReactNode;
  /**
   * Oritentation of the slider
   */
  orientation?: "horizontal" | "vertical";
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

  const accent = accentColor ?? "150 98% 57%";
  const sliderLength = length ?? 300;
  const direction = orientation ?? "horizontal";

  const thumbValue = value * (sliderLength / 100);
  const thumbRotationValue = value * 3.6;

  const updateProgress = useCallback(
    (client: number) => {
      const containerElement = containerRef.current;
      if (!containerElement) return;
      const rect = containerElement.getBoundingClientRect();
      const clientPositionInContainer =
        client - (direction === "horizontal" ? rect.x : rect.y);
      const effectiveClient =
        ((clientPositionInContainer - 28) / (sliderLength - 56)) * sliderLength;

      const percentage =
        (effectiveClient /
          (direction === "horizontal" ? rect.width : rect.height)) *
        100;
      const effectivePercentage =
        direction === "horizontal" ? percentage : 100 - percentage;
      onChange?.(clamp(0, 100, effectivePercentage));
    },
    [direction, sliderLength, onChange]
  );

  const handlePointerDown = (event: PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
    updateProgress(direction === "horizontal" ? event.clientX : event.clientY);

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      updateProgress(
        direction === "horizontal" ? event.clientX : event.clientY
      );
      setIsDragging(true);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        width: direction === "horizontal" ? sliderLength : 24,
        height: direction === "vertical" ? sliderLength : 24,
      }}
    >
      {/* Slider track */}
      <div
        className={cn(
          "absolute inset-0 rounded-full",
          "overflow-hidden bg-neutral-900"
        )}
      >
        {/* Slider range */}
        <motion.div
          className={cn(
            "absolute",
            direction === "horizontal"
              ? "top-1/2 left-0 origin-left rounded-l-full"
              : "bottom-0 left-1/2 origin-bottom rounded-b-full"
          )}
          animate={{
            backgroundColor:
              isDragging || showRange === true ? `hsl(${accent})` : "#171717",
            filter:
              isDragging || showRange === true
                ? `drop-shadow(0 0 5px hsl(${accent} / 60%))`
                : `drop-shadow(0 0 0px black))`,
          }}
          style={{
            height:
              direction === "vertical" ? `calc(100% * ${value / 100})` : "100%",
            width:
              direction === "horizontal"
                ? `calc(100% * ${value / 100})`
                : "100%",
            translateX: direction === "vertical" ? "-50%" : 0,
            translateY: direction === "horizontal" ? "-50%" : 0,
          }}
        />

        {/* drop shadow overlay */}
        <div
          className={cn(
            "absolute inset-0 size-full rounded-[12px] shadow-[inset_0_0_10px_rgba(0,0,0,0.9)]"
          )}
        />
      </div>
      {/* Slider thumb */}
      <motion.div
        className={cn(
          "absolute size-14 cursor-grab touch-none overflow-hidden rounded-full",
          "shadow-[0_0_10px_rgba(0,0,0,0.5)]",
          direction === "horizontal" ? "top-1/2" : "left-1/2"
        )}
        style={{
          y:
            direction === "vertical"
              ? (sliderLength - 56) *
                  ((sliderLength - thumbValue) / sliderLength) +
                28
              : 0,
          x:
            direction === "horizontal"
              ? (sliderLength - 56) * (thumbValue / sliderLength) + 28
              : 0,
          translateX: "-50%",
          translateY: "-50%",
        }}
        onPointerDown={(event) => handlePointerDown(event.nativeEvent)}
      >
        <div
          className={cn(
            "relative size-full",
            "bg-[radial-gradient(circle_at_center,#FFFFFF_0%,#444444_10%,#222222_34%,#000000_100%)]"
          )}
          style={{
            transformStyle: "preserve-3d",
            perspective: "100px",
          }}
        >
          {Array.from({ length: 3 }).map((_, index, array) => {
            const rotationDeg =
              thumbRotationValue + index * (360 / array.length);

            return (
              <div
                key={index}
                className={cn("absolute top-1/2 left-1/2 origin-center")}
                style={{
                  transform:
                    direction === "horizontal"
                      ? `translate(-50%,-50%) rotateY(${rotationDeg}deg) translateZ(28px)`
                      : `translate(-50%,-50%) rotateX(${rotationDeg}deg) translateZ(28px)`,
                }}
              >
                <span
                  className={cn("font-mono text-xs transition-colors")}
                  style={{
                    color: isDragging ? `hsl(${accent})` : "#a1a1a1",
                    filter: isDragging
                      ? `drop-shadow(0 0 4px hsl(${accent}))`
                      : "drop-shadow(0 0 0px black)",
                  }}
                >
                  {icon ?? `${Math.round(value)}%`}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default function ThreeDRollingSlider() {
  // For volume example
  const [volume, setVolume] = useState(0);

  // For equalizer example
  const [eqValues, setEqValues] = useState<number[]>(Array(4).fill(0));

  return (
    <div className="relative h-screen w-screen bg-neutral-900 p-4 font-mono">
      <div className="flex h-full w-full flex-col items-center justify-center gap-y-8">
        <div className="flex flex-col gap-y-4">
          <div className="text-sm text-neutral-600">Volume</div>
          <Slider
            length={250}
            value={volume}
            onChange={setVolume}
            accentColor="0 0% 100%"
            showRange
            icon={(() => {
              switch (true) {
                case volume <= 33:
                  return <Volume className="size-4" />;
                case volume <= 66:
                  return <Volume1 className="size-4" />;
                default:
                  return <Volume2 className="size-4" />;
              }
            })()}
          />
        </div>
        <div className="flex flex-col gap-y-4">
          <div className="text-sm text-neutral-600">Equalizer</div>
          <div className="flex h-[300px] w-full gap-x-7 px-4">
            {eqValues.map((val, idx) => (
              <div
                key={idx}
                className="flex h-full flex-col items-center gap-y-4"
              >
                <div className="text-xs text-neutral-300">dB</div>
                <Slider
                  length={250}
                  orientation="vertical"
                  value={eqValues[idx]}
                  onChange={(value) =>
                    setEqValues((eqValues) => [
                      ...eqValues.slice(0, idx),
                      value,
                      ...eqValues.slice(idx + 1),
                    ])
                  }
                  showRange
                  accentColor={`${360 * (idx / eqValues.length)} 75% 60%`}
                />
                <div className="text-xs text-neutral-300">
                  {(() => {
                    switch (idx) {
                      case 0:
                        return "32Hz";
                      case 1:
                        return "64Hz";
                      case 2:
                        return "125Hz";
                      case 3:
                        return "250Hz";
                    }
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
