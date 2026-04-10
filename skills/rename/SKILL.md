---
name: rename
description: Give your jelly pet a new name
---

# Rename Pet

Give your pet a new name.

## Instructions

1. Ask the user for a new name:
   - "펫의 새 이름을 알려주세요!"

2. Update the state:
```bash
node -e "
const { renamePet } = require('$PLUGIN_DIR/lib/state');
renamePet('NEW_NAME');
console.log('Done');
"
```
Replace NEW_NAME with the user's input.

3. Show the updated pet:
```bash
node "$PLUGIN_DIR/hooks/session-start.js"
```

4. Confirm: "[NEW_NAME](으)로 이름을 바꿨어요!"
