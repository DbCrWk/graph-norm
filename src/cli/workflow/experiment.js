// @flow
import fs from 'fs';
import path from 'path';
import util from 'util';
import {
    json, debug as debugGn, error as errorGn, cli,
} from '../../util/logger';
import generate from './generate';
import parse from './parse';
import render from './render';

const namespace = 'Workflow > Experiment';
const debug = debugGn(namespace);
const error = errorGn(namespace);

const fsAccessP = util.promisify(fs.access);
const fsWriteP = util.promisify(fs.writeFile);

async function experiment(
    {
        numVertex, length,
        sweepSegment, sweepResolution,
        scale, strategy, resultDir,
        subscript, pretty,
    }: {
        numVertex: number,
        length: number,
        sweepSegment: number,
        sweepResolution: number,
        strategy: 'new' | 'constant' | 'pathological',
        scale: 'linear' | 'log',
        resultDir: string,
        pretty?: boolean,
        subscript?: boolean,
    },
): Promise<string> {
    debug('Starting experiment', {
        numVertex,
        length,
        sweepSegment,
        sweepResolution,
        scale,
        strategy,
    });

    debug('Result storage requested', {
        resultDir,
    });

    debug('Nicety settings', {
        subscript,
        pretty,
    });

    debug('Checking result dir settings');
    try {
        await fsAccessP(resultDir, fs.constants.W_OK);
    } catch (e) {
        cli.error(e);
        throw error('Result dir cannot be accessed', { resultDir });
    }
    debug('Result dir settings OK');

    debug('Creating probability range');
    debug('Checking sweep parameters');
    if (sweepSegment < 1) {
        throw error('Sweep segment must be greater than 1', { sweepSegment });
    }
    if (sweepResolution < 1) {
        throw error('Sweep resolution must be greater than 1', { sweepResolution });
    }
    debug('Sweep parameters OK');

    debug('Creating probability values');
    const entryCreateFn = scale === 'linear'
        ? (x: number, i: number) => (
            ((sweepSegment * sweepResolution) - i) / (sweepSegment * sweepResolution)
        )
        : (x: number, i: number) => {
            if (i === 0) return 1;
            return (1 / sweepSegment) ** (i / sweepResolution);
        };

    const numOfExperiments = sweepSegment * sweepResolution + 1;
    debug('Number of experiments set', { numOfExperiments });

    debug('Creating probability values');
    const probabilityValues = new Array(numOfExperiments)
        .fill(0)
        .map(entryCreateFn)
        .filter(x => x !== 0 && x !== 1);
    debug('Probability values set', { probabilityValues });

    const run = async (p: number) => {
        debug('Starting experiment', { p });
        const fileBase = `p-${p}`;
        const scaffoldFileBase = `${fileBase}.scaffold.json`;
        const treeFileBase = `${fileBase}.parse-tree.json`;
        const outFileBase = `${fileBase}.d3.json`;

        const scaffoldFilePath = path.join(resultDir, scaffoldFileBase);
        const treeFilePath = path.join(resultDir, treeFileBase);
        const outFilePath = path.join(resultDir, outFileBase);

        debug('File locations', { scaffoldFilePath, treeFilePath, outFilePath });

        const scaffold = await generate({
            length, numVertex, probEdge: p, strategy, subscript, pretty: false,
        });
        await fsWriteP(scaffoldFilePath, scaffold);
        const tree = await parse({
            scaffoldFile: scaffoldFilePath, pretty: false,
        });
        await fsWriteP(treeFilePath, tree);
        const out = render({ pretty: false, style: 'd3', parseTreeFile: treeFilePath });
        fsWriteP(outFilePath, await out);

        return out;
    };

    const results = await Promise.allSettled(probabilityValues.map(run));
    return json({ pretty })({ results });
}

export default experiment;
