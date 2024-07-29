export class CountMinSketch {
    private width: number;
    private depth: number;
    private table: number[][];
    private hashFunctions: ((x: string) => number)[];

    constructor(width: number, depth: number) {
        this.width = width;
        this.depth = depth;
        this.table = Array.from({ length: depth }, () => Array(width).fill(0));
        this.hashFunctions = this.generateHashFunctions(depth, width);
    }

    private generateHashFunctions(depth: number, width: number): ((x: string) => number)[] {
        const hashFunctions: ((x: string) => number)[] = [];
        for (let i = 0; i < depth; i++) {
            const seed = Math.floor(Math.random() * 1000000);
            hashFunctions.push((x: string) => this.hash(x, seed) % width);
        }
        return hashFunctions;
    }

    private hash(str: string, seed: number): number {
        let hash = seed;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) % 4294967296;
        }
        return hash;
    }

    public add(item: string, count: number = 1): void {
        for (let i = 0; i < this.depth; i++) {
            const index = this.hashFunctions[i](item);
            this.table[i][index] += count;
        }
    }

    public estimate(item: string): number {
        let minCount = Infinity;
        for (let i = 0; i < this.depth; i++) {
            const index = this.hashFunctions[i](item);
            minCount = Math.min(minCount, this.table[i][index]);
        }
        return minCount;
    }
}