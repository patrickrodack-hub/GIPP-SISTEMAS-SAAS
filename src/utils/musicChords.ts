/**
 * Utilitários de Cifras Musicais para o Ministério de Louvor & Adoração
 * Transposição de Tom, Detecção de Acordes, Ajuste de Escalas e Enarmonia
 */

// Escala cromática com sustenidos e bemóis
export const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Escala cromática de Tons Menores
export const CHROMATIC_MINORS_SHARPS = ['Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'];
export const CHROMATIC_MINORS_FLATS  = ['Cm', 'Dbm', 'Dm', 'Ebm', 'Em', 'Fm', 'Gbm', 'Gm', 'Abm', 'Am', 'Bbm', 'Bm'];

// Lista completa de tons organizados em grupos (Maiores e Menores)
export const MUSICAL_KEY_GROUPS = [
    {
        label: 'Tons Maiores (Major)',
        keys: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    },
    {
        label: 'Tons Menores (Minor)',
        keys: ['Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm']
    }
];

// Lista linear com todos os 24 tons principais
export const ALL_MUSICAL_KEYS = [
    ...CHROMATIC_SHARPS,
    ...CHROMATIC_MINORS_SHARPS
];

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
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);

/**
 * Transpõe uma nota base individual (com suporte a sustenidos/bemóis e sufixos de tom menor 'm')
 */
export function transposeNote(note: string, semitones: number, preferFlat = false): string {
    const cleanNote = note.trim();
    if (!cleanNote) return note;

    // Extrai nota base e qualquer sufixo como 'm', 'm7', etc.
    const match = cleanNote.match(/^([A-Ga-g][#b]?)(.*)$/);
    if (!match) return note;

    const root = match[1].toUpperCase();
    const suffix = match[2];

    const semitone = NOTE_TO_SEMITONE[root];
    if (semitone === undefined) return note;

    let targetSemitone = (semitone + semitones) % 12;
    if (targetSemitone < 0) targetSemitone += 12;

    const scale = preferFlat ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
    return `${scale[targetSemitone]}${suffix}`;
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

// Regex aprimorada para identificar acordes musicais em qualquer notação
// Aceita: C, C#, Db, Em, F#m, G7, Bb9, C9, D4, Dsus4, G/B, F#m7(b5), Asus4, C#m7(9), C7M, C7+, C6/9, D°, F#m/C#, etc.
const CHORD_TOKEN_REGEX = /^[A-G][#b]?(m|min|maj|M|dim|aug|sus|add|º|°)?\d*(M|\+|\-)?(\([#b]?\d+[#b\+\-]?\))*(\/[A-G][#b]?)?$/;

/**
 * Verifica se um token é um acorde válido
 */
export function isChordToken(token: string): boolean {
    const cleaned = token.trim();
    if (!cleaned) return false;
    // Excluir pontuações comuns isoladas ou palavras de texto comuns
    if (/^[.,;:!?'"()\-–—|/]+$/.test(cleaned)) return false;
    
    // Se estiver entre parênteses ex: (G) ou (Em)
    const unwrapped = cleaned.replace(/^\((.+)\)$/, '$1');
    return CHORD_TOKEN_REGEX.test(unwrapped) || CHORD_TOKEN_REGEX.test(cleaned);
}

/**
 * Verifica se uma linha de texto é predominantemente uma linha de cifras
 */
export function isChordLine(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed) return false;

    // Se for uma tag de seção pura [Intro], [Verso], [Refrão] sem acordes adicionais
    if (/^\[.*?\]$/.test(trimmed) && !trimmed.includes(' ')) return false;

    // Se for tag de seção com acordes ex: [Intro] G Em C D
    if (/^\[.*?\]\s+[A-G]/.test(trimmed)) return true;

    // Divide a linha por espaços
    const tokens = trimmed.split(/\s+/).filter(t => t.length > 0);
    if (tokens.length === 0) return false;

    let chordCount = 0;
    for (const token of tokens) {
        if (isChordToken(token)) {
            chordCount++;
        }
    }

    // Se mais de 50% dos tokens forem acordes, ou se houver pelo menos 1 acorde e nenhum caractere típico de texto cursivo longo
    if (tokens.length === 1 && isChordToken(tokens[0])) return true;
    if (chordCount / tokens.length >= 0.4) return true;

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
 * Verifica se uma tonalidade é menor (ex: 'Am', 'Em', 'C#m')
 */
export function isMinorKey(key: string): boolean {
    const clean = (key || '').trim().toLowerCase();
    return clean.endsWith('m') && !clean.endsWith('maj') && !clean.endsWith('dim');
}

/**
 * Retorna a relativa maior de um tom menor (ex: 'Am' -> 'C', 'Em' -> 'G', 'Gm' -> 'Bb')
 */
export function getRelativeMajor(minorKey: string): string {
    const clean = (minorKey || '').trim();
    const root = isMinorKey(clean) ? clean.slice(0, -1).trim() : clean;
    const rootUpper = root.toUpperCase();
    const semitone = NOTE_TO_SEMITONE[rootUpper] ?? 0;
    const preferFlat = FLAT_KEYS.has(clean);
    const scale = preferFlat ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
    return scale[(semitone + 3) % 12];
}

/**
 * Retorna a relativa menor de um tom maior (ex: 'C' -> 'Am', 'G' -> 'Em', 'F' -> 'Dm')
 */
export function getRelativeMinor(majorKey: string): string {
    const clean = (majorKey || '').trim();
    if (isMinorKey(clean)) return clean;
    const rootUpper = clean.toUpperCase();
    const semitone = NOTE_TO_SEMITONE[rootUpper] ?? 0;
    const preferFlat = FLAT_KEYS.has(clean);
    const scale = preferFlat ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
    const relIdx = (semitone + 9) % 12;
    return `${scale[relIdx]}m`;
}

/**
 * Transpõe uma tonalidade inteira (preservando perfeitamente a modalidade Maior ou Menor)
 * Ex: transposeKey('Em', +1) -> 'Fm'
 * Ex: transposeKey('Em', -1) -> 'D#m' / 'Ebm'
 * Ex: transposeKey('G', +1)  -> 'G#'
 */
export function transposeKey(key: string, semitones: number, preferFlat?: boolean): string {
    const clean = (key || 'C').trim();
    const isMinor = isMinorKey(clean);
    const root = isMinor ? clean.slice(0, -1).trim() : clean;
    const shouldFlat = preferFlat !== undefined ? preferFlat : FLAT_KEYS.has(clean);
    const transposedRoot = transposeNote(root, semitones, shouldFlat);
    return isMinor ? `${transposedRoot}m` : transposedRoot;
}

/**
 * Calcula a distância em semitons para transposição entre dois tons quaisquer
 * (com suporte total a transposição Maior -> Maior, Menor -> Menor, Maior -> Menor e Menor -> Maior)
 */
export function calculateSemitonesBetweenKeys(fromKey: string, toKey: string): number {
    const fromClean = (fromKey || 'C').trim();
    const toClean = (toKey || 'C').trim();

    const fromMinor = isMinorKey(fromClean);
    const toMinor = isMinorKey(toClean);

    // Mesmo modo (ambos Maiores ou ambos Menores)
    if (fromMinor === toMinor) {
        return getSemitoneDifference(fromClean, toClean);
    }

    // De Maior para Menor (ancora na tonalidade relativa do tom menor de destino)
    if (!fromMinor && toMinor) {
        const relMajor = getRelativeMajor(toClean);
        return getSemitoneDifference(fromClean, relMajor);
    }

    // De Menor para Maior (ancora na tonalidade relativa do tom menor de origem)
    if (fromMinor && !toMinor) {
        const fromRelMajor = getRelativeMajor(fromClean);
        return getSemitoneDifference(fromRelMajor, toClean);
    }

    return getSemitoneDifference(fromClean, toClean);
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

/**
 * Constantes e utilitários para Capotraste (Capo)
 */
export const CAPO_FRETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export function getCapoLabel(fret: number): string {
    if (!fret || fret <= 0) return 'Sem Capo';
    return `Capo ${fret}ª casa`;
}

/**
 * Calcula o tom da forma dos acordes (shape) que o violão toca com o Capo.
 * Ex: Som Real = 'G', Capo = 2ª casa -> Forma dos acordes = 'F'
 * Ex: Som Real = 'Bb', Capo = 3ª casa -> Forma dos acordes = 'G'
 */
export function getCapoChordShapeKey(soundingKey: string, capoFret: number): string {
    if (!capoFret || capoFret <= 0) return soundingKey;
    return transposeNote(soundingKey, -capoFret);
}

/**
 * Calcula o tom resultante (som real) ao usar determinado acorde-base com Capo.
 * Ex: Forma tocada = 'G', Capo na 2ª casa -> Som real = 'A'
 */
export function getCapoSoundingKey(shapeKey: string, capoFret: number): string {
    if (!capoFret || capoFret <= 0) return shapeKey;
    return transposeNote(shapeKey, capoFret);
}

/**
 * Sugere posições ideais de capotraste para facilitar a execução no violão
 * priorizando formas abertas populares (G, C, D, E, A).
 */
export function suggestCapo(soundingKey: string): { fret: number; shape: string; reason: string } | null {
    const clean = soundingKey.trim();
    if (!clean) return null;
    const root = clean.match(/^[A-Ga-g][#b]?/)?.[0]?.toUpperCase() || clean;

    const suggestions: Record<string, { fret: number; shape: string; reason: string }> = {
        'AB': { fret: 1, shape: 'G', reason: 'Toque na forma aberta de G com Capo na 1ª casa' },
        'G#': { fret: 1, shape: 'G', reason: 'Toque na forma aberta de G com Capo na 1ª casa' },
        'BB': { fret: 3, shape: 'G', reason: 'Toque na forma aberta de G com Capo na 3ª casa (ou 1ª casa na forma de A)' },
        'A#': { fret: 3, shape: 'G', reason: 'Toque na forma aberta de G com Capo na 3ª casa (ou 1ª casa na forma de A)' },
        'B':  { fret: 4, shape: 'G', reason: 'Toque na forma aberta de G com Capo na 4ª casa (ou 2ª casa na forma de A)' },
        'DB': { fret: 1, shape: 'C', reason: 'Toque na forma de C com Capo na 1ª casa' },
        'C#': { fret: 1, shape: 'C', reason: 'Toque na forma de C com Capo na 1ª casa' },
        'EB': { fret: 1, shape: 'D', reason: 'Toque na forma aberta de D com Capo na 1ª casa (ou 3ª casa na forma de C)' },
        'D#': { fret: 1, shape: 'D', reason: 'Toque na forma aberta de D com Capo na 1ª casa (ou 3ª casa na forma de C)' },
        'F#': { fret: 2, shape: 'E', reason: 'Toque na forma de E com Capo na 2ª casa (ou 4ª casa na forma de D)' },
        'GB': { fret: 2, shape: 'E', reason: 'Toque na forma de E com Capo na 2ª casa (ou 4ª casa na forma de D)' },
    };

    return suggestions[root] || null;
}

/**
 * Interface para representar um acorde de um campo harmônico
 */
export interface HarmonicChord {
    degree: string;       // ex: 'I', 'IIm', 'III7M', etc.
    chord: string;        // ex: 'C', 'Dm', 'G7', 'Em7'
    function: string;     // ex: 'Tônica', 'Subdominante', 'Dominante'
    triad: string;        // ex: 'C'
    tetrad: string;       // ex: 'C7M'
    quality: 'Maior' | 'Menor' | 'Diminuto' | 'Meio-Diminuto' | 'Aumentado' | 'Dominante';
}

/**
 * Interface com os dados completos de uma escala musical e seu campo harmônico
 */
export interface MusicalScaleInfo {
    key: string;               // ex: 'G' ou 'Em'
    rootNote: string;          // ex: 'G' ou 'E'
    isMinor: boolean;          // true se for menor
    modeName: string;          // ex: 'Sol Maior (Jônio)' ou 'Mi Menor Natural (Eólio)'
    relativeKey: string;       // ex: 'Em' para G, ou 'G' para Em
    scaleFormula: string;      // ex: 'Tom - Tom - Semitom - Tom - Tom - Tom - Semitom'
    scaleNotes: string[];      // As 7 notas da escala diatônica ex: ['G', 'A', 'B', 'C', 'D', 'E', 'F#']
    harmonicMinorNotes?: string[]; // Para tons menores: Escala Menor Harmônica
    melodicMinorNotes?: string[];  // Para tons menores: Escala Menor Melódica
    pentatonicNotes: string[]; // As 5 notas da escala pentatônica
    harmonicField: HarmonicChord[]; // Os 7 graus do campo harmônico
}

// Intervalos em semitons para cada escala
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11]; // T, T, st, T, T, T, st
const NATURAL_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10]; // T, st, T, T, st, T, T
const HARMONIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 11]; // 7º grau aumentado
const MELODIC_MINOR_INTERVALS = [0, 2, 3, 5, 7, 9, 11];  // 6º e 7º graus aumentados
const MAJOR_PENTATONIC_INTERVALS = [0, 2, 4, 7, 9];      // 1, 2, 3, 5, 6
const MINOR_PENTATONIC_INTERVALS = [0, 3, 5, 7, 10];     // 1, b3, 4, 5, b7

// Graus e Funções do Campo Harmônico Maior
const MAJOR_HARMONIC_STRUCTURE = [
    { degree: 'I', triadSuffix: '', tetradSuffix: '7M', function: 'Tônica (Estabilidade Principal)', quality: 'Maior' as const },
    { degree: 'II', triadSuffix: 'm', tetradSuffix: 'm7', function: 'Sobretônica / Subdominante', quality: 'Menor' as const },
    { degree: 'III', triadSuffix: 'm', tetradSuffix: 'm7', function: 'Mediante / Tônica Secundária', quality: 'Menor' as const },
    { degree: 'IV', triadSuffix: '', tetradSuffix: '7M', function: 'Subdominante (Afastamento)', quality: 'Maior' as const },
    { degree: 'V', triadSuffix: '', tetradSuffix: '7', function: 'Dominante (Tensão / Resolução)', quality: 'Dominante' as const },
    { degree: 'VI', triadSuffix: 'm', tetradSuffix: 'm7', function: 'Relativa Menor / Tônica Secundária', quality: 'Menor' as const },
    { degree: 'VII', triadSuffix: '°', tetradSuffix: 'm7(b5)', function: 'Sensível / Dominante Sem Tônica', quality: 'Meio-Diminuto' as const },
];

// Graus e Funções do Campo Harmônico Menor Natural (com V grau dominante da menor harmônica)
const MINOR_HARMONIC_STRUCTURE = [
    { degree: 'Im', triadSuffix: 'm', tetradSuffix: 'm7', function: 'Tônica Menor (Estabilidade)', quality: 'Menor' as const },
    { degree: 'II°', triadSuffix: '°', tetradSuffix: 'm7(b5)', function: 'Subdominante Menor', quality: 'Meio-Diminuto' as const },
    { degree: 'III', triadSuffix: '', tetradSuffix: '7M', function: 'Relativa Maior', quality: 'Maior' as const },
    { degree: 'IVm', triadSuffix: 'm', tetradSuffix: 'm7', function: 'Subdominante', quality: 'Menor' as const },
    { degree: 'Vm / V7', triadSuffix: 'm', tetradSuffix: '7', function: 'Dominante (Preparação)', quality: 'Dominante' as const },
    { degree: 'VI', triadSuffix: '', tetradSuffix: '7M', function: 'Subdominante Secundária', quality: 'Maior' as const },
    { degree: 'VII', triadSuffix: '', tetradSuffix: '7', function: 'Subtônica / Preparação', quality: 'Maior' as const },
];

/**
 * Obtém as informações completas de uma escala e seu campo harmônico (Maior ou Menor)
 */
export function getScaleInfo(keyName: string): MusicalScaleInfo {
    const rawKey = keyName.trim() || 'C';
    const isMinor = rawKey.toLowerCase().endsWith('m') && !rawKey.toLowerCase().endsWith('maj');
    const rootNote = isMinor ? rawKey.slice(0, -1).trim() : rawKey;
    const preferFlat = FLAT_KEYS.has(rawKey);

    const rootUpper = rootNote.toUpperCase();
    const rootSemitone = NOTE_TO_SEMITONE[rootUpper] ?? 0;
    const chromatic = preferFlat ? CHROMATIC_FLATS : CHROMATIC_SHARPS;

    // Calcula as notas da escala principal
    const intervals = isMinor ? NATURAL_MINOR_INTERVALS : MAJOR_SCALE_INTERVALS;
    const scaleNotes = intervals.map(inter => {
        const idx = (rootSemitone + inter) % 12;
        return chromatic[idx];
    });

    // Pentatônica
    const pentaIntervals = isMinor ? MINOR_PENTATONIC_INTERVALS : MAJOR_PENTATONIC_INTERVALS;
    const pentatonicNotes = pentaIntervals.map(inter => {
        const idx = (rootSemitone + inter) % 12;
        return chromatic[idx];
    });

    // Escalas extras para tons menores
    let harmonicMinorNotes: string[] | undefined;
    let melodicMinorNotes: string[] | undefined;

    if (isMinor) {
        harmonicMinorNotes = HARMONIC_MINOR_INTERVALS.map(inter => {
            const idx = (rootSemitone + inter) % 12;
            return chromatic[idx];
        });
        melodicMinorNotes = MELODIC_MINOR_INTERVALS.map(inter => {
            const idx = (rootSemitone + inter) % 12;
            return chromatic[idx];
        });
    }

    // Calcula a relativa (Maior <-> Menor: 3 semitons de diferença)
    let relativeKey = '';
    if (isMinor) {
        // Relativa Maior está 3 semitons acima da tônica menor (ex: Am -> C, Em -> G)
        const relIdx = (rootSemitone + 3) % 12;
        relativeKey = chromatic[relIdx];
    } else {
        // Relativa Menor está 3 semitons abaixo da tônica maior (ex: C -> Am, G -> Em)
        const relIdx = (rootSemitone + 9) % 12;
        relativeKey = `${chromatic[relIdx]}m`;
    }

    // Monta o Campo Harmônico completo
    const structure = isMinor ? MINOR_HARMONIC_STRUCTURE : MAJOR_HARMONIC_STRUCTURE;
    const harmonicField: HarmonicChord[] = structure.map((item, index) => {
        const chordRoot = scaleNotes[index];
        const triad = `${chordRoot}${item.triadSuffix}`;
        const tetrad = `${chordRoot}${item.tetradSuffix}`;
        return {
            degree: item.degree,
            chord: triad,
            function: item.function,
            triad,
            tetrad,
            quality: item.quality
        };
    });

    return {
        key: rawKey,
        rootNote,
        isMinor,
        modeName: isMinor ? `${rootNote}m Menor Natural (Modo Eólio)` : `${rootNote} Maior Natural (Modo Jônio)`,
        relativeKey,
        scaleFormula: isMinor ? 'Tom - Semitom - Tom - Tom - Semitom - Tom - Tom' : 'Tom - Tom - Semitom - Tom - Tom - Tom - Semitom',
        scaleNotes,
        harmonicMinorNotes,
        melodicMinorNotes,
        pentatonicNotes,
        harmonicField
    };
}

/**
 * Pares fundamentais de Escalas Maiores com suas respectivas Escalas Menores Relativas
 */
export interface KeyRelativePair {
    major: string;
    minor: string;
    description: string;
    accidentals: string; // Ex: 'Nenhum', '1 sustenido (F#)', '1 bemol (Bb)', etc.
}

export const MAJOR_MINOR_RELATIVE_PAIRS: KeyRelativePair[] = [
    { major: 'C',  minor: 'Am',  description: 'Dó Maior / Lá Menor', accidentals: 'Natural (0 acidentes)' },
    { major: 'G',  minor: 'Em',  description: 'Sol Maior / Mi Menor', accidentals: '1 Sustenido (F#)' },
    { major: 'D',  minor: 'Bm',  description: 'Ré Maior / Si Menor', accidentals: '2 Sustenidos (F#, C#)' },
    { major: 'A',  minor: 'F#m', description: 'Lá Maior / Fá# Menor', accidentals: '3 Sustenidos (F#, C#, G#)' },
    { major: 'E',  minor: 'C#m', description: 'Mi Maior / Dó# Menor', accidentals: '4 Sustenidos (F#, C#, G#, D#)' },
    { major: 'B',  minor: 'G#m', description: 'Si Maior / Sol# Menor', accidentals: '5 Sustenidos (F#, C#, G#, D#, A#)' },
    { major: 'F#', minor: 'D#m', description: 'Fá# Maior / Ré# Menor', accidentals: '6 Sustenidos (F#, C#, G#, D#, A#, E#)' },
    { major: 'F',  minor: 'Dm',  description: 'Fá Maior / Ré Menor', accidentals: '1 Bemol (Bb)' },
    { major: 'Bb', minor: 'Gm',  description: 'Si♭ Maior / Sol Menor', accidentals: '2 Bemóis (Bb, Eb)' },
    { major: 'Eb', minor: 'Cm',  description: 'Mi♭ Maior / Dó Menor', accidentals: '3 Bemóis (Bb, Eb, Ab)' },
    { major: 'Ab', minor: 'Fm',  description: 'Lá♭ Maior / Fá Menor', accidentals: '4 Bemóis (Bb, Eb, Ab, Db)' },
    { major: 'Db', minor: 'Bbm', description: 'Ré♭ Maior / Si♭ Menor', accidentals: '5 Bemóis (Bb, Eb, Ab, Db, Gb)' },
];

/**
 * Retorna a tonalidade relativa direta (se for maior retorna a menor, se for menor retorna a maior)
 */
export function getRelativeKey(key: string): string {
    const info = getScaleInfo(key);
    return info.relativeKey;
}


