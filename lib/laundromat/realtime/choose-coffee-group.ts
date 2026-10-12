import { getRegionTier } from "./get-region-tier";
import type { RoomRegion } from "./room-presence";

const MAX_GROUP_SIZE = 7;

type CoffeeGroup = {
  id: string;
  visitorIds: string[];
  regions: RoomRegion[];
};

export type CoffeeGroupChoice =
  | { kind: "stay" }
  | { kind: "merge"; groupId: string }
  | { kind: "join"; groupId: string }
  | { kind: "start" };

function collectGroups(
  members: { groupId: string; visitorId: string; region?: RoomRegion }[]
) {
  return members.reduce<CoffeeGroup[]>((groups, member) => {
    const group = groups.find(({ id }) => id === member.groupId);
    const regions = member.region === undefined ? [] : [member.region];
    if (group === undefined) {
      return [
        ...groups,
        { id: member.groupId, visitorIds: [member.visitorId], regions },
      ];
    }
    return groups.map((candidate) =>
      candidate === group
        ? {
            ...group,
            visitorIds: group.visitorIds.includes(member.visitorId)
              ? group.visitorIds
              : [...group.visitorIds, member.visitorId],
            regions: [...group.regions, ...regions],
          }
        : candidate
    );
  }, []);
}

function compareIds(a: string, b: string) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function countTogether(a: string[], b: string[]) {
  return new Set([...a, ...b]).size;
}

/** Return the coffee group this visitor belongs in, given the group each peer tracks: stay in `ownGroupId` while it holds at most seven visitors with this one among the first seven by `visitorId`, unless a group with a lower id holds this visitor's other tab or has room for everyone in both, which it merges into; otherwise, with no group or one too crowded to stay in, join the group with room that holds this visitor's other tab, then the nearest to `ownRegion`, then the largest, then the lowest id, or start a new group when none has room. */
export function chooseCoffeeGroup(options: {
  ownVisitorId: string;
  ownGroupId: string | undefined;
  ownRegion: RoomRegion | undefined;
  peers: { visitorId: string; region?: RoomRegion; coffeeGroupId?: string }[];
}): CoffeeGroupChoice {
  const { ownVisitorId, ownGroupId, ownRegion } = options;
  const groups = collectGroups([
    ...options.peers.flatMap(({ visitorId, region, coffeeGroupId }) =>
      coffeeGroupId === undefined
        ? []
        : [{ groupId: coffeeGroupId, visitorId, region }]
    ),
    ...(ownGroupId === undefined
      ? []
      : [{ groupId: ownGroupId, visitorId: ownVisitorId, region: ownRegion }]),
  ]);
  const own = groups.find(({ id }) => id === ownGroupId);
  const ownRank =
    own?.visitorIds.toSorted(compareIds).indexOf(ownVisitorId) ?? -1;
  if (own !== undefined && ownRank < MAX_GROUP_SIZE) {
    const mergeInto = groups
      .filter(
        (group) =>
          group.id < own.id &&
          (group.visitorIds.includes(ownVisitorId) ||
            countTogether(group.visitorIds, own.visitorIds) <= MAX_GROUP_SIZE)
      )
      .toSorted((a, b) => compareIds(a.id, b.id))
      .at(0);
    return mergeInto === undefined
      ? { kind: "stay" }
      : { kind: "merge", groupId: mergeInto.id };
  }
  const best = groups
    .filter(
      (group) =>
        group.id !== ownGroupId &&
        countTogether(group.visitorIds, [ownVisitorId]) <= MAX_GROUP_SIZE
    )
    .map((group) => ({
      group,
      holdsOwnTab: group.visitorIds.includes(ownVisitorId) ? 0 : 1,
      tier: Math.min(
        ...group.regions.map((region) =>
          getRegionTier({ own: ownRegion, other: region })
        ),
        getRegionTier({ own: ownRegion, other: undefined })
      ),
    }))
    .toSorted(
      (a, b) =>
        a.holdsOwnTab - b.holdsOwnTab ||
        a.tier - b.tier ||
        b.group.visitorIds.length - a.group.visitorIds.length ||
        compareIds(a.group.id, b.group.id)
    )
    .at(0);
  return best === undefined
    ? { kind: "start" }
    : { kind: "join", groupId: best.group.id };
}
