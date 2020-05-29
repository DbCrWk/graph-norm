// @flow
import Vertex from './Vertex';
import type { Label } from './Vertex';

class ReflexiveDiGraph {
    // TODO: this type could be made stronger to enforce that a NodeLabel always
    // maps to the right NodeLabel
    vertices: { [Label]: Vertex };

    transitiveFront: ReflexiveDiGraph;

    constructor() {
        this.vertices = {};
        this.transitiveFront = this;
    }

    hasVertex(vertex: Vertex): boolean {
        return (vertex.label in this.vertices);
    }

    addVertex(vertex: Vertex) {
        if (this.hasVertex(vertex)) return;

        this.copyInsertIntoVertexList(vertex);
        this.addEdgeIntoVertexLists(vertex, vertex);
    }

    hasEdge(vertexA: Vertex, vertexB: Vertex): boolean {
        return (
            this.hasVertex(vertexA)
            && this.hasVertex(vertexB)
            && (vertexB.label in this.vertices[vertexA.label].outbound)
            && (vertexA.label in this.vertices[vertexB.label].inbound)
        );
    }

    addEdge(vertexA: Vertex, vertexB: Vertex) {
        if (this.hasEdge(vertexA, vertexB)) return;

        this.addVertex(vertexA);
        this.addVertex(vertexB);
        this.addEdgeIntoVertexLists(vertexA, vertexB);
    }

    isSameAs(h: ReflexiveDiGraph): boolean {
        const gVertexLabels = Object.keys(this.vertices);
        const hVertexLabels = Object.keys(h.vertices);

        if (gVertexLabels.length !== hVertexLabels.length) return false;
        const isGVertexSameAsH = gVertexLabels.map(
            u => (u in h.vertices) && (h.vertices[u].isSameAs(this.vertices[u])),
        );
        const areAllVerticesTheSame = isGVertexSameAsH.reduce((p, c) => p && c);

        return areAllVerticesTheSame;
    }

    addEdgeIntoVertexLists(vertexA: Vertex, vertexB: Vertex) {
        this.vertices[vertexA.label].outbound.add(vertexB.label);
        this.vertices[vertexB.label].inbound.add(vertexA.label);
    }

    copyInsertIntoVertexList(vertex: Vertex) {
        const { label } = vertex;
        const newVertex = new Vertex(label);
        this.vertices[label] = newVertex;
    }
}

export default ReflexiveDiGraph;
