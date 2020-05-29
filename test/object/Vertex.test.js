// @flow
import Vertex from '../../src/object/Vertex';

describe('vertex', () => {
    describe('.isSameAs', () => {
        it('returns false for vertices of different labels', () => {
            expect.assertions(1);
            const a = new Vertex('a');
            const b = new Vertex('b');

            const expected = false;
            const actual = a.isSameAs(b);

            expect(expected).toBe(actual);
        });

        it('returns false for vertices with different inbound sets', () => {
            expect.assertions(1);
            const a = new Vertex('a');
            a.inbound.add('a');
            const b = new Vertex('a');

            const expected = false;
            const actual = a.isSameAs(b);

            expect(expected).toBe(actual);
        });

        it('returns false for vertices with different outbound sets', () => {
            expect.assertions(1);
            const a = new Vertex('a');
            a.outbound.add('a');
            const b = new Vertex('a');

            const expected = false;
            const actual = a.isSameAs(b);

            expect(expected).toBe(actual);
        });

        it('returns true for vertices with the same label and no sets', () => {
            expect.assertions(1);
            const a = new Vertex('a');
            const b = new Vertex('a');

            const expected = true;
            const actual = a.isSameAs(b);

            expect(expected).toBe(actual);
        });

        it('returns true for vertices with the same label and same sets', () => {
            expect.assertions(1);
            const a = new Vertex('a');
            a.inbound.add('a');
            a.outbound.add('a');
            const b = new Vertex('a');
            b.inbound.add('a');
            b.outbound.add('a');

            const expected = true;
            const actual = a.isSameAs(b);

            expect(expected).toBe(actual);
        });
    });
});
