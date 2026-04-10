#!/usr/bin/env node
"use strict";

// Hard timeout — must finish within 10s
const TIMEOUT = setTimeout(() => process.exit(0), 10000);
TIMEOUT.unref();

const { loadState, saveState } = require("../lib/state");
const { applyJelly, getEvolutionProgress, parseTranscriptTokens } = require("../lib/jelly");
const { renderReport } = require("../lib/display");

// Read stdin for hook data (contains transcript_path)
let input = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => { input += chunk; });
process.stdin.on("end", () => {
  try {
    main();
  } catch (err) {
    // Silent fail — don't break Claude Code
  }
});

function main() {
  let hookData = {};
  try {
    hookData = JSON.parse(input);
  } catch (e) {
    // No stdin data — can't calculate
    return;
  }

  const state = loadState();

  // No pet selected — skip
  if (!state.pet) return;

  // Parse transcript for output tokens
  const transcriptPath = hookData.transcript_path;
  if (!transcriptPath) return;

  const outputTokens = parseTranscriptTokens(transcriptPath);
  if (outputTokens === 0) return;

  // Apply jelly
  const { earned, evolved, newStage } = applyJelly(state, outputTokens);

  if (earned === 0) return;

  // Save updated state
  saveState(state);

  // Render report
  const evoProgress = getEvolutionProgress(state.jelly);
  console.log(renderReport(state, earned, evolved, newStage, evoProgress));
}
