export async function bucketSort(arr, onUpdate, onCompare, delay) {
    const n = arr.length;
    if (n === 0) return arr;

    // Encontrar o valor máximo e mínimo no array
    const max = Math.max(...arr) || 0;
    const min = Math.min(...arr) || 0;

    // Determinar o número de buckets (heurística: raiz quadrada do tamanho do array)
    const bucketCount = Math.floor(Math.sqrt(n)) || 1;
    const bucketSize = Math.ceil((max - min + 1) / bucketCount);

    // Inicializar os buckets
    const buckets = Array.from({ length: bucketCount }, () => []);

    /**
     * Distribuir os elementos nos buckets.
     */
    for (let i = 0; i < n; i++) {
        const bucketIndex = Math.floor((arr[i] - min) / bucketSize);
        const correctBucket = bucketIndex >= bucketCount ? bucketCount - 1 : bucketIndex;
        buckets[correctBucket].push(arr[i]);

        // Atualizar os buckets no gráfico
        await onUpdate([...arr], [], buckets.flat());
        await new Promise(resolve => setTimeout(resolve, delay / 2));
    }

    /**
     * Ordenar cada bucket individualmente usando Insertion Sort.
     */
    let index = 0; // Índice para o array principal
    for (let i = 0; i < bucketCount; i++) {
        const bucket = buckets[i];

        // Ordenar o bucket usando Insertion Sort
        for (let j = 1; j < bucket.length; j++) {
            const key = bucket[j];
            let k = j - 1;

            while (k >= 0 && bucket[k] > key) {
                await onCompare([k, j], [k]); // Destacar elementos sendo comparados
                bucket[k + 1] = bucket[k];
                await onUpdate([...arr], [], buckets.flat());
                await new Promise(resolve => setTimeout(resolve, delay / 2));
                k--;
            }

            bucket[k + 1] = key;
            await onUpdate([...arr], [], buckets.flat());
            await new Promise(resolve => setTimeout(resolve, delay / 2));
        }

        // Concatenar os elementos do bucket ordenado de volta ao array principal
        for (let j = 0; j < bucket.length; j++) {
            arr[index++] = bucket[j];
            await onUpdate([...arr], [index - 1], []); // Mostrar a posição atualizada no array principal
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // Passada final: destacar todos os elementos como ordenados
    await onUpdate([...arr], [], Array.from({ length: n }, (_, i) => i));

    return arr;
}
