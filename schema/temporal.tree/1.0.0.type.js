// @flow

type NodeLabel = string;
export type NodeGraph = {|
    category: 'graph',
    label: NodeLabel,
    children?: [],
    isTransitive?: boolean,
|};
export type NodeSequence = {|
    category: 'sequence',
    label: NodeLabel,
    // We have a circular reference, so there is no way to avoid this
    // eslint-disable-next-line no-use-before-define
    children: Array<NodeGeneral>,
    isTransitive?: boolean,
|};
export type NodeSpecial = {|
    category: 'special',
    label: NodeLabel,
    children: Array<NodeSequence>
|};
export type NodeGeneral = NodeGraph | NodeSequence | NodeSpecial;

type Label = string;
type Version = '1.0.0';
type Root = NodeSequence;

export type Schema = {|
    label: Label,
    version: Version,
    root: Root,
|};
