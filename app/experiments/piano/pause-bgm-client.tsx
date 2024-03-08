'use client';

import { useEffect } from 'react';

import { useBGM } from '@/components/bgm-provider';

export function PauseBGMClient() {
  const { pauseBGM } = useBGM();
  useEffect(() => {
    pauseBGM();
  }, [pauseBGM]);
  return null;
}
