// @flow
import { json, debug as debugGn } from '../../util/logger';
import liftingReducer from '../../func/liftingReducer';

import type { Schema as ScaffoldSchema } from '../../../schema/scaffold/1.0.0.type';

const namespace = 'Workflow > Generate';
const debug = debugGn(namespace);

const CharCodeBaseForNumber = '0'.charCodeAt(0) || 48;
const CharCodeBaseForSubscript = '₀'.charCodeAt(0) || 8320;

const convertNumCharToSub = (char: string) => (
    char === ','
        ? ','
        : String.fromCharCode(char.charCodeAt(0) - CharCodeBaseForNumber + CharCodeBaseForSubscript)
);
const convertNumStringToSub = (str: string) => [...str].map(convertNumCharToSub).join('');

async function generate(
    {
        strategy, numVertex, probEdge, length,
        pretty, subscript,
    }: {
        strategy: 'new' | 'constant' | 'pathological',
        numVertex: number,
        probEdge: number,
        length: number,
        pretty?: boolean,
        subscript?: boolean,
    },
): Promise<string> {
    debug('Starting generation', {
        strategy,
        numVertex,
        probEdge,
        length,
    });
    const shouldMakeNew = strategy === 'new';

    const label = 'autogenerated';
    const version = '1.0.0';
    debug('Set scaffold version and label', {
        label,
        version,
    });

    debug('Creating vertices', { start: 1, end: numVertex });
    const vertices = strategy === 'pathological'
        ? Array.from({ length: numVertex * 2 }, (x, i) => (i + 1))
        : Array.from({ length: numVertex }, (x, i) => (i + 1).toString());
    debug('Vertices created');

    debug('Global edge set left empty');
    const edges: Array<Array<string | number>> = [];

    if (strategy === 'pathological') {
        debug('Pathological case set; overriding length', { length: numVertex ** 2, numVertex: numVertex * 2 });
        const graphs = {};
        vertices.forEach(u => {
            if (typeof u !== 'number') return;
            if (u > numVertex) return;
            vertices.forEach(v => {
                if (typeof v !== 'number') return;
                if (v <= numVertex) return;
                const rawIndexAsString = `${u},${v}`;
                const indexCastSubscript = subscript
                    ? convertNumStringToSub(rawIndexAsString)
                    : rawIndexAsString;
                const l = `g${indexCastSubscript}`;
                const edgeSetForG = [[u, u], [v, v], [u, v]];

                graphs[l] = { label: l, edges: edgeSetForG };
            });
        });

        debug('Creating graph sequence');
        const sequence = Object.keys(graphs);
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
        debug('Scaffold assembled');

        return json({ pretty })(scaffold);
    }

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
    const constantGLabel = subscript ? 'g₁' : 'g1';
    const graphList = shouldMakeNew
        ? Array.from(
            { length }, (x, i) => {
                debug('Graph entry created', { index: i });
                const rawIndexAsString = (i + 1).toString();
                const indexCastSubscript = subscript
                    ? convertNumStringToSub(rawIndexAsString)
                    : rawIndexAsString;
                return ({ label: `g${indexCastSubscript}`, edges: generateEdgeSet() });
            },
        )
        : [{ label: constantGLabel, edges: base.edges }];
    const graphs = {};
    graphList.forEach(g => {
        graphs[g.label] = g;
    });
    debug('Graph list created');

    debug('Creating graph sequence');
    const sequence = shouldMakeNew
        ? graphList.map(g => g.label)
        : (new Array(length)).fill(constantGLabel);
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

    debug('Scaffold assembled');

    return json({ pretty })(scaffold);
}

export default generate;
