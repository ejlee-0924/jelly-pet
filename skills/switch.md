---
name: switch
description: Switch pet species — jelly and level are preserved
---

# Switch Pet Species

Change the user's pet to a different species. Jelly, level, and streak are all preserved.

## Available Species
- cat (고양이)
- dog (강아지)
- hamster (햄스터)
- rabbit (토끼)
- hedgehog (고슴도치)

## Instructions

1. Ask the user which pet they want using AskUserQuestion:
   - Options: cat (고양이), dog (강아지), hamster (햄스터), rabbit (토끼), hedgehog (고슴도치)

2. Once they choose, update the state:
```bash
node -e "
const { loadState, saveState } = require('/Users/ga/work/jelly-pet/lib/state');
const state = loadState();
state.pet = 'CHOSEN_SPECIES';
saveState(state);
console.log('Pet switched to CHOSEN_SPECIES!');
"
```
Replace CHOSEN_SPECIES with the user's selection.

3. Show the new pet's ASCII art by running:
```bash
node /Users/ga/work/jelly-pet/hooks/session-start.js
```

4. Confirm: "펫을 [species]로 변경했어요! 젤리와 레벨은 그대로예요."
