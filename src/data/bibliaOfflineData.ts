/**
 * bibliaOfflineData.ts
 * Base Canônica da Bíblia Sagrada 100% Offline (Almeida Revista e Corrigida - ARC)
 * Para o Sistema de Projeção Multitelas e Telão Holyrics
 * 
 * Permite:
 * 1. Seleção instantânea por Livro -> Capítulo -> Versículo (66 livros do Cânon)
 * 2. Pesquisa ultrarrápida por digitação de referência (ex: "Jo 3:16", "Sl 23:1", "Rm 8:28")
 * 3. Pesquisa textual em tempo real por palavras-chave (ex: "o Senhor é o meu pastor", "graça sois salvos")
 * 4. Versículos clássicos pré-categorizados para momentos litúrgicos do culto
 */

import rawBibleData from './biblia_arc.json';
import { getExactChapterVerseCount } from './bibleCanonicalVerseCounts';

export interface BibleBookInfo {
  id: string;
  name: string;
  abbrevs: string[];
  testament: 'VT' | 'NT';
  division: 'Pentateuco' | 'Históricos' | 'Poéticos' | 'Profetas Maiores' | 'Profetas Menores' | 'Evangelhos' | 'Histórico' | 'Epístolas Paulinas' | 'Epístolas Gerais' | 'Revelação';
  chaptersCount: number;
}

export interface BibleVerseItem {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
  category?: 'abertura' | 'louvor' | 'dizimo' | 'salvacao' | 'cura' | 'espirito' | 'ceia' | 'familia' | 'missoes' | 'esperanca';
}

export const BIBLE_DIVISIONS = [
  'Pentateuco',
  'Históricos',
  'Poéticos',
  'Profetas Maiores',
  'Profetas Menores',
  'Evangelhos',
  'Histórico',
  'Epístolas Paulinas',
  'Epístolas Gerais',
  'Revelação'
] as const;

export const ALL_BIBLE_BOOKS: BibleBookInfo[] = [
  // Antigo Testamento - Pentateuco
  { id: 'gn', name: 'Gênesis', abbrevs: ['gn', 'gen', 'genesis'], testament: 'VT', division: 'Pentateuco', chaptersCount: 50 },
  { id: 'ex', name: 'Êxodo', abbrevs: ['ex', 'exo', 'exodo'], testament: 'VT', division: 'Pentateuco', chaptersCount: 40 },
  { id: 'lv', name: 'Levítico', abbrevs: ['lv', 'lev', 'levitico'], testament: 'VT', division: 'Pentateuco', chaptersCount: 27 },
  { id: 'nm', name: 'Números', abbrevs: ['nm', 'num', 'numeros'], testament: 'VT', division: 'Pentateuco', chaptersCount: 36 },
  { id: 'dt', name: 'Deuteronômio', abbrevs: ['dt', 'deu', 'deuteronomio'], testament: 'VT', division: 'Pentateuco', chaptersCount: 34 },

  // Antigo Testamento - Históricos
  { id: 'js', name: 'Josué', abbrevs: ['js', 'jos', 'josue'], testament: 'VT', division: 'Históricos', chaptersCount: 24 },
  { id: 'jz', name: 'Juízes', abbrevs: ['jz', 'jui', 'juizes'], testament: 'VT', division: 'Históricos', chaptersCount: 21 },
  { id: 'rt', name: 'Rute', abbrevs: ['rt', 'rut', 'rute'], testament: 'VT', division: 'Históricos', chaptersCount: 4 },
  { id: '1sm', name: '1 Samuel', abbrevs: ['1sm', '1 samuel', '1samuel'], testament: 'VT', division: 'Históricos', chaptersCount: 31 },
  { id: '2sm', name: '2 Samuel', abbrevs: ['2sm', '2 samuel', '2samuel'], testament: 'VT', division: 'Históricos', chaptersCount: 24 },
  { id: '1rs', name: '1 Reis', abbrevs: ['1rs', '1 reis', '1reis'], testament: 'VT', division: 'Históricos', chaptersCount: 22 },
  { id: '2rs', name: '2 Reis', abbrevs: ['2rs', '2 reis', '2reis'], testament: 'VT', division: 'Históricos', chaptersCount: 25 },
  { id: '1cr', name: '1 Crônicas', abbrevs: ['1cr', '1 cronicas', '1cronicas'], testament: 'VT', division: 'Históricos', chaptersCount: 29 },
  { id: '2cr', name: '2 Crônicas', abbrevs: ['2cr', '2 cronicas', '2cronicas'], testament: 'VT', division: 'Históricos', chaptersCount: 36 },
  { id: 'ed', name: 'Esdras', abbrevs: ['ed', 'esd', 'esdras'], testament: 'VT', division: 'Históricos', chaptersCount: 10 },
  { id: 'ne', name: 'Neemias', abbrevs: ['ne', 'nee', 'neemias'], testament: 'VT', division: 'Históricos', chaptersCount: 13 },
  { id: 'et', name: 'Ester', abbrevs: ['et', 'est', 'ester'], testament: 'VT', division: 'Históricos', chaptersCount: 10 },

  // Antigo Testamento - Poéticos e Sabedoria
  { id: 'job', name: 'Jó', abbrevs: ['jo', 'job', 'jó'], testament: 'VT', division: 'Poéticos', chaptersCount: 42 },
  { id: 'sl', name: 'Salmos', abbrevs: ['sl', 'sal', 'salmos', 'salmo'], testament: 'VT', division: 'Poéticos', chaptersCount: 150 },
  { id: 'pv', name: 'Provérbios', abbrevs: ['pv', 'pro', 'proverbios', 'proverbio'], testament: 'VT', division: 'Poéticos', chaptersCount: 31 },
  { id: 'ec', name: 'Eclesiastes', abbrevs: ['ec', 'ecl', 'eclesiastes'], testament: 'VT', division: 'Poéticos', chaptersCount: 12 },
  { id: 'ct', name: 'Cantares', abbrevs: ['ct', 'can', 'cantares', 'canticos'], testament: 'VT', division: 'Poéticos', chaptersCount: 8 },

  // Antigo Testamento - Profetas Maiores
  { id: 'is', name: 'Isaías', abbrevs: ['is', 'isa', 'isaias'], testament: 'VT', division: 'Profetas Maiores', chaptersCount: 66 },
  { id: 'jr', name: 'Jeremias', abbrevs: ['jr', 'jer', 'jeremias'], testament: 'VT', division: 'Profetas Maiores', chaptersCount: 52 },
  { id: 'lm', name: 'Lamentações', abbrevs: ['lm', 'lam', 'lamentacoes'], testament: 'VT', division: 'Profetas Maiores', chaptersCount: 5 },
  { id: 'ez', name: 'Ezequiel', abbrevs: ['ez', 'eze', 'ezequiel'], testament: 'VT', division: 'Profetas Maiores', chaptersCount: 48 },
  { id: 'dn', name: 'Daniel', abbrevs: ['dn', 'dan', 'daniel'], testament: 'VT', division: 'Profetas Maiores', chaptersCount: 12 },

  // Antigo Testamento - Profetas Menores
  { id: 'os', name: 'Oseias', abbrevs: ['os', 'ose', 'oseias'], testament: 'VT', division: 'Profetas Menores', chaptersCount: 14 },
  { id: 'jl', name: 'Joel', abbrevs: ['jl', 'joe', 'joel'], testament: 'VT', division: 'Profetas Menores', chaptersCount: 3 },
  { id: 'am', name: 'Amós', abbrevs: ['am', 'amo', 'amos'], testament: 'VT', division: 'Profetas Menores', chaptersCount: 9 },
  { id: 'ob', name: 'Obadias', abbrevs: ['ob', 'oba', 'obadias'], testament: 'VT', division: 'Profetas Menores', chaptersCount: 1 },
  { id: 'jn', name: 'Jonas', abbrevs: ['jn', 'jon', 'jonas'], testament: 'VT', division: 'Profetas Menores', chaptersCount: 4 },
  { id: 'mq', name: 'Miqueias', abbrevs: ['mq', 'miq', 'miqueias'], testament: 'VT', division: 'Profetas Menores', chaptersCount: 7 },
  { id: 'na', name: 'Naum', abbrevs: ['na', 'nau', 'naum'], testament: 'VT', division: 'Profetas Menores', chaptersCount: 3 },
  { id: 'hc', name: 'Habacuque', abbrevs: ['hc', 'hab', 'habacuque'], testament: 'VT', division: 'Profetas Menores', chaptersCount: 3 },
  { id: 'sf', name: 'Sofonias', abbrevs: ['sf', 'sof', 'sofonias'], testament: 'VT', division: 'Profetas Menores', chaptersCount: 3 },
  { id: 'ag', name: 'Ageu', abbrevs: ['ag', 'age', 'ageu'], testament: 'VT', division: 'Profetas Menores', chaptersCount: 2 },
  { id: 'zc', name: 'Zacarias', abbrevs: ['zc', 'zac', 'zacarias'], testament: 'VT', division: 'Profetas Menores', chaptersCount: 14 },
  { id: 'ml', name: 'Malaquias', abbrevs: ['ml', 'mal', 'malaquias'], testament: 'VT', division: 'Profetas Menores', chaptersCount: 4 },

  // Novo Testamento - Evangelhos
  { id: 'mt', name: 'Mateus', abbrevs: ['mt', 'mat', 'mateus'], testament: 'NT', division: 'Evangelhos', chaptersCount: 28 },
  { id: 'mc', name: 'Marcos', abbrevs: ['mc', 'mar', 'marcos'], testament: 'NT', division: 'Evangelhos', chaptersCount: 16 },
  { id: 'lc', name: 'Lucas', abbrevs: ['lc', 'luc', 'lucas'], testament: 'NT', division: 'Evangelhos', chaptersCount: 24 },
  { id: 'jo', name: 'João', abbrevs: ['jo', 'joao', 'joão'], testament: 'NT', division: 'Evangelhos', chaptersCount: 21 },

  // Novo Testamento - Histórico
  { id: 'at', name: 'Atos', abbrevs: ['at', 'act', 'atos'], testament: 'NT', division: 'Histórico', chaptersCount: 28 },

  // Novo Testamento - Epístolas Paulinas
  { id: 'rm', name: 'Romanos', abbrevs: ['rm', 'rom', 'romanos'], testament: 'NT', division: 'Epístolas Paulinas', chaptersCount: 16 },
  { id: '1co', name: '1 Coríntios', abbrevs: ['1co', '1 corintios', '1corintios'], testament: 'NT', division: 'Epístolas Paulinas', chaptersCount: 16 },
  { id: '2co', name: '2 Coríntios', abbrevs: ['2co', '2 corintios', '2corintios'], testament: 'NT', division: 'Epístolas Paulinas', chaptersCount: 13 },
  { id: 'gl', name: 'Gálatas', abbrevs: ['gl', 'gal', 'galatas'], testament: 'NT', division: 'Epístolas Paulinas', chaptersCount: 6 },
  { id: 'ef', name: 'Efésios', abbrevs: ['ef', 'efe', 'efesios'], testament: 'NT', division: 'Epístolas Paulinas', chaptersCount: 6 },
  { id: 'fp', name: 'Filipenses', abbrevs: ['fp', 'fil', 'filipenses'], testament: 'NT', division: 'Epístolas Paulinas', chaptersCount: 4 },
  { id: 'cl', name: 'Colossenses', abbrevs: ['cl', 'col', 'colossenses'], testament: 'NT', division: 'Epístolas Paulinas', chaptersCount: 4 },
  { id: '1ts', name: '1 Tessalonicenses', abbrevs: ['1ts', '1 tessalonicenses', '1ts'], testament: 'NT', division: 'Epístolas Paulinas', chaptersCount: 5 },
  { id: '2ts', name: '2 Tessalonicenses', abbrevs: ['2ts', '2 tessalonicenses', '2ts'], testament: 'NT', division: 'Epístolas Paulinas', chaptersCount: 3 },
  { id: '1tm', name: '1 Timóteo', abbrevs: ['1tm', '1 timoteo', '1timoteo'], testament: 'NT', division: 'Epístolas Paulinas', chaptersCount: 6 },
  { id: '2tm', name: '2 Timóteo', abbrevs: ['2tm', '2 timoteo', '2timoteo'], testament: 'NT', division: 'Epístolas Paulinas', chaptersCount: 4 },
  { id: 'tt', name: 'Tito', abbrevs: ['tt', 'tit', 'tito'], testament: 'NT', division: 'Epístolas Paulinas', chaptersCount: 3 },
  { id: 'fm', name: 'Filemom', abbrevs: ['fm', 'flm', 'filemom'], testament: 'NT', division: 'Epístolas Paulinas', chaptersCount: 1 },

  // Novo Testamento - Epístolas Gerais
  { id: 'hb', name: 'Hebreus', abbrevs: ['hb', 'heb', 'hebreus'], testament: 'NT', division: 'Epístolas Gerais', chaptersCount: 13 },
  { id: 'tg', name: 'Tiago', abbrevs: ['tg', 'tia', 'tiago'], testament: 'NT', division: 'Epístolas Gerais', chaptersCount: 5 },
  { id: '1pe', name: '1 Pedro', abbrevs: ['1pe', '1 pedro', '1pedro'], testament: 'NT', division: 'Epístolas Gerais', chaptersCount: 5 },
  { id: '2pe', name: '2 Pedro', abbrevs: ['2pe', '2 pedro', '2pedro'], testament: 'NT', division: 'Epístolas Gerais', chaptersCount: 3 },
  { id: '1jo', name: '1 João', abbrevs: ['1jo', '1 joao', '1joão'], testament: 'NT', division: 'Epístolas Gerais', chaptersCount: 5 },
  { id: '2jo', name: '2 João', abbrevs: ['2jo', '2 joao', '2joão'], testament: 'NT', division: 'Epístolas Gerais', chaptersCount: 1 },
  { id: '3jo', name: '3 João', abbrevs: ['3jo', '3 joao', '3joão'], testament: 'NT', division: 'Epístolas Gerais', chaptersCount: 1 },
  { id: 'jd', name: 'Judas', abbrevs: ['jd', 'jud', 'judas'], testament: 'NT', division: 'Epístolas Gerais', chaptersCount: 1 },

  // Novo Testamento - Revelação
  { id: 'ap', name: 'Apocalipse', abbrevs: ['ap', 'apo', 'apocalipse', 'revelacao'], testament: 'NT', division: 'Revelação', chaptersCount: 22 }
];

/**
 * Repositório Canônico Offline de Versículos Chave e Litúrgicos (ARC)
 */
export const OFFLINE_KEY_VERSES: BibleVerseItem[] = [
  // ABERTURA / INVOCACÃO
  {
    book: 'Salmos', chapter: 122, verse: 1,
    reference: 'Salmos 122:1',
    category: 'abertura',
    text: 'Alegrei-me quando me disseram: Vamos à casa do Senhor!'
  },
  {
    book: 'Salmos', chapter: 100, verse: 4,
    reference: 'Salmos 100:4',
    category: 'abertura',
    text: 'Entrai pelas portas dele com gratidão, e em seus átrios com louvor; louvai-o, e bendizei o seu nome.'
  },
  {
    book: 'Salmos', chapter: 133, verse: 1,
    reference: 'Salmos 133:1',
    category: 'abertura',
    text: 'Oh! Quão bom e quão suave é que os irmãos vivam em união!'
  },
  {
    book: 'Salmos', chapter: 121, verse: 1,
    reference: 'Salmos 121:1-2',
    category: 'abertura',
    text: 'Levantarei os meus olhos para os montes, de onde vem o meu socorro. O meu socorro vem do Senhor que fez o céu e a terra.'
  },

  // SALVAÇÃO E EVANGELISMO
  {
    book: 'João', chapter: 3, verse: 16,
    reference: 'João 3:16',
    category: 'salvacao',
    text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.'
  },
  {
    book: 'Romanos', chapter: 10, verse: 9,
    reference: 'Romanos 10:9',
    category: 'salvacao',
    text: 'A saber: Se com a tua boca confessares ao Senhor Jesus, e em teu coração creres que Deus o ressuscitou dentre os mortos, serás salvo.'
  },
  {
    book: 'Efésios', chapter: 2, verse: 8,
    reference: 'Efésios 2:8-9',
    category: 'salvacao',
    text: 'Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus; não vem das obras, para que ninguém se glorie.'
  },
  {
    book: '2 Coríntios', chapter: 5, verse: 17,
    reference: '2 Coríntios 5:17',
    category: 'salvacao',
    text: 'Assim que, se alguém está em Cristo, nova criatura é; as coisas velhas já passaram; eis que tudo se fez novo.'
  },
  {
    book: 'João', chapter: 14, verse: 6,
    reference: 'João 14:6',
    category: 'salvacao',
    text: 'Disse-lhe Jesus: Eu sou o caminho, e a verdade e a vida; ninguém vem ao Pai, senão por mim.'
  },
  {
    book: 'Atos', chapter: 4, verse: 12,
    reference: 'Atos 4:12',
    category: 'salvacao',
    text: 'E em nenhum outro há salvação, porque também debaixo do céu nenhum outro nome há, dado entre os homens, pelo qual devamos ser salvos.'
  },

  // CONSOLO, FÉ E ESPERANÇA
  {
    book: 'Salmos', chapter: 23, verse: 1,
    reference: 'Salmos 23:1',
    category: 'esperanca',
    text: 'O Senhor é o meu pastor; nada me faltará.'
  },
  {
    book: 'Salmos', chapter: 23, verse: 4,
    reference: 'Salmos 23:4',
    category: 'esperanca',
    text: 'Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam.'
  },
  {
    book: 'Salmos', chapter: 91, verse: 1,
    reference: 'Salmos 91:1-2',
    category: 'esperanca',
    text: 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará. Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza, e nele confiarei.'
  },
  {
    book: 'Filipenses', chapter: 4, verse: 13,
    reference: 'Filipenses 4:13',
    category: 'esperanca',
    text: 'Posso todas as coisas naquele que me fortalece.'
  },
  {
    book: 'Romanos', chapter: 8, verse: 28,
    reference: 'Romanos 8:28',
    category: 'esperanca',
    text: 'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.'
  },
  {
    book: 'Romanos', chapter: 8, verse: 31,
    reference: 'Romanos 8:31',
    category: 'esperanca',
    text: 'Que diremos, pois, a estas coisas? Se Deus é por nós, quem será contra nós?'
  },
  {
    book: 'Jeremias', chapter: 29, verse: 11,
    reference: 'Jeremias 29:11',
    category: 'esperanca',
    text: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.'
  },
  {
    book: 'Isaías', chapter: 40, verse: 31,
    reference: 'Isaías 40:31',
    category: 'esperanca',
    text: 'Mas os que esperam no Senhor renovarão as forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.'
  },
  {
    book: 'Provérbios', chapter: 3, verse: 5,
    reference: 'Provérbios 3:5-6',
    category: 'esperanca',
    text: 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.'
  },

  // CURA E PODER DIVINO
  {
    book: 'Isaías', chapter: 53, verse: 5,
    reference: 'Isaías 53:5',
    category: 'cura',
    text: 'Mas ele foi ferido pelas nossas transgressões, e moído pelas nossas iniquidades; o castigo que nos traz a paz estava sobre ele, e pelas suas pisaduras fomos sarados.'
  },
  {
    book: 'Mateus', chapter: 8, verse: 17,
    reference: 'Mateus 8:17',
    category: 'cura',
    text: 'Para que se cumprisse o que fora dito pelo profeta Isaías, que diz: Ele tomou sobre si as nossas enfermidades, e levou as nossas doenças.'
  },
  {
    book: 'Tiago', chapter: 5, verse: 14,
    reference: 'Tiago 5:14-15',
    category: 'cura',
    text: 'Está alguém entre vós doente? Chame os presbíteros da igreja, e orem sobre ele, ungindo-o com azeite em nome do Senhor; e a oração da fé salvará o doente, e o Senhor o levantará.'
  },

  // BATISMO NO ESPÍRITO SANTO E PODER PENTECOSTAL
  {
    book: 'Atos', chapter: 1, verse: 8,
    reference: 'Atos 1:8',
    category: 'espirito',
    text: 'Mas recebereis a virtude do Espírito Santo, que há de vir sobre vós; e ser-me-eis testemunhas, tanto em Jerusalém como em toda a Judeia e Samaria, e até aos confins da terra.'
  },
  {
    book: 'Atos', chapter: 2, verse: 1,
    reference: 'Atos 2:1-4',
    category: 'espirito',
    text: 'Cumprindo-se o dia de Pentecostes, estavam todos reunidos no mesmo lugar... E todos foram cheios do Espírito Santo, e começaram a falar noutras línguas, conforme o Espírito Santo lhes concedia que falassem.'
  },
  {
    book: 'Joel', chapter: 2, verse: 28,
    reference: 'Joel 2:28',
    category: 'espirito',
    text: 'E há de ser que, depois derramarei o meu Espírito sobre toda a carne, e vossos filhos e vossas filhas profetizarão, os vossos velhos terão sonhos, os vossos jovens terão visões.'
  },
  {
    book: '1 Coríntios', chapter: 12, verse: 7,
    reference: '1 Coríntios 12:7',
    category: 'espirito',
    text: 'Mas a manifestação do Espírito é dada a cada um, para o que for útil.'
  },

  // DÍZIMOS E OFERTAS (GRATIDÃO)
  {
    book: 'Malaquias', chapter: 3, verse: 10,
    reference: 'Malaquias 3:10',
    category: 'dizimo',
    text: 'Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa, e depois fazei prova de mim nisto, diz o Senhor dos Exércitos, se eu não vos abrir as janelas do céu, e não derramar sobre vós uma bênção tal até que não haja lugar suficiente para a recolherdes.'
  },
  {
    book: '2 Coríntios', chapter: 9, verse: 7,
    reference: '2 Coríntios 9:7',
    category: 'dizimo',
    text: 'Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; porque Deus ama ao que dá com alegria.'
  },
  {
    book: 'Provérbios', chapter: 3, verse: 9,
    reference: 'Provérbios 3:9-10',
    category: 'dizimo',
    text: 'Honra ao Senhor com a tua fazenda, e com as primícias de toda a tua renda; e se encherão os teus celeiros abundantemente, e trasbordarão de mosto os teus lagares.'
  },
  {
    book: 'Lucas', chapter: 6, verse: 38,
    reference: 'Lucas 6:38',
    category: 'dizimo',
    text: 'Dai, e ser-vos-á dado; boa medida, recalcada, sacudida e transbordando, vos deitarão no vosso regaço; porque com a mesma medida com que medirdes também vos medirão de novo.'
  },

  // SANTA CEIA DO SENHOR
  {
    book: '1 Coríntios', chapter: 11, verse: 23,
    reference: '1 Coríntios 11:23-26',
    category: 'ceia',
    text: 'Porque eu recebi do Senhor o que também vos ensinei: que o Senhor Jesus, na noite em que foi traído, tomou o pão; e, havendo dado graças, o partiu e disse: Tomai, comei; isto é o meu corpo que é partido por vós; fazei isto em memória de mim... Porque todas as vezes que comerdes este pão e beberdes este cálice anunciais a morte do Senhor, até que venha.'
  },
  {
    book: 'Lucas', chapter: 22, verse: 19,
    reference: 'Lucas 22:19-20',
    category: 'ceia',
    text: 'E, tomando o pão, e havendo dado graças, partiu-o, e deu-lho, dizendo: Isto é o meu corpo, que por vós é dado; fazei isto em memória de mim. Semelhantemente, depois da ceia, tomou o cálice, dizendo: Este cálice é o novo testamento no meu sangue, que é derramado por vós.'
  },

  // MISSÕES E A GRANDE COMISSÃO
  {
    book: 'Mateus', chapter: 28, verse: 19,
    reference: 'Mateus 28:19-20',
    category: 'missoes',
    text: 'Portanto ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo; ensinando-os a guardar todas as coisas que eu vos tenho mandado; e eis que eu estou convosco todos os dias, até a consumação dos séculos. Amém.'
  },
  {
    book: 'Marcos', chapter: 16, verse: 15,
    reference: 'Marcos 16:15',
    category: 'missoes',
    text: 'E disse-lhes: Ide por todo o mundo, pregai o evangelho a toda criatura.'
  },
  {
    book: 'Romanos', chapter: 10, verse: 14,
    reference: 'Romanos 10:14-15',
    category: 'missoes',
    text: 'Como, pois, invocarão aquele em quem não creram? E como crerão naquele de quem não ouviram? E como ouvirão, se não há quem pregue? E como pregarão, se não forem enviados?'
  },

  // FAMÍLIA E LAR CRISTÃO
  {
    book: 'Josué', chapter: 24, verse: 15,
    reference: 'Josué 24:15',
    category: 'familia',
    text: 'Porém, se vos parece mal aos vossos olhos servir ao Senhor, escolhei hoje a quem sirvais... Porém eu e a minha casa serviremos ao Senhor.'
  },
  {
    book: 'Salmos', chapter: 128, verse: 1,
    reference: 'Salmos 128:1-3',
    category: 'familia',
    text: 'Bem-aventurado aquele que teme ao Senhor e anda nos seus caminhos. Pois comerás do trabalho das tuas mãos; feliz serás, e te irá bem. A tua mulher será como a videira frutífera aos lados da tua casa; os teus filhos como plantas de oliveira à roda da tua mesa.'
  },
  {
    book: 'Efésios', chapter: 5, verse: 25,
    reference: 'Efésios 5:25',
    category: 'familia',
    text: 'Vós, maridos, amai vossas mulheres, como também Cristo amou a igreja, e a si mesmo se entregou por ela.'
  },

  // AMOR CRISTÃO E CONDUTA
  {
    book: '1 Coríntios', chapter: 13, verse: 4,
    reference: '1 Coríntios 13:4-7',
    category: 'louvor',
    text: 'O amor é sofredor, é benigno; o amor não é invejoso; o amor não trata com leviandade, não se ensoberbe. Não se porta com indecência, não busca os seus interesses, não se irrita, não suspeita mal... Tudo sofre, tudo crê, tudo espera, tudo suporta.'
  },
  {
    book: 'Gálatas', chapter: 5, verse: 22,
    reference: 'Gálatas 5:22-23',
    category: 'louvor',
    text: 'Mas o fruto do Espírito é: amor, gozo, paz, longanimidade, benignidade, bondade, fé, mansidão, temperança. Contra estas coisas não há lei.'
  },

  // A SEGUNDA VINDA E ARREBATAMENTO
  {
    book: '1 Tessalonicenses', chapter: 4, verse: 16,
    reference: '1 Tessalonicenses 4:16-17',
    category: 'esperanca',
    text: 'Porque o mesmo Senhor descerá do céu com alarido, e com voz de arcanjo, e com a trombeta de Deus; e os que morreram em Cristo ressuscitarão primeiro. Depois nós, os que ficarmos vivos, seremos arrebatados juntamente com eles nas nuvens, a encontrar o Senhor nos ares, e assim estaremos sempre com o Senhor.'
  },
  {
    book: 'Apocalipse', chapter: 22, verse: 20,
    reference: 'Apocalipse 22:20',
    category: 'esperanca',
    text: 'Aquele que testifica estas coisas diz: Certamente cedo venho. Amém. Ora vem, Senhor Jesus.'
  },
  {
    book: 'Mateus', chapter: 24, verse: 44,
    reference: 'Mateus 24:44',
    category: 'esperanca',
    text: 'Por isso, estai vós apercebidos também; porque o Filho do homem há de vir à hora em que não penseis.'
  }
];

/**
 * Função utilitária para normalizar strings para busca sem acentos e minúsculas
 */
export function normalizeBibleText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Localiza o livro bíblico pelo nome ou abreviação
 */
export function findBibleBook(query: string): BibleBookInfo | undefined {
  const clean = normalizeBibleText(query);
  return ALL_BIBLE_BOOKS.find(b => {
    if (normalizeBibleText(b.name) === clean) return true;
    if (b.abbrevs.some(ab => normalizeBibleText(ab) === clean)) return true;
    return false;
  });
}

/**
 * Parser inteligente de referências bíblicas (ex: "Jo 3:16", "Sl 23 1", "Mt 28:19-20", "1 Co 13:4")
 */
export interface ParsedBibleRef {
  book: BibleBookInfo;
  chapter: number;
  verse?: number;
  endVerse?: number;
  raw: string;
}

export function parseBiblicalReference(query: string): ParsedBibleRef | null {
  if (!query || !query.trim()) return null;
  const rawClean = query.trim();

  // Expressão regular para capturar livro + capítulo + versículo
  // Suporta "1 Jo 3:16", "João 3:16", "Sl 23:1", "Mt 28 19", "Ap 22:20"
  const regex = /^([1-3]?\s?[A-Za-zÀ-ÿ]+)\s+(\d+)[\s:,\.]?(\d+)?(?:-(\d+))?$/i;
  const match = rawClean.match(regex);

  if (match) {
    const bookStr = match[1].trim();
    const chapter = parseInt(match[2], 10);
    const verse = match[3] ? parseInt(match[3], 10) : undefined;
    const endVerse = match[4] ? parseInt(match[4], 10) : undefined;

    const book = findBibleBook(bookStr);
    if (book) {
      return {
        book,
        chapter: Math.min(Math.max(1, chapter), book.chaptersCount),
        verse: verse ? Math.max(1, verse) : 1,
        endVerse,
        raw: rawClean
      };
    }
  }

  // Tenta busca direta apenas pelo nome do livro
  const bookOnly = findBibleBook(rawClean);
  if (bookOnly) {
    return {
      book: bookOnly,
      chapter: 1,
      verse: 1,
      raw: rawClean
    };
  }

  return null;
}

interface RawBookJson {
  abbrev: string;
  name: string;
  chapters: string[][];
}

const RAW_ARC_BOOKS: RawBookJson[] = rawBibleData as unknown as RawBookJson[];

const RAW_ARC_MAP = new Map<string, RawBookJson>();
RAW_ARC_BOOKS.forEach(b => {
  RAW_ARC_MAP.set(normalizeBibleText(b.name), b);
  RAW_ARC_MAP.set(normalizeBibleText(b.abbrev), b);
});

// Registrar aliases de ALL_BIBLE_BOOKS para busca infalível
ALL_BIBLE_BOOKS.forEach(bInfo => {
  const raw = RAW_ARC_MAP.get(normalizeBibleText(bInfo.name));
  if (raw) {
    bInfo.abbrevs.forEach(ab => {
      RAW_ARC_MAP.set(normalizeBibleText(ab), raw);
    });
  }
});

/**
 * Obtém o texto autêntico de um versículo a partir da base canônica ARC offline completa
 */
export function getOfflineVerseText(bookName: string, chapter: number, verse: number): BibleVerseItem {
  const normBook = normalizeBibleText(bookName);
  
  // 1. Procura na base canônica completa ARC (31.102 versículos autênticos)
  const rawBook = RAW_ARC_MAP.get(normBook);
  if (rawBook && rawBook.chapters && rawBook.chapters[chapter - 1]) {
    const chVerses = rawBook.chapters[chapter - 1];
    if (chVerses && chVerses[verse - 1]) {
      return {
        book: rawBook.name,
        chapter,
        verse,
        reference: `${rawBook.name} ${chapter}:${verse}`,
        text: chVerses[verse - 1].trim()
      };
    }
  }

  // 2. Busca no repositório canônico prioritário
  const exact = OFFLINE_KEY_VERSES.find(v => 
    normalizeBibleText(v.book) === normBook && 
    v.chapter === chapter && 
    v.verse === verse
  );

  if (exact) {
    return exact;
  }

  // 3. Fallback canônico
  return {
    book: bookName,
    chapter,
    verse,
    reference: `${bookName} ${chapter}:${verse}`,
    text: `Palavra do Senhor em ${bookName} ${chapter}:${verse} (Almeida Revista e Corrigida).`
  };
}

/**
 * Motor de Pesquisa Instantânea Offline: busca por referência ou por palavras no texto sagrado
 */
export function searchOfflineBible(query: string, maxResults = 12): BibleVerseItem[] {
  if (!query || !query.trim()) {
    return OFFLINE_KEY_VERSES.slice(0, maxResults);
  }

  const cleanQuery = normalizeBibleText(query);

  // 1. Tenta interpretar como referência direta (ex: "Jo 3:16", "Sl 23", "Mt 26:14")
  const parsed = parseBiblicalReference(query);
  if (parsed) {
    const directResult = getOfflineVerseText(parsed.book.name, parsed.chapter, parsed.verse || 1);
    const related = OFFLINE_KEY_VERSES.filter(v => 
      normalizeBibleText(v.book) === normalizeBibleText(parsed.book.name) && 
      v.reference !== directResult.reference
    );
    return [directResult, ...related].slice(0, maxResults);
  }

  // 2. Busca no repositório de versículos chave
  const matched: BibleVerseItem[] = [];
  OFFLINE_KEY_VERSES.forEach(item => {
    const normRef = normalizeBibleText(item.reference);
    const normText = normalizeBibleText(item.text);
    const normBook = normalizeBibleText(item.book);

    if (normRef.includes(cleanQuery) || normText.includes(cleanQuery) || normBook.includes(cleanQuery)) {
      matched.push(item);
    }
  });

  // 3. Se houver espaço e a busca tiver 3+ caracteres, busca no acervo completo de 31.102 versículos
  if (matched.length < maxResults && cleanQuery.length >= 3) {
    for (const b of RAW_ARC_BOOKS) {
      if (matched.length >= maxResults) break;
      for (let c = 0; c < b.chapters.length; c++) {
        if (matched.length >= maxResults) break;
        const chArray = b.chapters[c];
        for (let v = 0; v < chArray.length; v++) {
          if (matched.length >= maxResults) break;
          const vText = chArray[v];
          if (normalizeBibleText(vText).includes(cleanQuery)) {
            const ref = `${b.name} ${c + 1}:${v + 1}`;
            if (!matched.some(m => m.reference === ref)) {
              matched.push({
                book: b.name,
                chapter: c + 1,
                verse: v + 1,
                reference: ref,
                text: vText
              });
            }
          }
        }
      }
    }
  }

  return matched.slice(0, maxResults);
}
