#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const PETS_PATH = path.join(__dirname, "..", "data", "pets.json");
let petsData = null;

function loadPets() {
  if (!petsData) {
    petsData = JSON.parse(fs.readFileSync(PETS_PATH, "utf-8"));
  }
  return petsData;
}

// ANSI color codes
const COLORS = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  red: "\x1b[91m",
  gold: "\x1b[93m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  orange: "\x1b[38;5;208m",
  dim: "\x1b[2m",
  bold: "\x1b[1m"
};

function colorize(text, color) {
  const code = COLORS[color];
  if (!code) return text;
  return code + text + COLORS.reset;
}

function getArt(species, stage) {
  const pets = loadPets();
  if (stage === "egg") {
    return pets.shared.egg;
  }
  return pets.species[species].stages[stage];
}

function progressBar(percent, width) {
  width = width || 20;
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return colorize("█".repeat(filled), "orange") + colorize("░".repeat(empty), "dim");
}

function formatJelly(jelly) {
  if (jelly >= 10000) return (jelly / 1000).toFixed(1) + "K";
  if (jelly >= 1000) return jelly.toLocaleString();
  return String(jelly);
}

function renderBanner(state, evoProgress) {
  const stageData = getArt(state.pet, state.stage);
  const pets = loadPets();
  const speciesInfo = pets.species[state.pet];
  const stageColor = stageData.color === "red" ? "red" : stageData.color === "gold" ? "gold" : "orange";

  const lines = [];
  lines.push("");

  // ASCII art
  for (const artLine of stageData.art) {
    lines.push("  " + colorize(artLine, stageColor));
  }

  // Pet name + greeting
  lines.push("");
  const nameDisplay = state.petName
    ? colorize(state.petName, "bold") + " " + colorize('"' + stageData.greeting + '"', stageColor)
    : colorize('"' + stageData.greeting + '"', stageColor);
  lines.push("  " + nameDisplay);
  lines.push("");

  // Stats row
  const nameTag = state.petName ? state.petName + " " : "";
  const stats = [
    "🍬 " + colorize(formatJelly(state.jelly), "orange"),
    "Lv." + colorize(String(state.level), "orange"),
    speciesInfo.emoji + " " + nameTag + capitalize(state.stage),
    state.streak > 0 ? "🔥 " + state.streak + "일" + streakLabel(state.streak) : ""
  ].filter(Boolean).join("  ");
  lines.push("  " + stats);

  // Evolution progress
  if (evoProgress.nextStage) {
    const bar = progressBar(evoProgress.progress, 15);
    lines.push("  진화 " + bar + " " + evoProgress.progress + "%" +
      colorize("  → " + capitalize(evoProgress.nextStage) + "까지 " + evoProgress.jellyToNext + " 젤리", "dim"));
  } else {
    lines.push("  " + colorize("✨ MAX EVOLUTION", "gold"));
  }

  lines.push("");
  return lines.join("\n");
}

function renderReport(state, earned, evolved, newStage, evoProgress) {
  const stageColor = state.stage === "master" ? "red" : state.stage === "legend" ? "gold" : "blue";
  const lines = [];

  lines.push("");
  lines.push(colorize("📋 세션 종료 리포트", stageColor));
  lines.push(colorize("─".repeat(36), "dim"));
  lines.push("  이번 세션    " + colorize("+" + earned + " 🍬", "orange") + streakLabel(state.streak));
  lines.push("  누적 젤리    " + colorize(formatJelly(state.jelly), "orange") +
    (evoProgress.nextStage ? " / " + formatJelly(evoProgress.jellyToNext + state.jelly) : ""));
  lines.push("  연속 접속    " + (state.streak > 0 ? "🔥 " + state.streak + "일" : "없음"));

  if (evoProgress.nextStage) {
    lines.push("  진화 진행    " + progressBar(evoProgress.progress, 15) + " " + evoProgress.progress + "%");
  }

  if (evolved) {
    lines.push("");
    lines.push(colorize("  🎉 축하! " + capitalize(newStage) + " 진화 달성!", stageColor));
    const stageData = getArt(state.pet, newStage);
    for (const artLine of stageData.art) {
      lines.push("    " + colorize(artLine, stageColor));
    }
  }

  lines.push(colorize("─".repeat(36), "dim"));
  lines.push("");
  return lines.join("\n");
}

function streakLabel(streak) {
  if (streak >= 8) return " (x2.0)";
  if (streak >= 4) return " (x1.5)";
  return "";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  getArt,
  renderBanner,
  renderReport,
  progressBar,
  formatJelly,
  colorize,
  loadPets,
  COLORS
};
