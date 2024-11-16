import createComparisonChart from '../charts/createComparisonChart.js';

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

        const algorithmStats = this.stats.reduce((acc, stat) => { 
            if (!acc[stat.algorithm]) acc[stat.algorithm] = [];
            acc[stat.algorithm].push(stat);
            return acc;
        }, {});

        await createComparisonChart(statsSection, algorithmStats);
    }
};

export default statsManager;
