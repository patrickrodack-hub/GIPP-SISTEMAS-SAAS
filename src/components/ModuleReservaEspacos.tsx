import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Users,
  Sparkles,
  Building2,
  Volume2,
  Check
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface EspacoChurch {
  id: string;
  nome: string;
  capacidade: number;
  recursos: string[];
  status: 'Livre' | 'Ocupado' | 'Reservado';
}

export interface ReservaEspaco {
  id: string;
  espacoNome: string;
  evento: string;
  solicitante: string;
  departamento: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  precisaSom: boolean;
  precisaClimatizacao: boolean;
  statusZeladoria: 'Pendente' | 'Preparado';
}

export default function ModuleReservaEspacos() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast, user } = context || {};

  const [espacos] = useState<EspacoChurch[]>([
    { id: 'esp1', nome: 'Templo Principal (Nave)', capacidade: 500, recursos: ['Som Profissional', 'Projetor Laser', 'Ar-Condicionado'], status: 'Livre' },
    { id: 'esp2', nome: 'Salão Social EBD', capacidade: 120, recursos: ['Mesas & Cadeiras', 'Data Show', 'Cozinha de Apoio'], status: 'Reservado' },
    { id: 'esp3', nome: 'Sala EBD 01 (Kids)', capacidade: 30, recursos: ['TV Smart', 'Brinquedoteca', 'Climatizado'], status: 'Livre' },
    { id: 'esp4', nome: 'Gabinete Pastoral / Reunião', capacidade: 15, recursos: ['Mesa de Reunião', 'TV 55"', 'Cafeteira'], status: 'Livre' }
  ]);

  const [reservas, setReservas] = useState<ReservaEspaco[]>([
    {
      id: 'r1',
      espacoNome: 'Templo Principal (Nave)',
      evento: 'Ensaio Geral do Ministério de Louvor',
      solicitante: 'Ev. Fernando Dias',
      departamento: 'Louvor & Adoração',
      data: '15/08/2026',
      horarioInicio: '19:30',
      horarioFim: '21:30',
      precisaSom: true,
      precisaClimatizacao: true,
      statusZeladoria: 'Preparado'
    },
    {
      id: 'r2',
      espacoNome: 'Salão Social EBD',
      evento: 'Reunião da Diretoria de Casais',
      solicitante: 'Pb. André Luiz',
      departamento: 'Ministério da Família',
      data: '16/08/2026',
      horarioInicio: '15:00',
      horarioFim: '17:00',
      precisaSom: false,
      precisaClimatizacao: true,
      statusZeladoria: 'Pendente'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoEspaco, setNovoEspaco] = useState('Templo Principal (Nave)');
  const [novoEvento, setNovoEvento] = useState('');
  const [novoDepto, setNovoDepto] = useState('Jovens');
  const [novaData, setNovaData] = useState('17/08/2026');
  const [horaInicio, setHoraInicio] = useState('19:00');
  const [horaFim, setHoraFim] = useState('21:00');
  const [precisaSom, setPrecisaSom] = useState(true);
  const [precisaClima, setPrecisaClima] = useState(true);

  const handleCriarReserva = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEvento) return;

    // Verificar se já existe reserva no mesmo espaço e horário
    const conflito = reservas.find(r =>
      r.espacoNome === novoEspaco &&
      r.data === novaData &&
      r.horarioInicio === horaInicio
    );

    if (conflito) {
      addToast(`CONFLITO DE HORÁRIO! O espaço "${novoEspaco}" já está reservado para "${conflito.evento}".`, 'error');
      return;
    }

    const nova: ReservaEspaco = {
      id: `r_${Date.now()}`,
      espacoNome: novoEspaco,
      evento: novoEvento,
      solicitante: user?.nome || 'Líder Responsável',
      departamento: novoDepto,
      data: novaData,
      horarioInicio: horaInicio,
      horarioFim: horaFim,
      precisaSom,
      precisaClimatizacao: precisaClima,
      statusZeladoria: 'Pendente'
    };

    setReservas([nova, ...reservas]);
    setIsModalOpen(false);
    setNovoEvento('');
    addToast(`Reserva do espaço "${novoEspaco}" agendada sem conflitos! Zeladoria notificada.`, 'success');
  };

  const handleMarcarPreparado = (id: string) => {
    setReservas(prev => prev.map(r => r.id === id ? { ...r, statusZeladoria: 'Preparado' } : r));
    addToast('Espaço marcado como limpo, climatizado e preparado!', 'success');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border border-teal-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-400 shadow-lg shadow-teal-500/20">
            <Calendar size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Gestão de Templos & Espaços
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Reserva de Salas & Prevenção de Conflitos
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Agendamento de ensaios e reuniões com checagem automática de choque de horários e ordem de serviço para a equipe de zeladoria.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-teal-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} /> Agendar Espaço / Sala
        </button>
      </div>

      {/* Grid Espaços */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {espacos.map(e => (
          <div key={e.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-teal-400">Capacidade: {e.capacidade} psoas</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h3 className="text-base font-black text-white">{e.nome}</h3>
            <p className="text-[11px] text-slate-400">{e.recursos.join(' • ')}</p>
          </div>
        ))}
      </div>

      {/* Lista de Reservas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Clock className="text-teal-400" size={20} /> Agendamentos & Ordem de Zeladoria
        </h2>

        <div className="space-y-3">
          {reservas.map(r => (
            <div key={r.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {r.espacoNome}
                  </span>
                  <span className="text-xs text-slate-400">{r.data} ({r.horarioInicio} - {r.horarioFim})</span>
                </div>
                <h3 className="text-base font-black text-white">{r.evento}</h3>
                <p className="text-xs text-slate-400">Solicitante: {r.solicitante} ({r.departamento})</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  {r.precisaSom && <span>🔊 Som Ligado</span>}
                  {r.precisaClimatizacao && <span>❄️ Ar-Condicionado Ligado</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {r.statusZeladoria === 'Pendente' ? (
                  <button
                    onClick={() => handleMarcarPreparado(r.id)}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={15} /> Preparado p/ Zeladoria
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-emerald-950 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-800 flex items-center gap-1">
                    ✓ Espaço Limpo e Climatizado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Agendamento */}
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
                <h3 className="text-base font-black text-white">Reservar Espaço da Igreja</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">✕</button>
              </div>

              <form onSubmit={handleCriarReserva} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Selecione o Espaço *</label>
                  <select
                    value={novoEspaco}
                    onChange={e => setNovoEspaco(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white"
                  >
                    {espacos.map(e => <option key={e.id} value={e.nome}>{e.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nome do Evento / Ensaio *</label>
                  <input
                    type="text"
                    required
                    value={novoEvento}
                    onChange={e => setNovoEvento(e.target.value)}
                    placeholder="Ex: Ensaio de Teatro Páscoa"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Data</label>
                    <input
                      type="text"
                      value={novaData}
                      onChange={e => setNovaData(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Horário Início</label>
                    <input
                      type="text"
                      value={horaInicio}
                      onChange={e => setHoraInicio(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-teal-600 text-white rounded-xl text-xs font-black shadow-lg">Confirmar Reserva</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
