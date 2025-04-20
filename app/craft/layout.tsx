"use client";

import { MotionConfig } from "motion/react";

export default function CraftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionConfig transition={{ duration: 0.4, type: "spring", bounce: 0.1 }}>
      {children}
    </MotionConfig>
  );
}
