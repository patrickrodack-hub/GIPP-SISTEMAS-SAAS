import React, { useState, useContext } from 'react';
import { 
  Video, UserCircle, UploadCloud, MonitorPlay, Calendar, Activity, Database, X, Plus, Trash2, 
  Tv, Radio, Music, Users, Shield, Percent, Eye, MessageSquare, PlayCircle, Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { collection, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { Button, GenericTable, ChurchContext } from '../App';
import { InteractiveWindow } from './InteractiveWindow';

export const ModuleMidiaTab = ({
  subTabMedia, setSubTabMedia,
  mediaEquipe, loadingMediaEquipe,
  mediaEventos, loadingMediaEventos,
  mediaBiblioteca, loadingMediaBiblioteca,
  mediaEquipamentos, loadingMediaEquipamentos
}: any) => {

  const { dbFirestore, appId, addToast, db } = useContext<any>(ChurchContext);

  // Modal display toggles
  const [showEquipeModal, setShowEquipeModal] = useState(false);
  const [showEventoModal, setShowEventoModal] = useState(false);
  const [showBiblioModal, setShowBiblioModal] = useState(false);
  const [showEquipModal, setShowEquipModal] = useState(false);

  // Process and simulation states
  const [calculatingAnalytics, setCalculatingAnalytics] = useState(false);
  const [engagementMultiplier, setEngagementMultiplier] = useState(1.0);

  // Link General Member or Patrimonio
  const [selectedMembroId, setSelectedMembroId] = useState('');
  const [selectedPatrimonioId, setSelectedPatrimonioId] = useState('');

  // New Teammate State
  const [eqNome, setEqNome] = useState('');
  const [eqFuncao, setEqFuncao] = useState('Fotógrafo');
  const [eqTelefone, setEqTelefone] = useState('');
  const [eqEmail, setEqEmail] = useState('');
  const [eqDisponibilidade, setEqDisponibilidade] = useState('Cultos de Domingo');
  const [eqStatus, setEqStatus] = useState('Ativo');

  // New Event/Briefing State & Dynamic Scale List (replicated from missoes/agenda)
  const [evTitulo, setEvTitulo] = useState('');
  const [evDataHora, setEvDataHora] = useState('');
  const [evDescricao, setEvDescricao] = useState('');
  const [evYouTube, setEvYouTube] = useState(true);
  const [evFacebook, setEvFacebook] = useState(false);
  const [evInstagram, setEvInstagram] = useState(true);
  const [evCheckAud, setEvCheckAud] = useState(true);
  const [evCheckVid, setEvCheckVid] = useState(true);
  const [evCheckLight, setEvCheckLight] = useState(false);
  const [evCheckRec, setEvCheckRec] = useState(true);
  const [evMembros, setEvMembros] = useState('');

  // Dynamic scaling states
  const [evEscala, setEvEscala] = useState<any[]>([]);
  const [tempEscalaId, setTempEscalaId] = useState('');
  const [tempEscalaFuncao, setTempEscalaFuncao] = useState('Vídeo');
  const [tempEscalaEquipamentoId, setTempEscalaEquipamentoId] = useState('');

  // New Content Asset State
  const [biNome, setBiNome] = useState('');
  const [biCategoria, setBiCategoria] = useState('Cultos');
  const [biTipo, setBiTipo] = useState('Imagem PNG/JPG');
  const [biTamanho, setBiTamanho] = useState('15.4 MB');
  const [biUrl, setBiUrl] = useState('');
  const [biAcesso, setBiAcesso] = useState('Somente Equipe');

  // New Equipment State
  const [eqpNome, setEqpNome] = useState('');
  const [eqpModelo, setEqpModelo] = useState('');
  const [eqpSerie, setEqpSerie] = useState('');
  const [eqpCategoria, setEqpCategoria] = useState('Câmera');
  const [eqpStatus, setEqpStatus] = useState('Excelente');
  const [eqpUltRevisão, setEqpUltRevisão] = useState('');
  const [eqpProxRevisão, setEqpProxRevisão] = useState('');

  // Firestore Save Handlers
  const handleAddTeammate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqNome.trim()) return addToast('Por favor, informe o nome do integrante.', 'warning');

    try {
      const data = {
        nome: eqNome,
        funcao: eqFuncao,
        telefone: eqTelefone || 'Não informado',
        email: eqEmail || 'Não informado',
        disponibilidade: eqDisponibilidade,
        status: eqStatus,
        membro_id: selectedMembroId || null,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'midia_equipe'), data);
      addToast('Integrante cadastrado com sucesso na equipe técnica!', 'success');
      
      // Reset form & close
      setEqNome('');
      setEqTelefone('');
      setEqEmail('');
      setSelectedMembroId('');
      setShowEquipeModal(false);
    } catch (err) {
      console.error(err);
      addToast('Erro ao cadastrar integrante.', 'error');
    }
  };

  const handleAddEventBriefing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitulo.trim()) return addToast('Por favor, indique um título para o evento.', 'warning');
    if (!evDataHora) return addToast('Por favor, indique a data e o horário.', 'warning');

    try {
      const platforms = [];
      if (evYouTube) platforms.push('YouTube');
      if (evFacebook) platforms.push('Facebook');
      if (evInstagram) platforms.push('Instagram');

      let computedMembrosString = evEscala.map(item => {
        let txt = `${item.nome} (${item.funcao_escala})`;
        if (item.equipamentoNome) {
          txt += ` [Equip: ${item.equipamentoNome}]`;
        }
        return txt;
      }).join(', ');
      if (!computedMembrosString) {
        computedMembrosString = evMembros || 'Rede Geral de Voluntários';
      }

      const data = {
        titulo: evTitulo,
        dataHora: evDataHora,
        descricao: evDescricao || 'Nenhuma pauta adicionada',
        streaming: platforms.join(', ') || 'Nenhum',
        checklists: {
          audio: evCheckAud,
          video: evCheckVid,
          iluminacao: evCheckLight,
          gravacao: evCheckRec
        },
        membrosEscalados: computedMembrosString,
        equipe: evEscala,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'midia_eventos'), data);
      addToast('Briefing de Evento agendado e equipe escalada com sucesso!', 'success');

      // Reset
      setEvTitulo('');
      setEvDataHora('');
      setEvDescricao('');
      setEvMembros('');
      setEvEscala([]);
      setTempEscalaId('');
      setTempEscalaEquipamentoId('');
      setShowEventoModal(false);
    } catch (err) {
      console.error(err);
      addToast('Erro ao criar agenda de briefing.', 'error');
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biNome.trim()) return addToast('Informe o nome do arquivo/arte.', 'warning');

    try {
      const data = {
        nome: biNome,
        categoria: biCategoria,
        tipo: biTipo,
        tamanho: biTamanho,
        url: biUrl || 'https://canva.com/design/example',
        acesso: biAcesso,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'midia_biblioteca'), data);
      addToast('Arquivo catalogado no acervo do Ministério de Mídia.', 'success');

      // Reset
      setBiNome('');
      setBiUrl('');
      setShowBiblioModal(false);
    } catch (err) {
      console.error(err);
      addToast('Erro ao catalogar arquivo.', 'error');
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqpNome.trim()) return addToast('Informe o nome do equipamento.', 'warning');

    try {
      const data = {
        nome: eqpNome,
        modelo: eqpModelo || 'Genérico',
        serie: eqpSerie || 'S/N',
        categoria: eqpCategoria,
        status: eqpStatus,
        ultimaRevisao: eqpUltRevisão || 'Data de hoje',
        proximaRevisao: eqpProxRevisão || 'A definir',
        patrimonio_id: selectedPatrimonioId || null,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'midia_equipamentos'), data);
      addToast('Equipamento cadastrado com sucesso no inventário!', 'success');

      // Reset
      setEqpNome('');
      setEqpModelo('');
      setEqpSerie('');
      setEqpUltRevisão('');
      setEqpProxRevisão('');
      setSelectedPatrimonioId('');
      setShowEquipModal(false);
    } catch (err) {
      console.error(err);
      addToast('Erro ao cadastrar equipamento.', 'error');
    }
  };

  // Delete Handlers
  const handleDeleteItem = async (colName: string, id: string) => {
    if (!confirm('Deseja realmente remover este registro do Ministério de Mídia?')) return;
    try {
      await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', colName, id));
      addToast('Registro removido com sucesso.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro ao excluir registro.', 'error');
    }
  };

  // Simulated Analytics Process
  const handleProcessAnalytics = () => {
    setCalculatingAnalytics(true);
    addToast('Conectando às APIs das Redes Sociais e consolidação de visualizações...', 'info');
    
    setTimeout(() => {
      setCalculatingAnalytics(false);
      setEngagementMultiplier(prev => (prev === 1.0 ? 1.27 : 1.0));
      addToast('Métricas consolidadas! GIPP identificou crescimento de 27% no engajamento semanal.', 'success');
    }, 2000);
  };

  // Recharts Simulated Data
  const dataReach = [
    { name: 'Dom 10h', youtube: Math.round(1450 * engagementMultiplier), facebook: Math.round(520 * engagementMultiplier), instagram: Math.round(890 * engagementMultiplier) },
    { name: 'Jovens', youtube: Math.round(820 * engagementMultiplier), facebook: Math.round(150 * engagementMultiplier), instagram: Math.round(1240 * engagementMultiplier) },
    { name: 'Dom 18h', youtube: Math.round(1890 * engagementMultiplier), facebook: Math.round(610 * engagementMultiplier), instagram: Math.round(1120 * engagementMultiplier) },
    { name: 'Ensino', youtube: Math.round(980 * engagementMultiplier), facebook: Math.round(310 * engagementMultiplier), instagram: Math.round(420 * engagementMultiplier) },
  ];

  const dataParticipation = [
    { name: 'Fotografia', integrantes: 4, eventos: 12 },
    { name: 'Áudio PA/Sim.', integrantes: 6, eventos: 18 },
    { name: 'Transmissão', integrantes: 5, eventos: 14 },
    { name: 'Design/Projeção', integrantes: 8, eventos: 22 },
  ];

  const dataGearStatus = [
    { name: 'Excelente', value: 12, color: '#0d9488' }, // Teal 600
    { name: 'Bom', value: 8, color: '#3b82f6' }, // Blue 500
    { name: 'Manutenção', value: 3, color: '#f59e0b' }, // Amber 500
    { name: 'Substituição', value: 1, color: '#ef4444' }, // Red 500
  ];

  return (
    <div className="h-full flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-6">
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-6 rounded-[2rem] shadow-md border border-teal-700/50 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md"><Video size={32}/></div>
          <div>
            <h3 className="font-extrabold text-2xl tracking-tight">Ministério de Mídia (Departamento Geral)</h3>
            <p className="text-xs text-teal-100/85 font-medium mt-1 uppercase tracking-widest">Escalas de Transmissão, Conteúdo Digital e Inventário Técnico</p>
          </div>
        </div>
      </div>

      {/* Media Sub tabs switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        {['equipe', 'eventos', 'biblioteca', 'equipamentos', 'relatorios'].map((st) => (
          <button
            key={st}
            onClick={() => setSubTabMedia(st)}
            className={`px-5 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl transition-all ${subTabMedia === st ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-slate-500 hover:text-teal-600'}`}
          >
            {st === 'equipe' && 'Escala & Equipe'}
            {st === 'eventos' && 'Agenda & Eventos'}
            {st === 'biblioteca' && 'Acervo & Upload'}
            {st === 'equipamentos' && 'Aparato Técnico'}
            {st === 'relatorios' && 'Relatórios & KPI'}
          </button>
        ))}
      </div>

      {subTabMedia === 'equipe' && (
        <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-black text-lg text-slate-800">Equipe Técnica de Mídia</h4>
              <p className="text-xs text-slate-500">Fotógrafos, vídeomakers, operadores e editores com escala sincronizada</p>
            </div>
            <Button onClick={() => setShowEquipeModal(true)} variant="primary" className="!bg-teal-600 border-teal-700 text-white hover:bg-teal-700 flex items-center gap-2">
              <Plus size={16}/> Novo Integrante
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <th className="p-4 rounded-l-xl">Integrante</th>
                  <th className="p-4">Função Principal</th>
                  <th className="p-4">Contato / Email</th>
                  <th className="p-4">Disponibilidade</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center rounded-r-xl">Ação</th>
                </tr>
              </thead>
              <tbody>
                {loadingMediaEquipe ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Buscando voluntários...</td></tr>
                ) : mediaEquipe.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Nenhum operador ou fotógrafo cadastrado neste módulo de mídia. Adicione um para iniciar as escalas.</td></tr>
                ) : mediaEquipe.map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-850 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                        {item.nome.charAt(0).toUpperCase()}
                      </div>
                      {item.nome}
                    </td>
                    <td className="p-4 font-semibold text-teal-700">{item.funcao}</td>
                    <td className="p-4">
                      <div className="text-xs text-slate-600 font-medium">{item.telefone}</div>
                      <div className="text-[10px] text-slate-400">{item.email}</div>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-600">{item.disponibilidade}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDeleteItem('midia_equipe', item.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTabMedia === 'eventos' && (
        <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-black text-lg text-slate-800">Briefings & Checklist Técnico</h4>
              <p className="text-xs text-slate-500">Organização técnica, pautas e controle de transmissão ao vivo por plataformas</p>
            </div>
            <Button onClick={() => setShowEventoModal(true)} variant="primary" className="!bg-teal-600 border-teal-700 text-white hover:bg-teal-700 flex items-center gap-2">
              <Plus size={16}/> Agendar Briefing
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loadingMediaEventos ? (
              <p className="text-center p-8 text-slate-400">Verificando agenda...</p>
            ) : mediaEventos.length === 0 ? (
              <p className="text-center p-8 text-slate-400 border border-dashed border-slate-200 rounded-2xl">Sem briefings agendados. Crie o primeiro para gerenciar checklists de som, iluminação e live stream.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {mediaEventos.map((item: any) => (
                  <div key={item.id} className="p-5 border border-slate-100 hover:border-slate-250 bg-white shadow-xs rounded-[2rem] flex flex-col justify-between space-y-4 relative">
                    <button onClick={() => handleDeleteItem('midia_eventos', item.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16}/>
                    </button>
                    <div className="space-y-1">
                      <div className="flex gap-2 items-center text-xs font-bold text-teal-600">
                        <Activity size={14}/>
                        <span>{item.dataHora.replace('T', ' ')}</span>
                      </div>
                      <h5 className="font-extrabold text-base text-slate-850">{item.titulo}</h5>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">{item.descricao}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Canais / Transmissão</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {item.streaming?.split(', ').map((str: any) => (
                            <span key={str} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">{str}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Checklist de Equipamentos (Controle)</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <label className="flex items-center gap-1.5 text-slate-600 font-semibold pointer-events-none">
                            <input type="checkbox" checked={item.checklists?.audio} readOnly className="accent-teal-600" /> Sistema Som
                          </label>
                          <label className="flex items-center gap-1.5 text-slate-600 font-semibold pointer-events-none">
                            <input type="checkbox" checked={item.checklists?.video} readOnly className="accent-teal-600" /> Câmeras/Vídeo
                          </label>
                          <label className="flex items-center gap-1.5 text-slate-600 font-semibold pointer-events-none">
                            <input type="checkbox" checked={item.checklists?.iluminacao} readOnly className="accent-teal-600" /> Iluminação
                          </label>
                          <label className="flex items-center gap-1.5 text-slate-600 font-semibold pointer-events-none">
                            <input type="checkbox" checked={item.checklists?.gravacao} readOnly className="accent-teal-600" /> Gravalive
                          </label>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] uppercase font-black text-teal-600 block">Operadores Escalados</span>
                        <span className="text-xs text-slate-700 font-bold">{item.membrosEscalados}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {subTabMedia === 'biblioteca' && (
        <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-black text-lg text-slate-800">Acervo & Biblioteca de Recursos</h4>
              <p className="text-xs text-slate-500">Links para drive, templates de posts, vídeos brutos para edição e logomarcas</p>
            </div>
            <Button onClick={() => setShowBiblioModal(true)} variant="primary" className="!bg-teal-600 border-teal-700 text-white hover:bg-teal-700 flex items-center gap-2">
              <UploadCloud size={16}/> Upload / Gravar Link
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <th className="p-4 rounded-l-xl">Arquivo/Link</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Tamanho</th>
                  <th className="p-4">Nível de Acesso</th>
                  <th className="p-4 text-center rounded-r-xl">Ação</th>
                </tr>
              </thead>
              <tbody>
                {loadingMediaBiblioteca ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Verificando arquivos no drive...</td></tr>
                ) : mediaBiblioteca.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Nenhum recurso cadastrado nesta biblioteca. Armazene links para artes do Canva e pastas do Drive aqui.</td></tr>
                ) : mediaBiblioteca.map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-850">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline flex items-center gap-1.5">
                        <UploadCloud size={14}/>
                        {item.nome}
                      </a>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-500">{item.categoria}</td>
                    <td className="p-4 text-xs font-semibold text-slate-600">{item.tipo}</td>
                    <td className="p-4 text-xs font-mono font-medium text-slate-400">{item.tamanho}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.acesso === 'Público' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                        {item.acesso}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDeleteItem('midia_biblioteca', item.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTabMedia === 'equipamentos' && (
        <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-black text-lg text-slate-800">Aparato Técnico & Inventário de Ativos</h4>
              <p className="text-xs text-slate-500">Câmeras, cartões SD, microfones de lapela, transmissores sem fio e lentes de cinema</p>
            </div>
            <Button onClick={() => setShowEquipModal(true)} variant="primary" className="!bg-teal-600 border-teal-700 text-white hover:bg-teal-700 flex items-center gap-2">
              <Plus size={16}/> Cadastrar Equipamento
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <th className="p-4 rounded-l-xl">Equipamento</th>
                  <th className="p-4">Modelo / Ref</th>
                  <th className="p-4">Num. Série</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Estado de Conservação</th>
                  <th className="p-4">Última Revisão</th>
                  <th className="p-4 text-center rounded-r-xl">Ação</th>
                </tr>
              </thead>
              <tbody>
                {loadingMediaEquipamentos ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Verificando armário técnico...</td></tr>
                ) : mediaEquipamentos.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Sem equipamentos adicionados ao inventário. Cadastre suas lentes e câmeras para organizar manutenções preventivas.</td></tr>
                ) : mediaEquipamentos.map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-800">{item.nome}</td>
                    <td className="p-4 text-xs font-semibold text-slate-650">{item.modelo}</td>
                    <td className="p-4 text-xs font-mono text-slate-400">{item.serie}</td>
                    <td className="p-4 text-xs font-semibold text-slate-500">{item.categoria}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        item.status === 'Excelente' ? 'bg-emerald-50 text-emerald-600' : 
                        item.status === 'Bom' ? 'bg-indigo-50 text-indigo-600' : 
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-600">{item.ultimaRevisao}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDeleteItem('midia_equipamentos', item.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTabMedia === 'relatorios' && (
        <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col space-y-6">
          <div className="flex justify-between items-center bg-teal-50/40 p-4 rounded-2xl border border-teal-100/30">
            <div>
              <h4 className="font-black text-lg text-teal-900">Métricas Consolidadas & Indicadores (KPI)</h4>
              <p className="text-xs text-teal-800 font-semibold">Consumo e engajamento das transmissões ao vivo versus escalas de atuação</p>
            </div>
            <Button onClick={handleProcessAnalytics} disabled={calculatingAnalytics} className="!bg-teal-600 border-teal-700 text-white hover:bg-teal-700 flex items-center gap-2">
              <Activity size={16} className={calculatingAnalytics ? 'animate-spin' : ''}/>
              {calculatingAnalytics ? 'Consolidando Redes...' : 'Processar Analytics'}
            </Button>
          </div>

          {/* KPI Mini boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Espectadores Semanal</span>
              <p className="text-2xl font-black text-slate-800">{Math.round(4360 * engagementMultiplier)}</p>
              <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5">↑ 14% em relação ao mês anterior</span>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Voluntários Engajados</span>
              <p className="text-2xl font-black text-slate-800">{mediaEquipe.length || 23}</p>
              <span className="text-[10px] font-semibold text-slate-500">Distribuição nas escalas semanais</span>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Patrimônio Mídia (Geral)</span>
              <p className="text-2xl font-black text-slate-800">{mediaEquipamentos.length || 24} Itens</p>
              <span className="text-[10px] font-semibold text-amber-500">3 necessitando revisão técnica</span>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Retenção de Live Streams</span>
              <p className="text-2xl font-black text-slate-800">42 Min.</p>
              <span className="text-[10px] font-semibold text-indigo-500">Média de tempo por usuário</span>
            </div>
          </div>

          {/* Interactive Recharts visual graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <div className="p-6 border border-slate-100 rounded-3xl space-y-4">
              <div>
                <h5 className="font-extrabold text-slate-800 text-sm">Visualizações Simultâneas por Plataforma (Média)</h5>
                <p className="text-xs text-slate-400">Desempenho consolidado nos principais cultos da semana técnica</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dataReach}>
                    <defs>
                      <linearGradient id="colorYt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorIg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="youtube" name="YouTube Live" stroke="#ef4444" fillOpacity={1} fill="url(#colorYt)" />
                    <Area type="monotone" dataKey="instagram" name="Instagram Live" stroke="#a855f7" fillOpacity={1} fill="url(#colorIg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 border border-slate-100 rounded-3xl space-y-4 animate-fade-in">
              <div>
                <h5 className="font-extrabold text-slate-800 text-sm">Volume de Atuação e Voluntários por Setor</h5>
                <p className="text-xs text-slate-400">Total de escalas acumuladas nos últimos 30 dias de programação</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataParticipation}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <RechartsTooltip />
                    <Bar dataKey="integrantes" name="Voluntárias" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="eventos" name="Escalas/Mês" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 p-6 border border-slate-100 rounded-3xl grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h5 className="font-extrabold text-slate-800 text-sm mb-1">Estado de Conservação do Equipamento Técnico</h5>
                <p className="text-xs text-slate-400 mb-4">Divisão proporcional sobre o inventário catalogado para manutenção preventiva de câmeras, lentes, e mesas de som.</p>
                <div className="space-y-2">
                  {dataGearStatus.map((g) => (
                    <div key={g.name} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }}></span>
                        {g.name}
                      </span>
                      <span className="font-bold text-slate-800">{g.value} unidades</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-56 flex justify-center items-center">
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie data={dataGearStatus} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                      {dataGearStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL NOVO INTEGRANTE ================= */}
      {showEquipeModal && (
        <InteractiveWindow
          id="midia_novo_integrante"
          title="Novo Integrante da Equipe"
          subtitle="Defina cargo, contatos e disponibilidade • Mídias"
          onClose={() => setShowEquipeModal(false)}
          icon={UserCircle}
          headerBg="from-teal-600 via-teal-700 to-teal-800"
          defaultWidth={650}
          defaultHeight={620}
        >
          <form onSubmit={handleAddTeammate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 uppercase">Vincular a Membro da Igreja (Opcional)</label>
              <select
                value={selectedMembroId}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedMembroId(val);
                  if (val) {
                    const member = (db?.membros || []).find((m: any) => m.id === val);
                    if (member) {
                      setEqNome(member.nome || '');
                      setEqTelefone(member.telefone || member.contato || member.whatsapp || '');
                      setEqEmail(member.email || '');
                    }
                  } else {
                    setEqNome('');
                    setEqTelefone('');
                    setEqEmail('');
                  }
                }}
                className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white font-medium"
              >
                <option value="">-- Cadastro Avulso (Não-Membro / Manual) --</option>
                {(db?.membros || []).map((m: any) => (
                  <option key={m.id} value={m.id}>{m.nome} {m.cargo ? `(${m.cargo})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 uppercase">Nome Completo</label>
              <input required type="text" value={eqNome} onChange={e => setEqNome(e.target.value)} placeholder="Ex: Samuel Silva de Paula" className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Função Principal</label>
                <select value={eqFuncao} onChange={e => setEqFuncao(e.target.value)} className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white">
                  <option>Fotógrafo</option>
                  <option>Cinegrafista / Vídeo</option>
                  <option>Operador de Som PA</option>
                  <option>Transmissão Live Stream</option>
                  <option>Designer de Projeção</option>
                  <option>Operador de Iluminação</option>
                  <option>Editor de Vídeo</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Status</label>
                <select value={eqStatus} onChange={e => setEqStatus(e.target.value)} className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white">
                  <option>Ativo</option>
                  <option>Inativo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">WhatsApp / Celular</label>
                <input type="text" value={eqTelefone} onChange={e => setEqTelefone(e.target.value)} placeholder="Ex: (11) 98765-4321" className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Email</label>
                <input type="email" value={eqEmail} onChange={e => setEqEmail(e.target.value)} placeholder="Ex: samuel@igreja.com" className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 uppercase">Disponibilidade de Escala</label>
              <input type="text" value={eqDisponibilidade} onChange={e => setEqDisponibilidade(e.target.value)} placeholder="Ex: Cultos de Domingo, Quintas à noite" className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <Button type="button" onClick={() => setShowEquipeModal(false)} variant="secondary">Cancelar</Button>
              <Button type="submit" className="!bg-teal-600 border-teal-700 text-white hover:bg-teal-700">Adicionar Integrante</Button>
            </div>
          </form>
        </InteractiveWindow>
      )}

      {/* ================= MODAL AGENDAR BRIEFING ================= */}
      {showEventoModal && (
        <InteractiveWindow
          id="midia_agendar_briefing"
          title="Agendar Briefing / Evento"
          subtitle="Crie pautas de cultos e configure plataformas de live stream • Mídias"
          onClose={() => setShowEventoModal(false)}
          icon={Calendar}
          headerBg="from-teal-600 via-teal-700 to-teal-800"
          defaultWidth={700}
          defaultHeight={700}
        >
          <form onSubmit={handleAddEventBriefing} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Título ou Tipo de Culto</label>
                <input required type="text" value={evTitulo} onChange={e => setEvTitulo(e.target.value)} placeholder="Ex: Culto de Celebração de Domingo" className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Data e Horário</label>
                <input required type="datetime-local" value={evDataHora} onChange={e => setEvDataHora(e.target.value)} className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 uppercase">Descrição da Pauta / Observações</label>
              <textarea rows={2} value={evDescricao} onChange={e => setEvDescricao(e.target.value)} placeholder="Ex: Gravação de depoimentos de batismo no início e transmissão de encerramento da cantata de Páscoa." className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 uppercase block">Transmissão (Plataformas Multiselect)</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={evYouTube} onChange={e => setEvYouTube(e.target.checked)} className="accent-teal-600 w-4 h-4" /> YouTube Live
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={evFacebook} onChange={e => setEvFacebook(e.target.checked)} className="accent-teal-600 w-4 h-4" /> Facebook Live
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={evInstagram} onChange={e => setEvInstagram(e.target.checked)} className="accent-teal-600 w-4 h-4" /> Instagram Live
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 uppercase block">Checklist Preliminar Requerido</label>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={evCheckAud} onChange={e => setEvCheckAud(e.target.checked)} className="accent-teal-600" /> Afinação de Vozes / PA Som
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={evCheckVid} onChange={e => setEvCheckVid(e.target.checked)} className="accent-teal-600" /> Cartões Vazios / Lentes Limpas
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={evCheckLight} onChange={e => setEvCheckLight(e.target.checked)} className="accent-teal-600" /> Afinamento de Cenário & Luz
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={evCheckRec} onChange={e => setEvCheckRec(e.target.checked)} className="accent-teal-600" /> Gravar Backup em SSD local
                </label>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-3xl border border-slate-200/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-teal-800 uppercase flex items-center gap-1.5 mb-0">
                  <Users size={14} /> Equipe Escalada (Escala Técnica)
                </label>
                <span className="text-[10px] font-black text-teal-700 bg-teal-100/70 border border-teal-200/50 px-2 py-0.5 rounded-full">{evEscala.length} Integrantes</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Pessoa</label>
                  <select 
                    value={tempEscalaId} 
                    onChange={e => setTempEscalaId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  >
                    <option value="">Selecione...</option>
                    {mediaEquipe && mediaEquipe.length > 0 && (
                      <optgroup label="Voluntários de Mídia">
                        {(mediaEquipe || []).map((t: any) => (
                          <option key={t.id} value={t.id}>{t.nome} ({t.funcao})</option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Membros da Igreja">
                      {(db?.membros || []).map((m: any) => (
                        <option key={m.id} value={`m-${m.id}`}>{m.nome} ({m.cargo || 'Membro'})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Função da Escala</label>
                  <select
                    value={tempEscalaFuncao}
                    onChange={e => setTempEscalaFuncao(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  >
                    <option>Fotógrafo</option>
                    <option>Cinegrafista / Vídeo</option>
                    <option>Operador de Som PA</option>
                    <option>Transmissão Live Stream</option>
                    <option>Designer de Projeção</option>
                    <option>Operador de Iluminação</option>
                    <option>Editor de Vídeo</option>
                    <option>Direção de Culto</option>
                    <option>Apoio</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Equipamento Vinculado</label>
                  <select
                    value={tempEscalaEquipamentoId}
                    onChange={e => setTempEscalaEquipamentoId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  >
                    <option value="">Nenhum equipamento</option>
                    {(mediaEquipamentos || []).map((eq: any) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.nome} {eq.modelo ? `(${eq.modelo})` : ''} - {eq.categoria}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button 
                  type="button"
                  onClick={() => {
                    if (!tempEscalaId) return addToast('Selecione uma pessoa.', 'warning');
                    let nome = '';
                    if (tempEscalaId.startsWith('m-')) {
                      const mId = tempEscalaId.replace('m-', '');
                      nome = (db?.membros || []).find((m: any) => m.id === mId)?.nome || 'Membro';
                    } else {
                      nome = (mediaEquipe || []).find((t: any) => t.id === tempEscalaId)?.nome || 'Operador';
                    }

                    if (evEscala.some(item => item.id === tempEscalaId)) {
                      return addToast('Esta pessoa já foi escalada para este evento.', 'warning');
                    }

                    let eqNomeStr = '';
                    if (tempEscalaEquipamentoId) {
                      const selectedEq = (mediaEquipamentos || []).find((eq: any) => eq.id === tempEscalaEquipamentoId);
                      if (selectedEq) {
                        eqNomeStr = selectedEq.nome;
                      }
                    }

                    setEvEscala([...evEscala, { 
                      id: tempEscalaId, 
                      nome, 
                      funcao_escala: tempEscalaFuncao,
                      equipamentoId: tempEscalaEquipamentoId || null,
                      equipamentoNome: eqNomeStr || null
                    }]);
                    setTempEscalaId('');
                    setTempEscalaEquipamentoId('');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <Plus size={14} /> Vincular & Adicionar à Escala
                </button>
              </div>

              {evEscala.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pt-1">
                  {evEscala.map((member, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-slate-200/50 shadow-xs animate-entrance">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-50 text-[10px] font-extrabold text-teal-700 flex items-center justify-center">
                          {member.nome ? member.nome.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-700">{member.nome}</span>
                          <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100/70 px-1.5 py-0.5 rounded uppercase tracking-wide">
                            {member.funcao_escala}
                          </span>
                          {member.equipamentoNome && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50/70 border border-amber-200/60 px-1.5 py-0.5 rounded tracking-wide flex items-center gap-1">
                              🔧 {member.equipamentoNome}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          const newTeam = [...evEscala];
                          newTeam.splice(idx, 1);
                          setEvEscala(newTeam);
                        }}
                        className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic text-center py-2 bg-white/60 rounded-xl border border-dashed border-slate-200/30">Nenhum operador voluntário escalado ainda.</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <Button type="button" onClick={() => setShowEventoModal(false)} variant="secondary">Cancelar</Button>
              <Button type="submit" className="!bg-teal-600 border-teal-700 text-white hover:bg-teal-700">Salvar Evento</Button>
            </div>
          </form>
        </InteractiveWindow>
      )}

      {/* ================= MODAL NOVO ARQUIVO ================= */}
      {showBiblioModal && (
        <InteractiveWindow
          id="midia_novo_arquivo"
          title="Upload / Registrar Arquivo"
          subtitle="Organize links de pastas do Google Drive ou artes Canva • Mídias"
          onClose={() => setShowBiblioModal(false)}
          icon={UploadCloud}
          headerBg="from-teal-600 via-teal-700 to-teal-800"
          defaultWidth={650}
          defaultHeight={500}
        >
          <form onSubmit={handleAddAsset} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 uppercase">Nome da Arte / Recurso</label>
              <input required type="text" value={biNome} onChange={e => setBiNome(e.target.value)} placeholder="Ex: Folder Campanha de Oração 2026" className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Categoria</label>
                <select value={biCategoria} onChange={e => setBiCategoria(e.target.value)} className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white">
                  <option>Cultos</option>
                  <option>Conferências</option>
                  <option>Campanhas</option>
                  <option>Escola Bíblica</option>
                  <option>Outros</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Formato / Tipo</label>
                <select value={biTipo} onChange={e => setBiTipo(e.target.value)} className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white">
                  <option>Imagem PNG/JPG</option>
                  <option>Vídeo MP4</option>
                  <option>Arte Canva (Link)</option>
                  <option>Logotipo SVG</option>
                  <option>Documento PDF</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Tamanho Estimado</label>
                <input type="text" value={biTamanho} onChange={e => setBiTamanho(e.target.value)} placeholder="Ex: 12.4 MB" className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Controle de Acesso</label>
                <select value={biAcesso} onChange={e => setBiAcesso(e.target.value)} className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white">
                  <option>Somente Equipe</option>
                  <option>Público</option>
                  <option>Administração</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 uppercase">URL do Recurso / Google Drive / Canva Link</label>
              <input type="url" value={biUrl} onChange={e => setBiUrl(e.target.value)} placeholder="Ex: https://drive.google.com/drive/folders/..." className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <Button type="button" onClick={() => setShowBiblioModal(false)} variant="secondary">Cancelar</Button>
              <Button type="submit" className="!bg-teal-600 border-teal-700 text-white hover:bg-teal-700">Catalogar Recurso</Button>
            </div>
          </form>
        </InteractiveWindow>
      )}

      {/* ================= MODAL NOVO EQUIPAMENTO ================= */}
      {showEquipModal && (
        <InteractiveWindow
          id="midia_novo_equipamento"
          title="Cadastrar Equipamento"
          subtitle="Organize o patrimônio técnico e manutenções periódicas • Mídias"
          onClose={() => setShowEquipModal(false)}
          icon={MonitorPlay}
          headerBg="from-teal-600 via-teal-700 to-teal-800"
          defaultWidth={650}
          defaultHeight={670}
        >
          <form onSubmit={handleAddEquipment} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 uppercase">Vincular a Bem do Patrimônio (Opcional)</label>
              <select
                value={selectedPatrimonioId}
                onChange={e => {
                  const val = e.target.value;
                  setSelectedPatrimonioId(val);
                  if (val) {
                    const item = (db?.patrimonio || []).find((p: any) => p.id === val);
                    if (item) {
                      setEqpNome(item.nome || '');
                      setEqpModelo(item.marca || item.modelo || item.tombo || '');
                      setEqpSerie(item.tombo || item.serie || '');
                      setEqpCategoria(item.categoria && ['Câmera', 'Lente', 'Microfone / Áudio', 'Mesa de Som / PA', 'Iluminação / Refletor', 'Computador / Encoder', 'Projetor / Painel LED', 'Cabos / Acessórios'].includes(item.categoria) ? item.categoria : 'Câmera');
                    }
                  } else {
                    setEqpNome('');
                    setEqpModelo('');
                    setEqpSerie('');
                  }
                }}
                className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white font-medium"
              >
                <option value="">-- Cadastro Avulso (Não patrimoniado / Manufaturado) --</option>
                {(db?.patrimonio || []).map((p: any) => (
                  <option key={p.id} value={p.id}>{p.nome} {p.tombo ? `[Tombo: ${p.tombo}]` : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-600 uppercase">Equipamento (Nome)</label>
              <input required type="text" value={eqpNome} onChange={e => setEqpNome(e.target.value)} placeholder="Ex: Câmera Sony Mirrorless A7III" className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Modelo / Marca</label>
                <input type="text" value={eqpModelo} onChange={e => setEqpModelo(e.target.value)} placeholder="Ex: Sony Alpha" className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Num. de Série</label>
                <input type="text" value={eqpSerie} onChange={e => setEqpSerie(e.target.value)} placeholder="Ex: SN-5489721-B" className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Categoria</label>
                <select value={eqpCategoria} onChange={e => setEqpCategoria(e.target.value)} className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white">
                  <option>Câmera</option>
                  <option>Lente</option>
                  <option>Microfone / Áudio</option>
                  <option>Mesa de Som / PA</option>
                  <option>Iluminação / Refletor</option>
                  <option>Computador / Encoder</option>
                  <option>Projetor / Painel LED</option>
                  <option>Cabos / Acessórios</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Estado de Conservação</label>
                <select value={eqpStatus} onChange={e => setEqpStatus(e.target.value)} className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white">
                  <option>Excelente</option>
                  <option>Bom</option>
                  <option>Necessita Manutenção</option>
                  <option>Condenado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Última Revisão</label>
                <input type="date" value={eqpUltRevisão} onChange={e => setEqpUltRevisão(e.target.value)} className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600 uppercase">Próxima Revisão Recomendada</label>
                <input type="date" value={eqpProxRevisão} onChange={e => setEqpProxRevisão(e.target.value)} className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <Button type="button" onClick={() => setShowEquipModal(false)} variant="secondary">Cancelar</Button>
              <Button type="submit" className="!bg-teal-600 border-teal-700 text-white hover:bg-teal-700">Salvar No Inventário</Button>
            </div>
          </form>
        </InteractiveWindow>
      )}
    </div>
  );
};
