'use client';

import { useEffect, useRef } from 'react';

import { WiggleRenderer } from './wiggle-renderer';

export function WiggleContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WiggleRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create a new renderer instance each time the component mounts
    const renderer = new WiggleRenderer();
    rendererRef.current = renderer;

    renderer.init(container);
    renderer.loop();

    return () => {
      // Properly dispose the renderer when unmounting
      if (!rendererRef.current) return;
      rendererRef.current.dispose();
      rendererRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className='mt-4 h-[500px] w-full overflow-hidden rounded-lg'
    />
  );
}
