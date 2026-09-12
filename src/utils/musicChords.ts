/**
 * Utilitários de Cifras Musicais para o Ministério de Louvor & Adoração
 * Transposição de Tom, Detecção de Acordes, Ajuste de Escalas e Enarmonia
 */

// Escala cromática com sustenidos e bemóis
export const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Mapeamento de notas para índice de 0 a 11
const NOTE_TO_SEMITONE: Record<string, number> = {
    'C': 0, 'B#': 0,
    'C#': 1, 'DB': 1, 'Db': 1,
    'D': 2,
    'D#': 3, 'EB': 3, 'Eb': 3,
    'E': 4, 'FB': 4,
    'F': 5, 'E#': 5,
    'F#': 6, 'GB': 6, 'Gb': 6,
    'G': 7,
    'G#': 8, 'AB': 8, 'Ab': 8,
    'A': 9,
    'A#': 10, 'BB': 10, 'Bb': 10,
    'B': 11, 'CB': 11
};

// Tons que naturalmente usam bemol
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm']);

/**
 * Transpõe uma nota base individual (com suporte a sustenidos/bemóis)
 */
export function transposeNote(note: string, semitones: number, preferFlat = false): string {
    const cleanNote = note.trim();
    if (!cleanNote) return note;

    const upper = cleanNote.toUpperCase();
    const semitone = NOTE_TO_SEMITONE[upper];
    if (semitone === undefined) return note;

    let targetSemitone = (semitone + semitones) % 12;
    if (targetSemitone < 0) targetSemitone += 12;

    const scale = preferFlat ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
    return scale[targetSemitone];
}

/**
 * Transpõe um único acorde completo (ex: C, C#m7, D/F#, Bbm7(b5), G/B, F#9)
 */
export function transposeSingleChord(chord: string, semitones: number, preferFlat = false): string {
    if (semitones === 0 || !chord.trim()) return chord;

    // Se for um acorde com baixo invertido (ex: D/F# ou G/B)
    if (chord.includes('/')) {
        const parts = chord.split('/');
        if (parts.length === 2) {
            const transposedMain = transposeSingleChord(parts[0], semitones, preferFlat);
            const transposedBass = transposeNote(parts[1], semitones, preferFlat);
            return `${transposedMain}/${transposedBass}`;
        }
    }

    // Regex para extrair a tônica e o complemento do acorde
    // Ex: "C#m7" -> note: "C#", suffix: "m7"
    const match = chord.match(/^([A-Ga-g][#b]?)(.*)$/);
    if (!match) return chord;

    const originalNote = match[1];
    const suffix = match[2];

    const transposedNote = transposeNote(originalNote, semitones, preferFlat);
    return `${transposedNote}${suffix}`;
}

// Regex para identificar um token que parece um acorde musical
// Exemplos aceitos: C, D, Em, F#m, G7, Bb, C9, D4, G/B, F#m7(b5), Asus4, C#m7(9), D°
const CHORD_TOKEN_REGEX = /^[A-G][#b]?(m|maj|min|dim|aug|sus|add|M|º|°)?\d*(\([b#]?\d+\))?(\/[A-G][#b]?)?$/;

/**
 * Verifica se um token é um acorde válido
 */
export function isChordToken(token: string): boolean {
    const cleaned = token.trim();
    if (!cleaned) return false;
    // Excluir pontuações comuns
    if (/^[.,;:!?'"()\-]+$/.test(cleaned)) return false;
    return CHORD_TOKEN_REGEX.test(cleaned);
}

/**
 * Verifica se uma linha de texto é predominantemente uma linha de cifras
 */
export function isChordLine(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed) return false;

    // Se for uma tag de seção [Intro], [Verso], [Refrão], não é linha de cifra pura
    if (/^\[.*?\]$/.test(trimmed)) return false;

    // Divide a linha por espaços
    const tokens = trimmed.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) return false;

    let chordCount = 0;
    for (const token of tokens) {
        if (isChordToken(token)) {
            chordCount++;
        }
    }

    // Se mais de 50% dos tokens forem acordes, ou se houver pelo menos 2 acordes e nenhum caractere típico de texto cursivo longo
    if (chordCount / tokens.length >= 0.5) return true;
    if (tokens.length === 1 && isChordToken(tokens[0])) return true;

    return false;
}

/**
 * Transpõe o texto completo de uma cifra musical
 * Preserva o alinhamento das colunas e espaços
 */
export function transposeChordSheet(
    text: string, 
    semitones: number, 
    targetKeyOrPreferFlat?: string | boolean
): string {
    if (semitones === 0 || !text) return text;

    const preferFlat = typeof targetKeyOrPreferFlat === 'boolean' 
        ? targetKeyOrPreferFlat 
        : typeof targetKeyOrPreferFlat === 'string' 
            ? FLAT_KEYS.has(targetKeyOrPreferFlat) 
            : false;

    const lines = text.split('\n');

    const transposedLines = lines.map(line => {
        // Preserva tags de cabeçalho intactas
        if (/^\s*\[.*?\]\s*$/.test(line)) {
            return line;
        }

        // Se a linha tiver acordes embutidos entre colchetes ex: "Santo [G] és meu [D] Deus"
        if (/\[[A-G][#b]?[^\]]*\]/.test(line)) {
            return line.replace(/\[([A-G][#b]?[^\]]*)\]/g, (match, chord) => {
                return `[${transposeSingleChord(chord, semitones, preferFlat)}]`;
            });
        }

        // Se for uma linha pura de cifras sobrepostas à letra
        if (isChordLine(line)) {
            // Substitui cada acorde mantendo a formatação e espaçamento original
            // Regex que casa palavras que começam com letras de notas musicais [A-G]
            return line.replace(/\b([A-G][#b]?[a-zA-Z0-9#\/\(º°\)\+\-]*)\b/g, (match) => {
                if (isChordToken(match)) {
                    return transposeSingleChord(match, semitones, preferFlat);
                }
                return match;
            });
        }

        return line;
    });

    return transposedLines.join('\n');
}

/**
 * Calcula a diferença em semitons entre dois tons (ex: de 'G' para 'A' = +2)
 */
export function getSemitoneDifference(fromKey: string, toKey: string): number {
    const fromClean = fromKey.trim();
    const toClean = toKey.trim();

    const fromRoot = fromClean.match(/^[A-Ga-g][#b]?/)?.[0]?.toUpperCase();
    const toRoot = toClean.match(/^[A-Ga-g][#b]?/)?.[0]?.toUpperCase();

    if (!fromRoot || !toRoot) return 0;

    const fromSemitone = NOTE_TO_SEMITONE[fromRoot];
    const toSemitone = NOTE_TO_SEMITONE[toRoot];

    if (fromSemitone === undefined || toSemitone === undefined) return 0;

    let diff = toSemitone - fromSemitone;
    if (diff > 6) diff -= 12;
    if (diff < -6) diff += 12;
    return diff;
}

// Aliases para compatibilidade ampla no ecossistema de relatórios e cifras
export const transposeChord = transposeSingleChord;
export const transposeCifraText = transposeChordSheet;
export const CHROMATIC_SCALE_SHARP = CHROMATIC_SHARPS;

