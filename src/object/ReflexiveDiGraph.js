// @flow
import Vertex from './Vertex';
import type { Label } from './Vertex';

class ReflexiveDiGraph {
    // TODO: this type could be made stronger to enforce that a NodeLabel always
    // maps to the right NodeLabel
    vertices: { [Label]: Vertex };

    constructor() {
        this.vertices = {};
    }

    addVertex(vertex: Vertex) {
        const { label } = vertex;

        const newVertex = new Vertex(label);
        newVertex.outbound.add(label);
        newVertex.inbound.add(label);

        this.vertices[label] = newVertex;
    }

    addEdge(vertexA: Vertex, vertexB: Vertex) {
        if (!(vertexA.label in this.vertices)) this.addVertex(vertexA);
        if (!(vertexB.label in this.vertices)) this.addVertex(vertexB);

        this.vertices[vertexA.label].outbound.add(vertexB.label);
        this.vertices[vertexB.label].inbound.add(vertexA.label);
    }
}

export default ReflexiveDiGraph;
