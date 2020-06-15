// @flow

type NodeLabel = string;
type Clique = string;
export type NodeSequence = {|
    category: 'sequence',
    label: NodeLabel,
    clique: Clique,
    // We have a circular reference, so there is no way to avoid this
    // eslint-disable-next-line no-use-before-define
    children?: Array<NodeGeneral>,
|};
export type NodeSpecial = {|
    category: 'special',
    label: NodeLabel,
    clique: Clique,
    children?: Array<NodeSequence>
|};
export type NodeGeneral = NodeSequence | NodeSpecial;

type Label = string;
type Version = '1.0.0';
export type Root = {|
    category: 'root',
    label: 'root',
    children: Array<NodeGeneral>
|};

export type Schema = {|
    label: Label,
    version: Version,
    root: Root,
|};
