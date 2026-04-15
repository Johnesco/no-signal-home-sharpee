/**
 * No Signal Home — Shared Types and Constants
 *
 * Typed ID interfaces, message IDs, score constants, custom traits,
 * and helper functions for the entire game.
 */
import { StoryConfig } from '@sharpee/engine';
import { IFEntity } from '@sharpee/world-model';
import type { ITrait } from '@sharpee/world-model';
import { Action, ActionContext, ValidationResult } from '@sharpee/stdlib';
import type { ISemanticEvent } from '@sharpee/core';
export interface RoomIds {
    tugCargoHold: string;
    tugCockpit: string;
    airlock: string;
    forwardCorridor: string;
    maintenanceShaft: string;
    cargoBay: string;
    cargoHold: string;
    storageAnnex: string;
    lowerMidCorridor: string;
    cryoBay: string;
    cryoControl: string;
    aftCorridor: string;
    engineering: string;
    reactorRoom: string;
    centralJunction: string;
    labCorridor: string;
    scienceLab: string;
    medbay: string;
    habCorridor: string;
    messHall: string;
    library: string;
    upperCorridor: string;
    crewBunks: string;
    commonArea: string;
    captainsCabin: string;
    bridge: string;
}
export interface ItemIds {
    flashlight: string;
    rationBar: string;
    multitool: string;
    stunBaton: string;
    keycard: string;
    captainsJournal: string;
    hazmatSuit: string;
    elevatorParts: string;
    foodMakerParts: string;
    dataChip: string;
    medkit: string;
    evaSuit: string;
    overrideTool: string;
    cableSnips: string;
    airlockDoor: string;
    bridgeDoor: string;
    cargoHoldDoor: string;
    captainsDesk: string;
    weaponsCrate: string;
}
export interface NpcIds {
    reed: string;
    vasik: string;
    okafor: string;
    lis: string;
}
export declare const config: StoryConfig;
export declare const Msg: {
    readonly TUG_DETACHED: "story.tug.detached";
    readonly TUG_INACCESSIBLE: "story.tug.inaccessible";
    readonly DARK_ROOM: "story.dark.room";
    readonly DARK_MOVE: "story.dark.move";
    readonly RADIATION_WARNING: "story.radiation.warning";
    readonly RADIATION_DAMAGE: "story.radiation.damage";
    readonly ELEVATOR_BROKEN: "story.elevator.broken";
    readonly ELEVATOR_FIXED: "story.elevator.fixed";
    readonly BRIDGE_LOCKED: "story.bridge.locked";
    readonly BRIDGE_UNLOCKED: "story.bridge.unlocked";
    readonly CARGO_HOLD_LOCKED: "story.cargo_hold.locked";
    readonly FLASHLIGHT_DIM: "story.flashlight.dim";
    readonly FLASHLIGHT_DEAD: "story.flashlight.dead";
    readonly KEYCARD_FOUND: "story.keycard.found";
    readonly JOURNAL_READ: "story.journal.read";
    readonly DATA_CHIP_FOUND: "story.data_chip.found";
    readonly OVERRIDE_TOOL_FOUND: "story.override_tool.found";
    readonly HAZMAT_WORN: "story.hazmat.worn";
    readonly DESK_LOCKED: "story.desk.locked";
    readonly DESK_PRIED: "story.desk.pried";
    readonly DESK_HACKED: "story.desk.hacked";
    readonly CARGO_CODE_ENTER: "story.cargo_code.enter";
    readonly CARGO_CODE_WRONG: "story.cargo_code.wrong";
    readonly CARGO_CODE_RIGHT: "story.cargo_code.right";
    readonly CARGO_CODE_HALF: "story.cargo_code.half";
    readonly ELEVATOR_REPAIR_NEED: "story.elevator.repair_need";
    readonly ELEVATOR_REPAIR_DONE: "story.elevator.repair_done";
    readonly COMMS_CONNECT: "story.comms.connect";
    readonly COMMS_REFUSE: "story.comms.refuse";
    readonly CABLE_CUT: "story.cable.cut";
    readonly CABLE_WRONG: "story.cable.wrong";
    readonly HACK_BRIDGE: "story.hack.bridge";
    readonly REACTOR_OVERLOAD: "story.reactor.overload";
    readonly REACTOR_SHUTDOWN: "story.reactor.shutdown";
    readonly SECURITY_OVERRIDE: "story.security.override";
    readonly REED_GREET: "story.reed.greet";
    readonly REED_SHIP: "story.reed.ship";
    readonly REED_CARGO: "story.reed.cargo";
    readonly REED_ELEVATOR: "story.reed.elevator";
    readonly REED_CREW: "story.reed.crew";
    readonly REED_SELF: "story.reed.self";
    readonly REED_GLITCH: "story.reed.glitch";
    readonly REED_LUCID: "story.reed.lucid";
    readonly REED_TURNED: "story.reed.turned";
    readonly REED_HELP_ELEVATOR: "story.reed.help_elevator";
    readonly VASIK_GREET: "story.vasik.greet";
    readonly VASIK_BARRICADE: "story.vasik.barricade";
    readonly VASIK_TRADE: "story.vasik.trade";
    readonly VASIK_CARGO: "story.vasik.cargo";
    readonly VASIK_COMPANY: "story.vasik.company";
    readonly VASIK_CODE_HALF: "story.vasik.code_half";
    readonly VASIK_OVERRIDE: "story.vasik.override";
    readonly VASIK_DESPERATE: "story.vasik.desperate";
    readonly OKAFOR_GREET: "story.okafor.greet";
    readonly OKAFOR_TERRITORY: "story.okafor.territory";
    readonly OKAFOR_PRISONERS: "story.okafor.prisoners";
    readonly OKAFOR_CODE_HALF: "story.okafor.code_half";
    readonly OKAFOR_ESCAPE: "story.okafor.escape";
    readonly OKAFOR_SELF: "story.okafor.self";
    readonly OKAFOR_TRUST: "story.okafor.trust";
    readonly LIS_APPEAR: "story.lis.appear";
    readonly LIS_SELF: "story.lis.self";
    readonly LIS_PUPPET: "story.lis.puppet";
    readonly LIS_HELP: "story.lis.help";
    readonly LIS_SWITCH: "story.lis.switch";
    readonly SOMS_GREET: "story.soms.greet";
    readonly SOMS_SHIP: "story.soms.ship";
    readonly SOMS_CARGO: "story.soms.cargo";
    readonly SOMS_PATHOGEN: "story.soms.pathogen";
    readonly SOMS_COMMS_REQUEST: "story.soms.comms_request";
    readonly SOMS_HOSTILE: "story.soms.hostile";
    readonly SOMS_FRAGMENT: "story.soms.fragment";
    readonly SOMS_CONFLICTED: "story.soms.conflicted";
    readonly SOMS_LOCK_DOOR: "story.soms.lock_door";
    readonly SOMS_ATMOSPHERE: "story.soms.atmosphere";
    readonly TERMINAL_USE: "story.terminal.use";
    readonly TERMINAL_QUERY: "story.terminal.query";
    readonly TERMINAL_CORRUPTED: "story.terminal.corrupted";
    readonly TERMINAL_LOCKED: "story.terminal.locked";
    readonly ASK_ABOUT_NOTHING: "story.ask.nothing";
    readonly ASK_ABOUT_DEFAULT: "story.ask.default";
    readonly PATHOGEN_EXPOSURE: "story.pathogen.exposure";
    readonly PATHOGEN_SYMPTOMS: "story.pathogen.symptoms";
    readonly PATHOGEN_TREATED: "story.pathogen.treated";
    readonly ENDING_ESCAPE_ALONE: "story.ending.escape_alone";
    readonly ENDING_ESCAPE_SURVIVORS: "story.ending.escape_survivors";
    readonly ENDING_DESTROY: "story.ending.destroy";
    readonly ENDING_OVERRIDE: "story.ending.override";
    readonly ENDING_MERGE: "story.ending.merge";
    readonly ALARM_BLOCKED_CARGO: "story.alarm.blocked_cargo";
    readonly ALARM_BLOCKED_COCKPIT: "story.alarm.blocked_cockpit";
    readonly ALARM_SILENCED: "story.alarm.silenced";
    readonly ALARM_ALREADY_OFF: "story.alarm.already_off";
    readonly ALARM_COLLISION_DEATH: "story.alarm.collision_death";
    readonly COLLISION_DEATH: "story.collision.death";
    readonly DOCK_NEED_EXAMINE: "story.dock.need_examine";
    readonly DOCK_CONTROLS_EXAMINED: "story.dock.controls_examined";
    readonly DOCK_MANEUVER: "story.dock.maneuver";
    readonly DOCK_BRAKE: "story.dock.brake";
    readonly DOCK_CONNECT: "story.dock.connect";
    readonly DOCK_CHECK_PRESSURE: "story.dock.check_pressure";
    readonly DOCK_SEAL_GOOD: "story.dock.seal_good";
    readonly DOCK_SEAL_WARNING: "story.dock.seal_warning";
    readonly DOCK_NOT_MANEUVERED: "story.dock.not_maneuvered";
    readonly DOCK_NOT_CONNECTED: "story.dock.not_connected";
    readonly DOCK_ALREADY_DONE: "story.dock.already_done";
    readonly DOCK_EXIT_APPROACH: "story.dock.exit_approach";
    readonly DOCK_EXIT_MANEUVERED: "story.dock.exit_maneuvered";
    readonly DOCK_EXIT_CONNECTED: "story.dock.exit_connected";
    readonly BAD_SEAL_WARNING: "story.seal.bad_warning";
    readonly BAD_SEAL_DEATH: "story.seal.bad_death";
    readonly SEAL_DEGRADE_STAYS: "story.seal.degrade_stays";
    readonly SEAL_DEGRADE_DRIFTS: "story.seal.degrade_drifts";
    readonly TUG_RETURN_BLOCKED: "story.tug.return_blocked";
    readonly VIEWPORT_STAGE_1: "story.viewport.stage1";
    readonly VIEWPORT_STAGE_2: "story.viewport.stage2";
    readonly VIEWPORT_STAGE_3: "story.viewport.stage3";
    readonly VIEWPORT_STAGE_4: "story.viewport.stage4";
    readonly SHIP_CREAK: "story.atmosphere.creak";
    readonly REACTOR_WARMING: "story.reactor.warming";
    readonly CONTAINMENT_FAILING: "story.containment.failing";
    readonly AI_SPREADING: "story.ai.spreading";
    readonly DESTINATION_WARNING: "story.destination.warning";
    readonly HELP: "story.help";
    readonly ABOUT: "story.about";
    readonly EXAMINE_SELF: "story.examine_self";
    readonly NOTHING_HAPPENS: "story.nothing_happens";
    readonly CANT_GO: "story.cant_go";
    readonly VICTORY: "story.victory";
    readonly DEATH: "story.death";
};
export declare const ScoreIds: {
    readonly EXPLORE_SHIP: "story.score.explore_ship";
    readonly FIND_FLASHLIGHT: "story.score.flashlight";
    readonly MEET_REED: "story.score.meet_reed";
    readonly MEET_VASIK: "story.score.meet_vasik";
    readonly MEET_OKAFOR: "story.score.meet_okafor";
    readonly FIND_KEYCARD: "story.score.keycard";
    readonly OPEN_BRIDGE: "story.score.open_bridge";
    readonly FIND_JOURNAL: "story.score.journal";
    readonly FIND_DATA_CHIP: "story.score.data_chip";
    readonly FIX_ELEVATOR: "story.score.fix_elevator";
    readonly OPEN_CARGO_HOLD: "story.score.open_cargo_hold";
    readonly DISCOVER_PATHOGEN: "story.score.discover_pathogen";
    readonly REACH_CRYO: "story.score.reach_cryo";
    readonly COMMS_DECISION: "story.score.comms_decision";
    readonly FIND_OVERRIDE: "story.score.find_override";
    readonly VASIK_TRADE: "story.score.vasik_trade";
    readonly OKAFOR_TRUST: "story.score.okafor_trust";
    readonly ENDING_ACHIEVED: "story.score.ending";
};
export declare const MAX_SCORE = 100;
export declare const StateKeys: {
    readonly TUG_DETACHED: "tug-detached";
    readonly PAINTING_MOVED: "painting-moved";
    readonly ELEVATOR_FIXED: "elevator-fixed";
    readonly BRIDGE_UNLOCKED: "bridge-unlocked";
    readonly CARGO_HOLD_OPEN: "cargo-hold-open";
    readonly COMMS_CONNECTED: "comms-connected";
    readonly COMMS_REFUSED: "comms-refused";
    readonly REACTOR_STAGE: "reactor-stage";
    readonly AI_STAGE: "ai-stage";
    readonly REED_STAGE: "reed-stage";
    readonly VASIK_STAGE: "vasik-stage";
    readonly OKAFOR_STAGE: "okafor-stage";
    readonly LIS_STAGE: "lis-stage";
    readonly PATHOGEN_LEVEL: "pathogen-level";
    readonly PLAYER_INFECTED: "player-infected";
    readonly PLAYER_TREATED: "player-treated";
    readonly HAZMAT_WEARING: "hazmat-wearing";
    readonly CARGO_CODE_VASIK: "cargo-code-vasik";
    readonly CARGO_CODE_OKAFOR: "cargo-code-okafor";
    readonly OVERRIDE_GIVEN: "override-given";
    readonly CABLE_CUT: "cable-cut";
    readonly AI_OVERRIDE: "ai-override";
    readonly GAME_ENDED: "game-ended";
    readonly MET_REED: "met-reed";
    readonly MET_VASIK: "met-vasik";
    readonly MET_OKAFOR: "met-okafor";
    readonly MET_LIS: "met-lis";
    readonly EMPATHY_SCORE: "empathy-score";
    readonly DESK_OPENED: "desk-opened";
    readonly TURN_COUNT: "turn-count";
    readonly SURVIVORS_READY: "survivors-ready";
    readonly ALARM_ACTIVE: "alarm-active";
    readonly ALARM_SILENCED: "alarm-silenced";
    readonly DOCKING_STATE: "docking-state";
    readonly DOCKING_BRAKED: "docking-braked";
    readonly DOCKING_CHECKED_PRESSURE: "docking-checked-pressure";
    readonly DOCKING_CONTROLS_EXAMINED: "docking-controls-examined";
    readonly BAD_SEAL_WARNING_COUNT: "bad-seal-warning-count";
    readonly PLAYER_BOARDED: "player-boarded";
    readonly BOARDING_TURN: "boarding-turn";
    readonly COLLISION_FUSE_START: "collision-fuse-start";
    readonly SEAL_DEATH_ARMED: "seal-death-armed";
};
/**
 * Tags scenery entities with a prop ID for interceptor/action lookup.
 */
export declare class ShipPropTrait implements ITrait {
    static readonly type: "story.shipProp";
    readonly type: "story.shipProp";
    propId: string;
    constructor(propId: string);
}
export declare function getPropId(entity: IFEntity): string | undefined;
/**
 * Marks a terminal entity that SOMS can speak through.
 */
export declare class TerminalTrait implements ITrait {
    static readonly type: "story.terminal";
    readonly type: "story.terminal";
    terminalId: string;
    isActive: boolean;
    constructor(terminalId: string, isActive?: boolean);
}
/**
 * Marks an entity as a hazardous area or object.
 */
export declare class HazardTrait implements ITrait {
    static readonly type: "story.hazard";
    readonly type: "story.hazard";
    hazardType: 'radiation' | 'pathogen' | 'vacuum';
    severity: number;
    constructor(hazardType: 'radiation' | 'pathogen' | 'vacuum', severity?: number);
}
/**
 * First-interaction flavor text. Fires once per entity on specified trigger action.
 */
export declare class MemoryTrait implements ITrait {
    static readonly type: "story.memory";
    readonly type: "story.memory";
    trigger: string;
    messageId: string;
    recalled: boolean;
    constructor(trigger: string, messageId: string);
}
export declare function getMemory(entity: IFEntity): MemoryTrait | undefined;
export declare function defineAction(id: string, group: string, phases: {
    validate: (ctx: ActionContext) => ValidationResult;
    execute?: (ctx: ActionContext) => void;
    report: (ctx: ActionContext) => ISemanticEvent[];
    blocked: (ctx: ActionContext, result: ValidationResult) => ISemanticEvent[];
}): Action;
export declare function standardBlocked(ctx: ActionContext, result: ValidationResult): ISemanticEvent[];
export declare function gameMessage(ctx: ActionContext, messageId: string, params?: Record<string, any>): ISemanticEvent;
