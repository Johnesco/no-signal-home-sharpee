# No Signal Home

A sci-fi salvage horror text adventure for the [Sharpee](https://www.sharpee.net) engine, written in [Chord](https://sharpee.net/chord/).

## Premise

Far future. You are a grey-market salvager who drifted into range of *The Stillwater*, a corporate freighter that has been dead for years, after running low on fuel on a long haul. You dock. You board to scavenge. The tug fails, and you are trapped on a dead ship.

Except it is not dead. Systems are flickering on. An AI is waking up. Four survivors are aboard, each with their own problems. And the cargo this ship was hauling to a military buyer is the reason everything went wrong.

Figure out what happened. Decide what matters. Get out alive. Maybe.

## Game Details

- **Rooms:** 26 across 4 regions (a 2-room tug and 3 decks of The Stillwater)
- **NPCs:** 4 survivors and an AI with its own agenda
- **Endings:** 5 designed; 2 playable so far (Escape Alone, Override The AI)
- **Combat:** optional; every encounter has a non-violent alternative
- **Style:** classic 80s IF feel: short descriptions, compass movement, deep mechanics

## Project Structure

```
no-signal-home-sharpee/
├── no-signal-home-sharpee.story       the game, one Chord file
├── no-signal-home-sharpee.tests.json  tests document (sharpee test)
├── docs/                              design documents and the Chord port notes
├── legacy/                            the earlier TypeScript edition, kept as the reference
└── play.html, game.js, ...            the built web player, laid out by the workspace build
```

## Building

This game is built and published from the Sharpee workspace, which holds the shared tooling:

```
npx sharpee play                                          # play in the terminal
npx sharpee test                                          # replay the tests document
python ../tools/build.py no-signal-home-sharpee --force   # gates, build, tests, lay out the hub folder
python C:/code/ifhub/tools/ship.py no-signal-home-sharpee # publish and list on IF Hub
```

## License

MIT
