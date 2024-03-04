'use client';

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';

type TOCProviderContextType = {
  toc: Page['toc'];
  setToc: Dispatch<SetStateAction<Page['toc']>>;
  showToc: boolean;
  setShowToc: Dispatch<SetStateAction<boolean>>;
};

const TOCProviderContext = createContext<TOCProviderContextType>({
  toc: [],
  setToc: () => {},
  showToc: true,
  setShowToc: () => {},
});

export function TOCProvider({ children }: { children: React.ReactNode }) {
  const [toc, setToc] = useState<Page['toc']>([]);
  const [showToc, setShowToc] = useState(true);

  return (
    <TOCProviderContext.Provider value={{ toc, setToc, showToc, setShowToc }}>
      {children}
    </TOCProviderContext.Provider>
  );
}

export function useTOC() {
  return useContext(TOCProviderContext);
}
