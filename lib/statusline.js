#!/usr/bin/env node
"use strict";

// Statusline script — called by Claude Code statusline command
// Reads stdin (model + context window JSON from Claude Code)
// Outputs multi-line: ASCII pet + model info + jelly stats

const { loadState } = require("./state");
const { getEvolutionProgress } = require("./jelly");
const { getArt, formatJelly, COLORS } = require("./display");

function main() {
  let input = "";
  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", (chunk) => { input += chunk; });
  process.stdin.on("end", () => {
    try {
      render(input);
    } catch (err) {
      // Fallback — just show model info without pet
      fallback(input);
    }
  });
}

function render(input) {
  const state = loadState();

  // No pet — minimal output
  if (!state.pet) {
    fallback(input);
    return;
  }

  // Parse Claude Code statusline data
  let model = "Unknown";
  let usedPct = null;
  try {
    const data = JSON.parse(input);
    model = (data.model && data.model.display_name) || "Unknown";
    usedPct = data.context_window && data.context_window.used_percentage;
  } catch (e) {}

  // Context bar
  const barWidth = 12;
  let ctxBar = "";
  let ctxPct = "-";
  if (usedPct != null) {
    const usedInt = Math.round(usedPct);
    const filled = Math.round((usedInt / 100) * barWidth);
    const empty = barWidth - filled;
    ctxBar = "\x1b[32m" + "\u2588".repeat(filled) + "\x1b[0m" +
             "\x1b[2m" + "\u2591".repeat(empty) + "\x1b[0m";
    ctxPct = usedInt + "%";
  } else {
    ctxBar = "\x1b[2m" + "\u2591".repeat(barWidth) + "\x1b[0m";
  }

  // Pet art
  const stageData = getArt(state.pet, state.stage);
  const artLines = stageData.art;
  const petColor = stageData.color === "red" ? COLORS.red :
                   stageData.color === "gold" ? COLORS.gold :
                   COLORS.orange;

  // Evolution progress
  const evo = getEvolutionProgress(state.jelly);
  const evoBarW = 8;
  const evoFilled = Math.round((evo.progress / 100) * evoBarW);
  const evoEmpty = evoBarW - evoFilled;
  const evoBar = COLORS.orange + "\u2588".repeat(evoFilled) + COLORS.reset +
                 COLORS.dim + "\u2591".repeat(evoEmpty) + COLORS.reset;

  // Streak text
  let streakText = "";
  if (state.streak > 0) {
    const mult = state.streak >= 8 ? "x2.0" : state.streak >= 4 ? "x1.5" : "";
    streakText = "\x1b[38;5;208m\uD83D\uDD25" + state.streak + "일" +
                 (mult ? " " + mult : "") + COLORS.reset;
  }

  // Stage emoji
  const stageEmoji = { egg: "\uD83E\uDD5A", baby: "\uD83D\uDC23", pro: "\uD83E\uDD8A", master: "\uD83D\uDC09", legend: "\u2728" };
  const emoji = stageEmoji[state.stage] || "";

  // Build right-side info lines (match 4 lines of art)
  const infoLines = [
    COLORS.blue + model + COLORS.reset + "  " + ctxBar + " " + ctxPct,
    COLORS.orange + "\uD83C\uDF6C " + formatJelly(state.jelly) + COLORS.reset +
      "  Lv." + COLORS.orange + state.level + COLORS.reset +
      "  " + emoji + " " + capitalize(state.stage),
    "진화 " + evoBar + " " + evo.progress + "%" +
      (streakText ? "  " + streakText : ""),
    evo.nextStage
      ? COLORS.dim + "\u2192 " + capitalize(evo.nextStage) + "까지 " + evo.jellyToNext + " 젤리" + COLORS.reset
      : COLORS.gold + "\u2728 MAX" + COLORS.reset
  ];

  // Pad art lines to consistent width
  const artWidth = Math.max(...artLines.map(l => l.length));
  const gap = "    ";

  for (let i = 0; i < 4; i++) {
    const artLine = (artLines[i] || "").padEnd(artWidth);
    const infoLine = infoLines[i] || "";
    process.stdout.write(petColor + artLine + COLORS.reset + gap + infoLine + "\n");
  }
}

function fallback(input) {
  // No pet — show original statusline format
  let model = "Unknown";
  let usedPct = null;
  try {
    const data = JSON.parse(input);
    model = (data.model && data.model.display_name) || "Unknown";
    usedPct = data.context_window && data.context_window.used_percentage;
  } catch (e) {}

  const barWidth = 20;
  if (usedPct != null) {
    const usedInt = Math.round(usedPct);
    const filled = Math.round((usedInt / 100) * barWidth);
    const empty = barWidth - filled;
    const bar = "\u2588".repeat(filled) + "\u2591".repeat(empty);
    process.stdout.write(model + "  [" + bar + "] " + usedInt + "%\n");
  } else {
    process.stdout.write(model + "  [" + "\u2591".repeat(barWidth) + "] -\n");
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

main();
