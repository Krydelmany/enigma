// Extensão do objeto algorithms no renderer.js
const algorithms = {
    bubble: {
        name: 'Bubble Sort',
        async sort(arr) {
            const n = arr.length;
            let metrics = { comparisons: 0, swaps: 0, time: 0 };
            const startTime = performance.now();
            
            for (let i = 0; i < n - 1; i++) {
                for (let j = 0; j < n - i - 1; j++) {
                    metrics.comparisons++;
                    if (arr[j] > arr[j + 1]) {
                        metrics.swaps++;
                        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                        await new Promise(resolve => setTimeout(resolve, getAnimationDelay()));
                        updateDataVisualization();
                    }
                }
            }
            
            metrics.time = performance.now() - startTime;
            return metrics;
        }
    },
    
    quick: {
        name: 'Quick Sort',
        async sort(arr) {
            const metrics = { comparisons: 0, swaps: 0, time: 0 };
            const startTime = performance.now();
            
            async function partition(low, high) {
                const pivot = arr[high];
                let i = low - 1;
                
                for (let j = low; j < high; j++) {
                    metrics.comparisons++;
                    if (arr[j] < pivot) {
                        i++;
                        metrics.swaps++;
                        [arr[i], arr[j]] = [arr[j], arr[i]];
                        await new Promise(resolve => setTimeout(resolve, getAnimationDelay()));
                        updateDataVisualization();
                    }
                }
                
                metrics.swaps++;
                [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
                await new Promise(resolve => setTimeout(resolve, getAnimationDelay()));
                updateDataVisualization();
                
                return i + 1;
            }
            
            async function quickSort(low, high) {
                if (low < high) {
                    const pi = await partition(low, high);
                    await quickSort(low, pi - 1);
                    await quickSort(pi + 1, high);
                }
            }
            
            await quickSort(0, arr.length - 1);
            metrics.time = performance.now() - startTime;
            return metrics;
        }
    },
    
    merge: {
        name: 'Merge Sort',
        async sort(arr) {
            const metrics = { comparisons: 0, swaps: 0, time: 0 };
            const startTime = performance.now();
            
            async function merge(l, m, r) {
                const n1 = m - l + 1;
                const n2 = r - m;
                const L = arr.slice(l, m + 1);
                const R = arr.slice(m + 1, r + 1);
                
                let i = 0, j = 0, k = l;
                
                while (i < n1 && j < n2) {
                    metrics.comparisons++;
                    if (L[i] <= R[j]) {
                        arr[k] = L[i];
                        i++;
                    } else {
                        arr[k] = R[j];
                        j++;
                    }
                    metrics.swaps++;
                    k++;
                    await new Promise(resolve => setTimeout(resolve, getAnimationDelay()));
                    updateDataVisualization();
                }
                
                while (i < n1) {
                    arr[k] = L[i];
                    i++;
                    k++;
                    metrics.swaps++;
                    await new Promise(resolve => setTimeout(resolve, getAnimationDelay()));
                    updateDataVisualization();
                }
                
                while (j < n2) {
                    arr[k] = R[j];
                    j++;
                    k++;
                    metrics.swaps++;
                    await new Promise(resolve => setTimeout(resolve, getAnimationDelay()));
                    updateDataVisualization();
                }
            }
            
            async function mergeSort(l, r) {
                if (l < r) {
                    const m = Math.floor(l + (r - l) / 2);
                    await mergeSort(l, m);
                    await mergeSort(m + 1, r);
                    await merge(l, m, r);
                }
            }
            
            await mergeSort(0, arr.length - 1);
            metrics.time = performance.now() - startTime;
            return metrics;
        }
    },
    
    insertion: {
        name: 'Insertion Sort',
        async sort(arr) {
            const metrics = { comparisons: 0, swaps: 0, time: 0 };
            const startTime = performance.now();
            
            for (let i = 1; i < arr.length; i++) {
                let key = arr[i];
                let j = i - 1;
                
                while (j >= 0) {
                    metrics.comparisons++;
                    if (arr[j] > key) {
                        metrics.swaps++;
                        arr[j + 1] = arr[j];
                        j--;
                        await new Promise(resolve => setTimeout(resolve, getAnimationDelay()));
                        updateDataVisualization();
                    } else {
                        break;
                    }
                }
                
                arr[j + 1] = key;
                metrics.swaps++;
                await new Promise(resolve => setTimeout(resolve, getAnimationDelay()));
                updateDataVisualization();
            }
            
            metrics.time = performance.now() - startTime;
            return metrics;
        }
    }
};

// Função para coletar e armazenar estatísticas
const statsManager = {
    stats: [],
    
    addStats(algorithmName, metrics, dataSize) {
        this.stats.push({
            algorithm: algorithmName,
            dataSize,
            ...metrics,
            timestamp: new Date()
        });
        this.updateVisualization();
    },
    
    clearStats() {
        this.stats = [];
        this.updateVisualization();
    },
    
    async updateVisualization() {
        const statsSection = document.querySelector('#statsSection .chart-container');
        if (!statsSection) return;
        
        // Agrupa estatísticas por algoritmo
        const algorithmStats = {};
        this.stats.forEach(stat => {
            if (!algorithmStats[stat.algorithm]) {
                algorithmStats[stat.algorithm] = [];
            }
            algorithmStats[stat.algorithm].push(stat);
        });
        
        // Criar visualizações D3.js
        await this.createComparisonChart(statsSection, algorithmStats);
    },
    
    async createComparisonChart(container, stats) {
        // Limpa o container
        container.innerHTML = '';
        
        // Prepara dados para o gráfico
        const chartData = Object.keys(stats).map(algorithm => {
            const algorithmStats = stats[algorithm];
            return {
                algorithm,
                avgComparisons: this.average(algorithmStats.map(s => s.comparisons)),
                avgSwaps: this.average(algorithmStats.map(s => s.swaps)),
                avgTime: this.average(algorithmStats.map(s => s.time))
            };
        });
        
        // Configuração do gráfico
        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        
        // Cria SVG
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Escalas
        const x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
            
        const y = d3.scaleLinear()
            .range([height, 0]);
            
        // Domínios
        x.domain(chartData.map(d => d.algorithm));
        y.domain([0, d3.max(chartData, d => Math.max(d.avgComparisons, d.avgSwaps))]);
        
        // Eixos
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));
            
        svg.append('g')
            .call(d3.axisLeft(y));
        
        // Barras para comparações
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
        
        // Barras para trocas
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
        
        // Legenda
        const legend = svg.append('g')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10)
            .attr('text-anchor', 'start')
            .selectAll('g')
            .data(['Comparações', 'Trocas'])
            .enter()
            .append('g')
            .attr('transform', (d, i) => `translate(0,${i * 20 - 10})`);
            
        legend.append('rect')
            .attr('x', width - 19)
            .attr('width', 19)
            .attr('height', 19)
            .attr('fill', (d, i) => i === 0 ? '#3498db' : '#e67e22');
            
        legend.append('text')
            .attr('x', width - 24)
            .attr('y', 9.5)
            .attr('dy', '0.32em')
            .text(d => d);
    },
    
    average(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }
};

// Exporta o objeto de estatísticas
window.statsManager = statsManager;