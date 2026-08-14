import React, { useState, useMemo, useContext } from 'react';
import { 
  Send, MessageCircle, Users, Sparkles, Filter, CheckSquare, 
  Square, Search, Copy, ExternalLink, Calendar, Music, BookOpen, 
  HeartHandshake, Church, UserCheck, CheckCircle2, Shield, RefreshCw
} from 'lucide-react';
import { ChurchContext } from '../App';

interface MessageTemplate {
  id: string;
  title: string;
  icon: any;
  category: 'aniversario' | 'escala' | 'ebd' | 'obreiros' | 'geral';
  template: string;
}

const TEMPLATES: MessageTemplate[] = [
  {
    id: 'aniversario_abencoado',
    title: '🎂 Feliz Aniversário & Bênção Pastoral',
    icon: Calendar,
    category: 'aniversario',
    template: `A Paz do Senhor, amado(a) {NOME}! 🎂✨\n\nHoje é um dia especial em que celebramos o dom da sua vida! Em nome do nosso Pastor e de toda a família {IGREJA}, desejamos ricas bênçãos do Senhor sobre você e sua casa.\n\n"O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti..." (Números 6:24-25).\n\nReceba o nosso carinho e oração neste dia tão feliz! 🙏🕊️`
  },
  {
    id: 'escala_louvor',
    title: '🎵 Lembrete de Escala do Louvor / Mídia',
    icon: Music,
    category: 'escala',
    template: `A Paz do Senhor, {NOME}! 🎶\n\nPassando para lembrar que você está escalado(a) para ministrar no próximo culto em nossa {IGREJA}.\n\n📅 Data: Próximo Domingo\n⏰ Ensaio / Chegada: 30 minutos antes do início do culto.\n\nContamos com a sua dedicação e adoração para abençoar a Igreja de Cristo. Confirme o recebimento desta mensagem! 🙌🔥`
  },
  {
    id: 'lembrete_ebd',
    title: '📖 Escola Bíblica Dominical (EBD)',
    icon: BookOpen,
    category: 'ebd',
    template: `A Paz do Senhor, amado(a) {NOME}! 📖✨\n\nNeste domingo teremos mais uma aula impactante na nossa Escola Bíblica Dominical na {IGREJA} às 09:00h.\n\nTraga sua Bíblia, revista e sua família para aprendermos juntos a Palavra de Deus. Esperamos você lá! 🕊️`
  },
  {
    id: 'reuniao_obreiros',
    title: '👔 Convocação de Reunião Ministerial',
    icon: Church,
    category: 'obreiros',
    template: `A Paz do Senhor, caro(a) obreiro(a) {NOME}!\n\nConvocamos você para a nossa Reunião Geral de Obreiros e Liderança da {IGREJA}.\n\nPauta: Alinhamento pastoral, santa ceia e projetos de evangelismo.\nSua presença é indispensável para o bom andamento da obra de Deus! Deus abençoe seu ministério. 🙏`
  },
  {
    id: 'convite_culto',
    title: '🕊️ Convite para o Culto da Família',
    icon: HeartHandshake,
    category: 'geral',
    template: `A Paz do Senhor, querido(a) {NOME}!\n\nHoje é dia de nos reunirmos na casa do Pai para adorar e ouvir a Sua voz na {IGREJA}.\n\nVenha com o coração aberto, traga sua família e receba uma palavra de vitória para a sua vida! Esperamos por vocês. 🙌`
  }
];

export const ModuleMensagensLote: React.FC = () => {
  const { db, addToast } = useContext(ChurchContext);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate>(TEMPLATES[0]);
  const [customText, setCustomText] = useState<string>(TEMPLATES[0].template);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('todos');
  const [filterAniversariantes, setFilterAniversariantes] = useState(false);
  const [selectedMembrosIds, setSelectedMembrosIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const membros = useMemo(() => db.membros || [], [db.membros]);
  const churchName = db.igreja?.nome || 'Igreja Evangélica Assembleia de Deus';

  // Filtro de membros
  const currentMonth = new Date().getMonth() + 1;
  const filteredMembros = useMemo(() => {
    return membros.filter((m: any) => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const nome = (m.nome || '').toLowerCase();
        const tel = (m.telefone || m.whatsapp || '').toLowerCase();
        if (!nome.includes(query) && !tel.includes(query)) return false;
      }
      if (filterDept !== 'todos') {
        if (m.departamento !== filterDept && m.funcao !== filterDept) return false;
      }
      if (filterAniversariantes) {
        if (!m.data_nascimento) return false;
        const parts = m.data_nascimento.split('-');
        const mesNasc = parseInt(parts[1], 10);
        if (mesNasc !== currentMonth) return false;
      }
      return true;
    });
  }, [membros, searchTerm, filterDept, filterAniversariantes, currentMonth]);

  const handleSelectTemplate = (tpl: MessageTemplate) => {
    setSelectedTemplate(tpl);
    setCustomText(tpl.template);
  };

  const toggleSelectAll = () => {
    if (selectedMembrosIds.length === filteredMembros.length) {
      setSelectedMembrosIds([]);
    } else {
      setSelectedMembrosIds(filteredMembros.map((m: any) => m.id));
    }
  };

  const toggleMembro = (id: string) => {
    if (selectedMembrosIds.includes(id)) {
      setSelectedMembrosIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedMembrosIds(prev => [...prev, id]);
    }
  };

  const getPersonalizedText = (membro: any) => {
    const nome = membro.nome ? membro.nome.split(' ')[0] : 'Irmão(ã)';
    return customText
      .replace(/{NOME}/g, nome)
      .replace(/{IGREJA}/g, churchName);
  };

  const getCleanPhone = (phoneStr: string) => {
    if (!phoneStr) return '';
    let digits = phoneStr.replace(/\D/g, '');
    if (digits.length === 10 || digits.length === 11) {
      digits = '55' + digits;
    }
    return digits;
  };

  const openWhatsAppDirect = (membro: any) => {
    const phone = getCleanPhone(membro.telefone || membro.whatsapp);
    if (!phone) {
      addToast('Membro não possui número de telefone cadastrado.', 'warning');
      return;
    }
    const text = encodeURIComponent(getPersonalizedText(membro));
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const copyPersonalized = (membro: any) => {
    const text = getPersonalizedText(membro);
    navigator.clipboard.writeText(text);
    setCopiedId(membro.id);
    addToast('Mensagem personalizada copiada!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            <MessageCircle size={30} className="text-emerald-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide">Central de Mensagens & Disparo WhatsApp</h1>
            <p className="text-xs text-emerald-100 mt-1 font-medium">Envio em lote com personalização automática para membros, liderança e aniversariantes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            {selectedMembrosIds.length} Selecionados
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Templates & Editor */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              Modelos Prontos de Mensagem
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {TEMPLATES.map(tpl => {
                const Icon = tpl.icon;
                const isSel = selectedTemplate.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSel 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isSel ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-xs">{tpl.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Texto da Mensagem (com Variáveis)
                </label>
                <span className="text-[10px] text-slate-400">Use {`{NOME}`} e {`{IGREJA}`}</span>
              </div>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={9}
                className="w-full text-xs font-sans p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:outline-none transition-all leading-relaxed custom-scrollbar"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Member List & Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setFilterAniversariantes(!filterAniversariantes)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  filterAniversariantes
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                <Calendar size={14} />
                Aniversariantes do Mês
              </button>
            </div>

            {/* Select All Bar */}
            <div className="flex items-center justify-between px-1 text-xs text-slate-500">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {selectedMembrosIds.length === filteredMembros.length && filteredMembros.length > 0 ? (
                  <CheckSquare size={16} />
                ) : (
                  <Square size={16} />
                )}
                {selectedMembrosIds.length === filteredMembros.length && filteredMembros.length > 0
                  ? 'Desmarcar Todos'
                  : 'Selecionar Todos da Lista'}
              </button>
              <span>{filteredMembros.length} membros encontrados</span>
            </div>

            {/* Members List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredMembros.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                  Nenhum membro encontrado com os filtros atuais.
                </div>
              ) : (
                filteredMembros.map((m: any) => {
                  const isChecked = selectedMembrosIds.includes(m.id);
                  const phone = m.telefone || m.whatsapp || '';
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isChecked 
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60' 
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => toggleMembro(m.id)}
                          className="cursor-pointer text-emerald-600 dark:text-emerald-400"
                        >
                          {isChecked ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-400" />}
                        </button>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate text-slate-800 dark:text-white">{m.nome}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>{phone || 'Sem telefone'}</span>
                            {m.departamento && <span>• {m.departamento}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => copyPersonalized(m)}
                          className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                          title="Copiar texto personalizado"
                        >
                          {copiedId === m.id ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={() => openWhatsAppDirect(m)}
                          disabled={!phone}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                          title="Abrir WhatsApp Web direto"
                        >
                          <Send size={12} />
                          Enviar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
