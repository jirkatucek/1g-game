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

        // Background
        this.add.image(W / 2, H / 2, 'menu_bg').setDisplaySize(W, H).setDepth(0);

        // Gold border
        const g = this.add.graphics().setDepth(1);
        const brd = 16;
        g.lineStyle(brd, 0xffcc00, 1);
        g.strokeRect(brd / 2, brd / 2, W - brd, H - brd);
        g.lineStyle(4, 0x2255cc, 1);
        g.strokeRect(brd + 6, brd + 6, W - (brd + 6) * 2, H - (brd + 6) * 2);

        // MATH QUEST logo — 1846×828
        const logo = this.add.image(W / 2, H * 0.23, 'menu_logo').setDepth(2);
        logo.setScale(Math.min((W * 0.36) / logo.width, (H * 0.28) / logo.height));

        // Subtitle — těsně pod logem
        const sub = this.add.image(W / 2, H * 0.23 + logo.displayHeight * 0.5 + 22, 'menu_subtitle').setDepth(2);
        sub.setScale(Math.min((W * 0.36) / sub.width, (H * 0.048) / sub.height));

        // Row of 3 buttons: HRÁT | LEVELY | NASTAVENÍ
        const btnDisplayH = H * 0.095;
        const btnSpacing  = W * 0.28;
        const btnY        = H * 0.60;

        const scaleHrat      = btnDisplayH / this.textures.get('menu_btn_hrat').getSourceImage().height;
        const scaleLevely    = btnDisplayH / this.textures.get('menu_btn_levely').getSourceImage().height;
        const scaleNastaveni = btnDisplayH / this.textures.get('menu_btn_nastaveni').getSourceImage().height;

        this.makeImageButton(W / 2 - btnSpacing, btnY, 'menu_btn_hrat',      scaleHrat,      () => this.resumeGame());
        this.makeImageButton(W / 2,               btnY, 'menu_btn_levely',    scaleLevely,    () => this.toggleLevelSelect());
        this.makeImageButton(W / 2 + btnSpacing,  btnY, 'menu_btn_nastaveni', scaleNastaveni, () => this.toggleSettings());

        // ODEJÍT below the row — 1625×395
        const scaleOdejit = btnDisplayH / this.textures.get('menu_btn_odejit').getSourceImage().height;
        this.makeImageButton(W / 2, H * 0.76, 'menu_btn_odejit', scaleOdejit, () => this.exitGame());

        // WASD help text — 1451×49
        const wasd = this.add.image(W / 2, H * 0.91, 'menu_wasd').setDepth(2);
        wasd.setScale(Math.min((W * 0.50) / wasd.width, (H * 0.05) / wasd.height));

        // Company logo — 678×657, bottom right
        const clogo = this.add.image(W - 110, H - 80, 'menu_company').setDepth(2);
        clogo.setScale(Math.min(160 / clogo.width, 160 / clogo.height));

        // Panels (hidden)
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

        playThemeMusic(this, this.saveData);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this);
    }

    makeImageButton(x, y, textureKey, scale, callback) {
        const img = this.add.image(x, y, textureKey)
            .setScale(scale)
            .setDepth(2)
            .setInteractive({ useHandCursor: true });

        img.on('pointerover', () => img.setScale(scale * 1.06));
        img.on('pointerout',  () => img.setScale(scale));
        img.on('pointerdown', () => { img.setScale(scale * 0.96); img.setY(y + 4); });
        img.on('pointerup',   () => {
            img.setScale(scale);
            img.setY(y);
            playRandomClick(this);
            callback();
        });
        return img;
    }

    buildLevelPanel(W, H) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55)
            .setInteractive()
            .setDepth(80);

        const container = this.add.container(0, 0).setDepth(90);

        const pW = W * 0.58, pH = H * 0.68;
        const bg = this.add.rectangle(W / 2, H / 2, pW, pH, 0x0d0d2a)
            .setStrokeStyle(3, 0x3355aa)
            .setInteractive();
        container.add(bg);

        const title = this.add.text(W / 2 - 40, H * 0.22, 'Výběr levelu', {
            fontSize: '38px', fill: '#ffcc44', fontFamily: 'Arial Black',
        }).setOrigin(0.5);
        container.add(title);

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
            // ignore browser restrictions
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

        const volLabelY = H * 0.38;
        const volLabel = this.add.text(W / 2 - pW / 2 + 30, volLabelY, '🔊 Hlasitost:', {
            fontSize: '24px', fill: '#aaaaff', fontFamily: 'Arial Black',
        }).setOrigin(0, 0.5);
        container.add(volLabel);

        const sliderW = 280, sliderH = 12;
        const sliderX = W / 2 + pW / 2 - 160, sliderY = volLabelY;
        const sliderLeft = sliderX - sliderW / 2;
        const sliderBg = this.add.rectangle(sliderX, sliderY, sliderW, sliderH, 0x1a1a2a)
            .setStrokeStyle(2, 0x3355aa)
            .setOrigin(0.5, 0.5);
        container.add(sliderBg);

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
            const sound = this.sound.get('theme_adventure');
            if (sound) sound.setVolume(vol);
            this.sound.mute = vol === 0;
            this.currentVolume = vol;
            saveGameState({ volume: vol, sfxVolume: vol, muted: vol === 0 });
        };
        this.input.on('pointermove', this._menuVolumeMove);

        const muteY = H * 0.52;
        const muteBg = this.add.rectangle(W / 2, muteY, 420, 70, 0x1a3344)
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
            const sound = this.sound.get('theme_adventure');
            if (sound) {
                if (sound.volume > 0) {
                    this.currentVolume = sound.volume;
                    sound.setVolume(0);
                    this.sound.mute = true;
                    this.volumeButton.setX(sliderLeft);
                    saveGameState({ volume: this.currentVolume, muted: true });
                } else {
                    const newVol = this.currentVolume || GAME_CONFIG.audio.themeVolume;
                    sound.setVolume(newVol);
                    this.sound.mute = false;
                    this.volumeButton.setX(sliderLeft + newVol * sliderW);
                    this.currentVolume = newVol;
                    saveGameState({ volume: newVol, muted: false });
                }
            }
        });
        container.add([muteBg, muteTxt]);

        const creditsY = H * 0.66;
        const creditsBg = this.add.rectangle(W / 2, creditsY, 420, 70, 0x2d4411)
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
