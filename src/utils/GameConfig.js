export const GAME_CONFIG = {
    audio: {
        themeVolume: 0.5,
        sfxVolume: 0.75,
    },
    gameplay: {
        killsNeeded: 5,
        shopHealthCost: 50,
        shopHealthGain: 30,
        portalEnterDelayMs: 650,
        gateMsgCooldownMs: 2000,
        dialogCooldownMs: 3000,
        shopCooldownMs: 1200,
        battleWinDelayMs: 1500,
        battleLoseDelayMs: 2000,
        battleFleeDelayMs: 900,
        battleLoseTransitionMs: 400,
        portalFadeInMs: 900,
        portalPulseMs: 140,
    },
    battle: {
        correctDamage: 25,
        timeoutDamage: 25,
        timeoutByLevel: {
            1: 20000,
            2: 15000,
            3: 13000,
            4: 13000,
            5: 17000,
        },
    },
};
