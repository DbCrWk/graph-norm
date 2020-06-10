// @flow
import { debugLib as debugGn } from '../util/logger';
import ReflexiveDiGraph from '../object/ReflexiveDiGraph';
import type { Label } from '../object/Label';

const namespace = 'func > x';
const debug = debugGn(namespace);

function x(g: ReflexiveDiGraph, h: ReflexiveDiGraph): ReflexiveDiGraph {
    const o = new ReflexiveDiGraph(`${g.label}×${h.label}`);
    const outboundVertices: Array<Label> = Object.keys(g.vertices);

    debug('()', 'First Graph', { label: g.label, n: outboundVertices.length });
    debug('()', 'Second Graph', { label: h.label, n: Object.keys(h.vertices).length });

    // TODO: we just assume that all vertices are well-defined in both graphs
    // NOTE: there is a clean "map/reduce" way to write this, but that method is
    // a bit slow; in particular, we tend to create a lot of unnecessary
    // duplicate entries
    const newEdgeSetMap: { [Label]: Array<Label> } = {};
    outboundVertices.forEach(a => {
        const uniqueEdges: Set<Label> = new Set();
        [...g.vertices[a].outbound].forEach(b => {
            [...h.vertices[b].outbound].forEach(c => {
                uniqueEdges.add(c);
            });
        });
        newEdgeSetMap[a] = [...uniqueEdges];
    });

    debug('()', 'Adding edges');
    o.addEdgeSetByMap(newEdgeSetMap);
    debug('()', 'Done adding edges');

    return o;
}

export default x;
