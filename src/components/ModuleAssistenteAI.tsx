import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  BookOpenText, Newspaper, Sparkles, Heart, MessageCircle, 
  Calendar, Activity, Loader2, Copy, Trash2, X, Send
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { ChurchContext } from '../context/ChurchContext';
import { Button, copyToClipboard } from '../utils/sharedHelpers';
import { callGeminiAI } from '../services/geminiService';

// Exporting component
const ModuleAssistenteAI = () => {
    const context = useContext(ChurchContext);
    const addToast = context ? context.addToast : (msg: string) => alert(msg);
    const [mode, setMode] = useState('sermon');
    const [input, setInput] = useState('');
    const [tone, setTone] = useState('inspirador');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const aiTools = [
        {
            id: 'sermon',
            label: 'Esboços de Sermões',
            desc: 'Gere esboços estruturados de pregações para cultos e conferências.',
            icon: BookOpenText,
            placeholder: 'Ex: O poder da fé e da oração perseverante em momentos de tormenta (Salmo 46:1-3)...',
            color: 'text-violet-600 bg-violet-100/50 border border-violet-200'
        },
        {
            id: 'text',
            label: 'Redator de Comunicados',
            desc: 'Mensagens cativantes para WhatsApp, circulares e comunicados gerais.',
            icon: Newspaper,
            placeholder: 'Ex: Convite especial para o Culto da Família deste domingo às 19h com foco no fortalecimento do lar...',
            color: 'text-emerald-600 bg-emerald-100/50 border border-emerald-200'
        },
        {
            id: 'ideas',
            label: 'Ideias & Eventos',
            desc: 'Temas, dinâmicas, gincanas e roteiros criativos de eventos.',
            icon: Sparkles,
            placeholder: 'Ex: Ideias criativas e temas inspiradores para o congresso geral de jovens de 3 dias no fim do ano...',
            color: 'text-amber-600 bg-amber-100/50 border border-amber-200'
        },
        {
            id: 'devotional',
            label: 'Devocionais & Células',
            desc: 'Estudos detalhados com quebra-gelo, leitura bíblica e perguntas reflexivas.',
            icon: Heart,
            placeholder: 'Ex: Estudo de célula focado em viver com integridade baseando na passagem de Josué 24:14-15...',
            color: 'text-rose-600 bg-rose-100/50 border border-rose-200'
        },
        {
            id: 'counseling',
            label: 'Apoio ao Aconselhamento',
            desc: 'Roteiros de apoio espiritual e passagens bíblicas de refrigério.',
            icon: MessageCircle,
            placeholder: 'Ex: Um roteiro de consolo e encorajamento para um membro querido lidando com luto recente...',
            color: 'text-sky-600 bg-sky-100/50 border border-sky-200'
        },
        {
            id: 'bulletin',
            label: 'Boletim & Informativo',
            desc: 'Planeje avisos litúrgicos da semana, motivos de oração e calendário.',
            icon: Calendar,
            placeholder: 'Ex: Avisos sobre a consagração de sábado de manhã, ofertas de missões e conserto do telhado...',
            color: 'text-indigo-600 bg-indigo-100/50 border border-indigo-200'
        },
        {
            id: 'financial',
            label: 'Gestão & Finanças IA',
            desc: 'Planos e campanhas de dízimos/ofertas com sensibilidade bíblica.',
            icon: Activity,
            placeholder: 'Ex: Criar uma campanha bíblica de dízimos e ofertas para a compra dos novos bancos da igreja...',
            color: 'text-fuchsia-600 bg-fuchsia-100/50 border border-fuchsia-200'
        }
    ];

    const currentTool = aiTools.find(t => t.id === mode) || aiTools[0];

    const handleGenerate = async () => {
        if (!input.trim()) return;
        setLoading(true);
        let prompt = "";
        if (mode === 'sermon') {
            prompt = `Atue como um teólogo experiente e pastor pentecostal de profunda sabedoria bíblica. Crie um esboço de sermão altamente detalhado, inspirador e estruturado sobre o tema/versículo: "${input}". Tom: ${tone}. 

Estrutura obrigatória:
1. TÍTULO CRIATIVO (impactante)
2. INTRODUÇÃO (com gancho de atenção e relevância atual)
3. VERSÍCULO BASE (leitura principal)
4. TÓPICO 1 (Título, referências de suporte e aplicação)
5. TÓPICO 2 (Título, referências de suporte e aplicação)
6. TÓPICO 3 (Título, referências de suporte e aplicação)
7. APLICAÇÃO PRÁTICA NA VIDA DO CRENTE (exemplos claros do quotidiano)
8. CONCLUSÃO & APELO DE FÉ (chamada de decisão ou reflexão profunda)

Retorne tudo em formatação Markdown elegante e fluida.`;
        } else if (mode === 'text') {
            prompt = `Atue como secretário de igreja profissional e redator de alta performance de canais digitais. Escreva um informativo primoroso para: "${input}". Contexto/Tom: ${tone}. 
Prepara para canais de WhatsApp, Boletim e Redes Sociais. Adicione emojis adequados se o tom permitir, separe em parágrafos de fácil leitura, inclua uma chamada à ação (CTA) e organize tudo em formato de mensagem muito acolhedora e clara.`;
        } else if (mode === 'ideas') {
            prompt = `Atue como um consultor e estrategista criativo para o ministério eclesiástico. Gere 5 ideias inovadoras, práticas e impactantes para: "${input}". 
Para cada ideia proposta, inclua obrigatoriamente:
- Nome Criativo da Ação
- Versículo bíblico de inspiração
- Método de Execução passo a passo
- Resultado Esperado / Impacto Espiritual no ministério.

Organize de forma legível e atraente usando formatação e espaçamento.`;
        } else if (mode === 'devotional') {
            prompt = `Atue como um líder de pequeno grupo, ministério de células ou professor da EBD. Crie um guia de estudo devocional rico para células baseado em: "${input}". Estilo/Tom teológico: ${tone}. 

Estrutura obrigatória:
- Quebra-Gelo (pergunta de introdução envolvendo e descontraída para iniciar a reunião)
- Leitura Bíblica Base (capítulo ou versículos sugeridos)
- Breve Explicação Teológica & Contexto do texto
- 3 Perguntas de Aplicação Prática para discussão em grupo (focando em vivência diária)
- Conclusão & Desafio Prático para a semana do participante
- Motivos de Oração da semana.

Use formatação Markdown elegante.`;
        } else if (mode === 'counseling') {
            prompt = `Atue como um conselheiro cristão e pastor acolhedor. Prepare um guia de aconselhamento espiritual personalizado para ajudar a lidar com a seguinte situação delicada de cuidado pastoral: "${input}". Estilo/Tom: ${tone}.

Inclua no planejamento:
- Palavra de Empatia & Acolhimento inicial
- 3 Passagens e Promessas Bíblicas explicadas sob a ótica do amor divino
- Conselhos práticos de ação pastoral para acompanhar o aconselhado
- Uma oração modelo curta e tocante para trazer refrigério ao coração.

Escreva com imensa delicadeza, sensibilidade e acolhimento em Markdown.`;
        } else if (mode === 'bulletin') {
            prompt = `Atue como design de assessoria de comunicação e liturgia da igreja. Elabore um boletim informativo completo e dinâmico com base nos seguintes dados e avisos informados: "${input}". Estilo/Tom: ${tone}.

Inclua no boletim:
- Versículo Temático do Boletim para meditação conjunta
- Agenda principal em formato visual claro (Cultos, Consagração e Células)
- Resumo dinâmico dos avisos oficiais da igreja de forma muito engajadora
- Oração intercessora da semana (motivos para orar em família)
- Palavra pastoral ou pensamento de inspiração curto.

Use formatação Markdown limpa e dividida para fácil divisão na arte visual.`;
        } else if (mode === 'financial') {
            prompt = `Atue como administrador e consultor especializado em captação ética de recursos e finanças eclesiásticas saudáveis. Planeje uma campanha, orçamento ou orientação estruturada com base em: "${input}". Estilo/Tom: ${tone}.

Forneça:
- Título Motivacional da Campanha / Ação Administrativa
- Justificativa e Fundamentação Bíblica de generosidade e mordomia
- Cronograma Prático de Execução com a liderança e membros (passos práticos)
- Sugestão de Comunicação Pública com transparência e clareza.

Retorne em formato Markdown estimulante, profissional e focado em excelência.`;
        }
        
        const response = await callGeminiAI(prompt);
        setResult(response);
        setLoading(false);
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex justify-between items-start md:items-center gap-4 flex-col md:flex-row">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                        <Sparkles size={28}/>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 text-gradient">Pastoral & Gestão IA</h2>
                        <p className="text-sm text-slate-500 font-medium">Inteligência Artificial avançada a serviço do seu ministério.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-full">
                {/* Lateral: Stack de Recursos */}
                <div className="lg:col-span-1 glass-modern p-5 rounded-[2rem] flex flex-col gap-3 max-h-[75vh] overflow-y-auto custom-scrollbar border border-slate-100">
                    <div className="px-1 py-1">
                        <span className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">Selecione o Recurso de IA</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        {aiTools.map((tool) => {
                            const ToolIcon = tool.icon;
                            const isActive = mode === tool.id;
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => {
                                        setMode(tool.id);
                                        setInput('');
                                        setResult('');
                                    }}
                                    className={`flex items-start text-left p-3.5 rounded-2xl border transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-indigo-50/70 border-indigo-300 shadow-sm ring-1 ring-indigo-300' 
                                            : 'bg-white/40 border-slate-100 hover:bg-slate-50/80 hover:border-slate-300'
                                    }`}
                                >
                                    <div className={`p-2 rounded-xl mr-3 shrink-0 ${tool.color}`}>
                                        <ToolIcon size={20} />
                                    </div>
                                    <div>
                                        <h4 className={`text-xs font-bold ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>{tool.label}</h4>
                                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{tool.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Central: Painel de Trabalho e Resultado */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Painel de Entrada */}
                    <div className="glass-modern p-6 rounded-[2rem] flex flex-col gap-4 border border-slate-100">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg text-indigo-600 bg-indigo-50`}>
                                    {React.createElement(currentTool.icon, { size: 16 })}
                                </div>
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Configurar {currentTool.label}</h3>
                            </div>
                            
                            <button
                                onClick={() => setInput(currentTool.placeholder.replace('Ex: ', ''))}
                                className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1.5 rounded-xl hover:bg-indigo-100 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                                <Sparkles size={11} />
                                Exemplo Prático
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput((e.target.value || "").toUpperCase())}
                                    className="w-full bg-white/70 border border-slate-200 focus:border-indigo-500 rounded-2xl p-4 text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none h-32 transition-colors placeholder:text-slate-400 font-medium leading-relaxed"
                                    placeholder={currentTool.placeholder}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1.5 block">Tom e Perspectiva</label>
                                    <select
                                        value={tone}
                                        onChange={(e) => setTone((e.target.value || "").toUpperCase())}
                                        className="w-full bg-white/70 border border-slate-200 focus:border-indigo-500 rounded-2xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 outline-none appearance-none cursor-pointer font-semibold text-slate-700"
                                    >
                                        <option value="inspirador">Inspirador & Acolhedor</option>
                                        <option value="teologico">Teológico & Reformado</option>
                                        <option value="evangelistico">Evangelístico (Apelo Direto)</option>
                                        <option value="formal">Formal & Administrativo</option>
                                        <option value="jovem">Dinâmico & Descontraído</option>
                                        <option value="infantil">Linguagem Simplificada (EBD Infantil)</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={loading || !input.trim()}
                                        variant="primary"
                                        className="w-full py-3 h-[42px] font-bold text-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-2xl shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} 
                                        {loading ? 'Consultando IA...' : 'Gerar com Inteligência Artificial'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resultado */}
                    <div className="glass-modern p-6 rounded-[2rem] flex flex-col min-h-[300px] justify-center relative border border-slate-100 overflow-hidden">
                        {!result && !loading && (
                            <div className="flex flex-col items-center justify-center text-slate-400 opacity-60 p-12 text-center animate-pulse">
                                <Sparkles size={48} className="mb-3 text-indigo-300"/>
                                <h4 className="font-bold text-slate-600 text-sm">Pronto para Gerar</h4>
                                <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-relaxed">Insira os termos que você quer processar na caixa acima ou preencha o exemplo prático para receber as diretrizes organizadas pela IA.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-10 p-6 text-center">
                                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                <h4 className="font-black text-indigo-900 text-sm">Processando Recursos Teológicos</h4>
                                <p className="text-[10px] text-indigo-600/70 font-semibold animate-pulse uppercase tracking-wider mt-1">Isso pode levar alguns segundos...</p>
                            </div>
                        )}

                        {result && (
                            <div className="flex flex-col h-full animate-entrance">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <h3 className="font-bold text-xs uppercase tracking-wide text-slate-700">Resultado Gerado com Sucesso</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => { copyToClipboard(result); addToast("Copiado!", "success"); }} 
                                            className="p-2 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-xl transition-all active:scale-90 flex items-center gap-1.5 text-[10px] font-bold border border-slate-100 bg-white" 
                                            title="Copiar texto"
                                        >
                                            <Copy size={13}/>
                                            Copiar
                                        </button>
                                        <button 
                                            onClick={() => setResult('')} 
                                            className="p-2 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all active:scale-90 flex items-center gap-1.5 text-[10px] font-bold border border-slate-100 bg-white" 
                                            title="Limpar resultado"
                                        >
                                            <Trash2 size={13}/>
                                            Limpar
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar bg-slate-50/50 p-5 rounded-2xl border border-slate-200/50 select-text">
                                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap font-medium leading-relaxed font-sans">{result}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { FloatingChatWidget } from './FloatingChatWidget';
export default ModuleAssistenteAI;
