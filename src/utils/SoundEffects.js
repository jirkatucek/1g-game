const CLICK_KEYS = ['click_1', 'click_2', 'click_3', 'click_4'];

export function playRandomClick(scene, volume = 0.75) {
    if (!scene?.sound || scene.sound.mute) return;
    const key = CLICK_KEYS[Math.floor(Math.random() * CLICK_KEYS.length)];
    scene.sound.play(key, { volume });
}