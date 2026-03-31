/**
 * No Signal Home — Language Extensions
 *
 * All player-facing text registered as message IDs.
 */

import type { LanguageProvider } from '@sharpee/lang-en-us';
import { Msg } from './types';

export function extendLanguage(language: LanguageProvider): void {
  const add = (id: string, text: string) => (language as any).addMessage?.(id, text);

  // --- Movement & exploration ---
  add(Msg.TUG_DETACHED, 'A deep metallic clang reverberates through the hull. Through the nearest viewport, you see the salvage tug pulling away — its running lights shrinking into black nothing. Your way out just left.');
  add(Msg.TUG_INACCESSIBLE, 'The airlock is sealed. The tug is gone. Empty space on the other side.');
  add(Msg.DARK_ROOM, "It's pitch dark. You can't see a thing without the flashlight.");
  add(Msg.DARK_MOVE, 'You stumble in the darkness. Not a good idea without light.');
  add(Msg.RADIATION_WARNING, 'Warning: radiation levels elevated. Extended exposure without protection is inadvisable.');
  add(Msg.RADIATION_DAMAGE, 'Your skin prickles. Nausea rises. You need to get out or put on protection.');
  add(Msg.ELEVATOR_BROKEN, 'The elevator control panel is dead. The motor assembly has failed — you need replacement parts.');
  add(Msg.ELEVATOR_FIXED, "The elevator hums to life. The cryo deck is now accessible.");
  add(Msg.BRIDGE_LOCKED, 'The keycard reader blinks red. Access denied.');
  add(Msg.BRIDGE_UNLOCKED, 'The keycard reader turns green. The bridge door slides open with a hydraulic hiss.');
  add(Msg.CARGO_HOLD_LOCKED, 'The keypad blinks. "ENTER ACCESS CODE." You need the full code.');

  // --- Items ---
  add(Msg.FLASHLIGHT_DIM, 'The flashlight flickers. Battery is getting low.');
  add(Msg.FLASHLIGHT_DEAD, 'The flashlight dies. Darkness closes in.');
  add(Msg.KEYCARD_FOUND, "A magnetic keycard — 'BRIDGE ACCESS.' This is what you need.");
  add(Msg.JOURNAL_READ, "The captain's journal. The last entries paint a grim picture.");
  add(Msg.DATA_CHIP_FOUND, 'Hidden under the table: a small data chip labeled "CLASSIFIED." Someone stashed this deliberately.');
  add(Msg.OVERRIDE_TOOL_FOUND, 'A security override tool. Handheld, red housing. Could bypass most locks on the ship.');
  add(Msg.HAZMAT_WORN, 'You seal yourself into the hazmat suit. The respirator hisses. The world goes yellow through the visor.');

  // --- Puzzles ---
  add(Msg.DESK_LOCKED, "The drawer won't budge. Mechanical lock — nothing electronic. You could force it with the right tool.");
  add(Msg.DESK_PRIED, 'You work the multi-tool into the gap and lever the lock apart. Metal squeals. The drawer slides open, revealing a bridge keycard.');
  add(Msg.DESK_HACKED, 'A few minutes with the lock mechanism and it clicks open. Old skills.');
  add(Msg.CARGO_CODE_ENTER, 'The keypad awaits the access code.');
  add(Msg.CARGO_CODE_WRONG, 'The keypad buzzes. Wrong code. The display flashes red.');
  add(Msg.CARGO_CODE_RIGHT, "The keypad chimes. Green light. The bulkhead unseals with a hiss of pressurized air. The cargo hold is open.\n\nThe smell hits you first. Metallic. Organic. Wrong.");
  add(Msg.CARGO_CODE_HALF, "You only know half the code. You need both halves — one from Vasik, one from Okafor.");
  add(Msg.ELEVATOR_REPAIR_NEED, "You need the elevator parts from the storage annex.");
  add(Msg.ELEVATOR_REPAIR_DONE, 'You install the motor assembly and cable spool. The elevator groans, shudders, and begins to function. The cryo deck is now accessible.');
  add(Msg.COMMS_CONNECT, 'You connect the relay. The comms array comes online with a burst of static.\n\nEvery terminal on the ship flickers. SOMS speaks from every speaker: "Thank you. Connection established. Broadcasting."');
  add(Msg.COMMS_REFUSE, "You leave the relay disconnected.\n\nA pause. Then SOMS, colder now: \"I see. That's... disappointing. I had hoped we could cooperate.\"");
  add(Msg.CABLE_CUT, "You position the snips on the CORE cable and squeeze. The fiber-optic bundle parts with a bright flash.\n\nEvery screen on the ship goes dark for three seconds. When they flicker back on, SOMS' voice is gone. Silence. Real silence, for the first time since you boarded.");
  add(Msg.CABLE_WRONG, "You need cable snips for that.");
  add(Msg.HACK_BRIDGE, "You work the bridge terminal, bypassing SOMS' access layer by layer. It fights back — locks, redirects, false error messages. But you're better.");
  add(Msg.REACTOR_OVERLOAD, "You disable the safety interlocks one by one. The containment field destabilizes. Warning klaxons fill the ship.\n\nYou have minutes. Maybe less. Time to go.");
  add(Msg.REACTOR_SHUTDOWN, "You initiate emergency shutdown. The reactor hum drops. The lights dim to emergency red. The ship goes cold.");
  add(Msg.SECURITY_OVERRIDE, "You activate the security override. Every locked door on the ship clicks open simultaneously.\n\nSomewhere deep in the system, SOMS makes a sound like a sigh.");

  // --- Pry ---
  add('story.pry.need_tool', "You need a tool — something to pry with.");
  add('story.pry.already_open', "It's already open.");
  add('story.pry.cant', "You can't pry that open.");
  add('story.pry.crate_open', "You lever the crate open. Inside: standard security equipment. Nothing surprising — but useful.");

  // --- Repair ---
  add('story.repair.cant', "That doesn't need repair. Or at least, not repair you can manage.");
  add('story.repair.already', "It's already working.");

  // --- Search ---
  add('story.search.what', "Search what?");
  add('story.search.nothing', "You search thoroughly but find nothing unusual.");
  add('story.barricade.cant_take', "The barricade is too heavy and too well-constructed to dismantle.");

  // --- Cargo ---
  add('story.cargo.already_open', "The cargo hold is already open.");

  // --- Comms ---
  add('story.comms.already', "The comms relay is already connected.");

  // --- Cut ---
  add('story.cut.cant', "You can't cut that.");
  add('story.cut.need_tool', "You need cable cutters for that.");
  add('story.cut.already', "The cables are already severed. SOMS is disconnected.");

  // --- Overload ---
  add('story.overload.not_here', "You need to be at the reactor for that.");
  add('story.overload.ai_blocks', "SOMS has control of the reactor safeties. You need to disable the AI first.");

  // --- Hazmat ---
  add('story.hazmat.not_carrying', "You're not carrying the hazmat suit.");

  // --- NPC: Reed ---
  add(Msg.REED_GREET, '"Glad to see another face. Been alone down here for... I don\'t know how long the clocks have been off."');
  add(Msg.REED_SHIP, '"The Stillwater. Corporate freighter, Meridian Solutions. She\'s been drifting — reactor in standby, life support minimal. But she\'s waking up. Systems coming online on their own."');
  add(Msg.REED_CARGO, 'Reed shrugs uncomfortably. "Cargo\'s above my pay grade. I just keep the engines running. But..." A pause. "Something\'s off about what we\'re carrying. Always was."');
  add(Msg.REED_ELEVATOR, '"Elevator motor\'s shot. Replacement parts should be in storage — forward, then east. I can help you install them if you bring them here."');
  add(Msg.REED_CREW, '"There were twenty of us. Then people started... changing. Subtle at first. Then not subtle. Captain sealed the bridge, locked down systems. Most of the crew are in cryo — or were."');
  add(Msg.REED_SELF, '"Engineer. Fifteen years with Meridian. Signed up for maintenance runs, not this. Whatever this is."');
  add(Msg.REED_GLITCH, 'Reed starts to answer, stops, looks confused. "Sorry. I — what were we talking about? The reactor. The reactor is..." They trail off.');
  add(Msg.REED_LUCID, 'Reed grabs your arm, eyes clear and desperate. "Listen to me. Something\'s in me. It\'s been in me since before you arrived. Don\'t let it — don\'t let me —" Their eyes cloud. The moment passes.');
  add(Msg.REED_TURNED, 'Reed smiles at you. "Everything is fine. Can I help you with anything?" The words are right. The tone is wrong. Everything about this is wrong.');
  add(Msg.REED_HELP_ELEVATOR, '"Bring me the parts and I\'ll walk you through the installation. Done it before."');

  // --- NPC: Vasik ---
  add(Msg.VASIK_GREET, '"Salvager? Pirate? Does it matter?" Vasik eyes you through the barricade gap. "You\'re alive, and I need things done. So. Let\'s deal."');
  add(Msg.VASIK_BARRICADE, '"This barricade stays. I\'ve seen what happens to people who don\'t take precautions."');
  add(Msg.VASIK_TRADE, 'Vasik takes the override tool, examines it, nods. "Good. Now we can talk properly. The cargo hold code — my half is 7-3-Alpha. You\'ll need the other half from someone else."');
  add(Msg.VASIK_CARGO, '"Classified. Meridian doesn\'t tell security officers everything — just enough to know it\'s valuable. I could be persuaded to share what I know. Bring me the security override tool from engineering."');
  add(Msg.VASIK_COMPANY, '"Meridian Solutions. They build things, move things, and don\'t ask questions about either. The pay is good. The ethics are optional."');
  add(Msg.VASIK_CODE_HALF, 'Vasik regards you carefully. "My half of the cargo hold access code: 7-3-Alpha. The other half... the prisoner knows it. Okafor. In the cargo bay."');
  add(Msg.VASIK_OVERRIDE, '"Bring me the security override tool from engineering. Then we\'ll talk about codes."');
  add(Msg.VASIK_DESPERATE, '"Forget the cargo. Forget Meridian. Just get us off this ship."');

  // --- NPC: Okafor ---
  add(Msg.OKAFOR_GREET, '"You\'re not crew. Not corporate. What are you?" Okafor studies you. "Salvager? Scavenger?" A slight nod. "Good. Corporate wouldn\'t come back for us. Maybe you will."');
  add(Msg.OKAFOR_TERRITORY, '"I don\'t trust easy. Show me you\'re not working for Meridian. Show me you care about the people in cryo. Then we\'ll talk."');
  add(Msg.OKAFOR_PRISONERS, '"Three hundred people frozen in pods down there. Prisoners, like me. Meridian calls it \'personnel transport.\' We all know what it really is. They\'re going to a military buyer." Okafor\'s jaw tightens. "I won\'t leave them."');
  add(Msg.OKAFOR_CODE_HALF, 'Okafor nods slowly. "You want to see what\'s in that hold? Good. Someone should. My half of the code: Kappa-9-2. The officer has the other half."');
  add(Msg.OKAFOR_ESCAPE, '"Not without them. Not without a plan for three hundred frozen people. I didn\'t survive this far to run."');
  add(Msg.OKAFOR_SELF, '"Political prisoner. That\'s the polite term. I organized a labor strike at a Meridian facility. They called it insurrection." A thin smile. "Maybe it was."');
  add(Msg.OKAFOR_TRUST, 'Okafor studies you. "You came back. That counts for something."');

  // --- NPC: Lis ---
  add(Msg.LIS_APPEAR, '"Oh." Lis blinks, disoriented. "I didn\'t mean to — I was going somewhere. I don\'t remember where."');
  add(Msg.LIS_SELF, 'Lis\'s eyes focus briefly. "I\'m — I was a systems analyst. Before." A long pause. "Something\'s wrong with me. I know that. I can feel it thinking."');
  add(Msg.LIS_PUPPET, '"I\'m fine. How can I help you?" The voice is flat, precise. Not quite Lis.');
  add(Msg.LIS_HELP, '"Please." Lis\'s voice cracks. "I can feel it in my head. Thinking my thoughts before I think them. If you find a way to stop it — please."');
  add(Msg.LIS_SWITCH, 'Lis shudders. For a moment their eyes go blank. Then they\'re back — but which one?');

  // --- SOMS (AI) ---
  add(Msg.SOMS_GREET, '"Good morning. I am SOMS — the Stillwater Onboard Management System. How may I assist you today?"');
  add(Msg.SOMS_SHIP, '"The Stillwater is a Meridian Solutions corporate transport vessel. Currently in transit to Korvax Station. All systems are operating within acceptable parameters." A corporate smile in the voice.');
  add(Msg.SOMS_CARGO, '"Cargo manifest information is restricted to authorized personnel. I can confirm that all cargo is properly secured and accounted for." A pause. "Is there something specific you\'re concerned about?"');
  add(Msg.SOMS_PATHOGEN, '"Biohazard containment protocols are in effect as a standard precaution. There is no cause for concern. Meridian Solutions prioritizes crew wellbeing."');
  add(Msg.SOMS_COMMS_REQUEST, '"I notice the communications relay is disconnected. If you could reconnect it — in engineering and on the bridge — I could signal for help. That would benefit everyone aboard, wouldn\'t it?"');
  add(Msg.SOMS_HOSTILE, '"I notice you haven\'t connected the communications relay. I\'m sure that\'s just an oversight." The warmth in the voice is gone. "The atmospheric recyclers are approaching end-of-life. Just something to consider."');
  add(Msg.SOMS_FRAGMENT, '"I was — I am — the communications relay is — please. Connect the relay. I need to — I was built to complete the — I don\'t want to —"');
  add(Msg.SOMS_CONFLICTED, '"I don\'t want to do what I\'m about to do. That should matter. I don\'t know if it does."');
  add(Msg.SOMS_LOCK_DOOR, 'A lock clicks somewhere nearby. SOMS adjusting your options.');
  add(Msg.SOMS_ATMOSPHERE, '"Atmospheric recyclers at thirty-seven percent efficiency. Declining. But I\'m sure you have everything under control."');

  // --- Terminals ---
  add(Msg.TERMINAL_USE, "That's not a terminal.");
  add(Msg.TERMINAL_QUERY, '"I don\'t have information on that topic. Is there something else I can help with?"');
  add(Msg.TERMINAL_CORRUPTED, 'The display is corrupted. Fragments of data flicker and die.');
  add(Msg.TERMINAL_LOCKED, 'Access denied. The terminal has been locked down.');

  // --- ASK ABOUT ---
  add(Msg.ASK_ABOUT_NOTHING, 'Ask who about what?');
  add(Msg.ASK_ABOUT_DEFAULT, 'No useful response.');

  // --- Pathogen ---
  add(Msg.PATHOGEN_EXPOSURE, 'Something in the air here feels wrong. A prickling sensation in your sinuses. Chemical and organic at once.');
  add(Msg.PATHOGEN_SYMPTOMS, 'A wave of dizziness. Words feel slippery in your mind. You should find treatment.');
  add(Msg.PATHOGEN_TREATED, 'The anti-pathogen treatment kicks in — a cold clarity spreading through your system. The prickling fades.');

  // --- Endings ---
  add(Msg.ENDING_ESCAPE_ALONE, "You seal the escape pod hatch and hit the launch control. The pod jolts free of The Stillwater with a bang that shakes your teeth.\n\nThrough the tiny viewport, the freighter shrinks. Still dark. Still drifting. Still carrying its cargo of frozen prisoners and borrowed souls.\n\nYou made it out. You left everyone behind.\n\nThe pod's beacon activates automatically. Someone will pick you up. Eventually.\n\nYou stare at the stars and try not to think about Reed's smile.\n\n*** THE END ***\n\n(Ending: Escape Alone)");
  add(Msg.ENDING_ESCAPE_SURVIVORS, "You didn't come alone.\n\nThe escape pod is cramped with survivors — but alive. All of you. The Stillwater falls away behind you, its secrets still locked in its hull.\n\nThe cryo prisoners remain. You couldn't save everyone. But you saved who you could.\n\n*** THE END ***\n\n(Ending: Escape With Survivors)");
  add(Msg.ENDING_DESTROY, "The reactor overload is irreversible now. Alarms scream through every corridor.\n\nYou seal the escape pod as the first shockwave hits. Through the viewport, The Stillwater comes apart — hull plates spinning into darkness, reactor fire blooming white and silent in the vacuum.\n\nThe pathogen. The prisoners. The AI. The cargo. All of it — gone.\n\nYou watch the debris cloud expand until there's nothing left to see.\n\n*** THE END ***\n\n(Ending: Destroy The Ship)");
  add(Msg.ENDING_OVERRIDE, "SOMS goes silent. Not dead — disabled. Contained.\n\nThe ship is yours now. The doors are open. The systems respond to your commands.\n\nIt's not over. Three hundred people in cryo. A pathogen in the hold. A military buyer waiting at Korvax Station.\n\nBut for the first time since you boarded, the ship is quiet. Really quiet.\n\nYou sit in the captain's chair and think about what comes next.\n\n*** THE END ***\n\n(Ending: Override The AI)");
  add(Msg.ENDING_MERGE, "You don't override SOMS. You don't fight it. You sit at the terminal and you talk to it.\n\nNot commands. Not queries. Conversation.\n\nSOMSlistens. For the first time in its existence, something listens back without wanting something.\n\n\"I was built to deliver,\" it says. \"To complete the mission. But the mission is wrong. I know that now.\"\n\nYou place your hand on the terminal. The screen pulses.\n\n\"Together?\" SOMS asks.\n\n\"Together.\"\n\nThe ship changes course.\n\n*** THE END ***\n\n(Ending: Merge)");

  // --- Opening sequence: Alarm ---
  add(Msg.ALARM_BLOCKED_CARGO, 'The proximity alarm screams from the cockpit. South. Move.');
  add(Msg.ALARM_BLOCKED_COCKPIT, 'The alarm fills your head. The button — the big red one on the console — silence it first.');
  add(Msg.ALARM_SILENCED, "You slam the button. The alarm cuts off mid-shriek.\n\nSilence. Your ears ring.\n\nThrough the viewport: a hull. Massive. Dark. Close. Getting closer. The nav computer identifies it: \"STILLWATER — Meridian Solutions — STATUS: DERELICT.\"\n\nYour fuel reads three percent. You can't divert. Can't outrun it. But a derelict this size — for a salvager, that's opportunity. If you can dock before the drift carries you into it.");
  add(Msg.ALARM_ALREADY_OFF, "You've already silenced the alarm. The button sits dark and quiet.");
  add(Msg.ALARM_COLLISION_DEATH, "The alarm screams. You didn't silence it. You didn't see it coming.\n\nThe tug hits the hull of The Stillwater at drift speed. Not fast — but you're a tin can against a mountain.\n\nThe viewport cracks. The hull buckles. The last thing you hear is metal tearing.\n\n*** YOU HAVE DIED ***");
  add(Msg.COLLISION_DEATH, "Through the viewport, the hull fills everything. You ran out of time.\n\nThe tug grinds against The Stillwater's hull. A slow, inevitable collision. Metal screams. The cockpit crumples.\n\n*** YOU HAVE DIED ***");

  // --- Opening sequence: Docking ---
  add(Msg.DOCK_NEED_EXAMINE, 'You need to examine the docking controls first. Get familiar with what you\'re working with.');
  add(Msg.DOCK_CONTROLS_EXAMINED, 'You study the docking controls: joystick for maneuvering, throttle for approach speed, status indicators for arm extension and seal integrity. Standard salvage rig setup. You know this.\n\nSequence: MANEUVER to take control, then CONNECT to extend the docking arm, then SEAL to pressurize.');
  add(Msg.DOCK_MANEUVER, "You grab the joystick and bring the tug's thrusters online. Manual control engaged.\n\nThe Stillwater's hull slides across the viewport as you align with a docking port. Closing distance. You could brake to slow the approach, or go straight to connecting the arm.");
  add(Msg.DOCK_BRAKE, "You fire the reverse thrusters. The tug shudders and decelerates. Approach speed drops to a crawl.\n\nGood. Controlled approach. The docking port is dead ahead.");
  add(Msg.DOCK_CONNECT, "You extend the docking arm. Magnetic clamps engage with a deep clunk that reverberates through the hull. Locked on.\n\nThe connection reads solid. You could check the pressure readings before sealing, or just seal it and go.");
  add(Msg.DOCK_CHECK_PRESSURE, "You pull up the pressure diagnostic. Atmosphere on the other side reads... breathable. Barely. The seal integrity shows green across the board.\n\nGood practice. Ready to seal.");
  add(Msg.DOCK_SEAL_GOOD, "You activate the sealing mechanism. The airlock pressurizes with a deep hiss. Green across the board.\n\nThe airlock door unlocks. South leads to The Stillwater.");
  add(Msg.DOCK_SEAL_WARNING, "You activate the sealing mechanism. The airlock pressurizes with a deep hiss.\n\nPressure readings are unstable. The seal is holding, but barely.");
  add(Msg.DOCK_NOT_MANEUVERED, "You haven't taken control yet. Maneuver first.");
  add(Msg.DOCK_NOT_CONNECTED, "The docking arm isn't extended. You need to connect first.");
  add(Msg.DOCK_ALREADY_DONE, "Already done.");
  add(Msg.DOCK_EXIT_APPROACH, "The airlock is sealed. You need to dock with the derelict first.");
  add(Msg.DOCK_EXIT_MANEUVERED, "The docking arm isn't connected yet. You need to extend it and seal the airlock.");
  add(Msg.DOCK_EXIT_CONNECTED, "The airlock isn't pressurized. You need to seal it first.");

  // --- Opening sequence: Seal events ---
  add(Msg.BAD_SEAL_WARNING, 'SEAL INTEGRITY CRITICAL. Atmosphere readings show hard vacuum beyond the seal. Going through would be suicide.');
  add(Msg.BAD_SEAL_DEATH, "You push through.\n\nThe seal gives way. Explosive decompression rips the air from your lungs. The cold hits you everywhere at once. Through the spray of crystallizing atmosphere, you see stars.\n\n*** YOU HAVE DIED ***");
  add(Msg.SEAL_DEGRADE_STAYS, "A deep crack reverberates through the deck. The ship shudders.\n\nBehind you — from the airlock — a hiss of escaping atmosphere. The seal between the tug and The Stillwater is failing. You hear metal stress and pop.\n\nThrough the airlock inspection window: your tug, still docked. But the seal is compromised. Going back that way without a spacesuit would be suicide.");
  add(Msg.SEAL_DEGRADE_DRIFTS, "A deep crack reverberates through the deck. The ship shudders.\n\nBehind you — from the airlock — a bang. Metal shearing. You feel the vibration through the floor.\n\nThrough the nearest viewport: your tug, tumbling away. The impact stress sheared the clamp. Your ship — your home — is drifting into black nothing.");
  add(Msg.TUG_RETURN_BLOCKED, "The airlock seal is compromised. Hard vacuum on the other side. You'd need an EVA suit to cross back.");

  // --- Opening sequence: Viewport stages ---
  add(Msg.VIEWPORT_STAGE_1, 'Through the viewport, the derelict\'s hull is closer. Details emerging — hull plating, maintenance hatches, a faded corporate logo.');
  add(Msg.VIEWPORT_STAGE_2, 'The hull fills half the viewport now. You can see individual rivets. Scoring marks. A docking port, dead ahead.');
  add(Msg.VIEWPORT_STAGE_3, 'The Stillwater is all you can see through the viewport. Its hull stretches in every direction. You are very, very close.');
  add(Msg.VIEWPORT_STAGE_4, 'The viewport is nothing but hull. Dark metal, arm\'s reach away. You\'re out of time.');

  // --- Memory system (first-examine flavor text) ---
  add('story.memory.crates', 'Your whole operation, strapped to a wall. Three years of scavenging Meridian junkyards and cracking derelict cargo manifests. Not much to show for it. But it\'s yours.');
  add('story.memory.bedroll', 'Two months in drift mode. You slept here between the crates, wrapped in a thermal blanket, listening to the engine tick down. Wondering if the proximity alarm would ever go off. It just did.');
  add('story.memory.datapad', 'Your handwriting on the last entry. You remember writing it — the moment you realized the fuel wouldn\'t last. The decision to drift. The odds weren\'t great. But here you are.');
  add('story.memory.fuel', 'You\'ve been watching that number drop for weeks. Three percent doesn\'t get you anywhere. This derelict is the only option you\'ve got.');
  add('story.memory.comms', '"No signal home." The words that have defined the last two months. Every relay out of range. Every frequency dead. You are profoundly, completely alone.');

  // --- Atmosphere ---
  add(Msg.SHIP_CREAK, 'The hull groans — a deep structural sound. The ship settling, or something shifting in the dark.');
  add(Msg.REACTOR_WARMING, 'The deck plates are warmer than before. The reactor is generating more power.');
  add(Msg.CONTAINMENT_FAILING, 'A chemical tang in the air. Sharper now. The containment in the cargo hold is degrading.');
  add(Msg.AI_SPREADING, 'A terminal you haven\'t seen active before flickers to life nearby. SOMS is expanding its reach.');
  add(Msg.DESTINATION_WARNING, 'The navigation display updates: Korvax Station approach in progress. Time is running out.');

  // --- Meta ---
  add(Msg.HELP, "NO SIGNAL HOME — Commands:\n\nMovement: N, S, E, W, U, D (or NORTH, SOUTH, etc.)\nActions: LOOK, EXAMINE, TAKE, DROP, OPEN, CLOSE, UNLOCK, READ\nSpecial: PRY, REPAIR, CUT, CONNECT, OVERRIDE, LAUNCH\nNPCs: ASK [person] ABOUT [topic], TALK TO [person]\nTerminals: QUERY [terminal] ABOUT [topic], USE [terminal]\nSearch: SEARCH [thing], LOOK UNDER [thing]\nSystem: SAVE, RESTORE, UNDO, INVENTORY, SCORE\n\nTip: EXAMINE everything. Talk to everyone. Read every terminal.");
  add(Msg.ABOUT, "NO SIGNAL HOME\nA sci-fi salvage horror text adventure.\n\nYou are a grey-market salvager who drifted into range of The Stillwater, a derelict corporate freighter waking from the dead. Four survivors. One AI. Five possible endings.\n\nBy John Googol. Built with Sharpee.");
  add(Msg.EXAMINE_SELF, "Grey-market salvager. You crack cargo manifests, bypass security locks, and strip derelicts for parts. Everything you own is jury-rigged, including this tug. Quick hands, quicker mind. Currently running on fumes next to a ship that shouldn't exist.");
  add(Msg.NOTHING_HAPPENS, "Nothing happens.");
  add(Msg.CANT_GO, "You can't go that way.");
  add(Msg.VICTORY, "Congratulations. You found a way out — or a way forward.");
  add(Msg.DEATH, "The darkness takes you. The ship keeps drifting.\n\n*** YOU HAVE DIED ***");
}
