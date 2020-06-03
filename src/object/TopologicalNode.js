// @flow
import ParseNode from './ParseNode';
import ReflexiveDiGraph from './ReflexiveDiGraph';
import type { CliqueMap } from './CliqueMap';
import type { Label } from './Label';

class TopologicalNode {
    parseNode: ParseNode;

    cliqueMap: CliqueMap;

    parentCliqueMap: CliqueMap | null;

    parentToSelfCliqueMap: { [Label]: Array<Label> };

    children: Array<TopologicalNode>;

    constructor(parseNode: ParseNode, parentCliqueMap?: CliqueMap | null) {
        this.parseNode = parseNode;
        this.parentCliqueMap = parentCliqueMap || null;
        this.cliqueMap = {};
        this.children = [];
        this.parentToSelfCliqueMap = {};

        const { entry, children } = parseNode;
        if (entry instanceof ReflexiveDiGraph) {
            const cliqueMap = this.parentCliqueMap || {};
            this.cliqueMap = cliqueMap;
            if (!parentCliqueMap) return;

            const parentToSelfCliqueMap = {};
            const parentCliqueLabels: Array<Label> = Object.keys(parentCliqueMap);
            parentCliqueLabels.forEach(l => { parentToSelfCliqueMap[l] = [l]; });
            this.parentToSelfCliqueMap = parentToSelfCliqueMap;

            return;
        }

        if (parseNode.isSpecial) {
            const cliqueMap = this.parentCliqueMap || {};
            this.cliqueMap = cliqueMap;
            this.children = children.map((n: ParseNode): TopologicalNode => {
                const child: TopologicalNode = (new TopologicalNode(n, cliqueMap));
                return child;
            });
            if (!parentCliqueMap) return;

            const parentToSelfCliqueMap = {};
            const parentCliqueLabels: Array<Label> = Object.keys(parentCliqueMap);
            parentCliqueLabels.forEach(l => { parentToSelfCliqueMap[l] = [l]; });
            this.parentToSelfCliqueMap = parentToSelfCliqueMap;

            return;
        }

        const cliqueMap = entry.getCliqueMap();
        this.cliqueMap = cliqueMap;
        this.children = children.map(
            (n: ParseNode): TopologicalNode => new TopologicalNode(n, cliqueMap),
        );

        if (!parentCliqueMap) return;

        const parentCliqueLabels: Array<Label> = Object.keys(parentCliqueMap);
        const parentToSelfCliqueMap = {};
        parentCliqueLabels.forEach((l: Label) => {
            parentToSelfCliqueMap[l] = [...parentCliqueMap[l]].filter((r: Label) => r in cliqueMap);
        });
        this.parentToSelfCliqueMap = parentToSelfCliqueMap;
    }
}

export default TopologicalNode;
