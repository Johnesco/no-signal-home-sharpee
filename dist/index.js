"use strict";
/**
 * No Signal Home
 *
 * A sci-fi salvage horror text adventure on a derelict corporate freighter.
 * You are a stowaway convict trapped aboard The Stillwater as it wakes.
 *
 * Public interface: exports `story` singleton for engine consumption.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.story = exports.NoSignalHomeStory = exports.config = void 0;
const world_model_1 = require("@sharpee/world-model");
const plugin_npc_1 = require("@sharpee/plugin-npc");
const types_1 = require("./types");
var types_2 = require("./types");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return types_2.config; } });
const world_1 = require("./world");
const npcs_1 = require("./npcs");
const actions_1 = require("./actions");
const interceptors_1 = require("./interceptors");
const plugins_1 = require("./plugins");
const grammar_1 = require("./grammar");
const language_1 = require("./language");
// ============================================================================
// STORY CLASS
// ============================================================================
class NoSignalHomeStory {
    constructor() {
        this.config = types_1.config;
    }
    // =========================================================================
    // Story interface: createPlayer
    // =========================================================================
    createPlayer(world) {
        const player = world.getPlayer();
        player.add(new world_model_1.IdentityTrait({
            name: 'yourself',
            aliases: ['self', 'me', 'myself'],
            description: "Grey-market salvager. You crack cargo manifests, bypass security locks, and strip derelicts for parts. Everything you own is jury-rigged, including this tug. Quick hands, quicker mind. Currently running on fumes next to a ship that shouldn't exist.",
            properName: true,
        }));
        player.add(new world_model_1.ActorTrait({ isPlayer: true }));
        player.add(new world_model_1.ContainerTrait({ capacity: { maxItems: 10 } }));
        return player;
    }
    // =========================================================================
    // Story interface: initializeWorld
    // =========================================================================
    initializeWorld(world) {
        world.setMaxScore(types_1.MAX_SCORE);
        // Nautical direction vocabulary (ADR-143)
        // Replaces compass with naval: fore/aft/port/starboard, topside/below decks
        world.directions().useVocabulary('naval');
        // Create world
        this.rooms = (0, world_1.createRooms)(world);
        this.items = (0, world_1.createItems)(world, this.rooms);
        (0, world_1.createScenery)(world, this.rooms, this.items);
        this.npcs = (0, npcs_1.createNpcs)(world, this.rooms);
        // Initialize game state
        world.setStateValue(types_1.StateKeys.TUG_DETACHED, false);
        world.setStateValue(types_1.StateKeys.ELEVATOR_FIXED, false);
        world.setStateValue(types_1.StateKeys.BRIDGE_UNLOCKED, false);
        world.setStateValue(types_1.StateKeys.CARGO_HOLD_OPEN, false);
        world.setStateValue(types_1.StateKeys.COMMS_CONNECTED, false);
        world.setStateValue(types_1.StateKeys.COMMS_REFUSED, false);
        world.setStateValue(types_1.StateKeys.REACTOR_STAGE, 0);
        world.setStateValue(types_1.StateKeys.AI_STAGE, 1);
        world.setStateValue(types_1.StateKeys.REED_STAGE, 1);
        world.setStateValue(types_1.StateKeys.VASIK_STAGE, 1);
        world.setStateValue(types_1.StateKeys.OKAFOR_STAGE, 1);
        world.setStateValue(types_1.StateKeys.LIS_STAGE, 0);
        world.setStateValue(types_1.StateKeys.PATHOGEN_LEVEL, 0);
        world.setStateValue(types_1.StateKeys.PLAYER_INFECTED, false);
        world.setStateValue(types_1.StateKeys.PLAYER_TREATED, false);
        world.setStateValue(types_1.StateKeys.HAZMAT_WEARING, false);
        world.setStateValue(types_1.StateKeys.CARGO_CODE_VASIK, false);
        world.setStateValue(types_1.StateKeys.CARGO_CODE_OKAFOR, false);
        world.setStateValue(types_1.StateKeys.OVERRIDE_GIVEN, false);
        world.setStateValue(types_1.StateKeys.CABLE_CUT, false);
        world.setStateValue(types_1.StateKeys.AI_OVERRIDE, false);
        world.setStateValue(types_1.StateKeys.GAME_ENDED, false);
        world.setStateValue(types_1.StateKeys.MET_REED, false);
        world.setStateValue(types_1.StateKeys.MET_VASIK, false);
        world.setStateValue(types_1.StateKeys.MET_OKAFOR, false);
        world.setStateValue(types_1.StateKeys.MET_LIS, false);
        world.setStateValue(types_1.StateKeys.EMPATHY_SCORE, 0);
        world.setStateValue(types_1.StateKeys.DESK_OPENED, false);
        world.setStateValue(types_1.StateKeys.TURN_COUNT, 0);
        // Opening sequence state
        world.setStateValue(types_1.StateKeys.ALARM_ACTIVE, true);
        world.setStateValue(types_1.StateKeys.ALARM_SILENCED, false);
        world.setStateValue(types_1.StateKeys.DOCKING_STATE, 'approach');
        world.setStateValue(types_1.StateKeys.DOCKING_BRAKED, false);
        world.setStateValue(types_1.StateKeys.DOCKING_CHECKED_PRESSURE, false);
        world.setStateValue(types_1.StateKeys.DOCKING_CONTROLS_EXAMINED, false);
        world.setStateValue(types_1.StateKeys.BAD_SEAL_WARNING_COUNT, 0);
        world.setStateValue(types_1.StateKeys.PLAYER_BOARDED, false);
        world.setStateValue(types_1.StateKeys.BOARDING_TURN, 0);
        world.setStateValue(types_1.StateKeys.COLLISION_FUSE_START, 0);
        world.setStateValue(types_1.StateKeys.SEAL_DEATH_ARMED, false);
        // Register interceptors with guard
        for (const { actionId, interceptor } of (0, interceptors_1.getInterceptors)(this.items, this.rooms)) {
            if (!(0, world_model_1.hasActionInterceptor)(types_1.ShipPropTrait.type, actionId)) {
                (0, world_model_1.registerActionInterceptor)(types_1.ShipPropTrait.type, actionId, interceptor);
            }
        }
        // Event chain: examining docking controls sets the gate flag
        world.chainEvent('if.event.examined', (event) => {
            const data = event.data;
            if (!data.targetId)
                return null;
            const target = world.getEntity(data.targetId);
            if (!target)
                return null;
            const propId = target.get(types_1.ShipPropTrait.type)?.propId;
            if (propId === 'docking-controls' && !world.getStateValue(types_1.StateKeys.DOCKING_CONTROLS_EXAMINED)) {
                world.setStateValue(types_1.StateKeys.DOCKING_CONTROLS_EXAMINED, true);
            }
            return null; // pass through — don't replace the examine event
        }, { key: 'story.chain.examine-controls' });
        // Place player in tug cargo hold (starting room)
        const player = world.getPlayer();
        world.moveEntity(player.id, this.rooms.tugCargoHold);
    }
    // =========================================================================
    // Story interface: getCustomActions
    // =========================================================================
    getCustomActions() {
        return (0, actions_1.getCustomActions)(this.rooms, this.items, this.npcs);
    }
    // =========================================================================
    // Story interface: extendParser
    // =========================================================================
    extendParser(parser) {
        (0, grammar_1.extendParser)(parser);
    }
    // =========================================================================
    // Story interface: extendLanguage
    // =========================================================================
    extendLanguage(language) {
        (0, language_1.extendLanguage)(language);
    }
    // =========================================================================
    // Story interface: onEngineReady
    // =========================================================================
    onEngineReady(engine) {
        // Register NPC plugin
        const npcPlugin = new plugin_npc_1.NpcPlugin();
        engine.getPluginRegistry().register(npcPlugin);
        const npcService = npcPlugin.getNpcService();
        for (const behavior of (0, npcs_1.getAllBehaviors)()) {
            npcService.registerBehavior(behavior);
        }
        // Register turn plugins
        const plugins = (0, plugins_1.createPlugins)(this.items, this.npcs, this.rooms);
        const registry = engine.getPluginRegistry();
        for (const plugin of plugins) {
            registry.register(plugin);
        }
    }
}
exports.NoSignalHomeStory = NoSignalHomeStory;
// ============================================================================
// EXPORT
// ============================================================================
exports.story = new NoSignalHomeStory();
exports.default = exports.story;
//# sourceMappingURL=index.js.map