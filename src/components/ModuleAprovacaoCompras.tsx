import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Building,
  Clock,
  AlertCircle,
  Paperclip,
  Check,
  Send,
  Search,
  Filter,
  CheckSquare
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface SolicitacaoCompra {
  id: string;
  item: string;
  departamento: string;
  solicitante: string;
  valorEstimado: number;
  motivo: string;
  cotacoes: { fornecedor: string; valor: number; observacao: string }[];
  status: 'Pendente' | 'Aprovado' | 'Recusado';
  dataSolicitacao: string;
  aprovadoPor?: string;
}

export default function ModuleAprovacaoCompras() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast, user, addDoc, collection, dbFirestore, appId } = context || {};

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCompra[]>([
    {
      id: 'sc1',
      item: 'Projetor Laser 4000 Lumens para o Templo',
      departamento: 'Mídia & Som',
      solicitante: 'Jovem Amanda Lima',
      valorEstimado: 3450.00,
      motivo: 'Substituição do projetor antigo que apresenta falhas de iluminação nos cultos.',
      cotacoes: [
        { fornecedor: 'TechMidia Eletrônicos', valor: 3450.00, observacao: 'Menor preço com garantia de 2 anos' },
        { fornecedor: 'Projetores SP', valor: 3790.00, observacao: 'Prazo de entrega em 5 dias' },
        { fornecedor: 'MegaSom Distribuidora', valor: 3900.00, observacao: 'Acompanha cabo HDMI 15m' }
      ],
      status: 'Pendente',
      dataSolicitacao: '12/08/2026'
    },
    {
      id: 'sc2',
      item: 'Materiais Didáticos EBD Infantil (3º Trimestre)',
      departamento: 'Escola Dominical Kids',
      solicitante: 'Irmã Juliana Costa',
      valorEstimado: 480.00,
      motivo: 'Aquisição de revistas CPAD e materiais de pintura para 45 alunos.',
      cotacoes: [
        { fornecedor: 'Livraria CPAD Oficial', valor: 480.00, observacao: 'Desconto institucional de igreja' },
        { fornecedor: 'Distribuidora Gospel', valor: 520.00, observacao: 'Frete cobrado à parte' }
      ],
      status: 'Aprovado',
      dataSolicitacao: '10/08/2026',
      aprovadoPor: 'Pastor Presidente'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoCompra | null>(null);

  // Form state
  const [novoItem, setNovoItem] = useState('');
  const [novoDepto, setNovoDepto] = useState('Mídia & Som');
  const [novoMotivo, setNovoMotivo] = useState('');
  const [cotacao1, setCotacao1] = useState({ fornecedor: '', valor: '', observacao: '' });
  const [cotacao2, setCotacao2] = useState({ fornecedor: '', valor: '', observacao: '' });

  const handleCriarSolicitacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoItem || !cotacao1.fornecedor || !cotacao1.valor) {
      addToast('Preencha o item e ao menos uma cotação válida.', 'error');
      return;
    }

    const cotacoesArray = [
      { fornecedor: cotacao1.fornecedor, valor: parseFloat(cotacao1.valor.replace(',', '.')), observacao: cotacao1.observacao }
    ];
    if (cotacao2.fornecedor && cotacao2.valor) {
      cotacoesArray.push({ fornecedor: cotacao2.fornecedor, valor: parseFloat(cotacao2.valor.replace(',', '.')), observacao: cotacao2.observacao });
    }

    const menorValor = Math.min(...cotacoesArray.map(c => c.valor));

    const nova: SolicitacaoCompra = {
      id: `sc_${Date.now()}`,
      item: novoItem,
      departamento: novoDepto,
      solicitante: user?.nome || 'Líder de Departamento',
      valorEstimado: menorValor,
      motivo: novoMotivo,
      cotacoes: cotacoesArray,
      status: 'Pendente',
      dataSolicitacao: new Date().toLocaleDateString('pt-BR')
    };

    setSolicitacoes([nova, ...solicitacoes]);
    setIsModalOpen(false);
    setNovoItem('');
    setNovoMotivo('');
    setCotacao1({ fornecedor: '', valor: '', observacao: '' });
    setCotacao2({ fornecedor: '', valor: '', observacao: '' });
    addToast('Solicitação de compra enviada para análise da Tesouraria!', 'success');
  };

  const handleAprovar = (id: string) => {
    setSolicitacoes(prev => prev.map(s => s.id === id ? { ...s, status: 'Aprovado', aprovadoPor: user?.nome || 'Pastor Presidente' } : s));
    setSelectedSolicitacao(null);
    addToast('Compra APROVADA e lançada para autorização de pagamento!', 'success');
  };

  const handleRecusar = (id: string) => {
    setSolicitacoes(prev => prev.map(s => s.id === id ? { ...s, status: 'Recusado' } : s));
    setSelectedSolicitacao(null);
    addToast('Solicitação de compra recusada.', 'info');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/20">
            <ShoppingBag size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Administração & Finanças • Controle de Compras
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Central de Compras & Cotações
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Solicitação de materiais por departamentos com anexo de cotações de fornecedores e <strong className="text-amber-400">alçada de aprovação da Tesouraria/Diretoria</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} /> Nova Solicitação de Compra
        </button>
      </div>

      {/* Lista de Pedidos de Compra */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <CheckSquare className="text-amber-400" size={20} /> Pedidos em Análise & Histórico
          </h2>
          <span className="text-xs text-slate-400 font-bold">{solicitacoes.length} solicitações registradas</span>
        </div>

        <div className="space-y-3">
          {solicitacoes.map(s => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    s.status === 'Aprovado' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    s.status === 'Recusado' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                    'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    ● {s.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{s.departamento}</span>
                  <span className="text-xs text-slate-600">•</span>
                  <span className="text-xs text-slate-500">{s.dataSolicitacao}</span>
                </div>

                <h3 className="text-base font-black text-white">{s.item}</h3>
                <p className="text-xs text-slate-400">Solicitado por: <strong className="text-slate-200">{s.solicitante}</strong> — Motivo: {s.motivo}</p>
                <div className="flex items-center gap-3 pt-1 text-xs">
                  <span className="text-slate-400">Menor cotação: <strong className="text-amber-400 font-bold">R$ {s.valorEstimado.toFixed(2)}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500">{s.cotacoes.length} cotações anexadas</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                <button
                  onClick={() => setSelectedSolicitacao(s)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  Ver Cotações
                </button>

                {s.status === 'Pendente' && (
                  <button
                    onClick={() => handleAprovar(s.id)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 size={15} /> Aprovar Compra
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Ver Cotações / Aprovar */}
      <AnimatePresence>
        {selectedSolicitacao && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-lg rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-black text-white">Detalhes do Pedido de Compra</h3>
                  <p className="text-xs text-slate-400">{selectedSolicitacao.item}</p>
                </div>
                <button
                  onClick={() => setSelectedSolicitacao(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Cotações de Fornecedores Recebidas</h4>
                <div className="space-y-2">
                  {selectedSolicitacao.cotacoes.map((c, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-white font-bold block">{c.fornecedor}</strong>
                        <span className="text-slate-400">{c.observacao}</span>
                      </div>
                      <span className="text-amber-400 font-black text-sm">R$ {c.valor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                {selectedSolicitacao.status === 'Pendente' && (
                  <>
                    <button
                      onClick={() => handleRecusar(selectedSolicitacao.id)}
                      className="flex-1 py-3 px-4 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs rounded-xl border border-rose-500/30"
                    >
                      Recusar Compra
                    </button>
                    <button
                      onClick={() => handleAprovar(selectedSolicitacao.id)}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={16} /> Aprovar Compra
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Nova Solicitação */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-lg rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-black text-white">Nova Solicitação de Compra</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCriarSolicitacao} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Descrição do Item / Material *</label>
                  <input
                    type="text"
                    required
                    value={novoItem}
                    onChange={e => setNovoItem(e.target.value)}
                    placeholder="Ex: Mesa de Som Digital 16 Canais"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Departamento</label>
                    <select
                      value={novoDepto}
                      onChange={e => setNovoDepto(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none"
                    >
                      <option value="Mídia & Som">Mídia & Som</option>
                      <option value="Escola Dominical Kids">Escola Dominical Kids</option>
                      <option value="Zeladoria & Reforma">Zeladoria & Reforma</option>
                      <option value="Secretaria Geral">Secretaria Geral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Motivo / Justificativa</label>
                    <input
                      type="text"
                      value={novoMotivo}
                      onChange={e => setNovoMotivo(e.target.value)}
                      placeholder="Necessidade da igreja"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-amber-400">Cotação 1 (Obrigatória)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Fornecedor / Loja"
                      value={cotacao1.fornecedor}
                      onChange={e => setCotacao1({ ...cotacao1, fornecedor: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Valor (R$)"
                      value={cotacao1.valor}
                      onChange={e => setCotacao1({ ...cotacao1, valor: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Cotação 2 (Opcional)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Fornecedor 2"
                      value={cotacao2.fornecedor}
                      onChange={e => setCotacao2({ ...cotacao2, fornecedor: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Valor (R$)"
                      value={cotacao2.valor}
                      onChange={e => setCotacao2({ ...cotacao2, valor: e.target.value })}
                      className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-600/30"
                  >
                    Enviar para Análise
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
