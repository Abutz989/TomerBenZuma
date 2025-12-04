// game/sound.js
import ASSETS from './assets.js';

const sounds = {};

function createAudio(src) {
  const audio = new Audio(src);
  audio.preload = 'auto';
  return audio;
}

export default {
  preload() {
    sounds.shoot = createAudio(ASSETS.sounds.shoot);
    sounds.pop   = createAudio(ASSETS.sounds.pop);
    sounds.win   = createAudio(ASSETS.sounds.win);
    sounds.lose  = createAudio(ASSETS.sounds.lose);
  },
  play(name) {
    const s = sounds[name];
    if (s) {
      s.currentTime = 0;
      s.play().catch(() => {});
    }
  }
};