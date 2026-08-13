import React, { useState, useContext } from 'react';
import { motion } from 'motion/react';
import {
  SlidersHorizontal,
  Building,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Palette,
  Layers,
  Settings
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface FeatureFlagItem {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  categoria: 'Finanças' | 'Secretaria' | 'EBD' | 'AI & Automação';
}

export default function ModuleFeatureFlagsTenant() {
  const context = useContext(ChurchContext) as any;
  const { addToast } = context || {};

  const [flags, setFlags] = useState<FeatureFlagItem[]>([
    {
      id: 'flag_cfo',
      nome: 'Módulo CFO Executivo (Prebendas & Orçamento)',
      descricao: 'Habilita ferramentas avançadas de compliance fiscal, RDT, eSocial e duplo controle.',
      ativo: true,
      categoria: 'Finanças'
    },
    {
      id: 'flag_salinha_kids',
      nome: 'Salinha Kids & Controle com QR Code',
      descricao: 'Ativa etiquetas térmicas e controle de presença no ministério infantil.',
      ativo: true,
      categoria: 'Secretaria'
    },
    {
      id: 'flag_ai_pastoral',
      nome: 'Copilot AI Pastoral & Gerador de Esboços',
      descricao: 'Integração com modelos Gemini para auxílio exegético e elaboração de sermões.',
      ativo: true,
      categoria: 'AI & Automação'
    },
    {
      id: 'flag_whatsapp',
      nome: 'Disparo de WhatsApp via Baileys API',
      descricao: 'Envio automático de avisos, aniversariantes e lembretes de escala.',
      ativo: true,
      categoria: 'AI & Automação'
    }
  ]);

  const toggleFlag = (id: string) => {
    setFlags(flags.map(f => {
      if (f.id === id) {
        const novoStatus = !f.ativo;
        addToast(`Feature Flag "${f.nome}" ${novoStatus ? 'HABILITADA' : 'DESABILITADA'} para esta igreja!`, novoStatus ? 'success' : 'info');
        return { ...f, ativo: novoStatus };
      }
      return f;
    }));
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-violet-950 via-slate-900 to-fuchsia-950 border border-violet-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-violet-500/20 border border-violet-500/30 text-violet-400 shadow-lg shadow-violet-500/20">
            <SlidersHorizontal size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Multi-Tenant SaaS Architecture • Feature Management
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Feature Flags & Configuração por Tenant (Igreja)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Habilite ou desabilite dinamicamente recursos e módulos experimentais ou por plano contratado sem refazer deploy da aplicação.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Flags */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Settings className="text-violet-400" size={20} /> Matriz de Recursos do Tenant Ativo
        </h2>

        <div className="space-y-3">
          {flags.map(f => (
            <div key={f.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {f.categoria}
                </span>
                <h3 className="text-base font-black text-white">{f.nome}</h3>
                <p className="text-xs text-slate-400">{f.descricao}</p>
              </div>

              <button
                onClick={() => toggleFlag(f.id)}
                className="flex items-center gap-2 cursor-pointer transition-all"
              >
                {f.ativo ? (
                  <ToggleRight size={36} className="text-emerald-400" />
                ) : (
                  <ToggleLeft size={36} className="text-slate-600" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
