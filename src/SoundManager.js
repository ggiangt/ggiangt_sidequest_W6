// src/SoundManager.js
// Audio playback (SYSTEM layer).
//
// Responsibilities:
// - Load sound assets during preload() (via loadSound)
// - Play sounds by key (SFX/music)
// - Provide a simple abstraction so gameplay code never touches audio directly
//
// Non-goals:
// - Does NOT subscribe to EventBus directly (Game wires events → play())
// - Does NOT decide when events happen (WORLD logic emits events)
// - Does NOT manage UI
//
// Architectural notes:
// - Game connects EventBus events (leaf:collected, player:damaged, etc.) to SoundManager.play().
// - This keeps audio concerns isolated from gameplay and supports easy swapping/muting.

export class SoundManager {
  constructor() {
    this.sfx = {};
    this.music = null;
    this.musicVolume = 0.4;
    this.sfxVolume = 0.7;
  }

  load(name, path) {
    this.sfx[name] = loadSound(path);
  }

  loadMusic(path) {
    this.music = loadSound(path, () => {
      this.music.setVolume(this.musicVolume);
      this.music.loop();
    });
  }

  play(name) {
    const s = this.sfx[name];
    if (!s) return;
    s.setVolume(this.sfxVolume);
    s.play();
  }

  startMusic() {
    if (this.music && !this.music.isPlaying()) {
      this.music.setVolume(this.musicVolume);
      this.music.loop();
    }
  }
}
