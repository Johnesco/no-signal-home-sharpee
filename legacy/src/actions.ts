/**
 * No Signal Home — Custom Actions
 *
 * Story-specific actions following the 4-phase pattern.
 */

import {
  WorldModel,
  IFEntity,
  OpenableTrait,
  LockableTrait,
  IdentityTrait,
} from '@sharpee/world-model';
import { Action, ActionContext, ValidationResult } from '@sharpee/stdlib';
import type { ISemanticEvent } from '@sharpee/core';
import {
  RoomIds, ItemIds, NpcIds, Msg, StateKeys, ScoreIds,
  defineAction, standardBlocked, gameMessage, getPropId,
  TerminalTrait, ShipPropTrait,
} from './types';
import { getSceneryId } from './world';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function pryOpenDesk(world: WorldModel, items: ItemIds): string {
  if (world.getStateValue(StateKeys.DESK_OPENED)) return Msg.NOTHING_HAPPENS;
  const desk = world.getEntity(items.captainsDesk);
  if (!desk) return Msg.NOTHING_HAPPENS;
  const lock = desk.get(LockableTrait);
  const open = desk.get(OpenableTrait);
  if (lock) lock.isLocked = false;
  if (open) open.isOpen = true;
  world.setStateValue(StateKeys.DESK_OPENED, true);
  world.awardScore(ScoreIds.FIND_KEYCARD, 5, 'Finding the bridge keycard');
  return Msg.DESK_PRIED;
}

export function revealDataChip(world: WorldModel, items: ItemIds): string {
  const chip = world.getEntity(items.dataChip);
  if (!chip) return Msg.NOTHING_HAPPENS;
  const id = chip.get(IdentityTrait);
  if (id && id.concealed) {
    id.concealed = false;
    world.awardScore(ScoreIds.FIND_DATA_CHIP, 5, 'Finding the hidden data chip');
    return Msg.DATA_CHIP_FOUND;
  }
  return Msg.NOTHING_HAPPENS;
}

// Helper to extract text from parsed textSlots
function getTextSlot(ctx: ActionContext): string {
  const textSlots = (ctx.command as any)?.parsed?.textSlots as Map<string, string> | undefined;
  if (textSlots && textSlots.size > 0) {
    return Array.from(textSlots.values()).join(' ').toLowerCase();
  }
  return '';
}

// ============================================================================
// CUSTOM ACTIONS
// ============================================================================

export function getCustomActions(rooms: RoomIds, items: ItemIds, npcs: NpcIds): Action[] {
  return [
    // --- PRY / FORCE OPEN ---
    defineAction('story.action.prying', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        const target = ctx.command.directObject?.entity;
        if (!target) return { valid: false, error: Msg.NOTHING_HAPPENS };
        const propId = getPropId(target);
        const toolLoc = ctx.world.getLocation(items.multitool);
        if (toolLoc !== ctx.player.id) {
          return { valid: false, error: 'story.pry.need_tool' };
        }
        if (propId === 'captains-desk') {
          if (ctx.world.getStateValue(StateKeys.DESK_OPENED)) {
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
      execute(ctx: ActionContext): void {
        if (ctx.sharedData.target === 'desk') {
          pryOpenDesk(ctx.world, items);
        }
        if (ctx.sharedData.target === 'crate') {
          const crate = ctx.world.getEntity(items.weaponsCrate);
          if (crate) {
            const lock = crate.get(LockableTrait);
            const open = crate.get(OpenableTrait);
            if (lock) lock.isLocked = false;
            if (open) open.isOpen = true;
          }
        }
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        if (ctx.sharedData.target === 'desk') return [gameMessage(ctx, Msg.DESK_PRIED)];
        return [gameMessage(ctx, 'story.pry.crate_open')];
      },
      blocked: standardBlocked,
    }),

    // --- REPAIR ELEVATOR ---
    defineAction('story.action.repairing', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        const target = ctx.command.directObject?.entity;
        if (!target) return { valid: false, error: Msg.NOTHING_HAPPENS };
        const propId = getPropId(target);
        if (propId !== 'elevator') return { valid: false, error: 'story.repair.cant' };
        if (ctx.world.getStateValue(StateKeys.ELEVATOR_FIXED)) {
          return { valid: false, error: 'story.repair.already' };
        }
        const partsLoc = ctx.world.getLocation(items.elevatorParts);
        if (partsLoc !== ctx.player.id) {
          return { valid: false, error: Msg.ELEVATOR_REPAIR_NEED };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue(StateKeys.ELEVATOR_FIXED, true);
        ctx.world.awardScore(ScoreIds.FIX_ELEVATOR, 5, 'Repairing the elevator');
        ctx.world.connectRooms(rooms.lowerMidCorridor, rooms.cryoBay, 'east' as any);
        ctx.world.removeEntity(items.elevatorParts);
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, Msg.ELEVATOR_REPAIR_DONE)];
      },
      blocked: standardBlocked,
    }),

    // --- ENTER CODE (cargo hold) ---
    defineAction('story.action.entering-code', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        const playerLoc = ctx.world.getLocation(ctx.player.id);
        if (playerLoc !== rooms.cargoBay) {
          return { valid: false, error: Msg.NOTHING_HAPPENS };
        }
        if (ctx.world.getStateValue(StateKeys.CARGO_HOLD_OPEN)) {
          return { valid: false, error: 'story.cargo.already_open' };
        }
        const hasVasik = ctx.world.getStateValue(StateKeys.CARGO_CODE_VASIK);
        const hasOkafor = ctx.world.getStateValue(StateKeys.CARGO_CODE_OKAFOR);
        if (!hasVasik || !hasOkafor) {
          return { valid: false, error: Msg.CARGO_CODE_HALF };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue(StateKeys.CARGO_HOLD_OPEN, true);
        const door = ctx.world.getEntity(items.cargoHoldDoor);
        if (door) {
          const lock = door.get(LockableTrait);
          const open = door.get(OpenableTrait);
          if (lock) lock.isLocked = false;
          if (open) open.isOpen = true;
        }
        ctx.world.awardScore(ScoreIds.OPEN_CARGO_HOLD, 10, 'Opening the cargo hold');
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, Msg.CARGO_CODE_RIGHT)];
      },
      blocked: standardBlocked,
    }),

    // --- CONNECT COMMS ---
    defineAction('story.action.connecting-comms', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        const target = ctx.command.directObject?.entity;
        if (!target) return { valid: false, error: Msg.NOTHING_HAPPENS };
        const propId = getPropId(target);
        if (propId !== 'comms-relay' && propId !== 'comms-panel') {
          return { valid: false, error: Msg.NOTHING_HAPPENS };
        }
        const playerLoc = ctx.world.getLocation(ctx.player.id);
        if (playerLoc !== rooms.engineering && playerLoc !== rooms.bridge) {
          return { valid: false, error: Msg.NOTHING_HAPPENS };
        }
        if (ctx.world.getStateValue(StateKeys.COMMS_CONNECTED)) {
          return { valid: false, error: 'story.comms.already' };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue(StateKeys.COMMS_CONNECTED, true);
        ctx.world.awardScore(ScoreIds.COMMS_DECISION, 5, 'Connecting the comms relay');
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, Msg.COMMS_CONNECT)];
      },
      blocked: standardBlocked,
    }),

    // --- CUT CABLES (AI override path A) ---
    defineAction('story.action.cutting', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        const target = ctx.command.directObject?.entity;
        if (!target) return { valid: false, error: Msg.NOTHING_HAPPENS };
        const propId = getPropId(target);
        if (propId !== 'ai-cables' && propId !== 'junction-box') {
          return { valid: false, error: 'story.cut.cant' };
        }
        const snipsLoc = ctx.world.getLocation(items.cableSnips);
        if (snipsLoc !== ctx.player.id) {
          return { valid: false, error: 'story.cut.need_tool' };
        }
        if (ctx.world.getStateValue(StateKeys.CABLE_CUT)) {
          return { valid: false, error: 'story.cut.already' };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue(StateKeys.CABLE_CUT, true);
        ctx.world.setStateValue(StateKeys.AI_OVERRIDE, true);
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, Msg.CABLE_CUT)];
      },
      blocked: standardBlocked,
    }),

    // --- USE SECURITY OVERRIDE PANEL ---
    defineAction('story.action.overriding', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        let target = ctx.command.directObject?.entity;
        // Fixed-phrase grammar patterns won't resolve a target —
        // fall back to finding the security panel in the current room
        if (!target) {
          const panelId = getSceneryId('security-panel');
          if (panelId) {
            const panel = ctx.world.getEntity(panelId);
            if (panel) {
              const loc = ctx.world.getLocation(panel.id);
              const playerLoc = ctx.world.getLocation(ctx.player.id);
              if (loc === playerLoc) target = panel;
            }
          }
        }
        if (!target) return { valid: false, error: Msg.NOTHING_HAPPENS };
        const propId = getPropId(target);
        if (propId !== 'security-panel') {
          return { valid: false, error: Msg.NOTHING_HAPPENS };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue(StateKeys.BRIDGE_UNLOCKED, true);
        const bridgeDoor = ctx.world.getEntity(items.bridgeDoor);
        if (bridgeDoor) {
          const lock = bridgeDoor.get(LockableTrait);
          const open = bridgeDoor.get(OpenableTrait);
          if (lock) lock.isLocked = false;
          if (open) open.isOpen = true;
        }
        // If AI is already disabled, this triggers the Override ending
        if (ctx.world.getStateValue(StateKeys.AI_OVERRIDE) || ctx.world.getStateValue(StateKeys.CABLE_CUT)) {
          ctx.world.setStateValue(StateKeys.GAME_ENDED, true);
          ctx.world.awardScore(ScoreIds.ENDING_ACHIEVED, 10, 'Reaching an ending');
        }
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        if (ctx.world.getStateValue(StateKeys.AI_OVERRIDE) || ctx.world.getStateValue(StateKeys.CABLE_CUT)) {
          return [
            gameMessage(ctx, Msg.ENDING_OVERRIDE),
            ctx.event('game.ended', { reason: 'victory' }),
          ];
        }
        return [gameMessage(ctx, Msg.SECURITY_OVERRIDE)];
      },
      blocked: standardBlocked,
    }),

    // --- REACTOR OVERLOAD (destroy ending) ---
    defineAction('story.action.overloading', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        const playerLoc = ctx.world.getLocation(ctx.player.id);
        if (playerLoc !== rooms.reactorRoom) {
          return { valid: false, error: 'story.overload.not_here' };
        }
        if (!ctx.world.getStateValue(StateKeys.AI_OVERRIDE) && !ctx.world.getStateValue(StateKeys.CABLE_CUT)) {
          return { valid: false, error: 'story.overload.ai_blocks' };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue('reactor-overloading', true);
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, Msg.REACTOR_OVERLOAD)];
      },
      blocked: standardBlocked,
    }),

    // --- LAUNCH ESCAPE POD ---
    defineAction('story.action.launching', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        let target = ctx.command.directObject?.entity;
        // Fixed-phrase grammar ("launch pod", "escape") won't have a directObject —
        // fall back to finding the escape pod scenery in the current room
        if (!target) {
          const podEntityId = getSceneryId('escape-pod');
          if (podEntityId) {
            const podEntity = ctx.world.getEntity(podEntityId);
            if (podEntity) {
              const loc = ctx.world.getLocation(podEntity.id);
              const playerLoc = ctx.world.getLocation(ctx.player.id);
              if (loc === playerLoc) target = podEntity;
            }
          }
        }
        if (!target) return { valid: false, error: Msg.NOTHING_HAPPENS };
        const propId = getPropId(target);
        if (propId !== 'escape-pod') {
          return { valid: false, error: Msg.NOTHING_HAPPENS };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue(StateKeys.GAME_ENDED, true);
        ctx.world.awardScore(ScoreIds.ENDING_ACHIEVED, 10, 'Reaching an ending');
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        // Pick ending based on game state
        let endingMsg: string = Msg.ENDING_ESCAPE_ALONE;
        if (ctx.world.getStateValue('reactor-overloading')) {
          endingMsg = Msg.ENDING_DESTROY;
        } else if (ctx.world.getStateValue(StateKeys.SURVIVORS_READY)) {
          endingMsg = Msg.ENDING_ESCAPE_SURVIVORS;
        }
        return [
          gameMessage(ctx, endingMsg),
          ctx.event('game.ended', { reason: 'victory' }),
        ];
      },
      blocked: standardBlocked,
    }),

    // --- ASK NPC ABOUT (topic system) ---
    defineAction('story.action.asking-about', 'communication', {
      validate(ctx: ActionContext): ValidationResult {
        const target = ctx.command.directObject?.entity;
        if (!target) return { valid: false, error: Msg.ASK_ABOUT_NOTHING };
        const targetId = target.id;
        const topic = getTextSlot(ctx);
        ctx.sharedData.targetId = targetId;
        ctx.sharedData.topic = topic;

        if (targetId !== npcs.reed && targetId !== npcs.vasik &&
            targetId !== npcs.okafor && targetId !== npcs.lis) {
          return { valid: false, error: Msg.ASK_ABOUT_DEFAULT };
        }
        if (!topic) return { valid: false, error: Msg.ASK_ABOUT_NOTHING };
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        const { targetId, topic } = ctx.sharedData;
        const world = ctx.world;
        let resultMsg: string = Msg.ASK_ABOUT_DEFAULT;

        // Reed topics
        if (targetId === npcs.reed) {
          const stage = world.getStateValue(StateKeys.REED_STAGE) ?? 1;
          if (stage >= 4) resultMsg = Msg.REED_TURNED;
          else if (stage === 3) resultMsg = Msg.REED_LUCID;
          else if (topic.includes('ship') || topic.includes('stillwater'))
            resultMsg = Msg.REED_SHIP;
          else if (topic.includes('cargo') || topic.includes('hold'))
            resultMsg = Msg.REED_CARGO;
          else if (topic.includes('elevator') || topic.includes('lift') || topic.includes('cryo'))
            resultMsg = Msg.REED_ELEVATOR;
          else if (topic.includes('crew') || topic.includes('people'))
            resultMsg = Msg.REED_CREW;
          else if (topic.includes('self') || topic.includes('yourself') || topic.includes('reed'))
            resultMsg = Msg.REED_SELF;
        }

        // Vasik topics
        else if (targetId === npcs.vasik) {
          if (topic.includes('cargo') || topic.includes('hold'))
            resultMsg = Msg.VASIK_CARGO;
          else if (topic.includes('company') || topic.includes('meridian'))
            resultMsg = Msg.VASIK_COMPANY;
          else if (topic.includes('code') || topic.includes('access')) {
            world.setStateValue(StateKeys.CARGO_CODE_VASIK, true);
            resultMsg = Msg.VASIK_CODE_HALF;
          }
          else if (topic.includes('override') || topic.includes('tool')) {
            if (world.getLocation(items.overrideTool) === ctx.player.id) {
              world.setStateValue(StateKeys.OVERRIDE_GIVEN, true);
              world.awardScore(ScoreIds.VASIK_TRADE, 5, 'Trading with Vasik');
              resultMsg = Msg.VASIK_TRADE;
            } else {
              resultMsg = Msg.VASIK_OVERRIDE;
            }
          }
        }

        // Okafor topics
        else if (targetId === npcs.okafor) {
          if (topic.includes('prisoner') || topic.includes('cryo') || topic.includes('people') || topic.includes('frozen'))
            resultMsg = Msg.OKAFOR_PRISONERS;
          else if (topic.includes('code') || topic.includes('access') || topic.includes('cargo')) {
            const trust = world.getStateValue(StateKeys.OKAFOR_STAGE) ?? 1;
            if (trust >= 2) {
              world.setStateValue(StateKeys.CARGO_CODE_OKAFOR, true);
              world.awardScore(ScoreIds.OKAFOR_TRUST, 5, 'Earning Okafor\'s trust');
              resultMsg = Msg.OKAFOR_CODE_HALF;
            } else {
              resultMsg = Msg.OKAFOR_TERRITORY;
            }
          }
          else if (topic.includes('escape') || topic.includes('leave') || topic.includes('pod'))
            resultMsg = Msg.OKAFOR_ESCAPE;
          else if (topic.includes('self') || topic.includes('yourself') || topic.includes('okafor'))
            resultMsg = Msg.OKAFOR_SELF;
        }

        // Lis topics
        else if (targetId === npcs.lis) {
          const stage = world.getStateValue(StateKeys.LIS_STAGE) ?? 0;
          if (stage >= 3) resultMsg = Msg.LIS_PUPPET;
          else if (topic.includes('self') || topic.includes('yourself') || topic.includes('lis'))
            resultMsg = Msg.LIS_SELF;
          else if (topic.includes('ai') || topic.includes('soms') || topic.includes('system'))
            resultMsg = Msg.LIS_HELP;
        }

        ctx.sharedData.resultMsg = resultMsg;
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, ctx.sharedData.resultMsg as string)];
      },
      blocked: standardBlocked,
    }),

    // --- QUERY TERMINAL / USE TERMINAL ---
    defineAction('story.action.querying', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        const target = ctx.command.directObject?.entity;
        if (!target) return { valid: false, error: Msg.NOTHING_HAPPENS };
        const terminal = target.get(TerminalTrait.type) as TerminalTrait | undefined;
        if (!terminal) return { valid: false, error: Msg.TERMINAL_USE };
        ctx.sharedData.query = getTextSlot(ctx);
        ctx.sharedData.terminalId = terminal.terminalId;
        return { valid: true };
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        const aiStage = ctx.world.getStateValue(StateKeys.AI_STAGE) ?? 1;
        const query = ctx.sharedData.query as string;

        if (query.includes('ship') || query.includes('stillwater'))
          return [gameMessage(ctx, Msg.SOMS_SHIP)];
        if (query.includes('cargo') || query.includes('manifest'))
          return [gameMessage(ctx, Msg.SOMS_CARGO)];
        if (query.includes('pathogen') || query.includes('infection') || query.includes('disease'))
          return [gameMessage(ctx, Msg.SOMS_PATHOGEN)];
        if (query.includes('comms') || query.includes('relay') || query.includes('transmit')) {
          if (aiStage >= 2) return [gameMessage(ctx, Msg.SOMS_HOSTILE)];
          return [gameMessage(ctx, Msg.SOMS_COMMS_REQUEST)];
        }
        return [gameMessage(ctx, Msg.TERMINAL_QUERY)];
      },
      blocked: standardBlocked,
    }),

    // --- SEARCH (find hidden items) ---
    defineAction('story.action.searching', 'interaction', {
      validate(ctx: ActionContext): ValidationResult {
        const target = ctx.command.directObject?.entity;
        if (!target) return { valid: false, error: 'story.search.what' };
        ctx.sharedData.target = target;
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        const target = ctx.sharedData.target as IFEntity;
        const propId = getPropId(target);
        const playerLoc = ctx.world.getLocation(ctx.player.id);

        if (playerLoc === rooms.messHall && (
          target.name.includes('table') || target.name.includes('mess') ||
          propId === 'food-fabricator' || target.name.includes('mug'))) {
          ctx.sharedData.resultMsg = revealDataChip(ctx.world, items);
        } else {
          ctx.sharedData.resultMsg = 'story.search.nothing';
        }
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, ctx.sharedData.resultMsg as string)];
      },
      blocked: standardBlocked,
    }),

    // --- WEAR HAZMAT ---
    defineAction('story.action.wearing-hazmat', 'interaction', {
      validate(ctx: ActionContext): ValidationResult {
        const target = ctx.command.directObject?.entity;
        if (!target || target.id !== items.hazmatSuit) {
          return { valid: false, error: Msg.NOTHING_HAPPENS };
        }
        const loc = ctx.world.getLocation(items.hazmatSuit);
        if (loc !== ctx.player.id) {
          return { valid: false, error: 'story.hazmat.not_carrying' };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue(StateKeys.HAZMAT_WEARING, true);
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, Msg.HAZMAT_WORN)];
      },
      blocked: standardBlocked,
    }),

    // --- PRESS ALARM BUTTON ---
    defineAction('story.action.pressing', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        const target = ctx.command.directObject?.entity;
        // If no target, try to find the alarm button in current room
        let propId: string | undefined;
        if (target) {
          propId = getPropId(target);
        } else {
          const buttonId = getSceneryId('alarm-button');
          if (buttonId) {
            const button = ctx.world.getEntity(buttonId);
            if (button) {
              const loc = ctx.world.getLocation(button.id);
              const playerLoc = ctx.world.getLocation(ctx.player.id);
              if (loc === playerLoc) propId = 'alarm-button';
            }
          }
        }
        if (propId !== 'alarm-button') {
          return { valid: false, error: Msg.NOTHING_HAPPENS };
        }
        if (ctx.world.getStateValue(StateKeys.ALARM_SILENCED)) {
          return { valid: false, error: Msg.ALARM_ALREADY_OFF };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue(StateKeys.ALARM_SILENCED, true);
        ctx.world.setStateValue(StateKeys.ALARM_ACTIVE, false);
        // Start the post-alarm collision fuse
        const turn = ctx.world.getStateValue(StateKeys.TURN_COUNT) ?? 0;
        ctx.world.setStateValue(StateKeys.COLLISION_FUSE_START, turn);
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, Msg.ALARM_SILENCED)];
      },
      blocked: standardBlocked,
    }),

    // --- MANEUVER (docking step 2) ---
    defineAction('story.action.maneuvering', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        const playerLoc = ctx.world.getLocation(ctx.player.id);
        if (playerLoc !== rooms.tugCockpit) {
          return { valid: false, error: Msg.NOTHING_HAPPENS };
        }
        if (!ctx.world.getStateValue(StateKeys.DOCKING_CONTROLS_EXAMINED)) {
          return { valid: false, error: Msg.DOCK_NEED_EXAMINE };
        }
        const state = ctx.world.getStateValue(StateKeys.DOCKING_STATE);
        if (state !== 'approach') {
          return { valid: false, error: Msg.DOCK_ALREADY_DONE };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue(StateKeys.DOCKING_STATE, 'maneuvered');
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, Msg.DOCK_MANEUVER)];
      },
      blocked: standardBlocked,
    }),

    // --- BRAKE / DECELERATE (optional docking quality step) ---
    defineAction('story.action.braking', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        const playerLoc = ctx.world.getLocation(ctx.player.id);
        if (playerLoc !== rooms.tugCockpit) {
          return { valid: false, error: Msg.NOTHING_HAPPENS };
        }
        const state = ctx.world.getStateValue(StateKeys.DOCKING_STATE);
        if (state !== 'maneuvered') {
          if (state === 'approach') return { valid: false, error: Msg.DOCK_NOT_MANEUVERED };
          return { valid: false, error: Msg.DOCK_ALREADY_DONE };
        }
        if (ctx.world.getStateValue(StateKeys.DOCKING_BRAKED)) {
          return { valid: false, error: Msg.DOCK_ALREADY_DONE };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue(StateKeys.DOCKING_BRAKED, true);
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, Msg.DOCK_BRAKE)];
      },
      blocked: standardBlocked,
    }),

    // --- CONNECT / EXTEND ARM (docking step 4) ---
    defineAction('story.action.docking-connect', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        const playerLoc = ctx.world.getLocation(ctx.player.id);
        if (playerLoc !== rooms.tugCockpit) {
          return { valid: false, error: Msg.NOTHING_HAPPENS };
        }
        const state = ctx.world.getStateValue(StateKeys.DOCKING_STATE);
        if (state === 'approach') {
          return { valid: false, error: Msg.DOCK_NOT_MANEUVERED };
        }
        if (state !== 'maneuvered') {
          return { valid: false, error: Msg.DOCK_ALREADY_DONE };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue(StateKeys.DOCKING_STATE, 'connected');
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, Msg.DOCK_CONNECT)];
      },
      blocked: standardBlocked,
    }),

    // --- CHECK PRESSURE / CHECK SEAL (optional quality step) ---
    defineAction('story.action.checking-pressure', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        const playerLoc = ctx.world.getLocation(ctx.player.id);
        if (playerLoc !== rooms.tugCockpit) {
          return { valid: false, error: Msg.NOTHING_HAPPENS };
        }
        const state = ctx.world.getStateValue(StateKeys.DOCKING_STATE);
        if (state !== 'connected') {
          if (state === 'approach' || state === 'maneuvered') {
            return { valid: false, error: Msg.DOCK_NOT_CONNECTED };
          }
          return { valid: false, error: Msg.DOCK_ALREADY_DONE };
        }
        if (ctx.world.getStateValue(StateKeys.DOCKING_CHECKED_PRESSURE)) {
          return { valid: false, error: Msg.DOCK_ALREADY_DONE };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue(StateKeys.DOCKING_CHECKED_PRESSURE, true);
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, Msg.DOCK_CHECK_PRESSURE)];
      },
      blocked: standardBlocked,
    }),

    // --- SEAL / PRESSURIZE (docking step 6) ---
    defineAction('story.action.sealing', 'special', {
      validate(ctx: ActionContext): ValidationResult {
        const playerLoc = ctx.world.getLocation(ctx.player.id);
        if (playerLoc !== rooms.tugCockpit) {
          return { valid: false, error: Msg.NOTHING_HAPPENS };
        }
        const state = ctx.world.getStateValue(StateKeys.DOCKING_STATE);
        if (state !== 'connected') {
          if (state === 'approach' || state === 'maneuvered') {
            return { valid: false, error: Msg.DOCK_NOT_CONNECTED };
          }
          return { valid: false, error: Msg.DOCK_ALREADY_DONE };
        }
        return { valid: true };
      },
      execute(ctx: ActionContext): void {
        ctx.world.setStateValue(StateKeys.DOCKING_STATE, 'sealed');
        const checked = ctx.world.getStateValue(StateKeys.DOCKING_CHECKED_PRESSURE);
        if (checked) {
          // Good seal — unlock and open airlock door
          const door = ctx.world.getEntity(items.airlockDoor);
          if (door) {
            const lock = door.get(LockableTrait);
            const open = door.get(OpenableTrait);
            if (lock) lock.isLocked = false;
            if (open) open.isOpen = true;
          }
        } else {
          // Bad seal — door stays locked, update message
          const door = ctx.world.getEntity(items.airlockDoor);
          if (door) {
            const lock = door.get(LockableTrait);
            if (lock) {
              lock.lockedMessage = 'SEAL INTEGRITY CRITICAL. Atmosphere readings show hard vacuum beyond the seal. Going through would be suicide.';
            }
          }
        }
        ctx.sharedData.checkedPressure = checked;
      },
      report(ctx: ActionContext): ISemanticEvent[] {
        if (ctx.sharedData.checkedPressure) {
          return [gameMessage(ctx, Msg.DOCK_SEAL_GOOD)];
        }
        return [gameMessage(ctx, Msg.DOCK_SEAL_WARNING)];
      },
      blocked: standardBlocked,
    }),

    // --- HELP ---
    defineAction('story.action.help', 'meta', {
      validate(): ValidationResult { return { valid: true }; },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, Msg.HELP)];
      },
      blocked: standardBlocked,
    }),

    // --- ABOUT ---
    defineAction('story.action.about', 'meta', {
      validate(): ValidationResult { return { valid: true }; },
      report(ctx: ActionContext): ISemanticEvent[] {
        return [gameMessage(ctx, Msg.ABOUT)];
      },
      blocked: standardBlocked,
    }),
  ];
}
