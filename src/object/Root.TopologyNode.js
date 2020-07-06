// @flow
import TopologyNode from './TopologyNode';
import SequenceTemporalNode from './Sequence.TemporalNode';
import type { Root } from '../../schema/topological.tree/1.0.0.type';

class RootTopologyNode {
    label: 'root';

    children: Array<TopologyNode>;

    constructor(n: SequenceTemporalNode) {
        this.label = 'root';
        this.children = Object.keys(
            n.sequence.getLastCumulant().getCliqueMap(),
        ).map(l => new TopologyNode(n, l));
    }

    toNode(): Root {
        return {
            category: 'root',
            label: this.label,
            children: this.children.map(c => c.toNode()),
        };
    }
}

export default RootTopologyNode;
