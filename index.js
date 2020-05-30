// @flow
import ParseNode from './src/object/ParseNode';
import GraphSequence from './src/object/GraphSequence';
import ReflexiveDiGraph from './src/object/ReflexiveDiGraph';
import Vertex from './src/object/Vertex';
import generateRenormalization from './src/func/generateRenormalization';
import display from './src/util/display';
import renderTree from './src/util/renderTree';


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

const s = new GraphSequence();
s.push(g);
s.push(h);
s.push(h);
s.push(g);
s.push(h);
s.push(h);

const tree = new ParseNode(s);
renderTree(tree);
