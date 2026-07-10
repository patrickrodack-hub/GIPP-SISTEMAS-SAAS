const fs = require('fs');
const file = 'src/components/ModuleChangelog.tsx';
let content = fs.readFileSync(file, 'utf8');

const newVersion = `            {/* NOVO BLOCO ADICIONADO PARA VERSÃO 8.9.0 */}
            <div className="relative pl-8 border-l-2 border-amber-500 animate-entrance"> 
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                <h3 className="font-extrabold text-lg text-amber-950 font-[Outfit]">v8.9.0 - Módulo Interativo Gamificado & Score System</h3>
                <p className="text-xs text-amber-600 font-black uppercase mb-3 tracking-wider">Julho 2026 (Atual)</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 text-sm">
                    <li><strong className="text-slate-700 font-sans font-extrabold">Módulo Interativo:</strong> Implementação completa de novos minigames no Portal do Membro ("Tetris" e "Show do Cristão"). Inclui painel direcional flutuante arrastável (drag and drop) nativo do React, suportando dispositivos móveis e desktop.</li>
                    <li><strong className="text-slate-700 font-sans font-extrabold">Gamificação Teológica:</strong> Show do Cristão estruturado nos 24 capítulos da Declaração de Fé (CPAD/CGADB) para avaliação do conhecimento com exibição de placares instantâneos.</li>
                    <li><strong className="text-slate-700 font-sans font-extrabold">Placares & LocalStorage:</strong> Pontuações centralizadas na pergunta atual ("Nível Atual vs Recorde") e tabelas fixadas (Pontuação Atual, Nível e Melhor Pontuação - "Pts") salvas localmente sem sobrecarga no servidor.</li>
                    <li><strong className="text-slate-700 font-sans font-extrabold">Integração de Planos & Permissões:</strong> Lançamento do novo pacote de permissão <code className="text-amber-700 font-bold bg-amber-50 px-1 py-0.5 rounded text-xs">access_interativo</code> em todos os planos (Básico, Standard e Avançado) e grupos de acesso de membros.</li>
                    <li><strong className="text-slate-700 font-sans font-extrabold">E-Book & Manual do Usuário:</strong> Matriz do e-book comercial e governamental do GIPP atualizada para cobrir detalhadamente as orientações de gamificação.</li>
                </ul>
            </div>
`;

content = content.replace('{/* NOVO BLOCO ADICIONADO PARA VERSÃO 8.9.0 */}', newVersion + '\n            {/* NOVO BLOCO ADICIONADO PARA VERSÃO 8.8.0 */}');

// Let's also fix the "Julho 2026 (Atual)" to "Julho 2026" on the older v8.8.0 block.
content = content.replace('<p className="text-xs text-emerald-600 font-black uppercase mb-3 tracking-wider">Julho 2026 (Atual)</p>', '<p className="text-xs text-emerald-600 font-black uppercase mb-3 tracking-wider">Julho 2026</p>');

fs.writeFileSync(file, content);
