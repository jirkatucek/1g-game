export default class GameOverScene extends Phaser.Scene {
    constructor() { super({ key: 'GameOverScene' }); }

    create() {
        // Ensure theme music continues playing
        if (!this.sound.get('theme_adventure')?.isPlaying) {
            this.sound.play('theme_adventure', { loop: true, volume: 0.5 });
        }

        const W = this.scale.width, H = this.scale.height;
        this.add.rectangle(W/2, H/2, W, H, 0x080000);

        this.add.text(W/2, H * 0.22, 'GAME OVER', {
            fontSize: '76px', fill: '#ff2222', fontFamily: 'Arial Black',
            stroke: '#660000', strokeThickness: 8,
        }).setOrigin(0.5);

        this.add.text(W/2, H * 0.38, 'Byl jsi poražen příšerami...', {
            fontSize: '22px', fill: '#ff8888', fontFamily: 'Arial',
        }).setOrigin(0.5);

        this.add.text(W/2, H * 0.46, 'Procvič si matematiku a zkus to znovu!', {
            fontSize: '16px', fill: '#aa4444', fontFamily: 'Arial',
        }).setOrigin(0.5);

        const btn = this.add.rectangle(W/2, H * 0.6, 260, 54, 0x441111).setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(3, 0xff4444);
        this.add.text(W/2, H * 0.6, 'ZKUSIT ZNOVU', {
            fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial Black',
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0x661111));
        btn.on('pointerout',  () => btn.setFillStyle(0x441111));
        btn.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}
