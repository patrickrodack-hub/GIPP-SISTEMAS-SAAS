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
const ModuleEBD = () => {
    const { db, openModal, addToast, deleteItem } = useContext(ChurchContext);
    const [tab, setTab] = useState(1);
    const [aiLesson, setAiLesson] = useState(null);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 7));
    const [congregacaoFilter, setCongregacaoFilter] = useState('todas');

    const turmasFiltradas = (db.ebd?.turmas || []).filter(t => congregacaoFilter === 'todas' || t.congregacao_id === congregacaoFilter || (!t.congregacao_id && congregacaoFilter === 'sede'));
    
    // Os alunos e lições são baseados nas turmas filtradas
    const alunosFiltrados = (db.ebd?.alunos || []).filter(a => turmasFiltradas.some(t => t.id === a.turma_id));
    const licoesFiltradasTotal = (db.ebd?.licoes || []).filter(l => turmasFiltradas.some(t => t.id === l.turma_id));

    const menuItems = [{id: 1, label: 'Dashboard', icon: LayoutDashboard}, {id: 2, label: 'Turmas & Profs', icon: Users}, {id: 3, label: 'Matrícula Alunos', icon: UserPlus}, {id: 4, label: 'Controle de Lições', icon: BookOpen}, {id: 5, label: 'Mural de Turmas', icon: Layers}];
    const TabButton: any = ({ item }) => (<button onClick={() => setTab(item.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm whitespace-nowrap ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}><item.icon size={18}/> {item.label}</button>);

    const handleGenerateLessonPlan = async (licao) => {
        setAiLesson({ loading: true, text: '', title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`, revista: licao.revista, licao: licao.licao_numero || '1', capa: licao.capa || null });
        
        const prompt = `Atue como um teólogo especialista no material oficial da CPAD. 
        Pesquise e use obrigatoriamente como base de conteúdo e imagens as seguintes fontes: o currículo e portal oficial da CPAD (Casa Publicadora das Assembleias de Deus), Google Books API e Sistema EBD.
        O usuário deseja o conteúdo de estudo para a revista com o tema: "${licao.revista}", especificamente a Lição número ${licao.licao_numero || '1'}. 
        
        ${!licao.capa ? 'Por favor, retorne no final do texto a URL de uma imagem da capa desta revista específica encontrada nas suas buscas. Formate a URL exatamente assim: URL_CAPA=[url_da_imagem]. Se não encontrar nenhuma capa, coloque URL_CAPA=null.' : ''}

        Gere um conteúdo fiel, interativo e completo contendo:
        1. Título da Lição
        2. Texto Áureo e Verdade Prática
        3. Leitura Bíblica em Classe
        4. Introdução
        5. Tópicos e Subtópicos explicados
        6. Conclusão.
        
        Utilize formatação Markdown bem estruturada e rica.`;
        
        const result = await callGeminiAI(prompt, 5);
        
        let texto = result;
        let capaUrl = licao.capa || null;
        
        if (!licao.capa) {
            const match = result.match(/URL_CAPA=\[?(.*?)\]?/);
            if (match && match[1] && match[1] !== 'null') {
                capaUrl = match[1].trim();
                texto = result.replace(match[0], ''); // Remove a URL do texto final para não aparecer no UI
            }
        }
        
        setAiLesson({ loading: false, text: texto, title: `Estudo Interativo: Lição ${licao.licao_numero || '1'}`, revista: licao.revista, licao: licao.licao_numero || '1', capa: capaUrl });
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
                    </div>
                )}
                {tab === 2 && <GenericTable title="Gestão de Turmas" type="ebd_turma" data={turmasFiltradas} columns={[{header:'Turma', key:'nome'}, {header:'Sala', key:'sala'}, {header:'Professores', key:'prof1_id', render: (t) => [t.prof1_id, t.prof2_id, t.prof3_id].map(id => db.membros.find(m=>m.id===id)?.nome?.split(' ')[0]).filter(Boolean).join(', ') || 'Sem professor'}]} />}
                {tab === 3 && <GenericTable title="Matrícula de Alunos" type="ebd_aluno" data={alunosFiltrados} columns={[{header:'Aluno', key:'nome'}, {header:'Turma', key:'turma_id', render: a => turmasFiltradas.find(t=>t.id===a.turma_id)?.nome || '-'}]} />}
                {tab === 4 && <GenericTable title="Registro de Lições" type="ebd_licao" data={licoesFiltradasTotal} columns={[{header:'Data', key:'data', render: d=>formatDateLocal(d.data)}, {header:'Turma', key:'turma_id', render: l => turmasFiltradas.find(t=>t.id===l.turma_id)?.nome}, {header:'Revista/Tema', key:'revista'}, {header:'Lição', key:'licao_numero'}, {header:'Presentes', key:'qtd_presentes'}]} customActions={(item) => (
                    <button onClick={() => handleGenerateLessonPlan(item)} className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-sm flex items-center gap-1" title="Estudar Lição Interativa"><BookOpenText size={18}/> <span className="hidden lg:inline text-[10px] font-bold uppercase">Estudar</span></button>
                )}/>}
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
                                            <div>
                                                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-slate-100 pb-2"><Briefcase size={14} className="text-blue-500"/> Corpo Docente</h5>
                                                <div className="space-y-2">
                                                    {profs.map((p, idx) => p && (
                                                        <div key={idx} className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100">{p.nome.charAt(0)}</div>
                                                            <div>
                                                                <p className="font-bold text-sm text-slate-800 leading-none">{p.nome}</p>
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
            </div>

            {/* AI Lesson Modal - Estudo Interativo */}
            {aiLesson && (
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-entrance">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh] relative">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/80 backdrop-blur-sm sticky top-0 z-20">
                            <h3 className="font-black text-xl text-indigo-900 flex items-center gap-2"><BookOpen size={24} className="text-indigo-600"/> {aiLesson.title}</h3>
                            <button onClick={() => setAiLesson(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"><X size={24}/></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row bg-slate-50/50">
                            {/* Coluna Esquerda: Capa da Revista */}
                            <div className="w-full lg:w-1/3 p-8 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col items-center bg-white shrink-0">
                                <div className="w-full max-w-[250px] aspect-[2/3] bg-gradient-to-b from-blue-700 via-indigo-800 to-slate-900 rounded-lg shadow-xl p-6 flex flex-col justify-between text-center border-4 border-white ring-1 ring-slate-200 relative overflow-hidden mb-6">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                    <div className="relative z-10">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1 border-b border-blue-500/50 pb-2">Lições Bíblicas Adultos</span>
                                        <h3 className="font-black text-xl text-white uppercase mt-4 leading-snug drop-shadow-md line-clamp-4">{aiLesson.revista}</h3>
                                    </div>
                                    <div className="relative z-10 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                                        <div className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">Lição</div>
                                        <div className="text-5xl font-black text-white">{aiLesson.licao}</div>
                                    </div>
                                </div>
                                <div className="w-full text-center">
                                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-200">Material de Estudo</span>
                                    <p className="text-xs text-slate-500 font-medium mt-3 leading-relaxed">Este conteúdo interativo é gerado com base no currículo simulado de Escolas Bíblicas (CPAD).</p>
                                </div>
                            </div>

                            {/* Coluna Direita: Conteúdo da Lição */}
                            <div className="flex-1 p-8 md:p-12 bg-white relative">
                                {aiLesson.loading ? (
                                    <div className="flex flex-col items-center justify-center h-full text-indigo-600 min-h-[400px]">
                                        <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                                        <p className="font-black text-lg animate-pulse mb-1">Buscando na biblioteca teológica...</p>
                                        <p className="text-sm font-medium text-slate-500">A preparar o texto áureo e a explicação dos tópicos.</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-loose font-serif prose-headings:font-black prose-headings:text-slate-900 prose-a:text-indigo-600 prose-strong:text-slate-800">
                                        {aiLesson.text}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
                            {!aiLesson.loading && <Button onClick={() => { navigator.clipboard.writeText(aiLesson.text); addToast("Conteúdo copiado para a área de transferência!", "success"); }} variant="secondary" className="shadow-sm border-slate-300"><Copy size={18}/> Copiar Estudo Completo</Button>}
                            <Button onClick={() => setAiLesson(null)} variant="primary" className="shadow-indigo-500/30 px-8">Concluir Estudo</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default ModuleEBD;
