import {describe, expect, test} from '@jest/globals';
import {MinHeap} from './heap';

describe('min heap', () => {
  test('should create an empty heap', () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    expect(heap.size()).toBe(0);
    expect(heap.peek()).toBe(null);
  });

  test('should add values to the heap', () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    heap.add(5);
    expect(heap.size()).toBe(1);
    expect(heap.peek()).toBe(5);
    heap.add(3);
    expect(heap.size()).toBe(2);
    expect(heap.peek()).toBe(3);
    heap.add(10);
    expect(heap.size()).toBe(3);
    expect(heap.peek()).toBe(3);
  });
});

describe('max heap', () => {
  test('should create an empty heap', () => {
    const heap = new MinHeap<number>((a, b) => b - a);
    expect(heap.size()).toBe(0);
    expect(heap.peek()).toBe(null);
  });

  test('should add values to the heap', () => {
    const heap = new MinHeap<number>((a, b) => b - a);
    heap.add(5);
    expect(heap.size()).toBe(1);
    expect(heap.peek()).toBe(5);
    heap.add(3);
    expect(heap.size()).toBe(2);
    expect(heap.peek()).toBe(5);
    heap.add(10);
    expect(heap.size()).toBe(3);
    expect(heap.peek()).toBe(10);
  });
})
