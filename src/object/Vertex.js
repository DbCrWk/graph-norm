// @flow
import doesSet from '../func/doesSet';
import type { Label } from './Label';

class Vertex {
    label: Label;

    inbound: Set<Label>;

    outbound: Set<Label>;

    inboundPath: Set<Label>;

    outboundPath: Set<Label>;

    constructor(label: string | number) {
        this.label = label.toString();
        this.inbound = new Set();
        this.outbound = new Set();
        this.inboundPath = new Set();
        this.outboundPath = new Set();
    }

    copyFrom(y: Vertex) {
        this.label = y.label;
        this.inbound = new Set(y.inbound);
        this.outbound = new Set(y.outbound);
        this.inboundPath = new Set(y.inboundPath);
        this.outboundPath = new Set(y.outboundPath);
    }

    isSameAs(y: Vertex): boolean {
        if (this.label !== y.label) return false;
        if (!doesSet(this.inbound).equal(y.inbound)) return false;
        if (!doesSet(this.outbound).equal(y.outbound)) return false;

        // NOTE: We don't have to check paths

        return true;
    }

    dominates(y: Vertex): boolean {
        return doesSet(this.inbound).dominate(y.inbound);
    }

    comparedTo(y: Vertex): number {
        const thisAsNumber = parseInt(this.label, 10);
        const yAsNumber = parseInt(y.label, 10);
        if (
            Number.isNaN(thisAsNumber)
            || Number.isNaN(yAsNumber)
        ) return (thisAsNumber < yAsNumber ? 1 : -1);

        return thisAsNumber - yAsNumber;
    }

    hasEdgeTo(y: Vertex): boolean {
        return doesSet(this.outbound).contain(y.label);
    }

    hasEdgeFrom(y: Vertex): boolean {
        return doesSet(this.inbound).contain(y.label);
    }

    hasPathTo(y: Vertex): boolean {
        return doesSet(this.outboundPath).contain(y.label);
    }

    hasPathFrom(y: Vertex): boolean {
        return doesSet(this.inboundPath).contain(y.label);
    }
}

export default Vertex;
