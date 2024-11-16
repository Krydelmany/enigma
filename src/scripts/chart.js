// src/scripts/chart.js

import * as d3 from 'd3';

export class SortingVisualizer {
  constructor(containerId) {
    this.container = d3.select(containerId);
    this.margin = { top: 30, right: 30, bottom: 50, left: 50 };
    this.width = 1100 - this.margin.left - this.margin.right;
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
    this.margin = { top: 40, right: 30, bottom: 50, left: 60 };
    this.width = 400 - this.margin.left - this.margin.right;
    this.height = 300 - this.margin.top - this.margin.bottom;

    this.svg = d3.select(container)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right + 100) // Espaço extra para legenda
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Escalas
    this.xScale = d3.scaleLinear().range([0, this.width]);
    this.yScale = d3.scaleLinear().range([this.height, 0]);
    this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Eixos
    this.xAxis = this.svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.height})`);

    this.yAxis = this.svg.append('g')
      .attr('class', 'y-axis');

    // Rótulos
    this.svg.append('text')
      .attr('class', 'chart-title')
      .attr('x', this.width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(title);

    this.svg.append('text')
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('x', this.width / 2)
      .attr('y', this.height + 40)
      .text(xLabel);

    this.svg.append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', -50)
      .text(yLabel);

    // Linha de tendência
    this.line = d3.line()
      .x(d => this.xScale(d.size))
      .y(d => this.yScale(d.value))
      .curve(d3.curveMonotoneX);

    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'performance-tooltip')
      .style('opacity', 0);
  }

  update(data) {
    if (!Array.isArray(data)) {
      console.error('Invalid data format');
      return;
    }

    try {
      const processedData = this.processData(data);
      const algorithmGroups = this.groupByAlgorithm(processedData);

      this.updateScales(processedData);
      this.updateAxes();
      this.updateLines(algorithmGroups);
      this.updateLegend(Array.from(algorithmGroups.keys()));
      this.addInteractivity();
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }

  processData(data) {
    return data.map(d => ({
      algorithm: d.algorithm,
      size: d.size,
      value: d.value
    }));
  }

  groupByAlgorithm(data) {
    return new Map(
      Array.from(
        d3.group(data, d => d.algorithm)
      )
    );
  }

  updateAxes() {
    try {
      this.xAxis.call(d3.axisBottom(this.xScale));
      this.yAxis.call(d3.axisLeft(this.yScale));
  
      // Definir a cor dos textos dos eixos após a chamada do eixo
      this.xAxis.selectAll('text').attr('fill', 'var(--axis-color)');
      this.yAxis.selectAll('text').attr('fill', 'var(--axis-color)');
    } catch (error) {
      console.error('Error updating axes:', error);
    }
  }
  

  updateLegend(algorithms) {
    try {
      this.svg.selectAll('.legend').remove();

      const legend = this.svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${this.width + 20}, 20)`); // Move a legenda para a direita

      algorithms.forEach((algo, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(0, ${i * 20})`);

        legendRow.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', this.colorScale(algo));

        legendRow.append('text')
          .attr('x', 15)
          .attr('y', 10)
          .attr('text-anchor', 'start')
          .style('font-size', '12px')
          .text(algo);
      });
    } catch (error) {
      console.error('Error updating legend:', error);
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

  updateLines(algorithmGroups) {
    try {
      // Remove existing lines
      this.svg.selectAll('.line-group').remove();

      // Draw new lines for each algorithm
      algorithmGroups.forEach((data, algorithm) => {
        const lineGroup = this.svg.append('g').attr('class', 'line-group');

        // Draw line path
        lineGroup.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', this.colorScale(algorithm))
          .attr('stroke-width', 2)
          .attr('d', this.line);

        // Draw data points
        lineGroup.selectAll('.dot')
          .data(data)
          .enter()
          .append('circle')
          .attr('class', 'dot')
          .attr('cx', d => this.xScale(d.size))
          .attr('cy', d => this.yScale(d.value))
          .attr('r', 4)
          .attr('fill', this.colorScale(algorithm));
      });
    } catch (error) {
      console.error('Error updating lines:', error);
    }
  }

  addInteractivity() {
    try {
      this.svg.selectAll('.dot')
        .on('mouseover', (event, d) => {
          d3.select(event.currentTarget).attr('r', 6);

          // Mostrar o tooltip
          this.tooltip
            .style('opacity', 1)
            .html(`Algoritmo: ${d.algorithm}<br>Tamanho: ${d.size}<br>Valor: ${d.value.toFixed(2)}`)
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY - 40}px`);
        })
        .on('mouseout', (event) => {
          d3.select(event.currentTarget).attr('r', 4);

          // Esconder o tooltip
          this.tooltip.style('opacity', 0);
        });
    } catch (error) {
      console.error('Error adding interactivity:', error);
    }
  }

  clear() {
    try {
      // Remove all line groups and legends
      this.svg.selectAll('.line-group').remove();
      this.svg.selectAll('.legend').remove();

      // Clear axes
      this.xAxis.selectAll('*').remove();
      this.yAxis.selectAll('*').remove();
    } catch (error) {
      console.error('Error clearing chart:', error);
    }
    // Clear event listeners
    this.svg.selectAll('.dot').on('mouseover', null).on('mouseout', null);
  }
}

export { PerformanceChart };
