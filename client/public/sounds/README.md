# Sound Effects for PartyDraw

This directory contains sound effects for the PartyDraw game.

## Required Sound Files

Add the following sound files (in .mp3 and .ogg formats for browser compatibility):

| File Name | Description | Suggested Duration |
|-----------|-------------|-------------------|
| `countdown-tick.mp3/.ogg` | Tick sound for 3-2-1 countdown | ~0.2s |
| `round-start.mp3/.ogg` | Fanfare when a round begins | ~1-2s |
| `drawing-submit.mp3/.ogg` | Confirmation sound when drawing is submitted | ~0.3s |
| `vote-cast.mp3/.ogg` | Click/pop sound when casting a vote | ~0.2s |
| `round-winner.mp3/.ogg` | Celebration sound for round winner | ~2-3s |
| `game-winner.mp3/.ogg` | Victory fanfare for game winner | ~3-5s |

## Recommended Free Sound Sources

- [Freesound.org](https://freesound.org/) - Creative Commons sounds
- [Mixkit](https://mixkit.co/free-sound-effects/) - Free game sound effects
- [Pixabay](https://pixabay.com/sound-effects/) - Royalty-free sounds
- [Zapsplat](https://www.zapsplat.com/) - Game sound effects

## Usage

The `useAudio` hook will automatically look for these files. If a file is missing,
a warning will be logged to the console but the game will continue to function.
