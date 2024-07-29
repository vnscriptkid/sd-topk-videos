import { CountMinSketch } from "./cms";


// Finding top-k elements using Count-Min Sketch
class TopK {
    private k: number;
    private cms: CountMinSketch;
    private heap: { item: string; count: number }[];

    constructor(k: number, width: number, depth: number) {
        this.k = k;
        this.cms = new CountMinSketch(width, depth);
        this.heap = [];
    }

    public add(item: string, count: number = 1): void {
        this.cms.add(item, count);
        const estimatedCount = this.cms.estimate(item);

        if (this.heap.length < this.k) {
            this.heap.push({ item, count: estimatedCount });
            this.heap.sort((a, b) => a.count - b.count);
        } else if (estimatedCount > this.heap[0].count) {
            this.heap[0] = { item, count: estimatedCount };
            this.heap.sort((a, b) => a.count - b.count);
        }
    }

    public getTopK(): { item: string; count: number }[] {
        return this.heap.sort((a, b) => b.count - a.count);
    }
}

// Demo
const topK = new TopK(2, 100, 5);
const elements = [
    'apple', 'banana', 'apple', 'orange', 'banana', 'apple',
    'banana', 'orange', 'orange', 'apple', 'banana', 'banana'
];

elements.forEach(item => topK.add(item));

console.log('Top 3 elements:');
console.log(topK.getTopK());
