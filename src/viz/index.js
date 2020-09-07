/* eslint-env browser */
// @flow
import * as d3 from 'd3';
import data from './data.json';

const { vertices, graphs, sequence } = data;
const n = vertices.length;

const Margin = 75;
const Scale = 2;
const Graph = {
    Width: 150,
    Height: 150,
    Separation: 30,
};
const Node = {
    Width: 120,
    Height: 120,
    Radius: 50,
};

const nameToCode = name => Buffer.from(name).toString('base64').replace(/\+|=/g, '');

function renderGraph(graphName) {
    const { edges } = graphs[graphName];

    const toPolarLayout = i => {
        const cx = Graph.Width / 2 + Margin + Graph.Separation * Math.sin((2 * i * Math.PI) / n);
        const cy = Graph.Height / 2 + Margin + Graph.Separation * -Math.cos((2 * i * Math.PI) / n);

        return {
            cx,
            cy,
        };
    };

    // Create d3 Compatible Data
    const nodes = vertices.map((v, i) => ({ id: v, ...toPolarLayout(i) }));
    const links = edges
        .map(([a, b]) => ({ source: a, target: b }))
        .filter(({ source, target }) => source !== target);

    // Create containing SVG
    const svg = d3
        .select('#graph-tray')
        .append('svg')
        .style('width', `${(Graph.Width + 2 * Margin) * Scale}px`)
        .style('height', `${(Graph.Height + 2 * Margin) * Scale}px`)
        .style('display', 'inline-block')
        .attr('viewBox', [0, 0, Graph.Width + 2 * Margin, Graph.Height + 2 * Margin]);

    svg.append('text')
        .attr('x', (Graph.Width / 2))
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .style('font-size', '1em')
        .text(graphName);

    svg.append('svg:defs').selectAll('marker')
        .data(['end']) // Different link/path types can be defined here
        .enter()
        .append('svg:marker') // This section adds in the arrows
        .attr('id', String)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');
    // SVG created

    // Create actual links and nodes
    const link = svg.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('marker-end', 'url(#end)')
        .attr('stroke-width', d => Math.sqrt(d.value));

    const node = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .join('g');

    node.append('circle')
        .attr('r', 5)
        .attr('fill', '#c2f8ff');

    node.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 2)
        .attr('font-size', '0.6em')
        .attr('fill', 'black')
        .text(d => d.id);
    // Actual links and nodes created

    // Start force-based simulation
    const simulation = d3
        .forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).strength(0));
        // .force('charge', d3.forceManyBody().strength(-3))
        // .force('center', d3.forceCenter(Graph.Width / 2 + Margin, Graph.Height / 2 + Margin));

    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.cx)
            .attr('y1', d => d.source.cy)
            .attr('x2', d => d.target.cx)
            .attr('y2', d => d.target.cy);

        node
            .attr('transform', d => `translate(${d.cx}, ${d.cy})`);
    });
    // Simulation setup done
}

function renderGraphTray() {
    sequence.forEach(renderGraph);
}

const tree = d3.hierarchy(data.temporal.root);
const treeLayout = d3.tree().nodeSize([Node.Width, Node.Height]);
const root = treeLayout(tree);

let xMax = -Infinity;
let xMin = Infinity;
root.each(d => {
    if (d.x > xMax) xMax = d.x;
    if (d.x < xMin) xMin = d.x;
});
const xDiff = xMax - xMin;

let yMax = -Infinity;
let yMin = Infinity;
root.each(d => {
    if (d.y > yMax) yMax = d.y;
    if (d.y < yMin) yMin = d.y;
});
const yDiff = yMax - yMin;

function renderTopologicalTreeHelper(parent) {
    const svg = d3
        .select('#root')
        .select('svg');

    function renderTopologicalTreeHelperBound(o) {
        const { label } = o;
        const [temporalNodeLabel, cliqueId] = label.split(': ');
        const temporalNodeCode = nameToCode(temporalNodeLabel);

        const cliqueTopologicalNode = d3.select(document.getElementById(`${temporalNodeCode}-topological-${cliqueId}`)).data()[0];
        const { id, x, y } = cliqueTopologicalNode;

        if (parent) {
            const g = svg.append('g');

            const parentCliqueTopologicalContainer = d3.select(document.getElementById(`${parent.temporalNodeCode}-topological`)).data()[0];
            const selfCliqueTopologicalContainer = d3.select(document.getElementById(`${temporalNodeCode}-topological`)).data()[0];

            g.append('g')
                .attr('transform', `translate(${Margin}, ${Margin})`)
                .attr('fill', 'none')
                .attr('stroke', d3.interpolateRdBu(parseInt(id, 10) / (n - 1)))
                .attr('stroke-opacity', 1)
                .attr('stroke-width', 0.5)
                .selectAll('path')
                .data([
                    {
                        source: {
                            x: parentCliqueTopologicalContainer.x + parent.x,
                            y: parentCliqueTopologicalContainer.y + parent.y,
                        },
                        target: {
                            x: selfCliqueTopologicalContainer.x + x,
                            y: selfCliqueTopologicalContainer.y + y,
                        },
                    },
                ])
                .join('path')
                .attr('d', d3.linkHorizontal()
                    .x(d => d.y)
                    .y(d => d.x));
        }

        if (!o.children || o.children.length === 0) return;
        o.children.forEach(renderTopologicalTreeHelper({
            temporalNodeCode, id, x, y,
        }));
    }

    return renderTopologicalTreeHelperBound;
}

// eslint-disable-next-line no-unused-vars
function renderTopologicalTree() {
    data.topological.root.children.forEach(renderTopologicalTreeHelper());
}

function renderTemporalTree() {
    const toPolarLayout = i => {
        const cx = Graph.Separation * Math.sin((2 * i * Math.PI) / n);
        const cy = Graph.Separation * -Math.cos((2 * i * Math.PI) / n);

        return {
            cx,
            cy,
        };
    };

    const svg = d3
        .select('#root')
        .append('svg')
        .style('width', `${(xDiff + 2 * Margin) * Scale}px`)
        .style('height', `${(yDiff + 2 * Margin) * Scale}px`)
        .attr('viewBox', [0, 0, yDiff + 2 * Margin, xDiff + 2 * Margin]);

    const nodeGroup = svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('transform', `translate(${Margin + 250}, ${Margin})`);

    nodeGroup.append('g')
        .attr('fill', 'none')
        .attr('stroke', '#555')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 1.5)
        .selectAll('path')
        .data(root.links())
        .join('path')
        .attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y));

    const node = nodeGroup.append('g')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .selectAll('g')
        .data(root.descendants())
        .join('g')
        .attr('id', d => nameToCode(d.data.label))
        .attr('transform', d => `translate(${d.x}, ${d.y})`);

    node.append('circle')
        .attr('fill', d => {
            if (d.data.category === 'root') return 'blue';
            if (d.data.category === 'sequence') return 'red';
            if (d.data.category === 'graph') return 'purple';
            if (d.data.category === 'special') return 'black';
            return 'grey';
        })
        .attr('r', Node.Radius);

    node.append('circle')
        .attr('fill', 'white')
        .attr('r', Node.Radius - 2);

    const yTextPlacement = Node.Radius;
    node.append('text')
        .attr('dy', '1em')
        .attr('y', yTextPlacement)
        .text(d => d.data.label)
        .clone(true)
        .lower()
        .attr('stroke', 'white');

    node.each(d => {
        const nodes = vertices.map((v, i) => ({ id: v, ...toPolarLayout(i) }));
        const svgNode = d3.select(`#${nameToCode(d.data.label)}`);

        svgNode.append('svg:defs').selectAll('marker')
            .data(['end-internal']) // Different link/path types can be defined here
            .enter()
            .append('svg:marker') // This section adds in the arrows
            .attr('id', String)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 20)
            .attr('refY', 0)
            .attr('markerWidth', 5)
            .attr('markerHeight', 5)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');

        const edges = (d.data.label in graphs) ? graphs[d.data.label].edges || [] : [];
        const links = edges
            .map(([a, b]) => ({ source: a, target: b }))
            .filter(({ source, target }) => source !== target);

        const graphLink = svgNode.append('g')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('marker-end', 'url(#end-internal)')
            .attr('stroke-width', 1);

        const graphNode = svgNode.append('g')
            .attr('id', `${nameToCode(d.data.label)}-topological`)
            .selectAll('g')
            .data(nodes)
            .join('g');

        graphNode.append('circle')
            .attr('r', 5)
            .attr('id', dd => `${nameToCode(d.data.label)}-topological-${dd.id}`)
            .attr('fill', '#c2f8ff');

        graphNode.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 2)
            .attr('font-size', '0.8em')
            .attr('fill', 'black')
            .text(dd => dd.id);

        const simulation = d3
            .forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(dl => dl.id).strength(0));
            // .force('charge', d3.forceManyBody().strength(-1))
            // .force('center', d3.forceCenter(0, 0));

        simulation.on('tick', () => {
            graphLink
                .attr('x1', dl => dl.source.cx)
                .attr('y1', dl => dl.source.cy)
                .attr('x2', dl => dl.target.cx)
                .attr('y2', dl => dl.target.cy);

            graphNode
                .attr('transform', dd => `translate(${dd.cx}, ${dd.cy})`);
        });

        // simulation.on('end', () => {
        //     renderTopologicalTree();
        // });
    });
}

renderGraphTray();
renderTemporalTree();
