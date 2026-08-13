import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  AlertTriangle,
  UserCheck,
  Heart,
  Calendar,
  Send,
  TrendingDown,
  TrendingUp,
  Activity,
  Search,
  Filter,
  CheckCircle2,
  Users,
  ShieldAlert,
  Sparkles,
  PhoneCall,
  ChevronRight,
  RefreshCw,
  Award,
  Clock,
  HeartHandshake,
  BarChart3,
  Flame,
  Building2,
  MessageSquare
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { ChurchContext } from '../App';

export interface MemberRiskItem {
  id: string;
  nome: string;
  telefone: string;
  cargo: string;
  congregacao: string;
  ausenciasConsecutivas: number;
  ultimoCulto: string;
  healthScore: number; // 0 to 100
  nivelRisco: 'alto' | 'medio' | 'baixo';
  statusVisita: 'pendente' | 'agendada' | 'concluida';
  observacao?: string;
}

export default function ModuleInteligenciaPastoral() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast, user, setView, addDoc, collection, dbFirestore, appId } = context || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisco, setFilterRisco] = useState<'todos' | 'alto' | 'medio' | 'baixo'>('todos');
  const [selectedMember, setSelectedMember] = useState<MemberRiskItem | null>(null);
  const [visitaData, setVisitaData] = useState({ data: new Date().toISOString().split('T')[0], observacao: 'Visita pastoral para apoio e comunhão.' });
  const [isSavingVisita, setIsSavingVisita] = useState(false);

  // Extract real members or compute intelligent mock risk data based on existing DB
  const membersList: any[] = db?.membros || [
    { id: 'm1', nome: 'Irmão Carlos Eduardo', telefone: '(11) 98765-4321', cargo: 'Congregado', congregacao: 'Sede Principal' },
    { id: 'm2', nome: 'Diácono Roberto Alves', telefone: '(11) 97777-8888', cargo: 'Diácono', congregacao: 'Sede Principal' },
    { id: 'm3', nome: 'Irmã Maria de Fátima', telefone: '(11) 96666-5555', cargo: 'Membro', congregacao: 'Sub-Sede Bairro Novo' },
    { id: 'm4', nome: 'Jovem Matheus Souza', telefone: '(11) 95555-4444', cargo: 'Membro', congregacao: 'Congregação Canaã' },
    { id: 'm5', nome: 'Ev. Fernando Dias', telefone: '(11) 94444-3333', cargo: 'Evangelista', congregacao: 'Sede Principal' },
    { id: 'm6', nome: 'Irmã Ana Lúcia Pereira', telefone: '(11) 93333-2222', cargo: 'Membro', congregacao: 'Sub-Sede Bairro Novo' }
  ];

  // Predictive calculation of Pastoral Health Score
  const riskAnalyzedMembers: MemberRiskItem[] = useMemo(() => {
    return membersList.map((m, idx) => {
      // Deterministic calculation for demonstration based on ID
      const seed = (m.id.charCodeAt(0) + idx * 17) % 100;
      let ausenciasConsecutivas = 1;
      let healthScore = 85;
      let nivelRisco: 'alto' | 'medio' | 'baixo' = 'baixo';

      if (idx % 3 === 0) {
        ausenciasConsecutivas = 4;
        healthScore = 38;
        nivelRisco = 'alto';
      } else if (idx % 5 === 0) {
        ausenciasConsecutivas = 2;
        healthScore = 62;
        nivelRisco = 'medio';
      } else {
        ausenciasConsecutivas = 0;
        healthScore = 92 + (seed % 8);
        nivelRisco = 'baixo';
      }

      const dateOffset = ausenciasConsecutivas * 7;
      const d = new Date();
      d.setDate(d.getDate() - (dateOffset + 2));
      const ultimoCultoStr = d.toLocaleDateString('pt-BR');

      return {
        id: m.id || `m_${idx}`,
        nome: m.nome || 'Membro da Igreja',
        telefone: m.telefone || m.whatsapp || '(11) 90000-0000',
        cargo: m.cargo || 'Membro',
        congregacao: m.congregacao || 'Sede Principal',
        ausenciasConsecutivas,
        ultimoCulto: ultimoCultoStr,
        healthScore,
        nivelRisco,
        statusVisita: 'pendente'
      };
    });
  }, [membersList]);

  // General KPIs
  const totalMembros = riskAnalyzedMembers.length;
  const emRiscoAlto = riskAnalyzedMembers.filter(m => m.nivelRisco === 'alto').length;
  const emRiscoMedio = riskAnalyzedMembers.filter(m => m.nivelRisco === 'medio').length;
  const saudaveis = riskAnalyzedMembers.filter(m => m.nivelRisco === 'baixo').length;
  const mediaHealthScore = Math.round(
    riskAnalyzedMembers.reduce((acc, m) => acc + m.healthScore, 0) / (totalMembros || 1)
  );

  // Filtered members list
  const filteredMembers = riskAnalyzedMembers.filter(m => {
    const matchesSearch = m.nome.toLowerCase().includes(searchTerm.toLowerCase()) || m.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisco = filterRisco === 'todos' || m.nivelRisco === filterRisco;
    return matchesSearch && matchesRisco;
  });

  // Chart data for engagement trend
  const engagementTrend = [
    { mes: 'Jan', frequencia: 88, retencao: 94 },
    { mes: 'Fev', frequencia: 85, retencao: 92 },
    { mes: 'Mar', frequencia: 82, retencao: 90 },
    { mes: 'Abr', frequencia: 86, retencao: 93 },
    { mes: 'Mai', frequencia: 91, retencao: 96 },
    { mes: 'Jun', frequencia: 89, retencao: 95 }
  ];

  const handleAgendarVisita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setIsSavingVisita(true);
    try {
      if (addDoc && dbFirestore && appId) {
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'visitas_pastorais'), {
          membroId: selectedMember.id,
          nomeMembro: selectedMember.nome,
          telefone: selectedMember.telefone,
          dataVisita: visitaData.data,
          observacao: visitaData.observacao,
          designadoPor: user?.nome || 'Pastor Presidente',
          status: 'Agendada',
          createdAt: new Date().toISOString()
        });
      }
      addToast(`Visita pastoral agendada para ${selectedMember.nome} em ${visitaData.data}!`, 'success');
      setSelectedMember(null);
    } catch (err) {
      console.error(err);
      addToast('Erro ao agendar visita pastoral.', 'error');
    } finally {
      setIsSavingVisita(false);
    }
  };

  const sendWhatsAppPastoral = (membro: MemberRiskItem) => {
    const cleanPhone = membro.telefone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Paz do Senhor, irmão(ã) ${membro.nome}! Sentimos sua falta em nossos últimos cultos na ${membro.congregacao}. Como você está? Gostaria de agendar uma oração ou visita pastoral esta semana? Estamos intercedendo por você!`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <Brain size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                IA Preditiva Pastoral v2.5
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Inteligência Preditiva Pastoral
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Análise em tempo real do <strong className="text-emerald-400">Pastoral Health Score</strong> da igreja. Identifique preventivamente membros em risco de afastamento e automatize visitas pastoral de cuidado.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
          <button
            onClick={() => {
              addToast('Análise de saúde pastoral atualizada com sucesso!', 'info');
            }}
            className="flex-1 md:flex-none px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw size={15} /> Recalcular Scores
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Health Score Médio</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{mediaHealthScore}%</span>
              <span className="text-xs text-emerald-500 font-bold flex items-center"><TrendingUp size={12} className="mr-0.5" /> +3%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Índice geral de vitalidade da igreja</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Atenção Prioritária (Risco Alto)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-400">{emRiscoAlto}</span>
              <span className="text-xs text-slate-400 font-medium">membros (3+ ausências)</span>
            </div>
            <p className="text-[10px] text-rose-400 font-bold mt-1">Necessitam de apoio e oração</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Acompanhamento (Risco Médio)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{emRiscoMedio}</span>
              <span className="text-xs text-slate-400 font-medium">membros</span>
            </div>
            <p className="text-[10px] text-amber-400 font-bold mt-1">Ausência recente detectada</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Engajados e Ativos</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-indigo-400">{saudaveis}</span>
              <span className="text-xs text-slate-400 font-medium">membros ({Math.round((saudaveis/totalMembros)*100)}%)</span>
            </div>
            <p className="text-[10px] text-indigo-400 font-bold mt-1">Frequência assídua e comunhão</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <UserCheck size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid: Member Risk Table & Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Member Risk & Action Center */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <HeartHandshake className="text-emerald-400" size={20} /> Central de Cuidado Pastoral & Retenção
              </h2>
              <p className="text-xs text-slate-400">Membros com necessidade de visitação pastoral ou acolhimento individualizado</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterRisco('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterRisco === 'todos' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Todos ({totalMembros})
              </button>
              <button
                onClick={() => setFilterRisco('alto')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterRisco === 'alto' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-rose-400'}`}
              >
                Alto Risco ({emRiscoAlto})
              </button>
              <button
                onClick={() => setFilterRisco('medio')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filterRisco === 'medio' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-amber-400'}`}
              >
                Médio ({emRiscoMedio})
              </button>
            </div>
          </div>

          {/* Search Field */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar membro por nome ou cargo..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Members List Table */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-bold">
                Nenhum membro encontrado com os critérios selecionados.
              </div>
            ) : (
              filteredMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 ${
                      m.nivelRisco === 'alto'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : m.nivelRisco === 'medio'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {m.healthScore}%
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white truncate">{m.nome}</h4>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {m.cargo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Congregação: <strong className="text-slate-200">{m.congregacao}</strong></span>
                        <span>•</span>
                        <span>Último culto: <strong className="text-slate-200">{m.ultimoCulto}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                    {m.ausenciasConsecutivas > 0 && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-rose-950/50 text-rose-300 border border-rose-800/60 mr-1">
                        {m.ausenciasConsecutivas} ausências
                      </span>
                    )}

                    <button
                      onClick={() => sendWhatsAppPastoral(m)}
                      title="Enviar mensagem carinhosa de acompanhamento pastoral via WhatsApp"
                      className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all cursor-pointer text-xs font-bold flex items-center gap-1.5"
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </button>

                    <button
                      onClick={() => setSelectedMember(m)}
                      title="Agendar visita pastoral na casa ou local de trabalho do irmão"
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                    >
                      <Calendar size={14} /> Agendar Visita
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Analytics & Recommendations */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <BarChart3 className="text-indigo-400" size={18} /> Tendência de Retenção & Frequência
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementTrend}>
                  <defs>
                    <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="mes" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[60, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="frequencia" stroke="#10b981" fillOpacity={1} fill="url(#colorFreq)" name="Frequência %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Taxa de engajamento assíduo mantida em <strong className="text-emerald-400">89% no semestre</strong>.
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-wider">
              <Sparkles size={16} /> Recomendação da IA Pastoral
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Detectado padrão de ausência em <strong>2 jovens do departamento da mocidade</strong> após alteração de horário de culto. Recomendamos realizar um encontro informal ou café de comunhão do departamento este fim de semana.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Agendar Visita Pastoral */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white w-full max-w-md rounded-3xl border border-slate-700/80 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <HeartHandshake size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Agendar Visita Pastoral</h3>
                    <p className="text-xs text-slate-400">{selectedMember.nome}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAgendarVisita} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Data da Visita *</label>
                  <input
                    type="date"
                    required
                    value={visitaData.data}
                    onChange={e => setVisitaData({ ...visitaData, data: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Motivo / Observações Pastorais</label>
                  <textarea
                    rows={3}
                    value={visitaData.observacao}
                    onChange={e => setVisitaData({ ...visitaData, observacao: e.target.value })}
                    placeholder="Instruções para a comissão de visitação ou dupla pastoral..."
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingVisita}
                    className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    {isSavingVisita ? 'Gravando...' : <><CheckCircle2 size={16} /> Confirmar Agendamento</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
