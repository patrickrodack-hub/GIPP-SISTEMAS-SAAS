import React, { useState } from 'react';
import { 
    Users, Calendar, Clock, Plus, BookOpen, AlertCircle, 
    CheckCircle2, ChevronRight, Edit3, Trash2, Layers, Award
} from 'lucide-react';
import { TurmaFormacao, CandidatoObreiro, NIVEIS_MINISTERIAIS, TutorFormacao } from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal, getTodayDate } from '../../utils/sharedHelpers';

interface TabTurmasCronogramaProps {
    turmas?: TurmaFormacao[];
    candidatos?: CandidatoObreiro[];
    tutores?: TutorFormacao[];
    dbMembros?: any[];
    onSalvarTurma: (turma: TurmaFormacao) => void;
    onExcluirTurma: (turmaId: string) => void;
    onMatricularAluno: (turmaId: string, alunoId: string) => void;
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TabTurmasCronograma: React.FC<TabTurmasCronogramaProps> = ({
    turmas = [],
    candidatos = [],
    tutores = [],
    dbMembros = [],
    onSalvarTurma,
    onExcluirTurma,
    onMatricularAluno,
    addToast
}) => {
    const listaTurmas = turmas || [];
    const listaCandidatos = candidatos || [];
    const [selectedTurmaId, setSelectedTurmaId] = useState<string>(listaTurmas[0]?.id || '');
    const [showModalNovaTurma, setShowModalNovaTurma] = useState(false);
    const [showModalMatricula, setShowModalMatricula] = useState(false);
    const [selectedAlunoParaMatricula, setSelectedAlunoParaMatricula] = useState('');

    const [formTurma, setFormTurma] = useState<{
        nome: string;
        nivelMinisterial: 'auxiliar' | 'diacono' | 'presbitero' | 'evangelista' | 'pastor';
        anoLetivo: string;
        dataInicio: string;
        dataTermino: string;
        tutorResponsavelNome: string;
        vagas: number;
        localEncontros: string;
        horarioAulas: string;
    }>({
        nome: '',
        nivelMinisterial: 'diacono',
        anoLetivo: '2026/2',
        dataInicio: getTodayDate(),
        dataTermino: '2026-12-15',
        tutorResponsavelNome: 'Pr. Carlos Eduardo',
        vagas: 25,
        localEncontros: 'Auditório Anexo Sede',
        horarioAulas: 'Sábados das 14h às 17h'
    });

    const activeTurma = listaTurmas.find(t => t.id === selectedTurmaId) || listaTurmas[0];

    const handleCriarTurma = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTurma.nome.trim()) {
            addToast("Informe o nome da turma.", "error");
            return;
        }

        const novaTurma: TurmaFormacao = {
            id: `turma_${Date.now()}`,
            nome: formTurma.nome,
            nivelMinisterial: formTurma.nivelMinisterial,
            anoLetivo: formTurma.anoLetivo,
            dataInicio: formTurma.dataInicio,
            dataTermino: formTurma.dataTermino,
            tutorResponsavelId: 'tut_01',
            tutorResponsavelNome: formTurma.tutorResponsavelNome,
            vagas: formTurma.vagas,
            alunosIds: [],
            status: 'em_andamento',
            localEncontros: formTurma.localEncontros,
            horarioAulas: formTurma.horarioAulas,
            cronograma: [
                { moduloId: 'mod_01', moduloTitulo: 'Módulo 1: Fundamentos Doutrinários & Bíblicos', dataLimite: '2026-09-30', peso: 2 },
                { moduloId: 'mod_02', moduloTitulo: 'Módulo 2: Requisitos Morais & Liturgia Solene', dataLimite: '2026-10-30', peso: 2 },
                { moduloId: 'mod_03', moduloTitulo: 'Módulo 3: Prática Ministerial & Estágio Supervisionado', dataLimite: '2026-11-30', peso: 2 }
            ]
        };

        onSalvarTurma(novaTurma);
        setSelectedTurmaId(novaTurma.id);
        setShowModalNovaTurma(false);
        addToast("Nova Turma criada com sucesso!", "success");
    };

    const handleConfirmarMatricula = () => {
        if (!activeTurma || !selectedAlunoParaMatricula) return;
        onMatricularAluno(activeTurma.id, selectedAlunoParaMatricula);
        setShowModalMatricula(false);
        setSelectedAlunoParaMatricula('');
        addToast("Aluno matriculado na turma com sucesso!", "success");
    };

    const alunosDaTurma = candidatos.filter(c => activeTurma?.alunosIds?.includes(c.id));
    const alunosNaoMatriculados = candidatos.filter(c => !activeTurma?.alunosIds?.includes(c.id));

    return (
        <div className="space-y-4">
            {/* Header da Gestão de Turmas */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Gestão de Turmas & Períodos Letivos (Cohorts)
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Organize classes por ano letivo, datas limite de entrega de módulos e acompanhamento de cronograma.
                    </p>
                </div>

                <button
                    onClick={() => setShowModalNovaTurma(true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                    <Plus size={15} />
                    <span>Criar Nova Turma</span>
                </button>
            </div>

            {/* Grid de Turmas Ativas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Coluna Esquerda: Lista de Turmas */}
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 px-1">Turmas Cadastradas ({turmas.length})</h3>
                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                        {turmas.map(t => {
                            const isSel = (activeTurma?.id === t.id);
                            const nivel = NIVEIS_MINISTERIAIS.find(n => n.id === t.nivelMinisterial);
                            return (
                                <div
                                    key={t.id}
                                    onClick={() => setSelectedTurmaId(t.id)}
                                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                                        isSel
                                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {t.anoLetivo} • {nivel?.sigla || 'TURMA'}
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase">
                                            {t.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                                        {t.nome}
                                    </h4>
                                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                                        <span>{(t.alunosIds || []).length} / {t.vagas} Alunos</span>
                                        <span className="text-slate-400">Término: {formatDateLocal(t.dataTermino)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Coluna Central/Direita: Detalhes da Turma Selecionada */}
                {activeTurma && (
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
                                <div>
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                        Ano Letivo {activeTurma.anoLetivo}
                                    </span>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                                        {activeTurma.nome}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Tutor Responsável: <span className="font-bold text-slate-700 dark:text-slate-300">{activeTurma.tutorResponsavelNome}</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowModalMatricula(true)}
                                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                    >
                                        <Users size={14} />
                                        <span>Matricular Aluno</span>
                                    </button>
                                </div>
                            </div>

                            {/* Informações de Encontros e Cronograma */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Local das Aulas</span>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{activeTurma.localEncontros || 'Auditório Principal'}</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Horário Semanal</span>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{activeTurma.horarioAulas || 'Sábados às 14h'}</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Período de Execução</span>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                        {formatDateLocal(activeTurma.dataInicio)} até {formatDateLocal(activeTurma.dataTermino)}
                                    </p>
                                </div>
                            </div>

                            {/* Cronograma de Prazos e Datas Limite */}
                            <div>
                                <h4 className="text-xs font-black uppercase text-slate-400 mb-2.5 flex items-center gap-2">
                                    <Clock size={14} className="text-amber-500" />
                                    <span>Cronograma de Deadlines & Entregas de Módulos</span>
                                </h4>
                                <div className="space-y-2">
                                    {(activeTurma.cronograma || []).map((cron, idx) => (
                                        <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{cron.moduloTitulo}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                                    Prazo: {formatDateLocal(cron.dataLimite)}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                                                    Peso {cron.peso}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lista de Alunos Matriculados */}
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">
                                        <Users size={14} className="text-emerald-500" />
                                        <span>Alunos Matriculados ({alunosDaTurma.length})</span>
                                    </h4>
                                </div>

                                {alunosDaTurma.length === 0 ? (
                                    <div className="p-6 text-center border border-dashed rounded-2xl border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                                        Nenhum aluno matriculado nesta turma ainda. Clique em "Matricular Aluno" acima.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {alunosDaTurma.map(a => (
                                            <div key={a.id} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center text-xs text-slate-700 dark:text-slate-200">
                                                        {a.nome.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{a.nome}</p>
                                                        <p className="text-[10px] text-slate-500">{a.email || a.telefone}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-slate-400 font-bold block">Progresso</span>
                                                        <span className="text-xs font-black text-emerald-600">{a.progressoTeorico || 0}%</span>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                        {(a.statusTrilha || 'cursando').toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Criar Nova Turma */}
            {showModalNovaTurma && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Criar Nova Turma de Formação</h3>
                            <button onClick={() => setShowModalNovaTurma(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleCriarTurma} className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Nome da Turma</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Turma Diaconato 2026.2 (Barnabé)"
                                    value={formTurma.nome}
                                    onChange={(e) => setFormTurma(p => ({ ...p, nome: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Nível Ministerial</label>
                                    <select
                                        value={formTurma.nivelMinisterial}
                                        onChange={(e) => setFormTurma(p => ({ ...p, nivelMinisterial: e.target.value as any }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                                    >
                                        {NIVEIS_MINISTERIAIS.map(n => (
                                            <option key={n.id} value={n.id}>{n.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Ano Letivo / Semestre</label>
                                    <input
                                        type="text"
                                        value={formTurma.anoLetivo}
                                        onChange={(e) => setFormTurma(p => ({ ...p, anoLetivo: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Data Início</label>
                                    <input
                                        type="date"
                                        value={formTurma.dataInicio}
                                        onChange={(e) => setFormTurma(p => ({ ...p, dataInicio: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Data Término</label>
                                    <input
                                        type="date"
                                        value={formTurma.dataTermino}
                                        onChange={(e) => setFormTurma(p => ({ ...p, dataTermino: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Tutor / Coordenador</label>
                                    <input
                                        type="text"
                                        list="listaTutoresSugestoes"
                                        placeholder="Selecione ou digite o tutor..."
                                        value={formTurma.tutorResponsavelNome}
                                        onChange={(e) => setFormTurma(p => ({ ...p, tutorResponsavelNome: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-bold text-xs"
                                    />
                                    <datalist id="listaTutoresSugestoes">
                                        {(tutores || []).map(t => (
                                            <option key={t.id} value={t.nome}>{t.cargo || 'Tutor'}</option>
                                        ))}
                                        {(dbMembros || []).filter(m => m.cargo && m.cargo !== 'Membro').map(m => (
                                            <option key={m.id} value={m.nome}>{m.cargo}</option>
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Vagas</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formTurma.vagas}
                                        onChange={(e) => setFormTurma(p => ({ ...p, vagas: parseInt(e.target.value) || 20 }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-bold"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md mt-4 cursor-pointer"
                            >
                                Salvar e Iniciar Turma
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Matricular Aluno na Turma */}
            {showModalMatricula && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Matricular Aluno na Turma</h3>
                            <button onClick={() => setShowModalMatricula(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <label className="font-bold text-slate-600 dark:text-slate-400 block">Selecione o Obreiro Candidato</label>
                            <select
                                value={selectedAlunoParaMatricula}
                                onChange={(e) => setSelectedAlunoParaMatricula(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                            >
                                <option value="">-- Selecione um candidato --</option>
                                {alunosNaoMatriculados.map(a => (
                                    <option key={a.id} value={a.id}>{a.nome} ({a.nivelPretendido.toUpperCase()})</option>
                                ))}
                            </select>

                            <button
                                onClick={handleConfirmarMatricula}
                                disabled={!selectedAlunoParaMatricula}
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md mt-4 cursor-pointer"
                            >
                                Confirmar Matrícula
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
