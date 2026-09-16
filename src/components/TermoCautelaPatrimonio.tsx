import React, { useState, useContext, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Package, ShieldAlert, FileText, Printer, Plus, Search, Filter, 
  CheckCircle, AlertTriangle, ArrowRightLeft, UserCheck, Calendar,
  Download, QrCode, Clock, Tag, MapPin, X, Check, FileCheck, RefreshCw,
  Sliders, Camera, ShieldCheck
} from 'lucide-react';
import { ChurchContext, Button } from '../App';

export interface TermoCautelaPatrimonio {
  id: string; // Ex: CAU-2026-001
  patrimonio_id: string;
  patrimonio_nome: string;
  tombo: string;
  numero_serie?: string;
  responsavel_nome: string;
  responsavel_cargo?: string;
  responsavel_cpf?: string;
  responsavel_telefone?: string;
  departamento?: string; // ex: Sonoplastia, Louvor, EBD, Gabinete
  data_retirada: string;
  data_prevista_devolucao: string;
  data_devolucao_real?: string;
  finalidade: string; // ex: Culto ao ar livre na praça, Encontro de jovens, Manutenção externa
  estado_entrega: 'Novo' | 'Excelente' | 'Bom' | 'Regular com marcas de uso';
  estado_devolucao?: 'Em perfeitas condições' | 'Avariado' | 'Pendente';
  observacoes?: string;
  status: 'ativo' | 'devolvido' | 'atrasado' | 'avariado';
  assinatura_confirmada: boolean;
  created_at: string;
}

interface TermoCautelaManagerProps {
  initialPatrimonioId?: string;
  onClose?: () => void;
}

export const TermoCautelaManager: React.FC<TermoCautelaManagerProps> = ({ initialPatrimonioId, onClose }) => {
  const { db, addToast } = useContext(ChurchContext);

  const STORAGE_KEY = 'ad_termos_cautela_patrimonio_v1';

  const [termos, setTermos] = useState<TermoCautelaPatrimonio[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Exemplos iniciais
    return [
      {
        id: 'CAU-2026-001',
        patrimonio_id: 'pat-001',
        patrimonio_nome: 'Mesa de Som Digital Behringer X32',
        tombo: 'PAT-0452',
        numero_serie: 'SN-X32-998241',
        responsavel_nome: 'Dc. Thiago Oliveira (Sonoplastia)',
        responsavel_cargo: 'Líder da Sonoplastia & Multimídia',
        responsavel_cpf: '234.567.890-12',
        responsavel_telefone: '(11) 98822-1144',
        departamento: 'Mídia & Sonoplastia',
        data_retirada: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        data_prevista_devolucao: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        finalidade: 'Cruzada Evangelística no Bairro da Esperança',
        estado_entrega: 'Excelente',
        observacoes: 'Acompanha case rígido, cabo de força e cabo de rede ethercon 50m.',
        status: 'ativo',
        assinatura_confirmada: true,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'CAU-2026-002',
        patrimonio_id: 'pat-002',
        patrimonio_nome: 'Projetor Epson Laser 5000 Lumens Full HD',
        tombo: 'PAT-0210',
        numero_serie: 'EP-5000-8812',
        responsavel_nome: 'Ev. Rodrigo Martins',
        responsavel_cargo: 'Superintendente EBD',
        responsavel_cpf: '345.678.901-23',
        responsavel_telefone: '(11) 97711-2233',
        departamento: 'Escola Bíblica Dominical (EBD)',
        data_retirada: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
        data_prevista_devolucao: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        finalidade: 'Simpósio Teológico de Férias na Congregação Monte Sião',
        estado_entrega: 'Excelente',
        observacoes: 'Acompanha controle remoto e cabo HDMI 15 metros.',
        status: 'atrasado',
        assinatura_confirmada: true,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      }
    ];
  });

  const saveTermos = (newList: TermoCautelaPatrimonio[]) => {
    setTermos(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTermo, setSelectedTermo] = useState<TermoCautelaPatrimonio | null>(null);
  const [termoParaImpressao, setTermoParaImpressao] = useState<TermoCautelaPatrimonio | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<TermoCautelaPatrimonio>>({
    data_retirada: new Date().toISOString().split('T')[0],
    data_prevista_devolucao: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    estado_entrega: 'Excelente',
    status: 'ativo',
    assinatura_confirmada: true,
  });

  // Pre-fill if initialPatrimonioId
  React.useEffect(() => {
    if (initialPatrimonioId) {
      const item = (db.patrimonio || []).find((p: any) => p.id === initialPatrimonioId);
      if (item) {
        setFormData(prev => ({
          ...prev,
          patrimonio_id: item.id,
          patrimonio_nome: item.nome,
          tombo: item.tombo || `PAT-${item.id.slice(-4)}`,
        }));
        setIsModalOpen(true);
      }
    }
  }, [initialPatrimonioId, db.patrimonio]);

  const filteredTermos = useMemo(() => {
    return termos.filter(t => {
      const matchSearch = t.patrimonio_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tombo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.responsavel_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.departamento && t.departamento.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = filterStatus === 'todos' || t.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [termos, searchTerm, filterStatus]);

  const handleOpenNew = () => {
    setFormData({
      id: `CAU-${new Date().getFullYear()}-${String(termos.length + 1).padStart(3, '0')}`,
      patrimonio_id: '',
      patrimonio_nome: '',
      tombo: '',
      numero_serie: '',
      responsavel_nome: '',
      responsavel_cargo: '',
      responsavel_cpf: '',
      responsavel_telefone: '',
      departamento: 'Sonoplastia & Multimídia',
      data_retirada: new Date().toISOString().split('T')[0],
      data_prevista_devolucao: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      finalidade: 'Uso eclesiástico em evento oficial da igreja',
      estado_entrega: 'Excelente',
      observacoes: '',
      status: 'ativo',
      assinatura_confirmada: true,
      created_at: new Date().toISOString()
    });
    setSelectedTermo(null);
    setIsModalOpen(true);
  };

  const handleSelectPatrimonio = (id: string) => {
    const item = (db.patrimonio || []).find((p: any) => p.id === id);
    if (item) {
      setFormData(prev => ({
        ...prev,
        patrimonio_id: item.id,
        patrimonio_nome: item.nome,
        tombo: item.tombo || `PAT-${item.id.slice(-4)}`,
        numero_serie: item.serie || item.numero_serie || ''
      }));
    }
  };

  const handleSelectMembro = (id: string) => {
    const membro = (db.membros || []).find((m: any) => m.id === id);
    if (membro) {
      setFormData(prev => ({
        ...prev,
        responsavel_nome: membro.nome,
        responsavel_cargo: membro.cargo || membro.funcao || 'Membro / Cooperador',
        responsavel_cpf: membro.cpf || '',
        responsavel_telefone: membro.telefone || ''
      }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patrimonio_nome || !formData.responsavel_nome || !formData.data_prevista_devolucao) {
      addToast('Preencha os campos obrigatórios do termo de cautela.', 'warning');
      return;
    }

    if (selectedTermo) {
      const updated = termos.map(t => t.id === selectedTermo.id ? { ...t, ...(formData as TermoCautelaPatrimonio) } : t);
      saveTermos(updated);
      addToast('Termo de Cautela atualizado!', 'success');
    } else {
      const novo: TermoCautelaPatrimonio = {
        ...(formData as TermoCautelaPatrimonio),
        id: formData.id || `CAU-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        created_at: new Date().toISOString()
      };
      saveTermos([novo, ...termos]);
      addToast('Termo de Cautela emitido com sucesso!', 'success');
    }
    setIsModalOpen(false);
  };

  const handleRegistrarDevolucao = (termo: TermoCautelaPatrimonio) => {
    const dataHoje = new Date().toISOString().split('T')[0];
    const updated = termos.map(t => {
      if (t.id === termo.id) {
        return {
          ...t,
          status: 'devolvido' as const,
          data_devolucao_real: dataHoje,
          estado_devolucao: 'Em perfeitas condições' as const
        };
      }
      return t;
    });
    saveTermos(updated);
    addToast(`Devolução do bem ${termo.patrimonio_nome} confirmada e registrada no inventário!`, 'success');
  };

  const handlePrintTermo = (termo: TermoCautelaPatrimonio) => {
    setTermoParaImpressao(termo);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo': return <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-blue-100 text-blue-800">Emprestado (Em Aberto)</span>;
      case 'devolvido': return <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-emerald-100 text-emerald-800">Devolvido</span>;
      case 'atrasado': return <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-rose-100 text-rose-800 animate-pulse">Devolução Atrasada</span>;
      default: return <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-amber-100 text-amber-800">Com Avaria</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
            <ShieldAlert size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Termos de Cautela & Empréstimo de Bens</h2>
              <span className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Inventário Oficial
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Controle de responsabilidade civil e eclesiástica sobre instrumentos, caixas de som, projetores e ferramentas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            onClick={handleOpenNew}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md shadow-teal-500/20 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Emitir Novo Termo de Cautela
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

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total de Termos</div>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">{termos.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-blue-600">Equipamentos Fora</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {termos.filter(t => t.status === 'ativo').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-rose-600">Atrasados no Retorno</div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {termos.filter(t => t.status === 'atrasado').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Devolvidos com Sucesso</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {termos.filter(t => t.status === 'devolvido').length}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por equipamento, tombo, responsável ou departamento..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
        >
          <option value="todos">Todos os Status</option>
          <option value="ativo">Emprestados (Ativos)</option>
          <option value="atrasado">Atrasados</option>
          <option value="devolvido">Devolvidos</option>
          <option value="avariado">Com Avaria</option>
        </select>
      </div>

      {/* Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTermos.map(termo => (
          <div
            key={termo.id}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-xs hover:border-teal-300 dark:hover:border-teal-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                  {termo.id}
                </span>
                {getStatusBadge(termo.status)}
              </div>

              <div>
                <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag size={12} /> Tombo: {termo.tombo || 'S/N'}
                </div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white line-clamp-1 mt-0.5">
                  {termo.patrimonio_nome}
                </h3>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl space-y-1.5 text-xs">
                <div className="text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5">
                  <UserCheck size={14} className="text-teal-500" />
                  <span className="truncate">{termo.responsavel_nome}</span>
                </div>
                {termo.responsavel_cargo && (
                  <div className="text-slate-400 text-[11px] ml-5">{termo.responsavel_cargo}</div>
                )}
                {termo.departamento && (
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] ml-5">
                    Depto: <span className="font-semibold">{termo.departamento}</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Retirada:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{termo.data_retirada}</span>
                </div>
                <div className="flex justify-between">
                  <span>Previsão Devolução:</span>
                  <span className={`font-bold ${termo.status === 'atrasado' ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'}`}>
                    {termo.data_prevista_devolucao}
                  </span>
                </div>
                {termo.data_devolucao_real && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Devolvido em:</span>
                    <span>{termo.data_devolucao_real}</span>
                  </div>
                )}
              </div>

              {termo.finalidade && (
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold">Finalidade: </span>
                  <span className="line-clamp-2">{termo.finalidade}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3 mt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => handlePrintTermo(termo)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
                title="Imprimir Termo de Cautela Timbrado"
              >
                <Printer size={16} />
              </button>

              <div className="flex items-center gap-1.5">
                {termo.status !== 'devolvido' && (
                  <button
                    onClick={() => handleRegistrarDevolucao(termo)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    title="Baixar Cautela e Confirmar Devolução do Equipamento"
                  >
                    <CheckCircle size={13} /> Devolver
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedTermo(termo);
                    setFormData({ ...termo });
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-teal-50 hover:text-teal-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredTermos.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <Package size={48} className="mx-auto mb-3 text-slate-300 opacity-60" />
            <p className="font-bold text-base">Nenhum termo de cautela encontrado.</p>
            <p className="text-xs mt-1">Clique em "Emitir Novo Termo de Cautela" para registrar a saída de equipamentos.</p>
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
                <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                    {selectedTermo ? 'Editar Termo de Cautela' : 'Emissão de Termo de Cautela'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Controle de responsabilidade e guarda temporária de bens.</p>
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

            {/* Formulário com Área Rolável Interna */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 md:p-8 overflow-y-auto space-y-4 flex-1">
              {/* Seleção de Bem do Patrimônio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Selecionar do Inventário Existente
                  </label>
                  <select
                    value={formData.patrimonio_id || ''}
                    onChange={e => handleSelectPatrimonio(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="">-- Escolher Bem Tombado --</option>
                    {(db.patrimonio || []).map((p: any) => (
                      <option key={p.id} value={p.id}>{p.tombo ? `[${p.tombo}] ` : ''}{p.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Nome do Bem / Equipamento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patrimonio_nome || ''}
                    onChange={e => setFormData({ ...formData, patrimonio_nome: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    placeholder="Ex: Microfone Sem Fio Shure SM58"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Número de Tombo / Plaqueta
                  </label>
                  <input
                    type="text"
                    value={formData.tombo || ''}
                    onChange={e => setFormData({ ...formData, tombo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    placeholder="Ex: PAT-0192"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Número de Série
                  </label>
                  <input
                    type="text"
                    value={formData.numero_serie || ''}
                    onChange={e => setFormData({ ...formData, numero_serie: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    placeholder="Ex: SN-128830129"
                  />
                </div>
              </div>

              {/* Responsável */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Vincular Responsável (Membro)
                  </label>
                  <select
                    onChange={e => handleSelectMembro(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="">-- Selecionar Membro Responsável --</option>
                    {(db.membros || []).map((m: any) => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Nome Completo do Cautelado *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.responsavel_nome || ''}
                    onChange={e => setFormData({ ...formData, responsavel_nome: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">CPF</label>
                  <input
                    type="text"
                    value={formData.responsavel_cpf || ''}
                    onChange={e => setFormData({ ...formData, responsavel_cpf: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.responsavel_telefone || ''}
                    onChange={e => setFormData({ ...formData, responsavel_telefone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Departamento</label>
                  <input
                    type="text"
                    value={formData.departamento || ''}
                    onChange={e => setFormData({ ...formData, departamento: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                    placeholder="Ex: Louvor, Multimídia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Data de Retirada</label>
                  <input
                    type="date"
                    required
                    value={formData.data_retirada || ''}
                    onChange={e => setFormData({ ...formData, data_retirada: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Previsão Devolução *</label>
                  <input
                    type="date"
                    required
                    value={formData.data_prevista_devolucao || ''}
                    onChange={e => setFormData({ ...formData, data_prevista_devolucao: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Estado na Entrega</label>
                  <select
                    value={formData.estado_entrega}
                    onChange={e => setFormData({ ...formData, estado_entrega: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="Novo">Novo (Na caixa)</option>
                    <option value="Excelente">Excelente (Sem detalhes)</option>
                    <option value="Bom">Bom estado de conservação</option>
                    <option value="Regular com marcas de uso">Regular com marcas de uso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Finalidade / Motivo da Retirada</label>
                <input
                  type="text"
                  value={formData.finalidade || ''}
                  onChange={e => setFormData({ ...formData, finalidade: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  placeholder="Ex: Culto evangelístico de rua, ensaio extraordinário..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Acessórios Inclusos e Observações</label>
                <textarea
                  rows={2}
                  value={formData.observacoes || ''}
                  onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none resize-none"
                  placeholder="Ex: Cabos, fonte bivolt, case de transporte rígido, pedestal..."
                />
              </div>

              </div>

              {/* Footer Fixo */}
              <div className="flex justify-between items-center px-6 py-4 md:px-8 md:py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 shrink-0">
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  * Campos necessários para emissão e assinatura do termo
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
                    className="bg-teal-600 hover:bg-teal-700 text-white font-black text-xs py-2.5 px-6 rounded-xl shadow-lg shadow-teal-600/25 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check size={16} /> Salvar Termo
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* PRINT SHEET - TERMO DE CAUTELA TIMBRADO */}
      {termoParaImpressao && (
        <div className="hidden print:block fixed inset-0 bg-white p-10 text-black z-[999999]">
          <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold uppercase">{db.igreja?.nome || 'IGREJA EVANGÉLICA ASSEMBLEIA DE DEUS'}</h1>
              <p className="text-xs uppercase tracking-wider text-gray-700">Departamento de Patrimônio & Almoxarifado Central</p>
              <p className="text-sm font-bold text-gray-900 mt-1">TERMO DE CAUTELA, GUARDA E RESPONSABILIDADE PATRIMONIAL</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold border-2 border-black px-3 py-1.5">{termoParaImpressao.id}</span>
              <div className="text-[10px] mt-1 text-gray-500">Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <p className="text-justify leading-relaxed">
              Pelo presente instrumento de cautela e responsabilidade, o(a) abaixo qualificado(a) declara haver recebido da <strong>{db.igreja?.nome || 'Igreja'}</strong>, a título de empréstimo e guarda provisória, para uso estritamente funcional nas atividades eclesiásticas, o bem móvel discriminado a seguir:
            </p>

            <div className="border border-black p-3 space-y-2">
              <div className="font-bold uppercase border-b border-gray-300 pb-1 text-gray-800">1. Discriminação do Bem e Estado Físico</div>
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Equipamento:</strong> {termoParaImpressao.patrimonio_nome}</div>
                <div><strong>Tombo Patrimonial:</strong> {termoParaImpressao.tombo || 'S/N'}</div>
                <div><strong>Número de Série:</strong> {termoParaImpressao.numero_serie || 'Não especificado'}</div>
                <div><strong>Estado de Conservação:</strong> {termoParaImpressao.estado_entrega}</div>
                <div className="col-span-2"><strong>Acessórios / Componentes:</strong> {termoParaImpressao.observacoes || 'Nenhum acessório extra.'}</div>
              </div>
            </div>

            <div className="border border-black p-3 space-y-2">
              <div className="font-bold uppercase border-b border-gray-300 pb-1 text-gray-800">2. Qualificação do Cautelado (Responsável)</div>
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Nome Completo:</strong> {termoParaImpressao.responsavel_nome}</div>
                <div><strong>Função / Cargo:</strong> {termoParaImpressao.responsavel_cargo || 'Membro Colaborador'}</div>
                <div><strong>CPF:</strong> {termoParaImpressao.responsavel_cpf || 'Não informado'}</div>
                <div><strong>Telefone:</strong> {termoParaImpressao.responsavel_telefone || 'Não informado'}</div>
                <div className="col-span-2"><strong>Departamento Solicitante:</strong> {termoParaImpressao.departamento || 'Geral'}</div>
              </div>
            </div>

            <div className="border border-black p-3 space-y-2">
              <div className="font-bold uppercase border-b border-gray-300 pb-1 text-gray-800">3. Prazos e Condições do Empréstimo</div>
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Data de Retirada:</strong> {termoParaImpressao.data_retirada}</div>
                <div><strong>Data Limite para Devolução:</strong> {termoParaImpressao.data_prevista_devolucao}</div>
                <div className="col-span-2"><strong>Finalidade Autorizada:</strong> {termoParaImpressao.finalidade}</div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-300 text-[11px] leading-relaxed text-justify space-y-1">
              <strong>CLÁUSULAS DE RESPONSABILIDADE:</strong>
              <p>
                1. O Cautelado compromete-se a zelar pelo bem como se seu fosse, guardando-o em local seguro e protegido de intempéries ou riscos.
              </p>
              <p>
                2. Em caso de dano por dolo, negligência, imperícia ou extravio culposo, o responsável compromete-se a custear o devido reparo ou a substituição por bem equivalente.
              </p>
              <p>
                3. A devolução deverá ocorrer na data estipulada perante conferência do responsável pelo patrimônio eclesiástico.
              </p>
            </div>

            <div className="pt-20 grid grid-cols-2 gap-10 text-center text-xs">
              <div className="border-t border-black pt-2">
                <strong>Assinatura do Cautelado (Responsável)</strong>
                <div className="text-[10px] text-gray-600">{termoParaImpressao.responsavel_nome}</div>
              </div>
              <div className="border-t border-black pt-2">
                <strong>Responsável pelo Patrimônio / Pastor</strong>
                <div className="text-[10px] text-gray-600">{db.pastor || 'Diretoria Administrativa'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
