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

// ============================================================================
// TYPED ID INTERFACES
// ============================================================================

export interface RoomIds {
  // Lower Deck (13)
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
  // Mid Deck (7)
  centralJunction: string;
  labCorridor: string;
  scienceLab: string;
  medbay: string;
  habCorridor: string;
  messHall: string;
  library: string;
  // Upper Deck (5)
  upperCorridor: string;
  crewBunks: string;
  commonArea: string;
  captainsCabin: string;
  bridge: string;
}

export interface ItemIds {
  // Portable items
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
  // Doors & containers
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

// ============================================================================
// STORY CONFIGURATION
// ============================================================================

export const config: StoryConfig = {
  id: 'no-signal-home',
  title: 'No Signal Home',
  author: 'John Googol',
  version: '1.0.0',
  description:
    'A sci-fi salvage horror text adventure on a derelict corporate freighter. You are a stowaway convict trapped aboard The Stillwater as it wakes from the dead.',
};

// ============================================================================
// MESSAGE IDS
// ============================================================================

export const Msg = {
  // --- Movement & exploration ---
  TUG_DETACHED: 'story.tug.detached',
  TUG_INACCESSIBLE: 'story.tug.inaccessible',
  DARK_ROOM: 'story.dark.room',
  DARK_MOVE: 'story.dark.move',
  RADIATION_WARNING: 'story.radiation.warning',
  RADIATION_DAMAGE: 'story.radiation.damage',
  ELEVATOR_BROKEN: 'story.elevator.broken',
  ELEVATOR_FIXED: 'story.elevator.fixed',
  BRIDGE_LOCKED: 'story.bridge.locked',
  BRIDGE_UNLOCKED: 'story.bridge.unlocked',
  CARGO_HOLD_LOCKED: 'story.cargo_hold.locked',

  // --- Items ---
  FLASHLIGHT_DIM: 'story.flashlight.dim',
  FLASHLIGHT_DEAD: 'story.flashlight.dead',
  KEYCARD_FOUND: 'story.keycard.found',
  JOURNAL_READ: 'story.journal.read',
  DATA_CHIP_FOUND: 'story.data_chip.found',
  OVERRIDE_TOOL_FOUND: 'story.override_tool.found',
  HAZMAT_WORN: 'story.hazmat.worn',

  // --- Puzzles ---
  DESK_LOCKED: 'story.desk.locked',
  DESK_PRIED: 'story.desk.pried',
  DESK_HACKED: 'story.desk.hacked',
  CARGO_CODE_ENTER: 'story.cargo_code.enter',
  CARGO_CODE_WRONG: 'story.cargo_code.wrong',
  CARGO_CODE_RIGHT: 'story.cargo_code.right',
  CARGO_CODE_HALF: 'story.cargo_code.half',
  ELEVATOR_REPAIR_NEED: 'story.elevator.repair_need',
  ELEVATOR_REPAIR_DONE: 'story.elevator.repair_done',
  COMMS_CONNECT: 'story.comms.connect',
  COMMS_REFUSE: 'story.comms.refuse',
  CABLE_CUT: 'story.cable.cut',
  CABLE_WRONG: 'story.cable.wrong',
  HACK_BRIDGE: 'story.hack.bridge',
  REACTOR_OVERLOAD: 'story.reactor.overload',
  REACTOR_SHUTDOWN: 'story.reactor.shutdown',
  SECURITY_OVERRIDE: 'story.security.override',

  // --- NPC: Reed ---
  REED_GREET: 'story.reed.greet',
  REED_SHIP: 'story.reed.ship',
  REED_CARGO: 'story.reed.cargo',
  REED_ELEVATOR: 'story.reed.elevator',
  REED_CREW: 'story.reed.crew',
  REED_SELF: 'story.reed.self',
  REED_GLITCH: 'story.reed.glitch',
  REED_LUCID: 'story.reed.lucid',
  REED_TURNED: 'story.reed.turned',
  REED_HELP_ELEVATOR: 'story.reed.help_elevator',

  // --- NPC: Vasik ---
  VASIK_GREET: 'story.vasik.greet',
  VASIK_BARRICADE: 'story.vasik.barricade',
  VASIK_TRADE: 'story.vasik.trade',
  VASIK_CARGO: 'story.vasik.cargo',
  VASIK_COMPANY: 'story.vasik.company',
  VASIK_CODE_HALF: 'story.vasik.code_half',
  VASIK_OVERRIDE: 'story.vasik.override',
  VASIK_DESPERATE: 'story.vasik.desperate',

  // --- NPC: Okafor ---
  OKAFOR_GREET: 'story.okafor.greet',
  OKAFOR_TERRITORY: 'story.okafor.territory',
  OKAFOR_PRISONERS: 'story.okafor.prisoners',
  OKAFOR_CODE_HALF: 'story.okafor.code_half',
  OKAFOR_ESCAPE: 'story.okafor.escape',
  OKAFOR_SELF: 'story.okafor.self',
  OKAFOR_TRUST: 'story.okafor.trust',

  // --- NPC: Lis ---
  LIS_APPEAR: 'story.lis.appear',
  LIS_SELF: 'story.lis.self',
  LIS_PUPPET: 'story.lis.puppet',
  LIS_HELP: 'story.lis.help',
  LIS_SWITCH: 'story.lis.switch',

  // --- SOMS (AI) ---
  SOMS_GREET: 'story.soms.greet',
  SOMS_SHIP: 'story.soms.ship',
  SOMS_CARGO: 'story.soms.cargo',
  SOMS_PATHOGEN: 'story.soms.pathogen',
  SOMS_COMMS_REQUEST: 'story.soms.comms_request',
  SOMS_HOSTILE: 'story.soms.hostile',
  SOMS_FRAGMENT: 'story.soms.fragment',
  SOMS_CONFLICTED: 'story.soms.conflicted',
  SOMS_LOCK_DOOR: 'story.soms.lock_door',
  SOMS_ATMOSPHERE: 'story.soms.atmosphere',

  // --- Terminals ---
  TERMINAL_USE: 'story.terminal.use',
  TERMINAL_QUERY: 'story.terminal.query',
  TERMINAL_CORRUPTED: 'story.terminal.corrupted',
  TERMINAL_LOCKED: 'story.terminal.locked',

  // --- ASK ABOUT patterns ---
  ASK_ABOUT_NOTHING: 'story.ask.nothing',
  ASK_ABOUT_DEFAULT: 'story.ask.default',

  // --- Pathogen ---
  PATHOGEN_EXPOSURE: 'story.pathogen.exposure',
  PATHOGEN_SYMPTOMS: 'story.pathogen.symptoms',
  PATHOGEN_TREATED: 'story.pathogen.treated',

  // --- Endings ---
  ENDING_ESCAPE_ALONE: 'story.ending.escape_alone',
  ENDING_ESCAPE_SURVIVORS: 'story.ending.escape_survivors',
  ENDING_DESTROY: 'story.ending.destroy',
  ENDING_OVERRIDE: 'story.ending.override',
  ENDING_MERGE: 'story.ending.merge',

  // --- Atmosphere / timed ---
  SHIP_CREAK: 'story.atmosphere.creak',
  REACTOR_WARMING: 'story.reactor.warming',
  CONTAINMENT_FAILING: 'story.containment.failing',
  AI_SPREADING: 'story.ai.spreading',
  DESTINATION_WARNING: 'story.destination.warning',

  // --- Meta ---
  HELP: 'story.help',
  ABOUT: 'story.about',
  EXAMINE_SELF: 'story.examine_self',
  NOTHING_HAPPENS: 'story.nothing_happens',
  CANT_GO: 'story.cant_go',
  VICTORY: 'story.victory',
  DEATH: 'story.death',
} as const;

// ============================================================================
// SCORE CONSTANTS
// ============================================================================

export const ScoreIds = {
  EXPLORE_SHIP: 'story.score.explore_ship',
  FIND_FLASHLIGHT: 'story.score.flashlight',
  MEET_REED: 'story.score.meet_reed',
  MEET_VASIK: 'story.score.meet_vasik',
  MEET_OKAFOR: 'story.score.meet_okafor',
  FIND_KEYCARD: 'story.score.keycard',
  OPEN_BRIDGE: 'story.score.open_bridge',
  FIND_JOURNAL: 'story.score.journal',
  FIND_DATA_CHIP: 'story.score.data_chip',
  FIX_ELEVATOR: 'story.score.fix_elevator',
  OPEN_CARGO_HOLD: 'story.score.open_cargo_hold',
  DISCOVER_PATHOGEN: 'story.score.discover_pathogen',
  REACH_CRYO: 'story.score.reach_cryo',
  COMMS_DECISION: 'story.score.comms_decision',
  FIND_OVERRIDE: 'story.score.find_override',
  VASIK_TRADE: 'story.score.vasik_trade',
  OKAFOR_TRUST: 'story.score.okafor_trust',
  ENDING_ACHIEVED: 'story.score.ending',
} as const;

export const MAX_SCORE = 100;

// ============================================================================
// GAME STATE KEYS
// ============================================================================

export const StateKeys = {
  TUG_DETACHED: 'tug-detached',
  PAINTING_MOVED: 'painting-moved',
  ELEVATOR_FIXED: 'elevator-fixed',
  BRIDGE_UNLOCKED: 'bridge-unlocked',
  CARGO_HOLD_OPEN: 'cargo-hold-open',
  COMMS_CONNECTED: 'comms-connected',
  COMMS_REFUSED: 'comms-refused',
  REACTOR_STAGE: 'reactor-stage',
  AI_STAGE: 'ai-stage',
  REED_STAGE: 'reed-stage',
  VASIK_STAGE: 'vasik-stage',
  OKAFOR_STAGE: 'okafor-stage',
  LIS_STAGE: 'lis-stage',
  PATHOGEN_LEVEL: 'pathogen-level',
  PLAYER_INFECTED: 'player-infected',
  PLAYER_TREATED: 'player-treated',
  HAZMAT_WEARING: 'hazmat-wearing',
  CARGO_CODE_VASIK: 'cargo-code-vasik',
  CARGO_CODE_OKAFOR: 'cargo-code-okafor',
  OVERRIDE_GIVEN: 'override-given',
  CABLE_CUT: 'cable-cut',
  AI_OVERRIDE: 'ai-override',
  GAME_ENDED: 'game-ended',
  MET_REED: 'met-reed',
  MET_VASIK: 'met-vasik',
  MET_OKAFOR: 'met-okafor',
  MET_LIS: 'met-lis',
  EMPATHY_SCORE: 'empathy-score',
  DESK_OPENED: 'desk-opened',
  TURN_COUNT: 'turn-count',
  SURVIVORS_READY: 'survivors-ready',
} as const;

// ============================================================================
// CUSTOM TRAITS
// ============================================================================

/**
 * Tags scenery entities with a prop ID for interceptor/action lookup.
 */
export class ShipPropTrait implements ITrait {
  static readonly type = 'story.shipProp' as const;
  readonly type = ShipPropTrait.type;
  propId: string;
  constructor(propId: string) {
    this.propId = propId;
  }
}

export function getPropId(entity: IFEntity): string | undefined {
  return (entity.get(ShipPropTrait.type) as ShipPropTrait | undefined)?.propId;
}

/**
 * Marks a terminal entity that SOMS can speak through.
 */
export class TerminalTrait implements ITrait {
  static readonly type = 'story.terminal' as const;
  readonly type = TerminalTrait.type;
  terminalId: string;
  isActive: boolean;
  constructor(terminalId: string, isActive = false) {
    this.terminalId = terminalId;
    this.isActive = isActive;
  }
}

/**
 * Marks an entity as a hazardous area or object.
 */
export class HazardTrait implements ITrait {
  static readonly type = 'story.hazard' as const;
  readonly type = HazardTrait.type;
  hazardType: 'radiation' | 'pathogen' | 'vacuum';
  severity: number;
  constructor(hazardType: 'radiation' | 'pathogen' | 'vacuum', severity = 1) {
    this.hazardType = hazardType;
    this.severity = severity;
  }
}

// ============================================================================
// ACTION HELPERS
// ============================================================================

export function defineAction(
  id: string,
  group: string,
  phases: {
    validate: (ctx: ActionContext) => ValidationResult;
    execute?: (ctx: ActionContext) => void;
    report: (ctx: ActionContext) => ISemanticEvent[];
    blocked: (ctx: ActionContext, result: ValidationResult) => ISemanticEvent[];
  },
): Action {
  return {
    id,
    group,
    validate: phases.validate,
    execute: phases.execute || (() => {}),
    report: phases.report,
    blocked: phases.blocked,
  };
}

export function standardBlocked(ctx: ActionContext, result: ValidationResult): ISemanticEvent[] {
  return [ctx.event('action.blocked', {
    messageId: result.error || Msg.NOTHING_HAPPENS,
    params: result.params || {},
  })];
}

export function gameMessage(ctx: ActionContext, messageId: string, params?: Record<string, any>): ISemanticEvent {
  return ctx.event('action.success', { messageId, params: params || {} });
}
