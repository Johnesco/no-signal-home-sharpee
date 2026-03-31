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

- Stowaway / convict — escaped prison transport by hiding on salvage tug
- **Background:** Smuggler + hacker (knows ships, cargo systems, and digital systems)
- **Backstory revealed through layers:** objects trigger memories, AI finds criminal record, internal monologue in relevant situations — all different sources reveal different parts
- **Personality:** Emergent — starts sparse, builds through observations. Dark humor, dry commentary.
- **Infection risk:** Player CAN get infected, adds urgency
- **Salvage tug:** Still docked but damaged — repairing it is an endgame path

---

## PLOT BEATS

### ACT 1: ARRIVAL (Early Game)
**Goal:** Explore, orient, restore basic systems, find bearings, meet first survivors

1. **Opening:** Player wakes up in salvage tug's cargo hold, docked with the Stillwater
2. **Early exploration:** Figure out where you are, find basic supplies, discover the ship's name and corporate owner
3. **THE HOOK:** The tug detaches — you hear it go. Your way out just left. Now what?
4. **Restore systems:** Power, doors, basic life support — ship is mostly dark and locked
5. **Meet the Engineer** (first NPC): Helpful, knows the ship, currently NORMAL (stage 1 of infection). Tragic because you'll watch them decline.
6. **Meet the Corporate Officer** (second NPC, early): Found barricaded in officers' quarters, won't open up easily. Info is accurate but motives are selfish. First quest: wants you to retrieve something from a dangerous area, trades info.

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
