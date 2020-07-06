// @flow
import type { NodeGeneral } from '../../schema/temporal.tree/1.0.0.type';
import { debugLib as debugGn, errorLib as errorGn } from '../util/logger';

const namespace = 'Object > TemporalNode';
const debug = debugGn(namespace);
const error = errorGn(namespace);

class TemporalNode {
    label: string;

    +toNode: () => NodeGeneral;

    constructor(label: string) {
        debug('.constructor', 'Creating node', { label });
        this.label = label;
    }

    // This is an abstract class, so we need to do this
    // eslint-disable-next-line class-methods-use-this
    toNode(): NodeGeneral {
        throw error('.toNode', 'Abstract method not implemented');
    }
}

export default TemporalNode;
