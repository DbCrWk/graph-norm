// @flow
import GraphSequence from '../object/GraphSequence';
import ReflexiveDiGraph from '../object/ReflexiveDiGraph';
import findEqualityPoint from './findEqualityPoint';
import type { RenormalizedSequence } from '../object/RenormalizedSequence';

function generateRenormalizationHelper(
    s: GraphSequence,
    last: ReflexiveDiGraph,
): RenormalizedSequence {
    if (s.length === 0) return [];

    const p = findEqualityPoint(s, last);
    if (p === Infinity) return [s];

    const [head, point, tail] = s.split(p);
    return [
        ...generateRenormalizationHelper(head, last),
        point.sequence[0],
        ...generateRenormalizationHelper(tail, last),
    ];
}

function generateRenormalization(s: GraphSequence): RenormalizedSequence {
    const last = s.getLastCumulant();
    return generateRenormalizationHelper(s, last);
}

export default generateRenormalization;
