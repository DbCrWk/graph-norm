// @flow
import areSetsEqual from '../../src/func/areSetsEqual';

describe('areSetsEqual', () => {
    it('returns false for sets of different sizes', () => {
        expect.assertions(1);

        const a = new Set(['a', 'b', 'c']);
        const b = new Set(['a']);

        const expected = false;
        const actual = areSetsEqual(a, b);

        expect(expected).toBe(actual);
    });

    it('returns false for same-size sets that are different', () => {
        expect.assertions(1);

        const a = new Set(['a', 'b', 'c']);
        const b = new Set(['a', 'b', 'd']);

        const expected = false;
        const actual = areSetsEqual(a, b);

        expect(expected).toBe(actual);
    });

    it('returns true for sets created in the same order', () => {
        expect.assertions(1);

        const a = new Set(['a', 'b', 'c']);
        const b = new Set(['a', 'b', 'c']);

        const expected = true;
        const actual = areSetsEqual(a, b);

        expect(expected).toBe(actual);
    });

    it('returns true for sets created in a different order', () => {
        expect.assertions(1);

        const a = new Set(['a', 'b', 'c']);
        const b = new Set(['a', 'c', 'b']);

        const expected = true;
        const actual = areSetsEqual(a, b);

        expect(expected).toBe(actual);
    });
});
