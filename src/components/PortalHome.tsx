import { callGeminiAI } from "../services/geminiService";
import { CURSOS_DISPONIVEIS as IMPORTED_CURSOS_DISPONIVEIS } from "./ModuleCoursesData";
import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, ArrowRight, Award, Bell, BookOpen, BookOpenText, Calendar, Camera, 
  CheckCircle, CheckCircle2, CheckSquare, Copy, DollarSign, GraduationCap, 
  HeartHandshake, History, Loader2, Lock, MapPin, Maximize, Minimize, Minus, 
  Music, QrCode, RefreshCw, ShoppingBag, SlidersHorizontal, Sparkles, Star, 
  Trash2, User, Video, Zap, Heart, MessageCircle, Send, PlayCircle, Clock, 
  List, ChevronRight, ChevronLeft, Plus, Edit, Download, ExternalLink, Sliders,
  HelpCircle, Eye, EyeOff, Globe, ShieldCheck, X
} from "lucide-react";
import { ChurchContext } from "../context/ChurchContext";
import { 
  Button, FormInput, FormSelect, formatDateLocal, getTodayDate, 
  isValidCPF, formatCPF, copyToClipboard, resizeImageAndCompress, 
  playMenuSound, playNotificationSound 
} from "../utils/sharedHelpers";
import { getMemberFuncoesAdm, getMemberPortalAllowedModules } from "../constants/portalPermissions";
import { checkIsMusicoOuLouvor } from "../data/repertorioData";
import { isProdutoExemplo, EXEMPLO_PRODUTO_IDS } from "../data/lojaVirtualData";
import { CachedImage } from "./CachedImage";

const PortalHome = ({ user, db, setView }) => {
    const { notifications, clearAllNotifications } = useContext(ChurchContext);
    const hojeObj = new Date();
    const hoje = hojeObj.toISOString().split('T')[0];
    const currentMonthStr = hojeObj.toISOString().slice(0, 7);
    const currentUser = db.membros.find((m: any) => m.id === user.id) || user;

    const userRolesHome = getMemberFuncoesAdm(currentUser);
    const portalAcessosFuncaoHome = db.igreja?.portal_acessos_funcao || {};
    const defaultModulesHome = getMemberPortalAllowedModules(currentUser, portalAcessosFuncaoHome);
    const allowedModulesHome = currentUser?.portal_permissoes_personalizadas 
        ? defaultModulesHome.filter((mId: string) => currentUser.portal_permissoes_personalizadas.includes(mId))
        : defaultModulesHome;

    const isProfessor = (currentUser.cargo || '').toLowerCase().includes('professor') || 
                        (currentUser.funcao || '').toLowerCase().includes('professor') || 
                        userRolesHome.some(r => r.includes('PROFESSOR')) || 
                        currentUser.nivel === 'master' ||
                        (db.ebd?.turmas || []).some((t: any) => t.prof1_id === currentUser.id || t.prof2_id === currentUser.id || t.prof3_id === currentUser.id);

    const isPastorHome = (currentUser.cargo || '').toLowerCase().includes('pastor') || 
                         (currentUser.cargo || '').toLowerCase().includes('evangelista') || 
                         (currentUser.funcao || '').toLowerCase().includes('pastor') || 
                         userRolesHome.some(r => r === 'PASTOR PRESIDENTE' || r === 'PASTOR AUXILIAR') || 
                         currentUser.nivel === 'master';

    const isPresbiteroHome = (currentUser.cargo || '').toLowerCase().includes('presb') || 
                            (currentUser.cargo || '').toLowerCase().includes('pb.') || 
                            (currentUser.funcao || '').toLowerCase().includes('presb') || 
                            userRolesHome.some(r => r.includes('PRESBITERO'));

    const isAlunoOuCandidatoHome = Boolean(
        currentUser.is_candidato_obreiro || 
        currentUser.aluno_formacao || 
        (currentUser.cargo || '').toLowerCase().includes('candidat') || 
        (currentUser.cargo || '').toLowerCase().includes('aluno form') || 
        (currentUser.funcao || '').toLowerCase().includes('candidat') || 
        (db.candidatos_obreiros || []).some((c: any) => 
            (c.id && (c.id === currentUser.id || c.membroId === currentUser.id || c.membro_id === currentUser.id)) ||
            (c.cpf && currentUser.cpf && c.cpf === currentUser.cpf) ||
            (c.email && currentUser.email && c.email.toLowerCase() === currentUser.email.toLowerCase()) ||
            (c.nome && currentUser.nome && c.nome.toLowerCase().trim() === currentUser.nome.toLowerCase().trim())
        ) ||
        (db.formacao_candidatos || []).some((c: any) => 
            (c.id && (c.id === currentUser.id || c.membroId === currentUser.id || c.membro_id === currentUser.id)) ||
            (c.cpf && currentUser.cpf && c.cpf === currentUser.cpf) ||
            (c.email && currentUser.email && c.email.toLowerCase() === currentUser.email.toLowerCase()) ||
            (c.nome && currentUser.nome && c.nome.toLowerCase().trim() === currentUser.nome.toLowerCase().trim())
        )
    );

    const canAccessFormacaoHome = isAlunoOuCandidatoHome || isPastorHome || isPresbiteroHome || isProfessor || currentUser.nivel === 'master' || userRolesHome.some(r => ['ADMINISTRADOR', 'SUPERINTENDENTE', 'COORDENADOR'].includes(r));
    const isMusicoHome = checkIsMusicoOuLouvor(currentUser, db);
    
    const [devocional, setDevocional] = useState('');
    const [loadingDev, setLoadingDev] = useState(false);
    const [homeViewTab, setHomeViewTab] = useState<'cockpit' | 'conquistas' | 'linha_tempo' | 'devocional' | 'tudo'>('cockpit');

    // --- ESTADOS E AUXILIARES DO HISTÓRICO DE MEDALHAS ---
    const [isMedalHistoryOpen, setIsMedalHistoryOpen] = useState(false);
    const [isMedalHistoryFullscreen, setIsMedalHistoryFullscreen] = useState(true);
    const [selectedHistoryFilter, setSelectedHistoryFilter] = useState<'all' | 'with_medals'>('with_medals');
    const [medalViewMode, setMedalViewMode] = useState<'timeline' | 'categories'>('timeline');

    const getMonthAchievements = (monthStr: string) => {
        const unlocked = [];

        // 1. Semeador (Dízimos e Ofertas) - Mensal
        const dizimos = (db.financeiro || []).filter(f => f.membro_id === currentUser.id && f.status === 'pago' && (f.data_competencia || f.data_pagamento || '').startsWith(monthStr));
        if (dizimos.length > 0) unlocked.push('dizimista');

        // 2. Servo Ativo (Tarefas Concluídas) - Mensal
        const tarefasConcluidas = (db.tarefas || []).filter(t => t.status === 'Concluido' && (t.data || '').startsWith(monthStr) && (t.equipe || []).some(m => m.id === currentUser.id || m.nome === currentUser.nome));
        if (tarefasConcluidas.length > 0) unlocked.push('servo');

        // 3. Estudo da EBD - Mensal
        const isEbd = (currentUser.estudos_ebd_concluidos || []).some(e => e.mes === monthStr);
        if (isEbd) unlocked.push('ebd');

        // 4. Coração Missionário - Mensal
        const isMissao = (db.carnes || []).some(c => c.membro_id === currentUser.id && c.titulo.toLowerCase().includes('miss') && (c.parcelas || []).some(p => p.status === 'pago' && (p.data_pagamento || '').startsWith(monthStr))) || 
                         (db.financeiro || []).some(f => f.membro_id === currentUser.id && f.categoria === 'Missões' && f.status === 'pago' && (f.data_competencia || f.data_pagamento || '').startsWith(monthStr));
        if (isMissao) unlocked.push('missao');
        
        // 5. Comunhão Ativa - Mensal
        const isMural = (db.mural || []).some(m => m.autor_id === currentUser.id && (m.data || '').startsWith(monthStr));
        if (isMural) unlocked.push('comunhao');

        // Cursos concluídos neste mês
        const cursosNoMes = (currentUser.cursos_concluidos || []).filter(c => c.mes === monthStr);

        return {
            monthStr,
            badges: unlocked,
            cursos: cursosNoMes
        };
    };

    const getPast12MonthsList = () => {
        const list = [];
        const d = new Date();
        for (let i = 0; i < 12; i++) {
            const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
            const mStr = m.toISOString().slice(0, 7); // "YYYY-MM"
            list.push(mStr);
        }
        return list;
    };

    const formatMonthLabel = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const monthIndex = parseInt(month, 10) - 1;
        return `${meses[monthIndex]} de ${year}`;
    };

    const totalHistoricalBadgesCount = useMemo(() => {
        let total = 0;
        const months = getPast12MonthsList();
        months.forEach(m => {
            total += getMonthAchievements(m).badges.length;
        });
        return total;
    }, [db, currentUser]);

    const totalHistoricalCoursesCount = (currentUser.cursos_concluidos || []).length;

    const totalActiveMonthsCount = useMemo(() => {
        let count = 0;
        const months = getPast12MonthsList();
        months.forEach(m => {
            const ach = getMonthAchievements(m);
            if (ach.badges.length > 0 || ach.cursos.length > 0) {
                count++;
            }
        });
        return count;
    }, [db, currentUser]);

    const getMedalsByCategory = () => {
        const months = getPast12MonthsList();
        
        const results = {
            'Financeiro': [
                {
                    id: 'dizimista',
                    title: 'Semeador',
                    desc: 'Fidelidade de Dízimos e Ofertas no mês',
                    icon: Award,
                    textColor: 'text-amber-700',
                    grad: 'from-amber-300 via-yellow-500 to-orange-600',
                    glow: 'bg-amber-400',
                    monthsWon: [] as string[]
                },
                {
                    id: 'missao',
                    title: 'Missionário',
                    desc: 'Contribuição e Apoio Missionário no mês',
                    icon: Globe,
                    textColor: 'text-rose-700',
                    grad: 'from-rose-400 via-rose-500 to-rose-700',
                    glow: 'bg-rose-400',
                    monthsWon: [] as string[]
                }
            ],
            'EBD': [
                {
                    id: 'ebd',
                    title: 'Estudo EBD',
                    desc: 'Conclusão de Lição da Escola Bíblica Dominical no mês',
                    icon: BookOpenText,
                    textColor: 'text-blue-700',
                    grad: 'from-blue-400 via-blue-500 to-blue-700',
                    glow: 'bg-blue-400',
                    monthsWon: [] as string[]
                }
            ],
            'Social': [
                {
                    id: 'servo',
                    title: 'Servo Ativo',
                    desc: 'Conclusão de escalas e tarefas ministeriais no mês',
                    icon: ShieldCheck,
                    textColor: 'text-emerald-700',
                    grad: 'from-emerald-400 via-emerald-500 to-emerald-700',
                    glow: 'bg-emerald-400',
                    monthsWon: [] as string[]
                },
                {
                    id: 'comunhao',
                    title: 'Comunhão',
                    desc: 'Interação e partilha no mural da igreja no mês',
                    icon: HeartHandshake,
                    textColor: 'text-fuchsia-700',
                    grad: 'from-fuchsia-400 via-fuchsia-500 to-purple-700',
                    glow: 'bg-fuchsia-400',
                    monthsWon: [] as string[]
                }
            ]
        };

        months.forEach(m => {
            const ach = getMonthAchievements(m);
            ach.badges.forEach(bid => {
                if (bid === 'dizimista') results['Financeiro'][0].monthsWon.push(m);
                if (bid === 'missao') results['Financeiro'][1].monthsWon.push(m);
                if (bid === 'ebd') results['EBD'][0].monthsWon.push(m);
                if (bid === 'servo') results['Social'][0].monthsWon.push(m);
                if (bid === 'comunhao') results['Social'][1].monthsWon.push(m);
            });
        });

        return results;
    };

    const horaAtual = hojeObj.getHours();
    let saudacaoTempo = "Boa noite";
    if (horaAtual >= 5 && horaAtual < 12) saudacaoTempo = "Bom dia";
    else if (horaAtual >= 12 && horaAtual < 18) saudacaoTempo = "Boa tarde";

    const gerarDevocional = async () => {
        setLoadingDev(true);
        const prompt = `Escreva um devocional cristão curto, inspirador e edificante (máximo 2 parágrafos pequenos) focado em encorajamento e fé. Comece por saudar a pessoa pelo nome: ${currentUser.nome.split(' ')[0]}. Inclua apenas 1 versículo bíblico no texto. Não use introduções, vá direto à mensagem. Retorne bem formatado.`;
        const result = await callGeminiAI(prompt);
        setDevocional(result);
        setLoadingDev(false);
    };

    const inboxItems = [];

    const minhasTarefas = (db.tarefas || []).filter(t => 
        t.status !== 'Concluido' && (t.equipe || []).some(m => m.id === currentUser.id || m.nome === currentUser.nome)
    );
    minhasTarefas.forEach(t => {
        inboxItems.push({
            id: `task_${t.id}`,
            sender: 'Departamento de Escalas',
            subject: `Convocação: ${t.descricao}`,
            date: t.data || hoje,
            icon: CheckSquare,
            bg: 'bg-indigo-100',
            text: 'text-indigo-600',
            isNew: true,
            action: () => setView('portal_tarefas')
        });
    });

    const limiteAgenda = new Date();
    limiteAgenda.setDate(limiteAgenda.getDate() + 7);
    const limiteStr = limiteAgenda.toISOString().split('T')[0];
    
    const proximosEventos = (db.agenda || []).filter(e => e.data >= hoje && e.data <= limiteStr).sort((a,b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    proximosEventos.forEach(e => {
         inboxItems.push({
            id: `evt_${e.id}`,
            sender: 'Comunicação Geral',
            subject: `Agenda: ${e.titulo} em breve!`,
            date: e.data,
            icon: Calendar,
            bg: 'bg-emerald-100',
            text: 'text-emerald-600',
            isNew: e.data === hoje, 
            action: () => setView('portal_agenda')
         });
    });

    const minhaMatricula = db.ebd?.alunos?.find(a => a.membro_id === currentUser.id || a.nome === currentUser.nome);
    if (minhaMatricula) {
        const turma = db.ebd?.turmas?.find(t => t.id === minhaMatricula.turma_id);
        inboxItems.push({
            id: 'ebd_notice',
            sender: 'Escola Dominical (EBD)',
            subject: `Lembrete de aula: Turma ${turma ? turma.nome : 'Ativa'}`,
            date: hoje,
            icon: BookOpen,
            bg: 'bg-blue-100',
            text: 'text-blue-600',
            isNew: false,
            action: () => setView('portal_ebd')
        });
    }

    if (notifications && notifications.length > 0) {
        notifications.forEach((notif: any) => {
            const alreadyExists = inboxItems.some(item => item.id === notif.id);
            if (!alreadyExists) {
                inboxItems.push({
                    id: notif.id,
                    sender: 'Notificação do Sistema',
                    subject: `${notif.title}: ${notif.desc}`,
                    date: hoje,
                    icon: notif.icon || Bell,
                    bg: notif.color === 'rose' ? 'bg-rose-100' : notif.color === 'amber' ? 'bg-amber-100' : 'bg-indigo-100',
                    text: notif.color === 'rose' ? 'text-rose-600' : notif.color === 'amber' ? 'text-amber-600' : 'text-indigo-600',
                    isNew: true,
                    action: () => {
                        if (notif.id.startsWith('tar_')) {
                            setView('portal_tarefas');
                        } else if (notif.id.startsWith('aniv_')) {
                            setView('portal_mural');
                        }
                    }
                });
            }
        });
    }

    inboxItems.sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // --- LÓGICA DE GAMIFICAÇÃO (MEDALHAS E CONQUISTAS) ---
    // Agora avaliada MENSALMENTE
    const badges = useMemo(() => {
        const unlocked = [];

        // 1. Semeador (Dízimos e Ofertas) - Mensal
        const dizimos = (db.financeiro || []).filter(f => f.membro_id === currentUser.id && f.status === 'pago' && (f.data_competencia || f.data_pagamento || '').startsWith(currentMonthStr));
        if (dizimos.length > 0) unlocked.push('dizimista');

        // 2. Servo Ativo (Tarefas Concluídas) - Mensal
        const tarefasConcluidas = (db.tarefas || []).filter(t => t.status === 'Concluido' && (t.data || '').startsWith(currentMonthStr) && (t.equipe || []).some(m => m.id === currentUser.id || m.nome === currentUser.nome));
        if (tarefasConcluidas.length > 0) unlocked.push('servo');

        // 3. Estudo da EBD - Mensal
        const isEbd = (currentUser.estudos_ebd_concluidos || []).some(e => e.mes === currentMonthStr);
        if (isEbd) unlocked.push('ebd');

        // 4. Coração Missionário - Mensal
        const isMissao = (db.carnes || []).some(c => c.membro_id === currentUser.id && c.titulo.toLowerCase().includes('miss') && (c.parcelas || []).some(p => p.status === 'pago' && (p.data_pagamento || '').startsWith(currentMonthStr))) || 
                         (db.financeiro || []).some(f => f.membro_id === currentUser.id && f.categoria === 'Missões' && f.status === 'pago' && (f.data_competencia || f.data_pagamento || '').startsWith(currentMonthStr));
        if (isMissao) unlocked.push('missao');
        
        // 5. Comunhão Ativa - Mensal
        const isMural = (db.mural || []).some(m => m.autor_id === currentUser.id && (m.data || '').startsWith(currentMonthStr));
        if (isMural) unlocked.push('comunhao');

        return unlocked;
    }, [db, currentUser, currentMonthStr]);

    const BADGE_DEFS = [
        { id: 'ebd', title: 'Estudo EBD', desc: 'Concluiu lição no mês', icon: BookOpenText, textColor: 'text-blue-700', grad: 'from-blue-400 via-blue-500 to-blue-700', glow: 'bg-blue-400' },
        { id: 'servo', title: 'Servo Ativo', desc: 'Escalas do mês', icon: ShieldCheck, textColor: 'text-emerald-700', grad: 'from-emerald-400 via-emerald-500 to-emerald-700', glow: 'bg-emerald-400' },
        { id: 'dizimista', title: 'Semeador', desc: 'Fidelidade do mês', icon: Award, textColor: 'text-amber-700', grad: 'from-amber-300 via-yellow-500 to-orange-600', glow: 'bg-amber-400' },
        { id: 'missao', title: 'Missionário', desc: 'Apoio neste mês', icon: Globe, textColor: 'text-rose-700', grad: 'from-rose-400 via-rose-500 to-rose-700', glow: 'bg-rose-400' },
        { id: 'comunhao', title: 'Comunhão', desc: 'Mural do mês', icon: HeartHandshake, textColor: 'text-fuchsia-700', grad: 'from-fuchsia-400 via-fuchsia-500 to-purple-700', glow: 'bg-fuchsia-400' }
    ];

    const CURSOS_DISPONIVEIS = IMPORTED_CURSOS_DISPONIVEIS;

    const getCourseProgress = (cursoId, modulosConcluidos) => {
        if (!modulosConcluidos || !modulosConcluidos.length) return 0;
        let pfx = '';
        if (cursoId === 'fundamentos_pentecostais') pfx = 'm';
        else if (cursoId === 'teologia_avancada') pfx = 'adv_m';
        else if (cursoId === 'obreiro_de_valor') pfx = 'obr_m';
        else if (cursoId === 'historia_igreja') pfx = 'hist_m';
        else if (cursoId === 'conhecendo_doutrinas') pfx = 'dout_m';
        else if (cursoId === 'jesus_cristo') pfx = 'jc_m';
        else if (cursoId === 'manual_biblico_macarthur') pfx = 'mb_m';
        else if (cursoId === 'licoes_biblicas_defesa_fe') pfx = 'df_m';

        let completed = 0;
        for (let i = 1; i <= 10; i++) {
            if (modulosConcluidos.includes(`${pfx}${i}`)) {
                completed++;
            }
        }
        return Math.round((completed / 10) * 100);
    };

    const unlockedCount = badges.length;
    const cursosConcluidosMes = (currentUser.cursos_concluidos || []).filter(c => c.mes === currentMonthStr);
    const unlockedCursosCount = cursosConcluidosMes.length;
    const totalBadgesCount = BADGE_DEFS.length + CURSOS_DISPONIVEIS.length;

    const totalCursosModules = CURSOS_DISPONIVEIS.reduce((sum, curso: any) => sum + (curso.modulesCount || 10), 0); // Assuming 10 modules per course if not specified
    const modulosConcluidosSoma = (currentUser.modulos_concluidos || []).length;
    
    // Atualização da lógica de nível espiritual incluindo andamento dos cursos
    const nivelSpiritual = totalBadgesCount > 0 
        ? Math.round((((unlockedCount / totalBadgesCount) * 100) + ((modulosConcluidosSoma / totalCursosModules) * 100)) / 2) || Math.round((unlockedCount / totalBadgesCount) * 100) 
        : 0;
        
    const nivelRotulo = (unlockedCount + unlockedCursosCount) === totalBadgesCount + 5 ? "Obreiro Aprovado" : (unlockedCount + unlockedCursosCount) >= 4 ? "Servo Dedicado" : (unlockedCount + unlockedCursosCount) >= 1 ? "Membro Ativo" : "Novo Integrante";

    return (
        <div className="space-y-2.5 sm:space-y-3.5 animate-entrance pb-1">
            
            {/* HERO COM STATUS DO PERFIL (RESPONSIVO E COM ESPAÇO OTIMIZADO) */}
            <div className="rounded-2xl sm:rounded-3xl bg-slate-900 text-white shadow-lg relative overflow-hidden border border-slate-800 p-3 sm:p-4 md:p-5 flex items-center justify-between gap-3 sm:gap-4 md:gap-6 group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur-[100px] opacity-30 -mr-20 -mt-20 pointer-events-none transition-all duration-1000 group-hover:opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
                
                {/* FOTO DO USUÁRIO AMPLIADA À ESQUERDA PARA MELHOR EXPOSIÇÃO */}
                <div className="relative z-10 shrink-0 flex items-center justify-center p-0.5">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 border-emerald-400/80 overflow-hidden bg-slate-800 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.45)] relative group/foto shrink-0 ring-4 ring-emerald-500/20">
                        {currentUser.foto ? (
                            <CachedImage src={currentUser.foto} cacheKey={`user_${currentUser.id || 'current'}_foto`} className="w-full h-full object-cover"/>
                        ) : (
                            <User size={56} className="text-slate-400"/>
                        )}
                        <button onClick={() => setView('portal_perfil')} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/foto:opacity-100 transition-opacity cursor-pointer">
                            <Camera size={22} className="text-white mb-0.5"/>
                            <span className="text-[8px] font-black uppercase tracking-widest text-white">Editar</span>
                        </button>
                    </div>
                </div>
                
                {/* INFORMAÇÕES ALINHADAS À DIREITA (FLUXO DIREITA PARA ESQUERDA) */}
                <div className="relative z-10 flex-1 min-w-0 flex flex-col items-end text-right justify-center gap-1 sm:gap-1.5">
                    {/* BADGES */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 justify-end w-full">
                        <span className="bg-emerald-500/15 text-emerald-300 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest inline-block border border-emerald-500/30 shadow-xs shrink-0">
                            {currentUser.cargo || 'Membro Ativo'}
                        </span>
                        {userRolesHome.map((fn: string) => (
                            <span key={fn} className="bg-indigo-500/15 text-indigo-300 px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest inline-block border border-indigo-500/30 shadow-xs shrink-0">
                                {fn === 'MUSICO' || fn === 'MÚSICO' ? '🎵 ' : 'ADM: '}{fn}
                            </span>
                        ))}
                    </div>

                    {/* NOME COMPLETO DA IGREJA (EXTENDIDO SEM CORTES) */}
                    <div className="flex items-center justify-end gap-1.5 text-slate-300 text-[10.5px] sm:text-[11.5px] font-bold leading-tight w-full text-right">
                        <span className="break-words max-w-full text-right">{db.igreja.nome}</span>
                        <MapPin size={11} className="shrink-0 text-emerald-400"/>
                    </div>
                    
                    {/* SAUDAÇÃO COM NOME */}
                    <h2 className="text-base sm:text-xl md:text-2xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-200">
                        {saudacaoTempo}, {currentUser.nome.split(' ')[0]}!
                    </h2>

                    {/* JORNADA DE FÉ (BOX REDUZIDO E COMPACTO) */}
                    <div className="w-full max-w-[170px] sm:max-w-[200px] bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700/50 backdrop-blur-xs shadow-inner mt-0.5">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[8px] sm:text-[8.5px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                <Activity size={9} className="text-emerald-400 shrink-0"/> Jornada
                            </span>
                            <span className="text-[9.5px] sm:text-[10px] font-black text-emerald-400">{nivelSpiritual}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden flex shadow-inner border border-slate-700/50 mb-0.5">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 relative" style={{width: `${nivelSpiritual}%`}}>
                                <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ animation: 'slideRight 2s infinite linear' }}></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-[7.5px] sm:text-[8px] text-slate-400 font-semibold">
                            <span className="text-slate-300 truncate max-w-[100px]">{nivelRotulo}</span>
                            <span>{unlockedCount + unlockedCursosCount} Conq.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SELETOR DE ABAS / FLUIDEZ OPERACIONAL (SEM BARRA DE ROLAGEM) */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200/60">
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* 1. PAINEL RÁPIDO */}
                    <button
                        onClick={() => { setHomeViewTab('cockpit'); playMenuSound(); }}
                        className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                            homeViewTab === 'cockpit'
                                ? 'bg-slate-700 text-white shadow-sm border border-slate-600/60'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs'
                        }`}
                    >
                        <Zap size={13} className={homeViewTab === 'cockpit' ? 'text-amber-400' : 'text-amber-500'} />
                        <span className="whitespace-nowrap">Painel Rápido</span>
                    </button>

                    {/* 2. CONQUISTAS */}
                    <button
                        onClick={() => { setHomeViewTab('conquistas'); playMenuSound(); }}
                        className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                            homeViewTab === 'conquistas'
                                ? 'bg-slate-700 text-white shadow-sm border border-slate-600/60'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs'
                        }`}
                    >
                        <Award size={13} className={homeViewTab === 'conquistas' ? 'text-amber-400' : 'text-amber-500'} />
                        <span className="whitespace-nowrap">Conquistas</span>
                        <span className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-slate-900 text-emerald-400 text-[9px] font-black leading-none ml-0.5">
                            {unlockedCount + unlockedCursosCount}
                        </span>
                    </button>

                    {/* 3. LINHA DO TEMPO */}
                    <button
                        onClick={() => { setHomeViewTab('linha_tempo'); playMenuSound(); }}
                        className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                            homeViewTab === 'linha_tempo'
                                ? 'bg-slate-700 text-white shadow-sm border border-slate-600/60'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs'
                        }`}
                    >
                        <Activity size={13} className={homeViewTab === 'linha_tempo' ? 'text-amber-400' : 'text-indigo-500'} />
                        <span className="whitespace-nowrap">Linha do Tempo</span>
                        {notifications && notifications.length > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black leading-none ml-0.5 animate-pulse">
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {/* 4. DEVOCIONAL IA */}
                    <button
                        onClick={() => { setHomeViewTab('devocional'); playMenuSound(); }}
                        className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                            homeViewTab === 'devocional'
                                ? 'bg-slate-700 text-white shadow-sm border border-slate-600/60'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs'
                        }`}
                    >
                        <Sparkles size={13} className={homeViewTab === 'devocional' ? 'text-amber-400' : 'text-indigo-500'} />
                        <span className="whitespace-nowrap">Devocional IA</span>
                    </button>
                </div>

                {/* 5. VISÃO COMPLETA */}
                <button
                    onClick={() => { 
                        setHomeViewTab(homeViewTab === 'tudo' ? 'cockpit' : 'tudo'); 
                        playMenuSound(); 
                    }}
                    className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                        homeViewTab === 'tudo'
                            ? 'bg-slate-700 text-white shadow-sm border border-slate-600/60'
                            : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-xs'
                    }`}
                    title={homeViewTab === 'tudo' ? 'Voltar ao modo Painel Rápido sem rolagem' : 'Exibir todas as seções continuamente'}
                >
                    <SlidersHorizontal size={13} className={homeViewTab === 'tudo' ? 'text-amber-400' : 'text-slate-400'} />
                    <span className="whitespace-nowrap">{homeViewTab === 'tudo' ? 'Modo Painel' : 'Visão Completa'}</span>
                </button>
            </div>

            {/* AÇÕES RÁPIDAS (RENDERIZADO NO PAINEL RÁPIDO E NA VISÃO COMPLETA) */}
            {(homeViewTab === 'cockpit' || homeViewTab === 'tudo') && (
            <div className={`grid grid-cols-3 sm:grid-cols-4 ${isProfessor ? 'md:grid-cols-8' : 'md:grid-cols-7'} gap-1.5 sm:gap-2.5`}>
                {allowedModulesHome.includes('portal_financas') && (
                    <button onClick={() => setView('portal_financas')} className="bg-white p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col items-center text-center group cursor-pointer">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-xs transform group-hover:-rotate-6"><DollarSign size={16} className="sm:w-5 sm:h-5"/></div>
                        <span className="font-black text-slate-800 text-[11px] sm:text-xs truncate max-w-full leading-tight">Dízimos</span>
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-full">Ofertar</span>
                    </button>
                )}
                {allowedModulesHome.includes('portal_carteirinha') && (
                    <button onClick={() => setView('portal_carteirinha')} className="bg-white p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col items-center text-center group cursor-pointer">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-indigo-50 text-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xs transform group-hover:scale-110"><QrCode size={16} className="sm:w-5 sm:h-5"/></div>
                        <span className="font-black text-slate-800 text-[11px] sm:text-xs truncate max-w-full leading-tight">Credencial</span>
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-full">Cartão</span>
                    </button>
                )}
                {canAccessFormacaoHome && allowedModulesHome.includes('portal_candidato') && (
                    <button onClick={() => setView('portal_candidato')} className="bg-gradient-to-br from-white to-emerald-50/50 p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all flex flex-col items-center text-center group cursor-pointer relative overflow-hidden">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs transform group-hover:scale-110"><GraduationCap size={16} className="sm:w-5 sm:h-5"/></div>
                        <span className="font-black text-slate-800 text-[11px] sm:text-xs truncate max-w-full leading-tight">Formação</span>
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-full">CGADB</span>
                    </button>
                )}
                {allowedModulesHome.includes('portal_tarefas') && (
                    <button onClick={() => setView('portal_tarefas')} className="bg-white p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col items-center text-center group cursor-pointer">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-amber-50 text-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-xs transform group-hover:rotate-6"><CheckSquare size={16} className="sm:w-5 sm:h-5"/></div>
                        <span className="font-black text-slate-800 text-[11px] sm:text-xs truncate max-w-full leading-tight">Escalas</span>
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-full">Tarefas</span>
                    </button>
                )}
                {allowedModulesHome.includes('portal_ebd') && (
                    <button onClick={() => setView('portal_ebd')} className="bg-white p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-center text-center group cursor-pointer">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-blue-50 text-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-xs transform group-hover:-translate-y-0.5"><BookOpenText size={16} className="sm:w-5 sm:h-5"/></div>
                        <span className="font-black text-slate-800 text-[11px] sm:text-xs truncate max-w-full leading-tight">Estudo EBD</span>
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-full">Lições</span>
                    </button>
                )}
                <button onClick={() => setView('portal_meet')} className="bg-gradient-to-br from-white to-emerald-50/60 p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all flex flex-col items-center text-center group cursor-pointer relative overflow-hidden">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs transform group-hover:scale-110"><Video size={16} className="sm:w-5 sm:h-5"/></div>
                    <span className="font-black text-slate-800 text-[11px] sm:text-xs truncate max-w-full leading-tight">Meet</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-full">Vídeo</span>
                </button>
                <button onClick={() => setView('portal_loja')} className="bg-white p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col items-center text-center group cursor-pointer">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-amber-50 text-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-xs transform group-hover:scale-110"><ShoppingBag size={16} className="sm:w-5 sm:h-5"/></div>
                    <span className="font-black text-slate-800 text-[11px] sm:text-xs truncate max-w-full leading-tight">Loja</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-full">Produtos</span>
                </button>
                {isMusicoHome && (
                    <button onClick={() => setView('portal_repertorio')} className="bg-white p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-violet-300 transition-all flex flex-col items-center text-center group cursor-pointer">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-violet-50 text-violet-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-xs transform group-hover:scale-110"><Music size={16} className="sm:w-5 sm:h-5"/></div>
                        <span className="font-black text-slate-800 text-[11px] sm:text-xs truncate max-w-full leading-tight">Repertório</span>
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-full">Cifras</span>
                    </button>
                )}
                {isProfessor && (
                    <button onClick={() => setView('portal_professor_ebd')} className="bg-white p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-violet-300 transition-all flex flex-col items-center text-center group cursor-pointer">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-violet-50 text-violet-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 group-hover:bg-violet-500 group-hover:text-white transition-all shadow-xs transform group-hover:scale-110"><GraduationCap size={16} className="sm:w-5 sm:h-5"/></div>
                        <span className="font-black text-slate-800 text-[11px] sm:text-xs truncate max-w-full leading-tight">Professor</span>
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-full">EBD</span>
                    </button>
                )}
            </div>
            )}

            {/* PAINEL RÁPIDO: WIDGETS COMPACTOS DE ALTA FLUIDEZ (ZERO SCROLL) */}
            {homeViewTab === 'cockpit' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 animate-entrance">
                    {/* WIDGET 1: RESUMO DE CONQUISTAS */}
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                                        <Award size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-xs sm:text-sm leading-tight">Conquistas & Distintivos</h4>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Engajamento Mensal</p>
                                    </div>
                                </div>
                                <span className="text-[10px] sm:text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                    {unlockedCount + unlockedCursosCount} desbloqueadas
                                </span>
                            </div>

                            {/* Mini visualizador de distintivos */}
                            <div className="grid grid-cols-5 gap-1 sm:gap-1.5 py-2">
                                {BADGE_DEFS.map((b) => {
                                    const isUnlocked = badges.includes(b.id);
                                    const IconComp = b.icon;
                                    return (
                                        <div 
                                            key={b.id} 
                                            title={`${b.title}: ${isUnlocked ? 'Desbloqueado!' : 'Pendente'}`}
                                            className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-center border transition-all ${
                                                isUnlocked 
                                                    ? 'bg-gradient-to-b from-amber-50 to-orange-50 border-amber-200 text-amber-700 shadow-xs' 
                                                    : 'bg-slate-50/70 border-slate-200/60 text-slate-300 opacity-60'
                                            }`}
                                        >
                                            <IconComp size={14} className={isUnlocked ? 'text-amber-600' : 'text-slate-400'} />
                                            <span className="text-[8px] sm:text-[9px] font-bold mt-0.5 truncate max-w-full leading-tight">{b.title}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">Nível: {nivelRotulo}</span>
                            <button
                                onClick={() => { setHomeViewTab('conquistas'); playMenuSound(); }}
                                className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                            >
                                <span>Ver Galeria</span>
                                <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>

                    {/* WIDGET 2: AVISOS & DEVOCIONAL RÁPIDO */}
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                                        <Sparkles size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-xs sm:text-sm leading-tight">Palavra & Avisos</h4>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Comunicação Pastoral</p>
                                    </div>
                                </div>
                                {notifications && notifications.length > 0 ? (
                                    <span className="text-[10px] sm:text-xs font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                                        {notifications.length} avisos
                                    </span>
                                ) : (
                                    <span className="text-[10px] sm:text-xs font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                        Em dia
                                    </span>
                                )}
                            </div>

                            {/* Conteúdo rápido */}
                            <div className="py-2">
                                {inboxItems.length > 0 ? (
                                    <div 
                                        onClick={inboxItems[0].action}
                                        className="p-2 sm:p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between gap-2"
                                    >
                                        <div className="min-w-0">
                                            <span className="text-[8px] sm:text-[9px] font-black uppercase text-indigo-600 tracking-wider block leading-none mb-0.5">{inboxItems[0].sender}</span>
                                            <p className="font-bold text-slate-800 text-xs truncate">{inboxItems[0].subject}</p>
                                        </div>
                                        <span className="text-[9px] sm:text-[10px] text-slate-400 shrink-0">{inboxItems[0].date === hoje ? 'Hoje' : formatDateLocal(inboxItems[0].date)}</span>
                                    </div>
                                ) : (
                                    <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0"/>
                                        <span>Sem pendências ou escalas conflitantes no momento!</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                                onClick={() => { setHomeViewTab('linha_tempo'); playMenuSound(); }}
                                className="text-[11px] font-black text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                            >
                                <Activity size={12} className="text-indigo-500" />
                                <span>Linha do Tempo</span>
                            </button>
                            <button
                                onClick={() => { setHomeViewTab('devocional'); playMenuSound(); }}
                                className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <Sparkles size={12} />
                                <span>Devocional IA</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SECÇÃO DE GAMIFICAÇÃO (CONQUISTAS 3D) --- */}
            {(homeViewTab === 'conquistas' || homeViewTab === 'tudo') && (
            <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden p-4 sm:p-6 md:p-8 relative animate-entrance">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-[100px] opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 sm:gap-4 mb-5 sm:mb-8 relative z-10">
                    <div>
                        <h3 className="font-black text-slate-800 text-lg sm:text-2xl flex items-center gap-2">
                            <Award size={22} className="text-amber-500 drop-shadow-md sm:w-7 sm:h-7 shrink-0"/> Galeria de Conquistas do Mês
                        </h3>
                        <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1">O seu envolvimento ministerial e acadêmico é reconhecido mensalmente.</p>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap items-center">
                        <span className="text-[9px] sm:text-[10px] font-black bg-slate-900 text-emerald-400 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full tracking-widest uppercase shadow-md w-fit">
                            {unlockedCount} / {BADGE_DEFS.length} Atividades
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-black bg-slate-900 text-amber-400 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full tracking-widest uppercase shadow-md w-fit">
                            {unlockedCursosCount} / {CURSOS_DISPONIVEIS.length} Cursos
                        </span>
                        <button
                            onClick={() => {
                                setIsMedalHistoryOpen(true);
                                playMenuSound();
                            }}
                            className="text-[9px] sm:text-[10px] font-black bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full tracking-widest uppercase shadow-md w-fit flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-indigo-500/20"
                        >
                            <History size={11} className="sm:w-3 sm:h-3" /> Histórico Completo
                        </button>
                    </div>
                </div>
                
                {/* SESSÃO 1: ATIVIDADES MINISTERIAIS */}
                <h4 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 sm:mb-4 border-b border-slate-100 pb-1.5 sm:pb-2 relative z-10">1. Atividades Ministeriais</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-4 md:gap-6 relative z-10 mb-6 sm:mb-10">
                    {BADGE_DEFS.map(b => {
                        const isUnlocked = badges.includes(b.id);
                        return (
                            <div key={b.id} className="relative group perspective-[1000px] cursor-default">
                                <div className={`relative flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-white shadow-md sm:shadow-xl transition-all duration-500 transform ${isUnlocked ? 'bg-white hover:-translate-y-1 sm:hover:-translate-y-2 hover:rotate-1' : 'bg-slate-50 opacity-80 grayscale'}`}>
                                    {isUnlocked && <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl opacity-10 blur-lg sm:blur-xl bg-gradient-to-br ${b.grad}`}></div>}
                                    <div className={`w-11 h-11 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-2 sm:mb-4 relative transition-transform duration-500 ${isUnlocked ? `bg-gradient-to-br ${b.grad} shadow-[inset_0_-3px_6px_rgba(0,0,0,0.3),_0_6px_12px_-3px_rgba(0,0,0,0.25)] sm:shadow-[inset_0_-6px_12px_rgba(0,0,0,0.3),_0_12px_20px_-5px_rgba(0,0,0,0.3)] group-hover:scale-110` : 'bg-gradient-to-br from-slate-200 to-slate-400 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.1)]'}`}>
                                        <div className="absolute top-0.5 left-1 sm:top-1 sm:left-2 w-3 h-2 sm:w-6 sm:h-5 bg-white/50 rounded-full blur-[1px] sm:blur-[2px] transform -rotate-45"></div>
                                        <div className={`absolute inset-[2px] sm:inset-[3px] rounded-full border-[1.5px] sm:border-[2px] md:border-[3px] ${isUnlocked ? 'border-white/30' : 'border-white/50'}`}></div>
                                        <b.icon className={`w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 ${isUnlocked ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]' : 'text-slate-500'}`} strokeWidth={2.5}/>
                                        {isUnlocked && <div className="absolute bottom-1 right-1.5 sm:bottom-2 sm:right-3 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full blur-[1px] animate-pulse"></div>}
                                    </div>
                                    <h4 className={`text-[9px] sm:text-xs font-black uppercase tracking-wider mb-0.5 sm:mb-1 text-center truncate w-full ${isUnlocked ? b.textColor : 'text-slate-600'}`}>{b.title}</h4>
                                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 text-center leading-tight line-clamp-2">{b.desc}</p>
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] rounded-2xl sm:rounded-3xl flex items-center justify-center flex-col gap-1 sm:gap-2 z-10 transition-opacity group-hover:bg-slate-900/20">
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform"><Lock size={12} className="sm:w-4 sm:h-4 text-slate-500"/></div>
                                            <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-slate-600 bg-white/90 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-xs">Pendente</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* SESSÃO 2: TROFÉUS ACADÊMICOS */}
                <h4 className="text-[10px] sm:text-xs font-black text-indigo-400 uppercase tracking-widest mb-2.5 sm:mb-4 border-b border-slate-100 pb-1.5 sm:pb-2 relative z-10 flex items-center gap-1.5 sm:gap-2">
                    <GraduationCap size={15} className="sm:w-4 sm:h-4"/> 2. Troféus Acadêmicos (Cursos Concluídos)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 relative z-10">
                    {CURSOS_DISPONIVEIS.map(curso => {
                        const isUnlocked = cursosConcluidosMes.some(c => c.id === curso.id);
                        const CIcon = curso.icon || GraduationCap;
                        return (
                            <div key={curso.id} className="relative group perspective-[1000px] cursor-default">
                                <div className={`relative flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-md sm:shadow-xl transition-all duration-500 transform ${isUnlocked ? 'bg-gradient-to-b from-indigo-50 to-white border-indigo-200 hover:-translate-y-1 sm:hover:-translate-y-2' : 'bg-slate-50 border-slate-200 opacity-80 grayscale'}`}>
                                    {isUnlocked && <div className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-20 blur-lg sm:blur-xl bg-gradient-to-br from-indigo-400 to-purple-600"></div>}
                                    
                                    {/* Troféu de Ouro/Prata */}
                                    <div className={`w-11 h-11 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4 relative transition-transform duration-500 ${isUnlocked ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2),_0_6px_12px_-3px_rgba(245,158,11,0.3)] sm:shadow-[inset_0_-6px_12px_rgba(0,0,0,0.2),_0_12px_20px_-5px_rgba(245,158,11,0.4)] group-hover:scale-110 rotate-3' : 'bg-gradient-to-br from-slate-200 to-slate-300 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.1)]'}`}>
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-t-xl sm:rounded-t-2xl"></div>
                                        <CIcon className={`w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 ${isUnlocked ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]' : 'text-slate-400'}`} strokeWidth={2}/>
                                        {isUnlocked && <Star className="w-3 h-3 sm:w-4 sm:h-4 absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-yellow-500 fill-yellow-400 animate-spin-slow drop-shadow-md"/>}
                                    </div>

                                    <h4 className={`text-[9px] sm:text-xs font-black uppercase tracking-wider mb-0.5 sm:mb-1 text-center truncate w-full ${isUnlocked ? 'text-indigo-800' : 'text-slate-600'}`}>{curso.title}</h4>
                                    
                                    {/* Progress Bar para cursos não concluídos mas iniciados */}
                                    {(!isUnlocked && getCourseProgress(curso.id, currentUser.modulos_concluidos) > 0) ? (
                                        <div className="w-full mt-1 px-1 sm:px-2 z-20">
                                            <div className="flex justify-between text-[7px] sm:text-[8px] font-bold text-slate-500 mb-0.5">
                                                <span>Progresso</span>
                                                <span>{getCourseProgress(curso.id, currentUser.modulos_concluidos)}%</span>
                                            </div>
                                            <div className="w-full h-1 sm:h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{width: `${getCourseProgress(curso.id, currentUser.modulos_concluidos)}%`}}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 text-center leading-tight line-clamp-2 z-20">{isUnlocked ? 'Concluído no mês' : curso.desc}</p>
                                    )}
                                    
                                    {!isUnlocked && getCourseProgress(curso.id, currentUser.modulos_concluidos) === 0 && (
                                        <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] rounded-2xl sm:rounded-3xl flex items-center justify-center z-10 transition-opacity">
                                            <div className="bg-white/90 p-1.5 sm:p-2 rounded-full shadow-xs"><Lock size={12} className="sm:w-3.5 sm:h-3.5 text-slate-400"/></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
            )}

            {/* TIMELINE DE ATIVIDADES E AVISOS (ABAS LINHA DE TEMPO OU TUDO) */}
            {(homeViewTab === 'linha_tempo' || homeViewTab === 'tudo') && (
                <div className={homeViewTab === 'tudo' ? "grid grid-cols-1 lg:grid-cols-3 gap-6 animate-entrance" : "w-full animate-entrance"}>
                    <div className={`${homeViewTab === 'tudo' ? 'lg:col-span-2' : 'w-full'} bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-200 p-4 sm:p-6 md:p-8`}>
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                <Activity size={20} className="text-indigo-500"/> Linha do Tempo
                            </h3>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">Atividades</span>
                        </div>

                        {notifications && notifications.length > 0 && (
                            <div className="mb-6 bg-indigo-50/60 transition-all border border-indigo-100/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-entrance">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shrink-0">
                                        <Bell size={18} className="animate-bounce" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wide">Alertas do Sistema</h4>
                                        <p className="text-slate-500 font-medium text-[11px] leading-tight">Você possui {notifications.length} notificações que demandam atenção.</p>
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        clearAllNotifications(notifications.map((n: any) => n.id));
                                        playMenuSound();
                                    }}
                                    className="text-[10px] font-black tracking-wider uppercase text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-100/50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                                >
                                    <Trash2 size={10} /> Dispensar Alertas
                                </button>
                            </div>
                        )}

                        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                            {inboxItems.length > 0 ? inboxItems.map((msg, i) => (
                                <div key={i} onClick={msg.action} className="relative pl-6 cursor-pointer group">
                                    <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${msg.isNew ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        <msg.icon size={12}/>
                                    </div>
                                    <div className={`p-4 rounded-2xl border transition-all ${msg.isNew ? 'bg-white border-indigo-200 shadow-md' : 'bg-slate-50/50 border-slate-100 hover:border-slate-300 hover:bg-white'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{msg.sender}</span>
                                            <span className="text-[10px] font-bold text-slate-400">{msg.date === hoje ? 'Hoje' : formatDateLocal(msg.date)}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm leading-snug">{msg.subject}</h4>
                                    </div>
                                </div>
                            )) : (
                                <div className="pl-6">
                                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                                        <CheckCircle size={32} className="mx-auto text-emerald-300 mb-2"/>
                                        <p className="font-bold text-slate-600 text-sm">Tudo tranquilo!</p>
                                        <p className="text-xs text-slate-500 mt-1">Nenhum aviso ou convocatória pendente no momento.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DEVOCIONAL NO MODO TUDO */}
                    {homeViewTab === 'tudo' && (
                        <div className="space-y-6 flex flex-col">
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl sm:rounded-[2rem] shadow-sm border border-indigo-100 p-6 relative overflow-hidden flex-1 flex flex-col">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Sparkles size={120}/></div>
                                <div className="relative z-10 flex-1 flex flex-col">
                                    <h3 className="font-black text-indigo-900 text-lg flex items-center gap-2 mb-1"><BookOpen size={20} className="text-indigo-500"/> Palavra Diária</h3>
                                    <p className="text-[10px] text-indigo-700/70 font-bold uppercase tracking-wider mb-6 border-b border-indigo-100 pb-4">Gerada pela IA com base no seu perfil</p>
                                    
                                    {!devocional && (
                                        <div className="flex-1 flex flex-col justify-center items-center text-center">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-indigo-400"><Sparkles size={28}/></div>
                                            <p className="text-sm font-bold text-indigo-800 mb-6">Precisa de uma palavra de encorajamento para iniciar o seu dia?</p>
                                            <Button onClick={gerarDevocional} disabled={loadingDev} variant="primary" className="w-full py-4 text-sm shadow-md shadow-indigo-200">
                                                {loadingDev ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>} ✨ Gerar Devocional
                                            </Button>
                                        </div>
                                    )}
                                    
                                    {loadingDev && (
                                        <div className="py-10 flex flex-col items-center justify-center text-indigo-500 flex-1">
                                            <Loader2 size={40} className="animate-spin mb-4"/>
                                            <p className="font-bold text-sm animate-pulse">Buscando inspiração divina...</p>
                                        </div>
                                    )}
                                    
                                    {devocional && (
                                        <div className="animate-entrance flex-1 flex flex-col">
                                            <div className="prose prose-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap flex-1">
                                                {devocional}
                                            </div>
                                            <div className="mt-6 flex gap-2 pt-4 border-t border-indigo-100/50">
                                                <button onClick={() => { copyToClipboard(devocional); if (typeof window !== 'undefined') alert('Copiado para a área de transferência!'); }} className="flex-1 text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-3 py-2.5 rounded-xl shadow-sm hover:bg-indigo-50 transition-colors flex justify-center items-center gap-1.5"><Copy size={16}/> Copiar</button>
                                                <button onClick={gerarDevocional} disabled={loadingDev} className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors px-3 py-2.5 flex items-center gap-1.5 hover:bg-indigo-50 rounded-xl border border-transparent"><RefreshCw size={16}/></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* DEVOCIONAL NO MODO ABA EXCLUSIVA */}
            {homeViewTab === 'devocional' && (
                <div className="w-full animate-entrance">
                    <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-2xl sm:rounded-[2rem] shadow-sm border border-indigo-100 p-6 md:p-10 relative overflow-hidden flex flex-col min-h-[400px]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Sparkles size={160}/></div>
                        <div className="relative z-10 flex-1 flex flex-col max-w-3xl mx-auto w-full">
                            <div className="flex items-center justify-between border-b border-indigo-100 pb-4 mb-6">
                                <div>
                                    <h3 className="font-black text-indigo-900 text-xl sm:text-2xl flex items-center gap-2 mb-1">
                                        <BookOpen size={24} className="text-indigo-600"/> Devocional e Palavra Diária
                                    </h3>
                                    <p className="text-xs text-indigo-700/80 font-bold">Inspirado e personalizado pelo assistente teológico para a sua edificação</p>
                                </div>
                                <button
                                    onClick={gerarDevocional}
                                    disabled={loadingDev}
                                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                                >
                                    {loadingDev ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                    <span>Renovar Palavra</span>
                                </button>
                            </div>
                            
                            {!devocional && !loadingDev && (
                                <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-md text-indigo-500">
                                        <Sparkles size={36}/>
                                    </div>
                                    <h4 className="text-lg font-black text-indigo-900 mb-2">Mensagem Personalizada do Dia</h4>
                                    <p className="text-sm font-medium text-slate-600 mb-6 max-w-md">Reflita nas Escrituras e receba uma orientação pastoral adaptada ao seu momento e função na igreja.</p>
                                    <Button onClick={gerarDevocional} disabled={loadingDev} variant="primary" className="py-3.5 px-8 text-sm shadow-lg shadow-indigo-200">
                                        ✨ Gerar Devocional Agora
                                    </Button>
                                </div>
                            )}
                            
                            {loadingDev && (
                                <div className="py-16 flex flex-col items-center justify-center text-indigo-600 flex-1">
                                    <Loader2 size={48} className="animate-spin mb-4"/>
                                    <p className="font-black text-base animate-pulse">Consultando as Sagradas Escrituras...</p>
                                    <p className="text-xs text-slate-400 mt-1">Gerando reflexão personalizada</p>
                                </div>
                            )}
                            
                            {devocional && (
                                <div className="animate-entrance flex-1 flex flex-col">
                                    <div className="prose prose-slate max-w-none text-slate-800 font-medium leading-relaxed whitespace-pre-wrap flex-1 bg-white/80 p-6 rounded-2xl border border-indigo-100 shadow-inner">
                                        {devocional}
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-indigo-100/60 justify-end">
                                        <button onClick={() => { copyToClipboard(devocional); if (typeof window !== 'undefined') alert('Copiado para a área de transferência!'); }} className="text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-4 py-2.5 rounded-xl shadow-xs hover:bg-indigo-50 transition-colors flex items-center gap-1.5 cursor-pointer">
                                            <Copy size={16}/> Copiar Mensagem
                                        </button>
                                        <button onClick={gerarDevocional} disabled={loadingDev} className="text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
                                            <RefreshCw size={16}/> Gerar Outra Palavra
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DETALHADO DO HISTÓRICO DE MEDALHAS */}
            <AnimatePresence>
            {isMedalHistoryOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center ${isMedalHistoryFullscreen ? 'p-0' : 'p-4 md:p-6'}`}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.85, rotate: -1, y: 15 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, rotate: 1, y: 15 }}
                        transition={{ type: "spring", stiffness: 220, damping: 22 }}
                        className={`bg-white overflow-hidden shadow-2xl border border-slate-100 flex flex-col text-left transition-all duration-300 ${isMedalHistoryFullscreen ? 'w-full h-full min-h-screen max-w-none rounded-none' : 'max-w-6xl w-full max-h-[90vh] rounded-[2rem]'}`}
                    >
                        
                        {/* Header do Modal */}
                        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 md:p-8 shrink-0 relative">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-450 rounded-full blur-[80px] opacity-20 -mr-12 -mt-12 pointer-events-none"></div>
                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 text-amber-400">
                                        <History size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-black tracking-tight">Histórico de Medalhas e Conquistas</h3>
                                        <p className="text-[11px] text-slate-300 font-medium">Linha do tempo e conquistas consolidadas de todos os meses anteriores.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            setIsMedalHistoryOpen(false);
                                            playMenuSound();
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white cursor-pointer"
                                        title="Minimizar"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsMedalHistoryFullscreen(!isMedalHistoryFullscreen);
                                            playMenuSound();
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white cursor-pointer"
                                        title={isMedalHistoryFullscreen ? "Restaurar Tamanho" : "Tela Cheia"}
                                    >
                                        {isMedalHistoryFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsMedalHistoryOpen(false);
                                            playMenuSound();
                                        }}
                                        className="p-2 hover:bg-red-500/80 rounded-full transition-colors text-slate-300 hover:text-white cursor-pointer"
                                        title="Fechar"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Placar / Stats Consolidados */}
                        <div className="bg-slate-50 border-b border-slate-150 p-5 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                            <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center gap-3 shadow-xs">
                                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                    <Award size={20} />
                                </div>
                                <div>
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block leading-none mb-1">Total de Medalhas</span>
                                    <span className="text-base font-black text-slate-800 font-mono">{totalHistoricalBadgesCount}</span>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center gap-3 shadow-xs">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <GraduationCap size={20} />
                                </div>
                                <div>
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block leading-none mb-1">Cursos Concluídos</span>
                                    <span className="text-base font-black text-slate-800 font-mono">{totalHistoricalCoursesCount}</span>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center gap-3 shadow-xs">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block leading-none mb-1">Meses Ativos</span>
                                    <span className="text-base font-black text-slate-800 font-mono">{totalActiveMonthsCount} / 12</span>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center gap-3 shadow-xs">
                                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                                    <Star size={20} />
                                </div>
                                <div>
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block leading-none mb-1">Perfil Eclesiástico</span>
                                    <span className="text-xs font-black text-slate-800 truncate block max-w-[130px]">{currentUser.cargo || 'Membro'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Filtros e Controle */}
                        <div className="px-6 md:px-8 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 bg-white">
                            {/* Seletor de Modo de Visualização */}
                            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                                <div className="flex gap-1 bg-slate-150 p-1 rounded-xl w-full sm:w-auto">
                                    <button
                                        onClick={() => {
                                            setMedalViewMode('timeline');
                                            playMenuSound();
                                        }}
                                        className={`flex-1 sm:flex-initial px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${medalViewMode === 'timeline' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        <Calendar size={12} /> Linha do Tempo
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMedalViewMode('categories');
                                            playMenuSound();
                                        }}
                                        className={`flex-1 sm:flex-initial px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${medalViewMode === 'categories' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        <Award size={12} /> Por Categoria
                                    </button>
                                </div>

                                {/* Filtro por mês - Apenas exibido em Linha do Tempo */}
                                {medalViewMode === 'timeline' && (
                                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                                        <button
                                            onClick={() => {
                                                setSelectedHistoryFilter('with_medals');
                                                playMenuSound();
                                            }}
                                            className={`flex-1 sm:flex-initial px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${selectedHistoryFilter === 'with_medals' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
                                        >
                                            Conquistas
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedHistoryFilter('all');
                                                playMenuSound();
                                            }}
                                            className={`flex-1 sm:flex-initial px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${selectedHistoryFilter === 'all' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
                                        >
                                            Todos 12 Meses
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <button
                                onClick={() => {
                                    let relatorio = `RELATÓRIO CONSOLIDADO DE MEDALHAS - ${currentUser.nome.toUpperCase()}\n`;
                                    relatorio += `Gerado em ${new Date().toLocaleDateString('pt-BR')}\n`;
                                    relatorio += `===============================================\n\n`;
                                    relatorio += `• Total de Medalhas de Atividades: ${totalHistoricalBadgesCount}\n`;
                                    relatorio += `• Total de Cursos Concluídos: ${totalHistoricalCoursesCount}\n`;
                                    relatorio += `• Meses de Engajamento Ativo: ${totalActiveMonthsCount} de 12 meses analisados\n\n`;
                                    relatorio += `DETALHAMENTO MÊS A MÊS:\n`;
                                    
                                    getPast12MonthsList().forEach(m => {
                                        const res = getMonthAchievements(m);
                                        if (res.badges.length > 0 || res.cursos.length > 0) {
                                            relatorio += `\n[${formatMonthLabel(m).toUpperCase()}]\n`;
                                            if (res.badges.length > 0) {
                                                relatorio += `  - Medalhas de Atividade: ${res.badges.map(bid => BADGE_DEFS.find(b => b.id === bid)?.title || bid).join(', ')}\n`;
                                            }
                                            if (res.cursos.length > 0) {
                                                relatorio += `  - Cursos Concluídos (Troféus): ${res.cursos.map(c => c.title).join(', ')}\n`;
                                            }
                                        }
                                    });
                                    navigator.clipboard.writeText(relatorio);
                                    if (typeof window !== 'undefined') alert('Relatório consolidado de conquistas copiado para a Área de Trabalho!');
                                }}
                                className="w-full sm:w-auto px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                            >
                                <Copy size={12} /> Copiar Relatório Completo
                            </button>
                        </div>

                        {/* Lista Principal de Conquistas */}
                        <div key={isMedalHistoryFullscreen ? 'full' : 'window'} className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 portal-membro-historico-leitura">
                            
                            {/* VISUALIZAÇÃO POR CATEGORIA */}
                            {medalViewMode === 'categories' ? (
                                <div className="space-y-6">
                                    {/* Categoria Financeiro */}
                                    <div className="bg-white border border-slate-200 rounded-[1.5rem] p-5 md:p-6 shadow-xs text-slate-800">
                                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                                <Award size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">🏦 Categoria Financeiro</h4>
                                                <p className="text-[10px] text-slate-500 font-medium">Reconhecimento pela fidelidade em dízimos, ofertas e suporte missionário voluntário.</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {getMedalsByCategory()['Financeiro'].map((m, idx) => {
                                                const totalTimesWon = m.monthsWon.length;
                                                const isUnlocked = totalTimesWon > 0;
                                                return (
                                                    <div 
                                                        key={m.id} 
                                                        className={`flex gap-3.5 p-4 rounded-2xl border transition-all ${
                                                            isUnlocked 
                                                                ? 'bg-white border-slate-200 hover:border-slate-300 shadow-3xs' 
                                                                : 'bg-slate-50/10 border-slate-100 opacity-40 grayscale'
                                                        }`}
                                                    >
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.3, rotate: -45 }}
                                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                            transition={{ type: 'spring', stiffness: 220, damping: 15, delay: idx * 0.08 }}
                                                            whileHover={isUnlocked ? { scale: 1.15, rotate: 8 } : {}}
                                                            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                                                                isUnlocked ? `bg-gradient-to-br ${m.grad} text-white` : 'bg-slate-200 text-slate-500'
                                                            }`}
                                                        >
                                                            <m.icon size={20} strokeWidth={2.5} />
                                                        </motion.div>
                                                        
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h5 className={`text-[11px] font-black uppercase tracking-wide ${isUnlocked ? m.textColor : 'text-slate-500'}`}>{m.title}</h5>
                                                                {isUnlocked && (
                                                                    <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                                                        Conquistada {totalTimesWon}x
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-tight">{m.desc}</p>
                                                            
                                                            <div className="mt-2.5">
                                                                <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider mb-1">Meses de Conquista</p>
                                                                {isUnlocked ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {m.monthsWon.map((mStr) => (
                                                                            <span key={mStr} className="bg-slate-50 border border-slate-150 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">
                                                                                {formatMonthLabel(mStr).split(' de ')[0]}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[8px] font-bold text-slate-400 italic">Sem registros nos últimos 12 meses.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Categoria EBD */}
                                    <div className="bg-white border border-slate-200 rounded-[1.5rem] p-5 md:p-6 shadow-xs text-slate-800">
                                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                                <BookOpenText size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">📚 Categoria Escola Dominical (EBD)</h4>
                                                <p className="text-[10px] text-slate-500 font-medium">Reconhecimento pelo empenho de estudo bíblico e conclusão de lições da Escola Dominical.</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {getMedalsByCategory()['EBD'].map((m, idx) => {
                                                const totalTimesWon = m.monthsWon.length;
                                                const isUnlocked = totalTimesWon > 0;
                                                return (
                                                    <div 
                                                        key={m.id} 
                                                        className={`flex gap-3.5 p-4 rounded-2xl border transition-all ${
                                                            isUnlocked 
                                                                ? 'bg-white border-slate-200 hover:border-slate-300 shadow-3xs' 
                                                                : 'bg-slate-50/10 border-slate-100 opacity-40 grayscale'
                                                        }`}
                                                    >
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.3, rotate: -45 }}
                                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                            transition={{ type: 'spring', stiffness: 220, damping: 15, delay: idx * 0.08 }}
                                                            whileHover={isUnlocked ? { scale: 1.15, rotate: 8 } : {}}
                                                            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                                                                isUnlocked ? `bg-gradient-to-br ${m.grad} text-white` : 'bg-slate-200 text-slate-500'
                                                            }`}
                                                        >
                                                            <m.icon size={20} strokeWidth={2.5} />
                                                        </motion.div>
                                                        
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h5 className={`text-[11px] font-black uppercase tracking-wide ${isUnlocked ? m.textColor : 'text-slate-500'}`}>{m.title}</h5>
                                                                {isUnlocked && (
                                                                    <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                                                        Conquistada {totalTimesWon}x
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-tight">{m.desc}</p>
                                                            
                                                            <div className="mt-2.5">
                                                                <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider mb-1">Meses de Conquista</p>
                                                                {isUnlocked ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {m.monthsWon.map((mStr) => (
                                                                            <span key={mStr} className="bg-slate-50 border border-slate-150 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">
                                                                                {formatMonthLabel(mStr).split(' de ')[0]}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[8px] font-bold text-slate-400 italic">Sem lições concluídas nos últimos 12 meses.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Categoria Social & Comunhão */}
                                    <div className="bg-white border border-slate-200 rounded-[1.5rem] p-5 md:p-6 shadow-xs text-slate-800">
                                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                                            <div className="p-2.5 bg-fuchsia-50 text-fuchsia-700 rounded-xl">
                                                <HeartHandshake size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">🤝 Categoria Social & Comunhão</h4>
                                                <p className="text-[10px] text-slate-500 font-medium">Reconhecimento pela dedicação no cumprimento de escalas, tarefas e na fraternidade ativa no mural.</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {getMedalsByCategory()['Social'].map((m, idx) => {
                                                const totalTimesWon = m.monthsWon.length;
                                                const isUnlocked = totalTimesWon > 0;
                                                return (
                                                    <div 
                                                        key={m.id} 
                                                        className={`flex gap-3.5 p-4 rounded-2xl border transition-all ${
                                                            isUnlocked 
                                                                ? 'bg-white border-slate-200 hover:border-slate-300 shadow-3xs' 
                                                                : 'bg-slate-50/10 border-slate-100 opacity-40 grayscale'
                                                        }`}
                                                    >
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.3, rotate: -45 }}
                                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                            transition={{ type: 'spring', stiffness: 220, damping: 15, delay: idx * 0.08 }}
                                                            whileHover={isUnlocked ? { scale: 1.15, rotate: 8 } : {}}
                                                            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                                                                isUnlocked ? `bg-gradient-to-br ${m.grad} text-white` : 'bg-slate-200 text-slate-500'
                                                            }`}
                                                        >
                                                            <m.icon size={20} strokeWidth={2.5} />
                                                        </motion.div>
                                                        
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h5 className={`text-[11px] font-black uppercase tracking-wide ${isUnlocked ? m.textColor : 'text-slate-500'}`}>{m.title}</h5>
                                                                {isUnlocked && (
                                                                    <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                                                        Conquistada {totalTimesWon}x
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 leading-tight">{m.desc}</p>
                                                            
                                                            <div className="mt-2.5">
                                                                <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider mb-1">Meses de Conquista</p>
                                                                {isUnlocked ? (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {m.monthsWon.map((mStr) => (
                                                                            <span key={mStr} className="bg-slate-50 border border-slate-150 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">
                                                                                {formatMonthLabel(mStr).split(' de ')[0]}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[8px] font-bold text-slate-400 italic">Sem registros eclesiais ativos nos últimos 12 meses.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Categoria Cursos & Teologia */}
                                    <div className="bg-white border border-slate-200 rounded-[1.5rem] p-5 md:p-6 shadow-xs text-slate-800">
                                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                                            <div className="p-2.5 bg-violet-50 text-violet-700 rounded-xl">
                                                <GraduationCap size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">🎓 Categoria Acadêmica & Teologia</h4>
                                                <p className="text-[10px] text-slate-500 font-medium">Troféus e títulos de excelência teológica outorgados por conclusão de questionários na Universidade.</p>
                                            </div>
                                        </div>
                                        
                                        {totalHistoricalCoursesCount > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                                {(currentUser.cursos_concluidos || []).map((c: any, idx: number) => {
                                                    const cursoOriginal = CURSOS_DISPONIVEIS.find(cur => cur.id === c.id);
                                                    const CIcon = cursoOriginal?.icon || GraduationCap;
                                                    return (
                                                        <div key={c.id || idx} className="flex items-center gap-3.5 bg-slate-50 border border-slate-150 p-3 rounded-2xl shadow-3xs">
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.3, rotate: -45 }}
                                                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                                transition={{ type: 'spring', stiffness: 220, damping: 15, delay: idx * 0.08 }}
                                                                whileHover={{ scale: 1.15, rotate: 8 }}
                                                                className="w-11 h-11 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shrink-0 shadow-md border-2 border-white"
                                                            >
                                                                <Star size={18} className="fill-slate-950 text-slate-950" />
                                                            </motion.div>
                                                            <div className="min-w-0">
                                                                <h5 className="text-[10px] font-black text-slate-850 uppercase tracking-wide truncate">{c.title || cursoOriginal?.title}</h5>
                                                                <p className="text-[8px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">Outorgado em {formatMonthLabel(c.mes)}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                                <GraduationCap size={32} className="mx-auto text-slate-300 mb-2" />
                                                <p className="text-xs font-bold text-slate-600">Nenhum Título Concedido</p>
                                                <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto">Explore e conclua as lições oficiais na Universidade Teológica para obter seus troféus.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {getPast12MonthsList()
                                        .map(m => {
                                            const ach = getMonthAchievements(m);
                                            return {
                                                monthStr: m,
                                                ...ach
                                            };
                                        })
                                        .filter(item => {
                                            if (selectedHistoryFilter === 'with_medals') {
                                                return item.badges.length > 0 || item.cursos.length > 0;
                                            }
                                            return true;
                                        })
                                        .map((item) => {
                                            const label = formatMonthLabel(item.monthStr);
                                            const isCurrent = item.monthStr === currentMonthStr;
                                            const totalBadgesThisMonth = item.badges.length;
                                            const totalCursosThisMonth = item.cursos.length;

                                            return (
                                                <div key={item.monthStr} className={`border rounded-[1.5rem] p-5 md:p-6 transition-all ${isCurrent ? 'bg-indigo-50/10 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                                                        <div>
                                                            <span className="flex items-center gap-2">
                                                                <h4 className="text-base font-black text-slate-850">{label}</h4>
                                                                {isCurrent && (
                                                                    <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md animate-pulse">
                                                                        Mês Atual
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 font-mono uppercase">Ref: {item.monthStr}</p>
                                                        </div>
                                                        
                                                        <div className="flex gap-1.5">
                                                            <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-full ${totalBadgesThisMonth > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                                                                {totalBadgesThisMonth} / 5 Atividades
                                                            </span>
                                                            {totalCursosThisMonth > 0 && (
                                                                <span className="text-[8px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-0.5">
                                                                    <Star size={8} className="fill-amber-500 text-amber-500" />
                                                                    {totalCursosThisMonth} {totalCursosThisMonth === 1 ? 'Curso' : 'Cursos'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider mb-2">Medalhas Atribuídas</p>
                                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                                                {BADGE_DEFS.map((b, bIdx) => {
                                                                    const isUnlocked = item.badges.includes(b.id);
                                                                    return (
                                                                        <motion.div 
                                                                            key={b.id} 
                                                                            initial={{ opacity: 0, scale: 0.3, rotate: -45 }}
                                                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                                            transition={{ type: 'spring', stiffness: 240, damping: 16, delay: bIdx * 0.04 }}
                                                                            whileHover={isUnlocked ? { scale: 1.15, rotate: 6 } : {}}
                                                                            className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                                                                                isUnlocked 
                                                                                    ? 'bg-white border-slate-200 shadow-2xs hover:shadow-sm' 
                                                                                    : 'bg-slate-50/50 border-slate-100 opacity-40 grayscale'
                                                                            }`}
                                                                        >
                                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                                                isUnlocked 
                                                                                    ? `bg-gradient-to-br ${b.grad} text-white` 
                                                                                    : 'bg-slate-200 text-slate-500'
                                                                            }`}>
                                                                                <b.icon size={14} strokeWidth={2.5} />
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <h5 className={`text-[9px] font-black uppercase tracking-wide truncate ${isUnlocked ? b.textColor : 'text-slate-500'}`}>{b.title}</h5>
                                                                                <p className="text-[8px] font-bold text-slate-400 truncate leading-none mt-0.5">{isUnlocked ? 'Conquistado' : 'Bloqueado'}</p>
                                                                            </div>
                                                                        </motion.div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {totalCursosThisMonth > 0 && (
                                                            <div className="pt-3 border-t border-slate-100">
                                                                <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider mb-2">Cursos Concluídos (Títulos)</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {item.cursos.map((c: any, cIdx: number) => {
                                                                        const cursoOriginal = CURSOS_DISPONIVEIS.find(cur => cur.id === c.id);
                                                                        const CIcon = cursoOriginal?.icon || GraduationCap;
                                                                        return (
                                                                            <motion.div 
                                                                                key={c.id || cIdx} 
                                                                                initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
                                                                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                                                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: cIdx * 0.05 }}
                                                                                whileHover={{ scale: 1.12, rotate: 6 }}
                                                                                className="inline-flex items-center gap-2 bg-amber-50/50 border border-amber-200/50 p-2 px-3 rounded-xl cursor-pointer"
                                                                            >
                                                                                <div className="w-6 h-6 bg-amber-400 text-slate-900 rounded-lg flex items-center justify-center shrink-0">
                                                                                    <CIcon size={12} />
                                                                                </div>
                                                                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide">{c.title || cursoOriginal?.title}</span>
                                                                            </motion.div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>
                                            );
                                        })}

                                    {getPast12MonthsList()
                                        .map(m => getMonthAchievements(m))
                                        .filter(item => {
                                            if (selectedHistoryFilter === 'with_medals') {
                                                return item.badges.length > 0 || item.cursos.length > 0;
                                            }
                                            return true;
                                        }).length === 0 && (
                                            <div className="text-center py-12 text-slate-400">
                                                <Award size={48} className="mx-auto text-slate-200 mb-3 animate-pulse" />
                                                <p className="font-extrabold text-sm text-slate-700">Nenhum Registro de Medalhas nos Últimos 12 Meses</p>
                                                <p className="text-xs text-slate-500 mt-1">Realize contribuições, participe da EBD, interaja no mural e cumpra escalas para desbloquear medalhas!</p>
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>

                        {/* Footer do Modal */}
                        <div className="bg-slate-50 border-t border-slate-150 p-4 shrink-0 flex justify-end">
                            <button
                                onClick={() => {
                                    setIsMedalHistoryOpen(false);
                                    playMenuSound();
                                }}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                            >
                                Fechar Histórico
                            </button>
                        </div>

                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default PortalHome;
export { PortalHome };
