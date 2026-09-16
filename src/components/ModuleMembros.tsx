import React, { useState, useEffect, useContext, createContext, useMemo, memo, useRef, isValidElement } from 'react';
import { createPortal } from 'react-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import JSZip from 'jszip';
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
  Inbox, Send as SendIcon, Reply, Forward, MoreHorizontal, Key, Headset, Server, Sliders,
  ArrowRightLeft
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
import { InformeRendimentosIRPF } from './InformeRendimentosIRPF';
import { ProntuarioMinisterial } from './ProntuarioMinisterial';
import { CartaTransferenciaEclesiastica } from './CartaTransferenciaEclesiastica';
import { GestaoVisitasPastorais } from './GestaoVisitasPastorais';

// Exporting component
const ModuleMembros = memo(() => { 
    const { db, setPrintMode, setPrintData, setPreviewOpen, addToast } = useContext(ChurchContext); 
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');
    const [prontuarioModalMembroId, setProntuarioModalMembroId] = useState<string | null>(null);
    const [informeIrpfMembroId, setInformeIrpfMembroId] = useState<string | null>(null);
    const [cartaTransferenciaMembroId, setCartaTransferenciaMembroId] = useState<string | null>(null);
    const [visitasModalMembroId, setVisitasModalMembroId] = useState<string | null>(null);
    
    const membrosFiltrados = (db.membros || []).filter(m => 
        congregacaoFilter === 'todas' || 
        m.congregacao_id === congregacaoFilter || 
        (!m.congregacao_id && congregacaoFilter === 'sede')
    ).sort((a: any, b: any) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' }));

    const handleExportMembrosCSV = () => {
        if (membrosFiltrados.length === 0) {
            addToast("Nenhum membro filtrado encontrado para exportar.", "info");
            return;
        }
        
        const headers = ["ID", "Nome", "CPF", "Telefone", "E-mail", "Cargo", "Função Administrativa", "Congregação", "Status", "Data Nascimento", "Endereço"];
        const rows = membrosFiltrados.map(m => [
            m.id || "",
            m.nome || "",
            m.cpf || "",
            m.telefone || "",
            m.email || "",
            m.cargo || "Membro",
            m.funcao_administrativa || "NENHUMA",
            !m.congregacao_id || m.congregacao_id === 'sede' ? 'Sede Principal' : db.congregacoes?.find(c => c.id === m.congregacao_id)?.nome || "Outra",
            m.status || "Ativo",
            m.data_nascimento || "",
            m.endereco || ""
        ]);
        
        let csvContent = "\uFEFF"; // UTF-8 BOM
        csvContent += headers.join(";") + "\n";
        rows.forEach(row => {
            csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";") + "\n";
        });
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `membros_gipp_${getTodayDate()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast("Listagem de Membros exportada com sucesso em CSV!", "success");
    };

    const handleExportVouchers = async (membro) => {
        // Query database transactions for attachments belonging to member
        const transacoes = (db.financeiro || []).filter(f => f.membro_id === membro.id && f.comprovante);
        
        if (transacoes.length === 0) {
            addToast(`Não existem comprovantes financeiros arquivados para ${membro.nome}.`, 'info');
            return;
        }

        addToast(`Processando e compactando ${transacoes.length} anexos em lote...`, 'info');
        const zip = new JSZip();

        try {
            for (let i = 0; i < transacoes.length; i++) {
                const tr = transacoes[i];
                const contentUrl = tr.comprovante;
                let filename = `comprovante_${tr.id || i}_${tr.data_competencia || tr.data_pagamento || 'transacao'}`;
                let blob = null;

                if (contentUrl.startsWith('data:')) {
                    const parts = contentUrl.split(',');
                    const mimeMatch = parts[0].match(/:(.*?);/);
                    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
                    const binary = atob(parts[1]);
                    let len = binary.length;
                    const bytes = new Uint8Array(len);
                    while (len--) {
                        bytes[len] = binary.charCodeAt(len);
                    }
                    blob = new Blob([bytes], { type: mime });
                    const fileExtension = mime.split('/')[1] || 'jpg';
                    filename += `.${fileExtension}`;
                } else {
                    const res = await fetch(contentUrl);
                    blob = await res.blob();
                    filename += `.jpg`;
                }

                if (blob) {
                    zip.file(filename, blob);
                }
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const localUrl = window.URL.createObjectURL(zipBlob);
            const anchor = document.createElement('a');
            anchor.href = localUrl;
            anchor.download = `comprovantes_${membro.nome.trim().replace(/\s+/g, '_')}.zip`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(localUrl);

            addToast(`Pacote ZIP exportado com sucesso! (${transacoes.length} arquivos)`, 'success');
        } catch (err: any) {
            console.error("ZIP Generation Error:", err);
            addToast(`Erro ao exportar lote: ${err.message}`, 'error');
        }
    };

    const cols = [
        {header:'', key:'foto'}, 
        {
            header:'Nome', 
            key:'nome', 
            render: (m) => (
                <div className="font-bold text-slate-700">
                    <div className="flex items-center flex-wrap gap-1.5">
                        <span>{safeText(m.nome)}</span>
                        {m.procedencia === 'outra_igreja' && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-black bg-indigo-50 border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-wider" title={`Vindo de: ${m.igreja_origem}`}>
                                ⛪ {m.igreja_origem || 'Igreja Origem'}
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">{safeText(m.cargo)}{m.funcao_administrativa && m.funcao_administrativa !== 'NENHUMA' ? ` (${safeText(m.funcao_administrativa)})` : ''} • {!m.congregacao_id || m.congregacao_id === 'sede' ? 'SEDE' : db.congregacoes.find(c=>c.id===m.congregacao_id)?.nome}</div>
                </div>
            )
        }, 
        {header:'Contato', key:'telefone'}, 
        {header:'Status', key:'status'}
    ]; 
    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl shadow-sm border border-indigo-100"><Users size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Membros</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Rol de membros da igreja</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <select value={congregacaoFilter} onChange={e => setCongregacaoFilter(e.target.value)} className="bg-white p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none shadow-sm">
                        <option value="todas">Filtro: Todas as Filiais</option>
                        <option value="sede">Sede Principal</option>
                        {(db.congregacoes||[]).map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <button 
                        onClick={() => setInformeIrpfMembroId(membrosFiltrados[0]?.id || 'geral')} 
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Emitir Comprovante Anual de Dízimos para Imposto de Renda"
                    >
                        <Receipt size={16} className="text-emerald-600" />
                        Informe IRPF
                    </button>
                    <button 
                        onClick={() => setProntuarioModalMembroId(membrosFiltrados[0]?.id || 'geral')} 
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 shadow-sm text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Prontuário Histórico Ministerial de Obreiros"
                    >
                        <Award size={16} className="text-amber-600" />
                        Prontuários Ministeriais
                    </button>
                    <button 
                        onClick={() => setCartaTransferenciaMembroId(membrosFiltrados[0]?.id || 'geral')} 
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Cartas de Transferência Eclesiástica"
                    >
                        <ArrowRightLeft size={16} className="text-indigo-600" />
                        Cartas de Transferência
                    </button>
                    <button 
                        onClick={() => setVisitasModalMembroId(membrosFiltrados[0]?.id || 'geral')} 
                        className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 shadow-sm text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Central de Visitas Pastorais & Aconselhamentos"
                    >
                        <HeartHandshake size={16} className="text-rose-600" />
                        Visitas Pastorais
                    </button>
                    <Button onClick={handleExportMembrosCSV} variant="secondary" className="bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all">
                        <FileSpreadsheet size={16} className="text-emerald-500" />
                        Exportar CSV
                    </Button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <GenericTable title="Listagem de Membros" type="membro" data={membrosFiltrados} columns={cols} customActions={(item) => (
                    <div className="flex gap-1.5">
                        <button onClick={() => setCartaTransferenciaMembroId(item.id)} className="p-2 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all border border-slate-200 bg-white hover:border-indigo-300 cursor-pointer" title="Emitir Carta de Transferência Eclesiástica"><ArrowRightLeft size={16}/></button>
                        <button onClick={() => setVisitasModalMembroId(item.id)} className="p-2 text-rose-700 hover:bg-rose-50 rounded-lg transition-all border border-slate-200 bg-white hover:border-rose-300 cursor-pointer" title="Registrar / Consultar Visitas Pastorais e Aconselhamentos"><HeartHandshake size={16}/></button>
                        <button onClick={() => setProntuarioModalMembroId(item.id)} className="p-2 text-amber-700 hover:bg-amber-50 rounded-lg transition-all border border-slate-200 bg-white hover:border-amber-300 cursor-pointer" title="Prontuário Ministerial / Carreira Eclesiástica"><Award size={16}/></button>
                        <button onClick={() => setInformeIrpfMembroId(item.id)} className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all border border-slate-200 bg-white hover:border-emerald-300 cursor-pointer" title="Informe Anual de Rendimentos / IRPF"><Receipt size={16}/></button>
                        <button onClick={() => { setPrintData({ membro: item, igreja: db.igreja, data: new Date().toISOString() }); setPrintMode('carteirinha'); setPreviewOpen(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-slate-200 bg-white hover:border-indigo-300 cursor-pointer" title="Carteirinha"><FileBadge size={16}/></button>
                        <button onClick={() => { setPrintData({ membro: item, igreja: db.igreja, data: new Date().toISOString() }); setPrintMode('rel_ficha_membro'); setPreviewOpen(true); }} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all border border-slate-200 bg-white hover:border-amber-300 cursor-pointer" title="Ficha do Membro"><FileText size={16}/></button>
                        <button onClick={() => { setPrintData({ membro: item, tarefas: db.tarefas || [], igreja: db.igreja }); setPrintMode('membro_escala_print'); setPreviewOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-slate-200 bg-white hover:border-blue-300 cursor-pointer" title="Escala de Compromissos"><ClipboardList size={16}/></button>
                        
                        {item.procedencia === 'outra_igreja' && item.carta_recomendacao && (
                            <button onClick={() => {
                                const link = document.createElement('a');
                                link.href = item.carta_recomendacao;
                                link.download = `carta_recomendacao_${item.nome.trim().replace(/\s+/g, '_')}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-slate-200 bg-white hover:border-rose-300 cursor-pointer" title="Baixar Carta de Recomendação"><ScrollText size={16}/></button>
                        )}

                        <button onClick={() => handleExportVouchers(item)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-slate-200 bg-white hover:border-emerald-300 cursor-pointer" title="Exportar Comprovantes (.ZIP)"><Download size={16}/></button>
                        <button onClick={() => {
                            const text = encodeURIComponent(`Olá ${item.nome}, a Paz do Senhor!`);
                            window.open(`https://wa.me/55${item.telefone?.replace(/\D/g,'')}?text=${text}`, '_blank');
                        }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-slate-200 bg-white hover:border-emerald-300 cursor-pointer" title="WhatsApp"><MessageCircle size={16}/></button>
                    </div>
                )} />
            </div>

            {/* MODAL / VIEW: PRONTUÁRIO HISTÓRICO MINISTERIAL */}
            {prontuarioModalMembroId && (
                <div className="fixed inset-0 bg-slate-950/70 z-[11000] overflow-y-auto p-4 md:p-8 backdrop-blur-xs flex justify-center items-start">
                    <div className="w-full max-w-5xl bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl p-4 md:p-6 my-auto">
                        <ProntuarioMinisterial 
                            initialMembroId={prontuarioModalMembroId === 'geral' ? undefined : prontuarioModalMembroId} 
                            onClose={() => setProntuarioModalMembroId(null)} 
                        />
                    </div>
                </div>
            )}

            {/* MODAL / VIEW: INFORME DE RENDIMENTOS IRPF */}
            {informeIrpfMembroId && (
                <div className="fixed inset-0 bg-slate-950/70 z-[11000] overflow-y-auto p-4 md:p-8 backdrop-blur-xs flex justify-center items-start">
                    <div className="w-full max-w-5xl bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl p-4 md:p-6 my-auto">
                        <InformeRendimentosIRPF 
                            initialMembroId={informeIrpfMembroId === 'geral' ? undefined : informeIrpfMembroId} 
                            onClose={() => setInformeIrpfMembroId(null)} 
                        />
                    </div>
                </div>
            )}

            {/* MODAL / VIEW: CARTA DE TRANSFERÊNCIA */}
            {cartaTransferenciaMembroId && typeof document !== 'undefined' && createPortal(
                <div 
                    className="fixed inset-0 bg-slate-950/80 z-[11000] overflow-y-auto p-3 sm:p-5 md:p-8 backdrop-blur-xs flex justify-center items-start"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setCartaTransferenciaMembroId(null);
                    }}
                >
                    <div className="w-full max-w-5xl bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl p-4 md:p-6 my-auto">
                        <CartaTransferenciaEclesiastica 
                            initialMembroId={cartaTransferenciaMembroId === 'geral' ? undefined : cartaTransferenciaMembroId} 
                            onClose={() => setCartaTransferenciaMembroId(null)} 
                        />
                    </div>
                </div>,
                document.body
            )}

            {/* MODAL / VIEW: VISITAS PASTORAIS & ACONSELHAMENTO */}
            {visitasModalMembroId && typeof document !== 'undefined' && createPortal(
                <div 
                    className="fixed inset-0 bg-slate-950/80 z-[11000] overflow-y-auto p-3 sm:p-5 md:p-8 backdrop-blur-xs flex justify-center items-start"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setVisitasModalMembroId(null);
                    }}
                >
                    <div className="w-full max-w-6xl bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl p-4 md:p-6 my-auto">
                        <GestaoVisitasPastorais 
                            initialMembroId={visitasModalMembroId === 'geral' ? undefined : visitasModalMembroId} 
                            onClose={() => setVisitasModalMembroId(null)} 
                        />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
});


export default ModuleMembros;
