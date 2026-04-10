---
description: Switch pet species and set a name — jelly and level are preserved
---

# Switch Pet Species

Change the user's pet to a different species. Jelly, level, streak, and progress are all preserved.

## Available Species
- cat (고양이)
- dog (강아지)
- hamster (햄스터)
- rabbit (토끼)
- hedgehog (고슴도치)

## Instructions

1. Ask the user which pet they want using AskUserQuestion:
   - Options: cat (고양이), dog (강아지), hamster (햄스터), rabbit (토끼), hedgehog (고슴도치)

2. Ask if they want to name their pet (or keep the current name):
   - "펫 이름을 지어주세요! (예: 초코, 뭉치) 또는 건너뛰기"

3. Once they choose, update the state:
```bash
node -e "
const { loadState, saveState } = require('$PLUGIN_DIR/lib/state');
const state = loadState();
state.pet = 'CHOSEN_SPECIES';
state.petName = 'CHOSEN_NAME';
saveState(state);
console.log('Done');
"
```
Replace CHOSEN_SPECIES and CHOSEN_NAME with user's selections. If they skip the name, set petName to null or keep existing.

4. Show the new pet's ASCII art by running:
```bash
node "$PLUGIN_DIR/hooks/session-start.js"
```

5. Confirm: "펫을 [species]([name])로 변경했어요! 젤리와 레벨은 그대로예요."
