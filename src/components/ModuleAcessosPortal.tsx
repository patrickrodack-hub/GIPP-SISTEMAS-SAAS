import React, { useState, useEffect, useContext, createContext, useMemo, memo, useRef, isValidElement } from 'react';
import { createPortal } from 'react-dom';
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
const ModuleAcessosPortal = () => {
    const { db, setDoc, doc, dbFirestore, appId, addToast } = useContext(ChurchContext);
    const [selectedMember, setSelectedMember] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenChangePass = (member) => {
        setSelectedMember(member);
        setNewPassword('');
        setIsModalOpen(true);
    };

    const handleSavePassword = async () => {
        if (!newPassword.trim()) return addToast("A senha não pode estar vazia.", "warning");
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', selectedMember.id), { senha_portal: newPassword }, { merge: true });
            addToast(`Senha de ${selectedMember.nome} alterada com sucesso!`, "success");
            setIsModalOpen(false);
        } catch (e) {
            addToast("Erro ao alterar senha.", "error");
        }
    };

    const handleToggleAccess = async (member) => {
        const currentStatus = member.acesso_portal_liberado || (member.senha_portal && member.acesso_portal_liberado !== false) ? true : false;
        const newStatus = !currentStatus;
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', member.id), { acesso_portal_liberado: newStatus }, { merge: true });
            addToast(newStatus ? "Acesso liberado com sucesso!" : "Acesso bloqueado.", "success");
        } catch (e) {
            addToast("Erro ao atualizar status de acesso.", "error");
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-slate-800 rounded-2xl text-white shadow-sm"><Key size={28}/></div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Liberação de Acesso</h2>
                    <p className="text-sm text-slate-500 font-medium">Gestão de senhas e acessos ao Portal do Membro.</p>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <GenericTable
                    title="Membros e Acessos"
                    type="membro"
                    data={db.membros}
                    columns={[
                        {header: 'Nome do Membro', key: 'nome', render: m => <span className="font-bold text-slate-800">{m.nome}</span>},
                        {header: 'CPF', key: 'cpf'},
                        {header: 'Status do Acesso', key: 'acesso_portal_liberado', render: m => {
                            const isLiberado = m.acesso_portal_liberado || (m.senha_portal && m.acesso_portal_liberado !== false);
                            return isLiberado ? <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Liberado</span> : <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Bloqueado / Pendente</span>
                        }}
                    ]}
                    customActions={(item) => {
                        const isLiberado = item.acesso_portal_liberado || (item.senha_portal && item.acesso_portal_liberado !== false);
                        return (
                            <div className="flex gap-2">
                                <button onClick={() => handleToggleAccess(item)} className={`p-2.5 rounded-xl transition-all shadow-sm border ${isLiberado ? 'bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border-rose-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border-emerald-200'}`} title={isLiberado ? "Bloquear Acesso" : "Liberar Acesso"}>
                                    {isLiberado ? <Ban size={18}/> : <CheckCircle size={18}/>}
                                </button>
                                {isLiberado && (
                                    <button onClick={() => handleOpenChangePass(item)} className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-sm border border-indigo-200" title="Alterar Senha do Portal"><Key size={18}/></button>
                                )}
                            </div>
                        );
                    }}
                />
            </div>

            {isModalOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 z-[11000] flex items-center justify-center p-4 animate-entrance backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden p-8 border border-slate-200">
                        <h3 className="text-xl font-black text-slate-800 mb-2">Alterar Senha</h3>
                        <p className="text-sm text-slate-500 mb-6">Defina uma nova senha de acesso ao portal para o membro <strong className="text-indigo-600">{selectedMember?.nome}</strong>.</p>
                        
                        <FormInput label="Nova Senha do Portal" type="password" value={newPassword} onChange={setNewPassword} required />
                        
                        <div className="flex gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 border border-slate-200">Cancelar</Button>
                            <Button variant="primary" onClick={handleSavePassword} className="flex-1 shadow-indigo-500/30">Salvar Senha</Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

// --- NOVO: MÓDULO CREDENCIAL (EM LOTE) ---

export default ModuleAcessosPortal;
