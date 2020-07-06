// @flow
import type { Root, NodeGeneral } from '../../schema/topological.tree/1.0.0.type';

type D3Node = {
    name: string,
    children?: Array<D3Node>,
};

function topologicalTreeD3Render(p: NodeGeneral | Root): D3Node {
    const name = p.label;
    if (p.category === 'root') {
        if (p.children && p.children.length > 0) {
            return { name, children: p.children.map(topologicalTreeD3Render) };
        }
        return { name };
    }

    if (p.category === 'sequence') {
        if (p.children && p.children.length > 0) {
            return { name, children: p.children.map(topologicalTreeD3Render) };
        }
        return { name };
    }

    if (p.children && p.children.length > 0) {
        return { name, children: p.children.map(topologicalTreeD3Render) };
    }
    return { name };
}

export default topologicalTreeD3Render;
