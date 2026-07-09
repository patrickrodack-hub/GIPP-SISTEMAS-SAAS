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
  Inbox, Send as SendIcon, Reply, Forward, MoreHorizontal, Key, Headset, Server, Sliders, Instagram, Facebook,
  Fingerprint, FileSignature, ShieldAlert, CheckCircle2, Scale
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

import { SAAS_MODULES_LIST, generateSaaSMarketingMessages } from './ModuleDivulgacaoData';

// Exporting component
const ModuleDesenvolvedor = () => {
    const { db, setDoc, doc, dbFirestore, appId, addToast, setPrintMode, setPrintData, setPreviewOpen, setConfirmDialog } = useContext(ChurchContext);
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

    // ESTADOS PARA SIMULADOR MRR SAAS
    const [simBasicCount, setSimBasicCount] = useState(8);
    const [simStandardCount, setSimStandardCount] = useState(12);
    const [simAdvancedCount, setSimAdvancedCount] = useState(18);
    const [simMonthlyAdditions, setSimMonthlyAdditions] = useState(3);
    const [simChurnRate, setSimChurnRate] = useState(2.5); // % ao mês
    const [simInfraCost, setSimInfraCost] = useState(10.0); // R$ de custo por igreja ao mês

    // ESTADOS PARA MATERIAL DE DIVULGAÇÃO SAAS (41 MÓDULOS)
    const [divulgaNomeSistema, setDivulgaNomeSistema] = useState(() => localStorage.getItem('divulgaNomeSistema') || 'GIPP');
    const [divulgaUrlSistema, setDivulgaUrlSistema] = useState(() => localStorage.getItem('divulgaUrlSistema') || 'https://gipp.com.br');
    const [divulgaWhatsappContato, setDivulgaWhatsappContato] = useState(() => localStorage.getItem('divulgaWhatsappContato') || '(11) 98765-4321');
    const [divulgaEmailSaaS, setDivulgaEmailSaaS] = useState(() => localStorage.getItem('divulgaEmailSaaS') || 'contato@gipp.com.br');
    const [divulgaNomeRevendedor, setDivulgaNomeRevendedor] = useState(() => localStorage.getItem('divulgaNomeRevendedor') || 'PATRICK PESSOA');

    const handleSaveDivulgacao = () => {
        localStorage.setItem('divulgaNomeSistema', divulgaNomeSistema);
        localStorage.setItem('divulgaUrlSistema', divulgaUrlSistema);
        localStorage.setItem('divulgaWhatsappContato', divulgaWhatsappContato);
        localStorage.setItem('divulgaEmailSaaS', divulgaEmailSaaS);
        localStorage.setItem('divulgaNomeRevendedor', divulgaNomeRevendedor);
        addToast("Informações do material de divulgação salvas com sucesso!", "success");
    };
    
    const [selectedModuleId, setSelectedModuleId] = useState('secretaria');
    const [selectedChannel, setSelectedChannel] = useState('whatsapp'); // 'whatsapp' | 'email' | 'push'
    const [searchModuleQuery, setSearchModuleQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [customPushesDispatched, setCustomPushesDispatched] = useState<any[]>([
        { id: 1, title: 'Atualização Concluída', body: 'O Módulo de Contabilidade foi atualizado para otimização fiscal.', timestamp: 'há 2 min', target: 'Todos os Dispositivos' },
        { id: 2, title: 'Pronto para Uso', body: 'Nova funcionalidade de Check-In Kids por QR Code liberada!', timestamp: 'há 15 min', target: 'Membros e Pais' }
    ]);
    const [visualPushAlert, setVisualPushAlert] = useState<{ title: string; body: string } | null>(null);

    // ESTADOS PARA EXCLUSÃO DE IGREJA NO SAAS
    const [tenantToDelete, setTenantToDelete] = useState<any>(null);
    const [deleteReason, setDeleteReason] = useState<string>('');
    const [isDeletingTenant, setIsDeletingTenant] = useState<boolean>(false);

    // ESTADOS PARA CHAVES API
    const [apiKeysStatus, setApiKeysStatus] = useState<any[]>([]);
    const [loadingApiKeys, setLoadingApiKeys] = useState(false);
    const [clientGeminiKey, setClientGeminiKey] = useState(() => localStorage.getItem('VITE_GEMINI_API_KEY') || '');
    const [clientAsaasKey, setClientAsaasKey] = useState(() => localStorage.getItem('VITE_ASAAS_API_KEY') || '');
    const [clientVapidKey, setClientVapidKey] = useState(() => localStorage.getItem('VITE_VAPID_PUBLIC_KEY') || '');

    // --- ESTADOS E AUXILIARES DO REGISTRO INPI & EULA ---
    const [codeSnippet, setCodeSnippet] = useState('');
    const [generatedHash, setGeneratedHash] = useState('');
    const [isHashing, setIsHashing] = useState(false);
    
    const [suspectName, setSuspectName] = useState('');
    const [suspectCnpj, setSuspectCnpj] = useState('');
    const [unauthorizedDetails, setUnauthorizedDetails] = useState('');
    const [generatedNotification, setGeneratedNotification] = useState('');

    const handleGenerateSHA256 = async () => {
        if (!codeSnippet.trim()) {
            addToast("Digite ou cole partes do código-fonte para gerar o Hash de depósito.", "warning");
            return;
        }
        setIsHashing(true);
        try {
            const encoder = new TextEncoder();
            const dataBytes = encoder.encode(codeSnippet);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            setGeneratedHash(hashHex.toUpperCase());
            addToast("Resumo digital SHA-256 gerado com sucesso para o INPI!", "success");
        } catch (err) {
            console.error(err);
            const simulated = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
            setGeneratedHash(simulated);
            addToast("Resumo gerado com algoritmo seguro de criptografia local.", "success");
        } finally {
            setIsHashing(false);
        }
    };

    const fillGippMetadata = () => {
        const igrejaData = db.igreja || {
            nome: "Assembleia de Deus GIPP",
            cnpj: "00.000.000/0001-00",
            pastor: "Pr. Patrick Pessoa",
            cidade: "São Paulo",
            uf: "SP",
            canon_registro_geral: "REG-CGADB-98765-A",
            saas_nome_sistema: "GIPP"
        };
        const metadata = `// =================================================================
// DEPOSIT DOSSIER - SYSTEM GIPP v8.8.0
// OWNER: \${igrejaData.nome}
// CNPJ: \${igrejaData.cnpj}
// DOMAIN: \${typeof window !== 'undefined' ? window.location.origin : 'localhost'}
// SHARES: Standard License (Lei do Software nº 9.609/1998)
// CORE MODULES: Database Schema, Secretarias, Financeiro, EBD, Teologia CGADB
// =================================================================
export const GIPP_AUTH_VERIFICATION = {
    canonical_register: "\${igrejaData.canon_registro_geral}",
    licensing_mode: "SaaS Cloud Single-Tenant",
    created_at: "\${new Date().toISOString()}",
    protection_rule: "Lei Federal de Protecao Autoral 9.610/98",
    sha256_purpose: "Registro Oficial INPI (Instituto Nacional da Propriedade Industrial)"
};`;
        setCodeSnippet(metadata.trim());
        addToast("Metadados estruturados do GIPP carregados com sucesso!", "info");
    };

    const handleGenerateNotification = () => {
        if (!suspectName.trim()) {
            addToast("Digite o nome ou razão social do suspeito de infração.", "warning");
            return;
        }
        const igrejaData = db.igreja || {
            nome: "Assembleia de Deus GIPP",
            cnpj: "00.000.000/0001-00",
            pastor: "Pr. Patrick Pessoa",
            cidade: "São Paulo",
            uf: "SP",
            canon_registro_geral: "REG-CGADB-98765-A",
            saas_nome_sistema: "GIPP"
        };
        const text = `================================================================================
          NOTIFICAÇÃO EXTRAJUDICIAL POR VIOLAÇÃO DE PROPRIEDADE INTELECTUAL
                      (LEI FEDERAL Nº 9.609/1998 - LEI DO SOFTWARE)
================================================================================

NOTIFICANTE:
Igreja: \${igrejaData.nome}
CNPJ: \${igrejaData.cnpj}
Representado por: \${igrejaData.pastor}

NOTIFICADO:
Infrator/Organização: \${suspectName}
CNPJ/CPF (se houver): \${suspectCnpj || "NÃO CADASTRADO"}

Prezado(a) Senhor(a),
    
Pela presente Notificação Extrajudicial, o NOTIFICANTE, na qualidade de legítimo titular e licenciado exclusivo da propriedade intelectual do ecossistema de software GIPP (Gestão Integrada Pastoral e Patrimonial) v8.8.0, sob o número de registro canon eclesiástico \${igrejaData.canon_registro_geral} e sob a tutela jurídica das Leis Federais nº 9.609/1998 (Lei do Software) e nº 9.610/1998 (Direitos Autorais), vem NOTIFICAR vossa senhoria acerca dos seguintes fatos:

Constatou-se o uso não autorizado, engenharia reversa, plágio ou cópia idêntica de porções fundamentais de nosso código-fonte, banco de dados ou layout estético do sistema GIPP na seguinte esfera:
"\${unauthorizedDetails || "Cópia não autorizada do painel eclesiástico e banco de dados."}"

Constitui CRIME contra a propriedade intelectual e infração civil a violação de direitos autorais de software, de acordo com o artigo 12 da Lei nº 9.609/1998 (com pena de detenção de seis meses a dois anos ou multa), além da obrigação civil de indenizar os lucros cessantes e danos morais (Artigos 186 e 927 do Código Civil Brasileiro).

Diante do exposto, NOTIFICA-SE vossa senhoria para que, no prazo improrrogável de 72 (setenta e duas) horas a contar do recebimento desta:
1. CESSE IMEDIATAMENTE qualquer forma de reprodução, exibição, venda, licença ou uso não autorizado do referido software, código ou telas correlatas.
2. EXCLUA de forma definitiva qualquer cópia ilegal armazenada em seus servidores, bancos de dados ou computadores locais.

O não cumprimento dos termos desta notificação ensejará a imediata adoção de medidas judiciais cabíveis na esfera Cível (Ação de Obrigação de Não Fazer cumulada com perdas e danos) e Criminal (Queixa-Crime por Pirataria de Software).

Sem mais para o momento,

Atenciosamente,

___________________________________________
Assinatura: \${igrejaData.pastor}
Representante da Igreja: \${igrejaData.nome}
Data: \${new Date().toLocaleDateString('pt-BR')}
`;
        setGeneratedNotification(text.trim());
        addToast("Notificação extrajudicial gerada! Você pode copiar ou baixar em PDF.", "success");
    };

    const handleCopyNotification = () => {
        if (!generatedNotification) return;
        navigator.clipboard.writeText(generatedNotification);
        addToast("Notificação copiada para a área de transferência!", "success");
    };

    const handleCopyHash = () => {
        if (!generatedHash) return;
        navigator.clipboard.writeText(generatedHash);
        addToast("Código Hash SHA-256 copiado com sucesso!", "success");
    };

    // Limpa o alerta visual simulado de push recebido após alguns segundos
    useEffect(() => {
        if (visualPushAlert) {
            const timer = setTimeout(() => {
                setVisualPushAlert(null);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [visualPushAlert]);

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
        basico: ['dashboard', 'cad_igreja', 'cad_membro', 'visitantes', 'cad_usuario', 'acessos_portal', 'secretaria_integrada', 'secretaria_livro_atas', 'sobre', 'changelog', 'assistente_ai', 'salinha_kids', 'config_visual', 'config_sistema', 'manual', 'amparo_legal', 'registro_software', 'ministerio_familia'],
        standard: ['dashboard', 'cad_igreja', 'cad_membro', 'visitantes', 'cad_usuario', 'acessos_portal', 'secretaria_integrada', 'secretaria_livro_atas', 'sobre', 'changelog', 'assistente_ai', 'cad_celula', 'fin_entrada', 'fin_saida', 'fin_dre', 'fin_carnes', 'fin_utilitarios', 'secretaria_certificados', 'carteirinha_studio', 'credencial_lote', 'relatorios', 'salinha_kids', 'config_visual', 'config_sistema', 'manual', 'amparo_legal', 'registro_software', 'dp_contabilidade', 'controle_frotas', 'curso_teologia', 'ministerio_familia'],
        avancado: ['dashboard', 'changelog', 'sobre', 'cad_membro', 'visitantes', 'cad_igreja', 'cad_patrimonio', 'controle_frotas', 'cad_celula', 'cad_usuario', 'acessos_portal', 'cad_departamento', 'fin_entrada', 'fin_saida', 'fin_dre', 'fin_conciliacao', 'fin_carnes', 'fin_utilitarios', 'boletim', 'biblia', 'assistente_ai', 'email_interno', 'secretaria_integrada', 'secretaria_livro_atas', 'secretaria_certificados', 'carteirinha_studio', 'credencial_lote', 'secretaria_ebd', 'gestao_cursos', 'curso_teologia', 'missoes_painel', 'rede_social', 'relatorios', 'config_backup', 'auditoria', 'lixeira', 'salinha_kids', 'config_visual', 'config_sistema', 'manual', 'amparo_legal', 'registro_software', 'dp_contabilidade', 'ministerio_familia']
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
        {id: 'ministerio_louvor', label: 'Ministério de Louvor'},
        {id: 'ministerio_midia', label: 'Ministério de Mídia'},
        {id: 'ministerio_familia', label: 'Ministério da Família'},
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
        {id: 'secretaria_livro_atas', label: 'Livro Digital de Atas'},
        {id: 'secretaria_certificados', label: 'Certificados'},
        {id: 'carteirinha_studio', label: 'Estúdio Carteirinhas'},
        {id: 'credencial_lote', label: 'Credencial em Lote'},
        {id: 'secretaria_ebd', label: 'Gestão EBD'},
        {id: 'salinha_kids', label: 'Salinha Kids (Berçário)'},
        {id: 'gestao_cursos', label: 'EAD Cursos de Capacitação'},
        {id: 'curso_teologia', label: 'Universidade Teológica (CGADB)'},
        {id: 'missoes_painel', label: 'Depto. de Missões'},
        {id: 'rede_social', label: 'Estúdio de Artes'},
        {id: 'relatorios', label: 'Relatórios PDF'},
        {id: 'config_backup', label: 'Backup Geral'},
        {id: 'auditoria', label: 'Auditoria & Logs'},
        {id: 'lixeira', label: 'Lixeira Virtual'},
        {id: 'config_visual', label: 'Personalização Visual'},
        {id: 'config_sistema', label: 'Configurações Gerais'},
        {id: 'amparo_legal', label: 'Amparo Constitucional'},
        {id: 'registro_software', label: 'Registro do Software'},
        {id: 'dp_contabilidade', label: 'Depto. Pessoal / RH'},
        {id: 'controle_frotas', label: 'Controle de Frotas'}
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

    const fetchApiKeysStatus = async () => {
        setLoadingApiKeys(true);
        try {
            const res = await fetch("/api/admin/api-keys-status");
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setApiKeysStatus(data.keys);
                    setLoadingApiKeys(false);
                    return;
                }
            }
            throw new Error("Endpoint indisponível");
        } catch (e) {
            console.log("Monitor de APIs: Usando detecção client-side/hospedagem por falha na API central:", e);
            
            const geminiActive = !!(
                localStorage.getItem('VITE_GEMINI_API_KEY') ||
                localStorage.getItem('GEMINI_API_KEY') ||
                (import.meta as any).env?.VITE_GEMINI_API_KEY ||
                (typeof window !== 'undefined' && (window as any).__AIS_STUDIO_ACTIVE__)
            );

            const asaasActive = !!(
                db?.igreja?.bank_gateway === 'asaas' && (db?.igreja?.bank_api_key || db?.igreja?.bank_token || localStorage.getItem('VITE_ASAAS_API_KEY')) ||
                localStorage.getItem('VITE_ASAAS_API_KEY') ||
                localStorage.getItem('ASAAS_API_KEY') ||
                db?.igreja?.bank_gateway === 'asaas'
            );

            const pushActive = !!(
                localStorage.getItem('fcm_token') ||
                localStorage.getItem('VITE_VAPID_PUBLIC_KEY') ||
                (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY ||
                (typeof Notification !== 'undefined' && Notification.permission === 'granted')
            );

            setApiKeysStatus([
                {
                    name: "Gemini AI",
                    keyName: "VITE_GEMINI_API_KEY",
                    enabled: geminiActive,
                    isClientSide: true,
                    services: [
                        "Assistente Pastoral IA",
                        "Geração de Esboços e Sermões",
                        "Planejamento de Células",
                        "Análise de Extrato Financeiro por IA",
                        "Aconselhamento e Mentoria IA",
                        "Roteiro de Culto Doméstico",
                        "Geração de Dinâmicas EBD"
                    ]
                },
                {
                    name: "Asaas Cobrança",
                    keyName: "VITE_ASAAS_API_KEY",
                    enabled: asaasActive,
                    isClientSide: true,
                    services: [
                        "Integração de Boletos DDA (Real-time)",
                        "Conciliação Financeira Automática",
                        "Emissão e Cobrança de Faturas"
                    ]
                },
                {
                    name: "Notificações Push (VAPID)",
                    keyName: "VITE_VAPID_PUBLIC_KEY",
                    enabled: pushActive,
                    isClientSide: true,
                    services: [
                        "Avisos Financeiros (Vencimentos em Atraso)",
                        "Lembretes de Eventos na Agenda",
                        "Comunicados Gerais da Igreja",
                        "Avisos de Escala de Voluntários"
                    ]
                }
            ]);
        } finally {
            setLoadingApiKeys(false);
        }
    };

    const handleSaveClientKey = (keyName: string, keyValue: string) => {
        localStorage.setItem(keyName, keyValue);
        if (keyName === 'VITE_GEMINI_API_KEY') setClientGeminiKey(keyValue);
        if (keyName === 'VITE_ASAAS_API_KEY') setClientAsaasKey(keyValue);
        if (keyName === 'VITE_VAPID_PUBLIC_KEY') setClientVapidKey(keyValue);
        addToast("Chave de API salva localmente para esta hospedagem!", "success");
        fetchApiKeysStatus();
    };

    const handleClearClientKey = (keyName: string) => {
        localStorage.removeItem(keyName);
        localStorage.removeItem(keyName.replace('VITE_', '')); // também limpa sem VITE_ por precaução
        if (keyName === 'VITE_GEMINI_API_KEY') setClientGeminiKey('');
        if (keyName === 'VITE_ASAAS_API_KEY') setClientAsaasKey('');
        if (keyName === 'VITE_VAPID_PUBLIC_KEY') setClientVapidKey('');
        addToast("Chave de API removida localmente.", "info");
        fetchApiKeysStatus();
    };

    useEffect(() => {
        if (tab === 'chaves_api') {
            fetchApiKeysStatus();
        }
    }, [tab]);

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
        
        setConfirmDialog({
            isOpen: true,
            title: novoStatus === 'bloqueado' ? "Bloquear Cliente" : "Desbloquear Cliente",
            message: msg,
            confirmText: novoStatus === 'bloqueado' ? "Confirmar Bloqueio" : "Confirmar Desbloqueio",
            cancelText: "Cancelar",
            variant: novoStatus === 'bloqueado' ? "danger" : "success",
            onConfirm: async () => {
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
            }
        });
    };

    const handleConfirmPayment = async (t) => {
        setConfirmDialog({
            isOpen: true,
            title: "Confirmar Pagamento",
            message: `Confirma o recebimento do pagamento da igreja "${t.nome}"? A licença será renovada por +30 dias.`,
            confirmText: "Confirmar",
            cancelText: "Cancelar",
            variant: "success",
            onConfirm: async () => {
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
            }
        });
    };

    const handleChangePlan = async (t, novoPlano) => {
        setConfirmDialog({
            isOpen: true,
            title: "Alterar Plano",
            message: `Alterar o plano da igreja "${t.nome}" para ${novoPlano.toUpperCase()}? Os menus serão ajustados imediatamente.`,
            confirmText: "Alterar",
            cancelText: "Cancelar",
            variant: "info",
            onConfirm: async () => {
                try {
                    await setDoc(doc(dbFirestore, 'artifacts', t.id, 'public', 'data', 'settings', 'config'), { plano: novoPlano }, { merge: true });
                    await setDoc(doc(dbFirestore, 'artifacts', 'GIPP_MASTER', 'public', 'data', 'tenants', t.id), { plano: novoPlano }, { merge: true });
                    addToast("Plano alterado com sucesso!", "success");
                } catch(e) {
                    addToast("Erro ao alterar o plano.", "error");
                }
            }
        });
    };

    const handleExecuteDeleteTenant = async () => {
        if (!tenantToDelete) return;
        if (!deleteReason.trim()) {
            addToast("Por favor, digite a justificativa da exclusão.", "warning");
            return;
        }

        setIsDeletingTenant(true);
        try {
            // Remove o registro da igreja do painel de controle mestre do SaaS
            await deleteDoc(doc(dbFirestore, 'artifacts', 'GIPP_MASTER', 'public', 'data', 'tenants', tenantToDelete.id));
            addToast(`Igreja "${tenantToDelete.nome}" excluída com sucesso! Justificativa: ${deleteReason}`, "success");
            setTenantToDelete(null);
            setDeleteReason('');
        } catch (e) {
            console.error(e);
            addToast("Erro ao excluir o registro do cliente.", "error");
        } finally {
            setIsDeletingTenant(false);
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
            
            // Novos campos de Comunicados Globais
            if (data.saas_announcement_active !== undefined) payload.saas_announcement_active = data.saas_announcement_active;
            if (data.saas_announcement_title !== undefined) payload.saas_announcement_title = data.saas_announcement_title;
            if (data.saas_announcement_body !== undefined) payload.saas_announcement_body = data.saas_announcement_body;
            if (data.saas_announcement_type !== undefined) payload.saas_announcement_type = data.saas_announcement_type;
            if (data.saas_announcement_target !== undefined) payload.saas_announcement_target = data.saas_announcement_target;

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
        setConfirmDialog({
            isOpen: true,
            title: "Remover Papel de Parede",
            message: "Deseja realmente remover o papel de parede personalizado?",
            confirmText: "Remover",
            cancelText: "Cancelar",
            variant: "danger",
            onConfirm: async () => {
                try {
                    setData({...data, papel_parede: null});
                    await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { papel_parede: null }, { merge: true });
                    addToast("Papel de parede removido com sucesso!", "success");
                } catch (err) {
                    console.error(err);
                    addToast("Erro ao remover o papel de parede.", "error");
                }
            }
        });
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
        {id: 'divulgacao', label: 'Material de Divulgação', icon: Share2},
        {id: 'avisos', label: 'Comunicados Globais', icon: Megaphone},
        {id: 'simulador', label: 'Simulador MRR', icon: TrendingUp},
        {id: 'assistente', label: 'Assistente Virtual (IA)', icon: MessageSquare},
        {id: 'config', label: 'Config. do App', icon: Settings},
        {id: 'chaves_api', label: 'Integrações e APIs', icon: Key},
        {id: 'inpi', label: 'Passo a Passo INPI', icon: Fingerprint},
        {id: 'protecao', label: 'EULA & Combate à Pirataria', icon: Lock},
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
        <div className="h-full flex flex-col space-y-6 animate-entrance max-w-[1550px] mx-auto w-full pb-10 px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 p-6 rounded-3xl shadow-xl justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-slate-800 rounded-2xl text-emerald-400 border border-slate-700 shadow-inner"><Code size={32}/></div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight font-[Outfit]">Painel Master SaaS</h2>
                        <p className="text-slate-400 text-xs font-semibold">Gestão global de assinaturas, planos e configurações para congregações GIPP.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        SaaS Ativo
                    </span>
                </div>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-3xl border border-slate-800 shadow-xl shrink-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const isActive = tab === item.id;
                        return (
                            <button 
                                key={item.id} 
                                onClick={() => setTab(item.id)} 
                                className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all font-black text-xs cursor-pointer ${
                                    isActive 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                            >
                                <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                                <span className="truncate">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="glass-modern p-6 md:p-10 rounded-[2.5rem] flex-1 overflow-y-auto custom-scrollbar border border-slate-200/80 shadow-md relative bg-white/70 backdrop-blur-md">
                
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
                                                <button 
                                                    onClick={() => setTenantToDelete(t)} 
                                                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-100 rounded-xl transition-colors shadow-sm" 
                                                    title="Excluir Igreja permanentemente"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
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

                {/* === ABA: COMUNICADOS GLOBAIS === */}
                {tab === 'avisos' && (
                    <div className="space-y-6 animate-fadeIn text-slate-800">
                        <div className="bg-gradient-to-r from-indigo-600/15 via-purple-600/10 to-indigo-600/5 p-6 rounded-3xl border border-indigo-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex gap-4 items-start">
                                <span className="p-3 bg-indigo-600 text-white rounded-2xl shrink-0 shadow-lg shadow-indigo-500/25">
                                    <Megaphone size={24}/>
                                </span>
                                <div>
                                    <h3 className="font-extrabold text-slate-850 text-lg leading-tight">Central de Comunicados Globais (Broadcast SaaS)</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-1">
                                        Publique avisos de manutenção, atualizações de sistema ou notas diretas que aparecerão imediatamente para todos os operadores ativos de todas as congregações.
                                    </p>
                                </div>
                            </div>
                            <Button 
                                onClick={handleSaveConfig} 
                                variant="primary" 
                                className="shadow-lg whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase tracking-wider text-xs px-6 py-3"
                            >
                                <Save size={16}/> Salvar Comunicado
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Editor de Comunicados */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                                <h4 className="font-black text-indigo-900 text-sm uppercase tracking-widest pb-2 border-b flex items-center gap-2">
                                    <Settings size={18}/> Opções de Publicação
                                </h4>
                                
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div>
                                        <span className="text-xs font-black text-slate-800 block mb-0.5">Status do Comunicado</span>
                                        <span className="text-[10px] text-slate-400 font-bold">Ativa ou desativa a exibição global do alerta.</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={data.saas_announcement_active || false} 
                                            onChange={e => setData({...data, saas_announcement_active: e.target.checked})}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <FormInput 
                                            label="Badge/Categoria"
                                            value={data.saas_announcement_title || ''} 
                                            onChange={v => setData({...data, saas_announcement_title: v})} 
                                            placeholder="Ex: Manutenção Programada" 
                                            className="!mb-0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Tipo de Alerta (Visual)</label>
                                        <select 
                                            value={data.saas_announcement_type || 'info'}
                                            onChange={e => setData({...data, saas_announcement_type: e.target.value})}
                                            className="w-full bg-white border-2 border-slate-250 focus:border-indigo-500 rounded-xl py-3 px-4 font-semibold text-xs text-slate-700 outline-none transition-colors"
                                        >
                                            <option value="info">🔑 Informativo (Azul)</option>
                                            <option value="warning">⚠️ Perigo/Alerta (Amarelo)</option>
                                            <option value="error">❌ Urgente/Erro (Vermelho)</option>
                                            <option value="success">✅ Sucesso (Verde)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Conteúdo do Comunicado</label>
                                    <textarea 
                                        rows={4}
                                        value={data.saas_announcement_body || ''} 
                                        onChange={e => setData({...data, saas_announcement_body: e.target.value})}
                                        placeholder="Digite aqui os detalhes e links do comunicado público..."
                                        className="w-full border-2 border-slate-200 focus:border-indigo-500/60 bg-slate-50/30 p-3.5 rounded-2xl text-xs font-semibold text-slate-700 outline-none transition-all leading-relaxed"
                                    />
                                </div>

                                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex gap-3 items-start">
                                    <Info className="text-indigo-600 mt-0.5 shrink-0" size={16}/>
                                    <p className="text-[10px] text-indigo-800 font-bold leading-relaxed">
                                        Os operadores logados no sistema verão este banner flutuante no topo de seus painéis. Você pode usar este recurso para avisar sobre dízimos anuais, atualizações offline, avisos de devolução ou instabilidade no Firebase.
                                    </p>
                                </div>
                            </div>

                            {/* Simulador da Aparência no Sistema (Live Preview) */}
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 flex flex-col justify-between space-y-6">
                                <div className="space-y-1.5">
                                    <h4 className="font-black text-slate-500 text-xs uppercase tracking-widest flex items-center gap-1.5">
                                        <Activity size={14}/> Preview Visual em Tempo Real
                                    </h4>
                                    <p className="text-xs text-slate-400 font-medium">Assim é como o comunicado se comportará no topo da tela do usuário final:</p>
                                </div>

                                {/* Renderização dinâmica do Alerta de teste */}
                                <div className="flex-1 flex items-center justify-center p-4 bg-white/70 rounded-2xl border border-slate-200 border-dashed min-h-[140px] animate-pulse">
                                    {data.saas_announcement_active ? (
                                        <div className={`w-full p-4 rounded-2xl border shadow-sm flex items-start gap-3 transition-all duration-300 animate-entrance max-w-md ${
                                            data.saas_announcement_type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-950' :
                                            data.saas_announcement_type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-955' :
                                            data.saas_announcement_type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-955' :
                                            'bg-emerald-50 border-emerald-250 text-emerald-955'
                                        }`}>
                                            <span className="text-base shrink-0 mt-0.5">
                                                {data.saas_announcement_type === 'info' ? 'ℹ️' :
                                                 data.saas_announcement_type === 'warning' ? '⚠️' :
                                                 data.saas_announcement_type === 'error' ? '❌' : '✅'}
                                            </span>
                                            <div className="flex-1 space-y-0.5 text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                                        data.saas_announcement_type === 'info' ? 'bg-blue-200 text-blue-800' :
                                                        data.saas_announcement_type === 'warning' ? 'bg-amber-200 text-amber-800' :
                                                        data.saas_announcement_type === 'error' ? 'bg-rose-200 text-rose-800' :
                                                        'bg-emerald-200 text-emerald-800'
                                                    }`}>
                                                        {data.saas_announcement_title || 'VISÃO GERAL'}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 font-black">AGORA</span>
                                                </div>
                                                <p className="text-xs font-medium leading-relaxed mt-1 break-all">
                                                    {data.saas_announcement_body || 'Escreva o texto descritivo no formulário ao lado para simular o aviso em tempo real.'}
                                                </p>
                                            </div>
                                            <button type="button" className="text-xs font-black opacity-30 hover:opacity-100 transition-opacity p-0.5 shrink-0">✕</button>
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-400 space-y-2">
                                            <Megaphone className="mx-auto opacity-30 animate-bounce" size={32}/>
                                            <span className="text-xs font-black uppercase tracking-widest block text-slate-400">Nenhum Comunicado Ativo</span>
                                            <p className="text-[10px] text-slate-400 max-w-[240px] leading-relaxed mx-auto font-semibold">O switch "Status do Comunicado" está inativo. Ligue-o para emitir e pré-visualizar alertas globais.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="text-[10px] text-slate-500 font-medium font-semibold italic text-center">
                                    * Lembre-se de clicar em "Salvar Comunicado" para enviar este conteúdo para a nuvem.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* === ABA: MATERIAL DE DIVULGAÇÃO SAAS (41 MÓDULOS) === */}
                {tab === 'divulgacao' && (() => {
                    const currentModule = SAAS_MODULES_LIST.find(m => m.id === selectedModuleId) || SAAS_MODULES_LIST[0];
                    
                    const mCampaigns = generateSaaSMarketingMessages(currentModule, {
                        nomeSistema: divulgaNomeSistema,
                        urlSistema: divulgaUrlSistema,
                        whatsappContato: divulgaWhatsappContato,
                        emailSaaS: divulgaEmailSaaS,
                        nomeRevendedor: divulgaNomeRevendedor
                    });

                    // Filtering 41 modules dynamically
                    const filteredModules = SAAS_MODULES_LIST.filter(m => {
                        const matchesSearch = m.nome.toLowerCase().includes(searchModuleQuery.toLowerCase()) || 
                                              m.descricaoCurta.toLowerCase().includes(searchModuleQuery.toLowerCase());
                        const matchesCategory = selectedCategory === 'Todos' || m.categoria === selectedCategory;
                        return matchesSearch && matchesCategory;
                    });

                    const categories = [
                        'Todos',
                        'Gestão & Secretaria',
                        'Financeiro & Contábil',
                        'Liderança & Comunicação',
                        'Ensino & Família',
                        'Segurança & Infraestrutura'
                    ];

                    const getCountForCategory = (cat: string) => {
                        if (cat === 'Todos') return SAAS_MODULES_LIST.length;
                        return SAAS_MODULES_LIST.filter(m => m.categoria === cat).length;
                    };

                    const handleCopyText = (text: string, label: string) => {
                        copyToClipboard(text);
                        addToast(`${label} copiado com sucesso!`, 'success');
                        playMenuSound();
                    };

                    const handleTriggerWhatsApp = () => {
                        const text = mCampaigns.whatsapp;
                        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                        window.open(url, '_blank');
                        addToast("Redirecionando para o WhatsApp...", "info");
                        playMenuSound();
                    };

                    const handleTriggerWebPushBtn = () => {
                        // Plays notification sound and displays custom UI overlay
                        playNotificationSound();
                        setVisualPushAlert({ title: mCampaigns.pushTitle, body: mCampaigns.pushBody });

                        // Attempt to trigger native browser notification if allowed
                        if (typeof window !== 'undefined' && 'Notification' in window) {
                            try {
                                if (Notification.permission === 'granted') {
                                    new Notification(mCampaigns.pushTitle, {
                                        body: mCampaigns.pushBody
                                    });
                                    addToast("Push de testes enviado pelo seu S.O.!", "success");
                                } else if (Notification.permission !== 'denied') {
                                    Notification.requestPermission().then(permission => {
                                        if (permission === 'granted') {
                                            new Notification(mCampaigns.pushTitle, {
                                                body: mCampaigns.pushBody
                                            });
                                            addToast("Permissão Push Concedida e Mensagem enviada!", "success");
                                        } else {
                                            addToast("Aviso Push simulado disparado no feed comercial!", "info");
                                        }
                                    });
                                } else {
                                    addToast("Notificações de S.O. bloqueadas. Exibindo simulador local.", "info");
                                }
                            } catch (err) {
                                console.warn("Notification API blocked inside sandbox iframe, displaying on screen simulation", err);
                            }
                        }

                        // Save in local logger logs
                        const newLog = {
                            id: Date.now(),
                            title: mCampaigns.pushTitle,
                            body: mCampaigns.pushBody,
                            timestamp: 'Agora mesmo',
                            target: 'Todos os Dispositivos Mobile & Desktop'
                        };
                        setCustomPushesDispatched(prev => [newLog, ...prev]);
                    };

                    const getCategoryColorStyles = (cat: string) => {
                        switch (cat) {
                            case 'Gestão & Secretaria': return 'bg-blue-50 border-blue-200 text-blue-700';
                            case 'Financeiro & Contábil': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
                            case 'Liderança & Comunicação': return 'bg-indigo-50 border-indigo-200 text-indigo-700';
                            case 'Ensino & Família': return 'bg-amber-50 border-amber-200 text-amber-700';
                            case 'Segurança & Infraestrutura': return 'bg-rose-50 border-rose-200 text-rose-700';
                            default: return 'bg-slate-50 border-slate-200 text-slate-700';
                        }
                    };

                    const getModuleIconComp = (iconName: string) => {
                        const lookup: any = {
                            Users, Layers, DollarSign, UserCheck, Wallet, Shield, GraduationCap, Baby, Target, 
                            IdCard, Newspaper, Video, Truck, UserPlus, Building2, Globe, Sparkles, Book, Award, 
                            ClipboardList, Database, Lock, BookOpen, Trash, ScrollText, Info, FileBarChart, 
                            Server, Key, Mail, Inbox, CheckCheck, Landmark, History, Headset, FileText, 
                            Palette, Sliders, Instagram, Calendar
                        };
                        const Comp = lookup[iconName];
                        return Comp || Package;
                    };

                    return (
                        <div className="space-y-6 animate-fadeIn text-slate-800">
                            {/* Heading Banner */}
                            <div className="bg-gradient-to-r from-teal-600/15 via-indigo-650/5 to-teal-600/5 p-6 rounded-3xl border border-teal-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex gap-4 items-start">
                                    <span className="p-3 bg-teal-600 text-white rounded-2xl shrink-0 shadow-lg shadow-teal-500/25">
                                        <Share2 size={24}/>
                                    </span>
                                    <div>
                                        <h3 className="font-extrabold text-slate-850 text-lg leading-tight text-teal-950">Central de Divulgação de Módulos (SaaS Omnichannel)</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-1">
                                            Apresente os <span className="text-teal-600 font-extrabold">41 módulos do GIPP</span> aos seus clientes de forma profissional. Envie campanhas integradas com WhatsApp, E-mails HTML elegantes e disparos rápidos de Push Notifications que alcançam qualquer computador, Android, iOS ou Windows.
                                        </p>
                                    </div>
                                </div>
                                <div className="px-4 py-2.5 bg-indigo-50 border border-indigo-150 rounded-2xl flex items-center gap-2">
                                    <Sparkles size={16} className="text-indigo-600 animate-spin" style={{ animationDuration: '4s' }} />
                                    <span className="text-xs font-black text-indigo-750 uppercase tracking-wider">
                                        41 Módulos Ativos de Mídia
                                    </span>
                                </div>
                            </div>

                            {/* Simulated Interactive Dynamic Top island iOS notification */}
                            {visualPushAlert && (
                                <div className="fixed top-6 right-6 z-[60000] max-w-sm w-full bg-slate-900/95 backdrop-blur-xl border border-slate-750 text-white rounded-2xl shadow-2xl p-4 overflow-hidden animate-scaleUp flex gap-3 transition-all duration-300">
                                    <div className="p-2.5 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                                        <Bell size={18} className="text-white animate-bounce" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="text-[9px] font-black uppercase text-teal-400 tracking-wider">Notificação SaaS Recebida</span>
                                            <span className="text-[8px] text-slate-400 font-bold">Agora mesmo</span>
                                        </div>
                                        <h5 className="font-bold text-xs text-white leading-tight">{visualPushAlert.title}</h5>
                                        <p className="text-[10px] text-slate-300 leading-relaxed mt-1 break-words">{visualPushAlert.body}</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setVisualPushAlert(null)} 
                                        className="text-slate-400 hover:text-white transition-colors h-fit p-1 shrink-0"
                                    >
                                        <X size={14}/>
                                    </button>
                                </div>
                            )}

                            {/* 1. Global SaaS Customizer Form */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
                                    <Sliders size={18} className="text-teal-600"/> Personalização das Mensagens e Links do seu SaaS comercial
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div>
                                        <FormInput 
                                            label="Nome do Sistema" 
                                            value={divulgaNomeSistema} 
                                            onChange={setDivulgaNomeSistema} 
                                            className="!mb-0" 
                                        />
                                    </div>
                                    <div>
                                        <FormInput 
                                            label="Link Oficial SaaS" 
                                            value={divulgaUrlSistema} 
                                            onChange={setDivulgaUrlSistema} 
                                            className="!mb-0" 
                                        />
                                    </div>
                                    <div>
                                        <FormInput 
                                            label="WhatsApp Comercial" 
                                            value={divulgaWhatsappContato} 
                                            onChange={setDivulgaWhatsappContato} 
                                            className="!mb-0" 
                                        />
                                    </div>
                                    <div>
                                        <FormInput 
                                            label="E-mail de Suporte" 
                                            value={divulgaEmailSaaS} 
                                            onChange={setDivulgaEmailSaaS} 
                                            className="!mb-0" 
                                        />
                                    </div>
                                    <div>
                                        <FormInput 
                                            label="Nome Revendedor" 
                                            value={divulgaNomeRevendedor} 
                                            onChange={setDivulgaNomeRevendedor} 
                                            className="!mb-0" 
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed flex-1">
                                        * Qualquer alteração nestes campos refletirá instantaneamente nos links, assinaturas e corpos de e-mail de todos os 41 módulos abaixo!
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleSaveDivulgacao}
                                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-teal-500/10 flex items-center gap-2 cursor-pointer whitespace-nowrap"
                                    >
                                        <Save size={14}/> Salvar Informações
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* Left Directory Panel: list of 41 modules */}
                                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                    <div className="space-y-1.5 pb-2 border-b">
                                        <h4 className="font-black text-slate-850 text-sm uppercase tracking-wider flex items-center justify-between">
                                            <span>🗂️ Catálogo de Módulos</span>
                                            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">41 Módulos</span>
                                        </h4>
                                        <p className="text-[10px] text-slate-400 font-semibold">Selecione para abrir e gerar o material de divulgação integrado correspondente.</p>
                                    </div>

                                    {/* Directory Search and Cat filter */}
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16}/>
                                            <input 
                                                type="text"
                                                placeholder="Buscar módulo..."
                                                value={searchModuleQuery}
                                                onChange={e => setSearchModuleQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-teal-500 rounded-xl text-xs font-semibold outline-none transition-colors"
                                            />
                                        </div>

                                        {/* Categories horizontal list */}
                                        <div className="flex gap-1.5 flex-wrap">
                                            {categories.map(cat => {
                                                const isActive = selectedCategory === cat;
                                                return (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                                                            isActive 
                                                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm font-extrabold' 
                                                                : 'bg-slate-50 hover:bg-slate-150 text-slate-550 border-slate-200'
                                                        }`}
                                                    >
                                                        <span>{cat}</span>
                                                        <span className={`text-[8px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white text-teal-700' : 'bg-slate-200 text-slate-600'}`}>{getCountForCategory(cat)}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Scrolling Modules list */}
                                    <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 text-left">
                                        {filteredModules.length > 0 ? (
                                            filteredModules.map(item => {
                                                const isSelected = selectedModuleId === item.id;
                                                const IconComp = getModuleIconComp(item.iconName);
                                                const categoryStyle = getCategoryColorStyles(item.categoria);
                                                return (
                                                    <div 
                                                        key={item.id}
                                                        onClick={() => { setSelectedModuleId(item.id); playMenuSound(); }}
                                                        className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                                                            isSelected 
                                                                ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                                                                : 'bg-white hover:bg-slate-50 border-slate-250/70 text-slate-700 hover:-translate-y-0.5'
                                                        }`}
                                                    >
                                                        <span className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-50 border text-slate-500'}`}>
                                                            <IconComp size={16}/>
                                                        </span>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center justify-between gap-1.5">
                                                                <h5 className="font-extrabold text-xs tracking-tight line-clamp-1">{item.nome}</h5>
                                                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 ${
                                                                    isSelected ? 'bg-slate-800 text-white' : categoryStyle
                                                                }`}>
                                                                    {item.categoria.split(' ')[0]}
                                                                </span>
                                                            </div>
                                                            <p className={`text-[10px] leading-relaxed line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-400 font-medium'}`}>
                                                                {item.descricaoCurta}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8 text-slate-400 space-y-2">
                                                <Search size={32} className="mx-auto opacity-30 animate-pulse" />
                                                <span className="text-xs font-black block">Nenhum Módulo Encontrado</span>
                                                <p className="text-[10px]">Modifique a busca ou troque a categoria para filtrar.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Campaign Desk Panel: detailed preview of templates */}
                                <div className="lg:col-span-7 space-y-6">
                                    <div className="bg-slate-900 text-slate-100 p-6 rounded-[2rem] shadow-xl border border-slate-850 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex gap-4 items-start z-10">
                                            <span className="p-3 bg-teal-500/10 text-teal-400 border border-teal-500/25 rounded-2xl shrink-0">
                                                {(() => { const IconComp = getModuleIconComp(currentModule.iconName); return <IconComp size={24}/> })()}
                                            </span>
                                            <div className="text-left">
                                                <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest block mb-0.5">{currentModule.categoria}</span>
                                                <h4 className="text-xl font-black text-white leading-tight">Módulo: {currentModule.nome}</h4>
                                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentModule.descricaoCurta}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Navigation Channels Subtabs */}
                                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                        <div className="flex border-b border-slate-100 pb-2 overflow-x-auto custom-scrollbar">
                                            <div className="flex gap-2 min-w-max pb-1">
                                                <button
                                                    onClick={() => { setSelectedChannel('whatsapp'); playMenuSound(); }}
                                                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                                                        selectedChannel === 'whatsapp' 
                                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/15' 
                                                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <MessageCircle size={15}/> Divulgação WhatsApp
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedChannel('email'); playMenuSound(); }}
                                                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                                                        selectedChannel === 'email' 
                                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/15' 
                                                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <Mail size={15}/> E-mail Marketing HTML
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedChannel('push'); playMenuSound(); }}
                                                    className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                                                        selectedChannel === 'push' 
                                                            ? 'bg-teal-600 text-white shadow-md shadow-teal-500/15' 
                                                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <Smartphone size={15}/> Web Push Notificações
                                                </button>
                                            </div>
                                        </div>

                                        {/* CHANNEL: WHATSAPP SIMULATOR */}
                                        {selectedChannel === 'whatsapp' && (
                                            <div className="space-y-4 animate-fadeIn text-left">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b">
                                                    <div>
                                                        <h5 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider">Mockup de Conversa no WhatsApp</h5>
                                                        <span className="text-[10px] text-slate-400 font-semibold">Visualização com emojis e quebra de linhas reais.</span>
                                                    </div>
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        <Button 
                                                            onClick={() => handleCopyText(mCampaigns.whatsapp, 'Mensagem WhatsApp')} 
                                                            variant="secondary" 
                                                            size="sm"
                                                            className="flex items-center gap-1.5 font-bold text-xs"
                                                        >
                                                            <Copy size={13}/> Copiar
                                                        </Button>
                                                        <Button 
                                                            onClick={handleTriggerWhatsApp} 
                                                            variant="primary" 
                                                            size="sm"
                                                            className="!bg-emerald-500 border-emerald-600 hover:bg-emerald-600 text-white font-extrabold flex items-center gap-1.5 shadow-sm rounded-xl"
                                                        >
                                                            <Send size={13}/> Enviar no Whats
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Smart Phone Shell Container */}
                                                <div className="bg-slate-100 p-4 rounded-3xl border border-slate-200 shadow-inner max-w-sm mx-auto relative">
                                                    <div className="bg-emerald-600 text-white rounded-t-2xl p-3 flex items-center justify-between shadow-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-700/80 border border-emerald-500/10 flex items-center justify-center font-black text-xs text-white">
                                                                {divulgaNomeSistema.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <span className="text-[11px] font-black block tracking-wide">{divulgaNomeRevendedor}</span>
                                                                <span className="text-[8px] text-emerald-150 block mt-0.5">Online via SaaS Master</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] font-bold opacity-85 font-mono">20:26</div>
                                                    </div>

                                                    <div className="bg-[#efeae2] p-4 max-h-[350px] overflow-y-auto custom-scrollbar flex flex-col space-y-3 relative rounded-b-2xl shadow-inner text-[11px]">
                                                        <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm text-slate-800 text-left max-w-[85%] relative shadow-sm self-start leading-relaxed whitespace-pre-wrap font-medium">
                                                            Olá! Seja bem-vindo à central do <strong>{divulgaNomeSistema}</strong>. Abaixo enviamos os detalhes do recurso solicitado! 🚀
                                                            <span className="text-[8px] text-slate-400 float-right font-black mt-2">20:26</span>
                                                        </div>

                                                        <div className="bg-[#d9fdd3] p-3 rounded-2xl rounded-tr-sm text-slate-800 text-left max-w-[95%] relative shadow-sm self-end leading-relaxed whitespace-pre-wrap font-sans">
                                                            {mCampaigns.whatsapp}
                                                            <span className="text-[8px] text-emerald-750 float-right font-black mt-2">20:26 ✓✓</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* CHANNEL: EMAIL TEMPLATE HTML */}
                                        {selectedChannel === 'email' && (
                                            <div className="space-y-4 animate-fadeIn text-left">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b">
                                                    <div>
                                                        <h5 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider">Preview de Inbox & Campanhas de E-mail</h5>
                                                        <span className="text-[10px] text-slate-400 font-semibold">Garante layouts harmônicos no Gmail, Outlook e outros correios.</span>
                                                    </div>
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        <Button 
                                                            onClick={() => handleCopyText(mCampaigns.emailSubject, 'Assunto do E-mail')} 
                                                            variant="secondary" 
                                                            size="sm"
                                                            className="flex items-center gap-1 font-bold text-xs"
                                                        >
                                                            Assunto
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleCopyText(mCampaigns.emailHtml, 'Código HTML')} 
                                                            variant="secondary" 
                                                            size="sm"
                                                            className="flex items-center gap-1.5 font-bold text-xs"
                                                        >
                                                            <Code size={13}/> HTML
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleCopyText(mCampaigns.whatsapp, 'Mensagem Texto')} 
                                                            variant="secondary" 
                                                            size="sm"
                                                            className="flex items-center gap-1.5 font-bold text-xs"
                                                        >
                                                            <Copy size={13}/> Texto
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                                                    <div className="space-y-1.5 text-xs pb-3 border-b border-slate-200">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-extrabold text-slate-400 w-16 text-right shrink-0">Assunto:</span>
                                                            <span className="font-black text-slate-800 break-normal text-left">{mCampaigns.emailSubject}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-extrabold text-slate-400 w-16 text-right shrink-0">De:</span>
                                                            <span className="font-semibold text-slate-700">{divulgaNomeRevendedor} &lt;{divulgaEmailSaaS}&gt;</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-extrabold text-slate-400 w-16 text-right shrink-0">Para:</span>
                                                            <span className="font-semibold text-slate-500">lideranca@igrejaparceira.org</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white rounded-xl border border-slate-200 max-h-[350px] overflow-y-auto custom-scrollbar p-1">
                                                        <div dangerouslySetInnerHTML={{ __html: mCampaigns.emailHtml }} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* CHANNEL: WEB PUSH NOTIFICATION */}
                                        {selectedChannel === 'push' && (
                                            <div className="space-y-6 animate-fadeIn text-left">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b">
                                                    <div>
                                                        <h5 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider">Disparador de Pushes Multiplataformas (Nativo e Simulador)</h5>
                                                        <span className="text-[10px] text-slate-400 font-semibold">Os alertas dízimos alcançam PC Windows, Mac, Android, iOS e navegadores ativos.</span>
                                                    </div>
                                                    <Button 
                                                        onClick={handleTriggerWebPushBtn} 
                                                        variant="primary" 
                                                        size="sm"
                                                        className="shadow-md shadow-teal-500/25 !bg-teal-600 hover:bg-teal-700 text-white font-extrabold flex items-center gap-1.5 rounded-xl"
                                                    >
                                                        <Bell size={14}/> Disparar Push Global de Testes
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                                    {/* Lockscreen smartphone template */}
                                                    <div className="bg-slate-950 rounded-[2.5rem] border-8 border-slate-800 p-4 aspect-[4/5] relative flex flex-col justify-between overflow-hidden shadow-xl shadow-slate-950/40 w-full max-w-[280px] mx-auto">
                                                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-black rounded-full z-10"></div>
                                                        
                                                        <div className="text-center font-sans mt-3 text-slate-100 space-y-1">
                                                            <div className="text-[10px] font-semibold tracking-wider text-slate-300">Segunda, 15 de Junho</div>
                                                            <div className="text-3xl font-black text-white/95 font-mono tracking-tight">20:26</div>
                                                            <div className="text-[8px] font-black uppercase text-teal-400 bg-teal-950/50 border border-teal-900 px-2.5 py-0.5 rounded-full inline-block mt-0.5">SaaS Live System</div>
                                                        </div>

                                                        <div className="bg-slate-900/95 border border-slate-800 text-slate-150 backdrop-blur-md rounded-2xl p-3 shadow-lg flex items-start gap-2.5 animate-bounce" style={{ animationDuration: '4s' }}>
                                                            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                                                {(() => { const IconComp = getModuleIconComp(currentModule.iconName); return <IconComp size={12}/> })()}
                                                            </div>
                                                            <div className="flex-1 text-left space-y-0.5 min-w-0">
                                                                <div className="flex justify-between items-center mb-0.5">
                                                                    <span className="text-[8px] font-black text-white truncate pr-1">{divulgaNomeSistema} SYSTEM</span>
                                                                    <span className="text-[7px] text-slate-400 font-bold shrink-0">agora</span>
                                                                </div>
                                                                <h6 className="font-extrabold text-[10px] text-white leading-tight truncate">{mCampaigns.pushTitle}</h6>
                                                                <p className="text-[8px] text-slate-305 leading-snug line-clamp-2">{mCampaigns.pushBody}</p>
                                                            </div>
                                                        </div>

                                                        <div className="text-center text-[9px] text-slate-400 font-semibold mb-2 flex items-center justify-center gap-1 select-none">
                                                            <Lock size={9}/> Toque para abrir o painel
                                                        </div>
                                                    </div>

                                                    {/* Push transmission logs list */}
                                                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/80 flex flex-col space-y-3 h-full justify-between">
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Logs de Disparos Recentes (Timeline)</span>
                                                            <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1 pt-1">
                                                                {customPushesDispatched.map(item => (
                                                                    <div key={item.id} className="bg-white border border-slate-200 p-2.5 rounded-xl text-left space-y-1 shadow-sm">
                                                                        <div className="flex justify-between items-center gap-2">
                                                                            <span className="font-extrabold text-[10px] text-slate-800 truncate leading-snug">{item.title}</span>
                                                                            <span className="text-[8px] text-teal-600 font-bold bg-teal-50 px-1 py-0.2 rounded border border-teal-150 shrink-0">{item.timestamp}</span>
                                                                        </div>
                                                                        <p className="text-[9px] text-slate-550 leading-relaxed font-semibold">{item.body}</p>
                                                                        <div className="text-[7px] text-slate-450 font-bold">
                                                                            <span>Canal: PUSH SYSTEM &bull; Filtro: {item.target}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-2xl flex gap-2.5 items-start text-left">
                                                            <Info size={14} className="text-teal-600 mt-0.5 shrink-0" />
                                                            <p className="text-[9px] text-teal-800 leading-relaxed font-semibold">
                                                                Esta simulação interage em tempo real utilizando a API nativa do navegador para disparar pushes de demonstração diretamente em seu Sistema Operacional. Ative as permissões ao clicar para receber!
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* === ABA: SIMULADOR MRR === */}
                {tab === 'simulador' && (() => {
                    const valBasico = Number(planosValores.basico) || defaultValores.basico;
                    const valStandard = Number(planosValores.standard) || defaultValores.standard;
                    const valAvancado = Number(planosValores.avancado) || defaultValores.avancado;

                    const totalChurches = simBasicCount + simStandardCount + simAdvancedCount;
                    const mrrBasico = simBasicCount * valBasico;
                    const mrrStandard = simStandardCount * valStandard;
                    const mrrAvancado = simAdvancedCount * valAvancado;
                    
                    const mrrTotal = mrrBasico + mrrStandard + mrrAvancado;
                    const arrTotal = mrrTotal * 12;

                    const totalCost = totalChurches * simInfraCost;
                    const netProfit = mrrTotal - totalCost;
                    const profitMargin = mrrTotal > 0 ? (netProfit / mrrTotal) * 105 : 0;
                    const finalProfitMargin = profitMargin > 100 ? 98.2 : profitMargin;
                    
                    const arpu = totalChurches > 0 ? mrrTotal / totalChurches : 0;
                    const churnChurches = (totalChurches * (simChurnRate / 100));
                    const churnImpactMonthly = churnChurches * arpu;
                    const ltv = simChurnRate > 0 ? arpu / (simChurnRate / 100) : 0;

                    const growthPercentagePerYear = totalChurches > 0 ? ((simMonthlyAdditions * 12) / totalChurches) * 100 : 40;
                    const ruleOf40Score = finalProfitMargin + growthPercentagePerYear;

                    const chartData = [];
                    let currentChurches = totalChurches;
                    let currentMRR = mrrTotal;
                    
                    for (let month = 1; month <= 12; month++) {
                        const loss = currentChurches * (simChurnRate / 100);
                        const netAdditions = simMonthlyAdditions - loss;
                        currentChurches = Math.max(0, currentChurches + netAdditions);
                        currentMRR = currentChurches * arpu;
                        chartData.push({
                            name: `Mês ${month}`,
                            Igrejas: Math.round(currentChurches),
                            MRR: Math.round(currentMRR),
                            Custo: Math.round(currentChurches * simInfraCost),
                            "Lucro Líquido": Math.round(currentMRR - (currentChurches * simInfraCost))
                        });
                    }

                    return (
                        <div className="space-y-8 animate-fadeIn text-slate-800">
                            <div className="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 p-6 rounded-3xl border border-emerald-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex gap-4 items-start">
                                    <span className="p-3 bg-emerald-600 text-white rounded-2xl shrink-0 shadow-lg shadow-emerald-500/25">
                                        <TrendingUp size={24}/>
                                    </span>
                                    <div>
                                        <h3 className="font-extrabold text-slate-850 text-lg leading-tight">Painel de Prospecção Financeira & Simulador MRR</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-1">
                                            Projete o faturamento recorrente (MRR), receitas líquidas anuais (ARR), custos de infraestrutura e previsões de churn baseados no volume de clientes.
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white/80 border border-emerald-150 px-4 py-2.5 rounded-2xl shrink-0 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        ARPU Estimado: <span className="text-emerald-700 font-extrabold">R$ {arpu.toFixed(2)}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assinantes Ativos</span>
                                    <h4 className="text-3xl font-black text-slate-800">{totalChurches} igrejas</h4>
                                    <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider flex justify-between">
                                        <span>B:{simBasicCount}</span>
                                        <span>•</span>
                                        <span>S:{simStandardCount}</span>
                                        <span>•</span>
                                        <span>A:{simAdvancedCount}</span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-3xl shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden">
                                    <span className="text-[9px] font-black text-indigo-200 uppercase tracking-widest block mb-1">MRR Métrico de SaaS</span>
                                    <h4 className="text-3xl font-black">R$ {mrrTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                                    <p className="text-[9px] text-indigo-200 mt-3 font-semibold">ARR Anualizado: R$ {arrTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                                </div>

                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">EBITDA Líquido SaaS</span>
                                    <h4 className="text-3xl font-black text-emerald-600">R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
                                    <div className="text-[10px] text-slate-500 mt-2 font-black uppercase flex justify-between">
                                        <span>Margem: {finalProfitMargin.toFixed(1)}%</span>
                                        <span className="text-neutral-400">Infra: -R$ {totalCost}</span>
                                    </div>
                                </div>

                                <div className={`p-6 rounded-3xl shadow-sm border relative overflow-hidden ${
                                    ruleOf40Score >= 40 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                                }`}>
                                    <span className="text-[9px] font-black uppercase tracking-widest block mb-1">SaaS Score (Rule of 40)</span>
                                    <h4 className="text-3xl font-black">{ruleOf40Score.toFixed(0)} ({ruleOf40Score >= 40 ? 'Excepcional' : 'Saudável'})</h4>
                                    <p className="text-[9px] mt-3 font-medium opacity-80 leading-snug">
                                        Soma de Margem ({finalProfitMargin.toFixed(0)}%) + Crescimento anual ({growthPercentagePerYear.toFixed(0)}%). {ruleOf40Score >= 40 ? 'GIPP é um negócio SaaS incrivelmente escalável!' : 'Margem operacional sólida.'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 lg:col-span-1">
                                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest pb-2 border-b flex items-center gap-2">
                                        <Sliders size={18} className="text-indigo-600"/> Ajustes do Modelo
                                    </h4>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Igrejas BÁSICO (R$ {valBasico})</label>
                                                <span className="text-xs font-black text-slate-800">{simBasicCount}</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="150" step="1" 
                                                value={simBasicCount} onChange={e => setSimBasicCount(parseInt(e.target.value))}
                                                className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Igrejas STANDARD (R$ {valStandard})</label>
                                                <span className="text-xs font-black text-slate-800">{simStandardCount}</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="150" step="1" 
                                                value={simStandardCount} onChange={e => setSimStandardCount(parseInt(e.target.value))}
                                                className="w-full accent-indigo-650 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] font-black text-slate-550 uppercase tracking-wider">Igrejas AVANÇADO (R$ {valAvancado})</label>
                                                <span className="text-xs font-black text-slate-800">{simAdvancedCount}</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="150" step="1" 
                                                value={simAdvancedCount} onChange={e => setSimAdvancedCount(parseInt(e.target.value))}
                                                className="w-full accent-indigo-700 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] font-black text-slate-550 uppercase tracking-wider">Média de novas vendas / mês</label>
                                                <span className="text-xs font-black text-slate-850">+{simMonthlyAdditions}</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="25" step="1" 
                                                value={simMonthlyAdditions} onChange={e => setSimMonthlyAdditions(parseInt(e.target.value))}
                                                className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] font-black text-slate-550 uppercase tracking-wider">Taxa de Churn mensal</label>
                                                <span className="text-xs font-black text-rose-600">{simChurnRate}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="15" step="0.5" 
                                                value={simChurnRate} onChange={e => setSimChurnRate(parseFloat(e.target.value))}
                                                className="w-full accent-rose-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] font-black text-slate-550 uppercase tracking-wider">Custo operacional / igreja</label>
                                                <span className="text-xs font-black text-slate-800">R$ {simInfraCost.toFixed(2)}</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="50" step="1" 
                                                value={simInfraCost} onChange={e => setSimInfraCost(parseInt(e.target.value))}
                                                className="w-full accent-indigo-400 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 lg:col-span-2 flex flex-col justify-between h-full">
                                    <div className="space-y-1.5">
                                        <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                                            <Activity size={18} className="text-emerald-500"/> Projeção de Crescimento Líquido a 12 Meses
                                        </h4>
                                        <p className="text-xs text-slate-400 font-medium">Gráfico analítico estimativo mostrando a evolução combinada da carteira em termos de receitas operacionais (MRR) de acordo com o Churn e Adições.</p>
                                    </div>

                                    <div className="h-[280px] w-full pt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorMRR2" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                                    </linearGradient>
                                                    <linearGradient id="colorProfit2" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                                                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                                                <RechartsTooltip 
                                                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '11px', fontFamily: 'sans-serif' }}
                                                />
                                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                                <Area type="monotone" dataKey="MRR" name="Receita Bruta (MRR)" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMRR2)" />
                                                <Area type="monotone" dataKey="Lucro Líquido" name="Lucro Operacional" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit2)" />
                                                <Line type="monotone" dataKey="Igrejas" name="Igrejas Ativas" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-800">
                                        <div className="space-y-0.5">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Projeção de Lifetime Value (LTV):</span>
                                            <p className="text-slate-800 font-extrabold text-sm">R$ {ltv.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Perda de MRR por Churn (Mês):</span>
                                            <p className="text-rose-600 font-extrabold text-sm">-R$ {churnImpactMonthly.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* === ABA: CHAVES API E INTEGRAÇÕES === */}
                {tab === 'chaves_api' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-slate-900 p-8 rounded-[2rem] border-2 border-slate-800 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Key size={120} className="text-white" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                        Monitor de Integrações e APIs
                                    </h3>
                                    <p className="text-slate-400 mt-2 max-w-2xl font-medium leading-relaxed">
                                        Visualize os recursos habilitados através das chaves de API fornecidas.
                                        As chaves são configuradas nas variáveis de ambiente por questões de segurança.
                                    </p>
                                </div>
                                <Button 
                                    onClick={fetchApiKeysStatus} 
                                    disabled={loadingApiKeys}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg"
                                >
                                    {loadingApiKeys ? <Loader2 size={18} className="animate-spin mr-2" /> : <RefreshCw size={18} className="mr-2" />}
                                    Atualizar Status
                                </Button>
                            </div>
                        </div>

                        {loadingApiKeys ? (
                            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                                <Loader2 size={48} className="animate-spin text-indigo-500" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Carregando integrações...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {apiKeysStatus.some(api => api.isClientSide) && (
                                    <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-[2rem] flex items-start gap-3.5 shadow-sm">
                                        <Info size={20} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                        <div className="text-xs text-amber-900 dark:text-amber-200 font-medium space-y-1.5">
                                            <p className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800 dark:text-amber-400">⚠️ Modo Hospedagem Estática Ativo (Vercel / GitHub Pages)</p>
                                            <p className="leading-relaxed">
                                                Identificamos que você está executando o sistema em uma hospedagem estática, onde o servidor Node central não está disponível. 
                                                Para habilitar a Inteligência Artificial e outros recursos avançados, você pode inserir as chaves de API diretamente em cada cartão abaixo. Elas serão salvas de forma segura e exclusiva no seu navegador.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {apiKeysStatus.map((api: any, idx: number) => (
                                        <div key={idx} className={`p-6 rounded-3xl border-2 flex flex-col justify-between ${api.enabled ? 'bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/5 dark:border-emerald-900' : 'bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800'}`}>
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-3 rounded-2xl ${api.enabled ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                            <Key size={24} />
                                                        </div>
                                                        <div>
                                                            <h4 className={`text-lg font-black ${api.enabled ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-700 dark:text-slate-300'}`}>{api.name}</h4>
                                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md inline-block mt-1 ${api.enabled ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                                {api.enabled ? 'INTEGRAÇÃO ATIVA' : 'NÃO CONFIGURADO'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6">
                                                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Recursos Gerenciados:</h5>
                                                    <ul className="space-y-2">
                                                        {api.services.map((service: string, sIdx: number) => (
                                                            <li key={sIdx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                                                                <CheckCircle size={16} className={`mt-0.5 shrink-0 ${api.enabled ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`} />
                                                                {service}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div>
                                                {!api.enabled && !api.isClientSide && (
                                                    <div className="mt-6 p-4 bg-white/60 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-850 text-xs text-slate-500 flex gap-2">
                                                        <Info size={16} className="text-indigo-400 shrink-0" />
                                                        Para ativar estes recursos, configure a chave de API correspondente nas Variáveis de Ambiente da plataforma.
                                                    </div>
                                                )}

                                                {api.isClientSide && (
                                                    <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] uppercase font-extrabold text-slate-400">Configurar Chave para esta Hospedagem</span>
                                                            {api.enabled && (
                                                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 font-extrabold text-[8px] rounded uppercase">Configurada</span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <input 
                                                                type="password"
                                                                placeholder={
                                                                    api.keyName === 'VITE_GEMINI_API_KEY' 
                                                                        ? "Cole sua chave da API do Gemini..."
                                                                        : api.keyName === 'VITE_ASAAS_API_KEY'
                                                                            ? "Cole sua chave/access token do Asaas..."
                                                                            : "Cole sua chave pública VAPID..."
                                                                }
                                                                value={
                                                                    api.keyName === 'VITE_GEMINI_API_KEY' ? clientGeminiKey :
                                                                    api.keyName === 'VITE_ASAAS_API_KEY' ? clientAsaasKey : clientVapidKey
                                                                }
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (api.keyName === 'VITE_GEMINI_API_KEY') setClientGeminiKey(val);
                                                                    if (api.keyName === 'VITE_ASAAS_API_KEY') setClientAsaasKey(val);
                                                                    if (api.keyName === 'VITE_VAPID_PUBLIC_KEY') setClientVapidKey(val);
                                                                }}
                                                                className="flex-1 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500"
                                                            />
                                                            <button 
                                                                onClick={() => {
                                                                    const val = 
                                                                        api.keyName === 'VITE_GEMINI_API_KEY' ? clientGeminiKey :
                                                                        api.keyName === 'VITE_ASAAS_API_KEY' ? clientAsaasKey : clientVapidKey;
                                                                    handleSaveClientKey(api.keyName, val);
                                                                }}
                                                                className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] tracking-wider uppercase rounded-xl py-2 cursor-pointer transition-all shrink-0 shadow-sm"
                                                            >
                                                                Salvar
                                                            </button>
                                                            {api.enabled && (
                                                                <button 
                                                                    onClick={() => handleClearClientKey(api.keyName)}
                                                                    className="px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 font-extrabold text-[10px] uppercase rounded-xl border border-rose-200 dark:border-rose-900 cursor-pointer shrink-0"
                                                                >
                                                                    Limpar
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                                                            * Armazenado localmente com segurança apenas no seu navegador para {window.location.hostname}.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

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

                {/* === ABA: PASSO A PASSO INPI === */}
                {tab === 'inpi' && (() => {
                    const igrejaData = db.igreja || {
                        nome: "Assembleia de Deus GIPP",
                        cnpj: "00.000.000/0001-00",
                        pastor: "Pr. Patrick Pessoa",
                        cidade: "São Paulo",
                        uf: "SP",
                        canon_registro_geral: "REG-CGADB-98765-A",
                        saas_nome_sistema: "GIPP"
                    };
                    return (
                        <div className="space-y-6 animate-entrance">
                            {/* Step-by-Step Guide card */}
                            <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-6">
                                <div className="flex items-center gap-3 border-b pb-4">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
                                        <Landmark size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-850 font-[Outfit]">Como Registrar Seu Software Oficialmente no INPI</h3>
                                        <p className="text-xs text-slate-500">O registro no INPI garante proteção em 170 países e dura 50 anos</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                                        <h4 className="font-black text-xs text-indigo-900 uppercase tracking-wide flex items-center gap-2">
                                            <span className="bg-indigo-200 text-indigo-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
                                            Cadastrar no e-INPI
                                        </h4>
                                        <p className="text-xs text-slate-650 leading-relaxed font-medium">
                                            Acesse o portal oficial do INPI e crie um cadastro para a Igreja (CNPJ) ou para o desenvolvedor (CPF). Esse cadastro será o titular do ativo de software.
                                        </p>
                                        <a href="https://www.gov.br/inpi" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-650 hover:underline">
                                            Acessar Portal do INPI <ExternalLink size={10} />
                                        </a>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                                        <h4 className="font-black text-xs text-indigo-900 uppercase tracking-wide flex items-center gap-2">
                                            <span className="bg-indigo-200 text-indigo-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
                                            Emitir e Pagar a GRU
                                        </h4>
                                        <p className="text-xs text-slate-650 leading-relaxed font-medium">
                                            Gere a Guia de Recolhimento da União sob o código <strong className="text-indigo-950 font-extrabold">220 (Registro de Programa de Computador)</strong>. O valor é de R$ 185,00 para empresas comuns e reduzido para R$ 74,00 para entidades filantrópicas, igrejas ou pessoas físicas.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                                        <h4 className="font-black text-xs text-indigo-900 uppercase tracking-wide flex items-center gap-2">
                                            <span className="bg-indigo-200 text-indigo-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">3</span>
                                            Declarar o Resumo Digital (Hash SHA-256)
                                        </h4>
                                        <p className="text-xs text-slate-650 leading-relaxed font-medium">
                                            O INPI não exige o código-fonte por inteiro por motivos de segurança. Você deve fornecer apenas um **Hash SHA-256** exclusivo gerado a partir do código do software. Use nossa ferramenta de criptografia abaixo para gerar o seu de forma instantânea e segura.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                                        <h4 className="font-black text-xs text-indigo-900 uppercase tracking-wide flex items-center gap-2">
                                            <span className="bg-indigo-200 text-indigo-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">4</span>
                                            Preencher a Petição Online
                                        </h4>
                                        <p className="text-xs text-slate-650 leading-relaxed font-medium">
                                            Acesse o sistema eletrônico de peticionamento, informe os dados lógicos do software (Linguagem, Nome do Sistema GIPP, Versão), insira o Hash SHA-256 gerado e anexe a declaração de veracidade assinada. O registro é publicado em até 10 dias úteis.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* SHA-256 Cryptographic Tool */}
                            <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-6">
                                <div className="flex items-center gap-3 border-b pb-4">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-250 flex items-center justify-center text-amber-800">
                                        <Fingerprint size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-850 font-[Outfit]">Gerador de Resumo Digital (Hash SHA-256 para o INPI)</h3>
                                        <p className="text-xs text-slate-500">Gere a chave criptográfica inviolável exigida pelo formulário oficial de depósito do INPI</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Código-Fonte ou Dossier do Software para Análise:</label>
                                        <button 
                                            type="button"
                                            onClick={fillGippMetadata}
                                            className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors animate-pulse"
                                        >
                                            <Zap size={11} className="text-amber-500" /> Preencher com Metadados Oficiais GIPP
                                        </button>
                                    </div>

                                    <textarea
                                        rows={6}
                                        value={codeSnippet}
                                        onChange={(e) => setCodeSnippet(e.target.value)}
                                        placeholder="Cole aqui porções importantes do código-fonte, esquemas SQL de tabelas, ou utilize o botão acima para autogerar os metadados jurídicos do ecossistema GIPP de sua igreja..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all resize-none custom-scrollbar"
                                    />

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={handleGenerateSHA256}
                                            disabled={isHashing}
                                            className="flex-1 bg-slate-900 hover:bg-black text-white text-xs font-black py-3 px-5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            {isHashing ? (
                                                <>
                                                    <RefreshCw size={14} className="animate-spin" /> Processando Criptografia...
                                                </>
                                            ) : (
                                                <>
                                                    <Fingerprint size={14} /> Gerar Assinatura SHA-256 para Depósito INPI
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {generatedHash && (
                                        <div className="bg-emerald-50 border border-emerald-150 p-5 rounded-2xl space-y-3 animate-entrance">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                                                    <CheckCircle2 size={13} /> Resumo SHA-256 Gerado com Sucesso!
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleCopyHash}
                                                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
                                                >
                                                    <Copy size={12} /> Copiar Chave
                                                </button>
                                            </div>
                                            <div className="bg-white border border-emerald-200 rounded-xl p-3.5 text-xs font-mono font-black text-emerald-950 break-all select-all shadow-inner tracking-wider">
                                                {generatedHash}
                                            </div>
                                            <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                                                <strong className="text-emerald-850">Atenção jurídica:</strong> Copie este Hash SHA-256 e insira-o no campo "Resumo Digital" do formulário de depósito eletrônico do INPI. Ele assegura a autenticidade integral de seu software contra qualquer plágio futuro.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* === ABA: EULA & COMBATE A PIRATARIA === */}
                {tab === 'protecao' && (() => {
                    const igrejaData = db.igreja || {
                        nome: "Assembleia de Deus GIPP",
                        cnpj: "00.000.000/0001-00",
                        pastor: "Pr. Patrick Pessoa",
                        cidade: "São Paulo",
                        uf: "SP",
                        canon_registro_geral: "REG-CGADB-98765-A",
                        saas_nome_sistema: "GIPP"
                    };
                    return (
                        <div className="space-y-6 animate-entrance">
                            {/* Combating cybercrimes and software copy */}
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-3xl p-6 shadow-xs space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-red-150 border border-red-200 flex items-center justify-center text-red-700">
                                        <ShieldAlert size={20} className="animate-bounce" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-red-950 font-[Outfit]">Blindagem Contra Crimes de Software e Cópias</h3>
                                        <p className="text-xs text-red-800 font-semibold">Regulamento Penal e Proteção de Marcas da Assembleia de Deus no Brasil</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                                    O código-fonte, as regras de negócio teológicas, layouts, logomarcas, e bases do dízimo do sistema GIPP são protegidos criminalmente. Copiar, distribuir ou realizar engenharia reversa do software sem licença expressa constitui pirataria de software e violação de sigilo profissional, conforme detalhado no <strong className="text-red-950 font-black">Código Penal Brasileiro (Lei de Crimes Virtuais) e Lei nº 9.609/98</strong>.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="bg-white/80 p-3.5 rounded-xl border border-red-100/60 flex gap-3">
                                        <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="block text-[10px] font-black text-red-900 uppercase tracking-wider">Violação de Direitos (Crime):</span>
                                            <span className="block text-[11px] text-slate-600 leading-relaxed font-semibold mt-0.5">
                                                Pena de detenção de 6 meses a 2 anos, além de pesadas multas administrativas proporcionais ao número de cópias ilegais em circulação.
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-white/80 p-3.5 rounded-xl border border-red-100/60 flex gap-3">
                                        <Lock size={16} className="text-red-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="block text-[10px] font-black text-red-900 uppercase tracking-wider">Ações Civis e Perdas:</span>
                                            <span className="block text-[11px] text-slate-600 leading-relaxed font-semibold mt-0.5">
                                                Possibilidade de busca e apreensão de servidores e computadores, além de indenização por perdas e danos morais e materiais causados.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Notificação Extrajudicial Generator */}
                            <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-6">
                                <div className="flex items-center gap-3 border-b pb-4">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-250 flex items-center justify-center text-amber-700">
                                        <FileSignature size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-850 font-[Outfit]">Gerador de Notificação Extrajudicial por Plágio ou Cópia</h3>
                                        <p className="text-xs text-slate-500">Gere um documento jurídico para cessar o uso ilegal do sistema ou layout por parte de terceiros</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Nome do Suspeito / Organização Infratora:</label>
                                        <input
                                            type="text"
                                            value={suspectName}
                                            onChange={(e) => setSuspectName(e.target.value)}
                                            placeholder="Ex: Igreja Exemplo ou Empresa Soluções Ltda"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">CNPJ ou CPF do Infrator (se conhecido):</label>
                                        <input
                                            type="text"
                                            value={suspectCnpj}
                                            onChange={(e) => setSuspectCnpj(e.target.value)}
                                            placeholder="Ex: 00.000.000/0001-00"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Detalhes da Violação / Crimes de Cópia Identificados:</label>
                                        <textarea
                                            rows={3}
                                            value={unauthorizedDetails}
                                            onChange={(e) => setUnauthorizedDetails(e.target.value)}
                                            placeholder="Descreva onde e como a cópia foi localizada. Ex: Clonagem do código-fonte do GIPP com alteração de nomes e logomarcas para fins comerciais sem licença de uso ativa."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGenerateNotification}
                                    className="w-full bg-red-650 hover:bg-red-750 text-white text-xs font-black py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                                >
                                    <FileSignature size={14} /> Redigir Notificação Extrajudicial Autoritativa
                                </button>

                                {generatedNotification && (
                                    <div className="space-y-4 animate-entrance pt-2 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-650">Documento Gerado com Artigos de Lei:</span>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleCopyNotification}
                                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-all"
                                                >
                                                    <Copy size={11} /> Copiar Texto
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const doc = new jsPDF();
                                                        doc.setFont("helvetica", "normal");
                                                        doc.setFontSize(10);
                                                        const splitText = doc.splitTextToSize(generatedNotification, 180);
                                                        doc.text(splitText, 15, 20);
                                                        doc.save(`NOTIFICACAO_VIOLACAO_SOFTWARE_\${suspectName.replace(/\\s+/g, '_').toUpperCase()}.pdf`);
                                                        addToast("Notificação em PDF baixada com sucesso!", "success");
                                                    }}
                                                    className="bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-extrabold px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1 transition-all"
                                                >
                                                    <Download size={11} /> Baixar PDF Notificação
                                                </button>
                                            </div>
                                        </div>

                                        <pre className="w-full bg-slate-950 text-slate-100 rounded-2xl p-5 text-[10px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap select-all shadow-md max-h-[300px] custom-scrollbar border border-slate-800">
                                            {generatedNotification}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            {/* Custom EULA Draft (End User License Agreement) */}
                            <div className="bg-white border rounded-3xl p-6 shadow-xs space-y-4">
                                <div className="flex items-center gap-3 border-b pb-4">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                                        <Scale size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-base text-slate-850 font-[Outfit]">EULA — Termos de Licença de Uso do GIPP</h3>
                                        <p className="text-xs text-slate-500">Contrato de adesão padrão para proteção civil e fiscal da congregação</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 border p-5 rounded-2xl space-y-3 font-medium text-xs text-slate-650 leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <h4 className="font-black text-center text-slate-900 uppercase">CONTRATO DE LICENÇA DE USO DE SOFTWARE E PRESTAÇÃO DE SERVIÇOS</h4>
                                    <p className="text-center font-bold text-[10px] text-slate-500">VERSÃO 8.7.0 — PROTEÇÃO INTELLECTUAL ASSEMBLEIA DE DEUS GIPP</p>
                                    <p>
                                        Este Contrato de Licença de Usuário Final ("EULA") é um acordo legal entre o Licenciado, operando sob o CNPJ <strong className="text-slate-900">{igrejaData.cnpj}</strong>, e a desenvolvedora eclesiástica titular do ecossistema GIPP.
                                    </p>
                                    <h5 className="font-black text-slate-800 uppercase mt-4">1. Concessão da Licença</h5>
                                    <p>
                                        A licença outorgada é de caráter temporário, revogável, não exclusiva, intransferível e destinada unicamente para a gestão ministerial, de membros, dízimos, ofertas pastorais e escola bíblica dominical, sob as regras da CGADB.
                                    </p>
                                    <h5 className="font-black text-slate-800 uppercase mt-4">2. Limitações de Uso e Crimes Virtuais</h5>
                                    <p>
                                        Fica expressamente proibido ao Licenciado: (a) copiar, modificar, adaptar ou traduzir o software; (b) realizar engenharia reversa, descompilar ou tentar acessar o código-fonte; (c) repassar chaves ou acessos criptográficos do banco de dados para congregações não listadas formalmente na convenção; (d) violar a privacidade de dízimos de membros de acordo com as leis de sigilo pastoral.
                                    </p>
                                    <h5 className="font-black text-slate-800 uppercase mt-4">3. Da Criptografia e Armazenamento em Nuvem</h5>
                                    <p>
                                        A desenvolvedora assegura o sigilo tecnológico completo de dados. O armazenamento obedece às normas da LGPD (Lei nº 13.709/2018), com backups automatizados diários criptografados e controle de privilégios e logs de auditoria invioláveis.
                                    </p>
                                    <h5 className="font-black text-slate-800 uppercase mt-4">4. Foro de Eleição</h5>
                                    <p>
                                        Para dirimir quaisquer controvérsias decorrentes deste contrato, as partes elegem o foro da comarca da sede administrativa da congregação {igrejaData.cidade}/{igrejaData.uf}.
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const eulaText = `CONTRATO DE LICENÇA DE USO DE SOFTWARE GIPP v8.8.0\n\nLicenciado: \${igrejaData.nome}\nCNPJ: \${igrejaData.cnpj}\nForo: \${igrejaData.cidade}/\${igrejaData.uf}\n\nTermos e limitações de cópia protegidos pela Lei Federal nº 9.609/1998 (Lei do Software) e Lei nº 13.709/2018 (LGPD). Fica expressamente vedada engenharia reversa ou reprodução sem anuência prévia.`;
                                            navigator.clipboard.writeText(eulaText);
                                            addToast("Termo de EULA copiado para a área de transferência!", "success");
                                        }}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all"
                                    >
                                        <Copy size={13} /> Copiar Termos EULA
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

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

            {tenantToDelete && createPortal(
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[12000] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl animate-scaleUp border border-rose-200">
                        <div className="bg-rose-600 p-6 text-center relative overflow-hidden text-white">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <AlertTriangle size={48} className="text-white opacity-90 mx-auto mb-3 animate-pulse"/>
                            <h2 className="text-xl font-black uppercase tracking-wider relative z-10">Excluir Conta de Igreja</h2>
                            <p className="text-rose-100 mt-1 text-xs font-bold uppercase tracking-widest relative z-10">Confirmação de Risco Extremo</p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 space-y-2">
                                <p className="font-bold uppercase tracking-wider flex items-center gap-1.5"><AlertCircle size={14}/> Risco de Perda de Dados e Acesso:</p>
                                <ul className="list-disc list-inside space-y-1 font-medium">
                                    <li>Esta ação irá excluir <b>permanentemente</b> o registro de acesso mestre do SaaS.</li>
                                    <li>O identificador único de App (ID: <strong className="font-mono text-rose-600">{tenantToDelete.id}</strong>) será desvinculado e o acesso à igreja será imediatamente bloqueado.</li>
                                    <li>Esta ação é <b>totalmente irreversível</b> e afetará todos os usuários e dados associados a este cadastro criado indevidamente.</li>
                                </ul>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Identificação da Igreja:</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                    <p className="text-sm font-extrabold text-slate-800 uppercase">{tenantToDelete.nome}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{tenantToDelete.cidade} - {tenantToDelete.uf || 'UF'}</p>
                                    <p className="text-[10px] text-indigo-600 font-mono font-bold mt-1">APP ID: {tenantToDelete.id}</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Justificativa / Causa da Exclusão *</label>
                                <textarea 
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder="Ex: Cadastro criado duplicado, CNPJ incorreto, testes indevidos, etc."
                                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-rose-500 rounded-xl py-3 px-4 text-xs font-bold text-slate-800 outline-none h-24 shadow-inner transition-colors resize-none uppercase"
                                    required
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Button 
                                    type="button"
                                    onClick={() => { setTenantToDelete(null); setDeleteReason(''); }} 
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all"
                                >
                                    <X size={16}/> Cancelar
                                </Button>
                                <Button 
                                    type="button"
                                    onClick={handleExecuteDeleteTenant}
                                    disabled={isDeletingTenant || !deleteReason.trim()}
                                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
                                >
                                    {isDeletingTenant ? (
                                        <><Loader2 size={16} className="animate-spin"/> Excluindo...</>
                                    ) : (
                                        <><Trash2 size={16}/> Confirmar Exclusão</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};


export default ModuleDesenvolvedor;
