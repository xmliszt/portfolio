'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

const BGMProviderContext = createContext({
  isPlaying: false,
  toggleBGM: () => {},
});

const BGM_URL =
  'https://tvstbbuidvwgelgidaqy.supabase.co/storage/v1/object/public/bgm/MUJI2020%20320kbps.mp3';

export function BGMProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerID, setPlayerID] = useState(0);
  const howlerRef = useRef<Howl | null>(null);

  useEffect(() => {
    howlerRef.current = new Howl({
      src: [BGM_URL],
      volume: 0.2,
      loop: true,
      autoplay: true,
      onplay: (id) => {
        setPlayerID(id);
        setIsPlaying(true);
      },
      onpause: () => {
        setIsPlaying(false);
      },
    });
    return () => {
      howlerRef.current?.unload();
    };
  }, []);

  function toggleBGM() {
    const howler = howlerRef.current;
    if (!howler) return;
    if (howler.playing(playerID)) {
      howler.pause(playerID);
    } else {
      setPlayerID(howler.play());
    }
    setIsPlaying(howler.playing(playerID));
  }

  return (
    <BGMProviderContext.Provider value={{ isPlaying, toggleBGM }}>
      {children}
    </BGMProviderContext.Provider>
  );
}

export function useBGM() {
  return useContext(BGMProviderContext);
}
