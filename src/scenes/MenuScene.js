export default class MenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MenuScene' }); }

    create() {
        const W = this.scale.width, H = this.scale.height;

        // Background
        this.add.rectangle(W/2, H/2, W, H, 0x0a0a1a);

        // Stars
        for (let i = 0; i < 100; i++) {
            const size = Math.random() * 1.5 + 0.5;
            this.add.circle(Math.random() * W, Math.random() * H, size, 0xffffff, Math.random() * 0.7 + 0.3);
        }

        // Title
        this.add.text(W/2, 100, 'MATH QUEST', {
            fontSize: '68px', fill: '#ffcc00', fontFamily: 'Arial Black',
            stroke: '#885500', strokeThickness: 8,
        }).setOrigin(0.5);

        this.add.text(W/2, 175, 'Dobrodružství s matematikou', {
            fontSize: '20px', fill: '#aaaaee', fontFamily: 'Arial',
        }).setOrigin(0.5);

        // Knight
        const knight = this.add.image(W/2, 295, 'player').setScale(7);
        this.tweens.add({ targets: knight, y: 308, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // Start button
        const btn = this.add.rectangle(W/2, 430, 230, 54, 0x1a44aa).setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(3, 0x55aaff);
        const btnText = this.add.text(W/2, 430, '▶  HRÁT', {
            fontSize: '28px', fill: '#ffffff', fontFamily: 'Arial Black',
        }).setOrigin(0.5);

        btn.on('pointerover', () => { btn.setFillStyle(0x2255cc); });
        btn.on('pointerout',  () => { btn.setFillStyle(0x1a44aa); });
        btn.on('pointerdown', () => {
            this.cameras.main.fadeOut(400);
            this.time.delayedCall(400, () => this.scene.start('GameScene', { level: 0, playerHP: 100, gold: 0 }));
        });

        // Instructions
        this.add.text(W/2, 505, 'Pohyb: WASD nebo šipky  •  Souboj: odpovídej na matematické příklady  •  ESC: útěk', {
            fontSize: '12px', fill: '#555577', fontFamily: 'Arial', align: 'center',
        }).setOrigin(0.5);

        this.add.text(W/2, 530, 'Matematika 7.–8. třída', {
            fontSize: '13px', fill: '#444466', fontFamily: 'Arial',
        }).setOrigin(0.5);
    }
}
