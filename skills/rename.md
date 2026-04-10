---
name: rename
description: Rename your pet
---

# Rename Pet

Give your pet a new name.

## Instructions

1. Ask the user for a new name:
   - "펫의 새 이름을 알려주세요!"

2. Update the state:
```bash
node -e "
const { renamePet } = require('/Users/ga/work/jelly-pet/lib/state');
renamePet('NEW_NAME');
console.log('Done');
"
```
Replace NEW_NAME with the user's input.

3. Show the updated pet:
```bash
node /Users/ga/work/jelly-pet/hooks/session-start.js
```

4. Confirm: "[NEW_NAME](으)로 이름을 바꿨어요!"
