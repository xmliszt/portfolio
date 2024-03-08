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
      const randomIndex = Math.floor(Math.random() * bgms.length);
      currentPlayingIndex = randomIndex;
      setBgms(bgms);
    });
  }, []);

  useEffect(() => {
    if (isPending || bgms.length === 0) return;
    // Load howls
    for (const bgm of bgms) {
      const howl = new Howl({
        src: [bgm.url], // TODO: Hard coded to be the first one for now, next time can implement playback queue.
        volume: 0.5,
        loop: false,
        html5: true,
        onload: () => {
          console.log('Loaded', bgm.title);
        },
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
          const nextHowler = howlers[nextIndex];
          if (!nextHowler) return;
          currentPlayingIndex = nextIndex;
          setCurrentlyPlayingBGM(bgms[nextIndex]);
          setPlayerID(nextHowler.play());
        },
      });
      howlers.push(howl);
    }
    // Start playing a random one
    const howler = howlers[currentPlayingIndex];
    if (!howler) return;
    setCurrentlyPlayingBGM(bgms[currentPlayingIndex]);
    if (playerID) howler.stop(playerID);
    setPlayerID(howler.play());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, bgms]);

  function toggleBGM() {
    const howler = howlers[currentPlayingIndex];
    if (!howler) return;
    if (howler.playing(playerID)) {
      howler.pause(playerID);
    } else {
      setPlayerID(howler.play());
      console.log('Playing from toggle', bgms[currentPlayingIndex].title);
    }
  }

  function pauseBGM() {
    const howler = howlers[currentPlayingIndex];
    if (!howler) return;
    howler.pause(playerID);
  }

  function playBGM() {
    const howler = howlers[currentPlayingIndex];
    if (!howler) return;
    setPlayerID(howler.play());
  }

  function nextBGM() {
    const howler = howlers[currentPlayingIndex];
    if (!howler) return;
    // Stop the current one
    howler.fade(howler.volume(), 0, 1000);
    howler.stop();
    // Play the next one
    const nextIndex = (currentPlayingIndex + 1) % bgms.length;
    const nextHowler = howlers[nextIndex];
    if (!nextHowler) return;
    currentPlayingIndex = nextIndex;
    setCurrentlyPlayingBGM(bgms[nextIndex]);
    setPlayerID(nextHowler.play());
  }

  function prevBGM() {
    const howler = howlers[currentPlayingIndex];
    if (!howler) return;
    // Stop the current one
    howler.fade(howler.volume(), 0, 1000);
    howler.stop();
    // Play the previous one
    const prevIndex = (currentPlayingIndex - 1 + bgms.length) % bgms.length;
    const prevHowler = howlers[prevIndex];
    if (!prevHowler) return;
    currentPlayingIndex = prevIndex;
    setCurrentlyPlayingBGM(bgms[prevIndex]);
    setPlayerID(prevHowler.play());
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
