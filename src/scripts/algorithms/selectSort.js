// src/scripts/algorithms/selectSort.js

export async function selectSort(arr, onUpdate, onCompare, delay) {
    const n = arr.length;
  
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
  
      // Encontrar o menor elemento no subarray não ordenado
      for (let j = i + 1; j < n; j++) {
        await onCompare([j, minIdx], [minIdx]); // Destacar o mínimo atual
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          await onUpdate([...arr], [], [minIdx]); // Destacar o novo mínimo
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
  
      // Trocar o menor elemento encontrado com o primeiro elemento não ordenado
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        await onUpdate([...arr], [i, minIdx], []); // Visualizar a troca
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  
    // Passada final: destacar todos os elementos como ordenados
    await onUpdate([...arr], [], Array.from({ length: n }, (_, i) => i));
  
    return arr;
  }
  