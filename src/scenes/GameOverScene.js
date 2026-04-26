export default class GameOverScene extends Phaser.Scene {
    constructor() { super({ key: 'GameOverScene' }); }

    create() {
        const W = this.scale.width, H = this.scale.height;
        this.add.rectangle(W/2, H/2, W, H, 0x080000);

        this.add.text(W/2, 190, 'GAME OVER', {
            fontSize: '76px', fill: '#ff2222', fontFamily: 'Arial Black',
            stroke: '#660000', strokeThickness: 8,
        }).setOrigin(0.5);

        this.add.text(W/2, 285, 'Byl jsi poražen příšerami...', {
            fontSize: '22px', fill: '#ff8888', fontFamily: 'Arial',
        }).setOrigin(0.5);

        this.add.text(W/2, 325, 'Procvič si matematiku a zkus to znovu!', {
            fontSize: '16px', fill: '#aa4444', fontFamily: 'Arial',
        }).setOrigin(0.5);

        const btn = this.add.rectangle(W/2, 420, 260, 54, 0x441111).setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(3, 0xff4444);
        this.add.text(W/2, 420, 'ZKUSIT ZNOVU', {
            fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial Black',
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0x661111));
        btn.on('pointerout',  () => btn.setFillStyle(0x441111));
        btn.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}
