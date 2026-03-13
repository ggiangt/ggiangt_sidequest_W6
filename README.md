## Project Title
GBDA302 Week 6 Side Quest: Swamp Platformer - Custom Asset Integration

---

## Authors
Original terrain codebase from Week 6 lecture

Customized by Giang Tran

---

## Description
This p5.js platformer game demonstrates asset integration and game customization through sprite sheet replacement, tileset swapping, and audio implementation. The player navigates through a swamp-themed level, collecting items and avoiding enemies. The project showcases complete visual and audio reskinning of an existing game template, including custom character animations, environmental tiles, and sound effects that trigger on gameplay events.

---

## Learning Goals
- Understand how to integrate sprite sheets with multiple animation states
- Practice replacing game assets (sprites, tilesets, audio) while maintaining gameplay functionality
- Learn frame-based animation timing and sprite sheet dimension management
- Implement audio triggers tied to game events (jumping, damage, collecting)
- Work with parallax background layers for depth perception
- Design tilemap layouts using ASCII-based level editors
- Credit and attribute free online game assets appropriately

---

## Assets

**Sprite Sheets:**
- Player Character: Converted_Vampire sprites from [Craftpix.net Free Vampire Pixel Art Sprite Sheets](https://craftpix.net/freebies/free-vampire-pixel-art-sprite-sheets/) (craftpix-net-506778)
- Enemy Character: Vampire_Girl sprites from [Craftpix.net Free Vampire Pixel Art Sprite Sheets](https://craftpix.net/freebies/free-vampire-pixel-art-sprite-sheets/) (craftpix-net-506778)
- Collectible (Leaf): Owlet Monster sprites from [Craftpix.net Free Pixel Art Tiny Hero Sprites](https://craftpix.net/freebies/free-pixel-art-tiny-hero-sprites/) (craftpix-net-622999)

**Tileset:**
- Swamp Game Tileset from [Craftpix.net Free Swamp Game Tileset Pixel Art](https://craftpix.net/freebies/free-swamp-game-tileset-pixel-art/) (craftpix-net-672461)

**Audio:**
- Jump: viralaudio-ascent-braam-magma-brass-d-cinematic-trailer-sound-effect-222269.mp3
- Damage: brvhrtz-stab-f-01-brvhrtz-224599.mp3
- Enemy Hit/Death: viralaudio-descent-whoosh-long-cinematic-sound-effect-405921.mp3
- Collect Item/Win: soundreality-riser-wildfire-285209.mp3
- Background Music: solitarymaninblacksmok-solitarymaninblack-untitled-drum-loop-for-you-to-use-118966.mp3

All audio files sourced from royalty-free sound libraries.

---

## GenAI
The code was written by Dr. Karen Cochrane and David Han but they used GenAI to write the comments.
The customization was implemented with assistance from Claude Sonnet 4.6 (prompt ideation and technical consultation) and Claude Code Opus 4.6 (file manipulation and code implementation). GenAI helped with sprite sheet frame counting, automated file resizing/copying, animation configuration updates, tilemap redesign, and audio path wiring. Human decisions included: selecting which specific swamp tiles to use for platforms/ground, designing the tilemap layout for platforming flow, choosing audio-to-event mappings based on sound characteristics, deciding to use descriptive audio filenames, and all playtesting/verification of animations and gameplay functionality. GenAI was used iteratively to fix file path issues, correct tilemap dimensions, and debug animation frame mismatches.

---
