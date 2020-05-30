// @flow
import Vertex from './Vertex';
import type { Label } from './Label';

class ReflexiveDiGraph {
    // TODO: this type could be made stronger to enforce that a NodeLabel always
    // maps to the right NodeLabel
    label: Label;

    vertices: { [Label]: Vertex };

    transitiveFront: ReflexiveDiGraph;

    constructor(label: Label = '') {
        this.vertices = {};
        this.transitiveFront = this;
        this.label = label;
    }

    // //////////////////////////////
    // Instance methods
    // //////////////////////////////

    hasVertex(vertex: Vertex): boolean {
        return (vertex.label in this.vertices);
    }

    addVertex(vertex: Vertex) {
        if (this.hasVertex(vertex)) return;

        this.copyInsertIntoVertexList(vertex);
        this.addEdgeIntoVertexLists(vertex, vertex);
        this.transitiveFront.addVertex(vertex);
    }

    hasEdge(a: Vertex, b: Vertex): boolean {
        return (
            this.hasVertex(a)
            && this.hasVertex(b)
            && (b.label in this.vertices[a.label].outbound)
            && (a.label in this.vertices[b.label].inbound)
        );
    }

    addEdge(a: Vertex, b: Vertex) {
        this.addEdgeForce(a, b);
        this.updateTransitiveFrontWithEdge(a, b);
    }

    isTransitive(): boolean {
        return this.isSameAs(this.transitiveFront);
    }

    // ///////////////////////////////
    // Relative methods
    // //////////////////////////////

    copyFrom(h: ReflexiveDiGraph) {
        const newVertices = Object.keys(h.vertices);
        newVertices.forEach(l => {
            this.vertices[l] = new Vertex(l);
            this.vertices[l].copyFrom(h.vertices[l]);
        });
    }

    isSameAs(h: ReflexiveDiGraph): boolean {
        if (this === h) return true;

        const gVertexLabels = Object.keys(this.vertices);
        const hVertexLabels = Object.keys(h.vertices);

        if (gVertexLabels.length !== hVertexLabels.length) return false;
        const isGVertexSameAsH = gVertexLabels.map(
            u => (u in h.vertices) && (h.vertices[u].isSameAs(this.vertices[u])),
        );
        const areAllVerticesTheSame = isGVertexSameAsH.reduce((p, c) => p && c);
        return areAllVerticesTheSame;
    }

    dominates(h: ReflexiveDiGraph): boolean {
        if (this === h) return true;

        const thisVertexLabels = Object.keys(this.vertices);
        const hVertexLabels = Object.keys(h.vertices);
        if (thisVertexLabels.length < hVertexLabels.length) return false;

        const isHVertexDominated = hVertexLabels.map(
            l => (l in this.vertices) && (this.vertices[l].dominates(h.vertices[l])),
        );

        const doAllVerticesDominate = isHVertexDominated.reduce((p, c) => p && c);
        return doAllVerticesDominate;
    }

    // ///////////////////////////////
    // Internal utility methods
    // //////////////////////////////

    updateTransitiveFrontWithEdge(ap: Vertex, bp: Vertex) {
        const a = this.vertices[ap.label];
        const b = this.vertices[bp.label];

        b.inbound.forEach(l => {
            const z = this.vertices[l];

            if (b.dominates(z)) {
                if (!this.transitiveFront.hasEdge(z, b)) {
                    if (this.transitiveFront === this) {
                        this.transitiveFront = new ReflexiveDiGraph();
                        this.transitiveFront.copyFrom(this);
                    }

                    this.transitiveFront.addEdgeForce(z, b);
                }
            }
        });

        a.outbound.forEach(l => {
            const z = this.vertices[l];

            if (!z.dominates(a)) {
                if (this.transitiveFront.hasEdge(a, z)) {
                    if (this.transitiveFront === this) {
                        this.transitiveFront = new ReflexiveDiGraph();
                        this.transitiveFront.copyFrom(this);
                    }

                    this.transitiveFront.removeEdgeForce(a, z);
                }
            }
        });
    }

    addEdgeForce(a: Vertex, b: Vertex) {
        if (this.hasEdge(a, b)) return;

        // Account for modifying this graph
        this.addVertex(a);
        this.addVertex(b);
        this.addEdgeIntoVertexLists(a, b);
    }

    removeEdgeForce(a: Vertex, b: Vertex) {
        if (!this.hasEdge(a, b)) return;

        // Account for modifying this graph
        this.addVertex(a);
        this.addVertex(b);
        this.removeEdgeFromVertexLists(a, b);
    }

    addEdgeIntoVertexLists(vertexA: Vertex, vertexB: Vertex) {
        this.vertices[vertexA.label].outbound.add(vertexB.label);
        this.vertices[vertexB.label].inbound.add(vertexA.label);
    }

    removeEdgeFromVertexLists(vertexA: Vertex, vertexB: Vertex) {
        this.vertices[vertexA.label].outbound.delete(vertexB.label);
        this.vertices[vertexB.label].inbound.delete(vertexA.label);
    }

    copyInsertIntoVertexList(vertex: Vertex) {
        const { label } = vertex;
        const newVertex = new Vertex(label);
        this.vertices[label] = newVertex;
    }
}

export default ReflexiveDiGraph;
