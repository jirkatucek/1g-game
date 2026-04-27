import { LEVELS } from '../maps/levels.js';

const TILE = 64;
const KILLS_NEEDED = 5;

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
        this.buildWalls();

        const ps = this.levelData.playerStart;
        const safeStart = this.findSafeTile(ps.x, ps.y);
        this.player = this.physics.add.sprite(safeStart.col * TILE + TILE/2, safeStart.row * TILE + TILE/2, 'warrior_idle');
        this.player.setCollideWorldBounds(true);
        this.player.setScale(0.9);
        // Circular body slides around tree corners instead of catching on them
        this.player.setCircle(22, 74, 120);
        this.player.hp    = this.playerHP;
        this.player.maxHp = this.playerMaxHP;
        this.player.setDepth(10);
        this.player.play('warrior_idle');

        this.physics.add.collider(this.player, this.walls);

        this.enemies = this.physics.add.group();
        this.spawnEnemies();
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.overlap(this.player, this.enemies, this.triggerBattle, null, this);

        this.npcs = this.physics.add.staticGroup();
        this.spawnNPCs();
        this.physics.add.overlap(this.player, this.npcs, this.openDialog, null, this);

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

                // Ground — ts_grass/ts_path/ts_water, all 64x64 native
                const groundKey = t === 2 ? 'ts_path'
                                : t === 3 ? 'ts_water'
                                : 'ts_grass';
                this.add.image(x, y, groundKey).setDisplaySize(TILE + 2, TILE + 2).setDepth(0);

                if (t === 1) {
                    // Tree: anchor at tile bottom so trunk sits on ground, canopy rises above
                    const key   = TREES[(c * 3 + r * 7) % 4];
                    const tall  = key === 'ts_tree1' || key === 'ts_tree2'; // 192x256 vs 192x192
                    const scale = tall ? 0.60 : 0.72;
                    this.add.image(x, y + TILE * 0.5, key)
                        .setScale(scale)
                        .setOrigin(0.5, 1.0)
                        .setDepth(2 + r * 0.001); // slight Y-sort within tree layer
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

    buildWalls() {
        this.walls = this.physics.add.staticGroup();
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const t = this.mapData[r][c];
                if (t === 1 || t === 3) {
                    // Trees shrunk by 10px so player can navigate flush against them
                    // without hitting an invisible wall inside the visually overhanging canopy.
                    // Water stays full-tile (no visual overhang issue).
                    const size = t === 1 ? TILE - 10 : TILE;
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
            const e = this.physics.add.sprite(safe.col * TILE + TILE/2, safe.row * TILE + TILE/2, ed.type === 'boss' ? 'boss' : ed.type);
            e.setScale(2);
            e.setCollideWorldBounds(true);
            this.enemies.add(e);
            e.enemyData  = ed;
            e.enemyIndex = i;
            e.setDepth(10);
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
        this.levelData.npcs.forEach(nd => {
            const safe = this.findSafeTile(nd.x, nd.y);
            const npc = this.npcs.create(safe.col * TILE + TILE/2, safe.row * TILE + TILE/2, 'npc');
            npc.npcData = nd;
            npc.setScale(2).refreshBody();
            npc.setDepth(10);
            this.add.text(safe.col * TILE + TILE/2, safe.row * TILE - 10, '!', {
                fontSize: '18px', fill: '#ffff00', fontFamily: 'Arial Black',
            }).setOrigin(0.5).setDepth(11);
        });
    }

    spawnGate() {
        if (!this.levelData.gate) return;
        const { x, y } = this.levelData.gate;
        this.gate = this.physics.add.staticSprite(x * TILE + TILE/2, y * TILE + TILE/2, 'gate_closed');
        this.gate.setScale(2).refreshBody();
        this.gate.setDepth(9);
        this.physics.add.collider(this.player, this.gate);
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
        this.gate.setTexture('gate_open');
        this.gate.refreshBody();

        // Remove collider, keep overlap
        this.physics.world.removeCollider(
            this.physics.world.colliders.getActive().find(c =>
                (c.object1 === this.player && c.object2 === this.gate) ||
                (c.object1 === this.gate   && c.object2 === this.player)
            )
        );

        // Flash gate
        this.tweens.add({ targets: this.gate, alpha: 0.3, duration: 200, yoyo: true, repeat: 3 });

        this.showFloatingText('Vrata otevřena!', 0xffcc00);
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
        this.npcTalked = true;
        this.showDialog(npc.npcData.message);
        this.updateHUD();
        this.checkGate();
    }

    showDialog(msg) {
        if (this.dialogBox) { this.dialogBox.destroy(); this.dialogBox = null; }

        const W = this.scale.width, H = this.scale.height;
        const cam = this.cameras.main;

        const pW = Math.min(900, W * 0.88);
        const pH = Math.min(600, H * 0.82);
        const px = (W - pW) / 2, py = (H - pH) / 2;

        const bg = this.add.image(0, 0, 'parchment')
            .setOrigin(0, 0)
            .setDisplaySize(pW, pH)
            .setDepth(100);

        // pečeť K
        const seal = this.add.rectangle(90, 70, 56, 56, 0x8c2828).setDepth(101);
        const sealBorder = this.add.rectangle(90, 70, 56, 56, 0x1a1c2c).setDepth(101);
        sealBorder.setStrokeStyle(3, 0x1a1c2c).setFillStyle();
        const sealTxt = this.add.text(90, 70, 'K', {
            fontSize: '22px', fill: '#F4B41B', fontFamily: '"Press Start 2P", monospace',
        }).setOrigin(0.5).setDepth(102);

        const questLabel = this.add.text(130, 58, 'QUEST', {
            fontSize: '11px', fill: '#3A2A12', fontFamily: '"Press Start 2P", monospace',
        }).setDepth(101);

        // název levelu
        const title = this.add.text(130, 82, this.levelData.name, {
            fontSize: '18px', fill: '#3A2A12', fontFamily: '"Press Start 2P", monospace',
        }).setDepth(101);

        // oddělovač
        const line1 = this.add.graphics().setDepth(101);
        line1.lineStyle(2, 0x8C6B36, 1);
        line1.beginPath(); line1.moveTo(60, 130); line1.lineTo(pW - 60, 130); line1.strokePath();

        // zpráva NPC
        const body = this.add.text(60, 148, msg, {
            fontSize: '30px', fill: '#2E1F0A', fontFamily: '"VT323", monospace',
            wordWrap: { width: pW - 120 }, lineSpacing: 6,
        }).setDepth(101);

        // cíle questu
        const objY = 290;
        const kills = Math.min(this.killCount, KILLS_NEEDED);
        const objectives = [
            { done: this.npcTalked,              text: 'Promluv s NPC' },
            { done: kills >= KILLS_NEEDED,        text: `Poraž ${KILLS_NEEDED} příšer (${kills}/${KILLS_NEEDED})` },
        ];

        const objItems = [];
        objectives.forEach((o, idx) => {
            const yy = objY + idx * 38;
            const icon = this.add.text(60, yy, o.done ? '✓' : '□', {
                fontSize: '16px', fill: o.done ? '#1F7A3F' : '#3A2A12',
                fontFamily: '"Press Start 2P", monospace',
            }).setDepth(101);
            const label = this.add.text(95, yy, o.text, {
                fontSize: '24px', fill: o.done ? 'rgba(58,42,18,0.5)' : '#2E1F0A',
                fontFamily: '"VT323", monospace',
            }).setDepth(101);
            objItems.push(icon, label);
        });

        // oddělovač dole
        const rewardY = objY + objectives.length * 38 + 20;
        const line2 = this.add.graphics().setDepth(101);
        line2.lineStyle(2, 0x8C6B36, 1);
        line2.beginPath(); line2.moveTo(60, rewardY); line2.lineTo(pW - 60, rewardY); line2.strokePath();

        // odměna
        const rewardLabel = this.add.text(60, rewardY + 20, 'Odměna:', {
            fontSize: '26px', fill: '#3A2A12', fontFamily: '"VT323", monospace',
        }).setDepth(101);
        const rewardVal = this.add.text(210, rewardY + 20, `★ ${this.levelData.reward ?? 50} zlaťáků`, {
            fontSize: '26px', fill: '#B8870D', fontFamily: '"VT323", monospace',
        }).setDepth(101);

        // ESC hint
        const hint = this.add.text(pW / 2, pH - 28, 'ESC — zavřít', {
            fontSize: '13px', fill: '#8C6B36', fontFamily: '"Press Start 2P", monospace',
        }).setOrigin(0.5).setDepth(101);

        this.dialogBox = this.add.container(cam.scrollX + px, cam.scrollY + py,
            [bg, seal, sealBorder, sealTxt, questLabel, title, line1, body,
             ...objItems, line2, rewardLabel, rewardVal, hint]
        ).setDepth(100);
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

        if (this.inDialog) {
            if (Phaser.Input.Keyboard.JustDown(this.escKey) ||
                Phaser.Input.Keyboard.JustDown(this.enterKey) ||
                Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                if (this.dialogBox) { this.dialogBox.destroy(); this.dialogBox = null; }
                this.inDialog = false;
                this.dialogCooldown = true;
                this.time.delayedCall(3000, () => { this.dialogCooldown = false; });
            }
            if (this.dialogBox)
                this.dialogBox.setPosition(this.cameras.main.scrollX + 50, this.cameras.main.scrollY + 440);
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

        this.updateHUD();
    }
}
