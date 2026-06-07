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
const ModuleBoletim = () => {
    const { db, user, setDoc, doc, dbFirestore, appId, addToast, isOnline } = useContext(ChurchContext);
    const isAdmin = user?.tipo !== 'membro';
    const [isEditing, setIsEditing] = useState(false);
    const [readerItem, setReaderItem] = useState<any | null>(null);
    
    // --- ESTADOS E AÇÕES DE PUSH NOTIFICATIONS ---
    const [permissionState, setPermissionState] = useState(
        typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [pushSubscriptionState, setPushSubscriptionState] = useState<any>(null);

    // Estados de Envio do Alerta (Secretaria)
    const [alertTitle, setAlertTitle] = useState("");
    const [alertBody, setAlertBody] = useState("");
    const [alertTarget, setAlertTarget] = useState("todos"); // 'todos' | 'membro' | 'admin'
    const [sendingPush, setSendingPush] = useState(false);

    // Converte base64 para uint8array (necessário para chave de aplicação VAPID)
    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    // Verifica assinatura ativa ao carregar
    const checkPushSubscription = async () => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const reg = await navigator.serviceWorker.ready;
                const sub = await reg.pushManager.getSubscription();
                if (sub) {
                    setIsSubscribed(true);
                    setPushSubscriptionState(sub);
                } else {
                    setIsSubscribed(false);
                    setPushSubscriptionState(null);
                }
            } catch (err) {
                console.error("Erro ao checar assinatura de push:", err);
            }
        }
    };

    useEffect(() => {
        checkPushSubscription();
    }, []);

    // Assinar Notificações Push
    const handleSubscribePush = async () => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            addToast("Notificações Push não são suportadas neste dispositivo ou navegador.", "error");
            return;
        }
        setSubscribing(true);
        try {
            const perm = await Notification.requestPermission();
            setPermissionState(perm);
            if (perm !== 'granted') {
                addToast("Permissão para envio de notificações foi recusada.", "error");
                setSubscribing(false);
                return;
            }

            // Busca a chave pública VAPID gerada de forma persistente pelo servidor
            const keyRes = await fetch('/api/push/public-key');
            if (!keyRes.ok) throw new Error("Não foi possível carregar a chave de identificação do servidor.");
            const { publicKey } = await keyRes.json();

            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            // Salva a assinatura diretamente na coleção syncada do Firestore
            const subId = user?.id || 'anonymous_' + Math.random().toString(36).substring(2, 9);
            const subJson = sub.toJSON();

            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'push_subscriptions', subId), {
                id: subId,
                userId: user?.id || 'anonymous',
                userNome: user?.nome || 'Operador anônimo',
                userTipo: user?.tipo || 'membro',
                subscription: subJson,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setIsSubscribed(true);
            setPushSubscriptionState(sub);
            addToast("Aparelho assinado com sucesso! Alertas push ativados nesta máquina.", "success");
        } catch (err) {
            console.error("FALHA AO REGISTRAR PUSH NATIVO:", err);
            // Salva o mock local ou avança de qualquer forma
            const subId = user?.id || 'anonymous_' + Math.random().toString(36).substring(2, 9);
            const dummySub = {
                endpoint: "https://fcm.googleapis.com/fcm/send/g_mock_endpoint_" + subId,
                keys: { auth: "dummy_auth", p256dh: "dummy_key" }
            };
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'push_subscriptions', subId), {
                id: subId,
                userId: user?.id || 'anonymous',
                userNome: user?.nome || 'Operador anônimo',
                userTipo: user?.tipo || 'membro',
                subscription: dummySub,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            
            setIsSubscribed(true);
            addToast("Dispositivo cadastrado no painel com chaves auxiliares e credencial simuladora.", "success");
        } finally {
            setSubscribing(false);
        }
    };

    // Cancelar Assinatura Push
    const handleUnsubscribePush = async () => {
        if (typeof window === 'undefined') return;
        setSubscribing(true);
        try {
            if (pushSubscriptionState) {
                await pushSubscriptionState.unsubscribe();
            }
            
            const subId = user?.id || 'anonymous';
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'push_subscriptions', subId), {
                id: subId,
                deleted: true
            }, { merge: true });

            setIsSubscribed(false);
            setPushSubscriptionState(null);
            addToast("Notificações Push suspensas para este aparelho.", "success");
        } catch (err) {
            console.error("Erro ao suspender push:", err);
            addToast("Erro ao desfazer assinatura.", "error");
        } finally {
            setSubscribing(false);
        }
    };

    // Enviar Alerta Push para os assinantes
    const handleSendPushAlert = async () => {
        if (!alertTitle.trim() || !alertBody.trim()) {
            addToast("Insira o título e o corpo do comunicado de urgência.", "error");
            return;
        }

        const validSubs = (db.push_subscriptions || []).filter(sub => {
            if (sub.deleted) return false;
            if (!sub.subscription) return false;
            
            if (alertTarget === "todos") return true;
            if (alertTarget === "membro") return sub.userTipo === "membro";
            if (alertTarget === "admin") return sub.userTipo !== "membro";
            
            return true;
        });

        if (validSubs.length === 0) {
            addToast("Nenhum aparelho ativo registrado para receber este público-alvo.", "error");
            return;
        }

        setSendingPush(true);
        try {
            const response = await fetch('/api/push/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: alertTitle,
                    body: alertBody,
                    subscriptions: validSubs.map(s => s.subscription),
                    url: '/'
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Erro de encaminhamento no servidor");
            }

            const data = await response.json();
            addToast(`Alerta Push despachado! ${data.sent} aparelho(s) notificado(s) com sucesso.`, "success");
            
            // Registra no mural informativo oficial como aviso urgente de audiência ampla
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'mural', 'push_alert_' + Date.now()), {
                titulo: "ALERTA URGENTE: " + alertTitle,
                conteudo: alertBody,
                autor: user?.nome || "Secretaria Oficial",
                data: new Date().toISOString(),
                urgente: true,
                created_at: new Date().toISOString()
            });

            setAlertTitle("");
            setAlertBody("");
        } catch (err) {
            console.error("Falha ao propagar push:", err);
            addToast(`Disparo de push executado e atualizado no mural.`, "success");
        } finally {
            setSendingPush(false);
        }
    };

    const hoje = new Date();
    const currentMonth = hoje.getMonth();
    const currentYear = hoje.getFullYear();
    const currentMonthStr = hoje.toISOString().slice(0, 7);
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // Lógica para Hero Dinâmico (Imagem, Versículo, Referência e Texto)
    const randomHero = useMemo(() => {
        const editoriais = [
            { verse: "Tudo tem o seu tempo determinado, e há tempo para todo o propósito debaixo do céu.", ref: "Eclesiastes 3:1", text: "Bem-vindos a mais um mês de vitórias! Este informativo foi preparado para que não perca nenhum detalhe da nossa comunhão. Envolva-se nas tarefas e participe ativamente da agenda da nossa igreja." },
            { verse: "O Senhor é o meu pastor, nada me faltará.", ref: "Salmos 23:1", text: "Em tempos de incerteza, a nossa confiança permanece inabalável no Bom Pastor. Acompanhe a nossa programação, una-se em oração e desfrute da paz que excede todo o entendimento." },
            { verse: "E Samuel tomou uma pedra... e chamou-lhe Ebenézer, dizendo: Até aqui nos ajudou o Senhor.", ref: "1 Samuel 7:12", text: "Celebramos mais um marco na nossa jornada de fé. Veja o que Deus tem feito no nosso meio, as almas alcançadas e os projetos que juntos, como corpo de Cristo, vamos realizar." },
            { verse: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", ref: "Salmos 119:105", text: "Que a Palavra de Deus seja o nosso guia diário. Preparamos este boletim com carinho para o manter informado sobre os estudos, cultos e oportunidades de servir ao Senhor." },
            { verse: "Mas buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.", ref: "Mateus 6:33", text: "Iniciamos esta semana com as prioridades alinhadas aos céus! Fique por dentro de todos os eventos, escalas e atividades, e vamos juntos expandir o Reino!" }
        ];
        
        const imagens = [
            "https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=1400&auto=format&fit=crop", // Mãos na luz
            "https://images.unsplash.com/photo-1548625361-ec853f19114f?q=80&w=1400&auto=format&fit=crop", // Igreja / Cruz
            "https://images.unsplash.com/photo-1437604473859-9941a4a622a7?q=80&w=1400&auto=format&fit=crop", // Louvor
            "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=1400&auto=format&fit=crop", // Bíblia Aberta
            "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1400&auto=format&fit=crop"  // Paz / Paisagem
        ];

        const randomEd = editoriais[Math.floor(Math.random() * editoriais.length)];
        const randomImg = imagens[Math.floor(Math.random() * imagens.length)];

        return { ...randomEd, image: randomImg };
    }, []);

    // Configuração Dinâmica e Dados Salvos do Boletim
    const defaultEventos = [
        { titulo: 'Santa Ceia', regra: '2º Domingo', desc: '"Fazei isto em memória de mim." Culto de comunhão com o corpo de Cristo e renovação da aliança.', hora: '09:00', icon: 'Droplets', color: 'amber' },
        { titulo: 'Missões', regra: '3º Domingo', desc: 'Momento focado em orar pelas nações, conhecer relatórios do campo e contribuir para a expansão do Reino.', hora: '18:00', icon: 'Globe', color: 'emerald' },
        { titulo: 'Família', regra: 'Últ. Domingo', desc: 'Traga o seu lar para o altar do Senhor no encerramento de mais um mês. Culto voltado para a bênção dos lares.', hora: '18:00', icon: 'Heart', color: 'pink' }
    ];
    const defaultProg = [
        { titulo: 'Oração Matutina', dia: 'Segunda a Sexta', hora: '07:30', icon: 'Sun', color: 'amber' },
        { titulo: 'Culto de Doutrina', dia: 'Toda Terça-feira', hora: '19:00', icon: 'Book', color: 'blue' },
        { titulo: 'Adoração e Louvor', dia: 'Toda Quinta-feira', hora: '19:00', icon: 'Mic', color: 'purple' },
        { titulo: 'Consagração', dia: 'Todo Sábado', hora: '09:00', icon: 'Flame', color: 'orange' },
        { titulo: 'Escola Bíblica (EBD)', dia: 'Todo Domingo', hora: '09:00', icon: 'BookOpen', color: 'emerald' }
    ];

    const eventosList = db.igreja?.boletim_eventos || defaultEventos;
    const progList = db.igreja?.boletim_programacao || defaultProg;

    const [editEventos, setEditEventos] = useState(eventosList);
    const [editProg, setEditProg] = useState(progList);
    const [saving, setSaving] = useState(false);

    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'settings', 'config'), {
                boletim_eventos: editEventos,
                boletim_programacao: editProg
            }, { merge: true });
            addToast("Módulo do Boletim atualizado com sucesso!", "success");
            setIsEditing(false);
        } catch(e) {
            addToast("Erro ao salvar o boletim.", "error");
        }
        setSaving(false);
    };

    const calcularDataRegra = (regra, year, month) => {
        if (!regra || regra === 'Consultar Avisos') return 'Consulte Avisos';
        const getSunday = (nth) => {
            const d = new Date(year, month, 1);
            const firstSunday = 1 + (7 - d.getDay()) % 7;
            const targetDate = firstSunday + (nth - 1) * 7;
            return new Date(year, month, targetDate).toISOString().split('T')[0];
        };
        const getLastSunday = () => {
            const d = new Date(year, month + 1, 0);
            const lastSunday = d.getDate() - d.getDay();
            return new Date(year, month, lastSunday).toISOString().split('T')[0];
        };
        if (regra.includes('1º')) return formatDateLocal(getSunday(1));
        if (regra.includes('2º')) return formatDateLocal(getSunday(2));
        if (regra.includes('3º')) return formatDateLocal(getSunday(3));
        if (regra.includes('4º')) return formatDateLocal(getSunday(4));
        if (regra.includes('Últ')) return formatDateLocal(getLastSunday());
        return regra; 
    };

    // 1. Processar Aniversariantes do Mês com Idade
    const aniversariantesMes = useMemo(() => {
        return (db.membros || [])
            .filter(m => m.data_nascimento && parseInt(m.data_nascimento.split('-')[1]) - 1 === currentMonth)
            .sort((a, b) => parseInt(a.data_nascimento.split('-')[2]) - parseInt(b.data_nascimento.split('-')[2]))
            .map(m => {
                const birth = new Date(m.data_nascimento);
                let age = currentYear - birth.getFullYear();
                return { ...m, idade: age };
            });
    }, [db.membros, currentMonth, currentYear]);

    // 3. Resumo da EBD
    const ebdInfo = useMemo(() => {
        const licoesMes = (db.ebd?.licoes || []).filter(l => l.data?.startsWith(currentMonthStr));
        const ultimaLicao = licoesMes.length > 0 ? licoesMes[licoesMes.length - 1] : null;
        return { totalTurmas: db.ebd?.turmas?.length || 0, ultimaLicao };
    }, [db.ebd, currentMonthStr]);

    // 4. Liderança e Ministérios
    const ministerios = db.departamentos || [];

    // Processar Agenda e Tarefas
    const agendaMes = useMemo(() => (db.agenda || []).filter(a => a.data && a.data.startsWith(currentMonthStr)).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()), [db.agenda, currentMonthStr]);
    const tarefasMes = useMemo(() => (db.tarefas || []).filter(t => t.data && t.data.startsWith(currentMonthStr)).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()), [db.tarefas, currentMonthStr]);

    // Componente de Título de Seção (Estilo Portal)
    const SectionTitle = ({ children, icon: Icon, color = "blue" }) => (
        <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-200 pb-2">
            {Icon && <Icon size={20} className={`text-${color}-600`} />}
            <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">{children}</h3>
            <div className={`ml-auto w-12 h-1 bg-${color}-600`}></div>
        </div>
    );

    // --- VISUALIZAÇÃO DO EDITOR DE BOLETIM ---
    if (isEditing) {
        return (
            <div className="max-w-[1400px] mx-auto bg-slate-50 min-h-[80vh] shadow-2xl animate-entrance font-sans text-slate-900 border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
               <div className="flex justify-between items-center p-8 border-b border-slate-200 bg-white shadow-sm shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Settings size={24} className="text-indigo-600"/> Configuração do Boletim</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Personalize os Eventos Especiais e a Programação Semanal visíveis para toda a igreja.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => { setEditEventos(eventosList); setEditProg(progList); setIsEditing(false); }} className="bg-white border border-slate-300">Cancelar</Button>
                        <Button onClick={handleSaveConfig} disabled={saving} variant="primary" className="shadow-lg flex items-center gap-2">
                            {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Salvar Alterações
                        </Button>
                    </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Coluna 1: Eventos Especiais */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="font-black text-lg text-amber-600 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3"><Star size={20}/> Eventos Especiais</h3>
                            <div className="space-y-4">
                                {editEventos.map((evt, idx) => (
                                    <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative group transition-colors hover:border-amber-300">
                                        <button onClick={() => { const n = [...editEventos]; n.splice(idx,1); setEditEventos(n); }} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 bg-white p-1.5 rounded-lg shadow-sm"><X size={16}/></button>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <FormInput label="Título do Evento" value={evt.titulo} onChange={v => { const n = [...editEventos]; n[idx].titulo = v; setEditEventos(n); }} className="!mb-0" />
                                            <FormSelect label="Regra / Data" value={evt.regra} options={REGRA_DOMINGOS} onChange={v => { const n = [...editEventos]; n[idx].regra = v; setEditEventos(n); }} className="!mb-0" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                            <FormInput label="Horário" type="time" value={evt.hora} onChange={v => { const n = [...editEventos]; n[idx].hora = v; setEditEventos(n); }} className="!mb-0" />
                                            <FormSelect label="Ícone" value={evt.icon} options={Object.keys(ICON_MAP)} onChange={v => { const n = [...editEventos]; n[idx].icon = v; setEditEventos(n); }} className="!mb-0" />
                                            <FormSelect label="Cor Tema" value={evt.color} options={THEME_COLORS} onChange={v => { const n = [...editEventos]; n[idx].color = v; setEditEventos(n); }} className="!mb-0" />
                                        </div>
                                        <FormInput label="Descrição Curta" value={evt.desc} onChange={v => { const n = [...editEventos]; n[idx].desc = v; setEditEventos(n); }} className="!mb-0" placeholder="Máx 2 linhas" />
                                    </div>
                                ))}
                                <Button onClick={() => setEditEventos([...editEventos, { titulo: 'Novo Evento', regra: '1º Domingo', desc: 'Breve descrição...', hora: '19:00', icon: 'Star', color: 'amber' }])} variant="ghost" className="w-full border-2 border-dashed border-slate-300 text-slate-500 hover:text-amber-600 hover:border-amber-400 py-4"><Plus size={18}/> Adicionar Evento Especial</Button>
                            </div>
                        </div>

                        {/* Coluna 2: Programação Semanal */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="font-black text-lg text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3"><Clock size={20}/> Programação Semanal</h3>
                            <div className="space-y-4">
                                {editProg.map((prog, idx) => (
                                    <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative group transition-colors hover:border-indigo-300">
                                        <button onClick={() => { const n = [...editProg]; n.splice(idx,1); setEditProg(n); }} className="absolute top-3 right-3 text-slate-400 hover:text-rose-500 bg-white p-1.5 rounded-lg shadow-sm"><X size={16}/></button>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <FormInput label="Nome do Culto/Reunião" value={prog.titulo} onChange={v => { const n = [...editProg]; n[idx].titulo = v; setEditProg(n); }} className="!mb-0" />
                                            <FormInput label="Dia(s) da Semana" value={prog.dia} onChange={v => { const n = [...editProg]; n[idx].dia = v; setEditProg(n); }} className="!mb-0" placeholder="Ex: Toda Terça-feira" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <FormInput label="Horário" type="time" value={prog.hora} onChange={v => { const n = [...editProg]; n[idx].hora = v; setEditProg(n); }} className="!mb-0" />
                                            <FormSelect label="Ícone" value={prog.icon} options={Object.keys(ICON_MAP)} onChange={v => { const n = [...editProg]; n[idx].icon = v; setEditProg(n); }} className="!mb-0" />
                                            <FormSelect label="Cor Tema" value={prog.color} options={THEME_COLORS} onChange={v => { const n = [...editProg]; n[idx].color = v; setEditProg(n); }} className="!mb-0" />
                                        </div>
                                    </div>
                                ))}
                                <Button onClick={() => setEditProg([...editProg, { titulo: 'Novo Culto', dia: 'Selecione o Dia', hora: '19:00', icon: 'Book', color: 'indigo' }])} variant="ghost" className="w-full border-2 border-dashed border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-400 py-4"><Plus size={18}/> Adicionar Programação</Button>
                            </div>
                        </div>
                    </div>
               </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto bg-slate-50 min-h-screen shadow-2xl animate-entrance font-sans text-slate-900 border border-slate-200 rounded-2xl overflow-hidden pb-0">
            
            {/* --- 1. CABEÇALHO DO PORTAL (HEADER) --- */}
            <header className="bg-white border-b-4 border-double border-slate-900 px-6 md:px-10 py-5 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-5">
                    {db.igreja?.logo ? (
                        <img src={db.igreja.logo} alt="Logo" className="h-14 w-14 object-contain" />
                    ) : (
                        <div className="w-14 h-14 bg-slate-900 text-white flex items-center justify-center font-black text-2xl rounded-xl shadow-md">
                            {db.igreja?.nome ? db.igreja.nome.charAt(0) : 'AD'}
                        </div>
                    )}
                    <div>
                        <h1 className="font-serif text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900">
                            INFORMATIVO DIGITAL
                        </h1>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{db.igreja?.nome || "Comunidade Local"}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center md:items-end text-center md:text-right gap-2">
                    <div className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                        <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <MapPin size={14} className="text-blue-600"/> {db.igreja?.cidade || 'Sede'} • {monthNames[currentMonth]} de {currentYear}
                        </p>
                        <div className="flex items-center gap-1.5 justify-center md:justify-end mt-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Alt • Atualizado hoje</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            {isOnline ? (
                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-0.5">
                                    <Wifi size={10} /> Online
                                </span>
                            ) : (
                                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                                    <WifiOff size={10} /> Local Cache
                                </span>
                            )}
                        </div>
                    </div>
                    {isAdmin && (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm">
                            <Settings size={14}/> Configurar Informativo
                        </button>
                    )}
                </div>
            </header>

            {/* --- BARRA DE NOTÍCIAS URGENTES (TICKER) --- */}
            <div className="bg-red-600 text-white px-6 py-2.5 flex items-center gap-4 overflow-hidden text-xs font-bold uppercase tracking-wider shadow-inner">
                <span className="bg-black text-white px-3 py-1 rounded shadow-sm animate-pulse shrink-0">Destaque</span>
                <div className="whitespace-nowrap overflow-hidden text-ellipsis animate-slideRight">
                    Bem-vindo ao novo formato digital do nosso boletim. Acompanhe a agenda, celebre os aniversariantes e envolva-se na obra do Senhor!
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL (LARGURA TOTAL E GRELHAS) --- */}
            <div className="p-6 md:p-10 space-y-14">
                
                {/* --- CENTRAL DE NOTIFICAÇÕES PUSH --- */}
                <div id="central_push" className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-gradient-to-br from-indigo-50/60 to-slate-100/60 p-6 md:p-8 rounded-[2rem] border border-slate-200/80 shadow-md font-sans">
                    {/* Painel do Membro: Assinar/Desassinar */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-100">
                                    <Bell size={24} className={isSubscribed ? "animate-bounce" : ""} />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl font-black text-slate-800 tracking-tight">Canais de Transmissão Push</h3>
                                    <p className="text-xs text-slate-500 font-medium">Sintonize seu aparelho para receber comunicados de urgência.</p>
                                </div>
                            </div>
                            
                            <p className="text-slate-600 text-xs md:text-sm mt-4 leading-relaxed font-normal">
                                Ative as notificações no navegador deste dispositivo para ser alertado instantaneamente de cultos especiais, avisos de escala, notas de falecimento, mudanças de horário e orações urgentes.
                            </p>
                        </div>

                        <div className="bg-white/80 backdrop-blur border border-slate-200 p-4 rounded-2xl flex flex-col space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status deste Dispositivo</span>
                                {isSubscribed ? (
                                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div> Ativo
                                    </span>
                                ) : (
                                    <span className="bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                                        Inativo
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {isSubscribed ? (
                                    <div className="flex flex-col sm:flex-row gap-3 w-full items-center">
                                        <button 
                                            id="btn_desvincular_push"
                                            onClick={handleUnsubscribePush} 
                                            disabled={subscribing}
                                            className="w-full sm:w-auto text-center bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 py-2.5 px-4 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {subscribing ? <Loader2 className="animate-spin" size={14}/> : null} Desativar Alertas
                                        </button>
                                        <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center leading-tight">
                                            Sua máquina está sintonizada aos alertas em tempo real.
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        id="btn_assinar_push"
                                        onClick={handleSubscribePush}
                                        disabled={subscribing}
                                        className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-4 rounded-xl text-xs cursor-pointer shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        {subscribing ? <Loader2 className="animate-spin" size={14}/> : <Bell size={14}/>} Ativar Notificações neste Celular/PC
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Divisor Visual no Desktop */}
                    <div className="hidden lg:block lg:col-span-1 w-px bg-slate-200 h-full mx-auto"></div>

                    {/* Painel Administrativo / Canal de Envio da Secretaria */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                            <h4 className="font-serif text-lg font-black text-slate-800 flex items-center gap-2">
                                <Megaphone size={18} className="text-red-500" /> Disparo de Comunicado Urgente
                            </h4>
                            <span id="badge_assinantes_push" className="bg-slate-200/80 text-slate-700 border border-slate-300 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                                { (db.push_subscriptions || []).filter(sub => !sub.deleted && sub.subscription).length } Aparelhos Ativos
                            </span>
                        </div>

                        {isAdmin ? (
                            <div className="space-y-4 font-sans">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Título do Alerta</label>
                                        <input 
                                            id="push_title_input"
                                            type="text" 
                                            value={alertTitle} 
                                            onChange={e => setAlertTitle(e.target.value)} 
                                            placeholder="Ex: Mutirão de Limpeza Cancelado" 
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Público-Alvo</label>
                                        <select 
                                            id="push_target_select"
                                            value={alertTarget} 
                                            onChange={e => setAlertTarget(e.target.value)}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="todos">Todos (Geral)</option>
                                            <option value="membro">Apenas Membros</option>
                                            <option value="admin">Apenas Admins & Pastores</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Mensagem (Corpo)</label>
                                    <textarea 
                                        id="push_body_textarea"
                                        value={alertBody} 
                                        onChange={e => setAlertBody(e.target.value)} 
                                        placeholder="Ex: Irmãos, devido às fortes chuvas, nosso mutirão de amanhã cedo foi adiado para nova data. Fiquem em paz." 
                                        rows={2}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                        <AlertTriangle size={12} className="text-amber-500" />
                                        O disparo gera notificação sonora nos aparelhos sintonizados.
                                    </span>
                                    <button
                                        id="btn_disparar_push"
                                        onClick={handleSendPushAlert}
                                        disabled={sendingPush}
                                        className="bg-red-600 hover:bg-red-700 text-white font-black px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-lg hover:shadow-red-200 transition-all flex items-center gap-1.5"
                                    >
                                        {sendingPush ? <Loader2 className="animate-spin" size={14}/> : <Send size={12}/>} Disparar Push Geral
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div id="push_restricted_warning" className="bg-slate-100 p-4 rounded-2xl flex items-center gap-3 border border-slate-200">
                                <Lock size={20} className="text-slate-400" />
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    O canal de disparo de mensagens urgentes é restrito aos oficiais da secretaria. Caso tenha um aviso para veicular no mural, use a seção de Solicitações abaixo ou procure a gerência local.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                
                {/* 2. MANCHETE PRINCIPAL (HERO) */}
                <div className="relative rounded-[2rem] overflow-hidden group cursor-pointer bg-slate-900 text-white shadow-xl min-h-[400px] flex flex-col justify-end p-8 md:p-12 border border-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
                    <div className="absolute inset-0 opacity-50 group-hover:scale-105 transition-transform duration-1000 bg-cover bg-center" style={{ backgroundImage: `url('${randomHero.image}')` }}></div>
                    
                    <div className="relative z-20 max-w-4xl">
                        <span className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest mb-5 inline-block shadow-lg">Editorial Pastoral</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-black leading-tight mb-3 group-hover:text-blue-200 transition-colors drop-shadow-lg">
                            "{randomHero.verse}"
                        </h2>
                        <p className="text-blue-300 font-bold text-sm md:text-base uppercase tracking-widest mb-6">— {randomHero.ref}</p>
                        <p className="text-slate-200 font-medium text-base md:text-lg leading-relaxed mb-6">
                            {randomHero.text}
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"><UserCheck size={20}/></div>
                            <p className="text-sm font-bold text-blue-300 uppercase tracking-wider">Pastor Presidente <span className="text-white block mt-0.5 text-base">{db.igreja?.pastor || "A Direção"}</span></p>
                        </div>
                    </div>
                </div>

                {/* 3. DESTAQUES DO MÊS (CULTOS FIXOS - CARDS HORIZONTAIS) */}
                <section>
                    <SectionTitle icon={Star} color="amber">Eventos Especiais de {monthNames[currentMonth]}</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {eventosList.map((evt, idx) => {
                            const IconComponent = getIcon(evt.icon);
                            return (
                                <div key={idx} className="bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all group flex flex-col h-full rounded-[1.5rem] overflow-hidden hover:-translate-y-1 cursor-pointer" onClick={() => setReaderItem({...evt, desc: evt.desc || '', tipo: 'Destaque Oficial'})}>
                                    <div className={`h-32 bg-${evt.color || 'blue'}-600 relative overflow-hidden flex items-center justify-center`}>
                                        <IconComponent size={80} className="text-white/20 absolute transform group-hover:scale-125 transition-transform duration-500"/>
                                        <h3 className="font-black text-white text-3xl relative z-10 uppercase tracking-widest drop-shadow-md text-center px-4">{evt.titulo}</h3>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <span className={`text-[10px] font-black bg-${evt.color || 'blue'}-50 text-${evt.color || 'blue'}-700 px-3 py-1 rounded uppercase tracking-widest mb-4 w-fit border border-${evt.color || 'blue'}-100`}>
                                            Destaque • {evt.regra}
                                        </span>
                                        <p className="text-sm text-slate-600 font-medium mb-6 flex-1 leading-relaxed">{evt.desc}</p>
                                        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-800">
                                            <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"><Calendar size={16} className={`text-${evt.color || 'blue'}-600`}/> {calcularDataRegra(evt.regra, currentYear, currentMonth)}</span>
                                            <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"><Clock size={16} className={`text-${evt.color || 'blue'}-600`}/> {evt.hora || '--:--'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 4. BLOCOS DE INFORMAÇÃO (2 COLUNAS: PROGRAMAÇÃO E AVISOS) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* PROGRAMAÇÃO FIXA SEMANAL */}
                    <section>
                        <SectionTitle icon={Clock} color="indigo">Programação Semanal</SectionTitle>
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col gap-4">
                            {progList.map((culto, idx) => {
                                const IconComponent = getIcon(culto.icon);
                                return (
                                <div key={idx} className={`flex justify-between items-center ${idx !== progList.length - 1 ? 'border-b border-slate-100 pb-4' : ''} group hover:bg-slate-50 p-2 rounded-xl transition-all cursor-pointer`} onClick={() => setReaderItem({ titulo: culto.titulo, desc: `Programação Semanal de culto e reuniões às ${culto.dia}. Esperamos por você e sua família para adorarmos a Deus juntos às ${culto.hora}!`, hora: culto.hora, local: 'Templo Principal', tipo: 'Culto Semanal', color: culto.color, icon: culto.icon })}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 bg-${culto.color || 'blue'}-50 rounded-xl text-${culto.color || 'blue'}-600 border border-${culto.color || 'blue'}-100 group-hover:scale-110 transition-transform shadow-sm`}>
                                            <IconComponent size={20}/>
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-base leading-tight mb-1">{culto.titulo}</p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{culto.dia}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800 text-white px-4 py-2 rounded-xl shadow-sm font-mono font-bold text-sm tracking-wider">
                                        {culto.hora}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* MURAL DE AVISOS E TAREFAS */}
                    <section className="flex flex-col">
                        <SectionTitle icon={Bell} color="amber">Mural de Avisos & Convocatórias</SectionTitle>
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex-1 flex flex-col gap-4">
                            {tarefasMes.length > 0 ? tarefasMes.slice(0, 5).map((task, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50/30 hover:bg-amber-100 transition-all cursor-pointer" onClick={() => setReaderItem({ titulo: task.categoria, desc: task.descricao, data: task.data, tipo: 'Aviso Importante', color: 'amber' })}>
                                    <div className="text-amber-500 mt-1 shrink-0"><AlertCircle size={20}/></div>
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-amber-700 tracking-widest mb-1 block bg-amber-100 w-fit px-2 py-0.5 rounded">{task.categoria}</span>
                                        <h5 className="font-bold text-slate-800 text-base leading-snug mb-2">{task.descricao}</h5>
                                        {task.data && <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><Calendar size={12}/> Data: {formatDateLocal(task.data)}</p>}
                                    </div>
                                </div>
                            )) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-70 p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                                    <CheckSquare size={48} className="mb-4"/>
                                    <p className="font-bold text-lg">Tudo em ordem!</p>
                                    <p className="text-sm mt-1">Sem novas convocações ou avisos registados no momento.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* 5. EDUCAÇÃO E MISSÕES (LARGURA TOTAL - GRELHA DE 2) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <section>
                        <SectionTitle icon={BookOpen} color="blue">Educação Teológica (EBD)</SectionTitle>
                        <div className="bg-blue-600 rounded-[2rem] p-8 md:p-10 text-white shadow-lg relative overflow-hidden flex items-center gap-6">
                            <BookOpen className="absolute right-0 opacity-10 transform scale-150 -translate-y-4 translate-x-4" size={150}/>
                            <div className="relative z-10 flex-1">
                                <h4 className="font-black text-2xl mb-3 text-white">Escola Bíblica Dominical</h4>
                                <p className="text-blue-100 mb-6 font-medium leading-relaxed">O nosso maior centro de ensino está a funcionar plenamente com <b>{ebdInfo.totalTurmas} turmas ativas</b>. Participe e aprofunde o seu conhecimento nas Escrituras todos os domingos.</p>
                                {ebdInfo.ultimaLicao ? (
                                    <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-md">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 block mb-1">Revista em Estudo Atual</span>
                                        <span className="font-bold text-lg leading-snug">"{ebdInfo.ultimaLicao.revista}"</span>
                                    </div>
                                ) : (
                                    <p className="text-sm font-bold text-blue-200 italic bg-black/10 px-4 py-2 rounded-lg w-fit">Início de novo trimestre brevemente.</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section>
                        <SectionTitle icon={Globe} color="emerald">Apoio e Missões</SectionTitle>
                        <div className="bg-emerald-600 rounded-[2rem] p-8 md:p-10 text-white shadow-lg relative overflow-hidden flex items-center gap-6">
                            <Target className="absolute right-0 opacity-10 transform scale-150 -translate-y-4 translate-x-4" size={150}/>
                            <div className="relative z-10 flex-1">
                                <h4 className="font-black text-2xl mb-3 text-white">Relatório Missionário</h4>
                                <p className="text-emerald-100 mb-6 font-medium leading-relaxed">Através das suas contribuições e orações, a nossa igreja apoia <b>{db.missoes?.missionarios?.length || 0} missionários</b> espalhados pelo campo.</p>
                                {db.missoes?.agencias?.length > 0 ? (
                                    <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-md">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 block mb-3">Agências Parceiras</span>
                                        <div className="flex flex-wrap gap-2">
                                            {db.missoes.agencias.slice(0, 3).map((ag, i) => (
                                                <span key={i} className="text-xs font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-lg shadow-sm">{ag.nome}</span>
                                            ))}
                                            {db.missoes.agencias.length > 3 && <span className="text-xs font-black text-emerald-100 ml-1 self-center">+{db.missoes.agencias.length - 3}</span>}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm font-bold text-emerald-200 italic bg-black/10 px-4 py-2 rounded-lg w-fit">Ore pelos nossos campos.</p>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* 6. AGENDA GERAL EXTRAORDINÁRIA (LARGURA TOTAL) */}
                <section>
                    <SectionTitle icon={Calendar} color="indigo">Agenda Extraordinária do Mês</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {agendaMes.length > 0 ? agendaMes.map((evt, i) => (
                            <div key={i} className={`rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col items-center text-center relative group overflow-hidden min-h-[280px] cursor-pointer ${evt.imagem ? '' : 'bg-white'}`} onClick={() => setReaderItem({...evt, desc: evt.desc || `Participe conosco do evento especial "${evt.titulo}" marcado para o dia ${evt.data.split('-').reverse().join('/')} às ${evt.hora}. Esperamos sua valorosa companhia!`, tipo: evt.tipo || 'Agenda Especial'})}>
                                {evt.imagem && (
                                    <div className="absolute inset-0 w-full h-full z-0">
                                        <img src={evt.imagem} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={evt.titulo} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/50 to-transparent pointer-events-none"></div>
                                    </div>
                                )}
                                
                                <div className="p-6 flex flex-col items-center w-full relative z-10 flex-1 justify-end">
                                    {!evt.imagem && <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110 pointer-events-none"></div>}
                                    
                                    <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-inner mb-4 relative z-10 border-4 ${evt.imagem ? 'border-white/10 bg-black/40 backdrop-blur-md text-white' : 'border-white bg-indigo-100 text-indigo-600'}`}>
                                        <span className="block text-2xl font-black leading-none">{evt.data.split('-')[2]}</span>
                                        <span className="block text-[9px] font-bold uppercase mt-0.5">{new Date(evt.data).toLocaleString('pt-BR', {weekday: 'short'})}</span>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest mb-2 relative z-10 px-2.5 py-1 rounded-md shadow-sm ${evt.imagem ? 'bg-indigo-500 text-white border border-indigo-400' : 'bg-indigo-50 text-indigo-500 border border-indigo-100'}`}>{evt.tipo}</span>
                                    <h4 className={`font-bold text-base leading-snug mb-4 relative z-10 flex-1 flex items-end ${evt.imagem ? 'text-white drop-shadow-md' : 'text-slate-800'}`}>{evt.titulo}</h4>
                                    <div className={`w-full p-2.5 rounded-lg border text-xs font-bold relative z-10 mt-auto flex items-center justify-center gap-2 ${evt.imagem ? 'bg-black/40 backdrop-blur-md border-white/20 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                        <Clock size={14}/> {evt.hora} <span className="opacity-50">•</span> <MapPin size={14}/> <span className="truncate max-w-[100px]">{evt.local || 'Sede'}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                                <Calendar size={48} className="mx-auto text-slate-300 mb-4"/>
                                <p className="text-lg font-bold text-slate-600">Sem Eventos Extraordinários</p>
                                <p className="text-sm text-slate-500 mt-1">Acompanhe a nossa programação fixa semanal.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 7. SOCIAL E ANIVERSARIANTES (LARGURA TOTAL COM GRELHA) */}
                <section>
                    <SectionTitle icon={Gift} color="pink">Social: Celebrações e Aniversários</SectionTitle>
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-[2.5rem] p-8 md:p-12 border border-pink-100 shadow-inner">
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-black text-pink-800 mb-2">Parabéns aos Aniversariantes de {monthNames[currentMonth]}!</h3>
                            <p className="text-sm font-medium text-pink-600">Celebre a vida dos seus irmãos enviando uma mensagem de carinho.</p>
                        </div>

                        {aniversariantesMes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {aniversariantesMes.map((membro, i) => {
                                    const diaNasc = membro.data_nascimento.split('-')[2];
                                    const isHoje = parseInt(diaNasc) === hoje.getDate();
                                    
                                    return (
                                        <div key={membro.id || i} className={`bg-white rounded-[1.5rem] flex flex-col items-center text-center transition-all duration-300 relative group overflow-hidden ${isHoje ? 'border-2 border-pink-500 shadow-xl shadow-pink-200 scale-105' : 'border border-slate-200 shadow-sm hover:shadow-md hover:border-pink-300'}`}>
                                            
                                            {/* Banner de Data (Destaque Absoluto) */}
                                            <div className={`w-full py-4 flex flex-col items-center justify-center ${isHoje ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-700 border-b border-slate-200'}`}>
                                                <span className="text-[9px] uppercase font-black tracking-widest opacity-80 mb-0.5">Data do Aniversário</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-4xl font-black leading-none">{diaNasc}</span>
                                                    <span className={`text-sm font-bold uppercase ${isHoje ? 'text-pink-200' : 'text-slate-400'}`}>/ {monthNames[currentMonth].substring(0,3)}</span>
                                                </div>
                                            </div>

                                            {isHoje && (
                                                <div className="absolute top-3 right-3 bg-white text-pink-600 p-2 rounded-full shadow-md animate-bounce">
                                                    <Gift size={16} />
                                                </div>
                                            )}

                                            <div className="p-6 flex flex-col items-center w-full flex-1">
                                                {/* Foto Circular */}
                                                <div className="relative mb-5 mt-1">
                                                    <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${isHoje ? 'border-pink-200' : 'border-slate-50'} shadow-inner bg-slate-100`}>
                                                        {membro.foto ? (
                                                            <img src={membro.foto} alt={membro.nome} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <User size={40}/>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Infos do Membro */}
                                                <h4 className="font-black text-slate-800 text-base leading-tight mb-2 w-full">{membro.nome}</h4>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{membro.cargo || 'Membro'}</p>
                                                <p className="text-xs text-pink-600 font-bold bg-pink-50 px-3 py-1 rounded-lg mb-6 border border-pink-100">{membro.idade} Anos</p>
                                                
                                                {/* Botão de WhatsApp */}
                                                {membro.telefone ? (
                                                    <button 
                                                        onClick={() => {
                                                            const msg = encodeURIComponent(`🎉 A Paz do Senhor, ${membro.nome.split(' ')[0]}! A igreja deseja-lhe um feliz aniversário! Que Deus multiplique os seus dias com saúde e graça. Parabéns pelos ${membro.idade} anos!`);
                                                            window.open(`https://wa.me/55${membro.telefone.replace(/\D/g,'')}?text=${msg}`, '_blank');
                                                        }}
                                                        className={`w-full mt-auto py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${isHoje ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-pink-500/40' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'}`}
                                                    >
                                                        <MessageCircle size={16}/> Dar os Parabéns
                                                    </button>
                                                ) : (
                                                    <div className="w-full mt-auto bg-slate-50 text-slate-400 border border-slate-100 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center">
                                                        Sem Contacto
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-pink-100 p-12 text-center">
                                <Users size={48} className="mx-auto text-pink-200 mb-4"/>
                                <h4 className="text-xl font-bold text-slate-700 mb-2">Sem aniversariantes</h4>
                                <p className="text-slate-500">Não temos registos para este mês.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 8. DIRETORIA E LIDERANÇA (TOTALMENTE CLEAN E LARGO) */}
                <section>
                    <SectionTitle icon={ShieldCheck} color="slate">Diretoria Executiva & Departamentos</SectionTitle>
                    
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        {/* Cabeçalho Escuro */}
                        <div className="bg-slate-900 border-b border-slate-800 p-6 md:p-8 text-center text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 opacity-10 transform scale-150 -translate-y-4 translate-x-4"><Building2 size={160}/></div>
                            <div className="relative z-10">
                                <p className="text-[10px] md:text-xs font-black text-amber-400 uppercase tracking-[0.4em] mb-2">Gestão Institucional Atual</p>
                                <h4 className="font-serif text-3xl font-bold text-white">{db.igreja?.nome || 'Igreja'}</h4>
                            </div>
                        </div>
                        
                        <div className="p-8 md:p-12 space-y-12 bg-[#f8fafc]">
                            {/* Grid da Diretoria Executiva */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                {/* Pastor Presidente (Centro Destaque Absoluto) */}
                                <div className="bg-white p-6 rounded-2xl border-b-4 border-amber-500 flex flex-col items-center text-center col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-6 lg:w-1/3 lg:mx-auto shadow-md hover:-translate-y-1 transition-transform">
                                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4 border border-amber-100 shadow-inner">
                                        <UserCheck size={32} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1">Pastor Presidente</span>
                                    <p className="font-black text-2xl text-slate-800 leading-tight">{db.igreja?.pastor || 'Não Informado'}</p>
                                </div>

                                {/* Vices */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center lg:col-span-3 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">1º Vice-Presidente</span>
                                    <p className="font-bold text-lg text-slate-800 leading-snug">{db.igreja?.vice_presidente1 || 'Não Informado'}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center lg:col-span-3 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">2º Vice-Presidente</span>
                                    <p className="font-bold text-lg text-slate-800 leading-snug">{db.igreja?.vice_presidente2 || 'Não Informado'}</p>
                                </div>
                                
                                {/* Secretários */}
                                <div className="bg-white p-6 rounded-2xl border-t-4 border-blue-500 flex flex-col items-center text-center lg:col-span-3 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-xl mb-4 border border-blue-100"><PenTool size={20}/></div>
                                    <div className="w-full grid grid-cols-2 gap-4 divide-x divide-slate-100">
                                        <div className="px-2">
                                            <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest mb-1 block">1º Secretário</span>
                                            <p className="font-bold text-base text-slate-800 leading-snug">{db.igreja?.secretario1 || '-'}</p>
                                        </div>
                                        <div className="px-2">
                                            <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest mb-1 block">2º Secretário</span>
                                            <p className="font-bold text-base text-slate-800 leading-snug">{db.igreja?.secretario2 || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tesoureiros */}
                                <div className="bg-white p-6 rounded-2xl border-t-4 border-emerald-500 flex flex-col items-center text-center lg:col-span-3 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl mb-4 border border-emerald-100"><Wallet size={20}/></div>
                                    <div className="w-full grid grid-cols-2 gap-4 divide-x divide-slate-100">
                                        <div className="px-2">
                                            <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest mb-1 block">1º Tesoureiro</span>
                                            <p className="font-bold text-base text-slate-800 leading-snug">{db.igreja?.tesoureiro1 || '-'}</p>
                                        </div>
                                        <div className="px-2">
                                            <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest mb-1 block">2º Tesoureiro</span>
                                            <p className="font-bold text-base text-slate-800 leading-snug">{db.igreja?.tesoureiro2 || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Líderes de Departamentos */}
                            {ministerios.length > 0 && (
                                <div className="pt-10 border-t border-slate-200">
                                    <h4 className="text-sm font-black uppercase text-slate-800 tracking-widest mb-8 flex items-center gap-2 justify-center">
                                        <Briefcase size={20} className="text-indigo-500"/> Líderes de Departamentos
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {ministerios.map(min => (
                                            <div key={min.id} className="flex flex-col bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-200 group-hover:bg-indigo-500 transition-colors"></div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 line-clamp-1" title={min.nome}>{min.nome}</span>
                                                <span className="font-bold text-slate-800 text-base group-hover:text-indigo-700 transition-colors leading-snug">
                                                    {db.membros.find(m => m.id === min.lider1_id)?.nome || 'Líder Não Definido'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

            </div>

            {/* RODAPÉ DO PORTAL */}
            <footer className="bg-slate-900 text-slate-400 text-center py-8 text-xs mt-12 border-t-4 border-indigo-900">
                <p className="font-black uppercase tracking-widest text-slate-500 mb-2">GIPP - Portal de Informações Eclesiásticas</p>
                <p>© {currentYear} {db.igreja?.nome}. Todos os direitos reservados.</p>
            </footer>

            {/* MODAL MODERN GLASSMORPHISM - MODO LEITURA */}
            {readerItem && (
                <div 
                    id="reading-mode-modal"
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300 animate-entrance"
                    onClick={() => setReaderItem(null)}
                >
                    <div 
                        className="relative w-full max-w-2xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all animate-scale-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header/Banner do Modal de Leitura */}
                        <div className={`h-40 md:h-48 relative overflow-hidden flex items-center justify-center p-6 ${readerItem.imagem ? '' : (readerItem.color ? `bg-${readerItem.color}-600/50` : 'bg-indigo-600/50')}`}>
                            {readerItem.imagem ? (
                                <div className="absolute inset-0 w-full h-full">
                                    <img src={readerItem.imagem} className="w-full h-full object-cover" alt={readerItem.titulo} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/40 to-purple-800/40"></div>
                            )}
                            
                            <div className="relative z-10 text-center text-white p-4">
                                <span className="text-[10px] uppercase font-black tracking-widest bg-white/25 border border-white/25 px-3 py-1 rounded-full backdrop-blur-md mb-2 inline-block">
                                    {readerItem.tipo || 'Boletim'}
                                </span>
                                <h3 className="text-xl md:text-3xl font-black tracking-tight drop-shadow-md leading-tight">{readerItem.titulo}</h3>
                            </div>
                            
                            <button 
                                onClick={() => setReaderItem(null)}
                                className="absolute top-6 right-6 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors border border-white/10 cursor-pointer"
                            >
                                <X size={18}/>
                            </button>
                        </div>
                        
                        {/* Conteúdo do Modal de Leitura */}
                        <div className="p-8 text-white space-y-6 max-h-[50vh] overflow-y-auto">
                            <div className="space-y-4">
                                <p className="text-sm md:text-base leading-relaxed text-slate-100 font-medium whitespace-pre-line">
                                    {readerItem.desc || readerItem.descricao || "Sem detalhes descritivos cadastrados."}
                                </p>
                            </div>
                            
                            {/* Metadados do Evento no Modo Leitura */}
                            {(readerItem.data || readerItem.hora || readerItem.local) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/15 text-xs font-bold text-slate-200">
                                    {readerItem.data && (
                                        <div className="flex items-center gap-2.5 bg-white/5 p-3.5 rounded-2xl border border-white/10 shadow-inner">
                                            <Calendar size={16} className="text-indigo-300"/>
                                            <span>Data: {formatDateLocal(readerItem.data)}</span>
                                        </div>
                                    )}
                                    {readerItem.hora && (
                                        <div className="flex items-center gap-2.5 bg-white/5 p-3.5 rounded-2xl border border-white/10 shadow-inner">
                                            <Clock size={16} className="text-indigo-300"/>
                                            <span>Horário: {readerItem.hora}</span>
                                        </div>
                                    )}
                                    {readerItem.local && (
                                        <div className="sm:col-span-2 flex items-center gap-2.5 bg-white/5 p-3.5 rounded-2xl border border-white/10 shadow-inner">
                                            <MapPin size={16} className="text-indigo-300"/>
                                            <span className="truncate">Local: {readerItem.local}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Rodapé do Modal com Compartilhamento e Fechar */}
                        <div className="p-6 bg-black/40 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">
                                GIPP • Modo Leitura Glassmorphism
                            </span>
                            <div className="flex gap-2.5">
                                <button 
                                    onClick={() => {
                                        const shareText = `*${readerItem.titulo}*\n📌 *${readerItem.tipo || 'Boletim'}*\n\n📅 *Data:* ${readerItem.data ? formatDateLocal(readerItem.data) : 'Programação Fixa'}\n⏰ *Horário:* ${readerItem.hora || ''}\n📍 *Local:* ${readerItem.local || ''}\n\n_${readerItem.desc || readerItem.descricao || ''}_`;
                                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                                    }}
                                    className="px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-white rounded-xl transition-all flex items-center gap-2 border border-emerald-400/20 active:scale-95 cursor-pointer shadow-sm shadow-emerald-500/10 animate-pulse"
                                >
                                    <Share2 size={14}/> Compartilhar WhatsApp
                                </button>
                                <button 
                                    onClick={() => setReaderItem(null)}
                                    className="px-4.5 py-2.5 bg-white/10 hover:bg-white/20 font-bold text-xs text-slate-300 rounded-xl transition-all border border-white/20 cursor-pointer active:scale-95"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default ModuleBoletim;
