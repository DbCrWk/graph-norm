// @flow
import ReflexiveDiGraph from './ReflexiveDiGraph';
import { debugLib as debugGn } from '../util/logger';

// We have to do this as a cycle is inevitable based on our structure
/* eslint-disable import/no-cycle */
import TemporalNode from './TemporalNode';
/* eslint-enable import/no-cycle */

import type { NodeGraph } from '../../schema/temporal.tree/1.0.0.type';

const namespace = 'Object > Graph.TemporalNode';
const debug = debugGn(namespace);

class GraphTemporalNode extends TemporalNode {
    isTransitive: boolean;

    graph: ReflexiveDiGraph;

    constructor(graph: ReflexiveDiGraph) {
        const { label } = graph;
        super(label);
        this.graph = graph;
        this.isTransitive = graph.isTransitive();

        debug('.constructor', 'Graph assigned', { label, isTransitive: this.isTransitive });
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
