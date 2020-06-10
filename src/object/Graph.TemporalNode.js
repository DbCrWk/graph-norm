// @flow
import ReflexiveDiGraph from './ReflexiveDiGraph';

// We have to do this as a cycle is inevitable based on our structure
/* eslint-disable import/no-cycle */
import TemporalNode from './TemporalNode';
/* eslint-enable import/no-cycle */

import type { NodeGraph } from '../../schema/temporal.tree/1.0.0.type';

class GraphTemporalNode extends TemporalNode {
    isTransitive: boolean;

    constructor(graph: ReflexiveDiGraph) {
        super(graph.label);
        this.isTransitive = graph.isTransitive();
    }

    toNode(): NodeGraph {
        return {
            category: 'graph',
            label: this.label,
            isTransitive: this.isTransitive,
        };
    }
}

export default GraphTemporalNode;
