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

import { InteractiveMagazineView } from './InteractiveMagazineView';
import { InteractiveWindow } from './InteractiveWindow';

interface ModuleEBDProps {
    isProfessorOnly?: boolean;
}

// Exporting component
const ModuleEBD = ({ isProfessorOnly = false }: ModuleEBDProps) => {
    const { db, dbFirestore, appId, user, openModal, addToast, deleteItem, isOnline } = useContext(ChurchContext);
    const [tab, setTab] = useState(isProfessorOnly ? 6 : 1);
    const [loadingList, setLoadingList] = useState(true);
    const [aiLesson, setAiLesson] = useState<any>(null);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 7));
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');

    // Simulated loading state for EBD lists to provide an elegant skeleton transition
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingList(false);
        }, 700);
        return () => clearTimeout(timer);
    }, []);

    const [downloadedLessons, setDownloadedLessons] = useState<string[]>([]);
    const [downloadingIds, setDownloadingIds] = useState<string[]>([]);

    const isLicaoNova = (licao: any) => {
        if (licao.createdAt) {
            try {
                const createdTime = new Date(licao.createdAt).getTime();
                const now = new Date().getTime();
                const diffDays = (now - createdTime) / (1000 * 60 * 60 * 24);
                if (diffDays >= 0 && diffDays <= 7) return true;
            } catch (e) {}
        }
        if (licao.data) {
            try {
                const lessonTime = new Date(licao.data).getTime();
                const now = new Date().getTime();
                const diffDays = (now - lessonTime) / (1000 * 60 * 60 * 24);
                if (diffDays >= -3 && diffDays <= 7) return true;
            } catch (e) {}
        }
        return false;
    };

    // Check cached lessons on mount and update
    useEffect(() => {
        const cachedKeys: string[] = [];
        const licoes = db.ebd?.licoes || [];
        licoes.forEach((l: any) => {
            const key = `gipp_cached_ebd_lesson_${l.id || l.licao_numero || '1'}_${l.revista}`;
            if (localStorage.getItem(key)) {
                cachedKeys.push(l.id || l.licao_numero);
            }
        });
        setDownloadedLessons(cachedKeys);
    }, [db.ebd?.licoes]);

    const handleDownloadForOffline = async (licao, e) => {
        if (e) e.stopPropagation();
        if (!isOnline) {
            addToast("Apenas disponível online para pré-carregamento.", "warning");
            return;
        }
        setDownloadingIds(prev => [...prev, licao.id || licao.licao_numero]);
        addToast(`Pré-carregando Lição ${licao.licao_numero || ''} para leitura offline...`, "info");
        await handleGenerateLessonPlan(licao, true); // silent = true
        setDownloadingIds(prev => prev.filter(id => id !== (licao.id || licao.licao_numero)));
    };

    const handleDeleteOfflineCache = (licao, e) => {
        if (e) e.stopPropagation();
        const cacheKey = `gipp_cached_ebd_lesson_${licao.id || licao.licao_numero || '1'}_${licao.revista}`;
        localStorage.removeItem(cacheKey);
        
        setDownloadedLessons(prev => prev.filter(id => id !== (licao.id || licao.licao_numero)));
        addToast(`Estudo da Lição ${licao.licao_numero || ''} removido do armazenamento offline!`, "success");
    };

    // --- ESTADOS DE GESTÃO DE CHAMADA (PRESENÇA) INTERATIVA ---
    const [chamadaModalOpen, setChamadaModalOpen] = useState(false);
    const [selectedTurmaForChamada, setSelectedTurmaForChamada] = useState<any>(null);
    const [chamadaDate, setChamadaDate] = useState(getTodayDate());
    const [chamadaRevista, setChamadaRevista] = useState('');
    const [chamadaLicaoNum, setChamadaLicaoNum] = useState('');
    const [studentAttendanceMap, setStudentAttendanceMap] = useState<Record<string, { presente: boolean; trouxeBiblia: boolean; trouxeRevista: boolean; oferta: boolean }>>({});

    // --- ESTADOS DO FILTRO TRIMESTRAL DE LIÇÕES ---
    const [licaoPeriod, setLicaoPeriod] = useState('todos');
    const [licaoStartDate, setLicaoStartDate] = useState('');
    const [licaoEndDate, setLicaoEndDate] = useState('');

    // --- ESTADOS DO HISTÓRICO INDIVIDUAL DO ALUNO ---
    const [alunoHistoryModalOpen, setAlunoHistoryModalOpen] = useState(false);
    const [selectedAlunoForHistory, setSelectedAlunoForHistory] = useState<any>(null);

    // --- ESTADOS PEDAGÓGICOS DA LIÇÃO DE IA ---
    const [aiGeneratingQuiz, setAiGeneratingQuiz] = useState(false);
    const [aiQuizText, setAiQuizText] = useState('');

    // --- ESTADOS DA ÁREA DO PROFESSOR (REGISTROS INTERNOS DA TURMA E ALUNOS) ---
    const [profSelectedTurmaId, setProfSelectedTurmaId] = useState<string>('');
    const [profActiveSubTab, setProfActiveSubTab] = useState<'alunos' | 'pedagogico' | 'suporte' | 'avisos'>('alunos');
    const [profSelectedAlunoId, setProfSelectedAlunoId] = useState<string>('');

    // --- ESTADOS DA ESCALA DE PROFESSORES ---
    const [localEscalaRows, setLocalEscalaRows] = useState<any[]>([]);
    const [escalaPeriodo, setEscalaPeriodo] = useState('trimestral'); // 'semanal' | 'trimestral' | 'semestral' | 'anual'
    const [generatorStartDate, setGeneratorStartDate] = useState(getTodayDate());
    const [generatorTurmaId, setGeneratorTurmaId] = useState('todas');
    const [generatorRevista, setGeneratorRevista] = useState('');
    const [generatorLicaoInicial, setGeneratorLicaoInicial] = useState('1');
    const [escalaSearch, setEscalaSearch] = useState('');
    const [escalaFiltroTurmaId, setEscalaFiltroTurmaId] = useState('');
    const [escalaColFilters, setEscalaColFilters] = useState({
        data: '',
        turma: '',
        revista: '',
        licao: '',
        tema: '',
        texto_biblico: '',
        professor: '',
        auxiliar: '',
        obs: ''
    });

    const reloadEscalaFromDb = () => {
        const list = db.ebd?.escalas || [];
        const sorted = [...list].sort((a: any, b: any) => {
            const dateComp = (a.data || '').localeCompare(b.data || '');
            if (dateComp !== 0) return dateComp;
            const classA = db.ebd?.turmas?.find((t: any) => t.id === a.turma_id)?.nome || '';
            const classB = db.ebd?.turmas?.find((t: any) => t.id === b.turma_id)?.nome || '';
            return classA.localeCompare(classB);
        });
        setLocalEscalaRows(sorted);
    };

    const filteredEscalas = useMemo(() => {
        return localEscalaRows.filter((row: any) => {
            if (escalaFiltroTurmaId && row.turma_id !== escalaFiltroTurmaId) return false;
            
            if (escalaSearch.trim()) {
                const search = escalaSearch.toLowerCase();
                const classNome = db.ebd?.turmas?.find((t: any) => t.id === row.turma_id)?.nome?.toLowerCase() || '';
                const revista = (row.revista || '').toLowerCase();
                const licao = (row.licao || '').toLowerCase();
                const tema = (row.tema || '').toLowerCase();
                const profNome = db.membros?.find((m: any) => m.id === row.prof_id)?.nome?.toLowerCase() || '';
                const auxNome = db.membros?.find((m: any) => m.id === row.aux_id)?.nome?.toLowerCase() || '';
                
                if (!classNome.includes(search) && 
                    !revista.includes(search) && 
                    !licao.includes(search) && 
                    !tema.includes(search) && 
                    !profNome.includes(search) && 
                    !auxNome.includes(search)) {
                    return false;
                }
            }

            // Column filters
            const rowData = row.data || '';
            const rowClass = db.ebd?.turmas?.find((t: any) => t.id === row.turma_id)?.nome || '';
            const rowRevista = row.revista || '';
            const rowLicao = row.licao || '';
            const rowTema = row.tema || '';
            const rowTexto = row.texto_biblico || '';
            const rowProf = db.membros?.find((m: any) => m.id === row.prof_id)?.nome || '';
            const rowAux = db.membros?.find((m: any) => m.id === row.aux_id)?.nome || '';
            const rowObs = row.observacoes || '';

            const matchColData = !escalaColFilters.data || rowData.toLowerCase().includes(escalaColFilters.data.toLowerCase());
            const matchColTurma = !escalaColFilters.turma || rowClass.toLowerCase().includes(escalaColFilters.turma.toLowerCase());
            const matchColRevista = !escalaColFilters.revista || rowRevista.toLowerCase().includes(escalaColFilters.revista.toLowerCase());
            const matchColLicao = !escalaColFilters.licao || rowLicao.toLowerCase().includes(escalaColFilters.licao.toLowerCase());
            const matchColTema = !escalaColFilters.tema || rowTema.toLowerCase().includes(escalaColFilters.tema.toLowerCase());
            const matchColTexto = !escalaColFilters.texto_biblico || rowTexto.toLowerCase().includes(escalaColFilters.texto_biblico.toLowerCase());
            const matchColProf = !escalaColFilters.professor || rowProf.toLowerCase().includes(escalaColFilters.professor.toLowerCase());
            const matchColAux = !escalaColFilters.auxiliar || rowAux.toLowerCase().includes(escalaColFilters.auxiliar.toLowerCase());
            const matchColObs = !escalaColFilters.obs || rowObs.toLowerCase().includes(escalaColFilters.obs.toLowerCase());

            return matchColData && matchColTurma && matchColRevista && matchColLicao && matchColTema && matchColTexto && matchColProf && matchColAux && matchColObs;
        });
    }, [localEscalaRows, escalaFiltroTurmaId, escalaSearch, db.ebd?.turmas, db.membros, escalaColFilters]);

    // Auto-load initially when tab becomes 7
    useEffect(() => {
        if (tab === 7) {
            reloadEscalaFromDb();
        }
    }, [tab, db.ebd?.escalas]);

    const getSundaysFromDate = (startDateStr: string, count: number): string[] => {
        const dates: string[] = [];
        let current = new Date(startDateStr + 'T12:00:00'); // avoid timezone offset issues
        
        // Find next Sunday if the start date isn't Sunday
        const day = current.getDay();
        if (day !== 0) {
            const daysToAdd = 7 - day;
            current.setDate(current.getDate() + daysToAdd);
        }
        
        for (let i = 0; i < count; i++) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 7);
        }
        return dates;
    };

    const handleGenerateBatchEscala = () => {
        let count = 1;
        if (escalaPeriodo === 'trimestral') count = 13;
        else if (escalaPeriodo === 'semestral') count = 26;
        else if (escalaPeriodo === 'anual') count = 52;
        
        const sundays = getSundaysFromDate(generatorStartDate, count);
        const turmasToGenerate = generatorTurmaId === 'todas' 
            ? turmasFiltradas 
            : turmasFiltradas.filter(t => t.id === generatorTurmaId);
            
        if (turmasToGenerate.length === 0) {
            addToast("Nenhuma turma disponível para gerar a escala.", "warning");
            return;
        }
        
        const newRows: any[] = [];
        sundays.forEach((sundayDate, sundayIdx) => {
            const licaoNum = parseInt(generatorLicaoInicial) + sundayIdx;
            turmasToGenerate.forEach(turma => {
                newRows.push({
                    id: '', // temporary empty id before saving
                    data: sundayDate,
                    turma_id: turma.id,
                    revista: generatorRevista || turma.revista || 'Revista EBD',
                    licao: `Lição ${licaoNum}`,
                    capitulo: '',
                    tema: '',
                    prof_id: turma.prof1_id || '', // pre-fill with turma primary teacher
                    aux_id: turma.prof2_id || '', // pre-fill with secondary teacher
                    periodo: escalaPeriodo,
                    observacoes: '',
                    congregacao_id: congregacaoFilter !== 'todas' ? congregacaoFilter : 'sede',
                });
            });
        });
        
        setLocalEscalaRows(prev => [...newRows, ...prev]);
        addToast(`Gerado esboço com ${newRows.length} linhas de escala para preenchimento. Não se esqueça de salvar!`, "info");
    };

    const handleSaveEscalaRow = async (rowIndex: number) => {
        const row = localEscalaRows[rowIndex];
        if (!row.data || !row.turma_id) {
            addToast("A data e a turma são obrigatórias para salvar uma escala.", "warning");
            return;
        }
        try {
            const payload = {
                data: row.data,
                turma_id: row.turma_id,
                revista: row.revista || '',
                licao: row.licao || '',
                capitulo: row.capitulo || '',
                tema: row.tema || '',
                prof_id: row.prof_id || '',
                aux_id: row.aux_id || '',
                periodo: row.periodo || 'semanal',
                observacoes: row.observacoes || '',
                congregacao_id: row.congregacao_id || (row.congregacao_id === 'sede' || row.congregacao_id ? row.congregacao_id : (congregacaoFilter !== 'todas' ? congregacaoFilter : 'sede')),
                updated_at: new Date().toISOString()
            };
            if (row.id) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_escalas', row.id), payload);
            } else {
                const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_escalas');
                const docAdded = await addDoc(colRef, payload);
                const updated = [...localEscalaRows];
                updated[rowIndex].id = docAdded.id;
                setLocalEscalaRows(updated);
            }
            addToast("Linha da escala salva com sucesso!", "success");
        } catch (e: any) {
            addToast("Erro ao salvar linha: " + e.message, "error");
        }
    };

    const handleSaveAllEscalas = async () => {
        let countSaved = 0;
        try {
            for (let i = 0; i < localEscalaRows.length; i++) {
                const row = localEscalaRows[i];
                const original = (db.ebd?.escalas || []).find((x: any) => x.id === row.id);
                const isChanged = !original || 
                    original.data !== row.data ||
                    original.turma_id !== row.turma_id ||
                    original.revista !== row.revista ||
                    original.licao !== row.licao ||
                    original.capitulo !== row.capitulo ||
                    original.tema !== row.tema ||
                    original.prof_id !== row.prof_id ||
                    original.aux_id !== row.aux_id ||
                    original.periodo !== row.periodo ||
                    original.observacoes !== row.observacoes;

                if (isChanged) {
                    if (!row.data || !row.turma_id) continue;
                    const payload = {
                        data: row.data,
                        turma_id: row.turma_id,
                        revista: row.revista || '',
                        licao: row.licao || '',
                        capitulo: row.capitulo || '',
                        tema: row.tema || '',
                        prof_id: row.prof_id || '',
                        aux_id: row.aux_id || '',
                        periodo: row.periodo || 'semanal',
                        observacoes: row.observacoes || '',
                        congregacao_id: row.congregacao_id || (row.congregacao_id === 'sede' || row.congregacao_id ? row.congregacao_id : (congregacaoFilter !== 'todas' ? congregacaoFilter : 'sede')),
                        updated_at: new Date().toISOString()
                    };
                    if (row.id) {
                        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_escalas', row.id), payload);
                    } else {
                        const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_escalas');
                        await addDoc(colRef, payload);
                    }
                    countSaved++;
                }
            }
            addToast(`${countSaved} registro(s) da escala salvos/atualizados com sucesso!`, "success");
            reloadEscalaFromDb();
        } catch (e: any) {
            addToast("Erro ao salvar toda a planilha: " + e.message, "error");
        }
    };

    const handleRemoveEscalaRow = (index: number) => {
        const row = localEscalaRows[index];
        if (row.id) {
            deleteItem('ebd_escala', row.id);
        } else {
            setLocalEscalaRows(prev => prev.filter((_, idx) => idx !== index));
            addToast("Rascunho de linha removido da tela.", "info");
        }
    };

    const shareEscalaToWhatsApp = () => {
        if (localEscalaRows.length === 0) {
            addToast("Nenhuma escala disponível para compartilhar.", "warning");
            return;
        }
        
        let text = `📅 *ESCALA DE PROFESSORES - EBD* 📅\n`;
        text += `_Período:_ ${escalaPeriodo.toUpperCase()}\n`;
        text += `==============================\n\n`;
        
        const groupedByDate: Record<string, any[]> = {};
        localEscalaRows.forEach(row => {
            if (!groupedByDate[row.data]) groupedByDate[row.data] = [];
            groupedByDate[row.data].push(row);
        });
        
        const sortedDates = Object.keys(groupedByDate).sort();
        sortedDates.forEach(dateStr => {
            const formattedDate = dateStr.split('-').reverse().join('/');
            text += `🗓️ *DOMINGO - ${formattedDate}*\n`;
            
            groupedByDate[dateStr].forEach(row => {
                const classNome = db.ebd?.turmas?.find((t: any) => t.id === row.turma_id)?.nome || 'Turma';
                const profNome = db.membros?.find((m: any) => m.id === row.prof_id)?.nome || 'Não definido';
                const auxNome = db.membros?.find((m: any) => m.id === row.aux_id)?.nome;
                
                text += `🏫 *${classNome}*\n`;
                text += `📚 *${row.revista || 'Revista'}*: ${row.licao || ''} - ${row.tema || 'Tema não definido'}\n`;
                if (row.capitulo) text += `📖 *Texto:* ${row.capitulo}\n`;
                text += `👨‍🏫 *Prof:* ${profNome}${auxNome ? ` e ${auxNome}` : ''}\n`;
                if (row.observacoes) text += `📝 *Obs:* ${row.observacoes}\n`;
                text += `--------------------\n`;
            });
            text += `\n`;
        });
        
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleDownloadPDFEscala = () => {
        if (localEscalaRows.length === 0) {
            addToast("Nenhuma escala disponível para gerar o PDF.", "warning");
            return;
        }
        
        // Use landscape mode for a proper spreadsheet (planilha) layout
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // Sort scale rows by date first, then by class/turma name
        const sortedRows = [...localEscalaRows].sort((a, b) => {
            const dateCompare = (a.data || '').localeCompare(b.data || '');
            if (dateCompare !== 0) return dateCompare;
            
            const classA = db.ebd?.turmas?.find((t: any) => t.id === a.turma_id)?.nome || '';
            const classB = db.ebd?.turmas?.find((t: any) => t.id === b.turma_id)?.nome || '';
            return classA.localeCompare(classB);
        });

        // 277mm of printable width (A4 Landscape is 297mm - 20mm margins)
        const colWidths = {
            data: 24,
            turma: 32,
            revista: 28,
            licao: 16,
            tema: 67,
            capitulo: 30,
            prof: 40,
            aux: 40
        };
        const colKeys = ['data', 'turma', 'revista', 'licao', 'tema', 'capitulo', 'prof', 'aux'];
        const colHeaders = ['DATA', 'CLASSE / TURMA', 'REVISTA', 'LIÇÃO', 'TEMA / TÍTULO DA AULA', 'TEXTO BÍBLICO', 'PROF. TITULAR', 'AUXILIAR EBD'];

        const drawPageHeader = (pageNum: number) => {
            if (pageNum === 1) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(15);
                doc.setTextColor(30, 41, 59); // slate-800
                doc.text("CRONOGRAMA DE AULAS & ESCALA DE PROFESSORES - EBD", 10, 16);
                
                doc.setFontSize(8.5);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(100, 116, 139); // slate-500
                const filial = db.igreja?.nome || "Igreja Sede";
                doc.text(`${filial.toUpperCase()}  •  PERÍODO: ${escalaPeriodo.toUpperCase()}  •  GERADO EM ${new Date().toLocaleDateString('pt-BR')}`, 10, 21);
                
                doc.setDrawColor(79, 70, 229); // Indigo border
                doc.setLineWidth(0.4);
                doc.line(10, 24, 287, 24);
            } else {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.setTextColor(100, 116, 139);
                doc.text(`Escala de Professores - EBD (Continuação)  |  Página ${pageNum}`, 10, 12);
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.2);
                doc.line(10, 14, 287, 14);
            }
        };

        const drawTableHeader = (startX: number, currentY: number) => {
            let cx = startX;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            
            colKeys.forEach((key, idx) => {
                const w = colWidths[key as keyof typeof colWidths];
                const headerText = colHeaders[idx];
                
                // Draw background box
                doc.setFillColor(79, 70, 229); // Indigo-600
                doc.rect(cx, currentY, w, 7.5, 'F');
                
                // Draw border line
                doc.setDrawColor(67, 56, 190);
                doc.setLineWidth(0.1);
                doc.rect(cx, currentY, w, 7.5);
                
                // Draw white header text
                doc.setTextColor(255, 255, 255);
                
                // Center text horizontally in header cell 
                const textWidth = doc.getTextWidth(headerText);
                const textX = cx + (w - textWidth) / 2;
                doc.text(headerText, textX, currentY + 4.8);
                
                cx += w;
            });
        };

        const getRowHeight = (rowData: any): number => {
            let maxLines = 1;
            const padding = 2;
            
            colKeys.forEach((key) => {
                let cellVal = '';
                if (key === 'data') {
                    cellVal = (rowData.data || '').split('-').reverse().join('/');
                } else if (key === 'turma') {
                    cellVal = db.ebd?.turmas?.find((t: any) => t.id === rowData.turma_id)?.nome || '';
                } else if (key === 'prof') {
                    cellVal = db.membros?.find((m: any) => m.id === rowData.prof_id)?.nome || '';
                } else if (key === 'aux') {
                    cellVal = db.membros?.find((m: any) => m.id === rowData.aux_id)?.nome || '';
                } else {
                    cellVal = rowData[key] || '';
                }
                
                const w = colWidths[key as keyof typeof colWidths];
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7.5);
                const splitText = doc.splitTextToSize(cellVal, w - padding * 2);
                maxLines = Math.max(maxLines, splitText.length);
            });
            
            return Math.max(7, 3.5 + maxLines * 3);
        };

        let y = 28; // Starting y for page 1
        let pageNum = 1;
        
        drawPageHeader(pageNum);
        drawTableHeader(10, y);
        y += 7.5; // move past header row
        
        sortedRows.forEach((row, idx) => {
            const rowH = getRowHeight(row);
            
            // Check if height exceeds page threshold (A4 height is 210mm, let's break at 190mm)
            if (y + rowH > 190) {
                // Draw footer on current page before adding a new page
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184);
                doc.text(`Página ${pageNum}`, 272, 202);
                
                doc.addPage();
                pageNum++;
                y = 18; // reset y for next pages
                
                drawPageHeader(pageNum);
                drawTableHeader(10, y);
                y += 7.5;
            }
            
            let cx = 10;
            colKeys.forEach((key) => {
                const w = colWidths[key as keyof typeof colWidths];
                
                let cellVal = '';
                if (key === 'data') {
                    cellVal = (row.data || '').split('-').reverse().join('/');
                } else if (key === 'turma') {
                    cellVal = db.ebd?.turmas?.find((t: any) => t.id === row.turma_id)?.nome || '';
                } else if (key === 'prof') {
                    cellVal = db.membros?.find((m: any) => m.id === row.prof_id)?.nome || '';
                } else if (key === 'aux') {
                    cellVal = db.membros?.find((m: any) => m.id === row.aux_id)?.nome || '';
                } else {
                    cellVal = row[key] || '';
                }
                
                // Zebra striping style
                const isAlternate = idx % 2 === 1;
                doc.setFillColor(isAlternate ? 248 : 255, isAlternate ? 250 : 255, isAlternate ? 252 : 255);
                doc.rect(cx, y, w, rowH, 'F');
                
                // Draw border
                doc.setDrawColor(226, 232, 240); // slate-200
                doc.setLineWidth(0.1);
                doc.rect(cx, y, w, rowH);
                
                // Text auto-wrap
                doc.setFont("helvetica", "normal");
                if (key === 'tema') {
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(30, 41, 59); // darker slate for theme
                } else if (key === 'prof') {
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(79, 70, 229); // slate indigo for prof
                } else {
                    doc.setTextColor(71, 85, 105);
                }
                doc.setFontSize(7.5);
                
                const splitText = doc.splitTextToSize(cellVal, w - 3.5); // padding
                const linesCount = splitText.length;
                const startY = y + (rowH - (linesCount - 1) * 3) / 2 + 0.6;
                
                splitText.forEach((line: string, lineIdx: number) => {
                    doc.text(line, cx + 1.8, startY + (lineIdx * 3));
                });
                
                cx += w;
            });
            
            y += rowH;
        });
        
        // Draw page footer on final page
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Página ${pageNum}`, 272, 202);
        
        doc.save(`escala_professores_ebd_${escalaPeriodo}.pdf`);
        addToast("Escala em PDF baixada com sucesso!", "success");
    };
    
    // Alunos e Acompanhamento Espiritual
    const [novoAcompanhamentoAnotacao, setNovoAcompanhamentoAnotacao] = useState('');
    const [novoAcompanhamentoTipo, setNovoAcompanhamentoTipo] = useState<'pedido_oracao' | 'visita' | 'decisao_fe' | 'observacao'>('observacao');

    // Pedagógico Form States
    const [novoCronogramaData, setNovoCronogramaData] = useState(getTodayDate());
    const [novoCronogramaLicaoNum, setNovoCronogramaLicaoNum] = useState('');
    const [novoCronogramaTema, setNovoCronogramaTema] = useState('');
    const [novoCronogramaComemorativa, setNovoCronogramaComemorativa] = useState('');
    const [novoCronogramaObjetivo, setNovoCronogramaObjetivo] = useState('');

    const [selectedPlanoLicaoId, setSelectedPlanoLicaoId] = useState('');
    const [planoObjetivo, setPlanoObjetivo] = useState('');
    const [planoQuebraGelo, setPlanoQuebraGelo] = useState('');
    const [planoAplicacao, setPlanoAplicacao] = useState('');
    const [planoDinamica, setPlanoDinamica] = useState('');

    const [novoArquivoNome, setNovoArquivoNome] = useState('');
    const [novoArquivoCategoria, setNovoArquivoCategoria] = useState('pdf');
    const [novoArquivoUrl, setNovoArquivoUrl] = useState('');

    const [novaAtividadeTitulo, setNovaAtividadeTitulo] = useState('');
    const [novaAtividadeDescricao, setNovaAtividadeDescricao] = useState('');
    const [novaAtividadeEntrega, setNovaAtividadeEntrega] = useState('');
    const [novaAtividadeTipo, setNovaAtividadeTipo] = useState('leitura');

    // Suporte (Caixa e Materiais) Form States
    const [caixaDescricao, setCaixaDescricao] = useState('');
    const [caixaTipo, setCaixaTipo] = useState<'entrada' | 'saida'>('entrada');
    const [caixaValor, setCaixaValor] = useState('');
    
    const [materialNome, setMaterialNome] = useState('');
    const [materialQtd, setMaterialQtd] = useState('');
    const [materialStatus, setMaterialStatus] = useState('excelente');
    const [materialNotas, setMaterialNotas] = useState('');

    // Avisos Form States
    const [avisoTitulo, setAvisoTitulo] = useState('');
    const [avisoConteudo, setAvisoConteudo] = useState('');
    const [avisoTipo, setAvisoTipo] = useState<'urgente' | 'geral' | 'festividade'>('geral');

    // WhatsApp Template States
    const [templateSelectedAlunoId, setTemplateSelectedAlunoId] = useState('');
    const [templateTemaCustom, setTemplateTemaCustom] = useState('');
    const [templateRecadoCustom, setTemplateRecadoCustom] = useState('');
    const [activeTemplateType, setActiveTemplateType] = useState<'aniversario' | 'lembrete' | 'oracao' | 'aviso'>('lembrete');

    const handleUpdateTurmaField = async (turmaId: string, fieldName: string, updatedArray: any[]) => {
        if (!isOnline) {
            addToast("Apenas disponível online para salvar alterações no servidor.", "warning");
            return;
        }
        try {
            const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_turmas', turmaId);
            await updateDoc(docRef, { [fieldName]: updatedArray });
            addToast("Sucesso ao registrar!", "success");
        } catch (err: any) {
            addToast("Erro ao salvar no servidor: " + err.message, "error");
        }
    };

    const handleUpdateAlunoField = async (alunoId: string, fieldName: string, updatedArray: any[]) => {
        if (!isOnline) {
            addToast("Apenas disponível online para salvar alterações no servidor.", "warning");
            return;
        }
        try {
            const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_alunos', alunoId);
            await updateDoc(docRef, { [fieldName]: updatedArray });
            addToast("Registro espiritual atualizado!", "success");
        } catch (err: any) {
            addToast("Erro ao salvar no servidor: " + err.message, "error");
        }
    };

    const turmasFiltradas = useMemo(() => {
        const list = db.ebd?.turmas || [];
        if (isProfessorOnly) {
            // Find turmas where user is assigned as one of the professors
            const userTurmas = list.filter((t: any) => t.prof1_id === user?.id || t.prof2_id === user?.id || t.prof3_id === user?.id);
            if (userTurmas.length > 0) return userTurmas;
        }
        return list.filter((t: any) => congregacaoFilter === 'todas' || t.congregacao_id === congregacaoFilter || (!t.congregacao_id && congregacaoFilter === 'sede'));
    }, [db.ebd?.turmas, isProfessorOnly, user?.id, congregacaoFilter]);
    
    // Os alunos e lições são baseados nas turmas filtradas
    const alunosFiltrados = useMemo(() => {
        return (db.ebd?.alunos || []).filter((a: any) => turmasFiltradas.some((t: any) => t.id === a.turma_id));
    }, [db.ebd?.alunos, turmasFiltradas]);

    const licoesFiltradasTotal = useMemo(() => {
        return (db.ebd?.licoes || []).filter((l: any) => turmasFiltradas.some((t: any) => t.id === l.turma_id));
    }, [db.ebd?.licoes, turmasFiltradas]);

    // --- FILTRAGEM EFETIVA DE LIÇÕES POR TIPO DE DATA/PERÍODO ---
    const filteredLicoesPeriodoFull = useMemo(() => {
        let list = [...licoesFiltradasTotal];
        
        const parseDate = (dStr: string) => {
            if (!dStr) return null;
            return new Date(dStr + 'T00:00:00');
        };
        
        const start = licaoStartDate ? parseDate(licaoStartDate) : null;
        const end = licaoEndDate ? parseDate(licaoEndDate) : null;
        
        if (start || end) {
            list = list.filter(item => {
                if (!item.data) return false;
                const itemDate = parseDate(item.data);
                if (!itemDate) return false;
                if (start && itemDate < start) return false;
                if (end && itemDate > end) return false;
                return true;
            });
        }
        
        return list;
    }, [licoesFiltradasTotal, licaoStartDate, licaoEndDate]);

    // --- GESTÃO DE FILTRO DE DATA/PERÍODO ---
    const handleLicaoPeriodChange = (val: string) => {
        setLicaoPeriod(val);
        const today = new Date();
        const currYear = today.getFullYear();
        
        if (val === 'todos') {
            setLicaoStartDate('');
            setLicaoEndDate('');
        } else if (val === '1_trimestre') {
            setLicaoStartDate(`${currYear}-01-01`);
            setLicaoEndDate(`${currYear}-03-31`);
        } else if (val === '2_trimestre') {
            setLicaoStartDate(`${currYear}-04-01`);
            setLicaoEndDate(`${currYear}-06-30`);
        } else if (val === '3_trimestre') {
            setLicaoStartDate(`${currYear}-07-01`);
            setLicaoEndDate(`${currYear}-09-30`);
        } else if (val === '4_trimestre') {
            setLicaoStartDate(`${currYear}-10-01`);
            setLicaoEndDate(`${currYear}-12-31`);
        } else if (val === 'este_mes') {
            const first = new Date(today.getFullYear(), today.getMonth(), 1);
            const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            setLicaoStartDate(first.toISOString().split('T')[0]);
            setLicaoEndDate(last.toISOString().split('T')[0]);
        } else if (val === '30_dias') {
            const past = new Date();
            past.setDate(today.getDate() - 30);
            setLicaoStartDate(past.toISOString().split('T')[0]);
            setLicaoEndDate(today.toISOString().split('T')[0]);
        }
    };

    // --- SALVAR CHAMADA DE EBD ---
    const handleSaveChamada = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTurmaForChamada || !chamadaDate || !chamadaRevista || !chamadaLicaoNum) {
            addToast('Por favor, preencha a Revista, número da lição e data.', 'error');
            return;
        }

        const countOfPresent = Object.values(studentAttendanceMap).filter((st: any) => st.presente).length;

        const payload = {
            data: chamadaDate,
            turma_id: selectedTurmaForChamada.id,
            revista: chamadaRevista,
            licao_numero: chamadaLicaoNum,
            qtd_presentes: countOfPresent,
            detalhes_chamada: studentAttendanceMap,
            conteudo_estudo: '',
            congregacao_id: selectedTurmaForChamada.congregacao_id || user?.congregacao_id || 'sede'
        };

        try {
            const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_licoes');
            await addDoc(colRef, payload);
            addToast(`Chamada registrada com sucesso! ${countOfPresent} alunos presentes.`, 'success');
            setChamadaModalOpen(false);
            setStudentAttendanceMap({});
            setChamadaRevista('');
            setChamadaLicaoNum('');
        } catch (err: any) {
            addToast(`Erro ao registrar chamada: ${err.message}`, 'error');
        }
    };

    // --- ACIONAR MODAL DE CHAMADA ---
    const openChamadaModal = (turma: any) => {
        setSelectedTurmaForChamada(turma);
        const alunosDaTurma = (db.ebd?.alunos || []).filter(a => a.turma_id === turma.id);
        const map: any = {};
        alunosDaTurma.forEach(a => {
            map[a.id] = { presente: true, trouxeBiblia: true, trouxeRevista: true, oferta: false };
        });
        setStudentAttendanceMap(map);
        setChamadaDate(getTodayDate());
        setChamadaRevista('');
        setChamadaLicaoNum('');
        setChamadaModalOpen(true);
    };

    // --- INDÍCES DO ALUNO INDIVIDUAL ---
    const getStudentStats = (alunoId: string) => {
        const licoesComChamada = licoesFiltradasTotal.filter(l => l.detalhes_chamada);
        const totalAulas = licoesComChamada.length;
        if (totalAulas === 0) return { taxaPresenca: 0, biblias: 0, revistas: 0, ofertas: 0, presencas: 0 };

        let presencas = 0;
        let biblias = 0;
        let revistas = 0;
        let ofertas = 0;

        licoesComChamada.forEach(lic => {
            const det = lic.detalhes_chamada[alunoId];
            if (det) {
                if (det.presente) {
                    presencas++;
                    if (det.trouxeBiblia) biblias++;
                    if (det.trouxeRevista) revistas++;
                    if (det.oferta) ofertas++;
                }
            }
        });

        return {
            taxaPresenca: Math.round((presencas / totalAulas) * 100),
            presencas,
            biblias,
            revistas,
            ofertas,
            totalAulas
        };
    };

    // --- CÁLCULO DOS DADOS DO GRÁFICO DE PRESENÇA RECENTE ---
    const chartData = useMemo(() => {
        const grouped: Record<string, number> = {};
        licoesFiltradasTotal.forEach(l => {
            if (!l.data) return;
            const dStr = l.data.split('-').reverse().slice(0, 2).join('/');
            grouped[dStr] = (grouped[dStr] || 0) + (parseInt(l.qtd_presentes) || 0);
        });
        const sorted = Object.entries(grouped)
            .map(([date, qtd]) => ({ date, qtd }))
            .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
            .slice(-8); // últimas 8 chamadas registradas
        return sorted;
    }, [licoesFiltradasTotal]);

    // --- CÁLCULO DE MEMBROS NÃO MATRICULADOS NA EBD (RECRUTAMENTO) ---
    const membrosNaoMatriculados = useMemo(() => {
        const matriculadosIds = new Set((db.ebd?.alunos || []).map(a => a.membro_id).filter(Boolean));
        return (db.membros || [])
            .filter(m => !matriculadosIds.has(m.id))
            .filter(m => congregacaoFilter === 'todas' || m.congregacao_id === congregacaoFilter || (!m.congregacao_id && congregacaoFilter === 'sede'))
            .slice(0, 5); // sugerir até 5 membros
    }, [db.ebd?.alunos, db.membros, congregacaoFilter]);

    const menuItems = [{id: 1, label: 'Dashboard', icon: LayoutDashboard}, {id: 2, label: 'Turmas & Profs', icon: Users}, {id: 3, label: 'Matrícula Alunos', icon: UserPlus}, {id: 4, label: 'Controle de Lições', icon: BookOpen}, {id: 5, label: 'Mural de Turmas', icon: Layers}, {id: 7, label: 'Escala de Professores', icon: Calendar}, {id: 6, label: 'Área do Professor', icon: GraduationCap}];
    const TabButton: any = ({ item }) => (<button onClick={() => setTab(item.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}><item.icon size={18}/> {item.label}</button>);

    useEffect(() => {
        if (tab === 6 && !profSelectedTurmaId && turmasFiltradas.length > 0) {
            setProfSelectedTurmaId(turmasFiltradas[0].id);
        }
    }, [tab, turmasFiltradas, profSelectedTurmaId]);

    const handleGenerateLessonPlan = async (licao, silent = false) => {
        const cacheKey = `gipp_cached_ebd_lesson_${licao.id || licao.licao_numero || '1'}_${licao.revista}`;
        const cachedData = localStorage.getItem(cacheKey);

        const getManualCapa = (l: any) => {
            if (l.capa && l.capa !== 'null') return l.capa;
            const licoes = db.ebd?.licoes || [];
            const licaoComCapa = licoes.find((x: any) => x.revista === l.revista && x.capa && x.capa !== 'null');
            return licaoComCapa ? licaoComCapa.capa : null;
        };

        const manualCapa = getManualCapa(licao);

        if (cachedData && !silent) {
            try {
                const parsed = JSON.parse(cachedData);
                const finalCapa = manualCapa || parsed.capa || null;
                setAiLesson({
                    loading: false,
                    text: parsed.text,
                    title: parsed.title,
                    revista: parsed.revista,
                    licao: parsed.licao,
                    capa: finalCapa,
                    fromCache: true
                });
                addToast("Lição carregada do Cache Local (Offline-ready)!", "success");
                return;
            } catch (e) {
                console.warn("Could not read EBD lesson from local storage:", e);
            }
        }

        // Se o estudo já tiver sido gerado e persistido no Firestore, carrega-o diretamente de lá!
        if (licao.conteudo_estudo) {
            try {
                const finalCapa = manualCapa || licao.capa || null;
                const payload = {
                    text: licao.conteudo_estudo,
                    title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`,
                    revista: licao.revista,
                    licao: licao.licao_numero || '1',
                    capa: finalCapa
                };
                localStorage.setItem(cacheKey, JSON.stringify(payload));
                
                setDownloadedLessons(prev => {
                    const id = licao.id || licao.licao_numero;
                    if (!prev.includes(id)) return [...prev, id];
                    return prev;
                });

                if (!silent) {
                    setAiLesson({
                        loading: false,
                        text: licao.conteudo_estudo,
                        title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`,
                        revista: licao.revista,
                        licao: licao.licao_numero || '1',
                        capa: finalCapa,
                        fromCache: true
                    });
                    addToast("Lição carregada da biblioteca sincronizada!", "success");
                } else {
                    addToast(`Lição ${licao.licao_numero} pré-carregada e disponível offline!`, "success");
                }
                return;
            } catch (err) {
                console.error("Erro ao tratar conteúdo pré-existente", err);
            }
        }

        if (!isOnline && !cachedData) {
            addToast("Você está offline e esta lição não está na memória do aparelho. Conecte-se à internet para estudar.", "warning");
            return;
        }

        const initialCapa = manualCapa || licao.capa || null;
        if (!silent) {
            setAiLesson({ loading: true, text: '', title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`, revista: licao.revista, licao: licao.licao_numero || '1', capa: initialCapa });
        }
        
        try {
            const hasCapaExistente = !!initialCapa;
            const prompt = `Atue como um teólogo especialista no material oficial da Casa Publicadora das Assembleias de Deus (CPAD). 
            UTILIZE SUA FERRAMENTA DE BUSCA NO GOOGLE PARA PESQUISAR O CONTEÚDO OFICIAL DA CPAD (https://www.cpad.com.br/ e sites relacionados à Lições Bíblicas CPAD) antes de gerar a resposta. 
            É imprescindível que o material de estudo seja verdadeiramente baseado nas lições da CPAD.
            
            O usuário deseja o conteúdo de estudo para a revista com o tema: "${licao.revista}", específicamente a Lição número ${licao.licao_numero || '1'}. 
            
            ${!hasCapaExistente ? 'Por favor, retorne no final do texto a URL de uma imagem da capa desta revista específica. Formate exatamente assim: URL_CAPA=[url_da_imagem]. Se não encontrar, coloque URL_CAPA=null.' : ''}

            Gere um conteúdo fiel, interativo e completo contendo:
            1. Título exato da Lição da CPAD
            2. Texto Áureo e Verdade Prática exatos da revista
            3. Leitura Bíblica em Classe
            4. Introdução
            5. Tópicos e Subtópicos explicados com base no comentarista da revista
            6. Conclusão.
            
            Utilize formatação Markdown bem estruturada e rica.`;
            
            const result = await callGeminiAI(prompt, 5);
            
            let texto = result;
            let capaUrl = initialCapa;
            
            if (!hasCapaExistente) {
                const match = result.match(/URL_CAPA=\[?(.*?)\]?/);
                if (match && match[1] && match[1] !== 'null') {
                    capaUrl = match[1].trim();
                    texto = result.replace(match[0], ''); // Remove a URL do texto final para não aparecer no UI
                } else {
                    capaUrl = manualCapa || null;
                }
            }
            
            // Save to memory so it works offline
            const payload = {
                text: texto,
                title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`,
                revista: licao.revista,
                licao: licao.licao_numero || '1',
                capa: capaUrl
            };
            localStorage.setItem(cacheKey, JSON.stringify(payload));
            
            // Salvar no Firestore para que todos os membros tenham acesso instantâneo
            if (licao.id && dbFirestore && appId) {
                try {
                    const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_licoes', licao.id);
                    await updateDoc(docRef, {
                        conteudo_estudo: texto,
                        capa: capaUrl
                    });
                } catch (dbErr) {
                    console.error("Erro ao sincronizar o estudo no Firestore:", dbErr);
                }
            }
            
            if (!silent) {
                setAiLesson({
                    loading: false,
                    text: texto,
                    title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`,
                    revista: licao.revista,
                    licao: licao.licao_numero || '1',
                    capa: capaUrl,
                    fromCache: false
                });
            }
            
            // Sincronizar lições baixadas
            setDownloadedLessons(prev => {
                const id = licao.id || licao.licao_numero;
                if (!prev.includes(id)) return [...prev, id];
                return prev;
            });
        } catch (err) {
            console.error(err);
            if (!silent) {
                setAiLesson(null);
                addToast("Erro ao gerar conteúdo de estudo.", "error");
            }
        }
    };

    // Cálculos do Dashboard EBD
    const totalTurmas = turmasFiltradas.length || 0;
    const totalAlunos = alunosFiltrados.length || 0;
    const totalMembros = (db.membros || []).filter(m => congregacaoFilter === 'todas' || m.congregacao_id === congregacaoFilter || (!m.congregacao_id && congregacaoFilter === 'sede')).length || 0;
    const percAlunos = totalMembros > 0 ? ((totalAlunos / totalMembros) * 100).toFixed(1) : 0;

    const licoesFiltradas = licoesFiltradasTotal.filter(l => l.data && l.data.startsWith(filterDate));
    const totalLicoesPeriodo = licoesFiltradas.length;
    const totalPresentesPeriodo = licoesFiltradas.reduce((acc, l) => acc + (parseInt(l.qtd_presentes) || 0), 0);
    const mediaPresenca = totalLicoesPeriodo > 0 ? Math.round(totalPresentesPeriodo / totalLicoesPeriodo) : 0;

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance relative">
            {isProfessorOnly ? (
                <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl shadow-sm border border-violet-100"><GraduationCap size={28}/></div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Área do Professor</h2>
                            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Menu Executivo • Lançar Presenças, Gerir Cronogramas, Lições e Financeiro de Classe</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100"><BookOpen size={28}/></div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Escola Bíblica Dominical</h2>
                            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Gestão de turmas, lições e frequência</p>
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
            )}

            {!isProfessorOnly && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="glass-modern p-2 rounded-[2rem] flex overflow-x-auto custom-scrollbar gap-2 border border-white/50 w-full md:w-auto">
                        {menuItems.map(item => <TabButton key={item.id} item={item} />)}
                    </div>
                    {tab === 1 && (
                        <div className="flex items-center gap-3 bg-white/40 p-2 rounded-2xl border border-white/50">
                            <Calendar size={18} className="text-indigo-600 ml-2"/>
                            <input type="month" value={filterDate} onChange={e => setFilterDate(((e.target.value || "").toUpperCase() || "").toUpperCase())} className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 uppercase"/>
                        </div>
                    )}
                </div>
            )}
            
            <div className="flex-1 overflow-hidden">
                {tab === 1 && (
                    <div className="space-y-6 h-full overflow-y-auto custom-scrollbar p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Card 1: Turmas */}
                            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-blue-500 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4"><Users size={20}/></div>
                                <div>
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tight mb-1">{totalTurmas}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Turmas Ativas</p>
                                </div>
                            </div>
                            
                            {/* Card 2: Alunos */}
                            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-indigo-500 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4"><UserPlus size={20}/></div>
                                <div>
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tight mb-1">{totalAlunos}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alunos Matriculados</p>
                                </div>
                            </div>
                            
                            {/* Card 3: Lições no Período */}
                            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-amber-500 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4"><BookOpen size={20}/></div>
                                <div>
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tight mb-1">{totalLicoesPeriodo}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Lições Aplicadas</p>
                                    <div className="bg-amber-50 p-2 rounded-lg mt-2">
                                        <p className="text-[10px] font-bold text-amber-700 text-center">Média de {mediaPresenca} presentes/aula</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: Alunos x Membros */}
                            <div className="glass-card p-6 rounded-[2rem] border-t-4 border-t-emerald-500 shadow-sm flex flex-col justify-between">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4"><GraduationCap size={20}/></div>
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <h3 className="text-3xl font-black text-emerald-600 tracking-tight">{totalAlunos}</h3>
                                        <span className="text-lg font-bold text-slate-400 mb-1">/ {totalMembros}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Engajamento EBD</p>
                                    <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden flex"><div className="h-full bg-emerald-500" style={{width: `${percAlunos}%`}}></div></div>
                                    <p className="text-[10px] text-slate-500 font-bold mt-2 text-right">{percAlunos}% da igreja</p>
                                </div>
                            </div>
                        </div>

                        {/* NOVO: Seção Gráficas e Analytics do Dashboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                            {/* Gráfico de Frequência Recrente */}
                            <div className="lg:col-span-2 glass-card p-6 rounded-[2rem] border border-slate-200/80 bg-white/50 backdrop-blur-sm shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide">Frequência Semanal (Presença)</h4>
                                        <p className="text-[10px] text-slate-400 font-bold">Total de presentes nas últimas lições registradas</p>
                                    </div>
                                    <span className="p-2 bg-indigo-50 text-indigo-500 rounded-xl"><Activity size={18} /></span>
                                </div>
                                <div className="h-64 w-full">
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorQtd" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight="bold"/>
                                                <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold"/>
                                                <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Area type="monotone" dataKey="qtd" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorQtd)" name="Presentes" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                            <BookOpen size={36} className="opacity-30 mb-2" />
                                            <p className="text-xs font-bold">Nenhum dado de frequência registrado no período.</p>
                                            <p className="text-[10px]">Realize a chamada das classes para alimentar o gráfico.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Campanha de Matrícula (Membros Não Matriculados) */}
                            <div className="glass-card p-6 rounded-[2rem] border border-slate-200/80 bg-white/50 backdrop-blur-sm shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide">Campanha de Integração</h4>
                                            <p className="text-[10px] text-slate-400 font-bold">Membros ativos sem matrícula na EBD</p>
                                        </div>
                                        <span className="p-2 bg-amber-50 text-amber-500 rounded-xl"><Sparkles size={18} /></span>
                                    </div>
                                    <div className="space-y-3">
                                        {membrosNaoMatriculados.map(m => (
                                            <div key={m.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors shadow-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-600 font-bold text-[10px] flex items-center justify-center border border-slate-200">{(m.nome || '?').charAt(0)}</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700 leading-tight">{m.nome || 'Membro sem nome'}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold">{m.cargo_ministerial || 'Membro'}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => openModal('ebd_aluno', { membro_id: m.id, nome: m.nome })}
                                                    className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all"
                                                >
                                                    Matricular
                                                </button>
                                            </div>
                                        ))}
                                        {membrosNaoMatriculados.length === 0 && (
                                            <div className="py-8 text-center text-slate-400 italic text-xs">
                                                ✨ Incrível! 100% dos membros estão integrados à EBD.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 bg-indigo-50/50 p-3 rounded-2xl text-[10px] text-indigo-800 font-bold border border-indigo-100 flex items-center gap-2">
                                    <Info size={14} className="shrink-0 text-indigo-600" />
                                    <span>Ao matricular membros sem classe, você aumenta o engajamento e a retenção teológica da igreja!</span>
                                </div>
                            </div>
                        </div>

                        {/* NOVO: Gráfico de Rosca de Distribuição e Visualização de Turmas Superlotadas */}
                        <div className="glass-card p-6 rounded-[2rem] border border-slate-200/80 bg-white/50 backdrop-blur-sm shadow-sm mt-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide">Distribuição de Alunos & Lotação de Turmas</h4>
                                    <p className="text-[10px] text-slate-400 font-bold">Proporção de matriculados por turma para monitoramento de superlotação (Limite recomendado: ≤ 15 alunos por turma)</p>
                                </div>
                                <span className="p-2 bg-indigo-50 text-indigo-500 rounded-xl"><PieChartIcon size={18} /></span>
                            </div>
                            
                            {(() => {
                                const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#3b82f6'];
                                const dataPie = turmasFiltradas.map((turma, idx) => {
                                    const totalMatriculas = (db.ebd?.alunos || []).filter(a => a.turma_id === turma.id).length;
                                    return {
                                        name: turma.nome,
                                        value: totalMatriculas,
                                        color: COLORS[idx % COLORS.length]
                                    };
                                });
                                const totalVal = dataPie.reduce((sum, item) => sum + item.value, 0);

                                return turmasFiltradas.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                        {/* Gráfico de rosca */}
                                        <div className="md:col-span-1 flex justify-center items-center h-52 relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={totalVal === 0 ? [{ name: 'Sem Alunos', value: 1, color: '#e2e8f0' }] : dataPie.filter(d => d.value > 0)}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={65}
                                                        outerRadius={85}
                                                        paddingAngle={3}
                                                        dataKey="value"
                                                    >
                                                        {totalVal === 0 ? (
                                                            <Cell key="empty" fill="#e2e8f0" />
                                                        ) : (
                                                            dataPie.filter(d => d.value > 0).map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))
                                                        )}
                                                    </Pie>
                                                    <RechartsTooltip 
                                                        formatter={(value, name) => [name === 'Sem Alunos' ? 0 : `${value} Aluno(s)`, 'Matrículas']}
                                                        contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            {/* Center indicator */}
                                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-3xl font-black text-slate-700 leading-none">{totalAlunos}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Alunos</span>
                                            </div>
                                        </div>
                                        
                                        {/* Detalhes de Lotação */}
                                        <div className="md:col-span-2 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                            {turmasFiltradas.map((turma, idx) => {
                                                const totalMatriculas = (db.ebd?.alunos || []).filter(a => a.turma_id === turma.id).length;
                                                const propTotal = totalAlunos > 0 ? ((totalMatriculas / totalAlunos) * 100).toFixed(1) : "0.0";
                                                const classColor = COLORS[idx % COLORS.length];
                                                
                                                // Monitoramento de Lotação
                                                let statusLevel = "Adequada";
                                                let statusColor = "bg-emerald-50 text-emerald-600 border-emerald-250";
                                                if (totalMatriculas > 15) {
                                                    statusLevel = "Superlotada ⚠️";
                                                    statusColor = "bg-rose-50 text-rose-600 border-rose-250";
                                                } else if (totalMatriculas > 10) {
                                                    statusLevel = "Lotação Alta";
                                                    statusColor = "bg-amber-50 text-amber-600 border-amber-250";
                                                } else if (totalMatriculas === 0) {
                                                    statusLevel = "Sem Alunos";
                                                    statusColor = "bg-slate-100 text-slate-400 border-slate-200";
                                                }
                                                
                                                return (
                                                    <div key={turma.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs gap-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-4 h-4 rounded-full shrink-0 border-2 border-white shadow-xs" style={{ backgroundColor: classColor }}></div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-black text-slate-700 truncate">{turma.nome}</p>
                                                                <p className="text-[10px] text-slate-400 font-medium">Lugar: {turma.sala || 'Sala Geral'}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Progress bar visualizer */}
                                                        <div className="flex-1 max-w-xs hidden lg:block mx-4">
                                                            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                                                                <span>Ocupação</span>
                                                                <span>{propTotal}%</span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className="h-full rounded-full" style={{ width: `${propTotal}%`, backgroundColor: classColor }}></div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                                            <div className="text-right">
                                                                <p className="text-xs font-black text-slate-700">{totalMatriculas} Aluno(s)</p>
                                                                <p className="text-[10px] font-bold text-slate-400">{propTotal}% do total</p>
                                                            </div>
                                                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-xl border ${statusColor}`}>
                                                                {statusLevel}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-center">
                                        <PieChartIcon size={44} className="opacity-30 mb-2" />
                                        <p className="text-sm font-bold">Nenhuma turma cadastrada para analisar.</p>
                                        <p className="text-xs text-slate-400 max-w-sm mt-1">Surgirá um sumário completo de lotação e participação por classe após criar turmas e matricular alunos.</p>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
                {tab === 2 && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[300px]">
                        {loadingList ? (
                            <div className="p-6 space-y-4 animate-pulse">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                    <div className="h-5 bg-slate-200 rounded w-48"></div>
                                    <div className="h-4 bg-slate-200 rounded w-16"></div>
                                </div>
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="grid grid-cols-3 gap-4 py-4 border-b border-slate-50 last:border-0 items-center">
                                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <GenericTable title="Gestão de Turmas" type="ebd_turma" data={turmasFiltradas} columns={[{header:'Turma', key:'nome'}, {header:'Sala', key:'sala'}, {header:'Professores', key:'prof1_id', render: (t) => [t.prof1_id, t.prof2_id, t.prof3_id].map(id => db.membros.find(m=>m.id===id)?.nome?.split(' ')[0]).filter(Boolean).join(', ') || 'Sem professor'}]} />
                        )}
                    </div>
                )}
                {tab === 3 && (
                    <div className="h-full flex flex-col space-y-4">
                        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-3xl flex justify-between items-center shrink-0">
                            <div>
                                <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide">Ficha de Desempenho e Matrícula</h4>
                                <p className="text-[10px] text-slate-500 font-bold">Consulte a taxa de estudos concluídos, bíblia, revista e presença geral dos alunos.</p>
                            </div>
                            <Button onClick={() => openModal('ebd_aluno')} variant="primary" className="shadow-blue-500/20"><Plus size={16}/> Matricular Novo Aluno</Button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {loadingList ? (
                                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 animate-pulse min-h-[300px]">
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                        <div className="h-5 bg-slate-200 rounded w-48"></div>
                                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                                    </div>
                                    {[1, 2, 3, 4].map((n) => (
                                        <div key={n} className="grid grid-cols-4 gap-4 py-4 border-b border-slate-50 last:border-0 items-center">
                                            <div className="h-4 bg-slate-200 rounded w-32"></div>
                                            <div className="h-4 bg-slate-200 rounded w-20"></div>
                                            <div className="h-4 bg-slate-200 rounded w-24"></div>
                                            <div className="h-8 bg-slate-200 rounded w-24 justify-self-end"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <GenericTable 
                                    title="Matrícula de Alunos" 
                                    type="ebd_aluno" 
                                    data={alunosFiltrados} 
                                    columns={[
                                        {header:'Aluno', key:'nome'}, 
                                        {header:'Turma', key:'turma_id', render: a => turmasFiltradas.find(t=>t.id===a.turma_id)?.nome || '-'},
                                        {
                                            header: 'Presença Geral', 
                                            key: 'id', 
                                            render: a => {
                                                const st = getStudentStats(a.id);
                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                                                            <div className="bg-indigo-600 h-full" style={{ width: `${st.taxaPresenca}%` }}></div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-650">{st.taxaPresenca}% ({st.presencas}/{st.totalAulas})</span>
                                                    </div>
                                                );
                                            }
                                        }
                                    ]} 
                                    customActions={(item) => (
                                        <button 
                                            onClick={() => { setSelectedAlunoForHistory(item); setAlunoHistoryModalOpen(true); }} 
                                            className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5" 
                                            title="Visualizar Ficha do Aluno"
                                        >
                                            <FileBarChart size={14}/> 
                                            <span className="text-[10px] font-black uppercase">Ver Ficha</span>
                                        </button>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                )}
                {tab === 4 && (
                    <div className="h-full flex flex-col space-y-4 overflow-y-auto custom-scrollbar p-2">
                        {/* Painel de Filtros EBD Quarterly/Trimestrais */}
                        <div className="glass-card p-6 rounded-[2.2rem] border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-end justify-between bg-white/70 shrink-0">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1.5">Revista / Período (Trimestre)</label>
                                    <select
                                        value={licaoPeriod}
                                        onChange={e => handleLicaoPeriodChange(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="todos">📅 Todo o Período</option>
                                        <option value="1_trimestre">🌸 1º Trimestre (Jan-Mar)</option>
                                        <option value="2_trimestre">☀️ 2º Trimestre (Abr-Jun)</option>
                                        <option value="3_trimestre">🍂 3º Trimestre (Jul-Set)</option>
                                        <option value="4_trimestre">❄️ 4º Trimestre (Out-Dez)</option>
                                        <option value="este_mes">🗓️ Este Mês</option>
                                        <option value="30_dias">🔄 Últimos 30 dias</option>
                                    </select>
                                </div>
                                <div className={`text-left ${licaoPeriod === 'personalizado' ? "opacity-100" : "opacity-75"}`}>
                                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1.5">Data Inicial</label>
                                    <input
                                        type="date"
                                        value={licaoStartDate}
                                        onChange={e => setLicaoStartDate(e.target.value)}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                                    />
                                </div>
                                <div className={`text-left ${licaoPeriod === 'personalizado' ? "opacity-100" : "opacity-75"}`}>
                                    <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1.5">Data Final</label>
                                    <input
                                        type="date"
                                        value={licaoEndDate}
                                        onChange={e => setLicaoEndDate(e.target.value)}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                                    />
                                </div>
                            </div>
                            
                            {(licaoPeriod !== 'todos' || licaoStartDate || licaoEndDate) && (
                                <button
                                    onClick={() => handleLicaoPeriodChange('todos')}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:text-rose-600 tracking-wider transition duration-200 flex items-center gap-1.5 self-center md:self-end"
                                >
                                    <RotateCcw size={12} /> Limpar Filtros
                                </button>
                            )}
                        </div>

                        {/* Tabela do Controle de Lições Aplicadas */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[300px]">
                            {loadingList ? (
                                <div className="p-6 space-y-4 animate-pulse">
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                        <div className="h-5 bg-slate-200 rounded w-48"></div>
                                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                                    </div>
                                    {[1, 2, 3, 4].map((n) => (
                                        <div key={n} className="grid grid-cols-5 gap-4 py-4 border-b border-slate-50 last:border-0 items-center">
                                            <div className="h-4 bg-slate-200 rounded w-20"></div>
                                            <div className="h-4 bg-slate-200 rounded w-32 col-span-2"></div>
                                            <div className="h-4 bg-slate-200 rounded w-16"></div>
                                            <div className="h-8 bg-slate-200 rounded w-24 justify-self-end"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <GenericTable 
                                    title="Registro de Lições" 
                                    type="ebd_licao" 
                                    data={filteredLicoesPeriodoFull} 
                                    columns={[
                                        {header:'Data', key:'data', render: d=>formatDateLocal(d.data)}, 
                                        {header:'Turma', key:'turma_id', render: l => turmasFiltradas.find(t=>t.id===l.turma_id)?.nome}, 
                                        {header:'Revista/Tema', key:'revista', render: l => {
                                            const manualOrMagazineCapa = l.capa && l.capa !== 'null' ? l.capa : ((db.ebd?.licoes || []).find((x: any) => x.revista === l.revista && x.capa && x.capa !== 'null')?.capa || null);
                                            return (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-14 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                                                        {manualOrMagazineCapa ? (
                                                            <img src={manualOrMagazineCapa} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Capa" />
                                                        ) : (
                                                            <BookOpen size={16} />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3">
                                                        <span className="font-semibold text-slate-800 break-all">{l.revista}</span>
                                                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                                                            {isLicaoNova(l) && (
                                                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[7px] font-black bg-amber-500 text-white rounded border border-amber-600/10 shadow-3xs animate-pulse">
                                                                    <Sparkles size={7} className="text-white fill-white" /> NOVO
                                                                </span>
                                                            )}
                                                            {downloadedLessons.includes(l.id || l.licao_numero) && (
                                                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[7px] font-black bg-emerald-500 text-white rounded border border-emerald-600/10 shadow-3xs">
                                                                    <Check size={8} /> OFFLINE
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }}, 
                                        {header:'Lição', key:'licao_numero'}, 
                                        {header:'Presentes', key:'qtd_presentes'}
                                    ]} 
                                    customActions={(item) => (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {downloadingIds.includes(item.id || item.licao_numero) ? (
                                                <button disabled className="p-2.5 bg-slate-150 border border-slate-200 text-slate-500 rounded-xl flex items-center gap-1 text-[10px] uppercase font-bold animate-pulse">
                                                    <Loader2 size={16} className="animate-spin" /> ...
                                                </button>
                                            ) : downloadedLessons.includes(item.id || item.licao_numero) ? (
                                                <button 
                                                    onClick={(e) => handleDeleteOfflineCache(item, e)}
                                                    className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm flex items-center gap-1" 
                                                    title="Excluir lição offline do aparelho"
                                                >
                                                    <Trash size={16} />
                                                    <span className="hidden lg:inline text-[10px] font-bold uppercase">Excluir</span>
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={(e) => handleDownloadForOffline(item, e)}
                                                    className="p-2.5 bg-indigo-50/50 border border-indigo-150 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-sm flex items-center gap-1" 
                                                    title="Pré-carregar Lição para uso sem internet"
                                                >
                                                    <DownloadCloud size={16} />
                                                    <span className="hidden lg:inline text-[10px] font-bold uppercase">Pré-carregar</span>
                                                </button>
                                            )}
                                            
                                            <button 
                                                onClick={() => handleGenerateLessonPlan(item)} 
                                                className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm flex items-center gap-1" 
                                                title="Estudar Lição Interativa"
                                            >
                                                <BookOpenText size={18}/> 
                                                <span className="hidden lg:inline text-[10px] font-bold uppercase">Estudar com IA</span>
                                            </button>
                                        </div>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                )}
                {tab === 5 && (
                    <div className="h-full flex flex-col animate-fadeIn">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <div>
                                <h3 className="text-xl font-bold text-slate-700">Mural Detalhado das Turmas</h3>
                                <p className="text-xs text-slate-500 font-medium">Informações completas de professores e alunos por classe.</p>
                            </div>
                            <Button onClick={() => openModal('ebd_turma')} variant="primary" className="shadow-blue-500/20"><Plus size={18}/> Nova Turma</Button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {turmasFiltradas.map(turma => {
                                const profs = [turma.prof1_id, turma.prof2_id, turma.prof3_id].filter(Boolean).map(id => db.membros.find(m => m.id === id));
                                const alunosDaTurma = alunosFiltrados.filter(a => a.turma_id === turma.id);
                                return (
                                    <div key={turma.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                        <div className="bg-blue-600 p-5 text-white flex justify-between items-center">
                                            <div>
                                                <h4 className="font-black text-xl tracking-tight">{turma.nome}</h4>
                                                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><MapPin size={12}/> {turma.sala || 'Sala Principal'}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                                <Users size={24}/>
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col gap-5">
                                            {/* Ações Rápidas da Turma */}
                                            <div className="grid grid-cols-2 gap-2 shrink-0 pb-3 border-b border-slate-100">
                                                <button
                                                    onClick={() => openChamadaModal(turma)}
                                                    className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                                    title="Realizar chamada interativa na classe"
                                                >
                                                    <UserCheck size={14}/> Fazer Chamada
                                                </button>
                                                <button
                                                    onClick={() => openModal('ebd_aluno', { turma_id: turma.id })}
                                                    className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 font-black text-[10px] uppercase tracking-wider border border-slate-200/85 hover:border-indigo-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
                                                    title="Matricular novo aluno nesta turma"
                                                >
                                                    <UserPlus size={14}/> Matricular +
                                                </button>
                                            </div>

                                            <div>
                                                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-slate-100 pb-2"><Briefcase size={14} className="text-blue-500"/> Corpo Docente</h5>
                                                <div className="space-y-2">
                                                    {profs.map((p, idx) => p && (
                                                        <div key={idx} className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100">{(p.nome || '?').charAt(0)}</div>
                                                            <div>
                                                                <p className="font-bold text-sm text-slate-800 leading-none">{p.nome || 'Sem Nome'}</p>
                                                                <p className="text-[10px] text-slate-500">Professor(a)</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {profs.length === 0 && <p className="text-xs text-slate-400 italic">Sem professores definidos.</p>}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-end mb-3 border-b border-slate-100 pb-2">
                                                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><GraduationCap size={14} className="text-emerald-500"/> Alunos Matriculados</h5>
                                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{alunosDaTurma.length}</span>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                                                    {alunosDaTurma.map((aluno, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                                            <span className="font-bold text-xs text-slate-700">{aluno.nome}</span>
                                                            <button onClick={() => deleteItem('ebd_aluno', aluno.id)} className="text-rose-400 hover:text-rose-600 p-1" title="Remover Matrícula"><X size={14}/></button>
                                                        </div>
                                                    ))}
                                                    {alunosDaTurma.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum aluno matriculado nesta turma.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {turmasFiltradas.length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                                    <Layers size={48} className="mx-auto mb-4 opacity-50"/>
                                    <p className="font-bold text-lg">Sem turmas cadastradas.</p>
                                    <p className="text-sm mt-1">Crie uma nova turma para começar a organizar a sua EBD.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 6 && (() => {
                    const selectedProfTurma = turmasFiltradas.find(t => t.id === profSelectedTurmaId);
                    
                    const formatDateStr = (dateString?: string) => {
                        if (!dateString) return 'Não informado';
                        try {
                            const parts = dateString.split('-');
                            if (parts.length === 3) {
                                return `${parts[2]}/${parts[1]}/${parts[0]}`;
                            }
                            return dateString;
                        } catch (e) {
                            return dateString;
                        }
                    };

                    return (
                        <div className="h-full flex flex-col animate-fadeIn gap-6 pb-12 text-slate-700">
                            {/* Selector and General Info */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-105 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
                                <div className="flex-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Classe de EBD que você está Gerenciando</label>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <select 
                                            value={profSelectedTurmaId} 
                                            onChange={(e) => {
                                                setProfSelectedTurmaId(e.target.value);
                                                setProfSelectedAlunoId('');
                                            }}
                                            className="bg-white p-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 outline-none shadow-xs focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">-- Selecione uma Classe --</option>
                                            {turmasFiltradas.map(t => (
                                                <option key={t.id} value={t.id}>{t.nome}</option>
                                            ))}
                                        </select>
                                        {selectedProfTurma && (
                                            <span className="text-xs bg-indigo-100/75 text-indigo-700 px-3 py-1.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1.5">
                                                <MapPin size={12}/> {selectedProfTurma.sala || 'Sala Principal'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {selectedProfTurma && (
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => openChamadaModal(selectedProfTurma)}
                                            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer"
                                        >
                                            <UserCheck size={16}/> Chamar Frequência
                                        </button>
                                        <button
                                            onClick={() => openModal('ebd_aluno', { turma_id: selectedProfTurma.id })}
                                            className="px-5 py-3 bg-white hover:bg-slate-5  text-slate-600 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-slate-200/80 flex items-center gap-2 cursor-pointer"
                                        >
                                            <UserPlus size={16}/> Matricular Aluno
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!selectedProfTurma ? (
                                <div className="flex-1 py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                                    <GraduationCap size={56} className="mx-auto mb-4 text-indigo-400 animate-bounce"/>
                                    <h4 className="font-bold text-lg text-slate-700">Selecione uma Classe</h4>
                                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Abra o menu de seleção acima para escolher qual classe da Escola Bíblica você deseja gerenciar no momento.</p>
                                </div>
                            ) : (() => {
                                const alunosDaTurma = alunosFiltrados.filter(a => a.turma_id === selectedProfTurma.id);
                                
                                // Calculate classroom cash balance
                                const transactions = selectedProfTurma.caixa_transacoes || [];
                                const totalEntradas = transactions.filter((t: any) => t.tipo === 'entrada').reduce((sum: number, t: any) => sum + (parseFloat(t.valor) || 0), 0);
                                const totalSaidas = transactions.filter((t: any) => t.tipo === 'saida').reduce((sum: number, t: any) => sum + (parseFloat(t.valor) || 0), 0);
                                const caixaSaldo = totalEntradas - totalSaidas;

                                return (
                                    <div className="flex flex-col gap-6 animate-fadeIn">
                                        {/* Class Metrics Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-xs flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alunos Matriculados</p>
                                                    <h4 className="text-xl font-black text-slate-800 mt-1">{alunosDaTurma.length}</h4>
                                                </div>
                                                <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
                                                    <Users size={18}/>
                                                </div>
                                            </div>

                                            <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-xs flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aulas no Trimestre</p>
                                                    <h4 className="text-xl font-black text-indigo-800 mt-1">{selectedProfTurma.cronograma?.length || 0}</h4>
                                                </div>
                                                <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
                                                    <BookOpen size={18}/>
                                                </div>
                                            </div>

                                            <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-xs flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controle de Mão (Caixa)</p>
                                                    <h4 className={`text-xl font-black mt-1 ${caixaSaldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        R$ {caixaSaldo.toFixed(2)}
                                                    </h4>
                                                </div>
                                                <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                                                    <Wallet size={18}/>
                                                </div>
                                            </div>

                                            <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-xs flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avisos no Painel</p>
                                                    <h4 className="text-xl font-black text-purple-800 mt-1">{selectedProfTurma.mural_avisos?.length || 0}</h4>
                                                </div>
                                                <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100">
                                                    <Megaphone size={18}/>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Secondary Navigation tabs */}
                                        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto shrink-0 py-1 font-bold">
                                            <button 
                                                onClick={() => setProfActiveSubTab('alunos')} 
                                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer ${profActiveSubTab === 'alunos' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                            >
                                                👥 Alunos & Diário Pastoral
                                            </button>
                                            <button 
                                                onClick={() => setProfActiveSubTab('pedagogico')} 
                                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer ${profActiveSubTab === 'pedagogico' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                            >
                                                📖 Conteúdo & Aulas (Pedagógico)
                                            </button>
                                            <button 
                                                onClick={() => setProfActiveSubTab('suporte')} 
                                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer ${profActiveSubTab === 'suporte' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                            >
                                                💼 Caixa & Recursos (Suporte)
                                            </button>
                                            <button 
                                                onClick={() => setProfActiveSubTab('avisos')} 
                                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer ${profActiveSubTab === 'avisos' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                            >
                                                📢 Comunicação & Avisos
                                            </button>
                                        </div>

                                        {/* Sub-tab 1: ALUNOS & FREQUENCIA */}
                                        {profActiveSubTab === 'alunos' && (
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                                                {/* Student List (Left Column) */}
                                                <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4">
                                                    <div>
                                                        <h4 className="font-extrabold text-slate-700 text-xs">Alunos ({alunosDaTurma.length})</h4>
                                                        <p className="text-[10px] text-slate-400 font-medium">Clique no aluno para ver o histórico pastoral e métricas de engajamento</p>
                                                    </div>
                                                    
                                                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar flex flex-col gap-1.5">
                                                        {alunosDaTurma.map(aluno => {
                                                            const userBirthMonth = aluno.data_nascimento ? new Date(aluno.data_nascimento).getMonth() : -1;
                                                            const currentMonth = new Date().getMonth();
                                                            const isBirthdayMonth = userBirthMonth === currentMonth;

                                                            return (
                                                                <div 
                                                                    key={aluno.id}
                                                                    onClick={() => setProfSelectedAlunoId(aluno.id)}
                                                                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${profSelectedAlunoId === aluno.id ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200 shadow-xs">
                                                                            {(aluno.nome || '?').charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-extrabold text-xs text-slate-700 leading-none">{aluno.nome}</p>
                                                                            <p className="text-[9px] text-slate-400 mt-1">{aluno.celular || 'Sem celular'}</p>
                                                                        </div>
                                                                    </div>

                                                                    {isBirthdayMonth && (
                                                                        <span className="text-[9px] bg-rose-50 text-rose-650 px-2 py-0.5 rounded-full border border-rose-100 font-bold flex items-center gap-1 animate-pulse">
                                                                            🎂 Mês Niver
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}

                                                        {alunosDaTurma.length === 0 && (
                                                            <div className="text-center py-12 text-slate-400">
                                                                <Users size={32} className="mx-auto mb-2 opacity-40"/>
                                                                <p className="font-bold text-xs">Membro nenhum cadastrado.</p>
                                                                <p className="text-[10px] mt-0.5">Use o botão "Matricular Aluno" no topo.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Detailed Pupil Area (Right Column) */}
                                                <div className="lg:col-span-8 flex flex-col gap-6">
                                                    {(() => {
                                                        const activeAluno = db.ebd?.alunos?.find(a => a.id === profSelectedAlunoId);
                                                        if (!activeAluno) {
                                                            return (
                                                                <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xs text-center text-slate-450 flex flex-col justify-center items-center h-full min-h-[300px]">
                                                                    <UserCircle size={44} className="text-slate-300 mb-3"/>
                                                                    <h4 className="font-bold text-slate-600 text-sm">Prontuário Pedagógico</h4>
                                                                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Escolha um aluno na listagem à esquerda para consultar dados pessoais de comunicação, relatórios de assiduidade e anotações espirituais pastorais.</p>
                                                                </div>
                                                            );
                                                        }

                                                        // Calculate Student specific metrics
                                                        const classLessons = (db.ebd?.licoes || []).filter(l => l.turma_id === selectedProfTurma.id);
                                                        const lessonCountWithAttendance = classLessons.filter(l => l.detalhes_chamada).length;
                                                        
                                                        const presentCount = classLessons.filter(l => l.detalhes_chamada?.[activeAluno.id]?.presente).length;
                                                        const bibleCount = classLessons.filter(l => l.detalhes_chamada?.[activeAluno.id]?.trouxeBiblia).length;
                                                        const magazineCount = classLessons.filter(l => l.detalhes_chamada?.[activeAluno.id]?.trouxeRevista).length;
                                                        const offerCount = classLessons.filter(l => l.detalhes_chamada?.[activeAluno.id]?.oferta).length;

                                                        const presencaRate = lessonCountWithAttendance > 0 ? Math.round((presentCount / lessonCountWithAttendance) * 100) : 0;
                                                        const bibliaRate = lessonCountWithAttendance > 0 ? Math.round((bibleCount / lessonCountWithAttendance) * 100) : 0;
                                                        const revistaRate = lessonCountWithAttendance > 0 ? Math.round((magazineCount / lessonCountWithAttendance) * 100) : 0;
                                                        const ofertaRate = lessonCountWithAttendance > 0 ? Math.round((offerCount / lessonCountWithAttendance) * 100) : 0;

                                                        return (
                                                            <div className="flex flex-col gap-6 animate-fadeIn">
                                                                {/* Student Profile Card */}
                                                                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center font-black text-lg text-indigo-600 shadow-xs">
                                                                            {(activeAluno.nome || '?').charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-extrabold text-sm text-slate-800 leading-tight">{activeAluno.nome}</h4>
                                                                            <div className="flex flex-col sm:flex-row gap-x-4 mt-1 text-[11px] text-slate-500 font-medium">
                                                                                <span>🎂 Nasc: {formatDateStr(activeAluno.data_nascimento)}</span>
                                                                                {activeAluno.celular && (
                                                                                    <span>📞 {activeAluno.celular}</span>
                                                                                )}
                                                                            </div>
                                                                            {activeAluno.membro_status && (
                                                                                <span className="inline-block mt-2 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase border border-emerald-100">
                                                                                    {activeAluno.membro_status}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                                        {activeAluno.celular && (
                                                                            <a
                                                                                href={`https://api.whatsapp.com/send?phone=55${activeAluno.celular.replace(/\D/g, '')}`}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-all text-center flex-1 sm:flex-initial cursor-pointer"
                                                                            >
                                                                                <Phone size={13}/> WhatsApp
                                                                            </a>
                                                                        )}
                                                                        <button 
                                                                            onClick={() => {
                                                                                setTemplateSelectedAlunoId(activeAluno.id);
                                                                                setActiveTemplateType('aniversario');
                                                                                setProfActiveSubTab('avisos');
                                                                            }}
                                                                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-all border border-rose-100 flex-1 sm:flex-initial cursor-pointer"
                                                                        >
                                                                            <Gift size={13}/> Niver SMS
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Student Engagement Metrics Dashboard */}
                                                                <div className="bg-gradient-to-br from-slate-50 to-indigo-50/20 p-5 rounded-3xl border border-slate-205 shadow-xs">
                                                                    <div className="mb-3.5">
                                                                        <h5 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">Métricas de Engajamento e Pontualidade</h5>
                                                                        <p className="text-[10px] text-slate-400 font-medium">Índice obtido de todas as listas de chamadas arquivadas neste trimestre</p>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                                        <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center shadow-xs">
                                                                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Presença</span>
                                                                            <h5 className="text-base font-black text-indigo-700 mt-1">{presencaRate}%</h5>
                                                                            <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                                                                                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${presencaRate}%` }}/>
                                                                            </div>
                                                                        </div>

                                                                        <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center shadow-xs">
                                                                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Bíblia</span>
                                                                            <h5 className="text-base font-black text-blue-600 mt-1">{bibliaRate}%</h5>
                                                                            <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                                                                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${bibliaRate}%` }}/>
                                                                            </div>
                                                                        </div>

                                                                        <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center shadow-xs">
                                                                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Revista</span>
                                                                            <h5 className="text-base font-black text-emerald-600 mt-1">{revistaRate}%</h5>
                                                                            <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                                                                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${revistaRate}%` }}/>
                                                                            </div>
                                                                        </div>

                                                                        <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center shadow-xs">
                                                                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Oferta</span>
                                                                            <h5 className="text-base font-black text-amber-600 mt-1">{ofertaRate}%</h5>
                                                                            <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                                                                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${ofertaRate}%` }}/>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Spiritual Accompaniment Section */}
                                                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4">
                                                                    <div>
                                                                        <h5 className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                                                                            <Heart className="text-rose-500" size={16}/> Acompanhamento Pastoral / Espiritual
                                                                        </h5>
                                                                        <p className="text-[10px] text-slate-400 font-medium">Anote necessidades de oração, decisões de batismo, dízimo ou visitas domiciliares</p>
                                                                    </div>

                                                                    {/* Create Annotation Form */}
                                                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-3">
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                            <div>
                                                                                <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Categoria do Registro</label>
                                                                                <select 
                                                                                    value={novoAcompanhamentoTipo} 
                                                                                    onChange={(e: any) => setNovoAcompanhamentoTipo(e.target.value)}
                                                                                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none shadow-xs"
                                                                                >
                                                                                    <option value="observacao">📝 Observação Geral</option>
                                                                                    <option value="pedido_oracao">🙏 Pedido de Oração</option>
                                                                                    <option value="visita">🏠 Visita Necessária</option>
                                                                                    <option value="decisao_fe">🕊 Decisão de Fé</option>
                                                                                </select>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <label className="text-[10px] font-extrabold text-slate-500 uppercase block mb-1">Nota Pastoral</label>
                                                                            <textarea 
                                                                                value={novoAcompanhamentoAnotacao}
                                                                                onChange={(e) => setNovoAcompanhamentoAnotacao(e.target.value)}
                                                                                placeholder="Ex: Alunto manifestou desejo de participar do próximo batismo. Solicitar visita pastoral."
                                                                                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 outline-none h-16 resize-none shadow-xs"
                                                                            />
                                                                        </div>

                                                                        <div className="flex justify-end">
                                                                            <button
                                                                                onClick={async () => {
                                                                                    if (!novoAcompanhamentoAnotacao.trim()) return addToast("Descreva o histórico.", "warning");
                                                                                    const current = activeAluno.acompanhamento_espiritual || [];
                                                                                    const updated = [...current, {
                                                                                        id: Date.now().toString(),
                                                                                        data: getTodayDate(),
                                                                                        anotacao: novoAcompanhamentoAnotacao,
                                                                                        tipo: novoAcompanhamentoTipo
                                                                                    }];
                                                                                    await handleUpdateAlunoField(activeAluno.id, 'acompanhamento_espiritual', updated);
                                                                                    setNovoAcompanhamentoAnotacao('');
                                                                                }}
                                                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer"
                                                                            >
                                                                                Adicionar Notas Pastoral
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Annotation Timeline */}
                                                                    <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                                                                        {[(activeAluno.acompanhamento_espiritual || [])].flat().slice().reverse().map((item: any) => {
                                                                            if (!item || !item.id) return null;
                                                                            
                                                                            const typeBadgeMap = {
                                                                                observacao: { bg: 'bg-slate-50 text-slate-600 border-slate-100', label: '📝 Observação' },
                                                                                pedido_oracao: { bg: 'bg-rose-50 text-rose-600 border-rose-100', label: '🙏 Pedido Oração' },
                                                                                visita: { bg: 'bg-amber-50 text-amber-600 border-amber-100', label: '🏠 Visita' },
                                                                                decisao_fe: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: '🕊 Decisão de Fé' }
                                                                            };

                                                                            const b = typeBadgeMap[item.tipo] || typeBadgeMap.observacao;

                                                                            return (
                                                                                <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-150 flex flex-col gap-1.5 relative hover:border-slate-350 transition-all">
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${b.bg}`}>
                                                                                            {b.label}
                                                                                        </span>
                                                                                        <div className="flex items-center gap-1.5">
                                                                                            <span className="text-[9px] font-bold text-slate-400">{formatDateStr(item.data)}</span>
                                                                                            <button 
                                                                                                onClick={async () => {
                                                                                                    const filtered = (activeAluno.acompanhamento_espiritual || []).filter((x: any) => x.id !== item.id);
                                                                                                    await handleUpdateAlunoField(activeAluno.id, 'acompanhamento_espiritual', filtered);
                                                                                                }}
                                                                                                className="text-rose-400 hover:text-rose-600 p-0.5" 
                                                                                            >
                                                                                                <Trash2 size={12}/>
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <p className="text-[11px] text-slate-700 leading-normal font-medium whitespace-pre-wrap">{item.anotacao}</p>
                                                                                </div>
                                                                            );
                                                                        })}

                                                                        {(activeAluno.acompanhamento_espiritual || []).length === 0 && (
                                                                            <p className="text-[11px] text-slate-400 italic text-center py-4">Sem registros ainda.</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sub-tab 2: PEDAGOGICO */}
                                        {profActiveSubTab === 'pedagogico' && (
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fadeIn">
                                                {/* Classes Schedule - Trimester Cronograma */}
                                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4">
                                                    <div>
                                                        <h4 className="font-extrabold text-[13px] text-slate-700 flex items-center gap-1.5"><Calendar size={16} className="text-blue-500"/> Cronograma de Leituras & Lições</h4>
                                                        <p className="text-[10px] text-slate-400 font-medium">Divida as lições bíblicas oficiais pelas datas do calendário do trimestre</p>
                                                    </div>

                                                    {/* Form schedule input */}
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3">
                                                        <div className="sm:col-span-4">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Data Dominical</label>
                                                            <input type="date" value={novoCronogramaData} onChange={e => setNovoCronogramaData(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-bold outline-none"/>
                                                        </div>
                                                        <div className="sm:col-span-3">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Número Lição</label>
                                                            <input type="number" placeholder="Ex: 5" value={novoCronogramaLicaoNum} onChange={e => setNovoCronogramaLicaoNum(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-bold outline-none"/>
                                                        </div>
                                                        <div className="sm:col-span-5">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Data Comemorativa / Festa (opcional)</label>
                                                            <input type="text" placeholder="Ex: Círculo de Oração" value={novoCronogramaComemorativa} onChange={e => setNovoCronogramaComemorativa(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-bold outline-none"/>
                                                        </div>
                                                        <div className="sm:col-span-12">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Tema Oficial da Revista</label>
                                                            <input type="text" placeholder="Ex: A Armadura de Deus para Guerrear" value={novoCronogramaTema} onChange={e => setNovoCronogramaTema(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs outline-none"/>
                                                        </div>
                                                        <div className="sm:col-span-12">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Objetivo Bíblico Principal</label>
                                                            <input type="text" placeholder="Ex: Compreender a importância de orar sem esmorecer" value={novoCronogramaObjetivo} onChange={e => setNovoCronogramaObjetivo(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs outline-none"/>
                                                        </div>
                                                        <div className="sm:col-span-12 flex justify-end">
                                                            <button
                                                                onClick={async () => {
                                                                    if (!novoCronogramaTema.trim() || !novoCronogramaLicaoNum) return addToast("Preencha tema e número da lição.", "warning");
                                                                    const current = selectedProfTurma.cronograma || [];
                                                                    const updated = [...current, {
                                                                        id: Date.now().toString(),
                                                                        data: novoCronogramaData,
                                                                        licao_numero: novoCronogramaLicaoNum,
                                                                        tema: novoCronogramaTema,
                                                                        comemorativa: novoCronogramaComemorativa,
                                                                        objetivo: novoCronogramaObjetivo
                                                                    }].sort((a,b) => new Date(a.data).getTime() - new Date(b.data).getTime());
                                                                    await handleUpdateTurmaField(selectedProfTurma.id, 'cronograma', updated);
                                                                    setNovoCronogramaLicaoNum('');
                                                                    setNovoCronogramaTema('');
                                                                    setNovoCronogramaComemorativa('');
                                                                    setNovoCronogramaObjetivo('');
                                                                }}
                                                                className="px-3.5 py-1.8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                                                            >
                                                                Adicionar no Cronograma
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Listings */}
                                                    <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                                                        {(selectedProfTurma.cronograma || []).map((item: any) => (
                                                            <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-150 flex justify-between gap-3 shadow-xs">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[8px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                                                                            Lição {item.licao_numero}
                                                                        </span>
                                                                        {item.comemorativa && (
                                                                            <span className="text-[8px] font-black bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-100">
                                                                                🎉 {item.comemorativa}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h5 className="font-extrabold text-xs text-slate-800 mt-1">{item.tema}</h5>
                                                                    {item.objetivo && <p className="text-[9px] text-slate-500 font-medium italic mt-0.5">Objetivo: {item.objetivo}</p>}
                                                                </div>
                                                                <div className="flex flex-col items-end justify-between shrink-0">
                                                                    <span className="text-[9px] font-bold text-slate-400">{formatDateStr(item.data)}</span>
                                                                    <button
                                                                        onClick={async () => {
                                                                            const filtered = (selectedProfTurma.cronograma || []).filter((x: any) => x.id !== item.id);
                                                                            await handleUpdateTurmaField(selectedProfTurma.id, 'cronograma', filtered);
                                                                        }}
                                                                        className="text-rose-400 hover:text-rose-600 p-0.5"
                                                                    >
                                                                        <Trash2 size={12}/>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {(selectedProfTurma.cronograma || []).length === 0 && (
                                                            <p className="text-xs text-slate-450 italic text-center py-4">Sem aulas cadastradas no cronograma ainda.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Lesson Plan Builder */}
                                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4">
                                                    <div>
                                                        <h4 className="font-extrabold text-[13px] text-slate-700 flex items-center gap-1.5"><PenTool size={16} className="text-indigo-500"/> Diário de Plano de Aula</h4>
                                                        <p className="text-[10px] text-slate-400 font-medium">Esboço prático da lição com quebra-gelo, objetivos e dinâmicas pedagógicas</p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <select
                                                            value={selectedPlanoLicaoId}
                                                            onChange={(e) => {
                                                                const lid = e.target.value;
                                                                setSelectedPlanoLicaoId(lid);
                                                                const existingPlan = (selectedProfTurma.planos_aula || []).find((p: any) => p.licao_id === lid);
                                                                if (existingPlan) {
                                                                    setPlanoObjetivo(existingPlan.objetivo || '');
                                                                    setPlanoQuebraGelo(existingPlan.quebra_gelo || '');
                                                                    setPlanoAplicacao(existingPlan.aplicacao || '');
                                                                    setPlanoDinamica(existingPlan.dinamica || '');
                                                                } else {
                                                                    setPlanoObjetivo('');
                                                                    setPlanoQuebraGelo('');
                                                                    setPlanoAplicacao('');
                                                                    setPlanoDinamica('');
                                                                }
                                                            }}
                                                            className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-bold outline-none"
                                                        >
                                                            <option value="">-- Selecionar Lição do Cronograma --</option>
                                                            {(selectedProfTurma.cronograma || []).map((item: any) => (
                                                                <option key={item.id} value={item.id}>Lição {item.licao_numero} • {item.tema}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {selectedPlanoLicaoId ? (
                                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3 animate-fadeIn">
                                                            <div>
                                                                <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Objetivo de Aprendizagem</label>
                                                                <input type="text" placeholder="Entender a graça de Deus..." value={planoObjetivo} onChange={e => setPlanoObjetivo(e.target.value)} className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs outline-none shadow-xs"/>
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Pergunta Quebra-Gelo (Introdução)</label>
                                                                <textarea placeholder="O que você faria se..." value={planoQuebraGelo} onChange={e => setPlanoQuebraGelo(e.target.value)} className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs outline-none h-12 resize-none shadow-xs"/>
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Aplicação Prática no Cotidiano</label>
                                                                <textarea placeholder="Como aplicar no dia a dia com a família..." value={planoAplicacao} onChange={e => setPlanoAplicacao(e.target.value)} className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs outline-none h-12 resize-none shadow-xs"/>
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Dinâmica Pedagógica / Atividades do Dia</label>
                                                                <input type="text" placeholder="Competição bíblica em grupo, questionário..." value={planoDinamica} onChange={e => setPlanoDinamica(e.target.value)} className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs outline-none shadow-xs"/>
                                                            </div>

                                                            <div className="flex justify-end mt-1">
                                                                <button
                                                                    onClick={async () => {
                                                                        const current = selectedProfTurma.planos_aula || [];
                                                                        const filtered = current.filter((x: any) => x.licao_id !== selectedPlanoLicaoId);
                                                                        const updated = [...filtered, {
                                                                            licao_id: selectedPlanoLicaoId,
                                                                            objetivo: planoObjetivo,
                                                                            quebra_gelo: planoQuebraGelo,
                                                                            aplicacao: planoAplicacao,
                                                                            dinamica: planoDinamica
                                                                        }];
                                                                        await handleUpdateTurmaField(selectedProfTurma.id, 'planos_aula', updated);
                                                                    }}
                                                                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-xs"
                                                                >
                                                                    Salvar Plano de Aula
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center p-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs italic">
                                                            Escolha uma das lições do cronograma para registrar o plano pedagógico de classe.
                                                        </div>
                                                    )}
                                                </div>

                                                {/* File repository */}
                                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4">
                                                    <div>
                                                        <h4 className="font-extrabold text-[13px] text-slate-700 flex items-center gap-1.5"><UploadCloud size={16} className="text-emerald-500"/> Repositório de Revistas, Slides e Mapas</h4>
                                                        <p className="text-[10px] text-slate-400 font-medium">Cadastre PDFs de revistas de apoio, slides ou roteiros adicionais para auxiliar em sala</p>
                                                    </div>

                                                    {/* Form */}
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                                        <div className="sm:col-span-5">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Nome do Arquivo</label>
                                                            <input type="text" placeholder="Ex: Revista 4T PDF" value={novoArquivoNome} onChange={e => setNovoArquivoNome(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs outline-none shadow-xs"/>
                                                        </div>
                                                        <div className="sm:col-span-3">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Tipo</label>
                                                            <select value={novoArquivoCategoria} onChange={e => setNovoArquivoCategoria(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-bold outline-none shadow-xs">
                                                                <option value="pdf">📕 PDF</option>
                                                                <option value="slide">💻 Slide PPT</option>
                                                                <option value="mapa">🌍 Mapa Bíblico</option>
                                                                <option value="video">🎥 Vídeo</option>
                                                            </select>
                                                        </div>
                                                        <div className="sm:col-span-4">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Link de Acesso (Drive/Drive/YouTube)</label>
                                                            <input type="text" placeholder="https://" value={novoArquivoUrl} onChange={e => setNovoArquivoUrl(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs outline-none shadow-xs"/>
                                                        </div>
                                                        <div className="sm:col-span-12 flex justify-end">
                                                            <button
                                                                onClick={async () => {
                                                                    if (!novoArquivoNome.trim() || !novoArquivoUrl.trim()) return addToast("Preencha nome e URL.", "warning");
                                                                    const current = selectedProfTurma.repositorio_arquivos || [];
                                                                    const updated = [...current, {
                                                                        id: Date.now().toString(),
                                                                        nome: novoArquivoNome,
                                                                        categoria: novoArquivoCategoria,
                                                                        url: novoArquivoUrl
                                                                    }];
                                                                    await handleUpdateTurmaField(selectedProfTurma.id, 'repositorio_arquivos', updated);
                                                                    setNovoArquivoNome('');
                                                                    setNovoArquivoUrl('');
                                                                }}
                                                                className="px-3.5 py-1.8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-xs"
                                                            >
                                                                Arquivar Link
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* File lists */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto custom-scrollbar">
                                                        {(selectedProfTurma.repositorio_arquivos || []).map((file: any) => {
                                                            const iconM = { pdf: '📕', slide: '💻', mapa: '🌍', video: '🎥' };
                                                            return (
                                                                <div key={file.id} className="p-2.5 bg-white rounded-xl border border-slate-150 flex items-center justify-between gap-2.5 hover:border-slate-300 shadow-xs">
                                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                                        <span className="text-base shrink-0">{iconM[file.categoria] || '📄'}</span>
                                                                        <div className="overflow-hidden">
                                                                            <h5 className="font-extrabold text-[11px] text-slate-800 leading-none truncate">{file.nome}</h5>
                                                                            <a href={file.url} target="_blank" rel="noreferrer" className="text-[8px] text-blue-500 font-bold hover:underline mt-1 block">
                                                                                Acessar <ExternalLink size={8} className="inline"/>
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={async () => {
                                                                            const filtered = (selectedProfTurma.repositorio_arquivos || []).filter((x: any) => x.id !== file.id);
                                                                            await handleUpdateTurmaField(selectedProfTurma.id, 'repositorio_arquivos', filtered);
                                                                        }}
                                                                        className="text-rose-455 hover:text-rose-600 p-0.5 shrink-0"
                                                                    >
                                                                        <X size={12}/>
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}

                                                        {(selectedProfTurma.repositorio_arquivos || []).length === 0 && (
                                                            <div className="col-span-full py-4 text-center text-slate-400 italic text-xs">
                                                                Nenhum anexo registrado neste almoxarifado virtual.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Atividades e tarefas e desafios */}
                                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4">
                                                    <div>
                                                        <h4 className="font-extrabold text-[13px] text-slate-700 flex items-center gap-1.5"><Target size={16} className="text-blue-500"/> Atividades & Desafios Semanais</h4>
                                                        <p className="text-[10px] text-slate-400 font-medium font-medium">Proponha tarefas de leitura bíblica, atividades teológicas ou gincanas fora de classe</p>
                                                    </div>

                                                    {/* Form */}
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Título do Desafio</label>
                                                                <input type="text" placeholder="Ex: Ler Hebreus 11" value={novaAtividadeTitulo} onChange={e => setNovaAtividadeTitulo(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs outline-none shadow-xs"/>
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Zelo / Estilo</label>
                                                                <select value={novaAtividadeTipo} onChange={e => setNovaAtividadeTipo(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs font-bold outline-none shadow-xs">
                                                                    <option value="leitura">📖 Leitura Semanal</option>
                                                                    <option value="decorar">🧠 Memorização Versículo</option>
                                                                    <option value="questionario">✏ Questionário Trimestral</option>
                                                                    <option value="outro">🎯 Outra Gincana</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div className="col-span-2">
                                                                <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Descrição Curta / Instruções</label>
                                                                <input type="text" placeholder="Ler e grifar palavras-chave..." value={novaAtividadeDescricao} onChange={e => setNovaAtividadeDescricao(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs outline-none shadow-xs"/>
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Prazo Entrega</label>
                                                                <input type="date" value={novaAtividadeEntrega} onChange={e => setNovaAtividadeEntrega(e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 bg-white text-xs outline-none shadow-xs"/>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <button
                                                                onClick={async () => {
                                                                    if (!novaAtividadeTitulo.trim()) return addToast("Preencha o título.", "warning");
                                                                    const current = selectedProfTurma.atividades_desafios || [];
                                                                    const updated = [...current, {
                                                                        id: Date.now().toString(),
                                                                        titulo: novaAtividadeTitulo,
                                                                        descricao: novaAtividadeDescricao,
                                                                        tipo: novaAtividadeTipo,
                                                                        deadline: novaAtividadeEntrega
                                                                    }];
                                                                    await handleUpdateTurmaField(selectedProfTurma.id, 'atividades_desafios', updated);
                                                                    setNovaAtividadeTitulo('');
                                                                    setNovaAtividadeDescricao('');
                                                                    setNovaAtividadeEntrega('');
                                                                }}
                                                                className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-xs"
                                                            >
                                                                Enviar Atividade
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                                                        {(selectedProfTurma.atividades_desafios || []).map((chal: any) => {
                                                            const mapB = { leitura: '📖 Leitura', decorar: '🧠 Memorização', questionario: '✏ Questionário', outro: '🎯 Gincana' };
                                                            return (
                                                                <div key={chal.id} className="p-3 bg-white rounded-xl border border-slate-150 flex justify-between gap-3 shadow-xs">
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[8px] font-extrabold bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded-md">
                                                                                {mapB[chal.tipo] || mapB.outro}
                                                                            </span>
                                                                            {chal.deadline && (
                                                                                <span className="text-[9px] font-bold text-slate-400">Até: {formatDateStr(chal.deadline)}</span>
                                                                            )}
                                                                        </div>
                                                                        <h5 className="font-extrabold text-xs text-slate-800 mt-1">{chal.titulo}</h5>
                                                                        {chal.descricao && <p className="text-[10px] text-slate-500 font-medium">{chal.descricao}</p>}
                                                                    </div>
                                                                    <button
                                                                        onClick={async () => {
                                                                            const filtered = (selectedProfTurma.atividades_desafios || []).filter((x: any) => x.id !== chal.id);
                                                                            await handleUpdateTurmaField(selectedProfTurma.id, 'atividades_desafios', filtered);
                                                                        }}
                                                                        className="text-rose-400 hover:text-rose-600 p-0.5 shrink-0"
                                                                    >
                                                                        <Trash2 size={13}/>
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}

                                                        {(selectedProfTurma.atividades_desafios || []).length === 0 && (
                                                            <p className="text-xs text-slate-400 italic text-center py-4">Sem gincanas ou desafios ativos hoje.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Sub-tab 3: FINANCEIRO */}
                                        {profActiveSubTab === 'suporte' && (
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fadeIn">
                                                {/* Class Petty cash controller */}
                                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4">
                                                    <div>
                                                        <h4 className="font-extrabold text-[13px] text-slate-700 flex items-center gap-1.5"><Wallet size={16} className="text-emerald-500"/> Livro de Caixa de Classe (Tesouraria Básica)</h4>
                                                        <p className="text-[10px] text-slate-400 font-medium font-medium font-medium">Controle as ofertas arrecadadas e as saídas (ex: lanche dos alunos, brindes, lembrancinhas)</p>
                                                    </div>

                                                    {/* Balance card indicator */}
                                                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex justify-between items-center shadow-xs relative overflow-hidden shrink-0 mt-1">
                                                        <div className="relative z-10">
                                                            <p className="text-[10px] font-bold tracking-widest text-slate-300 uppercase leading-none">Saldo Acumulado de Classe</p>
                                                            <h3 className={`text-2xl font-black mt-1.5 ${caixaSaldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                R$ {caixaSaldo.toFixed(2)}
                                                            </h3>
                                                        </div>
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border relative z-10 ${caixaSaldo >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                                            <DollarSign size={20}/>
                                                        </div>
                                                    </div>

                                                    {/* Ledger inputs form */}
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3">
                                                        <div className="sm:col-span-3">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Operação</label>
                                                            <select value={caixaTipo} onChange={(e: any) => setCaixaTipo(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold outline-none">
                                                                <option value="entrada">🟢 Entrada (Oferta)</option>
                                                                <option value="saida">🔴 Saída (Lanche)</option>
                                                            </select>
                                                        </div>
                                                        <div className="sm:col-span-3">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Valor do Lançamento</label>
                                                            <input type="number" step="0.01" placeholder="R$ 0.00" value={caixaValor} onChange={e => setCaixaValor(e.target.value)} className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold outline-none shadow-xs"/>
                                                        </div>
                                                        <div className="sm:col-span-6">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Memorial Descritivo / Finalidade</label>
                                                            <input type="text" placeholder="Ex: Oferta dominical, Refrigerantes pro lanche..." value={caixaDescricao} onChange={e => setCaixaDescricao(e.target.value)} className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs outline-none shadow-xs"/>
                                                        </div>
                                                        <div className="sm:col-span-12 flex justify-end">
                                                            <button
                                                                onClick={async () => {
                                                                    if (!caixaDescricao.trim() || !caixaValor) return addToast("Preencha finalidade e valor.", "warning");
                                                                    const current = selectedProfTurma.caixa_transacoes || [];
                                                                    const updated = [...current, {
                                                                        id: Date.now().toString(),
                                                                        data: getTodayDate(),
                                                                        tipo: caixaTipo,
                                                                        valor: parseFloat(caixaValor),
                                                                        descricao: caixaDescricao
                                                                    }];
                                                                    await handleUpdateTurmaField(selectedProfTurma.id, 'caixa_transacoes', updated);
                                                                    setCaixaValor('');
                                                                    setCaixaDescricao('');
                                                                }}
                                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-xs"
                                                            >
                                                                Lançar no Livro de Caixa
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Petty cash lists */}
                                                    <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                                                        {transactions.slice().reverse().map((t: any) => (
                                                            <div key={t.id} className="p-3 bg-white rounded-xl border border-slate-150 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-base">{t.tipo === 'entrada' ? '🟢' : '🔴'}</span>
                                                                    <div>
                                                                        <h5 className="font-extrabold text-xs text-slate-800 leading-none">{t.descricao}</h5>
                                                                        <p className="text-[9px] text-slate-400 mt-1 font-semibold">{formatDateStr(t.data)}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3 shrink-0">
                                                                    <span className={`font-black text-xs ${t.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                        {t.tipo === 'entrada' ? '+' : '-'} R$ {parseFloat(t.valor).toFixed(2)}
                                                                    </span>
                                                                    <button
                                                                        onClick={async () => {
                                                                            const filtered = transactions.filter((x: any) => x.id !== t.id);
                                                                            await handleUpdateTurmaField(selectedProfTurma.id, 'caixa_transacoes', filtered);
                                                                        }}
                                                                        className="text-rose-400 hover:text-rose-605 p-0.5"
                                                                    >
                                                                        <Trash size={12}/>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {transactions.length === 0 && (
                                                            <p className="text-xs text-slate-400 italic text-center py-4">Nenhuma transação lançada no caixa.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Inventory Controller */}
                                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4">
                                                    <div>
                                                        <h4 className="font-extrabold text-[13px] text-slate-700 flex items-center gap-1.5"><Package size={16} className="text-indigo-500"/> Almoxarifado / Armário Física da Classe</h4>
                                                        <p className="text-[10px] text-slate-400 font-medium font-medium">Controles itens estocados (Bíblias sobressalentes, revistas extras, fita adesiva, lápis do dia)</p>
                                                    </div>

                                                    {/* Form */}
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                                        <div className="sm:col-span-5">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Item / Descrição</label>
                                                            <input type="text" placeholder="Ex: Lápis de cor Faber" value={materialNome} onChange={e => setMaterialNome(e.target.value)} className="w-full p-2 bg-white rounded-xl border border-slate-205 text-xs outline-none shadow-xs"/>
                                                        </div>
                                                        <div className="sm:col-span-3">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Qtd</label>
                                                            <input type="number" placeholder="Ex: 12" value={materialQtd} onChange={e => setMaterialQtd(e.target.value)} className="w-full p-2 bg-white rounded-xl border border-slate-205 text-xs outline-none shadow-xs"/>
                                                        </div>
                                                        <div className="sm:col-span-4">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Status de Conservação</label>
                                                            <select value={materialStatus} onChange={e => setMaterialStatus(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold outline-none shadow-xs">
                                                                <option value="excelente">Excelente ✨</option>
                                                                <option value="bom">Bom 👍</option>
                                                                <option value="desgastado">Desgastado 🛠</option>
                                                                <option value="falta">Em Falta / Repor 🚨</option>
                                                            </select>
                                                        </div>
                                                        <div className="sm:col-span-12">
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-1">Localização física / Armário notas</label>
                                                            <input type="text" placeholder="Ex: Gaveta B do armário no canto superior..." value={materialNotas} onChange={e => setMaterialNotas(e.target.value)} className="w-full p-2 bg-white rounded-xl border border-slate-205 text-xs outline-none shadow-xs"/>
                                                        </div>
                                                        <div className="sm:col-span-12 flex justify-end">
                                                            <button
                                                                onClick={async () => {
                                                                    if (!materialNome.trim() || !materialQtd) return addToast("Preencha o item estatístico.", "warning");
                                                                    const current = selectedProfTurma.inventario_materiais || [];
                                                                    const updated = [...current, {
                                                                        id: Date.now().toString(),
                                                                        nome: materialNome,
                                                                        qtd: parseInt(materialQtd),
                                                                        status: materialStatus,
                                                                        notas: materialNotas
                                                                    }];
                                                                    await handleUpdateTurmaField(selectedProfTurma.id, 'inventario_materiais', updated);
                                                                    setMaterialNome('');
                                                                    setMaterialQtd('');
                                                                    setMaterialNotas('');
                                                                }}
                                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-xs"
                                                            >
                                                                Salvar item no Inventário
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Inventories */}
                                                    <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                                                        {(selectedProfTurma.inventario_materiais || []).map((item: any) => {
                                                            const condStyleM = {
                                                                excelente: 'bg-emerald-50 text-emerald-700 border-emerald-120',
                                                                bom: 'bg-indigo-50 text-indigo-700 border-indigo-120',
                                                                desgastado: 'bg-amber-50 text-amber-700 border-amber-120',
                                                                falta: 'bg-rose-50 text-rose-700 border-rose-120'
                                                            };
                                                            return (
                                                                <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-150 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <h5 className="font-extrabold text-[11px] text-slate-800 leading-tight">{item.nome}</h5>
                                                                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.2 rounded border ${condStyleM[item.status] || condStyleM.bom}`}>
                                                                                {item.status}
                                                                            </span>
                                                                        </div>
                                                                        {item.notas && <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{item.notas}</p>}
                                                                    </div>
                                                                    <div className="flex items-center gap-3.5 shrink-0">
                                                                        {/* Qtd controllers */}
                                                                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                                                                            <button 
                                                                                onClick={async () => {
                                                                                    const updated = (selectedProfTurma.inventario_materiais || []).map((x: any) => {
                                                                                        if (x.id === item.id) return { ...x, qtd: Math.max(0, x.qtd - 1) };
                                                                                        return x;
                                                                                    });
                                                                                    await handleUpdateTurmaField(selectedProfTurma.id, 'inventario_materiais', updated);
                                                                                }}
                                                                                className="text-slate-550 hover:text-indigo-600 font-bold text-xs px-1 select-none cursor-pointer"
                                                                            >
                                                                                -
                                                                            </button>
                                                                            <span className="font-black text-xs text-slate-750 min-w-4 text-center">{item.qtd}</span>
                                                                            <button 
                                                                                onClick={async () => {
                                                                                    const updated = (selectedProfTurma.inventario_materiais || []).map((x: any) => {
                                                                                        if (x.id === item.id) return { ...x, qtd: x.qtd + 1 };
                                                                                        return x;
                                                                                    });
                                                                                    await handleUpdateTurmaField(selectedProfTurma.id, 'inventario_materiais', updated);
                                                                                }}
                                                                                className="text-slate-550 hover:text-indigo-600 font-bold text-xs px-1 select-none cursor-pointer"
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </div>
                                                                        <button
                                                                            onClick={async () => {
                                                                                const filtered = (selectedProfTurma.inventario_materiais || []).filter((x: any) => x.id !== item.id);
                                                                                await handleUpdateTurmaField(selectedProfTurma.id, 'inventario_materiais', filtered);
                                                                            }}
                                                                            className="text-rose-400 hover:text-rose-600 p-0.5 cursor-pointer"
                                                                        >
                                                                            <Trash2 size={12}/>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}

                                                        {(selectedProfTurma.inventario_materiais || []).length === 0 && (
                                                            <p className="text-xs text-slate-400 italic text-center py-4">Sem recursos cadastrados.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Sub-tab 4: MESSAGES & BULLETINS */}
                                        {profActiveSubTab === 'avisos' && (
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                                                {/* Notice Board */}
                                                <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-205 shadow-xs flex flex-col gap-4">
                                                    <div>
                                                        <h4 className="font-extrabold text-[13px] text-slate-700 flex items-center gap-1.5"><Newspaper size={16} className="text-purple-500"/> Mural de Avisos de Classe</h4>
                                                        <p className="text-[10px] text-slate-400 font-medium font-medium">Escreva informativos que aparecem no feed da igreja ou avisos para pais</p>
                                                    </div>

                                                    {/* Notice add */}
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                                            <div className="sm:col-span-8">
                                                                <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Assunto / Título do Recado</label>
                                                                <input type="text" placeholder="Ex: Próximo domingo teremos lanche especial" value={avisoTitulo} onChange={e => setAvisoTitulo(e.target.value)} className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs outline-none shadow-xs"/>
                                                            </div>
                                                            <div className="sm:col-span-4">
                                                                <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Sinalizador / Tom do Aviso</label>
                                                                <select value={avisoTipo} onChange={(e: any) => setAvisoTipo(e.target.value)} className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold outline-none shadow-xs">
                                                                    <option value="geral">🔵 Geral</option>
                                                                    <option value="urgente">🔴 Urgente</option>
                                                                    <option value="festividade">🟣 Festividade</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Informativo Completo</label>
                                                            <textarea placeholder="Ex: Solicitamos a cooperação de R$ 5,00 de cada família..." value={avisoConteudo} onChange={e => setAvisoConteudo(e.target.value)} className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs outline-none h-14 resize-none shadow-xs"/>
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <button
                                                                onClick={async () => {
                                                                    if (!avisoTitulo.trim() || !avisoConteudo.trim()) return addToast("Preencha título e conteúdo.", "warning");
                                                                    const current = selectedProfTurma.mural_avisos || [];
                                                                    const updated = [...current, {
                                                                        id: Date.now().toString(),
                                                                        titulo: avisoTitulo,
                                                                        conteudo: avisoConteudo,
                                                                        tipo: avisoTipo,
                                                                        data: getTodayDate()
                                                                    }];
                                                                    await handleUpdateTurmaField(selectedProfTurma.id, 'mural_avisos', updated);
                                                                    setAvisoTitulo('');
                                                                    setAvisoConteudo('');
                                                                }}
                                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer"
                                                            >
                                                                Inserir no Mural
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Notice list timeline */}
                                                    <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                                                        {(selectedProfTurma.mural_avisos || []).slice().reverse().map((rec: any) => {
                                                            const colorMap = {
                                                                geral: 'border-blue-150 bg-blue-50/50 text-blue-700',
                                                                urgente: 'border-rose-150 bg-rose-50/70 text-rose-700 font-extrabold',
                                                                festividade: 'border-purple-150 bg-purple-50/50 text-purple-700'
                                                            };
                                                            return (
                                                                <div key={rec.id} className={`p-4 rounded-2xl border ${rec.tipo === 'urgente' ? 'border-l-4 border-rose-500 bg-rose-50/10' : 'bg-white border-slate-200'} flex flex-col gap-2 relative shadow-xs`}>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${colorMap[rec.tipo] || colorMap.geral}`}>
                                                                            {rec.tipo}
                                                                        </span>
                                                                        <span className="text-[9px] text-slate-400 font-medium">{formatDateStr(rec.data)}</span>
                                                                    </div>
                                                                    <h5 className="font-extrabold text-xs text-slate-800 leading-none">{rec.titulo}</h5>
                                                                    <p className="text-[11px] text-slate-600 leading-normal font-medium whitespace-pre-wrap">{rec.conteudo}</p>
                                                                    
                                                                    <button
                                                                        onClick={async () => {
                                                                            const filtered = (selectedProfTurma.mural_avisos || []).filter((x: any) => x.id !== rec.id);
                                                                            await handleUpdateTurmaField(selectedProfTurma.id, 'mural_avisos', filtered);
                                                                        }}
                                                                        className="absolute bottom-3 right-3 text-rose-455 hover:text-rose-600 p-1 cursor-pointer"
                                                                    >
                                                                        <Trash2 size={13}/>
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}

                                                        {(selectedProfTurma.mural_avisos || []).length === 0 && (
                                                            <p className="text-xs text-slate-400 italic text-center py-4">Sem avisos escolares no momento.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Prebuilt alerts and communications */}
                                                <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-slate-205 shadow-xs flex flex-col gap-4">
                                                    <div>
                                                        <h4 className="font-extrabold text-[13px] text-slate-700 flex items-center gap-1.5"><Share2 size={16} className="text-emerald-500"/> Central de Comunicados Integrados</h4>
                                                        <p className="text-[10px] text-slate-400 font-medium">Gere formulários, avisos e campanhas prontas de WhatsApp para agilizar a vida ministerial</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 font-black text-slate-700">
                                                        <button 
                                                            onClick={() => setActiveTemplateType('lembrete')}
                                                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${activeTemplateType === 'lembrete' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold shadow-xs' : 'bg-slate-50 border-slate-150 text-slate-600'}`}
                                                        >
                                                            <BookOpen size={16} className="mx-auto mb-1 text-emerald-600"/>
                                                            <span className="text-[9px] uppercase tracking-wide block">Lembrete de Aula</span>
                                                        </button>

                                                        <button 
                                                            onClick={() => {
                                                                setActiveTemplateType('aniversario');
                                                            }}
                                                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${activeTemplateType === 'aniversario' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold shadow-xs' : 'bg-slate-50 border-slate-150 text-slate-600'}`}
                                                        >
                                                            <Gift size={16} className="mx-auto mb-1 text-pink-500"/>
                                                            <span className="text-[9px] uppercase tracking-wide block">Feliz Aniversário</span>
                                                        </button>

                                                        <button 
                                                            onClick={() => {
                                                                setActiveTemplateType('oracao');
                                                            }}
                                                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${activeTemplateType === 'oracao' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold shadow-xs' : 'bg-slate-50 border-slate-150 text-slate-600'}`}
                                                        >
                                                            <Heart size={16} className="mx-auto mb-1 text-rose-500"/>
                                                            <span className="text-[9px] uppercase tracking-wide block">Estudo / Clamor</span>
                                                        </button>

                                                        <button 
                                                            onClick={() => {
                                                                setActiveTemplateType('aviso');
                                                            }}
                                                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${activeTemplateType === 'aviso' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold shadow-xs' : 'bg-slate-50 border-slate-150 text-slate-600'}`}
                                                        >
                                                            <Megaphone size={16} className="mx-auto mb-1 text-blue-500"/>
                                                            <span className="text-[9px] uppercase tracking-wide block">Aviso Geral</span>
                                                        </button>
                                                    </div>

                                                    {/* Template configuration panel */}
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                                                        <div>
                                                            <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Destinatário (Membro ou Aluno)</label>
                                                            <select
                                                                value={templateSelectedAlunoId}
                                                                onChange={e => setTemplateSelectedAlunoId(e.target.value)}
                                                                className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 shadow-xs outline-none"
                                                            >
                                                                <option value="">-- Escolher Aluno --</option>
                                                                {alunosDaTurma.map(a => (
                                                                    <option key={a.id} value={a.id}>{a.nome}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {activeTemplateType === 'lembrete' && (
                                                            <div>
                                                                <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Assunto da Aula de Amanhã</label>
                                                                <input type="text" placeholder="Ex: O Caráter do Cristão..." value={templateTemaCustom} onChange={e => setTemplateTemaCustom(e.target.value)} className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs outline-none shadow-xs"/>
                                                            </div>
                                                        )}

                                                        {(activeTemplateType === 'oracao' || activeTemplateType === 'aviso') && (
                                                            <div>
                                                                <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Informações e Motivo do Aviso</label>
                                                                <input type="text" placeholder="Ex: saúde do pé, reforma do templo..." value={templateRecadoCustom} onChange={e => setTemplateRecadoCustom(e.target.value)} className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs outline-none shadow-xs"/>
                                                            </div>
                                                        )}

                                                        {/* Preview */}
                                                        {(() => {
                                                            const recipient = alunosDaTurma.find(a => a.id === templateSelectedAlunoId);
                                                            const destName = recipient ? recipient.nome : '[Nome Aluno]';
                                                            
                                                            let cText = '';
                                                            if (activeTemplateType === 'aniversario') {
                                                                cText = `Graça e Paz, ${destName}! A liderança da classe EBD "${selectedProfTurma.nome}" te saúda nesta data feliz do seu aniversário natalício! Rogamos as mais ricas bênçãos do trono da graça sobre a sua casa e família. Deus te abençoe! 🧁🎉🎊`;
                                                            } else if (activeTemplateType === 'lembrete') {
                                                                cText = `Olá, ${destName}! Passando para te lembrar que amanhã teremos a nossa aula da Escola Bíblica na Sala "${selectedProfTurma.sala || 'Sala Comum'}" às 09:00. Tema da Lição: "${templateTemaCustom || 'Tema de Apoio Semanal'}". Traga a Bíblia e Revista. Te aguardamos com júbilo! 📖🎒`;
                                                            } else if (activeTemplateType === 'oracao') {
                                                                cText = `Olá amada igreja EBD! Neste trimestre, conclamamos todos no círculo de jejum pelo nosso irmão(a) ${destName}, que tem como finalidade: "${templateRecadoCustom || 'sua saúde física e espiritual'}". Quem puder, se una a nós nas vigílias! 🙏`;
                                                            } else if (activeTemplateType === 'aviso') {
                                                                cText = `Importante comunicado para a classe de EBD "${selectedProfTurma.nome}": ${templateRecadoCustom || 'Pedimos pontualidade absoluta neste domingo.'} Deus recompense o amor de todos! 🔔🏛`;
                                                            }

                                                            return (
                                                                <div className="flex flex-col gap-2.5">
                                                                    <div>
                                                                        <label className="text-[9px] font-extrabold text-slate-500 block mb-0.5">Preview da Mensagem</label>
                                                                        <textarea 
                                                                            readOnly
                                                                            value={cText}
                                                                            className="w-full p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 outline-none h-20 select-all resize-none shadow-inner"
                                                                        />
                                                                    </div>

                                                                    <div className="flex gap-2 justify-end">
                                                                        <button
                                                                            onClick={() => {
                                                                                copyToClipboard(cText);
                                                                                addToast("Copiado!", "success");
                                                                            }}
                                                                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-205 text-slate-600 font-bold text-[10px] uppercase rounded-lg select-none cursor-pointer flex items-center gap-1"
                                                                        >
                                                                            <Copy size={11}/> Copiar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const phone = recipient && recipient.celular ? recipient.celular.replace(/\D/g, '') : '';
                                                                                const link = `https://api.whatsapp.com/send?${phone ? `phone=55${phone}&` : ''}text=${encodeURIComponent(cText)}`;
                                                                                window.open(link, '_blank');
                                                                                addToast("Abrindo WhatsApp Web...", "info");
                                                                            }}
                                                                            className="px-3.5 py-1.8 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase tracking-wide rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                                                                        >
                                                                            <Send size={11}/> Enviar WhatsApp
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    );
                })()}

                {tab === 7 && (
                    <div className="h-full flex flex-col animate-fadeIn">
                        {/* Header do Módulo */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 px-2">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Escala de Professores (EBD)</h3>
                                <p className="text-xs text-slate-500 font-medium">Crie, planeje, edite e exporte o cronograma de lições e professores de forma trimestral, semestral ou anual.</p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2">
                                <button 
                                    onClick={() => {
                                        const newRow = {
                                            id: '',
                                            data: getTodayDate(),
                                            turma_id: db.ebd?.turmas?.[0]?.id || '',
                                            revista: '',
                                            licao: `Lição ${localEscalaRows.length + 1}`,
                                            capitulo: '',
                                            tema: '',
                                            prof_id: '',
                                            aux_id: '',
                                            periodo: escalaPeriodo,
                                            observacoes: '',
                                            congregacao_id: congregacaoFilter !== 'todas' ? congregacaoFilter : 'sede',
                                        };
                                        setLocalEscalaRows(prev => [newRow, ...prev]);
                                        addToast("Linha avulsa adicionada ao início do rascunho.", "info");
                                    }}
                                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-indigo-100 cursor-pointer"
                                >
                                    <Plus size={16}/> Linha Avulsa
                                </button>
                                
                                <button 
                                    onClick={handleSaveAllEscalas}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
                                >
                                    <Save size={16}/> Salvar Planilha
                                </button>
                                
                                <button 
                                    onClick={shareEscalaToWhatsApp}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-teal-600/20 cursor-pointer"
                                >
                                    <Send size={16}/> Compartilhar WhatsApp
                                </button>
                                
                                <button 
                                    onClick={handleDownloadPDFEscala}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-600/20 cursor-pointer"
                                >
                                    <FileText size={16}/> Baixar PDF
                                </button>
                            </div>
                        </div>

                        {/* Painel do Gerador Automático em Lote */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm mb-6 flex flex-col gap-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Calendar size={18}/>
                                </div>
                                <h4 className="font-bold text-sm text-slate-800">Gerador Automático de Cronogramas em Lote</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Período para Planejar</label>
                                    <select 
                                        value={escalaPeriodo} 
                                        onChange={(e) => setEscalaPeriodo(e.target.value)}
                                        className="w-full text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value="semanal">Uma única semana (1 Domingo)</option>
                                        <option value="trimestral">1 Trimestre (13 Domingos)</option>
                                        <option value="semestral">1 Semestre (26 Domingos)</option>
                                        <option value="anual">1 Ano Inteiro (52 Domingos)</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">A partir do Domingo</label>
                                    <input 
                                        type="date"
                                        value={generatorStartDate}
                                        onChange={(e) => setGeneratorStartDate(e.target.value)}
                                        className="w-full text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Para Qual Turma</label>
                                    <select 
                                        value={generatorTurmaId}
                                        onChange={(e) => setGeneratorTurmaId(e.target.value)}
                                        className="w-full text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value="todas">Todas as Turmas da Escola</option>
                                        {turmasFiltradas.map(t => (
                                            <option key={t.id} value={t.id}>{t.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Título da Revista (Opcional)</label>
                                    <input 
                                        type="text"
                                        placeholder="Ex: Vida Cristã, CPAD..."
                                        value={generatorRevista}
                                        onChange={(e) => setGeneratorRevista(e.target.value)}
                                        className="w-full text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                                    />
                                </div>
                                
                                <div className="flex items-end">
                                    <button 
                                        onClick={handleGenerateBatchEscala}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-indigo-600/15 shadow-md h-[40px]"
                                    >
                                        <RefreshCw size={14}/> Gerar Cronograma
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Barra de Busca e Filtros da Planilha */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                            <div className="relative w-full sm:w-80">
                                <input 
                                    type="text"
                                    placeholder="Pesquisar lição, tema ou professor..."
                                    value={escalaSearch}
                                    onChange={(e) => setEscalaSearch(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-2 pl-9 pr-4 text-xs font-medium text-slate-600 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                                />
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap hidden sm:inline">Filtrar Turma:</span>
                                <select 
                                    value={escalaFiltroTurmaId}
                                    onChange={(e) => setEscalaFiltroTurmaId(e.target.value)}
                                    className="w-full sm:w-56 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                >
                                    <option value="">Todas as Turmas</option>
                                    {turmasFiltradas.map(t => (
                                        <option key={t.id} value={t.id}>{t.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tabela Planilha de Escala */}
                        <div className="flex-1 overflow-x-auto border border-slate-200 rounded-[2rem] bg-white shadow-sm custom-scrollbar">
                            <table className="w-full border-collapse text-left min-w-[1200px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-3 px-4 w-[130px]">
                                            <div className="flex flex-col gap-1.5 text-center items-center">
                                                <span>Data</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="Filtrar..." 
                                                    value={escalaColFilters.data} 
                                                    onChange={e => setEscalaColFilters({...escalaColFilters, data: e.target.value})}
                                                    className="px-2 py-1 text-[9px] font-semibold border border-slate-200/80 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full text-center"
                                                />
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 w-[160px]">
                                            <div className="flex flex-col gap-1.5">
                                                <span>Classe/Turma</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="Filtrar..." 
                                                    value={escalaColFilters.turma} 
                                                    onChange={e => setEscalaColFilters({...escalaColFilters, turma: e.target.value})}
                                                    className="px-2 py-1 text-[9px] font-semibold border border-slate-200/80 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                                                />
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 w-[130px]">
                                            <div className="flex flex-col gap-1.5">
                                                <span>Revista</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="Filtrar..." 
                                                    value={escalaColFilters.revista} 
                                                    onChange={e => setEscalaColFilters({...escalaColFilters, revista: e.target.value})}
                                                    className="px-2 py-1 text-[9px] font-semibold border border-slate-200/80 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                                                />
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 w-[110px]">
                                            <div className="flex flex-col gap-1.5">
                                                <span>Nº Lição</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="Filtrar..." 
                                                    value={escalaColFilters.licao} 
                                                    onChange={e => setEscalaColFilters({...escalaColFilters, licao: e.target.value})}
                                                    className="px-2 py-1 text-[9px] font-semibold border border-slate-200/80 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                                                />
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 w-[200px]">
                                            <div className="flex flex-col gap-1.5">
                                                <span>Tema / Título da Aula</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="Filtrar..." 
                                                    value={escalaColFilters.tema} 
                                                    onChange={e => setEscalaColFilters({...escalaColFilters, tema: e.target.value})}
                                                    className="px-2 py-1 text-[9px] font-semibold border border-slate-200/80 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                                                />
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 w-[130px]">
                                            <div className="flex flex-col gap-1.5">
                                                <span>Texto Bíblico</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="Filtrar..." 
                                                    value={escalaColFilters.texto_biblico} 
                                                    onChange={e => setEscalaColFilters({...escalaColFilters, texto_biblico: e.target.value})}
                                                    className="px-2 py-1 text-[9px] font-semibold border border-slate-200/80 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                                                />
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 w-[180px]">
                                            <div className="flex flex-col gap-1.5">
                                                <span>Professor(a) Titular</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="Filtrar..." 
                                                    value={escalaColFilters.professor} 
                                                    onChange={e => setEscalaColFilters({...escalaColFilters, professor: e.target.value})}
                                                    className="px-2 py-1 text-[9px] font-semibold border border-slate-200/80 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                                                />
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 w-[180px]">
                                            <div className="flex flex-col gap-1.5">
                                                <span>Auxiliar EBD</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="Filtrar..." 
                                                    value={escalaColFilters.auxiliar} 
                                                    onChange={e => setEscalaColFilters({...escalaColFilters, auxiliar: e.target.value})}
                                                    className="px-2 py-1 text-[9px] font-semibold border border-slate-200/80 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                                                />
                                            </div>
                                        </th>
                                        <th className="py-3 px-3">
                                            <div className="flex flex-col gap-1.5">
                                                <span>Obs / Anotações</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="Filtrar..." 
                                                    value={escalaColFilters.obs} 
                                                    onChange={e => setEscalaColFilters({...escalaColFilters, obs: e.target.value})}
                                                    className="px-2 py-1 text-[9px] font-semibold border border-slate-200/80 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                                                />
                                            </div>
                                        </th>
                                        <th className="py-3 px-4 w-[100px] text-center align-top pt-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredEscalas.map((row, idx) => {
                                        const actualIndex = localEscalaRows.findIndex(x => x === row);
                                        if (actualIndex === -1) return null;
                                        
                                        const handleRowFieldChange = (field: string, val: string) => {
                                            const updated = [...localEscalaRows];
                                            updated[actualIndex] = { ...updated[actualIndex], [field]: val };
                                            setLocalEscalaRows(updated);
                                        };

                                        return (
                                            <tr key={idx} className="hover:bg-indigo-50/20 group/row transition-all">
                                                {/* DATA */}
                                                <td className="py-3 px-3">
                                                    <input 
                                                        type="date"
                                                        value={row.data || ''}
                                                        onChange={(e) => handleRowFieldChange('data', e.target.value)}
                                                        className="w-full text-xs font-semibold text-slate-600 bg-transparent border border-transparent group-hover/row:border-slate-200 rounded-md py-1 px-1.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
                                                    />
                                                </td>
                                                {/* TURMA */}
                                                <td className="py-3 px-3">
                                                    <select
                                                        value={row.turma_id || ''}
                                                        onChange={(e) => handleRowFieldChange('turma_id', e.target.value)}
                                                        className="w-full text-xs font-bold text-slate-600 bg-transparent border border-transparent group-hover/row:border-slate-200 rounded-md py-1 px-1.5 focus:bg-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {turmasFiltradas.map(t => (
                                                            <option key={t.id} value={t.id}>{t.nome}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                {/* REVISTA */}
                                                <td className="py-3 px-3">
                                                    <input 
                                                        type="text"
                                                        placeholder="Revista..."
                                                        value={row.revista || ''}
                                                        onChange={(e) => handleRowFieldChange('revista', e.target.value)}
                                                        className="w-full text-xs font-medium text-slate-600 bg-transparent border border-transparent group-hover/row:border-slate-200 rounded-md py-1 px-1.5 focus:bg-white focus:border-indigo-500 focus:outline-none placeholder:text-slate-300"
                                                    />
                                                </td>
                                                {/* LIÇÃO */}
                                                <td className="py-3 px-3">
                                                    <input 
                                                        type="text"
                                                        placeholder="Lição..."
                                                        value={row.licao || ''}
                                                        onChange={(e) => handleRowFieldChange('licao', e.target.value)}
                                                        className="w-full text-xs font-semibold text-slate-600 bg-transparent border border-transparent group-hover/row:border-slate-200 rounded-md py-1 px-1.5 focus:bg-white focus:border-indigo-500 focus:outline-none placeholder:text-slate-300"
                                                    />
                                                </td>
                                                {/* TEMA */}
                                                <td className="py-3 px-3">
                                                    <input 
                                                        type="text"
                                                        placeholder="Tema da aula..."
                                                        value={row.tema || ''}
                                                        onChange={(e) => handleRowFieldChange('tema', e.target.value)}
                                                        className="w-full text-xs font-bold text-slate-700 bg-transparent border border-transparent group-hover/row:border-slate-200 rounded-md py-1 px-1.5 focus:bg-white focus:border-indigo-500 focus:outline-none placeholder:text-slate-300"
                                                    />
                                                </td>
                                                {/* CAPÍTULO */}
                                                <td className="py-3 px-3">
                                                    <input 
                                                        type="text"
                                                        placeholder="Atos 1:1..."
                                                        value={row.capitulo || ''}
                                                        onChange={(e) => handleRowFieldChange('capitulo', e.target.value)}
                                                        className="w-full text-xs font-medium text-slate-500 bg-transparent border border-transparent group-hover/row:border-slate-200 rounded-md py-1 px-1.5 focus:bg-white focus:border-indigo-500 focus:outline-none placeholder:text-slate-300"
                                                    />
                                                </td>
                                                {/* PROFESSOR TITULAR */}
                                                <td className="py-3 px-3">
                                                    <select
                                                        value={row.prof_id || ''}
                                                        onChange={(e) => handleRowFieldChange('prof_id', e.target.value)}
                                                        className="w-full text-xs font-bold text-indigo-700 bg-transparent border border-transparent group-hover/row:border-slate-200 rounded-md py-1 px-1.5 focus:bg-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {db.membros?.map((m: any) => (
                                                            <option key={m.id} value={m.id}>{m.nome}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                {/* AUXILIAR */}
                                                <td className="py-3 px-3">
                                                    <select
                                                        value={row.aux_id || ''}
                                                        onChange={(e) => handleRowFieldChange('aux_id', e.target.value)}
                                                        className="w-full text-xs font-semibold text-slate-600 bg-transparent border border-transparent group-hover/row:border-slate-200 rounded-md py-1 px-1.5 focus:bg-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {db.membros?.map((m: any) => (
                                                            <option key={m.id} value={m.id}>{m.nome}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                {/* OBSERVAÇÕES */}
                                                <td className="py-3 px-3">
                                                    <input 
                                                        type="text"
                                                        placeholder="Observações..."
                                                        value={row.observacoes || ''}
                                                        onChange={(e) => handleRowFieldChange('observacoes', e.target.value)}
                                                        className="w-full text-xs font-medium text-slate-500 bg-transparent border border-transparent group-hover/row:border-slate-200 rounded-md py-1 px-1.5 focus:bg-white focus:border-indigo-500 focus:outline-none placeholder:text-slate-300"
                                                    />
                                                </td>
                                                {/* AÇÕES DE LINHA */}
                                                <td className="py-3 px-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button 
                                                            onClick={() => handleSaveEscalaRow(actualIndex)}
                                                            className="p-1.5 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                                                            title="Salvar esta linha individualmente"
                                                        >
                                                            <Check size={14}/>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRemoveEscalaRow(actualIndex)}
                                                            className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                                                            title="Excluir de vez"
                                                        >
                                                            <Trash2 size={14}/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredEscalas.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="py-20 text-center text-slate-400 font-medium">
                                                <Calendar size={48} className="mx-auto mb-3 opacity-30 text-indigo-500 animate-bounce"/>
                                                <p className="font-extrabold text-[15px] text-slate-700">A escala de professores está vazia.</p>
                                                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">Insira rascunhos de cronograma usando o Gerador Automático acima ou clique em "Linha Avulsa" para organizar as datas.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Lesson Modal - Estudo Interativo */}
            {aiLesson && createPortal(
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg animate-entrance">
                    <div className="glass-modern rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-white/40 border-0 relative">
                        {/* Modal Header inside gradient wrapper */}
                        <div className="p-6 sm:p-8 flex justify-between items-start relative overflow-hidden shrink-0 shadow-lg border-b border-white/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-900 bg-[length:200%_200%] animate-pulse-glow"></div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.15] mix-blend-overlay pointer-events-none"></div>
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(0,0,0,0)_50%,rgba(255,255,255,0.15)_100%)] animate-spin mix-blend-overlay pointer-events-none" style={{ animationDuration: '10s' }} />
                            <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                            <div className="relative z-10 flex items-center gap-4 sm:gap-6 w-full">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-xl rounded-[1.2rem] shadow-[0_0_25px_rgba(255,255,255,0.15)] border-y border-white/40 border-x border-white/10 flex items-center justify-center text-white transform -rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-110 shrink-0 group relative">
                                    <div className="absolute inset-0 rounded-[1.2rem] bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Sparkles size={36} className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] relative z-10 sm:w-10 sm:h-10 text-rose-300 animate-pulse"/>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] sm:text-[10px] font-black text-white/80 uppercase tracking-[0.4em] mb-1.5 drop-shadow-md">
                                        EBD Inteligente • Estudar com IA
                                    </p>
                                    <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight leading-none drop-shadow-2xl font-['Outfit'] text-white">
                                        {aiLesson.title}
                                    </h3>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setAiLesson(null); setAiQuizText(''); }} 
                                className="bg-black/30 hover:bg-rose-500 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl text-white/70 hover:text-white transition-all duration-300 shadow-lg border border-white/10 relative z-10 group shrink-0 ml-3 hover:scale-110 cursor-pointer"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300"/>
                            </button>
                        </div>
                        
                        {aiLesson.loading ? (
                            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center text-indigo-650 min-h-[450px] bg-slate-50/50">
                                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                                <p className="font-black text-base animate-pulse mb-1 animate-duration-1500">Buscando na biblioteca teológica...</p>
                                <p className="text-xs font-medium text-slate-500 text-center">A preparar o texto áureo e a explicação dos tópicos.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 flex flex-col">
                                <div className="flex-1">
                                    <InteractiveMagazineView 
                                        lessonText={aiLesson.text}
                                        revista={aiLesson.revista}
                                        licaoNum={aiLesson.licao}
                                        capaUrl={aiLesson.capa}
                                    />
                                </div>
                                {aiQuizText && (
                                    <div className="p-8 bg-slate-100/50 border-t border-slate-200">
                                        <div className="max-w-4xl mx-auto p-6 bg-rose-50/40 border-2 border-dashed border-rose-200/80 rounded-3xl animate-fadeIn">
                                            <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase tracking-wider mb-3">
                                                <Sparkles size={16} className="text-rose-500 animate-bounce" />
                                                <span>Dinâmica Pedagógica & Quiz do Professor (IA)</span>
                                            </div>
                                            <div className="text-slate-700 whitespace-pre-wrap font-sans text-xs leading-relaxed bg-white/95 p-4 rounded-xl border border-rose-100/50">
                                                {aiQuizText}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="p-6 border-t border-white/30 bg-white/60 backdrop-blur-md flex flex-wrap gap-3 justify-end items-center shrink-0">
                            {!aiLesson.loading && (
                                <>
                                    <button 
                                        onClick={async () => {
                                            setAiGeneratingQuiz(true);
                                            const prom = `Atue como um pedagogo especializado em Ensino Bíblico e Escorla de Líderes. 
UTILIZE SUA FERRAMENTA DE BUSCA NO GOOGLE PARA PESQUISAR O CONTEÚDO OFICIAL DA CPAD sobre a revista "${aiLesson.revista}", Lição "${aiLesson.licao}" e elabore: 
1. 3 Perguntas quebra-gelo divertidas.
2. 3 Perguntas de fixação bíblica profunda com respostas rápidas para o professor, embasadas no material do comentarista da CPAD.
3. Uma dinâmica de grupo criativa de 10 minutos para fixar o tema central na mente dos alunos.
Gere em formatação simples e amigável.`;
                                            try {
                                                const res = await callGeminiAI(prom, 5);
                                                setAiQuizText(res);
                                                addToast("Dinâmica e Quiz gerados com IA desenvolvidos para os professores!", "success");
                                            } catch (e: any) {
                                                addToast("Não foi possível gerar a dinâmica agora.", "error");
                                            } finally {
                                                setAiGeneratingQuiz(false);
                                            }
                                        }}
                                        disabled={aiGeneratingQuiz}
                                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 disabled:bg-slate-100 text-rose-750 disabled:text-slate-400 font-black text-[10px] uppercase tracking-wider rounded-xl border border-rose-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Sparkles size={14} className="text-rose-500 animate-pulse" /> {aiGeneratingQuiz ? "Gerando Dinâmica..." : "Gerar Dinâmica + Quiz (IA)"}
                                    </button>

                                    <button 
                                        onClick={() => {
                                            const copyText = `📚 *SUBSÍDIO PARA EBD (ESCOLA BÍBLICA)* 📚\n📖 *Revista:* ${aiLesson.revista}\n🎯 *Lição:* ${aiLesson.licao}\n\n${aiLesson.text.slice(0, 1500)}...\n\n⭐ _Subsídio teológico do Portal EBD_`;
                                            navigator.clipboard.writeText(copyText);
                                            addToast("Resumo formatado p/ WhatsApp copiado!", "success");
                                        }}
                                        className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-750 font-black text-[10px] uppercase tracking-wider rounded-xl border border-emerald-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
                                        title="Copiar resumo curto com emojis para grupos de classe"
                                    >
                                        <Smartphone size={14} className="text-emerald-500" /> Copiar para WhatsApp
                                    </button>

                                    <button 
                                        onClick={() => {
                                            const doc = new jsPDF();
                                            doc.setFont("helvetica", "bold");
                                            doc.setFontSize(22);
                                            doc.setTextColor(79, 70, 229);
                                            doc.text("ESTUDO EBD COMPACTO", 20, 25);
                                            doc.setFontSize(12);
                                            doc.setTextColor(30, 41, 59);
                                            doc.text(`Revista: ${aiLesson.revista}`, 20, 35);
                                            doc.text(`Licao: ${aiLesson.licao}`, 20, 42);
                                            doc.line(20, 46, 190, 46);
                                            doc.setFont("helvetica", "normal");
                                            doc.setFontSize(10);
                                            doc.setTextColor(71, 85, 105);
                                            const splitted = doc.splitTextToSize(aiLesson.text, 170);
                                            let y = 55;
                                            for(let i=0; i<splitted.length; i++) {
                                                if (y > 275) {
                                                    doc.addPage();
                                                    y = 20;
                                                }
                                                doc.text(splitted[i], 20, y);
                                                y += 6;
                                            }
                                            doc.save(`estudo_ebd_licao_${aiLesson.licao}.pdf`);
                                            addToast("Guia de Estudo em PDF baixado com sucesso!", "success");
                                        }}
                                        className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-750 font-black text-[10px] uppercase tracking-wider rounded-xl border border-blue-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Download size={14} className="text-blue-500" /> Salvar PDF
                                    </button>

                                    <Button onClick={() => { navigator.clipboard.writeText(aiLesson.text); addToast("Estudo completo copiado!", "success"); }} variant="secondary" className="shadow-sm border-slate-300 text-[10px] font-black uppercase"><Copy size={16}/> Copiar Completo</Button>
                                </>
                            )}
                            <Button onClick={() => { setAiLesson(null); setAiQuizText(''); }} variant="primary" className="shadow-indigo-500/30 px-8 text-[10px] font-black uppercase">Concluir</Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* MODAL 1: REGISTRO DE CHAMADA (CONTROLE DE PRESENÇA) */}
            {chamadaModalOpen && selectedTurmaForChamada && createPortal(
                <InteractiveWindow
                    id="generic_modal_ebd_chamada"
                    title={`Turma: ${selectedTurmaForChamada.nome}`}
                    subtitle="Controle de Lições • Frequência"
                    onClose={() => setChamadaModalOpen(false)}
                    icon={ClipboardList}
                    headerBg="from-indigo-700 via-blue-700 to-indigo-900"
                    defaultWidth={670}
                    defaultHeight={670}
                    footer={
                        <div className="flex justify-end gap-3 w-full">
                            <Button type="button" onClick={() => setChamadaModalOpen(false)} variant="ghost" className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">Cancelar</Button>
                            <Button type="button" onClick={(e) => handleSaveChamada(e as any)} variant="primary" className="shadow-indigo-500/25 px-8">Salvar Frequência</Button>
                        </div>
                    }
                >
                    <div className="space-y-6 text-left">
                        {/* Inputs de Configuração da Lição Ministrada */}
                        <div className="bg-white/60 p-4 sm:p-5 rounded-3xl border border-white/80 shadow-sm space-y-4">
                            <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">Dados da Lição de EBD</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <FormInput
                                    label="Data da Aula"
                                    type="date"
                                    value={chamadaDate}
                                    onChange={(e: any) => setChamadaDate(e.target.value)}
                                    required
                                />
                                <FormInput
                                    label="Revista / Tema Central"
                                    placeholder="Ex: Fruto do Espírito"
                                    value={chamadaRevista}
                                    onChange={(e: any) => setChamadaRevista(e.target.value)}
                                    required
                                />
                                <FormInput
                                    label="Lição Número"
                                    placeholder="Ex: Lição 10"
                                    value={chamadaLicaoNum}
                                    onChange={(e: any) => setChamadaLicaoNum(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Tabela de Alunos com Chamada Dinâmica */}
                        <div className="bg-white/60 p-4 sm:p-5 rounded-3xl border border-white/80 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Users size={14} className="text-indigo-500" /> Alunos Matriculados</h4>
                                <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md">
                                    Presentes hoje: {Object.values(studentAttendanceMap).filter((st: any) => st.presente).length}
                                </span>
                            </div>

                            <div className="space-y-2.5 max-h-[38vh] overflow-y-auto custom-scrollbar pr-1">
                                {(db.ebd?.alunos || []).filter(a => a.turma_id === selectedTurmaForChamada.id).map(aluno => {
                                    const cur = studentAttendanceMap[aluno.id] || { presente: false, trouxeBiblia: false, trouxeRevista: false, oferta: false };
                                    
                                    const toggleProp = (prop: 'presente' | 'trouxeBiblia' | 'trouxeRevista' | 'oferta') => {
                                        setStudentAttendanceMap(prev => {
                                            const currentItem = prev[aluno.id] || { presente: false, trouxeBiblia: false, trouxeRevista: false, oferta: false };
                                            const updatedValue = !currentItem[prop];
                                            
                                            // Se desmarcou presença, zera outros indicadores também por padrão teológico
                                            if (prop === 'presente' && !updatedValue) {
                                                return {
                                                    ...prev,
                                                    [aluno.id]: { presente: false, trouxeBiblia: false, trouxeRevista: false, oferta: false }
                                                };
                                            }
                                            // Se marcou Bíblia/Revista/Oferta, força presente para true
                                            if (prop !== 'presente' && updatedValue) {
                                                return {
                                                    ...prev,
                                                    [aluno.id]: {
                                                        ...currentItem,
                                                        presente: true,
                                                        [prop]: true
                                                    }
                                                };
                                            }

                                            return {
                                                ...prev,
                                                [aluno.id]: {
                                                    ...currentItem,
                                                    [prop]: updatedValue
                                                }
                                            };
                                        });
                                    };

                                    return (
                                        <div key={aluno.id} className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${cur.presente ? 'bg-indigo-50/40 border-indigo-250' : 'bg-slate-50/50 border-slate-200/60'}`}>
                                            <div className="flex items-center gap-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleProp('presente')}
                                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${cur.presente ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white hover:border-slate-400'}`}
                                                >
                                                    {cur.presente && <Check size={12} strokeWidth={3} />}
                                                </button>
                                                <div>
                                                    <p className={`text-xs font-black transition-colors ${cur.presente ? 'text-indigo-950' : 'text-slate-500'}`}>{aluno.nome}</p>
                                                    <span className="text-[9px] text-slate-400 font-bold">Matrícula EBD</span>
                                                </div>
                                            </div>

                                            {/* Indicadores de engajamento da aula */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleProp('trouxeBiblia')}
                                                    className={`p-1.5 rounded-lg border text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${cur.trouxeBiblia ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-xs' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-350'}`}
                                                    title="Trouxe Bíblia Sagrada"
                                                >
                                                    📖 <span className="hidden sm:inline">Bíblia</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleProp('trouxeRevista')}
                                                    className={`p-1.5 rounded-lg border text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${cur.trouxeRevista ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-350'}`}
                                                    title="Trouxe Revista de Lição"
                                                >
                                                    📚 <span className="hidden sm:inline">Revista</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleProp('oferta')}
                                                    className={`p-1.5 rounded-lg border text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${cur.oferta ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-xs' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-350'}`}
                                                    title="Contribuição de Oferta para Classe"
                                                >
                                                    🪙 <span className="hidden sm:inline">Oferta</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(db.ebd?.alunos || []).filter(a => a.turma_id === selectedTurmaForChamada.id).length === 0 && (
                                    <p className="text-xs text-slate-400 italic text-center py-6">Nenhum aluno matriculado nesta turma para responder à chamada.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </InteractiveWindow>,
                document.body
            )}

            {/* MODAL 2: FICHA DE DESEMPENHO E HISTÓRICO DO ALUNO (INDIVIDUAL) */}
            {alunoHistoryModalOpen && selectedAlunoForHistory && createPortal(
                <InteractiveWindow
                    id="ebd_aluno_historico_window"
                    title={selectedAlunoForHistory.nome || 'Ficha do Aluno'}
                    subtitle="EBD • Ficha do Aluno"
                    onClose={() => setAlunoHistoryModalOpen(false)}
                    icon={() => <div className="text-white font-extrabold text-sm font-['Outfit'] h-full flex items-center justify-center scale-125 select-none">{(selectedAlunoForHistory.nome || '?').charAt(0).toUpperCase()}</div>}
                    headerBg="from-slate-700 via-slate-800 to-slate-950"
                    defaultWidth={700}
                    defaultHeight={650}
                    footer={
                        <Button type="button" onClick={() => setAlunoHistoryModalOpen(false)} variant="primary" className="px-8 text-xs font-black uppercase tracking-wider">Fechar Ficha</Button>
                    }
                >
                    <div className="space-y-6 text-left font-sans">
                        {/* Cartões de Indicadores Chave de Frequência */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-2xl p-4 text-center">
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Presenças</p>
                                <h4 className="text-3xl font-black text-indigo-800 mt-1">{getStudentStats(selectedAlunoForHistory.id).presencas}</h4>
                                <span className="text-[9px] text-slate-500 font-bold block mt-1">/{getStudentStats(selectedAlunoForHistory.id).totalAulas} aulas</span>
                            </div>
                            <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-4 text-center">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Bíblias</p>
                                <h4 className="text-3xl font-black text-emerald-800 mt-1">{getStudentStats(selectedAlunoForHistory.id).biblias}</h4>
                                <span className="text-[9px] text-slate-500 font-bold block mt-1">Trouxe nas aulas</span>
                            </div>
                            <div className="bg-blue-50/50 border border-blue-105/60 rounded-2xl p-4 text-center">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Revistas</p>
                                <h4 className="text-3xl font-black text-blue-800 mt-1">{getStudentStats(selectedAlunoForHistory.id).revistas}</h4>
                                <span className="text-[9px] text-slate-500 font-bold block mt-1">Estudou a lição</span>
                            </div>
                            <div className="bg-amber-50/50 border border-amber-105/60 rounded-2xl p-4 text-center">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Ofertas</p>
                                <h4 className="text-3xl font-black text-amber-800 mt-1">{getStudentStats(selectedAlunoForHistory.id).ofertas}</h4>
                                <span className="text-[9px] text-slate-500 font-bold block mt-1">Aulas ofertadas</span>
                            </div>
                        </div>

                        {/* Desempenho e Medalhas de Aproveitamento */}
                        <div className="bg-white/60 border border-white/80 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-5 shadow-xs text-left">
                            <div className="relative w-24 h-24 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                                <svg className="absolute w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                                    <circle cx="48" cy="48" r="40" stroke="#4f46e5" strokeWidth="8" fill="transparent"
                                            strokeDasharray={2 * Math.PI * 40}
                                            strokeDashoffset={2 * Math.PI * 40 * (1 - getStudentStats(selectedAlunoForHistory.id).taxaPresenca / 100)} />
                                </svg>
                                <span className="text-xl font-extrabold text-indigo-950 font-['Outfit']">{getStudentStats(selectedAlunoForHistory.id).taxaPresenca}%</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-extrabold text-slate-800 text-sm">Status Dominical: {
                                    getStudentStats(selectedAlunoForHistory.id).taxaPresenca >= 90 ? '🏅 Aluno Ouro' :
                                    getStudentStats(selectedAlunoForHistory.id).taxaPresenca >= 75 ? '🥈 Aluno Prata' :
                                    getStudentStats(selectedAlunoForHistory.id).taxaPresenca >= 50 ? '🥉 Aluno Integrado' : '🌱 Aluno Iniciante'
                                }</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Considerando a assiduidade histórica na leitura doutrinária das lições, pontualidade e engajamento geral no trimestre corrente.</p>
                            </div>
                        </div>

                        {/* Registro Fino de Lições Ministradas */}
                        <div className="bg-white/60 border border-white/80 rounded-3xl p-5 shadow-xs text-left">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Calendar size={14} className="text-slate-500" /> Histórico de Presenças</h4>
                            <div className="space-y-2 max-h-[25vh] overflow-y-auto custom-scrollbar pr-1">
                                {(db.ebd?.licoes || []).filter(l => {
                                    const t = turmasFiltradas.find(tf=>tf.id===l.turma_id);
                                    return t && t.id === selectedAlunoForHistory.turma_id;
                                }).map(licao => {
                                    const det = licao.detalhes_chamada?.[selectedAlunoForHistory.id];
                                    return (
                                        <div key={licao.id} className="p-3 bg-white/70 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-slate-250 transition-all font-sans text-left">
                                            <div>
                                                <p className="font-extrabold text-xs text-slate-800">{licao.revista || 'Revista EBD'}</p>
                                                <p className="text-[9px] text-slate-400 font-bold">{licao.licao_numero || 'Lição'} • {formatDateLocal(licao.data)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {det?.presente ? (
                                                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-750 font-black text-[9px] uppercase tracking-wider rounded-md border border-emerald-100">✔ Presente</span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 bg-rose-50 text-rose-750 font-black text-[9px] uppercase tracking-wider rounded-md border border-rose-100">❌ Ausente</span>
                                                )}
                                                {det?.trouxeBiblia && <span className="text-xs select-none" title="Trouxe Bíblia">📖</span>}
                                                {det?.trouxeRevista && <span className="text-xs select-none" title="Trouxe Revista">📚</span>}
                                                {det?.oferta && <span className="text-xs select-none" title="Ofertou">🪙</span>}
                                            </div>
                                        </div>
                                    );
                                }).reverse()}
                                {(db.ebd?.licoes || []).filter(l => {
                                    const t = turmasFiltradas.find(tf=>tf.id===l.turma_id);
                                    return t && t.id === selectedAlunoForHistory.turma_id;
                                }).length === 0 && (
                                    <p className="text-xs text-slate-400 italic text-center py-4">Nenhuma aula registrada para esta turma ainda.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </InteractiveWindow>,
                document.body
            )}
        </div>
    );
};


export default ModuleEBD;
