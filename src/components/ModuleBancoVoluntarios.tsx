import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Award,
  FileCheck,
  Search,
  Plus,
  Briefcase,
  Phone,
  CheckCircle2,
  Printer,
  ShieldCheck,
  FileText,
  UserCheck
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface VoluntarioTalento {
  id: string;
  nome: string;
  telefone: string;
  profissaoTalento: string;
  areaAtuacao: 'Música' | 'Técnica & Som' | 'Pedagogia & Kids' | 'Elétrica / Obras' | 'Saúde' | 'Jurídico';
  departamento: string;
  termoAssinado: boolean;
  dataAdesao: string;
}

export default function ModuleBancoVoluntarios() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast, user } = context || {};

  const [voluntarios, setVoluntarios] = useState<VoluntarioTalento[]>([
    {
      id: 'v1',
      nome: 'Irmão Carlos Eduardo',
      telefone: '(11) 98888-1111',
      profissaoTalento: 'Técnico em Eletrotécnica & Manutenção',
      areaAtuacao: 'Elétrica / Obras',
      departamento: 'Zeladoria & Patrimônio',
      termoAssinado: true,
      dataAdesao: '10/01/2025'
    },
    {
      id: 'v2',
      nome: 'Jovem Amanda Lima',
      telefone: '(11) 97777-2222',
      profissaoTalento: 'Designer Gráfico & Operadora de Mídia',
      areaAtuacao: 'Técnica & Som',
      departamento: 'Mídia & Transmissão',
      termoAssinado: true,
      dataAdesao: '15/02/2025'
    },
    {
      id: 'v3',
      nome: 'Irmã Juliana Costa',
      telefone: '(11) 95555-4444',
      profissaoTalento: 'Pedagoga / Professora do Ensino Infantil',
      areaAtuacao: 'Pedagogia & Kids',
      departamento: 'Escola Dominical Infantil',
      termoAssinado: false,
      dataAdesao: '01/08/2026'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [termoGerado, setTermoGerado] = useState<VoluntarioTalento | null>(null);

  const filtered = voluntarios.filter(v =>
    v.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.profissaoTalento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.areaAtuacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssinarTermo = (vol: VoluntarioTalento) => {
    setVoluntarios(prev => prev.map(v => v.id === vol.id ? { ...v, termoAssinado: true } : v));
    setTermoGerado(vol);
    addToast(`Termo de Serviço Voluntário (Lei 9.608/98) gerado e assinado para ${vol.nome}!`, 'success');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/20">
            <Users size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Gestão de Talentos & Amparo Jurídico
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Voluntariado & Termos da Lei 9.608/98
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Mapeamento de profissões e talentos da igreja com <strong className="text-indigo-400">emissão automática do Termo de Adesão ao Serviço Voluntário Religioso</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <Search size={20} className="text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar voluntários por nome, profissão, competência ou área de atuação..."
          className="w-full bg-transparent text-xs font-bold text-white outline-none placeholder:text-slate-500"
        />
      </div>

      {/* Lista de Voluntários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(v => (
          <div key={v.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {v.areaAtuacao}
                </span>
                <h3 className="text-base font-black text-white mt-1">{v.nome}</h3>
              </div>

              {v.termoAssinado ? (
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  ✓ Termo Assinado
                </span>
              ) : (
                <span className="text-[10px] font-black text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">
                  ⏱ Pendente
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Briefcase size={14} className="text-indigo-400" /> {v.profissaoTalento}
            </p>
            <p className="text-xs text-slate-400">Departamento: {v.departamento}</p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">{v.telefone}</span>
              <button
                onClick={() => handleAssinarTermo(v)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1"
              >
                <FileCheck size={14} /> Emitir Termo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Termo Assinado */}
      <AnimatePresence>
        {termoGerado && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-xl rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-indigo-400">Termo Oficial de Serviço Voluntário</span>
                <button onClick={() => setTermoGerado(null)} className="p-1 text-slate-400">✕</button>
              </div>

              <div className="p-6 bg-white text-slate-900 rounded-2xl shadow-xl space-y-3 font-serif text-xs leading-relaxed">
                <div className="text-center font-sans border-b border-slate-300 pb-2">
                  <h3 className="text-sm font-black text-slate-900">TERMO DE ADESÃO AO SERVIÇO VOLUNTÁRIO RELIGIOSO</h3>
                  <p className="text-[10px] text-slate-500">Fundamentação Legal: Lei Federal nº 9.608 de 18 de Fevereiro de 1998</p>
                </div>

                <p>
                  Pelo presente instrumento, o(a) voluntário(a) <strong>{termoGerado.nome}</strong> adere livremente ao serviço voluntário prestado à <strong>Igreja Evangélica Assembleia de Deus (GIPP)</strong>, na área de <strong>{termoGerado.departamento}</strong>.
                </p>

                <p className="text-[11px] bg-slate-100 p-3 rounded-xl border border-slate-200 font-sans">
                  <strong>Cláusula Importante:</strong> O serviço prestado é de natureza cívica e religiosa, espontâneo e não remunerado, não gerando qualquer vínculo empregatício ou obrigação trabalhista/previdenciária.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-6 text-center font-sans">
                  <div>
                    <div className="w-28 h-0.5 bg-slate-800 mx-auto mb-1" />
                    <p className="text-[9px] font-bold text-slate-700">{termoGerado.nome}</p>
                  </div>
                  <div>
                    <div className="w-28 h-0.5 bg-slate-800 mx-auto mb-1" />
                    <p className="text-[9px] font-bold text-slate-700">Pr. Presidente / Diretoria</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  window.print();
                  addToast('Imprimindo Termo de Voluntariado!', 'info');
                }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={16} /> Imprimir Termo Assinado
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
