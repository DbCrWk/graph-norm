// @flow
import ReflexiveDiGraph from '../../src/object/ReflexiveDiGraph';
import GraphSequence from '../../src/object/GraphSequence';
import SequenceTemporalNode from '../../src/object/Sequence.TemporalNode';
import Vertex from '../../src/object/Vertex';
import RootTopologyNode from '../../src/object/Root.TopologyNode';

describe('parsing', () => {
    it('correctly produces the temporal and topological trees', () => {
        expect.assertions(4);

        const a = new Vertex('a');
        const b = new Vertex('b');
        const c = new Vertex('c');

        const g = new ReflexiveDiGraph('g');
        g.addEdge(a, b);
        g.addEdge(b, c);

        const h = new ReflexiveDiGraph('h');
        h.addVertex(a);
        h.addEdge(b, c);
        h.addEdge(c, b);

        const seq = new GraphSequence();
        seq.push(g);
        seq.push(h);
        seq.push(h);
        seq.push(h);

        const temporalTree = new SequenceTemporalNode(seq);
        const topologicalTree = new RootTopologyNode(temporalTree);

        expect(temporalTree).not.toBeNull();
        expect(topologicalTree).not.toBeNull();

        expect(temporalTree.toNode()).toMatchSnapshot();
        expect(topologicalTree.toNode()).toMatchSnapshot();
    });
});
