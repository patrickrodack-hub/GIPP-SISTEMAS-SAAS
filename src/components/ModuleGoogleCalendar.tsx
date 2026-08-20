import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Video,
  Clock,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  LogOut,
  Sparkles,
  ChevronRight,
  Filter,
  CalendarDays
} from 'lucide-react';
import {
  getWorkspaceAccessToken,
  signInWithGoogleWorkspace,
  signOutGoogleWorkspace,
  listGoogleCalendarEvents,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  GoogleCalendarEvent
} from '../services/googleWorkspaceService';

interface ModuleGoogleCalendarProps {
  user?: any;
  db?: any;
}

const EVENT_TEMPLATES = [
  {
    title: 'Culto de Celebração & Adoração',
    description: 'Culto congregacional de louvor, testemunhos e ministração da Palavra de Deus.',
    durationMinutes: 120,
    color: '#059669',
    badge: 'Culto Oficial'
  },
  {
    title: 'Escola Bíblica Dominical (EBD)',
    description: 'Estudo sistemático das Lições Bíblicas CPAD para todas as faixas etárias.',
    durationMinutes: 90,
    color: '#2563eb',
    badge: 'Ensino EBD'
  },
  {
    title: 'Santa Ceia do Senhor & Comunhão',
    description: 'Celebração solene da Ceia do Senhor com o corpo eclesiástico e obreiros.',
    durationMinutes: 150,
    color: '#dc2626',
    badge: 'Santa Ceia'
  },
  {
    title: 'Reunião Ministerial de Obreiros',
    description: 'Alinhamento pastoral com diáconos, presbíteros, evangelistas e dirigentes.',
    durationMinutes: 90,
    color: '#7c3aed',
    badge: 'Reunião Obreiros',
    withMeet: true
  },
  {
    title: 'Círculo de Oração & Intercessão',
    description: 'Momento de clamor, unção e intercessão pela igreja, nação e enfermos.',
    durationMinutes: 120,
    color: '#d97706',
    badge: 'Oração'
  },
  {
    title: 'Vigília Pentecostal e Clamor',
    description: 'Noite de oração, busca pelo Batismo no Espírito Santo e renovação espiritual.',
    durationMinutes: 240,
    color: '#4f46e5',
    badge: 'Vigília'
  }
];

export const ModuleGoogleCalendar: React.FC<ModuleGoogleCalendarProps> = ({ db }) => {
  const [accessToken, setAccessToken] = useState<string | null>(getWorkspaceAccessToken());
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal New Event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventStartDate, setEventStartDate] = useState(() => {
    const now = new Date();
    now.setHours(19, 0, 0, 0);
    return now.toISOString().slice(0, 16);
  });
  const [eventEndDate, setEventEndDate] = useState(() => {
    const now = new Date();
    now.setHours(21, 0, 0, 0);
    return now.toISOString().slice(0, 16);
  });
  const [eventAddMeet, setEventAddMeet] = useState(false);
  const [eventAttendees, setEventAttendees] = useState('');
  const [savingEvent, setSavingEvent] = useState(false);

  // Delete Confirmation Modal
  const [eventToDelete, setEventToDelete] = useState<GoogleCalendarEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (accessToken) {
      loadEvents();
    }
  }, [accessToken]);

  const loadEvents = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setStatusMessage(null);
      const items = await listGoogleCalendarEvents(accessToken, 'primary');
      setEvents(items);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao carregar eventos da agenda Google.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setStatusMessage(null);
      const res = await signInWithGoogleWorkspace();
      setAccessToken(res.accessToken);
      setStatusMessage({ type: 'success', text: 'Conectado com sucesso ao Google Calendar!' });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Falha ao autenticar com o Google Calendar.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogleWorkspace();
    setAccessToken(null);
    setEvents([]);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !eventTitle.trim()) return;

    try {
      setSavingEvent(true);
      const attendeesList = eventAttendees
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0)
        .map(email => ({ email }));

      const newEvent: GoogleCalendarEvent = {
        summary: eventTitle.trim(),
        description: eventDescription.trim() || undefined,
        location: eventLocation.trim() || db?.igreja?.nome || undefined,
        start: {
          dateTime: new Date(eventStartDate).toISOString()
        },
        end: {
          dateTime: new Date(eventEndDate).toISOString()
        },
        attendees: attendeesList.length > 0 ? attendeesList : undefined
      };

      await createGoogleCalendarEvent(accessToken, newEvent, 'primary', eventAddMeet);
      setStatusMessage({ type: 'success', text: `Evento "${eventTitle}" agendado no Google Calendar!` });
      setIsModalOpen(false);
      resetForm();
      await loadEvents();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Falha ao agendar evento.'
      });
    } finally {
      setSavingEvent(false);
    }
  };

  const applyTemplate = (tpl: typeof EVENT_TEMPLATES[0]) => {
    setEventTitle(tpl.title);
    setEventDescription(tpl.description);
    setEventAddMeet(!!tpl.withMeet);
    if (db?.igreja?.nome) {
      setEventLocation(db.igreja.nome);
    }
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(19, 0, 0, 0);
    const end = new Date(start.getTime() + tpl.durationMinutes * 60000);
    setEventStartDate(start.toISOString().slice(0, 16));
    setEventEndDate(end.toISOString().slice(0, 16));
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!accessToken || !eventToDelete?.id) return;
    try {
      setDeleting(true);
      await deleteGoogleCalendarEvent(accessToken, eventToDelete.id, 'primary');
      setStatusMessage({ type: 'success', text: 'Evento removido do Google Calendar.' });
      setEventToDelete(null);
      await loadEvents();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao remover evento.'
      });
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setEventTitle('');
    setEventDescription('');
    setEventLocation('');
    setEventAttendees('');
    setEventAddMeet(false);
  };

  const filteredEvents = events.filter(evt => {
    const matchesSearch =
      (evt.summary || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Google Calendar Eclesiástico
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-semibold">
                Oficial Workspace
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gerenciamento oficial de cultos, eventos, reuniões pastorais e conferências com a nuvem do Google.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {accessToken ? (
            <>
              <button
                onClick={loadEvents}
                disabled={loading}
                className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-2 text-sm font-medium border border-slate-200 dark:border-slate-700"
                title="Atualizar Agenda"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Evento / Culto</span>
              </button>
              <button
                onClick={handleSignOut}
                className="p-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition border border-rose-200 dark:border-rose-900/50"
                title="Desconectar do Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Conectar Google Calendar</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-xs font-bold underline ml-4">
            Fechar
          </button>
        </div>
      )}

      {!accessToken ? (
        /* Not Connected State */
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <CalendarDays className="w-10 h-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Sincronize sua Agenda Pastoral e Eclesiástica
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Conecte sua conta do Google Workspace para gerenciar e sincronizar cultos, reuniões da diretoria, escalas de obreiros e eventos congregacionais diretamente com o Google Calendar.
            </p>
          </div>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition inline-flex items-center gap-3 text-base"
          >
            <LogIn className="w-5 h-5" />
            <span>{loading ? 'Conectando...' : 'Entrar com o Google'}</span>
          </button>
        </div>
      ) : (
        /* Connected Workspace Content */
        <div className="space-y-6">
          {/* Quick Templates */}
          <div className="bg-gradient-to-r from-blue-900/10 to-indigo-900/10 dark:from-slate-800 dark:to-slate-800/80 p-5 rounded-2xl border border-blue-200/60 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Modelos Rápidos de Cultos & Eventos Denominacionais
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {EVENT_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => applyTemplate(tpl)}
                  className="p-3.5 bg-white dark:bg-slate-700/60 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-left transition flex flex-col justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tpl.badge}
                      </span>
                      {tpl.withMeet && (
                        <span className="text-xs flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Video className="w-3 h-3" /> Meet
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {tpl.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {tpl.description}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-medium pt-2 border-t border-slate-100 dark:border-slate-600/50">
                    <span>{tpl.durationMinutes} min</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Agendar <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar eventos, cultos ou locais..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Filter className="w-4 h-4" />
              <span>{filteredEvents.length} eventos sincronizados</span>
            </div>
          </div>

          {/* Events List */}
          {loading && events.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
              <p className="text-sm text-slate-500">Buscando eventos da agenda Google...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">Nenhum evento encontrado</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Use os modelos acima ou clique em "Novo Evento" para agendar os cultos e reuniões no Google Calendar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((evt, idx) => {
                const startDate = evt.start?.dateTime ? new Date(evt.start.dateTime) : null;
                const endDate = evt.end?.dateTime ? new Date(evt.end.dateTime) : null;
                const meetUrl = evt.hangoutLink || evt.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri;

                return (
                  <div
                    key={evt.id || idx}
                    className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-base text-slate-800 dark:text-slate-100 line-clamp-2">
                          {evt.summary || '(Sem título)'}
                        </h4>
                        <div className="flex items-center gap-1">
                          {evt.htmlLink && (
                            <a
                              href={evt.htmlLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                              title="Abrir no Google Calendar"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => setEventToDelete(evt)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                            title="Remover Evento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {evt.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                          {evt.description}
                        </p>
                      )}

                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        {startDate && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <span>
                              {startDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })} às{' '}
                              {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              {endDate && ` - ${endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                          </div>
                        )}

                        {evt.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span className="truncate">{evt.location}</span>
                          </div>
                        )}

                        {evt.attendees && evt.attendees.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-violet-500" />
                            <span>{evt.attendees.length} participante(s) convocado(s)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {meetUrl && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <a
                          href={meetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Entrar no Google Meet</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: New Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Agendar Evento no Google Calendar</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Título do Culto / Evento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Culto de Doutrina e Ensino Bíblico"
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Início *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventStartDate}
                    onChange={e => setEventStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Término *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventEndDate}
                    onChange={e => setEventEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Local / Endereço
                </label>
                <input
                  type="text"
                  placeholder="Ex: Templo Central / Sala de Reunião Pastoral"
                  value={eventLocation}
                  onChange={e => setEventLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Descrição / Pauta Eclesiástica
                </label>
                <textarea
                  rows={3}
                  placeholder="Informações adicionais, leituras bíblicas, escalas..."
                  value={eventDescription}
                  onChange={e => setEventDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Convidados (E-mails separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="obreiro1@gmail.com, pastor@gmail.com"
                  value={eventAttendees}
                  onChange={e => setEventAttendees(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="addMeet"
                  checked={eventAddMeet}
                  onChange={e => setEventAddMeet(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="addMeet" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Adicionar videoconferência oficial do Google Meet ao evento
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm"
                >
                  {savingEvent ? 'Agendando...' : 'Agendar no Google Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-sm w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl w-fit">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Excluir Evento da Agenda?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Deseja realmente remover o evento <strong>"{eventToDelete.summary}"</strong> do Google Calendar? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEventToDelete(null)}
                disabled={deleting}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
              >
                {deleting ? 'Removendo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleGoogleCalendar;
