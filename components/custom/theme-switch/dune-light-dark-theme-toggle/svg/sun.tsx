import { motion, Variants } from "motion/react";

export function SunSVG() {
  const variants: Variants = {
    "light-theme": {
      translateX: "0%",
      translateY: "-35%",
      filter: "drop-shadow(0 0 15px #ffb800)",
      scale: 1,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1,
        ease: "easeOut",
      },
    },
    "dark-theme": {
      translateX: "-150%",
      translateY: "-25%",
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    glowing: {
      filter: [
        "drop-shadow(0 0 15px #ffb800)",
        "drop-shadow(0 0 35px #ffb800)",
        "drop-shadow(0 0 15px #ffb800)",
      ],
      transition: {
        duration: 4,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        repeat: Infinity,
      },
    },
    "light-hover": {
      translateY: "-30%",
    },
  };

  return (
    <motion.svg
      className="absolute top-0 z-10"
      width="200%"
      height="200%"
      viewBox="0 0 200 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      variants={variants}
    >
      <circle cx="53.5263" cy="14.9123" r="39.4737" fill="#ffd469" />
    </motion.svg>
  );
}
