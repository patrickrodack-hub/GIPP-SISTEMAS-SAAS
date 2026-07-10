import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, Trophy, HelpCircle, Sparkles, RefreshCw, Play, 
  Maximize2, Minimize2, X, Award, Users, Check, Pause, 
  RotateCcw, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, 
  Coins, SkipForward, Flame, MessageCircle, HelpCircle as HelpIcon,
  CheckCircle2, AlertTriangle, ChevronRight, Info
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
  // FÁCEIS (Valendo de R$ 1.000 a R$ 5.000)
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
      'Três deuses diferentes que agem em épocas distintas do mundo',
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
      'Exclusivamente por imersão do corpo inteiro na água, em nome do Pai, do Filho e do Espírito Santo',
      'Por afusão, derramando uma jarra de água sobre o candidato',
      'Apenas de forma espiritual, sem necessidade de água ou rito visível'
    ],
    answer: 1,
    explanation: 'No Cap. 11, o batismo em águas é ensinado como ordenança divina por imersão total do corpo, uma única vez, simbolizando nossa união com Cristo em Sua morte e ressurreição (Mt 28.19; Rm 6.4).',
  },
  {
    id: 4,
    level: 'facil',
    chapter: 'Cap. 24: A Família',
    question: 'De acordo com a Declaração de Fé da CPAD, o casamento padrão instituído por Deus é:',
    options: [
      'Uma união puramente civil que pode ser revogada sem princípios morais',
      'A união monogâmica e heterossexual entre um homem e uma mulher, formando o lar tradicional',
      'Um contrato social temporário entre duas ou mais pessoas quaisquer',
      'Um sacramento místico restrito apenas aos líderes religiosos e clérigos'
    ],
    answer: 1,
    explanation: 'O Cap. 24 declara que o casamento foi instituído por Deus e consiste na união monogâmica e heterossexual entre um homem e uma mulher, sendo a base estável da família e da sociedade (Gn 2.24).',
  },
  {
    id: 5,
    level: 'facil',
    chapter: 'Cap. 21: A Cura Divina',
    question: 'O que as Assembleias de Deus defendem sobre a cura divina de enfermidades nos dias de hoje?',
    options: [
      'Que a cura divina cessou com a morte dos últimos apóstolos de Cristo',
      'Que a cura depende exclusivamente de chás e terapias puramente humanas',
      'Que ela é atual e operada pelo poder de Deus mediante a fé e oração pelos enfermos',
      'Que apenas pessoas super espirituais podem receber curas físicas instantâneas'
    ],
    answer: 2,
    explanation: 'O Cap. 21 assevera que Jesus levou sobre si nossas dores e enfermidades, e que a cura divina é um milagre atual operado pela soberania divina e pela fé (Is 53.4-5; Tg 5.14-15).',
  },

  // MÉDIAS (Valendo de R$ 10.000 a R$ 50.000)
  {
    id: 6,
    level: 'medio',
    chapter: 'Cap. 19: O Batismo no Espírito Santo',
    question: 'Qual é a evidência física inicial imediata do Batismo no Espírito Santo segundo as Escrituras?',
    options: [
      'Uma forte sensação de calor ou tremor físico pelo corpo',
      'O falar em outras línguas (glossolalia), conforme o Espírito concede que se fale',
      'A aquisição imediata de grande sabedoria e conhecimento acadêmico',
      'Um comportamento de êxtase sem consciência ou controle próprio'
    ],
    answer: 1,
    explanation: 'No Cap. 19, afirma-se o batismo no Espírito Santo como uma bênção distinta da salvação, acompanhado da evidência inicial e física de falar em outras línguas (At 2.4; 10.44-46).',
  },
  {
    id: 7,
    level: 'medio',
    chapter: 'Cap. 7 e 9: Antropologia e Hamartiologia',
    question: 'A respeito da criação do homem e da origem do pecado, qual afirmação está correta?',
    options: [
      'O homem evoluiu de primatas ao longo de milhões de anos de seleção natural',
      'O pecado foi criado diretamente por Deus para testar a resistência humana',
      'O homem foi criado diretamente por Deus, do pó da terra, e o pecado originou-se na rebelião do querubim ungido',
      'O pecado é apenas uma ilusão psicológica provocada pela ausência de educação'
    ],
    answer: 2,
    explanation: 'O Cap. 7 e 9 rejeitam o evolucionismo, ensinando a criação imediata do homem (Gn 1.27) e que o pecado originou-se na livre rebelião de Lúcifer no mundo espiritual antes da queda humana.',
  },
  {
    id: 8,
    level: 'medio',
    chapter: 'Cap. 10: A Salvação',
    question: 'A justificação do homem diante de Deus ocorre de qual maneira?',
    options: [
      'Pelo acúmulo de caridade, boas obras e participação assídua nos ritos e sacramentos',
      'Exclusivamente pela fé em Jesus Cristo, mediante a graça de Deus, sem méritos humanos',
      'Através de purificações sucessivas em vidas passadas e reencarnação',
      'Pela perfeita obediência literal a todas as leis rituais mosaicas'
    ],
    answer: 1,
    explanation: 'O Cap. 10 ensina que a salvação e justificação são concedidas gratuitamente pela graça divina por meio da fé no sacrifício expiatório de Cristo, independentemente de obras meritórias (Ef 2.8-9).',
  },
  {
    id: 9,
    level: 'medio',
    chapter: 'Cap. 20: Os Dons Espirituais',
    question: 'Sobre a atualidade dos dons espirituais na igreja de hoje, a Declaração de Fé ensina que:',
    options: [
      'Eles foram descontinuados quando a Bíblia foi completada e canonizada',
      'Os dons espirituais servem apenas para exaltação pessoal e espetáculo ministerial',
      'Eles são atuais, distribuídos soberanamente pelo Espírito Santo para a edificação mútua da igreja',
      'Apenas os pastores ordenados possuem a faculdade de exercer dons sobrenaturais'
    ],
    answer: 2,
    explanation: 'O Cap. 20 afirma que os dons espirituais continuam plenamente em vigor na atualidade e são concedidos pelo Espírito para edificação, exortação e consolo da Igreja (1 Co 12.4-11; 14.3).',
  },
  {
    id: 10,
    level: 'medio',
    chapter: 'Cap. 12: A Ceia do Senhor',
    question: 'Os elementos da Ceia do Senhor (pão e vinho) significam o quê na teologia assembleiana?',
    options: [
      'O corpo e o sangue literais de Cristo que se transubstanciam fisicamente no rito',
      'Símbolos sagrados que representam o corpo moído e o sangue derramado de Cristo na cruz',
      'Meramente alimentos comuns para saciar a fome da comunidade',
      'Elementos puramente místicos cujo significado é secreto e proibido de ser explicado'
    ],
    answer: 1,
    explanation: 'No Cap. 12, ensina-se que o pão e o fruto da videira são símbolos memoriais e espirituais que representam o corpo e o sangue de Jesus, nutrindo nossa fé e esperança em Sua vinda (1 Co 11.23-26).',
  },

  // DIFÍCEIS (Valendo de R$ 100.000 a R$ 500.000)
  {
    id: 11,
    level: 'dificil',
    chapter: 'Cap. 22: A Segunda Vinda de Cristo',
    question: 'Qual é a posição escatológica oficial das Assembleias de Deus (CPAD) sobre a Grande Tribulação?',
    options: [
      'A Igreja passará inteiramente pela Grande Tribulação para ser purificada pelo sofrimento',
      'A Grande Tribulação já aconteceu inteiramente no ano 70 d.C. com a queda de Jerusalém',
      'A Igreja será arrebatada de forma pré-tribulacionista, ou seja, antes da Grande Tribulação',
      'Não haverá Grande Tribulação literal, sendo apenas uma metáfora moral e filosófica'
    ],
    answer: 2,
    explanation: 'O Cap. 22 ensina a escatologia pré-tribulacionista e pré-milenista clássica. A Igreja será poupada da ira futura, sendo arrebatada nos ares antes da manifestação do Anticristo (1 Ts 4.16-17; 5.9).',
  },
  {
    id: 12,
    level: 'dificil',
    chapter: 'Cap. 22: O Milênio Literal',
    question: 'O que a Declaração de Fé ensina sobre o Reino Milenar de Cristo sobre a terra?',
    options: [
      'Será um reinado espiritual exercido apenas no coração dos crentes sem manifestação física',
      'Será um reino literal de mil anos de paz e justiça na terra, onde Cristo reinará com Sua Igreja',
      'O milênio é uma figura poética que representa a era atual da internet e da globalização',
      'O reino milenar já acabou e foi sucedido pela eternidade'
    ],
    answer: 1,
    explanation: 'O Cap. 22 afirma categoricamente que, após a Grande Tribulação e a batalha do Armagedom, Cristo implantará na terra um reino teocrático e literal de 1000 anos de paz e restauração (Ap 20.4-6).',
  },
  {
    id: 13,
    level: 'dificil',
    chapter: 'Cap. 4 e 5: Cristologia',
    question: 'A heresia do Monofisismo nega a perfeita união de Cristo. A ortodoxia bíblica ensina que Jesus tem:',
    options: [
      'Apenas natureza divina, pois Sua humanidade era uma mera ilusão de ótica',
      'Duas naturezas perfeitas, a divina e a humana, unidas inseparavelmente em uma única pessoa',
      'Duas pessoas distintas que habitavam em corpos que se alternavam',
      'Apenas natureza humana, tendo se tornado divino apenas após o batismo no Jordão'
    ],
    answer: 1,
    explanation: 'O Cap. 4 e 5 defendem a união hipostática: Jesus Cristo é verdadeiro Deus e verdadeiro homem em uma só pessoa, sem mistura, sem mudança, sem divisão e sem separação (Jo 1.1,14; Cl 2.9).',
  },
  {
    id: 14,
    level: 'dificil',
    chapter: 'Cap. 6: Pneumatologia',
    question: 'O Espírito Santo é reconhecido biblicamente como o quê diante da Divindade?',
    options: [
      'Uma força impessoal ativa ou vento místico enviado para ajudar os crentes',
      'O aspecto feminino ou maternal de Deus, sem consciência própria',
      'A terceira pessoa da Santíssima Trindade, dotado de personalidade, divindade e atributos eternos',
      'Um anjo de alta hierarquia que foi promovido a guia divino da igreja'
    ],
    answer: 2,
    explanation: 'O Cap. 6 estabelece que o Espírito Santo é uma pessoa divina real (inteligência, vontade, sentimentos) e coeterna com o Pai e o Filho, não uma mera energia ou força impessoal (At 5.3-4; Ef 4.30).',
  },

  // PERGUNTA FINAL (R$ 1 MILHÃO)
  {
    id: 15,
    level: 'final',
    chapter: 'Cap. 23: O Juízo Final e Estado Eterno',
    question: 'O que acontecerá imediatamente após o milênio e a derrota final de Satanás?',
    options: [
      'A aniquilação completa de todas as almas perdidas para que parem de sofrer',
      'A ressurreição dos ímpios para o Juízo Final perante o Grande Trono Branco, seguida do Novo Céu e Nova Terra',
      'A salvação universal e reconciliação automática de todos os demônios e pecadores',
      'O início de um segundo período milenar de testes morais na terra'
    ],
    answer: 1,
    explanation: 'O Cap. 23 assevera o Juízo Final literal perante o Grande Trono Branco, onde os mortos impenitentes de todas as eras ressuscitarão para condenação eterna no lago de fogo, seguido da implantação do Novo Céu e Nova Terra (Ap 20.11-15; 21.1).',
  }
];

// Premiações clássicas do Show do Milhão
const PRIZES = [
  1000, 2000, 3000, 4000, 5000,     // Fáceis (0 a 4)
  10000, 20000, 30000, 40000, 50000, // Médias (5 a 9)
  100000, 200000, 300000, 400000, 500000, // Difíceis (10 a 14)
  1000000 // Pergunta Final (15)
];

// ==========================================
// CONFIGURAÇÕES DO TETRIS
// ==========================================
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
  I: 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.5)]',
  O: 'bg-yellow-400 border-yellow-300 shadow-[0_0_8px_rgba(250,204,21,0.5)]',
  T: 'bg-purple-500 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
  S: 'bg-green-500 border-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]',
  Z: 'bg-red-500 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
  J: 'bg-blue-500 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
  L: 'bg-orange-500 border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.5)]'
};

const COLS = 10;
const ROWS = 20;

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function ModuleInterativo() {
  const [activeGame, setActiveGame] = useState<'none' | 'tetris' | 'show'>('none');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Estados gerais de ranking / histórico fictício do portal
  const [scores, setScores] = useState({
    tetris: 0,
    show: 0
  });

  // Salva no localStorage local para persistência do progresso do membro
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
            <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-black text-indigo-400 tracking-widest uppercase inline-flex items-center gap-2 mb-4">
              <Sparkles size={14} className="animate-pulse" />
              Módulo de Interatividade Cristã
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent mb-4">
              GIPP Interativo & Edificação
            </h1>
            <p className="text-base text-slate-400 leading-relaxed">
              Entretenimento de alto nível para toda a família! Jogue o clássico **Tetris** para desenvolver foco e agilidade, ou desafie seus conhecimentos teológicos no eletrizante **Show do Cristão**, baseado na Declaração de Fé das Assembleias de Deus.
            </p>
          </div>

          {/* GRID DE CARTÕES DE GAMES */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
            
            {/* CARD 1: TETRIS CLÁSSICO */}
            <div className="group relative bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl hover:border-indigo-500/40 transition-all hover:scale-[1.02] duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>
              <div>
                <div className="w-14 h-14 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <Gamepad2 size={28} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 flex items-center gap-2">
                  Tetris Tradicional
                  <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">Agilidade</span>
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  O icônico jogo de quebra-cabeças de encaixar blocos em tempo real. Elimine linhas para somar pontos, avançar de nível e testar seus reflexos sob gravidade progressiva!
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-6 mt-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Recorde Pessoal</p>
                  <p className="text-lg font-black text-indigo-350">{scores.tetris} pontos</p>
                </div>
                <button 
                  onClick={() => { setActiveGame('tetris'); setIsFullscreen(false); }}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-650 hover:from-indigo-600 hover:to-indigo-750 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <Play size={16} fill="currentColor" />
                  Jogar Agora
                </button>
              </div>
            </div>

            {/* CARD 2: SHOW DO CRISTÃO */}
            <div className="group relative bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl hover:border-amber-500/40 transition-all hover:scale-[1.02] duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
              <div>
                <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <Trophy size={28} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 flex items-center gap-2">
                  Show do Cristão
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold uppercase">Teologia</span>
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Inspirado no clássico programa de TV. Responda a perguntas teológicas de níveis crescentes baseadas na Declaração de Fé CPAD/CGADB. Use as ajudas de universitários, cartas e pulos!
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-6 mt-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Maior Prêmio Ganho</p>
                  <p className="text-lg font-black text-amber-400">R$ {scores.show.toLocaleString('pt-BR')}</p>
                </div>
                <button 
                  onClick={() => { setActiveGame('show'); setIsFullscreen(false); }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-550 to-orange-550 hover:from-amber-600 hover:to-orange-650 text-slate-950 rounded-2xl text-sm font-black flex items-center gap-2 hover:shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Play size={16} fill="currentColor" />
                  Jogar Agora
                </button>
              </div>
            </div>

          </div>

          {/* NOTA DE INTUITIVIDADE */}
          <div className="mt-12 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 max-w-md mx-auto bg-slate-900/30 p-3.5 rounded-2xl border border-slate-800/50">
            <Info size={14} className="text-indigo-400 shrink-0" />
            <span>Nossos jogos salvam recordes de forma segura em seu navegador. Divirta-se e edifique seus conhecimentos!</span>
          </div>
        </div>
      )}

      {/* RENDERIZADOR DO GAME ATIVO DENTRO DA JANELA "FULL HD" (COM FECHAR/MAXIMIZAR) */}
      {activeGame !== 'none' && (
        <div className={`fixed inset-0 z-[50] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 md:p-6 no-print overflow-hidden`}>
          
          {/* WINDOW CONTAINER COM CONTROLES */}
          <div className={`flex flex-col bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden ${
            isFullscreen ? 'fixed inset-0 w-screen h-screen rounded-none z-[100]' : 'max-w-6xl w-full h-[90vh] relative z-10'
          }`}>
            
            {/* BARRA DE TÍTULO DA JANELA */}
            <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between select-none shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeGame === 'tetris' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {activeGame === 'tetris' ? <Gamepad2 size={16} /> : <Trophy size={16} />}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white tracking-wide">
                    {activeGame === 'tetris' ? 'TETRIS TRADICIONAL GIPP' : 'SHOW DO CRISTÃO GIPP'}
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mt-1">
                    {isFullscreen ? 'Modo Full HD / Tela Cheia' : 'Janela HD'}
                  </p>
                </div>
              </div>

              {/* BOTÕES DE FECHAR, MAXIMIZAR/RESTAURAR */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? 'Restaurar Janela' : 'Maximizar / Full HD'}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-500 hover:text-white text-slate-400 transition-all cursor-pointer"
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

            {/* ÁREA INTERNA DO GAME COM SCROLL INTERNO CONTROLADO */}
            <div className="flex-1 overflow-y-auto bg-slate-950/80 relative flex flex-col justify-between">
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
// SUBCOMPONENTE: JOGO DE TETRIS
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

  // Estados das peças
  const [currentPiece, setCurrentPiece] = useState<{
    shape: number[][];
    type: keyof typeof SHAPES;
    x: number;
    y: number;
  } | null>(null);

  const [nextPieceType, setNextPieceType] = useState<keyof typeof SHAPES>('I');

  const gameInterval = useRef<NodeJS.Timeout | null>(null);

  // Gera uma peça aleatória
  const getRandomPieceType = (): keyof typeof SHAPES => {
    const keys = Object.keys(SHAPES) as (keyof typeof SHAPES)[];
    return keys[Math.floor(Math.random() * keys.length)];
  };

  // Inicia o jogo
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

  // Verifica colisões
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

  // Trava a peça no grid
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

    // Verifica linhas completas
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
      // Pontuação clássica: 1 linha = 100, 2 = 300, 3 = 500, 4 = 800 (vezes o nível)
      const pointsTable = [0, 100, 300, 500, 800];
      const points = pointsTable[clearedLines] * level;
      
      setScore(prev => prev + points);
      setLines(prev => {
        const nextLines = prev + clearedLines;
        // Avança o nível a cada 10 linhas
        const nextLevel = Math.floor(nextLines / 10) + 1;
        setLevel(nextLevel);
        return nextLines;
      });
    }

    // Spawn a próxima peça
    const currentNext = nextPieceType;
    const newNext = getRandomPieceType();
    setNextPieceType(newNext);

    if (checkCollision(SHAPES[currentNext], Math.floor((COLS - SHAPES[currentNext][0].length) / 2), 0, filteredGrid)) {
      // Game Over
      setIsLost(true);
      setIsPlaying(false);
      onGameOver(score);
    } else {
      setGrid(filteredGrid);
      spawnPiece(currentNext);
    }
  };

  // Move a peça para baixo (gravidade)
  const moveDown = () => {
    if (!isPlaying || isPaused || !currentPiece) return;

    if (!checkCollision(currentPiece.shape, currentPiece.x, currentPiece.y + 1, grid)) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null);
    } else {
      lockPiece(currentPiece.shape, currentPiece.type, currentPiece.x, currentPiece.y, grid);
    }
  };

  // Move para os lados
  const moveHorizontal = (dir: number) => {
    if (!isPlaying || isPaused || !currentPiece) return;

    if (!checkCollision(currentPiece.shape, currentPiece.x + dir, currentPiece.y, grid)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x + dir } : null);
    }
  };

  // Rotaciona a peça de forma correta
  const rotatePiece = () => {
    if (!isPlaying || isPaused || !currentPiece) return;

    const shape = currentPiece.shape;
    const N = shape.length;
    const M = shape[0].length;
    
    // Matriz transposta rotacionada
    const rotated = Array(M).fill(null).map(() => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < M; c++) {
        rotated[c][N - 1 - r] = shape[r][c];
      }
    }

    // Tenta rotacionar e ajusta coordenadas se bater na parede (wall kick básico)
    let nextX = currentPiece.x;
    if (nextX + rotated[0].length > COLS) {
      nextX = COLS - rotated[0].length;
    }
    if (nextX < 0) nextX = 0;

    if (!checkCollision(rotated, nextX, currentPiece.y, grid)) {
      setCurrentPiece(prev => prev ? { ...prev, shape: rotated, x: nextX } : null);
    }
  };

  // Drop rápido instantâneo
  const hardDrop = () => {
    if (!isPlaying || isPaused || !currentPiece) return;

    let targetY = currentPiece.y;
    while (!checkCollision(currentPiece.shape, currentPiece.x, targetY + 1, grid)) {
      targetY++;
    }

    lockPiece(currentPiece.shape, currentPiece.type, currentPiece.x, targetY, grid);
  };

  // Teclado Controls
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
  }, [isPlaying, isPaused, currentPiece, grid, level, nextPieceType]);

  // Intervalo de queda dinâmico com base no nível
  useEffect(() => {
    if (gameInterval.current) clearInterval(gameInterval.current);

    if (isPlaying && !isPaused) {
      // Fórmula de velocidade de queda: acelera 150ms a cada nível
      const speed = Math.max(100, 900 - (level - 1) * 120);
      gameInterval.current = setInterval(() => {
        moveDown();
      }, speed);
    }

    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current);
    };
  }, [isPlaying, isPaused, currentPiece, grid, level, nextPieceType]);

  // Renderiza a visualização mesclada do grid estático e a peça ativa
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
    <div className="flex-1 p-4 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-center max-w-4xl mx-auto w-full">
      
      {/* PAINEL DE INFORMAÇÕES ESQUERDA */}
      <div className="flex flex-col gap-4 w-full md:w-48 shrink-0">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1">Pontuação</p>
          <p className="text-3xl font-black text-white">{score}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex md:flex-col justify-between gap-2">
          <div>
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1">Nível</p>
            <p className="text-2xl font-black text-indigo-400">{level}</p>
          </div>
          <div className="md:mt-2">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1">Linhas</p>
            <p className="text-2xl font-black text-emerald-400">{lines}</p>
          </div>
        </div>

        {/* PRÓXIMA PEÇA */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl hidden md:flex flex-col items-center">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-3 text-center w-full">Seguinte</p>
          <div className="w-20 h-20 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-850">
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${SHAPES[nextPieceType][0].length}, minmax(0, 1fr))` }}>
              {SHAPES[nextPieceType].map((row, r) => 
                row.map((cell, c) => (
                  <div 
                    key={`${r}-${c}`} 
                    className={`w-4 h-4 rounded-sm border ${cell !== 0 ? COLORS[nextPieceType] : 'bg-transparent border-transparent'}`}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DO TABULEIRO */}
      <div className="relative">
        <div className="bg-slate-900 border-4 border-slate-800 p-1.5 rounded-[1.8rem] shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <div 
            className="grid gap-0.5 bg-slate-950 rounded-2xl overflow-hidden"
            style={{ 
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              width: '260px',
              height: '520px'
            }}
          >
            {currentRender.map((row, r) =>
              row.map((cell, c) => (
                <div 
                  key={`${r}-${c}`} 
                  className={`w-full h-full border border-slate-900/45 transition-colors rounded-[2px] ${
                    cell !== '' ? COLORS[cell as keyof typeof COLORS] : 'bg-slate-950/20'
                  }`}
                />
              ))
            )}
          </div>
        </div>

        {/* OVERLAYS DE ESTADO */}
        {!isPlaying && !isLost && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-[1.8rem] flex flex-col items-center justify-center p-6 text-center">
            <Gamepad2 size={48} className="text-indigo-400 mb-4 animate-bounce" />
            <h4 className="text-xl font-extrabold text-white mb-2">Pronto para Jogar?</h4>
            <p className="text-xs text-slate-400 max-w-[200px] mb-6">Use as setas ou clique nos botões virtuais para movimentar as peças.</p>
            <button 
              onClick={startGame}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl w-full transition-all cursor-pointer"
            >
              Iniciar Jogo
            </button>
          </div>
        )}

        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-[1.8rem] flex flex-col items-center justify-center p-6 text-center">
            <Pause size={48} className="text-yellow-400 mb-4 animate-pulse" />
            <h4 className="text-xl font-extrabold text-white mb-4">Jogo Pausado</h4>
            <button 
              onClick={() => setIsPaused(false)}
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded-xl transition-all cursor-pointer"
            >
              Continuar
            </button>
          </div>
        )}

        {isLost && (
          <div className="absolute inset-0 bg-rose-950/95 backdrop-blur-sm rounded-[1.8rem] flex flex-col items-center justify-center p-6 text-center border-2 border-rose-500/20">
            <Award size={48} className="text-rose-400 mb-4 animate-pulse" />
            <h4 className="text-2xl font-black text-white mb-1">Fim de Jogo!</h4>
            <p className="text-xs text-rose-300 mb-6">Sua pontuação final foi de:</p>
            <p className="text-4xl font-black text-rose-400 mb-6">{score}</p>
            <button 
              onClick={startGame}
              className="px-6 py-3 bg-white text-slate-900 font-bold rounded-2xl w-full hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              Tentar Novamente
            </button>
          </div>
        )}
      </div>

      {/* CONTROLES PARA MOBILE/MUSE / AJUDAS DE TOQUE */}
      <div className="flex flex-col gap-4 w-full md:w-48 shrink-0">
        
        {/* RECORDE DO PORTAL */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">Melhor Pontuação</p>
            <p className="text-base font-black text-amber-400">{highScore} pts</p>
          </div>
          <Trophy size={20} className="text-amber-400" />
        </div>

        {/* CONTROLES VIRTUAIS */}
        <div className="bg-slate-900/80 border border-slate-850 p-4 rounded-3xl shadow-xl flex flex-col items-center gap-3">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest text-center">Controles Digitais</p>
          
          <div className="grid grid-cols-3 gap-2 w-full max-w-[160px]">
            <div></div>
            <button 
              onClick={rotatePiece}
              className="w-10 h-10 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              title="Rotacionar"
            >
              <ArrowUp size={18} />
            </button>
            <div></div>

            <button 
              onClick={() => moveHorizontal(-1)}
              className="w-10 h-10 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              title="Esquerda"
            >
              <ArrowLeft size={18} />
            </button>
            <button 
              onClick={hardDrop}
              className="w-10 h-10 bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer font-bold text-xs"
              title="Queda Rápida"
            >
              Drop
            </button>
            <button 
              onClick={() => moveHorizontal(1)}
              className="w-10 h-10 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              title="Direita"
            >
              <ArrowRight size={18} />
            </button>

            <div></div>
            <button 
              onClick={moveDown}
              className="w-10 h-10 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              title="Descer"
            >
              <ArrowDown size={18} />
            </button>
            <div></div>
          </div>

          {isPlaying && (
            <button 
              onClick={() => setIsPaused(p => !p)}
              className="mt-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Pause size={12} />
              {isPaused ? 'Retomar' : 'Pausar Jogo'}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

// ==========================================
// SUBCOMPONENTE: JOGO SHOW DO CRISTÃO
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

  // Sistema de ajudas
  const [helps, setHelps] = useState({
    pulos: 3,
    cartas: 1,
    universitarios: 1,
    placas: 1
  });

  // Auxiliares de ajudas ativas
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [activeHelpResult, setActiveHelpResult] = useState<{
    type: 'cartas' | 'universitarios' | 'placas' | null;
    message: string;
    data?: any;
  }>({ type: null, message: '' });

  // Questões filtradas da rodada atual
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);

  // Inicia as perguntas do jogo de forma misturada para não cansar o aluno
  const initGameQuestions = () => {
    // Pegamos 5 fáceis, 5 médias, 4 difíceis e a final
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
  
  // Prêmio acumulado real se responder e se errar
  const getPrizeStatus = () => {
    const qIndex = currentQuestionIndex;
    
    const currentPrize = qIndex > 0 ? PRIZES[qIndex - 1] : 0;
    const targetPrize = PRIZES[qIndex];
    
    // Se errar leva metade do valor acumulado
    const failPrize = Math.floor(currentPrize / 2);
    // Se parar leva o valor acumulado cheio
    const stopPrize = currentPrize;

    return {
      current: currentPrize,
      target: targetPrize,
      fail: failPrize,
      stop: stopPrize
    };
  };

  const prizeStatus = getPrizeStatus();

  // Função para responder
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
      // Se for a última pergunta
      if (currentQuestionIndex === gameQuestions.length - 1) {
        setTimeout(() => {
          setGameState('won');
          onGameOver(1000000);
        }, 3000);
      }
    } else {
      setTimeout(() => {
        setGameState('gameover');
        onGameOver(prizeStatus.fail);
      }, 3000);
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

  // Parar o jogo voluntariamente e garantir o acumulado cheio
  const stopGame = () => {
    setGameState('gameover');
    onGameOver(prizeStatus.stop);
  };

  // ==========================================
  // AJUDAS: PULOS
  // ==========================================
  const usePulo = () => {
    if (helps.pulos <= 0 || isAnswered) return;
    setHelps(prev => ({ ...prev, pulos: prev.pulos - 1 }));
    nextQuestion();
  };

  // ==========================================
  // AJUDAS: CARTAS (ELIMINA DE 0 A 3 OPÇÕES INCORRETAS)
  // ==========================================
  const useCartas = () => {
    if (helps.cartas <= 0 || isAnswered) return;
    setHelps(prev => ({ ...prev, cartas: prev.cartas - 1 }));

    // Escolhe aleatoriamente quantas cartas eliminar: de 0 a 3
    const optionsToEliminateCount = [1, 2, 3, 0][Math.floor(Math.random() * 4)];
    
    const incorrectIndices: number[] = [];
    currentQuestion.options.forEach((_, idx) => {
      if (idx !== currentQuestion.answer) {
        incorrectIndices.push(idx);
      }
    });

    // Mistura índices incorretos
    const toEliminate = incorrectIndices.sort(() => Math.random() - 0.5).slice(0, optionsToEliminateCount);
    setEliminatedOptions(toEliminate);

    let msg = '';
    if (optionsToEliminateCount === 0) {
      msg = 'Você virou o Rei! Nenhuma carta incorreta foi eliminada.';
    } else {
      msg = `Você virou o número ${optionsToEliminateCount}! Foram eliminadas ${optionsToEliminateCount} alternativas erradas.`;
    }

    setActiveHelpResult({
      type: 'cartas',
      message: msg
    });
  };

  // ==========================================
  // AJUDAS: UNIVERSITÁRIOS (DÃO PALPITES EM %)
  // ==========================================
  const useUniversitarios = () => {
    if (helps.universitarios <= 0 || isAnswered) return;
    setHelps(prev => ({ ...prev, universitarios: prev.universitarios - 1 }));

    const rightAns = currentQuestion.answer;
    
    // Simula inteligência baseada no nível
    let correctPercent = 85; // Fáceis
    if (currentQuestion.level === 'medio') correctPercent = 65;
    if (currentQuestion.level === 'dificil') correctPercent = 45;
    if (currentQuestion.level === 'final') correctPercent = 35;

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
      { name: 'Irmão Lucas (Bacharel)', vote: percents },
      { name: 'Obreira Sarah (Profª EBD)', vote: percents },
      { name: 'Diácono Tiago (Líder Kids)', vote: percents }
    ];

    setActiveHelpResult({
      type: 'universitarios',
      message: 'Os universitários deram seus palpites teológicos para cada alternativa:',
      data: students
    });
  };

  // ==========================================
  // AJUDAS: PLACAS (PLATEIA VOTANDO)
  // ==========================================
  const usePlacas = () => {
    if (helps.placas <= 0 || isAnswered) return;
    setHelps(prev => ({ ...prev, placas: prev.placas - 1 }));

    const rightAns = currentQuestion.answer;
    
    // Simula inteligência baseada no nível
    let correctPercent = 75; // Fáceis
    if (currentQuestion.level === 'medio') correctPercent = 55;
    if (currentQuestion.level === 'dificil') correctPercent = 35;
    if (currentQuestion.level === 'final') correctPercent = 25;

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

    setActiveHelpResult({
      type: 'placas',
      message: 'A plateia de alunos da EBD levantou as placas apontando suas escolhas:',
      data: percents
    });
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
      
      {/* TELA INICIAL DO GAME */}
      {gameState === 'welcome' && (
        <div className="text-center py-10 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-amber-500/15 border-2 border-amber-500/40 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
            <Trophy size={48} className="animate-pulse" />
          </div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Show do Cristão</h2>
          <p className="text-xs text-amber-400 uppercase tracking-[0.25em] font-extrabold mb-6">A Grande Sabedoria Teológica</p>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Doutrine-se! Um teste de perguntas e respostas formulado com base nos **24 capítulos da Declaração de Fé das Assembleias de Deus**. Divirta-se jogando e avance as rodadas para buscar o prêmio máximo de 1 Milhão de pontos teológicos!
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="text-center p-3">
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Melhor Prêmio</p>
              <p className="text-xl font-extrabold text-amber-400">R$ {highScore.toLocaleString('pt-BR')}</p>
            </div>
            <div className="text-center p-3 border-l border-slate-800">
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Total Perguntas</p>
              <p className="text-xl font-extrabold text-white">15 Questões</p>
            </div>
          </div>

          <button 
            onClick={initGameQuestions}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-2xl text-base shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition-all cursor-pointer transform hover:scale-105"
          >
            Iniciar Novo Jogo
          </button>
        </div>
      )}

      {/* TELA DO JOGO ATIVO */}
      {gameState === 'playing' && currentQuestion && (
        <div className="w-full flex flex-col lg:flex-row gap-6">
          
          {/* PAINEL CENTRAL DA PERGUNTA */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* INFORMAÇÕES DA PERGUNTA */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl border-l border-b border-indigo-500/20">
                {currentQuestion.chapter}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                  currentQuestion.level === 'facil' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  currentQuestion.level === 'medio' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  currentQuestion.level === 'dificil' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                }`}>
                  Fase {currentQuestion.level}
                </span>
                <span className="text-slate-500 text-xs font-semibold">Questão {currentQuestionIndex + 1} de 15</span>
              </div>

              <h3 className="text-xl md:text-2xl font-extrabold text-white leading-snug">
                {currentQuestion.question}
              </h3>
            </div>

            {/* LISTA DE OPÇÕES / ALTERNATIVAS */}
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isEliminated = eliminatedOptions.includes(idx);
                const isSelected = selectedOption === idx;
                const isCorrectAns = currentQuestion.answer === idx;
                
                let btnStyles = "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900";
                
                if (isEliminated) {
                  btnStyles = "bg-slate-950/20 border-slate-900/30 text-slate-600 cursor-not-allowed line-through opacity-45";
                } else if (isSelected) {
                  if (isAnswered) {
                    btnStyles = isCorrectAns 
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30"
                      : "bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/30";
                  } else {
                    btnStyles = "bg-amber-500/10 border-amber-500 text-amber-200 ring-2 ring-amber-500/30";
                  }
                } else if (isAnswered && isCorrectAns) {
                  btnStyles = "bg-emerald-500/20 border-emerald-500 text-emerald-200";
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered || isEliminated}
                    onClick={() => handleOptionClick(idx)}
                    className={`w-full p-4 md:p-5 border rounded-2xl flex items-start gap-4 text-left transition-all duration-200 ${btnStyles}`}
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      isEliminated ? 'bg-slate-950/25 border-slate-900 text-slate-500' :
                      isSelected ? 'bg-amber-500 text-slate-950 border-amber-400' :
                      'bg-slate-850 border-slate-800 text-slate-400'
                    }`}>
                      {optionLetters[idx]}
                    </span>
                    <span className="text-sm font-semibold pt-1 leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* BOTÕES DE CONFIRMAÇÃO E JUSTIFICATIVA DO PROFESSOR */}
            <div className="flex flex-col gap-4">
              
              {/* Botão Responder / Confirmar */}
              {selectedOption !== null && !isAnswered && (
                <button
                  onClick={confirmAnswer}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition-all text-sm uppercase tracking-wider cursor-pointer"
                >
                  Confirmar Resposta
                </button>
              )}

              {/* Justificativa / Explicação teológica após responder */}
              {isAnswered && (
                <div className={`p-5 rounded-2xl border ${
                  hasChosenCorrect 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-300' 
                    : 'bg-rose-500/10 border-rose-500/20 text-slate-300'
                }`}>
                  <div className="flex items-center gap-2 mb-2 font-black text-sm">
                    {hasChosenCorrect ? (
                      <>
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        <span className="text-emerald-400">Resposta Correta!</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={18} className="text-rose-400" />
                        <span className="text-rose-400">Incorreto!</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed italic mb-3">
                    &ldquo;{currentQuestion.explanation}&rdquo;
                  </p>
                  
                  {hasChosenCorrect && (
                    <button
                      onClick={nextQuestion}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      Continuar Desafio
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* PAINEL DE AJUDAS ATIVAS RESULTADO */}
              {activeHelpResult.type && (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-inner">
                  <p className="text-xs text-indigo-400 font-extrabold flex items-center gap-1.5 mb-2">
                    <Info size={14} />
                    Ajuda Utilizada: {activeHelpResult.type.toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold mb-3">
                    {activeHelpResult.message}
                  </p>

                  {/* Detalhe universitários */}
                  {activeHelpResult.type === 'universitarios' && activeHelpResult.data && (
                    <div className="grid gap-2 text-[11px] font-mono mt-2">
                      {activeHelpResult.data.map((stud: any, sIdx: number) => (
                        <div key={sIdx} className="bg-slate-950 p-2 rounded-lg border border-slate-850 flex items-center justify-between">
                          <span className="text-slate-400 font-bold">{stud.name}:</span>
                          <div className="flex gap-3">
                            {optionLetters.map((l, lIdx) => (
                              <span key={lIdx} className={stud.vote[lIdx] > 40 ? 'text-emerald-400 font-black' : 'text-slate-500'}>
                                {l}: {stud.vote[lIdx]}%
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Detalhe placas */}
                  {activeHelpResult.type === 'placas' && activeHelpResult.data && (
                    <div className="flex flex-col gap-2 mt-2">
                      {optionLetters.map((l, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          <span className="font-extrabold text-slate-400 w-4">{l}:</span>
                          <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-650 rounded-full" 
                              style={{ width: `${activeHelpResult.data[idx]}%` }}
                            />
                          </div>
                          <span className="font-mono text-indigo-300 w-8 text-right font-black">{activeHelpResult.data[idx]}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* PAINEL LATERAL: AJUDAS, PONTOS, ACUMULADO */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
            
            {/* VALORES DO ACUMULADO */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest text-center mb-3">Valores Teológicos da Questão</p>
              
              <div className="flex flex-col gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Acertar:</span>
                  <span className="text-lg font-black text-amber-400">R$ {prizeStatus.target.toLocaleString('pt-BR')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-center">
                    <span className="text-[10px] text-slate-500 block">Parar:</span>
                    <span className="text-xs font-extrabold text-white">R$ {prizeStatus.stop.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-center">
                    <span className="text-[10px] text-slate-500 block">Errar:</span>
                    <span className="text-xs font-extrabold text-rose-400">R$ {prizeStatus.fail.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {!isAnswered && (
                <button
                  onClick={stopGame}
                  className="mt-4 w-full py-2.5 bg-rose-600/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Parar e Garantir R$ {prizeStatus.stop.toLocaleString('pt-BR')}
                </button>
              )}
            </div>

            {/* BOTÕES DE AJUDAS CLÁSSICAS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest text-center mb-4">Ajudas Disponíveis</p>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Universitários */}
                <button
                  disabled={helps.universitarios <= 0 || isAnswered}
                  onClick={useUniversitarios}
                  className={`p-3 border rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer ${
                    helps.universitarios > 0 && !isAnswered
                      ? 'bg-slate-850 border-slate-800 text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800'
                      : 'bg-slate-950/20 border-slate-900/40 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Users size={18} className="mb-1 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase">Universitários</span>
                  <span className="text-[9px] text-slate-500 font-bold mt-0.5">{helps.universitarios} restante</span>
                </button>

                {/* Cartas */}
                <button
                  disabled={helps.cartas <= 0 || isAnswered}
                  onClick={useCartas}
                  className={`p-3 border rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer ${
                    helps.cartas > 0 && !isAnswered
                      ? 'bg-slate-850 border-slate-800 text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800'
                      : 'bg-slate-950/20 border-slate-900/40 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Coins size={18} className="mb-1 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase">Cartas</span>
                  <span className="text-[9px] text-slate-500 font-bold mt-0.5">{helps.cartas} restante</span>
                </button>

                {/* Placas */}
                <button
                  disabled={helps.placas <= 0 || isAnswered}
                  onClick={usePlacas}
                  className={`p-3 border rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer ${
                    helps.placas > 0 && !isAnswered
                      ? 'bg-slate-850 border-slate-800 text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800'
                      : 'bg-slate-950/20 border-slate-900/40 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <MessageCircle size={18} className="mb-1 text-sky-400" />
                  <span className="text-[10px] font-black uppercase">Placas</span>
                  <span className="text-[9px] text-slate-500 font-bold mt-0.5">{helps.placas} restante</span>
                </button>

                {/* Pulos */}
                <button
                  disabled={helps.pulos <= 0 || isAnswered}
                  onClick={usePulo}
                  className={`p-3 border rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer ${
                    helps.pulos > 0 && !isAnswered
                      ? 'bg-slate-850 border-slate-800 text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800'
                      : 'bg-slate-950/20 border-slate-900/40 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <SkipForward size={18} className="mb-1 text-amber-400" />
                  <span className="text-[10px] font-black uppercase">Pular</span>
                  <span className="text-[9px] text-slate-500 font-bold mt-0.5">{helps.pulos} restantes</span>
                </button>
              </div>
            </div>

            {/* BARRA DE PREMIAÇÃO VERTICAL SIMULADA */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl hidden lg:block overflow-y-auto max-h-[220px] custom-scrollbar">
              <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest text-center mb-3">Tabela de Prêmios</p>
              <div className="flex flex-col gap-1 text-[11px] font-mono">
                {PRIZES.map((prz, pIdx) => {
                  const isActive = currentQuestionIndex === pIdx;
                  const isPassed = currentQuestionIndex > pIdx;
                  return (
                    <div 
                      key={pIdx} 
                      className={`flex justify-between items-center px-3 py-1 rounded-md border ${
                        isActive ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-black' :
                        isPassed ? 'bg-slate-950/40 border-transparent text-slate-500' :
                        'border-transparent text-slate-400'
                      }`}
                    >
                      <span className="font-sans font-bold">{pIdx + 1}ª Q:</span>
                      <span>R$ {prz.toLocaleString('pt-BR')}</span>
                    </div>
                  );
                }).reverse()}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TELA DE GAME OVER (PERDEU OU PAROU) */}
      {gameState === 'gameover' && (
        <div className="text-center py-10 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-rose-500/10 border-2 border-rose-500/30 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <Award size={40} className="animate-pulse" />
          </div>
          <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Fim de Jogo!</h3>
          <p className="text-xs text-rose-400 uppercase tracking-widest font-extrabold mb-6">Desafio de Teologia Encerrado</p>
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 max-w-md mx-auto">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Prêmio Conquistado</p>
            <p className="text-4xl font-black text-amber-400">R$ {prizeStatus.stop.toLocaleString('pt-BR')}</p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setGameState('welcome')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-2xl transition-all cursor-pointer"
            >
              Menu Inicial
            </button>
            <button
              onClick={initGameQuestions}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-2xl text-sm shadow-md shadow-amber-500/10 transition-all cursor-pointer"
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      )}

      {/* TELA DE PARABÉNS (GANHOU 1 MILHÃO) */}
      {gameState === 'won' && (
        <div className="text-center py-10 max-w-lg mx-auto">
          <div className="w-24 h-24 bg-yellow-400/20 border-4 border-yellow-450 text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-bounce">
            <Trophy size={48} />
          </div>
          <h3 className="text-4xl font-black text-transparent bg-gradient-to-r from-white via-yellow-200 to-amber-200 bg-clip-text mb-2 tracking-tight">
            Parabéns! Excelente!
          </h3>
          <p className="text-xs text-yellow-400 uppercase tracking-widest font-extrabold mb-6">Doutrinado de Nível Avançado</p>
          
          <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/20 border-2 border-yellow-500/30 p-8 rounded-3xl mb-8 max-w-md mx-auto shadow-2xl">
            <p className="text-slate-350 text-xs uppercase tracking-wider mb-2">Você Alcançou o Prêmio Máximo!</p>
            <p className="text-5xl font-black text-yellow-400 drop-shadow-[0_2px_10px_rgba(234,179,8,0.2)]">
              R$ 1.000.000
            </p>
            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed font-semibold">
              Você completou com perfeição todas as rodadas do Show do Cristão, demonstrando profundo conhecimento doutrinário da Palavra de Deus!
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setGameState('welcome')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-2xl transition-all cursor-pointer"
            >
              Menu Inicial
            </button>
            <button
              onClick={initGameQuestions}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-950 font-black rounded-2xl text-sm shadow-md transition-all cursor-pointer"
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
