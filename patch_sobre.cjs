const fs = require('fs');
const file = 'src/components/ModuleSobre.tsx';
let content = fs.readFileSync(file, 'utf8');

const newApiSection = `
            {/* INFORMAÇÕES DAS APIs (v8.9.0) */}
            <div className="mt-6 mb-8">
                <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-3">
                    <div className="bg-indigo-100 p-2 rounded-xl border border-indigo-200">
                        <Code size={20} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 font-[Outfit] tracking-tight">APIs, Integrações & Serviços em Nuvem</h3>
                        <p className="text-sm font-bold text-slate-500">Ecossistema de Inteligência Artificial e Data Storage do GIPP.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Gemini API */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <Sparkles size={24} className="text-purple-600" />
                            <h4 className="font-extrabold text-slate-800">Google Gen AI (Gemini)</h4>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mb-3">API de LLM utilizada para processamento de linguagem natural (Assistente Mary), geração de resumos, lições EBD e auditoria inteligente. Substitui SDKs legados por <code className="bg-slate-100 px-1 rounded text-pink-600">@google/genai</code>.</p>
                        <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-1 rounded-md border border-purple-200">Status: Integrado & Ativo</span>
                    </div>

                    {/* Firebase API */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <Database size={24} className="text-amber-500" />
                            <h4 className="font-extrabold text-slate-800">Firebase Firestore</h4>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mb-3">API nativa do Firebase (NoSQL) provendo realtime database, autenticação multi-fator e persistência híbrida. Escala horizontal e regras de segurança (Firestore Rules).</p>
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-200">Status: Ativo (Serverless)</span>
                    </div>

                    {/* APIs Auxiliares */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <Layers size={24} className="text-emerald-600" />
                            <h4 className="font-extrabold text-slate-800">Web Storage & PWA</h4>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mb-3">APIs de navegador como IndexedDB para cache ultrarrápido, LocalStorage para persistência de gamificação e Service Workers (PWA) para notificações Push Nativas.</p>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-200">Status: Sincronizado</span>
                    </div>
                </div>
            </div>
`;

content = content.replace('{/* Stack List */}', newApiSection + '\n                    {/* Stack List */}');

fs.writeFileSync(file, content);
