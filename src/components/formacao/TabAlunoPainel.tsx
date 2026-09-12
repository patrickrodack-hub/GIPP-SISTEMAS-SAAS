import React from 'react';
import { 
    BookOpen, Award, Clock, DollarSign, QrCode, FileText, CheckSquare, 
    Calendar, Bell, ChevronRight, UserCheck, CheckCircle2, AlertCircle,
    GraduationCap, Sparkles, BookCheck, Shield
} from 'lucide-react';
import { CandidatoObreiro, NivelMinisterial, EncontroAula, AvisoTurma } from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal } from '../../utils/sharedHelpers';

interface TabAlunoPainelProps {
    candidato?: CandidatoObreiro;
    nivel?: NivelMinisterial;
    totalHorasAprovadas?: number;
    encontros?: EncontroAula[];
    avisos?: AvisoTurma[];
    onNavigateTab?: (tabId: string) => void;
    igrejaNome?: string;
    turmaAtiva?: any;
    disciplinas?: any[];
}

export const TabAlunoPainel: React.FC<TabAlunoPainelProps> = ({
    candidato,
    nivel,
    totalHorasAprovadas = 0,
    encontros = [],
    avisos = [],
    onNavigateTab = (_tabId: string) => {},
    igrejaNome = 'Igreja Sede'
}) => {
    const safeCandidato: CandidatoObreiro = candidato || {
        id: 'aluno_temp',
        nome: 'Obreiro / Candidato',
        email: 'candidato@igreja.org',
        telefone: '',
        cargoAtual: 'Membro',
        nivelPretendido: (nivel?.id as any) || 'diacono',
        status: 'em_curso',
        progressoTeorico: 0,
        progressoPratico: 0,
        mediaProvas: 8.5,
        presencaGeral: 100,
        parecerPastor: 'apto',
        dataInicio: new Date().toISOString(),
        rg: '',
        cpf: '000.000.000-00',
        estadoCivil: 'casado',
        tempoBatismoAguasAnos: 5,
        tempoMembresiaAnos: 3,
        batizadoEspiritoSanto: true,
        dizimistaFiel: true,
        testemunhoPublico: true,
        esposaConcorda: true,
        filhosSubmissos: true,
        cursosAnteriores: [],
        documentosEntregues: {
            rgCpf: true,
            certidaoCasamento: true,
            cartaRecomendacao: true,
            historicoEbd: true,
            foto3x4: true,
            declaracaoIdoneidade: true
        }
    };

    const safeNivel: NivelMinisterial = nivel || {
        id: 'diacono',
        nome: 'Diácono',
        sigla: 'DC',
        cargo: 'Diaconato',
        descricao: 'Serviço das mesas e assistência aos santos',
        ordemHierarquica: 2,
        requisitosGerais: [],
        horasEstagioObrigatorias: 20,
        mediaMinimaAprovacao: 7.0,
        corHex: '#10b981'
    };

    // Próximos encontros ordenados
    const proximosEncontros = [...(encontros || [])]
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        .slice(0, 3);

    // Últimos avisos
    const ultimosAvisos = [...(avisos || [])].slice(0, 3);

    const horasExigidas = safeNivel.horasEstagioObrigatorias || 20;
    const percEstagio = Math.min(100, Math.round((totalHorasAprovadas / horasExigidas) * 100));

    const safeNavigate = (tabId: string) => {
        if (typeof onNavigateTab === 'function') {
            onNavigateTab(tabId);
        }
    };

    return (
        <div className="space-y-5 animate-fadeIn">
            {/* Banner de Boas-Vindas Acadêmico */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 border border-emerald-500/30 p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-900/50 shrink-0 border border-emerald-400/40 overflow-hidden">
                            {safeCandidato.foto ? (
                                <img src={safeCandidato.foto} alt={safeCandidato.nome} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <GraduationCap size={40} className="text-emerald-200" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Grau: {(safeNivel.nome || 'Grau Ministerial').toUpperCase()} ({safeNivel.sigla || 'MIN'})
                                </span>
                                <span className="text-[11px] font-bold text-slate-300">
                                    Polo: {safeCandidato.congregacaoNome || igrejaNome}
                                </span>
                                <span className="text-[11px] text-emerald-400 font-semibold">
                                    • Mentor: {safeCandidato.mentorNome || 'Pastor Dirigente'}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-1">
                                Paz do Senhor, {(safeCandidato.nome || 'Obreiro').split(' ')[0]}!
                            </h1>
                            <p className="text-xs md:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                Bem-vindo ao seu ambiente acadêmico da Universidade Teológica & Liderança Ministerial Oficial (CGADB / CPAD).
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        <button
                            onClick={() => safeNavigate('aluno_estudos')}
                            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
                        >
                            <BookOpen size={16} />
                            <span>Abrir Sala de Estudos</span>
                            <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        <button
                            onClick={() => safeNavigate('aluno_frequencia')}
                            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <QrCode size={16} />
                            <span>Cartão QR</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 4 Indicadores Principais de Desempenho */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div 
                    onClick={() => safeNavigate('aluno_estudos')}
                    className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-emerald-600">Progresso Teórico</span>
                        <BookOpen size={18} className="text-emerald-500" />
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{safeCandidato.progressoTeorico ?? 0}%</span>
                        <span className="text-[10px] text-slate-500 font-bold">Apostilas CGADB</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${safeCandidato.progressoTeorico ?? 0}%` }} />
                    </div>
                </div>

                <div 
                    onClick={() => safeNavigate('aluno_provas')}
                    className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500 transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-amber-600">Média de Avaliações</span>
                        <Award size={18} className="text-amber-500" />
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{(safeCandidato.mediaProvas ?? 8.5).toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 10</span></span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">Mínimo: 7.0</span>
                    </div>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-3">
                        {(safeCandidato.mediaProvas ?? 8.5) >= 7.0 ? '✓ Média de aprovação atingida' : 'Atenção para recuperação'}
                    </p>
                </div>

                <div 
                    onClick={() => safeNavigate('aluno_estagio')}
                    className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-500 transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-sky-600">Estágio do Altar</span>
                        <Clock size={18} className="text-sky-500" />
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {totalHorasAprovadas} <span className="text-xs text-slate-400 font-normal">/ {horasExigidas}h</span>
                        </span>
                        <span className="text-[10px] font-black text-sky-600">{percEstagio}% Concluído</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                        <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${percEstagio}%` }} />
                    </div>
                </div>

                <div 
                    onClick={() => safeNavigate('aluno_financeiro')}
                    className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500 transition-all cursor-pointer group"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-teal-600">Mensalidades & Taxas</span>
                        <DollarSign size={18} className="text-teal-500" />
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">Regularizada</span>
                        <span className="text-[10px] font-bold text-slate-400">Carnê do Aluno</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-3">Nenhuma pendência financeira ativa</p>
                </div>
            </div>

            {/* Ações Rápidas do Aluno */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                    Atalhos Rápidos de Estudo & Ministério
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    <button
                        onClick={() => safeNavigate('aluno_estudos')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-400 text-left transition-all cursor-pointer group"
                    >
                        <BookOpen size={18} className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-xs font-black text-slate-900 dark:text-white">Apostilas</span>
                        <span className="text-[10px] text-slate-400">Sala de leitura</span>
                    </button>

                    <button
                        onClick={() => safeNavigate('aluno_provas')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-400 text-left transition-all cursor-pointer group"
                    >
                        <CheckSquare size={18} className="text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-xs font-black text-slate-900 dark:text-white">Avaliações</span>
                        <span className="text-[10px] text-slate-400">Provas & Notas</span>
                    </button>

                    <button
                        onClick={() => safeNavigate('aluno_trabalhos')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-400 text-left transition-all cursor-pointer group"
                    >
                        <FileText size={18} className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-xs font-black text-slate-900 dark:text-white">Trabalhos</span>
                        <span className="text-[10px] text-slate-400">Artigos pastorais</span>
                    </button>

                    <button
                        onClick={() => safeNavigate('aluno_estagio')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-400 text-left transition-all cursor-pointer group"
                    >
                        <Clock size={18} className="text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-xs font-black text-slate-900 dark:text-white">Lançar Estágio</span>
                        <span className="text-[10px] text-slate-400">Horas práticas</span>
                    </button>

                    <button
                        onClick={() => safeNavigate('aluno_frequencia')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-400 text-left transition-all cursor-pointer group"
                    >
                        <QrCode size={18} className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-xs font-black text-slate-900 dark:text-white">Cartão QR</span>
                        <span className="text-[10px] text-slate-400">Check-in de aula</span>
                    </button>

                    <button
                        onClick={() => safeNavigate('aluno_mentoria')}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-400 text-left transition-all cursor-pointer group"
                    >
                        <UserCheck size={18} className="text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="block text-xs font-black text-slate-900 dark:text-white">Mentoria</span>
                        <span className="text-[10px] text-slate-400">Sessões pastorais</span>
                    </button>
                </div>
            </div>

            {/* Grade Dupla: Próximas Aulas & Mural de Avisos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Próximas Aulas Presenciais */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800 mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-emerald-600" />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                    Próximos Encontros no Calendário
                                </h3>
                            </div>
                            <button
                                onClick={() => safeNavigate('aluno_frequencia')}
                                className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                            >
                                Ver calendário completo
                            </button>
                        </div>

                        <div className="space-y-3">
                            {proximosEncontros.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-6">
                                    Nenhum encontro presencial agendado para os próximos dias.
                                </p>
                            ) : (
                                proximosEncontros.map((enc) => (
                                    <div
                                        key={enc.id}
                                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                    {((enc as any).tipoEncontro || enc.modalidade || 'aula').toUpperCase()}
                                                </span>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {enc.tema || (enc as any).titulo || 'Encontro Presencial'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">
                                                {formatDateLocal(enc.data)} • Instrutor: {enc.professorNome || 'Corpo Docente'}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => safeNavigate('aluno_frequencia')}
                                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-all shrink-0 cursor-pointer"
                                        >
                                            Check-in
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Frequência mínima obrigatória: 75%</span>
                        <span className="font-bold text-emerald-600">Presenças computadas via QR Code</span>
                    </div>
                </div>

                {/* Mural de Avisos da Turma */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800 mb-4">
                            <div className="flex items-center gap-2">
                                <Bell size={18} className="text-amber-500" />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                    Mural de Avisos da Coordenação
                                </h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">Últimos comunicados</span>
                        </div>

                        <div className="space-y-3">
                            {ultimosAvisos.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-6">
                                    Nenhum comunicado recente da coordenação para esta turma.
                                </p>
                            ) : (
                                ultimosAvisos.map((av) => (
                                    <div
                                        key={av.id}
                                        className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                {av.titulo}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                {formatDateLocal(av.dataPublicacao)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                                            {av.conteudo}
                                        </p>
                                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                                            <span>Por: {av.autorNome}</span>
                                            {av.enviadoWhatsapp && (
                                                <span className="text-emerald-600 font-bold">✓ Enviado no WhatsApp</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Fique atento aos prazos de entrega</span>
                        <span className="font-bold text-slate-600 dark:text-slate-300">Coordenação LMS GIPP</span>
                    </div>
                </div>
            </div>

            {/* Lema Bíblico de Formação Pastoral (2 Tm 2:15) */}
            <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <Shield size={22} className="text-emerald-600 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300 italic font-serif leading-relaxed">
                    "Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade." — <strong>2 Timóteo 2:15</strong>
                </p>
            </div>
        </div>
    );
};
