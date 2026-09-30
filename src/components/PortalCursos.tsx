import React, { useState, useEffect, useContext } from "react";
import { 
  GraduationCap, Award, BookOpen, CheckCircle, Clock, ArrowRight, 
  Printer, Download, Sparkles, Star, ChevronRight, ChevronLeft, 
  Check, X, RotateCcw, AlertCircle, FileCheck,
  Layers, Activity, List, CheckSquare, Info
} from "lucide-react";
import { ChurchContext } from "../context/ChurchContext";
import { Button, formatDateLocal } from "../utils/sharedHelpers";
import { COURSES as IMPORTED_COURSES, CURSOS_DISPONIVEIS as IMPORTED_CURSOS_DISPONIVEIS } from "./ModuleCoursesData";

const PortalCursos = ({ user }) => {
    const { db, setPrintMode, setPrintData, setPreviewOpen, setDoc, doc, dbFirestore, appId, addToast } = useContext(ChurchContext); // Adicionado para impressão e salvamento
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [quizMode, setQuizMode] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [completedModules, setCompletedModules] = useState([]); // NOVO: Rastreio de progresso

    useEffect(() => {
        const currentUserProfile = db.membros.find(m => m.id === user.id) || user;
        if (currentUserProfile && currentUserProfile.modulos_concluidos) {
            setCompletedModules(currentUserProfile.modulos_concluidos);
        }
    }, [db.membros, user]);

    // Banco de Dados Local dos Cursos de Capacitação
    const COURSES = IMPORTED_COURSES;

    const resetModule = () => {
        setQuizMode(false);
        setQuizAnswers({});
        setQuizResult(null);
    };

    // NOVO: Função para abrir o módulo e embaralhar o quiz automaticamente
    const handleSelectModule = (mod) => {
        // 1. Criar cópia profunda para não alterar a constante original do curso
        const modCopy = JSON.parse(JSON.stringify(mod));

        // 2. Algoritmo de embaralhamento rápido e eficiente (Fisher-Yates)
        const shuffle = (arr) => {
            let m = arr.length, t, i;
            while (m) {
                i = Math.floor(Math.random() * m--);
                t = arr[m];
                arr[m] = arr[i];
                arr[i] = t;
            }
            return arr;
        };

        // 3. Embaralhar a ordem das perguntas do módulo
        modCopy.questions = shuffle(modCopy.questions);

        // 4. Embaralhar a ordem das opções de resposta dentro de cada pergunta
        modCopy.questions.forEach(q => {
            const correctAnswerText = q.options[q.answer]; // Guardar o texto da resposta correta original
            q.options = shuffle([...q.options]); // Embaralhar as opções
            q.answer = q.options.indexOf(correctAnswerText); // Atualizar o sistema com o novo índice da resposta correta
        });

        setSelectedModule(modCopy);
    };

    const handleAnswer = (questionIdx, optionIdx) => {
        setQuizAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
    };

    const submitQuiz = async () => {
        let score = 0;
        selectedModule.questions.forEach((q, idx) => {
            if (quizAnswers[idx] === q.answer) score++;
        });
        const percentage = Math.round((score / selectedModule.questions.length) * 100);
        setQuizResult({ score, total: selectedModule.questions.length, percentage });

        // NOVO: Adiciona o módulo aos concluídos se o membro atingir 70% ou mais
        if (percentage >= 70) {
            const newCompletedModules = [...completedModules, selectedModule.id];
            if (!completedModules.includes(selectedModule.id)) {
                setCompletedModules(newCompletedModules);
                try {
                    await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', user.id), { modulos_concluidos: newCompletedModules }, { merge: true });
                } catch(e) {
                    console.error("Erro ao salvar progresso do módulo", e);
                }
            }

            // Verifica se o curso foi totalmente concluído
            const allModulesIds = selectedCourse.modules.map(m => m.id);
            const isCourseFullyCompleted = allModulesIds.every(id => newCompletedModules.includes(id));

            if (isCourseFullyCompleted) {
                try {
                    const currentUserProfile = db.membros.find(m => m.id === user.id) || user;
                    const currentCursos = currentUserProfile.cursos_concluidos || [];
                    const currentMonthStr = new Date().toISOString().slice(0, 7);
                    
                    const alreadySaved = currentCursos.find(c => c.id === selectedCourse.id && c.mes === currentMonthStr);
                    
                    if (!alreadySaved) {
                        const updatedCursos = [...currentCursos, { id: selectedCourse.id, title: selectedCourse.title, mes: currentMonthStr }];
                        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', user.id), { cursos_concluidos: updatedCursos }, { merge: true });
                        addToast(`Conquista Desbloqueada: Troféu de ${selectedCourse.title} adicionado!`, "success");
                    }
                } catch (err) {
                    console.error("Erro ao salvar curso", err);
                }
            }
        }
    };

    return (
        <div className="space-y-6 animate-entrance">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <GraduationCap size={28} className="text-indigo-500"/> Academia de Crescimento
                </h2>
                {(selectedCourse || selectedModule) && (
                    <button 
                        onClick={() => {
                            if (quizResult || quizMode) { resetModule(); setSelectedModule(null); }
                            else if (selectedModule) { setSelectedModule(null); }
                            else { setSelectedCourse(null); }
                        }}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition-colors"
                    >
                        <ChevronLeft size={16}/> Voltar
                    </button>
                )}
            </div>

            {/* VISTA 1: LISTA DE CURSOS */}
            {!selectedCourse && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {COURSES.map(course => (
                        <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md hover:border-indigo-300 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <course.icon size={28}/>
                                </div>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">{course.badge}</span>
                            </div>
                            <h3 className="font-black text-xl text-slate-800 mb-2">{course.title}</h3>
                            <p className="text-sm text-slate-500 mb-6 flex-1 leading-relaxed">{course.description}</p>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Layers size={14}/> {course.modules.length} Módulos</span>
                                <Button onClick={() => setSelectedCourse(course)} variant="primary" className="py-2 px-4 text-xs shadow-md shadow-indigo-500/20">Acessar Curso</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* VISTA 2: LISTA DE MÓDULOS DO CURSO */}
            {selectedCourse && !selectedModule && (() => {
                const completedCount = selectedCourse.modules.filter(m => completedModules.includes(m.id)).length;
                const progressPerc = Math.round((completedCount / selectedCourse.modules.length) * 100);

                return (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-2">{selectedCourse.title}</h2>
                            <p className="text-indigo-100 font-medium max-w-2xl">{selectedCourse.description}</p>
                            
                            {/* NOVO: BARRA DE PROGRESSO DO CURSO */}
                            <div className="mt-6">
                                <div className="flex justify-between text-xs font-bold text-indigo-100 mb-1.5">
                                    <span className="uppercase tracking-widest flex items-center gap-1"><Activity size={14}/> Progresso do Curso</span>
                                    <span>{progressPerc}% ({completedCount}/{selectedCourse.modules.length})</span>
                                </div>
                                <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                                    <div className="h-full bg-emerald-400 transition-all duration-1000 relative overflow-hidden" style={{width: `${progressPerc}%`}}>
                                        <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ animation: 'slideRight 2s infinite linear' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NOVO: BANNER DE EMISSÃO DE CERTIFICADO */}
                    {progressPerc === 100 && (
                        <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex flex-col md:flex-row items-center gap-6 justify-between animate-entrance">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white shrink-0 ring-4 ring-emerald-100">
                                    <Award size={28}/>
                                </div>
                                <div>
                                    <h4 className="font-black text-xl text-emerald-800 tracking-tight">Curso Concluído com Sucesso!</h4>
                                    <p className="text-sm text-emerald-600 font-medium mt-0.5">Parabéns! Você finalizou todos os módulos e foi aprovado(a).</p>
                                </div>
                            </div>
                            <Button onClick={() => {
                                setPrintData({ igreja: db.igreja, membro: user, extra: { nome_curso: selectedCourse.title, curso: selectedCourse.title } });
                                setPrintMode('cert_curso');
                                setPreviewOpen(true);
                            }} variant="success" className="shadow-emerald-500/30 w-full md:w-auto px-6 py-4">
                                <Printer size={20}/> Emitir Certificado Oficial
                            </Button>
                        </div>
                    )}

                    <div className="p-6">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><List size={18} className="text-indigo-500"/> Conteúdo do Curso</h4>
                        <div className="space-y-4">
                            {selectedCourse.modules.map((mod, idx) => {
                                const isCompleted = completedModules.includes(mod.id);
                                return (
                                <button 
                                    key={mod.id} 
                                    onClick={() => handleSelectModule(mod)} 
                                    className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${isCompleted ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-colors shrink-0 ${isCompleted ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                            {isCompleted ? <Check size={20} strokeWidth={3}/> : idx + 1}
                                        </div>
                                        <div>
                                            <h5 className={`font-bold text-lg transition-colors ${isCompleted ? 'text-emerald-800' : 'text-slate-800 group-hover:text-indigo-700'}`}>{mod.title}</h5>
                                            <p className={`text-xs flex items-center gap-2 mt-1 ${isCompleted ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                                                <BookOpen size={12}/> Material • <CheckSquare size={12}/> {mod.questions.length} Questões {isCompleted && '• Aprovado'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className={isCompleted ? 'text-emerald-400' : 'text-slate-300 group-hover:text-indigo-500 transition-colors'}/>
                                </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                );
            })()}

            {/* VISTA 3 e 4: ESTUDO E QUIZ */}
            {selectedModule && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
                        <h3 className="font-black text-xl text-slate-800">{selectedModule.title}</h3>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${quizMode ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {quizMode ? 'Questionário (Quiz)' : 'Material de Estudo'}
                        </span>
                    </div>

                    {!quizMode ? (
                        /* VISTA 3: TEXTO DE ESTUDO */
                        <div className="p-6 md:p-10">
                            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap mb-10 prose-headings:text-indigo-900 prose-headings:font-black prose-strong:text-indigo-700">
                                {selectedModule.content}
                            </div>
                            <div className="flex justify-end pt-6 border-t border-slate-100">
                                <Button onClick={() => setQuizMode(true)} variant="primary" className="py-4 px-8 text-lg shadow-lg shadow-indigo-500/30 w-full sm:w-auto flex items-center justify-center gap-2">
                                    <CheckSquare size={20}/> Fazer o Teste de Conhecimento
                                </Button>
                            </div>
                        </div>
                    ) : !quizResult ? (
                        /* VISTA 4: MODO QUIZ (PERGUNTAS) */
                        <div className="p-6 md:p-10 space-y-8 bg-slate-50/30">
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 mb-6">
                                <Info size={20} className="text-amber-500 mt-0.5 shrink-0"/>
                                <p className="text-sm text-amber-800 font-medium leading-relaxed">Responda às questões abaixo com base no estudo que acabou de ler. É necessário acertar para fixar o aprendizado.</p>
                            </div>
                            
                            {selectedModule.questions.map((q, qIdx) => (
                                <div key={qIdx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 text-base mb-4">
                                        <span className="text-indigo-500 mr-2">{qIdx + 1}.</span> {q.q}
                                    </h4>
                                    <div className="space-y-3">
                                        {q.options.map((opt, oIdx) => {
                                            const isSelected = quizAnswers[qIdx] === oIdx;
                                            return (
                                                <label 
                                                    key={oIdx} 
                                                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                                                >
                                                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                    </div>
                                                    <input 
                                                        type="radio" 
                                                        name={`q_${qIdx}`} 
                                                        className="hidden" 
                                                        checked={isSelected} 
                                                        onChange={() => handleAnswer(qIdx, oIdx)}
                                                    />
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>{opt}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-6">
                                <Button 
                                    onClick={submitQuiz} 
                                    disabled={Object.keys(quizAnswers).length !== selectedModule.questions.length} 
                                    variant="success" 
                                    className="w-full py-4 text-lg shadow-lg shadow-emerald-500/30"
                                >
                                    Enviar Respostas e Ver Resultado
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* VISTA 5: RESULTADO DO QUIZ */
                        <div className="p-10 flex flex-col items-center justify-center text-center">
                            {quizResult.percentage >= 70 ? (
                                <>
                                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-emerald-50">
                                        <Award size={48} className="text-emerald-500"/>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 mb-2">Parabéns!</h3>
                                    <p className="text-lg text-slate-600 font-medium mb-6">Você concluiu o módulo com excelência.</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-amber-50">
                                        <Activity size={48} className="text-amber-500"/>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 mb-2">Quase lá!</h3>
                                    <p className="text-lg text-slate-600 font-medium mb-6">Recomendamos ler o material novamente para fixar melhor a doutrina.</p>
                                </>
                            )}
                            
                            <div className="flex gap-8 mb-10">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Acertos</p>
                                    <p className="text-4xl font-black text-indigo-600">{quizResult.score} <span className="text-xl text-slate-300">/ {quizResult.total}</span></p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Aproveitamento</p>
                                    <p className={`text-4xl font-black ${quizResult.percentage >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{quizResult.percentage}%</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {quizResult.percentage < 100 && (
                                    <Button onClick={() => { setQuizMode(false); setQuizAnswers({}); setQuizResult(null); }} variant="ghost" className="border border-slate-200">
                                        <RotateCcw size={18}/> Refazer Módulo
                                    </Button>
                                )}
                                <Button onClick={() => { resetModule(); setSelectedModule(null); }} variant="primary" className="shadow-md">
                                    <List size={18}/> Voltar aos Módulos
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PortalCursos;
export { PortalCursos };
