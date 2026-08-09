# No Signal Home — Chord edition

`no-signal-home.story` is the game rewritten in **Chord**, Sharpee's declarative
story language. The TypeScript source in `../src/` is the original — it predates
Chord and stays in place, untouched, until this edition overtakes it.

Status: **gate-clean at Chord 3.0.0.** 76 entities, 26 rooms, all reachable.
Act 1 (wake → dock → board → lose the tug) is fully playable logic; Acts 2–3
are a walkable map with stubbed systems.

```bash
npx sharpee compose --check story/no-signal-home.story
```

---

## Building and checking

`@sharpee/devkit` (which owns the `compose` CLI) is on npm as of 4.5.0, so the
real toolchain works here. It is a devDependency; npm nests its own `@sharpee/*`
4.5.0 copies under it, leaving the `0.9.113` runtime deps that `../src/` builds
against untouched at the top level. Both `npm run build` and `compose --check`
pass side by side.

The old `chord-check.sh` / `chord-check.js` pair — which compiled the
dependency-free compiler out of the read-only fork into a gitignored
`story/.chordc/` — is **retired and deleted**, exactly as this file said it
should be "the day the platform lands on npm."

**Version note:** the reference docs in the fork
(`docs/reference/chord-language.md`) still describe Chord **1.4.0**; the
compiler reports **3.0.0**. The source is well ahead of its own prose docs, so
prefer `chord-grammar.md` and the catalog in `packages/chord/src/catalog.ts`
when they disagree with the reference.

**Migrated to Chord 3.0.0 (ADR-298, the fielded story block).** The 1,094-line
body needed no changes across the 2.1.0 → 3.0.0 major bump; only the header
moved:

| Was (2.x) | Now (3.0.0) |
|---|---|
| `story "Title" by "Author"` | bare `story`, then `title:` and `authors:` |
| `version:` | `story-version:` |
| `blurb:` | `description:` |
| *(absent)* | `ifid:` — required for publishing (ADR-284); minted one here |

The header now takes exactly: `title`, `authors`, `testers`, `ifid`, `id`,
`story-version`, `prologue`, `description`, `client`, `theme`, `template`,
`themes`, `default-theme`, `storage-prefix`, plus `states`/`score`/`use`/`on`
lines.

---

## What carried over as-is

| System | TypeScript | Chord |
|---|---|---|
| 26 rooms, 4 regions | `world.ts` factories + `assignRoom` | `create … a room` / `a region` + `containing` |
| Exit graph | `connectRooms` | direction lines (verified identical, including the one-way shaft→engine shortcut) |
| Gated doors | `world.createDoor` + `LockableTrait` | `a door, lockable with the <key>` + `through` on the exit line |
| Boarding detection | `if.event.region_entered` handler | Lower Deck region's `after entering it, once` |
| Collision timers | two scheduler fuses | `define sequence` with `at turn N` / `N turns later` |
| Deaths | custom death actions | `kill the player <key> when <condition>` |
| `MemoryTrait` + interceptors | trait + registered interceptor per entity | `after examining it, once` on the entity |
| NPC behaviors | `plugin-npc` + `getAllBehaviors()` | core NPC adjectives — `passive`, `guard`, `wanderer with move-chance 30` |
| NPC conversation | custom actions | `define topics for <person> … end topics` |
| Score | `setMaxScore` + `awardScore` | `use scoring` with owner-attached `score` lines and a rank ladder |

Roughly 1,100 lines of Chord against 3,500 lines of TypeScript, and the Chord
version reads like the design docs.

---

## Decisions worth reviewing

These are calls I made where Chord could not do what the TypeScript did. Each
is a real change to the game, not a translation detail.

### 1. Nautical directions no longer work as input — **biggest open item**

Still open as of Chord 3.0.0 — `DIRECTIONS` in `packages/chord/src/parser.ts`
is unchanged.

Chord's direction set is closed: eight compass points plus `up`/`down`. The
TypeScript build gets `fore`/`aft`/`port`/`starboard` from two npm patches
(`patches/@sharpee+lang-en-us+*.patch`, `patches/@sharpee+parser-en-us+*.patch`)
plus bare-word command patterns in `src/grammar.ts`. Chord has no hook for any
of that — `define verb` maps a surface verb onto an existing *action pattern*,
which is not the same thing as minting a direction token.

The map uses the mapping already documented in `docs/room-map.md`
(fore = north, aft = south, port = west, starboard = east), and the prose still
speaks nautically. But the player has to type `NORTH`.

Three ways out, your call:
- keep the patches and have the story loader apply them (patches survive; Chord
  just doesn't know about them);
- ask upstream for author-declarable direction vocabulary — this is a genuine
  language gap and the game is a good argument for it;
- accept compass input and drop the nautical conceit from prose too.

### 2. The alarm no longer blocks actions

`docs/opening-sequence.md` has the alarm gate almost every verb with a hint
pointing at the cockpit, implemented as a pre-validate action interceptor.
Chord has no global interceptor, and the only whole-room verb catcher is
`deadly:`, which exists for death.

Replaced with a story-header daemon:

```
on every turn while the proximity alarm is screaming
  phrase alarm-nag
end on
```

Three cycling nag lines, and the 10-turn clock still kills you. The alarm
phase now *pushes* instead of *blocks*. Playtest whether that keeps the
pressure — if it doesn't, the interceptor is an argument for a language
feature, not a reason to keep the TypeScript.

### 3. Docking is entity states, not `define machine`

Chord has `define machine` (used by `stories/fernhill`), but its triggers are
action-on-entity — `when pushing the primer plunger: primed`. The docking verbs
are objectless (MANEUVER, BRAKE, CONNECT, SEAL), and the refusal messages need
to *read* the current phase, which machine state doesn't expose to conditions.

So the phase lives as four one-way states on `the docking controls`
(`approach → maneuvered → connected → sealed`), which `must` requirements and
`when` suffixes read directly. Same four states as the design doc's state
machine, same forgiveness on out-of-order verbs.

`define machine` is a better fit for the reactor power-routing puzzle later —
that one really is valves and switches being turned.

### 4. The two quality flags became things you can look at

Chord actively refuses boolean and negated state pairs
(`analysis.boolean-state`, `analysis.negated-state`): a state has to name what
something *is*, never the absence of something else. So:

- `braked` → **the thrusters**, `cold` / `burned`
- `checkedPressure` → **the pressure readout**, `idle` / `live`

This is better than what it replaced. Both facts are now objects in the cockpit
you can examine, and the seal-failure branch reads as
`phrase tug-stays when the thrusters is burned`.

Same treatment for the "examined the controls" gate: it lives on
**the instrument panel** (`dark` / `live`), lit by examining the docking
controls.

### 5. One file, for now

General `import "<file>"` is parked in the grammar — only
`import phrasebook "<file>"` exists today. So this is one file until that
lands. At ~1,100 lines that's comfortable; phrasebooks are the release valve
when the text volume grows.

### 6. Room prose follows the style guide, not the old descriptions

`docs/writing-style.md` says don't describe exits — the game lists those. The
TypeScript room descriptions do describe them ("The airlock is fore. The
corridor stretches aft."). The Chord descriptions follow the style guide. This
is a visible prose change on every room; revert it if the old text was
deliberate.

---

## Stubbed, not implemented

Deliberate placeholders, all reachable-but-inert:

- **Cargo Hold** is behind `the cargo access code`, which is created but *not
  placed* — out of play until the Vasik/Okafor trade exists.
- **Cryo Bay** is behind the broken elevator. `the elevator parts` exist in the
  Storage Annex; nothing consumes them yet.
- **NPC arcs.** Reed/Vasik/Okafor/Lis carry their declared decline and agenda
  states (`steady, glitching, lucid, turned` etc.) with nothing driving the
  transitions. Each has a small topic table for voice.
- **SOMS** is a scenery terminal in the Library with a greeting. No lore
  system, no comms request, no mask drop, no interface escalation.
- **No endings** beyond the three deaths. No pathogen, no infection, no combat,
  no food maker, no acts 2–3.

---

## Suggested next slice

In rough order of value:

1. **Settle the direction question (§1).** Everything downstream inherits it.
2. **Play the tug.** All five opening outcomes are implemented — best dock,
   rough dock, bad-seal death, and both collision deaths. Walk each one and
   check whether the alarm phase still has teeth without action blocking (§2).
3. **Port the walkthroughs.** `../tests/transcripts/` and
   `../walkthroughs/wt-01-escape-alone.transcript` should mostly transfer;
   direction words and the alarm-blocking assertions are what will break.
4. **SOMS.** The AI is the spine of Acts 2–3 and `define topics` plus story
   states is most of the lore system. Good next system, and it makes the
   Library worth visiting.
5. **The elevator and the cargo code**, to open the two gated rooms and make
   Okafor and Vasik matter.
