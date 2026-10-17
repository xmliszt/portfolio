import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRoomSoundSwitches } from "@/lib/laundromat/audio/parse-room-sound-switches";
import { parseRoomSoundVolumes } from "@/lib/laundromat/audio/parse-room-sound-volumes";

import { buildSettingsTicket } from "./build-settings-ticket";
import { decodeSettingsTicket } from "./decode-settings-ticket";
import { encodeSettingsTicket } from "./encode-settings-ticket";
import { encodeSettingsTicketCode } from "./encode-settings-ticket-code";
import { getSettingsTicketUrl } from "./get-settings-ticket-url";
import { readSettingsTicketHash } from "./read-settings-ticket-hash";

const TICKET = buildSettingsTicket({
  printedAt: new Date("2026-10-17T06:00:00.000Z"),
  renderQuality: "auto",
  temperatureUnit: "celsius",
  weatherPlace: undefined,
  weatherCondition: undefined,
  muted: false,
  switches: parseRoomSoundSwitches(null),
  volumes: { ...parseRoomSoundVolumes(null), weather: 1.4 },
  tv: { station: "smoky-jazz", volumePercent: 30 },
});

test("decodes what it encodes, under a readable header", () => {
  const text = encodeSettingsTicket(TICKET);
  assert.match(
    text,
    /^laundro\.cafe laundry ticket\nLT1\.[\w-]+\.[0-9a-f]{8}\n$/
  );
  assert.deepEqual(decodeSettingsTicket(text), TICKET);
});

test("keeps non-ascii text intact", () => {
  const ticket = { ...TICKET, printedAt: "洗衣 · ü" };
  assert.deepEqual(decodeSettingsTicket(encodeSettingsTicket(ticket)), ticket);
});

test("accepts windows line endings and surrounding blank lines", () => {
  const text = `\r\n${encodeSettingsTicket(TICKET).replace("\n", "\r\n")}\r\n`;
  assert.deepEqual(decodeSettingsTicket(text), TICKET);
});

test("refuses a damaged, edited or foreign file", () => {
  const text = encodeSettingsTicket(TICKET);
  const code = text.split("\n")[1] ?? "";
  const flipped = code.replace(/LT1\.(.)/, (_, first) =>
    first === "A" ? "LT1.B" : "LT1.A"
  );
  assert.equal(decodeSettingsTicket(text.replace(code, flipped)), undefined);
  assert.equal(decodeSettingsTicket(JSON.stringify(TICKET)), undefined);
  assert.equal(decodeSettingsTicket(""), undefined);
  assert.equal(decodeSettingsTicket("LT1.not base64.00000000"), undefined);
});

test("a ticket link carries the same code and decodes back", () => {
  const url = new URL(
    getSettingsTicketUrl({
      origin: "https://laundro.cafe",
      code: encodeSettingsTicketCode(TICKET),
    })
  );
  assert.equal(url.pathname, "/");
  const code = readSettingsTicketHash(url.hash);
  assert.ok(code);
  assert.deepEqual(decodeSettingsTicket(code), TICKET);
});

test("ignores hashes that are not ticket links", () => {
  assert.equal(readSettingsTicketHash(""), undefined);
  assert.equal(readSettingsTicketHash("#board"), undefined);
  assert.equal(readSettingsTicketHash("#ticket="), undefined);
});
