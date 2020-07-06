// @flow
import { debugLib as debugGn, errorLib as errorGn } from '../util/logger';
import ReflexiveDiGraph from './ReflexiveDiGraph';
import TemporalNode from './TemporalNode';
import GraphTemporalNode from './Graph.TemporalNode';
import SpecialTemporalNode from './Special.TemporalNode';
import SequenceTemporalNode from './Sequence.TemporalNode';
import liftingReducer from '../func/liftingReducer';
import type { CliqueRep } from './CliqueRep';
import type { Clique } from './Clique';
import type { NodeGeneral, NodeSequence } from '../../schema/topological.tree/1.0.0.type';

const namespace = 'Object > TemporalNode';
const debug = debugGn(namespace);
const error = errorGn(namespace);

class TopologyNode {
    label: string;

    n: TemporalNode;

    h: ReflexiveDiGraph;

    v: CliqueRep;

    children: Array<TopologyNode>;

    category: 'special' | 'sequence';

    constructor(n: TemporalNode, v: CliqueRep) {
        if (n instanceof GraphTemporalNode) {
            throw error('.constructor', 'TopologyNode cannot be created from a GraphTemporalNode');
        }

        this.n = n;
        this.label = `${n.label}: ${v}`;
        this.v = v;
        debug('.constructor', 'Label, CliqueRep set', { label: this.label, v: this.v });


        if (n instanceof SpecialTemporalNode) {
            debug('.constructor', 'Special input');
            this.category = 'special';
            this.h = n.annotation;
            const clique: Clique = this.h.getCliqueMap()[this.v];
            this.children = n.children
                .map((childTemporalNode): Array<TopologyNode> => {
                    const cliqueMapForChild = childTemporalNode
                        .sequence.getLastCumulant().transitiveClosure.getCliqueMap();
                    const cliqueRepsForChild = Object.keys(cliqueMapForChild);
                    const childCliquesInThisClique = cliqueRepsForChild.filter(r => clique.has(r));
                    return childCliquesInThisClique.map(
                        r => new TopologyNode(childTemporalNode, r),
                    );
                })
                .reduce(liftingReducer, []);
            return;
        }

        if (n instanceof SequenceTemporalNode) {
            debug('.constructor', 'Sequence input');
            this.category = 'sequence';
            this.h = n.sequence.getLastCumulant().transitiveClosure;
            const clique: Clique = this.h.getCliqueMap()[this.v];
            this.children = n.children
                .map((childTemporalNode): Array<TopologyNode> => {
                    if (childTemporalNode instanceof SequenceTemporalNode) {
                        const cliqueMapForChild = childTemporalNode
                            .sequence.getLastCumulant().transitiveClosure.getCliqueMap();
                        const cliqueRepsForChild = Object.keys(cliqueMapForChild);
                        const childCliquesInThisClique = cliqueRepsForChild
                            .filter(r => clique.has(r));
                        return childCliquesInThisClique.map(
                            r => new TopologyNode(childTemporalNode, r),
                        );
                    }

                    if (childTemporalNode instanceof GraphTemporalNode) {
                        return [];
                    }

                    if (childTemporalNode instanceof SpecialTemporalNode) {
                        const cliqueMapForChild = childTemporalNode.annotation.getCliqueMap();
                        const cliqueRepsForChild = Object.keys(cliqueMapForChild);
                        const childCliquesInThisClique = cliqueRepsForChild
                            .filter(r => clique.has(r));
                        return childCliquesInThisClique.map(
                            r => new TopologyNode(childTemporalNode, r),
                        );
                    }

                    throw error('.constructor', 'For SequenceTemporalNode, child not understood', { childTemporalNode });
                })
                .reduce(liftingReducer, []);
            return;
        }

        throw error('.constructor', 'TopologyNode must be either a Special or Sequence node');
    }

    toNode(): NodeGeneral {
        const { v, category, label } = this;

        if (category === 'special') {
            const childrenRaw = this.children.map(c => c.toNode());
            // $FlowFixMe
            const children: Array<NodeSequence> = childrenRaw.filter(c => c.category === 'sequence');

            return {
                category: 'special',
                label,
                clique: v,
                children,
            };
        }

        return {
            category: 'sequence',
            label: this.label,
            clique: this.v,
            children: this.children.map(c => c.toNode()),
        };
    }
}

export default TopologyNode;
