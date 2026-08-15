import React, { useState } from 'react';
import { 
    Shield, CheckCircle2, AlertCircle, Award, UserCheck, 
    FileText, Calendar, Lock, BookOpen, Check, Save, UserCheck2,
    Stamp, AlertTriangle, ArrowRight, ShieldCheck, HeartHandshake
} from 'lucide-react';
import { CandidatoObreiro, NivelMinisterial } from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal, getTodayDate } from '../../utils/sharedHelpers';

interface TabDossiePastoralProps {
    candidato: CandidatoObreiro;
    nivel: NivelMinisterial;
    onSalvarDossie: (candidatoId: string, dossieData: CandidatoObreiro['dossieCanonico']) => Promise<void>;
    onEfetivarConsagracaoNoCadastro: (candidato: CandidatoObreiro) => Promise<void>;
    pastorNome?: string;
    isCoordenador: boolean;
}

export const TabDossiePastoral: React.FC<TabDossiePastoralProps> = ({
    candidato,
    nivel,
    onSalvarDossie,
    onEfetivarConsagracaoNoCadastro,
    pastorNome = 'Pastor Presidente',
    isCoordenador
}) => {
    const currentDossie = candidato.dossieCanonico || {
        irrepreensivel: true,
        esposoUmaMulher: true,
        vigilanteSobrio: true,
        hospitaleiro: true,
        aptoParaEnsinar: true,
        naoDadoAoVinho: true,
        naoViolento: true,
        moderadoPacifico: true,
        naoCobicadorTorpeGanancia: true,
        governaBemSuaCasa: true,
        naoNeofito: true,
        bomTestemunhoDosDeFora: true,
        dizimistaFiel: true,
        frequenciaCultosDoutrina: true,
        parecerPastorPresidente: 'Candidato aprovado em vida espiritual, conduta moral e aptidão bíblica conforme 1 Tm 3 e Tt 1.',
        pastorPresidenteNome: pastorNome,
        dataParecer: getTodayDate(),
        aprovadoPresbiterio: true,
        dataConsagracaoOficial: '',
        numeroRegistroConvenio: `CGADB-${nivel.sigla}-${Math.floor(100000 + Math.random() * 900000)}`
    };

    const [formDossie, setFormDossie] = useState(currentDossie);
    const [salvando, setSalvando] = useState(false);
    const [efetivando, setEfetivando] = useState(false);

    // Lista dos 14 Requisitos Canônicos das Epístolas Pastorais
    const REQUISITOS_CANONICOS = [
        { key: 'irrepreensivel', label: '1. Irrepreensível na Conduta', biblia: '1 Tm 3:2; Tt 1:6', desc: 'Vida íntegra perante a igreja e a sociedade, sem escândalos.' },
        { key: 'esposoUmaMulher', label: '2. Esposo de uma só mulher', biblia: '1 Tm 3:2; Tt 1:6', desc: 'Fidelidade matrimonial e casamento alinhado aos preceitos cristãos.' },
        { key: 'vigilanteSobrio', label: '3. Vigilante e Sóbrio', biblia: '1 Tm 3:2; Tt 1:8', desc: 'Equilíbrio emocional, prudência e vigilância espiritual.' },
        { key: 'hospitaleiro', label: '4. Hospitaleiro e Afável', biblia: '1 Tm 3:2; Tt 1:8', desc: 'Acolhedor aos irmãos e zeloso para com os necessitados.' },
        { key: 'aptoParaEnsinar', label: '5. Apto para Ensinar / Defender a Fé', biblia: '1 Tm 3:2; Tt 1:9', desc: 'Conhecimento da sã doutrina da CGADB e capacidade didática.' },
        { key: 'naoDadoAoVinho', label: '6. Não Dado ao Vinho / Bebidas', biblia: '1 Tm 3:3; Tt 1:7', desc: 'Abstinência total de bebidas alcoólicas e substâncias entorpecentes.' },
        { key: 'naoViolento', label: '7. Não Violento / Não Espancador', biblia: '1 Tm 3:3; Tt 1:7', desc: 'Manso de coração, avesso a contendas e agressões físicas ou verbais.' },
        { key: 'moderadoPacifico', label: '8. Moderado e Pacífico', biblia: '1 Tm 3:3; Tt 1:7', desc: 'Promotor da unidade no corpo de Cristo e pacificador.' },
        { key: 'naoCobicadorTorpeGanancia', label: '9. Desapegado de Torpe Ganância', biblia: '1 Tm 3:3; Tt 1:7', desc: 'Honestidade financeira absoluta e integridade nos negócios.' },
        { key: 'governaBemSuaCasa', label: '10. Que Governa Bem sua Própria Casa', biblia: '1 Tm 3:4-5', desc: 'Família em sujeição com toda a modéstia e testemunho piedoso.' },
        { key: 'naoNeofito', label: '11. Não Neófito (Novo Converso)', biblia: '1 Tm 3:6', desc: 'Tempo de conversão suficiente e maturidade na fé para não se ensoberbecer.' },
        { key: 'bomTestemunhoDosDeFora', label: '12. Bom Testemunho dos de Fora', biblia: '1 Tm 3:7', desc: 'Boa reputação com vizinhos, colegas de trabalho e credores.' },
        { key: 'dizimistaFiel', label: '13. Dizimista e Ofertante Fiel', biblia: 'Ml 3:10; 1 Co 16:2', desc: 'Compromisso com a mordomia cristã e sustento da obra do Senhor.' },
        { key: 'frequenciaCultosDoutrina', label: '14. Assiduidade nos Cultos e Oração', biblia: 'Hb 10:25; At 2:42', desc: 'Presença constante nos cultos de ensino da Bíblia e vigílias.' }
    ];

    const totalAtendidos = Object.entries(formDossie).filter(([k, v]) => 
        REQUISITOS_CANONICOS.some(r => r.key === k) && v === true
    ).length;

    const percentualIdoneidade = Math.round((totalAtendidos / REQUISITOS_CANONICOS.length) * 100);

    const handleSalvar = async () => {
        setSalvando(true);
        try {
            await onSalvarDossie(candidato.id, formDossie);
        } finally {
            setSalvando(false);
        }
    };

    const handleEfetivar = async () => {
        if (!window.confirm(`Confirma a EFETIVAÇÃO DA CONSAGRAÇÃO de ${candidato.nome} para ${nivel.nome.toUpperCase()}? Isto atualizará o cargo no cadastro oficial de membros da igreja.`)) {
            return;
        }
        setEfetivando(true);
        try {
            await onEfetivarConsagracaoNoCadastro(candidato);
        } finally {
            setEfetivando(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Topo do Dossiê Canônico */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-700 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none p-6">
                    <Shield size={220} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                                <ShieldCheck size={13} /> Dossiê Canônico de Idoneidade Ministerial
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                1 Timóteo 3 & Tito 1
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                            {candidato.nome}
                        </h2>
                        <p className="text-xs text-slate-300 flex items-center gap-2">
                            <span>Cargo Pretendido: <strong className="text-emerald-400 font-bold uppercase">{nivel.nome} ({nivel.sigla})</strong></span>
                            <span>•</span>
                            <span>Congregação: <strong>{candidato.congregacaoNome || 'Sede Principal'}</strong></span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700">
                        <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Índice de Idoneidade
                            </span>
                            <span className={`text-2xl font-black ${percentualIdoneidade === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {percentualIdoneidade}%
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                                {totalAtendidos} de {REQUISITOS_CANONICOS.length} requisitos
                            </span>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${percentualIdoneidade === 100 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                            {percentualIdoneidade === 100 ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist dos 14 Requisitos Canônicos */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <BookOpen size={18} className="text-emerald-600" />
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                Verificação dos Requisitos Canônicos e Morais
                            </h3>
                            <p className="text-xs text-slate-500">
                                Critérios de idoneidade estabelecidos pelas Escrituras Sagradas e pela Declaração de Fé da CGADB.
                            </p>
                        </div>
                    </div>
                    {isCoordenador && (
                        <button
                            type="button"
                            onClick={() => {
                                const allTrue: any = { ...formDossie };
                                REQUISITOS_CANONICOS.forEach(r => { allTrue[r.key] = true; });
                                setFormDossie(allTrue);
                            }}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer"
                        >
                            Marcar Todos como Atendidos
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {REQUISITOS_CANONICOS.map((req) => {
                        const isChecked = Boolean((formDossie as any)[req.key]);
                        return (
                            <label
                                key={req.key}
                                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                                    isChecked
                                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40 text-slate-900 dark:text-slate-100 shadow-xs'
                                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-75'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    disabled={!isCoordenador}
                                    checked={isChecked}
                                    onChange={(e) => {
                                        setFormDossie(prev => ({
                                            ...prev,
                                            [req.key]: e.target.checked
                                        }));
                                    }}
                                    className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                                />
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-black">{req.label}</span>
                                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 shrink-0">
                                            {req.biblia}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {req.desc}
                                    </p>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Parecer do Pastor Presidente e Homologação */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5 border-b pb-4 border-slate-100 dark:border-slate-800">
                    <Stamp size={18} className="text-emerald-600" />
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                            Parecer Pastoral Oficial & Homologação do Presbitério
                        </h3>
                        <p className="text-xs text-slate-500">
                            Manifestação formal da liderança máxima eclesiástica para o processo de consagração.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block">
                            Pastor Presidente / Supervisor Responsável
                        </label>
                        <input
                            type="text"
                            disabled={!isCoordenador}
                            value={formDossie.pastorPresidenteNome || ''}
                            onChange={(e) => setFormDossie(prev => ({ ...prev, pastorPresidenteNome: e.target.value }))}
                            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                            placeholder="Nome do Pastor Presidente"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block">
                            Data do Parecer Canônico
                        </label>
                        <input
                            type="date"
                            disabled={!isCoordenador}
                            value={formDossie.dataParecer || getTodayDate()}
                            onChange={(e) => setFormDossie(prev => ({ ...prev, dataParecer: e.target.value }))}
                            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300 block">
                            Parecer Conclusivo do Pastor Presidente
                        </label>
                        <textarea
                            rows={4}
                            disabled={!isCoordenador}
                            value={formDossie.parecerPastorPresidente || ''}
                            onChange={(e) => setFormDossie(prev => ({ ...prev, parecerPastorPresidente: e.target.value }))}
                            placeholder="Descreva o parecer do ministério sobre a vocação, lealdade e testemunho do obreiro..."
                            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none leading-relaxed text-xs"
                        />
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
                    <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                        <input
                            type="checkbox"
                            disabled={!isCoordenador}
                            checked={Boolean(formDossie.aprovadoPresbiterio)}
                            onChange={(e) => setFormDossie(prev => ({ ...prev, aprovadoPresbiterio: e.target.checked }))}
                            className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span>Aprovado em Reunião Ministerial / Homologado pelo Presbitério da Igreja</span>
                    </label>

                    {isCoordenador && (
                        <button
                            type="button"
                            onClick={handleSalvar}
                            disabled={salvando}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                            <Save size={14} />
                            <span>{salvando ? 'Salvando...' : 'Salvar Dossiê Pastoral'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Ação de Efetivação da Consagração no Rol de Membros */}
            {isCoordenador && (
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                            <HeartHandshake size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                Integração Automática com o Rol de Membros & Liderança
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                Ao consagrar o obreiro, o sistema atualiza o cargo de <strong>{candidato.cargoAtual || 'Membro'}</strong> para <strong className="text-emerald-600 dark:text-emerald-400 uppercase">{nivel.nome}</strong> no cadastro geral da igreja.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleEfetivar}
                        disabled={efetivando || percentualIdoneidade < 100 || !formDossie.aprovadoPresbiterio}
                        className={`py-3 px-6 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer ${
                            percentualIdoneidade === 100 && formDossie.aprovadoPresbiterio
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                        title={percentualIdoneidade < 100 ? 'Complete todos os 14 requisitos bíblicos antes de efetivar' : 'Efetivar consagração oficial'}
                    >
                        <UserCheck2 size={16} />
                        <span>{efetivando ? 'Atualizando Rol...' : 'Efetivar Consagração no Cadastro Geral'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};
