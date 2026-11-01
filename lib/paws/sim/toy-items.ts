/** The toys visitors can bring into a room, one of each id at a time: three toilet rolls and five yarn balls. */
export const TOY_ITEMS = [
  { id: "roll-1", kind: "roll" },
  { id: "roll-2", kind: "roll" },
  { id: "roll-3", kind: "roll" },
  { id: "yarn-1", kind: "yarn" },
  { id: "yarn-2", kind: "yarn" },
  { id: "yarn-3", kind: "yarn" },
  { id: "yarn-4", kind: "yarn" },
  { id: "yarn-5", kind: "yarn" },
] as const;

export type ToyItemId = (typeof TOY_ITEMS)[number]["id"];
