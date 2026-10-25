import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Trophy, Heart, Users,
  Zap, Shield, Sparkles, Maximize2, Minimize2, Smartphone, ArrowLeft,
  ArrowRight, ArrowDown, ArrowUp, Flame, Crown, CheckCircle2
} from 'lucide-react';

interface SonicCristaoGameProps {
  onGameOver: (score: number) => void;
  highScore: number;
}

// ============================================================================
// SINTETIZADOR DE ÁUDIO 16-BIT (ESTILO MEGA DRIVE / SONIC 2)
// ============================================================================
class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private getCtx(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playJump() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.16);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playRescueSoul() {
    // Timbre cristalino inspirado no som de anel do Sonic 2
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [987.77, 1318.51]; // B5 -> E6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.055);
      gain.gain.setValueAtTime(0.16, now + idx * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.19);
    });
  }

  playSpinDashCharge(chargeLevel: number) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const baseFreq = 220 + chargeLevel * 65;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.12);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  playSpinDashRelease() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  playSpring() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  playBossHit() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.setValueAtTime(95, now + 0.06);
    osc.frequency.setValueAtTime(210, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playHurt() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.35);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  playVictory() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.11);
      gain.gain.setValueAtTime(0.16, now + i * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.11);
      osc.stop(now + i * 0.11 + 0.23);
    });
  }
}

const soundFX = new RetroSoundEngine();

// ============================================================================
// DEFINIÇÃO DAS 3 ZONAS INSPIRADAS EM SONIC 2
// ============================================================================
interface ZoneConfig {
  id: number;
  name: string;
  subtitle: string;
  verse: string;
  skyTop: string;
  skyBottom: string;
  hillColor1: string;
  hillColor2: string;
  groundTop: string;
  groundCheck1: string;
  groundCheck2: string;
  bossName: string;
  bossTitle: string;
  bossMaxHp: number;
  bossColor: string;
  bossSecondary: string;
  length: number;
}

const ZONES: ZoneConfig[] = [
  {
    id: 1,
    name: 'VALE DA GALILEIA',
    subtitle: 'Inspirado em Emerald Hill Zone · Ato 1',
    verse: '“O Filho do Homem veio buscar e salvar o que se havia perdido.” (Lucas 19:10)',
    skyTop: '#1e3a8a',
    skyBottom: '#38bdf8',
    hillColor1: '#15803d',
    hillColor2: '#166534',
    groundTop: '#22c55e',
    groundCheck1: '#92400e',
    groundCheck2: '#b45309',
    bossName: 'LEGIÃO DA SOMBRA',
    bossTitle: 'Príncipe do Engano',
    bossMaxHp: 6,
    bossColor: '#dc2626',
    bossSecondary: '#7f1d1d',
    length: 6400
  },
  {
    id: 2,
    name: 'FORTALEZA DA BABILÔNIA',
    subtitle: 'Inspirado em Chemical Plant / Metropolis · Ato 2',
    verse: '“Revesti-vos de toda a armadura de Deus, para que possais estar firmes.” (Efésios 6:11)',
    skyTop: '#0f172a',
    skyBottom: '#4c1d95',
    hillColor1: '#312e81',
    hillColor2: '#1e1b4b',
    groundTop: '#f59e0b',
    groundCheck1: '#334155',
    groundCheck2: '#1e293b',
    bossName: 'BAAL-BERITE',
    bossTitle: 'Senhor da Soberba e Fornalha',
    bossMaxHp: 8,
    bossColor: '#9333ea',
    bossSecondary: '#581c87',
    length: 7200
  },
  {
    id: 3,
    name: 'MONTE DA VITÓRIA',
    subtitle: 'Inspirado em Sky Sanctuary Zone · Ato Final',
    verse: '“Para isto o Filho de Deus se manifestou: para desfazer as obras do diabo.” (1 João 3:8)',
    skyTop: '#450a0a',
    skyBottom: '#ea580c',
    hillColor1: '#7c2d12',
    hillColor2: '#9a3412',
    groundTop: '#fbbf24',
    groundCheck1: '#78350f',
    groundCheck2: '#451a03',
    bossName: 'ABADDON DO ABISMO',
    bossTitle: 'Destruidor das Trevas',
    bossMaxHp: 10,
    bossColor: '#e11d48',
    bossSecondary: '#881337',
    length: 7800
  }
];

// ============================================================================
// TIPOS DE ENTIDADES DO JOGO
// ============================================================================
interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'ground' | 'floating' | 'loop_ramp' | 'bridge';
}

interface SoulPerson {
  id: number;
  x: number;
  y: number;
  baseY: number;
  rescued: boolean;
  scattered?: boolean;
  vx?: number;
  vy?: number;
  shirtColor: string;
  label: string;
}

interface SpringPad {
  x: number;
  y: number;
  power: number;
  compressed: number;
}

interface SpeedPad {
  x: number;
  y: number;
  w: number;
}

interface BlessingBox {
  id: number;
  x: number;
  y: number;
  type: 'shield' | 'souls10' | 'speed' | 'life';
  broken: boolean;
}

interface ShadowMinion {
  id: number;
  x: number;
  y: number;
  minX: number;
  maxX: number;
  vx: number;
  alive: boolean;
}

interface CheckpointPost {
  x: number;
  y: number;
  activated: boolean;
}

interface DemonProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  text?: string;
}

export default function SonicCristaoGame({ onGameOver, highScore }: SonicCristaoGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'zone_clear' | 'gameover' | 'victory'>('menu');
  const [currentZoneIdx, setCurrentZoneIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [rescuedSouls, setRescuedSouls] = useState(0);
  const [totalRescuedAllZones, setTotalRescuedAllZones] = useState(0);
  const [lives, setLives] = useState(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [isLandscapeFullscreen, setIsLandscapeFullscreen] = useState(false);
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [bossActiveUI, setBossActiveUI] = useState(false);
  const [bossHpUI, setBossHpUI] = useState({ current: 6, max: 6, name: '' });

  // Detectar se o dispositivo está na vertical para exibir modo horizontal forçado ou aviso
  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 900;
      setIsPortraitMobile(portrait);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const toggleAudio = () => {
    soundFX.muted = !muted;
    setMuted(!muted);
  };

  const enterHorizontalFullscreen = async () => {
    try {
      if (containerRef.current && containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
      const scr = window.screen as Screen & { orientation?: { lock?: (o: string) => Promise<void> } };
      if (scr.orientation && scr.orientation.lock) {
        await scr.orientation.lock('landscape').catch(() => {});
      }
      setIsLandscapeFullscreen(true);
    } catch {
      setIsLandscapeFullscreen(!isLandscapeFullscreen);
    }
  };

  // ============================================================================
  // ESTADO MUTÁVEL DO MOTOR DE JOGO (60 FPS)
  // ============================================================================
  const keysRef = useRef<{ left: boolean; right: boolean; up: boolean; down: boolean; jump: boolean; dash: boolean }>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    dash: false
  });

  const engineRef = useRef<{
    player: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      w: number;
      h: number;
      grounded: boolean;
      facing: 1 | -1;
      spinning: boolean;
      crouching: boolean;
      spinDashCharge: number;
      invulnerableTimer: number;
      shield: boolean;
      speedBoostTimer: number;
      animFrame: number;
      checkpointX: number;
      checkpointY: number;
    };
    cameraX: number;
    soulsCount: number;
    totalSoulsCount: number;
    scoreCount: number;
    livesCount: number;
    timeFrames: number;
    titleCardTimer: number;
    platforms: Platform[];
    souls: SoulPerson[];
    springs: SpringPad[];
    speedPads: SpeedPad[];
    boxes: BlessingBox[];
    minions: ShadowMinion[];
    checkpoints: CheckpointPost[];
    particles: Particle[];
    boss: {
      active: boolean;
      defeated: boolean;
      x: number;
      y: number;
      vx: number;
      vy: number;
      hp: number;
      maxHp: number;
      hitFlash: number;
      attackTimer: number;
      phase: number;
      projectiles: DemonProjectile[];
    };
  }>({
    player: {
      x: 160,
      y: 420,
      vx: 0,
      vy: 0,
      w: 42,
      h: 56,
      grounded: false,
      facing: 1,
      spinning: false,
      crouching: false,
      spinDashCharge: 0,
      invulnerableTimer: 0,
      shield: false,
      speedBoostTimer: 0,
      animFrame: 0,
      checkpointX: 160,
      checkpointY: 420
    },
    cameraX: 0,
    soulsCount: 0,
    totalSoulsCount: 0,
    scoreCount: 0,
    livesCount: 3,
    timeFrames: 0,
    titleCardTimer: 150,
    platforms: [],
    souls: [],
    springs: [],
    speedPads: [],
    boxes: [],
    minions: [],
    checkpoints: [],
    particles: [],
    boss: {
      active: false,
      defeated: false,
      x: 6000,
      y: 260,
      vx: 3,
      vy: 0,
      hp: 6,
      maxHp: 6,
      hitFlash: 0,
      attackTimer: 0,
      phase: 1,
      projectiles: []
    }
  });

  // ============================================================================
  // GERADOR PROCEDURAL DE FASES NO ESTILO SONIC 2 (MULTI-CAMADAS, LOOPS, MOLAS)
  // ============================================================================
  const buildZoneLevel = useCallback((zoneIndex: number, resetScoreAndLives: boolean) => {
    const zone = ZONES[zoneIndex];
    const st = engineRef.current;

    if (resetScoreAndLives) {
      st.scoreCount = 0;
      st.livesCount = 3;
      st.totalSoulsCount = 0;
      setScore(0);
      setLives(3);
      setTotalRescuedAllZones(0);
    }

    st.soulsCount = 0;
    setRescuedSouls(0);
    st.timeFrames = 0;
    setElapsedSeconds(0);
    st.titleCardTimer = 140;
    st.cameraX = 0;
    st.particles = [];

    st.player = {
      x: 160,
      y: 420,
      vx: 0,
      vy: 0,
      w: 42,
      h: 56,
      grounded: false,
      facing: 1,
      spinning: false,
      crouching: false,
      spinDashCharge: 0,
      invulnerableTimer: 0,
      shield: st.player.shield,
      speedBoostTimer: 0,
      animFrame: 0,
      checkpointX: 160,
      checkpointY: 420
    };

    const platforms: Platform[] = [];
    const souls: SoulPerson[] = [];
    const springs: SpringPad[] = [];
    const speedPads: SpeedPad[] = [];
    const boxes: BlessingBox[] = [];
    const minions: ShadowMinion[] = [];
    const checkpoints: CheckpointPost[] = [];

    const shirtPalette = ['#38bdf8', '#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#fb7185'];
    const soulLabels = ['Jovem', 'Família', 'Obreiro', 'Criança', 'Viajante', 'Pescador'];
    let soulId = 1;
    let boxId = 1;
    let minionId = 1;

    // Construção de segmentos da fase até a arena do chefe
    let cursorX = 0;
    const bossArenaStart = zone.length - 1150;

    // Plataforma inicial segura
    platforms.push({ x: 0, y: 540, w: 950, h: 220, type: 'ground' });
    speedPads.push({ x: 520, y: 532, w: 90 });

    // Fileira inicial de pessoas para resgatar (como as argolas iniciais de Emerald Hill)
    for (let i = 0; i < 6; i++) {
      souls.push({
        id: soulId++,
        x: 300 + i * 65,
        y: 485,
        baseY: 485,
        rescued: false,
        shirtColor: shirtPalette[i % shirtPalette.length],
        label: soulLabels[i % soulLabels.length]
      });
    }

    cursorX = 950;
    let segIdx = 0;

    while (cursorX < bossArenaStart) {
      const segW = 680 + (segIdx % 3) * 160;
      const gap = segIdx % 4 === 2 ? 130 : 0; // Fosso ocasional com ponte ou mola
      cursorX += gap;

      const groundY = 540 - ((segIdx % 3 === 1) ? 40 : 0);
      platforms.push({ x: cursorX, y: groundY, w: segW, h: 260, type: 'ground' });

      // Rota Superior e Rota Intermediária (Design clássico Sonic 2)
      const midY = groundY - 135;
      const highY = groundY - 265;

      platforms.push({
        x: cursorX + 90,
        y: midY,
        w: 260,
        h: 26,
        type: 'floating'
      });

      if (segIdx % 2 === 0) {
        platforms.push({
          x: cursorX + 260,
          y: highY,
          w: 310,
          h: 26,
          type: 'floating'
        });

        // Arco de pessoas no topo (recompensa por explorar rota alta)
        for (let k = 0; k < 5; k++) {
          const arcOffset = Math.sin((k / 4) * Math.PI) * 45;
          souls.push({
            id: soulId++,
            x: cursorX + 295 + k * 52,
            y: highY - 52 - arcOffset,
            baseY: highY - 52 - arcOffset,
            rescued: false,
            shirtColor: shirtPalette[(soulId + k) % shirtPalette.length],
            label: soulLabels[(soulId + k) % soulLabels.length]
          });
        }
      }

      // Pessoas na rota principal
      for (let k = 0; k < 4; k++) {
        souls.push({
          id: soulId++,
          x: cursorX + 120 + k * 68,
          y: groundY - 52,
          baseY: groundY - 52,
          rescued: false,
          shirtColor: shirtPalette[(soulId + k) % shirtPalette.length],
          label: soulLabels[(soulId + k) % soulLabels.length]
        });
      }

      // Mola estilo Sonic (vermelha/amarela) para impulsionar à rota superior
      springs.push({
        x: cursorX + 55,
        y: groundY - 24,
        power: -18.5,
        compressed: 0
      });

      // Tapete de velocidade (Boost Pad)
      if (segIdx % 2 === 1) {
        speedPads.push({
          x: cursorX + segW - 220,
          y: groundY - 8,
          w: 95
        });
      }

      // Monitor de Bênção (Escudo da Fé, +10 Almas, Velocidade Celestial)
      const boxTypes: Array<'shield' | 'souls10' | 'speed' | 'life'> = ['shield', 'souls10', 'speed', 'life'];
      boxes.push({
        id: boxId++,
        x: cursorX + 195,
        y: midY - 44,
        type: boxTypes[segIdx % boxTypes.length],
        broken: false
      });

      // Inimigo menor de patrulha (Sombra da Dúvida)
      minions.push({
        id: minionId++,
        x: cursorX + 360,
        y: groundY - 40,
        minX: cursorX + 220,
        maxX: cursorX + segW - 80,
        vx: 2.2 + zoneIndex * 0.4,
        alive: true
      });

      // Poste de Checkpoint a cada 2 segmentos
      if (segIdx === 2 || segIdx === 4) {
        checkpoints.push({
          x: cursorX + segW - 90,
          y: groundY - 64,
          activated: false
        });
      }

      cursorX += segW;
      segIdx++;
    }

    // Arena Final do Chefe Demônio (Plana e ampla com 2 plataformas laterais de apoio)
    platforms.push({
      x: bossArenaStart,
      y: 540,
      w: 1350,
      h: 220,
      type: 'ground'
    });
    platforms.push({
      x: bossArenaStart + 180,
      y: 395,
      w: 190,
      h: 24,
      type: 'floating'
    });
    platforms.push({
      x: bossArenaStart + 760,
      y: 395,
      w: 190,
      h: 24,
      type: 'floating'
    });

    // Pessoas cativas na entrada da arena do chefe
    for (let i = 0; i < 5; i++) {
      souls.push({
        id: soulId++,
        x: bossArenaStart + 60 + i * 55,
        y: 485,
        baseY: 485,
        rescued: false,
        shirtColor: shirtPalette[i % shirtPalette.length],
        label: soulLabels[i % soulLabels.length]
      });
    }

    st.platforms = platforms;
    st.souls = souls;
    st.springs = springs;
    st.speedPads = speedPads;
    st.boxes = boxes;
    st.minions = minions;
    st.checkpoints = checkpoints;

    st.boss = {
      active: false,
      defeated: false,
      x: bossArenaStart + 680,
      y: 250,
      vx: 3.4 + zoneIndex * 0.7,
      vy: 0,
      hp: zone.bossMaxHp,
      maxHp: zone.bossMaxHp,
      hitFlash: 0,
      attackTimer: 90,
      phase: 1,
      projectiles: []
    };

    setBossActiveUI(false);
    setBossHpUI({ current: zone.bossMaxHp, max: zone.bossMaxHp, name: zone.bossName });
  }, []);

  // ============================================================================
  // CONTROLES DE TECLADO
  // ============================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keysRef.current.left = true;
      if (k === 'arrowright' || k === 'd') keysRef.current.right = true;
      if (k === 'arrowdown' || k === 's') keysRef.current.down = true;
      if (k === 'arrowup' || k === 'w' || k === ' ') {
        e.preventDefault();
        keysRef.current.jump = true;
      }
      if (k === 'shift' || k === 'x' || k === 'k') {
        e.preventDefault();
        keysRef.current.dash = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keysRef.current.left = false;
      if (k === 'arrowright' || k === 'd') keysRef.current.right = false;
      if (k === 'arrowdown' || k === 's') keysRef.current.down = false;
      if (k === 'arrowup' || k === 'w' || k === ' ') keysRef.current.jump = false;
      if (k === 'shift' || k === 'x' || k === 'k') keysRef.current.dash = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // ============================================================================
  // AÇÃO DIRETA DE SPIN DASH (INVESTIDA DE LUZ) E PULO
  // ============================================================================
  const triggerSpinDashAction = () => {
    const st = engineRef.current;
    const p = st.player;
    if (p.grounded) {
      p.crouching = true;
      p.spinDashCharge = Math.min(10, p.spinDashCharge + 3.5);
      soundFX.playSpinDashCharge(p.spinDashCharge);
      // Soltar imediatamente um impulso supersônico se já carregou
      const boostSpeed = 13.5 + p.spinDashCharge * 0.65;
      p.vx = p.facing * boostSpeed;
      p.spinning = true;
      p.crouching = false;
      p.spinDashCharge = 0;
      soundFX.playSpinDashRelease();
      for (let i = 0; i < 12; i++) {
        st.particles.push({
          x: p.x + p.w / 2,
          y: p.y + p.h - 8,
          vx: -p.facing * (2 + Math.random() * 6),
          vy: -Math.random() * 4,
          life: 24,
          maxLife: 24,
          color: '#fbbf24',
          size: 5
        });
      }
    } else {
      // Air Dash de Luz no ar
      p.vx = p.facing * 12;
      p.spinning = true;
      soundFX.playSpinDashRelease();
    }
  };

  // ============================================================================
  // LOOP PRINCIPAL 60 FPS (FÍSICA SONIC 2 + RENDERIZAÇÃO CANVAS HORIZONTAL 1280x720)
  // ============================================================================
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;
    const W = 1280;
    const H = 720;

    const spawnParticles = (x: number, y: number, color: string, count = 10, text?: string) => {
      const st = engineRef.current;
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const spd = 2 + Math.random() * 5;
        st.particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.5,
          life: 32,
          maxLife: 32,
          color,
          size: 4 + Math.random() * 3
        });
      }
      if (text) {
        st.particles.push({
          x,
          y: y - 16,
          vx: 0,
          vy: -1.4,
          life: 45,
          maxLife: 45,
          color: '#fef08a',
          size: 14,
          text
        });
      }
    };

    const damagePlayer = () => {
      const st = engineRef.current;
      const p = st.player;
      if (p.invulnerableTimer > 0) return;

      // Se tiver Escudo da Fé, perde apenas o escudo
      if (p.shield) {
        p.shield = false;
        p.invulnerableTimer = 95;
        p.vy = -8;
        p.vx = -p.facing * 6;
        soundFX.playHurt();
        spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#38bdf8', 18, 'ESCUDO DA FÉ PROTEGEU!');
        return;
      }

      // Se tiver Pessoas Resgatadas (> 0), espalha algumas como as argolas do Sonic
      if (st.soulsCount > 0) {
        const lostCount = Math.min(st.soulsCount, 8);
        st.soulsCount = Math.max(0, st.soulsCount - lostCount);
        setRescuedSouls(st.soulsCount);
        p.invulnerableTimer = 110;
        p.vy = -9.5;
        p.vx = -p.facing * 7;
        p.spinning = false;
        soundFX.playHurt();

        const shirtColors = ['#38bdf8', '#f472b6', '#fbbf24', '#34d399'];
        for (let i = 0; i < lostCount; i++) {
          const angle = Math.PI * 0.2 + (i / Math.max(1, lostCount - 1)) * Math.PI * 0.6;
          st.souls.push({
            id: Date.now() + i,
            x: p.x + p.w / 2,
            y: p.y,
            baseY: p.y,
            rescued: false,
            scattered: true,
            vx: Math.cos(angle) * (i % 2 === 0 ? 5.5 : -5.5),
            vy: -Math.sin(angle) * 9 - 2,
            shirtColor: shirtColors[i % shirtColors.length],
            label: 'Resgatar!'
          });
        }
        spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#f87171', 14, 'RECUPERE AS ALMAS!');
        return;
      }

      // Sem escudo e sem almas acumuladas: perde 1 vida
      soundFX.playHurt();
      st.livesCount -= 1;
      setLives(st.livesCount);
      if (st.livesCount <= 0) {
        onGameOver(st.scoreCount);
        setGameState('gameover');
        return;
      }
      // Respawn no último Checkpoint
      p.x = p.checkpointX;
      p.y = p.checkpointY - 40;
      p.vx = 0;
      p.vy = 0;
      p.invulnerableTimer = 120;
      spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#fbbf24', 20, 'RENASCIMENTO PELA GRAÇA!');
    };

    const updatePhysics = () => {
      const st = engineRef.current;
      const p = st.player;
      const keys = keysRef.current;
      const zone = ZONES[currentZoneIdx];
      const bossArenaStart = zone.length - 1150;

      st.timeFrames++;
      if (st.timeFrames % 60 === 0) {
        setElapsedSeconds(Math.floor(st.timeFrames / 60));
      }
      if (st.titleCardTimer > 0) st.titleCardTimer--;
      if (p.invulnerableTimer > 0) p.invulnerableTimer--;
      if (p.speedBoostTimer > 0) p.speedBoostTimer--;

      // Parâmetros de velocidade estilo Sonic 2
      const maxSpeed = p.speedBoostTimer > 0 ? 15.5 : 11.5;
      const accel = p.grounded ? 0.52 : 0.36;
      const friction = p.spinning ? 0.985 : 0.89;
      const gravity = 0.66;

      // Agachar e carregar Spin Dash (Investida de Luz)
      if (p.grounded && keys.down && Math.abs(p.vx) < 2.2) {
        p.crouching = true;
        p.vx *= 0.7;
        if (keys.jump || keys.dash) {
          keys.jump = false;
          keys.dash = false;
          p.spinDashCharge = Math.min(10, p.spinDashCharge + 2.5);
          soundFX.playSpinDashCharge(p.spinDashCharge);
          spawnParticles(p.x + p.w / 2, p.y + p.h - 6, '#fbbf24', 4);
        }
      } else {
        if (p.crouching && p.spinDashCharge > 0) {
          // Soltou o botão de baixo: Dispara Spin Dash!
          const dashVelocity = 12.5 + p.spinDashCharge * 0.75;
          p.vx = p.facing * dashVelocity;
          p.spinning = true;
          p.spinDashCharge = 0;
          soundFX.playSpinDashRelease();
          spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#fef08a', 15, 'INVESTIDA DE LUZ!');
        }
        p.crouching = false;
      }

      // Botão dedicado de Spin Dash rápido
      if (keys.dash && !p.crouching) {
        keys.dash = false;
        triggerSpinDashAction();
      }

      // Movimentação Horizontal
      if (!p.crouching) {
        if (keys.left) {
          p.facing = -1;
          if (p.vx > 0) p.vx -= accel * 2.1; // Freio rápido clássico do Sonic
          else if (p.vx > -maxSpeed) p.vx -= accel;
        } else if (keys.right) {
          p.facing = 1;
          if (p.vx < 0) p.vx += accel * 2.1;
          else if (p.vx < maxSpeed) p.vx += accel;
        } else {
          p.vx *= friction;
          if (Math.abs(p.vx) < 0.12) {
            p.vx = 0;
            if (p.grounded) p.spinning = false;
          }
        }
      }

      // Pulo (Salto Giratório de Luz)
      if (keys.jump && p.grounded && !p.crouching) {
        keys.jump = false;
        p.vy = -14.2;
        p.grounded = false;
        p.spinning = true;
        soundFX.playJump();
      }

      // Aplicar gravidade e velocidades
      p.vy = Math.min(16, p.vy + gravity);
      p.x += p.vx;
      p.y += p.vy;

      // Limites horizontais (trava na arena do chefe quando ativa)
      const minX = st.boss.active ? bossArenaStart + 20 : 20;
      const maxX = zone.length - 80;
      if (p.x < minX) {
        p.x = minX;
        p.vx = 0;
      }
      if (p.x > maxX) {
        p.x = maxX;
        p.vx = 0;
      }

      // Colisão com Plataformas
      p.grounded = false;
      for (const plat of st.platforms) {
        const withinX = p.x + p.w * 0.8 > plat.x && p.x + p.w * 0.2 < plat.x + plat.w;
        if (withinX && p.vy >= 0) {
          const feetY = p.y + p.h;
          const prevFeetY = feetY - p.vy;
          if (prevFeetY <= plat.y + 18 && feetY >= plat.y) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.grounded = true;
            if (Math.abs(p.vx) < 4.5) p.spinning = false;
          }
        }
      }

      // Queda em abismo
      if (p.y > H + 140) {
        damagePlayer();
      }

      // Animação de corrida proporcional à velocidade
      p.animFrame += 0.12 + Math.abs(p.vx) * 0.04;

      // Rastro de luz celestial em alta velocidade
      if (Math.abs(p.vx) > 9.5 && st.timeFrames % 3 === 0) {
        st.particles.push({
          x: p.x + p.w / 2,
          y: p.y + p.h / 2,
          vx: -p.vx * 0.2,
          vy: (Math.random() - 0.5) * 1.5,
          life: 16,
          maxLife: 16,
          color: '#fde047',
          size: 7
        });
      }

      // Colisão com Molas (Springs)
      for (const sp of st.springs) {
        if (sp.compressed > 0) sp.compressed--;
        if (
          p.x + p.w > sp.x &&
          p.x < sp.x + 44 &&
          p.y + p.h >= sp.y &&
          p.y + p.h <= sp.y + 34 &&
          p.vy >= 0
        ) {
          p.vy = sp.power;
          p.grounded = false;
          p.spinning = true;
          sp.compressed = 15;
          soundFX.playSpring();
          spawnParticles(sp.x + 22, sp.y, '#fbbf24', 10);
        }
      }

      // Colisão com Tapetes de Impulso (Speed Pads)
      for (const pad of st.speedPads) {
        if (
          p.grounded &&
          p.x + p.w > pad.x &&
          p.x < pad.x + pad.w &&
          Math.abs(p.y + p.h - pad.y) < 24
        ) {
          p.vx = 15.2;
          p.facing = 1;
          p.spinning = true;
          soundFX.playSpinDashRelease();
          spawnParticles(pad.x + pad.w / 2, pad.y, '#38bdf8', 12, 'IMPULSO DO ESPÍRITO!');
        }
      }

      // Checkpoints
      for (const cp of st.checkpoints) {
        if (!cp.activated && Math.abs(p.x - cp.x) < 42 && Math.abs(p.y - cp.y) < 70) {
          cp.activated = true;
          p.checkpointX = cp.x;
          p.checkpointY = cp.y;
          soundFX.playRescueSoul();
          spawnParticles(cp.x, cp.y, '#fbbf24', 18, 'CHECKPOINT DA CRUZ!');
        }
      }

      // Monitores de Bênção
      for (const box of st.boxes) {
        if (box.broken) continue;
        const hitX = p.x + p.w > box.x && p.x < box.x + 44;
        const hitY = p.y + p.h > box.y && p.y < box.y + 44;
        if (hitX && hitY && (p.spinning || p.vy > 0 || Math.abs(p.vx) > 6)) {
          box.broken = true;
          if (p.vy > 0) p.vy = -8.5;
          soundFX.playBossHit();
          if (box.type === 'shield') {
            p.shield = true;
            spawnParticles(box.x + 22, box.y + 22, '#38bdf8', 18, 'ESCUDO DA FÉ!');
          } else if (box.type === 'souls10') {
            st.soulsCount += 10;
            st.totalSoulsCount += 10;
            st.scoreCount += 1000;
            setRescuedSouls(st.soulsCount);
            setTotalRescuedAllZones(st.totalSoulsCount);
            setScore(st.scoreCount);
            spawnParticles(box.x + 22, box.y + 22, '#fbbf24', 18, '+10 ALMAS RESGATADAS!');
          } else if (box.type === 'speed') {
            p.speedBoostTimer = 480;
            spawnParticles(box.x + 22, box.y + 22, '#fde047', 18, 'VELOCIDADE CELESTIAL!');
          } else if (box.type === 'life') {
            st.livesCount += 1;
            setLives(st.livesCount);
            spawnParticles(box.x + 22, box.y + 22, '#4ade80', 18, '+1 VIDA EXTRA!');
          }
        }
      }

      // Coleta de Pessoas (Almas Resgatadas)
      for (const soul of st.souls) {
        if (soul.rescued) continue;

        // Física para almas espalhadas após dano
        if (soul.scattered) {
          soul.x += soul.vx || 0;
          soul.y += soul.vy || 0;
          soul.vy = (soul.vy || 0) + 0.42;
          if (soul.y > 495) {
            soul.y = 495;
            soul.vy = -(soul.vy || 0) * 0.65;
            soul.vx = (soul.vx || 0) * 0.85;
          }
        } else {
          soul.y = soul.baseY + Math.sin(st.timeFrames * 0.07 + soul.id) * 5;
        }

        const dx = p.x + p.w / 2 - soul.x;
        const dy = p.y + p.h / 2 - soul.y;
        if (Math.hypot(dx, dy) < 42 && p.invulnerableTimer < 85) {
          soul.rescued = true;
          st.soulsCount += 1;
          if (!soul.scattered) st.totalSoulsCount += 1;
          st.scoreCount += 100;
          setRescuedSouls(st.soulsCount);
          setTotalRescuedAllZones(st.totalSoulsCount);
          setScore(st.scoreCount);
          soundFX.playRescueSoul();
          spawnParticles(soul.x, soul.y, '#fef08a', 8, '+1 ALMA');
        }
      }

      // Inimigos menores (Sombras)
      for (const m of st.minions) {
        if (!m.alive) continue;
        m.x += m.vx;
        if (m.x < m.minX || m.x > m.maxX) m.vx *= -1;

        const dx = p.x + p.w / 2 - (m.x + 20);
        const dy = p.y + p.h / 2 - (m.y + 20);
        if (Math.hypot(dx, dy) < 40) {
          const isAttacking = p.spinning || p.vy > 1 || p.speedBoostTimer > 0;
          if (isAttacking) {
            m.alive = false;
            if (p.vy > 0) p.vy = -10.5;
            st.scoreCount += 250;
            setScore(st.scoreCount);
            soundFX.playBossHit();
            spawnParticles(m.x + 20, m.y + 20, '#38bdf8', 15, 'LUZ VENCEU AS TREVAS! +250');
          } else {
            damagePlayer();
          }
        }
      }

      // ======================================================================
      // BATALHA CONTRA O CHEFE DEMÔNIO NO FINAL DA FASE
      // ======================================================================
      const boss = st.boss;
      if (!boss.active && !boss.defeated && p.x > bossArenaStart - 80) {
        boss.active = true;
        setBossActiveUI(true);
        setBossHpUI({ current: boss.hp, max: boss.maxHp, name: zone.bossName });
      }

      if (boss.active && !boss.defeated) {
        if (boss.hitFlash > 0) boss.hitFlash--;

        // Movimento senoidal e investidas do chefe demônio
        boss.x += boss.vx;
        boss.y = 235 + Math.sin(st.timeFrames * 0.05) * 65;

        const leftBound = bossArenaStart + 120;
        const rightBound = zone.length - 180;
        if (boss.x < leftBound) {
          boss.x = leftBound;
          boss.vx = Math.abs(boss.vx);
        }
        if (boss.x > rightBound) {
          boss.x = rightBound;
          boss.vx = -Math.abs(boss.vx);
        }

        // Disparo de projéteis sombrios pelo chefe
        boss.attackTimer--;
        if (boss.attackTimer <= 0) {
          boss.attackTimer = Math.max(45, 95 - currentZoneIdx * 18);
          const angleToPlayer = Math.atan2(p.y + p.h / 2 - (boss.y + 45), p.x + p.w / 2 - (boss.x + 45));
          const spd = 6.2 + currentZoneIdx * 1.1;
          boss.projectiles.push({
            x: boss.x + 45,
            y: boss.y + 55,
            vx: Math.cos(angleToPlayer) * spd,
            vy: Math.sin(angleToPlayer) * spd,
            radius: 13,
            color: zone.bossColor
          });
        }

        // Atualizar projéteis do chefe
        for (let i = boss.projectiles.length - 1; i >= 0; i--) {
          const proj = boss.projectiles[i];
          proj.x += proj.vx;
          proj.y += proj.vy;
          const dist = Math.hypot(p.x + p.w / 2 - proj.x, p.y + p.h / 2 - proj.y);
          if (dist < proj.radius + 22) {
            boss.projectiles.splice(i, 1);
            damagePlayer();
            continue;
          }
          if (proj.y > H || proj.x < bossArenaStart || proj.x > zone.length) {
            boss.projectiles.splice(i, 1);
          }
        }

        // Colisão entre Jesus (Jogador) e o Chefe Demônio
        const bCenterX = boss.x + 48;
        const bCenterY = boss.y + 48;
        const pCenterX = p.x + p.w / 2;
        const pCenterY = p.y + p.h / 2;
        const distBoss = Math.hypot(pCenterX - bCenterX, pCenterY - bCenterY);

        if (distBoss < 64 && boss.hitFlash === 0) {
          const playerAttacking = p.spinning || p.vy < -2 || p.vy > 1 || Math.abs(p.vx) > 9;
          if (playerAttacking) {
            boss.hp -= 1;
            boss.hitFlash = 38;
            // Rebote clássico do Sonic 2 ao acertar o chefe
            p.vy = -10.5;
            p.vx = (pCenterX < bCenterX ? -1 : 1) * 8.5;
            p.spinning = true;
            soundFX.playBossHit();
            setBossHpUI({ current: Math.max(0, boss.hp), max: boss.maxHp, name: zone.bossName });
            spawnParticles(bCenterX, bCenterY, '#fef08a', 22, 'GOLPE DE LUZ!');

            if (boss.hp <= 0) {
              boss.defeated = true;
              boss.active = false;
              boss.projectiles = [];
              setBossActiveUI(false);
              const timeBonus = Math.max(500, 5000 - Math.floor(st.timeFrames / 60) * 20);
              const soulsBonus = st.soulsCount * 100;
              st.scoreCount += 2500 + timeBonus + soulsBonus;
              setScore(st.scoreCount);
              onGameOver(st.scoreCount);
              soundFX.playVictory();
              spawnParticles(bCenterX, bCenterY, '#fde047', 45, 'DEMÔNIO DERROTADO!');

              setTimeout(() => {
                if (currentZoneIdx + 1 < ZONES.length) {
                  setGameState('zone_clear');
                } else {
                  setGameState('victory');
                }
              }, 1100);
            }
          } else {
            damagePlayer();
          }
        }
      }

      // Atualizar partículas
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const pt = st.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        if (pt.life <= 0) st.particles.splice(i, 1);
      }

      // Câmera horizontal suave seguindo o jogador (com look-ahead estilo Sonic 2)
      const targetCamX = boss.active
        ? bossArenaStart - 20
        : Math.max(0, Math.min(zone.length - W, p.x - W * 0.32 + p.vx * 14));
      st.cameraX += (targetCamX - st.cameraX) * 0.14;
    };

    // ========================================================================
    // RENDERIZAÇÃO GRÁFICA NO CANVAS HORIZONTAL (1280 x 720)
    // ========================================================================
    const renderScene = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const st = engineRef.current;
      const p = st.player;
      const camX = st.cameraX;
      const zone = ZONES[currentZoneIdx];

      // 1. Céu em Gradiente Horizontal
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, zone.skyTop);
      skyGrad.addColorStop(1, zone.skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Sol / Brilho Celestial no horizonte
      ctx.save();
      const sunGrad = ctx.createRadialGradient(W * 0.78, 130, 15, W * 0.78, 130, 160);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      sunGrad.addColorStop(0.4, 'rgba(250, 204, 21, 0.35)');
      sunGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(W * 0.78, 130, 160, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Montanhas e Colinas em Paralaxe (Estilo Sonic 2)
      ctx.fillStyle = zone.hillColor2;
      for (let i = -1; i < 8; i++) {
        const hx = ((i * 380 - camX * 0.18) % 2600) - 200;
        ctx.beginPath();
        ctx.arc(hx + 190, 560, 220, Math.PI, 0);
        ctx.fill();
      }

      ctx.fillStyle = zone.hillColor1;
      for (let i = -1; i < 9; i++) {
        const hx = ((i * 310 - camX * 0.35) % 2400) - 200;
        ctx.beginPath();
        ctx.arc(hx + 150, 560, 150, Math.PI, 0);
        ctx.fill();
      }

      // 3. Plataformas com Padrão Quadriculado (Checkerboard Clássico Sonic 2)
      for (const plat of st.platforms) {
        if (plat.x + plat.w < camX - 100 || plat.x > camX + W + 100) continue;
        const sx = plat.x - camX;

        // Bloco de terra quadriculada
        ctx.fillStyle = zone.groundCheck1;
        ctx.fillRect(sx, plat.y, plat.w, plat.h);

        const tileSize = 32;
        ctx.fillStyle = zone.groundCheck2;
        for (let tx = 0; tx < plat.w; tx += tileSize) {
          for (let ty = 14; ty < Math.min(plat.h, 160); ty += tileSize) {
            if (((tx / tileSize) + Math.floor(ty / tileSize)) % 2 === 0) {
              ctx.fillRect(sx + tx, plat.y + ty, Math.min(tileSize, plat.w - tx), tileSize);
            }
          }
        }

        // Topo de relva/ouro vibrante
        ctx.fillStyle = zone.groundTop;
        ctx.fillRect(sx, plat.y, plat.w, 14);
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.fillRect(sx, plat.y, plat.w, 4);
      }

      // 4. Tapetes de Velocidade (Boost Pads)
      for (const pad of st.speedPads) {
        const sx = pad.x - camX;
        if (sx + pad.w < 0 || sx > W) continue;
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(sx, pad.y - 6, pad.w, 12);
        ctx.fillStyle = '#fde047';
        for (let a = 0; a < 3; a++) {
          const ax = sx + 16 + a * 26 + ((st.timeFrames * 2) % 14);
          ctx.beginPath();
          ctx.moveTo(ax, pad.y - 5);
          ctx.lineTo(ax + 12, pad.y);
          ctx.lineTo(ax, pad.y + 5);
          ctx.fill();
        }
      }

      // 5. Molas (Springs)
      for (const sp of st.springs) {
        const sx = sp.x - camX;
        if (sx < -60 || sx > W + 60) continue;
        const compOffset = sp.compressed > 0 ? 8 : 0;
        // Espiral amarela
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(sx + 8, sp.y + 24);
        ctx.lineTo(sx + 36, sp.y + 14 + compOffset);
        ctx.lineTo(sx + 8, sp.y + 8 + compOffset);
        ctx.stroke();
        // Topo vermelho da mola
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(sx + 2, sp.y + compOffset, 40, 10);
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(sx + 6, sp.y + compOffset + 2, 32, 3);
      }

      // 6. Postes de Checkpoint (Cruz Luminosa)
      for (const cp of st.checkpoints) {
        const sx = cp.x - camX;
        if (sx < -60 || sx > W + 60) continue;
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(sx - 4, cp.y, 8, 64);
        // Cruz no topo
        ctx.fillStyle = cp.activated ? '#facc15' : '#64748b';
        ctx.fillRect(sx - 14, cp.y - 12, 28, 8);
        ctx.fillRect(sx - 4, cp.y - 24, 8, 28);
        if (cp.activated) {
          ctx.save();
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 18;
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, cp.y - 10, 22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 7. Monitores de Bênção
      for (const box of st.boxes) {
        if (box.broken) continue;
        const sx = box.x - camX;
        if (sx < -60 || sx > W + 60) continue;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.fillRect(sx, box.y, 44, 44);
        ctx.strokeRect(sx, box.y, 44, 44);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(sx + 5, box.y + 5, 34, 34);

        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fde047';
        const iconText =
          box.type === 'shield' ? '🛡️' : box.type === 'souls10' ? '+10' : box.type === 'speed' ? '⚡' : '❤️';
        ctx.fillText(iconText, sx + 22, box.y + 28);
      }

      // 8. Representações de Pessoas a Serem Resgatadas (Substituindo as Argolas)
      for (const soul of st.souls) {
        if (soul.rescued) continue;
        const sx = soul.x - camX;
        if (sx < -60 || sx > W + 60) continue;

        ctx.save();
        // Aura dourada ao redor da pessoa
        const pulse = 18 + Math.sin(st.timeFrames * 0.12 + soul.id) * 3;
        const aura = ctx.createRadialGradient(sx, soul.y, 2, sx, soul.y, pulse);
        aura.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
        aura.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(sx, soul.y, pulse, 0, Math.PI * 2);
        ctx.fill();

        // Corpo estilizado da Pessoa erguendo os braços
        // Cabeça
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.arc(sx, soul.y - 10, 6.5, 0, Math.PI * 2);
        ctx.fill();

        // Túnica/Camisa colorida
        ctx.fillStyle = soul.shirtColor;
        ctx.beginPath();
        ctx.roundRect(sx - 6, soul.y - 3, 12, 14, 4);
        ctx.fill();

        // Braços erguidos (pedindo resgate/louvando)
        const armWave = Math.sin(st.timeFrames * 0.15 + soul.id) * 3;
        ctx.strokeStyle = soul.shirtColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sx - 5, soul.y);
        ctx.lineTo(sx - 12, soul.y - 8 + armWave);
        ctx.moveTo(sx + 5, soul.y);
        ctx.lineTo(sx + 12, soul.y - 8 - armWave);
        ctx.stroke();
        ctx.restore();
      }

      // 9. Inimigos Menores (Sombras)
      for (const m of st.minions) {
        if (!m.alive) continue;
        const sx = m.x - camX;
        if (sx < -60 || sx > W + 60) continue;

        ctx.save();
        ctx.fillStyle = '#31102f';
        ctx.beginPath();
        ctx.arc(sx + 20, m.y + 20, 18, 0, Math.PI * 2);
        ctx.fill();

        // Pequenos chifres sombrios
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.moveTo(sx + 8, m.y + 6);
        ctx.lineTo(sx + 2, m.y - 6);
        ctx.lineTo(sx + 15, m.y + 4);
        ctx.moveTo(sx + 32, m.y + 6);
        ctx.lineTo(sx + 38, m.y - 6);
        ctx.lineTo(sx + 25, m.y + 4);
        ctx.fill();

        // Olhos brilhantes
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(sx + 11, m.y + 15, 5, 5);
        ctx.fillRect(sx + 24, m.y + 15, 5, 5);
        ctx.restore();
      }

      // 10. Chefe de Fase (Demônio) e Seus Projéteis
      const boss = st.boss;
      if (boss.active && !boss.defeated) {
        const bx = boss.x - camX;
        const by = boss.y;

        ctx.save();
        if (boss.hitFlash % 4 > 1) {
          ctx.filter = 'brightness(2.5)';
        }

        // Asas de morcego/demônio batendo
        const wingFlap = Math.sin(st.timeFrames * 0.22) * 24;
        ctx.fillStyle = boss.hitFlash > 0 ? '#ffffff' : zone.bossSecondary;
        // Asa esquerda
        ctx.beginPath();
        ctx.moveTo(bx + 25, by + 40);
        ctx.lineTo(bx - 42, by + 5 + wingFlap);
        ctx.lineTo(bx - 22, by + 65);
        ctx.closePath();
        ctx.fill();
        // Asa direita
        ctx.beginPath();
        ctx.moveTo(bx + 70, by + 40);
        ctx.lineTo(bx + 138, by + 5 + wingFlap);
        ctx.lineTo(bx + 118, by + 65);
        ctx.closePath();
        ctx.fill();

        // Corpo do Chefe Demônio
        ctx.fillStyle = boss.hitFlash > 0 ? '#fecaca' : zone.bossColor;
        ctx.beginPath();
        ctx.arc(bx + 48, by + 48, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#fde047';
        ctx.stroke();

        // Chifres Grandes Curvos
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(bx + 18, by + 18);
        ctx.lineTo(bx - 8, by - 22);
        ctx.lineTo(bx + 34, by + 10);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(bx + 78, by + 18);
        ctx.lineTo(bx + 104, by - 22);
        ctx.lineTo(bx + 62, by + 10);
        ctx.fill();

        // Olhos flamejantes e expressão
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(bx + 26, by + 34, 14, 9);
        ctx.fillRect(bx + 56, by + 34, 14, 9);

        // Tridente / Cetro sombrio
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(bx + 12, by + 80);
        ctx.lineTo(bx + 12, by + 20);
        ctx.stroke();

        ctx.restore();

        // Projéteis de fogo sombrio
        for (const proj of boss.projectiles) {
          const px = proj.x - camX;
          ctx.save();
          ctx.fillStyle = proj.color;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(px, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(px, proj.y, proj.radius * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 11. Personagem Principal: Avatar Inspirado em Jesus Cristo
      const px = p.x - camX;
      const py = p.y;

      ctx.save();
      if (p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer / 4) % 2 === 0) {
        ctx.globalAlpha = 0.45;
      }

      // Escudo da Fé ativo
      if (p.shield) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px + p.w / 2, py + p.h / 2, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      if (p.spinning) {
        // Modo Salto Giratório / Spin Dash de Luz Celestial (Esfera radiante com Cruz giratória)
        const cx = px + p.w / 2;
        const cy = py + p.h / 2 + 4;
        const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 30);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.55, '#fef08a');
        grad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(cx, cy);
        ctx.rotate(st.timeFrames * 0.45 * p.facing);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(16, 0);
        ctx.moveTo(0, -16);
        ctx.lineTo(0, 16);
        ctx.stroke();
      } else {
        // Avatar de Jesus Cristo correndo/parado
        const cx = px + p.w / 2;
        const crouchOffset = p.crouching ? 12 : 0;

        // Auréola Dourada Luminosa
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(cx, py - 4 + crouchOffset, 15, 5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Cabelos castanhos longos esvoaçando com a velocidade
        const hairFlow = -p.facing * Math.min(12, Math.abs(p.vx) * 1.1);
        ctx.fillStyle = '#5c2d16';
        ctx.beginPath();
        ctx.arc(cx - p.facing * 3 + hairFlow * 0.4, py + 12 + crouchOffset, 12, 0, Math.PI * 2);
        ctx.fill();

        // Rosto sereno e barba
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(cx + p.facing * 2, py + 11 + crouchOffset, 10, 0, Math.PI * 2);
        ctx.fill();

        // Barba
        ctx.fillStyle = '#5c2d16';
        ctx.beginPath();
        ctx.arc(cx + p.facing * 3, py + 15 + crouchOffset, 8, 0.1, Math.PI - 0.1);
        ctx.fill();

        // Olho
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx + p.facing * 6, py + 8 + crouchOffset, 2.5, 3.5);

        // Túnica Branca Radiante
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(cx - 11, py + 21 + crouchOffset);
        ctx.lineTo(cx + 11, py + 21 + crouchOffset);
        ctx.lineTo(cx + 16, py + 48);
        ctx.lineTo(cx - 16, py + 48);
        ctx.closePath();
        ctx.fill();

        // Faixa Vermelha/Real Transversal no Manto
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * p.facing, py + 22 + crouchOffset);
        ctx.lineTo(cx + 10 * p.facing, py + 44);
        ctx.stroke();

        // Pés com sandálias em movimento de corrida estilo Sonic
        const stride = Math.abs(p.vx) > 0.3 ? Math.sin(p.animFrame * 2.2) * 11 : 0;
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.ellipse(cx + stride, py + 52, 8, 4.5, 0, 0, Math.PI * 2);
        ctx.ellipse(cx - stride, py + 52, 8, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 12. Partículas e Textos Flutuantes
      for (const pt of st.particles) {
        const sx = pt.x - camX;
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        if (pt.text) {
          ctx.font = '900 14px sans-serif';
          ctx.fillStyle = pt.color;
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.strokeText(pt.text, sx, pt.y);
          ctx.fillText(pt.text, sx, pt.y);
        } else {
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(sx, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 13. Title Card de Abertura da Fase (Estilo Clássico Sonic 2)
      if (st.titleCardTimer > 0) {
        const alpha = Math.min(1, st.titleCardTimer / 35);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.fillRect(0, H * 0.28, W, 175);

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(W * 0.18, H * 0.25, 18, 220);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(W * 0.18 + 18, H * 0.25, 8, 220);

        ctx.font = '900 44px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`ZONA ${zone.id}: ${zone.name}`, W * 0.23, H * 0.38);

        ctx.font = '700 18px sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.fillText(zone.subtitle.toUpperCase(), W * 0.23, H * 0.43);

        ctx.font = 'italic 15px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(zone.verse, W * 0.23, H * 0.48);
        ctx.restore();
      }
    };

    const tick = () => {
      updatePhysics();
      renderScene();
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameState, currentZoneIdx, onGameOver]);

  const startNewGame = (zoneIdx = 0) => {
    setCurrentZoneIdx(zoneIdx);
    buildZoneLevel(zoneIdx, zoneIdx === 0);
    setGameState('playing');
  };

  const advanceToNextZone = () => {
    const nextIdx = currentZoneIdx + 1;
    if (nextIdx < ZONES.length) {
      setCurrentZoneIdx(nextIdx);
      buildZoneLevel(nextIdx, false);
      setGameState('playing');
    } else {
      setGameState('victory');
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentZone = ZONES[currentZoneIdx];

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col bg-slate-950 text-white select-none overflow-hidden relative"
    >
      {/* AVISO DE ROTAÇÃO AUTOMÁTICA CASO ESTEJA EM CELULAR NA VERTICAL */}
      {isPortraitMobile && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 flex items-center justify-between text-xs text-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="rotate-90 text-amber-400 shrink-0" />
            <span>Modo Horizontal Recomendado: Gire o aparelho ou ative a Tela Horizontal Cheia.</span>
          </div>
          <button
            onClick={enterHorizontalFullscreen}
            className="px-3 py-1 bg-amber-400 text-slate-950 font-black rounded-lg text-[11px] cursor-pointer shrink-0"
          >
            Fixar Horizontal
          </button>
        </div>
      )}

      {/* CONTAINER HORIZONTAL 16:9 DO JOGO */}
      <div className="flex-1 w-full flex items-center justify-center bg-black relative overflow-hidden p-1 md:p-3">
        <div className="relative w-full max-w-[1280px] aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
          {/* CANVAS HORIZONTAL 1280x720 */}
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="w-full h-full object-contain block"
          />

          {/* HUD CLÁSSICO SONIC 2 (CANTO SUPERIOR ESQUERDO + BARRA DO CHEFE) */}
          {gameState === 'playing' && (
            <>
              <div className="absolute top-3 left-4 z-20 flex flex-col gap-1 pointer-events-none font-mono">
                <div className="flex items-center gap-3 bg-slate-950/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-400/30">
                  <span className="text-amber-400 font-black text-xs md:text-sm tracking-wider uppercase">PONTOS</span>
                  <span className="text-white font-black text-sm md:text-base">{score.toLocaleString('pt-BR')}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400 font-black text-xs md:text-sm tracking-wider uppercase">TEMPO</span>
                  <span className="text-white font-black text-sm md:text-base">{formatTime(elapsedSeconds)}</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-950/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-sky-400/30 w-fit">
                  <Users size={15} className="text-sky-400" />
                  <span className="text-sky-300 font-black text-xs md:text-sm uppercase tracking-wider">PESSOAS RESGATADAS:</span>
                  <span className={`font-black text-base md:text-lg ${rescuedSouls === 0 ? 'text-rose-400 animate-pulse' : 'text-amber-300'}`}>
                    {rescuedSouls}
                  </span>
                </div>
              </div>

              {/* BARRA DE VIDA DO CHEFE DEMÔNIO (FINAL DA FASE) */}
              {bossActiveUI && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-rose-950/90 border border-rose-500/60 px-5 py-2 rounded-2xl backdrop-blur-md flex flex-col items-center min-w-[260px] shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-black text-rose-200 uppercase tracking-wider mb-1">
                    <Flame size={14} className="text-rose-400 animate-bounce" />
                    <span>CHEFE: {bossHpUI.name}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-rose-500/40">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-yellow-300 transition-all duration-200"
                      style={{ width: `${(bossHpUI.current / Math.max(1, bossHpUI.max)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* CONTROLES DE PAUSA, SOM E TELA HORIZONTAL (TOPO DIREITO) */}
              <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
                <button
                  onClick={toggleAudio}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 cursor-pointer"
                  title={muted ? 'Ativar Som 16-bit' : 'Silenciar'}
                >
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button
                  onClick={enterHorizontalFullscreen}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 cursor-pointer"
                  title="Tela Horizontal Cheia"
                >
                  {isLandscapeFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={() => setGameState('paused')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-black text-white border border-slate-700/80 flex items-center gap-1.5 cursor-pointer"
                >
                  <Pause size={14} /> Pausa
                </button>
              </div>

              {/* CONTADOR DE VIDAS (CANTO INFERIOR ESQUERDO ESTILO SONIC 2) */}
              <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2.5 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-400/30 pointer-events-none">
                <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-300 flex items-center justify-center text-amber-300 font-black text-xs">
                  ✝
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-300 uppercase leading-none">JESUS</p>
                  <p className="text-xs font-black text-white leading-tight">× {lives}</p>
                </div>
              </div>

              {/* CONTROLES ARCADE NA TELA (TOUCH / MOUSE) PARA JOGAR EM QUALQUER DISPOSITIVO */}
              <div className="absolute bottom-3 inset-x-4 z-20 flex items-end justify-between pointer-events-none">
                {/* Direcional Esquerda / Baixo / Direita */}
                <div className="flex items-center gap-2 pointer-events-auto ml-24">
                  <button
                    onPointerDown={() => { keysRef.current.left = true; }}
                    onPointerUp={() => { keysRef.current.left = false; }}
                    onPointerLeave={() => { keysRef.current.left = false; }}
                    className="w-12 h-12 rounded-2xl bg-slate-900/65 active:bg-indigo-600/80 border border-white/20 flex items-center justify-center text-white shadow-lg cursor-pointer"
                    aria-label="Mover para Esquerda"
                  >
                    <ArrowLeft size={22} />
                  </button>
                  <button
                    onPointerDown={() => { keysRef.current.down = true; }}
                    onPointerUp={() => { keysRef.current.down = false; }}
                    onPointerLeave={() => { keysRef.current.down = false; }}
                    className="w-12 h-12 rounded-2xl bg-slate-900/65 active:bg-indigo-600/80 border border-white/20 flex items-center justify-center text-white shadow-lg cursor-pointer"
                    aria-label="Agachar"
                  >
                    <ArrowDown size={22} />
                  </button>
                  <button
                    onPointerDown={() => { keysRef.current.right = true; }}
                    onPointerUp={() => { keysRef.current.right = false; }}
                    onPointerLeave={() => { keysRef.current.right = false; }}
                    className="w-12 h-12 rounded-2xl bg-slate-900/65 active:bg-indigo-600/80 border border-white/20 flex items-center justify-center text-white shadow-lg cursor-pointer"
                    aria-label="Mover para Direita"
                  >
                    <ArrowRight size={22} />
                  </button>
                </div>

                {/* Botões de Ação: Spin Dash (Investida de Luz) e Salto */}
                <div className="flex items-center gap-2.5 pointer-events-auto">
                  <button
                    onPointerDown={() => triggerSpinDashAction()}
                    className="px-4 h-12 rounded-2xl bg-amber-500/80 hover:bg-amber-400 active:scale-95 border border-amber-200/50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Zap size={16} fill="currentColor" /> Spin Dash
                  </button>
                  <button
                    onPointerDown={() => { keysRef.current.jump = true; }}
                    onPointerUp={() => { keysRef.current.jump = false; }}
                    className="px-5 h-12 rounded-2xl bg-sky-500/85 hover:bg-sky-400 active:scale-95 border border-sky-200/50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <ArrowUp size={18} /> Saltar
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TELA INICIAL (MENU PRINCIPAL HORIZONTAL ESTILO SONIC 2) */}
          {gameState === 'menu' && (
            <div className="absolute inset-0 z-30 bg-gradient-to-br from-slate-950/95 via-indigo-950/90 to-slate-900/95 flex flex-col justify-between p-6 md:p-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    Plataforma Horizontal 16-Bit · Inspirado em Sonic 2
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-300">
                  <span>Recorde: <strong className="text-amber-400">{highScore.toLocaleString('pt-BR')} Pts</strong></span>
                  <button
                    onClick={enterHorizontalFullscreen}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Maximize2 size={13} /> Tela Horizontal Cheia
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-12 gap-6 items-center my-auto">
                <div className="md:col-span-7 space-y-4">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-none">
                    CORRIDA DA SALVAÇÃO
                    <span className="block text-xl md:text-2xl text-amber-400 mt-1">
                      O Resgate das Almas · Edição Horizontal
                    </span>
                  </h1>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl">
                    Percorra as fases em alta velocidade com o avatar inspirado em Jesus Cristo! Em vez de argolas, resgate as <strong className="text-sky-300">pessoas pelo caminho</strong>, utilize molas, rampas e o <strong className="text-amber-300">Spin Dash de Luz</strong>, e derrote os <strong className="text-rose-400">chefes demônios</strong> ao final de cada zona!
                  </p>

                  {/* Seleção rápida da Zona Inicial */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1 max-w-xl">
                    {ZONES.map((z, idx) => (
                      <button
                        key={z.id}
                        onClick={() => startNewGame(idx)}
                        className="p-3 rounded-xl bg-slate-900/90 hover:bg-indigo-950/80 border border-slate-700/80 hover:border-amber-400/60 text-left transition-all cursor-pointer group"
                      >
                        <p className="text-[10px] font-bold text-amber-400 uppercase">Zona {z.id}</p>
                        <p className="text-xs font-black text-white truncate group-hover:text-amber-200">{z.name}</p>
                        <p className="text-[10px] text-rose-400 truncate mt-0.5">Chefe: {z.bossName}</p>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => startNewGame(0)}
                      className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-500/25 cursor-pointer active:scale-95 transition-all"
                    >
                      <Play size={18} fill="currentColor" /> Iniciar Jornada (Ato 1)
                    </button>
                  </div>
                </div>

                {/* Painel Explicativo das Mecânicas Sonic 2 Adaptadas */}
                <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Mecânicas Clássicas & Controles
                  </h3>
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <Users size={16} className="text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Resgate de Pessoas (Substitui as Argolas):</strong> Colete pessoas ao longo das plataformas. Enquanto tiver pelo menos 1 pessoa resgatada com você, estará protegido da derrota!
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Zap size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Spin Dash de Luz (Investida Supersônica):</strong> Pressione <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">Shift</kbd> ou <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-amber-300">↓ + Espaço</kbd> para disparar em velocidade máxima!
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Flame size={16} className="text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Chefes Demônios no Final da Fase:</strong> Salte girando em luz sobre o chefe demônio quando ele não estiver piscando para vencê-lo.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span>Teclado: Setas ou WASD para Correr · Espaço para Saltar · Shift para Spin Dash</span>
                <span>Formato Widescreen 16:9 Horizontal</span>
              </div>
            </div>
          )}

          {/* MODAL DE PAUSA */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-3xl font-black text-white mb-2">JOGO PAUSADO</h2>
              <p className="text-xs text-slate-400 mb-6">Zona {currentZone.id}: {currentZone.name}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGameState('playing')}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Play size={15} fill="currentColor" /> Continuar
                </button>
                <button
                  onClick={() => startNewGame(currentZoneIdx)}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={15} /> Reiniciar Ato
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="px-5 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Menu Inicial
                </button>
              </div>
            </div>
          )}

          {/* TELA DE FASE CONCLUÍDA (ACT CLEAR TALLY ESTILO SONIC 2) */}
          {gameState === 'zone_clear' && (
            <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mb-3">
                <CheckCircle2 size={30} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                JESUS VENCEU O ATO {currentZone.id}!
              </h2>
              <p className="text-xs text-amber-300 font-bold uppercase tracking-widest mt-1 mb-6">
                {currentZone.bossName} Foi Derrotado · {currentZone.name} Libertada
              </p>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-md space-y-2.5 text-sm mb-6">
                <div className="flex justify-between text-slate-300">
                  <span>Pessoas Resgatadas no Ato:</span>
                  <strong className="text-sky-400">{rescuedSouls} Almas</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Bônus de Resgate:</span>
                  <strong className="text-amber-400">+{(rescuedSouls * 100).toLocaleString('pt-BR')} Pts</strong>
                </div>
                <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-2">
                  <span>Pontuação Total:</span>
                  <strong className="text-emerald-400 text-base">{score.toLocaleString('pt-BR')} Pts</strong>
                </div>
              </div>

              <button
                onClick={advanceToNextZone}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl cursor-pointer"
              >
                <Play size={16} fill="currentColor" /> Avançar para Zona {currentZoneIdx + 2}: {ZONES[currentZoneIdx + 1]?.name}
              </button>
            </div>
          )}

          {/* TELA DE VITÓRIA FINAL */}
          {gameState === 'victory' && (
            <div className="absolute inset-0 z-30 bg-gradient-to-b from-slate-950/95 via-indigo-950/95 to-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
              <Crown size={48} className="text-amber-400 mb-3 animate-bounce" />
              <h2 className="text-3xl md:text-5xl font-black text-white mb-2">
                VITÓRIA CELESTIAL COMPLETA!
              </h2>
              <p className="text-xs md:text-sm text-amber-200 max-w-lg mb-6">
                Todas as 3 Zonas foram libertadas, os chefes das trevas foram vencidos e as almas foram resgatadas para o Reino!
              </p>

              <div className="grid grid-cols-2 gap-4 bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 max-w-md w-full mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pontuação Final</p>
                  <p className="text-2xl font-black text-amber-400">{score.toLocaleString('pt-BR')} Pts</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total de Almas Resgatadas</p>
                  <p className="text-2xl font-black text-sky-400">{totalRescuedAllZones}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => startNewGame(0)}
                  className="px-7 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={15} /> Jogar Novamente
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Voltar ao Menu
                </button>
              </div>
            </div>
          )}

          {/* TELA DE GAME OVER */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 z-30 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-4xl font-black text-rose-500 mb-2">FIM DE JORNADA</h2>
              <p className="text-xs text-slate-300 max-w-md mb-6">
                “Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.” (Isaías 41:10)
              </p>
              <p className="text-lg font-black text-amber-400 mb-6">
                Pontuação Alcançada: {score.toLocaleString('pt-BR')} Pts
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => startNewGame(currentZoneIdx)}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={15} /> Tentar Zona {currentZone.id} Novamente
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Menu Principal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
