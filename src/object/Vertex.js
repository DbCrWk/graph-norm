// @flow
import doesSet from '../func/doesSet';

export type Label = string;

class Vertex {
    label: Label;

    inbound: Set<Label>;

    outbound: Set<Label>;

    constructor(label: string | number) {
        this.label = label.toString();
        this.inbound = new Set();
        this.outbound = new Set();
    }

    copyFrom(y: Vertex) {
        this.label = y.label;
        this.inbound = new Set(y.inbound);
        this.outbound = new Set(y.outbound);
    }

    isSameAs(y: Vertex): boolean {
        if (this.label !== y.label) return false;
        if (!doesSet(this.inbound).equal(y.inbound)) return false;
        if (!doesSet(this.outbound).equal(y.outbound)) return false;

        return true;
    }

    dominates(y: Vertex): boolean {
        return doesSet(this.inbound).dominate(y.inbound);
    }
}

export default Vertex;
