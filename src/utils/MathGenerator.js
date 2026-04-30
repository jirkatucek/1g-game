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

    // ======== LEVEL 4: Pevnost jmenovatele (Stejný jmenovatel - 3 zlomky) ========
    static level4_add() {
        const d = this.rnd(4, 8);
        const a = this.rnd(1, d - 3);
        const b = this.rnd(1, d - a - 2);
        const c = this.rnd(1, d - a - b - 1);
        return {
            question: `${a}/${d} + ${b}/${d} + ${c}/${d} = ?`,
            answer: this.fstr(a + b + c, d),
            hint: `Stejný jmenovatel: sečti čitatele ${a} + ${b} + ${c} = ${a + b + c}`
        };
    }
    static level4_sub() {
        const d = this.rnd(4, 8);
        const sum = this.rnd(3, d - 1);
        const a = this.rnd(2, sum - 2);
        const b = this.rnd(1, sum - a - 1);
        const c = sum - a - b;
        return {
            question: `${sum}/${d} − ${a}/${d} − ${b}/${d} = ?`,
            answer: this.fstr(c, d),
            hint: `Stejný jmenovatel: odečti čitatele ${sum} − ${a} − ${b} = ${c}`
        };
    }

    // ======== LEVEL 5: Věž Mysli (Těžké kombinované příklady) ========
    static level5_problem() {
        const types = [
            this.level5_hard_multiply,
            this.level5_four_nums_add,
            this.level5_four_nums_mixed,
            this.level5_order_of_ops
        ];
        const fn = types[Math.floor(Math.random() * types.length)];
        return fn.call(this);
    }
    static level5_hard_multiply() {
        const ops = [[72, 4], [85, 3], [94, 6], [68, 5], [76, 7], [58, 8], [81, 4], [92, 5]];
        const [a, b] = ops[Math.floor(Math.random() * ops.length)];
        return {
            question: `${a} × ${b} = ?`,
            answer: `${a * b}`,
            hint: `Vynásob: ${a} × ${b}`
        };
    }
    static level5_four_nums_add() {
        const a = this.rnd(10, 30);
        const b = this.rnd(15, 35);
        const c = this.rnd(20, 40);
        const d = this.rnd(10, 25);
        return {
            question: `${a} + ${b} + ${c} + ${d} = ?`,
            answer: `${a + b + c + d}`,
            hint: `Sečti všechna čtyři čísla`
        };
    }
    static level5_four_nums_mixed() {
        const a = this.rnd(50, 100);
        const b = this.rnd(10, 30);
        const c = this.rnd(5, 15);
        const d = this.rnd(20, 40);
        const result = a - b + c - d;
        return {
            question: `${a} − ${b} + ${c} − ${d} = ?`,
            answer: `${result}`,
            hint: `Provádějte operace zleva doprava`
        };
    }
    static level5_order_of_ops() {
        const ops = [
            { q: '8 × 7 + 15', a: 8 * 7 + 15 },
            { q: '12 + 6 × 8', a: 12 + 6 * 8 },
            { q: '100 − 5 × 8', a: 100 - 5 * 8 },
            { q: '9 × 9 − 20', a: 9 * 9 - 20 },
            { q: '60 ÷ 3 + 25', a: 60 / 3 + 25 },
            { q: '48 ÷ 6 × 5', a: 48 / 6 * 5 }
        ];
        const op = ops[Math.floor(Math.random() * ops.length)];
        return {
            question: `${op.q} = ?`,
            answer: `${op.a}`,
            hint: `Pamatuj na pořadí operací: násobení a dělení před sčítáním a odčítáním`
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
                this.level2_add, this.level2_sub,
                this.level2_whole, this.level2_add, this.level2_sub
            ],
            4: [
                this.level4_add, this.level4_add, this.level4_sub,
                this.level4_add, this.level4_sub
            ],
            5: [
                this.level5_hard_multiply, this.level5_four_nums_add,
                this.level5_four_nums_mixed, this.level5_order_of_ops, this.level5_problem
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
