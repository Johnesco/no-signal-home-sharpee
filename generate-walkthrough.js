#!/usr/bin/env node
/**
 * Generate walkthrough.json for the walkthrough viewer.
 *
 * Runs the transcript tester with --output-dir, then copies the latest
 * results JSON to browser/walkthrough.json for the viewer to load.
 *
 * Usage: node generate-walkthrough.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = __dirname;
const outputDir = path.join(projectDir, 'dist', 'test-results');
const browserDir = path.join(projectDir, 'browser');
const targetFile = path.join(browserDir, 'walkthrough.json');

// Find all transcript files
const testDir = path.join(projectDir, 'tests', 'transcripts');
const wtDir = path.join(projectDir, 'walkthroughs');

const transcripts = [];
if (fs.existsSync(testDir)) {
  for (const f of fs.readdirSync(testDir)) {
    if (f.endsWith('.transcript')) transcripts.push(path.join(testDir, f));
  }
}
if (fs.existsSync(wtDir)) {
  for (const f of fs.readdirSync(wtDir)) {
    if (f.endsWith('.transcript')) transcripts.push(path.join(wtDir, f));
  }
}

if (transcripts.length === 0) {
  console.error('No transcript files found.');
  process.exit(1);
}

console.log(`Found ${transcripts.length} transcript(s)`);

// Run transcript tester
const cmd = `npx transcript-test . ${transcripts.map(t => `"${t}"`).join(' ')} -o "${outputDir}"`;
try {
  execSync(cmd, { cwd: projectDir, stdio: 'inherit' });
} catch (e) {
  console.error('Transcript tester failed.');
  process.exit(1);
}

// Find the latest results JSON
const files = fs.readdirSync(outputDir)
  .filter(f => f.endsWith('.json'))
  .sort();
const latest = files[files.length - 1];

if (!latest) {
  console.error('No results JSON found in', outputDir);
  process.exit(1);
}

// Copy to browser/walkthrough.json
fs.copyFileSync(path.join(outputDir, latest), targetFile);
console.log(`\nWrote ${targetFile}`);

// Also copy walkthrough.html and walkthrough.json to dist/web/ if it exists
const distWeb = path.join(projectDir, 'dist', 'web');
if (fs.existsSync(distWeb)) {
  const viewerHtml = path.join(browserDir, 'walkthrough.html');
  if (fs.existsSync(viewerHtml)) {
    fs.copyFileSync(viewerHtml, path.join(distWeb, 'walkthrough.html'));
    console.log(`Copied walkthrough.html to dist/web/`);
  }
  fs.copyFileSync(targetFile, path.join(distWeb, 'walkthrough.json'));
  console.log(`Copied walkthrough.json to dist/web/`);
} else {
  console.log('Run "npx sharpee build" first, then re-run to copy to dist/web/');
}
