const fs = require('fs');
const file = 'src/components/ModuleChangelog.tsx';
let content = fs.readFileSync(file, 'utf8');

const newVersion = `            {/* RELEASE v8.9.0 */}
            <div className="relative pl-8 md:pl-0">
              <div className="md:hidden absolute left-0 top-1.5 w-3 h-3 bg-indigo-500 rounded-full ring-4 ring-indigo-50 shadow-sm z-10"></div>
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-transparent opacity-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 font-bold text-xs rounded-full uppercase tracking-wider mb-3">Versão Atual</span>
                    <h3 className="font-extrabold text-lg text-indigo-950 font-[Outfit]">v8.9.0 - Módulo Interativo Gamificado, Relatórios de Score & Extensão do E-Book</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 self-start">
                    <Calendar size={14} className="text-indigo-500" />
                    <span>Julho 2026</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5 ring-2 ring-white">
                      <Gamepad2 size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1 text-sm">Módulo Interativo & Gamificação</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Implementação do novo Módulo Interativo contendo os minigames "Tetris" e "Show do Cristão". Inclui suporte a painel direcional móvel flutuante com movimentação livre (drag and drop), sistema de pontuação persistente via LocalStorage e tabelas de premiação dinâmicas (exibição de registros centralizados na pergunta atual).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 ring-2 ring-white">
                      <BookOpen size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1 text-sm">Expansão do Manual do Usuário e E-Book</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Atualização completa do manual do sistema englobando as novas funcionalidades de gamificação, matriz de recursos atualizada, e guias de uso do painel móvel.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 ring-2 ring-white">
                      <Shield size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1 text-sm">Governança & Permissões</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        Adicionado o pacote de acesso "interativo" nos planos do sistema e atualizada a gestão de usuários com permissões específicas para os módulos de jogos e revistas interativas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

`;

content = content.replace('{/* TIMELINE ITEMS */}', '{/* TIMELINE ITEMS */}\n' + newVersion);
content = content.replace("import {", "import { Gamepad2,");

fs.writeFileSync(file, content);
