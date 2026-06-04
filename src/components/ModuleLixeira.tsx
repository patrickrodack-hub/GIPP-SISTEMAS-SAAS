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
const ModuleLixeira = () => {
    const { db, setDoc, doc, deleteDoc, dbFirestore, appId, addToast, setConfirmDialog, logAction } = useContext(ChurchContext);
    const trashItems = useMemo(() => {
        let items = [];
        if (db.trash) {
            Object.keys(db.trash).forEach(key => {
                if (Array.isArray(db.trash[key])) {
                     db.trash[key].forEach(item => { items.push({ ...item, _collection_key: key, _type_label: key.replace(/_/g, ' ') }); });
                }
            });
        }
        return items;
    }, [db.trash]);

    const handleRestore = async (item) => { try { await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', item._collection_key, item.id), { deleted: false }, { merge: true }); logAction('RESTAURAÇÃO', `Restaurou item da lixeira: ${item.nome || item.titulo || item.descricao || 'Registro'}`, item._collection_key, item.id); addToast("Restaurado!", "success"); } catch (e) { addToast("Erro.", "error"); } };
    const handleHardDelete = (item) => { setConfirmDialog({ isOpen: true, title: "Exclusão Permanente", message: "Ação irreversível.", confirmText: "Apagar", onConfirm: async () => { try { await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', item._collection_key, item.id)); logAction('EXCLUSÃO_PERMANENTE', `Apagou definitivamente da lixeira: ${item.nome || item.titulo || item.descricao || 'Registro'}`, item._collection_key, item.id); addToast("Apagado.", "success"); } catch(e) { addToast("Erro.", "error"); } } }); };

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <h2 className="text-3xl font-black text-slate-800 text-gradient flex items-center gap-3"><Trash2 size={32} className="text-rose-500"/> Lixeira</h2>
            <div className="flex-1 overflow-hidden"><GenericTable title="" type="lixeira" data={trashItems} showDeleted={true} columns={[{header:'Tipo', key:'_type_label'}, {header:'Nome', key:'nome', render: i => i.nome || i.titulo || i.descricao || 'Item'}]} customActions={(item) => (<><button onClick={() => handleRestore(item)} className="p-2.5 text-emerald-500 rounded-xl" title="Restaurar"><RestoreIcon size={18}/></button><button onClick={() => handleHardDelete(item)} className="p-2.5 text-rose-500 rounded-xl" title="Apagar"><X size={18}/></button></>)} /></div>
        </div>
    );
};

// --- NOVO: MÓDULO ACESSOS PORTAL DO MEMBRO ---

export default ModuleLixeira;
