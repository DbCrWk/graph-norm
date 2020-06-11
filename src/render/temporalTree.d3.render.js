// @flow
import type { NodeGeneral } from '../../schema/temporal.tree/1.0.0.type';

type D3Node = {
    name: string,
    children?: Array<D3Node>,
};

function temporalTreeD3Render(p: NodeGeneral): D3Node {
    const name = p.label;
    if (p.category === 'graph') return { name };
    if (p.category === 'sequence') {
        if (p.children && p.children.length > 0) {
            return { name, children: p.children.map(temporalTreeD3Render) };
        }
        return { name };
    }

    if (p.children && p.children.length > 0) {
        return { name, children: p.children.map(temporalTreeD3Render) };
    }
    return { name };
}

export default temporalTreeD3Render;
