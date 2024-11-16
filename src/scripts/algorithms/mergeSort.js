// src/scripts/algorithms/mergeSort.js

export async function mergeSort(arr, onUpdate, onCompare, delay) {
    let n = arr.length;
    let tempArray = new Array(n); // Array auxiliar para reduzir alocações de memória

    /**
     * Função para mesclar duas sublistas.
     * @param {number} l - Índice inicial.
     * @param {number} m - Índice do meio.
     * @param {number} r - Índice final.
     */
    async function merge(l, m, r) {
        // Copiar para o array temporário
        for (let i = l; i <= r; i++) {
            tempArray[i] = arr[i];
            await onUpdate([...arr], [], [i]); // Destacar o elemento atual sendo copiado
            await new Promise(resolve => setTimeout(resolve, delay / 4));
        }

        let i = l;
        let j = m + 1;
        let k = l;

        while (i <= m && j <= r) {
            await onCompare([i, j], [i]); // Destacar i como especial

            if (tempArray[i] <= tempArray[j]) {
                arr[k] = tempArray[i];
                i++;
            } else {
                arr[k] = tempArray[j];
                j++;
            }

            await onUpdate([...arr], [k], []); // Destacar k como swapped
            k++;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        while (i <= m) {
            arr[k] = tempArray[i];
            await onUpdate([...arr], [k], []);
            i++;
            k++;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        while (j <= r) {
            arr[k] = tempArray[j];
            await onUpdate([...arr], [k], []);
            j++;
            k++;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    /**
     * Função auxiliar para realizar o Merge Sort.
     * @param {number} l - Índice inicial.
     * @param {number} r - Índice final.
     */
    async function mergeSortHelper(l, r) {
        if (l < r) {
            const m = Math.floor((l + r) / 2);
            await mergeSortHelper(l, m);
            await mergeSortHelper(m + 1, r);
            await merge(l, m, r);
        }
    }

    await mergeSortHelper(0, n - 1);

    // Passada final: destacar todos os elementos como ordenados
    await onUpdate([...arr], [], Array.from({ length: n }, (_, i) => i));

    return arr;
}
