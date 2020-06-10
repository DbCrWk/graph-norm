// @flow
import GraphSequence from './GraphSequence';

// We have to do this as a cycle is inevitable based on our structure
/* eslint-disable import/no-cycle */
import TemporalNode from './TemporalNode';
import SequenceTemporalNode from './Sequence.TemporalNode';
/* eslint-enable import/no-cycle */

import type { NodeSpecial } from '../../schema/temporal.tree/1.0.0.type';

class SpecialTemporalNode extends TemporalNode {
    children: Array<SequenceTemporalNode>;

    constructor(sequence: GraphSequence) {
        if (sequence.length === 0) {
            throw new TypeError('Special.TemporalNode: Sequence must have entries');
        }

        const firstLabel = sequence.sequence[0].label;
        const lastLabel = sequence.sequence[sequence.length - 1].label;
        const label = `△ ${firstLabel} ... ${lastLabel}`;
        super(label);

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
