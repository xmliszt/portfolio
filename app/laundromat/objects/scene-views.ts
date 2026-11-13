import type { BookshelfRowKey } from "@/lib/laundromat/bookshelf/bookshelf-row";
import type { CoffeePhase } from "@/lib/laundromat/coffee/get-coffee-phase";
import type { BasketContents } from "@/lib/laundromat/laundry/get-basket-contents";
import type { MachineStatus } from "@/lib/laundromat/laundry/get-machine-status";
import type {
  CoinMachinePhase,
  GoldenChargeView,
} from "@/lib/laundromat/tip/tip-token";
import type { ToyBoxView } from "@/lib/laundromat/toy/toy-box-view";
import type { TvState } from "@/lib/laundromat/tv/tv-state";
import type { WeatherReading } from "@/lib/laundromat/weather/weather-reading";

export type MachineView = {
  status: MachineStatus;
  readout: string;
  dialAngleDeg: number;
  doorOpen: boolean;
  goldenCharge: GoldenChargeView;
};

export type TvView = { state: TvState; noSignal: boolean };

export type CupView = { full: boolean; steaming: boolean };

export type BookshelfSpine = { id: number; title: string; manual: boolean };

export type BookshelfRowView = {
  label: string;
  page: number;
  pageCount: number;
  direction: 1 | -1;
  spines: BookshelfSpine[];
};

export type BookshelfView = {
  rows: { [key in BookshelfRowKey]: BookshelfRowView };
  pulled: { row: BookshelfRowKey; bookId: number } | undefined;
};

export type SceneViews = {
  decorationReactions?: { [id: string]: number };
  machines: { [objectId: string]: MachineView };
  tv: TvView;
  coffee: CoffeePhase;
  cup: CupView;
  basket: BasketContents;
  shelfBookNumbers: number[];
  bookshelf: BookshelfView;
  notebookNumber: number;
  peopleHere: number | undefined;
  tubeRollCount: number;
  weather: WeatherReading | undefined;
  toyBox: ToyBoxView;
  toyBoxPaused?: boolean;
  coinMachine: CoinMachinePhase;
  coinMachineScreen: string;
  tipJar: { coinCount: number };
  hidden: boolean;
};
