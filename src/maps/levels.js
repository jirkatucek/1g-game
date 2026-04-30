// Tiles: 0=grass, 1=tree/wall, 2=path, 3=water, 4=barrier (invisible wall, no tree visual)
const G = 0, T = 1, P = 2, W = 3, B = 4;

// Simple reusable map builder — open field with path to gate
function makeMap(pathVariant) {
    // All maps 30×20, border of T, inside G with path shapes
    const maps = {
        village: [
            [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,T,T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T,T,G,G,G,T],
            [T,G,T,T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T,T,G,G,G,T],
            [T,G,G,G,G,P,P,P,P,P,P,P,P,P,P,P,P,P,P,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,P,G,T,T,G,G,G,G,G,G,T,T,G,P,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,P,G,T,T,G,G,G,G,G,G,T,T,G,P,P,P,P,P,P,P,G,G,G,G,T],
            [T,G,G,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,G,T],
            [T,G,G,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,G,T],
            [T,G,G,G,G,P,P,P,P,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,P,G,G,T,T,G,G,G,G,G,G,G,G,G,G,P,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,P,G,G,T,T,G,G,G,G,G,G,G,G,G,G,P,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
        ],
        forest: [
            [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,P,P,P,P,P,G,G,T,T,G,G,T,T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,P,G,T,T,P,G,G,T,T,G,G,T,T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,P,G,T,T,P,P,P,P,P,P,P,P,P,P,P,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,P,P,G,G,T,T,G,G,G,G,T,T,G,G,P,P,P,P,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,P,G,G,T,T,G,G,G,G,T,T,G,G,G,G,G,P,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,P,P,P,P,P,P,P,G,G,G,G,G,G,G,G,G,P,P,P,P,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,P,G,G,T,T,G,G,G,G,G,G,G,G,P,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,P,G,G,T,T,G,G,G,G,G,G,G,G,P,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,P,P,P,P,P,P,P,P,P,P,P,P,P,P,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
        ],
        bridge: [
            [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,P,P,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,W,P,P,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,T],
            [T,W,P,P,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,T],
            [T,W,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,W,W,T],
            [T,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,P,W,W,T],
            [T,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,P,W,W,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
        ],
        dungeon: [
            [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,P,P,P,P,P,P,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,P,G,G,G,G,G,P,G,G,T,G,G,T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,P,G,T,G,T,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,P,G,G,G,G,G,P,P,P,P,P,P,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,P,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,P,P,P,P,P,G,G,G,G,G,G,G,P,P,P,P,P,P,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,P,G,G,T,G,G,T,G,G,G,G,G,G,P,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,P,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,P,P,P,P,P,P,P,P,P,P,P,P,P,P,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
        ],
        tower: [
            [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,G,G,G,T],
            [T,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,T],
            [T,G,P,G,T,G,G,T,G,G,G,G,G,G,G,G,G,G,G,T,G,G,T,G,G,P,G,G,G,T],
            [T,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,T],
            [T,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,T],
            [T,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,T],
            [T,G,P,G,T,G,G,T,G,G,G,G,G,G,G,G,G,G,G,T,G,G,T,G,G,P,G,G,G,T],
            [T,G,P,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,P,G,G,G,T],
            [T,G,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,G,T],
            [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
        ],
    };
    return maps[pathVariant] || maps.village;
}

export const LEVELS = [
    // ── Level 1: Lesní stezka ────────────────────────────────────────────
    {
        name: 'Lesní stezka',
        bgColor: 0x0d1a0d,
        map: [
        //   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
            [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 0
            [T, G, G, G, G, T, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, G, G, T, G, T], // 1
            [T, G, G, G, G, G, T, G, G, T, T, G, G, G, G, T, G, G, G, G, G, G, G, G, T, T, G, G, G, T], // 2
            [T, G, G, G, G, G, G, G, G, T, T, G, G, G, G, T, T, G, G, G, G, G, G, G, T, G, T, G, G, T], // 3
            [T, G, G, P, P, P, P, P, P, G, G, G, G, G, G, G, T, T, G, G, G, G, G, G, G, G, G, T, G, T], // 4  ← player (2,4)
            [T, T, G, P, G, T, G, G, P, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, T, T], // 5
            [T, T, G, P, G, G, G, G, P, P, P, P, P, P, P, G, G, G, T, G, G, G, G, G, T, G, G, G, T, T], // 6  NPC (4,6)
            [T, G, G, P, G, G, T, T, G, G, G, G, G, G, P, G, G, T, T, G, G, G, G, G, G, G, T, G, G, T], // 7
            [T, G, G, P, G, G, T, T, G, G, G, G, G, G, P, G, G, G, G, G, G, G, G, G, T, G, G, G, G, T], // 8
            [T, G, G, P, P, P, G, G, G, G, G, G, G, G, P, G, W, W, W, W, G, G, G, G, T, T, G, G, G, T], // 9
            [T, G, G, G, G, P, G, G, G, G, G, T, G, G, P, G, W, W, W, W, G, G, G, G, G, T, G, G, G, T], // 10
            [T, G, G, G, G, P, G, T, G, G, G, T, G, G, P, G, W, W, W, W, G, G, G, G, G, G, T, G, G, T], // 11
            [T, G, T, G, G, P, G, T, G, G, G, G, G, G, P, P, P, P, P, P, P, P, P, G, T, G, G, T, T, T], // 12 ← gate (22,12)
            [T, G, T, G, G, P, P, G, G, G, G, G, T, G, G, G, G, G, G, G, G, G, P, G, G, G, T, G, G, T], // 13
            [T, G, G, G, G, G, P, G, G, G, G, G, T, T, G, G, G, G, G, G, G, G, P, G, T, G, G, G, G, T], // 14
            [T, G, G, G, T, G, P, P, P, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, T, T, G, G, G, T], // 15
            [T, G, G, G, T, T, G, G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G, G, T, G, G, G, T], // 16
            [T, G, G, G, G, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, T, G, T], // 17
            [T, G, T, G, G, G, T, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, G, G, T, G, G, T], // 18
            [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 19
        ],
        playerStart: { x: 2, y: 4 },
        gate: { x: 22, y: 12 },
        enemies: [
            { x: 17, y: 5,  type: 'goblin', level: 1, name: 'Zlomkový Duch' },
            { x: 18, y: 3,  type: 'goblin', level: 1, name: 'Zlomkový Duch' },
            { x:  5, y: 8,  type: 'goblin', level: 1, name: 'Čtvrtinák' },
            { x:  9, y: 11, type: 'goblin', level: 1, name: 'Čtvrtinák' },
            { x: 20, y: 14, type: 'goblin', level: 1, name: 'Lesní Strážce' },
        ],
        npcs: [
            {
                x: 4, y: 6,
                name: 'Průvodce Lesní stezky',
                message: '„Poraz 5 příšer a projdi bránou! Budou tě testovat ze základních operací - sčítání, odčítání, násobení, dělení. Mělo by to být jednoduché!"',
            },
            {
                x: 13, y: 2,
                name: 'Goblin Kuchař',
                type: 'shop',
                sprite: 'goblin_worker',
                frame: 7,
                wanderR: 0,
            },
        ],
        props: [
            { x: 12, y: 2,  key: 'grill',    frame: 0, scale: 1.8, depth: 5, collide: true, bodyW: 72, bodyH: 28 },
            { x: 2,  y: 2,  key: 'campfire', anim: 'campfire_burn', scale: 1.4, depth: 6 },
            { x: 10, y: 7,  key: 'cabin',    scale: 1.5, depth: 8, collide: true, bodyW: 180, bodyH: 55, bodyOffY: 40, depthSort: true },
        ],
        reward: 30,
    },

    // ── Level 2: Les Rozšiřování ─────────────────────────────────────────
    // Path: bottom-left (col 3, row 16) → right → up col 13 → right row 7 → up col 24 → gate (24,2)
    {
        name: 'Les Rozšiřování',
        bgColor: 0x0a1a0a,
        map: [
        //   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
            [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 0
            [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 1
            [T, T, G, G, T, T, G, G, G, G, T, T, G, G, G, G, T, T, G, G, T, T, G, G, P, G, G, G, G, T], // 2  ← gate (24,2)
            [T, G, G, G, T, T, G, G, G, G, T, T, G, G, G, G, G, G, G, G, T, T, G, G, P, G, T, T, G, T], // 3
            [T, G, G, G, G, G, G, T, T, G, G, G, G, G, T, T, G, G, G, G, G, G, G, G, P, G, T, T, G, T], // 4
            [T, G, T, T, G, G, G, T, T, G, G, G, T, T, G, G, G, G, G, G, G, G, T, T, P, G, G, G, G, T], // 5
            [T, G, T, T, G, G, G, G, G, G, T, T, G, G, G, G, T, T, G, G, G, G, T, T, P, G, G, G, G, T], // 6
            [T, G, G, G, G, G, G, G, G, G, T, T, G, P, P, P, P, P, P, P, P, P, P, P, P, G, G, G, G, T], // 7  ← middle path
            [T, G, G, G, T, T, G, G, G, G, T, T, G, P, G, G, G, G, T, T, G, G, G, G, G, T, T, G, G, T], // 8
            [T, G, T, T, G, G, G, G, G, G, G, G, G, P, G, T, T, G, T, T, G, G, G, G, G, T, T, G, G, T], // 9
            [T, G, T, T, G, G, G, G, G, T, T, G, G, P, G, T, T, G, G, G, G, G, T, T, G, G, G, G, G, T], // 10
            [T, G, G, G, G, T, T, G, G, T, T, G, G, P, G, G, G, G, G, G, G, T, T, G, G, G, G, G, G, T], // 11
            [T, G, G, G, G, T, T, G, G, G, G, G, G, P, G, G, G, T, T, G, G, T, T, G, G, G, G, G, G, T], // 12
            [T, G, T, T, G, G, G, G, G, G, T, T, G, P, G, G, G, T, T, G, G, G, G, G, G, T, T, G, G, T], // 13
            [T, G, T, T, G, G, G, G, G, G, T, T, G, P, G, G, G, G, G, G, T, T, G, G, G, T, T, G, G, T], // 14
            [T, G, G, G, G, G, G, T, T, G, G, G, G, P, G, T, T, G, G, G, T, T, G, G, G, G, G, G, G, T], // 15
            [T, G, G, P, P, P, P, P, P, P, P, P, P, P, G, T, T, G, G, G, G, G, G, G, G, G, G, T, T, T], // 16 ← bottom path, player (2,16)
            [T, G, G, G, G, G, T, T, G, G, G, G, G, G, G, T, T, G, G, G, G, T, T, G, G, G, G, G, G, T], // 17
            [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 18
            [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 19
        ],
        playerStart: { x: 2, y: 16 },
        gate: { x: 24, y: 2 },
        enemies: [
            { x:  7, y:  3, type: 'goblin', level: 2, name: 'Větvičník' },
            { x:  9, y:  4, type: 'goblin', level: 2, name: 'Větvičník' },
            { x:  7, y: 10, type: 'orc',   level: 2, name: 'Kmenový Troll' },
            { x: 20, y: 12, type: 'orc',   level: 2, name: 'Kmenový Troll' },
            { x: 19, y: 10, type: 'orc',   level: 2, name: 'Lesní Hlídač' },
        ],
        npcs: [{
            x: 9, y: 14,
            name: 'Čaroděj kalkulátor',
            message: '„Tady stromy rostou do šířky! Musíš zlomek správně rozšířit – vynásob vršek i spodek stejným číslem!"',
        }],
        reward: 60,
    },

    // ── Level 3: Zahrada Krácení ─────────────────────────────────────────
    // Layout: two hedge rows (6, 12) divide the map into 3 garden zones.
    // Main alley: row 9 (horizontal, cols 1-22) → col 22 (vertical, rows 2-9) → gate (22,2).
    // Flower beds (intentionally empty): upper zone cols 4-10 & 13-19, lower zone same.
    {
        name: 'Zahrada Krácení',
        bgColor: 0x1a2a10,
        map: [
        //   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
            [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 0
            [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 1
            [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 2  ← gate (22,2)
            [T, G, T, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, T, P, G, G, G, G, G, G, T], // 3
            [T, G, T, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, T, P, G, T, T, G, G, G, T], // 4
            [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, T, T, G, G, G, T], // 5
            [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, P, T, T, T, T, T, T, T], // 6  ← hedge + path gap
            [T, G, T, T, G, G, G, T, T, G, G, G, T, T, G, G, G, T, T, G, G, G, P, G, G, G, T, T, G, T], // 7  ← tree alley
            [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 8
            [T, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G, G, G, G, G, G, T], // 9  ← main path + player (1,9)
            [T, G, T, T, G, G, G, T, T, G, G, G, T, T, G, G, G, T, T, G, G, G, G, G, G, G, T, T, G, T], // 10 ← tree alley (mirror of 7)
            [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T], // 11
            [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, G, T, T, T, T, T, T, T], // 12 ← lower hedge
            [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T], // 13
            [T, G, T, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, T, G, G, G, G, G, G, G, T], // 14
            [T, G, T, T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T, T, G, G, G, G, G, G, G, T], // 15
            [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T], // 16
            [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T], // 17
            [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 18
            [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 19
        ],
        playerStart: { x: 1, y: 9 },
        gate: { x: 22, y: 2 },
        enemies: [
            { x:  8, y:  3, type: 'goblin', level: 3, name: 'Nafouklý Zlomek' },
            { x: 14, y:  5, type: 'goblin', level: 3, name: 'Nafouklý Zlomek' },
            { x:  5, y: 10, type: 'orc',   level: 3, name: 'Keřový Strašák' },
            { x: 15, y: 11, type: 'orc',   level: 3, name: 'Keřový Strašák' },
            { x: 19, y:  8, type: 'orc',   level: 3, name: 'Přerostlý Goblin' },
        ],
        npcs: [{
            x: 11, y: 10,
            name: 'Čaroděj kalkulátor',
            message: '„Pozor, tato monstra jsou zbytečně nafouklá! Musíš je zkrátit na základní tvar. Např. 4/8 = 1/2"',
        }],
        props: [
            // ── Horní sekce (řady 2-5): kytky, borovice a příroda ──
            { x:  4, y: 2, key: 'fd_flower3', scale: 2, depth: 2 },
            { x:  7, y: 2, key: 'fd_flower1', scale: 2, depth: 2 },
            { x: 11, y: 2, key: 'fd_flower4', scale: 2, depth: 2 },
            { x: 14, y: 2, key: 'fd_flower2', scale: 2, depth: 2 },
            { x: 17, y: 2, key: 'fd_flower3', scale: 2, depth: 2 },

            { x:  4, y: 3, key: 'fd_flower1', scale: 2, depth: 2 },
            { x:  6, y: 3, key: 'fd_flower4', scale: 2, depth: 2 },
            { x:  8, y: 3, key: 'fd_flower2', scale: 2, depth: 2 },
            { x: 10, y: 3, key: 'fd_flower3', scale: 2, depth: 2 },
            { x: 13, y: 3, key: 'fd_flower1', scale: 2, depth: 2 },
            { x: 15, y: 3, key: 'fd_flower4', scale: 2, depth: 2 },
            { x: 17, y: 3, key: 'fd_flower2', scale: 2, depth: 2 },
            { x: 19, y: 3, key: 'fd_flower3', scale: 2, depth: 2 },

            { x:  4, y: 4, key: 'fd_flower2', scale: 2, depth: 2 },
            { x:  7, y: 4, key: 'fd_flower3', scale: 2, depth: 2 },
            { x:  9, y: 4, key: 'fd_flower1', scale: 2, depth: 2 },
            { x: 12, y: 4, key: 'fd_flower4', scale: 2, depth: 2 },
            { x: 14, y: 4, key: 'fd_flower2', scale: 2, depth: 2 },
            { x: 16, y: 4, key: 'fd_flower1', scale: 2, depth: 2 },
            { x: 18, y: 4, key: 'fd_flower3', scale: 2, depth: 2 },

            { x:  5, y: 5, key: 'fd_flower4', scale: 2, depth: 2 },
            { x:  7, y: 5, key: 'fd_flower1', scale: 2, depth: 2 },
            { x: 10, y: 5, key: 'fd_flower2', scale: 2, depth: 2 },
            { x: 12, y: 5, key: 'fd_flower3', scale: 2, depth: 2 },
            { x: 15, y: 5, key: 'fd_flower4', scale: 2, depth: 2 },
            { x: 18, y: 5, key: 'fd_flower1', scale: 2, depth: 2 },

            // ── Borovice v horní zóně ──
            { x:  3, y: 2, key: 'pt_pinetree_v2', scale: 1.6, depth: 2 },
            { x:  9, y: 2, key: 'pt_pinetree_v1', scale: 1.4, depth: 2 },
            { x: 20, y: 2, key: 'pt_pinetree_v2', scale: 1.6, depth: 2 },
            { x:  5, y: 3, key: 'pt_pinetree_v1', scale: 1.4, depth: 2 },
            { x: 11, y: 3, key: 'pt_pinetree_v2', scale: 1.6, depth: 2 },
            { x: 18, y: 3, key: 'pt_bigbush_v1',  scale: 1.5, depth: 2 },
            { x:  6, y: 4, key: 'pt_pinetree_v1', scale: 1.4, depth: 2 },
            { x: 19, y: 4, key: 'pt_pinetree_v2', scale: 1.6, depth: 2 },
            { x:  9, y: 5, key: 'pt_pinetree_v1', scale: 1.4, depth: 2 },
            { x: 13, y: 5, key: 'pt_bigmushroom',  scale: 1.5, depth: 2 },

            // ── Dolní sekce (řady 13-17): kytky, borovice a příroda ──
            { x:  4, y: 13, key: 'fd_flower2', scale: 2, depth: 2 },
            { x:  7, y: 13, key: 'fd_flower4', scale: 2, depth: 2 },
            { x: 10, y: 13, key: 'fd_flower1', scale: 2, depth: 2 },
            { x: 13, y: 13, key: 'fd_flower3', scale: 2, depth: 2 },
            { x: 16, y: 13, key: 'fd_flower2', scale: 2, depth: 2 },
            { x: 19, y: 13, key: 'fd_flower4', scale: 2, depth: 2 },

            { x:  4, y: 14, key: 'fd_flower3', scale: 2, depth: 2 },
            { x:  6, y: 14, key: 'fd_flower1', scale: 2, depth: 2 },
            { x:  9, y: 14, key: 'fd_flower4', scale: 2, depth: 2 },
            { x: 12, y: 14, key: 'fd_flower2', scale: 2, depth: 2 },
            { x: 15, y: 14, key: 'fd_flower3', scale: 2, depth: 2 },
            { x: 17, y: 14, key: 'fd_flower1', scale: 2, depth: 2 },

            { x:  4, y: 15, key: 'fd_flower1', scale: 2, depth: 2 },
            { x:  7, y: 15, key: 'fd_flower2', scale: 2, depth: 2 },
            { x: 10, y: 15, key: 'fd_flower4', scale: 2, depth: 2 },
            { x: 12, y: 15, key: 'fd_flower3', scale: 2, depth: 2 },
            { x: 16, y: 15, key: 'fd_flower1', scale: 2, depth: 2 },
            { x: 18, y: 15, key: 'fd_flower2', scale: 2, depth: 2 },

            { x:  5, y: 16, key: 'fd_flower4', scale: 2, depth: 2 },
            { x:  8, y: 16, key: 'fd_flower2', scale: 2, depth: 2 },
            { x: 11, y: 16, key: 'fd_flower3', scale: 2, depth: 2 },
            { x: 14, y: 16, key: 'fd_flower1', scale: 2, depth: 2 },
            { x: 17, y: 16, key: 'fd_flower4', scale: 2, depth: 2 },
            { x: 20, y: 16, key: 'fd_flower2', scale: 2, depth: 2 },

            { x:  5, y: 17, key: 'fd_flower1', scale: 2, depth: 2 },
            { x:  9, y: 17, key: 'fd_flower3', scale: 2, depth: 2 },
            { x: 13, y: 17, key: 'fd_flower2', scale: 2, depth: 2 },
            { x: 17, y: 17, key: 'fd_flower4', scale: 2, depth: 2 },
            { x: 21, y: 17, key: 'fd_flower3', scale: 2, depth: 2 },

            // ── Borovice v dolní zóně ──
            { x:  2, y: 13, key: 'pt_pinetree_v1', scale: 1.4, depth: 2 },
            { x:  9, y: 13, key: 'pt_pinetree_v2', scale: 1.6, depth: 2 },
            { x: 18, y: 13, key: 'pt_pinetree_v1', scale: 1.4, depth: 2 },
            { x: 21, y: 13, key: 'pt_bigbush_v2',  scale: 1.5, depth: 2 },
            { x:  7, y: 14, key: 'pt_pinetree_v2', scale: 1.6, depth: 2 },
            { x: 19, y: 14, key: 'pt_pinetree_v1', scale: 1.4, depth: 2 },
            { x:  5, y: 15, key: 'pt_pinetree_v2', scale: 1.6, depth: 2 },
            { x: 13, y: 15, key: 'pt_pinetree_v1', scale: 1.4, depth: 2 },
            { x:  9, y: 16, key: 'pt_pinetree_v2', scale: 1.6, depth: 2 },
            { x: 19, y: 16, key: 'pt_pinetree_v1', scale: 1.4, depth: 2 },
            { x:  7, y: 17, key: 'pt_bigmushroom',  scale: 1.5, depth: 2 },
            { x: 14, y: 17, key: 'pt_bigbush_v1',  scale: 1.5, depth: 2 },

            // ── Keře podél horního živého plotu (řada 5, těsně před plotem) ──
            { x:  1, y: 5, key: 'pb_bush1_green',  scale: 0.9, depth: 2 },
            { x:  5, y: 5, key: 'pb_bush10_red',   scale: 1.1, depth: 2 },
            { x:  8, y: 5, key: 'pb_bush3_green',  scale: 0.9, depth: 2 },
            { x: 11, y: 5, key: 'pb_bush10_yellow',scale: 1.1, depth: 2 },
            { x: 14, y: 5, key: 'pb_bush1_red',    scale: 0.9, depth: 2 },
            { x: 17, y: 5, key: 'pb_bush3_red',    scale: 0.9, depth: 2 },
            { x: 20, y: 5, key: 'pb_bush10_green', scale: 1.1, depth: 2 },

            // ── Keře podél dolního živého plotu (řada 11, těsně před plotem) ──
            { x:  1, y: 11, key: 'pb_bush10_yellow',scale: 1.1, depth: 2 },
            { x:  5, y: 11, key: 'pb_bush1_teal',   scale: 0.9, depth: 2 },
            { x:  8, y: 11, key: 'pb_bush10_red',   scale: 1.1, depth: 2 },
            { x: 11, y: 11, key: 'pb_bush3_green',  scale: 0.9, depth: 2 },
            { x: 14, y: 11, key: 'pb_bush1_green',  scale: 0.9, depth: 2 },
            { x: 17, y: 11, key: 'pb_bush10_green', scale: 1.1, depth: 2 },
            { x: 20, y: 11, key: 'pb_bush3_red',    scale: 0.9, depth: 2 },

            // ── Keře v alejích (řady 7 a 10, mezi stromy) ──
            { x:  5, y:  7, key: 'pb_bush10_green', scale: 1.0, depth: 2 },
            { x: 11, y:  7, key: 'pb_bush10_red',   scale: 1.0, depth: 2 },
            { x: 16, y:  7, key: 'pb_bush10_yellow',scale: 1.0, depth: 2 },
            { x:  5, y: 10, key: 'pb_bush10_yellow',scale: 1.0, depth: 2 },
            { x: 11, y: 10, key: 'pb_bush10_green', scale: 1.0, depth: 2 },
            { x: 16, y: 10, key: 'pb_bush10_red',   scale: 1.0, depth: 2 },

            // ── Keře na okrajích dolní zahrady ──
            { x:  1, y: 14, key: 'pb_bush1_green',  scale: 0.9, depth: 2 },
            { x:  1, y: 16, key: 'pb_bush3_red',    scale: 0.9, depth: 2 },
            { x: 22, y: 14, key: 'pb_bush1_teal',   scale: 0.9, depth: 2 },
            { x: 22, y: 16, key: 'pb_bush10_yellow',scale: 1.1, depth: 2 },

            // Pařezy u křižovatky cesty
            { x: 23, y:  8, key: 'fd_stump1',    scale: 2, depth: 2 },
            { x: 25, y: 11, key: 'fd_stump2',    scale: 2, depth: 2 },
        ],
        reward: 70,
    },

    // ── Level 4: Pevnost Společného Jmenovatele ──────────────────────────
    {
        name: 'Pevnost Společného Jmenovatele',
        bgColor: 0x0d1a0d,
        map: [
        //   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
            [T, T, T, T, T, T, T, T, T, T, T, B, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 0
            [T, T, T, T, T, T, T, T, T, T, T, B, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 1
            [T, G, G, G, G, G, G, G, G, G, G, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T], // 2
            [T, G, G, G, G, G, G, G, G, G, G, B, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 3
            [T, G, G, G, G, G, G, G, G, G, G, B, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 4
            [T, G, G, G, G, G, G, G, G, G, G, B, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 5
            [T, G, G, G, G, G, G, G, G, G, G, B, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 6
            [T, G, G, G, G, G, G, G, G, G, G, B, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 7
            [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 8
            [T, G, G, G, G, G, G, G, G, G, G, G, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, P, G, T], // 9  hlavní cesta
            [T, G, G, G, G, G, G, G, G, G, G, G, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 10
            [T, G, G, G, G, G, G, G, G, G, G, B, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 11
            [T, G, G, G, G, G, G, G, G, G, G, B, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 12
            [T, G, G, G, G, G, G, G, G, G, G, B, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 13
            [T, G, G, G, G, G, G, G, G, G, G, B, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 14
            [T, G, G, G, G, G, G, G, G, G, G, B, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 15
            [T, G, G, G, G, G, G, G, G, G, G, B, G, G, G, P, G, G, G, G, G, G, P, G, G, G, G, G, G, T], // 16
            [T, G, G, G, G, G, G, G, G, G, G, B, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, T], // 17
            [T, T, T, T, T, T, T, T, T, T, T, B, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 18
            [T, T, T, T, T, T, T, T, T, T, T, B, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T], // 19
        ],
        playerStart: { x: 1, y: 9 },
        gate: { x: 25, y: 9 },
        enemies: [
            { x: 14, y:  9, type: 'goblin', level: 4, name: 'Lesní Goblin' },
            { x: 20, y:  7, type: 'goblin', level: 4, name: 'Lesní Goblin' },
            { x: 16, y:  4, type: 'orc',   level: 4, name: 'Lesní Troll' },
            { x: 20, y: 14, type: 'orc',   level: 4, name: 'Lesní Troll' },
            { x: 24, y: 11, type: 'orc',   level: 4, name: 'Výsadkový Strážce' },
        ],
        npcs: [
            {
                x: 10, y: 11,
                name: 'Čaroděj kalkulátor',
                message: '„Pevnost se otevře, až vyřešíš příklady na krácení zlomků u monster v lese!"',
            },
            {
                x: 18, y: 12,
                name: 'Goblin Kuchař',
                type: 'shop',
                sprite: 'goblin_worker',
                frame: 7,
                shopTitle: 'Krčma U Grilu',
                shopItems: [
                    { id: 'hp_potion', label: 'Lektvar HP +30', cost: 30, effect: 'hp',  value: 30 },
                    { id: 'shield',    label: 'Štít   DEF +5',  cost: 50, effect: 'def', value: 5  },
                ],
                wanderCX: 18, wanderCY: 12, wanderR: 0,
            },
        ],
        props: [
            // ── Vnější hradba (sloupec 11, řady 0-19) ────────────────────────
            { x: 11, y:  0, key: 'cw_wall2',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y:  1, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y:  2, key: 'cw_wall2',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y:  3, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y:  4, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y:  5, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y:  6, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y:  7, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y:  8, key: 'cw_last1',  scale: 1, depth: 15, angle: 90 },
            { x: 11, y:  9, key: 'cw_door',   scale: 1, depth: 15, angle: 90 },
            { x: 11, y: 10, key: 'cw_last2',  scale: 1, depth: 15, angle: 90 },
            { x: 11, y: 11, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y: 12, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y: 13, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y: 14, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y: 15, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y: 16, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y: 17, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y: 18, key: 'cw_wall1',  scale: 1, depth: 15, collide: true, angle: 90 },
            { x: 11, y: 19, key: 'cw_wall2',  scale: 1, depth: 15, collide: true, angle: 90 },

            // ── Budovy vesnice ────────────────────────────────────────────────
            { x: 13, y:  7, key: 'vb_1', scale: 1.5, depth: 8, collide: true, bodyW: 120, bodyH: 120, bodyOffY: -20 },
            { x: 19, y:  5, key: 'vb_2', scale: 1.4, depth: 8, collide: true, bodyW: 175, bodyH: 140, bodyOffY: -30 },
            { x: 19, y: 13, key: 'vb_3', scale: 1.4, depth: 8, collide: true, bodyW: 220, bodyH: 140, bodyOffY: -30 },
            { x: 26, y:  7, key: 'vb_1', scale: 1.4, depth: 8, collide: true, bodyW: 112, bodyH: 120, bodyOffY: -20 },
            { x: 26, y: 13, key: 'vb_1', scale: 1.4, depth: 8, collide: true, bodyW: 112, bodyH: 120, bodyOffY: -20 },

            // ── Campfire (křižovatka sever) ───────────────────────────────────
            { x: 21, y:  7, key: 'campfire', scale: 1.8, depth: 6, anim: 'campfire_burn' },

            // ── Gril s gobliným kuchařem ──────────────────────────────────────
            { x: 17, y: 12, key: 'grill', frame: 0, scale: 2.0, depth: 6, anim: 'grill_sizzle', collide: true, bodyW: 80, bodyH: 28 },

            // ── Stromy a keře u budov ─────────────────────────────────────────
            { x: 24, y:  3, key: 'pt_pinetree_v1', scale: 1.4, depth: 2 },
            { x: 28, y:  3, key: 'pt_pinetree_v2', scale: 1.3, depth: 2 },
            { x: 24, y: 15, key: 'pt_pinetree_v1', scale: 1.3, depth: 2 },
            { x: 28, y: 15, key: 'pt_pinetree_v2', scale: 1.4, depth: 2 },
            { x: 13, y: 14, key: 'pt_bigbush_v1',  scale: 1.0, depth: 2 },
            { x: 21, y: 15, key: 'pt_bigbush_v2',  scale: 1.0, depth: 2 },

            // ── Květiny a drobné dekorace ─────────────────────────────────────
            { x: 14, y:  8, key: 'fd_flower2',      scale: 2.2, depth: 2 },
            { x: 16, y:  6, key: 'fd_flower4',      scale: 2.0, depth: 2 },
            { x: 20, y:  7, key: 'fd_flower1',      scale: 2.2, depth: 2 },
            { x: 24, y:  7, key: 'fd_flower3',      scale: 2.0, depth: 2 },
            { x: 16, y: 11, key: 'fd_flower2',      scale: 2.0, depth: 2 },
            { x: 20, y: 11, key: 'fd_flower4',      scale: 2.2, depth: 2 },
            { x: 24, y: 11, key: 'fd_flower1',      scale: 2.0, depth: 2 },
            { x: 13, y:  3, key: 'fd_tuft1',        scale: 2.5, depth: 2 },
            { x: 17, y:  3, key: 'fd_tuft2',        scale: 2.5, depth: 2 },

            // ── Keře podél cest ───────────────────────────────────────────────
            { x: 12, y:  7, key: 'pb_bush1_green',  scale: 1.0, depth: 2 },
            { x: 12, y: 11, key: 'pb_bush1_teal',   scale: 1.0, depth: 2 },
            { x: 23, y: 14, key: 'pb_bush10_yellow',scale: 1.0, depth: 2 },
            { x: 16, y: 14, key: 'pb_bush1_red',    scale: 0.9, depth: 2 },
            { x: 16, y:  4, key: 'pb_bush10_green', scale: 0.9, depth: 2 },

            // ── Houbičky a pařezy ─────────────────────────────────────────────
            { x: 14, y: 16, key: 'fd_mushroom1',    scale: 2.5, depth: 2 },
            { x: 20, y: 16, key: 'cd_mushroom2',    scale: 2.5, depth: 2 },
            { x: 27, y:  7, key: 'fd_stump1',       scale: 2.2, depth: 2 },
            { x: 27, y: 11, key: 'fd_stump2',       scale: 2.2, depth: 2 },
        ],
        reward: 80,
    },

    // ── Level 5: Věž Mysli (Cesta k věži) ──────────────────────────────────
    {
        name: 'Věž Mysli',
        map: [
            [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,P,P,P,P,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,P,P,P,P,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,P,P,P,P,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,P,P,P,P,G,G,G,G,G,T],
            [T,G,G,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,P,G,G,P,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,P,G,G,P,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,P,G,G,P,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,P,G,G,P,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,P,P,P,P,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,G,G,G,G,G,G,T],
            [T,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,T,T,G,G,G,G,G,G,G,G,G,T],
            [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
            [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
        ],
        playerStart: { x: 2, y: 2 },
        gate: { x: 27, y: 5 },
        enemies: [
            { x: 5, y: 8, type: 'goblin', level: 5, name: 'Lesní Strážce' },
            { x: 10, y: 6, type: 'goblin', level: 5, name: 'Lesní Strážce' },
            { x: 7, y: 12, type: 'orc', level: 5, name: 'Lesní Vůdce' },
            { x: 12, y: 14, type: 'orc', level: 5, name: 'Lesní Vůdce' },
            { x: 26, y: 14, type: 'boss', level: 5, name: 'Válečník Věže' },
        ],
        npcs: [
            {
                x: 3, y: 6,
                name: 'Čaroděj kalkulátor',
                message: '„Jsi připraven? Ve věži by měla být princezna, ale ještě pro ni budeš muset bojovat. Tvoji poslední zkouškou bude tvůj největší nepřítel. Nejdřív poraz všechny střežící věž a pak pokračuj za princeznou. Držím ti palce!"',
            },
            {
                x: 25, y: 3,
                name: 'Princezna',
                type: 'princess',
                sprite: 'princess_idle',
                anim: 'princess_idle',
            },
        ],
        props: [
            // Campfire u spawn
            { x: 2, y: 3, key: 'campfire', anim: 'campfire_burn', scale: 1.6, depth: 6 },

            // Věž nahoru na travu do rohu
            { x: 27, y: 2, key: 'tower', scale: 0.8, depth: 8, collide: true, bodyW: 100, bodyH: 120 },
        ],
    },

];
