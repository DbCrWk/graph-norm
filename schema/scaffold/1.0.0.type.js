// @flow

type Vertex = number | string;
type Edge = Array<Vertex>;
type GraphLabel = string;
type Graph = {
    label?: GraphLabel,
    edges?: Array<Edge>,
    vertices?: Array<Vertex>,
};
type GraphWithLabel = {
    label: GraphLabel,
    edges?: Array<Edge>,
    vertices?: Array<Vertex>,
};

export type Schema = {
    label: string,
    version: string,
    vertices?: Array<Vertex>,
    edges?: Array<Edge>,
    graphs?: { [GraphLabel]: Graph },
    sequence: Array<GraphWithLabel | GraphLabel>,
};
