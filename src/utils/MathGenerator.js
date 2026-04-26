export default class MathGenerator {
    static gcd(a, b) { a = Math.abs(a); b = Math.abs(b); return b === 0 ? a : this.gcd(b, a % b); }
    static rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    static reduce(n, d) {
        const g = this.gcd(n, d);
        return [n / g, d / g];
    }

    static fstr(n, d) {
        const [rn, rd] = this.reduce(n, d);
        return rd === 1 ? `${rn}` : `${rn}/${rd}`;
    }

    // Porovná uživatelův vstup se správnou odpovědí (číslo nebo zlomek "a/b")
    static checkAnswer(userStr, correct) {
        userStr = userStr.trim();
        const parseF = s => {
            if (s.includes('/')) {
                const [n, d] = s.split('/').map(Number);
                return isNaN(n) || isNaN(d) || d === 0 ? null : [n, d];
            }
            const v = parseFloat(s);
            return isNaN(v) ? null : [v, 1];
        };

        const u = parseF(userStr);
        if (!u) return false;

        if (typeof correct === 'number') {
            return Math.abs(u[0] / u[1] - correct) < 0.01;
        }

        const c = parseF(correct);
        if (!c) return false;
        return u[0] * c[1] === c[0] * u[1]; // cross multiply
    }

    static generate(difficulty) {
        const pools = {
            1: ['sameDenomAdd', 'sameDenomAdd', 'sameDenomSub'],
            2: ['simplify', 'simplify', 'sameDenomAdd'],
            3: ['diffDenomAdd', 'diffDenomSub', 'simplify'],
            4: ['mixedToImproper', 'mixedToImproper', 'diffDenomAdd'],
            5: ['multiplyFrac', 'multiplyFrac', 'diffDenomAdd'],
        };
        const pool = pools[difficulty] || pools[1];
        const type = pool[Math.floor(Math.random() * pool.length)];
        return this[type]();
    }

    // Level 1: 1/4 + 2/4 = ?
    static sameDenomAdd() {
        const d = this.rnd(3, 8);
        const a = this.rnd(1, d - 2);
        const b = this.rnd(1, d - 1 - a);
        return {
            question: `${a}/${d} + ${b}/${d} = ?`,
            answer: this.fstr(a + b, d),
            hint: `Jmenovatelé jsou stejní, stačí sečíst čitatele: ${a} + ${b}`,
            format: 'fraction',
        };
    }

    // Level 1 doplněk: 3/5 - 1/5 = ?
    static sameDenomSub() {
        const d = this.rnd(3, 8);
        const a = this.rnd(2, d - 1);
        const b = this.rnd(1, a - 1);
        return {
            question: `${a}/${d} − ${b}/${d} = ?`,
            answer: this.fstr(a - b, d),
            hint: `Jmenovatelé jsou stejní, stačí odečíst čitatele: ${a} − ${b}`,
            format: 'fraction',
        };
    }

    // Level 2: zkrať 4/8 → 1/2
    static simplify() {
        const bases = [[2,3],[2,4],[3,6],[2,5],[3,4],[4,6],[2,6],[3,9],[4,8],[5,10]];
        const [n, d] = bases[Math.floor(Math.random() * bases.length)];
        const k = this.rnd(2, 4);
        return {
            question: `Zkrať zlomek na základní tvar:\n${n * k}/${d * k}`,
            answer: this.fstr(n, d),
            hint: `GCD(${n * k}, ${d * k}) = ${this.gcd(n * k, d * k)}, vyděl čitatele i jmenovatele`,
            format: 'fraction',
        };
    }

    // Level 3: 1/2 + 1/4 = ?
    static diffDenomAdd() {
        const pairs = [[2,4],[2,3],[3,6],[4,8],[2,6],[3,4],[2,5],[4,12]];
        const [d1, d2] = pairs[Math.floor(Math.random() * pairs.length)];
        const a = this.rnd(1, d1 - 1);
        const b = this.rnd(1, d2 - 1);
        const lcd = d1 * d2 / this.gcd(d1, d2);
        const num = a * (lcd / d1) + b * (lcd / d2);
        return {
            question: `${a}/${d1} + ${b}/${d2} = ?`,
            answer: this.fstr(num, lcd),
            hint: `Společný jmenovatel je ${lcd}. Převeď: ${a}/${d1} = ${a * (lcd / d1)}/${lcd}`,
            format: 'fraction',
        };
    }

    // Level 3 doplněk: odčítání
    static diffDenomSub() {
        const pairs = [[2,4],[3,6],[4,8],[2,6],[4,12]];
        const [d1, d2] = pairs[Math.floor(Math.random() * pairs.length)];
        const lcd = d1 * d2 / this.gcd(d1, d2);
        const a = this.rnd(2, d1 - 1);
        const b = this.rnd(1, d2 - 1);
        const num = a * (lcd / d1) - b * (lcd / d2);
        if (num <= 0) return this.diffDenomAdd();
        return {
            question: `${a}/${d1} − ${b}/${d2} = ?`,
            answer: this.fstr(num, lcd),
            hint: `Společný jmenovatel je ${lcd}`,
            format: 'fraction',
        };
    }

    // Level 4: smíšené číslo → zlomek: 1 1/2 = 3/2
    static mixedToImproper() {
        const whole = this.rnd(1, 4);
        const d = this.rnd(2, 6);
        const n = this.rnd(1, d - 1);
        const improperN = whole * d + n;
        return {
            question: `Převeď smíšené číslo na zlomek:\n${whole} a ${n}/${d}`,
            answer: `${improperN}/${d}`,
            hint: `${whole} × ${d} + ${n} = ${improperN}, jmenovatel zůstává ${d}`,
            format: 'fraction',
        };
    }

    // Level 5 (Boss): násobení zlomků 1/2 × 2/3 = 1/3
    static multiplyFrac() {
        const n1 = this.rnd(1, 4), d1 = this.rnd(2, 6);
        const n2 = this.rnd(1, 4), d2 = this.rnd(2, 6);
        return {
            question: `${n1}/${d1} × ${n2}/${d2} = ?`,
            answer: this.fstr(n1 * n2, d1 * d2),
            hint: `Násob čitatele navzájem a jmenovatele navzájem, pak zkrať`,
            format: 'fraction',
        };
    }
}
