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
const ModuleCertificados = () => {
    const { db, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext); 
    const [selectedType, setSelectedType] = useState(null);
    
    // Estado consolidado para os dados do certificado
    const [certData, setCertData] = useState({
        membro_id: '',
        cargo: 'Obreiro(a)',
        nome_crianca: '', nome_pai: '', nome_mae: '', data_nasc: '',
        nome_noivo: '', nome_noiva: '',
        curso: 'Teologia Básica',
        evento: 'Congresso Anual',
        turma_id: ''
    });

    const certTypes = [
        { id: 'cert_batismo', label: 'Batismo nas Águas', icon: Droplets, color: 'blue', desc: 'Certificação de descida às águas.' }, 
        { id: 'cert_consagracao', label: 'Consagração', icon: Award, color: 'rose', desc: 'Ordenação ao ministério pastoral/diaconal.' }, 
        { id: 'cert_crianca', label: 'Apresent. de Criança', icon: Baby, color: 'amber', desc: 'Ato de consagração infantil.' }, 
        { id: 'cert_casamento', label: 'Casamento Religioso', icon: Heart, color: 'pink', desc: 'Enlace matrimonial com efeito religioso.' }, 
        { id: 'cert_curso', label: 'Conclusão de Curso', icon: Book, color: 'indigo', desc: 'Diplomas teológicos e seminários.' },
        { id: 'cert_evento', label: 'Participação em Evento', icon: Megaphone, color: 'emerald', desc: 'Certificação de congressos e palestras.' },
        { id: 'cert_ebd', label: 'Escola Bíblica (EBD)', icon: GraduationCap, color: 'purple', desc: 'Aprovação nas turmas dominicais.' }
    ];

    const handlePrint = () => { 
        if (!selectedType) return;
        
        let membroInfo = null;
        if (certData.membro_id) {
            membroInfo = db.membros.find(m => m.id === certData.membro_id);
        }

        let turmaInfo = null;
        let professoresNomes = 'Superintendente EBD';
        if (certData.turma_id && db.ebd?.turmas) {
            turmaInfo = db.ebd.turmas.find(t => t.id === certData.turma_id);
            if (turmaInfo) {
                professoresNomes = [turmaInfo.prof1_id, turmaInfo.prof2_id, turmaInfo.prof3_id]
                    .map(id => db.membros.find(m => m.id === id)?.nome)
                    .filter(Boolean).join(', ') || 'Corpo Docente';
            }
        }

        // Preparar os dados exatos para injetar no modelo
        const finalData = { 
            igreja: db.igreja, 
            membro: membroInfo || {}, 
            extra: {
                cargo: certData.cargo,
                nome_crianca: certData.nome_crianca,
                nome_pai: certData.nome_pai,
                nome_mae: certData.nome_mae,
                data_nasc: certData.data_nasc,
                nome_noivo: certData.nome_noivo,
                nome_noiva: certData.nome_noiva,
                curso: certData.curso,
                evento: certData.evento,
                turma: turmaInfo ? turmaInfo.nome : 'Classe Dominical',
                professor: professoresNomes
            } 
        }; 

        setPrintData(finalData); 
        setPrintMode(selectedType); 
        setPreviewOpen(true); 
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl shadow-sm border border-amber-100"><Award size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Emissão de Certificados Oficiais</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Formatos A4 de alto padrão para registo legal e molduras</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
                {/* Lado Esquerdo: Seleção do Modelo */}
                <div className="w-full lg:w-1/3 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2">
                    <h3 className="font-black text-slate-700 uppercase tracking-widest text-xs mb-2">1. Escolha o Tipo de Certificado</h3>
                    {certTypes.map(c => (
                        <button 
                            key={c.id} 
                            onClick={() => { setSelectedType(c.id); setCertData({...certData, membro_id: ''}); }} 
                            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group ${selectedType === c.id ? `bg-${c.color}-50 border-${c.color}-500 shadow-md` : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                        >
                            <div className={`p-3 rounded-xl transition-colors shrink-0 ${selectedType === c.id ? `bg-${c.color}-500 text-white shadow-inner` : `bg-slate-100 text-slate-500 group-hover:bg-${c.color}-100 group-hover:text-${c.color}-600`}`}>
                                <c.icon size={20} />
                            </div>
                            <div>
                                <span className={`block font-black text-sm mb-1 ${selectedType === c.id ? `text-${c.color}-800` : 'text-slate-800'}`}>{c.label}</span>
                                <span className="block text-[10px] font-medium text-slate-500 leading-tight">{c.desc}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Lado Direito: Formulário de Preenchimento Dinâmico */}
                <div className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-y-auto custom-scrollbar flex flex-col relative">
                    {!selectedType ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 text-center opacity-60">
                            <Stamp size={64} className="mb-6 text-slate-300"/>
                            <h3 className="text-xl font-bold text-slate-600 mb-2">Nenhum modelo selecionado</h3>
                            <p className="text-sm">Escolha uma das opções no painel lateral para preencher os dados e gerar o documento oficial em tamanho A4.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col animate-entrance">
                            <div className={`p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center`}>
                                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                    <Edit size={20} className="text-indigo-500"/> Preencher Dados do Documento
                                </h3>
                            </div>
                            
                            <div className="p-8 flex-1 space-y-6">
                                {/* Formulário: Batismo */}
                                {selectedType === 'cert_batismo' && (
                                    <div className="bg-blue-50/30 p-6 rounded-3xl border border-blue-100">
                                        <FormSelect label="Selecione o Membro Batizado" value={certData.membro_id} onChange={v => setCertData({...certData, membro_id: v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                                    </div>
                                )}

                                {/* Formulário: Consagração */}
                                {selectedType === 'cert_consagracao' && (
                                    <div className="bg-rose-50/30 p-6 rounded-3xl border border-rose-100 space-y-4">
                                        <FormSelect label="Selecione o Obreiro Consagrado" value={certData.membro_id} onChange={v => setCertData({...certData, membro_id: v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                                        <FormSelect label="Ofício / Cargo de Consagração" value={certData.cargo} onChange={v => setCertData({...certData, cargo: v})} options={['Auxiliar de Trabalho', 'Diácono / Diaconisa', 'Presbítero', 'Evangelista', 'Missionário(a)', 'Pastor']} />
                                    </div>
                                )}

                                {/* Formulário: Criança */}
                                {selectedType === 'cert_crianca' && (
                                    <div className="bg-amber-50/30 p-6 rounded-3xl border border-amber-100 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormInput label="Nome Completo da Criança" value={certData.nome_crianca} onChange={v => setCertData({...certData, nome_crianca: v})} required />
                                            <FormInput label="Data de Nascimento" type="date" value={certData.data_nasc} onChange={v => setCertData({...certData, data_nasc: v})} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormInput label="Nome do Pai" value={certData.nome_pai} onChange={v => setCertData({...certData, nome_pai: v})} />
                                            <FormInput label="Nome da Mãe" value={certData.nome_mae} onChange={v => setCertData({...certData, nome_mae: v})} required />
                                        </div>
                                    </div>
                                )}

                                {/* Formulário: Casamento */}
                                {selectedType === 'cert_casamento' && (
                                    <div className="bg-pink-50/30 p-6 rounded-3xl border border-pink-100 space-y-4">
                                        <FormInput label="Nome Completo do Noivo" value={certData.nome_noivo} onChange={v => setCertData({...certData, nome_noivo: v})} required />
                                        <FormInput label="Nome Completo da Noiva" value={certData.nome_noiva} onChange={v => setCertData({...certData, nome_noiva: v})} required />
                                    </div>
                                )}

                                {/* Formulário: Cursos */}
                                {selectedType === 'cert_curso' && (
                                    <div className="bg-indigo-50/30 p-6 rounded-3xl border border-indigo-100 space-y-4">
                                        <FormSelect label="Selecione o Aluno" value={certData.membro_id} onChange={v => setCertData({...certData, membro_id: v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                                        <FormSelect label="Nome do Curso Concluído" value={certData.curso} onChange={v => setCertData({...certData, curso: v})} options={['Teologia Básica', 'Teologia Média', 'Bacharel em Teologia', 'Curso de Discipulado', 'Escola de Líderes', 'Capacitação Ministerial', 'Outro (Digitar na impressão)']} />
                                    </div>
                                )}

                                {/* Formulário: Eventos */}
                                {selectedType === 'cert_evento' && (
                                    <div className="bg-emerald-50/30 p-6 rounded-3xl border border-emerald-100 space-y-4">
                                        <FormSelect label="Selecione o Participante" value={certData.membro_id} onChange={v => setCertData({...certData, membro_id: v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                                        <FormInput label="Nome do Evento / Congresso" value={certData.evento} onChange={v => setCertData({...certData, evento: v})} placeholder="Ex: UMAD - Congresso de Jovens 2026" required />
                                    </div>
                                )}

                                {/* Formulário: EBD */}
                                {selectedType === 'cert_ebd' && (
                                    <div className="bg-purple-50/30 p-6 rounded-3xl border border-purple-100 space-y-4">
                                        <FormSelect label="Selecione o Aluno" value={certData.membro_id} onChange={v => setCertData({...certData, membro_id: v})} options={db.membros.map(m=>({label: m.nome, value: m.id}))} />
                                        <FormSelect label="Selecione a Turma da EBD" value={certData.turma_id} onChange={v => setCertData({...certData, turma_id: v})} options={(db.ebd?.turmas || []).map(t=>({label: t.nome, value: t.id}))} />
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                                <Button onClick={handlePrint} variant="primary" className="w-full py-4 text-base shadow-xl shadow-indigo-500/20">
                                    <Printer size={20}/> Gerar Documento Oficial (PDF)
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default ModuleCertificados;
