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

    describe('.hasEdge', () => {
        it('returns true if there is an edge', () => {
            expect.assertions(4);

            const g = new ReflexiveDiGraph();
            const a = new Vertex('a');
            const b = new Vertex('b');
            const c = new Vertex('c');
            g.addVertex(a);
            g.addVertex(b);
            g.addVertex(c);
            g.addEdge(a, b);

            expect(g.hasEdge(a, a)).toBe(true);
            expect(g.hasEdge(b, b)).toBe(true);
            expect(g.hasEdge(c, c)).toBe(true);
            expect(g.hasEdge(a, b)).toBe(true);
        });

        it('returns false if there is no edge', () => {
            expect.assertions(5);

            const g = new ReflexiveDiGraph();
            const a = new Vertex('a');
            const b = new Vertex('b');
            const c = new Vertex('c');
            g.addVertex(a);
            g.addVertex(b);
            g.addVertex(c);
            g.addEdge(a, b);

            expect(g.hasEdge(a, c)).toBe(false);
            expect(g.hasEdge(b, a)).toBe(false);
            expect(g.hasEdge(b, c)).toBe(false);
            expect(g.hasEdge(c, a)).toBe(false);
            expect(g.hasEdge(c, b)).toBe(false);
        });
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

        it('correctly updates the transitive front if edge is transitive', () => {
            expect.assertions(3);

            const g = new ReflexiveDiGraph();
            const a = new Vertex('a');
            const b = new Vertex('b');
            g.addVertex(a);
            g.addVertex(b);
            g.addEdge(a, b);

            expect(g.vertices.a.outbound.has('b')).toBe(true);
            expect(g.vertices.b.inbound.has('a')).toBe(true);

            const h = g.transitiveFront;
            expect(h).toBe(g);
        });

        it('correctly updates the transitive front if edges are not transitive', () => {
            expect.assertions(9);

            const g = new ReflexiveDiGraph();
            const a = new Vertex('a');
            const b = new Vertex('b');
            const c = new Vertex('c');
            g.addVertex(a);
            g.addVertex(b);
            g.addEdge(a, b);
            g.addEdge(b, c);

            expect(g.vertices.a.outbound.has('b')).toBe(true);
            expect(g.vertices.b.inbound.has('a')).toBe(true);

            expect(g.vertices.b.outbound.has('c')).toBe(true);
            expect(g.vertices.c.inbound.has('b')).toBe(true);

            const h = g.transitiveFront;
            expect(h).not.toBe(g);

            expect(h.vertices.a.outbound.has('b')).toBe(true);
            expect(h.vertices.b.inbound.has('a')).toBe(true);

            expect(h.vertices.b.outbound.has('c')).toBe(false);
            expect(h.vertices.c.inbound.has('b')).toBe(false);
        });

        it('correctly updates the transitive closure if edge is transitive', () => {
            expect.assertions(3);

            const g = new ReflexiveDiGraph();
            const a = new Vertex('a');
            const b = new Vertex('b');
            g.addVertex(a);
            g.addVertex(b);
            g.addEdge(a, b);

            expect(g.vertices.a.outbound.has('b')).toBe(true);
            expect(g.vertices.b.inbound.has('a')).toBe(true);

            const h = g.transitiveClosure;
            expect(h).toBe(g);
        });

        it('correctly updates the transitive closure if edges are not transitive', () => {
            expect.assertions(11);

            const g = new ReflexiveDiGraph();
            const a = new Vertex('a');
            const b = new Vertex('b');
            const c = new Vertex('c');
            g.addVertex(a);
            g.addVertex(b);
            g.addEdge(a, b);
            g.addEdge(b, c);

            expect(g.vertices.a.outbound.has('b')).toBe(true);
            expect(g.vertices.b.inbound.has('a')).toBe(true);

            expect(g.vertices.b.outbound.has('c')).toBe(true);
            expect(g.vertices.c.inbound.has('b')).toBe(true);

            const h = g.transitiveClosure;
            expect(h).not.toBe(g);

            expect(h.vertices.a.outbound.has('b')).toBe(true);
            expect(h.vertices.b.inbound.has('a')).toBe(true);

            expect(h.vertices.b.outbound.has('c')).toBe(true);
            expect(h.vertices.c.inbound.has('b')).toBe(true);

            expect(h.vertices.a.outbound.has('c')).toBe(true);
            expect(h.vertices.c.inbound.has('a')).toBe(true);
        });
    });

    describe('.addEdgeSetByMap', () => {
        it.todo('correctly adds edges');
        it('correctly updates paths', () => {
            expect.assertions(3);

            const g = new ReflexiveDiGraph('g');
            g.addEdgeSetByMap({ a: ['b'], b: ['c'] });

            expect([...g.vertices.a.outboundPath]).toStrictEqual(['a', 'b', 'c']);
            expect([...g.vertices.b.outboundPath]).toStrictEqual(['b', 'c']);
            expect([...g.vertices.c.outboundPath]).toStrictEqual(['c']);
        });

        it('correctly sets the transitive front', () => {
            expect.assertions(4);

            const g = new ReflexiveDiGraph('g');
            g.addEdgeSetByMap({ a: ['b'], b: ['c'] });
            const h = g.transitiveFront;

            expect(h).not.toBe(g);
            expect([...h.vertices.a.outbound]).toStrictEqual(['a', 'b']);
            expect([...h.vertices.b.outbound]).toStrictEqual(['b']);
            expect([...h.vertices.c.outbound]).toStrictEqual(['c']);
        });

        it('correctly sets the transitive closure', () => {
            expect.assertions(4);

            const g = new ReflexiveDiGraph('g');
            g.addEdgeSetByMap({ a: ['b'], b: ['c'] });
            const h = g.transitiveClosure;

            expect(h).not.toBe(g);
            expect([...h.vertices.a.outbound]).toStrictEqual(['a', 'b', 'c']);
            expect([...h.vertices.b.outbound]).toStrictEqual(['b', 'c']);
            expect([...h.vertices.c.outbound]).toStrictEqual(['c']);
        });
    });

    describe('.hasPath', () => {
        it('returns true if there is a path', () => {
            expect.assertions(5);

            const g = new ReflexiveDiGraph();
            const a = new Vertex('a');
            const b = new Vertex('b');
            const c = new Vertex('c');
            g.addVertex(a);
            g.addVertex(b);
            g.addVertex(c);
            g.addEdge(a, b);
            g.addEdge(b, c);

            expect(g.hasPath(a, a)).toBe(true);
            expect(g.hasPath(b, b)).toBe(true);
            expect(g.hasPath(c, c)).toBe(true);

            expect(g.hasPath(a, b)).toBe(true);
            expect(g.hasPath(a, c)).toBe(true);
        });

        it('returns false if there is no path', () => {
            expect.assertions(5);

            const g = new ReflexiveDiGraph();
            const a = new Vertex('a');
            const b = new Vertex('b');
            const c = new Vertex('c');
            g.addVertex(a);
            g.addVertex(b);
            g.addVertex(c);
            g.addEdge(a, b);

            expect(g.hasPath(a, c)).toBe(false);
            expect(g.hasPath(b, a)).toBe(false);
            expect(g.hasPath(b, c)).toBe(false);
            expect(g.hasPath(c, a)).toBe(false);
            expect(g.hasPath(c, b)).toBe(false);
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
