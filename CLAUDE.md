# No Signal Home — Claude Project Memory

> This file serves as persistent context for Claude Code sessions. It is automatically read at the start of every conversation. Keep this document updated as the project evolves.

## Project Identity

**Name:** No Signal Home
**Purpose:** Sci-fi salvage horror interactive fiction game built with Sharpee
**Target Users:** Players of text adventure / interactive fiction games
**Repository:** https://github.com/Johnesco/no-signal-home
**Project Board:** https://github.com/users/Johnesco/projects/4

## Project Context
This is a Sharpee interactive fiction game (TypeScript). It's a sci-fi salvage horror set on a derelict corporate freighter called The Stillwater. The player is a grey-market salvager who drifted into range of the derelict after running low on fuel during a long haul. They dock their tug, board to scavenge, and the tug fails — trapping them aboard.

## Design Documents
All design docs are in `docs/`:
- `game-design.md` — master design doc: plot beats, NPCs, AI system, endings, mechanics
- `room-map.md` — 26 rooms across the tug + 3 decks of The Stillwater with ASCII map and object/NPC placements
- `puzzles-and-items.md` — every puzzle chain, item inventory, dependency graph, endgame paths
- `guidance-system.md` — unified player-guidance pattern (memories, interruptions, recalls, idle nudges); extends MemoryTrait

Read these before making any design or implementation decisions.

## Writing Style Rules
- **Short, punchy descriptions.** No walls of text. Not a hard 2-sentence rule, but be brief and evocative. Classic 80s Infocom feel.
- **Show, don't tell.** Let players discover depth through interaction, not prose.
- **Simple compass movement.** N/S/E/W/U/D. No complex navigation mechanics.
- **PC voice:** Starts sparse. Memories and observations emerge through examining objects. Dry humor, dark commentary. Not chatty.
- **Corporate satire** in world flavor — company slogans, safety posters, absurd memos.
- **Never describe what's obvious from exits.** If there's a door north, the room description doesn't need to say "a door leads north."

## Sharpee Architecture
This is a Sharpee story project. Key patterns:
- Story implements the `Story` interface with `initializeWorld()`, `createPlayer()`, etc.
- Rooms organized as regions (one file per geographic area in `src/regions/`)
- NPCs get their own folders in `src/npcs/` (entity, behavior, messages)
- Custom actions in `src/actions/`, parser extensions in `src/grammar/`
- Tests use transcript format in `tests/transcripts/` and `walkthroughs/`

## Key Design Decisions (Do Not Change Without Discussion)
- 26 rooms across 4 regions: the tug (2), Stillwater Lower Deck (12), Mid Deck (7), Upper Deck (5)
- 4 NPCs + AI, each with distinct behavioral systems
- 5 endings (4 main + 1 secret merge ending)
- All combat is optional — every encounter has a non-violent alternative
- Most puzzles have 2-3 solution approaches (hack/force/social)
- Deaths are fair — always telegraphed with warnings
- Time pressure is a mix of timed and triggered events
- Hidden score revealed at end
- Standard SAVE/RESTORE, no in-fiction wrapper
- Inventory has a soft limit
- Food/eating is infrequent — not disruptive to gameplay

## Procedural Systems (See docs/procedural-systems.md)
The game uses a single SeededRandom seed to make every playthrough unique:
- **Codes/passwords** regenerate per seed — clues stay in same locations, answers change
- **Corporate flavor text** — memos, posters, dead crew names generated from templates
- **AI deception strategy** — same truths, different lies per seed (2-3 strategies picked per game)
- **Minor item shuffling** — non-critical items appear in different rooms
- **NPC idle dialogue** — drawn from pools, not scripted sequences
- **Combat rolls** — standard SeededRandom variance
- **Engineer symptoms** — which glitches, which phrases, which turned-behavior profile

State-reactive (deterministic, not seeded):
- Reactor warming changes lower deck descriptions
- AI spreading adds terminals/speakers/cameras to room descriptions
- Infection spreading adds environmental wrongness

**Testing:** Pin seed in transcripts via `$state game.seed = 12345` — all procedural content becomes deterministic and assertable.

## Sharpee Features to Showcase
This game specifically demonstrates things Inform 7 can't do well:
- NPC behavior plugins (knowledge, goals, patrol, decline arcs)
- CombatantTrait / WeaponTrait for optional combat
- State machine plugin for reactor, elevator, AI personality
- Daemon/fuse scheduler for timed events
- Semantic events for the AI lore system
- Action interceptors for puzzle-specific behavior
- Transcript testing with assertions, control flow, and chained walkthroughs
- **SeededRandom procedural generation** — unique playthroughs, deterministic tests
- **State-reactive room descriptions** — computed from game state, not static text

## Nautical Directions

Movement uses nautical directions instead of compass:

| Nautical | Abbrev | Compass | Meaning |
|----------|--------|---------|---------|
| Fore | F | North | Toward bow / airlock |
| Aft | A | South | Toward stern / engineering |
| Port | P | West | Left side facing fore |
| Starboard | SB | East | Right side facing fore |
| Up / Down | U / D | Up / Down | Between decks |

Compass directions (N/S/E/W) still work as input. Room descriptions, NPC dialogue, and help text all use nautical terms.

**Engine patches:** Sharpee doesn't natively support custom direction words. Two engine packages are patched via `patch-package` (auto-applied on `npm install`):
- `@sharpee/lang-en-us` — adds nautical words to direction vocabulary and tokenizer
- `@sharpee/parser-en-us` — adds nautical words to direction-to-constant mappings

Patch files are in `patches/`. Grammar patterns in `src/grammar.ts` register the bare-word commands.

## File Structure Overview

```
no-signal-home/
├── CLAUDE.md              # THIS FILE
├── README.md              # Public documentation
├── package.json           # Dependencies (@sharpee/*)
├── tsconfig.json          # TypeScript config
├── patches/               # Engine patches for nautical directions (auto-applied)
├── .github/
│   ├── ISSUE_TEMPLATE/    # sdlc-baseline issue templates
│   └── PULL_REQUEST_TEMPLATE.md
├── browser/
│   ├── index.html         # Web client shell
│   └── styles.css         # Sci-fi terminal theme
├── docs/
│   ├── game-design.md     # Master design doc
│   ├── room-map.md        # 26 rooms, ASCII map
│   ├── puzzles-and-items.md # Puzzle chains, items
│   ├── opening-sequence.md # Opening docking puzzle design
│   ├── guidance-system.md  # Player guidance / hint / memory system design
│   ├── npcs.md            # NPC details
│   ├── procedural-systems.md # SeededRandom systems
│   └── writing-style.md   # Prose guidelines
├── src/
│   ├── index.ts           # Story class, lifecycle wiring
│   ├── types.ts           # IDs, messages, traits, helpers
│   ├── world.ts           # 4 regions + 26 rooms, items, scenery
│   ├── npcs.ts            # 4 NPCs + SOMS terminal
│   ├── actions.ts         # 18 custom actions
│   ├── interceptors.ts    # 4 action interceptors
│   ├── grammar.ts         # Parser extensions (~80 patterns)
│   ├── language.ts        # All player-facing text (~150 messages, includes NPC behavior text)
│   ├── plugins.ts         # 13 turn plugins (Scenes API, event factories)
│   ├── play.ts            # Interactive terminal REPL
│   └── browser-entry.ts   # Web client entry point
├── tests/transcripts/     # Unit tests (fresh game per file)
└── walkthroughs/          # Chained walkthrough tests
```

## Current Feature Status

### Implemented
- [x] 26 rooms organized as 4 regions (tug + lower/mid/upper decks) with full connectivity
- [x] 19 portable items, 3 doors, ~60 scenery objects
- [x] Opening sequence: alarm, 7-step docking puzzle, seal degradation, 3 deaths, 2 survivals
- [x] MemoryTrait first-examine flavor text system (5 entities)
- [x] Two-phase collision timer (10-turn alarm, 20-turn post-alarm)
- [x] 4 NPCs with behavior systems (Reed, Vasik, Okafor, Lis)
- [x] SOMS AI terminal with stage-driven responses
- [x] 18 custom actions (6 docking + 12 original)
- [x] Escape Alone ending (tested)
- [x] Override AI ending (tested)
- [x] Browser client with sci-fi green terminal theme
- [x] Nautical directions (fore/aft/port/starboard) replacing compass directions
- [x] Regions API adopted: 4 regions with `reg-*` IDs; `region_entered` event drives boarding detection
- [x] Event handlers use the canonical `world.registerEventHandler()` pattern (no more `chainEvent`)
- [x] Pinned to `@sharpee/*` 0.9.113 across the board
- [x] Scenes API — 4 scenes (alarm, collision-approach, seal-window, atmosphere) via `world.createScene()`
- [x] `world.createDoor()` for all 3 doors (airlock, bridge, cargo hold)
- [x] NPC behavior text extracted to language provider (`NpcText` ~30 message IDs)
- [x] Event factories — `createEvent()` from `@sharpee/core` replaces raw event objects in plugins
- [x] Action phase discipline — state mutations in `execute()`, prose in `report()`
- [x] Transcript assertions — `[STATE:]` for location/inventory, `[EVENT:]` for endings and key actions
- [x] Walkthrough chaining — `$save wt-01` in escape-alone walkthrough
- [x] 197/197 tests passing (re-baselined after guide compliance pass)

### In Progress
- [ ] Destroy ending (reactor overload → escape — mechanics exist, needs polish)
- [ ] Escape With Survivors ending (NPC trust system needed)

### Planned
- [ ] Secret Merge With AI ending (empathy score tracking)
- [ ] Elevator repair puzzle (cryo deck access)
- [ ] Cargo hold code puzzle (pathogen reveal)
- [ ] NPC patrol movement (Reed, Lis)
- [ ] AI spreading — dynamic terminal/speaker/camera additions
- [ ] Reactor warming — lower deck description changes
- [ ] SeededRandom procedural generation
- [ ] Food/eating mechanics
- [ ] Combat system (optional encounters)
- [ ] Save/restore functionality
- [ ] Score reveal at end

<!-- ============================================================
     SDLC WORKFLOW
     This section is universal. It works across any project that
     uses GitHub Issues + Projects for tracking.

     Source: https://github.com/Johnesco/sdlc-baseline
     ============================================================ -->

## Instructions for Claude

### Roles and Responsibilities

| Role | Owner | Board Columns | Key Rule |
|------|-------|---------------|----------|
| **PO** (Product Owner) | Human | Backlog, Done | Decides priority, accepts work |
| **BA** (Business Analyst) | Human or Claude | Backlog, Ready | Scopes tickets, writes acceptance criteria |
| **Dev** (Developer) | Claude (primary) | In Progress | Writes code, follows conventions |
| **Documenter** | Claude (bundled with Dev) | In Progress | Updates spec, CLAUDE.md, README |
| **QA** (Quality Assurance) | **Human (always)** | **Verify** | Verifies completed work |

> **The most important rule: Claude cannot QA its own work.** The Verify column is always human-owned. The person or AI that wrote the code is not qualified to verify it.

**Hat-switch protocol:** When working with Claude, explicitly state which role you're in to keep the interaction predictable:
- `"PO hat — let's prioritize the backlog."`
- `"BA mode — help me scope this feature."`
- `"Dev time — implement ticket #12."`
- `"QA check — I'm testing what you built."`

### Ticket-First, Documentation-Aware Workflow (MANDATORY)

Every software change — feature, bug fix, refactor, or data update — follows this sequence. No step may be skipped.

The **design documents** (`docs/game-design.md`, `docs/puzzles-and-items.md`, `docs/room-map.md`) are the authoritative record of all game features, behavior, and mechanics. They are the single source of truth for what this game does.

**Before ANY change**, follow these steps in order:

1. **Capture as a ticket** — Create a GitHub Issue describing the change before any other work begins. Include a clear title, relevant labels, acceptance criteria, and an associated **milestone**. Every issue must belong to an existing milestone by the time it ships; if no existing milestone fits, create a new one. No code is written without a ticket.

   > **IMPORTANT — Add to Project Board:** After creating the issue, you **must** also add it to the GitHub Projects board. The `gh issue create` command does **NOT** auto-add issues to the project board. Run this immediately after creating the issue:
   > ```
   > gh project item-add 4 --owner Johnesco --url [ISSUE_URL]
   > ```
   > An issue that is not on the board is considered incomplete. This is a known gotcha — do not skip this step.

2. **Review documentation for affected areas** — Read the sections of the design docs (and other docs like CLAUDE.md, README.md) that describe the area being changed. Identify what exists, what will be impacted, and note any discrepancies.

3. **Flag discrepancies** — If existing code already differs from what the documentation says, stop and flag the mismatch for validation before proceeding. Do not silently "fix" documentation to match code or vice versa without explicit confirmation.

4. **Refine the ticket** — Based on the documentation review, update the GitHub Issue with additional context, affected doc sections, and a plan for documentation updates. The ticket should reflect the full scope of work including doc changes.

5. **Implement the change** — Write the code. Reference the ticket number (`#XX`) in commits.

6. **Update all documentation** — Update the design docs, CLAUDE.md, README.md, and any other affected docs so they accurately reflect the new state. This is not optional — a change is not complete until its documentation is current.

7. **Verify consistency** — After updating, confirm that the documentation and code are in agreement. Any remaining gaps must be called out explicitly.

**Key rules:**
- No code without a ticket — every change starts as a GitHub Issue
- A change without a corresponding documentation update is considered **incomplete**
- Documentation updates are part of the definition of done, not a follow-up task
- When in doubt about whether docs need updating, they do
- The design docs are the primary documents; CLAUDE.md and README.md are secondary but must stay consistent

### Compressing Steps for Small Changes

Not every change needs the full ceremony. Here's when you can compress:

- **Data-only changes** (adding a record, fixing a typo): Steps 2-4 can compress into a quick scan. Still need a ticket (Step 1) and human verification (Step 7).
- **Bug fixes with obvious cause**: Step 2 becomes "confirm the spec describes the expected behavior." Steps 3-4 can compress into a single issue comment.
- **Documentation-only changes**: Step 5 becomes "edit the docs" instead of "write code." Step 6 is the main deliverable.
- **When NOT to compress**: New features, changes affecting multiple files, changes where you're unsure about existing behavior, anything that modifies player-facing behavior.

### When Making Changes
1. **Ticket first** — Follow the workflow above before all else
2. **Read before editing** — Always read files before modifying them
3. **Follow existing patterns** — Match the coding style already in use
4. **Keep it simple** — Avoid over-engineering

### Maintaining Documentation

**UPDATE the design docs** when you:
- Add, modify, or remove any game feature
- Fix a bug that changes observable behavior
- Change puzzle chains, room connections, or item placement
- Alter NPC behavior or dialogue

**UPDATE CLAUDE.md** when you:
- Add new features or source files
- Change the file structure
- Modify architectural patterns
- Make significant design decisions

**UPDATE README.md** when changes affect:
- Public-facing feature descriptions
- Setup or usage instructions
- Project overview

## Development Workflow

### GitHub Issues & Projects

All work is tracked in **GitHub Issues** with a **GitHub Projects** kanban board.

- **Issues** = All work items (features, bugs, docs, tasks, spikes)
- **Labels** = Type (`feature`, `bug`, `docs`, `task`, `spike`) + Area (`area:frontend`, `area:backend`, etc.) + Priority (`priority:high`, `priority:low`) + Resolution (`resolution:wontfix`, `resolution:duplicate`, etc.)
  - Resolution labels are only applied when closing an issue **without completing the work**. No resolution label = completed.
- **Milestones** = Major feature areas. Every issue must have a milestone by the time it ships. If no existing milestone fits, create a new one.
- **Projects board** = Visual kanban for tracking status (Project #4)

### Board Columns

| Column | What's Here |
|--------|-------------|
| **Backlog** | Captured; refinement happens here (doc review, scope, AC) |
| **Ready** | Acceptance criteria finalized, ready to build |
| **In Progress** | Actively being coded |
| **Verify** | Code complete, awaiting human testing |
| **Done** | Verified and accepted |

### Board Automations (GitHub Projects Workflows)

These transitions are handled automatically by GitHub Projects:

| Trigger | Sets Status To |
|---------|---------------|
| Item added to project | **Backlog** |
| Item reopened | **In Progress** |
| Item closed | **Done** |
| Pull request merged | **Done** |

These transitions are **manual** and must be set during the workflow:

| Transition | When to Move |
|------------|-------------|
| Backlog → Ready | Refinement checklist complete, acceptance criteria finalized |
| Ready → In Progress | When coding begins |
| In Progress → Verify | When code is complete, awaiting testing |

### Commit Convention

```
#XX: description
```

Where `XX` is the GitHub Issue number. Use `Fixes #XX` in PR body for auto-close.

### Branch Naming

```
[type]/[short-description]
```

| Prefix | Use for |
|--------|---------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes |
| `task/` | Refactors, tooling, dependencies |
| `spike/` | Research, investigation |

### Building and Testing

```bash
npx sharpee build              # Compile + bundle + browser client
npx sharpee build --test       # Build and run all transcript tests
```

Preview locally via Portman:
```bash
python C:\code\portman\portman.py add no-signal-home dist\web
```

<!-- ============================================================
     END SDLC WORKFLOW
     ============================================================ -->

## Project History

### Recent Changes
- 2026-04-28: Engine bump to 0.9.113 — ADR-158 lang-articles (no story changes needed), save-restore engine format v2.0.0, ADR-162 StatusLine reads ScoreLedger. 197/197 tests passing.
- 2026-04-17: Guide compliance pass (#15–#20) — Scenes API for timed events, `world.createDoor()` for all doors, NPC text to language provider, event factories in plugins, action phase discipline, STATE/EVENT transcript assertions, walkthrough chaining. 197/197 tests passing.
- 2026-04-16: Test suite restored to 197/197 green — installed `@sharpee/sharpee@0.9.111` CLI locally (npx was resolving to a cached 0.9.92), reverted transcript command lines from nautical to compass as a temporary workaround for an upstream gap (see Architecture Decisions → Nautical directions). Game-facing prose, room descriptions, and NPC dialogue still use nautical words; only the test/walkthrough `> aft`/`> fore` inputs changed.
- 2026-04-15: Modernization pass — adopted Regions API (Tug + 3 Stillwater decks, 26 room assignments, `if.event.region_entered` boarding handler), converted last `chainEvent` to `registerEventHandler`, bumped all `@sharpee/*` deps to 0.9.111, preview served from canonical `dist/web/`, CLAUDE.md room count corrected 25→26
- 2026-04-03: Nautical directions — fore/aft/port/starboard replacing compass directions, engine patches via patch-package, all docs and tests updated
- 2026-03-31: Opening sequence — alarm, docking puzzle, seal degradation, MemoryTrait, 139 tests passing
- 2026-03-30: Initial game implementation — 26 rooms, 4 NPCs, 12 actions, 2 endings tested, 96 tests passing

### Architecture Decisions
- One file per concern (world, npcs, actions, grammar, language, plugins, interceptors, types)
- All player-facing text through language layer message IDs — never hardcoded English
- Four-phase action pattern (validate/execute/report/blocked) for all custom actions
- Walkthrough tests for full ending paths, unit tests for exploration and mechanics
- MemoryTrait flavor text via turn plugin (not event chain — chains replace events)
- Reactive state updates use `world.registerEventHandler` (the canonical pattern); `chainEvent` is legacy and not used in this project
- Docking controls examine gate via `registerEventHandler('if.event.examined')` — sets `DOCKING_CONTROLS_EXAMINED` on first examine of the `docking-controls` prop
- Regions API groups the 26 rooms into four regions — `Regions.TUG`, `Regions.LOWER_DECK`, `Regions.MID_DECK`, `Regions.UPPER_DECK` — assigned in `world.ts`; boarding the Stillwater is detected from `if.event.region_entered` (the `going` action in stdlib emits these on region crossing). A location-based fallback in the boarding plugin remains for defense-in-depth.
- Airlock blocking via door lock mechanism with dynamic lockedMessage updates per docking state
- Nautical directions via patch-package — two of three layers live: (1) `lang-en-us/data/words.js` + `language-provider.js` expose `fore`/`aft`/`port`/`starboard` as direction synonyms, (2) `parser-en-us/direction-mappings.js` (`DirectionWords`, `DirectionAbbreviations`, `parseDirection`) accept the nautical tokens. **Layer 3 is an upstream gap**: `@sharpee/parser-en-us/grammar.js:164-181` hardcodes a compass-only direction map inside `grammar.forAction('if.action.going').directions({...})` that doesn't read from the language provider, so bare-word input like `> aft` parses as DIRECTION but finds no matching grammar rule ("I don't understand that"). The engine fix is to drive that `.directions(...)` call from `language.getDirections()`. Pending that, test/walkthrough transcripts use compass inputs (`> south` not `> aft`) while in-game prose, room descriptions, and NPC dialogue continue to use nautical words — so players see nautical text but can't type it bare-word until the engine lands the fix. When the fix ships, revert the transcripts with `sed -E 's/^> south$/> aft/; ...` across `walkthroughs/**/*.transcript` and `tests/transcripts/**/*.transcript`.
- All `@sharpee/*` packages pinned to the same minor (0.9.113); region events require stdlib ≥ 0.9.111 because the `going` action emits them
- Browser build outputs to `dist/web/` (canonical); local preview / Portman / `.claude/launch.json` all serve from there, never from `browser/`
- Scenes API: 4 scenes declared in `index.ts` via `world.createScene()`. SceneEvaluationPlugin runs at priority 60; story turn plugins that check scenes use priority 65/66 (> 60). `SceneTrait.activeTurns` tracks how many turns a scene has been active. Deep-importing `SceneTrait` fails at esbuild bundle time (exports map restriction) — use string-based trait access: `scene.get('scene' as any)`.
- `world.createDoor()` helper replaces manual door entity creation for all 3 doors. Post-creation customization via `door.get(LockableTrait)` for lockedMessage, `door.add(new ShipPropTrait(...))` for interceptor targeting. Reduced ~80 lines of boilerplate.
- NPC behavior text: all ~30 NPC idle/meeting strings extracted to `NpcText` const in `language.ts`, registered as `npc.behavior.KEY` message IDs. Behavior pools typed as `(keyof typeof NpcText)[]`. Zero hardcoded English in `npcs.ts`.
- Event factories: `createEvent()` from `@sharpee/core` used in `plugins.ts` via `msg()` and `ended()` helpers. Zero `as any` casts for event construction. Imported via `@sharpee/plugins` (added to dependencies).
- Action phase discipline: state mutations only in `execute()`, prose/events only in `report()`. Shared data between phases via `ctx.sharedData`. `report()` methods are pure event producers.
- Transcript assertions: `[STATE: true, yourself.location = Room Name]` for location, `[STATE: true, yourself.inventory contains item]` for inventory, `[EVENT: true, type="game.ended" reason="victory"]` for endings, `[EVENT: true, type="action.success" messageId="..."]` for key actions. Note: player entity is named "yourself" (not "player") — use "yourself" in all STATE expressions.
