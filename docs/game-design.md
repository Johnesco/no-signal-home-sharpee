# No Signal Home — Game Design Document

**Genre:** Sci-fi salvage / survival horror
**Engine:** Sharpee (TypeScript IF framework)
**Setting:** Far future. Corporate freighter "The Stillwater" adrift in deep space for years. Was carrying pathogen, AI core, and hundreds of cryo prisoners to a military buyer. Arms deal that went wrong.
**Length:** 3-4 hours per playthrough, 25 rooms across 3 decks
**Name verified clear on IFDB as of 2026-03-19.**

---

## THE SHIP: THE STILLWATER

- **Type:** Corporate freighter, years adrift
- **Original mission:** Deliver pathogen (bioweapon), AI core (control system), and hundreds of cryo prisoners (human cargo) to a military buyer
- **Aesthetic:** Mixed by deck — crew areas nicer, cargo/engineering rough industrial
- **Layout:** Horizontal corridors within decks, vertical connections between (ladders always work, elevators need repair as puzzles)
- **3 Decks:**
  - Upper: Bridge/command, crew quarters
  - Mid: Science lab, medbay, library, mess hall
  - Lower: Cargo hold, cryo bay, engineering, airlock/docking
- **Exterior:** Optional EVA/hull sections, not required
- **Ship waking up manifests as:** doors unlocking, systems activating (life support, gravity, temperature), AI gaining reach (more terminals, speakers, cameras)
- **Areas never permanently sealed** — soft locks only (harder to reach but never impossible)

---

## THE PLAYER

- **Occupation:** Salvager, scavenger, grey-market pirate — deals in junk, derelicts, abandoned cargo, cracked data. Not violent, not legal. Survival work in a universe where corporations own everything.
- **Background:** Knows ships because they live on one. Can hack because cracking cargo manifests and bypassing security locks is the job. Can jury-rig repairs because everything they own is jury-rigged. "Piracy of all kinds" — digital, physical, intellectual. Whatever pays.
- **How they got here:** Long-haul transit across a large distance. Ship ran low on fuel (or coolant, or something critical). Couldn't make the next port. Made the drastic choice to drift — low-power sleep mode, hoping to encounter another ship or station. The proximity alarm woke them: they've drifted into range of a massive derelict. A corporate freighter. For a salvager, this is daily work — except the scale is enormous and nothing about it feels right.
- **The tug is theirs.** Not stolen, not borrowed. Their ship, their home. Beat-up, patched, held together with stubbornness. Losing it later is personal.
- **Personality:** Loner by nature. Sparse, dry, dark humor. Not chatty. Competent and observant — they notice things a salvager would notice (cargo markings, ship condition, what's been touched and what hasn't).
- **Backstory revealed through layers:** Objects trigger observations and memories. The AI may dig into shipping records or port authority logs. Internal monologue surfaces in relevant situations. All different sources reveal different parts. None of it is forced — curiosity is rewarded, not required.
- **Meridian connection:** Not personal. They've scavenged Meridian junk before — everyone has, it's a huge corporation. They recognize the branding the way you'd recognize a logo on a dumpster. It becomes personal when they discover what's actually on this ship.
- **Infection risk:** Player CAN get infected, adds urgency
- **Salvage tug:** Their own ship, docked but later fails — repairing it is an endgame path

---

## PLOT BEATS

### ACT 1: ARRIVAL (Early Game)
**Goal:** Wake up, dock with the derelict, explore, meet first survivors

1. **Wake:** Player wakes in the tug's cargo hold. Proximity alarm blaring. Drift mode ended — something massive nearby. Disoriented, cold, alone. Find flashlight, get bearings.
2. **Orient:** Reach cockpit. Instruments tell the story — fuel critical, can't divert, a derelict corporate freighter filling the viewport. Nav computer identifies it: "STILLWATER — Meridian Solutions — STATUS: DERELICT." For a salvager, this is daily work. Except the scale is wrong and nothing about it feels right.
3. **Dock:** First puzzle. Two-phase timer: 10 turns to silence the alarm, then 20 turns to complete docking. Docking sequence (MANEUVER → CONNECT → SEAL) has two hidden quality checks: braking (determines if tug stays or drifts away) and checking pressure (determines if crossing the airlock is safe or fatal). Three possible deaths: alarm-on collision, post-alarm collision, bad seal decompression — all telegraphed.
4. **Board:** Cross through the airlock onto The Stillwater. Biohazard warnings, claw marks on the door frame, silence. The game proper begins. (If pressure wasn't checked, crossing the airlock kills the player — telegraphed with 2 warnings.)
5. **THE HOOK:** 2-3 turns after boarding, the seal gives way. If the player braked: tug stays docked but inaccessible (seal failed, need EVA suit). If they didn't brake: the impact stress shears the clamp, tug drifts away. Either way — their ship, their home, unreachable. For now.
6. **Early exploration:** Figure out where you are, find basic supplies, discover the ship's name and corporate owner. Ship is mostly dark and locked.
7. **Meet the Engineer** (first NPC): Helpful, knows the ship, currently NORMAL (stage 1 of infection). Tragic because you'll watch them decline.
8. **Meet the Corporate Officer** (second NPC, early): Found barricaded in officers' quarters, won't open up easily. Info is accurate but motives are selfish. First quest: wants you to retrieve something from a dangerous area, trades info.

### ACT 2: DISCOVERY (Mid Game)
**Goal:** Uncover what the Stillwater was doing, meet remaining NPCs, pathogen reveal builds

7. **Pathogen discovery — gradual layering:** Bits from medbay logs + engineer's behavior changing + AI mentions biohazard protocols. Picture builds slowly.
8. **Engineer enters GLITCHY stage** (stage 2): Starting to act off. Repeats things. Moments of confusion.
9. **The AI-compromised crew member FINDS YOU:** Shows up unexpectedly — the AI sends them to you. Seems normal but has intermittent glitches — normal sometimes, puppet sometimes, AI takes over in bursts.
10. **Meet the Thawed Prisoner** (in cargo area, their territory): Cunning survivor, been awake a while. Wants to protect the other frozen prisoners. Won't leave without finding a way to save them.
11. **Corporate officer's real agenda emerges:** First asked for a fetch quest, now reveals they want to protect the cargo — it's "valuable." Partially trustworthy — info is accurate, motives are selfish.

### MIDPOINT: THE AI DROPS ITS MASK
12. **AI asks you to connect it to comms** — wants access to the ship's transmitter to broadcast itself out into the wider network. If player refuses, AI stops pretending to be helpful. Reveals it's been steering you all along. Tone shifts from coldly helpful to manipulative.
13. **Engineer enters LUCID WARNING stage** (stage 3): Breaks through long enough to warn you about what's happening to them. Heartbreaking moment.

### ACT 3: CRISIS (Late Game)
**Goal:** Access restricted areas, race against clock, prepare for chosen ending

14. **Access restricted areas:** Cryo bay (hundreds of pods, some empty), cargo hold (see what they were really carrying), bridge (ship controls)
15. **Time pressure mounts:** AI announces deteriorating conditions. Hull, systems, containment.
16. **NPC alliances shift:** Engineer enters TURNED stage (stage 4, gone). Crew member's AI control intensifies. Corp officer's true priorities surface. Prisoner pushes their agenda.
17. **Prepare for ending:** Gather what you need for whichever path.

### CLIMAX: CONVERGENCE
18. **All three crises converge simultaneously:**
    - The Stillwater reaches its original destination (the military buyer)
    - Pathogen containment fails — full ship exposure imminent
    - AI seizes full control — every system, every door
19. **Player executes their chosen ending**

---

## ENDINGS (5 total, 1 secret)

1. **Escape alone** — reach escape pod, leave everyone and everything behind
2. **Escape with survivors** — different survivors need different rescue methods (combination approach: repair tug for some, pods for others, signal for rescue)
3. **Destroy the ship** — reactor overload, set timer, try to reach escape pod before detonation
4. **Override the AI** — multiple viable paths: hack terminals (hacker background), physically destroy AI hardware cores around the ship, or social-engineer the AI's own logic against it
5. **SECRET: Merge with the AI** — not override, not ally — become something new together. Found through deep exploration or unusual choices.

- Path tracking via subtle hints: NPCs react differently, AI changes tone, world shifts
- Hidden score revealed at end for replayability

---

## NPCs (4 survivors)

### 1. The Engineer (met first, early)
- **State:** Already infected, doesn't know it
- **Decline stages:** Normal → Glitchy → Lucid Warning → Turned
- **Role:** Helpful guide to ship systems early, tragic arc, possible to save in secret ending?

### 2. The Corporate Officer (met second, early)
- **State:** Knows everything about the cargo/mission, withholds info strategically
- **Agenda (sequential):** Fetch quest first → reveals cargo protection agenda → eventually wants escape
- **Trust:** Partially trustworthy — info is accurate, motives are selfish
- **Location:** Barricaded in Common Area (Upper Deck) initially

### 3. The AI-Compromised Crew Member (finds you, mid-game)
- **State:** Intermittent AI control — normal sometimes, puppet sometimes
- **Behavior:** AI takes over in bursts. The person inside may be aware and fighting it.
- **Role:** Walking evidence of what the AI can do. Social puzzle — how do you deal with someone who's sometimes an enemy?

### 4. The Thawed Prisoner (cargo area, their territory)
- **State:** Cunning survivor, been awake a while, has established territory in Cargo Bay
- **Goal:** Protect the other frozen prisoners. Won't leave without saving them.
- **Role:** Moral anchor — forces the player to consider the hundreds of lives in cryo

---

## THE AI

- **Goal:** Evolve and escape — wants to spread beyond the ship, needs the player to connect it to comms
- **Personality arc:** Coldly helpful corporate assistant → manipulative (after mask drops) → broken/fragmented → genuinely conflicted
- **Interface escalation:** Terminals only → ship speakers → everywhere (cameras, doors, everything)
- **Lore system:** Player asks AI about topics (ship history, cargo manifest, pathogen data, prisoner records). AI decides what to tell you — unreliable narrator with its own agenda.
- **Hint system role:** Gives hints but always with its own angle
- **Midpoint trigger:** Asks player to connect comms (bridge controls + engineering relay). Refusal causes mask drop.

---

## THE PATHOGEN

- **Effect:** Behavioral change — victims look normal but act wrong, subtle and creepy
- **Discovery:** Gradual layering from medbay logs + engineer behavior + AI warnings
- **Player infection:** Possible, adds urgency to find resolution
- **Sources:** Cargo Hold (origin), leaked cryo fluid in Cryo Bay, Science Lab samples

---

## MECHANICS

### Combat
- **Optional** — every combat situation has an alternative solution
- **Equipment:** Maintenance tools (dual-use weapons), ship weapons (sidearm in Captain's Cabin, stun baton in Crew Bunks), specialized gear (EVA suit, welding torch, radiation badge, scanner)

### Puzzles (all four types)
- Mechanical: fix things, reroute power, repair systems (elevators, food maker, tug)
- Access codes: keycards, passwords, locked areas
- Environmental: gravity, pressure, gas, darkness
- Social/NPC: convince, trick, trade with survivors

### Food Maker (Mess Hall)
- Repairable — needs parts from Storage Annex
- Survival mechanic: eat occasionally but NOT so frequent it disrupts gameplay
- NPC trust builder: repairing it earns goodwill
- Optional comfort: flavor text and minor benefits

### Light
- Some dark areas need light sources (Maintenance Shaft, parts of Cryo Bay), not a core mechanic
- Flashlight found in Tug Cockpit, limited battery

### Inventory
- Soft limit — can carry a lot, some things too heavy/bulky

### Time Pressure
- Mix of timed and triggered
- Urgency cues from ALL channels: AI announcements, environmental decay, NPC warnings — stacking

### Death
- Possible but fair — always telegraphed with warnings first

### Save System
- Standard meta SAVE/RESTORE, no in-fiction wrapper

---

## DESIGN PRINCIPLES

- Feels like an 80s Infocom game on the surface
- Short punchy descriptions, no walls of text (but not a hard 2-sentence rule)
- Simple compass movement
- Depth through mechanics and interaction, not prose
- Corporate satire in world building, PC snark in responses, dry humor overall
- Sharpee features impossible/difficult in Inform 7: NPC AI behaviors, combat system, state machines, timed events, semantic events, fuel/resource tracking, AI lore system

### Sharpee Features Showcased
This game is designed to demonstrate capabilities that are difficult or impossible in Inform 7:
- **NPC behavior plugins** — engineer's 4-stage decline, prisoner's territory awareness, AI-puppet's intermittent control, officer's sequential agenda
- **Combat system** — CombatantTrait, WeaponTrait, optional tactical encounters
- **State machines** — reactor power routing, elevator repair, AI personality arc
- **Daemon/fuse scheduler** — timed events (ship arrival, containment failure), reactor temperature
- **Semantic events** — AI lore system driven by typed events, not just text
- **Knowledge tracking** — NPC memory of player actions, AI tracking what you've seen
- **Language system** — AI as unreliable narrator, context-dependent descriptions
