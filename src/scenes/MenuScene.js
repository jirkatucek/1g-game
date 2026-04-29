import { LEVELS } from '../maps/levels.js';
import { playRandomClick } from '../utils/SoundEffects.js';
import { applyAudioPreferences, getResumePayload, loadGameState, playThemeMusic, saveFreshRun, saveGameState } from '../utils/GameState.js';
import { GAME_CONFIG } from '../utils/GameConfig.js';

export default class MenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MenuScene' }); }

    create() {
        const W = this.scale.width, H = this.scale.height;

        this.saveData = loadGameState();
        this.currentVolume = this.saveData.volume ?? GAME_CONFIG.audio.themeVolume;
        this.lastLevel = this.saveData.currentLevel ?? this.saveData.lastLevel ?? 0;
        applyAudioPreferences(this, this.saveData);

        this.buildBackground(W, H);
        this.buildLeft(W, H);
        this.buildRight(W, H);

        playThemeMusic(this, this.saveData);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this);
    }

    buildBackground(W, H) {
        const g = this.add.graphics();

        // Sky gradient layers
        g.fillStyle(0x061428); g.fillRect(0, 0, W, H);
        g.fillStyle(0x0a1e3a); g.fillRect(0, H * 0.3, W, H * 0.4);

        // Stars
        for (let i = 0; i < 140; i++) {
            const x = Math.random() * W, y = Math.random() * H * 0.85;
            const s = Math.random() * 1.6 + 0.4;
            const a = Math.random() * 0.6 + 0.3;
            g.fillStyle(0xffffff, a); g.fillCircle(x, y, s);
        }
        // A few bright dots
        for (let i = 0; i < 8; i++) {
            g.fillStyle(0xffee88, 0.9);
            g.fillCircle(Math.random() * W, Math.random() * H * 0.8, 2.5);
        }
        
        const platH = H * 0.12, platY = H - platH / 2;
        g.fillStyle(0x0b1c2e); g.fillRect(0, H - platH, W, platH);
        const platW = W / 14;
        for (let i = 0; i < 14; i++) {
            g.fillStyle(0x0d2236); g.fillRect(i * platW + 2, H - platH + 4, platW - 4, platH - 8);
            // Tiny green dots on each platform
            for (let j = 0; j < 3; j++) {
                g.fillStyle(0x22ff44, 0.5);
                g.fillCircle(i * platW + 20 + j * 18, H - 18, 2);
            }
        }

        // Outer gold border
        const brd = 16;
        g.lineStyle(brd, 0xffcc00, 1);
        g.strokeRect(brd / 2, brd / 2, W - brd, H - brd);

        // Inner blue border
        g.lineStyle(4, 0x2255cc, 1);
        g.strokeRect(brd + 6, brd + 6, W - (brd + 6) * 2, H - (brd + 6) * 2);

        // Corner plus decorations
        const plusColor = 0x44aacc, plusAlpha = 0.9;
        const corners = [[55, 58], [W - 55, 58], [55, H - 58], [W - 55, H - 58]];
        corners.forEach(([cx, cy]) => {
            g.fillStyle(plusColor, plusAlpha);
            g.fillRect(cx - 14, cy - 4, 28, 8);
            g.fillRect(cx - 4, cy - 14, 8, 28);
        });

        // Central dotted vertical divider
        const divX = W / 2;
        for (let y = brd + 20; y < H - platH - 10; y += 22) {
            g.fillStyle(0xffcc00, 0.55); g.fillRect(divX - 2, y, 4, 12);
        }

    }

    buildLeft(W, H) {
        const cx = W * 0.28;

        this.add.text(cx, H * 0.16, 'MATH', {
            fontSize: '130px', fill: '#ffcc00', fontFamily: 'Arial Black',
            stroke: '#885500', strokeThickness: 10,
        }).setOrigin(0.5);

        this.add.text(cx, H * 0.30, 'QUEST', {
            fontSize: '130px', fill: '#ff8800', fontFamily: 'Arial Black',
            stroke: '#551100', strokeThickness: 10,
        }).setOrigin(0.5);

        this.add.text(cx, H * 0.41, 'Dobrodružství s matematikou', {
            fontSize: '28px', fill: '#aaaaee', fontFamily: 'Arial',
        }).setOrigin(0.5);

        const knight = this.add.sprite(cx, H * 0.64, 'warrior_idle').setScale(3.5);
        knight.play('warrior_idle');
        this.tweens.add({ targets: knight, y: H * 0.64 + 12, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        this.add.text(cx, H * 0.885, 'Pohyb: WASD / šipky   •   Souboj: odpovídej na příklady   •   ESC: útěk', {
            fontSize: '17px', fill: '#44496a', fontFamily: 'Arial', align: 'center', wordWrap: { width: 520 },
        }).setOrigin(0.5);
    }

    buildRight(W, H) {
        const cx = W * 0.74;
        const startY = H * 0.2;
        const gap = H * 0.185;

        const btns = [
            { label: '▶  HRÁT',      fill: 0x7a5200, stroke: 0xffcc00, action: () => this.resumeGame() },
            { label: '☰  LEVELY',    fill: 0x0e2d88, stroke: 0x44aaff, action: () => this.toggleLevelSelect() },
            { label: '⚙  NASTAVENÍ', fill: 0x1a3344, stroke: 0x6688aa, action: () => this.toggleSettings() },
            { label: '✕  ODEJÍT',    fill: 0x881111, stroke: 0xff4444, action: () => this.exitGame() },
        ];

        btns.forEach((def, i) => {
            this.makeButton(cx, startY + i * gap, def.label, def.fill, def.stroke, def.action);
        });

        const { overlay: levelOverlay, panel: levelPanel } = this.buildLevelPanel(W, H);
        this.levelOverlay = levelOverlay;
        this.levelPanel   = levelPanel;
        this.levelOverlay.setVisible(false);
        this.levelPanel.setVisible(false);

        const { overlay: settingsOverlay, panel: settingsPanel } = this.buildSettingsPanel(W, H);
        this.settingsOverlay = settingsOverlay;
        this.settingsPanel = settingsPanel;
        this.settingsOverlay.setVisible(false);
        this.settingsPanel.setVisible(false);

        const { overlay: creditsOverlay, panel: creditsPanel } = this.buildCreditsPanel(W, H);
        this.creditsOverlay = creditsOverlay;
        this.creditsPanel = creditsPanel;
        this.creditsOverlay.setVisible(false);
        this.creditsPanel.setVisible(false);
    }

    makeButton(x, y, label, fillColor, strokeColor, callback) {
        const bw = 480, bh = 90;

        const glow = this.add.rectangle(x, y, bw + 10, bh + 10, strokeColor, 0.18);

        const btn = this.add.rectangle(x, y, bw, bh, fillColor)
            .setStrokeStyle(3, strokeColor)
            .setInteractive({ useHandCursor: true });

        // Top sheen
        this.add.rectangle(x, y - bh / 2 + 11, bw - 8, 16, 0xffffff, 0.1);

        const txt = this.add.text(x, y + 2, label, {
            fontSize: '40px', fill: '#ffffff', fontFamily: 'Arial Black',
            stroke: '#000000', strokeThickness: 5,
        }).setOrigin(0.5);

        btn.on('pointerover', () => {
            btn.setFillStyle(this.lighten(fillColor));
            glow.setAlpha(0.45);
            txt.setScale(1.05);
        });
        btn.on('pointerout', () => {
            btn.setFillStyle(fillColor);
            glow.setAlpha(0.18);
            txt.setScale(1.0);
        });
        btn.on('pointerdown', () => {
            playRandomClick(this);
            btn.setY(y + 4); txt.setY(y + 6);
        });
        btn.on('pointerup', () => {
            btn.setY(y); txt.setY(y + 2);
            callback();
        });
    }

    lighten(hex) {
        const r = Math.min(255, ((hex >> 16) & 0xff) + 50);
        const g = Math.min(255, ((hex >> 8)  & 0xff) + 50);
        const b = Math.min(255, (hex         & 0xff) + 50);
        return (r << 16) | (g << 8) | b;
    }

    buildLevelPanel(W, H) {
        // Full-screen blocker — zachytí všechny kliknutí pod panelem
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55)
            .setInteractive()
            .setDepth(80);

        const container = this.add.container(0, 0).setDepth(90);

        // Panel background — plně neprůhledný, také interaktivní aby blokoval kliknutí
        const pW = W * 0.58, pH = H * 0.68;
        const bg = this.add.rectangle(W / 2, H / 2, pW, pH, 0x0d0d2a)
            .setStrokeStyle(3, 0x3355aa)
            .setInteractive();
        container.add(bg);

        const title = this.add.text(W / 2 - 40, H * 0.22, 'Výběr levelu', {
            fontSize: '38px', fill: '#ffcc44', fontFamily: 'Arial Black',
        }).setOrigin(0.5);
        container.add(title);

        // Křížek — větší, uvnitř panelu vpravo nahoře
        const closeX = W / 2 + pW / 2 - 44;
        const closeY = H / 2 - pH / 2 + 40;
        const closeBg = this.add.rectangle(closeX, closeY, 52, 52, 0x881111)
            .setStrokeStyle(2, 0xff4444)
            .setInteractive({ useHandCursor: true });
        const closeTxt = this.add.text(closeX, closeY + 2, '✕', {
            fontSize: '34px', fill: '#ffffff', fontFamily: 'Arial Black',
        }).setOrigin(0.5);
        closeBg.on('pointerover',  () => closeBg.setFillStyle(0xcc2222));
        closeBg.on('pointerout',   () => closeBg.setFillStyle(0x881111));
        closeBg.on('pointerdown',  () => closeBg.setFillStyle(0xff2222));
        closeBg.on('pointerup', (pointer, lx, ly, event) => {
            event.stopPropagation();
            playRandomClick(this);
            closeBg.setFillStyle(0x881111);
            this.toggleLevelSelect();
        });
        container.add([closeBg, closeTxt]);

        // Mřížka levelů
        const cols = 5;
        const gridW = pW * 0.88;
        const cellW = gridW / cols;
        const cellH = 120;
        const gridStartX = W / 2 - gridW / 2 + cellW / 2;
        const gridStartY = H * 0.4;

        LEVELS.forEach((lvl, i) => {
            const col = i % cols, row = Math.floor(i / cols);
            const bx = gridStartX + col * cellW;
            const by = gridStartY + row * (cellH + 16);

            const b = this.add.rectangle(bx, by, cellW - 12, cellH, 0x112233)
                .setStrokeStyle(2, 0x3355aa)
                .setInteractive({ useHandCursor: true });
            const lbl  = this.add.text(bx, by - 18, `Level ${i + 1}`, { fontSize: '16px', fill: '#ffcc44', fontFamily: 'Arial Black' }).setOrigin(0.5);
            const name = this.add.text(bx, by + 6,  lvl.name, { fontSize: '12px', fill: '#8888aa', fontFamily: 'Arial', wordWrap: { width: cellW - 20 }, align: 'center' }).setOrigin(0.5);

            b.on('pointerover', () => b.setFillStyle(0x1a3355));
            b.on('pointerout',  () => b.setFillStyle(0x112233));
            b.on('pointerup', (pointer, lx, ly, event) => {
                event.stopPropagation();
                playRandomClick(this);
                this.toggleLevelSelect();
                this.startLevel(i);
            });

            container.add([b, lbl, name]);
        });

        return { overlay, panel: container };
    }

    toggleLevelSelect() {
        const show = !this.levelPanel.visible;
        this.levelOverlay.setVisible(show);
        this.levelPanel.setVisible(show);
    }

    toggleSettings() {
        const show = !this.settingsPanel.visible;
        this.settingsOverlay.setVisible(show);
        this.settingsPanel.setVisible(show);
    }

    toggleCredits() {
        const show = !this.creditsPanel.visible;
        this.creditsOverlay.setVisible(show);
        this.creditsPanel.setVisible(show);
    }

    startLevel(index = this.lastLevel ?? 0) {
        this.lastLevel = index;
        this.saveData = saveFreshRun(this, index, { muted: this.sound.mute, volume: this.currentVolume, sfxVolume: loadGameState().sfxVolume });
        this.registry.set('lastLevel', index);
        this.cameras.main.fadeOut(300);
        this.time.delayedCall(300, () => this.scene.start('GameScene', {
            level: index,
            playerHP: 100,
            gold: 0,
            killCount: 0,
            npcTalked: false,
        }));
    }

    resumeGame() {
        const saved = loadGameState();
        const freshLevel = saved.resumeMode === 'resume' ? saved.currentLevel : (saved.currentLevel ?? saved.unlockedLevel ?? 0);
        const payload = saved.resumeMode === 'resume'
            ? getResumePayload(saved)
            : { level: freshLevel, playerHP: 100, gold: 0, killCount: 0, npcTalked: false };

        this.lastLevel = payload.level ?? freshLevel;
        this.registry.set('lastLevel', this.lastLevel);
        this.cameras.main.fadeOut(300);
        this.time.delayedCall(300, () => this.scene.start('GameScene', payload));
    }

    exitGame() {
        try {
            window.open('', '_self');
            window.close();
        } catch (error) {
            // Ignore browser restrictions and fall back below.
        }

        if (!window.closed) {
            window.location.replace('about:blank');
        }
    }

    buildSettingsPanel(W, H) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55)
            .setInteractive()
            .setDepth(80);

        const container = this.add.container(0, 0).setDepth(90);

        const pW = W * 0.50, pH = H * 0.55;
        const bg = this.add.rectangle(W / 2, H / 2, pW, pH, 0x0d0d2a)
            .setStrokeStyle(3, 0x3355aa)
            .setInteractive();
        container.add(bg);

        const title = this.add.text(W / 2, H * 0.24, 'NASTAVENÍ', {
            fontSize: '36px', fill: '#ffcc44', fontFamily: 'Arial Black',
        }).setOrigin(0.5);
        container.add(title);

        // Close button
        const closeX = W / 2 + pW / 2 - 38;
        const closeY = H / 2 - pH / 2 + 32;
        const closeBg = this.add.rectangle(closeX, closeY, 48, 48, 0x881111)
            .setStrokeStyle(2, 0xff4444)
            .setInteractive({ useHandCursor: true });
        const closeTxt = this.add.text(closeX, closeY + 2, '✕', {
            fontSize: '30px', fill: '#ffffff', fontFamily: 'Arial Black',
        }).setOrigin(0.5);
        closeBg.on('pointerover', () => closeBg.setFillStyle(0xcc2222));
        closeBg.on('pointerout', () => closeBg.setFillStyle(0x881111));
        closeBg.on('pointerup', (pointer, lx, ly, event) => {
            event.stopPropagation();
            playRandomClick(this);
            this.toggleSettings();
        });
        container.add([closeBg, closeTxt]);

        // Volume label
        const volLabelY = H * 0.38;
        const volLabel = this.add.text(W / 2 - pW / 2 + 30, volLabelY, '🔊 Hlasitost:', {
            fontSize: '24px', fill: '#aaaaff', fontFamily: 'Arial Black',
        }).setOrigin(0, 0.5);
        container.add(volLabel);

        // Volume slider background
        const sliderW = 280, sliderH = 12;
        const sliderX = W / 2 + pW / 2 - 160, sliderY = volLabelY;
        const sliderLeft = sliderX - sliderW / 2;  // Levý okraj slideru
        const sliderBg = this.add.rectangle(sliderX, sliderY, sliderW, sliderH, 0x1a1a2a)
            .setStrokeStyle(2, 0x3355aa)
            .setOrigin(0.5, 0.5);
        container.add(sliderBg);

        // Volume slider button
        const themeSound = this.sound.get('theme_adventure');
        const initialVol = themeSound ? themeSound.volume : (this.currentVolume || GAME_CONFIG.audio.themeVolume);
        this.volumeButton = this.add.rectangle(sliderLeft + initialVol * sliderW, sliderY, 20, 26, 0xffcc44)
            .setStrokeStyle(2, 0xff8800)
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5, 0.5);
        container.add(this.volumeButton);

        let isDragging = false;
        this.volumeButton.on('pointerdown', () => { isDragging = true; });
        this._menuVolumeUp = () => { isDragging = false; };
        this.input.on('pointerup', this._menuVolumeUp);

        this._menuVolumeMove = (pointer) => {
            if (!isDragging) return;
            const relX = Phaser.Math.Clamp(pointer.x - sliderLeft, 0, sliderW);
            const vol = relX / sliderW;
            this.volumeButton.setX(sliderLeft + relX);
            const themeSound = this.sound.get('theme_adventure');
            if (themeSound) {
                themeSound.setVolume(vol);
            }
            this.sound.mute = vol === 0;
            this.currentVolume = vol;
            // Save master volume and keep SFX in sync with it
            saveGameState({ volume: vol, sfxVolume: vol, muted: vol === 0 });
        };
        this.input.on('pointermove', this._menuVolumeMove);
        

        // Mute button
        const muteY = H * 0.52;
        const muteBw = 420, muteBh = 70;
        const muteBg = this.add.rectangle(W / 2, muteY, muteBw, muteBh, 0x1a3344)
            .setStrokeStyle(2, 0x6688aa)
            .setInteractive({ useHandCursor: true });
        const muteTxt = this.add.text(W / 2, muteY + 2, '🔇 ZTLUMIT/ZESÍLIT', {
            fontSize: '28px', fill: '#ffffff', fontFamily: 'Arial Black',
        }).setOrigin(0.5);
        muteBg.on('pointerover', () => muteBg.setFillStyle(0x2a4455));
        muteBg.on('pointerout', () => muteBg.setFillStyle(0x1a3344));
        muteBg.on('pointerup', (pointer, lx, ly, event) => {
            event.stopPropagation();
            playRandomClick(this);
            const themeSound = this.sound.get('theme_adventure');
            if (themeSound) {
                if (themeSound.volume > 0) {
                    this.currentVolume = themeSound.volume;
                    themeSound.setVolume(0);
                    this.sound.mute = true;
                    this.volumeButton.setX(sliderLeft);
                    saveGameState({ volume: this.currentVolume, muted: true });
                } else {
                    const newVol = this.currentVolume || GAME_CONFIG.audio.themeVolume;
                    themeSound.setVolume(newVol);
                    this.sound.mute = false;
                    this.volumeButton.setX(sliderLeft + newVol * sliderW);
                    this.currentVolume = newVol;
                    saveGameState({ volume: newVol, muted: false });
                }
            }
        });
        container.add([muteBg, muteTxt]);

        // Credits button
        const creditsY = H * 0.66;
        const creditsBw = 420, creditsBh = 70;
        const creditsBg = this.add.rectangle(W / 2, creditsY, creditsBw, creditsBh, 0x2d4411)
            .setStrokeStyle(2, 0x88cc44)
            .setInteractive({ useHandCursor: true });
        const creditsTxt = this.add.text(W / 2, creditsY + 2, '👥 AUTOŘI', {
            fontSize: '28px', fill: '#ffffff', fontFamily: 'Arial Black',
        }).setOrigin(0.5);
        creditsBg.on('pointerover', () => creditsBg.setFillStyle(0x3d5511));
        creditsBg.on('pointerout', () => creditsBg.setFillStyle(0x2d4411));
        creditsBg.on('pointerup', (pointer, lx, ly, event) => {
            event.stopPropagation();
            playRandomClick(this);
            this.toggleSettings();
            this.toggleCredits();
        });
        container.add([creditsBg, creditsTxt]);

        return { overlay, panel: container };
    }

    buildCreditsPanel(W, H) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55)
            .setInteractive()
            .setDepth(80);

        const container = this.add.container(0, 0).setDepth(90);

        const pW = W * 0.55, pH = H * 0.70;
        const bg = this.add.rectangle(W / 2, H / 2, pW, pH, 0x0d0d2a)
            .setStrokeStyle(3, 0x3355aa)
            .setInteractive();
        container.add(bg);

        const title = this.add.text(W / 2, H * 0.18, 'AUTOŘI A ZDROJE', {
            fontSize: '32px', fill: '#ffcc44', fontFamily: 'Arial Black',
        }).setOrigin(0.5);
        container.add(title);

        // Close button
        const closeX = W / 2 + pW / 2 - 40;
        const closeY = H / 2 - pH / 2 + 34;
        const closeBg = this.add.rectangle(closeX, closeY, 50, 50, 0x881111)
            .setStrokeStyle(2, 0xff4444)
            .setInteractive({ useHandCursor: true });
        const closeTxt = this.add.text(closeX, closeY + 2, '✕', {
            fontSize: '32px', fill: '#ffffff', fontFamily: 'Arial Black',
        }).setOrigin(0.5);
        closeBg.on('pointerover', () => closeBg.setFillStyle(0xcc2222));
        closeBg.on('pointerout', () => closeBg.setFillStyle(0x881111));
        closeBg.on('pointerup', (pointer, lx, ly, event) => {
            event.stopPropagation();
            playRandomClick(this);
            this.toggleCredits();
        });
        container.add([closeBg, closeTxt]);

        const creditsText = `
🎮 GAME FRAMEWORK: Phaser 3

🎨 ASSET AUTOR:
Tiny Wonder Forest 1.0

🎵 HUDBA (Theme):
Alexander Nakarada
CreatorChords - Adventure Royalty Free
Medieval Fantasy Music

🛠️  VÝVIN & DESIGN:
Vytvořeno s ❤️ pro učení

📝 MATEMATIKA:
Úlohy 6.-8. třída - Základní matematika
(Aritmetika, zlomky, krácení, sčítání/odčítání)
        `;

        const creditsContent = this.add.text(W / 2, H * 0.50, creditsText, {
            fontSize: '16px', fill: '#aaaaaa', fontFamily: 'Arial', 
            align: 'left', wordWrap: { width: pW - 80 },
        }).setOrigin(0.5);
        container.add(creditsContent);

        // Back button
        const backBtn = this.add.rectangle(W / 2, H / 2 + pH / 2 - 40, 300, 60, 0x1a3344)
            .setStrokeStyle(2, 0x6688aa)
            .setInteractive({ useHandCursor: true });
        const backTxt = this.add.text(W / 2, H / 2 + pH / 2 - 40, '◀  ZPĚT', {
            fontSize: '28px', fill: '#ffffff', fontFamily: 'Arial Black',
        }).setOrigin(0.5);
        backBtn.on('pointerover', () => backBtn.setFillStyle(0x2a4455));
        backBtn.on('pointerout', () => backBtn.setFillStyle(0x1a3344));
        backBtn.on('pointerup', (pointer, lx, ly, event) => {
            event.stopPropagation();
            playRandomClick(this);
            this.toggleCredits();
        });
        container.add([backBtn, backTxt]);

        return { overlay, panel: container };
    }

    shutdownScene() {
        if (this._menuVolumeMove) {
            this.input.off('pointermove', this._menuVolumeMove);
            this._menuVolumeMove = null;
        }
        if (this._menuVolumeUp) {
            this.input.off('pointerup', this._menuVolumeUp);
            this._menuVolumeUp = null;
        }
        
    }
}
