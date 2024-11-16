export default async function createComparisonChart(container, stats) {
    container.innerHTML = '';
    const chartData = Object.keys(stats).map(algorithm => ({
        algorithm,
        avgComparisons: stats[algorithm].reduce((sum, s) => sum + s.comparisons, 0) / stats[algorithm].length,
        avgSwaps: stats[algorithm].reduce((sum, s) => sum + s.swaps, 0) / stats[algorithm].length,
    }));

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().range([0, width]).padding(0.1).domain(chartData.map(d => d.algorithm));
    const y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(chartData, d => Math.max(d.avgComparisons, d.avgSwaps))]);

    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append('g').call(d3.axisLeft(y));

    svg.selectAll('.bar-comparisons')
        .data(chartData)
        .enter()
        .append('rect')
        .attr('class', 'bar-comparisons')
        .attr('x', d => x(d.algorithm))
        .attr('width', x.bandwidth() / 2)
        .attr('y', d => y(d.avgComparisons))
        .attr('height', d => height - y(d.avgComparisons))
        .attr('fill', '#3498db');

    svg.selectAll('.bar-swaps')
        .data(chartData)
        .enter()
        .append('rect')
        .attr('class', 'bar-swaps')
        .attr('x', d => x(d.algorithm) + x.bandwidth() / 2)
        .attr('width', x.bandwidth() / 2)
        .attr('y', d => y(d.avgSwaps))
        .attr('height', d => height - y(d.avgSwaps))
        .attr('fill', '#e67e22');
}
