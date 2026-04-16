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
import { config, ShipPropTrait, MemoryTrait, StateKeys, MAX_SCORE, Regions } from './types';
import type { RoomIds, ItemIds, NpcIds } from './types';
export { config } from './types';
import { createRegions, createRooms, createItems, createScenery } from './world';
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
        description: "Grey-market salvager. You crack cargo manifests, bypass security locks, and strip derelicts for parts. Everything you own is jury-rigged, including this tug. Quick hands, quicker mind. Currently running on fumes next to a ship that shouldn't exist.",
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

    // Nautical direction vocabulary is provided by:
    //   1. patches/@sharpee+lang-en-us+*.patch — adds fore/aft/port/starboard
    //      as synonyms for north/south/west/east in the language provider.
    //   2. patches/@sharpee+parser-en-us+*.patch — adds nautical words to
    //      the parser's DirectionWords/DirectionAbbreviations maps.
    //   3. src/grammar.ts — registers bare-word command patterns ("fore", "aft", etc.).
    // No runtime call needed — the patches ship at npm-install time.

    // Regions must be created before rooms so assignments can reference them.
    createRegions(world);

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

    // Opening sequence state
    world.setStateValue(StateKeys.ALARM_ACTIVE, true);
    world.setStateValue(StateKeys.ALARM_SILENCED, false);
    world.setStateValue(StateKeys.DOCKING_STATE, 'approach');
    world.setStateValue(StateKeys.DOCKING_BRAKED, false);
    world.setStateValue(StateKeys.DOCKING_CHECKED_PRESSURE, false);
    world.setStateValue(StateKeys.DOCKING_CONTROLS_EXAMINED, false);
    world.setStateValue(StateKeys.BAD_SEAL_WARNING_COUNT, 0);
    world.setStateValue(StateKeys.PLAYER_BOARDED, false);
    world.setStateValue(StateKeys.BOARDING_TURN, 0);
    world.setStateValue(StateKeys.COLLISION_FUSE_START, 0);
    world.setStateValue(StateKeys.SEAL_DEATH_ARMED, false);

    // Register interceptors with guard
    for (const { actionId, interceptor } of getInterceptors(this.items, this.rooms)) {
      if (!hasActionInterceptor(ShipPropTrait.type, actionId)) {
        registerActionInterceptor(ShipPropTrait.type, actionId, interceptor);
      }
    }

    // When the docking controls are examined for the first time, set the
    // gate flag that opens up the rest of the docking puzzle. This is a
    // reactive handler (no event mutation), so registerEventHandler is
    // the canonical pattern rather than chainEvent.
    world.registerEventHandler('if.event.examined', (event) => {
      const data = event.data as Record<string, any>;
      if (!data.targetId) return;
      if (world.getStateValue(StateKeys.DOCKING_CONTROLS_EXAMINED)) return;
      const target = world.getEntity(data.targetId);
      if (!target) return;
      const propId = (target.get(ShipPropTrait.type) as any)?.propId;
      if (propId === 'docking-controls') {
        world.setStateValue(StateKeys.DOCKING_CONTROLS_EXAMINED, true);
      }
    });

    // Region crossing: entering the Stillwater's lower deck = boarding the ship.
    // This is the canonical place that marks boarding — triggered when the
    // player exits the tug (or the airlock) into any lower-deck room.
    // The createBoardingPlugin() in plugins.ts still has a location-based
    // fallback for safety.
    world.registerEventHandler('if.event.region_entered', (event) => {
      const data = event.data as Record<string, any>;
      if (data.regionId !== Regions.LOWER_DECK) return;
      if (world.getStateValue(StateKeys.PLAYER_BOARDED)) return;
      world.setStateValue(StateKeys.PLAYER_BOARDED, true);
      const turn = world.getStateValue(StateKeys.TURN_COUNT) ?? 0;
      world.setStateValue(StateKeys.BOARDING_TURN, turn);
    });

    // Place player in tug cargo hold (starting room)
    const player = world.getPlayer()!;
    world.moveEntity(player.id, this.rooms.tugCargoHold);
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
