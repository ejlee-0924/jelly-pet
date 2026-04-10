---
description: Show your pet's full evolution tree and progress to next stage
---

# Evolution Tree

Show the full evolution tree for the user's current pet species.

## Instructions

1. Read the current state:
```bash
cat ~/.jelly-pet/state.json
```

2. Read the pets data to get all ASCII art for the user's species:
```bash
node -e "
const { loadPets } = require('$PLUGIN_DIR/lib/display');
const { loadState } = require('$PLUGIN_DIR/lib/state');
const { getEvolutionProgress } = require('$PLUGIN_DIR/lib/jelly');
const state = loadState();
const pets = loadPets();
const species = pets.species[state.pet];
const evo = getEvolutionProgress(state.jelly);
console.log(JSON.stringify({ state, species, evo, egg: pets.shared.egg }, null, 2));
"
```

3. Present the evolution tree visually:

```
🥚 Egg (0) → 🐣 Baby (100) → 🦊 Pro (500) → 🐉 Master (2K) → ✨ Legend (10K)
                                  ^current

Your pet: [name] the [species]
Jelly: [current] / [next threshold]
Progress: [bar] [percent]%
[jelly needed] jelly until [next stage]!
```

4. Show ASCII art for each stage, highlighting the current stage with color.

5. For each stage, show:
   - Stage name and jelly threshold
   - ASCII art (4 lines)
   - Greeting message
   - Whether it's completed, current, or locked
