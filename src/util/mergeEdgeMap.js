// @flow
import type { Label } from '../object/Label';

function mergeEdgeMap(
    edgeMapA: { [Label]: Array<Label> },
    edgeMapB: { [Label]: Array<Label> },
): { [Label]: Array<Label> } {
    const merged = {};
    Object.keys(edgeMapA).forEach((k: Label) => {
        const otherSet = edgeMapB[k] || [];
        merged[k] = [...new Set([...edgeMapA[k], ...otherSet])];
    });

    Object.keys(edgeMapB).forEach((k: Label) => {
        if (merged[k]) return;
        merged[k] = [...edgeMapB[k]];
    });

    return merged;
}

export default mergeEdgeMap;
