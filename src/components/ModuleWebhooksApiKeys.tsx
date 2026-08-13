import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Key,
  Webhook,
  Plus,
  Copy,
  Trash2,
  Check,
  ShieldCheck,
  Globe,
  Send,
  Sparkles,
  Code
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface ApiKeyItem {
  id: string;
  nome: string;
  chaveExibicao: string;
  escopo: 'Somente Leitura' | 'Acesso Total';
  criadoEm: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  eventos: string[];
  status: 'Ativo' | 'Inativo';
}

export default function ModuleWebhooksApiKeys() {
  const context = useContext(ChurchContext) as any;
  const { addToast } = context || {};

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key_1',
      nome: 'Integração ERP Contábil Outer',
      chaveExibicao: 'gipp_live_9a87d6f54e321cb09876...',
      escopo: 'Somente Leitura',
      criadoEm: '10/08/2026'
    },
    {
      id: 'key_2',
      nome: 'Catraca Física do Templo Sede',
      chaveExibicao: 'gipp_live_1234567890abcdef1234...',
      escopo: 'Acesso Total',
      criadoEm: '01/08/2026'
    }
  ]);

  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    {
      id: 'wh_1',
      url: 'https://api.activecampaign.com/hooks/gipp_membros',
      eventos: ['member.created', 'member.updated'],
      status: 'Ativo'
    },
    {
      id: 'wh_2',
      url: 'https://hooks.zapier.com/hooks/catch/12345/dizimos',
      eventos: ['tithe.received'],
      status: 'Ativo'
    }
  ]);

  const handleCopy = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(id);
    addToast('Chave de API copiada para a área de transferência!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGerarChave = () => {
    const nova: ApiKeyItem = {
      id: `key_${Date.now()}`,
      nome: 'Nova Chave de Integração API',
      chaveExibicao: `gipp_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      escopo: 'Acesso Total',
      criadoEm: 'Hoje'
    };
    setApiKeys([...apiKeys, nova]);
    addToast('Nova Chave de API gerada com sucesso!', 'success');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Webhook size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                SaaS Integration Engine • REST API & Webhooks
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Gerenciador de API Keys & Webhooks Outbound
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Integre o GIPP a catracas, ERPs, ActiveCampaign e Zapier/Make via chamadas REST e disparos automáticos de eventos HTTP.
            </p>
          </div>
        </div>

        <button
          onClick={handleGerarChave}
          className="px-5 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-cyan-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} /> Gerar Nova Chave API
        </button>
      </div>

      {/* Grid Chaves de API */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Key className="text-cyan-400" size={20} /> Chaves de API Ativas (Secret Credentials)
        </h2>

        <div className="space-y-3">
          {apiKeys.map(k => (
            <div key={k.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-sans">
                  {k.escopo}
                </span>
                <h3 className="text-sm font-black text-white font-sans">{k.nome}</h3>
                <span className="text-xs text-slate-400">{k.chaveExibicao}</span>
              </div>

              <button
                onClick={() => handleCopy(k.chaveExibicao, k.id)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === k.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedId === k.id ? 'Copiado!' : 'Copiar Key'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks Outbound */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Globe className="text-cyan-400" size={20} /> Endpoints de Webhook Disparados
        </h2>

        <div className="space-y-3">
          {webhooks.map(w => (
            <div key={w.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {w.status}
                </span>
                <h3 className="text-xs font-mono text-cyan-300 break-all">{w.url}</h3>
                <div className="flex flex-wrap gap-1 pt-1">
                  {w.eventos.map((ev, idx) => (
                    <span key={idx} className="text-[9px] font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                      {ev}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => addToast(`Disparado payload de teste para ${w.url}`, 'info')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={14} className="text-cyan-400" /> Testar Webhook
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
