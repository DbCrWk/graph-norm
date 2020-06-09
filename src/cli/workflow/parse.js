// @flow
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import betterAjvErrors from 'better-ajv-errors';

import { raw, cli, debug as debugGn } from '../../util/logger';
import getGraphSequenceFromScaffold from '../../func/getGraphSequenceFromScaffold';
import ParseNode from '../../object/ParseNode';
import renderTree from '../../util/renderTree';

import type { Schema as ScaffoldSchema } from '../../../schema/scaffold/1.0.0.type';

const debug = debugGn('Workflow > Parse');

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

function parse({ scaffold }: { scaffold: {} }): boolean {
    debug('Starting parse');
    // $FlowFixMe
    const valid: boolean = validate(scaffold);
    debug('Analysis of scaffold file complete');

    if (!valid) {
        cli.error('Workflow > Parse: Scaffold file is not valid');
        const output = betterAjvErrors(schema, scaffold, validate.errors, { indent: 2 });
        raw(output);
        return false;
    }
    debug('Scaffold parse was successful');

    // $FlowFixMe
    const validScaffold: ScaffoldSchema = scaffold;
    const { label, version } = validScaffold;
    debug('Scaffold label and version detected', {
        label,
        version,
    });

    debug('Generating graph sequence from scaffold');
    const sequence = getGraphSequenceFromScaffold(validScaffold);
    debug('Graph sequence generated from graph sequence');

    debug('Generating parse tree from graph sequence');
    const p = new ParseNode(sequence);
    renderTree(p);
    debug('Parse tree generated from graph sequence');

    return valid;
}

export default parse;
