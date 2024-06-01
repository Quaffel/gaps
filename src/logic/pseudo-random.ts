export class PseudoRandom {
    private _seed: number;

    constructor(seed: number) {
        this._seed = seed;
    }

    next() {
        this._seed = (this._seed * 9301 + 49297) % 233280;
        return this._seed / 233280;
    }

    nextInt(max: number) {
        return Math.floor(this.next() * max);
    }

    nextFloat() {
        return this.next();
    }

    nextBoolean() {
        return this.next() >= 0.5;
    }

    nextIntRange(min: number, max: number) {
        return min + this.nextInt(max - min);
    }
}
