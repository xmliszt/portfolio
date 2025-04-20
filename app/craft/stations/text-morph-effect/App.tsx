import { useEffect, useState } from "react";
import { PlaneTakeoff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type MorphTextProps = {
  children: string;
};

function MorphText(props: MorphTextProps) {
  function createCharacters() {
    const characterCounts: { [char: string]: number } = {};
    return Array.from(props.children).map((char) => {
      if (!characterCounts[char]) characterCounts[char] = 1;
      const charKey = `${char}_${characterCounts[char]}`;
      characterCounts[char] += 1;

      return (
        <motion.span
          key={charKey}
          layoutId={charKey}
          className="inline-block"
          initial={{ opacity: 0, filter: "blur(5px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(5px)" }}
          transition={{
            duration: 0.375,
            type: "spring",
            bounce: 0,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      );
    });
  }

  return (
    <AnimatePresence mode="popLayout">
      <div className="relative">{createCharacters()}</div>
    </AnimatePresence>
  );
}

export default function App() {
  const [oldText, setOldText] = useState<string>("Gate open");
  const [newText, setNewText] = useState<string>("Boarding");
  const [displayText, setDisplayText] = useState<string>(oldText);

  const INTERVAL = 2000;
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (displayText === oldText) setDisplayText(newText);
      else setDisplayText(oldText);
    }, INTERVAL);

    return () => clearInterval(intervalId);
  }, [oldText, newText, displayText]);

  return (
    <div className="flex h-screen w-screen items-center justify-center font-bold">
      <div className="flex flex-col gap-y-8 p-2">
        {/* Text display */}
        <div className="flex h-32 w-full items-center justify-center rounded-xl bg-neutral-100 p-4 shadow-inner select-none">
          <div className="relative flex h-16 w-64 items-center justify-center rounded-xl bg-neutral-800 px-3 py-1.5 text-center text-lg text-neutral-100 shadow-lg">
            <MorphText>{displayText}</MorphText>
            <PlaneTakeoff className="absolute top-2 left-2 size-4" />
          </div>
        </div>
        <div className="flex w-full flex-col gap-x-4 gap-y-4 sm:flex-row">
          <div className="flex flex-col gap-y-1.5">
            <label htmlFor="before-input" className="text-sm">
              Before
            </label>
            <input
              id="before-input"
              className="h-10 w-full rounded-md bg-neutral-100 px-2.5 transition-all focus-visible:ring focus-visible:ring-neutral-800 focus-visible:outline-none sm:w-64"
              value={oldText}
              onChange={(e) => setOldText(e.target.value)}
              maxLength={16}
            />
          </div>
          <div className="flex flex-col gap-y-1.5">
            <label htmlFor="after-input" className="text-sm">
              After
            </label>
            <input
              id="after-input"
              className="h-10 w-full rounded-md bg-neutral-100 px-2.5 transition-all focus-visible:ring focus-visible:ring-neutral-800 focus-visible:outline-none sm:w-64"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              maxLength={16}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
