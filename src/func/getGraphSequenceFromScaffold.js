// @flow
import type { Schema as ScaffoldSchema } from '../../schema/scaffold/1.0.0.type';
import Vertex from '../object/Vertex';
import ReflexiveDiGraph from '../object/ReflexiveDiGraph';
import GraphSequence from '../object/GraphSequence';

function getGraphSequenceFromScaffold(scaffold: ScaffoldSchema): GraphSequence {
    // What we need to:
    // First pass: construct master vertex set
    // Second pass: we already have master edge set
    // Third pass: construct master graph set
    // Fourth pass: construct sequence
    const {
        vertices, edges, graphs, sequence,
    } = scaffold;

    // First pass
    const allVertices = new Set(vertices);
    if (edges) {
        edges.forEach(([h, t]) => {
            allVertices.add(h);
            allVertices.add(t);
        });
    }
    if (graphs) {
        const graphKeys = Object.keys(graphs);
        graphKeys.forEach(k => {
            const g = graphs[k];
            const eForG = g.edges;
            const vForG = g.vertices;

            if (vForG) vForG.forEach(v => allVertices.add(v));
            if (eForG) {
                eForG.forEach(([h, t]) => {
                    allVertices.add(h);
                    allVertices.add(t);
                });
            }
        });
    }
    sequence.forEach(g => {
        if (typeof g === 'string') return;

        const eForG = g.edges;
        const vForG = g.vertices;

        if (vForG) vForG.forEach(v => allVertices.add(v));
        if (eForG) {
            eForG.forEach(([h, t]) => {
                allVertices.add(h);
                allVertices.add(t);
            });
        }
    });

    // Second pass
    const allEdges = edges || [];

    // Third pass
    const allGraphs = {};
    if (graphs) {
        const graphKeys = Object.keys(graphs);
        graphKeys.forEach(k => {
            const g = graphs[k];
            const { label } = g;
            const eForG = g.edges;
            const trueLabel = label || k;

            const rg = new ReflexiveDiGraph(trueLabel);

            [...allVertices].forEach(v => rg.addVertex(new Vertex(v)));
            [...allEdges].forEach(([h, t]) => {
                rg.addEdge(new Vertex(h), new Vertex(t));
            });

            if (eForG) {
                eForG.forEach(([h, t]) => {
                    rg.addEdge(new Vertex(h), new Vertex(t));
                });
            }

            allGraphs[trueLabel] = rg;
        });
    }
    sequence.forEach(g => {
        if (typeof g === 'string') return;
        const { label } = g;
        const eForG = g.edges;

        const rg = (label in allGraphs) ? allGraphs[label] : new ReflexiveDiGraph(label);

        [...allVertices].forEach(v => rg.addVertex(new Vertex(v)));
        [...allEdges].forEach(([h, t]) => {
            rg.addEdge(new Vertex(h), new Vertex(t));
        });

        if (eForG) {
            eForG.forEach(([h, t]) => {
                rg.addEdge(new Vertex(h), new Vertex(t));
            });
        }

        allGraphs[label] = rg;
    });

    // Final pass
    const trueSequence = new GraphSequence();
    sequence.forEach(g => {
        const label = (typeof g === 'string') ? g : g.label;
        trueSequence.push(allGraphs[label]);
    });

    return trueSequence;
}

export default getGraphSequenceFromScaffold;
