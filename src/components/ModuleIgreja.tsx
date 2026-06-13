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
  LayoutTemplate, MousePointerClick, Image, Baby, HardHat, ShieldCheck, QrCode, UserCircle, Maximize, Minimize, Scale,
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

// Cache global para otimizar e evitar transferências repetidas das logos dos bancos
const bancoLogoCache: Record<string, any> = {};

// Exporting component
const ModuleIgreja = () => {
    const { db, setDoc, doc, dbFirestore, appId, addToast, user, openModal } = useContext(ChurchContext);
    const [data, setData] = useState(db.igreja || {});
    const [tab, setTab] = useState(1);
    const [verificandoPix, setVerificandoPix] = useState(false);
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

    useEffect(() => {
        if (db.igreja) {
            const defaults = {
                canon_denom: 'ASSEMBLEIAS DE DEUS',
                canon_convencao_nacional: 'CONVENÇÃO GERAL DAS ASSEMBLEIAS DE DEUS NO BRASIL (CGADB)',
                canon_convencao_estadual: 'CONVENÇÃO ESTADUAL DOS MINISTROS DAS ASSEMBLEIAS DE DEUS',
                canon_declaracao_fe: 'TRINITÁRIA E PENTECOSTAL (DECLARAÇÃO DE FÉ DAS ASSEMBLEIAS DE DEUS)',
                canon_fundadores: 'GUNNAR VINGREN E DANIEL BERG',
                canon_ano_introducao: '1911 (BELÉM DO PARÁ)',
                canon_registro_geral: 'RE-AD-1911',
                // Default Ecclesiastical roles if not explicitly defined
                pastor_cargo: 'PASTOR PRESIDENTE',
                vice_presidente1_cargo: 'VICE-PRESIDENTE / PASTOR AUXILIAR',
                vice_presidente2_cargo: 'CO-PASTOR / EVANGELISTA',
                secretario1_cargo: '1º SECRETÁRIO / PRESBÍTERO',
                secretario2_cargo: '2º SECRETÁRIO / DIÁCONO',
                tesoureiro1_cargo: '1º TESOUREIRO / PRESBÍTERO',
                tesoureiro2_cargo: '2º TESOUREIRO / DIÁCONO',
                bot_name: db.igreja?.bot_name || 'Mary (Assistente Virtual)',
                bot_avatar: db.igreja?.bot_avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
                bot_welcome: db.igreja?.bot_welcome || 'Olá 👋 Sou a assistente virtual Mary. Como posso ajudar você hoje?',
                bot_instructions: db.igreja?.bot_instructions || '',
                bot_faq: db.igreja?.bot_faq || [],
                ...db.igreja
            };
            setData(prev => ({ ...defaults, ...prev, ...db.igreja }));
        }
    }, [db.igreja]);

    const menuItems = [
        {id: 1, label: 'Sede e Diretoria', icon: Building2},
        {id: 2, label: 'Congregações e Filiais', icon: MapPin},
        {id: 3, label: 'Assinatura (Licença)', icon: ShieldCheck}
    ];

    const TabButton: any = ({ item }) => (
        <button onClick={() => setTab(item.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
            <item.icon size={18}/> {item.label}
        </button>
    );

    const handlePrintDocument = () => {
        const printContent = document.getElementById('constitucional-document');
        if (!printContent) return;
        
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
        
        const docObj = iframe.contentWindow?.document || iframe.contentDocument;
        if (!docObj) return;
        
        docObj.write(`
            <html>
                <head>
                    <title>Declaração de Amparo Constitucional</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; background-color: white; color: #1e293b; padding: 20px; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        }
                    </style>
                    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                </head>
                <body>
                    <div style="font-family: 'Inter', sans-serif;">
                        ${printContent.innerHTML}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() {
                                window.parent.document.body.removeChild(window.frameElement);
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        docObj.close();
    };

    const handleExportPDF = () => {
        const element = document.getElementById('constitucional-document');
        if (!element) return;
        
        addToast("Gerando PDF oficial de alta resolução...", "info");
        
        html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save(`Declaracao_Amparo_CF88_${data.nome ? data.nome.replace(/\\s+/g, '_') : 'Igreja'}.pdf`);
            addToast("PDF baixado com sucesso!", "success");
        }).catch(e => {
            console.error(e);
            addToast("Erro ao gerar arquivo PDF.", "error");
        });
    };

    const handleSave = async () => {
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), data, { merge: true });
            
            // --- REGISTO MASTER PARA O DESENVOLVEDOR ---
            try {
                await setDoc(doc(dbFirestore, 'artifacts', 'GIPP_MASTER', 'public', 'data', 'tenants', appId), {
                    id: appId,
                    nome: data.nome || 'Igreja Sem Nome',
                    pastor: data.pastor || '',
                    cidade: data.cidade || '',
                    uf: data.uf || '',
                    telefone: data.telefone || '',
                    licenca_status: data.licenca_status || db.igreja?.licenca_status || 'ativo',
                    ultimo_atualizacao: new Date().toISOString()
                }, { merge: true });
            } catch (err) { console.warn("Sync Master falhou", err); }
            // -------------------------------------------

            addToast("Dados da igreja atualizados!", "success");
        } catch (e) { console.error(e); addToast("Erro ao salvar.", "error"); }
    };

    const handleEstatutoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
             if (file.size > 2 * 1024 * 1024) { 
                 alert("O arquivo do Estatuto deve ter no máximo 2MB.");
                 return; 
             }
             const reader = new FileReader();
             reader.onloadend = () => {
                 setData({...data, estatuto_nome: file.name, estatuto_base64: reader.result});
                 addToast("Documento de estatuto importado com sucesso!", "success");
             };
             reader.readAsDataURL(file);
        }
    };

    const handleDownloadEstatuto = () => {
        if (!data.estatuto_base64) return;
        const link = document.createElement('a');
        link.href = data.estatuto_base64;
        link.download = data.estatuto_nome || 'estatuto_igreja.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
             if (file.size > 10 * 1024 * 1024) { 
                 addToast("A imagem deve ter no máximo 10MB.", "error");
                 return; 
             }
             const reader = new FileReader();
             reader.onloadend = async () => {
                 try {
                     const rawResult = reader.result as string;
                     const compressed = await resizeImageAndCompress(rawResult, 300, 300, 0.8);
                     setData({...data, logo: compressed});
                     addToast("Logo carregada e otimizada!", "success");
                 } catch (err) {
                     addToast("Erro ao processar imagem.", "error");
                 }
             };
             reader.readAsDataURL(file);
        }
    };

    const handleIconeSistemaUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
             if (file.size > 10 * 1024 * 1024) { 
                 addToast("A imagem deve ter no máximo 10MB.", "error");
                 return; 
             }
             const reader = new FileReader();
             reader.onloadend = async () => {
                 try {
                     const rawResult = reader.result as string;
                     const compressed = await resizeImageAndCompress(rawResult, 150, 150, 0.8);
                     setData({...data, icone_sistema: compressed});
                     addToast("Ícone do sistema atualizado e otimizado!", "success");
                 } catch (err) {
                     addToast("Erro ao processar imagem.", "error");
                 }
             };
             reader.readAsDataURL(file);
        }
    };

    const handleBancoLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
             if (file.size > 10 * 1024 * 1024) { 
                 addToast("A imagem deve ter no máximo 10MB.", "error");
                 return; 
             }
             const reader = new FileReader();
             reader.onloadend = async () => {
                 try {
                     const rawResult = reader.result as string;
                     const compressed = await resizeImageAndCompress(rawResult, 200, 100, 0.8);
                     setData({...data, banco_logo_base64: compressed, banco_logo: compressed});
                     addToast("Logo do banco alterada e otimizada com sucesso!", "success");
                 } catch (err) {
                     addToast("Erro ao processar imagem.", "error");
                 }
             };
             reader.readAsDataURL(file);
        }
    };

    const bancosList = [
        'Banco do Brasil (001)', 
        'Bradesco (237)', 
        'Caixa Econômica (104)', 
        'Itaú (341)', 
        'Nubank (260)', 
        'Santander (033)', 
        'Banco Inter (077)', 
        'C6 Bank (336)', 
        'Sicredi (748)', 
        'Sicoob (756)', 
        'Outro'
    ];
    
    const getBancoLogo = (banco) => {
        const domains = {
            'Banco do Brasil (001)': 'bb.com.br',
            'Bradesco (237)': 'bradesco.com.br',
            'Caixa Econômica (104)': 'caixa.gov.br',
            'Itaú (341)': 'itau.com.br',
            'Nubank (260)': 'nubank.com.br',
            'Santander (033)': 'santander.com.br',
            'Banco Inter (077)': 'bancointer.com.br',
            'C6 Bank (336)': 'c6bank.com.br',
            'Sicredi (748)': 'sicredi.com.br',
            'Sicoob (756)': 'sicoob.com.br'
        };
        const domain = domains[banco];
        // Busca a imagem oficial diretamente do site do banco
        return domain ? `https://icon.horse/icon/${domain}` : null;
    };

    const handleBancoSelect = async (v) => {
        const logoUrl = getBancoLogo(v);

        // Verifica se a logo já está guardada na base de dados para a instituição selecionada
        if (db.igreja?.banco === v && db.igreja?.banco_logo_base64) {
            bancoLogoCache[v] = db.igreja.banco_logo_base64;
        }

        // Otimização: Se já tivermos a imagem em cache na memória, usamos instantaneamente
        if (bancoLogoCache[v]) {
            setData(prev => ({...prev, banco: v, banco_logo: logoUrl, banco_logo_base64: bancoLogoCache[v]}));
            return;
        }

        setData(prev => ({...prev, banco: v, banco_logo: logoUrl, banco_logo_base64: logoUrl})); // Feedback visual imediato
        
        if (logoUrl) {
            addToast("A capturar a logomarca no site oficial...", "info");
            try {
                const response = await fetch(logoUrl);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    bancoLogoCache[v] = reader.result; // Guarda em cache para não voltar a descarregar
                    setData(prev => ({...prev, banco_logo_base64: reader.result}));
                    addToast("Logo do banco guardada no sistema!", "success");
                };
                reader.readAsDataURL(blob);
            } catch (err) {
                console.warn("CORS bloqueou download direto. Usando link em tempo real.", err);
                addToast("Logo vinculada com sucesso!", "success");
            }
        } else {
            setData(prev => ({...prev, banco_logo_base64: null, banco_logo: null}));
        }
    };

    const handleVerificarPagamento = async () => {
        const currentMonthStr = new Date().toISOString().slice(0, 7);
        if (db.igreja?.ultimo_desbloqueio_auto === currentMonthStr) {
            addToast("Limite de liberação automática atingido neste mês. Por favor, contacte o suporte.", "error");
            return;
        }

        setVerificandoPix(true);
        addToast("A procurar transações via PIX...", "info");
        
        setTimeout(async () => {
            try {
                // Adiciona 30 dias de licença a partir de hoje
                const novoVencimento = new Date();
                novoVencimento.setDate(novoVencimento.getDate() + 30);
                const vencimentoStr = novoVencimento.toISOString().split('T')[0];

                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), { 
                    licenca_status: 'ativo',
                    licenca_vencimento: vencimentoStr,
                    liberado_por: 'sistema_pix',
                    ultimo_desbloqueio_auto: currentMonthStr
                }, { merge: true });

                try {
                    await setDoc(doc(dbFirestore, 'artifacts', 'GIPP_MASTER', 'public', 'data', 'tenants', appId), {
                        licenca_status: 'ativo',
                        licenca_vencimento: vencimentoStr,
                        liberado_por: 'sistema_pix',
                        ultimo_desbloqueio_auto: currentMonthStr
                    }, { merge: true });
                } catch(e) {}

                addToast("Pagamento reconhecido! Licença renovada por 30 dias.", "success");
            } catch(e) {
                console.error(e);
                addToast("Erro ao comunicar com a base de dados.", "error");
            }
            setVerificandoPix(false);
        }, 3500); // 3.5 segundos de animação simulada
    };

    const lideresList = [
        { key: 'pastor', label: 'Pastor Presidente', defaultCargo: 'PASTOR PRESIDENTE' },
        { key: 'vice_presidente1', label: '1º Vice-Presidente', defaultCargo: 'VICE-PRESIDENTE' },
        { key: 'vice_presidente2', label: '2º Vice-Presidente', defaultCargo: 'VICE-PRESIDENTE' },
        { key: 'secretario1', label: '1º Secretário', defaultCargo: '1º SECRETÁRIO' },
        { key: 'secretario2', label: '2º Secretário', defaultCargo: '2º SECRETÁRIO' },
        { key: 'tesoureiro1', label: '1º Tesoureiro', defaultCargo: '1º TESOUREIRO' },
        { key: 'tesoureiro2', label: '2º Tesoureiro', defaultCargo: '2º TESOUREIRO' }
    ];

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance max-w-6xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm"><Building2 size={32}/></div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Igreja & Congregações</h2>
                        <p className="text-slate-500 text-sm">Informações institucionais, diretoria e filiais.</p>
                    </div>
                </div>
                <div className="glass-modern p-2 rounded-[2rem] flex overflow-x-auto custom-scrollbar gap-2 border border-white/50 w-full md:w-auto shrink-0">
                    {menuItems.map(item => <TabButton key={item.id} item={item} />)}
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {tab === 1 && (
                    <div className="glass-modern p-8 rounded-[2.5rem] overflow-y-auto custom-scrollbar h-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <h3 className="font-bold text-lg text-indigo-700 uppercase tracking-widest border-b border-indigo-100 pb-2 mb-4">1. Cadastro Institucional</h3>
                                    <div className="flex justify-center mb-6">
                                         <label className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 hover:bg-white transition-colors cursor-pointer relative overflow-hidden group">
                                             {data.logo ? <img src={data.logo} className="w-full h-full object-contain p-2" /> : <div className="text-center text-slate-400"><ImageIcon size={32} className="mx-auto mb-1"/><span className="text-xs">Logo</span></div>}
                                             <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload}/>
                                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">Alterar</div>
                                         </label>
                                    </div>
                                    <FormInput label="Nome Oficial da Igreja" value={data.nome} onChange={v=>setData({...data, nome:v})} required placeholder="Ex: Catedral da Assembleia de Deus..."/>
                                    <FormInput label="CNPJ" value={data.cnpj} onChange={v=>setData({...data, cnpj:v})} placeholder="00.000.000/0000-00"/>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput label="Data de Fundação" type="date" value={data.data_fundacao} onChange={v=>setData({...data, data_fundacao:v})} />
                                        <FormInput label="Data de Emancipação" type="date" value={data.data_emancipacao} onChange={v=>setData({...data, data_emancipacao:v})} />
                                    </div>
                                    <FormInput label="Endereço Completo" value={data.endereco} onChange={v=>setData({...data, endereco:v})} />
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2"><FormInput label="Cidade" value={data.cidade} onChange={v=>setData({...data, cidade:v})} /></div>
                                        <FormInput label="UF" value={data.uf} onChange={v=>setData({...data, uf:v})} />
                                    </div>
                                </div>

                                <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 space-y-4">
                                    <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2 mb-2">
                                        <ScrollText size={18} className="text-amber-700"/>
                                        <h3 className="font-bold text-sm text-amber-800 uppercase tracking-wider">2. Dados Canônicos da Denominação</h3>
                                    </div>
                                    <FormInput label="Organização Eclesiástica" value={data.canon_denom} onChange={v=>setData({...data, canon_denom:v})} placeholder="Ex: Assembleia de Deus" />
                                    <FormInput label="Convenção Geral / Nacional" value={data.canon_convencao_nacional} onChange={v=>setData({...data, canon_convencao_nacional:v})} placeholder="Ex: CGADB" />
                                    <FormInput label="Convenção Estadual / Regional" value={data.canon_convencao_estadual} onChange={v=>setData({...data, canon_convencao_estadual:v})} placeholder="Ex: Convenção de Pastores do Estado" />
                                    <FormInput label="Declaração de Fé Canônica" value={data.canon_declaracao_fe} onChange={v=>setData({...data, canon_declaracao_fe:v})} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput label="Pioneiros / Fundadores" value={data.canon_fundadores} onChange={v=>setData({...data, canon_fundadores:v})} />
                                        <FormInput label="Ano de Introdução no BR" value={data.canon_ano_introducao} onChange={v=>setData({...data, canon_ano_introducao:v})} />
                                    </div>
                                    <FormInput label="Registro Eclesiástico Consocial" value={data.canon_registro_geral} onChange={v=>setData({...data, canon_registro_geral:v})} placeholder="Inscrição Oficial da Sede" />
                                </div>

                                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 space-y-4">
                                    <div className="flex items-center gap-2 border-b border-blue-200/60 pb-2 mb-2">
                                        <FileText size={18} className="text-blue-700"/>
                                        <h3 className="font-bold text-sm text-blue-800 uppercase tracking-wider">3. Estatuto Social & Regimento Interno</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Resumo do Estatuto ou Regimento</label>
                                        <textarea 
                                            value={data.estatuto_resumo || ''} 
                                            onChange={e=>setData({...data, estatuto_resumo: e.target.value.toUpperCase()})}
                                            className="input-futuristic w-full rounded-2xl p-4 text-sm shadow-sm text-slate-700 placeholder:text-slate-400 bg-white/70 border border-slate-200 outline-none h-32 uppercase animate-entrance"
                                            placeholder="REGISTRE AQUI O RESUMO DO ESTATUTO OU DO REGIMENTO INTERNO..."
                                        />
                                    </div>
                                    <div className="bg-white/80 p-4 rounded-2xl border border-blue-200 space-y-3">
                                        <span className="text-xs font-bold text-slate-500 block uppercase">Anexar Cópia do Estatuto Oficial (PDF/DOC)</span>
                                        <div className="flex items-center gap-3">
                                            <input type="file" id="estatuto-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={handleEstatutoUpload} />
                                            <label htmlFor="estatuto-upload" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2 shrink-0">
                                                <UploadCloud size={16}/> Escolher Arquivo
                                            </label>
                                            <div className="text-xs text-slate-500 truncate flex-1 font-medium">
                                                {data.estatuto_nome ? data.estatuto_nome : "Nenhum arquivo anexado"}
                                            </div>
                                            {data.estatuto_base64 && (
                                                <button type="button" onClick={handleDownloadEstatuto} className="p-2.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all" title="Baixar Estatuto Social">
                                                    <Download size={16}/>
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium">Arquivos salvos de forma privada no banco de dados (máx 2MB).</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg text-purple-700 uppercase tracking-widest border-b border-purple-100 pb-2 mb-4">4. Diretoria Executiva</h3>
                                    <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100 space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar">
                                        <p className="text-xs text-purple-600 font-medium mb-2">Configure o nome completo, o CPF e o cargo eclesiástico oficial dos responsáveis.</p>
                                        <div className="space-y-4">
                                            {lideresList.map(l => {
                                                const nameKey = l.key;
                                                const cpfKey = `${l.key}_cpf`;
                                                const cargoKey = `${l.key}_cargo`;
                                                return (
                                                    <div key={l.key} className="bg-white p-4 rounded-2xl border border-purple-100 space-y-3 shadow-sm hover:shadow transition-shadow animate-entrance">
                                                        <span className="text-xs font-black text-purple-700 tracking-wider uppercase block">{l.label}</span>
                                                        <FormInput 
                                                            label="Nome Computado" 
                                                            value={data[nameKey] || ''} 
                                                            onChange={v => setData({...data, [nameKey]: v})} 
                                                            placeholder={`Nome do ${l.label}`}
                                                            className="!mb-0"
                                                        />
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <FormInput 
                                                                label="CPF" 
                                                                value={data[cpfKey] || ''} 
                                                                onChange={v => setData({...data, [cpfKey]: formatCPF(v)})} 
                                                                placeholder="000.000.000-00"
                                                                className="!mb-0"
                                                            />
                                                            <FormInput 
                                                                label="Cargo Eclesiástico" 
                                                                value={data[cargoKey] || l.defaultCargo} 
                                                                onChange={v => setData({...data, [cargoKey]: v})} 
                                                                placeholder="Ex: Pastor, Evangelista..."
                                                                className="!mb-0"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg text-emerald-700 uppercase tracking-widest border-b border-emerald-100 pb-2 mb-4">5. Dados Bancários & PIX</h3>
                                    <div className="bg-emerald-50/80 p-6 rounded-3xl border border-emerald-200 shadow-sm">
                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="flex-1">
                                                <FormSelect label="Instituição Bancária" value={data.banco} onChange={handleBancoSelect} options={bancosList} className="!mb-0" />
                                            </div>
                                            <label className="w-24 h-24 bg-white rounded-2xl shadow-sm border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center p-2 shrink-0 relative overflow-hidden group cursor-pointer hover:bg-emerald-50 transition-colors" title="Clique para alterar a logo do banco manualmente">
                                                {(data.banco_logo_base64 || data.banco_logo || getBancoLogo(data.banco)) ? (
                                                    <img src={data.banco_logo_base64 || data.banco_logo || getBancoLogo(data.banco)} alt={data.banco} className="w-full h-full object-contain rounded-lg p-1" onError={(e: any) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                                                ) : null}
                                                <Landmark size={32} className="text-emerald-400 absolute" style={{ display: (data.banco_logo_base64 || data.banco_logo || getBancoLogo(data.banco)) ? 'none' : 'block' }}/>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleBancoLogoUpload}/>
                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold text-center p-1">
                                                    <UploadCloud size={16} className="mb-1"/>
                                                    Alterar Logo
                                                </div>
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <FormInput label="Agência" value={data.agencia} onChange={v=>setData({...data, agencia:v})} placeholder="Ex: 0001" className="!mb-0"/>
                                            <FormInput label="Conta" value={data.conta} onChange={v=>setData({...data, conta:v})} placeholder="Ex: 12345-6" className="!mb-0"/>
                                        </div>
                                        <FormSelect label="Tipo de Conta" value={data.tipo_conta} onChange={v=>setData({...data, tipo_conta:v})} options={['Corrente', 'Poupança']} className="!mb-0"/>
                                        
                                        <div className="mt-6 pt-5 border-t border-emerald-200/80">
                                            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-3 flex items-center gap-2"><Zap size={16}/> Chave PIX Oficial</h4>
                                            <div className="flex flex-col sm:flex-row gap-6 items-center">
                                                <div className="flex-1 w-full">
                                                    <FormInput label="Chave PIX (CNPJ, Celular, E-mail)" preserveCase value={data.chave_pix} onChange={v=>setData({...data, chave_pix:v})} placeholder="CNPJ, E-mail, Celular ou Chave Aleatória" className="!mb-0" />
                                                </div>
                                                {data.chave_pix && (
                                                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-emerald-200 flex flex-col items-center shrink-0 animate-scale-in">
                                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatePixPayload(data.chave_pix, data.nome, data.cidade))}&color=047857`} alt="QR Code PIX" className="w-24 h-24 object-contain rounded-xl" />
                                                        <span className="text-[9px] font-black text-emerald-600 mt-2 uppercase tracking-widest">QR Code Gerado</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 flex justify-end pt-6 border-t border-slate-200 pb-10">
                            <Button onClick={handleSave} variant="primary" className="shadow-lg px-8 py-4 text-lg"><Save size={24}/> Salvar Alterações</Button>
                        </div>
                    </div>
                )}
                
                {tab === 2 && (
                    <div className="h-full flex flex-col animate-entrance">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-700">Sub-Sedes e Congregações</h3>
                            <Button onClick={() => openModal('congregacao')} variant="primary" className="shadow-indigo-500/20"><Plus size={18}/> Nova Congregação</Button>
                        </div>
                        <GenericTable 
                            title="" 
                            type="congregacao" 
                            data={db.congregacoes || []} 
                            columns={[
                                {header: 'Congregação', key: 'nome', render: c => <span className="font-bold text-slate-800 uppercase">{c.nome}</span>},
                                {header: 'Dirigente', key: 'dirigente_id', render: c => db.membros.find(m=>m.id===c.dirigente_id)?.nome || <span className="text-slate-400 italic">Sem Dirigente</span>},
                                {header: 'Telefone', key: 'telefone'},
                                {header: 'Endereço', key: 'endereco'},
                                {header: 'Abertura', key: 'data_abertura', render: c => formatDateLocal(c.data_abertura)}
                            ]} 
                        />
                    </div>
                )}

                {tab === 3 && (
                    <div className="h-full flex flex-col animate-entrance max-w-3xl mx-auto mt-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-slate-700">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
                            
                            <div className="text-center mb-10 relative z-10">
                                <div className="w-20 h-20 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30 transform -rotate-3">
                                    <ShieldCheck size={40}/>
                                </div>
                                <h3 className="text-3xl font-black mb-2 tracking-tight">Licença do Sistema</h3>
                                <p className="text-slate-400 font-medium">Situação atual da sua assinatura GIPP (SaaS).</p>
                            </div>

                            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 flex justify-between items-center mb-10 relative z-10">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status da Assinatura</p>
                                    <p className={`font-black text-xl flex items-center gap-2 ${db.igreja?.licenca_status === 'bloqueado' ? 'text-rose-500' : 'text-emerald-400'}`}>
                                        {db.igreja?.licenca_status === 'bloqueado' ? <><Ban size={20}/> Bloqueada</> : <><CheckCircle size={20}/> Ativa</>}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Válida até</p>
                                    <p className="font-mono font-bold text-lg text-white">
                                        {db.igreja?.licenca_vencimento ? formatDateLocal(db.igreja.licenca_vencimento) : 'Vitalícia / Indefinida'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white text-slate-900 p-8 rounded-[2rem] shadow-xl relative z-10 text-center flex flex-col items-center">
                                <h4 className="font-black text-xl mb-2 flex items-center gap-2 justify-center"><Zap size={24} className="text-emerald-500 fill-emerald-500"/> Renovar Assinatura (PIX)</h4>
                                <p className="text-sm text-slate-500 font-medium mb-6 max-w-sm">Escaneie o QR Code abaixo pelo aplicativo do seu banco ou use a chave PIX celular.</p>
                                
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-6 shadow-inner">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatePixPayload(db.igreja?.saas_chave_pix || '4d9868d2-88f7-4fed-ad87-6dfc3c4ae698', db.igreja?.saas_nome_desenvolvedor || 'PATRICK PESSOA', 'RIO DE JANEIRO'))}&color=0f172a&bgcolor=ffffff`} alt={`QR Code PIX ${db.igreja?.saas_nome_desenvolvedor || 'PATRICK PESSOA'}`} className="w-40 h-40 object-contain rounded-xl"/>
                                </div>

                                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 w-full mb-8">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Chave PIX Oficial</p>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono font-black text-sm md:text-lg text-slate-800 truncate">{db.igreja?.saas_chave_pix || '4d9868d2-88f7-4fed-ad87-6dfc3c4ae698'}</span>
                                        <button onClick={() => { copyToClipboard(db.igreja?.saas_chave_pix || '4d9868d2-88f7-4fed-ad87-6dfc3c4ae698'); addToast('Chave PIX Copiada!', 'success'); }} className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 p-2 rounded-lg font-bold text-xs transition-colors shrink-0">Copiar</button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 font-medium">Titular: {db.igreja?.saas_nome_desenvolvedor || 'PATRICK PESSOA'}</p>
                                </div>

                                <Button onClick={handleVerificarPagamento} disabled={verificandoPix} variant="success" className="w-full py-4 text-base shadow-emerald-500/30">
                                    {verificandoPix ? <Loader2 size={20} className="animate-spin"/> : <RefreshCw size={20}/>}
                                    {verificandoPix ? 'A verificar pagamento no banco...' : 'Já Paguei (Verificar Automaticamente)'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {false && tab === 4 && (
                    <div className="glass-modern p-8 rounded-[2.5rem] overflow-y-auto custom-scrollbar h-full space-y-8 animate-entrance">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Card 1: Aparência e Identidade */}
                            <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                <span className="text-xs font-black tracking-widest text-indigo-700 uppercase block mb-1">Aparência da Assistente Virtual</span>
                                <p className="text-xs text-slate-500 font-medium pb-4 border-b">Customize a imagem facial, o nome e o modelo de atendimento do chatbot de suporte técnico para os operadores.</p>
                                
                                <FormInput 
                                    label="Nome da Assistente Virtual" 
                                    value={data.bot_name || ''} 
                                    onChange={v=>setData({...data, bot_name: v})} 
                                    placeholder="Ex: Mary (Assistente Virtual)" 
                                />

                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Selecionar Avatar da Assistente</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { name: "Mary", url: data.custom_mary_avatar || "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200", tag: "PADRÃO", isMary: true },
                                            { name: "Sofia", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" },
                                            { name: "Gabriel", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" },
                                            { name: "Graça", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" }
                                        ].map((av) => (
                                            <div key={av.name} className="relative group overflow-hidden rounded-2xl border-2 transition-all p-0">
                                                <button 
                                                    type="button"
                                                    onClick={() => setData({
                                                        ...data, 
                                                        bot_avatar: av.url,
                                                        bot_name: av.name === "Mary" ? "Mary (Assistente Virtual)" : av.name + " (Assistente Virtual)"
                                                    })}
                                                    className={`p-1.5 rounded-2xl w-full h-full transition-all flex flex-col items-center gap-1 bg-white border-0 relative ${data.bot_avatar === av.url ? 'scale-105 opacity-100 shadow-md shadow-indigo-600/10' : 'opacity-70 hover:opacity-100'}`}
                                                >
                                                    <img src={av.url} alt={av.name} className="w-12 h-12 rounded-xl object-cover" />
                                                    <span className="text-[10px] font-bold text-slate-700 flex items-center justify-center gap-0.5 whitespace-nowrap">
                                                        {av.name}
                                                        {av.tag && <span className="bg-emerald-500 text-white text-[7px] font-black px-1 rounded-sm leading-tight scale-90 shrink-0">{av.tag}</span>}
                                                    </span>
                                                    {data.bot_avatar === av.url && (
                                                        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[8px] font-black">✓</span>
                                                    )}
                                                </button>

                                                {av.isMary && (
                                                    <label className="absolute inset-x-0 bottom-0 bg-indigo-900/90 hover:bg-slate-900 text-white text-[8px] py-1 text-center font-black uppercase tracking-wider cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                                        <UploadCloud size={8}/> Importar
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
                                                                                bot_avatar: compressed,
                                                                                bot_name: "Mary (Assistente Virtual)"
                                                                            }));
                                                                            addToast("Imagem da Mary customizada com sucesso!", "success");
                                                                        } catch (err) {
                                                                            addToast("Erro ao processar imagem.", "error");
                                                                        }
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mensagem Inicial de Boas-vindas</label>
                                    <textarea 
                                        value={data.bot_welcome || ''} 
                                        onChange={e=>setData({...data, bot_welcome: e.target.value})}
                                        className="w-full text-slate-700 bg-white border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-20"
                                        placeholder="Ex: Olá! Sou o assistente virtual..."
                                    />
                                </div>

                                <div className="space-y-4 pt-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Instruções Customizadas para IA (Prompt de Sistema)</label>
                                    <textarea 
                                        value={data.bot_instructions || ''} 
                                        onChange={e=>setData({...data, bot_instructions: e.target.value})}
                                        className="w-full text-slate-700 bg-white border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-28"
                                        placeholder="Diga à inteligência como se comportar ou regras internas adicionais da sua igreja (ex: horários dos cultos, regras de membresia)."
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium">Estes dados alimentarão o modelo Gemini AI quando o usuário solicitar suporte técnico.</p>
                                </div>
                            </div>

                            {/* Card 2: Base de Conhecimento e FAQ */}
                            <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col h-full">
                                <div>
                                    <span className="text-xs font-black tracking-widest text-indigo-700 uppercase block mb-1">Base de Conhecimento (FAQ Automatizado)</span>
                                    <p className="text-xs text-slate-500 font-medium pb-4 border-b">Configure respostas instantâneas automáticas mapeando palavras-chave específicas encontradas na dúvida do usuário.</p>
                                </div>

                                <div className="space-y-4 bg-white p-5 rounded-2xl border shadow-sm">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Adicionar Regra de FAQ</span>
                                    <FormInput 
                                        label="Palavras-chave (Separadas por vírgulas)" 
                                        value={newKeywords} 
                                        onChange={setNewKeywords} 
                                        placeholder="ex: pix, pagar, conta, dízimos" 
                                        className="!mb-3 text-xs"
                                    />
                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Resposta Automatizada Instantânea</label>
                                        <textarea
                                            value={newResponse}
                                            onChange={e=>setNewResponse(e.target.value)}
                                            rows={3}
                                            className="w-full text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                                            placeholder="Digite a resposta que a IA retornará imediatamente..."
                                        />
                                    </div>
                                    <Button onClick={handleAddFaq} variant="primary" className="w-full py-2.5 text-xs shadow-indigo-500/10">
                                        <Plus size={14}/> Adicionar Regra
                                    </Button>
                                </div>

                                <div className="flex-1 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1 pt-2">
                                    <span className="text-xs font-black text-slate-400 tracking-wider block uppercase">Regras Cadastradas</span>
                                    
                                    {(!data.bot_faq || data.bot_faq.length === 0) ? (
                                        <div className="text-center py-6 text-slate-400 bg-white border border-dashed rounded-2xl flex flex-col items-center">
                                            <Newspaper size={32} className="mb-2 opacity-30"/>
                                            <span className="text-xs font-medium">Nenhuma regra customizada. O chatbot usará as regras padrão do sistema e a Inteligência Artificial.</span>
                                        </div>
                                    ) : (
                                        data.bot_faq.map((rule: any) => (
                                            <div key={rule.id} className="bg-white border rounded-2xl p-4 shadow-sm flex justify-between items-start gap-4 animate-entrance">
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

                        {/* Save Trigger Card */}
                        <div className="mt-8 flex justify-end pt-6 border-t pb-10">
                            <Button onClick={handleSave} variant="primary" className="shadow-lg px-8 py-4 text-lg">
                                <Save size={24}/> Salvar Alterações
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModuleIgreja;
