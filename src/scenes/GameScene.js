import { LEVELS } from '../maps/levels.js';

const TILE = 64;
const KILLS_NEEDED = 5;

const ENEMY_UNIT_POOLS = {
    goblin: ['pawn', 'archer'],
    orc:    ['warrior', 'monk'],
    dragon: ['warrior', 'lancer', 'monk'],
    boss:   ['lancer', 'warrior'],
};

const ENEMY_UNIT_CONFIG = {
    pawn:    { idleKey: 'enemy_pawn_idle',    idleAnim: 'enemy_pawn_idle_anim',    runAnim: 'enemy_pawn_run_anim',    scale: 0.72, battleScale: 2.0 },
    warrior: { idleKey: 'enemy_warrior_idle', idleAnim: 'enemy_warrior_idle_anim', runAnim: 'enemy_warrior_run_anim', scale: 0.76, battleScale: 2.2 },
    archer:  { idleKey: 'enemy_archer_idle',  idleAnim: 'enemy_archer_idle_anim',  runAnim: 'enemy_archer_run_anim',  scale: 0.76, battleScale: 2.1 },
    lancer:  { idleKey: 'enemy_lancer_idle',  idleAnim: 'enemy_lancer_idle_anim',  runAnim: 'enemy_lancer_run_anim',  scale: 0.48, battleScale: 1.25 },
    monk:    { idleKey: 'enemy_monk_idle',    idleAnim: 'enemy_monk_idle_anim',    runAnim: 'enemy_monk_run_anim',    scale: 0.78, battleScale: 2.1 },
};

export default class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    init(data) {
        this.currentLevel   = data.level ?? 0;
        this.playerHP       = data.playerHP ?? 100;
        this.playerMaxHP    = 100;
        this.gold           = data.gold ?? 0;
        this.inBattle        = false;
        this.inDialog        = false;
        this.dialogCooldown  = false;
        this.battleCooldown  = false;
        this.killCount       = 0;
        this.npcTalked       = false;
        this.stamina         = 100;
        this.maxStamina      = 100;
        this.isSprinting     = false;
        this.exhausted       = false;
        this.gateOpen       = false;
    }

    create() {
        this.levelData = LEVELS[this.currentLevel];
        this.mapData   = this.levelData.map;
        this.rows      = this.mapData.length;
        this.cols      = this.mapData[0].length;

        const worldW = this.cols * TILE;
        const worldH = this.rows * TILE;

        this.physics.world.setBounds(0, 0, worldW, worldH);

        this.renderTiles();
        this.renderProps();
        this.buildWalls();


        const ps = this.levelData.playerStart;
        const safeStart = this.findSafeTile(ps.x, ps.y);
        this.player = this.physics.add.sprite(safeStart.col * TILE + TILE/2, safeStart.row * TILE + TILE/2, 'warrior_idle');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(0.9);
        // Circular body slides around tree corners instead of catching on them
        this.player.setCircle(24, 74, 120);
        this.player.hp    = this.playerHP;
        this.player.maxHp = this.playerMaxHP;
        this.player.setDepth(10);
        this.player.play('warrior_idle');

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.propBodies);

        this.enemies = this.physics.add.group();
        this.spawnEnemies();
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.overlap(this.player, this.enemies, this.triggerBattle, null, this);

        this.npcs = this.physics.add.staticGroup();
        this.spawnNPCs();
        this.physics.add.overlap(this.player, this.npcs, this.openDialog, null, this);
        this.physics.add.overlap(this.player, this.shopNPCs, this.openShopDialog, null, this);

        this.spawnGate();

        this.cameras.main.setBounds(0, 0, worldW, worldH);
        this.cameras.main.setBackgroundColor(0x8aae4f);
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

        this.cursors   = this.input.keyboard.createCursorKeys();
        this.wasd      = this.input.keyboard.addKeys('W,A,S,D');
        this.escKey    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.enterKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.spaceKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        this.createHUD();

        this.events.on('resume', () => {
            const result = this.game.registry.get('battleResult');
            if (!result) return;
            this.game.registry.remove('battleResult');
            this.handleBattleResult(result);
        }, this);
    }

    renderTiles() {
        const TREES   = ['ts_tree1', 'ts_tree2', 'ts_tree3', 'ts_tree4'];
        const BUSHES  = ['ts_bush1', 'ts_bush2', 'ts_bush3', 'ts_bush4'];
        const ROCKS   = ['ts_rock1', 'ts_rock2', 'ts_rock3', 'ts_rock4'];

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const t = this.mapData[r][c];
                const x = c * TILE + TILE / 2;
                const y = r * TILE + TILE / 2;

                // Ground — ts_grass/ts_path/water animation, all 64x64 native
                if (t === 3) {
                    // Stagger water anim start so tiles don't all pulse together
                    const startFrame = (c + r * 3) % 8;
                    const ws = this.add.sprite(x, y, 'water_anim', startFrame)
                        .setDisplaySize(TILE + 4, TILE + 4).setDepth(0);
                    this.time.delayedCall(startFrame * 250, () => { if (ws.active) ws.play('water_flow'); });
                } else {
                    const groundKey = t === 2 ? 'ts_path' : 'ts_grass';
                    this.add.image(x, y, groundKey).setDisplaySize(TILE + 4, TILE + 4).setDepth(0);
                }

                if (t === 1) {
                    // Tree: anchor at tile bottom so trunk sits on ground, canopy rises above
                    const key   = TREES[(c * 3 + r * 7) % 4];
                    const tall  = key === 'ts_tree1' || key === 'ts_tree2'; // 192x256 vs 192x192
                    const scale = tall ? 0.60 : 0.72;
                    this.add.image(x, y + TILE * 0.5, key)
                        .setScale(scale)
                        .setOrigin(0.5, 1.0)
                        .setDepth(2 + r * 0.001); // slight Y-sort within tree layer
                } else if (t === 3) {
                    // Water rock decoration — every tile gets one, variant + offset from hash
                    const hash  = (c * 11 + r * 13) % 4;
                    const key   = `water_rock${hash + 1}`;
                    const anim  = `water_rock${hash + 1}_anim`;
                    const ox = ((c * 7 + r * 3) % 20) - 10; // -10..+9 px offset
                    const oy = ((c * 3 + r * 7) % 16) - 8;
                    // Stagger animation start so all rocks don't pulse in sync
                    const delay = (c * 5 + r * 3) % 16;
                    const rock = this.add.sprite(x + ox, y + oy, key, delay)
                        .setScale(0.85).setDepth(1).setAlpha(0.92);
                    this.time.delayedCall(delay * 125, () => { if (rock.active) rock.play(anim); });
                } else if (t === 0) {
                    // Scattered decorations on open grass
                    const hash = (c * 13 + r * 17) % 24;
                    if (hash === 0) {
                        const key = BUSHES[(c + r) % 4];
                        this.add.image(x, y + 16, key).setScale(0.28).setDepth(1);
                    } else if (hash === 7) {
                        const key = ROCKS[(c * 2 + r) % 4];
                        this.add.image(x, y + 8, key).setScale(0.9).setDepth(1);
                    }
                }
            }
        }
    }

    renderProps() {
        this.propBodies = this.physics.add.staticGroup();
        (this.levelData.props || []).forEach(p => {
            const x = p.x * TILE + TILE / 2;
            const y = p.y * TILE + TILE / 2;
            if (p.anim) {
                this.add.sprite(x, y, p.key, p.frame ?? 0).setScale(p.scale ?? 1).setDepth(p.depth ?? 5).play(p.anim);
            } else {
                this.add.image(x, y, p.key, p.frame ?? 0).setScale(p.scale ?? 1).setDepth(p.depth ?? 5);
            }
            if (p.collide) {
                const bw = p.bodyW ?? TILE;
                const bh = p.bodyH ?? TILE;
                this.propBodies.create(x, y, null)
                    .setDisplaySize(bw, bh).refreshBody().setAlpha(0);
            }
        });
    }

    buildWalls() {
        this.walls = this.physics.add.staticGroup();
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const t = this.mapData[r][c];
                if (t === 1 || t === 3) {
                    // Trees shrunk by 10px so player can navigate flush against them
                    // without hitting an invisible wall inside the visually overhanging canopy.
                    // Water stays full-tile (no visual overhang issue).
                      const size = t === 1 ? TILE - 14 : TILE; // Adjusted size for tree collider
                    this.walls.create(c * TILE + TILE/2, r * TILE + TILE/2, 'ts_grass')
                        .setImmovable(true)
                        .setDisplaySize(size, size)
                        .refreshBody()
                        .setAlpha(0);
                }
            }
        }
    }

    isSafe(col, row) {
        if (row < 1 || row >= this.rows - 1 || col < 1 || col >= this.cols - 1) return false;
        const t = this.mapData[row][col];
        return t === 0 || t === 2;
    }

    findSafeTile(col, row) {
        if (this.isSafe(col, row)) return { col, row };
        for (let r = 1; r <= 5; r++) {
            for (let dc = -r; dc <= r; dc++) {
                for (let dr = -r; dr <= r; dr++) {
                    if (Math.abs(dc) === r || Math.abs(dr) === r) {
                        if (this.isSafe(col + dc, row + dr)) return { col: col + dc, row: row + dr };
                    }
                }
            }
        }
        return { col, row };
    }

    spawnEnemies() {
        this.levelData.enemies.forEach((ed, i) => {
            const safe = this.findSafeTile(ed.x, ed.y);
            const unitPool = ENEMY_UNIT_POOLS[ed.type] || ENEMY_UNIT_POOLS.goblin;
            const unit = unitPool[(this.currentLevel + i) % unitPool.length];
            const unitCfg = ENEMY_UNIT_CONFIG[unit] || ENEMY_UNIT_CONFIG.pawn;

            const e = this.physics.add.sprite(safe.col * TILE + TILE/2, safe.row * TILE + TILE/2, unitCfg.idleKey, 0);
            e.setScale(unitCfg.scale);
            e.setCollideWorldBounds(true);
            this.enemies.add(e);
            e.enemyData  = ed;
            e.enemyIndex = i;
            e.enemyUnit = unit;
            e.idleSheetKey = unitCfg.idleKey;
            e.idleAnimKey = unitCfg.idleAnim;
            e.walkAnimKey = unitCfg.runAnim;
            e.battleScale = unitCfg.battleScale;
            e.setDepth(10);
            if (e.idleAnimKey) e.play(e.idleAnimKey);

            this.time.addEvent({
                delay: 1800 + Math.random() * 1200, loop: true,
                callback: () => {
                    if (!e.active) return;
                    const dirs = [[60,0],[-60,0],[0,60],[0,-60],[0,0],[0,0]];
                    const d = dirs[Math.floor(Math.random() * dirs.length)];
                    e.setVelocity(d[0], d[1]);
                    this.time.delayedCall(900, () => { if (e.active) e.setVelocity(0, 0); });
                }
            });
        });
    }

    spawnNPCs() {
        this.shopNPCs = this.physics.add.group();

        this.levelData.npcs.forEach(nd => {
            const safe = this.findSafeTile(nd.x, nd.y);
            const x = safe.col * TILE + TILE/2;
            const y = safe.row * TILE + TILE/2;

            if (nd.type === 'shop') {
                // Wandering shop NPC (dynamic physics sprite)
                const cook = this.physics.add.sprite(x, y, nd.sprite || 'cook_idle', nd.frame ?? 0);
                cook.npcData = nd;
                cook.setScale(2.5).setDepth(10).setCollideWorldBounds(true);
                cook.body.setSize(30, 30, 17, 17);
                if (nd.anim) cook.play(nd.anim);
                this.shopNPCs.add(cook);

                const cx = (nd.wanderCX ?? nd.x) * TILE + TILE/2;
                const cy = (nd.wanderCY ?? nd.y) * TILE + TILE/2;
                const wr = (nd.wanderR ?? 1) * TILE;
                this.time.addEvent({
                    delay: 2200 + Math.random() * 1000, loop: true,
                    callback: () => {
                        if (!cook.active) return;
                        const angle = Math.random() * Math.PI * 2;
                        const dist  = Math.random() * wr;
                        const tx = cx + Math.cos(angle) * dist;
                        const ty = cy + Math.sin(angle) * dist;
                        const dx = tx - cook.x, dy = ty - cook.y;
                        const len = Math.sqrt(dx*dx + dy*dy) || 1;
                        cook.setVelocity(dx/len * 45, dy/len * 45);
                        if (dx < 0) cook.setFlipX(true); else cook.setFlipX(false);
                        this.time.delayedCall(1100, () => { if (cook.active) cook.setVelocity(0, 0); });
                    },
                });

                const label = this.add.text(x, y - TILE * 0.55, '!', {
                    fontSize: '18px', fill: '#ffff44', fontFamily: 'Arial Black',
                    stroke: '#000000', strokeThickness: 3,
                }).setOrigin(0.5).setDepth(11);
                this.tweens.add({ targets: label, y: y - TILE * 0.75, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                cook.exclamation = label;

            } else {
                // Quest NPC: static body
                const npc = this.npcs.create(x, y, nd.sprite || 'wizard_idle');
                npc.npcData = nd;
                npc.setScale(3).refreshBody();
                npc.body.setSize(90, 90, 51, 51);
                npc.setDepth(10);
                npc.play(nd.anim || 'wizard_idle');

                const label = this.add.text(x, y - TILE * 0.7, '!', {
                    fontSize: '22px', fill: '#ffff00', fontFamily: 'Arial Black',
                    stroke: '#000000', strokeThickness: 4,
                }).setOrigin(0.5).setDepth(11);
                this.tweens.add({ targets: label, y: y - TILE * 0.9, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                npc.exclamation = label;
            }
        });
    }

    spawnGate() {
        if (!this.levelData.gate) return;
        const { x, y } = this.levelData.gate;
        this.gate = this.physics.add.staticSprite(x * TILE + TILE/2, y * TILE + TILE/2, 'portal');
        this.gate.setScale(3).refreshBody();
        this.gate.setDepth(9);
        this.gate.setAlpha(0); // invisible until quest is complete
        this.gate.body.enable = false; // no collision while invisible
        this.gateOverlap = this.physics.add.overlap(this.player, this.gate, this.enterGate, null, this);
    }

    createHUD() {
        const hud = this.add.container(0, 0).setScrollFactor(0).setDepth(50);

        const bg          = this.add.rectangle(6, 6, 260, 128, 0x000000, 0.75).setOrigin(0);
        const hpBarBg     = this.add.rectangle(10, 12, 240, 20, 0x333333).setOrigin(0);
        this.hpBar        = this.add.rectangle(10, 12, 240, 20, 0x22cc44).setOrigin(0);
        this.hpLabel      = this.add.text(16, 14, '', { fontSize: '13px', fill: '#fff', fontFamily: 'Arial' });

        const stBarBg     = this.add.rectangle(10, 38, 240, 12, 0x333333).setOrigin(0);
        this.stBar        = this.add.rectangle(10, 38, 240, 12, 0xffcc00).setOrigin(0);
        this.stLabel      = this.add.text(16, 38, 'SPRINT', { fontSize: '9px', fill: '#000', fontFamily: 'Arial Black' });

        this.areaText     = this.add.text(10, 58, '', { fontSize: '13px', fill: '#aaaaff', fontFamily: 'Arial' });
        this.killText     = this.add.text(10, 76, '', { fontSize: '13px', fill: '#ffaa44', fontFamily: 'Arial' });
        this.npcText      = this.add.text(10, 94, '', { fontSize: '13px', fill: '#aaffaa', fontFamily: 'Arial' });
        this.goldText     = this.add.text(140, 94, '', { fontSize: '13px', fill: '#ffee44', fontFamily: 'Arial' });

        hud.add([bg, hpBarBg, this.hpBar, this.hpLabel, stBarBg, this.stBar, this.stLabel,
                 this.areaText, this.killText, this.npcText, this.goldText]);
        this.updateHUD();
    }

    updateHUD() {
        const ratio = this.player.hp / this.player.maxHp;
        this.hpBar.setDisplaySize(240 * ratio, 20);
        this.hpBar.setFillStyle(ratio > 0.5 ? 0x22cc44 : ratio > 0.25 ? 0xffaa00 : 0xff2222);
        this.hpLabel.setText(`HP: ${this.player.hp} / ${this.player.maxHp}`);

        const sr = this.stamina / this.maxStamina;
        this.stBar.setDisplaySize(240 * sr, 12);
        this.stBar.setFillStyle(this.isSprinting ? 0xff8800 : sr < 0.3 ? 0xff4444 : 0xffcc00);

        this.areaText.setText(`${this.levelData.name}`);
        this.killText.setText(`Zabito: ${Math.min(this.killCount, KILLS_NEEDED)} / ${KILLS_NEEDED}`);
        this.npcText.setText(`NPC: ${this.npcTalked ? '✓' : '✗'}`);
        this.goldText.setText(`Zlato: ${this.gold}`);
    }

    triggerBattle(player, enemy) {
        if (this.inBattle || this.inDialog || this.battleCooldown) return;
        this.inBattle = true;
        enemy.setVelocity(0, 0);
        this.scene.launch('BattleScene', {
            enemyData:   enemy.enemyData,
            enemyIndex:  enemy.enemyIndex,
            enemyUnit:   enemy.enemyUnit,
            enemyScale:  enemy.battleScale,
            playerHP:    player.hp,
            playerMaxHP: player.maxHp,
        });
        this.scene.pause();
    }

    handleBattleResult(data) {
        this.inBattle       = false;
        this.battleCooldown = true;
        const cooldown = data.result === 'flee' ? 1500 : 300;
        this.time.delayedCall(cooldown, () => { this.battleCooldown = false; });
        this.player.hp = data.playerHP;

        if (data.result === 'win') {
            this.enemies.getChildren().slice().forEach(e => {
                if (e.enemyIndex === data.enemyIndex) e.destroy();
            });
            this.gold += data.goldEarned ?? 10;
            this.killCount++;
            this.updateHUD();
            this.checkGate();
        } else if (data.result === 'lose') {
            this.time.delayedCall(400, () => this.scene.start('GameOverScene'));
        } else {
            this.updateHUD();
            if (this.player.hp <= 0)
                this.time.delayedCall(400, () => this.scene.start('GameOverScene'));
        }
    }

    checkGate() {
        if (this.gateOpen || !this.gate) return;
        if (this.killCount >= KILLS_NEEDED && this.npcTalked) {
            this.openGate();
        }
    }

    openGate() {
        this.gateOpen = true;
        this.gate.body.enable = true;
        this.gate.play('portal_spin');

        // Fade portal in, then pulse scale
        this.tweens.add({
            targets: this.gate, alpha: 1, duration: 900, ease: 'Sine.easeIn',
            onComplete: () => {
                this.tweens.add({
                    targets: this.gate, scaleX: 3.3, scaleY: 3.3,
                    duration: 140, yoyo: true, repeat: 3, ease: 'Sine.easeInOut',
                });
            },
        });

        // Remove collider so player can walk through the open portal
        this.physics.world.removeCollider(
            this.physics.world.colliders.getActive().find(c =>
                (c.object1 === this.player && c.object2 === this.gate) ||
                (c.object1 === this.gate   && c.object2 === this.player)
            )
        );

        this.showFloatingText('Portal otevřen! ✨', 0x44aaff);
        this.updateHUD();
    }

    enterGate() {
        if (!this.gateOpen) {
            if (!this._gateMsgShown) {
                this._gateMsgShown = true;
                const msg = this.killCount < KILLS_NEEDED && !this.npcTalked
                    ? `Poraž ${KILLS_NEEDED} příšer a promluv s NPC!`
                    : this.killCount < KILLS_NEEDED
                        ? `Poraž ještě ${KILLS_NEEDED - this.killCount} příšer!`
                        : 'Promluv nejdřív s NPC!';
                this.showFloatingText(msg, 0xff8800);
                this.time.delayedCall(2000, () => { this._gateMsgShown = false; });
            }
            return;
        }
        this.nextLevel();
    }

    showFloatingText(msg, color) {
        const px = this.player.x;
        const py = this.player.y - 30;
        const t  = this.add.text(px, py, msg, {
            fontSize: '14px', fill: `#${color.toString(16).padStart(6,'0')}`,
            fontFamily: 'Arial Black', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5).setDepth(200);
        this.tweens.add({ targets: t, y: py - 40, alpha: 0, duration: 1800, onComplete: () => t.destroy() });
    }

    openDialog(player, npc) {
        if (this.inDialog || this.inBattle || this.dialogCooldown) return;
        this.inDialog = true;
        this.dialogType = 'quest';
        this.npcTalked = true;
        if (npc.exclamation) { npc.exclamation.destroy(); npc.exclamation = null; }
        this.showDialog(npc.npcData.message);
        this.updateHUD();
        this.checkGate();
    }

    openShopDialog(player, cook) {
        if (this.inDialog || this.inBattle || this.dialogCooldown) return;
        this.inDialog = true;
        this.dialogType = 'shop';
        this._activeCook = cook;
        this.showShopDialog();
    }

    showShopDialog() {
        if (this.dialogBox)    { this.dialogBox.destroy();    this.dialogBox    = null; }
        if (this.dialogOverlay){ this.dialogOverlay.destroy(); this.dialogOverlay = null; }

        const W = this.scale.width, H = this.scale.height;

        this.dialogOverlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.65)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(98).setInteractive();

        const pW = Math.min(520, W * 0.62);
        const pH = Math.min(380, H * 0.60);
        const px = (W - pW) / 2;
        const py = (H - pH) / 2;

        const bg = this.add.image(0, 0, 'parchment').setOrigin(0, 0).setDisplaySize(pW, pH);

        const title = this.add.text(pW / 2, 38, 'Kuchař', {
            fontSize: '22px', fill: '#3A2A12', fontFamily: '"Press Start 2P", monospace',
        }).setOrigin(0.5);

        const line = this.add.graphics();
        line.lineStyle(2, 0x8C6B36, 1);
        line.beginPath(); line.moveTo(50, 78); line.lineTo(pW - 50, 78); line.strokePath();

        this._shopHpTxt   = this.add.text(pW / 2, 100, `HP:    ${this.player.hp} / ${this.player.maxHp}`, {
            fontSize: '28px', fill: '#2E1F0A', fontFamily: '"VT323", monospace',
        }).setOrigin(0.5);
        this._shopGoldTxt = this.add.text(pW / 2, 130, `Zlato: ${this.gold}`, {
            fontSize: '28px', fill: '#B8870D', fontFamily: '"VT323", monospace',
        }).setOrigin(0.5);

        // Buy button
        const btnW = pW - 80, btnH = 54;
        const btnBg = this.add.rectangle(pW / 2, 202, btnW, btnH, 0x3a6e1a).setStrokeStyle(3, 0x22440a);
        const btnTxt = this.add.text(pW / 2, 202, 'Doplnit zdraví   -50 zlata / +30 HP', {
            fontSize: '22px', fill: '#eeffcc', fontFamily: '"VT323", monospace',
        }).setOrigin(0.5);

        this._shopFeedback = this.add.text(pW / 2, 265, '', {
            fontSize: '24px', fill: '#fff', fontFamily: '"VT323", monospace', align: 'center',
        }).setOrigin(0.5);

        const hint = this.add.text(pW / 2, pH - 26, 'ENTER = koupit   •   ESC = zavřít', {
            fontSize: '11px', fill: '#8C6B36', fontFamily: '"Press Start 2P", monospace',
        }).setOrigin(0.5);

        btnBg.setInteractive({ useHandCursor: true })
            .on('pointerover',  () => btnBg.setFillStyle(0x4e9022))
            .on('pointerout',   () => btnBg.setFillStyle(0x3a6e1a))
            .on('pointerdown',  () => this.buyHealth());
        btnTxt.setInteractive().on('pointerdown', () => this.buyHealth());

        this.dialogBox = this.add.container(px, py,
            [bg, title, line, this._shopHpTxt, this._shopGoldTxt, btnBg, btnTxt, this._shopFeedback, hint]
        ).setDepth(99).setScrollFactor(0);
    }

    buyHealth() {
        if (this.gold < 50) {
            this._shopFeedback.setText('Nemáš dost zlata!').setStyle({ fill: '#ff4444' });
            return;
        }
        if (this.player.hp >= this.player.maxHp) {
            this._shopFeedback.setText('Máš plné zdraví!').setStyle({ fill: '#ffaa44' });
            return;
        }
        this.gold -= 50;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
        this._shopHpTxt.setText(`HP:    ${this.player.hp} / ${this.player.maxHp}`);
        this._shopGoldTxt.setText(`Zlato: ${this.gold}`);
        this._shopFeedback.setText('+30 HP!').setStyle({ fill: '#44ff44' });
        this.updateHUD();
    }

    showDialog(msg) {
        if (this.dialogBox) { this.dialogBox.destroy(); this.dialogBox = null; }
        if (this.dialogOverlay) { this.dialogOverlay.destroy(); this.dialogOverlay = null; }

        const W = this.scale.width, H = this.scale.height;

        // Dark overlay — fixed to screen, blocks game view
        this.dialogOverlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.65)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(98)
            .setInteractive(); // eat clicks so nothing behind is triggered

        const pW = Math.min(900, W * 0.86);
        const pH = Math.min(580, H * 0.80);
        const px = (W - pW) / 2;
        const py = (H - pH) / 2;

        const bg = this.add.image(0, 0, 'parchment')
            .setOrigin(0, 0)
            .setDisplaySize(pW, pH);

        // pečeť K
        const seal    = this.add.rectangle(90, 70, 56, 56, 0x8c2828);
        const sealBrd = this.add.rectangle(90, 70, 56, 56, 0x1a1c2c).setStrokeStyle(3, 0x1a1c2c).setFillStyle();
        const sealTxt = this.add.text(90, 70, 'K', {
            fontSize: '22px', fill: '#F4B41B', fontFamily: '"Press Start 2P", monospace',
        }).setOrigin(0.5);

        const questLabel = this.add.text(130, 58, 'QUEST', {
            fontSize: '11px', fill: '#3A2A12', fontFamily: '"Press Start 2P", monospace',
        });
        const title = this.add.text(130, 82, this.levelData.name, {
            fontSize: '18px', fill: '#3A2A12', fontFamily: '"Press Start 2P", monospace',
        });

        const line1 = this.add.graphics();
        line1.lineStyle(2, 0x8C6B36, 1);
        line1.beginPath(); line1.moveTo(60, 130); line1.lineTo(pW - 60, 130); line1.strokePath();

        const bodyTxt = this.add.text(60, 148, msg, {
            fontSize: '30px', fill: '#2E1F0A', fontFamily: '"VT323", monospace',
            wordWrap: { width: pW - 120 }, lineSpacing: 6,
        });

        const objY = 290;
        const kills = Math.min(this.killCount, KILLS_NEEDED);
        const objectives = [
            { done: this.npcTalked,         text: 'Promluv s NPC' },
            { done: kills >= KILLS_NEEDED,   text: `Poraž ${KILLS_NEEDED} příšer (${kills}/${KILLS_NEEDED})` },
        ];
        const objItems = [];
        objectives.forEach((o, idx) => {
            const yy = objY + idx * 38;
            objItems.push(
                this.add.text(60, yy, o.done ? '✓' : '□', {
                    fontSize: '16px', fill: o.done ? '#1F7A3F' : '#3A2A12',
                    fontFamily: '"Press Start 2P", monospace',
                }),
                this.add.text(95, yy, o.text, {
                    fontSize: '24px', fill: o.done ? 'rgba(58,42,18,0.5)' : '#2E1F0A',
                    fontFamily: '"VT323", monospace',
                })
            );
        });

        const rewardY = objY + objectives.length * 38 + 20;
        const line2 = this.add.graphics();
        line2.lineStyle(2, 0x8C6B36, 1);
        line2.beginPath(); line2.moveTo(60, rewardY); line2.lineTo(pW - 60, rewardY); line2.strokePath();

        const rewardLabel = this.add.text(60, rewardY + 20, 'Odměna:', {
            fontSize: '26px', fill: '#3A2A12', fontFamily: '"VT323", monospace',
        });
        const rewardVal = this.add.text(210, rewardY + 20, `★ ${this.levelData.reward ?? 50} zlaťáků`, {
            fontSize: '26px', fill: '#B8870D', fontFamily: '"VT323", monospace',
        });
        const hint = this.add.text(pW / 2, pH - 28, 'ESC — zavřít', {
            fontSize: '13px', fill: '#8C6B36', fontFamily: '"Press Start 2P", monospace',
        }).setOrigin(0.5);

        // Container fixed to screen — setScrollFactor(0) ignores camera movement
        this.dialogBox = this.add.container(px, py,
            [bg, seal, sealBrd, sealTxt, questLabel, title, line1, bodyTxt,
             ...objItems, line2, rewardLabel, rewardVal, hint]
        ).setDepth(99).setScrollFactor(0);
    }

    nextLevel() {
        const next = this.currentLevel + 1;
        if (next < LEVELS.length)
            this.scene.start('GameScene', { level: next, playerHP: this.player.hp, gold: this.gold });
        else
            this.scene.start('VictoryScene');
    }

    update() {
        if (this.inBattle) return;

        // Update shop NPC exclamation positions to follow them
        if (this.shopNPCs) {
            this.shopNPCs.getChildren().forEach(cook => {
                if (cook.exclamation) {
                    cook.exclamation.setPosition(cook.x, cook.y - TILE * 0.55);
                }
            });
        }

        if (this.inDialog) {
            const escDown   = Phaser.Input.Keyboard.JustDown(this.escKey);
            const enterDown = Phaser.Input.Keyboard.JustDown(this.enterKey);
            const spaceDown = Phaser.Input.Keyboard.JustDown(this.spaceKey);

            if (this.dialogType === 'shop') {
                if (enterDown) this.buyHealth();
                if (escDown || spaceDown) {
                    if (this.dialogBox)    { this.dialogBox.destroy();    this.dialogBox    = null; }
                    if (this.dialogOverlay){ this.dialogOverlay.destroy(); this.dialogOverlay = null; }
                    this.inDialog = false;
                    this.dialogCooldown = true;
                    this.time.delayedCall(1200, () => { this.dialogCooldown = false; });
                }
            } else {
                if (escDown || enterDown || spaceDown) {
                    if (this.dialogBox)    { this.dialogBox.destroy();    this.dialogBox    = null; }
                    if (this.dialogOverlay){ this.dialogOverlay.destroy(); this.dialogOverlay = null; }
                    this.inDialog = false;
                    this.dialogCooldown = true;
                    this.time.delayedCall(3000, () => { this.dialogCooldown = false; });
                }
            }
            this.player.setVelocity(0, 0);
            this.player.play('warrior_idle', true);
            return;
        }

        const delta = this.game.loop.delta / 1000; // seconds since last frame
        const moving = this.cursors.left.isDown || this.cursors.right.isDown ||
                       this.cursors.up.isDown   || this.cursors.down.isDown  ||
                       this.wasd.A.isDown || this.wasd.D.isDown ||
                       this.wasd.W.isDown || this.wasd.S.isDown;

        if (this.stamina <= 0) this.exhausted = true;
        if (this.exhausted && this.stamina >= 30) this.exhausted = false;

        const wantSprint = this.shiftKey.isDown && moving && !this.exhausted;
        this.isSprinting = wantSprint;

        if (wantSprint) {
            this.stamina = Math.max(0, this.stamina - 40 * delta);
        } else {
            const regenRate = this.exhausted ? 12 : 20;
            this.stamina = Math.min(this.maxStamina, this.stamina + regenRate * delta);
        }

        const speed = wantSprint ? 280 : 160;
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown  || this.wasd.A.isDown) vx = -speed;
        if (this.cursors.right.isDown || this.wasd.D.isDown) vx =  speed;
        if (this.cursors.up.isDown    || this.wasd.W.isDown) vy = -speed;
        if (this.cursors.down.isDown  || this.wasd.S.isDown) vy =  speed;
        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
        this.player.setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            this.player.play('warrior_run', true);
            this.player.anims.timeScale = wantSprint ? 1.8 : 1;
            if (vx < 0) this.player.setFlipX(true);
            else if (vx > 0) this.player.setFlipX(false);
        } else {
            this.player.play('warrior_idle', true);
            this.player.anims.timeScale = 1;
        }

        this.enemies.getChildren().forEach(e => {
            if (!e.active || !e.body) return;
            const movingEnemy = Math.abs(e.body.velocity.x) > 1 || Math.abs(e.body.velocity.y) > 1;
            if (movingEnemy) {
                if (e.walkAnimKey && e.anims.currentAnim?.key !== e.walkAnimKey) {
                    e.play(e.walkAnimKey, true);
                }
                if (e.body.velocity.x < 0) e.setFlipX(true);
                else if (e.body.velocity.x > 0) e.setFlipX(false);
            } else {
                if (e.idleAnimKey && e.anims.currentAnim?.key !== e.idleAnimKey) {
                    e.play(e.idleAnimKey, true);
                } else if (!e.idleAnimKey && e.idleSheetKey) {
                    e.setTexture(e.idleSheetKey, 0);
                }
            }
        });

        this.updateHUD();
    }
}
