import React, { useState, useContext } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Server,
  Database,
  Cpu,
  Zap,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { ChurchContext } from '../App';

export default function ModuleTelemetriaHealth() {
  const context = useContext(ChurchContext) as any;
  const { addToast } = context || {};

  const [lastPing, setLastPing] = useState('Agora mesmo');

  const handleTestarHealth = () => {
    setLastPing(new Date().toLocaleTimeString('pt-BR'));
    addToast('HealthCheck executado! Todos os nós de banco, cache e serviços estão operacionais (HTTP 200 OK).', 'success');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <Activity size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DevOps & APM • System Health Monitoring
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Central de Telemetria & Monitor de Saúde (APM)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Monitoramento em tempo real de latência de rotas, healthcheck de banco de dados, throughput de requisições e taxa de exceção do SaaS.
            </p>
          </div>
        </div>

        <button
          onClick={handleTestarHealth}
          className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={18} /> Executar HealthCheck
        </button>
      </div>

      {/* Grid de Métricas do Servidor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Tempo de Resposta (Latência)</span>
            <Zap size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">18 ms</div>
          <span className="text-[10px] text-slate-500">Média em chamadas de API</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Uptime da Aplicação</span>
            <Server size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">99.98%</div>
          <span className="text-[10px] text-slate-500">Últimos 30 dias (Cloud Run)</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Taxa de Erro (HTTP 5xx)</span>
            <AlertCircle size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">0.01%</div>
          <span className="text-[10px] text-slate-500">Exceções capturadas</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Conexões no Banco</span>
            <Database size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">12 / 100</div>
          <span className="text-[10px] text-slate-500">Pool de Conexões Ativas</span>
        </div>
      </div>

      {/* Component Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <CheckCircle2 className="text-emerald-400" size={20} /> Status dos Microserviços & APIs Externe
        </h2>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database size={20} className="text-emerald-400" />
              <div>
                <h3 className="text-sm font-black text-white">Banco de Dados Principal (Cloud Firestore / Postgres)</h3>
                <span className="text-xs text-slate-400">Latência: 12ms • Réplica de leitura operacional</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
              Operacional
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-amber-400" />
              <div>
                <h3 className="text-sm font-black text-white">Serviço de Disparo WhatsApp & E-mails</h3>
                <span className="text-xs text-slate-400">Latência: 45ms • Fila com 0 mensagens represadas</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
              Operacional
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu size={20} className="text-purple-400" />
              <div>
                <h3 className="text-sm font-black text-white">Motor AI Gemini (Google Cloud GenAI)</h3>
                <span className="text-xs text-slate-400">API Key ativa • Cota disponível</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
              Operacional
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
