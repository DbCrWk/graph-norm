// @flow
import ReflexiveDiGraph from '../object/ReflexiveDiGraph';
import liftingReducer from './liftingReducer';
import type { Label } from '../object/Label';

type EdgeAsLabelArray = Array<Label>;

function x(g: ReflexiveDiGraph, h: ReflexiveDiGraph): ReflexiveDiGraph {
    const o = new ReflexiveDiGraph(`${g.label} x ${h.label}`);
    const outboundVertices: Array<Label> = Object.keys(g.vertices);

    // TODO: we just assume that all vertices are well-defined in both graphs
    const newEdgesByVertexLabel: Array<EdgeAsLabelArray> = outboundVertices.map(
        (a: Label): Array<Array<EdgeAsLabelArray>> => [...g.vertices[a].outbound]
            .map(
                (b: Label): Array<EdgeAsLabelArray> => [...h.vertices[b].outbound]
                    .map(
                        (c: Label): EdgeAsLabelArray => [a, c],
                    ),
            ),
    )
        .reduce(liftingReducer, [])
        .reduce(liftingReducer, []);

    newEdgesByVertexLabel.forEach(([a, c]) => o.addEdge(g.vertices[a], h.vertices[c]));

    return o;
}

export default x;
