// @flow

type NodeLabel = string;

type Node = {|
    label: NodeLabel,
    edgeSet: {|
        inbound: { [NodeLabel]: NodeLabel },
        outbound: { [NodeLabel]: NodeLabel },
    |},
|};

function liftingReducer<T>(a: Array<T>, b: Array<T>): Array<T> {
    return [...a, ...b];
}

class ReflexiveDiGraph {
    // TODO: this type could be made stronger to enforce that a NodeLabel always
    // maps to the right NodeLabel
    nodes: { [NodeLabel]: Node };

    edges: {|
        inbound: { [NodeLabel]: Array<NodeLabel> },
        outbound: { [NodeLabel]: Array<NodeLabel> },
    |};

    constructor() {
        this.nodes = {};
        this.edges = { inbound: { }, outbound: {} };
    }

    addNodeByLabel(tentativeNodeLabel: NodeLabel | number) {
        const nodeLabel = tentativeNodeLabel.toString();

        this.nodes[nodeLabel] = {
            label: nodeLabel,
            edgeSet: {
                inbound: { [nodeLabel]: nodeLabel },
                outbound: { [nodeLabel]: nodeLabel },
            },
        };

        this.edges.outbound[nodeLabel] = [nodeLabel];
        this.edges.inbound[nodeLabel] = [nodeLabel];
    }

    addEdgeByLabels(
        tentativeNodeLabelA: NodeLabel | number,
        tentativeNodeLabelB: NodeLabel | number,
    ) {
        const nodeLabelA = tentativeNodeLabelA.toString();
        const nodeLabelB = tentativeNodeLabelB.toString();

        this.nodes[nodeLabelA].edgeSet.outbound[nodeLabelB] = nodeLabelB;
        this.nodes[nodeLabelB].edgeSet.inbound[nodeLabelA] = nodeLabelA;

        this.edges.outbound[nodeLabelA].push(nodeLabelB);
        this.edges.inbound[nodeLabelB].push(nodeLabelA);
    }

    copyNodeLabelsFrom(g: ReflexiveDiGraph) {
        const allNodeLabels = Object.keys(g.nodes);
        allNodeLabels.forEach(l => this.addNodeByLabel(l));
    }
}

function x(g: ReflexiveDiGraph, h: ReflexiveDiGraph): ReflexiveDiGraph {
    const o = new ReflexiveDiGraph();

    o.copyNodeLabelsFrom(g);
    o.copyNodeLabelsFrom(h);

    const outboundEdgeNodeLabels = Object.keys(g.edges.outbound);
    const newEdges: Array<Array<NodeLabel>> = outboundEdgeNodeLabels.map(
        (l: NodeLabel) => g.edges.outbound[l].map(
            r => h.edges.outbound[r].map(
                (s: NodeLabel): Array<NodeLabel> => [l, s],
            ),
        ),
    )
        .reduce(liftingReducer)
        .reduce(liftingReducer);

    newEdges.forEach(([a, b]) => o.addEdgeByLabels(a, b));

    return o;
}

const g = new ReflexiveDiGraph();
const h = new ReflexiveDiGraph();

g.addNodeByLabel(1);
g.addNodeByLabel(2);
g.addNodeByLabel(3);
g.addEdgeByLabels(1, 2);

h.addNodeByLabel(1);
h.addNodeByLabel(2);
h.addNodeByLabel(3);
h.addEdgeByLabels(2, 3);

const o = x(g, h);
console.log('o', JSON.stringify(o, null, 4));
