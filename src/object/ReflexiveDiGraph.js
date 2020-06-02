// @flow
import Vertex from './Vertex';
import type { Label } from './Label';

class ReflexiveDiGraph {
    // TODO: this type could be made stronger to enforce that a NodeLabel always
    // maps to the right NodeLabel
    label: Label;

    vertices: { [Label]: Vertex };

    transitiveFront: ReflexiveDiGraph;

    transitiveClosure: ReflexiveDiGraph;

    constructor(label: Label = '') {
        this.vertices = {};
        this.transitiveFront = this;
        this.transitiveClosure = this;
        this.label = label;
    }

    // //////////////////////////////
    // Instance methods
    // //////////////////////////////

    hasVertex(vp: Vertex): boolean {
        return (vp.label in this.vertices);
    }

    addVertex(vp: Vertex): Vertex {
        if (this.hasVertex(vp)) return this.vertices[vp.label];

        const vertex = this.copyInsertIntoVertexList(vp);
        this.addEdgeForce(vertex, vertex);
        this.addPathForce(vertex, vertex);

        this.transitiveFront.addVertex(vertex);
        this.transitiveClosure.addVertex(vertex);

        return vertex;
    }

    hasEdge(ap: Vertex, bp: Vertex): boolean {
        return (
            this.hasVertex(ap)
            && this.hasVertex(bp)
            && (bp.label in this.vertices[ap.label].outbound)
            && (ap.label in this.vertices[bp.label].inbound)
        );
    }

    addEdge(ap: Vertex, bp: Vertex) {
        const a = this.addVertex(ap);
        const b = this.addVertex(bp);

        this.addEdgeForce(a, b);
        this.addPath(a, b);

        this.updateTransitiveFrontWithEdge(a, b);
    }

    hasPath(ap: Vertex, bp: Vertex) {
        return (
            this.hasVertex(ap)
            && this.hasVertex(bp)
            && (bp.label in this.vertices[ap.label].outboundPath)
            && (ap.label in this.vertices[bp.label].inboundPath)
        );
    }

    addPath(ap: Vertex, bp: Vertex) {
        const a = this.addVertex(ap);
        const b = this.addVertex(bp);

        this.addPathForce(a, b);

        // This assumes that each vertex has a self-loop
        a.inboundPath.forEach(l => {
            const y = this.vertices[l];
            b.outboundPath.forEach(r => {
                const z = this.vertices[r];
                z.inboundPath.add(y.label);
                y.outboundPath.add(z.label);
            });
        });

        this.updateTransitiveClosureWithPath(a, b);
    }

    isTransitive(): boolean {
        return this.isSameAs(this.transitiveFront);
    }

    isClosed(): boolean {
        return this.isSameAs(this.transitiveClosure);
    }

    // ///////////////////////////////
    // Relative methods
    // //////////////////////////////

    copyFrom(h: ReflexiveDiGraph) {
        const newVertices: Array<Label> = Object.keys(h.vertices);
        newVertices.forEach(l => {
            this.vertices[l] = new Vertex(l);
            this.vertices[l].copyFrom(h.vertices[l]);
        });
    }

    isSameAs(h: ReflexiveDiGraph): boolean {
        if (this === h) return true;

        const gVertexLabels: Array<Label> = Object.keys(this.vertices);
        const hVertexLabels: Array<Label> = Object.keys(h.vertices);

        if (gVertexLabels.length !== hVertexLabels.length) return false;
        const isGVertexSame = (u: Label): boolean => (u in h.vertices)
            && (h.vertices[u].isSameAs(this.vertices[u]));
        return gVertexLabels.every(isGVertexSame);
    }

    dominates(h: ReflexiveDiGraph): boolean {
        if (this === h) return true;

        const thisVertexLabels: Array<Label> = Object.keys(this.vertices);
        const hVertexLabels: Array<Label> = Object.keys(h.vertices);
        if (thisVertexLabels.length < hVertexLabels.length) return false;

        const isVertexDominated = (l: Label): boolean => (l in this.vertices)
            && (this.vertices[l].dominates(h.vertices[l]));
        return hVertexLabels.every(isVertexDominated);
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
                        this.transitiveFront = new ReflexiveDiGraph(`tf(${this.label})`);
                        this.transitiveFront.copyFrom(this);
                    }

                    this.transitiveFront.addEdgeForce(z, b);
                    this.transitiveFront.addPathForce(z, b);
                }
            }
        });

        a.outbound.forEach(l => {
            const z = this.vertices[l];

            if (!z.dominates(a)) {
                if (this.transitiveFront.hasEdge(a, z)) {
                    if (this.transitiveFront === this) {
                        this.transitiveFront = new ReflexiveDiGraph(`tf(${this.label})`);
                        this.transitiveFront.copyFrom(this);
                    }

                    this.transitiveFront.removeEdgeForce(a, z);
                    this.transitiveFront.removePathForce(a, z);
                }
            }
        });
    }

    updateTransitiveClosureWithPath(a: Vertex, b: Vertex) {
        b.inboundPath.forEach(l => {
            const z = this.vertices[l];

            if (!this.transitiveClosure.hasEdge(z, b)) {
                if (this.transitiveClosure === this) {
                    this.transitiveClosure = new ReflexiveDiGraph(`cl(${this.label})`);
                    this.transitiveClosure.copyFrom(this);
                }

                // XXX: correct this
                this.transitiveClosure.addEdgeForce(z, b);
                this.transitiveClosure.addPathForce(z, b);
            }
        });

        a.outboundPath.forEach(l => {
            const z = this.vertices[l];

            if (!this.transitiveClosure.hasEdge(a, z)) {
                if (this.transitiveClosure === this) {
                    this.transitiveClosure = new ReflexiveDiGraph(`cl(${this.label})`);
                    this.transitiveClosure.copyFrom(this);
                }

                this.transitiveClosure.addEdgeForce(z, b);
                this.transitiveClosure.addPathForce(z, b);
            }
        });
    }

    addEdgeForce(ap: Vertex, bp: Vertex) {
        if (this.hasEdge(ap, bp)) return;
        this.addEdgeIntoVertexLists(ap, bp);
    }

    addPathForce(ap: Vertex, bp: Vertex) {
        if (this.hasPath(ap, bp)) return;
        this.addPathIntoVertexLists(ap, bp);
    }

    removeEdgeForce(ap: Vertex, bp: Vertex) {
        if (!this.hasEdge(ap, bp)) return;
        this.removeEdgeFromVertexLists(ap, bp);
    }

    removePathForce(ap: Vertex, bp: Vertex) {
        if (!this.hasPath(ap, bp)) return;
        this.removePathFromVertexLists(ap, bp);
    }

    addEdgeIntoVertexLists(ap: Vertex, bp: Vertex) {
        this.vertices[ap.label].outbound.add(bp.label);
        this.vertices[bp.label].inbound.add(ap.label);
    }

    addPathIntoVertexLists(ap: Vertex, bp: Vertex) {
        this.vertices[ap.label].outboundPath.add(bp.label);
        this.vertices[bp.label].inboundPath.add(ap.label);
    }

    removeEdgeFromVertexLists(ap: Vertex, bp: Vertex) {
        this.vertices[ap.label].outbound.delete(bp.label);
        this.vertices[bp.label].inbound.delete(ap.label);
    }

    removePathFromVertexLists(ap: Vertex, bp: Vertex) {
        this.vertices[ap.label].outbound.delete(bp.label);
        this.vertices[bp.label].inbound.delete(ap.label);
    }

    copyInsertIntoVertexList(vertex: Vertex): Vertex {
        const { label } = vertex;
        const newVertex = new Vertex(label);
        this.vertices[label] = newVertex;

        return newVertex;
    }
}

export default ReflexiveDiGraph;
