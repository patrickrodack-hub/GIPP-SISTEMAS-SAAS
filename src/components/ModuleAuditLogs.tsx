import React, { useState, useContext } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Search,
  Filter,
  User,
  Clock,
  Database,
  FileCode,
  Key,
  RefreshCw,
  Eye,
  Lock,
  Download
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  usuarioEmail: string;
  usuarioNome: string;
  acao: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT';
  modulo: string;
  detalhes: string;
  ipOrigem: string;
}

export default function ModuleAuditLogs() {
  const context = useContext(ChurchContext) as any;
  const { addToast } = context || {};

  const [logs] = useState<AuditLogItem[]>([
    {
      id: 'log_1001',
      timestamp: '12/08/2026 18:45:12',
      usuarioEmail: 'tesouraria@igreja.org',
      usuarioNome: 'Diácono Roberto Alves',
      acao: 'CREATE',
      modulo: 'Dupla Custódia & Ofertas',
      detalhes: 'Criou nova Ata de Contagem de Culto #ATA-8921 (R$ 24.640,00)',
      ipOrigem: '189.122.45.10'
    },
    {
      id: 'log_1002',
      timestamp: '12/08/2026 18:30:05',
      usuarioEmail: 'pastor@igreja.org',
      usuarioNome: 'Pr. Antônio Carlos',
      acao: 'UPDATE',
      modulo: 'Cotações & Compras',
      detalhes: 'Aprovou o Pedido de Compra #SC-3410 (Projetor Laser 4000 Lumens)',
      ipOrigem: '201.87.12.99'
    },
    {
      id: 'log_1003',
      timestamp: '12/08/2026 17:15:40',
      usuarioEmail: 'secretaria@igreja.org',
      usuarioNome: 'Irmã Juliana Costa',
      acao: 'CREATE',
      modulo: 'Cadastro de Membros',
      detalhes: 'Cadastrou novo membro congregado (Mateus Oliveira - Tel: 11988887777)',
      ipOrigem: '177.34.88.102'
    },
    {
      id: 'log_1004',
      timestamp: '12/08/2026 16:10:00',
      usuarioEmail: 'tesouraria@igreja.org',
      usuarioNome: 'Diácono Roberto Alves',
      acao: 'EXPORT',
      modulo: 'Prebendas & RDT',
      detalhes: 'Exportou lote de RDTs do mês de Julho para transmissão eSocial/EFD-Reinf',
      ipOrigem: '189.122.45.10'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcao, setFilterAcao] = useState<string>('TODOS');

  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      l.usuarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.detalhes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAcao = filterAcao === 'TODOS' || l.acao === filterAcao;
    return matchesSearch && matchesAcao;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-700/80 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/20">
            <ShieldCheck size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Security & Compliance Audit
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Trilha de Auditoria Imutável (Audit Logs)
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Registro contínuo e imutável de todas as ações de escrita, alteração, exclusão e exportação executadas pelos usuários do sistema.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            addToast('Exportando relatório de auditoria em CSV/JSON para conformidade!', 'info');
          }}
          className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-2xl border border-slate-700 shadow-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download size={18} className="text-indigo-400" /> Exportar Audit Logs
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <Search size={20} className="text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por operador, módulo, ação ou palavra-chave..."
            className="w-full bg-transparent text-xs font-bold text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-bold uppercase">Filtrar Ação:</span>
          <select
            value={filterAcao}
            onChange={e => setFilterAcao(e.target.value)}
            className="bg-slate-800 text-xs font-bold text-white px-3 py-1.5 rounded-xl border border-slate-700 outline-none"
          >
            <option value="TODOS">Todas as Ações</option>
            <option value="CREATE">CREATE (Inclusão)</option>
            <option value="UPDATE">UPDATE (Alteração)</option>
            <option value="DELETE">DELETE (Exclusão)</option>
            <option value="EXPORT">EXPORT (Exportação)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Clock className="text-indigo-400" size={20} /> Eventos de Auditoria Recentes
          </h2>
          <span className="text-xs text-slate-400 font-bold">{filteredLogs.length} eventos registrados</span>
        </div>

        <div className="space-y-3">
          {filteredLogs.map(l => (
            <div key={l.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    l.acao === 'CREATE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    l.acao === 'UPDATE' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    l.acao === 'DELETE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {l.acao}
                  </span>
                  <span className="text-xs text-slate-400 font-sans font-bold">{l.modulo}</span>
                  <span className="text-xs text-slate-600">•</span>
                  <span className="text-xs text-slate-500">{l.timestamp}</span>
                </div>

                <p className="text-xs text-slate-200 font-sans">{l.detalhes}</p>
                <div className="text-[10px] text-slate-500 font-sans">
                  Operador: <strong className="text-slate-300">{l.usuarioNome}</strong> ({l.usuarioEmail}) — IP: {l.ipOrigem}
                </div>
              </div>

              <span className="text-[10px] text-slate-500 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
                {l.id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
