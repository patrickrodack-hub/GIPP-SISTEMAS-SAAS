import React, { useState } from 'react';
import { 
    Award, UserCheck, Plus, CheckCircle2, AlertCircle, FileText, 
    Edit3, Star, MessageSquare, Phone, Mail, Clock, Check
} from 'lucide-react';
import { TutorFormacao, TrabalhoAcademico, RegistroEstagio } from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal } from '../../utils/sharedHelpers';

interface TabTutoresDocentesProps {
    tutores?: TutorFormacao[];
    trabalhos?: TrabalhoAcademico[];
    trabalhosPendentes?: TrabalhoAcademico[];
    estagios?: RegistroEstagio[];
    estagiosPendentes?: RegistroEstagio[];
    candidatos?: any[];
    disciplinas?: any[];
    dbMembros?: any[];
    dbProfessores?: any[];
    onSalvarTutor: (tutor: TutorFormacao) => void;
    onAvaliarTrabalho?: (trabalhoId: string, nota: number, feedback: string) => void;
    onAvaliarTrabalhoRapido?: (trabalhoId: string, nota: number, feedback: string) => void;
    onAprovarEstagio?: (estagioId: string, parecer: string) => void;
    onAprovarEstagioRapido?: (estagioId: string, parecer: string) => void;
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TabTutoresDocentes: React.FC<TabTutoresDocentesProps> = ({
    tutores = [],
    trabalhos = [],
    trabalhosPendentes: trabalhosPendentesProp,
    estagios = [],
    estagiosPendentes: estagiosPendentesProp,
    candidatos = [],
    disciplinas = [],
    dbMembros = [],
    dbProfessores = [],
    onSalvarTutor,
    onAvaliarTrabalho,
    onAvaliarTrabalhoRapido,
    onAprovarEstagio,
    onAprovarEstagioRapido,
    addToast
}) => {
    const handleAvaliarTrabalhoRapido = onAvaliarTrabalhoRapido || onAvaliarTrabalho || (() => {});
    const handleAprovarEstagioRapido = onAprovarEstagioRapido || onAprovarEstagio || (() => {});

    const [showModalNovoTutor, setShowModalNovoTutor] = useState(false);
    const [selectedMembroOrigem, setSelectedMembroOrigem] = useState('');
    const [formTutor, setFormTutor] = useState({
        membroId: '',
        professorId: '',
        nome: '',
        cargo: 'Pastor Auxiliar & Mestre em Teologia',
        especialidade: 'Liturgia, Teologia Sistemática e Ética',
        telefone: '(11) 98888-0000',
        email: 'tutor@igreja.org.br'
    });

    const [trabalhoParaAvaliar, setTrabalhoParaAvaliar] = useState<TrabalhoAcademico | null>(null);
    const [notaInput, setNotaInput] = useState('9.5');
    const [feedbackInput, setFeedbackInput] = useState('Trabalho muito bem estruturado com sólido embasamento bíblico.');

    const listaTrabalhos = trabalhosPendentesProp || trabalhos || [];
    const listaEstagios = estagiosPendentesProp || estagios || [];
    const listaTutores = tutores || [];

    const trabalhosPendentes = (listaTrabalhos || []).filter(t => t && (t.status === 'pendente' || t.status === 'em_analise'));
    const estagiosPendentes = (listaEstagios || []).filter(e => e && (e.status === 'pendente'));

    const handleCriarTutor = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTutor.nome.trim()) {
            addToast("Informe o nome do tutor.", "error");
            return;
        }

        const novo: TutorFormacao = {
            id: `tut_${Date.now()}`,
            nome: formTutor.nome,
            cargo: formTutor.cargo,
            especialidade: formTutor.especialidade,
            telefone: formTutor.telefone,
            email: formTutor.email,
            status: 'ativo',
            turmasAtribuidas: [],
            totalCorrecoes: 0
        };

        onSalvarTutor(novo);
        setShowModalNovoTutor(false);
        setFormTutor({
            nome: '',
            cargo: 'Pastor Auxiliar & Mestre em Teologia',
            especialidade: 'Liturgia, Teologia Sistemática e Ética',
            telefone: '(11) 98888-0000',
            email: 'tutor@igreja.org.br'
        });
        addToast("Professor / Tutor cadastrado com sucesso!", "success");
    };

    const handleConfirmarAvaliacao = () => {
        if (!trabalhoParaAvaliar) return;
        const notaNum = parseFloat(notaInput) || 9.0;
        onAvaliarTrabalhoRapido(trabalhoParaAvaliar.id, notaNum, feedbackInput);
        setTrabalhoParaAvaliar(null);
        addToast("Avaliação pedagógica registrada com sucesso!", "success");
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <UserCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Corpo Docente, Professores & Fila de Correção
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Gerencie os tutores ministeriais e avalie com agilidade os trabalhos acadêmicos e relatórios de estágio pendentes.
                    </p>
                </div>

                <button
                    onClick={() => setShowModalNovoTutor(true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                    <Plus size={15} />
                    <span>Cadastrar Professor / Tutor</span>
                </button>
            </div>

            {/* Fila de Correção Rápida Pedagógica */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-amber-600" />
                        <h3 className="text-xs font-black uppercase text-amber-900 dark:text-amber-300">
                            Fila de Correção & Avaliação Pedagógica Pendente ({trabalhosPendentes.length + estagiosPendentes.length})
                        </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        Ação Necessária
                    </span>
                </div>

                {trabalhosPendentes.length === 0 && estagiosPendentes.length === 0 ? (
                    <div className="p-4 text-center text-xs font-bold text-slate-400">
                        ✨ Parabéns! Não há trabalhos ou relatórios de estágio pendentes de correção no momento.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {trabalhosPendentes.map(tr => (
                            <div key={tr.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 shadow-xs flex flex-col justify-between text-xs">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                            Trabalho Acadêmico
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold">{formatDateLocal(tr.dataEnvio)}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mt-1">{tr.titulo}</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Aluno: <span className="font-bold text-slate-700 dark:text-slate-300">{tr.candidatoNome}</span></p>
                                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-2 font-serif italic bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                        "{tr.conteudoTexto}"
                                    </p>
                                </div>

                                <button
                                    onClick={() => setTrabalhoParaAvaliar(tr)}
                                    className="mt-3 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                                >
                                    <Edit3 size={13} />
                                    <span>Avaliar Trabalho & Atribuir Nota</span>
                                </button>
                            </div>
                        ))}

                        {estagiosPendentes.map(es => (
                            <div key={es.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 shadow-xs flex flex-col justify-between text-xs">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                                            Relatório de Estágio ({es.horas}h)
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold">{formatDateLocal(es.dataAtividade)}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mt-1">{es.titulo}</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Aluno: <span className="font-bold text-slate-700 dark:text-slate-300">{es.candidatoNome}</span></p>
                                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{es.descricao}</p>
                                </div>

                                <button
                                    onClick={() => handleAprovarEstagioRapido(es.id, 'Estágio prático homologado com louvor pelo tutor.')}
                                    className="mt-3 w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                                >
                                    <CheckCircle2 size={13} />
                                    <span>Homologar Horas de Estágio</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lista de Professores e Tutores Cadastrados */}
            <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400 px-1">Corpo Docente Ativo ({listaTutores.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {listaTutores.map(t => (
                        <div key={t.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm shrink-0">
                                    {t.nome.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-black text-slate-900 dark:text-white text-xs truncate">{t.nome}</h4>
                                    <p className="text-[10px] text-slate-500 truncate">{t.cargo}</p>
                                </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                                <p className="text-slate-600 dark:text-slate-300 font-medium">
                                    <span className="font-bold text-slate-400 text-[10px] uppercase block">Especialidade</span>
                                    {t.especialidade}
                                </p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                                <span>{t.totalCorrecoes} Avaliações feitas</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600">
                                    {t.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal: Avaliar Trabalho Acadêmico */}
            {trabalhoParaAvaliar && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">Avaliação Pedagógica de Trabalho</h3>
                                <p className="text-[11px] text-slate-500">Aluno: {trabalhoParaAvaliar.candidatoNome}</p>
                            </div>
                            <button onClick={() => setTrabalhoParaAvaliar(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto font-serif">
                                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{trabalhoParaAvaliar.titulo}</p>
                                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap">
                                    {trabalhoParaAvaliar.conteudoTexto}
                                </p>
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Nota Atribuída (0 a 10)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={notaInput}
                                    onChange={(e) => setNotaInput(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Feedback e Parecer Doutrinário</label>
                                <textarea
                                    rows={3}
                                    value={feedbackInput}
                                    onChange={(e) => setFeedbackInput(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <button
                                onClick={handleConfirmarAvaliacao}
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md mt-4 cursor-pointer"
                            >
                                Salvar Nota & Homologar no Histórico
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Cadastrar Novo Tutor */}
            {showModalNovoTutor && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Cadastrar Professor / Tutor</h3>
                            <button onClick={() => setShowModalNovoTutor(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleCriarTutor} className="space-y-3 text-xs">
                            {/* Selecionar a partir da base real de membros / professores da igreja */}
                            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                                <label className="font-black text-emerald-800 dark:text-emerald-300 block">
                                    Importar da Base Real de Membros / Professores:
                                </label>
                                <select
                                    value={selectedMembroOrigem}
                                    onChange={(e) => {
                                        const mId = e.target.value;
                                        setSelectedMembroOrigem(mId);
                                        if (!mId) return;
                                        const membro = (dbMembros || []).find(m => m.id === mId);
                                        if (membro) {
                                            setFormTutor({
                                                membroId: membro.id,
                                                professorId: membro.id,
                                                nome: membro.nome || '',
                                                cargo: membro.cargo || 'Pastor / Obreiro Docente',
                                                especialidade: 'Teologia Sistemática e Doutrina Pentecostal',
                                                telefone: membro.telefone || '',
                                                email: membro.email || ''
                                            });
                                        }
                                    }}
                                    className="w-full p-2 rounded-xl border border-emerald-500/30 bg-white dark:bg-slate-800 font-bold outline-none text-slate-800 dark:text-slate-100"
                                >
                                    <option value="">-- Selecione um membro da igreja ou preencha manualmente --</option>
                                    {(dbProfessores || []).length > 0 && (
                                        <optgroup label="Professores Cadastrados na Igreja / EBD">
                                            {dbProfessores.map((p: any) => (
                                                <option key={p.id || p.nome} value={p.id || p.nome}>
                                                    🎓 {p.nome} ({p.cargo || 'Professor'})
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                    <optgroup label="Membros / Obreiros da Igreja">
                                        {(dbMembros || []).map((m: any) => (
                                            <option key={m.id} value={m.id}>
                                                {m.nome} - {m.cargo || 'Membro'} ({m.telefone || 'Sem fone'})
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Pr. Daniel Albuquerque"
                                    value={formTutor.nome}
                                    onChange={(e) => setFormTutor(p => ({ ...p, nome: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Cargo Eclesiástico & Titulação</label>
                                <input
                                    type="text"
                                    value={formTutor.cargo}
                                    onChange={(e) => setFormTutor(p => ({ ...p, cargo: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Especialidade / Matérias</label>
                                <input
                                    type="text"
                                    value={formTutor.especialidade}
                                    onChange={(e) => setFormTutor(p => ({ ...p, especialidade: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        value={formTutor.telefone}
                                        onChange={(e) => setFormTutor(p => ({ ...p, telefone: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">E-mail</label>
                                    <input
                                        type="email"
                                        value={formTutor.email}
                                        onChange={(e) => setFormTutor(p => ({ ...p, email: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md mt-4 cursor-pointer"
                            >
                                Salvar Cadastro de Tutor
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
