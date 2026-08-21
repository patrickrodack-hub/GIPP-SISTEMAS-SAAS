import React, { useState, useEffect, useContext } from 'react';
import {
  FileCheck2,
  Plus,
  RefreshCw,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  LogOut,
  Sparkles,
  Users,
  Eye,
  MessageSquare,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  ClipboardList,
  UserCheck,
  UserPlus,
  Download,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  getWorkspaceAccessToken,
  signInWithGoogleWorkspace,
  signOutGoogleWorkspace,
  listDriveFiles,
  createGoogleForm,
  getGoogleForm,
  getGoogleFormResponses,
  parseGoogleFormResponses,
  GoogleDriveFile,
  GoogleFormInfo,
  ParsedFormResponse
} from '../services/googleWorkspaceService';
import { ChurchContext } from '../App';
import { collection, addDoc } from 'firebase/firestore';

interface ModuleGoogleFormsProps {
  user?: any;
  db?: any;
}

const FORM_TEMPLATES = [
  {
    title: 'Ficha de Matrícula - Escola Bíblica Dominical (EBD)',
    description: 'Cadastro oficial de alunos para o novo trimestre de estudos bíblicos.',
    badge: 'EBD',
    items: [
      {
        title: 'Nome Completo do Aluno',
        questionItem: {
          question: {
            required: true,
            textQuestion: { paragraph: false }
          }
        }
      },
      {
        title: 'Telefone / WhatsApp',
        questionItem: {
          question: {
            required: true,
            textQuestion: { paragraph: false }
          }
        }
      },
      {
        title: 'Classe da EBD Desejada',
        questionItem: {
          question: {
            required: true,
            choiceQuestion: {
              type: 'RADIO',
              options: [
                { value: 'Classe Adultos (Homens & Mulheres)' },
                { value: 'Classe Jovens e Universitários' },
                { value: 'Classe Adolescentes' },
                { value: 'Classe Crianças (Salinha Kids)' },
                { value: 'Classe Novos Convertidos & Discipulado' }
              ]
            }
          }
        }
      },
      {
        title: 'Você já possui a Revista CPAD deste trimestre?',
        questionItem: {
          question: {
            required: true,
            choiceQuestion: {
              type: 'RADIO',
              options: [{ value: 'Sim, já adquiri' }, { value: 'Não, desejo encomendar pela igreja' }]
            }
          }
        }
      }
    ]
  },
  {
    title: 'Inscrição para o Santo Batismo em Águas',
    description: 'Inscrição oficial e triagem para os candidatos ao próximo batismo bíblico por imersão.',
    badge: 'Batismo',
    items: [
      {
        title: 'Nome Completo do(a) Candidato(a)',
        questionItem: {
          question: {
            required: true,
            textQuestion: { paragraph: false }
          }
        }
      },
      {
        title: 'Data de Nascimento',
        questionItem: {
          question: {
            required: true,
            textQuestion: { paragraph: false }
          }
        }
      },
      {
        title: 'Estado Civil',
        questionItem: {
          question: {
            required: true,
            choiceQuestion: {
              type: 'RADIO',
              options: [{ value: 'Solteiro(a)' }, { value: 'Casado(a)' }, { value: 'Viúvo(a)' }]
            }
          }
        }
      },
      {
        title: 'Já concluiu o Curso de Discipulado / Novos Convertidos?',
        questionItem: {
          question: {
            required: true,
            choiceQuestion: {
              type: 'RADIO',
              options: [{ value: 'Sim, já concluí' }, { value: 'Estou cursando atualmente' }]
            }
          }
        }
      },
      {
        title: 'Nome do Dirigente da sua Congregação',
        questionItem: {
          question: {
            required: true,
            textQuestion: { paragraph: false }
          }
        }
      }
    ]
  },
  {
    title: 'Pedidos de Oração & Aconselhamento Pastoral',
    description: 'Canal sigiloso de oração, visitação e atendimento do ministério pastoral.',
    badge: 'Pastoral',
    items: [
      {
        title: 'Seu Nome (ou digite Anônimo se preferir)',
        questionItem: {
          question: {
            required: true,
            textQuestion: { paragraph: false }
          }
        }
      },
      {
        title: 'Motivo / Causa da Oração',
        questionItem: {
          question: {
            required: true,
            choiceQuestion: {
              type: 'CHECKBOX',
              options: [
                { value: 'Cura e Saúde dos Enfermos' },
                { value: 'Restauração Familiar & Matrimonial' },
                { value: 'Portas de Emprego & Finanças' },
                { value: 'Libertação Espiritual & Salvação de Parentes' },
                { value: 'Batismo no Espírito Santo' }
              ]
            }
          }
        }
      },
      {
        title: 'Detalhes e Pedido em Particular',
        questionItem: {
          question: {
            required: true,
            textQuestion: { paragraph: true }
          }
        }
      },
      {
        title: 'Deseja receber visita pastoral ou atendimento presencial?',
        questionItem: {
          question: {
            required: true,
            choiceQuestion: {
              type: 'RADIO',
              options: [{ value: 'Sim, por favor' }, { value: 'Apenas intercessão' }]
            }
          }
        }
      }
    ]
  },
  {
    title: 'Atualização Cadastral e Censo de Membros',
    description: 'Recadastramento do rol eclesiástico da igreja e congregações.',
    badge: 'Secretaria',
    items: [
      {
        title: 'Nome Completo',
        questionItem: {
          question: {
            required: true,
            textQuestion: { paragraph: false }
          }
        }
      },
      {
        title: 'Cargo / Função Eclesiástica',
        questionItem: {
          question: {
            required: true,
            choiceQuestion: {
              type: 'RADIO',
              options: [
                { value: 'Membro Comungante' },
                { value: 'Cooperador(a)' },
                { value: 'Diácono' },
                { value: 'Presbítero' },
                { value: 'Evangelista / Pastor' }
              ]
            }
          }
        }
      },
      {
        title: 'Endereço Residencial Completo',
        questionItem: {
          question: {
            required: true,
            textQuestion: { paragraph: true }
          }
        }
      },
      {
        title: 'Telefone e WhatsApp',
        questionItem: {
          question: {
            required: true,
            textQuestion: { paragraph: false }
          }
        }
      }
    ]
  }
];

export const ModuleGoogleForms: React.FC<ModuleGoogleFormsProps> = ({ db: propDb, user: propUser }) => {
  const churchCtx = useContext(ChurchContext);
  const db = propDb || churchCtx?.db || {};
  const user = propUser || churchCtx?.user || {};
  const dbFirestore = churchCtx?.dbFirestore;
  const appId = churchCtx?.appId;
  const addToast = churchCtx?.addToast || (() => {});

  const [accessToken, setAccessToken] = useState<string | null>(getWorkspaceAccessToken());
  const [forms, setForms] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Responses viewer & parser
  const [selectedFormResponses, setSelectedFormResponses] = useState<{
    formId: string;
    title: string;
    rawResponses: any[];
    parsedResponses: ParsedFormResponse[];
  } | null>(null);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [activeResponsesTab, setActiveResponsesTab] = useState<'parsed' | 'raw'>('parsed');
  const [importingState, setImportingState] = useState<Record<string, 'importing' | 'imported_visitante' | 'imported_membro'>>({});
  const [batchImporting, setBatchImporting] = useState(false);

  useEffect(() => {
    if (accessToken) {
      loadForms();
    }
  }, [accessToken]);

  const loadForms = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setStatusMessage(null);
      const files = await listDriveFiles(accessToken, {
        mimeType: 'application/vnd.google-apps.form',
        query: searchTerm,
        pageSize: 40
      });
      setForms(files);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao buscar formulários do Google Forms.'
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
      setStatusMessage({ type: 'success', text: 'Conectado com sucesso ao Google Forms!' });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Falha ao autenticar com o Google Forms.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogleWorkspace();
    setAccessToken(null);
    setForms([]);
  };

  const handleCreateCustomForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !formTitle.trim()) return;

    try {
      setCreating(true);
      const created = await createGoogleForm(
        accessToken,
        formTitle.trim(),
        formDescription.trim() || undefined,
        [
          {
            title: 'Nome Completo',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false }
              }
            }
          },
          {
            title: 'WhatsApp / Contato',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false }
              }
            }
          },
          {
            title: 'Observações / Mensagem',
            questionItem: {
              question: {
                required: false,
                textQuestion: { paragraph: true }
              }
            }
          }
        ]
      );

      setStatusMessage({
        type: 'success',
        text: `Formulário "${formTitle}" criado com sucesso no Google Forms!`
      });
      setIsModalOpen(false);
      setFormTitle('');
      setFormDescription('');
      await loadForms();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao criar formulário.'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCreateFromTemplate = async (tpl: typeof FORM_TEMPLATES[0]) => {
    if (!accessToken) return;
    try {
      setCreating(true);
      setStatusMessage(null);
      await createGoogleForm(
        accessToken,
        tpl.title,
        tpl.description,
        tpl.items
      );
      setStatusMessage({
        type: 'success',
        text: `Modelo "${tpl.title}" criado com sucesso no Google Forms!`
      });
      await loadForms();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao criar modelo de formulário.'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleViewResponses = async (form: GoogleDriveFile) => {
    if (!accessToken) return;
    try {
      setLoadingResponses(true);
      const [formDetails, responses] = await Promise.all([
        getGoogleForm(accessToken, form.id).catch(() => null),
        getGoogleFormResponses(accessToken, form.id)
      ]);

      const parsed = parseGoogleFormResponses(
        formDetails || { formId: form.id, info: { title: form.name } },
        responses,
        db.membros || [],
        db.visitantes || []
      );

      setSelectedFormResponses({
        formId: form.id,
        title: form.name,
        rawResponses: responses,
        parsedResponses: parsed
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao buscar respostas do formulário.'
      });
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleImportSingle = async (
    item: ParsedFormResponse,
    targetType: 'visitantes' | 'membros'
  ) => {
    if (!dbFirestore || !appId) {
      addToast('Conexão ao banco de dados indisponível.', 'error');
      return;
    }

    try {
      setImportingState(prev => ({ ...prev, [item.responseId]: 'importing' }));

      const baseData = {
        nome: item.nome || 'Pessoa sem nome',
        telefone: item.telefone || '',
        email: item.email || '',
        endereco: item.endereco || '',
        bairro: item.bairro || '',
        cidade: item.cidade || '',
        congregacao_id: user?.congregacao_id || 'sede',
        origem: `Google Forms (${selectedFormResponses?.title || 'Formulário'})`,
        observacoes: [
          item.pedidoOracao ? `Pedido de Oração: ${item.pedidoOracao}` : '',
          item.comoConheceu ? `Como conheceu: ${item.comoConheceu}` : '',
          item.classeDesejada ? `Classe EBD: ${item.classeDesejada}` : ''
        ].filter(Boolean).join(' | '),
        created_at: new Date().toISOString()
      };

      if (targetType === 'visitantes') {
        const visitanteDoc = {
          ...baseData,
          data_visita: item.submittedAt.split('T')[0] || new Date().toISOString().split('T')[0],
          status_consolidacao: 'pendente'
        };
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'visitantes'), visitanteDoc);
        setImportingState(prev => ({ ...prev, [item.responseId]: 'imported_visitante' }));
        addToast(`"${item.nome}" importado(a) como Visitante!`, 'success');
      } else {
        const membroDoc = {
          ...baseData,
          cargo_ministerial: 'Membro',
          estado_civil: item.estadoCivil || 'Solteiro(a)',
          batizado_aguas: item.jaBatizado || 'Não informado',
          status: 'ativo'
        };
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros'), membroDoc);
        setImportingState(prev => ({ ...prev, [item.responseId]: 'imported_membro' }));
        addToast(`"${item.nome}" cadastrado(a) como Membro!`, 'success');
      }
    } catch (err: any) {
      addToast('Erro ao importar: ' + err.message, 'error');
      setImportingState(prev => {
        const cp = { ...prev };
        delete cp[item.responseId];
        return cp;
      });
    }
  };

  const handleBatchImport = async (targetType: 'visitantes' | 'membros') => {
    if (!selectedFormResponses || !dbFirestore || !appId) return;

    try {
      setBatchImporting(true);
      let count = 0;

      for (const item of selectedFormResponses.parsedResponses) {
        if (importingState[item.responseId]) continue;

        const baseData = {
          nome: item.nome || 'Pessoa sem nome',
          telefone: item.telefone || '',
          email: item.email || '',
          endereco: item.endereco || '',
          bairro: item.bairro || '',
          cidade: item.cidade || '',
          congregacao_id: user?.congregacao_id || 'sede',
          origem: `Google Forms (${selectedFormResponses.title})`,
          observacoes: [
            item.pedidoOracao ? `Pedido de Oração: ${item.pedidoOracao}` : '',
            item.comoConheceu ? `Como conheceu: ${item.comoConheceu}` : ''
          ].filter(Boolean).join(' | '),
          created_at: new Date().toISOString()
        };

        if (targetType === 'visitantes') {
          await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'visitantes'), {
            ...baseData,
            data_visita: item.submittedAt.split('T')[0] || new Date().toISOString().split('T')[0],
            status_consolidacao: 'pendente'
          });
          setImportingState(prev => ({ ...prev, [item.responseId]: 'imported_visitante' }));
        } else {
          await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros'), {
            ...baseData,
            cargo_ministerial: 'Membro',
            estado_civil: item.estadoCivil || 'Solteiro(a)',
            status: 'ativo'
          });
          setImportingState(prev => ({ ...prev, [item.responseId]: 'imported_membro' }));
        }
        count++;
      }

      addToast(`${count} registros importados para ${targetType === 'visitantes' ? 'Visitantes' : 'Membros'} com sucesso!`, 'success');
    } catch (err: any) {
      addToast('Erro na importação em lote: ' + err.message, 'error');
    } finally {
      setBatchImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Google Forms Eclesiástico
              <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-semibold">
                Google Workspace
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Formulários oficiais de matrículas EBD, inscrições de batismo, pedidos de oração e censo de membros.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {accessToken ? (
            <>
              <button
                onClick={loadForms}
                disabled={loading}
                className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-2 text-sm font-medium border border-slate-200 dark:border-slate-700"
                title="Atualizar Formulários"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-sm transition flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Formulário</span>
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
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Conectar Google Forms</span>
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
          <div className="w-20 h-20 mx-auto bg-purple-500/10 rounded-3xl flex items-center justify-center text-purple-600 dark:text-purple-400">
            <ClipboardList className="w-10 h-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Formulários Eclesiásticos e Inscrições Online
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Conecte sua conta do Google Workspace para criar formulários completos de matrícula na EBD, inscrições de batismo em águas e coleta de pedidos de oração.
            </p>
          </div>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition inline-flex items-center gap-3 text-base"
          >
            <LogIn className="w-5 h-5" />
            <span>{loading ? 'Conectando...' : 'Entrar com o Google'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Templates */}
          <div className="bg-gradient-to-r from-purple-900/10 to-pink-900/10 dark:from-slate-800 dark:to-slate-800/80 p-5 rounded-2xl border border-purple-200/60 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Modelos de Formulários Denominacionais em 1 Clique
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {FORM_TEMPLATES.map((tpl, i) => (
                <div
                  key={i}
                  className="p-4 bg-white dark:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-600 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                      {tpl.badge}
                    </span>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCreateFromTemplate(tpl)}
                    disabled={creating}
                    className="mt-4 w-full py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <span>{creating ? 'Criando...' : 'Criar Formulário'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <form
              onSubmit={e => {
                e.preventDefault();
                loadForms();
              }}
              className="relative w-full sm:w-80"
            >
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar formulários..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </form>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Layers className="w-4 h-4" />
              <span>{forms.length} formulários no Google Drive</span>
            </div>
          </div>

          {/* Forms List */}
          {loading && forms.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-500 mb-2" />
              <p className="text-sm text-slate-500">Buscando formulários do Google Forms...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">Nenhum formulário encontrado</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Crie um novo formulário ou utilize um dos modelos rápidos denominacionais acima.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.map(form => (
                <div
                  key={form.id}
                  className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl flex-shrink-0">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <a
                        href={form.webViewLink || `https://docs.google.com/forms/d/${form.id}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-purple-600 transition"
                        title="Abrir no Google Forms"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-2">
                        {form.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Modificado em: {form.modifiedTime ? new Date(form.modifiedTime).toLocaleDateString('pt-BR') : 'Data não informada'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                    <button
                      onClick={() => handleViewResponses(form)}
                      disabled={loadingResponses}
                      className="flex-1 py-2 px-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Respostas</span>
                    </button>
                    <a
                      href={`https://docs.google.com/forms/d/${form.id}/viewform`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                      title="Preencher Formulário"
                    >
                      <span>Responder</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Responses & Import Modal */}
      {selectedFormResponses && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-xl">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                    Respostas do Formulário & Importação
                  </h3>
                  <p className="text-xs text-slate-500">{selectedFormResponses.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFormResponses(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Header Actions & Stats */}
            <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Total de Envios: <strong>{selectedFormResponses.parsedResponses.length}</strong>
                </span>
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Duplicatas: {selectedFormResponses.parsedResponses.filter(p => p.isDuplicate).length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={batchImporting || selectedFormResponses.parsedResponses.length === 0}
                  onClick={() => handleBatchImport('visitantes')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Importar Todos como Visitantes</span>
                </button>
                <button
                  disabled={batchImporting || selectedFormResponses.parsedResponses.length === 0}
                  onClick={() => handleBatchImport('membros')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Importar Todos como Membros</span>
                </button>
                <a
                  href={`https://docs.google.com/forms/d/${selectedFormResponses.formId}/edit#responses`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl font-semibold flex items-center gap-1 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Forms</span>
                </a>
              </div>
            </div>

            {/* List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {selectedFormResponses.parsedResponses.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  Nenhuma resposta enviada até o momento.
                </div>
              ) : (
                selectedFormResponses.parsedResponses.map((item, idx) => {
                  const state = importingState[item.responseId];
                  return (
                    <div
                      key={item.responseId || idx}
                      className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-purple-300"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                            {item.nome || `Respondente #${idx + 1}`}
                          </h4>
                          {item.isDuplicate && (
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {item.duplicateReason || 'Já cadastrado no sistema'}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {item.submittedAt ? new Date(item.submittedAt).toLocaleString('pt-BR') : ''}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1">
                          {item.telefone && (
                            <div>
                              <span className="text-slate-400">WhatsApp:</span> <strong>{item.telefone}</strong>
                            </div>
                          )}
                          {item.email && (
                            <div>
                              <span className="text-slate-400">E-mail:</span> <strong>{item.email}</strong>
                            </div>
                          )}
                          {item.endereco && (
                            <div>
                              <span className="text-slate-400">Endereço:</span> <strong>{item.endereco}</strong>
                            </div>
                          )}
                          {item.classeDesejada && (
                            <div>
                              <span className="text-slate-400">Classe EBD:</span> <strong>{item.classeDesejada}</strong>
                            </div>
                          )}
                          {item.comoConheceu && (
                            <div>
                              <span className="text-slate-400">Como conheceu:</span> <strong>{item.comoConheceu}</strong>
                            </div>
                          )}
                          {item.pedidoOracao && (
                            <div className="col-span-full">
                              <span className="text-slate-400">Oração:</span> <em>"{item.pedidoOracao}"</em>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {state === 'imported_visitante' ? (
                          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Visitante Importado
                          </span>
                        ) : state === 'imported_membro' ? (
                          <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Membro Cadastrado
                          </span>
                        ) : (
                          <>
                            <button
                              disabled={state === 'importing'}
                              onClick={() => handleImportSingle(item, 'visitantes')}
                              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-emerald-200 dark:border-emerald-800"
                              title="Importar para o cadastro de Visitantes"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Como Visitante</span>
                            </button>
                            <button
                              disabled={state === 'importing'}
                              onClick={() => handleImportSingle(item, 'membros')}
                              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-indigo-200 dark:border-indigo-800"
                              title="Cadastrar como Membro no Rol Oficial"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>Como Membro</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Criar Novo Formulário Google</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Título do Formulário *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Inscrição para Congresso de Mulheres"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Descrição / Instruções aos Respondentes
                </label>
                <textarea
                  rows={3}
                  placeholder="Preencha os campos abaixo para confirmar sua presença..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                />
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
                  disabled={creating}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm shadow-sm"
                >
                  {creating ? 'Criando...' : 'Criar no Google Forms'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleGoogleForms;
