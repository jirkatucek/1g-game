export default class MathGenerator {
    static generate(difficulty) {
        const pools = {
            1: ['simpleEquation', 'percentage', 'power', 'squareRoot', 'simpleEquation'],
            2: ['linearEquation', 'percentage', 'power', 'squareRoot', 'proportion'],
            3: ['linearEquation', 'twoStepEquation', 'squareRoot', 'proportion', 'pythagorean'],
        };
        const pool = pools[difficulty] || pools[1];
        const type = pool[Math.floor(Math.random() * pool.length)];
        return this[type]();
    }

    static rnd(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static gcd(a, b) {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    // 3x = 15 → x = 5
    static simpleEquation() {
        const x = this.rnd(2, 15);
        const a = this.rnd(2, 9);
        return {
            question: `${a}x = ${a * x}\n\nNajdi x:`,
            answer: x,
            hint: `Vyděl obě strany číslem ${a}`,
        };
    }

    // 3x + 5 = 20 → x = 5
    static linearEquation() {
        const x = this.rnd(1, 12);
        const a = this.rnd(2, 6);
        const b = this.rnd(1, 15);
        return {
            question: `${a}x + ${b} = ${a * x + b}\n\nNajdi x:`,
            answer: x,
            hint: `Odečti ${b} od obou stran, pak vyděl ${a}`,
        };
    }

    // 4x − 3 = 13 → x = 4
    static twoStepEquation() {
        const x = this.rnd(2, 10);
        const a = this.rnd(2, 5);
        const b = this.rnd(1, 8);
        return {
            question: `${a}x − ${b} = ${a * x - b}\n\nNajdi x:`,
            answer: x,
            hint: `Přičti ${b} k oběma stranám, pak vyděl ${a}`,
        };
    }

    // 20% z 150 = 30
    static percentage() {
        const percents = [10, 20, 25, 50, 5, 40, 75];
        const p = percents[Math.floor(Math.random() * percents.length)];
        const g = this.gcd(p, 100);
        const unit = 100 / g;
        const base = this.rnd(1, 20) * unit;
        const answer = Math.round(p * base / 100);
        return {
            question: `Kolik je ${p} % z čísla ${base}?`,
            answer: answer,
            hint: `${p}/100 × ${base}`,
        };
    }

    // 4² = 16
    static power() {
        const n = this.rnd(2, 9);
        const e = this.rnd(2, 3);
        const exp = e === 2 ? '²' : '³';
        return {
            question: `${n}${exp} = ?`,
            answer: Math.pow(n, e),
            hint: `${n} × ${n}${e === 3 ? ' × ' + n : ''}`,
        };
    }

    // √49 = 7
    static squareRoot() {
        const x = this.rnd(2, 13);
        return {
            question: `√${x * x} = ?`,
            answer: x,
            hint: `Jaké číslo, umocněné na druhou, dá ${x * x}?`,
        };
    }

    // 3:5 = 12:x → x = 20
    static proportion() {
        const a = this.rnd(2, 7);
        const b = this.rnd(2, 7);
        const k = this.rnd(2, 6);
        return {
            question: `${a} : ${b} = ${a * k} : x\n\nNajdi x:`,
            answer: b * k,
            hint: `Přímá úměra: x = ${b} × ${a * k} / ${a}`,
        };
    }

    // Pythagorova věta: 3,4,5 / 5,12,13 atd.
    static pythagorean() {
        const triples = [[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15]];
        const [a, b, c] = triples[Math.floor(Math.random() * triples.length)];
        return {
            question: `Pravoúhlý trojúhelník má odvěsny ${a} a ${b}.\nJaká je délka přepony? (Pythagorova věta)`,
            answer: c,
            hint: `c = √(${a}² + ${b}²) = √${a*a + b*b}`,
        };
    }
}
