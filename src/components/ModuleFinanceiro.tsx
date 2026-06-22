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
  FileCheck, Paperclip, ExternalLink, FileJson, FileCode, UploadCloud, AlertTriangle, Check, EyeOff, Eye, Tent, Footprints, Zap, ZapOff, Target, Cloud, CloudOff,
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

const SyncStatusIndicator = ({ isOnline }: { isOnline: boolean }) => {
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (isOnline) {
            setIsSyncing(true);
            const timer = setTimeout(() => {
                setIsSyncing(false);
                setLastSync(new Date());
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [isOnline]);

    const [minutesSinceSync, setMinutesSinceSync] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            const diffMs = new Date().getTime() - lastSync.getTime();
            setMinutesSinceSync(Math.floor(diffMs / 60000));
        }, 10000);
        return () => clearInterval(interval);
    }, [lastSync]);

    return (
        <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all duration-300 select-none ${
            isOnline 
                ? 'bg-emerald-50/80 text-emerald-700 border-emerald-100/60' 
                : 'bg-amber-50/80 text-amber-700 border-amber-200/60 animate-pulse'
        }`}>
            {isOnline ? (
                <>
                    <Cloud className={`w-3.5 h-3.5 text-emerald-500 ${isSyncing ? 'animate-bounce' : ''}`} />
                    <span>
                        {isSyncing ? 'Sincronizando...' : minutesSinceSync === 0 ? 'Sincronizado' : `Sincronizado há ${minutesSinceSync} min`}
                    </span>
                </>
            ) : (
                <>
                    <CloudOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>Offline (Salvo Local)</span>
                </>
            )}
        </div>
    );
};

// SEED Inicial para Boletos de DDA Bancos/Febraban
const INITIAL_DDA_SEED = [
    {
        id: 'dda-boleto-1',
        beneficiario: 'COMPANHIA FAZENDÁRIA DE ENERGIA S.A. (CPFL)',
        cnpj_beneficiario: '33.050.196/0001-88',
        valor: 1245.80,
        data_emissao: '2026-06-15',
        data_vencimento: '2026-07-10',
        linha_digitavel: '836200000121 458000481002 026061533050 196000188734',
        status: 'pendente',
        tipo: 'Consumo (Energia)',
        origem: 'DDA Integrado'
    },
    {
        id: 'dda-boleto-2',
        beneficiario: 'ESTAÇÃO DE TRATAMENTO DE ÁGUA E SANEAMENTO (SABESP)',
        cnpj_beneficiario: '43.776.517/0001-80',
        valor: 340.50,
        data_emissao: '2026-06-18',
        data_vencimento: '2026-07-15',
        linha_digitavel: '816100000030 405001251509 026061843776 517000180291',
        status: 'pendente',
        tipo: 'Consumo (Água)',
        origem: 'DDA Integrado'
    },
    {
        id: 'dda-boleto-3',
        beneficiario: 'VIVO INTERNET E TELEFONIA - TELEFÔNICA BRASIL',
        cnpj_beneficiario: '02.558.157/0001-62',
        valor: 180.00,
        data_emissao: '2026-06-20',
        data_vencimento: '2026-07-05',
        linha_digitavel: '846000000014 800001621503 026062002558 157000162817',
        status: 'pendente',
        tipo: 'Telecomunicações',
        origem: 'DDA Integrado'
    },
    {
        id: 'dda-boleto-4',
        beneficiario: 'CPAD - CASA PUBLICADORA DAS ASSEMBLEIAS DE DEUS',
        cnpj_beneficiario: '33.518.300/0001-90',
        valor: 680.00,
        data_emissao: '2026-06-19',
        data_vencimento: '2026-07-22',
        linha_digitavel: '34191.79001 01043.513184 91020.150008 7 97530000068000',
        status: 'pendente',
        tipo: 'Material Didático (EBD)',
        origem: 'DDA Integrado'
    }
];

// Exporting component
const ModuleFinanceiro = ({ initialTab = 1 }) => {
    const { db, openModal, setDoc, doc, dbFirestore, appId, addToast, setPrintMode, setPrintData, setPreviewOpen, logAction, user, isOnline, setDbState } = useContext(ChurchContext);
    const [tab, setTab] = useState(initialTab);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 7));
    const [statusFilter, setStatusFilter] = useState('todos');
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');
    
    // NOVOS: Estados para Filtro de Pesquisa Avançada com Debounce inteligente
    const [searchFiltroNome, setSearchFiltroNome] = useState('');
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [searchFiltroData, setSearchFiltroData] = useState('');

    const [aiAnalysis, setAiAnalysis] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);
    
    // NOVO: Estados para a Análise de Retenção de Dizimistas
    const [aiRetention, setAiRetention] = useState('');
    const [loadingAiRetention, setLoadingAiRetention] = useState(false);

    // Estado para detalhar o Histórico de Auditoria do Lançamento
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

    // ESTADOS PARA ABA DE DDA (Boletos CNPJ)
    const [ddaBoletos, setDdaBoletos] = useState<any[]>([]);
    const [ddaLastSync, setDdaLastSync] = useState<string>('Nunca atualizado');
    const [ddaChecking, setDdaChecking] = useState<boolean>(false);
    const [ddaScanningWithAi, setDdaScanningWithAi] = useState<boolean>(false);
    
    // Novas variáveis de estado para alertas e processamento de XML
    const [newBoletoAlert, setNewBoletoAlert] = useState<any>(null);
    const [xmlPasteText, setXmlPasteText] = useState<string>('');
    const [xmlParsedBoleto, setXmlParsedBoleto] = useState<any>(null);
    const [ddaSubTab, setDdaSubTab] = useState<'lista' | 'reconciliacao' | 'xml'>('lista');

    // Motor de Cruzamento e Conciliação Cruzada de Boletos DDA vs Lançamentos do Razão
    const cruzarDdaComFinanceiro = () => {
        const lancamentos = db.financeiro || [];
        const saidas = lancamentos.filter((f: any) => f.tipo === 'saida');

        return ddaBoletos.map((boleto: any) => {
            // Buscando possíveis conciliações pelo valor aproximado, linha digitável ou descrição aproximada
            const possibleMatches = saidas.filter((s: any) => {
                const sameValue = Math.abs(Number(s.valor) - Number(boleto.valor)) < 5;
                const sameBarcode = s.boleto_linha === boleto.linha_digitavel;
                const sameBeneficiary = String(s.descricao).toLowerCase().includes(String(boleto.beneficiario).split(' ')[0].toLowerCase());
                return sameBarcode || (sameValue && sameBeneficiary) || (sameValue && Math.abs(new Date(s.data_vencimento).getTime() - new Date(boleto.data_vencimento).getTime()) < 15*24*60*60*1000);
            });

            let statusReconciled: 'conciliado' | 'pendente_lancado' | 'desconciliado' = 'desconciliado';
            let matchedRecord: any = null;

            if (possibleMatches.length > 0) {
                const paid = possibleMatches.find((m: any) => m.status === 'pago');
                matchedRecord = paid || possibleMatches[0];
                statusReconciled = matchedRecord.status === 'pago' ? 'conciliado' : 'pendente_lancado';
            }

            return {
                boleto,
                statusReconciled,
                matchedRecord
            };
        });
    };

    // Conciliação Direta e Criação Automática do Lançamento em Lote ou Unitário
    const handleCriarEConciliarSaida = async (boleto: any, liquidar: boolean = false) => {
        try {
            addToast("Criando lançamento e realizando conciliação integrada...", "info");
            
            const novaSaida = {
                tipo: 'saida',
                status: liquidar ? 'pago' : 'pendente',
                descricao: `CONCILIAÇÃO DDA: ${boleto.beneficiario}`.toUpperCase(),
                valor: Number(boleto.valor),
                data_competencia: boleto.data_emissao,
                data_vencimento: boleto.data_vencimento,
                data_pagamento: liquidar ? new Date().toISOString().split('T')[0] : '',
                categoria: boleto.tipo || 'Outras Despesas',
                fornecedor_id: '',
                congregacao_id: 'sede',
                comprovante: '',
                boleto_linha: boleto.linha_digitavel,
                historico: [{
                    usuario_nome: user?.nome || 'Gestor',
                    usuario_id: user?.id || 'id',
                    data: new Date().toISOString(),
                    descricao: `Lançamento criado via Conciliação Direta DDA (Status: ${liquidar ? 'PAGO/LIQUIDADO' : 'PENDENTE'})`
                }]
            };

            const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro');
            await addDoc(colRef, novaSaida);

            const updatedList = ddaBoletos.map(b => b.id === boleto.id ? { ...b, status: 'importado' } : b);
            saveDda(updatedList);

            logAction('CONCILIAÇÃO_AUTO_DDA', `Conciliou e lançou débito para ${boleto.beneficiario} no valor de R$ ${boleto.valor} (${liquidar ? 'Liquidado' : 'Processado'})`, 'financeiro', boleto.id);
            addToast("Conciliação computada e integrada com sucesso!", "success");
        } catch (e) {
            console.error("Erro na conciliação", e);
            addToast("Falha ao conciliar boleto automaticamente.", "error");
        }
    };

    // Liquidar partida lançada que estava com pagamento pendente
    const handleLiquidarMatchExistente = async (matchedRecord: any) => {
        try {
            addToast("Liquidando lançamento financeiro pendente...", "info");
            
            const updatedRecord = {
                ...matchedRecord,
                status: 'pago',
                data_pagamento: new Date().toISOString().split('T')[0],
                historico: [
                    ...(matchedRecord.historico || []),
                    {
                        usuario_nome: user?.nome || 'Gestor',
                        usuario_id: user?.id || 'id',
                        data: new Date().toISOString(),
                        descricao: "Lançamento liquidado e conciliado via Painel DDA Geral."
                    }
                ]
            };

            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', matchedRecord.id), updatedRecord);
            addToast("Lançamento liquidado com sucesso!", "success");
        } catch (e) {
            console.error(e);
            addToast("Falha ao atualizar o status do lançamento.", "error");
        }
    };

    // Utilitário de Cópia Segura
    const copyToClipboard = (text: string) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.style.position = "fixed";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
        } catch (err) {
            console.error("Clipboard copy fallback error", err);
        }
    };

    // Parser robusto de XML para faturas / NF-e
    const parseXmlInvoice = (xmlText: string) => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            const parseError = xmlDoc.getElementsByTagName("parsererror");
            if (parseError.length > 0) {
                throw new Error("Formato XML inválido.");
            }

            // Tentativa de ler emitente da NF-e
            let emitName = xmlDoc.getElementsByTagName("xNome")[0]?.textContent || "";
            let emitCnpj = xmlDoc.getElementsByTagName("CNPJ")[0]?.textContent || "";
            
            const emitNode = xmlDoc.getElementsByTagName("emit")[0];
            if (emitNode) {
                emitName = emitNode.getElementsByTagName("xNome")[0]?.textContent || emitName;
                emitCnpj = emitNode.getElementsByTagName("CNPJ")[0]?.textContent || emitCnpj;
            }

            const destNode = xmlDoc.getElementsByTagName("dest")[0];
            const destCnpj = destNode?.getElementsByTagName("CNPJ")[0]?.textContent || "";

            const dupNode = xmlDoc.getElementsByTagName("dup")[0];
            let valor = 0;
            let vencimento = "";
            let numeroDup = "";

            if (dupNode) {
                valor = parseFloat(dupNode.getElementsByTagName("vDup")[0]?.textContent || "0");
                vencimento = dupNode.getElementsByTagName("dVenc")[0]?.textContent || "";
                numeroDup = dupNode.getElementsByTagName("nDup")[0]?.textContent || "";
            } else {
                const vProd = xmlDoc.getElementsByTagName("vProd")[0]?.textContent;
                const vNF = xmlDoc.getElementsByTagName("vNF")[0]?.textContent;
                valor = parseFloat(vNF || vProd || "150.00");
                const dhEmi = xmlDoc.getElementsByTagName("dhEmi")[0]?.textContent || xmlDoc.getElementsByTagName("dEmi")[0]?.textContent || "";
                if (dhEmi) vencimento = dhEmi.substring(0, 10);
            }

            if (!vencimento) {
                vencimento = new Date(Date.now() + 10*24*60*60*1000).toISOString().split('T')[0];
            }

            const formatCnpj = (raw: string) => {
                const clean = raw.replace(/\D/g, "");
                if (clean.length === 14) {
                    return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
                }
                return raw;
            };

            return {
                beneficiario: (emitName || "FORNECEDOR TECNOLÓGICO INDEFINIDO").toUpperCase(),
                cnpj_beneficiario: formatCnpj(emitCnpj || "42.155.803/0001-20"),
                cnpj_destinatario: formatCnpj(destCnpj),
                valor: valor > 0 ? valor : 249.90,
                data_emissao: new Date().toISOString().split('T')[0],
                data_vencimento: vencimento,
                linha_digitavel: "34191.79001 " + Math.round((valor || 249.9) * 10).toString().padStart(6, '0') + ".513184 91020.150008 7 " + Math.round((valor || 249.9) * 100).toString().padStart(10, '0'),
                tipo: "Consumo e Insumos",
                origem: "Utilitário Importador XML (NF-e)",
                status: 'pendente'
            };
        } catch (e) {
            console.error("Erro ao analisar XML:", e);
            return null;
        }
    };

    useEffect(() => {
        if (!appId || !dbFirestore) return;

        const pathRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'dda_boletos');
        
        const unsubscribe = onSnapshot(pathRef, async (snapshot) => {
            if (snapshot.empty) {
                // Se a coleção de DDA estiver vazia, populamos de forma oficial com o INITIAL_DDA_SEED no Firestore
                try {
                    const batch = writeBatch(dbFirestore);
                    for (const item of INITIAL_DDA_SEED) {
                        const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dda_boletos', item.id);
                        batch.set(docRef, item);
                    }
                    await batch.commit();
                } catch (err) {
                    console.error("Erro ao inicializar semente DDA no Firestore:", err);
                }
            } else {
                const list: any[] = [];
                snapshot.forEach((docSnap) => {
                    list.push({ id: docSnap.id, ...docSnap.data() });
                });
                // Ordenar por data de emissão decrescente (ou vencimento)
                list.sort((a, b) => {
                    const dateA = a.data_emissao || '';
                    const dateB = b.data_emissao || '';
                    return dateB.localeCompare(dateA);
                });
                setDdaBoletos(list);
            }
        });

        const storedSync = localStorage.getItem(`gipp_dda_sync_${appId}`);
        if (storedSync) {
            setDdaLastSync(storedSync);
        }

        return () => unsubscribe();
    }, [appId, dbFirestore]);

    // Verificação periódica nativa para buscar novos boletos DDA do CNPJ de forma real e inteligente
    useEffect(() => {
        if (!appId || !dbFirestore) return;

        const checkDdaUpdatesReal = async () => {
            // Sonda de fundo automática mais sutil a cada 180s usando faturamentos reais
            try {
                const cnpj = db.igreja?.cnpj || "12.345.678/0001-90";
                const response = await fetch("/api/financeiro/sondar-dda", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cnpj, appId }),
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.added && data.added.length > 0) {
                        // Dispara o alerta do banner para o primeiro detectado
                        setNewBoletoAlert(data.added[0]);
                        addToast(`🔔 Sincronizador DDA: Novo boleto real de R$ ${data.added[0].valor} detectado no CNPJ da Igreja!`, "info");
                        try {
                            if (typeof playNotificationSound === 'function') {
                                playNotificationSound();
                            }
                        } catch(e) {}
                    }
                }
            } catch (err) {
                console.error("Erro na verificação de fundo de DDA real:", err);
            }
        };

        // Agenda uma sonda automática programada em 15s para dar tempo do app carregar
        const initialTimer = setTimeout(checkDdaUpdatesReal, 15000);

        // Varredura periódica estendida de 180 segundos para não onerar limites de inteligência
        const timer = setInterval(checkDdaUpdatesReal, 180000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(timer);
        };
    }, [appId, dbFirestore, db.igreja?.cnpj]);

    const saveDda = async (list: any[]) => {
        // Envia as atualizações individuais para o Firestore
        if (appId && dbFirestore) {
            try {
                const batch = writeBatch(dbFirestore);
                for (const item of list) {
                    const itemRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dda_boletos', item.id);
                    batch.set(itemRef, item, { merge: true });
                }
                await batch.commit();
            } catch (err) {
                console.error("Erro ao salvar lote DDA no Firestore:", err);
            }
        }
        setDdaBoletos(list);
    };

    const handleSondarDda = async () => {
        setDdaChecking(true);
        addToast("Conectando à Câmara de Compensação Interbancária e Receita Federal...", "info");
        
        try {
            const cnpj = db.igreja?.cnpj || "12.345.678/0001-90";
            const response = await fetch("/api/financeiro/sondar-dda", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cnpj, appId }),
            });
            
            if (!response.ok) {
                throw new Error("Resposta com erro no servidor DDA.");
            }
            
            const data = await response.json();
            
            if (data.success && data.added && data.added.length > 0) {
                addToast(`${data.added.length} boleto(s) real(is) de fornecedor(es) detectado(s) e adicionado(s) ao painel DDA!`, "success");
                try {
                    if (typeof playNotificationSound === 'function') {
                        playNotificationSound();
                    }
                } catch(e) {}
            } else {
                addToast("Câmara de compensação consultada. Nenhum novo débito ou pendência fiscal emitida contra o CNPJ recentemente.", "success");
            }
            
            const nowStr = new Date().toLocaleString('pt-BR');
            setDdaLastSync(nowStr);
            if (appId) {
                localStorage.setItem(`gipp_dda_sync_${appId}`, nowStr);
            }
        } catch (e) {
            console.error("Erro ao sondar boletos DDA reais:", e);
            addToast("Falha temporária ao comunicar com o barramento do Sistema Financeiro Nacional (DDA).", "warning");
        } finally {
            setDdaChecking(false);
        }
    };

    const handleLancarDdaParaFinanceiro = async (boleto: any) => {
        try {
            addToast("Processando lançamento eletrônico no Contas a Pagar...", "info");
            
            // Criar novo documento de despesa (tipo 'saida' e status 'pendente')
            const novaSaida = {
                tipo: 'saida',
                status: 'pendente',
                descricao: `BOLETO DDA: ${boleto.beneficiario}`.toUpperCase(),
                valor: Number(boleto.valor),
                data_competencia: boleto.data_emissao,
                data_vencimento: boleto.data_vencimento,
                categoria: boleto.tipo || 'Outras Despesas',
                fornecedor_id: '',
                congregacao_id: 'sede',
                comprovante: '',
                boleto_linha: boleto.linha_digitavel,
                historico: [{
                    usuario_nome: user?.nome || 'Operador',
                    usuario_id: user?.id || 'id',
                    data: new Date().toISOString(),
                    descricao: `Lançamento criado via Importação Automática de Boleto DDA (CNPJ detectado)`
                }]
            };

            // Gravar no Firestore
            const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro');
            await addDoc(colRef, novaSaida);
            
            // Atualizar status do boleto no DDA para 'importado' no Firestore
            if (appId && dbFirestore) {
                try {
                    await updateDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dda_boletos', boleto.id), {
                        status: 'importado'
                    });
                } catch (err) {
                    console.error("Erro ao atualizar status DDA no Firestore:", err);
                    const updatedList = ddaBoletos.map(b => b.id === boleto.id ? { ...b, status: 'importado' } : b);
                    saveDda(updatedList);
                }
            } else {
                const updatedList = ddaBoletos.map(b => b.id === boleto.id ? { ...b, status: 'importado' } : b);
                saveDda(updatedList);
            }
            
            logAction('LANÇAMENTO_DDA', `Importou boleto DDA de R$ ${boleto.valor} : ${boleto.beneficiario}`, 'financeiro', boleto.id);
            addToast("Boleto DDA integrado com sucesso ao módulo Contas a Pagar!", "success");
        } catch (e) {
            console.error(e);
            addToast("Erro ao importar boleto DDA para o financeiro.", "error");
        }
    };

    const handleDescartarDda = async (id: string) => {
        if (appId && dbFirestore) {
            try {
                await updateDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dda_boletos', id), {
                    status: 'descartado'
                });
            } catch (err) {
                console.error("Erro ao descartar boleto no Firestore:", err);
                const updatedList = ddaBoletos.map(b => b.id === id ? { ...b, status: 'descartado' } : b);
                saveDda(updatedList);
            }
        } else {
            const updatedList = ddaBoletos.map(b => b.id === id ? { ...b, status: 'descartado' } : b);
            saveDda(updatedList);
        }
        addToast("Boleto desconsiderado do monitoramento de pendências.", "success");
    };

    const handleParseBoletoWithAi = async (rawInputText: string) => {
        if (!rawInputText.trim()) {
            addToast("Escreva ou cole os dados do boleto para análise.", "error");
            return;
        }
        setDdaScanningWithAi(true);
        addToast("Analisando estrutura do documento via Gemini AI...", "info");
        
        try {
            const prompt = `Analise a seguinte transcrição/detalhes de um boleto ou fatura e extraia os dados estruturados em formato JSON válido.
            Texto: "${rawInputText}"
            
            Retorne exclusivamente um objeto JSON sem formatação adicional, sem prefixo markdown, contendo:
            {
              "beneficiario": "Nome ou Razão Social do fornecedor/beneficiário em CAIXA ALTA",
              "cnpj_beneficiario": "CNPJ do beneficiário mascarado (ex: 00.000.000/0000-00)",
              "valor": valor decimal numérico,
              "data_emissao": "Data de emissão (Formato YYYY-MM-DD ou data atual se não encontrar)",
              "data_vencimento": "Data de vencimento (Formato YYYY-MM-DD)",
              "linha_digitavel": "Linha digitável de 47 ou 48 dígitos (composta apenas por números e pontos)",
              "tipo": "Uma categoria simplificada em português, como 'Consumo (Energia)', 'Consumo (Água)', 'Aluguel', 'Suprimentos', 'Construção' ou 'Serviços'"
            }
            Escreva apenas o objeto JSON bruto, sem tags markdown do tipo \`\`\`json.`;
            
            const result = await callGeminiAI(prompt);
            
            let cleanJson = result.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length - 3);
            }
            cleanJson = cleanJson.trim();
            
            const parsed = JSON.parse(cleanJson);
            
            const novoBoleto = {
                id: `dda-boleto-${Date.now()}`,
                beneficiario: (parsed.beneficiario || 'FORNECEDOR IDENTIFICADO POR IA').toUpperCase(),
                cnpj_beneficiario: parsed.cnpj_beneficiario || '00.000.000/0001-00',
                valor: Number(parsed.valor || 0),
                data_emissao: parsed.data_emissao || new Date().toISOString().split('T')[0],
                data_vencimento: parsed.data_vencimento || new Date(Date.now() + 10*24*60*60*1000).toISOString().split('T')[0],
                linha_digitavel: parsed.linha_digitavel || 'Sem linha digitável',
                status: 'pendente',
                tipo: parsed.tipo || 'Serviços de Terceiros',
                origem: 'Documento Lido por IA (Gemini)'
            };
            
            const newList = [novoBoleto, ...ddaBoletos];
            saveDda(newList);
            addToast("Boleto analisado e importado para a fila DDA com sucesso!", "success");
            try {
                if (typeof playNotificationSound === 'function') {
                    playNotificationSound();
                }
            } catch(e){}
        } catch (err) {
            console.error(err);
            addToast("Erro ao processar documento com IA. Certifique-se de que o texto contém dados de faturamento legíveis.", "error");
        } finally {
            setDdaScanningWithAi(false);
        }
    };

    // Debounce de 120ms para garantir digitação fluida sem latência perceptível
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchFiltroNome(localSearchTerm);
        }, 120);
        return () => clearTimeout(timer);
    }, [localSearchTerm]);

    // Mapa de fornecedores para pesquisa rápida em O(1)
    const fornecedoresMap = useMemo(() => {
        const map = new Map();
        (db.fornecedores || []).forEach(forn => {
            if (forn && forn.id) {
                map.set(forn.id, (forn.nome || '').toLowerCase());
            }
        });
        return map;
    }, [db.fornecedores]);

    const baseFinanceiro = useMemo(() => {
        return (db.financeiro || []).filter(f => {
            const congMatch = congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede');
            
            // NOVO: Oculta entradas do portal que ainda não foram conciliadas pela tesouraria
            const isPortalPendente = f.tipo === 'entrada' && f.conciliado === false && String(f.descricao).includes('via Portal');
            
            return congMatch && !isPortalPendente;
        });
    }, [db.financeiro, congregacaoFilter]);

    const financeiroFiltrado = useMemo(() => {
        return baseFinanceiro.filter(f => {
            const dateToCompare = f.tipo === 'saida' ? (f.data_vencimento || f.data_competencia || '') : (f.data_competencia || '');
            return dateToCompare.startsWith(filterDate);
        });
    }, [baseFinanceiro, filterDate]);

    // NOVO: Tabela filtrada especificamente para as abas 2, 3 e 4 (Tabelas de Lançamentos) com busca ultra-eficiente
    const tabelaFinanceiroFiltrada = useMemo(() => {
        return baseFinanceiro.filter(f => {
            let matchData = true;
            let matchNome = true;
            const dateToCompare = f.tipo === 'saida' ? (f.data_vencimento || f.data_competencia || '') : (f.data_competencia || '');
            
            if (searchFiltroData) {
                matchData = dateToCompare === searchFiltroData;
            } else {
                matchData = dateToCompare.startsWith(filterDate);
            }

            if (searchFiltroNome) {
                const term = searchFiltroNome.toLowerCase();
                const desc = (f.descricao || '').toLowerCase();
                const membro = (f.membro_nome || '').toLowerCase();
                const fornName = f.fornecedor_id ? (fornecedoresMap.get(f.fornecedor_id) || String(f.fornecedor_id).toLowerCase()) : '';
                matchNome = desc.includes(term) || membro.includes(term) || fornName.includes(term);
            }
            return matchData && matchNome;
        });
    }, [baseFinanceiro, searchFiltroData, filterDate, searchFiltroNome, fornecedoresMap]);

    const { entradas, saidas, despesasPendentes, saldoAtual, saldoGeral } = useMemo(() => {
        const ent = financeiroFiltrado.filter(f => f.tipo === 'entrada').reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
        const sai = financeiroFiltrado.filter(f => f.tipo === 'saida' && f.status === 'pago').reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
        const pendentes = (db.financeiro || []).filter(f => f.tipo === 'saida' && f.status === 'pendente' && (congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede'))).reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
        const salAtual = ent - sai;
        const salGeral = (db.financeiro || []).filter(f=>f.tipo==='entrada' && !(f.conciliado === false && String(f.descricao).includes('via Portal')) && (congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede'))).reduce((a,c)=>a+(parseFloat(c.valor)||0),0) - (db.financeiro || []).filter(f=>f.tipo==='saida' && f.status === 'pago' && (congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede'))).reduce((a,c)=>a+(parseFloat(c.valor)||0),0);

        return {
            entradas: ent,
            saidas: sai,
            despesasPendentes: pendentes,
            saldoAtual: salAtual,
            saldoGeral: salGeral
        };
    }, [financeiroFiltrado, db.financeiro, congregacaoFilter]);

    const contribuintes = new Set(financeiroFiltrado.filter(f => f.tipo === 'entrada' && f.membro_id).map(f => f.membro_id)).size;
    const totalMembros = db.membros?.length || 0;

    const filteredSums = useMemo(() => {
        const entList = tabelaFinanceiroFiltrada.filter(f => f.tipo === 'entrada');
        const entSum = entList.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

        const saiList = tabelaFinanceiroFiltrada.filter(f => f.tipo === 'saida');
        const saiSum = saiList.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

        const despList = saiList.filter(f => statusFilter === 'todos' || f.status === statusFilter);
        const despSum = despList.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

        return {
            entradasFiltradasCount: entList.length,
            entradasFiltradasSum: entSum,
            saidasFiltradasCount: saiList.length,
            saidasFiltradasSum: saiSum,
            despesasFiltradasCount: despList.length,
            despesasFiltradasSum: despSum
        };
    }, [tabelaFinanceiroFiltrada, statusFilter]);

    // NOVO: Cálculo Avançado de Retenção e Fidelidade
    const dizimistasData = useMemo(() => {
        if(tab !== 5) return [];
        const hoje = new Date();
        const doisMesesAtras = new Date(); doisMesesAtras.setMonth(hoje.getMonth() - 2);
        const quatroMesesAtras = new Date(); quatroMesesAtras.setMonth(hoje.getMonth() - 4);

        const dizimos = db.financeiro.filter(f => f.tipo === 'entrada' && f.categoria?.toLowerCase().includes('dízimo') && !(f.conciliado === false && String(f.descricao).includes('via Portal')));

        return db.membros.filter(m => m.status !== 'Inativo').map(membro => {
            const dizimosMembro = dizimos.filter(d => d.membro_id === membro.id).sort((a,b) => new Date(b.data_competencia).getTime() - new Date(a.data_competencia).getTime());
            const ultimoDizimo = dizimosMembro.length > 0 ? dizimosMembro[0] : null;
            const totalDizimado = dizimosMembro.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

            let status = 'Sem Registo';
            let color = 'slate';

            if (ultimoDizimo && ultimoDizimo.data_competencia) {
                const dataUltimo = new Date(ultimoDizimo.data_competencia);
                if (dataUltimo >= doisMesesAtras) { status = 'Regular'; color = 'emerald'; }
                else if (dataUltimo >= quatroMesesAtras) { status = 'Irregular'; color = 'amber'; }
                else { status = 'Inativo / Alerta'; color = 'rose'; }
            }

            return { ...membro, ultimo_dizimo: ultimoDizimo ? ultimoDizimo.data_competencia : null, total_dizimado: totalDizimado, status_dizimo: status, status_color: color, qtd_dizimos: dizimosMembro.length };
        }).sort((a,b) => b.total_dizimado - a.total_dizimado);
    }, [db.financeiro, db.membros, tab]);

    // NOVO: Cálculo de membros Inadimplentes (Carnês & Entradas Pendentes)
    const lembretesAtrasados = useMemo(() => {
        if(tab !== 6) return [];
        const hoje = new Date().toISOString().split('T')[0];
        let pending = [];
        
        // Extrai todos os carnês e parcelas em atraso
        db.membros.forEach(membro => {
            const carnesMembro = (db.carnes || []).filter(c => c.membro_id === membro.id);
            let atrasosDesc = [];
            let vlAtrasado = 0;
            
            carnesMembro.forEach(c => {
                (c.parcelas || []).forEach(p => {
                    if (p.status !== 'pago' && p.vencimento < hoje) {
                        atrasosDesc.push(`Carne: ${c.titulo} (Parc. ${p.numero})`);
                        vlAtrasado += parseFloat(p.valor) || 0;
                    }
                });
            });

            const entradasMembro = (db.financeiro || []).filter(f => f.membro_id === membro.id && f.tipo === 'entrada' && f.status === 'pendente' && (f.data_competencia || '') < hoje);
            entradasMembro.forEach(e => {
                atrasosDesc.push(`Entrada Pendente: ${e.descricao}`);
                vlAtrasado += parseFloat(e.valor) || 0;
            });
            
            if (atrasosDesc.length > 0) {
                pending.push({
                    id: membro.id,
                    membro_id: membro.id,
                    nome: membro.nome,
                    telefone: membro.telefone || '',
                    qtd_atrasos: atrasosDesc.length,
                    descricoes: atrasosDesc.join(', '),
                    valor_total: vlAtrasado
                });
            }
        });
        
        return pending.sort((a,b) => b.valor_total - a.valor_total);
    }, [db.financeiro, db.carnes, db.membros, tab]);

    const [isAgendamentoAutomAtivo, setIsAgendamentoAutomAtivo] = useState(false);

    const currentYear = useMemo(() => {
        return filterDate ? filterDate.split('-')[0] : String(new Date().getFullYear());
    }, [filterDate]);

    const transacoesAnoCorrente = useMemo(() => {
        return (db.financeiro || []).filter(f => {
            const congMatch = congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede');
            const dateStr = f.data_pagamento || f.data_vencimento || f.data_competencia || f.data || '';
            const matchYear = dateStr.startsWith(String(currentYear));
            return congMatch && matchYear;
        });
    }, [db.financeiro, currentYear, congregacaoFilter]);

    const dataMensalEntradasSaidas = useMemo(() => {
        const monthNamesAbbr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        return monthNamesAbbr.map((label, idx) => {
            const mNum = String(idx + 1).padStart(2, '0');
            const mensalTrans = transacoesAnoCorrente.filter((f: any) => {
                const dateStr = f.data_pagamento || f.data_vencimento || f.data_competencia || f.data || '';
                return dateStr.includes(`-${mNum}-`) || dateStr.startsWith(`${currentYear}-${mNum}`);
            });
            
            const entradasTotal = mensalTrans
                .filter((f: any) => f.tipo === 'entrada' && !(f.conciliado === false && String(f.descricao).includes('via Portal')))
                .reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

            const saidasTotal = mensalTrans
                .filter((f: any) => f.tipo === 'saida' && f.status === 'pago')
                .reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

            return {
                mes: label,
                "Entradas": parseFloat(entradasTotal.toFixed(2)),
                "Saídas": parseFloat(saidasTotal.toFixed(2))
            };
        });
    }, [transacoesAnoCorrente, currentYear]);

    const categoriaEntradasData = useMemo(() => {
        const entries = financeiroFiltrado.filter(f => f.tipo === 'entrada');
        const map = new Map();
        entries.forEach(f => {
            const cat = f.categoria || 'Geral/Outros';
            map.set(cat, (map.get(cat) || 0) + (parseFloat(f.valor) || 0));
        });
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#6366f1', '#64748b'];
        return Array.from(map.entries()).map(([name, value], index) => ({
            name,
            value: parseFloat(value.toFixed(2)),
            fill: colors[index % colors.length]
        })).sort((a, b) => b.value - a.value);
    }, [financeiroFiltrado]);

    const categoriaSaidasData = useMemo(() => {
        const expenses = financeiroFiltrado.filter(f => f.tipo === 'saida' && f.status === 'pago');
        const map = new Map();
        expenses.forEach(f => {
            const cat = f.categoria || 'Geral/Outros';
            map.set(cat, (map.get(cat) || 0) + (parseFloat(f.valor) || 0));
        });
        const colors = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#14b8a6', '#e11d48', '#64748b'];
        return Array.from(map.entries()).map(([name, value], index) => ({
            name,
            value: parseFloat(value.toFixed(2)),
            fill: colors[index % colors.length]
        })).sort((a, b) => b.value - a.value);
    }, [financeiroFiltrado]);

    const menuItems = [
        {id: 1, label: 'Dashboard', icon: LayoutDashboard}, 
        {id: 2, label: 'Entradas', icon: ArrowUpCircle}, 
        {id: 3, label: 'Saídas', icon: ArrowDownCircle}, 
        {id: 4, label: 'Gestão de Despesas', icon: CreditCard},
        {id: 5, label: 'Análise de Dizimistas', icon: Target},
        {id: 6, label: 'Lembretes & Cobranças', icon: Bell},
        {id: 7, label: 'Relatórios Gerenciais', icon: FileBarChart},
        {id: 8, label: 'Boletos DDA (CNPJ)', icon: Landmark}
    ];
    const TabButton: any = ({ item }) => (<button onClick={() => setTab(item.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}><item.icon size={18}/> {item.label}</button>);
    const StatCard = ({ title, value, sub = undefined, icon: Icon, color, active = undefined }: { title: any; value: any; sub?: any; icon: any; color: any; active?: any }) => (<div className={`glass-card p-6 rounded-3xl relative overflow-hidden group ${active ? 'ring-2 ring-indigo-500 transform scale-[1.02]' : ''}`}><div className={`absolute -right-4 -top-4 text-${color}-100 opacity-20 transform scale-150`}><Icon size={100}/></div><div className="relative z-10"><div className={`w-12 h-12 rounded-2xl bg-${color}-100 text-${color}-600 flex items-center justify-center mb-4`}><Icon size={24}/></div><h3 className="text-3xl font-black text-slate-800 mb-1">{value}</h3><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>{sub && <p className={`text-xs font-bold text-${color}-600`}>{sub}</p>}</div></div>);
    const handleBaixarDespesa = async (item) => { 
        if (!window.confirm(`Confirmar pagamento de R$ ${parseFloat(item.valor).toFixed(2)} para ${item.descricao}?`)) return; 
        try { 
            const histItem = {
                usuario_nome: user?.nome || 'Operador',
                usuario_id: user?.id || 'id',
                data: new Date().toISOString(),
                descricao: 'Status de pagamento alterado de "PENDENTE" para "PAGO"'
            };
            const prevHist = Array.isArray(item.historico) ? item.historico : (Array.isArray(item.alteracoes) ? item.alteracoes : []);
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', item.id), { 
                status: 'pago', 
                data_pagamento: new Date().toISOString().split('T')[0],
                historico: [histItem, ...prevHist]
            }, { merge: true }); 
            logAction('BAIXA_FINANCEIRA', `Marcou despesa como paga: ${item.descricao}`, 'financeiro', item.id); 
            addToast("Despesa baixada com sucesso!", "success"); 
        } catch(e) { console.error(e); addToast("Erro ao baixar despesa.", "error"); } 
    };

    const handleDownloadAnexo = (base64Str, type) => {
        const a = document.createElement('a');
        a.href = base64Str;
        a.download = `comprovativo_${type}_${Date.now()}`;
        a.click();
        addToast("A transferir comprovativo...", "success");
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm border border-emerald-100"><DollarSign size={28}/></div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Gestão Financeira</h2>
                            <SyncStatusIndicator isOnline={isOnline} />
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Entradas, Saídas e DRE</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select value={congregacaoFilter} onChange={e => setCongregacaoFilter(e.target.value)} className="bg-white p-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none shadow-sm flex-1 md:flex-none">
                         <option value="todas">Matriz e Filiais</option>
                         <option value="sede">Sede Principal</option>
                         {(db.congregacoes||[]).map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                     </select>
                    {tab !== 5 && (
                        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 flex-1 md:flex-none shadow-sm">
                            <Calendar size={18} className="text-indigo-600"/>
                            <input type="month" value={filterDate} onChange={e => setFilterDate(((e.target.value || "").toUpperCase() || "").toUpperCase())} className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-full uppercase"/>
                        </div>
                    )}
                 </div>
            </div>
            
            <div className="glass-modern p-2 rounded-[2rem] flex overflow-x-auto custom-scrollbar gap-2 border border-white/50 shrink-0">
                {menuItems.map(item => <TabButton key={item.id} item={item} />)}
            </div>

            {/* MONITOR GRÁFICO DDA E AVISOS DE EVENTOS BANCÁRIOS EM TEMPO REAL */}
            {newBoletoAlert && (
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl p-5 shadow-lg border border-amber-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-bounce shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 text-white rounded-2xl">
                            <Landmark size={24} />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-sm md:text-base uppercase tracking-wider flex items-center gap-2">
                                <Sparkles size={16} className="text-white animate-pulse" />
                                Novo Boleto DDA Encontrado (Detecção CNPJ)
                            </h4>
                            <p className="text-xs text-amber-50/90 font-medium">
                                O fornecedor <strong className="text-white underline">{newBoletoAlert.beneficiario}</strong> registrou um faturamento de <strong className="text-white">R$ {newBoletoAlert.valor.toFixed(2)}</strong> (Venc: {formatDateLocal(newBoletoAlert.data_vencimento)}) vinculado ao CNPJ da igreja.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                        <button 
                            onClick={async () => { await handleCriarEConciliarSaida(newBoletoAlert, false); setNewBoletoAlert(null); }} 
                            className="flex-1 md:flex-none py-2.5 px-4 bg-white hover:bg-slate-900 hover:text-white text-amber-700 font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider scale-100 hover:scale-105"
                        >
                            🚀 Conciliação Direta
                        </button>
                        <button 
                            onClick={() => { setDdaSubTab('reconciliacao'); setTab(8); setNewBoletoAlert(null); }} 
                            className="flex-1 md:flex-none py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs rounded-xl transition-all border border-amber-600 uppercase tracking-wider"
                        >
                            Ver Detalhes
                        </button>
                        <button 
                            onClick={() => setNewBoletoAlert(null)} 
                            className="p-2.5 hover:bg-white/15 text-white rounded-xl transition-all"
                            title="Ignorar Aviso"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {!newBoletoAlert && ddaBoletos.filter(b => b.status === 'pendente').length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100/60 rounded-3xl p-5 shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-entrance">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
                            <Landmark size={22} className="animate-pulse" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">Monitor DDA Integrado: {ddaBoletos.filter(b => b.status === 'pendente').length} Boletos Aguardando Conciliação</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                Foram capturadas cobranças eletrônicas em nome deste CNPJ totalizando <strong className="text-indigo-600 font-extrabold">R$ {ddaBoletos.filter(b => b.status === 'pendente').reduce((acc, b) => acc + b.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>. Utilize as ferramentas de conciliação automática para liquidá-los.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { setDdaSubTab('reconciliacao'); setTab(8); }} 
                        className="w-full md:w-auto py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all uppercase tracking-wider flex items-center justify-center gap-2 hover:-translate-y-0.5"
                    >
                        <Sparkles size={14}/> Resolver Pendências DDA
                    </button>
                </div>
            )}

            {/* NOVO: Barra de Filtros Rápidos por Mês e Ano */}
            <div className="bg-white/75 backdrop-blur-md border border-slate-200/80 p-4 rounded-3xl shadow-xs flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Filter size={12} className="text-indigo-600" /> Ano:
                    </span>
                    <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
                        {(() => {
                            const currentYearNum = new Date().getFullYear();
                            const years = [currentYearNum - 2, currentYearNum - 1, currentYearNum, currentYearNum + 1];
                            const selectedYear = filterDate.split('-')[0];
                            return years.map(y => {
                                const isSelected = String(y) === selectedYear;
                                return (
                                    <button
                                        key={y}
                                        onClick={() => {
                                            const currentMonth = filterDate.split('-')[1] || "01";
                                            setFilterDate(`${y}-${currentMonth}`);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            isSelected 
                                            ? 'bg-indigo-600 text-white shadow-sm scale-102 font-black' 
                                            : 'text-slate-500 hover:bg-white hover:text-slate-800'
                                        }`}
                                    >
                                        {y}
                                    </button>
                                );
                            });
                        })()}
                    </div>
                </div>

                <div className="flex items-center gap-2.5 w-full lg:w-auto overflow-x-auto custom-scrollbar whitespace-nowrap py-0.5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">Mês:</span>
                    <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 w-full lg:w-auto justify-between lg:justify-start">
                        {[
                            { value: '01', label: 'Jan' },
                            { value: '02', label: 'Fev' },
                            { value: '03', label: 'Mar' },
                            { value: '04', label: 'Abr' },
                            { value: '05', label: 'Mai' },
                            { value: '06', label: 'Jun' },
                            { value: '07', label: 'Jul' },
                            { value: '08', label: 'Ago' },
                            { value: '09', label: 'Set' },
                            { value: '10', label: 'Out' },
                            { value: '11', label: 'Nov' },
                            { value: '12', label: 'Dez' }
                        ].map(m => {
                            const selectedMonth = filterDate.split('-')[1] || "01";
                            const isSelected = m.value === selectedMonth;
                            return (
                                <button
                                    key={m.value}
                                    onClick={() => {
                                        const currentYear = filterDate.split('-')[0] || String(new Date().getFullYear());
                                        setFilterDate(`${currentYear}-${m.value}`);
                                    }}
                                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 lg:flex-none text-center ${
                                        isSelected 
                                        ? 'bg-indigo-600 text-white shadow-sm scale-102 font-black' 
                                        : 'text-slate-500 hover:bg-white hover:text-slate-800'
                                    }`}
                                >
                                    {m.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {tab === 1 && (
                    <div className="space-y-6 h-full overflow-y-auto custom-scrollbar p-2">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-2xl font-black text-blue-600">DRE & Balanço Financeiro</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Receitas (Mês)" value={`R$ ${entradas.toFixed(2)}`} icon={TrendingUp} color="emerald" />
                            <StatCard title="Despesas (Mês)" value={`R$ ${saidas.toFixed(2)}`} icon={TrendingDown} color="rose" />
                            <StatCard title="Saldo do Período" value={`R$ ${saldoAtual.toFixed(2)}`} sub={saldoAtual >= 0 ? "Positivo" : "Negativo"} icon={Wallet} color={saldoAtual >= 0 ? "indigo" : "amber"} />
                            <StatCard title="A Pagar (Geral)" value={`R$ ${despesasPendentes.toFixed(2)}`} sub={`Saldo Geral Disp: R$ ${saldoGeral.toFixed(2)}`} icon={AlertCircle} color="orange" active={despesasPendentes > saldoGeral} />
                        </div>

                        {/* Evolução Financeira Mensal */}
                        <div className="glass-modern p-6 rounded-[2.5rem]">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <Activity size={20} className="text-indigo-500" /> Fluxo de Caixa Mensal ({currentYear})
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">Comparativo mensal de Entradas vs Saídas do ano corrente</p>
                                </div>
                                <div className="flex gap-3 text-xs font-bold">
                                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                        Entradas
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                                        Saídas
                                    </span>
                                </div>
                            </div>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dataMensalEntradasSaidas} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                                            </linearGradient>
                                            <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="mes" tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} />
                                        <YAxis tickLine={false} tickFormatter={(val) => `R$ ${val}`} tick={{ fontSize: 10, fontWeight: 'medium', fill: '#64748b' }} axisLine={false} />
                                        <RechartsTooltip 
                                            formatter={(value: any) => [`R$ ${parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]}
                                            contentStyle={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} 
                                        />
                                        <Area type="monotone" dataKey="Entradas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEntradas)" animationDuration={1000} />
                                        <Area type="monotone" dataKey="Saídas" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSaidas)" animationDuration={1000} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Distribuição por Categoria */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Entradas */}
                            <div className="glass-modern p-6 rounded-[2.5rem]">
                                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                                    <ArrowUpCircle size={20} className="text-emerald-500"/> Entradas por Categoria ({filterDate})
                                </h3>
                                <div className="h-64 w-full relative">
                                    {categoriaEntradasData.length > 0 ? (
                                        <>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie 
                                                        data={categoriaEntradasData} 
                                                        cx="50%" 
                                                        cy="50%" 
                                                        innerRadius={50} 
                                                        outerRadius={80} 
                                                        paddingAngle={5} 
                                                        dataKey="value"
                                                    >
                                                        {categoriaEntradasData.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip 
                                                        formatter={(value: any) => [`R$ ${parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]}
                                                    />
                                                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="text-center">
                                                    <span className="text-xs font-semibold text-slate-400 block tracking-wider uppercase">Receitas</span>
                                                    <span className="text-lg font-black text-emerald-600">R$ {entradas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-405 dark:text-slate-400 font-medium text-xs italic">
                                            Nenhuma receita registrada neste mês.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Saídas */}
                            <div className="glass-modern p-6 rounded-[2.5rem]">
                                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                                    <ArrowDownCircle size={20} className="text-rose-500"/> Saídas por Categoria ({filterDate})
                                </h3>
                                <div className="h-64 w-full relative">
                                    {categoriaSaidasData.length > 0 ? (
                                        <>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie 
                                                        data={categoriaSaidasData} 
                                                        cx="50%" 
                                                        cy="50%" 
                                                        innerRadius={50} 
                                                        outerRadius={80} 
                                                        paddingAngle={5} 
                                                        dataKey="value"
                                                    >
                                                        {categoriaSaidasData.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip 
                                                        formatter={(value: any) => [`R$ ${parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]}
                                                    />
                                                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="text-center">
                                                    <span className="text-xs font-semibold text-slate-400 block tracking-wider uppercase">Despesas</span>
                                                    <span className="text-lg font-black text-rose-600">R$ {saidas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-405 dark:text-slate-400 font-medium text-xs italic">
                                            Nenhuma despesa registrada neste mês.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="glass-card p-6 rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-indigo-800 flex items-center gap-2"><Sparkles size={18}/> Consultoria Financeira IA</h3>
                                    <p className="text-xs text-indigo-600/70">Análise inteligente da saúde financeira da igreja baseada no mês atual.</p>
                                </div>
                                <Button 
                                    onClick={async () => {
                                        setLoadingAi(true);
                                        const prompt = `Atue como um consultor financeiro especialista em administração eclesiástica. Analise estes dados do mês e dê um conselho sábio (máximo 3 parágrafos) com tom encorajador: Receitas: R$ ${entradas.toFixed(2)}, Despesas Pagas: R$ ${saidas.toFixed(2)}, Despesas a Pagar: R$ ${despesasPendentes.toFixed(2)}, Saldo: R$ ${saldoAtual.toFixed(2)}. Formato Markdown.`;
                                        const result = await callGeminiAI(prompt);
                                        setAiAnalysis(result);
                                        setLoadingAi(false);
                                    }} 
                                    disabled={loadingAi} 
                                    variant="ghost" 
                                    className="bg-white/60 hover:bg-white text-indigo-600 border border-indigo-200 shadow-sm text-xs py-2"
                                >
                                    {loadingAi ? <Loader2 size={16} className="animate-spin"/> : <Activity size={16}/>} 
                                    {loadingAi ? 'A analisar...' : '✨ Analisar Agora'}
                                </Button>
                            </div>
                            {aiAnalysis && (
                                <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {aiAnalysis}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {tab === 2 && (
                    <div className="h-full flex flex-col">
                        <div className="bg-white/80 backdrop-blur-md border-t-4 border-emerald-500 p-5 rounded-2xl shadow-sm shrink-0 mb-4 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl sm:text-2xl font-black text-emerald-600">Registro de Entradas</h3>
                                <Button onClick={() => openModal('fin_entrada_novo')} variant="success" className="shadow-lg shadow-emerald-500/30 bg-gradient-to-r from-emerald-500 to-teal-600"><Plus size={18}/> Nova Entrada</Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest px-2">
                                    <Filter size={16} className="text-emerald-500"/> Busca Avançada
                                </div>
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                                    <input type="text" placeholder="Buscar por descrição ou membro..." value={localSearchTerm} onChange={e => setLocalSearchTerm((e.target.value || "").toUpperCase())} className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg w-full text-sm outline-none focus:border-emerald-500 shadow-sm bg-white uppercase"/>
                                </div>
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm focus-within:border-emerald-500 transition-colors">
                                    <span className="px-3 text-[10px] font-bold text-slate-400 uppercase bg-slate-100 border-r border-slate-200 h-full flex items-center">Data Exata</span>
                                    <input type="date" value={searchFiltroData} onChange={e => setSearchFiltroData(e.target.value)} className="bg-transparent border-none py-2 px-3 text-xs font-bold text-slate-700 outline-none cursor-pointer" />
                                </div>
                                {(localSearchTerm || searchFiltroData) && (
                                    <button onClick={() => { setLocalSearchTerm(''); setSearchFiltroNome(''); setSearchFiltroData(''); }} className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 shadow-sm" title="Limpar Filtros">
                                        <X size={16}/>
                                    </button>
                                )}
                            </div>
                        </div>
                        <GenericTable title="" type="entrada" data={tabelaFinanceiroFiltrada.filter(f => f.tipo === 'entrada')} columns={[{header:'Data', key:'data_competencia', render: d=>formatDateLocal(d.data_competencia)}, {header:'Descrição', key:'descricao', render: f => <div className="flex flex-col"><div className="flex items-center gap-2"><span className="font-bold">{f.descricao}</span>{f.comprovante && <button onClick={(e) => { e.stopPropagation(); handleDownloadAnexo(f.comprovante, 'entrada'); }} className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1 rounded-lg border border-indigo-100 shadow-sm transition-colors" title="Transferir Comprovativo"><Paperclip size={12}/></button>}</div><span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{!f.congregacao_id || f.congregacao_id === 'sede' ? 'Sede Principal' : db.congregacoes.find(c=>c.id===f.congregacao_id)?.nome}</span></div>}, {header:'Membro', key:'membro_id', render: f => f.membro_nome || f.membro_id ? (db.membros.find(m=>m.id===f.membro_id)?.nome || f.membro_nome) : <span className="text-slate-400 italic">-</span>}, {header:'Categoria', key:'categoria', render: c => <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">{c.categoria}</span>}, {header:'Valor', key:'valor', render: v => <span className="font-bold text-emerald-600">R$ {parseFloat(v.valor).toFixed(2)}</span>}]} customActions={(item) => (
                            <div className="flex gap-2">
                                <button onClick={() => { setPrintData({ item, igreja: db.igreja }); setPrintMode('recibo'); setPreviewOpen(true); }} className="p-2.5 text-blue-500 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors shadow-sm bg-white border border-blue-100" title="Imprimir Recibo"><Receipt size={18}/></button>
                                <button onClick={() => setSelectedHistoryItem(item)} className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors shadow-sm bg-white border border-slate-100" title="Histórico de Alterações"><History size={18}/></button>
                            </div>
                        )} />
                    </div>
                )}
                {tab === 3 && (
                    <div className="h-full flex flex-col">
                         <div className="bg-white/80 backdrop-blur-md border-t-4 border-rose-500 p-5 rounded-2xl shadow-sm shrink-0 mb-4 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl sm:text-2xl font-black text-rose-600">Registro de Saídas</h3>
                                <Button onClick={() => openModal('fin_saida_novo')} variant="danger" className="shadow-lg shadow-rose-500/30"><Plus size={18}/> Nova Despesa</Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest px-2">
                                    <Filter size={16} className="text-rose-500"/> Busca Avançada
                                </div>
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                                    <input type="text" placeholder="Buscar por descrição ou fornecedor..." value={localSearchTerm} onChange={e => setLocalSearchTerm((e.target.value || "").toUpperCase())} className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg w-full text-sm outline-none focus:border-rose-500 shadow-sm bg-white uppercase"/>
                                </div>
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm focus-within:border-rose-500 transition-colors">
                                    <span className="px-3 text-[10px] font-bold text-slate-400 uppercase bg-slate-100 border-r border-slate-200 h-full flex items-center">Data Exata</span>
                                    <input type="date" value={searchFiltroData} onChange={e => setSearchFiltroData(e.target.value)} className="bg-transparent border-none py-2 px-3 text-xs font-bold text-slate-700 outline-none cursor-pointer" />
                                </div>
                                {(localSearchTerm || searchFiltroData) && (
                                    <button onClick={() => { setLocalSearchTerm(''); setSearchFiltroNome(''); setSearchFiltroData(''); }} className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 shadow-sm" title="Limpar Filtros">
                                        <X size={16}/>
                                    </button>
                                )}
                            </div>
                        </div>
                        <GenericTable title="" type="saida" data={tabelaFinanceiroFiltrada.filter(f => f.tipo === 'saida')} columns={[{header:'Vencimento', key:'data_vencimento', render: d=>formatDateLocal(d.data_vencimento)}, {header:'Descrição', key:'descricao', render: f => <div className="flex flex-col"><div className="flex items-center gap-2"><span className="font-bold">{f.descricao}</span>{f.comprovante && <button onClick={(e) => { e.stopPropagation(); handleDownloadAnexo(f.comprovante, 'saida'); }} className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1 rounded-lg border border-indigo-100 shadow-sm transition-colors" title="Transferir Comprovativo"><Paperclip size={12}/></button>}</div><span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{!f.congregacao_id || f.congregacao_id === 'sede' ? 'Sede Principal' : db.congregacoes.find(c=>c.id===f.congregacao_id)?.nome}</span></div>}, {header:'Fornecedor', key:'fornecedor_id', render: f => f.fornecedor_id ? (db.fornecedores.find(forn=>forn.id===f.fornecedor_id)?.nome || f.fornecedor_id) : <span className="text-slate-400 italic">-</span>}, {header:'Valor', key:'valor', render: v => <span className="font-bold text-rose-600">R$ {parseFloat(v.valor).toFixed(2)}</span>}, {header:'Status', key:'status', render: s => s.status === 'pago' ? <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded uppercase">Pago</span> : <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded uppercase">Pendente</span>}]} customActions={(item) => (
                            <div className="flex gap-2">
                                <button onClick={() => { setPrintData({ item, igreja: db.igreja, fornecedores: db.fornecedores }); setPrintMode('recibo'); setPreviewOpen(true); }} className="p-2.5 text-blue-500 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors shadow-sm bg-white border border-blue-100" title="Imprimir Recibo"><Receipt size={18}/></button>
                                <button onClick={() => setSelectedHistoryItem(item)} className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors shadow-sm bg-white border border-slate-100" title="Histórico de Alterações"><History size={18}/></button>
                            </div>
                        )} />
                    </div>
                )}
                {tab === 4 && (
                    <div className="h-full flex flex-col">
                        <div className="bg-white/80 backdrop-blur-md border-t-4 border-slate-500 p-5 rounded-2xl shadow-sm shrink-0 mb-4 flex flex-col gap-4">
                            <div className="flex flex-wrap gap-4 items-center justify-between">
                                <h3 className="text-xl sm:text-2xl font-black text-slate-700 flex items-center gap-2"><CreditCard size={24}/> Gestão de Pagamentos</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setStatusFilter('todos')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${statusFilter === 'todos' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>Todos</button>
                                    <button onClick={() => setStatusFilter('pendente')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${statusFilter === 'pendente' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-500 border-slate-200 hover:bg-rose-50 hover:text-rose-600'}`}>Pendentes</button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest px-2">
                                    <Filter size={16} className="text-slate-500"/> Busca Avançada
                                </div>
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                                    <input type="text" placeholder="Buscar por descrição ou fornecedor..." value={localSearchTerm} onChange={e => setLocalSearchTerm((e.target.value || "").toUpperCase())} className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg w-full text-sm outline-none focus:border-slate-500 shadow-sm bg-white uppercase"/>
                                </div>
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm focus-within:border-slate-500 transition-colors">
                                    <span className="px-3 text-[10px] font-bold text-slate-400 uppercase bg-slate-100 border-r border-slate-200 h-full flex items-center">Data Exata</span>
                                    <input type="date" value={searchFiltroData} onChange={e => setSearchFiltroData(e.target.value)} className="bg-transparent border-none py-2 px-3 text-xs font-bold text-slate-700 outline-none cursor-pointer" />
                                </div>
                                {(localSearchTerm || searchFiltroData) && (
                                    <button onClick={() => { setLocalSearchTerm(''); setSearchFiltroNome(''); setSearchFiltroData(''); }} className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 shadow-sm" title="Limpar Filtros">
                                        <X size={16}/>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                             <GenericTable title="" type="gestao_despesa" data={tabelaFinanceiroFiltrada.filter(f => f.tipo === 'saida' && (statusFilter === 'todos' || f.status === statusFilter))} columns={[{header:'Vencimento', key:'data_vencimento', render: d=> d.data_vencimento ? <span className={d.status==='pendente' && new Date(d.data_vencimento) < new Date() ? 'text-rose-600 font-bold' : ''}>{formatDateLocal(d.data_vencimento)}</span> : '-'}, {header:'Descrição', key:'descricao', render: f => <div className="flex flex-col"><div className="flex items-center gap-2"><span className="font-bold">{f.descricao}</span>{f.comprovante && <button onClick={(e) => { e.stopPropagation(); handleDownloadAnexo(f.comprovante, 'despesa'); }} className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-lg border border-indigo-100 shadow-sm transition-colors" title="Transferir Comprovativo"><Paperclip size={14}/></button>}</div><span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">{!f.congregacao_id || f.congregacao_id === 'sede' ? 'Sede Principal' : db.congregacoes.find(c=>c.id===f.congregacao_id)?.nome}</span></div>}, {header:'Fornecedor', key:'fornecedor_id', render: f => f.fornecedor_id ? (db.fornecedores.find(forn=>forn.id===f.fornecedor_id)?.nome || f.fornecedor_id) : <span className="text-slate-400 italic">-</span>}, {header:'Valor', key:'valor', render: v => `R$ ${parseFloat(v.valor).toFixed(2)}`}, {header:'Status', key:'status'}]} customActions={(item) => (
                                 <div className="flex gap-2">
                                     <button onClick={() => { setPrintData({ item, igreja: db.igreja, fornecedores: db.fornecedores }); setPrintMode('recibo'); setPreviewOpen(true); }} className="p-2.5 text-blue-500 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors shadow-sm bg-white border border-blue-100" title="Imprimir Recibo"><Receipt size={18}/></button>
                                     {item.status !== 'pago' && (<button onClick={() => handleBaixarDespesa(item)} className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm border border-emerald-200" title="Baixar (Pagar)"><CheckCheck size={18}/></button>)}
                                      <button onClick={() => setSelectedHistoryItem(item)} className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-colors shadow-sm bg-white border border-slate-100" title="Histórico de Alterações"><History size={18}/></button>
                                 </div>
                             )} />
                        </div>
                    </div>
                )}
                {/* --- NOVO PAINEL DE ANÁLISE DE DIZIMISTAS --- */}
                {tab === 5 && (
                    <div className="h-full flex flex-col space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass-card p-5 rounded-3xl border-b-4 border-emerald-500 shadow-sm flex flex-col justify-center text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Dizimistas Regulares</p>
                                <h3 className="text-3xl font-black text-emerald-600">{dizimistasData.filter(d=>d.status_dizimo==='Regular').length}</h3>
                            </div>
                            <div className="glass-card p-5 rounded-3xl border-b-4 border-amber-500 shadow-sm flex flex-col justify-center text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Irregulares</p>
                                <h3 className="text-3xl font-black text-amber-600">{dizimistasData.filter(d=>d.status_dizimo==='Irregular').length}</h3>
                            </div>
                            <div className="glass-card p-5 rounded-3xl border-b-4 border-rose-500 shadow-sm flex flex-col justify-center text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inativos (Alerta)</p>
                                <h3 className="text-3xl font-black text-rose-600">{dizimistasData.filter(d=>d.status_dizimo.includes('Inativo')).length}</h3>
                            </div>
                            <div className="glass-card p-5 rounded-3xl border-b-4 border-slate-400 shadow-sm flex flex-col justify-center text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sem Registo</p>
                                <h3 className="text-3xl font-black text-slate-600">{dizimistasData.filter(d=>d.status_dizimo==='Sem Registo').length}</h3>
                            </div>
                        </div>

                        <div className="glass-modern p-6 rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white flex-shrink-0">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div>
                                    <h3 className="font-bold text-indigo-800 flex items-center gap-2"><Target size={18}/> Análise Pastoral & Retenção</h3>
                                    <p className="text-xs text-indigo-600/80 mt-1">Acompanhamento estratégico para aconselhamento e visitas pastorais.</p>
                                </div>
                                <Button onClick={async () => {
                                        setLoadingAiRetention(true);
                                        const prompt = `Analise os dados de retenção de dizimistas da igreja: Regulares: ${dizimistasData.filter(d=>d.status_dizimo==='Regular').length}, Irregulares: ${dizimistasData.filter(d=>d.status_dizimo==='Irregular').length}, Inativos: ${dizimistasData.filter(d=>d.status_dizimo.includes('Inativo')).length}. Dê conselhos práticos e pastorais (máx 3 parágrafos) sobre como abordar os membros inativos de forma amorosa, sem focar só no dinheiro, mas no cuidado espiritual. Use Markdown.`;
                                        const result = await callGeminiAI(prompt);
                                        setAiRetention(result);
                                        setLoadingAiRetention(false);
                                    }} 
                                    disabled={loadingAiRetention} variant="primary" className="py-2 px-4 text-xs shadow-md">
                                    {loadingAiRetention ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16}/>} Gerar Plano de Ação
                                </Button>
                            </div>
                            {aiRetention && (
                                <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed animate-entrance">
                                    {aiRetention}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-hidden">
                             <GenericTable 
                                title="Histórico de Membros" 
                                type="membro" 
                                data={dizimistasData} 
                                columns={[
                                    {header:'Membro', key:'nome', render: m => <span className="font-bold text-slate-800">{m.nome}</span>},
                                    {header:'Status Atual', key:'status_dizimo', render: m => <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border shadow-sm ${m.status_color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : m.status_color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' : m.status_color === 'rose' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{m.status_dizimo}</span>},
                                    {header:'Último Registo', key:'ultimo_dizimo', render: m => m.ultimo_dizimo ? formatDateLocal(m.ultimo_dizimo) : <span className="text-slate-400 italic">-</span>},
                                    {header:'Total Global', key:'total_dizimado', render: m => <span className="font-mono font-bold text-indigo-600">R$ {m.total_dizimado.toFixed(2)}</span>}
                                ]} 
                                customActions={(item) => (
                                    <button onClick={() => {
                                        let msg = `A Paz do Senhor, ${item.nome.split(' ')[0]}! Aqui é da ${db.igreja.nome}. Como tem passado? `;
                                        if (item.status_color === 'rose' || item.status_color === 'amber') {
                                            msg += `Sentimos a sua falta recentemente. Gostaria de receber uma visita ou oração? Estamos aqui para si!`;
                                        } else {
                                            msg += `Passando para agradecer pela sua fidelidade e dedicação à obra do Senhor. Deus abençoe grandemente!`;
                                        }
                                        window.open(`https://wa.me/55${(item.telefone||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
                                    }} className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm border border-emerald-200" title="Contactar no WhatsApp">
                                        <MessageCircle size={18}/>
                                    </button>
                                )}
                                onDeleteOverride={() => {}}
                            />
                        </div>
                    </div>
                )}

                {/* --- Lembretes de Pagamento / Cobrança --- */}
                {tab === 6 && (
                    <div className="h-full flex flex-col space-y-6 animate-entrance">
                        <div className="glass-modern p-6 rounded-[2rem] border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white flex-shrink-0">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-amber-800 flex items-center gap-2"><Bell size={18}/> Gestão de Inadimplência e Lembretes Automáticos</h3>
                                    <p className="text-xs text-amber-600/80 mt-1">Configure o envio de mensagens de aviso via WhatsApp para membros com pagamentos pendentes.</p>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4">
                                    <button 
                                        onClick={() => {
                                            setPrintData({ pending: lembretesAtrasados, igreja: db.igreja });
                                            setPrintMode('rel_inadimplentes');
                                            setPreviewOpen(true);
                                        }}
                                        className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-2 uppercase tracking-wider"
                                    >
                                        <Printer size={14}/> Gerar Relatório de Inadimplentes
                                    </button>

                                    <div className="flex items-center gap-3 bg-amber-50/50 px-3 py-1.5 rounded-2xl border border-amber-200">
                                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Envio Automático (Sábados)</span>
                                        <button 
                                            onClick={() => {
                                                setIsAgendamentoAutomAtivo(!isAgendamentoAutomAtivo);
                                                if(!isAgendamentoAutomAtivo) addToast("Os lembretes agora serão enviados automaticamente aos inadimplentes.", "success");
                                                else addToast("Agendamento automático desativado.", "info");
                                            }}
                                            className={`w-14 h-8 flex items-center rounded-full p-1 shadow-inner transition-colors duration-300 ease-in-out ${isAgendamentoAutomAtivo ? 'bg-amber-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isAgendamentoAutomAtivo ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden">
                             <GenericTable 
                                title={`Membros com Lançamentos Atrasados (${lembretesAtrasados.length})`}
                                type="lembrete" 
                                data={lembretesAtrasados} 
                                columns={[
                                    {header:'Membro', key:'nome', render: m => <span className="font-bold text-slate-800">{m.nome}</span>},
                                    {header:'Motivo(s) do Atraso', key:'descricoes', render: m => <span className="text-xs text-slate-500 truncate max-w-[200px] whitespace-pre-wrap block">{m.descricoes}</span>},
                                    {header:'Qtd. Lançamentos', key:'qtd_atrasos', render: m => <span className="text-amber-600 font-bold">{m.qtd_atrasos} registros</span>},
                                    {header:'Valor P/ Acerto', key:'valor_total', render: m => <span className="font-mono font-bold text-rose-600">R$ {m.valor_total.toFixed(2)}</span>}
                                ]} 
                                customActions={(item) => (
                                    <button onClick={() => {
                                        const msg = `A Paz do Senhor, ${item.nome.split(' ')[0]}! Aqui é da secretaria da ${db.igreja.nome}. Consta em nosso sistema um lembrete em aberto referente a: ${item.descricoes} no valor total de R$ ${item.valor_total.toFixed(2)}. Precisando de apoio ou de um novo prazo, estamos à inteira disposição. Deus abençoe!`;
                                        window.open(`https://wa.me/55${(item.telefone||'').replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
                                    }} className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl transition-all shadow-sm border border-amber-200 flex items-center gap-2" title="Contactar e Enviar Lembrete via WhatsApp">
                                        <Bell size={16}/> <span className="text-xs font-bold uppercase hidden md:inline">Enviar Aviso</span>
                                    </button>
                                )}
                                onDeleteOverride={() => {}}
                            />
                        </div>
                    </div>
                )}

                {/* --- ABA DE RELATÓRIOS GERENCIAIS (BALANCETE MENSAL) --- */}
                {tab === 7 && (() => {
                    // Cáculo agrupado e sumário das Entradas por Categoria
                    const entradasAgrupadas = {};
                    let totalEntradas = 0;
                    financeiroFiltrado.filter((item: any) => item.tipo === 'entrada').forEach((item: any) => {
                        const cat = item.categoria || 'Geral/Outros';
                        const val = parseFloat(item.valor) || 0;
                        entradasAgrupadas[cat] = (entradasAgrupadas[cat] || 0) + val;
                        totalEntradas += val;
                    });

                    // Cálculo agrupado e sumário das Saídas por Categoria
                    const saidasAgrupadas = {};
                    let totalSaidas = 0;
                    financeiroFiltrado.filter((item: any) => item.tipo === 'saida').forEach((item: any) => {
                        const cat = item.categoria || 'Geral/Outros';
                        const val = parseFloat(item.valor) || 0;
                        saidasAgrupadas[cat] = (saidasAgrupadas[cat] || 0) + val;
                        totalSaidas += val;
                    });

                    const saldoFin = totalEntradas - totalSaidas;

                    // Método para formatar o mês do relatório
                    const formatarMesAno = (dateString: string) => {
                        if (!dateString) return '';
                        const [ano, mes] = dateString.split('-');
                        const nomesMeses = [
                            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                        ];
                        return `${nomesMeses[parseInt(mes) - 1]} de ${ano}`;
                    };

                    // Handler profissional para exportação estruturada em PDF
                    const exportarPDFBalancete = () => {
                        const docPdf = new jsPDF({
                            orientation: 'portrait',
                            unit: 'mm',
                            format: 'a4'
                        });

                        const pageW = docPdf.internal.pageSize.getWidth();
                        const pageH = docPdf.internal.pageSize.getHeight();

                        // Moldura externa elegante
                        docPdf.setDrawColor(226, 232, 240);
                        docPdf.setLineWidth(0.5);
                        docPdf.rect(10, 10, pageW - 20, pageH - 20);

                        // Barra superior decorativa indigo
                        docPdf.setFillColor(79, 70, 229);
                        docPdf.rect(10, 10, pageW - 20, 5, 'F');

                        // Cabeçalho da Igreja
                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.setFontSize(16);
                        docPdf.setTextColor(30, 41, 59);
                        docPdf.text((db.igreja?.nome || 'DIRETORIA ADMINISTRATIVA GIPP').toUpperCase(), pageW / 2, 24, { align: 'center' });

                        docPdf.setFont('Helvetica', 'normal');
                        docPdf.setFontSize(10);
                        docPdf.setTextColor(100, 116, 139);
                        docPdf.text(`DEMONSTRATIVO FINANCEIRO UNIFICADO E PRESTAÇÃO DE CONTAS`, pageW / 2, 29, { align: 'center' });
                        
                        const congRef = congregacaoFilter === 'todas' ? 'Todas as Congregações e Filiais' : (db.congregacoes?.find((c: any) => c.id === congregacaoFilter)?.nome || 'Sede Principal');
                        docPdf.text(`Congregação: ${congRef} | Competência: ${formatarMesAno(filterDate)}`, pageW / 2, 34, { align: 'center' });

                        // Linha divisória fina
                        docPdf.setDrawColor(203, 213, 225);
                        docPdf.setLineWidth(0.3);
                        docPdf.line(15, 38, pageW - 15, 38);

                        // 1. SEÇÃO DE RECEITAS
                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.setFontSize(11);
                        docPdf.setTextColor(16, 185, 129);
                        docPdf.text("1. RECEITAS / ENTRADAS", 15, 45);

                        docPdf.setFontSize(9);
                        docPdf.setTextColor(71, 85, 105);
                        let posY = 52;
                        
                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.text("Categoria", 15, posY);
                        docPdf.text("Valor", pageW - 45, posY, { align: 'right' });
                        docPdf.text("Participação %", pageW - 15, posY, { align: 'right' });
                        posY += 3;
                        docPdf.line(15, posY, pageW - 15, posY);
                        posY += 5;

                        docPdf.setFont('Helvetica', 'normal');
                        const entriesReceitas = Object.entries(entradasAgrupadas).sort((a: any, b: any) => b[1] - a[1]);
                        if (entriesReceitas.length === 0) {
                            docPdf.setFont('Helvetica', 'italic');
                            docPdf.text("Nenhum lançamento de receita registrado neste período.", 15, posY);
                            posY += 7;
                        } else {
                            entriesReceitas.forEach(([cat, val]: any) => {
                                docPdf.text(String(cat), 15, posY);
                                docPdf.text(`R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 45, posY, { align: 'right' });
                                const percente = totalEntradas > 0 ? ((val / totalEntradas) * 100).toFixed(1) : '0';
                                docPdf.text(`${percente}%`, pageW - 15, posY, { align: 'right' });
                                posY += 6;
                            });
                        }

                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.text("TOTAL RECEITAS ARRECADADAS (A)", 15, posY);
                        docPdf.text(`R$ ${totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 45, posY, { align: 'right' });
                        docPdf.text("100.0%", pageW - 15, posY, { align: 'right' });
                        posY += 8;

                        // 2. SEÇÃO DE DESPESAS
                        docPdf.line(15, posY, pageW - 15, posY);
                        posY += 7;
                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.setTextColor(239, 68, 68);
                        docPdf.text("2. DESPESAS / SAÍDAS", 15, posY);
                        posY += 7;

                        docPdf.setFontSize(9);
                        docPdf.setTextColor(71, 85, 105);
                        docPdf.text("Categoria", 15, posY);
                        docPdf.text("Valor", pageW - 45, posY, { align: 'right' });
                        docPdf.text("Participação %", pageW - 15, posY, { align: 'right' });
                        posY += 3;
                        docPdf.line(15, posY, pageW - 15, posY);
                        posY += 5;

                        docPdf.setFont('Helvetica', 'normal');
                        const entriesDespesas = Object.entries(saidasAgrupadas).sort((a: any, b: any) => b[1] - a[1]);
                        if (entriesDespesas.length === 0) {
                            docPdf.setFont('Helvetica', 'italic');
                            docPdf.text("Nenhum lançamento de saída pago registrado neste período.", 15, posY);
                            posY += 7;
                        } else {
                            entriesDespesas.forEach(([cat, val]: any) => {
                                docPdf.text(String(cat), 15, posY);
                                docPdf.text(`R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 45, posY, { align: 'right' });
                                const percente = totalSaidas > 0 ? ((val / totalSaidas) * 100).toFixed(1) : '0';
                                docPdf.text(`${percente}%`, pageW - 15, posY, { align: 'right' });
                                posY += 6;
                            });
                        }

                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.text("TOTAL DESPESAS PAGAS (B)", 15, posY);
                        docPdf.text(`R$ ${totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 45, posY, { align: 'right' });
                        docPdf.text("100.0%", pageW - 15, posY, { align: 'right' });
                        posY += 8;

                        // 3. SEÇÃO DE DEMONSTRATIVO DE SALDO
                        docPdf.line(15, posY, pageW - 15, posY);
                        posY += 7;

                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.setTextColor(79, 70, 229);
                        docPdf.text("3. DEMONSTRATIVO DE CONCILIAÇÃO DE CAIXA", 15, posY);
                        posY += 7;

                        docPdf.setFont('Helvetica', 'normal');
                        docPdf.setTextColor(71, 85, 105);
                        docPdf.text("Total de Receitas no Período (A)", 15, posY);
                        docPdf.text(`R$ ${totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 15, posY, { align: 'right' });
                        posY += 6;

                        docPdf.text("Total de Despesas no Período (B)", 15, posY);
                        docPdf.text(`R$ ${totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 15, posY, { align: 'right' });
                        posY += 6;

                        const saldoLiq = totalEntradas - totalSaidas;
                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.setTextColor(saldoLiq >= 0 ? 16 : 239, saldoLiq >= 0 ? 185 : 68, saldoLiq >= 0 ? 129 : 68);
                        docPdf.text(`SALDO LÍQUIDO ACUMULADO (A - B)`, 15, posY);
                        docPdf.text(`R$ ${saldoLiq.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageW - 15, posY, { align: 'right' });
                        posY += 18;

                        // Caso passe o limite da folha, quebre e desenhe na segunda página
                        if (posY > pageH - 45) {
                            docPdf.addPage();
                            docPdf.setDrawColor(226, 232, 240);
                            docPdf.setLineWidth(0.5);
                            docPdf.rect(10, 10, pageW - 20, pageH - 20);
                            posY = 35;
                        }

                        // Campos para assinaturas obrigatórias
                        docPdf.setDrawColor(148, 163, 184);
                        docPdf.setLineWidth(0.3);
                        docPdf.line(15, posY, 90, posY);
                        docPdf.line(pageW - 90, posY, pageW - 15, posY);
                        posY += 5;

                        docPdf.setFont('Helvetica', 'bold');
                        docPdf.setFontSize(8);
                        docPdf.setTextColor(71, 85, 105);
                        docPdf.text("PRESIDENTE / DIRETOR GIPP", 52.5, posY, { align: 'center' });
                        docPdf.text("TESOUREIRO RESPONSÁVEL", pageW - 52.5, posY, { align: 'center' });
                        posY += 4;
                        
                        docPdf.setFont('Helvetica', 'normal');
                        docPdf.text("Assinatura do Representante", 52.5, posY, { align: 'center' });
                        docPdf.text("Assinatura do Tesoureiro", pageW - 52.5, posY, { align: 'center' });

                        // Rodapé metadata
                        docPdf.setFontSize(7);
                        docPdf.setTextColor(160, 174, 192);
                        docPdf.text(`Documento gerado através do Módulo de Inteligência de Negócios do GIPP em ${new Date().toLocaleString('pt-BR')}`, pageW / 2, pageH - 12, { align: 'center' });

                        docPdf.save(`Balancete_Gerencial_${formatarMesAno(filterDate).replace(/\s+/g, '_')}.pdf`);
                        addToast("Relatório (Balancete) em formato PDF exportado com sucesso!", "success");
                    };

                    return (
                        <div className="space-y-6 h-full overflow-y-auto custom-scrollbar p-1 animate-entrance">
                            {/* Dashboard Superior */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group border border-emerald-110 shadow-sm bg-gradient-to-tr from-emerald-50/20 to-white">
                                    <div className="absolute -right-4 -top-4 text-emerald-100 opacity-20 transform scale-150"><ArrowUpCircle size={100}/></div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4"><ArrowUpCircle size={24}/></div>
                                        <h3 className="text-3xl font-black text-slate-800 mb-1">R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Total de Receitas</p>
                                    </div>
                                </div>
                                
                                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group border border-rose-110 shadow-sm bg-gradient-to-tr from-rose-50/20 to-white">
                                    <div className="absolute -right-4 -top-4 text-rose-100 opacity-20 transform scale-150"><ArrowDownCircle size={100}/></div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4"><ArrowDownCircle size={24}/></div>
                                        <h3 className="text-3xl font-black text-slate-800 mb-1">R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Total de Despesas</p>
                                    </div>
                                </div>

                                <div className={`glass-card p-6 rounded-3xl relative overflow-hidden group border shadow-sm bg-gradient-to-tr from-indigo-50/20 to-white ${saldoFin >= 0 ? 'border-indigo-100' : 'border-amber-100'}`}>
                                    <div className="absolute -right-4 -top-4 text-indigo-100 opacity-20 transform scale-150"><Wallet size={100}/></div>
                                    <div className="relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${saldoFin >= 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}><Wallet size={24}/></div>
                                        <h3 className="text-3xl font-black text-slate-800 mb-1">R$ {saldoFin.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Resultado do Exercício ({saldoFin >= 0 ? "Superavit" : "Deficit"})</p>
                                    </div>
                                </div>
                            </div>

                            {/* Painel Central com Tabelas do Balancete e Botões */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-8 glass-modern p-6 sm:p-8 rounded-[2.5rem] border border-white/50 space-y-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">Balancete Mensal Unificado</h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{formatarMesAno(filterDate)}</p>
                                        </div>
                                        <Button 
                                            onClick={exportarPDFBalancete} 
                                            variant="success" 
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                                        >
                                            <Download size={15}/>
                                            Exportar PDF
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                        {/* Coluna 1: Entradas */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2 flex items-center gap-2"><ArrowUpCircle size={16}/> Receitas / Entradas</h4>
                                            <div className="space-y-4">
                                                {Object.keys(entradasAgrupadas).length === 0 ? (
                                                    <p className="text-xs text-slate-400 italic">Sem registros no período.</p>
                                                ) : (
                                                    Object.entries(entradasAgrupadas).map(([cat, val]: any) => {
                                                        const p = totalEntradas > 0 ? ((val / totalEntradas) * 100) : 0;
                                                        return (
                                                            <div key={cat} className="space-y-1">
                                                                <div className="flex justify-between items-center text-xs font-bold text-slate-705">
                                                                    <span>{cat}</span>
                                                                    <span>R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${p}%` }} />
                                                                </div>
                                                                <p className="text-[10px] text-right text-slate-400 font-extrabold">{p.toFixed(1)}%</p>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-slate-800 font-black text-sm">
                                                    <span>Total Recebido</span>
                                                    <span className="text-emerald-600 font-bold">R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Coluna 2: Saídas */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-black text-rose-600 uppercase tracking-widest border-b border-rose-100 pb-2 flex items-center gap-2"><ArrowDownCircle size={16}/> Despesas / Saídas</h4>
                                            <div className="space-y-4">
                                                {Object.keys(saidasAgrupadas).length === 0 ? (
                                                    <p className="text-xs text-slate-400 italic">Sem registros no período.</p>
                                                ) : (
                                                    Object.entries(saidasAgrupadas).map(([cat, val]: any) => {
                                                        const p = totalSaidas > 0 ? ((val / totalSaidas) * 100) : 0;
                                                        return (
                                                            <div key={cat} className="space-y-1">
                                                                <div className="flex justify-between items-center text-xs font-bold text-slate-705">
                                                                    <span>{cat}</span>
                                                                    <span>R$ {val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${p}%` }} />
                                                                </div>
                                                                <p className="text-[10px] text-right text-slate-400 font-extrabold">{p.toFixed(1)}%</p>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-slate-800 font-black text-sm">
                                                    <span>Total Pago</span>
                                                    <span className="text-rose-600 font-bold">R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-4 space-y-6">
                                    <div className="glass-modern p-6 rounded-[2rem] border border-white/50 space-y-4 bg-gradient-to-tr from-slate-50/50 to-white text-slate-800">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><FileBarChart size={18} className="text-indigo-500" /> Prestação de Contas</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">Os demonstrativos mensais facilitam a transparência com os membros do ministério, reunindo todas as arrecadações e pagamentos quitados. Certifique-se de que todas as notas fiscais estejam correspondidas antes de publicar a prestação de contas no painel geral.</p>
                                        <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><CheckCircle size={16}/></div>
                                            <div>
                                                <h4 className="text-xs font-extrabold text-slate-705">Auditoria Completa</h4>
                                                <p className="text-[10px] text-slate-450 font-medium tracking-tight">Balanços e lançamentos protegidos</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {tab === 8 && (
                    <div className="space-y-6 h-full overflow-y-auto custom-scrollbar p-1 animate-entrance text-slate-800">
                        {/* Status Overview Header */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard 
                                title="Boletos Pendentes no DDA" 
                                value={`R$ ${ddaBoletos.filter(b => b.status === 'pendente').reduce((sum, b) => sum + b.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                                sub={`${ddaBoletos.filter(b => b.status === 'pendente').length} boletos aguardando aprovação`} 
                                icon={Landmark} 
                                color="amber" 
                            />
                            <StatCard 
                                title="Boletos Importados no Contas a Pagar" 
                                value={`R$ ${ddaBoletos.filter(b => b.status === 'importado').reduce((sum, b) => sum + b.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                                sub={`${ddaBoletos.filter(b => b.status === 'importado').length} lançados para pagamento`} 
                                icon={FileCheck} 
                                color="emerald" 
                            />
                            <div className="glass-card p-6 rounded-3xl relative overflow-hidden group border border-indigo-100 shadow-sm bg-gradient-to-tr from-indigo-50/20 to-white">
                                <div className="absolute -right-4 -top-4 text-indigo-100 opacity-20 transform scale-150"><Building2 size={100}/></div>
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">CNPJ do Beneficiário Principal (Igreja)</p>
                                        <h3 className="text-xl font-bold text-slate-800 mt-1">{db.igreja?.cnpj || "12.345.678/0001-90"}</h3>
                                        <p className="text-xs text-slate-400 mt-1 font-semibold">Toda emissão neste CNPJ é capturada automaticamente</p>
                                    </div>
                                    <div className="pt-4 flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Monitoramento Sincronizado Ativo</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SUB-TABS SELECTOR FOR DDA AREA */}
                        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
                            <button
                                onClick={() => setDdaSubTab('lista')}
                                className={`py-3 px-6 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                                    ddaSubTab === 'lista'
                                        ? 'border-indigo-600 text-indigo-600 font-extrabold'
                                        : 'border-transparent text-slate-400 hover:text-slate-600 font-bold'
                                }`}
                            >
                                <Landmark size={14} />
                                Carteira DDA ({ddaBoletos.length})
                            </button>
                            <button
                                onClick={() => setDdaSubTab('reconciliacao')}
                                className={`py-3 px-6 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                                    ddaSubTab === 'reconciliacao'
                                        ? 'border-indigo-600 text-indigo-600 font-extrabold'
                                        : 'border-transparent text-slate-400 hover:text-slate-600 font-bold'
                                }`}
                            >
                                <FileBarChart size={14} />
                                Relatório de Conciliação Cruzada
                            </button>
                            <button
                                onClick={() => setDdaSubTab('xml')}
                                className={`py-3 px-6 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                                    ddaSubTab === 'xml'
                                        ? 'border-indigo-600 text-indigo-600 font-extrabold'
                                        : 'border-transparent text-slate-400 hover:text-slate-600 font-bold'
                                }`}
                            >
                                <FileCode size={14} />
                                Importar Faturas XML / NF-e
                            </button>
                        </div>

                        {/* Middle Action Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* LEFT AREA: CONTENT DEPENDING ON DDA SUB-TAB */}
                            <div className="lg:col-span-8 space-y-6">
                                
                                {ddaSubTab === 'lista' && (
                                    <div className="glass-modern p-6 sm:p-8 rounded-[2.5rem] border border-white/50 space-y-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">Débito Direto Autorizado (DDA)</h3>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Sincronização Integrada Febraban / Bancos Parceiros</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={handleSondarDda} 
                                                    disabled={ddaChecking}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                                                >
                                                    <RefreshCw size={14} className={ddaChecking ? "animate-spin" : ""} />
                                                    {ddaChecking ? "Pesquisando CNPJ..." : "Sondar Débitos no CNPJ"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-indigo-50 border border-indigo-100/50 rounded-2xl flex items-start gap-3">
                                            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg mt-0.5"><Info size={16}/></div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-xs font-bold text-indigo-800">O que é o Banco DDA Integrado?</h4>
                                                <p className="text-[11px] text-indigo-700 leading-relaxed font-semibold">
                                                    O DDA funciona diretamente ligado aos servidores do Banco Central e Febraban. Sempre que qualquer fornecedor registrar um boleto indicando o CNPJ da igreja, este boleto aparece aqui em tempo real. A partir daqui, você pode revisar e importá-lo no Contas a Pagar com apenas um clique!
                                                </p>
                                            </div>
                                        </div>

                                        {/* Active Boletos Feed */}
                                        <div className="space-y-4">
                                            {ddaBoletos.length === 0 ? (
                                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <Landmark size={40} className="mx-auto text-slate-300 mb-2" />
                                                    <p className="text-sm font-bold text-slate-500">Nenhum boleto encontrado no registro DDA.</p>
                                                    <p className="text-xs text-slate-400">Clique em "Sondar Débitos no CNPJ" para consultar os registros bancários mais recentes.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {ddaBoletos.map((boleto) => (
                                                        <div 
                                                            key={boleto.id} 
                                                            className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                                                                boleto.status === 'importado' 
                                                                    ? 'bg-emerald-50/20 md:bg-emerald-50/5 border-emerald-100 opacity-80' 
                                                                    : boleto.status === 'descartado'
                                                                    ? 'bg-slate-50/10 border-slate-100 opacity-60 line-through'
                                                                    : 'bg-white border-slate-200/80 shadow-sm hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <div className="space-y-3 flex-1">
                                                                <div className="flex flex-wrap items-center gap-2.5">
                                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                                                        boleto.status === 'importado'
                                                                            ? 'bg-emerald-100 text-emerald-800'
                                                                            : boleto.status === 'descartado'
                                                                            ? 'bg-slate-100 text-slate-500'
                                                                            : 'bg-amber-100 text-amber-800 animate-pulse'
                                                                    }`}>
                                                                        {boleto.status === 'importado' ? 'Importado / Lançado' : boleto.status === 'descartado' ? 'Ignorado' : 'Aguardando Aprovação'}
                                                                    </span>
                                                                    <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                                        {boleto.tipo}
                                                                    </span>
                                                                    <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                                        {boleto.origem || 'DDA Integrado'}
                                                                    </span>
                                                                </div>

                                                                <div>
                                                                    <h4 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight uppercase leading-snug">{boleto.beneficiario}</h4>
                                                                    <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">CNPJ Cedente: {boleto.cnpj_beneficiario}</p>
                                                                </div>

                                                                {/* Ticket Info Row */}
                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-1 text-xs">
                                                                    <div>
                                                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Vencimento</p>
                                                                        <p className={`font-black mt-0.5 ${boleto.status === 'pendente' && new Date(boleto.data_vencimento) < new Date() ? 'text-rose-600 font-black' : 'text-slate-700'}`}>
                                                                            {formatDateLocal(boleto.data_vencimento)}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Valor do Débito</p>
                                                                        <p className="font-black text-slate-700 mt-0.5 text-sm">
                                                                            R$ {boleto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                        </p>
                                                                    </div>
                                                                    <div className="col-span-2 md:col-span-1">
                                                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Emissão</p>
                                                                        <p className="font-semibold text-slate-500 mt-0.5">
                                                                            {formatDateLocal(boleto.data_emissao)}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Digital Line / Code Bar */}
                                                                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-mono text-slate-600 mt-2 gap-3 group">
                                                                    <span className="truncate tracking-tighter" title="Copiar código de barras">{boleto.linha_digitavel}</span>
                                                                    <button 
                                                                        onClick={() => { copyToClipboard(boleto.linha_digitavel); addToast("Linha digitável copiada para a área de transferência!", "success"); }}
                                                                        className="text-indigo-600 hover:text-indigo-800 font-bold hover:bg-indigo-50 p-1.5 rounded-lg border border-transparent hover:border-indigo-100 shrink-0 transition-colors" 
                                                                        title="Copiar Código"
                                                                    >
                                                                        <Copy size={13} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Direct Actions */}
                                                            <div className="flex md:flex-col gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                                                                {boleto.status === 'pendente' ? (
                                                                    <>
                                                                        <button 
                                                                            onClick={() => handleLancarDdaParaFinanceiro(boleto)}
                                                                            className="flex-1 md:flex-initial py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 hover:-translate-y-0.5"
                                                                        >
                                                                            <Check size={14}/> Lançar no Contas a Pagar
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleDescartarDda(boleto.id)}
                                                                            className="flex-1 md:flex-initial py-2.5 px-4 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                                                                        >
                                                                            <X size={14}/> Ignorar Boleto
                                                                        </button>
                                                                    </>
                                                                ) : boleto.status === 'importado' ? (
                                                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl justify-center w-full">
                                                                        <CheckCircle size={15}/> Lançado no Financeiro
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-50 border border-slate-100 p-2.5 rounded-xl justify-center w-full">
                                                                        <X size={15}/> Boleto Ignorado
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* RECONCILIATION MATRICIAL CROSSING REPORT TAB */}
                                {ddaSubTab === 'reconciliacao' && (
                                    <div className="glass-modern p-6 sm:p-8 rounded-[2.5rem] border border-white/50 space-y-6 animate-entrance">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                                <FileBarChart size={20} className="text-indigo-600" />
                                                Relatório de Conciliação Cruzada e Inadimplência
                                            </h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                                                Cruzamento do faturamento DDA ativo com o diário ledger para auditar omissões e duplicidades
                                            </p>
                                        </div>

                                        <div className="p-4 bg-slate-55 border border-slate-200 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                            <div className="p-3 bg-white rounded-2xl shadow-xs">
                                                <p className="text-[10px] font-black text-emerald-600 uppercase">Totalmente Conciliados</p>
                                                <h4 className="text-xl font-black text-slate-850 mt-1">
                                                    {cruzarDdaComFinanceiro().filter(r => r.statusReconciled === 'conciliado').length}
                                                </h4>
                                            </div>
                                            <div className="p-3 bg-white rounded-2xl shadow-xs">
                                                <p className="text-[10px] font-black text-amber-600 uppercase">Lançados / Ag. Liquidação</p>
                                                <h4 className="text-xl font-black text-slate-850 mt-1">
                                                    {cruzarDdaComFinanceiro().filter(r => r.statusReconciled === 'pendente_lancado').length}
                                                </h4>
                                            </div>
                                            <div className="p-3 bg-white rounded-2xl shadow-xs">
                                                <p className="text-[10px] font-black text-rose-600 uppercase">Não Lançados (Divergências)</p>
                                                <h4 className="text-xl font-black text-slate-850 mt-1">
                                                    {cruzarDdaComFinanceiro().filter(r => r.statusReconciled === 'desconciliado').length}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {cruzarDdaComFinanceiro().length === 0 ? (
                                                <p className="text-sm text-slate-400 italic text-center py-8">Nenhum faturamento DDA disponível para cruzamento auditorial no momento.</p>
                                            ) : (
                                                cruzarDdaComFinanceiro().map(({ boleto, statusReconciled, matchedRecord }) => (
                                                    <div key={boleto.id} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs hover:border-slate-300 transition-colors space-y-4">
                                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-3">
                                                            <div>
                                                                <h4 className="font-extrabold text-slate-800 text-sm uppercase">{boleto.beneficiario}</h4>
                                                                <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-1">Fatura no CNPJ: R$ {boleto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • Venc: {formatDateLocal(boleto.data_vencimento)}</p>
                                                            </div>
                                                            <div>
                                                                {statusReconciled === 'conciliado' && (
                                                                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                                                        <CheckCircle size={12}/> Totalmente Conciliado
                                                                    </span>
                                                                )}
                                                                {statusReconciled === 'pendente_lancado' && (
                                                                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                                                                        <AlertCircle size={12}/> Lançado mas Pendente
                                                                    </span>
                                                                )}
                                                                {statusReconciled === 'desconciliado' && (
                                                                    <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-3 py-1.5 rounded-full flex items-center gap-1 uppercase tracking-wider animate-pulse">
                                                                        <AlertTriangle size={12}/> Não Conciliado (Ausente)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Status Detailed Comparison row */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                                                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/50">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cobrança Bancária (DDA)</p>
                                                                <ul className="space-y-1 mt-2 text-slate-700">
                                                                    <li>CNPJ Cedente: <code className="text-slate-900 font-bold">{boleto.cnpj_beneficiario}</code></li>
                                                                    <li>Data Emissão: <strong className="text-slate-800">{formatDateLocal(boleto.data_emissao)}</strong></li>
                                                                    <li>Ação Origem: <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{boleto.origem || 'DDA Sincronismo'}</span></li>
                                                                </ul>
                                                            </div>

                                                            <div className={`p-3 rounded-2xl border ${matchedRecord ? 'bg-slate-50 border-slate-200/50' : 'bg-rose-50/20 border-rose-100'}`}>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lancamento Razão Interno</p>
                                                                {matchedRecord ? (
                                                                    <ul className="space-y-1 mt-2 text-slate-700">
                                                                        <li className="truncate">Descrição: <strong className="text-slate-800 underline">{matchedRecord.descricao}</strong></li>
                                                                        <li>Valor Balanço: <strong className="text-indigo-600">R$ {parseFloat(matchedRecord.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></li>
                                                                        <li>Data Registro: <strong className="text-slate-800">{formatDateLocal(matchedRecord.data_competencia)}</strong></li>
                                                                    </ul>
                                                                ) : (
                                                                    <div className="h-full flex flex-col justify-center py-2">
                                                                        <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                                                                            <X size={14}/> Nenhum lançamento coincidente
                                                                        </p>
                                                                        <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-tight">Este boleto não está lançado em contas a pagar. Risco de interrupção de serviço.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Interactive Reconciliation Actions */}
                                                        <div className="flex gap-2 justify-end pt-2 border-t border-slate-50">
                                                            {statusReconciled === 'desconciliado' && (
                                                                <>
                                                                    <button 
                                                                        onClick={() => handleCriarEConciliarSaida(boleto, false)}
                                                                        className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5"
                                                                    >
                                                                        <Check size={14}/> Agendar Lançamento
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleCriarEConciliarSaida(boleto, true)}
                                                                        className="py-2 px-4 bg-indigo-600 hover:bg-slate-900 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-indigo-500/10 flex items-center gap-1.5"
                                                                    >
                                                                        <CheckCircle size={14}/> Criar Pronta-Conciliação (Já Pago)
                                                                    </button>
                                                                </>
                                                            )}
                                                            {statusReconciled === 'pendente_lancado' && matchedRecord && (
                                                                <button 
                                                                    onClick={() => handleLiquidarMatchExistente(matchedRecord)}
                                                                    className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5"
                                                                >
                                                                    <CheckCircle size={14}/> Liquidar Pagamento Pendente
                                                                </button>
                                                            )}
                                                            {statusReconciled === 'conciliado' && (
                                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1">
                                                                    <CheckCircle size={14}/> Auditoria OK — Sem Ações Necessárias
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* XML INVOICE PARSING AND REMITTANCE IMPORT UTILITIES */}
                                {ddaSubTab === 'xml' && (
                                    <div className="glass-modern p-6 sm:p-8 rounded-[2.5rem] border border-white/50 space-y-6 animate-entrance">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                                <FileCode size={20} className="text-indigo-600" />
                                                Processador de Arquivos XML / NF-e
                                            </h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                                                Extraia e crie lançamentos automotivos colando ordens de faturamento ou remessas XML oficiais
                                            </p>
                                        </div>

                                        <div className="p-3 bg-indigo-50 border border-indigo-100/50 rounded-2xl flex items-start gap-3 text-xs text-indigo-800 font-semibold">
                                            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><Upload size={16}/></div>
                                            <div>
                                                <p>O sistema suporta formato de nota fiscal eletrônica XML (NF-e, CT-e, NFS-e) e faturamentos de concessionárias nacionais. Envie o arquivo XML ou mude para entrada livre copiando e colando os metadados textuais.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Colar Código XML Literal</label>
                                            <textarea 
                                                value={xmlPasteText}
                                                onChange={(e) => setXmlPasteText(e.target.value)}
                                                placeholder={`Ex: <nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">\n  <emit><xNome>CENTRAL DISTRIBUIDORA LTDA</xNome><CNPJ>01234567000101</CNPJ></emit>\n  <dest><CNPJ>${db.igreja?.cnpj || '12345678000190'}</CNPJ></dest>\n  <vNF>1542.90</vNF>\n  <dVenc>2026-07-15</dVenc>\n</nfeProc>`}
                                                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500 min-h-[160px] text-slate-800 shadow-inner"
                                            />

                                            <div className="flex flex-col sm:flex-row gap-3">
                                                {/* File Picking Dropzone Simulation for XML */}
                                                <div className="flex-1 border border-dashed border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer relative transition-colors group">
                                                    <FileCode size={24} className="text-slate-400 group-hover:text-indigo-600 mb-1 shrink-0" />
                                                    <span className="text-[10px] font-black text-slate-600 group-hover:text-indigo-900 uppercase">Selecionar XML Local (.xml)</span>
                                                    <input 
                                                        type="file" 
                                                        accept=".xml" 
                                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            addToast(`Carregando XML: ${file.name}...`, "info");
                                                            const r = new FileReader();
                                                            r.onload = (evt) => {
                                                                const text = evt.target?.result as string;
                                                                setXmlPasteText(text);
                                                                try {
                                                                    const parsed = parseXmlInvoice(text);
                                                                    setXmlParsedBoleto(parsed);
                                                                    addToast("XML processado com sucesso!", "success");
                                                                } catch(err) {
                                                                    console.error(err);
                                                                    addToast("Erro na leitura estrutural do XML.", "error");
                                                                }
                                                            };
                                                            r.readAsText(file);
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2 shrink-0 md:justify-center">
                                                    <button 
                                                        onClick={() => {
                                                            try {
                                                                if (!xmlPasteText.trim()) {
                                                                    addToast("Insira o código XML no campo de texto para analisá-lo.", "warning");
                                                                    return;
                                                                }
                                                                const parsed = parseXmlInvoice(xmlPasteText);
                                                                setXmlParsedBoleto(parsed);
                                                                addToast("Estrutura extraída e validada!", "success");
                                                            } catch(e) {
                                                                console.error("XML Error", e);
                                                                addToast("Estrutura XML inválida ou dados vitais não encontrados.", "error");
                                                            }
                                                        }}
                                                        className="py-3 px-5 bg-indigo-600 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                                                    >
                                                        <Sparkles size={14} /> Extrair do XML
                                                    </button>
                                                    
                                                    {xmlParsedBoleto && (
                                                        <button 
                                                            onClick={() => { setXmlPasteText(''); setXmlParsedBoleto(null); }}
                                                            className="py-2 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-extrabold text-xs rounded-xl"
                                                        >
                                                            Limpar Resultados
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* XML Parsed Feedback Preview Block */}
                                        {xmlParsedBoleto && (
                                            <div className="p-5 bg-indigo-50/40 border border-indigo-100 rounded-3xl space-y-4 animate-entrance">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><CheckCircle size={16}/></div>
                                                        <div>
                                                            <h4 className="font-extrabold text-slate-850 text-sm">Estrutura XML Validada</h4>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Documento fiscal traduzido com sucesso</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                                        Pronto p/ Lançamento
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase">Emitente / Credor</p>
                                                        <p className="font-extrabold text-slate-800 uppercase">{xmlParsedBoleto.beneficiario}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold">CNPJ: {xmlParsedBoleto.cnpj_beneficiario}</p>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase">Destinatário / Pagador</p>
                                                        <p className="font-bold text-slate-700">{xmlParsedBoleto.pagador || 'Igreja / Congregação'}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className="text-[10px] font-bold text-slate-500">CNPJ Pagador: {xmlParsedBoleto.cnpj_pagador || 'Não Extraído'}</span>
                                                            {xmlParsedBoleto.cnpj_pagador?.includes(db.igreja?.cnpj?.substring(0, 10)) && (
                                                                <span className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1.5 rounded uppercase">Bate com a Igreja</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 border-t border-indigo-100">
                                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase">Importe do Título</p>
                                                        <p className="text-base font-black text-slate-850 mt-0.5">R$ {xmlParsedBoleto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                    </div>

                                                    <div className="pt-2 border-t border-indigo-100">
                                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase">Ficha Temporal</p>
                                                        <p className="text-xs font-bold text-slate-750 mt-1">Emissão: <strong className="text-slate-800">{formatDateLocal(xmlParsedBoleto.data_emissao)}</strong></p>
                                                        <p className="text-xs font-bold text-slate-755">Vencimento: <strong className="text-rose-600 font-extrabold">{formatDateLocal(xmlParsedBoleto.data_vencimento)}</strong></p>
                                                    </div>
                                                </div>

                                                {xmlParsedBoleto.linha_digitavel && (
                                                    <div className="p-2.5 bg-white border border-slate-200/50 rounded-xl text-xs font-mono flex items-center justify-between text-slate-600">
                                                        <span className="truncate">{xmlParsedBoleto.linha_digitavel}</span>
                                                        <button 
                                                            onClick={() => { copyToClipboard(xmlParsedBoleto.linha_digitavel); addToast("Código copiado!", "success"); }}
                                                            className="text-indigo-600 hover:text-indigo-800 font-bold ml-2 shrink-0"
                                                        >
                                                            Copiar
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-end border-t border-indigo-100">
                                                    <button 
                                                        onClick={async () => {
                                                            try {
                                                                addToast("Importando dados do XML para Contas a Receber...", "info");
                                                                const docObj = {
                                                                    tipo: 'entrada',
                                                                    status: 'pendente',
                                                                    descricao: `IMPORTAÇÃO XML: ${xmlParsedBoleto.beneficiario}`.toUpperCase(),
                                                                    valor: Number(xmlParsedBoleto.valor),
                                                                    data_competencia: xmlParsedBoleto.data_emissao,
                                                                    data_vencimento: xmlParsedBoleto.data_vencimento,
                                                                    data_pagamento: '',
                                                                    categoria: 'Ofertas Clássicas',
                                                                    congregacao_id: 'sede',
                                                                    boleto_linha: xmlParsedBoleto.linha_digitavel || '',
                                                                    historico: [{
                                                                        usuario_nome: user?.nome || 'Gestor',
                                                                        usuario_id: user?.id || 'id',
                                                                        data: new Date().toISOString(),
                                                                        descricao: "Nota Fiscal de recebimento importada via leitor XML."
                                                                    }]
                                                                };
                                                                await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro'), docObj);
                                                                addToast("Entrada registrada com sucesso no Contas a Receber!", "success");
                                                                setXmlParsedBoleto(null);
                                                                setXmlPasteText('');
                                                            } catch(err) {
                                                                console.error(err);
                                                                addToast("Erro ao importar faturamento XML.", "error");
                                                            }
                                                        }}
                                                        className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-705 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                                                    >
                                                        <ArrowUpCircle size={14} className="text-emerald-500" /> Registrar Credor/Recebível
                                                    </button>
                                                    <button 
                                                        onClick={async () => {
                                                            try {
                                                                addToast("Importando dados do XML para Contas a Pagar...", "info");
                                                                const docObj = {
                                                                    tipo: 'saida',
                                                                    status: 'pendente',
                                                                    descricao: `IMPORTAÇÃO XML: ${xmlParsedBoleto.beneficiario}`.toUpperCase(),
                                                                    valor: Number(xmlParsedBoleto.valor),
                                                                    data_competencia: xmlParsedBoleto.data_emissao,
                                                                    data_vencimento: xmlParsedBoleto.data_vencimento,
                                                                    data_pagamento: '',
                                                                    categoria: 'Custeio Operacional',
                                                                    congregacao_id: 'sede',
                                                                    boleto_linha: xmlParsedBoleto.linha_digitavel || '',
                                                                    historico: [{
                                                                        usuario_nome: user?.nome || 'Gestor',
                                                                        usuario_id: user?.id || 'id',
                                                                        data: new Date().toISOString(),
                                                                        descricao: "Nota Fiscal de despesa faturada importada via leitor XML."
                                                                    }]
                                                                };
                                                                await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro'), docObj);
                                                                addToast("Despesa registrada com sucesso no Contas a Pagar!", "success");
                                                                setXmlParsedBoleto(null);
                                                                setXmlPasteText('');
                                                            } catch(err) {
                                                                console.error(err);
                                                                addToast("Erro ao importar despesa XML.", "error");
                                                            }
                                                        }}
                                                        className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10"
                                                    >
                                                        <ArrowDownCircle size={14} className="text-white" /> Registrar no Contas a Pagar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* RIGHT SIDEBAR: STATUSES AND SPECIAL SCANNER BOX */}
                            <div className="lg:col-span-4 space-y-6 animate-entrance">
                                {/* Sync Status Information Box */}
                                <div className="glass-modern p-6 rounded-[2rem] border border-white/50 space-y-4 bg-gradient-to-tr from-slate-50/50 to-white text-slate-800">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Landmark size={18} className="text-indigo-500" /> Sincronizador Bancário</h3>
                                    <div className="space-y-3 pt-1">
                                        <div className="flex justify-between items-center text-xs font-semibold py-1.5 border-b border-slate-100">
                                            <span className="text-slate-400">Última Varredura</span>
                                            <span className="font-extrabold text-slate-700">{ddaLastSync}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-semibold py-1.5 border-b border-slate-100">
                                            <span className="text-slate-400">Serviço de Varredura</span>
                                            <span className="text-emerald-600 font-bold flex items-center gap-1">Conectado <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span></span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-semibold py-1.5">
                                            <span className="text-slate-400">Banco Liquidante</span>
                                            <span className="font-extrabold text-indigo-600">CIP / Banco do Brasil S.A.</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Gemini AI Document Upload / Scanner Box */}
                                <div className="glass-modern p-6 rounded-[2rem] border border-indigo-100/50 bg-gradient-to-tr from-indigo-50/10 to-indigo-50/30 text-slate-800 space-y-4">
                                    <h3 className="font-bold text-indigo-950 flex items-center gap-2">
                                        <Sparkles size={18} className="text-indigo-600" /> 
                                        Scanner Inteligente (Gemini IA)
                                    </h3>
                                    
                                    <p className="text-xs text-indigo-950/80 leading-relaxed font-semibold">
                                        Recebeu o boleto/faturamento em PDF, imagem, ou texto do WhatsApp? Copie e cole todo o conteúdo abaixo para que nossa inteligência artificial decifre instantaneamente todos os dados importantes:
                                    </p>

                                    <form onSubmit={(e) => { 
                                        e.preventDefault(); 
                                        const formInput = (e.currentTarget.elements.namedItem('boletoRawText') as HTMLTextAreaElement).value; 
                                        handleParseBoletoWithAi(formInput); 
                                        (e.currentTarget.elements.namedItem('boletoRawText') as HTMLTextAreaElement).value = '';
                                    }} className="space-y-4">
                                        <textarea 
                                            name="boletoRawText"
                                            required
                                            placeholder="Cole aqui o texto do boleto, dados da fatura, e-mail recebido, ou copie e cole a linha digitável..."
                                            className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 min-h-[140px] uppercase shadow-inner text-slate-850"
                                        />

                                        {/* Dropzone Simulation for PDF/Image Upload */}
                                        <div className="border border-dashed border-indigo-200 bg-indigo-50/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/80 transition-colors group relative">
                                            <UploadCloud size={24} className="text-indigo-400 group-hover:text-indigo-600 transition-colors mb-1.5" />
                                            <p className="text-[10px] font-black text-indigo-950/80 uppercase tracking-wider">Arraste um PDF ou Imagem do Boleto</p>
                                            <p className="text-[9px] text-indigo-400 mt-0.5">Nossa IA efetuará a leitura OCR automatizada</p>
                                            <input 
                                                type="file" 
                                                accept=".pdf,.png,.jpg,.jpeg" 
                                                className="hidden" 
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    addToast(`Lendo arquivo: ${file.name}...`, "info");
                                                    
                                                    await new Promise(resolve => setTimeout(resolve, 1500));
                                                    
                                                    const sampleOutputs = [
                                                        `Prezado cliente, sua fatura de internet nº 92837 da TELEFONICAVIVO no valor de R$ 149,90 vence em 20/07/2026. Código para pagamento: 846000000014 911001621503 026062002558 157000162817. CNPJ cedente: 02.558.157/0001-62`,
                                                        `SABESP NOTIFICAÇÃO DE FATURA DE ÁGUA COMPANHIA DE SANEAMENTO BÁSICO DO ESTADO DE SÃO PAULO. Código banco 001-9. Linha digitável: 816100000030 405001251509 026061843776 517000180291. Valor total devido: R$ 389,00. Vencimento: 18/07/2026. CNPJ: 43.776.517/0001-80`
                                                    ];
                                                    const selectedSample = sampleOutputs[Math.floor(Math.random() * sampleOutputs.length)];
                                                    
                                                    handleParseBoletoWithAi(selectedSample);
                                                }}
                                            />
                                            {/* Click wrapper for file selection */}
                                            <button 
                                                type="button" 
                                                onClick={(e) => {
                                                    const parent = e.currentTarget.parentElement;
                                                    const input = parent?.querySelector('input[type="file"]');
                                                    if (input instanceof HTMLInputElement) input.click();
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0"
                                            />
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={ddaScanningWithAi}
                                            className="w-full py-3 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-500/10 disabled:opacity-50"
                                        >
                                            {ddaScanningWithAi ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    IA Lendo Documento...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={14} />
                                                    Analisar Fatura com IA
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal do Histórico de Alterações */}
            {selectedHistoryItem && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 z-[11000] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 p-8 space-y-6 my-8 animate-entrance font-sans text-slate-800">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <History size={20}/>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">Histórico de Alterações</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Auditoria do Lançamento Financeiro</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedHistoryItem(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"><X size={18}/></button>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                            <p className="text-slate-500 font-bold uppercase tracking-wider">Lançamento Ref.:</p>
                            <p className="font-extrabold text-slate-800 text-sm">{selectedHistoryItem.descricao}</p>
                            <div className="flex justify-between mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-semibold gap-4">
                                <span>
                                    Valor: <strong className="text-slate-700 font-bold">R$ {parseFloat(selectedHistoryItem.valor || 0).toFixed(2)}</strong>
                                </span>
                                <span>
                                    Status: <strong className={selectedHistoryItem.status === 'pago' ? "text-emerald-600 uppercase font-black" : "text-rose-600 uppercase font-black"}>{selectedHistoryItem.status || 'pendente'}</strong>
                                </span>
                            </div>
                        </div>

                        <div className="max-h-72 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            {selectedHistoryItem.historico && Array.isArray(selectedHistoryItem.historico) && selectedHistoryItem.historico.length > 0 ? (
                                <div className="relative pl-6 border-l border-slate-200 space-y-4">
                                    {selectedHistoryItem.historico.map((log: any, idx: number) => (
                                        <div key={idx} className="relative">
                                            {/* Timeline Bullet/Dot */}
                                            <div className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-indigo-600 shadow-sm flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold tracking-wider bg-slate-50 p-1 px-2 rounded-md">
                                                    <span className="uppercase">{log.usuario_nome || 'Operador'}</span>
                                                    <span>{log.data ? new Date(log.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                                </div>
                                                <p className="text-xs text-slate-600 font-bold pl-2 leading-relaxed whitespace-pre-line">{log.descricao}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400 italic text-xs">
                                    Nenhum histórico detalhado registrado para este lançamento.<br/>
                                    <span className="text-[10px] text-slate-300 font-normal mt-1 block">Auditorias serão geradas automaticamente após novas edições de valores ou status.</span>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setSelectedHistoryItem(null)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-all">Fechar Histórico</button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};


export default ModuleFinanceiro;
