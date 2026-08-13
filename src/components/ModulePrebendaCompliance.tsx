import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileCheck,
  Printer,
  ShieldCheck,
  DollarSign,
  User,
  Plus,
  Building,
  Sparkles,
  Download,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface PrebendaPastoral {
  id: string;
  pastorNome: string;
  cargoMinistério: string;
  cpf: string;
  valorBruto: number;
  inssRetido: number;
  irrfRetido: number;
  valorLiquido: number;
  mesReferencia: string;
  status: 'Emitido' | 'Pago';
}

export default function ModulePrebendaCompliance() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast, user } = context || {};

  const [prebendas, setPrebendas] = useState<PrebendaPastoral[]>([
    {
      id: 'pr1',
      pastorNome: 'Pr. Antônio Carlos de Oliveira',
      cargoMinistério: 'Pastor Presidente do Campo',
      cpf: '123.456.789-00',
      valorBruto: 8500.00,
      inssRetido: 935.00, // 11% teto autônomo
      irrfRetido: 420.50,
      valorLiquido: 7144.50,
      mesReferencia: 'Julho / 2026',
      status: 'Pago'
    },
    {
      id: 'pr2',
      pastorNome: 'Ev. Fernando Dias',
      cargoMinistério: 'Evangelista e Coordenador EBD',
      cpf: '987.654.321-11',
      valorBruto: 4200.00,
      inssRetido: 462.00,
      irrfRetido: 180.00,
      valorLiquido: 3558.00,
      mesReferencia: 'Julho / 2026',
      status: 'Pago'
    }
  ]);

  const [selectedRdt, setSelectedRdt] = useState<PrebendaPastoral | null>(null);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border border-amber-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/20">
            <FileCheck size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Compliance Tributário Eclesiástico • Prebendas
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Recibo de Sustento Ministerial (RDT / Prebendas)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Emissão de RDT e apuração de tributos (INSS/IRRF autônomo) em conformidade com o Art. 3º §2º da CLT e regramento fiscal para EFD-Reinf/eSocial.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            addToast('Exportando arquivo consolidado para transmissão eSocial / EFD-Reinf!', 'info');
          }}
          className="px-5 py-3.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download size={18} /> Exportar EFD-Reinf / eSocial
        </button>
      </div>

      {/* RDTs Registrados */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <ShieldCheck className="text-amber-400" size={20} /> Prebendas Pastorais do Período
        </h2>

        <div className="space-y-3">
          {prebendas.map(p => (
            <div key={p.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {p.mesReferencia}
                  </span>
                  <span className="text-xs font-bold text-slate-400">CPF: {p.cpf}</span>
                </div>
                <h3 className="text-base font-black text-white">{p.pastorNome}</h3>
                <p className="text-xs text-slate-400">{p.cargoMinistério}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span>Bruto: R$ {p.valorBruto.toFixed(2)}</span>
                  <span>•</span>
                  <span>INSS: R$ {p.inssRetido.toFixed(2)}</span>
                  <span>•</span>
                  <span>IRRF: R$ {p.irrfRetido.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Valor Líquido</span>
                  <strong className="text-amber-400 font-black text-lg">R$ {p.valorLiquido.toFixed(2)}</strong>
                </div>

                <button
                  onClick={() => setSelectedRdt(p)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={15} className="text-amber-400" /> Imprimir RDT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Imprimir RDT Oficial */}
      <AnimatePresence>
        {selectedRdt && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-lg rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400">Recibo de Sustento Ministerial (RDT)</span>
                <button onClick={() => setSelectedRdt(null)} className="p-1 text-slate-400">✕</button>
              </div>

              <div className="p-6 bg-white text-slate-900 rounded-2xl shadow-xl space-y-3 font-serif text-xs leading-relaxed">
                <div className="text-center font-sans border-b border-slate-300 pb-2">
                  <h3 className="text-sm font-black text-slate-900">RECIBO DE SUSTENTO MINISTERIAL (RDT / PREBENDA)</h3>
                  <p className="text-[10px] text-slate-500">Igreja Evangélica Assembleia de Deus • GIPP</p>
                </div>

                <p>
                  Recebi da <strong>Igreja Evangélica Assembleia de Deus (GIPP)</strong> a quantia líquida de <strong>R$ {selectedRdt.valorLiquido.toFixed(2)}</strong> referente ao prebenda/sustento pastoral relativo ao mês de <strong>{selectedRdt.mesReferencia}</strong>.
                </p>

                <div className="bg-slate-100 p-3 rounded-xl font-sans text-[11px] space-y-1">
                  <div className="flex justify-between"><span>Sustento Bruto:</span><strong>R$ {selectedRdt.valorBruto.toFixed(2)}</strong></div>
                  <div className="flex justify-between text-rose-700"><span>(-) Retenção INSS Autônomo:</span><span>R$ {selectedRdt.inssRetido.toFixed(2)}</span></div>
                  <div className="flex justify-between text-rose-700"><span>(-) Retenção IRRF Fonte:</span><span>R$ {selectedRdt.irrfRetido.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-300 pt-1"><span>LÍQUIDO RECEBIDO:</span><strong>R$ {selectedRdt.valorLiquido.toFixed(2)}</strong></div>
                </div>

                <p className="text-[10px] text-slate-500 font-sans italic">
                  Fundamentação Legal: O valor percebido refere-se estritamente à prebenda pastoral para dedicação integral às obras religiosas, sem natureza de salário ou vínculo empregatício CLT conforme Art. 3º, § 2º da CLT.
                </p>

                <div className="pt-6 text-center font-sans">
                  <div className="w-36 h-0.5 bg-slate-800 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-slate-900">{selectedRdt.pastorNome}</p>
                  <p className="text-[9px] text-slate-500">{selectedRdt.cargoMinistério} • CPF: {selectedRdt.cpf}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  window.print();
                  addToast('Imprimindo Recibo de Sustento Ministerial RDT!', 'info');
                }}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={16} /> Imprimir RDT Oficial
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
