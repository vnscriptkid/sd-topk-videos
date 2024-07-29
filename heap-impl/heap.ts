// https://www.cs.usfca.edu/~galles/visualization/Heap.html
export class MinHeap<T> {
    // Item at index i has children at indices (2i + 1) and (2i + 2)
    // i: 0 => children: 1, 2
    // i: 1 => children: 3, 4
    // i: 2 => children: 5, 6
    // ...
    // Item at index i has parent at index Math.floor((i - 1) / 2)
    // i: 0 => parent: null
    // i: 1 => parent: 0
    // i: 2 => parent: 0
    // ...
    private heap: T[];
    private comparator: (a: T, b: T) => number;

    constructor(comparator: (a: T, b: T) => number) {
        this.heap = [];
        this.comparator = comparator;
    }

    public size(): number {
        return this.heap.length;
    }

    public peek(): T | null {
        return this.heap.length === 0 ? null : this.heap[0];
    }

    public add(value: T): void {
        this.heap.push(value);
        this.bubbleUp();
    }

    // Remove smallest element from the heap (min heap)
    public remove(): T | null {
        if (this.heap.length === 0) {
            return null;
        }
        this.swap(0, this.heap.length - 1);
        const value = this.heap.pop();
        this.bubbleDown();
        return value!;
    }

    private bubbleUp(): void {
        let index = this.heap.length - 1;
        while (index > 0) {
            const parentIndex = this.parentIndex(index);
            if (this.comparator(this.heap[index], this.heap[parentIndex]) >= 0) {
                break;
            }
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    private bubbleDown(): void {
        let index = 0;
        const length = this.heap.length;
        while (true) {
            const leftChildIndex = this.leftChildIndex(index);
            const rightChildIndex = this.rightChildIndex(index);
            let swapIndex = index;

            if (leftChildIndex < length && this.comparator(this.heap[leftChildIndex], this.heap[swapIndex]) < 0) {
                swapIndex = leftChildIndex;
            }
            if (rightChildIndex < length && this.comparator(this.heap[rightChildIndex], this.heap[swapIndex]) < 0) {
                swapIndex = rightChildIndex;
            }
            if (swapIndex === index) {
                break;
            }
            this.swap(index, swapIndex);
            index = swapIndex;
        }
    }

    private leftChildIndex(index: number): number {
        return 2 * index + 1;
    }

    private rightChildIndex(index: number): number {
        return 2 * index + 2;
    }

    private parentIndex(index: number): number {
        return Math.floor((index - 1) / 2);
    }

    private swap(index1: number, index2: number): void {
        [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
    }
}
