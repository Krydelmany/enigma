// src/scripts/algorithms/insertSort.js

export async function insertSort(arr, onUpdate, onCompare, delay) {
    let n = arr.length;

    // Loop principal para percorrer cada elemento
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;

        // Destaque o elemento atual que está sendo inserido
        await onUpdate([...arr], [], [i]);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Comparar o elemento atual com os anteriores e movê-los se necessário
        while (j >= 0 && arr[j] > key) {
            await onCompare([j, j + 1]); // Comparar j com j+1
            arr[j + 1] = arr[j]; // Mover elemento maior para a direita
            j--;

            // Atualizar visualmente a movimentação
            await onUpdate([...arr], [j + 1, j + 2]);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Inserir o elemento na posição correta
        arr[j + 1] = key;
        await onUpdate([...arr], [], [j + 1]);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Passada final: destacar todos os elementos como ordenados
    await onUpdate([...arr], [], Array.from({ length: n }, (_, i) => i));
    return arr;
}
