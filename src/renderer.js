// src/renderer.js

import * as d3 from 'd3'; // Certifique-se de importar o D3
import { SortingVisualizer, AlgorithmAnalytics } from './scripts/chart';
import { bubbleSort } from './scripts/algorithms/bubbleSort';
import { insertSort } from './scripts/algorithms/insertSort';
import { quickSort } from './scripts/algorithms/quickSort';
import { mergeSort } from './scripts/algorithms/mergeSort';

class SortingApp {
    constructor() {
        try {
            // Initialize visualizers
            this.initializeVisualizers();

            // Initialize state
            this.initializeState();

            // Cache DOM elements
            this.initializeDOMElements();

            // Create control buttons
            this.createControlButtons();

            // Bind events
            this.bindEvents();

            // Initialize array
            this.generateNewArray();
        } catch (error) {
            console.error('Failed to initialize SortingApp:', error);
            throw error;
        }
    }

    initializeVisualizers() {
        this.sortingVisualizer = new SortingVisualizer('#sorting-container');
        this.algorithmAnalytics = new AlgorithmAnalytics('#performance-container');
    }

    initializeState() {
        this.currentArray = [];
        this.isSorting = false;
        this.performanceData = [];
        this.comparisons = 0;
    }

    initializeDOMElements() {
        this.elements = {
            executionTime: document.getElementById('execution-time'),
            algorithmSelect: document.getElementById('algorithm-select'),
            sizeInput: document.getElementById('size-input'),
            speedInput: document.getElementById('speed-input'),
            newArrayButton: document.getElementById('new-array-button'),
            startButton: document.getElementById('start-button'),
            comparisonsSpan: document.getElementById('comparisons'),
            performanceContainer: document.querySelector('#performance-container')
        };

        if (!Object.values(this.elements).every(element => element)) {
            throw new Error('Failed to initialize required DOM elements');
        }
    }

    createControlButtons() {
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Limpar Dados';
        clearButton.onclick = () => this.clearPerformanceData();
        clearButton.classList.add('button', 'button--danger'); // Adicionado
    
        const exportButton = document.createElement('button');
        exportButton.textContent = 'Exportar CSV';
        exportButton.onclick = () => this.exportPerformanceData();
        exportButton.classList.add('button', 'button--info'); // Adicionado
    
        this.elements.performanceContainer.appendChild(clearButton);
        this.elements.performanceContainer.appendChild(exportButton);
    }
    

    bindEvents() {
        // Usar this.elements em vez de referências diretas
        this.elements.newArrayButton.addEventListener('click', () => this.generateNewArray());
        this.elements.startButton.addEventListener('click', () => this.startSorting());
        this.elements.sizeInput.addEventListener('change', () => this.generateNewArray());
    }

    generateNewArray() {
        const size = Math.max(1, Math.min(1000, parseInt(this.elements.sizeInput.value) || 10));
        this.elements.sizeInput.value = size; // Normaliza o input
        this.currentArray = Array.from({ length: size },
            () => Math.floor(Math.random() * 100) + 1);
        this.sortingVisualizer.update(this.currentArray);
        this.resetStats();
    }

    clearPerformanceData() {
        this.performanceData = [];
        if (this.algorithmAnalytics) {
            this.algorithmAnalytics.clear();
        }
        // Release blob URLs
        if (this.lastExportUrl) {
            URL.revokeObjectURL(this.lastExportUrl);
            this.lastExportUrl = null;
        }
    }

    resetStats() {
        this.comparisons = 0;
        this.elements.comparisonsSpan.textContent = '0';
    }

    exportPerformanceData() {
        const header = 'algorithm,size,time,comparisons\n';
        const csv = header + this.performanceData
            .map(d => `${d.algorithm},${d.size},${d.time},${d.comparisons}`)
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sorting-performance.csv';
        a.click();
    }

    async startSorting() {
        if (this.isSorting) return;

        const initialComparisons = this.comparisons;
        const startTime = performance.now();

        try {
            this.isSorting = true;
            this.toggleControls(false);

            const algorithm = this.getSelectedAlgorithm();
            if (!algorithm) {
                throw new Error('Invalid algorithm selected');
            }

            const delay = parseInt(this.elements.speedInput.value) || 50;
            await this.runSort(algorithm, [...this.currentArray], delay);

            const endTime = performance.now();
            this.updatePerformanceData({
                time: endTime - startTime,
                comparisons: this.comparisons - initialComparisons
            });

            this.elements.executionTime.textContent = `${(endTime - startTime).toFixed(2)} ms`;
        } catch (error) {
            console.error('Sorting error:', error);
        } finally {
            this.isSorting = false;
            this.toggleControls(true);
        }
    }


    getSelectedAlgorithm() {
        const algorithms = {
            bubble: bubbleSort,
            insert: insertSort,
            quick: quickSort,
            merge: mergeSort
        };
        // Fix: Use this.elements
        return algorithms[this.elements.algorithmSelect.value];
    }

    /**
     * Executa o algoritmo de ordenação selecionado.
     * @param {Function} algorithm - Função do algoritmo de ordenação.
     * @param {Array} array - Array a ser ordenado.
     * @param {number} delay - Atraso entre as operações para visualização.
     */
    async runSort(algorithm, array, delay) {
        try {
            let arr = [...array];

            const onUpdate = async (newArray, swappingIndices = [], specialIndices = []) => {
                arr = [...newArray];
                this.sortingVisualizer.update(arr, [], swappingIndices, specialIndices);
                if (swappingIndices.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            };

            const onCompare = async (indices, specialIndices = []) => {
                this.comparisons++;
                this.elements.comparisonsSpan.textContent = this.comparisons;
                this.sortingVisualizer.update(arr, indices, [], specialIndices);
                await new Promise(resolve => setTimeout(resolve, delay));
            };

            if (!algorithm) {
                throw new Error('Algorithm not provided');
            }

            await algorithm(arr, onUpdate, onCompare, delay);
            return arr;

        } catch (error) {
            console.error('Error during sorting:', error);
            throw error;
        }
    }

    destroy() {
        // Store bound handlers
        const handlers = {
            newArray: () => this.generateNewArray(),
            startSort: () => this.startSorting(),
            sizeChange: () => this.generateNewArray()
        };

        // Remove with proper handlers
        this.elements.newArrayButton.removeEventListener('click', handlers.newArray);
        this.elements.startButton.removeEventListener('click', handlers.startSort);
        this.elements.sizeInput.removeEventListener('change', handlers.sizeChange);

        // Cleanup
        this.clearPerformanceData();
        if (this.sortingVisualizer) this.sortingVisualizer.destroy();
        if (this.algorithmAnalytics) this.algorithmAnalytics.destroy();
    }


    updatePerformanceData(metrics) {
        if (!metrics?.time || !metrics?.comparisons) {
            throw new Error('Invalid metrics data');
        }

        const newDataPoint = {
            algorithm: this.elements.algorithmSelect.value,
            size: this.currentArray.length,
            time: metrics.time,
            comparisons: metrics.comparisons
        };

        this.performanceData.push(newDataPoint);

        try {
            const groupedData = this.groupPerformanceData();
            this.algorithmAnalytics.update(groupedData);

            const uniqueAlgorithms = [...new Set(this.performanceData.map(d => d.algorithm))];
            this.algorithmAnalytics.timeChart.updateLegend(uniqueAlgorithms);
            this.algorithmAnalytics.comparisonChart.updateLegend(uniqueAlgorithms);
        } catch (error) {
            console.error('Error updating performance data:', error);
        }
    }



    groupPerformanceData() {
        return Object.values(
            this.performanceData.reduce((acc, item) => {
                const key = `${item.algorithm}-${item.size}`;
                if (!acc[key]) {
                    acc[key] = {
                        algorithm: item.algorithm,
                        size: item.size,
                        time: [],
                        comparisons: []
                    };
                }
                acc[key].time.push(item.time);
                acc[key].comparisons.push(item.comparisons);
                return acc;
            }, {})
        ).map(group => ({
            ...group,
            time: d3.mean(group.time) || 0,
            comparisons: d3.mean(group.comparisons) || 0
        }));
    }

    toggleControls(enabled) {
        Object.entries({
            algorithmSelect: enabled,
            sizeInput: enabled,
            speedInput: enabled,
            newArrayButton: enabled,
            startButton: enabled
        }).forEach(([key, value]) => {
            this.elements[key].disabled = !value;
        });

        this.elements.startButton.textContent = enabled ? 'Iniciar Ordenação' : 'Ordenando...';
    }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new SortingApp();
});
