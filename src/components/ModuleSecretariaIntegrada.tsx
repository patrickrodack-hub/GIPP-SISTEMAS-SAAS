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
const ModuleSecretariaIntegrada = () => {
    const { db, collection, dbFirestore, appId, addToast, setPrintMode, setPrintData, setPreviewOpen, setDoc, doc, logAction, deleteItem, openModal, addDoc, deleteDoc } = useContext(ChurchContext);
    const [tab, setTab] = useState('agenda');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [msgTemplate, setMsgTemplate] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);
    const [viewMode, setViewMode] = useState('kanban'); // NOVO: Controle de visualização (Lista ou Kanban)
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas'); // NOVO: Filtro de Congregação

    // Form States for Liturgia e Série de Sermões (Mapeamento Litúrgico)
    const [liturgiaForm, setLiturgiaForm] = useState({
        data: new Date().toISOString().split('T')[0],
        hora: '',
        titulo: '',
        serie: '',
        dirigente: '',
        pregador: '',
        louvor: '',
        leitura_biblica: '',
        esboco_pregao: ''
    });
    const [editingLiturgiaId, setEditingLiturgiaId] = useState(null);
    const [showLiturgiaModal, setShowLiturgiaModal] = useState(false);
    const [showLiturgiaPreview, setShowLiturgiaPreview] = useState(null);

    const myLiturgias = db.pastor_liturgias || [];

    const handleSaveLiturgia = async (e) => {
        e.preventDefault();
        try {
            const dataObj = {
                ...liturgiaForm,
                updated_at: new Date().toISOString()
            };

            if (editingLiturgiaId) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'pastor_liturgias', editingLiturgiaId), dataObj, { merge: true });
                logAction('EDIÇÃO', `Secretaria atualizou liturgia do culto "${liturgiaForm.titulo}"`, 'pastor_liturgias', editingLiturgiaId);
                addToast("Planeamento litúrgico atualizado!", "success");
            } else {
                const docRef = await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'pastor_liturgias'), {
                    ...dataObj,
                    created_at: new Date().toISOString()
                });
                logAction('CADASTRO', `Secretaria planeou liturgia do culto "${liturgiaForm.titulo}"`, 'pastor_liturgias', docRef.id);
                addToast("Planeamento litúrgico criado com sucesso!", "success");
            }
            setShowLiturgiaModal(false);
            setLiturgiaForm({
                data: new Date().toISOString().split('T')[0],
                hora: '',
                titulo: '',
                serie: '',
                dirigente: '',
                pregador: '',
                louvor: '',
                leitura_biblica: '',
                esboco_pregao: ''
            });
            setEditingLiturgiaId(null);
        } catch (error) {
            console.error(error);
            addToast("Erro ao gravar planeamento litúrgico.", "error");
        }
    };

    const handleEditLiturgia = (item) => {
        setLiturgiaForm({
            data: item.data || '',
            hora: item.hora || '',
            titulo: item.titulo || '',
            serie: item.serie || '',
            dirigente: item.dirigente || '',
            pregador: item.pregador || '',
            louvor: item.louvor || '',
            leitura_biblica: item.leitura_biblica || '',
            esboco_pregao: item.esboco_pregao || ''
        });
        setEditingLiturgiaId(item.id);
        setShowLiturgiaModal(true);
    };

    const handleDeleteLiturgia = async (id, title) => {
        if (window.confirm(`Tem a certeza que deseja remover o planeamento litúrgico do culto "${title}"?`)) {
            try {
                await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'pastor_liturgias', id));
                logAction('EXCLUSÃO', `Secretaria removeu liturgia do culto "${title}"`, 'pastor_liturgias', id);
                addToast("Planeamento litúrgico removido.", "info");
            } catch (error) {
                console.error(error);
                addToast("Erro ao remover liturgia.", "error");
            }
        }
    };

    // NOVO: Filtragem em tempo real de agendas e tarefas
    const agendaFiltrada = (db.agenda || []).filter(a => congregacaoFilter === 'todas' || a.congregacao_id === congregacaoFilter || (!a.congregacao_id && congregacaoFilter === 'sede'));
    const tarefasFiltradas = (db.tarefas || []).filter(t => congregacaoFilter === 'todas' || t.congregacao_id === congregacaoFilter || (!t.congregacao_id && congregacaoFilter === 'sede'));

    // --- DRAG AND DROP HANDLERS (KANBAN) ---
    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Necessário para permitir soltar o elemento
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (!taskId) return;

        const task = db.tarefas.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            try {
                // Atualiza o status no banco de dados automaticamente
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'tarefas', taskId), { status: newStatus }, { merge: true });
                logAction('EDIÇÃO', `Moveu tarefa "${task.descricao}" para o quadro: ${newStatus}`, 'tarefas', taskId);
                addToast("Status da tarefa atualizado!", "success");
            } catch (err) {
                console.error(err);
                addToast("Erro ao mover a tarefa.", "error");
            }
        }
    };

    const seedAgendaAD = async () => {
        try {
            const padraoAD = [
                { titulo: 'Culto de Doutrina', dia_semana: 2, hora: '19:00', tipo: 'Culto' },
                { titulo: 'Círculo de Oração', dia_semana: 4, hora: '08:00', tipo: 'Reunião' },
                { titulo: 'Culto de Libertação', dia_semana: 5, hora: '19:30', tipo: 'Culto' },
                { titulo: 'Escola Bíblica Dominical', dia_semana: 0, hora: '09:00', tipo: 'Ensino' },
                { titulo: 'Culto da Família', dia_semana: 0, hora: '18:00', tipo: 'Culto' }
            ];
            const hoje = new Date();
            import('firebase/firestore').then(async ({ writeBatch }) => {
                const batch = writeBatch(dbFirestore);
                for(let i=0; i<30; i++) {
                    const dataAtual = new Date(); dataAtual.setDate(hoje.getDate() + i);
                    const eventosDia = padraoAD.filter(p => p.dia_semana === dataAtual.getDay());
                    eventosDia.forEach(evt => {
                         const ref = doc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'agenda'));
                         batch.set(ref, { titulo: evt.titulo, data: dataAtual.toISOString().split('T')[0], hora: evt.hora, local: 'Templo Sede', tipo: evt.tipo, created_at: new Date().toISOString() });
                    });
                }
                await batch.commit();
            });
            addToast("Agenda Padrão AD gerada com sucesso!", "success");
        } catch(e) { console.error(e); addToast("Erro ao gerar agenda.", "error"); }
    };

    const templates = [
        { label: "Aniversariante", text: "🎉 Parabéns {nome}! A Paz do Senhor. Desejamos muitas bênçãos neste dia especial! Salmos 91:16. 🎂" },
        { label: "Faltoso EBD", text: "Olá {nome}, sentimos sua falta na EBD hoje! Esperamos você na próxima aula. 🙏" },
        { label: "Escala de Obreiro", text: "A Paz do Senhor, {nome}. Lembrando de sua escala para o próximo culto. Deus abençoe seu ministério! 🛡️" },
        { label: "Convite Santa Ceia", text: "{nome}, Domingo é dia de Santa Ceia! Venha cear conosco. 🍞🍷" }
    ];

    const handleSendWhatsApp = (item) => {
        const text = encodeURIComponent(`📢 *AVISO ECLESIÁSTICO*\n\nEvento: *${item.titulo}*\nData: ${formatDateLocal(item.data)}\nHora: ${item.hora}\nLocal: ${item.local || 'Templo Sede'}\n\nEsperamos por você! 🙏`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const handlePrintEvent = (item) => {
        setPrintData({ ...item, igreja: db.igreja });
        setPrintMode('rel_evento_unico');
        setPreviewOpen(true);
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex flex-wrap justify-between items-center gap-4 bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100"><ClipboardList size={28}/></div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Secretaria Digital</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Gestão de Agenda, Tarefas e CRM</p>
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
            
            <div className="flex justify-start bg-white/50 p-1.5 rounded-xl w-fit">
                <button onClick={()=>setTab('agenda')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab==='agenda'?'bg-indigo-600 text-white shadow':'text-slate-500 hover:bg-white'}`}>Agenda</button>
                <button onClick={()=>setTab('tarefas')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab==='tarefas'?'bg-indigo-600 text-white shadow':'text-slate-500 hover:bg-white'}`}>Tarefas & Kanban</button>
                <button onClick={()=>setTab('whatsapp')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab==='whatsapp'?'bg-indigo-600 text-white shadow':'text-slate-500 hover:bg-white'}`}>Mensagens & Templates</button>
                <button onClick={()=>setTab('liturgia')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab==='liturgia'?'bg-indigo-600 text-white shadow':'text-slate-500 hover:bg-white'}`}>Roteiros & Liturgias</button>
            </div>
            
            <div className="flex-1 overflow-hidden">
                {tab === 'agenda' && (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-end mb-4"><Button onClick={seedAgendaAD} variant="secondary" className="text-xs"><Calendar size={16}/> Gerar Calendário Padrão AD</Button></div>
                        <GenericTable title="Agenda da Igreja" type="agenda" data={agendaFiltrada} columns={[{header:'Evento', key:'titulo'}, {header:'Data', key:'data', render: d=>formatDateLocal(d.data)}, {header:'Hora', key:'hora'}, {header:'Local', key:'local'}]} customActions={(item) => (
                            <div className="flex gap-2">
                                <button onClick={() => handlePrintEvent(item)} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-slate-200 bg-white" title="Imprimir"><Printer size={18}/></button>
                                <button onClick={() => handleSendWhatsApp(item)} className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all shadow-sm border border-emerald-100 bg-white" title="Enviar via WhatsApp"><MessageCircle size={18}/></button>
                            </div>
                        )} />
                    </div>
                )}
                {tab === 'tarefas' && (
                    <div className="h-full flex flex-col">
                        <div className="flex flex-wrap gap-4 justify-between items-center mb-4 bg-white/40 p-3 rounded-2xl border border-white/50">
                            <h3 className="text-lg font-black text-slate-700 flex items-center gap-2">
                                <CheckSquare size={20} className="text-indigo-600"/> Gestão Ágil de Tarefas
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                                    <button onClick={() => setViewMode('lista')} className={`p-2 rounded-lg transition-all ${viewMode === 'lista' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Modo Lista (Tabela)"><List size={16}/></button>
                                    <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Modo Kanban (Quadro Trello)"><LayoutTemplate size={16}/></button>
                                </div>
                                <Button onClick={() => openModal('tarefa')} variant="primary" className="py-2 px-4 text-xs shadow-md"><Plus size={16}/> Nova Tarefa</Button>
                            </div>
                        </div>

                        {viewMode === 'lista' ? (
                             <GenericTable title="" type="tarefa" data={tarefasFiltradas} columns={[{header:'Descrição', key:'descricao'}, {header:'Tipo', key:'categoria', render: c => <span className="text-[10px] uppercase font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{c.categoria}</span>}, {header:'Equipe', key:'equipe', render: t => (<div className="flex -space-x-2">{(t.equipe || []).slice(0, 4).map((m, i) => (<div key={i} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600" title={`${m.nome} - ${m.funcao_escala}`}>{m.nome ? m.nome.charAt(0) : '?'}</div>))}{(t.equipe || []).length > 4 && <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500">+{t.equipe.length-4}</div>}{(!t.equipe || t.equipe.length === 0) && <span className="text-xs text-slate-400">-</span>}</div>)}, {header:'Data', key:'data', render:d=>formatDateLocal(d.data)}, {header:'Status', key:'status'}]} customActions={(item) => (
                                <div className="flex gap-2">
                                     <button onClick={() => handlePrintEvent(item)} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-slate-200 bg-white" title="Imprimir"><Printer size={18}/></button>
                                     <button onClick={() => {
                                         const equipeText = (item.equipe || []).map(m => ` - ${m.nome} (${m.funcao_escala})`).join('\n');
                                         const text = encodeURIComponent(`📋 *ESCALA DE TRABALHO*\n\nMissão: *${item.descricao}*\nData: ${formatDateLocal(item.data)}\n\n*EQUIPE:*\n${equipeText}\n\nDeus conte com você! 💪`);
                                         window.open(`https://wa.me/?text=${text}`, '_blank');
                                     }} className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all shadow-sm border border-emerald-100 bg-white" title="Enviar via WhatsApp"><MessageCircle size={18}/></button>
                                </div>
                             )} />
                        ) : (
                            <div className="flex-1 flex gap-6 overflow-x-auto custom-scrollbar pb-2 pt-2 items-start h-[calc(100vh-250px)]">
                                {[
                                    { id: 'Pendente', label: 'Pendente', color: 'amber', icon: Clock },
                                    { id: 'Em Andamento', label: 'Em Andamento', color: 'blue', icon: Activity },
                                    { id: 'Concluido', label: 'Concluído', color: 'emerald', icon: CheckCircle }
                                ].map(col => (
                                    <div 
                                        key={col.id} 
                                        className={`w-[340px] shrink-0 h-full flex flex-col bg-${col.color}-50/60 rounded-[2rem] border border-${col.color}-200/60 shadow-inner`}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, col.id)}
                                    >
                                        <div className={`p-5 border-b border-${col.color}-200/60 flex justify-between items-center bg-${col.color}-100/50 rounded-t-[2rem]`}>
                                            <h4 className={`font-black text-${col.color}-800 flex items-center gap-2 tracking-tight text-sm uppercase`}><col.icon size={18} className={`text-${col.color}-600`}/> {col.label}</h4>
                                            <span className={`bg-${col.color}-200 text-${col.color}-800 text-xs font-black px-3 py-1 rounded-full shadow-sm`}>
                                                {tarefasFiltradas.filter(t => t.status === col.id).length}
                                            </span>
                                        </div>
                                        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                                            {tarefasFiltradas.filter(t => t.status === col.id).map(task => (
                                                <div 
                                                    key={task.id} 
                                                    draggable 
                                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                                    className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-lg hover:-translate-y-1 hover:border-${col.color}-400 transition-all duration-300 group relative overflow-hidden`}
                                                >
                                                    <div className={`absolute top-0 left-0 w-1.5 h-full bg-${col.color}-400`}></div>
                                                    <div className="flex justify-between items-start mb-3 pl-2">
                                                        <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded bg-slate-100 text-slate-500 tracking-wider shadow-sm`}>{task.categoria}</span>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openModal('tarefa', task)} className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors"><Edit size={16}/></button>
                                                            <button onClick={() => deleteItem('tarefa', task.id)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                                        </div>
                                                    </div>
                                                    <h5 className="font-bold text-slate-800 text-sm mb-5 pl-2 leading-snug">{task.descricao}</h5>
                                                    <div className="flex justify-between items-end pl-2">
                                                        <div className="flex -space-x-2">
                                                            {(task.equipe || []).slice(0, 3).map((m, i) => (
                                                                <div key={i} className={`w-8 h-8 rounded-full bg-${col.color}-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-${col.color}-700 shadow-sm`} title={`${m.nome} - ${m.funcao_escala}`}>{m.nome ? m.nome.charAt(0) : '?'}</div>
                                                            ))}
                                                            {(task.equipe || []).length > 3 && <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">+{task.equipe.length-3}</div>}
                                                            {(!task.equipe || task.equipe.length === 0) && <span className="text-[10px] text-slate-400 font-medium italic">Sem equipe</span>}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {task.data && <span className={`text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded-lg border ${new Date(task.data) < new Date() && task.status !== 'Concluido' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}><Calendar size={12}/> {formatDateLocal(task.data)}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {tarefasFiltradas.filter(t => t.status === col.id).length === 0 && (
                                                <div className="h-28 border-2 border-dashed border-slate-300/60 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                                                    <Move size={20} className="opacity-50"/>
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Solte aqui</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {tab === 'whatsapp' && (
                    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                         <div className="lg:col-span-2 h-full flex flex-col"><GenericTable title="Selecione os Membros" type="membro" data={db.membros} columns={[{header:'Nome', key:'nome'}, {header:'Telefone', key:'telefone'}]} onSelectionChange={setSelectedMembers} customActions={null} /></div>
                         <div className="glass-modern p-6 rounded-[2.5rem] flex flex-col h-full overflow-y-auto">
                             <div className="mb-6">
                                 <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-4"><MessageCircle size={20} className="text-emerald-500"/> Templates Animados</h3>
                                 <div className="grid grid-cols-1 gap-2">
                                     {templates.map((t, i) => (<button key={i} onClick={()=>setMsgTemplate(t.text)} className="text-left p-3 rounded-xl border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-xs font-medium text-slate-600"><span className="block font-bold text-slate-800 mb-1">{t.label}</span><span className="line-clamp-2 opacity-70">{t.text}</span></button>))}
                                 </div>
                             </div>
                             <div className="flex-1 flex flex-col">
                                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mensagem Final</label>
                                 <textarea className="flex-1 w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none mb-2 uppercase" value={msgTemplate} onChange={e => setMsgTemplate(((e.target.value || "").toUpperCase() || "").toUpperCase())} placeholder="Digite sua mensagem aqui... Use {nome} para personalizar."></textarea>
                                 <div className="flex gap-2 mb-4">
                                     <Button 
                                         onClick={async () => {
                                             if (!msgTemplate) return addToast("Digite uma mensagem primeiro.", "warning");
                                             setLoadingAi(true); addToast("✨ A processar com IA...", "info");
                                             const result = await callGeminiAI(`Melhore a seguinte mensagem de WhatsApp de uma igreja. Estilo: Acolhedor e Animado. Mantenha a variável {nome}. Remova aspas do início e fim. Mensagem original: "${msgTemplate}"`);
                                             setMsgTemplate(result.replace(/^"|"$/g, '').trim());
                                             setLoadingAi(false); addToast("✨ Mensagem aprimorada!", "success");
                                         }} 
                                         disabled={loadingAi} variant="ghost" className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 py-2">
                                         {loadingAi ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>} ✨ Mais Animado
                                     </Button>
                                     <Button 
                                         onClick={async () => {
                                             if (!msgTemplate) return addToast("Digite uma mensagem primeiro.", "warning");
                                             setLoadingAi(true); addToast("✨ A processar com IA...", "info");
                                             const result = await callGeminiAI(`Melhore a seguinte mensagem de WhatsApp de uma igreja. Estilo: Formal e Respeitoso. Mantenha a variável {nome}. Remova aspas do início e fim. Mensagem original: "${msgTemplate}"`);
                                             setMsgTemplate(result.replace(/^"|"$/g, '').trim());
                                             setLoadingAi(false); addToast("✨ Mensagem aprimorada!", "success");
                                         }} 
                                         disabled={loadingAi} variant="ghost" className="text-xs bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 py-2">
                                         {loadingAi ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>} ✨ Mais Formal
                                     </Button>
                                 </div>
                                 <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200"><p className="text-xs text-slate-500 font-bold mb-1">{selectedMembers.length} membros selecionados</p><p className="text-[10px] text-slate-400">O sistema irá gerar links individuais.</p></div>
                                 <Button onClick={() => { if(selectedMembers.length === 0) return alert("Selecione pelo menos um membro."); selectedMembers.forEach(id => { const m = db.membros.find(x => x.id === id); if (m && m.telefone) { const text = encodeURIComponent(msgTemplate.replace('{nome}', m.nome.split(' ')[0])); const num = m.telefone.replace(/\D/g, ''); window.open(`https://wa.me/55${num}?text=${text}`, '_blank'); } }); }} variant="success" className="w-full shadow-emerald-500/20"><Send size={18}/> Enviar Mensagens</Button>
                             </div>
                         </div>
                    </div>
                )}

                {tab === 'liturgia' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-entrance">
                            <div>
                                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                    <BookOpen size={20} className="text-indigo-600" /> Roteiro Litúrgico e Série de Sermões
                                </h3>
                                <p className="text-xs text-slate-400 font-medium font-sans">Faça o mapeamento completo dos cânticos, leituras e pregações por culto.</p>
                            </div>
                            <button onClick={() => { setEditingLiturgiaId(null); setLiturgiaForm({ data: new Date().toISOString().split('T')[0], hora: '', titulo: '', serie: '', dirigente: '', pregador: '', louvor: '', leitura_biblica: '', esboco_pregao: '' }); setShowLiturgiaModal(true); }} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-500/10">
                                <Plus size={16}/> Criar Culto & Roteiro
                            </button>
                        </div>

                        <div className="grid gap-4 overflow-y-auto max-h-[calc(100vh-320px)] pr-2">
                            {myLiturgias.length > 0 ? (
                                [...myLiturgias].sort((a,b) => new Date(a.data + 'T' + (a.hora || '00:00')).getTime() - new Date(b.data + 'T' + (b.hora || '00:00')).getTime()).map((item, index) => {
                                    const isPast = new Date(item.data) < new Date(new Date().toISOString().split('T')[0]);
                                    return (
                                        <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 hover:border-indigo-400 transition-all group animate-entrance">
                                            <div className="flex items-start gap-5 flex-1 min-w-0 font-sans text-left">
                                                <div className={`p-4 rounded-2xl text-center min-w-[70px] ${isPast ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 font-black'}`}>
                                                    <div className="text-xl font-bold font-sans">{item.data ? item.data.split('-')[2] : '??'}</div>
                                                    <div className="text-[10px] uppercase font-bold">{item.data ? new Date(item.data + 'T00:00:00').toLocaleString('pt-BR', {month: 'short'}) : 'MÊS'}</div>
                                                </div>
                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {item.serie && (
                                                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                                                                Série: {item.serie}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-slate-400 font-bold flex items-center gap-1"><Clock size={12}/> {item.hora || "Sem Horário"}</span>
                                                        {item.dirigente && <span className="text-xs text-slate-400 font-bold">Dirigente: {item.dirigente}</span>}
                                                        {item.pregador && <span className="text-xs text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-md">Pregador: {item.pregador}</span>}
                                                    </div>
                                                    <h4 className="font-extrabold text-slate-800 text-base">{item.titulo}</h4>
                                                    {item.leitura_biblica && (
                                                        <p className="text-xs text-slate-500 font-semibold line-clamp-1"><strong className="text-slate-600 uppercase">Texto Base:</strong> {item.leitura_biblica}</p>
                                                    )}
                                                    {item.louvor && (
                                                        <p className="text-xs text-slate-400 font-medium line-clamp-1 truncate"><strong className="text-slate-500 uppercase">Música:</strong> {item.louvor.split('\n').join(' • ')}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 self-end xl:self-center shrink-0">
                                                <button onClick={() => setShowLiturgiaPreview(item)} className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors border border-indigo-100 flex items-center gap-1.5 text-xs font-bold font-sans" title="Visualizar Guia Litúrgico Completo">
                                                    <Eye size={14}/> Visualizar
                                                </button>
                                                <button onClick={() => handleEditLiturgia(item)} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-slate-100"><Edit size={16}/></button>
                                                <button onClick={() => handleDeleteLiturgia(item.id, item.titulo)} className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 transition-colors border border-rose-100"><Trash2 size={16}/></button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-white p-12 text-center rounded-[2rem] border border-dashed border-slate-200">
                                    <BookOpen className="mx-auto text-slate-300 mb-4 animate-pulse" size={48}/>
                                    <h4 className="font-bold text-slate-600">Nenhum roteiro litúrgico ou culto planejado</h4>
                                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-sans">Crie agora mesmo um novo compromisso de culto associando cânticos, esboços e séries de sermões para toda a comunidade.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showLiturgiaModal && (
                <div className="fixed inset-0 bg-slate-900/40 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20 p-8 space-y-6 my-8 animate-entrance text-left font-sans">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800">{editingLiturgiaId ? 'Editar Roteiro Litúrgico' : 'Criar Novo Roteiro Litúrgico'}</h3>
                            <button onClick={()=>setShowLiturgiaModal(false)} className="p-1 px-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><X size={18}/></button>
                        </div>
                        <form onSubmit={handleSaveLiturgia} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1">Data do Culto</label>
                                    <input type="date" value={liturgiaForm.data} onChange={e=>setLiturgiaForm({...liturgiaForm, data: e.target.value})} required className="w-full h-11 px-4 text-xs font-bold rounded-xl border border-slate-200 outline-none bg-white focus:border-indigo-500 transition-all text-slate-700 font-sans" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-2 mb-1">Hora</label>
                                    <input type="time" value={liturgiaForm.hora} onChange={e=>setLiturgiaForm({...liturgiaForm, hora: e.target.value})} required className="w-full h-11 px-4 text-xs font-bold rounded-xl border border-slate-200 outline-none bg-white focus:border-indigo-500 transition-all text-slate-700 font-sans" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1">Tema / Título do Culto</label>
                                    <input type="text" value={liturgiaForm.titulo} onChange={e=>setLiturgiaForm({...liturgiaForm, titulo: e.target.value.toUpperCase()})} required placeholder="Ex: CULTO DE ADORAÇÃO E CELEBRAÇÃO" className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-xs font-bold bg-white focus:border-indigo-500 transition-all text-slate-700 uppercase font-sans" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-2 mb-1">Série de Sermões (Opcional)</label>
                                    <input type="text" value={liturgiaForm.serie} onChange={e=>setLiturgiaForm({...liturgiaForm, serie: e.target.value.toUpperCase()})} placeholder="Ex: FAMÍLIAS INABALÁVEIS" className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-xs font-bold bg-white focus:border-indigo-500 transition-all text-slate-700 uppercase font-sans" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1">Dirigente da Liturgia</label>
                                    <input type="text" value={liturgiaForm.dirigente} onChange={e=>setLiturgiaForm({...liturgiaForm, dirigente: e.target.value.toUpperCase()})} placeholder="Ex: COOP. FRANCISCO SOUZA" className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-xs font-bold bg-white focus:border-indigo-500 transition-all text-slate-700 uppercase font-sans" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-2 mb-1">Pregador (Ministro da Palavra)</label>
                                    <input type="text" value={liturgiaForm.pregador} onChange={e=>setLiturgiaForm({...liturgiaForm, pregador: e.target.value.toUpperCase()})} placeholder="Ex: PR. JOÃO SILVA" className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-xs font-bold bg-white focus:border-indigo-500 transition-all text-slate-700 uppercase font-sans" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1">Texto Bíblico Oficial (Atos / Passagem)</label>
                                <input type="text" value={liturgiaForm.leitura_biblica} onChange={e=>setLiturgiaForm({...liturgiaForm, leitura_biblica: e.target.value.toUpperCase()})} placeholder="Ex: SALMOS 122:1-9 ou JOÃO 3:16" className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none text-xs font-bold bg-white focus:border-indigo-500 transition-all text-slate-700 uppercase font-sans" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1">Playlist de Cânticos (Louvores / Linha por Linha)</label>
                                <textarea value={liturgiaForm.louvor} onChange={e=>setLiturgiaForm({...liturgiaForm, louvor: e.target.value.toUpperCase()})} placeholder="Ex:&#10;1. ATRAÍDO PELO AMOR - HARPA CRISTÃ&#10;2. GRANDE É O SENHOR - REBANHO&#10;3. VENCENDO VEM JESUS" rows={3} className="w-full p-4 rounded-xl border border-slate-200 outline-none text-xs font-bold bg-white focus:border-indigo-500 transition-all text-slate-700 resize-none uppercase font-sans" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1">Declaração / Esboço ou Pontos Críticos do Sermão (Aparece ao Membro)</label>
                                <textarea value={liturgiaForm.esboco_pregao} onChange={e=>setLiturgiaForm({...liturgiaForm, esboco_pregao: e.target.value})} placeholder="Pequena síntese ou divisões homiléticas (ex: I. Introdução, II. Desenvolvimento, III. Conclusão) para que os membros possam acompanhar a mensagem e tomar notas..." rows={4} className="w-full p-4 rounded-xl border border-slate-200 outline-none text-xs font-bold bg-white focus:border-indigo-500 transition-all text-slate-700 resize-none font-sans" />
                            </div>
                            <div className="flex gap-4 pt-4 font-sans">
                                <button type="button" onClick={()=>setShowLiturgiaModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20">Salvar Roteiro Litúrgico</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showLiturgiaPreview && (
                <div className="fixed inset-0 bg-slate-900/40 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20 p-8 space-y-6 my-8 animate-entrance relative text-left font-sans">
                        <button onClick={()=>setShowLiturgiaPreview(null)} className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors z-20"><X size={18}/></button>
                        
                        <div id="print-liturgia-area" className="p-4 space-y-6 bg-slate-50 rounded-3xl border border-slate-100 font-sans text-slate-800 text-left">
                            <div className="text-center pb-6 border-b border-slate-200/60">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC500] px-3 py-1 bg-slate-900 rounded-full inline-block mb-3">Guia Litúrgico GIPP</span>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase font-sans">{showLiturgiaPreview.titulo}</h2>
                                <p className="text-xs font-bold text-slate-500 mt-1 uppercase flex items-center justify-center gap-1.5 font-sans">
                                    <Calendar size={14} className="text-indigo-600"/> {showLiturgiaPreview.data ? new Date(showLiturgiaPreview.data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                                    {showLiturgiaPreview.hora && <span> • {showLiturgiaPreview.hora}</span>}
                                </p>
                            </div>

                            {showLiturgiaPreview.serie && (
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center font-sans">
                                    <span className="text-[9px] font-black uppercase text-amber-600 tracking-widest block mb-1">Série de Mensagens Ativa</span>
                                    <h3 className="text-lg font-black text-amber-900 leading-tight flex items-center justify-center gap-2 font-sans">
                                        <Award size={18}/> {showLiturgiaPreview.serie}
                                    </h3>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6 font-sans">
                                <div className="space-y-4 font-sans text-left">
                                    <div className="p-4 bg-white rounded-2xl border border-slate-150 shadow-sm space-y-1.5 font-sans">
                                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block font-sans">Direção Litúrgica</span>
                                        <p className="text-xs font-bold text-slate-800 uppercase font-sans">{showLiturgiaPreview.dirigente || "Não Informado"}</p>
                                    </div>
                                    <div className="p-4 bg-white rounded-2xl border border-slate-150 shadow-sm space-y-1.5 font-sans">
                                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block font-sans">Ministro da Palavra</span>
                                        <p className="text-xs font-bold text-slate-800 uppercase font-sans">{showLiturgiaPreview.pregador || "Não Informado"}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-white rounded-2xl border border-slate-150 shadow-sm space-y-2 font-sans text-left">
                                    <span className="text-[9px] font-black text-[#FFC500] bg-slate-900 px-2 py-0.5 rounded uppercase tracking-widest inline-block font-sans">Leitura Bíblica Oficial</span>
                                    <p className="text-sm font-extrabold text-slate-800 leading-tight uppercase flex items-center gap-1.5 font-sans">
                                        <Book size={16} className="text-[#FFC500]" /> {showLiturgiaPreview.leitura_biblica || "Salmos 122"}
                                    </p>
                                    <p className="text-[11px] text-slate-400 font-medium font-sans">Recomendamos que todos acompanhem a leitura oficial com a Bíblia impressa ou digital aberta.</p>
                                </div>
                            </div>

                            {showLiturgiaPreview.louvor && (
                                <div className="p-5 bg-white rounded-2xl border border-slate-150 shadow-sm space-y-3 font-sans text-left">
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block font-sans">Playlist de Cânticos (Louvores Oficial)</span>
                                    <div className="grid gap-2">
                                        {showLiturgiaPreview.louvor.split('\n').filter(Boolean).map((song, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-sans">
                                                <Music size={14} className="text-slate-400 shrink-0"/>
                                                <span className="uppercase font-sans">{song}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showLiturgiaPreview.esboco_pregao && (
                                <div className="p-5 bg-white rounded-2xl border border-slate-150 shadow-sm space-y-3 font-sans text-left">
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block font-sans">Notas de Estudo e Esboço do Sermão</span>
                                    <div className="text-xs text-slate-600 leading-relaxed font-semibold whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-56 overflow-y-auto font-sans text-left">
                                        {showLiturgiaPreview.esboco_pregao}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-100 font-sans text-left">
                            <button onClick={()=>setShowLiturgiaPreview(null)} className="flex-1 py-3 bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all">Fechar Guia</button>
                            <button onClick={()=>{ window.print(); }} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg hover:shadow-indigo-600/20 flex items-center justify-center gap-1.5 opacity-90 font-sans">
                                <Printer size={16}/> Imprimir Guia Litúrgico
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default ModuleSecretariaIntegrada;
