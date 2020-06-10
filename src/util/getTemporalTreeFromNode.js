// @flow
import SequenceTemporalNode from '../object/Sequence.TemporalNode';
import type { Schema as TemporalTreeSchema, NodeSequence } from '../../schema/temporal.tree/1.0.0.type';

function getTemporalTreeFromNode(rootNode: SequenceTemporalNode): TemporalTreeSchema {
    const root: NodeSequence = rootNode.toNode();

    return {
        label: `Autogenerated (${root.label})`,
        version: '1.0.0',
        root,
    };
}

export default getTemporalTreeFromNode;
