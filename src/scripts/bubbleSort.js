export default {
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
};
