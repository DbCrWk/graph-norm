// @flow
import GraphSequence from './GraphSequence';
import ReflexiveDiGraph from './ReflexiveDiGraph';

export type RenormalizedSequenceEntry = GraphSequence | ReflexiveDiGraph;
export type RenormalizedSequence = Array<RenormalizedSequenceEntry>;
