/**
 * holyricsService.ts
 * Motor de Transmissão e Projeção Multitelas para Telão / Projetor (Estilo Holyrics)
 * 
 * Permite transmissão independente em tela secundária / janela destacada
 * enquanto a operação no sistema continua ativa sem interrupções.
 */

export type ImageFitMode = 'contain' | 'cover' | 'fill';

export interface HolyricsSlide {
  id: string;
  tipo: 'capa' | 'versiculo' | 'letra' | 'refrao' | 'topico' | 'doutrina' | 'aplicacao' | 'quiz' | 'conclusao' | 'aviso' | 'texto_livre' | 'midia_imagem';
  titulo: string;
  subtitulo?: string;
  texto?: string;
  versiculo?: { texto: string; referencia: string };
  pontos?: string[];
  notas?: string;
  imagemFundo?: string;
  imagemUrl?: string;
  ajusteImagem?: ImageFitMode;
  ocultarLegenda?: boolean;
  estiloTexto?: {
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    align?: 'left' | 'center' | 'right';
    bold?: boolean;
    italic?: boolean;
    uppercase?: boolean;
    colorTheme?: 'gold' | 'white' | 'cyan' | 'emerald' | 'amber' | 'rose';
  };
  corDestaque?: string;
  numeroOrdem?: number;
}

export interface HolyricsAlert {
  id: string;
  tipo: 'carro' | 'bercario' | 'aviso' | 'urgente' | 'oracao';
  texto: string;
  subtexto?: string;
  timestamp: number;
  expiraEmMs?: number;
  ativo: boolean;
}

export interface HolyricsTimer {
  ativo: boolean;
  modo: 'countdown' | 'cronometro' | 'relogio';
  tempoRestanteSegundos: number;
  tempoTotalSegundos: number;
  rotulo: string;
}

export interface BlocoLiturgico {
  id: string;
  titulo: string;
  subtitulo?: string;
  duracaoMinutos: number;
  responsavel?: string;
  tipo: 'oracao' | 'louvor' | 'leitura' | 'dizimo' | 'palavra' | 'avisos' | 'apelo' | 'encerramento';
  leituraBiblica?: string;
  hinos?: string;
  imagemUrl?: string;
  midiaTitulo?: string;
  textoProjecao?: string;
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

export interface PulpitoState {
  cultoTitulo: string;
  cultoData: string;
  dirigenteNome: string;
  pregadorNome: string;
  blocos: BlocoLiturgico[];
  blocoAtivoIndex: number;
  tempoRestante: number; // em segundos
  isRunning: boolean;
  isOvertime: boolean;
  tempoExcedido: number;
  avisos: AvisoPulpito[];
  textoBiblicoDestaque?: string;
  stageTheme: 'dark' | 'light';
  tamanhoFonteBiblia: 'normal' | 'grande' | 'extragrande';
}

export interface ChurchDisplayInfo {
  nome: string;
  logoUrl?: string;
  pastor?: string;
  cidade?: string;
  uf?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  site?: string;
  cnpj?: string;
  chave_pix?: string;
  subtitulo?: string;
}

export type HolyricsTheme = 'navy' | 'dark' | 'amber' | 'clean' | 'royal' | 'cinema';

export type HolyricsAnimatedBg = 
  | 'none'
  | 'particulas_douradas'
  | 'ondas_celestiais'
  | 'feixes_luz'
  | 'bokeh_avivamento'
  | 'nebulosa_oracao'
  | 'fogo_pentecostal';

export interface AnimatedBgOption {
  id: HolyricsAnimatedBg;
  nome: string;
  descricao: string;
  corPreview: string;
  icone: string;
}

export const LISTA_FUNDOS_ANIMADOS: AnimatedBgOption[] = [
  {
    id: 'none',
    nome: 'Sem Animação',
    descricao: 'Gradiente sólido clássico',
    corPreview: 'from-slate-900 to-slate-950',
    icone: '🚫'
  },
  {
    id: 'particulas_douradas',
    nome: 'Partículas de Glória',
    descricao: 'Poeira dourada ascendente e brilho suave',
    corPreview: 'from-amber-950 via-slate-950 to-amber-900',
    icone: '✨'
  },
  {
    id: 'ondas_celestiais',
    nome: 'Ondas Celestiais',
    descricao: 'Fluxo contínuo de ondas azul-anil e ciano',
    corPreview: 'from-indigo-950 via-slate-950 to-blue-900',
    icone: '🌊'
  },
  {
    id: 'feixes_luz',
    nome: 'Feixes de Luz Celestial',
    descricao: 'Raios divinos volumétricos em movimento lento',
    corPreview: 'from-sky-950 via-slate-900 to-indigo-950',
    icone: '☀️'
  },
  {
    id: 'bokeh_avivamento',
    nome: 'Bokeh de Adoração',
    descricao: 'Orbes flutuantes com pulsação suave',
    corPreview: 'from-purple-950 via-slate-950 to-violet-900',
    icone: '🔮'
  },
  {
    id: 'nebulosa_oracao',
    nome: 'Nebulosa de Oração',
    descricao: 'Nuvens cósmicas vivas em tons violeta e esmeralda',
    corPreview: 'from-violet-950 via-slate-950 to-emerald-950',
    icone: '🌌'
  },
  {
    id: 'fogo_pentecostal',
    nome: 'Chama do Espírito',
    descricao: 'Brasas vivas e energia do avivamento pentecostal',
    corPreview: 'from-red-950 via-amber-950 to-slate-950',
    icone: '🔥'
  }
];

export interface HolyricsState {
  ativo: boolean;
  tituloApresentacao: string;
  categoria: 'slides' | 'louvor' | 'biblia' | 'aviso' | 'liturgia' | 'custom';
  slides: HolyricsSlide[];
  indiceAtual: number;
  blackout: boolean;
  limparTexto: boolean;
  exibirLogo: boolean;
  modoRetornoPalco: boolean; // Stage Display para retorno com próximo slide e notas
  modoLowerThird: boolean; // Terço inferior para live streaming / OBS
  tema: HolyricsTheme;
  fundoTipo: 'gradiente' | 'solido' | 'animado' | 'imagem';
  fundoAnimado?: HolyricsAnimatedBg;
  fundoCustomUrl?: string;
  tamanhoFonteRatio: number; // 0.8 a 1.6
  alinhamentoTexto: 'center' | 'left';
  alertaAtivo: HolyricsAlert | null;
  cronometro: HolyricsTimer;
  igrejaNome: string;
  igrejaLogoUrl?: string;
  igrejaInfo?: ChurchDisplayInfo;
  enquadramentoImagem?: ImageFitMode;
  ultimaAtualizacao: number;
  // Estado Integrado da Tela Secundária (Púlpito / Stage Display)
  pulpito: PulpitoState;
}

export const DEFAULT_BLOCOS_PULPITO: BlocoLiturgico[] = [
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
];

export const DEFAULT_AVISOS_PULPITO: AvisoPulpito[] = [
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
];

const STORAGE_KEY = 'gipp_holyrics_projection_state';
const BROADCAST_CHANNEL_NAME = 'gipp_holyrics_channel';

// Dados Padrão Iniciais
export const DEFAULT_HOLYRICS_SLIDES: HolyricsSlide[] = [
  {
    id: 'slide-padrao-1',
    tipo: 'capa',
    titulo: 'Bem-vindos à Casa do Senhor',
    subtitulo: 'Culto de Celebração, Louvor e Adoração',
    notas: 'Acolher os membros e visitantes. Convidar a igreja a se colocar em reverência.',
    texto: 'Alegrei-me quando me disseram: Vamos à Casa do Senhor! (Salmos 122:1)'
  },
  {
    id: 'slide-padrao-2',
    tipo: 'versiculo',
    titulo: 'Texto Bíblico Inicial',
    subtitulo: 'Salmos 100:1-4',
    versiculo: {
      texto: 'Celebrai com júbilo ao Senhor, todas as terras. Servi ao Senhor com alegria, apresentai-vos a ele com cântico. Entrai pelas portas dele com louvor e em seus átrios, com hinos!',
      referencia: 'Salmos 100:1,2,4'
    },
    notas: 'Leitura congregacional em uníssono com a congregação em pé.'
  },
  {
    id: 'slide-padrao-3',
    tipo: 'letra',
    titulo: 'Harpa Cristã - Hino 15',
    subtitulo: 'Foi na Cruz (1ª Estrofe)',
    texto: 'Oh! Quão cego andei e perdido vaguei,\nLonge, longe do meu Salvador!\nMas do céu Ele desceu, e Seu sangue verteu\nPra salvar um tão pobre pecador.',
    notas: 'Hino congregacional tradicional pentecostal.'
  },
  {
    id: 'slide-padrao-4',
    tipo: 'refrao',
    titulo: 'Harpa Cristã - Hino 15',
    subtitulo: 'Coro / Refrão',
    texto: 'Foi na cruz, foi na cruz, onde um dia eu vi\nMeu pecado castigado em Jesus;\nFoi ali, pela fé, que os olhos abri,\nE agora me alegro em Sua luz!',
    corDestaque: '#eab308'
  },
  {
    id: 'slide-padrao-5',
    tipo: 'topico',
    titulo: 'Fundamentação da Palavra',
    subtitulo: 'Declaração de Fé das Assembleias de Deus (CPAD / CGADB)',
    pontos: [
      'Inspiração verbal e plenária das Sagradas Escrituras',
      'Salvação pela graça mediante a fé em Cristo Jesus',
      'Atualidade dos dons espirituais e batismo no Espírito Santo'
    ],
    notas: 'Enfatizar a firmeza doutrinária da igreja local.'
  },
  {
    id: 'slide-padrao-6',
    tipo: 'conclusao',
    titulo: 'Momento de Oração & Comunhão',
    subtitulo: 'Que a graça do Senhor Jesus Cristo seja com todos.',
    texto: 'Apresente seus pedidos a Deus com ações de graças. Ele é fiel para cumprir todas as suas promessas.'
  }
];

// Harpa Cristã Seleção Rápida
export const HARPA_CRISTAL_HINOS: { numero: number; titulo: string; estrofes: string[] }[] = [
  {
    numero: 15,
    titulo: 'Foi na Cruz',
    estrofes: [
      'Oh! Quão cego andei e perdido vaguei,\nLonge, longe do meu Salvador!\nMas do céu Ele desceu, e Seu sangue verteu\nPra salvar um tão pobre pecador.',
      '[REFRÃO]\nFoi na cruz, foi na cruz, onde um dia eu vi\nMeu pecado castigado em Jesus;\nFoi ali, pela fé, que os olhos abri,\nE agora me alegro em Sua luz!',
      'Eu ouvia falar dessa graça sem par,\nQue do céu trouxe nosso Jesus;\nMas eu surdo me fiz, converter-me não quis\nAo Senhor, que por mim morreu na cruz.',
      'Mas um dia senti meu pecado, e vi\nSobre mim o castigo da lei;\nMas apressado fugi, em Jesus me acolhi,\nE a paz e o perdão nEle achei.'
    ]
  },
  {
    numero: 1,
    titulo: 'Chuvas de Graça',
    estrofes: [
      'Deus prometeu derramar chuvas de graça do céu;\nBênçãos que todos hão de fartar, que dEle o crente colheu.',
      '[REFRÃO]\nChuvas de graça, chuvas pedimos, Senhor;\nManda-nos já chuvas mansas, chuvas do Consolador.',
      'Cristo nos dá a promessa do Seu poder divinal;\nFazendo a alma ressuscitar com vida celestial.'
    ]
  },
  {
    numero: 545,
    titulo: 'Jesus Me Salvou',
    estrofes: [
      'Que mudança gloriosa em meu ser se operou,\nDesde que Jesus me salvou!\nE o gozo que sinto que a alma inundou,\nDesde que Jesus me salvou!',
      '[REFRÃO]\nDesde que Jesus me salvou!\nDesde que Jesus me salvou!\nQue alegria e vitória minh\'alma gozou,\nDesde que Jesus me salvou!'
    ]
  },
  {
    numero: 186,
    titulo: 'De Valor em Valor',
    estrofes: [
      'Pela fé que uma vez me foi dada,\nPra seguir o Cordeiro de Deus,\nPela graça de Deus derramada,\nAndarei no caminho dos céus.',
      '[REFRÃO]\nDe valor em valor e de glória em glória,\nAté ver o Senhor na mansão da vitória!'
    ]
  },
  {
    numero: 39,
    titulo: 'Alvo Mais Que a Neve',
    estrofes: [
      'Bendito seja o Cordeiro que na cruz por nós padeceu;\nBendito seja o Seu sangue que por nós ali verteu;\nEis nesse sangue lavados, com roupas que tão brancas são,\nOs pecadores remidos, que perante seu Deus já estão.',
      '[REFRÃO]\nAlvo mais que a neve!\nAlvo mais que a neve!\nSim, nesse sangue lavado,\nMais alvo que a neve serei.'
    ]
  }
];

export const VERSICULOS_RAPIDOS = [
  { ref: 'João 3:16', texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.' },
  { ref: 'Salmos 23:1', texto: 'O Senhor é o meu pastor; nada me faltará.' },
  { ref: 'Filipenses 4:13', texto: 'Posso todas as coisas naquele que me fortalece.' },
  { ref: 'Romanos 8:28', texto: 'E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.' },
  { ref: 'Isaías 40:31', texto: 'Mas os que esperam no Senhor renovarão as suas forças e subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.' },
  { ref: 'Salmos 91:1-2', texto: 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará. Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza, e nele confiarei.' },
  { ref: 'Mateus 28:19-20', texto: 'Portanto ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo; ensinando-os a guardar todas as coisas que eu vos tenho mandado.' },
  { ref: 'Jeremias 29:11', texto: 'Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.' }
];

export const ALERTAS_PRE_CONFIGURADOS = [
  { tipo: 'carro' as const, label: 'Veículo com Farol Aceso', template: 'Aviso: Veículo [PLACA] está com o farol aceso no estacionamento.' },
  { tipo: 'carro' as const, label: 'Veículo Bloqueando Passagem', template: 'Atenção: Veículo [PLACA] favor desimpedir o portão de saída.' },
  { tipo: 'carro' as const, label: 'Alarme de Carro Disparado', template: 'Urgente: Alarme do veículo [PLACA] está disparado.' },
  { tipo: 'bercario' as const, label: 'Chamada do Berçário', template: 'Berçário: Responsáveis pela criança [NOME] favor comparecer.' },
  { tipo: 'aviso' as const, label: 'Dízimos e Ofertas (Chave PIX)', template: 'Momento de Adoração com Dízimos e Ofertas. Chave PIX: [CHAVE]' },
  { tipo: 'aviso' as const, label: 'Silêncio / Celulares', template: 'Por favor, mantenha seus aparelhos celulares no modo silencioso.' },
  { tipo: 'oracao' as const, label: 'Reunião de Obreiros', template: 'Convocação: Breve reunião com o ministério pastoral após o término do culto.' }
];

class HolyricsService {
  private state: HolyricsState;
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(state: HolyricsState) => void> = new Set();
  private telaoWindowRef: Window | null = null;
  private pulpitoWindowRef: Window | null = null;
  private clientWindows: Set<MessageEventSource> = new Set();
  private timerInterval: any = null;
  private pulpitoTimerInterval: any = null;

  constructor() {
    this.state = this.loadInitialState();

    // Inicializa timer do púlpito se já estava ativo
    if (this.state.pulpito?.isRunning) {
      this.ensurePulpitoTimer();
    }

    // Inicializa canal de sincronização entre janelas/abas
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data) {
            if (event.data.type === 'STATE_UPDATE' && event.data.payload) {
              if (event.data.payload.ultimaAtualizacao >= (this.state.ultimaAtualizacao || 0)) {
                this.state = event.data.payload;
                this.notifyListeners();
              }
            } else if (event.data.type === 'PING' || event.data.type === 'REQUEST_STATE') {
              this.broadcastState();
            } else if (event.data.type === 'HOLYRICS_COMMAND') {
              this.executeCommand(event.data.command, event.data.args);
            }
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel não suportado neste contexto:', e);
      }
    }

    // Escuta eventos de postMessage entre janelas (opener, popups, telas secundárias, iframes)
    if (typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        if (!event.data) return;

        // Registra janelas filhas/conectadas para envio direto
        if (event.source) {
          this.clientWindows.add(event.source);
        }

        if (event.data.type === 'HOLYRICS_CLIENT_HELLO' || event.data.type === 'PING' || event.data.type === 'REQUEST_STATE') {
          // Responde imediatamente com o estado atualizado
          this.broadcastState();
          if (event.source) {
            try {
              (event.source as Window).postMessage({
                type: 'HOLYRICS_STATE_SYNC',
                payload: { ...this.state }
              }, '*');
            } catch (e) {}
          }
        } else if (event.data.type === 'HOLYRICS_COMMAND') {
          this.executeCommand(event.data.command, event.data.args);
        } else if (event.data.type === 'HOLYRICS_STATE_SYNC' || event.data.type === 'STATE_UPDATE') {
          if (event.data.payload) {
            const incomingUpdate = event.data.payload.ultimaAtualizacao || 0;
            const currentUpdate = this.state.ultimaAtualizacao || 0;
            if (incomingUpdate >= currentUpdate || !this.state.slides || this.state.slides.length === 0) {
              this.state = event.data.payload;
              this.notifyListeners();
            }
          }
        }
      });
    }

    // Escuta eventos de storage do navegador
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed && (!this.state.ultimaAtualizacao || (parsed.ultimaAtualizacao || 0) >= this.state.ultimaAtualizacao)) {
              this.state = parsed;
              this.notifyListeners();
            }
          } catch (err) {
            console.error('Erro ao processar storage event:', err);
          }
        }
      });
    }
  }

  private getDefaultPulpitoState(): PulpitoState {
    const blocoInicial = DEFAULT_BLOCOS_PULPITO[0];
    return {
      cultoTitulo: 'Culto de Celebração e Doutrina',
      cultoData: new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
      dirigenteNome: 'Pr. Presidente',
      pregadorNome: 'Pr. Convidado',
      blocos: DEFAULT_BLOCOS_PULPITO,
      blocoAtivoIndex: 0,
      tempoRestante: blocoInicial ? blocoInicial.duracaoMinutos * 60 : 300,
      isRunning: false,
      isOvertime: false,
      tempoExcedido: 0,
      avisos: DEFAULT_AVISOS_PULPITO,
      textoBiblicoDestaque: 'Salmos 122:1 — “Alegrei-me quando me disseram: Vamos à casa do Senhor!”',
      stageTheme: 'dark',
      tamanhoFonteBiblia: 'grande'
    };
  }

  public getChurchFromDbCache(): ChurchDisplayInfo | null {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('gipp_portal_db_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.igreja) {
          const ig = parsed.igreja;
          return {
            nome: ig.nome || 'ASSEMBLEIA DE DEUS',
            logoUrl: ig.logo || ig.logo_url || undefined,
            pastor: ig.pastor || '',
            cidade: ig.cidade || '',
            uf: ig.uf || '',
            endereco: ig.endereco || '',
            telefone: ig.telefone || '',
            email: ig.email || '',
            site: ig.site || '',
            cnpj: ig.cnpj || '',
            chave_pix: ig.chave_pix || '',
            subtitulo: ig.subtitulo || 'Comunhão • Palavra • Louvor • Adoração'
          };
        }
      }
    } catch (e) {
      console.warn('Erro ao ler cache do banco da igreja:', e);
    }
    return null;
  }

  private loadInitialState(): HolyricsState {
    const defaultPulpito = this.getDefaultPulpitoState();
    const churchDb = this.getChurchFromDbCache();

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.slides)) {
            // Garante que o estado do púlpito exista
            if (!parsed.pulpito) {
              parsed.pulpito = defaultPulpito;
            } else {
              // Garante propriedades do púlpito
              parsed.pulpito = {
                ...defaultPulpito,
                ...parsed.pulpito,
                blocos: parsed.pulpito.blocos && parsed.pulpito.blocos.length > 0 ? parsed.pulpito.blocos : defaultPulpito.blocos,
                avisos: parsed.pulpito.avisos || defaultPulpito.avisos
              };
            }
            // Sincroniza dados da igreja com o banco se ainda não preenchido ou vazio
            if (churchDb) {
              parsed.igrejaNome = parsed.igrejaNome || churchDb.nome;
              parsed.igrejaLogoUrl = parsed.igrejaLogoUrl || churchDb.logoUrl;
              parsed.igrejaInfo = { ...churchDb, ...(parsed.igrejaInfo || {}) };
            }
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar estado inicial do Holyrics:', e);
      }
    }

    return {
      ativo: false,
      tituloApresentacao: 'Culto de Celebração e Louvor',
      categoria: 'slides',
      slides: DEFAULT_HOLYRICS_SLIDES,
      indiceAtual: 0,
      blackout: false,
      limparTexto: false,
      exibirLogo: false,
      modoRetornoPalco: false,
      modoLowerThird: false,
      tema: 'navy',
      fundoTipo: 'gradiente',
      tamanhoFonteRatio: 1,
      alinhamentoTexto: 'center',
      alertaAtivo: null,
      cronometro: {
        ativo: false,
        modo: 'relogio',
        tempoRestanteSegundos: 0,
        tempoTotalSegundos: 0,
        rotulo: 'Horário Oficial'
      },
      igrejaNome: churchDb?.nome || 'ASSEMBLEIA DE DEUS',
      igrejaLogoUrl: churchDb?.logoUrl,
      igrejaInfo: churchDb || undefined,
      ultimaAtualizacao: Date.now(),
      pulpito: defaultPulpito
    };
  }

  private saveAndBroadcast() {
    this.state.ultimaAtualizacao = Date.now();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Erro ao salvar no localStorage:', e);
      }
    }

    this.broadcastState();
    this.notifyListeners();
  }

  private broadcastState() {
    const payload = { ...this.state };

    // 1. Canal BroadcastChannel (para abas e janelas do mesmo contexto)
    if (this.channel) {
      try {
        this.channel.postMessage({
          type: 'STATE_UPDATE',
          payload
        });
      } catch (e) {
        console.warn('Erro no broadcast channel:', e);
      }
    }

    // 2. Janelas registradas ativas (popups secundários, janelas de 2º monitor conectadas)
    this.clientWindows.forEach((win) => {
      try {
        (win as Window).postMessage({
          type: 'HOLYRICS_STATE_SYNC',
          payload
        }, '*');
      } catch (e) {
        this.clientWindows.delete(win);
      }
    });

    // 3. Referência direta da janela do Telão
    if (this.telaoWindowRef && !this.telaoWindowRef.closed) {
      try {
        this.telaoWindowRef.postMessage({
          type: 'HOLYRICS_STATE_SYNC',
          payload
        }, '*');
      } catch (e) {}
    }

    // 4. Referência direta da janela do Púlpito
    if (this.pulpitoWindowRef && !this.pulpitoWindowRef.closed) {
      try {
        this.pulpitoWindowRef.postMessage({
          type: 'HOLYRICS_STATE_SYNC',
          payload
        }, '*');
      } catch (e) {}
    }

    // 5. Se estivermos num popup ou iframe, notifica window.opener e window.parent
    if (typeof window !== 'undefined') {
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage({
            type: 'HOLYRICS_STATE_SYNC',
            payload
          }, '*');
        } catch (e) {}
      }
      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            type: 'HOLYRICS_STATE_SYNC',
            payload
          }, '*');
        } catch (e) {}
      }
    }
  }

  // Sincronização direta de alta performance a partir do localStorage
  public syncFromStorageIfNewer(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.ultimaAtualizacao === 'number') {
        const currentStamp = this.state.ultimaAtualizacao || 0;
        if (parsed.ultimaAtualizacao > currentStamp) {
          this.state = parsed;
          this.notifyListeners();
          return true;
        }
      }
    } catch (e) {
      // Ignora falhas temporárias de parse
    }
    return false;
  }

  // Executa comandos remotos disparados pelo painel principal ou teclas de atalho
  public executeCommand(command: string, args?: any): void {
    switch (command) {
      case 'nextSlide':
        this.nextSlide();
        break;
      case 'prevSlide':
        this.prevSlide();
        break;
      case 'goToSlide':
        if (typeof args === 'number') this.goToSlide(args);
        break;
      case 'toggleBlackout':
        this.toggleBlackout();
        break;
      case 'setBlackout':
        this.setBlackout(Boolean(args));
        break;
      case 'toggleClearText':
        this.toggleClearText();
        break;
      case 'setClearText':
        this.setClearText(Boolean(args));
        break;
      case 'toggleShowLogo':
        this.toggleShowLogo();
        break;
      case 'setShowLogo':
        this.setShowLogo(Boolean(args));
        break;
      case 'setTheme':
        if (args) this.setTheme(args);
        break;
      case 'setFontSizeRatio':
        if (typeof args === 'number') this.setFontSizeRatio(args);
        break;
      case 'setTextAlignment':
        if (args === 'center' || args === 'left') this.setTextAlignment(args);
        break;
      case 'projectBibleVerse':
        if (args?.ref && args?.texto) {
          this.projectBibleVerse(args.ref, args.texto, args.versao);
        }
        break;
      case 'projectCustomText':
        if (args?.texto) {
          this.projectCustomText(args.titulo || 'Comunicado', args.texto, args.opcoes);
        }
        break;
      case 'projectMediaImage':
        if (args?.imagemUrl) {
          this.projectMediaImage(args.titulo || 'Mídia', args.imagemUrl, args.opcoes);
        }
        break;
      case 'sendAlert':
        if (args?.texto) {
          this.sendAlert(args.texto, args.tipo, args.subtexto, args.duracaoSegundos);
        }
        break;
      case 'clearAlert':
        this.clearAlert();
        break;
      case 'setImageFitMode':
        if (args) this.setImageFitMode(args);
        break;
      case 'setAnimatedBackground':
        if (args) this.setAnimatedBackground(args);
        break;
      case 'toggleStageDisplay':
        this.toggleStageDisplay();
        break;
      case 'toggleLowerThird':
        this.toggleLowerThird();
        break;
      default:
        break;
    }
  }

  // Despacha comando remoto para todas as instâncias e janelas filhas
  public dispatchRemoteCommand(command: string, args?: any): void {
    this.executeCommand(command, args);
    const cmdMsg = { type: 'HOLYRICS_COMMAND', command, args, timestamp: Date.now() };

    if (this.channel) {
      try {
        this.channel.postMessage(cmdMsg);
      } catch (e) {}
    }

    this.clientWindows.forEach((win) => {
      try {
        (win as Window).postMessage(cmdMsg, '*');
      } catch (e) {}
    });

    if (this.telaoWindowRef && !this.telaoWindowRef.closed) {
      try {
        this.telaoWindowRef.postMessage(cmdMsg, '*');
      } catch (e) {}
    }

    if (this.pulpitoWindowRef && !this.pulpitoWindowRef.closed) {
      try {
        this.pulpitoWindowRef.postMessage(cmdMsg, '*');
      } catch (e) {}
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.state });
      } catch (err) {
        console.error('Erro em listener do Holyrics:', err);
      }
    });
  }

  public subscribe(listener: (state: HolyricsState) => void): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): HolyricsState {
    return { ...this.state };
  }

  // Abre a janela do Telão / Projetor em modo pop-out independente
  public openTelaoWindow(): Window | null {
    if (typeof window === 'undefined') return null;

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('mode', 'telao');

    const targetUrl = currentUrl.toString();

    // Se já estiver aberta e válida, foca nela
    if (this.telaoWindowRef && !this.telaoWindowRef.closed) {
      this.telaoWindowRef.focus();
      this.broadcastState();
      return this.telaoWindowRef;
    }

    // Configurações de janela destacada sem barras para projetor / telão
    const features = 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no';
    const newWin = window.open(targetUrl, 'GippHolyricsTelao', features);

    if (newWin) {
      this.telaoWindowRef = newWin;
      this.state.ativo = true;
      this.saveAndBroadcast();
      
      // Ping inicial após carregar
      setTimeout(() => {
        this.broadcastState();
      }, 500);
    }

    return newWin;
  }

  public isTelaoWindowOpen(): boolean {
    return !!(this.telaoWindowRef && !this.telaoWindowRef.closed);
  }

  // ==========================================
  // CONTROLE DA TELA SECUNDÁRIA (PÚLPITO / STAGE DISPLAY)
  // ==========================================

  // Abre a janela da Tela Secundária (Púlpito / Retorno) em modo pop-out independente
  public openPulpitoWindow(): Window | null {
    if (typeof window === 'undefined') return null;

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('mode', 'pulpito');

    const targetUrl = currentUrl.toString();

    // Se já estiver aberta e válida, foca nela
    if (this.pulpitoWindowRef && !this.pulpitoWindowRef.closed) {
      this.pulpitoWindowRef.focus();
      this.broadcastState();
      return this.pulpitoWindowRef;
    }

    // Configurações de janela destacada sem barras para monitor de púlpito / retorno
    const features = 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no';
    const newWin = window.open(targetUrl, 'GippHolyricsPulpitoStage', features);

    if (newWin) {
      this.pulpitoWindowRef = newWin;
      this.saveAndBroadcast();
      
      setTimeout(() => {
        this.broadcastState();
      }, 500);
    }

    return newWin;
  }

  public isPulpitoWindowOpen(): boolean {
    return !!(this.pulpitoWindowRef && !this.pulpitoWindowRef.closed);
  }

  // Timer do Púlpito Centralizado
  private ensurePulpitoTimer(): void {
    if (this.state.pulpito.isRunning) {
      if (!this.pulpitoTimerInterval) {
        this.pulpitoTimerInterval = setInterval(() => {
          if (!this.state.pulpito.isRunning) {
            clearInterval(this.pulpitoTimerInterval);
            this.pulpitoTimerInterval = null;
            return;
          }

          if (this.state.pulpito.tempoRestante > 1) {
            this.state.pulpito.tempoRestante -= 1;
            this.saveAndBroadcast();
          } else {
            this.state.pulpito.tempoRestante = 0;
            this.state.pulpito.isOvertime = true;
            this.state.pulpito.tempoExcedido += 1;
            this.saveAndBroadcast();
          }
        }, 1000);
      }
    } else {
      if (this.pulpitoTimerInterval) {
        clearInterval(this.pulpitoTimerInterval);
        this.pulpitoTimerInterval = null;
      }
    }
  }

  public startPulpitoTimer(): void {
    this.state.pulpito.isRunning = true;
    this.ensurePulpitoTimer();
    this.saveAndBroadcast();
  }

  public pausePulpitoTimer(): void {
    this.state.pulpito.isRunning = false;
    this.ensurePulpitoTimer();
    this.saveAndBroadcast();
  }

  public togglePulpitoTimer(): void {
    this.state.pulpito.isRunning = !this.state.pulpito.isRunning;
    this.ensurePulpitoTimer();
    this.saveAndBroadcast();
  }

  public resetPulpitoTimer(): void {
    const blocoAtual = this.state.pulpito.blocos[this.state.pulpito.blocoAtivoIndex];
    const duracaoSegundos = blocoAtual ? blocoAtual.duracaoMinutos * 60 : 300;
    this.state.pulpito.tempoRestante = duracaoSegundos;
    this.state.pulpito.isOvertime = false;
    this.state.pulpito.tempoExcedido = 0;
    this.state.pulpito.isRunning = false;
    this.ensurePulpitoTimer();
    this.saveAndBroadcast();
  }

  public addPulpitoMinutes(minutes: number): void {
    const segundos = minutes * 60;
    if (this.state.pulpito.isOvertime) {
      if (this.state.pulpito.tempoExcedido > segundos) {
        this.state.pulpito.tempoExcedido -= segundos;
      } else {
        const sobra = segundos - this.state.pulpito.tempoExcedido;
        this.state.pulpito.isOvertime = false;
        this.state.pulpito.tempoExcedido = 0;
        this.state.pulpito.tempoRestante = sobra;
      }
    } else {
      this.state.pulpito.tempoRestante += segundos;
    }
    this.saveAndBroadcast();
  }

  public selectPulpitoBloco(index: number): void {
    if (index < 0 || index >= this.state.pulpito.blocos.length) return;
    this.state.pulpito.blocoAtivoIndex = index;
    const bloco = this.state.pulpito.blocos[index];
    this.state.pulpito.tempoRestante = bloco ? bloco.duracaoMinutos * 60 : 300;
    this.state.pulpito.isOvertime = false;
    this.state.pulpito.tempoExcedido = 0;
    this.state.pulpito.isRunning = false;

    // Se o bloco tiver leitura bíblica associada, atualiza o texto sagrado
    if (bloco.leituraBiblica) {
      this.state.pulpito.textoBiblicoDestaque = bloco.leituraBiblica;
    }

    this.ensurePulpitoTimer();
    this.saveAndBroadcast();
  }

  public concluirPulpitoBloco(): void {
    const currentIndex = this.state.pulpito.blocoAtivoIndex;
    if (this.state.pulpito.blocos[currentIndex]) {
      this.state.pulpito.blocos[currentIndex].concluido = true;
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex < this.state.pulpito.blocos.length) {
      this.selectPulpitoBloco(nextIndex);
    } else {
      this.state.pulpito.isRunning = false;
      this.ensurePulpitoTimer();
      this.saveAndBroadcast();
    }
  }

  // Avisos para o Púlpito (ex: sonoplastia, secretaria, estacionamento)
  public sendPulpitoAviso(
    texto: string,
    tipo: 'urgente' | 'visitante' | 'oracao' | 'geral' = 'geral',
    autor = 'Sonoplastia / Holyrics'
  ): void {
    if (!texto.trim()) return;
    const now = new Date();
    const horario = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const novoAviso: AvisoPulpito = {
      id: `aviso_pulpito_${Date.now()}`,
      texto: texto.trim(),
      tipo,
      autor,
      horario,
      lido: false
    };

    this.state.pulpito.avisos = [novoAviso, ...this.state.pulpito.avisos];
    this.saveAndBroadcast();
  }

  public markPulpitoAvisoLido(id: string): void {
    this.state.pulpito.avisos = this.state.pulpito.avisos.map((av) =>
      av.id === id ? { ...av, lido: true } : av
    );
    this.saveAndBroadcast();
  }

  public deletePulpitoAviso(id: string): void {
    this.state.pulpito.avisos = this.state.pulpito.avisos.filter((av) => av.id !== id);
    this.saveAndBroadcast();
  }

  public clearPulpitoAvisos(): void {
    this.state.pulpito.avisos = [];
    this.saveAndBroadcast();
  }

  public clearPulpitoAviso(): void {
    this.clearPulpitoAvisos();
  }

  public setPulpitoBibliaFonte(tamanho: 'normal' | 'grande' | 'extragrande'): void {
    this.state.pulpito.tamanhoFonteBiblia = tamanho;
    this.saveAndBroadcast();
  }

  public setPulpitoTheme(theme: 'dark' | 'light'): void {
    this.state.pulpito.stageTheme = theme;
    this.saveAndBroadcast();
  }

  public setPulpitoCultoInfo(info: { titulo?: string; dirigente?: string; pregador?: string }): void {
    if (info.titulo !== undefined) this.state.pulpito.cultoTitulo = info.titulo;
    if (info.dirigente !== undefined) this.state.pulpito.dirigenteNome = info.dirigente;
    if (info.pregador !== undefined) this.state.pulpito.pregadorNome = info.pregador;
    this.saveAndBroadcast();
  }

  public syncVerseToPulpito(referencia: string, texto: string): void {
    this.state.pulpito.textoBiblicoDestaque = `${referencia} — “${texto}”`;
    this.saveAndBroadcast();
  }

  public updatePulpito(updater: (prev: PulpitoState) => Partial<PulpitoState>): void {
    const updates = updater(this.state.pulpito);
    this.state.pulpito = {
      ...this.state.pulpito,
      ...updates
    };
    this.saveAndBroadcast();
  }

  // Controles de Slides
  public nextSlide(): void {
    if (this.state.slides.length === 0) return;
    const nextIdx = Math.min(this.state.indiceAtual + 1, this.state.slides.length - 1);
    if (nextIdx !== this.state.indiceAtual || this.state.blackout || this.state.limparTexto) {
      this.state.indiceAtual = nextIdx;
      this.state.blackout = false;
      this.state.limparTexto = false;
      this.saveAndBroadcast();
    }
  }

  public prevSlide(): void {
    if (this.state.slides.length === 0) return;
    const prevIdx = Math.max(this.state.indiceAtual - 1, 0);
    if (prevIdx !== this.state.indiceAtual || this.state.blackout || this.state.limparTexto) {
      this.state.indiceAtual = prevIdx;
      this.state.blackout = false;
      this.state.limparTexto = false;
      this.saveAndBroadcast();
    }
  }

  public goToSlide(index: number): void {
    if (index >= 0 && index < this.state.slides.length) {
      this.state.indiceAtual = index;
      this.state.blackout = false;
      this.state.limparTexto = false;
      this.saveAndBroadcast();
    }
  }

  // Toggle de Blackout (Tela Preta)
  public toggleBlackout(): void {
    this.state.blackout = !this.state.blackout;
    this.saveAndBroadcast();
  }

  public setBlackout(val: boolean): void {
    this.state.blackout = val;
    this.saveAndBroadcast();
  }

  // Toggle e Set de Limpar Texto (Clear)
  public toggleClearText(): void {
    this.state.limparTexto = !this.state.limparTexto;
    this.saveAndBroadcast();
  }

  public setClearText(val: boolean): void {
    this.state.limparTexto = val;
    this.saveAndBroadcast();
  }

  // Toggle e Set de Logo da Igreja no Telão
  public toggleShowLogo(churchData?: Partial<ChurchDisplayInfo>): void {
    const dbChurch = this.getChurchFromDbCache();
    if (churchData) {
      this.updateIgrejaInfo(
        churchData.nome || dbChurch?.nome || this.state.igrejaNome,
        churchData.logoUrl || dbChurch?.logoUrl || this.state.igrejaLogoUrl,
        { ...dbChurch, ...churchData }
      );
    } else if (dbChurch) {
      this.updateIgrejaInfo(dbChurch.nome, dbChurch.logoUrl, dbChurch);
    }
    this.state.exibirLogo = !this.state.exibirLogo;
    this.saveAndBroadcast();
  }

  public setShowLogo(val: boolean, churchData?: Partial<ChurchDisplayInfo>): void {
    const dbChurch = this.getChurchFromDbCache();
    if (churchData) {
      this.updateIgrejaInfo(
        churchData.nome || dbChurch?.nome || this.state.igrejaNome,
        churchData.logoUrl || dbChurch?.logoUrl || this.state.igrejaLogoUrl,
        { ...dbChurch, ...churchData }
      );
    } else if (dbChurch) {
      this.updateIgrejaInfo(dbChurch.nome, dbChurch.logoUrl, dbChurch);
    }
    this.state.exibirLogo = val;
    this.saveAndBroadcast();
  }

  // Toggle Retorno de Palco (Stage Display)
  public toggleStageDisplay(): void {
    this.state.modoRetornoPalco = !this.state.modoRetornoPalco;
    this.saveAndBroadcast();
  }

  public setModoRetornoPalco(val: boolean): void {
    this.state.modoRetornoPalco = val;
    this.saveAndBroadcast();
  }

  // Toggle Lower Third (OBS / Live Stream)
  public toggleLowerThird(): void {
    this.state.modoLowerThird = !this.state.modoLowerThird;
    this.saveAndBroadcast();
  }

  // Configuração Visual
  public setTheme(theme: HolyricsTheme): void {
    this.state.tema = theme;
    this.saveAndBroadcast();
  }

  public setFontSizeRatio(ratio: number): void {
    this.state.tamanhoFonteRatio = Math.max(0.6, Math.min(2.0, ratio));
    this.saveAndBroadcast();
  }

  public setTextAlignment(align: 'center' | 'left'): void {
    this.state.alinhamentoTexto = align;
    this.saveAndBroadcast();
  }

  public setCustomBackground(url?: string): void {
    if (url) {
      this.state.fundoCustomUrl = url;
      this.state.fundoTipo = 'imagem';
    } else {
      this.state.fundoCustomUrl = undefined;
      this.state.fundoTipo = 'gradiente';
    }
    this.saveAndBroadcast();
  }

  // Configurar Fundo Animado (Holyrics Motion Backgrounds)
  public setAnimatedBackground(bg: HolyricsAnimatedBg): void {
    this.state.fundoAnimado = bg;
    if (bg && bg !== 'none') {
      this.state.fundoTipo = 'animado';
    } else {
      this.state.fundoTipo = this.state.fundoCustomUrl ? 'imagem' : 'gradiente';
    }
    this.saveAndBroadcast();
  }

  // Carregar Apresentação Completa
  public loadPresentation(
    titulo: string, 
    slides: HolyricsSlide[], 
    categoria: HolyricsState['categoria'] = 'slides',
    autoJumpFirst = true
  ): void {
    this.state.tituloApresentacao = titulo;
    this.state.categoria = categoria;
    this.state.slides = slides;
    if (autoJumpFirst) {
      this.state.indiceAtual = 0;
    }
    this.state.blackout = false;
    this.state.limparTexto = false;
    this.state.exibirLogo = false;
    this.state.ativo = true;
    this.saveAndBroadcast();
  }

  // Projetar Versículo Bíblico Instantâneo
  public projectBibleVerse(
    referencia: string, 
    texto: string, 
    versao = 'Almeida Corrigida Fiel (ACF)'
  ): void {
    const slideVersiculo: HolyricsSlide = {
      id: `biblia-${Date.now()}`,
      tipo: 'versiculo',
      titulo: referencia,
      subtitulo: versao,
      versiculo: { texto, referencia },
      notas: `Leitura Bíblica: ${referencia}`
    };

    this.state.tituloApresentacao = `Bíblia: ${referencia}`;
    this.state.categoria = 'biblia';
    this.state.slides = [slideVersiculo];
    this.state.indiceAtual = 0;
    this.state.blackout = false;
    this.state.limparTexto = false;
    this.state.exibirLogo = false;
    this.state.ativo = true;
    this.saveAndBroadcast();
  }

  public projectVersicle(referencia: string, texto: string, versao?: string): void {
    this.projectBibleVerse(referencia, texto, versao);
  }

  // Projetar Texto Livre com Formatação Personalizada
  public projectCustomText(
    titulo: string,
    texto: string,
    opcoes?: {
      subtitulo?: string;
      fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
      align?: 'left' | 'center' | 'right';
      bold?: boolean;
      italic?: boolean;
      uppercase?: boolean;
      colorTheme?: 'gold' | 'white' | 'cyan' | 'emerald' | 'amber' | 'rose';
    }
  ): void {
    const slideTexto: HolyricsSlide = {
      id: `texto-livre-${Date.now()}`,
      tipo: 'texto_livre',
      titulo: titulo.trim() || 'Aviso da Igreja',
      subtitulo: opcoes?.subtitulo,
      texto: texto.trim(),
      estiloTexto: {
        fontSize: opcoes?.fontSize || '2xl',
        align: opcoes?.align || 'center',
        bold: opcoes?.bold !== undefined ? opcoes.bold : true,
        italic: Boolean(opcoes?.italic),
        uppercase: Boolean(opcoes?.uppercase),
        colorTheme: opcoes?.colorTheme || 'gold'
      },
      notas: `Texto Livre: ${titulo}`
    };

    this.state.tituloApresentacao = titulo || 'Texto Livre';
    this.state.categoria = 'custom';
    this.state.slides = [slideTexto];
    this.state.indiceAtual = 0;
    this.state.blackout = false;
    this.state.limparTexto = false;
    this.state.exibirLogo = false;
    this.state.ativo = true;
    this.saveAndBroadcast();
  }

  // Projetar Imagem de Mídia (Cartaz de Conferência, Congresso, Santa Ceia, Anúncio)
  public projectMediaImage(
    titulo: string,
    imagemUrl: string,
    opcoes?: {
      subtitulo?: string;
      ajuste?: ImageFitMode;
      ocultarLegenda?: boolean;
    }
  ): void {
    const shouldHideCaption = opcoes?.ocultarLegenda !== undefined ? opcoes.ocultarLegenda : true;
    const slideMidia: HolyricsSlide = {
      id: `midia-img-${Date.now()}`,
      tipo: 'midia_imagem',
      titulo: titulo.trim() || 'Projeção de Imagem',
      subtitulo: shouldHideCaption ? undefined : opcoes?.subtitulo,
      imagemUrl: imagemUrl,
      ajusteImagem: opcoes?.ajuste || 'contain',
      ocultarLegenda: shouldHideCaption,
      notas: `Imagem: ${titulo}`
    };

    this.state.tituloApresentacao = `Mídia: ${titulo}`;
    this.state.categoria = 'slides';
    this.state.slides = [slideMidia];
    this.state.indiceAtual = 0;
    this.state.blackout = false;
    this.state.limparTexto = false;
    this.state.exibirLogo = false;
    this.state.ativo = true;
    this.state.enquadramentoImagem = slideMidia.ajusteImagem;
    this.saveAndBroadcast();
  }

  // Ajustar enquadramento da imagem no telão em tempo real ('contain' | 'cover' | 'fill')
  public setImageFitMode(fit: ImageFitMode): void {
    this.state.enquadramentoImagem = fit;
    const currentSlide = this.state.slides[this.state.indiceAtual];
    if (currentSlide && (currentSlide.tipo === 'midia_imagem' || currentSlide.imagemUrl)) {
      currentSlide.ajusteImagem = fit;
    }
    this.saveAndBroadcast();
  }

  // Anexar Mídia ou Versículo a um Bloco Litúrgico específico
  public attachMediaToPulpitoBloco(blocoIndex: number, imagemUrl: string, midiaTitulo: string): void {
    if (this.state.pulpito.blocos[blocoIndex]) {
      this.state.pulpito.blocos[blocoIndex].imagemUrl = imagemUrl;
      this.state.pulpito.blocos[blocoIndex].midiaTitulo = midiaTitulo;
      this.saveAndBroadcast();
    }
  }

  public attachVerseToPulpitoBloco(blocoIndex: number, referencia: string, texto: string): void {
    if (this.state.pulpito.blocos[blocoIndex]) {
      this.state.pulpito.blocos[blocoIndex].leituraBiblica = `${referencia} — “${texto}”`;
      if (this.state.pulpito.blocoAtivoIndex === blocoIndex) {
        this.state.pulpito.textoBiblicoDestaque = `${referencia} — “${texto}”`;
      }
      this.saveAndBroadcast();
    }
  }

  public attachTextToPulpitoBloco(blocoIndex: number, texto: string): void {
    if (this.state.pulpito.blocos[blocoIndex]) {
      this.state.pulpito.blocos[blocoIndex].textoProjecao = texto;
      this.saveAndBroadcast();
    }
  }

  // Projetar Letra de Música / Hino Instantâneo
  public projectSong(
    titulo: string, 
    artista: string, 
    estrofes: string[]
  ): void {
    const slides: HolyricsSlide[] = estrofes.map((est, idx) => {
      const isRefrao = est.toLowerCase().includes('[refrão]') || est.toLowerCase().includes('coro');
      const cleanText = est.replace(/\[REFRÃO\]|\[CORO\]/gi, '').trim();

      return {
        id: `song-slide-${idx + 1}`,
        tipo: isRefrao ? 'refrao' : 'letra',
        titulo,
        subtitulo: isRefrao ? 'Coro / Refrão' : `${artista} • Estrofe ${idx + 1}`,
        texto: cleanText,
        corDestaque: isRefrao ? '#eab308' : undefined
      };
    });

    this.loadPresentation(`${titulo} — ${artista}`, slides, 'louvor', true);
  }

  // Enviar Alerta Rápido no Telão (Placa de Carro, Berçário, etc.)
  public sendAlert(
    texto: string, 
    tipo: HolyricsAlert['tipo'] = 'aviso', 
    subtexto?: string, 
    duracaoSegundos = 25
  ): void {
    const alertItem: HolyricsAlert = {
      id: `alert-${Date.now()}`,
      tipo,
      texto,
      subtexto,
      timestamp: Date.now(),
      expiraEmMs: duracaoSegundos * 1000,
      ativo: true
    };

    this.state.alertaAtivo = alertItem;
    this.saveAndBroadcast();

    // Auto dismiss após tempo
    if (duracaoSegundos > 0) {
      setTimeout(() => {
        if (this.state.alertaAtivo && this.state.alertaAtivo.id === alertItem.id) {
          this.clearAlert();
        }
      }, duracaoSegundos * 1000);
    }
  }

  public clearAlert(): void {
    this.state.alertaAtivo = null;
    this.saveAndBroadcast();
  }

  // Cronômetro / Regressivo
  public startTimer(duracaoMinutos: number, rotulo = 'Contagem Regressiva'): void {
    this.stopTimer();
    const totalSegundos = Math.max(1, duracaoMinutos * 60);

    this.state.cronometro = {
      ativo: true,
      modo: 'countdown',
      tempoTotalSegundos: totalSegundos,
      tempoRestanteSegundos: totalSegundos,
      rotulo
    };
    this.saveAndBroadcast();

    this.timerInterval = setInterval(() => {
      if (this.state.cronometro.tempoRestanteSegundos <= 1) {
        this.state.cronometro.tempoRestanteSegundos = 0;
        this.state.cronometro.ativo = false;
        this.stopTimer();
        this.saveAndBroadcast();
      } else {
        this.state.cronometro.tempoRestanteSegundos -= 1;
        this.saveAndBroadcast();
      }
    }, 1000);
  }

  public stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.state.cronometro.ativo = false;
    this.saveAndBroadcast();
  }

  public updateIgrejaInfo(nome: string, logoUrl?: string, additionalInfo?: Partial<ChurchDisplayInfo>): void {
    this.state.igrejaNome = nome || this.state.igrejaNome || 'ASSEMBLEIA DE DEUS';
    if (logoUrl !== undefined) this.state.igrejaLogoUrl = logoUrl;
    this.state.igrejaInfo = {
      nome: this.state.igrejaNome,
      logoUrl: this.state.igrejaLogoUrl,
      pastor: additionalInfo?.pastor ?? this.state.igrejaInfo?.pastor ?? '',
      cidade: additionalInfo?.cidade ?? this.state.igrejaInfo?.cidade ?? '',
      uf: additionalInfo?.uf ?? this.state.igrejaInfo?.uf ?? '',
      endereco: additionalInfo?.endereco ?? this.state.igrejaInfo?.endereco ?? '',
      telefone: additionalInfo?.telefone ?? this.state.igrejaInfo?.telefone ?? '',
      email: additionalInfo?.email ?? this.state.igrejaInfo?.email ?? '',
      site: additionalInfo?.site ?? this.state.igrejaInfo?.site ?? '',
      cnpj: additionalInfo?.cnpj ?? this.state.igrejaInfo?.cnpj ?? '',
      chave_pix: additionalInfo?.chave_pix ?? this.state.igrejaInfo?.chave_pix ?? '',
      subtitulo: additionalInfo?.subtitulo ?? this.state.igrejaInfo?.subtitulo ?? 'Comunhão • Palavra • Louvor • Adoração'
    };
    this.saveAndBroadcast();
  }

  public setAtivo(ativo: boolean): void {
    this.state.ativo = ativo;
    this.saveAndBroadcast();
  }

  public toggleAtivo(ativo?: boolean): void {
    this.state.ativo = ativo !== undefined ? ativo : !this.state.ativo;
    this.saveAndBroadcast();
  }

  public closeProjection(): void {
    this.state.ativo = false;
    this.saveAndBroadcast();
  }
}

export const holyricsService = new HolyricsService();
