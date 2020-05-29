// @flow
import ReflexiveDiGraph from './ReflexiveDiGraph';
import x from '../func/x';

class GraphSequence {
    sequence: Array<ReflexiveDiGraph>;

    cumulantSequence: Array<ReflexiveDiGraph>;

    constructor() {
        this.sequence = [];
        this.cumulantSequence = [];
    }

    push(g: ReflexiveDiGraph) {
        this.sequence.push(g);

        if (this.sequence.length === 1) {
            this.cumulantSequence.push(g);
            return;
        }

        const previousGraph = this.cumulantSequence[this.cumulantSequence.length - 1];
        const productGraph = x(previousGraph, g);
        this.cumulantSequence.push(productGraph);
    }

    split(p: number): Array<GraphSequence> {
        const head = new GraphSequence();
        const tail = new GraphSequence();

        this.sequence.forEach((g, i) => {
            if (i < p) head.push(g);
            tail.push(g);
        });

        return [head, tail];
    }
}

export default GraphSequence;
