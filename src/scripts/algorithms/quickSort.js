// src/scripts/algorithms/quickSort.js

export async function quickSort(arr, onUpdate, onCompare, delay) {
    let n = arr.length;

    /**
     * Função para escolher o pivô usando a técnica "median-of-three".
     * @param {number} low - Índice inicial.
     * @param {number} high - Índice final.
     * @returns {number} - Índice do pivô escolhido.
     */
    async function choosePivot(low, high) {
        const mid = Math.floor((low + high) / 2);
        const a = arr[low];
        const b = arr[mid];
        const c = arr[high];

        // Chamar onCompare para destacar os três candidatos a pivô
        await onCompare([low, mid, high], [mid]); // Destacar mid como especial

        // Retornar o índice do valor mediano
        if (a <= b && b <= c) return mid;
        if (c <= b && b <= a) return mid;
        if (b <= a && a <= c) return low;
        if (c <= a && a <= b) return low;
        return high;
    }

    /**
     * Função de particionamento do Quick Sort.
     * @param {number} low - Índice inicial.
     * @param {number} high - Índice final.
     * @returns {number} - Índice do pivô após particionamento.
     */
    async function partition(low, high) {
        let pivotIndex = await choosePivot(low, high);
        if (pivotIndex !== high) {
            [arr[pivotIndex], arr[high]] = [arr[high], arr[pivotIndex]];
            await onUpdate([...arr], [pivotIndex, high]); // Destacar troca de pivô
        }

        let pivot = arr[high];
        let i = low - 1;

        // Destacar o intervalo da partição
        let partitionIndices = Array.from({ length: high - low + 1 }, (_, idx) => low + idx);
        await onUpdate([...arr], [], partitionIndices);
        await new Promise(resolve => setTimeout(resolve, delay));

        for (let j = low; j < high; j++) {
            await onCompare([j, high], [j]); // Destacar j como especial
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                await onUpdate([...arr], [i, j]); // Destacar troca
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        await onUpdate([...arr], [i + 1, high]); // Destacar troca de pivô
        await new Promise(resolve => setTimeout(resolve, delay));

        return i + 1;
    }

    /**
     * Função auxiliar para realizar o Quick Sort.
     * @param {number} low - Índice inicial.
     * @param {number} high - Índice final.
     */
    async function quickSortHelper(low, high) {
        if (low < high) {
            let pi = await partition(low, high);
            await quickSortHelper(low, pi - 1);
            await quickSortHelper(pi + 1, high);
        }
    }

    await quickSortHelper(0, n - 1);

    // Passada final: destacar todos os elementos como ordenados
    await onUpdate([...arr], [], Array.from({ length: n }, (_, i) => i));

    return arr;
}
