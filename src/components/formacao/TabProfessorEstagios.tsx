import React, { useState } from 'react';
import { 
    Clock, CheckCircle2, AlertCircle, Check, X, Search, Filter, 
    Camera, User, Calendar, MapPin, FileCheck
} from 'lucide-react';
import { RegistroEstagio, CandidatoObreiro, NivelMinisterial } from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal } from '../../utils/sharedHelpers';

interface TabProfessorEstagiosProps {
    estagios: RegistroEstagio[];
    candidatos: CandidatoObreiro[];
    onAprovarEstagio: (estagioId: string, status: 'aprovado' | 'rejeitado') => void;
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TabProfessorEstagios: React.FC<TabProfessorEstagiosProps> = ({
    estagios = [],
    candidatos = [],
    onAprovarEstagio,
    addToast
}) => {
    const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendentes' | 'aprovados'>('pendentes');
    const [busca, setBusca] = useState('');
    const [fotoModal, setFotoModal] = useState<string | null>(null);

    const estagiosFiltrados = estagios.filter((e) => {
        const aluno = candidatos.find(c => c.id === e.candidatoId);
        const nomeAluno = aluno?.nome?.toLowerCase() || '';
        const tituloEst = e.titulo?.toLowerCase() || '';
        const matchBusca = nomeAluno.includes(busca.toLowerCase()) || tituloEst.includes(busca.toLowerCase());

        if (filtroStatus === 'pendentes') return matchBusca && e.status === 'pendente';
        if (filtroStatus === 'aprovados') return matchBusca && e.status === 'aprovado';
        return matchBusca;
    });

    const pendentesCount = estagios.filter(e => e.status === 'pendente').length;
    const aprovadosCount = estagios.filter(e => e.status === 'aprovado').length;

    const getTipoLabel = (tipo: string) => {
        switch (tipo) {
            case 'santa_ceia': return 'Apoio na Santa Ceia';
            case 'visita_enfermos': return 'Visitação aos Enfermos';
            case 'portaria_acolhimento': return 'Portaria & Acolhimento';
            case 'culto_direcao': return 'Direção de Culto';
            case 'evangelismo': return 'Evangelismo & Rua';
            case 'acao_social': return 'Ação Social';
            default: return tipo;
        }
    };

    return (
        <div className="space-y-5 animate-fadeIn">
            {/* Cabeçalho */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="text-sky-600" size={20} />
                        <span>Homologação de Estágio do Altar & Prática Ministerial</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                        Audite e homologue as horas de serviço ministerial prestadas pelos candidatos na igreja e congregações.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black">
                        {pendentesCount} Pendentes
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-black">
                        {aprovadosCount} Homologados
                    </span>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                    <Search size={16} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por aluno, tipo ou local da atividade..."
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
                        onClick={() => setFiltroStatus('aprovados')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            filtroStatus === 'aprovados'
                                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Homologados ({aprovadosCount})
                    </button>
                    <button
                        onClick={() => setFiltroStatus('todos')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            filtroStatus === 'todos'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Todos ({estagios.length})
                    </button>
                </div>
            </div>

            {/* Lista de Registros de Estágio */}
            <div className="space-y-3">
                {estagiosFiltrados.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                        Nenhum registro de estágio prático encontrado com os critérios selecionados.
                    </div>
                ) : (
                    estagiosFiltrados.map((est) => {
                        const aluno = candidatos.find(c => c.id === est.candidatoId);

                        return (
                            <div
                                key={est.id}
                                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-black text-sm shrink-0">
                                            {(aluno?.nome || 'A').charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                                    {aluno?.nome || 'Aluno Candidato'}
                                                </h4>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 font-bold uppercase">
                                                    {getTipoLabel(est.tipoAtividade)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {formatDateLocal(est.dataAtividade)}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    {est.local || 'Templo Sede'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-black px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                                            {est.horas} Horas
                                        </span>

                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                            est.status === 'aprovado'
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                : est.status === 'rejeitado'
                                                    ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                        }`}>
                                            {est.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h5 className="text-xs font-black text-slate-800 dark:text-slate-200">
                                        {est.titulo}
                                    </h5>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        {est.descricao}
                                    </p>
                                </div>

                                {est.comprovanteFoto && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setFotoModal(est.comprovanteFoto || null)}
                                            className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            <Camera size={14} />
                                            <span>Ver Foto Comprovatória da Ação</span>
                                        </button>
                                    </div>
                                )}

                                {est.status === 'pendente' && (
                                    <div className="flex items-center justify-end gap-2 pt-1">
                                        <button
                                            onClick={() => onAprovarEstagio(est.id, 'rejeitado')}
                                            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                        >
                                            <X size={14} />
                                            <span>Solicitar Revisão</span>
                                        </button>
                                        <button
                                            onClick={() => onAprovarEstagio(est.id, 'aprovado')}
                                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                                        >
                                            <Check size={14} />
                                            <span>Homologar {est.horas}h no Prontuário</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal de Foto */}
            {fotoModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4" onClick={() => setFotoModal(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 max-w-lg w-full shadow-2xl space-y-3" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-600">Comprovante de Estágio</span>
                            <button onClick={() => setFotoModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <img src={fotoModal} alt="Comprovante" className="w-full max-h-[70vh] object-contain rounded-2xl" />
                    </div>
                </div>
            )}
        </div>
    );
};
