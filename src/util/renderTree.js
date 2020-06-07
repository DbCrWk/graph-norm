// @flow
import ParseNode from '../object/ParseNode';
import ReflexiveDiGraph from '../object/ReflexiveDiGraph';

function formatEntry(p: ParseNode): string {
    if (p.isSpecial) return '';

    const { entry } = p;

    if (entry instanceof ReflexiveDiGraph) {
        return entry.label;
    }

    const initialMarker = entry.isTransitive() ? 'T' : 'N';
    const { length } = entry.sequence;
    const first = entry.sequence[0].label;
    const last = entry.sequence[length - 1].label;

    return `${initialMarker} [${length}] : (${first} ... ${last})`;
}

function renderTree(
    p: ParseNode,
    { depth, pathMarks }: { depth: number, pathMarks: Array<boolean> } =
    { depth: 0, pathMarks: [] },
) {
    const { isSpecial } = p;

    const marker = isSpecial ? '*' : '■';
    const continuationMarker = p.children.length === 0 ? ' ' : '│';
    const renderPathMark = (pathMark: boolean): string => (pathMark ? '    ' : ' │  ');
    const renderLastMark = (pathMark: boolean): string => (pathMark ? ' └──' : ' ├──');

    const pathMarkAsStringRaw = pathMarks.map(renderPathMark);
    const pathMarksAsStringBeforeMark = [...pathMarkAsStringRaw];
    const n = pathMarkAsStringRaw.length;
    if (n > 0) {
        pathMarksAsStringBeforeMark[n - 1] = renderLastMark(pathMarks[n - 1]);
    }
    const pathMarksCombined = pathMarkAsStringRaw.join('');
    const pathMarksCombinedBeforeMark = pathMarksAsStringBeforeMark.join('');

    const rep = formatEntry(p);

    // eslint-disable-next-line no-console
    console.log(pathMarksCombinedBeforeMark, marker, rep);
    // eslint-disable-next-line no-console
    console.log(pathMarksCombined, continuationMarker);

    const lastIndex = p.children.length - 1;
    const boundRenderTree = (t: ParseNode, i: number) => {
        const last = i === lastIndex;
        renderTree(t, { depth: depth + 1, pathMarks: [...pathMarks, last] });
    };
    p.children.forEach(boundRenderTree);
}

export default renderTree;
