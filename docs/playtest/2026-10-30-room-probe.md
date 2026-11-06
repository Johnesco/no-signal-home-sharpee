# Room probe, 2026-10-30

A parser playtest of the walkthrough's 22 rooms. For each room, a fresh game replays `walkthrough.txt` to the moment the player first arrives, then tries one command. Every command runs in its own fresh game, so no probe affects another. 255 commands in all, 10 to 14 per room.

Full report, with every transcript: https://claude.ai/artifact/6wKPqg1xcZnAbvy4yg3hdT (private to John).
Re-run with `python docs/playtest/probe-rooms.py` (about four minutes). The room list and the commands tried are in that script.

## Labels

- **Accomplished**: the command did something, or gave information a player can use, including a refusal that names the next step.
- **Handled**: understood and answered sensibly, but nothing was gained.
- **Rejected**: not understood, an object the room's own text names that doesn't exist, or a reply that contradicts the prose.

Result: 58 accomplished (23%), 47 handled (18%), 150 rejected (59%).

| Step | Room | A | H | R |
|---|---|---|---|---|
| 1 | Tug Cargo Hold | 7 | 1 | 6 |
| 2 | Tug Cockpit | 4 | 1 | 8 |
| 3 | Airlock | 4 | 3 | 5 |
| 4 | Forward Corridor | 3 | 2 | 7 |
| 5 | Lower Mid Corridor | 0 | 2 | 9 |
| 6 | Aft Corridor | 2 | 6 | 3 |
| 7 | Engine Room | 1 | 2 | 10 |
| 8 | Central Junction | 3 | 3 | 5 |
| 9 | Upper Corridor | 4 | 4 | 3 |
| 10 | Captain's Cabin | 2 | 3 | 8 |
| 11 | Bridge | 3 | 1 | 8 |
| 12 | Crew Bunks | 3 | 1 | 7 |
| 13 | Common Area | 0 | 3 | 10 |
| 14 | Lab Corridor | 3 | 2 | 4 |
| 15 | Science Lab | 0 | 0 | 11 |
| 16 | Medbay | 1 | 2 | 8 |
| 17 | Hab Corridor | 3 | 4 | 4 |
| 18 | Mess Hall | 0 | 1 | 10 |
| 19 | Library | 0 | 0 | 11 |
| 20 | Maintenance Shaft | 5 | 3 | 3 |
| 21 | Cargo Bay | 3 | 3 | 6 |
| 22 | Storage Annex | 7 | 0 | 4 |

## Findings

1. **Room descriptions name things that don't exist.** Most of the rejections. Examining something the prose mentions (the claw marks, the pipes, the gouges in the bunks, the quarantine cell) gets "You can't see any such thing." The Science Lab failed all 11 probes: the workbenches, cabinet, samples, terminal and smashed instruments are all missing. The Library and Mess Hall are close behind.
2. **Characters don't talk.** TALK TO gets "doesn't respond" from Reed, Vasik, Okafor and Lis. ASK about obvious topics (the ship, the crew, the code) gets "I don't know anything about that." SOMS greets you at the Library terminal, but TALK TO SOMS gets "You can only talk to people."
3. **Smell and listen contradict the prose.** The Engine Room's hum, the Forward Corridor's oil and the Lab Corridor's chemical smell all get the stock "nothing unusual." In the opening room, LISTEN hears the flashlight, not the alarm.
4. **The opening fights the player's first instincts.** EXAMINE ALARM fails in the hold, where you can hear it. In the cockpit, HIT BUTTON is read as an attack, PUSH RED BUTTON doesn't recognise "red", TURN OFF ALARM is refused without pointing at the button, and the freighter and hull filling the viewport can't be examined.
5. **Messages fire at the wrong time.** "Okafor blocks your way!" and "Vasik blocks your way!" print on simple arrival. The Trespasser rank line ("You are aboard a ship that is not yours", story line 1316) fires in the tug's cockpit, because examining the nav computer pushes the score past 15 before boarding.
6. **LAUNCH POD ends the game from the bridge doorway**, with no confirmation and nothing in the way.
7. **The walkthrough falls out of step with the map.** Once the seal fails the tug is unreachable, so the "take everything" pass tries 14 tug objects from the Forward Corridor and all fail. It also tries the trunk cables in the Storage Annex, and two lines (`overriding security override panel`, `launching escape pod hatch`) aren't valid commands. It still reaches the ending, so the build gate passes.
8. **Lis wanders differently in every `sharpee play` run.** Play isn't seeded the way the tests document is (seed 42), so probes involving Lis are unreliable.
9. **Common verbs are missing:** SIT, USE, HELLO, EXITS, HINT, FOLLOW, CALL, FIX, KNOCK, and CLIMB LADDER (UP works).

## The opening, discussed

What a player sees on the first turn: the `first time` wake-up text, the engine's item list ("You can see a flashlight, a ration bar, and a salvage manifest here."), then the alarm's first nag line. The room's ordinary description, which ends on "The strobe paints everything red, then nothing, then red", appears only on LOOK.

Three voices meet in three paragraphs: authored prose, a flat engine list, and the nag. Suggestions from the discussion, not yet decided or ticketed:

- Keep the authored voice; it is the strongest of the three. Bring the other two up to it.
- Write the items into the scene (Inform calls this an "initial appearance") if Chord supports it, so the list isn't the engine's.
- Move the strobe line into the wake-up text, since few players type LOOK on turn 1.
- Put the nag line that points at the button first ("Somewhere in this tug there is a button that stops it"), since it is the most useful thing a new player can hear.
- State the way to the cockpit plainly. "Somewhere aft" is the only pointer south.

None of this has a ticket yet.
