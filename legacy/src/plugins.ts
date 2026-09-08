/**
 * No Signal Home — Turn Plugins & Scheduler Events
 *
 * Timed events, dynamic descriptions, NPC state progression, win checks.
 */

import {
  WorldModel,
  IdentityTrait,
  LockableTrait,
  OpenableTrait,
  RoomTrait,
} from '@sharpee/world-model';
import type { TurnPlugin, TurnPluginContext } from '@sharpee/plugins';
import { createEvent } from '@sharpee/core';
import type { ISemanticEvent } from '@sharpee/core';
import {
  ItemIds, NpcIds, RoomIds, Msg, StateKeys, MAX_SCORE,
  MemoryTrait, getMemory,
} from './types';
import { getSceneryId } from './world';

/** Get the activeTurns count for a scene (0 if scene not found or not active) */
function sceneActiveTurns(world: WorldModel, sceneId: string): number {
  const scene = world.getEntity(sceneId);
  if (!scene) return 0;
  // Access SceneTrait by type string to avoid deep import path
  // (the package exports map only exposes the root entry point)
  const trait = scene.get('scene' as any) as { activeTurns?: number } | undefined;
  return trait?.activeTurns ?? 0;
}

/** Type-safe event factory — emits a game.message event with a language-provider messageId */
function msg(messageId: string): ISemanticEvent {
  return createEvent('game.message', { messageId });
}

/** Type-safe event factory — emits a game.ended event */
function ended(reason: string): ISemanticEvent {
  return createEvent('game.ended', { reason });
}

// ============================================================================
// MEMORY TRAIT — first-examine flavor text, fires once per entity
// ============================================================================

function createMemoryPlugin(): TurnPlugin {
  return {
    id: 'story.memory',
    priority: 2,
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      const actionId = ctx.actionResult?.actionId;
      const success = ctx.actionResult?.success;
      if (!success || actionId !== 'if.action.examining') return [];

      const targetId = ctx.actionResult?.targetId;
      if (!targetId) return [];

      const entity = ctx.world.getEntity(targetId);
      if (!entity) return [];

      const memory = getMemory(entity);
      if (!memory || memory.recalled || memory.trigger !== actionId) return [];

      memory.recalled = true;
      return [msg(memory.messageId)];
    },
  };
}

// ============================================================================
// ALARM URGENCY — reminds player about the alarm each turn
// ============================================================================

function createAlarmUrgencyPlugin(rooms: RoomIds): TurnPlugin {
  return {
    id: 'story.alarm-urgency',
    priority: 5,
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      const world = ctx.world;
      if (!world.getStateValue(StateKeys.ALARM_ACTIVE)) return [];
      if (world.getStateValue(StateKeys.ALARM_SILENCED)) return [];

      // Don't nag if they just pressed the button
      const actionId = ctx.actionResult?.actionId;
      if (actionId === 'story.action.pressing') return [];

      const playerLoc = world.getLocation(world.getPlayer()!.id);
      if (playerLoc === rooms.tugCargoHold) {
        return [msg(Msg.ALARM_BLOCKED_CARGO)];
      }
      if (playerLoc === rooms.tugCockpit) {
        return [msg(Msg.ALARM_BLOCKED_COCKPIT)];
      }
      return [];
    },
  };
}

// ============================================================================
// ALARM FUSE — 10 turns to silence alarm, then 20 turns to maneuver
// ============================================================================

function createAlarmFusePlugin(rooms: RoomIds): TurnPlugin {
  return {
    id: 'story.alarm-fuse',
    priority: 65, // Must run after SceneEvaluationPlugin (priority 60)
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      const world = ctx.world;

      // Phase 1: Alarm scene active — 10 turn limit
      if (world.isSceneActive('scene-alarm')) {
        if (sceneActiveTurns(world, 'scene-alarm') >= 10) {
          return [msg(Msg.ALARM_COLLISION_DEATH), ended('death')];
        }
        return [];
      }

      // Phase 2: Collision approach scene active — 20 turn limit
      if (world.isSceneActive('scene-collision-approach')) {
        if (sceneActiveTurns(world, 'scene-collision-approach') >= 20) {
          return [msg(Msg.COLLISION_DEATH), ended('death')];
        }
      }

      return [];
    },
  };
}

// ============================================================================
// VIEWPORT ESCALATION — tied to post-alarm fuse progress
// ============================================================================

function createViewportPlugin(rooms: RoomIds): TurnPlugin {
  return {
    id: 'story.viewport-escalation',
    priority: 66, // Must run after SceneEvaluationPlugin (priority 60)
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      const world = ctx.world;
      if (!world.isSceneActive('scene-collision-approach')) return [];

      const elapsed = sceneActiveTurns(world, 'scene-collision-approach');

      // Update tug viewport description based on proximity
      const vpId = getSceneryId('tug-viewport');
      if (vpId) {
        const vp = world.getEntity(vpId);
        if (vp) {
          const id = vp.get(IdentityTrait);
          if (id) {
            if (elapsed >= 15) {
              id.description = "The Stillwater is all you can see. Dark metal, arm's reach away. You're out of time.";
            } else if (elapsed >= 10) {
              id.description = "The hull fills the entire viewport. Individual rivets visible. You can see a docking port, dead ahead.";
            } else if (elapsed >= 5) {
              id.description = "The derelict's hull is closer. Details emerging — hull plating, maintenance hatches, a faded corporate logo.";
            }
          }
        }
      }

      // Show viewport stage messages at thresholds
      const playerLoc = world.getLocation(world.getPlayer()!.id);
      if (playerLoc === rooms.tugCockpit) {
        if (elapsed === 5) return [msg(Msg.VIEWPORT_STAGE_1)];
        if (elapsed === 10) return [msg(Msg.VIEWPORT_STAGE_2)];
        if (elapsed === 15) return [msg(Msg.VIEWPORT_STAGE_3)];
        if (elapsed === 18) return [msg(Msg.VIEWPORT_STAGE_4)];
      }

      return [];
    },
  };
}

// ============================================================================
// SEAL DEGRADATION — 2-3 turns after boarding the Stillwater
// ============================================================================

function createSealDegradationPlugin(rooms: RoomIds, items: ItemIds): TurnPlugin {
  return {
    id: 'story.seal-degradation',
    priority: 200, // Already > 60, runs after scene evaluation
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      const world = ctx.world;
      if (world.getStateValue(StateKeys.TUG_DETACHED)) return [];
      if (!world.isSceneActive('scene-seal-window')) return [];

      const elapsed = sceneActiveTurns(world, 'scene-seal-window');

      // Fire at 3 turns after boarding
      if (elapsed >= 3) {
        world.setStateValue(StateKeys.TUG_DETACHED, true);

        // Lock the airlock door from the Stillwater side
        const door = world.getEntity(items.airlockDoor);
        if (door) {
          const lock = door.get(LockableTrait);
          const open = door.get(OpenableTrait);
          if (lock) {
            lock.isLocked = true;
            lock.lockedMessage = "The airlock seal is compromised. Hard vacuum on the other side. You'd need an EVA suit to cross back.";
          }
          if (open) open.isOpen = false;
        }

        // Update viewport descriptions
        const vpId = getSceneryId('tug-viewport');
        if (vpId) {
          const vp = world.getEntity(vpId);
          if (vp) {
            const id = vp.get(IdentityTrait);
            if (id) {
              if (world.getStateValue(StateKeys.DOCKING_BRAKED)) {
                id.description = 'Through the viewport: your tug, still docked. But frost is forming on the docking junction. The seal is gone.';
              } else {
                id.description = 'Through the viewport: empty space where your tug used to be. Nothing but stars.';
              }
            }
          }
        }

        // Update inspection window description
        const winId = getSceneryId('inspection-window');
        if (winId) {
          const win = world.getEntity(winId);
          if (win) {
            const id = win.get(IdentityTrait);
            if (id) {
              if (world.getStateValue(StateKeys.DOCKING_BRAKED)) {
                id.description = 'Through the window: the docking junction, frosted with ice crystals. Your tug is still there, but the seal is compromised. Vacuum between you and it.';
              } else {
                id.description = 'Through the window: the docking clamp, sheared and empty. Your tug is gone. A few fragments of metal drift in the void.';
              }
            }
          }
        }

        // Choose message based on braked flag
        if (world.getStateValue(StateKeys.DOCKING_BRAKED)) {
          return [msg(Msg.SEAL_DEGRADE_STAYS)];
        } else {
          return [msg(Msg.SEAL_DEGRADE_DRIFTS)];
        }
      }

      return [];
    },
  };
}

// ============================================================================
// BAD SEAL DEATH — handles escalating warnings and death at airlock
// ============================================================================

function createBadSealPlugin(rooms: RoomIds, items: ItemIds): TurnPlugin {
  return {
    id: 'story.bad-seal',
    priority: 10,
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      const world = ctx.world;
      const dockState = world.getStateValue(StateKeys.DOCKING_STATE);
      if (dockState !== 'sealed') return [];
      if (world.getStateValue(StateKeys.DOCKING_CHECKED_PRESSURE)) return [];

      // Death check runs BEFORE the boarding guard — the boarding plugin
      // (priority 8) sets PLAYER_BOARDED before this plugin (priority 10),
      // so the guard would block the death from ever firing.
      if (world.getStateValue(StateKeys.SEAL_DEATH_ARMED)) {
        const playerLoc = world.getLocation(world.getPlayer()!.id);
        if (playerLoc === rooms.airlock) {
          return [msg(Msg.BAD_SEAL_DEATH), ended('death')];
        }
      }

      // After boarding, no more warnings needed
      if (world.getStateValue(StateKeys.PLAYER_BOARDED)) return [];

      // Arm the death trap on the first turn after a bad seal.
      // The engine handles locked doors at the route level (before the going
      // action dispatches), so we can't detect a failed "go aft" via
      // actionResult. Instead, on the first post-seal turn in the cockpit,
      // show the warning, unlock the door, and arm death for the next crossing.
      const count = (world.getStateValue(StateKeys.BAD_SEAL_WARNING_COUNT) as number) || 0;
      if (count === 0) {
        const playerLoc = world.getLocation(world.getPlayer()!.id);
        if (playerLoc === rooms.tugCockpit) {
          world.setStateValue(StateKeys.BAD_SEAL_WARNING_COUNT, 1);
          // Unlock and open the door so the next attempt goes through
          const door = world.getEntity(items.airlockDoor);
          if (door) {
            const lock = door.get(LockableTrait);
            const open = door.get(OpenableTrait);
            if (lock) lock.isLocked = false;
            if (open) open.isOpen = true;
          }
          world.setStateValue(StateKeys.SEAL_DEATH_ARMED, true);
          return [msg(Msg.BAD_SEAL_WARNING)];
        }
      }

      return [];
    },
  };
}

// ============================================================================
// BOARDING DETECTION — sets PLAYER_BOARDED when entering the Stillwater
// ============================================================================

function createBoardingPlugin(rooms: RoomIds): TurnPlugin {
  return {
    id: 'story.boarding',
    priority: 8,
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      const world = ctx.world;
      if (world.getStateValue(StateKeys.PLAYER_BOARDED)) return [];

      const playerLoc = world.getLocation(world.getPlayer()!.id);
      // Player enters the airlock or forward corridor = boarded
      if (playerLoc === rooms.airlock || playerLoc === rooms.forwardCorridor) {
        world.setStateValue(StateKeys.PLAYER_BOARDED, true);
        const turn = world.getStateValue(StateKeys.TURN_COUNT) ?? 0;
        world.setStateValue(StateKeys.BOARDING_TURN, turn);
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
        events.push(msg(Msg.REED_LUCID));
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
    priority: 500, // Already > 60, runs after scene evaluation
    onAfterAction(ctx: TurnPluginContext): ISemanticEvent[] {
      if (!ctx.world.isSceneActive('scene-atmosphere')) return [];

      const elapsed = sceneActiveTurns(ctx.world, 'scene-atmosphere');
      const playerLoc = ctx.world.getLocation(ctx.world.getPlayer()!.id);

      // Ship creaks every ~8 turns aboard
      if (elapsed > 0 && elapsed % 8 === 0) {
        return [msg(Msg.SHIP_CREAK)];
      }

      // Reactor warming (lower deck rooms, after 25 turns aboard)
      if (elapsed > 25 && elapsed % 12 === 0 &&
          (playerLoc === rooms.aftCorridor || playerLoc === rooms.engineering || playerLoc === rooms.reactorRoom)) {
        return [msg(Msg.REACTOR_WARMING)];
      }

      // AI spreading (after AI stage 2)
      const aiStage = ctx.world.getStateValue(StateKeys.AI_STAGE) ?? 1;
      if (aiStage >= 2 && elapsed % 10 === 0) {
        return [msg(Msg.AI_SPREADING)];
      }

      // Containment failing (after cargo hold opened, periodic)
      if (ctx.world.getStateValue(StateKeys.CARGO_HOLD_OPEN) && elapsed % 15 === 0) {
        return [msg(Msg.CONTAINMENT_FAILING)];
      }

      // Destination warning (after 55 turns aboard)
      if (elapsed >= 55 && elapsed % 10 === 0) {
        return [msg(Msg.DESTINATION_WARNING)];
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
        return [msg(Msg.RADIATION_WARNING)];
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

      // Airlock door locked message varies by docking state
      const aDoor = world.getEntity(items.airlockDoor);
      if (aDoor) {
        const lock = aDoor.get(LockableTrait);
        if (lock && lock.isLocked) {
          const dockState = world.getStateValue(StateKeys.DOCKING_STATE);
          if (dockState === 'approach') {
            lock.lockedMessage = "The airlock is sealed. You need to complete the docking sequence first.";
          } else if (dockState === 'maneuvered') {
            lock.lockedMessage = "The docking arm isn't connected yet. You need to extend it and seal the airlock.";
          } else if (dockState === 'connected') {
            lock.lockedMessage = "The airlock isn't pressurized. You need to seal it first.";
          }
          // 'sealed' with bad pressure has its own lockedMessage set by the action
        }
      }

      // Cockpit description updates after alarm silenced
      const cockpit = world.getEntity(rooms.tugCockpit);
      if (cockpit && world.getStateValue(StateKeys.ALARM_SILENCED)) {
        const id = cockpit.get(IdentityTrait);
        if (id) {
          const dockState = world.getStateValue(StateKeys.DOCKING_STATE);
          if (dockState === 'sealed') {
            id.description = 'The cockpit is quiet. Instruments show a stable dock. The airlock door aft is ready.';
          } else if (dockState === 'approach') {
            id.description = "A cramped cockpit. The alarm is off but the silence is worse. Through the viewport, a massive hull — Meridian Solutions corporate freighter. Getting closer. You need to dock.";
          } else {
            id.description = "A cramped cockpit. Docking in progress. The Stillwater's hull fills the viewport.";
          }
        }
      }

      // Captain's desk description
      const desk = world.getEntity(items.captainsDesk);
      if (desk) {
        const id = desk.get(IdentityTrait);
        const open = desk.get(OpenableTrait);
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
              ? 'The freight elevator hums steadily. The cryo deck is accessible to starboard.'
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
          if (id) {
            if (world.getStateValue(StateKeys.DOCKING_BRAKED)) {
              id.description = 'Through the viewport: your tug, still docked to the hull. Frost on the docking junction. No way back without a suit.';
            } else {
              id.description = 'Through the viewport: black nothing. Stars. Your tug is gone. Nothing.';
            }
          }
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
        return [msg(Msg.VICTORY), ended('victory')];
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
    createMemoryPlugin(),
    createAlarmUrgencyPlugin(rooms),
    createAlarmFusePlugin(rooms),
    createViewportPlugin(rooms),
    createBoardingPlugin(rooms),
    createSealDegradationPlugin(rooms, items),
    createBadSealPlugin(rooms, items),
    createNpcProgressionPlugin(npcs, rooms),
    createAtmospherePlugin(rooms),
    createRadiationPlugin(rooms),
    createDescriptionPlugin(items, rooms),
    createEndingCheckPlugin(),
  ];
}
