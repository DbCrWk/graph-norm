// @flow
import { raw, debug as debugGn } from '../../util/logger';
import liftingReducer from '../../func/liftingReducer';

import type { Schema as ScaffoldSchema } from '../../../schema/scaffold/1.0.0.type';

const debug = debugGn('Workflow > Generate');

function generate(
    {
        strategy, numVertex, probEdge, length,
    }: {
        strategy: 'new' | 'constant',
        numVertex: number,
        probEdge: number,
        length: number,
    },
): ScaffoldSchema {
    debug('Starting generation', {
        strategy,
        numVertex,
        probEdge,
        length,
    });
    const shouldMakeNew = strategy === 'new';

    const label = 'autogen';
    const version = '1.0.0';
    debug('Set scaffold version and label', {
        label,
        version,
    });

    debug('Creating vertices', { start: 1, end: numVertex });
    const vertices: Array<string | number> = Array.from(
        { length: numVertex }, (x, i) => (i + 1).toString(),
    );
    debug('Vertices created');

    debug('Global edge set left empty');
    const edges: Array<Array<string | number>> = [];

    const generateEdgeSet = (): Array<Array<string | number>> => {
        const possibleEdges: Array<Array<string | number>> = vertices.map(
            u => vertices.map(v => [u, v]),
        ).reduce(liftingReducer, []);
        return possibleEdges.filter(() => Math.random() < probEdge);
    };

    debug('Creating base graph');
    const base = {
        label: '0',
        edges: generateEdgeSet(),
    };
    debug('Base graph created');

    debug('Creating graph list', { numberOfGraphs: shouldMakeNew ? length : 1 });
    const graphList = shouldMakeNew
        ? Array.from(
            { length }, (x, i) => {
                debug('Graph entry created', { index: i });
                return ({ label: (i + 1).toString(), edges: generateEdgeSet() });
            },
        )
        : [{ label: '1', edges: base.edges }];
    const graphs = {};
    graphList.forEach(g => {
        graphs[g.label] = g;
    });
    debug('Graph list created');

    debug('Creating graph sequence');
    const sequence = shouldMakeNew
        ? graphList.map(g => g.label)
        : (new Array(length)).fill('1');
    debug('Graph sequence created');

    const $schema = 'https://raw.githubusercontent.com/DbCrWk/graph-norm/development/schema/scaffold/1.0.0.json';
    debug('Assembling scaffold', {
        $schema,
        label,
        version,
    });
    const scaffold: ScaffoldSchema = {
        $schema,
        label,
        version,
        vertices,
        edges,
        graphs,
        sequence,
    };

    debug('Printing scaffold');
    raw(JSON.stringify(scaffold, null, 4));

    return scaffold;
}

export default generate;
