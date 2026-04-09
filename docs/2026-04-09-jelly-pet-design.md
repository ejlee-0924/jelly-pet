# jelly-pet Design Spec

## Overview
Claude Code plugin that adds a virtual pet companion to your coding sessions. The pet grows by eating "jelly" earned from token usage, evolving through 5 stages.

## GitHub
- Repo: ejlee-0924/jelly-pet
- Distribution: GitHub open source + Claude Code plugin marketplace

## Core Concept
- **Jelly** = point system. 500 output tokens = 1 jelly
- Pet evolves as jelly accumulates
- Streak bonus multiplier for consecutive daily usage
- 5 pet species, each with unique ASCII art evolution line

## Evolution Stages

| Stage | Name | Jelly Required | Level Range |
|:-----:|------|---------------:|:-----------:|
| 1 | Egg | 0 | 1-3 |
| 2 | Baby | 100 | 4-7 |
| 3 | Pro | 500 | 8-12 |
| 4 | Master | 2,000 | 13-17 |
| 5 | Legend | 10,000 | 18-20 |

Target pace (casual non-developer user, ~10-20 jelly/day):
- Egg -> Baby: ~1 week
- Baby -> Pro: ~1 month
- Pro -> Master: ~3-4 months
- Master -> Legend: ~1 year+

## Pet Species (5 types)
1. Cat
2. Dog
3. Hamster
4. Rabbit
5. Hedgehog

- User selects pet on first run
- Can switch anytime via `/jelly-pet:switch`
- Egg stage is shared art across all species
- Baby onwards: species-specific ASCII art

## ASCII Art Style
- Style D (cat growth pattern base)
- 4 lines tall, uniform across all stages
- Evolution changes: shape, facial features, decorations, color
- Master: red color accent
- Legend: gold color + sparkle effect

## Jelly Calculation

```
On session end:
  Parse transcript JSONL at transcript_path
  Sum output_tokens from all assistant messages
  
  base_jelly = floor(output_tokens / 500)
  streak_multiplier =
    1-3 days  -> x1.0
    4-7 days  -> x1.5
    8+ days   -> x2.0 (MAX)
  
  earned_jelly = base_jelly * streak_multiplier
```

## Display Locations

### 1. Statusline (always visible, multi-line)
```
  /\ /\        Opus 4.6  ████████░░░░ 62%
 ( o.o )       Jelly 42  Lv.1 Egg
  > ^ <        Streak 3d  Evolve ██░░░░ 42%
  '---'
```

### 2. Session Start Banner
Large ASCII art pet with greeting message + stats summary.
Pet personality affects greeting text per stage.

### 3. Session End Report
```
Session Report
  This session:  +35 jelly
  Total:         535 / 2,000
  Streak:        7 days (x1.5)
  Progress:      Pro -> Master  27%
```

## Data Storage

Location: `~/.jelly-pet/state.json`

```json
{
  "pet": "cat",
  "jelly": 535,
  "level": 8,
  "stage": "pro",
  "streak": 7,
  "lastSessionDate": "2026-04-09",
  "totalSessions": 42,
  "createdAt": "2026-04-09"
}
```

## Plugin Structure

```
jelly-pet/
  hooks/
    session-start.js   -> Pet greeting + stats
    post-tool-use.js   -> Incremental jelly count
    session-end.js     -> Final jelly calculation + report
  skills/
    status.md          -> /jelly-pet:status
    switch.md          -> /jelly-pet:switch
    evolve.md          -> /jelly-pet:evolve
  data/
    pets.json          -> 5 species x 5 stages ASCII art + dialogue
  lib/
    state.js           -> Read/write state.json
    jelly.js           -> Jelly calculation logic
    statusline.js      -> Multi-line statusline output
  package.json
```

## Hooks

| Event | Action | Timeout |
|-------|--------|---------|
| SessionStart | Load state, output greeting banner | 5s |
| PostToolUse | Parse JSONL, update running jelly count | 5s |
| SessionEnd | Final jelly calculation, save state, output report | 10s |

## Skill Commands

| Command | Description |
|---------|-------------|
| `/jelly-pet:status` | Show current pet, jelly, level, evolution progress |
| `/jelly-pet:switch` | Change pet species (jelly/level preserved) |
| `/jelly-pet:evolve` | Show evolution tree and progress |

## Tech Stack
- Pure Node.js (zero external dependencies)
- JSONL parsing for token data
- JSON file for state persistence
