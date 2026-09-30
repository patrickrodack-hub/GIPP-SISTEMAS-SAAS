import React, { useState, useContext, useMemo } from "react";
import { 
  Calendar, Clock, MapPin, ChevronLeft, ChevronRight, User, 
  CheckCircle2, AlertCircle, Sparkles, Users, Info, Bell, Filter, 
  List, CalendarDays, CalendarClock, ExternalLink, Check,
  Download, Briefcase, CheckCircle, Ban
} from "lucide-react";
import { ChurchContext } from "../context/ChurchContext";
import { Button, formatDateLocal, getTodayDate } from "../utils/sharedHelpers";

const PortalAgenda = ({ user, db }) => {
    const { setDoc, doc, dbFirestore, appId, addToast } = useContext(ChurchContext);
    const hoje = new Date().toISOString().split('T')[0];
    const [activeTab, setActiveTab] = useState<'calendario' | 'lista'>('calendario');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>(hoje);

    const eventos = (db.agenda || []).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    const futurasEventos = eventos.filter(e => e.data >= hoje);

    const minhasTarefas = (db.tarefas || []).filter((t: any) => 
        (t.equipe || []).some((m: any) => m.id === user.id || m.nome === user.nome)
    );

    const handleRSVP = async (evtId, status) => {
        const evt = db.agenda.find(e => e.id === evtId);
        if (!evt) return;
        const novasPresencas = { ...(evt.presencas || {}), [user.id]: status };
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'agenda', evtId), { presencas: novasPresencas }, { merge: true });
            addToast(status === 'confirmado' ? "Presença confirmada!" : "Ausência informada.", "success");
        } catch (e) {
            addToast("Erro ao atualizar presença.", "error");
        }
    };

    const handleScaleRSVP = async (taskId, status) => {
        const task = db.tarefas.find(t => t.id === taskId);
        if (!task) return;
        const novaEquipe = task.equipe.map((m: any) => 
            (m.id === user.id || m.nome === user.nome) ? { ...m, status_presenca: status } : m
        );
        try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'tarefas', taskId), { equipe: novaEquipe }, { merge: true });
            addToast(status === 'confirmado' ? "Escala confirmada com sucesso!" : "Ausência informada na escala.", "success");
        } catch (e) {
            addToast("Erro ao atualizar presença na escala.", "error");
        }
    };

    const handleCreateEventICS = (evt: any) => {
        try {
            const title = `Evento GIPP: ${evt.titulo}`;
            const dateStr = evt.data ? evt.data.replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '');
            const startTime = `${dateStr}T${(evt.hora || '19:00').replace(/:/g, '')}00`;
            const endTime = `${dateStr}T${(evt.hora || '21:00').replace(/:/g, '')}00`;
            
            const desc = `Compromisso: ${evt.titulo}. Local: ${evt.local || 'Templo Sede'}. Tipo: ${evt.tipo}.`;
            
            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//GIPP//ChurchManagement//PT',
                'BEGIN:VEVENT',
                `UID:gipp_evt_${evt.id}@gipp.app`,
                'SEQUENCE:0',
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                `DTSTART:${startTime}`,
                `DTEND:${endTime}`,
                `SUMMARY:${title}`,
                `DESCRIPTION:${desc}`,
                `LOCATION:${evt.local || 'Templo Sede'}`,
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\r\n');

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `evento_${evt.titulo.toLowerCase().replace(/\s+/g, '_')}.ics`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            addToast("Exportado para seu calendário local!", "success");
        } catch (e) {
            addToast("Erro ao gerar arquivo de calendário.", "error");
        }
    };

    // --- CALENDAR GRID GENERATOR ---
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarDays: any[] = [];
    
    // Fill previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const prevDate = new Date(year, month, -i);
        const dStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
        calendarDays.push({
            date: prevDate,
            day: prevDate.getDate(),
            dateString: dStr,
            isCurrentMonth: false
        });
    }

    // Fill current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const currDate = new Date(year, month, i);
        const dStr = `${currDate.getFullYear()}-${String(currDate.getMonth() + 1).padStart(2, '0')}-${String(currDate.getDate()).padStart(2, '0')}`;
        calendarDays.push({
            date: currDate,
            day: i,
            dateString: dStr,
            isCurrentMonth: true
        });
    }

    // Fill next month padding
    while (calendarDays.length % 7 !== 0) {
        const nextDate = new Date(year, month + 1, calendarDays.length - firstDayOfMonth - daysInMonth + 1);
        const dStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
        calendarDays.push({
            date: nextDate,
            day: nextDate.getDate(),
            dateString: dStr,
            isCurrentMonth: false
        });
    }

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleSetToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(hoje);
    };

    // Filtered selected day list
    const selectedEvents = eventos.filter(e => e.data === selectedDate);
    const selectedTasks = minhasTarefas.filter(t => t.data === selectedDate);

    return (
        <div className="space-y-6 animate-entrance">
            {/* Header & View Switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <Calendar size={28} className="text-[#FFC500]"/> Agenda da Igreja
                    </h2>
                    <p className="text-xs text-[#A0A0A0] font-medium mt-1">
                        Visualize eventos, escalas e atividades no calendário ou em lista organizada.
                    </p>
                </div>
                
                <div className="flex bg-[#252525] p-1 rounded-2xl border border-[#333333] shrink-0">
                    <button
                        onClick={() => setActiveTab('calendario')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'calendario' ? 'bg-[#FFC500] text-black shadow-lg shadow-[#FFC500]/15' : 'text-[#A0A0A0] hover:text-white'}`}
                    >
                        <CalendarClock size={15}/> Calendário Mensal
                    </button>
                    <button
                        onClick={() => setActiveTab('lista')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'lista' ? 'bg-[#FFC500] text-black shadow-lg shadow-[#FFC500]/15' : 'text-[#A0A0A0] hover:text-white'}`}
                    >
                        <List size={15}/> Próximos Eventos
                    </button>
                </div>
            </div>

            {activeTab === 'calendario' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Month Grid Card */}
                    <div className="lg:col-span-2 bg-[#1C1C1C] p-5 md:p-6 rounded-3xl border border-[#333333] flex flex-col">
                        {/* Calendar Controls */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-extrabold text-white text-lg tracking-tight">
                                {meses[month]} de {year}
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSetToday}
                                    className="px-3 py-1.5 rounded-xl bg-[#252525] hover:bg-[#303030] text-white text-xs font-bold transition-all border border-[#333333]"
                                >
                                    Hoje
                                </button>
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-1.5 rounded-xl bg-[#252525] hover:bg-[#303030] text-white transition-all border border-[#333333]"
                                    title="Mês Anterior"
                                >
                                    <ChevronLeft size={16}/>
                                </button>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-1.5 rounded-xl bg-[#252525] hover:bg-[#303030] text-white transition-all border border-[#333333]"
                                    title="Próximo Mês"
                                >
                                    <ChevronRight size={16}/>
                                </button>
                            </div>
                        </div>

                        {/* Weekday Labels */}
                        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
                                <div key={i} className="text-center font-bold text-[10px] md:text-xs text-[#A0A0A0] uppercase tracking-wider py-1">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1 md:gap-2">
                            {calendarDays.map((day, idx) => {
                                const dayEvts = eventos.filter(e => e.data === day.dateString);
                                const dayTasks = minhasTarefas.filter(t => t.data === day.dateString);
                                const isSelected = selectedDate === day.dateString;
                                const isTodayDay = day.dateString === hoje;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedDate(day.dateString)}
                                        className={`relative w-full aspect-square flex flex-col items-center justify-between p-1.5 md:p-2 rounded-2xl transition-all ${
                                            day.isCurrentMonth ? 'text-white' : 'text-[#555555]'
                                        } ${
                                            isSelected 
                                                ? 'bg-[#FFC500] text-black shadow-lg shadow-[#FFC500]/15 scale-[1.03] z-10 font-bold border-transparent' 
                                                : 'bg-[#222222]/50 hover:bg-[#2A2A2A] border border-[#333333]'
                                        } ${
                                            isTodayDay && !isSelected ? 'ring-2 ring-[#FFC500]' : ''
                                        }`}
                                    >
                                        <span className={`text-xs md:text-sm font-black self-start ${isSelected ? 'text-black' : 'text-white'}`}>
                                            {day.day}
                                        </span>

                                        {/* Grid Indicators */}
                                        <div className="flex gap-1 justify-center items-center w-full mt-auto">
                                            {dayEvts.length > 0 && (
                                                <span 
                                                    className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-[#FFC500]'}`} 
                                                    title={`${dayEvts.length} Evento(s)`}
                                                />
                                            )}
                                            {dayTasks.length > 0 && (
                                                <span 
                                                    className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-emerald-400'}`} 
                                                    title={`${dayTasks.length} Escala(s)`}
                                                />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 pt-4 border-t border-[#333333] flex flex-wrap gap-4 text-xs font-bold">
                            <span className="flex items-center gap-2 text-[#A0A0A0]">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#FFC500]" /> Eventos da Igreja
                            </span>
                            <span className="flex items-center gap-2 text-[#A0A0A0]">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Suas Escalas / Tarefas
                            </span>
                            <span className="flex items-center gap-2 text-[#A0A0A0]">
                                <span className="w-2.5 h-2.5 rounded-full border border-[#FFC500]" /> Hoje
                            </span>
                        </div>
                    </div>

                    {/* Selected Day Details Side Card */}
                    <div className="bg-[#1C1C1C] p-5 md:p-6 rounded-3xl border border-[#333333] flex flex-col space-y-4">
                        <div className="border-b border-[#333333] pb-3">
                            <span className="text-[10px] font-black uppercase text-[#FFC500] tracking-widest block mb-1">
                                Compromissos do Dia
                            </span>
                            <h4 className="font-extrabold text-white text-base leading-tight">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </h4>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 max-h-[350px] lg:max-h-[480px] custom-scrollbar pr-1">
                            {selectedEvents.length === 0 && selectedTasks.length === 0 ? (
                                <div className="text-center py-12 text-[#A0A0A0] flex flex-col items-center justify-center">
                                    <Calendar size={36} className="text-[#333] mb-3" />
                                    <p className="text-sm font-bold">Nenhum compromisso ou escala para este dia.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Selected Day Events */}
                                    {selectedEvents.length > 0 && (
                                        <div className="space-y-3">
                                            <h5 className="text-[10px] font-black uppercase tracking-wider text-[#FFC500] mb-2 flex items-center gap-1.5">
                                                <Calendar size={13}/> Eventos Gerais ({selectedEvents.length})
                                            </h5>
                                            {selectedEvents.map((evt, idx) => {
                                                const rsvpStatus = evt.presencas?.[user.id];
                                                return (
                                                    <div key={evt.id || idx} className="bg-[#222] p-4 rounded-2xl border border-[#333333] hover:border-[#FFC500]/50 transition-all space-y-3">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="min-w-0">
                                                                <h6 className="font-bold text-white text-sm truncate">{evt.titulo}</h6>
                                                                <p className="text-[11px] text-[#A0A0A0] mt-1 flex flex-wrap gap-x-2 gap-y-1">
                                                                    <span className="flex items-center gap-1"><Clock size={12}/> {evt.hora}</span>
                                                                    <span className="flex items-center gap-1"><MapPin size={12}/> {evt.local || 'Sede'}</span>
                                                                </p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleCreateEventICS(evt)}
                                                                className="p-1 rounded-lg bg-[#2d2d2d] hover:bg-[#3d3d3d] text-[#A0A0A0] hover:text-white transition-colors"
                                                                title="Adicionar ao Calendário (.ics)"
                                                            >
                                                                <Download size={14}/>
                                                            </button>
                                                        </div>

                                                        {/* RSVP Block */}
                                                        <div className="pt-2 border-t border-[#333333] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                            <span className="text-[10px] font-bold text-[#A0A0A0] uppercase">Você vai participar?</span>
                                                            <div className="flex gap-1.5 self-end">
                                                                <button
                                                                    onClick={() => handleRSVP(evt.id, 'confirmado')}
                                                                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border ${rsvpStatus === 'confirmado' ? 'bg-[#FFC500]/20 text-[#FFC500] border-[#FFC500]/50' : 'bg-[#121212] text-[#A0A0A0] border-[#333333] hover:border-[#FFC500] hover:text-[#FFC500]'}`}
                                                                >
                                                                    Vou
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRSVP(evt.id, 'recusado')}
                                                                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border ${rsvpStatus === 'recusado' ? 'bg-rose-500/20 text-rose-500 border-rose-500/50' : 'bg-[#121212] text-[#A0A0A0] border-[#333333] hover:border-rose-500 hover:text-rose-500'}`}
                                                                >
                                                                    Não Vou
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Selected Day Scales / Tasks */}
                                    {selectedTasks.length > 0 && (
                                        <div className="space-y-3 pt-2">
                                            <h5 className="text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                                                <Briefcase size={13}/> Suas Escalas ({selectedTasks.length})
                                            </h5>
                                            {selectedTasks.map((task, idx) => {
                                                const meuStatus = task.equipe?.find((m: any) => m.id === user.id || m.nome === user.nome)?.status_presenca;
                                                return (
                                                    <div key={task.id || idx} className="bg-[#222] p-4 rounded-2xl border border-[#333333] hover:border-emerald-500/50 transition-all space-y-3">
                                                        <div>
                                                            <h6 className="font-bold text-white text-sm">{task.descricao}</h6>
                                                            <p className="text-[10px] font-extrabold text-emerald-400 mt-0.5 uppercase tracking-wider">{task.categoria}</p>
                                                            <p className="text-[11px] text-[#A0A0A0] mt-1 flex items-center gap-1">
                                                                <Clock size={12}/> {task.hora_inicio || '09:00'} - {task.hora_fim || '11:00'}
                                                            </p>
                                                        </div>

                                                        {/* RSVP Block */}
                                                        <div className="pt-2 border-t border-[#333333] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                            <span className="text-[10px] font-bold text-[#A0A0A0] uppercase">Confirmar escala?</span>
                                                            <div className="flex gap-1.5 self-end">
                                                                <button
                                                                    onClick={() => handleScaleRSVP(task.id, 'confirmado')}
                                                                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border ${meuStatus === 'confirmado' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-[#121212] text-[#A0A0A0] border-[#333333] hover:border-emerald-500 hover:text-emerald-500'}`}
                                                                >
                                                                    Confirmar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleScaleRSVP(task.id, 'recusado')}
                                                                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border ${meuStatus === 'recusado' ? 'bg-rose-500/20 text-rose-500 border-rose-500/50' : 'bg-[#121212] text-[#A0A0A0] border-[#333333] hover:border-rose-500 hover:text-rose-500'}`}
                                                                >
                                                                    Declinar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* List View Fallback */
                <div className="grid gap-4">
                    {futurasEventos.length > 0 ? futurasEventos.map((evt, i) => {
                        const rsvpStatus = evt.presencas?.[user.id];
                        return (
                            <div key={i} className="bg-[#1C1C1C] p-5 md:p-6 rounded-3xl shadow-sm border border-[#333333] flex flex-col gap-4 hover:border-[#FFC500] transition-colors group animate-entrance">
                                <div className="flex items-center gap-5">
                                    <div className="bg-[#2C2C2C] text-[#FFC500] p-3 rounded-2xl text-center min-w-[70px] group-hover:bg-[#FFC500] group-hover:text-black transition-colors">
                                        <div className="text-2xl font-black leading-none">{evt.data.split('-')[2]}</div>
                                        <div className="text-[10px] font-bold uppercase">{new Date(evt.data + 'T00:00:00').toLocaleString('pt-BR', {month: 'short'})}</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-white text-lg truncate">{evt.titulo}</h4>
                                            <div className="hidden sm:block">
                                                <span className="text-[10px] font-black uppercase text-black bg-[#FFC500] px-3 py-1 rounded-full">
                                                    {evt.tipo}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-[#A0A0A0] font-medium flex flex-wrap gap-3">
                                            <span className="flex items-center gap-1"><Clock size={14}/> {evt.hora}</span>
                                            <span className="flex items-center gap-1"><MapPin size={14}/> {evt.local || 'Templo Sede'}</span>
                                        </p>
                                        {evt.lembrete_push_ativo && (
                                            <div className="flex items-center gap-1.5 mt-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider w-fit">
                                                <Bell size={11} className="text-indigo-400 animate-bounce" /> 
                                                Notificação Push 24h Disponível
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* RSVP Block (Agenda) */}
                                <div className="mt-2 pt-4 border-t border-[#333333] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-widest flex items-center gap-1.5">
                                        <CheckCircle size={14}/> Você irá participar?
                                    </p>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button 
                                            onClick={() => handleRSVP(evt.id, 'confirmado')}
                                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${rsvpStatus === 'confirmado' ? 'bg-[#FFC500]/20 text-[#FFC500] border-[#FFC500]/50' : 'bg-[#121212] text-[#A0A0A0] border-[#333333] hover:border-[#FFC500] hover:text-[#FFC500]'}`}
                                        >
                                            <CheckCircle size={14} /> Estarei Presente
                                        </button>
                                        <button 
                                            onClick={() => handleRSVP(evt.id, 'recusado')}
                                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${rsvpStatus === 'recusado' ? 'bg-rose-500/20 text-rose-500 border-rose-500/50' : 'bg-[#121212] text-[#A0A0A0] border-[#333333] hover:border-rose-500 hover:text-rose-500'}`}
                                        >
                                            <Ban size={14} /> Não Estarei
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="bg-[#1C1C1C] p-10 rounded-3xl shadow-sm border border-[#333333] text-center">
                            <Calendar size={48} className="text-[#444] mx-auto mb-4"/>
                            <p className="text-[#A0A0A0] font-bold">Nenhum evento futuro agendado.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PortalAgenda;
export { PortalAgenda };
