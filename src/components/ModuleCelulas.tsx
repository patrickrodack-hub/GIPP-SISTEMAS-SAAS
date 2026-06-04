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
const ModuleCelulas = () => {
    const { db, openModal, setDoc, doc, dbFirestore, appId, addToast, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext);
    const [tab, setTab] = useState(1);
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');
    
    const celulas = (db.celulas || []).filter(c => 
        congregacaoFilter === 'todas' || 
        c.congregacao_id === congregacaoFilter || 
        (!c.congregacao_id && congregacaoFilter === 'sede')
    );
    
    const menuItems = [
        {id: 1, label: 'Dashboard', icon: LayoutDashboard},
        {id: 2, label: 'Cadastro de Células', icon: Share2},
        {id: 3, label: 'Mural de Células', icon: LayoutTemplate},
        {id: 4, label: 'Agenda & Tarefas', icon: Calendar},
        {id: 5, label: 'Relatórios', icon: FileText}
    ];

    const TabButton: any = ({ item }) => (
        <button onClick={() => setTab(item.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${tab === item.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white text-slate-500 hover:bg-purple-50 hover:text-purple-600'}`}>
            <item.icon size={18}/> {item.label}
        </button>
    );

    const handleDeleteComponente = async (celulaId, idx) => {
        const cel = celulas.find(c => c.id === celulaId);
        if (!cel) return;
        const novosMembros = [...(cel.membros || [])];
        novosMembros.splice(idx, 1);
        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'celulas', celulaId), { membros: novosMembros }, { merge: true });
        addToast("Integrante removido da célula.", "success");
    };

    const getIntegranteInfo = (id, tipo) => {
        if (tipo === 'visitante') {
            const vis = db.visitantes.find(v => v.id === id);
            return { nome: vis?.nome || 'Visitante Excluído', cargo: 'Visitante (CRM)', icon: HeartHandshake, color: 'rose' };
        }
        const mem = db.membros.find(m => m.id === id);
        return { nome: mem?.nome || 'Membro Excluído', cargo: mem?.cargo || 'Membro', icon: User, color: 'emerald' };
    };

    // Dashboard Calculations
    const totalCelulas = celulas.length;
    const totalComponentes = celulas.reduce((acc, c) => acc + (c.membros?.length || 0), 0);
    const totalAgenda = celulas.reduce((acc, c) => acc + (c.agenda?.length || 0), 0);

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-sm border border-purple-100"><Share2 size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Células e Grupos</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Gestão estratégica de pequenos grupos</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-[2rem] bg-gradient-to-br from-purple-50 to-white border-purple-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl"><Share2 size={32}/></div>
                                <div><h3 className="text-4xl font-black text-slate-800 tracking-tight">{totalCelulas}</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Células Ativas</p></div>
                            </div>
                            <div className="glass-card p-6 rounded-[2rem] bg-gradient-to-br from-emerald-50 to-white border-emerald-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl"><Users size={32}/></div>
                                <div><h3 className="text-4xl font-black text-slate-800 tracking-tight">{totalComponentes}</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Componentes (Membros/Vis.)</p></div>
                            </div>
                            <div className="glass-card p-6 rounded-[2rem] bg-gradient-to-br from-amber-50 to-white border-amber-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl"><Calendar size={32}/></div>
                                <div><h3 className="text-4xl font-black text-slate-800 tracking-tight">{totalAgenda}</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Programações e Agendas</p></div>
                            </div>
                        </div>
                        
                        <div className="glass-modern p-8 rounded-[2.5rem]">
                            <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center gap-2"><Star size={20} className="text-purple-500"/> Desempenho por Célula</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {celulas.map(cel => (
                                    <div key={cel.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>
                                        <h4 className="font-black text-lg text-purple-700 uppercase mb-2 relative z-10">{cel.nome}</h4>
                                        <div className="text-xs text-slate-600 mb-5 relative z-10 space-y-1">
                                            <p className="flex items-center gap-2"><User size={12} className="text-purple-400"/> Líder 1: <strong className="text-slate-800">{db.membros.find(m=>m.id===cel.lider1_id)?.nome || 'N/A'}</strong></p>
                                            {cel.lider2_id && <p className="flex items-center gap-2"><UserCheck size={12} className="text-purple-400"/> Líder 2: <strong className="text-slate-800">{db.membros.find(m=>m.id===cel.lider2_id)?.nome || 'N/A'}</strong></p>}
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 relative z-10">
                                            <div className="bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold text-emerald-700" title="Membros e Visitantes"><Users size={14}/> {(cel.membros?.length || 0)}</div>
                                            <div className="bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold text-amber-700" title="Programações"><Calendar size={14}/> {(cel.agenda?.length || 0)}</div>
                                        </div>
                                    </div>
                                ))}
                                {celulas.length === 0 && <p className="text-slate-400 italic text-sm col-span-3">Nenhuma célula cadastrada. Adicione uma nova célula na aba de Cadastros.</p>}
                            </div>
                        </div>
                    </div>
                )}
                
                {tab === 2 && (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h3 className="text-xl font-bold text-slate-700">Painel de Células</h3>
                            <Button onClick={() => openModal('celula')} variant="primary" className="shadow-purple-500/20"><Plus size={18}/> Nova Célula</Button>
                        </div>
                        <GenericTable 
                            title="" 
                            type="celula" 
                            data={celulas} 
                            columns={[
                                {header: 'Célula', key: 'nome', render: c => <span className="font-bold text-slate-800 uppercase">{c.nome}</span>},
                                {header: 'Liderança', key: 'lider', render: c => (
                                    <div className="text-xs">
                                        <div className="font-bold text-indigo-700">{db.membros.find(m=>m.id===c.lider1_id)?.nome || 'Sem Líder 1'}</div>
                                        {c.lider2_id && <div className="text-slate-500 mt-0.5">{db.membros.find(m=>m.id===c.lider2_id)?.nome} (Líder 2)</div>}
                                    </div>
                                )},
                                {header: 'Endereço', key: 'endereco', render: c => <span className="text-xs text-slate-600 truncate max-w-[200px] inline-block" title={c.endereco}>{c.endereco}</span>},
                                {header: 'Dia e Horário', key: 'horario', render: c => <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200">{c.horario || '-'}</span>}
                            ]} 
                        />
                    </div>
                )}

                {tab === 3 && (
                    <div className="h-full flex flex-col animate-fadeIn">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <div>
                                <h3 className="text-xl font-bold text-slate-700">Mural de Células</h3>
                                <p className="text-xs text-slate-500 font-medium">Informações da célula, quadro de líderes e lista de membros/visitantes.</p>
                            </div>
                            <Button onClick={() => openModal('celula_membro')} variant="primary" className="shadow-purple-500/20"><Plus size={18}/> Novo Integrante</Button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {celulas.map(cel => {
                                const lideres = [
                                    cel.lider1_id ? { ...db.membros.find(m => m.id === cel.lider1_id), title: 'Líder Principal' } : null,
                                    cel.lider2_id ? { ...db.membros.find(m => m.id === cel.lider2_id), title: 'Líder Auxiliar' } : null
                                ].filter(Boolean);
                                
                                return (
                                    <div key={cel.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                        <div className="bg-purple-600 p-5 text-white flex justify-between items-center">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h4 className="font-black text-xl tracking-tight truncate">{cel.nome}</h4>
                                                <p className="text-purple-200 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-1 truncate"><MapPin size={12} className="shrink-0"/> <span className="truncate">{cel.endereco || 'Local não definido'}</span></p>
                                            </div>
                                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shrink-0">
                                                <Share2 size={24}/>
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col gap-5">
                                            {/* QUADRO DE LÍDERES */}
                                            <div>
                                                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-slate-100 pb-2"><Briefcase size={14} className="text-purple-500"/> Quadro de Líderes</h5>
                                                <div className="space-y-2">
                                                    {lideres.map((l, idx) => l && (
                                                        <div key={idx} className="flex items-center gap-3 bg-purple-50/50 p-2 rounded-xl border border-purple-100/50">
                                                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold border border-purple-200 shrink-0">{l.nome ? l.nome.charAt(0) : '?'}</div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-bold text-sm text-slate-800 leading-none truncate">{l.nome}</p>
                                                                <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mt-0.5 truncate">{l.title}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {lideres.length === 0 && <p className="text-xs text-slate-400 italic">Sem líderes definidos.</p>}
                                                </div>
                                            </div>
                                            
                                            {/* QUADRO DE MEMBROS E VISITANTES */}
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-end mb-3 border-b border-slate-100 pb-2">
                                                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users size={14} className="text-emerald-500"/> Membros e Visitantes</h5>
                                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{cel.membros?.length || 0}</span>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                                                    {(cel.membros || []).map((mm, idx) => {
                                                        const info = getIntegranteInfo(mm.integrante_id, mm.tipo);
                                                        return (
                                                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group/item">
                                                                <div className="flex-1 min-w-0 pr-2">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className={`w-1.5 h-1.5 rounded-full bg-${info.color}-500 shrink-0`}></span>
                                                                        <span className="font-bold text-xs text-slate-700 truncate">{info.nome}</span>
                                                                    </div>
                                                                    <div className="text-[9px] text-slate-500 truncate pl-3.5">
                                                                        <span className={`text-${info.color}-600 font-bold uppercase`}>{info.cargo}</span> • {mm.funcao || 'Membro'}
                                                                    </div>
                                                                </div>
                                                                <button onClick={() => handleDeleteComponente(cel.id, idx)} className="text-slate-300 hover:text-rose-500 p-1 opacity-0 group-hover/item:opacity-100 transition-all shrink-0" title="Remover da célula"><X size={14}/></button>
                                                            </div>
                                                        )
                                                    })}
                                                    {(!cel.membros || cel.membros.length === 0) && <p className="text-xs text-slate-400 italic">Nenhum integrante cadastrado nesta célula.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {celulas.length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                                    <LayoutTemplate size={48} className="mx-auto mb-4 opacity-50"/>
                                    <p className="font-bold text-lg">Sem células cadastradas.</p>
                                    <p className="text-sm mt-1">Crie uma nova célula na aba de Cadastros para visualizá-la aqui.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 4 && (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <div>
                                <h3 className="text-xl font-bold text-slate-700">Agenda & Programações</h3>
                                <p className="text-xs text-slate-500 font-medium">Reuniões semanais, evangelismos, jantares e avisos.</p>
                            </div>
                            <Button onClick={() => openModal('celula_evento')} variant="primary"><Plus size={18}/> Novo Evento</Button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar grid md:grid-cols-2 lg:grid-cols-3 gap-5 p-2">
                            {celulas.flatMap(cel => (cel.agenda || []).map(evt => ({...evt, cel_nome: cel.nome}))).sort((a,b) => new Date(a.data).getTime() - new Date(b.data).getTime()).map((evt, idx) => (
                                <div key={idx} className="glass-card p-6 rounded-[2rem] border-l-4 border-l-purple-500 flex flex-col group hover:shadow-lg transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 px-3 py-1 rounded-lg border border-purple-200 shadow-sm">{evt.cel_nome}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded border ${new Date(evt.data) < new Date() ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                            {formatDateLocal(evt.data)}
                                        </span>
                                    </div>
                                    <h4 className="font-black text-slate-800 text-lg leading-tight mb-2">{evt.titulo}</h4>
                                    <p className="text-sm text-slate-500 mb-4 font-medium flex items-center gap-2"><Clock size={14} className="text-purple-400"/> {evt.hora || '--:--'}h</p>
                                    
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end">
                                        <button 
                                            onClick={() => {
                                                const msg = evt.whatsapp_msg || `Olá! Esperamos por si na programação da célula *${evt.cel_nome}*:\n\n*${evt.titulo}*\n📅 ${formatDateLocal(evt.data)} às ${evt.hora || '--:--'}h.\n\nDeus abençoe!`;
                                                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                                            }} 
                                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white p-2 rounded-xl transition-all border border-emerald-100 shadow-sm flex items-center gap-2 text-xs font-bold w-full justify-center"
                                            title="Enviar Lembrete por WhatsApp"
                                        >
                                            <MessageCircle size={16}/> Partilhar no WhatsApp
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {celulas.flatMap(c => c.agenda || []).length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                                    <Calendar size={48} className="mx-auto mb-4 opacity-50"/>
                                    <p className="font-bold text-lg">Sem programações agendadas.</p>
                                    <p className="text-sm mt-1">As agendas das células aparecerão aqui.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 5 && (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <div>
                                <h3 className="text-xl font-bold text-slate-700">Relatórios de Reuniões</h3>
                                <p className="text-xs text-slate-500 font-medium">Registe e imprima os relatórios das células para entregar à liderança.</p>
                            </div>
                            <Button onClick={() => openModal('celula_relatorio')} variant="primary" className="shadow-purple-500/20"><Plus size={18}/> Novo Relatório</Button>
                        </div>
                        <GenericTable 
                            title="" 
                            type="celula_relatorio" 
                            data={(db.celulas_relatorios || []).filter(r => {
                                const cel = celulas.find(c => c.id === r.celula_id);
                                return cel !== undefined; // Filtra relatórios apenas das células visíveis no filtro atual
                            })} 
                            columns={[
                                {header: 'Célula', key: 'celula_id', render: r => <span className="font-bold text-slate-800 uppercase">{celulas.find(c=>c.id===r.celula_id)?.nome || 'Desconhecida'}</span>},
                                {header: 'Data da Reunião', key: 'data', render: r => <span className="text-xs font-bold text-slate-600">{formatDateLocal(r.data)}</span>},
                                {header: 'Resumo', key: 'relatorio', render: r => <span className="text-xs text-slate-500 truncate max-w-[300px] inline-block" title={r.relatorio}>{r.relatorio}</span>}
                            ]} 
                            customActions={(item) => (
                                <button onClick={() => {
                                    setPrintData({ 
                                        relatorio: item, 
                                        celula: db.celulas.find(c=>c.id===item.celula_id),
                                        membros: db.membros,
                                        visitantes: db.visitantes,
                                        igreja: db.igreja 
                                    }); 
                                    setPrintMode('celula_relatorio'); 
                                    setPreviewOpen(true); 
                                }} className="p-2.5 text-blue-500 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors shadow-sm bg-white border border-blue-100" title="Imprimir Relatório"><Printer size={18}/></button>
                            )}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// --- NOVO: MÓDULO DE BOLETIM DIGITAL E REVISTA INTERATIVA ---


export default ModuleCelulas;
