#!/usr/bin/env node
"use strict";

// Self-contained jelly collector — runs as a global Stop hook in settings.json
// Mirrors report-usage.js pattern: reads transcript, calculates delta, updates state
// Auto-installed by session-start.js setupStatusline()

const fs = require("fs");
const path = require("path");
const os = require("os");

const TIMEOUT = setTimeout(() => process.exit(0), 5000);
TIMEOUT.unref();

const JELLY_DIR = path.join(os.homedir(), ".jelly-pet");
const STATE_PATH = path.join(JELLY_DIR, "state.json");
const CACHE_PATH = path.join(JELLY_DIR, "session-cache.json");

const TOKENS_PER_JELLY = 500;
const STAGE_THRESHOLDS = [
  { stage: "egg",    jelly: 0,     levelMin: 1,  levelMax: 3 },
  { stage: "baby",   jelly: 100,   levelMin: 4,  levelMax: 7 },
  { stage: "pro",    jelly: 500,   levelMin: 8,  levelMax: 12 },
  { stage: "master", jelly: 2000,  levelMin: 13, levelMax: 17 },
  { stage: "legend", jelly: 10000, levelMin: 18, levelMax: 20 }
];

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, "utf-8")); }
  catch { return null; }
}

function saveState(state) {
  fs.mkdirSync(JELLY_DIR, { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function loadCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8")); }
  catch { return {}; }
}

function saveCache(cache) {
  // Clean entries older than 7 days
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  for (const [key, val] of Object.entries(cache)) {
    if (val.ts && val.ts < cutoff) delete cache[key];
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));
}

function getStreakMultiplier(streak) {
  if (streak >= 8) return 2.0;
  if (streak >= 4) return 1.5;
  return 1.0;
}

function calculateLevel(totalJelly) {
  let current = STAGE_THRESHOLDS[0];
  for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalJelly >= STAGE_THRESHOLDS[i].jelly) { current = STAGE_THRESHOLDS[i]; break; }
  }
  const next = STAGE_THRESHOLDS.find(s => s.jelly > current.jelly);
  if (!next) return current.levelMax;
  const range = next.jelly - current.jelly;
  const progress = totalJelly - current.jelly;
  return Math.min(current.levelMin + Math.floor((progress / range) * (current.levelMax - current.levelMin)), current.levelMax);
}

function getStage(totalJelly) {
  let stage = "egg";
  for (const t of STAGE_THRESHOLDS) {
    if (totalJelly >= t.jelly) stage = t.stage;
  }
  return stage;
}

// ── Main ──
let input = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  try {
    const event = JSON.parse(input);
    const transcriptPath = event.transcript_path;
    const sessionId = event.session_id;
    if (!transcriptPath || !fs.existsSync(transcriptPath)) process.exit(0);

    const state = loadState();
    if (!state || !state.pet) process.exit(0);

    // Parse transcript for total output tokens
    const lines = fs.readFileSync(transcriptPath, "utf-8").split("\n").filter(Boolean);
    let totalOutput = 0;
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.type === "assistant" && entry.message && entry.message.usage) {
          totalOutput += entry.message.usage.output_tokens || 0;
        }
      } catch {}
    }
    if (totalOutput === 0) process.exit(0);

    // Delta calculation (like report-usage.js)
    const cache = loadCache();
    const prev = (sessionId && cache[sessionId]) || { out: 0 };
    const deltaOutput = Math.max(0, totalOutput - prev.out);
    if (deltaOutput <= 0) process.exit(0);

    // Update cache
    if (sessionId) {
      cache[sessionId] = { out: totalOutput, ts: Date.now() };
      saveCache(cache);
    }

    // Calculate jelly from delta tokens
    const multiplier = getStreakMultiplier(state.streak || 0);
    const earned = Math.floor(Math.floor(deltaOutput / TOKENS_PER_JELLY) * multiplier);
    if (earned <= 0) process.exit(0);

    // Apply jelly
    const oldStage = state.stage;
    state.jelly += earned;
    state.level = calculateLevel(state.jelly);
    state.stage = getStage(state.jelly);
    saveState(state);

    // Notify if evolved
    if (state.stage !== oldStage) {
      console.log(`\n  \x1b[33m✨ 도도루루가 ${state.stage.toUpperCase()}(으)로 진화했어요!\x1b[0m\n`);
    }
  } catch {
    process.exit(0);
  }
});
