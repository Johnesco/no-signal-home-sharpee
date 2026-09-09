# No Signal Home — Chord edition

`no-signal-home-sharpee.story` at the repo root is the game, written in
**Chord**, Sharpee's declarative story language. The TypeScript edition that
came first is kept in `legacy/` as the behavioural reference until the Chord
edition overtakes it. This file records what carried over, what changed, and
the decisions still open.

Status: **gate-clean at Chord 3.6.0** (migrated 2026-09-08, ticket #32) with
the full 26-room map, Act 1 including all five opening outcomes, the NPC
conversation tables, the keycard path, the cable cut, and two endings
(Escape Alone, Override The AI) ported from the TypeScript edition.

```bash
npx sharpee compose --check no-signal-home-sharpee.story
npx sharpee test
python ../tools/build.py no-signal-home-sharpee --force
```

## Migration from the 3.0.0 draft

The 2026-07 draft (`legacy/story/no-signal-home.story`) failed 19 load gates
at 3.6.0, all mechanical: `authors:` is a list, one name per line; rule heads
name the actor (`after the player entering`, not `after entering it`);
`create the player` is gone, replaced by a named `playable` character and a
`before the game starts` block. Three runtime findings followed: a door that
should stand open needs `openable` plus `starts open`; a lockable container
needs `starts locked`; and `readable` scenery needs an `on the player
reading` clause or READ prints nothing. The docking verbs gained the
phrasings the TypeScript transcripts use (`fire thrusters`, `extend arm`,
`take helm`, `pressurize airlock`). A pattern that says `the <word>` declares
a grammar slot, so those phrasings are literal words only.

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

### 1. Nautical directions are compass-only until #34 lands

Chord's direction set is closed: eight compass points plus `up`/`down`. The
TypeScript build got `fore`/`aft`/`port`/`starboard` from two npm patches
(`legacy/patches/`) plus bare-word command patterns in `legacy/src/grammar.ts`.
The shipped Chord edition keeps the nautical prose and takes compass input,
using the mapping in `docs/room-map.md` (fore = north, aft = south,
port = west, starboard = east).

A spike on 2026-09-08 showed the gap is not an engine gap after all: an
`extend action going` block with bare-word patterns (`fore` /
`means direction north`, and so on, plus the `go fore` forms) passes
`compose --check` and plays correctly at Chord 3.6.0. Implementation, the
phrase-catalog wording, and a nautical test branch are ticketed as #34.

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

### 5. One file, for now — but the blocker is gone

**Resolved in Chord 3.0.0.** This originally said general `import "<file>"` was
parked in the grammar with only `import phrasebook "<file>"` available. That
inverted: `import "<file>"` is now *the* single generalized form (ADR-251) and
the `phrasebook` sub-word has been removed. The `import` line's position is the
spliced content's arbitration position, and `.chord` is assumed — so it is
`import "characters"`, not the filename.

So splitting this story is now possible. It stays one file by choice: at ~1,100
lines that's still comfortable, and the TypeScript edition's split (`zoo-map`,
`zoo-items`, `characters`, `events`, `scoring`, `language`) is the obvious
shape to copy when it stops being comfortable.

### 6. Room prose follows the style guide, not the old descriptions

`docs/writing-style.md` says don't describe exits — the game lists those. The
TypeScript room descriptions do describe them ("The airlock is fore. The
corridor stretches aft."). The Chord descriptions follow the style guide. This
is a visible prose change on every room; revert it if the old text was
deliberate.

---

### 7. `{br}` marks line structure, not paragraphs (2026-09-09)

The port mapped every `
` in the TypeScript strings to `{br}`, so a `

` paragraph gap became `{br}` on the sentence plus a lone `{br}` line. Chord's paragraph break is a blank line, in phrase bodies and `define phrases` entries as much as in descriptions, so those sixteen markers were replaced with blank lines: the alarm-dies, manifest-text and journal-text phrases, and the alarm-collision, watched-collision and bad-seal-death endings. The nine that remain are hard breaks in texts whose line structure is the point: the nav computer's tag, the manifest header, the seal readout, the biohazard sign and the wayfinding signage. Verified by the tests document (143 cards) and by replaying the affected texts.

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
