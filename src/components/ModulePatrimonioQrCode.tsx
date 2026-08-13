import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  QrCode,
  Search,
  Plus,
  Wrench,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Sparkles,
  ShieldAlert,
  Building
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface BemPatrimonial {
  id: string;
  tombamento: string;
  nome: string;
  categoria: 'Som & Imagem' | 'Instrumento' | 'Mobiliário' | 'Eletro' | 'Veículo';
  localizacao: string;
  valorEstimado: number;
  estado: 'Excelente' | 'Bom' | 'Necessita Reparo';
  dataAquisicao: string;
  qrCodeUrl?: string;
}

export default function ModulePatrimonioQrCode() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast, user } = context || {};

  const [bens, setBens] = useState<BemPatrimonial[]>([
    {
      id: 'p1',
      tombamento: 'PAT-GIPP-00101',
      nome: 'Mesa de Som Behringer X32 Digital',
      categoria: 'Som & Imagem',
      localizacao: 'Gabinete Som - Templo Central',
      valorEstimado: 14500.00,
      estado: 'Excelente',
      dataAquisicao: '15/03/2024'
    },
    {
      id: 'p2',
      tombamento: 'PAT-GIPP-00102',
      nome: 'Bateria Eletrônica Roland TD-17KVX',
      categoria: 'Instrumento',
      localizacao: 'Pulpito / Altar',
      valorEstimado: 11200.00,
      estado: 'Bom',
      dataAquisicao: '10/01/2025'
    },
    {
      id: 'p3',
      tombamento: 'PAT-GIPP-00103',
      nome: 'Ar-Condicionado Inverter 36000 BTUs',
      categoria: 'Eletro',
      localizacao: 'Nave do Templo',
      valorEstimado: 6800.00,
      estado: 'Necessita Reparo',
      dataAquisicao: '05/06/2022'
    },
    {
      id: 'p4',
      tombamento: 'PAT-GIPP-00104',
      nome: 'Jogo de 50 Cadeiras Estofadas Violeta',
      categoria: 'Mobiliário',
      localizacao: 'Salão Social EBD',
      valorEstimado: 8500.00,
      estado: 'Bom',
      dataAquisicao: '20/11/2023'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBem, setSelectedBem] = useState<BemPatrimonial | null>(null);
  const [isNewBemOpen, setIsNewBemOpen] = useState(false);

  // Form novo bem
  const [nomeBem, setNomeBem] = useState('');
  const [categoriaBem, setCategoriaBem] = useState<BemPatrimonial['categoria']>('Som & Imagem');
  const [localizacaoBem, setLocalizacaoBem] = useState('Nave do Templo');
  const [valorBem, setValorBem] = useState('');

  const filteredBens = bens.filter(b =>
    b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.tombamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCadastrarBem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeBem) return;

    const num = Math.floor(100 + Math.random() * 900);
    const novo: BemPatrimonial = {
      id: `p_${Date.now()}`,
      tombamento: `PAT-GIPP-00${num}`,
      nome: nomeBem,
      categoria: categoriaBem,
      localizacao: localizacaoBem,
      valorEstimado: parseFloat(valorBem.replace(',', '.')) || 0,
      estado: 'Excelente',
      dataAquisicao: new Date().toLocaleDateString('pt-BR')
    };

    setBens([novo, ...bens]);
    setIsNewBemOpen(false);
    setNomeBem('');
    setValorBem('');
    addToast(`Bem "${novo.nome}" cadastrado e tombado com o código ${novo.tombamento}!`, 'success');
  };

  const handleSolicitarManutencao = (bem: BemPatrimonial) => {
    addToast(`Chamado de manutenção aberta para o bem ${bem.tombamento} - ${bem.nome}!`, 'info');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Package size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Patrimônio & Inventário por QR Code
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Tombamento & Gestão de Ativos
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Rastreamento de bens, etiquetas com QR Code para conferência no celular, controle de localização e solicitações de manutenção.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewBemOpen(true)}
          className="px-5 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-cyan-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} /> Cadastrar & Tombar Bem
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <Search size={20} className="text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar bem por nome, número de tombamento (PAT-GIPP) ou localização..."
            className="w-full bg-transparent text-xs font-bold text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-bold uppercase">Patrimônio Avaliado</span>
          <strong className="text-cyan-400 font-black text-base">
            R$ {bens.reduce((acc, b) => acc + b.valorEstimado, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {/* Grid de Bens Tombados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredBens.map(b => (
          <div
            key={b.id}
            className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4 relative group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-block">
                  {b.tombamento}
                </span>
                <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">{b.nome}</h3>
              </div>

              {/* Tag Estado */}
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                b.estado === 'Excelente' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                b.estado === 'Bom' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {b.estado}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Localização</span>
                <strong className="text-slate-200 font-bold flex items-center gap-1">
                  <MapPin size={12} className="text-cyan-400" /> {b.localizacao}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Valor Declarado</span>
                <strong className="text-cyan-400 font-black">R$ {b.valorEstimado.toFixed(2)}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 justify-end">
              <button
                onClick={() => setSelectedBem(b)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode size={14} className="text-cyan-400" /> Etiqueta QR Code
              </button>

              {b.estado === 'Necessita Reparo' ? (
                <button
                  onClick={() => handleSolicitarManutencao(b)}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Wrench size={14} /> Abrir Chamado
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Etiqueta QR Code */}
      <AnimatePresence>
        {selectedBem && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-sm rounded-3xl border border-slate-700/80 shadow-2xl p-6 text-center space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-cyan-400">Etiqueta de Patrimônio Oficial</span>
                <button
                  onClick={() => setSelectedBem(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 bg-white text-slate-900 rounded-2xl shadow-xl space-y-3 font-mono">
                <p className="text-[10px] font-black uppercase text-slate-500">Igreja Evangélica Assembleia de Deus • GIPP</p>
                <h3 className="text-sm font-black text-slate-900">{selectedBem.nome}</h3>
                
                {/* QR Code Graphic Mock */}
                <div className="w-32 h-32 mx-auto bg-slate-950 p-2 rounded-xl flex items-center justify-center text-white font-sans text-xs">
                  <div className="border-4 border-cyan-400 p-2 text-center rounded-lg">
                    <QrCode size={64} className="text-cyan-400 mx-auto" />
                    <span className="text-[9px] font-mono block mt-1">{selectedBem.tombamento}</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-700">Tombamento: {selectedBem.tombamento}</p>
                <p className="text-[10px] text-slate-500">Escaneie para conferir localização e inventário no celular</p>
              </div>

              <button
                onClick={() => {
                  window.print();
                  addToast('Imprimindo Etiqueta de Patrimônio!', 'info');
                }}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={16} /> Imprimir Etiqueta
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Cadastro de Bem */}
      <AnimatePresence>
        {isNewBemOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-black text-white">Cadastrar Bem Patrimonial</h3>
                <button
                  onClick={() => setIsNewBemOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCadastrarBem} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nome do Equipamento / Bem *</label>
                  <input
                    type="text"
                    required
                    value={nomeBem}
                    onChange={e => setNomeBem(e.target.value)}
                    placeholder="Ex: Teclado Yamaha Motif XF8"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Categoria</label>
                    <select
                      value={categoriaBem}
                      onChange={e => setCategoriaBem(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none"
                    >
                      <option value="Som & Imagem">Som & Imagem</option>
                      <option value="Instrumento">Instrumento</option>
                      <option value="Mobiliário">Mobiliário</option>
                      <option value="Eletro">Eletro</option>
                      <option value="Veículo">Veículo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Localização</label>
                    <input
                      type="text"
                      value={localizacaoBem}
                      onChange={e => setLocalizacaoBem(e.target.value)}
                      placeholder="Ex: Templo Principal"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Valor Estimado (R$)</label>
                  <input
                    type="text"
                    value={valorBem}
                    onChange={e => setValorBem(e.target.value)}
                    placeholder="Ex: 5000,00"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewBemOpen(false)}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-xl shadow-lg shadow-cyan-600/30"
                  >
                    Tombar & Gerar Tag
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
