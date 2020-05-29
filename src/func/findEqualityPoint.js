// @flow
import GraphSequence from '../object/GraphSequence';
import ReflexiveDiGraph from '../object/ReflexiveDiGraph';

function findEqualityPoint(s: GraphSequence): number | null {
    const last = s.cumulantSequence[s.cumulantSequence.length - 1];

    function findEqualityPointHelper(
        q: Array<ReflexiveDiGraph>, baseSize: number, best: number | null,
    ): number | null {
        const m = Math.floor(q.length / 2);
        const gM = q[m];
        const isSame = gM.isSameAs(last);

        if (isSame && m === 0) return baseSize + m;
        if (!isSame && m === q.length - 1) return best;

        const newQ = isSame ? q.slice(0, m) : q.slice(m + 1, q.length);
        const newBaseSize = isSame ? baseSize : baseSize + m;
        const newBest = isSame ? baseSize + m /* should be less than best */ : best;
        return findEqualityPointHelper(newQ, newBaseSize, newBest);
    }

    const p = findEqualityPointHelper(s.cumulantSequence, 0, Infinity);
    return (p === Infinity ? null : p);
}

export default findEqualityPoint;
