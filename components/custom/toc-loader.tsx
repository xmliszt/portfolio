'use client';

import { useEffect } from 'react';

import { useTOC } from '../toc-provider';

type TOCLoaderProps = {
  toc: Page['toc'];
  showToc: Page['showToc'];
};

export function TOCLoader(props: TOCLoaderProps) {
  const { setToc, setShowToc } = useTOC();

  useEffect(() => {
    setToc(props.toc);
    setShowToc(props.showToc);

    return () => {
      setToc([]);
      setShowToc(false);
    };
  }, [props.toc, props.showToc, setToc, setShowToc]);

  return null;
}
