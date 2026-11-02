import assert from "node:assert/strict";
import { test } from "node:test";

import { prepareAutoPublish } from "./prepare-auto-publish";

function image(options: { name: string }) {
  return { file: options.name, alt: "", path: `c/uploads/1/${options.name}` };
}

test("returns the text, typed media and Threads topic", () => {
  const prepared = prepareAutoPublish({
    platformId: "threads",
    text: "Hello",
    assets: [{ file: "a.png", alt: "A cat", path: "c/a.png" }],
    target: "#Digital Art",
  });
  assert.deepEqual(prepared, {
    kind: "ok",
    text: "Hello",
    media: [
      { kind: "image", mimeType: "image/png", path: "c/a.png", alt: "A cat" },
    ],
    topicTag: "Digital Art",
  });
});

test("ignores the target on X", () => {
  const prepared = prepareAutoPublish({
    platformId: "x",
    text: "Hello",
    assets: [],
    target: "Digital Art",
  });
  assert.equal(prepared.kind === "ok" && prepared.topicTag, undefined);
});

test("rejects text over the platform limit", () => {
  const prepared = prepareAutoPublish({
    platformId: "x",
    text: "a".repeat(281),
    assets: [],
    target: undefined,
  });
  assert.equal(prepared.kind, "error");
});

test("rejects files not yet uploaded and unknown types", () => {
  const missing = prepareAutoPublish({
    platformId: "x",
    text: "Hi",
    assets: [{ file: "a.png", alt: "" }],
    target: undefined,
  });
  assert.match(
    missing.kind === "error" ? missing.message : "",
    /Upload these files first: a\.png/
  );
  const unknown = prepareAutoPublish({
    platformId: "x",
    text: "Hi",
    assets: [image({ name: "deck.pdf" })],
    target: undefined,
  });
  assert.match(unknown.kind === "error" ? unknown.message : "", /deck\.pdf/);
});

test("enforces X's media mix: up to 4 images, or one video alone", () => {
  const fiveImages = Array.from({ length: 5 }, (_, i) =>
    image({ name: `${i}.png` })
  );
  assert.equal(
    prepareAutoPublish({
      platformId: "x",
      text: "Hi",
      assets: fiveImages,
      target: undefined,
    }).kind,
    "error"
  );
  assert.equal(
    prepareAutoPublish({
      platformId: "x",
      text: "Hi",
      assets: [image({ name: "a.png" }), image({ name: "b.mp4" })],
      target: undefined,
    }).kind,
    "error"
  );
  assert.equal(
    prepareAutoPublish({
      platformId: "x",
      text: "Hi",
      assets: [image({ name: "b.mp4" })],
      target: undefined,
    }).kind,
    "ok"
  );
});

test("rejects GIFs and bad topics on Threads", () => {
  assert.equal(
    prepareAutoPublish({
      platformId: "threads",
      text: "Hi",
      assets: [image({ name: "a.gif" })],
      target: undefined,
    }).kind,
    "error"
  );
  assert.equal(
    prepareAutoPublish({
      platformId: "threads",
      text: "Hi",
      assets: [],
      target: "Arts & Crafts",
    }).kind,
    "error"
  );
});

test("rejects a post with no text and no media", () => {
  assert.equal(
    prepareAutoPublish({
      platformId: "threads",
      text: "  ",
      assets: [],
      target: undefined,
    }).kind,
    "error"
  );
});
