import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, Trophy, HelpCircle, Sparkles, RefreshCw, Play, 
  Maximize2, Minimize2, X, Award, Users, Check, Pause, 
  RotateCcw, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, 
  Coins, SkipForward, Flame, MessageCircle, HelpCircle as HelpIcon,
  CheckCircle2, AlertTriangle, ChevronRight, Info, EyeOff, LayoutGrid, SlidersHorizontal, Move,
  Key, Lock, Unlock, Zap, Compass, BookOpen, Volume2, VolumeX, Smile, Disc, Clock, Lightbulb, Sparkle, PartyPopper,
  Layers, Sun, Heart, Shield
} from 'lucide-react';

// ==========================================
// BANCO DE QUESTÕES - SHOW DO CRISTÃO
// ==========================================
// Baseado estritamente nos 24 capítulos da Declaração de Fé das Assembleias de Deus (CGADB/CPAD)
interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number; // Índice da resposta correta (0 = A, 1 = B, 2 = C, 3 = D)
  chapter: string; // Capítulo da Declaração de Fé correspondente
  explanation: string; // Justificativa teológica / versículo de apoio
  level: 'facil' | 'medio' | 'dificil' | 'final';
}

const QUESTIONS_DB: Question[] = [
  // FÁCEIS
  {
    id: 1,
    level: 'facil',
    chapter: 'Cap. 1: As Sagradas Escrituras',
    question: 'Segundo a Declaração de Fé das Assembleias de Deus, as Sagradas Escrituras são o quê?',
    options: [
      'Uma coleção de conselhos meramente humanos e históricos',
      'A infalível Palavra de Deus, inspirada verbal e plenamente pelo Espírito Santo',
      'Um livro de sabedoria que contém erros históricos e lendas de fé',
      'Um guia moral secundário aplicável apenas ao Antigo Testamento'
    ],
    answer: 1,
    explanation: 'O Cap. 1 ensina que a Bíblia Sagrada é a nossa única regra infalível de fé e conduta, divinamente inspirada verbal e plenamente pelo Espírito Santo (2 Tm 3.16).',
  },
  {
    id: 2,
    level: 'facil',
    chapter: 'Cap. 2 e 3: Teontologia e Trindade',
    question: 'A doutrina bíblica da Trindade ensina a existência de um só Deus composto por quais pessoas?',
    options: [
      'Pai, Filho e Maria Santíssima',
      'Pai, o Espírito Santo e os Arcanjos',
      'Três deuses diferentes que agem em épocas distintas',
      'Um só Deus em três pessoas distintas e consubstanciais: Pai, Filho e Espírito Santo'
    ],
    answer: 3,
    explanation: 'De acordo com o Cap. 2 e 3, cremos em um só Deus vivo, verdadeiro, eterno e infinito, subsistente em três pessoas distintas de mesma essência (Dt 6.4; Mt 28.19).',
  },
  {
    id: 3,
    level: 'facil',
    chapter: 'Cap. 11: O Batismo em Águas',
    question: 'Qual é a forma correta de batismo em águas praticada oficialmente pelas Assembleias de Deus?',
    options: [
      'Por aspersão, jogando pequenas gotas de água sobre a cabeça',
      'Exclusivamente por imersão do corpo inteiro na água, em nome da Trindade',
      'Por afusão, derramando uma jarra de água sobre o candidato',
      'Apenas de forma espiritual, sem necessidade de água ou rito'
    ],
    answer: 1,
    explanation: 'No Cap. 11, o batismo em águas é ensinado como ordenança divina por imersão total do corpo, simbolizando nossa união com Cristo em Sua morte e ressurreição (Mt 28.19; Rm 6.4).',
  },
  {
    id: 4,
    level: 'facil',
    chapter: 'Cap. 24: A Família',
    question: 'De acordo com a Declaração de Fé da CPAD, o casamento padrão instituído por Deus é:',
    options: [
      'Uma união civil reversível sem princípios morais espirituais',
      'A união monogâmica e heterossexual entre um homem e uma mulher, formando o lar tradicional',
      'Um contrato temporário entre duas ou mais pessoas quaisquer',
      'Um rito místico restrito apenas aos líderes religiosos celibatários'
    ],
    answer: 1,
    explanation: 'O Cap. 24 declara que o casamento foi instituído por Deus e consiste na união monogâmica e heterossexual entre um homem e uma mulher, sendo a base da família (Gn 2.24).',
  },
  {
    id: 5,
    level: 'facil',
    chapter: 'Cap. 21: A Cura Divina',
    question: 'O que as Assembleias de Deus defendem sobre a cura divina de enfermidades hoje?',
    options: [
      'Que a cura divina cessou com a morte dos apóstolos',
      'Que a cura de Deus depende apenas de rituais com incensos exóticos',
      'Que ela é plenamente atual e operada pelo poder divino mediante a fé e oração',
      'Que apenas pastores que cobram ofertas conseguem obter curas reais'
    ],
    answer: 2,
    explanation: 'O Cap. 21 assevera que Jesus levou sobre si nossas dores, e que a cura divina é um milagre atual operado pela soberania divina e pela oração da fé (Is 53.4-5; Tg 5.14-15).',
  },

  // MÉDIAS
  {
    id: 6,
    level: 'medio',
    chapter: 'Cap. 19: O Batismo no Espírito Santo',
    question: 'Qual é a evidência física inicial imediata do Batismo no Espírito Santo?',
    options: [
      'Uma forte sensação de calor ou tremor físico generalizado',
      'O falar em outras línguas (glossolalia), conforme o Espírito concede',
      'A obtenção imediata de um diploma teológico acadêmico',
      'Um estado de transe inconsciente no qual o crente não se lembra do que fez'
    ],
    answer: 1,
    explanation: 'No Cap. 19, afirma-se o batismo no Espírito Santo como uma bênção distinta da salvação, acompanhado da evidência inicial e física de falar em outras línguas (At 2.4; 10.44-46).',
  },
  {
    id: 7,
    level: 'medio',
    chapter: 'Cap. 7 e 9: Antropologia e Hamartiologia',
    question: 'A respeito da criação do homem e da origem do pecado, o que ensina a Declaração de Fé?',
    options: [
      'O homem evoluiu de ancestrais primatas através da seleção de espécies',
      'O pecado foi planejado e criado por Deus para punir a humanidade futuramente',
      'O homem foi criado diretamente por Deus, e o pecado se originou na rebelião do querubim ungido',
      'O pecado é apenas uma ilusão criada pela falta de progresso científico social'
    ],
    answer: 2,
    explanation: 'O Cap. 7 e 9 rejeitam o evolucionismo, ensinando a criação imediata do homem (Gn 1.27) e que o pecado originou-se na livre rebelião de Lúcifer antes da queda humana.',
  },
  {
    id: 8,
    level: 'medio',
    chapter: 'Cap. 10: A Salvação',
    question: 'A justificação do homem diante do Deus Santo ocorre de qual maneira?',
    options: [
      'Através de boas obras, caridade e ritos sacramentais obrigatórios',
      'Exclusivamente pela fé em Jesus Cristo, mediante a maravilhosa graça de Deus',
      'Através de reencarnações e purificações morais sucessivas',
      'Pela obediência cega e literal aos preceitos da lei mosaica do Sinai'
    ],
    answer: 1,
    explanation: 'O Cap. 10 ensina que a salvação e justificação são concedidas gratuitamente pela graça divina por meio da fé no sacrifício expiatório de Cristo (Ef 2.8-9).',
  },
  {
    id: 9,
    level: 'medio',
    chapter: 'Cap. 20: Os Dons Espirituais',
    question: 'Sobre a atualidade dos dons espirituais na igreja hodierna, a Declaração de Fé ensina que:',
    options: [
      'Eles cessaram por completo com o fechamento do cânon bíblico',
      'Os dons servem prioritariamente para a autopromoção e exaltação do portador',
      'Eles continuam em pleno vigor para a edificação, exortação e consolo da Igreja',
      'Apenas os pastores da diretoria executiva possuem dons sobrenaturais reais'
    ],
    answer: 2,
    explanation: 'O Cap. 20 afirma que os dons espirituais continuam plenamente ativos e são concedidos pelo Espírito Santo para edificação mútua do Corpo de Cristo (1 Co 12.4-11; 14.3).',
  },
  {
    id: 10,
    level: 'medio',
    chapter: 'Cap. 12: A Ceia do Senhor',
    question: 'Os elementos da Ceia do Senhor (pão e vinho) significam o quê na teologia pentecostal?',
    options: [
      'O corpo e o sangue literais através da transubstanciação física',
      'Símbolos sagrados memoriais que representam o corpo moído e o sangue de Cristo na cruz',
      'Apenas um lanche comum para integração social dos membros',
      'Elementos misteriosos que transmitem imortalidade física imediata'
    ],
    answer: 1,
    explanation: 'No Cap. 12, ensina-se que o pão e o fruto da videira são símbolos memoriais e espirituais que representam o sacrifício de Jesus, apontando para Sua Segunda Vinda (1 Co 11.23-26).',
  },

  // DIFÍCEIS
  {
    id: 11,
    level: 'dificil',
    chapter: 'Cap. 22: A Segunda Vinda de Cristo',
    question: 'Qual é a posição escatológica oficial da CGADB/CPAD sobre o Arrebatamento?',
    options: [
      'A Igreja passará por toda a Grande Tribulação para ser purificada pelas pragas',
      'A Grande Tribulação já ocorreu integralmente no ano 70 d.C. sob o Império Romano',
      'A Igreja será arrebatada de forma pré-tribulacionista, antes da ira do Anticristo',
      'Não haverá Arrebatamento literal, sendo apenas um símbolo literário poético'
    ],
    answer: 2,
    explanation: 'O Cap. 22 ensina a escatologia pré-tribulacionista clássica. A Igreja será arrebatada nos ares antes da manifestação do Anticristo e do derramamento das taças da ira (1 Ts 4.16-17; 5.9).',
  },
  {
    id: 12,
    level: 'dificil',
    chapter: 'Cap. 22: O Milênio Literal',
    question: 'O que a Declaração de Fé ensina sobre o Reino Milenar de Cristo sobre a terra?',
    options: [
      'Será um reinado apenas moral e virtual exercido na mente dos crentes',
      'Será um reino literal de mil anos de paz física na terra, onde Cristo governará com a Igreja',
      'O milênio é uma figura metafórica cumprida durante a Idade Média',
      'O reino milenar já findou e foi sucedido pelo juízo de forma imediata'
    ],
    answer: 1,
    explanation: 'O Cap. 22 afirma categoricamente que, após a tribulação, Cristo implantará na terra um reino teocrático e literal de 1000 anos de paz e justiça perfeita (Ap 20.4-6).',
  },
  {
    id: 13,
    level: 'dificil',
    chapter: 'Cap. 4 e 5: Cristologia',
    question: 'Sobre as duas naturezas de Jesus Cristo, qual a posição teológica ortodoxa da igreja?',
    options: [
      'Ele possui apenas a natureza divina, sendo a forma humana uma mera ilusão de ótica',
      'Duas naturezas perfeitas, a divina e a humana, unidas de forma hipostática em uma só pessoa',
      'Duas personalidades que entravam em conflito constante',
      'Ele era apenas um homem comum adotado por Deus após o batismo no rio Jordão'
    ],
    answer: 1,
    explanation: 'O Cap. 4 e 5 ensinam a união hipostática: Jesus é verdadeiro Deus e verdadeiro homem em uma só pessoa divina, sem divisão, mistura ou confusão (Jo 1.1,14; Cl 2.9).',
  },
  {
    id: 14,
    level: 'dificil',
    chapter: 'Cap. 6: Pneumatologia',
    question: 'O Espírito Santo é definido biblicamente como sendo o quê na Trindade?',
    options: [
      'Uma força ativa impessoal ou vento impelido por Deus',
      'O aspecto místico feminino da divindade cósmica',
      'A terceira pessoa da Santíssima Trindade, possuidor de personalidade divina e atributos eternos',
      'Um anjo de alta categoria enviado para guiar os apóstolos'
    ],
    answer: 2,
    explanation: 'O Cap. 6 estabelece que o Espírito Santo é uma pessoa divina real (inteligência, vontade, sentimentos) e coeterna com o Pai e o Filho, possuindo atributos divinos absolutos (At 5.3-4).',
  },

  // PERGUNTA FINAL
  {
    id: 15,
    level: 'final',
    chapter: 'Cap. 23: O Juízo Final e Estado Eterno',
    question: 'O que acontecerá imediatamente após o término do Milênio e a derrota de Satanás?',
    options: [
      'O aniquilamento absoluto de todas as almas perdidas para encerrar o sofrimento',
      'A ressurreição dos ímpios para o Juízo Final perante o Grande Trono Branco, seguida do Estado Eterno',
      'A salvação de todos os demônios de forma automática por misericórdia cósmica',
      'Um segundo período milenar de testes sob o governo de Davi'
    ],
    answer: 1,
    explanation: 'O Cap. 23 assevera o Juízo Final literal perante o Grande Trono Branco, onde os mortos ímpios ressuscitarão para condenação eterna no lago de fogo, seguido do Novo Céu e Nova Terra (Ap 20.11-15).',
  }
];

const PRIZES = [
  1000, 2000, 3000, 4000, 5000,     // Fáceis
  10000, 20000, 30000, 40000, 50000, // Médias
  100000, 200000, 300000, 400000, 500000, // Difíceis
  1000000 // Pergunta Final
];

// Configurações do Tetris
const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ]
};

const COLORS = {
  I: 'bg-cyan-500 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]',
  O: 'bg-yellow-500 border-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.6)]',
  T: 'bg-purple-500 border-purple-450 shadow-[0_0_8px_rgba(168,85,247,0.6)]',
  S: 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
  Z: 'bg-rose-500 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
  J: 'bg-blue-500 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
  L: 'bg-amber-500 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
};

const COLS = 10;
const ROWS = 20;

interface ModuleInterativoProps {
  onClose?: () => void;
}

export default function ModuleInterativo({ onClose }: ModuleInterativoProps = {}) {
  const [activeGame, setActiveGame] = useState<'none' | 'tetris' | 'show' | 'passa' | 'escape' | 'roda'>('none');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHubMaximized, setIsHubMaximized] = useState(false);
  const [scores, setScores] = useState({
    tetris: 0,
    show: 0,
    passa: 0,
    escape: 0,
    roda: 0
  });

  useEffect(() => {
    const savedTetris = localStorage.getItem('gipp_game_tetris_score');
    const savedShow = localStorage.getItem('gipp_game_show_score');
    const savedPassa = localStorage.getItem('gipp_game_passa_score');
    const savedEscape = localStorage.getItem('gipp_game_escape_score');
    const savedRoda = localStorage.getItem('gipp_game_roda_score');
    if (savedTetris) setScores(prev => ({ ...prev, tetris: parseInt(savedTetris) }));
    if (savedShow) setScores(prev => ({ ...prev, show: parseInt(savedShow) }));
    if (savedPassa) setScores(prev => ({ ...prev, passa: parseInt(savedPassa) }));
    if (savedEscape) setScores(prev => ({ ...prev, escape: parseInt(savedEscape) }));
    if (savedRoda) setScores(prev => ({ ...prev, roda: parseInt(savedRoda) }));
  }, []);

  const updateHighScore = (game: 'tetris' | 'show' | 'passa' | 'escape' | 'roda', val: number) => {
    setScores(prev => {
      if (val > prev[game]) {
        const next = { ...prev, [game]: val };
        localStorage.setItem(`gipp_game_${game}_score`, val.toString());
        return next;
      }
      return prev;
    });
  };

  return (
    <div 
      id="module-interativo-container" 
      className={`w-full bg-slate-950 text-slate-100 flex flex-col font-sans transition-all duration-300 ${
        isHubMaximized 
          ? 'fixed inset-0 z-[99999] w-screen h-screen overflow-y-auto custom-scrollbar' 
          : 'min-h-screen relative'
      }`}
    >
      
      {/* BARRA SUPERIOR DE CONTROLE E MAXIMIZAÇÃO (SISTEMA INDEPENDENTE) */}
      <div className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 md:px-8 py-3 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shadow-inner">
            <Gamepad2 size={18} />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-white tracking-wide uppercase flex items-center gap-2">
              GIPP Interativo & Gamificação
              {isHubMaximized && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Sistema Independente
                </span>
              )}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Jogos & Dinâmicas Eclesiásticas Edificantes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHubMaximized(!isHubMaximized)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-extrabold flex items-center gap-2 transition-all border border-slate-700/60 cursor-pointer shadow-sm active:scale-95"
            title={isHubMaximized ? "Restaurar layout do portal" : "Maximizar tela sobrepondo menus (Sistema Independente)"}
          >
            {isHubMaximized ? (
              <>
                <Minimize2 size={14} className="text-amber-400" />
                <span className="hidden sm:inline">Restaurar Layout</span>
              </>
            ) : (
              <>
                <Maximize2 size={14} className="text-indigo-400" />
                <span className="hidden sm:inline">Maximizar</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600/30 text-rose-300 hover:text-white text-xs font-black flex items-center gap-2 transition-all border border-rose-500/30 cursor-pointer shadow-sm active:scale-95"
              title="Fechar Módulo Interativo e Voltar ao Portal"
            >
              <X size={15} className="text-rose-400" />
              <span className="hidden sm:inline">Fechar / Voltar ao Portal</span>
              <span className="sm:hidden">Fechar</span>
            </button>
          )}
        </div>
      </div>
      
      {/* HEADER DE BOAS VINDAS DA CENTRAL */}
      {activeGame === 'none' && (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-black text-indigo-400 tracking-widest uppercase inline-flex items-center gap-2 mb-4">
              <Sparkles size={14} className="animate-pulse" />
              Módulo de Interatividade & Gamificação Cristã
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent mb-4">
              GIPP Interativo & Edificação
            </h1>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              Plataforma completa de dinamização e gamificação eclesiástica! Divirta-se em família, na EBD, nos grupos de jovens ou no ministério infantil com jogos teológicos fundamentados na Declaração de Fé da CGADB/CPAD.
            </p>
          </div>

          {/* GRID DE CARTÕES DE GAMES (5 JOGOS) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
            
            {/* CARD 1: TETRIS CLÁSSICO */}
            <div className="group relative bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl hover:border-indigo-500/30 transition-all hover:scale-[1.01] duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-all"></div>
              <div>
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <Gamepad2 size={24} />
                </div>
                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                  Tetris Tradicional
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Agilidade</span>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  Encaixe os blocos que caem sob gravidade progressiva. Limpe linhas inteiras para acumular pontos, subir de nível e quebrar seu recorde pessoal.
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Recorde</p>
                  <p className="text-lg font-black text-indigo-400">{scores.tetris} Pts</p>
                </div>
                <button 
                  onClick={() => { setActiveGame('tetris'); setIsFullscreen(false); }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play size={14} fill="currentColor" />
                  Jogar
                </button>
              </div>
            </div>

            {/* CARD 2: SHOW DO CRISTÃO */}
            <div className="group relative bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl hover:border-amber-500/30 transition-all hover:scale-[1.01] duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-all"></div>
              <div>
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <Trophy size={24} />
                </div>
                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                  Show do Cristão
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Teologia</span>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  Avance pelas perguntas teológicas de níveis crescentes e conquiste prêmios fictícios até 1.000.000 Pts! Com Cartas, Universitários, Placas e Pulos.
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Maior Prêmio</p>
                  <p className="text-lg font-black text-amber-400">{scores.show.toLocaleString('pt-BR')} Pts</p>
                </div>
                <button 
                  onClick={() => { setActiveGame('show'); setIsFullscreen(false); }}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play size={14} fill="currentColor" />
                  Jogar
                </button>
              </div>
            </div>

            {/* CARD 3: PASSA OU REPASSA TEOLÓGICO */}
            <div className="group relative bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl hover:border-rose-500/30 transition-all hover:scale-[1.01] duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/10 transition-all"></div>
              <div>
                <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <Flame size={24} />
                </div>
                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                  Passa ou Repassa
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Equipes</span>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  Duelo eletrizante entre a **Equipe Azul** e a **Equipe Vermelha**! Responda, Passe, Repasse ou leve uma animada **Torta no Rosto** virtual!
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Recorde Geral</p>
                  <p className="text-lg font-black text-rose-400">{scores.passa} Pts</p>
                </div>
                <button 
                  onClick={() => { setActiveGame('passa'); setIsFullscreen(false); }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:shadow-lg hover:shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play size={14} fill="currentColor" />
                  Jogar
                </button>
              </div>
            </div>

            {/* CARD 4: ESCAPE ROOM BÍBLICO */}
            <div className="group relative bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl hover:border-emerald-500/30 transition-all hover:scale-[1.01] duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all"></div>
              <div>
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <Key size={24} />
                </div>
                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                  Escape Room Bíblico
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Enigma</span>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  Investigue o Tabernáculo de Moisés, decifre as pistas bíblicas nos objetos sagrados e descubra a combinação secreta para abrir a Arca e escapar!
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Fugas Concluídas</p>
                  <p className="text-lg font-black text-emerald-400">{scores.escape} x</p>
                </div>
                <button 
                  onClick={() => { setActiveGame('escape'); setIsFullscreen(false); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play size={14} fill="currentColor" />
                  Jogar
                </button>
              </div>
            </div>

            {/* CARD 5: RODA DA TEOLOGIA */}
            <div className="group relative bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl hover:border-cyan-500/30 transition-all hover:scale-[1.01] duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-all"></div>
              <div>
                <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <Disc size={24} />
                </div>
                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                  Roda da Teologia
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Roleta</span>
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  Gire a roleta teológica, sorteie categorias doutrinárias (Pneumatologia, Cristologia, Escatologia) e acumule bônus da graça e pontuações!
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Recorde Roleta</p>
                  <p className="text-lg font-black text-cyan-400">{scores.roda} Pts</p>
                </div>
                <button 
                  onClick={() => { setActiveGame('roda'); setIsFullscreen(false); }}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play size={14} fill="currentColor" />
                  Jogar
                </button>
              </div>
            </div>

          </div>

          <div className="mt-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2 max-w-lg mx-auto bg-slate-900/25 p-4 rounded-2xl border border-slate-800/40">
            <Info size={14} className="text-indigo-400 shrink-0" />
            <span>Seus recordes e troféus são salvos de forma 100% segura e direta no navegador para futuras visitas.</span>
          </div>
        </div>
      )}

      {/* JANELA EXCLUSIVA FULL HD / HD */}
      {activeGame !== 'none' && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-0 md:p-4 no-print overflow-hidden">
          <div className={`flex flex-col bg-slate-950 border border-slate-800 shadow-2xl transition-all duration-300 overflow-hidden ${
            isFullscreen ? 'fixed inset-0 w-screen h-screen rounded-none z-[100000]' : 'max-w-6xl w-full h-[92vh] rounded-2xl md:rounded-3xl relative z-10'
          }`}>
            
            {/* TOPO DA JANELA */}
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeGame === 'tetris' ? 'bg-indigo-500/10 text-indigo-400' :
                  activeGame === 'show' ? 'bg-amber-500/10 text-amber-400' :
                  activeGame === 'passa' ? 'bg-rose-500/10 text-rose-400' :
                  activeGame === 'escape' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-cyan-500/10 text-cyan-400'
                }`}>
                  {activeGame === 'tetris' && <Gamepad2 size={16} />}
                  {activeGame === 'show' && <Trophy size={16} />}
                  {activeGame === 'passa' && <Flame size={16} />}
                  {activeGame === 'escape' && <Key size={16} />}
                  {activeGame === 'roda' && <Disc size={16} />}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white tracking-wide uppercase">
                    {activeGame === 'tetris' && 'TETRIS TRADICIONAL GIPP'}
                    {activeGame === 'show' && 'SHOW DO CRISTÃO GIPP'}
                    {activeGame === 'passa' && 'PASSA OU REPASSA TEOLÓGICO'}
                    {activeGame === 'escape' && 'ESCAPE ROOM BÍBLICO - O TABERNÁCULO'}
                    {activeGame === 'roda' && 'RODA DA TEOLOGIA GIPP'}
                  </h3>
                  <p className="text-[10px] text-slate-450 uppercase tracking-wider font-semibold leading-none mt-1">
                    {isFullscreen ? 'Modo Full HD / Tela Inteira' : 'Janela HD'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? 'Janela Padrão' : 'Tela Cheia (Full HD)'}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-400 transition-all cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <button
                  onClick={() => setActiveGame('none')}
                  title="Fechar Jogo"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* CONTEÚDO DINÂMICO DO GAME */}
            <div className="flex-1 overflow-y-auto bg-slate-950 flex flex-col relative">
              {activeGame === 'tetris' && (
                <TetrisGame onGameOver={(score) => updateHighScore('tetris', score)} highScore={scores.tetris} />
              )}
              {activeGame === 'show' && (
                <ShowDoCristaoGame onGameOver={(prize) => updateHighScore('show', prize)} highScore={scores.show} />
              )}
              {activeGame === 'passa' && (
                <PassaOuRepassaGame onGameOver={(score) => updateHighScore('passa', score)} highScore={scores.passa} />
              )}
              {activeGame === 'escape' && (
                <EscapeRoomGame onGameOver={(successCount) => updateHighScore('escape', successCount)} highScore={scores.escape} />
              )}
              {activeGame === 'roda' && (
                <RodaDaTeologiaGame onGameOver={(score) => updateHighScore('roda', score)} highScore={scores.roda} />
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUBCOMPONENTE: GAME DE TETRIS TRADICIONAL
// ==========================================
interface TetrisProps {
  onGameOver: (score: number) => void;
  highScore: number;
}

function TetrisGame({ onGameOver, highScore }: TetrisProps) {
  const [grid, setGrid] = useState<string[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLost, setIsLost] = useState(false);

  // Posição ajustável do painel do controle direcional virtual no celular
  // Opções: 'right' (Direita), 'left' (Esquerda), 'center' (Centro)
  const [mobileControllerPos, setMobileControllerPos] = useState<'left' | 'center' | 'right'>('right');

  // Estados para arrastar o painel direcional (controle móvel) de forma livre
  const [dpadOffset, setDpadOffset] = useState({ x: 0, y: 0 });
  const dpadDragStart = useRef({ x: 0, y: 0 });
  const dpadOffsetStart = useRef({ x: 0, y: 0 });
  const [isDraggingDpad, setIsDraggingDpad] = useState(false);

  const handleDpadMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Só botão esquerdo
    dpadDragStart.current = { x: e.clientX, y: e.clientY };
    dpadOffsetStart.current = { ...dpadOffset };
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dpadDragStart.current.x;
      const dy = moveEvent.clientY - dpadDragStart.current.y;
      setIsDraggingDpad(true);
      setDpadOffset({
        x: dpadOffsetStart.current.x + dx,
        y: dpadOffsetStart.current.y + dy
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setTimeout(() => {
        setIsDraggingDpad(false);
      }, 50);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleDpadTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    dpadDragStart.current = { x: touch.clientX, y: touch.clientY };
    dpadOffsetStart.current = { ...dpadOffset };

    const onTouchMove = (moveEvent: TouchEvent) => {
      const touchMove = moveEvent.touches[0];
      const dx = touchMove.clientX - dpadDragStart.current.x;
      const dy = touchMove.clientY - dpadDragStart.current.y;
      setIsDraggingDpad(true);
      setDpadOffset({
        x: dpadOffsetStart.current.x + dx,
        y: dpadOffsetStart.current.y + dy
      });
    };

    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      setTimeout(() => {
        setIsDraggingDpad(false);
      }, 50);
    };

    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
  };

  // Estados das peças de Tetris
  const [currentPiece, setCurrentPiece] = useState<{
    shape: number[][];
    type: keyof typeof SHAPES;
    x: number;
    y: number;
  } | null>(null);

  const [nextPieceType, setNextPieceType] = useState<keyof typeof SHAPES>('I');

  const gameInterval = useRef<NodeJS.Timeout | null>(null);

  // Variáveis para detectar gestos de toque no tabuleiro
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const getRandomPieceType = (): keyof typeof SHAPES => {
    const keys = Object.keys(SHAPES) as (keyof typeof SHAPES)[];
    return keys[Math.floor(Math.random() * keys.length)];
  };

  const startGame = () => {
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill('')));
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsLost(false);
    setIsPaused(false);

    const firstType = getRandomPieceType();
    const nextType = getRandomPieceType();

    setNextPieceType(nextType);
    spawnPiece(firstType);
    setIsPlaying(true);
  };

  const spawnPiece = (type: keyof typeof SHAPES) => {
    const shape = SHAPES[type];
    setCurrentPiece({
      shape,
      type,
      x: Math.floor((COLS - shape[0].length) / 2),
      y: 0
    });
  };

  const checkCollision = (shape: number[][], x: number, y: number, currentGrid: string[][]): boolean => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const nextX = x + c;
          const nextY = y + r;

          if (nextX < 0 || nextX >= COLS || nextY >= ROWS) {
            return true;
          }

          if (nextY >= 0 && currentGrid[nextY][nextX] !== '') {
            return true;
          }
        }
      }
    }
    return false;
  };

  const lockPiece = (shape: number[][], type: string, x: number, y: number, currentGrid: string[][]) => {
    const nextGrid = currentGrid.map(row => [...row]);

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          if (y + r >= 0) {
            nextGrid[y + r][x + c] = type;
          }
        }
      }
    }

    let clearedLines = 0;
    const filteredGrid = nextGrid.filter(row => {
      const isComplete = row.every(cell => cell !== '');
      if (isComplete) clearedLines++;
      return !isComplete;
    });

    while (filteredGrid.length < ROWS) {
      filteredGrid.unshift(Array(COLS).fill(''));
    }

    let nextScore = score;
    if (clearedLines > 0) {
      const pointsTable = [0, 100, 300, 500, 800];
      const points = pointsTable[clearedLines] * level;
      nextScore = score + points;
      
      setScore(nextScore);
      setLines(prev => {
        const nextLines = prev + clearedLines;
        const nextLevel = Math.floor(nextLines / 10) + 1;
        setLevel(nextLevel);
        return nextLines;
      });
    }

    const currentNext = nextPieceType;
    const newNext = getRandomPieceType();
    setNextPieceType(newNext);

    if (checkCollision(SHAPES[currentNext], Math.floor((COLS - SHAPES[currentNext][0].length) / 2), 0, filteredGrid)) {
      setIsLost(true);
      setIsPlaying(false);
      onGameOver(nextScore);
    } else {
      setGrid(filteredGrid);
      spawnPiece(currentNext);
    }
  };

  const moveDown = () => {
    if (!isPlaying || isPaused || !currentPiece) return;

    if (!checkCollision(currentPiece.shape, currentPiece.x, currentPiece.y + 1, grid)) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
    } else {
      lockPiece(currentPiece.shape, currentPiece.type, currentPiece.x, currentPiece.y, grid);
    }
  };

  const moveHorizontal = (dir: number) => {
    if (!isPlaying || isPaused || !currentPiece) return;

    if (!checkCollision(currentPiece.shape, currentPiece.x + dir, currentPiece.y, grid)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x + dir } : null);
    }
  };

  const rotatePiece = () => {
    if (!isPlaying || isPaused || !currentPiece) return;

    const shape = currentPiece.shape;
    const N = shape.length;
    const M = shape[0].length;
    
    const rotated = Array(M).fill(null).map(() => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < M; c++) {
        rotated[c][N - 1 - r] = shape[r][c];
      }
    }

    let nextX = currentPiece.x;
    if (nextX + rotated[0].length > COLS) {
      nextX = COLS - rotated[0].length;
    }
    if (nextX < 0) nextX = 0;

    if (!checkCollision(rotated, nextX, currentPiece.y, grid)) {
      setCurrentPiece(prev => prev ? { ...prev, shape: rotated, x: nextX } : null);
    }
  };

  const hardDrop = () => {
    if (!isPlaying || isPaused || !currentPiece) return;

    let targetY = currentPiece.y;
    while (!checkCollision(currentPiece.shape, currentPiece.x, targetY + 1, grid)) {
      targetY++;
    }

    lockPiece(currentPiece.shape, currentPiece.type, currentPiece.x, targetY, grid);
  };

  // Tratadores de Gestos de Toque (Swipe e Tap) na Tela para Celular
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPlaying || isPaused) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isPlaying || isPaused || !touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;

    const swipeThreshold = 35; // Pixels mínimos para considerar deslizamento
    const tapThreshold = 180;  // Tempo máximo para considerar um toque rápido

    if (Math.abs(diffX) < 15 && Math.abs(diffY) < 15 && duration < tapThreshold) {
      // Toque rápido na tela -> Rotacionar peça
      rotatePiece();
    } else if (Math.abs(diffX) > Math.abs(diffY)) {
      // Deslizamento predominantemente horizontal
      if (diffX > swipeThreshold) {
        moveHorizontal(1); // Deslizar para direita
      } else if (diffX < -swipeThreshold) {
        moveHorizontal(-1); // Deslizar para esquerda
      }
    } else {
      // Deslizamento predominantemente vertical
      if (diffY > swipeThreshold) {
        moveDown(); // Deslizar para baixo
      } else if (diffY < -swipeThreshold) {
        hardDrop(); // Deslizar para cima -> Hard drop instantâneo!
      }
    }
    
    touchStartRef.current = null;
  };

  // Teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveHorizontal(-1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveHorizontal(1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          rotatePiece();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          moveDown();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, currentPiece, grid, level]);

  // Intervalo de queda progressiva com base no nível atual
  useEffect(() => {
    if (gameInterval.current) clearInterval(gameInterval.current);

    if (isPlaying && !isPaused) {
      const speed = Math.max(90, 850 - (level - 1) * 110);
      gameInterval.current = setInterval(() => {
        moveDown();
      }, speed);
    }

    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current);
    };
  }, [isPlaying, isPaused, currentPiece, grid, level]);

  const getRenderedGrid = () => {
    const render = grid.map(row => [...row]);
    if (currentPiece) {
      const { shape, type, x, y } = currentPiece;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] !== 0) {
            if (y + r >= 0 && y + r < ROWS && x + c >= 0 && x + c < COLS) {
              render[y + r][x + c] = type;
            }
          }
        }
      }
    }
    return render;
  };

  const currentRender = getRenderedGrid();

  return (
    <div className="flex-1 p-4 md:p-8 flex flex-col xl:flex-row gap-6 xl:gap-12 items-center justify-center max-w-5xl mx-auto w-full select-none">
      
      {/* PAINEL DE INFORMAÇÕES */}
      <div className="flex flex-row xl:flex-col gap-3 md:gap-4 w-full xl:w-48 justify-between xl:justify-start">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-1 xl:flex-none shadow-xl">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1">Pontuação</p>
          <p className="text-2xl md:text-3xl font-black text-white">{score}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-1 xl:flex-none shadow-xl flex justify-between items-center xl:flex-col xl:items-start gap-1">
          <div>
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-0.5">Nível</p>
            <p className="text-xl md:text-2xl font-black text-indigo-400">{level}</p>
          </div>
          <div className="xl:mt-3 xl:border-t xl:border-slate-800 xl:pt-3 xl:w-full">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-0.5">Linhas</p>
            <p className="text-xl md:text-2xl font-black text-emerald-400">{lines}</p>
          </div>
        </div>

        {/* PRÓXIMA PEÇA */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl hidden md:flex flex-col items-center w-36 xl:w-auto">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-3 text-center w-full">Seguinte</p>
          <div className="w-16 h-16 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800">
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${SHAPES[nextPieceType][0].length}, minmax(0, 1fr))` }}>
              {SHAPES[nextPieceType].map((row, r) => 
                row.map((cell, c) => (
                  <div 
                    key={`${r}-${c}`} 
                    className={`w-3.5 h-3.5 rounded-sm border ${cell !== 0 ? COLORS[nextPieceType] : 'bg-transparent border-transparent'}`}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA CENTRAL DO TABULEIRO COM TOQUE INTEGRADO */}
      <div className="relative">
        
        {/* LEGENDA DE CONTROLE POR TOQUE */}
        <div className="text-center text-[10px] text-slate-500 mb-2 font-medium md:hidden bg-slate-900/30 py-1.5 px-3 rounded-full border border-slate-800/40">
          💡 Deslize na tela do jogo para Mover. Toque rápido para Girar. Deslize para cima para Descer Tudo!
        </div>

        <div 
          className="bg-slate-900 border-4 border-slate-800 p-2 rounded-[2rem] shadow-[0_0_35px_rgba(0,0,0,0.9)] backdrop-blur-md cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="grid gap-[1.5px] bg-slate-950 rounded-2xl overflow-hidden"
            style={{ 
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              width: '280px',
              height: '500px'
            }}
          >
            {currentRender.map((row, r) =>
              row.map((cell, c) => (
                <div 
                  key={`${r}-${c}`} 
                  className={`w-full h-full border border-slate-900/20 transition-all rounded-[2px] ${
                    cell !== '' ? COLORS[cell as keyof typeof COLORS] : 'bg-slate-950/20 hover:bg-slate-900/5'
                  }`}
                />
              ))
            )}
          </div>
        </div>

        {/* OVERLAYS */}
        {!isPlaying && !isLost && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center p-6 text-center border border-slate-800">
            <Gamepad2 size={48} className="text-indigo-400 mb-4 animate-bounce" />
            <h4 className="text-xl font-extrabold text-white mb-2">Pronto para o Desafio?</h4>
            <p className="text-xs text-slate-400 max-w-[200px] mb-6">Use o painel abaixo, deslize a tela ou use o teclado físico (Setas).</p>
            <button 
              onClick={startGame}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl w-full max-w-[200px] hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer"
            >
              Iniciar Jogo
            </button>
          </div>
        )}

        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center p-6 text-center">
            <Pause size={44} className="text-yellow-400 mb-4 animate-pulse" />
            <h4 className="text-xl font-extrabold text-white mb-4">Jogo Pausado</h4>
            <button 
              onClick={() => setIsPaused(false)}
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black rounded-xl transition-all cursor-pointer"
            >
              Continuar
            </button>
          </div>
        )}

        {isLost && (
          <div className="absolute inset-0 bg-rose-950/95 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center p-6 text-center border-2 border-rose-500/30">
            <Award size={48} className="text-rose-400 mb-3 animate-pulse" />
            <h4 className="text-2xl font-black text-white mb-1">Fim de Jogo!</h4>
            <p className="text-xs text-rose-200 mb-4">Sua pontuação:</p>
            <p className="text-4xl font-black text-rose-400 mb-6">{score}</p>
            <button 
              onClick={startGame}
              className="px-6 py-3 bg-white text-slate-900 font-bold rounded-2xl w-full max-w-[200px] hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <RotateCcw size={16} />
              Jogar Novamente
            </button>
          </div>
        )}
      </div>

      {/* PAINEL DE CONTROLE DIGITAL E AJUSTE DE POSIÇÃO (MÓVEL NO CELULAR) */}
      <div className="flex flex-col gap-4 w-full xl:w-48 shrink-0">
        
        {/* RECORDE DO PORTAL */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-550 font-extrabold uppercase tracking-widest">Melhor Recorde</p>
            <p className="text-lg font-black text-amber-400">{highScore} pts</p>
          </div>
          <Trophy size={18} className="text-amber-400" />
        </div>

        {/* AJUSTE DE POSIÇÃO DO CONTROLE MÓVEL */}
        <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <SlidersHorizontal size={12} className="text-indigo-400" />
            <span>Alinhamento Inicial</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => { setMobileControllerPos('left'); setDpadOffset({ x: 0, y: 0 }); }} 
              className={`py-1 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${mobileControllerPos === 'left' ? 'bg-indigo-650 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Esq.
            </button>
            <button 
              onClick={() => { setMobileControllerPos('center'); setDpadOffset({ x: 0, y: 0 }); }} 
              className={`py-1 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${mobileControllerPos === 'center' ? 'bg-indigo-650 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Meio
            </button>
            <button 
              onClick={() => { setMobileControllerPos('right'); setDpadOffset({ x: 0, y: 0 }); }} 
              className={`py-1 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${mobileControllerPos === 'right' ? 'bg-indigo-650 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Dir.
            </button>
          </div>
        </div>

        {/* CONTROLES VIRTUAIS COM POSIÇÃO DINÂMICA NA INTERFACE */}
        <div 
          className={`bg-slate-900 border p-4 rounded-3xl shadow-2xl flex flex-col items-center gap-4 transition-transform duration-75 relative select-none ${
            mobileControllerPos === 'left' ? 'xl:order-first' : mobileControllerPos === 'center' ? 'max-w-[180px] mx-auto' : ''
          } ${isDraggingDpad ? 'cursor-grabbing border-indigo-500/55 shadow-indigo-500/10' : 'border-slate-800'}`}
          style={{ transform: `translate(${dpadOffset.x}px, ${dpadOffset.y}px)`, touchAction: 'none' }}
        >
          {/* DRAG HANDLE HEADER */}
          <div 
            onMouseDown={handleDpadMouseDown}
            onTouchStart={handleDpadTouchStart}
            className="w-full pb-2 border-b border-slate-800/60 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing select-none"
            title="Arraste para mover o painel livremente"
          >
            <div className="flex items-center gap-1.5">
              <Move size={12} className="text-indigo-400 shrink-0" />
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Painel Direcional</span>
            </div>
            {(dpadOffset.x !== 0 || dpadOffset.y !== 0) && (
              <button 
                onClick={(e) => { e.stopPropagation(); setDpadOffset({ x: 0, y: 0 }); }}
                className="text-[9px] bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider cursor-pointer"
                title="Resetar posição livre"
              >
                Reset
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2 w-full max-w-[160px] relative">
            <div></div>
            <button 
              onTouchStart={(e) => { e.preventDefault(); rotatePiece(); }}
              onClick={rotatePiece}
              className="w-11 h-11 bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center active:scale-90 shadow-md border border-slate-750 transition-all cursor-pointer"
              title="Girar"
            >
              <ArrowUp size={20} />
            </button>
            <div></div>

            <button 
              onTouchStart={(e) => { e.preventDefault(); moveHorizontal(-1); }}
              onClick={() => moveHorizontal(-1)}
              className="w-11 h-11 bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center active:scale-90 shadow-md border border-slate-750 transition-all cursor-pointer"
              title="Mover Esquerda"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onTouchStart={(e) => { e.preventDefault(); hardDrop(); }}
              onClick={hardDrop}
              className="w-11 h-11 bg-indigo-500/20 active:bg-indigo-500 active:text-white border border-indigo-550 text-indigo-400 font-black text-xs rounded-xl flex items-center justify-center active:scale-90 shadow-inner transition-all cursor-pointer"
              title="Hard Drop"
            >
              DROP
            </button>
            <button 
              onTouchStart={(e) => { e.preventDefault(); moveHorizontal(1); }}
              onClick={() => moveHorizontal(1)}
              className="w-11 h-11 bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center active:scale-90 shadow-md border border-slate-750 transition-all cursor-pointer"
              title="Mover Direita"
            >
              <ArrowRight size={20} />
            </button>

            <div></div>
            <button 
              onTouchStart={(e) => { e.preventDefault(); moveDown(); }}
              onClick={moveDown}
              className="w-11 h-11 bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center active:scale-90 shadow-md border border-slate-750 transition-all cursor-pointer"
              title="Descer Macio"
            >
              <ArrowDown size={20} />
            </button>
            <div></div>
          </div>

          {isPlaying && (
            <button 
              onClick={() => setIsPaused(p => !p)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pause size={12} />
              {isPaused ? 'Retomar' : 'Pausar'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

// ==========================================
// SUBCOMPONENTE: GAME SHOW DO CRISTÃO (ESTILO SHOW DO MILHÃO)
// ==========================================
interface ShowDoCristaoProps {
  onGameOver: (prize: number) => void;
  highScore: number;
}

function ShowDoCristaoGame({ onGameOver, highScore }: ShowDoCristaoProps) {
  const [gameState, setGameState] = useState<'welcome' | 'playing' | 'gameover' | 'won'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [hasChosenCorrect, setHasChosenCorrect] = useState<boolean | null>(null);

  // Ajudas Clássicas do Show do Milhão
  const [helps, setHelps] = useState({
    pulos: 3,
    cartas: 1,
    universitarios: 1,
    placas: 1
  });

  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [activeHelpResult, setActiveHelpResult] = useState<{
    type: 'cartas' | 'universitarios' | 'placas' | null;
    message: string;
    data?: any;
  }>({ type: null, message: '' });

  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);

  const initGameQuestions = () => {
    // Escolhe dinamicamente perguntas aleatórias de cada nível de dificuldade do banco
    const faciles = QUESTIONS_DB.filter(q => q.level === 'facil').sort(() => Math.random() - 0.5).slice(0, 5);
    const medias = QUESTIONS_DB.filter(q => q.level === 'medio').sort(() => Math.random() - 0.5).slice(0, 5);
    const dificeis = QUESTIONS_DB.filter(q => q.level === 'dificil').sort(() => Math.random() - 0.5).slice(0, 4);
    const final = QUESTIONS_DB.filter(q => q.level === 'final');

    const combined = [...faciles, ...medias, ...dificeis, ...final];
    setGameQuestions(combined);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setHasChosenCorrect(null);
    setEliminatedOptions([]);
    setActiveHelpResult({ type: null, message: '' });
    setHelps({ pulos: 3, cartas: 1, universitarios: 1, placas: 1 });
    setGameState('playing');
  };

  const currentQuestion = gameQuestions[currentQuestionIndex];
  
  const getPrizeStatus = () => {
    const qIndex = currentQuestionIndex;
    const currentPrize = qIndex > 0 ? PRIZES[qIndex - 1] : 0;
    const targetPrize = PRIZES[qIndex];
    const failPrize = Math.floor(currentPrize / 2);
    const stopPrize = currentPrize;

    return {
      current: currentPrize,
      target: targetPrize,
      fail: failPrize,
      stop: stopPrize
    };
  };

  const prizeStatus = getPrizeStatus();

  const handleOptionClick = (idx: number) => {
    if (isAnswered || eliminatedOptions.includes(idx)) return;
    setSelectedOption(idx);
  };

  const confirmAnswer = () => {
    if (selectedOption === null || isAnswered) return;

    const correct = selectedOption === currentQuestion.answer;
    setIsAnswered(true);
    setHasChosenCorrect(correct);

    if (correct) {
      if (currentQuestionIndex === gameQuestions.length - 1) {
        setTimeout(() => {
          setGameState('won');
          onGameOver(1000000);
        }, 3500);
      }
    } else {
      setTimeout(() => {
        setGameState('gameover');
        onGameOver(prizeStatus.fail);
      }, 3500);
    }
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
    setHasChosenCorrect(null);
    setEliminatedOptions([]);
    setActiveHelpResult({ type: null, message: '' });
  };

  const stopGame = () => {
    setGameState('gameover');
    onGameOver(prizeStatus.stop);
  };

  // Ajuda de Pulos
  const usePulo = () => {
    if (helps.pulos <= 0 || isAnswered) return;
    setHelps(prev => ({ ...prev, pulos: prev.pulos - 1 }));
    nextQuestion();
  };

  // Ajuda de Cartas
  const useCartas = () => {
    if (helps.cartas <= 0 || isAnswered) return;
    setHelps(prev => ({ ...prev, cartas: prev.cartas - 1 }));

    // Cartas eliminam de 0 a 3 alternativas falsas
    const randomCount = [1, 2, 3, 0][Math.floor(Math.random() * 4)];
    
    const incorrectIndices: number[] = [];
    currentQuestion.options.forEach((_, idx) => {
      if (idx !== currentQuestion.answer) {
        incorrectIndices.push(idx);
      }
    });

    const toEliminate = incorrectIndices.sort(() => Math.random() - 0.5).slice(0, randomCount);
    setEliminatedOptions(toEliminate);

    let msg = '';
    if (randomCount === 0) {
      msg = 'Você virou o Rei! Nenhuma alternativa incorreta foi eliminada.';
    } else {
      msg = `Você virou o número ${randomCount}! Foram eliminadas ${randomCount} alternativa(s) errada(s).`;
    }

    setActiveHelpResult({
      type: 'cartas',
      message: msg
    });
  };

  // Ajuda de Universitários (Conselheiros da EBD / Diáconos / Bacharéis)
  const useUniversitarios = () => {
    if (helps.universitarios <= 0 || isAnswered) return;
    setHelps(prev => ({ ...prev, universitarios: prev.universitarios - 1 }));

    const rightAns = currentQuestion.answer;
    
    let correctPercent = 85;
    if (currentQuestion.level === 'medio') correctPercent = 65;
    if (currentQuestion.level === 'dificil') correctPercent = 45;
    if (currentQuestion.level === 'final') correctPercent = 30;

    const remaining = 100 - correctPercent;
    const r1 = Math.floor(Math.random() * remaining);
    const r2 = Math.floor(Math.random() * (remaining - r1));
    const r3 = remaining - r1 - r2;

    const percents = [0, 0, 0, 0];
    percents[rightAns] = correctPercent;
    
    let remIdx = 0;
    const remVals = [r1, r2, r3];
    percents.forEach((_, idx) => {
      if (idx !== rightAns) {
        percents[idx] = remVals[remIdx];
        remIdx++;
      }
    });

    const students = [
      { name: 'Irmão Lucas (Graduado)', vote: percents },
      { name: 'Obreira Sarah (Profª EBD)', vote: percents },
      { name: 'Diácono Tiago (Estudioso)', vote: percents }
    ];

    setActiveHelpResult({
      type: 'universitarios',
      message: 'Os universitários deram seus palpites teológicos para cada alternativa:',
      data: students
    });
  };

  // Ajuda de Placas (Votação da Plateia da Assembléia de Deus)
  const usePlacas = () => {
    if (helps.placas <= 0 || isAnswered) return;
    setHelps(prev => ({ ...prev, placas: prev.placas - 1 }));

    const rightAns = currentQuestion.answer;
    
    let rightVote = 78;
    if (currentQuestion.level === 'medio') rightVote = 58;
    if (currentQuestion.level === 'dificil') rightVote = 38;
    if (currentQuestion.level === 'final') rightVote = 25;

    const remaining = 100 - rightVote;
    const r1 = Math.floor(Math.random() * remaining);
    const r2 = Math.floor(Math.random() * (remaining - r1));
    const r3 = remaining - r1 - r2;

    const percents = [0, 0, 0, 0];
    percents[rightAns] = rightVote;
    
    let remIdx = 0;
    const remVals = [r1, r2, r3];
    percents.forEach((_, idx) => {
      if (idx !== rightAns) {
        percents[idx] = remVals[remIdx];
        remIdx++;
      }
    });

    setActiveHelpResult({
      type: 'placas',
      message: 'A plateia de obreiros e membros ergueu as placas votando nas opções:',
      data: percents
    });
  };

  // TELA DE BOAS VINDAS DO SHOW DO CRISTÃO
  if (gameState === 'welcome') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto w-full select-none">
        
        {/* LOGO RETRO ESTILO SHOW DO MILHÃO COM CORES CORRIGIDAS */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative bg-gradient-to-b from-blue-900 to-indigo-950 border-4 border-amber-400 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center">
            <Trophy size={64} className="text-amber-400 mb-4 animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
              Show do <span className="text-amber-400">Cristão</span>
            </h1>
            <p className="text-[11px] text-indigo-300 font-extrabold uppercase tracking-widest mt-2">
              Teologia Oficial Assembleias de Deus (CGADB)
            </p>
          </div>
        </div>

        <h4 className="text-xl font-bold text-white mb-3">Teste seus conhecimentos bíblicos valendo 1.000.000 Pts fictícios!</h4>
        <p className="text-sm text-slate-400 max-w-lg leading-relaxed mb-8">
          Responda a perguntas elaboradas com base na **Declaração de Fé (CPAD/CGADB)**. Você começará no nível Fácil e subirá até 1.000.000 Pts. Use suas ajudas de forma inteligente para não ser eliminado!
        </p>

        {/* BOTAO CORRIGIDO - BRILHANTE E POLIDO, NADA DE 550 */}
        <button 
          onClick={initGameQuestions}
          className="px-10 py-5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 text-lg font-black rounded-3xl hover:shadow-xl hover:shadow-amber-500/35 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-3"
        >
          <Play size={20} fill="currentColor" />
          Começar o Show!
        </button>
      </div>
    );
  }

  // TELA DE VITÓRIA DE 1.000.000 Pts!
  if (gameState === 'won') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto w-full select-none">
        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/30 animate-pulse">
          <Trophy size={48} className="text-slate-950 animate-bounce" />
        </div>
        <h2 className="text-4xl font-black text-amber-400 mb-2">Parabéns!</h2>
        <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-4">Você é o Novo Milionário da Fé!</p>
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          Você superou todas as 15 perguntas teológicas complexas baseadas na Declaração de Fé das Assembleias de Deus e conquistou o prêmio máximo!
        </p>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full mb-8">
          <p className="text-xs text-slate-500 font-extrabold uppercase tracking-widest mb-1">Prêmio Final Conquistado</p>
          <p className="text-4xl font-black text-amber-400 tracking-tight">1.000.000 Pts</p>
        </div>
        <button 
          onClick={initGameQuestions}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl w-full max-w-xs transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          Jogar Novamente
        </button>
      </div>
    );
  }

  // TELA DE GAME OVER (ERRAR OU PARAR)
  if (gameState === 'gameover') {
    const finalPrize = prizeStatus.stop === 0 ? 0 : prizeStatus.stop;
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full select-none">
        <div className="w-20 h-20 bg-rose-500/10 border-2 border-rose-500/20 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={36} className="text-rose-400 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Fim de Jogo!</h2>
        <p className="text-xs text-slate-400 mb-6">Você encerrou sua rodada do Show do Cristão.</p>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl w-full mb-8">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1">Prêmio Conquistado</p>
          <p className="text-3xl font-black text-emerald-450">{finalPrize.toLocaleString('pt-BR')} Pts</p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={initGameQuestions}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black rounded-2xl transition-all cursor-pointer"
          >
            Tentar Novamente
          </button>
          <button 
            onClick={() => setGameState('welcome')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-2xl transition-all cursor-pointer"
          >
            Voltar ao Menu do Jogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 flex flex-col lg:flex-row gap-8 items-stretch max-w-6xl mx-auto w-full select-none">
      
      {/* CONTEÚDO PRINCIPAL (PERGUNTA E ALTERNATIVAS) */}
      <div className="flex-1 flex flex-col justify-between gap-6">
        
        {/* TOPO: STATUS DO PRÊMIO */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex justify-between items-center gap-4">
          <div>
            <span className="px-2.5 py-1 bg-indigo-500/15 border border-indigo-500/25 text-[9px] font-black text-indigo-400 tracking-wider rounded-md uppercase">
              Pergunta {currentQuestionIndex + 1} de 15
            </span>
            <div className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">
              Nível: <span className="font-bold text-white capitalize">{currentQuestion.level}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Valendo</p>
            <p className="text-2xl font-black text-amber-400">{prizeStatus.target.toLocaleString('pt-BR')} Pts</p>
          </div>
        </div>

        {/* BLOCO DA PERGUNTA */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8 rounded-[2rem] relative shadow-inner">
          <div className="absolute -top-3.5 left-6 px-4 py-1 bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider rounded-md uppercase">
            {currentQuestion.chapter}
          </div>
          <h3 className="text-lg md:text-xl font-bold leading-relaxed text-white mt-2">
            "{currentQuestion.question}"
          </h3>
        </div>

        {/* BLOCO DAS ALTERNATIVAS */}
        <div className="grid gap-3">
          {currentQuestion.options.map((option, idx) => {
            const label = ['A', 'B', 'C', 'D'][idx];
            const isEliminated = eliminatedOptions.includes(idx);
            
            let btnStyle = "border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-200";
            if (isEliminated) {
              btnStyle = "border-slate-900 bg-slate-950/40 text-slate-650 line-through cursor-not-allowed pointer-events-none";
            } else if (isAnswered) {
              if (idx === currentQuestion.answer) {
                btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-2 ring-emerald-500/40";
              } else if (idx === selectedOption) {
                btnStyle = "border-rose-500 bg-rose-500/10 text-rose-300 ring-2 ring-rose-500/40";
              }
            } else if (selectedOption === idx) {
              btnStyle = "border-amber-400 bg-amber-400/10 text-amber-300 ring-2 ring-amber-400/40";
            }

            return (
              <button
                key={idx}
                disabled={isAnswered || isEliminated}
                onClick={() => handleOptionClick(idx)}
                className={`w-full p-4 md:p-5 rounded-2xl border text-left text-sm md:text-base font-bold transition-all flex items-center gap-4 cursor-pointer ${btnStyle}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs md:text-sm ${
                  isEliminated ? 'bg-slate-900 text-slate-700' :
                  isAnswered && idx === currentQuestion.answer ? 'bg-emerald-500 text-slate-950' :
                  isAnswered && idx === selectedOption ? 'bg-rose-500 text-white' :
                  selectedOption === idx ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {label}
                </div>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {/* CONFIRMAÇÃO DE RESPOSTA / AVANÇO */}
        <div className="flex items-center gap-4">
          {selectedOption !== null && !isAnswered && (
            <button
              onClick={confirmAnswer}
              className="flex-1 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-sm font-black rounded-2xl shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all cursor-pointer text-center uppercase tracking-wider"
            >
              Confirmar Resposta
            </button>
          )}

          {isAnswered && hasChosenCorrect === true && (
            <button
              onClick={nextQuestion}
              className="flex-1 py-4 bg-emerald-500 text-slate-950 text-sm font-black rounded-2xl shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider animate-bounce"
            >
              <span>Continuar o Show</span>
              <ChevronRight size={16} />
            </button>
          )}

          {isAnswered && hasChosenCorrect === false && (
            <div className="flex-1 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center text-xs font-bold text-rose-400">
              ❌ Resposta incorreta! Finalizando o jogo...
            </div>
          )}
        </div>

        {/* JUSTIFICATIVA TEOLÓGICA APÓS RESPONDER */}
        {isAnswered && (
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl text-xs leading-relaxed text-indigo-250">
            <div className="flex items-center gap-1.5 font-bold mb-1 text-indigo-300">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span>Explicação Dogmática e Exegese Bíblica:</span>
            </div>
            {currentQuestion.explanation}
          </div>
        )}

      </div>

      {/* PAINEL LATERAL (AJUDAS E HISTÓRICO DE VALORES) */}
      <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
        
        {/* BLOCO DE AJUDAS */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
          <p className="text-[10px] text-indigo-450 font-black uppercase tracking-widest mb-4">Ajudas Clássicas</p>
          <div className="grid grid-cols-2 gap-3">
            
            {/* CARTAS */}
            <button
              disabled={helps.cartas <= 0 || isAnswered}
              onClick={useCartas}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                helps.cartas > 0 && !isAnswered ? 'border-indigo-500/30 bg-indigo-500/10 text-white hover:bg-indigo-500/20 active:scale-95' : 'border-slate-800 bg-slate-950 text-slate-500 cursor-not-allowed'
              }`}
            >
              <LayoutGrid size={18} className="mb-1" />
              <span className="text-xs font-black">Cartas</span>
              <span className="text-[9px] text-slate-450 mt-0.5">{helps.cartas > 0 ? 'Disponível' : 'Esgotado'}</span>
            </button>

            {/* UNIVERSITÁRIOS */}
            <button
              disabled={helps.universitarios <= 0 || isAnswered}
              onClick={useUniversitarios}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                helps.universitarios > 0 && !isAnswered ? 'border-indigo-500/30 bg-indigo-500/10 text-white hover:bg-indigo-500/20 active:scale-95' : 'border-slate-800 bg-slate-950 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Users size={18} className="mb-1" />
              <span className="text-xs font-black">Líderes EBD</span>
              <span className="text-[9px] text-slate-450 mt-0.5">{helps.universitarios > 0 ? 'Disponível' : 'Esgotado'}</span>
            </button>

            {/* PLACAS */}
            <button
              disabled={helps.placas <= 0 || isAnswered}
              onClick={usePlacas}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                helps.placas > 0 && !isAnswered ? 'border-indigo-500/30 bg-indigo-500/10 text-white hover:bg-indigo-500/20 active:scale-95' : 'border-slate-800 bg-slate-950 text-slate-500 cursor-not-allowed'
              }`}
            >
              <MessageCircle size={18} className="mb-1" />
              <span className="text-xs font-black">Membros</span>
              <span className="text-[9px] text-slate-450 mt-0.5">{helps.placas > 0 ? 'Disponível' : 'Esgotado'}</span>
            </button>

            {/* PULOS */}
            <button
              disabled={helps.pulos <= 0 || isAnswered}
              onClick={usePulo}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                helps.pulos > 0 && !isAnswered ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 active:scale-95' : 'border-slate-800 bg-slate-950 text-slate-500 cursor-not-allowed'
              }`}
            >
              <SkipForward size={18} className="mb-1" />
              <span className="text-xs font-black">Pular ({helps.pulos})</span>
              <span className="text-[9px] text-amber-450/75 mt-0.5">{helps.pulos > 0 ? 'Pular Questão' : 'Esgotado'}</span>
            </button>

          </div>

          {/* PARAR / CASHOUT */}
          {!isAnswered && (
            <button
              onClick={stopGame}
              className="w-full mt-4 py-3 bg-rose-600/15 border border-rose-500/35 hover:bg-rose-600 hover:text-white text-rose-300 font-bold text-xs rounded-2xl transition-all cursor-pointer"
            >
              🛑 Parar o Jogo (Garante {prizeStatus.stop.toLocaleString('pt-BR')} Pts)
            </button>
          )}
        </div>

        {/* FEEDBACK DAS AJUDAS ATIVAS */}
        {activeHelpResult.type && (
          <div className="bg-slate-900 border border-indigo-500/20 p-4 rounded-3xl text-xs text-indigo-200">
            <p className="font-bold text-white mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-400" />
              Ajuda Utilizada!
            </p>
            <p className="mb-3 font-semibold text-slate-300">{activeHelpResult.message}</p>

            {/* Renderização de Universitários */}
            {activeHelpResult.type === 'universitarios' && activeHelpResult.data && (
              <div className="flex flex-col gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                {activeHelpResult.data.map((student: any, i: number) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="font-extrabold text-[10px] text-indigo-400 uppercase">{student.name}</span>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      {['A', 'B', 'C', 'D'].map((lbl, idx) => (
                        <div key={idx} className="bg-slate-900/50 p-1 rounded border border-slate-800">
                          <span className="block text-[9px] text-slate-500 font-bold">{lbl}</span>
                          <span className="font-black text-white text-[10px]">{student.vote[idx]}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Renderização de Placas */}
            {activeHelpResult.type === 'placas' && activeHelpResult.data && (
              <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-center">
                {['A', 'B', 'C', 'D'].map((lbl, idx) => (
                  <div key={idx} className="bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                    <span className="block text-[10px] text-slate-500 font-bold mb-0.5">{lbl}</span>
                    <span className="font-black text-amber-400 text-xs">{activeHelpResult.data[idx]}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTÓRICO DE PRÊMIOS */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl hidden lg:block">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-3">Tabela de Premiação</p>
          <div className="flex flex-col gap-1">
            {(() => {
              const total = PRIZES.length;
              const countToShow = 10;
              let start = currentQuestionIndex - Math.floor(countToShow / 2);
              if (start < 0) start = 0;
              if (start + countToShow > total) start = total - countToShow;
              const end = start + countToShow;

              const visible = [];
              for (let i = start; i < end; i++) {
                visible.push({ index: i, prize: PRIZES[i] });
              }

              return visible.reverse().map(({ index: realIndex, prize }) => {
                const isCurrent = realIndex === currentQuestionIndex;
                const isPassed = realIndex < currentQuestionIndex;

                return (
                  <div 
                    key={realIndex} 
                    className={`flex justify-between items-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isCurrent ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-400/50 scale-[1.02]' :
                      isPassed ? 'text-indigo-400 bg-indigo-500/5 line-through opacity-60' : 'text-slate-500'
                    }`}
                  >
                    <span className="text-[10px]">Pergunta {realIndex + 1}</span>
                    <span>{prize.toLocaleString('pt-BR')} Pts</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

      </div>

    </div>
  );
}

// ==========================================
// SUBCOMPONENTE 3: PASSA OU REPASSA TEOLÓGICO
// ==========================================
interface PassaOuRepassaProps {
  onGameOver: (score: number) => void;
  highScore: number;
}

function PassaOuRepassaGame({ onGameOver, highScore }: PassaOuRepassaProps) {
  const [team1Name, setTeam1Name] = useState('Equipe Azul');
  const [team2Name, setTeam2Name] = useState('Equipe Vermelha');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [pies1, setPies1] = useState(0);
  const [pies2, setPies2] = useState(0);

  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [multiplier, setMultiplier] = useState<1 | 2 | 3>(1); // 1 = Responder, 2 = Passa, 3 = Repassa
  const [round, setRound] = useState(1);
  const maxRounds = 10;

  const [questionIndex, setQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(25);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const [tortaOverlay, setTortaOverlay] = useState<{ teamName: string; teamNum: 1 | 2; pointsLost: number } | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);

  // Pergunta atual
  const currentQuestion = QUESTIONS_DB[questionIndex % QUESTIONS_DB.length];

  // Cronômetro
  useEffect(() => {
    if (!isTimerRunning || isAnswering || tortaOverlay) return;
    if (timer <= 0) {
      // Tempo esgotado -> Torta automática na equipe do turno!
      handleTimeOut();
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, isTimerRunning, isAnswering, tortaOverlay]);

  const handleTimeOut = () => {
    setIsTimerRunning(false);
    const lost = 100 * multiplier;
    if (currentTurn === 1) {
      setScore1(s => Math.max(0, s - lost));
      setPies1(p => p + 1);
    } else {
      setScore2(s => Math.max(0, s - lost));
      setPies2(p => p + 1);
    }
    setTortaOverlay({
      teamName: currentTurn === 1 ? team1Name : team2Name,
      teamNum: currentTurn,
      pointsLost: lost
    });
  };

  const handlePassa = () => {
    if (multiplier === 1) {
      setMultiplier(2);
      setCurrentTurn(currentTurn === 1 ? 2 : 1);
      setTimer(20);
    }
  };

  const handleRepassa = () => {
    if (multiplier === 2) {
      setMultiplier(3);
      setCurrentTurn(currentTurn === 1 ? 2 : 1);
      setTimer(15);
    }
  };

  const handlePagarTortaDirect = () => {
    handleTimeOut();
  };

  const handleAnswerClick = (optionIdx: number) => {
    setSelectedAnswer(optionIdx);
    setIsTimerRunning(false);

    const points = 100 * multiplier;
    const isCorrect = optionIdx === currentQuestion.answer;

    setTimeout(() => {
      if (isCorrect) {
        if (currentTurn === 1) {
          setScore1(s => s + points);
        } else {
          setScore2(s => s + points);
        }
        setCelebration(`🎉 ACERTOU! +${points} Pts para ${currentTurn === 1 ? team1Name : team2Name}!`);
      } else {
        if (currentTurn === 1) {
          setScore1(s => Math.max(0, s - points));
          setPies1(p => p + 1);
        } else {
          setScore2(s => Math.max(0, s - points));
          setPies2(p => p + 1);
        }
        setTortaOverlay({
          teamName: currentTurn === 1 ? team1Name : team2Name,
          teamNum: currentTurn,
          pointsLost: points
        });
      }
    }, 1000);
  };

  const advanceNextRound = () => {
    setTortaOverlay(null);
    setCelebration(null);
    setSelectedAnswer(null);
    setIsAnswering(false);
    setMultiplier(1);
    setTimer(25);
    setIsTimerRunning(true);

    if (round >= maxRounds) {
      const topScore = Math.max(score1, score2);
      onGameOver(topScore);
    } else {
      setRound(r => r + 1);
      setCurrentTurn(r => (r % 2 === 0 ? 1 : 2) as 1 | 2);
      setQuestionIndex(i => (i + 1) % QUESTIONS_DB.length);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-6 select-none font-sans">
      
      {/* PLACAR DAS EQUIPES */}
      <div className="grid grid-cols-2 gap-4 md:gap-8">
        
        {/* EQUIPE AZUL */}
        <div className={`p-5 rounded-3xl border-2 transition-all relative overflow-hidden ${
          currentTurn === 1 ? 'bg-indigo-950/80 border-indigo-500 ring-4 ring-indigo-500/20 shadow-xl' : 'bg-slate-900/60 border-slate-800 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
              <Users size={12} /> Equipe 1
            </span>
            {currentTurn === 1 && (
              <span className="bg-indigo-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                Na Vez!
              </span>
            )}
          </div>
          <input 
            type="text" 
            value={team1Name} 
            onChange={(e) => setTeam1Name(e.target.value)}
            className="bg-transparent font-black text-xl text-white outline-none w-full border-b border-transparent hover:border-indigo-500/50 focus:border-indigo-500"
          />
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl md:text-4xl font-black text-indigo-300">{score1} <span className="text-xs text-indigo-400/70 font-semibold">Pts</span></span>
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
              🥧 {pies1} {pies1 === 1 ? 'Torta' : 'Tortas'}
            </span>
          </div>
        </div>

        {/* EQUIPE VERMELHA */}
        <div className={`p-5 rounded-3xl border-2 transition-all relative overflow-hidden ${
          currentTurn === 2 ? 'bg-rose-950/80 border-rose-500 ring-4 ring-rose-500/20 shadow-xl' : 'bg-slate-900/60 border-slate-800 opacity-80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1">
              <Users size={12} /> Equipe 2
            </span>
            {currentTurn === 2 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                Na Vez!
              </span>
            )}
          </div>
          <input 
            type="text" 
            value={team2Name} 
            onChange={(e) => setTeam2Name(e.target.value)}
            className="bg-transparent font-black text-xl text-white outline-none w-full border-b border-transparent hover:border-rose-500/50 focus:border-rose-500"
          />
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl md:text-4xl font-black text-rose-300">{score2} <span className="text-xs text-rose-400/70 font-semibold">Pts</span></span>
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
              🥧 {pies2} {pies2 === 1 ? 'Torta' : 'Tortas'}
            </span>
          </div>
        </div>

      </div>

      {/* BARRA DE STATUS DA RODADA E TIMER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-slate-800 text-slate-300 font-black text-xs rounded-xl border border-slate-700">
            Rodada {round} / {maxRounds}
          </span>
          <span className={`px-3 py-1 font-black text-xs rounded-xl uppercase tracking-wider border ${
            multiplier === 1 ? 'bg-slate-800 text-slate-300 border-slate-700' :
            multiplier === 2 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
            'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
          }`}>
            {multiplier === 1 && '1x Resposta (100 Pts)'}
            {multiplier === 2 && '2x PASSOUS! (200 Pts)'}
            {multiplier === 3 && '3x REPASSOUS! (300 Pts + Torta Mandatory)'}
          </span>
        </div>

        {/* CONTADOR REGRESSIVO */}
        <div className="flex items-center gap-2">
          <Clock size={16} className={timer <= 5 ? 'text-rose-500 animate-bounce' : 'text-slate-400'} />
          <span className={`font-black text-xl font-mono ${timer <= 5 ? 'text-rose-400' : 'text-white'}`}>
            00:{timer < 10 ? `0${timer}` : timer}
          </span>
        </div>
      </div>

      {/* CARD DA PERGUNTA DO PASSA OU REPASSA */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
            <BookOpen size={14} />
            {currentQuestion.chapter}
          </span>
          <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
            Valendo {100 * multiplier} Pts
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-black text-white leading-relaxed">
          {currentQuestion.question}
        </h2>

        {/* BOTOES DE AÇÃO: RESPONDER, PASSAR, REPASSAR, PAGAR TORTA */}
        {!isAnswering && !tortaOverlay && !celebration && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setIsAnswering(true)}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95 transition-all"
            >
              <Check size={16} /> Responder
            </button>

            <button
              onClick={handlePassa}
              disabled={multiplier !== 1}
              className={`px-4 py-3 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all ${
                multiplier === 1 
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <ArrowRight size={16} /> Passar
            </button>

            <button
              onClick={handleRepassa}
              disabled={multiplier !== 2}
              className={`px-4 py-3 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all ${
                multiplier === 2 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 cursor-pointer active:scale-95 animate-pulse' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <RotateCcw size={16} /> Repassar
            </button>

            <button
              onClick={handlePagarTortaDirect}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-rose-300 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 border border-rose-500/20 cursor-pointer active:scale-95 transition-all"
            >
              🥧 Pagar Torta
            </button>
          </div>
        )}

        {/* OPÇÕES DE RESPOSTA */}
        {isAnswering && !tortaOverlay && !celebration && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQuestion.answer;
              let btnStyle = "bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700";
              if (selectedAnswer !== null) {
                if (isCorrect) btnStyle = "bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400";
                else if (isSelected) btnStyle = "bg-rose-600 text-white border-rose-500";
                else btnStyle = "bg-slate-900/40 text-slate-600 border-slate-800";
              }

              return (
                <button
                  key={idx}
                  onClick={() => selectedAnswer === null && handleAnswerClick(idx)}
                  className={`p-4 rounded-2xl text-left font-bold text-sm border transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center text-xs font-black shrink-0">
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* CELEBRAÇÃO / SUCESSO */}
        {celebration && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center flex flex-col items-center gap-4 animate-fadeIn">
            <h3 className="text-2xl font-black text-emerald-400">{celebration}</h3>
            <p className="text-slate-300 text-xs max-w-md">{currentQuestion.explanation}</p>
            <button
              onClick={advanceNextRound}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl cursor-pointer active:scale-95 transition-all"
            >
              Próxima Rodada
            </button>
          </div>
        )}
      </div>

      {/* OVERLAY DE TORTA NO ROSTO (ANIMAÇÃO DERTIDA) */}
      {tortaOverlay && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-rose-500/80 rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center gap-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500"></div>
            
            <div className="w-24 h-24 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center text-6xl animate-bounce shadow-inner border border-rose-500/30">
              🥧
            </div>

            <div>
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 font-extrabold text-xs rounded-full uppercase tracking-widest border border-rose-500/30 inline-block mb-2">
                Splash! Torta no Rosto!
              </span>
              <h2 className="text-3xl font-black text-white">
                {tortaOverlay.teamName}!
              </h2>
              <p className="text-sm text-rose-300 font-bold mt-2">
                -{tortaOverlay.pointsLost} Pontos e +1 Torta de Chantilly acumulada!
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              💡 {currentQuestion.explanation}
            </p>

            <button
              onClick={advanceNextRound}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-sm rounded-2xl hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg shadow-rose-500/20"
            >
              Continuar para a Próxima Rodada ➡️
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// SUBCOMPONENTE 4: ESCAPE ROOM BÍBLICO (10 TEMAS)
// ==========================================
interface EscapeRoomProps {
  onGameOver: (count: number) => void;
  highScore: number;
}

interface EscapeScenario {
  id: number;
  title: string;
  subtitle: string;
  correctCode: string[];
  lockLabel: string;
  badge: string;
  hotspots: {
    id: number;
    title: string;
    icon: any;
    color: string;
    passage: string;
    riddle: string;
    answerDigit: string;
    hint: string;
  }[];
}

const ESCAPE_SCENARIOS: EscapeScenario[] = [
  {
    id: 0,
    title: '1. O Segredo do Tabernáculo de Moisés',
    subtitle: 'Desvende as sombras do Santuário e abra o Santo dos Santos!',
    badge: 'Tabernáculo',
    lockLabel: 'Cadeado do Santo dos Santos',
    correctCode: ['6', '5', '7', '2'],
    hotspots: [
      {
        id: 1,
        title: '1. Altar de Bronze (O Átrio)',
        icon: Flame,
        color: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
        passage: 'Levítico 6:13 - "O fogo arderá continuamente sobre o altar; não se apagará."',
        riddle: 'No Átrio, o fogo contínuo purifica. Quantas colunas sustentavam a cortina de entrada do Átrio de acácia (Êxodo 27:16)?',
        answerDigit: '6',
        hint: 'Dígito 1 do Código = 6'
      },
      {
        id: 2,
        title: '2. Bacia de Cobre (Pia de Bronze)',
        icon: Sparkles,
        color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
        passage: 'Êxodo 30:18 - "Farás também uma bacia de bronze com a sua base para lavar..."',
        riddle: 'A Pia de Bronze purifica os sacerdotes. Quantas eram as ofertas levíticas no Tabernáculo (Holocausto, Alimento, Pacífico, Pecado, Ofensa)?',
        answerDigit: '5',
        hint: 'Dígito 2 do Código = 5'
      },
      {
        id: 3,
        title: '3. Candelabro de Ouro (Menorá)',
        icon: Lightbulb,
        color: 'border-amber-400/50 bg-amber-400/10 text-amber-300',
        passage: 'Êxodo 25:37 - "Farás também as suas lâmpadas, sete; e as suas lâmpadas se acenderão..."',
        riddle: 'A Menorá ilumina o Lugar Santo. Quantas lâmpadas e hastes perfeitas compunham o Candelabro de ouro puro?',
        answerDigit: '7',
        hint: 'Dígito 3 do Código = 7'
      },
      {
        id: 4,
        title: '4. Mesa dos Pães da Proposição',
        icon: BookOpen,
        color: 'border-orange-500/50 bg-orange-500/10 text-orange-400',
        passage: 'Levítico 24:5-6 - "Tomarás da flor de farinha e dela cozerás doze pães... em duas fileiras..."',
        riddle: 'Os 12 pães no Lugar Santo ficavam dispostos sobre a mesa em quantas fileiras perfeitas?',
        answerDigit: '2',
        hint: 'Dígito 4 do Código = 2'
      },
      {
        id: 5,
        title: '5. O Véu e a Arca da Aliança',
        icon: Key,
        color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
        passage: 'Hebreus 10:19-20 - "Tendo, pois, irmãos, intrepidez para entrar no Santo dos Santos pelo sangue de Jesus..."',
        riddle: 'Junte os 4 dígitos na ordem exata dos objetos (Altar -> Pia -> Menorá -> Pães) para destravar a Arca da Aliança e Escapar!',
        answerDigit: 'FINAL',
        hint: 'Ordem das Pistas: [1º] [2º] [3º] [4º]'
      }
    ]
  },
  {
    id: 1,
    title: '2. A Arca de Noé & O Grande Dilúvio',
    subtitle: 'Decifre as medidas divinas de Gopher para abrir a escotilha de libertação!',
    badge: 'Dilúvio',
    lockLabel: 'Cadeado da Porta da Arca',
    correctCode: ['3', '1', '4', '0'],
    hotspots: [
      {
        id: 1,
        title: '1. Os Andares de Madeira de Gopher',
        icon: Layers,
        color: 'border-amber-600/50 bg-amber-600/10 text-amber-400',
        passage: 'Gênesis 6:16 - "Farás a arca com andar inferior, segundo e terceiro..."',
        riddle: 'Em quantos andares internos dividiu Noé a estrutura da Arca para abrigar a criação?',
        answerDigit: '3',
        hint: 'Dígito 1 do Código = 3'
      },
      {
        id: 2,
        title: '2. A Janela Superior de Luz',
        icon: Sun,
        color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300',
        passage: 'Gênesis 6:16 - "Farás na arca uma janela e de um côvado a terminarás em cima..."',
        riddle: 'De quantos côvados de altura era a abertura da janela superior para entrada da luz celestial?',
        answerDigit: '1',
        hint: 'Dígito 2 do Código = 1'
      },
      {
        id: 3,
        title: '3. A Tempestade do Dilúvio',
        icon: Compass,
        color: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
        passage: 'Gênesis 7:12 - "E esteve a chuva sobre a terra quarenta dias e quarenta noites."',
        riddle: 'A chuva do dilúvio caiu por 40 dias e 40 noites. Qual é o primeiro dígito desse número solene (40)?',
        answerDigit: '4',
        hint: 'Dígito 3 do Código = 4'
      },
      {
        id: 4,
        title: '4. A Pomba e o Arco da Aliança',
        icon: Sparkles,
        color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
        passage: 'Gênesis 9:13 - "O meu arco tenho posto na nuvem; este será por sinal da aliança..."',
        riddle: 'Deus prometeu que NUNCA MAIS destruiria a terra por águas. Quantas vezes a terra voltou a ser destruída por dilúvio universal?',
        answerDigit: '0',
        hint: 'Dígito 4 do Código = 0'
      },
      {
        id: 5,
        title: '5. A Selagem da Porta de Madeira',
        icon: Key,
        color: 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400',
        passage: 'Gênesis 7:16 - "E o SENHOR o fechou dentro."',
        riddle: 'Junte as pistas dos Andares (3), Janela (1), Tempestade (4) e Aliança (0) para destravar a porta e sair para a terra renovada!',
        answerDigit: 'FINAL',
        hint: 'Código da Fuga: 3 - 1 - 4 - 0'
      }
    ]
  },
  {
    id: 2,
    title: '3. A Prisão de Filipos (Paulo e Silas)',
    subtitle: 'Cante louvores à meia-noite para que o terremoto celestial abra as portas de ferro!',
    badge: 'Cárcere',
    lockLabel: 'Cadeado das Correntes do Cárcere',
    correctCode: ['1', '2', '2', '4'],
    hotspots: [
      {
        id: 1,
        title: '1. A Hora do Louvor da Meia-Noite',
        icon: Clock,
        color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400',
        passage: 'Atos 16:25 - "E, perto da meia-noite, Paulo e Silas oravam e cantavam hinos a Deus..."',
        riddle: 'A meia-noite representa qual hora no relógio de 12 horas em que o louvor abalou os alicerces?',
        answerDigit: '1',
        hint: 'Dígito 1 do Código = 1 (12h -> 1)'
      },
      {
        id: 2,
        title: '2. Os Servos no Tronco Interior',
        icon: Users,
        color: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
        passage: 'Atos 16:24 - "O qual... os lançou no cárcere interior e lhes segurou os pés no tronco."',
        riddle: 'Quantos servos de Cristo (Paulo e Silas) cantavam hinos no cárcere de Filipos?',
        answerDigit: '2',
        hint: 'Dígito 2 do Código = 2'
      },
      {
        id: 3,
        title: '3. O Grande Terremoto',
        icon: Zap,
        color: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
        passage: 'Atos 16:26 - "E de repente sobreveio um tão grande terremoto, que os alicerces do cárcere se moveram..."',
        riddle: 'Quantas portas do cárcere e correntes de prisioneiros foram soltas no milagre imediato?',
        answerDigit: '2',
        hint: 'Dígito 3 do Código = 2'
      },
      {
        id: 4,
        title: '4. A Salvação do Carcereiro',
        icon: Heart,
        color: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
        passage: 'Atos 16:31 - "Crê no Senhor Jesus Cristo e serás salvo, tu e a tua casa."',
        riddle: 'Quantos capítulos do livro de Atos antecederam este grande acontecimento (Atos Cap. 16 - 12 = 4)? Ou quantos açoites foram lavados pela família convertida?',
        answerDigit: '4',
        hint: 'Dígito 4 do Código = 4'
      },
      {
        id: 5,
        title: '5. A Chave das Algemas de Ferro',
        icon: Key,
        color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
        passage: 'Atos 16:36 - "Saí, pois, agora e ide em paz."',
        riddle: 'Digite 1 - 2 - 2 - 4 para libertar os apóstolos e pregar o evangelho em toda a Ásia!',
        answerDigit: 'FINAL',
        hint: 'Código da Libertação: 1 - 2 - 2 - 4'
      }
    ]
  },
  {
    id: 3,
    title: '4. O Palácio da Babilônia & A Cova dos Leões',
    subtitle: 'Decifre a oração inabalável de Daniel para fechar a boca dos leões da Babilônia!',
    badge: 'Daniel',
    lockLabel: 'Cadeado de Pedra do Selo Real',
    correctCode: ['3', '6', '2', '1'],
    hotspots: [
      {
        id: 1,
        title: '1. A Janela da Oração de Daniel',
        icon: Lightbulb,
        color: 'border-amber-400/50 bg-amber-400/10 text-amber-300',
        passage: 'Daniel 6:10 - "Três vezes ao dia se ajoelhava, e orava, e dava graças diante do seu Deus..."',
        riddle: 'Quantas vezes por dia Daniel se ajoelhava com as janelas abertas rumo a Jerusalém?',
        answerDigit: '3',
        hint: 'Dígito 1 do Código = 3'
      },
      {
        id: 2,
        title: '2. O Livro do Profeta Daniel',
        icon: BookOpen,
        color: 'border-orange-500/50 bg-orange-500/10 text-orange-400',
        passage: 'Daniel 6:1 - "E pareceu bem a Dario constituir sobre o reino cento e vinte príncipes..."',
        riddle: 'Qual é o número do capítulo do Livro de Daniel onde ocorre o livramento milagroso na Cova dos Leões?',
        answerDigit: '6',
        hint: 'Dígito 2 do Código = 6'
      },
      {
        id: 3,
        title: '3. Os Anjos Protetores',
        icon: Shield,
        color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300',
        passage: 'Daniel 6:22 - "O meu Deus enviou o seu anjo, e fechou a boca dos leões, para que não me fizessem dano..."',
        riddle: 'Quantas noites permaneceu Daniel ileso na cova com os leões famintos antes do amanhecer?',
        answerDigit: '2',
        hint: 'Dígito 3 do Código = 2 (Noite e Amanhecer)'
      },
      {
        id: 4,
        title: '4. O Deus Vivo de Daniel',
        icon: Award,
        color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
        passage: 'Daniel 6:26 - "Porque ele é o Deus vivo e permanece para sempre, e o seu reino não se poderá destruir..."',
        riddle: 'Quantos Deuses Verdadeiros e Vivos foram proclamados pelo Rei Dario em todo o seu vasto império?',
        answerDigit: '1',
        hint: 'Dígito 4 do Código = 1'
      },
      {
        id: 5,
        title: '5. A Pedra do Selo do Rei Dario',
        icon: Key,
        color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
        passage: 'Daniel 6:23 - "Nenhum dano se achou nele, porque crera no seu Deus."',
        riddle: 'Digite a combinação da Fé (3 - 6 - 2 - 1) para remover a pedra e revelar o Deus que livra!',
        answerDigit: 'FINAL',
        hint: 'Código Real: 3 - 6 - 2 - 1'
      }
    ]
  },
  {
    id: 4,
    title: '5. A Saída do Egito & O Mar Vermelho',
    subtitle: 'Estenda o cajado da fé para dividir as águas e libertar o povo de Israel!',
    badge: 'Éxodo',
    lockLabel: 'Cadeado das Águas de Pi-Hahirote',
    correctCode: ['1', '0', '1', '4'],
    hotspots: [
      {
        id: 1,
        title: '1. O Cajado de Moisés',
        icon: Compass,
        color: 'border-amber-600/50 bg-amber-600/10 text-amber-400',
        passage: 'Êxodo 14:16 - "E tu, levanta a tua vara, e estende a tua mão sobre o mar, e fende-o..."',
        riddle: 'Com quantos cajados de acácia na mão de Moisés o Senhor operou a divisão do mar?',
        answerDigit: '1',
        hint: 'Dígito 1 do Código = 1'
      },
      {
        id: 2,
        title: '2. As Pragas no Egito',
        icon: Flame,
        color: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
        passage: 'Êxodo 12:12 - "E executarei juízos sobre todos os deuses do Egito. Eu sou o SENHOR."',
        riddle: 'Quantas pragas solenes foram enviadas sobre o Egito antes de Faraó deixar o povo partir? Qual o segundo dígito de 10?',
        answerDigit: '0',
        hint: 'Dígito 2 do Código = 0 (10 pragas -> 0)'
      },
      {
        id: 3,
        title: '3. A Coluna de Fogo e Nuvem',
        icon: Sun,
        color: 'border-amber-400/50 bg-amber-400/10 text-amber-300',
        passage: 'Êxodo 13:21 - "E o SENHOR ia adiante deles, de dia numa coluna de nuvem... e de noite numa coluna de fogo..."',
        riddle: 'Quantas colunas divinas guiavam Israel dia e noite pelo deserto rumo à promessa?',
        answerDigit: '1',
        hint: 'Dígito 3 do Código = 1'
      },
      {
        id: 4,
        title: '4. O Capítulo da Vitória no Mar',
        icon: BookOpen,
        color: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
        passage: 'Êxodo 14:31 - "E viu Israel a grande mão que o SENHOR mostrara aos egípcios..."',
        riddle: 'Qual o segundo dígito do capítulo 14 de Êxodo onde as águas se fecharam sobre os carros de Faraó?',
        answerDigit: '4',
        hint: 'Dígito 4 do Código = 4'
      },
      {
        id: 5,
        title: '5. O Cântico de Miriã nas Margens',
        icon: Key,
        color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
        passage: 'Êxodo 15:1 - "Cantarei ao SENHOR, porque gloriosamente triunfou; lançou no mar o cavalo e o seu cavaleiro."',
        riddle: 'Combine 1 - 0 - 1 - 4 para caminhar em terra seca e entoar o hino da vitória!',
        answerDigit: 'FINAL',
        hint: 'Código da Passagem: 1 - 0 - 1 - 4'
      }
    ]
  },
  {
    id: 5,
    title: '6. As Muralhas de Jericó e Raabe',
    subtitle: 'Marche ao som das trombetas de chifre de carneiro para fazer ruir os muros!',
    badge: 'Jericó',
    lockLabel: 'Cadeado das Portas de Bronze de Jericó',
    correctCode: ['7', '1', '3', '6'],
    hotspots: [
      {
        id: 1,
        title: '1. As Voltas em Redor da Cidade',
        icon: RotateCcw,
        color: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
        passage: 'Josué 6:4 - "E sete sacerdotes levarão sete trombetas... e no sétimo dia rodeareis a cidade sete vezes..."',
        riddle: 'Em quantos dias e voltas no sétimo dia o povo de Israel marchou em redor da cidade fortaleza?',
        answerDigit: '7',
        hint: 'Dígito 1 do Código = 7'
      },
      {
        id: 2,
        title: '2. O Cordão de Escarlate na Janela',
        icon: Sparkles,
        color: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
        passage: 'Josué 2:18 - "Atarás este cordão de fio de escarlata à janela por onde nos fizeste descer..."',
        riddle: 'Quantas famílias (a casa de Raabe) foram poupadas da ruína devido ao cordão vermelho de salvação?',
        answerDigit: '1',
        hint: 'Dígito 2 do Código = 1'
      },
      {
        id: 3,
        title: '3. Os Espias na Terra Prometida',
        icon: EyeOff,
        color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300',
        passage: 'Josué 2:1 - "E enviou Josué... dois homens espias secretamente, dizendo: Andai, e observai a terra e a Jericó..."',
        riddle: 'Quantos espias fieis foram enviados secretamente por Josué mais 1 dia de busca nos montes (2+1 = 3)?',
        answerDigit: '3',
        hint: 'Dígito 3 do Código = 3'
      },
      {
        id: 4,
        title: '4. O Livro de Josué',
        icon: BookOpen,
        color: 'border-amber-400/50 bg-amber-400/10 text-amber-300',
        passage: 'Josué 6:20 - "Gritou, pois, o povo, tocando os sacerdotes as trombetas... e o muro caiu abaixo..."',
        riddle: 'Qual é o número do capítulo de Josué que narra a queda milagrosa das muralhas de Jericó?',
        answerDigit: '6',
        hint: 'Dígito 4 do Código = 6'
      },
      {
        id: 5,
        title: '5. As Trombetas do Jubileu',
        icon: Key,
        color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
        passage: 'Josué 6:20 - "E o povo subiu à cidade, cada qual em frente de si, e tomaram a cidade."',
        riddle: 'Combine 7 - 1 - 3 - 6 para dar o brado de vitória e derrubar as muralhas do inimigo!',
        answerDigit: 'FINAL',
        hint: 'Código da Queda: 7 - 1 - 3 - 6'
      }
    ]
  },
  {
    id: 6,
    title: '7. O Desafio do Fogo no Monte Carmelo',
    subtitle: 'Restaure o altar do Senhor com 12 pedras e clame pelo fogo dos céus!',
    badge: 'Elias',
    lockLabel: 'Cadeado do Altar do Monte Carmelo',
    correctCode: ['1', '2', '4', '1'],
    hotspots: [
      {
        id: 1,
        title: '1. As Pedras do Altar Restaurado',
        icon: Layers,
        color: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
        passage: '1 Reis 18:31 - "E Elias tomou doze pedras, segundo o número das tribos dos filhos de Jacó..."',
        riddle: 'Quantas pedras usou o profeta Elias para reparar o altar do Senhor que estava quebrado? Qual o primeiro dígito de 12?',
        answerDigit: '1',
        hint: 'Dígito 1 do Código = 1 (12 pedras -> 1)'
      },
      {
        id: 2,
        title: '2. As Tribos de Israel',
        icon: Users,
        color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300',
        passage: '1 Reis 18:31 - "...ao qual viera a palavra do SENHOR, dizendo: Israel será o teu nome."',
        riddle: 'Qual o segundo dígito do número de pedras representando as tribos de Israel (12)?',
        answerDigit: '2',
        hint: 'Dígito 2 do Código = 2 (12 pedras -> 2)'
      },
      {
        id: 3,
        title: '3. Os Cântaros de Água no Holocausto',
        icon: Compass,
        color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300',
        passage: '1 Reis 18:33 - "Enchei de água quatro cântaros, e derramai-a sobre o holocausto e sobre a lenha..."',
        riddle: 'Quantos cântaros de água foram derramados por 3 vezes consecutivas sobre o altar de Elias?',
        answerDigit: '4',
        hint: 'Dígito 3 do Código = 4'
      },
      {
        id: 4,
        title: '4. A Nuvem do Tamanho da Mão de um Homem',
        icon: Sparkles,
        color: 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300',
        passage: '1 Reis 18:44 - "E sucedeu que, à sétima vez, disse: Eis aqui uma pequena nuvem, como a mão de um homem..."',
        riddle: 'Quantas nuvens no céu surgiram para anunciar a grande abundância de chuva após 3 anos de seca?',
        answerDigit: '1',
        hint: 'Dígito 4 do Código = 1'
      },
      {
        id: 5,
        title: '5. O Fogo Consumidor de Deus',
        icon: Key,
        color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
        passage: '1 Reis 18:38 - "Então caiu fogo do SENHOR, e consumiu o holocausto, e a lenha, e as pedras, e o pó..."',
        riddle: 'Digite 1 - 2 - 4 - 1 para testemunhar o fogo descer e o povo clamar: Só o SENHOR é Deus!',
        answerDigit: 'FINAL',
        hint: 'Código do Fogo: 1 - 2 - 4 - 1'
      }
    ]
  },
  {
    id: 7,
    title: '8. A Tumba Vazia da Ressurreição',
    subtitle: 'A pedra foi removida! Verifique o sepulcro vazio e o lenço dobrado do Rei!',
    badge: 'Ressurreição',
    lockLabel: 'Cadeado de Pedra do Sepulcro Vazio',
    correctCode: ['3', '2', '1', '1'],
    hotspots: [
      {
        id: 1,
        title: '1. Os Três Dias no Coração da Terra',
        icon: Clock,
        color: 'border-amber-400/50 bg-amber-400/10 text-amber-300',
        passage: 'Mateus 12:40 - "Pois, como Jonas esteve três dias e três noites... assim estará o Filho do homem..."',
        riddle: 'Ao terceiro dia Jesus ressuscitou triunfante da morte! Qual é o número desse dia sagrado?',
        answerDigit: '3',
        hint: 'Dígito 1 do Código = 3'
      },
      {
        id: 2,
        title: '2. Os Anjos na Entrada da Tumba',
        icon: Sparkles,
        color: 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300',
        passage: 'João 20:12 - "E viu dois anjos vestidos de branco, assentados onde jazera o corpo de Jesus..."',
        riddle: 'Quantos anjos de vestes resplandecentes estavam assentados dentro da tumba (cabeceira e pés)?',
        answerDigit: '2',
        hint: 'Dígito 2 do Código = 2'
      },
      {
        id: 3,
        title: '3. O Primeiro Dia da Semana',
        icon: Sun,
        color: 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300',
        passage: 'João 20:1 - "E no primeiro dia da semana, Maria Madalena foi ao sepulcro de manhã..."',
        riddle: 'Qual é o ordinal do dia da semana (Domingo da Ressurreição) em que acharam a pedra removida?',
        answerDigit: '1',
        hint: 'Dígito 3 do Código = 1'
      },
      {
        id: 4,
        title: '4. O Único Mediador e Salvador',
        icon: Heart,
        color: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
        passage: '1 Timóteo 2:5 - "Porque há um só Deus, e um só Mediador entre Deus e os homens, Jesus Cristo homem."',
        riddle: 'Quantos Salvadores ressuscitados venceram o grilhão da morte e da sepultura?',
        answerDigit: '1',
        hint: 'Dígito 4 do Código = 1'
      },
      {
        id: 5,
        title: '5. O Lenço Dobrado à Parte',
        icon: Key,
        color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
        passage: 'João 20:7 - "E o lenço, que estivera sobre a sua cabeça, que não estava com os lençóis, mas dobrado num lugar à parte."',
        riddle: 'Combine 3 - 2 - 1 - 1 para abrir o sepulcro e proclamar: Ele não está aqui, porque já ressuscitou!',
        answerDigit: 'FINAL',
        hint: 'Código da Vida: 3 - 2 - 1 - 1'
      }
    ]
  },
  {
    id: 8,
    title: '9. O Templo de Salomão & A Glória da Shekinah',
    subtitle: 'Decifre as medidas do Templo de Ouro para presenciar o encher da glória de Deus!',
    badge: 'Templo',
    lockLabel: 'Cadeado das Portas de Ouro do Templo',
    correctCode: ['7', '2', '1', '0'],
    hotspots: [
      {
        id: 1,
        title: '1. Os Sete Anos de Construção',
        icon: Clock,
        color: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
        passage: '1 Reis 6:38 - "Assim o edificou em sete anos."',
        riddle: 'Quantos anos durou a edificação solene do Templo de Salomão em Jerusalém sem som de machado?',
        answerDigit: '7',
        hint: 'Dígito 1 do Código = 7'
      },
      {
        id: 2,
        title: '2. As Duas Colunas de Bronze: Jaquim e Boaz',
        icon: Layers,
        color: 'border-orange-500/50 bg-orange-500/10 text-orange-400',
        passage: '1 Reis 7:21 - "Levantou as colunas no pórtico do templo... e chamou o nome da da direita Jaquim, e o da esquerda Boaz."',
        riddle: 'Quantas colunas majestosas de bronze ficavam na entrada do Pórtico do Santuário?',
        answerDigit: '2',
        hint: 'Dígito 2 do Código = 2'
      },
      {
        id: 3,
        title: '3. O Mar de Fundição de Cobre',
        icon: Compass,
        color: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
        passage: '1 Reis 7:23 - "Fez também um mar de fundição, de dez côvados de uma borda até à outra..."',
        riddle: 'Quantos grandes mares de fundição para purificação dos sacerdotes repousavam sobre 12 bois de bronze?',
        answerDigit: '1',
        hint: 'Dígito 3 do Código = 1'
      },
      {
        id: 4,
        title: '4. A Nuvem da Glória da Shekinah',
        icon: Sparkles,
        color: 'border-amber-300/50 bg-amber-300/10 text-amber-300',
        passage: '1 Reis 8:10-11 - "E sucedeu que... a nuvem encheu a casa do SENHOR, de sorte que os sacerdotes não podiam ter-se em pé..."',
        riddle: 'Qual é o último dígito do capítulo 8 de 1 Reis (80 -> 0) em que o fogo desceu do céu e a glória encheu o templo?',
        answerDigit: '0',
        hint: 'Dígito 4 do Código = 0'
      },
      {
        id: 5,
        title: '5. O Propiciatório de Ouro do Templo',
        icon: Key,
        color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
        passage: '2 Crônicas 7:1 - "E acabando Salomão de orar, desceu o fogo do céu, e consumiu o holocausto..."',
        riddle: 'Combine 7 - 2 - 1 - 0 para contemplar a majestade da glória de Deus habitando entre os homens!',
        answerDigit: 'FINAL',
        hint: 'Código do Santuário: 7 - 2 - 1 - 0'
      }
    ]
  },
  {
    id: 9,
    title: '10. A Ilha de Patmos & As 7 Igrejas do Apocalipse',
    subtitle: 'Decifre as revelações do Cordeiro Glorificado ao apóstolo João na ilha de Patmos!',
    badge: 'Apocalipse',
    lockLabel: 'Cadeado dos Sete Selos do Apocalipse',
    correctCode: ['7', '7', '1', '2'],
    hotspots: [
      {
        id: 1,
        title: '1. Os Sete Candelabros de Ouro',
        icon: Lightbulb,
        color: 'border-amber-400/50 bg-amber-400/10 text-amber-300',
        passage: 'Apocalipse 1:12 - "E virei-me para ver a voz... e vi sete candelabros de ouro."',
        riddle: 'Quantas igrejas da Ásia foram representadas pelos candelabros de ouro na visão de Patmos?',
        answerDigit: '7',
        hint: 'Dígito 1 do Código = 7'
      },
      {
        id: 2,
        title: '2. As Sete Estrelas na Mão Direita',
        icon: Sparkles,
        color: 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300',
        passage: 'Apocalipse 1:16 - "E ele tinha na sua mão direita sete estrelas..."',
        riddle: 'Quantos anjos (pastores das igrejas) eram mantidos em segurança na mão do Senhor ressuscitado?',
        answerDigit: '7',
        hint: 'Dígito 2 do Código = 7'
      },
      {
        id: 3,
        title: '3. O Alfa e o Ômega',
        icon: Award,
        color: 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300',
        passage: 'Apocalipse 1:8 - "Eu sou o Alfa e o Ômega, o princípio e o fim, diz o Senhor..."',
        riddle: 'Quantos Senhores Soberanos assentados no trono têm o Livro da Vida selado?',
        answerDigit: '1',
        hint: 'Dígito 3 do Código = 1'
      },
      {
        id: 4,
        title: '4. As Doze Portas da Nova Jerusalém',
        icon: Compass,
        color: 'border-indigo-400/50 bg-indigo-400/10 text-indigo-300',
        passage: 'Apocalipse 21:12 - "E tinha um grande e alto muro com doze portas... e nomes escritos..."',
        riddle: 'Qual é o segundo dígito do número de portas de pérola da Nova Jerusalém celeste (12 portas)?',
        answerDigit: '2',
        hint: 'Dígito 4 do Código = 2 (12 portas -> 2)'
      },
      {
        id: 5,
        title: '5. A Porta Aberta no Céu',
        icon: Key,
        color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
        passage: 'Apocalipse 3:8 - "Eis que tenho posto diante de ti uma porta aberta, e ninguém a pode fechar..."',
        riddle: 'Digite a combinação celeste (7 - 7 - 1 - 2) para romper os selos e reinar com Cristo para sempre!',
        answerDigit: 'FINAL',
        hint: 'Código do Cordeiro: 7 - 7 - 1 - 2'
      }
    ]
  }
];

function EscapeRoomGame({ onGameOver, highScore }: EscapeRoomProps) {
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);
  const [visitedHotspots, setVisitedHotspots] = useState<number[]>([]);
  const [unlockedDigits, setUnlockedDigits] = useState<{ [key: number]: string }>({});
  const [activeSpot, setActiveSpot] = useState<number | null>(null);

  const [pin, setPin] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(900); // 15 minutos por cenário
  const [isEscaped, setIsEscaped] = useState(false);
  const [completedScenarios, setCompletedScenarios] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scenario = ESCAPE_SCENARIOS[selectedScenarioIdx];

  // Restaura cenários concluídos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gipp_escape_completed');
    if (saved) {
      try {
        setCompletedScenarios(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Timer
  useEffect(() => {
    if (isEscaped || timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, isEscaped]);

  const resetScenarioState = (idx: number) => {
    setSelectedScenarioIdx(idx);
    setVisitedHotspots([]);
    setUnlockedDigits({});
    setActiveSpot(null);
    setPin(['', '', '', '']);
    setTimer(900);
    setIsEscaped(false);
    setErrorMsg(null);
  };

  const handleInspect = (spotId: number) => {
    setActiveSpot(spotId);
    if (!visitedHotspots.includes(spotId)) {
      setVisitedHotspots(prev => [...prev, spotId]);
    }
  };

  const handleUnlockClue = (spot: typeof scenario.hotspots[0]) => {
    if (spot.answerDigit !== 'FINAL') {
      setUnlockedDigits(prev => ({ ...prev, [spot.id]: spot.answerDigit }));
    }
    setActiveSpot(null);
  };

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newPin = [...pin];
    newPin[index] = val;
    setPin(newPin);
    setErrorMsg(null);
  };

  const handleVerifyCode = () => {
    if (pin.join('') === scenario.correctCode.join('')) {
      setIsEscaped(true);
      const newCompleted = Array.from(new Set([...completedScenarios, scenario.id]));
      setCompletedScenarios(newCompleted);
      localStorage.setItem('gipp_escape_completed', JSON.stringify(newCompleted));
      onGameOver(newCompleted.length);
    } else {
      setErrorMsg(`CÓDIGO INCORRETO! Verifique suas pistas e o enigma de ${scenario.badge}.`);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-6 font-sans select-none">
      
      {/* SELETOR DE TEMAS / CENÁRIOS (10 TEMAS) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-emerald-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Escolha um dos 10 Cenários Bíblicos de Fuga:
            </h3>
          </div>
          <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            🏆 {completedScenarios.length} / 10 Temas Concluídos
          </span>
        </div>

        {/* BARRA DE BOTÕES DOS TEMAS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ESCAPE_SCENARIOS.map((sc, idx) => {
            const isSelected = selectedScenarioIdx === idx;
            const isDone = completedScenarios.includes(sc.id);

            return (
              <button
                key={sc.id}
                onClick={() => resetScenarioState(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                    : isDone
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{isDone ? '✓' : `#${idx + 1}`}</span>
                <span>{sc.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CABEÇALHO DO CENÁRIO ATUAL */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <Key size={12} /> Desafio #{scenario.id + 1} de 10
          </span>
          <h2 className="text-2xl font-black text-white">{scenario.title}</h2>
          <p className="text-xs text-slate-400 mt-1">{scenario.subtitle}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-3">
          <Clock size={20} className="text-emerald-400 animate-pulse" />
          <div>
            <p className="text-[10px] text-slate-500 font-extrabold uppercase">Tempo Restante</p>
            <p className="text-xl font-black text-white font-mono">{formatTimer(timer)}</p>
          </div>
        </div>
      </div>

      {/* MAPA DE PONTOS DO SCENARIO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* COLUNA ESQUERDA: LISTA DE OBJETOS DO CENÁRIO */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scenario.hotspots.map((spot) => {
            const IconComp = spot.icon;
            const isVisited = visitedHotspots.includes(spot.id);
            const hasClue = !!unlockedDigits[spot.id];

            return (
              <div 
                key={spot.id}
                onClick={() => handleInspect(spot.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] active:scale-95 ${
                  isVisited ? 'bg-slate-900/90 border-slate-700' : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${spot.color}`}>
                    <IconComp size={20} />
                  </div>
                  {hasClue && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-black">
                      Pista: {unlockedDigits[spot.id]}
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-sm text-white mb-1">{spot.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{spot.passage}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>{isVisited ? '✓ Investigado' : 'Clique para Investigar'}</span>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* COLUNA DIREITA: PAINEL DO CADEADO SECRETO DO CENÁRIO */}
        <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-emerald-400" />
              <h3 className="font-black text-sm text-white uppercase tracking-wider">{scenario.lockLabel}</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Digite a combinação de 4 dígitos na ordem correta obtida nos enigmas de {scenario.badge}:
            </p>

            {/* DIGITOS DO PIN */}
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={pin[idx]}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  className="w-12 h-14 bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 rounded-2xl text-center text-2xl font-black text-emerald-400 outline-none transition-all"
                />
              ))}
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-400 text-center mb-4 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {errorMsg}
              </p>
            )}
          </div>

          <button
            onClick={handleVerifyCode}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Key size={16} /> Destravar e Escapar!
          </button>
        </div>

      </div>

      {/* MODAL DE INVESTIGAÇÃO DE PONTO SAGRADO */}
      {activeSpot !== null && (() => {
        const spot = scenario.hotspots.find(h => h.id === activeSpot)!;
        const IconComp = spot.icon;

        return (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full flex flex-col gap-5 relative shadow-2xl">
              <button 
                onClick={() => setActiveSpot(null)}
                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${spot.color}`}>
                  <IconComp size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">{spot.title}</h3>
                  <p className="text-xs text-amber-400 font-bold">{spot.passage}</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <p className="font-bold text-white mb-2">📖 Enigma do Objeto:</p>
                <p>{spot.riddle}</p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-center">
                <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest mb-1">Pista Oculta Encontrada</p>
                <p className="text-xl font-black text-emerald-300">{spot.hint}</p>
              </div>

              <button
                onClick={() => handleUnlockClue(spot)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl cursor-pointer active:scale-95 transition-all"
              >
                Anotar Pista e Continuar ➔
              </button>
            </div>
          </div>
        );
      })()}

      {/* TELA DE VITÓRIA / FUGA CONCLUÍDA */}
      {isEscaped && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center text-4xl shadow-inner animate-pulse">
              🏆
            </div>

            <div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-xs rounded-full uppercase tracking-widest border border-emerald-500/30 inline-block mb-2">
                Glória a Deus! Fuga Concluída!
              </span>
              <h2 className="text-3xl font-black text-white">{scenario.title}</h2>
              <p className="text-xs text-slate-300 mt-2">
                Você decifrou com sabedoria todos os enigmas bíblicos e desvelou a verdade da Palavra de Deus!
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              {selectedScenarioIdx < ESCAPE_SCENARIOS.length - 1 && (
                <button
                  onClick={() => resetScenarioState(selectedScenarioIdx + 1)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  Ir para o Próximo Cenário (#{selectedScenarioIdx + 2}) ➡️
                </button>
              )}

              <button
                onClick={() => resetScenarioState(selectedScenarioIdx)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer"
              >
                Repetir este Cenário 🔄
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// SUBCOMPONENTE 5: RODA DA TEOLOGIA
// ==========================================
interface RodaProps {
  onGameOver: (score: number) => void;
  highScore: number;
}

function RodaDaTeologiaGame({ onGameOver, highScore }: RodaProps) {
  const [score, setScore] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(10);

  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [landedSector, setLandedSector] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const sectors = [
    { label: 'Bibliologia', color: 'from-blue-600 to-indigo-700', pts: 100, type: 'question' },
    { label: 'Pneumatologia', color: 'from-purple-600 to-indigo-800', pts: 200, type: 'question' },
    { label: 'Cristologia', color: 'from-amber-500 to-orange-600', pts: 300, type: 'question' },
    { label: 'Escatologia', color: 'from-emerald-600 to-teal-700', pts: 500, type: 'question' },
    { label: 'Passa a Vez', color: 'from-slate-700 to-slate-800', pts: 0, type: 'pass' },
    { label: 'Bônus x2', color: 'from-amber-400 to-yellow-500', pts: 0, type: 'bonus' },
    { label: 'Torta -200', color: 'from-rose-600 to-pink-700', pts: -200, type: 'pie' },
    { label: 'Milagre +1000', color: 'from-cyan-500 to-blue-600', pts: 1000, type: 'milagre' }
  ];

  const handleSpin = () => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    setActiveQuestion(null);
    setLandedSector(null);
    setSelectedOption(null);

    const randomDegrees = 1440 + Math.floor(Math.random() * 360);
    const newRotation = rotation + randomDegrees;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinsLeft(s => s - 1);

      const actualDegree = newRotation % 360;
      const sectorAngle = 360 / sectors.length;
      const landedIdx = Math.floor((360 - (actualDegree % 360)) / sectorAngle) % sectors.length;
      const sector = sectors[landedIdx];

      setLandedSector(sector.label);

      if (sector.type === 'question') {
        const randQ = QUESTIONS_DB[Math.floor(Math.random() * QUESTIONS_DB.length)];
        setActiveQuestion(randQ);
      } else if (sector.type === 'bonus') {
        setScore(s => s * 2);
      } else if (sector.type === 'pie') {
        setScore(s => Math.max(0, s - 200));
      } else if (sector.type === 'milagre') {
        setScore(s => s + 1000);
      }
    }, 4000);
  };

  const handleAnswerQuestion = (optIdx: number) => {
    if (!activeQuestion || selectedOption !== null) return;
    setSelectedOption(optIdx);

    const isCorrect = optIdx === activeQuestion.answer;
    setTimeout(() => {
      if (isCorrect) {
        setScore(s => s + 300);
      }
      setActiveQuestion(null);
      if (spinsLeft <= 0) {
        onGameOver(score);
      }
    }, 1200);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col items-center gap-6 font-sans">
      
      {/* PLACAR DE PONTOS E GIROS */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-xl">
        <div>
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Pontuação Acumulada</span>
          <p className="text-3xl font-black text-cyan-400">{score.toLocaleString('pt-BR')} Pts</p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Giros Restantes</span>
          <p className="text-3xl font-black text-white">{spinsLeft} / 10</p>
        </div>
      </div>

      {/* PAINEL DA ROLETA TEOLÓGICA */}
      <div className="relative flex flex-col items-center my-4">
        
        {/* PONTEIRO DA ROLETA */}
        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400 z-20 -mb-4 drop-shadow-md"></div>

        {/* CIRCULO DA ROLETA */}
        <div 
          className="w-72 h-72 md:w-80 md:h-80 rounded-full border-8 border-slate-800 shadow-2xl relative overflow-hidden transition-all duration-[4000ms] ease-out flex items-center justify-center bg-slate-900"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {sectors.map((sec, idx) => {
            const angle = (360 / sectors.length) * idx;

            return (
              <div 
                key={idx}
                className={`absolute w-full h-full flex justify-center pt-2 text-[10px] font-black uppercase text-white tracking-wider`}
                style={{ transform: `rotate(${angle}deg)`, transformOrigin: '50% 50%' }}
              >
                <span className="bg-slate-950/80 px-2 py-1 rounded-full border border-slate-800 shadow-sm">
                  {sec.label}
                </span>
              </div>
            );
          })}

          <div className="w-16 h-16 rounded-full bg-slate-950 border-4 border-amber-400 z-10 flex items-center justify-center text-amber-400 font-black text-xs shadow-inner">
            GIPP
          </div>
        </div>

        {/* BOTAO GIRAR */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || spinsLeft <= 0}
          className={`mt-6 px-8 py-4 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all ${
            isSpinning || spinsLeft <= 0 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 cursor-pointer active:scale-95'
          }`}
        >
          {isSpinning ? 'GIRANDO A RODA...' : spinsLeft > 0 ? 'GIRAR A RODA TEOLÓGICA 🔄' : 'FIM DOS GIROS!'}
        </button>
      </div>

      {/* RESULTADO DO SETOR LANDED */}
      {landedSector && !activeQuestion && (
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center animate-fadeIn">
          <p className="text-xs text-slate-400 font-bold">Você tirou no giro:</p>
          <p className="text-lg font-black text-amber-400">{landedSector}</p>
        </div>
      )}

      {/* PERGUNTA SORTEADA */}
      {activeQuestion && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full flex flex-col gap-4 shadow-2xl animate-fadeIn">
          <span className="text-xs font-bold text-cyan-400">{activeQuestion.chapter}</span>
          <h3 className="text-lg font-black text-white">{activeQuestion.question}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === activeQuestion.answer;
              let style = "bg-slate-800 text-slate-200 border-slate-700";
              if (selectedOption !== null) {
                if (isCorrect) style = "bg-emerald-600 text-white border-emerald-500";
                else if (isSelected) style = "bg-rose-600 text-white border-rose-500";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerQuestion(idx)}
                  className={`p-3.5 rounded-2xl text-left font-bold text-xs border transition-all cursor-pointer ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

