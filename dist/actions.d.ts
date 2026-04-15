/**
 * No Signal Home — Custom Actions
 *
 * Story-specific actions following the 4-phase pattern.
 */
import { WorldModel } from '@sharpee/world-model';
import { Action } from '@sharpee/stdlib';
import { RoomIds, ItemIds, NpcIds } from './types';
export declare function pryOpenDesk(world: WorldModel, items: ItemIds): string;
export declare function revealDataChip(world: WorldModel, items: ItemIds): string;
export declare function getCustomActions(rooms: RoomIds, items: ItemIds, npcs: NpcIds): Action[];
