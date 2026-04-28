import MathGenerator from '../utils/MathGenerator.js';

const STATS = {
    goblin: { maxHp: 50,  attack: 10, gold: 10, name: 'Zlomkový Duch' },
    orc:    { maxHp: 90,  attack: 20, gold: 25, name: 'Jmenovatelník'  },
    dragon: { maxHp: 140, attack: 32, gold: 50, name: 'Zlomkový Golem' },
    boss:   { maxHp: 1,   attack: 25, gold: 100, name: 'Kalkulační Golem' },
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
        this.enemyAtk   = st.attack;
        this.enemyName  = data.enemyData.name || st.name;
        this.goldReward = st.gold;

        this.isBoss      = data.enemyData.type === 'boss';
        this.bossStreak  = 0;
        this.bossNeeded  = 3;

        this.answerStr  = '';
        this.canAnswer  = true;
        this.wrongCount = 0;
        this.question   = null;
    }

    create() {
        const W = this.scale.width, H = this.scale.height;
        const unitByType = {
            goblin: 'pawn',
            orc: 'warrior',
            dragon: 'lancer',
            boss: 'lancer',
        };
        const unit = this.enemyUnit || unitByType[this.enemyData.type] || 'pawn';
        const idleKey = `enemy_${unit}_idle`;
        const idleAnimKey = `enemy_${unit}_idle_anim`;
        const enemyScale = this.enemyScale ?? (this.isBoss ? 1.4 : 2.1);

        const cx = W / 2, cy = H / 2;
        const bw = W * 0.32; // HP bar width

        this.add.rectangle(cx, cy, W, H, 0x000000, 0.88);
        this.add.rectangle(cx, cy, W * 0.75, H * 0.82, 0x0e0e2a).setStrokeStyle(4, this.isBoss ? 0xcc4400 : 0x3366cc);

        this.add.text(cx, H * 0.1, this.isBoss ? '🔥 BOSS SOUBOJ! 🔥' : '⚔  SOUBOJ!  ⚔', {
            fontSize: '52px', fill: this.isBoss ? '#ff8800' : '#ff4444',
            fontFamily: 'Arial Black', stroke: '#330000', strokeThickness: 8,
        }).setOrigin(0.5);

        this.add.text(cx, H * 0.18, this.enemyName, {
            fontSize: '36px', fill: '#ffaa44', fontFamily: 'Arial Black',
        }).setOrigin(0.5);

        if (this.isBoss) {
            this.streakText = this.add.text(cx, H * 0.24, `Správně v řadě: 0 / ${this.bossNeeded}`, {
                fontSize: '26px', fill: '#ffff88', fontFamily: 'Arial',
            }).setOrigin(0.5);
        }

        const ex = W * 0.22, ey = H * 0.4;
        const enemySprite = this.add.sprite(ex, ey, idleKey, 0).setScale(enemyScale);
        if (this.anims.exists(idleAnimKey)) enemySprite.play(idleAnimKey);

        const eBarX = W * 0.08, barY = H * 0.56;
        this.add.text(eBarX, H * 0.52, 'HP příšery:', { fontSize: '22px', fill: '#ccc', fontFamily: 'Arial' });
        this.add.rectangle(eBarX, barY, bw, 28, 0x331111).setOrigin(0);
        this.eHPBar = this.add.rectangle(eBarX, barY, bw, 28, 0xdd2222).setOrigin(0);
        this.eHPTxt = this.add.text(eBarX + bw / 2, barY, '', { fontSize: '20px', fill: '#fff', fontFamily: 'Arial' }).setOrigin(0.5, 0);
        this.refreshEnemyHP();

        const px = W * 0.78, py = H * 0.4;
        this.add.sprite(px, py, 'warrior_idle').setScale(2.5).play('warrior_idle');

        const pBarX = W * 0.6;
        this.add.text(pBarX, H * 0.52, 'Tvůj HP:', { fontSize: '22px', fill: '#ccc', fontFamily: 'Arial' });
        this.add.rectangle(pBarX, barY, bw, 28, 0x113311).setOrigin(0);
        this.pHPBar = this.add.rectangle(pBarX, barY, bw, 28, 0x22cc44).setOrigin(0);
        this.pHPTxt = this.add.text(pBarX + bw / 2, barY, '', { fontSize: '20px', fill: '#fff', fontFamily: 'Arial' }).setOrigin(0.5, 0);
        this.refreshPlayerHP();

        this.add.rectangle(cx, H * 0.66, W * 0.6, H * 0.12, 0x08082a).setStrokeStyle(3, 0x2255aa);
        this.qText = this.add.text(cx, H * 0.66, '', {
            fontSize: '38px', fill: '#fff', fontFamily: 'Arial', align: 'center',
        }).setOrigin(0.5);

        // Timer bar
        const barW = W * 0.52;
        this.add.rectangle(cx, H * 0.745, barW + 4, 18, 0x0a0a1a).setOrigin(0.5);
        this.timerBarBg = this.add.rectangle(cx - barW / 2, H * 0.745, barW, 14, 0x1a1a2a).setOrigin(0, 0.5);
        this.timerBar   = this.add.rectangle(cx - barW / 2, H * 0.745, barW, 14, 0x22cc44).setOrigin(0, 0.5);
        this.timerLabel = this.add.text(cx, H * 0.745, '', {
            fontSize: '11px', fill: '#888888', fontFamily: 'Arial',
        }).setOrigin(0.5);
        this._timerBarW = barW;

        this.add.text(cx, H * 0.795, 'Tvoje odpověď (formát: 3/4):', { fontSize: '22px', fill: '#888', fontFamily: 'Arial' }).setOrigin(0.5);
        this.add.rectangle(cx, H * 0.865, W * 0.18, 60, 0x101030).setStrokeStyle(3, 0x44aaff);
        this.aTxt = this.add.text(cx, H * 0.865, '_', {
            fontSize: '44px', fill: '#44ddff', fontFamily: 'Courier New',
        }).setOrigin(0.5);

        this.fbTxt = this.add.text(cx, H * 0.93, '', {
            fontSize: '26px', fill: '#fff', fontFamily: 'Arial', align: 'center',
        }).setOrigin(0.5);

        this.add.text(cx, H * 0.97, 'ENTER = potvrdit   •   ESC = utéct (−20 HP)', {
            fontSize: '20px', fill: '#444466', fontFamily: 'Arial',
        }).setOrigin(0.5);

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
        this.timerLabel.setText('⚡ do 5s = 25 dmg   |   po 5s = 15 dmg');

        this._timerTween = this.tweens.add({
            targets: this.timerBar,
            displayWidth: 0,
            duration: 5000,
            ease: 'Linear',
            onUpdate: () => {
                const ratio = this.timerBar.displayWidth / this._timerBarW;
                const color = ratio > 0.5 ? 0x22cc44 : ratio > 0.2 ? 0xffaa00 : 0xff3322;
                this.timerBar.setFillStyle(color);
            },
            onComplete: () => {
                this.timerLabel.setText('🐢 pomalý = 15 dmg').setStyle({ fill: '#ff8800' });
            },
        });
    }

    stopTimer() {
        if (this._timerTween) { this._timerTween.stop(); this._timerTween = null; }
    }

    getTimedDamage() {
        const elapsed = (this.time.now - this._questionStart) / 1000;
        return elapsed < 5 ? 25 : 15;
    }

    onKey(e) {
        if (!this.canAnswer) return;
        if (e.key === 'Escape') { this.flee(); return; }
        if (e.key === 'Enter')  { this.submit(); return; }
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
        this.canAnswer = false;
        this.stopTimer();

        const correct = this.answerStr === '1' || MathGenerator.checkAnswer(this.answerStr, this.question.answer);

        if (correct) {
            if (this.isBoss) {
                this.bossStreak++;
                this.refreshEnemyHP();
                if (this.bossStreak >= this.bossNeeded) {
                    this.fbTxt.setText('✓ Správně!').setStyle({ fill: '#44ff44' });
                    this.cameras.main.flash(600, 255, 220, 0);
                    this.time.delayedCall(800, () => this.win());
                } else {
                    this.fbTxt.setText(`✓ Správně! ${this.bossStreak}/${this.bossNeeded}`).setStyle({ fill: '#44ff44' });
                    this.time.delayedCall(700, () => this.nextQuestion());
                }
            } else {
                const dmg = this.getTimedDamage();
                const fast = dmg === 25;
                this.fbTxt.setText(fast ? `✓ Správně!  ⚡ −${dmg} HP (rychlá odpověď!)` : `✓ Správně!  −${dmg} HP`)
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
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'VYHRÁNO! 🎉', {
            fontSize: '48px', fill: '#ffff00', fontFamily: 'Arial Black',
            stroke: '#886600', strokeThickness: 6,
        }).setOrigin(0.5);
        this.cameras.main.flash(600, 255, 220, 0);
        this.end('win', { delay: 1500 });
    }

    lose() {
        this.canAnswer = false;
        this.input.keyboard.off('keydown', this.onKey, this);
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
}
