// @flow
import CliqueNode from '../object/CliqueNode';
import ReflexiveDiGraph from '../object/ReflexiveDiGraph';

function formatEntry(p: CliqueNode): string {
    const { t, l } = p;
    const { cliqueMap } = t;
    if (p.t.parseNode.entry instanceof ReflexiveDiGraph) return '';
    if (!(l in cliqueMap)) return '-';
    const val = [...cliqueMap[l]];
    return `${l}: ${val.join(', ')}`;
}

function renderTree(
    p: CliqueNode,
    { depth, pathMarks }: { depth: number, pathMarks: Array<boolean> } =
    { depth: 0, pathMarks: [] },
) {
    const { isSpecial } = p.t.parseNode;

    const renderableChildren = p.children.filter(
        c => !(c.t.parseNode.entry instanceof ReflexiveDiGraph),
    );

    const marker = isSpecial ? '*' : '■';
    const continuationMarker = renderableChildren.length === 0 ? ' ' : '│';
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

    console.log(pathMarksCombinedBeforeMark, marker, rep);
    console.log(pathMarksCombined, continuationMarker);

    const lastIndex = renderableChildren.length - 1;
    const boundRenderTree = (t: CliqueNode, i: number) => {
        const last = i === lastIndex;
        renderTree(t, { depth: depth + 1, pathMarks: [...pathMarks, last] });
    };
    renderableChildren.forEach(boundRenderTree);
}

export default renderTree;
