/**
 * No Signal Home — NPC Creation & Behaviors
 *
 * Four NPCs (Reed, Vasik, Okafor, Lis) and the SOMS AI entity.
 */

import {
  WorldModel,
  IFEntity,
  EntityType,
  IdentityTrait,
  ActorTrait,
  NpcTrait,
  SceneryTrait,
} from '@sharpee/world-model';
import type { NpcBehavior, NpcContext, NpcAction } from '@sharpee/stdlib';
import { RoomIds, NpcIds, StateKeys, TerminalTrait } from './types';
import { NpcText } from './language';

// ============================================================================
// NPC BEHAVIOR MESSAGE ID HELPERS
// ============================================================================

/** Build a message ID from an NpcText key for use in NPC actions */
function npcMsg(key: keyof typeof NpcText): string {
  return `npc.behavior.${key}`;
}

// ============================================================================
// NPC ENTITY CREATION
// ============================================================================

export function createNpcs(world: WorldModel, rooms: RoomIds): NpcIds {
  // --- REED: The Engineer ---
  const reed = world.createEntity('Reed', EntityType.ACTOR);
  reed.add(new IdentityTrait({
    name: 'Reed',
    description: 'A wiry engineer in grease-stained coveralls. Practical eyes, calloused hands. Looks exhausted but alert.',
    aliases: ['engineer', 'the engineer', 'reed'],
    adjectives: [],
    properName: true,
  }));
  reed.add(new ActorTrait({ isPlayer: false }));
  reed.add(new NpcTrait({ behaviorId: 'story-reed', canMove: true }));
  world.moveEntity(reed.id, rooms.engineering);

  // --- VASIK: The Corporate Officer ---
  const vasik = world.createEntity('Vasik', EntityType.ACTOR);
  vasik.add(new IdentityTrait({
    name: 'Vasik',
    description: 'A sharp-featured corporate officer in a rumpled Meridian Solutions uniform. Eyes that calculate everything.',
    aliases: ['officer', 'the officer', 'corporate officer', 'vasik'],
    adjectives: ['corporate'],
    properName: true,
  }));
  vasik.add(new ActorTrait({ isPlayer: false }));
  vasik.add(new NpcTrait({ behaviorId: 'story-vasik', canMove: false }));
  world.moveEntity(vasik.id, rooms.commonArea);

  // --- OKAFOR: The Thawed Prisoner ---
  const okafor = world.createEntity('Okafor', EntityType.ACTOR);
  okafor.add(new IdentityTrait({
    name: 'Okafor',
    description: 'A muscular figure in prison transport grays, watchful and tense. Someone who has learned patience the hard way.',
    aliases: ['prisoner', 'the prisoner', 'okafor'],
    adjectives: ['thawed'],
    properName: true,
  }));
  okafor.add(new ActorTrait({ isPlayer: false }));
  okafor.add(new NpcTrait({ behaviorId: 'story-okafor', canMove: false }));
  world.moveEntity(okafor.id, rooms.cargoBay);

  // --- LIS: The AI-Compromised Crew Member ---
  const lis = world.createEntity('Lis', EntityType.ACTOR);
  lis.add(new IdentityTrait({
    name: 'Lis',
    description: 'A crew member in a standard-issue jumpsuit. Something is off — pauses too long, tilts their head at odd angles. Eyes that sometimes focus on nothing.',
    aliases: ['crew member', 'the crew member', 'lis'],
    adjectives: ['compromised'],
    properName: true,
    concealed: true,
  }));
  lis.add(new ActorTrait({ isPlayer: false }));
  lis.add(new NpcTrait({ behaviorId: 'story-lis', canMove: true }));
  world.moveEntity(lis.id, rooms.library); // Starts hidden, appears mid Act 2

  // --- SOMS: Terminal Entity (not an NPC actor) ---
  const soms = world.createEntity('SOMS terminal', EntityType.ITEM);
  soms.add(new IdentityTrait({
    name: 'SOMS terminal',
    description: 'A terminal interface for SOMS — the Stillwater Onboard Management System. The screen glows faintly.',
    aliases: ['soms', 'ai', 'management system', 'computer', 'system'],
    adjectives: ['SOMS', 'onboard'],
    article: 'a',
    properName: false,
  }));
  soms.add(new SceneryTrait({ mentioned: false, visible: true }));
  soms.add(new TerminalTrait('soms-main', true));
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

const REED_IDLE_NORMAL: (keyof typeof NpcText)[] = [
  'REED_IDLE_PIPE', 'REED_IDLE_GREASE', 'REED_IDLE_GAUGE', 'REED_IDLE_REACTOR',
];

const REED_IDLE_GLITCH: (keyof typeof NpcText)[] = [
  'REED_GLITCH_SENTENCE', 'REED_GLITCH_STARE', 'REED_GLITCH_REPEAT_Q', 'REED_GLITCH_ADJUSTMENT',
];

const REED_IDLE_TURNED: (keyof typeof NpcText)[] = [
  'REED_TURNED_WATCH', 'REED_TURNED_STILL', 'REED_TURNED_FINE', 'REED_TURNED_HUM',
];

export const reedBehavior: NpcBehavior = {
  id: 'story-reed',
  name: 'Reed',
  onTurn(context: NpcContext): NpcAction[] {
    if (!context.playerVisible) return [];
    const stage = context.world.getStateValue(StateKeys.REED_STAGE) ?? 1;

    // First meeting
    if (!context.world.getStateValue(StateKeys.MET_REED)) {
      context.world.setStateValue(StateKeys.MET_REED, true);
      context.world.awardScore('story.score.meet_reed', 5, 'Meeting Reed');
      return [{
        type: 'speak',
        messageId: npcMsg('REED_MEET'),
        data: { npcName: 'Reed' },
      }];
    }

    if (context.random.chance(0.35)) {
      let pool: (keyof typeof NpcText)[];
      if (stage <= 1) pool = REED_IDLE_NORMAL;
      else if (stage === 2) pool = REED_IDLE_GLITCH;
      else pool = REED_IDLE_TURNED;
      return [{
        type: 'emote',
        messageId: npcMsg(context.random.pick(pool)),
        data: { npcName: 'Reed' },
      }];
    }
    return [];
  },
  onPlayerEnters(context: NpcContext): NpcAction[] {
    const stage = context.world.getStateValue(StateKeys.REED_STAGE) ?? 1;
    if (stage >= 4) {
      return [{
        type: 'emote',
        messageId: npcMsg('REED_ENTER_TURNED'),
        data: { npcName: 'Reed' },
      }];
    }
    return [];
  },
};

const VASIK_IDLE: (keyof typeof NpcText)[] = [
  'VASIK_IDLE_COLLAR', 'VASIK_IDLE_CALCULATE', 'VASIK_IDLE_RETRIEVAL',
];

export const vasikBehavior: NpcBehavior = {
  id: 'story-vasik',
  name: 'Vasik',
  onTurn(context: NpcContext): NpcAction[] {
    if (!context.playerVisible) return [];

    if (!context.world.getStateValue(StateKeys.MET_VASIK)) {
      context.world.setStateValue(StateKeys.MET_VASIK, true);
      context.world.awardScore('story.score.meet_vasik', 5, 'Meeting Vasik');
      return [{
        type: 'speak',
        messageId: npcMsg('VASIK_MEET'),
        data: { npcName: 'Vasik' },
      }];
    }

    if (context.random.chance(0.25)) {
      return [{
        type: 'emote',
        messageId: npcMsg(context.random.pick(VASIK_IDLE)),
        data: { npcName: 'Vasik' },
      }];
    }
    return [];
  },
  onPlayerEnters(): NpcAction[] {
    return [];
  },
};

const OKAFOR_IDLE: (keyof typeof NpcText)[] = [
  'OKAFOR_IDLE_WATCH', 'OKAFOR_IDLE_BARRICADE', 'OKAFOR_IDLE_CRYO',
];

export const okaforBehavior: NpcBehavior = {
  id: 'story-okafor',
  name: 'Okafor',
  onTurn(context: NpcContext): NpcAction[] {
    if (!context.playerVisible) return [];

    if (!context.world.getStateValue(StateKeys.MET_OKAFOR)) {
      context.world.setStateValue(StateKeys.MET_OKAFOR, true);
      context.world.awardScore('story.score.meet_okafor', 5, 'Meeting Okafor');
      return [{
        type: 'speak',
        messageId: npcMsg('OKAFOR_MEET'),
        data: { npcName: 'Okafor' },
      }];
    }

    if (context.random.chance(0.25)) {
      return [{
        type: 'emote',
        messageId: npcMsg(context.random.pick(OKAFOR_IDLE)),
        data: { npcName: 'Okafor' },
      }];
    }
    return [];
  },
  onPlayerEnters(context: NpcContext): NpcAction[] {
    if (!context.world.getStateValue(StateKeys.MET_OKAFOR)) {
      return [{
        type: 'emote',
        messageId: npcMsg('OKAFOR_ENTER_UNSEEN'),
        data: { npcName: 'Okafor' },
      }];
    }
    return [];
  },
};

export const lisBehavior: NpcBehavior = {
  id: 'story-lis',
  name: 'Lis',
  onTurn(context: NpcContext): NpcAction[] {
    if (!context.playerVisible) return [];
    const stage = context.world.getStateValue(StateKeys.LIS_STAGE) ?? 0;
    if (stage === 0) return []; // Not yet revealed

    if (!context.world.getStateValue(StateKeys.MET_LIS)) {
      context.world.setStateValue(StateKeys.MET_LIS, true);
      return [{
        type: 'speak',
        messageId: npcMsg('LIS_MEET'),
        data: { npcName: 'Lis' },
      }];
    }

    if (context.random.chance(0.3)) {
      const isLis = context.random.chance(0.4); // 40% chance of being "real" Lis
      if (isLis) {
        return [{
          type: 'emote',
          messageId: npcMsg('LIS_WINCE'),
          data: { npcName: 'Lis' },
        }];
      }
      return [{
        type: 'emote',
        messageId: npcMsg('LIS_PUPPET_IDLE'),
        data: { npcName: 'Lis' },
      }];
    }
    return [];
  },
  onPlayerEnters(): NpcAction[] { return []; },
};

export function getAllBehaviors(): NpcBehavior[] {
  return [reedBehavior, vasikBehavior, okaforBehavior, lisBehavior];
}
