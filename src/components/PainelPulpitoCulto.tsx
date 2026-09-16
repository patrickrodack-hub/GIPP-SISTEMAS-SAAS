import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Clock, Volume2, Bell, AlertTriangle, 
  CheckCircle2, ChevronRight, ChevronLeft, Maximize2, Minimize2, 
  Sun, Moon, BookOpen, Music, DollarSign, Users, Sparkles, Send, 
  Trash2, Plus, Edit3, MessageSquare, Flame, Shield, X, RefreshCw
} from 'lucide-react';
import { ChurchContext } from '../App';

export interface BlocoLiturgico {
  id: string;
  titulo: string;
  subtitulo?: string;
  duracaoMinutos: number;
  responsavel?: string;
  tipo: 'oracao' | 'louvor' | 'leitura' | 'dizimo' | 'palavra' | 'avisos' | 'apelo' | 'encerramento';
  leituraBiblica?: string;
  hinos?: string;
  concluido: boolean;
}

export interface AvisoPulpito {
  id: string;
  texto: string;
  tipo: 'urgente' | 'visitante' | 'oracao' | 'geral';
  autor: string;
  horario: string;
  lido: boolean;
}

interface Props {
  initialLiturgiaId?: string;
  onClose?: () => void;
}

export const PainelPulpitoCulto: React.FC<Props> = ({ initialLiturgiaId, onClose }) => {
  const { db, dbFirestore, appId, setDoc, doc, user, addToast, logAction } = useContext(ChurchContext);

  // Tema de exibição do púlpito (Padrão Dark Stage para palco)
  const [stageTheme, setStageTheme] = useState<'dark' | 'light'>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Relógio do Sistema (Horário Oficial do Templo)
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dados do Culto Atual
  const [cultoTitulo, setCultoTitulo] = useState('Culto de Celebração e Doutrina');
  const [cultoData] = useState(new Date().toISOString().split('T')[0]);
  const [pregadorNome, setPregadorNome] = useState('Pastor Presidente');
  const [dirigenteNome, setDirigenteNome] = useState('Dirigente do Culto');

  // Liturgia Inicial Padrão Pentecostal
  const [blocos, setBlocos] = useState<BlocoLiturgico[]>([
    {
      id: 'b1',
      titulo: '1. Prelúdio Instrumental & Oração Inicial',
      subtitulo: 'Invocação e Abertura Oficial do Culto',
      duracaoMinutos: 5,
      responsavel: 'Dirigente do Culto',
      tipo: 'oracao',
      concluido: false
    },
    {
      id: 'b2',
      titulo: '2. Cânticos da Harpa Cristã & Louvor Congregacional',
      subtitulo: 'Hinos nº 15, 141 e louvor pelo ministério',
      duracaoMinutos: 15,
      responsavel: 'Ministério de Louvor',
      hinos: 'Harpa 15: Foi na Cruz • Harpa 141: Guia-me, ó Salvador',
      tipo: 'louvor',
      concluido: false
    },
    {
      id: 'b3',
      titulo: '3. Leitura Bíblica Oficial',
      subtitulo: 'Leitura com a Igreja em pé',
      duracaoMinutos: 7,
      responsavel: 'Pastor Presidente',
      leituraBiblica: 'Salmos 122:1-9 — “Alegrei-me quando me disseram: Vamos à casa do Senhor! Nossos pés estão parados dentro das tuas portas, ó Jerusalém...”',
      tipo: 'leitura',
      concluido: false
    },
    {
      id: 'b4',
      titulo: '4. Oportunidades, Testemunhos & Crianças',
      subtitulo: 'Apresentação de visitantes e testemunhos de fé',
      duracaoMinutos: 10,
      responsavel: 'Dirigente',
      tipo: 'avisos',
      concluido: false
    },
    {
      id: 'b5',
      titulo: '5. Consagração dos Dízimos & Ofertas',
      subtitulo: 'Gratidão, adoração e oração pelos mantenedores',
      duracaoMinutos: 8,
      responsavel: 'Diáconos / Tesoureiro',
      tipo: 'dizimo',
      concluido: false
    },
    {
      id: 'b6',
      titulo: '6. Ministração da Santa Palavra de Deus',
      subtitulo: 'Sermão bíblico expositivo',
      duracaoMinutos: 40,
      responsavel: 'Pregador Escalado',
      leituraBiblica: '2 Timóteo 4:1-5 — “Prega a palavra, insta a tempo e fora de tempo, redargue, repreende, exorta, com toda a longanimidade e doutrina.”',
      tipo: 'palavra',
      concluido: false
    },
    {
      id: 'b7',
      titulo: '7. Apelo aos Não-Crentes & Oração da Vitória',
      subtitulo: 'Chamada ao altar e imposição de mãos pelos enfermos',
      duracaoMinutos: 10,
      responsavel: 'Pastor / Ministério de Oração',
      tipo: 'apelo',
      concluido: false
    },
    {
      id: 'b8',
      titulo: '8. Avisos Finais & Bênção Apostólica',
      subtitulo: 'Despedida solene e tríplice bênção bíblica',
      duracaoMinutos: 5,
      responsavel: 'Pastor Presidente',
      tipo: 'encerramento',
      concluido: false
    }
  ]);

  // Bloco Atualmente Selecionado
  const [blocoAtivoIndex, setBlocoAtivoIndex] = useState(0);
  const blocoAtivo = blocos[blocoAtivoIndex] || blocos[0];

  // Cronômetro do Bloco Ativo (em segundos)
  const [tempoRestante, setTempoRestante] = useState(blocoAtivo.duracaoMinutos * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);
  const [tempoExcedido, setTempoExcedido] = useState(0);

  // Atualiza tempo ao mudar de bloco
  useEffect(() => {
    if (blocoAtivo) {
      setTempoRestante(blocoAtivo.duracaoMinutos * 60);
      setIsOvertime(false);
      setTempoExcedido(0);
      setIsRunning(false);
    }
  }, [blocoAtivoIndex]);

  // Tick do Cronômetro
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTempoRestante(prev => {
          if (prev > 1) {
            return prev - 1;
          } else {
            setIsOvertime(true);
            setTempoExcedido(exp => exp + 1);
            return 0;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Formatação de Tempo MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Avisos de Púlpito em Tempo Real
  const [avisos, setAvisos] = useState<AvisoPulpito[]>([
    {
      id: 'av_1',
      texto: 'Veículo Corolla prata placa ABC-1234 com faróis acesos em frente ao portão.',
      tipo: 'geral',
      autor: 'Recepção / Estacionamento',
      horario: '19:40',
      lido: false
    },
    {
      id: 'av_2',
      texto: 'Pastor Visitante Pr. Carlos Souza e comitiva da AD Santos presentes no plenário.',
      tipo: 'visitante',
      autor: 'Secretaria',
      horario: '19:45',
      lido: false
    }
  ]);

  const [novoAvisoTexto, setNovoAvisoTexto] = useState('');
  const [novoAvisoTipo, setNovoAvisoTipo] = useState<'urgente' | 'visitante' | 'oracao' | 'geral'>('geral');
  const [showAvisoModal, setShowAvisoModal] = useState(false);
  const [tamanhoFonteBiblia, setTamanhoFonteBiblia] = useState<'normal' | 'grande' | 'extragrande'>('grande');

  // Adicionar Novo Aviso
  const handleEnviarAviso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoAvisoTexto.trim()) return;

    const novo: AvisoPulpito = {
      id: 'av_' + Date.now(),
      texto: novoAvisoTexto.trim(),
      tipo: novoAvisoTipo,
      autor: user?.nome || 'Cabine de Som/Mídia',
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      lido: false
    };

    setAvisos(prev => [novo, ...prev]);
    setNovoAvisoTexto('');
    setShowAvisoModal(false);
    addToast("Aviso transmitido para a tela do púlpito!", "success");
  };

  // Marcar aviso como lido / anunciado
  const handleMarcarAvisoLido = (id: string) => {
    setAvisos(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a));
  };

  // Avançar Bloco
  const handleConcluirBloco = () => {
    setBlocos(prev => prev.map((b, i) => i === blocoAtivoIndex ? { ...b, concluido: true } : b));
    if (blocoAtivoIndex < blocos.length - 1) {
      setBlocoAtivoIndex(prev => prev + 1);
      addToast(`Avançando para: ${blocos[blocoAtivoIndex + 1].titulo}`, "info");
    } else {
      setIsRunning(false);
      addToast("Todos os blocos litúrgicos foram concluídos com sucesso!", "success");
    }
  };

  // Ajustes Rápidos de Tempo
  const handleAddMinutes = (min: number) => {
    if (isOvertime) {
      setIsOvertime(false);
      setTempoRestante(min * 60);
      setTempoExcedido(0);
    } else {
      setTempoRestante(prev => prev + (min * 60));
    }
  };

  // Alternar Tela Cheia
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Aviso urgente não lido no topo
  const avisoDestaque = useMemo(() => {
    return avisos.find(a => !a.lido);
  }, [avisos]);

  // Cor do Cronômetro baseada no tempo
  const timerColorClass = useMemo(() => {
    if (isOvertime) return 'text-rose-500 animate-pulse';
    if (tempoRestante <= 300) return 'text-amber-400'; // Menos de 5 minutos
    return stageTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600';
  }, [tempoRestante, isOvertime, stageTheme]);

  return (
    <div 
      ref={containerRef}
      className={`w-full min-h-[750px] flex flex-col transition-colors rounded-3xl overflow-hidden border shadow-2xl ${
        stageTheme === 'dark' 
          ? 'bg-slate-950 text-slate-100 border-slate-800' 
          : 'bg-slate-50 text-slate-800 border-slate-200'
      }`}
    >
      {/* BARRA SUPERIOR DO PÚLPITO */}
      <div className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 ${
        stageTheme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Flame size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight">{cultoTitulo}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span> AO VIVO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Dirigente: <strong className="text-slate-200">{dirigenteNome}</strong> • Pregador: <strong className="text-slate-200">{pregadorNome}</strong>
            </p>
          </div>
        </div>

        {/* RELÓGIO OFICIAL GRANDE */}
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-2xl border text-center font-mono ${
            stageTheme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-sans font-bold">HORÁRIO OFICIAL</span>
            <span className="text-xl sm:text-2xl font-black">
              {currentTime.toLocaleTimeString('pt-BR')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStageTheme(stageTheme === 'dark' ? 'light' : 'dark')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                stageTheme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
              title={stageTheme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Palco Escuro'}
            >
              {stageTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => setShowAvisoModal(true)}
              className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
              title="Enviar Aviso ou Pedido de Oração para o Púlpito"
            >
              <MessageSquare size={16} /> Enviar Aviso
            </button>

            <button
              onClick={toggleFullscreen}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                stageTheme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
              title="Tela Cheia (Púlpito Stage Display)"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Fechar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BANNER DE AVISO URGENTE NO TOPO DO PÚLPITO (SE HOUVER) */}
      {avisoDestaque && (
        <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-6 py-3 flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <Bell size={20} className="animate-wiggle shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md mr-2">
                AVISO PARA O PÚLPITO ({avisoDestaque.horario})
              </span>
              <span className="text-sm font-bold tracking-wide">{avisoDestaque.texto}</span>
            </div>
          </div>
          <button
            onClick={() => handleMarcarAvisoLido(avisoDestaque.id)}
            className="px-3 py-1 bg-white text-slate-900 rounded-lg text-xs font-black hover:bg-slate-100 transition-all shrink-0 cursor-pointer shadow-sm"
          >
            ✓ Ciente / Lido
          </button>
        </div>
      )}

      {/* ÁREA PRINCIPAL: DIVISÃO ENTRE CRONÔMETRO DE PALCO E ROTEIRO */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* COLUNA ESQUERDA: CRONÔMETRO DE MINISTRAÇÃO & LEITURA EXPANDIDA (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* DISPLAY GIGANTE DO CRONÔMETRO */}
          <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden ${
            stageTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-indigo-500" />
                Tempo do Bloco: {blocoAtivo.duracaoMinutos} min
              </span>
              <span>
                {isOvertime ? 'TEMPO EXCEDIDO' : isRunning ? 'EM PROGRESSO' : 'PAUSADO'}
              </span>
            </div>

            {/* RELÓGIO GIGANTE */}
            <div className={`font-mono text-6xl sm:text-8xl font-black tracking-tight my-2 select-none ${timerColorClass}`}>
              {isOvertime ? `+${formatTime(tempoExcedido)}` : formatTime(tempoRestante)}
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
              {blocoAtivo.titulo}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Responsável: <strong className="text-indigo-400">{blocoAtivo.responsavel || 'Equipe de Culto'}</strong>
            </p>

            {/* CONTROLES DO CRONÔMETRO */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 pt-4 border-t border-slate-800/40 w-full">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                  isRunning 
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                }`}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? 'Pausar' : 'Iniciar'}
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setIsOvertime(false);
                  setTempoRestante(blocoAtivo.duracaoMinutos * 60);
                  setTempoExcedido(0);
                }}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                title="Reiniciar Tempo do Bloco"
              >
                <RotateCcw size={18} />
              </button>

              <button
                onClick={() => handleAddMinutes(1)}
                className="px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black transition-all cursor-pointer"
                title="Adicionar 1 minuto"
              >
                +1 min
              </button>

              <button
                onClick={() => handleAddMinutes(5)}
                className="px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black transition-all cursor-pointer"
                title="Adicionar 5 minutos"
              >
                +5 min
              </button>

              <button
                onClick={handleConcluirBloco}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <CheckCircle2 size={16} /> Concluir & Próximo Bloco
              </button>
            </div>
          </div>

          {/* TELEPROMPTER / LEITURA BÍBLICA EXPANDIDA */}
          <div className={`p-6 rounded-3xl border flex-1 flex flex-col justify-between space-y-4 ${
            stageTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <BookOpen size={16} /> Texto Sagrado em Destaque (Púlpito)
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTamanhoFonteBiblia('normal')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${tamanhoFonteBiblia === 'normal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  A
                </button>
                <button
                  onClick={() => setTamanhoFonteBiblia('grande')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${tamanhoFonteBiblia === 'grande' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  A+
                </button>
                <button
                  onClick={() => setTamanhoFonteBiblia('extragrande')}
                  className={`px-2 py-1 rounded-lg text-sm font-bold ${tamanhoFonteBiblia === 'extragrande' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  A++
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              {blocoAtivo.leituraBiblica ? (
                <p className={`font-serif italic leading-relaxed text-slate-200 ${
                  tamanhoFonteBiblia === 'normal' ? 'text-sm' :
                  tamanhoFonteBiblia === 'grande' ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'
                }`}>
                  “{blocoAtivo.leituraBiblica}”
                </p>
              ) : blocoAtivo.hinos ? (
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Music size={14} /> Hinos & Cânticos Escalados:
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-100">
                    {blocoAtivo.hinos}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-xs">Nenhum texto bíblico específico anexado a esta etapa.</p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800/30">
              <span>Etapa {blocoAtivoIndex + 1} de {blocos.length}</span>
              <span>{blocoAtivo.subtitulo || 'Andamento liturgico'}</span>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: TIMELINE LITÚRGICA COMPLETA & FEED DE AVISOS (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 overflow-hidden">
          {/* TIMELINE DE BLOCOS LITÚRGICOS */}
          <div className={`p-6 rounded-3xl border flex-1 flex flex-col overflow-hidden ${
            stageTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-400" /> Roteiro Litúrgico do Culto
              </h4>
              <span className="text-[10px] font-bold text-slate-500">
                {blocos.filter(b => b.concluido).length} de {blocos.length} Concluídos
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
              {blocos.map((bloco, idx) => {
                const isSelected = idx === blocoAtivoIndex;
                return (
                  <div
                    key={bloco.id}
                    onClick={() => setBlocoAtivoIndex(idx)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 text-left ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20' 
                        : bloco.concluido
                        ? 'bg-slate-800/40 border-slate-800 text-slate-500 line-through opacity-70'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {bloco.concluido ? (
                        <CheckCircle2 size={16} className={isSelected ? 'text-white' : 'text-emerald-500'} />
                      ) : isSelected ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-white block animate-ping"></span>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-mono">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-black line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {bloco.titulo}
                        </span>
                        <span className={`text-[10px] font-mono shrink-0 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {bloco.duracaoMinutos}m
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {bloco.responsavel || bloco.subtitulo}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FEED DE AVISOS E PEDIDOS DE ORAÇÃO RECEBIDOS */}
          <div className={`p-5 rounded-3xl border max-h-64 flex flex-col ${
            stageTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bell size={14} className="text-amber-400" /> Avisos da Sonoplastia & Secretaria
              </span>
              <button
                onClick={() => setShowAvisoModal(true)}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Novo
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {avisos.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Nenhum aviso emitido até o momento.</p>
              ) : (
                avisos.map(a => (
                  <div
                    key={a.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                      a.lido 
                        ? 'bg-slate-950/30 border-slate-800 text-slate-500' 
                        : 'bg-amber-950/20 border-amber-800/60 text-amber-200 font-medium'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                        <span className="font-bold">{a.autor}</span>
                        <span>•</span>
                        <span>{a.horario}</span>
                      </div>
                      <p className="text-[11px] leading-tight">{a.texto}</p>
                    </div>

                    {!a.lido && (
                      <button
                        onClick={() => handleMarcarAvisoLido(a.id)}
                        className="p-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/40 text-[10px] font-bold shrink-0 cursor-pointer"
                        title="Marcar como lido"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PARA ENVIAR AVISO RÁPIDO AO PÚLPITO */}
      {showAvisoModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-[12000] p-4 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-black flex items-center gap-2">
                <Bell size={16} className="text-amber-400" /> Transmitir Aviso ao Púlpito
              </h4>
              <button onClick={() => setShowAvisoModal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEnviarAviso} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Tipo de Aviso</label>
                <select
                  value={novoAvisoTipo}
                  onChange={e => setNovoAvisoTipo(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none"
                >
                  <option value="geral">Aviso Geral (Estacionamento / Recado)</option>
                  <option value="visitante">Pastor ou Obreiro Visitante</option>
                  <option value="oracao">Pedido de Oração Urgente</option>
                  <option value="urgente">Urgência no Auditório</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Mensagem para o Dirigente / Pregador</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Pastor José da Silva e comitiva da AD Campinas presentes na galeria..."
                  value={novoAvisoTexto}
                  onChange={e => setNovoAvisoTexto(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAvisoModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Send size={14} /> Transmitir Imediatamente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
