#!/usr/bin/env node
/**
 * chord-check.js — run the Chord load-time gates over a .story file.
 *
 * The equivalent of `sharpee compose --check`, which is not yet available to
 * this repo: `@sharpee/chord` ships with the Sharpee 3.0 platform and is not
 * published to the 0.9.x npm line this project pins. Until it is, we compile
 * the compiler ourselves from the read-only fork checkout (see chord-check.sh)
 * and drive it directly. The compiler is browser-safe and has zero runtime
 * dependencies, so this needs nothing from the fork but its source.
 *
 * Usage: node story/chord-check.js story/no-signal-home.story
 * Exit:  0 = gate-clean, 1 = errors, 2 = usage.
 */
const fs = require('fs');
const path = require('path');

const COMPILER = path.join(__dirname, '.chordc', 'index.js');

if (!fs.existsSync(COMPILER)) {
  console.error('Chord compiler not built. Run: ./story/chord-check.sh');
  process.exit(2);
}

const file = process.argv[2];
if (!file) {
  console.error('usage: node story/chord-check.js <file.story>');
  process.exit(2);
}

const chord = require(COMPILER);
const source = fs.readFileSync(file, 'utf8');
const lines = source.split('\n');
const result = chord.compile(source);

let errors = 0;
let warnings = 0;

for (const d of result.diagnostics) {
  const severity = d.severity === 1 || d.severity === 'warning' ? 'warning' : 'error';
  if (severity === 'error') errors++;
  else warnings++;
  const line = (d.span && d.span.line) || 0;
  const col = (d.span && d.span.column) || 0;
  console.error(`${file}:${line}:${col} ${severity} [${d.code}] ${d.message}`);
  if (line > 0 && lines[line - 1] !== undefined) {
    console.error(`    | ${lines[line - 1]}`);
  }
}

const rooms = result.ok ? result.ir.entities.filter((e) => e.kinds.some((k) => k.name === 'room')) : [];

console.error('');
console.error(
  `chord ${chord.CHORD_LANGUAGE_VERSION} — ${errors} error(s), ${warnings} warning(s)` +
    (result.ok ? ` — gate-clean: ${result.ir.entities.length} entities, ${rooms.length} rooms` : ''),
);

process.exit(result.ok ? 0 : 1);
