#!/usr/bin/env node
// @flow
import yargs from 'yargs';

import parse from './workflow/parse';
import generate from './workflow/generate';
import render from './workflow/render';
import experiment from './workflow/experiment';
import { raw, debug as debugGn } from '../util/logger';

const namespace = 'CLI';
const debug = debugGn(namespace);

const workflowBind = wf => async (...args) => {
    debug('Starting workflow...', { args });
    const ret = await wf(...args);
    debug('Workflow complete; display output');
    raw(ret);
    debug('Workflow display complete');
};

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
            workflowBind(parse),
        )
        .command(
            'render [args]',
            'Output a pretty-print from a parse tree file',
            builder => {
                builder
                    .boolean('b')
                    .alias('b', 'pretty')
                    .describe('b', 'If set, output will be pretty-printed')
                    .option('f', {
                        alias: 'parse-tree-file',
                        demandOption: false,
                        type: 'string',
                        describe: 'If set, the parse tree file to read',
                    })
                    .option('s', {
                        alias: 'style',
                        demandOption: false,
                        describe: 'The style in which to render; either terminal or d3',
                        default: 'terminal',
                        choices: ['terminal', 'd3'],
                    });
            },
            workflowBind(render),
        )
        .command(
            'generate [args]',
            'Generate a scaffold file for a sample experiment',
            builder => {
                builder
                    .boolean('b')
                    .alias('b', 'pretty')
                    .describe('b', 'If set, output will be pretty-printed')
                    .boolean('u')
                    .alias('u', 'subscript')
                    .describe('u', 'If set, graph indices will be labelled with unicode subscripts instead of numbers')
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
                        describe: 'The sequence generation mode; new -> each graph is different; constant -> each graph is the same; pathological -> an LR bipartite graph with quadratic depth',
                        choices: ['new', 'constant', 'pathological'],
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
            workflowBind(generate),
        )
        .command(
            'experiment [args]',
            'Run several experiments of sweeping through fill probabilities',
            builder => {
                builder
                    .boolean('b')
                    .alias('b', 'pretty')
                    .describe('b', 'If set, output will be pretty-printed')
                    .boolean('u')
                    .alias('u', 'subscript')
                    .describe('b', 'If set, graph indices will be labelled with unicode subscripts instead of numbers')
                    .option('n', {
                        alias: 'num-vertex',
                        demandOption: true,
                        default: 100,
                        describe: 'The number of vertices in the sequence',
                        type: 'number',
                    })
                    .option('l', {
                        alias: 'length',
                        demandOption: true,
                        default: 100,
                        describe: 'The length of the sequence',
                        type: 'number',
                    })
                    .option('e', {
                        alias: 'sweep-segment',
                        demandOption: true,
                        default: 10,
                        describe: 'The number of balanced sub-intervals [0,1] should be broken into',
                        type: 'number',
                    })
                    .option('r', {
                        alias: 'sweep-resolution',
                        demandOption: true,
                        default: 3,
                        describe: 'The number of balanced samples per sub interval',
                        type: 'number',
                    })
                    .option('c', {
                        alias: 'scale',
                        demandOption: true,
                        default: 'log',
                        describe: 'The scale on which samples should be balanced: linear scale or log scale',
                        choices: ['linear', 'log'],
                    })
                    .option('s', {
                        alias: 'strategy',
                        demandOption: true,
                        describe: 'The sequence generation mode; new -> each graph is different; constant -> each graph is the same',
                        choices: ['new', 'constant'],
                    })
                    .option('f', {
                        alias: 'result-dir',
                        demandOption: true,
                        type: 'string',
                        describe: 'The location where experiments should be stored',
                    });
            },
            workflowBind(experiment),
        )
        .completion()
        .demandCommand()
        .strict()
        .version()
        .help()
        .argv;
}

grano();
