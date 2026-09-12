import React, { useState } from 'react';
import { 
    FileText, CheckCircle2, AlertCircle, Edit3, Search, Filter, 
    Star, MessageSquare, Clock, User, Award, Check
} from 'lucide-react';
import { TrabalhoAcademico, CandidatoObreiro, DisciplinaObreiro } from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal } from '../../utils/sharedHelpers';

interface TabProfessorCorrecoesProps {
    trabalhos?: TrabalhoAcademico[];
    candidatos?: CandidatoObreiro[];
    disciplinas?: DisciplinaObreiro[];
    onAvaliarTrabalho?: (trabalhoId: string, nota: number, feedback: string) => void;
    addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TabProfessorCorrecoes: React.FC<TabProfessorCorrecoesProps> = ({
    trabalhos = [],
    candidatos = [],
    disciplinas = [],
    onAvaliarTrabalho,
    addToast = (_msg: string, _type?: 'success' | 'error' | 'info') => {}
}) => {
    const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendentes' | 'avaliados'>('pendentes');
    const [busca, setBusca] = useState('');
    const [trabalhoParaAvaliar, setTrabalhoParaAvaliar] = useState<TrabalhoAcademico | null>(null);
    const [notaInput, setNotaInput] = useState('9.0');
    const [feedbackInput, setFeedbackInput] = useState('');

    // Filtragem
    const trabalhosFiltrados = (trabalhos || []).filter((t) => {
        const aluno = (candidatos || []).find(c => c.id === t.candidatoId);
        const nomeAluno = aluno?.nome?.toLowerCase() || '';
        const tituloTrab = t.titulo?.toLowerCase() || '';
        const matchBusca = nomeAluno.includes(busca.toLowerCase()) || tituloTrab.includes(busca.toLowerCase());

        const isPendente = t.status === 'submetido' || !t.nota;
        if (filtroStatus === 'pendentes') return matchBusca && isPendente;
        if (filtroStatus === 'avaliados') return matchBusca && !isPendente;
        return matchBusca;
    });

    const pendentesCount = (trabalhos || []).filter(t => t.status === 'submetido' || !t.nota).length;
    const avaliadosCount = (trabalhos || []).filter(t => t.nota !== undefined && t.status !== 'submetido').length;

    const abrirModalAvaliacao = (t: TrabalhoAcademico) => {
        setTrabalhoParaAvaliar(t);
        setNotaInput(t.nota ? String(t.nota) : '9.0');
        setFeedbackInput(t.feedbackPastor || (t as any).feedbackTutor || '');
    };

    const handleSalvarAvaliacao = (e: React.FormEvent) => {
        e.preventDefault();
        if (!trabalhoParaAvaliar) return;
        const notaNum = parseFloat(notaInput);
        if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
            addToast('A nota deve ser um valor entre 0 e 10.', 'error');
            return;
        }

        onAvaliarTrabalho(trabalhoParaAvaliar.id, notaNum, feedbackInput);
        setTrabalhoParaAvaliar(null);
    };

    return (
        <div className="space-y-5 animate-fadeIn">
            {/* Cabeçalho da Fila de Correção */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="text-emerald-600" size={20} />
                        <span>Fila de Correção de Trabalhos Acadêmicos & Artigos</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                        Atribua notas de 0 a 10 e registre o parecer teológico formativo para os candidatos.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black">
                        {pendentesCount} Pendentes de Nota
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black">
                        {avaliadosCount} Concluídos
                    </span>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                    <Search size={16} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por aluno ou título do trabalho..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold outline-none text-slate-900 dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                    <button
                        onClick={() => setFiltroStatus('pendentes')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            filtroStatus === 'pendentes'
                                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Pendentes ({pendentesCount})
                    </button>
                    <button
                        onClick={() => setFiltroStatus('avaliados')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            filtroStatus === 'avaliados'
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Avaliados ({avaliadosCount})
                    </button>
                    <button
                        onClick={() => setFiltroStatus('todos')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            filtroStatus === 'todos'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Todos ({trabalhos.length})
                    </button>
                </div>
            </div>

            {/* Lista de Trabalhos para Correção */}
            <div className="space-y-3">
                {trabalhosFiltrados.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                        Nenhum trabalho acadêmico encontrado com os critérios selecionados.
                    </div>
                ) : (
                    trabalhosFiltrados.map((trab) => {
                        const aluno = candidatos.find(c => c.id === trab.candidatoId);
                        const isPendente = trab.status === 'submetido' || !trab.nota;

                        return (
                            <div
                                key={trab.id}
                                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-sm shrink-0">
                                            {(aluno?.nome || 'A').charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                                {aluno?.nome || 'Aluno Candidato'}
                                            </h4>
                                            <p className="text-[11px] text-slate-400">
                                                Disciplina: <strong className="text-emerald-600">{trab.disciplinaTitulo}</strong> • Entregue em: {formatDateLocal(trab.dataSubmissao)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                            isPendente
                                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                                : trab.status === 'aprovado'
                                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                        }`}>
                                            {isPendente ? 'Pendente de Nota' : trab.status.toUpperCase()}
                                        </span>

                                        {trab.nota !== undefined && (
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                                                Nota: {trab.nota.toFixed(1)} / 10
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <h5 className="text-xs font-black text-slate-800 dark:text-slate-200">
                                        Título: {trab.titulo}
                                    </h5>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        {trab.conteudoTexto}
                                    </p>
                                </div>

                                {(trab.feedbackPastor || trab.feedbackTutor) && (
                                    <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 flex items-start gap-2">
                                        <MessageSquare size={14} className="shrink-0 mt-0.5" />
                                        <div>
                                            <strong>Parecer Pastoral ({trab.avaliadorNome || 'Docente'}):</strong> {trab.feedbackPastor || trab.feedbackTutor}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-1">
                                    <button
                                        onClick={() => abrirModalAvaliacao(trab)}
                                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                    >
                                        <Edit3 size={14} />
                                        <span>{isPendente ? 'Avaliar / Lançar Nota' : 'Alterar Nota e Parecer'}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal de Avaliação de Trabalho */}
            {trabalhoParaAvaliar && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                    Avaliação do Trabalho Acadêmico
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    {trabalhoParaAvaliar.disciplinaTitulo}
                                </p>
                            </div>
                            <button onClick={() => setTrabalhoParaAvaliar(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
                        </div>

                        <form onSubmit={handleSalvarAvaliacao} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                                    Nota Atribuída (0 a 10) • Mínimo 7.0 para aprovação
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    required
                                    value={notaInput}
                                    onChange={(e) => setNotaInput(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none text-base text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                                    Parecer Teológico & Pastoral
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Escreva elogios, observações exegéticas e orientações para o ministério do aluno..."
                                    value={feedbackInput}
                                    onChange={(e) => setFeedbackInput(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-sans"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Check size={16} />
                                <span>Salvar Nota & Parecer</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
