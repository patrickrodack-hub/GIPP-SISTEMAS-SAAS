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
