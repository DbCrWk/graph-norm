// @flow
import ReflexiveDiGraph from './ReflexiveDiGraph';
import x from '../func/x';
import { debugLib as debugGn } from '../util/logger';

const namespace = 'Object > GraphSequence';
const debug = debugGn(namespace);

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
        debug('.push', 'Starting', { label: g.label });
        this.sequence.push(g);
        this.length += 1;
        debug('.push', 'Graph inserted into sequence', { length: this.length });

        if (this.sequence.length === 1) {
            debug('.push', 'First graph detected; setting as start of cumulantSequence');
            this.cumulantSequence.push(g);
            return;
        }

        const previousGraph = this.getLastCumulant();
        debug('.push', 'Previous graph found', { label: g.label, previousGraph: { label: previousGraph.label } });

        debug('.push', 'Generating product graph');
        const productGraph = x(previousGraph, g);
        debug('.push', 'Product graph created', { label: g.label, productGraph: { label: productGraph.label } });


        debug('.push', 'Pushing to cumulant sequence');
        this.cumulantSequence.push(productGraph);
        debug('.push', 'Done', { label: g.label });
    }

    split(p: number): Array<GraphSequence> {
        debug('.split', 'Starting');

        const head = new GraphSequence();
        const point = new GraphSequence();
        const tail = new GraphSequence();

        this.sequence.forEach((g, i) => {
            if (i < p) { head.push(g); return; }
            if (i === p) { point.push(g); return; }
            tail.push(g);
        });

        debug('.split', 'Done');
        return [head, point, tail];
    }

    isTransitive(): boolean {
        const lastCumulant = this.getLastCumulant();
        return lastCumulant.isTransitive();
    }

    getLastCumulant(): ReflexiveDiGraph {
        return this.cumulantSequence[this.cumulantSequence.length - 1];
    }
}

export default GraphSequence;
