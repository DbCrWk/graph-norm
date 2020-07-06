// @flow
import util from 'util';
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import betterAjvErrors from 'better-ajv-errors';

import {
    raw, cli, debug as debugGn, error as errorGn, json,
} from '../../util/logger';
import readStdInToString from '../../util/readStdInToString';
import temporalTreeRender from '../../render/temporalTree.render';
import topologicalTreeRender from '../../render/topologicalTree.render';
import temporalTreeD3Render from '../../render/temporalTree.d3.render';
import topologicalTreeD3Render from '../../render/topologicalTree.d3.render';

import type { Schema as ParseTreeSchema } from '../../../schema/parse.tree/1.0.0.type';

const namespace = 'Workflow > Render';
const debug = debugGn(namespace);
const error = errorGn(namespace);

const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    async: false,
    jsonPointers: true,
});

// TODO: we should eventually actually detect the schema version
const temporalTreeSchemaPath = path.join(__dirname, '..', '..', '..', 'schema', 'temporal.tree', '1.0.0.json');
const topologicalTreeSchemaPath = path.join(__dirname, '..', '..', '..', 'schema', 'topological.tree', '1.0.0.json');
const parseTreeSchemaPath = path.join(__dirname, '..', '..', '..', 'schema', 'parse.tree', '1.0.0.json');
const temporalTreeSchema = JSON.parse(fs.readFileSync(temporalTreeSchemaPath).toString());
const topologicalTreeSchema = JSON.parse(fs.readFileSync(topologicalTreeSchemaPath).toString());
const parseTreeSchema = JSON.parse(fs.readFileSync(parseTreeSchemaPath).toString());
const validate = ajv
    .addSchema(temporalTreeSchema)
    .addSchema(topologicalTreeSchema)
    .compile(parseTreeSchema);

async function render(
    { parseTreeFile, style, pretty }: { parseTreeFile?: string, style: 'terminal' | 'd3', pretty: boolean },
): Promise<string> {
    if (!parseTreeFile) {
        debug('No parse tree passed; using stdin');
        if (process.stdin.isTTY) {
            throw error('No input detected on stdin; please either pipe input or provide a parse tree file');
        }
    } else {
        debug('Parse tree file set', { parseTreeFile });
    }

    debug('Reading parse tree file');
    let parseTreeRaw;
    try {
        parseTreeRaw = parseTreeFile
            ? (await util.promisify(fs.readFile)(parseTreeFile)).toString()
            : await readStdInToString();
    } catch (e) {
        cli.error(e);
        throw error('Parse tree file could not be read');
    }
    debug('Parse tree file read');

    debug('Converting parse tree file to proper parse tree JSON object');
    let parseTree;
    try {
        parseTree = JSON.parse(parseTreeRaw);
    } catch (e) {
        cli.error(e);
        throw error('Parse tree file is not valid JSON');
    }
    debug('Parse tree file converted to proper parse tree JSON object');

    debug('Analyzing parse tree');
    // $FlowFixMe
    const valid: boolean = validate(parseTree);
    debug('Analysis of parse tree complete');

    if (!valid) {
        error('Parse tree is not valid');
        const output = betterAjvErrors(parseTreeSchema, parseTree, validate.errors, { indent: 2 });
        raw(output);
        throw error('Parse tree validation printed');
    }
    debug('Analysis of parse tree was successful');

    const validParseTree: ParseTreeSchema = parseTree;
    const {
        label, version, temporal, topological,
    } = validParseTree;
    debug('Parse tree label and version detected', {
        label,
        version,
    });

    if (style === 'd3') {
        debug('Style detected as d3');
        debug('Generating render of temporal tree', { style });
        const temporalRender = temporalTreeD3Render(temporal.root);
        const topologicalRender = topologicalTreeD3Render(topological.root);
        debug('Render generated successfully');

        return json({ pretty })({ temporal: temporalRender, topological: topologicalRender });
    }

    if (style === 'terminal') {
        debug('Style detected as terminal');
        debug('Generating render of temporal tree', { style });
        const temporalRender = temporalTreeRender(temporal.root);
        const topologicalRender = topologicalTreeRender(topological.root);
        debug('Render generated successfully');

        return ['::TEMPORAL::', ...temporalRender, '', '', '::TOPOLOGICAL::', ...topologicalRender].join('\n');
    }

    throw error('Parse style not understood (or not implemented?', { style });
}

export default render;
