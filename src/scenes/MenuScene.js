import { LEVELS } from '../maps/levels.js';

export default class MenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MenuScene' }); }

    create() {
        const W = this.scale.width, H = this.scale.height;

        this.add.rectangle(W/2, H/2, W, H, 0x0a0a1a);
        for (let i = 0; i < 100; i++) {
            const size = Math.random() * 1.5 + 0.5;
            this.add.circle(Math.random() * W, Math.random() * H, size, 0xffffff, Math.random() * 0.7 + 0.3);
        }

        this.add.text(W/2, 80, 'MATH QUEST', {
            fontSize: '62px', fill: '#ffcc00', fontFamily: 'Arial Black',
            stroke: '#885500', strokeThickness: 8,
        }).setOrigin(0.5);

        this.add.text(W/2, 150, 'Dobrodružství s matematikou', {
            fontSize: '18px', fill: '#aaaaee', fontFamily: 'Arial',
        }).setOrigin(0.5);

        const knight = this.add.image(W/2, 250, 'player').setScale(6);
        this.tweens.add({ targets: knight, y: 262, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // Start button
        const btn = this.add.rectangle(W/2, 340, 230, 48, 0x1a44aa).setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(3, 0x55aaff);
        this.add.text(W/2, 340, '▶  HRÁT OD ZAČÁTKU', { fontSize: '20px', fill: '#fff', fontFamily: 'Arial Black' }).setOrigin(0.5);
        btn.on('pointerover', () => btn.setFillStyle(0x2255cc));
        btn.on('pointerout',  () => btn.setFillStyle(0x1a44aa));
        btn.on('pointerdown', () => this.startLevel(0));

        // Level select
        this.add.text(W/2, 395, '— Výběr levelu —', { fontSize: '13px', fill: '#666688', fontFamily: 'Arial' }).setOrigin(0.5);

        LEVELS.forEach((lvl, i) => {
            const x = 120 + i * 140;
            const y = 440;
            const b = this.add.rectangle(x, y, 128, 48, 0x112233).setInteractive({ useHandCursor: true });
            b.setStrokeStyle(2, 0x3355aa);
            this.add.text(x, y - 8, `Level ${i + 1}`, { fontSize: '14px', fill: '#ffcc44', fontFamily: 'Arial Black' }).setOrigin(0.5);
            this.add.text(x, y + 10, lvl.name, { fontSize: '9px', fill: '#8888aa', fontFamily: 'Arial', wordWrap: { width: 120 } }).setOrigin(0.5, 0);
            b.on('pointerover', () => b.setFillStyle(0x1a3355));
            b.on('pointerout',  () => b.setFillStyle(0x112233));
            b.on('pointerdown', () => this.startLevel(i));
        });

        this.add.text(W/2, 510, 'Pohyb: WASD nebo šipky  •  Souboj: odpovídej na matematické příklady  •  ESC: útěk', {
            fontSize: '11px', fill: '#444466', fontFamily: 'Arial', align: 'center',
        }).setOrigin(0.5);
    }

    startLevel(index) {
        this.cameras.main.fadeOut(300);
        this.time.delayedCall(300, () => this.scene.start('GameScene', { level: index, playerHP: 100, gold: 0 }));
    }
}
