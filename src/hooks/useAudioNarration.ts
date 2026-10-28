import { useState, useEffect, useRef, useCallback } from 'react';

export interface AudioSegment {
  id: string | number;
  label: string;
  text: string;
  sublabel?: string;
}

export interface UseAudioNarrationOptions {
  onSegmentChange?: (segment: AudioSegment, index: number) => void;
  onFinish?: () => void;
}

export function useAudioNarration(
  segments: AudioSegment[],
  options?: UseAudioNarrationOptions
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('gipp_audio_rate');
      return saved ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  });
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    try {
      return localStorage.getItem('gipp_audio_voice') || '';
    } catch {
      return '';
    }
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [volume, setVolume] = useState(1.0);

  const segmentsRef = useRef<AudioSegment[]>(segments);
  const currentIndexRef = useRef(currentIndex);
  const isPlayingRef = useRef(isPlaying);
  const playbackRateRef = useRef(playbackRate);
  const selectedVoiceRef = useRef(selectedVoice);
  const volumeRef = useRef(volume);

  segmentsRef.current = segments;
  currentIndexRef.current = currentIndex;
  isPlayingRef.current = isPlaying;
  playbackRateRef.current = playbackRate;
  selectedVoiceRef.current = selectedVoice;
  volumeRef.current = volume;

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Carrega e atualiza vozes disponíveis em português
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const ptVoices = allVoices.filter(
        v => v.lang.startsWith('pt') || v.lang.includes('BR') || v.lang.includes('PT')
      );
      const listToUse = ptVoices.length > 0 ? ptVoices : allVoices;
      setAvailableVoices(listToUse);

      // Se a voz selecionada não estiver salva ou não existir na lista, escolhe a melhor voz pt-BR
      if (!selectedVoiceRef.current && listToUse.length > 0) {
        const preferred = listToUse.find(v => v.lang.includes('BR') || v.lang === 'pt-BR') || listToUse[0];
        setSelectedVoice(preferred.name);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  // Função interna para falar o segmento atual
  const speakCurrentSegment = useCallback(() => {
    if (!isSupported) return;
    const segs = segmentsRef.current;
    const idx = currentIndexRef.current;

    if (idx < 0 || idx >= segs.length) {
      setIsPlaying(false);
      setIsPaused(false);
      options?.onFinish?.();
      return;
    }

    const currentSeg = segs[idx];
    options?.onSegmentChange?.(currentSeg, idx);

    window.speechSynthesis.cancel();

    const cleanText = currentSeg.text
      .replace(/[*_#`~[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      // Pula segmento vazio
      if (idx + 1 < segs.length) {
        setCurrentIndex(idx + 1);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        options?.onFinish?.();
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = playbackRateRef.current;
    utterance.volume = volumeRef.current;

    const voices = window.speechSynthesis.getVoices();
    let voiceToUse = voices.find(v => v.name === selectedVoiceRef.current);
    if (!voiceToUse) {
      voiceToUse = voices.find(v => v.lang.includes('BR') || v.lang === 'pt-BR');
    }
    if (voiceToUse) {
      utterance.voice = voiceToUse;
    }

    utterance.onend = () => {
      if (!isPlayingRef.current) return;
      const nextIdx = currentIndexRef.current + 1;
      if (nextIdx < segmentsRef.current.length) {
        setCurrentIndex(nextIdx);
        // Pequena pausa natural de 200ms entre versículos / parágrafos
        setTimeout(() => {
          if (isPlayingRef.current) {
            speakCurrentSegment();
          }
        }, 220);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentIndex(0);
        options?.onFinish?.();
      }
    };

    utterance.onerror = (e) => {
      // Se foi cancelado intencionalmente, ignora
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      console.warn('Erro na síntese de voz:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported, options]);

  // Iniciar reprodução (a partir de um índice específico ou do atual)
  const play = useCallback((startIndex?: number) => {
    if (!isSupported) return;

    if (startIndex !== undefined) {
      setCurrentIndex(startIndex);
      currentIndexRef.current = startIndex;
    }

    setIsPlaying(true);
    setIsPaused(false);
    isPlayingRef.current = true;

    // Se estiver pausado pelo navegador, retoma
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      speakCurrentSegment();
    }
  }, [isSupported, speakCurrentSegment]);

  // Pausar reprodução
  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  // Retomar reprodução
  const resume = useCallback(() => {
    if (!isSupported) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      play();
    }
  }, [isSupported, play]);

  // Parar reprodução
  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(0);
  }, [isSupported]);

  // Avançar para próximo segmento
  const next = useCallback(() => {
    if (!isSupported) return;
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < segmentsRef.current.length) {
      setCurrentIndex(nextIdx);
      currentIndexRef.current = nextIdx;
      if (isPlayingRef.current) {
        window.speechSynthesis.cancel();
        speakCurrentSegment();
      }
    }
  }, [isSupported, speakCurrentSegment]);

  // Voltar para segmento anterior
  const prev = useCallback(() => {
    if (!isSupported) return;
    const prevIdx = currentIndexRef.current - 1;
    if (prevIdx >= 0) {
      setCurrentIndex(prevIdx);
      currentIndexRef.current = prevIdx;
      if (isPlayingRef.current) {
        window.speechSynthesis.cancel();
        speakCurrentSegment();
      }
    }
  }, [isSupported, speakCurrentSegment]);

  // Saltar diretamente para um segmento
  const jumpTo = useCallback((indexOrId: number | string) => {
    let targetIndex = -1;
    if (typeof indexOrId === 'number' && indexOrId < segmentsRef.current.length) {
      targetIndex = indexOrId;
    } else {
      targetIndex = segmentsRef.current.findIndex(s => String(s.id) === String(indexOrId));
    }

    if (targetIndex >= 0) {
      setCurrentIndex(targetIndex);
      currentIndexRef.current = targetIndex;
      play(targetIndex);
    }
  }, [play]);

  // Mudar velocidade
  const changeRate = useCallback((newRate: number) => {
    setPlaybackRate(newRate);
    playbackRateRef.current = newRate;
    try {
      localStorage.setItem('gipp_audio_rate', String(newRate));
    } catch {}

    // Se estiver tocando, reinicia o segmento atual na nova velocidade
    if (isPlayingRef.current && !window.speechSynthesis.paused) {
      window.speechSynthesis.cancel();
      speakCurrentSegment();
    }
  }, [speakCurrentSegment]);

  // Mudar voz
  const changeVoice = useCallback((voiceName: string) => {
    setSelectedVoice(voiceName);
    selectedVoiceRef.current = voiceName;
    try {
      localStorage.setItem('gipp_audio_voice', voiceName);
    } catch {}

    if (isPlayingRef.current && !window.speechSynthesis.paused) {
      window.speechSynthesis.cancel();
      speakCurrentSegment();
    }
  }, [speakCurrentSegment]);

  const currentSegment = segments[currentIndex] || null;
  const progressPercent = segments.length > 0 ? Math.round(((currentIndex + 1) / segments.length) * 100) : 0;

  return {
    isSupported,
    isPlaying,
    isPaused,
    currentIndex,
    currentSegment,
    playbackRate,
    selectedVoice,
    availableVoices,
    volume,
    progressPercent,
    totalSegments: segments.length,
    play,
    pause,
    resume,
    stop,
    next,
    prev,
    jumpTo,
    changeRate,
    changeVoice,
    setVolume
  };
}
