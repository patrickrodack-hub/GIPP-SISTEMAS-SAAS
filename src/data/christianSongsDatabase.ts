// =========================================================================
// BANCO DE DADOS OFICIAL DE LOUVORES, HINOS DA HARPA CRISTÃ E CIFRAS REAIS
// =========================================================================

export interface AuthenticSong {
    id: string;
    titulo: string;
    artista: string;
    tomOriginal: string;
    ritmo?: string;
    bpm?: number;
    letraCifra: string;
    tags?: string[];
}

// -------------------------------------------------------------
// MOTOR MUSICAL DE TRANSPOSIÇÃO DE ACORDES
// -------------------------------------------------------------
const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_INDEX: Record<string, number> = {
    'C': 0, 'B#': 0,
    'C#': 1, 'Db': 1,
    'D': 2,
    'D#': 3, 'Eb': 3,
    'E': 4, 'Fb': 4,
    'F': 5, 'E#': 5,
    'F#': 6, 'Gb': 6,
    'G': 7,
    'G#': 8, 'Ab': 8,
    'A': 9,
    'A#': 10, 'Bb': 10,
    'B': 11, 'Cb': 11
};

// Determina se o tom de destino prefere sustenidos ou bemóis
function prefersFlats(targetKey: string): boolean {
    const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];
    return flatKeys.includes(targetKey);
}

// Extrai a tônica fundamental de um tom (ex: "G" de "G", "F#" de "F#m", "Bb" de "Bbm")
export function getRootKey(keyStr: string): string {
    const clean = (keyStr || 'G').trim();
    const match = clean.match(/^([A-G][#b]?)/i);
    return match ? match[1].toUpperCase() : 'G';
}

// Calcula a distância em semitons entre dois tons
export function getSemitoneDifference(fromKey: string, toKey: string): number {
    const fromRoot = getRootKey(fromKey);
    const toRoot = getRootKey(toKey);

    const fromIdx = NOTE_INDEX[fromRoot] ?? 7; // padrão G
    const toIdx = NOTE_INDEX[toRoot] ?? 7;

    let diff = (toIdx - fromIdx) % 12;
    if (diff < 0) diff += 12;
    return diff;
}

// Transpõe uma nota individual
function transposeSingleNote(note: string, semitones: number, useFlats: boolean): string {
    const cleanNote = note.trim();
    const idx = NOTE_INDEX[cleanNote];
    if (idx === undefined) return note;

    let newIdx = (idx + semitones) % 12;
    if (newIdx < 0) newIdx += 12;

    const scale = useFlats ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
    return scale[newIdx];
}

// Transpõe um acorde isolado (ex: "D/F#", "Em7", "C#m7(b5)", "Bb9")
export function transposeChord(chord: string, semitones: number, useFlats = false): string {
    if (!chord || semitones % 12 === 0) return chord;

    // Trata acorde com baixo invertido (ex: G/B, D/F#)
    if (chord.includes('/')) {
        const parts = chord.split('/');
        const main = transposeChord(parts[0], semitones, useFlats);
        const bassMatch = parts[1].match(/^([A-G][#b]?)(.*)$/i);
        if (bassMatch) {
            const transposedBass = transposeSingleNote(bassMatch[1], semitones, useFlats) + bassMatch[2];
            return `${main}/${transposedBass}`;
        }
        return `${main}/${parts[1]}`;
    }

    const match = chord.match(/^([A-G][#b]?)(.*)$/i);
    if (!match) return chord;

    const root = match[1];
    const extension = match[2];
    const transposedRoot = transposeSingleNote(root, semitones, useFlats);
    return `${transposedRoot}${extension}`;
}

// Regex para identificar se uma palavra é um acorde musical válido
const CHORD_REGEX = /^[A-G][#b]?(?:m|maj|dim|aug|sus|add)?[0-9]?(?:(?:M|maj|m|min)?[0-9]*)?(?:sus[24]?)?(?:b5|#5|b9|#9|#11|b13)?(?:\/[A-G][#b]?)?$/;

// Identifica se uma linha inteira é predominantemente uma linha de acordes
export function isChordLine(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('[') || trimmed.startsWith('(')) return false;

    // Tokens separados por espaços
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return false;

    let chordCount = 0;
    for (const token of tokens) {
        // Remove pontuações de cifra comuns
        const cleanToken = token.replace(/^[|()]+|[|()]+$/g, '');
        if (CHORD_REGEX.test(cleanToken)) {
            chordCount++;
        }
    }

    // Se mais de 60% das palavras forem acordes válidos, é uma linha de cifra
    return (chordCount / tokens.length) >= 0.6;
}

// Transpõe uma linha preservando o alinhamento de espaçamento original
export function transposeChordLine(line: string, semitones: number, useFlats: boolean): string {
    if (semitones % 12 === 0) return line;

    // Substitui cada acorde mantendo os espaços exatos
    return line.replace(/([A-G][#b]?(?:[a-zA-Z0-9#b+()\-]*)(?:\/[A-G][#b]?)?)/g, (match) => {
        if (CHORD_REGEX.test(match)) {
            return transposeChord(match, semitones, useFlats);
        }
        return match;
    });
}

// Transpõe um texto cifrado completo de um tom para outro
export function transposeChordsInText(text: string, fromTom: string, toTom: string): string {
    if (!text) return '';
    const diff = getSemitoneDifference(fromTom, toTom);
    if (diff === 0) return text;
    const useFlats = prefersFlats(toTom);

    const lines = text.split('\n');
    const result = lines.map(line => {
        if (isChordLine(line)) {
            return transposeChordLine(line, diff, useFlats);
        }
        // Se a linha tem indicação explícita como "[Intro] G D/F# Em7"
        if (/^\[.+\]\s*[A-G]/.test(line.trim())) {
            return transposeChordLine(line, diff, useFlats);
        }
        return line;
    });

    return result.join('\n');
}

// Transpõe um texto cifrado por quantidade direta de semitons (+1, -1, etc.)
export function transposeTextBySemitones(text: string, semitones: number): string {
    if (!text || semitones === 0) return text;
    const useFlats = semitones < 0;

    const lines = text.split('\n');
    const result = lines.map(line => {
        if (isChordLine(line)) {
            return transposeChordLine(line, semitones, useFlats);
        }
        if (/^\[.+\]\s*[A-G]/.test(line.trim())) {
            return transposeChordLine(line, semitones, useFlats);
        }
        return line;
    });

    return result.join('\n');
}

// -------------------------------------------------------------
// CATÁLOGO DE LOUVORES E HINOS ORIGINAIS (CGADB / HARPA / GOSPEL)
// -------------------------------------------------------------
export const AUTHENTIC_CHRISTIAN_SONGS: AuthenticSong[] = [
    // --- HARPA CRISTÃ ---
    {
        id: 'harpa_545',
        titulo: 'Porque Ele Vive',
        artista: 'Harpa Cristã (Hino 545)',
        tomOriginal: 'G',
        ritmo: 'Balada 4/4',
        bpm: 72,
        tags: ['harpa', '545', 'porque ele vive', 'ressurreicao', 'esperança'],
        letraCifra: `[Intro]
G   D   Em7   C9   D

[Primeira Parte]
G                    C
Deus enviou Seu Filho amado
G     Em     Am      D
Pra me salvar e perdoar
G                      C
Na cruz morreu por meus pecados
G       Em     C     D          G    D
Mas o sepulcro vazio está, porque Ele vive

[Refrão]
G             C            Cm
Porque Ele vive, posso crer no amanhã
G     Em    Am     D
Porque Ele vive, temor não há
G           C          Cm
Mas eu bem sei, que o meu futuro
G       Em     Am     D      G
Está nas mãos do meu Jesus, que vivo está

[Segunda Parte]
G                  C
E quando, pois, a criancinha
G       Em    Am    D
Recebe vida e proteção
G                    C
Quão grande amor tem o infante
G       Em      C     D         G    D
E que consolo traz saber que Ele vive

[Refrão]
G             C            Cm
Porque Ele vive, posso crer no amanhã
G     Em    Am     D
Porque Ele vive, temor não há
G           C          Cm
Mas eu bem sei, que o meu futuro
G       Em     Am     D      G
Está nas mãos do meu Jesus, que vivo está

[Terceira Parte]
G                      C
E quando, enfim, chegar a hora
G       Em    Am    D
Em que a morte enfrentarei
G                    C
Sem medo, então, terei vitória
G       Em      C     D         G    D
Verei na glória, o meu Jesus que vivo está

[Refrão Final]
G             C            Cm
Porque Ele vive, posso crer no amanhã
G     Em    Am     D
Porque Ele vive, temor não há
G           C          Cm
Mas eu bem sei, que o meu futuro
G       Em     Am     D      G
Está nas mãos do meu Jesus, que vivo está

[Final]
C9   Cm   G`
    },
    {
        id: 'harpa_526',
        titulo: 'Grandioso És Tu',
        artista: 'Harpa Cristã (Hino 526)',
        tomOriginal: 'A',
        ritmo: 'Hino 4/4',
        bpm: 76,
        tags: ['harpa', '526', 'grandioso es tu', 'adoracao', 'criacao'],
        letraCifra: `[Intro]
A   D   A   E7   A

[Primeira Parte]
A                     D
Senhor meu Deus, quando eu maravilhado
A             E7            A
Fico a pensar nas obras de Tuas mãos
A                 D
No céu azul de estrelas pontilhado
A            E7            A
O Seu poder mostrando a criação

[Refrão]
A            D            A
Então minh'alma canta a Ti, Senhor:
F#m      Bm    E7      A   E7
Grandioso és Tu! Grandioso és Tu!
A            D            A
Então minh'alma canta a Ti, Senhor:
F#m      Bm    E7       A
Grandioso és Tu! Grandioso és Tu!

[Segunda Parte]
A                       D
Ao caminhar nas matas e florestas
A               E7          A
Ouvindo as aves alegres a cantar
A                     D
Ao ver os montes e vales com festas
A             E7            A
E o rio manso a murmúrios passar

[Refrão]
A            D            A
Então minh'alma canta a Ti, Senhor:
F#m      Bm    E7      A   E7
Grandioso és Tu! Grandioso és Tu!
A            D            A
Então minh'alma canta a Ti, Senhor:
F#m      Bm    E7       A
Grandioso és Tu! Grandioso és Tu!

[Terceira Parte]
A                      D
Quando eu contemplo a cruz de dor e morte
A             E7             A
Onde Jesus por mim sofreu na dor
A                 D
E ressuscitou mudando a minha sorte
A            E7           A
Perdoador e grande Salvador

[Refrão]
A            D            A
Então minh'alma canta a Ti, Senhor:
F#m      Bm    E7      A   E7
Grandioso és Tu! Grandioso és Tu!
A            D            A
Então minh'alma canta a Ti, Senhor:
F#m      Bm    E7       A
Grandioso és Tu! Grandioso és Tu!

[Quarta Parte]
A                        D
Quando, afinal, Jesus vier na glória
A             E7          A
E ao doce lar me arrebatar enfim
A                   D
Adorarei cantando a Sua vitória
A               E7          A
E o Seu amor sem termo para mim

[Refrão Final]
A            D            A
Então minh'alma canta a Ti, Senhor:
F#m      Bm    E7      A   E7
Grandioso és Tu! Grandioso és Tu!
A            D            A
Então minh'alma canta a Ti, Senhor:
F#m      Bm    E7       A
Grandioso és Tu! Grandioso és Tu!`
    },
    {
        id: 'harpa_015',
        titulo: 'Foi na Cruz',
        artista: 'Harpa Cristã (Hino 15)',
        tomOriginal: 'E',
        ritmo: 'Hino 3/4',
        bpm: 84,
        tags: ['harpa', '15', 'foi na cruz', 'salvacao'],
        letraCifra: `[Intro]
E   B7   E

[Primeira Parte]
E                  B7
Oh! Quão cego andei e perdido vaguei
F#m      B7     E
Longe, longe do meu Salvador!
E                   A
Mas da glória desceu e Seu sangue verteu
E         B7        E
Pra salvar um tão pobre pecador

[Refrão]
E                 B7
Foi na cruz, foi na cruz onde um dia eu vi
F#m       B7      E
Meu pecado castigado em Jesus
E                   A
Foi ali pela fé que os olhos abri
E          B7       E
E agora me alegro em Sua luz!

[Segunda Parte]
E                   B7
Foi mui triste a dor que Jesus suportou
F#m      B7     E
Ao morrer na montanha da dor
E                 A
Nenhuma queixa Sua boca soltou
E         B7         E
Ao pagar pelo vil pecador

[Refrão]
E                 B7
Foi na cruz, foi na cruz onde um dia eu vi
F#m       B7      E
Meu pecado castigado em Jesus
E                   A
Foi ali pela fé que os olhos abri
E          B7       E
E agora me alegro em Sua luz!

[Terceira Parte]
E                   B7
Mais que o ouro e a prata de valor sem igual
F#m      B7     E
É o sangue de Cristo Jesus
E                A
Ele lava e remove a culpa moral
E         B7       E
E o homem redime na cruz

[Refrão]
E                 B7
Foi na cruz, foi na cruz onde um dia eu vi
F#m       B7      E
Meu pecado castigado em Jesus
E                   A
Foi ali pela fé que os olhos abri
E          B7       E
E agora me alegro em Sua luz!

[Quarta Parte]
E                  B7
Oh! Que bênção real meu Jesus me outorgou
F#m      B7       E
Quando em vida e amor me acolheu!
E                  A
Para sempre cantarei o que Ele operou
E         B7        E
Pois minh'alma da morte ergueu

[Refrão Final]
E                 B7
Foi na cruz, foi na cruz onde um dia eu vi
F#m       B7      E
Meu pecado castigado em Jesus
E                   A
Foi ali pela fé que os olhos abri
E          B7       E
E agora me alegro em Sua luz!`
    },
    {
        id: 'harpa_039',
        titulo: 'Alvo Mais Que a Neve',
        artista: 'Harpa Cristã (Hino 39)',
        tomOriginal: 'G',
        ritmo: 'Hino 3/4',
        bpm: 88,
        tags: ['harpa', '39', 'alvo mais que a neve', 'purificacao'],
        letraCifra: `[Intro]
G   D7   G

[Primeira Parte]
G               D7
Bendito seja o Cordeiro
C          D7      G
Que no Calvário morreu!
G                D7
Bendito seja o Seu sangue
C           D7       G
Que por nós todos verteu!

[Refrão]
G               C
Alvo mais que a neve!
D7              G
Alvo mais que a neve!
G      G7        C       Cm
Sim, nesse sangue lavado
G           D7       G
Mais alvo que a neve serei!

[Segunda Parte]
G                  D7
Quão espinhosa a coroa
C           D7      G
Que Jesus Cristo levou!
G                 D7
Quão penosa e amarga
C          D7     G
A dor que Ele suportou!

[Refrão]
G               C
Alvo mais que a neve!
D7              G
Alvo mais que a neve!
G      G7        C       Cm
Sim, nesse sangue lavado
G           D7       G
Mais alvo que a neve serei!

[Terceira Parte]
G                 D7
Se nós a Ti confessarmos
C           D7      G
Toda a miséria e o mal
G                  D7
Tu nos perdoas e limpas
C        D7        G
Com Teu poder sem igual!

[Refrão]
G               C
Alvo mais que a neve!
D7              G
Alvo mais que a neve!
G      G7        C       Cm
Sim, nesse sangue lavado
G           D7       G
Mais alvo que a neve serei!

[Quarta Parte]
G                 D7
Vem, ó Jesus, e me lava
C           D7     G
No Teu precioso carmim!
G                 D7
E viverei para sempre
C          D7       G
Com Teu poder sobre mim!

[Refrão Final]
G               C
Alvo mais que a neve!
D7              G
Alvo mais que a neve!
G      G7        C       Cm
Sim, nesse sangue lavado
G           D7       G
Mais alvo que a neve serei!`
    },
    {
        id: 'harpa_577',
        titulo: 'Em Fervente Oração',
        artista: 'Harpa Cristã (Hino 577)',
        tomOriginal: 'F',
        ritmo: 'Hino 4/4',
        bpm: 78,
        tags: ['harpa', '577', 'em fervente oracao', 'oracao'],
        letraCifra: `[Intro]
F   Bb   F   C7   F

[Primeira Parte]
F                     Bb
Em fervente oração, vem o teu coração
F          Dm        Gm   C7
Na presença de Deus derramar!
F                      Bb
Mas não podes fruir o que estás a pedir
F          C7          F
Sem que tudo no altar colocar!

[Refrão]
F                   C7
Tudo entregarás? Tudo entregarás?
Bb          C7        F
Para as bênçãos de Deus receber?
F         F7          Bb       Bbm
Se o teu coração derramar em oração
F           C7       F
Grandes bênçãos irás receber!

[Segunda Parte]
F                    Bb
Se as mãos tu ergueres com toda a fé
F            Dm          Gm  C7
Esperando do céu Teu favor
F                     Bb
Deus atende o clamor e renova as forças
F            C7          F
Pelo Seu infinito amor!

[Refrão]
F                   C7
Tudo entregarás? Tudo entregarás?
Bb          C7        F
Para as bênçãos de Deus receber?
F         F7          Bb       Bbm
Se o teu coração derramar em oração
F           C7       F
Grandes bênçãos irás receber!

[Terceira Parte]
F                   Bb
Ó que glória sublime nos traz o Senhor
F           Dm        Gm  C7
Quando a vida no altar está!
F                  Bb
O Espírito Santo derrama Seu fogo
F          C7         F
E a vitória bendita nos dá!

[Refrão Final]
F                   C7
Tudo entregarás? Tudo entregarás?
Bb          C7        F
Para as bênçãos de Deus receber?
F         F7          Bb       Bbm
Se o teu coração derramar em oração
F           C7       F
Grandes bênçãos irás receber!`
    },
    {
        id: 'harpa_525',
        titulo: 'Vencendo Vem Jesus',
        artista: 'Harpa Cristã (Hino 525)',
        tomOriginal: 'Bb',
        ritmo: 'Marcial 4/4',
        bpm: 104,
        tags: ['harpa', '525', 'vencendo vem jesus', 'batalha', 'vitoria'],
        letraCifra: `[Intro]
Bb   Eb   Bb   F7   Bb

[Primeira Parte]
Bb
Já refulge a glória eterna de Jesus o Rei dos reis
Eb                       Bb
Breve os reinos deste mundo seguirão as Suas leis
Bb                   Gm
Os sinais da Sua vinda mais se mostram cada vez
Cm        F7   Bb
Vencendo vem Jesus!

[Refrão]
Bb
Glória, glória! Aleluia!
Eb               Bb
Glória, glória! Aleluia!
Bb            Gm
Glória, glória! Aleluia!
Cm        F7   Bb
Vencendo vem Jesus!

[Segunda Parte]
Bb
O clarim que chama os crentes já começa a soar
Eb                       Bb
Cristo à frente do Seu povo multidões vai comandar
Bb                   Gm
Para sempre o inimigo nós havemos de esmagar
Cm        F7   Bb
Vencendo vem Jesus!

[Refrão]
Bb
Glória, glória! Aleluia!
Eb               Bb
Glória, glória! Aleluia!
Bb            Gm
Glória, glória! Aleluia!
Cm        F7   Bb
Vencendo vem Jesus!

[Terceira Parte]
Bb
Eis que em glória refulgente sobre as nuvens descerá
Eb                     Bb
E as nações e todo o olho o Seu brilho contemplará
Bb                   Gm
E prostrados ante o trono o Seu povo cantará:
Cm        F7   Bb
Vencendo vem Jesus!

[Refrão Final]
Bb
Glória, glória! Aleluia!
Eb               Bb
Glória, glória! Aleluia!
Bb            Gm
Glória, glória! Aleluia!
Cm        F7   Bb
Vencendo vem Jesus!`
    },
    {
        id: 'harpa_291',
        titulo: 'A Mensagem da Cruz',
        artista: 'Harpa Cristã (Hino 291)',
        tomOriginal: 'Bb',
        ritmo: 'Hino 3/4',
        bpm: 80,
        tags: ['harpa', '291', 'a mensagem da cruz', 'rude cruz'],
        letraCifra: `[Intro]
Bb   Eb   Bb   F7   Bb

[Primeira Parte]
Bb                     Eb
Rude cruz se erigiu, dela o dia fugiu
Bb           C7       F7
Como emblema de vergonha e dor
Bb                     Eb
Mas eu amo essa cruz onde morreu Jesus
Bb           F7          Bb
Pois por mim Se entregou por amor

[Refrão]
F7               Bb
Sim, eu amo a mensagem da cruz
Eb                    Bb
Té morrer eu a vou proclamar
Bb                    Eb
Levarei eu também minha cruz
Bb           F7       Bb
Té por uma coroa trocar!

[Segunda Parte]
Bb                    Eb
Desde a glória dos céus, o Cordeiro de Deus
Bb          C7        F7
Ao Calvário humilde baixou
Bb                   Eb
Essa cruz tem pra mim atrativos sem fim
Bb          F7        Bb
Porque nela Jesus me salvou

[Refrão]
F7               Bb
Sim, eu amo a mensagem da cruz
Eb                    Bb
Té morrer eu a vou proclamar
Bb                    Eb
Levarei eu também minha cruz
Bb           F7       Bb
Té por uma coroa trocar!

[Terceira Parte]
Bb                   Eb
Nessa cruz padeceu e por mim morreu
Bb         C7       F7
Meu amado e bom Salvador
Bb                  Eb
O Seu sangue verteu e a paz concedeu
Bb          F7         Bb
Ao mais vil e rebelde transgressor

[Refrão]
F7               Bb
Sim, eu amo a mensagem da cruz
Eb                    Bb
Té morrer eu a vou proclamar
Bb                    Eb
Levarei eu também minha cruz
Bb           F7       Bb
Té por uma coroa trocar!

[Quarta Parte]
Bb                   Eb
Eu a cruz levarei e a Jesus servirei
Bb         C7         F7
Com fervor e com gratidão
Bb                  Eb
E um dia verei no Seu reino de luz
Bb           F7      Bb
O meu prêmio e galardão

[Refrão Final]
F7               Bb
Sim, eu amo a mensagem da cruz
Eb                    Bb
Té morrer eu a vou proclamar
Bb                    Eb
Levarei eu também minha cruz
Bb           F7       Bb
Té por uma coroa trocar!`
    },
    {
        id: 'harpa_193',
        titulo: 'A Alma Abatida',
        artista: 'Harpa Cristã (Hino 193)',
        tomOriginal: 'G',
        ritmo: 'Hino 4/4',
        bpm: 72,
        tags: ['harpa', '193', 'a alma abatida', 'consolo'],
        letraCifra: `[Intro]
G   C   G   D7   G

[Primeira Parte]
G                   C        G
Se tu, minh'alma, a Deus suplicas
D7             G
E não recebes, confiando ficas
G                 C       G
Em Suas promessas que são mui ricas
D7                G
E infalíveis pra te valer

[Refrão]
G                    D7
Por que te abates, ó minha alma?
C         D7       G
E te comoves, perde a tua calma?
G                C       Cm
Não temas, crê, e espera em Deus
G        D7          G
Porque ainda O louvarás!

[Segunda Parte]
G                   C      G
Embora vejas tempestades bravas
D7              G
Açoitando o teu frágil barco
G                 C        G
Jesus ao lado do leme descansa
D7              G
E com poder Ele vai mandar

[Refrão]
G                    D7
Por que te abates, ó minha alma?
C         D7       G
E te comoves, perde a tua calma?
G                C       Cm
Não temas, crê, e espera em Deus
G        D7          G
Porque ainda O louvarás!

[Terceira Parte]
G                  C      G
Não desanimes, ó crente remido
D7              G
Deus ouve o gemido do Teu coração
G                C        G
Ele transforma a dor em vitória
D7                 G
E te conduz pela Sua mão

[Refrão Final]
G                    D7
Por que te abates, ó minha alma?
C         D7       G
E te comoves, perde a tua calma?
G                C       Cm
Não temas, crê, e espera em Deus
G        D7          G
Porque ainda O louvarás!`
    },
    {
        id: 'harpa_578',
        titulo: 'Sossegai',
        artista: 'Harpa Cristã (Hino 578)',
        tomOriginal: 'C',
        ritmo: 'Hino 6/8',
        bpm: 64,
        tags: ['harpa', '578', 'sossegai', 'paz', 'tempestade'],
        letraCifra: `[Intro]
C   G   F   G   C

[Primeira Parte]
C                 G
Mestre! O mar se revolta
F                C
As ondas nos dão pavor!
C                 G
O céu se reveste de trevas
F                G
Não temos um Salvador!
Am               Em
Não se Te dá que morramos?
F                C
Podes assim dormir
Dm              Am
Se a cada momento nós vemos
D7              G
Sim, pela morte ruir?

[Refrão]
C
As ondas atendem ao Meu mandar:
G
Sossegai!
F
Quer seja este revolto mar
C
A ira dos homens, o gênio do mal
Am
Não podem a nau naufragar
Dm          G           C
Convosco vai o Senhor dos céus e mar!

[Segunda Parte]
C                 G
Mestre, na minha tristeza
F               C
Estou a me consumir!
C                 G
A dor me aperta o peito
F                G
Não posso mais resistir!
Am             Em
De ondas do mal cercado
F              C
Peço Teu santo favor
Dm               Am
Vem socorrer-me, ó Mestre
D7             G
Salva-me pelo Teu amor!

[Refrão]
C
As ondas atendem ao Meu mandar:
G
Sossegai!
F
Quer seja este revolto mar
C
A ira dos homens, o gênio do mal
Am
Não podem a nau naufragar
Dm          G           C
Convosco vai o Senhor dos céus e mar!

[Terceira Parte]
C                 G
Mestre! Chegou a bonança
F               C
Em paz vejo o céu e o mar!
C                  G
O vento cessou o seu uivo
F               G
E o sol já volta a brilhar!
Am             Em
Ó Salvador compassivo
F              C
Comigo sempre a ficar
Dm              Am
Guia o meu barco seguro
D7             G
Até ao porto da paz!

[Refrão Final]
C
As ondas atendem ao Meu mandar:
G
Sossegai!
F
Quer seja este revolto mar
C
A ira dos homens, o gênio do mal
Am
Não podem a nau naufragar
Dm          G           C
Convosco vai o Senhor dos céus e mar!`
    },
    {
        id: 'harpa_547',
        titulo: 'O Rei Está Voltando',
        artista: 'Harpa Cristã (Hino 547)',
        tomOriginal: 'G',
        ritmo: 'Hino 4/4',
        bpm: 76,
        tags: ['harpa', '547', 'o rei esta voltando', 'escatologia', 'volta de jesus'],
        letraCifra: `[Intro]
G   C   G   D   G

[Primeira Parte]
G                      C
Os fiéis são trasladados, seu trabalho aqui findou
G                      D
A carreira dos remidos nesta terra já cessou
G                      C
Do sepulcro os remidos ressurgiram com poder
G            D          G
Para a glória eterna com Jesus viver

[Refrão]
G                C           G
O Rei está voltando! O Rei está voltando!
Em                 A7      D
A trombeta está tocando, o meu nome vai chamar!
G                C           G
Sim, o Rei está voltando! O Rei está voltando!
Em        Am        D         G
Aleluia! Ele vem me buscar!

[Segunda Parte]
G                       C
Desta terra os remidos vão subindo em esplendor
G                      D
Encontrar nos ares com o amado Salvador
G                      C
Toda a lágrima enxugada pelo Sumo Redentor
G           D          G
Para sempre louvaremos ao Senhor

[Refrão]
G                C           G
O Rei está voltando! O Rei está voltando!
Em                 A7      D
A trombeta está tocando, o meu nome vai chamar!
G                C           G
Sim, o Rei está voltando! O Rei está voltando!
Em        Am        D         G
Aleluia! Ele vem me buscar!

[Terceira Parte]
G                    C
Multidões que foram salvas pelo sangue de Jesus
G                     D
Eis que cantam a vitória ao redor da santa luz
G                    C
Aleluia para sempre ao Cordeiro vencedor
G             D          G
Que nos deu a vida pelo Seu amor!

[Refrão Final]
G                C           G
O Rei está voltando! O Rei está voltando!
Em                 A7      D
A trombeta está tocando, o meu nome vai chamar!
G                C           G
Sim, o Rei está voltando! O Rei está voltando!
Em        Am        D         G
Aleluia! Ele vem me buscar!`
    },
    {
        id: 'harpa_001',
        titulo: 'Chuva de Graça',
        artista: 'Harpa Cristã (Hino 1)',
        tomOriginal: 'Bb',
        ritmo: 'Hino 6/8',
        bpm: 68,
        tags: ['harpa', '1', 'chuva de graca'],
        letraCifra: `[Intro]
Bb   Eb   Bb   F7   Bb

[Primeira Parte]
Bb
Deus prometeu derramar chuvas de graça do céu
Eb                     Bb
Bênçãos que todos terão, cumprindo o que prometeu

[Refrão]
Bb                   Eb
Chuvas de bênçãos, chuvas de bênçãos dos céus
Bb           Gm        Cm        F7      Bb
Gotas benditas já temos, mas as chuvas pedimos a Deus!

[Segunda Parte]
Bb
Cristo nos dá esperança, renova o nosso fervor
Eb                     Bb
Manda a chuva bendita, transborda o Teu amor!

[Refrão]
Bb                   Eb
Chuvas de bênçãos, chuvas de bênçãos dos céus
Bb           Gm        Cm        F7      Bb
Gotas benditas já temos, mas as chuvas pedimos a Deus!

[Terceira Parte]
Bb
Dá-nos agora, Senhor, bênçãos de paz e poder
Eb                     Bb
Faz Tua igreja avivada em santidade crescer!

[Refrão Final]
Bb                   Eb
Chuvas de bênçãos, chuvas de bênçãos dos céus
Bb           Gm        Cm        F7      Bb
Gotas benditas já temos, mas as chuvas pedimos a Deus!`
    },

    // --- LOUVORES CONTEMPORÂNEOS COMPLETOS (INTEGRAIS) ---
    {
        id: 'bondade_de_deus',
        titulo: 'Bondade de Deus',
        artista: 'Isaías Saad',
        tomOriginal: 'G',
        ritmo: 'Adoração 6/8',
        bpm: 70,
        tags: ['isaias saad', 'bondade de deus', 'goodness of god'],
        letraCifra: `[Intro]
G   C9   G   C9

[Verso 1]
      G                  C9
Te amo, Deus, Tua graça nunca falha
    D/F#  Em          C9           D
Todos os dias eu estou em Tuas mãos
                Em      C9
Desde quando me levanto
            G   D/F#  Em
Até o meu deitar
      C9          D             G
Eu cantarei da bondade de Deus

[Refrão]
C9                      G
   És fiel em todo tempo
C9                          G            D
   Em todo tempo Tu és tão, tão bom
C9                         Em     D/F#  C9
   Com todo fôlego que há em mim
                  D             G
   Eu cantarei da bondade de Deus

[Verso 2]
      G                      C9
Tua doce voz que me guia em meio ao fogo
     D/F#  Em        C9             D
Na escuridão Tua presença me sustenta
            Em        C9
Te chamo de Pai
             G   D/F#  Em
Te chamo de Amigo
      C9         D             G
Eu vivi na bondade de Deus

[Refrão]
C9                      G
   És fiel em todo tempo
C9                          G            D
   Em todo tempo Tu és tão, tão bom
C9                         Em     D/F#  C9
   Com todo fôlego que há em mim
                  D             G
   Eu cantarei da bondade de Deus

[Ponte]
G/B        C9
Tua bondade me seguirá
     D              G
Me seguirá, Senhor
G/B        C9
Tua bondade me seguirá
     D              G
Me seguirá, Senhor
       G/B            C9
Eu me rendo a Ti, me entrego a Ti
     D              Em
Minha vida é Teu altar
G/B        C9
Tua bondade me seguirá
     D              G
Me seguirá, Senhor

[Refrão Final]
C9                      G
   És fiel em todo tempo
C9                          G            D
   Em todo tempo Tu és tão, tão bom
C9                         Em     D/F#  C9
   Com todo fôlego que há em mim
                  D             G
   Eu cantarei da bondade de Deus

[Final]
C9   D   G`
    },
    {
        id: 'a_casa_e_sua',
        titulo: 'A Casa É Sua',
        artista: 'Casa Worship',
        tomOriginal: 'G',
        ritmo: 'Adoração 4/4',
        bpm: 68,
        tags: ['casa worship', 'a casa e sua', 'intimidade', 'presenca'],
        letraCifra: `[Intro]
C9   Em7   D   C9   Em7   D

[Verso 1]
C9                       Em7
Você é bem-vindo aqui, a casa é Sua
D
Pode entrar
C9                       Em7
Você é bem-vindo aqui, a casa é Sua
D
Pode entrar

[Pré-Refrão]
C9
Não vamos nos calar
Em7
Nós Te adoramos
D
Nós Te adoramos, Jesus

[Refrão]
C9                   Em7
Essa casa é Sua casa, nós deixamos ela pra Você
D
Jesus!
C9                   Em7
Essa casa é Sua casa, nós deixamos ela pra Você
D
Jesus!

[Verso 2]
C9                       Em7
Entra no meu coração, faz Tua morada
D
Pode reinar
C9                       Em7
Tudo o que eu tenho é Teu, meu Pai amado
D
Pode mandar

[Refrão]
C9                   Em7
Essa casa é Sua casa, nós deixamos ela pra Você
D
Jesus!
C9                   Em7
Essa casa é Sua casa, nós deixamos ela pra Você
D
Jesus!

[Ponte]
C9
Apareça, que o Teu nome cresça
Em7
Enche este lugar
D
Enche este lugar!
C9
Apareça, que o Teu nome cresça
Em7
Enche este lugar
D
Enche este lugar!

[Refrão Final]
C9                   Em7
Essa casa é Sua casa, nós deixamos ela pra Você
D
Jesus!
C9                   Em7
Essa casa é Sua casa, nós deixamos ela pra Você
D          G
Jesus!

[Final]
C9   Em7   D   G`
    },
    {
        id: 'lugar_secreto',
        titulo: 'Lugar Secreto',
        artista: 'Gabriela Rocha',
        tomOriginal: 'E',
        ritmo: 'Balada 4/4',
        bpm: 68,
        tags: ['gabriela rocha', 'lugar secreto'],
        letraCifra: `[Intro]
E   B   C#m   A

[Verso 1]
E                          B
Tu és tudo o que eu mais quero
                     C#m
O meu fôlego, como eu Te amo
                     A
Meu coração pertence a Ti
E                  B
Tu és o ar que eu respiro
                   C#m
A minha canção na noite
                     A
Meu amor é todo Teu

[Refrão]
E                    B
Tudo o que eu mais quero é Te ver
C#m                 A
Me leva pra sala do trono
E                    B
Mostra Tua glória a mim
C#m               A
No Teu santo lugar secreto

[Verso 2]
E                       B
Não há outro amor tão puro
                      C#m
Que me abraça e me sustenta
                     A
Que me chama de amigo Seu
E                    B
Eu me achego com confiança
                  C#m
No santuário do Altíssimo
                  A
Pra Te adorar, Senhor

[Refrão]
E                    B
Tudo o que eu mais quero é Te ver
C#m                 A
Me leva pra sala do trono
E                    B
Mostra Tua glória a mim
C#m               A
No Teu santo lugar secreto

[Ponte]
E
Eu sou Teu filho, a Tua casa
B
Tu és meu Pai e meu Pastor
C#m
Quero ficar aqui pra sempre
A
Em Tua santa presença

[Refrão Final]
E                    B
Tudo o que eu mais quero é Te ver
C#m                 A
Me leva pra sala do trono
E                    B
Mostra Tua glória a mim
C#m               A         E
No Teu santo lugar secreto

[Final]
B   C#m   A   E`
    },
    {
        id: 'todavia_me_alegrarei',
        titulo: 'Todavia Me Alegrarei',
        artista: 'Samuel Messias',
        tomOriginal: 'G',
        ritmo: 'Balada 4/4',
        bpm: 65,
        tags: ['samuel messias', 'todavia me alegrarei', 'habacuque'],
        letraCifra: `[Intro]
G   D/F#   Em7   C9

[Verso 1]
G                         D/F#
Eu olhei a tristeza nos olhos e sorri
Em7                     C9
Mesmo na dor eu decidi não desistir
G                     D/F#
Ainda que a figueira não floresça
Em7                       C9
E não haja fruto nas videiras

[Verso 2]
G                          D/F#
Mesmo que o produto da oliveira minta
Em7                       C9
E os campos não produzam mantimento
G                          D/F#
As ovelhas da malhada sejam arrebatadas
Em7                         C9
E nos currais não haja gado

[Refrão]
G                 D/F#
Todavia eu me alegrarei
Em7               C9
No Deus da minha salvação
G                 D/F#
Ele é a minha força e meu refúgio
Em7          C9           G
O Deus que cuida do meu coração

[Ponte]
G
O Senhor Jeová é a minha força
D/F#
Ele faz os meus pés como os das corças
Em7
E me faz andar
C9
Em lugares altos

[Refrão Final]
G                 D/F#
Todavia eu me alegrarei
Em7               C9
No Deus da minha salvação
G                 D/F#
Ele é a minha força e meu refúgio
Em7          C9           G
O Deus que cuida do meu coração

[Final]
D/F#   Em7   C9   G`
    },
    {
        id: 'o_escudo',
        titulo: 'O Escudo',
        artista: 'Voz da Verdade',
        tomOriginal: 'G',
        ritmo: 'Balada 4/4',
        bpm: 72,
        tags: ['voz da verdade', 'o escudo', 'por que te abates'],
        letraCifra: `[Intro]
G   D/F#   Em   C   D

[Primeira Parte]
G
Por que te abates, ó minha alma?
D/F#
E te comoves, perdendo a calma?
Em
Não temas em Deus, espera porque
C                      D
Ainda O louvarei, Ele é meu Salvador

[Refrão]
G                    D/F#
Pois Ele é o Teu escudo e fortaleza
Em                     C          D
Não temas a flecha que voa de dia
G                    D/F#
Mil cairão ao teu lado e dez mil à tua direita
Em                     C        D      G
Mas tu não serás atingido, verás a vitória!

[Segunda Parte]
G
Se pelo fogo passares não te queimarás
D/F#
E pelas águas também não te afogarás
Em
Pois o Senhor Jeová te resgatou
C                    D
E pelo teu nome Ele te chamou

[Refrão]
G                    D/F#
Pois Ele é o Teu escudo e fortaleza
Em                     C          D
Não temas a flecha que voa de dia
G                    D/F#
Mil cairão ao teu lado e dez mil à tua direita
Em                     C        D      G
Mas tu não serás atingido, verás a vitória!

[Terceira Parte]
G
Nenhum mal te sucederá
D/F#
Nem praga alguma à tua tenda chegará
Em
Porque aos Seus anjos dará ordem a teu respeito
C                      D
Para te guardarem em todos os teus caminhos

[Refrão Final]
G                    D/F#
Pois Ele é o Teu escudo e fortaleza
Em                     C          D
Não temas a flecha que voa de dia
G                    D/F#
Mil cairão ao teu lado e dez mil à tua direita
Em                     C        D      G
Mas tu não serás atingido, verás a vitória!

[Final]
D/F#   Em   C   D   G`
    },
    {
        id: 'ressuscita_me',
        titulo: 'Ressuscita-me',
        artista: 'Aline Barros',
        tomOriginal: 'D',
        ritmo: 'Balada 4/4',
        bpm: 68,
        tags: ['aline barros', 'ressuscita-me', 'milagre', 'lazaro'],
        letraCifra: `[Intro]
C6   G/B   Gm/Bb   D/A   A4   D

[Primeira Parte]
D       A4      A
Mestre, eu preciso de um milagre
Bm
Transforma minha vida, o meu estado
D             A4    A
Faz tempo que não vejo a luz do dia
Bm
Estão tentando sepultar minha alegria
G
Tentando ver meus sonhos cancelados

[Pré-Refrão]
Em7                D/F#
Lázaro ouviu a Sua voz
G               A4   A
Quando aquela pedra removeu
Em7                D/F#
Depois de quatro dias ele reviveu
G                 A4   A
Mestre, não há outro igual a Ti

[Refrão]
D
Remove a minha pedra
A
Me chama pelo nome
Bm
Muda a minha história
G
Ressuscita os meus sonhos
D
Transforma a minha vida
A
Me faz um milagre
Bm
Me toca nessa hora
G
Me chama para fora
Em7   D/F#   G       A     D
Ressuscita-me!

[Segunda Parte]
D                  A4   A
Ainda que o tempo passe e digam que findou
Bm
Tua promessa viva em mim restou
D               A4     A
Jesus, a Tua presença me renova
Bm
E traz de volta o que o tempo levou
G
Tu és o Deus da ressurreição!

[Pré-Refrão]
Em7                D/F#
Lázaro ouviu a Sua voz
G               A4   A
Quando aquela pedra removeu
Em7                D/F#
Depois de quatro dias ele reviveu
G                 A4   A
Mestre, não há outro igual a Ti

[Refrão]
D
Remove a minha pedra
A
Me chama pelo nome
Bm
Muda a minha história
G
Ressuscita os meus sonhos
D
Transforma a minha vida
A
Me faz um milagre
Bm
Me toca nessa hora
G
Me chama para fora
Em7   D/F#   G       A     D
Ressuscita-me!

[Ponte]
Bm                      F#m
Tu és a ressurreição e a vida
G                      D
Aquele que crê em Ti viverá
Bm                     F#m
Ainda que esteja morto reviverá
G                    A4   A
Ressuscita-me, Senhor!

[Refrão Final]
D
Remove a minha pedra
A
Me chama pelo nome
Bm
Muda a minha história
G
Ressuscita os meus sonhos
D
Transforma a minha vida
A
Me faz um milagre
Bm
Me toca nessa hora
G
Me chama para fora
Em7   D/F#   G       A     D
Ressuscita-me!

[Final]
C6   G/B   Gm/Bb   D`
    },
    {
        id: 'aquieta_minhalma',
        titulo: 'Aquieta Minh\'alma',
        artista: 'Ministério Zoe',
        tomOriginal: 'C',
        ritmo: 'Balada 4/4',
        bpm: 66,
        tags: ['zoe', 'aquieta minhalma', 'intimidade'],
        letraCifra: `[Intro]
C   G   Am   F

[Verso 1]
C
Aquieta minh'alma
G
Faz meu coração ouvir Tua voz
Am
Me chama pra perto
F
Só pra ouvir Teu respirar
C
Não quero os aplausos do mundo
G
Eu quero apenas Teu olhar
Am
Segura em minha mão
F
E me ensina a Te amar

[Refrão]
C
E tudo o que eu preciso está em Ti
G
O Teu amor me basta
Am
Aquieta minh'alma
F
E me faz descansar no Teu amor

[Verso 2]
C
Mesmo que as ondas se levantem
G
Eu sei que Tu estás no barco
Am
Tu és o socorro bem presente
F
Na hora da tribulação
C
Eu calo minha voz pra Te ouvir
G
Derramo minha vida aos Teus pés
Am
Pois onde Tu estás
F
É o melhor lugar

[Refrão]
C
E tudo o que eu preciso está em Ti
G
O Teu amor me basta
Am
Aquieta minh'alma
F
E me faz descansar no Teu amor

[Ponte]
C
Eu me deito em paz e pego no sono
G
Porque só Tu, Senhor, me fazes viver seguro
Am
O Teu amor é mais forte que a morte
F
E a Tua graça me sustenta

[Refrão Final]
C
E tudo o que eu preciso está em Ti
G
O Teu amor me basta
Am
Aquieta minh'alma
F
E me faz descansar no Teu amor

[Final]
C   G   Am   F   C`
    },
    {
        id: 'em_espirito_em_verdade',
        titulo: 'Em Espírito, Em Verdade',
        artista: 'Ministério Koinonya de Louvor',
        tomOriginal: 'F',
        ritmo: 'Adoração 4/4',
        bpm: 68,
        tags: ['koinonya', 'em espirito em verdade', 'adoracao'],
        letraCifra: `[Intro]
F   C/E   Dm   Bb   C

[Primeira Parte]
F             C/E
Em espírito, em verdade
Dm             Am
Te adoramos, Te adoramos
Bb            F/A
Em espírito, em verdade
Gm     C       F
Te adoramos, Rei Jesus

[Refrão]
F             C/E
Rei dos reis e Senhor
Dm           Am
Te entregamos nosso louvor
Bb         F/A
Toda glória e majestade
Gm          C      F
Ao Cordeiro e Salvador

[Segunda Parte]
F             C/E
Tua presença enche a terra
Dm            Am
Teu poder nos restaura
Bb           F/A
Com o Teu povo proclamamos
Gm        C      F
Tu és Santo, ó Senhor

[Refrão Final]
F             C/E
Rei dos reis e Senhor
Dm           Am
Te entregamos nosso louvor
Bb         F/A
Toda glória e majestade
Gm          C      F
Ao Cordeiro e Salvador

[Final]
Bb   C   F`
    },
    {
        id: 'me_atraiu',
        titulo: 'Me Atraiu',
        artista: 'Gabriela Rocha',
        tomOriginal: 'A',
        ritmo: 'Balada 4/4',
        bpm: 70,
        tags: ['gabriela rocha', 'me atraiu'],
        letraCifra: `[Intro]
A   E   F#m   D

[Verso 1]
A                       E
O Teu olhar de amor me encontrou
F#m                     D
Tua voz suave me chamou pelo nome
A                       E
Não resisti à Tua presença santa
F#m                     D
O Teu amor me constrangeu

[Verso 2]
A                      E
Eu poderia estar em qualquer lugar
F#m                    D
Mas Tu me escolheste para Te adorar
A                       E
Deixei para trás o meu velho viver
F#m                   D
Para aos Teus pés permanecer

[Refrão]
A            E
Me atraiu, me atraiu
F#m          D
O Teu amor me conquistou
A            E
Me atraiu, me atraiu
F#m         D          A
Para sempre aos Teus pés estou

[Ponte]
F#m                 E
Não há nada melhor que estar aqui
D                   A
Em Tua santa habitação
F#m                 E
O Teu amor me resgatou do pó
D                   E
E me deu nova canção

[Refrão Final]
A            E
Me atraiu, me atraiu
F#m          D
O Teu amor me conquistou
A            E
Me atraiu, me atraiu
F#m         D          A
Para sempre aos Teus pés estou

[Final]
E   F#m   D   A`
    },
    {
        id: 'grande_e_o_senhor',
        titulo: 'Grande É o Senhor',
        artista: 'Adhemar de Campos',
        tomOriginal: 'A',
        ritmo: 'Jubiloso 4/4',
        bpm: 110,
        tags: ['adhemar de campos', 'grande e o senhor', 'celebracao'],
        letraCifra: `[Intro]
A   D/A   A   D/A

[Primeira Parte]
A           D/A      A         D/A
Grande é o Senhor e mui digno de louvor
A           D/A        E4   E
Na cidade do nosso Deus, Seu santo monte
A           D/A      A         D/A
Alegria de toda a terra

[Refrão]
A               F#m
Grande é o Senhor em quem nós temos a vitória
Bm               E
Que nos ajuda contra o inimigo
A           F#m
Por isso diante d'Ele nos prostramos
D          E           A
Pois grande é o Senhor!

[Segunda Parte]
A            D/A       A       D/A
Queremos o Teu nome engrandecer
A            D/A       E4   E
E agradecer-Te por Tua bondade
A             D/A          A         D/A
Confiamos em Teu infinito amor e poder
A            D/A        E4   E
Pois só Tu és o Deus eterno

[Refrão]
A               F#m
Grande é o Senhor em quem nós temos a vitória
Bm               E
Que nos ajuda contra o inimigo
A           F#m
Por isso diante d'Ele nos prostramos
D          E           A
Pois grande é o Senhor!

[Ponte]
F#m                 C#m
Sobre toda a terra Ele reinará
D                   A
Com justiça e com poder
F#m                 C#m
Todo joelho se dobrará
D                   E
E toda língua confessará

[Refrão Final]
A               F#m
Grande é o Senhor em quem nós temos a vitória
Bm               E
Que nos ajuda contra o inimigo
A           F#m
Por isso diante d'Ele nos prostramos
D          E           A
Pois grande é o Senhor!

[Final]
D/A   A   D/A   A`
    },
    {
        id: 'ruja_o_leao',
        titulo: 'Ruja o Leão',
        artista: 'Talita Catanzaro',
        tomOriginal: 'G',
        ritmo: 'Adoração 4/4',
        bpm: 70,
        tags: ['ruja o leao', 'talita catanzaro'],
        letraCifra: `[Intro]
G   Em7   C9   D

[Verso 1]
G
Sobre o trono de justiça
Em7
Está o Cordeiro que venceu
C9
Com olhos como chama de fogo
D
Ele é o Santo de Israel

[Refrão]
G
Que ruja o Leão da tribo de Judá!
Em7
Que ruja o Leão da tribo de Judá!
C9
Ouça o Teu povo a clamar
D                     G
Vem governar este lugar!

[Verso 2]
G
Os céus se abrem com o som da Sua voz
Em7
A terra estremece diante do Rei
C9
Toda autoridade Lhe foi dada
D
Ele reina para sempre

[Refrão]
G
Que ruja o Leão da tribo de Judá!
Em7
Que ruja o Leão da tribo de Judá!
C9
Ouça o Teu povo a clamar
D                     G
Vem governar este lugar!

[Ponte]
G
Santo, Santo é o Senhor dos Exércitos
Em7
Toda a terra está cheia da Tua glória
C9
Santo, Santo é o Senhor dos Exércitos
D
Toda a terra está cheia da Tua glória

[Refrão Final]
G
Que ruja o Leão da tribo de Judá!
Em7
Que ruja o Leão da tribo de Judá!
C9
Ouça o Teu povo a clamar
D                     G
Vem governar este lugar!

[Final]
Em7   C9   D   G`
    },
    {
        id: 'vem_me_buscar',
        titulo: 'Vem Me Buscar',
        artista: 'Jefferson e Suellen',
        tomOriginal: 'G',
        ritmo: 'Pentecostal 4/4',
        bpm: 72,
        tags: ['jefferson e suellen', 'vem me buscar', 'arrebatamento'],
        letraCifra: `[Intro]
G   D/F#   Em7   C9

[Verso 1]
G                        D/F#
Não vou me acostumar com este mundo
Em7                     C9
Minha pátria está no céu
G                     D/F#
Os sinais já estão se cumprindo
Em7                 C9
A noiva adornada está

[Refrão]
G                    D/F#
Vem me buscar, Senhor Jesus!
Em7                  C9
Minh'alma clama: Maranata, vem!
G                    D/F#
Não quero ficar aqui, eu quero subir
Em7         C9        G
Vem me buscar, Senhor Jesus!

[Verso 2]
G                     D/F#
A figueira já brotou, o verão perto está
Em7                  C9
O Espírito e a noiva dizem: Vem!
G                     D/F#
Quem tem sede venha e beba da água da vida
Em7                 C9
E prepare-se pra subir

[Refrão]
G                    D/F#
Vem me buscar, Senhor Jesus!
Em7                  C9
Minh'alma clama: Maranata, vem!
G                    D/F#
Não quero ficar aqui, eu quero subir
Em7         C9        G
Vem me buscar, Senhor Jesus!

[Ponte]
Em7
A trombeta vai tocar
C9
O céu vai se abrir
G
Num abrir e fechar de olhos
D/F#
A igreja vai subir!
Em7
Maranata, ora vem!
C9
Maranata, ora vem!
G                    D/F#
Vem me buscar, Senhor Jesus!

[Refrão Final]
G                    D/F#
Vem me buscar, Senhor Jesus!
Em7                  C9
Minh'alma clama: Maranata, vem!
G                    D/F#
Não quero ficar aqui, eu quero subir
Em7         C9        G
Vem me buscar, Senhor Jesus!

[Final]
D/F#   Em7   C9   G`
    },
    {
        id: 'grandes_coisas',
        titulo: 'Grandes Coisas',
        artista: 'Fernandinho',
        tomOriginal: 'D',
        ritmo: 'Jubiloso / Celebrativo',
        bpm: 124,
        tags: ['fernandinho', 'grandes coisas', 'god of this city'],
        letraCifra: `[Intro]
D   G   Bm   G

[Verso 1]
D
Tu és o Deus dessa terra
G
Tu és o Rei desse povo
Bm                         G
És o Senhor dessa nação, Tu és
D
Esperança aos desenganados
G
A luz na escuridão
Bm                            G
És a paz aos desesperados, Tu és

[Refrão]
Bm          A         G
Não há outro Deus como Tu
Bm          A         G
Não há outro Deus como Tu
D
Grandes coisas vão acontecer aqui
A
Grandes coisas vão acontecer aqui
G
Nesta cidade!

[Verso 2]
D
Tu és a cura das dores
G
A salvação dos perdidos
Bm                       G
Tu és o Deus libertador, Tu és
D
Glória e honra ao Teu nome
G
Pois toda terra Te adora
Bm                          G
Cristo ressurreto e triunfador, Tu és

[Refrão]
Bm          A         G
Não há outro Deus como Tu
Bm          A         G
Não há outro Deus como Tu
D
Grandes coisas vão acontecer aqui
A
Grandes coisas vão acontecer aqui
G
Nesta cidade!

[Ponte]
Bm            A               G
Mais e mais Te queremos, ó Senhor
Bm            A               G
Mais e mais Te queremos, ó Senhor
D
Grandes coisas vão acontecer aqui
A
Grandes coisas vão acontecer aqui
G
Nesta cidade!

[Refrão Final]
Bm          A         G
Não há outro Deus como Tu
Bm          A         G
Não há outro Deus como Tu
D
Grandes coisas vão acontecer aqui
A
Grandes coisas vão acontecer aqui
G                 D
Nesta cidade!

[Final]
G   Bm   G   D`
    },
    {
        id: 'raridade',
        titulo: 'Raridade',
        artista: 'Anderson Freire',
        tomOriginal: 'C',
        ritmo: 'Balada Gospel',
        bpm: 72,
        tags: ['anderson freire', 'raridade', 'valor'],
        letraCifra: `[Intro]
C   G/B   Am   F

[Verso 1]
C                             G/B
Não consigo ir além do Teu olhar
                            Am
Tudo o que eu consigo é imaginar
                             F
A riqueza que existe dentro de você
C                                  G/B
O ouro eu consegui e logo compreendi
                                 Am
Que o Teu amor na cruz me fez vencer
                                 F
Você é um espelho que reflete a imagem do Senhor

[Refrão]
         C                     G/B
Você é um espelho que reflete a imagem do Senhor
              Am                        F
Não chore se o mundo ainda não notou
          Dm                     G
Já é o bastante Deus reconhecer o seu valor
        C                G/B
Você é precioso, mais raro que o ouro puro de Ofir
          Am                    F
Se você desistiu, Deus não vai desistir
           Dm                    G           C
Você vale ouro, você é a pérola do Salvador

[Verso 2]
C                                G/B
Quem te viu chorando pelo canto da estrada
                                Am
Não imaginava a tua história tão honrada
                               F
Pois quem te gerou foi o Deus do impossível
C                                  G/B
Ele te ungiu e te chamou pelo teu nome
                                Am
Fez de ti um vaso pra guardar o Teu tesouro
                             F
Você é um espelho que reflete a glória do Senhor

[Refrão]
         C                     G/B
Você é um espelho que reflete a imagem do Senhor
              Am                        F
Não chore se o mundo ainda não notou
          Dm                     G
Já é o bastante Deus reconhecer o seu valor
        C                G/B
Você é precioso, mais raro que o ouro puro de Ofir
          Am                    F
Se você desistiu, Deus não vai desistir
           Dm                    G           C
Você vale ouro, você é a pérola do Salvador

[Ponte]
F                     G
O Teu valor não está naquilo que você tem
Am                   Em
O Teu valor está no sangue derramado
F                      G
Jesus pagou o mais alto preço por ti
Dm                   G
Você é herdeiro do Pai amado!

[Refrão Final]
        C                G/B
Você é precioso, mais raro que o ouro puro de Ofir
          Am                    F
Se você desistiu, Deus não vai desistir
           Dm                    G           C
Você vale ouro, você é a pérola do Salvador

[Final]
G/B   Am   F   C`
    },
    {
        id: 'em_teus_bracos',
        titulo: 'Em Teus Braços',
        artista: 'Laura Souguellis',
        tomOriginal: 'E',
        ritmo: 'Intimista / Worship',
        bpm: 64,
        tags: ['laura souguellis', 'em teus bracos'],
        letraCifra: `[Intro]
E   B   C#m   A

[Verso 1]
E                 B
Seguro estou nos braços
            C#m
Daquele que nunca me deixou
       A
Seu amor perfeito sempre esteve aqui
E                  B
E se eu passar pelo vale
       C#m
Acharei conforto em Teu amor
           A
Pois eu sei que és aquele que me guarda

[Refrão]
E
Em Teus braços é meu descanso
B
Em Teus braços é meu descanso
C#m                  A
Em Teus braços é meu descanso

[Verso 2]
E                 B
O Teu toque cura a minha ferida
C#m               A
Tua voz afasta todo o meu temor
E                 B
Não há tempestade que me abale
C#m               A
Quando estou firmado em Teu amor

[Refrão]
E
Em Teus braços é meu descanso
B
Em Teus braços é meu descanso
C#m                  A
Em Teus braços é meu descanso

[Ponte]
C#m
Eu me sinto tão amado
B
Como um filho nos braços do pai
A
Não há lugar onde eu queira estar
B
A não ser junto a Ti, Senhor

[Refrão Final]
E
Em Teus braços é meu descanso
B
Em Teus braços é meu descanso
C#m                  A        E
Em Teus braços é meu descanso

[Final]
B   C#m   A   E`
    },
    {
        id: 'a_ele_a_gloria',
        titulo: 'A Ele a Glória',
        artista: 'Diante do Trono',
        tomOriginal: 'Am',
        ritmo: 'Adoração',
        bpm: 65,
        tags: ['diante do trono', 'a ele a gloria', 'romanos 11'],
        letraCifra: `[Intro]
Am   G   F   G   Am

[Verso 1]
         Am               G
Porque d'Ele e por Ele
        F              E
Para Ele são todas as coisas
         Am               G
Porque d'Ele e por Ele
        F              E
Para Ele são todas as coisas

[Refrão]
        Am       G
A Ele a glória,
        F        E
A Ele a glória,
        Am   G          F    E
A Ele a glória, pra sempre amém!

[Ponte]
             Am
Quão insondáveis
             G
São os Teus caminhos
             F
E inescrutáveis
             E
Os Teus juízos
           Am              G
Quem conheceu a mente do Senhor?
           F                 E
Ou quem foi o Seu conselheiro?

[Refrão]
        Am       G
A Ele a glória,
        F        E
A Ele a glória,
        Am   G          F    E
A Ele a glória, pra sempre amém!

[Verso 2]
         Am               G
Porque d'Ele e por Ele
        F              E
Para Ele são todas as coisas
         Am               G
Porque d'Ele e por Ele
        F              E
Para Ele são todas as coisas

[Refrão Final]
        Am       G
A Ele a glória,
        F        E
A Ele a glória,
        Am   G          F    E   Am
A Ele a glória, pra sempre amém!

[Final]
G   F   E   Am`
    }
];

// -------------------------------------------------------------
// LOCALIZADOR EXATO E FLEXÍVEL DE CANÇÕES AUTÊNTICAS
// -------------------------------------------------------------
function normalizeStr(str: string): string {
    return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, ' ')
        .trim();
}

export function findAuthenticSong(titulo: string, artista?: string): AuthenticSong | null {
    if (!titulo || !titulo.trim()) return null;

    const normTitle = normalizeStr(titulo);
    const normArtist = normalizeStr(artista || '');

    // 1. Detecção especial de número de Harpa Cristã (ex: "545", "Harpa 545", "Hino 15")
    const harpaNumberMatch = normTitle.match(/(?:harpa|hino)?\s*([0-9]{1,3})/);
    if (harpaNumberMatch) {
        const num = parseInt(harpaNumberMatch[1], 10);
        const matchByNumber = AUTHENTIC_CHRISTIAN_SONGS.find(s => {
            const songHarpaMatch = s.id.match(/^harpa_0*([0-9]+)$/);
            return songHarpaMatch && parseInt(songHarpaMatch[1], 10) === num;
        });
        if (matchByNumber) return matchByNumber;
    }

    // 2. Busca por Correspondência Exata no Título
    for (const song of AUTHENTIC_CHRISTIAN_SONGS) {
        const sNorm = normalizeStr(song.titulo);
        if (sNorm === normTitle) return song;
    }

    // 3. Busca por Correspondência Contida no Título ou Tags
    for (const song of AUTHENTIC_CHRISTIAN_SONGS) {
        const sNorm = normalizeStr(song.titulo);
        if (normTitle.includes(sNorm) || sNorm.includes(normTitle)) {
            return song;
        }
        if (song.tags?.some(tag => normTitle.includes(normalizeStr(tag)))) {
            return song;
        }
    }

    // 4. Se informou artista, tenta cruzar artista e título
    if (normArtist) {
        for (const song of AUTHENTIC_CHRISTIAN_SONGS) {
            const sArtistNorm = normalizeStr(song.artista);
            if (sArtistNorm.includes(normArtist) || normArtist.includes(sArtistNorm)) {
                const sNorm = normalizeStr(song.titulo);
                if (normTitle.includes(sNorm) || sNorm.includes(normTitle)) {
                    return song;
                }
            }
        }
    }

    return null;
}
