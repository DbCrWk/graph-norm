// @flow
import TopologicalNode from './TopologicalNode';
import type { Label } from './Label';
import liftingReducer from '../func/liftingReducer';
import ReflexiveDiGraph from './ReflexiveDiGraph';

class CliqueNode {
    t: TopologicalNode;

    children: Array<CliqueNode>;

    l: Label;

    constructor(t: TopologicalNode, l: Label = '') {
        this.t = t;
        this.l = l;
        this.children = [];

        if (t.parseNode.entry instanceof ReflexiveDiGraph) return;

        if (l in t.cliqueMap) {
            this.children = t.children
                .map(
                    c => c.parentToSelfCliqueMap[l]
                        .map(r => new CliqueNode(c, r)),
                )
                .reduce(liftingReducer, []);
            return;
        }

        const cliqueLabels: Array<Label> = Object.keys(t.cliqueMap);
        this.children = cliqueLabels.map(c => new CliqueNode(t, c));
    }
}

export default CliqueNode;
