// src/renderer.js

import { SortingVisualizer, AlgorithmAnalytics } from './scripts/chart';
import { bubbleSort } from './scripts/algorithms/bubbleSort';
import { insertSort } from './scripts/algorithms/insertSort';
import { quickSort } from './scripts/algorithms/quickSort';
import { mergeSort } from './scripts/algorithms/mergeSort';
import { heapSort } from './scripts/algorithms/heapSort';
import { selectSort } from './scripts/algorithms/selectSort';
import { shellSort } from './scripts/algorithms/shellSort';
import { radixSort } from './scripts/algorithms/radixSort';
import { countingSort } from './scripts/algorithms/countingSort';
import { bucketSort } from './scripts/algorithms/bucketSort';

/**
 * Formata o tempo de execução em uma unidade legível.
 * @param {number} milliseconds - O tempo em milissegundos.
 * @returns {string} - Tempo formatado.
 */
function formatExecutionTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const ms = milliseconds % 1000;

    if (seconds < 60) {
        return `${seconds}s ${ms}ms`; // Exibe em segundos e milissegundos
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
        return `${minutes}m ${remainingSeconds}s`; // Exibe em minutos e segundos
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`; // Exibe em horas, minutos e segundos
}

class SortingApp {
    constructor() {
        if (!(this instanceof SortingApp)) {
            throw new Error('SortingApp must be instantiated with new');
        }
        try {
            this.initializeVisualizers();
            this.initializeState();
            this.initializeDOMElements();
            this.createControlButtons();
            this.bindEvents();
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
        this.initialArray = [];
        this.isSorting = false;
        this.performanceData = [];
        this.comparisons = 0;
        this.lastExportUrl = null;
        this.swapCount = 0;
        this.delay = 50; // Valor padrão
        this.algorithmName = null;
    }

    initializeDOMElements() {
        this.elements = {
            executionTime: document.getElementById('execution-time'),
            algorithmSelect: document.getElementById('algorithm-select'),
            sizeInput: document.getElementById('size-input'),
            sizeRange: document.getElementById('size-range'),
            speedInput: document.getElementById('speed-input'),
            speedRange: document.getElementById('speed-range'), // Adicionado
            newArrayButton: document.getElementById('new-array-button'),
            startButton: document.getElementById('start-button'),
            resetArrayButton: document.getElementById('reset-array-button'), // Adicionado
            comparisonsSpan: document.getElementById('comparisons'),
            swapCountValue: document.getElementById('swap-count-value'),
            performanceContainer: document.querySelector('#performance-container'),
        };

        Object.entries(this.elements).forEach(([key, value]) => {
            if (!value) console.error(`Element not found: ${key}`);
        });

        if (!Object.values(this.elements).every(element => element)) {
            throw new Error('Failed to initialize required DOM elements');
        }
    }

    createControlButtons() {
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Limpar Dados';
        clearButton.onclick = () => this.clearPerformanceData();
        clearButton.classList.add('button', 'button--danger', 'button--utility');

        const exportButton = document.createElement('button');
        exportButton.textContent = 'Exportar CSV';
        exportButton.onclick = () => this.exportPerformanceData();
        exportButton.classList.add('button', 'button--info', 'button--utility');

        this.elements.performanceContainer.appendChild(clearButton);
        this.elements.performanceContainer.appendChild(exportButton);
    }

    bindEvents() {
        const handlers = this.getEventHandlers();

        const elementBindings = [
            [this.elements.newArrayButton, 'click', handlers.generateNewArray],
            [this.elements.startButton, 'click', handlers.startSorting],
            [this.elements.sizeRange, 'input', handlers.handleSizeChange],
            [this.elements.sizeInput, 'input', handlers.handleSizeChange],
            [this.elements.speedRange, 'input', handlers.handleSpeedChange],
            [this.elements.speedInput, 'input', handlers.handleSpeedChange],
            [this.elements.resetArrayButton, 'click', handlers.resetToInitialArray]
        ];

        elementBindings.forEach(([element, event, handler]) => {
            this.bindSafely(element, event, handler);
        });
    }

    bindSafely(element, event, handler) {
        try {
            if (!element) {
                throw new Error(`Element not found for ${event} event`);
            }
            element.addEventListener(event, handler);
        } catch (error) {
            console.error(`Failed to bind ${event} event:`, error);
        }
    }

    generateNewArray() {
        if (this.isSorting || !this.elements?.sizeInput) return;
        const size = Math.max(1, Math.min(1000, parseInt(this.elements.sizeInput.value) || 10));
        this.elements.sizeInput.value = size; // Normaliza o input
        this.elements.sizeRange.value = size; // Sincroniza o range
        this.currentArray = Array.from({ length: size },
            () => Math.floor(Math.random() * 100) + 1);
        this.initialArray = [...this.currentArray];
        this.sortingVisualizer.update(this.currentArray);
        this.resetStats();
    }

    clearPerformanceData() {
        this.performanceData = [];
        if (this.algorithmAnalytics) {
            this.algorithmAnalytics.clear();
        }
        // Limpar todas as URLs de blob anteriores
        if (this.lastExportUrl) {
            URL.revokeObjectURL(this.lastExportUrl);
            this.lastExportUrl = null;
        }
    }

    resetStats() {
        this.comparisons = 0;
        this.elements.comparisonsSpan.textContent = '0';
        this.elements.executionTime.textContent = '0s 0ms';
        this.updateSwapCountDisplay(0);
    }

    exportPerformanceData() {
        if (!this.performanceData?.length) {
            console.warn('No performance data to export');
            return;
        }
        if (this.lastExportUrl) {
            URL.revokeObjectURL(this.lastExportUrl);
        }
        const header = 'algorithm,size,time,comparisons\n';
        const csv = header + this.performanceData
            .map(d => `${d.algorithm},${d.size},${d.time},${d.comparisons}`)
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        this.lastExportUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = this.lastExportUrl;
        a.download = 'sorting-performance.csv';
        a.click();
    }

    async startSorting() {
        if (this.isSorting) return;

        if (!this.currentArray || this.currentArray.length === 0) {
            console.error('No array to sort');
            return;
        }

        const initialComparisons = this.comparisons;
        const startTime = performance.now();

        if (!this.initialArray.length || this.initialArray.toString() !== this.currentArray.toString()) {
            this.initialArray = [...this.currentArray];
        }

        try {
            this.isSorting = true;
            this.toggleControls(false);

            const algorithm = this.getSelectedAlgorithm();
            if (!algorithm) {
                throw new Error('Invalid algorithm selected');
            }

            // Adicionar validação para o delay
            const delay = (() => {
                const inputValue = parseInt(this.elements.speedInput.value);
                if (isNaN(inputValue) || inputValue < 0) {
                    return 50; // valor padrão
                }
                return inputValue;
            })();

            // Capturar o resultado com o swapCount
            const result = await this.runSort(algorithm, [...this.currentArray], delay);

            const endTime = performance.now();
            this.updatePerformanceData({
                time: endTime - startTime,
                comparisons: this.comparisons - initialComparisons
            });

            // Atualizar a exibição do tempo formatado
            this.elements.executionTime.textContent = formatExecutionTime(endTime - startTime);

            // Atualizar a exibição do número de trocas
            if (result && result.swapCount !== undefined) {
                this.updateSwapCountDisplay(result.swapCount);
            }

        } catch (error) {
            console.error('Sorting error:', error);
        } finally {
            this.isSorting = false;
            this.toggleControls(true);
        }
    }

    resetToInitialArray() {
        if (this.isSorting || !this.initialArray?.length) return;

        if (this.initialArray.length) {
            this.currentArray = [...this.initialArray];
            this.sortingVisualizer.update(this.currentArray);
            this.resetStats();
        } else {
            console.warn('Nenhum array inicial armazenado.');
        }
    }

    getSelectedAlgorithm() {
        const algorithms = {
            bubble: bubbleSort,
            insert: insertSort,
            quick: quickSort,
            merge: mergeSort,
            heap: heapSort,
            select: selectSort,
            shell: shellSort,
            counting: countingSort,
            bucket: bucketSort,
            radix: radixSort
        };

        const selected = this.elements.algorithmSelect.value;
        if (!algorithms[selected]) {
            throw new Error(`Invalid algorithm selected: ${selected}`);
        }
        return algorithms[selected];
    }

    async runSort(algorithm, array, delay) {
        if (!algorithm || !Array.isArray(array) || typeof delay !== 'number') {
            throw new Error('Invalid parameters provided to runSort');
        }
        try {
            let arr = [...array];
            let swapCount = 0;

            const onUpdate = async (newArray, swappingIndices = [], specialIndices = []) => {
                arr = [...newArray];
                this.sortingVisualizer.update(arr, [], swappingIndices, specialIndices);
                if (swappingIndices.length > 0) {
                    swapCount++; // Incrementar contador de trocas
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            };

            const onCompare = async (indices, specialIndices = []) => {
                this.comparisons++;
                this.elements.comparisonsSpan.textContent = this.comparisons;
                this.sortingVisualizer.update(arr, indices, [], specialIndices);
                await new Promise(resolve => setTimeout(resolve, delay));
            };

            const result = await algorithm(arr, onUpdate, onCompare, delay);
            return { sortedArray: arr, swapCount };
        } catch (error) {
            console.error('Error during sorting:', error);
            throw error;
        }
    }

    updateSwapCountDisplay(count) {
        if (this.elements.swapCountValue) {
            this.elements.swapCountValue.textContent = count;
        }
    }

    updatePerformanceData(metrics) {
        try {
            if (!metrics || typeof metrics !== 'object') {
                throw new Error('Metrics must be an object');
            }
            if (typeof metrics.time !== 'number' || typeof metrics.comparisons !== 'number') {
                throw new Error('Invalid metrics data types');
            }

            const newDataPoint = {
                algorithm: this.elements.algorithmSelect.value,
                size: this.currentArray.length,
                time: metrics.time,
                comparisons: metrics.comparisons
            };

            this.performanceData.push(newDataPoint);
            this.algorithmAnalytics?.update(this.performanceData);
        } catch (error) {
            console.error('Error updating performance data:', error);
            throw error; // Re-throw para permitir tratamento externo
        }
    }

    handleSizeChange() {
        this.elements.sizeInput.value = this.elements.sizeRange.value;
        this.elements.sizeRange.value = this.elements.sizeInput.value;
        this.generateNewArray();
    }

    handleSpeedChange() {
        this.elements.speedInput.value = this.elements.speedRange.value;
        this.elements.speedRange.value = this.elements.speedInput.value;
    }

    destroy() {
        try {
            this.clearPerformanceData();

            // Cleanup visualizers
            [this.sortingVisualizer, this.algorithmAnalytics].forEach(visualizer => {
                if (visualizer?.destroy) {
                    visualizer.destroy();
                }
            });

            // Cleanup event listeners
            const handlers = this.getEventHandlers();
            this.removeEventListeners(handlers);

            // Cleanup state
            this.state = null;
            this.elements = null;
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    getEventHandlers() {
        return {
            generateNewArray: () => this.generateNewArray(),
            startSorting: () => this.startSorting(),
            handleSizeChange: () => this.handleSizeChange(),
            handleSpeedChange: () => this.handleSpeedChange(),
            resetToInitialArray: () => this.resetToInitialArray()
        };
    }

    removeEventListeners(handlers) {
        const bindings = [
            [this.elements.newArrayButton, 'click', handlers.generateNewArray],
            [this.elements.startButton, 'click', handlers.startSorting],
            [this.elements.sizeRange, 'input', handlers.handleSizeChange],
            [this.elements.sizeInput, 'input', handlers.handleSizeChange],
            [this.elements.speedRange, 'input', handlers.handleSpeedChange],
            [this.elements.speedInput, 'input', handlers.handleSpeedChange],
            [this.elements.resetArrayButton, 'click', handlers.resetToInitialArray]
        ];

        bindings.forEach(([element, event, handler]) => {
            if (element) {
                element.removeEventListener(event, handler);
            }
        });
    }

    toggleControls(enabled) {
        Object.entries({
            algorithmSelect: enabled,
            sizeInput: enabled,
            speedInput: enabled,
            sizeRange: enabled,
            newArrayButton: enabled,
            speedRange: enabled,
            startButton: enabled
        }).forEach(([key, value]) => {
            this.elements[key].disabled = !value;
        });
        this.elements.resetArrayButton.disabled = !enabled;
        this.elements.startButton.textContent = enabled ? 'Iniciar Ordenação' : 'Ordenando...';
    }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    try {
        new SortingApp();
    } catch (error) {
        console.error('Failed to initialize SortingApp:', error);
    }
});
