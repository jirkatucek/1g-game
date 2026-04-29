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

    // ======== LEVEL 1: Les operací (Rychlá aritmetika) ========
    static level1_add() {
        const a = this.rnd(10, 50), b = this.rnd(10, 50);
        return { question: `${a} + ${b} = ?`, answer: `${a + b}`, hint: `Sečti: ${a} + ${b}` };
    }
    static level1_sub() {
        const a = this.rnd(30, 100), b = this.rnd(10, a - 10);
        return { question: `${a} − ${b} = ?`, answer: `${a - b}`, hint: `Odečti: ${a} − ${b}` };
    }
    static level1_mul() {
        const ops = [[12, 4], [15, 3], [20, 5], [25, 4], [18, 6], [14, 7], [16, 5]];
        const [a, b] = ops[Math.floor(Math.random() * ops.length)];
        return { question: `${a} × ${b} = ?`, answer: `${a * b}`, hint: `Vynásob: ${a} × ${b}` };
    }
    static level1_div() {
        const ops = [[84, 4], [60, 5], [72, 8], [45, 9], [56, 7], [48, 6]];
        const [a, b] = ops[Math.floor(Math.random() * ops.length)];
        return { question: `${a} ÷ ${b} = ?`, answer: `${a / b}`, hint: `Vyděl: ${a} ÷ ${b}` };
    }
    static level1_combined() {
        const a = this.rnd(10, 20), b = this.rnd(2, 8), c = this.rnd(5, 20);
        return { question: `${a} × ${b} + ${c} = ?`, answer: `${a * b + c}`, hint: `Nejdřív násobení: ${a}×${b}=${a*b}, pak sčítání +${c}` };
    }

    // ======== LEVEL 2: Palouk zlomků (Základy - stejný jmenovatel) ========
    static level2_add() {
        const d = this.rnd(3, 8);
        const a = this.rnd(1, d - 2);
        const b = this.rnd(1, d - 1 - a);
        return {
            question: `${a}/${d} + ${b}/${d} = ?`,
            answer: this.fstr(a + b, d),
            hint: `Stejný jmenovatel: sečti čitatele ${a} + ${b} = ${a + b}`
        };
    }
    static level2_sub() {
        const d = this.rnd(3, 8);
        const a = this.rnd(2, d - 1);
        const b = this.rnd(1, a - 1);
        return {
            question: `${a}/${d} − ${b}/${d} = ?`,
            answer: this.fstr(a - b, d),
            hint: `Stejný jmenovatel: odečti čitatele ${a} − ${b} = ${a - b}`
        };
    }
    static level2_whole() {
        const d = this.rnd(2, 5);
        const n = this.rnd(1, d - 1);
        return {
            question: `1 − ${n}/${d} = ?`,
            answer: this.fstr(d - n, d),
            hint: `1 = ${d}/${d}, pak ${d}/${d} − ${n}/${d} = ${d - n}/${d}`
        };
    }

    // ======== LEVEL 3: Zahrada krácení (Krácení a rozšiřování) ========
    static level3_simplify() {
        const bases = [[1,2], [1,3], [2,3], [1,4], [3,4], [2,5], [1,6], [3,5]];
        const [n, d] = bases[Math.floor(Math.random() * bases.length)];
        const k = this.rnd(2, 4);
        return {
            question: `Zkrať na základní tvar:\n${n * k}/${d * k}`,
            answer: this.fstr(n, d),
            hint: `Vyděl čitatele i jmenovatele číslem ${k}`
        };
    }
    static level3_expand() {
        const bases = [[1,2], [1,3], [2,3], [1,4], [3,4], [1,5], [2,5]];
        const [n, d] = bases[Math.floor(Math.random() * bases.length)];
        const k = this.rnd(2, 5);
        return {
            question: `Rozšiř zlomek ${n}/${d} na ${d * k}-tiny:\n${n}/${d} = ?/${d * k}`,
            answer: `${n * k}/${d * k}`,
            hint: `Vynásob čitatele i jmenovatele číslem ${k}`
        };
    }

    // ======== LEVEL 4: Pevnost jmenovatele (Různý jmenovatel - lehké) ========
    static level4_add() {
        const pairs = [[2,4], [2,3], [3,6], [2,6], [2,5], [1,5, 2,10]];
        let d1, d2, a, b;
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        [d1, d2] = [pair[0], pair[1]];
        a = this.rnd(1, d1 - 1);
        b = this.rnd(1, d2 - 1);
        const lcd = this.lcm(d1, d2);
        const num = a * (lcd / d1) + b * (lcd / d2);
        return {
            question: `${a}/${d1} + ${b}/${d2} = ?`,
            answer: this.fstr(num, lcd),
            hint: `Společný jmenovatel: ${lcd}. Převeď obě zlomky a sečti`
        };
    }
    static level4_sub() {
        const pairs = [[2,4], [3,6], [4,8], [2,6], [3,4], [2,5]];
        const [d1, d2] = pairs[Math.floor(Math.random() * pairs.length)];
        const lcd = this.lcm(d1, d2);
        const a = this.rnd(2, d1 - 1);
        const b = this.rnd(1, Math.min(d2 - 1, a * (lcd / d1) / (lcd / d2) - 1));
        const num = a * (lcd / d1) - b * (lcd / d2);
        if (num <= 0) return this.level4_add();
        return {
            question: `${a}/${d1} − ${b}/${d2} = ?`,
            answer: this.fstr(num, lcd),
            hint: `Společný jmenovatel: ${lcd}`
        };
    }

    // ======== LEVEL 5: Zámecká věž (Mix všeho) ========
    static level5_problem() {
        const types = [
            this.level5_multiply_int,
            this.level5_mixed_ops,
            this.level5_simplify_complex,
            this.level5_arithmetic
        ];
        const fn = types[Math.floor(Math.random() * types.length)];
        return fn.call(this);
    }
    static level5_multiply_int() {
        const k = this.rnd(2, 5);
        const bases = [[1,6], [1,4], [1,3], [2,3], [1,2]];
        const [n, d] = bases[Math.floor(Math.random() * bases.length)];
        return {
            question: `${k} × ${n}/${d} = ?`,
            answer: this.fstr(k * n, d),
            hint: `Vynásob čitatel číslem ${k}: ${k} × ${n} = ${k * n}`
        };
    }
    static level5_mixed_ops() {
        const pairs = [[2,3], [2,4], [3,4], [2,6]];
        const [d1, d2] = pairs[Math.floor(Math.random() * pairs.length)];
        const a = this.rnd(1, d1 - 1);
        const b = this.rnd(1, d2 - 1);
        const lcd = this.lcm(d1, d2);
        const num = a * (lcd / d1) + b * (lcd / d2);
        return {
            question: `${a}/${d1} + ${b}/${d2} = ?`,
            answer: this.fstr(num, lcd),
            hint: `Najdi společný jmenovatel a sečti`
        };
    }
    static level5_simplify_complex() {
        const bases = [[10,20], [6,18], [8,24], [12,30], [4,12]];
        const [n, d] = bases[Math.floor(Math.random() * bases.length)];
        const g = this.gcd(n, d);
        return {
            question: `Zkrať ${n}/${d} na základní tvar`,
            answer: this.fstr(n, d),
            hint: `NSD(${n}, ${d}) = ${g}`
        };
    }
    static level5_arithmetic() {
        const ops = [[14, 3], [20, 5], [25, 4]];
        const [a, b] = ops[Math.floor(Math.random() * ops.length)];
        return {
            question: `${a} × ${b} = ?`,
            answer: `${a * b}`,
            hint: `Vynásob: ${a} × ${b}`
        };
    }

    // ======== HLAVNÍ GENERÁTOR ========
    static generateProblem(level) {
        const generators = {
            1: [
                this.level1_add, this.level1_add, this.level1_sub, 
                this.level1_mul, this.level1_mul, this.level1_div, 
                this.level1_combined
            ],
            2: [
                this.level2_add, this.level2_add, this.level2_sub,
                this.level2_whole, this.level2_add
            ],
            3: [
                this.level3_simplify, this.level3_simplify, 
                this.level3_expand, this.level3_simplify, this.level3_expand
            ],
            4: [
                this.level4_add, this.level4_add, this.level4_sub,
                this.level4_add, this.level4_sub
            ],
            5: [
                this.level5_multiply_int, this.level5_mixed_ops,
                this.level5_simplify_complex, this.level5_arithmetic, this.level5_problem
            ]
        };
        
        const pool = generators[level] || generators[1];
        const fn = pool[Math.floor(Math.random() * pool.length)];
        return fn.call(this);
    }

    // Starý generate() pro zpětnou kompatibilitu
    static generate(levelOrDifficulty) {
        // Pokud je to menší číslo (< 10), jde o difficulty index, jinak o přímý level
        const level = levelOrDifficulty < 10 ? levelOrDifficulty : 1;
        return this.generateProblem(Math.max(1, Math.min(5, level)));
    }
}
