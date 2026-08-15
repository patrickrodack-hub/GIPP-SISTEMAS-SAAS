import React, { useState } from 'react';
import { 
    Bell, Send, Plus, MessageCircle, AlertTriangle, Pin, 
    Clock, CheckCircle, Copy, Share2, Users, Check
} from 'lucide-react';
import { AvisoTurma, TurmaFormacao, CandidatoObreiro } from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal, getTodayDate, copyToClipboard } from '../../utils/sharedHelpers';

interface TabAvisosLembretesProps {
    avisos?: AvisoTurma[];
    turmas?: TurmaFormacao[];
    candidatos?: CandidatoObreiro[];
    onSalvarAviso: (aviso: AvisoTurma) => void;
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TabAvisosLembretes: React.FC<TabAvisosLembretesProps> = ({
    avisos = [],
    turmas = [],
    candidatos = [],
    onSalvarAviso,
    addToast
}) => {
    const listaAvisos = avisos || [];
    const listaTurmas = turmas || [];
    const listaCandidatos = candidatos || [];

    const [selectedTurmaId, setSelectedTurmaId] = useState<string>(listaTurmas[0]?.id || '');
    const [showModalNovoAviso, setShowModalNovoAviso] = useState(false);

    const [formAviso, setFormAviso] = useState<{
        titulo: string;
        mensagem: string;
        urgencia: 'normal' | 'alta' | 'urgente';
        fixado: boolean;
    }>({
        titulo: '',
        mensagem: '',
        urgencia: 'normal',
        fixado: false
    });

    const activeTurma = listaTurmas.find(t => t.id === selectedTurmaId) || listaTurmas[0];
    const avisosDaTurma = listaAvisos.filter(a => a && a.turmaId === activeTurma?.id);
    const alunosDaTurma = listaCandidatos.filter(c => c && activeTurma?.alunosIds?.includes(c.id));

    const handleCriarAviso = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formAviso.titulo.trim() || !formAviso.mensagem.trim()) {
            addToast("Preencha o título e a mensagem do aviso.", "error");
            return;
        }

        const novo: AvisoTurma = {
            id: `aviso_${Date.now()}`,
            turmaId: activeTurma?.id || 'geral',
            turmaNome: activeTurma?.nome || 'Turma Geral',
            titulo: formAviso.titulo,
            mensagem: formAviso.mensagem,
            dataPublicacao: getTodayDate(),
            autorNome: 'Coordenação de Ensino',
            fixado: formAviso.fixado,
            urgencia: formAviso.urgencia
        };

        onSalvarAviso(novo);
        setShowModalNovoAviso(false);
        setFormAviso({
            titulo: '',
            mensagem: '',
            urgencia: 'normal',
            fixado: false
        });
        addToast("Aviso publicado no mural da turma com sucesso!", "success");
    };

    // Gerar link e texto do WhatsApp para aluno com pendências
    const handleDispararWhatsApp = (aluno: CandidatoObreiro) => {
        const textoMsg = `*UNIVERSIDADE TEOLÓGICA GIPP / CGADB*\n\n` +
            `Paz do Senhor, querido(a) ${aluno.nome}!\n\n` +
            `Informamos que você possui atividades/lições em andamento no curso de *Formação de Obreiros* (${(aluno.nivelPretendido || 'diacono').toUpperCase()}).\n` +
            `• Progresso Atual: *${aluno.progressoTeorico || 0}%*\n` +
            `• Horas de Estágio: *${aluno.horasEstagioCumpridas || 0}h*\n\n` +
            `Por favor, acesse seu portal do obreiro e submeta suas avaliações para cumprir os prazos do cronograma letivo.\n\n` +
            `_Deus abençoe ricamente seu ministério!_`;

        const encoded = encodeURIComponent(textoMsg);
        const foneLimpo = (aluno.telefone || '').replace(/\D/g, '');

        if (foneLimpo.length >= 10) {
            window.open(`https://wa.me/55${foneLimpo}?text=${encoded}`, '_blank');
        } else {
            copyToClipboard(textoMsg);
            addToast("Mensagem copiada para a área de transferência! (Telefone não cadastrado)", "info");
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Bell size={18} className="text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Mural de Avisos & Lembretes da Turma
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Publique avisos oficiais no portal do aluno e dispare lembretes de prazos no WhatsApp com 1 clique.
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
                        onClick={() => setShowModalNovoAviso(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                        <Plus size={15} />
                        <span>Publicar Aviso</span>
                    </button>
                </div>
            </div>

            {/* Grid Principal: Mural na Esquerda & Lembretes na Direita */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Coluna 1 & 2: Mural de Avisos */}
                <div className="md:col-span-2 space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 px-1">
                        Mural de Comunicados Oficiais ({avisosDaTurma.length})
                    </h3>

                    {avisosDaTurma.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                            Nenhum aviso publicado no mural para esta turma ainda.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {avisosDaTurma.map(av => (
                                <div 
                                    key={av.id} 
                                    className={`p-5 rounded-3xl border shadow-xs space-y-3 ${
                                        av.fixado 
                                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20' 
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {av.fixado && (
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-600 text-white flex items-center gap-1">
                                                    <Pin size={10} /> Fixado
                                                </span>
                                            )}
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                                av.urgencia === 'urgente'
                                                    ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600'
                                                    : av.urgencia === 'alta'
                                                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                                            }`}>
                                                Prioridade {av.urgencia}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-slate-400 font-bold">{formatDateLocal(av.dataPublicacao)}</span>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{av.titulo}</h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5 whitespace-pre-wrap">
                                            {av.mensagem}
                                        </p>
                                    </div>

                                    <div className="text-[10px] text-slate-400 font-bold border-t pt-2 border-slate-100 dark:border-slate-800">
                                        Publicado por: {av.autorNome}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Coluna 3: Disparador de Lembretes WhatsApp para Alunos */}
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 px-1">
                        Disparo de Lembretes WhatsApp ({alunosDaTurma.length})
                    </h3>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                        <p className="text-[11px] text-slate-500">
                            Envie notificações de pendência doutrinária e cronograma diretamente ao WhatsApp do aluno:
                        </p>

                        <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                            {alunosDaTurma.map(al => (
                                <div key={al.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h5 className="font-bold text-slate-900 dark:text-white truncate">{al.nome}</h5>
                                        <span className="text-[10px] font-bold text-emerald-600">{al.progressoTeorico || 0}%</span>
                                    </div>

                                    <button
                                        onClick={() => handleDispararWhatsApp(al)}
                                        className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                                    >
                                        <MessageCircle size={13} />
                                        <span>Notificar no WhatsApp</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Publicar Aviso */}
            {showModalNovoAviso && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Publicar Aviso no Mural</h3>
                            <button onClick={() => setShowModalNovoAviso(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleCriarAviso} className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Título do Comunicado</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: 📢 Prova de Fixação Doutrinária neste Sábado"
                                    value={formAviso.titulo}
                                    onChange={(e) => setFormAviso(p => ({ ...p, titulo: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Conteúdo da Mensagem</label>
                                <textarea
                                    rows={4}
                                    required
                                    placeholder="Descreva as orientações para os alunos da turma..."
                                    value={formAviso.mensagem}
                                    onChange={(e) => setFormAviso(p => ({ ...p, mensagem: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Nível de Urgência</label>
                                    <select
                                        value={formAviso.urgencia}
                                        onChange={(e) => setFormAviso(p => ({ ...p, urgencia: e.target.value as any }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="alta">Alta Prioridade</option>
                                        <option value="urgente">Urgente</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="fixarAviso"
                                        checked={formAviso.fixado}
                                        onChange={(e) => setFormAviso(p => ({ ...p, fixado: e.target.checked }))}
                                        className="w-4 h-4 rounded text-emerald-600"
                                    />
                                    <label htmlFor="fixarAviso" className="font-bold text-slate-800 dark:text-slate-200">
                                        Fixar no Topo
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md mt-4 cursor-pointer"
                            >
                                Publicar no Mural da Turma
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
