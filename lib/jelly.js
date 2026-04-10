#!/usr/bin/env node
"use strict";

const STAGE_THRESHOLDS = [
  { stage: "egg",    jelly: 0,     levelMin: 1,  levelMax: 3 },
  { stage: "baby",   jelly: 100,   levelMin: 4,  levelMax: 7 },
  { stage: "pro",    jelly: 500,   levelMin: 8,  levelMax: 12 },
  { stage: "master", jelly: 2000,  levelMin: 13, levelMax: 17 },
  { stage: "legend", jelly: 10000, levelMin: 18, levelMax: 20 }
];

const TOKENS_PER_JELLY = 500;

function getStreakMultiplier(streakDays) {
  if (streakDays >= 8) return 2.0;
  if (streakDays >= 4) return 1.5;
  return 1.0;
}

function calculateJelly(outputTokens, streakDays) {
  const baseJelly = Math.floor(outputTokens / TOKENS_PER_JELLY);
  const multiplier = getStreakMultiplier(streakDays);
  return Math.floor(baseJelly * multiplier);
}

function getStageInfo(totalJelly) {
  let current = STAGE_THRESHOLDS[0];
  let next = STAGE_THRESHOLDS[1];

  for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalJelly >= STAGE_THRESHOLDS[i].jelly) {
      current = STAGE_THRESHOLDS[i];
      next = STAGE_THRESHOLDS[i + 1] || null;
      break;
    }
  }

  return { current, next };
}

function calculateLevel(totalJelly) {
  const { current } = getStageInfo(totalJelly);
  const nextThreshold = STAGE_THRESHOLDS.find(s => s.jelly > current.jelly);

  if (!nextThreshold) {
    return current.levelMax;
  }

  const rangeJelly = nextThreshold.jelly - current.jelly;
  const progressJelly = totalJelly - current.jelly;
  const levelRange = current.levelMax - current.levelMin;
  const level = current.levelMin + Math.floor((progressJelly / rangeJelly) * levelRange);

  return Math.min(level, current.levelMax);
}

function getEvolutionProgress(totalJelly) {
  const { current, next } = getStageInfo(totalJelly);

  if (!next) {
    return { stage: current.stage, progress: 100, jellyToNext: 0, nextStage: null };
  }

  const rangeJelly = next.jelly - current.jelly;
  const progressJelly = totalJelly - current.jelly;
  const progress = Math.min(Math.floor((progressJelly / rangeJelly) * 100), 99);

  return {
    stage: current.stage,
    progress,
    jellyToNext: next.jelly - totalJelly,
    nextStage: next.stage
  };
}

function applyJelly(state, outputTokens) {
  const earned = calculateJelly(outputTokens, state.streak);
  state.jelly += earned;
  state.level = calculateLevel(state.jelly);

  const { current } = getStageInfo(state.jelly);
  const evolved = state.stage !== current.stage;
  state.stage = current.stage;

  return { earned, evolved, newStage: evolved ? current.stage : null };
}

function parseTranscriptTokens(transcriptPath) {
  const fs = require("fs");
  let totalOutput = 0;

  try {
    const content = fs.readFileSync(transcriptPath, "utf-8");
    const lines = content.trim().split("\n");

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.type === "assistant" && entry.message && entry.message.usage) {
          totalOutput += entry.message.usage.output_tokens || 0;
        }
      } catch (e) {
        // skip malformed lines
      }
    }
  } catch (err) {
    // transcript not readable
  }

  return totalOutput;
}

module.exports = {
  calculateJelly,
  getStreakMultiplier,
  getStageInfo,
  calculateLevel,
  getEvolutionProgress,
  applyJelly,
  parseTranscriptTokens,
  STAGE_THRESHOLDS,
  TOKENS_PER_JELLY
};
