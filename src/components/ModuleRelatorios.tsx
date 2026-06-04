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
const ModuleRelatorios = memo(() => {
    const { db, setPrintMode, setPrintData, setPreviewOpen, addToast } = useContext(ChurchContext); 
    const [configModal, setConfigModal] = useState({ open: false, type: null });
    const [inputs, setInputs] = useState({});
    const [loadingAiAta, setLoadingAiAta] = useState(false);

    // Os 11 relatórios requeridos
    const reportTypes = [ 
        { id: 'rel_fluxo', label: '1. Fluxo de Caixa', desc: 'Controle Financeiro Geral', icon: DollarSign, color: 'emerald' }, 
        { id: 'rel_ebd', label: '2. Relatório EBD', desc: 'Turmas, Profs e Alunos', icon: BookOpen, color: 'blue' }, 
        { id: 'rel_missoes', label: '3. Missões', desc: 'Fluxo, Agências e Missionários', icon: Globe, color: 'indigo' }, 
        { id: 'rel_carnes', label: '4. Carnês', desc: 'Encontro de Contas/Contribu.', icon: CreditCard, color: 'purple' }, 
        { id: 'rel_igreja', label: '5. Cadastro Igreja', desc: 'Ficha Completa Institucional', icon: Building2, color: 'slate' }, 
        { id: 'rel_membros', label: '6. Membros', desc: 'Listagem ou Ficha Individual', icon: Users, color: 'pink' },
        { id: 'rel_carta_convite', label: '7. Carta Convite', desc: 'Gerador de Convite Oficial', icon: Mail, color: 'amber' },
        { id: 'rel_ministerios', label: '8. Ministérios', desc: 'Apresentação de Departamentos', icon: Layers, color: 'teal' },
        { id: 'rel_corpo_ministerial', label: '9. Corpo Ministerial', desc: 'Pastores, Obreiros, Diáconos', icon: Shield, color: 'rose' },
        { id: 'rel_contador', label: '10. P/ Contador', desc: 'Financeiro Detalhado p/ Auditoria', icon: FileSpreadsheet, color: 'cyan' },
        { id: 'rel_ata_reuniao', label: '11. Ata de Reunião', desc: 'Documento Padrão AD', icon: ScrollText, color: 'stone' },
        { id: 'rel_aniversariantes', label: '12. Aniversariantes', desc: 'Listagem de Membros por Mês', icon: Gift, color: 'pink' },
        { id: 'rel_planejamento_anual', label: '13. Planejamento Anual', desc: 'Metas vs Realizado / Orçamentos', icon: Target, color: 'emerald' }
    ];

    const openReportConfig = (type) => { 
        setInputs({}); // Reset inputs on open
        setConfigModal({ open: true, type }); 
    };

    const handleGenerateReport = () => { 
        const type = configModal.type; 
        let payload = {}; 
        
        switch(type) { 
            case 'rel_fluxo': 
                payload = { financeiro: db.financeiro, data_inicio: inputs.data_inicio, data_fim: inputs.data_fim, congregacao_id: inputs.congregacao_id || 'todas' }; 
                break; 
            case 'rel_ebd': 
                payload = { turmas: db.ebd.turmas, alunos: db.ebd.alunos, membros: db.membros }; 
                break; 
            case 'rel_missoes': 
                payload = { ...db.missoes, financeiro: db.financeiro.filter(f=>f.categoria==='Missões'), data_inicio: inputs.data_inicio, data_fim: inputs.data_fim, congregacao_id: inputs.congregacao_id || 'todas' }; 
                break; 
            case 'rel_carnes': 
                payload = { carnes: db.carnes, membros: db.membros }; 
                break; 
            case 'rel_igreja': 
                payload = { igreja: db.igreja }; 
                break; 
            case 'rel_membros': 
                if (inputs.membro_tipo === 'ficha') {
                     setPrintMode('rel_ficha_membro');
                     payload = { membro: inputs.membro_id ? db.membros.find(m => m.id === inputs.membro_id) : null };
                } else {
                     setPrintMode('rel_membros_lista');
                     payload = { membros: db.membros };
                }
                break; 
            case 'rel_carta_convite':
                payload = { config: inputs };
                break;
            case 'rel_ministerios':
                payload = { ministerios: db.departamentos, membros: db.membros };
                break;
            case 'rel_corpo_ministerial':
                payload = { membros: db.membros.filter(m => ['Auxiliar', 'Diácono', 'Presbítero', 'Evangelista', 'Pastor', 'Missionário'].includes(m.cargo)) };
                break;
            case 'rel_contador':
                payload = { financeiro: db.financeiro, fornecedores: db.fornecedores, centro_custo: db.centro_custo, data_inicio: inputs.data_inicio, data_fim: inputs.data_fim, congregacao_id: inputs.congregacao_id || 'todas' };
                break;
            case 'rel_ata_reuniao':
                payload = { config: inputs };
                break;
            case 'rel_aniversariantes':
                payload = { membros: db.membros, mes: inputs.mes_aniversario };
                break;
            case 'rel_planejamento_anual':
                payload = { 
                    orcamentos: db.orcamentos || [], 
                    centro_custo: db.centro_custo || [], 
                    financeiro: db.financeiro || [],
                    filtro_tipo: inputs.filtro_tipo || 'ano', 
                    ano: inputs.ano || new Date().getFullYear(),
                    mes: inputs.mes || '',
                    data_inicio: inputs.data_inicio || '',
                    data_fim: inputs.data_fim || '1'
                };
                break;
        } 
        
        if (type !== 'rel_membros') {
            setPrintMode(type); 
        }
        
        setPrintData({ ...payload, igreja: db.igreja }); 
        setPreviewOpen(true); 
        setConfigModal({open: false, type: null}); 
    };

    return (
        <div className="glass-modern p-8 rounded-[2.5rem] animate-entrance">
            <div className="flex items-center gap-3 mb-8"><div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600"><FileText size={28}/></div><h2 className="text-3xl font-black text-slate-800 tracking-tight text-gradient">Central de Relatórios Oficiais</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {reportTypes.map(item => (
                    <button key={item.id} onClick={() => openReportConfig(item.id)} className={`glass-card p-6 rounded-[2rem] text-left hover:bg-white transition-all group border border-slate-200 relative overflow-hidden ring-1 ring-slate-100 hover:ring-${item.color}-300 hover:shadow-${item.color}-500/20 hover:shadow-xl`}>
                        <div className={`p-4 rounded-2xl bg-${item.color}-50 text-${item.color}-600 mb-4 w-fit group-hover:scale-110 transition-transform shadow-sm`}><item.icon size={24}/></div>
                        <h3 className="font-black text-lg text-slate-800 mb-1 leading-tight tracking-tight">{item.label}</h3>
                        <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                    </button>
                ))}
            </div>

            {configModal.open && (
                <div className="fixed inset-0 bg-slate-900/60 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm animate-entrance">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden ring-1 ring-white/40 border border-slate-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-black text-xl text-slate-800 flex items-center gap-2"><Settings size={20} className="text-indigo-500"/> Configurar Relatório</h3>
                            <button onClick={()=>setConfigModal({open:false})} className="p-2 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-full transition-colors"><X size={20}/></button>
                        </div>
                        
                        <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Formulários dinâmicos baseados no tipo do relatório */}
                            {configModal.type === 'rel_membros' && (
                                <>
                                    <FormSelect label="Tipo de Relatório de Membros" value={inputs.membro_tipo || 'lista'} onChange={v => setInputs({...inputs, membro_tipo: v})} options={[{label:'Listagem Geral (com destaque p/ aniversariantes)', value:'lista'}, {label:'Ficha Cadastral', value:'ficha'}]} />
                                    {inputs.membro_tipo === 'ficha' && (
                                        <div className="bg-amber-50 p-4 border border-amber-200 rounded-2xl">
                                            <p className="text-xs text-amber-700 font-bold mb-3"><Info size={14} className="inline mr-1"/> Deixe vazio para gerar uma ficha em branco pronta para impressão e preenchimento manual.</p>
                                            <FormSelect label="Selecionar Membro" value={inputs.membro_id || ''} onChange={v => setInputs({...inputs, membro_id: v})} options={[{label:'-- GERAR FICHA EM BRANCO --', value:''}, ...db.membros.map(m=>({label:m.nome, value:m.id}))]} />
                                        </div>
                                    )}
                                </>
                            )}

                            {configModal.type === 'rel_carta_convite' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-2">
                                        <p className="text-xs font-bold text-indigo-700 uppercase">Preencha os dados do convite</p>
                                    </div>
                                    <FormInput label="Igreja / Congregação Convidada" value={inputs.igreja_convidada} onChange={v => setInputs({...inputs, igreja_convidada:v})} className="col-span-2" placeholder="Ex: Assembleia de Deus Congregação Betel"/>
                                    <FormInput label="Pastor Dirigente Convidado" value={inputs.pastor_convidado} onChange={v => setInputs({...inputs, pastor_convidado:v})} placeholder="Ex: Pr. João Silva"/>
                                    <FormInput label="Conjunto / Departamento" value={inputs.conjunto} onChange={v => setInputs({...inputs, conjunto:v})} placeholder="Ex: Círculo de Oração Monte Sinai" />
                                    <FormInput label="Preletor(a) / Cantor(a)" value={inputs.preletor} onChange={v => setInputs({...inputs, preletor:v})} placeholder="Ex: Ev. Marcos"/>
                                    <FormInput label="Data e Hora do Evento" value={inputs.data_evento} onChange={v => setInputs({...inputs, data_evento:v})} placeholder="Ex: 15 de Novembro às 19h"/>
                                    <FormInput label="Tema / Versículo Base" value={inputs.tema} onChange={v => setInputs({...inputs, tema:v})} className="col-span-2" placeholder="Ex: Desperta tu que dormes (Ef 5:14)"/>
                                </div>
                            )}

                            {configModal.type === 'rel_ata_reuniao' && (
                                <div className="space-y-4">
                                     <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-2 flex items-start gap-3">
                                         <Info className="text-stone-500 mt-1" size={20}/>
                                         <p className="text-xs font-bold text-stone-600">O cabeçalho formal (nome da igreja, CNPJ, endereço) e a área de assinaturas do Pastor Presidente e Secretário serão gerados automaticamente no PDF. Escreva apenas o corpo da ATA abaixo.</p>
                                     </div>
                                     <div className="flex justify-between items-end mb-2">
                                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Texto da ATA / Rascunho</label>
                                         <Button type="button" onClick={async () => {
                                             if(!inputs.texto_ata) return addToast("Digite os tópicos ou rascunho primeiro.", "warning");
                                             setLoadingAiAta(true);
                                             addToast("Formatando Ata com IA...", "info");
                                             const prompt = `Transforme o seguinte rascunho de anotações em um corpo de texto de Ata de Reunião Eclesiástica extremamente formal e coeso, em português, usando linguagem apropriada para documentos legais da igreja. Rascunho da reunião: "${inputs.texto_ata}"`;
                                             const res = await callGeminiAI(prompt);
                                             setInputs({...inputs, texto_ata: res.replace(/^"|"$/g, '').trim()});
                                             setLoadingAiAta(false);
                                             addToast("Ata formatada com sucesso!", "success");
                                         }} disabled={loadingAiAta} variant="ghost" className="bg-indigo-50 text-indigo-600 border border-indigo-100 py-1.5 px-3 text-xs shadow-sm hover:bg-indigo-100">
                                             {loadingAiAta ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>} ✨ Redigir Formalmente com IA
                                         </Button>
                                     </div>
                                     <textarea className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-sm h-64 focus:ring-2 focus:ring-stone-500 outline-none resize-y shadow-inner leading-loose uppercase" value={inputs.texto_ata || ''} onChange={e => setInputs({...inputs, texto_ata: ((e.target.value || "").toUpperCase() || "").toUpperCase()})} placeholder={`Pode digitar apenas tópicos rápidos e a IA fará o resto. Ex: Reunião iniciou às 19h, aprovamos compra do telão, pastor João orou no fim...`}></textarea>
                                </div>
                            )}

                            {configModal.type === 'rel_aniversariantes' && (
                                <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100 mb-4">
                                    <p className="text-sm font-bold text-pink-800 mb-4 flex items-center gap-2"><Gift size={18}/> Filtrar por Mês</p>
                                    <FormSelect label="Selecione o Mês" value={inputs.mes_aniversario || ''} onChange={v => setInputs({...inputs, mes_aniversario:v})} options={[
                                        {label: '-- Todos os Meses --', value: ''},
                                        {label: 'Janeiro', value: '1'},
                                        {label: 'Fevereiro', value: '2'},
                                        {label: 'Março', value: '3'},
                                        {label: 'Abril', value: '4'},
                                        {label: 'Maio', value: '5'},
                                        {label: 'Junho', value: '6'},
                                        {label: 'Julho', value: '7'},
                                        {label: 'Agosto', value: '8'},
                                        {label: 'Setembro', value: '9'},
                                        {label: 'Outubro', value: '10'},
                                        {label: 'Novembro', value: '11'},
                                        {label: 'Dezembro', value: '12'}
                                    ]} />
                                </div>
                            )}

                            {configModal.type === 'rel_planejamento_anual' && (
                                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-4">
                                    <p className="text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2"><Target size={18}/> Opções do Planejamento Anual</p>
                                    
                                    <div className="mb-4 col-span-2">
                                        <FormSelect 
                                            label="Abrangência do Filtro" 
                                            value={inputs.filtro_tipo || 'ano'} 
                                            onChange={v => setInputs({...inputs, filtro_tipo: v})} 
                                            options={[
                                                {label: 'Exercício Anual Completo (Padrão)', value: 'ano'},
                                                {label: 'Referência Mensal Específica', value: 'mes'},
                                                {label: 'Período Customizado (Datas)', value: 'periodo'}
                                            ]} 
                                        />
                                    </div>

                                    {(inputs.filtro_tipo === 'ano' || inputs.filtro_tipo === 'mes' || !inputs.filtro_tipo) && (
                                        <div className="mb-4">
                                            <FormInput 
                                                label="Ano do Exercício" 
                                                type="number" 
                                                value={inputs.ano || new Date().getFullYear().toString()} 
                                                onChange={v => setInputs({...inputs, ano: parseInt(v) || new Date().getFullYear()})} 
                                            />
                                        </div>
                                    )}

                                    {inputs.filtro_tipo === 'mes' && (
                                        <div className="mb-4">
                                            <FormSelect 
                                                label="Selecione o Mês" 
                                                value={inputs.mes || '1'} 
                                                onChange={v => setInputs({...inputs, mes: v})} 
                                                options={[
                                                    {label: 'Janeiro', value: '1'},
                                                    {label: 'Fevereiro', value: '2'},
                                                    {label: 'Março', value: '3'},
                                                    {label: 'Abril', value: '4'},
                                                    {label: 'Maio', value: '5'},
                                                    {label: 'Junho', value: '6'},
                                                    {label: 'Julho', value: '7'},
                                                    {label: 'Agosto', value: '8'},
                                                    {label: 'Setembro', value: '9'},
                                                    {label: 'Outubro', value: '10'},
                                                    {label: 'Novembro', value: '11'},
                                                    {label: 'Dezembro', value: '12'}
                                                ]} 
                                            />
                                        </div>
                                    )}

                                    {inputs.filtro_tipo === 'periodo' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FormInput 
                                                label="Data Inicial" 
                                                type="date" 
                                                value={inputs.data_inicio || ''} 
                                                onChange={v => setInputs({...inputs, data_inicio: v})} 
                                            />
                                            <FormInput 
                                                label="Data Final" 
                                                type="date" 
                                                value={inputs.data_fim || ''} 
                                                onChange={v => setInputs({...inputs, data_fim: v})} 
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {['rel_fluxo', 'rel_missoes', 'rel_contador'].includes(configModal.type) && (
                                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-4">
                                    <p className="text-sm font-bold text-emerald-800 mb-4">Filtrar por Período e Local (Opcional)</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                        <FormInput label="Data Inicial" type="date" value={inputs.data_inicio || ''} onChange={v => setInputs({...inputs, data_inicio:v})} />
                                        <FormInput label="Data Final" type="date" value={inputs.data_fim || ''} onChange={v => setInputs({...inputs, data_fim:v})} />
                                    </div>
                                    <FormSelect label="Congregação / Filial" value={inputs.congregacao_id || 'todas'} onChange={v => setInputs({...inputs, congregacao_id:v})} options={[{label: 'Matriz e Filiais', value: 'todas'}, {label: 'Sede Principal', value: 'sede'}, ...db.congregacoes.map(c=>({label: c.nome, value: c.id}))]} />
                                    <p className="text-[10px] text-emerald-600 mt-2">Deixe em branco para extrair todo o período registrado.</p>
                                </div>
                            )}

                            {['rel_ebd', 'rel_carnes', 'rel_igreja', 'rel_ministerios', 'rel_corpo_ministerial', 'rel_aniversariantes', 'rel_planejamento_anual'].includes(configModal.type) && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"><CheckCheck size={40} className="text-emerald-500"/></div>
                                    <h4 className="text-xl font-black text-slate-800 mb-2">Pronto para gerar</h4>
                                    <p className="text-sm text-slate-500">O sistema irá compilar os dados automaticamente no formato PDF/Impressão.</p>
                                </div>
                            )}

                            {['rel_fluxo', 'rel_missoes', 'rel_contador'].includes(configModal.type) && (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse"><CheckCheck size={32} className="text-emerald-500"/></div>
                                    <h4 className="font-black text-slate-800 mb-1">Pronto para gerar</h4>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                            <Button variant="ghost" onClick={()=>setConfigModal({open:false})} className="bg-white border border-slate-300">Cancelar</Button>
                            <Button onClick={handleGenerateReport} variant="primary" className="shadow-lg shadow-indigo-500/30 flex items-center gap-2 justify-center px-8">
                                <Printer size={20}/> Gerar Documento
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

// --- NOVO: PORTAL DO MEMBRO - BOLETIM DIGITAL EXCLUSIVO ---
const PortalBoletim = ({ db, user }) => {
    const { addToast, dbFirestore, appId, collection, addDoc } = useContext(ChurchContext);
    const [showForm, setShowForm] = useState(false);
    const [avisoData, setAvisoData] = useState({ tipo: 'Agradecimento', titulo: '', mensagem: '' });
    const [isSaving, setIsSaving] = useState(false);

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

    const handleSubmitAviso = async (e) => {
        e.preventDefault();
        if (!avisoData.titulo || !avisoData.mensagem) return addToast("Preencha todos os campos.", "warning");
        setIsSaving(true);
        try {
            await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'solicitacoes'), {
                membro_id: user?.id,
                nome: user?.nome,
                tipo: 'Anúncio Boletim',
                categoria_anuncio: avisoData.tipo,
                obs: `TÍTULO: ${avisoData.titulo}\n\nMENSAGEM: ${avisoData.mensagem}`,
                status: 'Pendente',
                data_solicitacao: new Date().toISOString(),
                created_at: new Date().toISOString()
            });
            addToast("Pedido de anúncio enviado com sucesso! A secretaria irá analisar.", "success");
            setShowForm(false);
            setAvisoData({ tipo: 'Agradecimento', titulo: '', mensagem: '' });
        } catch(e) {
            console.error(e);
            addToast("Erro ao enviar o pedido.", "error");
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-6 animate-entrance pb-12">
            <PortalHeader title="Boletim Digital" subtitle="Avisos e Programação Oficial" icon={Newspaper} gradientTo="#f97316">
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 text-sm font-bold text-white hover:text-white/80 bg-black/20 backdrop-blur-md px-6 py-3 rounded-xl shadow-lg border border-white/20 transition-all hover:scale-105">
                    {showForm ? <><X size={18}/> Voltar ao Boletim</> : <><Megaphone size={18}/> Enviar Anúncio</>}
                </button>
            </PortalHeader>
            
            {showForm ? (
                <div className="bg-[#0B1221] rounded-[2rem] shadow-lg border border-[#1C2A43] p-6 md:p-8 animate-entrance">
                    <div className="flex items-center gap-3 mb-6 border-b border-[#1C2A43] pb-4">
                        <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl"><Megaphone size={24}/></div>
                        <div>
                            <h3 className="text-xl font-black text-white">Solicitar Publicação no Boletim</h3>
                            <p className="text-xs text-blue-200/60 font-medium mt-1">Envie o seu aviso, convite, testemunho ou agradecimento para análise da secretaria.</p>
                        </div>
                    </div>
                    
                    <form onSubmit={handleSubmitAviso} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-[10px] font-bold text-blue-200/60 uppercase tracking-widest mb-2 block">Categoria do Anúncio</label>
                                <select 
                                    value={avisoData.tipo} 
                                    onChange={e => setAvisoData({...avisoData, tipo: (e.target.value || "").toUpperCase()})}
                                    className="w-full bg-[#060B14] border border-[#1C2A43] rounded-xl py-3.5 px-4 text-white text-sm focus:border-orange-500 outline-none shadow-inner cursor-pointer"
                                >
                                    <option value="Agradecimento">Agradecimento / Testemunho</option>
                                    <option value="Convite">Convite (Casamento, Aniversário)</option>
                                    <option value="Aviso">Aviso Geral / Nota</option>
                                    <option value="Pedido de Oração">Pedido de Oração Especial</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-blue-200/60 uppercase tracking-widest mb-2 block">Título Curto</label>
                                <input 
                                    type="text" 
                                    value={avisoData.titulo} 
                                    onChange={e => setAvisoData({...avisoData, titulo: (e.target.value || "").toUpperCase()})}
                                    placeholder="Ex: Convite de Casamento"
                                    className="w-full bg-[#060B14] border border-[#1C2A43] rounded-xl py-3 px-4 text-white text-sm focus:border-orange-500 outline-none shadow-inner"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-blue-200/60 uppercase tracking-widest mb-2 block">Mensagem (Texto a ser publicado)</label>
                            <textarea 
                                value={avisoData.mensagem} 
                                onChange={e => setAvisoData({...avisoData, mensagem: (e.target.value || "").toUpperCase()})}
                                placeholder="Descreva de forma clara e objetiva o que deseja comunicar no boletim..."
                                className="w-full bg-[#060B14] border border-[#1C2A43] rounded-xl p-4 text-white text-sm focus:border-orange-500 outline-none resize-none min-h-[120px] shadow-inner"
                                required
                            ></textarea>
                        </div>
                        
                        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start gap-3">
                            <Info size={18} className="text-orange-400 shrink-0 mt-0.5"/>
                            <p className="text-xs text-orange-200/80 leading-relaxed font-medium">Os anúncios enviados através deste formulário serão recebidos pela secretaria da igreja na aba "Solicitações" e, caso aprovados, serão introduzidos na pauta de avisos do culto e no boletim impresso/digital.</p>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-[#1C2A43]">
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] text-[#060B14] font-bold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}
                                {isSaving ? 'A Enviar...' : 'Enviar para Secretaria'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-entrance">
                    <div className="bg-[#0B1221] rounded-[2rem] shadow-lg border border-[#1C2A43] p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2 border-b border-[#1C2A43] pb-4 relative z-10">
                            <Star size={24} className="text-orange-500"/> Eventos Especiais
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {eventosList.map((evt, idx) => {
                                const IconComponent = getIcon(evt.icon);
                                return (
                                    <div key={idx} className="bg-[#060B14] p-5 rounded-2xl border border-[#1C2A43] flex flex-col sm:flex-row items-start gap-4 hover:border-orange-500/30 transition-colors group">
                                        <div className={`p-3 rounded-xl bg-${evt.color || 'blue'}-500/10 text-${evt.color || 'blue'}-400 border border-${evt.color || 'blue'}-500/20 shadow-sm group-hover:scale-110 transition-transform shrink-0`}>
                                            <IconComponent size={24}/>
                                        </div>
                                        <div className="flex-1 w-full">
                                            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                                <h4 className="font-bold text-white text-base leading-tight">{evt.titulo}</h4>
                                                <span className={`text-[9px] font-black uppercase tracking-widest bg-${evt.color || 'blue'}-500/10 text-${evt.color || 'blue'}-400 px-2.5 py-1 rounded-md border border-${evt.color || 'blue'}-500/20 shadow-sm`}>{evt.regra}</span>
                                            </div>
                                            <p className="text-xs text-blue-200/60 mb-4 leading-relaxed font-medium">{evt.desc}</p>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-[#1C2A43]/50 w-fit px-3 py-1.5 rounded-lg border border-[#1C2A43]">
                                                <span className="flex items-center gap-1.5"><Clock size={12} className="text-orange-400"/> {evt.hora}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-[#0B1221] rounded-[2rem] shadow-lg border border-[#1C2A43] p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2 border-b border-[#1C2A43] pb-4 relative z-10">
                            <Clock size={24} className="text-blue-500"/> Programação Semanal
                        </h3>
                        <div className="space-y-3 relative z-10">
                            {progList.map((culto, idx) => {
                                const IconComponent = getIcon(culto.icon);
                                return (
                                    <div key={idx} className="flex justify-between items-center bg-[#060B14] p-4 rounded-xl border border-[#1C2A43] hover:border-blue-500/30 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-lg bg-${culto.color || 'blue'}-500/10 text-${culto.color || 'blue'}-400 border border-${culto.color || 'blue'}-500/20 shadow-sm group-hover:scale-110 transition-transform shrink-0`}>
                                                <IconComponent size={18}/>
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm leading-tight mb-0.5">{culto.titulo}</p>
                                                <p className="text-[10px] font-bold text-blue-200/60 uppercase tracking-widest">{culto.dia}</p>
                                            </div>
                                        </div>
                                        <div className="bg-[#1C2A43] text-white px-3 py-1.5 rounded-lg shadow-sm font-mono font-bold text-xs tracking-wider border border-[#2a3e5e]">
                                            {culto.hora}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default ModuleRelatorios;
