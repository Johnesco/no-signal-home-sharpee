/**
 * Browser Entry Point for No Signal Home
 */

import { GameEngine } from '@sharpee/engine';
import { WorldModel, EntityType } from '@sharpee/world-model';
import { Parser } from '@sharpee/parser-en-us';
import { LanguageProvider } from '@sharpee/lang-en-us';
import { PerceptionService } from '@sharpee/stdlib';
import { renderToString } from '@sharpee/text-service';
import { story, config } from './index.js';

let statusLocation: HTMLElement | null;
let statusScore: HTMLElement | null;
let textContent: HTMLElement | null;
let mainWindow: HTMLElement | null;
let commandInput: HTMLInputElement | null;

let engine: GameEngine;
let world: WorldModel;
let commandHistory: string[] = [];
let historyIndex = -1;
let currentTurn = 0;
let currentScore = 0;

function initializeGame(): void {
  world = new WorldModel();
  const player = world.createEntity('player', EntityType.ACTOR);
  world.setPlayer(player.id);

  const language = new LanguageProvider();
  const parser = new Parser(language);

  if (story.extendParser) story.extendParser(parser);
  if (story.extendLanguage) story.extendLanguage(language);

  const perceptionService = new PerceptionService();

  engine = new GameEngine({ world, player, parser, language, perceptionService });

  engine.on('text:output', (blocks: any, turn: number) => {
    displayText(renderToString(blocks));
    currentTurn = turn;
    updateStatusLine();
  });

  engine.on('event', (event: any) => {
    if (event.type === 'game.score_changed' && event.data) {
      currentScore = event.data.newScore ?? currentScore;
      updateStatusLine();
    }
  });

  engine.setStory(story);
}

function setupDOM(): void {
  statusLocation = document.getElementById('location-name');
  statusScore = document.getElementById('score-turns');
  textContent = document.getElementById('text-content');
  mainWindow = document.getElementById('main-window');
  commandInput = document.getElementById('command-input') as HTMLInputElement;

  if (!commandInput) return;

  commandInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleCommand();
    else if (e.key === 'ArrowUp') { e.preventDefault(); navigateHistory(-1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); navigateHistory(1); }
  });

  document.addEventListener('click', () => {
    if (commandInput && !commandInput.disabled) commandInput.focus();
  });
}

async function handleCommand(): Promise<void> {
  if (!commandInput) return;
  const command = commandInput.value.trim();
  if (!command) return;
  commandHistory.push(command);
  historyIndex = commandHistory.length;
  commandInput.value = '';
  displayCommand(command);
  try { await engine.executeTurn(command); }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    displayText(`[Error: ${message}]`);
  }
}

function navigateHistory(direction: number): void {
  if (!commandInput) return;
  const newIndex = historyIndex + direction;
  if (newIndex < 0) return;
  if (newIndex >= commandHistory.length) {
    historyIndex = commandHistory.length;
    commandInput.value = '';
    return;
  }
  historyIndex = newIndex;
  commandInput.value = commandHistory[historyIndex];
  commandInput.setSelectionRange(commandInput.value.length, commandInput.value.length);
}

function displayText(text: string): void {
  if (!textContent) return;
  const paragraphs = text.split(/\n\n+/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (trimmed) {
      const p = document.createElement('p');
      p.style.whiteSpace = 'pre-line';
      p.textContent = trimmed;
      textContent.appendChild(p);
    }
  }
  scrollToBottom();
}

function displayCommand(command: string): void {
  if (!textContent) return;
  const div = document.createElement('div');
  div.className = 'command-echo';
  div.textContent = `> ${command}`;
  textContent.appendChild(div);
  scrollToBottom();
}

function updateStatusLine(): void {
  const player = world.getPlayer();
  let locationName = '';
  if (player) {
    const locationId = world.getLocation(player.id);
    if (locationId) {
      const room = world.getEntity(locationId);
      if (room) locationName = room.name || 'Unknown';
    }
  }
  if (statusLocation) statusLocation.textContent = locationName;
  if (statusScore) statusScore.textContent = `Score: ${currentScore} | Turns: ${currentTurn}`;
}

function scrollToBottom(): void {
  if (mainWindow) mainWindow.scrollTop = mainWindow.scrollHeight;
}

async function start(): Promise<void> {
  try {
    setupDOM();
    initializeGame();
    await engine.start();
    await engine.executeTurn('look');
    if (commandInput) commandInput.focus();
  } catch (error) {
    console.error('=== STARTUP ERROR ===', error);
    displayText(`[Startup Error: ${error}]`);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
