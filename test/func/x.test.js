// @flow
import x from '../../src/func/x';
import Vertex from '../../src/object/Vertex';
import ReflexiveDiGraph from '../../src/object/ReflexiveDiGraph';

describe('x (graph multiplication)', () => {
    it('correctly includes self-loops', () => {
        expect.assertions(6);

        const g = new ReflexiveDiGraph('g');
        g.addVertex(new Vertex('a'));
        g.addVertex(new Vertex('b'));
        g.addVertex(new Vertex('c'));

        const h = new ReflexiveDiGraph('h');
        h.addVertex(new Vertex('a'));
        h.addVertex(new Vertex('b'));
        h.addVertex(new Vertex('c'));

        const o = x(g, h);
        expect(o.vertices.a.outbound.has('a')).toBe(true);
        expect(o.vertices.a.inbound.has('a')).toBe(true);

        expect(o.vertices.b.outbound.has('b')).toBe(true);
        expect(o.vertices.b.inbound.has('b')).toBe(true);

        expect(o.vertices.c.outbound.has('c')).toBe(true);
        expect(o.vertices.c.inbound.has('c')).toBe(true);
    });

    it.todo('includes paths of length 2');
    it.todo('excludes paths greater than length 2');
});
