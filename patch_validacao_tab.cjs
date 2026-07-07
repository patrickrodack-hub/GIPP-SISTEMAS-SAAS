const fs = require('fs');
let data = fs.readFileSync('src/components/ModuleTeologia.tsx', 'utf8');

const validacaoContent = `
            {activeTab === 'validacao' && (
                <div className="space-y-6 pt-4 animate-slideUp font-sans text-left">
                    <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-0"></div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-3xl font-black mb-3 flex items-center gap-3">
                                <Sparkles className="text-amber-400" size={32} />
                                Validação Doutrinária com IA
                            </h2>
                            <p className="text-indigo-100 text-sm leading-relaxed">
                                Este painel exclusivo utiliza a Inteligência Artificial para analisar automaticamente as <strong>Lições da EBD</strong> cadastradas no sistema, 
                                comparando o conteúdo com a base de conhecimento dogmática oficial da <strong>Declaração de Fé da CGADB/CPAD</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {(db?.ebd?.licoes || []).map((licao: any, index: number) => (
                            <div key={licao.id || index} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
                                <h3 className="font-bold text-slate-800 text-lg mb-1 leading-tight">{licao.revista || 'Revista Sem Título'}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-4">Lição {licao.licao_numero || index + 1}</p>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="text-sm text-slate-600 line-clamp-3">
                                        {licao.conteudo_estudo ? String(licao.conteudo_estudo).substring(0, 150) + '...' : 'Nenhum conteúdo detalhado disponível.'}
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={async (e) => {
                                        const btn = e.currentTarget;
                                        const originalText = btn.innerHTML;
                                        btn.innerHTML = '<span class="flex items-center gap-2"><svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Analisando...</span>';
                                        btn.disabled = true;
                                        
                                        try {
                                            const response = await fetch('/api/gemini/analisar-ebd', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    prompt: "Analise esta lição da EBD e verifique sua conformidade com a Declaração de Fé da CGADB. Lição: " + JSON.stringify(licao) + ". Retorne JSON com: { conformidade: number (0 a 100), status: 'Aprovado' | 'Revisão Necessária', pontos_revisao: string[], justificativa: string }."
                                                })
                                            });
                                            const resData = await response.json();
                                            let jsonStr = resData.text;
                                            if (jsonStr.includes('\`\`\`json')) {
                                                jsonStr = jsonStr.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
                                            }
                                            const parsed = JSON.parse(jsonStr);
                                            
                                            alert("Status: " + parsed.status + "\\nConformidade: " + parsed.conformidade + "%\\nJustificativa: " + parsed.justificativa);
                                            
                                        } catch(err) {
                                            alert('Erro ao analisar lição.');
                                        } finally {
                                            btn.innerHTML = originalText;
                                            btn.disabled = false;
                                        }
                                    }}
                                    className="w-full bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 font-bold py-2.5 rounded-xl text-sm transition-colors flex justify-center items-center gap-2"
                                >
                                    <Sparkles size={16} /> Validar Ortodoxia
                                </button>
                            </div>
                        ))}
                        
                        {(db?.ebd?.licoes || []).length === 0 && (
                            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <BookOpen className="mx-auto mb-3 opacity-50" size={32} />
                                <p className="font-medium">Nenhuma lição da EBD cadastrada no sistema.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
`;

const lines = data.split('\n');
const insertIndex = lines.findIndex(line => line.includes("{activeTab === 'diretoria' && ("));
if (insertIndex > -1) {
    // Find the end of 'diretoria'
    let endIdx = insertIndex;
    let openBrackets = 0;
    let started = false;
    
    for (let i = insertIndex; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('{')) { openBrackets += (line.match(/\{/g) || []).length; started = true; }
        if (line.includes('}')) { openBrackets -= (line.match(/\}/g) || []).length; }
        
        if (started && openBrackets <= 0) {
            endIdx = i;
            break;
        }
    }
    
    lines.splice(endIdx + 1, 0, validacaoContent);
    fs.writeFileSync('src/components/ModuleTeologia.tsx', lines.join('\n'), 'utf8');
    console.log("Patched validacao tab content");
} else {
    console.log("Could not find diretoria tab content");
}
