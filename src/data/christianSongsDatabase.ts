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
G                      C
E quando, enfim, chegar a hora
G       Em    Am    D
Em que a morte enfrentarei
G                    C
Sem medo, então, terei vitória
G       Em      C     D         G    D
Verei na glória, o meu Jesus que vivo está

[Refrão]
G             C            Cm
Porque Ele vive, posso crer no amanhã
G     Em    Am     D
Porque Ele vive, temor não há
G           C          Cm
Mas eu bem sei, que o meu futuro
G       Em     Am     D      G
Está nas mãos do meu Jesus, que vivo está`
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
Gotas benditas já temos, mas as chuvas pedimos a Deus!`
    },

    // --- LOUVORES CONTEMPORÂNEOS E CLÁSSICOS CRISTÃOS ---
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
Ressuscita-me!`
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
Enche este lugar!`
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
Mas tu não serás atingido, verás a vitória!`
    },
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
G                 C9            G
Te amo, Deus, Tua graça nunca falha
D/F#   Em          C9        D
Todos os dias eu seguro estou
           Em            C9
Desde o amanhecer até o sol se pôr
G   D/F#   Em   C9       D       G
Eu cantarei da bondade de Deus

[Refrão]
C9                     G
Tua bondade me seguirá, Senhor
C9                     G         D
Tua bondade me seguirá, Senhor
       Em           C9             G   D/F#   Em
Toda a minha vida eu Te entrego e me rendo a Ti
C9         D       G
Tua bondade me seguirá`
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

[Refrão]
E                    B
Tudo o que eu mais quero é Te ver
C#m                 A
Me leva pra sala do trono
E                    B
Mostra Tua glória a mim
C#m               A
No Teu santo lugar secreto`
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
Eu não perdi o controle da minha vida
Em7                     C9
O meu Deus continua no controle de tudo
G                     D/F#
Ainda que a figueira não floresça
Em7                       C9
E não haja fruto nas videiras

[Refrão]
G                 D/F#
Todavia eu me alegrarei
Em7               C9
No Deus da minha salvação
G                 D/F#
Ele é a minha força e meu refúgio
Em7          C9           G
O Deus que cuida do meu coração`
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

[Refrão]
C
E tudo o que eu preciso está em Ti
G
O Teu amor me basta
Am
Aquieta minh'alma
F
E me faz descansar no Teu amor`
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
Ao Cordeiro e Salvador`
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

[Refrão]
A            E
Me atraiu, me atraiu
F#m          D
O Teu amor me conquistou
A            E
Me atraiu, me atraiu
F#m         D          A
Para sempre aos Teus pés estou`
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
Pois grande é o Senhor!`
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
Vem governar este lugar!`
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
Vem me buscar, Senhor Jesus!`
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
