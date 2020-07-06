// @flow
import GraphSequence from './GraphSequence';
import { debugLib as debugGn, errorLib as errorGn } from '../util/logger';

// We have to do this as a cycle is inevitable based on our structure
/* eslint-disable import/no-cycle */
import TemporalNode from './TemporalNode';
import SequenceTemporalNode from './Sequence.TemporalNode';
/* eslint-enable import/no-cycle */

import type { NodeSpecial } from '../../schema/temporal.tree/1.0.0.type';
import ReflexiveDiGraph from './ReflexiveDiGraph';

const namespace = 'Object > Special.TemporalNode';
const debug = debugGn(namespace);
const error = errorGn(namespace);

class SpecialTemporalNode extends TemporalNode {
    annotation: ReflexiveDiGraph;

    sequence: GraphSequence;

    children: Array<SequenceTemporalNode>;

    constructor(sequence: GraphSequence, annotation: ReflexiveDiGraph) {
        if (sequence.length === 0) {
            throw error('.constructor', 'Sequence must have entries');
        }

        const firstLabel = sequence.sequence[0].label;
        const lastLabel = sequence.sequence[sequence.length - 1].label;
        const label = `(${firstLabel} ... ${lastLabel}) △ ${annotation.label}`;
        super(label);

        debug('.constructor', 'Sequence assigned', { label, length: sequence.length });

        this.annotation = annotation;

        this.sequence = sequence;

        this.children = [
            new SequenceTemporalNode(sequence),
        ];
    }

    toNode(): NodeSpecial {
        return {
            category: 'special',
            label: this.label,
            children: this.children.map(c => c.toNode()),
        };
    }
}

export default SpecialTemporalNode;
