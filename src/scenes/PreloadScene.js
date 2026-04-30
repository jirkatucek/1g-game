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
        // Campfire decoration (9 frames, 50x86 each)
        this.load.spritesheet('campfire', 'assets/campfire.png', { frameWidth: 50, frameHeight: 86 });
        // Footsteps on grass
        this.load.audio('footsteps_grass', 'assets/sounds/footsteps_grass.mp3');
        ['click_1', 'click_2', 'click_3', 'click_4'].forEach((key, index) => {
            this.load.audio(key, `assets/sounds/click_${index + 1}.mp3`);
        });
        // Portal whoosh when entering the gate
        this.load.audio('portal_whoosh', 'assets/sounds/portal_whoosh.mp3');
        // Main theme
        this.load.audio('theme_adventure', 'assets/sounds/theme_adventure.mp3');
        // Victory sound
        this.load.audio('victory_win', 'assets/sounds/victory_win.mp3');
        // Lose/death sound
        this.load.audio('lose_sfx', 'assets/sounds/lose_sfx.mp3');
        // Coin animation spritesheet
        this.load.spritesheet('coin_tiles', 'assets/coin_tiles.png', { frameWidth: 16, frameHeight: 16 });
        // Cabin building
        this.load.image('cabin', 'assets/cabin.png');
        // Cabin woodland decorations
        ['rock1','rock2','mushroom1','mushroom2','grass1','grass2','tree_color'].forEach(k =>
            this.load.image(`cd_${k}`, `assets/cabin_deco/${k}.png`));
        // Forest Ground Details Pack (32×32) – garden decorations
        ['flower1','flower2','flower3','flower4','stump1','stump2','tuft1','tuft2','mushroom1','log1'].forEach(k =>
            this.load.image(`fd_${k}`, `assets/forest_deco/${k}.png`));
        // Pixel Art Bush Pack – garden bushes
        ['bush1_green','bush1_red','bush1_yellow','bush1_teal','bush3_green','bush3_red','bush10_green','bush10_red','bush10_yellow'].forEach(k =>
            this.load.image(`pb_${k}`, `assets/bushes/${k}.png`));
        // Village buildings (extracted from Pixel Lands Village Demo)
        this.load.image('vb_1', 'assets/village/building_1.png');
        this.load.image('vb_2', 'assets/village/building_2.png');
        this.load.image('vb_3', 'assets/village/building_3.png');
        this.load.image('tower', 'assets/tower.png');
        this.load.spritesheet('boss_idle', 'assets/boss_idle.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('boss_run', 'assets/boss_run.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('boss_death', 'assets/boss_death.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('princess', 'assets/princess.png');
        this.load.spritesheet('princess_idle', 'assets/princess_idle.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('princess_run', 'assets/princess_run.png', { frameWidth: 192, frameHeight: 192 });
        // Menu PNG assets
        this.load.image('menu_bg',       'assets/menu/background.png');
        this.load.image('menu_logo',     'assets/menu/logo.png');
        this.load.image('menu_subtitle', 'assets/menu/subtitle.png');
        this.load.image('menu_btn_hrat',      'assets/menu/btn_hrat.png');
        this.load.image('menu_btn_levely',    'assets/menu/btn_levely.png');
        this.load.image('menu_btn_nastaveni', 'assets/menu/btn_nastaveni.png');
        this.load.image('menu_btn_odejit',    'assets/menu/btn_odejit.png');
        this.load.image('menu_company',  'assets/menu/company_logo.png');
        this.load.image('menu_wasd',     'assets/menu/wasd.png');
        // Castle Walls Pack – fortress wall tiles (64×64)
        ['corner1','corner2','corner3','corner4','wall1','wall2','window1','window2',
         'vertical1','vertical2','vertical3','vertical4','door','last1','last2','twice1','twice2'].forEach(k =>
            this.load.image(`cw_${k}`, `assets/castle/Castle_${k}.png`));
        // Pine Tree Asset Pack – pine trees and nature decorations
        ['pinetree_v1','pinetree_v2','bigbush_v1','bigbush_v2','flower1','flower2','smallbush','bigmushroom'].forEach(k =>
            this.load.image(`pt_${k}`, `assets/pine_trees/${k}.png`));
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
        // Animated water background (8 frames, 64x64 each)
        this.load.spritesheet('water_anim', 'assets/tiles/water_anim.png', { frameWidth: 64, frameHeight: 64 });
        // Animated water rocks (16 frames, 64x64 each)
        this.load.spritesheet('water_rock1', 'assets/tiles/water_rock1.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('water_rock2', 'assets/tiles/water_rock2.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('water_rock3', 'assets/tiles/water_rock3.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('water_rock4', 'assets/tiles/water_rock4.png', { frameWidth: 64, frameHeight: 64 });

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
        // 2-Tone Pixel Grass Tufts (Small) – decorative overlays on grass tiles
        for (let i = 1; i <= 14; i++) {
            this.load.image(`gt_${i}`, `assets/grass_tufts/gt_${i}.png`);
        }
        // Custom HUD health bars (1-6 segments)
        for (let i = 1; i <= 6; i++) {
            this.load.image(`hp_bar_${i}`, `assets/hud/bar ${i}.png`);
        }
        this.load.image('hp_bar_empty', `assets/hud/white bar empty 6.png`);
        // Custom HUD stamina bars (1-5 segments)
        for (let i = 1; i <= 5; i++) {
            this.load.image(`stamina_bar_${i}`, `assets/hud/stamina_${i}.png`);
        }
        // Stamina empty placeholder (černý bar)
        this.load.image('stamina_bar_empty', `assets/hud/white bar empty 6.png`);
        // Animated gold coin (spritesheet)
        this.load.spritesheet('gold_coin_anim', 'assets/hud/gold_coin_anim.png', { frameWidth: 16, frameHeight: 16 });
        // Battle scene assets
        this.load.image('battle_bg', 'assets/battle/02-background.png');
        this.load.image('battle_hp_enemy', 'assets/battle/04-hp-enemy.png');
        this.load.image('battle_hp_player', 'assets/battle/05-hp-player.png');
        this.load.image('battle_question', 'assets/battle/06-question-panel.png');
        this.load.image('battle_question_empty', 'assets/battle/06b-question-panel-empty.png');
        this.load.image('battle_souboj', 'assets/battle/07-souboj-banner.png');
        // Stone decorations (stone2_1 to stone2_40)
        for (let i = 1; i <= 40; i++) {
            this.load.image(`stone2_${i}`, `assets/stones/stone2_${i}.png`);
        }
    }

    create() {
        this.anims.create({ key: 'warrior_idle',   frames: this.anims.generateFrameNumbers('warrior_idle',   { start: 0, end: 7 }), frameRate: 6,  repeat: -1 });
        this.anims.create({ key: 'warrior_run',    frames: this.anims.generateFrameNumbers('warrior_run',    { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'warrior_attack', frames: this.anims.generateFrameNumbers('warrior_attack', { start: 0, end: 3 }), frameRate: 8,  repeat: 0  });
        this.anims.create({ key: 'wizard_idle',    frames: this.anims.generateFrameNumbers('wizard_idle',    { start: 0, end: 4 }), frameRate: 5,  repeat: -1 });
        this.anims.create({ key: 'cook_idle',        frames: this.anims.generateFrameNumbers('cook_idle',      { start: 0, end: 4 }), frameRate: 5,  repeat: -1 });
        this.anims.create({ key: 'goblin_worker_idle', frames: this.anims.generateFrameNumbers('goblin_worker', { start: 7, end: 13 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'campfire_burn', frames: this.anims.generateFrameNumbers('campfire', { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'portal_spin',   frames: this.anims.generateFrameNumbers('portal',         { start: 0, end: 7  }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'water_flow', frames: this.anims.generateFrameNumbers('water_anim', { start: 0, end: 7 }), frameRate: 4, repeat: -1 });
        this.anims.create({ key: 'water_rock1_anim', frames: this.anims.generateFrameNumbers('water_rock1', { start: 0, end: 15 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'water_rock2_anim', frames: this.anims.generateFrameNumbers('water_rock2', { start: 0, end: 15 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'water_rock3_anim', frames: this.anims.generateFrameNumbers('water_rock3', { start: 0, end: 15 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'water_rock4_anim', frames: this.anims.generateFrameNumbers('water_rock4', { start: 0, end: 15 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'grill_sizzle', frames: this.anims.generateFrameNumbers('grill',           { start: 0, end: 3 }), frameRate: 5,  repeat: -1 });
        this.anims.create({ key: 'boss_idle',  frames: this.anims.generateFrameNumbers('boss_idle',  { start: 0, end: 7 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'boss_run',   frames: this.anims.generateFrameNumbers('boss_run',   { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'princess_idle', frames: this.anims.generateFrameNumbers('princess_idle', { start: 0, end: 2 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'princess_run',  frames: this.anims.generateFrameNumbers('princess_run',  { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'gold_coin_spin', frames: this.anims.generateFrameNumbers('gold_coin_anim', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'coin_spin', frames: this.anims.generateFrameNumbers('coin_tiles', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });

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
