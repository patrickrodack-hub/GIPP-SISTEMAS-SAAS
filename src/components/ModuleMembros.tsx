import React, { useState, useEffect, useContext, createContext, useMemo, memo, useRef, isValidElement } from 'react';
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
const ModuleMembros = memo(() => { 
    const { db, setPrintMode, setPrintData, setPreviewOpen, addToast } = useContext(ChurchContext); 
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');
    
    const membrosFiltrados = (db.membros || []).filter(m => 
        congregacaoFilter === 'todas' || 
        m.congregacao_id === congregacaoFilter || 
        (!m.congregacao_id && congregacaoFilter === 'sede')
    );

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

    const cols = [{header:'', key:'foto'}, {header:'Nome', key:'nome', render: (m) => <div className="font-bold text-slate-700">{safeText(m.nome)}<div className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">{safeText(m.cargo)}{m.funcao_administrativa && m.funcao_administrativa !== 'NENHUMA' ? ` (${safeText(m.funcao_administrativa)})` : ''} • {!m.congregacao_id || m.congregacao_id === 'sede' ? 'SEDE' : db.congregacoes.find(c=>c.id===m.congregacao_id)?.nome}</div></div>}, {header:'Contato', key:'telefone'}, {header:'Status', key:'status'}]; 
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
                <div className="flex items-center gap-3">
                    <select value={congregacaoFilter} onChange={e => setCongregacaoFilter(e.target.value)} className="bg-white p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none shadow-sm">
                        <option value="todas">Filtro: Todas as Filiais</option>
                        <option value="sede">Sede Principal</option>
                        {(db.congregacoes||[]).map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <GenericTable title="Listagem de Membros" type="membro" data={membrosFiltrados} columns={cols} customActions={(item) => (
                    <div className="flex gap-2">
                        <button onClick={() => { setPrintData({ membro: item, igreja: db.igreja, data: new Date().toISOString() }); setPrintMode('carteirinha'); setPreviewOpen(true); }} className="p-2.5 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-sm border border-indigo-100 bg-white cursor-pointer" title="Carteirinha"><FileBadge size={18}/></button>
                        <button onClick={() => { setPrintData({ membro: item, igreja: db.igreja, data: new Date().toISOString() }); setPrintMode('rel_ficha_membro'); setPreviewOpen(true); }} className="p-2.5 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all shadow-sm border border-amber-100 bg-white cursor-pointer" title="Ficha do Membro"><FileText size={18}/></button>
                        <button onClick={() => { setPrintData({ membro: item, tarefas: db.tarefas || [], igreja: db.igreja }); setPrintMode('membro_escala_print'); setPreviewOpen(true); }} className="p-2.5 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm border border-blue-100 bg-white cursor-pointer" title="Escala de Compromissos"><ClipboardList size={18}/></button>
                        <button onClick={() => handleExportVouchers(item)} className="p-2.5 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm border border-emerald-100 bg-white cursor-pointer" title="Exportar Comprovantes (.ZIP)"><Download size={18}/></button>
                        <button onClick={() => {
                            const text = encodeURIComponent(`Olá ${item.nome}, a Paz do Senhor!`);
                            window.open(`https://wa.me/55${item.telefone?.replace(/\D/g,'')}?text=${text}`, '_blank');
                        }} className="p-2.5 text-emerald-500 hover:bg-emerald-555 hover:text-white rounded-xl transition-all shadow-sm border border-emerald-100 bg-white cursor-pointer" title="WhatsApp"><MessageCircle size={18}/></button>
                    </div>
                )} />
            </div>
        </div>
    );
});


export default ModuleMembros;
