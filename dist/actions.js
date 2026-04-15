"use strict";
/**
 * No Signal Home — Custom Actions
 *
 * Story-specific actions following the 4-phase pattern.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pryOpenDesk = pryOpenDesk;
exports.revealDataChip = revealDataChip;
exports.getCustomActions = getCustomActions;
const world_model_1 = require("@sharpee/world-model");
const types_1 = require("./types");
const world_1 = require("./world");
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function pryOpenDesk(world, items) {
    if (world.getStateValue(types_1.StateKeys.DESK_OPENED))
        return types_1.Msg.NOTHING_HAPPENS;
    const desk = world.getEntity(items.captainsDesk);
    if (!desk)
        return types_1.Msg.NOTHING_HAPPENS;
    const lock = desk.get(world_model_1.LockableTrait);
    const open = desk.get(world_model_1.OpenableTrait);
    if (lock)
        lock.isLocked = false;
    if (open)
        open.isOpen = true;
    world.setStateValue(types_1.StateKeys.DESK_OPENED, true);
    world.awardScore(types_1.ScoreIds.FIND_KEYCARD, 5, 'Finding the bridge keycard');
    return types_1.Msg.DESK_PRIED;
}
function revealDataChip(world, items) {
    const chip = world.getEntity(items.dataChip);
    if (!chip)
        return types_1.Msg.NOTHING_HAPPENS;
    const id = chip.get(world_model_1.IdentityTrait);
    if (id && id.concealed) {
        id.concealed = false;
        world.awardScore(types_1.ScoreIds.FIND_DATA_CHIP, 5, 'Finding the hidden data chip');
        return types_1.Msg.DATA_CHIP_FOUND;
    }
    return types_1.Msg.NOTHING_HAPPENS;
}
// Helper to extract text from parsed textSlots
function getTextSlot(ctx) {
    const textSlots = ctx.command?.parsed?.textSlots;
    if (textSlots && textSlots.size > 0) {
        return Array.from(textSlots.values()).join(' ').toLowerCase();
    }
    return '';
}
// ============================================================================
// CUSTOM ACTIONS
// ============================================================================
function getCustomActions(rooms, items, npcs) {
    return [
        // --- PRY / FORCE OPEN ---
        (0, types_1.defineAction)('story.action.prying', 'special', {
            validate(ctx) {
                const target = ctx.command.directObject?.entity;
                if (!target)
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                const propId = (0, types_1.getPropId)(target);
                const toolLoc = ctx.world.getLocation(items.multitool);
                if (toolLoc !== ctx.player.id) {
                    return { valid: false, error: 'story.pry.need_tool' };
                }
                if (propId === 'captains-desk') {
                    if (ctx.world.getStateValue(types_1.StateKeys.DESK_OPENED)) {
                        return { valid: false, error: 'story.pry.already_open' };
                    }
                    ctx.sharedData.target = 'desk';
                    return { valid: true };
                }
                if (propId === 'weapons-crate') {
                    ctx.sharedData.target = 'crate';
                    return { valid: true };
                }
                return { valid: false, error: 'story.pry.cant' };
            },
            execute(ctx) {
                if (ctx.sharedData.target === 'desk') {
                    pryOpenDesk(ctx.world, items);
                }
                if (ctx.sharedData.target === 'crate') {
                    const crate = ctx.world.getEntity(items.weaponsCrate);
                    if (crate) {
                        const lock = crate.get(world_model_1.LockableTrait);
                        const open = crate.get(world_model_1.OpenableTrait);
                        if (lock)
                            lock.isLocked = false;
                        if (open)
                            open.isOpen = true;
                    }
                }
            },
            report(ctx) {
                if (ctx.sharedData.target === 'desk')
                    return [(0, types_1.gameMessage)(ctx, types_1.Msg.DESK_PRIED)];
                return [(0, types_1.gameMessage)(ctx, 'story.pry.crate_open')];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- REPAIR ELEVATOR ---
        (0, types_1.defineAction)('story.action.repairing', 'special', {
            validate(ctx) {
                const target = ctx.command.directObject?.entity;
                if (!target)
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                const propId = (0, types_1.getPropId)(target);
                if (propId !== 'elevator')
                    return { valid: false, error: 'story.repair.cant' };
                if (ctx.world.getStateValue(types_1.StateKeys.ELEVATOR_FIXED)) {
                    return { valid: false, error: 'story.repair.already' };
                }
                const partsLoc = ctx.world.getLocation(items.elevatorParts);
                if (partsLoc !== ctx.player.id) {
                    return { valid: false, error: types_1.Msg.ELEVATOR_REPAIR_NEED };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue(types_1.StateKeys.ELEVATOR_FIXED, true);
                ctx.world.awardScore(types_1.ScoreIds.FIX_ELEVATOR, 5, 'Repairing the elevator');
                ctx.world.connectRooms(rooms.lowerMidCorridor, rooms.cryoBay, 'east');
                ctx.world.removeEntity(items.elevatorParts);
            },
            report(ctx) {
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.ELEVATOR_REPAIR_DONE)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- ENTER CODE (cargo hold) ---
        (0, types_1.defineAction)('story.action.entering-code', 'special', {
            validate(ctx) {
                const playerLoc = ctx.world.getLocation(ctx.player.id);
                if (playerLoc !== rooms.cargoBay) {
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                }
                if (ctx.world.getStateValue(types_1.StateKeys.CARGO_HOLD_OPEN)) {
                    return { valid: false, error: 'story.cargo.already_open' };
                }
                const hasVasik = ctx.world.getStateValue(types_1.StateKeys.CARGO_CODE_VASIK);
                const hasOkafor = ctx.world.getStateValue(types_1.StateKeys.CARGO_CODE_OKAFOR);
                if (!hasVasik || !hasOkafor) {
                    return { valid: false, error: types_1.Msg.CARGO_CODE_HALF };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue(types_1.StateKeys.CARGO_HOLD_OPEN, true);
                const door = ctx.world.getEntity(items.cargoHoldDoor);
                if (door) {
                    const lock = door.get(world_model_1.LockableTrait);
                    const open = door.get(world_model_1.OpenableTrait);
                    if (lock)
                        lock.isLocked = false;
                    if (open)
                        open.isOpen = true;
                }
                ctx.world.awardScore(types_1.ScoreIds.OPEN_CARGO_HOLD, 10, 'Opening the cargo hold');
            },
            report(ctx) {
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.CARGO_CODE_RIGHT)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- CONNECT COMMS ---
        (0, types_1.defineAction)('story.action.connecting-comms', 'special', {
            validate(ctx) {
                const target = ctx.command.directObject?.entity;
                if (!target)
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                const propId = (0, types_1.getPropId)(target);
                if (propId !== 'comms-relay' && propId !== 'comms-panel') {
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                }
                const playerLoc = ctx.world.getLocation(ctx.player.id);
                if (playerLoc !== rooms.engineering && playerLoc !== rooms.bridge) {
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                }
                if (ctx.world.getStateValue(types_1.StateKeys.COMMS_CONNECTED)) {
                    return { valid: false, error: 'story.comms.already' };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue(types_1.StateKeys.COMMS_CONNECTED, true);
                ctx.world.awardScore(types_1.ScoreIds.COMMS_DECISION, 5, 'Connecting the comms relay');
            },
            report(ctx) {
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.COMMS_CONNECT)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- CUT CABLES (AI override path A) ---
        (0, types_1.defineAction)('story.action.cutting', 'special', {
            validate(ctx) {
                const target = ctx.command.directObject?.entity;
                if (!target)
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                const propId = (0, types_1.getPropId)(target);
                if (propId !== 'ai-cables' && propId !== 'junction-box') {
                    return { valid: false, error: 'story.cut.cant' };
                }
                const snipsLoc = ctx.world.getLocation(items.cableSnips);
                if (snipsLoc !== ctx.player.id) {
                    return { valid: false, error: 'story.cut.need_tool' };
                }
                if (ctx.world.getStateValue(types_1.StateKeys.CABLE_CUT)) {
                    return { valid: false, error: 'story.cut.already' };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue(types_1.StateKeys.CABLE_CUT, true);
                ctx.world.setStateValue(types_1.StateKeys.AI_OVERRIDE, true);
            },
            report(ctx) {
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.CABLE_CUT)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- USE SECURITY OVERRIDE PANEL ---
        (0, types_1.defineAction)('story.action.overriding', 'special', {
            validate(ctx) {
                let target = ctx.command.directObject?.entity;
                // Fixed-phrase grammar patterns won't resolve a target —
                // fall back to finding the security panel in the current room
                if (!target) {
                    const panelId = (0, world_1.getSceneryId)('security-panel');
                    if (panelId) {
                        const panel = ctx.world.getEntity(panelId);
                        if (panel) {
                            const loc = ctx.world.getLocation(panel.id);
                            const playerLoc = ctx.world.getLocation(ctx.player.id);
                            if (loc === playerLoc)
                                target = panel;
                        }
                    }
                }
                if (!target)
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                const propId = (0, types_1.getPropId)(target);
                if (propId !== 'security-panel') {
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue(types_1.StateKeys.BRIDGE_UNLOCKED, true);
                const bridgeDoor = ctx.world.getEntity(items.bridgeDoor);
                if (bridgeDoor) {
                    const lock = bridgeDoor.get(world_model_1.LockableTrait);
                    const open = bridgeDoor.get(world_model_1.OpenableTrait);
                    if (lock)
                        lock.isLocked = false;
                    if (open)
                        open.isOpen = true;
                }
                // If AI is already disabled, this triggers the Override ending
                if (ctx.world.getStateValue(types_1.StateKeys.AI_OVERRIDE) || ctx.world.getStateValue(types_1.StateKeys.CABLE_CUT)) {
                    ctx.world.setStateValue(types_1.StateKeys.GAME_ENDED, true);
                    ctx.world.awardScore(types_1.ScoreIds.ENDING_ACHIEVED, 10, 'Reaching an ending');
                }
            },
            report(ctx) {
                if (ctx.world.getStateValue(types_1.StateKeys.AI_OVERRIDE) || ctx.world.getStateValue(types_1.StateKeys.CABLE_CUT)) {
                    return [
                        (0, types_1.gameMessage)(ctx, types_1.Msg.ENDING_OVERRIDE),
                        ctx.event('game.ended', { reason: 'victory' }),
                    ];
                }
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.SECURITY_OVERRIDE)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- REACTOR OVERLOAD (destroy ending) ---
        (0, types_1.defineAction)('story.action.overloading', 'special', {
            validate(ctx) {
                const playerLoc = ctx.world.getLocation(ctx.player.id);
                if (playerLoc !== rooms.reactorRoom) {
                    return { valid: false, error: 'story.overload.not_here' };
                }
                if (!ctx.world.getStateValue(types_1.StateKeys.AI_OVERRIDE) && !ctx.world.getStateValue(types_1.StateKeys.CABLE_CUT)) {
                    return { valid: false, error: 'story.overload.ai_blocks' };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue('reactor-overloading', true);
            },
            report(ctx) {
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.REACTOR_OVERLOAD)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- LAUNCH ESCAPE POD ---
        (0, types_1.defineAction)('story.action.launching', 'special', {
            validate(ctx) {
                let target = ctx.command.directObject?.entity;
                // Fixed-phrase grammar ("launch pod", "escape") won't have a directObject —
                // fall back to finding the escape pod scenery in the current room
                if (!target) {
                    const podEntityId = (0, world_1.getSceneryId)('escape-pod');
                    if (podEntityId) {
                        const podEntity = ctx.world.getEntity(podEntityId);
                        if (podEntity) {
                            const loc = ctx.world.getLocation(podEntity.id);
                            const playerLoc = ctx.world.getLocation(ctx.player.id);
                            if (loc === playerLoc)
                                target = podEntity;
                        }
                    }
                }
                if (!target)
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                const propId = (0, types_1.getPropId)(target);
                if (propId !== 'escape-pod') {
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue(types_1.StateKeys.GAME_ENDED, true);
                ctx.world.awardScore(types_1.ScoreIds.ENDING_ACHIEVED, 10, 'Reaching an ending');
            },
            report(ctx) {
                // Pick ending based on game state
                let endingMsg = types_1.Msg.ENDING_ESCAPE_ALONE;
                if (ctx.world.getStateValue('reactor-overloading')) {
                    endingMsg = types_1.Msg.ENDING_DESTROY;
                }
                else if (ctx.world.getStateValue(types_1.StateKeys.SURVIVORS_READY)) {
                    endingMsg = types_1.Msg.ENDING_ESCAPE_SURVIVORS;
                }
                return [
                    (0, types_1.gameMessage)(ctx, endingMsg),
                    ctx.event('game.ended', { reason: 'victory' }),
                ];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- ASK NPC ABOUT (topic system) ---
        (0, types_1.defineAction)('story.action.asking-about', 'communication', {
            validate(ctx) {
                const target = ctx.command.directObject?.entity;
                if (!target)
                    return { valid: false, error: types_1.Msg.ASK_ABOUT_NOTHING };
                const targetId = target.id;
                const topic = getTextSlot(ctx);
                ctx.sharedData.targetId = targetId;
                ctx.sharedData.topic = topic;
                if (targetId !== npcs.reed && targetId !== npcs.vasik &&
                    targetId !== npcs.okafor && targetId !== npcs.lis) {
                    return { valid: false, error: types_1.Msg.ASK_ABOUT_DEFAULT };
                }
                if (!topic)
                    return { valid: false, error: types_1.Msg.ASK_ABOUT_NOTHING };
                return { valid: true };
            },
            report(ctx) {
                const { targetId, topic } = ctx.sharedData;
                const world = ctx.world;
                // Reed topics
                if (targetId === npcs.reed) {
                    const stage = world.getStateValue(types_1.StateKeys.REED_STAGE) ?? 1;
                    if (stage >= 4)
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.REED_TURNED)];
                    if (stage === 3)
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.REED_LUCID)];
                    if (topic.includes('ship') || topic.includes('stillwater'))
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.REED_SHIP)];
                    if (topic.includes('cargo') || topic.includes('hold'))
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.REED_CARGO)];
                    if (topic.includes('elevator') || topic.includes('lift') || topic.includes('cryo'))
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.REED_ELEVATOR)];
                    if (topic.includes('crew') || topic.includes('people'))
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.REED_CREW)];
                    if (topic.includes('self') || topic.includes('yourself') || topic.includes('reed'))
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.REED_SELF)];
                    return [(0, types_1.gameMessage)(ctx, types_1.Msg.ASK_ABOUT_DEFAULT)];
                }
                // Vasik topics
                if (targetId === npcs.vasik) {
                    if (topic.includes('cargo') || topic.includes('hold'))
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.VASIK_CARGO)];
                    if (topic.includes('company') || topic.includes('meridian'))
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.VASIK_COMPANY)];
                    if (topic.includes('code') || topic.includes('access')) {
                        world.setStateValue(types_1.StateKeys.CARGO_CODE_VASIK, true);
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.VASIK_CODE_HALF)];
                    }
                    if (topic.includes('override') || topic.includes('tool')) {
                        if (world.getLocation(items.overrideTool) === ctx.player.id) {
                            world.setStateValue(types_1.StateKeys.OVERRIDE_GIVEN, true);
                            world.awardScore(types_1.ScoreIds.VASIK_TRADE, 5, 'Trading with Vasik');
                            return [(0, types_1.gameMessage)(ctx, types_1.Msg.VASIK_TRADE)];
                        }
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.VASIK_OVERRIDE)];
                    }
                    return [(0, types_1.gameMessage)(ctx, types_1.Msg.ASK_ABOUT_DEFAULT)];
                }
                // Okafor topics
                if (targetId === npcs.okafor) {
                    if (topic.includes('prisoner') || topic.includes('cryo') || topic.includes('people') || topic.includes('frozen'))
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.OKAFOR_PRISONERS)];
                    if (topic.includes('code') || topic.includes('access') || topic.includes('cargo')) {
                        const trust = world.getStateValue(types_1.StateKeys.OKAFOR_STAGE) ?? 1;
                        if (trust >= 2) {
                            world.setStateValue(types_1.StateKeys.CARGO_CODE_OKAFOR, true);
                            world.awardScore(types_1.ScoreIds.OKAFOR_TRUST, 5, 'Earning Okafor\'s trust');
                            return [(0, types_1.gameMessage)(ctx, types_1.Msg.OKAFOR_CODE_HALF)];
                        }
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.OKAFOR_TERRITORY)];
                    }
                    if (topic.includes('escape') || topic.includes('leave') || topic.includes('pod'))
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.OKAFOR_ESCAPE)];
                    if (topic.includes('self') || topic.includes('yourself') || topic.includes('okafor'))
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.OKAFOR_SELF)];
                    return [(0, types_1.gameMessage)(ctx, types_1.Msg.ASK_ABOUT_DEFAULT)];
                }
                // Lis topics
                if (targetId === npcs.lis) {
                    const stage = world.getStateValue(types_1.StateKeys.LIS_STAGE) ?? 0;
                    if (stage >= 3)
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.LIS_PUPPET)];
                    if (topic.includes('self') || topic.includes('yourself') || topic.includes('lis'))
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.LIS_SELF)];
                    if (topic.includes('ai') || topic.includes('soms') || topic.includes('system'))
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.LIS_HELP)];
                    return [(0, types_1.gameMessage)(ctx, types_1.Msg.ASK_ABOUT_DEFAULT)];
                }
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.ASK_ABOUT_DEFAULT)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- QUERY TERMINAL / USE TERMINAL ---
        (0, types_1.defineAction)('story.action.querying', 'special', {
            validate(ctx) {
                const target = ctx.command.directObject?.entity;
                if (!target)
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                const terminal = target.get(types_1.TerminalTrait.type);
                if (!terminal)
                    return { valid: false, error: types_1.Msg.TERMINAL_USE };
                ctx.sharedData.query = getTextSlot(ctx);
                ctx.sharedData.terminalId = terminal.terminalId;
                return { valid: true };
            },
            report(ctx) {
                const aiStage = ctx.world.getStateValue(types_1.StateKeys.AI_STAGE) ?? 1;
                const query = ctx.sharedData.query;
                if (query.includes('ship') || query.includes('stillwater'))
                    return [(0, types_1.gameMessage)(ctx, types_1.Msg.SOMS_SHIP)];
                if (query.includes('cargo') || query.includes('manifest'))
                    return [(0, types_1.gameMessage)(ctx, types_1.Msg.SOMS_CARGO)];
                if (query.includes('pathogen') || query.includes('infection') || query.includes('disease'))
                    return [(0, types_1.gameMessage)(ctx, types_1.Msg.SOMS_PATHOGEN)];
                if (query.includes('comms') || query.includes('relay') || query.includes('transmit')) {
                    if (aiStage >= 2)
                        return [(0, types_1.gameMessage)(ctx, types_1.Msg.SOMS_HOSTILE)];
                    return [(0, types_1.gameMessage)(ctx, types_1.Msg.SOMS_COMMS_REQUEST)];
                }
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.TERMINAL_QUERY)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- SEARCH (find hidden items) ---
        (0, types_1.defineAction)('story.action.searching', 'interaction', {
            validate(ctx) {
                const target = ctx.command.directObject?.entity;
                if (!target)
                    return { valid: false, error: 'story.search.what' };
                ctx.sharedData.target = target;
                return { valid: true };
            },
            report(ctx) {
                const target = ctx.sharedData.target;
                const propId = (0, types_1.getPropId)(target);
                const playerLoc = ctx.world.getLocation(ctx.player.id);
                if (playerLoc === rooms.messHall && (target.name.includes('table') || target.name.includes('mess') ||
                    propId === 'food-fabricator' || target.name.includes('mug'))) {
                    const result = revealDataChip(ctx.world, items);
                    return [(0, types_1.gameMessage)(ctx, result)];
                }
                return [(0, types_1.gameMessage)(ctx, 'story.search.nothing')];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- WEAR HAZMAT ---
        (0, types_1.defineAction)('story.action.wearing-hazmat', 'interaction', {
            validate(ctx) {
                const target = ctx.command.directObject?.entity;
                if (!target || target.id !== items.hazmatSuit) {
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                }
                const loc = ctx.world.getLocation(items.hazmatSuit);
                if (loc !== ctx.player.id) {
                    return { valid: false, error: 'story.hazmat.not_carrying' };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue(types_1.StateKeys.HAZMAT_WEARING, true);
            },
            report(ctx) {
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.HAZMAT_WORN)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- PRESS ALARM BUTTON ---
        (0, types_1.defineAction)('story.action.pressing', 'special', {
            validate(ctx) {
                const target = ctx.command.directObject?.entity;
                // If no target, try to find the alarm button in current room
                let propId;
                if (target) {
                    propId = (0, types_1.getPropId)(target);
                }
                else {
                    const buttonId = (0, world_1.getSceneryId)('alarm-button');
                    if (buttonId) {
                        const button = ctx.world.getEntity(buttonId);
                        if (button) {
                            const loc = ctx.world.getLocation(button.id);
                            const playerLoc = ctx.world.getLocation(ctx.player.id);
                            if (loc === playerLoc)
                                propId = 'alarm-button';
                        }
                    }
                }
                if (propId !== 'alarm-button') {
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                }
                if (ctx.world.getStateValue(types_1.StateKeys.ALARM_SILENCED)) {
                    return { valid: false, error: types_1.Msg.ALARM_ALREADY_OFF };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue(types_1.StateKeys.ALARM_SILENCED, true);
                ctx.world.setStateValue(types_1.StateKeys.ALARM_ACTIVE, false);
                // Start the post-alarm collision fuse
                const turn = ctx.world.getStateValue(types_1.StateKeys.TURN_COUNT) ?? 0;
                ctx.world.setStateValue(types_1.StateKeys.COLLISION_FUSE_START, turn);
            },
            report(ctx) {
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.ALARM_SILENCED)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- MANEUVER (docking step 2) ---
        (0, types_1.defineAction)('story.action.maneuvering', 'special', {
            validate(ctx) {
                const playerLoc = ctx.world.getLocation(ctx.player.id);
                if (playerLoc !== rooms.tugCockpit) {
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                }
                if (!ctx.world.getStateValue(types_1.StateKeys.DOCKING_CONTROLS_EXAMINED)) {
                    return { valid: false, error: types_1.Msg.DOCK_NEED_EXAMINE };
                }
                const state = ctx.world.getStateValue(types_1.StateKeys.DOCKING_STATE);
                if (state !== 'approach') {
                    return { valid: false, error: types_1.Msg.DOCK_ALREADY_DONE };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue(types_1.StateKeys.DOCKING_STATE, 'maneuvered');
            },
            report(ctx) {
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.DOCK_MANEUVER)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- BRAKE / DECELERATE (optional docking quality step) ---
        (0, types_1.defineAction)('story.action.braking', 'special', {
            validate(ctx) {
                const playerLoc = ctx.world.getLocation(ctx.player.id);
                if (playerLoc !== rooms.tugCockpit) {
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                }
                const state = ctx.world.getStateValue(types_1.StateKeys.DOCKING_STATE);
                if (state !== 'maneuvered') {
                    if (state === 'approach')
                        return { valid: false, error: types_1.Msg.DOCK_NOT_MANEUVERED };
                    return { valid: false, error: types_1.Msg.DOCK_ALREADY_DONE };
                }
                if (ctx.world.getStateValue(types_1.StateKeys.DOCKING_BRAKED)) {
                    return { valid: false, error: types_1.Msg.DOCK_ALREADY_DONE };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue(types_1.StateKeys.DOCKING_BRAKED, true);
            },
            report(ctx) {
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.DOCK_BRAKE)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- CONNECT / EXTEND ARM (docking step 4) ---
        (0, types_1.defineAction)('story.action.docking-connect', 'special', {
            validate(ctx) {
                const playerLoc = ctx.world.getLocation(ctx.player.id);
                if (playerLoc !== rooms.tugCockpit) {
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                }
                const state = ctx.world.getStateValue(types_1.StateKeys.DOCKING_STATE);
                if (state === 'approach') {
                    return { valid: false, error: types_1.Msg.DOCK_NOT_MANEUVERED };
                }
                if (state !== 'maneuvered') {
                    return { valid: false, error: types_1.Msg.DOCK_ALREADY_DONE };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue(types_1.StateKeys.DOCKING_STATE, 'connected');
            },
            report(ctx) {
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.DOCK_CONNECT)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- CHECK PRESSURE / CHECK SEAL (optional quality step) ---
        (0, types_1.defineAction)('story.action.checking-pressure', 'special', {
            validate(ctx) {
                const playerLoc = ctx.world.getLocation(ctx.player.id);
                if (playerLoc !== rooms.tugCockpit) {
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                }
                const state = ctx.world.getStateValue(types_1.StateKeys.DOCKING_STATE);
                if (state !== 'connected') {
                    if (state === 'approach' || state === 'maneuvered') {
                        return { valid: false, error: types_1.Msg.DOCK_NOT_CONNECTED };
                    }
                    return { valid: false, error: types_1.Msg.DOCK_ALREADY_DONE };
                }
                if (ctx.world.getStateValue(types_1.StateKeys.DOCKING_CHECKED_PRESSURE)) {
                    return { valid: false, error: types_1.Msg.DOCK_ALREADY_DONE };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue(types_1.StateKeys.DOCKING_CHECKED_PRESSURE, true);
            },
            report(ctx) {
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.DOCK_CHECK_PRESSURE)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- SEAL / PRESSURIZE (docking step 6) ---
        (0, types_1.defineAction)('story.action.sealing', 'special', {
            validate(ctx) {
                const playerLoc = ctx.world.getLocation(ctx.player.id);
                if (playerLoc !== rooms.tugCockpit) {
                    return { valid: false, error: types_1.Msg.NOTHING_HAPPENS };
                }
                const state = ctx.world.getStateValue(types_1.StateKeys.DOCKING_STATE);
                if (state !== 'connected') {
                    if (state === 'approach' || state === 'maneuvered') {
                        return { valid: false, error: types_1.Msg.DOCK_NOT_CONNECTED };
                    }
                    return { valid: false, error: types_1.Msg.DOCK_ALREADY_DONE };
                }
                return { valid: true };
            },
            execute(ctx) {
                ctx.world.setStateValue(types_1.StateKeys.DOCKING_STATE, 'sealed');
                const checked = ctx.world.getStateValue(types_1.StateKeys.DOCKING_CHECKED_PRESSURE);
                if (checked) {
                    // Good seal — unlock and open airlock door
                    const door = ctx.world.getEntity(items.airlockDoor);
                    if (door) {
                        const lock = door.get(world_model_1.LockableTrait);
                        const open = door.get(world_model_1.OpenableTrait);
                        if (lock)
                            lock.isLocked = false;
                        if (open)
                            open.isOpen = true;
                    }
                }
                else {
                    // Bad seal — door stays locked, update message
                    const door = ctx.world.getEntity(items.airlockDoor);
                    if (door) {
                        const lock = door.get(world_model_1.LockableTrait);
                        if (lock) {
                            lock.lockedMessage = 'SEAL INTEGRITY CRITICAL. Atmosphere readings show hard vacuum beyond the seal. Going through would be suicide.';
                        }
                    }
                }
                ctx.sharedData.checkedPressure = checked;
            },
            report(ctx) {
                if (ctx.sharedData.checkedPressure) {
                    return [(0, types_1.gameMessage)(ctx, types_1.Msg.DOCK_SEAL_GOOD)];
                }
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.DOCK_SEAL_WARNING)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- HELP ---
        (0, types_1.defineAction)('story.action.help', 'meta', {
            validate() { return { valid: true }; },
            report(ctx) {
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.HELP)];
            },
            blocked: types_1.standardBlocked,
        }),
        // --- ABOUT ---
        (0, types_1.defineAction)('story.action.about', 'meta', {
            validate() { return { valid: true }; },
            report(ctx) {
                return [(0, types_1.gameMessage)(ctx, types_1.Msg.ABOUT)];
            },
            blocked: types_1.standardBlocked,
        }),
    ];
}
//# sourceMappingURL=actions.js.map