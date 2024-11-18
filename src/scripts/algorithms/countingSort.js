// src/scripts/algorithms/countingSort.js

export async function countingSort(arr, onUpdate, onCompare, delay) {
    let n = arr.length;

    // Encontrar o valor máximo no array
    let max = Math.max(...arr) || 0;

    // Inicializar o array de contagem
    let count = new Array(max + 1).fill(0);

    /**
     * Contar as ocorrências de cada elemento.
     */
    for (let i = 0; i < n; i++) {
        count[arr[i]]++;
        await onUpdate([...arr], [], [i]); // Destacar o elemento sendo contado
        await new Promise(resolve => setTimeout(resolve, delay / 2));
    }

    // Modificar o array de contagem para armazenar posições
    for (let i = 1; i <= max; i++) {
        count[i] += count[i - 1];
        await onUpdate([...count], [], [i]); // Destacar a posição atual no array de contagem
        await new Promise(resolve => setTimeout(resolve, delay / 2));
    }

    // Construir o array de saída
    let output = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        let current = arr[i];
        output[count[current] - 1] = current;
        count[current]--;
        await onUpdate([...output], [count[current]], [current]); // Destacar a colocação no array de saída
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Copiar o array de saída para o array original
    for (let i = 0; i < n; i++) {
        arr[i] = output[i];
        await onUpdate([...arr], [i], []); // Atualizar o array principal
        await new Promise(resolve => setTimeout(resolve, delay / 2));
    }

    // Passada final: destacar todos os elementos como ordenados
    await onUpdate([...arr], [], Array.from({ length: n }, (_, i) => i));

    return arr;
}
