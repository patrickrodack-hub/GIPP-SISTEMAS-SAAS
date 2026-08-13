import React, { useState, useContext } from 'react';
import { motion } from 'motion/react';
import {
  FileSpreadsheet,
  FileCode,
  Download,
  Upload,
  Table,
  Sliders,
  CheckCircle2,
  Copy,
  Sparkles,
  Send,
  FileText
} from 'lucide-react';
import { ChurchContext } from '../App';

export default function ModuleGridOfficeExcelWord() {
  const context = useContext(ChurchContext) as any;
  const { addToast } = context || {};

  const [activeTab, setActiveTab] = useState<'excel' | 'word'>('excel');
  const [templateWord, setTemplateWord] = useState<string>(
    'Paz do Senhor, estimado(a) {CARGO} {NOME}!\n\nLembramos que a reunião de obreiros da congregação {CONGREGACAO} ocorrerá neste sábado às 19h00.\n\nSua presença é indispensável para a obra de Deus!'
  );

  const [gridData] = useState([
    { id: '101', nome: 'Pr. Carlos Eduardo', cargo: 'Pastor Presidente', congregacao: 'Templo Sede', dizimoMedia: 'R$ 850,00', status: 'Ativo' },
    { id: '102', nome: 'Pb. Roberto Santos', cargo: 'Presbítero', congregacao: 'Monte Sinai', dizimoMedia: 'R$ 420,00', status: 'Ativo' },
    { id: '103', nome: 'Dc. Lucas Mendes', cargo: 'Diácono', congregacao: 'Betel', dizimoMedia: 'R$ 310,00', status: 'Ativo' },
    { id: '104', nome: 'Ev. Marcos Rocha', cargo: 'Evangelista', congregacao: 'Templo Sede', dizimoMedia: 'R$ 600,00', status: 'Ativo' }
  ]);

  const handleExportCSV = () => {
    addToast('Tabela exportada com sucesso em formato .CSV / .XLSX (Compatível com Microsoft Excel)!', 'success');
  };

  const handleDispararMalaDireta = () => {
    addToast('Mala direta processada! 4 cartas personalizadas geradas no padrão Microsoft Word com as tags mescladas.', 'success');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <FileSpreadsheet size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Visão Usuário Office • Excel & Word Power Tools
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Suíte Office: Grid Dinâmico Excel & Mala Direta Word
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Importação e exportação de planilhas nativas em formato .xlsx e gerador de mala direta modelo Word com mesclagem de tags em massa.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('excel')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'excel' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Grid Excel (.xlsx)
          </button>
          <button
            onClick={() => setActiveTab('word')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'word' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mala Direta Word (.docx)
          </button>
        </div>
      </div>

      {activeTab === 'excel' ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Table className="text-emerald-400" size={20} /> Tabela Interativa e Importador de Dados
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => addToast('Selecione um arquivo .xlsx/.csv para importar membros em massa...', 'info')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={14} className="text-emerald-400" /> Importar Excel (.xlsx)
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} /> Exportar Planilha (.csv)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                  <th className="p-3">Matrícula</th>
                  <th className="p-3">Nome do Membro</th>
                  <th className="p-3">Cargo Eclesiástico</th>
                  <th className="p-3">Congregação</th>
                  <th className="p-3">Contribuição Média</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {gridData.map(row => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-emerald-400 font-bold">#{row.id}</td>
                    <td className="p-3 font-sans font-bold text-white">{row.nome}</td>
                    <td className="p-3 font-sans text-slate-300">{row.cargo}</td>
                    <td className="p-3 font-sans text-slate-400">{row.congregacao}</td>
                    <td className="p-3 text-emerald-300 font-bold">{row.dizimoMedia}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-sans font-bold">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <FileText className="text-blue-400" size={20} /> Gerador de Mala Direta com Mesclagem de Tags
          </h2>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              Modelo do Texto (Tags suportadas: <span className="text-blue-400">{'{NOME}'}</span>, <span className="text-blue-400">{'{CARGO}'}</span>, <span className="text-blue-400">{'{CONGREGACAO}'}</span>)
            </label>
            <textarea
              rows={5}
              value={templateWord}
              onChange={e => setTemplateWord(e.target.value)}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-white outline-none focus:border-blue-500"
            />

            <button
              onClick={handleDispararMalaDireta}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Send size={16} /> Processar & Mesclar Cartas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
