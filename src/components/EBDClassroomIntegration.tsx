import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  Users,
  BookOpen,
  Sparkles,
  Award,
  Calendar,
  Send,
  Search,
  Check,
  ChevronRight,
  ShieldCheck,
  Edit3,
  Layers
} from 'lucide-react';
import {
  getWorkspaceAccessToken,
  signInWithGoogleWorkspace,
  listClassroomCourses,
  listClassroomStudents,
  listClassroomCourseWork,
  listClassroomStudentSubmissions,
  patchClassroomStudentSubmission,
  createClassroomCourse,
  createClassroomCourseWork,
  ClassroomCourse,
  ClassroomCourseWork,
  ClassroomStudentSubmission
} from '../services/googleWorkspaceService';
import { doc, setDoc, addDoc, collection, updateDoc } from 'firebase/firestore';

interface EBDClassroomIntegrationProps {
  db: any;
  dbFirestore: any;
  appId: string;
  user: any;
  addToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  turmas: any[];
  alunos: any[];
  licoes: any[];
}

export const EBDClassroomIntegration: React.FC<EBDClassroomIntegrationProps> = ({
  db,
  dbFirestore,
  appId,
  user,
  addToast,
  turmas,
  alunos,
  licoes
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(getWorkspaceAccessToken());
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ClassroomCourse | null>(null);
  
  // Course details
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  const [courseWorks, setCourseWorks] = useState<ClassroomCourseWork[]>([]);
  const [selectedWork, setSelectedWork] = useState<ClassroomCourseWork | null>(null);
  const [submissions, setSubmissions] = useState<ClassroomStudentSubmission[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Grade editing
  const [editingGrade, setEditingGrade] = useState<{ submissionId: string; grade: number } | null>(null);
  const [savingGrade, setSavingGrade] = useState(false);

  // Status feedback
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Export to Classroom state
  const [exportingClass, setExportingClass] = useState(false);
  const [selectedTurmaToExport, setSelectedTurmaToExport] = useState<string>('');

  useEffect(() => {
    if (accessToken) {
      loadCourses();
    }
  }, [accessToken]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setStatusMessage(null);
      const { accessToken: token } = await signInWithGoogleWorkspace();
      setAccessToken(token);
      addToast('Conectado ao Google Classroom!', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Falha ao autenticar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const list = await listClassroomCourses(accessToken);
      setCourses(list);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        text: err?.message || 'Erro ao carregar turmas do Google Classroom.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (course: ClassroomCourse) => {
    setSelectedCourse(course);
    setSelectedWork(null);
    setSubmissions([]);
    if (!accessToken) return;

    try {
      setLoadingDetails(true);
      const [students, works] = await Promise.all([
        listClassroomStudents(accessToken, course.id),
        listClassroomCourseWork(accessToken, course.id)
      ]);
      setCourseStudents(students);
      setCourseWorks(works);
    } catch (err: any) {
      addToast('Erro ao carregar detalhes da turma.', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSelectWork = async (work: ClassroomCourseWork) => {
    setSelectedWork(work);
    if (!accessToken || !selectedCourse) return;

    try {
      setLoadingSubmissions(true);
      const subs = await listClassroomStudentSubmissions(accessToken, selectedCourse.id, work.id);
      
      // Match student profile names to submissions
      const enriched = subs.map(sub => {
        const studentInfo = courseStudents.find(s => s.userId === sub.userId);
        return {
          ...sub,
          studentName: studentInfo?.profile?.name?.fullName || `Aluno ID ${sub.userId.substring(0, 6)}`,
          studentEmail: studentInfo?.profile?.emailAddress || ''
        };
      });

      setSubmissions(enriched);
    } catch (err: any) {
      addToast('Erro ao buscar notas e entregas.', 'error');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Import Classroom Course as EBD Turma
  const handleImportCourseAsTurma = async (course: ClassroomCourse) => {
    if (!dbFirestore || !appId) return;

    try {
      setLoading(true);
      // Check if already imported
      const existing = turmas.find(t => t.google_classroom_id === course.id || t.nome === course.name);
      if (existing) {
        addToast(`A turma "${course.name}" já existe na EBD!`, 'info');
        return;
      }

      const newTurma = {
        nome: course.name,
        sala: course.room || course.section || 'Sala Google Classroom',
        google_classroom_id: course.id,
        google_classroom_link: course.alternateLink || '',
        descricao: course.descriptionHeading || course.description || 'Turma importada do Google Classroom.',
        congregacao_id: user?.congregacao_id || 'sede',
        created_at: new Date().toISOString()
      };

      const docRef = await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_turmas'), newTurma);

      // Now import enrolled students
      if (courseStudents.length > 0) {
        for (const st of courseStudents) {
          const stName = st.profile?.name?.fullName || 'Aluno Classroom';
          const stEmail = st.profile?.emailAddress || '';
          
          await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_alunos'), {
            nome: stName,
            email: stEmail,
            turma_id: docRef.id,
            google_user_id: st.userId,
            congregacao_id: user?.congregacao_id || 'sede',
            created_at: new Date().toISOString()
          });
        }
      }

      addToast(`Turma "${course.name}" e ${courseStudents.length} alunos importados com sucesso!`, 'success');
    } catch (err: any) {
      addToast('Erro ao importar turma: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Import CourseWork as EBD Lesson
  const handleImportWorkAsLesson = async (work: ClassroomCourseWork) => {
    if (!dbFirestore || !appId || !selectedCourse) return;

    try {
      setLoading(true);
      const matchedTurma = turmas.find(t => t.google_classroom_id === selectedCourse.id || t.nome === selectedCourse.name);
      const targetTurmaId = matchedTurma?.id || (turmas[0]?.id || 'geral');

      const newLicao = {
        turma_id: targetTurmaId,
        revista: selectedCourse.name,
        licao_numero: String(licoes.length + 1),
        titulo_licao: work.title,
        conteudo_estudo: work.description || `Atividade oficial importada do Google Classroom (${work.title}).`,
        google_coursework_id: work.id,
        google_link: work.alternateLink || '',
        max_pontos: work.maxPoints || 10,
        data: work.dueDate ? `${work.dueDate.year}-${String(work.dueDate.month).padStart(2, '0')}-${String(work.dueDate.day).padStart(2, '0')}` : new Date().toISOString().split('T')[0],
        congregacao_id: user?.congregacao_id || 'sede',
        created_at: new Date().toISOString()
      };

      await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_licoes'), newLicao);
      addToast(`Atividade "${work.title}" importada para a EBD!`, 'success');
    } catch (err: any) {
      addToast('Erro ao importar atividade: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save student grade in Google Classroom
  const handleSaveStudentGrade = async (submission: ClassroomStudentSubmission, newGrade: number) => {
    if (!accessToken || !selectedCourse || !selectedWork) return;

    try {
      setSavingGrade(true);
      await patchClassroomStudentSubmission(accessToken, selectedCourse.id, selectedWork.id, submission.id, newGrade);
      
      setSubmissions(prev =>
        prev.map(s => (s.id === submission.id ? { ...s, assignedGrade: newGrade, state: 'RETURNED' } : s))
      );
      setEditingGrade(null);
      addToast(`Nota ${newGrade} atribuída com sucesso a ${submission.studentName}!`, 'success');
    } catch (err: any) {
      addToast('Erro ao gravar nota: ' + err.message, 'error');
    } finally {
      setSavingGrade(false);
    }
  };

  // Export EBD Turma to Google Classroom
  const handleExportTurmaToClassroom = async () => {
    if (!accessToken || !selectedTurmaToExport) {
      addToast('Selecione uma turma para exportar.', 'warning');
      return;
    }

    const targetTurma = turmas.find(t => t.id === selectedTurmaToExport);
    if (!targetTurma) return;

    try {
      setExportingClass(true);
      const created = await createClassroomCourse(accessToken, {
        name: `EBD • ${targetTurma.nome}`,
        section: `Ano Letivo ${new Date().getFullYear()}`,
        descriptionHeading: 'Escola Bíblica Dominical',
        room: targetTurma.sala || 'Templo Sede'
      });

      // Save Google Classroom ID to Turma in Firestore
      if (dbFirestore && appId) {
        const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'ebd_turmas', targetTurma.id);
        await updateDoc(docRef, {
          google_classroom_id: created.id,
          google_classroom_link: created.alternateLink || ''
        });
      }

      addToast(`Turma "${targetTurma.nome}" criada no Google Classroom!`, 'success');
      loadCourses();
    } catch (err: any) {
      addToast('Erro ao exportar turma: ' + err.message, 'error');
    } finally {
      setExportingClass(false);
    }
  };

  return (
    <div className="space-y-6 animate-entrance text-left pb-8">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Integração Pedagógica Oficial
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              Google Classroom & Escola Bíblica Dominical
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Importe turmas, atividades pedagógicas e notas dos alunos entre o Google Classroom e a EBD. Gerencie a pontuação teológica e o engajamento dos alunos com sincronização em tempo real.
            </p>
          </div>

          {!accessToken ? (
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2.5 shadow-lg shadow-emerald-600/30 transition shrink-0 uppercase tracking-wider"
            >
              <LogIn size={16} />
              <span>{loading ? 'Conectando...' : 'Conectar Google Classroom'}</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={loadCourses}
                disabled={loading}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition border border-white/15"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Atualizar Turmas</span>
              </button>
              <a
                href="https://classroom.google.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md"
              >
                <ExternalLink size={14} />
                <span>Abrir Google Classroom</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="underline">
            Fechar
          </button>
        </div>
      )}

      {/* Main Content */}
      {!accessToken ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
            <GraduationCap size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Conecte sua Conta para Gerenciar as Turmas
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Faça login com a conta Google para carregar todas as salas virtuais, tarefas dos alunos, notas atribuídas e lições de teologia.
          </p>
          <button
            onClick={handleSignIn}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow"
          >
            <LogIn size={15} />
            <span>Entrar com o Google</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Courses List & Export Tool */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Export Panel */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <Upload size={14} className="text-emerald-600" />
                <span>Exportar Turma da EBD para o Classroom</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Crie automaticamente uma nova sala virtual no Google Classroom com base em uma turma da igreja.
              </p>
              <div className="flex gap-2">
                <select
                  value={selectedTurmaToExport}
                  onChange={e => setSelectedTurmaToExport(e.target.value)}
                  className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <option value="">Selecione uma turma...</option>
                  {turmas.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.sala || 'Sala Geral'})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleExportTurmaToClassroom}
                  disabled={exportingClass || !selectedTurmaToExport}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Upload size={13} />
                  <span>{exportingClass ? 'Exportando...' : 'Exportar'}</span>
                </button>
              </div>
            </div>

            {/* Courses List */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-emerald-600" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                    Turmas no Google Classroom ({courses.length})
                  </h3>
                </div>
                {loading && <RefreshCw size={14} className="animate-spin text-emerald-600" />}
              </div>

              {courses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhuma turma encontrada na sua conta do Google Classroom.
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.map(course => {
                    const isSelected = selectedCourse?.id === course.id;
                    const isImported = turmas.some(t => t.google_classroom_id === course.id || t.nome === course.name);
                    return (
                      <div
                        key={course.id}
                        onClick={() => handleSelectCourse(course)}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                            : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                              {course.section || 'Turma Virtual'}
                            </span>
                            <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mt-1">
                              {course.name}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Sala: {course.room || 'Ambiente Virtual'}
                            </p>
                          </div>
                          {isImported && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                              <Check size={11} /> Importada
                            </span>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500">
                            Código: <strong className="font-mono">{course.enrollmentCode || 'N/A'}</strong>
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleImportCourseAsTurma(course);
                            }}
                            className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <Download size={12} />
                            <span>Importar para EBD</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Course Activities & Student Grades */}
          <div className="lg:col-span-7 space-y-6">
            {!selectedCourse ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[350px] space-y-3">
                <BookOpen size={40} className="text-slate-300 dark:text-slate-700" />
                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  Selecione uma Turma para Visualizar Alunos e Atividades
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Clique em qualquer turma ao lado para gerenciar lições, tarefas enviadas, notas e frequência dos alunos.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Course Header */}
                <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-600">Turma Selecionada</span>
                      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                        {selectedCourse.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {courseStudents.length} Alunos Matriculados • {courseWorks.length} Lições/Atividades
                      </p>
                    </div>
                    <button
                      onClick={() => handleImportCourseAsTurma(selectedCourse)}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 border border-emerald-200"
                    >
                      <Download size={13} />
                      <span>Sincronizar com EBD</span>
                    </button>
                  </div>

                  {/* CourseWork / Activities */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Atividades & Lições ({courseWorks.length})
                    </h4>
                    {courseWorks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        Nenhuma atividade cadastrada nesta turma ainda.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {courseWorks.map(work => {
                          const isWorkSelected = selectedWork?.id === work.id;
                          return (
                            <div
                              key={work.id}
                              onClick={() => handleSelectWork(work)}
                              className={`p-3.5 rounded-xl border cursor-pointer transition ${
                                isWorkSelected
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                                  : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                                  {work.title}
                                </h5>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/60 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded shrink-0">
                                  {work.maxPoints ? `${work.maxPoints} pts` : 'Sem nota'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                                {work.description || 'Sem descrição cadastrada.'}
                              </p>
                              <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px]">
                                <span className="text-slate-500">Ver Entregas &rarr;</span>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleImportWorkAsLesson(work);
                                  }}
                                  className="font-bold text-emerald-700 hover:underline"
                                >
                                  + Importar Lição
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submissions and Grading Panel */}
                {selectedWork && (
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-indigo-600">
                          Gestão de Notas e Participações
                        </span>
                        <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                          {selectedWork.title}
                        </h4>
                      </div>
                      {loadingSubmissions && (
                        <RefreshCw size={15} className="animate-spin text-emerald-600" />
                      )}
                    </div>

                    {submissions.length === 0 && !loadingSubmissions ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Nenhuma entrega registrada para esta atividade.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {submissions.map(sub => (
                          <div
                            key={sub.id}
                            className="py-3 flex items-center justify-between gap-4 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">
                                {(sub.studentName || 'A').charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {sub.studentName}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  Status: <span className="font-semibold">{sub.state}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {editingGrade?.submissionId === sub.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max={selectedWork.maxPoints || 100}
                                    value={editingGrade.grade}
                                    onChange={e =>
                                      setEditingGrade({
                                        submissionId: sub.id,
                                        grade: Number(e.target.value)
                                      })
                                    }
                                    className="w-16 p-1 text-center bg-slate-50 border rounded font-bold"
                                  />
                                  <button
                                    onClick={() => handleSaveStudentGrade(sub, editingGrade.grade)}
                                    disabled={savingGrade}
                                    className="p-1 px-2 bg-emerald-600 text-white rounded text-[10px] font-bold"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditingGrade(null)}
                                    className="p-1 px-1.5 text-slate-400"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                    {sub.assignedGrade !== undefined ? `${sub.assignedGrade} pts` : 'Pendente'}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setEditingGrade({
                                        submissionId: sub.id,
                                        grade: sub.assignedGrade || 10
                                      })
                                    }
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-600 hover:text-emerald-600"
                                    title="Editar Nota"
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
