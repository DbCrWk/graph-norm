#!/usr/bin/env node
// @flow
import yargs from 'yargs';

import parse from './workflow/parse';
import generate from './workflow/generate';
import render from './workflow/render';

function grano() {
    // NOTE: this is just how you have to use yargs
    // eslint-disable-next-line no-unused-expressions
    yargs
        .scriptName('grano')
        .usage('$0 <cmd> [args]')
        .command(
            'parse [args]',
            'Output a parse tree for a scaffold file',
            builder => {
                builder
                    .boolean('b')
                    .alias('b', 'pretty')
                    .describe('b', 'If set, output will be pretty-printed')
                    .option('f', {
                        alias: 'scaffold-file',
                        demandOption: false,
                        type: 'string',
                        describe: 'If set, the scaffold file to read',
                    });
            },
            parse,
        )
        .command(
            'render [args]',
            'Output a parse tree for a temporal tree file',
            builder => {
                builder
                    .option('f', {
                        alias: 'temporal-tree-file',
                        demandOption: false,
                        type: 'string',
                        describe: 'If set, the temporal tree file to read',
                    });
            },
            render,
        )
        .command(
            'generate [args]',
            'Generate a scaffold file for a sample experiment',
            builder => {
                builder
                    .boolean('b')
                    .alias('b', 'pretty')
                    .describe('b', 'If set, output will be pretty-printed')
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
        .completion()
        .demandCommand()
        .strict()
        .version()
        .help()
        .argv;
}

grano();
