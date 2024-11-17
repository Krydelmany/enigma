import * as d3 from 'd3';

export class SortingVisualizer {
  constructor(containerId) {
    this.container = d3.select(containerId);
    this.margin = { top: 30, right: 30, bottom: 50, left: 50 };
    this.width = 1150 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;

    // Configuração do SVG principal
    this.svg = this.container
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Escalas
    this.xScale = d3.scaleBand()
      .range([0, this.width])
      .padding(0.1);

    this.yScale = d3.scaleLinear()
      .range([this.height, 0]);

    // Eixos
    this.xAxis = this.svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.height})`);

    this.yAxis = this.svg.append('g')
      .attr('class', 'y-axis');

    // Rótulos dos eixos
    this.svg.append('text')
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('x', this.width / 2)
      .attr('y', this.height + 40)
      .text('Índice do Array');

    this.svg.append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', -40)
      .text('Valor');

    // Tooltip
    this.tooltip = this.container
      .append('div')
      .attr('class', 'sorting-tooltip')
      .style('opacity', 0);
  }

  /**
   * Atualiza a visualização das barras.
   * @param {Array} data - Array de números a serem visualizados.
   * @param {Array} highlightIndices - Índices a serem destacados em amarelo.
   * @param {Array} swappingIndices - Índices a serem destacados em vermelho.
   * @param {Array} specialIndices - Índices a serem destacados em verde.
   */
  update(data, highlightIndices = [], swappingIndices = [], specialIndices = []) {
    // Atualizar escalas
    this.xScale.domain(data.map((d, i) => i));
    this.yScale.domain([0, d3.max(data) * 1.1]);

    // Atualizar eixos
    if (data.length <= 30) {
      this.xAxis.call(d3.axisBottom(this.xScale));
    } else {
      this.xAxis.call(d3.axisBottom(this.xScale).tickValues([]));
    }
    this.yAxis.call(d3.axisLeft(this.yScale));

    // Definir a cor dos textos dos eixos após a chamada do eixo
    this.xAxis.selectAll('text').attr('fill', 'var(--axis-color)');
    this.yAxis.selectAll('text').attr('fill', 'var(--axis-color)');

    // Selecionar as barras existentes
    const bars = this.svg.selectAll('.bar')
      .data(data);

    // Remover barras antigas
    bars.exit().remove();

    // Adicionar novas barras (se necessário)
    const barsEnter = bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => this.xScale(i))
      .attr('width', this.xScale.bandwidth())
      .attr('y', d => this.yScale(d))
      .attr('height', d => this.height - this.yScale(d));

    // Atualizar todas as barras (novas e existentes)
    bars.merge(barsEnter)
      .attr('x', (d, i) => this.xScale(i))
      .attr('width', this.xScale.bandwidth())
      .attr('y', d => this.yScale(d))
      .attr('height', d => this.height - this.yScale(d))
      .attr('class', (d, i) => {
        let classes = 'bar';
        if (swappingIndices.includes(i)) classes += ' swapping';
        else if (highlightIndices.includes(i)) classes += ' highlight';
        else if (specialIndices.includes(i)) classes += ' special';
        return classes;
      });

    // Adicionar eventos de mouse
    bars.merge(barsEnter)
      .on('mouseover', (event, d) => {
        this.tooltip
          .style('opacity', 1)
          .html(`Valor: ${d}`)
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY - 40}px`);
      })
      .on('mouseout', () => {
        this.tooltip.style('opacity', 0);
      });
  }
}

export class AlgorithmAnalytics {
  constructor(containerId) {
    this.container = d3.select(containerId);
    this.setupLayout();
    this.createCharts();
  }

  setupLayout() {
    this.container
      .style('display', 'grid')
      .style('grid-template-columns', 'repeat(2, 1fr)')
      .style('gap', '20px')
      .style('padding', '20px');

    this.timeContainer = this.container.append('div').attr('class', 'chart-container');
    this.comparisonContainer = this.container.append('div').attr('class', 'chart-container');
  }

  createCharts() {
    this.timeChart = new PerformanceChart(
      this.timeContainer.node(),
      'Tempo de Execução',
      'Tamanho do Array',
      'Tempo (ms)'
    );

    this.comparisonChart = new PerformanceChart(
      this.comparisonContainer.node(),
      'Comparações Realizadas',
      'Tamanho do Array',
      'Número de Comparações'
    );

    // Inicializa os gráficos com dados vazios para desenhar as linhas de grade
    this.timeChart.update([]);
    this.comparisonChart.update([]);
  }


  update(data) {
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Data must be a non-empty array.');
      return;
    }

    if (!data.every(d => 'algorithm' in d && 'size' in d && 'time' in d && 'comparisons' in d)) {
      console.error('Each data object must contain algorithm, size, time, and comparisons properties.');
      return;
    }
    // Criar cópias dos dados para cada gráfico
    const timeData = data.map(d => ({
      algorithm: d.algorithm,
      size: d.size,
      value: d.time
    }));

    const comparisonData = data.map(d => ({
      algorithm: d.algorithm,
      size: d.size,
      value: d.comparisons
    }));

    this.timeChart.update(timeData);
    this.comparisonChart.update(comparisonData);
  }

  clear() {
    this.timeChart.clear();
    this.comparisonChart.clear();
  }
}
class PerformanceChart {
  constructor(container, title, xLabel, yLabel) {
    this.margin = { top: 40, right: 120, bottom: 50, left: 70 };
    this.width = 600 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    // Enhanced SVG setup with better styling
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Improved scales with better color palette for algorithm visualization
    this.xScale = d3.scaleLinear().range([0, this.width]);
    this.yScale = d3.scaleLinear().range([this.height, 0]);
    this.colorScale = d3.scaleOrdinal()
      .range(['#2196F3', '#FF5722', '#4CAF50', '#9C27B0', '#FFC107']); // Material design colors

    // Add grid lines for better readability
    this.addGridLines();

    // Enhanced axes with better styling
    this.xAxis = this.svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.height})`);

    this.yAxis = this.svg.append('g')
      .attr('class', 'y-axis');

    // Enhanced labels with better positioning and styling
    this.addChartLabels(title, xLabel, yLabel);

    // Improved line generator with smoother curves
    this.line = d3.line()
      .x(d => this.xScale(d.size))
      .y(d => this.yScale(d.value))
      .curve(d3.curveCardinal.tension(0.7));

    // Enhanced tooltip with better styling
    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'performance-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(255, 255, 255, 0.9)')
      .style('padding', '10px')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('pointer-events', 'none')
      .style('font-size', '12px');
  }

  // Adicionar os métodos ausentes aqui
  processData(data) {
    return data.map(d => ({
      algorithm: d.algorithm,
      size: d.size,
      value: d.value
    }));
  }

  groupByAlgorithm(data) {
    return d3.group(data, d => d.algorithm);
  }

  addGridLines() {
    // Add X grid lines
    this.svg.append('g')
      .attr('class', 'grid-lines x-grid')
      .style('stroke', '#e0e0e0')
      .style('stroke-dasharray', '3,3');

    // Add Y grid lines
    this.svg.append('g')
      .attr('class', 'grid-lines y-grid')
      .style('stroke', '#e0e0e0')
      .style('stroke-dasharray', '3,3');
  }

  addChartLabels(title, xLabel, yLabel) {
    this.svg.append('text')
      .attr('class', 'chart-title')
      .attr('x', this.width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .text(title);

    // X Label
    this.svg.append('text')
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('x', this.width / 2)
      .attr('y', this.height + 40)
      .text(xLabel);

    // Y Label
    this.svg.append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', -50)
      .text(yLabel);
  }

  updateGridLines() {
    // Update X grid lines
    const xGridLines = this.svg.select('.x-grid')
      .selectAll('line')
      .data(this.xScale.ticks(10));

    xGridLines.enter()
      .append('line')
      .merge(xGridLines)
      .attr('x1', d => this.xScale(d))
      .attr('x2', d => this.xScale(d))
      .attr('y1', 0)
      .attr('y2', this.height);

    xGridLines.exit().remove();

    // Update Y grid lines
    const yGridLines = this.svg.select('.y-grid')
      .selectAll('line')
      .data(this.yScale.ticks(10));

    yGridLines.enter()
      .append('line')
      .merge(yGridLines)
      .attr('x1', 0)
      .attr('x2', this.width)
      .attr('y1', d => this.yScale(d))
      .attr('y2', d => this.yScale(d));

    yGridLines.exit().remove();
  }

  update(data) {
    if (!Array.isArray(data)) {
      console.error('Invalid data format');
      return;
    }

    try {
      const processedData = this.processData(data);
      const algorithmGroups = this.groupByAlgorithm(processedData);

      // Atualizar escalas com base nos dados ou definir domínios padrão
      if (data.length > 0) {
        this.updateScales(processedData);
      } else {
        // Definir domínios padrão quando não há dados
        this.xScale.domain([0, 100]); // Ajuste conforme necessário
        this.yScale.domain([0, 100]); // Ajuste conforme necessário
      }

      this.updateGridLines();
      this.updateAxes();
      this.updateLines(algorithmGroups);
      this.updateLegend(Array.from(algorithmGroups.keys()));
      this.addInteractivity();
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }

  updateScales(data) {
    try {
      const maxSize = d3.max(data, d => d.size) || 1;
      const maxValue = d3.max(data, d => d.value) || 1;

      this.xScale.domain([0, maxSize]);
      this.yScale.domain([0, maxValue * 1.1]);
    } catch (error) {
      console.error('Error updating scales:', error);
    }
  }


  updateAxes() {
    try {
      // Enhanced X axis
      this.xAxis.transition().duration(500)
        .call(d3.axisBottom(this.xScale)
          .ticks(10)
          .tickFormat(d => `${d}`))
        .selectAll('text')
        .style('font-size', '12px')
        .style('fill', 'var(--axis-color)');

      // Enhanced Y axis
      this.yAxis.transition().duration(500)
        .call(d3.axisLeft(this.yScale)
          .ticks(10)
          .tickFormat(d => `${d}ms`))
        .selectAll('text')
        .style('font-size', '12px')
        .style('fill', 'var(--axis-color)');
    } catch (error) {
      console.error('Error updating axes:', error);
    }
  }

  updateLegend(algorithms) {
    try {
      this.svg.selectAll('.legend').remove();

      const legend = this.svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${this.width + 20}, 0)`);

      const legendItems = legend.selectAll('.legend-item')
        .data(algorithms)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 25})`);

      // Add colored rectangles
      legendItems.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 2)
        .attr('ry', 2)
        .style('fill', d => this.colorScale(d));

      // Add algorithm names
      legendItems.append('text')
        .attr('x', 20)
        .attr('y', 9)
        .style('font-size', '12px')
        .style('fill', 'var(--axis-color)')
        .text(d => d);

      // Add interactivity to legend
      legendItems
        .style('cursor', 'pointer')
        .on('mouseover', (event, algorithm) => {
          // Highlight the corresponding line
          this.svg.selectAll('.line-path')
            .filter(d => d[0].algorithm !== algorithm)
            .style('opacity', 0.2);
        })
        .on('mouseout', () => {
          // Restore all lines
          this.svg.selectAll('.line-path')
            .style('opacity', 1);
        });

    } catch (error) {
      console.error('Error updating legend:', error);
    }
  }

  updateLines(algorithmGroups) {
    try {
      // Remove existing lines
      this.svg.selectAll('.line-group').remove();

      // Draw new lines for each algorithm with animations
      algorithmGroups.forEach((data, algorithm) => {
        const lineGroup = this.svg.append('g')
          .attr('class', 'line-group');

        // Draw line path with animation
        const path = lineGroup.append('path')
          .datum(data)
          .attr('class', 'line-path')
          .attr('fill', 'none')
          .attr('stroke', this.colorScale(algorithm))
          .attr('stroke-width', 2.5)
          .attr('d', this.line);

        // Add line animation
        const pathLength = path.node().getTotalLength();
        path
          .attr('stroke-dasharray', pathLength)
          .attr('stroke-dashoffset', pathLength)
          .transition()
          .duration(1000)
          .attr('stroke-dashoffset', 0);

        // Draw data points with animations
        lineGroup.selectAll('.dot')
          .data(data)
          .enter()
          .append('circle')
          .attr('class', 'dot')
          .attr('cx', d => this.xScale(d.size))
          .attr('cy', d => this.yScale(d.value))
          .attr('r', 0)
          .attr('fill', this.colorScale(algorithm))
          .transition()
          .duration(1000)
          .attr('r', 5);
      });
    } catch (error) {
      console.error('Error updating lines:', error);
    }
  }

  addInteractivity() {
    try {
      this.svg.selectAll('.dot')
        .on('mouseover', (event, d) => {
          // Enlarge dot
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('r', 8)
            .style('stroke', '#fff')
            .style('stroke-width', 2);

          // Show tooltip with enhanced styling
          this.tooltip
            .style('opacity', 1)
            .html(`
              <div style="font-weight: bold; margin-bottom: 5px; color: ${this.colorScale(d.algorithm)}">
                ${d.algorithm}
              </div>
              <div style="margin-bottom: 3px">Array Size: ${d.size}</div>
              <div>Time: ${d.value.toFixed(2)}ms</div>
            `)
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY - 60}px`);
        })
        .on('mouseout', (event) => {
          // Restore dot size
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('r', 5)
            .style('stroke', 'none');

          // Hide tooltip
          this.tooltip
            .transition()
            .duration(200)
            .style('opacity', 0);
        });
    } catch (error) {
      console.error('Error adding interactivity:', error);
    }
  }

  clear() {
    try {
      // Remove all elements with transitions
      this.svg.selectAll('.line-group')
        .transition()
        .duration(500)
        .style('opacity', 0)
        .remove();

      this.svg.selectAll('.legend')
        .transition()
        .duration(500)
        .style('opacity', 0)
        .remove();

      // Clear axes with transitions
      this.xAxis.transition().duration(500).call(d3.axisBottom(this.xScale.domain([0, 0])));
      this.yAxis.transition().duration(500).call(d3.axisLeft(this.yScale.domain([0, 0])));

      // Clear grid lines
      this.svg.selectAll('.grid-lines line')
        .transition()
        .duration(500)
        .style('opacity', 0)
        .remove();

    } catch (error) {
      console.error('Error clearing chart:', error);
    }
  }
}

export { PerformanceChart };