import React, { useState } from 'react';
import { 
    Calendar, QrCode, CheckCircle, XCircle, AlertCircle, Plus, 
    Users, Clock, Smartphone, Copy, Check, Eye
} from 'lucide-react';
import { EncontroAula, TurmaFormacao, CandidatoObreiro } from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal, getTodayDate, copyToClipboard } from '../../utils/sharedHelpers';

interface TabFrequenciaEncontrosProps {
    encontros?: EncontroAula[];
    turmas?: TurmaFormacao[];
    candidatos?: CandidatoObreiro[];
    disciplinas?: any[];
    onSalvarEncontro: (encontro: EncontroAula) => void;
    onAtualizarPresenca: (encontroId: string, alunoId: string, status: 'presente' | 'ausente' | 'justificado') => void;
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TabFrequenciaEncontros: React.FC<TabFrequenciaEncontrosProps> = ({
    encontros = [],
    turmas = [],
    candidatos = [],
    onSalvarEncontro,
    onAtualizarPresenca,
    addToast
}) => {
    const listaEncontros = encontros || [];
    const listaTurmas = turmas || [];
    const listaCandidatos = candidatos || [];

    const [selectedTurmaId, setSelectedTurmaId] = useState<string>(listaTurmas[0]?.id || '');
    const [showModalNovoEncontro, setShowModalNovoEncontro] = useState(false);
    const [qrCodeModalEncontro, setQrCodeModalEncontro] = useState<EncontroAula | null>(null);
    const [copiadoToken, setCopiadoToken] = useState(false);

    const [formEncontro, setFormEncontro] = useState({
        data: getTodayDate(),
        tema: 'Liturgia Prática & Postura no Altar',
        professorNome: 'Pr. Carlos Eduardo',
        modalidade: 'presencial' as 'presencial' | 'online' | 'hibrido',
        observacoes: 'Participação presencial no Templo Sede.'
    });

    const activeTurma = listaTurmas.find(t => t.id === selectedTurmaId) || listaTurmas[0];
    const encontrosDaTurma = listaEncontros.filter(e => e && e.turmaId === activeTurma?.id);
    const alunosDaTurma = listaCandidatos.filter(c => c && activeTurma?.alunosIds?.includes(c.id));

    const handleCriarEncontro = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTurma) {
            addToast("Selecione uma turma primeiro.", "error");
            return;
        }

        const novoEncontro: EncontroAula = {
            id: `enc_${Date.now()}`,
            turmaId: activeTurma.id,
            turmaNome: activeTurma.nome,
            data: formEncontro.data,
            tema: formEncontro.tema,
            professorNome: formEncontro.professorNome,
            modalidade: formEncontro.modalidade,
            presencas: {},
            observacoes: formEncontro.observacoes,
            qrCodeToken: `GIPP-PRESENCA-${Date.now().toString(36).toUpperCase()}`
        };

        // Inicializa presença para todos os alunos da turma como 'ausente' até marcação
        alunosDaTurma.forEach(a => {
            novoEncontro.presencas[a.id] = 'ausente';
        });

        onSalvarEncontro(novoEncontro);
        setShowModalNovoEncontro(false);
        addToast("Encontro / Aula adicionada ao Diário de Classe!", "success");
    };

    const handleCopiarToken = (token: string) => {
        copyToClipboard(token);
        setCopiadoToken(true);
        setTimeout(() => setCopiadoToken(false), 2000);
        addToast("Token de Presença copiado!", "info");
    };

    // Calcular estatísticas de frequência por aluno na turma
    const getFrequenciaAluno = (alunoId: string) => {
        if (encontrosDaTurma.length === 0) return { percent: 100, totalPresencas: 0, totalAulas: 0 };
        let presencasCount = 0;
        encontrosDaTurma.forEach(enc => {
            const st = enc.presencas[alunoId];
            if (st === 'presente' || st === 'justificado') presencasCount++;
        });
        const percent = Math.round((presencasCount / encontrosDaTurma.length) * 100);
        return { percent, totalPresencas: presencasCount, totalAulas: encontrosDaTurma.length };
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Diário de Presença, Aulas Híbridas & QR Code
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Controle de frequência por aula presencial ou remota com verificação mínima de 75% para aprovação.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={selectedTurmaId}
                        onChange={(e) => setSelectedTurmaId(e.target.value)}
                        className="text-xs font-bold py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-slate-800 dark:text-slate-100"
                    >
                        {turmas.map(t => (
                            <option key={t.id} value={t.id}>{t.nome}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowModalNovoEncontro(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                        <Plus size={15} />
                        <span>Novo Encontro / Aula</span>
                    </button>
                </div>
            </div>

            {/* Painel Geral de Frequência dos Alunos da Turma */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase text-slate-400">
                        Quadro Consolidado de Frequência da Turma ({alunosDaTurma.length} Alunos • {encontrosDaTurma.length} Aulas)
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Exigência Mínima: 75%
                    </span>
                </div>

                {alunosDaTurma.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-2xl border-slate-200 dark:border-slate-800">
                        Nenhum aluno matriculado nesta turma para exibição de diário.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {alunosDaTurma.map(al => {
                            const freq = getFrequenciaAluno(al.id);
                            const reprovando = freq.percent < 75;
                            return (
                                <div key={al.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{al.nome}</h4>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                            reprovando
                                                ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600'
                                                : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'
                                        }`}>
                                            {freq.percent}% Presença
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${reprovando ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                            style={{ width: `${freq.percent}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500">
                                        Compareceu a {freq.totalPresencas} de {freq.totalAulas} aulas ministradas
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Lista de Aulas e Chamada Interativa */}
            <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400 px-1">
                    Diário de Chamada por Aula Ministrada ({encontrosDaTurma.length})
                </h3>

                {encontrosDaTurma.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                        Nenhum encontro registrado ainda para esta turma. Clique em "Novo Encontro / Aula" acima.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {encontrosDaTurma.map((enc, idx) => (
                            <div key={enc.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                                Aula {idx + 1} • {formatDateLocal(enc.data)}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                                {enc.modalidade}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">{enc.tema}</h4>
                                        <p className="text-xs text-slate-500">Ministrante: <span className="font-bold text-slate-700 dark:text-slate-300">{enc.professorNome}</span></p>
                                    </div>

                                    <button
                                        onClick={() => setQrCodeModalEncontro(enc)}
                                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                    >
                                        <QrCode size={15} className="text-emerald-600" />
                                        <span>Exibir QR Code / Token</span>
                                    </button>
                                </div>

                                {/* Lista de Alunos e Botões de Presença */}
                                <div className="space-y-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Registro de Chamada Individual:</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                        {alunosDaTurma.map(al => {
                                            const statusPresenca = enc.presencas[al.id] || 'ausente';
                                            return (
                                                <div key={al.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">{al.nome}</span>
                                                    
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => onAtualizarPresenca(enc.id, al.id, 'presente')}
                                                            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                                                                statusPresenca === 'presente'
                                                                    ? 'bg-emerald-600 text-white shadow-xs'
                                                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100'
                                                            }`}
                                                        >
                                                            Presente
                                                        </button>
                                                        <button
                                                            onClick={() => onAtualizarPresenca(enc.id, al.id, 'justificado')}
                                                            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                                                                statusPresenca === 'justificado'
                                                                    ? 'bg-amber-600 text-white shadow-xs'
                                                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-100'
                                                            }`}
                                                        >
                                                            Justificado
                                                        </button>
                                                        <button
                                                            onClick={() => onAtualizarPresenca(enc.id, al.id, 'ausente')}
                                                            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                                                                statusPresenca === 'ausente'
                                                                    ? 'bg-rose-600 text-white shadow-xs'
                                                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-100'
                                                            }`}
                                                        >
                                                            Ausente
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: Novo Encontro / Aula */}
            {showModalNovoEncontro && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Registrar Encontro / Aula</h3>
                            <button onClick={() => setShowModalNovoEncontro(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleCriarEncontro} className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Tema / Assunto da Aula</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Introdução à Hermenêutica Bíblica"
                                    value={formEncontro.tema}
                                    onChange={(e) => setFormEncontro(p => ({ ...p, tema: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Data da Aula</label>
                                    <input
                                        type="date"
                                        value={formEncontro.data}
                                        onChange={(e) => setFormEncontro(p => ({ ...p, data: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Modalidade</label>
                                    <select
                                        value={formEncontro.modalidade}
                                        onChange={(e) => setFormEncontro(p => ({ ...p, modalidade: e.target.value as any }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                                    >
                                        <option value="presencial">Presencial no Templo</option>
                                        <option value="hibrido">Híbrido (Presencial + Transmissão)</option>
                                        <option value="online">Online / Remoto</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Professor / Instrutor</label>
                                <input
                                    type="text"
                                    value={formEncontro.professorNome}
                                    onChange={(e) => setFormEncontro(p => ({ ...p, professorNome: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-bold"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md mt-4 cursor-pointer"
                            >
                                Salvar Encontro no Diário
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: QR Code & Token de Presença */}
            {qrCodeModalEncontro && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">QR Code de Presença Rápida</h3>
                            <button onClick={() => setQrCodeModalEncontro(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="p-5 bg-white rounded-2xl border-2 border-emerald-500 shadow-inner inline-block mx-auto">
                            <div className="w-44 h-44 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-3 space-y-2">
                                <QrCode size={90} className="text-emerald-400 animate-pulse" />
                                <span className="text-[9px] font-mono font-bold tracking-widest text-slate-300">
                                    {qrCodeModalEncontro.qrCodeToken || 'GIPP-EBD-TOKEN'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">{qrCodeModalEncontro.tema}</h4>
                            <p className="text-[11px] text-slate-500">Exiba este código no projetor para os alunos confirmarem presença pelo celular.</p>
                        </div>

                        <button
                            onClick={() => handleCopiarToken(qrCodeModalEncontro.qrCodeToken || '')}
                            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                            {copiadoToken ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            <span>{copiadoToken ? 'Token Copiado!' : 'Copiar Código de Presença'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
