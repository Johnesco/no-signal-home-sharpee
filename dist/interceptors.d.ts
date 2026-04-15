/**
 * No Signal Home — Action Interceptors
 *
 * Intercept stdlib actions to inject story-specific behavior.
 */
import type { ActionInterceptor } from '@sharpee/world-model';
import { ItemIds, RoomIds } from './types';
export declare function getInterceptors(items: ItemIds, rooms: RoomIds): {
    actionId: string;
    interceptor: ActionInterceptor;
}[];
