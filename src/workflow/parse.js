// @flow
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import betterAjvErrors from 'better-ajv-errors';
// import chalk from 'chalk';
import { Spinner } from 'clui';

import Vertex from '../object/Vertex';
import ReflexiveDiGraph from '../object/ReflexiveDiGraph';
import GraphSequence from '../object/GraphSequence';
import ParseNode from '../object/ParseNode';
import renderTree from '../util/renderTree';

const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    async: false,
    jsonPointers: true,
});

// TODO: we should eventually actually detect the schema
const schemaPath = path.join(__dirname, '..', '..', 'schema', 'scaffold', '1.0.0.json');
const schema = JSON.parse(fs.readFileSync(schemaPath).toString());
const validate = ajv.compile(schema);

function parseScaffold({ scaffold }: { scaffold: {} }): boolean {
    /* eslint-disable no-console */
    const status = new Spinner('Parsing');
    status.start();

    // $FlowFixMe
    const valid: boolean = validate(scaffold);
    if (!valid) {
        console.error('not valid!');
        const output = betterAjvErrors(schema, scaffold, validate.errors, { indent: 2 });
        console.log(output);
        status.stop();
        return false;
    }

    console.log('valid!');

    // What we need to:
    // First pass: construct master vertex set
    // Second pass: we already have master edge set
    // Third pass: construct master graph set
    // Fourth pass: construct sequence

    const {
        // $FlowFixMe
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
        const { label } = g;
        trueSequence.push(allGraphs[label]);
    });


    const p = new ParseNode(trueSequence);
    renderTree(p);

    status.stop();
    return valid;
}

export default parseScaffold;
