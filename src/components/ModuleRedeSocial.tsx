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
const ModuleRedeSocial = () => {
    const { addToast } = useContext(ChurchContext);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    
    // --- ESTADOS DO EDITOR ---
    const [activeMenu, setActiveMenu] = useState('templates'); // 'templates', 'size', 'text', 'bg', 'layers'
    const [zoom, setZoom] = useState(0.4); // Zoom visual da área de trabalho
    const [selectedId, setSelectedId] = useState(null); // ID do elemento selecionado
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // --- ESTADO DO CANVAS (INCLUINDO TAMANHO) ---
    const [canvasState, setCanvasState] = useState({
        bgColor: '#0f172a',
        bgImage: null,
        overlayOpacity: 40, // Escurecimento do fundo para destacar o texto
        width: 1080,
        height: 1080
    });

    // --- TAMANHOS PREDEFINIDOS DE PRANCHETA ---
    const CANVAS_SIZES = [
        { id: 'sq', label: 'Post Feed (Quadrado)', w: 1080, h: 1080, icon: <Image size={20}/> },
        { id: 'por', label: 'Post Retrato (Vertical)', w: 1080, h: 1350, icon: <Smartphone size={20}/> },
        { id: 'sto', label: 'Stories / Status Whats', w: 1080, h: 1920, icon: <Smartphone size={20}/> },
        { id: 'pre', label: 'Tela de Projeção (16:9)', w: 1920, h: 1080, icon: <MonitorPlay size={20}/> },
        { id: 'a4', label: 'Folha A4 (Impressão)', w: 1240, h: 1754, icon: <FileText size={20}/> },
        { id: 'a4l', label: 'Folha A4 (Paisagem)', w: 1754, h: 1240, icon: <FileText size={20}/> }
    ];

    // --- ESTADO DOS ELEMENTOS (LAYERS) ---
    const [elements, setElements] = useState([
        { id: '1', type: 'text', text: 'CULTO DA\nFAMÍLIA', fontSize: 100, fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 40, left: 50, letterSpacing: 2, shadow: true },
        { id: '2', type: 'text', text: 'DOMINGO ÀS 18H', fontSize: 32, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#fbbf24', textAlign: 'center', top: 65, left: 50, letterSpacing: 8, shadow: false },
        { id: '3', type: 'text', text: 'ASSEMBLEIA DE DEUS', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#94a3b8', textAlign: 'center', top: 90, left: 50, letterSpacing: 6, shadow: false }
    ]);

    // --- TEMPLATES PREMIUM FOCADOS NA ASSEMBLEIA DE DEUS ---
    const MOCK_TEMPLATES = [
        {
            id: 'ad1', name: 'Santa Ceia do Senhor',
            canvas: { bgColor: '#450a0a', bgImage: null, overlayOpacity: 60, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'SANTA CEIA', fontSize: 110, fontFamily: 'Cinzel', fontWeight: 700, color: '#ffffff', textAlign: 'center', top: 35, left: 50, letterSpacing: 4, shadow: true },
                { id: '2', type: 'text', text: '"Fazei isto em memória de mim"', fontSize: 28, fontFamily: 'Great Vibes', fontWeight: 400, color: '#fca5a5', textAlign: 'center', top: 55, left: 50, letterSpacing: 2, shadow: false },
                { id: '3', type: 'text', text: 'PRÓXIMO DOMINGO ÀS 18H', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#ffffff', textAlign: 'center', top: 80, left: 50, letterSpacing: 6, shadow: false }
            ]
        },
        {
            id: 'ad2', name: 'Círculo de Oração',
            canvas: { bgColor: '#4c1d95', bgImage: null, overlayOpacity: 50, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'CÍRCULO DE', fontSize: 40, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#c4b5fd', textAlign: 'center', top: 35, left: 50, letterSpacing: 8, shadow: true },
                { id: '2', type: 'text', text: 'ORAÇÃO', fontSize: 120, fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 50, left: 50, letterSpacing: 0, shadow: true },
                { id: '3', type: 'text', text: 'TODA TERÇA-FEIRA ÀS 14H', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#ffffff', textAlign: 'center', top: 75, left: 50, letterSpacing: 4, shadow: false }
            ]
        },
        {
            id: 'ad3', name: 'Culto de Doutrina',
            canvas: { bgColor: '#0f172a', bgImage: null, overlayOpacity: 40, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'CULTO DE\nDOUTRINA', fontSize: 90, fontFamily: 'Cinzel', fontWeight: 700, color: '#ffffff', textAlign: 'left', top: 40, left: 15, letterSpacing: 2, shadow: true },
                { id: '2', type: 'text', text: 'APRENDENDO A PALAVRA', fontSize: 22, fontFamily: 'Plus Jakarta Sans', fontWeight: 500, color: '#fbbf24', textAlign: 'left', top: 65, left: 15, letterSpacing: 4, shadow: false },
                { id: '3', type: 'text', text: 'QUINTA-FEIRA ÀS 19H30', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#94a3b8', textAlign: 'left', top: 85, left: 15, letterSpacing: 2, shadow: false }
            ]
        },
        {
            id: 'ad4', name: 'Culto de Missões',
            canvas: { bgColor: '#14532d', bgImage: null, overlayOpacity: 50, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'CULTO DE', fontSize: 36, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#6ee7b7', textAlign: 'center', top: 30, left: 50, letterSpacing: 10, shadow: true },
                { id: '2', type: 'text', text: 'MISSÕES', fontSize: 130, fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 45, left: 50, letterSpacing: -2, shadow: true },
                { id: '3', type: 'text', text: '"Ide por todo o mundo e pregai o evangelho"', fontSize: 22, fontFamily: 'Playfair Display', fontWeight: 400, color: '#d1fae5', textAlign: 'center', top: 65, left: 50, letterSpacing: 1, shadow: false },
                { id: '4', type: 'text', text: '2º DOMINGO DO MÊS', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#ffffff', textAlign: 'center', top: 85, left: 50, letterSpacing: 4, shadow: false }
            ]
        },
        {
            id: 'ad5', name: 'Escola Bíblica (EBD)',
            canvas: { bgColor: '#1e3a8a', bgImage: null, overlayOpacity: 30, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'EBD', fontSize: 150, fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 40, left: 50, letterSpacing: -5, shadow: true },
                { id: '2', type: 'text', text: 'ESCOLA BÍBLICA DOMINICAL', fontSize: 24, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#bfdbfe', textAlign: 'center', top: 60, left: 50, letterSpacing: 4, shadow: false },
                { id: '3', type: 'text', text: 'DOMINGO ÀS 09H DA MANHÃ', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#ffffff', textAlign: 'center', top: 80, left: 50, letterSpacing: 2, shadow: false }
            ]
        },
        {
            id: 'ad6', name: 'Congresso de Jovens',
            canvas: { bgColor: '#831843', bgImage: null, overlayOpacity: 40, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'CONGRESSO', fontSize: 40, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#fbcfe8', textAlign: 'left', top: 30, left: 15, letterSpacing: 8, shadow: true },
                { id: '2', type: 'text', text: 'JOVENS', fontSize: 120, fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', textAlign: 'left', top: 45, left: 15, letterSpacing: -2, shadow: true },
                { id: '3', type: 'text', text: 'UMAD', fontSize: 140, fontFamily: 'Outfit', fontWeight: 900, color: '#f472b6', textAlign: 'left', top: 65, left: 15, letterSpacing: -4, shadow: true },
                { id: '4', type: 'text', text: 'SÁBADO E DOMINGO', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#ffffff', textAlign: 'left', top: 85, left: 15, letterSpacing: 4, shadow: false }
            ]
        },
        {
            id: 'ad7', name: 'Vigília de Poder',
            canvas: { bgColor: '#000000', bgImage: null, overlayOpacity: 60, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'VIGÍLIA', fontSize: 130, fontFamily: 'Cinzel', fontWeight: 700, color: '#ffffff', textAlign: 'center', top: 40, left: 50, letterSpacing: 5, shadow: true },
                { id: '2', type: 'text', text: 'FOGO & GLÓRIA', fontSize: 36, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#fbbf24', textAlign: 'center', top: 60, left: 50, letterSpacing: 10, shadow: true },
                { id: '3', type: 'text', text: 'A PARTIR DAS 23H', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#94a3b8', textAlign: 'center', top: 85, left: 50, letterSpacing: 4, shadow: false }
            ]
        },
        {
            id: 'ad8', name: 'Culto da Família',
            canvas: { bgColor: '#0f766e', bgImage: null, overlayOpacity: 40, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'CULTO DA', fontSize: 40, fontFamily: 'Playfair Display', fontWeight: 700, color: '#a7f3d0', textAlign: 'center', top: 35, left: 50, letterSpacing: 4, shadow: true },
                { id: '2', type: 'text', text: 'FAMÍLIA', fontSize: 120, fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 50, left: 50, letterSpacing: -2, shadow: true },
                { id: '3', type: 'text', text: 'TRAGA SEU LAR PARA O ALTAR', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#ffffff', textAlign: 'center', top: 75, left: 50, letterSpacing: 2, shadow: false }
            ]
        },
        {
            id: 'ad9', name: 'Consagração de Obreiros',
            canvas: { bgColor: '#1e293b', bgImage: null, overlayOpacity: 50, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'CONSAGRAÇÃO', fontSize: 90, fontFamily: 'Cinzel', fontWeight: 700, color: '#fbbf24', textAlign: 'center', top: 40, left: 50, letterSpacing: 6, shadow: true },
                { id: '2', type: 'text', text: 'DE OBREIROS', fontSize: 50, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#ffffff', textAlign: 'center', top: 55, left: 50, letterSpacing: 10, shadow: false },
                { id: '3', type: 'text', text: 'SÁBADO ÀS 19H', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#cbd5e1', textAlign: 'center', top: 75, left: 50, letterSpacing: 4, shadow: false }
            ]
        },
        {
            id: 'ad10', name: 'Culto de Senhoras (UFAD)',
            canvas: { bgColor: '#9d174d', bgImage: null, overlayOpacity: 40, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'CULTO DE', fontSize: 40, fontFamily: 'Playfair Display', fontWeight: 700, color: '#fbcfe8', textAlign: 'center', top: 30, left: 50, letterSpacing: 8, shadow: true },
                { id: '2', type: 'text', text: 'MULHERES', fontSize: 120, fontFamily: 'Great Vibes', fontWeight: 400, color: '#ffffff', textAlign: 'center', top: 50, left: 50, letterSpacing: 2, shadow: true },
                { id: '3', type: 'text', text: 'CÍRCULO DE ORAÇÃO', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#ffffff', textAlign: 'center', top: 75, left: 50, letterSpacing: 4, shadow: false }
            ]
        },
        {
            id: 'ad11', name: 'Culto Infantil / Kids',
            canvas: { bgColor: '#0ea5e9', bgImage: null, overlayOpacity: 20, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'CULTO', fontSize: 60, fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 35, left: 50, letterSpacing: 4, shadow: true },
                { id: '2', type: 'text', text: 'KIDS', fontSize: 160, fontFamily: 'Outfit', fontWeight: 900, color: '#fde047', textAlign: 'center', top: 55, left: 50, letterSpacing: -2, shadow: true },
                { id: '3', type: 'text', text: 'DOMINGO MANHÃ', fontSize: 24, fontFamily: 'Plus Jakarta Sans', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 80, left: 50, letterSpacing: 2, shadow: false }
            ]
        },
        {
            id: 'ad12', name: 'Culto de Ação de Graças',
            canvas: { bgColor: '#b45309', bgImage: null, overlayOpacity: 50, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'AÇÃO DE\nGRAÇAS', fontSize: 110, fontFamily: 'Playfair Display', fontWeight: 700, color: '#fef3c7', textAlign: 'center', top: 40, left: 50, letterSpacing: 2, shadow: true },
                { id: '2', type: 'text', text: 'RENDEI GRAÇAS AO SENHOR', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#ffffff', textAlign: 'center', top: 65, left: 50, letterSpacing: 6, shadow: false }
            ]
        },
        {
            id: 'ad13', name: 'Festividade do Coral',
            canvas: { bgColor: '#4338ca', bgImage: null, overlayOpacity: 40, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'FESTIVIDADE', fontSize: 50, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#e0e7ff', textAlign: 'center', top: 35, left: 50, letterSpacing: 10, shadow: true },
                { id: '2', type: 'text', text: 'DO CORAL', fontSize: 100, fontFamily: 'Cinzel', fontWeight: 700, color: '#ffffff', textAlign: 'center', top: 55, left: 50, letterSpacing: 4, shadow: true },
                { id: '3', type: 'text', text: 'LOUVANDO EM ADORAÇÃO', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: 500, color: '#a5b4fc', textAlign: 'center', top: 75, left: 50, letterSpacing: 6, shadow: false }
            ]
        },
        {
            id: 'ad14', name: 'Culto de Libertação',
            canvas: { bgColor: '#7f1d1d', bgImage: null, overlayOpacity: 60, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'CULTO DE', fontSize: 40, fontFamily: 'Outfit', fontWeight: 900, color: '#fca5a5', textAlign: 'left', top: 30, left: 15, letterSpacing: 8, shadow: true },
                { id: '2', type: 'text', text: 'LIBERTAÇÃO', fontSize: 110, fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', textAlign: 'left', top: 45, left: 15, letterSpacing: -2, shadow: true },
                { id: '3', type: 'text', text: 'QUEBRANDO CADEIAS', fontSize: 24, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#fecaca', textAlign: 'left', top: 65, left: 15, letterSpacing: 4, shadow: false },
                { id: '4', type: 'text', text: 'SEXTA-FEIRA ÀS 19:30', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#ffffff', textAlign: 'left', top: 85, left: 15, letterSpacing: 2, shadow: false }
            ]
        },
        {
            id: 'ad15', name: 'Batismo nas Águas',
            canvas: { bgColor: '#0369a1', bgImage: null, overlayOpacity: 40, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'BATISMO', fontSize: 120, fontFamily: 'Cinzel', fontWeight: 700, color: '#ffffff', textAlign: 'center', top: 40, left: 50, letterSpacing: 4, shadow: true },
                { id: '2', type: 'text', text: 'NAS ÁGUAS', fontSize: 40, fontFamily: 'Great Vibes', fontWeight: 400, color: '#bae6fd', textAlign: 'center', top: 58, left: 50, letterSpacing: 2, shadow: false },
                { id: '3', type: 'text', text: 'NOVA CRIATURA SOU', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#ffffff', textAlign: 'center', top: 80, left: 50, letterSpacing: 8, shadow: false }
            ]
        },
        {
            id: 'ad16', name: 'Cruzada Evangelística',
            canvas: { bgColor: '#064e3b', bgImage: null, overlayOpacity: 50, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'CRUZADA', fontSize: 130, fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 45, left: 50, letterSpacing: -2, shadow: true },
                { id: '2', type: 'text', text: 'EVANGELÍSTICA', fontSize: 36, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#34d399', textAlign: 'center', top: 65, left: 50, letterSpacing: 10, shadow: true },
                { id: '3', type: 'text', text: 'JESUS SALVA E CURA', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#ffffff', textAlign: 'center', top: 85, left: 50, letterSpacing: 4, shadow: false }
            ]
        },
        {
            id: 'ad17', name: 'Conferência Profética',
            canvas: { bgColor: '#312e81', bgImage: null, overlayOpacity: 50, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'CONFERÊNCIA', fontSize: 40, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#c7d2fe', textAlign: 'left', top: 35, left: 15, letterSpacing: 10, shadow: true },
                { id: '2', type: 'text', text: 'PROFÉTICA', fontSize: 100, fontFamily: 'Cinzel', fontWeight: 700, color: '#ffffff', textAlign: 'left', top: 50, left: 15, letterSpacing: 2, shadow: true },
                { id: '3', type: 'text', text: 'UM NOVO TEMPO', fontSize: 24, fontFamily: 'Great Vibes', fontWeight: 400, color: '#a5b4fc', textAlign: 'left', top: 70, left: 15, letterSpacing: 2, shadow: false }
            ]
        },
        {
            id: 'ad18', name: 'Jantar de Casais',
            canvas: { bgColor: '#be123c', bgImage: null, overlayOpacity: 40, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'Jantar de', fontSize: 60, fontFamily: 'Great Vibes', fontWeight: 400, color: '#fecdd3', textAlign: 'center', top: 35, left: 50, letterSpacing: 2, shadow: true },
                { id: '2', type: 'text', text: 'CASAIS', fontSize: 120, fontFamily: 'Playfair Display', fontWeight: 700, color: '#ffffff', textAlign: 'center', top: 55, left: 50, letterSpacing: 4, shadow: true },
                { id: '3', type: 'text', text: 'O AMOR TUDO SOFRE', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#ffffff', textAlign: 'center', top: 80, left: 50, letterSpacing: 6, shadow: false }
            ]
        },
        {
            id: 'ad19', name: 'Congresso de Varões',
            canvas: { bgColor: '#0f172a', bgImage: null, overlayOpacity: 60, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'CONGRESSO', fontSize: 50, fontFamily: 'Plus Jakarta Sans', fontWeight: 900, color: '#94a3b8', textAlign: 'center', top: 35, left: 50, letterSpacing: 8, shadow: true },
                { id: '2', type: 'text', text: 'DE VARÕES', fontSize: 110, fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 55, left: 50, letterSpacing: -2, shadow: true },
                { id: '3', type: 'text', text: 'HOMENS DE VALOR', fontSize: 22, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#fbbf24', textAlign: 'center', top: 75, left: 50, letterSpacing: 6, shadow: false }
            ]
        },
        {
            id: 'ad20', name: 'Seminário Teológico',
            canvas: { bgColor: '#1e3a8a', bgImage: null, overlayOpacity: 50, width: 1080, height: 1080 },
            elements: [
                { id: '1', type: 'text', text: 'SEMINÁRIO\nTEOLÓGICO', fontSize: 90, fontFamily: 'Cinzel', fontWeight: 700, color: '#ffffff', textAlign: 'left', top: 40, left: 15, letterSpacing: 2, shadow: true },
                { id: '2', type: 'text', text: 'CONHECENDO AS ESCRITURAS', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#bfdbfe', textAlign: 'left', top: 65, left: 15, letterSpacing: 6, shadow: false },
                { id: '3', type: 'text', text: 'SÁBADO ÀS 14H', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#ffffff', textAlign: 'left', top: 85, left: 15, letterSpacing: 2, shadow: false }
            ]
        }
    ];

    // Função inteligente que calcula e aplica o zoom perfeito para caber no ecrã
    const autoFitZoom = (w, h) => {
        if (!containerRef.current) return;
        const cWidth = containerRef.current.clientWidth - 80; // 40px de margem lateral
        const cHeight = containerRef.current.clientHeight - 80;
        if (cWidth <= 0 || cHeight <= 0) return;
        
        let newZoom = Math.min(cWidth / w, cHeight / h);
        newZoom = Math.max(0.1, Math.min(1.5, Number(newZoom.toFixed(2)))); // Limitar entre 10% e 150%
        setZoom(newZoom);
    };

    useEffect(() => { 
        // Ajuste de zoom responsivo inicial e ao redimensionar a janela
        const handleResize = () => autoFitZoom(canvasState.width, canvasState.height);
        window.addEventListener('resize', handleResize);
        setTimeout(handleResize, 50); // Aciona o cálculo logo após abrir a tela
        return () => window.removeEventListener('resize', handleResize);
    }, [canvasState.width, canvasState.height]);

    // --- FUNÇÕES DE DRAG & DROP ---
    const startDrag = (e, id) => {
        e.stopPropagation();
        setSelectedId(id);
        setIsDragging(true);
        const el = elements.find(el => el.id === id);
        if (el && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            // Calcular posição do rato em percentagem em relação ao canvas
            const xPct = ((e.clientX - rect.left) / rect.width) * 100;
            const yPct = ((e.clientY - rect.top) / rect.height) * 100;
            setDragOffset({ x: xPct - el.left, y: yPct - el.top });
        }
    };

    const handleDrag = (e) => {
        if (!isDragging || !selectedId || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        
        // Calcular nova posição baseada no movimento (restringindo entre 0 e 100%)
        let newLeft = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
        let newTop = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y;
        
        // Opcional: Limitar limites para não fugir do quadro (0 a 100)
        newLeft = Math.max(0, Math.min(100, newLeft));
        newTop = Math.max(0, Math.min(100, newTop));

        setElements(elements.map(el => el.id === selectedId ? { ...el, left: newLeft, top: newTop } : el));
    };

    const stopDrag = () => {
        setIsDragging(false);
    };

    // --- FUNÇÕES DE EDIÇÃO ---
    const updateElement = (id, updates) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const addTextElement = (type) => {
        const id = Date.now().toString();
        let newEl: any = { id, type: 'text', color: '#ffffff', textAlign: 'center', left: 50, letterSpacing: 2, shadow: false };
        
        if (type === 'heading') newEl = { ...newEl, text: 'NOVO TÍTULO', fontSize: 80, fontFamily: 'Outfit', fontWeight: 900, top: 40 };
        if (type === 'subheading') newEl = { ...newEl, text: 'Novo Subtítulo', fontSize: 32, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, top: 60 };
        if (type === 'body') newEl = { ...newEl, text: 'Adicione um texto descritivo aqui', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 500, top: 80 };

        setElements([...elements, newEl]);
        setSelectedId(id);
        addToast("Nova camada de texto adicionada.", "info");
    };

    const duplicateElement = (id) => {
        const el = elements.find(e => e.id === id);
        if(el) {
            const newEl = { ...el, id: Date.now().toString(), top: el.top + 5, left: el.left + 5 };
            setElements([...elements, newEl]);
            setSelectedId(newEl.id);
        }
    };

    const removeElement = (id) => {
        setElements(elements.filter(el => el.id !== id));
        if (selectedId === id) setSelectedId(null);
        addToast("Camada removida.", "success");
    };

    const handleBgUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setCanvasState(prev => ({ ...prev, bgImage: reader.result }));
                addToast("Fundo atualizado!", "success");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExport = async () => {
        setSelectedId(null); // Remove seleção antes de tirar o print
        addToast("A renderizar a sua arte em alta resolução...", "info");
        
        try {
            await new Promise(r => setTimeout(r, 500)); // Aguardar remover seleção
            
            const dataUrl = await toPng(canvasRef.current, {
                pixelRatio: 2, // High Quality
                backgroundColor: canvasState.bgColor,
                style: { transform: 'scale(1)', transformOrigin: 'top left' }
            });
            
            const link = document.createElement('a');
            link.download = `Arte_GIPP_${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            addToast("Download concluído com sucesso!", "success");
        } catch (error) {
            console.error(error);
            addToast("Erro ao exportar a arte.", "error");
        }
    };

    // --- NOVA FUNÇÃO: PARTILHA DIRETA WHATSAPP ---
    const handleShareWhatsApp = async () => {
        setSelectedId(null);
        addToast("A preparar a sua arte para o WhatsApp...", "info");
        
        try {
            await new Promise(r => setTimeout(r, 500));
            
            const blob = await toBlob(canvasRef.current, {
                pixelRatio: 2, 
                backgroundColor: canvasState.bgColor,
                style: { transform: 'scale(1)', transformOrigin: 'top left' }
            });
            
            if (!blob) return addToast("Erro ao gerar imagem.", "error");
            
            const file = new File([blob], `Arte_GIPP_${Date.now()}.png`, { type: 'image/png' });
                
                // Verifica se a API de Share Nativa é suportada (Mobile e alguns Desktops)
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Arte GIPP',
                            text: 'Arte oficial gerada pelo Estúdio GIPP'
                        });
                        addToast("Pronto para partilhar!", "success");
                    } catch (e) {
                        if (e.name !== 'AbortError') {
                            addToast("Cancelado. A transferir ficheiro em alternativa...", "warning");
                            handleExport(); // Fallback se der erro
                        }
                    }
                } else {
                    // Fallback para dispositivos que não suportam (Windows/PC Antigo)
                    addToast("Partilha direta não suportada no seu navegador. A transferir a imagem...", "warning");
                    handleExport();
                }
        } catch (error) {
            console.error(error);
            addToast("Erro ao processar a arte.", "error");
        }
    };

    const selectedElement = elements.find(el => el.id === selectedId);

    return (
        <div className="h-[80vh] min-h-[600px] flex flex-col animate-entrance bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden relative">
            {/* --- HEADER SUPERIOR --- */}
            <div className="h-16 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-pink-500 to-purple-600 p-2 rounded-xl text-white shadow-sm"><Palette size={20}/></div>
                    <h2 className="font-black text-slate-800 text-lg tracking-tight">Estúdio GIPP</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-500">
                        <button onClick={()=>setZoom(Math.max(0.1, zoom - 0.1))} className="hover:text-indigo-600"><Minus size={14} className="inline"/></button>
                        <span className="w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
                        <button onClick={()=>setZoom(Math.min(1.5, zoom + 0.1))} className="hover:text-indigo-600"><Plus size={14} className="inline"/></button>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleExport} variant="secondary" className="py-2 text-xs shadow-sm bg-white"><Download size={16}/> Baixar</Button>
                        <Button onClick={handleShareWhatsApp} variant="success" className="py-2 text-xs shadow-md hidden md:flex"><MessageCircle size={16}/> WhatsApp</Button>
                    </div>
                </div>
            </div>

            {/* --- ÁREA PRINCIPAL --- */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* 1. BARRA DE FERRAMENTAS ESQUERDA (ICONES) */}
                <div className="w-20 bg-slate-900 flex flex-col items-center py-6 gap-2 shrink-0 z-20">
                    {[
                        { id: 'templates', icon: LayoutTemplate, label: 'Modelos' },
                        { id: 'size', icon: Maximize, label: 'Tamanho' },
                        { id: 'text', icon: TypeIcon, label: 'Textos' },
                        { id: 'bg', icon: ImageIcon, label: 'Fundo' },
                        { id: 'layers', icon: Layers, label: 'Camadas' }
                    ].map(menu => (
                        <button 
                            key={menu.id} 
                            onClick={() => { setActiveMenu(menu.id); setSelectedId(null); }}
                            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${activeMenu === menu.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <menu.icon size={22} className="mb-1"/>
                            <span className="text-[9px] font-bold uppercase tracking-wider">{menu.label}</span>
                        </button>
                    ))}
                </div>

                {/* 2. PAINEL DE FERRAMENTAS ESQUERDA (DETALHES) */}
                <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 z-10 overflow-y-auto custom-scrollbar">
                    <div className="p-5 border-b border-slate-200">
                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">
                            {activeMenu === 'templates' && 'Modelos Prontos'}
                            {activeMenu === 'size' && 'Proporção & Tamanho'}
                            {activeMenu === 'text' && 'Adicionar Textos'}
                            {activeMenu === 'bg' && 'Cenário e Fundo'}
                            {activeMenu === 'layers' && 'Camadas e Ordem'}
                        </h3>
                    </div>
                    <div className="p-5">
                        {activeMenu === 'templates' && (
                            <div className="space-y-4">
                                {MOCK_TEMPLATES.map(t => (
                                    <button 
                                        key={t.id} 
                                        onClick={() => {
                                            setCanvasState(t.canvas);
                                            // Criar cópia profunda dos elementos
                                            setElements(JSON.parse(JSON.stringify(t.elements)));
                                            setSelectedId(null);
                                            autoFitZoom(t.canvas.width || 1080, t.canvas.height || 1080);
                                            addToast(`Tema ${t.name} carregado!`, "success");
                                        }}
                                        className="w-full aspect-[4/3] rounded-2xl border-2 border-transparent hover:border-indigo-500 shadow-sm overflow-hidden flex flex-col relative group transition-all"
                                        style={{ backgroundColor: t.canvas.bgColor }}
                                    >
                                        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-indigo-900/60 backdrop-blur-sm transition-all z-10">
                                            <span className="text-white font-bold text-xs uppercase tracking-widest border border-white/50 px-3 py-1.5 rounded-full">Aplicar Arte</span>
                                        </div>
                                        <div className="mt-auto w-full bg-black/60 p-2 text-center text-[10px] font-bold text-white uppercase tracking-widest relative z-0">
                                            {t.name}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeMenu === 'size' && (
                            <div className="space-y-3">
                                <p className="text-xs text-slate-500 mb-4 leading-relaxed font-medium">Defina a proporção da sua folha ou tela. A área de criação será automaticamente ajustada.</p>
                                {CANVAS_SIZES.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setCanvasState(prev => ({ ...prev, width: s.w, height: s.h }));
                                            autoFitZoom(s.w, s.h);
                                            addToast(`Tamanho ajustado para ${s.label}`, "success");
                                        }}
                                        className={`w-full p-4 flex items-center justify-between rounded-2xl border transition-all shadow-sm ${canvasState.width === s.w && canvasState.height === s.h ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700 hover:shadow-md'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`${canvasState.width === s.w && canvasState.height === s.h ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                {s.icon}
                                            </div>
                                            <div className="text-left">
                                                <span className="block font-bold text-xs leading-none mb-1">{s.label}</span>
                                                <span className="text-[10px] font-mono text-slate-400 font-bold">{s.w} x {s.h} px</span>
                                            </div>
                                        </div>
                                        {canvasState.width === s.w && canvasState.height === s.h && <CheckCircle size={16} className="text-indigo-600"/>}
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeMenu === 'text' && (
                            <div className="space-y-3">
                                <button onClick={() => addTextElement('heading')} className="w-full p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-all text-left">
                                    <span className="block text-2xl font-black text-slate-800 mb-1 leading-none">Adicionar Título</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">Fonte grande de destaque</span>
                                </button>
                                <button onClick={() => addTextElement('subheading')} className="w-full p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-all text-left">
                                    <span className="block text-lg font-bold text-slate-700 mb-1 leading-none">Adicionar Subtítulo</span>
                                </button>
                                <button onClick={() => addTextElement('body')} className="w-full p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-all text-left">
                                    <span className="block text-sm font-medium text-slate-600 mb-1 leading-none">Adicionar texto pequeno</span>
                                </button>
                            </div>
                        )}

                        {activeMenu === 'bg' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Upload de Imagem</label>
                                    <label className="w-full flex flex-col items-center justify-center gap-2 bg-white border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-500 py-6 rounded-2xl cursor-pointer transition-colors font-bold text-xs">
                                        <ImagePlus size={24}/>
                                        <span>Carregar Fundo</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload}/>
                                    </label>
                                    {canvasState.bgImage && (
                                        <button onClick={() => setCanvasState({...canvasState, bgImage: null})} className="w-full mt-2 text-[10px] font-bold text-rose-500 uppercase py-2 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors">
                                            Remover Imagem
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Cor de Fundo Base</label>
                                    <input type="color" value={canvasState.bgColor} onChange={(e) => setCanvasState({...canvasState, bgColor: e.target.value})} className="w-full h-12 rounded-xl cursor-pointer border-0 p-0" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block flex items-center justify-between">
                                        <span>Filtro Escuro (Overlay)</span>
                                        <span className="text-indigo-600">{canvasState.overlayOpacity}%</span>
                                    </label>
                                    <input type="range" min="0" max="90" value={canvasState.overlayOpacity} onChange={(e) => setCanvasState({...canvasState, overlayOpacity: parseInt(e.target.value)})} className="w-full accent-indigo-600" />
                                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">Aumente para escurecer a foto e destacar as letras claras.</p>
                                </div>
                            </div>
                        )}

                        {activeMenu === 'layers' && (
                            <div className="space-y-2">
                                {elements.map((el, index) => (
                                    <div key={el.id} onClick={() => setSelectedId(el.id)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedId === el.id ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <TypeIcon size={14} className="text-slate-400 shrink-0"/>
                                            <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{el.text.replace(/\n/g, ' ') || 'Texto Vazio'}</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="text-rose-400 hover:text-rose-600 shrink-0 p-1"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                                {elements.length === 0 && <p className="text-xs text-slate-400 text-center py-4 italic">Nenhuma camada adicionada.</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. O CANVAS CENTRAL (ÁREA DE EDIÇÃO) */}
                <div 
                    ref={containerRef}
                    className="flex-1 bg-slate-200/50 relative overflow-auto flex cursor-crosshair pattern-grid-lg text-slate-900/5 custom-scrollbar p-10"
                    onMouseMove={handleDrag}
                    onMouseUp={stopDrag}
                    onMouseLeave={stopDrag}
                    onClick={(e) => {
                        // Desseleciona se clicar fora dos elementos no próprio container de fundo
                        if (e.target === e.currentTarget) setSelectedId(null);
                    }}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-20 pointer-events-none"></div>
                    
                    {/* WRAPPER DO ZOOM & DINAMISMO DE TAMANHO (Reserva o espaço físico exato na tela) */}
                    <div 
                        className="relative transition-all ease-out shrink-0 m-auto shadow-[0_20px_50px_rgba(0,0,0,0.2)] ring-1 ring-slate-900/10"
                        style={{ 
                            width: canvasState.width * zoom, 
                            height: canvasState.height * zoom 
                        }}
                    >
                        {/* Este Wrapper aplica a redução em escala sem afetar o tamanho original dos pixels */}
                        <div 
                            style={{ 
                                width: `${canvasState.width}px`, 
                                height: `${canvasState.height}px`, 
                                transform: `scale(${zoom})`, 
                                transformOrigin: 'top left' 
                            }}
                        >
                            {/* A Referência Real para o HTML2Canvas (Onde a arte é criada com a resolução alta intacta) */}
                            <div 
                                ref={canvasRef} 
                                className="w-full h-full relative overflow-hidden bg-white" 
                                onClick={(e) => {
                                    if (e.target === e.currentTarget) setSelectedId(null);
                                }}
                                style={{
                                    backgroundColor: canvasState.bgColor,
                                    backgroundImage: canvasState.bgImage ? `url(${canvasState.bgImage})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                
                                {/* OVERLAY ESCURO PARA DESTAQUE */}
                                <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: canvasState.overlayOpacity / 100 }}></div>

                                {/* ELEMENTOS ARRASTÁVEIS */}
                                {elements.map(el => (
                                    <div
                                        key={el.id}
                                        onMouseDown={(e) => startDrag(e, el.id)}
                                        className={`absolute whitespace-pre-wrap cursor-move group ${selectedId === el.id ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-black/20' : 'hover:ring-1 hover:ring-white/50'}`}
                                        style={{
                                            top: `${el.top}%`,
                                            left: `${el.left}%`,
                                            transform: 'translate(-50%, -50%)', // O ponto de ancoragem é o centro do texto
                                            fontSize: `${el.fontSize}px`,
                                            fontFamily: el.fontFamily,
                                            fontWeight: el.fontWeight,
                                            color: el.color,
                                            textAlign: el.textAlign,
                                            letterSpacing: `${el.letterSpacing}px`,
                                            textShadow: el.shadow ? '0px 10px 30px rgba(0,0,0,0.8), 0px 4px 10px rgba(0,0,0,0.5)' : 'none',
                                            width: 'max-content',
                                            maxWidth: '90%', // Evita que texto gigantesco saia da área útil drasticamente
                                            lineHeight: '1.1'
                                        }}
                                    >
                                        {el.text}
                                        
                                        {/* ALÇAS DE CONTROLE (Só visíveis quando selecionado) */}
                                        {selectedId === el.id && (
                                            <>
                                                <div className="absolute -top-3 -left-3 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-md"></div>
                                                <div className="absolute -bottom-3 -right-3 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-md"></div>
                                                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); duplicateElement(el.id); }} className="bg-white text-indigo-600 p-2 rounded-full shadow-lg hover:scale-110 transition-transform" title="Duplicar"><Copy size={16}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="bg-white text-rose-600 p-2 rounded-full shadow-lg hover:scale-110 transition-transform" title="Apagar"><Trash2 size={16}/></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. PAINEL DE PROPRIEDADES DIREITA */}
                <div className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 z-10 overflow-y-auto custom-scrollbar">
                    {selectedElement ? (
                        <div className="p-6 space-y-6">
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm border-b border-slate-200 pb-4 mb-2 flex items-center gap-2"><Settings size={16} className="text-indigo-500"/> Editar Texto</h3>
                            
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Conteúdo</label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[100px]"
                                    value={selectedElement.text}
                                    onChange={(e) => updateElement(selectedId, { text: (e.target.value || "").toUpperCase() })}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Fonte</label>
                                <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                    value={selectedElement.fontFamily}
                                    onChange={(e) => updateElement(selectedId, { fontFamily: (e.target.value || "").toUpperCase() })}
                                >
                                    <option value="Outfit">Outfit (Moderna/Grosa)</option>
                                    <option value="Plus Jakarta Sans">Jakarta (Elegante/Lisa)</option>
                                    <option value="Playfair Display">Playfair (Serif/Clássica)</option>
                                    <option value="Cinzel">Cinzel (Cinemática)</option>
                                    <option value="Great Vibes">Great Vibes (Manuscrita)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Cor</label>
                                    <input 
                                        type="color" 
                                        value={selectedElement.color} 
                                        onChange={(e) => updateElement(selectedId, { color: (e.target.value || "").toUpperCase() })} 
                                        className="w-full h-10 rounded-xl cursor-pointer border-0 p-0" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Sombra</label>
                                    <button 
                                        onClick={() => updateElement(selectedId, { shadow: !selectedElement.shadow })}
                                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors border ${selectedElement.shadow ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        {selectedElement.shadow ? 'Ativada' : 'Desativada'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                                    <span>Tamanho</span> <span className="text-indigo-600">{selectedElement.fontSize}px</span>
                                </label>
                                <input type="range" min="10" max="300" value={selectedElement.fontSize} onChange={(e) => updateElement(selectedId, { fontSize: parseInt(e.target.value) })} className="w-full accent-indigo-600" />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                                    <span>Espaçamento</span> <span className="text-indigo-600">{selectedElement.letterSpacing}px</span>
                                </label>
                                <input type="range" min="-10" max="50" value={selectedElement.letterSpacing} onChange={(e) => updateElement(selectedId, { letterSpacing: parseInt(e.target.value) })} className="w-full accent-indigo-600" />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Alinhamento</label>
                                <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-200">
                                    {['left', 'center', 'right'].map(align => (
                                        <button 
                                            key={align} 
                                            onClick={() => updateElement(selectedId, { textAlign: align })} 
                                            className={`flex-1 py-2 rounded-lg flex justify-center transition-colors ${selectedElement.textAlign === align ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {align === 'left' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="15" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>}
                                            {align === 'center' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>}
                                            {align === 'right' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="9" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-100 flex gap-2">
                                <Button onClick={() => setSelectedId(null)} variant="ghost" className="flex-1 border border-slate-200">Desmarcar</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 flex flex-col items-center justify-center text-center h-full opacity-60">
                            <MousePointerClick size={48} className="mb-4 text-indigo-300"/>
                            <h4 className="font-bold text-slate-700">Nada Selecionado</h4>
                            <p className="text-xs text-slate-500 mt-2">Clique em um texto no quadro ao lado para editar suas propriedades, ou use o menu da esquerda para adicionar novos itens.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export const GALLERY_WALLPAPERS = [
    { name: 'Sem Papel de Parede', value: null, thumb: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=10&w=200&auto=format&fit=crop' },
    { name: 'Montanhas Majestosas', value: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1400&auto=format&fit=crop', thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=40&w=300&auto=format&fit=crop' },
    { name: 'Noite Estrelada', value: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1400&auto=format&fit=crop', thumb: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=40&w=300&auto=format&fit=crop' },
    { name: 'Igreja do Monte', value: 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?q=80&w=1400&auto=format&fit=crop', thumb: 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?q=40&w=300&auto=format&fit=crop' },
    { name: 'Abstrato Geométrico', value: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1400&auto=format&fit=crop', thumb: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=40&w=300&auto=format&fit=crop' },
    { name: 'Suave Aurora Gradiente', value: 'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?q=80&w=1400&auto=format&fit=crop', thumb: 'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?q=40&w=300&auto=format&fit=crop' },
    { name: 'Madeira Escura Orgânica', value: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=1400&auto=format&fit=crop', thumb: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=40&w=300&auto=format&fit=crop' },
];

export const ANIMATION_OPTIONS = [
    { id: 'auto', name: 'Automático (Tema)', icon: RefreshCw, desc: 'Adapta-se ao estilo clássico, moderno ou escuro de acordo com o tema selecionado.' },
    { id: 'none', name: 'Nenhuma (Estático)', icon: Ban, desc: 'Para computadores mais lentos ou maior foco. Desativa todas as movimentações.' },
    { id: 'aurora', name: 'Aurora Boreal Fluida', icon: Sparkles, desc: 'Grandes bolhas coloridas brilhantes de movimentação orgânica contínua.' },
    { id: 'winxp', name: 'XP Bliss (Nuvens reais)', icon: Smile, desc: 'Brilho solar, nuvens que cruzam o monitor e borboletas flutuantes na tela.' },
    { id: 'win95', name: 'Windows 95 Starfield', icon: Zap, desc: 'Estrelas clássicas e logotipos voadores de velocidade hipersônica retrô.' },
    { id: 'premium_black', name: 'Brilho Dourado (Premium)', icon: Activity, desc: 'Moderna e sofisticada pulsação de luz dourada indireta excelente para salas escuras.' },
    { id: 'stars', name: 'Chuva de Estrelas Prateadas', icon: Star, desc: 'Animação de céu limpo com micro estrelas que brilham em ritmos alternados.' },
];


export default ModuleRedeSocial;
