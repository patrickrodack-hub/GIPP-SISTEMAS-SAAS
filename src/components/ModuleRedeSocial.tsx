import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toPng, toJpeg, toBlob } from 'html-to-image';
import { 
  LayoutTemplate, Maximize, Minimize, Settings, Plus, Minus, Download, Share2, ClipboardList, Send, Copy, Trash2,
  Type as TypeIcon, Layers, Image as ImageIcon, Smile, Clock, Eye, EyeOff, Shield, ShieldCheck, Inbox, ArrowUp, ArrowDown, Sparkles,
  FileText, RefreshCw, Smartphone, MonitorPlay, CheckCircle, Trash, PenTool, Bold, Italic, Underline, Lock, Unlock, Phone, AlignLeft,
  AlignCenter, AlignRight, Shapes, Mail, Bell, FileDown, Eye as EyeIcon, EyeOff as EyeOffIcon, Search, ZoomIn, ZoomOut, Check, Heart, Trophy, Crown, Star, Flame,
  FileSpreadsheet, Sparkle, User, Users, Compass, HelpCircle, Save, Printer, Sun, Moon
} from 'lucide-react';

import { 
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, 
  setDoc, onSnapshot, query, writeBatch, where, getDocs
} from 'firebase/firestore';

import {
  ChurchContext, Button, FormInput, FormSelect,
  copyToClipboard, playMenuSound, playNotificationSound, getTodayDate, formatDateLocal
} from '../App';

// Presets representing template structures
const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'culto', label: 'Cultos & Família' },
  { id: 'ceia', label: 'Santa Ceia' },
  { id: 'ebd', label: 'Educação / EBD' },
  { id: 'eventos', label: 'Congressos & Festas' },
  { id: 'missoes', label: 'Missões' }
];

const MOCK_TEMPLATES = [
  {
    id: 'ad1', 
    name: 'Santa Ceia do Senhor',
    category: 'ceia',
    canvas: { bgColor: '#450a0a', bgImage: null, overlayOpacity: 60, width: 1080, height: 1080 },
    elements: [
      { id: '1', type: 'text', text: 'SANTA CEIA', fontSize: 100, fontFamily: 'Cinzel', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 35, left: 50, letterSpacing: 6, shadow: true, shadowColor: '#000000', shadowBlur: 15, shadowOffsetX: 0, shadowOffsetY: 6, rotation: 0, opacity: 100 },
      { id: '2', type: 'text', text: '"Fazei isto em memória de mim"', fontSize: 28, fontFamily: 'Great Vibes', fontWeight: 400, color: '#fca5a5', textAlign: 'center', top: 55, left: 50, letterSpacing: 2, shadow: true, shadowColor: '#000000', shadowBlur: 8, shadowOffsetX: 0, shadowOffsetY: 3, rotation: 0, opacity: 100 },
      { id: '3', type: 'text', text: 'PRÓXIMO DOMINGO ÀS 18H', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#fbbf24', textAlign: 'center', top: 78, left: 50, letterSpacing: 8, shadow: false, rotation: 0, opacity: 100 }
    ]
  },
  {
    id: 'ad2',
    name: 'Círculo de Oração - Assembleia',
    category: 'culto',
    canvas: { bgColor: '#3b0764', bgImage: null, overlayOpacity: 50, width: 1080, height: 1080 },
    elements: [
      { id: '1', type: 'text', text: 'CÍRCULO DE ORAÇÃO', fontSize: 50, fontFamily: 'Outfit', fontWeight: 900, color: '#e9d5ff', textAlign: 'center', top: 32, left: 50, letterSpacing: 8, shadow: true, shadowColor: '#000000', shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 4, rotation: 0, opacity: 100 },
      { id: '2', type: 'text', text: 'CHORANDO ENTRE O PÓRTICO E O ALTAR', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#ffffff', textAlign: 'center', top: 48, left: 50, letterSpacing: 4, shadow: false, rotation: 0, opacity: 100 },
      { id: '3', type: 'text', text: 'TODA TERÇA-FEIRA - 14:00H', fontSize: 24, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#f59e0b', textAlign: 'center', top: 75, left: 50, letterSpacing: 6, shadow: true, shadowColor: '#000000', shadowBlur: 5, shadowOffsetX: 0, shadowOffsetY: 2, rotation: 0, opacity: 100 }
    ]
  },
  {
    id: 'ad3',
    name: 'Culto de Doutrina e Ensino',
    category: 'culto',
    canvas: { bgColor: '#0f172a', bgImage: null, overlayOpacity: 40, width: 1080, height: 1080 },
    elements: [
      { id: '1', type: 'text', text: 'CULTO DE\nDOUTRINA', fontSize: 90, fontFamily: 'Cinzel', fontWeight: 900, color: '#ffffff', textAlign: 'left', top: 40, left: 15, letterSpacing: 2, shadow: true, shadowColor: '#000000', shadowBlur: 12, shadowOffsetX: 4, shadowOffsetY: 4, rotation: 0, opacity: 100 },
      { id: '2', type: 'text', text: 'EXPLICANDO AS ESCRITURAS SAGRADAS', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#fbcfe8', textAlign: 'left', top: 62, left: 15, letterSpacing: 3, shadow: false, rotation: 0, opacity: 100 },
      { id: '3', type: 'text', text: 'TODAS AS QUINTAS ÀS 19:30H', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#94a3b8', textAlign: 'left', top: 80, left: 15, letterSpacing: 4, shadow: false, rotation: 0, opacity: 100 }
    ]
  },
  {
    id: 'ad4',
    name: 'Culto de Missões - Grande Clamor',
    category: 'missoes',
    canvas: { bgColor: '#14532d', bgImage: null, overlayOpacity: 40, width: 1080, height: 1080 },
    elements: [
      { id: '1', type: 'text', text: 'CULTO DE MISSÕES', fontSize: 44, fontFamily: 'Outfit', fontWeight: 900, color: '#f0fdf4', textAlign: 'center', top: 28, left: 50, letterSpacing: 8, shadow: true, shadowColor: '#000050', shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 4, rotation: 0, opacity: 100 },
      { id: '2', type: 'text', text: 'IDE POR TODO O MUNDO', fontSize: 24, fontFamily: 'Playfair Display', fontWeight: 400, color: '#86efac', textAlign: 'center', top: 42, left: 50, letterSpacing: 2, shadow: false, rotation: 0, opacity: 100 },
      { id: '3', type: 'text', text: 'PRÓXIMO DOMINGO - 18:30H', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#ffffff', textAlign: 'center', top: 80, left: 50, letterSpacing: 6, shadow: false, rotation: 0, opacity: 100 }
    ]
  },
  {
    id: 'ad5',
    name: 'Escola Bíblica Dominical (EBD)',
    category: 'ebd',
    canvas: { bgColor: '#1e3a8a', bgImage: null, overlayOpacity: 30, width: 1080, height: 1080 },
    elements: [
      { id: '1', type: 'text', text: 'EBD', fontSize: 130, fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 35, left: 50, letterSpacing: -4, shadow: true, shadowColor: '#000000', shadowBlur: 15, shadowOffsetX: 0, shadowOffsetY: 6, rotation: 0, opacity: 100 },
      { id: '2', type: 'text', text: 'ESCOLA BÍBLICA DOMINICAL', fontSize: 24, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#93c5fd', textAlign: 'center', top: 58, left: 50, letterSpacing: 4, shadow: false, rotation: 0, opacity: 100 },
      { id: '3', type: 'text', text: 'DOMINGO REUNIDOS ÀS 09:00H', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#ffffff', textAlign: 'center', top: 78, left: 50, letterSpacing: 3, shadow: false, rotation: 0, opacity: 100 }
    ]
  },
  {
    id: 'ad6',
    name: 'Congresso Geral de Jovens',
    category: 'eventos',
    canvas: { bgColor: '#4c0519', bgImage: null, overlayOpacity: 50, width: 1080, height: 1080 },
    elements: [
      { id: '1', type: 'text', text: 'CONGRESSO DE', fontSize: 32, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#fbcfe8', textAlign: 'center', top: 30, left: 50, letterSpacing: 8, shadow: true, shadowColor: '#000000', shadowBlur: 8, shadowOffsetX: 0, shadowOffsetY: 3, rotation: 0, opacity: 100 },
      { id: '2', type: 'text', text: 'JOVENS', fontSize: 120, fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 48, left: 50, letterSpacing: -2, shadow: true, shadowColor: '#000000', shadowBlur: 20, shadowOffsetX: 0, shadowOffsetY: 10, rotation: 0, opacity: 100 },
      { id: '3', type: 'text', text: '"Lembra-te do teu Criador nos dias da tua mocidade"', fontSize: 18, fontFamily: 'Playfair Display', fontWeight: 400, color: '#fda4af', textAlign: 'center', top: 68, left: 50, letterSpacing: 1, shadow: false, rotation: 0, opacity: 100 }
    ]
  },
  {
    id: 'ad7',
    name: 'Vigília de Poder e Oração',
    category: 'culto',
    canvas: { bgColor: '#020617', bgImage: null, overlayOpacity: 50, width: 1080, height: 1080 },
    elements: [
      { id: '1', type: 'text', text: 'GRANDE\nVIGÍLIA', fontSize: 100, fontFamily: 'Cinzel', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 38, left: 50, letterSpacing: 6, shadow: true, shadowColor: '#000000', shadowBlur: 18, shadowOffsetX: 0, shadowOffsetY: 8, rotation: 0, opacity: 100 },
      { id: '2', type: 'text', text: 'BUSCANDO O AVIVAMENTO', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#fbbf24', textAlign: 'center', top: 62, left: 50, letterSpacing: 4, shadow: false, rotation: 0, opacity: 100 },
      { id: '3', type: 'text', text: 'SEXTA-FEIRA DAS 22H ÀS 03H', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, color: '#cbd5e1', textAlign: 'center', top: 82, left: 50, letterSpacing: 3, shadow: false, rotation: 0, opacity: 100 }
    ]
  }
];

const STICKERS_OPTIONS = [
  { id: 'cross', label: 'Cruz Sagrada', icon: '✝️' },
  { id: 'bible', label: 'Bíblia', icon: '📖' },
  { id: 'dove', label: 'Pomba da Paz', icon: '🕊️' },
  { id: 'fire', label: 'Fogo/Espírito', icon: '🔥' },
  { id: 'sparkles', label: 'Brilho', icon: '✨' },
  { id: 'prayer', label: 'Mãos Clamando', icon: '🙏' },
  { id: 'wheat', label: 'Pão/Comunhão', icon: '🥖' },
  { id: 'wine', label: 'Cálice/Vinho', icon: '🍷' },
  { id: 'crown', label: 'Coroa', icon: '👑' },
  { id: 'church', label: 'Igreja Santo', icon: '⛪' },
  { id: 'star', label: 'Estrela Guia', icon: '🌟' }
];

const SHAPE_OPTIONS = [
  { id: 'rect', label: 'Retângulo', icon: <div className="w-5 h-4 bg-slate-400 rounded-sm"></div> },
  { id: 'circle', label: 'Círculo', icon: <div className="w-5 h-5 bg-slate-400 rounded-full"></div> },
  { id: 'triangle', label: 'Triângulo', icon: <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-slate-400 mx-auto"></div> },
  { id: 'line', label: 'Divisor / Linha', icon: <div className="w-6 h-1 bg-slate-400"></div> }
];

const PREDEFINED_COLORS = [
  '#eb1e1e', '#1e293b', '#0f172a', '#1e3a8a', '#14532d', '#701a75', '#4c0519', '#0d9488',
  '#ffffff', '#fbbf24', '#f472b6', '#3b82f6', '#10b981', '#a7f3d0', '#fb7185', '#94a3b8'
];

interface ElementState {
  id: string;
  type: 'text' | 'shape' | 'sticker' | 'image';
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  top: number; // percentage (0-100)
  left: number; // percentage (0-100)
  rotation?: number; // 0-360
  opacity?: number; // 0-100
  width?: number; // in pixels
  height?: number; // in pixels
  shapeType?: 'rect' | 'circle' | 'triangle' | 'line';
  iconName?: string;
  src?: string;
  locked?: boolean;
}

const ModuleRedeSocial = () => {
  const { db, user, dbFirestore, appId, addToast } = useContext(ChurchContext);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // --- ESTADOS DO EDITOR ---
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [activeMenu, setActiveMenu] = useState('templates'); // 'templates', 'size', 'text', 'shapes', 'bg', 'layers', 'saved'
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTemplate, setSearchTemplate] = useState('');
  const [zoom, setZoom] = useState(0.4);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // --- TELA CHEIA (FULLSCREEN MODE) ---
  const [isFullScreen, setIsFullScreen] = useState(false);

  // --- PROJETOS SALVOS LOCALMENTE ---
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [projectName, setProjectName] = useState('Nova Arte Sem Nome');

  // --- MODAIS DE COMPARTILHAMENTO ---
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);

  // --- FORMULARIO EMAIL ---
  const [emailTo, setEmailTo] = useState('');
  const [emailToName, setEmailToName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // --- FORMULARIO PUSH ---
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushTarget, setPushTarget] = useState('todos'); // 'todos', 'obreiros', 'jovens'
  const [sendingPush, setSendingPush] = useState(false);

  // --- ESTADO DO CANVAS ---
  const [canvasState, setCanvasState] = useState({
    bgColor: '#1e1b4b',
    bgImage: null as string | null,
    overlayOpacity: 40,
    width: 1080,
    height: 1080
  });

  const CANVAS_SIZES = [
    { id: 'sq', label: 'Post Feed (Quadrado)', w: 1080, h: 1080, icon: <ImageIcon size={18}/> },
    { id: 'por', label: 'Post Retrato (Vertical)', w: 1080, h: 1350, icon: <Smartphone size={18}/> },
    { id: 'sto', label: 'Stories / WhatsApp Status', w: 1080, h: 1920, icon: <Smartphone size={18}/> },
    { id: 'pre', label: 'Projeção de Culto (16:9)', w: 1920, h: 1080, icon: <MonitorPlay size={18}/> },
    { id: 'a4', label: 'Folha A4 Vertical (Imprimir)', w: 1240, h: 1754, icon: <FileText size={18}/> },
    { id: 'a4l', label: 'Folha A4 Horizontal (Imprimir)', w: 1754, h: 1240, icon: <FileText size={18}/> }
  ];

  // --- ESTADO DOS ELEMENTOS (LAYERS) ---
  const [elements, setElements] = useState<ElementState[]>([
    { id: 't1', type: 'text', text: 'GRANDE CULTO', fontSize: 80, fontFamily: 'Outfit', fontWeight: 900, color: '#ffffff', textAlign: 'center', top: 38, left: 50, letterSpacing: 4, shadow: true, shadowColor: '#000000', shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 4, rotation: 0, opacity: 100 },
    { id: 't2', type: 'text', text: 'DA FAMÍLIA', fontSize: 100, fontFamily: 'Outfit', fontWeight: 900, color: '#f59e0b', textAlign: 'center', top: 52, left: 50, letterSpacing: 2, shadow: true, shadowColor: '#000000', shadowBlur: 12, shadowOffsetX: 0, shadowOffsetY: 5, rotation: 0, opacity: 100 },
    { id: 't3', type: 'text', text: 'ESTRELA DA AMANHÃ • DOMINGO ÀS 19:00H', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, color: '#ffffff', textAlign: 'center', top: 82, left: 50, letterSpacing: 6, shadow: false, rotation: 0, opacity: 100 }
  ]);

  // Carregar projetos salvos no início
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gipp_creative_studio_designs');
      if (stored) {
        setSavedProjects(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveProjectsToLocalStorage = (list: any[]) => {
    localStorage.setItem('gipp_creative_studio_designs', JSON.stringify(list));
    setSavedProjects(list);
  };

  // Ajuste do zoom para caber na tela
  const autoFitZoom = (w: number, h: number) => {
    if (!containerRef.current) return;
    const padding = isFullScreen ? 40 : 80;
    const cWidth = containerRef.current.clientWidth - padding;
    const cHeight = containerRef.current.clientHeight - padding;
    if (cWidth <= 0 || cHeight <= 0) return;
    
    let newZoom = Math.min(cWidth / w, cHeight / h);
    newZoom = Math.max(0.12, Math.min(1.5, Number(newZoom.toFixed(2))));
    setZoom(newZoom);
  };

  useEffect(() => {
    const handleResize = () => autoFitZoom(canvasState.width, canvasState.height);
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasState.width, canvasState.height, isFullScreen, activeMenu]);

  // --- HISTÓRICO DE MUNDANÇAS (UNDO / REDO) ---
  const [history, setHistory] = useState<{ elements: ElementState[]; canvas: any }[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);

  const saveToHistory = (newElements: ElementState[], newCanvas: any) => {
    const nextHistory = history.slice(0, historyPointer + 1);
    nextHistory.push({ elements: JSON.parse(JSON.stringify(newElements)), canvas: { ...newCanvas } });
    
    if (nextHistory.length > 25) {
      nextHistory.shift();
    }
    setHistory(nextHistory);
    setHistoryPointer(nextHistory.length - 1);
  };

  const undo = () => {
    if (historyPointer > 0) {
      const prev = history[historyPointer - 1];
      setElements(JSON.parse(JSON.stringify(prev.elements)));
      setCanvasState({ ...prev.canvas });
      setHistoryPointer(historyPointer - 1);
      setSelectedId(null);
      addToast("Ação desfeita", "info");
    }
  };

  const redo = () => {
    if (historyPointer < history.length - 1) {
      const next = history[historyPointer + 1];
      setElements(JSON.parse(JSON.stringify(next.elements)));
      setCanvasState({ ...next.canvas });
      setHistoryPointer(historyPointer + 1);
      setSelectedId(null);
      addToast("Ação refeita", "info");
    }
  };

  // --- FILTRO DE PESQUISA DE TEMPLATES ---
  const filteredTemplates = useMemo(() => {
    return MOCK_TEMPLATES.filter(t => {
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      const matchesSearch = t.name.toLowerCase().includes(searchTemplate.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTemplate]);

  // --- DRAG & DROP DESENHO ---
  const startDrag = (e: React.MouseEvent, id: string) => {
    const target = elements.find(el => el.id === id);
    if (target?.locked) return;

    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      if (target) {
        setDragOffset({ x: xPct - target.left, y: yPct - target.top });
      }
    }
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId || !canvasRef.current) return;
    const target = elements.find(el => el.id === selectedId);
    if (!target || target.locked) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let newLeft = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
    let newTop = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y;
    
    newLeft = Math.max(0, Math.min(100, newLeft));
    newTop = Math.max(0, Math.min(100, newTop));

    setElements(elements.map(el => el.id === selectedId ? { ...el, left: newLeft, top: newTop } : el));
  };

  const stopDrag = () => {
    if (isDragging) {
      setIsDragging(false);
      saveToHistory(elements, canvasState);
    }
  };

  // --- CONTROLES DOS ELEMENTOS ---
  const updateElement = (id: string, updates: Partial<ElementState>) => {
    const nextElements = elements.map(el => el.id === id ? { ...el, ...updates } : el);
    setElements(nextElements);
    saveToHistory(nextElements, canvasState);
  };

  const addTextElement = (type: 'heading' | 'subheading' | 'body') => {
    const id = 'txt_' + Date.now().toString();
    let newItem: ElementState = {
      id,
      type: 'text',
      text: 'TEXTO',
      fontSize: 50,
      fontFamily: 'Outfit',
      fontWeight: 800,
      color: '#ffffff',
      textAlign: 'center',
      top: 50,
      left: 50,
      letterSpacing: 2,
      shadow: true,
      shadowColor: '#000000',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      rotation: 0,
      opacity: 100
    };

    if (type === 'heading') {
      newItem.text = 'NOVO TÍTULO';
      newItem.fontSize = 72;
    } else if (type === 'subheading') {
      newItem.text = 'Novo Subtítulo';
      newItem.fontSize = 32;
      newItem.fontFamily = 'Plus Jakarta Sans';
      newItem.fontWeight = 700;
    } else {
      newItem.text = 'Toque duas vezes para redigir o corpo do seu texto.';
      newItem.fontSize = 20;
      newItem.fontFamily = 'Plus Jakarta Sans';
      newItem.fontWeight = 500;
    }

    const next = [...elements, newItem];
    setElements(next);
    setSelectedId(id);
    saveToHistory(next, canvasState);
    addToast("Elemento de texto adicionado", "success");
  };

  const addShapeElement = (shapeType: 'rect' | 'circle' | 'triangle' | 'line') => {
    const id = 'shp_' + Date.now().toString();
    const newItem: ElementState = {
      id,
      type: 'shape',
      shapeType,
      top: 50,
      left: 50,
      width: shapeType === 'line' ? 400 : 180,
      height: shapeType === 'line' ? 8 : 180,
      color: '#fbbf24',
      opacity: 80,
      rotation: 0,
      bold: false,
      italic: false,
      underline: false
    };

    const next = [...elements, newItem];
    setElements(next);
    setSelectedId(id);
    saveToHistory(next, canvasState);
    addToast("Forma geométrica adicionada", "success");
  };

  const addStickerElement = (emojiIcon: string) => {
    const id = 'stk_' + Date.now().toString();
    const newItem: ElementState = {
      id,
      type: 'sticker',
      iconName: emojiIcon,
      top: 50,
      left: 50,
      fontSize: 80,
      opacity: 100,
      rotation: 0
    };

    const next = [...elements, newItem];
    setElements(next);
    setSelectedId(id);
    saveToHistory(next, canvasState);
    addToast("Adesivo/Símbolo adicionado", "success");
  };

  const duplicateElement = (id: string) => {
    const source = elements.find(el => el.id === id);
    if (source) {
      const clone: ElementState = {
        ...JSON.parse(JSON.stringify(source)),
        id: 'dup_' + Date.now().toString(),
        top: Math.min(100, source.top + 4),
        left: Math.min(100, source.left + 4)
      };
      const next = [...elements, clone];
      setElements(next);
      setSelectedId(clone.id);
      saveToHistory(next, canvasState);
      addToast("Elemento duplicado", "success");
    }
  };

  const deleteElement = (id: string) => {
    const next = elements.filter(el => el.id !== id);
    setElements(next);
    if (selectedId === id) setSelectedId(null);
    saveToHistory(next, canvasState);
    addToast("Camada apagada", "info");
  };

  const moveZ = (id: string, dir: 'up' | 'down') => {
    const idx = elements.findIndex(el => el.id === id);
    if (idx === -1) return;
    const newIdx = dir === 'up' ? idx + 1 : idx - 1;
    if (newIdx < 0 || newIdx >= elements.length) return;

    const updated = [...elements];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;

    setElements(updated);
    saveToHistory(updated, canvasState);
  };

  // --- UPLOAD DE IMGEM DE FUNDO ---
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const nextCanvas = { ...canvasState, bgImage: reader.result as string };
        setCanvasState(nextCanvas);
        saveToHistory(elements, nextCanvas);
        addToast("Arquivo de fundo carregado com sucesso!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  // --- GRAVAR PROJETOS SALVOS ---
  const saveProject = () => {
    if (!projectName.trim()) return addToast("Defina um nome para salvar o projeto.", "warning");
    const activeId = Date.now().toString();
    const newDoc = {
      id: activeId,
      name: projectName,
      canvas: { ...canvasState },
      elements: JSON.parse(JSON.stringify(elements)),
      lastSaved: new Date().toISOString()
    };

    const existsIdx = savedProjects.findIndex(p => p.name.toLowerCase() === projectName.toLowerCase());
    let nextList = [...savedProjects];
    if (existsIdx > -1) {
      nextList[existsIdx] = newDoc;
      addToast("Projeto atualizado!", "success");
    } else {
      nextList.push(newDoc);
      addToast("Projeto criado e gravado com sucesso!", "success");
    }
    saveProjectsToLocalStorage(nextList);
  };

  const loadProject = (proj: any) => {
    setCanvasState({ ...proj.canvas });
    setElements(JSON.parse(JSON.stringify(proj.elements)));
    setProjectName(proj.name);
    setSelectedId(null);
    setTimeout(() => autoFitZoom(proj.canvas.width, proj.canvas.height), 120);
    addToast(`Carregado: ${proj.name}`, "success");
  };

  const deleteProjectFromList = (projId: string) => {
    const nextList = savedProjects.filter(p => p.id !== projId);
    saveProjectsToLocalStorage(nextList);
    addToast("Projeto apagado", "info");
  };

  // --- COMPILADOR HIGH RES PNG ---
  const generateImageURL = async (format: 'png' | 'jpeg' = 'png'): Promise<string | null> => {
    if (!canvasRef.current) return null;
    setSelectedId(null);
    await new Promise(r => setTimeout(r, 450)); // Wait select box removal animation
    
    try {
      const opts = {
        pixelRatio: 2,
        backgroundColor: canvasState.bgColor,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      };
      return format === 'jpeg' ? await toJpeg(canvasRef.current, opts) : await toPng(canvasRef.current, opts);
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const exportDirectImage = async (format: 'png' | 'jpeg' = 'png') => {
    addToast("Renderizando arte sob alta densidade...", "info");
    const url = await generateImageURL(format);
    if (!url) return addToast("Falha técnica ao converter elementos.", "error");

    const a = document.createElement('a');
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_gipp.${format}`;
    a.href = url;
    a.click();
    addToast("Download concluído com sucesso!", "success");
  };

  // --- ENVIAR WHATSAPP TRABALHO ---
  const handleWhatsAppShare = async () => {
    addToast("Compilando imagem para o WhatsApp...", "info");
    const url = await generateImageURL('png');
    if (!url) return;

    // Trigger download
    const a = document.createElement('a');
    a.download = `EstudioArtes_${Date.now()}.png`;
    a.href = url;
    a.click();

    // Copiar primeiro texto de título para o clipboard
    const textLayer = elements.find(el => el.type === 'text')?.text || '';
    const cleanContextText = textLayer.replace(/\n/g, ' ');
    const shareMessage = `Olá! Segue a arte oficial gerada pelo Estúdio Criativo GIPP:\n*${cleanContextText}*\n\n_(A imagem foi baixada no seu aparelho. Envie-a no WhatsApp junto com esta mensagem!)_`;
    
    copyToClipboard(shareMessage);
    playNotificationSound();

    setTimeout(() => {
      window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`, '_blank');
      addToast("Iniciando WhatsApp Web. Texto explicativo copiado para a Área de Transferência!", "success");
    }, 1500);
  };

  // --- IMPRIMIR IMPRESSORA CLIENTE ---
  const handlePrint = async () => {
    addToast("Preparando página de impressão...", "info");
    const url = await generateImageURL('png');
    if (!url) return;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <html>
          <head>
            <title>Imprimir Arte GIPP - ${projectName}</title>
            <style>
              body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: white; }
              img { max-width: 100%; max-height: 100%; object-fit: contain; }
              @media print {
                body { margin: 0; }
                img { width: 100vw; height: 100vh; }
              }
            </style>
          </head>
          <body>
            <img src="${url}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWin.document.close();
    }
  };

  // --- ENVIAR EMAIL REAL DATA ---
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo) return addToast("Preencha o destinatário do e-mail.", "warning");
    setSendingEmail(true);

    try {
      addToast("Convertendo arte para incorporar via email...", "info");
      const base64Url = await generateImageURL('png') || '';

      const emailDoc = {
        appId: appId || 'system',
        to: emailTo,
        toName: emailToName || 'Membro GIPP',
        subject: emailSubject || `Arte GIPP: ${projectName}`,
        body: `${emailBody}\n\n[Arte Anexada no Portal GIPP]\nEssa mensagem foi automatizada através do Estúdio de Artes.`,
        imageUrl: base64Url.substring(0, 500000), // Proteção para armazenamento de grandes Base64
        sentAt: new Date().toISOString(),
        sender: user?.usuario || 'Administrador'
      };

      if (dbFirestore && appId) {
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'emails'), emailDoc);
      }
      playNotificationSound();
      addToast("E-mail disparado e registrado nas requisições da igreja!", "success");
      setIsEmailModalOpen(false);
      setEmailBody('');
    } catch (err) {
      console.error(err);
      addToast("Falha no disparo do email.", "error");
    } finally {
      setSendingEmail(false);
    }
  };

  // --- LANÇAR AVISO PUSH NO PORTAL ---
  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle || !pushBody) return addToast("Insira o título e o corpo do aviso.", "warning");
    setSendingPush(true);

    try {
      const activeText = elements.find(el => el.type === 'text')?.text?.replace(/\n/g, ' ') || '';
      
      const pushDoc = {
        titulo: pushTitle,
        mensagem: `${pushBody}\n\nArte Base: ${activeText}`,
        data: getTodayDate(),
        categoria: 'comunicado',
        targetAudience: pushTarget,
        createdAt: new Date().toISOString(),
        author: user?.usuario || 'Administrador'
      };

      if (dbFirestore && appId) {
        // Gravar no Firestore global
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'notificacoes'), pushDoc);
      }

      playNotificationSound();
      addToast(`Sucesso! Aviso Push disparado para canais de segmentação: [${pushTarget.toUpperCase()}]`, "success");
      setIsPushModalOpen(false);
      setPushTitle('');
      setPushBody('');
    } catch (err) {
      console.error(err);
      addToast("Erro ao gravar notificação de aviso.", "error");
    } finally {
      setSendingPush(false);
    }
  };

  // --- COMPILADOR DA SELEÇÃO DE ELEMENTOS AO CLICAR NO FUNDO ---
  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div className={`flex flex-col animate-entrance ${themeMode === 'dark' ? 'bg-slate-950 text-slate-100 border-slate-800' : 'bg-white text-slate-800 border-slate-200'} border overflow-hidden relative transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-[120] h-screen w-screen rounded-none' : 'h-[85vh] min-h-[650px] rounded-[2rem] shadow-2xl'}`}>
      
      {/* 1. TOP HEADER BAR */}
      <div className={`h-20 border-b ${themeMode === 'dark' ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-800'} flex items-center justify-between px-6 shrink-0 z-20 shadow-md`}>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-md animate-pulse">
            <PaletteComp size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)} 
                className={`bg-transparent font-black ${themeMode === 'dark' ? 'text-white' : 'text-slate-800'} text-base border-b border-transparent focus:border-indigo-500 outline-none w-56 truncate`}
                placeholder="Nome do Projeto..." 
              />
              <button onClick={saveProject} className="text-slate-400 hover:text-emerald-400 p-1 rounded-lg" title="Salvar Projeto">
                <Save size={16}/>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estúdio Canva GIPP Premium Mode</p>
          </div>
        </div>

        {/* CONTROLES CENTRAIS (ZOOM / EDIT DE PASSO) */}
        <div className="flex items-center gap-3">
          <button onClick={undo} disabled={historyPointer <= 0} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 disabled:opacity-30" title="Desfazer">
            <RotateCcwComp size={16}/>
          </button>
          <button onClick={redo} disabled={historyPointer >= history.length - 1} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 disabled:opacity-30" title="Refazer">
            <RotateCwComp size={16}/>
          </button>

          <div className="h-6 w-px bg-slate-800 mx-2"></div>

          <div className={`flex items-center gap-1.5 ${themeMode === 'dark' ? 'bg-slate-800 border-slate-705 text-white' : 'bg-slate-200 border-slate-300 text-slate-700'} px-3 py-1.5 rounded-xl border text-xs font-bold font-mono`}>
            <button onClick={() => setZoom(Math.max(0.1, zoom - 0.05))} className="hover:text-indigo-400"><Minus size={14}/></button>
            <span className="w-12 text-center text-[11px]">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={() => setZoom(Math.min(1.5, zoom + 0.05))} className="hover:text-indigo-400"><Plus size={14}/></button>
          </div>
        </div>

        {/* DIRETÓRIOS EXPORT DE REDE SOCIAL */}
        <div className="flex items-center gap-2">
          {/* THEME SELECTOR BUTTON */}
          <button
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            className={`p-3 rounded-xl font-bold transition-transform hover:scale-105 border ${
              themeMode === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                : 'bg-slate-200 hover:bg-slate-300 text-amber-600 border-slate-300'
            }`}
            title={themeMode === 'dark' ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
          >
            {themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={`p-3 ${themeMode === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'} text-indigo-400 hover:text-indigo-300 rounded-xl font-bold transition-transform hover:scale-105`}
            title={isFullScreen ? "Sair da Tela Cheia" : "Focar em Tela Cheia"}
          >
            {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          <Button onClick={handlePrint} variant="ghost" className={`${themeMode === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} py-3 px-3.5 rounded-xl text-xs font-bold border-0`}>
            <Printer size={16} className="text-indigo-400"/>
            <span className="hidden leading-none lg:inline ml-1.5">Imprimir</span>
          </Button>

          <Button onClick={handleWhatsAppShare} variant="success" className="py-3 px-3.5 text-xs shadow-md border-0 bg-emerald-600 hover:bg-emerald-500 rounded-xl leading-none">
            <Phone size={16}/>
            <span className="hidden md:inline font-black">WhatsApp</span>
          </Button>

          {/* DROPDOWN COMPARTILHAMENTOS */}
          <div className="relative group">
            <button className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md">
              <Download size={14}/>
              Publicar
            </button>
            <div className={`absolute right-0 mt-2 w-52 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50`}>
              <button onClick={() => exportDirectImage('png')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2">
                <FileDown size={14} className="text-sky-400"/> Baixar Imagem (PNG)
              </button>
              <button onClick={() => exportDirectImage('jpeg')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2">
                <FileDown size={14} className="text-amber-400"/> Baixar Imagem (JPEG)
              </button>
              <div className="h-px bg-slate-800 my-1 mx-2"></div>
              <button onClick={() => setIsEmailModalOpen(true)} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2">
                <Mail size={14} className="text-pink-400"/> Disparar por E-mail
              </button>
              <button onClick={() => setIsPushModalOpen(true)} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2">
                <Bell size={14} className="text-yellow-400"/> Lançar Push no Portal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTAINER BODY WORKSPACE */}
      <div className={`flex-1 flex overflow-hidden ${themeMode === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
        
        {/* LADO A: SELETOR DE MENUS ICONES (VERTICAL) */}
        <div className={`w-20 ${themeMode === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-250'} flex flex-col items-center py-6 gap-2.5 shrink-0 z-20 border-r`}>
          {[
            { id: 'templates', icon: LayoutTemplate, label: 'Modelos' },
            { id: 'size', icon: Maximize, label: 'Tamanhos' },
            { id: 'text', icon: TypeIcon, label: 'Textos' },
            { id: 'shapes', icon: Shapes, label: 'Formas' },
            { id: 'bg', icon: ImageIcon, label: 'Fundos' },
            { id: 'layers', icon: Layers, label: 'Camadas' },
            { id: 'saved', icon: Compass, label: 'Projetos' }
          ].map(menu => (
            <button 
              key={menu.id} 
              onClick={() => { setActiveMenu(menu.id); setSelectedId(null); }}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${activeMenu === menu.id ? 'bg-indigo-600 text-white shadow-lg' : themeMode === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              <menu.icon size={20} className="mb-1"/>
              <span className="text-[9px] font-bold uppercase tracking-wider">{menu.label}</span>
            </button>
          ))}
        </div>

        {/* LADO B: SUBBARRA CONFIGURAÇÕES DO MENU SELECIONADO */}
        <div className={`w-72 ${themeMode === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'} border-r flex flex-col shrink-0 z-10 overflow-y-auto custom-scrollbar`}>
          <div className={`p-5 border-b ${themeMode === 'dark' ? 'border-slate-800' : 'border-slate-205'}`}>
            <h3 className={`font-black uppercase tracking-widest text-xs ${themeMode === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
              {activeMenu === 'templates' && 'Modelos Prontos'}
              {activeMenu === 'size' && 'Tamanhos de Tela'}
              {activeMenu === 'text' && 'Lançar Textos'}
              {activeMenu === 'shapes' && 'Formas & Adesivos'}
              {activeMenu === 'bg' && 'Cenários e Tintas'}
              {activeMenu === 'layers' && 'Ordem de Camadas'}
              {activeMenu === 'saved' && 'Projetos Registrados'}
            </h3>
          </div>

          <div className="p-4 flex-1">
            
            {/* MODELOS DE CANVA COMPILADOS */}
            {activeMenu === 'templates' && (
              <div className="space-y-4">
                {/* Categorias Pills */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => setActiveCategory(cat.id)}
                      className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-lg border transition-all ${activeCategory === cat.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Pesquisa input */}
                <div className="relative mb-3">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Search size={14}/></span>
                  <input 
                    type="text" 
                    placeholder="Filtrar modelos..." 
                    value={searchTemplate}
                    onChange={(e) => setSearchTemplate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-3">
                  {filteredTemplates.map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => {
                        setCanvasState(t.canvas);
                        setElements(JSON.parse(JSON.stringify(t.elements)));
                        setSelectedId(null);
                        autoFitZoom(t.canvas.width, t.canvas.height);
                        addToast(`Modelo ${t.name} carregado com sucesso`, "success");
                        saveToHistory(t.elements, t.canvas);
                      }}
                      className="w-full text-left p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500 rounded-2xl transition-all shadow group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: t.canvas.bgColor }}>
                          <Sparkle size={16}/>
                        </div>
                        <div className="overflow-hidden">
                          <span className="block font-black text-white text-xs leading-none mb-1 truncate">{t.name}</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">{t.canvas.width}x{t.canvas.height} px</span>
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredTemplates.length === 0 && (
                    <p className="text-xs text-slate-500 italic text-center py-4">Nenhum modelo nesta pesquisa.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAMANHOS */}
            {activeMenu === 'size' && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 mb-4 leading-relaxed font-bold uppercase tracking-wider">Defina a proporção da prancheta:</p>
                {CANVAS_SIZES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCanvasState(prev => ({ ...prev, width: s.w, height: s.h }));
                      setTimeout(() => autoFitZoom(s.w, s.h), 80);
                      addToast(`Tamanho definido: ${s.label}`, "info");
                    }}
                    className={`w-full p-4 flex items-center justify-between rounded-2xl border text-left transition-all ${canvasState.width === s.w && canvasState.height === s.h ? 'bg-indigo-950/60 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-slate-400">{s.icon}</div>
                      <div>
                        <span className="block font-bold text-xs leading-none mb-1 text-white">{s.label}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">{s.w} x {s.h} px</span>
                      </div>
                    </div>
                    {canvasState.width === s.w && canvasState.height === s.h && <CheckCircle size={16} className="text-indigo-400"/>}
                  </button>
                ))}
              </div>
            )}

            {/* ADICIONAR TEXTOS */}
            {activeMenu === 'text' && (
              <div className="space-y-3">
                <button onClick={() => addTextElement('heading')} className="w-full p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500 rounded-2xl text-left transition-all shadow cursor-pointer">
                  <span className="block text-xl font-black text-white mb-1">Título Grande</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Estilo Outfit Display</span>
                </button>
                <button onClick={() => addTextElement('subheading')} className="w-full p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500 rounded-2xl text-left transition-all shadow cursor-pointer">
                  <span className="block text-sm font-bold text-slate-300 mb-1">Subtítulo Elegante</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block font-serif">Estudo / Detalhes</span>
                </button>
                <button onClick={() => addTextElement('body')} className="w-full p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500 rounded-2xl text-left transition-all shadow cursor-pointer">
                  <span className="block text-xs font-normal text-slate-400 mb-1">Texto de Descrição / Apoio</span>
                </button>
                
                <div className="pt-6 border-t border-slate-800/80">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Frases e Emojis Rápidos</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['✨', '🔥', '🙏', '🕊️', '📖', '🙌', '⛪', '🌟'].map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => addStickerElement(emoji)}
                        className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-xl text-lg flex items-center justify-center transition-all"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FORMAS E ADESIVOS */}
            {activeMenu === 'shapes' && (
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Figuras Geométricas</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SHAPE_OPTIONS.map(shp => (
                      <button 
                        key={shp.id}
                        onClick={() => addShapeElement(shp.id as any)}
                        className="p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group hover:border-indigo-500"
                      >
                        {shp.icon}
                        <span className="text-[10px] text-slate-400 font-bold group-hover:text-white leading-none">{shp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Símbolos e Memória eclesiástica</label>
                  <div className="grid grid-cols-3 gap-2">
                    {STICKERS_OPTIONS.map(stk => (
                      <button 
                        key={stk.id}
                        onClick={() => addStickerElement(stk.icon)}
                        className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xl"
                        title={stk.label}
                      >
                        <span>{stk.icon}</span>
                        <span className="text-[8px] text-slate-500 font-bold leading-none truncate max-w-full">{stk.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FUNDOS */}
            {activeMenu === 'bg' && (
              <div className="space-y-5">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Upload do Computador</label>
                  <label className="w-full flex flex-col items-center justify-center gap-2 bg-slate-900 border-2 border-dashed border-slate-800 hover:border-indigo-500 hover:bg-slate-855 text-indigo-400 py-6 rounded-2xl cursor-pointer transition-colors font-bold text-xs">
                    <ImageIcon size={20}/>
                    <span className="text-[10px] text-slate-400">Escolher Foto</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload}/>
                  </label>
                  {canvasState.bgImage && (
                    <button onClick={() => setCanvasState({...canvasState, bgImage: null})} className="w-full mt-2 text-[10px] font-black text-rose-500 uppercase py-2 bg-rose-950/40 rounded-xl hover:bg-rose-900/30 transition-colors">
                      Remover Background
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Tinta Sólida</label>
                  <div className="grid grid-cols-8 gap-1 mb-2">
                    {PREDEFINED_COLORS.map(c => (
                      <button 
                        key={c}
                        onClick={() => {
                          const nextCanvas = { ...canvasState, bgColor: c };
                          setCanvasState(nextCanvas);
                          saveToHistory(elements, nextCanvas);
                        }}
                        className="w-6 h-6 rounded-md border border-slate-900 transition-all hover:scale-110"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <input 
                    type="color" 
                    value={canvasState.bgColor} 
                    onChange={(e) => {
                      const nextCanvas = { ...canvasState, bgColor: e.target.value };
                      setCanvasState(nextCanvas);
                      saveToHistory(elements, nextCanvas);
                    }} 
                    className="w-full h-10 bg-transparent rounded-xl cursor-pointer border-0 p-0" 
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
                    <span>Filtro Escuro</span>
                    <span className="text-indigo-400">{canvasState.overlayOpacity}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="95" 
                    value={canvasState.overlayOpacity} 
                    onChange={(e) => {
                      const nextCanvas = { ...canvasState, overlayOpacity: parseInt(e.target.value) };
                      setCanvasState(nextCanvas);
                    }} 
                    onMouseUp={() => saveToHistory(elements, canvasState)}
                    className="w-full accent-indigo-500 h-1 rounded" 
                  />
                  <p className="text-[9px] text-slate-500 leading-tight block mt-1.5 font-bold">Ajuste para escurecer fotos de fundo e dar maior contraste ao texto.</p>
                </div>
              </div>
            )}

            {/* ORDEM DAS CAMADAS */}
            {activeMenu === 'layers' && (
              <div className="space-y-2">
                {elements.map((el, index) => (
                  <div 
                    key={el.id} 
                    onClick={() => setSelectedId(el.id)} 
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedId === el.id ? 'bg-indigo-950/60 border-indigo-500 text-indigo-400 shadow' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'}`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden select-none">
                      <span className="text-[10px] text-slate-600 font-mono font-bold">#{index + 1}</span>
                      <span className="text-white text-xs font-bold truncate max-w-[110px]">
                        {el.type === 'text' && `${el.text?.replace(/\n/g, ' ') || 'Texto'}`}
                        {el.type === 'shape' && `Forma ${el.shapeType}`}
                        {el.type === 'sticker' && `Símbolo ${el.iconName}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => moveZ(el.id, 'up')} disabled={index === elements.length - 1} className="p-1 hover:text-white disabled:opacity-20">
                        <ArrowUp size={12}/>
                      </button>
                      <button onClick={() => moveZ(el.id, 'down')} disabled={index === 0} className="p-1 hover:text-white disabled:opacity-20">
                        <ArrowDown size={12}/>
                      </button>
                      <button onClick={() => deleteElement(el.id)} className="p-1.5 text-rose-500 hover:text-rose-450 hover:bg-rose-950/25 rounded">
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  </div>
                ))}
                {elements.length === 0 && (
                  <p className="text-xs text-slate-600 italic text-center py-4">Nenhuma camada no projeto.</p>
                )}
              </div>
            )}

            {/* PROJETOS SALVOS */}
            {activeMenu === 'saved' && (
              <div className="space-y-3">
                <button onClick={saveProject} className="w-full py-3 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-2xs font-extrabold uppercase tracking-wider block text-center cursor-pointer shadow">
                  Salvar Projeto Atual
                </button>
                <div className="h-px bg-slate-880 my-3"></div>

                <div className="space-y-2">
                  {savedProjects.map(proj => (
                    <div 
                      key={proj.id}
                      className="group p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div className="cursor-pointer overflow-hidden flex-1" onClick={() => loadProject(proj)}>
                        <span className="block font-black text-xs text-white truncate leading-none mb-1">{proj.name}</span>
                        <span className="text-[8px] text-slate-500 font-bold block">{formatDateLocal(proj.lastSaved?.substring(0, 10))}</span>
                      </div>
                      <button onClick={() => deleteProjectFromList(proj.id)} className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors">
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  ))}

                  {savedProjects.length === 0 && (
                    <p className="text-xs text-slate-600 italic text-center py-6">Nenhum projeto salvo na memória deste aparelho.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* LADO C: ÁREA DO CANVAS CENTRAL WORKSPACE */}
        <div 
          ref={containerRef}
          className={`flex-1 ${themeMode === 'dark' ? 'bg-slate-950/80' : 'bg-slate-200/50'} relative overflow-auto flex cursor-crosshair custom-scrollbar p-8`}
          onMouseMove={handleDrag}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedId(null);
          }}
        >
          {/* PAINEL DE DRAG WORKSPACE */}
          <div 
            className="relative transition-all ease-out shrink-0 m-auto shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-slate-800"
            style={{ 
              width: canvasState.width * zoom, 
              height: canvasState.height * zoom 
            }}
          >
            {/* ESCALADOR ZOOM DE RENDERIZAÇÃO */}
            <div 
              style={{ 
                width: `${canvasState.width}px`, 
                height: `${canvasState.height}px`, 
                transform: `scale(${zoom})`, 
                transformOrigin: 'top left' 
              }}
            >
              {/* O CANVAS REAL ALVO DE HTML-TO-IMAGE */}
              <div 
                ref={canvasRef} 
                className="w-full h-full relative overflow-hidden bg-white select-none" 
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
                {/* FILTRO ESCURO */}
                <div 
                  className="absolute inset-0 bg-black pointer-events-none" 
                  style={{ opacity: canvasState.overlayOpacity / 100 }}
                />

                {/* COMPILADOR DE ELEMENTOS */}
                {elements.map(el => (
                  <div
                    key={el.id}
                    onMouseDown={(e) => startDrag(e, el.id)}
                    className={`absolute whitespace-pre-wrap cursor-move group select-none ${selectedId === el.id ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : 'hover:ring-1 hover:ring-white/40'}`}
                    style={{
                      top: `${el.top}%`,
                      left: `${el.left}%`,
                      transform: `translate(-50%, -50%) rotate(${el.rotation || 0}deg)`,
                      fontSize: el.type === 'sticker' ? `${el.fontSize}px` : (el.type === 'text' ? `${el.fontSize}px` : undefined),
                      fontFamily: el.type === 'text' ? el.fontFamily : undefined,
                      fontWeight: el.type === 'text' ? el.fontWeight : undefined,
                      color: el.type === 'text' ? el.color : undefined,
                      textAlign: el.type === 'text' ? el.textAlign : undefined,
                      letterSpacing: el.type === 'text' ? `${el.letterSpacing}px` : undefined,
                      lineHeight: el.type === 'text' ? el.lineHeight : undefined,
                      textShadow: el.type === 'text' && el.shadow ? `${el.shadowOffsetX || 0}px ${el.shadowOffsetY || 4}px ${el.shadowBlur || 10}px ${el.shadowColor || '#000000'}` : 'none',
                      fontStyle: el.italic ? 'italic' : 'normal',
                      textDecoration: el.underline ? 'underline' : 'none',
                      width: el.type === 'shape' ? `${el.width}px` : 'max-content',
                      height: el.type === 'shape' ? `${el.height}px` : 'max-content',
                      opacity: el.opacity !== undefined ? el.opacity / 100 : undefined,
                      maxWidth: '92%',
                      zIndex: elements.findIndex(item => item.id === el.id) + 1
                    }}
                  >
                    {/* Renderização individual de Tipo */}
                    {el.type === 'text' && el.text}

                    {el.type === 'sticker' && el.iconName}

                    {el.type === 'shape' && (
                      <div 
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: el.color,
                          borderRadius: el.shapeType === 'circle' ? '50%' : undefined,
                        }}
                      />
                    )}

                    {/* Alças visuais */}
                    {selectedId === el.id && !el.locked && (
                      <>
                        <div className="absolute -top-2 -left-2 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -bottom-2 -left-2 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white shadow"></div>
                        <div className="absolute -bottom-2 -right-2 w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-white shadow"></div>
                        
                        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-full border border-slate-800 shadow-2xl z-[90]">
                          <button onClick={(e) => { e.stopPropagation(); duplicateElement(el.id); }} className="text-white hover:text-indigo-400 p-1.5 rounded hover:bg-slate-900" title="Duplicar"><Copy size={12}/></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} className="text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-slate-900" title="Apagar"><Trash2 size={12}/></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

              </div>
            </div>
          </div>
        </div>

        {/* LADO D: BARRA DE PROPRIEDADES DO ELEMENTO SELECIONADO (DIREITA) */}
        <div className={`w-80 ${themeMode === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'} border-l flex flex-col shrink-0 z-10 overflow-y-auto custom-scrollbar`}>
          {selectedElement ? (
            <div className="p-5 space-y-5">
              <div className={`flex items-center justify-between border-b ${themeMode === 'dark' ? 'border-slate-800' : 'border-slate-200'} pb-3`}>
                <h3 className={`font-extrabold ${themeMode === 'dark' ? 'text-white' : 'text-slate-800'} text-xs uppercase tracking-widest flex items-center gap-1.5`}>
                  <Settings size={14} className="text-indigo-400"/>
                  Parâmetros
                </h3>
                <span className={`text-[9px] ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'} border px-2 py-0.5 rounded uppercase`}>
                  {selectedElement.type}
                </span>
              </div>

              {/* LOCK/UNLOCK STATUS */}
              <div className={`flex items-center justify-between ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-xl p-3 border`}>
                <span className={`text-[10px] font-black ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider`}>Bloquear Elemento</span>
                <button 
                  onClick={() => updateElement(selectedElement.id, { locked: !selectedElement.locked })}
                  className={`p-2 rounded-xl border transition-all ${selectedElement.locked ? 'bg-red-950/20 border-red-800 text-red-500' : themeMode === 'dark' ? 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-250 text-slate-500 hover:text-slate-800'}`}
                >
                  {selectedElement.locked ? <Lock size={14}/> : <Unlock size={14}/>}
                </button>
              </div>

              {/* CONTEÚDO TEXTO EXPANDIDO */}
              {selectedElement.type === 'text' && (
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Alvo de Digitação</label>
                  <textarea 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-medium text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y min-h-[90px]"
                    value={selectedElement.text}
                    onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                  />
                </div>
              )}

              {/* SELEÇÃO DA GRANDE FONTE DE CANVA */}
              {selectedElement.type === 'text' && (
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Família Tipográfica</label>
                  <select 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:outline-none cursor-pointer focus:border-indigo-500"
                    value={selectedElement.fontFamily}
                    onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                  >
                    <option value="Outfit">Outfit (Moderna Sans)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta (Limpa/GIPP)</option>
                    <option value="Cinzel">Cinzel (Cinemática Serif)</option>
                    <option value="Playfair Display">Playfair (Gótica/Clássica)</option>
                    <option value="Great Vibes">Great Vibes (Manuscrita Oração)</option>
                    <option value="Space Grotesk">Space Grotesk (Tech design)</option>
                    <option value="Inter">Inter (Padrão Humilde)</option>
                  </select>
                </div>
              )}

              {/* TONALIDADE / PIGMENTOS DE CORES */}
              {selectedElement.type !== 'image' && (
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Cor da Camada</label>
                  <div className="grid grid-cols-8 gap-1 mb-2">
                    {PREDEFINED_COLORS.map(c => (
                      <button 
                        key={c}
                        onClick={() => updateElement(selectedElement.id, { color: c })}
                        className="w-5 h-5 rounded border border-slate-900 transition-all hover:scale-110"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <input 
                    type="color" 
                    value={selectedElement.color || '#ffffff'} 
                    onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })} 
                    className="w-full h-8 bg-transparent cursor-pointer border-0 p-0" 
                  />
                </div>
              )}

              {/* TAMANHO DA FONTE */}
              {(selectedElement.type === 'text' || selectedElement.type === 'sticker') && (
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex justify-between">
                    <span>Dimensão</span>
                    <span className="text-indigo-400">{selectedElement.fontSize}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="220" 
                    value={selectedElement.fontSize || 30} 
                    onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })} 
                    className="w-full accent-indigo-500 h-1 rounded" 
                  />
                </div>
              )}

              {/* LARGURA E ALTURA PARA FORMAS */}
              {selectedElement.type === 'shape' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Comprimento</label>
                    <input 
                      type="number" 
                      value={selectedElement.width || 100} 
                      onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white text-center focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Altura</label>
                    <input 
                      type="number" 
                      value={selectedElement.height || 100} 
                      onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white text-center focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* TRANSPARÊNCIA (OPACIDADE) */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex justify-between">
                  <span>Opacidade</span>
                  <span className="text-indigo-400">{selectedElement.opacity !== undefined ? selectedElement.opacity : 100}%</span>
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  value={selectedElement.opacity !== undefined ? selectedElement.opacity : 100} 
                  onChange={(e) => updateElement(selectedElement.id, { opacity: parseInt(e.target.value) })} 
                  className="w-full accent-indigo-500 h-1 rounded" 
                />
              </div>

              {/* ROTAÇÃO DO ELEMENTO (ÂNGULO DE ATÉ 360 GRAUS) */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex justify-between">
                  <span>Girar Ângulo</span>
                  <span className="text-indigo-400">{selectedElement.rotation || 0}°</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  value={selectedElement.rotation || 0} 
                  onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })} 
                  className="w-full accent-indigo-500 h-1 rounded" 
                />
              </div>

              {/* ALINHAMENTOS E STYLES EXTRA PARA TEXTO */}
              {selectedElement.type === 'text' && (
                <>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Estilos Tipográficos</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => updateElement(selectedElement.id, { bold: !selectedElement.bold, fontWeight: selectedElement.bold ? 400 : 900 })}
                        className={`p-2.5 rounded-xl text-xs font-black border transition-all ${selectedElement.bold ? 'bg-indigo-900/40 border-indigo-500 text-white shadow' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                        title="Negrito"
                      >
                        <Bold size={14} className="mx-auto"/>
                      </button>
                      <button 
                        onClick={() => updateElement(selectedElement.id, { italic: !selectedElement.italic })}
                        className={`p-2.5 rounded-xl text-xs font-black border transition-all ${selectedElement.italic ? 'bg-indigo-900/40 border-indigo-500 text-white shadow' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                        title="Itálico"
                      >
                        <Italic size={14} className="mx-auto" />
                      </button>
                      <button 
                        onClick={() => updateElement(selectedElement.id, { underline: !selectedElement.underline })}
                        className={`p-2.5 rounded-xl text-xs font-black border transition-all ${selectedElement.underline ? 'bg-indigo-900/40 border-indigo-500 text-white shadow' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                        title="Sublinhado"
                      >
                        <Underline size={14} className="mx-auto" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Alinhamento</label>
                    <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
                      {(['left', 'center', 'right'] as const).map(align => (
                        <button 
                          key={align} 
                          onClick={() => updateElement(selectedElement.id, { textAlign: align })} 
                          className={`flex-1 py-1.5 rounded-lg flex justify-center transition-colors ${selectedElement.textAlign === align ? 'bg-slate-800 shadow-sm text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {align === 'left' && <AlignLeft size={16}/>}
                          {align === 'center' && <AlignCenter size={16}/>}
                          {align === 'right' && <AlignRight size={16}/>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex justify-between">
                      <span>Rastreamento (Letras)</span>
                      <span className="text-indigo-400">{selectedElement.letterSpacing}px</span>
                    </label>
                    <input 
                      type="range" 
                      min="-5" 
                      max="40" 
                      value={selectedElement.letterSpacing || 0} 
                      onChange={(e) => updateElement(selectedElement.id, { letterSpacing: parseInt(e.target.value) })} 
                      className="w-full accent-indigo-500 h-1 rounded" 
                    />
                  </div>

                  {/* AJUSTES COMPLETOS DE SOMBRA DO TEXTO */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sombra Projetada</label>
                      <button 
                        onClick={() => updateElement(selectedElement.id, { shadow: !selectedElement.shadow })}
                        className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded ${selectedElement.shadow ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}
                      >
                        {selectedElement.shadow ? 'Ativo' : 'Inativo'}
                      </button>
                    </div>

                    {selectedElement.shadow && (
                      <div className="space-y-2 bg-slate-900 border border-slate-800 rounded-xl p-3">
                        <div>
                          <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase mb-1">
                            <span>Desvanecer Blur</span> <span>{selectedElement.shadowBlur || 0}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="2" 
                            max="30" 
                            value={selectedElement.shadowBlur || 10} 
                            onChange={(e) => updateElement(selectedElement.id, { shadowBlur: parseInt(e.target.value) })} 
                            className="w-full accent-indigo-500 h-1" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Eixo X: {selectedElement.shadowOffsetX || 0}px</span>
                            <input 
                              type="range" 
                              min="-15" 
                              max="15" 
                              value={selectedElement.shadowOffsetX || 0} 
                              onChange={(e) => updateElement(selectedElement.id, { shadowOffsetX: parseInt(e.target.value) })} 
                              className="w-full accent-indigo-500 h-1" 
                            />
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Eixo Y: {selectedElement.shadowOffsetY || 0}px</span>
                            <input 
                              type="range" 
                              min="-15" 
                              max="15" 
                              value={selectedElement.shadowOffsetY || 4} 
                              onChange={(e) => updateElement(selectedElement.id, { shadowOffsetY: parseInt(e.target.value) })} 
                              className="w-full accent-indigo-500 h-1" 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-slate-850 flex gap-2">
                <Button onClick={() => duplicateElement(selectedElement.id)} variant="ghost" className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs py-2.5 leading-none">
                  Duplicar
                </Button>
                <Button onClick={() => deleteElement(selectedElement.id)} variant="ghost" className="flex-1 bg-rose-950/20 border border-rose-900/30 text-rose-400 hover:text-white rounded-xl text-xs py-2.5 leading-none">
                  Excluir
                </Button>
              </div>

            </div>
          ) : (
            <div className="p-5 flex flex-col items-center justify-center text-center h-full opacity-60">
              <Compass size={40} className="mb-4 text-indigo-400 animate-bounce"/>
              <h4 className="font-extrabold text-white text-xs uppercase tracking-widest leading-none mb-2">Editor Vazio</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">Toque em qualquer camada de texto ou forma na prancheta para calibrar suas características particulares no painel de comando lateral.</p>
            </div>
          )}
        </div>

      </div>

      {/* =========================================================================
                     MODAIS ENVIAR EMAIL E PUSH NOTIFICACAO TRABALHO
         ========================================================================= */}
      
      {/* MODAL EMAIL DISPAROS */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-900">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Mail size={20} className="text-pink-500"/>
                Enviar Arte Oficial por E-Mail
              </h3>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XComp size={18}/>
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">E-mail de Destino</label>
                <input 
                  type="email" 
                  required
                  placeholder="exemplo@gmail.com ou busque membro..." 
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                
                {/* AUTOCOMPLETE RÁPIDO MEMBRO */}
                <div className="mt-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">E-mails Rápidos cadastrados na Igreja:</span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1">
                    {db.membros?.filter((m: any) => m.email).slice(0, 5).map((m: any) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setEmailTo(m.email);
                          setEmailToName(m.nome || '');
                          setEmailSubject(`Arte Oficial da Igreja GIPP - ${projectName}`);
                        }}
                        className="text-[9px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-indigo-600 border border-slate-200 rounded-lg px-2 py-1 block text-left"
                      >
                        {m.nome?.split(' ')[0]} ({m.email?.substring(0, 15)}...)
                      </button>
                    ))}
                    {(!db.membros || db.membros.length === 0) && (
                      <span className="text-[10px] text-slate-400 italic">Nenhum membro cadastrado com email.</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Assunto</label>
                <input 
                  type="text" 
                  placeholder="Ex: Convite Especial Culto de Domingo!" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Mensagem Explicativa</label>
                <textarea 
                  placeholder="Corpo da mensagem do e-mail..." 
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[90px] resize-y"
                />
              </div>

              <div className="bg-pink-50/80 border border-pink-100 rounded-2xl p-4 flex gap-3 text-pink-700 text-xs font-semibold leading-relaxed">
                <div>✨</div>
                <div>A arte atual que você projetou no Estúdio de Criação será renderizada em altíssima resolução e enviada incorporada diretamente no corpo deste e-mail com visual perfeito.</div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsEmailModalOpen(false)} variant="ghost" className="border border-slate-200 text-slate-500 py-3 rounded-xl font-bold">Cancelar</Button>
                <button type="submit" disabled={sendingEmail} className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-md">
                  {sendingEmail ? 'Disparando...' : 'Enviar Mail Agora'}
                  <SendIconComp size={12}/>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PUSH NOTIFICAÇÃO */}
      {isPushModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-900">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Bell size={20} className="text-yellow-500"/>
                Enviar Aviso / Push no Portal de Membros
              </h3>
              <button onClick={() => setIsPushModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XComp size={18}/>
              </button>
            </div>

            <form onSubmit={handleSendPush} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Título do Alerta</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Não perca a Santa Ceia deste Domingo!" 
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Aviso e Contexto</label>
                <textarea 
                  required
                  placeholder="Corpo descritivo detalhado do comunicado de aviso que aparecerá..." 
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[90px] resize-y"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Canal / Segmento Alvo</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:outline-none cursor-pointer focus:border-indigo-500"
                  value={pushTarget}
                  onChange={(e) => setPushTarget(e.target.value)}
                >
                  <option value="todos">Toda a Igreja (Membros cadastrados)</option>
                  <option value="obreiros">Somente Ministerial / Obreiros</option>
                  <option value="jovens">Mocidade / Jovens da UFAD</option>
                  <option value="senhoras">Círculo de Mulheres / Senhoras</option>
                </select>
              </div>

              <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800 text-xs font-semibold leading-relaxed">
                <div>⚠️</div>
                <div>Os avisos disparados aparecem instantaneamente para os membros conectados no Portal Mobile de Membros de forma destacada e alerta real no sininho do cabeçalho.</div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <Button type="button" onClick={() => setIsPushModalOpen(false)} variant="ghost" className="border border-slate-200 text-slate-500 py-3 rounded-xl font-bold">Cancelar</Button>
                <button type="submit" disabled={sendingPush} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-md">
                  {sendingPush ? 'Transmitindo...' : 'Disparar Push Agora'}
                  <SendIconComp size={12}/>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// --- ICONES COMPONENTIZAÇÃO DE PRECAUÇÃO TSX ---
const PaletteComp = ({ size }: { size: number }) => <LayoutTemplate size={size} />;
const RotateCcwComp = ({ size, className }: { size: number; className?: string }) => <RefreshCw size={size} className={className} />;
const RotateCwComp = ({ size, className }: { size: number; className?: string }) => <RefreshCw size={size} className={`${className} transform rotate-180`} />;
const XComp = ({ size }: { size: number }) => <Inbox size={size} />;
const SendIconComp = ({ size }: { size: number }) => <Send size={size} />;

export const GALLERY_WALLPAPERS = [
  { name: 'Sem Papel de Parede', value: null, thumb: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=10&w=200&auto=format&fit=crop' },
  { name: 'macOS 26 Tahoe (Oficial)', value: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?q=80&w=1400&auto=format&fit=crop', thumb: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?q=40&w=300&auto=format&fit=crop' },
  { name: 'Cristal Líquido (Suave)', value: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1400&auto=format&fit=crop', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=40&w=300&auto=format&fit=crop' },
  { name: 'Aurora Digital (Sleek)', value: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1400&auto=format&fit=crop', thumb: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=40&w=300&auto=format&fit=crop' },
  { name: 'Gradiente de Seda (Calmo)', value: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1400&auto=format&fit=crop', thumb: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=40&w=300&auto=format&fit=crop' },
  { name: 'Flow Holotrópico (Futurista)', value: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1400&auto=format&fit=crop', thumb: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=40&w=300&auto=format&fit=crop' },
  { name: 'Espectro Radiante (Sutil)', value: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1400&auto=format&fit=crop', thumb: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=40&w=300&auto=format&fit=crop' },
  { name: 'Cosmos Minimalista (Escuro)', value: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1400&auto=format&fit=crop', thumb: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=40&w=300&auto=format&fit=crop' },
];

export const ANIMATION_OPTIONS = [
  { id: 'auto', name: 'Automático (Tema)', icon: RefreshCw, desc: 'Adapta-se ao estilo clássico, moderno ou escuro de acordo com o tema selecionado.' },
  { id: 'none', name: 'Nenhuma (Estático)', icon: Compass, desc: 'Para computadores mais lentos ou maior foco. Desativa todas as movimentações.' },
  { id: 'aurora', name: 'Aurora Boreal Fluida', icon: Sparkle, desc: 'Grandes bolhas coloridas brilhantes de movimentação orgânica contínua.' },
  { id: 'winxp', name: 'XP Bliss (Nuvens reais)', icon: Smile, desc: 'Brilho solar, nuvens que cruzam o monitor e borboletas flutuantes na tela.' },
  { id: 'win95', name: 'Windows 95 Starfield', icon: Sparkle, desc: 'Estrelas clássicas e logotipos voadores de velocidade hipersônica retrô.' },
  { id: 'premium_black', name: 'Brilho Dourado (Premium)', icon: Sparkle, desc: 'Moderna e sofisticada pulsação de luz dourada indireta excelente para salas escuras.' },
  { id: 'stars', name: 'Chuva de Estrelas Prateadas', icon: Star, desc: 'Animação de céu limpo com micro estrelas que brilham em ritmos alternados.' },
];

export default ModuleRedeSocial;
