// @flow
import ReflexiveDiGraph from './ReflexiveDiGraph';
import x from '../func/x';

class GraphSequence {
    sequence: Array<ReflexiveDiGraph>;

    cumulantSequence: Array<ReflexiveDiGraph>;

    length: number;

    constructor() {
        this.sequence = [];
        this.cumulantSequence = [];
        this.length = 0;
    }

    push(g: ReflexiveDiGraph) {
        this.sequence.push(g);
        this.length += 1;

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
        const point = new GraphSequence();
        const tail = new GraphSequence();

        this.sequence.forEach((g, i) => {
            if (i < p) { head.push(g); return; }
            if (i === p) { point.push(g); return; }
            tail.push(g);
        });

        return [head, point, tail];
    }

    isTransitive(): boolean {
        const lastCumulant = this.cumulantSequence[this.cumulantSequence.length - 1];
        return lastCumulant.isTransitive();
    }
}

export default GraphSequence;
