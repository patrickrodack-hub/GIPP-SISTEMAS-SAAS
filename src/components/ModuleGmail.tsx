import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  LogOut,
  Sparkles,
  Inbox,
  Clock,
  User as UserIcon,
  X,
  FileText,
  MailOpen
} from 'lucide-react';
import {
  getWorkspaceAccessToken,
  signInWithGoogleWorkspace,
  signOutGoogleWorkspace,
  listGmailMessages,
  getGmailMessageDetails,
  sendGmailMessage,
  GmailMessageSummary
} from '../services/googleWorkspaceService';

interface ModuleGmailProps {
  user?: any;
  db?: any;
}

const EMAIL_TEMPLATES = [
  {
    title: 'Convocação de Reunião Ministerial',
    subject: 'Convocação Oficial: Reunião do Corpo Pastoral e Obreiros',
    bodyText: `Graça e paz amados irmãos e obreiros,\n\nConvocamos todo o corpo eclesiástico (diáconos, presbíteros, evangelistas e dirigentes de congregações) para a nossa Reunião Ministerial Ordinária.\n\nPauta:\n1. Alinhamento doutrinário e litúrgico;\n2. Escalas de cultos e Santa Ceia;\n3. Planejamento evangelístico e missões.\n\nContamos com a sua pontualidade e intercessão.\n\nFraternalmente em Cristo,\nSecretaria Geral da Igreja`,
    badge: 'Obreiros'
  },
  {
    title: 'Boas-Vindas a Visitantes & Novos Convertidos',
    subject: 'A Paz do Senhor! Foi uma alegria receber você em nossa igreja',
    bodyText: `Amado(a) amigo(a),\n\nFoi um privilégio imenso ter a sua presença em nosso culto de celebração! Nossa igreja está de portas e corações abertos para você e sua família.\n\nCaso necessite de oração, aconselhamento pastoral ou deseje conhecer nossos cursos bíblicos e atividades, entre em contato conosco respondendo a este e-mail.\n\nQue as mais ricas bênçãos do Senhor estejam sobre o seu lar!\n\nCom carinho,\nPastor Presidente e Família da Fé`,
    badge: 'Boas-Vindas'
  },
  {
    title: 'Aviso da Santa Ceia do Senhor',
    subject: 'Celebração da Santa Ceia do Senhor neste Domingo',
    bodyText: `Amada Igreja do Senhor Jesus Cristo,\n\n"Porque todas as vezes que comerdes este pão e beberdes este cálice anunciais a morte do Senhor, até que venha." (1 Coríntios 11:26)\n\nConvidamos você e sua família para participarmos juntos do Culto Solene de Santa Ceia e Comunhão neste próximo domingo.\n\nPrepare o seu coração em oração e venha celebrar a vitória da cruz!\n\nEm Cristo Jesus,\nMinistério Pastoral`,
    badge: 'Santa Ceia'
  },
  {
    title: 'Convite para a Escola Bíblica Dominical (EBD)',
    subject: 'Matrícula e Participação na Escola Bíblica Dominical (EBD)',
    bodyText: `Paz do Senhor irmãos e alunos da EBD,\n\nA Escola Bíblica Dominical é o coração do ensino e discipulado em nossa denominação. Iniciamos um novo trimestre de estudos profundos da Palavra de Deus com as Lições Bíblicas CPAD.\n\nTemos classes especiais para todas as idades: Crianças, Adolescentes, Jovens e Adultos.\n\nEsperamos por você neste domingo às 09h da manhã!\n\nSuperintendência da EBD`,
    badge: 'EBD'
  }
];

export const ModuleGmail: React.FC<ModuleGmailProps> = ({ db }) => {
  const [accessToken, setAccessToken] = useState<string | null>(getWorkspaceAccessToken());
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected Message for full view
  const [selectedMessage, setSelectedMessage] = useState<(GmailMessageSummary & { bodyHtml?: string }) | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Compose Modal
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (accessToken) {
      loadMessages();
    }
  }, [accessToken]);

  const loadMessages = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setStatusMessage(null);
      const items = await listGmailMessages(accessToken, searchTerm, 25);
      setMessages(items);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao carregar mensagens do Gmail.'
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
      setStatusMessage({ type: 'success', text: 'Conectado com sucesso ao Gmail!' });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Falha ao autenticar com o Gmail.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogleWorkspace();
    setAccessToken(null);
    setMessages([]);
    setSelectedMessage(null);
  };

  const handleViewMessage = async (msg: GmailMessageSummary) => {
    if (!accessToken) return;
    try {
      setLoadingDetails(true);
      const details = await getGmailMessageDetails(accessToken, msg.id);
      setSelectedMessage(details);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao abrir mensagem.'
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !emailTo.trim() || !emailSubject.trim()) return;

    try {
      setSending(true);
      await sendGmailMessage(accessToken, {
        to: emailTo.trim(),
        subject: emailSubject.trim(),
        bodyText: emailBody.trim()
      });

      setStatusMessage({ type: 'success', text: `E-mail enviado com sucesso para ${emailTo}!` });
      setIsComposeOpen(false);
      resetCompose();
      await loadMessages();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Falha ao enviar e-mail pelo Gmail.'
      });
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (tpl: typeof EMAIL_TEMPLATES[0]) => {
    setEmailSubject(tpl.subject);
    setEmailBody(tpl.bodyText);
    setIsComposeOpen(true);
  };

  const resetCompose = () => {
    setEmailTo('');
    setEmailSubject('');
    setEmailBody('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Gmail Eclesiástico Oficial
              <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2.5 py-0.5 rounded-full font-semibold">
                Google Workspace
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Envio de comunicados oficiais, convocações de obreiros e leitura da caixa de entrada pastoral.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {accessToken ? (
            <>
              <button
                onClick={loadMessages}
                disabled={loading}
                className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-2 text-sm font-medium border border-slate-200 dark:border-slate-700"
                title="Atualizar Caixa de Entrada"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>
              <button
                onClick={() => {
                  resetCompose();
                  setIsComposeOpen(true);
                }}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-sm transition flex items-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Escrever E-mail</span>
              </button>
              <button
                onClick={handleSignOut}
                className="p-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition border border-rose-200 dark:border-rose-900/50"
                title="Desconectar do Gmail"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Conectar Gmail</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Message */}
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-3xl flex items-center justify-center text-red-600 dark:text-red-400">
            <Mail className="w-10 h-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Comunicação Eclesiástica pelo Gmail
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Conecte sua conta do Google Workspace para despachar e-mails pastorais oficiais, convocações de obreiros e acompanhar a caixa de entrada da secretaria da igreja.
            </p>
          </div>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition inline-flex items-center gap-3 text-base"
          >
            <LogIn className="w-5 h-5" />
            <span>{loading ? 'Conectando...' : 'Entrar com o Google'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Email Templates */}
          <div className="bg-gradient-to-r from-red-900/10 to-amber-900/10 dark:from-slate-800 dark:to-slate-800/80 p-5 rounded-2xl border border-red-200/60 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Modelos de Comunicados & Cartas Eclesiásticas
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {EMAIL_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => applyTemplate(tpl)}
                  className="p-3.5 bg-white dark:bg-slate-700/60 hover:bg-red-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-left transition flex flex-col justify-between group"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {tpl.badge}
                    </span>
                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                      {tpl.title}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                    Usar modelo &rarr;
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <form
              onSubmit={e => {
                e.preventDefault();
                loadMessages();
              }}
              className="relative w-full sm:w-80"
            >
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar e-mails na caixa de entrada..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </form>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Inbox className="w-4 h-4" />
              <span>{messages.length} mensagens listadas</span>
            </div>
          </div>

          {/* Message List & Reader Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Messages Inbox */}
            <div className={`lg:col-span-5 space-y-2 ${selectedMessage ? 'hidden lg:block' : 'block'}`}>
              {loading && messages.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500 mb-2" />
                  <p className="text-sm text-slate-500">Buscando mensagens do Gmail...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhum e-mail encontrado</h4>
                </div>
              ) : (
                messages.map(msg => {
                  const isSelected = selectedMessage?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => handleViewMessage(msg)}
                      className={`p-4 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          {msg.isUnread && (
                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          )}
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {msg.from?.replace(/<[^>]+>/, '') || 'Remetente'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {msg.date ? new Date(msg.date).toLocaleDateString('pt-BR') : ''}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1 truncate">
                        {msg.subject || '(Sem assunto)'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {msg.snippet}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Detail Reader */}
            <div className="lg:col-span-7">
              {loadingDetails ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-500 mb-2" />
                  <p className="text-sm text-slate-500">Abrindo mensagem...</p>
                </div>
              ) : selectedMessage ? (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {selectedMessage.subject || '(Sem assunto)'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <strong>De:</strong> {selectedMessage.from}
                        </span>
                        {selectedMessage.to && (
                          <span>
                            <strong>Para:</strong> {selectedMessage.to}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {selectedMessage.date}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl max-h-[500px] overflow-y-auto text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {selectedMessage.bodyText || selectedMessage.snippet}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        const emailMatch = selectedMessage.from?.match(/<([^>]+)>/);
                        const replyTo = emailMatch ? emailMatch[1] : selectedMessage.from || '';
                        setEmailTo(replyTo);
                        setEmailSubject(`Re: ${selectedMessage.subject || ''}`);
                        setEmailBody(`\n\n--- Em ${selectedMessage.date}, ${selectedMessage.from} escreveu:\n> ${selectedMessage.bodyText?.slice(0, 200)}...`);
                        setIsComposeOpen(true);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Responder</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 space-y-3">
                  <MailOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-sm">Selecione uma mensagem ao lado para ler o conteúdo completo.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Novo E-mail Pastoral / Secretaria</h3>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Destinatário (E-mail) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="pastor@gmail.com ou membro@gmail.com"
                  value={emailTo}
                  onChange={e => setEmailTo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Assunto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Convocação de Reunião da Diretoria"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Mensagem / Conteúdo Oficial *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Escreva sua mensagem aqui..."
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'Enviando...' : 'Enviar pelo Gmail'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleGmail;
