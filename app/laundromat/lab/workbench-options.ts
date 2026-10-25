import type { BasketContents } from "@/lib/laundromat/laundry/get-basket-contents";

import type { WorkbenchMachineState } from "./object-workbench";

export const WORKBENCH_MACHINE_STATES = [
  "loadable",
  "loaded",
  "running",
  "done",
] satisfies WorkbenchMachineState[];
export const WORKBENCH_BASKETS = [
  "empty",
  "dirty",
  "wet",
  "folded",
] satisfies BasketContents[];
