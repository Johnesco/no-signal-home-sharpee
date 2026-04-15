/**
 * No Signal Home
 *
 * A sci-fi salvage horror text adventure on a derelict corporate freighter.
 * You are a stowaway convict trapped aboard The Stillwater as it wakes.
 *
 * Public interface: exports `story` singleton for engine consumption.
 */
import { Story } from '@sharpee/engine';
import type { GameEngine } from '@sharpee/engine';
import { WorldModel, IFEntity } from '@sharpee/world-model';
import type { Parser } from '@sharpee/parser-en-us';
import type { LanguageProvider } from '@sharpee/lang-en-us';
export { config } from './types';
export declare class NoSignalHomeStory implements Story {
    config: import("@sharpee/engine").StoryConfig;
    private rooms;
    private items;
    private npcs;
    createPlayer(world: WorldModel): IFEntity;
    initializeWorld(world: WorldModel): void;
    getCustomActions(): import("@sharpee/stdlib").Action[];
    extendParser(parser: Parser): void;
    extendLanguage(language: LanguageProvider): void;
    onEngineReady(engine: GameEngine): void;
}
export declare const story: NoSignalHomeStory;
export default story;
