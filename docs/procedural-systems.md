# No Signal Home — Procedural & Dynamic Systems

## Core Concept
Every playthrough feels unique. Not roguelike — the plot, rooms, puzzles, and NPCs are the same. But the *details* shift. Codes change, the AI lies differently, the engineer breaks down in different ways, corporate memos say different things. Walkthroughs don't work. Replays surprise.

All driven by a **single seed** → deterministic, testable, reproducible.

## Seed System

### How It Works
- Game generates a random seed at start
- ALL procedural content derives from this seed via `SeededRandom`
- Same seed = identical playthrough, every time
- Seed revealed at game end with score: `Your voyage: Seed #48271`
- Tests pin a known seed for deterministic transcript assertions

### Testing Integration
- Transcript tests set seed at top: `$state game.seed = 12345`
- All procedural outputs become fixed and assertable
- Multiple seeds can be tested to verify variety doesn't break logic
- Key puzzle dependencies verified across several seeds

---

## SEEDED PROCEDURAL CONTENT

### 1. Codes and Passwords
**What changes:** Every access code, keypad combo, and password regenerates per seed.
**What stays fixed:** WHERE you find each clue, WHICH NPCs know what, puzzle logic/dependencies.

| Code | Clue Location(s) | Format |
|------|-------------------|--------|
| Cargo Hold access | Corp officer (half) + Prisoner (half) | 3+3 digit split |
| Captain's desk combo | Personal effects / hidden in cabin | 4-digit |
| Weapons crate | Corp officer / bridge security / force | Keycard code |
| Bridge override sequences | Various terminals | Alphanumeric |

**Implementation:**
```typescript
// Seed generates all codes at game init
const codes = {
  cargoHold: seed.nextRange(100, 999).toString() + seed.nextRange(100, 999).toString(),
  captainDesk: seed.nextRange(1000, 9999).toString(),
  weaponsCrate: seed.nextAlphanumeric(6),
};
// Clue text templates inject the generated values
// "The manifest ends with a handwritten note: {codes.cargoHold.firstHalf}"
```

**Clue integration:** The clues still appear in the same places but contain the seed-generated values. The captain's journal still has the code — it's just a different code each time.

### 2. Corporate Flavor Text
**What changes:** Memos, posters, safety slogans, dead crew names, terminal boilerplate.
**What stays fixed:** Plot-critical documents, NPC names, key lore entries.

**Template pools:**

*Poster slogans (pick from pool per seed):*
- "Meridian Solutions: {slogan}" where slogan is drawn from a pool of 20-30
- "SAFETY NOTICE: {absurd_safety_message}"
- "EMPLOYEE OF THE QUARTER: {generated_crew_name}"

*Memo subjects:*
- Template: "RE: {department} {issue}" with generated department names and bureaucratic complaints
- "FROM: {generated_name}, {generated_title}"
- Content: short paragraph from template + word pool

*Dead crew names:*
- Generated from name pools (first + last)
- Consistent within a seed — same crew list everywhere
- Photos in Hab Corridor, names on mugs in Mess Hall, patient logs in Medbay all reference the same generated roster

**Implementation:**
```typescript
// Name generator
const crewRoster = seed.generateNames(12); // consistent crew list per seed
// Template system
const poster = templates.poster.fill({
  slogan: seed.pick(sloganPool),
  employee: seed.pick(crewRoster),
});
```

### 3. AI Deception Strategy
**What changes:** Which lies SOMS tells, how it frames truths, what it omits, what it emphasizes.
**What stays fixed:** The actual truth (plot), which topics are available, the personality arc stages.

**Per seed, the AI selects a "strategy" from a pool:**

| Strategy | How it lies | Example |
|----------|-------------|---------|
| Minimizer | Downplays everything | "The biohazard is a minor contamination. Routine." |
| Redirector | Answers a different question than asked | "The cargo? Let me tell you about the ship's safety record instead." |
| Partial Truth | Gives 80% truth with a critical omission | "The prisoners are in cryo for transport. [omits: to a weapons buyer]" |
| Blame Shifter | Points at someone else | "The engineer may have caused the contamination. Have you noticed their behavior?" |
| False Ally | Pretends to confide in you | "Between us? I think the corporate officer is hiding something dangerous." |

**Per playthrough, the AI gets 2-3 strategies it cycles between.** Player replaying with a different seed encounters a different deception pattern — same truths to uncover, different path through the lies.

**Implementation:**
```typescript
// At game init, seed selects AI strategies
const aiStrategies = seed.pick(strategyPool, 3); // 3 strategies per playthrough
// When player queries a topic, AI picks strategy based on topic + current stage
function getAIResponse(topic: string, stage: number): string {
  const strategy = aiStrategies[seed.nextRange(0, aiStrategies.length)];
  return templates.ai[topic][strategy][stage];
}
```

### 4. Minor Item Shuffling
**What changes:** Non-critical items appear in different rooms.
**What stays fixed:** Key items (keycard, hazmat suit, elevator parts) stay in their designed locations.

**Shuffleable items:**
- Ration bars / food items
- Personal effects (crew photos, letters, mugs)
- Minor medical supplies (bandages, single stim)
- Loose tools (not the main tool rack)
- Data pads with flavor lore

**Implementation:** At init, shuffleable items are placed from a pool into valid rooms (not behind gates the player hasn't opened).

### 5. NPC Idle Dialogue
**What changes:** What NPCs say when you're just in the room with them. Drawn from pools, not scripted sequences.
**What stays fixed:** Plot-critical dialogue (ASK ABOUT topics), behavior arcs, stage transitions.

**Per NPC, per stage, a pool of 8-15 idle lines:**

*Reed, Stage 1:*
- "Pressure's holding steady. For now."
- "Haven't had company down here in... I don't remember how long."
- "That valve's been singing again. Hear it?"
- "Coffee machine's been dead for months. Miss it more than I should."

*Reed, Stage 2 (glitchy):*
- "That valve's been — been singing. Singing."
- "Did you just come in? I thought you just came in."
- "I was fixing the... the thing. What was I fixing?"
- "Don't mind me. I'm fine. I'm fine. I'm fine."

**Each turn the player is in the room, chance of an idle line. Seed determines which line from the pool.**

### 6. Combat Variance
**What changes:** Hit/miss rolls, damage values within ranges.
**What stays fixed:** Weapon stats, NPC health, combat rules.
**Already supported:** Sharpee's `SeededRandom` is built into `NpcContext` and `CombatantTrait`.

### 7. Engineer's Specific Symptoms
**What changes:** The particular way Reed's infection manifests. Different repeated phrases, different confused moments, different glitch behaviors.
**What stays fixed:** The 4-stage arc (Normal → Glitchy → Lucid Warning → Turned), timing, plot impact.

**Symptom pools per stage:**

*Stage 2 glitch types (seed picks 2-3 per playthrough):*
- Phrase repetition ("Did I already say that?")
- Wrong word substitution ("Hand me that — that wrench. No. The other — the blue one." There is no blue one.)
- Location confusion ("How did I get here? I was in engineering.")
- Time confusion ("What day is it? How long have you been here?")
- Staring ("Reed is staring at the wall. They don't seem to notice you.")

*Stage 4 turned behaviors (seed picks a profile):*
- The Smiler: too calm, watches, grins at nothing
- The Mimic: echoes your words back slightly wrong
- The Worker: performs maintenance routines on imaginary equipment
- The Still One: stands motionless, tracks you with their eyes only

---

## STATE-REACTIVE DESCRIPTIONS (Not Seeded — Deterministic)

These aren't random — they're computed from game state. But they use processing power to create dynamic, responsive text.

### Reactor Warming
- Lower deck descriptions track reactor temperature state
- Early: "The corridor is cold. Your breath fogs."
- Mid: "The deck plates are warm underfoot. The air hums."
- Late: "Heat radiates from every surface. The reactor roar is constant."
- Affects: Aft Corridor, Engineering, Reactor Room, and bleeds into Lower Mid Corridor

### AI Spreading
- Tracks which systems SOMS has activated per room
- Early: "A single terminal blinks in the corner."
- Mid: "Three screens are awake. A speaker crackles with static."
- Late: "Every screen shows the Meridian Solutions logo. A camera pivots to follow you."
- Affects: Every room with terminals or speakers — escalates per AI stage

### Infection Spreading
- Subtle environmental changes as pathogen containment degrades
- Early: "The air smells faintly of something chemical."
- Mid: "A dark stain has spread across the floor near the vent."
- Late: "The walls are damp. Something organic clings to the pipes."
- Affects: Rooms near Cargo Hold, Cryo Bay, and spreading outward over time

### Implementation
```typescript
// Room descriptions built from base + modifiers
function describeRoom(room: IFEntity, world: WorldModel): string {
  let desc = room.get(IdentityTrait).description; // base description
  desc += getReactorModifier(room, world);   // temperature state
  desc += getAIModifier(room, world);        // AI presence state
  desc += getInfectionModifier(room, world); // pathogen spread state
  return desc;
}
```

---

## WHAT THIS MEANS FOR THE PLAYER

None of this is visible as "systems." The player just notices:
- "Huh, the code was different when my friend played."
- "The AI told me something completely different last time."
- "Reed kept repeating a different phrase."
- "That poster wasn't there before... was it?"
- "The ship feels different this time. Warmer. More alive."

The game feels like it *breathes*. No two trips through the Stillwater are identical.

---

## WHAT THIS MEANS FOR TESTING

- All seeded content: pin the seed in transcript, assert normally
- State-reactive content: use `[STATE: true, ...]` assertions to verify game state, not exact text
- Multiple seeds tested: run key walkthroughs against 3-5 different seeds
- Procedural templates tested independently: unit tests verify all template + pool combinations produce valid text
