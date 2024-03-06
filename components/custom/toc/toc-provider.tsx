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
  hash: string;
  setHash: Dispatch<SetStateAction<string>>;
};

const TOCProviderContext = createContext<TOCProviderContextType>({
  toc: [],
  setToc: () => {},
  showToc: true,
  setShowToc: () => {},
  hash: '',
  setHash: () => {},
});

export function TOCProvider({ children }: { children: React.ReactNode }) {
  const [toc, setToc] = useState<Page['toc']>([]);
  const [showToc, setShowToc] = useState(true);
  const [hash, setHash] = useState('');

  return (
    <TOCProviderContext.Provider
      value={{ toc, setToc, showToc, setShowToc, hash, setHash }}
    >
      {children}
    </TOCProviderContext.Provider>
  );
}

export function useTOC() {
  return useContext(TOCProviderContext);
}
