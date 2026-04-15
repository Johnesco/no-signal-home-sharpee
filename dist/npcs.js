"use strict";
/**
 * No Signal Home — NPC Creation & Behaviors
 *
 * Four NPCs (Reed, Vasik, Okafor, Lis) and the SOMS AI entity.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.lisBehavior = exports.okaforBehavior = exports.vasikBehavior = exports.reedBehavior = void 0;
exports.createNpcs = createNpcs;
exports.getAllBehaviors = getAllBehaviors;
const world_model_1 = require("@sharpee/world-model");
const types_1 = require("./types");
// ============================================================================
// NPC ENTITY CREATION
// ============================================================================
function createNpcs(world, rooms) {
    // --- REED: The Engineer ---
    const reed = world.createEntity('Reed', world_model_1.EntityType.ACTOR);
    reed.add(new world_model_1.IdentityTrait({
        name: 'Reed',
        description: 'A wiry engineer in grease-stained coveralls. Practical eyes, calloused hands. Looks exhausted but alert.',
        aliases: ['engineer', 'the engineer', 'reed'],
        adjectives: [],
        properName: true,
    }));
    reed.add(new world_model_1.ActorTrait({ isPlayer: false }));
    reed.add(new world_model_1.NpcTrait({ behaviorId: 'story-reed', canMove: true }));
    world.moveEntity(reed.id, rooms.engineering);
    // --- VASIK: The Corporate Officer ---
    const vasik = world.createEntity('Vasik', world_model_1.EntityType.ACTOR);
    vasik.add(new world_model_1.IdentityTrait({
        name: 'Vasik',
        description: 'A sharp-featured corporate officer in a rumpled Meridian Solutions uniform. Eyes that calculate everything.',
        aliases: ['officer', 'the officer', 'corporate officer', 'vasik'],
        adjectives: ['corporate'],
        properName: true,
    }));
    vasik.add(new world_model_1.ActorTrait({ isPlayer: false }));
    vasik.add(new world_model_1.NpcTrait({ behaviorId: 'story-vasik', canMove: false }));
    world.moveEntity(vasik.id, rooms.commonArea);
    // --- OKAFOR: The Thawed Prisoner ---
    const okafor = world.createEntity('Okafor', world_model_1.EntityType.ACTOR);
    okafor.add(new world_model_1.IdentityTrait({
        name: 'Okafor',
        description: 'A muscular figure in prison transport grays, watchful and tense. Someone who has learned patience the hard way.',
        aliases: ['prisoner', 'the prisoner', 'okafor'],
        adjectives: ['thawed'],
        properName: true,
    }));
    okafor.add(new world_model_1.ActorTrait({ isPlayer: false }));
    okafor.add(new world_model_1.NpcTrait({ behaviorId: 'story-okafor', canMove: false }));
    world.moveEntity(okafor.id, rooms.cargoBay);
    // --- LIS: The AI-Compromised Crew Member ---
    const lis = world.createEntity('Lis', world_model_1.EntityType.ACTOR);
    lis.add(new world_model_1.IdentityTrait({
        name: 'Lis',
        description: 'A crew member in a standard-issue jumpsuit. Something is off — pauses too long, tilts their head at odd angles. Eyes that sometimes focus on nothing.',
        aliases: ['crew member', 'the crew member', 'lis'],
        adjectives: ['compromised'],
        properName: true,
        concealed: true,
    }));
    lis.add(new world_model_1.ActorTrait({ isPlayer: false }));
    lis.add(new world_model_1.NpcTrait({ behaviorId: 'story-lis', canMove: true }));
    world.moveEntity(lis.id, rooms.library); // Starts hidden, appears mid Act 2
    // --- SOMS: Terminal Entity (not an NPC actor) ---
    const soms = world.createEntity('SOMS terminal', world_model_1.EntityType.ITEM);
    soms.add(new world_model_1.IdentityTrait({
        name: 'SOMS terminal',
        description: 'A terminal interface for SOMS — the Stillwater Onboard Management System. The screen glows faintly.',
        aliases: ['soms', 'ai', 'management system', 'computer', 'system'],
        adjectives: ['SOMS', 'onboard'],
        article: 'a',
        properName: false,
    }));
    soms.add(new world_model_1.SceneryTrait({ mentioned: false, visible: true }));
    soms.add(new types_1.TerminalTrait('soms-main', true));
    world.moveEntity(soms.id, rooms.library);
    return {
        reed: reed.id,
        vasik: vasik.id,
        okafor: okafor.id,
        lis: lis.id,
    };
}
// ============================================================================
// NPC BEHAVIORS
// ============================================================================
const REED_IDLE_NORMAL = [
    'Reed adjusts a pipe fitting, muttering about pressure differentials.',
    'Reed wipes grease from their hands. "Ship\'s waking up. Slowly."',
    'Reed checks a gauge and frowns.',
    '"Reactor\'s running hotter than it should," Reed says to no one in particular.',
];
const REED_IDLE_GLITCH = [
    'Reed starts a sentence, stops, starts again with different words.',
    'Reed stares at the wall for a long moment, then shakes it off.',
    '"The reactor — the reactor is — have we talked about the reactor?"',
    'Reed repeats the same adjustment they made a moment ago.',
];
const REED_IDLE_TURNED = [
    'Reed watches you. Smiling.',
    'Reed stands perfectly still, head tilted slightly.',
    '"Everything is fine," Reed says. Their voice is flat.',
    'Reed hums something. Not a song you recognize.',
];
exports.reedBehavior = {
    id: 'story-reed',
    name: 'Reed',
    onTurn(context) {
        if (!context.playerVisible)
            return [];
        const stage = context.world.getStateValue(types_1.StateKeys.REED_STAGE) ?? 1;
        // First meeting
        if (!context.world.getStateValue(types_1.StateKeys.MET_REED)) {
            context.world.setStateValue(types_1.StateKeys.MET_REED, true);
            context.world.awardScore('story.score.meet_reed', 5, 'Meeting Reed');
            return [{
                    type: 'speak',
                    messageId: 'npc.speech',
                    data: { npcName: 'Reed', text: 'Reed looks up sharply, then relaxes. "Another person. Thank god. I thought I was the only one left awake."' },
                }];
        }
        if (context.random.chance(0.35)) {
            let pool;
            if (stage <= 1)
                pool = REED_IDLE_NORMAL;
            else if (stage === 2)
                pool = REED_IDLE_GLITCH;
            else
                pool = REED_IDLE_TURNED;
            return [{
                    type: 'emote',
                    messageId: 'npc.emote',
                    data: { npcName: 'Reed', text: context.random.pick(pool) },
                }];
        }
        return [];
    },
    onPlayerEnters(context) {
        const stage = context.world.getStateValue(types_1.StateKeys.REED_STAGE) ?? 1;
        if (stage >= 4) {
            return [{
                    type: 'emote',
                    messageId: 'npc.emote',
                    data: { npcName: 'Reed', text: 'Reed is here. Watching. Smiling at nothing.' },
                }];
        }
        return [];
    },
};
const VASIK_IDLE = [
    'Vasik straightens their uniform collar. Old habits.',
    'Vasik\'s eyes flick to you, then away. Calculating.',
    '"Meridian will send a retrieval team," Vasik says. "Eventually."',
];
exports.vasikBehavior = {
    id: 'story-vasik',
    name: 'Vasik',
    onTurn(context) {
        if (!context.playerVisible)
            return [];
        if (!context.world.getStateValue(types_1.StateKeys.MET_VASIK)) {
            context.world.setStateValue(types_1.StateKeys.MET_VASIK, true);
            context.world.awardScore('story.score.meet_vasik', 5, 'Meeting Vasik');
            return [{
                    type: 'speak',
                    messageId: 'npc.speech',
                    data: { npcName: 'Vasik', text: 'A voice from behind the barricade: "Stop. Who are you? You\'re not crew." A pause. "You\'re from the tug. The convict."' },
                }];
        }
        if (context.random.chance(0.25)) {
            return [{
                    type: 'emote',
                    messageId: 'npc.emote',
                    data: { npcName: 'Vasik', text: context.random.pick(VASIK_IDLE) },
                }];
        }
        return [];
    },
    onPlayerEnters() {
        return [];
    },
};
const OKAFOR_IDLE = [
    'Okafor keeps one eye on the corridor. Always watching.',
    'Okafor adjusts the barricade, testing its strength.',
    '"Three hundred people in cryo," Okafor says quietly. "And nobody cares."',
];
exports.okaforBehavior = {
    id: 'story-okafor',
    name: 'Okafor',
    onTurn(context) {
        if (!context.playerVisible)
            return [];
        if (!context.world.getStateValue(types_1.StateKeys.MET_OKAFOR)) {
            context.world.setStateValue(types_1.StateKeys.MET_OKAFOR, true);
            context.world.awardScore('story.score.meet_okafor', 5, 'Meeting Okafor');
            return [{
                    type: 'speak',
                    messageId: 'npc.speech',
                    data: { npcName: 'Okafor', text: '"You\'re in my bay." Okafor steps out from behind a container, arms folded. "Corporate? Crew?" A hard stare. "Or something else?"' },
                }];
        }
        if (context.random.chance(0.25)) {
            return [{
                    type: 'emote',
                    messageId: 'npc.emote',
                    data: { npcName: 'Okafor', text: context.random.pick(OKAFOR_IDLE) },
                }];
        }
        return [];
    },
    onPlayerEnters(context) {
        if (!context.world.getStateValue(types_1.StateKeys.MET_OKAFOR)) {
            return [{
                    type: 'emote',
                    messageId: 'npc.emote',
                    data: { npcName: 'Okafor', text: 'Someone is here. They step into view from behind a shipping container — watchful, tense, blocking your path.' },
                }];
        }
        return [];
    },
};
exports.lisBehavior = {
    id: 'story-lis',
    name: 'Lis',
    onTurn(context) {
        if (!context.playerVisible)
            return [];
        const stage = context.world.getStateValue(types_1.StateKeys.LIS_STAGE) ?? 0;
        if (stage === 0)
            return []; // Not yet revealed
        if (!context.world.getStateValue(types_1.StateKeys.MET_LIS)) {
            context.world.setStateValue(types_1.StateKeys.MET_LIS, true);
            return [{
                    type: 'speak',
                    messageId: 'npc.speech',
                    data: { npcName: 'Lis', text: '"Oh." Lis blinks, confused. "I didn\'t — I thought I was going to storage." A pause. A head tilt. "How can I help you?"' },
                }];
        }
        if (context.random.chance(0.3)) {
            const isLis = context.random.chance(0.4); // 40% chance of being "real" Lis
            if (isLis) {
                return [{
                        type: 'emote',
                        messageId: 'npc.emote',
                        data: { npcName: 'Lis', text: 'Lis winces, presses a hand to their temple. "Sorry. I — lost the thread for a moment."' },
                    }];
            }
            return [{
                    type: 'emote',
                    messageId: 'npc.emote',
                    data: { npcName: 'Lis', text: 'Lis stands very still, eyes focused on something you can\'t see. Then: "Is there something you need?"' },
                }];
        }
        return [];
    },
    onPlayerEnters() { return []; },
};
function getAllBehaviors() {
    return [exports.reedBehavior, exports.vasikBehavior, exports.okaforBehavior, exports.lisBehavior];
}
//# sourceMappingURL=npcs.js.map