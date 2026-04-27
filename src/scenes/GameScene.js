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
        this.inBattle       = false;
        this.inDialog       = false;
        this.dialogCooldown = false;
        this.killCount      = 0;
        this.npcTalked      = false;
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
        this.player.setBodySize(48, 64);
        this.player.body.setOffset(72, 108);
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
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd    = this.input.keyboard.addKeys('W,A,S,D');
        this.escKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.createHUD();

        this.events.on('resume', () => {
            const result = this.game.registry.get('battleResult');
            if (!result) return;
            this.game.registry.remove('battleResult');
            this.handleBattleResult(result);
        }, this);
    }

    renderTiles() {
        const keys = ['grass', 'tree', 'path', 'water'];
        for (let r = 0; r < this.rows; r++)
            for (let c = 0; c < this.cols; c++)
                this.add.image(c * TILE + TILE/2, r * TILE + TILE/2, keys[this.mapData[r][c]]).setScale(2);
    }

    buildWalls() {
        this.walls = this.physics.add.staticGroup();
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const t = this.mapData[r][c];
                if (t === 1 || t === 3)
                    this.walls.create(c * TILE + TILE/2, r * TILE + TILE/2, t === 1 ? 'tree' : 'water')
                        .setImmovable(true).setScale(2).refreshBody();
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

        const bg       = this.add.rectangle(6, 6, 220, 90, 0x000000, 0.75).setOrigin(0);
        const hpBarBg  = this.add.rectangle(10, 10, 204, 16, 0x333333).setOrigin(0);
        this.hpBar     = this.add.rectangle(10, 10, 204, 16, 0x22cc44).setOrigin(0);
        this.hpLabel   = this.add.text(14, 11, '', { fontSize: '10px', fill: '#fff', fontFamily: 'Arial' });
        this.areaText  = this.add.text(10, 32, '', { fontSize: '10px', fill: '#aaaaff', fontFamily: 'Arial' });
        this.killText  = this.add.text(10, 48, '', { fontSize: '10px', fill: '#ffaa44', fontFamily: 'Arial' });
        this.npcText   = this.add.text(10, 64, '', { fontSize: '10px', fill: '#aaffaa', fontFamily: 'Arial' });
        this.goldText  = this.add.text(120, 64, '', { fontSize: '10px', fill: '#ffee44', fontFamily: 'Arial' });

        hud.add([bg, hpBarBg, this.hpBar, this.hpLabel, this.areaText, this.killText, this.npcText, this.goldText]);
        this.updateHUD();
    }

    updateHUD() {
        const ratio = this.player.hp / this.player.maxHp;
        this.hpBar.setDisplaySize(204 * ratio, 16);
        this.hpBar.setFillStyle(ratio > 0.5 ? 0x22cc44 : ratio > 0.25 ? 0xffaa00 : 0xff2222);
        this.hpLabel.setText(`HP: ${this.player.hp} / ${this.player.maxHp}`);
        this.areaText.setText(`${this.levelData.name}`);
        this.killText.setText(`Zabito: ${Math.min(this.killCount, KILLS_NEEDED)} / ${KILLS_NEEDED}`);
        this.npcText.setText(`NPC: ${this.npcTalked ? '✓' : '✗'}`);
        this.goldText.setText(`Zlato: ${this.gold}`);
    }

    triggerBattle(player, enemy) {
        if (this.inBattle || this.inDialog) return;
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
        this.inBattle  = false;
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
        const cam = this.cameras.main;
        const bg  = this.add.rectangle(0, 0, 702, 110, 0x000011, 0.9).setOrigin(0).setDepth(100);
        bg.setStrokeStyle(2, 0xffee44);
        const txt  = this.add.text(10, 8, msg, { fontSize: '14px', fill: '#fff', fontFamily: 'Arial', wordWrap: { width: 680 } }).setDepth(100);
        const hint = this.add.text(10, 92, 'Stiskni ESC pro zavření', { fontSize: '11px', fill: '#888', fontFamily: 'Arial' }).setDepth(100);
        this.dialogBox = this.add.container(cam.scrollX + 50, cam.scrollY + 440, [bg, txt, hint]).setDepth(100);
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
            if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
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

        const speed = 160;
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown  || this.wasd.A.isDown) vx = -speed;
        if (this.cursors.right.isDown || this.wasd.D.isDown) vx =  speed;
        if (this.cursors.up.isDown    || this.wasd.W.isDown) vy = -speed;
        if (this.cursors.down.isDown  || this.wasd.S.isDown) vy =  speed;
        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
        this.player.setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            this.player.play('warrior_run', true);
            if (vx < 0) this.player.setFlipX(true);
            else if (vx > 0) this.player.setFlipX(false);
        } else {
            this.player.play('warrior_idle', true);
        }
    }
}
