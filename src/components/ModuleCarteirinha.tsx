import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toPng, toJpeg } from 'html-to-image';
import { 
  IdCard, Maximize, Minimize, Plus, Minus, Download, Share2, Trash2, Printer,
  Type as TypeIcon, Layers, Image as ImageIcon, Eye, EyeOff, Sparkles,
  FileText, RotateCcw, RotateCw, Smartphone, MonitorPlay, CheckCircle, Trash, Bold, Italic, Lock, Unlock, Phone, AlignLeft,
  AlignCenter, AlignRight, Shapes, Mail, Bell, FileDown, Search, Check, Crown, Star,
  User, Users, Save, QrCode, Sliders, ArrowUp, ArrowDown, Copy, Sun, Moon
} from 'lucide-react';

import { 
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, 
  setDoc, onSnapshot, query, writeBatch, where, getDocs
} from 'firebase/firestore';

import {
  ChurchContext, Button, FormInput, FormSelect,
  copyToClipboard, playNotificationSound, getTodayDate
} from '../App';

// Preset credentials and designs
const PRESET_TEMPLATES = [
  {
    id: 'pastor_gold',
    name: 'Credencial Ministerial (Ouro Real)',
    orientation: 'horizontal',
    bgColor: '#1e1b4b',
    bgImage: null as string | null,
    fields: [
      { id: 'logo', type: 'sticker', label: 'Emblema Coroa', x: 50, y: 16, size: 40, color: '#fbbf24', visible: true, content: '👑', rotation: 0 },
      { id: 'igreja', type: 'text', label: 'Nome da Igreja', x: 50, y: 28, size: 14, color: '#fbbf24', bold: true, visible: true, fontFamily: 'Outfit', alignment: 'center' },
      { id: 'lbl_titulo', type: 'text', label: 'Título Principal', x: 50, y: 36, size: 11, color: '#ffffff', bold: true, visible: true, fontFamily: 'Plus Jakarta Sans', alignment: 'center' },
      { id: 'foto', type: 'image', label: 'Foto do Ministro', x: 18, y: 68, w: 14, h: 22, visible: true },
      { id: 'nome', type: 'text', label: 'Nome Integrante', x: 34, y: 50, size: 20, color: '#ffffff', bold: true, visible: true, fontFamily: 'Outfit', alignment: 'left' },
      { id: 'cargo', type: 'text', label: 'Cargo do Ministro', x: 34, y: 59, size: 12, color: '#fbbf24', bold: true, visible: true, fontFamily: 'Plus Jakarta Sans', alignment: 'left' },
      { id: 'registro', type: 'text', label: 'Registro ID', x: 34, y: 69, size: 10, color: '#94a3b8', bold: false, visible: true, fontFamily: 'JetBrains Mono', alignment: 'left' },
      { id: 'cpf', type: 'text', label: 'CPF', x: 34, y: 77, size: 10, color: '#cbd5e1', bold: false, visible: true, fontFamily: 'JetBrains Mono', alignment: 'left' },
      { id: 'qr', type: 'qr', label: 'QR Code Segurança', x: 84, y: 68, w: 12, h: 12, visible: true }
    ]
  },
  {
    id: 'diacono_emerald',
    name: 'Membro e Oficiais (Esmeralda)',
    orientation: 'horizontal',
    bgColor: '#022c22',
    bgImage: null as string | null,
    fields: [
      { id: 'logo', type: 'sticker', label: 'Emblema Pomba', x: 50, y: 15, size: 36, color: '#10b981', visible: true, content: '🕊️', rotation: 0 },
      { id: 'igreja', type: 'text', label: 'Nome da Igreja', x: 50, y: 27, size: 14, color: '#6ee7b7', bold: true, visible: true, fontFamily: 'Outfit', alignment: 'center' },
      { id: 'lbl_titulo', type: 'text', label: 'Título', x: 50, y: 35, size: 10, color: '#ffffff', bold: true, visible: true, fontFamily: 'Plus Jakarta Sans', alignment: 'center' },
      { id: 'foto', type: 'image', label: 'Foto', x: 18, y: 68, w: 14, h: 22, visible: true },
      { id: 'nome', type: 'text', label: 'Nome', x: 34, y: 50, size: 18, color: '#ffffff', bold: true, visible: true, fontFamily: 'Outfit', alignment: 'left' },
      { id: 'cargo', type: 'text', label: 'Cargo', x: 34, y: 59, size: 12, color: '#34d399', bold: true, visible: true, fontFamily: 'Plus Jakarta Sans', alignment: 'left' },
      { id: 'cpf', type: 'text', label: 'CPF', x: 34, y: 72, size: 10, color: '#cbd5e1', bold: false, visible: true, fontFamily: 'JetBrains Mono', alignment: 'left' },
      { id: 'qr', type: 'qr', label: 'QR Code', x: 84, y: 68, w: 12, h: 12, visible: true }
    ]
  },
  {
    id: 'membro_vertical',
    name: 'Identificação Eclesiástica (Retrato)',
    orientation: 'vertical',
    bgColor: '#0f172a',
    bgImage: null as string | null,
    fields: [
      { id: 'logo', type: 'sticker', label: 'Emblema Cruz', x: 50, y: 12, size: 40, color: '#38bdf8', visible: true, content: '✝️', rotation: 0 },
      { id: 'igreja', type: 'text', label: 'Assembleia de Deus', x: 50, y: 22, size: 15, color: '#ffffff', bold: true, visible: true, fontFamily: 'Outfit', alignment: 'center' },
      { id: 'foto', type: 'image', label: 'Foto Perfil', x: 50, y: 44, w: 26, h: 24, visible: true },
      { id: 'nome', type: 'text', label: 'Nome', x: 50, y: 62, size: 18, color: '#ffffff', bold: true, visible: true, fontFamily: 'Outfit', alignment: 'center' },
      { id: 'cargo', type: 'text', label: 'Cargo', x: 50, y: 69, size: 11, color: '#fbbf24', bold: true, visible: true, fontFamily: 'Plus Jakarta Sans', alignment: 'center' },
      { id: 'registro', type: 'text', label: 'RE', x: 50, y: 75, size: 10, color: '#94a3b8', bold: false, visible: true, fontFamily: 'JetBrains Mono', alignment: 'center' },
      { id: 'qr', type: 'qr', label: 'QR Código', x: 50, y: 86, w: 15, h: 11, visible: true }
    ]
  }
];

const PRESET_COLORS = [
  '#0f172a', '#1e1b4b', '#022c22', '#450a0a', '#1e3a8a', '#581c87', '#312e81', '#1e293b',
  '#111827', '#ffffff', '#ffd700', '#2563eb', '#16a34a', '#dc2626', '#db2777', '#f59e0b'
];

const STICKERS = [
  { id: 'cross', label: 'Cruz', icon: '✝️' },
  { id: 'bible', label: 'Bíblia', icon: '📖' },
  { id: 'dove', label: 'Pomba', icon: '🕊️' },
  { id: 'fire', label: 'Fogo', icon: '🔥' },
  { id: 'sparkles', label: 'Brilho', icon: '✨' },
  { id: 'crown', label: 'Coroa', icon: '👑' },
  { id: 'praise', label: 'Louvor', icon: '🙌' },
  { id: 'wheat', label: 'Trigo', icon: '🌾' }
];

const SHAPES = [
  { id: 'rect', label: 'Retângulo', icon: '⬛' },
  { id: 'circle', label: 'Círculo', icon: '⚪' }
];

interface FieldState {
  id: string;
  type: 'text' | 'image' | 'qr' | 'shape' | 'sticker';
  label: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  w?: number; // width percentage (used for images, qr, shapes)
  h?: number; // height percentage
  color?: string;
  size?: number;
  bold?: boolean;
  italic?: boolean;
  visible: boolean;
  fontFamily?: string;
  alignment?: 'left' | 'center' | 'right';
  content?: string; // used for custom text/stickers
  rotation?: number; // 0-360
  opacity?: number; // 0-100
  locked?: boolean;
}

const ModuleCarteirinha = () => {
  const { db, setDoc, doc, dbFirestore, appId, addToast, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext);
  
  // High-level controls
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [activeTab, setActiveTab] = useState<'editor' | 'batch_print' | 'projects'>('editor');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(0.85);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  // Loaded/Created Project config
  const [projectName, setProjectName] = useState('Modelo Padrão de Carteirinha');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [layout, setLayout] = useState<{
    bg: string;
    bgImage: string | null;
    fields: FieldState[];
  }>(() => {
    const custom = db.igreja?.carteirinha_custom;
    if (custom && custom.fields) {
      return {
        bg: custom.bg || '#0f172a',
        bgImage: custom.bgImage || null,
        fields: custom.fields
      };
    }
    return {
      bg: '#0f172a',
      bgImage: null,
      fields: PRESET_TEMPLATES[0].fields as FieldState[]
    };
  });

  // History for Undo/Redo
  const [history, setHistory] = useState<{ bg: string; bgImage: string | null; fields: FieldState[] }[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);

  // Active member for Live View/Preview rendering
  const [previewMemberId, setPreviewMemberId] = useState<string>('');
  const [printQueue, setPrintQueue] = useState<string[]>([]);

  // Modais de compartilhamento
  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);
  const [isSendPushOpen, setIsSendPushOpen] = useState(false);
  const [sharingBase64, setSharingBase64] = useState<string | null>(null);

  // Formulários de Compartilhamento
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('Sua Nova Credencial Digital');
  const [emailBody, setEmailBody] = useState('Olá! Em anexo está a sua credencial eclesiástica oficial gerada através do sistema.');
  const [pushTitle, setPushTitle] = useState('Sua Credencial Está Pronta!');
  const [pushBody, setPushBody] = useState('Acesse o portal de membros para conferir sua nova carteira digital oficial.');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingPush, setSendingPush] = useState(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize history
  useEffect(() => {
    setHistory([{ bg: layout.bg, bgImage: layout.bgImage, fields: JSON.parse(JSON.stringify(layout.fields)) }]);
    setHistoryPointer(0);
  }, []);

  const saveHistoryState = (nextFields: FieldState[], nextBg = layout.bg, nextBgImage = layout.bgImage) => {
    const nextHist = history.slice(0, historyPointer + 1);
    nextHist.push({ bg: nextBg, bgImage: nextBgImage, fields: JSON.parse(JSON.stringify(nextFields)) });
    if (nextHist.length > 20) nextHist.shift();
    setHistory(nextHist);
    setHistoryPointer(nextHist.length - 1);
  };

  const undo = () => {
    if (historyPointer > 0) {
      const prev = history[historyPointer - 1];
      setLayout({ bg: prev.bg, bgImage: prev.bgImage, fields: JSON.parse(JSON.stringify(prev.fields)) });
      setHistoryPointer(historyPointer - 1);
      setSelectedFieldId(null);
      addToast("Ação desfeita", "info");
    }
  };

  const redo = () => {
    if (historyPointer < history.length - 1) {
      const next = history[historyPointer + 1];
      setLayout({ bg: next.bg, bgImage: next.bgImage, fields: JSON.parse(JSON.stringify(next.fields)) });
      setHistoryPointer(historyPointer + 1);
      setSelectedFieldId(null);
      addToast("Ação refeita", "info");
    }
  };

  // Switch size/aspect and autofit
  const handleOrientationChange = (orient: 'horizontal' | 'vertical') => {
    setOrientation(orient);
    addToast(`Orientação alterada para ${orient === 'horizontal' ? 'Paisagem' : 'Retrato'}`, "info");
  };

  // Get active preview member object
  const activeMemberObj = useMemo(() => {
    const list = db.membros || [];
    if (previewMemberId) {
      return list.find((m: any) => m.id === previewMemberId) || null;
    }
    return list[0] || null;
  }, [db.membros, previewMemberId]);

  // Helper replacing dynamic tags
  const renderDynamicText = (field: FieldState) => {
    let base = field.content || '';
    if (field.id === 'nome') base = '{{NOME}}';
    if (field.id === 'cargo') base = '{{CARGO}}';
    if (field.id === 'cpf') base = '{{CPF}}';
    if (field.id === 'registro') base = '{{REGISTRO}}';
    if (field.id === 'igreja') base = '{{IGREJA}}';

    if (!activeMemberObj) {
      return base
        .replace(/\{\{NOME\}\}/g, 'NOME DO MEMBRO')
        .replace(/\{\{CARGO\}\}/g, 'PRESÍBTERO / COOPERADOR')
        .replace(/\{\{IGREJA\}\}/g, db.igreja?.nome || 'ASSEMBLEIA DE DEUS')
        .replace(/\{\{CPF\}\}/g, '000.000.000-00')
        .replace(/\{\{REGISTRO\}\}/g, 'REG-2026');
    }

    return base
      .replace(/\{\{NOME\}\}/g, activeMemberObj.nome || 'MEMBRO SEM NOME')
      .replace(/\{\{CARGO\}\}/g, activeMemberObj.cargo || 'MEMBRO')
      .replace(/\{\{IGREJA\}\}/g, db.igreja?.nome || 'ASSEMBLEIA DE DEUS')
      .replace(/\{\{CPF\}\}/g, activeMemberObj.cpf || '000.000.000-00')
      .replace(/\{\{REGISTRO\}\}/g, activeMemberObj.registro || activeMemberObj.id || 'N/A');
  };

  // Drag handles
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const field = layout.fields.find(f => f.id === id);
    if (!field || field.locked) return;
    e.stopPropagation();
    setSelectedFieldId(id);
    setDraggingField(id);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      setDragOffset({ x: xPct - field.x, y: yPct - field.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingField || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let newX = ((e.clientX - rect.left) / rect.width) * 100 - dragOffset.x;
    let newY = ((e.clientY - rect.top) / rect.height) * 100 - dragOffset.y;

    newX = Math.round(Math.max(0, Math.min(100, newX)));
    newY = Math.round(Math.max(0, Math.min(100, newY)));

    setLayout(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === draggingField ? { ...f, x: newX, y: newY } : f)
    }));
  };

  const handleMouseUp = () => {
    if (draggingField) {
      setDraggingField(null);
      saveHistoryState(layout.fields);
    }
  };

  const updateFieldProperty = (id: string, prop: keyof FieldState, value: any) => {
    const nextFields = layout.fields.map(f => f.id === id ? { ...f, [prop]: value } : f);
    setLayout(prev => ({ ...prev, fields: nextFields }));
    saveHistoryState(nextFields);
  };

  const addField = (type: 'text' | 'shape' | 'sticker') => {
    const newId = `custom_${Date.now()}`;
    let newField: FieldState = {
      id: newId,
      type,
      label: type === 'text' ? 'Novo Texto' : type === 'shape' ? 'Nova Forma' : 'Símbolo Coroa',
      x: 50,
      y: 50,
      visible: true,
      color: '#ffffff',
      rotation: 0,
      opacity: 100,
      fontFamily: 'Inter',
      alignment: 'center'
    };

    if (type === 'text') {
      newField.content = 'TEXTO EDITÁVEL';
      newField.size = 14;
      newField.bold = true;
    } else if (type === 'shape') {
      newField.w = 20;
      newField.h = 10;
      newField.color = '#3b82f6';
      newField.content = 'rect'; // rect or circle
    } else if (type === 'sticker') {
      newField.content = '👑';
      newField.size = 36;
    }

    const nextFields = [...layout.fields, newField];
    setLayout(prev => ({ ...prev, fields: nextFields }));
    saveHistoryState(nextFields);
    setSelectedFieldId(newId);
    addToast("Elemento inserido à prancheta", "success");
  };

  const duplicateField = (id: string) => {
    const existing = layout.fields.find(f => f.id === id);
    if (existing) {
      const copy: FieldState = {
        ...JSON.parse(JSON.stringify(existing)),
        id: `dup_${Date.now()}`,
        x: Math.min(95, existing.x + 4),
        y: Math.min(95, existing.y + 4)
      };
      const nextFields = [...layout.fields, copy];
      setLayout(prev => ({ ...prev, fields: nextFields }));
      saveHistoryState(nextFields);
      setSelectedFieldId(copy.id);
      addToast("Camada clonada com sucesso!", "success");
    }
  };

  const deleteField = (id: string) => {
    if (['foto', 'nome', 'cargo', 'igreja', 'qr'].includes(id)) {
      return addToast("Este é um campo essencial do sistema e não pode ser deletado, apenas ocultado.", "warning");
    }
    const nextFields = layout.fields.filter(f => f.id !== id);
    setLayout(prev => ({ ...prev, fields: nextFields }));
    saveHistoryState(nextFields);
    setSelectedFieldId(null);
    addToast("Elemento removido", "info");
  };

  const reorderField = (id: string, direction: 'up' | 'down') => {
    const idx = layout.fields.findIndex(f => f.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= layout.fields.length) return;

    const nextFields = [...layout.fields];
    const prev = nextFields[idx];
    nextFields[idx] = nextFields[targetIdx];
    nextFields[targetIdx] = prev;

    setLayout(prevLayout => ({ ...prevLayout, fields: nextFields }));
    saveHistoryState(nextFields);
  };

  // Upload BG Action
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const nextBgImg = reader.result as string;
        setLayout(prev => ({ ...prev, bgImage: nextBgImg }));
        saveHistoryState(layout.fields, layout.bg, nextBgImg);
        addToast("Fundo importado!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear BG Image
  const clearBgImage = () => {
    setLayout(prev => ({ ...prev, bgImage: null }));
    saveHistoryState(layout.fields, layout.bg, null);
    addToast("Fundo redefinido para cor sólida", "info");
  };

  // Save layout permanently to Firestore
  const handleSaveModel = async () => {
    try {
      if (dbFirestore && appId) {
        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { 
          carteirinha_custom: { ...layout, orientation, name: projectName }
        }, { merge: true });
        addToast("Modelo de credencial atualizado para toda a congregação!", "success");
      } else {
        localStorage.setItem('gipp_custom_carteirinha', JSON.stringify({ ...layout, orientation, name: projectName }));
        addToast("Salvo localmente (sem Firebase)", "info");
      }
    } catch (e) {
      console.error(e);
      addToast("Falha técnica ao gravar modelo.", "error");
    }
  };

  // Exporters high quality
  const generatePngURL = async (): Promise<string | null> => {
    if (!canvasRef.current) return null;
    const prevSelected = selectedFieldId;
    setSelectedFieldId(null);
    await new Promise(r => setTimeout(r, 200));

    try {
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 2.2,
        cacheBust: true,
        backgroundColor: layout.bg
      });
      setSelectedFieldId(prevSelected);
      return dataUrl;
    } catch (e) {
      console.error(e);
      setSelectedFieldId(prevSelected);
      return null;
    }
  };

  const saveToLocalFiles = async () => {
    addToast("Compilando imagem ultrarresolução...", "info");
    const url = await generatePngURL();
    if (url) {
      const link = document.createElement('a');
      link.download = `Credencial_${activeMemberObj?.nome || 'membro'}.png`;
      link.href = url;
      link.click();
      addToast("Download concluído com sucesso!", "success");
    }
  };

  const handleWhatsApp = async () => {
    addToast("Gerando arquivo para WhatsApp...", "info");
    const url = await generatePngURL();
    if (!url) return;

    // Disparar download da imagem
    const link = document.createElement('a');
    link.download = `Credencial_${activeMemberObj?.nome || 'membro'}.png`;
    link.href = url;
    link.click();

    const text = `Prezado(a) *${activeMemberObj?.nome || 'Membro'}*, segue anexa a sua nova *Credencial de Identidade Eclesiástica Digital* gerada no portal da nossa amada igreja. Favor salvar em seu aparelho!`;
    copyToClipboard(text);

    setTimeout(() => {
      window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      addToast("Texto copiado! Selecione o contato na aba do WhatsApp aberta.", "success");
    }, 1200);
  };

  const openEmailModal = async () => {
    addToast("Renderizando credencial para anexo...", "info");
    const base64 = await generatePngURL();
    if (base64) {
      setSharingBase64(base64);
      setEmailTo(activeMemberObj?.email || '');
      setIsSendEmailOpen(true);
    }
  };

  const sendEmailReal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo) return addToast("Preencha o e-mail de destino", "warning");
    setSendingEmail(true);

    try {
      const emailDoc = {
        appId: appId || 'system',
        to: emailTo,
        toName: activeMemberObj?.nome || 'Integrante',
        subject: emailSubject,
        body: `${emailBody}\n\n[Credencial Eclesiástica Gerada Online]`,
        imageUrl: sharingBase64?.substring(0, 150000), // optimized base64
        sentAt: new Date().toISOString()
      };

      if (dbFirestore && appId) {
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'emails'), emailDoc);
        addToast("E-mail com credencial disparado e gravado!", "success");
        setIsSendEmailOpen(false);
      }
    } catch (e) {
      console.error(e);
      addToast("Falha no envio de email", "error");
    } finally {
      setSendingEmail(false);
    }
  };

  const openPushModal = () => {
    setPushTitle(`Sua Credencial de ${activeMemberObj?.cargo || 'Membro'} Está Pronta!`);
    setIsSendPushOpen(true);
  };

  const sendPushReal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingPush(true);

    try {
      const pushDoc = {
        titulo: pushTitle,
        mensagem: pushBody,
        data: getTodayDate(),
        categoria: 'aviso',
        targetAudience: activeMemberObj?.id ? activeMemberObj.id : 'todos',
        createdAt: new Date().toISOString()
      };

      if (dbFirestore && appId) {
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'notificacoes'), pushDoc);
        addToast("Aviso por push enviado com sucesso no portal!", "success");
        setIsSendPushOpen(false);
      }
    } catch (e) {
      console.error(e);
      addToast("Erro e falha de banco", "error");
    } finally {
      setSendingPush(false);
    }
  };

  // Print queue selection helper
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setPrintQueue((db.membros || []).map((m: any) => m.id));
    } else {
      setPrintQueue([]);
    }
  };

  const handleToggleQueue = (id: string) => {
    setPrintQueue(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Print sheets
  const triggerBatchPrint = () => {
    if (printQueue.length === 0) return addToast("Selecione ao menos um membro para imprimir.", "warning");
    addToast("Abrindo prancha de impressão comercial...", "info");

    const queueMembers = (db.membros || []).filter((m: any) => printQueue.includes(m.id));

    // Prepare full data payload matching mode `carteirinha_custom`
    const payload = {
      igreja: {
        ...db.igreja,
        carteirinha_custom: {
          ...layout,
          orientation
        }
      },
      membros: queueMembers
    };

    setPrintData(payload);
    setPrintMode('carteirinha_custom');
    setPreviewOpen(true);
  };

  // Filter members on print table
  const filteredMembersList = useMemo(() => {
    const list = db.membros || [];
    if (!searchQuery.trim()) return list;
    return list.filter((m: any) => 
      (m.nome || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (m.cargo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.cpf || '').includes(searchQuery)
    );
  }, [db.membros, searchQuery]);

  const activeField = layout.fields.find(f => f.id === selectedFieldId);

  return (
    <div className={`flex flex-col ${themeMode === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'} overflow-hidden relative transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-[120] h-screen w-screen rounded-none' : 'h-[85vh] min-h-[650px] rounded-[2.5rem] shadow-2xl'}`}>
      
      {/* 1. TOP CONTROL HEADER BAR */}
      <div className={`h-20 border-b ${themeMode === 'dark' ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'} flex items-center justify-between px-6 shrink-0 z-30 shadow-lg`}>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg animate-pulse">
            <IdCard size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)} 
                className={`bg-transparent font-black ${themeMode === 'dark' ? 'text-white' : 'text-slate-800'} text-sm border-b border-transparent focus:border-indigo-500 outline-none w-52 sm:w-64`}
                placeholder="Nome do Modelo..." 
              />
              <button onClick={handleSaveModel} className="text-emerald-400 hover:text-emerald-300 p-1 rounded bg-emerald-950/40 border border-emerald-900/30" title="Salvar Modelo no Sistema">
                <Save size={14} className="inline mr-1" />
                <span className="text-[10px] uppercase font-black tracking-wider">Salvar</span>
              </button>
            </div>
            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Estúdio Credenciais GIPP VIP Canva-Style</p>
          </div>
        </div>

        {/* UNDO / REDO / ZOOM */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={undo} disabled={historyPointer <= 0} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 disabled:opacity-30" title="Desfazer">
            <RotateCcw size={16}/>
          </button>
          <button onClick={redo} disabled={historyPointer >= history.length - 1} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 disabled:opacity-30" title="Refazer">
            <RotateCw size={16}/>
          </button>

          <div className="h-6 w-px bg-slate-850 mx-1"></div>

          <div className={`flex items-center gap-1.5 ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-200 border-slate-300 text-slate-700'} px-3 py-1.5 rounded-xl border text-xs font-bold font-mono`}>
            <button onClick={() => setZoom(Math.max(0.2, zoom - 0.05))} className="hover:text-indigo-400"><Minus size={14}/></button>
            <span className="w-12 text-center text-[10px]">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={() => setZoom(Math.min(1.6, zoom + 0.05))} className="hover:text-indigo-400"><Plus size={14}/></button>
          </div>
        </div>

        {/* GENERAL ACTIONS BAR */}
        <div className="flex items-center gap-2">
          {/* THEME SELECTOR BUTTON */}
          <button
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            className={`p-3 rounded-xl font-bold transition-all border ${
              themeMode === 'dark'
                ? 'bg-slate-900 hover:bg-slate-850 text-amber-400 border-slate-800'
                : 'bg-slate-200 hover:bg-slate-300 text-amber-600 border-slate-300'
            }`}
            title={themeMode === 'dark' ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
          >
            {themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={`p-3 ${themeMode === 'dark' ? 'bg-slate-900 hover:bg-slate-850 border-slate-800' : 'bg-slate-200 hover:bg-slate-300 border-slate-300'} text-indigo-400 hover:text-indigo-300 rounded-xl font-bold transition-all border`}
            title={isFullScreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          >
            {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          <div className={`flex ${themeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'} p-1 rounded-xl border`}>
            <button onClick={() => setActiveTab('editor')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'editor' ? 'bg-indigo-600 text-white' : themeMode === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-650 hover:text-slate-900'}`}>Design</button>
            <button onClick={() => setActiveTab('batch_print')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'batch_print' ? 'bg-indigo-600 text-white' : themeMode === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-650 hover:text-slate-900'}`}>Fila Impressão ({printQueue.length})</button>
          </div>
        </div>
      </div>

      {/* 2. WORKSPACE CONSOLE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* TAB 1: DESIGNER WORKSPACE */}
        {activeTab === 'editor' && (
          <>
            {/* LEFT BAR: CONTROLS & LAYERS */}
            <div className={`w-72 ${themeMode === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'} border-r flex flex-col shrink-0 overflow-y-auto custom-scrollbar`}>
              <div className={`p-4 border-b ${themeMode === 'dark' ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'} flex items-center justify-between`}>
                <span className={`text-xs font-black uppercase tracking-widest ${themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Elementos & Fundo</span>
                <Sliders size={14} className="text-indigo-400"/>
              </div>

              <div className="p-4 space-y-5">
                {/* PREVIEW MEMBER SELECT */}
                <div>
                  <FormSelect 
                    id="preview_member"
                    label="Visualizar Dados De:"
                    value={previewMemberId}
                    onChange={(val) => {
                      setPreviewMemberId(val);
                      addToast("Dados do membro aplicados no canvas!", "info");
                    }}
                    options={[
                      { value: '', label: 'Membro Demonstrativo' },
                      ...(db.membros || []).map((m: any) => ({ value: m.id, label: `${m.nome} (${m.cargo || 'Membro'})` }))
                    ]}
                  />
                </div>

                {/* TEMPLATE QUICK ACTIONS */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">Modelos Rápidos GIPP</label>
                  <div className="space-y-2">
                    {PRESET_TEMPLATES.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => {
                          setLayout({
                            bg: p.bgColor,
                            bgImage: p.bgImage,
                            fields: p.fields as FieldState[]
                          });
                          setOrientation(p.orientation as 'horizontal' | 'vertical');
                          setSelectedFieldId(null);
                          saveHistoryState(p.fields as FieldState[], p.bgColor, p.bgImage);
                          addToast(`Carregado: ${p.name}`, "success");
                        }}
                        className="w-full text-left p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:border-indigo-500 transition-all flex items-center gap-2"
                      >
                        <Crown size={14} className="text-indigo-400"/>
                        <span className="text-xs font-bold truncate text-slate-200">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ORIENTATION PICKER */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">Formato / Proporção</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleOrientationChange('horizontal')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${orientation === 'horizontal' ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      <MonitorPlay size={16}/> Horizontal
                    </button>
                    <button 
                      onClick={() => handleOrientationChange('vertical')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 ${orientation === 'vertical' ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      <Smartphone size={16}/> Retrato
                    </button>
                  </div>
                </div>

                {/* CANVAS BACKGROUND */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">Fundo Personalizado</label>
                  <div className="space-y-2">
                    <label className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl py-3 cursor-pointer text-xs font-bold text-indigo-400 transition-colors">
                      <ImageIcon size={14}/> Carregar Background
                      <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload}/>
                    </label>
                    {layout.bgImage && (
                      <button onClick={clearBgImage} className="w-full text-[10px] font-bold text-rose-400 uppercase py-1 border border-dashed border-rose-950 bg-rose-950/20 rounded-lg">Limpar Imagem de Fundo</button>
                    )}
                    <div className="grid grid-cols-4 gap-1.5 pt-1.5">
                      {PRESET_COLORS.map(c => (
                        <button 
                          key={c} 
                          onClick={() => {
                            setLayout(prev => ({ ...prev, bg: c }));
                            saveHistoryState(layout.fields, c, layout.bgImage);
                          }}
                          className="h-6 rounded border border-white/10 shadow-inner" 
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* ADD NEW ELEMENTS BAR */}
                <div className="pt-3 border-t border-slate-850">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2.5">Adicionar na Prancheta</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => addField('text')} className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"><TypeIcon size={14}/> Texto</button>
                    <button onClick={() => addField('shape')} className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"><Shapes size={14}/> Retângulo</button>
                  </div>
                  <div className="grid grid-cols-4 gap-1 mt-2">
                    {STICKERS.map(s => (
                      <button key={s.id} onClick={() => {
                        const newId = `stk_${Date.now()}`;
                        const fields = [...layout.fields, {
                          id: newId, type: 'sticker', label: s.label, x: 50, y: 50, visible: true, size: 36, color: '#f59e0b', content: s.icon, rotation: 0
                        } as FieldState];
                        setLayout(p => ({ ...prevLayout => p, fields }));
                        saveHistoryState(fields);
                        setSelectedFieldId(newId);
                      }} className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm" title={s.label}>{s.icon}</button>
                    ))}
                  </div>
                </div>

                {/* LAYERS MANAGER */}
                <div className="pt-4 border-t border-slate-850">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2.5">Camadas de Elementos ({layout.fields.length})</label>
                  <div className="space-y-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
                    {layout.fields.map((f, i) => (
                      <div 
                        key={f.id} 
                        onClick={() => setSelectedFieldId(f.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedFieldId === f.id ? 'bg-indigo-950/60 text-indigo-400 font-bold border border-indigo-900/40' : 'hover:bg-slate-800/50 text-slate-400'}`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] text-slate-600 font-mono">#{i + 1}</span>
                          <span className="text-xs truncate">{f.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); updateFieldProperty(f.id, 'visible', !f.visible); }} className="p-1 rounded hover:bg-slate-700">
                            {f.visible ? <Eye size={12}/> : <EyeOff size={12}/>}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN CANVAS AREA */}
            <div ref={containerRef} className={`flex-1 ${themeMode === 'dark' ? 'bg-slate-950' : 'bg-slate-200/50'} p-6 flex flex-col items-center justify-center overflow-auto relative select-none`}>
              
              <div className="absolute top-4 left-6 text-slate-500 text-[10px] font-sans font-bold uppercase tracking-widest flex items-center gap-2 z-10">
                <Sparkles size={12} className="text-indigo-400"/>
                <span>Membro Selecionado para Preview: {activeMemberObj ? activeMemberObj.nome : 'Nenhum (Visualização Demonstração)'}</span>
              </div>

              {/* FLOATING QUICK EXPORT CONTROLS */}
              <div className={`absolute top-4 right-6 ${themeMode === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'} border p-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl z-20`}>
                <button onClick={saveToLocalFiles} className={`px-3.5 py-2 ${themeMode === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} text-sky-500 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all`}>
                  <Download size={14}/> Baixar PNG
                </button>
                <button onClick={handleWhatsApp} className={`px-3.5 py-2 ${themeMode === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} text-emerald-500 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all`}>
                  <Phone size={14}/> Enviar Whats
                </button>
                <button onClick={openEmailModal} className={`px-3.5 py-2 ${themeMode === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} text-pink-500 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all`}>
                  <Mail size={14}/> Email
                </button>
                <button onClick={openPushModal} className={`px-3.5 py-2 ${themeMode === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} text-yellow-500 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all`}>
                  <Bell size={14}/> Push Portal
                </button>
              </div>

              {/* CANVAS GRAPHICS ENGINE */}
              <div 
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden transition-shadow duration-300 ring-1 ring-slate-800"
                style={{
                  width: orientation === 'horizontal' ? '856px' : '540px',
                  height: orientation === 'horizontal' ? '540px' : '856px',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  backgroundColor: layout.bg,
                  backgroundImage: layout.bgImage ? `url(${layout.bgImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center'
                }}
              >
                {layout.fields.map(f => {
                  if (!f.visible) return null;
                  const isSelected = selectedFieldId === f.id;

                  // Text layers
                  if (f.type === 'text') {
                    const textContent = renderDynamicText(f);
                    return (
                      <div
                        key={f.id}
                        onMouseDown={(e) => handleMouseDown(e, f.id)}
                        className={`absolute select-none whitespace-nowrap cursor-move ${isSelected ? 'ring-2 ring-indigo-500 bg-white/5 backdrop-blur-sm px-1 rounded' : ''}`}
                        style={{
                          left: `${f.x}%`,
                          top: `${f.y}%`,
                          color: f.color || '#ffffff',
                          fontSize: `${f.size ? f.size * 2 : 24}px`,
                          fontWeight: f.bold ? 'bold' : 'normal',
                          fontStyle: f.italic ? 'italic' : 'normal',
                          transform: f.alignment === 'center' ? 'translate(-50%, -50%)' : f.alignment === 'right' ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
                          fontFamily: f.fontFamily || 'sans-serif'
                        }}
                      >
                        {textContent}
                      </div>
                    );
                  }

                  // Emblemas / Stickers
                  if (f.type === 'sticker') {
                    return (
                      <div
                        key={f.id}
                        onMouseDown={(e) => handleMouseDown(e, f.id)}
                        className={`absolute select-none cursor-move flex items-center justify-center ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                        style={{
                          left: `${f.x}%`,
                          top: `${f.y}%`,
                          color: f.color,
                          fontSize: `${f.size ? f.size * 2 : 50}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {f.content}
                      </div>
                    );
                  }

                  // Shapes / Retas
                  if (f.type === 'shape') {
                    return (
                      <div
                        key={f.id}
                        onMouseDown={(e) => handleMouseDown(e, f.id)}
                        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                        style={{
                          left: `${f.x}%`,
                          top: `${f.y}%`,
                          width: `${f.w ? f.w * 10 : 100}px`,
                          height: `${f.h ? f.h * 10 : 40}px`,
                          backgroundColor: f.color,
                          borderRadius: f.content === 'circle' ? '50%' : '8px',
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    );
                  }

                  // Profile Picture
                  if (f.type === 'image') {
                    return (
                      <div
                        key={f.id}
                        onMouseDown={(e) => handleMouseDown(e, f.id)}
                        className={`absolute bg-slate-800 border-4 border-slate-700 overflow-hidden flex flex-col items-center justify-center cursor-move shadow-md ${isSelected ? 'ring-4 ring-indigo-500' : ''}`}
                        style={{
                          left: `${f.x}%`,
                          top: `${f.y}%`,
                          width: `${f.w ? f.w * 10 : 150}px`,
                          height: `${f.h ? f.h * 10 : 190}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {activeMemberObj?.foto || activeMemberObj?.foto_url ? (
                          <img src={activeMemberObj.foto || activeMemberObj.foto_url} alt="Foto" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-500">
                            <User size={36}/>
                            <span className="text-[9px] font-black tracking-widest mt-1">FOTO</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Secure QRCode
                  if (f.type === 'qr') {
                    return (
                      <div
                        key={f.id}
                        onMouseDown={(e) => handleMouseDown(e, f.id)}
                        className={`absolute bg-white p-2 rounded-xl flex items-center justify-center cursor-move shadow-lg border border-slate-100 ${isSelected ? 'ring-4 ring-indigo-500' : ''}`}
                        style={{
                          left: `${f.x}%`,
                          top: `${f.y}%`,
                          width: `${f.w ? f.w * 10 : 100}px`,
                          height: `${f.h ? f.h * 10 : 100}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <QrCode size={52} className="text-slate-900" />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>

              {/* FLOATING ELEMENT PROPERTIES EDITOR */}
              {activeField && (
                <div className="absolute bottom-6 left-6 right-6 bg-slate-950/95 border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-2xl z-20">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{activeField.label}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase py-0.5 px-2 bg-slate-850 rounded">Mover ou Formatar</span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {activeField.type === 'text' && (
                      <>
                        {/* Font family */}
                        <select 
                          value={activeField.fontFamily || 'Inter'}
                          onChange={(e) => updateFieldProperty(activeField.id, 'fontFamily', e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 py-2 px-3 focus:outline-none"
                        >
                          <option value="Inter">Aparência Inter</option>
                          <option value="Outfit">Outfit Sharp</option>
                          <option value="Plus Jakarta Sans">Jakarta Tech</option>
                          <option value="Cinzel">Cinzel Regal</option>
                          <option value="JetBrains Mono">JetBrains Mono</option>
                        </select>

                        {/* Font Size slider */}
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">Tam:</span>
                          <input 
                            type="range" min="8" max="44" 
                            value={activeField.size || 14} 
                            onChange={(e) => updateFieldProperty(activeField.id, 'size', parseInt(e.target.value))} 
                            className="w-24 accent-indigo-500"
                          />
                        </div>

                        {/* Bold / Italic triggers */}
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateFieldProperty(activeField.id, 'bold', !activeField.bold)} className={`p-2 rounded-lg font-bold text-xs border ${activeField.bold ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>B</button>
                          <button onClick={() => updateFieldProperty(activeField.id, 'italic', !activeField.italic)} className={`p-2 rounded-lg italic text-xs border ${activeField.italic ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>I</button>
                        </div>

                        {/* Alignments */}
                        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                          <button onClick={() => updateFieldProperty(activeField.id, 'alignment', 'left')} className={`p-1.5 rounded-lg ${activeField.alignment === 'left' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><AlignLeft size={14}/></button>
                          <button onClick={() => updateFieldProperty(activeField.id, 'alignment', 'center')} className={`p-1.5 rounded-lg ${activeField.alignment === 'center' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><AlignCenter size={14}/></button>
                          <button onClick={() => updateFieldProperty(activeField.id, 'alignment', 'right')} className={`p-1.5 rounded-lg ${activeField.alignment === 'right' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><AlignRight size={14}/></button>
                        </div>
                      </>
                    )}

                    {/* Width & Height for shapes & qr & images */}
                    {['shape', 'image', 'qr'].includes(activeField.type) && (
                      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl py-1 px-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Dimensões:</span>
                        <input 
                          type="range" min="4" max="50" 
                          value={activeField.w || 15} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateFieldProperty(activeField.id, 'w', val);
                            if (activeField.type === 'qr') updateFieldProperty(activeField.id, 'h', val);
                          }} 
                          className="w-32 accent-indigo-500 animate-pulse"
                        />
                      </div>
                    )}

                    {/* Shapes toggle circle vs rect */}
                    {activeField.type === 'shape' && (
                      <select 
                        value={activeField.content || 'rect'}
                        onChange={(e) => updateFieldProperty(activeField.id, 'content', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl text-xs py-1.5 px-3 focus:outline-none"
                      >
                        <option value="rect">Formato Retângulo</option>
                        <option value="circle">Formato Círculo</option>
                      </select>
                    )}

                    {/* Element fill Color Picker */}
                    {['text', 'shape', 'sticker'].includes(activeField.type) && (
                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl py-1 px-2.5">
                        <span className="text-[10px] font-black text-slate-500 uppercase leading-none">Cor:</span>
                        <input 
                          type="color" 
                          value={activeField.color || '#ffffff'} 
                          onChange={(e) => updateFieldProperty(activeField.id, 'color', e.target.value)} 
                          className="h-8 w-11 rounded cursor-pointer border-0 bg-transparent p-0"
                        />
                      </div>
                    )}

                    {/* Operations duplicate, delete */}
                    <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-850">
                      <button onClick={() => reorderField(activeField.id, 'up')} className="p-1.5 rounded-lg text-slate-400 hover:text-white" title="Subir camada"><ArrowUp size={14}/></button>
                      <button onClick={() => reorderField(activeField.id, 'down')} className="p-1.5 rounded-lg text-slate-400 hover:text-white" title="Descer camada"><ArrowDown size={14}/></button>
                      <button onClick={() => duplicateField(activeField.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-emerald-400" title="Duplicar"><Copy size={14}/></button>
                      <button onClick={() => deleteField(activeField.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-rose-400" title="Excluir"><Trash size={14}/></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: BATCH PRINT MANAGER */}
        {activeTab === 'batch_print' && (
          <div className="flex-1 bg-slate-950 p-6 flex flex-col md:flex-row gap-6 text-slate-300 overflow-hidden">
            {/* Control Sidebar for Print Queue */}
            <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 flex flex-col gap-5 text-slate-300">
              <div>
                <h3 className="font-black text-white text-base tracking-widest uppercase mb-1">Painel de Impressão</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">Gerencie a fila de impressão e imprima múltiplas identidades ao mesmo tempo.</p>
              </div>

              <div className="p-4 bg-slate-950 border border-emerald-900/30 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Membros Selecionados:</span>
                  <span className="text-emerald-400 text-sm font-black">{printQueue.length} membros</span>
                </div>
                <Button 
                  onClick={triggerBatchPrint} 
                  variant="success" 
                  disabled={printQueue.length === 0} 
                  className="w-full py-3.5 shadow-lg flex items-center justify-center gap-2 font-black uppercase text-xs"
                >
                  <Printer size={16}/> Imprimir Fila Comercial
                </Button>
              </div>

              {/* Info text */}
              <div className="text-[11px] text-slate-500 space-y-2 border-t border-slate-800 pt-4 leading-relaxed">
                <p>💡 <b>Dica de Ouro GIPP:</b> Ao acionar a impressão, configure o papel do navegador como A4, defina Margens como 'Nenhuma' ou 'Mínima' e desative Cabeçalho e Rodapé para uma folha limpa.</p>
                <p>📋 O layout atual gerará 4 credenciais padrão por folha sulfite ou papel fotográfico de alta densidade.</p>
              </div>
            </div>

            {/* Members Selector list */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[2rem] p-5 flex flex-col overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="relative w-full sm:w-72">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Search size={14}/></span>
                  <input 
                    type="text" 
                    placeholder="Filtrar por nome ou cargo..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleSelectAll(true)}
                    className="text-[10px] font-black text-indigo-400 uppercase tracking-wider bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-900/40 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Selecionar Todos ({db.membros?.length})
                  </button>
                  <button 
                    onClick={() => handleSelectAll(false)}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-950 hover:bg-slate-850 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Limpar Fila
                  </button>
                </div>
              </div>

              {/* Members Grid/List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-800 rounded-2xl bg-slate-950/60 p-2 space-y-1">
                {filteredMembersList.map((m: any) => {
                  const isQueued = printQueue.includes(m.id);
                  return (
                    <div 
                      key={m.id}
                      onClick={() => handleToggleQueue(m.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isQueued ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-transparent hover:bg-slate-850 text-slate-400'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isQueued ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-700 bg-slate-950'}`}>
                          {isQueued && <Check size={10} className="stroke-[4]"/>}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-slate-750 shrink-0 flex items-center justify-center">
                          {m.foto || m.foto_url ? (
                            <img src={m.foto || m.foto_url} alt="" className="w-full h-full object-cover"/>
                          ) : (
                            <User size={16} className="text-slate-500" />
                          )}
                        </div>
                        <div>
                          <span className="block font-black text-slate-200 text-xs">{m.nome}</span>
                          <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider">{m.cargo || 'Membro sem cargo definido'}</span>
                        </div>
                      </div>

                      <div className="text-right text-[10px] font-mono text-slate-500">
                        <span>CPF: {m.cpf || 'Não cadastrado'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAIS DE COMPARTILHAMENTO --- */}
      {isSendEmailOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-entrance">
          <form onSubmit={sendEmailReal} className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl text-slate-300">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <span className="text-sm font-black uppercase text-indigo-400 tracking-wider">Disparar Email Credencial</span>
              <button type="button" onClick={() => setIsSendEmailOpen(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <FormInput id="em_to" label="Destinatário" type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} required />
              </div>
              <div>
                <FormInput id="em_sub" label="Assunto do Email" type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Mensagem do corpo</label>
                <textarea 
                  value={emailBody} 
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 h-24"
                />
              </div>

              {sharingBase64 && (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex items-center gap-3">
                  <div className="w-12 h-14 bg-slate-800 rounded border border-slate-700 overflow-hidden">
                    <img src={sharingBase64} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-200">credencial_digital.png</span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold">Arquivo de imagem alta resolução</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-950/40 border-t border-slate-850 flex justify-end gap-2">
              <button type="button" onClick={() => setIsSendEmailOpen(false)} className="px-4 py-2 text-xs font-bold hover:bg-slate-800 text-slate-400 rounded-lg">Suspender</button>
              <Button type="submit" variant="primary" disabled={sendingEmail}>
                {sendingEmail ? 'Disparando...' : 'Confirmar e Enviar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isSendPushOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-entrance">
          <form onSubmit={sendPushReal} className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl text-slate-300">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <span className="text-sm font-black uppercase text-indigo-400 tracking-wider">Lançar Aviso Push no Portal</span>
              <button type="button" onClick={() => setIsSendPushOpen(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <FormInput id="ps_title" label="Título de Destaque" type="text" value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Conteúdo do Aviso</label>
                <textarea 
                  value={pushBody} 
                  onChange={(e) => setPushBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 h-24"
                  required
                />
              </div>
              <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl flex items-center gap-2">
                <Users size={16} className="text-indigo-400"/>
                <div className="text-[10px] leading-relaxed text-slate-400">
                  <span>Destinatário: <b>{activeMemberObj?.nome || 'Multicanal'}</b>. O aviso será anexado na timeline principal do portal deste integrante.</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-950/40 border-t border-slate-850 flex justify-end gap-2">
              <button type="button" onClick={() => setIsSendPushOpen(false)} className="px-4 py-2 text-xs font-bold hover:bg-slate-800 text-slate-400 rounded-lg">Suspender</button>
              <Button type="submit" variant="primary" disabled={sendingPush}>
                {sendingPush ? 'Enviando...' : 'Lançar Aviso'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ModuleCarteirinha;
