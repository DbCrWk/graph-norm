// @flow
import ReflexiveDiGraph from './ReflexiveDiGraph';
import x from '../func/x';
import type { Label } from './Label';
import type { CliqueMap } from './CliqueMap';

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

    getCliqueMap(): CliqueMap {
        // NOTE: We can exploit the fact that cliques for a transitive graph are
        // just the strongly connected components
        const { transitiveClosure } = this.cumulantSequence[this.cumulantSequence.length - 1];
        const { vertices } = transitiveClosure;
        const vertexList: Array<Label> = Object.keys(vertices);

        const cliqueMap: CliqueMap = {};
        vertexList.forEach(l => {
            const v = transitiveClosure.vertices[l];
            const communicatingVertices: Array<Label> = [...v.outbound]
                .sort((a: Label, b: Label) => vertices[a].comparedTo(vertices[b]))
                .filter((o: Label) => v.inbound.has(o));

            // Should never be empty because v should communicate with itself
            // Also, this contains all vertices in its communication class already
            const isAlreadyCovered = communicatingVertices.some(o => (o in cliqueMap));
            if (isAlreadyCovered) return;

            const [first] = communicatingVertices;
            cliqueMap[first] = new Set(communicatingVertices);
        });

        return cliqueMap;
    }
}

export default GraphSequence;
