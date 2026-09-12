import React from 'react';
import { 
    Users, QrCode, FileText, Clock, HelpCircle, Bell, 
    Calendar, Award, BookCheck, ChevronRight, CheckCircle2,
    MessageSquare, AlertCircle
} from 'lucide-react';
import { TurmaFormacao, EncontroAula, TrabalhoAcademico, RegistroEstagio, TutorFormacao, CandidatoObreiro } from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal } from '../../utils/sharedHelpers';

interface TabProfessorPainelProps {
    tutorAtivo?: TutorFormacao;
    turmas: TurmaFormacao[];
    encontros: EncontroAula[];
    trabalhos: TrabalhoAcademico[];
    estagios: RegistroEstagio[];
    candidatos: CandidatoObreiro[];
    onNavigateTab: (tabId: string) => void;
}

export const TabProfessorPainel: React.FC<TabProfessorPainelProps> = ({
    tutorAtivo,
    turmas = [],
    encontros = [],
    trabalhos = [],
    estagios = [],
    candidatos = [],
    onNavigateTab
}) => {
    const pendentesTrabalhos = trabalhos.filter(t => t.status === 'submetido' || !t.nota);
    const pendentesEstagios = estagios.filter(e => e.status === 'pendente');
    const proximosEncontros = [...encontros]
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        .slice(0, 3);

    return (
        <div className="space-y-5 animate-fadeIn">
            {/* Banner Pedagógico do Professor */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-sky-950 border border-indigo-500/30 p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white flex items-center justify-center shadow-lg shadow-indigo-950/50 shrink-0 border border-indigo-400/40">
                            <BookCheck size={38} className="text-indigo-100" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    Corpo Docente • Universidade Teológica
                                </span>
                                <span className="text-[11px] font-bold text-slate-300">
                                    CGADB / CPAD
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-1">
                                Painel do Docente & Tutor Ministerial
                            </h1>
                            <p className="text-xs md:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                Lance diários de presença, realize a chamada com QR Code na tela, avalie trabalhos acadêmicos e homologue estágios práticos do altar.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        <button
                            onClick={() => onNavigateTab('prof_diario')}
                            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
                        >
                            <QrCode size={16} />
                            <span>Abrir Diário de Presença</span>
                            <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 4 Cards de Indicadores do Docente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div 
                    onClick={() => onNavigateTab('prof_diario')}
                    className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500 transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-indigo-600">Alunos Matriculados</span>
                        <Users size={18} className="text-indigo-500" />
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{candidatos.length}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{turmas.length} Turmas Ativas</span>
                    </div>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-3">✓ Diário de classe sincronizado</p>
                </div>

                <div 
                    onClick={() => onNavigateTab('prof_correcoes')}
                    className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500 transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-amber-600">Correção de Trabalhos</span>
                        <FileText size={18} className="text-amber-500" />
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{pendentesTrabalhos.length}</span>
                        <span className="text-[10px] text-slate-400 font-bold">de {trabalhos.length} submetidos</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-3">
                        {pendentesTrabalhos.length > 0 ? 'Fila com artigos aguardando nota' : '✓ Todas as correções em dia'}
                    </p>
                </div>

                <div 
                    onClick={() => onNavigateTab('prof_estagio')}
                    className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-500 transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-sky-600">Homologação de Estágio</span>
                        <Clock size={18} className="text-sky-500" />
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-black text-sky-600 dark:text-sky-400">{pendentesEstagios.length}</span>
                        <span className="text-[10px] text-slate-400 font-bold">Atividades pendentes</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-3">
                        {pendentesEstagios.length > 0 ? 'Horas de altar para validar' : '✓ Horas de estágio homologadas'}
                    </p>
                </div>

                <div 
                    onClick={() => onNavigateTab('prof_diario')}
                    className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-emerald-600">Próxima Aula</span>
                        <Calendar size={18} className="text-emerald-500" />
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[150px]">
                            {proximosEncontros[0]?.tema || (proximosEncontros[0] as any)?.titulo || 'Sem aula agendada'}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">
                            {proximosEncontros[0] ? formatDateLocal(proximosEncontros[0].data) : ''}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-3">
                        {proximosEncontros[0] ? `Modalidade: ${proximosEncontros[0].modalidade || 'Presencial'}` : 'Aguardando cronograma'}
                    </p>
                </div>
            </div>

            {/* Atalhos Rápidos da Docência */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                    Ferramentas Operacionais do Docente
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    <button
                        onClick={() => onNavigateTab('prof_diario')}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 text-left transition-all cursor-pointer group"
                    >
                        <QrCode size={20} className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-xs font-black text-slate-900 dark:text-white">Diário & QR Code</span>
                        <span className="text-[10px] text-slate-400">Chamada presencial</span>
                    </button>

                    <button
                        onClick={() => onNavigateTab('prof_correcoes')}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 text-left transition-all cursor-pointer group"
                    >
                        <FileText size={20} className="text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-xs font-black text-slate-900 dark:text-white">Fila de Trabalhos</span>
                        <span className="text-[10px] text-slate-400">Avaliar com nota 0-10</span>
                    </button>

                    <button
                        onClick={() => onNavigateTab('prof_estagio')}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 text-left transition-all cursor-pointer group"
                    >
                        <Clock size={20} className="text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-xs font-black text-slate-900 dark:text-white">Homologar Estágio</span>
                        <span className="text-[10px] text-slate-400">Aprovar horas do altar</span>
                    </button>

                    <button
                        onClick={() => onNavigateTab('prof_banco')}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 text-left transition-all cursor-pointer group"
                    >
                        <HelpCircle size={20} className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-xs font-black text-slate-900 dark:text-white">Banco de Provas</span>
                        <span className="text-[10px] text-slate-400">Questões CGADB</span>
                    </button>

                    <button
                        onClick={() => onNavigateTab('prof_avisos')}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 text-left transition-all cursor-pointer group"
                    >
                        <Bell size={20} className="text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-xs font-black text-slate-900 dark:text-white">Avisos & WhatsApp</span>
                        <span className="text-[10px] text-slate-400">Comunicados gerais</span>
                    </button>
                </div>
            </div>

            {/* Grade Dupla: Fila Rápida de Correções & Calendário Imediato */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Trabalhos Pendentes */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800 mb-3">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText size={16} className="text-amber-500" />
                                <span>Trabalhos Aguardando Correção</span>
                            </h4>
                            <button
                                onClick={() => onNavigateTab('prof_correcoes')}
                                className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                            >
                                Ver todos ({pendentesTrabalhos.length})
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            {pendentesTrabalhos.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-6">
                                    Nenhum trabalho acadêmico aguardando correção no momento.
                                </p>
                            ) : (
                                pendentesTrabalhos.slice(0, 3).map((trab) => {
                                    const aluno = candidatos.find(c => c.id === trab.candidatoId);
                                    return (
                                        <div
                                            key={trab.id}
                                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3"
                                        >
                                            <div className="overflow-hidden">
                                                <span className="text-[10px] font-black uppercase text-amber-600">
                                                    {trab.disciplinaTitulo}
                                                </span>
                                                <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                    {trab.titulo}
                                                </h5>
                                                <p className="text-[10px] text-slate-400">
                                                    Aluno: <strong>{aluno?.nome || 'Candidato'}</strong>
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => onNavigateTab('prof_correcoes')}
                                                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-700 transition-all shrink-0 cursor-pointer"
                                            >
                                                Corrigir
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                        O prazo recomendado para devolução dos trabalhos com feedback é de 7 dias úteis.
                    </div>
                </div>

                {/* Próximas Aulas no Cronograma */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800 mb-3">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Calendar size={16} className="text-indigo-500" />
                                <span>Aulas & Encontros Agendados</span>
                            </h4>
                            <button
                                onClick={() => onNavigateTab('prof_diario')}
                                className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                            >
                                Ver diário completo
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            {proximosEncontros.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-6">
                                    Nenhum encontro presencial agendado no calendário.
                                </p>
                            ) : (
                                proximosEncontros.map((enc) => (
                                    <div
                                        key={enc.id}
                                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3"
                                    >
                                        <div className="overflow-hidden">
                                            <span className="text-[10px] font-black uppercase text-indigo-600">
                                                {formatDateLocal(enc.data)} • {(enc.modalidade || 'presencial').toUpperCase()}
                                            </span>
                                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {enc.tema || (enc as any).titulo || 'Encontro Teológico'}
                                            </h5>
                                            <p className="text-[10px] text-slate-400">
                                                Professor: {enc.professorNome || 'Corpo Docente'}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => onNavigateTab('prof_diario')}
                                            className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 transition-all shrink-0 cursor-pointer"
                                        >
                                            Chamada
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                        A chamada pode ser feita manualmente pelo professor ou via QR Code projetado.
                    </div>
                </div>
            </div>
        </div>
    );
};
