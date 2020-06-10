// @flow
import GraphSequence from './GraphSequence';
import { debugLib as debugGn, errorLib as errorGn } from '../util/logger';
import generateRenormalization from '../func/generateRenormalization';
import ReflexiveDiGraph from './ReflexiveDiGraph';

// We have to do this as a cycle is inevitable based on our structure
/* eslint-disable import/no-cycle */
import TemporalNode from './TemporalNode';
import SpecialTemporalNode from './Special.TemporalNode';
import GraphTemporalNode from './Graph.TemporalNode';
/* eslint-enable import/no-cycle */

import type { NodeSequence } from '../../schema/temporal.tree/1.0.0.type';

const namespace = 'Object > Sequence.TemporalNode';
const debug = debugGn(namespace);
const error = errorGn(namespace);

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

        debug('.constructor', 'Sequence assigned', { label, length: sequence.length, isTransitive: this.isTransitive });

        // Transitive case
        debug('.constructor', 'Generating renormalization', { label });
        const renormalizationSequence = generateRenormalization(sequence);
        debug('.constructor', 'Renormalization generated', { label });

        if (this.isTransitive) {
            debug('.constructor', 'Sequence is transitive; performing simple map of children', { label });
            this.children = renormalizationSequence.map(
                c => (
                    (c instanceof GraphSequence)
                        ? new SequenceTemporalNode(c)
                        : new GraphTemporalNode(c)
                ),
            );
            debug('.constructor', 'Sequence children mapped', { label });
            return;
        }


        // Intransitive case
        debug('.constructor', 'Sequence is intransitive; performing curated map of children', { label });
        if (renormalizationSequence.length === 1) {
            debug('.constructor', 'One child detected', { label });
            const child = renormalizationSequence[0];
            if (!(child instanceof ReflexiveDiGraph)) {
                throw error('.constructor: intransitive', 'Sole child of renormalization sequence is not a graph', { label });
            }

            this.children = [
                new GraphTemporalNode(child),
            ];
            return;
        }

        if (renormalizationSequence.length === 2) {
            debug('.constructor', 'Two children detected', { label });
            const [first, second] = renormalizationSequence;
            if (
                (first instanceof ReflexiveDiGraph)
                && (second instanceof GraphSequence)
            ) {
                debug('.constructor', 'Graph first; (special) sequence second', { label });
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
                debug('.constructor', 'Sequence first; graph second', { label });
                const head = first;
                const child = second;
                this.children = [
                    new SequenceTemporalNode(head),
                    new GraphTemporalNode(child),
                ];
                return;
            }

            if (first instanceof GraphSequence) {
                throw error('.constructor: intransitive', 'Both children are sequences', { label });
            }
            throw error('.constructor: intransitive', 'Both children are graphs', { label });
        }

        if (renormalizationSequence.length === 3) {
            debug('.constructor', 'Three (max) children detected: sequence, graph, (special) sequence', { label });
            const [head, child, tail] = renormalizationSequence;
            if (!(head instanceof GraphSequence)) {
                throw error('.constructor: intransitive', 'Child 1 of 3 of renormalization sequence is not a sequence', { label });
            }
            if (!(child instanceof ReflexiveDiGraph)) {
                throw error('.constructor: intransitive', 'Child 2 of 3 of renormalization sequence is not a graph', { label });
            }
            if (!(tail instanceof GraphSequence)) {
                throw error('.constructor: intransitive', 'Child 3 of 3 of renormalization sequence is not a sequence', { label });
            }

            this.children = [
                new SequenceTemporalNode(head),
                new GraphTemporalNode(child),
                new SpecialTemporalNode(tail),
            ];
            return;
        }

        throw error('.constructor: intransitive', 'Intransitive entry has too many elements in renormalization sequence', { label });
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
