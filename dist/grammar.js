"use strict";
/**
 * No Signal Home — Grammar Extensions
 *
 * Custom vocabulary and grammar patterns for story-specific actions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendParser = extendParser;
function extendParser(parser) {
    // === VOCABULARY SYNONYMS ===
    parser.registerVocabulary?.([
        { word: 'grab', partOfSpeech: 'verb', mapsTo: 'take', priority: 80, source: 'story' },
        { word: 'inspect', partOfSpeech: 'verb', mapsTo: 'examine', priority: 80, source: 'story' },
        { word: 'yank', partOfSpeech: 'verb', mapsTo: 'pull', priority: 80, source: 'story' },
        { word: 'smash', partOfSpeech: 'verb', mapsTo: 'attack', priority: 80, source: 'story' },
        { word: 'hit', partOfSpeech: 'verb', mapsTo: 'attack', priority: 80, source: 'story' },
        { word: 'scan', partOfSpeech: 'verb', mapsTo: 'examine', priority: 80, source: 'story' },
        { word: 'check', partOfSpeech: 'verb', mapsTo: 'examine', priority: 80, source: 'story' },
        { word: 'activate', partOfSpeech: 'verb', mapsTo: 'switch on', priority: 80, source: 'story' },
        { word: 'hack', partOfSpeech: 'verb', mapsTo: 'use', priority: 80, source: 'story' },
    ]);
    // === STORY GRAMMAR PATTERNS ===
    const g = parser.getStoryGrammar();
    // --- Press alarm button ---
    g.define('press :target').mapsTo('story.action.pressing').withPriority(150).build();
    g.define('push :target').mapsTo('story.action.pressing').withPriority(150).build();
    g.define('hit :target').mapsTo('story.action.pressing').withPriority(150).build();
    g.define('punch :target').mapsTo('story.action.pressing').withPriority(140).build();
    g.define('press button').mapsTo('story.action.pressing').withPriority(155).build();
    g.define('push button').mapsTo('story.action.pressing').withPriority(155).build();
    g.define('silence alarm').mapsTo('story.action.pressing').withPriority(155).build();
    g.define('turn off alarm').mapsTo('story.action.pressing').withPriority(155).build();
    g.define('stop alarm').mapsTo('story.action.pressing').withPriority(155).build();
    // --- Docking: Maneuver ---
    g.define('maneuver').mapsTo('story.action.maneuvering').withPriority(150).build();
    g.define('take controls').mapsTo('story.action.maneuvering').withPriority(155).build();
    g.define('take helm').mapsTo('story.action.maneuvering').withPriority(155).build();
    g.define('take the helm').mapsTo('story.action.maneuvering').withPriority(155).build();
    g.define('take the controls').mapsTo('story.action.maneuvering').withPriority(155).build();
    g.define('steer').mapsTo('story.action.maneuvering').withPriority(150).build();
    g.define('pilot').mapsTo('story.action.maneuvering').withPriority(150).build();
    // --- Docking: Brake ---
    g.define('brake').mapsTo('story.action.braking').withPriority(150).build();
    g.define('decelerate').mapsTo('story.action.braking').withPriority(150).build();
    g.define('slow down').mapsTo('story.action.braking').withPriority(150).build();
    g.define('fire thrusters').mapsTo('story.action.braking').withPriority(155).build();
    g.define('reverse thrusters').mapsTo('story.action.braking').withPriority(155).build();
    g.define('slow').mapsTo('story.action.braking').withPriority(140).build();
    // --- Docking: Connect ---
    g.define('extend arm').mapsTo('story.action.docking-connect').withPriority(155).build();
    g.define('extend docking arm').mapsTo('story.action.docking-connect').withPriority(160).build();
    g.define('dock').mapsTo('story.action.docking-connect').withPriority(150).build();
    g.define('dock with ship').mapsTo('story.action.docking-connect').withPriority(155).build();
    g.define('attach').mapsTo('story.action.docking-connect').withPriority(140).build();
    g.define('latch on').mapsTo('story.action.docking-connect').withPriority(150).build();
    // --- Docking: Check pressure ---
    g.define('check pressure').mapsTo('story.action.checking-pressure').withPriority(155).build();
    g.define('check seal').mapsTo('story.action.checking-pressure').withPriority(155).build();
    g.define('verify seal').mapsTo('story.action.checking-pressure').withPriority(155).build();
    g.define('test pressure').mapsTo('story.action.checking-pressure').withPriority(155).build();
    g.define('verify pressure').mapsTo('story.action.checking-pressure').withPriority(155).build();
    // --- Docking: Seal ---
    g.define('seal').mapsTo('story.action.sealing').withPriority(150).build();
    g.define('seal airlock').mapsTo('story.action.sealing').withPriority(155).build();
    g.define('pressurize').mapsTo('story.action.sealing').withPriority(150).build();
    g.define('pressurize airlock').mapsTo('story.action.sealing').withPriority(155).build();
    // --- Pry / Force open ---
    g.define('pry :target').mapsTo('story.action.prying').withPriority(150).build();
    g.define('pry open :target').mapsTo('story.action.prying').withPriority(150).build();
    g.define('force :target').mapsTo('story.action.prying').withPriority(150).build();
    g.define('force open :target').mapsTo('story.action.prying').withPriority(150).build();
    g.define('jimmy :target').mapsTo('story.action.prying').withPriority(150).build();
    g.define('break open :target').mapsTo('story.action.prying').withPriority(150).build();
    // --- Repair ---
    g.define('repair :target').mapsTo('story.action.repairing').withPriority(150).build();
    g.define('fix :target').mapsTo('story.action.repairing').withPriority(150).build();
    g.define('install parts').mapsTo('story.action.repairing').withPriority(150).build();
    // --- Enter code ---
    g.define('enter code').mapsTo('story.action.entering-code').withPriority(150).build();
    g.define('type code').mapsTo('story.action.entering-code').withPriority(150).build();
    g.define('use keypad').mapsTo('story.action.entering-code').withPriority(150).build();
    g.define('enter access code').mapsTo('story.action.entering-code').withPriority(150).build();
    // --- Connect comms ---
    g.define('connect :target').mapsTo('story.action.connecting-comms').withPriority(150).build();
    g.define('connect comms').mapsTo('story.action.connecting-comms').withPriority(150).build();
    g.define('activate :target').mapsTo('story.action.connecting-comms').withPriority(140).build();
    // --- Cut cables ---
    g.define('cut :target').mapsTo('story.action.cutting').withPriority(150).build();
    g.define('cut :target with :tool').mapsTo('story.action.cutting').withPriority(160).build();
    g.define('snip :target').mapsTo('story.action.cutting').withPriority(150).build();
    g.define('sever :target').mapsTo('story.action.cutting').withPriority(150).build();
    // --- Security override ---
    g.define('override :target').mapsTo('story.action.overriding').withPriority(150).build();
    g.define('use override').mapsTo('story.action.overriding').withPriority(150).build();
    g.define('use override panel').mapsTo('story.action.overriding').withPriority(155).build();
    g.define('use security panel').mapsTo('story.action.overriding').withPriority(155).build();
    g.define('use override :target').mapsTo('story.action.overriding').withPriority(155).build();
    g.define('override security').mapsTo('story.action.overriding').withPriority(150).build();
    // --- Reactor overload ---
    g.define('overload reactor').mapsTo('story.action.overloading').withPriority(150).build();
    g.define('overload :target').mapsTo('story.action.overloading').withPriority(150).build();
    g.define('disable safeties').mapsTo('story.action.overloading').withPriority(150).build();
    g.define('meltdown').mapsTo('story.action.overloading').withPriority(150).build();
    // --- Launch escape pod ---
    g.define('launch pod').mapsTo('story.action.launching').withPriority(150).build();
    g.define('launch :target').mapsTo('story.action.launching').withPriority(150).build();
    g.define('enter pod').mapsTo('story.action.launching').withPriority(150).build();
    g.define('enter :target').mapsTo('story.action.launching').withPriority(140).build();
    g.define('escape').mapsTo('story.action.launching').withPriority(150).build();
    g.define('use escape pod').mapsTo('story.action.launching').withPriority(150).build();
    g.define('leave ship').mapsTo('story.action.launching').withPriority(150).build();
    // --- ASK NPC ABOUT ---
    g.define('ask :target about :topic...').mapsTo('story.action.asking-about').withPriority(150).build();
    g.define('talk to :target about :topic...').mapsTo('story.action.asking-about').withPriority(150).build();
    g.define('tell :target about :topic...').mapsTo('story.action.asking-about').withPriority(140).build();
    // --- Query terminal ---
    g.define('query :target about :topic...').mapsTo('story.action.querying').withPriority(150).build();
    g.define('query :target').mapsTo('story.action.querying').withPriority(145).build();
    g.define('use :target').mapsTo('story.action.querying').withPriority(100).build();
    // --- Search ---
    g.define('search :target').mapsTo('story.action.searching').withPriority(150).build();
    g.define('search under :target').mapsTo('story.action.searching').withPriority(150).build();
    g.define('look under :target').mapsTo('story.action.searching').withPriority(150).build();
    g.define('look behind :target').mapsTo('story.action.searching').withPriority(150).build();
    // --- Wear hazmat ---
    g.define('wear :target').mapsTo('story.action.wearing-hazmat').withPriority(100).build();
    g.define('put on :target').mapsTo('story.action.wearing-hazmat').withPriority(100).build();
    // --- Meta ---
    g.define('help').mapsTo('story.action.help').withPriority(150).build();
    g.define('about').mapsTo('story.action.about').withPriority(150).build();
    g.define('hint').mapsTo('story.action.help').withPriority(140).build();
}
//# sourceMappingURL=grammar.js.map