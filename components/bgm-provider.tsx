'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

const BGMProviderContext = createContext<{
  isPlaying: boolean;
  toggleBGM: () => void;
  currentBGM: BGM | null;
}>({
  isPlaying: false,
  toggleBGM: () => {},
  currentBGM: null,
});

type BGM = {
  title: string;
  artist: string;
  url: string;
};

const BGM_URLS: BGM[] = [
  {
    url: 'https://tvstbbuidvwgelgidaqy.supabase.co/storage/v1/object/public/bgm/MUJI2020%20320kbps.mp3',
    title: 'MUJI 2020',
    artist: 'Ryuichi Sakamoto',
  },
];

export function BGMProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerID, setPlayerID] = useState(0);
  const [currentlyPlayingBGM, setCurrentlyPlayingBGM] = useState<BGM | null>(
    null
  );
  const howlerRef = useRef<Howl | null>(null);

  useEffect(() => {
    howlerRef.current = new Howl({
      src: [BGM_URLS[0].url], // TODO: Hard coded to be the first one for now, next time can implement playback queue.
      volume: 0.2,
      loop: true,
      autoplay: true,
      onload: () => {
        setCurrentlyPlayingBGM(BGM_URLS[0]);
      },
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
    <BGMProviderContext.Provider
      value={{ isPlaying, toggleBGM, currentBGM: currentlyPlayingBGM }}
    >
      {children}
    </BGMProviderContext.Provider>
  );
}

export function useBGM() {
  return useContext(BGMProviderContext);
}
