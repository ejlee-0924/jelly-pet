#!/usr/bin/env node
"use strict";

const assert = require("assert");
const {
  calculateJelly,
  getStreakMultiplier,
  getStageInfo,
  calculateLevel,
  getEvolutionProgress,
  applyJelly,
  TOKENS_PER_JELLY
} = require("../lib/jelly");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log("  ✓ " + name);
  } catch (err) {
    failed++;
    console.log("  ✗ " + name);
    console.log("    " + err.message);
  }
}

// ── getStreakMultiplier ──────────────────────────

console.log("\ngetStreakMultiplier:");

test("0 days → x1.0", () => {
  assert.strictEqual(getStreakMultiplier(0), 1.0);
});

test("1 day → x1.0", () => {
  assert.strictEqual(getStreakMultiplier(1), 1.0);
});

test("3 days → x1.0", () => {
  assert.strictEqual(getStreakMultiplier(3), 1.0);
});

test("4 days → x1.5", () => {
  assert.strictEqual(getStreakMultiplier(4), 1.5);
});

test("7 days → x1.5", () => {
  assert.strictEqual(getStreakMultiplier(7), 1.5);
});

test("8 days → x2.0", () => {
  assert.strictEqual(getStreakMultiplier(8), 2.0);
});

test("30 days → x2.0", () => {
  assert.strictEqual(getStreakMultiplier(30), 2.0);
});

// ── calculateJelly ──────────────────────────────

console.log("\ncalculateJelly:");

test("0 tokens → 0 jelly", () => {
  assert.strictEqual(calculateJelly(0, 1), 0);
});

test("499 tokens → 0 jelly (below threshold)", () => {
  assert.strictEqual(calculateJelly(499, 1), 0);
});

test("500 tokens, no streak → 1 jelly", () => {
  assert.strictEqual(calculateJelly(500, 1), 1);
});

test("1000 tokens, streak 1 → 2 jelly", () => {
  assert.strictEqual(calculateJelly(1000, 1), 2);
});

test("1000 tokens, streak 5 → 3 jelly (x1.5)", () => {
  assert.strictEqual(calculateJelly(1000, 5), 3);
});

test("1000 tokens, streak 10 → 4 jelly (x2.0)", () => {
  assert.strictEqual(calculateJelly(1000, 10), 4);
});

test("50000 tokens, streak 8 → 200 jelly (x2.0)", () => {
  assert.strictEqual(calculateJelly(50000, 8), 200);
});

// ── getStageInfo ────────────────────────────────

console.log("\ngetStageInfo:");

test("0 jelly → egg", () => {
  assert.strictEqual(getStageInfo(0).current.stage, "egg");
});

test("99 jelly → egg", () => {
  assert.strictEqual(getStageInfo(99).current.stage, "egg");
});

test("100 jelly → baby", () => {
  assert.strictEqual(getStageInfo(100).current.stage, "baby");
});

test("499 jelly → baby", () => {
  assert.strictEqual(getStageInfo(499).current.stage, "baby");
});

test("500 jelly → pro", () => {
  assert.strictEqual(getStageInfo(500).current.stage, "pro");
});

test("2000 jelly → master", () => {
  assert.strictEqual(getStageInfo(2000).current.stage, "master");
});

test("10000 jelly → legend", () => {
  assert.strictEqual(getStageInfo(10000).current.stage, "legend");
});

test("999999 jelly → legend", () => {
  assert.strictEqual(getStageInfo(999999).current.stage, "legend");
});

test("egg has next=baby", () => {
  assert.strictEqual(getStageInfo(0).next.stage, "baby");
});

test("legend has next=null", () => {
  assert.strictEqual(getStageInfo(10000).next, null);
});

// ── calculateLevel ──────────────────────────────

console.log("\ncalculateLevel:");

test("0 jelly → level 1", () => {
  assert.strictEqual(calculateLevel(0), 1);
});

test("50 jelly → level 2 (mid egg)", () => {
  assert.strictEqual(calculateLevel(50), 2);
});

test("100 jelly → level 4 (baby start)", () => {
  assert.strictEqual(calculateLevel(100), 4);
});

test("500 jelly → level 8 (pro start)", () => {
  assert.strictEqual(calculateLevel(500), 8);
});

test("2000 jelly → level 13 (master start)", () => {
  assert.strictEqual(calculateLevel(2000), 13);
});

test("10000 jelly → level 20 (legend max)", () => {
  assert.strictEqual(calculateLevel(10000), 20);
});

test("50000 jelly → level 20 (still max)", () => {
  assert.strictEqual(calculateLevel(50000), 20);
});

// ── getEvolutionProgress ────────────────────────

console.log("\ngetEvolutionProgress:");

test("0 jelly → 0% egg, 100 to baby", () => {
  const r = getEvolutionProgress(0);
  assert.strictEqual(r.stage, "egg");
  assert.strictEqual(r.progress, 0);
  assert.strictEqual(r.jellyToNext, 100);
  assert.strictEqual(r.nextStage, "baby");
});

test("50 jelly → 50% egg", () => {
  const r = getEvolutionProgress(50);
  assert.strictEqual(r.progress, 50);
});

test("99 jelly → 99% egg", () => {
  const r = getEvolutionProgress(99);
  assert.strictEqual(r.progress, 99);
});

test("300 jelly → 50% baby", () => {
  const r = getEvolutionProgress(300);
  assert.strictEqual(r.stage, "baby");
  assert.strictEqual(r.progress, 50);
  assert.strictEqual(r.jellyToNext, 200);
});

test("10000 jelly → 100% legend, no next", () => {
  const r = getEvolutionProgress(10000);
  assert.strictEqual(r.stage, "legend");
  assert.strictEqual(r.progress, 100);
  assert.strictEqual(r.nextStage, null);
});

// ── applyJelly ──────────────────────────────────

console.log("\napplyJelly:");

test("apply tokens to egg state", () => {
  const state = { jelly: 0, level: 1, stage: "egg", streak: 1 };
  const result = applyJelly(state, 25000);
  assert.strictEqual(result.earned, 50);
  assert.strictEqual(state.jelly, 50);
  assert.strictEqual(state.stage, "egg");
  assert.strictEqual(result.evolved, false);
});

test("evolution from egg to baby", () => {
  const state = { jelly: 80, level: 2, stage: "egg", streak: 1 };
  const result = applyJelly(state, 15000);
  assert.strictEqual(result.earned, 30);
  assert.strictEqual(state.jelly, 110);
  assert.strictEqual(state.stage, "baby");
  assert.strictEqual(result.evolved, true);
  assert.strictEqual(result.newStage, "baby");
});

test("no evolution when staying in same stage", () => {
  const state = { jelly: 200, level: 5, stage: "baby", streak: 3 };
  const result = applyJelly(state, 5000);
  assert.strictEqual(result.evolved, false);
  assert.strictEqual(result.newStage, null);
});

test("streak bonus applies", () => {
  const state = { jelly: 0, level: 1, stage: "egg", streak: 10 };
  const result = applyJelly(state, 5000);
  // 5000/500 = 10, x2.0 = 20
  assert.strictEqual(result.earned, 20);
});

// ── Results ─────────────────────────────────────

console.log("\n" + "─".repeat(40));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("─".repeat(40));

if (failed > 0) {
  process.exit(1);
}
