const RED_ENEMY_UNITS = {
    pawn:    { idle: 'enemy_pawn_idle',    run: 'enemy_pawn_run',    idleFrames: 8, runFrames: 6 },
    warrior: { idle: 'enemy_warrior_idle', run: 'enemy_warrior_run', idleFrames: 8, runFrames: 6 },
    archer:  { idle: 'enemy_archer_idle',  run: 'enemy_archer_run',  idleFrames: 6, runFrames: 4 },
    lancer:  { idle: 'enemy_lancer_idle',  run: 'enemy_lancer_run',  idleFrames: 12, runFrames: 6 },
    monk:    { idle: 'enemy_monk_idle',    run: 'enemy_monk_run',    idleFrames: 6, runFrames: 4 },
};

export default class PreloadScene extends Phaser.Scene {
    constructor() { super({ key: 'PreloadScene' }); }

    preload() {
        this.load.spritesheet('warrior_idle',   'assets/warrior/Warrior_Idle.png',    { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('warrior_run',    'assets/warrior/Warrior_Run.png',     { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('warrior_attack', 'assets/warrior/Warrior_Attack1.png', { frameWidth: 192, frameHeight: 192 });
        this.load.image('parchment', 'assets/quest-parchment.png');
        this.load.image('btn_blue',         'assets/buttons/btn_blue.png');
        this.load.image('btn_blue_pressed', 'assets/buttons/btn_blue_pressed.png');
        this.load.image('btn_red',          'assets/buttons/btn_red.png');
        this.load.image('btn_red_pressed',  'assets/buttons/btn_red_pressed.png');
        // Wizard NPC spritesheet (5 idle frames, 64x64 each)
        this.load.spritesheet('wizard_idle', 'assets/wizard/wizard_idle.png', { frameWidth: 64, frameHeight: 64 });
        // Cook NPC spritesheet (5 idle frames, 64x64 each)
        this.load.spritesheet('cook_idle', 'assets/cook_idle.png', { frameWidth: 64, frameHeight: 64 });
        // Goblin worker shop NPC (48x48 frames, 7 cols x 6 rows)
        this.load.spritesheet('goblin_worker', 'assets/goblin_worker.png', { frameWidth: 48, frameHeight: 48 });
        // Tiny Swords terrain tiles (64x64 native)
        this.load.image('ts_grass',  'assets/tiles/ts_grass.png');
        this.load.image('ts_path',   'assets/tiles/ts_path.png');
        this.load.image('ts_water',  'assets/tiles/ts_water.png');
        // Tiny Swords trees
        this.load.image('ts_tree1',  'assets/tiles/ts_tree1.png');
        this.load.image('ts_tree2',  'assets/tiles/ts_tree2.png');
        this.load.image('ts_tree3',  'assets/tiles/ts_tree3.png');
        this.load.image('ts_tree4',  'assets/tiles/ts_tree4.png');
        // Decorations
        this.load.image('ts_bush1',  'assets/tiles/ts_bush1.png');
        this.load.image('ts_bush2',  'assets/tiles/ts_bush2.png');
        this.load.image('ts_bush3',  'assets/tiles/ts_bush3.png');
        this.load.image('ts_bush4',  'assets/tiles/ts_bush4.png');
        this.load.image('ts_rock1',  'assets/tiles/ts_rock1.png');
        this.load.image('ts_rock2',  'assets/tiles/ts_rock2.png');
        this.load.image('ts_rock3',  'assets/tiles/ts_rock3.png');
        this.load.image('ts_rock4',  'assets/tiles/ts_rock4.png');

        // Red units used as enemy variants in overworld and battle
        this.load.spritesheet('enemy_pawn_idle',    'assets/enemy_units/Pawn_Idle.png',    { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('enemy_pawn_run',     'assets/enemy_units/Pawn_Run.png',     { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('enemy_warrior_idle', 'assets/enemy_units/Warrior_Idle.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('enemy_warrior_run',  'assets/enemy_units/Warrior_Run.png',  { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('enemy_archer_idle',  'assets/enemy_units/Archer_Idle.png',  { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('enemy_archer_run',   'assets/enemy_units/Archer_Run.png',   { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('enemy_lancer_idle',  'assets/enemy_units/Lancer_Idle.png',  { frameWidth: 320, frameHeight: 320 });
        this.load.spritesheet('enemy_lancer_run',   'assets/enemy_units/Lancer_Run.png',   { frameWidth: 320, frameHeight: 320 });
        this.load.spritesheet('enemy_monk_idle',    'assets/enemy_units/Monk_Idle.png',    { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('enemy_monk_run',     'assets/enemy_units/Monk_Run.png',     { frameWidth: 192, frameHeight: 192 });
        // Blue portal gate (8 frames, 64x64 each, horizontal strip)
        this.load.spritesheet('portal', 'assets/portal.png', { frameWidth: 64, frameHeight: 64 });
        // BBQ grill decoration (4 frames, 80x64 each)
        this.load.spritesheet('grill', 'assets/grill.png', { frameWidth: 80, frameHeight: 64 });
    }

    create() {
        this.anims.create({ key: 'warrior_idle',   frames: this.anims.generateFrameNumbers('warrior_idle',   { start: 0, end: 7 }), frameRate: 6,  repeat: -1 });
        this.anims.create({ key: 'warrior_run',    frames: this.anims.generateFrameNumbers('warrior_run',    { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'warrior_attack', frames: this.anims.generateFrameNumbers('warrior_attack', { start: 0, end: 3 }), frameRate: 8,  repeat: 0  });
        this.anims.create({ key: 'wizard_idle',    frames: this.anims.generateFrameNumbers('wizard_idle',    { start: 0, end: 4 }), frameRate: 5,  repeat: -1 });
        this.anims.create({ key: 'cook_idle',     frames: this.anims.generateFrameNumbers('cook_idle',      { start: 0, end: 4 }), frameRate: 5,  repeat: -1 });
        this.anims.create({ key: 'portal_spin',   frames: this.anims.generateFrameNumbers('portal',         { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'grill_sizzle', frames: this.anims.generateFrameNumbers('grill',           { start: 0, end: 3 }), frameRate: 5,  repeat: -1 });

        Object.entries(RED_ENEMY_UNITS).forEach(([unit, cfg]) => {
            const idleAnim = `enemy_${unit}_idle_anim`;
            const runAnim = `enemy_${unit}_run_anim`;

            if (!this.anims.exists(idleAnim)) {
                this.anims.create({
                    key: idleAnim,
                    frames: this.anims.generateFrameNumbers(cfg.idle, { start: 0, end: cfg.idleFrames - 1 }),
                    frameRate: 6,
                    repeat: -1,
                });
            }

            if (!this.anims.exists(runAnim)) {
                this.anims.create({
                    key: runAnim,
                    frames: this.anims.generateFrameNumbers(cfg.run, { start: 0, end: cfg.runFrames - 1 }),
                    frameRate: 10,
                    repeat: -1,
                });
            }
        });

        this.createTiles();
        this.createCharacters();
        this.scene.start('MenuScene');
    }

    createTiles() {
        const g = this.add.graphics();

        // Grass
        g.fillStyle(0x4a7c59); g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x3d6b4b); g.fillRect(0, 0, 1, 32); g.fillRect(0, 0, 32, 1);
        g.generateTexture('grass', 32, 32); g.clear();

        // Tree
        g.fillStyle(0x1a3a0a); g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x2d6614); g.fillCircle(16, 13, 11);
        g.fillStyle(0x5a3a1a); g.fillRect(13, 22, 6, 10);
        g.generateTexture('tree', 32, 32); g.clear();

        // Path
        g.fillStyle(0xc4a35a); g.fillRect(0, 0, 32, 32);
        g.fillStyle(0xb8944e); g.fillRect(0, 0, 32, 1); g.fillRect(0, 0, 1, 32);
        g.generateTexture('path', 32, 32); g.clear();

        // Water
        g.fillStyle(0x1a55bb); g.fillRect(0, 0, 32, 32);
        g.fillStyle(0x2266cc); g.fillRect(3, 8, 26, 4); g.fillRect(1, 20, 30, 4);
        g.generateTexture('water', 32, 32); g.clear();

        g.destroy();
    }

    createCharacters() {
        const g = this.add.graphics();

        // Player - knight (blue armor)
        this.drawKnight(g, 'player', 0x3a80cc, 0x1a50aa);

        // Goblin - small green creature
        this.drawEnemy(g, 'goblin', 0x55aa22, 0x336611, 0x22ee00);
        // Orc - large brown brute
        this.drawEnemy(g, 'orc', 0x8b5a14, 0x5a3a00, 0xff6600);
        // Dragon - red beast
        this.drawEnemy(g, 'dragon', 0xcc2222, 0x881111, 0xff8800);

        this.drawBoss(g, 'boss');
        this.drawGate(g, 'gate_closed', 0x553311, false);
        this.drawGate(g, 'gate_open',   0xffcc44, true);
        this.drawNPC(g, 'npc', 0xdd9922);

        g.destroy();
    }

    drawKnight(g, key, body, shadow) {
        g.clear();
        // Legs
        g.fillStyle(shadow); g.fillRect(9, 22, 6, 9); g.fillRect(17, 22, 6, 9);
        // Body armor
        g.fillStyle(body); g.fillRect(8, 12, 16, 12);
        // Shoulder pads
        g.fillStyle(shadow); g.fillRect(5, 12, 5, 6); g.fillRect(22, 12, 5, 6);
        // Head
        g.fillStyle(0xffc8a0); g.fillRect(11, 5, 10, 8);
        // Helmet
        g.fillStyle(shadow); g.fillRect(10, 3, 12, 6);
        // Visor
        g.fillStyle(0x88aacc); g.fillRect(12, 6, 8, 3);
        // Sword
        g.fillStyle(0xdddddd); g.fillRect(25, 7, 3, 18);
        g.fillStyle(0xcc9900); g.fillRect(23, 13, 7, 3);
        // Shield
        g.fillStyle(body); g.fillRect(1, 13, 8, 11);
        g.fillStyle(0xffdd00); g.fillRect(3, 15, 4, 7);
        g.generateTexture(key, 32, 32);
    }

    drawEnemy(g, key, body, shadow, eye) {
        g.clear();
        // Feet
        g.fillStyle(shadow); g.fillRect(7, 24, 7, 8); g.fillRect(18, 24, 7, 8);
        // Body
        g.fillStyle(body); g.fillRect(7, 12, 18, 14);
        // Head
        g.fillRect(9, 4, 14, 10);
        // Eyes
        g.fillStyle(eye); g.fillRect(11, 7, 4, 4); g.fillRect(18, 7, 4, 4);
        g.fillStyle(0x000000); g.fillRect(12, 8, 2, 2); g.fillRect(19, 8, 2, 2);
        // Arms
        g.fillStyle(shadow); g.fillRect(2, 13, 6, 10); g.fillRect(24, 13, 6, 10);
        // Claws
        g.fillStyle(0x111111);
        g.fillRect(2, 22, 3, 4); g.fillRect(5, 22, 3, 4);
        g.fillRect(24, 22, 3, 4); g.fillRect(27, 22, 3, 4);
        g.generateTexture(key, 32, 32);
    }

    drawGate(g, key, color, open) {
        g.clear();
        g.fillStyle(0x442200); g.fillRect(0, 0, 32, 32);
        g.fillStyle(color);
        if (open) {
            g.fillRect(2, 2, 10, 28); g.fillRect(20, 2, 10, 28);
            g.fillRect(2, 2, 28, 6);
        } else {
            g.fillRect(2, 2, 28, 28);
            g.fillStyle(0x221100);
            for (let i = 0; i < 4; i++) g.fillRect(5 + i * 7, 5, 4, 22);
            g.fillStyle(0xffcc00); g.fillCircle(16, 16, 3);
        }
        g.generateTexture(key, 32, 32);
    }

    drawBoss(g, key) {
        g.clear();
        // Massive stone body
        g.fillStyle(0x556677); g.fillRect(4, 8, 24, 22);
        // Head
        g.fillStyle(0x445566); g.fillRect(6, 2, 20, 10);
        // Glowing eyes
        g.fillStyle(0xff6600); g.fillRect(9, 5, 5, 5); g.fillRect(18, 5, 5, 5);
        g.fillStyle(0xffaa00); g.fillRect(10, 6, 3, 3); g.fillRect(19, 6, 3, 3);
        // Cracks
        g.fillStyle(0x223344); g.fillRect(13, 10, 2, 8); g.fillRect(18, 14, 2, 6);
        // Arms
        g.fillStyle(0x445566); g.fillRect(0, 10, 5, 14); g.fillRect(27, 10, 5, 14);
        // Fists
        g.fillStyle(0x334455); g.fillRect(0, 22, 6, 6); g.fillRect(26, 22, 6, 6);
        g.generateTexture(key, 32, 32);
    }

    drawNPC(g, key, color) {
        g.clear();
        // Robe
        g.fillStyle(color); g.fillRect(9, 12, 14, 18);
        // Head
        g.fillStyle(0xffc8a0); g.fillRect(11, 4, 10, 10);
        // Hat
        g.fillStyle(0xaa7700); g.fillRect(9, 2, 14, 4);
        // Eyes
        g.fillStyle(0x333333); g.fillRect(13, 7, 2, 2); g.fillRect(17, 7, 2, 2);
        // Staff
        g.fillStyle(0x885500); g.fillRect(25, 2, 3, 28);
        g.fillStyle(0x44aaff); g.fillCircle(26, 4, 4);
        g.generateTexture(key, 32, 32);
    }
}
