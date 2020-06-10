// @flow
import type { Label } from '../object/Label';

function convertEdgeListToEdgeMap(edgeList: Array<Array<Label>>): { [Label]: Array<Label> } {
    const edgeSet: { [Label]: Set<Label> } = {};
    edgeList.forEach(([a, c]) => {
        if (edgeSet[a]) edgeSet[a].add(c);
        else edgeSet[a] = new Set([c]);
    });
    const edgeMap: { [Label]: Array<Label> } = {};
    Object.keys(edgeSet).forEach(a => {
        edgeMap[a] = [...edgeSet[a]];
    });

    return edgeMap;
}

export default convertEdgeListToEdgeMap;
