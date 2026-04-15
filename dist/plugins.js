"use strict";
/**
 * No Signal Home — Turn Plugins & Scheduler Events
 *
 * Timed events, dynamic descriptions, NPC state progression, win checks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlugins = createPlugins;
const world_model_1 = require("@sharpee/world-model");
const types_1 = require("./types");
const world_1 = require("./world");
// ============================================================================
// MEMORY TRAIT — first-examine flavor text, fires once per entity
// ============================================================================
function createMemoryPlugin() {
    return {
        id: 'story.memory',
        priority: 2,
        onAfterAction(ctx) {
            const actionId = ctx.actionResult?.actionId;
            const success = ctx.actionResult?.success;
            if (!success || actionId !== 'if.action.examining')
                return [];
            const targetId = ctx.actionResult?.targetId;
            if (!targetId)
                return [];
            const entity = ctx.world.getEntity(targetId);
            if (!entity)
                return [];
            const memory = (0, types_1.getMemory)(entity);
            if (!memory || memory.recalled || memory.trigger !== actionId)
                return [];
            memory.recalled = true;
            return [{ type: 'game.message', data: { messageId: memory.messageId } }];
        },
    };
}
// ============================================================================
// ALARM URGENCY — reminds player about the alarm each turn
// ============================================================================
function createAlarmUrgencyPlugin(rooms) {
    return {
        id: 'story.alarm-urgency',
        priority: 5,
        onAfterAction(ctx) {
            const world = ctx.world;
            if (!world.getStateValue(types_1.StateKeys.ALARM_ACTIVE))
                return [];
            if (world.getStateValue(types_1.StateKeys.ALARM_SILENCED))
                return [];
            // Don't nag if they just pressed the button
            const actionId = ctx.actionResult?.actionId;
            if (actionId === 'story.action.pressing')
                return [];
            const playerLoc = world.getLocation(world.getPlayer().id);
            if (playerLoc === rooms.tugCargoHold) {
                return [{ type: 'game.message', data: { messageId: types_1.Msg.ALARM_BLOCKED_CARGO } }];
            }
            if (playerLoc === rooms.tugCockpit) {
                return [{ type: 'game.message', data: { messageId: types_1.Msg.ALARM_BLOCKED_COCKPIT } }];
            }
            return [];
        },
    };
}
// ============================================================================
// ALARM FUSE — 10 turns to silence alarm, then 20 turns to maneuver
// ============================================================================
function createAlarmFusePlugin(rooms) {
    return {
        id: 'story.alarm-fuse',
        priority: 3,
        onAfterAction(ctx) {
            const world = ctx.world;
            const turn = world.getStateValue(types_1.StateKeys.TURN_COUNT) ?? 0;
            // Phase 1: Alarm still active — 10 turn limit
            if (world.getStateValue(types_1.StateKeys.ALARM_ACTIVE) && !world.getStateValue(types_1.StateKeys.ALARM_SILENCED)) {
                if (turn >= 10) {
                    return [
                        { type: 'game.message', data: { messageId: types_1.Msg.ALARM_COLLISION_DEATH } },
                        { type: 'game.ended', data: { reason: 'death' } },
                    ];
                }
                return [];
            }
            // Phase 2: Alarm silenced but not yet maneuvered — 20 turn limit
            if (world.getStateValue(types_1.StateKeys.ALARM_SILENCED)) {
                const dockState = world.getStateValue(types_1.StateKeys.DOCKING_STATE);
                if (dockState === 'approach') {
                    const fuseStart = world.getStateValue(types_1.StateKeys.COLLISION_FUSE_START) ?? 0;
                    const elapsed = turn - fuseStart;
                    if (elapsed >= 20) {
                        return [
                            { type: 'game.message', data: { messageId: types_1.Msg.COLLISION_DEATH } },
                            { type: 'game.ended', data: { reason: 'death' } },
                        ];
                    }
                }
            }
            return [];
        },
    };
}
// ============================================================================
// VIEWPORT ESCALATION — tied to post-alarm fuse progress
// ============================================================================
function createViewportPlugin(rooms) {
    return {
        id: 'story.viewport-escalation',
        priority: 4,
        onAfterAction(ctx) {
            const world = ctx.world;
            if (!world.getStateValue(types_1.StateKeys.ALARM_SILENCED))
                return [];
            const dockState = world.getStateValue(types_1.StateKeys.DOCKING_STATE);
            if (dockState !== 'approach')
                return [];
            const turn = world.getStateValue(types_1.StateKeys.TURN_COUNT) ?? 0;
            const fuseStart = world.getStateValue(types_1.StateKeys.COLLISION_FUSE_START) ?? 0;
            const elapsed = turn - fuseStart;
            // Update tug viewport description based on proximity
            const vpId = (0, world_1.getSceneryId)('tug-viewport');
            if (vpId) {
                const vp = world.getEntity(vpId);
                if (vp) {
                    const id = vp.get(world_model_1.IdentityTrait);
                    if (id) {
                        if (elapsed >= 15) {
                            id.description = "The Stillwater is all you can see. Dark metal, arm's reach away. You're out of time.";
                        }
                        else if (elapsed >= 10) {
                            id.description = "The hull fills the entire viewport. Individual rivets visible. You can see a docking port, dead ahead.";
                        }
                        else if (elapsed >= 5) {
                            id.description = "The derelict's hull is closer. Details emerging — hull plating, maintenance hatches, a faded corporate logo.";
                        }
                    }
                }
            }
            // Show viewport stage messages at thresholds
            const playerLoc = world.getLocation(world.getPlayer().id);
            if (playerLoc === rooms.tugCockpit) {
                if (elapsed === 5)
                    return [{ type: 'game.message', data: { messageId: types_1.Msg.VIEWPORT_STAGE_1 } }];
                if (elapsed === 10)
                    return [{ type: 'game.message', data: { messageId: types_1.Msg.VIEWPORT_STAGE_2 } }];
                if (elapsed === 15)
                    return [{ type: 'game.message', data: { messageId: types_1.Msg.VIEWPORT_STAGE_3 } }];
                if (elapsed === 18)
                    return [{ type: 'game.message', data: { messageId: types_1.Msg.VIEWPORT_STAGE_4 } }];
            }
            return [];
        },
    };
}
// ============================================================================
// SEAL DEGRADATION — 2-3 turns after boarding the Stillwater
// ============================================================================
function createSealDegradationPlugin(rooms, items) {
    return {
        id: 'story.seal-degradation',
        priority: 200,
        onAfterAction(ctx) {
            const world = ctx.world;
            if (world.getStateValue(types_1.StateKeys.TUG_DETACHED))
                return [];
            if (!world.getStateValue(types_1.StateKeys.PLAYER_BOARDED))
                return [];
            const turn = world.getStateValue(types_1.StateKeys.TURN_COUNT) ?? 0;
            const boardingTurn = world.getStateValue(types_1.StateKeys.BOARDING_TURN) ?? 0;
            const elapsed = turn - boardingTurn;
            // Fire at 3 turns after boarding
            if (elapsed >= 3) {
                world.setStateValue(types_1.StateKeys.TUG_DETACHED, true);
                // Lock the airlock door from the Stillwater side
                const door = world.getEntity(items.airlockDoor);
                if (door) {
                    const lock = door.get(world_model_1.LockableTrait);
                    const open = door.get(world_model_1.OpenableTrait);
                    if (lock) {
                        lock.isLocked = true;
                        lock.lockedMessage = "The airlock seal is compromised. Hard vacuum on the other side. You'd need an EVA suit to cross back.";
                    }
                    if (open)
                        open.isOpen = false;
                }
                // Update viewport descriptions
                const vpId = (0, world_1.getSceneryId)('tug-viewport');
                if (vpId) {
                    const vp = world.getEntity(vpId);
                    if (vp) {
                        const id = vp.get(world_model_1.IdentityTrait);
                        if (id) {
                            if (world.getStateValue(types_1.StateKeys.DOCKING_BRAKED)) {
                                id.description = 'Through the viewport: your tug, still docked. But frost is forming on the docking junction. The seal is gone.';
                            }
                            else {
                                id.description = 'Through the viewport: empty space where your tug used to be. Nothing but stars.';
                            }
                        }
                    }
                }
                // Update inspection window description
                const winId = (0, world_1.getSceneryId)('inspection-window');
                if (winId) {
                    const win = world.getEntity(winId);
                    if (win) {
                        const id = win.get(world_model_1.IdentityTrait);
                        if (id) {
                            if (world.getStateValue(types_1.StateKeys.DOCKING_BRAKED)) {
                                id.description = 'Through the window: the docking junction, frosted with ice crystals. Your tug is still there, but the seal is compromised. Vacuum between you and it.';
                            }
                            else {
                                id.description = 'Through the window: the docking clamp, sheared and empty. Your tug is gone. A few fragments of metal drift in the void.';
                            }
                        }
                    }
                }
                // Choose message based on braked flag
                if (world.getStateValue(types_1.StateKeys.DOCKING_BRAKED)) {
                    return [{ type: 'game.message', data: { messageId: types_1.Msg.SEAL_DEGRADE_STAYS } }];
                }
                else {
                    return [{ type: 'game.message', data: { messageId: types_1.Msg.SEAL_DEGRADE_DRIFTS } }];
                }
            }
            return [];
        },
    };
}
// ============================================================================
// BAD SEAL DEATH — handles escalating warnings and death at airlock
// ============================================================================
function createBadSealPlugin(rooms, items) {
    return {
        id: 'story.bad-seal',
        priority: 10,
        onAfterAction(ctx) {
            const world = ctx.world;
            const dockState = world.getStateValue(types_1.StateKeys.DOCKING_STATE);
            if (dockState !== 'sealed')
                return [];
            if (world.getStateValue(types_1.StateKeys.DOCKING_CHECKED_PRESSURE))
                return [];
            // Death check runs BEFORE the boarding guard — the boarding plugin
            // (priority 8) sets PLAYER_BOARDED before this plugin (priority 10),
            // so the guard would block the death from ever firing.
            if (world.getStateValue(types_1.StateKeys.SEAL_DEATH_ARMED)) {
                const playerLoc = world.getLocation(world.getPlayer().id);
                if (playerLoc === rooms.airlock) {
                    return [
                        { type: 'game.message', data: { messageId: types_1.Msg.BAD_SEAL_DEATH } },
                        { type: 'game.ended', data: { reason: 'death' } },
                    ];
                }
            }
            // After boarding, no more warnings needed
            if (world.getStateValue(types_1.StateKeys.PLAYER_BOARDED))
                return [];
            // Arm the death trap on the first turn after a bad seal.
            // The engine handles locked doors at the route level (before the going
            // action dispatches), so we can't detect a failed "go aft" via
            // actionResult. Instead, on the first post-seal turn in the cockpit,
            // show the warning, unlock the door, and arm death for the next crossing.
            const count = world.getStateValue(types_1.StateKeys.BAD_SEAL_WARNING_COUNT) || 0;
            if (count === 0) {
                const playerLoc = world.getLocation(world.getPlayer().id);
                if (playerLoc === rooms.tugCockpit) {
                    world.setStateValue(types_1.StateKeys.BAD_SEAL_WARNING_COUNT, 1);
                    // Unlock and open the door so the next attempt goes through
                    const door = world.getEntity(items.airlockDoor);
                    if (door) {
                        const lock = door.get(world_model_1.LockableTrait);
                        const open = door.get(world_model_1.OpenableTrait);
                        if (lock)
                            lock.isLocked = false;
                        if (open)
                            open.isOpen = true;
                    }
                    world.setStateValue(types_1.StateKeys.SEAL_DEATH_ARMED, true);
                    return [{ type: 'game.message', data: { messageId: types_1.Msg.BAD_SEAL_WARNING } }];
                }
            }
            return [];
        },
    };
}
// ============================================================================
// BOARDING DETECTION — sets PLAYER_BOARDED when entering the Stillwater
// ============================================================================
function createBoardingPlugin(rooms) {
    return {
        id: 'story.boarding',
        priority: 8,
        onAfterAction(ctx) {
            const world = ctx.world;
            if (world.getStateValue(types_1.StateKeys.PLAYER_BOARDED))
                return [];
            const playerLoc = world.getLocation(world.getPlayer().id);
            // Player enters the airlock or forward corridor = boarded
            if (playerLoc === rooms.airlock || playerLoc === rooms.forwardCorridor) {
                world.setStateValue(types_1.StateKeys.PLAYER_BOARDED, true);
                const turn = world.getStateValue(types_1.StateKeys.TURN_COUNT) ?? 0;
                world.setStateValue(types_1.StateKeys.BOARDING_TURN, turn);
            }
            return [];
        },
    };
}
// ============================================================================
// TURN COUNTER
// ============================================================================
function createTurnCounterPlugin() {
    return {
        id: 'story.turn-counter',
        priority: 1,
        onAfterAction(ctx) {
            const turn = (ctx.world.getStateValue(types_1.StateKeys.TURN_COUNT) ?? 0) + 1;
            ctx.world.setStateValue(types_1.StateKeys.TURN_COUNT, turn);
            return [];
        },
    };
}
// ============================================================================
// NPC STATE PROGRESSION — Reed infection, AI stages, Lis appearance
// ============================================================================
function createNpcProgressionPlugin(npcs, rooms) {
    return {
        id: 'story.npc-progression',
        priority: 50,
        onAfterAction(ctx) {
            const turn = ctx.world.getStateValue(types_1.StateKeys.TURN_COUNT) ?? 0;
            const events = [];
            // Reed infection stages: 1 → 2 at turn 20, 2 → 3 at turn 35, 3 → 4 at turn 45
            const reedStage = ctx.world.getStateValue(types_1.StateKeys.REED_STAGE) ?? 1;
            if (reedStage === 1 && turn >= 20) {
                ctx.world.setStateValue(types_1.StateKeys.REED_STAGE, 2);
            }
            else if (reedStage === 2 && turn >= 35) {
                ctx.world.setStateValue(types_1.StateKeys.REED_STAGE, 3);
                events.push({ type: 'game.message', data: { messageId: types_1.Msg.REED_LUCID } });
            }
            else if (reedStage === 3 && turn >= 45) {
                ctx.world.setStateValue(types_1.StateKeys.REED_STAGE, 4);
                // Update Reed's description
                const reed = ctx.world.getEntity(npcs.reed);
                if (reed) {
                    const id = reed.get(world_model_1.IdentityTrait);
                    if (id)
                        id.description = 'Reed looks... fine. Too fine. Clean coveralls, relaxed posture, a faint smile. Everything about them is wrong.';
                }
            }
            // AI stage progression: 1 → 2 after comms refused or turn 30, 2 → 3 at turn 50
            const aiStage = ctx.world.getStateValue(types_1.StateKeys.AI_STAGE) ?? 1;
            if (aiStage === 1) {
                if (ctx.world.getStateValue(types_1.StateKeys.COMMS_REFUSED) || turn >= 30) {
                    ctx.world.setStateValue(types_1.StateKeys.AI_STAGE, 2);
                }
            }
            else if (aiStage === 2 && turn >= 50) {
                ctx.world.setStateValue(types_1.StateKeys.AI_STAGE, 3);
            }
            // Lis appears at turn 15
            if (turn === 15 && !ctx.world.getStateValue(types_1.StateKeys.LIS_STAGE)) {
                ctx.world.setStateValue(types_1.StateKeys.LIS_STAGE, 1);
                const lis = ctx.world.getEntity(npcs.lis);
                if (lis) {
                    const id = lis.get(world_model_1.IdentityTrait);
                    if (id)
                        id.concealed = false;
                }
            }
            // Lis stage progression
            const lisStage = ctx.world.getStateValue(types_1.StateKeys.LIS_STAGE) ?? 0;
            if (lisStage === 1 && turn >= 30) {
                ctx.world.setStateValue(types_1.StateKeys.LIS_STAGE, 2);
            }
            else if (lisStage === 2 && turn >= 45) {
                ctx.world.setStateValue(types_1.StateKeys.LIS_STAGE, 3);
            }
            // Vasik stages
            if (ctx.world.getStateValue(types_1.StateKeys.OVERRIDE_GIVEN) &&
                (ctx.world.getStateValue(types_1.StateKeys.VASIK_STAGE) ?? 1) < 2) {
                ctx.world.setStateValue(types_1.StateKeys.VASIK_STAGE, 2);
            }
            // Okafor trust (stage up when you talk to them after meeting)
            if (ctx.world.getStateValue(types_1.StateKeys.MET_OKAFOR) &&
                (ctx.world.getStateValue(types_1.StateKeys.OKAFOR_STAGE) ?? 1) < 2 &&
                turn >= 25) {
                ctx.world.setStateValue(types_1.StateKeys.OKAFOR_STAGE, 2);
            }
            return events;
        },
    };
}
// ============================================================================
// ATMOSPHERE — periodic flavor events
// ============================================================================
function createAtmospherePlugin(rooms) {
    return {
        id: 'story.atmosphere',
        priority: 500,
        onAfterAction(ctx) {
            const turn = ctx.world.getStateValue(types_1.StateKeys.TURN_COUNT) ?? 0;
            const playerLoc = ctx.world.getLocation(ctx.world.getPlayer().id);
            // Ship creaks every ~8 turns
            if (turn > 0 && turn % 8 === 0) {
                return [{ type: 'game.message', data: { messageId: types_1.Msg.SHIP_CREAK } }];
            }
            // Reactor warming (lower deck rooms, after turn 25)
            if (turn > 25 && turn % 12 === 0 &&
                (playerLoc === rooms.aftCorridor || playerLoc === rooms.engineering || playerLoc === rooms.reactorRoom)) {
                return [{ type: 'game.message', data: { messageId: types_1.Msg.REACTOR_WARMING } }];
            }
            // AI spreading (after AI stage 2)
            const aiStage = ctx.world.getStateValue(types_1.StateKeys.AI_STAGE) ?? 1;
            if (aiStage >= 2 && turn % 10 === 0) {
                return [{ type: 'game.message', data: { messageId: types_1.Msg.AI_SPREADING } }];
            }
            // Containment failing (after cargo hold opened, periodic)
            if (ctx.world.getStateValue(types_1.StateKeys.CARGO_HOLD_OPEN) && turn % 15 === 0) {
                return [{ type: 'game.message', data: { messageId: types_1.Msg.CONTAINMENT_FAILING } }];
            }
            // Destination warning (after turn 55)
            if (turn >= 55 && turn % 10 === 0) {
                return [{ type: 'game.message', data: { messageId: types_1.Msg.DESTINATION_WARNING } }];
            }
            return [];
        },
    };
}
// ============================================================================
// RADIATION HAZARD — damage in reactor room without hazmat
// ============================================================================
function createRadiationPlugin(rooms) {
    return {
        id: 'story.radiation',
        priority: 100,
        onAfterAction(ctx) {
            const playerLoc = ctx.world.getLocation(ctx.world.getPlayer().id);
            if (playerLoc === rooms.reactorRoom &&
                !ctx.world.getStateValue(types_1.StateKeys.HAZMAT_WEARING)) {
                return [{ type: 'game.message', data: { messageId: types_1.Msg.RADIATION_WARNING } }];
            }
            return [];
        },
    };
}
// ============================================================================
// DYNAMIC DESCRIPTIONS — update based on world state
// ============================================================================
function createDescriptionPlugin(items, rooms) {
    return {
        id: 'story.descriptions',
        priority: 50,
        onAfterAction(ctx) {
            const world = ctx.world;
            // Airlock door locked message varies by docking state
            const aDoor = world.getEntity(items.airlockDoor);
            if (aDoor) {
                const lock = aDoor.get(world_model_1.LockableTrait);
                if (lock && lock.isLocked) {
                    const dockState = world.getStateValue(types_1.StateKeys.DOCKING_STATE);
                    if (dockState === 'approach') {
                        lock.lockedMessage = "The airlock is sealed. You need to complete the docking sequence first.";
                    }
                    else if (dockState === 'maneuvered') {
                        lock.lockedMessage = "The docking arm isn't connected yet. You need to extend it and seal the airlock.";
                    }
                    else if (dockState === 'connected') {
                        lock.lockedMessage = "The airlock isn't pressurized. You need to seal it first.";
                    }
                    // 'sealed' with bad pressure has its own lockedMessage set by the action
                }
            }
            // Cockpit description updates after alarm silenced
            const cockpit = world.getEntity(rooms.tugCockpit);
            if (cockpit && world.getStateValue(types_1.StateKeys.ALARM_SILENCED)) {
                const id = cockpit.get(world_model_1.IdentityTrait);
                if (id) {
                    const dockState = world.getStateValue(types_1.StateKeys.DOCKING_STATE);
                    if (dockState === 'sealed') {
                        id.description = 'The cockpit is quiet. Instruments show a stable dock. The airlock door aft is ready.';
                    }
                    else if (dockState === 'approach') {
                        id.description = "A cramped cockpit. The alarm is off but the silence is worse. Through the viewport, a massive hull — Meridian Solutions corporate freighter. Getting closer. You need to dock.";
                    }
                    else {
                        id.description = "A cramped cockpit. Docking in progress. The Stillwater's hull fills the viewport.";
                    }
                }
            }
            // Captain's desk description
            const desk = world.getEntity(items.captainsDesk);
            if (desk) {
                const id = desk.get(world_model_1.IdentityTrait);
                const open = desk.get('openable');
                if (id && open) {
                    id.description = open.isOpen
                        ? "The desk drawer is open. The lock has been forced."
                        : "A standard-issue officer's desk bolted to the bulkhead. The drawer has a simple mechanical lock.";
                }
            }
            // Elevator description
            const elevId = (0, world_1.getSceneryId)('elevator');
            if (elevId) {
                const elev = world.getEntity(elevId);
                if (elev) {
                    const id = elev.get(world_model_1.IdentityTrait);
                    if (id) {
                        id.description = world.getStateValue(types_1.StateKeys.ELEVATOR_FIXED)
                            ? 'The freight elevator hums steadily. The cryo deck is accessible to starboard.'
                            : 'A freight elevator leading down to the cryo deck. The control panel is dead — the motor assembly has failed.';
                    }
                }
            }
            // Common viewport after tug detaches
            const vpId = (0, world_1.getSceneryId)('common-viewport');
            if (vpId && world.getStateValue(types_1.StateKeys.TUG_DETACHED)) {
                const vp = world.getEntity(vpId);
                if (vp) {
                    const id = vp.get(world_model_1.IdentityTrait);
                    if (id) {
                        if (world.getStateValue(types_1.StateKeys.DOCKING_BRAKED)) {
                            id.description = 'Through the viewport: your tug, still docked to the hull. Frost on the docking junction. No way back without a suit.';
                        }
                        else {
                            id.description = 'Through the viewport: black nothing. Stars. Your tug is gone. Nothing.';
                        }
                    }
                }
            }
            // Bridge door description
            const bDoor = world.getEntity(items.bridgeDoor);
            if (bDoor) {
                const id = bDoor.get(world_model_1.IdentityTrait);
                if (id && world.getStateValue(types_1.StateKeys.BRIDGE_UNLOCKED)) {
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
function createEndingCheckPlugin() {
    return {
        id: 'story.ending-check',
        priority: 1000,
        onAfterAction(ctx) {
            if (ctx.world.getStateValue(types_1.StateKeys.GAME_ENDED)) {
                return [
                    { type: 'game.message', data: { messageId: types_1.Msg.VICTORY } },
                    { type: 'game.ended', data: { reason: 'victory' } },
                ];
            }
            // Check for reactor overload ending
            if (ctx.world.getStateValue('reactor-overloading')) {
                ctx.world.setStateValue(types_1.StateKeys.GAME_ENDED, true);
                // If player is NOT in escape pod / bridge area, they die
                const playerLoc = ctx.world.getLocation(ctx.world.getPlayer().id);
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
function createPlugins(items, npcs, rooms) {
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
//# sourceMappingURL=plugins.js.map