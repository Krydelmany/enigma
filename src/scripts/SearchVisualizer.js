import { SortingVisualizer } from './chart'; // Ajuste o caminho conforme necessário

class SearchVisualizer extends SortingVisualizer {
    constructor(containerId, options = {}) {
        super(containerId, {
            ...options,
            barColors: {
                default: 'var(--bar-color, #4285f4)',
                highlight: 'var(--highlight-color, #f4b400)',
                found: 'var(--special-color, #0f9d58)',
                discarded: 'var(--control-border, #ccc)'
            }
        });
    }

    update(data, highlightIndices = [], foundIndex = -1, discardedIndices = []) {
        // Chama o método update da classe pai com os parâmetros adaptados
        super.update(data, highlightIndices, [], [], true);

        // Adiciona classes específicas para busca
        const bars = this.svg.selectAll('.bar');
        
        bars
            .classed('found', (d, i) => i === foundIndex)
            .classed('highlight', (d, i) => highlightIndices.includes(i))
            .classed('discarded', (d, i) => discardedIndices.includes(i));

        // Atualiza os estilos CSS inline
        bars.style('fill', function() {
            if (this.classList.contains('found')) return 'var(--special-color, #0f9d58)';
            if (this.classList.contains('highlight')) return 'var(--highlight-color, #f4b400)';
            if (this.classList.contains('discarded')) return 'var(--control-border, #ccc)';
            return 'var(--bar-color, #4285f4)';
        });
    }
}

export default SearchVisualizer;
