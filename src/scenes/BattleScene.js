import MathGenerator from '../utils/MathGenerator.js';

const STATS = {
    goblin: { maxHp: 60,  attack: 12, gold: 10, name: 'Goblin' },
    orc:    { maxHp: 100, attack: 22, gold: 25, name: 'Ork'    },
    dragon: { maxHp: 160, attack: 38, gold: 60, name: 'Drak'   },
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
        this.enemyName  = st.name;
        this.goldReward = st.gold;

        this.answerStr  = '';
        this.canAnswer  = true;
        this.wrongCount = 0;
        this.question   = null;
    }

    create() {
        const W = 800, H = 600;

        // Dark overlay
        this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.88);

        // Panel
        const panel = this.add.rectangle(W/2, H/2, 720, 530, 0x0e0e2a);
        panel.setStrokeStyle(3, 0x3366cc);

        // Header
        this.add.text(W/2, 70, '⚔  SOUBOJ!  ⚔', {
            fontSize: '30px', fill: '#ff4444', fontFamily: 'Arial Black',
            stroke: '#660000', strokeThickness: 6,
        }).setOrigin(0.5);

        this.add.text(W/2, 108, this.enemyName, {
            fontSize: '20px', fill: '#ffaa44', fontFamily: 'Arial Black',
        }).setOrigin(0.5);

        // Enemy sprite
        this.add.image(180, 220, this.enemyData.type).setScale(5);

        // Enemy HP
        this.add.text(70, 268, 'HP příšery:', { fontSize: '12px', fill: '#ccc', fontFamily: 'Arial' });
        this.add.rectangle(70, 284, 244, 16, 0x331111).setOrigin(0);
        this.eHPBar  = this.add.rectangle(70, 284, 244, 16, 0xdd2222).setOrigin(0);
        this.eHPTxt  = this.add.text(192, 284, '', { fontSize: '11px', fill: '#fff', fontFamily: 'Arial' }).setOrigin(0.5, 0);
        this.refreshEnemyHP();

        // Player sprite
        this.add.image(620, 220, 'player').setScale(5);

        // Player HP
        this.add.text(490, 268, 'Tvůj HP:', { fontSize: '12px', fill: '#ccc', fontFamily: 'Arial' });
        this.add.rectangle(490, 284, 244, 16, 0x113311).setOrigin(0);
        this.pHPBar  = this.add.rectangle(490, 284, 244, 16, 0x22cc44).setOrigin(0);
        this.pHPTxt  = this.add.text(612, 284, '', { fontSize: '11px', fill: '#fff', fontFamily: 'Arial' }).setOrigin(0.5, 0);
        this.refreshPlayerHP();

        // Question box
        const qBox = this.add.rectangle(W/2, 365, 680, 90, 0x08082a);
        qBox.setStrokeStyle(2, 0x2255aa);

        this.qText = this.add.text(W/2, 365, '', {
            fontSize: '22px', fill: '#ffffff', fontFamily: 'Arial', align: 'center',
        }).setOrigin(0.5);

        // Answer area
        this.add.text(W/2, 428, 'Tvoje odpověď:', { fontSize: '13px', fill: '#888', fontFamily: 'Arial' }).setOrigin(0.5);

        const aBox = this.add.rectangle(W/2, 457, 210, 38, 0x101030);
        aBox.setStrokeStyle(2, 0x44aaff);

        this.aTxt = this.add.text(W/2, 457, '_', {
            fontSize: '26px', fill: '#44ddff', fontFamily: 'Courier New',
        }).setOrigin(0.5);

        // Feedback
        this.fbTxt = this.add.text(W/2, 497, '', {
            fontSize: '15px', fill: '#ffffff', fontFamily: 'Arial', align: 'center',
        }).setOrigin(0.5);

        // Footer hint
        this.add.text(W/2, 538, 'ENTER = potvrdit odpověď   •   ESC = utéct (−20 HP)', {
            fontSize: '11px', fill: '#444466', fontFamily: 'Arial',
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown', this.onKey, this);

        this.nextQuestion();
        this.cameras.main.flash(250, 80, 0, 120);
    }

    nextQuestion() {
        this.question   = MathGenerator.generate(this.enemyData.level || 1);
        this.answerStr  = '';
        this.canAnswer  = true;
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
        } else if (/^[0-9\-.]$/.test(e.key) && this.answerStr.length < 8) {
            if (e.key === '-' && this.answerStr.length > 0) return;
            this.answerStr += e.key;
        }
        this.aTxt.setText(this.answerStr || '_');
    }

    submit() {
        if (!this.answerStr || !this.canAnswer) return;
        this.canAnswer = false;

        const val     = parseFloat(this.answerStr);
        const correct = Math.abs(val - this.question.answer) < 0.01;

        if (correct) {
            this.fbTxt.setText('✓ Správně!').setStyle({ fill: '#44ff44' });
            this.enemyHP = Math.max(0, this.enemyHP - (20 + Math.floor(Math.random() * 15)));
            this.cameras.main.flash(180, 0, 180, 0);
            this.time.delayedCall(750, () => {
                this.refreshEnemyHP();
                if (this.enemyHP <= 0) this.win();
                else this.nextQuestion();
            });
        } else {
            this.wrongCount++;
            const hint = this.wrongCount >= 2 ? `\nNápověda: ${this.question.hint}` : '';
            this.fbTxt.setText(`✗ Špatně! Správná odpověď: ${this.question.answer}${hint}`).setStyle({ fill: '#ff4444' });
            this.playerHP = Math.max(0, this.playerHP - this.enemyAtk);
            this.cameras.main.shake(200, 0.012);
            this.time.delayedCall(1600, () => {
                this.refreshPlayerHP();
                if (this.playerHP <= 0) this.lose();
                else this.nextQuestion();
            });
        }
    }

    refreshEnemyHP() {
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
            ...extra,
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
        this.playerHP  = Math.max(0, this.playerHP - 20);
        this.refreshPlayerHP();
        this.fbTxt.setText('Utíkáš! −20 HP').setStyle({ fill: '#ff8800' });
        this.end('flee', { delay: 900 });
    }
}
