---
name: status
description: Show current jelly pet status — pet, jelly, level, evolution progress, streak
---

# Jelly Pet Status

Show the user's current jelly pet status.

## Instructions

1. Run the session-start hook to display the pet banner:
```bash
node /Users/ga/work/jelly-pet/hooks/session-start.js
```

2. Also read the state file and provide a text summary:
```bash
cat ~/.jelly-pet/state.json
```

3. Present the results to the user in a friendly format. Include:
   - Current pet species and stage
   - Jelly count and level
   - Evolution progress (how much jelly until next stage)
   - Streak days and current multiplier
   - Total sessions since creation
