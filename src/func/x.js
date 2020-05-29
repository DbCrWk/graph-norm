// @flow
import ReflexiveDiGraph from '../object/ReflexiveDiGraph';
import liftingReducer from './liftingReducer';
import type { Label } from '../object/Vertex';

function x(g: ReflexiveDiGraph, h: ReflexiveDiGraph): ReflexiveDiGraph {
    const o = new ReflexiveDiGraph();
    const outboundVertices = Object.keys(g.vertices);

    // TODO: we just assume that all vertices are well-defined in both graphs
    const newEdgesByVertexLabel: Array<Array<Label>> = outboundVertices.map(
        a => [...g.vertices[a].outbound]
            .map(
                b => [...h.vertices[b].outbound]
                    .map(c => [a, c]),
            ),
    )
        .reduce(liftingReducer)
        .reduce(liftingReducer);

    newEdgesByVertexLabel.forEach(([a, c]) => o.addEdge(g.vertices[a], h.vertices[c]));

    return o;
}

export default x;
