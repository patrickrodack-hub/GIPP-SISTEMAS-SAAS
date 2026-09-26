import React, { useState, useRef } from 'react';
import { 
  Calendar, MapPin, Users, DollarSign, Clock, Plus, Search, 
  Edit3, Trash2, Copy, Eye, CheckCircle2, AlertCircle, 
  Sparkles, Tag, ChevronRight, X, ArrowUpRight, Upload, Image as ImageIcon
} from 'lucide-react';
import { 
  EventoItem, TipoEvento, StatusEvento, TIPOS_EVENTO_CONFIG, 
  IMAGENS_BANNER_PRESET, formatEventDates 
} from '../../data/eventosInscricoesData';

interface EventosAdminAreaProps {
  eventos: EventoItem[];
  inscricoes: any[];
  onSaveEvento: (evento: EventoItem) => void;
  onDeleteEvento: (eventoId: string) => void;
  onDuplicateEvento: (evento: EventoItem) => void;
  onSelectEventoFilter: (eventoId: string) => void;
  onOpenCheckin: (eventoId: string) => void;
  igrejaPix?: string;
}

export const EventosAdminArea: React.FC<EventosAdminAreaProps> = ({
  eventos,
  inscricoes,
  onSaveEvento,
  onDeleteEvento,
  onDuplicateEvento,
  onSelectEventoFilter,
  onOpenCheckin,
  igrejaPix,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoItem | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoEvento>('conferencia');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horario, setHorario] = useState('');
  const [local, setLocal] = useState('');
  const [enderecoCompleto, setEnderecoCompleto] = useState('');
  const [capacidadeMaxima, setCapacidadeMaxima] = useState<number>(100);
  const [valorInscricao, setValorInscricao] = useState<number>(0);
  const [chavePix, setChavePix] = useState('');
  const [imagem, setImagem] = useState('');
  const [status, setStatus] = useState<StatusEvento>('aberto');
  const [dataLimiteInscricao, setDataLimiteInscricao] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState('');
  const [emiteCertificado, setEmiteCertificado] = useState(true);
  const [instrutorPastor, setInstrutorPastor] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP, etc).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('A imagem selecionada é muito grande. Por favor escolha uma imagem de até 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setImagem(result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const openCreateModal = () => {
    setEditingEvento(null);
    setNome('');
    setDescricao('');
    setTipo('conferencia');
    setDataInicio('');
    setDataFim('');
    setHorario('19:30');
    setLocal('Templo Sede');
    setEnderecoCompleto('');
    setCapacidadeMaxima(100);
    setValorInscricao(0);
    setChavePix(igrejaPix || '');
    setImagem(IMAGENS_BANNER_PRESET[0]);
    setStatus('aberto');
    setDataLimiteInscricao('');
    setPublicoAlvo('Geral');
    setEmiteCertificado(false);
    setInstrutorPastor('');
    setModalOpen(true);
  };

  const openEditModal = (evt: EventoItem) => {
    setEditingEvento(evt);
    setNome(evt.nome);
    setDescricao(evt.descricao);
    setTipo(evt.tipo);
    setDataInicio(evt.dataInicio);
    setDataFim(evt.dataFim || evt.dataInicio);
    setHorario(evt.horario);
    setLocal(evt.local);
    setEnderecoCompleto(evt.enderecoCompleto || '');
    setCapacidadeMaxima(evt.capacidadeMaxima);
    setValorInscricao(evt.valorInscricao);
    setChavePix(evt.chavePix || igrejaPix || '');
    setImagem(evt.imagem || IMAGENS_BANNER_PRESET[0]);
    setStatus(evt.status);
    setDataLimiteInscricao(evt.dataLimiteInscricao || '');
    setPublicoAlvo(evt.publicoAlvo || '');
    setEmiteCertificado(!!evt.emiteCertificado);
    setInstrutorPastor(evt.instrutorPastor || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !dataInicio) return;

    const payload: EventoItem = {
      id: editingEvento ? editingEvento.id : `evt_${Date.now()}`,
      nome: nome.trim(),
      descricao: descricao.trim(),
      tipo,
      dataInicio,
      dataFim: dataFim || dataInicio,
      horario: horario.trim(),
      local: local.trim(),
      enderecoCompleto: enderecoCompleto.trim(),
      capacidadeMaxima: Number(capacidadeMaxima) || 50,
      valorInscricao: Number(valorInscricao) || 0,
      chavePix: chavePix.trim() || igrejaPix || '',
      imagem: imagem || IMAGENS_BANNER_PRESET[0],
      status,
      dataLimiteInscricao: dataLimiteInscricao || undefined,
      publicoAlvo: publicoAlvo.trim(),
      emiteCertificado,
      instrutorPastor: instrutorPastor.trim(),
      criadoEm: editingEvento ? editingEvento.criadoEm : new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    onSaveEvento(payload);
    setModalOpen(false);
  };

  // Filtered list
  const filteredEventos = eventos.filter((evt) => {
    const matchesSearch = 
      evt.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.local.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'todos' || evt.tipo === tipoFilter;
    const matchesStatus = statusFilter === 'todos' || evt.status === statusFilter;
    return matchesSearch && matchesTipo && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar eventos por nome, descrição, local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>

          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="curso">Cursos</option>
            <option value="retiro">Retiros</option>
            <option value="conferencia">Conferências</option>
            <option value="workshop">Workshops</option>
            <option value="vigilia">Vigílias</option>
            <option value="congresso">Congressos</option>
            <option value="seminario">Seminários</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="aberto">Abertos</option>
            <option value="em_breve">Em Breve</option>
            <option value="encerrado">Encerrados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-violet-500/25 transition-all transform active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span>Cadastrar Novo Evento</span>
        </button>
      </div>

      {/* Grid of Events */}
      {filteredEventos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Nenhum evento encontrado</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Não encontramos nenhum evento com os filtros selecionados. Crie um novo evento ou altere a busca.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
          >
            <Plus size={16} /> Cadastrar Evento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEventos.map((evt) => {
            const countInscritos = inscricoes.filter((i) => i.eventoId === evt.id && i.status !== 'cancelado').length;
            const pctOcupacao = Math.min(100, Math.round((countInscritos / (evt.capacidadeMaxima || 1)) * 100));
            const tipoCfg = TIPOS_EVENTO_CONFIG[evt.tipo] || TIPOS_EVENTO_CONFIG.outro;

            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Banner Header */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={evt.imagem || IMAGENS_BANNER_PRESET[0]}
                    alt={evt.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                  {/* Badges on Banner */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md bg-white/90 ${tipoCfg.textColor}`}>
                      {tipoCfg.label}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md ${
                        evt.status === 'aberto'
                          ? 'bg-emerald-500/90 text-white'
                          : evt.status === 'em_breve'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-slate-600/90 text-white'
                      }`}
                    >
                      {evt.status === 'aberto' ? 'Inscrições Abertas' : evt.status === 'em_breve' ? 'Em Breve' : 'Encerrado'}
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                      {evt.valorInscricao === 0 ? 'GRATUITO' : `R$ ${evt.valorInscricao.toFixed(2)}`}
                    </span>
                  </div>

                  {/* Dates at bottom of banner */}
                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-violet-300" />
                      <span>{formatEventDates(evt.dataInicio, evt.dataFim)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-violet-300" />
                      <span>{evt.horario}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-800 line-clamp-1 group-hover:text-violet-600 transition-colors">
                      {evt.nome}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {evt.descricao}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{evt.local}</span>
                    </div>

                    {/* Progress Bar of Vacancies */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Users size={12} />
                          {countInscritos} de {evt.capacidadeMaxima} inscritos
                        </span>
                        <span className={pctOcupacao >= 90 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          {pctOcupacao}% das vagas
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pctOcupacao >= 90 ? 'bg-rose-500' : pctOcupacao >= 60 ? 'bg-amber-500' : 'bg-violet-600'
                          }`}
                          style={{ width: `${pctOcupacao}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectEventoFilter(evt.id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 px-3 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl transition-colors"
                      title="Ver lista de inscritos deste evento"
                    >
                      <span>Inscritos ({countInscritos})</span>
                      <ChevronRight size={14} />
                    </button>

                    <button
                      onClick={() => onOpenCheckin(evt.id)}
                      className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                      title="Abrir Terminal de Check-in deste evento"
                    >
                      <CheckCircle2 size={16} />
                    </button>

                    <button
                      onClick={() => openEditModal(evt)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Editar evento"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      onClick={() => onDuplicateEvento(evt)}
                      className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      title="Duplicar evento"
                    >
                      <Copy size={16} />
                    </button>

                    <button
                      onClick={() => onDeleteEvento(evt.id)}
                      className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Excluir evento"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Cadastro / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingEvento ? 'Editar Evento' : 'Cadastrar Novo Evento'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Preencha os detalhes para publicação na área administrativa e no portal dos membros.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-5">
              {/* Nome e Tipo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nome do Evento *
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Conferência Geral de Avivamento 2026"
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tipo do Evento *
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoEvento)}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  >
                    <option value="curso">Curso</option>
                    <option value="retiro">Retiro</option>
                    <option value="conferencia">Conferência</option>
                    <option value="workshop">Workshop</option>
                    <option value="vigilia">Vigília</option>
                    <option value="congresso">Congresso</option>
                    <option value="seminario">Seminário</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Descrição Completa *
                </label>
                <textarea
                  rows={3}
                  required
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Explique os objetivos, programação e importância do evento..."
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                />
              </div>

              {/* Datas e Horário */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    required
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Horário *
                  </label>
                  <input
                    type="text"
                    required
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    placeholder="Ex: 19:30 às 21:30"
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Local e Endereço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Local Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Ex: Templo Sede - Auditório Principal"
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Endereço / Observações de Chegada
                  </label>
                  <input
                    type="text"
                    value={enderecoCompleto}
                    onChange={(e) => setEnderecoCompleto(e.target.value)}
                    placeholder="Ex: Av. Central, 500 - Bairro Novo"
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Vagas, Valor, Chave PIX */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Capacidade Máxima (Vagas) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    required
                    value={capacidadeMaxima}
                    onChange={(e) => setCapacidadeMaxima(Number(e.target.value))}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Valor da Inscrição (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={valorInscricao}
                    onChange={(e) => setValorInscricao(Number(e.target.value))}
                    placeholder="0.00 para gratuito"
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Deixe 0 para inscrição gratuita</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Chave PIX para Pagamento
                  </label>
                  <input
                    type="text"
                    value={chavePix}
                    onChange={(e) => setChavePix(e.target.value)}
                    placeholder="CNPJ, E-mail ou Telefone"
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Status e Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status do Evento
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusEvento)}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  >
                    <option value="aberto">Aberto (Aceita Inscrições)</option>
                    <option value="em_breve">Em Breve (Divulgação)</option>
                    <option value="encerrado">Encerrado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Data Limite para Inscrição
                  </label>
                  <input
                    type="date"
                    value={dataLimiteInscricao}
                    onChange={(e) => setDataLimiteInscricao(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Preset de Imagem Banner & Upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Banner do Evento
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Recomendado: proporção 16:9</span>
                </div>

                {/* Input de URL e Botão de Importar do Computador */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={imagem.startsWith('data:') ? '' : imagem}
                      onChange={(e) => setImagem(e.target.value)}
                      placeholder={
                        imagem.startsWith('data:')
                          ? '✓ Imagem importada do computador (ou digite uma nova URL)'
                          : 'URL da imagem ou clique em Importar...'
                      }
                      className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 pr-9"
                    />
                    {imagem && (
                      <button
                        type="button"
                        onClick={() => setImagem('')}
                        title="Remover imagem"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 shadow-sm shadow-violet-500/20"
                  >
                    <Upload size={15} />
                    <span>Importar do Computador</span>
                  </button>
                </div>

                {/* Pré-visualização do Banner Selecionado */}
                {imagem && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 border border-slate-200 shadow-sm bg-slate-900 group">
                    <img
                      src={imagem}
                      alt="Banner Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-between p-3">
                      <span className="text-white text-xs font-medium flex items-center gap-1.5 drop-shadow">
                        <ImageIcon size={14} className="text-violet-300" />
                        {imagem.startsWith('data:')
                          ? 'Imagem importada do seu computador'
                          : 'Banner ativo para o evento'}
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-md px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Upload size={12} />
                        Substituir
                      </button>
                    </div>
                  </div>
                )}

                {/* Modelos Prontos */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    Ou selecione um modelo pronto da galeria:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5">
                    {IMAGENS_BANNER_PRESET.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setImagem(preset)}
                        className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                          imagem === preset
                            ? 'border-violet-600 ring-2 ring-violet-500/30 scale-95 shadow-md'
                            : 'border-transparent opacity-70 hover:opacity-100 hover:scale-100'
                        }`}
                        title="Usar este modelo"
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-500/20 transition-all active:scale-95"
                >
                  {editingEvento ? 'Salvar Alterações' : 'Criar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
