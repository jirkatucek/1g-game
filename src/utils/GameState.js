import { GAME_CONFIG } from './GameConfig.js';

const STORAGE_KEY = 'math-quest-save-v1';

const DEFAULT_STATE = {
    currentLevel: 0,
    lastLevel: 0,
    lastSelectedLevel: 0,
    unlockedLevel: 0,
    playerHP: 100,
    gold: 0,
    killCount: 0,
    npcTalked: false,
    volume: GAME_CONFIG.audio.themeVolume,
    sfxVolume: GAME_CONFIG.audio.sfxVolume,
    muted: false,
    resumeMode: 'fresh',
};

function hasStorage() {
    return typeof window !== 'undefined' && !!window.localStorage;
}

function clampVolume(value, fallback) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Phaser.Math.Clamp(parsed, 0, 1);
}

function normalizeState(state = {}) {
    const volume = clampVolume(state.volume, DEFAULT_STATE.volume);
    const sfxVolume = clampVolume(state.sfxVolume, DEFAULT_STATE.sfxVolume);
    return {
        ...DEFAULT_STATE,
        ...state,
        currentLevel: Number.isFinite(Number(state.currentLevel)) ? Number(state.currentLevel) : DEFAULT_STATE.currentLevel,
        lastLevel: Number.isFinite(Number(state.lastLevel)) ? Number(state.lastLevel) : DEFAULT_STATE.lastLevel,
        lastSelectedLevel: Number.isFinite(Number(state.lastSelectedLevel)) ? Number(state.lastSelectedLevel) : DEFAULT_STATE.lastSelectedLevel,
        unlockedLevel: Number.isFinite(Number(state.unlockedLevel)) ? Number(state.unlockedLevel) : DEFAULT_STATE.unlockedLevel,
        playerHP: Number.isFinite(Number(state.playerHP)) ? Number(state.playerHP) : DEFAULT_STATE.playerHP,
        gold: Number.isFinite(Number(state.gold)) ? Number(state.gold) : DEFAULT_STATE.gold,
        killCount: Number.isFinite(Number(state.killCount)) ? Number(state.killCount) : DEFAULT_STATE.killCount,
        npcTalked: !!state.npcTalked,
        volume,
        sfxVolume,
        muted: !!state.muted || volume <= 0,
        resumeMode: state.resumeMode === 'resume' ? 'resume' : 'fresh',
    };
}

export function loadGameState() {
    if (!hasStorage()) return { ...DEFAULT_STATE };

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_STATE };
        return normalizeState(JSON.parse(raw));
    } catch (error) {
        return { ...DEFAULT_STATE };
    }
}

export function saveGameState(partial = {}) {
    const next = normalizeState({ ...loadGameState(), ...partial });
    if (hasStorage()) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    return next;
}

export function applyAudioPreferences(scene, state = loadGameState()) {
    if (!scene?.sound) return state;

    scene.sound.mute = state.muted || state.volume <= 0;
    const theme = scene.sound.get('theme_adventure');
    if (theme) {
        theme.setVolume(scene.sound.mute ? 0 : state.volume);
    }

    return state;
}

export function playThemeMusic(scene, state = loadGameState()) {
    if (!scene?.sound) return;

    const prefs = normalizeState(state);
    scene.sound.mute = prefs.muted || prefs.volume <= 0;

    if (!scene.sound.get('theme_adventure')?.isPlaying) {
        scene.sound.play('theme_adventure', { loop: true, volume: scene.sound.mute ? 0 : prefs.volume });
    } else {
        const theme = scene.sound.get('theme_adventure');
        if (theme) theme.setVolume(scene.sound.mute ? 0 : prefs.volume);
    }
}

export function getResumePayload(state = loadGameState()) {
    const prefs = normalizeState(state);
    return {
        level: prefs.resumeMode === 'resume' ? prefs.currentLevel : prefs.currentLevel,
        playerHP: prefs.playerHP,
        gold: prefs.gold,
        killCount: prefs.killCount,
        npcTalked: prefs.npcTalked,
    };
}

export function saveProgress(scene, extra = {}) {
    const currentLevel = Number.isFinite(Number(extra.currentLevel))
        ? Number(extra.currentLevel)
        : Number.isFinite(Number(scene?.currentLevel)) ? Number(scene.currentLevel) : 0;

    const existing = loadGameState();
    return saveGameState({
        currentLevel,
        lastLevel: currentLevel,
        lastSelectedLevel: Number.isFinite(Number(extra.lastSelectedLevel))
            ? Number(extra.lastSelectedLevel)
            : existing.lastSelectedLevel,
        unlockedLevel: Math.max(existing.unlockedLevel ?? 0, Number.isFinite(Number(extra.unlockedLevel)) ? Number(extra.unlockedLevel) : currentLevel),
        playerHP: Number.isFinite(Number(extra.playerHP))
            ? Number(extra.playerHP)
            : Number.isFinite(Number(scene?.player?.hp)) ? Number(scene.player.hp) : Number.isFinite(Number(scene?.playerHP)) ? Number(scene.playerHP) : 100,
        gold: Number.isFinite(Number(extra.gold))
            ? Number(extra.gold)
            : Number.isFinite(Number(scene?.gold)) ? Number(scene.gold) : 0,
        killCount: Number.isFinite(Number(extra.killCount))
            ? Number(extra.killCount)
            : Number.isFinite(Number(scene?.killCount)) ? Number(scene.killCount) : 0,
        npcTalked: typeof extra.npcTalked === 'boolean' ? extra.npcTalked : !!scene?.npcTalked,
        volume: Number.isFinite(Number(extra.volume)) ? Number(extra.volume) : existing.volume,
        sfxVolume: Number.isFinite(Number(extra.sfxVolume)) ? Number(extra.sfxVolume) : existing.sfxVolume,
        muted: typeof extra.muted === 'boolean' ? extra.muted : existing.muted,
        resumeMode: extra.resumeMode === 'resume' ? 'resume' : 'fresh',
    });
}

export function saveFreshRun(scene, level, extra = {}) {
    return saveProgress(scene, {
        currentLevel: level,
        lastSelectedLevel: level,
        playerHP: extra.playerHP ?? 100,
        gold: extra.gold ?? 0,
        killCount: extra.killCount ?? 0,
        npcTalked: extra.npcTalked ?? false,
        unlockedLevel: extra.unlockedLevel ?? loadGameState().unlockedLevel,
        volume: extra.volume,
        sfxVolume: extra.sfxVolume,
        muted: extra.muted,
        resumeMode: 'resume',
    });
}