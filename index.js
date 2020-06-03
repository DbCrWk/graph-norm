// @flow
import ParseNode from './src/object/ParseNode';
import GraphSequence from './src/object/GraphSequence';
import ReflexiveDiGraph from './src/object/ReflexiveDiGraph';
import Vertex from './src/object/Vertex';
import renderTree from './src/util/renderTree';
import renderCliqueTree from './src/util/renderCliqueTree';
import TopologicalNode from './src/object/TopologicalNode';
import CliqueNode from './src/object/CliqueNode';


const a = new Vertex('a');
const b = new Vertex('b');
const c = new Vertex('c');

const g = new ReflexiveDiGraph('g1');
g.addEdge(a, b);
g.addEdge(b, c);

const h = new ReflexiveDiGraph('g2');
h.addVertex(a);
h.addVertex(b);
h.addVertex(c);
h.addEdge(c, a);

const s = new GraphSequence();
s.push(g);
s.push(h);
s.push(h);
s.push(g);
s.push(h);
s.push(h);

const tree = new ParseNode(s);
renderTree(tree);
// display(s.getCliqueMap());

const topologicalTree: TopologicalNode = new TopologicalNode(tree);

const cliqueTree: CliqueNode = new CliqueNode(topologicalTree);
renderCliqueTree(cliqueTree);
