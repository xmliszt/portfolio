"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart, HeartBreak, ThumbsDown, ThumbsUp } from "@phosphor-icons/react";
import { AnimatePresence, motion, Variants } from "motion/react";

import { fetchRatings } from "./fetch-ratings";
import { updateRatings } from "./increment-ratings";

type RatingsProps = {
  id: string;
};

export function Ratings({ id }: RatingsProps) {
  const [isPending, startTransition] = useTransition();
  const [positiveRatings, setPositiveRatings] = useState(0);
  const [negativeRatings, setNegativeRatings] = useState(0);
  const [voted, setVoted] = useState(false);
  const [votedSentiment, setVotedSentiment] = useState<"up" | "down">("up");

  useEffect(() => {
    startTransition(async () => {
      const { positive_rating, negative_rating } = await fetchRatings({ id });
      setPositiveRatings(positive_rating ?? 0);
      setNegativeRatings(negative_rating ?? 0);
    });
  }, [id]);

  const variants: Variants = {
    initial: {
      scale: 1,
      opacity: 1,
      rotate: 0,
    },
    hover: {
      scale: [1, 1.2, 1.3, 1.2, 1],
      rotate: [0, -10, 10, -10, 0],
      opacity: 1,
      transition: {
        times: [0, 0.2, 0.5, 0.8, 1],
        duration: 0.5,
        ease: "easeInOut",
      },
    },
    exit: {
      scale: 0,
      rotate: 0,
      opacity: 0,
    },
  };

  const heartVariants: Variants = {
    initial: {
      scale: 2,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.9,
        duration: 1,
        delay: 0.5,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
    },
  };

  function upVote() {
    startTransition(async () => {
      setVoted(true);
      const { positive_rating } = await updateRatings({ id, direction: "up" });
      setPositiveRatings(positive_rating ?? 0);
      setVotedSentiment("up");
    });
  }

  function downVote() {
    startTransition(async () => {
      setVoted(true);
      const { negative_rating } = await updateRatings({
        id,
        direction: "down",
      });
      setNegativeRatings(negative_rating ?? 0);
      setVotedSentiment("down");
    });
  }

  return (
    <div className="flex w-full justify-center py-4 md:justify-end">
      <div className="grid grid-cols-2 grid-rows-[1fr_2fr] gap-1">
        <div className="text-muted-foreground text-center text-xs font-semibold">
          {positiveRatings}
        </div>
        <div className="text-muted-foreground text-center text-xs font-semibold">
          {negativeRatings}
        </div>
        <div className="bg-card relative col-span-2 flex w-[64px] flex-row items-center justify-center gap-x-4 rounded-lg border px-2 py-1 shadow-lg">
          <AnimatePresence mode="wait">
            {voted ? (
              votedSentiment === "up" ? (
                <motion.div
                  key="heart"
                  className="absolute z-10 grid size-6 place-items-center p-1"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={heartVariants}
                >
                  <Heart color="#ed5a75" />
                </motion.div>
              ) : (
                <motion.div
                  key="heart-break"
                  className="absolute z-10 grid size-6 place-items-center p-1"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={heartVariants}
                >
                  <HeartBreak color="#ed5a75" />
                </motion.div>
              )
            ) : (
              <>
                <motion.button
                  key="thumbs-up"
                  onClick={upVote}
                  disabled={isPending}
                  variants={variants}
                  initial="initial"
                  whileHover="hover"
                  exit="exit"
                >
                  <ThumbsUp />
                </motion.button>
                <motion.button
                  key="thumbs-down"
                  onClick={downVote}
                  disabled={isPending}
                  variants={variants}
                  initial="initial"
                  whileHover="hover"
                  exit="exit"
                >
                  <ThumbsDown />
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
