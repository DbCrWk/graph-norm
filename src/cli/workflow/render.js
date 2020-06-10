// @flow
import util from 'util';
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import betterAjvErrors from 'better-ajv-errors';

import {
    raw, cli, debug as debugGn, error as errorGn,
} from '../../util/logger';
import readStdInToString from '../../util/readStdInToString';
import temporalTreeRender from '../../render/temporalTree.render';

import type { Schema as TemporalTreeSchema } from '../../../schema/temporal.tree/1.0.0.type';

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
const schemaPath = path.join(__dirname, '..', '..', '..', 'schema', 'temporal.tree', '1.0.0.json');
const schema = JSON.parse(fs.readFileSync(schemaPath).toString());
const validate = ajv.compile(schema);

async function render({ temporalTreeFile }: { temporalTreeFile?: string }): Promise<boolean> {
    if (!temporalTreeFile) {
        debug('No temporal tree passed; using stdin');
        if (process.stdin.isTTY) {
            throw error('No input detected on stdin; please either pipe input or provide a temporal tree file');
        }
    } else {
        debug('Temporal tree file set', { temporalTreeFile });
    }

    debug('Reading temporal tree file');
    let temporalTreeRaw;
    try {
        temporalTreeRaw = temporalTreeFile
            ? (await util.promisify(fs.readFile)(temporalTreeFile)).toString()
            : await readStdInToString();
    } catch (e) {
        cli.error(e);
        throw error('Temporal tree file could not be read');
    }
    debug('Temporal tree file read');

    debug('Converting temporal tree file to proper temporal tree JSON object');
    let temporalTree;
    try {
        temporalTree = JSON.parse(temporalTreeRaw);
    } catch (e) {
        cli.error(e);
        throw error('Temporal tree file is not valid JSON');
    }
    debug('Temporal tree file converted to proper temporal tree JSON object');

    debug('Analyzing temporal tree');
    // $FlowFixMe
    const valid: boolean = validate(temporalTree);
    debug('Analysis of temporal tree complete');

    if (!valid) {
        error('Temporal tree is not valid');
        const output = betterAjvErrors(schema, temporalTree, validate.errors, { indent: 2 });
        raw(output);
        return false;
    }
    debug('Analysis of temporal tree was successful');

    const validTemporalTree: TemporalTreeSchema = temporalTree;
    const { label, version, root } = validTemporalTree;
    debug('Temporal tree label and version detected', {
        label,
        version,
    });

    debug('Generating render of temporal tree');
    const renderRaw = temporalTreeRender(root);
    debug('Render generated successfully');

    debug('Starting display of render');
    raw(renderRaw.join('\n'));
    debug('Display complete');

    return valid;
}

export default render;
