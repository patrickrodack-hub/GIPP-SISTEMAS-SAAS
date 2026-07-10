import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, Trophy, HelpCircle, Sparkles, RefreshCw, Play, 
  Maximize2, Minimize2, X, Award, Users, Check, Pause, 
  RotateCcw, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, 
  Coins, SkipForward, Flame, MessageCircle, HelpCircle as HelpIcon,
  CheckCircle2, AlertTriangle, ChevronRight, Info, EyeOff, LayoutGrid, SlidersHorizontal
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

export default function ModuleInterativo() {
  const [activeGame, setActiveGame] = useState<'none' | 'tetris' | 'show'>('none');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scores, setScores] = useState({
    tetris: 0,
    show: 0
  });

  useEffect(() => {
    const savedTetris = localStorage.getItem('gipp_game_tetris_score');
    const savedShow = localStorage.getItem('gipp_game_show_score');
    if (savedTetris) setScores(prev => ({ ...prev, tetris: parseInt(savedTetris) }));
    if (savedShow) setScores(prev => ({ ...prev, show: parseInt(savedShow) }));
  }, []);

  const updateHighScore = (game: 'tetris' | 'show', val: number) => {
    if (val > scores[game]) {
      setScores(prev => ({ ...prev, [game]: val }));
      localStorage.setItem(`gipp_game_${game}_score`, val.toString());
    }
  };

  return (
    <div id="module-interativo-container" className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER DE BOAS VINDAS DA CENTRAL */}
      {activeGame === 'none' && (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-black text-indigo-450 tracking-widest uppercase inline-flex items-center gap-2 mb-4">
              <Sparkles size={14} className="animate-pulse" />
              Módulo de Interatividade Cristã
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent mb-4">
              GIPP Interativo & Edificação
            </h1>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              Entretenimento de alto nível para toda a família! Divirta-se com o clássico jogo **Tetris** para aguçar a agilidade mental, ou prove seus conhecimentos doutrinários no eletrizante **Show do Cristão**, baseado estritamente na Declaração de Fé das Assembleias de Deus.
            </p>
          </div>

          {/* GRID DE CARTÕES DE GAMES */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
            
            {/* CARD 1: TETRIS CLÁSSICO */}
            <div className="group relative bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl hover:border-indigo-500/30 transition-all hover:scale-[1.01] duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-all"></div>
              <div>
                <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <Gamepad2 size={28} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 flex items-center gap-2">
                  Tetris Tradicional
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Agilidade</span>
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Encaixe os blocos que caem sob gravidade progressiva. Limpe linhas inteiras para acumular pontos, subir de nível e quebrar seu recorde pessoal. Com suporte completo a gestos na tela do celular e painel direcional flutuante!
                </p>
              </div>

              <div className="border-t border-slate-800 pt-6 mt-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Recorde Pessoal</p>
                  <p className="text-xl font-black text-indigo-400">{scores.tetris} pontos</p>
                </div>
                <button 
                  onClick={() => { setActiveGame('tetris'); setIsFullscreen(false); }}
                  className="px-6 py-3.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play size={15} fill="currentColor" />
                  Jogar Agora
                </button>
              </div>
            </div>

            {/* CARD 2: SHOW DO CRISTÃO - MELHORADO E BRILHANTE */}
            <div className="group relative bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl hover:border-amber-500/30 transition-all hover:scale-[1.01] duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-all"></div>
              <div>
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner animate-pulse">
                  <Trophy size={28} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 flex items-center gap-2">
                  Show do Cristão
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Teologia</span>
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Inspirado na atmosfera do clássico "Show do Milhão". Avance pelas perguntas teológicas de níveis crescentes e conquiste prêmios fictícios até R$ 1 Milhão! Conte com ajuda das Cartas, Universitários, Placas e Pulos.
                </p>
              </div>

              {/* BOTAO CORRIGIDO E SUPER BRILHANTE - SEM AMBER-550 */}
              <div className="border-t border-slate-800 pt-6 mt-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Maior Prêmio</p>
                  <p className="text-xl font-black text-amber-400">R$ {scores.show.toLocaleString('pt-BR')}</p>
                </div>
                <button 
                  onClick={() => { setActiveGame('show'); setIsFullscreen(false); }}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-550 hover:to-orange-550 text-slate-950 font-black rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-95 transition-all cursor-pointer"
                >
                  <Play size={15} fill="currentColor" />
                  Jogar Agora
                </button>
              </div>
            </div>

          </div>

          <div className="mt-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2 max-w-lg mx-auto bg-slate-900/25 p-4 rounded-2xl border border-slate-800/40">
            <Info size={14} className="text-indigo-400 shrink-0" />
            <span>Seus recordes são salvos de forma 100% segura e direta no navegador para futuras visitas ao Portal do Membro.</span>
          </div>
        </div>
      )}

      {/* JANELA EXCLUSIVA FULL HD / HD */}
      {activeGame !== 'none' && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 md:p-6 no-print overflow-hidden">
          <div className={`flex flex-col bg-slate-950 border border-slate-800 shadow-2xl transition-all duration-300 overflow-hidden ${
            isFullscreen ? 'fixed inset-0 w-screen h-screen rounded-none z-[100]' : 'max-w-6xl w-full h-[90vh] rounded-3xl relative z-10'
          }`}>
            
            {/* TOPO DA JANELA */}
            <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeGame === 'tetris' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {activeGame === 'tetris' ? <Gamepad2 size={16} /> : <Trophy size={16} />}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white tracking-wide uppercase">
                    {activeGame === 'tetris' ? 'TETRIS TRADICIONAL GIPP' : 'SHOW DO CRISTÃO GIPP'}
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
              {activeGame === 'tetris' ? (
                <TetrisGame onGameOver={(score) => updateHighScore('tetris', score)} highScore={scores.tetris} />
              ) : (
                <ShowDoCristaoGame onGameOver={(prize) => updateHighScore('show', prize)} highScore={scores.show} />
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

    if (clearedLines > 0) {
      const pointsTable = [0, 100, 300, 500, 800];
      const points = pointsTable[clearedLines] * level;
      
      setScore(prev => prev + points);
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
      onGameOver(score);
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
            <span>Posição do Controle</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setMobileControllerPos('left')} 
              className={`py-1 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${mobileControllerPos === 'left' ? 'bg-indigo-650 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Esq.
            </button>
            <button 
              onClick={() => setMobileControllerPos('center')} 
              className={`py-1 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${mobileControllerPos === 'center' ? 'bg-indigo-650 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Meio
            </button>
            <button 
              onClick={() => setMobileControllerPos('right')} 
              className={`py-1 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${mobileControllerPos === 'right' ? 'bg-indigo-650 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Dir.
            </button>
          </div>
        </div>

        {/* CONTROLES VIRTUAIS COM POSIÇÃO DINÂMICA NA INTERFACE */}
        <div className={`bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col items-center gap-4 transition-all duration-300 ${
          mobileControllerPos === 'left' ? 'xl:order-first' : mobileControllerPos === 'center' ? 'max-w-[180px] mx-auto' : ''
        }`}>
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest text-center">Painel Direcional</p>
          
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

        <h4 className="text-xl font-bold text-white mb-3">Teste seus conhecimentos bíblicos valendo R$ 1 Milhão fictício!</h4>
        <p className="text-sm text-slate-400 max-w-lg leading-relaxed mb-8">
          Responda a perguntas elaboradas com base na **Declaração de Fé (CPAD/CGADB)**. Você começará no nível Fácil e subirá até o milhão. Use suas ajudas de forma inteligente para não ser eliminado!
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

  // TELA DE VITÓRIA DE R$ 1 MILHÃO!
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
          <p className="text-4xl font-black text-amber-400 tracking-tight">R$ 1.000.000</p>
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
          <p className="text-3xl font-black text-emerald-450">R$ {finalPrize.toLocaleString('pt-BR')}</p>
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
            <p className="text-2xl font-black text-amber-400">R$ {prizeStatus.target.toLocaleString('pt-BR')}</p>
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
              🛑 Parar o Jogo (Garante R$ {prizeStatus.stop.toLocaleString('pt-BR')})
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
          <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto pr-1">
            {PRIZES.slice().reverse().map((prize, idx) => {
              const realIndex = PRIZES.length - 1 - idx;
              const isCurrent = realIndex === currentQuestionIndex;
              const isPassed = realIndex < currentQuestionIndex;

              return (
                <div 
                  key={idx} 
                  className={`flex justify-between items-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isCurrent ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-400/50 scale-[1.02]' :
                    isPassed ? 'text-indigo-400 bg-indigo-500/5 line-through op-60' : 'text-slate-500'
                  }`}
                >
                  <span className="text-[10px]">Pergunta {realIndex + 1}</span>
                  <span>R$ {prize.toLocaleString('pt-BR')}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
