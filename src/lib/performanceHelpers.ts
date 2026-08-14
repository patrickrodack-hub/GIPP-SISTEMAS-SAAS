// performanceHelpers.ts - Utilitários de Alta Performance para o GIPP
import { useMemo, useState, useEffect, useRef } from 'react';

/**
 * Hook de debounce para valores de pesquisa e filtros
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Normalizador rápido de strings para buscas sem acento e case-insensitive
 */
export function normalizeSearchTerm(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Mecanismo de busca rápida multi-termo para arrays de objetos
 */
export function fastFilter<T>(
  items: T[] | undefined | null,
  searchTerm: string,
  fieldsExtractor: (item: T) => (string | number | undefined | null)[]
): T[] {
  if (!items || !Array.isArray(items)) return [];
  const normalizedQuery = normalizeSearchTerm(searchTerm);
  if (!normalizedQuery) return items;

  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

  return items.filter(item => {
    const fields = fieldsExtractor(item);
    const combinedString = normalizeSearchTerm(fields.filter(Boolean).join(' '));
    return queryWords.every(word => combinedString.includes(word));
  });
}

/**
 * Solicita modo Full Screen de forma compatível e segura com suporte a múltiplos navegadores
 */
export function requestAppFullscreen(): void {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const doc = window.document as any;
    const docEl = doc.documentElement as any;
    const isFullScreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
    
    if (!isFullScreen && docEl) {
      const requestFullScreen = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
      if (requestFullScreen) {
        const res = requestFullScreen.call(docEl);
        if (res && typeof res.catch === 'function') {
          res.catch((err: any) => {
            // Silenciosamente captura caso o browser exija interação prévia
            console.log('Fullscreen request pending user interaction:', err);
          });
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao solicitar tela cheia:', err);
  }
}
