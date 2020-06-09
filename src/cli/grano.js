#!/usr/bin/env node
// @flow
import fs from 'fs';
import yargs from 'yargs';

import { cli } from '../util/logger';
import parse from './workflow/parse';
import generate from './workflow/generate';

function grano() {
    // NOTE: this is just how you have to use yargs
    // eslint-disable-next-line no-unused-expressions
    yargs
        .scriptName('grano')
        .usage('$0 <cmd> [args]')
        .command(
            'parse <scaffold>',
            'Output a parse tree for a scaffold file',
            builder => {
                builder
                    .positional('scaffold', {
                        type: 'string',
                        describe: 'the scaffold file',
                    })
                    .coerce('scaffold', arg => JSON.parse(fs.readFileSync(arg).toString()))
                    .fail((msg, e) => {
                        cli.error(e);
                        cli.error('Scaffold file is not valid (either not found or not valid JSON)');
                        cli.error(msg);
                        process.exit(1);
                    });
            },
            parse,
        )
        .command(
            'generate [args]',
            'Generate a scaffold file for a sample experiment',
            builder => {
                builder
                    .option('n', {
                        alias: 'num-vertex',
                        demandOption: true,
                        default: 100,
                        describe: 'The number of vertices in the sequence',
                        type: 'number',
                    })
                    .option('s', {
                        alias: 'strategy',
                        demandOption: true,
                        describe: 'The sequence generation mode; new -> each graph is different; constant -> each graph is the same',
                        choices: ['new', 'constant'],
                    })
                    .option('l', {
                        alias: 'length',
                        demandOption: true,
                        default: 100,
                        describe: 'The length of the sequence',
                        type: 'number',
                    })
                    .option('p', {
                        alias: 'prob-edge',
                        demandOption: true,
                        default: 0.5,
                        describe: 'The probability of an edge being included',
                        type: 'number',
                    });
            },
            generate,
        )
        .demandCommand()
        .strict()
        .version()
        .help()
        .argv;
}

grano();
