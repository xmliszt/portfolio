import assert from "node:assert/strict";
import { test } from "node:test";

import { parseStoredTv } from "./parse-stored-tv";
import { TV_STATION_IDS } from "./tv-state";

const stations = TV_STATION_IDS.slice(0, 3).map((id) => ({
  id,
  videoId: id,
  channel: "Lofi Girl",
  placeholder: false,
}));

function parse(options: {
  storedStation: string | null;
  storedVolume: string | null;
}) {
  return parseStoredTv({ ...options, stations });
}

test("restores a saved station by id and a saved volume", () => {
  assert.deepEqual(
    parse({ storedStation: TV_STATION_IDS[2], storedVolume: "35" }),
    { station: 2, volumePercent: 35 }
  );
});

test("keeps both unset when nothing is saved", () => {
  assert.deepEqual(parse({ storedStation: null, storedVolume: null }), {
    station: undefined,
    volumePercent: undefined,
  });
});

test("ignores a station id that is no longer on the dial", () => {
  assert.equal(
    parse({ storedStation: "gone", storedVolume: null }).station,
    undefined
  );
});

test("accepts 0 and 100 as volumes", () => {
  assert.equal(
    parse({ storedStation: null, storedVolume: "0" }).volumePercent,
    0
  );
  assert.equal(
    parse({ storedStation: null, storedVolume: "100" }).volumePercent,
    100
  );
});

test("ignores a volume that is not a whole percent from 0 to 100", () => {
  for (const storedVolume of ["", "101", "50.5", "-0", "-10", "abc", "1e2"]) {
    assert.equal(
      parse({ storedStation: null, storedVolume }).volumePercent,
      undefined,
      `"${storedVolume}" should be ignored`
    );
  }
});
