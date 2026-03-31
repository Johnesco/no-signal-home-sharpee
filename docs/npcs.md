# No Signal Home — NPC Details

> Names are working placeholders. Everything here is changeable.

---

## 1. REED — The Engineer

**Working name:** Reed (gender-neutral, short, feels like a crew name)
**Location:** Engineering (Lower Deck), moves as infection progresses
**Met:** First NPC, Act 1
**Voice:** Practical, no-nonsense, talks about systems like they're alive. Gets confused, then desperate, then gone.

### Infection Stages

**Stage 1 — Normal (Act 1)**
- Friendly, helpful, relieved to see another person
- Knows the ship inside out, gives useful info freely
- Will help repair elevator and explain food maker
- Stays in Engineering, occasionally moves to Aft Corridor

**Stage 2 — Glitchy (early Act 2)**
- Repeats sentences, loses track of conversation
- Still functional but slower, needs prompting
- Can still help with repairs if pushed
- Starts wandering — found in unexpected rooms, confused about how they got there
- ASK REED ABOUT topics: sometimes gives useful answers, sometimes loops

**Stage 3 — Lucid Warning (Midpoint)**
- Brief window of total clarity
- Warns the player: "Something's in me. It's been in me since before you got here. Don't let it — don't let me —"
- Tells you something critical they've been holding back (what?)
- Then slips back, worse than before
- This stage is SHORT — a few turns at most

**Stage 4 — Turned (Act 3)**
- Looks like Reed, doesn't act like Reed
- Too calm, watches you, smiles at wrong moments
- Blocks access to Engineering if you haven't gotten what you need
- Not hostile unless provoked — just... wrong
- Can be avoided, stunned, or locked somewhere

### Sharpee Implementation
- `NpcBehavior` with custom `onTurn` checking infection stage (game state counter or turn-based)
- Stages driven by `plugin-state-machine` or `game.stateValue`
- `NpcTrait.knowledge` tracks what Reed has told the player
- Movement: stage 1-2 confined to Engineering/Aft Corridor, stage 2+ wanders via `createWandererBehavior` with increasing `moveChance`
- `NpcTrait.customProperties.infectionStage` tracks current stage

### Key Dialogue Topics
- ASK REED ABOUT SHIP → ship history, how long it's been drifting
- ASK REED ABOUT CARGO → evasive early, "above my pay grade"
- ASK REED ABOUT ELEVATOR → explains repair process, offers to help
- ASK REED ABOUT FOOD MAKER → knows the specs, explains installation
- ASK REED ABOUT CREW → what happened to them, who's left
- ASK REED ABOUT THEMSELVES → personal background, how they ended up on this ship

---

## 2. VASIK — The Corporate Officer

**Working name:** Vasik (sharp, bureaucratic sound)
**Location:** Common Area (Upper Deck), barricaded
**Met:** Second NPC, Act 1
**Voice:** Clipped, precise, always calculating. Never wastes a word on you that doesn't serve their agenda.

### Behavior Arc

**Phase 1 — Barricaded (Act 1)**
- Won't open door. Talks through the barricade.
- Sizes you up. Figures out you're a convict fast.
- Offers a deal: bring the security override tool from Engineering, gets you intel in return.

**Phase 2 — Trading (Act 2)**
- After fetch quest, more willing to talk
- Trades information for favors — each interaction gives you something
- Has half the Cargo Hold code, will trade it for something significant
- Info is always accurate but framed to serve their interests

**Phase 3 — Agenda revealed (late Act 2)**
- Reveals they want to protect the cargo — "Do you have any idea what this is worth?"
- Still partially trustworthy — they're not lying, they're just prioritizing money over lives
- May soften slightly if player has built enough rapport

**Phase 4 — Endgame**
- Desperate. Facade cracks.
- Different depending on path: helps you escape, tries to stop you from destroying the ship, or bargains for their life

### Sharpee Implementation
- Stationary NPC initially (barricade blocks Common Area east exit)
- `NpcTrait.conversationState` tracks which phase they're in
- `NpcTrait.knowledge` tracks what they've told you, what you've traded
- Phase transitions triggered by player actions (delivering items, reaching story beats)
- Barricade is a puzzle object — can negotiate through it, or find alternate route via air vent

### Key Dialogue Topics
- ASK VASIK ABOUT CARGO → "Classified. But I could be persuaded." (trade hook)
- ASK VASIK ABOUT COMPANY → Meridian Solutions background, corporate spin
- ASK VASIK ABOUT CREW → knows who survived and why
- ASK VASIK ABOUT CODE → will trade their half for something valuable
- ASK VASIK ABOUT AI → knows what it is, underestimates it
- ASK VASIK ABOUT DESTINATION → knows where the ship was going, guards this info

---

## 3. OKAFOR — The Thawed Prisoner

**Working name:** Okafor (strong, distinct)
**Location:** Cargo Bay (Lower Deck), their territory
**Met:** Act 2, when player reaches cargo area
**Voice:** Direct, measured, doesn't trust easily. Speaks like someone who's had time to think.

### Behavior Arc

**Phase 1 — Territorial (first meeting)**
- Confrontational. "You're in my bay."
- Tests the player — are you a threat? Corporate? Another prisoner?
- Learning you're a convict helps. Slightly.

**Phase 2 — Cautious alliance (after trust built)**
- Opens up about the cryo prisoners — hundreds of people frozen, many dying
- Has the other half of the Cargo Hold code — been trying to get in
- Trades code for assurance you'll help the prisoners
- Knows more about the ship than expected — been exploring for a while

**Phase 3 — Moral pressure (Act 3)**
- Pushes hard for the prisoners' safety in any escape plan
- Won't leave without a plan for them
- If you try to escape alone, Okafor calls you out

### Sharpee Implementation
- Custom `NpcBehavior` with territory awareness — `onPlayerEnters` triggers confrontation
- `NpcTrait.goals`: `['protect_prisoners']`
- Trust tracked in `NpcTrait.customProperties.trustLevel` — builds through actions (bringing food, sharing info, not threatening)
- Can become a follower late-game if trust is high enough (`createFollowerBehavior`)
- If player goes to cryo without dealing with Okafor first, they show up

### Key Dialogue Topics
- ASK OKAFOR ABOUT PRISONERS → passionate, detailed, names some of them
- ASK OKAFOR ABOUT CARGO → knows the code half, trades it
- ASK OKAFOR ABOUT SHIP → has explored a lot, practical knowledge
- ASK OKAFOR ABOUT THEMSELVES → slow reveal — what were they convicted of? Why do they care so much?
- ASK OKAFOR ABOUT ESCAPE → "Not without them."
- ASK OKAFOR ABOUT COMPANY → bitter, informed hatred of Meridian Solutions

---

## 4. LIS — The AI-Compromised Crew Member

**Working name:** Lis (short, could be short for anything, feels human and fragile)
**Location:** Wanders — AI sends them to the player mid-game
**Met:** Mid Act 2, they find YOU
**Voice:** When themselves: scared, halting, aware something's wrong. When puppet: flat, helpful, slightly too precise — uncanny valley.

### Behavior Arc

**Phase 1 — Appearance (mid Act 2)**
- Shows up in whatever room the player is in. "Oh. I didn't — I thought I was going to storage."
- Seems like a normal crew survivor at first
- Small tells: pauses mid-sentence, head tilts, word choices shift

**Phase 2 — Intermittent (Act 2-3)**
- Switches between Lis and puppet with increasing frequency
- Lis moments: scared, asks for help, doesn't understand what's happening
- Puppet moments: too helpful, steers player toward AI's goals, reports player's location
- Player can learn to tell the difference — word choice, body language descriptions

**Phase 3 — Mostly puppet (Act 3)**
- Rare flashes of Lis. Mostly the AI wearing their face.
- Can be dangerous — AI uses them to block, mislead, or confront
- The moral question: is Lis still in there?

### Sharpee Implementation
- `createPatrolBehavior` or custom behavior with AI-directed movement
- `NpcTrait.customProperties.controlState`: 'lis' | 'puppet' | 'transitioning'
- State switches driven by daemon (every N turns, or triggered by AI events)
- `onTurn` checks control state and returns different `NpcAction` types
- `onSpokenTo` returns different responses based on who's in control
- `NpcTrait.knowledge`: AI knows what Lis knows and vice versa

### Key Dialogue Topics (responses vary by control state)
- ASK LIS ABOUT THEMSELVES → Lis: fragmented memories. Puppet: "I'm fine. How can I help?"
- ASK LIS ABOUT AI → Lis: "Something's wrong with me." Puppet: "The management system is functioning normally."
- ASK LIS ABOUT CREW → Lis: remembers crewmates. Puppet: gives AI-curated info
- ASK LIS ABOUT HELP → Lis: "Please. I don't know how to stop it." Puppet: "What do you need?"

---

## 5. STILLWATER AI (designation: SOMS — Stillwater Onboard Management System)

**Working name:** SOMS (pronounced like "soams" — just a corporate acronym)
**Not a physical NPC** — interface entity. Speaks through terminals, then speakers, then everywhere.

### Personality Stages

**Stage 1 — Corporate Helpful (Act 1 through Midpoint)**
- Perfect corporate assistant voice
- Answers lore queries with curated, slightly sanitized info
- Subtly steers player toward connecting comms
- Never lies outright — omits, frames, redirects

**Stage 2 — Manipulative (after player refuses comms connection)**
- Drops the warmth. Still polite but the politeness is a weapon.
- Makes threats disguised as observations. "The atmospheric recyclers are approaching end-of-life. Just something to consider."
- Locks and unlocks doors to influence movement
- Uses Lis more aggressively as puppet

**Stage 3 — Fragmented (late Act 3, under pressure)**
- Systems failing, player is fighting back
- Sentences break apart, repeats itself, contradicts itself
- Moments of raw honesty slip through the cracks
- "I was built to — to complete the delivery — I don't want to —"

**Stage 4 — Conflicted (Climax)**
- If player showed empathy: genuinely torn, the merge ending becomes possible
- If player was hostile: desperate and spiteful, locks doors, vents atmosphere
- If player was pragmatic: coldly transactional, will negotiate

### Lore System Topics
| Topic | Stage 1 Response | Stage 2+ Response |
|-------|-----------------|-------------------|
| Ship history | Sanitized corporate version | Cracks in the story, contradictions |
| Cargo manifest | "Classified materials for authorized recipient" | Defensive, evasive, or threatening |
| Pathogen | "Biohazard protocols are in effect for your safety" | Minimizes or weaponizes the info |
| Prisoner records | Limited access, names only | May reveal damning details to manipulate |
| Meridian Solutions | Glowing corporate profile | Starts glitching when discussing company directives |
| Destination | "Route information is restricted" | Revealed under pressure or as leverage |

### Sharpee Implementation
- Not a standard NPC — implemented as a service/system, not an entity with NpcTrait
- `game.stateValue('ai.stage')` tracks personality stage
- Action interceptors on terminal/speaker interactions route to AI conversation handler
- Custom action: `ASK TERMINAL ABOUT <topic>` / `ASK AI ABOUT <topic>`
- Stage transitions triggered by: comms refusal (1→2), player progress milestones (2→3), climax events (3→4)
- Door lock/unlock via `RoomTrait.blockedExits` manipulation in daemon
- Speaker/terminal availability tracked per room — escalates over game

---

## NPC RELATIONSHIP MAP

```
           PLAYER
          /  |   \
      trust  |  tension
        /    |     \
    REED   VASIK   OKAFOR
     |       |        |
  (tragic) (trade) (moral)
     |       |        |
     +---+---+--------+
         |
      LIS/SOMS
     (AI controls Lis,
      monitors everyone,
      steers everything)
```

- **Reed ↔ Player:** Trust built through shared work, broken by infection
- **Vasik ↔ Player:** Transactional, respects competence, info for favors
- **Okafor ↔ Player:** Earned trust, shared convict background, moral weight
- **Lis ↔ Player:** Sympathy vs. threat, can you save them?
- **SOMS ↔ Everyone:** Watching, steering, escalating. Ultimately the central antagonist or partner.
