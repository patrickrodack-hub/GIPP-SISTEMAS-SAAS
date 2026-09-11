import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Home, Trophy, Gift, BookOpen, User, ArrowLeft, MoreHorizontal,
    Zap, Activity, CheckCircle2, ChevronRight, Sparkles, Award,
    HeartHandshake, Globe, BookOpenText, ShieldCheck, Flame, Compass,
    DollarSign, Calendar, CheckSquare, MessageSquare, QrCode, 
    Smartphone, Monitor, Crown, X, Loader2, RefreshCw
} from 'lucide-react';

interface PortalCyberLayoutProps {
    user: any;
    db: any;
    setView: (view: string) => void;
    onExitTheme?: () => void;
    callGeminiAI?: (prompt: string) => Promise<string>;
}

export const PortalCyberLayout: React.FC<PortalCyberLayoutProps> = ({
    user,
    db,
    setView,
    onExitTheme,
    callGeminiAI
}) => {
    // Current active screen in the Cyber App experience
    // 'banner': Tela 1 da foto ("Unlock the Best of Yourself")
    // 'home': Tela 2 da foto ("Dashboard com MyCredits, Today's Target, Statistics e Quick Actions")
    // 'leaderboard': Tela 3 da foto ("Leaderboard com Pódio 3D e Ranking Geral/Regional")
    // 'rewards': Tela de Conquistas e Medalhas
    // 'store': Cursos e Biblioteca Bíblica
    // 'profile': Carteirinha e Dados do Membro
    const [currentScreen, setCurrentScreen] = useState<'banner' | 'home' | 'leaderboard' | 'rewards' | 'store' | 'profile'>('home');
    const [rankingScope, setRankingScope] = useState<'global' | 'regional'>('global');
    const [rankingPeriod, setRankingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [viewFrameMode, setViewFrameMode] = useState<'phone' | 'fluid'>('phone');
    
    // Devotional / Boost modal
    const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
    const [boostDevocional, setBoostDevocional] = useState('');
    const [loadingBoost, setLoadingBoost] = useState(false);
    const [hasBoostedToday, setHasBoostedToday] = useState(false);

    const currentUser = (db?.membros || []).find((m: any) => m.id === user?.id) || user || {};

    // Dynamic credits / talent points calculation based on real engagement
    const memberCredits = useMemo(() => {
        let pts = 1200; // Base active member points
        const myDizimos = (db?.financeiro || []).filter((f: any) => f.membro_id === currentUser.id && f.status === 'pago');
        pts += myDizimos.length * 250;

        const myTasks = (db?.tarefas || []).filter((t: any) => t.status === 'Concluido' && (t.equipe || []).some((e: any) => e.id === currentUser.id || e.nome === currentUser.nome));
        pts += myTasks.length * 180;

        const myCourses = (currentUser.cursos_concluidos || []).length;
        pts += myCourses * 300;

        const isEbd = (currentUser.estudos_ebd_concluidos || []).length;
        pts += isEbd * 150;

        const myMural = (db?.mural || []).filter((m: any) => m.autor_id === currentUser.id);
        pts += myMural.length * 60;

        if (hasBoostedToday) pts += 50;

        return pts;
    }, [db, currentUser, hasBoostedToday]);

    // Format thousands (e.g. 2,368)
    const formattedCredits = memberCredits.toLocaleString('en-US');

    // Generate ranked members for the 3D Leaderboard
    const rankedMembers = useMemo(() => {
        const list = (db?.membros || []).map((m: any, idx: number) => {
            let score = 14 + ((idx * 7) % 11);
            if (m.id === currentUser.id) {
                score = Math.max(15, Math.floor(memberCredits / 120));
            }
            // Add variety based on real status
            if (m.cargo?.toLowerCase().includes('pastor') || m.cargo?.toLowerCase().includes('lider')) {
                score += 8;
            }
            return {
                id: m.id || `m_${idx}`,
                nome: m.nome || 'Membro da Igreja',
                cargo: m.cargo || 'Membro',
                foto: m.foto || m.fotoUrl || null,
                score,
                isCurrent: m.id === currentUser.id,
                flag: ['🇧🇷', '🇵🇹', '🇺🇸', '🇦🇴', '🇩🇪', '🇨🇿', '🇪🇸'][idx % 7]
            };
        });

        // Ensure at least 6 members for rich leaderboard view
        if (list.length < 6) {
            const defaults = [
                { id: 'adison', nome: 'Adison Press', cargo: 'Líder de Louvor', foto: null, score: 20, isCurrent: false, flag: '🇨🇦' },
                { id: 'ruben', nome: 'Ruben Gerdt', cargo: 'Professor EBD', foto: null, score: 17, isCurrent: false, flag: '🇩🇪' },
                { id: 'jakob', nome: 'Jakob Levin', cargo: 'Diácono Ativo', foto: null, score: 12, isCurrent: false, flag: '🇨🇿' },
                { id: 'isabel', nome: 'Isabel Diaz', cargo: 'Ministério de Mulheres', foto: null, score: 10, isCurrent: false, flag: '🇪🇸' },
                { id: 'marcos', nome: 'Marcos Silveira', cargo: 'Membro Ativo', foto: null, score: 9, isCurrent: false, flag: '🇧🇷' }
            ];
            defaults.forEach(d => {
                if (!list.some(m => m.nome === d.nome)) list.push(d);
            });
        }

        // Sort descending by score
        list.sort((a, b) => b.score - a.score);
        return list;
    }, [db, currentUser, memberCredits]);

    // Top 3 for 3D Podium
    const podiumFirst = rankedMembers[0];
    const podiumSecond = rankedMembers[1];
    const podiumThird = rankedMembers[2];
    const restOfLeaderboard = rankedMembers.slice(3);

    // Devotional / Boost trigger
    const handleTriggerBoost = async () => {
        setIsBoostModalOpen(true);
        if (!boostDevocional) {
            setLoadingBoost(true);
            try {
                if (callGeminiAI) {
                    const prompt = `Escreva um devocional cristão inspirador e motivacional curto (máximo 2 parágrafos) com tom de crescimento espiritual, fé e superação para o membro ${currentUser.nome?.split(' ')[0] || 'irmão(ã)'}. Inclua 1 versículo bíblico chave.`;
                    const res = await callGeminiAI(prompt);
                    setBoostDevocional(res);
                } else {
                    setBoostDevocional(`"Porque sou eu que conheço os planos que tenho para vocês", diz o Senhor, "planos de fazê-los prosperar e não de lhes causar dano, planos de dar-lhes esperança e um futuro." - Jeremias 29:11\n\nQue a sua jornada diária seja repleta de vitória e sabedoria espiritual.`);
                }
            } catch {
                setBoostDevocional(`"O Senhor é a minha força e o meu escudo; nele o meu coração confia, e dele recebo ajuda." - Salmos 28:7\n\nContinue firme em oração e dedicação ministerial.`);
            } finally {
                setLoadingBoost(false);
                setHasBoostedToday(true);
            }
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#091115] text-slate-100 flex flex-col items-center justify-start py-2 sm:py-4 px-2 sm:px-4 font-sans select-none overflow-x-hidden">
            
            {/* TOP BAR DE CONTROLE E NAVEGAÇÃO ENTRE AS TELAS DA FOTO */}
            <header className="w-full max-w-5xl mb-3 flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0F1C22]/90 border border-cyan-500/20 rounded-2xl backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-50">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-[#091115] font-black shadow-[0_0_12px_rgba(56,225,237,0.4)]">
                        <Zap size={18} className="fill-current" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black tracking-wider text-cyan-300 uppercase">Tema Portal: Cyber Faith ⚡</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold">App Edition</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Layout inspirado no conceito esportivo e gamificado dark teal</p>
                    </div>
                </div>

                {/* Seletor rápido das 3 Telas da Imagem */}
                <div className="flex items-center gap-1.5 bg-[#091216] p-1 rounded-xl border border-cyan-500/20">
                    <button
                        onClick={() => setCurrentScreen('banner')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${currentScreen === 'banner' ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(56,225,237,0.4)]' : 'text-slate-400 hover:text-white'}`}
                        title="Tela 1 da foto: Boas-vindas / Unlock Yourself"
                    >
                        1. Welcome
                    </button>
                    <button
                        onClick={() => setCurrentScreen('home')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${currentScreen === 'home' ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(56,225,237,0.4)]' : 'text-slate-400 hover:text-white'}`}
                        title="Tela 2 da foto: Dashboard Principal com MyCredits & Target"
                    >
                        2. Dashboard
                    </button>
                    <button
                        onClick={() => setCurrentScreen('leaderboard')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${currentScreen === 'leaderboard' ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(56,225,237,0.4)]' : 'text-slate-400 hover:text-white'}`}
                        title="Tela 3 da foto: Leaderboard com Pódio 3D"
                    >
                        3. Leaderboard
                    </button>
                </div>

                {/* Controles de Modo (Smartphone / Fluido) e Saída */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewFrameMode(viewFrameMode === 'phone' ? 'fluid' : 'phone')}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
                        title={viewFrameMode === 'phone' ? 'Expandir para Tela Cheia' : 'Enquadrar em Smartphone'}
                    >
                        {viewFrameMode === 'phone' ? <Monitor size={14} /> : <Smartphone size={14} />}
                        <span className="hidden sm:inline">{viewFrameMode === 'phone' ? 'Tela Cheia' : 'Modo Celular'}</span>
                    </button>

                    {onExitTheme && (
                        <button
                            onClick={onExitTheme}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition-all flex items-center gap-1"
                            title="Voltar ao visual clássico do Portal"
                        >
                            <X size={14} />
                            <span className="hidden sm:inline">Tema Padrão</span>
                        </button>
                    )}
                </div>
            </header>

            {/* CONTAINER PRINCIPAL (MOLDURA DE SMARTPHONE OU DISPLAY EXPANDIDO) */}
            <main className={`relative transition-all duration-300 ${
                viewFrameMode === 'phone'
                    ? 'w-full max-w-[420px] rounded-[48px] border-[8px] border-[#18262D] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_40px_rgba(56,225,237,0.15)] overflow-hidden bg-[#0A1418] min-h-[840px] flex flex-col'
                    : 'w-full max-w-5xl rounded-3xl border border-cyan-500/20 shadow-2xl overflow-hidden bg-[#0A1418] min-h-[840px] flex flex-col'
            }`}>
                
                {/* NOTCH / TOP STATUS BAR DO SMARTPHONE (Idêntico à foto: 9:41, wifi, bateria) */}
                <div className="w-full px-7 pt-3 pb-2 flex items-center justify-between text-xs text-slate-300 font-semibold shrink-0 z-30 select-none bg-gradient-to-b from-[#0A1418] to-transparent">
                    <span>9:41</span>
                    {/* Notch capsule */}
                    <div className="w-20 h-4 bg-[#142228] rounded-full mx-auto hidden sm:block border border-slate-800" />
                    <div className="flex items-center gap-1.5 text-[11px]">
                        <span>5G</span>
                        <div className="w-5 h-2.5 rounded-xs border border-slate-300 p-0.5 flex items-center">
                            <div className="w-full h-full bg-cyan-400 rounded-2xs" />
                        </div>
                    </div>
                </div>

                {/* CORPO DINÂMICO CONFORME A TELA ATIVA */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-20 pb-24">
                    <AnimatePresence mode="wait">

                        {/* ========================================================= */}
                        {/* TELA 1: WELCOME / ONBOARDING ("Unlock the Best of Yourself") */}
                        {/* ========================================================= */}
                        {currentScreen === 'banner' && (
                            <motion.div
                                key="screen_banner"
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.3 }}
                                className="w-full flex flex-col justify-between min-h-[760px] p-6 relative overflow-hidden"
                            >
                                {/* Imagem de Fundo Estilizada (Atmosfera Escura, Montanha, Relâmpago Ciano & Silhuetas) */}
                                <div className="absolute inset-0 z-0 bg-[#0A1418]">
                                    {/* Gradiente de iluminação radial */}
                                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />
                                    
                                    {/* Ilustração artística com silhuetas de atletas/fiéis e relâmpago estilizado */}
                                    <svg viewBox="0 0 400 650" className="w-full h-full object-cover opacity-80" preserveAspectRatio="xMidYMid slice">
                                        <defs>
                                            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#081014" />
                                                <stop offset="35%" stopColor="#0F242C" />
                                                <stop offset="65%" stopColor="#08151A" />
                                                <stop offset="100%" stopColor="#0A1418" />
                                            </linearGradient>
                                            <linearGradient id="cyanGlow" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#38E1ED" />
                                                <stop offset="100%" stopColor="#0891B2" />
                                            </linearGradient>
                                            <filter id="lightningGlow">
                                                <feGaussianBlur stdDeviation="3" result="blur" />
                                                <feMerge>
                                                    <feMergeNode in="blur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        <rect width="400" height="650" fill="url(#skyGrad)" />
                                        
                                        {/* Relâmpago estilizado ciano no céu (como na foto) */}
                                        <path 
                                            d="M 330,80 L 315,125 L 328,135 L 305,190 L 312,195 L 290,250" 
                                            stroke="#38E1ED" 
                                            strokeWidth="2.5" 
                                            fill="none" 
                                            filter="url(#lightningGlow)" 
                                            opacity="0.9"
                                        />
                                        <path 
                                            d="M 315,125 L 295,150" 
                                            stroke="#67E8F9" 
                                            strokeWidth="1.2" 
                                            fill="none" 
                                            opacity="0.6"
                                        />

                                        {/* Montanhas ao fundo */}
                                        <path d="M 0,380 Q 90,300 200,340 T 400,290 L 400,650 L 0,650 Z" fill="#0E1D24" />
                                        <path d="M 0,420 Q 120,360 250,400 T 400,370 L 400,650 L 0,650 Z" fill="#0A161B" />
                                        
                                        {/* Silhueta das pessoas correndo juntas em direção ao horizonte */}
                                        {/* Pessoa 1 */}
                                        <circle cx="150" cy="380" r="10" fill="#070E12" />
                                        <path d="M 148,390 L 155,420 L 140,460 M 155,420 L 170,455 M 145,400 L 130,420 M 155,400 L 170,415" stroke="#070E12" strokeWidth="6" strokeLinecap="round" />
                                        
                                        {/* Pessoa 2 (centro) */}
                                        <circle cx="205" cy="390" r="8" fill="#070E12" />
                                        <path d="M 203,398 L 208,422 L 198,455 M 208,422 L 218,450 M 200,405 L 190,420 M 208,405 L 220,418" stroke="#070E12" strokeWidth="5" strokeLinecap="round" />
                                        
                                        {/* Pessoa 3 */}
                                        <circle cx="255" cy="375" r="10" fill="#070E12" />
                                        <path d="M 253,385 L 260,415 L 245,455 M 260,415 L 275,450 M 250,395 L 235,415 M 260,395 L 275,410" stroke="#070E12" strokeWidth="6" strokeLinecap="round" />

                                        {/* Trilha de rochas com reflexo neon ciano */}
                                        <ellipse cx="200" cy="480" rx="160" ry="25" fill="#132B36" opacity="0.4" />
                                    </svg>
                                    
                                    {/* Gradiente escuro para fusão com os textos */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1418] via-[#0A1418]/60 to-transparent" />
                                </div>

                                {/* Botão Pular / Acessar Rápido no topo */}
                                <div className="relative z-10 flex justify-end">
                                    <button 
                                        onClick={() => setCurrentScreen('home')}
                                        className="text-xs font-bold text-slate-400 hover:text-cyan-300 transition-colors uppercase tracking-widest px-3 py-1 bg-black/30 rounded-full border border-white/10"
                                    >
                                        Pular
                                    </button>
                                </div>

                                {/* Conteúdo Inferior: Indicador de Paginação + Título + Subtítulo + Botão */}
                                <div className="relative z-10 flex flex-col items-center text-center mt-auto pb-4">
                                    {/* Indicadores de slides (Dots) como na foto */}
                                    <div className="flex items-center gap-1.5 mb-6">
                                        <div className="w-2 h-1.5 bg-slate-600 rounded-full" />
                                        <div className="w-7 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(56,225,237,0.8)]" />
                                        <div className="w-2 h-1.5 bg-slate-600 rounded-full" />
                                    </div>

                                    {/* Título de Impacto ("Unlock the Best of Yourself") */}
                                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
                                        Unlock the Best of <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                                            Yourself
                                        </span>
                                    </h1>

                                    {/* Subtítulo Inspirador */}
                                    <p className="text-slate-400 text-xs sm:text-sm max-w-xs font-medium leading-relaxed mb-8">
                                        Desperte o seu potencial ministerial e viva a melhor jornada de fé, comunhão e serviço no Reino de Deus!
                                    </p>

                                    {/* Botão Ciano Neon ("Start now") */}
                                    <button
                                        onClick={() => setCurrentScreen('home')}
                                        className="w-full max-w-xs py-4 px-8 bg-[#38E1ED] hover:bg-[#58e7f2] active:scale-95 text-[#08151A] font-black text-sm tracking-wider uppercase rounded-full shadow-[0_0_30px_rgba(56,225,237,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        Start now
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ========================================================= */}
                        {/* TELA 2: DASHBOARD PRINCIPAL (HOME)                         */}
                        {/* ========================================================= */}
                        {currentScreen === 'home' && (
                            <motion.div
                                key="screen_home"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                                className="w-full p-4 sm:p-5 space-y-4"
                            >
                                {/* HEADER: AVATAR + SAUDAÇÃO + CRÉDITOS + SILHUETA COM GLOW */}
                                <div className="relative rounded-3xl bg-[#111F26] border border-cyan-500/20 p-4 sm:p-5 overflow-hidden shadow-lg">
                                    {/* Luz de fundo e silhueta estética neon */}
                                    <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
                                    
                                    <div className="flex items-start justify-between relative z-10">
                                        {/* Avatar & Welcome */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full ring-2 ring-cyan-400/60 p-0.5 bg-[#14262F] overflow-hidden shrink-0 shadow-[0_0_12px_rgba(56,225,237,0.3)]">
                                                {currentUser.foto || currentUser.fotoUrl ? (
                                                    <img src={currentUser.foto || currentUser.fotoUrl} alt={currentUser.nome} className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <div className="w-full h-full bg-cyan-950 flex items-center justify-center font-black text-cyan-400 text-sm">
                                                        {(currentUser.nome || 'M').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Welcome Back</span>
                                                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 leading-tight">
                                                    {(currentUser.nome || 'Alexander Arnold').split(' ')[0]} {((currentUser.nome || '').split(' ')[1] || '')} 👋
                                                </h2>
                                            </div>
                                        </div>

                                        {/* Badge de Créditos / Talentos Espirituais (Idêntico à foto: MyCredits 2,368) */}
                                        <div className="bg-[#152831] border border-cyan-500/30 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-[0_0_15px_rgba(56,225,237,0.15)]">
                                            <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                                                <Award size={18} className="fill-cyan-400/30" />
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-[9px] font-bold uppercase tracking-wider text-cyan-300">MyCredits</span>
                                                <span className="text-base sm:text-lg font-black text-white leading-none tracking-tight">
                                                    {formattedCredits}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD: TODAY'S TARGET (ALVO DE HOJE) */}
                                <div className="rounded-3xl bg-gradient-to-r from-[#12232B] to-[#0E1B21] border border-cyan-500/25 p-4 sm:p-5 flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#34D399] flex items-center gap-1.5">
                                            <Activity size={13} className="text-emerald-400" />
                                            Today's Target
                                        </span>
                                        <h3 className="text-lg sm:text-xl font-black text-white mt-1 truncate">
                                            {hasBoostedToday ? 'Devocional Cumprido! ✨' : '1 Devocional & Leitura'}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                            {hasBoostedToday ? 'Pontos diários creditados (+50 pts)' : 'Complete a meta diária e fortaleça seu chamado'}
                                        </p>
                                    </div>

                                    {/* Circular Progress Gauge (65%) */}
                                    <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#1E3844"
                                                strokeWidth="3.2"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="#34D399"
                                                strokeWidth="3.2"
                                                strokeDasharray={hasBoostedToday ? "100, 100" : "65, 100"}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <span className="absolute text-[11px] font-black text-emerald-300">
                                            {hasBoostedToday ? '100%' : '65%'}
                                        </span>
                                    </div>

                                    {/* Botão "Boost Now" */}
                                    <button
                                        onClick={handleTriggerBoost}
                                        className="py-3 px-4 rounded-2xl bg-[#38E1ED] hover:bg-[#52e7f2] active:scale-95 text-[#0A161A] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(56,225,237,0.35)] transition-all cursor-pointer shrink-0"
                                    >
                                        Boost Now
                                    </button>
                                </div>

                                {/* SEÇÃO: STATISTICS (3 CARDS VERTICAIS COM MICRO-ONDAS) */}
                                <div>
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <h4 className="text-sm font-black text-white tracking-wide uppercase">Statistics</h4>
                                        <button 
                                            onClick={() => setCurrentScreen('leaderboard')}
                                            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                            See details →
                                        </button>
                                    </div>

                                    {/* Grid de 3 Cards Verticais */}
                                    <div className="grid grid-cols-3 gap-2.5">
                                        {/* Card 1: Passos / Frequência */}
                                        <div className="rounded-2xl bg-[#13242B] border border-cyan-500/20 p-3 flex flex-col justify-between relative overflow-hidden h-36">
                                            <div>
                                                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
                                                    <Compass size={16} />
                                                </div>
                                                <span className="text-base sm:text-lg font-black text-white leading-none block">
                                                    4,568
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                                                    Steps / Presença
                                                </span>
                                            </div>
                                            {/* Micro-onda estética SVG no rodapé do card */}
                                            <svg viewBox="0 0 100 25" className="w-full h-6 opacity-30 text-cyan-400" preserveAspectRatio="none">
                                                <path d="M0 15 Q25 5 50 15 T100 10 L100 25 L0 25 Z" fill="currentColor" />
                                            </svg>
                                        </div>

                                        {/* Card 2: Distância / Lições & Bíblia */}
                                        <div className="rounded-2xl bg-[#13242B] border border-cyan-500/20 p-3 flex flex-col justify-between relative overflow-hidden h-36">
                                            <div>
                                                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
                                                    <BookOpen size={16} />
                                                </div>
                                                <span className="text-base sm:text-lg font-black text-white leading-none block">
                                                    12.3 Km
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                                                    Estudos / EBD
                                                </span>
                                            </div>
                                            {/* Micro-onda estética */}
                                            <svg viewBox="0 0 100 25" className="w-full h-6 opacity-30 text-cyan-400" preserveAspectRatio="none">
                                                <path d="M0 10 Q25 20 50 8 T100 12 L100 25 L0 25 Z" fill="currentColor" />
                                            </svg>
                                        </div>

                                        {/* Card 3: Calorias / Orações & Chamas */}
                                        <div className="rounded-2xl bg-[#13242B] border border-cyan-500/20 p-3 flex flex-col justify-between relative overflow-hidden h-36">
                                            <div>
                                                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
                                                    <Flame size={16} className="text-emerald-400" />
                                                </div>
                                                <span className="text-base sm:text-lg font-black text-white leading-none block">
                                                    1,350
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                                                    Orações / Fogo
                                                </span>
                                            </div>
                                            {/* Micro-onda estética */}
                                            <svg viewBox="0 0 100 25" className="w-full h-6 opacity-30 text-emerald-400" preserveAspectRatio="none">
                                                <path d="M0 18 Q25 8 50 14 T100 5 L100 25 L0 25 Z" fill="currentColor" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* GRID DE AÇÕES RÁPIDAS (BOOST STORE, REWARDS STORE, PROFILE) */}
                                <div className="grid grid-cols-3 gap-2.5">
                                    <button
                                        onClick={() => setCurrentScreen('store')}
                                        className="rounded-2xl bg-[#112027] hover:bg-[#162932] border border-cyan-500/20 p-3.5 flex flex-col items-center text-center transition-all cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 group-hover:bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-2 transition-all">
                                            <Zap size={20} className="group-hover:scale-110 transition-transform" />
                                        </div>
                                        <span className="text-xs font-black text-white">Boost Store</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Cursos & Fé</span>
                                    </button>

                                    <button
                                        onClick={() => setCurrentScreen('rewards')}
                                        className="rounded-2xl bg-[#112027] hover:bg-[#162932] border border-cyan-500/20 p-3.5 flex flex-col items-center text-center transition-all cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 group-hover:bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-2 transition-all">
                                            <Gift size={20} className="group-hover:scale-110 transition-transform" />
                                        </div>
                                        <span className="text-xs font-black text-white">Rewards Store</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Medalhas</span>
                                    </button>

                                    <button
                                        onClick={() => setCurrentScreen('profile')}
                                        className="rounded-2xl bg-[#112027] hover:bg-[#162932] border border-cyan-500/20 p-3.5 flex flex-col items-center text-center transition-all cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 group-hover:bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-2 transition-all">
                                            <User size={20} className="group-hover:scale-110 transition-transform" />
                                        </div>
                                        <span className="text-xs font-black text-white">Profile</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Cartão & Dados</span>
                                    </button>
                                </div>

                                {/* ATALHOS ADICIONAIS DO PORTAL ECLESIÁSTICO */}
                                <div className="rounded-2xl bg-[#0F1B21] border border-cyan-500/15 p-3 space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                                        Serviços da Igreja & Ministério
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        <button 
                                            onClick={() => setView('portal_financas')} 
                                            className="p-2.5 rounded-xl bg-[#14232A] hover:bg-[#1A2E38] border border-white/5 flex items-center gap-2 text-left cursor-pointer transition-all"
                                        >
                                            <DollarSign size={16} className="text-emerald-400 shrink-0" />
                                            <span className="text-xs font-bold text-slate-200 truncate">Dízimos & Ofertas</span>
                                        </button>
                                        <button 
                                            onClick={() => setView('portal_tarefas')} 
                                            className="p-2.5 rounded-xl bg-[#14232A] hover:bg-[#1A2E38] border border-white/5 flex items-center gap-2 text-left cursor-pointer transition-all"
                                        >
                                            <CheckSquare size={16} className="text-cyan-400 shrink-0" />
                                            <span className="text-xs font-bold text-slate-200 truncate">Minhas Escalas</span>
                                        </button>
                                        <button 
                                            onClick={() => setView('portal_agenda')} 
                                            className="p-2.5 rounded-xl bg-[#14232A] hover:bg-[#1A2E38] border border-white/5 flex items-center gap-2 text-left cursor-pointer transition-all"
                                        >
                                            <Calendar size={16} className="text-indigo-400 shrink-0" />
                                            <span className="text-xs font-bold text-slate-200 truncate">Agenda Geral</span>
                                        </button>
                                        <button 
                                            onClick={() => setView('portal_mural')} 
                                            className="p-2.5 rounded-xl bg-[#14232A] hover:bg-[#1A2E38] border border-white/5 flex items-center gap-2 text-left cursor-pointer transition-all"
                                        >
                                            <MessageSquare size={16} className="text-rose-400 shrink-0" />
                                            <span className="text-xs font-bold text-slate-200 truncate">Mural da Igreja</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ========================================================= */}
                        {/* TELA 3: LEADERBOARD / RANKING COM PÓDIO 3D EM TURQUESA     */}
                        {/* ========================================================= */}
                        {currentScreen === 'leaderboard' && (
                            <motion.div
                                key="screen_leaderboard"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.25 }}
                                className="w-full p-4 sm:p-5 space-y-4"
                            >
                                {/* HEADER: VOLTAR + TÍTULO + MENU (...) */}
                                <div className="flex items-center justify-between px-1">
                                    <button
                                        onClick={() => setCurrentScreen('home')}
                                        className="w-10 h-10 rounded-full bg-[#14242C] border border-cyan-500/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>

                                    <h3 className="text-lg font-black text-white tracking-tight">Leaderboard</h3>

                                    <button 
                                        onClick={() => alert(`Você está na ${rankingPeriod === 'monthly' ? 'classificação mensal' : 'classificação geral'} de engajamento do portal.`)}
                                        className="w-10 h-10 rounded-full bg-[#14242C] border border-cyan-500/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>

                                {/* ABAS TOGGLE: GLOBAL VS REGIONAL */}
                                <div className="grid grid-cols-2 p-1 rounded-full bg-[#112027] border border-cyan-500/20">
                                    <button
                                        onClick={() => setRankingScope('global')}
                                        className={`py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${rankingScope === 'global' ? 'bg-[#38E1ED] text-[#08151A] shadow-[0_0_15px_rgba(56,225,237,0.35)]' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Global
                                    </button>
                                    <button
                                        onClick={() => setRankingScope('regional')}
                                        className={`py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${rankingScope === 'regional' ? 'bg-[#38E1ED] text-[#08151A] shadow-[0_0_15px_rgba(56,225,237,0.35)]' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Regional
                                    </button>
                                </div>

                                {/* FILTRO DE PERÍODO: MONTHLY */}
                                <div className="flex justify-center">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14252D] border border-cyan-500/20 text-xs font-bold text-slate-300">
                                        <span>{rankingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}</span>
                                        <button 
                                            onClick={() => setRankingPeriod(rankingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                                            className="text-cyan-400 hover:text-cyan-300 font-extrabold"
                                        >
                                            ▾
                                        </button>
                                    </div>
                                </div>

                                {/* O INCRÍVEL PÓDIO 3D EM TURQUESA/CIANO (IDÊNTICO À FOTO) */}
                                <div className="relative pt-12 pb-4 flex items-end justify-center gap-2 sm:gap-4 px-2">
                                    {/* 2º LUGAR (DEGRAU ESQUERDO) */}
                                    <div className="flex-1 flex flex-col items-center">
                                        {/* Avatar do 2º Colocado */}
                                        <div className="relative mb-2">
                                            <div className="w-14 h-14 rounded-full ring-2 ring-cyan-400/50 p-0.5 bg-[#14262E] overflow-hidden shadow-lg">
                                                {podiumSecond?.foto ? (
                                                    <img src={podiumSecond.foto} alt={podiumSecond.nome} className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <div className="w-full h-full bg-cyan-900/60 flex items-center justify-center text-cyan-300 font-black text-sm">
                                                        {podiumSecond?.nome?.charAt(0) || '2'}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Bandeira/Insígnia */}
                                            <span className="absolute -bottom-1 right-0 text-sm">{podiumSecond?.flag || '🇩🇪'}</span>
                                        </div>
                                        <span className="text-xs font-extrabold text-white text-center truncate max-w-[90px]">
                                            {podiumSecond?.nome?.split(' ')[0] || 'Ruben'}
                                        </span>
                                        {/* Pill de Pontuação */}
                                        <span className="text-[10px] font-black text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30 my-1">
                                            {podiumSecond?.score || 17} Km
                                        </span>
                                        {/* Bloco Isométrico 3D "2" */}
                                        <div className="w-full h-24 rounded-t-2xl bg-gradient-to-t from-[#0891B2] via-[#06B6D4] to-[#22D3EE] shadow-[0_10px_25px_rgba(6,182,212,0.3)] flex items-center justify-center border-t-2 border-cyan-200 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                                            <span className="text-4xl font-black text-white drop-shadow-md">2</span>
                                        </div>
                                    </div>

                                    {/* 1º LUGAR (DEGRAU CENTRAL MAIS ALTO COM COROA DOURADA) */}
                                    <div className="flex-1 flex flex-col items-center -mt-6">
                                        {/* Coroa de Vencedor */}
                                        <div className="mb-1 text-amber-400 animate-bounce">
                                            <Crown size={22} className="fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                                        </div>
                                        {/* Avatar do 1º Colocado */}
                                        <div className="relative mb-2">
                                            <div className="w-18 h-18 rounded-full ring-4 ring-cyan-300 p-0.5 bg-[#14262E] overflow-hidden shadow-[0_0_25px_rgba(56,225,237,0.5)]">
                                                {podiumFirst?.foto ? (
                                                    <img src={podiumFirst.foto} alt={podiumFirst.nome} className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <div className="w-full h-full bg-cyan-800 flex items-center justify-center text-cyan-100 font-black text-base">
                                                        {podiumFirst?.nome?.charAt(0) || '1'}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Bandeira */}
                                            <span className="absolute -bottom-1 right-1 text-sm">{podiumFirst?.flag || '🇨🇦'}</span>
                                        </div>
                                        <span className="text-xs sm:text-sm font-black text-white text-center truncate max-w-[110px]">
                                            {podiumFirst?.nome || 'Adison Press'}
                                        </span>
                                        {/* Pill de Pontuação */}
                                        <span className="text-[11px] font-black text-cyan-200 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-400/50 my-1 shadow-[0_0_10px_rgba(56,225,237,0.4)]">
                                            {podiumFirst?.score || 20} Km
                                        </span>
                                        {/* Bloco Isométrico 3D "1" (Mais Alto) */}
                                        <div className="w-full h-36 rounded-t-2xl bg-gradient-to-t from-[#0E7490] via-[#06B6D4] to-[#67E8F9] shadow-[0_15px_35px_rgba(6,182,212,0.45)] flex items-center justify-center border-t-2 border-white relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                                            <span className="text-5xl font-black text-white drop-shadow-lg">1</span>
                                        </div>
                                    </div>

                                    {/* 3º LUGAR (DEGRAU DIREITO) */}
                                    <div className="flex-1 flex flex-col items-center">
                                        {/* Avatar do 3º Colocado */}
                                        <div className="relative mb-2">
                                            <div className="w-14 h-14 rounded-full ring-2 ring-cyan-400/50 p-0.5 bg-[#14262E] overflow-hidden shadow-lg">
                                                {podiumThird?.foto ? (
                                                    <img src={podiumThird.foto} alt={podiumThird.nome} className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <div className="w-full h-full bg-cyan-900/60 flex items-center justify-center text-cyan-300 font-black text-sm">
                                                        {podiumThird?.nome?.charAt(0) || '3'}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Bandeira */}
                                            <span className="absolute -bottom-1 right-0 text-sm">{podiumThird?.flag || '🇨🇿'}</span>
                                        </div>
                                        <span className="text-xs font-extrabold text-white text-center truncate max-w-[90px]">
                                            {podiumThird?.nome?.split(' ')[0] || 'Jakob'}
                                        </span>
                                        {/* Pill de Pontuação */}
                                        <span className="text-[10px] font-black text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30 my-1">
                                            {podiumThird?.score || 12} Km
                                        </span>
                                        {/* Bloco Isométrico 3D "3" */}
                                        <div className="w-full h-20 rounded-t-2xl bg-gradient-to-t from-[#0891B2] via-[#06B6D4] to-[#22D3EE] shadow-[0_10px_25px_rgba(6,182,212,0.3)] flex items-center justify-center border-t-2 border-cyan-200 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                                            <span className="text-4xl font-black text-white drop-shadow-md">3</span>
                                        </div>
                                    </div>
                                </div>

                                {/* LISTA DE DEMAIS MEMBROS CLASSIFICADOS (#4, #5...) */}
                                <div className="rounded-3xl bg-[#0D1A20] border border-cyan-500/20 p-3 space-y-2">
                                    {restOfLeaderboard.map((membro, index) => {
                                        const pos = index + 4;
                                        return (
                                            <div
                                                key={membro.id}
                                                className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                                                    membro.isCurrent
                                                        ? 'bg-cyan-500/15 border border-cyan-400/40 shadow-[0_0_15px_rgba(56,225,237,0.2)]'
                                                        : 'bg-[#122229] border border-white/5 hover:bg-[#162932]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-black text-slate-400 w-5 text-center">
                                                        {pos}
                                                    </span>
                                                    <div className="w-10 h-10 rounded-full ring-2 ring-emerald-400/50 p-0.5 bg-[#14262E] overflow-hidden shrink-0">
                                                        {membro.foto ? (
                                                            <img src={membro.foto} alt={membro.nome} className="w-full h-full object-cover rounded-full" />
                                                        ) : (
                                                            <div className="w-full h-full bg-emerald-950 flex items-center justify-center font-black text-emerald-300 text-xs">
                                                                {membro.nome.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                                                            {membro.nome}
                                                            {membro.isCurrent && (
                                                                <span className="text-[9px] px-1.5 py-0.2 bg-cyan-400 text-slate-950 rounded-full font-bold">Você</span>
                                                            )}
                                                        </h5>
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {membro.cargo}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span className="text-xs font-black text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/30">
                                                    {membro.score} Km
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* ========================================================= */}
                        {/* TELA DE REWARDS / CONQUISTAS                              */}
                        {/* ========================================================= */}
                        {currentScreen === 'rewards' && (
                            <motion.div
                                key="screen_rewards"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                                className="w-full p-4 sm:p-5 space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                                        <Gift className="text-cyan-400" size={20} />
                                        Rewards & Conquistas
                                    </h3>
                                    <span className="text-xs text-cyan-300 font-bold bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-500/30">
                                        {formattedCredits} pts acumulados
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { title: 'Fidelidade de Dízimos', desc: 'Fidelidade do mês confirmada', icon: Award, color: 'text-amber-400', pts: '+250 pts' },
                                        { title: 'Estudo Bíblico EBD', desc: 'Lição dominical em dia', icon: BookOpenText, color: 'text-blue-400', pts: '+150 pts' },
                                        { title: 'Servo nas Escalas', desc: 'Participação ativa em cultos', icon: ShieldCheck, color: 'text-emerald-400', pts: '+180 pts' },
                                        { title: 'Missões & Apoio', desc: 'Oferta missionária do mês', icon: Globe, color: 'text-rose-400', pts: '+200 pts' },
                                        { title: 'Comunhão no Mural', desc: 'Interação e orações com a igreja', icon: HeartHandshake, color: 'text-purple-400', pts: '+60 pts' },
                                        { title: 'Devocional Diário', desc: 'Boost de reflexão espiritual', icon: Flame, color: 'text-cyan-400', pts: '+50 pts' }
                                    ].map((badge, bIdx) => (
                                        <div key={bIdx} className="p-3.5 rounded-2xl bg-[#12232B] border border-cyan-500/20 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shrink-0">
                                                    <badge.icon size={20} className={badge.color} />
                                                </div>
                                                <div>
                                                    <h5 className="text-xs font-black text-white">{badge.title}</h5>
                                                    <p className="text-[10px] text-slate-400">{badge.desc}</p>
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-black text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-500/30 shrink-0">
                                                {badge.pts}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ========================================================= */}
                        {/* TELA STORE / CURSOS & BÍBLIA                              */}
                        {/* ========================================================= */}
                        {currentScreen === 'store' && (
                            <motion.div
                                key="screen_store"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                                className="w-full p-4 sm:p-5 space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                                        <Zap className="text-cyan-400" size={20} />
                                        Boost Store & Ensino
                                    </h3>
                                    <span className="text-xs text-slate-400">Universidade Teológica</span>
                                </div>

                                <div className="space-y-3">
                                    <button 
                                        onClick={() => setView('portal_cursos')}
                                        className="w-full p-4 rounded-2xl bg-[#12232B] hover:bg-[#162A34] border border-cyan-500/20 flex items-center justify-between text-left transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                                                <BookOpen size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">Cursos Teológicos & Doutrinários</h4>
                                                <p className="text-xs text-slate-400 mt-0.5">Fundamentos Pentecostais, Declaração de Fé CPAD e Obreiro de Valor</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-cyan-400 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <button 
                                        onClick={() => setView('portal_biblia')}
                                        className="w-full p-4 rounded-2xl bg-[#12232B] hover:bg-[#162A34] border border-cyan-500/20 flex items-center justify-between text-left transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                                                <BookOpenText size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">Bíblia Sagrada Digital</h4>
                                                <p className="text-xs text-slate-400 mt-0.5">Leitura de capítulos diários, busca de versículos e anotações</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <button 
                                        onClick={() => setView('portal_ebd')}
                                        className="w-full p-4 rounded-2xl bg-[#12232B] hover:bg-[#162A34] border border-cyan-500/20 flex items-center justify-between text-left transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                                                <Sparkles size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">Revistas da EBD</h4>
                                                <p className="text-xs text-slate-400 mt-0.5">Acompanhe a sua turma e responda aos questionários da semana</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-cyan-400 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ========================================================= */}
                        {/* TELA PROFILE / CARTEIRINHA E DADOS                        */}
                        {/* ========================================================= */}
                        {currentScreen === 'profile' && (
                            <motion.div
                                key="screen_profile"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                                className="w-full p-4 sm:p-5 space-y-4"
                            >
                                <div className="rounded-3xl bg-[#12232B] border border-cyan-500/20 p-5 flex flex-col items-center text-center relative overflow-hidden">
                                    <div className="w-20 h-20 rounded-full ring-4 ring-cyan-400 p-0.5 bg-[#14262E] overflow-hidden mb-3 shadow-[0_0_20px_rgba(56,225,237,0.4)]">
                                        {currentUser.foto || currentUser.fotoUrl ? (
                                            <img src={currentUser.foto || currentUser.fotoUrl} alt={currentUser.nome} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <div className="w-full h-full bg-cyan-900 flex items-center justify-center font-black text-white text-xl">
                                                {(currentUser.nome || 'M').charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-black text-white">{currentUser.nome || 'Alexander Arnold'}</h3>
                                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest mt-0.5">
                                        {currentUser.cargo || 'Membro Ativo'}
                                    </span>
                                    <p className="text-xs text-slate-400 mt-1">{db?.igreja?.nome || 'Igreja Sede'}</p>

                                    <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
                                        <div className="p-2.5 rounded-xl bg-[#0F1C22]">
                                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Matrícula</span>
                                            <span className="text-sm font-black text-white font-mono">{currentUser.matricula || currentUser.rol || '00234'}</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-[#0F1C22]">
                                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Status</span>
                                            <span className="text-sm font-black text-emerald-400">Regular</span>
                                        </div>
                                    </div>

                                    {/* Botão de Carteirinha Digital */}
                                    <button
                                        onClick={() => setView('portal_carteirinha')}
                                        className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-[#38E1ED] hover:bg-[#52e7f2] active:scale-95 text-[#0A161A] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(56,225,237,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <QrCode size={18} />
                                        Abrir Cartão Digital com QR Code
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* BOTTOM NAVIGATION BAR NATIVA (IDÊNTICA À FOTO COM OS 5 ÍCONES) */}
                <nav className="absolute bottom-0 inset-x-0 h-20 bg-[#0B1519]/90 border-t border-cyan-500/20 backdrop-blur-xl flex items-center justify-around px-2 z-40 select-none shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                    {/* 1. Home */}
                    <button
                        onClick={() => setCurrentScreen('home')}
                        className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all cursor-pointer ${
                            currentScreen === 'home'
                                ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(56,225,237,0.6)] scale-105'
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Home size={22} className={currentScreen === 'home' ? 'stroke-[2.5]' : 'stroke-2'} />
                        <span className="text-[10px] font-black tracking-wider uppercase mt-1">Home</span>
                    </button>

                    {/* 2. Leaderboard */}
                    <button
                        onClick={() => setCurrentScreen('leaderboard')}
                        className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all cursor-pointer ${
                            currentScreen === 'leaderboard'
                                ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(56,225,237,0.6)] scale-105'
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Trophy size={22} className={currentScreen === 'leaderboard' ? 'stroke-[2.5]' : 'stroke-2'} />
                        <span className="text-[10px] font-black tracking-wider uppercase mt-1">Leaderboard</span>
                    </button>

                    {/* 3. Rewards */}
                    <button
                        onClick={() => setCurrentScreen('rewards')}
                        className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all cursor-pointer ${
                            currentScreen === 'rewards'
                                ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(56,225,237,0.6)] scale-105'
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Gift size={22} className={currentScreen === 'rewards' ? 'stroke-[2.5]' : 'stroke-2'} />
                        <span className="text-[10px] font-black tracking-wider uppercase mt-1">Rewards</span>
                    </button>

                    {/* 4. Store */}
                    <button
                        onClick={() => setCurrentScreen('store')}
                        className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all cursor-pointer ${
                            currentScreen === 'store'
                                ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(56,225,237,0.6)] scale-105'
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Zap size={22} className={currentScreen === 'store' ? 'stroke-[2.5]' : 'stroke-2'} />
                        <span className="text-[10px] font-black tracking-wider uppercase mt-1">Store</span>
                    </button>

                    {/* 5. Profile */}
                    <button
                        onClick={() => setCurrentScreen('profile')}
                        className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all cursor-pointer ${
                            currentScreen === 'profile'
                                ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(56,225,237,0.6)] scale-105'
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <User size={22} className={currentScreen === 'profile' ? 'stroke-[2.5]' : 'stroke-2'} />
                        <span className="text-[10px] font-black tracking-wider uppercase mt-1">Profile</span>
                    </button>
                </nav>

                {/* Home Indicator bar no rodapé do Smartphone */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-50 pointer-events-none" />
            </main>

            {/* MODAL DEVOCIONAL / BOOST NOW */}
            {isBoostModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#0F1D24] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-cyan-400" size={20} />
                                <h4 className="text-base font-black text-white">Devocional Diário & Boost</h4>
                            </div>
                            <button 
                                onClick={() => setIsBoostModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {loadingBoost ? (
                            <div className="py-8 text-center flex flex-col items-center gap-3">
                                <Loader2 className="animate-spin text-cyan-400" size={32} />
                                <span className="text-xs font-bold text-slate-300">Inspirando devocional com IA pastoral...</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-[#14262E] border border-cyan-500/20 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                                    {boostDevocional}
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-300 text-xs font-bold">
                                    <CheckCircle2 size={16} className="shrink-0" />
                                    <span>Meta cumprida! +50 pontos adicionados a MyCredits.</span>
                                </div>
                                <button
                                    onClick={() => setIsBoostModalOpen(false)}
                                    className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                                >
                                    Amém & Concluir
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
