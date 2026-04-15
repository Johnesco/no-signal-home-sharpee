"use strict";
/**
 * No Signal Home — Action Interceptors
 *
 * Intercept stdlib actions to inject story-specific behavior.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInterceptors = getInterceptors;
const world_model_1 = require("@sharpee/world-model");
const types_1 = require("./types");
const actions_1 = require("./actions");
// ============================================================================
// INTERCEPTOR DEFINITIONS
// ============================================================================
function getInterceptors(items, rooms) {
    return [
        // OPEN captain's desk → pry open if have multi-tool
        {
            actionId: 'if.action.opening',
            interceptor: {
                preValidate(entity, world) {
                    const propId = (0, types_1.getPropId)(entity);
                    if (propId === 'captains-desk') {
                        const lock = entity.get(world_model_1.LockableTrait);
                        if (lock?.isLocked) {
                            const toolLoc = world.getLocation(items.multitool);
                            const playerId = world.getPlayer()?.id;
                            if (toolLoc === playerId) {
                                return { valid: false, error: 'story.desk.pry-with-tool' };
                            }
                            return { valid: false, error: types_1.Msg.DESK_LOCKED };
                        }
                    }
                    return null;
                },
                onBlocked(entity, world, actorId, error) {
                    if (error === 'story.desk.pry-with-tool') {
                        const msg = (0, actions_1.pryOpenDesk)(world, items);
                        return [(0, world_model_1.createEffect)('game.message', { messageId: msg })];
                    }
                    if (error === types_1.Msg.DESK_LOCKED) {
                        return [(0, world_model_1.createEffect)('game.message', { messageId: types_1.Msg.DESK_LOCKED })];
                    }
                    return null;
                },
            },
        },
        // TAKE data chip in mess hall → reveal it if concealed
        {
            actionId: 'if.action.taking',
            interceptor: {
                preValidate(entity) {
                    // Block taking the scenery barricade
                    const propId = (0, types_1.getPropId)(entity);
                    if (propId === 'cargo-barricade' || propId === 'vasik-barricade') {
                        return { valid: false, error: 'story.barricade.cant_take' };
                    }
                    return null;
                },
                onBlocked(entity) {
                    const propId = (0, types_1.getPropId)(entity);
                    if (propId === 'cargo-barricade' || propId === 'vasik-barricade') {
                        return [(0, world_model_1.createEffect)('game.message', { messageId: 'story.barricade.cant_take' })];
                    }
                    return null;
                },
            },
        },
        // READ research terminal → discover pathogen
        {
            actionId: 'if.action.reading',
            interceptor: {
                postExecute(entity, world) {
                    const propId = (0, types_1.getPropId)(entity);
                    if (propId === 'research-terminal' || propId === 'patient-logs') {
                        if (!world.getStateValue(types_1.ScoreIds.DISCOVER_PATHOGEN)) {
                            world.setStateValue(types_1.ScoreIds.DISCOVER_PATHOGEN, true);
                            world.awardScore(types_1.ScoreIds.DISCOVER_PATHOGEN, 5, 'Discovering the pathogen');
                        }
                    }
                },
            },
        },
        // UNLOCK bridge door with keycard
        {
            actionId: 'if.action.unlocking',
            interceptor: {
                postExecute(entity, world) {
                    if (entity.id === items.bridgeDoor) {
                        world.setStateValue(types_1.StateKeys.BRIDGE_UNLOCKED, true);
                        world.awardScore(types_1.ScoreIds.OPEN_BRIDGE, 5, 'Accessing the bridge');
                    }
                },
            },
        },
    ];
}
//# sourceMappingURL=interceptors.js.map