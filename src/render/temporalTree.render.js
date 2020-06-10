// @flow
import type { NodeGeneral } from '../../schema/temporal.tree/1.0.0.type';
import liftingReducer from '../func/liftingReducer';

const renderPathMark = (pathMark: boolean): string => (pathMark ? '    ' : ' │  ');
const renderLastMark = (pathMark: boolean): string => (pathMark ? ' └──' : ' ├──');

function temporalTreeRender(
    p: NodeGeneral,
    { depth, pathMarks }: { depth: number, pathMarks: Array<boolean> } =
    { depth: 0, pathMarks: [] },
): Array<string> {
    const { category, children, label } = { children: [], ...p };

    const mainMark = category === 'special' ? '*' : '■';
    const continuationMark = children.length > 0 ? '│' : ' ';

    const pathMarkAsStringRaw = pathMarks.map(renderPathMark);
    const pathMarksAsStringBeforeMark = [...pathMarkAsStringRaw];
    const n = pathMarkAsStringRaw.length;
    if (n > 0) {
        pathMarksAsStringBeforeMark[n - 1] = renderLastMark(pathMarks[n - 1]);
    }
    const pathMarksCombined = pathMarkAsStringRaw.join('');
    const pathMarksCombinedBeforeMark = pathMarksAsStringBeforeMark.join('');

    const lastIndex = children.length - 1;
    const boundRenderTree = (t: NodeGeneral, i: number): Array<string> => temporalTreeRender(
        t,
        { depth: depth + 1, pathMarks: [...pathMarks, i === lastIndex] },
    );

    // $FlowFixMe
    const childrenRender = children.map(boundRenderTree).reduce(liftingReducer, []);

    return [
        `${pathMarksCombinedBeforeMark} ${mainMark} ${label}`,
        `${pathMarksCombined} ${continuationMark}`,
        ...childrenRender,
    ];
}

export default temporalTreeRender;
