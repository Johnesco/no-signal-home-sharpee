/**
 * No Signal Home — World Creation
 *
 * Factory functions for rooms, items, and scenery across 3 decks / 25 rooms.
 */
import { WorldModel } from '@sharpee/world-model';
import { RoomIds, ItemIds } from './types';
export declare function getSceneryId(propId: string): string;
export declare function createRooms(world: WorldModel): RoomIds;
export declare function createItems(world: WorldModel, rooms: RoomIds): ItemIds;
export declare function createScenery(world: WorldModel, rooms: RoomIds, items: ItemIds): void;
