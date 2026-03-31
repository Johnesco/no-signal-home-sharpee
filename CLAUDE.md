# No Signal Home — Claude Project Memory

> This file serves as persistent context for Claude Code sessions. It is automatically read at the start of every conversation. Keep this document updated as the project evolves.

## Project Identity

**Name:** No Signal Home
**Purpose:** Sci-fi salvage horror interactive fiction game built with Sharpee
**Target Users:** Players of text adventure / interactive fiction games
**Repository:** https://github.com/Johnesco/no-signal-home
**Project Board:** https://github.com/users/Johnesco/projects/4

## Project Context
This is a Sharpee interactive fiction game (TypeScript). It's a sci-fi salvage horror set on a derelict corporate freighter called The Stillwater. The player is a stowaway convict (smuggler/hacker) trapped aboard.

## Design Documents
All design docs are in `docs/`:
- `game-design.md` — master design doc: plot beats, NPCs, AI system, endings, mechanics
- `room-map.md` — 25 rooms across 3 decks with ASCII map and object/NPC placements
- `puzzles-and-items.md` — every puzzle chain, item inventory, dependency graph, endgame paths

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
- 25 rooms, 3 decks (Lower/Mid/Upper)
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

## File Structure Overview

```
no-signal-home/
├── CLAUDE.md              # THIS FILE
├── README.md              # Public documentation
├── package.json           # Dependencies (@sharpee/*)
├── tsconfig.json          # TypeScript config
├── .github/
│   ├── ISSUE_TEMPLATE/    # sdlc-baseline issue templates
│   └── PULL_REQUEST_TEMPLATE.md
├── browser/
│   ├── index.html         # Web client shell
│   └── styles.css         # Sci-fi terminal theme
├── docs/
│   ├── game-design.md     # Master design doc
│   ├── room-map.md        # 25 rooms, ASCII map
│   ├── puzzles-and-items.md # Puzzle chains, items
│   ├── npcs.md            # NPC details
│   ├── procedural-systems.md # SeededRandom systems
│   └── writing-style.md   # Prose guidelines
├── src/
│   ├── index.ts           # Story class, lifecycle wiring
│   ├── types.ts           # IDs, messages, traits, helpers
│   ├── world.ts           # 25 rooms, items, scenery
│   ├── npcs.ts            # 4 NPCs + SOMS terminal
│   ├── actions.ts         # 12 custom actions
│   ├── interceptors.ts    # 4 action interceptors
│   ├── grammar.ts         # Parser extensions
│   ├── language.ts        # All player-facing text
│   ├── plugins.ts         # 7 turn plugins
│   └── browser-entry.ts   # Web client entry point
├── tests/transcripts/     # Unit tests (fresh game per file)
└── walkthroughs/          # Chained walkthrough tests
```

## Current Feature Status

### Implemented
- [x] 25 rooms across 3 decks with full connectivity
- [x] 19 portable items, 3 doors, ~50 scenery objects
- [x] 4 NPCs with behavior systems (Reed, Vasik, Okafor, Lis)
- [x] SOMS AI terminal with stage-driven responses
- [x] 12 custom actions (pry, repair, cut cables, override, overload, launch pod, etc.)
- [x] Escape Alone ending (tested)
- [x] Override AI ending (tested)
- [x] Browser client with sci-fi green terminal theme
- [x] 96 transcript tests passing

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
- 2026-03-30: Initial game implementation — 25 rooms, 4 NPCs, 12 actions, 2 endings tested, 96 tests passing

### Architecture Decisions
- One file per concern (world, npcs, actions, grammar, language, plugins, interceptors, types)
- All player-facing text through language layer message IDs — never hardcoded English
- Four-phase action pattern (validate/execute/report/blocked) for all custom actions
- Walkthrough tests for full ending paths, unit tests for exploration and mechanics
