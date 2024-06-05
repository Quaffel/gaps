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

    nextIntRange(min: number, max: number) {
        return min + this.nextInt(max - min);
    }

    nextWeighted(weights: number[]): number {
        const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
        const random = this.nextFloat() * totalWeight;
        let weightSum = 0;
        for (let i = 0; i < weights.length; i++) {
            weightSum += weights[i];
            if (random < weightSum) {
                return i
            }
        }
        return weights.length - 1;
    }

    getLinearlyDecreasingWeights(n: number) {
        return Array.from({ length: n }, (_, i) => n - i);
    }
}
