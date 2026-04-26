import { LEVELS } from '../maps/levels.js';

const TILE = 32;

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

        const { x, y } = this.levelData.playerStart;
        this.player = this.physics.add.sprite(x * TILE + 16, y * TILE + 16, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.hp    = this.playerHP;
        this.player.maxHp = this.playerMaxHP;
        this.player.setDepth(10);

        this.physics.add.collider(this.player, this.walls);

        this.enemies = this.physics.add.group();
        this.spawnEnemies();
        this.physics.add.overlap(this.player, this.enemies, this.triggerBattle, null, this);

        this.npcs = this.physics.add.staticGroup();
        this.spawnNPCs();
        this.physics.add.overlap(this.player, this.npcs, this.openDialog, null, this);

        this.cameras.main.setBounds(0, 0, worldW, worldH);
        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd    = this.input.keyboard.addKeys('W,A,S,D');
        this.escKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.createHUD();

        // Listen for results from BattleScene via registry
        this.events.on('resume', () => {
            const result = this.game.registry.get('battleResult');
            if (!result) return;
            this.game.registry.remove('battleResult');
            this.handleBattleResult(result);
        }, this);
    }

    renderTiles() {
        const keys = ['grass', 'tree', 'path', 'water'];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.add.image(c * TILE + 16, r * TILE + 16, keys[this.mapData[r][c]]);
            }
        }
    }

    buildWalls() {
        this.walls = this.physics.add.staticGroup();
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const t = this.mapData[r][c];
                if (t === 1 || t === 3) {
                    this.walls.create(c * TILE + 16, r * TILE + 16, t === 1 ? 'tree' : 'water')
                        .setImmovable(true).refreshBody();
                }
            }
        }
    }

    spawnEnemies() {
        this.levelData.enemies.forEach((ed, i) => {
            const e = this.enemies.create(ed.x * TILE + 16, ed.y * TILE + 16, ed.type);
            e.enemyData  = ed;
            e.enemyIndex = i;
            e.setDepth(10);

            // Wander timer
            this.time.addEvent({
                delay: 1800 + Math.random() * 1200,
                loop: true,
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
            const npc = this.npcs.create(nd.x * TILE + 16, nd.y * TILE + 16, 'npc');
            npc.npcData = nd;
            npc.setDepth(10);
            // Exclamation mark
            this.add.text(nd.x * TILE + 16, nd.y * TILE - 10, '!', {
                fontSize: '18px', fill: '#ffff00', fontFamily: 'Arial Black',
            }).setOrigin(0.5).setDepth(11);
        });
    }

    createHUD() {
        const hud = this.add.container(0, 0).setScrollFactor(0).setDepth(50);

        const bg = this.add.rectangle(6, 6, 212, 68, 0x000000, 0.7).setOrigin(0);
        this.hpBarBg  = this.add.rectangle(10, 10, 204, 18, 0x333333).setOrigin(0);
        this.hpBar    = this.add.rectangle(10, 10, 204, 18, 0x22cc44).setOrigin(0);
        this.hpLabel  = this.add.text(14, 11, '', { fontSize: '11px', fill: '#fff', fontFamily: 'Arial' });
        this.areaText = this.add.text(10, 34, '', { fontSize: '11px', fill: '#aaaaff', fontFamily: 'Arial' });
        this.goldText = this.add.text(10, 50, '', { fontSize: '11px', fill: '#ffee44', fontFamily: 'Arial' });

        hud.add([bg, this.hpBarBg, this.hpBar, this.hpLabel, this.areaText, this.goldText]);
        this.updateHUD();
    }

    updateHUD() {
        const ratio = this.player.hp / this.player.maxHp;
        this.hpBar.setDisplaySize(204 * ratio, 18);
        this.hpBar.setFillStyle(ratio > 0.5 ? 0x22cc44 : ratio > 0.25 ? 0xffaa00 : 0xff2222);
        this.hpLabel.setText(`HP: ${this.player.hp} / ${this.player.maxHp}`);
        this.areaText.setText(`Oblast: ${this.levelData.name}`);
        this.goldText.setText(`Zlato: ${this.gold}`);
    }

    triggerBattle(player, enemy) {
        if (this.inBattle || this.inDialog) return;
        this.inBattle = true;
        enemy.setVelocity(0, 0);

        this.scene.launch('BattleScene', {
            enemyData:    enemy.enemyData,
            enemyIndex:   enemy.enemyIndex,
            playerHP:     player.hp,
            playerMaxHP:  player.maxHp,
        });
        this.scene.pause();
    }

    handleBattleResult(data) {
        this.inBattle = false;
        this.player.hp = data.playerHP;

        if (data.result === 'win') {
            this.enemies.getChildren().slice().forEach(e => {
                if (e.enemyIndex === data.enemyIndex) e.destroy();
            });
            this.gold += data.goldEarned ?? 10;
            this.updateHUD();

            if (this.enemies.countActive(true) === 0) {
                this.time.delayedCall(600, () => this.nextLevel());
            }
        } else if (data.result === 'lose') {
            this.time.delayedCall(400, () => this.scene.start('GameOverScene'));
        } else {
            // fled
            this.updateHUD();
            if (this.player.hp <= 0) {
                this.time.delayedCall(400, () => this.scene.start('GameOverScene'));
            }
        }
    }

    openDialog(player, npc) {
        if (this.inDialog || this.inBattle || this.dialogCooldown) return;
        this.inDialog = true;
        this.showDialog(npc.npcData.message);
    }

    showDialog(msg) {
        if (this.dialogBox) { this.dialogBox.destroy(); this.dialogBox = null; }

        const cam  = this.cameras.main;
        const ox   = cam.scrollX + 50;
        const oy   = cam.scrollY + 440;

        const bg   = this.add.rectangle(0, 0, 702, 110, 0x000011, 0.9).setOrigin(0).setDepth(100);
        bg.setStrokeStyle(2, 0xffee44);
        const txt  = this.add.text(10, 8, msg, {
            fontSize: '14px', fill: '#ffffff', fontFamily: 'Arial',
            wordWrap: { width: 680 }
        }).setDepth(100);
        const hint = this.add.text(10, 92, 'Stiskni ESC pro zavření', {
            fontSize: '11px', fill: '#888888', fontFamily: 'Arial'
        }).setDepth(100);

        this.dialogBox = this.add.container(ox, oy, [bg, txt, hint]).setDepth(100);
    }

    nextLevel() {
        const next = this.currentLevel + 1;
        if (next < LEVELS.length) {
            this.scene.start('GameScene', { level: next, playerHP: this.player.hp, gold: this.gold });
        } else {
            this.scene.start('VictoryScene');
        }
    }

    update() {
        if (this.inBattle) return;

        // Close dialog
        if (this.inDialog) {
            if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
                if (this.dialogBox) { this.dialogBox.destroy(); this.dialogBox = null; }
                this.inDialog = false;
                this.dialogCooldown = true;
                this.time.delayedCall(3000, () => { this.dialogCooldown = false; });
            }
            // Keep dialog anchored to camera
            if (this.dialogBox) {
                this.dialogBox.setPosition(this.cameras.main.scrollX + 50, this.cameras.main.scrollY + 440);
            }
            this.player.setVelocity(0, 0);
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
    }
}
