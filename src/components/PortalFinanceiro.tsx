import { generatePixPayload } from "../utils/pixHelper";
import { InformeRendimentosIRPF } from "./InformeRendimentosIRPF";
import React, { useState, useContext, useMemo } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, 
  Printer, Download, Calendar, CheckCircle, AlertCircle, FileText, 
  Filter, Receipt, RefreshCw, Sparkles, User, CreditCard, ShieldCheck, 
  PieChart as PieChartIcon, Check, Copy, Clock, Layers,
  Heart, Zap, Loader2, Search, X, CheckCheck, Eye, Upload
} from "lucide-react";
import { ChurchContext } from "../context/ChurchContext";
import { Button, formatDateLocal, getTodayDate, copyToClipboard } from "../utils/sharedHelpers";

const PortalFinanceiro = ({ user, db, isTesoureiro }) => {
    const { addToast, dbFirestore, appId, collection, addDoc, logAction, setDoc, doc, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext);
    const [showInformeIRPF, setShowInformeIRPF] = useState(false);

    const handleGerarRelatorioAuditoria = () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        // filtrar todos os lançamentos financeiros do mês atual
        const lancamentosMesAtual = (db.financeiro || []).filter((item: any) => {
            const dStr = item.data_competencia || item.data_vencimento || item.data_pagamento || item.created_at;
            if (!dStr) return false;
            const dateOfItem = new Date(dStr);
            return dateOfItem.getFullYear() === currentYear && dateOfItem.getMonth() === currentMonth;
        });

        setPrintData({
            financeiro: lancamentosMesAtual,
            igreja: db.igreja
        });
        setPrintMode('rel_auditoria_financeira');
        setPreviewOpen(true);
        addToast("A gerar relatório de auditoria...", "success");
    };
    
    // Helpres para máscara de moeda BRL (BRL Currency Mask Helpers)
    const parseBRLToFloat = (value: string | number) => {
        if (!value) return 0;
        if (typeof value === 'number') return value;
        const cleanValue = value.replace(/\D/g, "");
        if (!cleanValue) return 0;
        return parseInt(cleanValue, 10) / 100;
    };

    const formatBRL = (value: string | number) => {
        if (value === undefined || value === null) return "";
        let cleanValue = "";
        if (typeof value === 'number') {
            cleanValue = Math.round(value * 100).toString();
        } else {
            cleanValue = value.replace(/\D/g, "");
        }
        if (!cleanValue) return "";
        const cents = parseInt(cleanValue, 10);
        const floatValue = cents / 100;
        return floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Funções para manipular comprovantes de contribuição pelo membro
    const handleUploadComprovante = (e, item) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 500 * 1024) {
            addToast("O comprovante deve ter no máximo 500KB.", "warning");
            return;
        }
        
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64Data = reader.result;
                if (!item.id) {
                    addToast("Não foi possível encontrar a ID do registro.", "error");
                    return;
                }
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', item.id), { comprovante: base64Data }, { merge: true });
                logAction('EDIÇÃO', `Membro alterou/enviou comprovante das dízimas/oferta: R$ ${item.valor}`, 'financeiro', item.id);
                addToast("Comprovante enviado com sucesso!", "success");
            } catch (error) {
                console.error(error);
                addToast("Erro ao guardar o comprovante no sistema.", "error");
            }
        };
        reader.readAsDataURL(file);
    };

    const downloadComprovante = (base64Str, category) => {
        try {
            const a = document.createElement('a');
            a.href = base64Str;
            a.download = `comprovante_${category.toLowerCase()}_${Date.now()}`;
            a.click();
            addToast("A abrir comprovativo...", "success");
        } catch (e) {
            addToast("Erro ao abrir comprovativo.", "error");
        }
    };

    // Estado para o fluxo de nova contribuição PIX Inteligente
    const [novaOferta, setNovaOferta] = useState({ valor: '', categoria: 'Dízimo', etapa: 1, payload: '', descricao: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [buscaTermo, setBuscaTermo] = useState('');
    const chavePix = db.igreja?.chave_pix;

    const minhasContribuicoes = (db.financeiro || [])
        .filter(f => f.tipo === 'entrada' && (f.membro_id === user.id || f.membro_nome === user.nome))
        .sort((a, b) => new Date(b.data_competencia || 0).getTime() - new Date(a.data_competencia || 0).getTime());
    
    const minhasContribuicoesFiltradas = useMemo(() => {
        const term = buscaTermo.toLowerCase();
        return minhasContribuicoes.filter(f => {
            if (!term) return true;
            const cat = (f.categoria || '').toLowerCase();
            const desc = (f.descricao || '').toLowerCase();
            const forma = (f.forma_pagamento || '').toLowerCase();
            const valorStr = String(f.valor || '');
            return cat.includes(term) || desc.includes(term) || forma.includes(term) || valorStr.includes(term);
        });
    }, [minhasContribuicoes, buscaTermo]);

    const somaFiltrada = useMemo(() => {
        return minhasContribuicoesFiltradas.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
    }, [minhasContribuicoesFiltradas]);
    
    const totalContribuido = minhasContribuicoes.filter(f => f.status === 'pago').reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

    // NOVO: Filtrar Carnês/Campanhas do membro logado
    const meusCarnes = (db.carnes || []).filter(c => c.membro_id === user.id);

    const handleGerarPix = () => {
        if (!chavePix) return addToast("A igreja ainda não configurou uma chave PIX.", "warning");
        const numericValue = parseBRLToFloat(novaOferta.valor);
        if (numericValue <= 0) return addToast("Introduza um valor válido.", "warning");
        
        // Gera o payload exato com o valor preenchido pelo membro
        const payload = generatePixPayload(chavePix, db.igreja?.nome, db.igreja?.cidade, numericValue.toString());
        setNovaOferta({ ...novaOferta, etapa: 2, payload });
    };

    const copyPix = () => {
        if (!novaOferta.payload) return;
        copyToClipboard(novaOferta.payload);
        addToast("Código PIX 'Copia e Cola' gerado e copiado com sucesso!", "success");
    };

    const handleConfirmarPagamento = async () => {
        setIsSaving(true);
        const dataAtual = new Date().toISOString().split('T')[0];
        try {
            const numericValue = parseBRLToFloat(novaOferta.valor);
            const descPersonalizada = novaOferta.descricao ? ` - Metadados: ${novaOferta.descricao.toUpperCase()}` : '';
            const novaEntrada = {
                tipo: 'entrada',
                valor: numericValue,
                categoria: novaOferta.categoria,
                descricao: `Contribuição via Portal (${novaOferta.categoria})${descPersonalizada}`,
                data_competencia: dataAtual,
                forma_pagamento: 'PIX',
                status: 'pago',
                conciliado: false, // CRUCIAL: Isto atira para a Conciliação Bancária
                membro_id: user.id,
                membro_nome: user.nome,
                congregacao_id: user.congregacao_id || 'sede',
                created_at: new Date().toISOString()
            };

            const docRef = await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro'), novaEntrada);
            logAction('CRIAÇÃO', `Membro enviou notificação de pagamento PIX de ${formatBRL(novaOferta.valor)}`, 'financeiro', docRef.id);
            
            addToast('Notificação enviada! A aguardar conferência da Tesouraria.', 'success');
            setNovaOferta({ valor: '', categoria: 'Dízimo', etapa: 1, payload: '', descricao: '' });
        } catch (e) {
            console.error(e);
            addToast('Erro ao comunicar com a secretaria.', 'error');
        }
        setIsSaving(false);
    };

    return (
        <div id="portal_financas" className="space-y-6 animate-entrance pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-0"><DollarSign size={28} className="text-emerald-500"/> Meus Dízimos e Ofertas</h2>
                <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                    <button 
                        onClick={() => setShowInformeIRPF(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 cursor-pointer"
                    >
                        <Receipt size={16}/> Comprovante Anual IRPF
                    </button>
                    {isTesoureiro && (
                        <button 
                            onClick={handleGerarRelatorioAuditoria}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:-translate-y-0.5 cursor-pointer"
                        >
                            <ShieldCheck size={16}/> Relatório de Auditoria (Mês Atual)
                        </button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all duration-500 text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.2)] hover:-translate-y-1 flex items-center justify-between border border-emerald-400/50 md:col-span-1">
                    <div>
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Total Reconhecido</p>
                        <h3 className="text-3xl font-black truncate">R$ {totalContribuido.toFixed(2)}</h3>
                    </div>
                    <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm shrink-0"><Heart size={28}/></div>
                </div>

                {/* --- MÓDULO INOVADOR DE PIX COM VALOR EXATO --- */}
                <div className="md:col-span-2 bg-white hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/50 rounded-[2rem] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all duration-500 border border-emerald-100 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full pointer-events-none"></div>
                    
                    <div className="p-8 relative z-10">
                        {novaOferta.etapa === 1 ? (
                            <>
                                <h3 className="font-black text-xl text-slate-800 flex items-center gap-2 mb-2">
                                    <Zap size={20} className="text-emerald-500 fill-emerald-500"/> Realizar Contribuição (PIX)
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mb-6">Preencha o valor e escolha o destino. O sistema irá gerar um código PIX com a quantia exata para o seu banco.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Valor a Transferir</label>
                                            <input 
                                                type="text" 
                                                inputMode="numeric"
                                                placeholder="R$ 0,00"
                                                value={novaOferta.valor}
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    const formatted = formatBRL(raw);
                                                    setNovaOferta({...novaOferta, valor: formatted});
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-emerald-600 font-black text-lg focus:border-emerald-500 outline-none shadow-inner"
                                            />
                                        </div>
                                        
                                        {/* Botoões de Valores Rápidos (Presets) */}
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {[20, 50, 100, 200, 500].map((val) => (
                                                <button 
                                                    key={val}
                                                    type="button"
                                                    onClick={() => {
                                                        const brixValue = formatBRL((val * 100).toString());
                                                        setNovaOferta(prev => ({...prev, valor: brixValue}));
                                                    }}
                                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 hover:text-emerald-600 rounded-lg text-[11px] font-black tracking-tight text-slate-600 transition-all cursor-pointer"
                                                >
                                                    R$ {val}
                                                </button>
                                            ))}
                                            <button 
                                                type="button"
                                                onClick={() => setNovaOferta(prev => ({...prev, valor: ''}))}
                                                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 text-rose-600 rounded-lg text-[11px] font-black tracking-tight transition-all cursor-pointer"
                                            >
                                                Limpar
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Destino / Categoria</label>
                                            <select 
                                                value={novaOferta.categoria}
                                                onChange={(e) => setNovaOferta({...novaOferta, categoria: e.target.value || ""})}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-700 font-black focus:border-[#10b981] outline-none shadow-sm cursor-pointer"
                                            >
                                                <option value="Dízimo">Dízimo Mensal</option>
                                                <option value="Oferta">Oferta Alçada</option>
                                                <option value="Missões">Carnê / Voto de Missões</option>
                                                <option value="Construção">Campanha de Construção</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Observação / Descrição (Opcional)</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: Dízimo de Maio, Oferta de Missões..."
                                                value={novaOferta.descricao}
                                                onChange={e => setNovaOferta({...novaOferta, descricao: e.target.value})}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-800 text-xs font-bold focus:border-[#10b981] outline-none shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={handleGerarPix} variant="success" className="w-full shadow-emerald-500/20 py-3.5 cursor-pointer flex items-center justify-center gap-2">
                                    <Zap size={16} /> Gerar Código PIX
                                </Button>
                            </>
                        ) : (
                            <div className="flex flex-col md:flex-row items-center gap-6 animate-scale-in">
                                <div className="bg-emerald-50 p-2 rounded-2xl shrink-0 border border-emerald-100 relative">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(novaOferta.payload)}&color=047857`} alt="QR Code PIX" className="w-32 h-32 object-contain rounded-xl"/>
                                </div>
                                <div className="flex-1 text-center md:text-left w-full">
                                    <h3 className="font-black text-emerald-600 text-lg mb-1">PIX Pronto a Pagar</h3>
                                    <p className="text-xs text-slate-500 font-bold mb-4 uppercase tracking-wider">{novaOferta.categoria} • <span className="text-slate-800">{formatBRL(novaOferta.valor)}</span></p>
                                    
                                    <Button onClick={copyPix} variant="secondary" className="w-full justify-center mb-3 bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700">
                                        <Copy size={16}/> Copiar "PIX Copia e Cola"
                                    </Button>
                                    
                                    <Button onClick={handleConfirmarPagamento} disabled={isSaving} variant="success" className="w-full justify-center shadow-emerald-500/30 bg-gradient-to-r from-emerald-500 to-teal-600">
                                        {isSaving ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>} 
                                        {isSaving ? 'A Notificar...' : 'Já Paguei! (Notificar Tesouraria)'}
                                    </Button>
                                    
                                    <button onClick={() => setNovaOferta({...novaOferta, etapa: 1})} className="w-full mt-3 text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors">
                                        Cancelar / Voltar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white hover:bg-gradient-to-br hover:from-white hover:to-slate-50 transition-all duration-500 rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.2)] border border-slate-100 p-8 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="font-bold text-slate-700 text-lg">Meu Histórico Financeiro</h3>
                        <p className="text-xs text-slate-400">Verifique os registos das suas contribuições</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                            <input 
                                type="text" 
                                placeholder="Buscar dízimo, oferta ou valor..." 
                                value={buscaTermo} 
                                onChange={e => setBuscaTermo(e.target.value)} 
                                className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl w-64 text-sm outline-none focus:border-emerald-500 shadow-sm bg-white"
                            />
                            {buscaTermo && (
                                <button onClick={() => setBuscaTermo('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-rose-500">
                                    <X size={14}/>
                                </button>
                            )}
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest border border-emerald-100">Transações</span>
                    </div>
                </div>

                {/* CARD DE RESUMO DINÂMICO NO TOPO DA TABELA */}
                <div className="bg-emerald-50 bg-opacity-40 border border-emerald-100 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/10">
                            <TrendingUp size={18}/>
                        </span>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Soma dos Valores Filtrados</p>
                            <p className="text-xs text-slate-500">Valor total atualizado conforme o filtro ou pesquisa em tempo real</p>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-center sm:items-end">
                        <span className="text-xl font-black text-emerald-600 leading-none">R$ {somaFiltrada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-[10px] text-slate-400 font-bold mt-1.5">{minhasContribuicoesFiltradas.length} lançado(s)</span>
                    </div>
                </div>

                {minhasContribuicoesFiltradas.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                                <tr>
                                    <th className="pb-3 pr-4">Data</th>
                                    <th className="pb-3 pr-4">Tipo/Categoria</th>
                                    <th className="pb-3 pr-4 text-right">Valor (R$)</th>
                                    <th className="pb-3 text-center">Status (Tesouraria)</th>
                                    <th className="pb-3 text-center">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {minhasContribuicoesFiltradas.map((f, i) => {
                                    const pendenteValidacao = f.conciliado === false;
                                    return (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 pr-4 font-medium text-slate-600 whitespace-nowrap">{formatDateLocal(f.data_competencia)}</td>
                                        <td className="py-4 pr-4">
                                            <span className="font-bold text-slate-800 block leading-tight">{f.categoria}</span>
                                            <span className="text-[9px] text-slate-500 font-bold uppercase">{f.forma_pagamento || 'PIX'}</span>
                                        </td>
                                        <td className="py-4 pr-4 text-right font-black text-emerald-600 whitespace-nowrap">R$ {parseFloat(f.valor).toFixed(2)}</td>
                                        <td className="py-4 text-center">
                                            {pendenteValidacao ? (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">
                                                    <Clock size={10}/> Em Análise
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-200">
                                                    <CheckCheck size={10}/> Confirmado
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {f.comprovante ? (
                                                    <button
                                                        onClick={() => downloadComprovante(f.comprovante, f.categoria)}
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-xl border border-indigo-100 transition-colors shadow-sm select-none"
                                                        title="Ver Comprovante"
                                                    >
                                                        <Eye size={13} />
                                                        <span>Ver</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 font-medium italic">Sem anexo</span>
                                                )}

                                                {pendenteValidacao && (
                                                    <>
                                                        <label
                                                            htmlFor={`replace-file-${f.id || i}`}
                                                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-100 cursor-pointer transition-colors shadow-sm select-none"
                                                            title={f.comprovante ? "Substituir Comprovante" : "Anexar Comprovante"}
                                                        >
                                                            <Upload size={13} />
                                                            <span>{f.comprovante ? "Substituir" : "Enviar"}</span>
                                                        </label>
                                                        <input
                                                            type="file"
                                                            id={`replace-file-${f.id || i}`}
                                                            className="hidden"
                                                            accept="image/*,application/pdf"
                                                            onChange={(e) => handleUploadComprovante(e, f)}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 flex flex-col items-center">
                        <Receipt size={40} className="text-[#444] mb-3"/>
                        <p className="text-[#A0A0A0] text-sm font-bold">Nenhum registo de contribuição encontrado.</p>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 overflow-hidden mt-6">
                <h3 className="font-bold text-slate-700 mb-6">Minhas Campanhas e Carnês</h3>
                {meusCarnes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {meusCarnes.map(carne => {
                            const totalPago = (carne.parcelas || []).filter(p => p.status === 'pago').reduce((a, b) => a + (parseFloat(b.valor) || 0), 0);
                            const totalEsperado = parseFloat(carne.valor_total) || 0;
                            const perc = totalEsperado > 0 ? Math.round((totalPago / totalEsperado) * 100) : 0;
                            
                            return (
                                <div key={carne.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50">
                                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-2">{carne.titulo}</h4>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-bold text-slate-700">R$ {totalPago.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">de R$ {totalEsperado.toFixed(2)}</span></span>
                                        <span className="text-xs font-black text-emerald-600">{perc}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
                                        <div className="h-full bg-emerald-500" style={{ width: `${perc}%` }}></div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {(carne.parcelas || []).map((p, idx) => (
                                            <div key={idx} className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${p.status === 'pago' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-400 border-slate-200'}`} title={`Vencimento: ${formatDateLocal(p.vencimento)}`}>
                                                P{p.numero}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 flex flex-col items-center">
                        <CreditCard size={40} className="text-slate-300 mb-3"/>
                        <p className="text-slate-500 text-sm font-bold">Nenhum carnê ou campanha ativa.</p>
                    </div>
                )}
            </div>

            {/* MODAL INFORME ANUAL DE RENDIMENTOS / IRPF NO PORTAL DO MEMBRO */}
            {showInformeIRPF && (
                <div className="fixed inset-0 bg-slate-950/70 z-[11000] overflow-y-auto p-4 md:p-8 backdrop-blur-xs flex justify-center items-start">
                    <div className="w-full max-w-5xl bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl p-4 md:p-6 my-auto">
                        <InformeRendimentosIRPF isPortalView={true} initialMembroId={user?.id} onClose={() => setShowInformeIRPF(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortalFinanceiro;
export { PortalFinanceiro };
