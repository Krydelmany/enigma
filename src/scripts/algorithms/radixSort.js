// src/scripts/algorithms/radixSort.js

export async function radixSort(arr, onUpdate, onCompare, delay) {
    const n = arr.length;
    if (n === 0) return arr;

    // Encontrar o valor máximo no array para determinar o número de dígitos
    const max = Math.max(...arr) || 0;

    /**
     * Função para realizar a ordenação Counting Sort por dígito.
     * @param {number} exp - A posição do dígito (1, 10, 100, ...)
     */
    async function countingSortByDigit(arr, exp) {
        const output = new Array(n).fill(0);
        const count = new Array(10).fill(0);

        // Contar as ocorrências dos dígitos
        for (let i = 0; i < n; i++) {
            const digit = Math.floor(arr[i] / exp) % 10;
            count[digit]++;
            await onUpdate([...arr], [], [i]); // Destacar o elemento sendo contado
            await new Promise(resolve => setTimeout(resolve, delay / 2));
        }

        // Modificar o array de contagem para armazenar posições
        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
            await onUpdate([...count], [], [i]); // Destacar a posição atual no array de contagem
            await new Promise(resolve => setTimeout(resolve, delay / 2));
        }

        // Construir o array de saída
        for (let i = n - 1; i >= 0; i--) {
            const digit = Math.floor(arr[i] / exp) % 10;
            output[count[digit] - 1] = arr[i];
            count[digit]--;
            await onUpdate([...output], [count[digit]], [arr[i]]); // Destacar a colocação no array de saída
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Copiar o array de saída para o array original
        for (let i = 0; i < n; i++) {
            arr[i] = output[i];
            await onUpdate([...arr], [i], []); // Atualizar o array principal
            await new Promise(resolve => setTimeout(resolve, delay / 2));
        }
    }

    // Iterar sobre cada dígito (unidades, dezenas, centenas, ...)
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        await countingSortByDigit(arr, exp);
    }

    // Passada final: destacar todos os elementos como ordenados
    await onUpdate([...arr], [], Array.from({ length: n }, (_, i) => i));

    return arr;
}
