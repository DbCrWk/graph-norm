// @flow
import util from 'util';
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import betterAjvErrors from 'better-ajv-errors';

import {
    json, raw, cli, debug as debugGn, error as errorGn,
} from '../../util/logger';
import readStdInToString from '../../util/readStdInToString';
import getGraphSequenceFromScaffold from '../../func/getGraphSequenceFromScaffold';
import SequenceTemporalNode from '../../object/Sequence.TemporalNode';
import RootTopologyNode from '../../object/Root.TopologyNode';
import getTemporalTreeFromNode from '../../util/getTemporalTreeFromNode';
import getTopologicalTreeFromNode from '../../util/getTopologicalTreeFromNode';

import type { Schema as ScaffoldSchema } from '../../../schema/scaffold/1.0.0.type';
import type { Schema as ParseTreeSchema } from '../../../schema/parse.tree/1.1.0.type';
import SpecialTemporalNode from '../../object/Special.TemporalNode';
import liftingReducer from '../../func/liftingReducer';
import GraphTemporalNode from '../../object/Graph.TemporalNode';

const namespace = 'Workflow > Parse';
const debug = debugGn(namespace);
const error = errorGn(namespace);

const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    async: false,
    jsonPointers: true,
});

// TODO: we should eventually actually detect the schema version
const schemaPath = path.join(__dirname, '..', '..', '..', 'schema', 'scaffold', '1.0.0.json');
const schema = JSON.parse(fs.readFileSync(schemaPath).toString());
const validate = ajv.compile(schema);

async function parse(
    { scaffoldFile, pretty }: { scaffoldFile?: string, pretty?: boolean },
): Promise<string> {
    if (!scaffoldFile) {
        debug('No scaffold passed; using stdin');
        if (process.stdin.isTTY) {
            throw error('No input detected on stdin; please either pipe input or provide a scaffold file');
        }
    } else {
        debug('Scaffold file set', { scaffoldFile });
    }

    debug('Reading scaffold file');
    let scaffoldRaw;
    try {
        scaffoldRaw = scaffoldFile
            ? (await util.promisify(fs.readFile)(scaffoldFile)).toString()
            : await readStdInToString();
    } catch (e) {
        cli.error(e);
        throw error('Scaffold file could not be read');
    }
    debug('Scaffold file read');

    debug('Converting scaffold file to proper scaffold JSON object');
    let scaffold;
    try {
        scaffold = JSON.parse(scaffoldRaw);
    } catch (e) {
        cli.error(e);
        throw error('Scaffold file is not valid JSON');
    }
    debug('Scaffold file converted to proper scaffold JSON object');

    debug('Analyzing scaffold');
    // $FlowFixMe
    const valid: boolean = validate(scaffold);
    debug('Analysis of scaffold complete');

    if (!valid) {
        error('Scaffold is not valid');
        const output = betterAjvErrors(schema, scaffold, validate.errors, { indent: 2 });
        raw(output);
        throw error('Scaffold validation printed');
    }
    debug('Analysis of scaffold was successful');

    const validScaffold: ScaffoldSchema = scaffold;
    const { label, version } = validScaffold;
    debug('Scaffold label and version detected', {
        label,
        version,
    });

    debug('Generating graph sequence from scaffold');
    const { sequence, vertices } = getGraphSequenceFromScaffold(validScaffold);
    debug('Graph sequence generated from graph sequence');

    debug('Generating parse tree from graph sequence');
    const rawGraphs = {};
    const graphs = {};
    function insertGraphs(g) {
        if (g instanceof SequenceTemporalNode) {
            const rawGraph = g.sequence.getLastCumulant();
            const graph = {
                edges: Object.keys(rawGraph.vertices)
                    .map(ul => [...rawGraph.vertices[ul].outbound].map(vl => [ul, vl]))
                    .reduce(liftingReducer, []),
            };
            rawGraphs[g.label] = rawGraph;
            graphs[g.label] = graph;
            g.children.forEach(insertGraphs);
        }

        if (g instanceof SpecialTemporalNode) {
            const rawGraph = g.annotation;
            const graph = {
                edges: Object.keys(rawGraph.vertices)
                    .map(ul => [...rawGraph.vertices[ul].outbound].map(vl => [ul, vl]))
                    .reduce(liftingReducer, []),
            };
            rawGraphs[g.label] = rawGraph;
            graphs[g.label] = graph;
            g.children.forEach(insertGraphs);
        }

        if (g instanceof GraphTemporalNode) {
            const rawGraph = g.graph;
            const graph = {
                edges: Object.keys(rawGraph.vertices)
                    .map(ul => [...rawGraph.vertices[ul].outbound].map(vl => [ul, vl]))
                    .reduce(liftingReducer, []),
            };
            rawGraphs[g.label] = rawGraph;
            graphs[g.label] = graph;
        }
    }
    const p = new SequenceTemporalNode(sequence);
    insertGraphs(p);

    const o = new RootTopologyNode(p);
    const temporal = getTemporalTreeFromNode(p);
    const topological = getTopologicalTreeFromNode(o);
    const parseTree: ParseTreeSchema = {
        label: `Autogenerated Parse Tree (${sequence.sequence[0].label} ... ${sequence.sequence[sequence.length - 1].label})`,
        $schema: 'https://raw.githubusercontent.com/DbCrWk/graph-norm/development/schema/parse.tree/1.1.0.json',
        version: '1.1.0',
        vertices,
        graphs,
        sequence: validScaffold.sequence,
        temporal,
        topological,
    };
    debug('Parse tree generated from graph sequence');

    return json({ pretty })(parseTree);
}

export default parse;
