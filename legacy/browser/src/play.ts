/**
 * Play — Interactive terminal REPL for No Signal Home.
 *
 * Usage: npm run build && node dist/play.js
 */

import * as readline from 'readline';
import { GameEngine } from '@sharpee/engine';
import { WorldModel, EntityType } from '@sharpee/world-model';
import { renderToString } from '@sharpee/text-service';
import { PerceptionService } from '@sharpee/stdlib';
import { EnglishParser } from '@sharpee/parser-en-us';
import { EnglishLanguageProvider } from '@sharpee/lang-en-us';
import { story } from './index';

async function main(): Promise<void> {
  const world = new WorldModel();
  const player = world.createEntity('player', EntityType.ACTOR);
  world.setPlayer(player.id);

  const language = new EnglishLanguageProvider();
  const parser = new EnglishParser(language);

  if (story.extendParser) story.extendParser(parser);
  if (story.extendLanguage) story.extendLanguage(language);

  const perceptionService = new PerceptionService();

  const engine = new GameEngine({ world, player, parser, language, perceptionService });
  engine.setStory(story);
  engine.start();

  let lastOutput = '';
  engine.on('text:output', (blocks: any) => {
    lastOutput = renderToString(blocks);
  });

  await engine.executeTurn('look');
  console.log(lastOutput);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const prompt = (): void => {
    rl.question('\n> ', async (input) => {
      const trimmed = input.trim();
      if (trimmed === '/quit' || trimmed === '/q') {
        rl.close();
        process.exit(0);
        return;
      }
      if (!trimmed) { prompt(); return; }

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
