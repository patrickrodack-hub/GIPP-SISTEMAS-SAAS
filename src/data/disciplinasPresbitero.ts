import { DisciplinaObreiro } from './ModuleFormacaoObreirosData';

export const DISCIPLINAS_PRESBITERO: DisciplinaObreiro[] = [
    // =========================================================================
    // NÍVEL 3: PRESBÍTERO (5 MÓDULOS COMPLETOS)
    // =========================================================================
    {
        id: 'pb_01',
        nivelId: 'presbitero',
        titulo: 'Módulo 1: Teontologia, Trindade & Cristologia Pentecostal',
        capituloCGADB: 'Capítulo 2 - O Único Deus Verdadeiro & Capítulo 4 - O Senhor Jesus Cristo',
        cargaHoraria: 24,
        ementa: 'A doutrina de Deus e Seus atributos incomunicáveis e comunicáveis. A unidade da Deidade em três Pessoas coeternas e consubstanciais. A deidade plena e a humanidade sem pecado de Cristo Jesus.',
        trabalhoSugerido: 'Elaborar um artigo teológico de 3 páginas refutando o unicismo moderno e o arianismo à luz dos Capítulos 2 a 5 da Declaração de Fé da CGADB.',
        licoes: [{
            id: 'lic_pb_01',
            numero: 1,
            titulo: 'O Deus Triúno e a Encarnação do Verbo Eterno',
            introducao: 'O presbítero é um supervisor doutrinário da congregação. Ele precisa dominar os fundamentos dogmáticos da fé para proteger as ovelhas contra o unicismo (Jesus Só), o liberalismo teológico e as heresias cristológicas.',
            fundamentacaoDoutrinaria: 'Segundo a Declaração de Fé da CGADB (Capítulos 2, 3, 4 e 5), há um só Deus vivo e verdadeiro que subsiste eternamente em três Pessoas distintas: o Pai, o Filho e o Espírito Santo. Jesus Cristo é 100% Deus e 100% Homem.',
            referenciasBiblicas: ['Deuteronômio 6:4', 'Mateus 28:19', 'João 1:1-14', 'Filipenses 2:5-11', 'Colossenses 2:9'],
            aplicacaoPratica: 'O presbítero deve ensinar com clareza nos púlpitos e salas de EBD a doutrina trinitária, corrigindo interpretações heréticas que reduzem a Trindade a meros "modos" de manifestação.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Monoteísmo Trinitário Bíblico',
                    conteudo: 'A Bíblia afirma com veemência que existe um só Deus (Dt 6:4 - Shema Israel). Contudo, essa unidade divina (termo hebraico echad - unidade composta) manifesta-se plenamente na comunhão eterna de três Pessoas coiguais em poder, substância e glória: o Pai não é o Filho, o Filho não é o Espírito Santo, e o Espírito Santo não é o Pai.',
                    destaqueExegese: 'Echad (אֶחָד) em Dt 6:4 indica unidade composta, contrastando com yachid (unidade absoluta solitária).',
                    pontosChave: ['Um só Deus em três Pessoas', 'Coeternidade e consubstancialidade', 'Rejeição categórica do politeísmo']
                },
                {
                    numero: 2,
                    subtitulo: '2. Refutação do Unicismo (Modalismo / Sabelianismo)',
                    conteudo: 'A heresia do unicismo afirma que Deus é uma única pessoa que trocou de máscaras ao longo da história (ora Pai, ora Filho, ora Espírito). As Escrituras refutam isso no batismo de Jesus (Mt 3:16-17), onde o Filho é batizado, o Espírito desce como pomba e o Pai brada dos céus.',
                    destaqueExegese: 'Hypostasis (ὑπόστασις): subsistência pessoal real de cada membro da Santíssima Trindade.',
                    pontosChave: ['Três pessoas distintas simultâneas', 'Oração de Jesus ao Pai no Getsêmani', 'Fórmula batismal trinitária obrigatória']
                },
                {
                    numero: 3,
                    subtitulo: '3. A Deidade Plena e Humanidade Real de Jesus',
                    conteudo: 'Jesus Cristo não foi uma criação de Deus (contra os Testemunhas de Jeová / Arianismo), mas o Deus Todo-Poderoso encarnado (Jo 1:1; Cl 2:9). Ele assumiu natureza humana sem pecado mediante o nascimento virginal (Mt 1:18-25), tornando-se o perfeito Mediador.',
                    destaqueExegese: 'Theanthropos (θεάνθρωπος): a União Hipostática onde a divindade e a humanidade coexistem sem confusão na única pessoa de Cristo.',
                    pontosChave: ['Divindade eterna e incriada', 'Nascimento virginal histórico', 'Pecaminosidade nula em Sua humanidade']
                },
                {
                    numero: 4,
                    subtitulo: '4. A Morte Vicária, Sepultamento e Ressurreição Corporal',
                    conteudo: 'Na cruz do Calvário, Cristo ofereceu um sacrifício perfeito, expiatório, propiciatório e substitutivo (Is 53; 1 Co 15:3-4). Sua ressurreição no terceiro dia foi literal e corporal, garantindo a justificação de todos os que creem.',
                    destaqueExegese: 'Hilasmos (ἱλασμός): propiciação que aplaca a justa ira de Deus contra o pecado.',
                    pontosChave: ['Substituição vicária real', 'Ressurreição física gloriosa', 'Vitória definitiva sobre a morte e o inferno']
                },
                {
                    numero: 5,
                    subtitulo: '5. A Exaltação Soberana e a Intercessão Celestial',
                    conteudo: 'Jesus subiu fisicamente aos céus e está assentado à destra da Majestade nas alturas, exercendo Seu ofício de Sumo Sacerdote e único Mediador entre Deus e os homens (1 Tm 2:5; Hb 7:25).',
                    destaqueExegese: 'Pantokrator (παντοκράτωρ): o Senhor Soberano que governa sobre todo o cosmos.',
                    pontosChave: ['Único Mediador entre Deus e os homens', 'Intercessão perpétua pelos crentes', 'Segunda Vinda iminente e pessoal']
                }
            ],
            quiz: [
                {
                    pergunta: 'Como a Declaração de Fé da CGADB define a doutrina da Trindade?',
                    opcoes: [
                        'Três deuses diferentes que competem entre si.',
                        'Um só Deus vivo e verdadeiro, que subsiste eternamente em três Pessoas coiguais e consubstanciais: Pai, Filho e Espírito Santo.',
                        'Uma única pessoa que muda de função no decorrer das eras.',
                        'Uma doutrina inventada na Idade Média sem apoio bíblico.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A CGADB confessa a ortodoxia bíblica: um único Deus em três pessoas distintas eternamente.'
                },
                {
                    pergunta: 'O que ensina a União Hipostática sobre a pessoa de Jesus Cristo?',
                    opcoes: [
                        'Que Ele era apenas um homem iluminado que virou Deus após a cruz.',
                        'A união inseparável e perfeita da divindade plena e da humanidade real em uma única Pessoa divina.',
                        'Que a divindade de Jesus anulou Seu corpo físico na terra.',
                        'Que Ele era um anjo criado antes do mundo.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A união hipostática ensina que Cristo é verdadeiramente Deus e verdadeiramente homem sem pecado.'
                }
            ]
        }]
    },
    {
        id: 'pb_02',
        nivelId: 'presbitero',
        titulo: 'Módulo 2: Pneumatologia Pentecostal & Prática dos Dons',
        capituloCGADB: 'Capítulo 6 - O Espírito Santo, Capítulo 19 - O Batismo no Espírito & Capítulo 20 - Os Dons',
        cargaHoraria: 24,
        ementa: 'A personalidade e divindade do Espírito Santo. O Batismo no Espírito Santo como experiência subsequente à conversão com a evidência inicial das línguas. A classificação e operação dos nove dons espirituais (1 Co 12).',
        trabalhoSugerido: 'Escrever uma defesa exegética da atualidade dos dons espirituais contra o cessacionismo fundamentada em Atos 2:38-39 e 1 Coríntios 12.',
        licoes: [{
            id: 'lic_pb_02',
            numero: 1,
            titulo: 'O Batismo no Espírito Santo e o Exercício Decente dos Dons',
            introducao: 'O distintivo inconfundível das Assembleias de Deus é a sua identidade pentecostal clássica. O presbítero deve ser cheio do Espírito Santo e saber conduzir o culto de modo que o fogo sagrado arda sem desordem ou fanatismo.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 6, 19 e 20), o batismo no Espírito Santo é uma dotação de poder para testemunhar, acompanhado da evidência física inicial de falar em outras línguas conforme o Espírito concede.',
            referenciasBiblicas: ['Atos 1:8', 'Atos 2:1-4', 'Atos 10:44-46', '1 Coríntios 12:4-11', '1 Coríntios 14:26-40'],
            aplicacaoPratica: 'O presbítero deve incentivar a congregação a buscar o batismo no Espírito e o batismo diário no fogo da oração, aplicando os princípios bíblicos de ordem e julgamento das profecias.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Personalidade e Divindade da Terceira Pessoa',
                    conteudo: 'O Espírito Santo não é uma força impessoal ou energia cósmica, mas uma Pessoa divina dotada de Intelecto (1 Co 2:10-11), Emoção/Sentimento (Ef 4:30) e Vontade Soberana (1 Co 12:11). Ele é adorado e glorificado juntamente com o Pai e o Filho.',
                    destaqueExegese: 'Parakletos (παράκλητος): Aquele que foi chamado para estar ao lado para consolar, defender, advogar e guiar.',
                    pontosChave: ['Personalidade divina do Espírito', 'Atributos divinos absolutos', 'Consolador perpétuo da Igreja']
                },
                {
                    numero: 2,
                    subtitulo: '2. O Batismo no Espírito Santo: Subsequência e Evidência',
                    conteudo: 'Na teologia lucana de Atos dos Apóstolos, o batismo no Espírito Santo é distinto e subsequente à regeneração (At 8:12-17; At 19:1-6). A evidência física inicial indispensável é o falar em línguas (glossolalia) nunca antes aprendidas pelo crente.',
                    destaqueExegese: 'Glossolalia (γλωσσολαλία): falar em línguas espirituais inspiradas pelo Espírito Santo.',
                    pontosChave: ['Distinto da salvação/regeneração', 'Evidência inicial: outras línguas', 'Revestimento de poder para testemunhar']
                },
                {
                    numero: 3,
                    subtitulo: '3. A Classificação dos Nove Dons Espirituais (1 Co 12)',
                    conteudo: 'Os 9 dons do Espírito dividem-se em: 1) Dons de Revelação (Palavra da Sabedoria, Palavra da Ciência, Discernimento de Espíritos); 2) Dons de Poder (Fé, Dons de Curar, Operação de Maravilhas); 3) Dons de Inspiração/Voz (Profecia, Variedade de Línguas, Interpretação de Línguas).',
                    destaqueExegese: 'Charismata (χαρίσματα): dons da graça imerecida concedidos pelo Espírito para edificação mútua.',
                    pontosChave: ['9 dons distribuídos soberanamente', 'Finalidade: edificação da igreja', 'Operação sob a direção divina']
                },
                {
                    numero: 4,
                    subtitulo: '4. Regras Bíblicas para o Julgamento da Profecia (1 Co 14)',
                    conteudo: 'Nenhuma profecia tem autoridade superior ou igual à Bíblia Sagrada. 1 Coríntios 14:29 determina: "Falem dois ou três profetas, e os outros julguem". O presbítero deve repreender meninices, profetadas humanas e manipulações emocionais.',
                    destaqueExegese: 'Diakrino (διακρίνω): examinar minuciosamente, pesar à luz das Escrituras.',
                    pontosChave: ['Toda profecia deve ser julgada pela Bíblia', 'Máximo de dois ou três no culto', 'Espíritos dos profetas sujeitos aos profetas']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese: Fogo Santo com Ordem e Decência',
                    conteudo: 'A igreja pentecostal autêntica não abre mão do fervor espiritual, mas rejeita a desordem. Quando o Espírito Santo dirige o culto, há quebrantamento, salvação de almas, curas e profunda harmonia bíblica (1 Co 14:40).',
                    destaqueExegese: 'Taxin (τάξιν): harmonia sublime que glorifica o Nome do Senhor Jesus.',
                    pontosChave: ['Culto fervoroso e bíblico', 'Rejeição ao extremismo fanático', 'Glória exclusiva ao Senhor Jesus']
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual a evidência física inicial do Batismo no Espírito Santo segundo a Declaração de Fé da CGADB?',
                    opcoes: [
                        'Apenas sentir calafrios e emoções.',
                        'O falar em outras línguas (glossolalia) conforme o Espírito Santo concede.',
                        'A aquisição instantânea de prosperidade financeira.',
                        'O recebimento de um diploma ministerial.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O pentecostalismo clássico sustenta com base em Atos 2:4, 10:46 e 19:6 que o falar em línguas é a evidência inicial.'
                },
                {
                    pergunta: 'Qual a regra bíblica expressa em 1 Coríntios 14:29 para as profecias na igreja local?',
                    opcoes: [
                        'Aceitar qualquer profecia cegamente sem questionar.',
                        'Falem dois ou três profetas, e os outros julguem/examinem à luz das Sagradas Escrituras.',
                        'Proibir qualquer manifestação espiritual.',
                        'Cobrar ingressos para reuniões proféticas.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A profecia jamais está acima da Bíblia e deve ser julgada e discernida pelos ministros e pela igreja.'
                }
            ]
        }]
    },
    {
        id: 'pb_03',
        nivelId: 'presbitero',
        titulo: 'Módulo 3: Homilética Prática & Hermenêutica Bíblica Expositiva',
        capituloCGADB: 'Capítulo 1 - As Sagradas Escrituras & Capítulo 14 - O Culto a Deus',
        cargaHoraria: 24,
        ementa: 'Princípios fundamentais de interpretação bíblica histórico-gramatical. Estrutura do sermão: tema, texto, proposição, divisões e conclusão. Pregar a Palavra com fidelidade textual e poder pentecostal.',
        trabalhoSugerido: 'Elaborar um esboço completo de sermão expositivo baseado em Romanos 8:1-4 seguindo as 5 regras de Homilética.',
        licoes: [{
            id: 'lic_pb_03',
            numero: 1,
            titulo: 'O Púlpito Santo e a Exposição Fiel das Escrituras',
            introducao: 'Pregar o Evangelho não é contar anedotas nem fazer palestras motivacionais. É proclamar a Verdade revelada de Deus de forma exegética, clara, aplicável e sob a unção do Espírito Santo.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 1 e 14), a pregação das Escrituras é o momento culminante do culto assembleiano, devendo o pregador alimentar o rebanho com doutrina pura.',
            referenciasBiblicas: ['2 Timóteo 4:1-5', 'Neemias 8:8', '1 Coríntios 2:1-5', 'Tito 2:1', 'Lucas 24:27'],
            aplicacaoPratica: 'O presbítero deve preparar seus sermões com dias de antecedência, estudando o contexto histórico, o vocabulário original e aplicando o texto aos dilemas éticos da congregação.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. Hermenêutica: O Texto em seu Contexto',
                    conteudo: 'A primeira regra de hermenêutica bíblica diz que "um texto fora de contexto torna-se um pretexto". O presbítero deve investigar o autor, a data, o destinatário, o gênero literário e o significado original antes de fazer qualquer aplicação contemporânea.',
                    destaqueExegese: 'Exegese (tirar o sentido do texto) versus Eisegese (colocar ideias humanas para dentro do texto).',
                    pontosChave: ['Lealdade ao sentido do autor bíblico', 'Contexto imediato e remoto', 'A Bíblia interpreta a própria Bíblia']
                },
                {
                    numero: 2,
                    subtitulo: '2. Os Três Tipos Clássicos de Sermão',
                    conteudo: '1) Sermão Temático (baseado em um assunto com vários textos bíblicos); 2) Sermão Textual (baseado em um versículo e suas divisões naturais); 3) Sermão Expositivo (baseado em uma perícope ou capítulo inteiro, extraindo o fio condutor da passagem). O sermão expositivo é o mais rico para amadurecer a igreja.',
                    destaqueExegese: 'Homilia (ὁμιλία): instrução familiar e pedagógica que ilumina o coração dos ouvintes.',
                    pontosChave: ['Sermão temático bem ancorado', 'Sermão textual direto', 'Sermão expositivo profundo']
                },
                {
                    numero: 3,
                    subtitulo: '3. A Estrutura Arquitetônica da Mensagem',
                    conteudo: 'Todo bom sermão possui 5 partes vitais: 1) Título atrativo; 2) Introdução engajadora; 3) Proposição central ou ideia exegética principal; 4) Divisões ou tópicos lógicos com transições suaves; 5) Conclusão com apelo prático e convite à decisão.',
                    destaqueExegese: 'Keryx (κῆρυξ): o arauto oficial que proclama com fidelidade e clareza a mensagem do Rei.',
                    pontosChave: ['Começo claro e cativante', 'Desenvolvimento lógico e bíblico', 'Aplicação direta à vida diária']
                },
                {
                    numero: 4,
                    subtitulo: '4. A Dependência da Unção do Espírito Santo',
                    conteudo: 'A erudição sem o Espírito produz secura; o fervor sem a Bíblia produz fanatismo. O presbítero precisa da síntese pentecostal: preparo intelectual profundo associado a horas de joelhos dobrados em oração.',
                    destaqueExegese: 'Apodeixis pneumatos (ἀπόδειξις πνεύματος) em 1 Co 2:4: demonstração inequívoca do Espírito e de poder.',
                    pontosChave: ['Oração incessante antes do púlpito', 'Humildade e dependência de Deus', 'Pregar para a glória de Cristo']
                },
                {
                    numero: 5,
                    subtitulo: '5. Ética no Púlpito e Uso da Voz',
                    conteudo: 'O pregador deve evitar gritos desnecessários, vulgaridades, piadas profanas, exposição indevida de irmãos ou ataques pessoais. O púlpito é sagrado e requer sobriedade, postura ereta e dicção clara.',
                    destaqueExegese: 'Hieroprepes (ἱεροπρεπής): conduta santa e decorosa condizente com as coisas sagradas de Deus.',
                    pontosChave: ['Respeito ao tempo estabelecido', 'Vocabulário limpo e edificante', 'Zelo pelo decoro e santidade do altar']
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual a diferença crucial entre Exegese e Eisegese no estudo bíblico?',
                    opcoes: [
                        'Exegese extrai o significado original do texto sagrado; Eisegese projeta no texto ideias humanas estranhas a ele.',
                        'Exegese é pregação moderna; Eisegese é leitura silenciosa.',
                        'Não há qualquer diferença.',
                        'Exegese é exclusiva para pastores presidentes.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'A exegese busca extrair o que o texto realmente diz, enquanto a eisegese insere interpretações humanas forçadas.'
                },
                {
                    pergunta: 'O que o apóstolo Paulo ordena solenemente a Timóteo em 2 Timóteo 4:2?',
                    opcoes: [
                        'Que busque riquezas e fama nos palácios.',
                        'Que pregue a Palavra, inste a tempo e fora de tempo, redargua, repreenda e exorte com toda a longanimidade e doutrina.',
                        'Que evite confrontar o pecado para não perder membros.',
                        'Que abandone o estudo das Escrituras.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A ordem apostólica é proclamar com fidelidade, insistência, paciência e solidez doutrinária a Palavra de Deus.'
                }
            ]
        }]
    },
    {
        id: 'pb_04',
        nivelId: 'presbitero',
        titulo: 'Módulo 4: Governo Eclesiástico, Disciplina Bíblica & Liderança',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus',
        cargaHoraria: 24,
        ementa: 'A estrutura administrativa das Assembleias de Deus (CGADB/CONFRADER). Processo de reconciliação e restauração segundo Mateus 18 e Gálatas 6. Condução de reuniões de obreiros.',
        trabalhoSugerido: 'Escrever um parecer fundamentado sobre a aplicação correta da disciplina bíblica visando a restauração da ovelha caída.',
        licoes: [{
            id: 'lic_pb_04',
            numero: 1,
            titulo: 'O Governo Bíblico da Igreja e a Disciplina Restauradora',
            introducao: 'A igreja de Deus é um organismo vivo e uma organização estruturada. O presbítero coopera com o pastor no governo eclesiástico e na aplicação da disciplina com amor, justiça e o alvo supremo de resgatar o pecador.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 11), a igreja adota a forma de governo pastoral-presbiterial democrática representativa, zelando pela santidade de seus membros mediante a disciplina bíblica.',
            referenciasBiblicas: ['Mateus 18:15-18', 'Gálatas 6:1-2', '1 Coríntios 5:1-13', '2 Coríntios 2:6-8', 'Hebreus 12:5-11'],
            aplicacaoPratica: 'O presbítero não deve ser um carrasco que condena nem um cúmplice que passa a mão no pecado, mas um médico espiritual que cuida da ferida para devolver o crente à plena comunhão.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Modelo de Governo Eclesiástico Assembleiano',
                    conteudo: 'Nas Assembleias de Deus, a autoridade pastoral é exercida em conjunto com o colegiado de presbíteros e a homologação da Assembleia Geral dos membros. Essa estrutura preserva a liderança espiritual e a transparência administrativa.',
                    destaqueExegese: 'Presbyteroi (πρεσβύτεροι): presbíteros que pastoreiam o rebanho com sabedoria madura.',
                    pontosChave: ['Liderança pastoral representativa', 'Colegiado de ministros', 'Assembleias regulares com atas transparentes']
                },
                {
                    numero: 2,
                    subtitulo: '2. Os Três Passos da Reconciliação em Mateus 18',
                    conteudo: 'Jesus estabeleceu o roteiro infalível: 1) Conversa particular a sós entre os ofendidos; 2) Se não houver arrependimento, levar uma ou duas testemunhas idôneas; 3) Se recusar ouvir, levar ao conhecimento do ministério e da igreja local.',
                    destaqueExegese: 'Kerdaino (κερδαίνω): "ganhaste a teu irmão", demonstrando que o objetivo é salvar a relação.',
                    pontosChave: ['Tratar a sós primeiro', 'Testemunhas sérias', 'Intervenção ministerial prudente']
                },
                {
                    numero: 3,
                    subtitulo: '3. A Natureza Terapêutica da Disciplina Eclesiástica',
                    conteudo: 'A disciplina na igreja não é vingança humana, mas remédio santo. O afastamento temporário de cargos ou da Santa Ceia visa levar o crente à reflexão, ao arrependimento genuíno e à cura espiritual (Hb 12:11).',
                    destaqueExegese: 'Paideia (παιδεία): disciplina pedagógica e formativa de um pai amoroso que corrige seus filhos.',
                    pontosChave: ['Não punição cega, mas cura', 'Preservação do testemunho da igreja', 'Amor que corrige para salvar']
                },
                {
                    numero: 4,
                    subtitulo: '4. O Ministério da Restauração (Gálatas 6:1)',
                    conteudo: 'Paulo adverte: "Irmãos, se algum homem chegar a ser surpreendido nalguma ofensa, vós, que sois espirituais, encaminhai o tal com espírito de mansidão; olhando por ti mesmo, para que não sejas também tentado".',
                    destaqueExegese: 'Katartizo (καταρτίζω): recolocar um osso quebrado no lugar com perícia médica e ternura.',
                    pontosChave: ['Restauração com espírito de mansidão', 'Vigilância contra o orgulho próprio', 'Recepção com amor e lágrimas de alegria']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese e Diretrizes para o Presbitério Local',
                    conteudo: 'O presbítero apoia o pastor nas reuniões ministeriais, guarda sigilo estrito sobre os casos tratados e zela para que nenhuma ovelha seja abandonada nos dias de tribulação.',
                    destaqueExegese: 'Episkopos (ἐπίσκοπος): supervisor vigilante que cuida da saúde integral do rebanho.',
                    pontosChave: ['Lealdade ao pastor presidente', 'Sigilo absoluto nas reuniões', 'Cuidado pastoral contínuo']
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual o objetivo supremo da disciplina bíblica na igreja local segundo Gálatas 6:1?',
                    opcoes: [
                        'Humilhar publicamente a pessoa para que todos sintam medo.',
                        'Restaurar o crente caído com espírito de mansidão e reinseri-lo na comunhão cristã.',
                        'Expulsar membros para diminuir despesas.',
                        'Transferir o crente para outra cidade.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A disciplina bíblica visa curar e restaurar a ovelha com amor e mansidão apostólica.'
                },
                {
                    pergunta: 'Qual o primeiro passo ordenado por Jesus em Mateus 18:15 quando um irmão peca contra outro?',
                    opcoes: [
                        'Publicar o erro nas redes sociais.',
                        'Ir conversar a sós com o irmão em particular para tentar reconciliação.',
                        'Levar o caso diretamente ao juiz de direito civil.',
                        'Parar de falar com a família inteira dele.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Jesus ensina que a primeira etapa é sempre o diálogo em particular e a sós.'
                }
            ]
        }]
    },
    {
        id: 'pb_05',
        nivelId: 'presbitero',
        titulo: 'Módulo 5: Aconselhamento Pastoral & Ministério da Reconciliação',
        capituloCGADB: 'Capítulo 24 - A Família & Capítulo 10 - A Salvação',
        cargaHoraria: 24,
        ementa: 'Fundamentos bíblicos do aconselhamento cristão. Atendimento a casais em crise, dependência química, depressão, luto e jovens. Princípios éticos e limites da atuação pastoral.',
        trabalhoSugerido: 'Elaborar um guia prático com 10 diretrizes éticas para sessões de aconselhamento bíblico.',
        licoes: [{
            id: 'lic_pb_05',
            numero: 1,
            titulo: 'O Obreiro como Conselheiro Bíblico e Portador da Graça',
            introducao: 'Em um mundo fragmentado por angústias emocionais e destruição familiar, o presbítero é chamado a ser um instrumento de sabedoria bíblica e bálsamo do Espírito Santo.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 10 e 24), a Palavra de Deus é suficiente para restaurar a alma e direcionar as famílias no caminho da santidade.',
            referenciasBiblicas: ['2 Coríntios 5:18-20', 'Provérbios 11:14', 'Gálatas 6:2', 'Tiago 1:19', 'Romanos 15:1-4'],
            aplicacaoPratica: 'O presbítero deve saber ouvir atentamente sem interromper, aplicar as Escrituras com ternura, orar com autoridade e encaminhar casos psiquiátricos/médicos a profissionais competentes.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Modelo Bíblico de Aconselhamento Centrado na Cruz',
                    conteudo: 'O aconselhamento bíblico não substitui as Escrituras por psicologias seculares humanistas. A Palavra de Deus é a lente pela qual diagnosticamos o coração humano, o pecado, as dores e encontramos a graça curadora de Cristo.',
                    destaqueExegese: 'Noutheteo (νουθετέω): admoestar e aconselhar fraternalmente à luz da verdade bíblica.',
                    pontosChave: ['Suficiência da Palavra de Deus', 'Diagnóstico espiritual do coração', 'Cristo como a resposta suprema']
                },
                {
                    numero: 2,
                    subtitulo: '2. A Arte de Ouvir com Empatia e Discernimento',
                    conteudo: 'Tiago 1:19 recomenda: "Todo o homem seja pronto para ouvir, tardio para falar, tardio para se irar". O conselheiro sábio ouve 70% do tempo e fala 30%, compreendendo a dor antes de emitir qualquer diagnóstico.',
                    destaqueExegese: 'Akouo (ἀκούω): escuta atenta, compassiva e atenta às entrelinhas espirituais.',
                    pontosChave: ['Ouvir sem pré-julgamentos', 'Compaixão autêntica pela dor alheia', 'Discernimento do Espírito Santo']
                },
                {
                    numero: 3,
                    subtitulo: '3. Aconselhamento de Casais e Proteção do Matrimônio',
                    conteudo: 'Ao atender casais, o presbítero deve: 1) Ouvir ambos juntos e também individualmente quando necessário; 2) Relembrar os votos da aliança matrimonial; 3) Ensinar a comunicação assertiva e o perdão mútuo; 4) Nunca atender mulheres a sós em salas fechadas.',
                    destaqueExegese: 'Syntheke (συνθήκη): a aliança sagrada e indissolúvel selada perante Deus.',
                    pontosChave: ['Aliança sagrada do casamento', 'Perdão e cura de mágoas', 'Proteção ética absoluta do ministro']
                },
                {
                    numero: 4,
                    subtitulo: '4. Encaminhamento Responsável em Casos de Saúde Mental',
                    conteudo: 'A teologia pentecostal equilibrada reconhece que o ser humano é espírito, alma e corpo (1 Ts 5:23). Transtornos como depressão grave, transtorno bipolar ou dependência química exigem oração de fé E acompanhamento médico especializado.',
                    destaqueExegese: 'Holokleros (ὁλόκληρος): o ser humano preservado são em todas as suas dimensões.',
                    pontosChave: ['Não confundir doença física com possessão', 'Incentivo ao tratamento médico correto', 'Oração perseverante por restauração']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese e Vocação Presbiterial Plena',
                    conteudo: 'O presbítero que ama as pessoas, prega a sã doutrina e cuida das famílias é um baluarte na congregação. Sua vida aponta para o Supremo Pastor, de quem receberá a imperecível coroa da glória (1 Pe 5:4).',
                    destaqueExegese: 'Amarantinos stephanos (ἀμαράντινος στέφανος): a coroa incorruptível de glória que nunca murcha.',
                    pontosChave: ['Amor incondicional pelo rebanho', 'Fidelidade até a morte', 'Galardão eterno com Cristo']
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual a regra de prudência fundamental no aconselhamento pastoral de pessoas do sexo oposto?',
                    opcoes: [
                        'Realizar encontros secretos em horários noturnos.',
                        'Nunca atender a sós em ambientes isolados, mantendo portas com visor de vidro ou a presença da esposa/obreira.',
                        'Pedir sigilo em relação à família da pessoa.',
                        'Usar mensagens privadas sem supervisão.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O obreiro prudente protege seu testemunho e seu casamento, evitando qualquer aparência do mal (1 Ts 5:22).'
                },
                {
                    pergunta: 'Como o presbítero deve agir diante de um membro com sintomas de depressão clínica profunda?',
                    opcoes: [
                        'Dizer que a depressão é falta de oração e proibir o uso de remédios.',
                        'Ministrar a Palavra e a oração da fé, incentivando e apoiando o tratamento médico e psicológico com profissionais adequados.',
                        'Afastar a pessoa imediatamente de todos os cultos.',
                        'Ignorar a situação por não ser problema da igreja.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O cuidado integral abrange a dimensão espiritual (oração/Palavra) e o suporte médico da saúde física e emocional.'
                }
            ]
        }]
    }
];
