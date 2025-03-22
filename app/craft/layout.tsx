'use client';

import { AnimatePresence, MotionConfig } from 'motion/react';

export default function CraftLayout({
  modal,
  children,
}: {
  modal: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <MotionConfig transition={{ duration: 0.4, type: 'spring', bounce: 0.1 }}>
      <AnimatePresence>
        {children}
        {modal}
      </AnimatePresence>
    </MotionConfig>
  );
}
