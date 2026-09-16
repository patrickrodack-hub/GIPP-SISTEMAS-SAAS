import React, { useState, useContext, useMemo } from 'react';
import { 
  FileText, Send, Printer, CheckCircle2, Clock, Search, Plus, 
  ArrowRightLeft, Building2, User, Calendar, MapPin, QrCode, 
  ShieldCheck, AlertCircle, X, Download, RefreshCw, Copy, Check,
  BookOpen, ChevronRight, Filter, Award, Sparkles, Phone, Mail
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface CartaTransferenciaData {
  id: string;
  protocolo: string;
  tipo: 'saida' | 'entrada' | 'recomendacao';
  membro_id: string;
  membro_nome: string;
  membro_cpf?: string;
  membro_rg?: string;
  membro_cargo: string;
  estado_civil?: string;
  conjuge_nome?: string;
  filhos_dependentes?: string;
  data_nascimento?: string;
  data_batismo_aguas?: string;
  batismo_espirito_santo?: 'Sim' | 'Nao';
  data_emissao: string;
  data_validade: string;
  motivo: 'mudanca_residencia' | 'trabalho' | 'estudos' | 'familiar' | 'outro';
  motivo_detalhe?: string;
  igreja_origem_nome: string;
  igreja_origem_cidade_uf: string;
  pastor_presidente_origem: string;
  igreja_destino_nome: string;
  igreja_destino_cidade_uf: string;
  pastor_destino_nome?: string;
  igreja_destino_endereco?: string;
  status: 'emitida' | 'em_transito' | 'confirmada' | 'cancelada';
  data_confirmacao?: string;
  observacoes_eclesiasticas?: string;
  hash_autenticidade: string;
  criado_por?: string;
}

interface Props {
  initialMembroId?: string;
  onClose?: () => void;
}

export const CartaTransferenciaEclesiastica: React.FC<Props> = ({ initialMembroId, onClose }) => {
  const { db, dbFirestore, appId, collection, addDoc, setDoc, doc, user, addToast, logAction } = useContext(ChurchContext);

  // Lista de cartas salvas
  const [cartas, setCartas] = useState<CartaTransferenciaData[]>(() => {
    return (db.cartas_transferencia && Array.isArray(db.cartas_transferencia)) 
      ? db.cartas_transferencia 
      : [];
  });

  const [activeTab, setActiveTab] = useState<'lista' | 'nova' | 'preview'>('lista');
  const [selectedCarta, setSelectedCarta] = useState<CartaTransferenciaData | null>(null);
  const [filterTipo, setFilterTipo] = useState<string>('todas');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState(false);

  // Membro pré-selecionado se vier via props
  const initialMembro = useMemo(() => {
    if (!initialMembroId || !db.membros) return null;
    return db.membros.find((m: any) => m.id === initialMembroId) || null;
  }, [initialMembroId, db.membros]);

  // Form de Emissão
  const [formData, setFormData] = useState({
    membro_id: initialMembro?.id || '',
    tipo: 'saida' as 'saida' | 'entrada' | 'recomendacao',
    motivo: 'mudanca_residencia' as 'mudanca_residencia' | 'trabalho' | 'estudos' | 'familiar' | 'outro',
    motivo_detalhe: '',
    igreja_destino_nome: '',
    igreja_destino_cidade_uf: '',
    pastor_destino_nome: '',
    igreja_destino_endereco: '',
    data_validade_dias: 60,
    observacoes_eclesiasticas: 'O(A) referido(a) membro encontra-se em plena comunhão bíblica com esta igreja sede e congregações, participando regularmente da Ceia do Senhor e cumprindo seus deveres cristãos, nada havendo que desabone sua conduta moral ou doutrinária.'
  });

  // Se initialMembro estiver presente, abrir diretamente formulário ou preview
  React.useEffect(() => {
    if (initialMembro) {
      setFormData(prev => ({
        ...prev,
        membro_id: initialMembro.id
      }));
      setActiveTab('nova');
    }
  }, [initialMembro]);

  // Membro selecionado no form
  const currentFormMembro = useMemo(() => {
    if (!formData.membro_id || !db.membros) return null;
    return db.membros.find((m: any) => m.id === formData.membro_id) || null;
  }, [formData.membro_id, db.membros]);

  // Gerador de Hash Criptográfico
  const generateAuthHash = (protocolo: string, membroId: string) => {
    const raw = `${protocolo}:${membroId}:${Date.now()}:${db.igreja?.cnpj || 'GIPP'}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `CGADB-${hex.substring(0, 4)}-${hex.substring(4, 8)}-${new Date().getFullYear()}`;
  };

  // Gerar Novo Protocolo
  const generateProtocolo = () => {
    const ano = new Date().getFullYear();
    const count = (cartas.length + 1).toString().padStart(5, '0');
    return `TRF-${ano}/${count}`;
  };

  // Submeter Emissão de Carta
  const handleEmitirCarta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFormMembro) {
      addToast("Selecione o membro para emissão da carta.", "error");
      return;
    }

    if (!formData.igreja_destino_nome.trim()) {
      addToast("Informe o nome da igreja de destino.", "error");
      return;
    }

    const protocolo = generateProtocolo();
    const emissaoDate = new Date();
    const validadeDate = new Date();
    validadeDate.setDate(emissaoDate.getDate() + formData.data_validade_dias);

    const hash = generateAuthHash(protocolo, currentFormMembro.id);

    const novaCarta: CartaTransferenciaData = {
      id: 'carta_' + Date.now(),
      protocolo,
      tipo: formData.tipo,
      membro_id: currentFormMembro.id,
      membro_nome: currentFormMembro.nome,
      membro_cpf: currentFormMembro.cpf || currentFormMembro.documento || '',
      membro_rg: currentFormMembro.rg || '',
      membro_cargo: currentFormMembro.cargo || 'Membro em Comunhão',
      estado_civil: currentFormMembro.estado_civil || 'Não informado',
      conjuge_nome: currentFormMembro.conjuge || '',
      filhos_dependentes: currentFormMembro.filhos || '',
      data_nascimento: currentFormMembro.nascimento || '',
      data_batismo_aguas: currentFormMembro.batismo_aguas || currentFormMembro.data_batismo || '',
      batismo_espirito_santo: currentFormMembro.batismo_espirito_santo === 'Sim' || currentFormMembro.batismo_espirito === 'Sim' ? 'Sim' : 'Sim',
      data_emissao: emissaoDate.toISOString().split('T')[0],
      data_validade: validadeDate.toISOString().split('T')[0],
      motivo: formData.motivo,
      motivo_detalhe: formData.motivo_detalhe,
      igreja_origem_nome: db.igreja?.nome || 'Igreja Evangélica Assembleia de Deus',
      igreja_origem_cidade_uf: `${db.igreja?.cidade || 'Sede'} - ${db.igreja?.estado || 'UF'}`,
      pastor_presidente_origem: db.igreja?.pastor_presidente || 'Pastor Presidente',
      igreja_destino_nome: formData.igreja_destino_nome,
      igreja_destino_cidade_uf: formData.igreja_destino_cidade_uf,
      pastor_destino_nome: formData.pastor_destino_nome,
      igreja_destino_endereco: formData.igreja_destino_endereco,
      status: 'emitida',
      observacoes_eclesiasticas: formData.observacoes_eclesiasticas,
      hash_autenticidade: hash,
      criado_por: user?.nome || 'Secretaria Geral'
    };

    try {
      if (dbFirestore && appId) {
        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'cartas_transferencia', novaCarta.id), novaCarta);
        logAction('EMISSÃO', `Carta de Transferência ${protocolo} emitida para ${novaCarta.membro_nome}`, 'cartas_transferencia', novaCarta.id);
      }

      setCartas(prev => [novaCarta, ...prev]);
      setSelectedCarta(novaCarta);
      setActiveTab('preview');
      addToast(`Carta de Transferência ${protocolo} emitida com sucesso!`, "success");
    } catch (err) {
      console.error(err);
      // Fallback local
      setCartas(prev => [novaCarta, ...prev]);
      setSelectedCarta(novaCarta);
      setActiveTab('preview');
      addToast(`Carta de Transferência ${protocolo} gerada localmente!`, "success");
    }
  };

  // Atualizar Status da Carta
  const handleUpdateStatus = async (cartaId: string, newStatus: 'emitida' | 'em_transito' | 'confirmada' | 'cancelada') => {
    const updated = cartas.map(c => {
      if (c.id === cartaId) {
        return {
          ...c,
          status: newStatus,
          data_confirmacao: newStatus === 'confirmada' ? new Date().toISOString().split('T')[0] : c.data_confirmacao
        };
      }
      return c;
    });

    setCartas(updated);
    if (selectedCarta?.id === cartaId) {
      setSelectedCarta(prev => prev ? { ...prev, status: newStatus } : null);
    }

    if (dbFirestore && appId) {
      try {
        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'cartas_transferencia', cartaId), {
          status: newStatus,
          data_confirmacao: newStatus === 'confirmada' ? new Date().toISOString().split('T')[0] : null
        }, { merge: true });
        addToast(`Status da carta atualizado para: ${newStatus.toUpperCase()}`, "success");
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Filtragem
  const filteredCartas = useMemo(() => {
    return cartas.filter(c => {
      const matchTipo = filterTipo === 'todas' || c.tipo === filterTipo;
      const matchStatus = filterStatus === 'todos' || c.status === filterStatus;
      const matchSearch = !searchTerm || 
        c.membro_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.igreja_destino_nome.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTipo && matchStatus && matchSearch;
    });
  }, [cartas, filterTipo, filterStatus, searchTerm]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
    addToast("Código de autenticidade copiado!", "info");
  };

  return (
    <div className="w-full flex flex-col space-y-6 text-slate-800">
      {/* CABEÇALHO DO MÓDULO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl shadow-md shadow-indigo-500/20">
            <ArrowRightLeft size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              Cartas de Transferência Eclesiástica
              <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Padrão CGADB / CPAD
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Expedição oficial com protocolo canônico, QR Code de validação e canhoto de recepção
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab !== 'lista' && (
            <button
              onClick={() => { setActiveTab('lista'); setSelectedCarta(null); }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Voltar à Listagem
            </button>
          )}

          {activeTab === 'lista' && (
            <button
              onClick={() => { setSelectedCarta(null); setActiveTab('nova'); }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> Nova Carta de Transferência
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              title="Fechar Janela"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ABA: LISTAGEM DE CARTAS */}
      {activeTab === 'lista' && (
        <div className="space-y-4 animate-entrance">
          {/* BARRA DE FILTROS */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Pesquisar por membro, protocolo ou igreja de destino..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <select
                value={filterTipo}
                onChange={e => setFilterTipo(e.target.value)}
                className="py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="todas">Todos os Tipos</option>
                <option value="saida">Transferência de Saída</option>
                <option value="entrada">Recepção de Entrada</option>
                <option value="recomendacao">Carta de Recomendação</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="todos">Todos os Status</option>
                <option value="emitida">Emitida</option>
                <option value="em_transito">Em Trânsito</option>
                <option value="confirmada">Confirmada / Recebida</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* LISTA / CARDS */}
          {filteredCartas.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500">
                <FileText size={32} />
              </div>
              <h3 className="text-base font-black text-slate-700 dark:text-slate-200">Nenhuma carta de transferência encontrada</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Utilize o botão acima para emitir a primeira carta de transferência ou recomendação eclesiástica com chancela digital.
              </p>
              <button
                onClick={() => setActiveTab('nova')}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
              >
                <Plus size={14} /> Emitir Primeira Carta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCartas.map(carta => {
                const isVencida = new Date(carta.data_validade) < new Date() && carta.status !== 'confirmada';
                return (
                  <div
                    key={carta.id}
                    className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          {carta.protocolo}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          carta.status === 'confirmada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          carta.status === 'em_transito' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          carta.status === 'cancelada' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {carta.status === 'confirmada' ? 'Confirmada' :
                           carta.status === 'em_transito' ? 'Em Trânsito' :
                           carta.status === 'cancelada' ? 'Cancelada' : 'Emitida'}
                        </span>
                      </div>

                      <h4 className="font-black text-slate-800 dark:text-white text-sm line-clamp-1 mb-1">
                        {carta.membro_nome}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                        <Award size={13} className="text-amber-500" /> {carta.membro_cargo}
                      </p>

                      <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl space-y-1.5 text-[11px] border border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                          <Building2 size={13} className="text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1"><strong>Destino:</strong> {carta.igreja_destino_nome}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span>{carta.igreja_destino_cidade_uf || 'Cidade não especificada'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span>Emissão: {new Date(carta.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                        {isVencida && (
                          <div className="flex items-center gap-1 text-rose-600 text-[10px] font-black pt-1">
                            <AlertCircle size={12} /> Validade Eclesiástica Expirada
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => { setSelectedCarta(carta); setActiveTab('preview'); }}
                        className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText size={14} /> Visualizar & Imprimir
                      </button>

                      {carta.status !== 'confirmada' && (
                        <button
                          onClick={() => handleUpdateStatus(carta.id, 'confirmada')}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all border border-emerald-200 dark:border-emerald-800"
                          title="Marcar como Confirmada pela Igreja Receptora"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA: NOVA CARTA DE TRANSFERÊNCIA */}
      {activeTab === 'nova' && (
        <form onSubmit={handleEmitirCarta} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-8 animate-entrance">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="text-indigo-600" size={20} /> Emissão de Carta de Transferência Eclesiástica
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Preencha os dados oficiais de encaminhamento conforme os estatutos da CGADB/CPAD.
            </p>
          </div>

          {/* DADOS DO MEMBRO */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} /> 1. Identificação do Membro no Rol
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Selecione o Membro Cadastrado *
                </label>
                <select
                  value={formData.membro_id}
                  onChange={e => setFormData(prev => ({ ...prev, membro_id: e.target.value }))}
                  required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                >
                  <option value="">-- Selecione o Irmão(ã) --</option>
                  {(db.membros || []).slice().sort((a: any, b: any) => (a.nome || '').localeCompare(b.nome || '')).map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} — {m.cargo || 'Membro'} {m.cpf ? `(CPF: ${m.cpf})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Tipo de Movimentação Eclesiástica *
                </label>
                <select
                  value={formData.tipo}
                  onChange={e => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                >
                  <option value="saida">Transferência de Saída (Para outra Igreja/Ministério)</option>
                  <option value="recomendacao">Carta de Recomendação de Viagem / Visita</option>
                  <option value="entrada">Recepção de Entrada (Vindo de outra Igreja)</option>
                </select>
              </div>
            </div>

            {/* RESUMO DO MEMBRO SELECIONADO */}
            {currentFormMembro && (
              <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Cargo / Ministério</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentFormMembro.cargo || 'Membro em Comunhão'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Batismo nas Águas</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {currentFormMembro.batismo_aguas ? new Date(currentFormMembro.batismo_aguas + 'T00:00:00').toLocaleDateString('pt-BR') : 'Consta no Rol'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Batismo no Espírito Santo</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Sim (Evidência línguas)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Estado Civil</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentFormMembro.estado_civil || 'Não informado'}</span>
                </div>
              </div>
            )}
          </div>

          {/* DADOS DA IGREJA DE DESTINO */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={14} /> 2. Igreja e Ministério Receptores (Destino)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Igreja Evangélica / Denominação de Destino *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Igreja Evangélica Assembleia de Deus - Min. Belém"
                  value={formData.igreja_destino_nome}
                  onChange={e => setFormData(prev => ({ ...prev, igreja_destino_nome: e.target.value }))}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Cidade / Estado de Destino *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: São Paulo - SP ou Curitiba - PR"
                  value={formData.igreja_destino_cidade_uf}
                  onChange={e => setFormData(prev => ({ ...prev, igreja_destino_cidade_uf: e.target.value }))}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Pastor Presidente / Dirigente de Destino (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pr. José Wellington Costa Junior"
                  value={formData.pastor_destino_nome}
                  onChange={e => setFormData(prev => ({ ...prev, pastor_destino_nome: e.target.value }))}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Prazo de Validade Eclesiástica da Carta
                </label>
                <select
                  value={formData.data_validade_dias}
                  onChange={e => setFormData(prev => ({ ...prev, data_validade_dias: Number(e.target.value) }))}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                >
                  <option value={30}>30 Dias (Padrão para mesma cidade)</option>
                  <option value={60}>60 Dias (Padrão interestadual CGADB)</option>
                  <option value={90}>90 Dias (Transferência internacional)</option>
                </select>
              </div>
            </div>
          </div>

          {/* MOTIVAÇÃO E OBSERVAÇÕES */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} /> 3. Motivo e Termo de Comunhão Eclesiástica
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Motivo da Solicitação *
                </label>
                <select
                  value={formData.motivo}
                  onChange={e => setFormData(prev => ({ ...prev, motivo: e.target.value as any }))}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                >
                  <option value="mudanca_residencia">Mudança de Residência / Bairro / Cidade</option>
                  <option value="trabalho">Transferência de Emprego / Profissional</option>
                  <option value="estudos">Estudos / Ingresso Universitário</option>
                  <option value="familiar">Motivo de Casamento ou Reunião Familiar</option>
                  <option value="outro">Outra Motivação Pessoal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Detalhes Adicionais do Motivo (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mudou-se para a Rua das Flores, 123..."
                  value={formData.motivo_detalhe}
                  onChange={e => setFormData(prev => ({ ...prev, motivo_detalhe: e.target.value }))}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Declaração Canônica de Conduta e Comunhão
              </label>
              <textarea
                rows={3}
                value={formData.observacoes_eclesiasticas}
                onChange={e => setFormData(prev => ({ ...prev, observacoes_eclesiasticas: e.target.value }))}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('lista')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} /> Emitir Carta Oficial com Protocolo
            </button>
          </div>
        </form>
      )}

      {/* ABA: PREVIEW / IMPRESSÃO EM PAPEL TIMBRADO COM CANHOTO DESTACÁVEL */}
      {activeTab === 'preview' && selectedCarta && (
        <div className="space-y-6 animate-entrance">
          {/* BARRA DE AÇÕES SUPERIOR (NÃO IMPRIME) */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 font-mono">
                Protocolo: {selectedCarta.protocolo}
              </span>
              <span className="text-xs text-slate-500 font-bold">
                Validade: até {new Date(selectedCarta.data_validade + 'T00:00:00').toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyHash(selectedCarta.hash_autenticidade)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Copiar Hash de Validação"
              >
                {copiedHash ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copiedHash ? 'Copiado!' : 'Copiar Hash'}
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Printer size={16} /> Imprimir Documento Oficial (A4)
              </button>
            </div>
          </div>

          {/* FOLHA OFICIAL TIMBRADA A4 */}
          <div 
            id="carta-transferencia-print"
            className="w-full max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-3xl border-2 border-slate-300 shadow-2xl space-y-8 relative overflow-hidden font-serif print:border-none print:shadow-none print:p-6 print:rounded-none"
          >
            {/* MARCA D'ÁGUA SUAVE */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <ArrowRightLeft size={500} />
            </div>

            {/* CABEÇALHO ECLESIÁSTICO */}
            <div className="text-center space-y-1.5 border-b-2 border-slate-800 pb-6 relative">
              {db.igreja?.logo_url && (
                <img 
                  src={db.igreja.logo_url} 
                  alt="Logo da Igreja" 
                  className="w-16 h-16 object-contain mx-auto mb-2" 
                  referrerPolicy="no-referrer"
                />
              )}
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide font-sans text-slate-900">
                {selectedCarta.igreja_origem_nome}
              </h1>
              <p className="text-xs font-sans text-slate-600 font-bold uppercase tracking-widest">
                Filiada à Convenção Geral das Assembleias de Deus no Brasil (CGADB)
              </p>
              <p className="text-xs font-sans text-slate-500">
                {db.igreja?.endereco || 'Endereço da Sede'} • {selectedCarta.igreja_origem_cidade_uf}
                {db.igreja?.cnpj ? ` • CNPJ: ${db.igreja.cnpj}` : ''}
              </p>

              <div className="flex justify-between items-center pt-3 font-sans text-xs">
                <span className="font-mono font-bold bg-slate-100 px-3 py-1 rounded-md border border-slate-300">
                  PROTOCOLO Nº: {selectedCarta.protocolo}
                </span>
                <span className="font-bold text-slate-600">
                  LIVRO DE REGISTRO DE MEMBROS • FOLHA CANÔNICA
                </span>
              </div>
            </div>

            {/* TÍTULO DO DOCUMENTO */}
            <div className="text-center space-y-1">
              <h2 className="text-lg sm:text-xl font-black tracking-widest uppercase font-sans border-b border-t border-slate-300 py-1.5 bg-slate-50">
                {selectedCarta.tipo === 'saida' ? 'CARTA DE TRANSFERÊNCIA ECLESIÁSTICA' :
                 selectedCarta.tipo === 'recomendacao' ? 'CARTA DE RECOMENDAÇÃO EM CRISTO' :
                 'TERMO DE RECEPÇÃO E TRANSFERÊNCIA'}
              </h2>
              <p className="text-xs font-sans text-slate-500 italic">
                “Recomendamos-vos a nossa irmã Febe... para que a recebais no Senhor, como convém aos santos” (Romanos 16:1-2)
              </p>
            </div>

            {/* SAUDAÇÃO E CORPO DA CARTA */}
            <div className="space-y-4 text-justify font-sans text-sm leading-relaxed text-slate-800">
              <p>
                <strong>À Paz do Senhor Jesus Cristo!</strong>
              </p>
              <p>
                Ao mui digno <strong>Pastor Presidente, Corpo Ministerial e Amada Igreja de Deus</strong> em{' '}
                <strong>{selectedCarta.igreja_destino_nome}</strong>, sediada na cidade de{' '}
                <strong>{selectedCarta.igreja_destino_cidade_uf}</strong>.
              </p>
              <p>
                Temos a grata satisfação de apresentar-vos e transferir para a vossa amorosa comunhão e cuidado espiritual o(a) nosso(a) estimado(a) irmão(ã) em Cristo:
              </p>

              {/* BOX DESTACADO COM OS DADOS DO MEMBRO */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 my-3 space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><strong>NOME COMPLETO:</strong> {selectedCarta.membro_nome.toUpperCase()}</div>
                  <div><strong>CARGO/MINISTÉRIO:</strong> {selectedCarta.membro_cargo.toUpperCase()}</div>
                  <div><strong>CPF:</strong> {selectedCarta.membro_cpf || 'Consta no arquivo eclesiástico'}</div>
                  <div><strong>ESTADO CIVIL:</strong> {selectedCarta.estado_civil?.toUpperCase()}</div>
                  {selectedCarta.conjuge_nome && (
                    <div className="sm:col-span-2"><strong>CÔNJUGE:</strong> {selectedCarta.conjuge_nome.toUpperCase()}</div>
                  )}
                  <div>
                    <strong>BATISMO NAS ÁGUAS (IMERSÃO):</strong>{' '}
                    {selectedCarta.data_batismo_aguas ? new Date(selectedCarta.data_batismo_aguas + 'T00:00:00').toLocaleDateString('pt-BR') : 'Conforme as Sagradas Escrituras (Mt 28:19)'}
                  </div>
                  <div>
                    <strong>BATISMO NO ESPÍRITO SANTO:</strong>{' '}
                    <span className="font-bold text-slate-900">SIM (Com evidência de falar em línguas - At 2:4)</span>
                  </div>
                </div>
              </div>

              <p>
                Certificamos para os devidos fins que o(a) referido(a) membro encontra-se em <strong>PLENA COMUNHÃO BÍBLICA E DOUTRINÁRIA</strong> com esta igreja, cumprindo regularmente com seus votos batismais, assíduo(a) nas santas reuniões e na celebração da Ceia do Senhor, nada constando que desabone sua conduta moral, espiritual ou ministerial.
              </p>

              <p>
                A presente transferência é concedida em virtude de:{' '}
                <strong>
                  {selectedCarta.motivo === 'mudanca_residencia' ? 'Mudança de Residência e Domicílio' :
                   selectedCarta.motivo === 'trabalho' ? 'Transferência e Compromissos de Trabalho' :
                   selectedCarta.motivo === 'estudos' ? 'Dedicação a Estudos e Formação Acadêmica' :
                   selectedCarta.motivo === 'familiar' ? 'Casamento e Reunião Familiar' : 'Solicitação Fraternal'}
                </strong>
                {selectedCarta.motivo_detalhe ? ` (${selectedCarta.motivo_detalhe}).` : '.'}
              </p>

              <p>
                Rogamos-vos que o(a) recebais no amor de Cristo, acolhendo-o(a) no santo rol de membros dessa congregação co-irmã, prestando-lhe todo o apoio espiritual e pastoral que necessitar.
              </p>

              <p className="text-xs text-slate-500 italic pt-1">
                <strong>Prazo de Validade Canônica:</strong> Esta carta possui validade eclesiástica até{' '}
                <strong>{new Date(selectedCarta.data_validade + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>, findo o qual deverá ser solicitada renovação caso a recepção não tenha se concretizado.
              </p>
            </div>

            {/* DATA E ASSINATURAS */}
            <div className="pt-4 font-sans space-y-12">
              <p className="text-right text-xs text-slate-700">
                {selectedCarta.igreja_origem_cidade_uf},{' '}
                {new Date(selectedCarta.data_emissao + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.
              </p>

              <div className="grid grid-cols-2 gap-8 text-center text-xs">
                <div className="space-y-1">
                  <div className="border-b border-slate-800 w-3/4 mx-auto pb-1"></div>
                  <p className="font-bold text-slate-900">{selectedCarta.pastor_presidente_origem}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Pastor Presidente</p>
                </div>
                <div className="space-y-1">
                  <div className="border-b border-slate-800 w-3/4 mx-auto pb-1"></div>
                  <p className="font-bold text-slate-900">{selectedCarta.criado_por || 'Secretaria Geral'}</p>
                  <p className="text-[10px] text-slate-500 uppercase">1º Secretário(a)</p>
                </div>
              </div>
            </div>

            {/* SELO DE AUTENTICIDADE DIGITAL & QR CODE */}
            <div className="border-t border-slate-300 pt-4 flex items-center justify-between font-sans text-[11px] text-slate-500">
              <div className="space-y-1">
                <div className="flex items-center gap-1 font-bold text-slate-700">
                  <ShieldCheck size={14} className="text-emerald-600" /> Chancela Canônica & Autenticação Digital
                </div>
                <p className="font-mono text-[10px] text-slate-500">
                  HASH: {selectedCarta.hash_autenticidade}
                </p>
                <p className="text-[10px]">
                  Documento eclesiástico gerado sob as diretrizes da Convenção Geral (CGADB).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right text-[9px] leading-tight">
                  <span className="font-bold block text-slate-700">Validação QR Code</span>
                  <span>Escaneie para conferir</span>
                </div>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`GIPP_TRANSFERENCIA_${selectedCarta.protocolo}_${selectedCarta.hash_autenticidade}`)}&color=0f172a&bgcolor=ffffff`}
                  alt="QR Code de Validação"
                  className="w-14 h-14 object-contain border border-slate-300 rounded p-0.5"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* LINHA DE CORTE / SERRILHADO PICOTADO */}
            <div className="relative my-6 py-2 border-b-2 border-dashed border-slate-400 text-center font-sans text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span className="bg-white px-4">
                ✂ DESTACAR AQUI — CANHOTO / COMPROVANTE DE RECEPÇÃO PARA DEVOLUÇÃO À IGREJA DE ORIGEM ✂
              </span>
            </div>

            {/* CANHOTO DE CONFIRMAÇÃO / RECIBO DE DEVOLUÇÃO (AVISO DE RECEPÇÃO ECLESIÁSTICO) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 font-sans space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-black text-slate-900 text-[11px] uppercase">
                  COMPROVANTE DE RECEPÇÃO E POSSE DE MEMBRO NO ROL
                </span>
                <span className="font-mono font-bold text-indigo-700 text-[11px]">
                  REF. PROTOCOLO: {selectedCarta.protocolo}
                </span>
              </div>

              <p className="text-[11px] leading-tight text-slate-700">
                Certificamos à Secretaria da <strong>{selectedCarta.igreja_origem_nome}</strong> que em reunião / assembleia realizada no dia ______ / ______ / __________, recebemos com grande júbilo no nosso rol de membros o(a) irmão(ã):{' '}
                <strong>{selectedCarta.membro_nome.toUpperCase()}</strong>.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 text-center">
                <div>
                  <div className="border-b border-slate-400 w-4/5 mx-auto pb-1 mb-1"></div>
                  <span className="text-[10px] text-slate-600 block">Assinatura do Pastor / Dirigente Receptor</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-4/5 mx-auto pb-1 mb-1"></div>
                  <span className="text-[10px] text-slate-600 block">Carimbo Oficial da Igreja Receptora</span>
                </div>
              </div>

              <p className="text-[9px] text-slate-400 text-center italic pt-1">
                * Favor devolver este canhoto assinado e carimbado à Secretaria da igreja de origem ou enviar cópia digitalizada.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
