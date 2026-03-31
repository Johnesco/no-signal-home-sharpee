/**
 * No Signal Home — Action Interceptors
 *
 * Intercept stdlib actions to inject story-specific behavior.
 */

import {
  WorldModel,
  IFEntity,
  IdentityTrait,
  LockableTrait,
  OpenableTrait,
  createEffect,
} from '@sharpee/world-model';
import type { ActionInterceptor } from '@sharpee/world-model';
import {
  ItemIds, RoomIds, Msg, StateKeys, ScoreIds, getPropId,
  MemoryTrait, getMemory,
} from './types';
import { pryOpenDesk } from './actions';

// ============================================================================
// INTERCEPTOR DEFINITIONS
// ============================================================================

export function getInterceptors(
  items: ItemIds,
  rooms: RoomIds,
): { actionId: string; interceptor: ActionInterceptor }[] {
  return [
    // OPEN captain's desk → pry open if have multi-tool
    {
      actionId: 'if.action.opening',
      interceptor: {
        preValidate(entity: IFEntity, world: WorldModel) {
          const propId = getPropId(entity);
          if (propId === 'captains-desk') {
            const lock = entity.get(LockableTrait);
            if (lock?.isLocked) {
              const toolLoc = world.getLocation(items.multitool);
              const playerId = world.getPlayer()?.id;
              if (toolLoc === playerId) {
                return { valid: false, error: 'story.desk.pry-with-tool' };
              }
              return { valid: false, error: Msg.DESK_LOCKED };
            }
          }
          return null;
        },
        onBlocked(entity: IFEntity, world: WorldModel, actorId: string, error: string) {
          if (error === 'story.desk.pry-with-tool') {
            const msg = pryOpenDesk(world, items);
            return [createEffect('game.message', { messageId: msg })];
          }
          if (error === Msg.DESK_LOCKED) {
            return [createEffect('game.message', { messageId: Msg.DESK_LOCKED })];
          }
          return null;
        },
      },
    },

    // TAKE data chip in mess hall → reveal it if concealed
    {
      actionId: 'if.action.taking',
      interceptor: {
        preValidate(entity: IFEntity) {
          // Block taking the scenery barricade
          const propId = getPropId(entity);
          if (propId === 'cargo-barricade' || propId === 'vasik-barricade') {
            return { valid: false, error: 'story.barricade.cant_take' };
          }
          return null;
        },
        onBlocked(entity: IFEntity) {
          const propId = getPropId(entity);
          if (propId === 'cargo-barricade' || propId === 'vasik-barricade') {
            return [createEffect('game.message', { messageId: 'story.barricade.cant_take' })];
          }
          return null;
        },
      },
    },

    // READ research terminal → discover pathogen
    {
      actionId: 'if.action.reading',
      interceptor: {
        postExecute(entity: IFEntity, world: WorldModel) {
          const propId = getPropId(entity);
          if (propId === 'research-terminal' || propId === 'patient-logs') {
            if (!world.getStateValue(ScoreIds.DISCOVER_PATHOGEN)) {
              world.setStateValue(ScoreIds.DISCOVER_PATHOGEN, true);
              world.awardScore(ScoreIds.DISCOVER_PATHOGEN, 5, 'Discovering the pathogen');
            }
          }
        },
      },
    },

    // UNLOCK bridge door with keycard
    {
      actionId: 'if.action.unlocking',
      interceptor: {
        postExecute(entity: IFEntity, world: WorldModel) {
          if (entity.id === items.bridgeDoor) {
            world.setStateValue(StateKeys.BRIDGE_UNLOCKED, true);
            world.awardScore(ScoreIds.OPEN_BRIDGE, 5, 'Accessing the bridge');
          }
        },
      },
    },

  ];
}
