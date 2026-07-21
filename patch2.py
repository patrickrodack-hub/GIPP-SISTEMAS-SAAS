import re

with open('src/components/ModuleGippPlanilhas.tsx', 'r') as f:
    content = f.read()

# Add state for formula suggestion
content = content.replace('const [isFullscreen, setIsFullscreen] = useState(false);', '''const [isFullscreen, setIsFullscreen] = useState(false);
  const [formulaSuggestion, setFormulaSuggestion] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<{r: number, c: number} | null>(null);

  useEffect(() => {
    const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        if (target && target.tagName === 'DIV' && target.getAttribute('contenteditable') === 'true') {
            const text = target.textContent || '';
            if (text.startsWith('=')) {
                const upperText = text.toUpperCase();
                if (upperText.includes('SO')) setFormulaSuggestion('SOMA(valor1, [valor2], ...) - Soma os valores');
                else if (upperText.includes('MÉ') || upperText.includes('ME')) setFormulaSuggestion('MÉDIA(valor1, [valor2], ...) - Retorna a média');
                else if (upperText.includes('SE')) setFormulaSuggestion('SE(teste_lógico; valor_se_verdadeiro; valor_se_falso)');
                else if (upperText.includes('PROCV')) setFormulaSuggestion('PROCV(valor_procurado; matriz_tabela; num_indice_coluna; [procurar_intervalo])');
                else setFormulaSuggestion('Funções comuns: SOMA, MÉDIA, SE, PROCV');
            } else {
                setFormulaSuggestion(null);
            }
        }
    };
    
    document.addEventListener('input', handleInput, true);
    return () => document.removeEventListener('input', handleInput, true);
  }, []);
''')

# Add UI for formula suggestion
suggestion_ui = '''
      {/* Formula Suggestion Bar */}
      {formulaSuggestion && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 flex items-center shrink-0">
            <span className="text-emerald-700 font-semibold text-xs mr-2">Dica de Fórmula:</span>
            <span className="text-emerald-600 text-xs font-mono">{formulaSuggestion}</span>
        </div>
      )}
      
      {/* FortuneSheet Container */}
'''

content = content.replace('{/* FortuneSheet Container */}', suggestion_ui)

with open('src/components/ModuleGippPlanilhas.tsx', 'w') as f:
    f.write(content)

