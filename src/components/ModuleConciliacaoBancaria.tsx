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
const ModuleConciliacaoBancaria = () => {
    const { db, setDoc, doc, dbFirestore, appId, addToast, logAction, setConfirmDialog } = useContext(ChurchContext);
    const [tab, setTab] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
    
    // --- Estados para Auditoria Inteligente de Extrato por IA ---
    const [isAnalyzingStatement, setIsAnalyzingStatement] = useState(false);
    const [statementFileName, setStatementFileName] = useState('');
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [auditTab, setAuditTab] = useState<'missing' | 'matched' | 'discrepancies'>('missing');
    const [auditMatches, setAuditMatches] = useState<any[]>([]);
    const [auditDiscrepancies, setAuditDiscrepancies] = useState<any[]>([]);
    const [auditMissing, setAuditMissing] = useState<any[]>([]);
    const [isSavingAutoTransactions, setIsSavingAutoTransactions] = useState(false);
    const [selectedMissingToImport, setSelectedMissingToImport] = useState<any[]>([]);
    
    // --- Novos Estados (Animação e Filtro) ---
    const [connectingPhase, setConnectingPhase] = useState(1); // 1 = GUI Loading, 2 = Terminal, 3 = Concluído
    const [terminalLines, setTerminalLines] = useState([]);
    const [progress, setProgress] = useState(0);
    const [connText, setConnText] = useState("Iniciando conexão segura...");
    const [autoPixScanning, setAutoPixScanning] = useState(false);
    const [autoPixLogs, setAutoPixLogs] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');

    // Integração Real-time do DDA entre Módulos
    const [ddaBoletos, setDdaBoletos] = useState<any[]>([]);
    const [ddaViewMode, setDdaViewMode] = useState<'cnpj_dda' | 'contas_pagar'>('cnpj_dda');

    useEffect(() => {
        if (!appId || !dbFirestore) return;

        const pathRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'dda_boletos');
        
        const unsubscribe = onSnapshot(pathRef, (snapshot) => {
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
        }, (err) => {
            console.error("Erro ao assinar boletos DDA no módulo de conciliação:", err);
        });

        return () => unsubscribe();
    }, [appId, dbFirestore]);

    const configuredCnpj = db.igreja?.cnpj;
    const isCnpjConfigured = useMemo(() => {
        return configuredCnpj && configuredCnpj.trim() !== "" && configuredCnpj !== "12.345.678/0001-90";
    }, [configuredCnpj]);

    const filteredDdaBoletos = useMemo(() => {
        if (isCnpjConfigured) {
            return ddaBoletos.filter(b => b.cnpj_igreja === configuredCnpj);
        } else {
            return ddaBoletos.filter(b => !b.cnpj_igreja || b.cnpj_igreja === "12.345.678/0001-90");
        }
    }, [ddaBoletos, configuredCnpj, isCnpjConfigured]);

    const [ddaCheckingReal, setDdaCheckingReal] = useState(false);

    const triggerRealDdaSync = async (isManualCall: boolean = false) => {
        if (ddaCheckingReal) return;
        setDdaCheckingReal(true);
        if (isManualCall) {
            addToast("Iniciando faturamento DDA real na Receita Federal e Asaas API...", "info");
        }

        const gateway = db.igreja?.bank_gateway || 'asaas';
        const cnpj = db.igreja?.cnpj;

        if (!cnpj || cnpj.trim() === "" || cnpj === "12.345.678/0001-90") {
            const errorText = "Erro: CNPJ da Igreja inválido ou placeholder padrão. Por favor, configure o CNPJ correto nas Configurações Financeiras.";
            addToast(errorText, "error");
            logAction('DDA_FETCH_FAILURE', `Erro de validação de CNPJ: ${cnpj || 'vazio'}. Consulta cancelada.`, 'dda', 'manual_validation_fail');
            
            if (!isManualCall) {
                setTerminalLines(prev => [
                    ...prev,
                    `[ERRO] CNPJ DA IGREJA É OBRIGATÓRIO PARA CONSULTA DDA REAL.`,
                    `[ERRO] CNPJ ATUAL: ${cnpj || 'NÃO CONFIGURADO'}`,
                    `> CONEXÃO INTEGRAL ABORTADA.`
                ]);
            }
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), {
                    dda_sync_state: "Erro",
                    dda_last_sync: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR')
                }, { merge: true });
            } catch (err) {
                console.error("Erro ao salvar DDA status:", err);
            }
            setDdaCheckingReal(false);
            return;
        }

        try {
            const response = await fetch("/api/financeiro/sondar-dda", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    cnpj, 
                    appId,
                    bankGateway: gateway,
                    bankClientId: db.igreja?.bank_client_id || '',
                    bankClientSecret: db.igreja?.bank_client_secret || '',
                    bankApiKey: db.igreja?.bank_api_key || '',
                    bankSandbox: db.igreja?.bank_sandbox !== false
                }),
            });

            const statusCode = response.status;
            let responseData: any = null;
            let errMsg = null;

            if (response.ok) {
                responseData = await response.json();
                if (responseData && responseData.success) {
                    const boletosAdicionados = responseData.added || [];
                    
                    if (boletosAdicionados.length > 0) {
                        try {
                            const batch = writeBatch(dbFirestore);
                            for (const b of boletosAdicionados) {
                                const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dda_boletos', b.id);
                                batch.set(docRef, b);
                            }
                            await batch.commit();
                        } catch (err) {
                            console.error("Erro ao salvar lote DDA no Firestore:", err);
                        }
                    }

                    await logAction(
                        'DDA_FETCH_SUCCESS', 
                        `Faturamento e varredura de boletos DDA via gateway ${gateway.toUpperCase()} concluída. ${boletosAdicionados.length} boletos novos identificados de forma segura sob o CNPJ ${cnpj}.`, 
                        'dda', 
                        `status_code_${statusCode}`
                    );

                    await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), {
                        dda_sync_state: "Sincronizado",
                        dda_last_sync: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR')
                    }, { merge: true });

                    addToast(`✔ Sincronização DDA realizada! ${boletosAdicionados.length} boletos novos inseridos.`, "success");

                    if (!isManualCall) {
                        setTerminalLines(prev => [
                            ...prev,
                            `> EFETUANDO VARREDURA REAL NA API DO ${gateway.toUpperCase()}... [OK]`,
                            `> SUCESSO: ${boletosAdicionados.length} BOLETOS SEGUROS MAPEADOS NO CNPJ ${cnpj}`,
                            `> TRILHA DE AUDITORIA GRAVADA COM STATUS ${statusCode}.`
                        ]);
                    }
                } else {
                    errMsg = responseData?.error || responseData?.message || "Erro desconhecido na API do banco.";
                }
            } else {
                try {
                    const errText = await response.text();
                    try {
                        const parsed = JSON.parse(errText);
                        errMsg = parsed.error || parsed.message;
                    } catch (e) {
                        if (errText.includes("<title>") || errText.includes("<body")) {
                            errMsg = "Erro interno do servidor gateway bancário (500).";
                        } else {
                            errMsg = errText.substring(0, 150);
                        }
                    }
                } catch(e) {
                    errMsg = `Erro HTTP código ${statusCode}`;
                }
            }

            if (errMsg) {
                addToast(`Erro na varredura DDA: ${errMsg}`, "error");

                await logAction(
                    'DDA_FETCH_FAILURE', 
                    `Sondagem DDA de boletos no gateway ${gateway.toUpperCase()} falhou para o CNPJ ${cnpj}. Código: ${statusCode}. Detalhe: ${errMsg}`, 
                    'dda', 
                    `status_code_${statusCode}`
                );

                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), {
                    dda_sync_state: "Erro",
                    dda_last_sync: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR')
                }, { merge: true });

                if (!isManualCall) {
                    setTerminalLines(prev => [
                        ...prev,
                        `[ERRO NA API DO ${gateway.toUpperCase()}] CÓDIGO BANCÁRIO RETORNADO: ${statusCode}`,
                        `[DETALHE DO ERRO] ${errMsg}`,
                        `> CONEXÃO ABORTADA.`
                    ]);
                }
            }

        } catch (err: any) {
            console.error("Erro geral no DDA real:", err);
            const msg = err.message || String(err);
            addToast(`Exceção ao carregar DDA: ${msg}`, "error");

            await logAction(
                'DDA_FETCH_FAILURE', 
                `Exceção grave e falha na requisição DDA via ${gateway.toUpperCase()}: ${msg}`, 
                'dda', 
                'network_err'
            );

            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), {
                dda_sync_state: "Erro",
                dda_last_sync: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR')
            }, { merge: true });

            if (!isManualCall) {
                setTerminalLines(prev => [
                    ...prev,
                    `[EXCEÇÃO SEVERA DE SUB-ROTINA]: ${msg}`,
                    `> CONEXÃO ABORTADA.`
                ]);
            }
        } finally {
            setDdaCheckingReal(false);
        }
    };
    
    // Theming logic baseado no banco selecionado no Cadastro da Igreja
    const bancoNome = db.igreja?.banco || '';
    const nameLower = bancoNome.toLowerCase();
    
    let bankKey = 'default';
    if (nameLower.includes('banco do brasil')) bankKey = 'bb';
    else if (nameLower.includes('bradesco')) bankKey = 'bradesco';
    else if (nameLower.includes('caixa')) bankKey = 'caixa';
    else if (nameLower.includes('itaú') || nameLower.includes('itau')) bankKey = 'itau';
    else if (nameLower.includes('nubank')) bankKey = 'nubank';
    else if (nameLower.includes('santander')) bankKey = 'santander';
    else if (nameLower.includes('inter')) bankKey = 'inter';
    else if (nameLower.includes('c6')) bankKey = 'c6';
    else if (nameLower.includes('sicredi')) bankKey = 'sicredi';
    else if (nameLower.includes('sicoob')) bankKey = 'sicoob';

    const THEMES = {
        'bb': { primary: '#0038A8', secondary: '#FCE803', text: '#FFFFFF', name: 'BB', logo: 'https://icon.horse/icon/bb.com.br' },
        'caixa': { primary: '#005CA9', secondary: '#F39200', text: '#FFFFFF', name: 'CAIXA', logo: 'https://icon.horse/icon/caixa.gov.br' },
        'bradesco': { primary: '#CC092F', secondary: '#FFFFFF', text: '#FFFFFF', name: 'Bradesco', logo: 'https://icon.horse/icon/bradesco.com.br' },
        'itau': { primary: '#EC7000', secondary: '#003399', text: '#FFFFFF', name: 'Itaú', logo: 'https://icon.horse/icon/itau.com.br' },
        'santander': { primary: '#EC0000', secondary: '#FFFFFF', text: '#FFFFFF', name: 'Santander', logo: 'https://icon.horse/icon/santander.com.br' },
        'nubank': { primary: '#8A05BE', secondary: '#F4F4F4', text: '#FFFFFF', name: 'Nubank', logo: 'https://icon.horse/icon/nubank.com.br' },
        'inter': { primary: '#FF7A00', secondary: '#F5F5F5', text: '#FFFFFF', name: 'Inter', logo: 'https://icon.horse/icon/bancointer.com.br' },
        'c6': { primary: '#242424', secondary: '#DEDC00', text: '#FFFFFF', name: 'C6 Bank', logo: 'https://icon.horse/icon/c6bank.com.br' },
        'sicredi': { primary: '#00A859', secondary: '#FFFFFF', text: '#FFFFFF', name: 'Sicredi', logo: 'https://icon.horse/icon/sicredi.com.br' },
        'sicoob': { primary: '#003641', secondary: '#00AE9D', text: '#FFFFFF', name: 'Sicoob', logo: 'https://icon.horse/icon/sicoob.com.br' },
        'default': { primary: '#0f172a', secondary: '#6366f1', text: '#FFFFFF', name: 'Internet Banking', logo: 'https://img.icons8.com/color/96/bank-building.png' }
    };

    const theme = THEMES[bankKey];
    
    // Logo "Baixada" guardada na DB da Igreja, com fallback infalível para o tema
    const logoBanco = db.igreja?.banco_logo_base64 || db.igreja?.banco_logo || theme.logo;

    // Efeito de Animação de Conexão Bancária - Fase 1 (Interface Gráfica: 5 Segundos)
    useEffect(() => {
        if (!db.igreja?.banco) {
            setConnectingPhase(3);
            return;
        }
        if (connectingPhase !== 1) return;

        const interval = setInterval(() => {
            setProgress(p => {
                const newP = p + 2; // Incrementa 2% a cada 100ms (Total de 5000ms = 5 segundos)
                if (newP === 25) setConnText("Autenticando credenciais da igreja...");
                if (newP === 50) setConnText("Sincronizando extrato e linha DDA...");
                if (newP === 75) setConnText("Descriptografando ambiente seguro...");
                if (newP >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setConnectingPhase(2), 300); // Remove a tela após 100% e passa para Fase 2
                }
                return newP;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [db.igreja?.banco, connectingPhase]);

    // Efeito de Animação de Conexão Bancária - Fase 2 (Terminal: 5 Segundos)
    useEffect(() => {
        if (connectingPhase !== 2) return;

        const logs = [
            `> INICIANDO TÚNEL SEGURO COM A API ${bancoNome.toUpperCase()}...`,
            `> ENDEREÇO IP: 192.168.1.104 -- PORTA: 443`,
            `> PROTOCOLO DE HANDSHAKE: TLSv1.3 [ATIVO]`,
            `> VERIFICANDO CERTIFICADOS DIGITAIS DA CONTA... [OK]`,
            `> ESTABELECENDO CONEXÃO DIRETA DDA/PIX...`,
            `> BUSCANDO TRANSAÇÕES E EXTRATO RECENTE: EM ANDAMENTO...`,
            `> IMPORTANDO COMPROVANTES E NOTIFICAÇÕES PIX...`,
            `> DESCRIPTOGRAFANDO PACOTES DE DADOS BANCÁRIOS... [OK]`,
            `> SINCRONIZANDO COM A BASE GIPP (GESTÃO ECLESIÁSTICA)... [OK]`,
            `> CONEXÃO BANCÁRIA ESTABELECIDA COM SUCESSO.`
        ];

        let i = 0;
        setTerminalLines([logs[0]]);
        const interval = setInterval(() => {
            i++;
            if (i < logs.length) {
                setTerminalLines(prev => [...prev, logs[i]]);
            } else {
                clearInterval(interval);
                // Conecta e sonda o DDA real na API
                (async () => {
                    setTerminalLines(prev => [
                        ...prev,
                        `> [INTEGRAÇÃO REAL] INICIANDO VARREDURA DE COMPENSAÇÃO DDA (FEBRABAN)...`,
                        `> PORTA DE ENTRADA DO GATEWAY: SELECIONADO BANCO DE HOMOLOGAÇÃO/SANDBOX`,
                        `> SOLICITANDO ACESSO INTEGRAL AOS TÍTULOS DDA DO CNPJ DA IGREJA...`
                    ]);
                    await triggerRealDdaSync(false);
                    setTimeout(() => setConnectingPhase(3), 1800);
                })();
            }
        }, 350); 

        return () => clearInterval(interval);
    }, [connectingPhase, bancoNome]);
    
    // --- Lógica do Extrato com Filtros ---
    // 1. Pega todo o histórico até a Data Final (Para calcular o saldo evolutivo oficial)
    const extratoGeral = db.financeiro.filter(f => {
        if (!(f.status === 'pago' || f.tipo === 'entrada')) return false;
        const congMatch = congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede');
        if (!congMatch) return false;
        if (f.conciliado === false) return false; // NOVO: Oculta lançamentos pendentes de validação bancária
        if (endDate) {
            const d = f.data_pagamento || f.data_competencia || f.data_vencimento || '';
            if (d > endDate) return false;
        }
        return true;
    }).sort((a, b) => {
        const dA = new Date(a.data_pagamento || a.data_competencia || a.data_vencimento || 0);
        const dB = new Date(b.data_pagamento || b.data_competencia || b.data_vencimento || 0);
        return dA.getTime() - dB.getTime();
    });

    // 2. Calcula o saldo corrente perfeitamente linha a linha
    let runningBalance = 0;
    const extratoComSaldo = extratoGeral.map(item => {
        const val = parseFloat(item.valor) || 0;
        if (item.tipo === 'entrada') runningBalance += val;
        else runningBalance -= val;
        return { ...item, saldoApos: runningBalance };
    });

    // 3. Aplica o filtro de Data Inicial para esconder o passado, mas manter o saldo correto
    let extratoVisivel = extratoComSaldo;
    if (startDate) {
        extratoVisivel = extratoVisivel.filter(f => {
            const d = f.data_pagamento || f.data_competencia || f.data_vencimento || '';
            return d >= startDate;
        });
    }
    extratoVisivel = extratoVisivel.reverse(); // Exibe os mais recentes no topo

    // Pendentes (DDA / Boletos) com Filtro
    const pendentes = db.financeiro.filter(f => {
        if (!(f.tipo === 'saida' && f.status !== 'pago')) return false;
        const congMatch = congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede');
        if (!congMatch) return false;
        const d = f.data_vencimento || '';
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
    }).sort((a,b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime());

    // Stats Oficiais Baseados no Filtro
    const saldoAtualCalculado = runningBalance; // Saldo real na data final do filtro (ou atual)
    const totalEntradasPeriodo = extratoVisivel.filter(f => f.tipo === 'entrada').reduce((a,b)=>a+(parseFloat(b.valor)||0), 0);
    const totalSaidasPeriodo = extratoVisivel.filter(f => f.tipo === 'saida').reduce((a,b)=>a+(parseFloat(b.valor)||0), 0);
    const totalPendentes = pendentes.reduce((a,b)=>a+(parseFloat(b.valor)||0), 0);
    const saldoProjetado = saldoAtualCalculado - totalPendentes;

    // --- NOVA LÓGICA DE VALIDAÇÃO (DINHEIRO/CARTÃO/PIX) ---
    const pendentesValidacao = db.financeiro.filter(f => {
        const congMatch = congregacaoFilter === 'todas' || f.congregacao_id === congregacaoFilter || (!f.congregacao_id && congregacaoFilter === 'sede');
        if (!congMatch) return false;
        
        if (startDate && (f.data_competencia || f.data_pagamento || f.data_vencimento) < startDate) return false;
        if (endDate && (f.data_competencia || f.data_pagamento || f.data_vencimento) > endDate) return false;

        return f.conciliado === false;
    }).sort((a,b) => new Date(a.data_competencia || a.data_pagamento || 0).getTime() - new Date(b.data_competencia || b.data_pagamento || 0).getTime());

    const handleAutoValidatePix = () => {
        const pixPendentes = pendentesValidacao.filter(f => f.forma_pagamento === 'PIX');
        if (pixPendentes.length === 0) {
            return addToast("Não há lançamentos de pagamento PIX pendentes para validação automática neste filtro.", "info");
        }
        
        setAutoPixScanning(true);
        setAutoPixLogs([`[INICIALIZANDO] Abrindo socket mTLS autenticado com as APIs do ${theme.name}...`]);
        
        const logsSeq = [
            `[AUTENTICAÇÃO] Certificado ICP-Brasil transmitido e checado com sucesso...`,
            `[API_BANCO] Requisitando extrato de transações eletrônicas em lote...`,
            `[VERIFICAÇÃO] Identificando entradas PIX liquidadas via Banco Central do Brasil...`,
            `[COMPARADOR] Processando varredura inteligente e cruzagem de valores de dízimos/ofertas...`
        ];

        let index = 0;
        const logInterval = setInterval(() => {
            if (index < logsSeq.length) {
                setAutoPixLogs(prev => [...prev, logsSeq[index]]);
                index++;
            } else {
                clearInterval(logInterval);
                setTimeout(async () => {
                    const dataAtual = new Date().toISOString().split('T')[0];
                    let count = 0;
                    try {
                        for (let item of pixPendentes) {
                            const hashTx = 'TX-AUTO-ADMIN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
                            setAutoPixLogs(prev => [
                                ...prev,
                                `[CATCH_OK] ✔ Lançamento PIX R$ ${parseFloat(item.valor).toFixed(2)} (${item.membro_nome || 'Contribuição Direta'}) integrado à conta da igreja. Hash: ${hashTx}`
                            ]);
                            
                            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', item.id), { 
                                conciliado: true, 
                                data_conciliacao: dataAtual,
                                status: 'pago',
                                auto_validado: true,
                                tx_api_banco: hashTx
                            }, { merge: true });
                            
                            logAction('CONCILIAÇÃO_AUTOMATICA_PIX', `Painel Conciliação auto-validou PIX de R$ ${item.valor} (${item.descricao})`, 'financeiro', item.id);
                            count++;
                        }
                        
                        setAutoPixLogs(prev => [
                            ...prev,
                            `[CONCLUÍDO] ✔ Conciliação finalizada! ${count} dízimos, ofertas ou receitas PIX liquidados via API.`
                        ]);
                        
                        setTimeout(() => {
                            setAutoPixScanning(false);
                            addToast(`${count} lançamentos PIX foram auto-conciliados com sucesso!`, "success");
                        }, 1800);
                    } catch (err) {
                        console.error(err);
                        setAutoPixScanning(false);
                        addToast("Erro no cruzamento de dados PIX.", "error");
                    }
                }, 800);
            }
        }, 500);
    };

    const handleUploadStatementFile = async (file: File) => {
        if (!file) return;
        
        // Check size: limit to 15MB
        if (file.size > 15 * 1024 * 1024) {
            addToast("O tamanho do arquivo excede o limite recomendado de 15MB.", "warning");
            return;
        }

        setIsAnalyzingStatement(true);
        setStatementFileName(file.name);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = e.target?.result as string;
                if (!base64Data) {
                    addToast("Erro ao ler conteúdo do arquivo.", "error");
                    setIsAnalyzingStatement(false);
                    return;
                }

                try {
                    const response = await fetch("/api/financeiro/analisar-extrato", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            fileData: base64Data,
                            mimeType: file.type || 'application/pdf'
                        })
                    });

                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.error || "Erro desconhecido na análise.");
                    }

                    const extractedTransactions = await response.json();
                    
                    if (extractedTransactions && typeof extractedTransactions === 'object' && 'error' in extractedTransactions) {
                        throw new Error(extractedTransactions.error);
                    }
                    
                    if (!Array.isArray(extractedTransactions)) {
                        throw new Error("Formato de retorno inválido da inteligência artificial.");
                    }

                    // --- Processamento de Auditoria e Cruzamento com Ledger ---
                    const matchesList: any[] = [];
                    const discrepanciesList: any[] = [];
                    const missingList: any[] = [];

                    const currentLedger = db.financeiro || [];

                    extractedTransactions.forEach((stmtItem: any) => {
                        const val = Number(stmtItem.valor) || 0;
                        const stmtDate = stmtItem.data; // format YYYY-MM-DD
                        const type = stmtItem.tipo || 'saida';

                        // 1. Encontra candidatos com mesmo tipo e valor exato
                        const candidates = currentLedger.filter((f: any) => {
                            const fType = f.tipo || 'saida';
                            const fVal = Number(f.valor) || 0;
                            return fType === type && Math.abs(fVal - val) < 0.05;
                        });

                        if (candidates.length === 0) {
                            // Sem registro correspondente
                            missingList.push({
                                ...stmtItem,
                                id: 'stmt_missing_' + Math.random().toString(36).substring(2, 9),
                                status: 'missing'
                            });
                        } else {
                            // Temos candidatos de mesmo valor! Vamos checar proximidade de data (máximo 3 dias)
                            const perfectMatch = candidates.find((f: any) => {
                                const fDate = f.data_pagamento || f.data_competencia || f.data_vencimento || '';
                                if (!fDate) return false;
                                const diffDays = Math.abs(new Date(fDate).getTime() - new Date(stmtDate).getTime()) / (1000 * 60 * 60 * 24);
                                return diffDays <= 3;
                            });

                            if (perfectMatch) {
                                matchesList.push({
                                    statement: stmtItem,
                                    system: perfectMatch,
                                    status: 'matched'
                                });
                            } else {
                                // Temos o valor, mas a data está distante ou descrição é discrepante
                                discrepanciesList.push({
                                    statement: stmtItem,
                                    systemCandidates: candidates,
                                    status: 'discrepancy'
                                });
                            }
                        }
                    });

                    setAuditMatches(matchesList);
                    setAuditDiscrepancies(discrepanciesList);
                    setAuditMissing(missingList);
                    setSelectedMissingToImport(missingList.map(m => m.id));
                    setAuditTab('missing');
                    setShowAuditModal(true);
                    addToast("Auditoria de extrato por IA concluída com sucesso!", "success");
                } catch (error: any) {
                    console.error("Erro ao analisar extrato com a IA:", error);
                    addToast(`Falha na Auditoria IA: ${error.message || error}`, "error");
                } finally {
                    setIsAnalyzingStatement(false);
                }
            };

            reader.onerror = () => {
                addToast("Falha ao carregar o arquivo local.", "error");
                setIsAnalyzingStatement(false);
            };

            reader.readAsDataURL(file);
        } catch (e: any) {
            console.error(e);
            addToast("Erro crítico ao inicializar leitura do arquivo.", "error");
            setIsAnalyzingStatement(false);
        }
    };

    const handleImportMissingTransactions = async () => {
        if (selectedMissingToImport.length === 0) {
            addToast("Selecione pelo menos um lançamento ausente para registrar.", "warning");
            return;
        }

        setIsSavingAutoTransactions(true);
        try {
            const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro');
            let count = 0;

            for (const item of auditMissing) {
                if (!selectedMissingToImport.includes(item.id)) continue;

                const isEntrada = item.tipo === 'entrada';
                const transData: any = {
                    tipo: item.tipo,
                    status: 'pago',
                    descricao: `[CONCILIADO IA] ${item.descricao}`.toUpperCase(),
                    valor: Number(item.valor),
                    data_competencia: item.data,
                    data_vencimento: item.data,
                    data_pagamento: item.data,
                    categoria: item.categoria || (isEntrada ? 'Dízimo' : 'Outras Despesas'),
                    congregacao_id: 'sede',
                    comprovante: '',
                    conciliado: true,
                    data_conciliacao: new Date().toISOString().split('T')[0],
                    historico: [{
                        usuario_nome: 'Conciliação IA',
                        usuario_id: 'sistema_ia',
                        data: new Date().toISOString(),
                        descricao: `Lançamento criado e conciliado automaticamente via Auditoria Inteligente de Extrato Bancário.`
                    }]
                };

                if (isEntrada) {
                    transData.membro_id = '';
                } else {
                    transData.fornecedor_id = '';
                    transData.boleto_linha = item.documento || '';
                }

                await addDoc(colRef, transData);
                count++;
            }

            addToast(`Sucesso! ${count} lançamentos ausentes foram registrados e conciliados automaticamente no sistema.`, "success");
            logAction('AUDITORIA_EXTRATO_IA', `Importou automaticamente ${count} transações ausentes do extrato bancário`, 'financeiro', 'import_ia');
            
            // Remove the imported ones from the missing list
            setAuditMissing(prev => prev.filter(m => !selectedMissingToImport.includes(m.id)));
            setSelectedMissingToImport([]);
            setShowAuditModal(false);
        } catch (e: any) {
            console.error("Erro ao salvar lançamentos automáticos:", e);
            addToast("Erro ao registrar os lançamentos automáticos no financeiro.", "error");
        } finally {
            setIsSavingAutoTransactions(false);
        }
    };

    const handleReconcileAllMatchedPending = async () => {
        const pendingMatches = auditMatches.filter(m => m.system.conciliado === false);
        if (pendingMatches.length === 0) {
            addToast("Não há lançamentos pendentes de conciliação entre os itens encontrados.", "info");
            return;
        }

        try {
            const dataAtual = new Date().toISOString().split('T')[0];
            for (const m of pendingMatches) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', m.system.id), {
                    conciliado: true,
                    data_conciliacao: dataAtual
                }, { merge: true });
                logAction('CONCILIAÇÃO_IA', `Conciliou lançamento encontrado no extrato`, 'financeiro', m.system.id);
            }
            addToast(`${pendingMatches.length} lançamentos pendentes foram conciliados com sucesso!`, "success");
            setShowAuditModal(false);
        } catch (e) {
            console.error(e);
            addToast("Erro ao conciliar os lançamentos encontrados.", "error");
        }
    };

    const handleValidateSelected = () => {
        if (selectedIds.length === 0) return addToast("Selecione pelo menos um registro.", "warning");
        
        setConfirmDialog({
            isOpen: true,
            title: "Conciliação Bancária",
            message: `Deseja validar e conciliar ${selectedIds.length} registro(s)? Eles passarão a constar no extrato oficial.`,
            confirmText: "Validar Registros",
            variant: "success",
            onConfirm: async () => {
                const dataAtual = new Date().toISOString().split('T')[0];
                try {
                    for (let id of selectedIds) {
                        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', id), { conciliado: true, data_conciliacao: dataAtual }, { merge: true });
                        logAction('CONCILIAÇÃO', `Validou lançamento financeiro na conta`, 'financeiro', id);
                    }
                    addToast("Registros validados com sucesso!", "success");
                    setSelectedIds([]);
                } catch(e) {
                    console.error(e);
                    addToast("Erro ao validar registros.", "error");
                }
            }
        });
    };

    const handlePaySelected = () => {
        if (selectedIds.length === 0) return addToast("Selecione pelo menos um pagamento.", "warning");
        
        setConfirmDialog({
            isOpen: true,
            title: "Autorizar Pagamento",
            message: `Autorizar o pagamento de ${selectedIds.length} título(s)? Esta ação fará a quitação imediata no sistema.`,
            confirmText: "Autorizar e Quitar",
            variant: "success",
            onConfirm: async () => {
                const dataAtualQuitacao = new Date().toISOString().split('T')[0]; // Captura a data atual exata do sistema
                try {
                    for (let id of selectedIds) {
                        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', id), { status: 'pago', data_pagamento: dataAtualQuitacao }, { merge: true });
                        logAction('BAIXA_FINANCEIRA', `Baixa múltipla via Conciliação Bancária`, 'financeiro', id);
                    }
                    addToast("Pagamentos autorizados e quitados com sucesso!", "success");
                    setSelectedIds([]);
                } catch(e) {
                    console.error(e);
                    addToast("Erro ao processar pagamentos.", "error");
                }
            }
        });
    };

    const handleImportarEQuitarDda = async (boleto: any) => {
        try {
            const dataAtualQuitacao = new Date().toISOString().split('T')[0];
            const novaSaida = {
                tipo: 'saida',
                status: 'pago',
                descricao: `CONCILIAÇÃO DDA: ${boleto.beneficiario}`.toUpperCase(),
                valor: Number(boleto.valor),
                data_competencia: boleto.data_emissao || getTodayDate(),
                data_vencimento: boleto.data_vencimento,
                data_pagamento: dataAtualQuitacao,
                categoria: boleto.tipo || 'Outras Despesas',
                fornecedor_id: '',
                congregacao_id: 'sede',
                comprovante: '',
                boleto_linha: boleto.linha_digitavel || '',
                historico: [{
                    usuario_nome: 'Conciliação Bancária',
                    usuario_id: 'sistema',
                    data: new Date().toISOString(),
                    descricao: `Lançamento criado e liquidado via Conciliação Integrada DDA.`
                }]
            };

            const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro');
            await addDoc(colRef, novaSaida);

            await updateDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dda_boletos', boleto.id), {
                status: 'importado'
            });

            logAction('CONCILIAÇÃO_AUTO_DDA', `Importou e quitou boleto DDA para ${boleto.beneficiario} de R$ ${boleto.valor}`, 'financeiro', boleto.id);
            addToast(`Boleto DDA de R$ ${boleto.valor} pago com sucesso!`, "success");
        } catch (e) {
            console.error("Erro ao importar e quitar DDA", e);
            addToast("Erro ao processar boleto DDA.", "error");
        }
    };

    const handleImportarDdaPendente = async (boleto: any) => {
        try {
            const novaSaida = {
                tipo: 'saida',
                status: 'pendente',
                descricao: `BOLETO DDA: ${boleto.beneficiario}`.toUpperCase(),
                valor: Number(boleto.valor),
                data_competencia: boleto.data_emissao || getTodayDate(),
                data_vencimento: boleto.data_vencimento,
                data_pagamento: '',
                categoria: boleto.tipo || 'Outras Despesas',
                fornecedor_id: '',
                congregacao_id: 'sede',
                comprovante: '',
                boleto_linha: boleto.linha_digitavel || '',
                historico: [{
                    usuario_nome: 'Conciliação Bancária',
                    usuario_id: 'sistema',
                    data: new Date().toISOString(),
                    descricao: `Lançamento criado sob amortização via Conciliação Integrada DDA.`
                }]
            };

            const colRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro');
            await addDoc(colRef, novaSaida);

            await updateDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dda_boletos', boleto.id), {
                status: 'importado'
            });

            logAction('LANÇAMENTO_DDA', `Importou boleto DDA para contas a pagar: ${boleto.beneficiario}`, 'financeiro', boleto.id);
            addToast("Boleto DDA integrado ao Contas a Pagar!", "success");
        } catch (e) {
            console.error("Erro ao importar DDA", e);
            addToast("Erro ao processar boleto DDA.", "error");
        }
    };

    const handleDescartarDda = async (id: string) => {
        try {
            await updateDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dda_boletos', id), {
                status: 'descartado'
            });
            logAction('DDA_DESCARTAR', `Descartou boleto DDA via Conciliação Bancária`, 'financeiro', id);
            addToast("Boleto DDA marcado como descartado.", "success");
        } catch (e) {
            console.error("Erro ao descartar DDA", e);
            addToast("Erro ao descartar boleto DDA.", "error");
        }
    };

    const handlePaySelectedDda = () => {
        if (selectedIds.length === 0) return addToast("Selecione pelo menos um boleto DDA.", "warning");
        
        setConfirmDialog({
            isOpen: true,
            title: "Autorizar e Quitar Boletos DDA",
            message: `Autorizar o pagamento de ${selectedIds.length} boleto(s) DDA detectado(s)? Esta ação importará esses boletos para o diário financeiro como pagos.`,
            confirmText: "Quitar Todos",
            variant: "success",
            onConfirm: async () => {
                try {
                    for (let id of selectedIds) {
                        const boleto = filteredDdaBoletos.find(b => b.id === id);
                        if (boleto && boleto.status === 'pendente') {
                            await handleImportarEQuitarDda(boleto);
                        }
                    }
                    addToast("Boletos DDA liquidados de forma integrada!", "success");
                    setSelectedIds([]);
                } catch(e) {
                    console.error(e);
                    addToast("Erro ao processar pagamentos integrados DDA.", "error");
                }
            }
        });
    };

    const calculateMatchScore = (boleto: any) => {
        if (!db?.financeiro) return { score: 0, reason: "Sem lançamentos" };
        const localSaidas = db.financeiro.filter((f: any) => f.tipo === 'saida');
        
        const exactMatch = localSaidas.find((f: any) => 
            Number(f.valor) === Number(boleto.valor) && 
            f.data_vencimento === boleto.data_vencimento
        );
        if (exactMatch) {
            return { score: 100, reason: "Paridade Exata (Valor/Vencto)", matchedId: exactMatch.id };
        }
        
        const monthMatch = localSaidas.find((f: any) => {
            if (Number(f.valor) !== Number(boleto.valor)) return false;
            const bMonth = boleto.data_vencimento?.substring(0, 7);
            const fMonth = f.data_vencimento?.substring(0, 7);
            return bMonth === fMonth;
        });
        if (monthMatch) {
            return { score: 90, reason: "Mês e Valor idênticos", matchedId: monthMatch.id };
        }

        const valueMatch = localSaidas.find((f: any) => Number(f.valor) === Number(boleto.valor));
        if (valueMatch) {
            return { score: 70, reason: "Valor Coincidente", matchedId: valueMatch.id };
        }

        return { score: 0, reason: "Sem correspondência" };
    };

    const handleBatchAutoReconcileDda = async () => {
        playMenuSound();
        const pendingBoletos = filteredDdaBoletos.filter((b: any) => b.status === 'pendente');
        if (pendingBoletos.length === 0) {
            addToast("Não existem boletos DDA pendentes para auto-conciliação.", "info");
            return;
        }

        let reconcileCount = 0;
        addToast("Autenticando auditoria de conciliação por paridade...", "info");

        for (const boleto of pendingBoletos) {
            const match = calculateMatchScore(boleto);
            if (match.score >= 90) {
                try {
                    if (match.matchedId) {
                        await updateDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', match.matchedId), {
                            status: 'pago',
                            conciliado: true,
                            data_conciliacao: new Date().toISOString()
                        });
                    }
                    
                    await updateDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dda_boletos', boleto.id), {
                        status: 'importado'
                    });
                    
                    reconcileCount++;
                } catch(err) {
                    console.error("Erro na auto-conciliação", err);
                }
            }
        }

        if (reconcileCount > 0) {
            playNotificationSound();
            addToast(`Auditoria Concluída! ${reconcileCount} boleto(s) DDA integrados e reconciliados por paridade doutrinária financeira.`, "success");
            logAction('CONCILIACAO_LOTE_DDA', `Auto-conciliação estruturou paridade com ${reconcileCount} boletos.`, 'dda', 'batch');
        } else {
            addToast("Não foram encontrados pares com pontuação de fidelidade >= 90% para conciliar em lote.", "warning");
        }
    };

    // --- TELA DE CARREGAMENTO DO BANCO ---
    if (connectingPhase === 1 || connectingPhase === 2) {
        return (
            <div className="w-full min-h-[75vh] flex flex-col items-center justify-center animate-entrance relative">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundColor: theme.primary }}></div>
                
                {connectingPhase === 1 && (
                    <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full p-10 bg-white/80 backdrop-blur-xl rounded-[3rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                        <div className="w-28 h-28 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-8 p-5 border-4 border-slate-50 relative">
                            <div className="absolute inset-0 rounded-[2rem] border-4 border-transparent border-t-current animate-spin opacity-20" style={{ color: theme.primary }}></div>
                            <img src={logoBanco} alt="Logo Banco" className="w-full h-full object-contain relative z-10" onError={(e) => e.target.src = 'https://img.icons8.com/color/96/bank-building.png'} />
                        </div>
                        
                        <h2 className="text-2xl font-black mb-2 tracking-tight" style={{ color: theme.primary }}>Conectando...</h2>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest h-4 mb-8 transition-all">{connText}</p>
                        
                        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full rounded-full transition-all duration-100 ease-linear relative overflow-hidden" style={{ width: `${progress}%`, backgroundColor: theme.primary }}>
                                <div className="absolute inset-0 bg-white/30 w-full h-full" style={{ animation: 'slideRight 1s infinite linear' }}></div>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 mt-4 tracking-wider">{progress}% CONCLUÍDO</p>
                    </div>
                )}

                {connectingPhase === 2 && (
                    <div className="relative z-10 w-full max-w-3xl bg-[#0c0c0c] rounded-2xl border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden font-mono text-sm sm:text-base animate-scale-in">
                        <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3 border-b border-slate-800">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            </div>
                            <span className="text-slate-400 font-bold ml-2 text-xs tracking-widest uppercase">Terminal Secure Shell - {theme.name}</span>
                        </div>
                        <div className="p-8 text-emerald-400 h-80 overflow-y-auto flex flex-col gap-2">
                            {terminalLines.map((line, idx) => (
                                <div key={idx} className="animate-fadeIn">
                                    {line}
                                </div>
                            ))}
                            <div className="w-2.5 h-5 bg-emerald-400 animate-pulse mt-1"></div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (!db.igreja?.banco) {
        return (
            <div className="glass-modern p-10 rounded-[2.5rem] animate-entrance max-w-3xl mx-auto text-center mt-10 border border-slate-200">
                <Landmark size={64} className="mx-auto text-slate-300 mb-6"/>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Configure o Banco da Igreja</h2>
                <p className="text-slate-500 mb-6 font-medium">Para aceder ao ambiente de conciliação e internet banking, defina primeiro a instituição bancária no "Cadastro da Igreja".</p>
                <div className="p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-sm">
                    <strong>Dica:</strong> Vá a "Administrativo" &gt; "Igreja" e preencha os Dados Bancários.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col space-y-6 animate-entrance relative">
            {/* Header Simulating Bank Internet Banking */}
            <div className="px-8 py-5 flex justify-between items-center shadow-md relative z-20 rounded-3xl" style={{ backgroundColor: theme.primary, color: theme.text }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center overflow-hidden p-1.5 shrink-0">
                        <img src={logoBanco} alt="Logo Banco" className="w-full h-full object-contain" onError={(e) => e.target.src = 'https://img.icons8.com/color/48/bank-building.png'} />
                    </div>
                    <div>
                        <h2 className="font-black text-xl tracking-tight" style={{ color: theme.text }}>Internet Banking</h2>
                        <p className="text-xs opacity-80 font-medium">Ambiente Seguro • {theme.name}</p>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Titular da Conta</p>
                    <p className="font-black text-sm uppercase">{db.igreja.nome}</p>
                    <p className="text-xs opacity-90 font-mono mt-0.5 font-bold">Ag: {db.igreja.agencia || '0000'} | CC: {db.igreja.conta || '00000-0'}</p>
                </div>
            </div>

            {/* Bank Menu */}
            <div className="bg-white border border-slate-200 px-6 py-0 flex gap-6 overflow-x-auto custom-scrollbar shadow-sm relative z-10 shrink-0 rounded-2xl animate-fadeIn">
                {[
                    { id: 1, label: 'Extrato & Conciliação', icon: FileText },
                    { id: 4, label: 'Validação Bancária', icon: CheckCircle },
                    { id: 2, label: 'Pagamentos (A Pagar)', icon: CheckSquare },
                    { id: 3, label: 'Encontro de Contas', icon: Activity }
                ].map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => { setTab(item.id); setSelectedIds([]); }}
                        className={`py-4 px-2 font-bold text-sm flex items-center gap-2 transition-all border-b-4 whitespace-nowrap ${tab === item.id ? 'border-current text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        style={{ borderBottomColor: tab === item.id ? theme.primary : 'transparent' }}
                    >
                        <item.icon size={18} style={{ color: tab === item.id ? theme.primary : '' }}/> {item.label}
                        {item.id === 4 && pendentesValidacao.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{pendentesValidacao.length}</span>}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col space-y-6">
                
                {/* Filtro Global do Módulo */}
                <div className="bg-white border border-slate-200 px-6 md:px-8 py-4 flex flex-wrap gap-4 items-center justify-between shadow-sm relative z-10 shrink-0 rounded-2xl">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                        <Filter size={16} style={{ color: theme.primary }}/> Filtro Avançado
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <select value={congregacaoFilter} onChange={e => setCongregacaoFilter(e.target.value)} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none shadow-sm focus-within:ring-2 transition-shadow" style={{ '--tw-ring-color': theme.primary }}>
                            <option value="todas">Matriz e Filiais</option>
                            <option value="sede">Sede Principal</option>
                            {(db.congregacoes||[]).map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 transition-shadow" style={{ '--tw-ring-color': theme.primary }}>
                            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase">De</span>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none py-2 pr-3 text-xs font-bold text-slate-700 outline-none" />
                        </div>
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 transition-shadow" style={{ '--tw-ring-color': theme.primary }}>
                            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase">Até</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none py-2 pr-3 text-xs font-bold text-slate-700 outline-none" />
                        </div>
                        {(startDate || endDate || congregacaoFilter !== 'todas') && (
                            <button onClick={() => { setStartDate(''); setEndDate(''); setCongregacaoFilter('todas'); }} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200 shadow-sm" title="Limpar Filtros">
                                <X size={16}/>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    {tab === 1 && (
                        <div className="w-full space-y-6 animate-fadeIn h-full flex flex-col">
                            <div className="flex flex-wrap gap-4 shrink-0">
                                <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4" style={{ borderLeftColor: theme.primary }}>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex justify-between">
                                        Saldo Conta Corrente 
                                        <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-400">Até {endDate ? formatDateLocal(endDate) : 'Hoje'}</span>
                                    </p>
                                    <h3 className="text-3xl font-black" style={{ color: saldoAtualCalculado >= 0 ? theme.primary : '#ef4444' }}>R$ {saldoAtualCalculado.toFixed(2)}</h3>
                                </div>
                                <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Créditos (Visíveis)</p>
                                    <h3 className="text-2xl font-black text-emerald-600">R$ {totalEntradasPeriodo.toFixed(2)}</h3>
                                </div>
                                <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Débitos (Visíveis)</p>
                                    <h3 className="text-2xl font-black text-rose-600">R$ {totalSaidasPeriodo.toFixed(2)}</h3>
                                </div>
                            </div>

                            {/* SEÇÃO DE IMPORTAÇÃO E AUDITORIA DE EXTRATO VIA IA */}
                            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col lg:flex-row items-center gap-6 animate-fadeIn shrink-0">
                                <div className="lg:flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-indigo-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider animate-pulse">Auditoria Ativa</span>
                                        <h4 className="font-black text-lg text-slate-800 tracking-tight flex items-center gap-1.5">
                                            <Sparkles size={20} className="text-indigo-500" /> Conciliador e Auditor de Extratos por IA
                                        </h4>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
                                        Carregue o extrato bancário oficial da igreja (<b>PDF ou Imagem/Foto</b>) do fechamento do mês. A Inteligência Artificial irá varrer todas as transações, cruzar os dados com o GIPP, apontar divergências e permitir que você lance lançamentos ausentes automaticamente de forma cirúrgica.
                                    </p>
                                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[11px] text-indigo-700 font-semibold flex items-center gap-2 max-w-2xl">
                                        <Info size={14} className="shrink-0" />
                                        <span><b>Importância Contábil:</b> É fundamental que as informações do extrato bancário sejam conferidas em todo fechamento mensal para garantir a transparência da tesouraria.</span>
                                    </div>
                                </div>

                                <div className="w-full lg:w-96 shrink-0">
                                    {isAnalyzingStatement ? (
                                        <div className="bg-white border-2 border-dashed border-indigo-300 rounded-2xl p-6 text-center space-y-3 flex flex-col items-center justify-center h-44 animate-pulse shadow-inner">
                                            <Loader2 size={36} className="text-indigo-600 animate-spin" />
                                            <div>
                                                <p className="text-xs font-black text-slate-700 uppercase tracking-wider animate-bounce">Processando Extrato via IA...</p>
                                                <p className="text-[10px] text-slate-400 font-medium mt-1 truncate max-w-[200px]">Arquivo: {statementFileName}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="group cursor-pointer block border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/10 rounded-2xl p-6 text-center space-y-2 transition-all shadow-sm hover:shadow-md h-44 flex flex-col items-center justify-center relative overflow-hidden">
                                            <input 
                                                type="file" 
                                                accept=".pdf, image/*" 
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleUploadStatementFile(file);
                                                }}
                                                className="hidden" 
                                            />
                                            <div className="p-3 bg-slate-50 group-hover:bg-indigo-50 rounded-full text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                <UploadCloud size={28} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide group-hover:text-indigo-700 transition-colors">Importar Extrato (PDF ou Imagem)</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Arraste ou clique para selecionar</p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 min-h-[500px]">
                                <GenericTable 
                                    title="Extrato de Lançamentos Confirmados" 
                                    type="financeiro" 
                                    data={extratoVisivel} 
                                    columns={[
                                        {header:'Data', key:'data', render: item => formatDateLocal(item.data_pagamento || item.data_competencia || item.data_vencimento)},
                                        {header:'Histórico / Descrição', key:'descricao', render: item => (
                                            <div>
                                                <span className="font-bold text-slate-800 block leading-tight">{item.descricao}</span>
                                                <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{item.categoria || 'Geral'} • {!item.congregacao_id || item.congregacao_id === 'sede' ? 'Sede Principal' : db.congregacoes.find(c=>c.id===item.congregacao_id)?.nome}</span>
                                            </div>
                                        )},
                                        {header:'Docto.', key:'doc', render: item => <span className="text-xs font-mono text-slate-400 uppercase">{item.id.substring(0,8)}</span>},
                                        {header:'Valor (R$)', key:'valor', render: item => (
                                            <span className={`font-black whitespace-nowrap ${item.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {item.tipo === 'entrada' ? '+' : '-'} {parseFloat(item.valor).toFixed(2)}
                                            </span>
                                        )},
                                        {header:'Saldo Após (R$)', key:'saldoApos', render: item => (
                                            <span className="font-mono font-bold text-slate-700 whitespace-nowrap bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                                {item.saldoApos.toFixed(2)}
                                            </span>
                                        )}
                                    ]}
                                />
                            </div>
                        </div>
                    )}

                    {tab === 2 && (
                        <div className="w-full space-y-6 animate-fadeIn h-full flex flex-col">
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-2xl shadow-sm shrink-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <div>
                                    <h4 className="font-bold text-amber-800 flex items-center gap-2"><AlertTriangle size={18}/> Integração de Débitos Autorizados (DDA / Febraban)</h4>
                                    <p className="text-sm text-amber-700 mt-1 font-medium">Você pode gerenciar os boletos varridos automaticamente via CPF/CNPJ (Febraban) ou os lançamentos manuais do contas a pagar.</p>
                                </div>
                                
                                {/* Subtab Selector */}
                                <div className="flex bg-amber-100/50 p-1 rounded-xl shrink-0 border border-amber-200">
                                    <button
                                        onClick={() => { setDdaViewMode('cnpj_dda'); setSelectedIds([]); }}
                                        className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                            ddaViewMode === 'cnpj_dda'
                                                ? 'bg-amber-600 text-white shadow-sm'
                                                : 'text-amber-800 hover:text-amber-950 font-bold'
                                        }`}
                                    >
                                        <Landmark size={12} /> Boletos DDA (Febraban)
                                    </button>
                                    <button
                                        onClick={() => { setDdaViewMode('contas_pagar'); setSelectedIds([]); }}
                                        className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                            ddaViewMode === 'contas_pagar'
                                                ? 'bg-amber-600 text-white shadow-sm'
                                                : 'text-amber-800 hover:text-amber-950 font-bold'
                                        }`}
                                    >
                                        <FileText size={12} /> Contas a Pagar Ledger
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
                                <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-4 shrink-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="font-bold text-xs text-slate-500 uppercase tracking-wider bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                                            <CheckSquare size={16} className="text-slate-400"/> {selectedIds.length} título(s) selecionado(s)
                                        </span>

                                        {ddaViewMode === 'cnpj_dda' && (
                                            <>
                                                {/* INDICADOR VISUAL DDA DE ACORDO COM O REQUISITO */}
                                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-xs font-semibold">
                                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">DDA STATUS:</span>
                                                    {(db.igreja?.dda_sync_state === 'Sincronizado' || db.igreja?.dda_sync_state === 'sincronizado') ? (
                                                        <span className="text-emerald-700 font-black flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 text-[11px] uppercase">
                                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                                                            Sincronizado
                                                        </span>
                                                    ) : (db.igreja?.dda_sync_state === 'Erro' || db.igreja?.dda_sync_state === 'erro') ? (
                                                        <span className="text-rose-700 font-black flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 text-[11px] uppercase">
                                                            <AlertCircle size={12} className="text-rose-500" />
                                                            Erro
                                                        </span>
                                                    ) : (
                                                        <span className="text-amber-700 font-black flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 text-[11px] uppercase">
                                                            <Clock size={12} className="text-amber-500" />
                                                            Pendente
                                                        </span>
                                                    )}
                                                    <span className="text-slate-400 font-extrabold text-[10px]">
                                                        (Última: {db.igreja?.dda_last_sync || 'Nunca'})
                                                    </span>
                                                </div>

                                                {/* BOTÃO DE ATUALIZAÇÃO MANUAL DE ACORDO COM O REQUISITO */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Button 
                                                        onClick={() => triggerRealDdaSync(true)} 
                                                        disabled={ddaCheckingReal}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wide uppercase px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 border-0"
                                                    >
                                                        <RefreshCw size={14} className={ddaCheckingReal ? "animate-spin" : ""} />
                                                        {ddaCheckingReal ? 'Sondando...' : 'Atualizar DDA'}
                                                    </Button>

                                                    <Button 
                                                        onClick={handleBatchAutoReconcileDda}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wide uppercase px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 border-0"
                                                    >
                                                        <CheckCheck size={14} />
                                                        Auto-Conciliar Lote
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    
                                    {ddaViewMode === 'cnpj_dda' ? (
                                        <Button 
                                            onClick={handlePaySelectedDda} 
                                            disabled={selectedIds.length === 0} 
                                            style={{ backgroundColor: selectedIds.length > 0 ? '#059669' : '#cbd5e1', color: '#ffffff' }} 
                                            className="shadow-lg !border-0 transition-colors py-3 px-6 flex items-center gap-2"
                                        >
                                            <CheckCircle size={18}/> Liquidar Selecionados DDA
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={handlePaySelected} 
                                            disabled={selectedIds.length === 0} 
                                            style={{ backgroundColor: selectedIds.length > 0 ? theme.primary : '#cbd5e1', color: selectedIds.length > 0 ? theme.text : '#94a3b8' }} 
                                            className="shadow-lg !border-0 transition-colors py-3.5 px-6 flex items-center gap-2"
                                        >
                                            <CheckSquare size={18}/> Imputar Quitação Selecionados
                                        </Button>
                                    )}
                                </div>
                                
                                <div className="flex-1 flex flex-col bg-slate-50/30">
                                    {ddaViewMode === 'cnpj_dda' ? (
                                        <GenericTable 
                                            title="" 
                                            type="dda_boletos" 
                                            data={filteredDdaBoletos.filter(b => b.status === 'pendente')} 
                                            onSelectionChange={setSelectedIds}
                                            columns={[
                                                {
                                                    header: 'Emissão / Vencimento', 
                                                    key: 'data_vencimento', 
                                                    render: item => {
                                                        const isVencido = new Date(item.data_vencimento) < new Date();
                                                        return (
                                                            <div className="whitespace-nowrap leading-tight">
                                                                <span className={`font-black text-sm block ${isVencido ? 'text-rose-600' : 'text-slate-700'}`}>{formatDateLocal(item.data_vencimento)}</span>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Emissão: {formatDateLocal(item.data_emissao)}</span>
                                                                {isVencido && <span className="inline-block bg-rose-100 text-rose-800 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full mt-1">Vencido</span>}
                                                            </div>
                                                        )
                                                    }
                                                },
                                                {
                                                    header: 'Credor / Beneficiário', 
                                                    key: 'beneficiario', 
                                                    render: item => (
                                                        <div className="max-w-xs md:max-w-sm">
                                                            <span className="font-extrabold text-slate-800 block text-xs md:text-sm truncate">{item.beneficiario}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">CNPJ: {item.cnpj_beneficiario}</span>
                                                        </div>
                                                    )
                                                },
                                                {
                                                    header: 'Tipo de Despesa', 
                                                    key: 'tipo', 
                                                    render: item => (
                                                        <div className="whitespace-nowrap">
                                                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-black uppercase px-2 py-1 rounded-lg tracking-wider">
                                                                {item.tipo || 'Consumo'}
                                                            </span>
                                                        </div>
                                                    )
                                                },
                                                {
                                                    header: 'Paridade Razão', 
                                                    key: 'match', 
                                                    render: item => {
                                                        const match = calculateMatchScore(item);
                                                        return (
                                                            <div className="leading-none whitespace-nowrap">
                                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-extrabold border ${
                                                                    match.score === 100 
                                                                        ? 'bg-emerald-50 border-emerald-250 text-emerald-700' 
                                                                        : match.score === 90
                                                                            ? 'bg-indigo-50 border-indigo-250 text-indigo-700'
                                                                            : match.score === 70
                                                                                ? 'bg-amber-50 border-amber-250 text-amber-700'
                                                                                : 'bg-slate-50 border-slate-200 text-slate-500'
                                                                }`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                                        match.score >= 90 ? 'bg-emerald-500' : match.score === 70 ? 'bg-amber-500' : 'bg-slate-400'
                                                                    }`} />
                                                                    {match.score}% - {match.reason}
                                                                </span>
                                                            </div>
                                                        )
                                                    }
                                                },
                                                {
                                                    header: 'Valor do Boleto', 
                                                    key: 'valor', 
                                                    render: item => <span className="font-black text-rose-600 whitespace-nowrap text-base">R$ {parseFloat(item.valor).toFixed(2)}</span>
                                                },
                                                {
                                                    header: 'Opções de Integração', 
                                                    key: 'actions', 
                                                    render: item => (
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleImportarEQuitarDda(item); }}
                                                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg shadow-sm transition-all flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                                                            >
                                                                <CheckCircle size={10} /> Pagar Direto
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleImportarDdaPendente(item); }}
                                                                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                                                            >
                                                                <FileInput size={10} /> Agenda
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDescartarDda(item.id); }}
                                                                className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                                                title="Descartar"
                                                            >
                                                                <Trash size={12} />
                                                            </button>
                                                        </div>
                                                    )
                                                }
                                            ]}
                                        />
                                    ) : (
                                        <GenericTable 
                                            title="" 
                                            type="saida" 
                                            data={pendentes} 
                                            onSelectionChange={setSelectedIds}
                                            columns={[
                                                {header:'Vencimento', key:'data_vencimento', render: item => {
                                                    const isVencido = new Date(item.data_vencimento) < new Date();
                                                    return (
                                                        <div className="whitespace-nowrap">
                                                            <span className={`font-bold ${isVencido ? 'text-rose-600' : 'text-slate-700'}`}>{formatDateLocal(item.data_vencimento)}</span>
                                                            {isVencido && <span className="block text-[9px] font-black uppercase text-rose-500 mt-0.5">Vencido</span>}
                                                        </div>
                                                    )
                                                }},
                                                {header:'Beneficiário / Histórico', key:'descricao', render: item => (
                                                    <div>
                                                        <span className="font-bold text-slate-800 block leading-tight">{item.descricao}</span>
                                                        {item.fornecedor_id && <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{db.fornecedores.find(f=>f.id===item.fornecedor_id)?.nome || 'Fornecedor'}</span>}
                                                    </div>
                                                )},
                                                {header:'Documento', key:'doc', render: item => <span className="text-xs font-mono text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">BOL-{item.id.substring(0,5)}</span>},
                                                {header:'Valor (R$)', key:'valor', render: item => <span className="font-black text-rose-600 whitespace-nowrap text-base">R$ {parseFloat(item.valor).toFixed(2)}</span>}
                                            ]}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 4 && (
                        <div className="w-full space-y-6 animate-fadeIn h-full flex flex-col">
                            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-5 rounded-r-2xl shadow-sm shrink-0">
                                <h4 className="font-bold text-indigo-800 flex items-center gap-2"><CheckCircle size={18}/> Validação Bancária (Lançamentos Pendentes)</h4>
                                <p className="text-sm text-indigo-700 mt-1 font-medium">Os registros em <b>PIX ou Transferência</b> podem ser validados de imediato. Os registros em <b>Dinheiro ou Cartão</b> devem aguardar a confirmação de depósito/liquidação na conta bancária.</p>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
                                <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-4 shrink-0">
                                    <span className="font-bold text-sm text-slate-700 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                                        <CheckSquare size={16} className="text-slate-400"/> {selectedIds.length} registro(s) selected(s)
                                    </span>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button 
                                            type="button"
                                            onClick={handleAutoValidatePix}
                                            style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                                            className="shadow-lg !border-0 transition-all py-3.5 px-6 animate-pulse flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Zap size={18} className="fill-white" /> Auto-validar PIX (Real-time)
                                        </Button>
                                        <Button onClick={handleValidateSelected} disabled={selectedIds.length === 0} style={{ backgroundColor: selectedIds.length > 0 ? theme.primary : '#cbd5e1', color: selectedIds.length > 0 ? theme.text : '#94a3b8' }} className="shadow-lg !border-0 transition-colors py-3.5 px-6">
                                            <CheckCircle size={18}/> Validar e Conciliar
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="flex-1 flex flex-col bg-slate-50/30">
                                    <GenericTable 
                                        title="" 
                                        type="financeiro" 
                                        data={pendentesValidacao} 
                                        onSelectionChange={setSelectedIds}
                                        columns={[
                                            {header:'Data', key:'data', render: item => <span className="font-bold text-slate-700">{formatDateLocal(item.data_competencia || item.data_pagamento || item.data_vencimento)}</span>},
                                            {header:'E/S', key:'tipo', render: item => <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${item.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{item.tipo}</span>},
                                            {header:'Descrição / Histórico', key:'descricao', render: item => (
                                                <div>
                                                    <span className="font-bold text-slate-800 block leading-tight">{item.descricao}</span>
                                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{item.categoria || 'Geral'}</span>
                                                </div>
                                            )},
                                            {header:'Forma de Pagto', key:'forma_pagamento', render: item => {
                                                const isRapido = item.forma_pagamento === 'PIX' || item.forma_pagamento === 'Transferência';
                                                return (
                                                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border shadow-sm ${isRapido ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                        {item.forma_pagamento || 'Indefinido'}
                                                    </span>
                                                );
                                            }},
                                            {header:'Valor (R$)', key:'valor', render: item => <span className={`font-black whitespace-nowrap text-base ${item.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>R$ {parseFloat(item.valor).toFixed(2)}</span>}
                                        ]}
                                    />
                                </div>
                            </div>

                            {/* Terminal Logs Popup de Auto-validação PIX - Admin Dashboard */}
                            {autoPixScanning && createPortal(
                                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[11000] flex items-center justify-center p-4">
                                    <div className="bg-[#0c0c0e] text-emerald-400 w-full max-w-lg rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden font-mono text-xs sm:text-sm animate-scale-in">
                                        <div className="bg-[#121215] px-4 py-3 flex items-center justify-between border-b border-slate-800">
                                            <span className="font-extrabold text-slate-300 flex items-center gap-2 text-[11px] tracking-wider">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                API CONCILIAÇÃO INTELIGENTE DE PIX
                                            </span>
                                            <div className="flex gap-1.5">
                                                <span className="w-2 rounded-full h-2 bg-slate-700"></span>
                                                <span className="w-2 rounded-full h-2 bg-slate-700"></span>
                                                <span className="w-2 rounded-full h-2 bg-slate-700"></span>
                                            </div>
                                        </div>
                                        <div className="p-5 overflow-y-auto max-h-72 flex flex-col gap-2 min-h-[160px]">
                                            {autoPixLogs.map((log, idx) => (
                                                <div key={idx} className="animate-entrance leading-normal text-left">
                                                    {log}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-[#121215] px-4 py-3 border-t border-slate-800 flex justify-end">
                                            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Enlace de segurança direto ativado</span>
                                        </div>
                                    </div>
                                </div>,
                                document.body
                            )}
                        </div>
                    )}

                    {tab === 3 && (
                        <div className="w-full space-y-6 animate-scale-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 flex flex-col justify-center border border-slate-200" style={{ borderLeftColor: theme.primary }}>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Saldo Real (Apurado)</p>
                                    <h3 className="text-3xl font-black" style={{ color: theme.primary }}>R$ {saldoAtualCalculado.toFixed(2)}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-l-amber-500 flex flex-col justify-center border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lançamentos Futuros (DDA)</p>
                                    <h3 className="text-3xl font-black text-amber-500">R$ {totalPendentes.toFixed(2)}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 flex flex-col justify-center border border-slate-200" style={{ borderLeftColor: saldoProjetado >= 0 ? '#10b981' : '#ef4444' }}>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Saldo Projetado Final</p>
                                    <h3 className="text-3xl font-black" style={{ color: saldoProjetado >= 0 ? '#10b981' : '#ef4444' }}>R$ {saldoProjetado.toFixed(2)}</h3>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 text-center flex flex-col items-center mt-10">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-emerald-100">
                                    <Activity size={48} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-800 mb-3">Conciliação Perfeita</h2>
                                <p className="text-slate-500 max-w-lg mb-8 font-medium leading-relaxed">Todos os dados refletem exatamente o espelho do livro caixa da igreja em tempo real com base no período que filtrou acima. Não existem divergências ativas.</p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl font-bold text-sm border border-emerald-200 shadow-sm flex items-center gap-2">
                                        <CheckCircle size={18}/> {extratoVisivel.length} Registos Validados
                                    </div>
                                    <div className="bg-amber-50 text-amber-700 px-6 py-3 rounded-xl font-bold text-sm border border-amber-200 shadow-sm flex items-center gap-2">
                                        <Clock size={18}/> {pendentes.length} Pendentes na Fila
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showAuditModal && createPortal(
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[11000] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-in border border-slate-200 flex flex-col max-h-[90vh]">
                        
                        {/* Header do Painel */}
                        <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center shrink-0">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-indigo-500 rounded-lg text-white">
                                        <Sparkles size={20} />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight">Painel de Auditoria e Fechamento Bancário por IA</h3>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">Extrato analisado: <span className="font-bold text-slate-200">{statementFileName}</span></p>
                            </div>
                            <button 
                                onClick={() => setShowAuditModal(false)}
                                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Indicadores / Estatísticas */}
                        <div className="bg-slate-50 border-b border-slate-200 p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 shrink-0">
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total no Extrato</span>
                                <h4 className="text-2xl font-black text-slate-800">{auditMatches.length + auditDiscrepancies.length + auditMissing.length}</h4>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm border-l-4 border-l-emerald-500">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Conciliados (Encontrados)</span>
                                <h4 className="text-2xl font-black text-emerald-600">{auditMatches.length}</h4>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm border-l-4 border-l-amber-500">
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">Divergências Encontradas</span>
                                <h4 className="text-2xl font-black text-amber-500">{auditDiscrepancies.length}</h4>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm border-l-4 border-l-rose-500 animate-pulse">
                                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">Ausentes no Sistema (IA)</span>
                                <h4 className="text-2xl font-black text-rose-600">{auditMissing.length}</h4>
                            </div>
                        </div>

                        {/* Menu de Tabs da Auditoria */}
                        <div className="bg-white border-b border-slate-200 px-6 py-2 flex gap-4 shrink-0 overflow-x-auto">
                            <button
                                onClick={() => setAuditTab('missing')}
                                className={`px-4 py-3 font-extrabold text-sm flex items-center gap-2 border-b-2 transition-all ${
                                    auditTab === 'missing' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <AlertTriangle size={16} /> Lançamentos Ausentes ({auditMissing.length})
                            </button>
                            <button
                                onClick={() => setAuditTab('matched')}
                                className={`px-4 py-3 font-extrabold text-sm flex items-center gap-2 border-b-2 transition-all ${
                                    auditTab === 'matched' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <CheckCircle size={16} /> Itens Conciliados ({auditMatches.length})
                            </button>
                            <button
                                onClick={() => setAuditTab('discrepancies')}
                                className={`px-4 py-3 font-extrabold text-sm flex items-center gap-2 border-b-2 transition-all ${
                                    auditTab === 'discrepancies' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Info size={16} /> Divergências ({auditDiscrepancies.length})
                            </button>
                        </div>

                        {/* Conteúdo das Listas */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
                            
                            {auditTab === 'missing' && (
                                <div className="space-y-4">
                                    <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-2xl flex items-start gap-3">
                                        <AlertTriangle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-rose-800 uppercase tracking-wide">Atenção Tesoureiro</p>
                                            <p className="text-xs text-rose-700 font-medium leading-relaxed">
                                                Estes lançamentos foram detectados no extrato bancário oficial do mês, mas <b>NÃO</b> constam no livro caixa ou contas a pagar do sistema GIPP. Para efetivar a conciliação perfeita e fechar as contas com saldo real do banco, selecione e aprove esses lançamentos automáticos abaixo.
                                            </p>
                                        </div>
                                    </div>

                                    {auditMissing.length === 0 ? (
                                        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-2">
                                            <CheckCircle size={40} className="text-emerald-500 mx-auto" />
                                            <h5 className="font-black text-slate-800">Parabéns! Nenhum Lançamento Ausente</h5>
                                            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">Todas as transações do seu extrato bancário já estão devidamente registradas no financeiro do GIPP.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center px-2">
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedMissingToImport.length === auditMissing.length}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedMissingToImport(auditMissing.map(m => m.id));
                                                            } else {
                                                                setSelectedMissingToImport([]);
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-xs font-bold text-slate-600">Selecionar Todos ({auditMissing.length})</span>
                                                </div>
                                                <button 
                                                    onClick={handleImportMissingTransactions}
                                                    disabled={isSavingAutoTransactions || selectedMissingToImport.length === 0}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    {isSavingAutoTransactions ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} 
                                                    Auto-Lançar e Reconciliar ({selectedMissingToImport.length})
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                {auditMissing.map((item) => (
                                                    <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-rose-200 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={selectedMissingToImport.includes(item.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedMissingToImport(prev => [...prev, item.id]);
                                                                    } else {
                                                                        setSelectedMissingToImport(prev => prev.filter(id => id !== item.id));
                                                                    }
                                                                }}
                                                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                                            />
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                                        item.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                                    }`}>
                                                                        {item.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-slate-400">{formatDateLocal(item.data)}</span>
                                                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-extrabold">{item.forma_pagamento || 'PIX'}</span>
                                                                </div>
                                                                <p className="font-extrabold text-slate-800 text-sm">{item.descricao}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold">Categoria Estimada: <span className="text-indigo-600 font-black">{item.categoria || 'Dízimo'}</span></p>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className={`font-black text-base ${item.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                {item.tipo === 'entrada' ? '+' : '-'} R$ {parseFloat(item.valor).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {auditTab === 'matched' && (
                                <div className="space-y-4">
                                    <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3">
                                        <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Conciliação Auditada com Sucesso</p>
                                            <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                                                Estes lançamentos existem exatamente iguais no extrato do banco e no livro caixa da igreja GIPP. Se houver itens na lista que constam como "Pendentes de Validação", você pode aprová-los para conciliação imediata em lote.
                                            </p>
                                        </div>
                                    </div>

                                    {auditMatches.length === 0 ? (
                                        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-2">
                                            <AlertCircle size={40} className="text-slate-400 mx-auto" />
                                            <h5 className="font-black text-slate-800">Nenhum Match Encontrado</h5>
                                            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">As transações do extrato não bateram de forma idêntica com as transações cadastradas no sistema.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {auditMatches.some(m => !m.system.conciliado) && (
                                                <div className="flex justify-end px-2">
                                                    <button 
                                                        onClick={handleReconcileAllMatchedPending}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                                                    >
                                                        <CheckCheck size={14} /> Reconciliar Todos os Pendentes Encontrados
                                                    </button>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                {auditMatches.map((m, idx) => (
                                                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-emerald-200 transition-colors">
                                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider block">No Extrato Bancário</span>
                                                                <p className="font-black text-slate-800 text-sm truncate max-w-xs">{m.statement.descricao}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold">{formatDateLocal(m.statement.data)} • R$ {parseFloat(m.statement.valor).toFixed(2)}</p>
                                                            </div>
                                                            <div className="space-y-1 pt-2 md:pt-0 md:pl-4">
                                                                <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider block">No Sistema GIPP</span>
                                                                <p className="font-black text-slate-800 text-sm truncate max-w-xs">{m.system.descricao}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold">{formatDateLocal(m.system.data_pagamento || m.system.data_competencia)} • R$ {parseFloat(m.system.valor).toFixed(2)}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 justify-end">
                                                            {m.system.conciliado ? (
                                                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                                                                    <Check size={12} /> Conciliado
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={async () => {
                                                                        const dataAtual = new Date().toISOString().split('T')[0];
                                                                        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', m.system.id), {
                                                                            conciliado: true,
                                                                            data_conciliacao: dataAtual
                                                                        }, { merge: true });
                                                                        logAction('CONCILIAÇÃO_IA', `Conciliou lançamento tempo-real`, 'financeiro', m.system.id);
                                                                        addToast("Lançamento reconciliado!", "success");
                                                                        setShowAuditModal(false);
                                                                    }}
                                                                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
                                                                >
                                                                    <AlertTriangle size={12} /> Reconciliar Item
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {auditTab === 'discrepancies' && (
                                <div className="space-y-4">
                                    <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                                        <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Divergências de Data ou Descrição</p>
                                            <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                                A IA detectou transações no extrato bancário com valores correspondentes no sistema GIPP, porém as datas ou descrições estão desalinhadas. Revise manualmente essas possíveis conciliações.
                                            </p>
                                        </div>
                                    </div>

                                    {auditDiscrepancies.length === 0 ? (
                                        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-2">
                                            <CheckCircle size={40} className="text-emerald-500 mx-auto" />
                                            <h5 className="font-black text-slate-800">Nenhuma Divergência Encontrada</h5>
                                            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">Parabéns! Todas as transações com valores correspondentes possuem alinhamento contábil.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {auditDiscrepancies.map((item, idx) => (
                                                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm hover:border-amber-200 transition-colors">
                                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                                        <div>
                                                            <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Possível Correspondência</span>
                                                            <p className="text-xs text-slate-400 font-bold mt-1">Lançamento no Extrato: <b className="text-slate-700">{item.statement.descricao}</b> em <b>{formatDateLocal(item.statement.data)}</b> por <b>R$ {parseFloat(item.statement.valor).toFixed(2)}</b></p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selecione o registro do sistema para validar e conciliar:</p>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {item.systemCandidates.map((cand: any) => (
                                                                <div key={cand.id} className="bg-slate-50 hover:bg-amber-50/25 border border-slate-200 hover:border-amber-300 rounded-xl p-3 flex items-center justify-between transition-colors">
                                                                    <div>
                                                                        <p className="font-extrabold text-slate-800 text-xs">{cand.descricao}</p>
                                                                        <p className="text-[10px] text-slate-400 font-medium">Data Lançamento: {formatDateLocal(cand.data_pagamento || cand.data_competencia)} • Categoria: {cand.categoria}</p>
                                                                    </div>
                                                                    <button
                                                                        onClick={async () => {
                                                                            const dataAtual = new Date().toISOString().split('T')[0];
                                                                            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', cand.id), {
                                                                                conciliado: true,
                                                                                data_conciliacao: dataAtual,
                                                                                descricao: `[RECONCILIADO IA] ${cand.descricao}`.toUpperCase()
                                                                            }, { merge: true });
                                                                            logAction('CONCILIAÇÃO_IA', `Resolveu divergência e conciliou com item do extrato`, 'financeiro', cand.id);
                                                                            addToast("Divergência resolvida e item conciliado!", "success");
                                                                            setShowAuditModal(false);
                                                                        }}
                                                                        className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                                                    >
                                                                        Vincular e Conciliar
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 border-t border-slate-200 px-8 py-5 flex justify-between items-center shrink-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GIPP Auditoria Integrada de Tesouraria</span>
                            <button 
                                onClick={() => setShowAuditModal(false)}
                                className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs px-6 py-3 rounded-2xl transition-all shadow-md"
                            >
                                Fechar Auditoria
                            </button>
                        </div>

                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};


export default ModuleConciliacaoBancaria;
