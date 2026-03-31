# No Signal Home — Claude Instructions

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
