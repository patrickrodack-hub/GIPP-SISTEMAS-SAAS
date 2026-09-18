/**
 * holyricsService.ts
 * Motor de Transmissão e Projeção Multitelas para Telão / Projetor (Estilo Holyrics)
 * 
 * Permite transmissão independente em tela secundária / janela destacada
 * enquanto a operação no sistema continua ativa sem interrupções.
 */

export interface HolyricsSlide {
  id: string;
  tipo: 'capa' | 'versiculo' | 'letra' | 'refrao' | 'topico' | 'doutrina' | 'aplicacao' | 'quiz' | 'conclusao' | 'aviso';
  titulo: string;
  subtitulo?: string;
  texto?: string;
  versiculo?: { texto: string; referencia: string };
  pontos?: string[];
  notas?: string;
  imagemFundo?: string;
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

export type HolyricsTheme = 'navy' | 'dark' | 'amber' | 'clean' | 'royal' | 'cinema';

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
  fundoCustomUrl?: string;
  tamanhoFonteRatio: number; // 0.8 a 1.6
  alinhamentoTexto: 'center' | 'left';
  alertaAtivo: HolyricsAlert | null;
  cronometro: HolyricsTimer;
  igrejaNome: string;
  igrejaLogoUrl?: string;
  ultimaAtualizacao: number;
}

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
  private timerInterval: any = null;

  constructor() {
    this.state = this.loadInitialState();

    // Inicializa canal de sincronização entre janelas/abas
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type === 'STATE_UPDATE') {
            this.state = event.data.payload;
            this.notifyListeners();
          } else if (event.data && event.data.type === 'PING') {
            this.broadcastState();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel não suportado neste contexto:', e);
      }
    }

    // Fallback para escutar eventos de storage
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.state = parsed;
            this.notifyListeners();
          } catch (err) {
            console.error('Erro ao processar storage event:', err);
          }
        }
      });
    }
  }

  private loadInitialState(): HolyricsState {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.slides)) {
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
      igrejaNome: 'ASSEMBLEIA DE DEUS',
      ultimaAtualizacao: Date.now()
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
    if (this.channel) {
      try {
        this.channel.postMessage({
          type: 'STATE_UPDATE',
          payload: this.state
        });
      } catch (e) {
        console.warn('Erro no broadcast channel:', e);
      }
    }

    // Se temos a referência da janela filha, podemos enviar postMessage direto
    if (this.telaoWindowRef && !this.telaoWindowRef.closed) {
      try {
        this.telaoWindowRef.postMessage({
          type: 'HOLYRICS_STATE_SYNC',
          payload: this.state
        }, '*');
      } catch (e) {
        // Ignora erro cross-origin se houver
      }
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

  // Controles de Slides
  public nextSlide(): void {
    if (this.state.slides.length === 0) return;
    const nextIdx = Math.min(this.state.indiceAtual + 1, this.state.slides.length - 1);
    if (nextIdx !== this.state.indiceAtual) {
      this.state.indiceAtual = nextIdx;
      this.state.blackout = false;
      this.state.limparTexto = false;
      this.saveAndBroadcast();
    }
  }

  public prevSlide(): void {
    if (this.state.slides.length === 0) return;
    const prevIdx = Math.max(this.state.indiceAtual - 1, 0);
    if (prevIdx !== this.state.indiceAtual) {
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

  // Toggle de Limpar Texto (Clear)
  public toggleClearText(): void {
    this.state.limparTexto = !this.state.limparTexto;
    this.saveAndBroadcast();
  }

  // Toggle de Logo da Igreja no Telão
  public toggleShowLogo(): void {
    this.state.exibirLogo = !this.state.exibirLogo;
    this.saveAndBroadcast();
  }

  // Toggle Retorno de Palco (Stage Display)
  public toggleStageDisplay(): void {
    this.state.modoRetornoPalco = !this.state.modoRetornoPalco;
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

  public updateIgrejaInfo(nome: string, logoUrl?: string): void {
    this.state.igrejaNome = nome || 'ASSEMBLEIA DE DEUS';
    if (logoUrl) this.state.igrejaLogoUrl = logoUrl;
    this.saveAndBroadcast();
  }
}

export const holyricsService = new HolyricsService();
