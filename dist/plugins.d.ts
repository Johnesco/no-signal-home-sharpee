/**
 * No Signal Home — Turn Plugins & Scheduler Events
 *
 * Timed events, dynamic descriptions, NPC state progression, win checks.
 */
import type { TurnPlugin } from '@sharpee/plugins';
import { ItemIds, NpcIds, RoomIds } from './types';
export declare function createPlugins(items: ItemIds, npcs: NpcIds, rooms: RoomIds): TurnPlugin[];
