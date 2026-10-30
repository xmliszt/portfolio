import assert from "node:assert/strict";
import { test } from "node:test";

import type { VoiceSettings } from "@/lib/paws/voice-settings";

import { createMeowPipeline } from "./create-meow-pipeline";
import { getMeowKey } from "./get-meow-key";
import type {
  CatMeowLookup,
  GenerateResult,
  MeowAttemptOutcome,
  MeowPipelineDependencies,
  StoredMeow,
} from "./meow-pipeline-types";

const VOICE = {
  age: "adult",
  voice: "soft",
  mood: "chatty",
} satisfies VoiceSettings;
const MEMBER = { userId: "user-1", isAnonymous: false };
const BORROWED_URL = "/paws/sounds/meow-adult-soft-chatty.mp3";

type Attempt = {
  userId: string;
  ipHash: string;
  outcome: MeowAttemptOutcome;
  credits: number;
};

function buildWorld(options: {
  hasCat?: boolean;
  catMeow?: StoredMeow;
  meows?: StoredMeow[];
  refusalsToday?: number;
  generationsToday?: number;
  isFlagged?: boolean | Error;
  isSuitable?: boolean;
  hasCredits?: boolean;
  generated?: GenerateResult;
  uploadError?: Error;
  isClaimTaken?: boolean;
}) {
  const calls: string[] = [];
  const attempts: Attempt[] = [];
  const assigned: { userId: string; meowKey: string }[] = [];
  const inserted: { key: string; storagePath: string; text: string }[] = [];
  const uploads: string[] = [];
  const credits = { reserved: 0, released: 0 };
  const counted: { since: Date }[] = [];
  const logs: string[] = [];
  const meows = options.meows ?? [];
  const claim = { isHeld: options.isClaimTaken ?? false, releases: 0 };

  const deps = {
    store: {
      findCatMeow: async (): Promise<CatMeowLookup> => {
        calls.push("findCatMeow");
        return options.hasCat === false
          ? { kind: "noCat" }
          : { kind: "cat", voice: VOICE, meow: options.catMeow };
      },
      claimMeow: async () => {
        calls.push("claimMeow");
        if (claim.isHeld) return false;
        claim.isHeld = true;
        return true;
      },
      releaseMeowClaim: async () => {
        claim.isHeld = false;
        claim.releases += 1;
      },
      countRefusalsSince: async (query: { since: Date }) => {
        calls.push("countRefusals");
        counted.push({ since: query.since });
        return options.refusalsToday ?? 0;
      },
      countGenerationsSince: async () => {
        calls.push("countGenerations");
        return options.generationsToday ?? 0;
      },
      findMeow: async (query: { key: string }) => {
        calls.push("findMeow");
        return meows.find((meow) => meow.key === query.key);
      },
      insertMeow: async (meow: {
        key: string;
        storagePath: string;
        text: string;
      }) => {
        inserted.push({
          key: meow.key,
          storagePath: meow.storagePath,
          text: meow.text,
        });
      },
      assignMeow: async (assignment: { userId: string; meowKey: string }) => {
        assigned.push({
          userId: assignment.userId,
          meowKey: assignment.meowKey,
        });
      },
      recordAttempt: async (attempt: Attempt) => {
        attempts.push(attempt);
      },
    },
    moderation: {
      isFlagged: async () => {
        calls.push("moderation");
        if (options.isFlagged instanceof Error) throw options.isFlagged;
        return options.isFlagged ?? false;
      },
    },
    suitability: {
      isSuitable: async () => {
        calls.push("suitability");
        return options.isSuitable ?? true;
      },
    },
    generator: {
      generate: async () => {
        calls.push("generate");
        return (
          options.generated ?? {
            kind: "audio",
            bytes: new Uint8Array([1, 2, 3]),
          }
        );
      },
    },
    storage: {
      upload: async (upload: { path: string }) => {
        if (options.uploadError !== undefined) throw options.uploadError;
        uploads.push(upload.path);
      },
      getPublicUrl: (path: string) => `https://cdn.test/${path}`,
    },
    budget: {
      reserve: async (reservation: { amount: number }) => {
        calls.push("reserve");
        if (options.hasCredits === false) return false;
        credits.reserved += reservation.amount;
        return true;
      },
      release: async (release: { amount: number }) => {
        credits.released += release.amount;
      },
    },
    clock: { now: () => new Date("2026-10-30T15:30:00.000Z") },
    hashSecret: "secret",
    log: (message: string) => {
      logs.push(message);
    },
  } satisfies MeowPipelineDependencies;

  return {
    deps,
    calls,
    attempts,
    assigned,
    inserted,
    uploads,
    credits,
    counted,
    logs,
    claim,
  };
}

function request(text = "Tiny  Fart") {
  return { user: MEMBER, ip: "203.0.113.7", body: { text, voice: VOICE } };
}

test("asks guests and anonymous visitors to sign in without touching the store", async () => {
  const world = buildWorld({});
  const pipeline = createMeowPipeline(world.deps);
  assert.deepEqual(
    await pipeline.requestMeow({ ...request(), user: undefined }),
    { kind: "signInRequired" }
  );
  assert.deepEqual(
    await pipeline.requestMeow({
      ...request(),
      user: { userId: "a", isAnonymous: true },
    }),
    {
      kind: "signInRequired",
    }
  );
  assert.deepEqual(world.calls, []);
});

test("rejects a body without valid text and voice", async () => {
  const world = buildWorld({});
  const result = await createMeowPipeline(world.deps).requestMeow({
    ...request(),
    body: { text: "meow", voice: { age: "puppy" } },
  });
  assert.deepEqual(result, { kind: "invalid" });
});

test("needs a saved cat first", async () => {
  const world = buildWorld({ hasCat: false });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    { kind: "catNotSaved" }
  );
});

test("returns the cat's own meow when it already has one, before any attempt counting", async () => {
  const world = buildWorld({
    catMeow: { key: "k", storagePath: "meows/k.mp3", blocked: false },
    refusalsToday: 9,
  });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    {
      kind: "alreadyHasMeow",
      meowUrl: "https://cdn.test/meows/k.mp3",
    }
  );
  assert.deepEqual(world.calls, ["findCatMeow"]);
  assert.deepEqual(world.attempts, []);
});

test("points a cat whose own meow was blocked at the borrowed meow", async () => {
  const world = buildWorld({
    catMeow: { key: "k", storagePath: "meows/k.mp3", blocked: true },
  });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    {
      kind: "alreadyHasMeow",
      meowUrl: BORROWED_URL,
    }
  );
});

test("stops after five refusals today, counted from UTC midnight, before the cache", async () => {
  const world = buildWorld({ refusalsToday: 5 });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    { kind: "tooManyAttempts" }
  );
  assert.deepEqual(world.calls, ["findCatMeow", "claimMeow", "countRefusals"]);
  assert.equal(
    world.counted.at(0)?.since.toISOString(),
    "2026-10-30T00:00:00.000Z"
  );
  assert.deepEqual(world.attempts, []);
});

test("stops after three generations from one address today, before the cache", async () => {
  const world = buildWorld({ refusalsToday: 4, generationsToday: 3 });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    { kind: "tooManyAttempts" }
  );
  assert.deepEqual(world.calls, [
    "findCatMeow",
    "claimMeow",
    "countRefusals",
    "countGenerations",
  ]);
});

test("reuses a cached clip for free without running any check", async () => {
  const key = getMeowKey({ normalizedText: "tiny fart", voice: VOICE });
  const world = buildWorld({
    meows: [{ key, storagePath: `meows/${key}.mp3`, blocked: false }],
  });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    {
      kind: "reused",
      meowUrl: `https://cdn.test/meows/${key}.mp3`,
    }
  );
  assert.deepEqual(world.calls, [
    "findCatMeow",
    "claimMeow",
    "countRefusals",
    "countGenerations",
    "findMeow",
  ]);
  assert.deepEqual(world.assigned, [{ userId: "user-1", meowKey: key }]);
  assert.equal(world.attempts.at(0)?.outcome, "reused");
  assert.equal(world.credits.reserved, 0);
});

test("refuses a cached clip that was blocked by reports", async () => {
  const key = getMeowKey({ normalizedText: "tiny fart", voice: VOICE });
  const world = buildWorld({
    meows: [{ key, storagePath: `meows/${key}.mp3`, blocked: true }],
  });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    { kind: "refusedByUs" }
  );
  assert.deepEqual(world.assigned, []);
  assert.equal(world.attempts.at(0)?.outcome, "refusedByUs");
});

test("refuses blocklisted words before calling moderation", async () => {
  const world = buildWorld({});
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request("loud SCREAM")),
    {
      kind: "refusedByUs",
    }
  );
  assert.equal(world.calls.includes("moderation"), false);
  assert.deepEqual(
    world.attempts.map((attempt) => attempt.outcome),
    ["refusedByUs"]
  );
});

test("refuses text flagged by moderation before the suitability check", async () => {
  const world = buildWorld({ isFlagged: true });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    { kind: "refusedByUs" }
  );
  assert.equal(world.calls.at(-1), "moderation");
});

test("refuses text the suitability check rejects before reserving credits", async () => {
  const world = buildWorld({ isSuitable: false });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    { kind: "refusedByUs" }
  );
  assert.equal(world.calls.at(-1), "suitability");
  assert.equal(world.attempts.at(0)?.outcome, "refusedByUs");
});

test("borrows a meow when today's credits are used up and keeps the cat eligible", async () => {
  const world = buildWorld({ hasCredits: false });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    {
      kind: "borrowed",
      meowUrl: BORROWED_URL,
    }
  );
  assert.equal(world.calls.includes("generate"), false);
  assert.deepEqual(world.assigned, []);
  assert.equal(world.attempts.at(0)?.outcome, "borrowed");
});

test("generates, stores and assigns a new clip in check order", async () => {
  const world = buildWorld({});
  const key = getMeowKey({ normalizedText: "tiny fart", voice: VOICE });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    {
      kind: "generated",
      meowUrl: `https://cdn.test/meows/${key}.mp3`,
    }
  );
  assert.deepEqual(world.calls, [
    "findCatMeow",
    "claimMeow",
    "countRefusals",
    "countGenerations",
    "findMeow",
    "moderation",
    "suitability",
    "reserve",
    "generate",
  ]);
  assert.deepEqual(world.uploads, [`meows/${key}.mp3`]);
  assert.deepEqual(world.inserted, [
    { key, storagePath: `meows/${key}.mp3`, text: "tiny fart" },
  ]);
  assert.deepEqual(world.assigned, [{ userId: "user-1", meowKey: key }]);
  assert.deepEqual(world.credits, { reserved: 60, released: 0 });
  assert.equal(world.attempts.at(0)?.outcome, "generated");
  assert.equal(world.attempts.at(0)?.credits, 60);
  assert.match(world.attempts.at(0)?.ipHash ?? "", /^[0-9a-f]{64}$/);
});

test("releases credits and logs the body when the provider refuses", async () => {
  const world = buildWorld({
    generated: { kind: "refused", status: 400, body: "policy" },
  });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    { kind: "refusedByProvider" }
  );
  assert.deepEqual(world.credits, { reserved: 60, released: 60 });
  assert.deepEqual(world.assigned, []);
  assert.deepEqual(world.logs, ["paws meow refused by provider"]);
  assert.equal(world.attempts.at(0)?.outcome, "refusedByProvider");
});

test("releases credits and borrows a meow when generation fails", async () => {
  const world = buildWorld({
    generated: { kind: "failed", detail: "timeout" },
  });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    {
      kind: "failed",
      meowUrl: BORROWED_URL,
    }
  );
  assert.deepEqual(world.credits, { reserved: 60, released: 60 });
  assert.deepEqual(world.assigned, []);
  assert.equal(world.attempts.at(0)?.outcome, "failed");
});

test("fails without reserving when a check errors", async () => {
  const world = buildWorld({ isFlagged: new Error("network") });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    {
      kind: "failed",
      meowUrl: BORROWED_URL,
    }
  );
  assert.equal(world.calls.includes("reserve"), false);
  assert.equal(world.attempts.at(0)?.outcome, "failed");
});

test("keeps spent credits but borrows a meow when saving the clip fails", async () => {
  const world = buildWorld({ uploadError: new Error("storage down") });
  assert.deepEqual(
    await createMeowPipeline(world.deps).requestMeow(request()),
    {
      kind: "failed",
      meowUrl: BORROWED_URL,
    }
  );
  assert.deepEqual(world.credits, { reserved: 60, released: 0 });
  assert.deepEqual(world.assigned, []);
  assert.equal(world.attempts.at(0)?.credits, 60);
});

test("stops a second request while the account's first one is still running", async () => {
  const world = buildWorld({ isClaimTaken: true });
  const pipeline = createMeowPipeline(world.deps);
  assert.deepEqual(await pipeline.requestMeow(request()), {
    kind: "tooManyAttempts",
  });
  assert.equal(world.calls.includes("generate"), false);
  assert.equal(world.claim.releases, 0);
});

test("releases the account's claim after a request finishes", async () => {
  const world = buildWorld({});
  const pipeline = createMeowPipeline(world.deps);
  await pipeline.requestMeow(request());
  assert.equal(world.claim.isHeld, false);
  assert.equal(world.claim.releases, 1);
});
