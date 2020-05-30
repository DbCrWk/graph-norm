// @flow
import ReflexiveDiGraph from './ReflexiveDiGraph';
import GraphSequence from './GraphSequence';
import generateRenormalization from '../func/generateRenormalization';
import type { RenormalizedSequenceEntry } from './RenormalizedSequence';

class ParseNode {
    entry: RenormalizedSequenceEntry;

    isSpecial: boolean;

    children: Array<ParseNode>;

    constructor(
        entry: RenormalizedSequenceEntry,
        { isSpecial }: { isSpecial: boolean } = { isSpecial: false },
    ) {
        if (
            this.entry instanceof ReflexiveDiGraph
            && isSpecial
        ) throw new TypeError('ParseNode [.constructor]: Special entry must be a sequence; graph given');

        this.entry = entry;
        this.isSpecial = isSpecial;
        this.children = [];

        if (isSpecial) this.processSpecialEntry();
        else this.processEntry();
    }

    processEntry() {
        if (this.entry instanceof ReflexiveDiGraph) return;
        if (this.entry.length === 0) return;
        if (this.entry.isTransitive()) {
            this.processTransitiveEntry();
            return;
        }
        this.processIntransitiveEntry();
    }

    processSpecialEntry() {
        if (!(this.entry instanceof GraphSequence)) {
            throw new TypeError('ParseNode [.processSpecialEntry]: Special entry must be a graph sequence');
        }

        this.children = [
            new ParseNode(this.entry),
        ];
    }

    processTransitiveEntry() {
        if (this.entry instanceof ReflexiveDiGraph) return;
        const renormalizationSequence = generateRenormalization(this.entry);
        this.children = renormalizationSequence.map(c => new ParseNode(c));
    }

    processIntransitiveEntry() {
        if (this.entry instanceof ReflexiveDiGraph) return;
        const renormalizationSequence = generateRenormalization(this.entry);

        if (renormalizationSequence.length === 1) {
            const child = renormalizationSequence[0];
            if (!(child instanceof ReflexiveDiGraph)) {
                throw new TypeError('ParseNode [.processIntransitiveEntry]: Sole child of renormalization sequence is not a graph');
            }

            this.children = [
                new ParseNode(new GraphSequence()),
                new ParseNode(renormalizationSequence[0]),
                new ParseNode(new GraphSequence()),
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
                    new ParseNode(child),
                    new ParseNode(tail, { isSpecial: true }),
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
                    new ParseNode(head),
                    new ParseNode(child),
                ];
                return;
            }

            if (first instanceof GraphSequence) {
                throw new TypeError('ParseNode [.processIntransitiveEntry]: Both children are sequences');
            }
            throw new TypeError('ParseNode [.processIntransitiveEntry]: Both children are graphs');
        }

        if (renormalizationSequence.length === 3) {
            const [head, child, tail] = renormalizationSequence;
            if (!(head instanceof GraphSequence)) {
                throw new TypeError('ParseNode [.processIntransitiveEntry]: Child 1 of 3 of renormalization sequence is not a sequence');
            }
            if (!(child instanceof ReflexiveDiGraph)) {
                throw new TypeError('ParseNode [.processIntransitiveEntry]: Child 2 of 3 of renormalization sequence is not a graph');
            }
            if (!(tail instanceof GraphSequence)) {
                throw new TypeError('ParseNode [.processIntransitiveEntry]: Child 3 of 3 of renormalization sequence is not a sequence');
            }

            this.children = [
                new ParseNode(head),
                new ParseNode(child),
                new ParseNode(tail, { isSpecial: true }),
            ];
            return;
        }

        throw new TypeError('ParseNode [.processIntransitiveEntry]: Intransitive entry has too many elements in renormalization sequence');
    }
}

export default ParseNode;
