'use client';

import { HowlOptions } from 'howler';
import { create } from 'zustand';

import { fetchBGMs } from './fetch-bgms';

type BGM = {
  id: string;
  title: string;
  artist: string;
  external_url: string;
  public_url: string;
};

type BgmStoreState = {
  currentHowl: Howl | undefined;
  currentBgm: BGM | undefined;
  isPlaying: boolean;
  isLoading: boolean;
  error?: Error;
};

type CustomHowlOptions = Pick<HowlOptions, 'volume' | 'loop' | 'html5'>;

export class Bgm {
  private static _instance: Bgm | null = null;
  private _bgms: BGM[] = [];
  private _currentIndex = 0;
  private _howlOptions: CustomHowlOptions = {
    volume: 0.5,
    loop: false,
    html5: true,
  };
  private _autoPlay = false;

  store = create<BgmStoreState>()(() => ({
    currentHowl: undefined,
    currentBgm: undefined,
    isPlaying: false,
    isLoading: false,
    error: undefined,
  }));

  private constructor() {
    this._init({
      howlOptions: {
        volume: 0.5,
        loop: false,
        html5: true,
      },
      startFromIndex: 0,
      autoPlay: false,
    });
  }

  private async _init(options: {
    howlOptions: CustomHowlOptions;
    startFromIndex: number;
    autoPlay?: boolean;
  }) {
    const { bgms } = await fetchBGMs();
    this._bgms = bgms;
    console.log(this._bgms);
    this._currentIndex = options.startFromIndex;
    this._howlOptions = options.howlOptions;
    this._autoPlay = options.autoPlay ?? false;

    const defaultBgm = this._bgms.at(this._currentIndex);
    if (defaultBgm === undefined)
      throw new Error(`BGM at index ${this._currentIndex} is not found`);

    this._createHowl({ bgm: defaultBgm });
  }

  public static getInstance(): Bgm {
    if (!Bgm._instance) Bgm._instance = new Bgm();
    return Bgm._instance;
  }

  private _createHowl(options: { bgm: BGM }) {
    const howl = new Howl({
      src: [options.bgm.public_url],
      volume: this._howlOptions.volume,
      loop: this._howlOptions.loop,
      html5: this._howlOptions.html5,
      onload: () => {
        this.store.setState({ isLoading: false });
        if (this._autoPlay) howl.play();
      },
      onend: () => this.playNext(),
      onplay: () => this.store.setState({ isPlaying: true }),
      onpause: () => this.store.setState({ isPlaying: false }),
      onloaderror: (_, _error) =>
        this.store.setState({
          error:
            _error instanceof Error
              ? _error
              : new Error(`Loading BGM ${options.bgm.title} failed`),
        }),
      onplayerror: (_, _error) =>
        this.store.setState({
          error:
            _error instanceof Error
              ? _error
              : new Error(`Playing BGM ${options.bgm.title} failed`),
        }),
    });

    this.store.setState({
      currentHowl: howl,
      currentBgm: options.bgm,
      isLoading: true,
    });
  }

  /**
   * Play the next BGM in the list
   */
  playNext() {
    this._currentIndex++;
    if (this._currentIndex >= this._bgms.length) this._currentIndex = 0;

    const nextBgm = this._bgms.at(this._currentIndex);
    if (nextBgm === undefined)
      throw new Error(`BGM at index ${this._currentIndex} is not found`);

    // Stop and unload current howl
    this.store.getState().currentHowl?.stop();
    this.store.getState().currentHowl?.unload();

    this._createHowl({ bgm: nextBgm });
    this.resume();
  }

  /**
   * Play the previous BGM in the list
   */
  playPrevious() {
    this._currentIndex--;
    if (this._currentIndex < 0) this._currentIndex = this._bgms.length - 1;

    const previousBgm = this._bgms.at(this._currentIndex);
    if (previousBgm === undefined)
      throw new Error(`BGM at index ${this._currentIndex} is not found`);

    // Stop and unload current howl
    this.store.getState().currentHowl?.stop();
    this.store.getState().currentHowl?.unload();

    this._createHowl({ bgm: previousBgm });
    this.resume();
  }

  /**
   * Resume the current BGM
   */
  resume() {
    this.store.getState().currentHowl?.play();
  }

  /**
   * Pause the current BGM
   */
  pause() {
    this.store.getState().currentHowl?.pause();
  }

  /**
   * Toggle the current BGM
   */
  toggle() {
    if (this.store.getState().isPlaying) this.pause();
    else this.resume();
  }
}
