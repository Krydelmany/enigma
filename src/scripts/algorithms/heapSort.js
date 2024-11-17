// src/scripts/algorithms/heapSort.js

export async function heapSort(arr, onUpdate, onCompare, delay) {
    const n = arr.length;

    /**
     * Função para reorganizar um subarray em um heap máximo.
     * @param {number} n - Tamanho do heap.
     * @param {number} i - Índice do nó atual.
     */
    async function heapify(n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n) {
            await onCompare([left, largest], [largest]);
            if (arr[left] > arr[largest]) {
                largest = left;
            }
        }

        if (right < n) {
            await onCompare([right, largest], [largest]);
            if (arr[right] > arr[largest]) {
                largest = right;
            }
        }

        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            await onUpdate([...arr], [i, largest], []);
            await new Promise(resolve => setTimeout(resolve, delay));

            await heapify(n, largest);
        }
    }

    // Constrói o heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(n, i);
    }

    // Extrai os elementos do heap
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        await onUpdate([...arr], [0, i], []);
        await new Promise(resolve => setTimeout(resolve, delay));

        await heapify(i, 0);
    }

    // Passada final
    await onUpdate([...arr], [], Array.from({ length: n }, (_, i) => i));

    return arr;
}
