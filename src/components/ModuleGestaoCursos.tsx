import React, { useState, useEffect, useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  GraduationCap, Users, Clock, Flame, BookOpenText, Shield, 
  ScrollText, BookOpen, Sparkles, ArrowUpCircle, MessageSquare, 
  Award, Send, Search, Filter, ShieldAlert, BadgeInfo, CheckCircle, 
  AlertCircle, Phone, Mail, Calendar, HelpCircle, FileText, Download, Printer, X, Edit
} from 'lucide-react';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';

// Accessing main App's contexts and styling helpers
import { 
  ChurchContext, Button, FormInput, FormSelect, 
  playMenuSound, playNotificationSound, formatDateLocal, safeText 
} from '../App';

import { COURSES_METADATA } from './ModuleCoursesData';

export default function ModuleGestaoCursos() {
  const { db, user, dbFirestore, appId, addToast } = useContext(ChurchContext);
  
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState('todos'); // todos, ativos, pausados, concluidos
  
  // Modals management
  const [incentiveModal, setIncentiveModal] = useState<any>(null); // student data
  const [certificateModal, setCertificateModal] = useState<any>(null); // certificate data
  
  // Form for incentive emails
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Load students based on members who registered course progress or completed courses
  const students = useMemo(() => {
    const list = db.membros || [];
    return list.map((m: any) => {
      const modulos_concluidos = m.modulos_concluidos || [];
      const cursos_concluidos = m.cursos_concluidos || [];
      
      // Calculate progress of each course for this student
      const coursesProgress = COURSES_METADATA.map(c => {
        let completed = 0;
        for (let i = 1; i <= c.modulesCount; i++) {
          if (modulos_concluidos.includes(`${c.pfx}${i}`)) {
            completed++;
          }
        }
        const percentage = Math.round((completed / c.modulesCount) * 100);
        const isCompleted = cursos_concluidos.some((cc: any) => cc.id === c.id) || percentage === 100;
        
        return {
          id: c.id,
          title: c.title,
          icon: c.icon,
          percentage,
          completedCount: completed,
          totalCount: c.modulesCount,
          isCompleted
        };
      });

      // Filter to courses that are active/started or completed
      const activeCoursesProgress = coursesProgress.filter(c => c.percentage > 0 || c.isCompleted);
      
      // Calculate inactivity days if they have any progress
      let daysInactive = 0;
      let formattedLastActivity = 'Sem dados';
      if (m.data_ultima_atividade_curso) {
        const lastActDate = new Date(m.data_ultima_atividade_curso);
        const diffTime = Math.abs(Date.now() - lastActDate.getTime());
        daysInactive = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        formattedLastActivity = formatDateLocal(m.data_ultima_atividade_curso);
      } else if (activeCoursesProgress.length > 0) {
        // Fallback for students with progress but no precise timestamp
        daysInactive = 15; // Set an default inactive flag
        formattedLastActivity = 'Sem registro';
      }

      return {
        ...m,
        coursesProgress,
        activeCoursesProgress,
        daysInactive,
        formattedLastActivity,
        hasStarted: activeCoursesProgress.length > 0
      };
    }).filter((m: any) => m.hasStarted);
  }, [db.membros]);

  // General counts
  const stats = useMemo(() => {
    let totalActives = 0;
    let totalPaused = 0;
    let totalCompleted = 0;

    students.forEach((s: any) => {
      const hasAnyIncomplete = s.activeCoursesProgress.some((c: any) => !c.isCompleted);
      const allCompleted = s.activeCoursesProgress.length > 0 && s.activeCoursesProgress.every((c: any) => c.isCompleted);
      
      if (allCompleted) {
        totalCompleted++;
      } else if (s.daysInactive <= 7) {
        totalActives++;
      } else {
        totalPaused++;
      }
    });

    return {
      totalStudents: students.length,
      ativos: totalActives,
      pausados: totalPaused,
      concluidos: totalCompleted
    };
  }, [students]);

  // Filtering students
  const filteredStudents = useMemo(() => {
    return students.filter((s: any) => {
      // Search term filter
      const matchesSearch = safeText(s.nome).toLowerCase().includes(search.toLowerCase()) || 
                            safeText(s.cargo).toLowerCase().includes(search.toLowerCase());
      
      // Course filter
      const matchesCourse = selectedCourse === 'todos' || 
                            s.activeCoursesProgress.some((c: any) => c.id === selectedCourse);
      
      // Status filter
      let matchesStatus = true;
      const allCompleted = s.activeCoursesProgress.length > 0 && s.activeCoursesProgress.every((c: any) => c.isCompleted);
      
      if (selectedStatus === 'ativos') {
        matchesStatus = s.daysInactive <= 7 && !allCompleted;
      } else if (selectedStatus === 'pausados') {
        matchesStatus = s.daysInactive > 7 && !allCompleted;
      } else if (selectedStatus === 'concluidos') {
        matchesStatus = allCompleted;
      }

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [students, search, selectedCourse, selectedStatus]);

  // Motivational preset options for incentivizing users
  const templates = [
    {
      label: "🚀 Incentivo Semanal (Dica Prática)",
      subject: "Dica de Estudos: Continue Avançando nos Seus Cursos! 📚📖",
      body: (nome: string, cursoName: string) => `Olá, ${nome}! \n\nQue a graça e a paz de nosso Senhor Jesus Cristo estejam com você!\n\nPassando aqui para incentivar você em sua jornada de crescimento teológico na nossa Academia com o curso "${cursoName}". \n\nO conhecimento da Palavra de Deus santifica a alma e nos prepara para toda boa obra. Separar apenas 10 minutos por dia pode fazer uma grande diferença em sua compreensão espiritual. 😊✨\n\nNão deixe os afazeres do dia a dia esfriarem sua paixão pelo aprendizado. Volte a estudar hoje de onde parou e avance para o próximo módulo! \n\nEstamos torcendo por você e em oração pelos seus estudos! 🙏🔥\n\nFraternalmente,\nCoordenação de Ensino Eclesiástico`
    },
    {
      label: "📚 Foco no Manual Bíblico MacArthur",
      subject: "Estudo Profundo: Conhecendo a Bíblia Livro por Livro! 🛡️📖",
      body: (nome: string) => `Olá, irmão(ã) ${nome}! \n\nO Manual Bíblico do Pr. John MacArthur é um verdadeiro tesouro exegético que nos ajuda a compreender a fundo cada detalhe, contexto histórico, autoria e os grandes temas redentivos de cada livro da Bíblia, da Editora Thomas Nelson Brasil. \n\nPercebemos que você iniciou essa caminhada. Queremos encorajar você a persistir! Estudar o Pentateuco, os Livros Históricos e as belas profecias messiânicas é um privilégio enriquecedor. \n\nFaça um plano simples semanal e avance módulo por módulo! A Palavra de Deus molda nosso caráter e nossa liderança. 🚀\n\nCaso tenha dúvidas acadêmicas, conte com a Mary e seus mentores.\n\nUm forte abraço no amor de Cristo!`
    },
    {
      label: "🔥 Alerta de Pausa nos Estudos (Não Desista!)",
      subject: "Importante: Não pare no meio do caminho! Deus tem o melhor para você! 🙌🌻",
      body: (nome: string, cursoName: string) => `Querido(a) aluno(a) ${nome},\n\nNotamos que já se passaram alguns dias desde a sua última atividade no curso "${cursoName}". Sabemos que o cotidiano pode ser corrido, cheio de pressões e compromissos, mas o tempo dedicado a Deus e ao entendimento de Sua teologia é um investimento eterno. ⏱️💎\n\nEm Lucas 9:62, Jesus nos ensina sobre a perseverança no arado. Queremos que você conclua o que iniciou de forma brilhante e receba o selo e o certificado merecido sob aplauso da igreja.\n\nQue tal acessar agora mesmo a aba "Portal de Cursos" da sua área de membro e fazer ao menos uma lição ou quiz hoje? Vamos juntos nessa jornada! 🌟💪\n\n"Antes, crescei na graça e no conhecimento de nosso Senhor e Salvador Jesus Cristo." - 2 Pedro 3:18\n\nCom carinho,\nSeu Pastor e Equipe Pedagógica`
    },
    {
      label: "🎈 Reta Final (Quase Concluído!)",
      subject: "Quase Lá! Falta muito pouco para sua Formatura e Certificado! 🎓🏆🌟",
      body: (nome: string, cursoName: string) => `Parabéns, ${nome}! \n\nVocê está muito perto de concluir com 100% de aproveitamento o curso "${cursoName}"! 👏👏\n\nA sua constância e determinação são inspiradoras. Falta pouquíssimo para terminarmos todos os módulos e emitirmos o seu Diploma de Conclusão oficial com o selo dourado da igreja.\n\nEscrevo para parabenizar o seu progresso incrível e motivar você a fazer o último esforço nestas últimas lições. Faça o quiz final e comemore conosco essa grande conquista espiritual e cultural. 🏆🎉\n\n"Combati o bom combate, acabei a carreira, guardei a fé..." - 2 Timóteo 4:7\n\nDeus abençoe ricamente!`
    }
  ];

  const handleSelectTemplate = (tpl: any, student: any) => {
    // Determine which course is active to insert in the email template
    const activeCourse = student.activeCoursesProgress[0]?.title || "Curso de Capacitação";
    setMessageSubject(tpl.subject);
    setMessageBody(tpl.body(student.nome, activeCourse));
  };

  const handleSendIncentive = async () => {
    if (!messageSubject.trim() || !messageBody.trim() || !incentiveModal) {
      addToast("Por favor, preencha o assunto e o corpo da mensagem.", "warning");
      return;
    }

    setIsSendingMessage(true);
    playMenuSound();

    try {
      // Standard email structure compatible with SharedEmailModule in App.tsx
      const emailDoc = {
        senderId: user.id,
        senderName: user.nome,
        senderType: 'usuario',
        recipientId: incentiveModal.id,
        recipientName: incentiveModal.nome,
        recipientType: 'membro',
        subject: messageSubject,
        body: messageBody,
        timestamp: new Date().toISOString(),
        readByRecipient: false,
        deletedBySender: false,
        deletedByRecipient: false,
        attachments: []
      };

      await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'emails'), emailDoc);
      addToast(`Mensagem de incentivo enviada com sucesso para ${incentiveModal.nome}! 📨✨`, "success");
      setIncentiveModal(null);
      setMessageSubject('');
      setMessageBody('');
    } catch (err) {
      console.error("Erro ao enviar mensagem de incentivo: ", err);
      addToast("Erro ao enviar mensagem de incentivo.", "error");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendCertificateEmail = async (student: any, course: any) => {
    try {
      const emailDoc = {
        senderId: user.id,
        senderName: user.nome,
        senderType: 'usuario',
        recipientId: student.id,
        recipientName: student.nome,
        recipientType: 'membro',
        subject: `🏆 Seu Certificado de Conclusão de Curso: ${course.title}!`,
        body: `Parabéns, querido(a) irmão(ã) ${student.nome}!\n\nÉ com enorme alegria que enviamos o seu Certificado de Conclusão do curso "${course.title}".\n\nVocê concluiu com sucesso todos os 10 módulos com dedicação máxima. Seu esforço é motivo de honra e celebração para todos nós!\n\nVocê pode visualizar e imprimir o seu diploma em alta resolução diretamente na sua Área de Membro, acessando o Portal de Cursos.\n\nContinue estudando e crescendo na graça e conhecimento!\n\nFraternalmente,\nPastor e Conselho de Ensino`,
        timestamp: new Date().toISOString(),
        readByRecipient: false,
        deletedBySender: false,
        deletedByRecipient: false,
        attachments: []
      };

      await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'emails'), emailDoc);
      addToast(`Mensagem de parabéns e Certificado enviado para o Webmail de ${student.nome}! 📑🎉`, "success");
    } catch (err) {
      console.error(err);
      addToast("Erro ao processar envio do certificado.", "error");
    }
  };

  const handlePrintCertificate = () => {
    playMenuSound();
    window.print();
  };

  return (
    <div className="space-y-6 animate-entrance pb-12 print:p-0 print:border-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <GraduationCap className="text-indigo-600" size={28} /> EAD Cursos de Capacitação
          </h2>
          <p className="text-slate-500 text-sm mt-1">Estatísticas, controle de progresso e incentivos com emoticons para estudantes de e-learning.</p>
        </div>
      </div>

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total de Alunos</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Flame size={22} className="animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Ativos (Últ. 7 dias)</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5 text-emerald-600">{stats.ativos}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Inativos (Pausados)</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5 text-rose-600">{stats.pausados}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <Award size={22} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Completados</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5 text-amber-600">{stats.concluidos}</h3>
          </div>
        </div>
      </div>

      {/* Filters and List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden print:hidden">
        
        {/* Filters Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <FormInput
              label=""
              type="text"
              placeholder="Buscar aluno ou cargo..."
              value={search}
              onChange={(v) => setSearch(v)}
              className="pl-10 pb-0"
              preserveCase={true}
            />
          </div>

          <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
            <div className="w-1/2 md:w-44">
              <FormSelect
                label=""
                value={selectedCourse}
                onChange={(v) => setSelectedCourse(v)}
                options={[
                  { value: 'todos', label: 'Todos os Cursos' },
                  ...COURSES_METADATA.map(c => ({ value: c.id, label: c.title }))
                ]}
              />
            </div>
            <div className="w-[45%] md:w-36">
              <FormSelect
                label=""
                value={selectedStatus}
                onChange={(v) => setSelectedStatus(v)}
                options={[
                  { value: 'todos', label: 'Todos os Estados' },
                  { value: 'ativos', label: 'Ativos' },
                  { value: 'pausados', label: 'Pausados' },
                  { value: 'concluidos', label: 'Concluídos' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
            <BadgeInfo size={40} className="text-slate-300 mb-2" />
            <p className="font-bold">Nenhum aluno encontrado.</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1">Nenhum membro iniciou ou concluiu os cursos que correspondem aos filtros especificados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="p-4 px-6">Aluno</th>
                  <th className="p-4">Cursos em Andamento</th>
                  <th className="p-4">Última Atividade</th>
                  <th className="p-4">Inatividade</th>
                  <th className="p-4 text-right px-6">Ações pedagógicas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student: any) => {
                  const isFullyCompleted = student.activeCoursesProgress.length > 0 && student.activeCoursesProgress.every((c: any) => c.isCompleted);
                  const isInactive = student.daysInactive > 7;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-xs whitespace-nowrap">
                            {safeText(student.nome).charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">{student.nome}</p>
                            <p className="text-[10px] leading-3 uppercase font-black text-slate-400 tracking-wider mt-0.5">{student.cargo || 'Membro'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {student.whatsapp && (
                                <a 
                                  href={`https://wa.me/55${student.whatsapp.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-emerald-600 hover:underline flex items-center gap-0.5"
                                >
                                  <Phone size={10} /> WhatsApp
                                </a>
                              )}
                              {student.email && (
                                <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                                  <Mail size={10} /> {student.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 py-5 max-w-[280px]">
                        <div className="space-y-3">
                          {student.activeCoursesProgress.map((course: any) => {
                            const isFinished = course.isCompleted;
                            return (
                              <div key={course.id} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="font-bold text-slate-700 truncate max-w-[190px]" title={course.title}>
                                    {course.title}
                                  </span>
                                  <span className={`font-black tracking-wide ${isFinished ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                    {course.percentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${isFinished ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${course.percentage}%` }}
                                  />
                                </div>
                                <p className="text-[10px] text-slate-400">
                                  Módulos concluídos: {course.completedCount} de {course.totalCount}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-xs font-bold">{student.formattedLastActivity}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {isFullyCompleted ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center w-fit gap-1">
                            <CheckCircle size={10} /> Concluiu Tudo
                          </span>
                        ) : isInactive ? (
                          <div className="space-y-0.5">
                            <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center w-fit gap-1">
                              <AlertCircle size={10} /> Pausado
                            </span>
                            <p className="text-[10px] text-slate-400 font-bold pl-1">{student.daysInactive} dias sem progresso</p>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center w-fit gap-1 animate-pulse">
                              <Flame size={10} /> Ativo
                            </span>
                            <p className="text-[10px] text-slate-400 pl-1 font-bold">Ativo há {student.daysInactive === 0 ? 'poucas horas' : `${student.daysInactive} dias`}</p>
                          </div>
                        )}
                      </td>
                      <td className="p-4 px-6 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="secondary" 
                            className="py-1.5 px-3.5 text-xs font-bold gap-1.5 border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:bg-indigo-50/20 hover:text-indigo-600 cursor-pointer"
                            onClick={() => {
                              playMenuSound();
                              setIncentiveModal(student);
                              // Auto setup template first
                              setMessageSubject('');
                              setMessageBody('');
                            }}
                          >
                            <MessageSquare size={13} /> Incentivar
                          </Button>

                          {student.activeCoursesProgress.map((course: any) => {
                            if (course.isCompleted) {
                              return (
                                <Button 
                                  key={course.id}
                                  variant="primary" 
                                  className="py-1.5 px-3.5 text-xs font-bold gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-md shadow-amber-500/10 cursor-pointer text-white"
                                  onClick={() => {
                                    playNotificationSound();
                                    setCertificateModal({ student, course });
                                  }}
                                >
                                  <Award size={13} /> Certificado
                                </Button>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: MANDAR MENSAGENS E EMOTICONS DE INCENTIVAR ALUNO */}
      {incentiveModal && createPortal(
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg animate-entrance print:hidden">
          <div className="glass-modern rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/40 border-0">
            
            {/* Modal Header inside gradient wrapper */}
            <div className="p-6 sm:p-8 flex justify-between items-start relative overflow-hidden shrink-0 shadow-lg border-b border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 bg-[length:200%_200%] animate-pulse-glow"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.15] mix-blend-overlay pointer-events-none"></div>
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(0,0,0,0)_50%,rgba(255,255,255,0.15)_100%)] animate-spin mix-blend-overlay pointer-events-none" style={{ animationDuration: '10s' }}></div>
              <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
              <div className="relative z-10 flex items-center gap-4 sm:gap-6 w-full">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-xl rounded-[1.2rem] shadow-[0_0_25px_rgba(255,255,255,0.15)] border-y border-white/40 border-x border-white/10 flex items-center justify-center text-white transform -rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-110 shrink-0 group relative">
                  <div className="absolute inset-0 rounded-[1.2rem] bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <MessageSquare size={36} className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] relative z-10 sm:w-10 sm:h-10 text-white"/>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] font-black text-white/80 uppercase tracking-[0.4em] mb-1.5 drop-shadow-md">
                    Incentivar Estudante • <span className="text-white/60">E-learning EAD</span>
                  </p>
                  <h3 className="font-extrabold text-2xl sm:text-3xl tracking-tight leading-none drop-shadow-2xl font-['Outfit'] text-white">
                    Mensagem para {incentiveModal.nome}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setIncentiveModal(null)} 
                className="bg-black/30 hover:bg-rose-500 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl text-white/70 hover:text-white transition-all duration-300 shadow-lg border border-white/10 relative z-10 group shrink-0 ml-3 hover:scale-110 cursor-pointer"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300"/>
              </button>
            </div>

            {/* Modal Scroll Content wrapped with custom bg */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/40 backdrop-blur-md custom-scrollbar">
              
              {/* Profile Card Summary - Standardised with member form cards */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <GraduationCap size={16} className="text-indigo-500" /> Resumo de Cursos & Progresso
                </h4>
                <div className="space-y-2.5 mt-2">
                  {incentiveModal.activeCoursesProgress.map((cp: any) => (
                    <div key={cp.id} className="flex justify-between items-center text-xs bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                      <span className="font-bold text-slate-700">{cp.title}</span>
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-100/40 px-2.5 py-1 rounded-lg font-black">{cp.percentage}% ({cp.completedCount}/{cp.totalCount})</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider pl-1 font-mono">Inativo há {incentiveModal.daysInactive} dias (Última atividade: {incentiveModal.formattedLastActivity})</p>
                </div>
              </div>

              {/* Templates Selector - Standardised */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MessageSquare size={16} className="text-indigo-500" /> Escolha um Modelo Pastoral de Incentivo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {templates.map((tpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectTemplate(tpl, incentiveModal)}
                      className="p-3 text-left bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer group shadow-xs animate-fade-in"
                    >
                      <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-600 flex items-center gap-1.5">
                        {tpl.label}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-1">Assunto: {tpl.subject}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields - Styled exactly like member forms */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Edit size={16} className="text-indigo-500" /> Detalhes Práticos do E-mail
                </h4>
                
                <FormInput
                  label="Assunto do E-mail"
                  type="text"
                  required
                  placeholder="E.g., Continue Avançando nos Seus Estudos! 📚⚡"
                  value={messageSubject}
                  onChange={(v) => setMessageSubject(v)}
                  preserveCase={true}
                  className="!mb-4"
                />

                <div>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider transition-colors group-focus-within:text-indigo-600">Mensagem (Com emoticons pastorais 😊✨🙏🚀)</label>
                    <div className="flex flex-wrap gap-1">
                      {['😊', '✨', '🙏', '📚', '🚀', '🔥', '🏆', '👏', '🌟', '💪', '📖'].map(emo => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => setMessageBody(p => p + emo)}
                          className="px-2 py-0.5 border border-slate-200 rounded-lg bg-white hover:bg-indigo-50 hover:border-indigo-300 text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={8}
                    required
                    placeholder="Escreva a mensagem personalizada com consolo e incentivos..."
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-2xl p-4 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none font-medium text-slate-700 shadow-sm"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/30 bg-white/60 backdrop-blur-md flex justify-end gap-3 rounded-b-[2.5rem] relative shrink-0">
              <Button onClick={() => setIncentiveModal(null)} variant="ghost" className="border border-white/60 bg-white/40 hover:bg-white cursor-pointer">Cancelar</Button>
              <Button 
                onClick={handleSendIncentive} 
                variant="primary" 
                className="gap-2 bg-indigo-600 shadow-md shadow-indigo-500/25 cursor-pointer"
                disabled={isSendingMessage}
              >
                {isSendingMessage ? (
                  <span>Enviando...</span>
                ) : (
                  <>
                    <Send size={14} /> Enviar Mensagem
                  </>
                )}
              </Button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: CERTIFICADO DE CONCLUSÃO OFICIAL EM ALTA RESOLUÇÃO */}
      {certificateModal && createPortal(
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg animate-entrance select-none overflow-y-auto no-print">
          <div className="glass-modern rounded-[2.5rem] border-0 shadow-2xl max-w-4xl w-full flex flex-col max-h-[95vh] ring-1 ring-white/40 overflow-hidden relative print:p-0 print:m-0 print:bg-white print:shadow-none print:max-h-none print:ring-0 print:rounded-none">
            
            {/* Modal Title Actions inside gradient header */}
            <div className="p-6 sm:p-8 flex justify-between items-start relative overflow-hidden shrink-0 shadow-lg border-b border-white/20 print:hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-600 bg-[length:200%_200%] animate-pulse-glow"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.15] mix-blend-overlay pointer-events-none"></div>
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(0,0,0,0)_50%,rgba(255,255,255,0.15)_100%)] animate-spin mix-blend-overlay pointer-events-none" style={{ animationDuration: '10s' }}></div>
              <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
              <div className="relative z-10 flex items-center gap-4 sm:gap-6 w-full">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-xl rounded-[1.2rem] shadow-[0_0_25px_rgba(255,255,255,0.15)] border-y border-white/40 border-x border-white/10 flex items-center justify-center text-white transform -rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-110 shrink-0 group relative">
                  <div className="absolute inset-0 rounded-[1.2rem] bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Award size={36} className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] relative z-10 sm:w-10 sm:h-10 text-white"/>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] font-black text-white/80 uppercase tracking-[0.4em] mb-1.5 drop-shadow-md">
                    Homologar Formatura • <span className="text-white/60">Emissão de Certificados</span>
                  </p>
                  <h3 className="font-extrabold text-2xl sm:text-3xl tracking-tight leading-none drop-shadow-2xl font-['Outfit'] text-white">
                    Certificado de Conclusão EAD
                  </h3>
                </div>
              </div>
              
              <button 
                onClick={() => setCertificateModal(null)} 
                className="bg-black/30 hover:bg-rose-500 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl text-white/70 hover:text-white transition-all duration-300 shadow-lg border border-white/10 relative z-10 group shrink-0 ml-3 hover:scale-110 cursor-pointer"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300"/>
              </button>
            </div>
 
            {/* Scrollable workspace for certificate template page */}
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/10 backdrop-blur-xs print:p-0 print:bg-white print:overflow-visible text-center bg-slate-900/20">
              
              {/* Print Area - Diploma Layout */}
              <div className="bg-white p-12 py-16 border-12 border-double border-amber-600 rounded-2xl flex flex-col items-center justify-between shadow-2xl relative select-none w-full max-w-[800px] mx-auto min-h-[560px] text-slate-900 border-spacing-4 print:shadow-none print:border-amber-600 text-left">
                
                {/* Border Background Overlays */}
                <div className="absolute inset-4 border border-amber-600/20 rounded pointer-events-none" />
                
                {/* Header */}
                <div className="text-center flex flex-col items-center gap-2 w-full">
                  <div className="w-16 h-16 bg-amber-50 rounded-full border border-amber-500/35 flex items-center justify-center text-amber-600 mb-2">
                    <GraduationCap size={36} />
                  </div>
                  <h4 className="font-serif tracking-widest text-xs font-black uppercase text-amber-700">ASSEMBLEIA DE DEUS - SISTEMA GIPP</h4>
                  <div className="w-16 h-0.5 bg-amber-500/55 my-1" />
                </div>

                {/* Title Corp */}
                <div className="text-center my-6 space-y-3 w-full">
                  <h1 className="font-serif text-3xl font-black text-amber-800 uppercase tracking-wide">Certificado de Conclusão</h1>
                  <p className="text-sm font-serif italic text-slate-500 text-center px-4">
                    Certificamos para os devidos fins que o(a) estudante e colaborador(a) eclesiástico(a)
                  </p>
                  <div className="py-2">
                    <h2 className="text-2xl font-black text-slate-800 border-b-2 border-dashed border-slate-300 w-fit mx-auto px-6 italic font-serif">
                      {certificateModal.student.nome}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Membro Ativo da Congregação / Corpo Docente</p>
                  </div>
                </div>

                {/* Dedication Text */}
                <div className="text-center max-w-lg space-y-4 mx-auto">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Concluiu com êxito acadêmico extraordinário todas as exigências curriculares, questionários e lições do curso de capacitação de nível avançado
                  </p>
                  <h3 className="text-base font-black text-amber-700 uppercase tracking-widest">
                    {certificateModal.course.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Carga Horária de 40 Horas de Estudo Teológico Integrado. Certificação homologada através de dotação de mérito e gremiação na data de {new Date().toLocaleDateString('pt-BR')}.
                  </p>
                </div>

                {/* Signatures */}
                <div className="flex justify-around items-end w-full mt-10 text-center gap-6">
                  <div className="flex flex-col items-center w-1/3">
                    <div className="w-32 h-[1px] bg-slate-300 mb-1" />
                    <p className="text-[10px] font-black text-slate-800">Direção Acadêmica</p>
                    <p className="text-[8px] text-slate-400 uppercase">Coord. Geral EBD</p>
                  </div>
                  
                  <div className="flex items-center justify-center pb-2">
                    <div className="w-12 h-12 border-2 border-double border-amber-600 rounded-full flex items-center justify-center text-amber-600 text-[10px] font-black tracking-widest uppercase scale-110">
                      SELO
                    </div>
                  </div>

                  <div className="flex flex-col items-center w-1/3">
                    <div className="w-32 h-[1px] bg-slate-300 mb-1" />
                    <p className="text-[10px] font-black text-slate-800">Pastor Presidente</p>
                    <p className="text-[8px] text-slate-400 uppercase">Conselho Eclesiástico</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-3 text-[8px] text-slate-400 tracking-wider">
                  ID do Registro: SYS-{certificateModal.student.id.substring(0,6).toUpperCase()}-{certificateModal.course.id.substring(0,4).toUpperCase()}
                </div>

              </div>

              {/* Disclaimer when viewing on screen */}
              <p className="text-slate-400 text-[10px] text-center mt-4 print:hidden">
                Dica: A impressão do certificado em folhas do tipo couchê ou vergê destaca o padrão estético dourado de formatura.
              </p>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-white/30 bg-white/60 backdrop-blur-md flex justify-end gap-3 rounded-b-[2.5rem] print:hidden relative shrink-0">
              <Button onClick={() => setCertificateModal(null)} variant="ghost" className="border border-white/60 bg-white/40 hover:bg-white cursor-pointer w-32">Fechar</Button>
              <Button 
                onClick={handlePrintCertificate}
                variant="secondary"
                className="gap-1.5 bg-white border border-slate-200 cursor-pointer text-slate-700 hover:bg-slate-50 w-36"
              >
                <Printer size={16} /> Imprimir A4
              </Button>
              <Button 
                onClick={async () => {
                  playMenuSound();
                  await handleSendCertificateEmail(certificateModal.student, certificateModal.course);
                }}
                variant="success"
                className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/25 cursor-pointer text-white w-48"
              >
                <Send size={16} /> Enviar p/ Webmail
              </Button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
