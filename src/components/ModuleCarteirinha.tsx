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
const ModuleCarteirinha = () => {
    const { db, setDoc, doc, dbFirestore, appId, addToast, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext);
    
    // Layout State
    const defaultLayout = {
        bg: '#0f172a',
        fields: [
            { id: 'foto', type: 'image', label: 'Foto', x: 20, y: 50, w: 20, h: 26, visible: true },
            { id: 'nome', type: 'text', label: 'Nome', x: 60, y: 35, color: '#ffffff', size: 16, bold: true, shadow: true, visible: true },
            { id: 'cargo', type: 'text', label: 'Cargo', x: 60, y: 50, color: '#fbbf24', size: 12, bold: true, shadow: false, visible: true },
            { id: 'igreja', type: 'text', label: 'Nome da Igreja', x: 60, y: 15, color: '#ffffff', size: 12, bold: true, shadow: true, visible: true },
            { id: 'cpf', type: 'text', label: 'CPF', x: 60, y: 65, color: '#94a3b8', size: 10, bold: false, shadow: false, visible: true },
            { id: 'registro', type: 'text', label: 'Registro', x: 60, y: 75, color: '#94a3b8', size: 10, bold: false, shadow: false, visible: true },
            { id: 'qr', type: 'qr', label: 'QR Code', x: 85, y: 50, w: 15, h: 15, visible: true }
        ]
    };

    const [layout, setLayout] = useState(db.igreja?.carteirinha_custom || defaultLayout);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'print'
    const [draggingField, setDraggingField] = useState(null);
    const canvasRef = useRef(null);

    const handleSaveLayout = async () => {
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { carteirinha_custom: layout }, { merge: true });
            addToast("Modelo de carteirinha salvo com sucesso!", "success");
        } catch (e) {
            console.error(e);
            addToast("Erro ao salvar modelo.", "error");
        }
    };

    const handlePrintCustom = () => {
        if (selectedMembers.length === 0) return alert("Selecione membros na aba 'Imprimir'.");
        const membrosParaImprimir = db.membros.filter(m => selectedMembers.includes(m.id));
        setPrintData({ membros: membrosParaImprimir, igreja: { ...db.igreja, carteirinha_custom: layout } });
        setPrintMode('carteirinha_custom');
        setPreviewOpen(true);
    };

    const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new window.Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleBgUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const compressedBase64 = await compressImage(file, 800, 0.8);
            setLayout({ ...layout, bg: compressedBase64 });
        }
    };

    const updateField = (id, updates) => {
        setLayout({
            ...layout,
            fields: layout.fields.map(f => f.id === id ? { ...f, ...updates } : f)
        });
    };

    const handleMouseMove = (e) => {
        if (!draggingField || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        updateField(draggingField, { x, y });
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl shadow-sm border border-indigo-100"><IdCard size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Estúdio de Carteirinhas</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Crie e imprima modelos personalizados</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('editor')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'editor' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500'}`}>1. Desenhar Modelo</button>
                    <button onClick={() => setActiveTab('print')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'print' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500'}`}>2. Selecionar e Imprimir</button>
                </div>
            </div>

            {activeTab === 'editor' && (
                <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                    {/* Painel de Ferramentas */}
                    <div className="w-full lg:w-80 bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 shrink-0">
                        <div>
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-3 border-b border-slate-100 pb-2">Fundo da Carteirinha</h3>
                            <label className="w-full flex flex-col items-center justify-center gap-2 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-500 py-4 rounded-xl cursor-pointer transition-colors font-bold text-xs mb-3">
                                <ImagePlus size={20}/> Carregar Imagem
                                <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload}/>
                            </label>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-500">Cor Sólida:</span>
                                <input type="color" value={layout.bg.startsWith('#') ? layout.bg : '#0f172a'} onChange={(e) => setLayout({...layout, bg: e.target.value})} className="h-8 w-full rounded cursor-pointer border-0 p-0" />
                            </div>
                        </div>

                        <div>
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-3 border-b border-slate-100 pb-2">Camadas Visíveis</h3>
                            <div className="space-y-2">
                                {layout.fields.map(f => (
                                    <div key={f.id} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-700">{f.label}</span>
                                            <button onClick={() => updateField(f.id, { visible: !f.visible })} className={`p-1 rounded-md ${f.visible ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 bg-slate-200'}`}>
                                                {f.visible ? <Eye size={14}/> : <EyeOff size={14}/>}
                                            </button>
                                        </div>
                                        {f.visible && f.type === 'text' && (
                                            <div className="flex gap-2">
                                                <input type="color" value={f.color} onChange={(e) => updateField(f.id, { color: e.target.value })} className="w-8 h-6 rounded cursor-pointer p-0 border-0"/>
                                                <input type="range" min="8" max="30" value={f.size} onChange={(e) => updateField(f.id, { size: parseInt(e.target.value) })} className="flex-1 accent-indigo-500" title="Tamanho da Fonte"/>
                                                <button onClick={() => updateField(f.id, { bold: !f.bold })} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${f.bold ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}>B</button>
                                            </div>
                                        )}
                                        {f.visible && (f.type === 'image' || f.type === 'qr') && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-slate-500">Tamanho:</span>
                                                <input type="range" min="10" max="60" value={f.w} onChange={(e) => updateField(f.id, { w: parseInt(e.target.value), h: f.type==='qr' ? parseInt(e.target.value) : f.h })} className="flex-1 accent-indigo-500"/>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleSaveLayout} variant="primary" className="w-full mt-auto py-3"><Save size={18}/> Salvar Modelo Padrão</Button>
                    </div>

                    {/* Área do Canvas */}
                    <div className="flex-1 bg-slate-200 rounded-[2rem] shadow-inner overflow-hidden flex flex-col items-center justify-center p-8 relative pattern-grid-lg"
                         onMouseMove={handleMouseMove} onMouseUp={() => setDraggingField(null)} onMouseLeave={() => setDraggingField(null)}>
                        
                        <p className="absolute top-6 text-slate-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><MousePointerClick size={16}/> Arraste os elementos para posicionar</p>

                        {/* O Canvas (Proporção ID Card ~85.6x54mm) */}
                        <div ref={canvasRef} className="w-[856px] h-[540px] shadow-2xl relative overflow-hidden border border-slate-300 ring-4 ring-white/50 origin-center transform scale-50 md:scale-75 lg:scale-100"
                             style={{ backgroundColor: layout.bg.startsWith('#') ? layout.bg : 'transparent', backgroundImage: layout.bg.startsWith('http') || layout.bg.startsWith('data:') ? `url(${layout.bg})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            
                            {layout.fields.map(f => {
                                if (!f.visible) return null;
                                let content = '';
                                if (f.id === 'nome') content = 'NOME DO MEMBRO AQUI';
                                if (f.id === 'cargo') content = 'CARGO (FUNÇÃO ADM)';
                                if (f.id === 'cpf') content = '000.000.000-00';
                                if (f.id === 'registro') content = 'REG: 123456';
                                if (f.id === 'igreja') content = db.igreja.nome || 'NOME DA IGREJA';

                                const isDragging = draggingField === f.id;

                                if (f.type === 'text') {
                                    return (
                                        <div key={f.id} onMouseDown={() => setDraggingField(f.id)} className={`absolute whitespace-nowrap cursor-move select-none ${isDragging ? 'ring-2 ring-indigo-500 bg-white/10 backdrop-blur-sm' : 'hover:ring-1 hover:ring-white/50'}`}
                                             style={{ left: `${f.x}%`, top: `${f.y}%`, color: f.color, fontSize: `${f.size * 2}px`, fontWeight: f.bold ? 'bold' : 'normal', transform: 'translate(-50%, -50%)', textShadow: f.shadow ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none', zIndex: isDragging ? 50 : 10 }}>
                                            {content}
                                        </div>
                                    );
                                } else if (f.type === 'image' && f.id === 'foto') {
                                    return (
                                        <div key={f.id} onMouseDown={() => setDraggingField(f.id)} className={`absolute bg-slate-300 border-4 border-white shadow-md flex items-center justify-center cursor-move overflow-hidden ${isDragging ? 'ring-4 ring-indigo-500' : ''}`}
                                             style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w * 10}px`, height: `${f.h * 10}px`, transform: 'translate(-50%, -50%)', zIndex: isDragging ? 50 : 10 }}>
                                            <User size={48} className="text-slate-400"/>
                                            <span className="absolute text-[10px] font-black text-slate-500 uppercase bg-white/80 px-2 py-1 rounded">Foto</span>
                                        </div>
                                    );
                                } else if (f.type === 'qr' && f.id === 'qr') {
                                    return (
                                        <div key={f.id} onMouseDown={() => setDraggingField(f.id)} className={`absolute bg-white p-2 rounded shadow-md flex items-center justify-center cursor-move ${isDragging ? 'ring-4 ring-indigo-500' : ''}`}
                                             style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w * 10}px`, height: `${f.h * 10}px`, transform: 'translate(-50%, -50%)', zIndex: isDragging ? 50 : 10 }}>
                                            <QrCode size={48} className="text-slate-800"/>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'print' && (
                <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4 px-4">
                        <p className="text-sm font-bold text-slate-600">Selecione os membros para aplicar o seu modelo personalizado e imprimir.</p>
                        <Button onClick={handlePrintCustom} variant="success" className="shadow-lg"><Printer size={18}/> Imprimir ({selectedMembers.length})</Button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <GenericTable 
                            title="" 
                            type="membro" 
                            data={db.membros} 
                            columns={[{header:'Nome', key:'nome'}, {header:'Cargo', key:'cargo'}, {header:'Telefone', key:'telefone'}]} 
                            onSelectionChange={setSelectedMembers} 
                            customActions={null} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};


export default ModuleCarteirinha;
