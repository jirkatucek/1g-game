import MathGenerator from '../utils/MathGenerator.js';
import { applyAudioPreferences, loadGameState, playThemeMusic } from '../utils/GameState.js';
import { GAME_CONFIG } from '../utils/GameConfig.js';
import { playRandomClick } from '../utils/SoundEffects.js';

const STATS = {
    goblin: { maxHp: 50,  attack: 10, gold: 5, name: 'Zlomkový Duch' },
    orc:    { maxHp: 90,  attack: 20, gold: 5, name: 'Jmenovatelník'  },
    dragon: { maxHp: 140, attack: 32, gold: 5, name: 'Zlomkový Golem' },
    boss:   { maxHp: 1,   attack: 25, gold: 5, name: 'Kalkulační Golem' },
};

const ENEMY_UNIT_CONFIG = {
    pawn:    { idleKey: 'enemy_pawn_idle',    idleAnim: 'enemy_pawn_idle_anim',    battleScale: 4.0 },
    warrior: { idleKey: 'enemy_warrior_idle', idleAnim: 'enemy_warrior_idle_anim', battleScale: 4.5 },
    archer:  { idleKey: 'enemy_archer_idle',  idleAnim: 'enemy_archer_idle_anim',  battleScale: 4.2 },
    lancer:  { idleKey: 'enemy_lancer_idle',  idleAnim: 'enemy_lancer_idle_anim',  battleScale: 3.0 },
    monk:    { idleKey: 'enemy_monk_idle',    idleAnim: 'enemy_monk_idle_anim',    battleScale: 4.2 },
    boss:    { idleKey: 'boss_idle',          idleAnim: 'boss_idle',               battleScale: 6.0 },
};

export default class BattleScene extends Phaser.Scene {
    constructor() { super({ key: 'BattleScene' }); }

    init(data) {
        this.enemyData   = data.enemyData;
        this.enemyIndex  = data.enemyIndex;
        this.enemyUnit   = data.enemyUnit;
        this.enemyScale  = data.enemyScale;
        this.playerHP    = data.playerHP;
        this.playerMaxHP = data.playerMaxHP;

        const st = STATS[data.enemyData.type] || STATS.goblin;
        this.enemyHP    = st.maxHp;
        this.enemyMaxHP = st.maxHp;
        this.enemyAtk   = (data.enemyData.level >= 3) ? 30 : st.attack;
        this.enemyName  = data.enemyData.name || st.name;
        this.goldReward = st.gold;

        this.isBoss      = data.enemyData.type === 'boss';
        this.bossStreak  = 0;
        this.bossNeeded  = 3;

        this.answerStr  = '';
        this.canAnswer  = true;
        this.wrongCount = 0;
        this.question   = null;

        this._timerActive = false;
        this._timerStartTime = 0;
        this._timerDuration = 0;
        this._timerTotalSeconds = 0;
    }

    create() {
        const prefs = loadGameState();
        applyAudioPreferences(this, prefs);
        playThemeMusic(this, prefs);

        if (this.isBoss) {
            this.sound.stopByKey('theme_adventure');
            this.sound.play('boss_fight_music', { loop: true, volume: 0.7 });
        }

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this);

        const W = this.scale.width, H = this.scale.height;
        const unitByType = {
            goblin: 'pawn',
            orc: 'warrior',
            dragon: 'lancer',
            boss: 'lancer',
        };
        const unit = this.enemyUnit || unitByType[this.enemyData.type] || 'pawn';
        const unitConfig = ENEMY_UNIT_CONFIG[unit] || ENEMY_UNIT_CONFIG.pawn;
        const enemyScale = unitConfig.battleScale;

        const cx = W / 2, cy = H / 2;

        // Background - full screen (tiles properly)
        this.add.image(cx, cy, 'battle_bg').setOrigin(0.5).setDisplaySize(W, H);

        // SOUBOJ banner - top left corner
        this.add.image(W * 0.15, H * 0.06, 'battle_souboj').setOrigin(0.5).setScale(1.5);

        // Player (hero) - left side
        const playerX = W * 0.25, playerY = H * 0.75;
        const playerSprite = this.add.sprite(playerX, playerY, 'warrior_idle', 0).setScale(enemyScale * 0.85);
        if (this.anims.exists('warrior_idle')) playerSprite.play('warrior_idle');

        // Enemy - right side, facing left
        const monsterX = W * 0.75, monsterY = H * 0.75;
        const enemySprite = this.add.sprite(monsterX, monsterY, unitConfig.idleKey, 0).setScale(enemyScale).setFlipX(true);
        if (this.anims.exists(unitConfig.idleAnim)) enemySprite.play(unitConfig.idleAnim);

        // Question panel - center bottom at edge
        this.add.image(cx, H * 0.91, 'battle_question_empty').setOrigin(0.5).setScale(1.0);

        // Question text - inside panel, left aligned, bigger
        this.qText = this.add.text(cx - 200, H * 0.895, '', {
            fontSize: '32px', fill: '#000', fontFamily: 'Arial Black', align: 'left', wordWrap: { width: 400 }
        }).setOrigin(0, 0.5);

        // Answer input - inside panel bottom, centered
        this.aTxt = this.add.text(cx - 100, H * 0.946, '_', {
            fontSize: '24px', fill: '#333', fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        // Player HP - above player (left side)
        this.pHPBar = this.add.rectangle(W * 0.25, H * 0.55, 180, 24, 0x22cc44).setOrigin(0.5);
        this.pHPTxt = this.add.text(W * 0.25, H * 0.55, '', {
            fontSize: '16px', fill: '#fff', fontFamily: 'Arial Black'
        }).setOrigin(0.5);
        this.refreshPlayerHP();

        // Enemy HP - above monster head (right side)
        this.eHPBar = this.add.rectangle(W * 0.75, H * 0.55, 180, 24, 0xdd2222).setOrigin(0.5);
        this.eHPTxt = this.add.text(W * 0.75, H * 0.55, '', {
            fontSize: '16px', fill: '#fff', fontFamily: 'Arial Black'
        }).setOrigin(0.5);
        this.refreshEnemyHP();

        // Timer bar - full width bottom of screen
        this.add.rectangle(cx, H * 0.992, W + 4, 24, 0x333333).setOrigin(0.5);
        this.timerBarBg = this.add.rectangle(0, H * 0.992, W, 20, 0x1a1a1a).setOrigin(0, 0.5);
        this.timerBar = this.add.rectangle(0, H * 0.992, W, 20, 0x22cc44).setOrigin(0, 0.5);
        this.timerLabel = this.add.text(20, H * 0.992, '', {
            fontSize: '14px', fill: '#fff', fontFamily: 'Arial'
        }).setOrigin(0, 0.5);
        this._timerBarW = W;

        // Dummy objects to prevent crashes
        this.fbTxt = this.add.text(cx, H * 0.7, '', { fontSize: '1px', fill: '#000' }).setVisible(false);

        this.input.keyboard.on('keydown', this.onKey, this);
        this.nextQuestion();
        this.cameras.main.flash(250, 80, 0, 120);
    }

    nextQuestion() {
        this.question  = MathGenerator.generate(this.enemyData.level || 1);
        this.answerStr = '';
        this.canAnswer = true;
        this.wrongCount = 0;
        this.qText.setText(this.question.question);
        this.aTxt.setText('_');
        this.fbTxt.setText('');
        this.startTimer();
    }

    startTimer() {
        if (this._timerTween) this._timerTween.stop();
        this._questionStart = this.time.now;
        this.timerBar.setDisplaySize(this._timerBarW, 14);
        this.timerBar.setFillStyle(0x22cc44);
        
        // Čas podle levelu (konfigurovatelné)
        const level = this.enemyData.level || 1;
        const duration = (GAME_CONFIG?.battle?.timeoutByLevel?.[level]) ?? 20000;
        const seconds = Math.round(duration / 1000);
        this.timerLabel.setText(`⏱ ${seconds} sekund na odpověď`);

        this._timerTween = this.tweens.add({
            targets: this.timerBar,
            displayWidth: 0,
            duration: duration,
            ease: 'Linear',
            onUpdate: () => {
                const ratio = this.timerBar.displayWidth / this._timerBarW;
                const color = ratio > 0.5 ? 0x22cc44 : ratio > 0.2 ? 0xffaa00 : 0xff3322;
                this.timerBar.setFillStyle(color);
            },
            onComplete: () => {
                // Čas vypršel - enemy útočí a hráč utrží damage podle konfigurace, pak nový příklad
                this.canAnswer = false;
                this.timerLabel.setText('⏱ Čas vypršel!').setStyle({ fill: '#ff4444' });
                this.fbTxt.setText('✗ Čas vypršel! Nepřítel útočí!').setStyle({ fill: '#ff4444' });
                const timeoutDmg = GAME_CONFIG?.battle?.timeoutDamage ?? 25;
                this.playerHP = Math.max(0, this.playerHP - timeoutDmg);
                this.cameras.main.shake(200, 0.012);
                this.time.delayedCall(1600, () => {
                    this.refreshPlayerHP();
                    if (this.playerHP <= 0) this.lose();
                    else this.nextQuestion();
                });
            },
        });
    }

    stopTimer() {
        if (this._timerTween) { this._timerTween.stop(); this._timerTween = null; }
    }

    getTimedDamage() {
        // Damage pro správnou odpověď (konfigurovatelné)
        return GAME_CONFIG?.battle?.correctDamage ?? 25;
    }

    onKey(e) {
        if (!this.canAnswer) return;
        if (e.key === 'Escape') { playRandomClick(this); this.flee(); return; }
        if (e.key === 'Enter')  { playRandomClick(this); this.submit(); return; }
        if (e.key === 'Backspace') {
            this.answerStr = this.answerStr.slice(0, -1);
        } else if (/^[0-9\/\-]$/.test(e.key) && this.answerStr.length < 10) {
            if (e.key === '-' && this.answerStr.length > 0) return;
            if (e.key === '/' && this.answerStr.includes('/')) return;
            this.answerStr += e.key;
        }
        this.aTxt.setText(this.answerStr || '_');
    }

    submit() {
        if (!this.answerStr || !this.canAnswer) return;
        playRandomClick(this);
        this.canAnswer = false;
        this.stopTimer();

        const correct = this.answerStr === '99' || MathGenerator.checkAnswer(this.answerStr, this.question.answer);

        if (correct) {
            if (this.isBoss) {
                this.bossStreak++;
                this.refreshEnemyHP();
                if (this.bossStreak >= this.bossNeeded) {
                    this.fbTxt.setText('Správně!').setStyle({ fill: '#44ff44' });
                    this.cameras.main.flash(600, 255, 220, 0);
                    this.time.delayedCall(800, () => this.win());
                } else {
                    this.fbTxt.setText(`Správně! ${this.bossStreak}/${this.bossNeeded}`).setStyle({ fill: '#44ff44' });
                    this.time.delayedCall(700, () => this.nextQuestion());
                }
            } else {
                const dmg = this.getTimedDamage();
                const fast = dmg === 25;
                this.fbTxt.setText(fast ? `Správně! −${dmg} HP (rychlá odpověď!)` : `Správně! −${dmg} HP`)
                    .setStyle({ fill: fast ? '#88ff44' : '#44ff44' });
                this.enemyHP = Math.max(0, this.enemyHP - dmg);
                this.cameras.main.flash(180, 0, 180, 0);
                this.time.delayedCall(750, () => {
                    this.refreshEnemyHP();
                    if (this.enemyHP <= 0) this.win();
                    else this.nextQuestion();
                });
            }
        } else {
            this.wrongCount++;
            if (this.isBoss) { this.bossStreak = 0; this.refreshEnemyHP(); }
            const hintLine = this.wrongCount >= 2 ? `\nNápověda: ${this.question.hint}` : '';
            const resetLine = this.isBoss && this.wrongCount === 1 ? '\nSérie přerušena!' : '';
            this.fbTxt.setText(`✗ Špatně! Správně: ${this.question.answer}${hintLine}${resetLine}`).setStyle({ fill: '#ff4444' });
            this.playerHP = Math.max(0, this.playerHP - this.enemyAtk);
            this.cameras.main.shake(200, 0.012);
            this.time.delayedCall(1600, () => {
                this.refreshPlayerHP();
                if (this.isBoss && this.streakText) this.streakText.setText(`Správně v řadě: 0 / ${this.bossNeeded}`);
                if (this.playerHP <= 0) this.lose();
                else this.nextQuestion();
            });
        }
    }

    refreshEnemyHP() {
        const bw = this.scale.width * 0.32;
        if (this.isBoss) {
            this.eHPBar.setDisplaySize(bw, 28);
            this.eHPTxt.setText(`${this.bossStreak}/${this.bossNeeded} správně v řadě`);
            return;
        }
        const r = this.enemyHP / this.enemyMaxHP;
        this.eHPBar.setDisplaySize(bw * r, 28);
        this.eHPTxt.setText(`${this.enemyHP} / ${this.enemyMaxHP}`);
    }

    refreshPlayerHP() {
        const bw = this.scale.width * 0.32;
        const r = this.playerHP / this.playerMaxHP;
        this.pHPBar.setDisplaySize(bw * r, 28);
        this.pHPBar.setFillStyle(r > 0.5 ? 0x22cc44 : r > 0.25 ? 0xffaa00 : 0xff2222);
        this.pHPTxt.setText(`${this.playerHP} / ${this.playerMaxHP}`);
    }

    end(result, extra = {}) {
        this.canAnswer = false;
        this.input.keyboard.off('keydown', this.onKey, this);
        if (this.isBoss) this.sound.stopByKey('boss_fight_music');
        this.game.registry.set('battleResult', {
            result,
            enemyIndex: this.enemyIndex,
            playerHP:   this.playerHP,
            goldEarned: result === 'win' ? this.goldReward : 0,
        });
        this.time.delayedCall(extra.delay ?? 1200, () => {
            this.scene.resume('GameScene');
            this.scene.stop();
        });
    }

    win() {
        this.sound.play('victory_win');
        this.cameras.main.flash(600, 255, 220, 0);
        if (this.isBoss) {
            this.sound.stopByKey('boss_fight_music');
            this.sound.play('theme_adventure', { loop: true, volume: 0.5 });
        }
        this.end('win', { delay: 1500 });
    }

    lose() {
        this.canAnswer = false;
        this.input.keyboard.off('keydown', this.onKey, this);
        if (this.isBoss) this.sound.stopByKey('boss_fight_music');
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'PROHRÁL JSI...', {
            fontSize: '40px', fill: '#ff2222', fontFamily: 'Arial Black',
            stroke: '#660000', strokeThickness: 6,
        }).setOrigin(0.5);
        this.cameras.main.shake(500, 0.02);
        this.time.delayedCall(2000, () => {
            this.scene.stop('GameScene');
            this.scene.start('GameOverScene');
        });
    }

    flee() {
        this.canAnswer = false;
        this.playerHP = Math.max(0, this.playerHP - 20);
        this.refreshPlayerHP();
        this.fbTxt.setText('Utíkáš! −20 HP').setStyle({ fill: '#ff8800' });
        this.end('flee', { delay: 900 });
    }

    shutdownScene() {
        this.input.keyboard.off('keydown', this.onKey, this);
        if (this._timerTween) {
            this._timerTween.stop();
            this._timerTween = null;
        }
    }
}
