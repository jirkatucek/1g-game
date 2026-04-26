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
        const W = 800, H = 600;
        const sprKey = this.isBoss ? 'boss' : this.enemyData.type;

        this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.88);
        this.add.rectangle(W/2, H/2, 720, 530, 0x0e0e2a).setStrokeStyle(3, this.isBoss ? 0xcc4400 : 0x3366cc);

        this.add.text(W/2, 70, this.isBoss ? '🔥 BOSS SOUBOJ! 🔥' : '⚔  SOUBOJ!  ⚔', {
            fontSize: '30px', fill: this.isBoss ? '#ff8800' : '#ff4444',
            fontFamily: 'Arial Black', stroke: '#330000', strokeThickness: 6,
        }).setOrigin(0.5);

        this.add.text(W/2, 108, this.enemyName, {
            fontSize: '20px', fill: '#ffaa44', fontFamily: 'Arial Black',
        }).setOrigin(0.5);

        if (this.isBoss) {
            this.streakText = this.add.text(W/2, 135, `Správně v řadě: 0 / ${this.bossNeeded}`, {
                fontSize: '14px', fill: '#ffff88', fontFamily: 'Arial',
            }).setOrigin(0.5);
        }

        this.add.image(180, 220, sprKey).setScale(this.isBoss ? 6 : 5);

        this.add.text(70, 268, 'HP příšery:', { fontSize: '12px', fill: '#ccc', fontFamily: 'Arial' });
        this.add.rectangle(70, 284, 244, 16, 0x331111).setOrigin(0);
        this.eHPBar = this.add.rectangle(70, 284, 244, 16, 0xdd2222).setOrigin(0);
        this.eHPTxt = this.add.text(192, 284, '', { fontSize: '11px', fill: '#fff', fontFamily: 'Arial' }).setOrigin(0.5, 0);
        this.refreshEnemyHP();

        this.add.image(620, 220, 'player').setScale(5);
        this.add.text(490, 268, 'Tvůj HP:', { fontSize: '12px', fill: '#ccc', fontFamily: 'Arial' });
        this.add.rectangle(490, 284, 244, 16, 0x113311).setOrigin(0);
        this.pHPBar = this.add.rectangle(490, 284, 244, 16, 0x22cc44).setOrigin(0);
        this.pHPTxt = this.add.text(612, 284, '', { fontSize: '11px', fill: '#fff', fontFamily: 'Arial' }).setOrigin(0.5, 0);
        this.refreshPlayerHP();

        this.add.rectangle(W/2, 365, 680, 90, 0x08082a).setStrokeStyle(2, 0x2255aa);
        this.qText = this.add.text(W/2, 365, '', {
            fontSize: '22px', fill: '#fff', fontFamily: 'Arial', align: 'center',
        }).setOrigin(0.5);

        this.add.text(W/2, 428, 'Tvoje odpověď (formát: 3/4):', { fontSize: '13px', fill: '#888', fontFamily: 'Arial' }).setOrigin(0.5);
        this.add.rectangle(W/2, 457, 210, 38, 0x101030).setStrokeStyle(2, 0x44aaff);
        this.aTxt = this.add.text(W/2, 457, '_', {
            fontSize: '26px', fill: '#44ddff', fontFamily: 'Courier New',
        }).setOrigin(0.5);

        this.fbTxt = this.add.text(W/2, 497, '', {
            fontSize: '15px', fill: '#fff', fontFamily: 'Arial', align: 'center',
        }).setOrigin(0.5);

        this.add.text(W/2, 538, 'ENTER = potvrdit   •   ESC = utéct (−20 HP)', {
            fontSize: '11px', fill: '#444466', fontFamily: 'Arial',
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
                this.fbTxt.setText('✓ Správně!').setStyle({ fill: '#44ff44' });
                this.enemyHP = Math.max(0, this.enemyHP - (20 + Math.floor(Math.random() * 15)));
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
        if (this.isBoss) {
            this.eHPBar.setDisplaySize(244, 16);
            this.eHPTxt.setText(`${this.bossStreak}/${this.bossNeeded} správně v řadě`);
            return;
        }
        const r = this.enemyHP / this.enemyMaxHP;
        this.eHPBar.setDisplaySize(244 * r, 16);
        this.eHPTxt.setText(`${this.enemyHP} / ${this.enemyMaxHP}`);
    }

    refreshPlayerHP() {
        const r = this.playerHP / this.playerMaxHP;
        this.pHPBar.setDisplaySize(244 * r, 16);
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
        this.add.text(400, 300, 'VYHRÁNO! 🎉', {
            fontSize: '48px', fill: '#ffff00', fontFamily: 'Arial Black',
            stroke: '#886600', strokeThickness: 6,
        }).setOrigin(0.5);
        this.cameras.main.flash(600, 255, 220, 0);
        this.end('win', { delay: 1500 });
    }

    lose() {
        this.canAnswer = false;
        this.input.keyboard.off('keydown', this.onKey, this);
        this.add.text(400, 300, 'PROHRÁL JSI...', {
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
