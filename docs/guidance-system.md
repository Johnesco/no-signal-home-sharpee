# No Signal Home — Guidance System Design

**Status:** Design draft, awaiting PO sign-off
**Ticket:** TBD (implementation tickets filed per phase after acceptance)
**Milestone:** Core Systems

---

## 1. Purpose & Scope

The opening sequence on the tug uses a mix of techniques to tell the player what to do next without railroading them: strong self-talk nags during the alarm, a mid-turn interruption when the seal fails ("a deep crack from behind..."), introspective memories on first-examine of flavor objects, and state-dependent descriptions. These work — but each is a bespoke plugin. There is no shared vocabulary, no reusable shape, and no way for a designer (or another Sharpee author) to add a new nudge without writing a new plugin and hand-wiring state predicates.

This document proposes a unified **Guidance System** for all player-facing prompts in No Signal Home. It extends the existing `MemoryTrait` rather than replacing it. The system is designed to be:

1. **Data-driven.** Adding a new memory, hint, interruption, or nudge is a registry entry, not a new plugin.
2. **Environment-reactive.** Entries fire when world state matches a predicate. No hard-coded puzzle trees, no sync problems.
3. **Reusable.** The pattern is portable — any Sharpee story can copy the shape and drop in its own guidance registry.

**Out of scope:**
- Engine changes to Sharpee core. Everything runs on existing `TurnPlugin`, trait, and event-handler primitives.
- Nautical-directions support (paused; see CLAUDE.md Architecture Decisions).
- AI character dialogue. The SOMS terminal is diegetic and topic-driven; guidance is meta-nudging. See Section 12, Open Questions.

---

## 2. Terminology

The user's original framing used four overlapping terms: memory, hint, guide, interruption. Settled vocabulary:

| Term            | Meaning in this doc                                                                 |
| --------------- | ----------------------------------------------------------------------------------- |
| **Guidance**    | Umbrella. Any designer-authored text surfaced to nudge or inform the player.        |
| **Memory**      | Guidance triggered by an action on an entity. Fires once. (Existing `MemoryTrait`.) |
| **Interruption** | Guidance triggered by a state change mid-turn. The hissing-air case.               |
| **Recall**      | Guidance triggered by an action when a prior state is true. "Got out just in time."|
| **Nudge**       | Guidance triggered by N idle turns with no puzzle progress.                        |

**Key assertion:** these are four *trigger types*, not four data types. One record schema covers all of them. The differences are in when they fire, not in what they contain.

---

## 3. Trigger Taxonomy

Every Guidance entry declares one trigger type. The system already has infrastructure for three of the five; only `idle` and `recall` require new code.

| Trigger       | Fires when                                                        | Existing example                                      | Infrastructure          |
| ------------- | ----------------------------------------------------------------- | ----------------------------------------------------- | ----------------------- |
| `action`      | Action with matching ID executes on matching target (and succeeds) | Examine the flashlight → backstory memory            | Exists — `story.memory` plugin (`src/plugins.ts:26-48`) |
| `event`       | Engine semantic event fires (e.g. `if.event.region_entered`)      | Boarding detection (`src/index.ts:161-168`)           | Exists — `registerEventHandler`        |
| `stateChange` | A tracked state key flips from one value to another               | `story.seal-degradation` firing on elapsed-turns + `PLAYER_BOARDED` (`src/plugins.ts:176-248`) | Exists — turn-plugin idiom |
| `idle`        | N turns elapsed since last tracked puzzle progress                | — none yet —                                          | **New — Phase 2**       |
| `recall`      | Action + prior state predicate both true, fires once              | — none yet —                                          | **New — Phase 1**       |

**Note on overlap.** `stateChange` and `event` can both fire in response to something happening. Convention: use `event` for natural engine events (examined, region_entered, moved, taking); use `stateChange` for designer-owned state keys (`PLAYER_BOARDED`, `BRIDGE_UNLOCKED`). Fire `stateChange` guidance from the turn plugin that already sets the state key, not a separate watcher.

---

## 4. Progress Modeling: Environment-Driven, Not Tree

The user explicitly asked: *"Should we have progress move along a tree where some branches must precede others? Or driven by environment so that we don't have to 'sync' it, just trigger it?"*

**Recommendation: environment-driven.**

### Tree approach (rejected)

Every puzzle declares prerequisites. `bridgeUnlocked` requires `deskOpened` which requires `haveKey`. The guidance system walks the tree from the player's current position and suggests the nearest open gate.

- **Upside:** structural queries like "what's the next thing?" are O(1) lookups.
- **Downside:** every puzzle change = a tree edit. NSH puzzles already have multiple solution paths per gate — bridge opens via keycard *or* pry *or* hack; AI overrides via cables *or* hack *or* chip *or* logic. Tree nodes become OR-branches that are painful to maintain and duplicate the state keys we already have.

### Environment approach (recommended)

Every guidance entry is a `{condition: (world) => boolean, message, priority}` tuple. Each turn (or on matching trigger), the system scans entries, picks the highest-priority matching entry whose cooldown has elapsed, and emits its message.

- **Upside:** no graph, no prerequisites, no sync problem. NSH already runs on state-key predicates everywhere (`TUG_DETACHED`, `PLAYER_BOARDED`, `REED_STAGE`, `PATHOGEN_LEVEL`). Guidance entries read the same keys — no new modeling layer. Adding a puzzle = adding entries.
- **Downside:** you can't structurally ask "which gate is the player blocked on?" You can only ask "which guidance entry matches now?" In practice this is fine: the predicate *is* the gate check.

**Concession:** tree modeling would win if puzzles had strict ordering and no alternative paths. NSH has neither. Environment wins on both counts.

---

## 5. Next-Goal Identification

With no tree, how does the idle nudger pick the *right* hint when nothing has happened for 20 turns?

### Priority bands

Each guidance entry declares a `priority: number`. Bands by convention:

| Band     | Intent                          | Examples                                                     |
| -------- | ------------------------------- | ------------------------------------------------------------ |
| 0–99     | Flavor                          | MemoryTrait introspective prose; atmosphere lines            |
| 100–199  | Gentle nudge                    | "the ship is quiet around you"; "you haven't explored the lower deck yet" |
| 200–299  | Specific nudge                  | "that lock we passed in the common area seemed promising"    |
| 300+     | Urgent / diegetic interruption  | Seal failure, reactor overheat, collision warnings           |

### State-probe selection

The idle nudger scans the registry for entries whose `condition(world)` returns true and whose cooldown has elapsed. Among eligible entries, it picks the highest-priority one. The predicate itself encodes "this puzzle is still open":

```ts
{
  id: 'nudge.bridge.has-key',
  trigger: 'idle',
  condition: (w) =>
    w.getStateValue('player-boarded') &&
    !w.getStateValue('bridge-unlocked') &&
    w.getStateValue('desk-opened'),
  priority: 200,
  minIdle: 15,
  cooldown: 20,
  messageId: Msg.NUDGE_BRIDGE_HAS_KEY, // "You have the keycard. The bridge door was on the upper deck."
}
```

The condition says: "player has boarded, bridge is still locked, but they've already opened the desk (so they have the keycard)." This entry only fires when the player has the means but hasn't acted on it. No tree needed — the predicate *is* the logic.

---

## 6. Interruption Pattern

The hissing-air example from the user's brief — where the current turn's output is broken into by a state change — is already implemented. We just give the idiom a name.

### How it works today

`createSealDegradationPlugin` (`src/plugins.ts:176-248`) is a turn plugin with `priority: 200`. In its `onAfterAction`, it checks two state conditions (`PLAYER_BOARDED` set, `TUG_DETACHED` not set) and elapsed turns since boarding. When the elapsed count hits 3, it sets `TUG_DETACHED`, mutates entity descriptions, and returns a `game.message` event. That message renders immediately after the player's action output, which reads as a mid-turn interruption.

### How it generalizes

A Guidance entry with `trigger: 'stateChange'` declares:
- What state transition to watch (or compute from elapsed turns).
- What side-effects to perform (optional `onFire(world)` callback).
- What message to emit.

The turn plugin becomes a dispatcher: it walks the registry, checks each `stateChange` entry's predicate, fires the first matching one, and moves on. Existing interruptions (seal degradation, alarm fuse, collision) migrate to registry entries in Phase 3. The plugin code becomes trivial.

| Existing interruption                    | As registry entry                                              |
| ---------------------------------------- | -------------------------------------------------------------- |
| `story.seal-degradation` elapsed-3 fire   | `trigger: stateChange`, priority 300, predicate on elapsed     |
| `story.alarm-fuse` turn-10 collision      | `trigger: stateChange`, priority 400 (fatal), predicate on turn|
| `story.bad-seal` death-armed crossing     | `trigger: event`, event id `if.event.moved`, condition on state|

---

## 7. Recall Pattern

The "You realize you got out of there just in time" follow-up is the cleanest novel case. It's a memory that fires on an action **only if** a prior state is true.

### Shape

```ts
{
  id: 'recall.airlock.close-call',
  trigger: 'action',
  actionId: 'if.action.examining',
  targetId: 'airlock-door',
  condition: (w) => w.getStateValue('tug-detached') === true,
  once: true,
  priority: 50,
  messageId: Msg.RECALL_AIRLOCK_CLOSE_CALL,
  // "You realize you got out of there just in time. A minute later and the seal would have taken you with it."
}
```

### Assertion

Recall = action-trigger + condition + once. Once you give `MemoryTrait` an optional `condition` field, it can express this directly. All five existing tug memories fit the same schema — they simply have `condition: () => true`:

```ts
// Existing (implicit)
new MemoryTrait('if.action.examining', Msg.MEMORY_FLASHLIGHT)

// After Phase 1 extension (explicit equivalent)
new MemoryTrait('if.action.examining', Msg.MEMORY_FLASHLIGHT, { condition: () => true, replay: false })
```

Default `condition` is "always true", default `replay` is false. Existing behavior preserved.

### Recall location: trait vs registry

Two options for where recall entries live:

- **On the target entity** (extended `MemoryTrait`): O(1) lookup when the action fires, co-located with the entity. Requires one trait per entity you want to attach a recall to — fine for 5–50 entries, awkward for hundreds.
- **In a central registry** keyed by `targetId`: single source of truth, but every action triggers an O(n) scan.

**Recommendation: hybrid.** Action-triggered entries (memory, recall) live on the entity via extended `MemoryTrait`. All other trigger types (event, stateChange, idle) live in the central `src/guidance.ts` registry. An entity with multiple recalls gets multiple `MemoryTrait` instances — the trait system already supports this via the `type` discriminator.

---

## 8. Idle Escalation

Idle nudges are the user's progressive-hint case: after N turns of no progress, nudge gently; after more, nudge specifically.

### Progress tracking

Add a new state key: `LAST_PROGRESS_TURN`. Update it whenever any **designer-marked progress key** flips. Not every state change counts — atmosphere flavor like `ship-creak-turn` shouldn't reset the idle counter.

Define a set:

```ts
export const PROGRESS_KEYS = new Set<string>([
  StateKeys.TUG_DETACHED,
  StateKeys.PLAYER_BOARDED,
  StateKeys.DESK_OPENED,
  StateKeys.BRIDGE_UNLOCKED,
  StateKeys.CARGO_HOLD_OPEN,
  StateKeys.ELEVATOR_FIXED,
  StateKeys.COMMS_CONNECTED,
  StateKeys.COMMS_REFUSED,
  StateKeys.MET_REED,
  StateKeys.MET_VASIK,
  StateKeys.MET_OKAFOR,
  StateKeys.MET_LIS,
  // ...add each major puzzle/trust milestone
]);
```

A small helper in the world layer intercepts `setStateValue` for these keys and updates `LAST_PROGRESS_TURN` automatically. (Or: explicit calls to `markProgress()` at puzzle-completion sites. The explicit form is clearer and easier to grep for.)

### Escalation cadence

Each idle nudge entry declares a `minIdle` threshold. The nudge is eligible only when `(currentTurn - LAST_PROGRESS_TURN) >= minIdle`.

Recommended cadence for NSH (can be tuned):

| Idle turns | Band       | Example message                                                              |
| ---------- | ---------- | ---------------------------------------------------------------------------- |
| +10        | Flavor     | "The ship is quiet around you. Something must be next."                      |
| +20        | Suggestive | "You haven't been down to engineering yet. That's usually where the tools are." |
| +30        | Specific   | "That keypad in the cargo hold still needs the second half of the code."     |
| +45        | Direct     | "Find Okafor in the cargo bay. She'll know the code."                         |

Higher-`minIdle` entries get higher base priority. A 30-turn-stuck player sees the specific hint, not the vague flavor.

### Cooldown

Each entry has a `cooldown` in turns. After firing, it can't fire again for `cooldown` turns. Prevents the same nudge on repeat when the player is exploring but not progressing.

---

## 9. Reusability for Other Authors

The real deliverable: a Sharpee author adds guidance by writing tuples in one file. No engine code.

### Drop-in registry for another story

A hypothetical fantasy IF game could add its own guidance with zero NSH code:

```ts
// src/guidance.ts
import { Guidance } from './guidance-types';
import { Msg } from './types';

export const GUIDANCE: Guidance[] = [
  // Memory — first examine
  {
    id: 'memory.sword',
    trigger: 'action',
    actionId: 'if.action.taking',
    targetId: 'sword',
    once: true,
    priority: 50,
    messageId: Msg.MEMORY_SWORD, // "Your grandfather's blade. Heavier than you remember."
  },
  // Recall — conditional callback
  {
    id: 'recall.altar.blood',
    trigger: 'action',
    actionId: 'if.action.examining',
    targetId: 'altar',
    condition: (w) => w.getStateValue('killed-priest') === true,
    once: true,
    priority: 100,
    messageId: Msg.RECALL_ALTAR_BLOOD,
  },
  // Interruption — state change
  {
    id: 'interrupt.well.monster',
    trigger: 'stateChange',
    condition: (w) =>
      w.getStateValue('player-at-well') && !w.getStateValue('well-monster-surfaced'),
    onFire: (w) => w.setStateValue('well-monster-surfaced', true),
    priority: 300,
    messageId: Msg.INTERRUPT_WELL_MONSTER,
  },
  // Idle nudge — progressive hint
  {
    id: 'nudge.locked-gate',
    trigger: 'idle',
    condition: (w) => !w.getStateValue('gate-open'),
    minIdle: 20,
    cooldown: 15,
    priority: 150,
    messageId: Msg.NUDGE_LOCKED_GATE, // "The north gate is still locked. Someone must have a key."
  },
];
```

**Assertion:** once Phase 1–2 land, adding guidance is *always* data. Engine code never changes. Another author copies `src/guidance.ts`, `src/guidance-types.ts`, and the `story.guidance` turn plugin from NSH, populates their own registry, and ships.

---

## 10. Relationship to Existing MemoryTrait

Phase 1 is purely additive. No existing memory's behavior changes.

### Migration matrix

| Today                                                      | After Phase 1                                                                          |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `MemoryTrait(trigger, messageId)` — `src/types.ts:407-422` | `MemoryTrait(trigger, messageId, opts?)` where `opts?: { condition?, replay?, targetId? }` |
| 5 tug memories (flashlight, bedroll, datapad, fuel, comms) | Unchanged — they use default options (no condition, no replay, fires once)             |
| `story.memory` plugin (`src/plugins.ts:26-48`)             | Unchanged in behavior; checks `condition` before firing, respects `replay` flag        |
| No central registry                                        | New `src/guidance.ts` with `GUIDANCE: Guidance[]` for non-trait triggers               |

### Schema extension sketch

```ts
export class MemoryTrait implements ITrait {
  static readonly type = 'story.memory' as const;
  readonly type = MemoryTrait.type;
  trigger: string;
  messageId: string;
  recalled: boolean;
  // New, optional:
  condition?: (world: WorldModel) => boolean;  // default: () => true
  replay?: boolean;                             // default: false
  priority?: number;                            // default: 50 (flavor band)
  constructor(trigger: string, messageId: string, opts?: {
    condition?: (w: WorldModel) => boolean;
    replay?: boolean;
    priority?: number;
  }) {
    this.trigger = trigger;
    this.messageId = messageId;
    this.recalled = false;
    this.condition = opts?.condition;
    this.replay = opts?.replay ?? false;
    this.priority = opts?.priority ?? 50;
  }
}
```

### Plugin extension sketch

```ts
// src/plugins.ts createMemoryPlugin() — Phase 1 additions marked with //+
onAfterAction(ctx): ISemanticEvent[] {
  // ...existing checks...
  const memory = getMemory(entity);
  if (!memory || memory.trigger !== actionId) return [];
  if (memory.recalled && !memory.replay) return [];     //+ replay support
  if (memory.condition && !memory.condition(ctx.world)) return [];  //+ condition gate

  memory.recalled = true;
  return [{ type: 'game.message', data: { messageId: memory.messageId } }];
}
```

That's the whole Phase 1 code change. Four lines added.

---

## 11. Phased Roadmap

Three phases, each independently shippable and testable.

### Phase 1 — Schema extension (additive, no behavior change)

- Extend `MemoryTrait` with optional `condition`, `replay`, `priority` fields.
- Extend `story.memory` plugin to check `condition` and respect `replay`.
- Port one existing interruption to the new shape as a proof-of-concept — recommended: the seal-degradation message, as a `stateChange` entry in a new `src/guidance.ts`.
- Test: all 5 tug memories still fire exactly once on first examine (regression). New recall entry fires correctly when conditions match.

### Phase 2 — Guidance registry + idle nudger

- New file `src/guidance-types.ts` with the `Guidance` discriminated union type.
- New file `src/guidance.ts` with the `GUIDANCE: Guidance[]` registry (empty to start).
- New turn plugin `story.guidance` (priority ~100, between alarm and atmosphere):
  - Scans registry for matching entries by trigger type.
  - For idle: checks `LAST_PROGRESS_TURN`, filters by `minIdle` and `cooldown`.
  - For stateChange: evaluates predicate, fires first match per turn.
  - For event: migrated into existing event handlers, which call a helper that consults the registry.
- New state key `LAST_PROGRESS_TURN`, updated via explicit `markProgress(key)` calls at puzzle-completion sites (actions, interceptors, NPC stage transitions).
- Test: pin seed, run a transcript that idles 30 turns after boarding, assert specific nudge fires; another that progresses normally, assert no idle nudge fires.

### Phase 3 — Populate registry for NSH puzzles

- Author entries for each major gate:
  - Bridge keycard path: desk → keycard → upper corridor door.
  - Cargo hold two-half code: Okafor half + Vasik half.
  - Cryo bay elevator repair.
  - Comms relay midpoint decision.
  - Reactor access (hazmat prerequisite).
- Author recall callbacks:
  - Airlock "got out just in time" (after seal degradation).
  - Flashlight "these batteries won't last forever" (after first long dark sequence).
  - Reed "you watched them slip away" (after Reed hits TURNED stage).
- Migrate existing interruptions into the registry:
  - Seal degradation, alarm fuse, collision, bad-seal death.
- Author idle escalation nudges per cadence table in Section 8.

Out of scope for this doc: tuning values (`minIdle`, `cooldown`, exact wording). That's a content pass.

---

## 12. Open Questions

These need PO input before Phase 1 lands.

| # | Question                                                                 | Default lean                                                            |
| - | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 1 | Which state keys count as "progress" for the idle counter?              | An explicit `PROGRESS_KEYS` set. Marked sites call `markProgress()`.    |
| 2 | Multiple eligible idle entries with equal priority — how to tie-break?   | Round-robin by last-fired turn. Avoid seed dependency so tests are stable. |
| 3 | Recall entries: trait-style or central registry?                        | Hybrid — trait for action-triggered; registry for event/stateChange/idle. |
| 4 | Multiple interruptions triggering on the same turn — emit all or one?   | Emit all in priority order, separated by blank line. Matches existing multi-event turns. |
| 5 | AI (SOMS) hints — route through guidance or stay as character dialogue? | Stay separate. SOMS is diegetic and topic-driven; guidance is meta-nudging. |
| 6 | Player opt-out (`HINTS OFF` command)?                                   | Not in v1. Flag for post-v1 QOL.                                        |
| 7 | Scoring bonus for solving without ever triggering a nudge?              | Out of scope for this system; consider in a future scoring pass.        |
| 8 | Minimum elapsed turns before ANY nudge can fire (grace period)?         | 5 turns from game start. Avoids nudging during the opening alarm.       |

---

## 13. Update Checklist (per workflow)

Per CLAUDE.md ticket-first + documentation-aware workflow:

- [x] This design doc exists at `docs/guidance-system.md`.
- [ ] CLAUDE.md updated — add to Design Documents list and file-structure listing.
- [ ] README.md updated — add to `docs/` tree block in Project Structure.
- [ ] PO sign-off recorded in commit message referencing this doc.
- [ ] Phase 1 implementation ticket filed, references this doc in its acceptance criteria.
- [ ] Phase 2 and Phase 3 tickets filed after Phase 1 merges (not before — avoids premature scoping).

---

## What This Doc Deliberately Omits

- **No new engine APIs.** Everything runs on existing `TurnPlugin`, `registerEventHandler`, and trait primitives.
- **No daemon/fuse abstraction.** NSH already does turn math with `TURN_COUNT` + elapsed deltas. Section 6 keeps the same idiom.
- **No message-pool / random-variant system.** Each entry has one `messageId`. If variance is needed later, compose with the existing `SeededRandom` — out of scope.
- **No AI dialogue integration.** Flagged as Q5. Defer.
- **No nautical-directions pause.** Per project constraint.
- **No content authoring.** Exact wording, `minIdle` values, `cooldown` values, and entry priority tuning happen in Phase 3.
