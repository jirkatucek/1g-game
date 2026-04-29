import { loadGameState } from './GameState.js';
import { GAME_CONFIG } from './GameConfig.js';

const CLICK_KEYS = ['click_1', 'click_2', 'click_3', 'click_4'];

export function playRandomClick(scene, volume = 0.75) {
    if (!scene?.sound || scene.sound.mute) return;
    const key = CLICK_KEYS[Math.floor(Math.random() * CLICK_KEYS.length)];
    const prefs = loadGameState();
    const nextVolume = volume ?? prefs.sfxVolume ?? GAME_CONFIG.audio.sfxVolume;
    scene.sound.play(key, { volume: prefs.muted || nextVolume <= 0 ? 0 : nextVolume });
}