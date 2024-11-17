// src/scripts/algorithms/shellSort.js

export async function shellSort(arr, onUpdate, onCompare, delay) {
    const n = arr.length;
    let gap = Math.floor(n / 2);
  
    while (gap > 0) {
      for (let i = gap; i < n; i++) {
        let temp = arr[i];
        let j = i;
  
        while (j >= gap) {
          await onCompare([j - gap, j], [j]); // Destaca o elemento atual
          if (arr[j - gap] > temp) {
            arr[j] = arr[j - gap];
            await onUpdate([...arr], [j, j - gap], []);
            await new Promise(resolve => setTimeout(resolve, delay));
            j -= gap;
          } else {
            break;
          }
        }
  
        arr[j] = temp;
        await onUpdate([...arr], [j], []);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      gap = Math.floor(gap / 2);
    }
  
    // Passada final: destacar todos os elementos como ordenados
    await onUpdate([...arr], [], Array.from({ length: n }, (_, i) => i));
  
    return arr;
  }
  