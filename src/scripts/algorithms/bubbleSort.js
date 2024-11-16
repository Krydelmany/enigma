// src/scripts/algorithms/bubbleSort.js

export async function bubbleSort(arr, onUpdate, onCompare, delay) {
    let n = arr.length;
    let swapped;
    let lastSorted = n; // Mantém o limite do último elemento ordenado

    do {
        swapped = false;

        for (let j = 0; j < lastSorted - 1; j++) {
            const minIndex = arr[j] < arr[j + 1] ? j : j + 1;

            // Chamar onCompare com índices comparados e minIndex como specialIndices
            await onCompare([j, j + 1], [minIndex]);

            if (arr[j] > arr[j + 1]) {
                // Trocar se necessário
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;

                // Chamar onUpdate com swappingIndices
                await onUpdate([...arr], [j, j + 1]);
            } else {
                // Chamar onUpdate sem swappingIndices
                await onUpdate([...arr]);
            }
        }

        lastSorted--;
    } while (swapped);

    // Passada final: destacar todos os elementos como ordenados
    await onUpdate([...arr], [], Array.from({ length: n }, (_, i) => i));

    return arr;
}
