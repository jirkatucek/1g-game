// Tiles: 0=grass, 1=tree/wall, 2=path, 3=water
const G = 0, T = 1, P = 2, W = 3;

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
                name: 'Lesní Mudrc',
                message: '„Vítej v Lesní stezce! Každá příšera tě zkouší ze zlomků. Piš odpovědi jako 3/4. Poraz 5 příšer a pak najdi cestu k bráně!"',
            },
            {
                x: 13, y: 2,
                name: 'Goblin Kuchař',
                type: 'shop',
                sprite: 'goblin_worker',
                anim: 'goblin_worker_idle',
                wanderCX: 13, wanderCY: 2, wanderR: 1,
            },
        ],
        props: [
            { x: 12, y: 2, key: 'grill', frame: 0, scale: 1.8, depth: 5, collide: true, bodyW: 72, bodyH: 28 },
        ],
        reward: 50,
    },

    // ── Level 2: Les Rozšiřování ─────────────────────────────────────────
    {
        name: 'Les Rozšiřování',
        bgColor: 0x0d1a0d,
        map: makeMap('forest'),
        playerStart: { x: 2, y: 2 },
        gate: { x: 22, y: 12 },
        enemies: [
            { x: 5,  y: 3, type: 'goblin', level: 2, name: 'Větvičník' },
            { x: 12, y: 4, type: 'goblin', level: 2, name: 'Větvičník' },
            { x: 7,  y: 7, type: 'orc',   level: 2, name: 'Kmenový Troll' },
            { x: 14, y: 7, type: 'orc',   level: 2, name: 'Kmenový Troll' },
            { x: 17, y: 9, type: 'orc',   level: 2, name: 'Lesní Hlídač' },
        ],
        npcs: [{
            x: 3, y: 3,
            name: 'Dřevorubec',
            message: '„Tady stromy rostou do šířky! Musíš zlomek správně rozšířit – vynásob vršek i spodek stejným číslem!"',
        }],
    },

    // ── Level 3: Zahrada Krácení ─────────────────────────────────────────
    {
        name: 'Zahrada Krácení',
        bgColor: 0x1a2a10,
        map: makeMap('village'),
        playerStart: { x: 2, y: 2 },
        gate: { x: 24, y: 13 },
        enemies: [
            { x: 10, y: 5, type: 'goblin', level: 3, name: 'Nafouklý Zlomek' },
            { x: 14, y: 6, type: 'goblin', level: 3, name: 'Nafouklý Zlomek' },
            { x: 7,  y: 10, type: 'orc',   level: 3, name: 'Keřový Strašák' },
            { x: 13, y: 11, type: 'orc',   level: 3, name: 'Keřový Strašák' },
            { x: 20, y: 8,  type: 'orc',   level: 3, name: 'Přerostlý Goblin' },
        ],
        npcs: [{
            x: 5, y: 5,
            name: 'Zahradník s nůžkami',
            message: '„Pozor, tato monstra jsou zbytečně nafouklá! Musíš je zkrátit na základní tvar. Např. 4/8 = 1/2"',
        }],
    },

    // ── Level 4: Břeh Řeky Jmenovatelů ──────────────────────────────────
    {
        name: 'Břeh Řeky Jmenovatelů',
        bgColor: 0x0a1a2e,
        map: makeMap('bridge'),
        playerStart: { x: 2, y: 2 },
        gate: { x: 26, y: 12 },
        enemies: [
            { x: 7,  y: 5, type: 'goblin', level: 4, name: 'Říční Duch' },
            { x: 12, y: 5, type: 'orc',    level: 4, name: 'Jmenovatelník' },
            { x: 17, y: 5, type: 'orc',    level: 4, name: 'Mostní Troll' },
            { x: 22, y: 5, type: 'dragon', level: 4, name: 'Mostní Troll' },
            { x: 26, y: 9, type: 'dragon', level: 4, name: 'Říční Démon' },
        ],
        npcs: [{
            x: 1, y: 1,
            name: 'Starý rybář',
            message: '„Na druhou stranu se nedostaneš, dokud nenajdeš společného jmenovatele! Najdi číslo, do kterého se vejdou oba spodky."',
        }],
    },

    // ── Level 5: Bažina Sčítání ──────────────────────────────────────────
    {
        name: 'Bažina Sčítání',
        bgColor: 0x0a1a0a,
        map: makeMap('forest'),
        playerStart: { x: 2, y: 2 },
        gate: { x: 22, y: 12 },
        enemies: [
            { x: 5,  y: 3, type: 'orc',    level: 5, name: 'Bahenní Duch' },
            { x: 10, y: 4, type: 'orc',    level: 5, name: 'Bahenní Duch' },
            { x: 7,  y: 7, type: 'dragon', level: 5, name: 'Mlžný Golem' },
            { x: 14, y: 7, type: 'dragon', level: 5, name: 'Mlžný Golem' },
            { x: 17, y: 9, type: 'dragon', level: 5, name: 'Bahenní Stvůra' },
        ],
        npcs: [{
            x: 3, y: 3,
            name: 'Žabí mudrc',
            message: '„Kvák! Sjednoť spodky a pak sečti vršky. Nenech se utopit v bahně! Např. 1/2 + 1/4 = 2/4 + 1/4 = 3/4"',
        }],
    },

    // ── Level 6: Hory Násobení ───────────────────────────────────────────
    {
        name: 'Hory Násobení',
        bgColor: 0x1a1a2a,
        map: makeMap('dungeon'),
        playerStart: { x: 2, y: 2 },
        gate: { x: 19, y: 10 },
        enemies: [
            { x: 5,  y: 3, type: 'orc',    level: 6, name: 'Skalní Troll' },
            { x: 5,  y: 6, type: 'orc',    level: 6, name: 'Skalní Troll' },
            { x: 9,  y: 5, type: 'dragon', level: 6, name: 'Horský Drak' },
            { x: 14, y: 6, type: 'dragon', level: 6, name: 'Horský Drak' },
            { x: 10, y: 8, type: 'dragon', level: 6, name: 'Ledový Golem' },
        ],
        npcs: [{
            x: 3, y: 3,
            name: 'Zrzavý horolezec',
            message: '„Nahoru to jde snadno! U násobení nepřemýšlej nad společným spodkem. Dej vršek s vrškem a spodek se spodkem! Např. 2/3 × 1/4 = 2/12 = 1/6"',
        }],
    },

    // ── Level 7: Jeskyně Převrácených hodnot ─────────────────────────────
    {
        name: 'Jeskyně Převrácených hodnot',
        bgColor: 0x0a0a1a,
        map: makeMap('dungeon'),
        playerStart: { x: 2, y: 2 },
        gate: { x: 19, y: 10 },
        enemies: [
            { x: 5,  y: 3, type: 'orc',    level: 7, name: 'Obrácený Duch' },
            { x: 5,  y: 6, type: 'orc',    level: 7, name: 'Obrácený Duch' },
            { x: 9,  y: 5, type: 'dragon', level: 7, name: 'Krystalový Stvůr' },
            { x: 14, y: 6, type: 'dragon', level: 7, name: 'Krystalový Stvůr' },
            { x: 10, y: 8, type: 'dragon', level: 7, name: 'Netopýří Golem' },
        ],
        npcs: [{
            x: 3, y: 3,
            name: 'Netopýr',
            message: '„Tady se ti zatočí hlava! Musíš se naučit věci obracet. Z čitatele jmenovatel a naopak! Např. 3/4 → 4/3"',
        }],
    },

    // ── Level 8: Propast Dělení ───────────────────────────────────────────
    {
        name: 'Propast Dělení',
        bgColor: 0x1a0a00,
        map: makeMap('bridge'),
        playerStart: { x: 2, y: 2 },
        gate: { x: 26, y: 12 },
        enemies: [
            { x: 7,  y: 5, type: 'orc',    level: 8, name: 'Lávový Troll' },
            { x: 12, y: 5, type: 'dragon', level: 8, name: 'Lávový Troll' },
            { x: 17, y: 5, type: 'dragon', level: 8, name: 'Propastný Drak' },
            { x: 22, y: 5, type: 'dragon', level: 8, name: 'Propastný Drak' },
            { x: 26, y: 9, type: 'dragon', level: 8, name: 'Ohnivý Golem' },
        ],
        npcs: [{
            x: 1, y: 1,
            name: 'Duch padlého rytíře',
            message: '„Dělení je zrádné! Pamatuj: první zlomek nech být a vynásob ho obráceným druhým zlomkem! Např. 1/2 ÷ 1/4 = 1/2 × 4/1 = 2"',
        }],
    },

    // ── Level 9: Kobky Smíšených čísel ───────────────────────────────────
    {
        name: 'Kobky Smíšených čísel',
        bgColor: 0x0a0a0a,
        map: makeMap('dungeon'),
        playerStart: { x: 2, y: 2 },
        gate: { x: 19, y: 10 },
        enemies: [
            { x: 5,  y: 3, type: 'orc',    level: 9, name: 'Smíšenec' },
            { x: 5,  y: 6, type: 'orc',    level: 9, name: 'Smíšenec' },
            { x: 9,  y: 5, type: 'dragon', level: 9, name: 'Kobkový Démon' },
            { x: 14, y: 6, type: 'dragon', level: 9, name: 'Kobkový Démon' },
            { x: 10, y: 8, type: 'dragon', level: 9, name: 'Zlomkový Golem' },
        ],
        npcs: [{
            x: 3, y: 3,
            name: 'Kostlivec v brnění',
            message: '„Skoro jsi u princezny! Tihle strážci jsou napůl celá čísla. Rozlož je na jeden velký zlomek! Např. 1 a 1/2 = 3/2"',
        }],
    },

    // ── Level 10: Věž – Finální souboj ───────────────────────────────────
    {
        name: 'Věž Princezny Algebry',
        bgColor: 0x1a1a2e,
        map: makeMap('tower'),
        playerStart: { x: 2, y: 2 },
        gate: null,
        enemies: [
            { x: 13, y: 6, type: 'boss', level: 10, name: 'Kalkulační Golem' },
        ],
        npcs: [{
            x: 24, y: 6,
            name: 'Princezna Algebra',
            message: '„Cože? Ty jsi prošel přes moji zlomkovou ochranku? Stvořila jsem ty příšery, abych měla klid! Ukaž, jestli zvládneš mého Golema – poraž ho správně 3× v řadě!"',
        }],
    },
];
