import React, { useState, useEffect, useContext, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  LayoutDashboard, Users, CreditCard, Plus, List, Printer, Target,
  Search, Check, X, DollarSign, Activity, Sparkles, Trash2,
  MessageCircle, TrendingUp, Calendar, Award, Receipt, Clock, Loader2,
  ChevronRight, RefreshCw, Send, CheckCircle, ShieldAlert, FileText, Download,
  User, CheckCheck, Landmark
} from 'lucide-react';
import { 
  collection, doc, addDoc, setDoc, deleteDoc
} from 'firebase/firestore';

import {
  ChurchContext, Button, ConfirmModal, GenericTable
} from '../App';

const ModuleCarnes = () => {
    const { 
        db, openModal, setDoc, doc, dbFirestore, appId, addToast, 
        setPrintMode, setPrintData, setPreviewOpen, logAction 
    } = useContext(ChurchContext);
    
    const [tab, setTab] = useState(1);
    const [subTab, setSubTab] = useState('lotes'); // 'lotes' (Master-Detail) or 'membro' (Member History)
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');
    
    // Member search/filter states for creation flow
    const [singleCampaignTitle, setSingleCampaignTitle] = useState('');
    const [singleMemberId, setSingleMemberId] = useState('');
    const [singleValue, setSingleValue] = useState<number | string>('');
    const [singleInstallments, setSingleInstallments] = useState(12);
    const [singleFirstDue, setSingleFirstDue] = useState(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}-10`;
    });
    const [isCreatingSingle, setIsCreatingSingle] = useState(false);
    
    // Bulk/Lote creation flow
    const [bulkCampaignTitle, setBulkCampaignTitle] = useState('');
    const [bulkValue, setBulkValue] = useState<number>(50);
    const [bulkInstallments, setBulkInstallments] = useState(12);
    const [bulkFirstDue, setBulkFirstDue] = useState(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}-10`;
    });
    const [bulkSelectedMembers, setBulkSelectedMembers] = useState<string[]>([]);
    const [bulkSearch, setBulkSearch] = useState('');
    const [isBulkCreating, setIsBulkCreating] = useState(false);
    const [creationType, setCreationType] = useState<'individual' | 'massa'>('individual');

    // Selection inside Master-Detail
    const [selectedCarneId, setSelectedCarneId] = useState<string>('');
    const [carneSearch, setCarneSearch] = useState('');
    const [carneCampaignFilter, setCarneCampaignFilter] = useState('todas');

    // Member portfolio selection
    const [selectedPortfolioMemberId, setSelectedPortfolioMemberId] = useState<string>('');
    const [portfolioSearchMemberTerm, setPortfolioSearchMemberTerm] = useState('');

    // AI Retention suggestions
    const [aiRetention, setAiRetention] = useState('');
    const [loadingAiRetention, setLoadingAiRetention] = useState(false);

    // Delete confirmation local modal state
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Filter carnês based on current branch
    const carnes = useMemo(() => {
        return (db.carnes || []).filter(c => 
            congregacaoFilter === 'todas' || 
            c.congregacao_id === congregacaoFilter || 
            (!c.congregacao_id && congregacaoFilter === 'sede')
        );
    }, [db.carnes, congregacaoFilter]);

    const membrosFiltrados = useMemo(() => {
        return (db.membros || []).filter(m => 
            m.status !== 'Inativo' && (
                congregacaoFilter === 'todas' || 
                m.congregacao_id === congregacaoFilter || 
                (!m.congregacao_id && congregacaoFilter === 'sede')
            )
        );
    }, [db.membros, congregacaoFilter]);

    const campaignsList = useMemo(() => {
        const list = db.carnes || [];
        return Array.from(new Set(list.map(c => c.titulo || '').filter(Boolean)));
    }, [db.carnes]);

    // Active single/bulk creation suggestions
    useEffect(() => {
        if (campaignsList.length > 0) {
            if (!singleCampaignTitle) setSingleCampaignTitle(campaignsList[0]);
            if (!bulkCampaignTitle) setBulkCampaignTitle(campaignsList[0]);
        } else {
            const currentYear = new Date().getFullYear();
            if (!singleCampaignTitle) setSingleCampaignTitle(`CAMPANHA DA FÉ ${currentYear}`);
            if (!bulkCampaignTitle) setBulkCampaignTitle(`CAMPANHA DA FÉ ${currentYear}`);
        }
    }, [campaignsList]);

    // Global Stats
    const totalCarnesCount = carnes.length;
    const totalParticipantes = useMemo(() => new Set(carnes.map(c => c.membro_id)).size, [carnes]);
    const percentParticipacao = useMemo(() => {
        const total = (db.membros || []).filter(m => m.status !== 'Inativo').length;
        return total > 0 ? ((totalParticipantes / total) * 100).toFixed(1) : '0';
    }, [totalParticipantes, db.membros]);

    const financeStats = useMemo(() => {
        let esperado = 0;
        let recebido = 0;
        let atrasado = 0;
        const hoje = new Date().toISOString().split('T')[0];

        carnes.forEach(c => {
            esperado += parseFloat(c.valor_total) || 0;
            (c.parcelas || []).forEach(p => {
                const val = parseFloat(p.valor) || 0;
                if (p.status === 'pago') {
                    recebido += val;
                } else if (p.vencimento < hoje) {
                    atrasado += val;
                }
            });
        });

        const pendente = esperado - recebido;
        const percentRecebido = esperado > 0 ? ((recebido / esperado) * 100).toFixed(1) : '0';

        return { esperado, recebido, atrasado, pendente, percentRecebido };
    }, [carnes]);

    // Format date in locale PT-BR
    const formatDateBr = (dStr: string) => {
        if (!dStr) return '';
        const parts = dStr.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dStr;
    };

    // Calculate Member engagement list
    const carnesData = useMemo(() => {
        const hoje = new Date().toISOString().split('T')[0];

        return (db.membros || []).filter(m => m.status !== 'Inativo').map(membro => {
            const meusCarnes = carnes.filter(c => c.membro_id === membro.id);
            let totalEsperadoMembro = 0;
            let totalPagoMembro = 0;
            let parcelasAtrasadas = 0;
            
            meusCarnes.forEach(c => {
                totalEsperadoMembro += parseFloat(c.valor_total) || 0;
                (c.parcelas || []).forEach(p => {
                    const val = parseFloat(p.valor) || 0;
                    if (p.status === 'pago') {
                        totalPagoMembro += val;
                    } else if (p.vencimento < hoje) {
                        parcelasAtrasadas++;
                    }
                });
            });

            let status = 'Sem Carnê';
            let color = 'slate';

            if (meusCarnes.length > 0) {
                if (parcelasAtrasadas === 0) { status = 'Em Dia'; color = 'emerald'; }
                else if (parcelasAtrasadas <= 2) { status = 'Atraso Leve'; color = 'amber'; }
                else { status = 'Alerta Pastoral'; color = 'rose'; }
            }

            return { 
                ...membro, 
                total_esperado: totalEsperadoMembro,
                total_pago: totalPagoMembro,
                parcelas_atrasadas: parcelasAtrasadas,
                status_carne: status, 
                status_color: color,
                qtd_carnes: meusCarnes.length
            };
        });
    }, [carnes, db.membros]);

    // Chart 1: Monthly contribution timeline
    const monthlyArrecadacao = useMemo(() => {
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const currentYear = new Date().getFullYear();
        
        return months.map((mName, idx) => {
            let total = 0;
            carnes.forEach(carne => {
                (carne.parcelas || []).forEach(p => {
                    if (p.status === 'pago') {
                        const dateStr = p.data_pagamento || p.vencimento;
                        if (dateStr) {
                            try {
                                const d = new Date(dateStr + 'T12:00:00');
                                if (d.getFullYear() === currentYear && d.getMonth() === idx) {
                                    total += parseFloat(p.valor) || 0;
                                }
                            } catch {}
                        }
                    }
                });
            });
            return { mes: mName, Arrecadado: Math.round(total) };
        });
    }, [carnes]);

    // Chart 2: Status Donut Chart
    const statusDonutData = useMemo(() => {
        const emDia = carnesData.filter(d => d.status_carne === 'Em Dia').length;
        const atrasoLeve = carnesData.filter(d => d.status_carne === 'Atraso Leve').length;
        const alertaPastoral = carnesData.filter(d => d.status_carne === 'Alerta Pastoral').length;
        const semCarne = carnesData.filter(d => d.status_carne === 'Sem Carnê').length;
        
        return [
            { name: 'Em Dia', value: emDia, color: '#10b981' },
            { name: 'Atraso Leve', value: atrasoLeve, color: '#f59e0b' },
            { name: 'Alerta Pastoral', value: alertaPastoral, color: '#ef4444' },
            { name: 'Sem Carnê', value: semCarne, color: '#64748b' }
        ].filter(v => v.value > 0);
    }, [carnesData]);

    // Actions & Toggles
    const handlePayParcela = async (carneId: string, parcelaIdx: number) => {
        const target = carnes.find(c => c.id === carneId);
        if (!target) return;
        
        const novasParcelas = [...target.parcelas];
        const statusAtual = novasParcelas[parcelaIdx].status;
        const novoStatus = statusAtual === 'pago' ? 'pendente' : 'pago';
        novasParcelas[parcelaIdx].status = novoStatus;
        novasParcelas[parcelaIdx].data_pagamento = novoStatus === 'pago' ? new Date().toISOString().split('T')[0] : null;

        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'carnes', carneId), { 
                parcelas: novasParcelas 
            }, { merge: true });
            
            const mNome = db.membros?.find(m => m.id === target.membro_id)?.nome || 'Membro';
            logAction('BAIXA_CARNE', `Alterou parcela ${parcelaIdx + 1} de carnê: ${target.titulo} de ${mNome}`, 'carnes', carneId);
            addToast("Status de pagamento atualizado com sucesso!", "success");
        } catch (err) {
            addToast("Falha ao salvar pagamento.", "error");
        }
    };

    // Print Individual Receipt using Entrada mode
    const handlePrintSlipsReceipt = (carne: any, p: any) => {
        const membro = db.membros?.find(m => m.id === carne.membro_id) || { nome: 'Contribuinte' };
        setPrintData({
            igreja: db.igreja,
            item: {
                tipo: 'entrada',
                valor: parseFloat(p.valor) || 0,
                membro_nome: membro.nome,
                descricao: `PARCELA ${p.numero}/${carne.parcelas.length} DA CAMPANHA/CARNÊ "${carne.titulo}"`,
                categoria: 'Contribuição de Campanha',
                data_pagamento: p.data_pagamento || new Date().toISOString().split('T')[0]
            }
        });
        setPrintMode('recibo');
        setPreviewOpen(true);
    };

    // Whatsapp Notification helper
    const handleSendReminder = (carne: any, p: any) => {
        const membro = db.membros?.find(m => m.id === carne.membro_id);
        if (!membro) return;
        const tel = membro.telefone || membro.contato || '';
        if (!tel) {
            return addToast("Membro não possui telefone celular cadastrado para envio.", "warning");
        }
        const firstName = membro.nome.split(' ')[0];
        const msg = `Olá ${firstName}, a Paz do Senhor! Segue lembrete da parcela ${p.numero} com valor de R$ ${parseFloat(p.valor).toFixed(2)} vencendo em ${formatDateBr(p.vencimento)} referente a campanha "${carne.titulo}". Deus multiplique suas colheitas e fidelidade! 🙌💚`;
        window.open(`https://wa.me/55${tel.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    // Handle single creation submit
    const handleSubmitSingle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!singleCampaignTitle.trim()) return addToast("Informe o título do Carnê.", "warning");
        if (!singleMemberId) return addToast("Selecione um membro para emissão.", "warning");
        
        const valorParcela = parseFloat(String(singleValue));
        if (!valorParcela || valorParcela <= 0) return addToast("Insira um valor válido por parcela.", "warning");
        if (singleInstallments <= 0 || singleInstallments > 48) return addToast("Quantidade de parcelas deve ser entre 1 e 48.", "warning");

        setIsCreatingSingle(true);
        const valorTotal = valorParcela * singleInstallments;

        try {
            const parcelasList: any[] = [];
            const baseDue = new Date(singleFirstDue + 'T12:00:00');
            
            for (let i = 0; i < singleInstallments; i++) {
                const d = new Date(baseDue);
                d.setMonth(d.getMonth() + i);
                parcelasList.push({
                    numero: i + 1,
                    valor: valorParcela,
                    vencimento: d.toISOString().split('T')[0],
                    status: 'pendente',
                    data_pagamento: null
                });
            }

            const docRef = await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'carnes'), {
                titulo: singleCampaignTitle.trim().toUpperCase(),
                membro_id: singleMemberId,
                valor_total: valorTotal,
                parcelas: parcelasList,
                congregacao_id: congregacaoFilter === 'todas' ? 'sede' : congregacaoFilter,
                data_criacao: new Date().toISOString()
            });

            logAction('CRIAÇÃO_CARNE', `Emitiu carnê ${singleCampaignTitle} individual para membro`, 'carnes', docRef.id);
            addToast("Carnê emitido e registrado com sucesso!", "success");
            
            // Clean fields & set Tab to manager with focus
            setSingleMemberId('');
            setSingleValue('');
            setSelectedCarneId(docRef.id);
            setTab(3);
            setSubTab('lotes');
        } catch (err) {
            addToast("Erro ao tentar registrar o documento.", "error");
        } finally {
            setIsCreatingSingle(false);
        }
    };

    // Handle Bulk/Lote creation submit
    const handleBulkCreateCarnes = async () => {
        if (bulkSelectedMembers.length === 0) return addToast("Marque pelo menos um membro na lista.", "warning");
        if (!bulkCampaignTitle.trim()) return addToast("Digite o título da campanha.", "warning");
        if (bulkValue <= 0) return addToast("Defina um valor válido para as parcelas.", "warning");

        setIsBulkCreating(true);
        addToast(`Sincronizando ${bulkSelectedMembers.length} emissões...`, "info");

        try {
            let count = 0;
            const baseDue = new Date(bulkFirstDue + 'T12:00:00');
            const totalEmitido = bulkValue * bulkInstallments;

            for (let mId of bulkSelectedMembers) {
                const parcelasList: any[] = [];
                for (let i = 0; i < bulkInstallments; i++) {
                    const d = new Date(baseDue);
                    d.setMonth(d.getMonth() + i);
                    parcelasList.push({
                        numero: i + 1,
                        valor: bulkValue,
                        vencimento: d.toISOString().split('T')[0],
                        status: 'pendente',
                        data_pagamento: null
                    });
                }

                await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'carnes'), {
                    titulo: bulkCampaignTitle.trim().toUpperCase(),
                    membro_id: mId,
                    valor_total: totalEmitido,
                    parcelas: parcelasList,
                    congregacao_id: congregacaoFilter === 'todas' ? 'sede' : congregacaoFilter,
                    data_criacao: new Date().toISOString()
                });
                count++;
            }

            logAction('CRIAÇÃO_LOTADA_CARNES', `Criou ${count} carnês da campanha "${bulkCampaignTitle}" em massa`, 'carnes', 'lote');
            addToast(`${count} carnês de dotações foram impressos no banco!`, "success");
            setBulkSelectedMembers([]);
            setBulkSearch('');
            setTab(3);
            setSubTab('lotes');
        } catch (err) {
            addToast("Falha técnica ao salvar os dados do lote.", "error");
        } finally {
            setIsBulkCreating(false);
        }
    };

    // Delete single doc
    const handleDeleteCarne = async () => {
        if (!confirmDeleteId) return;
        try {
            await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'carnes', confirmDeleteId));
            logAction('EXCLUSÃO_CARNE', `Removeu carnê id ${confirmDeleteId} do sistema`, 'carnes', confirmDeleteId);
            addToast("Carnê excluído do arquivo!", "success");
            if (selectedCarneId === confirmDeleteId) setSelectedCarneId('');
        } catch (err) {
            addToast("Não foi possível excluir o carnê.", "error");
        } finally {
            setConfirmDeleteId(null);
        }
    };

    // Filter Master-Detail List
    const filteredMasterList = useMemo(() => {
        return carnes.filter(c => {
            const m = db.membros?.find(me => me.id === c.membro_id);
            const matchesSearch = !carneSearch.trim() || 
                (c.titulo || '').toLowerCase().includes(carneSearch.toLowerCase()) ||
                (m?.nome || '').toLowerCase().includes(carneSearch.toLowerCase());
            
            const matchesCamp = carneCampaignFilter === 'todas' || c.titulo === carneCampaignFilter;
            return matchesSearch && matchesCamp;
        });
    }, [carnes, db.membros, carneSearch, carneCampaignFilter]);

    // Active Selected Master Carne details
    const activeCarneObj = useMemo(() => {
        return carnes.find(c => c.id === selectedCarneId) || filteredMasterList[0];
    }, [carnes, selectedCarneId, filteredMasterList]);

    // Set first selected item on load
    useEffect(() => {
        if (filteredMasterList.length > 0 && !selectedCarneId) {
            setSelectedCarneId(filteredMasterList[0].id);
        }
    }, [filteredMasterList]);

    // Computed states for the active focused carne
    const activeCarneStats = useMemo(() => {
        if (!activeCarneObj) return null;
        const total = parseFloat(activeCarneObj.valor_total) || 0;
        const parcelas = activeCarneObj.parcelas || [];
        const pagas = parcelas.filter(p => p.status === 'pago');
        const totalPago = pagas.reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
        const totalPendente = total - totalPago;
        const statusCount = `${pagas.length} de ${parcelas.length}`;
        const pctProgresso = total > 0 ? Math.round((totalPago / total) * 100) : 0;
        
        let healthLabel = 'Em Dia';
        let healthColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        const hoje = new Date().toISOString().split('T')[0];
        const atrasadasCount = parcelas.filter(p => p.status !== 'pago' && p.vencimento < hoje).length;
        
        if (pctProgresso === 100) {
            healthLabel = 'Quitado';
            healthColor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
        } else if (atrasadasCount > 0) {
            healthLabel = `${atrasadasCount} Atrasada(s)`;
            healthColor = 'text-rose-700 bg-rose-50 border-rose-200 animate-pulse';
        }

        return { total, totalPago, totalPendente, statusCount, pctProgresso, healthLabel, healthColor };
    }, [activeCarneObj]);

    // Member portfolio calculations
    const memberHistoryData = useMemo(() => {
        if (!selectedPortfolioMemberId) return null;
        const member = db.membros?.find(m => m.id === selectedPortfolioMemberId);
        if (!member) return null;

        const filteredCarnes = carnes.filter(c => c.membro_id === selectedPortfolioMemberId);
        
        let totalPrometido = 0;
        let totalPago = 0;
        let totalPendente = 0;
        let totalParcelasCount = 0;
        let totalPagasCount = 0;
        let atrasadoCount = 0;
        const hoje = new Date().toISOString().split('T')[0];

        const extratoLedger: any[] = [];

        filteredCarnes.forEach(c => {
            totalPrometido += parseFloat(c.valor_total) || 0;
            const parcelas = c.parcelas || [];
            totalParcelasCount += parcelas.length;

            parcelas.forEach(p => {
                const val = parseFloat(p.valor) || 0;
                if (p.status === 'pago') {
                    totalPago += val;
                    totalPagasCount++;
                    extratoLedger.push({
                        carneId: c.id,
                        carneTitulo: c.titulo,
                        parcelaNum: p.numero,
                        valor: val,
                        data_pagamento: p.data_pagamento || p.vencimento,
                        orig: p
                    });
                } else {
                    totalPendente += val;
                    if (p.vencimento < hoje) {
                        atrasadoCount++;
                    }
                }
            });
        });

        // Sort chronological payment ledger
        extratoLedger.sort((a,b) => new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime());

        const fidelityPct = totalParcelasCount > 0 ? Math.round((totalPagasCount / totalParcelasCount) * 100) : 100;

        return {
            member,
            carnesList: filteredCarnes,
            totalPrometido,
            totalPago,
            totalPendente,
            totalParcelasCount,
            totalPagasCount,
            atrasadoCount,
            fidelityPct,
            extratoLedger
        };
    }, [carnes, selectedPortfolioMemberId, db.membros]);

    // Autocomplete filtrado de membros para emitir ou buscar prontuário
    const membersListFilteredSingle = useMemo(() => {
        return membrosFiltrados.filter(m => 
            m.nome?.toLowerCase().includes((portfolioSearchMemberTerm || '').toLowerCase())
        ).slice(0, 5);
    }, [membrosFiltrados, portfolioSearchMemberTerm]);

    // Filter eligible members for bulk enrollment (those who do not have a booklet for the current campaign)
    const membersEligibleForBulk = useMemo(() => {
        const alreadyRegistered = new Set(
            (db.carnes || [])
                .filter(c => c.titulo?.toUpperCase() === bulkCampaignTitle.trim().toUpperCase())
                .map(c => c.membro_id)
        );
        return membrosFiltrados.filter(m => !alreadyRegistered.has(m.id));
    }, [membrosFiltrados, db.carnes, bulkCampaignTitle]);

    const filteredBulkMembers = useMemo(() => {
        return membersEligibleForBulk.filter(m => 
            m.nome?.toLowerCase().includes(bulkSearch.toLowerCase())
        );
    }, [membersEligibleForBulk, bulkSearch]);

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance pb-10">
            {/* Elegant Display Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl shadow-sm border border-pink-100">
                        <CreditCard size={28}/>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Carnês & Campanhas</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Tesouraria Integrada e Auditoria de Votos por Membro</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <select 
                        value={congregacaoFilter} 
                        onChange={e => {
                            setCongregacaoFilter(e.target.value);
                            setSelectedCarneId('');
                        }} 
                        className="bg-white p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none shadow-sm focus:ring-2 focus:ring-pink-500"
                    >
                        <option value="todas">Todas as Filiais</option>
                        <option value="sede">Sede Principal</option>
                        {(db.congregacoes || []).map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Core Navigation */}
            <div className="glass-modern p-2 rounded-[2rem] flex overflow-x-auto custom-scrollbar gap-2 border border-white/50 shrink-0 select-none">
                {[
                    { id: 1, label: 'Dashboard', icon: LayoutDashboard },
                    { id: 2, label: 'Emissão Assistida', icon: Plus },
                    { id: 3, label: 'Central de Cobrança', icon: List },
                    { id: 4, label: 'Tabela de Auditoria', icon: Printer },
                    { id: 5, label: 'Análise de Saúde', icon: Target }
                ].map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => setTab(item.id)} 
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${
                            tab === item.id 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                    >
                        <item.icon size={18}/> 
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Tab Views Content */}
            <div className="flex-1 overflow-hidden" id="workspace-viewport">
                
                {/* 1. DASHBOARD OVERVIEW */}
                {tab === 1 && (
                    <div className="space-y-6 h-full overflow-y-auto custom-scrollbar p-1">
                        {/* KPI Display Grids */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="glass-card p-6 rounded-[2rem] shadow-sm bg-white border border-slate-100 flex flex-col justify-between">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4"><Plus size={20}/></div>
                                <div>
                                    <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-1">{totalCarnesCount}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Carnês em Aberto</p>
                                </div>
                            </div>

                            <div className="glass-card p-6 rounded-[2rem] shadow-sm bg-white border border-slate-100 flex flex-col justify-between">
                                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl w-fit mb-4"><Users size={20}/></div>
                                <div>
                                    <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-1">{totalParticipantes}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Membros Engajados</p>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${percentParticipacao}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold mt-2 text-right">{percentParticipacao}% da comunhão ativa</p>
                                </div>
                            </div>

                            <div className="glass-card p-6 rounded-[2rem] shadow-sm bg-white border border-slate-100 flex flex-col justify-between">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4"><DollarSign size={20}/></div>
                                <div>
                                    <h3 className="text-3xl font-black text-emerald-600 tracking-tight mb-1">R$ {financeStats.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Valor Executado (Pago)</p>
                                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${financeStats.percentRecebido}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold mt-2 text-right">{financeStats.percentRecebido}% de arrecadação esperada</p>
                                </div>
                            </div>

                            <div className="glass-card p-6 rounded-[2rem] shadow-sm bg-white border border-slate-100 flex flex-col justify-between">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4"><Activity size={20}/></div>
                                <div>
                                    <h3 className="text-3xl font-black text-amber-600 mb-1">R$ {financeStats.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Pendente a Recolher</p>
                                    <div className="bg-amber-50/50 p-2 rounded-xl text-center">
                                        <p className="text-[9px] font-bold text-amber-700 uppercase">Meta Total: R$ {financeStats.esperado.toLocaleString('pt-BR')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Recharts Graphics */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Line graph collected timeline */}
                            <div className="lg:col-span-2 glass-modern p-6 rounded-[2.5rem] bg-white border border-slate-150 flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                                        <TrendingUp size={18} className="text-indigo-500"/> Fluxo de Caixa Mensal de Campanhas
                                    </h3>
                                    <p className="text-xs text-slate-400 font-medium">Histórico acumulado de pagamentos de carnês no ano vigente ({new Date().getFullYear()}).</p>
                                </div>
                                <div className="h-64 mt-2 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={monthlyArrecadacao} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorArrecadacao" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                            <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                                            <RechartsTooltip formatter={(value) => [`R$ ${value}`, 'Total Recolhido']}/>
                                            <Area type="monotone" dataKey="Arrecadado" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorArrecadacao)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Donut chart for statuses */}
                            <div className="glass-modern p-6 rounded-[2.5rem] bg-white border border-slate-150 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                                        <Target size={18} className="text-pink-500"/> Pontuação de Adimplência
                                    </h3>
                                    <p className="text-xs text-slate-400 font-medium">Saúde financeira dos irmãos assumindo votos pastorais.</p>
                                </div>

                                {statusDonutData.length === 0 ? (
                                    <div className="p-10 text-center text-xs text-slate-400 italic">Sem registros no momento</div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="h-44 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={statusDonutData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={45}
                                                        outerRadius={65}
                                                        paddingAngle={3}
                                                        dataKey="value"
                                                    >
                                                        {statusDonutData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-slate-600 font-medium font-sans">
                                            {statusDonutData.map((s, idx) => (
                                                <span key={idx} className="flex items-center gap-1">
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                                                    {s.name} ({s.value})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                )}

                {/* 2. ASSISTED CREATION SLIDES (SINGLE AND BULK) */}
                {tab === 2 && (
                    <div className="h-full overflow-y-auto custom-scrollbar p-1 space-y-6">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit gap-2">
                            <button 
                                onClick={() => setCreationType('individual')} 
                                className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
                                    creationType === 'individual' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <span className="flex items-center gap-1.5"><User size={13}/> Emissão Individual</span>
                            </button>
                            <button 
                                onClick={() => setCreationType('massa')} 
                                className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
                                    creationType === 'massa' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <span className="flex items-center gap-1.5"><Sparkles size={13}/> Gerador Lote (Em Massa)</span>
                            </button>
                        </div>

                        {creationType === 'individual' ? (
                            <form onSubmit={handleSubmitSingle} className="glass-modern bg-white p-8 rounded-[2.5rem] border border-slate-200/80 max-w-3xl space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-1.5">
                                        <Plus size={20} className="text-indigo-500"/> Registrar Carnê com Emissão Unitária
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">Emita parcelamentos voluntários, ofertas especiais e campanhas dedicadas para um irmão.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nome ou Tema do Carnê</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ex: CAMPANHA REFORMA DO TEMPLO 2026" 
                                            value={singleCampaignTitle} 
                                            onChange={e => setSingleCampaignTitle(e.target.value.toUpperCase())}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none uppercase focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                        {campaignsList.length > 0 && (
                                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Sugestões:</span>
                                                {campaignsList.slice(0, 3).map((item, idx) => (
                                                    <button 
                                                        type="button" 
                                                        key={idx} 
                                                        onClick={() => setSingleCampaignTitle(item)} 
                                                        className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase transition-colors"
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Membro / Contribuinte Beneficiário</label>
                                        <select 
                                            value={singleMemberId} 
                                            onChange={e => setSingleMemberId(e.target.value)} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="">Selecione um membro ativo...</option>
                                            {membrosFiltrados.map(m => (
                                                <option key={m.id} value={m.id}>{m.nome}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Valor da Parcela Mensal (R$)</label>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            value={singleValue} 
                                            onChange={e => setSingleValue(e.target.value)} 
                                            placeholder="Ex: 50.00" 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Quantidade de Parcelas</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="48" 
                                            value={singleInstallments} 
                                            onChange={e => setSingleInstallments(parseInt(e.target.value) || 12)} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Data do Primeiro Vencimento</label>
                                        <input 
                                            type="date" 
                                            value={singleFirstDue} 
                                            onChange={e => setSingleFirstDue(e.target.value)} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col justify-end">
                                        <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/60 mb-1 text-center">
                                            <span className="text-xs text-slate-600 font-bold">
                                                Dotação Total a Registrar: <span className="text-indigo-700 font-extrabold text-sm">R$ {((parseFloat(String(singleValue)) || 0) * singleInstallments).toFixed(2)}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button 
                                        type="submit" 
                                        disabled={isCreatingSingle} 
                                        variant="primary" 
                                        className="py-3.5 px-8 font-black text-sm bg-gradient-to-r from-indigo-600 to-sky-600 shadow-md text-white select-none shrink-0"
                                    >
                                        {isCreatingSingle ? (
                                            <><Loader2 size={16} className="animate-spin" /> Registrando...</>
                                        ) : (
                                            <><Check size={16}/> Compor & Gerar Carnê</>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            // BULK WIZARD IN SCROLLABLE SHEET
                            <div className="glass-modern bg-gradient-to-br from-indigo-50/20 via-white to-white p-8 rounded-[2.5rem] border border-indigo-100 max-w-4xl flex flex-col space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-1.5">
                                        <Sparkles size={20} className="text-indigo-500"/> Emissão Assistida de Carnês em Lote (Massa)
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">Ideal para início de ano ou novas campanhas pastorais onde vários fiéis se inscrevem de forma síncrona!</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-3xl border border-slate-100/80 shadow-sm shrink-0">
                                    <div className="md:col-span-2">
                                        <label className="block text-[9px] font-black text-indigo-600 uppercase mb-1 tracking-wider">Título Oficial da Campanha</label>
                                        <input 
                                            type="text" 
                                            value={bulkCampaignTitle} 
                                            onChange={e => setBulkCampaignTitle(e.target.value.toUpperCase())} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none uppercase focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-500 uppercase mb-1 tracking-wider">Valor Parcela (R$)</label>
                                        <input 
                                            type="number" 
                                            value={bulkValue} 
                                            onChange={e => setBulkValue(parseFloat(e.target.value) || 0)} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-500 uppercase mb-1 tracking-wider">Primeiro Venc.</label>
                                        <input 
                                            type="date" 
                                            value={bulkFirstDue} 
                                            onChange={e => setBulkFirstDue(e.target.value)} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Checklist Grid */}
                                <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-200 flex flex-col space-y-3">
                                    <div className="flex justify-between items-center bg-white/80 p-2.5 px-4 rounded-xl border border-slate-100">
                                        <span className="text-[11px] font-black text-slate-500 uppercase">{filteredBulkMembers.length} fiéis elegíveis disponíveis</span>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => setBulkSelectedMembers(membersEligibleForBulk.map(m => m.id))} 
                                                className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wide"
                                            >
                                                Selecionar Todos
                                            </button>
                                            <span className="text-slate-300">|</span>
                                            <button 
                                                onClick={() => setBulkSelectedMembers([])} 
                                                className="text-[10px] font-bold text-slate-500 hover:underline uppercase tracking-wide"
                                            >
                                                Limpar Seleção
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar membros na lista..." 
                                            value={bulkSearch} 
                                            onChange={e => setBulkSearch(e.target.value)} 
                                            className="w-full bg-white border border-slate-205 rounded-xl p-2 pl-9 text-xs outline-none uppercase font-semibold"
                                        />
                                    </div>

                                    <div className="max-h-56 overflow-y-auto custom-scrollbar grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pr-1 pt-1">
                                        {filteredBulkMembers.map(m => {
                                            const isSelected = bulkSelectedMembers.includes(m.id);
                                            return (
                                                <button 
                                                    type="button"
                                                    key={m.id} 
                                                    onClick={() => {
                                                        if (isSelected) setBulkSelectedMembers(bulkSelectedMembers.filter(id => id !== m.id));
                                                        else setBulkSelectedMembers([...bulkSelectedMembers, m.id]);
                                                    }}
                                                    className={`p-2.5 px-3.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-colors ${
                                                        isSelected 
                                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold shadow-sm' 
                                                            : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <span className="truncate pr-1">{m.nome}</span>
                                                    <span className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                                        isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                                                    }`}>
                                                        {isSelected && <Check size={11} strokeWidth={4}/>}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                        {filteredBulkMembers.length === 0 && (
                                            <p className="text-[11px] text-slate-400 italic col-span-full text-center py-4">Nenhum membro ativo elegível para esta campanha.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 flex flex-wrap justify-between items-center gap-4">
                                    <span className="text-xs font-bold text-slate-600 font-sans">
                                        Estatísticas do Lote: <strong>{bulkSelectedMembers.length} carnês</strong> de {bulkInstallments} parcelas • Total a emitir: <strong className="text-indigo-600">R$ {(bulkSelectedMembers.length * bulkValue * bulkInstallments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                                    </span>
                                    <Button 
                                        onClick={handleBulkCreateCarnes} 
                                        disabled={isBulkCreating || bulkSelectedMembers.length === 0} 
                                        variant="primary" 
                                        className="text-xs py-2 px-5 bg-gradient-to-r from-indigo-600 to-rose-600 select-none shadow text-white font-bold"
                                    >
                                        {isBulkCreating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Gerar Carnês em Massa
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. CORE MANAGEMENT WORKSPACE WITH MASTER-DETAIL & DEDICATED PORTFOLIO */}
                {tab === 3 && (
                    <div className="h-full flex flex-col space-y-4">
                        
                        {/* Sub nav buttons toggler */}
                        <div className="flex bg-slate-100 p-1 rounded-xl w-fit gap-1 shadow-inner shrink-0 leading-none select-none">
                            <button 
                                onClick={() => setSubTab('lotes')} 
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    subTab === 'lotes' ? 'bg-white text-indigo-700 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <span className="flex items-center gap-1.5"><List size={13}/> Lotes & Campanhas</span>
                            </button>
                            <button 
                                onClick={() => setSubTab('membro')} 
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    subTab === 'membro' ? 'bg-white text-indigo-700 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <span className="flex items-center gap-1.5"><Clock size={13}/> Portfólio por Membro</span>
                            </button>
                        </div>

                        {/* SUB-TABLOTES: HIGH PERFORMANCE MASTER-DETAIL WORKSPACE */}
                        {subTab === 'lotes' ? (
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                                
                                {/* LEFT NAVIGATION PANE */}
                                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[2rem] flex flex-col overflow-hidden h-full">
                                    <div className="p-4 bg-slate-50 border-b border-slate-150 space-y-3 flex-shrink-0">
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                                            <input 
                                                type="text" 
                                                placeholder="Buscar por Membro ou Campanha..." 
                                                value={carneSearch} 
                                                onChange={e => setCarneSearch(e.target.value)} 
                                                className="w-full bg-white border border-slate-205 rounded-xl p-2.5 pl-9 text-xs outline-none font-bold uppercase transition-all focus:border-indigo-400"
                                            />
                                        </div>

                                        <select 
                                            value={carneCampaignFilter}
                                            onChange={e => setCarneCampaignFilter(e.target.value)}
                                            className="w-full bg-white border border-slate-205 rounded-xl p-2 text-xs font-bold uppercase outline-none text-slate-600 focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option value="todas">Campanha: Todas</option>
                                            {campaignsList.map((item, idx) => (
                                                <option key={idx} value={item}>{item}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Scroll list */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                        {filteredMasterList.map(c => {
                                            const m = db.membros?.find(me => me.id === c.membro_id) || { nome: 'Sem Membro' };
                                            const isSelected = c.id === selectedCarneId;
                                            
                                            // Quick inline progress calculations list
                                            const tExpectedArr = parseFloat(c.valor_total) || 0;
                                            const tPaidArr = (c.parcelas || []).filter((p: any) => p.status === 'pago').reduce((ac: number, cr: any) => ac + (parseFloat(cr.valor) || 0), 0);
                                            const progressArr = tExpectedArr > 0 ? Math.round((tPaidArr / tExpectedArr) * 100) : 0;
                                            const isComplete = progressArr === 100;

                                            return (
                                                <div 
                                                    key={c.id} 
                                                    onClick={() => setSelectedCarneId(c.id)}
                                                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                                                        isSelected 
                                                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10' 
                                                            : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2.5">
                                                        <div className="min-w-0 pr-2">
                                                            <h4 className={`text-xs font-black truncate uppercase ${isSelected ? 'text-white' : 'text-slate-800'}`}>{m.nome}</h4>
                                                            <span className={`text-[9px] font-black px-2 py-0.5 mt-1 inline-block rounded-md uppercase tracking-wider ${
                                                                isSelected ? 'bg-white/20 text-white border border-white/20' : 'bg-slate-100 text-slate-600'
                                                            }`}>{c.titulo}</span>
                                                        </div>
                                                        <ChevronRight size={16} className={`shrink-0 ${isSelected ? 'text-white' : 'text-slate-300'}`}/>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-[9px] font-bold">
                                                            <span>Pagas: {c.parcelas?.filter((p: any) => p.status === 'pago').length}/{c.parcelas?.length}</span>
                                                            <span>R$ {tPaidArr} / {tExpectedArr}</span>
                                                        </div>
                                                        <div className={`w-full h-1 rounded-full overflow-hidden flex ${isSelected ? 'bg-indigo-300/40' : 'bg-slate-100'}`}>
                                                            <div 
                                                                className={`h-full rounded-full ${isSelected ? 'bg-white' : isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                                                style={{ width: `${progressArr}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {filteredMasterList.length === 0 && (
                                            <div className="p-8 text-center text-xs text-slate-400 italic">Nenhum carnê localizado</div>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT DETAILED WORKSPACE PANEL */}
                                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[2rem] flex flex-col overflow-hidden h-full">
                                    {activeCarneObj && activeCarneStats ? (
                                        <div className="flex flex-col h-full overflow-hidden">
                                            
                                            {/* Header detail */}
                                            <div className="p-6 bg-slate-50 border-b border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                                                <div>
                                                    <span className={`text-[9px] font-black tracking-widest px-2.5 py-1 border rounded-lg uppercase ${activeCarneStats.healthColor}`}>
                                                        {activeCarneStats.healthLabel}
                                                    </span>
                                                    <h3 className="text-lg font-black text-slate-800 uppercase mt-2.5 leading-tight">
                                                        {db.membros?.find(me => me.id === activeCarneObj.membro_id)?.nome || 'Membro do Carnê'}
                                                    </h3>
                                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">LOTE/CAMPANHA: {activeCarneObj.titulo}</p>
                                                </div>

                                                <div className="flex gap-1.5">
                                                    <button 
                                                        onClick={() => {
                                                            setPrintData({ 
                                                                igreja: db.igreja, 
                                                                carne: activeCarneObj, 
                                                                membro: db.membros.find(m => m.id === activeCarneObj.membro_id) 
                                                            }); 
                                                            setPrintMode('carne_print'); 
                                                            setPreviewOpen(true);
                                                        }}
                                                        className="p-1 px-3 text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 rounded-xl flex items-center gap-1 shadow-sm transition-colors"
                                                        title="Imprimir Carnê de Dotação"
                                                    >
                                                        <Printer size={13}/> CARNÊ
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setPrintData({ 
                                                                item: activeCarneObj, 
                                                                igreja: db.igreja, 
                                                                membros: db.membros 
                                                            }); 
                                                            setPrintMode('recibo'); 
                                                            setPreviewOpen(true);
                                                        }}
                                                        className="p-1 px-3 text-[10px] font-black uppercase text-pink-700 bg-pink-50 border border-pink-150 hover:bg-pink-100 rounded-xl flex items-center gap-1 shadow-sm transition-colors"
                                                        title="Imprimir Recibo de Quitação Integral"
                                                    >
                                                        <Receipt size={13}/> RECIBO GERAL
                                                    </button>
                                                    <button 
                                                        onClick={() => setConfirmDeleteId(activeCarneObj.id)}
                                                        className="p-1 px-2.5 text-xs text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-150 rounded-xl transition-colors shrink-0"
                                                        title="Excluir Registro"
                                                    >
                                                        <Trash2 size={13}/>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Micro grids states */}
                                            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50/50 border-b border-slate-100 flex-shrink-0 text-center">
                                                <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase text-center block">Total Votado</span>
                                                    <strong className="text-sm font-extrabold text-slate-800">R$ {activeCarneStats.total.toFixed(2)}</strong>
                                                </div>
                                                <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase text-center block">Arrecadado</span>
                                                    <strong className="text-sm font-extrabold text-emerald-600">R$ {activeCarneStats.totalPago.toFixed(2)}</strong>
                                                </div>
                                                <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase text-center block">Progresso</span>
                                                    <strong className="text-sm font-extrabold text-indigo-600 block">{activeCarneStats.pctProgresso}%</strong>
                                                </div>
                                            </div>

                                            {/* Installments dynamic grids */}
                                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3 pb-8">
                                                    {(activeCarneObj.parcelas || []).map((p: any, idx: number) => {
                                                        const isPago = p.status === 'pago';
                                                        const isOverdue = !isPago && p.vencimento < new Date().toISOString().split('T')[0];

                                                        return (
                                                            <div 
                                                                key={idx}
                                                                className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 shadow-sm transition-all bg-white hover:border-slate-300 ${
                                                                    isPago 
                                                                        ? 'border-emerald-100 bg-emerald-50/10' 
                                                                        : isOverdue 
                                                                            ? 'border-rose-100 bg-rose-50/5' 
                                                                            : 'border-slate-150'
                                                                }`}
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Parcela {p.numero}</span>
                                                                        <span className="text-sm font-black text-slate-800 mt-1 block">R$ {p.valor.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className={`text-[8.5px] font-black tracking-widest px-2 py-0.5 rounded uppercase border ${
                                                                            isPago 
                                                                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                                                                                : isOverdue 
                                                                                    ? 'text-rose-700 bg-rose-50 border-rose-200 animate-pulse' 
                                                                                    : 'text-slate-500 bg-slate-50 border-slate-205'
                                                                        }`}>
                                                                            {isPago ? 'Paga' : isOverdue ? 'Atrasada' : 'Aguardando'}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-1 border-t border-slate-100 pt-2.5 text-[10px] text-slate-400 font-bold justify-between">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <Calendar size={12}/> Vencimento: {formatDateBr(p.vencimento)}
                                                                        {p.data_pagamento && (
                                                                            <span className="text-emerald-600 block"> • Recibo: {formatDateBr(p.data_pagamento)}</span>
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                {/* Controls Action Box inside installment detail */}
                                                                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-dotted border-slate-100 select-none">
                                                                    <button 
                                                                        onClick={() => handlePayParcela(activeCarneObj.id, idx)}
                                                                        className={`flex items-center gap-1 py-1 px-2.5 text-[9px] font-black uppercase rounded-lg border shadow-sm transition-all shrink-0 ${
                                                                            isPago 
                                                                                ? 'text-slate-500 bg-slate-50 hover:bg-slate-100 border-slate-200' 
                                                                                : 'text-white bg-emerald-600 hover:bg-emerald-700 border-emerald-600'
                                                                        }`}
                                                                    >
                                                                        {isPago ? <RefreshCw size={10}/> : <Check size={10}/>}
                                                                        {isPago ? 'ESTORNAR' : 'QUITAÇÃO'}
                                                                    </button>

                                                                    {isPago && (
                                                                        <button 
                                                                            onClick={() => handlePrintSlipsReceipt(activeCarneObj, p)}
                                                                            className="p-1 px-2 text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-0.5 shadow-sm transition-all shrink-0"
                                                                            title="Imprimir comprovante desta parcela"
                                                                        >
                                                                            <Receipt size={10}/> RECIBO
                                                                        </button>
                                                                    )}

                                                                    {!isPago && (
                                                                        <button 
                                                                            onClick={() => handleSendReminder(activeCarneObj, p)}
                                                                            className="p-1 px-2 text-[9px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 rounded-lg flex items-center gap-0.5 shadow-sm transition-all shrink-0"
                                                                            title="Cobrar no Whatsapp"
                                                                        >
                                                                            <Send size={10}/> COBRAR
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-10">
                                            <CreditCard size={48} className="text-slate-300 mb-4 animate-pulse" />
                                            <h4 className="text-base font-black text-slate-700">Central de Pagamentos</h4>
                                            <p className="text-xs text-slate-400 mt-1 max-w-sm">Nenhum carnê ou campanha cadastrada. Siga até o assistente para emitir dotações novas.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // DEDICATED HISTORY POR MEMBER PORTFOLIO TABVIEW
                            <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col overflow-hidden h-full">
                                <div className="p-6 bg-slate-50 border-b border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
                                    <div className="w-full md:max-w-md">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Escolha o Membro Ativo</label>
                                        <select 
                                            value={selectedPortfolioMemberId} 
                                            onChange={e => setSelectedPortfolioMemberId(e.target.value)} 
                                            className="w-full bg-white border border-slate-205 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Selecione para carregar prontuário completo...</option>
                                            {membrosFiltrados.map(m => (
                                                <option key={m.id} value={m.id}>{m.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {selectedPortfolioMemberId && memberHistoryData && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-150 px-3 py-1.5 rounded-xl block shadow-sm">
                                                Fidelidade: {memberHistoryData.fidelityPct}%
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {selectedPortfolioMemberId && memberHistoryData ? (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                                        
                                        {/* Portfolio KPI Card list */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-center">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Carnês Emitidos</span>
                                                <strong className="text-xl font-extrabold text-slate-800 block mt-1">{memberHistoryData.carnesList.length}</strong>
                                            </div>
                                            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-center">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Votos Totais</span>
                                                <strong className="text-xl font-extrabold text-slate-800 block mt-1">R$ {memberHistoryData.totalPrometido.toFixed(2)}</strong>
                                            </div>
                                            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-center">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Integralizado</span>
                                                <strong className="text-xl font-extrabold text-emerald-600 block mt-1">R$ {memberHistoryData.totalPago.toFixed(2)}</strong>
                                            </div>
                                            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-center">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Atrasadas / Pendendes</span>
                                                <strong className={`text-xl font-extrabold block mt-1 ${
                                                    memberHistoryData.atrasadoCount > 0 ? 'text-rose-600' : 'text-slate-700'
                                                }`}>{memberHistoryData.atrasadoCount} parcelas</strong>
                                            </div>
                                        </div>

                                        {/* Detailed grid listing all booklets owned by membership */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><FileText size={16} className="text-indigo-500" /> Prontuário de Dotações</h3>
                                            
                                            {memberHistoryData.carnesList.length === 0 ? (
                                                <div className="p-6 text-center text-xs text-slate-400 italic">Sem carnês associados para este membro.</div>
                                            ) : (
                                                memberHistoryData.carnesList.map(c => {
                                                    const totExpected = parseFloat(c.valor_total) || 0;
                                                    const totPaid = (c.parcelas || []).filter((p: any) => p.status === 'pago').reduce((ac: number, pr: any) => ac + (parseFloat(pr.valor) || 0), 0);
                                                    
                                                    return (
                                                        <div key={c.id} className="p-5 bg-white border border-slate-150 rounded-2xl flex flex-col space-y-4 shadow-sm">
                                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                                                                <div>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Campanha Emitida</span>
                                                                    <strong className="text-xs font-black uppercase text-slate-800 tracking-wider inline-block mt-0.5">{c.titulo}</strong>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    <span className="text-xs font-bold text-slate-600">R$ {totPaid} de R$ {totExpected} ({totExpected > 0 ? Math.round((totPaid / totExpected)*100) : 0}%)</span>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setPrintData({ igreja: db.igreja, carne: c, membro: memberHistoryData.member });
                                                                            setPrintMode('carne_print');
                                                                            setPreviewOpen(true);
                                                                        }}
                                                                        className="p-1 px-2.5 text-[9px] font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded-lg flex items-center gap-1 uppercase tracking-wide transition-colors"
                                                                    >
                                                                        <Printer size={11} /> carnê pdf
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Micro grid indicators click dynamic */}
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 select-none">
                                                                {(c.parcelas || []).map((p: any, pIdx: number) => {
                                                                    const isPago = p.status === 'pago';
                                                                    const isAtrasada = !isPago && p.vencimento < new Date().toISOString().split('T')[0];

                                                                    return (
                                                                        <button 
                                                                            key={pIdx}
                                                                            type="button"
                                                                            onClick={() => handlePayParcela(c.id, pIdx)}
                                                                            title={`Parcela ${p.numero} - clique para alterar status`}
                                                                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all shadow-inner relative group ${
                                                                                isPago 
                                                                                    ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600' 
                                                                                    : isAtrasada
                                                                                        ? 'bg-rose-55 border-rose-200 text-rose-700 hover:bg-rose-100'
                                                                                        : 'bg-slate-50 border-slate-205 text-slate-505 hover:bg-slate-100'
                                                                            }`}
                                                                        >
                                                                            <span className="text-[8px] font-black">P{p.numero}</span>
                                                                            <span className="text-[10px] font-extrabold mt-0.5">R${Math.round(p.valor)}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>

                                        {/* Extrato ledger chronological lists */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><Award size={16} className="text-indigo-500" /> Extrato Consolidado Quitado</h3>
                                            
                                            {memberHistoryData.extratoLedger.length === 0 ? (
                                                <div className="p-6 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">Nenhum pagamento registrado na base histórica deste membro.</div>
                                            ) : (
                                                <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm bg-white">
                                                    <table className="w-full text-left text-xs text-slate-600 font-sans border-collapse">
                                                        <thead>
                                                            <tr className="bg-slate-50/80 border-b border-slate-150 font-bold uppercase tracking-wider text-slate-500">
                                                                <th className="py-2.5 px-4 font-black">Data do Pagamento</th>
                                                                <th className="py-2.5 px-4 font-black">Campanha / Dotação</th>
                                                                <th className="py-2.5 px-3 font-black text-center">Parcela Quitada</th>
                                                                <th className="py-2.5 px-4 font-black text-right">Valor Pago</th>
                                                                <th className="py-2.5 px-4 font-black text-right">Comprovante</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {memberHistoryData.extratoLedger.slice(0, 15).map((log, idx) => (
                                                                <tr key={idx} className="hover:bg-slate-50/50">
                                                                    <td className="py-2.5 px-4 font-bold">{formatDateBr(log.data_pagamento)}</td>
                                                                    <td className="py-2.5 px-4 font-black uppercase text-slate-800">{log.carneTitulo}</td>
                                                                    <td className="py-2.5 px-3 text-center font-bold">P{log.parcelaNum}</td>
                                                                    <td className="py-2.5 px-4 text-right font-black text-emerald-600">R$ {log.valor.toFixed(2)}</td>
                                                                    <td className="py-2.5 px-4 text-right">
                                                                        <button 
                                                                            onClick={() => handlePrintSlipsReceipt({ id: log.carneId, titulo: log.carneTitulo, parcelas: Array(log.parcelaNum) }, log.orig)}
                                                                            className="p-1 px-2.5 font-bold uppercase text-[9px] text-slate-605 hover:bg-slate-100 rounded-lg border border-slate-205 transition-colors inline-flex items-center gap-0.5 shadow-sm"
                                                                        >
                                                                            <Printer size={10}/> Imprimir
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-14 bg-slate-50/20">
                                        <User size={48} className="text-slate-350 mb-3 animate-bounce" />
                                        <h4 className="text-sm font-black text-slate-700 uppercase">Consultor de Prontuário</h4>
                                        <p className="text-xs text-slate-400 mt-1 max-w-sm">Associe e configure um membro no formulário de topo para carregar o histórico financeiro completo de carnês.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. DATA TABLE AUDITOR FOR CARNÊ DOCUMENTS */}
                {tab === 4 && (
                    <div className="h-full flex flex-col">
                        <GenericTable 
                            title="Auditoria Geral de Emissões" 
                            type="carne" 
                            data={carnes} 
                            columns={[
                                { header: 'Nome da Campanha', key: 'titulo', render: c => <span className="font-extrabold uppercase text-slate-800 tracking-wider">{c.titulo}</span> },
                                { header: 'Contribuinte / Irmão', key: 'membro_id', render: c => <span className="font-bold text-slate-700">{db.membros?.find(m => m.id === c.membro_id)?.nome || 'Não localizado'}</span> },
                                { header: 'Valor do Carnê', key: 'valor_total', render: c => <span className="font-extrabold text-slate-800">R$ {parseFloat(c.valor_total).toFixed(2)}</span> },
                                { header: 'Parcelas Pagas', key: 'parcelas', render: c => {
                                    const size = c.parcelas?.length || 0;
                                    const paid = c.parcelas?.filter((p: any) => p.status === 'pago').length || 0;
                                    const isComplete = paid === size;
                                    return (
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border shadow-sm ${
                                            isComplete ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                                        }`}>
                                            {paid} / {size} pagas
                                        </span>
                                    );
                                }},
                                { header: 'Status', key: 'status_saude', render: c => {
                                    const size = c.parcelas?.length || 0;
                                    const paid = c.parcelas?.filter((p: any) => p.status === 'pago').length || 0;
                                    if (size === paid) return <span className="text-emerald-600 font-extrabold flex items-center gap-1"><CheckCheck size={14}/> COMPLETO</span>;
                                    
                                    const hoje = new Date().toISOString().split('T')[0];
                                    const over = c.parcelas?.filter((p: any) => p.status !== 'pago' && p.vencimento < hoje).length || 0;
                                    
                                    if (over > 0) return <span className="text-rose-600 font-extrabold flex items-center gap-1"><ShieldAlert size={14}/> {over} ATRASADA(S)</span>;
                                    return <span className="text-amber-500 font-bold flex items-center gap-1"><Clock size={12}/> AGUARDANDO</span>;
                                }}
                            ]}
                            customActions={(item) => (
                                <div className="flex gap-1.5 shrink-0 select-none">
                                    <button 
                                        onClick={() => { 
                                            setPrintData({ 
                                                igreja: db.igreja, 
                                                carne: item, 
                                                membro: db.membros.find(m => m.id === item.membro_id) 
                                            }); 
                                            setPrintMode('carne_print'); 
                                            setPreviewOpen(true); 
                                        }} 
                                        className="p-2 bg-white border border-indigo-150 text-indigo-500 shadow-sm rounded-xl hover:bg-indigo-50 transition-colors" 
                                        title="Imprimir Carnê Completo"
                                    >
                                        <Printer size={15}/>
                                    </button>
                                    <button 
                                        onClick={() => { 
                                            setPrintData({ 
                                                item, 
                                                igreja: db.igreja, 
                                                membros: db.membros 
                                            }); 
                                            setPrintMode('recibo'); 
                                            setPreviewOpen(true); 
                                        }} 
                                        className="p-2 bg-white border border-pink-150 text-pink-500 shadow-sm rounded-xl hover:bg-pink-50 hover:text-pink-700 transition-colors" 
                                        title="Imprimir Recibo de Quitações"
                                    >
                                        <Receipt size={15}/>
                                    </button>
                                    <button 
                                        onClick={() => setConfirmDeleteId(item.id)} 
                                        className="p-2 bg-white border border-rose-150 text-rose-500 shadow-sm rounded-xl hover:bg-rose-50 hover:text-rose-700 transition-colors" 
                                        title="Excluir Registro de Carnê"
                                    >
                                        <Trash2 size={15}/>
                                    </button>
                                </div>
                            )}
                        />
                    </div>
                )}

                {/* 5. COVENANT ENGAGEMENT PASTORAL ANALYSIS */}
                {tab === 5 && (
                    <div className="h-full flex flex-col space-y-6 overflow-y-auto custom-scrollbar p-1">
                        
                        {/* Upper indicators bar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass-card p-4.5 rounded-3xl border-b-4 border-emerald-500 shadow-sm bg-white text-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Em Dia</span>
                                <h3 className="text-2xl font-black text-emerald-600 block mt-1">{carnesData.filter(d => d.status_carne === 'Em Dia').length} irmãos</h3>
                            </div>
                            <div className="glass-card p-4.5 rounded-3xl border-b-4 border-amber-500 shadow-sm bg-white text-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Atraso Leve</span>
                                <h3 className="text-2xl font-black text-amber-600 block mt-1">{carnesData.filter(d => d.status_carne === 'Atraso Leve').length} irmãos</h3>
                            </div>
                            <div className="glass-card p-4.5 rounded-3xl border-b-4 border-rose-500 shadow-sm bg-white text-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Alerta Pastoral</span>
                                <h3 className="text-2xl font-black text-rose-600 block mt-1">{carnesData.filter(d => d.status_carne === 'Alerta Pastoral').length} irmãos</h3>
                            </div>
                            <div className="glass-card p-4.5 rounded-3xl border-b-4 border-slate-400 shadow-sm bg-white text-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Sem Votos</span>
                                <h3 className="text-2xl font-black text-slate-600 block mt-1">{carnesData.filter(d => d.status_carne === 'Sem Carnê').length} irmãos</h3>
                            </div>
                        </div>

                        {/* Artificial Intelligence consultant guidance of relationships */}
                        <div className="glass-modern p-6 rounded-[2.5rem] border border-pink-100 bg-gradient-to-br from-pink-50/50 to-white flex-shrink-0">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div>
                                    <h3 className="font-bold text-pink-800 flex items-center gap-2"><Plus size={18}/> Aconselhamento sobre Votos/Campanhas</h3>
                                    <p className="text-xs text-pink-600/80 mt-1">Transforme a inadimplência num motivo para visita pastoral e apoio familiar.</p>
                                </div>
                                <Button 
                                    onClick={async () => {
                                        setLoadingAiRetention(true);
                                        // Wait, callGeminiAI is imported from App.md, calling now
                                        const prompt = `Analise os dados de engajamento nas campanhas/votos da igreja: Em Dia: ${carnesData.filter(d=>d.status_carne==='Em Dia').length}, Atraso Leve: ${carnesData.filter(d=>d.status_carne==='Atraso Leve').length}, Alerta Crítico (Inadimplentes): ${carnesData.filter(d=>d.status_carne==='Alerta Pastoral').length}. Dê conselhos pastorais e práticos (máx 3 parágrafos) sobre como a liderança deve abordar irmãos que não conseguiram cumprir seus votos financeiros. O foco não deve ser a cobrança da dívida, mas investigar amorosamente se a família passa por crise, desemprego, e como a igreja pode acolhêlos. Use Markdown.`;
                                        try {
                                            const { callGeminiAI } = require('../App');
                                            const result = await callGeminiAI(prompt);
                                            setAiRetention(result);
                                        } catch {
                                            setAiRetention("Abordagem Pastoral recomendada: Realize visitas de apoio preventivas, entenda as realidades locais sem fazer cobranças ativas e ofereça flexibilidade nos parcelamentos dos carnês.");
                                        }
                                        setLoadingAiRetention(false);
                                    }} 
                                    disabled={loadingAiRetention} 
                                    variant="primary" 
                                    className="py-2.5 px-5 text-xs shadow-md bg-gradient-to-r from-pink-500 to-rose-500 border-none hover:opacity-90 transition-opacity"
                                >
                                    {loadingAiRetention ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16}/>} Gerar Plano de Ação
                                </Button>
                            </div>
                            {aiRetention && (
                                <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-pink-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed animate-entrance font-medium">
                                    {aiRetention}
                                </div>
                            )}
                        </div>

                        {/* Interactive Grid Table of overall audit */}
                        <div className="flex-1 overflow-hidden">
                             <GenericTable 
                                title="Acompanhamento Relacional" 
                                type="membro" 
                                data={carnesData} 
                                columns={[
                                    { header: 'Nome do Irmão', key: 'nome', render: m => <span className="font-bold text-slate-800">{m.nome}</span> },
                                    { header: 'Status Financeiro', key: 'status_carne', render: m => <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border shadow-sm ${m.status_color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : m.status_color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' : m.status_color === 'rose' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-205'}`}>{m.status_carne}</span> },
                                    { header: 'Atrasos Acumulados', key: 'parcelas_atrasadas', render: m => m.parcelas_atrasadas > 0 ? <span className="text-rose-600 font-extrabold">{m.parcelas_atrasadas} devedoras</span> : <span className="text-slate-400 italic">Nenhum</span> },
                                    { header: 'Progresso da Meta', key: 'progresso', render: m => {
                                        if (m.total_esperado === 0) return <span className="text-slate-350">—</span>;
                                        const perc = ((m.total_pago / m.total_esperado) * 100).toFixed(0);
                                        return (
                                            <div className="flex items-center gap-2 w-32 select-none">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${perc}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500">{perc}%</span>
                                            </div>
                                        );
                                    }}
                                ]} 
                                customActions={(item) => (
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            let msg = `A Paz do Senhor, ${item.nome.split(' ')[0]}! Esperamos que esteja tudo bem. Estamos orando pela sua vida e família. Se precisar de apoio espiritual, conte com a nossa igreja sempre! Um abraço pastoral. Atenciosamente, ${db.igreja?.nome || 'Igreja'}`;
                                            const contact = item.telefone || item.contato || '';
                                            if (!contact) return addToast("Celular não cadastrado para contato.", "warning");
                                            window.open(`https://wa.me/55${contact.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
                                        }} 
                                        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all border border-emerald-250 shrink-0" 
                                        title="Contatar no WhatsApp"
                                    >
                                        <MessageCircle size={15}/>
                                    </button>
                                )}
                            />
                        </div>
                    </div>
                )}

            </div>

            {/* Local delete verification window */}
            {confirmDeleteId !== null && (
                <ConfirmModal 
                    isOpen={confirmDeleteId !== null}
                    onClose={() => setConfirmDeleteId(null)}
                    title="Remover Registro de Carnê"
                    message="Tem certeza que deseja excluir permanentemente este carnê e todo o histórico de status de parcelas associados? Esta ação é irreversível."
                    onConfirm={handleDeleteCarne}
                    onCancel={() => setConfirmDeleteId(null)}
                />
            )}
        </div>
    );
};

export default ModuleCarnes;
