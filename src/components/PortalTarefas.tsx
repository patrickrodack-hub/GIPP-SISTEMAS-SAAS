import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { InteractiveWindow } from "./InteractiveWindow";
import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { 
  CheckSquare, Clock, Calendar, CheckCircle2, AlertCircle, Ban, 
  TrendingUp, Sparkles, RefreshCw, X, Award, Activity, Printer, 
  Download, Bell, User, Filter, Search, ArrowRight, CheckCheck, 
  CalendarCheck, SlidersHorizontal, Check, AlertTriangle, HelpCircle, CheckCircle, Minimize, Maximize,
  History
} from "lucide-react";
import { collection, doc, onSnapshot, getDocs, query, setDoc } from "firebase/firestore";
import { ChurchContext } from "../context/ChurchContext";
import { Button, formatDateLocal, getTodayDate, playNotificationSound } from "../utils/sharedHelpers";
import { showSafeNotification } from "../utils/safeNotification";

const PortalTarefas = ({ user, db }) => {
    const { setDoc, doc, dbFirestore, appId, addToast, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext);
    
    const [activeAlarms, setActiveAlarms] = useState<any[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('gipp_local_alarms') || '[]');
        } catch (e) {
            return [];
        }
    });
    
    const [reminderMenuOpen, setReminderMenuOpen] = useState<string | null>(null);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedTaskForHistory, setSelectedTaskForHistory] = useState<any>(null);
    const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
    const [recentlyConfirmedTaskId, setRecentlyConfirmedTaskId] = useState<string | null>(null);

    // States for Configurar Lembrete modal
    const [reminderModalOpen, setReminderModalOpen] = useState(false);
    const [selectedTaskForReminder, setSelectedTaskForReminder] = useState<any>(null);
    const [customReminderTime, setCustomReminderTime] = useState("");
    const [selectedReminderOption, setSelectedReminderOption] = useState("1hour");

    const isToday = (dateStr?: string) => {
        if (!dateStr) return false;
        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
        return dateStr === todayStr;
    };

    // Estado e sincronização em tempo real com o Firestore
    const [firestoreTarefas, setFirestoreTarefas] = useState<any[]>(() => {
        return Array.isArray(db?.tarefas) ? db.tarefas : [];
    });
    const [isSyncingFirestore, setIsSyncingFirestore] = useState<boolean>(false);
    const [firestoreActive, setFirestoreActive] = useState<boolean>(false);
    const [lastSyncTime, setLastSyncTime] = useState<string>('');
    const [filtroEstatistica, setFiltroEstatistica] = useState<'todas' | 'mes_todas' | 'concluidas' | 'confirmadas' | 'recusadas'>('todas');

    // Listener em tempo real do Firestore para a coleção de tarefas e escalas
    useEffect(() => {
        if (!dbFirestore || !appId) {
            if (Array.isArray(db?.tarefas)) {
                setFirestoreTarefas(db.tarefas);
            }
            return;
        }

        setIsSyncingFirestore(true);
        const tarefasColRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'tarefas');

        const unsubscribe = onSnapshot(tarefasColRef, (snapshot) => {
            const list: any[] = [];
            snapshot.forEach((d) => {
                list.push({ id: d.id, ...d.data() });
            });
            setFirestoreTarefas(list);
            setFirestoreActive(true);
            setIsSyncingFirestore(false);
            setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, (error) => {
            console.error("Erro ao sincronizar tarefas do Firestore:", error);
            setIsSyncingFirestore(false);
            if (Array.isArray(db?.tarefas)) {
                setFirestoreTarefas(db.tarefas);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [dbFirestore, appId, db?.tarefas]);

    const handleRefreshFirestore = async () => {
        if (!dbFirestore || !appId) {
            addToast("Firestore não conectado. Usando dados locais.", "info");
            return;
        }
        try {
            setIsSyncingFirestore(true);
            const tarefasColRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'tarefas');
            const snap = await getDocs(tarefasColRef);
            const list: any[] = [];
            snap.forEach((d) => {
                list.push({ id: d.id, ...d.data() });
            });
            setFirestoreTarefas(list);
            setFirestoreActive(true);
            setIsSyncingFirestore(false);
            setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            addToast("Estatísticas de escalas atualizadas do Firestore!", "success");
        } catch (e) {
            console.error("Erro ao recarregar Firestore:", e);
            setIsSyncingFirestore(false);
            addToast("Erro ao sincronizar com o Firestore.", "error");
        }
    };

    // Identificação do membro nas tarefas
    const isMemberInTask = useCallback((t: any) => {
        if (!t || !Array.isArray(t.equipe)) return false;
        const uId = user?.id;
        const uMembroId = user?.membro_id;
        const uName = (user?.nome || user?.name || '').toLowerCase().trim();
        return t.equipe.some((m: any) => {
            if (!m) return false;
            if (uId && (m.id === uId || m.membro_id === uId)) return true;
            if (uMembroId && (m.id === uMembroId || m.membro_id === uMembroId)) return true;
            if (m.nome && uName && m.nome.toLowerCase().trim() === uName) return true;
            return false;
        });
    }, [user]);

    const getMemberInfo = useCallback((t: any) => {
        if (!t || !Array.isArray(t.equipe)) return null;
        const uId = user?.id;
        const uMembroId = user?.membro_id;
        const uName = (user?.nome || user?.name || '').toLowerCase().trim();
        return t.equipe.find((m: any) => {
            if (!m) return false;
            if (uId && (m.id === uId || m.membro_id === uId)) return true;
            if (uMembroId && (m.id === uMembroId || m.membro_id === uMembroId)) return true;
            if (m.nome && uName && m.nome.toLowerCase().trim() === uName) return true;
            return false;
        });
    }, [user]);

    // Data atual e Mês Vigente
    const currentDateObj = useMemo(() => new Date(), []);
    const currentYear = currentDateObj.getFullYear();
    const currentMonth = currentDateObj.getMonth();
    const nomeMesAtual = useMemo(() => {
        const m = currentDateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        return m.charAt(0).toUpperCase() + m.slice(1);
    }, [currentDateObj]);

    const isTaskInCurrentMonth = useCallback((t: any) => {
        if (!t) return false;
        let d: Date | null = null;
        if (t.data) {
            const parts = String(t.data).split('T')[0].split('-');
            if (parts.length === 3) {
                d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            } else {
                d = new Date(t.data);
            }
        } else if (t.created_at || t.createdAt) {
            d = new Date(t.created_at || t.createdAt);
        }
        if (d && !isNaN(d.getTime())) {
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        }
        return false;
    }, [currentYear, currentMonth]);

    // Fonte de dados consolidada (Firestore prioritário, com fallback no db local)
    const baseTarefasList = useMemo(() => {
        if (firestoreTarefas && firestoreTarefas.length > 0) return firestoreTarefas;
        if (Array.isArray(db?.tarefas)) return db.tarefas;
        return [];
    }, [firestoreTarefas, db?.tarefas]);

    // Todas as tarefas do membro
    const memberTasksAll = useMemo(() => {
        return baseTarefasList
            .filter(t => isMemberInTask(t))
            .sort((a, b) => new Date(a.data || '9999-12-31').getTime() - new Date(b.data || '9999-12-31').getTime());
    }, [baseTarefasList, isMemberInTask]);

    // Tarefas do membro no mês atual
    const memberTasksMonth = useMemo(() => {
        return memberTasksAll.filter(t => isTaskInCurrentMonth(t));
    }, [memberTasksAll, isTaskInCurrentMonth]);

    // 1. Escalas Concluídas no mês atual
    const statsConcluidas = useMemo(() => {
        return memberTasksMonth.filter(t => {
            const mInfo = getMemberInfo(t);
            const isTaskDone = t.status === 'Concluido' || t.status === 'Concluída' || t.status === 'Finalizado' || 
                               t.concluido === true || t.concluida === true || 
                               (typeof t.progresso === 'number' && t.progresso >= 100) ||
                               (typeof t.percentual === 'number' && t.percentual >= 100);
            const isMemberDone = mInfo?.status_presenca === 'concluido' || mInfo?.status === 'concluido' || mInfo?.concluido === true;
            return isTaskDone || isMemberDone;
        });
    }, [memberTasksMonth, getMemberInfo]);

    // 2. Escalas Confirmadas no mês atual
    const statsConfirmadas = useMemo(() => {
        return memberTasksMonth.filter(t => {
            const mInfo = getMemberInfo(t);
            return mInfo?.status_presenca === 'confirmado' || mInfo?.status === 'confirmado' || mInfo?.confirmado === true;
        });
    }, [memberTasksMonth, getMemberInfo]);

    // 3. Escalas Recusadas no mês atual
    const statsRecusadas = useMemo(() => {
        return memberTasksMonth.filter(t => {
            const mInfo = getMemberInfo(t);
            return mInfo?.status_presenca === 'recusado' || mInfo?.status === 'recusado' || 
                   mInfo?.status_presenca === 'indisponivel' || mInfo?.status === 'indisponivel' || 
                   mInfo?.recusado === true;
        });
    }, [memberTasksMonth, getMemberInfo]);

    // 4. Escalas Pendentes de resposta no mês atual
    const statsPendentes = useMemo(() => {
        return memberTasksMonth.filter(t => {
            const mInfo = getMemberInfo(t);
            const isConf = mInfo?.status_presenca === 'confirmado' || mInfo?.status === 'confirmado' || mInfo?.confirmado === true;
            const isRec = mInfo?.status_presenca === 'recusado' || mInfo?.status === 'recusado' || 
                          mInfo?.status_presenca === 'indisponivel' || mInfo?.status === 'indisponivel' || 
                          mInfo?.recusado === true;
            return !isConf && !isRec;
        });
    }, [memberTasksMonth, getMemberInfo]);

    const totalMes = memberTasksMonth.length;
    const taxaAproveitamento = totalMes > 0 ? Math.round((statsConfirmadas.length / totalMes) * 100) : 0;

    // Tarefas filtradas para exibição na tabela
    const minhasTarefas = useMemo(() => {
        if (filtroEstatistica === 'concluidas') return statsConcluidas;
        if (filtroEstatistica === 'confirmadas') return statsConfirmadas;
        if (filtroEstatistica === 'recusadas') return statsRecusadas;
        if (filtroEstatistica === 'mes_todas') return memberTasksMonth;
        return memberTasksAll;
    }, [filtroEstatistica, statsConcluidas, statsConfirmadas, statsRecusadas, memberTasksMonth, memberTasksAll]);

    const handleRSVP = async (taskId, status) => {
        const task = baseTarefasList.find(t => t.id === taskId);
        if (!task) return;
        
        const uId = user.id;
        const uMembroId = user.membro_id;
        const uName = (user.nome || user.name || '').toLowerCase().trim();

        const novaEquipe = (task.equipe || []).map((m: any) => {
            const match = (uId && (m.id === uId || m.membro_id === uId)) ||
                          (uMembroId && (m.id === uMembroId || m.membro_id === uMembroId)) ||
                          (m.nome && uName && m.nome.toLowerCase().trim() === uName);
            return match ? { ...m, status_presenca: status } : m;
        });
        
        try {
            if (dbFirestore && appId) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'tarefas', taskId), { equipe: novaEquipe }, { merge: true });
            }
            // Atualização imediata no estado local
            setFirestoreTarefas(prev => prev.map(t => t.id === taskId ? { ...t, equipe: novaEquipe } : t));

            if (status === 'confirmado') {
                setRecentlyConfirmedTaskId(taskId);
                setTimeout(() => {
                    setRecentlyConfirmedTaskId((curr) => (curr === taskId ? null : curr));
                }, 1200);
            }
            addToast(status === 'confirmado' ? "Presença confirmada na escala (Firestore sincronizado)!" : "Ausência informada na escala (Firestore sincronizado).", "success");
        } catch (e) {
            console.error("Erro ao atualizar no Firestore:", e);
            addToast("Erro ao atualizar confirmação no Firestore.", "error");
        }
    };

    const handleCreateICSFile = (task: any) => {
        try {
            const title = `Escala GIPP: ${task.categoria} - ${task.descricao}`;
            const dateStr = task.data ? task.data.replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '');
            const startTime = `${dateStr}T090000`; // Default to 9:00 AM
            const endTime = `${dateStr}T100000`; // Default to 10:00 AM
            
            const desc = `Compromisso na igreja. Tema/Escala: ${task.descricao}. Categoria: ${task.categoria}. Status de Aceite: Confirmado.`;
            
            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//GIPP//ChurchManagement//PT',
                'BEGIN:VEVENT',
                `UID:gipp_task_${task.id}@gipp.app`,
                'SEQUENCE:0',
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                `DTSTART:${startTime}`,
                `DTEND:${endTime}`,
                `SUMMARY:${title}`,
                `DESCRIPTION:${desc}`,
                'STATUS:CONFIRMED',
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\n');

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `escala_${task.id || 'compromisso'}.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            addToast("Dispositivo: Convite de Calendário (.ics) descarregado! Abra para salvar no telemóvel.", "success");
        } catch (err) {
            addToast("Erro ao gerar arquivo de convite.", "error");
        }
    };

    const handleExportAllICS = () => {
        try {
            if (minhasTarefas.length === 0) {
                addToast("Você não possui compromissos para exportar.", "warning");
                return;
            }
            const icsLines = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//GIPP//ChurchManagement//PT',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH'
            ];
            
            minhasTarefas.forEach((task, idx) => {
                const title = `Escala GIPP: ${task.categoria} - ${task.descricao}`;
                const dateStr = task.data ? task.data.replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '');
                
                let startHour = "090000";
                let endHour = "110000";
                if (task.hora && task.hora.includes(':')) {
                    const hp = task.hora.split(':');
                    const hh = hp[0].padStart(2, '0');
                    const mm = hp[1].padStart(2, '0');
                    startHour = `${hh}${mm}00`;
                    const endH = String((parseInt(hh) + 2) % 24).padStart(2, '0');
                    endHour = `${endH}${mm}00`;
                }
                
                const startTime = `${dateStr}T${startHour}`;
                const endTime = `${dateStr}T${endHour}`;
                const desc = `Compromisso na igreja. Tema/Escala: ${task.descricao}. Categoria: ${task.categoria}.`;
                
                icsLines.push('BEGIN:VEVENT');
                icsLines.push(`UID:gipp_task_${task.id || idx}@gipp.app`);
                icsLines.push('SEQUENCE:0');
                icsLines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
                icsLines.push(`DTSTART:${startTime}`);
                icsLines.push(`DTEND:${endTime}`);
                icsLines.push(`SUMMARY:${title}`);
                icsLines.push(`DESCRIPTION:${desc}`);
                icsLines.push('STATUS:CONFIRMED');
                icsLines.push('END:VEVENT');
            });
            
            icsLines.push('END:VCALENDAR');
            const icsContent = icsLines.join('\n');
            
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `minhas_escalas_gipp.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            addToast("Todas as escalas foram exportadas em formato .ics com sucesso!", "success");
        } catch (err) {
            addToast("Erro ao exportar escalas para .ics.", "error");
        }
    };

    const handleAddAlarm = async (task: any, option: string, customTimeStr?: string) => {
        try {
            if ('Notification' in window && Notification.permission !== 'granted') {
                await Notification.requestPermission();
            }
            
            let targetTime: number;
            let optionLabel = 'Lembrete';
            
            if (option === 'custom' && customTimeStr) {
                targetTime = new Date(customTimeStr).getTime();
                optionLabel = `Horário Específico: ${new Date(customTimeStr).toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}`;
            } else {
                const parts = task.data ? task.data.split('-') : [];
                let taskDate: Date;
                if (parts.length === 3) {
                    let hour = 8;
                    let min = 0;
                    if (task.hora && task.hora.includes(':')) {
                        const hParts = task.hora.split(':');
                        hour = parseInt(hParts[0]) || 8;
                        min = parseInt(hParts[1]) || 0;
                    }
                    taskDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), hour, min, 0);
                } else {
                    taskDate = new Date();
                }
                
                let offset = 0;
                if (option === '1day') {
                    offset = 24 * 60 * 60 * 1000;
                    optionLabel = '1 dia antes';
                    targetTime = taskDate.getTime() - offset;
                } else if (option === '1hour') {
                    offset = 60 * 60 * 1000;
                    optionLabel = '1 hora antes';
                    targetTime = taskDate.getTime() - offset;
                } else {
                    optionLabel = 'No dia da tarefa (08h)';
                    targetTime = taskDate.getTime();
                }
            }
            
            const alarmId = `${task.id}_${option}_${Date.now()}`;
            const newAlarm = {
                id: alarmId,
                taskId: task.id,
                title: `${task.categoria || 'Escala'} : GIPP`,
                body: `${task.descricao || 'Atividade na escala'} agendada para ${formatDateLocal(task.data)}!`,
                targetTime: targetTime,
                triggered: false,
                optionLabel: optionLabel
            };
            
            const updated = activeAlarms.filter(a => a.taskId !== task.id || !a.id.includes(option));
            updated.push(newAlarm);
            
            localStorage.setItem('gipp_local_alarms', JSON.stringify(updated));
            setActiveAlarms(updated);
            addToast(`Lembrete local programado: ${optionLabel}!`, "success");
        } catch (err) {
            console.error(err);
            addToast("Erro ao programar alarme.", "error");
        }
    };

    const handleEnableDesktopNotifications = async (task: any) => {
        if (!('Notification' in window)) {
            addToast("Seu navegador não suporta notificações desktop.", "error");
            return;
        }
        
        try {
            let permission = Notification.permission;
            if (permission !== 'granted') {
                permission = await Notification.requestPermission();
            }
            
            if (permission === 'granted') {
                showSafeNotification(`GIPP: Notificações Desktop Ativas`, {
                    body: `Você receberá avisos sobre a tarefa de hoje: "${task.descricao}"`,
                    icon: db.igreja?.logo || undefined
                }).catch(() => {});
                
                await handleAddAlarm(task, 'today_desktop');
                addToast("Notificações Desktop autorizadas e ativas para esta tarefa!", "success");
            } else {
                addToast("Permissão de notificações recusada pelo navegador.", "warning");
            }
        } catch (err) {
            console.error(err);
            addToast("Erro ao solicitar notificações desktop.", "error");
        }
    };

    const handleEditAlarmOption = (alarmId: string, newOption: string) => {
        const alarm = activeAlarms.find(a => a.id === alarmId);
        if (!alarm) return;
        const task = db.tarefas?.find(t => t.id === alarm.taskId);
        if (!task) return;
        
        const parts = task.data ? task.data.split('-') : [];
        let taskDate: Date;
        if (parts.length === 3) {
            taskDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 8, 0, 0);
        } else {
            taskDate = new Date();
        }
        
        let offset = 0;
        let optionLabel = 'No Dia do Compromisso';
        
        if (newOption === '1day') {
            offset = 24 * 60 * 60 * 1000;
            optionLabel = '1 dia antes';
        } else if (newOption === '1hour') {
            offset = 60 * 60 * 1000;
            optionLabel = '1 hora antes';
        } else {
            optionLabel = 'No dia (08h)';
        }
        
        const targetTime = taskDate.getTime() - offset;
        const newAlarmId = `${task.id}_${newOption}_${Date.now()}`;
        
        const updated = activeAlarms.filter(a => a.id !== alarmId);
        const newAlarm = {
            ...alarm,
            id: newAlarmId,
            targetTime: targetTime,
            optionLabel: optionLabel
        };
        updated.push(newAlarm);
        localStorage.setItem('gipp_local_alarms', JSON.stringify(updated));
        setActiveAlarms(updated);
        addToast(`Lembrete local editado: ${optionLabel}!`, "success");
    };

    const getGoogleCalendarUrl = (task: any) => {
        const title = encodeURIComponent(`Escala GIPP: ${task.categoria} - ${task.descricao}`);
        const dateForm = task.data ? task.data.replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '');
        const dates = `${dateForm}T090000/${dateForm}T110000`; // 09:00 to 11:00 UTC/floating format
        const details = encodeURIComponent(`Compromisso na igreja. Tema/Escala: ${task.descricao}. Categoria: ${task.categoria}.`);
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&sf=true&output=xml`;
    };

    return (
        <div className="space-y-6 animate-entrance">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100"><CheckSquare size={28}/></div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Minhas Escalas e Tarefas</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Compromissos agendados e Confirmações</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {minhasTarefas.length > 0 && (
                        <button 
                            onClick={() => {
                                setPrintData({ membro: user, tarefas: db.tarefas || [], igreja: db.igreja });
                                setPrintMode('membro_escala_print');
                                setPreviewOpen(true);
                            }}
                            className="shadow-md flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 px-4.5 font-bold text-xs transition-all border border-indigo-500 cursor-pointer"
                        >
                            <Printer size={16}/> Imprimir Compromissos
                        </button>
                    )}
                    {minhasTarefas.length > 0 && (
                        <button 
                            onClick={handleExportAllICS}
                            className="shadow-md flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 px-4.5 font-bold text-xs transition-all border border-emerald-500 cursor-pointer"
                        >
                            <Calendar size={16}/> Exportar Escalas (.ics)
                        </button>
                    )}
                    {/* Botão de Sincronização global / todos */}
                    {minhasTarefas.length > 0 && (
                        <a 
                            href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Compromissos GIPP: Meus Serviços na Igreja')}&dates=${new Date().toISOString().split('T')[0].replace(/-/g, '')}T090000/${new Date().toISOString().split('T')[0].replace(/-/g, '')}T110000&details=${encodeURIComponent('Consultar escalas semanais do membro GIPP atuante na Obra.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shadow-md flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#1a73e8] border border-slate-200 rounded-xl py-2.5 px-4.5 font-bold text-xs transition-all cursor-pointer"
                        >
                            <svg className="w-4 h-4 fill-current text-[#1a73e8]" viewBox="0 0 24 24">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v13zM7 10h5v5H7z"/>
                            </svg>
                            Sincronizar com Google Agenda
                        </a>
                    )}
                </div>
            </div>

            {/* PAINEL DE ESTATÍSTICAS NO MÓDULO DE TAREFAS (DADOS DO FIRESTORE) */}
            <div className="bg-gradient-to-br from-white/95 via-slate-50/90 to-white/95 dark:from-slate-900/90 dark:via-slate-800/80 dark:to-slate-900/90 rounded-3xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
                {/* Cabeçalho do Painel */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-violet-600 text-white rounded-2xl shadow-sm shadow-indigo-500/20">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                    Painel de Estatísticas de Escalas
                                </h3>
                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs">
                                    {nomeMesAtual}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Estatísticas mensais de confirmações, presenças e conclusão sincronizadas via Firestore
                            </p>
                        </div>
                    </div>

                    {/* Status de Sincronização Firestore & Ações */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                            <span className={`w-2 h-2 rounded-full ${firestoreActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                            <span className="text-[11px] font-bold">
                                {firestoreActive ? 'Firestore Online' : 'Dados Locais'}
                            </span>
                            {lastSyncTime && (
                                <span className="text-[10px] text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-1.5 font-normal">
                                    {lastSyncTime}
                                </span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleRefreshFirestore}
                            disabled={isSyncingFirestore}
                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                            title="Atualizar dados do Firestore"
                        >
                            <RefreshCw size={14} className={isSyncingFirestore ? "animate-spin text-indigo-600" : ""} />
                        </button>

                        {filtroEstatistica !== 'todas' && (
                            <button
                                type="button"
                                onClick={() => setFiltroEstatistica('todas')}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                                <X size={12} />
                                Limpar Filtro
                            </button>
                        )}
                    </div>
                </div>

                {/* Cards de Métricas (Concluídas, Confirmadas, Recusadas, Total/Assiduidade) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Card 1: Escalas Concluídas */}
                    <div 
                        onClick={() => setFiltroEstatistica(filtroEstatistica === 'concluidas' ? 'todas' : 'concluidas')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                            filtroEstatistica === 'concluidas' 
                                ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                                : 'bg-emerald-50/60 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 border-emerald-200/70 dark:border-emerald-800/40'
                        }`}
                        title="Clique para filtrar por escalas concluídas"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                Escalas Concluídas
                            </span>
                            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 group-hover:scale-110 transition-transform">
                                <CheckCircle2 size={18} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-emerald-900 dark:text-emerald-100 tracking-tight">
                                {statsConcluidas.length}
                            </span>
                            <span className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400">
                                no mês atual
                            </span>
                        </div>
                        <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/80 mt-1 font-medium">
                            Atividades ministerialmente finalizadas
                        </p>
                    </div>

                    {/* Card 2: Escalas Confirmadas */}
                    <div 
                        onClick={() => setFiltroEstatistica(filtroEstatistica === 'confirmadas' ? 'todas' : 'confirmadas')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                            filtroEstatistica === 'confirmadas' 
                                ? 'bg-indigo-500/15 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' 
                                : 'bg-indigo-50/60 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30 border-indigo-200/70 dark:border-indigo-800/40'
                        }`}
                        title="Clique para filtrar por escalas confirmadas"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                                Escalas Confirmadas
                            </span>
                            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 group-hover:scale-110 transition-transform">
                                <CheckSquare size={18} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-indigo-900 dark:text-indigo-100 tracking-tight">
                                {statsConfirmadas.length}
                            </span>
                            <span className="text-xs font-bold text-indigo-700/80 dark:text-indigo-400">
                                presenças
                            </span>
                        </div>
                        <p className="text-[11px] text-indigo-600/90 dark:text-indigo-400/80 mt-1 font-medium">
                            Presença garantida para o serviço
                        </p>
                    </div>

                    {/* Card 3: Escalas Recusadas */}
                    <div 
                        onClick={() => setFiltroEstatistica(filtroEstatistica === 'recusadas' ? 'todas' : 'recusadas')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                            filtroEstatistica === 'recusadas' 
                                ? 'bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/20 shadow-md' 
                                : 'bg-rose-50/60 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 border-rose-200/70 dark:border-rose-800/40'
                        }`}
                        title="Clique para filtrar por escalas recusadas"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                                Escalas Recusadas
                            </span>
                            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 group-hover:scale-110 transition-transform">
                                <Ban size={18} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-rose-900 dark:text-rose-100 tracking-tight">
                                {statsRecusadas.length}
                            </span>
                            <span className="text-xs font-bold text-rose-700/80 dark:text-rose-400">
                                ausências
                            </span>
                        </div>
                        <p className="text-[11px] text-rose-600/90 dark:text-rose-400/80 mt-1 font-medium">
                            Indisponibilidade comunicada à liderança
                        </p>
                    </div>

                    {/* Card 4: Total Atribuído & Taxa de Confirmação */}
                    <div 
                        onClick={() => setFiltroEstatistica(filtroEstatistica === 'mes_todas' ? 'todas' : 'mes_todas')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                            filtroEstatistica === 'mes_todas' 
                                ? 'bg-violet-500/15 border-violet-500 ring-2 ring-violet-500/20 shadow-md' 
                                : 'bg-violet-50/60 hover:bg-violet-50 dark:bg-violet-950/20 dark:hover:bg-violet-950/30 border-violet-200/70 dark:border-violet-800/40'
                        }`}
                        title="Clique para ver todas as escalas deste mês"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-violet-700 dark:text-violet-400">
                                Total Atribuído
                            </span>
                            <div className="p-2 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300 group-hover:scale-110 transition-transform">
                                <TrendingUp size={18} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-violet-900 dark:text-violet-100 tracking-tight">
                                {totalMes}
                            </span>
                            <span className="text-xs font-bold text-violet-700/80 dark:text-violet-400">
                                {taxaAproveitamento}% confirmadas
                            </span>
                        </div>
                        <div className="w-full bg-violet-200/50 dark:bg-violet-900/40 h-1.5 rounded-full overflow-hidden mt-2">
                            <div 
                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all duration-500"
                                style={{ width: `${taxaAproveitamento}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Feedback de filtro ativo */}
                {filtroEstatistica !== 'todas' && (
                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-semibold flex items-center gap-1.5">
                            Filtrando tabela por: 
                            <strong className="text-indigo-600 dark:text-indigo-400 uppercase font-black">
                                {filtroEstatistica === 'concluidas' && 'Escalas Concluídas no Mês'}
                                {filtroEstatistica === 'confirmadas' && 'Escalas Confirmadas no Mês'}
                                {filtroEstatistica === 'recusadas' && 'Escalas Recusadas no Mês'}
                                {filtroEstatistica === 'mes_todas' && 'Todas as Escalas do Mês Atual'}
                            </strong>
                            ({minhasTarefas.length} {minhasTarefas.length === 1 ? 'escala' : 'escalas'})
                        </span>
                        <button
                            type="button"
                            onClick={() => setFiltroEstatistica('todas')}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer text-left sm:text-right"
                        >
                            Ver todas as tarefas gerais
                        </button>
                    </div>
                )}
            </div>

            {/* List of active scheduled local alarms */}
            {activeAlarms.length > 0 && (
                <div id="portal_alarme_lista" className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-5 rounded-[2rem] border border-amber-200/60 shadow-xs animate-entrance">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Bell size={16} className="text-amber-500 animate-pulse" /> 
                        Alarmes Locais Programados ({activeAlarms.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeAlarms.map(alarm => {
                            const task = db.tarefas?.find(tf => tf.id === alarm.taskId);
                            const taskName = task ? task.descricao : alarm.title;
                            return (
                                <div key={alarm.id} className="bg-white p-4 rounded-2xl border border-amber-200/50 shadow-xs flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{taskName}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase">
                                                {alarm.optionLabel}
                                            </span>
                                            <span className="text-[9px] text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                                {new Date(alarm.targetTime).toLocaleDateString()} {new Date(alarm.targetTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <select 
                                            value={alarm.id.split('_')[1] || 'on_hour'} 
                                            onChange={(e) => handleEditAlarmOption(alarm.id, e.target.value)}
                                            className="text-[10px] font-black bg-slate-50 border border-slate-200 rounded-lg p-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option value="on_hour">No dia (08h)</option>
                                            <option value="1hour">1h antes</option>
                                            <option value="1day">1 dia antes</option>
                                        </select>
                                        <button 
                                            onClick={() => {
                                                const updated = activeAlarms.filter(a => a.id !== alarm.id);
                                                localStorage.setItem('gipp_local_alarms', JSON.stringify(updated));
                                                setActiveAlarms(updated);
                                                addToast("Alarme cancelado.", "info");
                                            }}
                                            className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg border border-rose-200 text-[10px] cursor-pointer transition-colors"
                                            title="Cancelar alarme"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            <div className="glass-modern rounded-[2rem] shadow-sm border border-white/50 p-6 md:p-8 overflow-hidden">
                {minhasTarefas.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="minhas-tarefas-tabela w-full text-sm border-collapse border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200">
                                    <th className="p-4 text-left">
                                        <div className="inline-flex items-center gap-1.5 group/th relative">
                                            <span>Tarefa / Categoria</span>
                                            <div className="relative inline-flex items-center">
                                                <HelpCircle size={12} className="text-slate-400 group-hover/th:text-indigo-600 transition-colors cursor-help" />
                                                <div className="pointer-events-none opacity-0 group-hover/th:opacity-100 transition-all duration-200 absolute bottom-full left-0 mb-1.5 px-2.5 py-1 bg-slate-900/90 text-white text-[10px] font-normal normal-case rounded-lg shadow-lg whitespace-nowrap z-30">
                                                    Descrição e classificação da tarefa ministerial
                                                    <div className="absolute top-full left-2 border-4 border-transparent border-t-slate-900/90" />
                                                </div>
                                            </div>
                                        </div>
                                    </th>
                                    <th className="p-4 text-left">
                                        <div className="inline-flex items-center gap-1.5 group/th relative">
                                            <span>Data e Prazo</span>
                                            <div className="relative inline-flex items-center">
                                                <HelpCircle size={12} className="text-slate-400 group-hover/th:text-indigo-600 transition-colors cursor-help" />
                                                <div className="pointer-events-none opacity-0 group-hover/th:opacity-100 transition-all duration-200 absolute bottom-full left-0 mb-1.5 px-2.5 py-1 bg-slate-900/90 text-white text-[10px] font-normal normal-case rounded-lg shadow-lg whitespace-nowrap z-30">
                                                    Data agendada e indicador de pontualidade
                                                    <div className="absolute top-full left-2 border-4 border-transparent border-t-slate-900/90" />
                                                </div>
                                            </div>
                                        </div>
                                    </th>
                                    <th className="p-4 text-left">
                                        <div className="inline-flex items-center gap-1.5 group/th relative">
                                            <span>Função Atribuída</span>
                                            <div className="relative inline-flex items-center">
                                                <HelpCircle size={12} className="text-slate-400 group-hover/th:text-indigo-600 transition-colors cursor-help" />
                                                <div className="pointer-events-none opacity-0 group-hover/th:opacity-100 transition-all duration-200 absolute bottom-full left-0 mb-1.5 px-2.5 py-1 bg-slate-900/90 text-white text-[10px] font-normal normal-case rounded-lg shadow-lg whitespace-nowrap z-30">
                                                    Seu papel ou escalação na atividade
                                                    <div className="absolute top-full left-2 border-4 border-transparent border-t-slate-900/90" />
                                                </div>
                                            </div>
                                        </div>
                                    </th>
                                    <th className="p-4 text-center">
                                        <div className="inline-flex items-center justify-center gap-1.5 group/th relative">
                                            <span>Status & Progresso</span>
                                            <div className="relative inline-flex items-center">
                                                <HelpCircle size={12} className="text-slate-400 group-hover/th:text-indigo-600 transition-colors cursor-help" />
                                                <div className="pointer-events-none opacity-0 group-hover/th:opacity-100 transition-all duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-slate-900/90 text-white text-[10px] font-normal normal-case rounded-lg shadow-lg whitespace-nowrap z-30">
                                                    Estado de execução e percentual de conclusão
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/90" />
                                                </div>
                                            </div>
                                        </div>
                                    </th>
                                    <th className="p-4 text-center">
                                        <div className="inline-flex items-center justify-center gap-1.5 group/th relative">
                                            <span>Sua Confirmação (RSVP)</span>
                                            <div className="relative inline-flex items-center">
                                                <HelpCircle size={12} className="text-slate-400 group-hover/th:text-indigo-600 transition-colors cursor-help" />
                                                <div className="pointer-events-none opacity-0 group-hover/th:opacity-100 transition-all duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-slate-900/90 text-white text-[10px] font-normal normal-case rounded-lg shadow-lg whitespace-nowrap z-30">
                                                    Informe sua presença ou ausência para o líder
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/90" />
                                                </div>
                                            </div>
                                        </div>
                                    </th>
                                    <th className="p-4 text-right">
                                        <div className="inline-flex items-center justify-end gap-1.5 group/th relative">
                                            <span>Ações de Lembrete</span>
                                            <div className="relative inline-flex items-center">
                                                <HelpCircle size={12} className="text-slate-400 group-hover/th:text-indigo-600 transition-colors cursor-help" />
                                                <div className="pointer-events-none opacity-0 group-hover/th:opacity-100 transition-all duration-200 absolute bottom-full right-0 mb-1.5 px-2.5 py-1 bg-slate-900/90 text-white text-[10px] font-normal normal-case rounded-lg shadow-lg whitespace-nowrap z-30">
                                                    Configurações de alerta, Google Calendar e foco
                                                    <div className="absolute top-full right-2 border-4 border-transparent border-t-slate-900/90" />
                                                </div>
                                            </div>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {minhasTarefas.map((t, i) => {
                                    const membroInfo = (t.equipe || []).find(m => m.id === user.id || m.nome === user.nome);
                                    const minhaFuncao = membroInfo?.funcao_escala || 'Membro da Equipe';
                                    const rsvpStatus = membroInfo?.status_presenca;
                                    const isDueToday = isToday(t.data);
                                    const taskAlarms = activeAlarms.filter(a => a.taskId === t.id && !a.triggered);
                                    const isFocused = focusedTaskId === t.id;
                                    const isRecentlyConfirmed = recentlyConfirmedTaskId === t.id;

                                    // Cálculo de progresso percentual visual
                                    let progressPercent = 0;
                                    if (t.status === 'Concluido' || t.status === 'Concluída' || t.status === 'Finalizado') {
                                        progressPercent = 100;
                                    } else if (typeof t.progresso === 'number') {
                                        progressPercent = Math.min(100, Math.max(0, t.progresso));
                                    } else if (typeof t.percentual === 'number') {
                                        progressPercent = Math.min(100, Math.max(0, t.percentual));
                                    } else if (Array.isArray(t.checklist) && t.checklist.length > 0) {
                                        const doneCount = t.checklist.filter((item: any) => item.checked || item.concluido).length;
                                        progressPercent = Math.round((doneCount / t.checklist.length) * 100);
                                    } else if (t.status === 'Em Andamento' || t.status === 'Em Progresso') {
                                        progressPercent = 60;
                                    } else {
                                        progressPercent = 25;
                                    }

                                    return (
                                        <React.Fragment key={t.id || i}>
                                            <motion.tr 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
                                                className={`transition-all duration-200 ${isRecentlyConfirmed ? 'animate-row-slide-in-confirmed bg-emerald-50/70 border-l-4 border-emerald-500 shadow-sm' : isFocused ? 'bg-indigo-50/30 border-l-4 border-indigo-500 shadow-md ring-1 ring-indigo-500/10' : 'hover:bg-slate-50/90 hover:shadow-md hover:border-l-4 hover:border-indigo-400'}`}
                                            >
                                                {/* Tarefa / Categoria */}
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span 
                                                            onClick={() => setFocusedTaskId(isFocused ? null : t.id)}
                                                            className="font-bold text-slate-800 text-sm line-clamp-1 cursor-pointer hover:text-indigo-600 hover:underline transition-colors flex items-center gap-1.5"
                                                            title="Clique para ver em Foco"
                                                        >
                                                            {t.descricao}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-slate-100 text-slate-500 tracking-wider border border-slate-200 w-fit">{t.categoria}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Data e Prazo */}
                                                <td className="p-4 text-xs font-semibold text-slate-600">
                                                    {t.data ? (
                                                        <div className="flex flex-col">
                                                            <span className="flex items-center gap-1"><Calendar size={12} className="text-indigo-500"/> {formatDateLocal(t.data)}</span>
                                                            {new Date(t.data).getTime() < Date.now() && t.status !== 'Concluido' && (
                                                                <span className="text-rose-500 text-[9px] font-black uppercase mt-0.5">(Atrasada)</span>
                                                            )}
                                                        </div>
                                                    ) : <span className="text-slate-400 italic">Sem data</span>}
                                                </td>

                                                {/* Função Atribuída */}
                                                <td className="p-4">
                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-tight inline-block">{minhaFuncao}</span>
                                                </td>

                                                {/* Status & Barra de Progresso Visual */}
                                                <td className="p-4 text-center">
                                                    <div className="flex flex-col items-center gap-1.5 min-w-[100px] max-w-[130px] mx-auto">
                                                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${t.status === 'Concluido' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'} `}>
                                                            {t.status}
                                                        </span>
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden p-[1px] border border-slate-200" title={`Progresso: ${progressPercent}%`}>
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : progressPercent >= 50 ? 'bg-gradient-to-r from-indigo-500 to-blue-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`}
                                                                style={{ width: `${progressPercent}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[8px] font-bold text-slate-400 leading-none">{progressPercent}%</span>
                                                    </div>
                                                </td>

                                                {/* Sua Confirmação (RSVP) */}
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button 
                                                            onClick={() => handleRSVP(t.id, 'confirmado')}
                                                            className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${rsvpStatus === 'confirmado' ? 'bg-emerald-50 text-emerald-600 border-emerald-300 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'}`}
                                                            title="Confirmar Presença"
                                                        >
                                                            <CheckCircle size={12} /> Presente
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRSVP(t.id, 'recusado')}
                                                            className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${rsvpStatus === 'recusado' ? 'bg-rose-50 text-rose-600 border-rose-300 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-rose-300 hover:text-rose-600'}`}
                                                            title="Informar Ausência"
                                                        >
                                                            <Ban size={12} /> Ausente
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Ações de Lembrete e Ativações */}
                                                <td className="p-4 text-right">
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                                                            {/* Visualização de Foco button */}
                                                            <button 
                                                                onClick={() => setFocusedTaskId(isFocused ? null : t.id)}
                                                                className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${isFocused ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-sm' : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700'}`}
                                                                title="Entrar em Visualização de Foco (Ver detalhes completas, equipe e histórico)"
                                                            >
                                                                {isFocused ? <Minimize size={11} /> : <Maximize size={11} />}
                                                                {isFocused ? 'Fechar Foco' : 'Ver em Foco'}
                                                            </button>

                                                            {/* Histórico button */}
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedTaskForHistory(t);
                                                                    setHistoryModalOpen(true);
                                                                }}
                                                                className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer animate-all"
                                                                title="Histórico de presença"
                                                            >
                                                                <History size={11} /> Histórico
                                                            </button>

                                                            {/* Configurar Lembrete button */}
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedTaskForReminder(t);
                                                                    setCustomReminderTime(t.data ? `${t.data}T08:00` : "");
                                                                    setSelectedReminderOption("1hour");
                                                                    setReminderModalOpen(true);
                                                                }}
                                                                className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 cursor-pointer"
                                                                title="Configurar Lembrete Personalizado"
                                                            >
                                                                <Bell size={11} className="text-amber-600" /> Configurar Lembrete
                                                            </button>

                                                            {/* Sincronizar Google Agenda button */}
                                                            <a 
                                                                href={getGoogleCalendarUrl(t)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1a73e8] border border-blue-200 text-[10px] font-bold transition-all cursor-pointer"
                                                                title="Sincronizar com Google Agenda"
                                                            >
                                                                <svg className="w-3 h-3 fill-current text-[#1a73e8]" viewBox="0 0 24 24">
                                                                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v13zM7 10h5v5H7z"/>
                                                                </svg>
                                                                Sincronizar
                                                            </a>
                                                        </div>

                                                        {/* Ativar Notificações Desktop (For tasks due today) */}
                                                        {isDueToday && (
                                                            <button 
                                                                onClick={() => handleEnableDesktopNotifications(t)}
                                                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm shadow-indigo-500/20"
                                                                title="Ativar Notificações Desktop do Navegador"
                                                            >
                                                                <Bell size={12} className="animate-pulse" /> Ativar Notificações Desktop
                                                            </button>
                                                        )}

                                                        {/* Registered Alarms Indicator inside Row */}
                                                        {taskAlarms.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1 justify-end">
                                                                {taskAlarms.map(alarm => (
                                                                    <span key={alarm.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black bg-indigo-50 border border-indigo-200 text-indigo-600">
                                                                        <Bell size={8} /> {alarm.optionLabel}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>

                                            {/* Expandable focused detail box */}
                                            {isFocused && (
                                                <tr>
                                                    <td colSpan={6} className="p-0 border-b border-indigo-100 bg-indigo-50/5">
                                                        <motion.div 
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="p-6 overflow-hidden flex flex-col gap-5 text-left"
                                                        >
                                                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                                    <CheckSquare size={16} className="text-indigo-600" />
                                                                    Visualização de Foco: Detalhes do Compromisso
                                                                </h4>
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        onClick={() => handleCreateICSFile(t)}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition-all cursor-pointer"
                                                                        title="Exportar esta escala para .ics"
                                                                    >
                                                                        <Download size={11} /> Exportar .ics
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => setFocusedTaskId(null)}
                                                                        className="text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase border border-slate-200 px-2 py-1 rounded-lg bg-white shadow-2xs hover:bg-slate-50 transition-colors"
                                                                    >
                                                                        Fechar Foco
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs space-y-2">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição / Categoria</p>
                                                                    <p className="text-sm font-bold text-slate-800">{t.descricao}</p>
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider">{t.categoria}</span>
                                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${t.status === 'Concluido' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{t.status}</span>
                                                                    </div>
                                                                    {t.hora && (
                                                                        <div className="pt-2 text-xs text-slate-500 font-medium">
                                                                            Horário de Início: <span className="font-bold text-slate-700 font-mono">{t.hora}</span>
                                                                        </div>
                                                                    )}
                                                                    {t.observacoes && (
                                                                        <div className="pt-2 border-t border-slate-100 mt-2">
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notas / Observações</p>
                                                                            <p className="text-xs text-slate-600 mt-1 italic font-medium">{t.observacoes}</p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Equipe Escalada ({t.equipe?.length || 0})</p>
                                                                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar">
                                                                        {(t.equipe || []).map((m, idx) => (
                                                                            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-black text-[9px] flex items-center justify-center uppercase">{m.nome?.charAt(0)}</div>
                                                                                    <div>
                                                                                        <p className="text-xs font-bold text-slate-700">{m.nome}</p>
                                                                                        <p className="text-[9px] text-slate-400 uppercase font-semibold">{m.funcao_escala || 'Membro'}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${m.status_presenca === 'confirmado' ? 'bg-emerald-50 text-emerald-600' : m.status_presenca === 'recusado' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                                                                                    {m.status_presenca || 'Pendente'}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Histórico Inline */}
                                                            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Histórico de Presenças nesta Atividade</p>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                                    {(() => {
                                                                        const hist = (db.tarefas || []).filter(item => 
                                                                            item.descricao === t.descricao && 
                                                                            (item.equipe || []).some(m => 
                                                                                (m.id === user.id || m.nome === user.nome) && 
                                                                                m.status_presenca === 'confirmado'
                                                                            )
                                                                        ).sort((a, b) => new Date(b.data || '1970-01-01').getTime() - new Date(a.data || '1970-01-01').getTime());
                                                                        
                                                                        if (hist.length === 0) {
                                                                            return <p className="text-xs text-slate-400 italic">Nenhuma confirmação histórica registrada.</p>;
                                                                        }
                                                                        
                                                                        return hist.slice(0, 6).map((item, hIdx) => (
                                                                            <div key={hIdx} className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-100 rounded-lg p-2 font-medium">
                                                                                <Calendar size={12} className="text-emerald-500" />
                                                                                <span className="text-slate-700 font-bold">{formatDateLocal(item.data)}</span>
                                                                                <span className="text-[9px] uppercase font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded ml-auto">Confirmado</span>
                                                                            </div>
                                                                        ));
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-10 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 border border-indigo-100"><CheckSquare size={32} className="text-indigo-400"/></div>
                        <p className="font-bold text-slate-700 text-lg mb-1">
                            {filtroEstatistica !== 'todas' ? 'Nenhuma Escala Neste Filtro' : 'Agenda Livre!'}
                        </p>
                        <p className="text-sm text-slate-500">
                            {filtroEstatistica !== 'todas' 
                                ? 'Nenhuma escala ou tarefa encontrada para a seleção ativa no mês atual.' 
                                : 'Não possui escalas ou tarefas pendentes no momento.'}
                        </p>
                        {filtroEstatistica !== 'todas' && (
                            <button
                                type="button"
                                onClick={() => setFiltroEstatistica('todas')}
                                className="mt-3.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                            >
                                Ver Todas as Escalas
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Histórico de Presença */}
            {historyModalOpen && selectedTaskForHistory && createPortal(
                <InteractiveWindow
                    id="escala_presenca_historico_modal"
                    title={`Histórico: ${selectedTaskForHistory.descricao}`}
                    subtitle="Registro de todas as vezes que confirmou presença nesta tarefa"
                    onClose={() => {
                        setHistoryModalOpen(false);
                        setSelectedTaskForHistory(null);
                    }}
                    headerBg="from-indigo-600 via-indigo-700 to-indigo-800"
                    defaultWidth={550}
                    defaultHeight={500}
                >
                    <div className="p-6">
                        <p className="text-xs text-slate-500 mb-4">
                            Exibindo o registro histórico de escalas e tarefas com a descrição <span className="font-bold text-slate-700 font-mono">"{selectedTaskForHistory.descricao}"</span> que você confirmou presença.
                        </p>
                        <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-xs">
                            <table className="w-full text-left border-collapse border-0">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200">
                                        <th className="p-4">Data</th>
                                        <th className="p-4">Categoria</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(() => {
                                        const presencas = (db.tarefas || []).filter(item => 
                                            item.descricao === selectedTaskForHistory.descricao && 
                                            (item.equipe || []).some(m => 
                                                (m.id === user.id || m.nome === user.nome) && 
                                                m.status_presenca === 'confirmado'
                                            )
                                        ).sort((a, b) => new Date(b.data || '1970-01-01').getTime() - new Date(a.data || '1970-01-01').getTime());

                                        if (presencas.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-xs text-slate-400 italic">
                                                        Nenhuma data anterior confirmada encontrada.
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return presencas.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 text-xs font-semibold text-slate-700">{formatDateLocal(item.data)}</td>
                                                <td className="p-4 text-[10px]"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium border border-slate-200">{item.categoria}</span></td>
                                                <td className="p-4 text-[10px]"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 uppercase">Confirmado</span></td>
                                                <td className="p-4 text-right">
                                                    <a 
                                                        href={getGoogleCalendarUrl(item)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold transition-all cursor-pointer bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded inline-block"
                                                    >
                                                        Google Agenda
                                                    </a>
                                                </td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </InteractiveWindow>,
                document.body
            )}

            {/* Modal de Configurar Lembrete */}
            {reminderModalOpen && selectedTaskForReminder && createPortal(
                <InteractiveWindow
                    id="escala_lembrete_modal"
                    title="Configurar Lembrete"
                    subtitle={`Escolha quando deseja ser lembrado da tarefa: ${selectedTaskForReminder.descricao}`}
                    onClose={() => {
                        setReminderModalOpen(false);
                        setSelectedTaskForReminder(null);
                    }}
                    headerBg="from-amber-500 via-amber-600 to-amber-700"
                    defaultWidth={480}
                    defaultHeight={420}
                >
                    <div className="p-6 space-y-4">
                        <p className="text-xs text-slate-500">
                            Configure um alarme local no seu navegador ou um lembrete personalizado para a tarefa <span className="font-bold text-slate-700">"{selectedTaskForReminder.descricao}"</span>.
                        </p>
                        
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Selecione o Tempo do Lembrete</label>
                            <div className="grid grid-cols-1 gap-2">
                                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedReminderOption === '1hour' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="reminder_option" 
                                        value="1hour" 
                                        checked={selectedReminderOption === '1hour'}
                                        onChange={(e) => setSelectedReminderOption(e.target.value)}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">1 hora antes</p>
                                        <p className="text-[10px] text-slate-500">Receber um aviso 1 hora antes do horário programado.</p>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedReminderOption === '1day' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="reminder_option" 
                                        value="1day" 
                                        checked={selectedReminderOption === '1day'}
                                        onChange={(e) => setSelectedReminderOption(e.target.value)}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">1 dia antes</p>
                                        <p className="text-[10px] text-slate-500">Receber um aviso 1 dia antes da tarefa.</p>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedReminderOption === 'custom' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="reminder_option" 
                                        value="custom" 
                                        checked={selectedReminderOption === 'custom'}
                                        onChange={(e) => setSelectedReminderOption(e.target.value)}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Horário específico da tarefa</p>
                                        <p className="text-[10px] text-slate-500">Definir um dia e hora exatos para soar o alarme.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {selectedReminderOption === 'custom' && (
                            <div className="space-y-1.5 animate-fadeIn">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Definir Data/Hora Personalizada</label>
                                <input 
                                    type="datetime-local" 
                                    value={customReminderTime}
                                    onChange={(e) => setCustomReminderTime(e.target.value)}
                                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        )}

                        <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                            <button 
                                onClick={() => {
                                    setReminderModalOpen(false);
                                    setSelectedTaskForReminder(null);
                                }}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={async () => {
                                    await handleAddAlarm(selectedTaskForReminder, selectedReminderOption, selectedReminderOption === 'custom' ? customReminderTime : undefined);
                                    setReminderModalOpen(false);
                                    setSelectedTaskForReminder(null);
                                }}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                            >
                                Confirmar Lembrete
                            </button>
                        </div>
                    </div>
                </InteractiveWindow>,
                document.body
            )}
        </div>
    );
};

export default PortalTarefas;
export { PortalTarefas };
