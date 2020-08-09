// @flow
import GraphSequence from '../object/GraphSequence';
import ReflexiveDiGraph from '../object/ReflexiveDiGraph';

function findEqualityPoint(s: GraphSequence, last: ReflexiveDiGraph): number {
    function findEqualityPointHelper(
        q: Array<ReflexiveDiGraph>, baseSize: number, best: number,
    ): number {
        if (q.length === 0) return Infinity;

        const m = Math.floor(q.length / 2);
        const gM = q[m];
        const isSame = gM.isSameAs(last);

        if (isSame && m === 0) return baseSize + m;
        if (!isSame && m === q.length - 1) return best;

        const newQ = isSame ? q.slice(0, m) : q.slice(m + 1, q.length);
        const newBaseSize = isSame ? baseSize : baseSize + m + 1;
        const newBest = isSame ? baseSize + m /* should be less than best */ : best;
        return findEqualityPointHelper(newQ, newBaseSize, newBest);
    }

    return findEqualityPointHelper(s.cumulantSequence, 0, Infinity);
}

export default findEqualityPoint;
