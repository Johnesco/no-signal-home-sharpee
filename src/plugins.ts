/**
 * No Signal Home — Turn Plugins & Scheduler Events
 *
 * Timed events, dynamic descriptions, NPC state progression, win checks.
 */

import {
  WorldModel,
  IdentityTrait,
} from '@sharpee/world-model';
import type { TurnPlugin, TurnPluginContext } from '@sharpee/plugins';
import type { ISemanticEvent } from '@sharpee/core';
import {
  ItemIds, NpcIds, RoomIds, Msg, StateKeys, MAX_SCORE,
} from './types';
import { getSceneryId } from './world';

// ============================================================================
// TUG DETACH — fires at turn 5
// ============================================================================

function createTugDetachPlugin(rooms: RoomIds, items: ItemIds): TurnPlugin {
  return {
    id: 'story.tug-detach',
    priority: 200,
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      const turn = ctx.world.getStateValue(StateKeys.TURN_COUNT) ?? 0;
      if (turn === 5 && !ctx.world.getStateValue(StateKeys.TUG_DETACHED)) {
        ctx.world.setStateValue(StateKeys.TUG_DETACHED, true);

        // Seal the airlock — remove connection to tug
        const airlock = ctx.world.getEntity(rooms.airlock);
        if (airlock) {
          const roomTrait = airlock.get('room' as any);
        }
        // Update tug viewport description
        const vpId = getSceneryId('tug-viewport');
        if (vpId) {
          const vp = ctx.world.getEntity(vpId);
          if (vp) {
            const id = vp.get(IdentityTrait);
            if (id) id.description = 'Through the viewport: empty space where the salvage tug used to be. Nothing but stars.';
          }
        }
        return [
          { type: 'game.message', data: { messageId: Msg.TUG_DETACHED } } as any,
        ];
      }
      return [];
    },
  };
}

// ============================================================================
// TURN COUNTER
// ============================================================================

function createTurnCounterPlugin(): TurnPlugin {
  return {
    id: 'story.turn-counter',
    priority: 1,
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      const turn = (ctx.world.getStateValue(StateKeys.TURN_COUNT) ?? 0) + 1;
      ctx.world.setStateValue(StateKeys.TURN_COUNT, turn);
      return [];
    },
  };
}

// ============================================================================
// NPC STATE PROGRESSION — Reed infection, AI stages, Lis appearance
// ============================================================================

function createNpcProgressionPlugin(npcs: NpcIds, rooms: RoomIds): TurnPlugin {
  return {
    id: 'story.npc-progression',
    priority: 50,
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      const turn = ctx.world.getStateValue(StateKeys.TURN_COUNT) ?? 0;
      const events: ISemanticEvent[] = [];

      // Reed infection stages: 1 → 2 at turn 20, 2 → 3 at turn 35, 3 → 4 at turn 45
      const reedStage = ctx.world.getStateValue(StateKeys.REED_STAGE) ?? 1;
      if (reedStage === 1 && turn >= 20) {
        ctx.world.setStateValue(StateKeys.REED_STAGE, 2);
      } else if (reedStage === 2 && turn >= 35) {
        ctx.world.setStateValue(StateKeys.REED_STAGE, 3);
        events.push({ type: 'game.message', data: { messageId: Msg.REED_LUCID } } as any);
      } else if (reedStage === 3 && turn >= 45) {
        ctx.world.setStateValue(StateKeys.REED_STAGE, 4);
        // Update Reed's description
        const reed = ctx.world.getEntity(npcs.reed);
        if (reed) {
          const id = reed.get(IdentityTrait);
          if (id) id.description = 'Reed looks... fine. Too fine. Clean coveralls, relaxed posture, a faint smile. Everything about them is wrong.';
        }
      }

      // AI stage progression: 1 → 2 after comms refused or turn 30, 2 → 3 at turn 50
      const aiStage = ctx.world.getStateValue(StateKeys.AI_STAGE) ?? 1;
      if (aiStage === 1) {
        if (ctx.world.getStateValue(StateKeys.COMMS_REFUSED) || turn >= 30) {
          ctx.world.setStateValue(StateKeys.AI_STAGE, 2);
        }
      } else if (aiStage === 2 && turn >= 50) {
        ctx.world.setStateValue(StateKeys.AI_STAGE, 3);
      }

      // Lis appears at turn 15
      if (turn === 15 && !ctx.world.getStateValue(StateKeys.LIS_STAGE)) {
        ctx.world.setStateValue(StateKeys.LIS_STAGE, 1);
        const lis = ctx.world.getEntity(npcs.lis);
        if (lis) {
          const id = lis.get(IdentityTrait);
          if (id) id.concealed = false;
        }
      }

      // Lis stage progression
      const lisStage = ctx.world.getStateValue(StateKeys.LIS_STAGE) ?? 0;
      if (lisStage === 1 && turn >= 30) {
        ctx.world.setStateValue(StateKeys.LIS_STAGE, 2);
      } else if (lisStage === 2 && turn >= 45) {
        ctx.world.setStateValue(StateKeys.LIS_STAGE, 3);
      }

      // Vasik stages
      if (ctx.world.getStateValue(StateKeys.OVERRIDE_GIVEN) &&
          (ctx.world.getStateValue(StateKeys.VASIK_STAGE) ?? 1) < 2) {
        ctx.world.setStateValue(StateKeys.VASIK_STAGE, 2);
      }

      // Okafor trust (stage up when you talk to them after meeting)
      if (ctx.world.getStateValue(StateKeys.MET_OKAFOR) &&
          (ctx.world.getStateValue(StateKeys.OKAFOR_STAGE) ?? 1) < 2 &&
          turn >= 25) {
        ctx.world.setStateValue(StateKeys.OKAFOR_STAGE, 2);
      }

      return events;
    },
  };
}

// ============================================================================
// ATMOSPHERE — periodic flavor events
// ============================================================================

function createAtmospherePlugin(rooms: RoomIds): TurnPlugin {
  return {
    id: 'story.atmosphere',
    priority: 500,
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      const turn = ctx.world.getStateValue(StateKeys.TURN_COUNT) ?? 0;
      const playerLoc = ctx.world.getLocation(ctx.world.getPlayer()!.id);

      // Ship creaks every ~8 turns
      if (turn > 0 && turn % 8 === 0) {
        return [{ type: 'game.message', data: { messageId: Msg.SHIP_CREAK } } as any];
      }

      // Reactor warming (lower deck rooms, after turn 25)
      if (turn > 25 && turn % 12 === 0 &&
          (playerLoc === rooms.aftCorridor || playerLoc === rooms.engineering || playerLoc === rooms.reactorRoom)) {
        return [{ type: 'game.message', data: { messageId: Msg.REACTOR_WARMING } } as any];
      }

      // AI spreading (after AI stage 2)
      const aiStage = ctx.world.getStateValue(StateKeys.AI_STAGE) ?? 1;
      if (aiStage >= 2 && turn % 10 === 0) {
        return [{ type: 'game.message', data: { messageId: Msg.AI_SPREADING } } as any];
      }

      // Containment failing (after cargo hold opened, periodic)
      if (ctx.world.getStateValue(StateKeys.CARGO_HOLD_OPEN) && turn % 15 === 0) {
        return [{ type: 'game.message', data: { messageId: Msg.CONTAINMENT_FAILING } } as any];
      }

      // Destination warning (after turn 55)
      if (turn >= 55 && turn % 10 === 0) {
        return [{ type: 'game.message', data: { messageId: Msg.DESTINATION_WARNING } } as any];
      }

      return [];
    },
  };
}

// ============================================================================
// RADIATION HAZARD — damage in reactor room without hazmat
// ============================================================================

function createRadiationPlugin(rooms: RoomIds): TurnPlugin {
  return {
    id: 'story.radiation',
    priority: 100,
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      const playerLoc = ctx.world.getLocation(ctx.world.getPlayer()!.id);
      if (playerLoc === rooms.reactorRoom &&
          !ctx.world.getStateValue(StateKeys.HAZMAT_WEARING)) {
        return [{ type: 'game.message', data: { messageId: Msg.RADIATION_WARNING } } as any];
      }
      return [];
    },
  };
}

// ============================================================================
// DYNAMIC DESCRIPTIONS — update based on world state
// ============================================================================

function createDescriptionPlugin(items: ItemIds, rooms: RoomIds): TurnPlugin {
  return {
    id: 'story.descriptions',
    priority: 50,
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      const world = ctx.world;

      // Captain's desk description
      const desk = world.getEntity(items.captainsDesk);
      if (desk) {
        const id = desk.get(IdentityTrait);
        const open = desk.get('openable' as any) as any;
        if (id && open) {
          id.description = open.isOpen
            ? "The desk drawer is open. The lock has been forced."
            : "A standard-issue officer's desk bolted to the bulkhead. The drawer has a simple mechanical lock.";
        }
      }

      // Elevator description
      const elevId = getSceneryId('elevator');
      if (elevId) {
        const elev = world.getEntity(elevId);
        if (elev) {
          const id = elev.get(IdentityTrait);
          if (id) {
            id.description = world.getStateValue(StateKeys.ELEVATOR_FIXED)
              ? 'The freight elevator hums steadily. The cryo deck is accessible to the east.'
              : 'A freight elevator leading down to the cryo deck. The control panel is dead — the motor assembly has failed.';
          }
        }
      }

      // Common viewport after tug detaches
      const vpId = getSceneryId('common-viewport');
      if (vpId && world.getStateValue(StateKeys.TUG_DETACHED)) {
        const vp = world.getEntity(vpId);
        if (vp) {
          const id = vp.get(IdentityTrait);
          if (id) id.description = 'Through the viewport: black nothing. Stars. No tug. No rescue. Nothing.';
        }
      }

      // Bridge door description
      const bDoor = world.getEntity(items.bridgeDoor);
      if (bDoor) {
        const id = bDoor.get(IdentityTrait);
        if (id && world.getStateValue(StateKeys.BRIDGE_UNLOCKED)) {
          id.description = 'The bridge security door stands open. The keycard reader shows green.';
        }
      }

      return [];
    },
  };
}

// ============================================================================
// WIN CHECK — game ending detection
// ============================================================================

function createEndingCheckPlugin(): TurnPlugin {
  return {
    id: 'story.ending-check',
    priority: 1000,
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      if (ctx.world.getStateValue(StateKeys.GAME_ENDED)) {
        return [
          { type: 'game.message', data: { messageId: Msg.VICTORY } } as any,
          { type: 'game.ended', data: { reason: 'victory' } } as any,
        ];
      }

      // Check for reactor overload ending
      if (ctx.world.getStateValue('reactor-overloading')) {
        ctx.world.setStateValue(StateKeys.GAME_ENDED, true);
        // If player is NOT in escape pod / bridge area, they die
        const playerLoc = ctx.world.getLocation(ctx.world.getPlayer()!.id);
        // For now, the reactor overload is the trigger — they need to escape
        return [];
      }

      return [];
    },
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export function createPlugins(
  items: ItemIds,
  npcs: NpcIds,
  rooms: RoomIds,
): TurnPlugin[] {
  return [
    createTurnCounterPlugin(),
    createTugDetachPlugin(rooms, items),
    createNpcProgressionPlugin(npcs, rooms),
    createAtmospherePlugin(rooms),
    createRadiationPlugin(rooms),
    createDescriptionPlugin(items, rooms),
    createEndingCheckPlugin(),
  ];
}
