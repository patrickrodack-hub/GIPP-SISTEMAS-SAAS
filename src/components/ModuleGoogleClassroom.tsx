import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
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
  BookOpen,
  Send,
  FileText,
  Copy,
  ChevronRight,
  School,
  Share2,
  Calendar
} from 'lucide-react';
import {
  getWorkspaceAccessToken,
  signInWithGoogleWorkspace,
  signOutGoogleWorkspace,
  listClassroomCourses,
  createClassroomCourse,
  listClassroomAnnouncements,
  createClassroomAnnouncement,
  listClassroomCourseWork,
  createClassroomCourseWork,
  listClassroomStudents,
  ClassroomCourse,
  ClassroomAnnouncement,
  ClassroomCourseWork
} from '../services/googleWorkspaceService';

interface ModuleGoogleClassroomProps {
  user?: any;
  db?: any;
}

const COURSE_TEMPLATES = [
  {
    name: 'Teologia Sistemática Pentecostal (CGADB / CPAD)',
    section: 'Módulo Fundamental',
    descriptionHeading: 'Doutrina Bíblica Pentecostal',
    description: 'Estudo aprofundado dos 24 capítulos da Declaração de Fé das Assembleias de Deus (CGADB/CPAD): Bibliologia, Teontologia, Cristologia, Pneumatologia, Soteriologia e Escatologia.',
    room: 'Sala Teológica Virtual',
    badge: 'Teologia'
  },
  {
    name: 'Escola Bíblica Dominical (EBD) - Classe Adultos',
    section: 'Trimestre Vigente',
    descriptionHeading: 'Lições Bíblicas CPAD',
    description: 'Espaço de estudo semanal das Lições Bíblicas CPAD, debates, questionários e materiais complementares.',
    room: 'Templo Central - EBD',
    badge: 'EBD'
  },
  {
    name: 'Curso de Formação de Obreiros e Diáconos',
    section: 'Capacitação Ministerial',
    descriptionHeading: 'Ética, Liturgia e Serviço Cristão',
    description: 'Instrução bíblica e prática para diáconos, presbíteros e obreiros sobre visitação, Santa Ceia, unção de enfermos e liderança bíblica.',
    room: 'Sala Pastoral de Formação',
    badge: 'Obreiros'
  },
  {
    name: 'Discipulado Cristão & Novos Convertidos',
    section: 'Fundamentos da Fé',
    descriptionHeading: 'Primeiros Passos com Cristo',
    description: 'Acompanhamento inicial dos novos convertidos preparando-os para o Santo Batismo em Águas e comunhão plena.',
    room: 'Sala de Acolhimento',
    badge: 'Discipulado'
  }
];

export const ModuleGoogleClassroom: React.FC<ModuleGoogleClassroomProps> = ({ db }) => {
  const [accessToken, setAccessToken] = useState<string | null>(getWorkspaceAccessToken());
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected Course
  const [selectedCourse, setSelectedCourse] = useState<ClassroomCourse | null>(null);
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [courseWorks, setCourseWorks] = useState<ClassroomCourseWork[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingCourseDetails, setLoadingCourseDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'mural' | 'atividades' | 'alunos'>('mural');

  // Announcement modal / input
  const [newAnnouncementText, setNewAnnouncementText] = useState('');
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  // Coursework modal
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [workTitle, setWorkTitle] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [workPoints, setWorkPoints] = useState<number>(10);
  const [savingWork, setSavingWork] = useState(false);

  // New Course Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseSection, setCourseSection] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseRoom, setCourseRoom] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);

  useEffect(() => {
    if (accessToken) {
      loadCourses();
    }
  }, [accessToken]);

  const loadCourses = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setStatusMessage(null);
      const list = await listClassroomCourses(accessToken, ['ACTIVE']);
      setCourses(list);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao listar turmas do Google Classroom.'
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
      setStatusMessage({ type: 'success', text: 'Conectado com sucesso ao Google Classroom!' });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Falha ao autenticar com o Google Classroom.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogleWorkspace();
    setAccessToken(null);
    setCourses([]);
    setSelectedCourse(null);
  };

  const handleSelectCourse = async (course: ClassroomCourse) => {
    setSelectedCourse(course);
    if (!accessToken) return;

    try {
      setLoadingCourseDetails(true);
      const [annList, workList, studList] = await Promise.all([
        listClassroomAnnouncements(accessToken, course.id).catch(() => []),
        listClassroomCourseWork(accessToken, course.id).catch(() => []),
        listClassroomStudents(accessToken, course.id).catch(() => [])
      ]);
      setAnnouncements(annList);
      setCourseWorks(workList);
      setStudents(studList);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingCourseDetails(false);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !selectedCourse || !newAnnouncementText.trim()) return;

    try {
      setPostingAnnouncement(true);
      await createClassroomAnnouncement(accessToken, selectedCourse.id, newAnnouncementText.trim());
      setStatusMessage({ type: 'success', text: 'Aviso publicado no mural da turma!' });
      setNewAnnouncementText('');
      const updated = await listClassroomAnnouncements(accessToken, selectedCourse.id);
      setAnnouncements(updated);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao publicar aviso no Classroom.'
      });
    } finally {
      setPostingAnnouncement(false);
    }
  };

  const handleCreateCourseWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !selectedCourse || !workTitle.trim()) return;

    try {
      setSavingWork(true);
      await createClassroomCourseWork(accessToken, selectedCourse.id, {
        title: workTitle.trim(),
        description: workDescription.trim() || undefined,
        maxPoints: workPoints
      });
      setStatusMessage({ type: 'success', text: `Atividade "${workTitle}" publicada para os alunos!` });
      setIsWorkModalOpen(false);
      setWorkTitle('');
      setWorkDescription('');
      const updated = await listClassroomCourseWork(accessToken, selectedCourse.id);
      setCourseWorks(updated);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao criar atividade.'
      });
    } finally {
      setSavingWork(false);
    }
  };

  const handleCreateCustomCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !courseName.trim()) return;

    try {
      setCreatingCourse(true);
      const created = await createClassroomCourse(accessToken, {
        name: courseName.trim(),
        section: courseSection.trim() || undefined,
        description: courseDescription.trim() || undefined,
        room: courseRoom.trim() || undefined
      });

      setStatusMessage({ type: 'success', text: `Turma "${created.name}" criada no Google Classroom!` });
      setIsCourseModalOpen(false);
      setCourseName('');
      setCourseSection('');
      setCourseDescription('');
      setCourseRoom('');
      await loadCourses();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao criar turma no Google Classroom.'
      });
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleCreateFromTemplate = async (tpl: typeof COURSE_TEMPLATES[0]) => {
    if (!accessToken) return;
    try {
      setCreatingCourse(true);
      setStatusMessage(null);
      const created = await createClassroomCourse(accessToken, {
        name: tpl.name,
        section: tpl.section,
        descriptionHeading: tpl.descriptionHeading,
        description: tpl.description,
        room: tpl.room
      });

      setStatusMessage({ type: 'success', text: `Turma "${created.name}" criada com sucesso no Classroom!` });
      await loadCourses();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao criar modelo de turma.'
      });
    } finally {
      setCreatingCourse(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setStatusMessage({ type: 'success', text: `${label} copiado para a área de transferência!` });
  };

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.section || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Google Classroom Eclesiástico
              <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold">
                Google Workspace
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Turmas virtuais de Teologia Sistemática Pentecostal, Escola Bíblica Dominical e Formação de Obreiros.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {accessToken ? (
            <>
              <button
                onClick={loadCourses}
                disabled={loading}
                className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-2 text-sm font-medium border border-slate-200 dark:border-slate-700"
                title="Atualizar Turmas"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>
              <button
                onClick={() => setIsCourseModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Turma</span>
              </button>
              <button
                onClick={handleSignOut}
                className="p-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition border border-rose-200 dark:border-rose-900/50"
                title="Desconectar do Classroom"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Conectar Google Classroom</span>
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <School className="w-10 h-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Salas de Aula e Ensino Teológico
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Conecte sua conta do Google Workspace para criar turmas no Google Classroom, postar tarefas da EBD, avisos pastorais e gerenciar materiais didáticos com seus alunos.
            </p>
          </div>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition inline-flex items-center gap-3 text-base"
          >
            <LogIn className="w-5 h-5" />
            <span>{loading ? 'Conectando...' : 'Entrar com o Google'}</span>
          </button>
        </div>
      ) : selectedCourse ? (
        /* Course Detail View */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-emerald-200 hover:text-white text-xs font-bold flex items-center gap-1 mb-2 transition"
                >
                  &larr; Voltar para todas as turmas
                </button>
                <h2 className="text-2xl font-black">{selectedCourse.name}</h2>
                <p className="text-sm text-emerald-100 mt-1">
                  {selectedCourse.section ? `${selectedCourse.section} • ` : ''}
                  {selectedCourse.room || 'Ambiente Virtual'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {selectedCourse.enrollmentCode && (
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
                    <span className="text-xs text-emerald-200 font-medium">Código da Turma:</span>
                    <strong className="text-sm font-mono tracking-wider">{selectedCourse.enrollmentCode}</strong>
                    <button
                      onClick={() => copyToClipboard(selectedCourse.enrollmentCode!, 'Código da Turma')}
                      className="p-1 hover:bg-white/20 rounded transition"
                      title="Copiar código"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {selectedCourse.alternateLink && (
                  <a
                    href={selectedCourse.alternateLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-white text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-emerald-50 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir no Classroom</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('mural')}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
                activeTab === 'mural'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Mural & Avisos ({announcements.length})
            </button>
            <button
              onClick={() => setActiveTab('atividades')}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
                activeTab === 'atividades'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Atividades & Lições ({courseWorks.length})
            </button>
            <button
              onClick={() => setActiveTab('alunos')}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
                activeTab === 'alunos'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Alunos Inscritos ({students.length})
            </button>
          </div>

          {/* Tab 1: Mural */}
          {activeTab === 'mural' && (
            <div className="space-y-6">
              {/* Post new announcement */}
              <form
                onSubmit={handlePostAnnouncement}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
              >
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Publicar aviso ou comunicado para os alunos da turma
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Escreva seu aviso pastoral, lembrete de leitura das Lições CPAD ou data da próxima prova..."
                  value={newAnnouncementText}
                  onChange={e => setNewAnnouncementText(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={postingAnnouncement}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{postingAnnouncement ? 'Publicando...' : 'Postar no Mural'}</span>
                  </button>
                </div>
              </form>

              {/* Announcements list */}
              {loadingCourseDetails ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm text-slate-500">Carregando avisos...</p>
                </div>
              ) : announcements.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400">
                  <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">Nenhum aviso postado nesta turma ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann, idx) => (
                    <div
                      key={ann.id || idx}
                      className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Aviso do Professor</span>
                        <span>{ann.creationTime ? new Date(ann.creationTime).toLocaleString('pt-BR') : ''}</span>
                      </div>
                      <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                        {ann.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: CourseWork */}
          {activeTab === 'atividades' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                  Lições & Questionários Teológicos
                </h3>
                <button
                  onClick={() => setIsWorkModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Atividade</span>
                </button>
              </div>

              {courseWorks.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">Nenhuma atividade criada nesta turma.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {courseWorks.map((work, idx) => (
                    <div
                      key={work.id || idx}
                      className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                          {work.title}
                        </h4>
                        {work.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {work.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span>Pontuação: {work.maxPoints || 10} pts</span>
                          {work.creationTime && (
                            <span>Criado em: {new Date(work.creationTime).toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                      </div>
                      {work.alternateLink && (
                        <a
                          href={work.alternateLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-emerald-600 transition"
                          title="Abrir no Google Classroom"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Students */}
          {activeTab === 'alunos' && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Alunos Matriculados</h3>
                  <p className="text-xs text-slate-500">Envie o código da turma para que os membros acessem pelo app do Classroom</p>
                </div>
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg">
                  {students.length} matriculados
                </div>
              </div>

              {students.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhum aluno entrou nesta turma ainda. Compartilhe o código <strong>{selectedCourse.enrollmentCode || '-'}</strong>.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {students.map((st, i) => (
                    <div key={st.userId || i} className="py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        {st.profile?.name?.fullName?.slice(0, 1) || 'A'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {st.profile?.name?.fullName || 'Aluno da Turma'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {st.profile?.emailAddress || ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Course Grid & Templates */
        <div className="space-y-6">
          {/* Quick Course Templates */}
          <div className="bg-gradient-to-r from-emerald-900/10 to-teal-900/10 dark:from-slate-800 dark:to-slate-800/80 p-5 rounded-2xl border border-emerald-200/60 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Modelos Rápidos de Turmas Teológicas & EBD
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {COURSE_TEMPLATES.map((tpl, i) => (
                <div
                  key={i}
                  className="p-4 bg-white dark:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-600 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      {tpl.badge}
                    </span>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      {tpl.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCreateFromTemplate(tpl)}
                    disabled={creatingCourse}
                    className="mt-4 w-full py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <span>{creatingCourse ? 'Criando...' : 'Criar Turma'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar turmas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <School className="w-4 h-4" />
              <span>{filteredCourses.length} turmas ativas</span>
            </div>
          </div>

          {/* Course Cards */}
          {loading && courses.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
              <p className="text-sm text-slate-500">Buscando turmas do Google Classroom...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">Nenhuma turma encontrada</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Crie uma turma personalizada ou utilize um dos modelos teológicos acima.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map(course => (
                <div
                  key={course.id}
                  className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl flex-shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      {course.enrollmentCode && (
                        <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                          Código: {course.enrollmentCode}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-2">
                        {course.name}
                      </h4>
                      {course.section && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                          {course.section}
                        </p>
                      )}
                      {course.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                    <button
                      onClick={() => handleSelectCourse(course)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition shadow-sm"
                    >
                      <span>Acessar Turma</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {course.alternateLink && (
                      <a
                        href={course.alternateLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl transition"
                        title="Abrir no Google Classroom"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Criar Turma no Google Classroom</h3>
              </div>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nome da Turma / Curso *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Teologia Sistemática - Turma 2026"
                  value={courseName}
                  onChange={e => setCourseName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Seção / Módulo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Módulo Avançado / EBD Adultos"
                  value={courseSection}
                  onChange={e => setCourseSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Sala / Local
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sala 02 - Templo Central"
                  value={courseRoom}
                  onChange={e => setCourseRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Ementa / Descrição
                </label>
                <textarea
                  rows={3}
                  placeholder="Descrição da disciplina, referências da CPAD..."
                  value={courseDescription}
                  onChange={e => setCourseDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingCourse}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-sm"
                >
                  {creatingCourse ? 'Criando...' : 'Criar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New CourseWork Modal */}
      {isWorkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Criar Atividade / Trabalho</h3>
              </div>
              <button
                onClick={() => setIsWorkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourseWork} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Título da Atividade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Questionário sobre Pneumatologia e Dons"
                  value={workTitle}
                  onChange={e => setWorkTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Pontos (Nota Máxima)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={workPoints}
                  onChange={e => setWorkPoints(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Instruções para os Alunos
                </label>
                <textarea
                  rows={4}
                  placeholder="Leia os capítulos indicados da Declaração de Fé da CPAD e responda às questões..."
                  value={workDescription}
                  onChange={e => setWorkDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsWorkModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingWork}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-sm"
                >
                  {savingWork ? 'Publicando...' : 'Publicar Atividade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleGoogleClassroom;
