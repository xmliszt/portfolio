import assert from "node:assert/strict";
import { test } from "node:test";

import { detectRenderQuality } from "./detect-render-quality";

test("picks lite for 4 GB of memory or less", () => {
  assert.equal(detectRenderQuality({ deviceMemoryGb: 4, cpuCores: 8 }), "lite");
  assert.equal(
    detectRenderQuality({ deviceMemoryGb: 2, cpuCores: undefined }),
    "lite"
  );
});

test("picks lite for 4 CPU cores or fewer", () => {
  assert.equal(detectRenderQuality({ deviceMemoryGb: 8, cpuCores: 4 }), "lite");
  assert.equal(
    detectRenderQuality({ deviceMemoryGb: undefined, cpuCores: 2 }),
    "lite"
  );
});

test("picks full for larger devices and when nothing is reported", () => {
  assert.equal(detectRenderQuality({ deviceMemoryGb: 8, cpuCores: 8 }), "full");
  assert.equal(
    detectRenderQuality({ deviceMemoryGb: undefined, cpuCores: undefined }),
    "full"
  );
});
