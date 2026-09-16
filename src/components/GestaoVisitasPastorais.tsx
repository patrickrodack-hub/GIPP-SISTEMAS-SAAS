import React, { useState, useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  HeartHandshake, Calendar, Clock, MapPin, User, Phone, CheckCircle, 
  AlertCircle, Plus, Search, Filter, Printer, FileText, Lock, MessageSquare, 
  X, Check, ShieldCheck, ChevronRight, UserCheck, Heart, Sparkles, Send
} from 'lucide-react';
import { ChurchContext, Button } from '../App';

export interface RegistroVisitaPastoral {
  id: string;
  tipo: 'domiciliar' | 'hospitalar' | 'enfermo' | 'aconselhamento' | 'luto' | 'novo_convertido';
  membro_id?: string;
  nome_assistido: string;
  telefone?: string;
  endereco?: string;
  data: string;
  hora: string;
  pastor_responsavel: string;
  acompanhantes?: string; // ex: presbítero fulano, diaconisa ciclana
  status: 'agendada' | 'realizada' | 'remarcada' | 'cancelada';
  motivo_demanda: string;
  relato_atendimento: string;
  pedidos_oracao: string;
  sigiloso: boolean; // confidencialidade pastoral absoluta
  retorno_necessario: boolean;
  data_retorno?: string;
  created_at: string;
}

interface GestaoVisitasPastoraisProps {
  initialMembroId?: string;
  onClose?: () => void;
}

export const GestaoVisitasPastorais: React.FC<GestaoVisitasPastoraisProps> = ({ initialMembroId, onClose }) => {
  const { db, addToast } = useContext(ChurchContext);

  // Local storage backup key for pastoral visits
  const STORAGE_KEY = 'ad_gestao_visitas_pastorais_v1';

  const [visitas, setVisitas] = useState<RegistroVisitaPastoral[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default initial mock/templates
    return [
      {
        id: 'VIS-2026-001',
        tipo: 'hospitalar',
        nome_assistido: 'Irmã Maria Aparecida dos Santos',
        telefone: '(11) 98765-4321',
        endereco: 'Hospital Regional - Leito 304, Ala Sul',
        data: new Date().toISOString().split('T')[0],
        hora: '14:30',
        pastor_responsavel: db.pastor || 'Pr. Presidente',
        acompanhantes: 'Ev. Marcos e Dc. Jonas',
        status: 'realizada',
        motivo_demanda: 'Recuperação pós-cirúrgica e oração com unção com óleo conforme Tiago 5:14.',
        relato_atendimento: 'Visita muito abençoada. Ministrada a comunhão e a Palavra no Salmo 91. Paciente alegre e em plena recuperação.',
        pedidos_oracao: 'Plena cicatrização e testemunho diante da equipe médica.',
        sigiloso: false,
        retorno_necessario: true,
        data_retorno: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      },
      {
        id: 'VIS-2026-002',
        tipo: 'aconselhamento',
        nome_assistido: 'Irmão Carlos Eduardo Souza',
        telefone: '(11) 97123-9988',
        endereco: 'Gabinete Pastoral - Templo Central',
        data: new Date().toISOString().split('T')[0],
        hora: '17:00',
        pastor_responsavel: db.pastor || 'Pr. Presidente',
        acompanhantes: '',
        status: 'agendada',
        motivo_demanda: 'Aconselhamento vocacional e orientação matrimonial para noivado.',
        relato_atendimento: '',
        pedidos_oracao: 'Direção do Espírito Santo para decisões ministeriais.',
        sigiloso: true,
        retorno_necessario: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'VIS-2026-003',
        tipo: 'novo_convertido',
        nome_assistido: 'Lucas Henrique de Oliveira',
        telefone: '(11) 99443-1122',
        endereco: 'Rua das Palmeiras, 145 - Jd. Esperança',
        data: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        hora: '19:30',
        pastor_responsavel: 'Coop. Tiago Silva',
        acompanhantes: 'Dc. Mateus',
        status: 'realizada',
        motivo_demanda: 'Visita de discipulado inicial e entrega de Bíblia e lições de integração.',
        relato_atendimento: 'Família acolheu muito bem a equipe. O jovem demonstrou firmeza na decisão e interesse no batismo em águas.',
        pedidos_oracao: 'Conversão dos pais e irmãos.',
        sigiloso: false,
        retorno_necessario: true,
        data_retorno: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      }
    ];
  });

  const saveVisitas = (newList: RegistroVisitaPastoral[]) => {
    setVisitas(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  // Search, filter and status
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [showSecretNotes, setShowSecretNotes] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisita, setSelectedVisita] = useState<RegistroVisitaPastoral | null>(null);
  const [selectedForPrint, setSelectedForPrint] = useState<RegistroVisitaPastoral | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<RegistroVisitaPastoral>>({
    tipo: 'domiciliar',
    status: 'agendada',
    data: new Date().toISOString().split('T')[0],
    hora: '15:00',
    pastor_responsavel: db.pastor || 'Pr. Presidente',
    sigiloso: false,
    retorno_necessario: false
  });

  // Pre-fill if initialMembroId is given
  React.useEffect(() => {
    if (initialMembroId) {
      const membro = (db.membros || []).find((m: any) => m.id === initialMembroId);
      if (membro) {
        setFormData(prev => ({
          ...prev,
          membro_id: membro.id,
          nome_assistido: membro.nome,
          telefone: membro.telefone || '',
          endereco: membro.endereco ? `${membro.endereco}, ${membro.numero || ''} - ${membro.bairro || ''}` : ''
        }));
        setIsModalOpen(true);
      }
    }
  }, [initialMembroId, db.membros]);

  const filteredVisitas = useMemo(() => {
    return visitas.filter(v => {
      const matchSearch = v.nome_assistido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.motivo_demanda && v.motivo_demanda.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.pastor_responsavel && v.pastor_responsavel.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchTipo = filterTipo === 'todos' || v.tipo === filterTipo;
      const matchStatus = filterStatus === 'todos' || v.status === filterStatus;
      return matchSearch && matchTipo && matchStatus;
    });
  }, [visitas, searchTerm, filterTipo, filterStatus]);

  const handleOpenNew = () => {
    setFormData({
      id: `VIS-${new Date().getFullYear()}-${String(visitas.length + 1).padStart(3, '0')}`,
      tipo: 'domiciliar',
      nome_assistido: '',
      telefone: '',
      endereco: '',
      data: new Date().toISOString().split('T')[0],
      hora: '15:00',
      pastor_responsavel: db.pastor || 'Pr. Presidente',
      acompanhantes: '',
      status: 'agendada',
      motivo_demanda: '',
      relato_atendimento: '',
      pedidos_oracao: '',
      sigiloso: false,
      retorno_necessario: false,
      data_retorno: '',
      created_at: new Date().toISOString()
    });
    setSelectedVisita(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: RegistroVisitaPastoral) => {
    setSelectedVisita(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome_assistido || !formData.data) {
      addToast('Preencha ao menos o nome do assistido e a data.', 'warning');
      return;
    }

    if (selectedVisita) {
      // Update
      const updated = visitas.map(v => v.id === selectedVisita.id ? { ...v, ...(formData as RegistroVisitaPastoral) } : v);
      saveVisitas(updated);
      addToast('Atendimento/visita atualizado com sucesso!', 'success');
    } else {
      // Create new
      const newItem: RegistroVisitaPastoral = {
        ...(formData as RegistroVisitaPastoral),
        id: formData.id || `VIS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        created_at: new Date().toISOString()
      };
      saveVisitas([newItem, ...visitas]);
      addToast('Visita pastoral agendada com sucesso!', 'success');
    }

    setIsModalOpen(false);
  };

  const handleMembroSelect = (membroId: string) => {
    const membro = (db.membros || []).find((m: any) => m.id === membroId);
    if (membro) {
      setFormData(prev => ({
        ...prev,
        membro_id: membro.id,
        nome_assistido: membro.nome,
        telefone: membro.telefone || '',
        endereco: membro.endereco ? `${membro.endereco}, ${membro.numero || ''} ${membro.bairro || ''} ${membro.cidade || ''}`.trim() : ''
      }));
    }
  };

  const handlePrint = (item: RegistroVisitaPastoral) => {
    setSelectedForPrint(item);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const getTipoBadge = (tipo: string) => {
    switch(tipo) {
      case 'hospitalar': return <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-full bg-rose-50 text-rose-700 border border-rose-200">Hospitalar</span>;
      case 'enfermo': return <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-full bg-amber-50 text-amber-700 border border-amber-200">Enfermo no Lar</span>;
      case 'aconselhamento': return <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-full bg-purple-50 text-purple-700 border border-purple-200">Aconselhamento</span>;
      case 'luto': return <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-full bg-slate-100 text-slate-700 border border-slate-300">Família Enlutada</span>;
      case 'novo_convertido': return <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Novo Convertido</span>;
      default: return <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Domiciliar</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'realizada': return <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-emerald-100 text-emerald-800">Concluída</span>;
      case 'agendada': return <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-blue-100 text-blue-800">Agendada</span>;
      case 'remarcada': return <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-amber-100 text-amber-800">Remarcada</span>;
      default: return <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-rose-100 text-rose-800">Cancelada</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
            <HeartHandshake size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Central de Visitas & Aconselhamentos</h2>
              <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Pastoral Care
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Acompanhamento pastoral, visitas hospitalares, unção de enfermos e aconselhamentos confidenciais.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowSecretNotes(!showSecretNotes)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${showSecretNotes ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50'}`}
            title="Alternar visibilidade de anotações confidenciais do gabinete"
          >
            <Lock size={15} /> {showSecretNotes ? 'Ocultar Sigilo' : 'Exibir Conteúdo Sigiloso'}
          </button>

          <Button
            onClick={handleOpenNew}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-md shadow-rose-500/20 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Agendar Nova Visita / Atendimento
          </Button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
              title="Fechar"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total de Atendimentos</div>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">{visitas.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-blue-600">Agendadas</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {visitas.filter(v => v.status === 'agendada').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Concluídas</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {visitas.filter(v => v.status === 'realizada').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-rose-600">Hospitalares & Enfermos</div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {visitas.filter(v => v.tipo === 'hospitalar' || v.tipo === 'enfermo').length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do irmão, motivo ou pastor..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        <select
          value={filterTipo}
          onChange={e => setFilterTipo(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
        >
          <option value="todos">Todos os Tipos</option>
          <option value="domiciliar">Domiciliar</option>
          <option value="hospitalar">Hospitalar</option>
          <option value="enfermo">Enfermo no Lar</option>
          <option value="aconselhamento">Aconselhamento</option>
          <option value="luto">Luto</option>
          <option value="novo_convertido">Novo Convertido</option>
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
        >
          <option value="todos">Todos os Status</option>
          <option value="agendada">Agendada</option>
          <option value="realizada">Realizada</option>
          <option value="remarcada">Remarcada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVisitas.map(item => (
          <div 
            key={item.id} 
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:border-rose-300 dark:hover:border-rose-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getTipoBadge(item.tipo)}
                  {getStatusBadge(item.status)}
                </div>
                {item.sigiloso && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700">
                    <Lock size={10} /> Sigiloso
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white line-clamp-1">
                  {item.nome_assistido}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><Calendar size={13} className="text-slate-400" /> {item.data}</span>
                  <span className="flex items-center gap-1"><Clock size={13} className="text-slate-400" /> {item.hora}</span>
                </div>
              </div>

              {item.endereco && (
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
                  <MapPin size={14} className="text-rose-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{item.endereco}</span>
                </div>
              )}

              {item.motivo_demanda && (
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Motivo: </span>
                  <span className="line-clamp-2">{item.motivo_demanda}</span>
                </div>
              )}

              {item.pedidos_oracao && (
                <div className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                  <div className="font-black flex items-center gap-1 mb-0.5 text-[11px]">
                    <Heart size={12} /> Motivo de Intercessão:
                  </div>
                  <p className="line-clamp-2 italic">{item.pedidos_oracao}</p>
                </div>
              )}

              {item.relato_atendimento && (
                <div className="text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 pt-2">
                  <span className="font-bold">Desfecho: </span>
                  {item.sigiloso && !showSecretNotes ? (
                    <span className="italic text-slate-400">Conteúdo protegido por sigilo pastoral. Clique em "Exibir Conteúdo Sigiloso" para ler.</span>
                  ) : (
                    <span className="line-clamp-3">{item.relato_atendimento}</span>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 mt-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold truncate max-w-[150px]">
                {item.pastor_responsavel}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePrint(item)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
                  title="Imprimir Ficha de Visita Pastoral"
                >
                  <Printer size={15} />
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Detalhes
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredVisitas.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <HeartHandshake size={48} className="mx-auto mb-3 text-slate-300 opacity-60" />
            <p className="font-bold text-base">Nenhum atendimento ou visita pastoral localizada.</p>
            <p className="text-xs mt-1">Clique em "Agendar Nova Visita" para registrar uma nova assistência.</p>
          </div>
        )}
      </div>

      {/* FORM MODAL (OVERLAY 100% COM CREATEPORTAL PARA NÃO SER LIMITADO POR NENHUM CONTAINER PAI) */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-5 md:p-8 flex justify-center items-start"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col my-auto max-h-[94vh] overflow-hidden">
            {/* Header Fixo */}
            <div className="flex justify-between items-center px-6 py-4 md:px-8 md:py-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                  <HeartHandshake size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                    {selectedVisita ? 'Atualizar Atendimento / Visita' : 'Novo Atendimento Pastoral'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Preencha os dados completos da assistência eclesiástica.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                title="Fechar formulário"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulário com Área Roolável Interna */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 md:p-8 overflow-y-auto space-y-4 flex-1">
                {/* Seleção de membro se houver */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Vincular a um Membro (Opcional)
                    </label>
                    <select
                      value={formData.membro_id || ''}
                      onChange={e => handleMembroSelect(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    >
                      <option value="">-- Selecionar Membro Cadastrado --</option>
                      {(db.membros || []).map((m: any) => (
                        <option key={m.id} value={m.id}>{m.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Tipo de Assistência
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={e => setFormData({ ...formData, tipo: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    >
                      <option value="domiciliar">Visita Domiciliar Regular</option>
                      <option value="hospitalar">Visita Hospitalar / Leito</option>
                      <option value="enfermo">Oração por Enfermo no Lar (Tiago 5:14)</option>
                      <option value="aconselhamento">Aconselhamento no Gabinete</option>
                      <option value="luto">Apoio a Família Enlutada</option>
                      <option value="novo_convertido">Discipulado de Novo Convertido</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Nome do Assistido / Família *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome_assistido || ''}
                      onChange={e => setFormData({ ...formData, nome_assistido: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                      placeholder="Nome completo do irmão ou família"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Telefone de Contato
                    </label>
                    <input
                      type="text"
                      value={formData.telefone || ''}
                      onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Endereço / Local da Visita
                  </label>
                  <input
                    type="text"
                    value={formData.endereco || ''}
                    onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    placeholder="Rua, número, hospital/quarto ou templo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Data *</label>
                    <input
                      type="date"
                      required
                      value={formData.data || ''}
                      onChange={e => setFormData({ ...formData, data: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Hora</label>
                    <input
                      type="time"
                      value={formData.hora || ''}
                      onChange={e => setFormData({ ...formData, hora: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    >
                      <option value="agendada">Agendada</option>
                      <option value="realizada">Realizada / Concluída</option>
                      <option value="remarcada">Remarcada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Pastor / Líder Responsável
                    </label>
                    <input
                      type="text"
                      value={formData.pastor_responsavel || ''}
                      onChange={e => setFormData({ ...formData, pastor_responsavel: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Acompanhantes (Obreiros / Diaconato)
                    </label>
                    <input
                      type="text"
                      value={formData.acompanhantes || ''}
                      onChange={e => setFormData({ ...formData, acompanhantes: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                      placeholder="Ex: Ev. Marcos e Dca. Sara"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Motivo da Solicitação ou Demanda
                  </label>
                  <textarea
                    rows={2}
                    value={formData.motivo_demanda || ''}
                    onChange={e => setFormData({ ...formData, motivo_demanda: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none resize-none"
                    placeholder="Descreva resumidamente o motivo da visita ou aconselhamento"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Motivos Específicos para Intercessão / Oração
                  </label>
                  <input
                    type="text"
                    value={formData.pedidos_oracao || ''}
                    onChange={e => setFormData({ ...formData, pedidos_oracao: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none"
                    placeholder="Ex: Cura de enfermidade, causas jurídicas, restauração familiar"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Relato do Atendimento / Desfecho Pastoral
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-amber-600 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sigiloso || false}
                        onChange={e => setFormData({ ...formData, sigiloso: e.target.checked })}
                        className="rounded text-amber-600"
                      />
                      <Lock size={12} /> Marcar como Sigilo Pastoral Absoluto
                    </label>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.relato_atendimento || ''}
                    onChange={e => setFormData({ ...formData, relato_atendimento: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none resize-none"
                    placeholder="Observações do pastor, passagens bíblicas lidas, aconselhamento ministrado..."
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.retorno_necessario || false}
                      onChange={e => setFormData({ ...formData, retorno_necessario: e.target.checked })}
                      className="rounded text-rose-600"
                    />
                    Exige Visita de Retorno ou Acompanhamento Contínuo
                  </label>
                  {formData.retorno_necessario && (
                    <input
                      type="date"
                      value={formData.data_retorno || ''}
                      onChange={e => setFormData({ ...formData, data_retorno: e.target.value })}
                      className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Footer Fixo */}
              <div className="flex justify-between items-center px-6 py-4 md:px-8 md:py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 shrink-0">
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  * Campos necessários para o arquivo pastoral
                </span>
                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <Button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-2.5 px-6 rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check size={16} /> Salvar Atendimento
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* PRINT TEMPLATE (Hidden from screen, visible on window.print) */}
      {selectedForPrint && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 text-black z-[999999]">
          <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold uppercase">{db.igreja?.nome || 'IGREJA EVANGÉLICA ASSEMBLEIA DE DEUS'}</h1>
              <p className="text-xs uppercase tracking-wider text-gray-600">Ministério Pastoral - Ficha de Atendimento e Visita Eclesiástica</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold border border-black px-2 py-1">{selectedForPrint.id}</span>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 border p-3">
              <div><strong>Assistido:</strong> {selectedForPrint.nome_assistido}</div>
              <div><strong>Telefone:</strong> {selectedForPrint.telefone || 'Não informado'}</div>
              <div className="col-span-2"><strong>Endereço / Local:</strong> {selectedForPrint.endereco || 'Não informado'}</div>
              <div><strong>Data / Hora:</strong> {selectedForPrint.data} às {selectedForPrint.hora}</div>
              <div><strong>Modalidade:</strong> {selectedForPrint.tipo.toUpperCase()}</div>
            </div>

            <div className="border p-3">
              <strong>Equipe Pastoral / Responsável:</strong> {selectedForPrint.pastor_responsavel}
              {selectedForPrint.acompanhantes && <div><strong>Acompanhantes:</strong> {selectedForPrint.acompanhantes}</div>}
            </div>

            <div className="border p-3 min-h-[80px]">
              <strong>Motivo da Assistência:</strong>
              <p className="mt-1 text-gray-800">{selectedForPrint.motivo_demanda || 'Atendimento de rotina e comunhão no lar.'}</p>
            </div>

            <div className="border p-3 min-h-[80px]">
              <strong>Pedidos de Intercessão:</strong>
              <p className="mt-1 text-gray-800">{selectedForPrint.pedidos_oracao || 'Fortalecimento espiritual e saúde.'}</p>
            </div>

            <div className="border p-3 min-h-[100px]">
              <strong>Relato do Atendimento & Encaminhamentos:</strong>
              <p className="mt-1 text-gray-800">
                {selectedForPrint.sigiloso ? '[REGISTRO SOB SIGILO PASTORAL - ARQUIVO RESTRITO AO GABINETE]' : (selectedForPrint.relato_atendimento || 'Visita realizada com sucesso.')}
              </p>
            </div>

            <div className="pt-16 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="border-t border-black pt-2">
                <strong>Assinatura do Pastor / Dirigente</strong>
              </div>
              <div className="border-t border-black pt-2">
                <strong>Assinatura do Membro / Familiar</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
