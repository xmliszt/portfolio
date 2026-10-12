import assert from "node:assert/strict";
import { test } from "node:test";

import { chooseCoffeeGroup } from "./choose-coffee-group";

const near = { latDeg: 1.3, lonDeg: 103.8 };
const far = { latDeg: 40.7, lonDeg: -74 };

function buildMembers(options: {
  groupId: string;
  count: number;
  prefix: string;
}) {
  return Array.from({ length: options.count }, (_, index) => ({
    visitorId: `${options.prefix}-${index}`,
    coffeeGroupId: options.groupId,
  }));
}

test("starts a group when nobody else has one", () => {
  assert.deepEqual(
    chooseCoffeeGroup({
      ownVisitorId: "me",
      ownGroupId: undefined,
      ownRegion: near,
      peers: [{ visitorId: "other" }],
    }),
    { kind: "start" }
  );
});

test("joins the nearest group with room and skips a full one", () => {
  const peers = [
    ...buildMembers({ groupId: "full", count: 7, prefix: "f" }).map((peer) => ({
      ...peer,
      region: near,
    })),
    { visitorId: "x", coffeeGroupId: "far", region: far },
    { visitorId: "y", coffeeGroupId: "near", region: near },
  ];
  assert.deepEqual(
    chooseCoffeeGroup({
      ownVisitorId: "me",
      ownGroupId: undefined,
      ownRegion: near,
      peers,
    }),
    { kind: "join", groupId: "near" }
  );
  assert.deepEqual(
    chooseCoffeeGroup({
      ownVisitorId: "me",
      ownGroupId: undefined,
      ownRegion: near,
      peers: peers.filter(({ coffeeGroupId }) => coffeeGroupId !== "near"),
    }),
    { kind: "join", groupId: "far" }
  );
});

test("joins the group its other tab is in", () => {
  assert.deepEqual(
    chooseCoffeeGroup({
      ownVisitorId: "me",
      ownGroupId: undefined,
      ownRegion: near,
      peers: [
        { visitorId: "y", coffeeGroupId: "a", region: near },
        { visitorId: "me", coffeeGroupId: "b" },
      ],
    }),
    { kind: "join", groupId: "b" }
  );
});

test("moves the visitors past the seventh out of a crowded group", () => {
  const peers = [
    ...buildMembers({ groupId: "g", count: 7, prefix: "a" }),
    { visitorId: "c", coffeeGroupId: "other" },
  ];
  assert.deepEqual(
    chooseCoffeeGroup({
      ownVisitorId: "b",
      ownGroupId: "g",
      ownRegion: undefined,
      peers,
    }),
    { kind: "join", groupId: "other" }
  );
  assert.deepEqual(
    chooseCoffeeGroup({
      ownVisitorId: "a-00",
      ownGroupId: "g",
      ownRegion: undefined,
      peers,
    }),
    { kind: "stay" }
  );
});

test("merges into a lower group id only when everyone fits", () => {
  const small = [
    ...buildMembers({ groupId: "a", count: 3, prefix: "a" }),
    ...buildMembers({ groupId: "b", count: 2, prefix: "b" }),
  ];
  assert.deepEqual(
    chooseCoffeeGroup({
      ownVisitorId: "me",
      ownGroupId: "b",
      ownRegion: undefined,
      peers: small,
    }),
    { kind: "merge", groupId: "a" }
  );
  assert.deepEqual(
    chooseCoffeeGroup({
      ownVisitorId: "me",
      ownGroupId: "a",
      ownRegion: undefined,
      peers: small,
    }),
    { kind: "stay" }
  );
  const big = [
    ...buildMembers({ groupId: "a", count: 4, prefix: "a" }),
    ...buildMembers({ groupId: "b", count: 3, prefix: "b" }),
  ];
  assert.deepEqual(
    chooseCoffeeGroup({
      ownVisitorId: "me",
      ownGroupId: "b",
      ownRegion: undefined,
      peers: big,
    }),
    { kind: "stay" }
  );
});

function chooseBesideOne(options: {
  ownVisitorId: string;
  ownGroupId: string;
  other: { visitorId: string; coffeeGroupId: string };
}) {
  return chooseCoffeeGroup({
    ownVisitorId: options.ownVisitorId,
    ownGroupId: options.ownGroupId,
    ownRegion: undefined,
    peers: [options.other],
  });
}

test("two visitors who arrive together end up in the lower group id", () => {
  assert.deepEqual(
    chooseBesideOne({
      ownVisitorId: "x",
      ownGroupId: "g-2",
      other: { visitorId: "y", coffeeGroupId: "g-1" },
    }),
    { kind: "merge", groupId: "g-1" }
  );
  assert.deepEqual(
    chooseBesideOne({
      ownVisitorId: "y",
      ownGroupId: "g-1",
      other: { visitorId: "x", coffeeGroupId: "g-2" },
    }),
    { kind: "stay" }
  );
});

test("a tab in its own group moves to the lower group holding its other tab, even a full one", () => {
  const peers = [
    ...buildMembers({ groupId: "a", count: 6, prefix: "a" }),
    { visitorId: "me", coffeeGroupId: "a" },
  ];
  assert.deepEqual(
    chooseCoffeeGroup({
      ownVisitorId: "me",
      ownGroupId: "b",
      ownRegion: undefined,
      peers,
    }),
    { kind: "merge", groupId: "a" }
  );
});
