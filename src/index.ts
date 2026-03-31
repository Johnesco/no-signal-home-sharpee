/**
 * No Signal Home
 *
 * A sci-fi salvage horror text adventure on a derelict corporate freighter.
 * You are a stowaway convict trapped aboard The Stillwater as it wakes.
 *
 * Public interface: exports `story` singleton for engine consumption.
 */

import { Story } from '@sharpee/engine';
import type { GameEngine } from '@sharpee/engine';
import {
  WorldModel,
  IFEntity,
  ActorTrait,
  ContainerTrait,
  IdentityTrait,
  registerActionInterceptor,
  hasActionInterceptor,
} from '@sharpee/world-model';
import { NpcPlugin } from '@sharpee/plugin-npc';
import type { Parser } from '@sharpee/parser-en-us';
import type { LanguageProvider } from '@sharpee/lang-en-us';
import { config, ShipPropTrait, StateKeys, MAX_SCORE } from './types';
import type { RoomIds, ItemIds, NpcIds } from './types';
export { config } from './types';
import { createRooms, createItems, createScenery } from './world';
import { createNpcs, getAllBehaviors } from './npcs';
import { getCustomActions } from './actions';
import { getInterceptors } from './interceptors';
import { createPlugins } from './plugins';
import { extendParser as extendParserImpl } from './grammar';
import { extendLanguage as extendLanguageImpl } from './language';

// ============================================================================
// STORY CLASS
// ============================================================================

export class NoSignalHomeStory implements Story {
  config = config;

  private rooms!: RoomIds;
  private items!: ItemIds;
  private npcs!: NpcIds;

  // =========================================================================
  // Story interface: createPlayer
  // =========================================================================

  createPlayer(world: WorldModel): IFEntity {
    const player = world.getPlayer()!;
    player.add(
      new IdentityTrait({
        name: 'yourself',
        aliases: ['self', 'me', 'myself'],
        description: "You're a smuggler and hacker who stowed away on a salvage tug to escape a prison transport. Average build, quick hands, quicker mind. Currently trapped on a ship full of someone else's problems.",
        properName: true,
      }),
    );
    player.add(new ActorTrait({ isPlayer: true }));
    player.add(new ContainerTrait({ capacity: { maxItems: 10 } }));
    return player;
  }

  // =========================================================================
  // Story interface: initializeWorld
  // =========================================================================

  initializeWorld(world: WorldModel): void {
    world.setMaxScore(MAX_SCORE);

    // Create world
    this.rooms = createRooms(world);
    this.items = createItems(world, this.rooms);
    createScenery(world, this.rooms, this.items);
    this.npcs = createNpcs(world, this.rooms);

    // Initialize game state
    world.setStateValue(StateKeys.TUG_DETACHED, false);
    world.setStateValue(StateKeys.ELEVATOR_FIXED, false);
    world.setStateValue(StateKeys.BRIDGE_UNLOCKED, false);
    world.setStateValue(StateKeys.CARGO_HOLD_OPEN, false);
    world.setStateValue(StateKeys.COMMS_CONNECTED, false);
    world.setStateValue(StateKeys.COMMS_REFUSED, false);
    world.setStateValue(StateKeys.REACTOR_STAGE, 0);
    world.setStateValue(StateKeys.AI_STAGE, 1);
    world.setStateValue(StateKeys.REED_STAGE, 1);
    world.setStateValue(StateKeys.VASIK_STAGE, 1);
    world.setStateValue(StateKeys.OKAFOR_STAGE, 1);
    world.setStateValue(StateKeys.LIS_STAGE, 0);
    world.setStateValue(StateKeys.PATHOGEN_LEVEL, 0);
    world.setStateValue(StateKeys.PLAYER_INFECTED, false);
    world.setStateValue(StateKeys.PLAYER_TREATED, false);
    world.setStateValue(StateKeys.HAZMAT_WEARING, false);
    world.setStateValue(StateKeys.CARGO_CODE_VASIK, false);
    world.setStateValue(StateKeys.CARGO_CODE_OKAFOR, false);
    world.setStateValue(StateKeys.OVERRIDE_GIVEN, false);
    world.setStateValue(StateKeys.CABLE_CUT, false);
    world.setStateValue(StateKeys.AI_OVERRIDE, false);
    world.setStateValue(StateKeys.GAME_ENDED, false);
    world.setStateValue(StateKeys.MET_REED, false);
    world.setStateValue(StateKeys.MET_VASIK, false);
    world.setStateValue(StateKeys.MET_OKAFOR, false);
    world.setStateValue(StateKeys.MET_LIS, false);
    world.setStateValue(StateKeys.EMPATHY_SCORE, 0);
    world.setStateValue(StateKeys.DESK_OPENED, false);
    world.setStateValue(StateKeys.TURN_COUNT, 0);

    // Register interceptors with guard
    for (const { actionId, interceptor } of getInterceptors(this.items, this.rooms)) {
      if (!hasActionInterceptor(ShipPropTrait.type, actionId)) {
        registerActionInterceptor(ShipPropTrait.type, actionId, interceptor);
      }
    }

    // Place player in tug cockpit
    const player = world.getPlayer()!;
    world.moveEntity(player.id, this.rooms.tugCockpit);
  }

  // =========================================================================
  // Story interface: getCustomActions
  // =========================================================================

  getCustomActions() {
    return getCustomActions(this.rooms, this.items, this.npcs);
  }

  // =========================================================================
  // Story interface: extendParser
  // =========================================================================

  extendParser(parser: Parser): void {
    extendParserImpl(parser);
  }

  // =========================================================================
  // Story interface: extendLanguage
  // =========================================================================

  extendLanguage(language: LanguageProvider): void {
    extendLanguageImpl(language);
  }

  // =========================================================================
  // Story interface: onEngineReady
  // =========================================================================

  onEngineReady(engine: GameEngine): void {
    // Register NPC plugin
    const npcPlugin = new NpcPlugin();
    engine.getPluginRegistry().register(npcPlugin);
    const npcService = npcPlugin.getNpcService();
    for (const behavior of getAllBehaviors()) {
      npcService.registerBehavior(behavior);
    }

    // Register turn plugins
    const plugins = createPlugins(this.items, this.npcs, this.rooms);
    const registry = engine.getPluginRegistry();
    for (const plugin of plugins) {
      registry.register(plugin);
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const story = new NoSignalHomeStory();
export default story;
