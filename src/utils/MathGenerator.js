export default class MathGenerator {
    static gcd(a, b) { a = Math.abs(a); b = Math.abs(b); return b === 0 ? a : this.gcd(b, a % b); }
    static lcm(a, b) { return a * b / this.gcd(a, b); }
    static rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    static reduce(n, d) {
        const g = this.gcd(n, d);
        return [n / g, d / g];
    }

    static fstr(n, d) {
        const [rn, rd] = this.reduce(n, d);
        return rd === 1 ? `${rn}` : `${rn}/${rd}`;
    }

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
        if (typeof correct === 'number') return Math.abs(u[0] / u[1] - correct) < 0.01;
        const c = parseF(correct);
        if (!c) return false;
        return u[0] * c[1] === c[0] * u[1];
    }

    static generate(difficulty) {
        const pools = {
            1:  ['sameDenomAdd', 'sameDenomAdd', 'sameDenomSub'],
            2:  ['expandFrac', 'expandFrac', 'sameDenomAdd'],
            3:  ['simplify', 'simplify', 'sameDenomSub'],
            4:  ['findLCD', 'findLCD', 'simplify'],
            5:  ['diffDenomAdd', 'diffDenomSub', 'diffDenomAdd'],
            6:  ['multiplyFrac', 'multiplyFrac', 'simplify'],
            7:  ['reciprocal', 'reciprocal', 'multiplyFrac'],
            8:  ['divideFrac', 'divideFrac', 'multiplyFrac'],
            9:  ['mixedToImproper', 'mixedToImproper', 'diffDenomAdd'],
            10: ['multiplyFrac', 'diffDenomAdd', 'mixedToImproper', 'divideFrac'],
        };
        const pool = pools[difficulty] || pools[1];
        const type = pool[Math.floor(Math.random() * pool.length)];
        return this[type]();
    }

    static sameDenomAdd() {
        const d = this.rnd(3, 8);
        const a = this.rnd(1, d - 2);
        const b = this.rnd(1, d - 1 - a);
        return {
            question: `${a}/${d} + ${b}/${d} = ?`,
            answer: this.fstr(a + b, d),
            hint: `Jmenovatelé jsou stejní, sečti čitatele: ${a} + ${b}`,
        };
    }

    static sameDenomSub() {
        const d = this.rnd(3, 8);
        const a = this.rnd(2, d - 1);
        const b = this.rnd(1, a - 1);
        return {
            question: `${a}/${d} − ${b}/${d} = ?`,
            answer: this.fstr(a - b, d),
            hint: `Jmenovatelé jsou stejní, odečti čitatele: ${a} − ${b}`,
        };
    }

    static expandFrac() {
        const bases = [[1,2],[1,3],[2,3],[1,4],[3,4],[1,5],[2,5]];
        const [n, d] = bases[Math.floor(Math.random() * bases.length)];
        const k = this.rnd(2, 5);
        return {
            question: `Rozšiř zlomek ${n}/${d} krát ${k}:\n${n}/${d} = ?/${d * k}`,
            answer: `${n * k}/${d * k}`,
            hint: `Vynásob čitatele i jmenovatele číslem ${k}: ${n}×${k}=${n*k}, ${d}×${k}=${d*k}`,
        };
    }

    static simplify() {
        const bases = [[1,2],[1,3],[2,3],[1,4],[3,4],[2,5],[1,6],[3,5]];
        const [n, d] = bases[Math.floor(Math.random() * bases.length)];
        const k = this.rnd(2, 4);
        return {
            question: `Zkrať zlomek na základní tvar:\n${n * k}/${d * k}`,
            answer: this.fstr(n, d),
            hint: `Vyděl čitatele i jmenovatele číslem ${this.gcd(n * k, d * k)}`,
        };
    }

    static findLCD() {
        const pairs = [[2,3],[2,4],[3,4],[4,6],[3,5],[2,6],[4,5],[3,8]];
        const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
        const lcd = this.lcm(a, b);
        return {
            question: `Jaký je nejmenší společný jmenovatel\npro zlomky se jmenovateli ${a} a ${b}?`,
            answer: `${lcd}`,
            hint: `NSN(${a}, ${b}) = ${lcd}. Zkus násobky: ${a}, ${2*a}, ${3*a}...`,
        };
    }

    static diffDenomAdd() {
        const pairs = [[2,4],[2,3],[3,6],[4,8],[2,6],[3,4],[2,5]];
        const [d1, d2] = pairs[Math.floor(Math.random() * pairs.length)];
        const a = this.rnd(1, d1 - 1);
        const b = this.rnd(1, d2 - 1);
        const lcd = this.lcm(d1, d2);
        const num = a * (lcd / d1) + b * (lcd / d2);
        return {
            question: `${a}/${d1} + ${b}/${d2} = ?`,
            answer: this.fstr(num, lcd),
            hint: `Společný jmenovatel je ${lcd}. Převeď na ${lcd}tiny a sečti.`,
        };
    }

    static diffDenomSub() {
        const pairs = [[2,4],[3,6],[4,8],[2,6],[3,4],[2,5]];
        const [d1, d2] = pairs[Math.floor(Math.random() * pairs.length)];
        const lcd = this.lcm(d1, d2);
        const a = this.rnd(2, d1 - 1);
        const b = this.rnd(1, d2 - 1);
        const num = a * (lcd / d1) - b * (lcd / d2);
        if (num <= 0) return this.diffDenomAdd();
        return {
            question: `${a}/${d1} − ${b}/${d2} = ?`,
            answer: this.fstr(num, lcd),
            hint: `Společný jmenovatel je ${lcd}`,
        };
    }

    static multiplyFrac() {
        const n1 = this.rnd(1, 4), d1 = this.rnd(2, 6);
        const n2 = this.rnd(1, 4), d2 = this.rnd(2, 6);
        return {
            question: `${n1}/${d1} × ${n2}/${d2} = ?`,
            answer: this.fstr(n1 * n2, d1 * d2),
            hint: `Násob čitatele s čitatelem, jmenovatele s jmenovatelem, pak zkrať`,
        };
    }

    static reciprocal() {
        const n = this.rnd(1, 5), d = this.rnd(2, 7);
        return {
            question: `Napiš převrácenou hodnotu zlomku:\n${n}/${d}`,
            answer: `${d}/${n}`,
            hint: `Prohoď čitatele a jmenovatele: ${n}/${d} → ${d}/${n}`,
        };
    }

    static divideFrac() {
        const n1 = this.rnd(1, 4), d1 = this.rnd(2, 6);
        const n2 = this.rnd(1, 4), d2 = this.rnd(2, 6);
        return {
            question: `${n1}/${d1} ÷ ${n2}/${d2} = ?`,
            answer: this.fstr(n1 * d2, d1 * n2),
            hint: `Dělení = násobení převrácenou hodnotou: ${n1}/${d1} × ${d2}/${n2}`,
        };
    }

    static mixedToImproper() {
        const whole = this.rnd(1, 4);
        const d = this.rnd(2, 6);
        const n = this.rnd(1, d - 1);
        return {
            question: `Převeď smíšené číslo na zlomek:\n${whole} a ${n}/${d}`,
            answer: `${whole * d + n}/${d}`,
            hint: `${whole} × ${d} + ${n} = ${whole * d + n}, jmenovatel zůstává ${d}`,
        };
    }
}
