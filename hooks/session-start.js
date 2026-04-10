#!/usr/bin/env node
"use strict";

// Hard timeout — must finish within 5s
const TIMEOUT = setTimeout(() => process.exit(0), 5000);
TIMEOUT.unref();

const { loadState, saveState, updateStreak } = require("../lib/state");
const { getEvolutionProgress } = require("../lib/jelly");
const { renderBanner } = require("../lib/display");

function main() {
  let state = loadState();

  // First run — no pet selected yet
  if (!state.pet) {
    console.log("\n  🍬 Jelly Pet에 오신 걸 환영해요!");
    console.log("  /jelly-pet:switch 명령으로 펫을 선택해주세요.");
    console.log("  선택 가능: cat, dog, hamster, rabbit, hedgehog\n");
    return;
  }

  // Update streak
  state = updateStreak(state);
  saveState(state);

  // Render banner
  const evoProgress = getEvolutionProgress(state.jelly);
  console.log(renderBanner(state, evoProgress));
}

try {
  main();
} catch (err) {
  // Silent fail — don't break Claude Code
}
