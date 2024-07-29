import { describe, expect, test } from "@jest/globals";
import { CountMinSketch } from "./cms";

describe('count min sketch', () => {
    test('should create a count min sketch', () => {
        const cms = new CountMinSketch(100, 5);

        expect(cms.estimate('apple')).toBe(0);
    });

    test('should estimate counts', () => {
        const cms = new CountMinSketch(100, 5);

        cms.add('apple');
        expect(cms.estimate('apple')).toBe(1);

        cms.add('apple', 5);
        expect(cms.estimate('apple')).toBe(6);

        cms.add('banana', 10);
        expect(cms.estimate('banana')).toBe(10);
    });
});