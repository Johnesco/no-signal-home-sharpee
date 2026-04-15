/**
 * No Signal Home — NPC Creation & Behaviors
 *
 * Four NPCs (Reed, Vasik, Okafor, Lis) and the SOMS AI entity.
 */
import { WorldModel } from '@sharpee/world-model';
import type { NpcBehavior } from '@sharpee/stdlib';
import { RoomIds, NpcIds } from './types';
export declare function createNpcs(world: WorldModel, rooms: RoomIds): NpcIds;
export declare const reedBehavior: NpcBehavior;
export declare const vasikBehavior: NpcBehavior;
export declare const okaforBehavior: NpcBehavior;
export declare const lisBehavior: NpcBehavior;
export declare function getAllBehaviors(): NpcBehavior[];
