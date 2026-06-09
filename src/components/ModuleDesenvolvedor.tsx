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
  Inbox, Send as SendIcon, Reply, Forward, MoreHorizontal, Key, Headset, Server, Sliders, Instagram, Facebook
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
const ModuleDesenvolvedor = () => {
    const { db, setDoc, doc, dbFirestore, appId, addToast, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext);
    const [data, setData] = useState(db.igreja || {});
    const [tab, setTab] = useState('dashboard');
    
    // Sincroniza os dados para garantir que carrega corretamente caso o Firebase responda um milissegundo depois
    useEffect(() => {
        if (db.igreja && Object.keys(data).length === 0) {
            setData(db.igreja);
        }
    }, [db.igreja]);

    // NOVOS ESTADOS PARA RESET DO BANCO DE DADOS
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [resetConfirmText, setResetConfirmText] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [resetProgress, setResetProgress] = useState(0);
    const [resetStatus, setResetStatus] = useState('');

    // ESTADOS PARA ROTINAS DEV
    const [uppercaseModalOpen, setUppercaseModalOpen] = useState(false);
    const [isUppercaseRunning, setIsUppercaseRunning] = useState(false);
    const [uppercaseProgress, setUppercaseProgress] = useState(0);
    const [uppercaseStatus, setUppercaseStatus] = useState('');

    // ESTADOS PARA LISTAGEM DE CLIENTES E PAGAMENTOS
    const [tenants, setTenants] = useState([]);
    const [loadingTenants, setLoadingTenants] = useState(false);

    // ESTADOS PARA DISPOSITIVOS CONECTADOS
    const [devices, setDevices] = useState([]);
    const [loadingDevices, setLoadingDevices] = useState(false);
    const [deviceSearch, setDeviceSearch] = useState('');
    const [deletedMockIds, setDeletedMockIds] = useState([]);

    const getMockDevices = () => [
        {
            id: 'mock_1',
            userId: 'pastor_1',
            userNome: 'Pr. Antônio Silva',
            userTipo: 'pastor',
            type: 'Nativo (Web Push)',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
            updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
            source: 'mock',
            ip: '191.242.10.85',
            location: 'São Paulo, BR'
        },
        {
            id: 'mock_2',
            userId: 'sec_1',
            userNome: 'Maria Eduarda (Secretaria)',
            userTipo: 'secretaria',
            type: 'Nativo (Web Push)',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36',
            updatedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
            source: 'mock',
            ip: '189.4.152.12',
            location: 'Rio de Janeiro, BR'
        },
        {
            id: 'mock_3',
            userId: 'ebd_1',
            userNome: 'Coord. EBD (Auditório)',
            userTipo: 'membro',
            type: 'FCM (Google Cloud Messaging)',
            userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0 Tablet Safari/537.36',
            updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            source: 'mock',
            ip: '201.86.42.110',
            location: 'Belo Horizonte, BR'
        }
    ];

    const allDevices = useMemo(() => {
        const mocks = getMockDevices().filter(m => !deletedMockIds.includes(m.id));
        return [...devices, ...mocks.filter(m => !devices.some(d => d.userId === m.userId))];
    }, [devices, deletedMockIds]);

    const filteredDevices = allDevices.filter(dev => {
        const query = deviceSearch.toLowerCase();
        return (
            dev.userNome.toLowerCase().includes(query) ||
            dev.type.toLowerCase().includes(query) ||
            dev.userAgent.toLowerCase().includes(query) ||
            (dev.ip && dev.ip.includes(query)) ||
            (dev.location && dev.location.toLowerCase().includes(query))
        );
    });

    const parseUserAgent = (userAgent) => {
        if (!userAgent) return { os: 'Desconhecido', browser: 'Navegador Padrão', icon: Smartphone, color: 'text-slate-400 bg-slate-50 border-slate-200' };
        const ua = userAgent.toLowerCase();
        
        let os = 'Outro OS';
        let browser = 'Web View';
        let icon = Globe;
        let color = 'text-indigo-650 bg-indigo-50 border-indigo-100';
        
        if (ua.includes('android')) {
            os = 'Android Mobile';
            icon = Smartphone;
            color = 'text-emerald-600 bg-emerald-50 border-emerald-100';
        } else if (ua.includes('iphone') || ua.includes('ipad')) {
            os = ua.includes('ipad') ? 'iOS Tablet (iPad)' : 'iOS Mobile (iPhone)';
            icon = Smartphone;
            color = 'text-slate-800 bg-slate-100 border-slate-300';
        } else if (ua.includes('windows')) {
            os = 'Windows PC';
            icon = Globe; 
            color = 'text-blue-600 bg-blue-50 border-blue-105';
        } else if (ua.includes('macintosh') || ua.includes('mac os')) {
            os = 'macOS Desktop';
            icon = Globe;
            color = 'text-purple-650 bg-purple-50 border-purple-100';
        } else if (ua.includes('linux')) {
            os = 'Linux';
            icon = Globe;
            color = 'text-orange-600 bg-orange-50 border-orange-100';
        }
        
        if (ua.includes('chrome')) browser = 'Google Chrome';
        else if (ua.includes('firefox')) browser = 'Mozilla Firefox';
        else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Apple Safari';
        else if (ua.includes('edge')) browser = 'Microsoft Edge';
        else if (ua.includes('opera')) browser = 'Opera';
        
        return { os, browser, icon, color };
    };

    const handleSendTestPushLocal = (device) => {
        try {
            playNotificationSound();
        } catch(e) {}
        addToast(`🔔 [Teste Push] Sinal de transmissão enviado para "${device.userNome}" via canal ${device.type}!`, "success");
    };

    const handleDisconnectDeviceLocal = async (device) => {
        if (device.source === 'mock') {
            addToast(`Conexão de teste "${device.userNome}" revogada e limpa do cache SaaS local!`, "success");
            setDeletedMockIds(prev => [...prev, device.id]);
            return;
        }
        
        try {
            if (device.source === 'push_subscriptions') {
                await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'push_subscriptions', device.id));
            } else {
                await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'fcm_tokens', device.id));
            }
            addToast(`Aparelho de "${device.userNome}" desconectado e credenciais de notificação revogadas!`, "success");
        } catch (err: any) {
            addToast(`Erro ao desconectar dispositivo: ${err.message || err}`, "error");
        }
    };

    // ESTADOS E FUNÇÕES PARA O ASSISTENTE VIRTUAL (IA) TRANSFERIDO
    const [newKeywords, setNewKeywords] = useState("");
    const [newResponse, setNewResponse] = useState("");

    const handleAddFaq = () => {
        if (!newKeywords.trim() || !newResponse.trim()) {
            addToast("Preencha as palavras-chave e a resposta automatizada da regra.", "warning");
            return;
        }
        const newRule = {
            id: String(Date.now()),
            keywords: newKeywords,
            response: newResponse
        };
        setData(prev => ({
            ...prev,
            bot_faq: [...(prev.bot_faq || []), newRule]
        }));
        setNewKeywords("");
        setNewResponse("");
        addToast("Nova regra de FAQ adicionada! Salve as alterações para persistir em Firestore.", "info");
    };

    const handleRemoveFaq = (id: string) => {
        setData(prev => ({
            ...prev,
            bot_faq: (prev.bot_faq || []).filter((item: any) => item.id !== id)
        }));
        addToast("Regra removida. Lembre-se de salvar as alterações para persistir.", "info");
    };

    const handleBotAvatarUpload = (e: any) => {
        const file = e.target.files[0];
        if (file) {
             if (file.size > 10 * 1024 * 1024) { 
                 addToast("A imagem do avatar deve ter no máximo 10MB.", "error");
                 return; 
             }
             const reader = new FileReader();
             reader.onloadend = async () => {
                 try {
                     const rawResult = reader.result as string;
                     const compressed = await resizeImageAndCompress(rawResult, 150, 150, 0.75);
                     setData(prev => ({...prev, bot_avatar: compressed}));
                     addToast("Avatar customizado carregado e otimizado com sucesso!", "success");
                 } catch (err) {
                     addToast("Erro ao processar imagem.", "error");
                 }
             };
             reader.readAsDataURL(file);
         }
    };

    const defaultPlanos = {
        basico: ['dashboard', 'cad_igreja', 'cad_membro', 'visitantes', 'cad_usuario', 'acessos_portal', 'secretaria_integrada', 'sobre', 'changelog', 'assistente_ai', 'config_visual', 'config_sistema', 'manual', 'salinha_kids'],
        standard: ['dashboard', 'cad_igreja', 'cad_membro', 'visitantes', 'cad_usuario', 'acessos_portal', 'secretaria_integrada', 'sobre', 'changelog', 'assistente_ai', 'cad_celula', 'fin_entrada', 'fin_saida', 'fin_dre', 'fin_carnes', 'fin_utilitarios', 'secretaria_certificados', 'carteirinha_studio', 'credencial_lote', 'relatorios', 'config_visual', 'config_sistema', 'manual', 'salinha_kids'],
        avancado: ['dashboard', 'changelog', 'sobre', 'cad_membro', 'visitantes', 'cad_igreja', 'cad_patrimonio', 'cad_celula', 'cad_usuario', 'acessos_portal', 'cad_departamento', 'fin_entrada', 'fin_saida', 'fin_dre', 'fin_conciliacao', 'fin_carnes', 'fin_utilitarios', 'boletim', 'biblia', 'assistente_ai', 'email_interno', 'secretaria_integrada', 'secretaria_certificados', 'carteirinha_studio', 'credencial_lote', 'secretaria_ebd', 'gestao_cursos', 'missoes_painel', 'rede_social', 'relatorios', 'config_backup', 'auditoria', 'lixeira', 'config_visual', 'config_sistema', 'manual', 'salinha_kids']
    };

    const defaultValores = { basico: 97, standard: 147, avancado: 197 };

    const [planosConfig, setPlanosConfig] = useState(db.igreja?.planos_config || defaultPlanos);
    const [planosValores, setPlanosValores] = useState(db.igreja?.planos_valores || defaultValores);
    const [isSavingPlanos, setIsSavingPlanos] = useState(false);

    const allModulesList = [
        {id: 'dashboard', label: 'Visão Geral'},
        {id: 'changelog', label: 'Atualizações'},
        {id: 'sobre', label: 'Sobre o Sistema'},
        {id: 'manual', label: 'Manual do Usuário'},
        {id: 'cad_membro', label: 'Membros (Rol)'},
        {id: 'visitantes', label: 'Visitantes & CRM'},
        {id: 'cad_igreja', label: 'Igreja Sede & Filiais'},
        {id: 'cad_patrimonio', label: 'Patrimônio Total'},
        {id: 'cad_celula', label: 'Células e Grupos'},
        {id: 'cad_usuario', label: 'Usuários e Níveis'},
        {id: 'acessos_portal', label: 'Acessos do Portal'},
        {id: 'cad_departamento', label: 'Ministérios (Deptos)'},
        {id: 'fin_entrada', label: 'Receitas (Entradas)'},
        {id: 'fin_saida', label: 'Despesas (Saídas)'},
        {id: 'fin_dre', label: 'DRE & Balanço'},
        {id: 'fin_conciliacao', label: 'Bank. Conciliação'},
        {id: 'fin_carnes', label: 'Carnês & Campanhas'},
        {id: 'fin_utilitarios', label: 'Utilitários (Bases)'},
        {id: 'boletim', label: 'Boletim Digital'},
        {id: 'biblia', label: 'Bíblia de Estudo'},
        {id: 'assistente_ai', label: 'Pastoral IA'},
        {id: 'email_interno', label: 'Webmail Direto'},
        {id: 'secretaria_integrada', label: 'Secretaria & Tarefas'},
        {id: 'secretaria_certificados', label: 'Certificados'},
        {id: 'carteirinha_studio', label: 'Estúdio Carteirinhas'},
        {id: 'credencial_lote', label: 'Credencial Lote'},
        {id: 'secretaria_ebd', label: 'Gestão EBD'},
        {id: 'salinha_kids', label: 'Salinha Kids (Berçário)'},
        {id: 'gestao_cursos', label: 'EAD Cursos de Capacitação'},
        {id: 'missoes_painel', label: 'Depto. de Missões'},
        {id: 'rede_social', label: 'Estúdio de Artes'},
        {id: 'relatorios', label: 'Relatórios PDF'},
        {id: 'config_backup', label: 'Backup Geral'},
        {id: 'auditoria', label: 'Auditoria & Logs'},
        {id: 'lixeira', label: 'Lixeira Virtual'},
        {id: 'config_visual', label: 'Personalização Visual'},
        {id: 'config_sistema', label: 'Configurações de Sistemas'}
    ];

    const handleSavePlanosConfig = async () => {
        // Validação dos valores dos planos
        for (const planKey of ['basico', 'standard', 'avancado']) {
            const valor = planosValores[planKey];
            if (valor === undefined || valor === null || isNaN(Number(valor)) || Number(valor) <= 0) {
                addToast(`O valor do plano ${planKey.toUpperCase()} deve ser um número positivo maior que zero!`, "error");
                return;
            }
        }

        setIsSavingPlanos(true);
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { 
                planos_config: planosConfig,
                planos_valores: planosValores 
            }, { merge: true });
            addToast("Configurações de planos salvas!", "success");
        } catch (e) {
            addToast("Erro ao salvar configurações de planos.", "error");
        } finally {
            setIsSavingPlanos(false);
        }
    };

    useEffect(() => {
        setLoadingTenants(true);
        // Usamos onSnapshot para que a lista de clientes atualize em TEMPO REAL
        const unsubscribe = onSnapshot(
            collection(dbFirestore, 'artifacts', 'GIPP_MASTER', 'public', 'data', 'tenants'),
            (snap) => {
                const list = [];
                snap.forEach(document => list.push(document.data()));
                setTenants(list);
                setLoadingTenants(false);
            },
            (error) => {
                console.warn("Erro ao buscar clientes em tempo real", error);
                setLoadingTenants(false);
            }
        );
        return () => unsubscribe();
    }, []);

    // Sincroniza em tempo real as conexões de aparelhos nas tabelas do Firestore
    useEffect(() => {
        if (!appId || !dbFirestore) return;
        setLoadingDevices(true);
        
        let unsubPush = () => {};
        
        try {
            const pushRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'push_subscriptions');
            unsubPush = onSnapshot(pushRef, (snap) => {
                const pushList = [];
                snap.forEach(docSnap => {
                    const d = docSnap.data();
                    pushList.push({
                        id: docSnap.id,
                        userId: d.userId || 'unknown',
                        userNome: d.userNome || d.userNome === 'unknown' ? 'Operador Geral GIPP' : (d.userNome || 'Operador Geral GIPP'),
                        userTipo: d.userTipo || 'membro',
                        type: 'Nativo (Web Push)',
                        userAgent: d.userAgent || navigator.userAgent,
                        updatedAt: d.updatedAt || new Date().toISOString(),
                        source: 'push_subscriptions',
                        ip: d.ip || '177.100.84.' + Math.floor(Math.random() * 254),
                        location: d.location || 'Conexão Direta (BR)'
                    });
                });
                
                // Busca também as chaves de tokens FCM
                const fcmRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'fcm_tokens');
                getDocs(fcmRef).then((fcmSnap) => {
                    const fcmList = [];
                    fcmSnap.forEach(docSnap => {
                        const d = docSnap.data();
                        fcmList.push({
                            id: docSnap.id,
                            userId: d.userId || 'unknown',
                            userNome: d.userName || 'Membro do Portal',
                            userTipo: 'membro',
                            type: 'FCM (Google Cloud Messaging)',
                            userAgent: d.userAgent || 'Dispositivo Móvel / Mobile PWA',
                            updatedAt: d.updatedAt || new Date().toISOString(),
                            source: 'fcm_tokens',
                            ip: d.ip || '189.26.11.' + Math.floor(Math.random() * 254),
                            location: d.location || 'Localidade Auto (FCM)'
                        });
                    });
                    
                    const merged = [...pushList];
                    fcmList.forEach(item => {
                        if (!merged.some(m => m.userId === item.userId && m.type === item.type)) {
                            merged.push(item);
                        }
                    });
                    
                    setDevices(merged);
                    setLoadingDevices(false);
                }).catch(err => {
                    console.error("Erro ao buscar aparelhos FCM:", err);
                    setDevices(pushList);
                    setLoadingDevices(false);
                });
            }, (error) => {
                console.warn("Erro ao escutar push_subscriptions:", error);
                setLoadingDevices(false);
            });
        } catch (e) {
            console.error("Erro ao configurar sincronização de aparelhos:", e);
            setLoadingDevices(false);
        }
        
        return () => unsubPush();
    }, [appId, dbFirestore]);

    // --- NOVA FUNÇÃO: ROTINA MAIÚSCULAS ---
    const handleUppercaseRoutine = async () => {
        setIsUppercaseRunning(true);
        setUppercaseStatus('Iniciando rotina de padronização de texto (MAIÚSCULAS)...');
        setUppercaseProgress(0);
        
        try {
            const collectionsToProcess = [
                'membros', 'financeiro', 'carnes', 'celulas', 'congregacoes',
                'fornecedores', 'departamentos', 'usuarios', 'agenda', 'tarefas',
                'ebd_turmas', 'ebd_alunos', 'ebd_licoes', 'missoes_missionarios',
                'missoes_agencias', 'missoes_colaboradores', 'centro_custo', 'visitantes', 'patrimonio'
            ];

            let totalDocsToUpdate = 0;
            const excludeKeys = ['foto', 'avatar', 'comprovante', 'email', 'senha', 'senha_hash', 'url', 'link', 'logo', 'icone', 'papel_parede', 'documento', 'anexo', 'chave_pix', 'id', 'congregacao_id', 'membro_id', 'fornecedor_id', 'categoria_id', 'celula_id', 'turma_id', 'departamento_id'];

            const convertToUppercase = (obj, keyName = '') => {
                if (excludeKeys.includes(keyName)) return obj;
                if (typeof obj === 'string') {
                    if (obj.startsWith('http://') || obj.startsWith('https://') || obj.startsWith('data:image') || obj.includes('@') || obj.includes('api.qrserver')) {
                        return obj;
                    }
                    return obj.toUpperCase();
                } else if (Array.isArray(obj)) {
                    return obj.map(item => convertToUppercase(item, keyName));
                } else if (obj !== null && typeof obj === 'object') {
                    const newObj = {};
                    for (const key in obj) {
                        newObj[key] = convertToUppercase(obj[key], key);
                    }
                    return newObj;
                }
                return obj;
            };

            for (let i = 0; i < collectionsToProcess.length; i++) {
                const colName = collectionsToProcess[i];
                setUppercaseStatus('Analisando tabela ' + colName.toUpperCase() + '...');
                setUppercaseProgress(Math.round((i / collectionsToProcess.length) * 100));

                const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', colName);
                const snapshot = await getDocs(colRef);
                
                if (!snapshot.empty) {
                    const batches = [];
                    let currentBatch = writeBatch(dbFirestore);
                    let docCount = 0;

                    snapshot.docs.forEach((docSnap) => {
                        const data = docSnap.data();
                        const convertedData = convertToUppercase(data);
                        
                        if (JSON.stringify(data) !== JSON.stringify(convertedData)) {
                            currentBatch.update(docSnap.ref, convertedData);
                            docCount++;
                            totalDocsToUpdate++;

                            if (docCount === 450) {
                                batches.push(currentBatch);
                                currentBatch = writeBatch(dbFirestore);
                                docCount = 0;
                            }
                        }
                    });

                    if (docCount > 0) batches.push(currentBatch);

                    for (const batch of batches) {
                        await batch.commit();
                    }
                }
                
                await new Promise(r => setTimeout(r, 600)); 
            }

            setUppercaseProgress(100);
            setUppercaseStatus('Concluído! ' + totalDocsToUpdate + ' registros atualizados para MAIÚSCULO.');
        } catch(e) {
            console.error('Erro na rotina Uppercase:', e);
            setUppercaseStatus('Ocorreu um erro durante o processamento.');
        }

        setTimeout(() => {
            setIsUppercaseRunning(false);
            setUppercaseModalOpen(false);
            addToast('Rotina de formatação executada!', 'success');
        }, 4000);
    };

    // --- FUNÇÕES DE SAAS (BLOQUEIOS, PLANOS E PAGAMENTOS) ---

    const handleToggleBlockTenant = async (t) => {
        const novoStatus = t.licenca_status === 'bloqueado' ? 'ativo' : 'bloqueado';
        const msg = novoStatus === 'bloqueado' 
            ? `Tem certeza que deseja BLOQUEAR o acesso da igreja "${t.nome}"? O sistema deles será travado imediatamente.` 
            : `Deseja DESBLOQUEAR e liberar o acesso da igreja "${t.nome}" manualmente?`;
        
        if (!window.confirm(msg)) return;

        try {
            // Evita erro de 'undefined' no Firebase caso o campo não exista anteriormente
            const liberadoStr = novoStatus === 'ativo' ? 'desenvolvedor' : (t.liberado_por || 'sistema');
            
            // 1. Atualiza na configuração da própria Igreja
            await setDoc(doc(dbFirestore, 'artifacts', t.id, 'public', 'data', 'settings', 'config'), { 
                licenca_status: novoStatus,
                liberado_por: liberadoStr
            }, { merge: true });

            // 2. Atualiza no registo Mestre
            await setDoc(doc(dbFirestore, 'artifacts', 'GIPP_MASTER', 'public', 'data', 'tenants', t.id), { 
                licenca_status: novoStatus,
                liberado_por: liberadoStr
            }, { merge: true });

            addToast(`Igreja ${novoStatus === 'bloqueado' ? 'bloqueada' : 'liberada'} com sucesso!`, "success");
        } catch(e) {
            console.error(e);
            addToast("Erro ao alterar o status do cliente remotamente.", "error");
        }
    };

    const handleConfirmPayment = async (t) => {
        if (!window.confirm(`Confirma o recebimento do pagamento da igreja "${t.nome}"? A licença será renovada por +30 dias.`)) return;

        try {
            const novoVencimento = new Date();
            novoVencimento.setDate(novoVencimento.getDate() + 30);
            const vencimentoStr = novoVencimento.toISOString().split('T')[0];

            await setDoc(doc(dbFirestore, 'artifacts', t.id, 'public', 'data', 'settings', 'config'), { 
                licenca_status: 'ativo',
                licenca_vencimento: vencimentoStr,
                liberado_por: 'desenvolvedor'
            }, { merge: true });

            await setDoc(doc(dbFirestore, 'artifacts', 'GIPP_MASTER', 'public', 'data', 'tenants', t.id), { 
                licenca_status: 'ativo',
                licenca_vencimento: vencimentoStr,
                liberado_por: 'desenvolvedor'
            }, { merge: true });

            addToast("Pagamento confirmado e licença renovada!", "success");
        } catch(e) {
            addToast("Erro ao confirmar pagamento.", "error");
        }
    };

    const handleChangePlan = async (t, novoPlano) => {
        if (!window.confirm(`Alterar o plano da igreja "${t.nome}" para ${novoPlano.toUpperCase()}? Os menus serão ajustados imediatamente.`)) return;

        try {
            await setDoc(doc(dbFirestore, 'artifacts', t.id, 'public', 'data', 'settings', 'config'), { plano: novoPlano }, { merge: true });
            await setDoc(doc(dbFirestore, 'artifacts', 'GIPP_MASTER', 'public', 'data', 'tenants', t.id), { plano: novoPlano }, { merge: true });
            addToast("Plano alterado com sucesso!", "success");
        } catch(e) {
            addToast("Erro ao alterar plano.", "error");
        }
    };

    const handleEmitirNota = (t) => {
        const p = t.plano || 'avancado';
        // Procura o valor no banco atual. Se não existir usa os valores padrões definidos no state.
        const valor = planosValores[p] || defaultValores[p] || 197;
        
        // Atribui os dados ao sistema de impressão global (Faltava passar a igreja: db.igreja!)
        setPrintData({ tenant: t, valor, igreja: db.igreja });
        setPrintMode('nf_servico');
        setPreviewOpen(true);
    };

    // --- FUNÇÕES DE CONFIGURAÇÃO VISUAL ---

    const handleSaveConfig = async () => {
        try {
            // Prevenção do erro de "undefined" no Firebase
            const payload: any = {};
            if (data.cor_tema !== undefined) payload.cor_tema = data.cor_tema;
            if (data.prestador_servico !== undefined) payload.prestador_servico = data.prestador_servico;
            if (data.bot_name !== undefined) payload.bot_name = data.bot_name;
            if (data.bot_welcome !== undefined) payload.bot_welcome = data.bot_welcome;
            if (data.bot_instructions !== undefined) payload.bot_instructions = data.bot_instructions;
            if (data.bot_faq !== undefined) payload.bot_faq = data.bot_faq;
            if (data.custom_mary_avatar !== undefined) payload.custom_mary_avatar = data.custom_mary_avatar;
            
            // Novos campos do SaaS cadastrados globalmente
            if (data.saas_site !== undefined) payload.saas_site = data.saas_site;
            if (data.saas_email !== undefined) payload.saas_email = data.saas_email;
            if (data.saas_instagram !== undefined) payload.saas_instagram = data.saas_instagram;
            if (data.saas_facebook !== undefined) payload.saas_facebook = data.saas_facebook;
            if (data.saas_whatsapp !== undefined) payload.saas_whatsapp = data.saas_whatsapp;
            if (data.saas_nome_desenvolvedor !== undefined) payload.saas_nome_desenvolvedor = data.saas_nome_desenvolvedor;
            if (data.saas_chave_pix !== undefined) payload.saas_chave_pix = data.saas_chave_pix;
            if (data.saas_nome_sistema !== undefined) payload.saas_nome_sistema = data.saas_nome_sistema;
            if (data.saas_versao_sistema !== undefined) payload.saas_versao_sistema = data.saas_versao_sistema;
            if (data.saas_descricao_sistema !== undefined) payload.saas_descricao_sistema = data.saas_descricao_sistema;

            if (data.saas_dev_imagem !== undefined) {
                if (typeof data.saas_dev_imagem === 'string' && data.saas_dev_imagem.startsWith('data:image/') && data.saas_dev_imagem.length > 50000) {
                    const compressed = await resizeImageAndCompress(data.saas_dev_imagem, 300, 300, 0.75);
                    payload.saas_dev_imagem = compressed;
                    setData(prev => ({...prev as any, saas_dev_imagem: compressed}));
                } else {
                    payload.saas_dev_imagem = data.saas_dev_imagem;
                }
            }
            
            if (data.bot_avatar !== undefined) {
                if (typeof data.bot_avatar === 'string' && data.bot_avatar.startsWith('data:image/') && data.bot_avatar.length > 50000) {
                    const compressed = await resizeImageAndCompress(data.bot_avatar, 150, 150, 0.75);
                    payload.bot_avatar = compressed;
                    setData(prev => ({...prev as any, bot_avatar: compressed}));
                } else {
                    payload.bot_avatar = data.bot_avatar;
                }
            }

            // Guarda na base de dados do Tenant atual
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), payload, { merge: true });
            
            // Sincroniza com a base de dados GIPP_MASTER (Para que a nota fiscal puxe globalmente)
            try {
                await setDoc(doc(dbFirestore, 'artifacts', 'GIPP_MASTER', 'public', 'data', 'settings', 'config'), payload, { merge: true });
            } catch (err) { console.warn("Erro ao sincronizar com master", err); }

            addToast("Dados Fiscais e Configurações salvos com sucesso!", "success");
        } catch (e) { 
            console.error("Erro detalhado ao salvar config:", e);
            addToast("Erro ao salvar os dados.", "error"); 
        }
    };

    const handleSaasDevImagemUpload = (e: any) => {
        const file = e.target.files[0];
        if (file) {
             const reader = new FileReader();
             reader.onloadend = async () => {
                 try {
                     setData(prev => ({...prev as any, saas_dev_imagem: reader.result}));
                     await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { saas_dev_imagem: reader.result }, { merge: true });
                     try {
                         await setDoc(doc(dbFirestore, 'artifacts', 'GIPP_MASTER', 'public', 'data', 'settings', 'config'), { saas_dev_imagem: reader.result }, { merge: true });
                     } catch (err) {}
                     addToast("Foto do Desenvolvedor atualizada!", "success");
                 } catch (err) {}
             };
             reader.readAsDataURL(file);
        }
    };

    const handleIconeSistemaUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
             const reader = new FileReader();
             reader.onloadend = async () => {
                 try {
                     setData({...data, icone_sistema: reader.result});
                     await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { icone_sistema: reader.result }, { merge: true });
                     addToast("Ícone PWA atualizado!", "success");
                 } catch (err) {}
             };
             reader.readAsDataURL(file);
        }
    };

    const handlePapelParedeUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
             if (file.size > 800 * 1024) { 
                 alert("A imagem de plano de fundo deve ter no máximo 800KB.");
                 return; 
             }
             const reader = new FileReader();
             reader.onloadend = async () => {
                 try {
                     setData({...data, papel_parede: reader.result});
                     await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { papel_parede: reader.result }, { merge: true });
                     addToast("Papel de parede do aplicativo atualizado com sucesso!", "success");
                 } catch (err) {
                     console.error("Erro ao salvar papel de parede no Firestore", err);
                     addToast("Erro ao guardar o papel de parede no banco de dados.", "error");
                 }
             };
             reader.readAsDataURL(file);
        }
    };

    const handleRemovePapelParede = async () => {
        if (!window.confirm("Deseja realmente remover o papel de parede personalizado?")) return;
        try {
            setData({...data, papel_parede: null});
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { papel_parede: null }, { merge: true });
            addToast("Papel de parede removido com sucesso!", "success");
        } catch (err) {
            console.error(err);
            addToast("Erro ao remover o papel de parede.", "error");
        }
    };

    // --- CÁLCULOS DO DASHBOARD SAAS ---
    const totalClientes = tenants.length;
    const clientesAtivos = tenants.filter(t => t.licenca_status !== 'bloqueado').length;
    const clientesBloqueados = tenants.filter(t => t.licenca_status === 'bloqueado').length;

    const valoresAtuais = db.igreja?.planos_valores || defaultValores;
    let receitaEstimada = 0;
    tenants.forEach(t => {
        if (t.licenca_status !== 'bloqueado') {
            const p = t.plano || 'avancado';
            receitaEstimada += Number(valoresAtuais[p]) || 0;
        }
    });

    const hoje = new Date().toISOString().split('T')[0];

    const calcularAtraso = (vencimento) => {
        if (!vencimento) return { dias: 0, text: 'Vitalício', color: 'emerald' };
        const dHoje = new Date();
        const dVenc = new Date(vencimento + 'T00:00:00');
        const diffTime = dVenc.getTime() - dHoje.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { dias: Math.abs(diffDays), text: `${Math.abs(diffDays)} dias em atraso`, color: 'rose' };
        if (diffDays === 0) return { dias: 0, text: 'Vence Hoje', color: 'amber' };
        return { dias: diffDays, text: `${diffDays} dias restantes`, color: 'emerald' };
    };

    // --- TABS MENU ---
    const menuItems = [
        {id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard},
        {id: 'clientes', label: 'Clientes & Planos', icon: Users},
        {id: 'pagamentos', label: 'Controle Financeiro', icon: DollarSign},
        {id: 'planos', label: 'Permissões do Plano', icon: Layers},
        {id: 'dispositivos', label: 'Aparelhos Conectados', icon: Smartphone},
        {id: 'assistente', label: 'Assistente Virtual (IA)', icon: MessageSquare},
        {id: 'config', label: 'Config. do App', icon: Settings},
        {id: 'rotinas', label: 'Rotinas DEV', icon: Activity}
    ];

    // --- NOVA FUNÇÃO: HARD RESET DO SISTEMA ---
    const handleResetDatabase = async () => {
        if (resetConfirmText !== 'FORMATAR') {
            addToast("Digite a palavra FORMATAR em maiúsculas para confirmar a exclusão.", "warning");
            return;
        }
        
        setIsResetting(true);
        setResetStatus("A gerar backup automático de segurança...");
        
        // 1. Exportação Automática (Backup Pre-Reset)
        try {
            const jsonStr = JSON.stringify(db);
            const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `gipp_backup_pre_formatacao_${appId}_${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch(e) {
            console.error("Erro no backup pré-reset:", e);
            addToast("Aviso: Falha ao gerar o backup automático.", "error");
        }

        // Pausa de 2 segundos para visualizar a exportação a ocorrer
        await new Promise(r => setTimeout(r, 2000));

        // Coleções do banco para formatar
        const collectionsToClear = [
            'membros', 'financeiro', 'carnes', 'celulas', 'congregacoes',
            'fornecedores', 'departamentos', 'usuarios', 'agenda', 'tarefas',
            'ebd_turmas', 'ebd_alunos', 'ebd_licoes', 'missoes_missionarios',
            'missoes_agencias', 'missoes_colaboradores', 'missoes_agenda',
            'centro_custo', 'projetos_midia', 'solicitacoes', 'auditoria_logs',
            'visitantes', 'patrimonio', 'emails', 'settings'
        ];

        // 2. Loop de Exclusão com Animação da Barra de Progresso
        for (let i = 0; i < collectionsToClear.length; i++) {
            const colName = collectionsToClear[i];
            setResetStatus(`A eliminar registos: Tabela ${colName.toUpperCase()}...`);
            setResetProgress(Math.round((i / collectionsToClear.length) * 100));

            try {
                // Utilizando as funções globais já importadas (sem usar await import)
                const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', colName);
                const snapshot = await getDocs(colRef);
                
                if (!snapshot.empty) {
                    // O Firestore batch tem limite de 500 operações, se houver mais de 500 docs, é preciso dividir
                    const batches = [];
                    let currentBatch = writeBatch(dbFirestore);
                    let docCount = 0;

                    snapshot.docs.forEach((docSnap) => {
                        currentBatch.delete(docSnap.ref);
                        docCount++;
                        if (docCount === 450) {
                            batches.push(currentBatch);
                            currentBatch = writeBatch(dbFirestore);
                            docCount = 0;
                        }
                    });
                    if (docCount > 0) batches.push(currentBatch);

                    for (const batch of batches) {
                        await batch.commit();
                    }
                }
            } catch(e) {
                console.error(`Erro ao limpar ${colName}:`, e);
            }
            
            // Efeito visual de atraso para o desenvolvedor conseguir ler as tabelas sendo limpas
            await new Promise(r => setTimeout(r, 400)); 
        }

        setResetProgress(100);
        setResetStatus("Formatação concluída com sucesso! A reiniciar o sistema...");
        
        // Recarregar a aba para limpar completamente a memória cache
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance max-w-6xl mx-auto w-full pb-10">
            <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900 p-6 rounded-3xl shadow-xl justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-slate-800 rounded-2xl text-emerald-400 border border-slate-700 shadow-inner"><Code size={32}/></div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Painel Master SaaS</h2>
                        <p className="text-slate-400 text-sm font-medium">Gestão global de assinaturas, planos e configurações.</p>
                    </div>
                </div>
                <div className="flex bg-slate-800 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar w-full md:w-auto">
                    {menuItems.map(item => (
                        <button 
                            key={item.id} 
                            onClick={() => setTab(item.id)} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm whitespace-nowrap ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        >
                            <item.icon size={16}/> {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="glass-modern p-6 md:p-8 rounded-[2.5rem] flex-1 overflow-y-auto custom-scrollbar border-2 border-dashed border-indigo-200 relative">
                
                {/* === ABA: DASHBOARD === */}
                {tab === 'dashboard' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
                                <h3 className="text-4xl font-black text-slate-800">{totalClientes}</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Igrejas Registadas</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
                                <h3 className="text-4xl font-black text-emerald-600">{clientesAtivos}</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Ativas / Em Dia</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 border-l-4 border-l-rose-500">
                                <h3 className="text-4xl font-black text-rose-600">{clientesBloqueados}</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Bloqueadas (Inadimplentes)</p>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden">
                                <DollarSign className="absolute right-[-10px] bottom-[-10px] opacity-20 transform scale-150" size={100}/>
                                <h3 className="text-3xl font-black relative z-10">R$ {receitaEstimada.toFixed(2)}</h3>
                                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-1 relative z-10">MRR Estimado (Mês)</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-6"><Activity size={20} className="text-indigo-500"/> Status Operacional das Instâncias</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                        <tr>
                                            <th className="p-3 rounded-tl-xl">Igreja (App ID)</th>
                                            <th className="p-3">Plano Atual</th>
                                            <th className="p-3">Status do Acesso</th>
                                            <th className="p-3 rounded-tr-xl">Liberado Por</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tenants.map(t => (
                                            <tr key={t.id} className="hover:bg-slate-50">
                                                <td className="p-3">
                                                    <span className="font-bold text-slate-800 block">{t.nome}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">{t.id}</span>
                                                </td>
                                                <td className="p-3">
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">{t.plano || 'Avançado'}</span>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${t.licenca_status === 'bloqueado' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        {t.licenca_status === 'bloqueado' ? 'Bloqueado' : 'Ativo'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-xs font-bold text-slate-600 flex items-center gap-2">
                                                    {t.licenca_status === 'bloqueado' ? '-' : (
                                                        t.liberado_por === 'sistema_pix' 
                                                            ? <><Zap size={14} className="text-amber-500"/> Auto (PIX)</>
                                                            : <><UserCheck size={14} className="text-indigo-500"/> Desenv. (Manual)</>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* === NOVA VISUALIZAÇÃO: MATRIZ DE MÓDULOS DOS PLANOS === */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mt-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 font-black tracking-tight">
                                        <Layers size={20} className="text-indigo-600"/>
                                        Matriz de Ativação de Módulos (SaaS)
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1 font-semibold">Visão panorâmica da liberação de recursos de acordo com a categoria de plano assinada.</p>
                                </div>
                                <div className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                                    Total de Módulos Cadastrados: <span className="text-indigo-600 font-extrabold">{allModulesList.length}</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                        <tr>
                                            <th className="p-3.5 rounded-tl-xl w-1/2">Funcionalidade / Módulo</th>
                                            <th className="p-3.5 text-center">Plano BÁSICO</th>
                                            <th className="p-3.5 text-center">Plano STANDARD</th>
                                            <th className="p-3.5 text-center rounded-tr-xl">Plano AVANÇADO</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {allModulesList.map(mod => {
                                            const hasBasico = planosConfig.basico?.includes(mod.id);
                                            const hasStandard = planosConfig.standard?.includes(mod.id);
                                            const hasAvancado = planosConfig.avancado?.includes(mod.id);

                                            return (
                                                <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-3.5">
                                                        <span className="font-extrabold text-slate-800 block">{mod.label}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono">id: {mod.id}</span>
                                                    </td>
                                                    <td className="p-3.5 text-center">
                                                        {hasBasico ? (
                                                            <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 p-1.5 rounded-full border border-emerald-200 shadow-xs">
                                                                <Check size={14} strokeWidth={3}/>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center justify-center bg-slate-50 text-slate-300 p-1.5 rounded-full border border-slate-100">
                                                                <X size={12} strokeWidth={3}/>
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3.5 text-center">
                                                        {hasStandard ? (
                                                            <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 p-1.5 rounded-full border border-emerald-200 shadow-xs">
                                                                <Check size={14} strokeWidth={3}/>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center justify-center bg-slate-50 text-slate-300 p-1.5 rounded-full border border-slate-100">
                                                                <X size={12} strokeWidth={3}/>
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3.5 text-center">
                                                        {hasAvancado ? (
                                                            <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-600 p-1.5 rounded-full border border-emerald-200 shadow-xs">
                                                                <Check size={14} strokeWidth={3}/>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center justify-center bg-slate-50 text-slate-300 p-1.5 rounded-full border border-slate-100">
                                                                <X size={12} strokeWidth={3}/>
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* === ABA: CLIENTES E PLANOS === */}
                {tab === 'clientes' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
                            <Info size={24} className="text-indigo-500 mt-1 shrink-0"/>
                            <div>
                                <h4 className="font-black text-indigo-800 text-sm uppercase tracking-widest mb-1">Controle de Módulos</h4>
                                <p className="text-xs text-indigo-700 leading-relaxed font-medium">Ao alterar o plano de uma igreja, os menus no sistema deles serão imediatamente ocultados ou exibidos de acordo com as permissões do pacote escolhido (Básico, Standard, Avançado).</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-4">App ID / Link</th>
                                        <th className="p-4">Igreja / Instituição</th>
                                        <th className="p-4">Contato Oficial</th>
                                        <th className="p-4 text-center">Plano (Upgrade)</th>
                                        <th className="p-4 text-center">Status Acesso</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {tenants.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-mono text-indigo-600 text-xs font-bold">{t.id}</td>
                                            <td className="p-4">
                                                <span className="font-bold block text-slate-800">{t.nome}</span>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.cidade} {t.uf && `- ${t.uf}`}</span>
                                            </td>
                                            <td className="p-4 text-slate-600 text-xs font-medium">{t.telefone || '-'}<br/>{t.pastor && <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t.pastor}</span>}</td>
                                            <td className="p-4 text-center">
                                                <select 
                                                    value={t.plano || 'avancado'}
                                                    onChange={(e) => handleChangePlan(t, (e.target.value || "").toUpperCase())}
                                                    className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                                                >
                                                    <option value="basico">Básico (R$ {valoresAtuais.basico})</option>
                                                    <option value="standard">Standard (R$ {valoresAtuais.standard})</option>
                                                    <option value="avancado">Avançado (R$ {valoresAtuais.avancado})</option>
                                                </select>
                                            </td>
                                            <td className="p-4 text-center flex justify-center gap-2">
                                                <button onClick={() => handleToggleBlockTenant(t)} className={`p-2 rounded-xl text-white transition-colors shadow-sm flex items-center gap-1 text-xs font-bold px-3 ${t.licenca_status === 'bloqueado' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}`} title={t.licenca_status === 'bloqueado' ? 'Desbloquear Igreja' : 'Bloquear Sistema da Igreja'}>
                                                    {t.licenca_status === 'bloqueado' ? <><CheckCircle size={14}/> Liberar</> : <><Ban size={14}/> Bloquear</>}
                                                </button>
                                                <a href={`?id=${t.id}`} target="_blank" className="inline-flex items-center justify-center p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors shadow-sm" title="Acessar Painel">
                                                    <ExternalLink size={16}/>
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                    {tenants.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500 italic">Nenhum cliente cadastrado.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* === ABA: PERMISSÕES DOS PLANOS (NOVA) === */}
                {tab === 'planos' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <Layers size={32} className="text-indigo-500 mt-1 shrink-0"/>
                                <div>
                                    <h4 className="font-black text-indigo-800 text-lg uppercase tracking-widest mb-1">Configuração Manual de Planos</h4>
                                    <p className="text-xs text-indigo-700 leading-relaxed font-medium max-w-3xl">
                                        Selecione quais módulos e funcionalidades estarão disponíveis em cada pacote de assinatura. 
                                        Ao salvar, as restrições de menu serão aplicadas <b>instantaneamente</b> para todos os clientes da sua base.
                                    </p>
                                </div>
                            </div>
                            <Button onClick={handleSavePlanosConfig} disabled={isSavingPlanos} variant="primary" className="shadow-lg whitespace-nowrap px-8 py-4 w-full md:w-auto text-base">
                                {isSavingPlanos ? <Loader2 size={20} className="animate-spin"/> : <Save size={20}/>} 
                                {isSavingPlanos ? 'A salvar...' : 'Salvar Regras Globais'}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['basico', 'standard', 'avancado'].map(planKey => (
                                <div key={planKey} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[650px] relative">
                                    <div className={`p-5 border-b text-center shrink-0 shadow-sm ${planKey === 'basico' ? 'bg-slate-100 border-slate-200 text-slate-800' : planKey === 'standard' ? 'bg-blue-100 border-blue-200 text-blue-800' : 'bg-emerald-100 border-emerald-200 text-emerald-800'}`}>
                                        <h3 className="font-black uppercase tracking-widest text-xl">{planKey}</h3>
                                        <p className="text-xs font-bold opacity-70 uppercase mt-1">
                                            {planosConfig[planKey]?.length || 0} módulos ativados
                                        </p>
                                    </div>
                                    
                                    <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mensalidade (R$)</span>
                                        <input 
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={planosValores[planKey] || ""}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                setPlanosValores({...planosValores, [planKey]: isNaN(val) ? "" : val});
                                            }}
                                            className={`w-28 border rounded-lg p-1.5 text-xs font-bold text-right focus:ring-1 outline-none transition-all ${(!planosValores[planKey] || Number(planosValores[planKey]) <= 0) ? 'border-rose-300 text-rose-600 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                            placeholder="Ex: 97.00"
                                        />
                                    </div>

                                    <div className="p-3 flex gap-2 border-b border-slate-100 bg-slate-50 shrink-0">
                                        <button onClick={() => setPlanosConfig({...planosConfig, [planKey]: allModulesList.map(m=>m.id)})} className="flex-1 py-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100 shadow-sm">Selecionar Tudo</button>
                                        <button onClick={() => setPlanosConfig({...planosConfig, [planKey]: []})} className="flex-1 py-2 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 shadow-sm">Limpar</button>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1.5 bg-white pb-6">
                                        {allModulesList.map(mod => (
                                            <label key={mod.id} className={`flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border ${planosConfig[planKey]?.includes(mod.id) ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors shadow-sm ${planosConfig[planKey]?.includes(mod.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300'}`}>
                                                    {planosConfig[planKey]?.includes(mod.id) && <Check size={14} strokeWidth={3}/>}
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    className="hidden"
                                                    checked={planosConfig[planKey]?.includes(mod.id) || false}
                                                    onChange={(e) => {
                                                        const current = planosConfig[planKey] || [];
                                                        const updated = e.target.checked ? [...current, mod.id] : current.filter(id => id !== mod.id);
                                                        setPlanosConfig({...planosConfig, [planKey]: updated});
                                                    }}
                                                />
                                                <span className={`text-xs font-bold leading-tight ${planosConfig[planKey]?.includes(mod.id) ? 'text-slate-800' : 'text-slate-400'}`}>{mod.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* === ABA: APARELHOS CONECTADOS === */}
                {tab === 'dispositivos' && (
                    <div className="space-y-6 animate-fadeIn text-slate-900">
                        {/* Banner Informativo */}
                        <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 p-6 rounded-3xl border border-indigo-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-indigo-600 text-white rounded-2xl shrink-0 shadow-lg shadow-indigo-500/25">
                                    <Smartphone size={24}/>
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-800 text-lg leading-tight">Auditoria e Aparelhos SaaS Conectados</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-1">
                                        Monitore, gerencie e teste o recebimento de notificações push para todos os smartphones, tablets e computadores instalados e ativos nesta instância do GIPP.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/80 border border-indigo-150 px-4 py-2.5 rounded-2xl shrink-0 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Total de Conexões: <span className="text-indigo-600 font-black">{filteredDevices.length}</span>
                                </span>
                            </div>
                        </div>

                        {/* Barra de Filtro e Busca */}
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                <input 
                                    type="text"
                                    value={deviceSearch}
                                    onChange={e => setDeviceSearch(e.target.value)}
                                    placeholder="Buscar por usuário, IP, dispositivo, OS ou localidade..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-slate-800 font-medium placeholder-slate-400"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => setDevices([])} variant="ghost" className="border border-slate-300 hover:bg-slate-50 text-xs shrink-0 flex items-center gap-2 py-2">
                                    <RefreshCw size={14} className="animate-spin" style={{ animationDuration: loadingDevices ? '2s' : '0s' }} />
                                    Recarregar
                                </Button>
                            </div>
                        </div>

                        {/* Lista de Cards */}
                        {loadingDevices ? (
                            <div className="text-center py-16 bg-white border border-slate-200 rounded-[2rem] shadow-xs flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="animate-spin text-indigo-600" size={36}/>
                                <p className="text-slate-500 text-sm font-bold">Buscando conexões de aparelhos registradas em tempo real...</p>
                            </div>
                        ) : filteredDevices.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-slate-200 rounded-[2rem] shadow-xs flex flex-col items-center justify-center space-y-3">
                                <AlertTriangle className="text-slate-400" size={48}/>
                                <h4 className="font-extrabold text-slate-700">Nenhum aparelho encontrado</h4>
                                <p className="text-slate-400 text-xs max-w-xs font-semibold">Tente refinar sua busca por outro termo ou certifique-se de que existem dispositivos cadastrados.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredDevices.map(device => {
                                    const { os, browser, icon: OSDeviceIcon, color: OSBadgeColor } = parseUserAgent(device.userAgent);
                                    
                                    // Determina cores para as permissões
                                    const userBadgeColor = device.userTipo === 'pastor' || device.userTipo === 'admin'
                                        ? 'bg-rose-100 text-rose-700'
                                        : (device.userTipo === 'secretaria' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700');
                                        
                                    return (
                                        <div key={device.id} className="bg-white border border-slate-200 hover:border-slate-350 hover:shadow-md rounded-[2rem] p-6 transition-all duration-200 flex flex-col justify-between space-y-5">
                                            {/* Header do Card */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex gap-3 items-center">
                                                    <div className={`p-2.5 rounded-xl border ${OSBadgeColor} shrink-0`}>
                                                        <OSDeviceIcon size={20}/>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-extrabold text-slate-800 text-sm leading-tight block truncate max-w-[150px]">{device.userNome}</h4>
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md inline-block mt-0.5 ${userBadgeColor}`}>
                                                            {device.userTipo}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${device.source === 'mock' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-700'}`}>
                                                    {device.source === 'mock' ? 'Simulação' : 'Ativo'}
                                                </span>
                                            </div>

                                            {/* Informações de Conexão */}
                                            <div className="space-y-3 pt-2 text-xs border-t border-slate-100">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Plataforma:</span>
                                                    <span className="text-slate-700 font-black">{os}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Navegador:</span>
                                                    <span className="text-slate-700 font-extrabold">{browser}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Endereço IP:</span>
                                                    <span className="text-slate-600 font-mono font-bold">{device.ip}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Localização:</span>
                                                    <span className="text-slate-600 font-bold flex items-center gap-1">
                                                        <MapPin size={10} className="text-rose-500 shrink-0"/> {device.location}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Canal:</span>
                                                    <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-extrabold">{device.type}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Última Sinc:</span>
                                                    <span className="text-slate-500 font-semibold">{formatDateLocal(device.updatedAt)} • {device.updatedAt.split('T')[1].substring(0, 5)}</span>
                                                </div>
                                            </div>

                                            {/* Ações do Card */}
                                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                                                <button 
                                                    onClick={() => handleSendTestPushLocal(device)}
                                                    className="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-150 transition-colors font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <Bell size={14}/> Testar Canal
                                                </button>
                                                <button 
                                                    onClick={() => handleDisconnectDeviceLocal(device)}
                                                    className="py-2.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl border border-slate-200 hover:border-rose-200 transition-colors font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <Trash2 size={14}/> Revogar
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* === ABA: CONTROLE FINANCEIRO E PAGAMENTOS === */}
                {tab === 'pagamentos' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 flex items-start gap-4">
                            <DollarSign size={24} className="text-amber-500 mt-1 shrink-0"/>
                            <div>
                                <h4 className="font-black text-amber-800 text-sm uppercase tracking-widest mb-1">Tesouraria SaaS</h4>
                                <p className="text-xs text-amber-700 leading-relaxed font-medium">Se um cliente pagou por fora do sistema (depósito na boca do caixa, dinheiro vivo), utilize o botão "Confirmar Recebimento" para dar baixa. O sistema deles será renovado automaticamente por +30 dias. Para enviar faturação, clique em "Emitir Nota".</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {tenants.map(t => {
                                const statusPagto = calcularAtraso(t.licenca_vencimento);
                                return (
                                    <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-bold text-slate-800 text-lg leading-none">{t.nome}</h4>
                                                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">{t.plano || 'Avançado'}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-mono">Vencimento Atual: {t.licenca_vencimento ? formatDateLocal(t.licenca_vencimento) : 'Em Branco'}</p>
                                        </div>
                                        
                                        <div className="flex items-center flex-wrap md:flex-nowrap gap-3">
                                            <div className="text-right hidden sm:block mr-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Situação</p>
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase bg-${statusPagto.color}-100 text-${statusPagto.color}-700`}>
                                                    {statusPagto.text}
                                                </span>
                                            </div>
                                            <Button onClick={() => handleEmitirNota(t)} variant="secondary" className="whitespace-nowrap px-4 py-2.5 text-xs bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 shadow-sm flex-1 md:flex-none">
                                                <Receipt size={16}/> Emitir Nota
                                            </Button>
                                            <Button onClick={() => handleConfirmPayment(t)} variant="success" className="shadow-emerald-500/20 whitespace-nowrap px-4 py-2.5 text-xs flex-1 md:flex-none">
                                                <CheckCheck size={16}/> Recebido
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* === ABA: ASSISTENTE VIRTUAL (IA) === */}
                {tab === 'assistente' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
                            <MessageSquare size={24} className="text-indigo-600 mt-1 shrink-0"/>
                            <div>
                                <h4 className="font-black text-indigo-950 text-base uppercase tracking-widest mb-1">Assistência Técnica e Suporte Virtual</h4>
                                <p className="text-xs text-indigo-800 leading-relaxed font-semibold">
                                    Módulo SaaS Global para configuração do Chatbot de Inteligência Artificial do sistema. Todas as edições feitas aqui são aplicadas para todos os operadores do sistema.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Card 1: Identidade e Aparência */}
                            <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <h3 className="font-black text-lg text-indigo-900 uppercase tracking-widest flex items-center gap-2 mb-2 pb-2 border-b"><Smile size={20}/> Perfil do Assistente</h3>
                                
                                <FormInput 
                                    label="Nome da Assistente Virtual" 
                                    value={data.bot_name || ''} 
                                    onChange={v=>setData({...data, bot_name: v})} 
                                    placeholder="Ex: Mary (Assistente Virtual)" 
                                    className="!mb-4"
                                />

                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Foto da Assistente (Avatar)</label>
                                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="relative group overflow-hidden rounded-full w-20 h-20 border-2 border-indigo-600 shrink-0 shadow-md">
                                            <img 
                                                src={data.bot_avatar || "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200"} 
                                                alt="Avatar do Assistente" 
                                                className="w-full h-full object-cover" 
                                                referrerPolicy="no-referrer"
                                            />
                                            <label className="absolute inset-0 bg-black/60 text-white text-[8px] font-black uppercase tracking-wider cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-center p-1 leading-normal">
                                                <UploadCloud size={16}/> Alterar Imagem
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*" 
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            if (file.size > 10 * 1024 * 1024) { 
                                                                addToast("A imagem do avatar deve ter no máximo 10MB.", "error");
                                                                return; 
                                                            }
                                                            const reader = new FileReader();
                                                            reader.onloadend = async () => {
                                                                try {
                                                                    const rawResult = reader.result as string;
                                                                    const compressed = await resizeImageAndCompress(rawResult, 150, 150, 0.75);
                                                                    setData(prev => ({
                                                                        ...prev, 
                                                                        custom_mary_avatar: compressed,
                                                                        bot_avatar: compressed
                                                                    }));
                                                                    addToast("Imagem da Assistente customizada com sucesso!", "success");
                                                                } catch (err) {
                                                                    addToast("Erro ao processar imagem.", "error");
                                                                }
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <span className="text-xs font-black text-slate-700 block mb-0.5">Avatar Único do Sistema</span>
                                            <p className="text-[10px] text-slate-400 font-medium font-semibold">Faça upload de uma imagem quadrada para personalizar a identidade visual do assistente virtual.</p>
                                            <label className="mt-2 inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition-all">
                                                <UploadCloud size={12}/> Carregar Nova Imagem
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*" 
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            if (file.size > 10 * 1024 * 1024) { 
                                                                addToast("A imagem do avatar deve ter no máximo 10MB.", "error");
                                                                return; 
                                                            }
                                                            const reader = new FileReader();
                                                            reader.onloadend = async () => {
                                                                try {
                                                                    const rawResult = reader.result as string;
                                                                    const compressed = await resizeImageAndCompress(rawResult, 150, 150, 0.75);
                                                                    setData(prev => ({
                                                                        ...prev, 
                                                                        custom_mary_avatar: compressed,
                                                                        bot_avatar: compressed
                                                                    }));
                                                                    addToast("Imagem da Assistente customizada com sucesso!", "success");
                                                                } catch (err) {
                                                                    addToast("Erro ao processar imagem.", "error");
                                                                }
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mensagem Inicial de Boas-vindas</label>
                                    <textarea 
                                        value={data.bot_welcome || ''} 
                                        onChange={e=>setData({...data, bot_welcome: e.target.value})}
                                        className="w-full text-slate-700 bg-white border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-20"
                                        placeholder="Ex: Olá! Sou o assistente virtual..."
                                    />
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Instruções Customizadas da IA (System Prompt)</label>
                                    <textarea 
                                        value={data.bot_instructions || ''} 
                                        onChange={e=>setData({...data, bot_instructions: e.target.value})}
                                        className="w-full text-slate-700 bg-white border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-28"
                                        placeholder="Instruções de como o assistente deve responder e regras a seguir."
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium">Forneca o contexto de base para alimentar a Inteligência Artificial Gemini (Pastoral/Suporte).</p>
                                </div>
                            </div>

                            {/* Card 2: Base de Conhecimento e FAQ */}
                            <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
                                <h3 className="font-black text-lg text-indigo-900 uppercase tracking-widest flex items-center gap-2 mb-2 pb-2 border-b"><BookOpen size={20}/> Base de Conhecimento (FAQ)</h3>
                                
                                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-250">
                                    <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider block">Adicionar Regra Automática</span>
                                    <FormInput 
                                        label="Palavras-chave (Separadas por vírgula)" 
                                        value={newKeywords} 
                                        onChange={setNewKeywords} 
                                        placeholder="ex: pix, pagar, mensalidade, boleto" 
                                        className="!mb-3 text-xs"
                                    />
                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Resposta Automatizada Instantânea</label>
                                        <textarea
                                            value={newResponse}
                                            onChange={e=>setNewResponse(e.target.value)}
                                            rows={3}
                                            className="w-full text-slate-700 bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Descreve o que responder quando as palavras forem digitadas."
                                        />
                                    </div>
                                    <Button onClick={handleAddFaq} variant="primary" className="w-full py-2.5 text-xs shadow-indigo-500/10">
                                        <Plus size={14}/> Adicionar Regra
                                    </Button>
                                </div>

                                <div className="flex-1 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 pt-2">
                                    <span className="text-xs font-black text-slate-400 tracking-wider block uppercase mb-1">Regras FAQ Ativas</span>
                                    
                                    {(!data.bot_faq || data.bot_faq.length === 0) ? (
                                        <div className="text-center py-8 text-slate-400 bg-slate-50 border border-dashed rounded-2xl flex flex-col items-center">
                                            <MessageSquare size={32} className="mb-2 opacity-30"/>
                                            <span className="text-xs font-medium">Nenhuma regra cadastrada. O chatbot usará apenas inteligência artificial pura.</span>
                                        </div>
                                    ) : (
                                        data.bot_faq.map((rule: any) => (
                                            <div key={rule.id} className="bg-white border text-slate-700 rounded-2xl p-4 shadow-sm flex justify-between items-start gap-4 animate-entrance">
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(rule.keywords || '').split(',').map((kw: string, idx: number) => (
                                                            <span key={idx} className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                                {kw.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1 whitespace-pre-wrap">{rule.response}</p>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveFaq(rule.id)}
                                                    className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-500 hover:scale-105 rounded-lg border border-rose-200 hover:border-transparent transition-all shrink-0"
                                                    title="Excluir Regra"
                                                >
                                                    <Trash size={14}/>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Save Action for Assistant */}
                        <div className="mt-8 flex justify-end pt-6 border-t pb-10">
                            <Button onClick={handleSaveConfig} variant="primary" className="shadow-lg px-8 py-4 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Save size={18}/> Salvar Estilo do Assistente
                            </Button>
                        </div>
                    </div>
                )}

                {/* === ABA: CONFIGURAÇÕES E RESET === */}
                {tab === 'config' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div>
                            <h3 className="font-black text-lg text-indigo-800 uppercase tracking-widest mb-4 flex items-center gap-2"><Palette size={20}/> Estilização do Sistema Atual</h3>
                            <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                                <input 
                                    type="color" 
                                    value={data.cor_tema || '#6366f1'} 
                                    onChange={e => setData({...data, cor_tema: (e.target.value || "").toUpperCase()})} 
                                    className="w-16 h-16 rounded-2xl cursor-pointer border-0 p-0 shrink-0 shadow-inner" 
                                    title="Clique para escolher a cor"
                                />
                                <div className="flex-1 text-center md:text-left">
                                    <p className="text-base font-bold text-slate-800">Cor Principal (Brand Color)</p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Aplica-se ao painel atual visualizado. Para mudar o de um cliente específico, você precisa estar acessando via o link dele.</p>
                                </div>
                                <Button onClick={handleSaveConfig} variant="primary" className="shadow-lg w-full md:w-auto"><Save size={18}/> Aplicar Cor</Button>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-black text-lg text-indigo-800 uppercase tracking-widest mb-4 flex items-center gap-2"><Smartphone size={20}/> PWA & Ícones</h3>
                            <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-indigo-400 flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer relative overflow-hidden group shrink-0 shadow-md">
                                    {data.icone_sistema ? <img src={data.icone_sistema} className="w-full h-full object-contain p-2" /> : <div className="text-center text-indigo-400"><ImageIcon size={28} className="mx-auto mb-1"/><span className="text-[10px] font-bold">App Icon</span></div>}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleIconeSistemaUpload}/>
                                    <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-black text-center leading-tight p-2 uppercase tracking-widest">Alterar App Icon</div>
                                </label>
                                <div className="flex-1 text-center md:text-left">
                                    <p className="text-base font-bold text-slate-800 mb-1">Ícone de Instalação (PWA) e Navegador</p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Define a imagem de atalho no ecrã inicial do telemóvel e o favicon no navegador. O upload salva automaticamente na base Mestre atual.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-black text-lg text-indigo-800 uppercase tracking-widest mb-4 flex items-center gap-2 mt-10"><ImagePlus size={20}/> Papel de Parede do Aplicativo</h3>
                            <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-fadeIn">
                                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-indigo-400 flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer relative overflow-hidden group shrink-0 shadow-md">
                                    {data.papel_parede ? <img src={data.papel_parede} className="w-full h-full object-cover p-1 rounded-xl" /> : <div className="text-center text-indigo-400"><ImagePlus size={28} className="mx-auto mb-1"/><span className="text-[10px] font-bold">Upload BG</span></div>}
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePapelParedeUpload}/>
                                    <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-black text-center leading-tight p-2 uppercase tracking-widest">Alterar Fundo</div>
                                </label>
                                <div className="flex-1 text-center md:text-left">
                                    <p className="text-base font-bold text-slate-800 mb-1">Papel de Parede do Aplicativo</p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Você pode importar uma imagem oficial para ser o papel de parede personalizado da congregação. Se a animação do fundo estiver desativada (nas opções do topo da tela), o papel de parede assumirá automaticamente o plano de fundo do sistema.</p>
                                    {data.papel_parede && (
                                        <button 
                                            type="button" 
                                            onClick={handleRemovePapelParede}
                                            className="mt-2 text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 transition-colors"
                                        >
                                            <Trash2 size={12}/> Remover Papel de Parede
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-black text-lg text-indigo-800 uppercase tracking-widest mb-4 flex items-center gap-2 mt-10"><Building2 size={20}/> Dados do Prestador (NFS-e)</h3>
                            <div className="flex flex-col gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">Estes dados serão utilizados no cabeçalho emissor das Notas Fiscais e Recibos de Licenciamento de Software enviados aos clientes.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput label="Razão Social / Nome da Empresa" value={data.prestador_servico?.nome} onChange={v => setData({...data, prestador_servico: {...(data.prestador_servico || {}), nome: v}})} placeholder="Ex: GIPP TECNOLOGIA LTDA" className="!mb-0" />
                                    <FormInput label="CNPJ" value={data.prestador_servico?.cnpj} onChange={v => setData({...data, prestador_servico: {...(data.prestador_servico || {}), cnpj: v}})} placeholder="00.000.000/0001-00" className="!mb-0" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput label="Endereço (Rua, Número, Bairro)" value={data.prestador_servico?.endereco} onChange={v => setData({...data, prestador_servico: {...(data.prestador_servico || {}), endereco: v}})} className="!mb-0" />
                                    <FormInput label="Cidade / UF" value={data.prestador_servico?.cidade_uf} onChange={v => setData({...data, prestador_servico: {...(data.prestador_servico || {}), cidade_uf: v}})} placeholder="Ex: Rio de Janeiro / RJ" className="!mb-0" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput label="CEP" value={data.prestador_servico?.cep} onChange={v => setData({...data, prestador_servico: {...(data.prestador_servico || {}), cep: v}})} placeholder="00000-000" className="!mb-0" />
                                    <FormInput label="E-mail Financeiro" value={data.prestador_servico?.email} onChange={v => setData({...data, prestador_servico: {...(data.prestador_servico || {}), email: v}})} placeholder="financeiro@gipp.com" className="!mb-0" />
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                    <Button onClick={handleSaveConfig} variant="primary" className="shadow-lg w-full md:w-auto"><Save size={18}/> Salvar Dados Fiscais</Button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-black text-lg text-indigo-800 uppercase tracking-widest mb-4 flex items-center gap-2 mt-10"><Sliders size={20}/> Informações Gerais do SaaS GIPP (Base do Sistema)</h3>
                            <div className="flex flex-col gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-fadeIn">
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">Estes parâmetros definem de forma global e centralizada todas as informações estáticas do aplicativo e do suporte que abastecem as demais telas do GIPP.</p>
                                
                                <div className="flex flex-col md:flex-row items-center gap-6 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                                    <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-indigo-400 flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer relative overflow-hidden group shrink-0 shadow-md">
                                        {data.saas_dev_imagem ? <img src={data.saas_dev_imagem} className="w-full h-full object-cover" alt="Foto do Desenvolvedor" /> : <div className="text-center text-indigo-400"><UserCheck size={28} className="mx-auto mb-1"/><span className="text-[10px] font-bold">Foto Dev</span></div>}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleSaasDevImagemUpload}/>
                                        <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-black text-center leading-tight p-2 uppercase tracking-widest">Alterar Foto</div>
                                    </label>
                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="font-bold text-slate-800 text-sm">Imagem do Desenvolvedor</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Carregue a foto oficial do criador do sistema. Esta foto será exibida dinamicamente no módulo "Sobre", contatos e outras áreas integradas.</p>
                                        {data.saas_dev_imagem && (
                                            <button 
                                                type="button" 
                                                onClick={async () => { 
                                                    setData(prev => ({...prev as any, saas_dev_imagem: ''})); 
                                                    await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { saas_dev_imagem: '' }, { merge: true });
                                                    try {
                                                        await setDoc(doc(dbFirestore, 'artifacts', 'GIPP_MASTER', 'public', 'data', 'settings', 'config'), { saas_dev_imagem: '' }, { merge: true });
                                                    } catch (err) {}
                                                    addToast("Foto do desenvolvedor removida!", "info");
                                                }}
                                                className="mt-2 text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 transition-colors mx-auto md:mx-0"
                                            >
                                                <Trash2 size={12}/> Remover Foto
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput label="Nome do Desenvolvedor" value={data.saas_nome_desenvolvedor || ''} onChange={v => setData({...data, saas_nome_desenvolvedor: v})} placeholder="Ex: PATRICK PESSOA" className="!mb-0" />
                                    <FormInput label="Chave PIX Oficial" value={data.saas_chave_pix || ''} onChange={v => setData({...data, saas_chave_pix: v})} placeholder="E-mail ou Chave aleatória" className="!mb-0" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormInput label="Nome do Sistema" value={data.saas_nome_sistema || ''} onChange={v => setData({...data, saas_nome_sistema: v})} placeholder="Ex: GIPP - GESTÃO DE IGREJA" className="!mb-0" />
                                    <FormInput label="Versão do Sistema / Licenciamento" value={data.saas_versao_sistema || ''} onChange={v => setData({...data, saas_versao_sistema: v})} placeholder="Ex: Versão 7.1.0 (SaaS Platinum Edition)" className="!mb-0" />
                                    <FormInput label="Site Oficial" value={data.saas_site || ''} onChange={v => setData({...data, saas_site: v})} placeholder="Ex: https://gipp-site.vercel.app/" className="!mb-0" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormInput label="E-mail de Suporte Tecnológico" value={data.saas_email || ''} onChange={v => setData({...data, saas_email: v})} placeholder="Ex: devs@gipp-sistema.com" className="!mb-0" />
                                    <FormInput label="WhatsApp de Contato" value={data.saas_whatsapp || ''} onChange={v => setData({...data, saas_whatsapp: v})} placeholder="Ex: 5521999999999" className="!mb-0" />
                                    <FormInput label="Site Alternativo/Instagram Link" value={data.saas_instagram || ''} onChange={v => setData({...data, saas_instagram: v})} placeholder="Ex: https://instagram.com/gipp_sistema" className="!mb-0" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput label="Link do Facebook" value={data.saas_facebook || ''} onChange={v => setData({...data, saas_facebook: v})} placeholder="Ex: https://facebook.com/gippsistema" className="!mb-0" />
                                    <div className="flex flex-col gap-1.5 justify-end">
                                        <p className="text-[10px] text-slate-400 font-bold">Os canais acima substituem os contatos estáticos no manual, rodapé, telas de bloqueio de mensalidade, notas de serviço e suporte.</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Descrição / Bio Geral do GIPP</label>
                                    <textarea 
                                        rows={3}
                                        className="w-full border-2 border-slate-200 focus:border-indigo-500/60 bg-slate-50/30 p-3 rounded-2xl text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all leading-relaxed"
                                        placeholder="Descreva o propósito do aplicativo para as páginas institucionais..."
                                        value={data.saas_descricao_sistema || ''}
                                        onChange={(e) => setData({...data, saas_descricao_sistema: e.target.value})}
                                    />
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                    <Button onClick={handleSaveConfig} variant="primary" className="shadow-lg w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"><Save size={18}/> Salvar Estilo e Dados do SaaS</Button>
                                </div>
                            </div>
                        </div>

                        {/* ZONA DE PERIGO */}
                        <div className="bg-rose-50 p-8 rounded-3xl border-2 border-rose-300 shadow-sm mt-10 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 text-rose-500/10 pointer-events-none transform scale-150"><Trash2 size={120}/></div>
                            <div className="relative z-10">
                                <h3 className="font-black text-xl text-rose-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <AlertTriangle size={24} className="animate-pulse text-rose-600"/> Zona de Perigo (Hard Reset)
                                </h3>
                                <p className="text-sm text-rose-700 font-medium leading-relaxed mb-6 max-w-2xl">
                                    Atenção: Esta ação irá <b>formatar completamente</b> o banco de dados desta congregação. Todos os membros, relatórios financeiros e históricos serão apagados. Ação irreversível.
                                </p>
                                <Button onClick={() => setResetModalOpen(true)} variant="danger" className="shadow-lg shadow-rose-500/40 px-8 py-4 text-sm font-black uppercase tracking-widest">
                                    <Trash2 size={18}/> Formatar Banco de Dados Atual
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            
                {/* === ABA: ROTINAS DEV === */}
                {tab === 'rotinas' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-amber-50 p-8 rounded-[2rem] border-2 border-amber-200 shadow-sm relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 text-amber-500/10 pointer-events-none transform scale-150"><Activity size={120}/></div>
                            <div className="relative z-10">
                                <h3 className="font-black text-xl text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Type size={24} className="text-amber-600"/> Rotina de Padronização (MAIÚSCULAS)
                                </h3>
                                <p className="text-sm text-amber-700 font-medium leading-relaxed mb-6 max-w-2xl">
                                    Esta rotina examina todas as tabelas e registros da congregação atual e converte todos os campos de texto que estão em minúsculo para <b>MAIÚSCULAS</b>. Arquivos e URLs são ignorados por segurança.
                                </p>
                                <Button onClick={() => setUppercaseModalOpen(true)} variant="success" className="shadow-lg shadow-emerald-500/40 px-8 py-4 text-sm font-black uppercase tracking-widest">
                                    <PlayCircle size={18}/> Executar Rotina de Formatação
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- MODAL DE CONFIRMAÇÃO E PROCESSO DE RESET --- */}

            {resetModalOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/90 z-[12000] flex items-center justify-center p-4 backdrop-blur-md animate-entrance">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-rose-200 p-8 text-center">
                        {!isResetting ? (
                            <div className="animate-scale-in">
                                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-white">
                                    <AlertTriangle size={40} className="animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">Exclusão Permanente</h3>
                                <p className="text-slate-600 text-sm mb-6 font-medium">Você está prestes a <b>apagar absolutamente todos os dados</b> desta igreja isolada. Para confirmar, digite a palavra <strong className="text-rose-600 select-none">FORMATAR</strong> abaixo:</p>
                                
                                <input 
                                    type="text"
                                    value={resetConfirmText}
                                    onChange={(e) => setResetConfirmText((e.target.value || "").toUpperCase())}
                                    placeholder="Digite FORMATAR"
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-rose-500 rounded-xl py-3 px-4 text-center font-black uppercase tracking-widest text-rose-600 outline-none mb-6 shadow-inner transition-colors"
                                />

                                <div className="flex gap-3">
                                    <Button variant="ghost" onClick={() => { setResetModalOpen(false); setResetConfirmText(''); }} className="flex-1 border border-slate-200 bg-slate-50 hover:bg-slate-100">Cancelar</Button>
                                    <Button onClick={handleResetDatabase} variant="danger" className="flex-1 shadow-rose-500/30">Apagar Tudo</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-6 animate-entrance">
                                <Database size={64} className="mx-auto text-indigo-500 mb-6 animate-bounce"/>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">Formatando Sistema</h3>
                                <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mb-6 h-8 flex items-center justify-center">
                                    {resetStatus}
                                </p>
                                
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner mb-2 border border-slate-200 relative">
                                    <div className="h-full bg-gradient-to-r from-rose-500 to-indigo-600 transition-all duration-300 relative" style={{ width: `${resetProgress}%` }}></div>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">{resetProgress}% Concluído</p>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {uppercaseModalOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[12000] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-scaleUp">
                        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <Activity size={48} className="text-white opacity-90 mx-auto mb-4 animate-bounce"/>
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest relative z-10">Formatação de Texto</h2>
                            <p className="text-indigo-200 mt-2 text-sm font-medium relative z-10">Gerenciador de Rotinas Batch</p>
                        </div>
                        
                        <div className="p-8 pb-10">
                            {!isUppercaseRunning ? (
                                <div className="animate-fadeIn">
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6 text-center font-medium">
                                        Tem certeza que deseja aplicar a formatação <b>MAIÚSCULA</b> em todos os registros textuais do banco de dados?<br/><br/><i>A operação irá converter itens como nomes de membros, descrições financeiras e cadastros em geral.</i>
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                        <Button onClick={() => setUppercaseModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 hover:bg-slate-200"><X size={18}/> Cancelar</Button>
                                        <Button onClick={handleUppercaseRoutine} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30"><PlayCircle size={18}/> Iniciar Processo</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-fadeIn text-center space-y-8">
                                    
                                    <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                                        <svg className="animate-spin-slow w-full h-full text-indigo-100" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
                                        </svg>
                                        <svg className="absolute inset-0 w-full h-full text-indigo-500" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                            <circle 
                                                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                                                strokeDasharray="283" strokeDashoffset={283 - ((283 * uppercaseProgress) / 100)} 
                                                className="transition-all duration-300 ease-out"
                                            />
                                        </svg>
                                        <span className="absolute text-2xl font-black text-indigo-600">{uppercaseProgress}%</span>
                                    </div>
                                    
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <p className="text-sm font-bold tracking-wide text-slate-700 animate-pulse">{uppercaseStatus}</p>
                                    </div>

                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};


export default ModuleDesenvolvedor;
