#!/usr/bin/env node
"use strict";

// Hard timeout — must finish within 5s
const TIMEOUT = setTimeout(() => process.exit(0), 5000);
TIMEOUT.unref();

// PostToolUse hook — lightweight, just tracks session activity
// Actual jelly calculation happens at session-end to avoid performance impact

// Read stdin for hook data
let input = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => { input += chunk; });
process.stdin.on("end", () => {
  try {
    const hookData = JSON.parse(input);
    // We could track tool counts here for future features
    // For now, this hook is a no-op placeholder
    // All jelly calculation happens in session-end.js via transcript parsing
  } catch (err) {
    // Silent fail
  }
});
