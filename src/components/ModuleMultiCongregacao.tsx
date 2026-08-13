import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Users,
  ArrowRightLeft,
  FileCheck2,
  MapPin,
  UserCheck,
  Plus,
  Search,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  DollarSign,
  TrendingUp,
  Award,
  Sparkles,
  Send,
  FileText,
  ChevronRight,
  Filter
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface CongregacaoItem {
  id: string;
  nome: string;
  tipo: 'Sede' | 'Sub-Sede' | 'Congregação' | 'Ponto de Pregação';
  dirigente: string;
  endereco: string;
  cidade: string;
  totalMembros: number;
  saldoFinanceiro: number;
}

export default function ModuleMultiCongregacao() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast, user, addDoc, collection, dbFirestore, appId, updateDoc, doc } = context || {};

  const [activeTab, setActiveTab] = useState<'campo' | 'transferencia' | 'cartas'>('campo');
  const [searchTerm, setSearchTerm] = useState('');

  // Default Congregations list
  const [congregacoes, setCongregacoes] = useState<CongregacaoItem[]>([
    {
      id: 'c1',
      nome: 'Sede Principal (Templo Central)',
      tipo: 'Sede',
      dirigente: user?.nome || 'Pr. Presidente',
      endereco: 'Av. Principal, 1000 - Centro',
      cidade: 'São Paulo - SP',
      totalMembros: 450,
      saldoFinanceiro: 38450.00
    },
    {
      id: 'c2',
      nome: 'Sub-Sede Bairro Novo',
      tipo: 'Sub-Sede',
      dirigente: 'Pr. Marcos Oliveira',
      endereco: 'Rua das Palmeiras, 250 - Bairro Novo',
      cidade: 'São Paulo - SP',
      totalMembros: 180,
      saldoFinanceiro: 12300.00
    },
    {
      id: 'c3',
      nome: 'Congregação Canaã',
      tipo: 'Congregação',
      dirigente: 'Ev. Fernando Dias',
      endereco: 'Rua Bela Vista, 88 - Jd. Canaã',
      cidade: 'São Paulo - SP',
      totalMembros: 95,
      saldoFinanceiro: 6780.00
    },
    {
      id: 'c4',
      nome: 'Congregação Filadélfia',
      tipo: 'Congregação',
      dirigente: 'Pb. André Luiz',
      endereco: 'Rua Esperança, 45 - Vila Sol',
      cidade: 'São Paulo - SP',
      totalMembros: 62,
      saldoFinanceiro: 4120.00
    }
  ]);

  // Modal new congregation state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [novaCong, setNovaCong] = useState({
    nome: '',
    tipo: 'Congregação' as CongregacaoItem['tipo'],
    dirigente: '',
    endereco: '',
    cidade: 'São Paulo - SP'
  });

  // Transfer state
  const membersList: any[] = db?.membros || [
    { id: 'm1', nome: 'Irmão Carlos Eduardo', cargo: 'Congregado', congregacao: 'Sede Principal (Templo Central)' },
    { id: 'm2', nome: 'Diácono Roberto Alves', cargo: 'Diácono', congregacao: 'Sede Principal (Templo Central)' },
    { id: 'm3', nome: 'Irmã Maria de Fátima', cargo: 'Membro', congregacao: 'Sub-Sede Bairro Novo' },
    { id: 'm4', nome: 'Jovem Matheus Souza', cargo: 'Membro', congregacao: 'Congregação Canaã' }
  ];

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [destCongregacao, setDestCongregacao] = useState('');
  const [motivoTransferencia, setMotivoTransferencia] = useState('Mudança de residência / Apoio ministerial');
  const [cartaGerada, setCartaGerada] = useState<any | null>(null);
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);

  // Computed Totals
  const totalMembrosCampo = useMemo(() => congregacoes.reduce((acc, c) => acc + c.totalMembros, 0), [congregacoes]);
  const totalSaldoCampo = useMemo(() => congregacoes.reduce((acc, c) => acc + c.saldoFinanceiro, 0), [congregacoes]);

  const handleCreateCongregacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCong.nome) return;
    const item: CongregacaoItem = {
      id: `c_${Date.now()}`,
      nome: novaCong.nome,
      tipo: novaCong.tipo,
      dirigente: novaCong.dirigente || 'A Designar',
      endereco: novaCong.endereco || 'Endereço não informado',
      cidade: novaCong.cidade,
      totalMembros: 0,
      saldoFinanceiro: 0
    };
    setCongregacoes([...congregacoes, item]);
    setIsNewModalOpen(false);
    setNovaCong({ nome: '', tipo: 'Congregação', dirigente: '', endereco: '', cidade: 'São Paulo - SP' });
    addToast(`Nova congregação "${item.nome}" cadastrada com sucesso no Campo!`, 'success');
  };

  const handleExecutarTransferencia = async (e: React.FormEvent) => {
    e.preventDefault();
    const memberObj = membersList.find(m => m.id === selectedMemberId);
    if (!memberObj || !destCongregacao) {
      addToast('Selecione o membro e a congregação de destino.', 'error');
      return;
    }

    setIsProcessingTransfer(true);
    try {
      const carta = {
        codigo: `CARTA-GIPP-${Math.floor(100000 + Math.random() * 900000)}`,
        membroNome: memberObj.nome,
        membroCargo: memberObj.cargo || 'Membro',
        origem: memberObj.congregacao || 'Sede Principal',
        destino: destCongregacao,
        motivo: motivoTransferencia,
        dataEmissao: new Date().toLocaleDateString('pt-BR'),
        emitidoPor: user?.nome || 'Pastor Presidente',
        status: 'Aprovada & Transferida'
      };

      // Save transfer log
      if (addDoc && dbFirestore && appId) {
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'transferencias_membros'), carta);
      }

      setCartaGerada(carta);
      addToast(`Transferência digital de ${memberObj.nome} executada com sucesso!`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro ao processar transferência.', 'error');
    } finally {
      setIsProcessingTransfer(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 shadow-lg shadow-purple-500/20">
            <Building2 size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Gestão de Campo Eclesiástico • Sede & Sub-Sedes
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Visão de Campo Multi-Congregação
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Consolidação de estatísticas de todas as congregações do campo em tempo real e <strong className="text-purple-400">Transferência Digital de Membro em 1 Clique</strong> com emissão de Carta de Mudança.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('campo')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 md:flex-none ${
              activeTab === 'campo' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 size={15} /> Congregações do Campo
          </button>
          <button
            onClick={() => setActiveTab('transferencia')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 md:flex-none ${
              activeTab === 'transferencia' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft size={15} /> Transferência Digital
          </button>
        </div>
      </div>

      {/* Field KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total de Congregações</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-400">{congregacoes.length}</span>
              <span className="text-xs text-slate-400 font-medium">unidades ativas</span>
            </div>
            <p className="text-[10px] text-purple-400 font-bold mt-1">1 Sede + {congregacoes.length - 1} Sub-sedes</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Building2 size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Membros Unificados do Campo</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{totalMembrosCampo}</span>
              <span className="text-xs text-slate-400 font-medium">membros registrados</span>
            </div>
            <p className="text-[10px] text-emerald-400 font-bold mt-1">Crescimento contínuo de almas</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Consolidado Financeiro do Campo</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-blue-400">R$ {totalSaldoCampo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <p className="text-[10px] text-blue-400 font-bold mt-1">Soma de caixas locais do campo</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {activeTab === 'campo' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Building2 className="text-purple-400" size={20} /> Congregações e Pontos de Pregação
              </h2>
              <p className="text-xs text-slate-400">Mapeamento de lideranças e saldos do campo eclesiástico</p>
            </div>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> Cadastrar Nova Congregação
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {congregacoes.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-purple-500/40 transition-all space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    c.tipo === 'Sede'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}>
                    {c.tipo}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <MapPin size={12} className="text-purple-400" /> {c.cidade}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">{c.nome}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Dirigente: <strong className="text-slate-200">{c.dirigente}</strong></p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Membros</span>
                    <strong className="text-emerald-400 font-black text-sm">{c.totalMembros} pessoas</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Saldo Local</span>
                    <strong className="text-blue-400 font-black text-sm">R$ {c.saldoFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'transferencia' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Transfer Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ArrowRightLeft className="text-purple-400" size={20} /> Emissão de Transferência / Carta de Mudança
            </h2>

            <form onSubmit={handleExecutarTransferencia} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Membro a ser Transferido *</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-purple-500"
                >
                  <option value="">-- Selecione o membro --</option>
                  {membersList.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nome} ({m.cargo}) - Atual: {m.congregacao}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Congregação de Destino *</label>
                <select
                  required
                  value={destCongregacao}
                  onChange={e => setDestCongregacao(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-purple-500"
                >
                  <option value="">-- Selecione a congregação destino --</option>
                  {congregacoes.map(c => (
                    <option key={c.id} value={c.nome}>
                      {c.nome} ({c.tipo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Motivo da Recomendação / Transferência</label>
                <textarea
                  rows={3}
                  value={motivoTransferencia}
                  onChange={e => setMotivoTransferencia(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessingTransfer}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessingTransfer ? 'Processando Transferência...' : <><FileCheck2 size={18} /> Processar Transferência & Emitir Carta</>}
              </button>
            </form>
          </div>

          {/* Letter preview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col items-center justify-center text-center space-y-6 min-h-[420px]">
            {cartaGerada ? (
              <div className="w-full space-y-4 animate-fadeIn text-left">
                <div className="p-6 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-300 space-y-4 font-serif">
                  <div className="text-center border-b border-slate-300 pb-3 font-sans">
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 block">Igreja Evangélica Assembleia de Deus • GIPP</span>
                    <h3 className="text-lg font-black text-slate-900">CARTA DE RECOMENDAÇÃO E MUDANÇA</h3>
                    <p className="text-[10px] text-slate-500 font-mono">Autenticação: {cartaGerada.codigo}</p>
                  </div>

                  <p className="text-xs leading-relaxed">
                    Amados irmãos em Cristo, saudamos-vos com a paz do Senhor. Pela presente, recomendamos o(a) amado(a) irmão(ã) <strong>{cartaGerada.membroNome}</strong> ({cartaGerada.membroCargo}), que se transfere da <strong>{cartaGerada.origem}</strong> para a congregação <strong>{cartaGerada.destino}</strong>, estando em plena comunhão com a igreja.
                  </p>

                  <div className="text-[11px] font-sans bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <p><strong>Motivo:</strong> {cartaGerada.motivo}</p>
                    <p><strong>Data de Emissão:</strong> {cartaGerada.dataEmissao}</p>
                    <p><strong>Emitido Por:</strong> {cartaGerada.emitidoPor}</p>
                  </div>

                  <div className="text-center pt-4 border-t border-slate-300 font-sans">
                    <div className="w-32 h-0.5 bg-slate-800 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-slate-700 uppercase">Pastor Presidente / Secretaria Geral</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    window.print();
                    addToast('Imprimindo Carta de Mudança!', 'info');
                  }}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText size={16} /> Imprimir / Salvar PDF
                </button>
              </div>
            ) : (
              <div className="space-y-3 py-12">
                <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 text-slate-600 inline-block">
                  <ArrowRightLeft size={48} />
                </div>
                <h3 className="text-base font-bold text-slate-300">Pronto para Transferência Digital</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Ao selecionar o membro e a congregação ao lado, a carta de recomendação será emitida e a transferência será registrada instantaneamente.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nova Congregação */}
      <AnimatePresence>
        {isNewModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Nova Congregação / Sub-Sede</h3>
                    <p className="text-xs text-slate-400">Cadastrar no Campo Eclesiástico</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCongregacao} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nome da Congregação *</label>
                  <input
                    type="text"
                    required
                    value={novaCong.nome}
                    onChange={e => setNovaCong({ ...novaCong, nome: e.target.value })}
                    placeholder="Ex: Sub-Sede Bairro Esperança"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Tipo de Unidade</label>
                  <select
                    value={novaCong.tipo}
                    onChange={e => setNovaCong({ ...novaCong, tipo: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none focus:border-purple-500"
                  >
                    <option value="Sub-Sede">Sub-Sede</option>
                    <option value="Congregação">Congregação</option>
                    <option value="Ponto de Pregação">Ponto de Pregação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Pastor / Dirigente Local</label>
                  <input
                    type="text"
                    value={novaCong.dirigente}
                    onChange={e => setNovaCong({ ...novaCong, dirigente: e.target.value })}
                    placeholder="Ex: Pr. João Batista"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    value={novaCong.endereco}
                    onChange={e => setNovaCong({ ...novaCong, endereco: e.target.value })}
                    placeholder="Rua, Número, Bairro"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30"
                  >
                    Salvar Unidade
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
