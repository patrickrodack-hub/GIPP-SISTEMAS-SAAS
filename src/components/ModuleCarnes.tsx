import React, { useState, useEffect, useContext, createContext, useMemo, memo, useRef, isValidElement } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import { 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { 
  LayoutDashboard, Users, Building2, CreditCard, FileText, Settings, 
  LogOut, ChevronDown, ChevronRight, Plus, Edit, Trash2, Printer, 
  Search, Menu, X, DollarSign, BookOpen, Globe, Calendar, UserCheck, 
  CheckCircle, AlertCircle, ArrowUpCircle, ArrowDownCircle, Filter, MapPin, Briefcase, Heart, GraduationCap, Shield, Download,
  ClipboardList, Gift, PieChart as PieChartIcon, Upload, Image as ImageIcon, Database, Save, RefreshCw, Trash,
  Phone, Mail, Code, Info, Share2, Home, FileBadge, Stamp, Wifi, WifiOff, Star, HeartHandshake, Camera,
  CheckSquare, MessageCircle, Send, PlayCircle, Clock, List, Smartphone, User, UserPlus, Video,
  FileSpreadsheet, CheckCheck, Flag, Smile, Copy, Bold, Italic, Type, Activity, Receipt, RotateCcw, Ban, Archive, Printer as PrinterIcon,
  MoreVertical, Bell, Truck, Layers, Lock, ScrollText, Megaphone, Award, FileBarChart, Mic,
  FileCheck, Paperclip, ExternalLink, FileJson, UploadCloud, AlertTriangle, Check, EyeOff, Eye, Tent, Footprints, Zap, ZapOff, Target, Cloud,
  TrendingUp, TrendingDown, PenTool, Book, Droplets, ChevronLeft, Sparkles, Cpu, Palette, Loader2, MessageSquare, Music,
  MousePointer2, Move, Type as TypeIcon, ImagePlus, DownloadCloud, GitBranch, History,
  MonitorPlay, Palette as PaletteIcon, Hash, Printer as PrintIcon, Wallet, Landmark, FileInput, RotateCcw as RestoreIcon,
  LayoutTemplate, MousePointerClick, Image, Baby, HardHat, ShieldCheck, QrCode, UserCircle, Maximize, Minimize,
  Sun, Moon, Package, Flame, Minus, Newspaper, BookOpenText, IdCard, Badge,
  Inbox, Send as SendIcon, Reply, Forward, MoreHorizontal, Key, Headset, Server, Sliders
} from 'lucide-react';

import { 
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, 
  setDoc, onSnapshot, query, writeBatch, where, getDocs,
  enableIndexedDbPersistence
} from 'firebase/firestore';

import { preprocessImage, storeMedia, getMedia, clearMedia } from '../lib/indexedDbService';

import {
  ChurchContext, CachedImage, callGeminiAI, resizeImageAndCompress,
  Button, FormInput, FormSelect, BackupModal, ConfirmModal,
  GenericTable, GenericModal, PageBoundaryIndicators, DocumentPreviewModal, PrintSystem,
  AutocompleteRecipient, SharedEmailModule,
  playMenuSound, playNotificationSound, getTodayDate, formatDateLocal, isValidCPF, formatCPF,
  copyToClipboard, generatePixPayload, safeRender, safeText, ICON_MAP, getIcon, THEME_COLORS, REGRA_DOMINGOS, PortalHeader
} from '../App';

// Exporting component
const ModuleCarnes = () => {
    const { db, openModal, setDoc, doc, dbFirestore, appId, addToast, setPrintMode, setPrintData, setPreviewOpen, logAction } = useContext(ChurchContext);
    const [tab, setTab] = useState(1);
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');
    
    // Filtro de Carnês por Congregação
    const carnes = (db.carnes || []).filter(c => 
        congregacaoFilter === 'todas' || 
        c.congregacao_id === congregacaoFilter || 
        (!c.congregacao_id && congregacaoFilter === 'sede')
    );
    
    // Filtro de Membros para base de cálculo de engajamento
    const membrosFiltrados = (db.membros || []).filter(m => 
        congregacaoFilter === 'todas' || 
        m.congregacao_id === congregacaoFilter || 
        (!m.congregacao_id && congregacaoFilter === 'sede')
    );
    
    // Estados para a Análise de Engajamento e Retenção
    const [aiRetention, setAiRetention] = useState('');
    const [loadingAiRetention, setLoadingAiRetention] = useState(false);

    const menuItems = [
        {id: 1, label: 'Dashboard', icon: LayoutDashboard}, 
        {id: 2, label: 'Novo Carnê', icon: Plus}, 
        {id: 3, label: 'Gerenciamento', icon: List}, 
        {id: 4, label: 'Listagem & Impressão', icon: Printer},
        {id: 5, label: 'Análise de Engajamento', icon: Target}
    ];
    const TabButton: any = ({ item }) => (<button onClick={() => setTab(item.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}><item.icon size={18}/> {item.label}</button>);
    const handlePayParcela = async (carneId, parcelaIdx) => { const carne = carnes.find(c => c.id === carneId); if (!carne) return; const novasParcelas = [...carne.parcelas]; const statusAtual = novasParcelas[parcelaIdx].status; novasParcelas[parcelaIdx].status = statusAtual === 'pago' ? 'pendente' : 'pago'; novasParcelas[parcelaIdx].data_pagamento = statusAtual === 'pago' ? null : new Date().toISOString().split('T')[0]; await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'carnes', carneId), { parcelas: novasParcelas }, { merge: true }); logAction('BAIXA_CARNE', `Alterou status da parcela ${parcelaIdx+1} do carnê ${carne.titulo}`, 'carnes', carneId); addToast("Status atualizado!", "success"); };

    // Dashboard Calculations
    const totalCarnes = carnes.length;
    const totalMembros = membrosFiltrados.length || 0;
    const participantes = new Set(carnes.map(c => c.membro_id)).size;
    const percParticipacao = totalMembros > 0 ? ((participantes / totalMembros) * 100).toFixed(1) : 0;
    
    let totalEsperado = 0;
    let totalRecebido = 0;
    carnes.forEach(c => {
        totalEsperado += parseFloat(c.valor_total) || 0;
        totalRecebido += (c.parcelas || []).filter(p => p.status === 'pago').reduce((a, b) => a + (parseFloat(b.valor) || 0), 0);
    });
    const totalAReceber = totalEsperado - totalRecebido;
    const percRecebido = totalEsperado > 0 ? ((totalRecebido / totalEsperado) * 100).toFixed(1) : 0;

    // Cálculo Avançado de Engajamento em Campanhas (Carnês)
    const carnesData = useMemo(() => {
        if(tab !== 5) return [];
        const hoje = new Date().toISOString().split('T')[0];

        return membrosFiltrados.filter(m => m.status !== 'Inativo').map(membro => {
            const meusCarnes = carnes.filter(c => c.membro_id === membro.id);
            let totalEsperadoMembro = 0;
            let totalPagoMembro = 0;
            let parcelasAtrasadas = 0;
            
            meusCarnes.forEach(c => {
                totalEsperadoMembro += parseFloat(c.valor_total) || 0;
                (c.parcelas || []).forEach(p => {
                    if (p.status === 'pago') {
                        totalPagoMembro += parseFloat(p.valor) || 0;
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
        }).sort((a,b) => b.parcelas_atrasadas - a.parcelas_atrasadas);
    }, [carnes, membrosFiltrados, tab]);

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl shadow-sm border border-pink-100"><CreditCard size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Carnês & Campanhas</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Gestão de contribuições parceladas e votos</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select value={congregacaoFilter} onChange={e => setCongregacaoFilter(e.target.value)} className="bg-white p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none shadow-sm">
                        <option value="todas">Filtro: Todas as Filiais</option>
                        <option value="sede">Sede Principal</option>
                        {(db.congregacoes||[]).map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="glass-modern p-2 rounded-[2rem] flex overflow-x-auto custom-scrollbar gap-2 border border-white/50 shrink-0">
                {menuItems.map(item => <TabButton key={item.id} item={item} />)}
            </div>
            
            <div className="flex-1 overflow-hidden">
                {tab === 1 && (
                    <div className="space-y-6 h-full overflow-y-auto custom-scrollbar p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-indigo-500 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4"><Layers size={20}/></div>
                                <div>
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tight mb-1">{totalCarnes}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Campanhas / Carnês</p>
                                </div>
                            </div>
                            
                            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-blue-500 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4"><Users size={20}/></div>
                                <div>
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tight mb-1">{participantes}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Participantes Únicos</p>
                                    <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden flex"><div className="h-full bg-blue-500" style={{width: `${percParticipacao}%`}}></div></div>
                                    <p className="text-[10px] text-slate-500 font-bold mt-2 text-right">{percParticipacao}% da igreja</p>
                                </div>
                            </div>
                            
                            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-emerald-500 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4"><DollarSign size={20}/></div>
                                <div>
                                    <h3 className="text-3xl font-black text-emerald-600 tracking-tight mb-1">R$ {totalRecebido.toFixed(2)}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Total Recebido</p>
                                    <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden flex"><div className="h-full bg-emerald-500" style={{width: `${percRecebido}%`}}></div></div>
                                    <p className="text-[10px] text-slate-500 font-bold mt-2 text-right">{percRecebido}% do esperado</p>
                                </div>
                            </div>
                            
                            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-amber-500 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4"><Activity size={20}/></div>
                                <div>
                                    <h3 className="text-3xl font-black text-amber-600 tracking-tight mb-1">R$ {totalAReceber.toFixed(2)}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">A Receber / Pendente</p>
                                    <div className="bg-amber-50 p-2 rounded-lg mt-2">
                                        <p className="text-[10px] font-bold text-amber-700 text-center">Meta Total: R$ {totalEsperado.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {tab === 2 && (<div className="glass-modern p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center h-full"><div className="bg-indigo-50 p-6 rounded-full mb-6"><Plus size={48} className="text-indigo-500"/></div><h2 className="text-3xl font-black text-slate-800 mb-4">Gerar Novo Carnê</h2><Button onClick={() => openModal('carne_novo')} variant="primary" className="py-4 px-8 text-lg shadow-xl"><Plus size={24}/> Criar Carnê</Button></div>)}
                {tab === 3 && (<div className="h-full flex flex-col"><div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 p-2">{carnes.map(carne => (<div key={carne.id} className="glass-panel p-6 rounded-3xl"><div className="mb-6"><span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-600 px-2 py-1 rounded tracking-wider">{carne.titulo}</span></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">{carne.parcelas?.map((p, i) => (<button key={i} onClick={() => handlePayParcela(carne.id, i)} className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${p.status === 'pago' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'}`}><span className="text-[10px] font-bold uppercase">Parc. {p.numero}</span><span className="font-bold text-sm">R$ {parseFloat(p.valor).toFixed(2)}</span></button>))}</div></div>))}</div></div>)}
                {tab === 4 && (<GenericTable title="Listagem" type="carne" data={carnes} columns={[{header:'Campanha', key:'titulo'}, {header:'Membro', key:'membro_id', render: c => db.membros.find(m=>m.id===c.membro_id)?.nome}]} customActions={(item) => (
                    <div className="flex gap-2">
                        <button onClick={() => { setPrintData({ item, igreja: db.igreja, membros: db.membros }); setPrintMode('recibo'); setPreviewOpen(true); }} className="p-2.5 bg-white border border-blue-100 text-blue-500 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm" title="Imprimir Recibo"><Receipt size={18}/></button>
                        <button onClick={() => { setPrintData({ igreja: db.igreja, carne: item, membro: db.membros.find(m=>m.id===item.membro_id) }); setPrintMode('carne_print'); setPreviewOpen(true); }} className="p-2.5 bg-white border border-indigo-100 text-indigo-500 rounded-xl hover:bg-indigo-50" title="Imprimir Carnê"><PrintIcon size={18}/></button>
                    </div>
                )} />)}
                
                {/* --- NOVO PAINEL DE ANÁLISE DE ENGAJAMENTO (CARNÊS) --- */}
                {tab === 5 && (
                    <div className="h-full flex flex-col space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass-card p-5 rounded-3xl border-b-4 border-emerald-500 shadow-sm flex flex-col justify-center text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Em Dia</p>
                                <h3 className="text-3xl font-black text-emerald-600">{carnesData.filter(d=>d.status_carne==='Em Dia').length}</h3>
                            </div>
                            <div className="glass-card p-5 rounded-3xl border-b-4 border-amber-500 shadow-sm flex flex-col justify-center text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Atraso Leve (1-2)</p>
                                <h3 className="text-3xl font-black text-amber-600">{carnesData.filter(d=>d.status_carne==='Atraso Leve').length}</h3>
                            </div>
                            <div className="glass-card p-5 rounded-3xl border-b-4 border-rose-500 shadow-sm flex flex-col justify-center text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Alerta Pastoral (3+)</p>
                                <h3 className="text-3xl font-black text-rose-600">{carnesData.filter(d=>d.status_carne==='Alerta Pastoral').length}</h3>
                            </div>
                            <div className="glass-card p-5 rounded-3xl border-b-4 border-slate-400 shadow-sm flex flex-col justify-center text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sem Carnê</p>
                                <h3 className="text-3xl font-black text-slate-600">{carnesData.filter(d=>d.status_carne==='Sem Carnê').length}</h3>
                            </div>
                        </div>

                        <div className="glass-modern p-6 rounded-[2rem] border border-pink-100 bg-gradient-to-br from-pink-50/50 to-white flex-shrink-0">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div>
                                    <h3 className="font-bold text-pink-800 flex items-center gap-2"><HeartHandshake size={18}/> Aconselhamento sobre Votos/Campanhas</h3>
                                    <p className="text-xs text-pink-600/80 mt-1">Transforme a inadimplência num motivo para visita pastoral e apoio familiar.</p>
                                </div>
                                <Button onClick={async () => {
                                        setLoadingAiRetention(true);
                                        const prompt = `Analise os dados de engajamento nas campanhas/votos da igreja: Em Dia: ${carnesData.filter(d=>d.status_carne==='Em Dia').length}, Atraso Leve: ${carnesData.filter(d=>d.status_carne==='Atraso Leve').length}, Alerta Crítico (Inadimplentes): ${carnesData.filter(d=>d.status_carne==='Alerta Pastoral').length}. Dê conselhos pastorais e práticos (máx 3 parágrafos) sobre como a liderança deve abordar irmãos que não conseguiram cumprir seus votos financeiros. O foco não deve ser a cobrança da dívida, mas investigar amorosamente se a família passa por crise, desemprego, e como a igreja pode acolhê-los. Use Markdown.`;
                                        const result = await callGeminiAI(prompt);
                                        setAiRetention(result);
                                        setLoadingAiRetention(false);
                                    }} 
                                    disabled={loadingAiRetention} variant="primary" className="py-2 px-4 text-xs shadow-md bg-gradient-to-r from-pink-500 to-rose-500">
                                    {loadingAiRetention ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16}/>} Gerar Plano de Ação
                                </Button>
                            </div>
                            {aiRetention && (
                                <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-pink-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed animate-entrance">
                                    {aiRetention}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-hidden">
                             <GenericTable 
                                title="Acompanhamento por Membro" 
                                type="membro" 
                                data={carnesData} 
                                columns={[
                                    {header:'Membro', key:'nome', render: m => <span className="font-bold text-slate-800">{m.nome}</span>},
                                    {header:'Status da Campanha', key:'status_carne', render: m => <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border shadow-sm ${m.status_color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : m.status_color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' : m.status_color === 'rose' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{m.status_carne}</span>},
                                    {header:'Parcelas Atrasadas', key:'parcelas_atrasadas', render: m => m.parcelas_atrasadas > 0 ? <span className="text-rose-600 font-bold">{m.parcelas_atrasadas} em atraso</span> : <span className="text-slate-400 italic">0</span>},
                                    {header:'Progresso', key:'progresso', render: m => {
                                        if (m.total_esperado === 0) return '-';
                                        const perc = ((m.total_pago / m.total_esperado) * 100).toFixed(0);
                                        return (
                                            <div className="flex items-center gap-2 w-32">
                                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{width: `${perc}%`}}></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500">{perc}%</span>
                                            </div>
                                        );
                                    }}
                                ]} 
                                customActions={(item) => (
                                    <button onClick={() => {
                                        let msg = `A Paz do Senhor, ${item.nome.split(' ')[0]}! Aqui é da ${db.igreja.nome}. Como tem passado? `;
                                        if (item.status_color === 'rose' || item.status_color === 'amber') {
                                            msg += `Estamos a orar por si! Sabemos que às vezes surgem imprevistos difíceis. Se a sua família estiver a precisar de apoio espiritual ou oração, conte conosco. Não se preocupe com as campanhas agora, a sua vida é o mais importante para Deus! Podemos agendar uma visita?`;
                                        } else if (item.status_color === 'emerald') {
                                            msg += `Passando para agradecer pelo seu compromisso com os votos e campanhas da casa do Senhor. Que Deus multiplique as suas sementes!`;
                                        } else {
                                            msg += `Queremos lembrar o quanto você é especial para o nosso ministério. Que Deus abençoe o seu dia!`;
                                        }
                                        window.open(`https://wa.me/55${(item.telefone||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
                                    }} className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm border border-emerald-200" title="Contactar no WhatsApp">
                                        <MessageCircle size={18}/>
                                    </button>
                                )}
                                onDeleteOverride={() => {}}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export default ModuleCarnes;
