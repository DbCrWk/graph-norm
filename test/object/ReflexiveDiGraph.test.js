// @flow
import Vertex from '../../src/object/Vertex';
import ReflexiveDiGraph from '../../src/object/ReflexiveDiGraph';

describe('reflexiveDiGraph', () => {
    describe('.addVertex', () => {
        it('maintains self-loops', () => {
            expect.assertions(6);

            const g = new ReflexiveDiGraph();
            g.addVertex(new Vertex('a'));
            g.addVertex(new Vertex('b'));
            g.addVertex(new Vertex('c'));

            expect(g.vertices.a.outbound.has('a')).toBe(true);
            expect(g.vertices.a.inbound.has('a')).toBe(true);

            expect(g.vertices.b.outbound.has('b')).toBe(true);
            expect(g.vertices.b.inbound.has('b')).toBe(true);

            expect(g.vertices.c.outbound.has('c')).toBe(true);
            expect(g.vertices.c.inbound.has('c')).toBe(true);
        });

        it.todo('copies vertex instances instead of pointing to them');
    });

    describe('.addEdge', () => {
        it('creates vertices if not present in edge creation', () => {
            expect.assertions(3);

            const g = new ReflexiveDiGraph();
            g.addEdge(new Vertex('a'), new Vertex('b'));

            expect('a' in g.vertices).toBe(true);
            expect('b' in g.vertices).toBe(true);
            expect('c' in g.vertices).toBe(false);
        });

        it('creates an edge with existing vertices', () => {
            expect.assertions(2);

            const g = new ReflexiveDiGraph();
            const a = new Vertex('a');
            const b = new Vertex('b');
            g.addVertex(a);
            g.addVertex(b);
            g.addEdge(a, b);

            expect(g.vertices.a.outbound.has('b')).toBe(true);
            expect(g.vertices.b.inbound.has('a')).toBe(true);
        });
    });

    describe('.isSameAs', () => {
        it('returns false for graphs with differently-sized vertex sets', () => {
            expect.assertions(1);
            const g = new ReflexiveDiGraph();
            g.addVertex(new Vertex('a'));
            const h = new ReflexiveDiGraph();
            h.addVertex(new Vertex('a'));
            h.addVertex(new Vertex('b'));

            const expected = false;
            const actual = g.isSameAs(h);

            expect(expected).toBe(actual);
        });

        it('returns false for graphs with different vertices', () => {
            expect.assertions(1);
            const g = new ReflexiveDiGraph();
            g.addVertex(new Vertex('a'));
            const h = new ReflexiveDiGraph();
            h.addVertex(new Vertex('b'));

            const expected = false;
            const actual = g.isSameAs(h);

            expect(expected).toBe(actual);
        });

        it('returns false for graphs with same vertices, different edges', () => {
            expect.assertions(1);

            const a = new Vertex('a');
            const b = new Vertex('b');

            const g = new ReflexiveDiGraph();
            g.addVertex(a);
            g.addVertex(b);
            g.addEdge(a, b);

            const h = new ReflexiveDiGraph();
            h.addVertex(a);
            h.addVertex(b);

            const expected = false;
            const actual = g.isSameAs(h);

            expect(expected).toBe(actual);
        });

        it('returns true for isomorphic graphs', () => {
            expect.assertions(1);

            const a = new Vertex('a');
            const b = new Vertex('b');

            const g = new ReflexiveDiGraph();
            g.addVertex(a);
            g.addVertex(b);
            g.addEdge(a, b);

            const h = new ReflexiveDiGraph();
            h.addEdge(a, b);

            const expected = true;
            const actual = g.isSameAs(h);

            expect(expected).toBe(actual);
        });
    });

    describe('.transitiveFront', () => {
        it('equals the original graph when transitive', () => {
            expect.assertions(1);

            const a = new Vertex('a');
            const b = new Vertex('b');
            const c = new Vertex('c');

            const g = new ReflexiveDiGraph();
            g.addEdge(a, b);
            g.addEdge(a, c);
            g.addEdge(b, c);

            const t = g.transitiveFront;
            const expected = true;
            const actual = g.isSameAs(t);

            expect(expected).toBe(actual);
        });

        it('does not equal the original graph when not transitive', () => {
            expect.assertions(1);

            const a = new Vertex('a');
            const b = new Vertex('b');
            const c = new Vertex('c');

            const g = new ReflexiveDiGraph();
            g.addEdge(a, b);
            g.addEdge(b, c);

            const t = g.transitiveFront;
            const expected = false;
            const actual = g.isSameAs(t);

            expect(expected).toBe(actual);
        });

        it('equals exactly the non-leading edges', () => {
            expect.assertions(1);

            const a = new Vertex('a');
            const b = new Vertex('b');
            const c = new Vertex('c');

            const g = new ReflexiveDiGraph();
            g.addEdge(a, b);
            g.addEdge(b, c);

            const expectedT = new ReflexiveDiGraph();
            expectedT.addEdge(a, b);
            expectedT.addVertex(c);

            const expected = true;
            const actual = expectedT.isSameAs(g.transitiveFront);

            expect(expected).toBe(actual);
        });

        it('is strictly dominated by the original graph when not transitive', () => {
            expect.assertions(2);

            const a = new Vertex('a');
            const b = new Vertex('b');
            const c = new Vertex('c');

            const g = new ReflexiveDiGraph();
            g.addEdge(a, b);
            g.addEdge(b, c);
            const t = g.transitiveFront;

            expect(g.dominates(t)).toBe(true);
            expect(g.isSameAs(t)).toBe(false);
        });
    });
});
