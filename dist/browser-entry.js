"use strict";
/**
 * Browser Entry Point for No Signal Home
 */
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("@sharpee/engine");
const world_model_1 = require("@sharpee/world-model");
const parser_en_us_1 = require("@sharpee/parser-en-us");
const lang_en_us_1 = require("@sharpee/lang-en-us");
const stdlib_1 = require("@sharpee/stdlib");
const text_service_1 = require("@sharpee/text-service");
const index_js_1 = require("./index.js");
let statusLocation;
let statusScore;
let textContent;
let mainWindow;
let commandInput;
let engine;
let world;
let commandHistory = [];
let historyIndex = -1;
let currentTurn = 0;
let currentScore = 0;
function initializeGame() {
    world = new world_model_1.WorldModel();
    const player = world.createEntity('player', world_model_1.EntityType.ACTOR);
    world.setPlayer(player.id);
    const language = new lang_en_us_1.LanguageProvider();
    const parser = new parser_en_us_1.Parser(language);
    if (index_js_1.story.extendParser)
        index_js_1.story.extendParser(parser);
    if (index_js_1.story.extendLanguage)
        index_js_1.story.extendLanguage(language);
    const perceptionService = new stdlib_1.PerceptionService();
    engine = new engine_1.GameEngine({ world, player, parser, language, perceptionService });
    engine.on('text:output', (blocks, turn) => {
        displayText((0, text_service_1.renderToString)(blocks));
        currentTurn = turn;
        updateStatusLine();
    });
    engine.on('event', (event) => {
        if (event.type === 'game.score_changed' && event.data) {
            currentScore = event.data.newScore ?? currentScore;
            updateStatusLine();
        }
    });
    engine.setStory(index_js_1.story);
}
function setupDOM() {
    statusLocation = document.getElementById('location-name');
    statusScore = document.getElementById('score-turns');
    textContent = document.getElementById('text-content');
    mainWindow = document.getElementById('main-window');
    commandInput = document.getElementById('command-input');
    if (!commandInput)
        return;
    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter')
            handleCommand();
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateHistory(-1);
        }
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateHistory(1);
        }
    });
    document.addEventListener('click', () => {
        if (commandInput && !commandInput.disabled)
            commandInput.focus();
    });
}
async function handleCommand() {
    if (!commandInput)
        return;
    const command = commandInput.value.trim();
    if (!command)
        return;
    commandHistory.push(command);
    historyIndex = commandHistory.length;
    commandInput.value = '';
    displayCommand(command);
    try {
        await engine.executeTurn(command);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        displayText(`[Error: ${message}]`);
    }
}
function navigateHistory(direction) {
    if (!commandInput)
        return;
    const newIndex = historyIndex + direction;
    if (newIndex < 0)
        return;
    if (newIndex >= commandHistory.length) {
        historyIndex = commandHistory.length;
        commandInput.value = '';
        return;
    }
    historyIndex = newIndex;
    commandInput.value = commandHistory[historyIndex];
    commandInput.setSelectionRange(commandInput.value.length, commandInput.value.length);
}
function displayText(text) {
    if (!textContent)
        return;
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
function displayCommand(command) {
    if (!textContent)
        return;
    const div = document.createElement('div');
    div.className = 'command-echo';
    div.textContent = `> ${command}`;
    textContent.appendChild(div);
    scrollToBottom();
}
function updateStatusLine() {
    const player = world.getPlayer();
    let locationName = '';
    if (player) {
        const locationId = world.getLocation(player.id);
        if (locationId) {
            const room = world.getEntity(locationId);
            if (room)
                locationName = room.name || 'Unknown';
        }
    }
    if (statusLocation)
        statusLocation.textContent = locationName;
    if (statusScore)
        statusScore.textContent = `Score: ${currentScore} | Turns: ${currentTurn}`;
}
function scrollToBottom() {
    if (mainWindow)
        mainWindow.scrollTop = mainWindow.scrollHeight;
}
async function start() {
    try {
        setupDOM();
        initializeGame();
        await engine.start();
        await engine.executeTurn('look');
        if (commandInput)
            commandInput.focus();
    }
    catch (error) {
        console.error('=== STARTUP ERROR ===', error);
        displayText(`[Startup Error: ${error}]`);
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
}
else {
    start();
}
//# sourceMappingURL=browser-entry.js.map