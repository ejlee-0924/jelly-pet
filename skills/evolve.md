---
name: evolve
description: Show evolution tree and progress for current pet
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
const { loadPets } = require('/Users/ga/work/jelly-pet/lib/display');
const { loadState } = require('/Users/ga/work/jelly-pet/lib/state');
const { getEvolutionProgress } = require('/Users/ga/work/jelly-pet/lib/jelly');
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

Your pet: [species name]
Jelly: [current] / [next threshold]
Progress: [bar] [percent]%
[jelly needed] jelly until [next stage]!
```

4. Show ASCII art for each stage side by side, highlighting the current stage.

5. For each stage, show:
   - Stage name and jelly threshold
   - ASCII art (4 lines)
   - Greeting message
   - Whether it's completed, current, or locked
