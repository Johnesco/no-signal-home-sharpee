# No Signal Home — Opening Sequence Design

**Status:** Design complete, ready for implementation
**Spike:** Johnesco/no-signal-home#1
**Milestone:** Act 1: Arrival

---

## Overview

The opening sequence covers the player's first 5-10 minutes: waking up on their salvage tug, silencing a proximity alarm, discovering a massive derelict, docking with it, and boarding. It introduces the player character, teaches core mechanics, and creates the game's first life-or-death moment.

---

## The Player

A grey-market salvager. Loner. Lives on their tug, [TUG_NAME]. Deals in junk, derelicts, cracked data — "piracy of all kinds." Not violent, not legal. They were on a long haul, ran low on fuel, made the drastic choice to drift in low-power sleep mode hoping to encounter another ship or station.

The proximity alarm woke them. Something massive is nearby.

---

## Narrative Beats

### Beat 1: Wake (Tug Cargo Hold — new room)

Player wakes in the cargo hold. Dark — but the alarm's strobing red light provides enough visibility to see shapes and find the flashlight. Cold. A proximity alarm screaming from the cockpit. They've been sleeping in the gap between shipping containers. The alarm is deafening — it blocks almost all actions. The 10-turn alarm timer is running.

**The alarm is the first puzzle.** It gates the opening:
- Most actions are blocked: "You can't focus on anything with that noise."
- Movement south to cockpit is allowed
- TAKE FLASHLIGHT is allowed (it's dark, they need it)
- Hints push toward the cockpit: "The alarm is coming from the cockpit, south of here."

### Beat 2: Silence (Tug Cockpit)

The cockpit has a **big red flashing button** on the wall — the alarm cutoff. The room description makes it obvious. Any physical verb works: PUSH BUTTON, PRESS BUTTON, HIT BUTTON, PUNCH BUTTON, THROW [anything] AT BUTTON.

The alarm dies. Silence. Ears ringing.

**Now the player can see what's happening.** The viewport shows a massive dark hull approaching. Instruments come into focus. The docking controls, the fuel gauge, the nav computer — all available to examine. The alarm was a proximity warning: the tug is drifting toward a derelict corporate freighter on approach vector.

### Beat 3: Orient (Tug Cockpit — post-alarm)

With the alarm off, the player assesses the situation through instruments:
- **Nav computer:** "STILLWATER — Meridian Solutions corporate transport — STATUS: DERELICT — SALVAGE VALUE: HIGH"
- **Fuel gauge:** Three percent. Can't divert. Can't leave.
- **Comms system:** Dead. No signal. No rescue. *"No signal home."* (Title drop — discovered through examination, not forced.)
- **Viewport:** The Stillwater's hull filling the view, getting closer.

The player's reaction to Meridian Solutions is positive: *"Meridian Solutions. Top-shelf corporate. This is your best drift in years."* They feel lucky. This is a quality score.

### Beat 4: Dock (Tug Cockpit — the puzzle)

The tug is still drifting toward The Stillwater. 20-turn post-alarm timer is running. The player must take manual control and dock before collision.

The docking sequence has two hidden quality checks: **braking** (fire thrusters to slow approach) and **checking pressure** (verify seal integrity before pressurizing). Neither is required to complete docking, but skipping them has consequences — a bad seal kills you at the airlock, and not braking means your tug drifts away on impact.

See: Docking Puzzle (below).

### Beat 5: Board (Airlock)

After successful docking, the airlock unseals. If the player **checked pressure**, they cross safely into The Stillwater. Biohazard warnings, claw marks on the door frame, silence. The boundary between their world and the unknown.

If the player **did not check pressure**, warnings fire when they try to cross (see Outcome C — Bad Seal Death).

The game continues into Forward Corridor as currently designed.

### Beat 6: The Hook (2-3 turns after boarding)

2-3 turns after the player boards The Stillwater, the seal gives way. A deep crack echoes from behind. The deck shudders. The whine of escaping atmosphere.

- **If player braked (Outcome A):** The tug is still docked but the seal between them has failed. Visible through the airlock inspection window — frost on the cockpit glass, atmosphere venting. Inaccessible without an EVA suit. Plants endgame repair/return puzzle.
- **If player didn't brake (Outcome B):** The impact stress was too much. The docking clamp shears. The tug drifts away — visible from viewports, tumbling slowly. Gone without EVA. Same endgame state, different narrative flavor.

Either way: their ship, their home. Gone. For now.

---

## Timed Collision Mechanic

The tug is drifting toward The Stillwater on approach vector. Two sequential timers track time to impact.

### Rules
- **All actions count.** Every player command advances the timer. No "meaningful action" filter. Simple, predictable.
- **Two phases:**
  - **Alarm-on phase:** 10 turns. Timer starts at turn 1 in the cargo hold. Most actions are blocked with hints pointing toward the cockpit and the alarm button. Blocked actions still count. Timer expires → alarm-on collision death.
  - **Post-alarm phase:** 20 turns. Timer starts the moment the alarm is silenced. The player can now see the approaching hull. Timer expires → post-alarm collision death. Timer stops when docking begins (MANEUVER step).

### What the player knows at each stage

**Alarm on (turns 1-10):**
- The player has NO IDEA what the alarm means
- The viewport shows flashing red and "something" through the strobing light
- Urgency comes from the noise itself, not understanding
- Every blocked action costs a turn — the alarm is screaming, the game is pushing you to act

**Alarm off (turns 1-20 of post-alarm phase):**
- NOW the player can see the hull approaching through the viewport
- Viewport description escalates in sync with the post-alarm timer: hull details getting sharper, individual plates visible, shadow filling the view
- The instruments show approach vector and closing distance

### Death: Collision

**Crash with alarm still on (10 turns wasted):**
> Your last thought as you are ejected into space is that must have been a proximity alarm.

**Crash with alarm off (20 turns wasted):**
> The Stillwater's hull fills the viewport. Every rivet. Every weld seam. You had time. You just didn't use it.

Both are distinct deaths — one darkly funny (you never even knew), one grim (you watched it happen).

---

## Docking Puzzle

### State Machine: `docking-sequence`

```
APPROACH     (initial) — tug drifting, no control
MANEUVERED   — player has taken manual control, can brake or connect
CONNECTED    — docking arm locked on, can check pressure or seal
SEALED       — pressurized, can cross (if seal quality is good)
```

No failure states in the state machine itself. Outcomes are determined by two boolean flags tracked during the sequence.

### Sequence

1. **EXAMINE DOCKING CONTROLS** — required gate. Reveals instrument readouts, approach data. "You don't know which controls to use yet" if skipped.
2. **MANEUVER** (or TAKE CONTROLS, TAKE HELM) — state: APPROACH → MANEUVERED. Stops the collision timer.
3. **BRAKE** (or DECELERATE, FIRE THRUSTERS, SLOW DOWN) — *optional.* Sets `braked = true`. Any attempt counts. Determines technique quality.
4. **CONNECT** (or EXTEND ARM, DOCK) — state: MANEUVERED → CONNECTED. Locks the `braked` flag.
5. **CHECK PRESSURE** (or CHECK SEAL, EXAMINE PRESSURE) — *optional.* Sets `checkedPressure = true`. Determines seal quality.
6. **SEAL** (or PRESSURIZE, PRESSURIZE AIRLOCK) — state: CONNECTED → SEALED. Locks the `checkedPressure` flag. If pressure wasn't checked, a warning fires: *"Pressure readings are unstable. The seal is holding, but barely."*
7. **GO SOUTH** — board the Stillwater (if seal is good). If seal is bad, death path triggers (see Outcomes).

### Quality Flags

| Flag | Set by | Window | Effect |
|------|--------|--------|--------|
| `braked` | BRAKE/DECEL/FIRE THRUSTERS | Between MANEUVER and CONNECT | Determines whether tug stays or drifts away |
| `checkedPressure` | CHECK PRESSURE/CHECK SEAL | Between CONNECT and SEAL | Determines whether crossing the airlock is safe |

### Failure Forgiveness
- Wrong actions in early phases produce warnings, not death
- Try to dock without examining controls first? "You don't know which controls to use yet."
- Try to CONNECT before MANEUVER? "You're still drifting. Take the controls first."
- Try to SEAL before CONNECT? "There's nothing to seal yet."
- Out-of-order actions cost a turn but don't kill you
- The only deaths come from: collision timer expiring or crossing a bad seal

### Verbs

```
maneuver / take controls / take helm             → story.action.docking (state-sensitive)
brake / decelerate / fire thrusters / slow down   → story.action.docking (MANEUVERED only)
connect / extend arm / dock / dock with stillwater → story.action.docking (state-sensitive)
check pressure / check seal / examine pressure    → story.action.docking (CONNECTED only)
seal / pressurize / pressurize airlock            → story.action.docking (state-sensitive)
```

Single `story.action.docking` action reads the state machine and interprets the verb accordingly.

---

## Five Possible Early Outcomes

### A. Best Dock — braked + checked pressure (game continues, tug stays)
Player silences alarm, takes control, brakes, connects, checks pressure, seals. Tug connects with a solid seal. Player boards The Stillwater. **2-3 turns later**, a deep crack echoes from behind — the seal degrades under stress. The tug is visible through the airlock inspection window but inaccessible without an EVA suit. Plants endgame repair/return puzzle.

### B. Rough Dock — didn't brake, but checked pressure (game continues, tug lost)
Player takes control and connects without braking first. The tug slams into The Stillwater — hard. The seal holds (pressure was checked), player boards safely. But the impact stress is too much. The tug's docking clamp shears and it drifts away. Visible from viewports, tumbling slowly. Gone without EVA.

### C. Bad Seal Death (death — telegraphed, skipped pressure check)
Player seals without checking pressure. Two warnings before death:
1. **At SEAL step:** *"Pressure readings are unstable. The seal is holding, but barely."*
2. **At airlock crossing:** *"SEAL INTEGRITY CRITICAL. Atmosphere on the far side reads hard vacuum."*
3. If player pushes through: explosive decompression.

This fires regardless of whether the player braked. A bad seal is always fatal.

### D. Alarm-On Collision (death — timed, 10 turns)
Player fails to silence the alarm within 10 turns. The tug drifts into The Stillwater's hull at approach velocity.
> Your last thought as you are ejected into space is that must have been a proximity alarm.

### E. Post-Alarm Collision (death — timed, 20 turns)
Player silences the alarm but fails to complete docking within 20 turns. They watch it happen.
> The Stillwater's hull fills the viewport. Every rivet. Every weld seam. You had time. You just didn't use it.

---

## Memory System (Game-Wide)

First interactions with objects or actions trigger one-time PC observations — memories, professional assessments, dry commentary. This is the backstory delivery system for the entire game, not just the opening.

### Implementation: MemoryTrait

A `MemoryTrait` attached to any entity with a trigger action and message ID. A single interceptor system handles all of them. Memories fire once, on the specified trigger (EXAMINE, TAKE, OPEN, custom actions, etc.).

```
Entity: flashlight
  MemoryTrait: trigger=examining, message="Half charge. You've navigated worse on less."

Entity: shipping crates
  MemoryTrait: trigger=examining, message="DEEP REACH SALVAGE. Your outfit. Well — your name on someone else's paperwork."

Entity: comms system
  MemoryTrait: trigger=examining, message="Dead. No signal home."

Entity: nav computer
  MemoryTrait: trigger=examining, message="Meridian Solutions. Top-shelf corporate. This is your best drift in years."
```

Memories are assigned declaratively per entity. The system is generic — works for the opening, for mid-game discoveries, for endgame revelations.

---

## Alarm Blocking System

While the alarm is active, most actions are blocked with contextual responses. **Blocked actions still cost a turn** — the 10-turn alarm timer counts every command.

**In Tug Cargo Hold:**
- Allowed: GO SOUTH, TAKE FLASHLIGHT, LOOK
- Blocked (with hint): "You can't focus with that alarm screaming. It's coming from the cockpit, south of here."

**In Tug Cockpit:**
- Allowed: PUSH/PRESS/HIT BUTTON, EXAMINE BUTTON, EXAMINE ALARM, LOOK
- Blocked: "The noise is unbearable. That big red button on the wall looks like it might help."
- THROW [object] AT BUTTON: works (silences alarm, thrown object lands on cockpit floor)

**After button pressed:**
- All actions unblocked
- Alarm state key flipped; re-pressing the button: "You've already silenced the alarm."
- Cargo hold and cockpit fully explorable
- Docking controls become responsive
- 20-turn post-alarm timer begins

---

## Backstory Through Objects (Opening)

| Object | Location | Trigger | PC Observation |
|--------|----------|---------|----------------|
| Shipping crates | Cargo Hold | examine | "DEEP REACH SALVAGE. Your outfit. Your name on someone else's paperwork." |
| Bedroll/hiding spot | Cargo Hold | examine | "You've slept in worse. Not much worse." |
| Datapad/manifest | Cargo Hold | examine | Salvage manifest — tug on autopilot for a target. You set the drift, the tug found the score. |
| Flashlight | Cargo Hold | take | "Half charge. You've navigated worse on less." |
| Nav computer | Cockpit | examine | "Meridian Solutions. Top-shelf corporate. This is your best drift in years." |
| Fuel gauge | Cockpit | examine | "Three percent. That's what you get for drifting." |
| Comms system | Cockpit | examine | "Dead. No signal home." |
| Pilot's seat | Cockpit | examine | "Your chair. Your ship. Fits like everything else in your life — not quite right, but yours." |
| Docking controls | Cockpit | examine | "Standard magnetic clamp system. You've used worse." |
| Alarm button | Cockpit | push | (alarm silences — no memory, just relief) |

None are mandatory. A player who goes SOUTH → PUSH BUTTON → DOCK skips all backstory and still wins.

---

## Room Changes

### New: Tug Cargo Hold (Room #0)
- Starting room
- Exits: SOUTH to Tug Cockpit
- See room-map.md for full details

### Modified: Tug Cockpit (Room #1)
- New scenery: alarm button, docking controls, fuel gauge, comms system, pilot's seat
- Exits: NORTH to Cargo Hold, SOUTH to Airlock (sealed until SEALED state, with state-specific blocked messages)
- State-reactive descriptions tied to docking state machine

### Modified: Airlock (Room #2)
- Starts sealed (locked by docking state, not a key)
- Opens after SEALED state — but crossing checks `checkedPressure` flag (bad seal = death)
- New scenery: inspection window (shows tug status post-boarding), airlock controls
- After seal degradation: north exit blocked ("The seal has failed. Hard vacuum on the other side.")

### Room Count
- Tug: 2 rooms (Cargo Hold, Cockpit)
- Stillwater: 24 rooms
- Total: 26

---

## Technical Architecture

| System | Purpose |
|--------|---------|
| **State machine** (`docking-sequence`) | Tracks docking phase: APPROACH → MANEUVERED → CONNECTED → SEALED |
| **Boolean flags** (`braked`, `checkedPressure`) | Track optional quality steps. Locked at CONNECT and SEAL respectively. |
| **Fuse** (alarm timer) | 10 turns during alarm phase. All actions count. Fires alarm-on crash death on expiry. |
| **Fuse** (collision timer) | 20 turns post-alarm. All actions count. Stops at MANEUVER step. Fires post-alarm crash death on expiry. |
| **Action interceptor** (airlock crossing) | Checks `checkedPressure` flag. Bad seal → telegraphed death (2 warnings). |
| **Turn plugin** (approach atmosphere) | Escalating viewport descriptions synced with post-alarm collision timer. |
| **Daemon** (seal degradation) | Fires 2-3 turns after boarding Stillwater. Describes seal failure, blocks return to tug. |
| **MemoryTrait + interceptors** | Game-wide first-interaction flavor text system. |
| **Alarm state** | Gates actions until silenced. Checked by a pre-validate interceptor on all actions. Blocked actions still cost turns. |

---

## Implementation Tickets

1. **Tug Cargo Hold** — new room, room graph, move starting items, alarm button scenery
2. **Docking state machine** — 4 states (APPROACH → MANEUVERED → CONNECTED → SEALED), 2 boolean quality flags (`braked`, `checkedPressure`), `story.action.docking`, grammar patterns for all verb synonyms
3. **Two-phase collision timer + alarm system** — alarm fuse (10 turns), post-alarm fuse (20 turns), alarm action blocking, escalating viewport descriptions synced to post-alarm timer, two crash death variants
4. **Airlock rework** — sealed until SEALED state, bad seal death (telegraphed, 2 warnings based on `checkedPressure` flag), state-specific blocked messages on cockpit→airlock exit
5. **MemoryTrait system** — trait, interceptors, opening memories, language registration
6. **Seal degradation + tug loss** — daemon fires 2-3 turns after boarding, outcome varies by `braked` flag (tug stays/seal fails vs. tug drifts away), blocks return to tug without EVA suit
7. **Test updates** — new opening walkthrough covering all 5 outcomes, update existing tests with docking prefix

---

## Open Items

- **[TUG_NAME]** — placeholder until we settle on a name for the player's tug

## Resolved Items

- **Collision turn count** — alarm phase: 10 turns, post-alarm: 20 turns, all actions count
- **Docking complexity** — simplified to 4 states + 2 optional quality flags (braked, checkedPressure)
- **Premature airlock death** — removed; only deaths are collision and bad seal
- **Meaningful action filter** — removed; all actions count toward timers
- **Seal failure timing** — 2-3 turns after boarding Stillwater (not immediate, not location-triggered)
- **Darkness in Cargo Hold** — atmospherically dark only (alarm strobe provides light), not mechanically dark (`isDark: false`)

---

*Design finalized: 2026-03-31*
*Spike: Johnesco/no-signal-home#1*
