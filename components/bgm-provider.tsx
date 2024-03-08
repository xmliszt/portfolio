'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
} from 'react';

import { BGM, fetchBGMs } from './fetch-bgms';

const BGMProviderContext = createContext<{
  isPlaying: boolean;
  toggleBGM: () => void;
  currentBGM: BGM | null;
  pauseBGM: () => void;
  playBGM: () => void;
  nextBGM: () => void;
  prevBGM: () => void;
}>({
  isPlaying: false,
  toggleBGM: () => {},
  currentBGM: null,
  pauseBGM: () => {},
  playBGM: () => {},
  nextBGM: () => {},
  prevBGM: () => {},
});

let currentPlayingIndex = 0;
const howlers: Howl[] = [];

export function BGMProvider({ children }: { children: React.ReactNode }) {
  const [bgms, setBgms] = useState<BGM[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerID, setPlayerID] = useState(0);
  const [currentlyPlayingBGM, setCurrentlyPlayingBGM] = useState<BGM | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const bgms = await fetchBGMs();
      setBgms(bgms);
    });
  }, []);

  useEffect(() => {
    if (isPending || bgms.length === 0) return;
    // Load howls
    for (const bgm of bgms) {
      const howl = new Howl({
        src: [bgm.url], // TODO: Hard coded to be the first one for now, next time can implement playback queue.
        volume: 0.2,
        loop: false,
        onplay: (id) => {
          setIsPlaying(true);
          setPlayerID(id);
        },
        onpause: () => {
          setIsPlaying(false);
        },
        onstop: () => {
          setIsPlaying(false);
        },
        onend: () => {
          // Play the next one
          const nextIndex = (currentPlayingIndex + 1) % bgms.length;
          currentPlayingIndex = nextIndex;
          howlers[nextIndex].play();
        },
      });
      howlers.push(howl);
    }
    // Start playing the first one
    howlers[currentPlayingIndex].play();
    setCurrentlyPlayingBGM(bgms[currentPlayingIndex]);
    setPlayerID(howlers[currentPlayingIndex].play() ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, bgms]);

  function toggleBGM() {
    const howler = howlers[currentPlayingIndex];
    if (!howler) return;
    if (howler.playing(playerID)) {
      howler.pause(playerID);
      setIsPlaying(false);
    } else {
      setPlayerID(howler.play() ?? 0);
      setIsPlaying(true);
    }
  }

  function pauseBGM() {
    const howler = howlers[currentPlayingIndex];
    howler.pause(playerID);
    setIsPlaying(false);
  }

  function playBGM() {
    const howler = howlers[currentPlayingIndex];
    setPlayerID(howler.play() ?? 0);
    setIsPlaying(true);
  }

  function nextBGM() {
    // Stop the current one
    howlers[currentPlayingIndex].stop();
    // Play the next one
    const nextIndex = (currentPlayingIndex + 1) % bgms.length;
    currentPlayingIndex = nextIndex;
    setCurrentlyPlayingBGM(bgms[nextIndex]);
    setPlayerID(howlers[nextIndex].play() ?? 0);
    setIsPlaying(true);
  }

  function prevBGM() {
    // Stop the current one
    howlers[currentPlayingIndex].stop();
    // Play the previous one
    const prevIndex = (currentPlayingIndex - 1 + bgms.length) % bgms.length;
    currentPlayingIndex = prevIndex;
    setCurrentlyPlayingBGM(bgms[prevIndex]);
    setPlayerID(howlers[prevIndex].play() ?? 0);
    setIsPlaying(true);
  }

  return (
    <BGMProviderContext.Provider
      value={{
        isPlaying,
        toggleBGM,
        currentBGM: currentlyPlayingBGM,
        pauseBGM,
        playBGM,
        nextBGM,
        prevBGM,
      }}
    >
      {children}
    </BGMProviderContext.Provider>
  );
}

export function useBGM() {
  return useContext(BGMProviderContext);
}
