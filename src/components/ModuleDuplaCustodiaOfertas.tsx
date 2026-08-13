import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  DollarSign,
  Plus,
  FileSignature,
  Printer,
  Lock,
  Sparkles,
  Camera,
  Check
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface AtaContagemOferta {
  id: string;
  cultoNome: string;
  dataCulto: string;
  conferente1: string;
  conferente2: string;
  valorDinheiroEspecie: number;
  valorEnvelopesDizimo: number;
  valorPixCopiaCola: number;
  totalGeralCulto: number;
  comprovanteDepositoAnexo: boolean;
  status: 'Ata Fechada & Auditada';
}

export default function ModuleDuplaCustodiaOfertas() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast, user } = context || {};

  const [atas, setAtas] = useState<AtaContagemOferta[]>([
    {
      id: 'ata1',
      cultoNome: 'Culto da Família & Ceia do Senhor',
      dataCulto: '09/08/2026 - 19:00h',
      conferente1: 'Diácono Roberto Alves',
      conferente2: 'Irmão Carlos Eduardo',
      valorDinheiroEspecie: 3240.00,
      valorEnvelopesDizimo: 12500.00,
      valorPixCopiaCola: 8900.00,
      totalGeralCulto: 24640.00,
      comprovanteDepositoAnexo: true,
      status: 'Ata Fechada & Auditada'
    },
    {
      id: 'ata2',
      cultoNome: 'Culto de Doutrina & Ensino EBD',
      dataCulto: '06/08/2026 - 19:30h',
      conferente1: 'Pb. André Luiz',
      conferente2: 'Diácono Paulo Silva',
      valorDinheiroEspecie: 1450.00,
      valorEnvelopesDizimo: 5800.00,
      valorPixCopiaCola: 4100.00,
      totalGeralCulto: 11350.00,
      comprovanteDepositoAnexo: true,
      status: 'Ata Fechada & Auditada'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAta, setSelectedAta] = useState<AtaContagemOferta | null>(null);

  // Form states
  const [cultoNome, setCultoNome] = useState('Culto de Celebração');
  const [dataCulto, setDataCulto] = useState('12/08/2026');
  const [conf1, setConf1] = useState('Diácono Roberto Alves');
  const [conf2, setConf2] = useState('Irmão Carlos Eduardo');
  const [vEspecie, setVEspecie] = useState('');
  const [vEnvelopes, setVEnvelopes] = useState('');
  const [vPix, setVPix] = useState('');

  const handleCriarAta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conf1 || !conf2 || conf1 === conf2) {
      addToast('A DUPLA CUSTÓDIA exige obrigatoriamente 2 conferentes DISTINTOS!', 'error');
      return;
    }

    const nEspecie = parseFloat(vEspecie.replace(',', '.')) || 0;
    const nEnvelopes = parseFloat(vEnvelopes.replace(',', '.')) || 0;
    const nPix = parseFloat(vPix.replace(',', '.')) || 0;
    const total = nEspecie + nEnvelopes + nPix;

    const nova: AtaContagemOferta = {
      id: `ata_${Date.now()}`,
      cultoNome,
      dataCulto,
      conferente1: conf1,
      conferente2: conf2,
      valorDinheiroEspecie: nEspecie,
      valorEnvelopesDizimo: nEnvelopes,
      valorPixCopiaCola: nPix,
      totalGeralCulto: total,
      comprovanteDepositoAnexo: true,
      status: 'Ata Fechada & Auditada'
    };

    setAtas([nova, ...atas]);
    setIsModalOpen(false);
    setVEspecie('');
    setVEnvelopes('');
    setVPix('');
    addToast('Ata de Contagem de Oferta Fechada com Dupla Assinatura Auditada!', 'success');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-red-950 border border-rose-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 shadow-lg shadow-rose-500/20">
            <ShieldAlert size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Governance & Internal Audit • Anti-Fraude
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Dupla Custódia & Ata de Contagem de Culto
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Workflow obrigatório de <strong className="text-rose-400">duplo controle (2 conferentes)</strong> para contagem de envelopes e espécie pós-culto com emissão de Ata Auditada.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} /> Abrir Nova Ata de Contagem
        </button>
      </div>

      {/* Atas Registradas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <FileSignature className="text-rose-400" size={20} /> Histórico de Atas Eletrônicas de Culto
        </h2>

        <div className="space-y-3">
          {atas.map(a => (
            <div key={a.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {a.cultoNome}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">{a.dataCulto}</span>
                </div>
                <h3 className="text-base font-black text-white">Total Arrecadado: R$ {a.totalGeralCulto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <p className="text-xs text-slate-400">
                  Dupla Assinatura: <strong className="text-slate-200">{a.conferente1}</strong> & <strong className="text-slate-200">{a.conferente2}</strong>
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span>Espécie: R$ {a.valorDinheiroEspecie.toFixed(2)}</span>
                  <span>•</span>
                  <span>Envelopes Dízimo: R$ {a.valorEnvelopesDizimo.toFixed(2)}</span>
                  <span>•</span>
                  <span>Pix / QR: R$ {a.valorPixCopiaCola.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedAta(a)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={15} className="text-rose-400" /> Imprimir Ata Auditada
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Imprimir Ata */}
      <AnimatePresence>
        {selectedAta && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-lg rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-rose-400">Ata Eletrônica Auditada de Contagem</span>
                <button onClick={() => setSelectedAta(null)} className="p-1 text-slate-400">✕</button>
              </div>

              <div className="p-6 bg-white text-slate-900 rounded-2xl shadow-xl space-y-3 font-serif text-xs leading-relaxed">
                <div className="text-center font-sans border-b border-slate-300 pb-2">
                  <h3 className="text-sm font-black text-slate-900">ATA ELETRÔNICA DE CONTAGEM DE OFERTAS & DÍZIMOS</h3>
                  <p className="text-[10px] text-slate-500">Igreja Evangélica Assembleia de Deus • GIPP</p>
                </div>

                <p>
                  Aos <strong>{selectedAta.dataCulto}</strong>, reuniram-se na sala da Tesouraria os conferentes credenciados para apuração dos valores ofertados no <strong>{selectedAta.cultoNome}</strong>.
                </p>

                <div className="bg-slate-100 p-3 rounded-xl font-sans text-[11px] space-y-1">
                  <div className="flex justify-between"><span>Valores em Espécie (Moeda Papel):</span><strong>R$ {selectedAta.valorDinheiroEspecie.toFixed(2)}</strong></div>
                  <div className="flex justify-between"><span>Envelopes Nominativos de Dízimo:</span><strong>R$ {selectedAta.valorEnvelopesDizimo.toFixed(2)}</strong></div>
                  <div className="flex justify-between"><span>Transações PIX do Culto:</span><strong>R$ {selectedAta.valorPixCopiaCola.toFixed(2)}</strong></div>
                  <div className="flex justify-between font-black text-slate-900 border-t border-slate-300 pt-1 text-sm"><span>TOTAL GERAL APURADO:</span><strong>R$ {selectedAta.totalGeralCulto.toFixed(2)}</strong></div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 text-center font-sans">
                  <div>
                    <div className="w-28 h-0.5 bg-slate-800 mx-auto mb-1" />
                    <strong className="block text-[10px] text-slate-900">{selectedAta.conferente1}</strong>
                    <span className="text-[9px] text-slate-500">Conferente 1 (Diaconato)</span>
                  </div>
                  <div>
                    <div className="w-28 h-0.5 bg-slate-800 mx-auto mb-1" />
                    <strong className="block text-[10px] text-slate-900">{selectedAta.conferente2}</strong>
                    <span className="text-[9px] text-slate-500">Conferente 2 (Tesouraria)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  window.print();
                  addToast('Imprimindo Ata de Contagem Auditada!', 'info');
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={16} /> Imprimir Ata de Contagem Auditada
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Nova Ata */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-black text-white">Nova Ata de Contagem de Oferta</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">✕</button>
              </div>

              <form onSubmit={handleCriarAta} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Conferente 1 *</label>
                    <input
                      type="text"
                      required
                      value={conf1}
                      onChange={e => setConf1(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Conferente 2 *</label>
                    <input
                      type="text"
                      required
                      value={conf2}
                      onChange={e => setConf2(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Dinheiro em Espécie (R$)</label>
                  <input
                    type="text"
                    value={vEspecie}
                    onChange={e => setVEspecie(e.target.value)}
                    placeholder="Ex: 3200,00"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Envelopes Nominativos de Dízimo (R$)</label>
                  <input
                    type="text"
                    value={vEnvelopes}
                    onChange={e => setVEnvelopes(e.target.value)}
                    placeholder="Ex: 12500,00"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Pix do Culto (R$)</label>
                  <input
                    type="text"
                    value={vPix}
                    onChange={e => setVPix(e.target.value)}
                    placeholder="Ex: 8900,00"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-xs font-black shadow-lg">Fechar & Assinar Ata</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
