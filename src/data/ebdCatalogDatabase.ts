/**
 * Base de Conhecimento, Motor Exegético e Construtor Profissional de Revistas da EBD (CGADB / CPAD / Betel / Central Gospel)
 * Estritamente alinhado aos 24 Capítulos da Declaração de Fé das Assembleias de Deus e à Bíblia ARC.
 */

import {
  getFormattedBiblePassageARC,
  resolveSingleVerseQuoteARC,
  getOfflineVerseText,
  parseBiblicalReference
} from './bibliaOfflineData';

export interface EBDLicaoSumario {
  num?: number;
  licao_numero: string;
  titulo: string;
  texto_aureo: string;
  aureo?: string;
  verdade_pratica: string;
  verdade?: string;
  leitura_biblica: string;
  leitura?: string;
  capitulo_declaracao_fe: string;
  topicos?: string[];
}

export interface EBDMagazineCatalogItem {
  id: string;
  titulo: string;
  subtitulo: string;
  editora: string;
  comentarista: string;
  publico: string;
  trimestre: string;
  declaracaoCap: string;
  capa: string;
  descricao: string;
  licoes?: EBDLicaoSumario[];
}

export interface DogmaticChapterInfo {
  capitulo: string;
  titulo: string;
  doutrina: string;
  versiculosBase: string;
  leituraPadrao: string;
  textoAureoPadrao: string;
  verdadePraticaPadrao: string;
  termosOriginais: string;
  fundamentacao: string;
  keywords: string[];
}

export interface EBDSubtopicDetail {
  codigo: string;
  titulo: string;
  referencia: string;
  exegese: string;
  aplicacaoSubtopico: string;
}

export interface EBDTopicDetail {
  romano: string;
  titulo: string;
  introducaoTopico: string;
  referenciasTopico: string;
  subtopicos: EBDSubtopicDetail[];
  sinteseTeologica: string;
}

export interface EBDLessonBuildParams {
  revista: string;
  temaCentral?: string;
  subtitulo?: string;
  trimestre?: string;
  licaoNum: string;
  tituloLicao?: string;
  dataLicao?: string;
  editora?: string;
  autor?: string;
  faixaEtaria?: string;
  turma?: string;
  textoBiblico?: string;
  textoBiblicoIntegral?: string;
  textoAureo?: string;
  verdadePratica?: string;
  subsidiosWeb?: string;
}

export const DECLARACAO_FE_24_CAPITULOS: DogmaticChapterInfo[] = [
  {
    capitulo: 'Capítulo 1 - Sobre as Sagradas Escrituras (Bibliologia)',
    titulo: 'A Inspiração Verbal, Plenária e Inerrância da Bíblia Sagrada',
    doutrina: 'Bibliologia',
    versiculosBase: '2 Timóteo 3:14-17; 2 Pedro 1:19-21; Salmos 119:105; Hebreus 4:12',
    leituraPadrao: '2 Timóteo 3:14-17',
    textoAureoPadrao: 'Toda a Escritura é divinamente inspirada, e proveitosa para ensinar, para redarguir, para corrigir, para instruir em justiça. (2 Timóteo 3:16 - ARC)',
    verdadePraticaPadrao: 'A Bíblia Sagrada é a Palavra de Deus inspirada, inerrante e infalível, constituindo nossa única regra de fé e prática cristã.',
    termosOriginais: 'Theopneustos (Grego: θεόπνευστος — soprada por Deus), Graphe (Escritura Sagrada) e Dabar/Logos (Palavra viva, eterna e eficaz).',
    fundamentacao: 'De acordo com o Capítulo 1 da Declaração de Fé das Assembleias de Deus (CGADB/CPAD), cremos que a Bíblia Sagrada é a Palavra de Deus, escrita por homens santos divinamente inspirados pelo Espírito Santo (inspiração verbal e plenária), sendo a revelação completa, inerrante e final de Deus à humanidade.',
    keywords: ['bíblia', 'escrituras', 'palavra', 'inspiração', 'revelação', 'inerrância', 'bibliologia', 'lei', 'cânon', 'lâmpada']
  },
  {
    capitulo: 'Capítulos 2 e 3 - Sobre Deus e a Santíssima Trindade (Teontologia)',
    titulo: 'O Único e Verdadeiro Deus Subsistente em Três Pessoas: Pai, Filho e Espírito Santo',
    doutrina: 'Teontologia e Trindade',
    versiculosBase: 'Deuteronômio 6:4; Mateus 28:19; 2 Coríntios 13:13; Atos 17:24-28',
    leituraPadrao: 'Mateus 3:13-17; 28:18-20',
    textoAureoPadrao: 'A graça do Senhor Jesus Cristo, e o amor de Deus, e a comunhão do Espírito Santo seja com todos vós. Amém. (2 Coríntios 13:13 - ARC)',
    verdadePraticaPadrao: 'O verdadeiro Deus é único em sua essência e eternamente subsistente em três pessoas distintas: o Pai, o Filho e o Espírito Santo.',
    termosOriginais: 'Elohim / Yahweh Echad (Hebraico: O Senhor é Um) e Trias / Hypostasis (Três Pessoas coeternas e coiguais na mesma substância divina).',
    fundamentacao: 'Conforme os Capítulos 2 e 3 da Declaração de Fé da CGADB/CPAD, cremos em um só Deus vivo e verdadeiro, infinito em poder, sabedoria e santidade, Criador e Sustentador de todas as coisas, que subsiste eternamente em três pessoas distintas — Pai, Filho e Espírito Santo — iguais em glória, majestade e atributos divinos.',
    keywords: ['deus', 'trindade', 'pai', 'atributos', 'soberania', 'onipotente', 'onisciente', 'teontologia', 'criador', 'promessas', 'fidelidade', 'desconhecido', 'filósofos', 'areópago', 'atenas']
  },
  {
    capitulo: 'Capítulos 4 e 5 - Sobre o Senhor Jesus Cristo e Suas Obras (Cristologia)',
    titulo: 'A Plena Divindade, Encarnação Virginal, Morte Vicária e Ressurreição de Cristo',
    doutrina: 'Cristologia',
    versiculosBase: 'João 1:1-14; Filipenses 2:5-11; Isaías 53:4-6; 1 Coríntios 15:3-4',
    leituraPadrao: 'Filipenses 2:5-11',
    textoAureoPadrao: 'E o Verbo se fez carne, e habitou entre nós, e vimos a sua glória, como a glória do unigênito do Pai, cheio de graça e de verdade. (João 1:14 - ARC)',
    verdadePraticaPadrao: 'Jesus Cristo é verdadeiro Deus e verdadeiro homem, o único Mediador e Salvador que morreu na cruz pelos nossos pecados e ressuscitou corporalmente.',
    termosOriginais: 'Logos (Grego: Verbo Eterno), Kenosis (Filipenses 2:7 — esvaziamento voluntário de suas prerrogativas de glória sem perder a divindade) e Hilasterion (Propiciação pelo sangue).',
    fundamentacao: 'Segundo os Capítulos 4 e 5 da Declaração de Fé da CGADB/CPAD, o Senhor Jesus Cristo é o Filho Eterno de Deus, concebido pelo Espírito Santo no ventre da virgem Maria. Sua morte vicária no Calvário efetuou a redenção completa, e sua ressurreição corporal garante nossa justificação e vitória sobre a morte.',
    keywords: ['jesus', 'cristo', 'cruz', 'sangue', 'ressurreição', 'messias', 'filho', 'cordeiro', 'cristologia', 'redenção', 'encarnação', 'milagres', 'parábola', 'sermão do monte', 'calvário']
  },
  {
    capitulo: 'Capítulos 6, 19 e 20 - Pneumatologia e Distintivos Pentecostais',
    titulo: 'A Pessoa do Espírito Santo, o Batismo com Falar em Línguas e os Dons Espirituais',
    doutrina: 'Pneumatologia e Movimento Pentecostal',
    versiculosBase: 'Atos 1:8; Atos 2:1-4; 1 Coríntios 12:1-11; Gálatas 5:22-23',
    leituraPadrao: 'Atos 2:1-13',
    textoAureoPadrao: 'Mas recebereis a virtude do Espírito Santo, que há de vir sobre vós; e ser-me-eis testemunhas, tanto em Jerusalém como em toda a Judeia e Samaria, e até aos confins da terra. (Atos 1:8 - ARC)',
    verdadePraticaPadrao: 'O Espírito Santo é a terceira pessoa da Trindade que regenera o pecador, produz o fruto cristão e reveste o crente de poder com a evidência inicial do falar em outras línguas.',
    termosOriginais: 'Parakletos (Grego: Consolador, Ajudador posto ao lado), Dunamis (Poder miraculoso e eficaz) e Charismata (Dons da graça do Espírito).',
    fundamentacao: 'Em conformidade com os Capítulos 6, 19 e 20 da Declaração de Fé da CGADB/CPAD, o Espírito Santo possui plena divindade e personalidade. Cremos na atualidade do Batismo no Espírito Santo, distinto da salvação e acompanhado da evidência física inicial da glossolalia (falar em outras línguas), bem como na contemporaneidade dos 9 dons espirituais de 1 Coríntios 12.',
    keywords: ['espírito santo', 'pentecostes', 'dons', 'línguas', 'fruto do espírito', 'avivamento', 'unção', 'poder', 'pneumatologia', 'consolador', 'batismo no espírito']
  },
  {
    capitulo: 'Capítulos 7, 8 e 9 - Antropologia Bíblica e Hamartiologia',
    titulo: 'A Criação Imediata do Homem à Imagem de Deus, a Queda e a Origem do Pecado',
    doutrina: 'Antropologia e Hamartiologia',
    versiculosBase: 'Gênesis 1:26-27; Gênesis 2:7; Romanos 3:23; Romanos 5:12',
    leituraPadrao: 'Gênesis 1:26-28; Romanos 5:12-19',
    textoAureoPadrao: 'E criou Deus o homem à sua imagem; à imagem de Deus o criou; macho e fêmea os criou. (Gênesis 1:27 - ARC)',
    verdadePraticaPadrao: 'O ser humano foi criado de modo direto e imediato por Deus como coroa da criação, mas pela transgressão voluntária caiu em pecado, necessitando da graça redentora de Cristo.',
    termosOriginais: 'Tselem e Demuth (Hebraico: Imagem e Semelhança moral e espiritual) e Hamartia (Grego: errar o alvo da justiça divina).',
    fundamentacao: 'Os Capítulos 7 e 9 da Declaração de Fé da CGADB/CPAD ensinam a criação especial e imediata do homem por Deus (rejeitando absolutamente o evolucionismo), a tricotomia humana (espírito, alma e corpo — 1 Ts 5:23) e que o pecado entrou no mundo pela desobediência de Adão após a rebelião original do querubim ungido.',
    keywords: ['homem', 'criação', 'adão', 'pecado', 'queda', 'alma', 'espírito', 'antropologia', 'hamartiologia', 'gênesis', 'tentação', 'éden']
  },
  {
    capitulo: 'Capítulo 10 - Sobre a Salvação, Justificação, Regeneração e Santificação (Soteriologia)',
    titulo: 'A Graça Salvadora Acessível a Todos mediante a Fé em Cristo e a Vida de Santidade',
    doutrina: 'Soteriologia Pentecostal (Arminianismo Clássico)',
    versiculosBase: 'Efésios 2:8-10; Tito 2:11-14; Romanos 5:1; Hebreus 12:14',
    leituraPadrao: 'Efésios 2:1-10',
    textoAureoPadrao: 'Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus. (Efésios 2:8 - ARC)',
    verdadePraticaPadrao: 'A salvação é um dom gratuito de Deus oferecido a toda a humanidade mediante o arrependimento e a fé em Jesus Cristo, resultando em regeneração, justificação e santificação contínua.',
    termosOriginais: 'Soteria (Grego: Salvação/Livramento), Dikaiosis (Justificação forense), Palingenesia (Regeneração) e Hagiasmos (Santificação).',
    fundamentacao: 'O Capítulo 10 da Declaração de Fé da CGADB/CPAD afirma que a salvação é pela graça mediante a fé, disponível a todos os homens (Tito 2:11). Inclui o arrependimento, o novo nascimento, a justificação gratuita diante de Deus e a santificação posicional e progressiva sem a qual ninguém verá o Senhor.',
    keywords: ['salvação', 'graça', 'fé', 'justificação', 'santificação', 'santidade', 'regeneração', 'conversão', 'arrependimento', 'perdão', 'soteriologia', 'caráter']
  },
  {
    capitulo: 'Capítulos 11 a 14 - Sobre a Igreja, Batismo em Águas e Santa Ceia (Eclesiologia)',
    titulo: 'A Natureza da Igreja de Cristo, o Batismo por Imersão e o Memorial da Ceia do Senhor',
    doutrina: 'Eclesiologia e Ordenanças',
    versiculosBase: 'Mateus 16:18; Efésios 4:11-16; Romanos 6:3-4; 1 Coríntios 11:23-29',
    leituraPadrao: 'Atos 2:41-47',
    textoAureoPadrao: 'E perseveravam na doutrina dos apóstolos, e na comunhão, e no partir do pão, e nas orações. (Atos 2:42 - ARC)',
    verdadePraticaPadrao: 'A Igreja é o Corpo vivo de Cristo na Terra, chamada a adorar a Deus, evangelizar as nações, guardar a comunhão dos santos e celebrar fielmente o Batismo por imersão e a Santa Ceia.',
    termosOriginais: 'Ekklesia (Grego: Assembleia dos chamados para fora), Baptizo (Imersão completa em águas) e Koinonia (Comunhão fraternal no Espírito).',
    fundamentacao: 'Conforme os Capítulos 11 a 14 da Declaração de Fé da CGADB/CPAD, a Igreja é o corpo místico de Cristo, coluna e firmeza da verdade. O Senhor instituiu duas ordenanças perpétuas: o Batismo em Águas exclusivamente por imersão em nome da Trindade e a Ceia do Senhor como memorial da morte vicária e proclamação da segunda vinda de Cristo.',
    keywords: ['igreja', 'eclesiologia', 'batismo', 'ceia', 'santa ceia', 'comunhão', 'missões', 'evangelismo', 'ministério', 'obreiros', 'liderança', 'culto', 'adoração', 'atos']
  },
  {
    capitulo: 'Capítulo 21 - Sobre a Cura Divina',
    titulo: 'A Atualidade da Cura Divina Provida na Expiação de Cristo',
    doutrina: 'Cura Divina e Oração da Fé',
    versiculosBase: 'Isaías 53:4-5; Mateus 8:16-17; Tiago 5:14-16; Marcos 16:17-18',
    leituraPadrao: 'Tiago 5:13-18',
    textoAureoPadrao: 'Verdadeiramente ele tomou sobre si as nossas enfermidades, e as nossas dores levou sobre si... e pelas suas pisaduras fomos sarados. (Isaías 53:4-5 - ARC)',
    verdadePraticaPadrao: 'A cura divina é uma bênção integrante da obra redentora de Cristo no Calvário e permanece plenamente acessível hoje mediante a oração da fé.',
    termosOriginais: 'Rapha (Hebraico: Jeová-Rafá, o Senhor que sara) e Iaomai / Therapeuo (Grego: Curar e restaurar integralmente).',
    fundamentacao: 'O Capítulo 21 da Declaração de Fé da CGADB/CPAD declara que o livramento da enfermidade foi providenciado na expiação de Cristo, sendo privilégio de todos os crentes na atualidade buscar a Deus em oração, unção com óleo pelos presbíteros e imposição de mãos.',
    keywords: ['cura', 'enfermidade', 'milagre', 'oração', 'unção', 'saúde', 'libertação']
  },
  {
    capitulo: 'Capítulos 22 e 23 - Sobre a Segunda Vinda de Cristo e o Mundo Vindouro (Escatologia)',
    titulo: 'O Arrebatamento Pré-Tribulacionista da Igreja, o Milênio Literal e o Juízo Final',
    doutrina: 'Escatologia Bíblica Pentecostal',
    versiculosBase: '1 Tessalonicenses 4:16-17; 1 Coríntios 15:51-52; Apocalipse 20:1-6; Apocalipse 21:1-4',
    leituraPadrao: '1 Tessalonicenses 4:13-18',
    textoAureoPadrao: 'Porque o mesmo Senhor descerá do céu com alarido, e com voz de arcanjo, e com a trombeta de Deus; e os que morreram em Cristo ressuscitarão primeiro. (1 Tessalonicenses 4:16 - ARC)',
    verdadePraticaPadrao: 'A Segunda Vinda de Cristo dar-se-á em duas fases distintas: primeiro o Arrebatamento invisível da Igreja antes da Grande Tribulação, e depois o seu retorno visível em glória para instaurar o Milênio.',
    termosOriginais: 'Parousia (Grego: Presença/Vinda real de Cristo), Harpazo (1 Ts 4:17 — Arrebatar com força e rapidez) e Epiphaneia (Manifestação gloriosa).',
    fundamentacao: 'Os Capítulos 22 e 23 da Declaração de Fé da CGADB/CPAD professam a bendita esperança da Igreja: o Arrebatamento pré-tribulacionista e pré-milenista dos salvos, o Tribunal de Cristo e as Bodas do Cordeiro nos céus, seguidos pela volta visível de Jesus para reinar literalmente por mil anos sobre a Terra e pelo Juízo Final do Grande Trono Branco.',
    keywords: ['escatologia', 'arrebatamento', 'apocalipse', 'segunda vinda', 'milênio', 'juízo', 'céu', 'eternidade', 'fim dos tempos', 'profecia', 'daniel', 'esperança']
  },
  {
    capitulo: 'Capítulo 24 - Sobre a Família',
    titulo: 'A Instituição Divina da Família, o Casamento Monogâmico e a Educação Cristã dos Filhos',
    doutrina: 'Teologia da Família e Ética Cristã',
    versiculosBase: 'Gênesis 2:18-24; Salmos 127:1-5; Efésios 5:22-33; Efésios 6:1-4',
    leituraPadrao: 'Efésios 5:22-33',
    textoAureoPadrao: 'Portanto, deixará o varão o seu pai e a sua mãe, e apegar-se-á à sua mulher, e serão ambos uma carne. (Gênesis 2:24 - ARC)',
    verdadePraticaPadrao: 'A família foi instituída diretamente por Deus no Éden através do casamento indissolúvel e monogâmico entre um homem e uma mulher como célula fundamental da sociedade e da Igreja.',
    termosOriginais: 'Bayit (Hebraico: Casa/Família edificada sob aliança) e Oikos (Grego: Lar doméstico consagrado ao Senhor).',
    fundamentacao: 'O Capítulo 24 da Declaração de Fé da CGADB/CPAD ensina que a família é uma instituição sagrada criada por Deus, constituída pelo casamento exclusivamente entre um homem e uma mulher por nascimento, cabendo aos pais criar os filhos na disciplina e admoestação do Senhor.',
    keywords: ['família', 'casamento', 'lar', 'filhos', 'pais', 'cônjuge', 'esposa', 'marido', 'juventude', 'ética', 'sexualidade', 'educação']
  }
];

export const CATALOGO_OFICIAL_REVISTAS_EBD: EBDMagazineCatalogItem[] = [
  {
    id: 'cpad-promessas-deus',
    titulo: 'As Promessas de Deus',
    subtitulo: 'A Fidelidade da Aliança Divina para a Igreja Contemporânea',
    editora: 'CPAD',
    comentarista: 'Pr. Elienai Cabral',
    publico: 'Adultos',
    trimestre: '1º Trimestre',
    declaracaoCap: 'Cap. 2, 10 e 22 (Teontologia, Soteriologia e Escatologia)',
    capa: 'https://images.unsplash.com/photo-1504052434569-70ad58565b90?auto=format&fit=crop&w=800&q=80',
    descricao: 'Estudo bíblico-exegético sobre as alianças e promessas infalíveis de Deus no Antigo e no Novo Testamento para a vida do crente fiel.'
  },
  {
    id: 'cpad-declaracao-fe',
    titulo: 'A Declaração de Fé das Assembleias de Deus',
    subtitulo: 'A Inerrância Bíblica e os Fundamentos Dogmáticos Pentecostais',
    editora: 'CPAD',
    comentarista: 'Pr. Esequias Soares',
    publico: 'Adultos',
    trimestre: '2º Trimestre',
    declaracaoCap: 'Cap. 1 a 24 (Declaração de Fé CPAD/CGADB)',
    capa: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    descricao: 'Panorama teológico e exegético de todos os pontos doutrinários fundamentais da fé pentecostal clássica.'
  },
  {
    id: 'cpad-pneumatologia',
    titulo: 'O Espírito Santo e os Dons Espirituais',
    subtitulo: 'A Atualidade do Pentecostes, o Fruto e o Poder para a Igreja',
    editora: 'CPAD',
    comentarista: 'Pr. Claudionor de Andrade',
    publico: 'Adultos / Jovens',
    trimestre: '3º Trimestre',
    declaracaoCap: 'Cap. 6, 19 e 20 (Pneumatologia e Distintivos Pentecostais)',
    capa: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    descricao: 'O mover glorioso do Espírito Santo, os dons espirituais na atualidade e a promessa do Batismo no Espírito Santo.'
  },
  {
    id: 'cpad-carater-cristao',
    titulo: 'O Caráter do Cristão',
    subtitulo: 'Santificação, Ética Bíblica e o Fruto do Espírito no Mundo Atual',
    editora: 'CPAD',
    comentarista: 'Pr. José Gonçalves',
    publico: 'Adultos',
    trimestre: '4º Trimestre',
    declaracaoCap: 'Cap. 10 (Soteriologia e Santificação)',
    capa: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80',
    descricao: 'As virtudes do Reino de Deus, o Sermão do Monte e a integridade moral do discípulo de Cristo.'
  },
  {
    id: 'cpad-escatologia',
    titulo: 'Escatologia Bíblica: O Plano de Deus para o Fim dos Tempos',
    subtitulo: 'Segunda Vinda, Arrebatamento Pré-Tribulacionista, Milênio e Juízo Final',
    editora: 'CPAD',
    comentarista: 'Pr. Douglas Baptista',
    publico: 'Adultos / Jovens',
    trimestre: '1º Trimestre',
    declaracaoCap: 'Cap. 22 e 23 (Escatologia Bíblica e Juízo Final)',
    capa: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    descricao: 'A bendita esperança do Arrebatamento da Igreja, Tribunal de Cristo, Bodas do Cordeiro, Milênio literal e o Estado Eterno.'
  },
  {
    id: 'cpad-eclesiologia',
    titulo: 'A Igreja de Cristo e Seu Ministério',
    subtitulo: 'Eclesiologia, Batismo em Águas por Imersão, Santa Ceia e Missões',
    editora: 'CPAD',
    comentarista: 'Pr. Antonio Gilberto',
    publico: 'Adultos',
    trimestre: '2º Trimestre',
    declaracaoCap: 'Cap. 11 a 14 (Eclesiologia, Batismo e Ceia)',
    capa: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    descricao: 'A natureza da Igreja de Cristo, o corpo de Cristo, ordenanças bíblicas e a comunhão dos santos.'
  },
  {
    id: 'betel-familia-crista',
    titulo: 'A Família Cristã Diante dos Desafios do Século XXI',
    subtitulo: 'Princípios Inegociáveis da Palavra de Deus para o Lar',
    editora: 'Editora Betel',
    comentarista: 'Pr. Osiel Gomes',
    publico: 'Adultos',
    trimestre: '3º Trimestre',
    declaracaoCap: 'Cap. 24 (Sobre a Família)',
    capa: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    descricao: 'Os princípios divinos e inalteráveis para a edificação da família, casamento monogâmico e educação cristã dos filhos.'
  },
  {
    id: 'cpad-jovens-apologetica',
    titulo: 'Inabaláveis na Fé: Apologética Cristã',
    subtitulo: 'Defendendo a Fé Bíblica e a Cosmovisão Pentecostal',
    editora: 'CPAD',
    comentarista: 'Pr. Alexandre Coelho',
    publico: 'Jovens',
    trimestre: '4º Trimestre',
    declaracaoCap: 'Cap. 1, 7 e 10 (Bibliologia, Antropologia e Soteriologia)',
    capa: 'https://images.unsplash.com/photo-1543189718-40e9d9685b8c?auto=format&fit=crop&w=800&q=80',
    descricao: 'Respostas bíblicas e racionais para defender a fé cristã frente às filosofias pós-modernas e ideologias secularistas.'
  }
];

/**
 * Identifica o capítulo mais aderente da Declaração de Fé da CGADB/CPAD
 * com base no nome da revista, tema central e título da lição.
 */
export function resolveDogmaticChapter(queryText: string): DogmaticChapterInfo {
  const normalized = (queryText || '').toLowerCase();
  let bestMatch = DECLARACAO_FE_24_CAPITULOS[0];
  let bestScore = 0;

  for (const cap of DECLARACAO_FE_24_CAPITULOS) {
    let score = 0;
    for (const kw of cap.keywords) {
      if (normalized.includes(kw)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = cap;
    }
  }
  return bestMatch;
}

/**
 * Gera um sumário estruturado de 13 lições para qualquer Revista / Tema Central, Editora e Autor
 */
export function build13LessonsForMagazine(params: {
  revista: string;
  temaCentral?: string;
  editora?: string;
  autor?: string;
  publico?: string;
  licaoEspecificaNum?: string;
  licaoEspecificaTitulo?: string;
}): EBDLicaoSumario[] {
  const {
    revista,
    temaCentral = '',
    licaoEspecificaNum,
    licaoEspecificaTitulo
  } = params;

  const baseTheme = revista.trim() || 'Fundamentos da Fé Bíblica';
  const dogmatic = resolveDogmaticChapter(`${revista} ${temaCentral} ${licaoEspecificaTitulo || ''}`);

  const thematicProgression = [
    {
      sufixo: `A Revelação Bíblica sobre ${baseTheme}`,
      aureo: 'Lâmpada para os meus pés é tua palavra, e luz para o meu caminho. (Salmos 119:105 - ARC)',
      verdade: `O estudo das Sagradas Escrituras revela o propósito eterno de Deus acerca de ${baseTheme.toLowerCase()}.`,
      leitura: '2 Timóteo 3:14-17'
    },
    {
      sufixo: `O Caráter e a Soberania de Deus em ${baseTheme}`,
      aureo: 'Porque dele, e por ele, e para ele são todas as coisas; glória, pois, a ele eternamente. Amém! (Romanos 11:36 - ARC)',
      verdade: 'Deus governa a história com fidelidade absoluta, cumprindo cada uma de suas promessas.',
      leitura: 'Salmos 103:1-13'
    },
    {
      sufixo: `Cristo como Centro de ${baseTheme}`,
      aureo: 'Porque todas quantas promessas há de Deus são nele sim; e por ele o Amém, para glória de Deus, por nós. (2 Coríntios 1:20 - ARC)',
      verdade: 'Em Jesus Cristo encontram-se a plenitude da redenção e o cumprimento perfeito do plano divino.',
      leitura: 'Filipenses 2:5-11'
    },
    {
      sufixo: `A Ação do Espírito Santo e ${baseTheme}`,
      aureo: 'Mas recebereis a virtude do Espírito Santo, que há de vir sobre vós; e ser-me-eis testemunhas. (Atos 1:8 - ARC)',
      verdade: 'O Espírito Santo capacita, santifica e guia a Igreja na vivência prática da verdade bíblica.',
      leitura: 'Romanos 8:11-17'
    },
    {
      sufixo: `Cristo entre os Filósofos: O Deus Desconhecido se Revela`,
      aureo: 'Porque, passando eu e vendo os vossos santuários, achei também um altar em que estava escrito: AO DEUS DESCONHECIDO. Esse, pois, que vós honrais, não o conhecendo, é o que eu vos anuncio. (Atos 17:23 - ARC)',
      verdade: 'As filosofias humanas não podem alcançar a salvação; somente em Cristo o Deus Criador se revela de modo pessoal e redentor.',
      leitura: 'Atos 17:22-31'
    },
    {
      sufixo: `Santificação e Integridade Cristã`,
      aureo: 'Segui a paz com todos e a santificação, sem a qual ninguém verá o Senhor. (Hebreus 12:14 - ARC)',
      verdade: 'O chamado cristão exige separação do pecado e consagração diária ao Senhor.',
      leitura: '1 Pedro 1:13-21'
    },
    {
      sufixo: `A Oração e a Comunhão com Deus`,
      aureo: 'Orai sem cessar. Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco. (1 Tessalonicenses 5:17-18 - ARC)',
      verdade: 'A vida de oração contínua mantém o crente sensível à voz do Espírito e fortalecido na graça.',
      leitura: 'Filipenses 4:4-9'
    },
    {
      sufixo: `A Família Cristã sob a Bênção Divina`,
      aureo: 'Eu e a minha casa serviremos ao Senhor. (Josué 24:15 - ARC)',
      verdade: 'O lar edificado sobre a Rocha de Cristo preserva os valores eternos de Deus entre as gerações.',
      leitura: 'Efésios 5:22-33'
    },
    {
      sufixo: `A Igreja Local: Comunhão, Adoração e Serviço`,
      aureo: 'E perseveravam na doutrina dos apóstolos, e na comunhão, e no partir do pão, e nas orações. (Atos 2:42 - ARC)',
      verdade: 'A Igreja local é o ambiente divinamente instituído para o aperfeiçoamento dos santos.',
      leitura: 'Atos 2:41-47'
    },
    {
      sufixo: `O Fruto do Espírito e o Testemunho Público`,
      aureo: 'Mas o fruto do Espírito é: amor, gozo, paz, longanimidade, benignidade, bondade, fé, mansidão, temperança. (Gálatas 5:22 - ARC)',
      verdade: 'O caráter de Cristo manifesto no crente é o maior testemunho do Evangelho perante o mundo.',
      leitura: 'Gálatas 5:16-25'
    },
    {
      sufixo: `Os Dons Espirituais e a Edificação do Corpo de Cristo`,
      aureo: 'Mas a manifestação do Espírito é dada a cada um para o que for útil. (1 Coríntios 12:7 - ARC)',
      verdade: 'Os dons espirituais permanecem atuais para edificar, consolar e revestir a Igreja de poder.',
      leitura: '1 Coríntios 12:1-11'
    },
    {
      sufixo: `A Missão Evangelizadora da Igreja`,
      aureo: 'Portanto, ide, ensinai todas as nações, batizando-as em nome do Pai, e do Filho, e do Espírito Santo. (Mateus 28:19 - ARC)',
      verdade: 'Todo salvo é chamado a anunciar as boas-novas da salvação até que Cristo venha.',
      leitura: 'Mateus 28:16-20'
    },
    {
      sufixo: `A Bendita Esperança: Perseverança até a Glória Eterna`,
      aureo: 'Sê fiel até à morte, e dar-te-ei a coroa da vida. (Apocalipse 2:10 - ARC)',
      verdade: 'Aquele que perseverar firme na sã doutrina até o fim receberá o galardão eterno nos céus.',
      leitura: '1 Tessalonicenses 4:13-18'
    }
  ];

  const targetNum = licaoEspecificaNum ? parseInt(String(licaoEspecificaNum).replace(/\D/g, ''), 10) : NaN;

  return thematicProgression.map((item, idx) => {
    const num = idx + 1;
    const isTargetLesson = !isNaN(targetNum) && targetNum === num && licaoEspecificaTitulo && licaoEspecificaTitulo.trim().length > 0;
    const lessonTitle = isTargetLesson ? licaoEspecificaTitulo!.trim() : item.sufixo;
    const lessonDogmatic = isTargetLesson ? resolveDogmaticChapter(`${revista} ${lessonTitle}`) : dogmatic;

    return {
      num,
      licao_numero: `${num}`,
      titulo: lessonTitle,
      texto_aureo: isTargetLesson ? lessonDogmatic.textoAureoPadrao : item.aureo,
      aureo: isTargetLesson ? lessonDogmatic.textoAureoPadrao : item.aureo,
      verdade_pratica: isTargetLesson ? lessonDogmatic.verdadePraticaPadrao : item.verdade,
      verdade: isTargetLesson ? lessonDogmatic.verdadePraticaPadrao : item.verdade,
      leitura_biblica: isTargetLesson ? lessonDogmatic.leituraPadrao : item.leitura,
      leitura: isTargetLesson ? lessonDogmatic.leituraPadrao : item.leitura,
      capitulo_declaracao_fe: lessonDogmatic.capitulo
    };
  });
}

/**
 * Resolve o perfil bíblico-exegético detalhado da lição a partir do Título da Lição, Revista, Subtítulo e Referências.
 * Garante que cada tópico e subtópico seja profundamente desenvolvido com base nos dados reais informados.
 */
function buildDeepTheologicalTopics(params: {
  revista: string;
  subtitulo: string;
  trimestre: string;
  turma: string;
  editora: string;
  autor: string;
  licaoNum: string;
  tituloLicao: string;
  dataLicao: string;
  leituraBiblica: string;
  textoAureo: string;
  verdadePratica: string;
  dogmatic: DogmaticChapterInfo;
}): {
  resolvedLeituraRef: string;
  resolvedTextoAureo: string;
  resolvedVerdadePratica: string;
  contextoIntrodutorio: string;
  topicos: EBDTopicDetail[];
} {
  const {
    revista,
    subtitulo,
    trimestre,
    turma,
    editora,
    autor,
    licaoNum,
    tituloLicao,
    leituraBiblica,
    textoAureo,
    verdadePratica,
    dogmatic
  } = params;

  const combinedLower = `${revista} ${subtitulo} ${tituloLicao} ${leituraBiblica}`.toLowerCase();

  // Caso Especial 1: Atenas / Filósofos / Deus Desconhecido / Areópago / Apologética Paulina (Atos 17)
  if (
    combinedLower.includes('filósofo') ||
    combinedLower.includes('filosofo') ||
    combinedLower.includes('deus desconhecido') ||
    combinedLower.includes('areópago') ||
    combinedLower.includes('areopago') ||
    combinedLower.includes('atenas') ||
    combinedLower.includes('atos 17')
  ) {
    const refBase = leituraBiblica.trim() || 'Atos 17:22-31';
    const aureo = textoAureo.trim()
      ? resolveSingleVerseQuoteARC(textoAureo)
      : '"Porque, passando eu e vendo os vossos santuários, achei também um altar em que estava escrito: AO DEUS DESCONHECIDO. Esse, pois, que vós honrais, não o conhecendo, é o que eu vos anuncio." (Atos 17:23 - ARC)';
    const verdade = verdadePratica.trim() ||
      'A sabedoria filosófica humana é incapaz de redimir o pecador; somente através da revelação de Jesus Cristo crucificado e ressurreto o Deus verdadeiro se faz conhecido para a salvação eterna.';

    const intro = `O estudo da **Lição ${licaoNum} (${tituloLicao})**, integrante da revista **"${revista}"**${subtitulo ? ` (*${subtitulo}*)` : ''}, editada pela **${editora}** para a turma de **${turma}** (${trimestre}) sob o comentário teológico de **${autor}**, analisa um dos momentos mais sublimes da história da Igreja Primitiva: o discurso apologético do apóstolo Paulo perante o conselho do Areópago em Atenas (Atos 17:16-34).

Enquanto aguardava Silas e Timóteo na capital intelectual do mundo greco-romano, o espírito de Paulo "se comovia em si mesmo, vendo a cidade tão entregue à idolatria" (At 17:16). Atenas ostentava o esplendor da filosofia clássica de Sócrates, Platão e Aristóteles, além das escolas helenísticas dos epicureus e estoicos, mas encontrava-se submersa em profunda cegueira espiritual. Com sabedoria dada pelo Espírito Santo, Paulo parte do altar dedicado **"AO DEUS DESCONHECIDO"** (*Agnosto Theo*) para proclamar o Deus Criador dos céus e da terra, a unidade da raça humana, o chamado universal ao arrependimento e a ressurreição histórica de nosso Senhor Jesus Cristo.`;

    const topicos: EBDTopicDetail[] = [
      {
        romano: 'I',
        titulo: 'O Contexto Filosófico e Religioso de Atenas e o Embate na Ágora (Atos 17:16-21)',
        introducaoTopico: `Neste primeiro tópico da revista **${revista}** (${editora}), examinamos o cenário cultural, filosófico e espiritual que o apóstolo Paulo encontrou em Atenas durante sua segunda viagem missionária. Longe de intimidar-se diante da erudição pagã, o apóstolo movido pelo Espírito Santo confronta a idolatria e as cosmovisões humanistas com a autoridade da Palavra de Deus.`,
        referenciasTopico: 'Atos 17:16-21; Colossenses 2:8; 1 Coríntios 1:20-25',
        subtopicos: [
          {
            codigo: '1.1',
            titulo: 'A Indignação Santa de Paulo Diante da Idolatria Ateniense (Atos 17:16; Êxodo 20:3-5)',
            referencia: 'Atos 17:16-17',
            exegese: `O texto lucano registra que, enquanto Paulo esperava seus cooperadores em Atenas, *"o seu espírito se comovia em si mesmo, vendo a cidade tão entregue à idolatria"* (At 17:16). No grego koiné, o verbo traduzido por "se comovia" é **paroxyneto** (de *paroxyno*, de onde deriva a palavra "paroxismo"), indicando uma profunda aflição espiritual, zelo ardente pela glória de Deus e dor pelas almas escravizadas pelo engano. O termo **kateidolos** ("entregue à idolatria" ou "repleta de ídolos") descrevia uma metrópole onde historiadores antigos afirmavam ser mais fácil encontrar uma divindade esculpida em mármore do que um homem nas ruas. Em vez de conformar-se com o pluralismo religioso, Paulo dirigiu-se à sinagoga dos judeus e, todos os dias, à praça pública (*Ágora*), anunciando a verdade com santa ousadia.`,
            aplicacaoSubtopico: `Para a classe de **${turma}**, este subtópico ensina que o verdadeiro cristão não pode contemplar os ídolos modernos — o materialismo, o hedonismo e a incredulidade — com indiferença, mas deve sentir compaixão missionária pelas almas perdidas.`
          },
          {
            codigo: '1.2',
            titulo: 'O Confronto com os Filósofos Epicureus e Estoicos (Atos 17:18; Colossenses 2:8)',
            referencia: 'Atos 17:18; Colossenses 2:8',
            exegese: `Na Ágora ateniense, Paulo foi interpelado por duas das principais correntes filosóficas do período helenístico: os **Epicureus** (discípulos de Epicuro, 341–270 a.C.) e os **Estoicos** (seguidores de Zenão de Cítio, 334–262 a.C.). Os epicureus defendiam uma cosmovisão materialista e deísta: criam que o mundo resultava do acaso de átomos, negavam a imortalidade da alma e o juízo futuro, e estabeleciam o prazer moderado e a ausência de dor (*ataraxia*) como o sumo bem da existência. Já os estoicos sustentavam um panteísmo determinista, identificando a divindade com a alma do cosmos (*Logos* impessoal), pregando a autossuficiência moral (*autarkeia*) e a resignação ao destino (*fatum*). Diante dessas duas filosofias vazias (Cl 2:8), Paulo pregava a pessoa viva de **Jesus** (*Iesous*) e a **Ressurreição** (*Anastasis*), verdades que demoliam tanto o materialismo epicureu quanto o panteísmo estoico.`,
            aplicacaoSubtopico: `A apologética pentecostal ensinada na Declaração de Fé da CGADB (Cap. 1 e 2) equipa a Igreja para discernir e refutar tanto o materialismo ateu quanto o misticismo panteísta contemporâneo.`
          },
          {
            codigo: '1.3',
            titulo: 'O Convite ao Areópago e a Insuficiência do Racionalismo Sem Revelação (Atos 17:19-21; 1 Coríntios 1:21)',
            referencia: 'Atos 17:19-21; 1 Coríntios 1:20-21',
            exegese: `Intrigados com a pregação apostólica — chamando Paulo de *spermologos* ("palrador" ou "colhedor de sementes") —, os filósofos conduziram-no ao **Areópago** ("Colina de Ares/Marte"), o venerável conselho ateniense que supervisionava a religião, a moral e o ensino público da cidade. Lucas observa que os atenienses *"não se ocupavam de outra coisa senão de dizer e ouvir alguma novidade"* (At 17:21). Essa inquietação intelectual perpétua comprova a sentença de Paulo em 1 Coríntios 1:21: *"Visto como, na sabedoria de Deus, o mundo não conheceu a Deus pela sua sabedoria, aprouve a Deus salvar os crentes pela loucura da pregação"*. A mente humana, por mais brilhante que seja na ciência e na filosofia, permanece em trevas espirituais até que receba a revelação sobrenatural do Evangelho de Cristo.`,
            aplicacaoSubtopico: `O estudante da EBD aprende que novidades filosóficas passageiras jamais saciam a sede da alma humana; somente a Palavra eterna de Deus traz certeza, paz e salvação.`
          }
        ],
        sinteseTeologica: `A cultura e a filosofia de Atenas demonstram que o intelecto humano caído constrói altares e sistemas de pensamento, mas jamais encontra a comunhão com o Deus vivo sem a revelação das Escrituras e a obra redentora de Cristo.`
      },
      {
        romano: 'II',
        titulo: 'O Altar ao "Deus Desconhecido" e a Revelação do Deus Criador (Atos 17:22-28)',
        introducaoTopico: `No segundo tópico de **"${tituloLicao}"**, acompanhamos a magistral homilética e apologética de Paulo no Areópago. Em vez de iniciar com ataques estéreis, o apóstolo estabelece um ponto de contato cultural — a inscrição **"AO DEUS DESCONHECIDO"** — para revelar a Teontologia bíblica: o Deus Único, Criador, Transcendente, Autossuficiente e Sustentador de toda a humanidade.`,
        referenciasTopico: 'Atos 17:22-28; Gênesis 1:1, 27; Isaías 42:5',
        subtopicos: [
          {
            codigo: '2.1',
            titulo: 'Do Altar ao "Deus Desconhecido" à Revelação Plena e Pessoal (Atos 17:22-23; Romanos 1:19-20)',
            referencia: 'Atos 17:22-23',
            exegese: `Postando-se no centro do Areópago, Paulo inicia seu discurso reconhecendo a intensa religiosidade (*deisidaimonesterous*) dos atenienses e cita um fato concreto observado em sua caminhada pela cidade: *"Achei também um altar em que estava escrito: AO DEUS DESCONHECIDO. Esse, pois, que vós honrais, não o conhecendo, é o que eu vos anuncio"* (At 17:23). A tradição histórica grega (registrada por Diógenes Laércio e Pausânias) relata que, durante uma peste em Atenas no século VI a.C., Epimênides de Creta orientou que ovelhas fossem soltas no Areópago e sacrificadas "ao deus pertinente" onde se deitassem, originando altares a divindades anônimas. Paulo utiliza essa confissão pública de ignorância espiritual como ponte apologética para anunciar que o verdadeiro Deus não é uma força incógnita, mas o Senhor que Se revelou na História da Salvação.`,
            aplicacaoSubtopico: `No evangelismo pessoal e na docência da EBD, devemos comunicar o Evangelho com inteligência, cortesia e firmeza bíblica, conduzindo o ouvinte da religiosidade vazia ao conhecimento pessoal de Cristo.`
          },
          {
            codigo: '2.2',
            titulo: 'O Deus Criador, Soberano e Autossuficiente (Atos 17:24-25; Salmos 50:10-12)',
            referencia: 'Atos 17:24-25',
            exegese: `Paulo apresenta a doutrina bíblica da Criação (*Teontologia* — Cap. 2 da Declaração de Fé CGADB): *"O Deus que fez o mundo e tudo que nele há, sendo Senhor do céu e da terra, não habita em templos feitos por mãos de homens; nem tampouco é servido por mãos de homens, como que necessitando de alguma coisa; pois ele mesmo é quem dá a todos a vida, e a respiração, e todas as coisas"* (At 17:24-25). Com esta declaração solene, o apóstolo refuta: 1) O **materialismo epicureu**, afirmando que o universo tem um Criador pessoal e soberano; 2) O **panteísmo estoico**, demonstrando que Deus transcende a matéria e é distinto do cosmos; e 3) A **idolatria popular**, provando que Aquele que criou os céus não pode ser confinado nos santuários da Acrópole (como o Partenon) nem depende de ofertas humanas, pois possui o atributo da **Asseidade** (autossuficiência absoluta) e sustenta cada fôlego de vida.`,
            aplicacaoSubtopico: `Adoramos a um Deus Todo-Poderoso que não precisa ser manipulado por rituais pagãos, mas que, por Sua graça soberana, nos concede vida, respiração e salvação.`
          },
          {
            codigo: '2.3',
            titulo: 'A Unidade da Raça Humana e a Providência Divina na História (Atos 17:26-28; Gênesis 1:27)',
            referencia: 'Atos 17:26-28',
            exegese: `Os atenienses orgulhavam-se do mito de serem *autóctones* (nascidos do próprio solo da Ática) e superiores aos demais povos ("bárbaros"). Paulo destrói todo orgulho étnico e racista ao declarar: *"E de um só sangue fez toda a geração dos homens, para habitar sobre toda a face da terra, determinando os tempos já dantes ordenados e os limites da sua habitação"* (At 17:26). Em harmonia com Gênesis 1:26-27 e o Capítulo 7 da Declaração de Fé da CGADB, toda a humanidade descende do primeiro casal criado por Deus (Adão e Eva), compartilhando a mesma natureza, a mesma necessidade de redenção e o mesmo propósito: *"buscar o Senhor, se porventura, tinoando, o possam achar, ainda que não está longe de cada um de nós"* (At 17:27). Paulo chega a citar os poetas gregos Epimênides (*"nele vivemos, e nos movemos, e existimos"*) e Arato de Solos (*"Porque dele também somos geração"* — v. 28), ressignificando-os sob a verdade bíblica da criação e imanência divina.`,
            aplicacaoSubtopico: `Diante de Deus não há acepção de pessoas, raças ou classes sociais: todos fomos criados pelo Senhor e todos carecemos igualmente da graça salvadora de Cristo Jesus.`
          }
        ],
        sinteseTeologica: `O discurso do Areópago estabelece a harmonia perfeita entre a Revelação Geral na criação e na consciência humana e a Revelação Especial que culmina na pessoa bendita de Jesus Cristo.`
      },
      {
        romano: 'III',
        titulo: 'O Arrependimento Universal, o Juízo Vindouro e a Ressurreição de Cristo (Atos 17:29-34)',
        introducaoTopico: `No terceiro e conclusivo tópico da lição comentada por **${autor}** (${editora}), Paulo conduz seus ouvintes do conhecimento teológico do Criador para o clamor urgente da Soteriologia e da Escatologia: a ordem divina para o arrependimento, a certeza do Dia do Juízo e a vitória de Cristo através de Sua ressurreição dentre os mortos.`,
        referenciasTopico: 'Atos 17:29-34; 1 Coríntios 15:14-20; Atos 4:12',
        subtopicos: [
          {
            codigo: '3.1',
            titulo: 'O Fim dos Tempos da Ignorância e o Mandato do Arrependimento (Atos 17:29-30; Lucas 24:47)',
            referencia: 'Atos 17:29-30',
            exegese: `Se o ser humano é feitura de Deus, é irracional e pecaminoso reduzir a Divindade a *"ouro, ou prata, ou pedra, esculpidos pela arte e imaginação do homem"* (At 17:29). Em seguida, Paulo proclama o imperativo evangélico: *"Mas Deus, não tendo em conta os tempos da ignorância, anuncia agora a todos os homens, e em todo o lugar, que se arrependam"* (At 17:30). O termo grego para arrependimento é **metanoia** (mudança radical de mente, coração, direção e propósito de vida). A longanimidade divina suportou pacientemente as nações no passado (Rm 3:25), mas, com a chegada da plenitude dos tempos e a consumação da obra de Cristo na cruz, ninguém possui desculpa para permanecer na idolatria ou na incredulidade.`,
            aplicacaoSubtopico: `A pregação autêntica da Igreja não apenas informa o intelecto, mas confronta o pecado em amor e convoca o ouvinte ao arrependimento genuíno (*metanoia*) diante de Deus.`
          },
          {
            codigo: '3.2',
            titulo: 'O Dia do Juízo Justo e a Ressurreição Corporal de Jesus (Atos 17:31; 1 Coríntios 15:3-4)',
            referencia: 'Atos 17:31; 1 Coríntios 15:14-20',
            exegese: `Para a mentalidade grega cíclica, a história não possuía um desfecho moral definitivo. Paulo rompe com essa visão e declara a Escatologia bíblica (Capítulos 5, 22 e 23 da Declaração de Fé da CGADB): *"Porquanto tem determinado um dia em que com justiça há de julgar o mundo, por meio do varão que destinou; e disso deu certeza a todos, ressuscitando-o dos mortos"* (At 17:31). Aqui, **"o varão que destinou"** é o Senhor Jesus Cristo, o Filho de Deus encarnado (Jo 5:22, 27). A prova histórica, pública e irrefutável (*pistis* — garantia, penhor) de que Jesus é o Salvador e o Juiz universal é a Sua **ressurreição física e corporal dentre os mortos**. Enquanto os filósofos gregos viam o corpo físico como "o cárcere da alma" e rejeitavam a ressurreição da carne, o Evangelho anuncia o triunfo total de Cristo sobre a morte e o túmulo vazio.`,
            aplicacaoSubtopico: `Nossa fé não repousa em mitos filosóficos, mas no evento histórico da ressurreição de Jesus Cristo, que garante tanto a nossa justificação hoje quanto a nossa glorificação futura.`
          },
          {
            codigo: '3.3',
            titulo: 'As Três Reações Diante da Revelação de Cristo (Atos 17:32-34; Romanos 1:16)',
            referencia: 'Atos 17:32-34',
            exegese: `O desfecho do sermão de Paulo no Areópago (At 17:32-34) retrata as três atitudes permanentes da humanidade perante a pregação da Cruz e da Ressurreição: 1) **O Escárnio dos Incrédulos:** *"E, como ouviram falar da ressurreição dos mortos, uns escarneciam"* (v. 32a — provavelmente os epicureus materialistas); 2) **A Procrastinação dos Indecisos:** *"E outros diziam: Acerca disso te ouviremos outra vez"* (v. 32b — aqueles que adiam a decisão espiritual); e 3) **A Fé Salvadora dos Eleitos pela Graça:** *"Todavia, chegando-se alguns varões a ele, creram; entre os quais foi Dionísio, o areopagita, e uma mulher por nome Dâmaris, e com eles outros"* (v. 34). A conversão de um juiz do próprio tribunal do Areópago (Dionísio) e de uma mulher de destaque em Atenas (Dâmaris) comprova que a Palavra de Deus jamais volta vazia (Is 55:11) e que o Evangelho é o poder de Deus para a salvação de todo aquele que crê (Rm 1:16).`,
            aplicacaoSubtopico: `Mesmo diante do escárnio ou da indiferença do mundo secularizado, a Igreja e a Escola Bíblica Dominical devem continuar anunciando a Cristo com fidelidade, certos de que os corações sinceros crerão e serão salvos.`
          }
        ],
        sinteseTeologica: `Cristo entre os filósofos revela-se como a Sabedoria eterna de Deus (1 Co 1:24): onde a filosofia humana termina em dúvida diante de um altar ao "Deus Desconhecido", o Evangelho proclama o Salvador vivo e ressurreto.`
      }
    ];

    return {
      resolvedLeituraRef: refBase,
      resolvedTextoAureo: aureo,
      resolvedVerdadePratica: verdade,
      contextoIntrodutorio: intro,
      topicos
    };
  }

  // Construtor Dinâmico Profundo para Qualquer Outro Tema / Lição / Revista Informado
  const resolvedLeituraRef = leituraBiblica.trim() || dogmatic.leituraPadrao;
  const resolvedTextoAureo = textoAureo.trim()
    ? resolveSingleVerseQuoteARC(textoAureo)
    : dogmatic.textoAureoPadrao;
  const resolvedVerdadePratica = verdadePratica.trim() ||
    `O estudo sistemático de "${tituloLicao}" na revista "${revista}" firma o crente na sã doutrina bíblica (${dogmatic.doutrina}) e conduz a Igreja a uma vida santa, frutífera e fiel ao Senhor.`;

  const extraRefs = dogmatic.versiculosBase.split(';').map(s => s.trim()).filter(Boolean);
  const refTopico1 = resolvedLeituraRef;
  const refTopico2 = extraRefs.slice(0, 2).join('; ') || dogmatic.leituraPadrao;
  const refTopico3 = extraRefs.slice(2, 4).join('; ') || extraRefs[0] || resolvedLeituraRef;

  const contextoIntrodutorio = `O estudo da **Lição ${licaoNum} ("${tituloLicao}")**, integrante da revista **"${revista}"**${subtitulo ? ` — *${subtitulo}*` : ''}, publicada pela **${editora}** para o **${trimestre}** e destinada à classe de **${turma}** sob o comentário de **${autor}**, aprofunda de forma exegética, bíblica e prática os fundamentos de **${dogmatic.doutrina}**.

Em estrita consonância com **${dogmatic.capitulo}** da Declaração de Fé das Assembleias de Deus (CGADB/CPAD) e fundamentada na leitura bíblica de **${resolvedLeituraRef}**, esta lição examina como a revelação das Escrituras ilumina o entendimento espiritual da Igreja, refuta os enganos doutrinários contemporâneos e edifica o caráter cristão no cotidiano.`;

  const topicos: EBDTopicDetail[] = [
    {
      romano: 'I',
      titulo: `Fundamentos Bíblicos e Exegéticos de "${tituloLicao}" (${refTopico1})`,
      introducaoTopico: `Neste primeiro tópico da Lição ${licaoNum} da revista **${revista}** (${editora}), analisamos a base escriturística direta de **${tituloLicao}** a partir do texto-base de **${refTopico1}**, compreendendo seu contexto histórico, literário e teológico na revelação progressiva de Deus.`,
      referenciasTopico: `${refTopico1}; ${extraRefs[0] || '2 Timóteo 3:16-17'}`,
      subtopicos: [
        {
          codigo: '1.1',
          titulo: `O Contexto Histórico e a Revelação Divina em ${refTopico1}`,
          referencia: refTopico1,
          exegese: `A passagem central desta aula (**${refTopico1}**) insere-se no propósito redentor de Deus para instruir o Seu povo acerca de **${tituloLicao}**. Na hermenêutica pentecostal clássica ensinada por **${autor}**, o texto sagrado não é fruto de meras reflexões humanas, mas a Palavra viva e inerrante soprada pelo Espírito Santo (*theopneustos* — 2 Tm 3:16). Ao examinarmos os versículos da Leitura Bíblica em Classe, constatamos que o Senhor estabelece princípios eternos que revelam o Seu caráter santo, a Sua fidelidade pactual e a direção segura para a caminhada da comunidade da fé.`,
          aplicacaoSubtopico: `Para os alunos da turma de **${turma}**, o estudo atento de **${refTopico1}** desperta o amor reverente pelas Escrituras como bússola infalível para todas as decisões da vida.`
        },
        {
          codigo: '1.2',
          titulo: `Análise Léxica e Teológica dos Termos Originais (${dogmatic.doutrina})`,
          referencia: extraRefs[0] || refTopico1,
          exegese: `No aprofundamento exegético proposto na revista **"${revista}"**${subtitulo ? ` (*${subtitulo}*)` : ''}, destacam-se os conceitos fundamentais do texto original: **${dogmatic.termosOriginais}**. Essa riqueza semântica evidencia que a doutrina bíblica abordada na Lição ${licaoNum} possui raízes sólidas tanto na aliança veterotestamentária quanto na plenitude apostólica do Novo Testamento. O entendimento exato dessas palavras sagradas impede interpretações superficiais ou distorcidas, firmando o estudante na verdade ortodoxa.`,
          aplicacaoSubtopico: `O obreiro e o aluno que conhecem a profundidade dos termos bíblicos manejam bem a Palavra da verdade (2 Tm 2:15) e não se deixam levar por ventos de doutrina.`
        },
        {
          codigo: '1.3',
          titulo: `A Centralidade de Cristo no Tema "${tituloLicao}"`,
          referencia: extraRefs[1] || 'Colossenses 2:2-3',
          exegese: `Toda a arquitetura teológica desta lição converge para a pessoa e a obra consumada de nosso Senhor e Salvador Jesus Cristo. Como o próprio Mestre declarou aos discípulos no caminho de Emaús (Lc 24:27, 44), a Lei de Moisés, os Profetas e os Salmos testificam a Seu respeito. Assim, ao estudarmos **"${tituloLicao}"**, contemplamos a manifestação da graça multiforme de Deus em Cristo Jesus, em quem estão escondidos todos os tesouros da sabedoria e da ciência (Cl 2:3), garantindo redenção, reconciliação e vida abundante ao crente fiel.`,
          aplicacaoSubtopico: `Cristo deve ocupar o centro absoluto do nosso estudo na Escola Bíblica Dominical, da nossa adoração no templo e da nossa conduta diária.`
        }
      ],
      sinteseTeologica: `O primeiro tópico demonstra que "${tituloLicao}" está inabalavelmente alicerçado na autoridade inerrante da Bíblia Sagrada (${refTopico1}) e na centralidade redentora de Cristo.`
    },
    {
      romano: 'II',
      titulo: `A Doutrina Pentecostal e a Harmonia com a Declaração de Fé (${dogmatic.capitulo})`,
      introducaoTopico: `No segundo tópico desta Lição ${licaoNum}, relacionamos o ensino de **"${tituloLicao}"** com o corpo doutrinário oficial das Assembleias de Deus expresso em **${dogmatic.capitulo}** da Declaração de Fé da CGADB/CPAD, evidenciando a atuação dinâmica do Espírito Santo e a defesa apologética da fé.`,
      referenciasTopico: refTopico2,
      subtopicos: [
        {
          codigo: '2.1',
          titulo: `O Ensino Oficial em ${dogmatic.capitulo}`,
          referencia: extraRefs[0] || refTopico1,
          exegese: `${dogmatic.fundamentacao} Dentro do escopo trimestral da revista **"${revista}"** (${trimestre}), este marco dogmático assegura a unidade de fé e ensino em todas as classes da Escola Bíblica Dominical. A sã doutrina (*didaskalia*) funciona como coluna e firmeza da verdade (1 Tm 3:15), preservando o patrimônio espiritual legado pelos apóstolos e pelos pioneiros do movimento pentecostal.`,
          aplicacaoSubtopico: `Conhecer profundamente a Declaração de Fé protege a igreja local e cada família cristã contra o relativismo teológico e o sincretismo religioso.`
        },
        {
          codigo: '2.2',
          titulo: `A Iluminação e o Poder do Espírito Santo na Vivência da Verdade`,
          referencia: extraRefs[1] || 'João 16:13; Atos 1:8',
          exegese: `A teologia pentecostal ensinada pela **${editora}** jamais separa a letra bíblica do fervor do Espírito. O Espírito Santo, que inspirou os hagiógrafos na redação das Escrituras (2 Pe 1:21), atua hoje como o Divino Mestre e *Parakletos* que ilumina a mente do aluno e do professor, vivificando a verdade de **"${tituloLicao}"** no interior do coração humano. É pela virtude do Espírito que a verdade doutrinária transforma-se em experiência viva de regeneração, santificação e revestimento de poder.`,
          aplicacaoSubtopico: `Devemos estudar a lição da EBD com oração e dependência do Espírito Santo, unindo o conhecimento bíblico profundo à chama pentecostal no altar.`
        },
        {
          codigo: '2.3',
          titulo: `Refutação Bíblica aos Erros e Desvios Contemporâneos`,
          referencia: extraRefs[2] || 'Judas 1:3; Tito 1:9',
          exegese: `O comentarista **${autor}** ressalta a responsabilidade apologética de *"batalhar pela fé que uma vez foi dada aos santos"* (Jd 1:3). Diante das filosofias secularistas, do humanismo antropocêntrico e das distorções que tentam relativizar os preceitos de **${refTopico1}**, a exposição clara de **"${tituloLicao}"** reafirma a soberania da Palavra de Deus. A verdade prática desta aula — *"${resolvedVerdadePratica}"* — serve como antídoto espiritual contra o conformismo com este século (Rm 12:2).`,
          aplicacaoSubtopico: `Cada membro da turma de **${turma}** é chamado a estar sempre preparado para responder com mansidão e temor a qualquer que pedir a razão da esperança que há em nós (1 Pe 3:15).`
        }
      ],
      sinteseTeologica: `A ortodoxia doutrinária de ${dogmatic.capitulo} une o rigor exegético das Escrituras à experiência viva com o Espírito Santo, blindando a Igreja contra falsos ensinos.`
    },
    {
      romano: 'III',
      titulo: `Desdobramentos Práticos, Éticos e Ministeriais de "${tituloLicao}" (${refTopico3})`,
      introducaoTopico: `No terceiro tópico da Lição ${licaoNum}, passamos da exposição doutrinária para a ortopraxia cristã: como os ensinos de **"${tituloLicao}"** e o Texto Áureo desta semana devem moldar o caráter pessoal, edificar a família e impulsionar a missão da Igreja local.`,
      referenciasTopico: refTopico3,
      subtopicos: [
        {
          codigo: '3.1',
          titulo: `Santificação e Transformação do Caráter Cristão no Cotidiano`,
          referencia: extraRefs[2] || 'Hebreus 12:14; Tiago 1:22',
          exegese: `O verdadeiro aprendizado bíblico na Escola Dominical mede-se pela prática da Palavra: *"E sede cumpridores da palavra, e não somente ouvintes, enganando-vos com falsos discursos"* (Tg 1:22). Os princípios exegéticos extraídos de **"${tituloLicao}"** convocam o crente a uma vida de integridade moral, piedade (*eusebeia*), vigilância em oração e manifestação do Fruto do Espírito (Gl 5:22-23) no ambiente de trabalho, nos estudos e no convívio social.`,
          aplicacaoSubtopico: `Examine sua própria caminhada à luz desta Lição ${licaoNum}, permitindo que a Palavra de Deus corrija atitudes e fortaleça sua comunhão diária com o Senhor.`
        },
        {
          codigo: '3.2',
          titulo: `Edificação do Lar e Transmissão da Fé entre as Gerações`,
          referencia: extraRefs[3] || 'Deuteronômio 6:6-7; Josué 24:15',
          exegese: `No modelo bíblico de educação cristã (Dt 6:6-9; Sl 78:4-7), o ensino recebido no templo e na classe de **${turma}** deve ecoar dentro do lar. Quando os pais, jovens e membros compartilham em família as verdades estudadas na revista **"${revista}"**, o altar doméstico é fortalecido e as novas gerações crescem alicerçadas na Rocha eterna, imunes às tempestades morais do mundo contemporâneo (Mt 7:24-25).`,
          aplicacaoSubtopico: `Reúna sua família nesta semana para lerem juntos **${resolvedLeituraRef}** e meditarem no Texto Áureo da Lição ${licaoNum}.`
        },
        {
          codigo: '3.3',
          titulo: `Compromisso com a Igreja Local, o Serviço e a Esperança Eterna`,
          referencia: 'Atos 2:42; 1 Coríntios 15:58',
          exegese: `Por fim, o estudo de **"${tituloLicao}"** renova a visão missionária e escatológica do Corpo de Cristo. A Igreja que aprende a Palavra com zelo torna-se uma comunidade adoradora, acolhedora e proclamadora do Evangelho, permanecendo *"firmes e constantes, sempre abundantes na obra do Senhor, sabendo que o vosso trabalho não é vão no Senhor"* (1 Co 15:58), aguardando com lâmpadas acesas o glorioso Arrebatamento da Noiva do Cordeiro.`,
          aplicacaoSubtopico: `Coloque seus dons e talentos a serviço do Reino de Deus na sua congregação, perseverando fielmente até o dia da volta triunfal de Jesus Cristo.`
        }
      ],
      sinteseTeologica: `O ensino bíblico de "${tituloLicao}" cumpre seu propósito pedagógico quando gera vidas santificadas, famílias estruturadas na Palavra e uma Igreja fervorosa na adoração e na evangelização.`
    }
  ];

  return {
    resolvedLeituraRef,
    resolvedTextoAureo,
    resolvedVerdadePratica,
    contextoIntrodutorio,
    topicos
  };
}

/**
 * Construtor Completo de Apostila / Revista da EBD (6 Blocos Canônicos CGADB/CPAD)
 * 100% fiel aos dados informados pelo usuário (Revista, Subtítulo, Trimestre, Turma, Editora, Autor, Lição Nº, Título da Lição, Data, Leitura Bíblica e Texto Áureo)
 * e com desenvolvimento profundo, versículos reais da Bíblia ARC e exegese completa para cada tópico e subtópico.
 */
export function buildCompleteEBDLessonMarkdown(params: EBDLessonBuildParams): string {
  const {
    revista,
    temaCentral = '',
    subtitulo = '',
    trimestre = '1º Trimestre',
    licaoNum = '1',
    tituloLicao = '',
    dataLicao = '',
    editora = 'CPAD',
    autor = 'Comentarista Oficial EBD',
    faixaEtaria = 'Adultos',
    turma = '',
    textoBiblico = '',
    textoBiblicoIntegral = '',
    textoAureo = '',
    verdadePratica = '',
    subsidiosWeb = ''
  } = params;

  const cleanRevista = (revista || 'Lições Bíblicas EBD').trim();
  const cleanSubtitulo = (subtitulo || temaCentral || '').trim();
  const cleanTrimestre = (trimestre || '1º Trimestre').trim();
  const cleanTurma = (turma || faixaEtaria || 'Adultos').trim();
  const cleanEditora = (editora || 'CPAD').trim();
  const cleanAutor = (autor || 'Corpo Editorial CPAD / CGADB').trim();

  // Extrair número limpo e título limpo evitando duplicação como "Lição LIÇÃO 05"
  const rawNumStr = String(licaoNum || '1').trim();
  const matchNumAndTitle = rawNumStr.match(/^(?:LI[CÇ][AÃ]O\s*)?0*(\d{1,2})(?:\s*[-–:]\s*(.*))?$/i);
  const cleanNum = matchNumAndTitle ? matchNumAndTitle[1] : (rawNumStr.replace(/li[cç][aã]o\s*/i, '').trim() || '1');
  const extractedTitleFromNum = matchNumAndTitle && matchNumAndTitle[2] ? matchNumAndTitle[2].trim() : '';

  const rawTitulo = (tituloLicao || extractedTitleFromNum || '').replace(/^(?:LI[CÇ][AÃ]O\s*)?\d{1,2}\s*[-–:]\s*/i, '').trim();
  const finalLessonTitle = rawTitulo || `${cleanRevista} — Estudo Sistemático da Lição ${cleanNum}`;

  const dogmatic = resolveDogmaticChapter(`${cleanRevista} ${cleanSubtitulo} ${finalLessonTitle} ${textoBiblico}`);

  const profile = buildDeepTheologicalTopics({
    revista: cleanRevista,
    subtitulo: cleanSubtitulo,
    trimestre: cleanTrimestre,
    turma: cleanTurma,
    editora: cleanEditora,
    autor: cleanAutor,
    licaoNum: cleanNum,
    tituloLicao: finalLessonTitle,
    dataLicao,
    leituraBiblica: textoBiblico,
    textoAureo,
    verdadePratica,
    dogmatic
  });

  // Extrair os versículos reais da Bíblia ARC offline se não vieram preenchidos da chamada externa
  const arcPassageFromOffline = getFormattedBiblePassageARC(profile.resolvedLeituraRef, 16);
  const finalVersesBody = (textoBiblicoIntegral && textoBiblicoIntegral.trim().length > 40)
    ? textoBiblicoIntegral.trim()
    : (arcPassageFromOffline || getFormattedBiblePassageARC(dogmatic.leituraPadrao, 12));

  const leituraFormatada = `Referência Base: ${profile.resolvedLeituraRef} (Almeida Revista e Corrigida - ARC)\n${finalVersesBody}`;

  const formattedTopicsMarkdown = profile.topicos.map((top) => {
    const topicVersesARC = getFormattedBiblePassageARC(top.referenciasTopico, 6);
    const subtopicosMd = top.subtopicos.map((sub) => {
      const subVerseSnippet = getFormattedBiblePassageARC(sub.referencia, 3);
      return `### ${sub.codigo}. ${sub.titulo}
**Base Bíblica de Apoio:** ${sub.referencia}
${sub.exegese}
${subVerseSnippet ? `\n> **Texto Sagrado (${sub.referencia} - ARC):**\n> ${subVerseSnippet.split('\n').join('\n> ')}\n` : ''}
**Aplicação Pedagógica para a Classe (${cleanTurma}):** ${sub.aplicacaoSubtopico}`;
    }).join('\n\n');

    return `## ${top.romano} — ${top.titulo}

${top.introducaoTopico}

**Referências Bíblicas do Tópico ${top.romano}:** ${top.referenciasTopico}
${topicVersesARC ? `\n**Sustentação Bíblica na Íntegra (${top.referenciasTopico} - ARC):**\n${topicVersesARC}\n` : ''}
${subtopicosMd}

**Síntese Teológica do Tópico ${top.romano}:** ${top.sinteseTeologica}`;
  }).join('\n\n---\n\n');

  return `# Lição ${cleanNum}: ${finalLessonTitle}

**Ficha Editorial da Revista:**
- **Título da Revista:** ${cleanRevista}
- **Subtítulo / Tema Central:** ${cleanSubtitulo || dogmatic.titulo}
- **Trimestre:** ${cleanTrimestre}
- **Turma / Classe:** ${cleanTurma}
- **Editora:** ${cleanEditora}
- **Autor / Comentarista:** ${cleanAutor}
- **Número e Título da Lição:** Lição ${cleanNum} — ${finalLessonTitle}
${dataLicao ? `- **Data da Aula:** ${dataLicao}\n` : ''}- **Harmonia Dogmática (CGADB / CPAD):** ${dogmatic.capitulo}

---

# 2. Introdução

**Texto Áureo:**
${profile.resolvedTextoAureo}

**Verdade Prática:**
${profile.resolvedVerdadePratica}

**Leitura Bíblica em Classe:**
${leituraFormatada}

**Contextualização Histórica, Bíblica e Editorial da Lição:**
${profile.contextoIntrodutorio}
${subsidiosWeb ? `\n**Subsídios Bibliográficos Complementares (${cleanEditora}):**\n${subsidiosWeb}\n` : ''}

---

# 3. Fundamentação Doutrinária

**Marco Dogmático Oficial:** ${dogmatic.capitulo} — *${dogmatic.titulo}*

${dogmatic.fundamentacao}

Na perspectiva teológica desenvolvida para a revista **"${cleanRevista}"** (${cleanEditora} • ${cleanTrimestre}), comentada por **${cleanAutor}** para a turma de **${cleanTurma}**, o tema **"${finalLessonTitle}"** estrutura a fé cristã sobre a revelação inerrante das Escrituras (**${profile.resolvedLeituraRef}**). A tradição pentecostal clássica une a exegese bíblica rigorosa ao fervor espiritual do Espírito Santo, rejeitando tanto o racionalismo frio quanto o subjetivismo sem base bíblica.

**Exegese Léxica dos Termos Bíblicos Originais:**
${dogmatic.termosOriginais}

**Referências Dogmáticas Correlatas:** ${dogmatic.versiculosBase}

---

# 4. Referências Bíblicas e Exegese dos Tópicos

${formattedTopicsMarkdown}

---

# 5. Aplicação Prática

1. **Na Vida Devocional e Espiritual do Aluno (${cleanTurma}):** Medite diariamente na passagem de **${profile.resolvedLeituraRef}** e nas referências de apoio (**${dogmatic.versiculosBase}**), guardando no coração o ensino central de *"${finalLessonTitle}"* para viver em santidade, fé e comunhão com Deus.
2. **Na Família e no Culto Doméstico:** Compartilhe no lar os princípios aprendidos nesta **Lição ${cleanNum}** da revista *"${cleanRevista}"*, edificando cônjuge, filhos e familiares sobre a Rocha inabalável da Palavra de Deus.
3. **No Ensino da Classe e na Missão da Igreja Local:** Como discípulos de Cristo e estudantes da Escola Bíblica Dominical (${cleanEditora}), sejamos proclamadores fiéis do Evangelho, aplicando a sã doutrina com amor, discernimento espiritual e poder do Espírito Santo.

---

# 6. Conclusão

Concluímos o estudo da **Lição ${cleanNum}: ${finalLessonTitle}** (Revista *"${cleanRevista}"* • ${cleanEditora} • ${cleanTrimestre}) reafirmando que a Palavra de Deus permanece viva, eficaz e soberana sobre toda a história humana. Que cada aluno e professor da turma de **${cleanTurma}** saia desta aula fortalecido na graça do Senhor Jesus, firmado na ortodoxia bíblica de **${dogmatic.capitulo}** e revestido pelo Espírito Santo para dar testemunho fiel da verdade até o glorioso dia da volta de Cristo.

---

# 7. Validação (Perguntas de Fixação)

**Questão 1:** De acordo com o estudo da **Lição ${cleanNum} ("${finalLessonTitle}")** da revista **"${cleanRevista}"** (${cleanEditora}) e a leitura bíblica em **${profile.resolvedLeituraRef}**, qual é a verdade central revelada pelas Escrituras?
*Gabarito Teológico Comentado:* A verdade central está fundamentada em **${profile.resolvedLeituraRef}** e em **${dogmatic.capitulo}** da Declaração de Fé da CGADB/CPAD: ${profile.resolvedVerdadePratica}

**Questão 2:** Como os três tópicos estudados nesta lição orientam a postura prática do cristão diante dos desafios espirituais, intelectuais e morais da atualidade?
*Gabarito Teológico Comentado:* Os três tópicos demonstram que o cristão deve conhecer profundamente as Escrituras Sagradas (Tópico I), permanecer inabalável na sã doutrina pentecostal sob a direção do Espírito Santo (Tópico II) e testemunhar a sua fé por meio de um caráter íntegro, familiar e missionário que glorifique a Cristo (Tópico III).`;
}

/**
 * Verifica se um texto de estudo existente está resumido, incompleto ou divergente dos dados da lição,
 * e garante o retorno de um material de estudo completo, profundo e 100% alinhado aos dados informados.
 */
export function ensureCompleteEBDLessonMarkdown(existingText: string, params: EBDLessonBuildParams): string {
  const raw = (existingText || '').trim();
  const hasFullSections =
    raw.length >= 3200 &&
    raw.includes('### 1.1') &&
    raw.includes('### 2.1') &&
    raw.includes('### 3.1') &&
    !raw.includes('Disponível no material de leitura recomendada da Harpa');

  if (hasFullSections) {
    // Verificar se o título da revista e o título da lição batem com o que foi informado
    const cleanRev = (params.revista || '').trim().toLowerCase();
    const cleanTit = (params.tituloLicao || '').replace(/^(?:LI[CÇ][AÃ]O\s*)?\d{1,2}\s*[-–:]\s*/i, '').trim().toLowerCase();
    const rawLower = raw.toLowerCase();
    const matchesRevista = !cleanRev || rawLower.includes(cleanRev.slice(0, 15));
    const matchesTitulo = !cleanTit || rawLower.includes(cleanTit.slice(0, 15));
    if (matchesRevista && matchesTitulo) {
      return raw;
    }
  }

  return buildCompleteEBDLessonMarkdown(params);
}
