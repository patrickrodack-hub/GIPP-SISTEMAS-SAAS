import React, { useState, useContext, useMemo } from 'react';
import { 
  HeartHandshake, Plus, Edit, Trash2, Phone, MessageCircle, 
  UserPlus, BookOpen, CheckCircle, Search, Filter, Calendar,
  Clock, Sparkles, Send, CheckSquare, Heart, AlertCircle, Copy,
  Check, UserCheck, ChevronRight, HelpCircle
} from 'lucide-react';

import {
  ChurchContext, Button, FormInput, FormSelect,
  getTodayDate, formatDateLocal, copyToClipboard
} from '../App';

const ModuleVisitantes = () => {
    const { db, openModal, setDoc, doc, dbFirestore, appId, addToast, deleteItem, logAction } = useContext(ChurchContext);
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplateModal, setSelectedTemplateModal] = useState<any | null>(null);
    const [copiedMsg, setCopiedMsg] = useState(false);

    const visitantes = (db.visitantes || []).filter(v => {
        const matchesCong = congregacaoFilter === 'todas' || 
            v.congregacao_id === congregacaoFilter || 
            (!v.congregacao_id && congregacaoFilter === 'sede');
        
        const matchesSearch = !searchTerm || 
            (v.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.telefone || '').includes(searchTerm) ||
            (v.obs || '').toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCong && matchesSearch;
    });

    const handleDragStart = (e: React.DragEvent, id: string) => { 
        e.dataTransfer.setData('visitanteId', id); 
    };
    
    const handleDragOver = (e: React.DragEvent) => { 
        e.preventDefault(); 
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('visitanteId');
        if (!id) return;
        const vis = visitantes.find(v => v.id === id);
        if (vis && vis.status !== newStatus) {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'visitantes', id), { 
                    status: newStatus,
                    updated_at: new Date().toISOString()
                }, { merge: true });
                logAction('EDIÇÃO', `Moveu visitante "${vis.nome}" para o funil: ${newStatus}`, 'visitantes', id);
                addToast(`Visitante movido para "${newStatus}"!`, "success");
            } catch (err) { 
                addToast("Erro ao atualizar o funil.", "error"); 
            }
        }
    };

    // Calculate days since visit
    const getDaysSinceVisit = (dateStr: string) => {
        if (!dateStr) return 0;
        const visitDate = new Date(dateStr);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - visitDate.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    // Template Messages for Régua de Consolidação
    const getConsolidationTemplates = (vis: any) => {
        const primeiroNome = (vis.nome || 'Irmão(ã)').split(' ')[0];
        const igrejaNome = db.igreja?.nome || 'nossa Igreja';
        const pastorNome = db.igreja?.pastor || 'o Pastor';

        return [
            {
                regua: 'D+1',
                titulo: 'Boas-Vindas e Agradecimento (D+1 pós-culto)',
                desc: 'Enviar na segunda-feira ou dia seguinte ao culto',
                badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
                texto: `A Paz do Senhor, ${primeiroNome}! 🙏\n\nQue alegria imensa ter você conosco no culto da ${igrejaNome}! Toda a nossa liderança e ${pastorNome} ficaram muito felizes com a sua presença.\n\nSaiba que você e sua família são sempre bem-vindos em nossa casa. Estamos orando pela sua vida e projetos esta semana!\n\nUm forte abraço na paz de Cristo!`
            },
            {
                regua: 'D+3',
                titulo: 'Cuidado & Pedido de Oração (D+3 meio de semana)',
                desc: 'Enviar na quarta-feira para apoio e intercessão',
                badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
                texto: `Olá ${primeiroNome}, a Paz do Senhor!\n\nPassando para saber como está sendo a sua semana e se podemos colocar algum pedido especial de oração por você ou por sua família na nossa reunião de clamor da ${igrejaNome}.\n\nSe precisar de qualquer apoio ou conversa com a nossa equipe de acolhimento, estamos à sua inteira disposição!`
            },
            {
                regua: 'D+6',
                titulo: 'Convite Especial de Fim de Semana (D+6)',
                desc: 'Enviar na sexta ou sábado convidando para o próximo culto/célula',
                badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                texto: `A Paz do Senhor, querido(a) ${primeiroNome}!\n\nNeste fim de semana teremos um culto muito especial na ${igrejaNome} e gostaríamos muito de celebrar com você novamente! O Senhor tem uma palavra poderosa preparada para o seu coração.\n\nSerá um privilégio recebê-lo(a) mais uma vez. Te esperamos com muito carinho!`
            }
        ];
    };

    const handleSendWhatsApp = (telefone: string, text: string) => {
        if (!telefone) {
            addToast("Visitante não possui número de telefone cadastrado.", "warning");
            return;
        }
        const cleanNumber = telefone.replace(/\D/g, '');
        const encoded = encodeURIComponent(text);
        window.open(`https://wa.me/${cleanNumber.length <= 11 ? '55' + cleanNumber : cleanNumber}?text=${encoded}`, '_blank');
    };

    const columns = [
        { id: '1ª Visita', label: '1ª Visita', color: 'rose', bgClass: 'bg-rose-50/70', borderClass: 'border-rose-200', textClass: 'text-rose-700', icon: UserPlus },
        { id: 'Contato Feito', label: 'Contato Feito', color: 'amber', bgClass: 'bg-amber-50/70', borderClass: 'border-amber-200', textClass: 'text-amber-700', icon: MessageCircle },
        { id: 'Em Discipulado', label: 'Em Discipulado', color: 'blue', bgClass: 'bg-blue-50/70', borderClass: 'border-blue-200', textClass: 'text-blue-700', icon: BookOpen },
        { id: 'Integrado', label: 'Integrado', color: 'emerald', bgClass: 'bg-emerald-50/70', borderClass: 'border-emerald-200', textClass: 'text-emerald-700', icon: CheckCircle }
    ];

    // Funnel Analytics
    const stats = useMemo(() => {
        const total = visitantes.length;
        const primeiravisita = visitantes.filter(v => v.status === '1ª Visita').length;
        const emContato = visitantes.filter(v => v.status === 'Contato Feito').length;
        const discipulado = visitantes.filter(v => v.status === 'Em Discipulado').length;
        const integrados = visitantes.filter(v => v.status === 'Integrado').length;
        const taxaIntegracao = total > 0 ? ((integrados / total) * 100).toFixed(1) : '0';
        return { total, primeiravisita, emContato, discipulado, integrados, taxaIntegracao };
    }, [visitantes]);

    return (
        <div className="h-full flex flex-col space-y-5 animate-entrance">
            {/* Top Bar Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl shadow-xs border border-rose-100">
                        <HeartHandshake size={28}/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Visitantes & Consolidação</h2>
                        <p className="text-xs text-slate-500 font-bold mt-0.5 uppercase tracking-wider">
                            Régua de Contatos D+1, D+3, D+6 & Funil de Integração Pastoral
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-56">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar visitante..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500/20"
                        />
                    </div>
                    <select 
                        value={congregacaoFilter} 
                        onChange={e => setCongregacaoFilter(e.target.value)} 
                        className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none shadow-xs cursor-pointer"
                    >
                        <option value="todas">🏢 Todas as Filiais</option>
                        <option value="sede">Sede Principal</option>
                        {(db.congregacoes||[]).map((c: any)=><option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <Button 
                        onClick={() => openModal('visitante', { status: '1ª Visita', data_visita: getTodayDate() })} 
                        variant="primary" 
                        className="shadow-md bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                        <Plus size={16}/> Novo Visitante
                    </Button>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total no CRM</span>
                        <span className="text-xl font-black text-slate-800">{stats.total}</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">👥</div>
                </div>
                <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100 flex items-center justify-between shadow-2xs">
                    <div>
                        <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider block">1ª Visita (D+1)</span>
                        <span className="text-xl font-black text-rose-700">{stats.primeiravisita}</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold">✨</div>
                </div>
                <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100 flex items-center justify-between shadow-2xs">
                    <div>
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">Contato Feito (D+3)</span>
                        <span className="text-xl font-black text-amber-700">{stats.emContato}</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold">💬</div>
                </div>
                <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 flex items-center justify-between shadow-2xs">
                    <div>
                        <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider block">Em Discipulado</span>
                        <span className="text-xl font-black text-blue-700">{stats.discipulado}</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">📖</div>
                </div>
                <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-2xs">
                    <div>
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">Taxa Integração</span>
                        <span className="text-xl font-black text-emerald-700">{stats.taxaIntegracao}%</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">🎯</div>
                </div>
            </div>

            {/* Funnel Board Columns */}
            <div className="flex-1 flex gap-5 overflow-x-auto custom-scrollbar pb-3 pt-1 items-start min-h-[500px]">
                {columns.map(col => {
                    const colVisitantes = visitantes.filter(v => v.status === col.id);
                    return (
                        <div 
                            key={col.id} 
                            className={`w-[320px] shrink-0 h-full max-h-[calc(100vh-250px)] flex flex-col ${col.bgClass} rounded-3xl border ${col.borderClass} shadow-2xs transition-all`} 
                            onDragOver={handleDragOver} 
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            <div className={`p-4 border-b ${col.borderClass} flex justify-between items-center bg-white/70 rounded-t-3xl backdrop-blur-xs`}>
                                <h4 className={`font-black ${col.textClass} flex items-center gap-2 tracking-tight text-xs uppercase`}>
                                    <col.icon size={16} /> {col.label}
                                </h4>
                                <span className={`bg-white ${col.textClass} border ${col.borderClass} text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs`}>
                                    {colVisitantes.length}
                                </span>
                            </div>

                            <div className="p-3.5 flex-1 overflow-y-auto custom-scrollbar space-y-3.5">
                                {colVisitantes.map(vis => {
                                    const daysAgo = getDaysSinceVisit(vis.data_visita);
                                    let reguaLabel = 'Recente';
                                    let reguaColor = 'bg-slate-100 text-slate-700';
                                    if (daysAgo === 1) { reguaLabel = 'D+1 (Agradecer)'; reguaColor = 'bg-rose-100 text-rose-800 border-rose-200'; }
                                    else if (daysAgo >= 2 && daysAgo <= 4) { reguaLabel = `D+${daysAgo} (Oração)`; reguaColor = 'bg-amber-100 text-amber-800 border-amber-200'; }
                                    else if (daysAgo >= 5 && daysAgo <= 7) { reguaLabel = `D+${daysAgo} (Convidar)`; reguaColor = 'bg-blue-100 text-blue-800 border-blue-200'; }
                                    else if (daysAgo > 7) { reguaLabel = `${daysAgo}d atrás`; reguaColor = 'bg-slate-100 text-slate-600 border-slate-200'; }

                                    return (
                                        <div 
                                            key={vis.id} 
                                            draggable 
                                            onDragStart={(e) => handleDragStart(e, vis.id)} 
                                            className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <div className="flex flex-wrap gap-1.5 items-center">
                                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                                                        {formatDateLocal(vis.data_visita)}
                                                    </span>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${reguaColor}`}>
                                                        {reguaLabel}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => openModal('visitante', vis)} 
                                                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded-lg transition-colors cursor-pointer"
                                                        title="Editar Cadastro"
                                                    >
                                                        <Edit size={14}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteItem('visitante', vis.id)} 
                                                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-colors cursor-pointer"
                                                        title="Remover"
                                                    >
                                                        <Trash2 size={14}/>
                                                    </button>
                                                </div>
                                            </div>

                                            <h5 className="font-extrabold text-slate-800 text-sm mb-1 leading-snug">{vis.nome}</h5>
                                            
                                            {vis.bairro && (
                                                <p className="text-[11px] text-slate-500 font-medium mb-1">
                                                    📍 {vis.bairro} {vis.cidade ? `- ${vis.cidade}` : ''}
                                                </p>
                                            )}

                                            {vis.obs && (
                                                <p className="text-[11px] text-slate-500 mb-3 line-clamp-2 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                    "{vis.obs}"
                                                </p>
                                            )}

                                            {/* Action bar with Régua de Consolidação button & WhatsApp */}
                                            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center gap-2">
                                                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                                    <Phone size={12}/> {vis.telefone || 'Sem fone'}
                                                </span>
                                                
                                                <div className="flex items-center gap-1.5">
                                                    {/* Régua Pastoral Templates Trigger */}
                                                    <button
                                                        onClick={() => setSelectedTemplateModal(vis)}
                                                        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer border border-indigo-100"
                                                        title="Abrir Régua de Mensagens D+1, D+3, D+6"
                                                    >
                                                        <Sparkles size={12}/> Régua D+
                                                    </button>

                                                    {vis.telefone && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const templates = getConsolidationTemplates(vis);
                                                                handleSendWhatsApp(vis.telefone, templates[0].texto);
                                                            }} 
                                                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white p-2 rounded-xl transition-all shadow-2xs border border-emerald-100 cursor-pointer" 
                                                            title="WhatsApp Direto (Boas-Vindas)"
                                                        >
                                                            <MessageCircle size={15}/>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {colVisitantes.length === 0 && (
                                    <div className="h-28 border-2 border-dashed border-slate-300/70 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
                                        <CheckSquare size={18} className="opacity-40"/>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Arraste para cá</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Régua de Consolidação Modal (Templates D+1, D+3, D+6) */}
            {selectedTemplateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-entrance">
                    <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/10 rounded-2xl">
                                    <Sparkles size={20} className="text-amber-400"/>
                                </div>
                                <div>
                                    <h3 className="text-base font-black uppercase tracking-wide">Régua de Consolidação Pastoral</h3>
                                    <p className="text-xs text-slate-300 font-medium">Visitante: {selectedTemplateModal.nome}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedTemplateModal(null)}
                                className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Templates List */}
                        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1 bg-slate-50/50">
                            <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
                                <HelpCircle size={18} className="shrink-0 text-blue-600 mt-0.5"/>
                                <p className="leading-relaxed">
                                    A <strong>Régua de Consolidação</strong> dispara mensagens bíblicas e acolhedoras para não perder o vínculo com o visitante nos momentos-chave pós-culto.
                                </p>
                            </div>

                            {getConsolidationTemplates(selectedTemplateModal).map((tmpl, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${tmpl.badgeColor}`}>
                                                {tmpl.regua}
                                            </span>
                                            <h5 className="font-extrabold text-slate-800 text-xs mt-1">{tmpl.titulo}</h5>
                                            <p className="text-[10px] text-slate-400 font-semibold">{tmpl.desc}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                                        {tmpl.texto}
                                    </div>

                                    <div className="flex justify-end items-center gap-2 pt-1">
                                        <button
                                            onClick={() => {
                                                copyToClipboard(tmpl.texto);
                                                addToast("Texto copiado com sucesso!", "success");
                                            }}
                                            className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Copy size={13}/> Copiar
                                        </button>
                                        <button
                                            onClick={() => handleSendWhatsApp(selectedTemplateModal.telefone, tmpl.texto)}
                                            className="px-4 py-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Send size={13}/> Disparar WhatsApp
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
                            <span className="text-[11px] text-slate-400 font-bold">
                                Fone: {selectedTemplateModal.telefone || 'Não informado'}
                            </span>
                            <button
                                onClick={() => setSelectedTemplateModal(null)}
                                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModuleVisitantes;
