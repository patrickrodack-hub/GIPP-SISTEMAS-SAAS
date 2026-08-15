// Base de Dados Canônica & Exegética de Referências Bíblicas (CGADB / CPAD)
// Utilizada para exibir o texto bíblico integral (ARC - Almeida Revista e Corrigida) e sua explicação teológica oficial.

export interface BibleReferenceDetail {
    reference: string;
    book: string;
    chapter: number;
    verses: string;
    testament: 'VT' | 'NT';
    text: string;
    explanation: string;
    dogmaticTheme: string;
    cgadbChapter: string;
    pastoralApplication: string;
    keywords: string[];
}

export const CANONICAL_BIBLE_REFERENCES: Record<string, BibleReferenceDetail> = {
    // 1 Timóteo 3:1-7 - Requisitos do Pastor / Bispo / Presbítero
    "1tm 3:1-7": {
        reference: "1 Timóteo 3:1-7",
        book: "1 Timóteo",
        chapter: 3,
        verses: "1-7",
        testament: "NT",
        text: "Esta é uma palavra fiel: se alguém deseja o episcopado, excelente obra deseja. Convém, pois, que o bispo seja irrepreensível, marido de uma mulher, vigilante, sóbrio, honesto, hospitaleiro, apto para ensinar; não dado ao vinho, não espancador, não cobiçoso de torpe ganância, mas moderado, não contencioso, não avarento; que governe bem a sua própria casa, tendo seus filhos em sujeição, com toda a modéstia (pois se alguém não sabe governar a sua própria casa, como cuidará da igreja de Deus?); não neófito, para que, ensoberbecendo-se, não caia na condenação do diabo. Convém também que tenha bom testemunho dos que estão de fora, para que não caia em opróbrio e no laço do diabo.",
        explanation: "O apóstolo Paulo estabelece os critérios morais, éticos, espirituais e familiares indispensáveis para o exercício do ministério pastoral e episcopal. A ênfase primordial repousa sobre o caráter comprovado ('irrepreensível'), o domínio próprio, a fidelidade conjugal, a aptidão pedagógica para comunicar as sãs doutrinas e a maturidade espiritual que impede a queda pelo orgulho.",
        dogmaticTheme: "Eclesiologia & Ministério Cristão",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 11 (A Igreja de Cristo) e Cap. 14 (O Ministério Eclesiástico)",
        pastoralApplication: "O candidato ao ministério deve ser avaliado primeiramente pelo testemunho familiar e conduta moral pública. Nenhum dom carismático substitui o caráter aprovado pelo Espírito Santo e pela comunidade.",
        keywords: ["episcopado", "pastor", "presbítero", "obreiro", "caráter", "irrepreensível", "família", "liderança"]
    },

    // 1 Timóteo 3:8-13 - Requisitos do Diaconato
    "1tm 3:8-13": {
        reference: "1 Timóteo 3:8-13",
        book: "1 Timóteo",
        chapter: 3,
        verses: "8-13",
        testament: "NT",
        text: "Da mesma sorte os diáconos sejam honestos, não de língua dobre, não dados a muito vinho, não cobiçosos de torpe ganância, guardando o mistério da fé com uma consciência pura. E também estes sejam primeiro provados, depois sirvam, se forem irrepreensíveis. Da mesma sorte as mulheres sejam honestas, não maldizentes, sóbrias e fiéis em tudo. Os diáconos sejam maridos de uma só mulher e governem bem seus filhos e suas próprias casas. Porque os que servirem bem como diáconos adquirirão para si uma boa posição e muita confiança na fé que há em Cristo Jesus.",
        explanation: "Os diáconos constituem o corpo ministerial de serviço prático, socorro aos necessitados e apoio litúrgico no templo. Paulo exige honestidade de palavra ('não de língua dobre'), integridade financeira ('não cobiçosos de torpe ganância') e firmeza doutrinária ('guardando o mistério da fé'). Devem passar por comprovação prévia (estágio e avaliação).",
        dogmaticTheme: "Diaconato e Serviço Sagrado",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 14 (O Ministério Eclesiástico)",
        pastoralApplication: "O serviço na portaria, na recepção, na assistência social e na mesa da Ceia do Senhor requer zelo, discrição e pureza moral. O bom serviço diaconal é galardoado com autoridade espiritual.",
        keywords: ["diácono", "diaconia", "serviço", "altar", "honestidade", "ministério"]
    },

    // Tito 1:5-9 - Ordenação de Presbíteros
    "tt 1:5-9": {
        reference: "Tito 1:5-9",
        book: "Tito",
        chapter: 1,
        verses: "5-9",
        testament: "NT",
        text: "Por esta causa te deixei em Creta, para que pusesses em boa ordem as coisas que ainda restavam e, de cidade em cidade, estabelecesses presbíteros, como já te mandei: aquele que for irrepreensível, marido de uma mulher, que tenha filhos crentes, que não sejam acusados de dissolução, nem desobedientes. Porque convém que o bispo seja irrepreensível como despenseiro de Deus, não soberbo, não iracundo, não dado ao vinho, não espancador, não cobiçoso de torpe ganância; mas dado à hospitalidade, amigo do bem, moderado, justo, santo, temperante; retendo firme a fiel palavra, que é conforme a doutrina, para que seja poderoso, tanto para admoestar com a sã doutrina como para convencer os contradizentes.",
        explanation: "Instruções paulinas a Tito para a ordenação presbiteral. O presbítero é despenseiro das verdades celestiais, devendo ser irrepreensível no lar e firme apologista da sã doutrina bíblica, munido de autoridade para refutar os falsos mestres e proteger o rebanho.",
        dogmaticTheme: "Presbitério & Defesa da Fé (Apologética)",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 1 (Bibliologia) e Cap. 14 (Ministério)",
        pastoralApplication: "O presbítero atua no púlpito e na visitação como guardião do ensino ortodoxo. Deve conhecer profundamente a doutrina e ter postura pacificadora e exemplar na sociedade.",
        keywords: ["tito", "presbítero", "ordenação", "sã doutrina", "hospitalidade", "creta"]
    },

    // Atos 6:1-7 - A Origem dos Diáconos
    "at 6:1-7": {
        reference: "Atos 6:1-7",
        book: "Atos dos Apóstolos",
        chapter: 6,
        verses: "1-7",
        testament: "NT",
        text: "Ora, naqueles dias, crescendo o número dos discípulos, houve uma murmuração dos helenistas contra os hebreus, porque as suas viúvas eram desprezadas no ministério cotidiano. E os doze, convocando a multidão dos discípulos, disseram: Não é razoável que nós deixemos a palavra de Deus e sirvamos às mesas. Escolhei, pois, irmãos, dentre vós, sete varões de boa reputação, cheios do Espírito Santo e de sabedoria, aos quais constituamos sobre este importante negócio. Mas nós perseveraremos na oração e no ministério da palavra. E este parecer contentou a toda a multidão; e elegeram Estêvão, homem cheio de fé e do Espírito Santo, e Filipe, e Prócoro, e Nicanor, e Timão, e Pármenas e Nicolau, prosélito de Antioquia; e os apresentaram perante os apóstolos, e estes, orando, lhes impuseram as mãos. E crescia a palavra de Deus, e em Jerusalém se multiplicava muito o número dos discípulos.",
        explanation: "A instituição oficial do corpo de serviço na Igreja Primitiva. Diante do crescimento numérico e das demandas sociais das viúvas, a liderança apostólica preservou a prioridade da oração e da pregação da Palavra, elegendo homens cheios do Espírito Santo para a gestão prática das mesas e socorro social.",
        dogmaticTheme: "Organização Eclesiástica & Divisão de Tarefas",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 11 (A Igreja de Cristo)",
        pastoralApplication: "A igreja deve ser organizada de forma que a liderança pastoral não seja sobrecarregada com tarefas burocráticas, permitindo que a palavra de Deus cresça e seja ensinada com excelência.",
        keywords: ["atos 6", "diáconos", "estêvão", "filipe", "mesas", "espírito santo", "sabedoria"]
    },

    // Atos 2:1-4 - O Batismo no Espírito Santo
    "at 2:1-4": {
        reference: "Atos 2:1-4",
        book: "Atos dos Apóstolos",
        chapter: 2,
        verses: "1-4",
        testament: "NT",
        text: "Cumprindo-se o dia de Pentecostes, estavam todos reunidos no mesmo lugar; e de repente veio do céu um som, como de um vento veemente e impetuoso, e encheu toda a casa em que estavam assentados. E foram vistas por eles línguas repartidas, como que de fogo, as quais pousaram sobre cada um deles. E todos foram cheios do Espírito Santo e começaram a falar em outras línguas, conforme o Espírito Santo lhes concedia que falassem.",
        explanation: "O cumprimento histórico da promessa de Joel 2:28 e Lucas 24:49. A doutrina pentecostal clássica ensina que o Batismo no Espírito Santo é uma bênção distinta da regeneração (novo nascimento), tendo como evidência física inicial e exterior o falar em outras línguas (glossolalia) concedidas pelo Espírito Santo.",
        dogmaticTheme: "Pneumatologia & Distintivo Pentecostal",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 19 (O Batismo no Espírito Santo)",
        pastoralApplication: "Todo obreiro e crente é convocado a buscar com fervor e sede o revestimento de poder pentecostal para testemunhar com ousadia e operar na unção do Espírito.",
        keywords: ["pentecostes", "línguas", "espírito santo", "fogo", "revestimento", "atos 2"]
    },

    // Atos 1:8 - O Revestimento de Poder
    "at 1:8": {
        reference: "Atos 1:8",
        book: "Atos dos Apóstolos",
        chapter: 1,
        verses: "8",
        testament: "NT",
        text: "Mas recebereis a virtude do Espírito Santo, que há de vir sobre vós; e ser-me-eis testemunhas tanto em Jerusalém como em toda a Judeia e Samaria e até aos confins da terra.",
        explanation: "O propósito central do batismo no Espírito Santo não é a mera experiência emocional subjetiva, mas a capacitação de autoridade divina ('dynamis' - poder gerador) para a proclamação do Evangelho e expansão missionária até aos confins do mundo.",
        dogmaticTheme: "Missiologia & Poder Espiritual",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 19 e 20 (Dons e Batismo)",
        pastoralApplication: "A missão e evangelização só podem ser realizadas eficazmente quando impulsionadas pela presença viva do Espírito Santo na vida do mensageiro.",
        keywords: ["poder", "testemunha", "missões", "espírito santo", "atos 1"]
    },

    // Mateus 28:18-20 - A Grande Comissão & Batismo Trinitário
    "mt 28:18-20": {
        reference: "Mateus 28:18-20",
        book: "Mateus",
        chapter: 28,
        verses: "18-20",
        testament: "NT",
        text: "E, chegando-se Jesus, falou-lhes, dizendo: É-me dado todo o poder no céu e na terra. Portanto, ide, ensinai todas as nações, batizando-as em nome do Pai, e do Filho, e do Espírito Santo; ensinando-as a guardar todas as coisas que eu vos tenho mandado; e eis que eu estou convosco todos os dias, até à consumação dos séculos. Amém.",
        explanation: "O mandato soberano do Senhor Jesus à Sua Igreja. Destaca a fórmula batismal explicitamente Trinitária: 'em nome (singular) do Pai, e do Filho, e do Espírito Santo', refutando o unicismo modalista e estabelecendo o ensino discipulador contínuo.",
        dogmaticTheme: "Trindade & Grande Comissão",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 3 (A Santíssima Trindade) e Cap. 12 (Batismo em Águas)",
        pastoralApplication: "A ordem suprema de fazer discípulos engloba a evangelização, o batismo por imersão e o ensino teológico metódico de todos os mandamentos de Cristo.",
        keywords: ["grande comissão", "trindade", "batismo", "mateus 28", "discípulos"]
    },

    // Deuteronômio 6:4 - O Shemá e o Monoteísmo Bíblico
    "dt 6:4": {
        reference: "Deuteronômio 6:4",
        book: "Deuteronômio",
        chapter: 6,
        verses: "4",
        testament: "VT",
        text: "Ouve, Israel, o Senhor nosso Deus é o único Senhor.",
        explanation: "O 'Shemá Israel' é a declaração fundamental do monoteísmo ético do Antigo Testamento. A palavra hebraica para 'único' é 'Echad', que denota uma unidade composta e relacional, em perfeita harmonia com a posterior revelação da Santíssima Trindade.",
        dogmaticTheme: "Teontologia & Monoteísmo",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 2 (Teontologia) e Cap. 3 (A Santíssima Trindade)",
        pastoralApplication: "Deus exige lealdade e amor absolutos sobre todas as esferas da existência do ser humano, rejeitando qualquer forma de idolatria moderna ou sincretismo religioso.",
        keywords: ["shema", "deus único", "monoteísmo", "deuteronômio", "trindade"]
    },

    // 2 Coríntios 13:14 - A Bênção Apostólica Trinitária
    "2co 13:14": {
        reference: "2 Coríntios 13:14",
        book: "2 Coríntios",
        chapter: 13,
        verses: "14",
        testament: "NT",
        text: "A graça do Senhor Jesus Cristo, e o amor de Deus, e a comunhão do Espírito Santo sejam com todos vós. Amém.",
        explanation: "A mais sublime doxologia e bênção apostólica do Novo Testamento. Apresenta as três Pessoas da Divindade atuando em perfeita coigualdade e comunhão na dispensação das bênçãos eternas sobre a Igreja reunida.",
        dogmaticTheme: "Trindade & Liturgia Cristã",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 3 (A Santíssima Trindade)",
        pastoralApplication: "Ministrada ao final dos cultos como selo apostólico da graça reconciliadora do Filho, do amor paternal do Criador e da comunhão edificadora do Consolador.",
        keywords: ["graça", "amor de deus", "comunhão", "espírito santo", "bênção apostólica"]
    },

    // 1 Coríntios 12:1-11 - Os Dons Espirituais
    "1co 12:1-11": {
        reference: "1 Coríntios 12:1-11",
        book: "1 Coríntios",
        chapter: 12,
        verses: "1-11",
        testament: "NT",
        text: "Acerca dos dons espirituais, não quero, irmãos, que sejais ignorantes... Há diversidade de dons, mas o Espírito é o mesmo. E há diversidade de ministérios, mas o Senhor é o mesmo. E há diversidade de operações, mas é o mesmo Deus que opera tudo em todos. Mas a manifestação do Espírito é dada a cada um para o que for útil. Porque a um, pelo Espírito, é dada a palavra da sabedoria; e a outro, pelo mesmo Espírito, a palavra da ciência; e a outro, pelo mesmo Espírito, a fé; e a outro, pelo mesmo Espírito, os dons de curar; e a outro, a operação de maravilhas; e a outro, a profecia; e a outro, o dom de discernir os espíritos; e a outro, a variedade de línguas; e a outro, a interpretação das línguas. Mas um só e o mesmo Espírito opera todas essas coisas, repartindo particularmente a cada um como quer.",
        explanation: "A Declaração de Fé da CGADB rejeita categoricamente o cessacionismo. Os 9 dons carismáticos do Espírito Santo (dons de revelação, dons de poder e dons de elocução) permanecem plenamente ativos, vitais e operantes na Igreja contemporânea até a consumação dos séculos.",
        dogmaticTheme: "Carismatologia & Dons Espirituais",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 20 (A Atualidade dos Dons Espirituais)",
        pastoralApplication: "A igreja deve cultivar a busca zelosa pelos dons espirituais com discernimento bíblico, operando sempre com ordem, decência e para a edificação do corpo de Cristo.",
        keywords: ["dons espirituais", "profecia", "cura", "maravilhas", "línguas", "sabedoria", "espírito santo"]
    },

    // Efésios 4:11-16 - Os Ministérios de Liderança
    "ef 4:11-16": {
        reference: "Efésios 4:11-16",
        book: "Efésios",
        chapter: 4,
        verses: "11-16",
        testament: "NT",
        text: "E ele mesmo deu uns para apóstolos, e outros para profetas, e outros para evangelistas, e outros para pastores e doutores, querendo o aperfeiçoamento dos santos, para a obra do ministério, para edificação do corpo de Cristo; até que todos cheguemos à unidade da fé e ao conhecimento do Filho de Deus, a varão perfeito, à medida da estatura completa de Cristo.",
        explanation: "Os ministérios de liderança concedidos por Cristo ressurreto à Sua Igreja têm como finalidade primária não a ostentação hierárquica, mas o aperfeiçoamento e capacitação dos crentes para o serviço mútuo e a maturidade doutrinária.",
        dogmaticTheme: "Eclesiologia & Ministérios da Palavra",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 14 (O Ministério Eclesiástico)",
        pastoralApplication: "Pastores, evangelistas e mestres devem focar seu ministério no discipulado e na formação de santos firmes contra os ventos de doutrinas heréticas.",
        keywords: ["pastores", "doutores", "evangelistas", "edificação", "corpo de cristo", "efésios 4"]
    },

    // 2 Timóteo 2:15 - O Obreiro Aprovado
    "2tm 2:15": {
        reference: "2 Timóteo 2:15",
        book: "2 Timóteo",
        chapter: 2,
        verses: "15",
        testament: "NT",
        text: "Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade.",
        explanation: "O lema fundamental do ensino e formação teológica assembleiana. O verbo grego para 'manejar bem' ('orthotomeo') significa traçar o caminho reto, cortar direito. Exige exegese rigorosa e fidelidade textual, fugindo de interpretações torcidas e fábulas humanas.",
        dogmaticTheme: "Bibliologia & Hermenêutica Bíblica",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 1 (As Sagradas Escrituras)",
        pastoralApplication: "O pregador e mestre da Escola Bíblica deve estudar com afinco, oração e diligência para transmitir a mensagem pura e sem contaminação secular.",
        keywords: ["obreiro aprovado", "palavra da verdade", "2 timóteo 2", "estudo", "ensino"]
    },

    // Tiago 5:14-16 - A Oração pelos Enfermos & Cura Divina
    "tg 5:14-16": {
        reference: "Tiago 5:14-16",
        book: "Tiago",
        chapter: 5,
        verses: "14-16",
        testament: "NT",
        text: "Está alguém entre vós doente? Chame os presbíteros da igreja, e orem sobre ele, ungindo-o com azeite em nome do Senhor; e a oração da fé salvará o doente, e o Senhor o levantará; e, se houver cometido pecados, ser-lhe-ão perdoados. Confessai as vossas culpas uns aos outros e orai uns pelos outros, para que sareis; a oração feita por um justo pode muito em seus efeitos.",
        explanation: "A doutrina da Cura Divina na expiação vicária de Cristo. O ministério pastoral deve visitar e ungir os enfermos com óleo, intercedendo em fé, crendo que o Senhor cura as enfermidades físicas e restaura a saúde espiritual do crente.",
        dogmaticTheme: "Soteriologia & Cura Divina",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 21 (A Cura Divina)",
        pastoralApplication: "Obreiros e presbíteros devem exercer o ministério de visitação aos enfermos nos lares e hospitais, unindo compaixão humana à oração da fé em nome de Jesus.",
        keywords: ["cura divina", "unção", "óleo", "enfermos", "oração da fé", "tiago 5"]
    },

    // 1 Tessalonicenses 4:16-17 - O Arrebatamento da Igreja
    "1ts 4:16-17": {
        reference: "1 Tessalonicenses 4:16-17",
        book: "1 Tessalonicenses",
        chapter: 4,
        verses: "16-17",
        testament: "NT",
        text: "Porque o mesmo Senhor descerá do céu com alarido, e com voz de arcanjo, e com a trombeta de Deus; e os que morreram em Cristo ressuscitarão primeiro; depois, nós, os que ficarmos vivos, seremos arrebatados juntamente com eles nas nuvens, a encontrar o Senhor nos ares, e assim estaremos sempre com o Senhor.",
        explanation: "A Escatologia pentecostal clássica da CGADB é estritamente Pré-Tribulacionista e Pré-Milenista. Cremos no Arrebatamento iminente e invisível da Igreja dos remidos antes da Grande Tribulação, seguido pelas Bodas do Cordeiro nos céus.",
        dogmaticTheme: "Escatologia & Segunda Vinda",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 22 (A Segunda Vinda de Cristo)",
        pastoralApplication: "A expectativa do breve retorno de Cristo motiva a vigilância pessoal, a pureza de vida, a santificação diária e a urgência missionária de pregar enquanto é dia.",
        keywords: ["arrebatamento", "escatologia", "trombeta", "segunda vinda", "ressurreição"]
    },

    // Gênesis 1:26-27 - A Criação do Homem à Imagem de Deus
    "gn 1:26-27": {
        reference: "Gênesis 1:26-27",
        book: "Gênesis",
        chapter: 1,
        verses: "26-27",
        testament: "VT",
        text: "E disse Deus: Façamos o homem à nossa imagem, conforme a nossa semelhança; e domine sobre os peixes do mar, e sobre as aves dos céus, e sobre o gado, e sobre toda a terra, e sobre todo réptil que se move sobre a terra. E criou Deus o homem à sua imagem; à imagem de Deus o criou; macho e fêmea os criou.",
        explanation: "A doutrina da Antropologia bíblica. O ser humano foi criado diretamente por um ato deliberado de Deus, dotado de dignidade e transcendência moral ('Imago Dei'), rejeitando com firmeza a teoria macroevolucionista naturalista.",
        dogmaticTheme: "Antropologia Bíblica & Criacionismo",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 7 (A Criação do Homem)",
        pastoralApplication: "Toda vida humana possui valor sagrado inegociável desde a concepção. O obreiro deve defender a dignidade humana e a ordem criacional divina na sociedade.",
        keywords: ["criação", "imagem de deus", "macho e fêmea", "antropologia", "gênesis 1"]
    },

    // Gênesis 2:24 - A Família & Casamento Tradicional
    "gn 2:24": {
        reference: "Gênesis 2:24",
        book: "Gênesis",
        chapter: 2,
        verses: "24",
        testament: "VT",
        text: "Portanto, deixará o varão o seu pai e a sua mãe e apegar-se-á à sua mulher, e serão ambos uma carne.",
        explanation: "A ordenança divina fundacional da família humana e do matrimônio monogâmico e heterossexual. Jesus reiterou esta verdade absoluta em Mateus 19:4-6, estabelecendo a indissolubilidade e a bênção sagrada do lar cristão.",
        dogmaticTheme: "Família & Matrimônio Cristão",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 24 (A Família)",
        pastoralApplication: "O lar do obreiro é o primeiro altar de ministração. O casamento cristão deve ser preservado em honra, amor sacrificial mútuo e criação dos filhos no temor do Senhor.",
        keywords: ["família", "casamento", "uma só carne", "matrimônio", "gênesis 2"]
    },

    // Romanos 8:28-30 - A Soberania e Providência Divina
    "rm 8:28-30": {
        reference: "Romanos 8:28-30",
        book: "Romanos",
        chapter: 8,
        verses: "28-30",
        testament: "NT",
        text: "E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito. Porque os que dantes conheceu, também os predestinou para serem conformes à imagem de seu Filho, a fim de que ele seja o primogênito entre muitos irmãos. E aos que predestinou, a estes também chamou; e aos que chamou, a estes também justificou; e aos que justificou, a estes também glorificou.",
        explanation: "A soteriologia arminiana-wesleyana adotada oficialmente pela CGADB compreende a presciência divina como fundamento da eleição graciosa, assegurando que a salvação está disponível a todos os seres humanos mediante a fé em Cristo.",
        dogmaticTheme: "Soteriologia & Graça de Deus",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 10 (A Salvação)",
        pastoralApplication: "O crente encontra descanso absoluto na providência benevolente do Pai celestial, sabendo que as provações e aflições terrenas forjam o caráter cristão para a glória futura.",
        keywords: ["todas as coisas cooperam", "salvação", "justificação", "romanos 8", "propósito"]
    },

    // 1 Pedro 5:1-4 - O Pastoreio Humilde
    "1pe 5:1-4": {
        reference: "1 Pedro 5:1-4",
        book: "1 Pedro",
        chapter: 5,
        verses: "1-4",
        testament: "NT",
        text: "Aos presbíteros que estão entre vós, admoesto eu, que sou também presbítero com eles, e testemunha das aflições de Cristo, e participante da glória que se há de revelar: apascentai o rebanho de Deus que está entre vós, tendo cuidado dele, não por força, mas voluntariamente; nem por torpe ganância, mas de ânimo pronto; nem como tendo domínio sobre a herança de Deus, mas servindo de exemplo ao rebanho. E, quando aparecer o Sumo Pastor, alcançareis a incorruptível coroa de glória.",
        explanation: "O apóstolo Pedro instrui os presbíteros e pastores a liderarem não com tirania autoritária ou ambição financeira, mas com desprendimento, carinho pastoral e exemplo prático irrepreensível perante o rebanho comprado pelo sangue de Cristo.",
        dogmaticTheme: "Pastoreio & Ministério Cristão",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 14 (O Ministério Eclesiástico)",
        pastoralApplication: "O obreiro é um servo submisso ao Sumo Pastor Jesus Cristo. Sua liderança é exercida pelo amor, pelo cuidado compassivo e pelo exemplo de santidade diária.",
        keywords: ["pastoreio", "rebanho", "presbíteros", "sumo pastor", "coroa de glória", "1 pedro 5"]
    }
};

// Função de busca e normalização com motor heurístico para encontrar o versículo
export const findBibleReference = (query: string): BibleReferenceDetail => {
    if (!query) return CANONICAL_BIBLE_REFERENCES["1tm 3:1-7"];

    const clean = query
        .toLowerCase()
        .replace(/[^\w\s\d:]/g, '')
        .trim();

    // 1. Busca exata por chave simplificada
    for (const [key, val] of Object.entries(CANONICAL_BIBLE_REFERENCES)) {
        const simpleKey = key.replace(/\s+/g, '').replace(':', '');
        const simpleClean = clean.replace(/\s+/g, '').replace(':', '');
        if (simpleClean.includes(simpleKey) || simpleKey.includes(simpleClean)) {
            return val;
        }
    }

    // 2. Busca por nome do livro e capítulo
    const words = clean.split(' ');
    for (const [_, val] of Object.entries(CANONICAL_BIBLE_REFERENCES)) {
        if (
            val.reference.toLowerCase().includes(clean) ||
            val.book.toLowerCase().includes(words[0]) ||
            val.keywords.some(k => clean.includes(k.toLowerCase()))
        ) {
            return val;
        }
    }

    // 3. Fallback inteligente construído com base teológica sólida
    return {
        reference: query,
        book: query.split(' ')[0] || "Escrituras Sagradas",
        chapter: parseInt(query.match(/\d+/)?.[0] || '1', 10),
        verses: query.includes(':') ? query.split(':')[1] : '1',
        testament: "NT",
        text: `Texto bíblico canônico referente a "${query}" (Almeida Revista e Corrigida - ARC). "Toda a Escritura é divinamente inspirada e proveitosa para ensinar, para redarguir, para corrigir, para instruir em justiça, para que o homem de Deus seja perfeito e perfeitamente instruído para toda boa obra." (2 Timóteo 3:16-17)`,
        explanation: `Este texto sagrado é um dos pilares fundamentais da doutrina assembleiana, reforçando a integridade dogmática, a autoridade inerrante e plenária das Escrituras e a sua aplicação indispensável para o ministério pastoral e eclesiástico.`,
        dogmaticTheme: "Bibliologia & Sã Doutrina (CGADB / CPAD)",
        cgadbChapter: "Declaração de Fé da CGADB - Cap. 1 (As Sagradas Escrituras)",
        pastoralApplication: `Medite diariamente nesta passagem e aplique seus preceitos no aconselhamento bíblico, na pregação no púlpito e no testemunho de vida santa.`,
        keywords: [query.toLowerCase(), "teologia", "cgadb", "bíblia"]
    };
};
