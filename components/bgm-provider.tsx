'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
} from 'react';

import { BGM, fetchBGMPublicUrl, fetchBGMs } from './fetch-bgms';

type BGMProviderContextType = {
  /**
   * If true, the music player is not triggered by user interaction at all. Once the user starts playing, it will be set to false.
   */
  isIdle: boolean;
  /**
   * If true, the music player is still loading the BGMs.
   */
  isLoading: boolean;
  /**
   * If true, the music player is playing.
   */
  isPlaying: boolean;
  /**
   * Toggle the BGM player.
   */
  toggleBGM: () => void;
  /**
   * The current BGM being played.
   */
  currentBGM: BGM | null;
  /**
   * Pause the current BGM.
   */
  pauseBGM: () => void;
  /**
   * Play the current BGM.
   */
  playBGM: () => void;
  /**
   * Play the next BGM in the playlist.
   */
  nextBGM: () => void;
  /**
   * Play the previous BGM in the playlist.
   */
  prevBGM: () => void;
};

const BGMProviderContext = createContext<BGMProviderContextType>({
  isIdle: true,
  isLoading: true,
  isPlaying: false,
  toggleBGM: () => {},
  currentBGM: null,
  pauseBGM: () => {},
  playBGM: () => {},
  nextBGM: () => {},
  prevBGM: () => {},
});

const VOLUME = 0.5;
const FADE_DURATION = 1000;

const sounds: Record<number, Howl> = {};

export function BGMProvider({ children }: { children: React.ReactNode }) {
  const [bgms, setBgms] = useState<BGM[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(0);
  const [isIdle, setIsIdle] = useState(true);
  const [isPending, startTransition] = useTransition();

  const _playBGM = (index: number) => {
    startTransition(async () => {
      const bgm = bgms[index];
      if (!bgm.url) {
        const { publicUrl } = await fetchBGMPublicUrl(bgm.id);
        bgm.url = publicUrl;
      }
      let sound = sounds[index];
      if (!sound) {
        // If the sound is not loaded, create a new one
        sound = new Howl({
          src: [bgm.url],
          volume: VOLUME,
          loop: false,
          html5: true,
          onload: () => {
            console.log('Loaded', bgm.title);
          },
          onend: () => {
            console.log('Ended', bgm.title);
            const nextIndex = (index + 1) % bgms.length;
            const sound = sounds[nextIndex];
            if (!sound || sound.playing()) return;
            console.log(
              `Start playing ${bgms[nextIndex].title} | ${Object.keys(sounds).length} in the playlist`
            );
            setIsIdle(false);
            sound.volume(VOLUME);
            sound.play();
            setIsPlaying(true);
            setCurrentPlayingIndex(nextIndex);
          },
          onplayerror: (_, error) => {
            console.error('Error playing', bgm.title, error);
          },
          onloaderror: (_, error) => {
            console.error('Error loading', bgm.title, error);
          },
        });
        sounds[index] = sound; // Cache the sound
      }
      if (!sound || sound.playing()) return;
      console.log(
        `Start playing ${bgm.title} | ${Object.keys(sounds).length} in the playlist`
      );
      setIsIdle(false);
      sound.volume(VOLUME);
      sound.play();
      setIsPlaying(true);
      setCurrentPlayingIndex(index);
    });
  };

  const _stopBGM = useCallback(
    (index: number) => {
      const sound = sounds[index];
      if (!sound || !sound.playing()) return;
      console.log(
        `Stop playing ${bgms[index].title} | ${Object.keys(sounds).length} in the playlist`
      );
      setIsPlaying(false);
      sound.fade(sound.volume(), 0, FADE_DURATION);
      setTimeout(() => {
        sound.stop();
        sound.volume(VOLUME);
      }, FADE_DURATION);
    },
    [bgms]
  );

  const _pauseBGM = useCallback(
    (index: number) => {
      const sound = sounds[index];
      if (!sound || !sound.playing()) return;
      console.log(
        `Pause playing ${bgms[index].title} | ${Object.keys(sounds).length} in the playlist`
      );
      setIsPlaying(false);
      sound.fade(sound.volume(), 0, FADE_DURATION);
      setTimeout(() => {
        sound.pause();
        sound.volume(VOLUME);
      }, FADE_DURATION);
    },
    [bgms]
  );

  function toggleBGM() {
    if (isPlaying) {
      _pauseBGM(currentPlayingIndex);
    } else {
      _playBGM(currentPlayingIndex);
    }
  }

  function pauseBGM() {
    _pauseBGM(currentPlayingIndex);
  }

  function playBGM() {
    _playBGM(currentPlayingIndex);
  }

  function nextBGM() {
    const nextIndex = (currentPlayingIndex + 1) % bgms.length;
    // Stop the current one
    _stopBGM(currentPlayingIndex);
    // Play the next one
    _playBGM(nextIndex);
  }

  function prevBGM() {
    const prevIndex = (currentPlayingIndex - 1 + bgms.length) % bgms.length;
    // Stop the current one
    _stopBGM(currentPlayingIndex);
    // Play the previous one
    _playBGM(prevIndex);
  }

  useEffect(() => {
    startTransition(async () => {
      const { bgms } = await fetchBGMs();
      setCurrentPlayingIndex(Math.floor(Math.random() * bgms.length));
      setBgms(bgms);
    });

    return () => {
      Object.values(sounds).forEach((sound) => {
        sound.unload();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BGMProviderContext.Provider
      value={{
        isIdle,
        isLoading: isPending,
        isPlaying,
        toggleBGM,
        currentBGM: bgms[currentPlayingIndex],
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
