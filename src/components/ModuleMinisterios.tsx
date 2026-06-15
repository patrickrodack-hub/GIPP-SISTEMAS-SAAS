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

import { ModuleMidiaTab } from './ModuleMidiaTab';

// Exporting component
const ModuleMinisterios = () => {
    const { db, openModal, setDoc, doc, dbFirestore, appId, addToast, callGeminiAI, user, addDoc, collection, deleteDoc } = useContext(ChurchContext);
    const [tab, setTab] = useState(1);
    const [subTab, setSubTab] = useState('escalas');
    const ministerios = db.departamentos || [];
    
    // Worship state (Firestore sync)
    const [musicas, setMusicas] = useState<any[]>([]);
    const [escalas, setEscalas] = useState<any[]>([]);
    const [reunioes, setReunioes] = useState<any[]>([]);
    const [musicos, setMusicos] = useState<any[]>([]);

    const [loadingMusicas, setLoadingMusicas] = useState(true);
    const [loadingEscalas, setLoadingEscalas] = useState(true);
    const [loadingReunioes, setLoadingReunioes] = useState(true);
    const [subTabMedia, setSubTabMedia] = useState('equipe');

    // Media Ministry State (Firestore sync)
    const [mediaEquipe, setMediaEquipe] = useState<any[]>([]);
    const [mediaEventos, setMediaEventos] = useState<any[]>([]);
    const [mediaBiblioteca, setMediaBiblioteca] = useState<any[]>([]);
    const [mediaEquipamentos, setMediaEquipamentos] = useState<any[]>([]);

    const [loadingMediaEquipe, setLoadingMediaEquipe] = useState(true);
    const [loadingMediaEventos, setLoadingMediaEventos] = useState(true);
    const [loadingMediaBiblioteca, setLoadingMediaBiblioteca] = useState(true);
    const [loadingMediaEquipamentos, setLoadingMediaEquipamentos] = useState(true);

    const [loadingMusicos, setLoadingMusicos] = useState(true);

    // Form overlays / creation toggle
    const [showAddSong, setShowAddSong] = useState(false);
    const [showAddScale, setShowAddScale] = useState(false);
    const [showAddMusician, setShowAddMusician] = useState(false);
    const [showAddRehearsal, setShowAddRehearsal] = useState(false);

    // ID of item editing
    const [editingSongId, setEditingSongId] = useState<string | null>(null);
    const [editingScaleId, setEditingScaleId] = useState<string | null>(null);
    const [editingMusicianId, setEditingMusicianId] = useState<string | null>(null);
    const [editingRehearsalId, setEditingRehearsalId] = useState<string | null>(null);

    // New song state
    const [songTitulo, setSongTitulo] = useState('');
    const [songArtista, setSongArtista] = useState('');
    const [songTom, setSongTom] = useState('G');
    const [songRitmo, setSongRitmo] = useState('Worship');
    const [songBpm, setSongBpm] = useState('72');
    const [songLetraCifra, setSongLetraCifra] = useState('');
    const [songArquivos, setSongArquivos] = useState<{nome: string, url: string}[]>([]);
    const [newArgNome, setNewArgNome] = useState('');
    const [newArgUrl, setNewArgUrl] = useState('');

    // New scale state
    const [scaleData, setScaleData] = useState(getTodayDate());
    const [scaleLiderId, setScaleLiderId] = useState('');
    const [scaleMusicos, setScaleMusicos] = useState<Record<string, string>>({});
    const [scaleMusicasIds, setScaleMusicasIds] = useState<string[]>([]);
    const [scaleObservacoes, setScaleObservacoes] = useState('');
    const [scaleArquivos, setScaleArquivos] = useState<{nome: string, url: string}[]>([]);
    const [newScaleArgNome, setNewScaleArgNome] = useState('');
    const [newScaleArgUrl, setNewScaleArgUrl] = useState('');

    // New musician state
    const [musicianMembroId, setMusicianMembroId] = useState('');
    const [musicianInstrumentos, setMusicianInstrumentos] = useState('');
    const [musicianDisponibilidade, setMusicianDisponibilidade] = useState('Livre todos os cultos');
    const [musicianStatus, setMusicianStatus] = useState('Ativo');

    // New rehearsal state
    const [rehearsalTitulo, setRehearsalTitulo] = useState('');
    const [rehearsalData, setRehearsalData] = useState(getTodayDate());
    const [rehearsalHora, setRehearsalHora] = useState('19:30');
    const [rehearsalLocal, setRehearsalLocal] = useState('Templo Sede');
    const [rehearsalPauta, setRehearsalPauta] = useState('');

    // Filter states
    const [searchSong, setSearchSong] = useState('');
    const [historyFilter, setHistoryFilter] = useState('all');

    // AI fetching state
    const [aiGenerating, setAiGenerating] = useState(false);
    const [viewChordsSongId, setViewChordsSongId] = useState<string | null>(null);

    // Real-time subscribers
    useEffect(() => {
        if (!dbFirestore || !appId) return;

        const musicasRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_musicas');
        const unsubMusicas = onSnapshot(musicasRef, (snapshot: any) => {
            const list: any[] = [];
            snapshot.forEach((docSnap: any) => list.push({ id: docSnap.id, ...docSnap.data() }));
            setMusicas(list);
            setLoadingMusicas(false);
        }, () => setLoadingMusicas(false));

        const escalasRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_escalas');
        const unsubEscalas = onSnapshot(escalasRef, (snapshot: any) => {
            const list: any[] = [];
            snapshot.forEach((docSnap: any) => list.push({ id: docSnap.id, ...docSnap.data() }));
            list.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
            setEscalas(list);
            setLoadingEscalas(false);
        }, () => setLoadingEscalas(false));

        const reunioesRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_reunioes');
        const unsubReunioes = onSnapshot(reunioesRef, (snapshot: any) => {
            const list: any[] = [];
            snapshot.forEach((docSnap: any) => list.push({ id: docSnap.id, ...docSnap.data() }));
            list.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
            setReunioes(list);
            setLoadingReunioes(false);
        }, () => setLoadingReunioes(false));

        const musicosRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_musicos');
        const unsubMusicos = onSnapshot(musicosRef, (snapshot: any) => {
            const list: any[] = [];
            snapshot.forEach((docSnap: any) => list.push({ id: docSnap.id, ...docSnap.data() }));
            setMusicos(list);
            setLoadingMusicos(false);
        }, () => setLoadingMusicos(false));

        const mediaEquipeRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'midia_equipe');
        const unsubMediaEquipe = onSnapshot(mediaEquipeRef, (snapshot: any) => {
            const list: any[] = [];
            snapshot.forEach((docSnap: any) => list.push({ id: docSnap.id, ...docSnap.data() }));
            setMediaEquipe(list);
            setLoadingMediaEquipe(false);
        }, () => setLoadingMediaEquipe(false));

        const mediaEventosRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'midia_eventos');
        const unsubMediaEventos = onSnapshot(mediaEventosRef, (snapshot: any) => {
            const list: any[] = [];
            snapshot.forEach((docSnap: any) => list.push({ id: docSnap.id, ...docSnap.data() }));
            setMediaEventos(list);
            setLoadingMediaEventos(false);
        }, () => setLoadingMediaEventos(false));

        const mediaBiblioRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'midia_biblioteca');
        const unsubMediaBiblio = onSnapshot(mediaBiblioRef, (snapshot: any) => {
            const list: any[] = [];
            snapshot.forEach((docSnap: any) => list.push({ id: docSnap.id, ...docSnap.data() }));
            setMediaBiblioteca(list);
            setLoadingMediaBiblioteca(false);
        }, () => setLoadingMediaBiblioteca(false));

        const mediaEqpRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'midia_equipamentos');
        const unsubMediaEqp = onSnapshot(mediaEqpRef, (snapshot: any) => {
            const list: any[] = [];
            snapshot.forEach((docSnap: any) => list.push({ id: docSnap.id, ...docSnap.data() }));
            setMediaEquipamentos(list);
            setLoadingMediaEquipamentos(false);
        }, () => setLoadingMediaEquipamentos(false));

        return () => {
            unsubMusicas();
            unsubEscalas();
            unsubReunioes();
            unsubMusicos();
            unsubMediaEquipe();
            unsubMediaEventos();
            unsubMediaBiblio();
            unsubMediaEqp();
        };
    }, [dbFirestore, appId]);

    // AI Cifras Fetching
    const handleGenerateChordsWithAI = async () => {
        if (!songTitulo.trim()) {
            addToast("Informe ao menos o Título da Música.", "warning");
            return;
        }
        setAiGenerating(true);
        addToast("Buscando cifras com Inteligência Artificial...", "info");
        try {
            const prompt = `Forneça a letra completa da música cristã "${songTitulo}" ${songArtista ? `do artista ${songArtista}` : ''} com as cifras corretas sobrepostas em formato de texto limpo. Use o tom principal de "${songTom}". Retorne apenas a letra cifrada formatada, sem saudações ou comentários iniciais/finais. Organize em blocos perfeitamente legíveis. Se não conhecer a música, gere uma letra estimulada com cifras condizentes.`;
            const response = await callGeminiAI(prompt);
            if (response && response.trim()) {
                setSongLetraCifra(response);
                addToast("Cifras geradas com sucesso pela IA!", "success");
            } else {
                addToast("Gemini não conseguiu processar no momento. Tente novamente.", "error");
            }
        } catch (err: any) {
            console.error(err);
            addToast("Falha na geração com IA.", "error");
        } finally {
            setAiGenerating(false);
        }
    };

    // Persistence Actions
    const handleSaveSong = async () => {
        if (!songTitulo.trim()) return addToast("Informe o título.", "warning");
        try {
            const payload = {
                titulo: songTitulo,
                artista: songArtista,
                tom: songTom,
                ritmo: songRitmo,
                bpm: songBpm,
                letra_cifra: songLetraCifra,
                arquivos: songArquivos
            };
            const targetId = editingSongId || `musica_${Date.now()}`;
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_musicas', targetId), payload);
            addToast(editingSongId ? "Música atualizada!" : "Nova música adicionada!", "success");
            
            // Clean states
            setSongTitulo(''); setSongArtista(''); setSongTom('G'); setSongRitmo('Worship'); setSongBpm('72'); setSongLetraCifra(''); setSongArquivos([]);
            setShowAddSong(false); setEditingSongId(null);
        } catch (e) {
            addToast("Erro ao gravar música.", "error");
        }
    };

    const handleDeleteSong = async (id: string) => {
        if (!confirm("Remover esta música do repertório?")) return;
        try {
            await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_musicas', id));
            addToast("Música removida do repertório.", "success");
        } catch(e) {
            addToast("Erro ao remover.", "error");
        }
    };

    const handleEditSong = (song: any) => {
        setEditingSongId(song.id);
        setSongTitulo(song.titulo || '');
        setSongArtista(song.artista || '');
        setSongTom(song.tom || 'G');
        setSongRitmo(song.ritmo || 'Worship');
        setSongBpm(song.bpm || '72');
        setSongLetraCifra(song.letra_cifra || '');
        setSongArquivos(song.arquivos || []);
        setShowAddSong(true);
    };

    const handleSaveScale = async () => {
        if (!scaleData) return addToast("Selecione a data.", "warning");
        try {
            const payload = {
                data: scaleData,
                lider_id: scaleLiderId,
                musicos: scaleMusicos,
                musicasIds: scaleMusicasIds,
                observacoes: scaleObservacoes,
                arquivos: scaleArquivos
            };
            const targetId = editingScaleId || `escala_${Date.now()}`;
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_escalas', targetId), payload);
            addToast(editingScaleId ? "Escala atualizada!" : "Escala criada e salva com sucesso!", "success");
            
            // Clean states
            setScaleData(getTodayDate()); setScaleLiderId(''); setScaleMusicos({}); setScaleMusicasIds([]); setScaleObservacoes(''); setScaleArquivos([]);
            setShowAddScale(false); setEditingScaleId(null);
        } catch (e) {
            addToast("Erro ao gravar escala.", "error");
        }
    };

    const handleDeleteScale = async (id: string) => {
        if (!confirm("Remover esta escala do histórico?")) return;
        try {
            await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_escalas', id));
            addToast("Escala excluída.", "success");
        } catch(e) {
            addToast("Erro ao remover.", "error");
        }
    };

    const handleEditScale = (sch: any) => {
        setEditingScaleId(sch.id);
        setScaleData(sch.data || getTodayDate());
        setScaleLiderId(sch.lider_id || '');
        setScaleMusicos(sch.musicos || {});
        setScaleMusicasIds(sch.musicasIds || []);
        setScaleObservacoes(sch.observacoes || '');
        setScaleArquivos(sch.arquivos || []);
        setShowAddScale(true);
    };

    const handleSaveMusician = async () => {
        if (!musicianMembroId) return addToast("Selecione um membro.", "warning");
        if (musicos.some(m => m.membro_id === musicianMembroId && m.id !== editingMusicianId)) {
            return addToast("Este membro já está na equipe de louvor.", "warning");
        }
        try {
            const payload = {
                membro_id: musicianMembroId,
                instrumentos: musicianInstrumentos,
                disponibilidade: musicianDisponibilidade,
                status: musicianStatus
            };
            const targetId = editingMusicianId || `musico_${Date.now()}`;
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_musicos', targetId), payload);
            addToast("Músico salvo!", "success");
            
            setMusicianMembroId(''); setMusicianInstrumentos(''); setMusicianDisponibilidade('Livre todos os cultos'); setMusicianStatus('Ativo');
            setShowAddMusician(false); setEditingMusicianId(null);
        } catch(e) {
            addToast("Erro ao salvar cadastro.", "error");
        }
    };

    const handleDeleteMusician = async (id: string) => {
        if (!confirm("Remover este músico da equipe?")) return;
        try {
            await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_musicos', id));
            addToast("Músico removido da equipe.", "success");
        } catch(e) {
            addToast("Erro ao remover.", "error");
        }
    };

    const handleSaveRehearsal = async () => {
        if (!rehearsalTitulo.trim() || !rehearsalData) return addToast("Título e data são obrigatórios.", "warning");
        try {
            const payload = {
                titulo: rehearsalTitulo,
                data: rehearsalData,
                hora: rehearsalHora,
                local: rehearsalLocal,
                pauta: rehearsalPauta,
                notificadoPortal: false
            };
            const targetId = editingRehearsalId || `reuniao_${Date.now()}`;
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_reunioes', targetId), payload);
            addToast("Compromisso salvo!", "success");
            
            setRehearsalTitulo(''); setRehearsalData(getTodayDate()); setRehearsalHora('19:30'); setRehearsalLocal('Templo Sede'); setRehearsalPauta('');
            setShowAddRehearsal(false); setEditingRehearsalId(null);
        } catch(e) {
            addToast("Erro ao agendar compromisso.", "error");
        }
    };

    const handleSendRehearsalEmail = async (reuniao: any) => {
        const teamMembers = musicos.map(m => db.membros.find((mem: any) => mem.id === m.membro_id)).filter(Boolean);
        if (teamMembers.length === 0) return addToast("Nenhum integrante cadastrado na equipe de louvor.", "warning");
        
        const dateF = reuniao.data.split('-').reverse().join('/');
        const subject = `ENSAIO / REUNIÃO DO MINISTÉRIO DE LOUVOR - ${reuniao.titulo}`;
        const body = `Olá levitas,

Temos um ensaio/reunião agendado para o Ministério de Louvor:

- Compromisso: ${reuniao.titulo}
- Data: ${dateF} às ${reuniao.hora}
- Local: ${reuniao.local}

Pauta / Louvores do Revezamento:
${reuniao.pauta || 'Não definida.'}

Compareçam e preparem seus corações e instrumentos!`;

        try {
            const timestamp = new Date().toISOString();
            // Disparar e-mail interno individual para cada destinatário da equipe de louvor
            for (const member of teamMembers) {
                const emailDoc = {
                    senderId: user?.id || 'louvor_admin_system',
                    senderName: user?.nome || 'Líder do Louvor',
                    senderType: 'usuario',
                    recipientId: member.id,
                    recipientName: member.nome,
                    recipientType: 'membro',
                    subject: subject,
                    body: body,
                    timestamp,
                    readByRecipient: false,
                    deletedBySender: false,
                    deletedByRecipient: false,
                    attachments: []
                };
                await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'emails'), emailDoc);
            }
            addToast(`E-mails internos enviados com sucesso para toda a equipe (${teamMembers.length} integrantes)! ✉️✨`, "success");
        } catch(e) {
            console.error("Erro ao enviar e-mail interno para a equipe de louvor:", e);
            addToast("Erro ao processar e disparar e-mails internos da equipe.", "error");
        }
    };

    const handleShareRehearsalWhatsApp = (reuniao: any) => {
        const dateF = reuniao.data.split('-').reverse().join('/');
        const text = `🎸 *MINISTÉRIO DE LOUVOR - ENSAIO / REUNIÃO* 🎸

🌟 *Compromisso:* ${reuniao.titulo}
📅 *Data:* ${dateF} às ${reuniao.hora}h
📍 *Local:* ${reuniao.local}

📝 *Estudo / Louvores do Culto:*
${reuniao.pauta || 'A definir.'}

_Deus abençoe! Ensaiem as canções e compareçam no horário!_`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
        addToast("Estatísticas carregadas para o WhatsApp!", "success");
    };

    const handlePublishRehearsalToMural = async (reuniao: any) => {
        try {
            const dateF = reuniao.data.split('-').reverse().join('/');
            const noticeText = `🎸 *REUNIÃO/ENSAIO DE LOUVOR:*
🌟 *Compromisso:* ${reuniao.titulo}
⏰ *Horário:* ${dateF} às ${reuniao.hora}h
⛪ *Local:* ${reuniao.local}

📝 *Sinalização do Ensaio:*
${reuniao.pauta || 'Repertório no Painel de Escalas.'}

Favor toda a equipe de levitas atualizar seu status de confirmação presencial no portal de escalas.`;

            await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'mural'), {
                tipo: 'aviso',
                texto: noticeText,
                autor_id: user?.id || 'lider_louvor',
                autor_nome: `M. de Louvor (${user?.nome || 'Líder'})`,
                autor_foto: user?.foto || null,
                data: new Date().toISOString(),
                oradores: []
            });

            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_reunioes', reuniao.id), { notificadoPortal: true }, { merge: true });
            addToast("Aviso oficial postado no Mural dos Membros!", "success");
        } catch (e) {
            addToast("Erro ao publicar aviso.", "error");
        }
    };

    const handleDeleteRehearsal = async (id: string) => {
        if (!confirm("Deletar este ensaio/reunião?")) return;
        try {
            await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_reunioes', id));
            addToast("Agendamento removido.", "success");
        } catch(e) {
            addToast("Erro ao cancelar.", "error");
        }
    };

    // Dashboard Calculations
    const totalMinisterios = ministerios.length;
    const totalComponentes = ministerios.reduce((acc, m) => acc + (m.membros?.length || 0), 0);
    const totalAgenda = ministerios.reduce((acc, m) => acc + (m.agenda?.length || 0), 0);

    const menuItems = [
        {id: 1, label: 'Dashboard', icon: LayoutDashboard}, 
        {id: 2, label: 'Cadastros', icon: Building2}, 
        {id: 3, label: 'Componentes', icon: Users}, 
        {id: 4, label: 'Agenda & Tarefas', icon: Calendar},
        {id: 5, label: 'Ministério de Louvor', icon: Music},
        {id: 6, label: 'Ministério de Mídia', icon: Video}
    ];

    const TabButton: any = ({ item }) => (
        <button onClick={() => setTab(item.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <item.icon size={18}/> {item.label}
        </button>
    );

    const handleDeleteMember = async (ministerioId, membroIndex) => { 
        const ministerio = ministerios.find(m => m.id === ministerioId); 
        if (!ministerio) return; 
        const novosMembros = [...(ministerio.membros || [])]; 
        novosMembros.splice(membroIndex, 1); 
        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'departamentos', ministerioId), { membros: novosMembros }, { merge: true }); 
        addToast("Membro removido.", "success"); 
    };

    const filteredSongs = musicas.filter(s => 
        (s.titulo || '').toLowerCase().includes(searchSong.toLowerCase()) || 
        (s.artista || '').toLowerCase().includes(searchSong.toLowerCase())
    );

    const getMemberName = (membroId: string) => {
        const mem = db.membros.find((m: any) => m.id === membroId);
        return mem ? mem.nome : 'Sem definição';
    };

    const getLiderName = (liderId: string) => {
        if (!liderId) return 'Não definido';
        const mem = db.membros.find((m: any) => m.id === liderId);
        if (mem) return mem.nome;
        const mus = musicos.find((m: any) => m.id === liderId);
        if (mus) {
            const memMus = db.membros.find((m: any) => m.id === mus.membro_id);
            if (memMus) return memMus.nome;
        }
        return 'Não definido';
    };

    const exportarEscalasPDF = () => {
        try {
            const docPdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            let y = 15;
            const pageHeight = 297;
            const pageWidth = 210;
            const marginX = 15;
            const printableWidth = pageWidth - (marginX * 2); 
            
            const igrejaNome = db.nome || db.igreja_nome || 'IP INTEGRADO - MINISTÉRIO DE LOUVOR';
            docPdf.setFillColor(79, 70, 229); 
            docPdf.rect(marginX, y, printableWidth, 18, 'F');
            
            docPdf.setFont('helvetica', 'bold');
            docPdf.setFontSize(11);
            docPdf.setTextColor(255, 255, 255);
            docPdf.text(igrejaNome.toUpperCase(), marginX + 5, y + 6);
            
            docPdf.setFontSize(8);
            docPdf.setFont('helvetica', 'normal');
            docPdf.setTextColor(220, 225, 255);
            docPdf.text('RELATÓRIO GERAL DE ESCALAS MUSICAIS', marginX + 5, y + 12);
            
            docPdf.setTextColor(255, 255, 255);
            const dataGeracao = new Date().toLocaleDateString('pt-BR');
            docPdf.text(`Gerado em: ${dataGeracao}`, marginX + printableWidth - 45, y + 6);
            
            y += 24;
            
            docPdf.setFillColor(248, 250, 252);
            docPdf.rect(marginX, y, printableWidth, 15, 'F');
            docPdf.setDrawColor(226, 232, 240);
            docPdf.rect(marginX, y, printableWidth, 15, 'S');
            
            docPdf.setFont('helvetica', 'bold');
            docPdf.setFontSize(8.5);
            docPdf.setTextColor(71, 85, 105);
            docPdf.text('ESTATÍSTICAS DA GESTÃO DE ESCALAS:', marginX + 4, y + 5.5);
            
            docPdf.setFont('helvetica', 'normal');
            docPdf.text(`Total de Escalas por Data: ${escalas.length}  |  Integrantes na Equipe: ${musicos.length}  |  Canções no Repertório: ${musicas.length}`, marginX + 4, y + 10.5);
            
            y += 22;
            
            if (escalas.length === 0) {
                docPdf.setFont('helvetica', 'italic');
                docPdf.setFontSize(10);
                docPdf.setTextColor(148, 163, 184);
                docPdf.text("Nenhuma escala publicada encontrada para exportação.", marginX, y + 10);
            } else {
                const sortedEscalas = [...escalas].sort((a,b) => (b.data || '').localeCompare(a.data || ''));
                
                sortedEscalas.forEach((sch) => {
                    const formattedDate = sch.data ? sch.data.split('-').reverse().join('/') : 'S/D';
                    const leaderName = getLiderName(sch.lider_id);
                    
                    const arrMusicos: string[] = [];
                    if (sch.musicos) {
                        Object.entries(sch.musicos).forEach(([instrumento, membroId]) => {
                            if (membroId) {
                                arrMusicos.push(`${instrumento}: ${getMemberName(membroId as string)}`);
                            }
                        });
                    }
                    const musicosFMT = arrMusicos.length > 0 ? arrMusicos.join(' • ') : 'Nenhum músico escalado';
                    
                    const arrSongs: string[] = [];
                    if (sch.musicasIds) {
                        sch.musicasIds.forEach((sid: string) => {
                            const song = musicas.find(s => s.id === sid);
                            if (song) {
                                arrSongs.push(`"${song.titulo}" (${song.tom} - ${song.artista})`);
                            }
                        });
                    }
                    const songsFMT = arrSongs.length > 0 ? arrSongs.join(', ') : 'Nenhuma música selecionada';
                    const obsFMT = sch.observacoes || 'Sem observações adicionais.';
                    
                    const musicosLines = docPdf.splitTextToSize(musicosFMT, printableWidth - 10);
                    const songsLines = docPdf.splitTextToSize(songsFMT, printableWidth - 10);
                    const obsLines = docPdf.splitTextToSize(obsFMT, printableWidth - 10);
                    
                    const cardHeight = 22 + (musicosLines.length * 4.5) + (songsLines.length * 4.5) + (obsLines.length * 4.5);
                    
                    if (y + cardHeight > pageHeight - 15) {
                        docPdf.addPage();
                        y = 15;
                        
                        docPdf.setFillColor(79, 70, 229);
                        docPdf.rect(marginX, y, printableWidth, 3, 'F');
                        docPdf.setFont('helvetica', 'bold');
                        docPdf.setFontSize(8);
                        docPdf.setTextColor(148, 163, 184);
                        docPdf.text(`ESCALAS DE LOUVOR - PÁGINA ${docPdf.getNumberOfPages()}`, marginX, y - 4);
                        y += 10;
                    }
                    
                    docPdf.setFillColor(255, 255, 255);
                    docPdf.setDrawColor(226, 232, 240);
                    docPdf.rect(marginX, y, printableWidth, cardHeight, 'FD');
                    
                    docPdf.setFillColor(79, 70, 229);
                    docPdf.rect(marginX, y, 2.5, cardHeight, 'F');
                    
                    docPdf.setFont('helvetica', 'bold');
                    docPdf.setFontSize(9);
                    docPdf.setTextColor(15, 23, 42); 
                    docPdf.text(`CULTO / PROGRAMAÇÃO EM ${formattedDate}`, marginX + 5, y + 5.5);
                    
                    docPdf.setFontSize(7.5);
                    docPdf.setTextColor(71, 85, 105);
                    docPdf.text(`LÍDER DO MINISTÉRIO / CANTOR PRINCIPAL: ${leaderName.toUpperCase()}`, marginX + 5, y + 10.5);
                    
                    let curY = y + 15;
                    
                    docPdf.setFont('helvetica', 'bold');
                    docPdf.setFontSize(7.5);
                    docPdf.setTextColor(99, 102, 241); 
                    docPdf.text('EQUIPE ESCALADA:', marginX + 5, curY);
                    
                    docPdf.setFont('helvetica', 'normal');
                    docPdf.setTextColor(71, 85, 105);
                    musicosLines.forEach((line: string) => {
                        curY += 4.5;
                        docPdf.text(line, marginX + 5, curY);
                    });
                    
                    curY += 5;
                    docPdf.setFont('helvetica', 'bold');
                    docPdf.setTextColor(99, 102, 241);
                    docPdf.text('REPERTÓRIO / CÂNTICOS SELECIONADOS:', marginX + 5, curY);
                    
                    docPdf.setFont('helvetica', 'normal');
                    docPdf.setTextColor(71, 85, 105);
                    songsLines.forEach((line: string) => {
                        curY += 4.5;
                        docPdf.text(line, marginX + 5, curY);
                    });
                    
                    curY += 5;
                    docPdf.setFont('helvetica', 'bold');
                    docPdf.setTextColor(245, 158, 11); 
                    docPdf.text('OBSERVAÇÕES:', marginX + 5, curY);
                    
                    docPdf.setFont('helvetica', 'normal');
                    docPdf.setTextColor(115, 115, 115);
                    obsLines.forEach((line: string) => {
                        curY += 4.5;
                        docPdf.text(line, marginX + 5, curY);
                    });
                    
                    y += cardHeight + 6;
                });
            }
            
            docPdf.save(`escalas_louvor_${new Date().toISOString().substring(0,10)}.pdf`);
            addToast("Relatório de escalas gerado com sucesso!", "success");
        } catch (e) {
            console.error(e);
            addToast("Erro ao gerar PDF de Escalas.", "error");
        }
    };

    const exportarMusicasPDF = () => {
        try {
            const docPdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            let y = 15;
            const pageHeight = 297;
            const pageWidth = 210;
            const marginX = 15;
            const printableWidth = pageWidth - (marginX * 2); 
            
            const igrejaNome = db.nome || db.igreja_nome || 'IP INTEGRADO - MINISTÉRIO DE LOUVOR';
            docPdf.setFillColor(79, 70, 229); 
            docPdf.rect(marginX, y, printableWidth, 18, 'F');
            
            docPdf.setFont('helvetica', 'bold');
            docPdf.setFontSize(11);
            docPdf.setTextColor(255, 255, 255);
            docPdf.text(igrejaNome.toUpperCase(), marginX + 5, y + 6);
            
            docPdf.setFontSize(8);
            docPdf.setFont('helvetica', 'normal');
            docPdf.setTextColor(220, 225, 255);
            docPdf.text('REPOSITÓRIO E REPERTÓRIO OFICIAL DE CANÇÕES', marginX + 5, y + 12);
            
            docPdf.setTextColor(255, 255, 255);
            const dataGeracao = new Date().toLocaleDateString('pt-BR');
            docPdf.text(`Gerado em: ${dataGeracao}`, marginX + printableWidth - 45, y + 6);
            
            y += 24;
            
            docPdf.setFillColor(248, 250, 252);
            docPdf.rect(marginX, y, printableWidth, 15, 'F');
            docPdf.setDrawColor(226, 232, 240);
            docPdf.rect(marginX, y, printableWidth, 15, 'S');
            
            docPdf.setFont('helvetica', 'bold');
            docPdf.setFontSize(8.5);
            docPdf.setTextColor(71, 85, 105);
            docPdf.text('ESTATÍSTICAS DO ACERVO:', marginX + 4, y + 5.5);
            
            docPdf.setFont('helvetica', 'normal');
            docPdf.text(`Total de Canções Cadastradas: ${musicas.length}  |  Gerado em conformidade com as diretivas do sistema`, marginX + 4, y + 10.5);
            
            y += 22;

            if (musicas.length === 0) {
                docPdf.setFont('helvetica', 'italic');
                docPdf.setFontSize(10);
                docPdf.setTextColor(148, 163, 184);
                docPdf.text("Nenhuma música cadastrada no acervo.", marginX, y + 10);
            } else {
                docPdf.setFillColor(241, 245, 249);
                docPdf.rect(marginX, y, printableWidth, 8, 'F');
                docPdf.setFont('helvetica', 'bold');
                docPdf.setFontSize(8);
                docPdf.setTextColor(51, 65, 85);
                docPdf.text('CÓD / TÍTULO', marginX + 3, y + 6);
                docPdf.text('ARTISTA / MINISTÉRIO', marginX + 65, y + 6);
                docPdf.text('TOM', marginX + 120, y + 6);
                docPdf.text('ESTILO / GÊNERO', marginX + 135, y + 6);
                docPdf.text('BPM', marginX + 165, y + 6);
                
                y += 8;
                
                musicas.forEach((song, index) => {
                    if (y > pageHeight - 20) {
                        docPdf.addPage();
                        y = 15;
                        
                        docPdf.setFillColor(79, 70, 229);
                        docPdf.rect(marginX, y, printableWidth, 3, 'F');
                        docPdf.setFont('helvetica', 'bold');
                        docPdf.setFontSize(8);
                        docPdf.setTextColor(148, 163, 184);
                        docPdf.text(`REPERTÓRIO DE LOUVOR - PÁGINA ${docPdf.getNumberOfPages()}`, marginX, y - 4);
                        y += 10;
                        
                        docPdf.setFillColor(241, 245, 249);
                        docPdf.rect(marginX, y, printableWidth, 8, 'F');
                        docPdf.setFont('helvetica', 'bold');
                        docPdf.setFontSize(8);
                        docPdf.setTextColor(51, 65, 85);
                        docPdf.text('CÓD / TÍTULO', marginX + 3, y + 6);
                        docPdf.text('ARTISTA / MINISTÉRIO', marginX + 65, y + 6);
                        docPdf.text('TOM', marginX + 120, y + 6);
                        docPdf.text('ESTILO / GÊNERO', marginX + 135, y + 6);
                        docPdf.text('BPM', marginX + 165, y + 6);
                        y += 8;
                    }
                    
                    docPdf.setDrawColor(241, 245, 249);
                    docPdf.line(marginX, y, marginX + printableWidth, y);
                    
                    docPdf.setFont('helvetica', 'normal');
                    docPdf.setFontSize(8);
                    docPdf.setTextColor(15, 23, 42);
                    
                    const titleStr = `${index + 1}. ${song.titulo || 'N/A'}`;
                    const titleTrunc = titleStr.substring(0, 32);
                    const artistTrunc = (song.artista || 'N/A').substring(0, 28);
                    
                    docPdf.text(titleTrunc, marginX + 3, y + 5.5);
                    docPdf.text(artistTrunc, marginX + 65, y + 5.5);
                    
                    docPdf.setFont('helvetica', 'bold');
                    docPdf.setTextColor(79, 70, 229);
                    docPdf.text(song.tom || 'N/D', marginX + 120, y + 5.5);
                    
                    docPdf.setFont('helvetica', 'normal');
                    docPdf.setTextColor(71, 85, 105);
                    docPdf.text(song.ritmo || 'Worship', marginX + 135, y + 5.5);
                    docPdf.text(String(song.bpm || 'S/B'), marginX + 165, y + 5.5);
                    
                    y += 7.5;
                });
            }
            
            docPdf.save(`repertorio_louvor_${new Date().toISOString().substring(0,10)}.pdf`);
            addToast("Catálogo de repertório gerado com sucesso!", "success");
        } catch (e) {
            console.error(e);
            addToast("Erro ao gerar catálogo de músicas.", "error");
        }
    };

    const exportarEquipePDF = () => {
        try {
            const docPdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            let y = 15;
            const pageHeight = 297;
            const pageWidth = 210;
            const marginX = 15;
            const printableWidth = pageWidth - (marginX * 2); 
            
            const igrejaNome = db.nome || db.igreja_nome || 'IP INTEGRADO - MINISTÉRIO DE LOUVOR';
            docPdf.setFillColor(79, 70, 229); 
            docPdf.rect(marginX, y, printableWidth, 18, 'F');
            
            docPdf.setFont('helvetica', 'bold');
            docPdf.setFontSize(11);
            docPdf.setTextColor(255, 255, 255);
            docPdf.text(igrejaNome.toUpperCase(), marginX + 5, y + 6);
            
            docPdf.setFontSize(8);
            docPdf.setFont('helvetica', 'normal');
            docPdf.setTextColor(220, 225, 255);
            docPdf.text('RELATÓRIO GERAL DA EQUIPE DE LEVITAS E VOCAIS', marginX + 5, y + 12);
            
            docPdf.setTextColor(255, 255, 255);
            const dataGeracao = new Date().toLocaleDateString('pt-BR');
            docPdf.text(`Gerado em: ${dataGeracao}`, marginX + printableWidth - 45, y + 6);
            
            y += 24;
            
            docPdf.setFillColor(248, 250, 252);
            docPdf.rect(marginX, y, printableWidth, 15, 'F');
            docPdf.setDrawColor(226, 232, 240);
            docPdf.rect(marginX, y, printableWidth, 15, 'S');
            
            docPdf.setFont('helvetica', 'bold');
            docPdf.setFontSize(8.5);
            docPdf.setTextColor(71, 85, 105);
            docPdf.text('CONSOLIDAÇÃO DE INTEGRANTES:', marginX + 4, y + 5.5);
            
            docPdf.setFont('helvetica', 'normal');
            const activeCount = musicos.filter(m => m.status === 'Ativo').length;
            docPdf.text(`Total de Integrantes: ${musicos.length}  |  Membros Ativos: ${activeCount}  |  Auxiliares/Apoio: ${musicos.length - activeCount}`, marginX + 4, y + 10.5);
            
            y += 22;

            if (musicos.length === 0) {
                docPdf.setFont('helvetica', 'italic');
                docPdf.setFontSize(10);
                docPdf.setTextColor(148, 163, 184);
                docPdf.text("Nenhum integrante cadastrado na equipe de levitas.", marginX, y + 10);
            } else {
                docPdf.setFillColor(241, 245, 249);
                docPdf.rect(marginX, y, printableWidth, 8, 'F');
                docPdf.setFont('helvetica', 'bold');
                docPdf.setFontSize(8);
                docPdf.setTextColor(51, 65, 85);
                docPdf.text('INTEGRANTE / COMPONENTE', marginX + 3, y + 6);
                docPdf.text('INSTRUMENTOS / VOZ', marginX + 65, y + 6);
                docPdf.text('DISPONIBILIDADE', marginX + 120, y + 6);
                docPdf.text('STATUS', marginX + 165, y + 6);
                
                y += 8;
                
                musicos.forEach((m, index) => {
                    if (y > pageHeight - 20) {
                        docPdf.addPage();
                        y = 15;
                        
                        docPdf.setFillColor(79, 70, 229);
                        docPdf.rect(marginX, y, printableWidth, 3, 'F');
                        docPdf.setFont('helvetica', 'bold');
                        docPdf.setFontSize(8);
                        docPdf.setTextColor(148, 163, 184);
                        docPdf.text(`EQUIPE DE LEVITAS - PÁGINA ${docPdf.getNumberOfPages()}`, marginX, y - 4);
                        y += 10;
                        
                        docPdf.setFillColor(241, 245, 249);
                        docPdf.rect(marginX, y, printableWidth, 8, 'F');
                        docPdf.setFont('helvetica', 'bold');
                        docPdf.setFontSize(8);
                        docPdf.setTextColor(51, 65, 85);
                        docPdf.text('INTEGRANTE / COMPONENTE', marginX + 3, y + 6);
                        docPdf.text('INSTRUMENTOS / VOZ', marginX + 65, y + 6);
                        docPdf.text('DISPONIBILIDADE', marginX + 120, y + 6);
                        docPdf.text('STATUS', marginX + 165, y + 6);
                        y += 8;
                    }
                    
                    docPdf.setDrawColor(241, 245, 249);
                    docPdf.line(marginX, y, marginX + printableWidth, y);
                    
                    docPdf.setFont('helvetica', 'normal');
                    docPdf.setFontSize(8);
                    docPdf.setTextColor(15, 23, 42);
                    
                    const nomeMembro = getMemberName(m.membro_id || '');
                    const instrumentosStr = m.instrumentos || 'Nenhum instrumento';
                    const disponibilidadeStr = m.disponibilidade || 'Não informada';
                    const statusStr = m.status || 'Ativo';
                    
                    const nameTrunc = nomeMembro.substring(0, 32);
                    const instTrunc = instrumentosStr.substring(0, 30);
                    const dispTrunc = disponibilidadeStr.substring(0, 24);
                    
                    docPdf.text(`${index + 1}. ${nameTrunc}`, marginX + 3, y + 5.5);
                    docPdf.text(instTrunc, marginX + 65, y + 5.5);
                    docPdf.text(dispTrunc, marginX + 120, y + 5.5);
                    
                    if (statusStr === 'Ativo') {
                        docPdf.setFont('helvetica', 'bold');
                        docPdf.setTextColor(22, 163, 74); 
                    } else if (statusStr === 'Inativo') {
                        docPdf.setFont('helvetica', 'bold');
                        docPdf.setTextColor(220, 38, 38); 
                    } else {
                        docPdf.setFont('helvetica', 'bold');
                        docPdf.setTextColor(217, 119, 6); 
                    }
                    docPdf.text(statusStr, marginX + 165, y + 5.5);
                    
                    y += 7.5;
                });
            }
            
            docPdf.save(`equipe_levitas_${new Date().toISOString().substring(0,10)}.pdf`);
            addToast("Relatório de equipe de levitas gerado com sucesso!", "success");
        } catch (e) {
            console.error(e);
            addToast("Erro ao gerar relatório de equipe.", "error");
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance text-slate-700">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl shadow-sm border border-indigo-100"><Briefcase size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ministérios e Departamentos</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Gestão de líderes, componentes e agendas</p>
                    </div>
                </div>
            </div>
            <div className="glass-modern p-4 rounded-[2rem] flex overflow-x-auto custom-scrollbar gap-3 border border-white/50">{menuItems.map(item => <TabButton key={item.id} item={item} />)}</div>
            <div className="flex-1 overflow-hidden">
                {tab === 1 && (
                    <div className="space-y-6 h-full overflow-y-auto custom-scrollbar p-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-[2rem] bg-gradient-to-br from-indigo-50 to-white border-indigo-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl"><Briefcase size={32}/></div>
                                <div><h3 className="text-4xl font-black text-slate-800 tracking-tight">{totalMinisterios}</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Ministérios</p></div>
                            </div>
                            <div className="glass-card p-6 rounded-[2rem] bg-gradient-to-br from-blue-50 to-white border-blue-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Users size={32}/></div>
                                <div><h3 className="text-4xl font-black text-slate-800 tracking-tight">{totalComponentes}</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Componentes Totais</p></div>
                            </div>
                            <div className="glass-card p-6 rounded-[2rem] bg-gradient-to-br from-amber-50 to-white border-amber-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl"><Calendar size={32}/></div>
                                <div><h3 className="text-4xl font-black text-slate-800 tracking-tight">{totalAgenda}</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Programações</p></div>
                            </div>
                        </div>
                        <div className="glass-modern p-8 rounded-[2.5rem]">
                            <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center gap-2"><Star size={20} className="text-amber-500"/> Visão Detalhada por Ministério</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ministerios.map(min => (
                                    <div key={min.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-[100px] -z-0"></div>
                                        <h4 className="font-black text-lg text-indigo-700 uppercase mb-1 relative z-10">{min.nome}</h4>
                                        <p className="text-xs text-slate-500 mb-5 relative z-10">Líder: <span className="font-bold text-slate-700">{db.membros.find(m=>m.id===min.lider1_id)?.nome || 'Não definido'}</span></p>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 relative z-10">
                                            <div className="bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold text-blue-700"><Users size={14}/> {(min.membros?.length || 0)}</div>
                                            <div className="bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold text-amber-700"><Calendar size={14}/> {(min.agenda?.length || 0)}</div>
                                        </div>
                                    </div>
                                ))}
                                {ministerios.length === 0 && <p className="text-slate-400 italic text-sm">Nenhum ministério cadastrado no sistema.</p>}
                            </div>
                        </div>
                    </div>
                )}
                {tab === 2 && (<GenericTable title="Gestão de Ministérios" type="ministerio" data={ministerios} columns={[{header:'Ministério', key:'nome'}, {header:'Líder Principal', key:'lider1_id', render: m => db.membros.find(mem=>mem.id===m.lider1_id)?.nome || '-'}]} />)}
                {tab === 3 && (<div className="h-full flex flex-col"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-slate-700">Membros</h3><Button onClick={() => openModal('ministerio_membro')} variant="primary"><Plus size={18}/> Adicionar</Button></div><div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">{ministerios.map(min => (<div key={min.id} className="glass-panel p-6 rounded-3xl"><h4 className="font-bold text-lg text-indigo-700 mb-4">{min.nome}</h4><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500"><tr><th className="p-3">Nome</th><th className="p-3">Função</th><th className="p-3 text-right">Ação</th></tr></thead><tbody>{(min.membros || []).map((mm, idx) => { const membroRef = db.membros.find(m => m.id === mm.membro_id); return (<tr key={idx} className="border-b border-slate-100"><td className="p-3 font-bold">{membroRef?.nome || 'Membro'}</td><td className="p-3 text-indigo-600 font-medium">{mm.funcao}</td><td className="p-3 text-right"><button onClick={() => handleDeleteMember(min.id, idx)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16}/></button></td></tr>); })}</tbody></table></div></div>))}</div></div>)}
                {tab === 4 && (<div className="h-full flex flex-col"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-slate-700">Agenda</h3><Button onClick={() => openModal('ministerio_evento')} variant="primary"><Plus size={18}/> Novo</Button></div><div className="flex-1 overflow-y-auto custom-scrollbar grid md:grid-cols-2 lg:grid-cols-3 gap-4">{ministerios.flatMap(min => (min.agenda || []).map(evt => ({...evt, min_nome: min.nome}))).map((evt, idx) => (<div key={idx} className="glass-card p-5 rounded-3xl border-l-4 border-l-indigo-500"><div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-600 px-2 py-1 rounded">{evt.min_nome}</span><span className="text-xs font-bold text-slate-400">{formatDateLocal(evt.data)}</span></div><h4 className="font-bold text-slate-800 leading-tight mb-1">{evt.titulo}</h4><p className="text-sm text-slate-500 mb-4">{evt.hora}h</p></div>))}</div></div>)}
                
                {/* WORSHIP MINISTRY TAB */}
                {tab === 5 && (
                    <div className="h-full flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-2">
                        {/* Header Panel */}
                        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-6 rounded-[2rem] shadow-md border border-indigo-700/50 flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md"><Music size={32}/></div>
                                <div>
                                    <h3 className="font-extrabold text-2xl tracking-tight">Ministério de Louvor</h3>
                                    <p className="text-xs text-indigo-100/85 font-medium mt-1 uppercase tracking-widest">Escalas, Cifras com IA, Repertório e Logística</p>
                                </div>
                            </div>
                        </div>

                        {/* Worship Sub tabs switcher */}
                        <div className="flex gap-2 border-b border-slate-200 pb-1">
                            {['escalas', 'musicas', 'musicos', 'reunioes'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setSubTab(st)}
                                    className={`px-5 py-2 font-black text-xs uppercase tracking-wider rounded-xl transition-all ${subTab === st ? 'bg-indigo-50 text-indigo-700 font-black border-b-2 border-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                                >
                                    {st === 'escalas' && '📅 Escalas & Histórico'}
                                    {st === 'musicas' && '🎸 Repertório & Cifras IA'}
                                    {st === 'musicos' && '👥 EQUIPES DE LOUVOR'}
                                    {st === 'reunioes' && '📢 Reuniões & Ensaios'}
                                </button>
                            ))}
                        </div>

                        {/* SUB-TAB CONTENTS */}
                        
                        {/* 1. ESCALAS */}
                        {subTab === 'escalas' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-black text-lg text-slate-800">Escalas e Histórico por Data</h4>
                                        <p className="text-xs text-slate-500">Histórico de escalas e revezamento musical arquivados</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={exportarEscalasPDF} 
                                            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl px-4 py-2 shadow-sm transition-all"
                                        >
                                            <Printer size={14}/> Imprimir Escalas
                                        </button>
                                        <Button onClick={() => { setEditingScaleId(null); setScaleData(getTodayDate()); setScaleLiderId(''); setScaleMusicos({}); setScaleMusicasIds([]); setScaleObservacoes(''); setScaleArquivos([]); setShowAddScale(true); }} variant="primary">
                                            <Plus size={16}/> Nova Escala por Data
                                        </Button>
                                    </div>
                                </div>

                                {/* Form Overlay Card for Scale */}
                                {showAddScale && (
                                    <div className="glass-panel p-6 rounded-3xl border border-indigo-100 bg-white/95 mt-2 space-y-4">
                                        <h5 className="font-black text-indigo-700 uppercase tracking-wider text-sm">{editingScaleId ? 'Editar Escala' : 'Nova Escala'}</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput label="Data da Escala" type="date" value={scaleData} onChange={setScaleData} />
                                            <FormSelect
                                                label="Líder do Culto (Cantor Líder)"
                                                value={scaleLiderId}
                                                onChange={setScaleLiderId}
                                                options={[
                                                    { label: "-- Selecione --", value: "" },
                                                    ...musicos.map(m => ({ label: `${getMemberName(m.membro_id)} (${m.instrumentos || 'Vocal'})`, value: m.id }))
                                                ]}
                                            />
                                        </div>

                                        <div className="border-t border-slate-100 pt-4">
                                            <h6 className="font-bold text-xs text-slate-500 uppercase mb-3">Escalar Músicos por Instrumento / Função:</h6>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {['Violão', 'Teclado', 'Baixo', 'Bateria', 'Guitarra', 'Ministração Vocais', 'Backing Vocal 1', 'Backing Vocal 2'].map(inst => (
                                                    <div key={inst} className="flex flex-col space-y-1">
                                                        <label className="text-xs font-bold text-slate-600">{inst}</label>
                                                        <select
                                                            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                                                            value={scaleMusicos[inst] || ''}
                                                            onChange={(e) => setScaleMusicos({...scaleMusicos, [inst]: e.target.value})}
                                                        >
                                                            <option value="">-- Não Escalado --</option>
                                                            {musicos.map(m => (
                                                                <option key={m.id} value={m.membro_id}>{getMemberName(m.membro_id)}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 block mb-2">Músicas do Repertório para o Dia</label>
                                                <div className="max-h-[160px] overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                                                    {musicas.map(s => (
                                                        <label key={s.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={scaleMusicasIds.includes(s.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setScaleMusicasIds([...scaleMusicasIds, s.id]);
                                                                    } else {
                                                                        setScaleMusicasIds(scaleMusicasIds.filter(id => id !== s.id));
                                                                    }
                                                                }}
                                                                className="rounded text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            {s.titulo} ({s.tom}) - {s.artista}
                                                        </label>
                                                    ))}
                                                    {musicas.length === 0 && <p className="text-xs text-slate-400 italic">Configure primeiro o Repertório de Cifras.</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <FormInput label="Observações Gerais da Escala" type="text" value={scaleObservacoes} onChange={setScaleObservacoes} placeholder="E.g., Chegar 18h00 para passagem de som geral." />
                                                
                                                {/* File Attachment list inside scale */}
                                                <div className="mt-4">
                                                    <label className="text-xs font-bold text-slate-600 block mb-1">Arquivos / links (Partituras, YouTube, etc.)</label>
                                                    <div className="flex gap-2">
                                                        <input className="text-xs border rounded p-2 flex-1 outline-none" placeholder="Nome do arquivo" value={newScaleArgNome} onChange={e=>setNewScaleArgNome(e.target.value)} />
                                                        <input className="text-xs border rounded p-2 flex-1 outline-none" placeholder="Link do arquivo" value={newScaleArgUrl} onChange={e=>setNewScaleArgUrl(e.target.value)} />
                                                        <button 
                                                            type="button" 
                                                            className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded px-3 py-1 font-bold"
                                                            onClick={() => {
                                                                if (!newScaleArgNome || !newScaleArgUrl) return addToast("Preencha nome e link", "warning");
                                                                setScaleArquivos([...scaleArquivos, { nome: newScaleArgNome, url: newScaleArgUrl }]);
                                                                setNewScaleArgNome(''); setNewScaleArgUrl('');
                                                            }}
                                                        >
                                                            Anexar
                                                        </button>
                                                    </div>
                                                    <div className="space-y-1 mt-2">
                                                        {scaleArquivos.map((a, i) => (
                                                            <div key={i} className="flex justify-between items-center text-[11px] bg-slate-100 px-3 py-1 rounded">
                                                                <span className="font-semibold text-slate-700">{a.nome}</span>
                                                                <button type="button" onClick={() => setScaleArquivos(scaleArquivos.filter((_, idx)=>idx!==i))} className="text-rose-600 font-bold">Excluir</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
                                            <button onClick={() => setShowAddScale(false)} className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">Cancelar</button>
                                            <button onClick={handleSaveScale} className="text-xs font-bold text-white bg-indigo-600 px-5 py-2 rounded-xl shadow hover:bg-indigo-700 transition">Salvar Escala por Data</button>
                                        </div>
                                    </div>
                                )}

                                {/* Historical Scale Timeline Grid */}
                                <div className="space-y-3">
                                    {loadingEscalas ? (
                                        <p className="text-sm text-slate-500 italic">Processando histórico de escalas...</p>
                                    ) : escalas.map(sch => {
                                        const parsedDate = sch.data ? sch.data.split('-').reverse().join('/') : '-';
                                        return (
                                            <div key={sch.id} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm relative overflow-hidden transition hover:shadow-md">
                                                <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500"></div>
                                                <div className="flex justify-between items-start flex-wrap gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-indigo-50 text-indigo-700 text-xs font-black uppercase px-2.5 py-1 rounded-lg">CADASTRADO: {parsedDate}</span>
                                                            <span className="text-[11px] font-bold text-slate-500">Líder: {getLiderName(sch.lider_id)}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 font-bold mt-3">MÚSICOS ESCALADOS:</p>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {sch.musicos && Object.keys(sch.musicos).map(role => (
                                                                <span key={role} className="text-[10px] uppercase font-bold bg-slate-50 border border-slate-150 text-slate-800 px-2 py-1 rounded">
                                                                    🎸 {role}: {db.membros.find((m: any)=>m.id===sch.musicos[role])?.nome || 'Vago'}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        
                                                        {sch.musicasIds && sch.musicasIds.length > 0 && (
                                                            <div className="mt-3">
                                                                <p className="text-xs text-indigo-600 font-extrabold">REPERTÓRIO SELECIONADO:</p>
                                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                                    {sch.musicasIds.map((mid: string) => {
                                                                        const song = musicas.find(s => s.id === mid);
                                                                        if (!song) return null;
                                                                        return (
                                                                            <span key={mid} className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded cursor-pointer hover:underline" onClick={() => { setViewChordsSongId(viewChordsSongId === mid ? null : mid); setSubTab('musicas'); }}>
                                                                                🎵 {song.titulo} ({song.tom})
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {sch.arquivos && sch.arquivos.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                                                                <span className="font-bold text-slate-500">Arquivos da Escala:</span>
                                                                {sch.arquivos.map((a: any, i: number) => (
                                                                    <a key={i} href={a.url} target="_blank" rel="noreferrer" className="text-blue-600 font-extrabold underline hover:text-blue-800 flex items-center gap-1">
                                                                        <Paperclip size={10}/> {a.nome}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {sch.observacoes && (
                                                            <p className="text-xs italic text-slate-500 mt-2 block border-l-2 border-slate-200 pl-2">Nota: {sch.observacoes}</p>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditScale(sch)} className="text-slate-400 hover:text-indigo-600 p-1"><Edit size={16}/></button>
                                                        <button onClick={() => handleDeleteScale(sch.id)} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 size={16}/></button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {escalas.length === 0 && <p className="text-slate-400 font-medium italic text-sm text-center py-4">Nenhuma escala cadastrada por data.</p>}
                                </div>
                            </div>
                        )}

                        {/* 2. REPERTÓRIO */}
                        {subTab === 'musicas' && (
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-4 justify-between items-center">
                                    <div>
                                        <h4 className="font-black text-lg text-slate-800">Cifras & Repertório do Grupo</h4>
                                        <p className="text-xs text-slate-500">Adicione e busque letras com acordes estruturados por inteligência artificial</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Palavra-chave hino..."
                                                value={searchSong}
                                                onChange={(e) => setSearchSong(e.target.value)}
                                                className="text-xs border rounded-xl px-3 py-2 pl-8 focus:ring-1 focus:ring-indigo-500 bg-white"
                                            />
                                            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={12}/>
                                        </div>
                                        <button 
                                            onClick={exportarMusicasPDF} 
                                            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl px-4 py-2 shadow-sm transition-all font-bold"
                                        >
                                            <Printer size={14}/> Catálogo Repertório
                                        </button>
                                        <Button onClick={() => { setEditingSongId(null); setSongTitulo(''); setSongArtista(''); setSongTom('G'); setSongRitmo('Worship'); setSongBpm('72'); setSongLetraCifra(''); setSongArquivos([]); setShowAddSong(true); }} variant="primary">
                                            <Plus size={16}/> Nova Canção
                                        </Button>
                                    </div>
                                </div>

                                {/* Form Overlay for Song definition / Chords search with AI */}
                                {showAddSong && (
                                    <div className="glass-panel p-6 rounded-3xl border border-indigo-100 bg-white mt-2 space-y-4">
                                        <h5 className="font-black text-indigo-700 uppercase tracking-wider text-sm">{editingSongId ? 'Editar Música' : 'Nova Música'}</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                            <FormInput label="Título da Música" value={songTitulo} onChange={setSongTitulo} placeholder="E.g., Quão Grande é o Meu Deus" />
                                            <FormInput label="Artista / Cantor" value={songArtista} onChange={setSongArtista} placeholder="E.g., Soraya Moraes" />
                                            <FormSelect label="Tom Recomendado" value={songTom} onChange={setSongTom} options={['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B','Am','Bm','C#m','Dm','Em','F#m','G#m'].map(t=>({label:t,value:t}))} />
                                            <FormInput label="BPM" type="number" value={songBpm} onChange={setSongBpm} />
                                            <FormInput label="Estilo" value={songRitmo} onChange={setSongRitmo} placeholder="E.g., Worship" />
                                        </div>

                                        <div className="flex flex-col space-y-2">
                                            <div className="flex justify-between items-center flex-wrap gap-2">
                                                <label className="text-xs font-black text-slate-600">Letra & Cifragem da Canção</label>
                                                <button
                                                    type="button"
                                                    disabled={aiGenerating}
                                                    onClick={handleGenerateChordsWithAI}
                                                    className="flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-[11px] rounded-xl px-4 py-2 shadow-sm uppercase tracking-wider hover:brightness-105 disabled:opacity-50 transition"
                                                >
                                                    {aiGenerating ? <Loader2 className="animate-spin" size={12}/> : <Sparkles size={12}/>}
                                                    ✨ Buscar com IA Letra e Cifra
                                                </button>
                                            </div>
                                            <textarea
                                                className="w-full h-80 text-xs bg-slate-50 border border-slate-200 font-mono rounded-xl p-4 resize-y leading-relaxed outline-none focus:ring-1 focus:ring-indigo-500"
                                                value={songLetraCifra}
                                                onChange={(e) => setSongLetraCifra(e.target.value)}
                                                placeholder="Insira as cifras manualmente ou clique para puxar automaticamente por Inteligência Artificial..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 block mb-1">Mídias e Anexos Digitais</label>
                                                <div className="flex gap-2">
                                                    <input className="text-xs border rounded p-2 flex-1" placeholder="Ex: Cifra PDF, Video YouTube" value={newArgNome} onChange={e=>setNewArgNome(e.target.value)} />
                                                    <input className="text-xs border rounded p-2 flex-1" placeholder="Ex: URL do link" value={newArgUrl} onChange={e=>setNewArgUrl(e.target.value)} />
                                                    <button 
                                                        type="button" 
                                                        className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 font-bold rounded"
                                                        onClick={() => {
                                                            if (!newArgNome || !newArgUrl) return addToast("Preencha nome e link", "warning");
                                                            setSongArquivos([...songArquivos, { nome: newArgNome, url: newArgUrl }]);
                                                            setNewArgNome(''); setNewArgUrl('');
                                                        }}
                                                    >
                                                        Anexcar
                                                    </button>
                                                </div>
                                                <div className="space-y-1 mt-2">
                                                    {songArquivos.map((a, i) => (
                                                        <div key={i} className="flex justify-between items-center text-[10px] bg-slate-100 px-3 py-1 rounded">
                                                            <span className="font-semibold">{a.nome}</span>
                                                            <button type="button" onClick={() => setSongArquivos(songArquivos.filter((_, idx)=>idx!==i))} className="text-rose-600 font-bold">Remover</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 justify-end pt-3">
                                            <button onClick={() => setShowAddSong(false)} className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">Cancelar</button>
                                            <button onClick={handleSaveSong} className="text-xs font-bold text-white bg-indigo-600 px-5 py-2 rounded-xl shadow">Salvar Música</button>
                                        </div>
                                    </div>
                                )}

                                {/* Songs Catalogue */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredSongs.map(s => (
                                        <div key={s.id} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm hover:shadow-md transition">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <h5 className="font-extrabold text-lg text-slate-800 leading-tight">{s.titulo}</h5>
                                                    <p className="text-xs text-slate-500 font-bold mt-0.5">Artista: {s.artista || 'Consagrado'}</p>
                                                    <div className="flex gap-2 mt-3">
                                                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 uppercase px-2 py-1 rounded-md">Tom: {s.tom || 'G'}</span>
                                                        {s.bpm && <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">{s.bpm} BPM</span>}
                                                        {s.ritmo && <span className="text-[10px] font-black bg-amber-50 text-amber-700 px-2 py-1 rounded-md">{s.ritmo}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => setViewChordsSongId(viewChordsSongId === s.id ? null : s.id)} className="text-indigo-600 hover:text-indigo-800 p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-black">
                                                        {viewChordsSongId === s.id ? 'Fechar Cifras' : 'Ver Cifras'}
                                                    </button>
                                                    <button onClick={() => handleEditSong(s)} className="text-slate-400 hover:text-indigo-600 p-1"><Edit size={14}/></button>
                                                    <button onClick={() => handleDeleteSong(s.id)} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 size={14}/></button>
                                                </div>
                                            </div>

                                            {/* Files in catalogue */}
                                            {s.arquivos && s.arquivos.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-3 text-[10px]">
                                                    <span className="font-bold text-slate-500">Mídias:</span>
                                                    {s.arquivos.map((a: any, i: number) => (
                                                        <a key={i} href={a.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-extrabold flex items-center gap-1">
                                                            🔗 {a.nome}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Stylized Chords Visualizer box */}
                                            {viewChordsSongId === s.id && (
                                                <div className="mt-4 pt-4 border-t border-indigo-100 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-slate-500 uppercase">Letra & Acordes Cifrados</span>
                                                        <button 
                                                            onClick={async () => {
                                                                await copyToClipboard(s.letra_cifra);
                                                                addToast("Cifras copiadas para a área de transferência!", "success");
                                                            }} 
                                                            className="text-[10px] font-bold text-indigo-700 border border-indigo-200 bg-indigo-50 px-3 py-1 rounded"
                                                        >
                                                            Copiar Cifra
                                                        </button>
                                                    </div>
                                                    <pre className="text-[11px] bg-slate-50 border border-slate-200 text-slate-800 font-mono p-4 rounded-xl max-h-[300px] overflow-y-auto whitespace-pre leading-relaxed tracking-wider">
                                                        {s.letra_cifra || 'Nenhuma cifra cadastrada para esta canção.'}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {filteredSongs.length === 0 && <p className="text-slate-400 font-medium italic text-sm py-4">Nenhuma música cadastrada no repertório.</p>}
                                </div>
                            </div>
                        )}

                        {/* 3. LANÇAMENTO EQUIPE / MEDICOS */}
                        {subTab === 'musicos' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-black text-lg text-slate-800">Equipe de Levitas (Músicos e Cantores)</h4>
                                        <p className="text-xs text-slate-500">Adicione equipe e vincule especialidades musicais aos perfis de membros</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={exportarEquipePDF} 
                                            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl px-4 py-2 shadow-sm transition-all"
                                        >
                                            <Printer size={14}/> Imprimir Ficha da Equipe
                                        </button>
                                        <Button onClick={() => { setEditingMusicianId(null); setMusicianMembroId(''); setMusicianInstrumentos(''); setMusicianDisponibilidade('Livre todos os cultos'); setMusicianStatus('Ativo'); setShowAddMusician(true); }} variant="primary">
                                            <Plus size={16}/> Cadastrar Integrante
                                        </Button>
                                    </div>
                                </div>

                                {/* Form Overlay for Musician */}
                                {showAddMusician && (
                                    <div className="glass-panel p-6 rounded-3xl border border-indigo-100 bg-white mt-2 space-y-4">
                                        <h5 className="font-black text-indigo-700 uppercase tracking-wider text-sm">{editingMusicianId ? 'Editar Integrante' : 'Novo Integrante'}</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <FormSelect 
                                                label="Selecione o Membro da Igreja" 
                                                value={musicianMembroId} 
                                                onChange={setMusicianMembroId} 
                                                options={[
                                                    { label: "-- Escolha o Membro --", value: "" },
                                                    ...(db.membros || []).map((m: any) => ({ label: m.nome, value: m.id }))
                                                ]} 
                                            />
                                            <FormInput label="Instrumentos / Voz" value={musicianInstrumentos} onChange={setMusicianInstrumentos} placeholder="E.g., Teclado, Soprano, Violão" />
                                            <FormInput label="Disponibilidade / Notas" value={musicianDisponibilidade} onChange={setMusicianDisponibilidade} placeholder="E.g., Disponível domingos" />
                                            <FormSelect label="Status na Equipe" value={musicianStatus} onChange={setMusicianStatus} options={['Ativo','Em treinamento','Auxiliar','Inativo'].map(s=>({label:s,value:s}))} />
                                        </div>

                                        <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                                            <button onClick={() => setShowAddMusician(false)} className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">Cancelar</button>
                                            <button onClick={handleSaveMusician} className="text-xs font-bold text-white bg-indigo-600 px-5 py-2 rounded-xl">Gravar Cadastro</button>
                                        </div>
                                    </div>
                                )}

                                {/* Musicians List Visualizer */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {loadingMusicos ? (
                                        <p className="text-sm text-slate-500 italic">Carregando levitas...</p>
                                    ) : musicos.map(m => {
                                        const originalMembro = db.membros.find((mem: any) => mem.id === m.membro_id);
                                        return (
                                            <div key={m.id} className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm relative overflow-hidden flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-extrabold text-lg flex items-center justify-center border border-indigo-100">
                                                    {originalMembro?.nome ? originalMembro.nome.substring(0,2).toUpperCase() : 'LV'}
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="font-extrabold text-slate-800 text-sm leading-tight">{originalMembro?.nome || 'Membro do Portal'}</h5>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">{originalMembro?.email || 'Nenhum e-mail cadastrado'}</p>
                                                    <p className="text-xs text-indigo-700 font-extrabold mt-2 uppercase tracking-wide">🎤 {m.instrumentos || 'Sem instrumento'}</p>
                                                    
                                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${m.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{m.status}</span>
                                                        <div className="flex gap-1.5">
                                                            <button onClick={() => { setEditingMusicianId(m.id); setMusicianMembroId(m.membro_id || ''); setMusicianInstrumentos(m.instrumentos || ''); setMusicianDisponibilidade(m.disponibilidade || ''); setMusicianStatus(m.status || 'Ativo'); setShowAddMusician(true); }} className="text-slate-400 hover:text-indigo-600 p-1"><Edit size={12}/></button>
                                                            <button onClick={() => handleDeleteMusician(m.id)} className="text-slate-400 hover:text-rose-600 p-1"><Trash2 size={12}/></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {musicos.length === 0 && <p className="text-slate-400 font-medium italic text-sm text-center py-4">Nenhum integrante cadastrado na equipe de louvor.</p>}
                                </div>
                            </div>
                        )}

                        {/* 4. REUNIÕES E ENSAIOS */}
                        {subTab === 'reunioes' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-black text-lg text-slate-800">Agendamento de Reuniões & Ensaios</h4>
                                        <p className="text-xs text-slate-500">Agende ensaios rápidos e use os notificadores multicanais de envio direto</p>
                                    </div>
                                    <Button onClick={() => { setEditingRehearsalId(null); setRehearsalTitulo(''); setRehearsalData(getTodayDate()); setRehearsalHora('19:30'); setRehearsalLocal('Templo Sede'); setRehearsalPauta(''); setShowAddRehearsal(true); }} variant="primary">
                                        <Plus size={16}/> Marcar Ensaio/Reunião
                                    </Button>
                                </div>

                                {/* Form Overlay for Rehearsal */}
                                {showAddRehearsal && (
                                    <div className="glass-panel p-6 rounded-3xl border border-indigo-100 bg-white mt-2 space-y-4">
                                        <h5 className="font-black text-indigo-700 uppercase tracking-wider text-sm">{editingRehearsalId ? 'Editar Compromisso' : 'Agendar Compromisso'}</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <FormInput label="Compromisso / Título" value={rehearsalTitulo} onChange={setRehearsalTitulo} placeholder="E.g., Ensaio Geral Culto de Santa Ceia" />
                                            <FormInput label="Data" type="date" value={rehearsalData} onChange={setRehearsalData} />
                                            <FormInput label="Horário" value={rehearsalHora} onChange={setRehearsalHora} />
                                            <FormInput label="Local do Ensaio" value={rehearsalLocal} onChange={setRehearsalLocal} />
                                        </div>
                                        <FormInput label="Pauta de Estudo / Repertório para Ensaiar" value={rehearsalPauta} onChange={setRehearsalPauta} placeholder="Liste os hinos de ensaio e pautas pastorais aqui." />

                                        <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                                            <button onClick={() => setShowAddRehearsal(false)} className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">Cancelar</button>
                                            <button onClick={handleSaveRehearsal} className="text-xs font-bold text-white bg-indigo-600 px-5 py-2 rounded-xl">Agendar</button>
                                        </div>
                                    </div>
                                )}

                                {/* Scheduled Rehearsals List with Action Triggers */}
                                <div className="space-y-3">
                                    {loadingReunioes ? (
                                        <p className="text-sm text-slate-500 italic">Carregando agendamentos...</p>
                                    ) : reunioes.map(r => {
                                        const parsedDate = r.data ? r.data.split('-').reverse().join('/') : '-';
                                        return (
                                            <div key={r.id} className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-violet-50 text-violet-700 text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">📅 {parsedDate} - {r.hora}h</span>
                                                        <span className="text-xs text-slate-500 font-bold">Local: {r.local}</span>
                                                    </div>
                                                    <h5 className="font-extrabold text-lg text-slate-800 leading-tight">{r.titulo}</h5>
                                                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-150 font-bold">📝 Canções / Pauta: {r.pauta || 'Não definida.'}</p>
                                                    {r.notificadoPortal && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">✓ NOTIFICADO NO PORTAL</span>
                                                    )}
                                                </div>

                                                {/* Action Buttons for multi-channel notification */}
                                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                                    <div className="flex gap-1 justify-end">
                                                        <button onClick={() => { setEditingRehearsalId(r.id); setRehearsalTitulo(r.titulo || ''); setRehearsalData(r.data || getTodayDate()); setRehearsalHora(r.hora || '19:30'); setRehearsalLocal(r.local || 'Templo Sede'); setRehearsalPauta(r.pauta || ''); setShowAddRehearsal(true); }} className="text-slate-400 hover:text-indigo-600 p-2"><Edit size={16}/></button>
                                                        <button onClick={() => handleDeleteRehearsal(r.id)} className="text-slate-400 hover:text-rose-600 p-2"><Trash2 size={16}/></button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 justify-end">
                                                        <button 
                                                            onClick={() => handleShareRehearsalWhatsApp(r)} 
                                                            className="text-[10px] uppercase font-black bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-800 px-3 py-2 rounded-lg flex items-center gap-1"
                                                        >
                                                            💬 WhatsApp
                                                        </button>
                                                        <button 
                                                            onClick={() => handleSendRehearsalEmail(r)} 
                                                            className="text-[10px] uppercase font-black bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-800 px-3 py-2 rounded-lg flex items-center gap-1"
                                                        >
                                                            ✉️ E-Mail Equipe
                                                        </button>
                                                        <button 
                                                            hidden={r.notificadoPortal}
                                                            onClick={() => handlePublishRehearsalToMural(r)} 
                                                            className="text-[10px] uppercase font-black bg-indigo-650 text-white hover:bg-indigo-700 shadow-sm px-3 py-2 rounded-lg flex items-center gap-1"
                                                        >
                                                            🔔 Notificar Portal
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {reunioes.length === 0 && <p className="text-slate-400 font-medium italic text-sm text-center py-4">Nenhum compromisso pendente ou ensaio programado.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {tab === 6 && (
                    <ModuleMidiaTab 
                        subTabMedia={subTabMedia} setSubTabMedia={setSubTabMedia}
                        mediaEquipe={mediaEquipe} loadingMediaEquipe={loadingMediaEquipe}
                        mediaEventos={mediaEventos} loadingMediaEventos={loadingMediaEventos}
                        mediaBiblioteca={mediaBiblioteca} loadingMediaBiblioteca={loadingMediaBiblioteca}
                        mediaEquipamentos={mediaEquipamentos} loadingMediaEquipamentos={loadingMediaEquipamentos}
                    />
                )}
                
            </div>
        </div>
    );
};


export default ModuleMinisterios;
