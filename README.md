# No Signal Home

A sci-fi salvage text adventure built with [Sharpee](https://www.sharpee.net), the TypeScript interactive fiction framework.

## Premise

Far future. You're a convict — smuggler and hacker — who escaped a prison transport by stowing away on a salvage tug. The tug docks with *The Stillwater*, a corporate freighter that's been drifting for years. Before you can plan your next move, the docking clamp fails. You're trapped on a dead ship.

Except it's not dead. Systems are flickering on. An AI is waking up. Four survivors are aboard, each with their own problems. And the cargo this ship was hauling to a military buyer — a bioweapon, an AI core, and hundreds of frozen prisoners — is the reason everything went wrong.

Figure out what happened. Decide what matters. Get out alive. Maybe.

## Game Details

- **Length:** 3-4 hours per playthrough
- **Rooms:** 26 across 4 regions (2-room tug + 3 Stillwater decks)
- **NPCs:** 4 survivors + an AI with its own agenda
- **Endings:** 5 (4 main + 1 secret)
- **Combat:** Optional — every encounter has a non-violent alternative
- **Style:** Classic 80s IF feel — short descriptions, compass movement, deep mechanics

## Why Sharpee?

This game is designed as a showcase for Sharpee features that are difficult or impossible in Inform 7:

- **NPC behavior plugins** — an engineer with a 4-stage infection arc, a prisoner with territory awareness, an AI-puppet with intermittent control
- **Combat system** — CombatantTrait and WeaponTrait for optional tactical encounters
- **State machines** — reactor power routing, elevator repair, AI personality arc
- **Daemon/fuse scheduler** — timed ship arrival, containment failure, reactor temperature
- **Semantic events** — AI lore system driven by typed events, not just text output
- **NPC knowledge tracking** — NPCs remember what you've done and adjust behavior
- **Action interceptors** — puzzle-specific overrides without modifying the standard library

## Project Structure

```
no-signal-home/
├── docs/
│   ├── game-design.md         # Full design doc — plot, NPCs, endings, mechanics
│   ├── room-map.md            # 26-room map with ASCII layout (4 regions)
│   ├── puzzles-and-items.md   # Puzzle chains, item locations, dependency graph
│   ├── npcs.md                # NPC details — names, dialogue, behaviors, Sharpee implementation
│   ├── writing-style.md       # Prose rules, voice samples, corporate satire tone
│   ├── procedural-systems.md  # Seeded procedural generation, state-reactive descriptions
│   └── guidance-system.md     # Player guidance system — memories, interruptions, recalls, nudges
├── src/                       # Sharpee story source (TypeScript)
├── tests/                     # Transcript tests
└── walkthroughs/              # Full walkthrough transcripts
```

## Status

**Design phase complete.** All design docs written. Implementation has not started.

### Next Steps
- [x] NPC details — names, dialogue topics, behavior arcs, Sharpee implementation notes
- [x] AI conversation system — topics, personality stages, lore response table
- [x] Writing style guide with sample room/NPC/AI descriptions
- [x] Procedural systems — seeded generation, state-reactive descriptions, testing integration
- [ ] Scaffold Sharpee project (package.json, tsconfig, story class)
- [ ] Implement regions (Lower Deck, Mid Deck, Upper Deck)
- [ ] Implement NPCs and behaviors
- [ ] Implement puzzle logic and item interactions
- [ ] Implement AI lore/conversation system
- [ ] Implement timed events (ship waking, tug detach, containment)
- [ ] Implement endings
- [ ] Transcript tests for each puzzle and ending
- [ ] Full walkthrough transcripts

## Building

*Not yet buildable — implementation pending.*

```bash
# When ready:
npm install
npx sharpee build
```

## License

MIT
