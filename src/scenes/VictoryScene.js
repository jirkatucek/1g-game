import { playRandomClick } from '../utils/SoundEffects.js';
import { applyAudioPreferences, loadGameState, playThemeMusic, saveGameState } from '../utils/GameState.js';

export default class VictoryScene extends Phaser.Scene {
    constructor() { super({ key: 'VictoryScene' }); }

    create() {
        const prefs = loadGameState();
        applyAudioPreferences(this, prefs);
        playThemeMusic(this, prefs);

        saveGameState({
            currentLevel: 0,
            lastLevel: prefs.currentLevel ?? prefs.lastLevel ?? 0,
            playerHP: 100,
            gold: 0,
            killCount: 0,
            npcTalked: false,
            resumeMode: 'fresh',
        });

        const W = this.scale.width, H = this.scale.height;
        this.add.rectangle(W/2, H/2, W, H, 0x080800);

        this.add.text(W/2, H * 0.18, '🏆 VÍTĚZ! 🏆', {
            fontSize: '80px', fill: '#ffdd00', fontFamily: 'Arial Black',
            stroke: '#886600', strokeThickness: 8,
        }).setOrigin(0.5);

        this.add.text(W/2, H * 0.32, 'Zdolal jsi všechny oblasti!', {
            fontSize: '26px', fill: '#ffffaa', fontFamily: 'Arial',
        }).setOrigin(0.5);

        this.add.text(W/2, H * 0.4, 'Království je zachráněno díky tvé matematice!', {
            fontSize: '17px', fill: '#cccc88', fontFamily: 'Arial',
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 250, repeat: 30,
            callback: () => {
                const colors = [0xff4444, 0x44ff44, 0x4488ff, 0xffff44, 0xff44ff, 0x44ffff, 0xffffff];
                for (let i = 0; i < 5; i++) {
                    const px = Math.random() * W;
                    const py = Math.random() * H * 0.6;
                    const c  = colors[Math.floor(Math.random() * colors.length)];
                    const dot = this.add.circle(px, py, 5, c);
                    this.tweens.add({ targets: dot, alpha: 0, scaleX: 4, scaleY: 4, duration: 700, onComplete: () => dot.destroy() });
                }
            }
        });

        const btn = this.add.rectangle(W/2, H * 0.6, 260, 54, 0x114411).setInteractive({ useHandCursor: true });
        btn.setStrokeStyle(3, 0x44ff44);
        this.add.text(W/2, H * 0.6, 'HRÁT ZNOVU', {
            fontSize: '24px', fill: '#ffffff', fontFamily: 'Arial Black',
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0x226622));
        btn.on('pointerout',  () => btn.setFillStyle(0x114411));
        btn.on('pointerdown', () => {
            playRandomClick(this);
            this.scene.start('MenuScene');
        });
    }
}
