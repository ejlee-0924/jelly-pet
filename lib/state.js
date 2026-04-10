#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const STATE_DIR = path.join(process.env.HOME, ".jelly-pet");
const STATE_PATH = path.join(STATE_DIR, "state.json");

const DEFAULT_STATE = {
  pet: null,
  jelly: 0,
  level: 1,
  stage: "egg",
  streak: 0,
  lastSessionDate: null,
  totalSessions: 0,
  createdAt: null
};

function loadState() {
  try {
    const data = fs.readFileSync(STATE_PATH, "utf-8");
    return { ...DEFAULT_STATE, ...JSON.parse(data) };
  } catch (err) {
    if (err.code === "ENOENT") {
      return { ...DEFAULT_STATE };
    }
    throw err;
  }
}

function saveState(state) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function updateStreak(state) {
  const t = today();
  if (state.lastSessionDate === t) {
    return state;
  }

  if (state.lastSessionDate) {
    const last = new Date(state.lastSessionDate);
    const now = new Date(t);
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      state.streak += 1;
    } else if (diffDays > 1) {
      state.streak = 1;
    }
  } else {
    state.streak = 1;
  }

  state.lastSessionDate = t;
  state.totalSessions += 1;

  if (!state.createdAt) {
    state.createdAt = t;
  }

  return state;
}

function initializePet(species) {
  const valid = ["cat", "dog", "hamster", "rabbit", "hedgehog"];
  if (!valid.includes(species)) {
    throw new Error("Invalid species: " + species + ". Choose: " + valid.join(", "));
  }

  const state = loadState();
  state.pet = species;
  if (!state.createdAt) {
    state.createdAt = today();
  }
  saveState(state);
  return state;
}

module.exports = {
  loadState,
  saveState,
  updateStreak,
  initializePet,
  today,
  DEFAULT_STATE,
  STATE_PATH
};
