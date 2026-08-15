import React, { useState, useMemo } from 'react';
import { 
    Clock, Plus, CheckCircle, XCircle, AlertCircle, Camera, 
    Calendar, MapPin, Check, Filter, Search, FileText,
    TrendingUp, Award, Layers, Eye
} from 'lucide-react';
import { 
    RegistroEstagio, CandidatoObreiro, NivelMinisterial 
} from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal, getTodayDate } from '../../utils/sharedHelpers';

interface TabEstagioSupervisionadoProps {
    candidato: CandidatoObreiro;
    nivel: NivelMinisterial;
    estagios: RegistroEstagio[];
    onAbrirNovoEstagioModal: () => void;
    onAprovarEstagio: (estagioId: string, status: 'aprovado' | 'rejeitado') => Promise<void>;
    isCoordenador: boolean;
}

export const TabEstagioSupervisionado: React.FC<TabEstagioSupervisionadoProps> = ({
    candidato,
    nivel,
    estagios,
    onAbrirNovoEstagioModal,
    onAprovarEstagio,
    isCoordenador
}) => {
    const [filtroTipo, setFiltroTipo] = useState<string>('todos');
    const [filtroStatus, setFiltroStatus] = useState<string>('todos');
    const [fotoModalUrl, setFotoModalUrl] = useState<string | null>(null);

    const estagiosDoCandidato = useMemo(() => {
        return estagios.filter(e => e.candidatoId === candidato.id);
    }, [estagios, candidato]);

    const totalHorasAprovadas = useMemo(() => {
        return estagiosDoCandidato
            .filter(e => e.status === 'aprovado')
            .reduce((acc, curr) => acc + (Number(curr.horas) || 0), 0);
    }, [estagiosDoCandidato]);

    const horasExigidas = nivel.horasEstagioObrigatorias || 20;
    const progressoPercent = Math.min(100, Math.round((totalHorasAprovadas / horasExigidas) * 100));

    // Agrupamento de horas por tipo
    const horasPorTipo = useMemo(() => {
        const map: Record<string, number> = {
            santa_ceia: 0,
            visita_enfermos: 0,
            portaria_acolhimento: 0,
            culto_direcao: 0,
            evangelismo: 0,
            acao_social: 0
        };
        estagiosDoCandidato.filter(e => e.status === 'aprovado').forEach(e => {
            if (map[e.tipoAtividade] !== undefined) {
                map[e.tipoAtividade] += Number(e.horas) || 0;
            }
        });
        return map;
    }, [estagiosDoCandidato]);

    const estagiosFiltrados = useMemo(() => {
        return estagiosDoCandidato.filter(e => {
            const matchTipo = filtroTipo === 'todos' || e.tipoAtividade === filtroTipo;
            const matchStatus = filtroStatus === 'todos' || e.status === filtroStatus;
            return matchTipo && matchStatus;
        });
    }, [estagiosDoCandidato, filtroTipo, filtroStatus]);

    return (
        <div className="space-y-6">
            {/* Top Cards de Métricas de Horas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400">Total Homologado</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {totalHorasAprovadas} / {horasExigidas}h
                        </span>
                        <Clock size={20} className="text-emerald-500" />
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressoPercent}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 block">{progressoPercent}% cumprido</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400">Santa Ceia & Liturgia</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {horasPorTipo.santa_ceia}h
                        </span>
                        <Award size={20} className="text-amber-500" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-3">Distribuição dos cálices & pão</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400">Visitação & Enfermidades</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {horasPorTipo.visita_enfermos}h
                        </span>
                        <TrendingUp size={20} className="text-sky-500" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-3">Unção com óleo (Tiago 5)</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400">Evangelismo & Ação</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {horasPorTipo.evangelismo + horasPorTipo.acao_social}h
                        </span>
                        <Layers size={20} className="text-purple-500" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-3">Trabalho de rua & socorro aos pobres</p>
                </div>
            </div>

            {/* Header de Ação e Filtros */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white">Filtros:</span>
                    <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                    >
                        <option value="todos">Todos os Tipos</option>
                        <option value="santa_ceia">Santa Ceia</option>
                        <option value="visita_enfermos">Visitação aos Enfermos</option>
                        <option value="portaria_acolhimento">Portaria & Recepção</option>
                        <option value="culto_direcao">Direção de Culto</option>
                        <option value="evangelismo">Evangelismo de Rua</option>
                        <option value="acao_social">Ação Social</option>
                    </select>

                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                    >
                        <option value="todos">Todos os Status</option>
                        <option value="pendente">Pendentes</option>
                        <option value="aprovado">Aprovados</option>
                        <option value="rejeitado">Rejeitados</option>
                    </select>
                </div>

                <button
                    type="button"
                    onClick={onAbrirNovoEstagioModal}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                    <Plus size={15} />
                    <span>Lançar Nova Atividade Prática</span>
                </button>
            </div>

            {/* Lista dos Registros de Estágio */}
            <div className="space-y-3">
                {estagiosFiltrados.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                        Nenhum registro de atividade prática encontrado com os filtros selecionados.
                    </div>
                ) : (
                    estagiosFiltrados.map((est) => (
                        <div
                            key={est.id}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                    est.status === 'aprovado'
                                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                        : est.status === 'rejeitado'
                                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                }`}>
                                    <Clock size={20} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-black text-slate-900 dark:text-white">
                                            {est.titulo}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            {est.tipoAtividade.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                            <Calendar size={11} /> {formatDateLocal(est.dataAtividade)}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                            <MapPin size={11} /> {est.local}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                                        {est.descricao}
                                    </p>
                                    {est.fotoComprovante && (
                                        <button
                                            type="button"
                                            onClick={() => setFotoModalUrl(est.fotoComprovante || null)}
                                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1 cursor-pointer"
                                        >
                                            <Camera size={12} /> Ver Foto de Comprovante
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                                <div className="text-right">
                                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                                        {est.horas} Horas
                                    </span>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                        est.status === 'aprovado'
                                            ? 'bg-emerald-500/10 text-emerald-600'
                                            : est.status === 'rejeitado'
                                            ? 'bg-rose-500/10 text-rose-600'
                                            : 'bg-amber-500/10 text-amber-600'
                                    }`}>
                                        {est.status}
                                    </span>
                                </div>

                                {isCoordenador && est.status === 'pendente' && (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => onAprovarEstagio(est.id, 'aprovado')}
                                            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
                                            title="Homologar Horas"
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onAprovarEstagio(est.id, 'rejeitado')}
                                            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 dark:bg-slate-800 transition-all cursor-pointer"
                                            title="Rejeitar"
                                        >
                                            <XCircle size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Foto de Comprovante */}
            {fotoModalUrl && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 max-w-lg w-full border border-slate-700 shadow-2xl space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-black text-slate-900 dark:text-white">Comprovante da Atividade Prática</span>
                            <button onClick={() => setFotoModalUrl(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
                        </div>
                        <img 
                            src={fotoModalUrl} 
                            alt="Comprovante de Estágio" 
                            className="w-full max-h-[70vh] object-contain rounded-2xl bg-black"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
