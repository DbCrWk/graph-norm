// @flow
import Vertex from '../../src/object/Vertex';
import ReflexiveDiGraph from '../../src/object/ReflexiveDiGraph';

describe('reflexiveDiGraph', () => {
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

    it.todo('copies vertex instances instead of pointing to them');
});
