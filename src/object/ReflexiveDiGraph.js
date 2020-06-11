// @flow
import Vertex from './Vertex';
import doesSet from '../func/doesSet';
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

    hasVertexByLabel(vl: Label): boolean {
        return (vl in this.vertices);
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

    addVertexByLabel(vl: Label): Vertex {
        if (this.hasVertexByLabel(vl)) return this.vertices[vl];

        const vertex = this.insertLabelIntoVertexList(vl);
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
            && (this.vertices[ap.label].outbound.has(bp.label))
            && (this.vertices[bp.label].inbound.has(ap.label))
        );
    }

    addEdge(ap: Vertex, bp: Vertex) {
        const a = this.addVertex(ap);
        const b = this.addVertex(bp);

        this.addEdgeForce(a, b);
        this.addPath(a, b);

        this.updateTransitiveFrontWithEdge(a, b);
    }

    addEdgeSetByMap(
        edgeSetMap: { [Label]: Array<Label> },
        { dangerouslyAssumeTfIsVerified }: { dangerouslyAssumeTfIsVerified: boolean }
        = { dangerouslyAssumeTfIsVerified: false },
    ) {
        const fromVertices = Object.keys(edgeSetMap);
        fromVertices.forEach(ul => {
            const u = this.addVertexByLabel(ul);
            const toVertices: Array<Label> = edgeSetMap[ul];
            toVertices.forEach(vl => {
                const v = this.addVertexByLabel(vl);
                this.addEdgeForce(u, v);
            });
        });
        this.bulkUpdatePaths();

        if (
            !dangerouslyAssumeTfIsVerified
            || this !== this.transitiveFront
        ) this.bulkUpdateTransitiveFront();
        this.bulkUpdateTransitiveClosure();
    }

    hasPath(ap: Vertex, bp: Vertex) {
        return (
            this.hasVertex(ap)
            && this.hasVertex(bp)
            && (this.vertices[ap.label].outboundPath.has(bp.label))
            && (this.vertices[bp.label].inboundPath.has(ap.label))
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
        const isSameAsTf = this.isSameAs(this.transitiveFront);
        if (isSameAsTf) this.transitiveFront = this;
        return isSameAsTf;
    }

    isClosed(): boolean {
        const isSameAsTc = this.isSameAs(this.transitiveClosure);
        if (isSameAsTc) this.transitiveClosure = this;
        return isSameAsTc;
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

    bulkUpdateTransitiveFront() {
        const edgeSetMap = {};
        let isTfDifferentFromThis = false;

        const vertexKeys: Array<Label> = Object.keys(this.vertices);
        vertexKeys.forEach(uk => {
            const outbound = [...this.vertices[uk].outbound];
            // Exploit the fact that an edge in the transitive front has to also
            // be an edge in the graph
            const outboundInTf: Array<Label> = outbound.filter(
                vk => this.vertices[vk].dominates(this.vertices[uk]),
            );

            if (
                !isTfDifferentFromThis
                || outbound.length !== outboundInTf.length
            ) isTfDifferentFromThis = true;

            edgeSetMap[uk] = outboundInTf;
        });

        if (isTfDifferentFromThis) {
            if (this === this.transitiveFront) {
                this.transitiveFront = new ReflexiveDiGraph(`tf(${this.label})`);
            }
            this.transitiveFront.addEdgeSetByMap(
                edgeSetMap,
                { dangerouslyAssumeTfIsVerified: true },
            );
        }
    }

    updateTransitiveClosureWithPath(a: Vertex, b: Vertex) {
        b.inboundPath.forEach(l => {
            const z = this.vertices[l];

            if (!this.transitiveClosure.hasEdge(z, b)) {
                if (this.transitiveClosure === this) {
                    this.transitiveClosure = new ReflexiveDiGraph(`cl(${this.label})`);
                    this.transitiveClosure.copyFrom(this);
                }

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

                this.transitiveClosure.addEdgeForce(a, z);
                this.transitiveClosure.addPathForce(a, z);
            }
        });
    }

    bulkUpdatePaths() {
        const vertexLabels = [...Object.keys(this.vertices)];
        const uncheckedVertexSet: Set<Label> = new Set(vertexLabels);

        const depthFirstHelper = (vl: Label): {
            outboundPath: Set<Label>,
            inboundPath: Set<Label>,
        } => {
            const hasLabelAlreadyBeenChecked = !uncheckedVertexSet.has(vl);
            if (hasLabelAlreadyBeenChecked) {
                const { inboundPath, outboundPath } = this.vertices[vl];
                return { inboundPath, outboundPath };
            }

            uncheckedVertexSet.delete(vl);

            const outboundLabels = [...this.vertices[vl].outbound];
            const inboundLabels = [...this.vertices[vl].inbound];
            const outboundPath = new Set();
            const inboundPath = new Set();

            const outboundPaths = outboundLabels.map(l => depthFirstHelper(l).outboundPath);
            const inboundPaths = inboundLabels.map(l => depthFirstHelper(l).inboundPath);


            outboundPaths.forEach(s => {
                s.forEach(l => outboundPath.add(l));
            });
            inboundPaths.forEach(s => {
                s.forEach(l => inboundPath.add(l));
            });

            this.vertices[vl].outboundPath = outboundPath;
            this.vertices[vl].inboundPath = outboundPath;

            return { outboundPath, inboundPath };
        };

        vertexLabels.forEach(depthFirstHelper);
    }

    bulkUpdateTransitiveClosure() {
        const vertexLabels = [...Object.keys(this.vertices)];

        vertexLabels.forEach(l => {
            if (this.transitiveClosure === this) {
                // We only need to check the outbound side because the inbound
                // paths are a "convenience" in the sense that every inbound
                // path is represented by a corresponding outbound path
                const doesTcNeedUpdate = !doesSet(
                    this.vertices[l].outboundPath,
                ).equal(this.vertices[l].outbound);
                if (doesTcNeedUpdate) {
                    this.transitiveClosure = new ReflexiveDiGraph(`cl(${this.label})`);
                    this.transitiveClosure.copyFrom(this);
                }
            }

            const isStillEqual = this.transitiveClosure === this;
            if (!isStillEqual) {
                this.transitiveClosure.vertices[l].outbound = new Set(
                    this.vertices[l].outboundPath,
                );
                this.transitiveClosure.vertices[l].inbound = new Set(
                    this.vertices[l].inboundPath,
                );
                this.transitiveClosure.vertices[l].outboundPath = this
                    .transitiveClosure.vertices[l].outbound;
                this.transitiveClosure.vertices[l].inboundPath = this
                    .transitiveClosure.vertices[l].inbound;
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

    insertLabelIntoVertexList(vertexLabel: Label): Vertex {
        const newVertex = new Vertex(vertexLabel);
        this.vertices[vertexLabel] = newVertex;

        return newVertex;
    }
}

export default ReflexiveDiGraph;
