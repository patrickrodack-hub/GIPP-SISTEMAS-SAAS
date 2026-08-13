import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  Calendar,
  Users,
  Heart,
  Gift,
  Clock,
  CheckCircle2,
  Sparkles,
  Music,
  Tv,
  Baby,
  Smile,
  Zap,
  PhoneCall,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface EscalaItem {
  id: string;
  voluntarioNome: string;
  telefone: string;
  departamento: 'Louvor' | 'Mídia & Som' | 'Recepção' | 'Salinha Kids' | 'Diaconato';
  culto: string;
  funcao: string;
  data: string;
  confirmado: boolean;
}

export default function ModuleAutomacaoWhatsApp() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast, user } = context || {};

  const [activeTab, setActiveTab] = useState<'escalas' | 'aniversariantes' | 'visitantes'>('escalas');

  // MOCK Escalas
  const [escalas, setEscalas] = useState<EscalaItem[]>([
    {
      id: 'e1',
      voluntarioNome: 'Irmão Lucas Santos',
      telefone: '(11) 98888-1111',
      departamento: 'Louvor',
      culto: 'Culto de Ensino (Quarta - 19h30)',
      funcao: 'Violonista / Backing',
      data: '14/08/2026',
      confirmado: true
    },
    {
      id: 'e2',
      voluntarioNome: 'Jovem Amanda Lima',
      telefone: '(11) 97777-2222',
      departamento: 'Mídia & Som',
      culto: 'Culto de Celebração (Domingo - 18h)',
      funcao: 'Operadora de Projetor / Mídia',
      data: '17/08/2026',
      confirmado: false
    },
    {
      id: 'e3',
      voluntarioNome: 'Diácono Paulo Silva',
      telefone: '(11) 96666-3333',
      departamento: 'Diaconato',
      culto: 'Culto de Celebração (Domingo - 18h)',
      funcao: 'Recepção da Porta Principal',
      data: '17/08/2026',
      confirmado: true
    },
    {
      id: 'e4',
      voluntarioNome: 'Irmã Juliana Costa',
      telefone: '(11) 95555-4444',
      departamento: 'Salinha Kids',
      culto: 'Culto de Celebração (Domingo - 18h)',
      funcao: 'Professora Crianças 4-7 anos',
      data: '17/08/2026',
      confirmado: false
    }
  ]);

  // Aniversariantes do dia
  const aniversariantes = [
    { id: 'a1', nome: 'Irmã Beatriz Ramos', telefone: '(11) 94444-5555', cargo: 'Diaconisa', dataNasc: 'Hoje' },
    { id: 'a2', nome: 'Evangelista Marcos', telefone: '(11) 93333-6666', cargo: 'Evangelista', dataNasc: 'Hoje' }
  ];

  // Visitantes recentes
  const visitantes = [
    { id: 'v1', nome: 'Ricardo Mendes', telefone: '(11) 92222-7777', dataVisita: '09/08/2026', acolhido: false },
    { id: 'v2', nome: 'Patricia Rocha', telefone: '(11) 91111-8888', dataVisita: '09/08/2026', acolhido: true }
  ];

  const sendWhatsAppEscala = (item: EscalaItem) => {
    const cleanPhone = item.telefone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Paz do Senhor, irmão(ã) *${item.voluntarioNome}*! 🙌\n\n` +
      `Lembramos com carinho da sua escala de serviço no GIPP:\n\n` +
      `🏛️ *Departamento:* ${item.departamento}\n` +
      `🎯 *Função:* ${item.funcao}\n` +
      `📅 *Data:* ${item.data}\n` +
      `⏰ *Culto:* ${item.culto}\n\n` +
      `Por favor, confirme sua presença respondendo esta mensagem com um "AMÉM, CONFIRMADO!".\n\n` +
      `"E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor..." (Colossenses 3:23)`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, '_blank');
  };

  const sendWhatsAppAniversario = (item: typeof aniversariantes[0]) => {
    const cleanPhone = item.telefone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `🎉 *PARABÉNS E FELIZ ANIVERSÁRIO!* 🎂\n\n` +
      `Paz do Senhor, estimado(a) *${item.nome}*!\n\n` +
      `A igreja GIPP celebra com alegria o dom da sua vida neste dia tão especial! Que o Senhor Deus derrame bênçãos sem medida, saúde, paz e renovo sobre você e sua família.\n\n` +
      `"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti..." (Números 6:24-25)\n\n` +
      `Com carinho e oração,\n*Pastor Presidente e Família GIPP* 🕊️`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, '_blank');
  };

  const sendWhatsAppAcolhimento = (item: typeof visitantes[0]) => {
    const cleanPhone = item.telefone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `🕊️ *ACOLHIMENTO PASTORAL - GIPP*\n\n` +
      `Paz do Senhor, *${item.nome}*! 👋\n\n` +
      `Ficamos imensamente felizes com a sua presença em nosso culto no dia ${item.dataVisita}! A igreja GIPP está de portas e coração abertos para você e sua família.\n\n` +
      `Gostaria de receber o nosso boletim semanal ou fazer um pedido de oração especial? Estamos à disposição para servi-lo(a)!\n\n` +
      `Deus abençoe grandemente a sua semana!`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/20">
            <MessageSquare size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                WhatsApp API Automação v3.0
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Automação de WhatsApp & Escalas
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Disparo em 1-clique de lembretes de escala para voluntários, cartões de aniversariantes e mensagens de acolhimento pastoral para visitantes.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('escalas')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 md:flex-none ${
              activeTab === 'escalas' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={15} /> Lembrete de Escalas ({escalas.length})
          </button>
          <button
            onClick={() => setActiveTab('aniversariantes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 md:flex-none ${
              activeTab === 'aniversariantes' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gift size={15} /> Aniversariantes ({aniversariantes.length})
          </button>
          <button
            onClick={() => setActiveTab('visitantes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 md:flex-none ${
              activeTab === 'visitantes' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart size={15} /> Acolhimento Visitantes
          </button>
        </div>
      </div>

      {activeTab === 'escalas' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Clock className="text-emerald-400" size={20} /> Escalas dos Departamentos da Semana
              </h2>
              <p className="text-xs text-slate-400">Clique para notificar instantaneamente o voluntário no WhatsApp com a escala formatada</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {escalas.map(e => (
              <div
                key={e.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/40 transition-all space-y-3 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      {e.departamento === 'Louvor' && <Music size={12} />}
                      {e.departamento === 'Mídia & Som' && <Tv size={12} />}
                      {e.departamento === 'Salinha Kids' && <Baby size={12} />}
                      {e.departamento}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      e.confirmado ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {e.confirmado ? '✓ Confirmado' : '⏱ Pendente'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white">{e.voluntarioNome}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Função: <strong className="text-slate-200">{e.funcao}</strong></p>
                  <p className="text-xs text-slate-400 mt-0.5">Culto: <strong className="text-emerald-400">{e.culto} ({e.data})</strong></p>
                </div>

                <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">{e.telefone}</span>
                  <button
                    onClick={() => sendWhatsAppEscala(e)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={13} /> Enviar Escala no WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'aniversariantes' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Gift className="text-emerald-400" size={20} /> Aniversariantes do Dia
              </h2>
              <p className="text-xs text-slate-400">Envie um cartão festivo e abençoador em nome da diretoria da igreja</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aniversariantes.map(a => (
              <div key={a.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{a.nome}</h3>
                    <p className="text-xs text-slate-400">{a.cargo} • Aniversariante Hoje 🎉</p>
                  </div>
                </div>

                <button
                  onClick={() => sendWhatsAppAniversario(a)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} /> Enviar Parabéns
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'visitantes' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Heart className="text-emerald-400" size={20} /> Boas-Vindas & Acolhimento a Visitantes
              </h2>
              <p className="text-xs text-slate-400">Mensagens carinhosas para integrar e cultivar novos irmãos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visitantes.map(v => (
              <div key={v.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{v.nome}</h3>
                    <p className="text-xs text-slate-400">Visitou em {v.dataVisita}</p>
                  </div>
                </div>

                <button
                  onClick={() => sendWhatsAppAcolhimento(v)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} /> Acolher no WhatsApp
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
