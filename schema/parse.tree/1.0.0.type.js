// @flow
import type { Schema as Temporal } from '../temporal.tree/1.0.0.type';
import type { Schema as Topological } from '../topological.tree/1.0.0.type';

type Label = string;
type Version = '1.0.0';

export type Schema = {|
    label: Label,
    version: Version,
    temporal: Temporal,
    topological: Topological,
|};
