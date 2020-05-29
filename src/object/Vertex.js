// @flow
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
}

export default Vertex;
