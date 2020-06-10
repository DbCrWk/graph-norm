// @flow
import GraphSequence from './GraphSequence';
import generateRenormalization from '../func/generateRenormalization';
import ReflexiveDiGraph from './ReflexiveDiGraph';

// We have to do this as a cycle is inevitable based on our structure
/* eslint-disable import/no-cycle */
import TemporalNode from './TemporalNode';
import SpecialTemporalNode from './Special.TemporalNode';
import GraphTemporalNode from './Graph.TemporalNode';
/* eslint-enable import/no-cycle */

import type { NodeSequence } from '../../schema/temporal.tree/1.0.0.type';

class SequenceTemporalNode extends TemporalNode {
    isTransitive: boolean;

    children: Array<TemporalNode>;

    constructor(sequence: GraphSequence) {
        if (sequence.length === 0) {
            throw new TypeError('Sequence.TemporalNode: Sequence must have entries');
        }

        const firstLabel = sequence.sequence[0].label;
        const lastLabel = sequence.sequence[sequence.length - 1].label;
        const label = `${firstLabel} ... ${lastLabel}`;
        super(label);
        this.isTransitive = sequence.isTransitive();

        // Transitive case
        const renormalizationSequence = generateRenormalization(sequence);
        if (this.isTransitive) {
            this.children = renormalizationSequence.map(
                c => (
                    (c instanceof GraphSequence)
                        ? new SequenceTemporalNode(c)
                        : new GraphTemporalNode(c)
                ),
            );
            return;
        }

        // Intransitive case
        if (renormalizationSequence.length === 1) {
            const child = renormalizationSequence[0];
            if (!(child instanceof ReflexiveDiGraph)) {
                throw new TypeError('Sequence.TemporalNode [intransitive]: Sole child of renormalization sequence is not a graph');
            }

            this.children = [
                new GraphTemporalNode(child),
            ];
            return;
        }

        if (renormalizationSequence.length === 2) {
            const [first, second] = renormalizationSequence;
            if (
                (first instanceof ReflexiveDiGraph)
                && (second instanceof GraphSequence)
            ) {
                const child = first;
                const tail = second;
                this.children = [
                    new GraphTemporalNode(child),
                    new SpecialTemporalNode(tail),
                ];
                return;
            }

            if (
                (first instanceof GraphSequence)
                && (second instanceof ReflexiveDiGraph)
            ) {
                const head = first;
                const child = second;
                this.children = [
                    new SequenceTemporalNode(head),
                    new GraphTemporalNode(child),
                ];
                return;
            }

            if (first instanceof GraphSequence) {
                throw new TypeError('Sequence.TemporalNode [intransitive]: Both children are sequences');
            }
            throw new TypeError('Sequence.TemporalNode [intransitive]: Both children are graphs');
        }

        if (renormalizationSequence.length === 3) {
            const [head, child, tail] = renormalizationSequence;
            if (!(head instanceof GraphSequence)) {
                throw new TypeError('Sequence.TemporalNode [intransitive]: Child 1 of 3 of renormalization sequence is not a sequence');
            }
            if (!(child instanceof ReflexiveDiGraph)) {
                throw new TypeError('Sequence.TemporalNode [intransitive]: Child 2 of 3 of renormalization sequence is not a graph');
            }
            if (!(tail instanceof GraphSequence)) {
                throw new TypeError('Sequence.TemporalNode [intransitive]: Child 3 of 3 of renormalization sequence is not a sequence');
            }

            this.children = [
                new SequenceTemporalNode(head),
                new GraphTemporalNode(child),
                new SpecialTemporalNode(tail),
            ];
            return;
        }

        throw new TypeError('ParseNode [.processIntransitiveEntry]: Intransitive entry has too many elements in renormalization sequence');
    }

    toNode(): NodeSequence {
        return {
            category: 'sequence',
            label: this.label,
            isTransitive: this.isTransitive,
            children: this.children.map(c => c.toNode()),
        };
    }
}

export default SequenceTemporalNode;
