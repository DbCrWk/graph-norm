// @flow
import type { Schema as ScaffoldSchema } from '../../schema/scaffold/1.0.0.type';
import { debugLib as debugGn } from '../util/logger';
import Vertex from '../object/Vertex';
import ReflexiveDiGraph from '../object/ReflexiveDiGraph';
import GraphSequence from '../object/GraphSequence';
import type { Label } from '../object/Label';
import convertEdgeListToEdgeMap from '../util/convertEdgeListToEdgeMap';
import mergeEdgeMap from '../util/mergeEdgeMap';

const namespace = 'func > getGraphSequenceFromScaffold';
const debug = debugGn(namespace);

function getGraphSequenceFromScaffold(
    scaffold: ScaffoldSchema,
): { sequence: GraphSequence, vertices: Array<number | string> } {
    // What we need to:
    // First pass: construct master vertex set
    // Second pass: we already have master edge set
    // Third pass: construct master graph set
    // Fourth pass: construct sequence
    const {
        vertices, edges, graphs, sequence,
    } = scaffold;

    // First pass
    debug('()', 'First Pass: Starting');
    const allVertices = new Set(vertices);
    debug('()', 'Processed `vertices` key', { size: allVertices.size });
    if (edges) {
        debug('()', '`edges` key detected', { length: edges.length });
        edges.forEach(([h, t]) => {
            allVertices.add(h);
            allVertices.add(t);
        });
        debug('()', '`edges` key processed');
    }
    if (graphs) {
        const graphKeys = Object.keys(graphs);
        debug('()', '`graphs` key detected', { length: graphKeys.length });
        graphKeys.forEach(k => {
            debug('()', 'Processing graph', { label: k });
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
        debug('()', '`graphs` key processed');
    }
    debug('()', 'Starting `sequence` key processing');
    sequence.forEach(g => {
        if (typeof g === 'string') {
            debug('()', 'Skipping graph', { label: g });
            return;
        }
        debug('()', 'Processing graph', { label: g.label });

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
    debug('()', '`sequence` key processed');
    debug('()', 'First Pass: Done');

    // Second pass
    debug('()', 'Second Pass: Starting');
    const allEdges: Array<Array<Label>> = edges
        ? edges.map(([a, c]) => [a.toString(), c.toString()])
        : [];
    const allEdgeMap: { [Label]: Array<Label> } = convertEdgeListToEdgeMap(allEdges);
    debug('()', 'Processed `edges` key', { length: allEdges.length });
    debug('()', 'Second Pass: Done');

    // Third pass
    debug('()', 'Third Pass: Starting');
    const allGraphs = {};
    if (graphs) {
        const graphKeys = Object.keys(graphs);
        debug('()', '`graphs` key detected', { length: graphKeys.length });
        graphKeys.forEach((k: Label) => {
            debug('()', 'Processing graph', { label: k });
            const g = graphs[k];
            const { label } = g;
            const eForG: Array<Array<Label>> = g.edges
                ? g.edges.map(([a, c]) => [a.toString(), c.toString()])
                : [];
            const trueLabel = label || k;

            const rg = new ReflexiveDiGraph(trueLabel);

            [...allVertices].forEach(v => rg.addVertex(new Vertex(v)));
            const edgeMapForG: { [Label]: Array<Label> } = convertEdgeListToEdgeMap(eForG);

            const mergedEdgeMap: { [Label]: Array<Label> } = edges
                ? mergeEdgeMap(
                    edgeMapForG,
                    allEdgeMap,
                )
                : edgeMapForG;
            rg.addEdgeSetByMap(mergedEdgeMap);
            allGraphs[trueLabel] = rg;
        });
        debug('()', '`graphs` key processed');
    }
    debug('()', 'Starting `sequence` key processing');
    sequence.forEach(g => {
        if (typeof g === 'string') {
            debug('()', 'Skipping graph', { label: g });
            return;
        }
        const { label } = g;
        debug('()', 'Processing graph', { label });
        const eForG: Array<Array<Label>> = g.edges
            ? g.edges.map(([a, c]) => [a.toString(), c.toString()])
            : [];

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
    debug('()', '`sequence` key processed');
    debug('()', 'Third Pass: Done');

    // Final pass
    debug('()', 'Final Pass: Starting');
    const trueSequence = new GraphSequence();
    debug('()', 'Starting `sequence` key processing');
    sequence.forEach(g => {
        const label = (typeof g === 'string') ? g : g.label;
        debug('()', 'Pushing graph', { label });
        trueSequence.push(allGraphs[label]);
    });
    debug('()', 'Final Pass: Done');

    return { sequence: trueSequence, vertices: [...allVertices] };
}

export default getGraphSequenceFromScaffold;
