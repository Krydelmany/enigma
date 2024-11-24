// linearSearch.js

import { updateVisualization, highlightIndices } from '../../renderer.js';

export async function linearSearch(array, target, onCompare, onUpdate) {
    const result = { found: false, index: -1, totalComparisons: 0 };
    
    for (let i = 0; i < array.length; i++) {
        result.totalComparisons++;
        await highlightIndices([i], 'highlight');
        await onCompare([i]);
        
        if (array[i] === target) {
            result.found = true;
            result.index = i;
            await onUpdate([i], 'found');
            await updateVisualization(array, result); // Adiciona atualização da visualização
            return result;
        }
        
        // Atualiza visualização com elementos já verificados
        await onUpdate([i], 'checked');
        await updateVisualization(array, result); // Adiciona atualização da visualização
    }
    
    await updateVisualization(array, result); // Atualiza visualização no final da busca
    return result;
}
