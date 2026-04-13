# Jelly Pet — 프로젝트 컨텍스트

## 개요
Claude Code 플러그인 — 코딩할 때 토큰이 "젤리"로 변환되고, 펫이 단계적으로 진화.
- GitHub: ejlee-0924/jelly-pet (PUBLIC, MIT)
- 가이드: https://jelly-pet.vercel.app
- 설치: `/plugin install jelly-pet`

## 설계 원칙

### 1. Zero-Config
설치 → session-start 훅 → statusline 자동 설정 → 즉시 작동. 수동 settings.json 편집 불필요.

### 2. 비개발자 친화성
Egg→Legend 1년+ (캐주얼 기준). ASCII art 4줄 고정. 메시지 한글 기본.

### 3. 상태 영속성
`~/.jelly-pet/state.json` — 플러그인 자체는 stateless, 모든 데이터는 hooks를 통해 읽고 씀.

## 개발 결정사항

### Skills 구조 (Claude Code 플러그인 표준)
```
skills/{skillName}/SKILL.md
```
- frontmatter에 `name`, `description` 필수
- 플랫 파일(skills/status.md) 인식 안 됨 — 반드시 서브디렉토리

### Statusline 자동 설정 (session-start.js)
1. 첫 세션 시작 시 `~/.claude/settings.json` 감지
2. `~/.jelly-pet/statusline-command.sh` wrapper 생성 (절대 경로)
3. settings.json의 `statusLine.command` 업데이트
4. 기존 설정 `_statusLineBackup`으로 백업
5. 마커 파일 `~/.jelly-pet/.statusline-path`로 중복 방지

### $PLUGIN_DIR 범위
- hook 실행 시에만 유효 (process.env.PLUGIN_DIR)
- statusline command 등 외부 환경에서는 절대 경로 wrapper 필요

## 파일 구조
```
jelly-pet/
├── .claude-plugin/plugin.json    # 플러그인 메타
├── hooks/
│   ├── session-start.js          # 배너 + statusline 자동설정
│   ├── post-tool-use.js          # 점진적 젤리 카운터
│   └── session-end.js            # 최종 젤리 계산 + 리포트
├── skills/
│   ├── status/SKILL.md           # /jelly-pet:status
│   ├── switch/SKILL.md           # /jelly-pet:switch
│   ├── evolve/SKILL.md           # /jelly-pet:evolve
│   └── rename/SKILL.md           # /jelly-pet:rename
├── lib/
│   ├── state.js                  # ~/.jelly-pet/state.json 관리
│   ├── jelly.js                  # 젤리 계산 + 진화 로직
│   ├── display.js                # ASCII art 렌더링
│   └── statusline.js             # 상태바 포맷팅
├── data/pets.json                # 5종 x 5단계 (ASCII + 대사)
├── hooks.json                    # 훅 등록
└── public/index.html             # Vercel 가이드 페이지
```

## 알려진 이슈 (P0)
1. hooks.json에 PostToolUse 미등록 — post-tool-use.js 존재하나 hooks.json에 엔트리 없음
2. state.json 초기값(createdAt=null) 실행 검증 미완
