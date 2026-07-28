#!/usr/bin/env bash
# chord-check.sh — build the Chord compiler from the fork, then gate-check the story.
#
# Why this exists: `@sharpee/chord` (the Chord compiler) and `sharpee compose`
# (its CLI, in @sharpee/devkit) ship with the Sharpee 3.0 platform. They are not
# published to the 0.9.x npm line this project pins, so `npx sharpee compose` is
# not available here. The compiler is a self-contained, dependency-free
# TypeScript package, so we compile it into a local gitignored directory and
# drive it with story/chord-check.js.
#
# This only ever READS the fork. It writes nothing outside story/.chordc/.
#
# Replace this whole script with `npx sharpee compose --check story/*.story`
# once the platform lands on npm.

set -euo pipefail

FORK="${SHARPEE_FORK:-C:/code/fork/sharpee}"
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/.." && pwd)"
CHORD_SRC="$FORK/packages/chord/src"
OUT="$HERE/.chordc"
STORY="${1:-$HERE/no-signal-home.story}"

if [ ! -d "$CHORD_SRC" ]; then
  echo "Chord source not found at $CHORD_SRC" >&2
  echo "Set SHARPEE_FORK to your fork checkout." >&2
  exit 2
fi

# Rebuild only when the compiler source is newer than what we last built.
if [ ! -f "$OUT/index.js" ] || [ -n "$(find "$CHORD_SRC" -name '*.ts' -newer "$OUT/index.js" -print -quit 2>/dev/null)" ]; then
  echo "building chord compiler -> story/.chordc/" >&2
  "$REPO/node_modules/.bin/tsc" \
    --outDir "$OUT" \
    --rootDir "$CHORD_SRC" \
    --target ES2022 --module commonjs --moduleResolution node \
    --esModuleInterop --skipLibCheck --strict false \
    --declaration false --sourceMap false \
    "$CHORD_SRC/index.ts"
fi

node "$HERE/chord-check.js" "$STORY"
