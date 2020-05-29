// @flow
import doesSet from '../../src/func/doesSet';

describe('doesSet', () => {
    describe('.equal', () => {
        it('returns false for sets of different sizes', () => {
            expect.assertions(1);

            const a = new Set(['a', 'b', 'c']);
            const b = new Set(['a']);

            const expected = false;
            const actual = doesSet(a).equal(b);

            expect(expected).toBe(actual);
        });

        it('returns false for same-size sets that are different', () => {
            expect.assertions(1);

            const a = new Set(['a', 'b', 'c']);
            const b = new Set(['a', 'b', 'd']);

            const expected = false;
            const actual = doesSet(a).equal(b);

            expect(expected).toBe(actual);
        });

        it('returns true for sets created in the same order', () => {
            expect.assertions(1);

            const a = new Set(['a', 'b', 'c']);
            const b = new Set(['a', 'b', 'c']);

            const expected = true;
            const actual = doesSet(a).equal(b);

            expect(expected).toBe(actual);
        });

        it('returns true for sets created in a different order', () => {
            expect.assertions(1);

            const a = new Set(['a', 'b', 'c']);
            const b = new Set(['a', 'c', 'b']);

            const expected = true;
            const actual = doesSet(a).equal(b);

            expect(expected).toBe(actual);
        });
    });

    describe('.dominate', () => {
        it('returns true for equal sets', () => {
            expect.assertions(1);

            const a = new Set(['a', 'b', 'c']);
            const b = new Set(['a', 'b', 'c']);

            const expected = true;
            const actual = doesSet(a).dominate(b);

            expect(expected).toBe(actual);
        });

        it('returns true for an included set', () => {
            expect.assertions(1);

            const a = new Set(['a', 'b', 'c']);
            const b = new Set(['a', 'b']);

            const expected = true;
            const actual = doesSet(a).dominate(b);

            expect(expected).toBe(actual);
        });

        it('returns false for strictly backwards domination', () => {
            expect.assertions(1);

            const a = new Set(['a', 'b']);
            const b = new Set(['a', 'b', 'c']);

            const expected = false;
            const actual = doesSet(a).dominate(b);

            expect(expected).toBe(actual);
        });

        it('returns false for incomparable sets', () => {
            expect.assertions(1);

            const a = new Set(['a', 'c']);
            const b = new Set(['a', 'b']);

            const expected = false;
            const actual = doesSet(a).dominate(b);

            expect(expected).toBe(actual);
        });
    });
});
