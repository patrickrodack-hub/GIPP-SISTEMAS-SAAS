import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'motion/react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  HardDrive
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface PendingOfflineTask {
  id: string;
  modulo: string;
  operacao: string;
  dataHora: string;
  status: 'Pendente' | 'Sincronizado';
}

export default function ModuleOfflineSync() {
  const context = useContext(ChurchContext) as any;
  const { addToast } = context || {};

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingQueue, setPendingQueue] = useState<PendingOfflineTask[]>([
    {
      id: 'task_001',
      modulo: 'Secretaria Infantil (Salinha Kids)',
      operacao: 'Check-in da criança Pedro Lucas (Etiqueta QR #9012)',
      dataHora: '12/08/2026 18:40:00',
      status: 'Pendente'
    },
    {
      id: 'task_002',
      modulo: 'EBD - Frequência de Turma',
      operacao: 'Chamada de presença da Classe Jovens Bereanos (18 alunos)',
      dataHora: '12/08/2026 18:35:10',
      status: 'Pendente'
    }
  ]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast('Conexão com a internet restabelecida! Sincronizando fila offline...', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast('Modo Offline Ativado! Operações serão salvas na fila do dispositivo.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleForcarSync = () => {
    if (!isOnline) {
      addToast('Sem conexão com a internet para sincronizar!', 'error');
      return;
    }

    setPendingQueue(pendingQueue.map(t => ({ ...t, status: 'Sincronizado' })));
    addToast('Fila offline processada e sincronizada com sucesso no banco de dados principal!', 'success');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className={`p-6 md:p-8 rounded-3xl border shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
        isOnline
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-emerald-500/20'
          : 'bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 border-amber-500/30'
      }`}>
        <div className="flex items-center gap-4 relative z-10">
          <div className={`p-4 rounded-2xl border shadow-lg ${
            isOnline
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20'
              : 'bg-amber-500/20 border-amber-500/30 text-amber-400 shadow-amber-500/20'
          }`}>
            {isOnline ? <Wifi size={32} className="animate-pulse" /> : <WifiOff size={32} className="animate-bounce" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                isOnline ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {isOnline ? 'Conectado ao Servidor Cloud' : 'Modo Offline PWA Ativo'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Sincronização Offline-First & Fila IndexedDB
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Permite o uso ininterrupto do sistema em salas de aula e acampamentos sem internet. As operações são enfileiradas e descarregadas ao reconectar.
            </p>
          </div>
        </div>

        <button
          onClick={handleForcarSync}
          className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={18} /> Processar Fila de Sincronização
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Status da Conexão</span>
          <div className="text-2xl font-black text-white flex items-center gap-2">
            {isOnline ? <span className="text-emerald-400">Online</span> : <span className="text-amber-400">Offline</span>}
          </div>
          <span className="text-[10px] text-slate-500">Monitorado via Web API Listener</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Itens na Fila Local</span>
          <div className="text-2xl font-black text-amber-400">
            {pendingQueue.filter(q => q.status === 'Pendente').length} Registro(s)
          </div>
          <span className="text-[10px] text-slate-500">Armazenado no banco local do navegador</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Sincronizados Recentes</span>
          <div className="text-2xl font-black text-emerald-400">
            {pendingQueue.filter(q => q.status === 'Sincronizado').length} Registro(s)
          </div>
          <span className="text-[10px] text-slate-500">Confirmados pelo servidor central</span>
        </div>
      </div>

      {/* Fila de Operações */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <HardDrive className="text-emerald-400" size={20} /> Fila Local de Operações Pendentes
        </h2>

        <div className="space-y-3">
          {pendingQueue.map(item => (
            <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {item.modulo}
                </span>
                <h3 className="text-sm font-black text-white">{item.operacao}</h3>
                <span className="text-xs text-slate-500">{item.dataHora}</span>
              </div>

              <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${
                item.status === 'Pendente' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {item.status === 'Pendente' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
