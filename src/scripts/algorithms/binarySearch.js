// binarySearch.js

import { updateVisualization, highlightIndices } from '../../renderer.js';

export async function binarySearch(array, target, onCompare, onUpdate) {
    const result = { found: false, index: -1, totalComparisons: 0 };
    let left = 0;
    let right = array.length - 1;
    
    if (!isSorted(array)) {
        throw new Error('Array must be sorted for binary search');
    }

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        result.totalComparisons++;

        // Highlight the current search area
        await highlightIndices([left, mid, right], 'highlight');
        await onCompare([mid]);

        if (array[mid] === target) {
            result.found = true;
            result.index = mid;
            await onUpdate([mid], 'found');
            return result;
        }

        if (array[mid] < target) {
            left = mid + 1;
            await onUpdate([...Array(mid + 1).keys()], 'discarded');
        } else {
            right = mid - 1;
            await onUpdate([...Array(array.length).keys()].slice(mid), 'discarded');
        }
    }
    
    return result;
}

function isSorted(array) {
    for (let i = 1; i < array.length; i++) {
        if (array[i] < array[i - 1]) return false;
    }
    return true;
}
