import React, { useState } from 'react';
import { 
    QrCode, CheckCircle2, XCircle, AlertCircle, Calendar, Clock, 
    Download, Share2, KeyRound, Check, GraduationCap, ShieldCheck
} from 'lucide-react';
import { CandidatoObreiro, NivelMinisterial, EncontroAula } from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal } from '../../utils/sharedHelpers';

interface TabAlunoFrequenciaProps {
    candidato?: CandidatoObreiro;
    nivel?: NivelMinisterial;
    encontros?: EncontroAula[];
    onAtualizarPresenca?: (encontroId: string, alunoId: string, presente: boolean) => void;
    addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
    igrejaNome?: string;
    turmaAtiva?: any;
}

export const TabAlunoFrequencia: React.FC<TabAlunoFrequenciaProps> = ({
    candidato,
    nivel,
    encontros = [],
    onAtualizarPresenca,
    addToast = (_msg: string, _type?: 'success' | 'error' | 'info') => {},
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

    const [tokenInput, setTokenInput] = useState('');
    const [checkingIn, setCheckingIn] = useState(false);

    // Calcular estatísticas de presença deste candidato
    let totalAulasRealizadas = 0;
    let presencasConfirmadas = 0;
    let ausenciasRegistradas = 0;

    const historicoAulas = (encontros || []).map((enc) => {
        let presencaAluno: { presente: boolean; justificativa?: string } | null = null;
        
        if (Array.isArray(enc.presencas)) {
            const found = enc.presencas.find((p: any) => p && (p.candidatoId === safeCandidato.id || p.alunoId === safeCandidato.id));
            if (found) {
                presencaAluno = {
                    presente: Boolean(found.presente),
                    justificativa: found.justificativa
                };
            }
        } else if (enc.presencas && typeof enc.presencas === 'object') {
            const val = (enc.presencas as Record<string, any>)[safeCandidato.id];
            if (val !== undefined && val !== null) {
                if (typeof val === 'string') {
                    presencaAluno = {
                        presente: val === 'presente',
                        justificativa: val === 'justificado' ? 'Falta justificada' : undefined
                    };
                } else if (typeof val === 'boolean') {
                    presencaAluno = { presente: val };
                } else if (typeof val === 'object') {
                    presencaAluno = {
                        presente: Boolean(val.presente),
                        justificativa: val.justificativa
                    };
                }
            }
        }

        const dataEnc = new Date(enc.data);
        const jaAconteceu = !isNaN(dataEnc.getTime()) && dataEnc.getTime() <= Date.now() + 86400000; // hoje ou antes

        let status: 'presente' | 'ausente' | 'justificado' | 'agendado' = 'agendado';
        if (presencaAluno) {
            status = presencaAluno.presente ? 'presente' : (presencaAluno.justificativa ? 'justificado' : 'ausente');
        } else if (jaAconteceu) {
            status = 'ausente';
        }

        if (jaAconteceu) {
            totalAulasRealizadas++;
            if (status === 'presente' || status === 'justificado') {
                presencasConfirmadas++;
            } else {
                ausenciasRegistradas++;
            }
        }

        return {
            ...enc,
            statusPresenca: status
        };
    });

    const taxaFrequencia = totalAulasRealizadas > 0 
        ? Math.round((presencasConfirmadas / totalAulasRealizadas) * 100) 
        : 100;

    const handleCheckInToken = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tokenInput.trim()) {
            addToast('Insira o token numérico da aula fornecido pelo professor.', 'error');
            return;
        }

        setCheckingIn(true);
        setTimeout(() => {
            setCheckingIn(false);
            const tokenLimpo = tokenInput.trim().toUpperCase();
            // Localizar encontro com token correspondente ou mais recente
            const encHoje = (encontros || []).find(enc => 
                (enc.qrCodeToken && enc.qrCodeToken.toUpperCase().includes(tokenLimpo)) ||
                ((enc as any).tokenPresenca && String((enc as any).tokenPresenca).toUpperCase() === tokenLimpo) ||
                enc.id.toUpperCase() === tokenLimpo
            ) || encontros[0];

            if (encHoje && onAtualizarPresenca) {
                onAtualizarPresenca(encHoje.id, safeCandidato.id, true);
                addToast(`Presença confirmada com sucesso para a aula: ${encHoje.tema || (encHoje as any).titulo || 'Aula'}!`, 'success');
                setTokenInput('');
            } else {
                addToast('Token inválido ou expirado. Solicite ao professor ou tutor.', 'error');
            }
        }, 600);
    };

    // QR Code data representation for student ID
    const qrPayload = `GIPP_STUDENT_${safeCandidato.id}_${(safeCandidato.cpf || '').replace(/\D/g, '')}`;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Cabeçalho da Aba */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <QrCode className="text-emerald-600" size={20} />
                        <span>Frequência Digital & Cartão do Obreiro</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                        Apresente seu cartão com QR Code na entrada do templo ou faça check-in com o token diário.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${
                        taxaFrequencia >= 75
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}>
                        Frequência Atual: {taxaFrequencia}% (Mínimo 75%)
                    </span>
                </div>
            </div>

            {/* Cartão Acadêmico do Aluno (Digital Student Pass) & Formulário de Token */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Cartão de Frequência com QR Code */}
                <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-6 rounded-3xl border border-emerald-500/30 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <GraduationCap size={18} className="text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                                    Credencial Acadêmica
                                </span>
                            </div>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                {(safeCandidato.id || 'ALUNO').toUpperCase()}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-base shrink-0 border border-emerald-400/40 overflow-hidden">
                                {safeCandidato.foto ? (
                                    <img src={safeCandidato.foto} alt={safeCandidato.nome} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    (safeCandidato.nome || 'O').charAt(0)
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="text-sm font-black truncate">{safeCandidato.nome}</h4>
                                <p className="text-[11px] text-emerald-400 font-bold uppercase">
                                    {safeNivel.nome} ({safeNivel.sigla})
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                    {safeCandidato.congregacaoNome || igrejaNome}
                                </p>
                            </div>
                        </div>

                        {/* QR Code Container */}
                        <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-inner mt-2">
                            {/* QR Code SVG Visual Representation */}
                            <div className="relative p-2 bg-white rounded-xl border border-slate-200">
                                <QrCode size={130} className="text-slate-900" />
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono mt-2 font-bold">
                                {safeCandidato.id} • CGADB/CPAD
                            </span>
                        </div>
                    </div>

                    <div className="relative z-10 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <ShieldCheck size={13} />
                            Válido p/ Semestre Letivo
                        </span>
                        <span>LMS GIPP</span>
                    </div>
                </div>

                {/* Painel de Check-in por Token & Resumo */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Check-in Rápido com Código da Aula */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                        <div className="flex items-center gap-2">
                            <KeyRound size={18} className="text-emerald-600" />
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                Check-in Rápido com Token da Aula
                            </h4>
                        </div>
                        <p className="text-xs text-slate-500">
                            Se o professor projetar um código ou senha no telão, digite abaixo para computar sua presença imediatamente no diário de classe.
                        </p>

                        <form onSubmit={handleCheckInToken} className="flex gap-2 pt-1">
                            <input
                                type="text"
                                placeholder="Digite o código da aula (ex: 849201)"
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                                className="flex-1 p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-sm outline-none focus:border-emerald-500"
                            />
                            <button
                                type="submit"
                                disabled={checkingIn}
                                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                            >
                                <Check size={16} />
                                <span>{checkingIn ? 'Validando...' : 'Confirmar Presença'}</span>
                            </button>
                        </form>
                    </div>

                    {/* Cartões com Métricas de Presença */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                            <span className="text-[10px] font-black uppercase text-slate-400 block">Aulas Computadas</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                                {totalAulasRealizadas}
                            </span>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center shadow-xs">
                            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">Presenças</span>
                            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                                {presencasConfirmadas}
                            </span>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center shadow-xs">
                            <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 block">Faltas</span>
                            <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                                {ausenciasRegistradas}
                            </span>
                        </div>
                    </div>

                    {/* Informativo Regulamentar CGADB */}
                    <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <strong>Regimento Canônico:</strong> O candidato com frequência inferior a 75% não poderá colar grau ministerial na convenção geral ou regional. As faltas por motivo de força maior devem ser justificadas perante a coordenação com atestado pastoral em até 7 dias.
                    </div>
                </div>
            </div>

            {/* Histórico Completo de Aulas e Frequência */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-emerald-600" />
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            Registro Histórico de Aulas da Turma
                        </h4>
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold">
                        {historicoAulas.length} Aulas Registradas
                    </span>
                </div>

                <div className="space-y-2.5">
                    {historicoAulas.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-8">
                            Nenhum encontro presencial cadastrado para esta turma até o momento.
                        </p>
                    ) : (
                        historicoAulas.map((aula, idx) => (
                            <div
                                key={aula.id}
                                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase text-emerald-600">
                                            Aula #{idx + 1} • {formatDateLocal(aula.data)}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            às {aula.horarioInicio || '19h30'}
                                        </span>
                                    </div>
                                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                        {aula.tema || (aula as any).titulo || 'Encontro Teológico de Formação'}
                                    </h5>
                                    <p className="text-[11px] text-slate-500">
                                        Instrutor: {aula.professorNome || 'Corpo Docente'} • Modalidade: {aula.modalidade === 'hibrido' ? 'Híbrido' : aula.modalidade === 'online' ? 'Online' : 'Presencial'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {aula.statusPresenca === 'presente' ? (
                                        <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-black">
                                            <CheckCircle2 size={14} />
                                            Presente
                                        </span>
                                    ) : aula.statusPresenca === 'justificado' ? (
                                        <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-black">
                                            <AlertCircle size={14} />
                                            Falta Justificada
                                        </span>
                                    ) : aula.statusPresenca === 'ausente' ? (
                                        <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-black">
                                            <XCircle size={14} />
                                            Ausente
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
                                            Agendada
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
