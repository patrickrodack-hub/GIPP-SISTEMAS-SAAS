import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Music, Search, Folder, FolderCheck, SlidersHorizontal, ArrowLeft,
  Maximize2, Minimize2, Printer, Copy, RotateCcw, Type as TypeIcon,
  Play, Pause, Moon, Sun, ExternalLink, ShieldAlert, Sparkles,
  ChevronRight, Mic2, Disc3, Info, Eye, Share2, Check, Columns2,
  Expand, Shrink, Calendar, Clock, Users, CheckCircle2, AlertCircle, Clock3,
  Guitar
} from 'lucide-react';
import { ChurchContext } from '../context/ChurchContext';
import { 
  MusicaRepertorio, MUSICAS_REPERTORIO_PADRAO, PASTAS_REPERTORIO_PADRAO,
  checkIsMusicoOuLouvor, SetlistCulto, SETLISTS_PADRAO
} from '../data/repertorioData';
import { 
  transposeChordSheet, transposeNote, getSemitoneDifference, CHROMATIC_SHARPS,
  CAPO_FRETS, getCapoLabel, getCapoChordShapeKey, suggestCapo
} from '../utils/musicChords';
import { InteractiveWindow } from './InteractiveWindow';
import { CifraVisualizer } from './CifraVisualizer';
import { WorshipLiveReader } from './WorshipLiveReader';
import { WorshipMetronome } from './WorshipMetronome';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

interface PortalRepertorioProps {
  user: any;
  db: any;
  setView?: (view: string) => void;
  onClose?: () => void;
}

export const PortalRepertorio: React.FC<PortalRepertorioProps> = ({
  user,
  db,
  setView,
  onClose
}) => {
  const { 
    dbFirestore, appId, addToast, setPrintMode, setPrintData, setPreviewOpen 
  } = useContext(ChurchContext);

  // Estados de controle visual do módulo
  const [isHubMaximized, setIsHubMaximized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPasta, setSelectedPasta] = useState<string>('todas');
  const [selectedTomFilter, setSelectedTomFilter] = useState<string>('todos');

  // Músicas carregadas
  const [musicas, setMusicas] = useState<MusicaRepertorio[]>(() => {
    try {
      const saved = localStorage.getItem('louvor_musicas');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return (db?.louvor_musicas && Array.isArray(db.louvor_musicas) && db.louvor_musicas.length > 0)
      ? db.louvor_musicas
      : MUSICAS_REPERTORIO_PADRAO;
  });

  // Equipe de músicos (para verificação de permissão em tempo real)
  const [musicos, setMusicos] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('louvor_musicos');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return (db?.louvor_musicos && Array.isArray(db.louvor_musicos)) ? db.louvor_musicos : [];
  });

  // Pastas cadastradas
  const [pastasRepertorio, setPastasRepertorio] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('louvor_pastas_repertorio');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return PASTAS_REPERTORIO_PADRAO;
  });

  // Modal / InteractiveWindow de visualização detalhada da canção
  const [activeModalSong, setActiveModalSong] = useState<MusicaRepertorio | null>(null);
  
  // Setlists do Ministério de Louvor
  const [setlists, setSetlists] = useState<SetlistCulto[]>(() => {
    try {
      const saved = localStorage.getItem('louvor_setlists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return SETLISTS_PADRAO;
  });
  const [activeLiveSetlist, setActiveLiveSetlist] = useState<SetlistCulto | null>(null);
  const [portalTab, setPortalTab] = useState<'setlists' | 'musicas'>('setlists');

  // Modo Tela Cheia Dedicada para a Letra & Cifra da Música
  const [isSongFullscreen, setIsSongFullscreen] = useState<boolean>(false);
  const [twoColumns, setTwoColumns] = useState<boolean>(false);

  // Mapas de transposição, tamanho de fonte e capotraste por canção
  const [songTransposeMap, setSongTransposeMap] = useState<Record<string, number>>({});
  const [songFontSizeMap, setSongFontSizeMap] = useState<Record<string, number>>({});
  const [songCapoMap, setSongCapoMap] = useState<Record<string, number>>({});
  const [applyCapoToChords, setApplyCapoToChords] = useState<boolean>(true);

  // Modo Palco (Dark Mode de Alto Contraste para palco)
  const [stageMode, setStageMode] = useState<boolean>(() => {
    return localStorage.getItem('gipp_repertorio_stage_mode') === 'true';
  });

  // Auto-scroll para músicos no palco/ensaio
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1); // 1 = lento, 2 = médio, 3 = rápido
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollFullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnimRef = useRef<number | null>(null);

  // Listener para tecla ESC para sair da tela cheia
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSongFullscreen) {
        setIsSongFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSongFullscreen]);

  // Sincronização em tempo real via Firestore
  useEffect(() => {
    if (!dbFirestore || !appId) return;

    try {
      const musicasRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_musicas');
      const unsubMusicas = onSnapshot(musicasRef, (snapshot) => {
        const list: MusicaRepertorio[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        if (list.length > 0) {
          setMusicas(list);
          try { localStorage.setItem('louvor_musicas', JSON.stringify(list)); } catch (_) {}
        }
      }, (err) => console.warn("Erro ao ouvir musicas do repertorio:", err));

      const musicosRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_musicos');
      const unsubMusicos = onSnapshot(musicosRef, (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setMusicos(list);
        try { localStorage.setItem('louvor_musicos', JSON.stringify(list)); } catch (_) {}
      }, (err) => console.warn("Erro ao ouvir musicos de louvor:", err));

      const setlistsRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_setlists');
      const unsubSetlists = onSnapshot(setlistsRef, (snapshot) => {
        const list: SetlistCulto[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        if (list.length > 0) {
          list.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
          setSetlists(list);
          try { localStorage.setItem('louvor_setlists', JSON.stringify(list)); } catch (_) {}
        }
      }, (err) => console.warn("Erro ao ouvir setlists:", err));

      return () => {
        unsubMusicas();
        unsubMusicos();
        unsubSetlists();
      };
    } catch (err) {
      console.warn("Firestore listener initialization skipped:", err);
    }
  }, [dbFirestore, appId]);

  // Persistir preferência do modo palco
  const toggleStageMode = () => {
    setStageMode(prev => {
      const next = !prev;
      try { localStorage.setItem('gipp_repertorio_stage_mode', String(next)); } catch (_) {}
      return next;
    });
  };

  // Motor de Auto-Scroll suave para execução musical
  useEffect(() => {
    if (!isAutoScrolling || !activeModalSong) {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
      return;
    }

    let lastTime = performance.now();
    const scrollStep = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      const pixelsPerSec = scrollSpeed === 1 ? 22 : scrollSpeed === 2 ? 40 : 65;
      const scrollAmount = (pixelsPerSec * delta) / 1000;

      // Rolar o container ativo (modal regular ou tela cheia)
      const targetEl = isSongFullscreen 
        ? scrollFullscreenContainerRef.current 
        : scrollContainerRef.current;

      if (targetEl) {
        targetEl.scrollTop += scrollAmount;

        // Se chegou ao fim do documento, pausa suavemente
        const maxScroll = targetEl.scrollHeight - targetEl.clientHeight;
        if (targetEl.scrollTop >= maxScroll - 2) {
          setIsAutoScrolling(false);
          return;
        }
      }

      scrollAnimRef.current = requestAnimationFrame(scrollStep);
    };

    scrollAnimRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    };
  }, [isAutoScrolling, scrollSpeed, activeModalSong, isSongFullscreen]);

  // Verificação estrita de prerrogativa: Músico ou Equipe de Louvor
  const isAuthorizedMusico = useMemo(() => {
    return checkIsMusicoOuLouvor(user, db, musicos);
  }, [user, db, musicos]);

  // Lista consolidada de pastas (existentes nas músicas + padrão)
  const allFoldersList = useMemo(() => {
    const set = new Set<string>(pastasRepertorio);
    musicas.forEach(m => {
      if (m.pasta && m.pasta.trim()) set.add(m.pasta.trim());
    });
    return Array.from(set);
  }, [pastasRepertorio, musicas]);

  // Filtro de Músicas: Pesquisa por nome, artista ou letra + Pasta + Tom
  const filteredMusicas = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return musicas.filter(m => {
      // Filtro por pasta
      if (selectedPasta !== 'todas') {
        const pastaM = (m.pasta || 'Sem Pasta').trim();
        if (pastaM !== selectedPasta) return false;
      }

      // Filtro por tom
      if (selectedTomFilter !== 'todos') {
        if ((m.tom || '').toUpperCase() !== selectedTomFilter.toUpperCase()) return false;
      }

      // Pesquisa por nome, artista ou letra
      if (q) {
        const matchTitulo = (m.titulo || '').toLowerCase().includes(q);
        const matchArtista = (m.artista || '').toLowerCase().includes(q);
        const matchLetra = (m.letra_cifra || '').toLowerCase().includes(q);
        return matchTitulo || matchArtista || matchLetra;
      }

      return true;
    });
  }, [musicas, selectedPasta, selectedTomFilter, searchTerm]);

  // Fechar módulo e voltar
  const handleBack = () => {
    if (onClose) {
      onClose();
    } else if (setView) {
      setView('portal_home');
    }
  };

  // Impressão / PDF Oficial da Cifra com Suporte a Capotraste
  const handleImprimirCifra = (
    song: MusicaRepertorio, 
    semitones: number, 
    fontSize: number, 
    capoFret: number = 0, 
    applyCapo: boolean = true
  ) => {
    const originalTom = song.tom || 'G';
    const currentTom = transposeNote(originalTom, semitones);
    const shapeTom = capoFret > 0 ? getCapoChordShapeKey(currentTom, capoFret) : currentTom;
    const effectiveSemi = (capoFret > 0 && applyCapo) ? (semitones - capoFret) : semitones;
    const targetKey = (capoFret > 0 && applyCapo) ? shapeTom : currentTom;
    const transposedText = transposeChordSheet(song.letra_cifra || '', effectiveSemi, targetKey);

    if (setPrintMode && setPrintData) {
      setPrintMode('rel_cifra_musica');
      setPrintData({
        song: {
          ...song,
          tom: currentTom,
          forma_capo: capoFret > 0 ? shapeTom : undefined,
          letra_cifra: transposedText
        },
        semitones,
        fontSize,
        capoFret,
        chordShapeKey: shapeTom,
        applyCapoToChords: applyCapo,
        igreja: db?.igreja
      });
      if (setPreviewOpen) setPreviewOpen(true);
      addToast(`Cifra de "${song.titulo}" preparada em Tom de ${currentTom}${capoFret > 0 ? ` (Capo ${capoFret}ª casa - Forma ${shapeTom})` : ''}!`, "info");
    } else {
      window.print();
    }
  };

  // Copiar cifras para área de transferência
  const handleCopyChords = async (text: string, tom: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast(`Cifra copiada no tom ${tom}!`, "success");
    } catch (_) {
      addToast("Não foi possível copiar automaticamente. Selecione e copie o texto.", "warning");
    }
  };

  // Confirmação de presença do músico logado
  const handleConfirmPresencaMusico = async (setlistId: string, status: 'confirmado' | 'indisponivel') => {
    const userName = (user?.nome || user?.name || '').toLowerCase().trim();
    const targetSetlist = setlists.find(s => s.id === setlistId);
    if (!targetSetlist) return;

    const updatedEquipe = (targetSetlist.equipe_escalada || []).map(m => {
      const matchName = m.nome.toLowerCase().trim() === userName ||
        (m.membro_id && m.membro_id === user?.id) ||
        (m.membro_id && m.membro_id === user?.membro_id);
      if (matchName) {
        return { ...m, status };
      }
      return m;
    });

    const updatedSetlist: SetlistCulto = { 
      ...targetSetlist, 
      equipe_escalada: updatedEquipe, 
      updated_at: new Date().toISOString() 
    };

    if (dbFirestore && appId) {
      try {
        const { id, ...cloudData } = updatedSetlist;
        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'louvor_setlists', setlistId), cloudData);
      } catch (err) {
        console.error("Erro ao atualizar presença do músico no Firestore:", err);
      }
    }

    const updatedList = setlists.map(s => s.id === setlistId ? updatedSetlist : s);
    setSetlists(updatedList);
    try { localStorage.setItem('louvor_setlists', JSON.stringify(updatedList)); } catch (_) {}

    if (status === 'confirmado') {
      addToast("Presença confirmada no culto! Deus abençoe seu ministério.", "success");
    } else {
      addToast("Status registrado como indisponível para este culto.", "info");
    }
  };

  const handleShareWhatsAppSetlist = (sl: SetlistCulto) => {
    const dateFormatted = sl.data.split('-').reverse().join('/');
    let text = `🎼 *SETLIST & ESCALA DO CULTO*\n`;
    text += `🏛️ *${sl.titulo}*\n`;
    text += `📅 *Data:* ${dateFormatted} às ${sl.horario}h\n`;
    text += `🏷️ *Ocasião:* ${sl.tipo_culto}\n`;
    if (sl.tema_devocional) text += `📖 *Texto/Tema:* ${sl.tema_devocional}\n`;
    if (sl.lider_nome) text += `🎤 *Líder do Louvor:* ${sl.lider_nome}\n`;

    text += `\n👥 *EQUIPE ESCALADA:*\n`;
    sl.equipe_escalada?.forEach(e => {
      const icon = e.status === 'confirmado' ? '✅' : e.status === 'indisponivel' ? '❌' : '⏳';
      text += `• ${e.nome} - *${e.funcao}* (${icon} ${e.status})\n`;
    });

    text += `\n🎵 *ORDEM DO LOUVOR (SETLIST):*\n`;
    sl.itens?.forEach(item => {
      text += `${item.ordem}º. *${item.titulo}* - ${item.artista}\n`;
      text += `    🔑 *Tom:* ${item.tom_culto}${item.tom_culto !== item.tom_original ? ` (orig: ${item.tom_original})` : ''} | ⏱ *BPM:* ${item.bpm || '70'}\n`;
      if (item.momento_liturgico) text += `    ✨ *Momento:* ${item.momento_liturgico}\n`;
      if (item.ministro_vocal) text += `    🎤 *Vocal:* ${item.ministro_vocal}\n`;
      if (item.notas_arranjo) text += `    💡 *Arranjo:* ${item.notas_arranjo}\n`;
      text += `\n`;
    });

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      addToast('Roteiro copiado para a área de transferência!', 'success');
    }
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Se o usuário NÃO for integrante de louvor ou músico cadastrado
  if (!isAuthorizedMusico) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center p-6 font-sans">
        <div className="bg-white dark:bg-slate-900 max-w-lg w-full p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5 animate-entrance">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20 shadow-inner">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              Acesso Exclusivo
            </span>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">
              Módulo de Repertório & Cifras
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Este módulo é restrito exclusivamente aos integrantes escalados no Ministério de Louvor, instrumentistas e cantores cadastrados na congregação.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-left text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-white">
              <Info size={14} className="text-amber-600 shrink-0" /> Como obter acesso?
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Se você faz parte da equipe de louvor ou é músico da igreja, solicite ao líder do ministério ou à secretaria para atualizar sua função ou cadastro de músicos.
            </p>
          </div>

          <button
            onClick={handleBack}
            className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft size={15} /> Voltar ao Início do Portal
          </button>
        </div>
      </div>
    );
  }

  // Canção ativa no modal de cifra e tela cheia
  const activeSong = activeModalSong;
  const activeSemitones = activeSong ? (songTransposeMap[activeSong.id] || 0) : 0;
  const activeFontSize = activeSong ? (songFontSizeMap[activeSong.id] || 13) : 13;
  const activeOriginalKey = activeSong ? (activeSong.tom || 'G') : 'G';
  const activeCurrentKey = activeSong ? transposeNote(activeOriginalKey, activeSemitones) : 'G';
  
  // Capotraste da canção ativa
  const activeCapo = activeSong ? (songCapoMap[activeSong.id] || 0) : 0;
  // Tom da digitação no violão com o Capo (ex: Tom Real 'G', Capo 2 -> Forma 'F')
  const activeChordShapeKey = activeCapo > 0 
    ? getCapoChordShapeKey(activeCurrentKey, activeCapo) 
    : activeCurrentKey;
  // Semitons efetivos aplicados na cifra exibida
  const effectiveSemitones = (activeCapo > 0 && applyCapoToChords)
    ? (activeSemitones - activeCapo)
    : activeSemitones;
  const targetKeyForSheet = (activeCapo > 0 && applyCapoToChords)
    ? activeChordShapeKey
    : activeCurrentKey;
  const activeTransposedSheet = activeSong 
    ? transposeChordSheet(activeSong.letra_cifra || '', effectiveSemitones, targetKeyForSheet)
    : '';
  const capoSuggestion = activeSong ? suggestCapo(activeCurrentKey) : null;

  return (
    <div 
      id="module-portal-repertorio-container"
      className={`w-full bg-slate-100/60 dark:bg-slate-950 flex flex-col font-sans transition-all duration-300 ${
        isHubMaximized 
          ? 'fixed inset-0 z-[99999] w-screen h-screen overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-950' 
          : 'min-h-full h-full relative overflow-y-auto custom-scrollbar'
      }`}
    >
      {/* 1. BARRA SUPERIOR DE CONTROLE (Padronizada com a Loja Virtual) */}
      <div className="w-full bg-slate-900/95 border-b border-slate-800/90 px-4 md:px-8 py-3 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 shrink-0 shadow-lg text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center font-bold shadow-inner shrink-0">
            <Music size={18} />
          </div>
          <div>
            <h2 className="font-extrabold text-xs sm:text-sm text-white tracking-wide uppercase flex items-center gap-2">
              Repertório Musical & Cifras
              <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider hidden xs:inline-block">
                Portal do Músico
              </span>
              {isHubMaximized && (
                <span className="hidden sm:inline-flex text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Tela Cheia
                </span>
              )}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Adoração, Transposição de Tom, Cifras Oficiais e Pastas de Culto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHubMaximized(!isHubMaximized)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-extrabold flex items-center gap-2 transition-all border border-slate-700/60 cursor-pointer shadow-sm active:scale-95"
            title={isHubMaximized ? "Restaurar visualização padrão" : "Maximizar para modo palco/ensaio"}
          >
            {isHubMaximized ? (
              <>
                <Minimize2 size={14} className="text-violet-400" />
                <span className="hidden md:inline">Restaurar</span>
              </>
            ) : (
              <>
                <Maximize2 size={14} className="text-violet-400" />
                <span className="hidden md:inline">Maximizar</span>
              </>
            )}
          </button>

          <button
            onClick={handleBack}
            className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-extrabold flex items-center gap-1.5 transition-all border border-rose-500/30 cursor-pointer shadow-sm active:scale-95"
            title="Voltar ao início do portal"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Voltar ao Início</span>
          </button>
        </div>
      </div>

      {/* 2. CORPO PRINCIPAL DO MÓDULO */}
      <div className="flex-1 w-full max-w-[1800px] mx-auto p-3 sm:p-5 md:p-6 space-y-4 animate-entrance pb-24 md:pb-12">
        {/* BANNER PRINCIPAL DO REPERTÓRIO */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 shadow-md border border-violet-800/40">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-violet-800/80 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-violet-200 border border-violet-600/60">
                <Sparkles size={13} className="text-amber-400" /> Ministério de Louvor & Adoração
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                Repertório & Caderno de Cifras
              </h1>
              <p className="text-xs md:text-sm text-violet-200/90 font-medium leading-relaxed">
                Acesse todas as canções organizadas por culto, altere o tom em tempo real para o seu instrumento ou voz, e pratique com o motor oficial de cifras da igreja.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-violet-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mic2 size={14} className="text-amber-400" /> Transposição Imediata de Tom
                </span>
                <span className="flex items-center gap-1.5">
                  <Folder size={14} className="text-indigo-400" /> Pastas Oficiais de Culto
                </span>
                <span className="flex items-center gap-1.5">
                  <Disc3 size={14} className="text-emerald-400" /> Visualização Segura (Somente Leitura)
                </span>
              </div>
            </div>

            {/* BADGE DE MÚSICO ATIVO */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col items-center text-center shrink-0 w-full md:w-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-violet-200">
                Prerrogativa Confirmada
              </span>
              <span className="text-base font-black text-white mt-0.5">
                🎸 Músico / Louvor
              </span>
              <span className="text-[11px] text-emerald-400 font-bold mt-1 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {musicas.length} Canções Disponíveis
              </span>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS: SETLISTS DOS CULTOS / REPERTÓRIO COMPLETO */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setPortalTab('setlists')}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              portalTab === 'setlists'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.02]'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Play size={14} fill="currentColor" /> Setlists & Agenda dos Cultos
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              portalTab === 'setlists' ? 'bg-black/20 text-slate-950' : 'bg-amber-100 text-amber-800'
            }`}>
              {setlists.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPortalTab('musicas')}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              portalTab === 'musicas'
                ? 'bg-violet-600 text-white shadow-md scale-[1.02]'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Music size={14} /> Repertório Geral & Cifras
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              portalTab === 'musicas' ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'
            }`}>
              {musicas.length}
            </span>
          </button>
        </div>

        {/* ABA 1: SETLISTS & AGENDA DOS CULTOS AO VIVO */}
        {portalTab === 'setlists' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🎼 Programações & Escalas dos Cultos</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Consulte a ordem oficial dos hinos, os tons definidos para a celebração, notas de arranjo e confirme sua presença.
                </p>
              </div>
            </div>

            {setlists.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-2">
                <Music size={28} className="mx-auto text-slate-400" />
                <h4 className="text-sm font-black text-slate-700 dark:text-slate-200">Nenhuma Setlist cadastrada no momento</h4>
                <p className="text-xs text-slate-500">As escalas e canções de culto cadastradas pela liderança aparecerão aqui.</p>
              </div>
            ) : (
              setlists.map(sl => {
                const dateFormatted = sl.data.split('-').reverse().join('/');
                const currentUserName = (user?.nome || user?.name || '').toLowerCase().trim();
                const myEscala = (sl.equipe_escalada || []).find(m => 
                  m.nome.toLowerCase().trim() === currentUserName ||
                  (m.membro_id && m.membro_id === user?.id) ||
                  (m.membro_id && m.membro_id === user?.membro_id)
                );

                return (
                  <div
                    key={sl.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition"
                  >
                    {/* Top Row: Service details & Action buttons */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                            <Calendar size={13} /> {dateFormatted} às {sl.horario}h
                          </span>
                          <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg">
                            {sl.tipo_culto}
                          </span>
                          {sl.tempo_total_estimado ? (
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                              ⏱ ~{sl.tempo_total_estimado} min
                            </span>
                          ) : null}
                        </div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          {sl.titulo}
                        </h2>
                        {sl.tema_devocional && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold italic">
                            📖 {sl.tema_devocional}
                          </p>
                        )}
                        {sl.lider_nome && (
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                            🎤 Ministro(a): {sl.lider_nome}
                          </p>
                        )}
                      </div>

                      {/* Main Action: Tocar Setlist */}
                      <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                        <button
                          type="button"
                          onClick={() => setActiveLiveSetlist(sl)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-sm cursor-pointer active:scale-95"
                          title="Abrir Modo Culto ao Vivo com Cifras e Sequência"
                        >
                          <Play size={15} fill="currentColor" /> Tocar Setlist (Modo Culto)
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareWhatsAppSetlist(sl)}
                          className="flex items-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs rounded-xl transition"
                          title="Compartilhar no WhatsApp"
                        >
                          <Share2 size={14} /> WhatsApp
                        </button>
                      </div>
                    </div>

                    {/* Musician Attendance Highlight Box */}
                    {myEscala && (
                      <div className="bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                            Sua Escala para este Culto
                          </span>
                          <strong className="text-sm font-black text-slate-900 dark:text-white">
                            Você está escalado(a) como {myEscala.funcao}!
                          </strong>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block">
                            Status atual: <strong className="uppercase">{myEscala.status}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleConfirmPresencaMusico(sl.id, 'confirmado')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition ${
                              myEscala.status === 'confirmado'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-300 hover:bg-emerald-50'
                            }`}
                          >
                            <CheckCircle2 size={13} /> Confirmar Presença
                          </button>

                          <button
                            type="button"
                            onClick={() => handleConfirmPresencaMusico(sl.id, 'indisponivel')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition ${
                              myEscala.status === 'indisponivel'
                                ? 'bg-rose-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 border border-rose-300 hover:bg-rose-50'
                            }`}
                          >
                            <AlertCircle size={13} /> Não poderei ir
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Songs Sequence & Team Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Songs list (8 cols) */}
                      <div className="lg:col-span-8 space-y-2">
                        <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
                          Ordem das Canções ({sl.itens.length}) • Clique para ver a cifra
                        </div>

                        <div className="space-y-2">
                          {sl.itens.map((it, idx) => {
                            const catalogSong = musicas.find(m => m.id === it.musica_id || m.titulo.toLowerCase().trim() === it.titulo.toLowerCase().trim());
                            
                            return (
                              <div
                                key={it.id || idx}
                                onClick={() => {
                                  if (catalogSong) {
                                    setActiveModalSong(catalogSong);
                                  } else {
                                    setActiveLiveSetlist(sl);
                                  }
                                }}
                                className="bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/70 dark:hover:bg-slate-800 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 transition cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 group"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-700 text-white text-xs font-black flex items-center justify-center shrink-0 group-hover:bg-violet-600 transition">
                                    {it.ordem || idx + 1}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-violet-600 transition">
                                        {it.titulo}
                                      </span>
                                      <span className="text-xs text-slate-500">({it.artista})</span>
                                      {it.momento_liturgico && (
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/70 text-violet-800 dark:text-violet-300">
                                          {it.momento_liturgico}
                                        </span>
                                      )}
                                    </div>
                                    {it.notas_arranjo && (
                                      <p className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold mt-0.5">
                                        💡 {it.notas_arranjo}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                  <span className="text-xs font-black font-mono bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-800">
                                    Tom: {it.tom_culto}
                                    {it.tom_culto !== it.tom_original && (
                                      <span className="text-[10px] opacity-75 font-normal ml-1">
                                        (orig: {it.tom_original})
                                      </span>
                                    )}
                                  </span>
                                  {it.bpm && (
                                    <span className="text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold">
                                      {it.bpm} BPM
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Musician Schedule (4 cols) */}
                      <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Users size={14} className="text-violet-600" />
                            Agenda dos Músicos
                          </h4>
                          <span className="text-[10px] font-bold text-slate-500">
                            {sl.equipe_escalada?.length || 0} escalados
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {(sl.equipe_escalada || []).map((musico, mIdx) => (
                            <div
                              key={mIdx}
                              className="bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div className="truncate pr-2">
                                <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{musico.nome}</span>
                                <span className="text-[10px] text-slate-500 font-medium">{musico.funcao}</span>
                              </div>

                              <div className="shrink-0">
                                {musico.status === 'confirmado' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 size={11} /> Confirmado
                                  </span>
                                )}
                                {musico.status === 'pendente' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                                    <Clock3 size={11} /> Pendente
                                  </span>
                                )}
                                {musico.status === 'indisponivel' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                                    <AlertCircle size={11} /> Ausente
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ABA 2: REPERTÓRIO GERAL & CIFRAS */}
        {portalTab === 'musicas' && (
          <>
        {/* 3. BARRA DE PESQUISA, PASTAS E FILTRO DE TOM (Formulários no Padrão da Loja Virtual) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Input de Pesquisa por Nome/Artista/Letra */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Pesquisar música por nome, artista ou trecho da letra..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Filtro Rápido por Tom */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Music size={13} className="text-violet-600" /> Tom:
              </span>
              <select
                value={selectedTomFilter}
                onChange={e => setSelectedTomFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="todos">Todos os Tons</option>
                {CHROMATIC_SHARPS.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pastas Pills com rolagem horizontal fluida (Idêntico às Categorias da Loja Virtual) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => setSelectedPasta('todas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                selectedPasta === 'todas'
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Music size={13} /> Todas as Pastas ({musicas.length})
            </button>

            {allFoldersList.map(pasta => {
              const count = musicas.filter(m => (m.pasta || 'Sem Pasta').trim() === pasta).length;
              return (
                <button
                  key={pasta}
                  onClick={() => setSelectedPasta(pasta)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                    selectedPasta === pasta
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Folder size={13} /> {pasta} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. GRADE DE MÚSICAS DO REPERTÓRIO */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
            <span>
              Exibindo <strong className="text-slate-800 dark:text-white font-bold">{filteredMusicas.length}</strong> música(s)
              {selectedPasta !== 'todas' && ` na pasta "${selectedPasta}"`}
              {selectedTomFilter !== 'todos' && ` com tom ${selectedTomFilter}`}
            </span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
              <Eye size={12} /> Clique na canção para abrir a cifra completa
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredMusicas.map(song => {
              const semitones = songTransposeMap[song.id] || 0;
              const originalKey = song.tom || 'G';
              const currentKey = transposeNote(originalKey, semitones);
              const songCapo = songCapoMap[song.id] || 0;
              const songShape = songCapo > 0 ? getCapoChordShapeKey(currentKey, songCapo) : currentKey;

              return (
                <div
                  key={song.id}
                  onClick={() => setActiveModalSong(song)}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs hover:shadow-md hover:border-violet-400/80 transition-all cursor-pointer group flex flex-col justify-between space-y-3 transform active:scale-[0.99]"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-md border border-violet-200/60 dark:border-violet-800">
                          {song.pasta || 'Geral'}
                        </span>
                        <h3 className="font-black text-sm sm:text-base text-slate-800 dark:text-white mt-1 group-hover:text-violet-600 transition-colors leading-tight">
                          {song.titulo}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          {song.artista || 'Artista Consagrado'}
                        </p>
                      </div>

                      {/* Badge de Tom e Capo */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="text-xs font-black bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 px-2.5 py-1 rounded-xl block shadow-2xs">
                          Tom: {currentKey}
                        </span>
                        {semitones !== 0 && (
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 block font-mono">
                            ({semitones > 0 ? `+${semitones}` : semitones}st)
                          </span>
                        )}
                        {songCapo > 0 && (
                          <span className="text-[10px] font-black bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                            <Guitar size={10} /> Capo {songCapo}ª ({songShape})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tags secundárias: Ritmo / BPM */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {song.ritmo && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          🎵 {song.ritmo}
                        </span>
                      )}
                      {song.bpm && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          ⏱️ {song.bpm} BPM
                        </span>
                      )}
                      {song.arquivos && song.arquivos.length > 0 && (
                        <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md">
                          📎 {song.arquivos.length} anexo(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rodapé do Card com Ação Rápida */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-violet-600 dark:text-violet-400">
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Visualizar Cifra
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalSong(song);
                          setIsSongFullscreen(true);
                        }}
                        className="px-2 py-1 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 dark:hover:bg-violet-900/80 text-violet-700 dark:text-violet-300 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all border border-violet-200 dark:border-violet-800"
                        title="Abrir diretamente em Tela Cheia"
                      >
                        <Maximize2 size={11} /> Tela Cheia
                      </button>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMusicas.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <Music size={36} className="text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                Nenhuma música encontrada com os filtros selecionados
              </h4>
              <p className="text-xs text-slate-400">
                Tente alterar a pasta selecionada ou limpar o termo de pesquisa.
              </p>
              {(searchTerm || selectedPasta !== 'todas' || selectedTomFilter !== 'todos') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedPasta('todas');
                    setSelectedTomFilter('todos');
                  }}
                  className="px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Limpar Todos os Filtros
                </button>
              )}
            </div>
          )}
        </div>
        </>
        )}
      </div>

      {/* 5. MODAL DA CIFRA (InteractiveWindow com suporte a Tela Cheia e CifraVisualizer) */}
      {activeSong && !isSongFullscreen && createPortal(
        <InteractiveWindow
          id={`repertorio_cifra_window_${activeSong.id}`}
          title={`${activeSong.titulo} • ${activeSong.artista || 'Consagrado'}`}
          subtitle={`Tom Atual: ${activeCurrentKey} ${activeSemitones !== 0 ? `(${activeSemitones > 0 ? `+${activeSemitones}` : activeSemitones}st)` : ''} ${activeCapo > 0 ? `• Capo ${activeCapo}ª casa (${applyCapoToChords ? `Forma: ${activeChordShapeKey}` : 'Tom Real'})` : ''} • Pasta: ${activeSong.pasta || 'Geral'}`}
          onClose={() => {
            setActiveModalSong(null);
            setIsAutoScrolling(false);
          }}
          icon={Music}
          headerBg={stageMode ? 'from-slate-900 via-zinc-900 to-black' : 'from-violet-800 via-indigo-900 to-slate-900'}
          defaultWidth={960}
          defaultHeight={760}
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Tom Original: <strong className="text-slate-700 dark:text-slate-200">{activeOriginalKey}</strong>
                </span>
                {(activeSemitones !== 0 || activeCapo !== 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSongTransposeMap(prev => ({ ...prev, [activeSong.id]: 0 }));
                      setSongCapoMap(prev => ({ ...prev, [activeSong.id]: 0 }));
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer ml-1"
                  >
                    <RotateCcw size={11} /> Restaurar Tom & Capo ({activeOriginalKey})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSongFullscreen(true)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  title="Abrir letra e cifras em Tela Cheia"
                >
                  <Maximize2 size={13} /> Abrir em Tela Cheia
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyChords(activeTransposedSheet, activeCurrentKey)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="Copiar letra com cifras transpostas"
                >
                  <Copy size={13} /> Copiar Cifra
                </button>

                <button
                  type="button"
                  onClick={() => handleImprimirCifra(activeSong, activeSemitones, activeFontSize, activeCapo, applyCapoToChords)}
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  title="Imprimir ou gerar PDF formatado"
                >
                  <Printer size={13} /> Imprimir / PDF
                </button>
              </div>
            </div>
          }
        >
          <div className={`p-4 sm:p-5 space-y-4 flex flex-col h-full ${stageMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100'}`}>
            {/* PAINEL DE FERRAMENTAS MUSICAIS: TRANSPOSIÇÃO, CAPOTRASTE, FONTE, TELA CHEIA, ROLAGEM E MODO PALCO */}
            <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-2xs ${
              stageMode 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-100' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white'
            }`}>
              {/* 1. SELETOR E BOTÕES DE TRANSPOSIÇÃO DE TOM */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1 mr-0.5">
                  <Music size={13} /> Tom:
                </span>

                <button
                  type="button"
                  onClick={() => setSongTransposeMap(prev => ({ ...prev, [activeSong.id]: activeSemitones - 1 }))}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-black rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-600"
                  title="Baixar 1 semitom (-1)"
                >
                  -1
                </button>

                <div className="flex items-center gap-1 bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-950 dark:text-violet-200 px-2.5 py-1 rounded-lg font-black text-xs">
                  <span>{activeCurrentKey}</span>
                  {activeSemitones !== 0 && (
                    <span className="text-[9px] text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1 rounded font-mono">
                      ({activeSemitones > 0 ? `+${activeSemitones}` : activeSemitones}st)
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSongTransposeMap(prev => ({ ...prev, [activeSong.id]: activeSemitones + 1 }))}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-black rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-600"
                  title="Subir 1 semitom (+1)"
                >
                  +1
                </button>

                {/* Seletor direto do tom desejado */}
                <select
                  value={activeCurrentKey}
                  onChange={(e) => {
                    const diff = getSemitoneDifference(activeOriginalKey, e.target.value);
                    setSongTransposeMap(prev => ({ ...prev, [activeSong.id]: diff }));
                  }}
                  className="text-[11px] font-bold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-slate-800 dark:text-white outline-none cursor-pointer"
                  title="Mudar para tom direto"
                >
                  {CHROMATIC_SHARPS.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              {/* 1.1 SELETOR E TRANSPOSIÇÃO COM CAPOTRASTE (CAPO) */}
              <div className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/15 p-1 rounded-xl border border-amber-300 dark:border-amber-700/60 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1 px-1">
                  <Guitar size={13} /> Capo:
                </span>

                <button
                  type="button"
                  onClick={() => setSongCapoMap(prev => ({ ...prev, [activeSong.id]: Math.max(0, activeCapo - 1) }))}
                  disabled={activeCapo <= 0}
                  className="w-7 h-7 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-800 dark:text-white font-black rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-2xs"
                  title="Descer 1 casa do Capo"
                >
                  -
                </button>

                <div className={`px-2 py-0.5 rounded-lg font-black text-xs flex items-center gap-1 border ${
                  activeCapo > 0
                    ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                    : 'bg-white dark:bg-slate-800 border-amber-200/60 dark:border-amber-900 text-slate-600 dark:text-slate-400'
                }`}>
                  <span>{activeCapo > 0 ? `${activeCapo}ª casa` : 'Sem Capo'}</span>
                  {activeCapo > 0 && (
                    <span className="text-[9px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/80 px-1 rounded">
                      {activeChordShapeKey}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSongCapoMap(prev => ({ ...prev, [activeSong.id]: Math.min(11, activeCapo + 1) }))}
                  disabled={activeCapo >= 11}
                  className="w-7 h-7 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-800 dark:text-white font-black rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-2xs"
                  title="Subir 1 casa do Capo"
                >
                  +
                </button>

                <select
                  value={activeCapo}
                  onChange={(e) => setSongCapoMap(prev => ({ ...prev, [activeSong.id]: parseInt(e.target.value) || 0 }))}
                  className="text-[11px] font-bold bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg px-2 py-1 text-slate-800 dark:text-white outline-none cursor-pointer"
                  title="Selecionar casa do Capotraste"
                >
                  <option value={0}>Sem Capo</option>
                  {Array.from({ length: 11 }, (_, i) => i + 1).map(f => (
                    <option key={f} value={f}>
                      {f}ª casa ({getCapoChordShapeKey(activeCurrentKey, f)})
                    </option>
                  ))}
                </select>

                {activeCapo > 0 && (
                  <button
                    type="button"
                    onClick={() => setSongCapoMap(prev => ({ ...prev, [activeSong.id]: 0 }))}
                    className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs cursor-pointer"
                    title="Remover Capotraste"
                  >
                    <RotateCcw size={12} />
                  </button>
                )}
              </div>

              {/* Sugestão Rápida de Capo Inteligente */}
              {capoSuggestion && activeCapo === 0 && (
                <button
                  type="button"
                  onClick={() => setSongCapoMap(prev => ({ ...prev, [activeSong.id]: capoSuggestion.fret }))}
                  className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 px-2 py-1 rounded-xl flex items-center gap-1 hover:bg-amber-200 dark:hover:bg-amber-900 transition cursor-pointer shadow-2xs"
                  title={capoSuggestion.reason}
                >
                  <Sparkles size={11} className="text-amber-500 shrink-0" />
                  <span>Dica: Capo {capoSuggestion.fret}ª ({capoSuggestion.shape})</span>
                </button>
              )}

              {/* 2. CONTROLE DO TAMANHO DA FONTE */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1">
                  <TypeIcon size={13} /> Fonte:
                </span>
                <button
                  type="button"
                  onClick={() => setSongFontSizeMap(prev => ({ ...prev, [activeSong.id]: Math.max(9, activeFontSize - 1) }))}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-black rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-600"
                  title="Diminuir tamanho da letra"
                >
                  A-
                </button>
                <span className="font-mono font-bold text-xs px-1 text-slate-700 dark:text-slate-300">
                  {activeFontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => setSongFontSizeMap(prev => ({ ...prev, [activeSong.id]: Math.min(26, activeFontSize + 1) }))}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-black rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-600"
                  title="Aumentar tamanho da letra"
                >
                  A+
                </button>
              </div>

              {/* 3. METRÔNOMO VISUAL */}
              <div className="flex items-center">
                <WorshipMetronome 
                  compact 
                  initialBpm={activeSong.bpm ? parseInt(activeSong.bpm) : 72} 
                />
              </div>

              {/* 4. BOTÃO ABRIR EM TELA CHEIA */}
              <button
                type="button"
                onClick={() => setIsSongFullscreen(true)}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                title="Visualizar em Tela Cheia (Modo Palco/Ensaio)"
              >
                <Maximize2 size={13} />
                <span>Tela Cheia</span>
              </button>

              {/* 5. AUTO-SCROLL (ROLAGEM AUTOMÁTICA PARA MÚSICOS EM PALCO) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isAutoScrolling
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-200'
                  }`}
                  title={isAutoScrolling ? "Pausar rolagem automática" : "Iniciar rolagem automática"}
                >
                  {isAutoScrolling ? <Pause size={12} className="animate-pulse" /> : <Play size={12} />}
                  <span className="hidden xs:inline">Auto-Scroll</span>
                </button>

                {isAutoScrolling && (
                  <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg border border-slate-200 dark:border-slate-600">
                    {[1, 2, 3].map(spd => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setScrollSpeed(spd)}
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                          scrollSpeed === spd 
                            ? 'bg-violet-600 text-white' 
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                        title={`Velocidade ${spd}x`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. MODO PALCO (ALTO CONTRASTE / TEMA NOTURNO DE PALCO) */}
              <button
                type="button"
                onClick={toggleStageMode}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  stageMode
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-200'
                }`}
                title="Alternar Modo Palco (Evita reflexo e melhora contraste em cultos)"
              >
                {stageMode ? <Sun size={12} /> : <Moon size={12} />}
                <span className="hidden xs:inline">Modo Palco</span>
              </button>
            </div>

            {/* ANEXOS E MÍDIAS DA MÚSICA (SE HOUVER) */}
            {activeSong.arquivos && activeSong.arquivos.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Disc3 size={13} className="text-violet-600" /> Links & Gravações:
                </span>
                {activeSong.arquivos.map((arq, idx) => (
                  <a
                    key={idx}
                    href={arq.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 rounded-lg hover:underline font-bold"
                  >
                    <ExternalLink size={11} /> {arq.nome || `Anexo ${idx + 1}`}
                  </a>
                ))}
              </div>
            )}

            {/* BANNER DE INFORMAÇÃO DO CAPOTRASTE (SE ATIVO) */}
            {activeCapo > 0 && (
              <div className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 select-none shadow-2xs ${
                stageMode
                  ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                  : 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <Guitar size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-wide flex items-center gap-2">
                      <span>Capotraste na {activeCapo}ª Casa</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100">
                        {applyCapoToChords ? `Forma dos acordes: ${activeChordShapeKey}` : `Tom Real: ${activeCurrentKey}`}
                      </span>
                    </div>
                    <p className="text-[10px] opacity-80 mt-0.5">
                      {applyCapoToChords 
                        ? `Cifras adaptadas para a digitação no violão em ${activeChordShapeKey}. Afinação soando em ${activeCurrentKey}.` 
                        : `Cifras mantidas no tom real (${activeCurrentKey}). Posicione a braçadeira na ${activeCapo}ª casa.`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyCapoToChords(!applyCapoToChords)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer border ${
                      applyCapoToChords 
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black shadow-2xs' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                    }`}
                    title="Alternar entre ver as formas de digitação do violão ou os acordes no tom real"
                  >
                    {applyCapoToChords ? '✓ Formas do Violão' : 'Tom Real'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSongCapoMap(prev => ({ ...prev, [activeSong.id]: 0 }))}
                    className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer px-1"
                    title="Remover Capotraste"
                  >
                    Remover
                  </button>
                </div>
              </div>
            )}

            {/* VISUALIZADOR DA LETRA E CIFRA COM NOTAS DESTACADAS EM LARANJA */}
            <div 
              ref={scrollContainerRef}
              className={`flex-1 overflow-y-auto custom-scrollbar p-5 rounded-2xl border shadow-inner transition-colors duration-200 ${
                stageMode
                  ? 'bg-black border-zinc-800 text-zinc-100 font-mono select-text'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-mono select-text'
              }`}
              style={{ minHeight: '380px' }}
            >
              <CifraVisualizer 
                cifraText={activeTransposedSheet} 
                fontSize={activeFontSize} 
                stageMode={stageMode} 
                twoColumns={twoColumns} 
              />
            </div>
          </div>
        </InteractiveWindow>,
        document.body
      )}

      {/* 6. MODO TELA CHEIA IMERSIVA DA LETRA E CIFRA (FULLSCREEN READER DEDICADO) */}
      {activeSong && isSongFullscreen && createPortal(
        <div 
          id="repertorio-cifra-fullscreen-portal"
          className={`fixed inset-0 z-[999999] w-screen h-screen flex flex-col font-sans transition-colors duration-200 animate-fadeIn ${
            stageMode 
              ? 'bg-black text-zinc-100' 
              : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100'
          }`}
        >
          {/* BARRA SUPERIOR DA TELA CHEIA (CONTROLE COMPACTO E IMERSIVO) */}
          <div className={`w-full border-b px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md shrink-0 shadow-xs z-50 transition-colors ${
            stageMode
              ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100'
              : 'bg-white/95 dark:bg-slate-950/95 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
          }`}>
            {/* Título da Música e Tom */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold shrink-0">
                <Music size={16} />
              </div>
              <div>
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-wide flex items-center gap-2 flex-wrap">
                  <span>{activeSong.titulo}</span>
                  <span className="text-[10px] bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Tom: {activeCurrentKey}
                  </span>
                  {activeCapo > 0 && (
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-full font-black flex items-center gap-1 shadow-2xs">
                      <Guitar size={11} /> Capo {activeCapo}ª ({applyCapoToChords ? `Forma: ${activeChordShapeKey}` : 'Tom Real'})
                    </span>
                  )}
                  {activeSong.pasta && (
                    <span className="hidden md:inline-block text-[10px] bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 px-2 py-0.5 rounded-full font-bold">
                      {activeSong.pasta}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
                  {activeSong.artista || 'Ministério de Louvor'} • Tom Original: {activeOriginalKey}
                </p>
              </div>
            </div>

            {/* BARRA DE FERRAMENTAS COMPLETA DA TELA CHEIA */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Transposição de Tom */}
              <div className={`flex items-center gap-1 rounded-xl p-1 border ${
                stageMode 
                  ? 'bg-zinc-900 border-zinc-800' 
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}>
                <span className="text-[10px] font-black uppercase text-orange-600 dark:text-orange-400 px-1 hidden sm:inline">
                  Tom:
                </span>
                <button
                  type="button"
                  onClick={() => setSongTransposeMap(prev => ({ ...prev, [activeSong.id]: activeSemitones - 1 }))}
                  className="w-7 h-7 bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-2xs"
                  title="Baixar 1 semitom (-1)"
                >
                  -1
                </button>
                <div className="px-2 py-0.5 bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300 rounded font-black text-xs flex items-center gap-1">
                  <span>{activeCurrentKey}</span>
                  {activeSemitones !== 0 && (
                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono">
                      ({activeSemitones > 0 ? `+${activeSemitones}` : activeSemitones}st)
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSongTransposeMap(prev => ({ ...prev, [activeSong.id]: activeSemitones + 1 }))}
                  className="w-7 h-7 bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-2xs"
                  title="Subir 1 semitom (+1)"
                >
                  +1
                </button>
                <select
                  value={activeCurrentKey}
                  onChange={(e) => {
                    const diff = getSemitoneDifference(activeOriginalKey, e.target.value);
                    setSongTransposeMap(prev => ({ ...prev, [activeSong.id]: diff }));
                  }}
                  className="text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white outline-none cursor-pointer"
                  title="Mudar tom direto"
                >
                  {CHROMATIC_SHARPS.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                {activeSemitones !== 0 && (
                  <button
                    type="button"
                    onClick={() => setSongTransposeMap(prev => ({ ...prev, [activeSong.id]: 0 }))}
                    className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs cursor-pointer"
                    title={`Restaurar tom original (${activeOriginalKey})`}
                  >
                    <RotateCcw size={12} />
                  </button>
                )}
              </div>

              {/* Transposição com Capotraste (Capo) */}
              <div className={`flex items-center gap-1 rounded-xl p-1 border ${
                stageMode 
                  ? 'bg-zinc-900 border-zinc-800' 
                  : 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-300/80 dark:border-amber-700/60'
              }`}>
                <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 px-1 flex items-center gap-1">
                  <Guitar size={13} />
                  <span className="hidden sm:inline">Capo:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSongCapoMap(prev => ({ ...prev, [activeSong.id]: Math.max(0, activeCapo - 1) }))}
                  disabled={activeCapo <= 0}
                  className="w-7 h-7 bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-900 dark:text-white font-black rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-2xs"
                  title="Descer 1 casa do Capo"
                >
                  -
                </button>
                <div className={`px-2 py-0.5 rounded font-black text-xs flex items-center gap-1 border ${
                  activeCapo > 0
                    ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  <span>{activeCapo > 0 ? `${activeCapo}ª casa` : 'Sem Capo'}</span>
                  {activeCapo > 0 && (
                    <span className="text-[9px] font-mono text-amber-800 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/80 px-1 rounded font-bold">
                      {activeChordShapeKey}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSongCapoMap(prev => ({ ...prev, [activeSong.id]: Math.min(11, activeCapo + 1) }))}
                  disabled={activeCapo >= 11}
                  className="w-7 h-7 bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-900 dark:text-white font-black rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-2xs"
                  title="Subir 1 casa do Capo"
                >
                  +
                </button>
                <select
                  value={activeCapo}
                  onChange={(e) => setSongCapoMap(prev => ({ ...prev, [activeSong.id]: parseInt(e.target.value) || 0 }))}
                  className="text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white outline-none cursor-pointer"
                  title="Selecionar casa do Capotraste"
                >
                  <option value={0}>Sem Capo</option>
                  {Array.from({ length: 11 }, (_, i) => i + 1).map(f => (
                    <option key={f} value={f}>
                      {f}ª casa ({getCapoChordShapeKey(activeCurrentKey, f)})
                    </option>
                  ))}
                </select>
                {activeCapo > 0 && (
                  <button
                    type="button"
                    onClick={() => setSongCapoMap(prev => ({ ...prev, [activeSong.id]: 0 }))}
                    className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs cursor-pointer"
                    title="Remover Capotraste"
                  >
                    <RotateCcw size={12} />
                  </button>
                )}
              </div>

              {/* Sugestão Rápida de Capo */}
              {capoSuggestion && activeCapo === 0 && (
                <button
                  type="button"
                  onClick={() => setSongCapoMap(prev => ({ ...prev, [activeSong.id]: capoSuggestion.fret }))}
                  className="hidden xl:inline-flex text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 px-2 py-1 rounded-xl items-center gap-1 hover:bg-amber-200 transition cursor-pointer shadow-2xs"
                  title={capoSuggestion.reason}
                >
                  <Sparkles size={11} className="text-amber-500 shrink-0" />
                  <span>Dica: Capo {capoSuggestion.fret}ª ({capoSuggestion.shape})</span>
                </button>
              )}

              {/* Tamanho da Fonte */}
              <div className={`flex items-center gap-1 rounded-xl p-1 border ${
                stageMode 
                  ? 'bg-zinc-900 border-zinc-800' 
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setSongFontSizeMap(prev => ({ ...prev, [activeSong.id]: Math.max(10, activeFontSize - 1) }))}
                  className="w-7 h-7 bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-2xs"
                  title="Diminuir fonte"
                >
                  A-
                </button>
                <span className="font-mono font-bold text-xs px-1 text-slate-700 dark:text-slate-300">
                  {activeFontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => setSongFontSizeMap(prev => ({ ...prev, [activeSong.id]: Math.min(32, activeFontSize + 1) }))}
                  className="w-7 h-7 bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black rounded-lg text-xs transition active:scale-95 cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-2xs"
                  title="Aumentar fonte"
                >
                  A+
                </button>
              </div>

              {/* Alternador de 1 / 2 Colunas */}
              <button
                type="button"
                onClick={() => setTwoColumns(!twoColumns)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  twoColumns 
                    ? 'bg-violet-600 text-white border-violet-500 shadow-sm' 
                    : stageMode
                      ? 'bg-zinc-900 text-zinc-300 hover:text-white border-zinc-800'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
                title="Alternar entre 1 coluna e 2 colunas para telas largas"
              >
                <Columns2 size={13} />
                <span className="hidden md:inline">{twoColumns ? '2 Colunas' : '1 Coluna'}</span>
              </button>

              {/* Auto-Scroll */}
              <div className={`flex items-center gap-1 rounded-xl p-1 border ${
                stageMode 
                  ? 'bg-zinc-900 border-zinc-800' 
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isAutoScrolling
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : stageMode
                        ? 'bg-zinc-800 text-zinc-300 hover:text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 shadow-2xs'
                  }`}
                  title={isAutoScrolling ? "Pausar rolagem automática" : "Iniciar rolagem automática"}
                >
                  {isAutoScrolling ? <Pause size={12} className="animate-pulse" /> : <Play size={12} />}
                  <span className="hidden sm:inline">Auto-Scroll</span>
                </button>
                {isAutoScrolling && (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map(spd => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setScrollSpeed(spd)}
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                          scrollSpeed === spd 
                            ? 'bg-violet-600 text-white' 
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                        title={`Velocidade ${spd}x`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Metrônomo Visual */}
              <div className="flex items-center">
                <WorshipMetronome 
                  compact 
                  initialBpm={activeSong.bpm ? parseInt(activeSong.bpm) : 72} 
                />
              </div>

              {/* Modo Palco (Alto Contraste) */}
              <button
                type="button"
                onClick={toggleStageMode}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                  stageMode
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
                title="Alternar Tema Palco / Contraste"
              >
                {stageMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              {/* Imprimir / PDF */}
              <button
                type="button"
                onClick={() => handleImprimirCifra(activeSong, activeSemitones, activeFontSize, activeCapo, applyCapoToChords)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 text-xs font-bold transition cursor-pointer shadow-2xs"
                title="Imprimir Cifra / Gerar PDF"
              >
                <Printer size={14} />
              </button>

              {/* Copiar */}
              <button
                type="button"
                onClick={() => handleCopyChords(activeTransposedSheet, activeCurrentKey)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 text-xs font-bold transition cursor-pointer shadow-2xs"
                title="Copiar Cifra"
              >
                <Copy size={14} />
              </button>

              {/* BOTÃO SAIR DA TELA CHEIA */}
              <button
                type="button"
                onClick={() => setIsSongFullscreen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ml-1"
                title="Sair do modo Tela Cheia (ou pressione ESC)"
              >
                <Minimize2 size={14} />
                <span>Sair da Tela Cheia</span>
              </button>
            </div>
          </div>

          {/* CORPO DE LEITURA EM TELA CHEIA (COM FUNDO BRANCO NO MODO CLARO E NOTAS EM LARANJA) */}
          <div 
            ref={scrollFullscreenContainerRef}
            className={`flex-1 w-full overflow-y-auto custom-scrollbar p-6 sm:p-10 md:p-12 transition-colors duration-200 ${
              stageMode 
                ? 'bg-black text-zinc-100' 
                : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100'
            }`}
          >
            {/* BANNER DE AVISO DO CAPOTRASTE EM TELA CHEIA */}
            {activeCapo > 0 && (
              <div className={`max-w-6xl mx-auto p-3.5 mb-6 rounded-2xl border flex flex-wrap items-center justify-between gap-3 select-none shadow-sm ${
                stageMode
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                  : 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <Guitar size={20} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black flex items-center gap-2 flex-wrap">
                      <span>Capotraste na {activeCapo}ª Casa</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100">
                        {applyCapoToChords ? `Formas tocadas: ${activeChordShapeKey}` : `Afinação Real: ${activeCurrentKey}`}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {applyCapoToChords 
                        ? `As notas na folha estão transpostas para a digitação no violão (${activeChordShapeKey}). O som ouvido na igreja é ${activeCurrentKey}.` 
                        : `Acordes exibidos na afinação real da banda (${activeCurrentKey}). Coloque a braçadeira na ${activeCapo}ª casa.`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyCapoToChords(!applyCapoToChords)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer border ${
                      applyCapoToChords 
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black shadow-xs' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                    }`}
                    title="Alternar entre ver as formas do violão ou os acordes no tom real"
                  >
                    {applyCapoToChords ? '✓ Formas do Capo' : 'Tom Real'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSongCapoMap(prev => ({ ...prev, [activeSong.id]: 0 }))}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer px-2"
                    title="Remover Capotraste"
                  >
                    Remover Capo
                  </button>
                </div>
              </div>
            )}

            <div className="max-w-6xl mx-auto">
              <CifraVisualizer 
                cifraText={activeTransposedSheet} 
                fontSize={activeFontSize} 
                stageMode={stageMode} 
                twoColumns={twoColumns} 
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 6. MODO CULTO AO VIVO / SEQUENCIAL EM TELA CHEIA */}
      {activeLiveSetlist && (
        <WorshipLiveReader
          setlist={activeLiveSetlist}
          allMusicas={musicas}
          onClose={() => setActiveLiveSetlist(null)}
        />
      )}
    </div>
  );
};

export default PortalRepertorio;
