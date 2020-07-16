// @flow
import type { Schema as Temporal } from '../temporal.tree/1.0.0.type';
import type { Schema as Topological } from '../topological.tree/1.0.0.type';

type Label = string;
type Version = '1.1.0';

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

export type Schema = {|
    label: Label,
    $schema?: "https://raw.githubusercontent.com/DbCrWk/graph-norm/development/schema/parse.tree/1.1.0.json",
    version: Version,
    vertices: Array<Vertex>,
    graphs: { [GraphLabel]: Graph },
    sequence: Array<GraphWithLabel | GraphLabel>,
    temporal: Temporal,
    topological: Topological,
|};
