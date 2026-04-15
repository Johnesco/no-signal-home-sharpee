"use strict";
/**
 * Play — Interactive terminal REPL for No Signal Home.
 *
 * Usage: npm run build && node dist/play.js
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const engine_1 = require("@sharpee/engine");
const world_model_1 = require("@sharpee/world-model");
const text_service_1 = require("@sharpee/text-service");
const stdlib_1 = require("@sharpee/stdlib");
const parser_en_us_1 = require("@sharpee/parser-en-us");
const lang_en_us_1 = require("@sharpee/lang-en-us");
const index_1 = require("./index");
async function main() {
    const world = new world_model_1.WorldModel();
    const player = world.createEntity('player', world_model_1.EntityType.ACTOR);
    world.setPlayer(player.id);
    const language = new lang_en_us_1.EnglishLanguageProvider();
    const parser = new parser_en_us_1.EnglishParser(language);
    if (index_1.story.extendParser)
        index_1.story.extendParser(parser);
    if (index_1.story.extendLanguage)
        index_1.story.extendLanguage(language);
    const perceptionService = new stdlib_1.PerceptionService();
    const engine = new engine_1.GameEngine({ world, player, parser, language, perceptionService });
    engine.setStory(index_1.story);
    engine.start();
    let lastOutput = '';
    engine.on('text:output', (blocks) => {
        lastOutput = (0, text_service_1.renderToString)(blocks);
    });
    await engine.executeTurn('look');
    console.log(lastOutput);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const prompt = () => {
        rl.question('\n> ', async (input) => {
            const trimmed = input.trim();
            if (trimmed === '/quit' || trimmed === '/q') {
                rl.close();
                process.exit(0);
                return;
            }
            if (!trimmed) {
                prompt();
                return;
            }
            await engine.executeTurn(trimmed);
            console.log(lastOutput);
            prompt();
        });
    };
    prompt();
}
main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
//# sourceMappingURL=play.js.map