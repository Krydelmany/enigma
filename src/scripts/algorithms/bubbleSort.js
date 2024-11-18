// src/scripts/algorithms/bubbleSort.js

export async function bubbleSort(arr, onUpdate, onCompare, delay) {
    let n = arr.length;
    let swapped;
    let lastSorted = n;
    let swapCount = 0;

    do {
        swapped = false;

        for (let j = 0; j < lastSorted - 1; j++) {
            await onCompare([j, j + 1], []);

            if (arr[j] > arr[j + 1]) {
                // Swap elements
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
                swapCount++; // Increment swap counter

                await onUpdate([...arr], [j, j + 1], []);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                await onUpdate([...arr], [], []);
            }
        }

        lastSorted--;
    } while (swapped);

    // Final update to highlight sorted elements
    await onUpdate([...arr], [], Array.from({ length: n }, (_, i) => i));

    // Return both the sorted array and swap count
    return { sortedArray: arr, swapCount };
}
