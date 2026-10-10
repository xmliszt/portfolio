import type { CoffeePhase } from "@/lib/laundromat/coffee/get-coffee-phase";
import type { BasketContents } from "@/lib/laundromat/laundry/get-basket-contents";
import type { MachineStatus } from "@/lib/laundromat/laundry/get-machine-status";
import type { TvState } from "@/lib/laundromat/tv/tv-state";

export type MachineView = {
  status: MachineStatus;
  readout: string;
  dialAngleDeg: number;
  doorOpen: boolean;
};

export type TvView = { state: TvState; noSignal: boolean };

export type SceneViews = {
  machines: { [objectId: string]: MachineView };
  tv: TvView;
  coffee: CoffeePhase;
  basket: BasketContents;
};
