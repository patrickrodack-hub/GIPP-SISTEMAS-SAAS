import React, { useState } from 'react';
import { X, BookOpen, Settings, Shield, Info, HelpCircle, FileText, MonitorPlay, ExternalLink, Sliders, Palette } from 'lucide-react';

interface ModuleManualProps {
    activeModuleId: string;
    activeModuleLabel: string;
    activeModuleIcon: React.ComponentType<any>;
    activeModuleColor: string;
    theme: string;
    onClose: () => void;
    setView: (view: string) => void;
}

export const Win11PropertiesModal: React.FC<ModuleManualProps> = ({
    activeModuleId,
    activeModuleLabel,
    activeModuleIcon: IconComp,
    activeModuleColor,
    theme,
    onClose,
    setView
}) => {
    const [activeTab, setActiveTab] = useState<'geral' | 'manual' | 'seguranca'>('geral');
    const isLight = theme === 'light';

    const getModuleProperties = (id: string) => {
        switch (id) {
            case 'curso_teologia':
                return {
                    description: "Universidade Teológica GIPP - Sistema de ensino acadêmico e dogmático integrado.",
                    category: "Educação & Teologia",
                    version: "v2.5",
                    permissions: "Acesso Geral / Aluno / Professor",
                    quickManual: [
                        "Doutrina Oficial: Conteúdo 100% alinhado com a Declaração de Fé das Assembleias de Deus (CGADB/CPAD).",
                        "Níveis Disponíveis: Básico (Introdução às Escrituras e Teontologia), Médio (Soteriologia e Distintivos Pentecostais) e Avançado (Escatologia Bíblica e Eclesiologia).",
                        "Estudo de Apostilas: Navegue pelos módulos, estude o conteúdo estruturado em tópicos e referências bíblicas exegéticas.",
                        "Quizzes de Fixação: Responda as perguntas no final de cada lição para testar seu conhecimento e registrar sua aprovação."
                    ],
                    doctrinalNote: "Bibliologia (Cap. 1), Trindade (Cap. 2/3), Pneumatologia (Cap. 6) e Distintivos Pentecostais com evidência de falar em línguas (Cap. 19/20)."
                };
            case 'fin_entrada':
            case 'fin_saida':
            case 'fin_dre':
                return {
                    description: "Módulos de Gestão Financeira Paroquial, Fluxo de Caixa, DRE e Conciliação Bancária.",
                    category: "Administração & Finanças",
                    version: "v4.1",
                    permissions: "Tesoureiro / Administrador / Pastor Sede",
                    quickManual: [
                        "Lançamento de Entradas: Registre Dízimos, Ofertas Gerais, Carnês de Campanhas e contribuições com categorização automática.",
                        "Controle de Despesas: Monitore saídas, faturas, folhas de pagamento e custos operacionais de filiais.",
                        "Balanço e DRE: Gere demonstrativos de resultados de exercício detalhados e filtre por período ou congregação."
                    ],
                    doctrinalNote: "Contribuições voluntárias e mordomia cristã alinhadas aos princípios bíblicos de administração eclesiástica paroquial."
                };
            case 'cad_membro':
                return {
                    description: "Gestão Integrada de Membresia, Registros Pastorais e Emissão de Documentos Oficiais.",
                    category: "Secretaria Eclesiástica",
                    version: "v3.8",
                    permissions: "Secretário / Pastor / Administrador",
                    quickManual: [
                        "Registro de Membros: Cadastro de dados civis, contatos, filiação, datas de conversão e batismo em águas.",
                        "Batismo Pentecostal: Conforme o Cap. 11 da Declaração de Fé, cadastro específico de batismo realizado exclusivamente por imersão.",
                        "Credenciais GIPP: Gere e imprima carteirinhas de membros e obreiros diretamente pelo sistema."
                    ],
                    doctrinalNote: "Eclesiologia (Cap. 11 a 14) e Batismo em Águas exclusivamente por imersão (Cap. 12)."
                };
            default:
                return {
                    description: `Módulo "${activeModuleLabel}" para operações internas da instituição eclesiástica.`,
                    category: "Sistema Geral GIPP",
                    version: "v4.2",
                    permissions: "Acesso Geral ao Sistema GIPP",
                    quickManual: [
                        "Navegação Rápida: Clique nas opções do menu lateral ou da barra de tarefas para abrir o módulo desejado.",
                        "Segurança e Auditoria: Todas as alterações realizadas neste módulo são salvas com data, hora e usuário para fins de integridade.",
                        "Suporte Integrado: Em caso de dúvidas, você pode acionar a Pastoral IA para responder dúvidas operacionais ou doutrinárias."
                    ],
                    doctrinalNote: "Sistemas em conformidade com as diretrizes organizacionais e eclesiásticas das Assembleias de Deus."
                };
        }
    };

    const props = getModuleProperties(activeModuleId);

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
            <div 
                className={`w-[450px] max-w-full rounded-lg border shadow-2xl overflow-hidden flex flex-col transform animate-scaleIn select-none ${
                    isLight 
                        ? 'bg-[#f3f3f3] border-slate-300 text-slate-800' 
                        : 'bg-[#1c1c1f] border-zinc-800 text-zinc-100'
                }`}
            >
                {/* Windows 11 Title Bar */}
                <div className={`px-4 py-2 flex justify-between items-center ${isLight ? 'bg-slate-200/50' : 'bg-[#202024]'}`}>
                    <div className="flex items-center gap-2">
                        {IconComp ? <IconComp size={16} className={activeModuleColor} /> : <Settings size={16} className={activeModuleColor} />}
                        <span className="text-[11px] font-semibold opacity-90 truncate max-w-[280px]">
                            Propriedades de: {activeModuleLabel}
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className={`p-1 rounded-md transition-colors ${
                            isLight 
                                ? 'hover:bg-rose-500/10 hover:text-rose-600' 
                                : 'hover:bg-rose-500/20 hover:text-rose-400'
                        } cursor-pointer`}
                        title="Fechar"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Tabs */}
                <div className={`flex border-b px-2 gap-1 ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#28282c] border-zinc-800'}`}>
                    {(['geral', 'manual', 'seguranca'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-2 text-xs font-semibold cursor-pointer border-b-2 transition-all capitalize ${
                                activeTab === tab
                                    ? 'border-indigo-500 text-indigo-500 bg-white/5 font-bold'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            {tab === 'seguranca' ? 'Segurança' : tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 overflow-y-auto max-h-[380px] min-h-[280px]">
                    {activeTab === 'geral' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 border-b pb-4 border-dashed border-zinc-500/20">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${isLight ? 'bg-black/5' : 'bg-white/5'}`}>
                                    {IconComp ? <IconComp className={activeModuleColor} size={36} /> : <Settings className={activeModuleColor} size={36} />}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-black tracking-tight">{activeModuleLabel}</h3>
                                    <p className="text-[11px] opacity-60">ID do Módulo: {activeModuleId}</p>
                                    <p className="text-[11px] font-bold text-indigo-500">{props.category}</p>
                                </div>
                            </div>

                            {/* Info Table */}
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-zinc-500/10">
                                    <span className="opacity-60">Tipo:</span>
                                    <span className="font-semibold">Módulo Integrado GIPP</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-zinc-500/10">
                                    <span className="opacity-60">Versão:</span>
                                    <span className="font-semibold font-mono">{props.version}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-zinc-500/10">
                                    <span className="opacity-60">Localização:</span>
                                    <span className="font-semibold truncate max-w-[250px] font-mono text-[11px]">gipp://root/modules/{activeModuleId}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-zinc-500/10">
                                    <span className="opacity-60">Status de Licença:</span>
                                    <span className="font-semibold text-emerald-500 flex items-center gap-1">✓ Ativo & Liberado</span>
                                </div>
                            </div>

                            <div className={`p-3 rounded-lg text-[11px] leading-relaxed ${isLight ? 'bg-slate-200/50' : 'bg-[#252528]'}`}>
                                <strong className="block mb-1 text-xs font-bold text-indigo-500 flex items-center gap-1">
                                    <Info size={12} /> Descrição Geral
                                </strong>
                                {props.description}
                            </div>
                        </div>
                    )}

                    {activeTab === 'manual' && (
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-500">Manual Rápido do Usuário</h4>
                            
                            <ul className="space-y-2.5">
                                {props.quickManual.map((step, idx) => (
                                    <li key={idx} className="text-xs flex gap-2 leading-relaxed">
                                        <span className="font-bold text-indigo-500 shrink-0 select-none">•</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>

                            {props.doctrinalNote && (
                                <div className={`p-3 rounded-lg text-[11px] leading-relaxed border ${
                                    isLight ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                                }`}>
                                    <strong className="block mb-1 text-[11px] font-bold flex items-center gap-1">
                                        <Shield size={12} /> Alinhamento Teológico (CGADB/CPAD)
                                    </strong>
                                    {props.doctrinalNote}
                                </div>
                            )}

                            {/* Button to open complete user manual */}
                            <button
                                onClick={() => {
                                    setView('manual');
                                    onClose();
                                }}
                                className="w-full mt-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer hover:shadow-md"
                            >
                                <BookOpen size={13} />
                                <span>Abrir Central de Manuais do GIPP</span>
                                <ExternalLink size={11} className="opacity-80" />
                            </button>
                        </div>
                    )}

                    {activeTab === 'seguranca' && (
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-500">Permissões & Segurança</h4>
                            
                            <div className="space-y-3 text-xs leading-relaxed">
                                <div className="p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
                                    <p className="font-bold mb-1 text-[11px]">Nível de Acesso Requerido:</p>
                                    <p className="opacity-80 font-mono text-[10px] bg-black/10 dark:bg-black/30 p-1 px-2 rounded">{props.permissions}</p>
                                </div>

                                <div className="space-y-2">
                                    <p className="font-semibold flex items-center gap-1.5 text-xs text-emerald-500">
                                        <Shield size={13} /> Políticas Ativas:
                                    </p>
                                    <ul className="list-disc pl-4 space-y-1 text-[11px] opacity-85">
                                        <li>Criptografia de dados ponta-a-ponta SSL/TLS ativo.</li>
                                        <li>Auditoria de logs habilitada para alterações cadastrais.</li>
                                        <li>Restrição de escrita de acordo com perfil hierárquico.</li>
                                        <li>Sincronização redundante com banco de dados seguro da nuvem.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Windows 11 Action Buttons */}
                <div className={`p-3 px-4 flex justify-end gap-2 border-t ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#202024]'}`}>
                    <button 
                        onClick={onClose}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs cursor-pointer border ${
                            isLight 
                                ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800' 
                                : 'bg-[#2d2d34] hover:bg-[#34343c] border-zinc-700 text-zinc-100'
                        }`}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onClose}
                        className="px-5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md cursor-pointer transition-all"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};
