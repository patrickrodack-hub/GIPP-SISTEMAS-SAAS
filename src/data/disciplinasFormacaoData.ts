import { DisciplinaObreiro } from './ModuleFormacaoObreirosData';

export const DISCIPLINAS_CURRICULARES: DisciplinaObreiro[] = [
    // =========================================================================
    // NÍVEL 1: AUXILIAR DE TRABALHO (5 MÓDULOS DE ALTA DENSIDADE TEOLÓGICA)
    // Alinhamento: Declaração de Fé CGADB/CPAD & Livro "Obreiro de Valor" (Pr. Abrahão Cipriano)
    // =========================================================================
    {
        id: 'aux_01',
        nivelId: 'auxiliar',
        titulo: 'Módulo 1: Fundamentos da Bibliologia, Vocação & O Obreiro Aprovado',
        capituloCGADB: 'Capítulo 1 - As Sagradas Escrituras & Princípios de "Obreiro de Valor" (Abrahão Cipriano)',
        cargaHoraria: 16,
        ementa: 'A doutrina da inspiração verbal e plenária das Sagradas Escrituras. A inerrância, infalibilidade, suficiência e autoridade do cânon bíblico de 66 livros. A distinção entre vocação divina soberana e ocupação humana voluntária. O perfil bíblico do obreiro aprovado perante Deus e a igreja local segundo 2 Timóteo 2:15 e os ensinamentos de Abrahão Cipriano sobre o valor do ministério consagrado.',
        trabalhoSugerido: 'Elaborar uma resenha crítica e teológica de 3 páginas confrontando a autoridade inerrante da Bíblia (CGADB Cap. 1) com o conceito de "Obreiro Aprovado que não tem de que se envergonhar", fundamentado na obra "Obreiro de Valor" do Pr. Abrahão Cipriano.',
        licoes: [{
            id: 'lic_aux_01',
            numero: 1,
            titulo: 'A Autoridade Suprema das Escrituras, a Chamada Divina e o Zelo do Auxiliar',
            introducao: 'O ministério cristão no ambiente pentecostal assembleiano fundamenta-se na convicção inegociável de que a Bíblia Sagrada é a inspirada, inerrante e infalível Palavra de Deus. Nenhum obreiro pode servir com eficácia se não submeter sua mente, conduta, vida íntima e prática litúrgica à autoridade soberana das Escrituras. Como destaca o Pr. Abrahão Cipriano em "Obreiro de Valor", o verdadeiro obreiro não busca honrarias humanas nem exerce o ministério como mera profissão terrena, mas compreende que o serviço na Casa de Deus é fruto de uma vocação santa e celestial que exige consagração incondicional e reverência absoluta.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé das Assembleias de Deus (CGADB/CPAD, Capítulo 1), cremos na inspiração verbal e plenária de toda a Bíblia Canônica composta por 66 livros (39 do Antigo e 27 do Novo Testamento), sendo ela a única regra infalível de fé normativa e prática para a vida e o ministério. Em consonância com a obra "Obreiro de Valor", o obreiro aprovado tem sua vida moldada pelo Texto Sagrado, agindo com fidelidade inabalável e temor reverente diante do Altar.',
            referenciasBiblicas: ['2 Timóteo 3:16-17', '2 Pedro 1:20-21', 'Salmo 119:105', '2 Timóteo 2:15', 'Josué 1:8', '1 Coríntios 4:1-2', 'Isaías 6:1-8'],
            aplicacaoPratica: 'O Auxiliar de Trabalho deve estabelecer uma rotina diária e inegociável de leitura bíblica metódica, oração e meditação devocional. Antes de abrir as portas do templo, organizar as fileiras de cadeiras ou recepcionar o povo de Deus, o auxiliar deve alimentar seu espírito na fonte das Escrituras, exercendo seu papel com mansidão, pontualidade britânica e discrição exemplar.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Inspiração Verbal e Plenária e o Fundamento da Fé Pentecostal',
                    conteudo: `A doutrina da inspiração bíblica constitui o alicerce inabalável de toda a teologia assembleiana. A Declaração de Fé da CGADB afirma categoricamente que o Espírito Santo capacitou, guiou e moveu os homens santos de Deus (2 Pe 1:21) de tal maneira que as próprias palavras registradas nos autógrafos originais expressam com perfeição exata a mente divina.

O conceito "verbal" assegura que a inspiração não se limitou a conceitos gerais, intuições poéticas ou sentimentos humanos, mas alcançou a própria escolha lexical do texto bíblico. Já o termo "plenária" atesta a inspiração total e igualitária de todas as porções da Escritura — do Gênesis ao Apocalipse —, rejeitando qualquer gradação arbitrária que considere certos trechos mais divinos do que outros.

Em sua clássica obra "Obreiro de Valor", o pastor Abrahão Cipriano enfatiza que o obreiro que despreza o estudo minucioso e o temor das Escrituras está desqualificado para servir no Altar. O obreiro pentecostal não se apoia em achismos, especulações vazias ou filosofias seculares, mas em um "Assim diz o Senhor" vivo, eterno e transformador.`,
                    destaqueExegese: 'Theopneustos (θεόπνευστος) em 2 Timóteo 3:16: literalmente "soprado por Deus". A Escritura é a própria respiração divina registrada para a redenção, instrução e santificação do homem.',
                    pontosChave: [
                        'Inspiração verbal e plenária em toda a extensão do cânon bíblico',
                        'Inerrância total nos manuscritos originais e autoridade normativa absoluta',
                        'Rejeição irrevogável do liberalismo teológico e do relativismo pós-moderno',
                        'O obreiro de valor como proclamador e guardião da Palavra Viva'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. A Inerrância, a Suficiência e o Cânon Bíblico dos 66 Livros',
                    conteudo: `A Declaração de Fé da CGADB rejeita enfaticamente toda teoria de inerrância parcial ou funcional que sugira que a Bíblia possa conter equívocos históricos ou científicos. As Escrituras Sagradas são inteiramente verdadeiras em tudo aquilo que afirmam e ensinam.

O cânon adotado pelas Assembleias de Deus é estritamente constituído pelos 66 livros canônicos inspirados pelo Espírito Santo. Rejeita-se com veemência a inclusão dos livros apócrifos (adotados pelo Concílio de Trento em 1546), por não possuírem inspiração divina, apresentarem erros doutrinários flagrantes (como a oração pelos mortos e a justificação pelas obras) e jamais terem sido citados por Jesus Cristo ou pelos apóstolos como Escritura inspirada.

Como ensina o Pr. Abrahão Cipriano em "Obreiro de Valor", a suficiência das Escrituras ensina ao obreiro que tudo o que a Igreja necessita para a salvação, comunhão, liturgia, governo e santificação já foi plenamente revelado na Palavra. Nenhuma profecia contemporânea, revelação pessoal ou tradição eclesiástica pode acrescentar, modificar ou sobrepor-se ao texto bíblico estabelecido.`,
                    destaqueExegese: 'Luthenai (λυθῆναι) em João 10:35: o Senhor Jesus assevera categoricamente que "a Escritura não pode ser anulada, rompida ou violada". Sua autoridade é perpétua e irrevogável.',
                    pontosChave: [
                        '66 Livros Canônicos: 39 no Antigo Testamento e 27 no Novo Testamento',
                        'Rejeição bíblica e histórica dos livros e adições apócrifas',
                        'Suficiência da Escritura contra falsas revelações e modismos teológicos',
                        'Fidelidade hermenêutica no exercício ministerial diário'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. A Vocação Ministerial e o "Orthotomeo": Manejando Bem a Palavra',
                    conteudo: `Em 2 Timóteo 2:15, o apóstolo Paulo exorta: "Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade". O verbo grego empregado por Paulo é orthotomeo (ὀρθοτομέω), originário da junção de orthos (reto, correto) e temno (cortar). A metáfora alude ao pedreiro talhando pedras com perfeição para o edifício, ao agricultor arando um sulco reto na terra ou ao tecelão que corta o tecido sem desvios milimétricos.

Em "Obreiro de Valor", Abrahão Cipriano analisa com rigor a diferença entre a chamada divina soberana e o voluntarismo carnal. Aquele que foi vocacionado por Deus sente em seu peito o ardor do serviço sagrado, submetendo-se ao discipulado contínuo e aperfeiçoando suas ferramentas cognitivas e espirituais através da Escola Bíblica Dominical (EBD) e dos institutos teológicos.

Manejar bem a palavra da verdade significa interpretá-la segundo o contexto histórico, gramatical e exegético, evitando alegorias fantasiosas, manipulação do texto para obter vantagens pessoais ou sermões antropocêntricos vazios de Cristo.`,
                    destaqueExegese: 'Dokimos (δόκιμος): o obreiro aprovado após passar pelo teste do fogo e da fornalha da provação, mantendo integridade inegociável.',
                    pontosChave: [
                        'Orthotomeo: traçar e cortar reto a verdade das Escrituras',
                        'Vocação divina confirmada por testemunho, frutos e submissão',
                        'O perigo de torcer as Escrituras para agradar a homens',
                        'O obreiro aprovado vive em constante dependência do Espírito Santo'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. Postura Litúrgica, Zelo pelo Santuário e Decoro Eclesiástico',
                    conteudo: `O Auxiliar de Trabalho é o guardião prático e espiritual da atmosfera de reverência no templo do Senhor. 1 Coríntios 14:40 estabelece a regra de ouro para todas as reuniões dos santos: "Faça-se tudo decentemente e com ordem".

Abrahão Cipriano dedica páginas luminosas em "Obreiro de Valor" para instruir a liderança auxiliar sobre a importância do traje sóbrio, da higiene impecável, da compostura corporal e da vigilância santa durante os cultos. O auxiliar deve chegar ao templo com no mínimo 30 a 45 minutos de antecedência, conferir o funcionamento do sistema de som, inspecionar a iluminação, dispor os folhetos de recepção, orar no púlpito antes da chegada do público e posicionar-se estrategicamente para servir.

Durante o momento da ministração da Palavra e dos cânticos de louvor, o auxiliar não fica conversando nos corredores, nem disperso em redes sociais pelo celular. Pelo contrário: permanece com os olhos alertas e o espírito sintonizado em oração, prevenindo tumultos, acolhendo atrasados sem fazer barulho e socorrendo prontamente crianças, idosos ou enfermos.`,
                    destaqueExegese: 'Euschemonos (εὐσχημόνως): de modo nobre, belo, digno e honroso. Taxin (τάξιν): em ordem sucessiva, harmoniosa e disciplinada como uma guarda de elite do Reino.',
                    pontosChave: [
                        'Pontualidade sacerdotal e preparação prévia do santuário',
                        'Traje sóbrio e conduta impecável que honram o Nome do Senhor',
                        'Discrição e atenção contínua durante todo o desenrolar da liturgia',
                        'Guarda do púlpito e do altar contra distrações e desordem'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. O Culto Racional, a Transformação de Vidas e o Galardão dos Fiéis',
                    conteudo: `Em "Obreiro de Valor", o Pr. Abrahão Cipriano ressalta um princípio bíblico de extrema profundidade à luz de Isaías 1:10-20 e Romanos 12:1-2: Deus abomina a religiosidade mecânica, o culto de aparência e o ritualismo estéril que não resulta em arrependimento genuíno e transformação de vida.

O Auxiliar de Trabalho não deve encarar o serviço no templo como uma rotina burocrática de "abrir e fechar portas". Cada culto é uma oportunidade sagrada em que vidas despedaçadas pelo pecado chegam à Casa de Deus buscando restauração, perdão e cura divina. O acolhimento cheio de amor e o testemunho santo do obreiro podem ser o instrumento que Deus usará para abrir o coração daquele pecador para a salvação.

Quem serve com dedicação no ofício humilde de auxiliar está acumulando para si um tesouro incorruptível nos céus. Como declarou o Mestre em Lucas 16:10: "Quem é fiel no pouco também é fiel no muito". A fidelidade no anonimato precede a honra pública concedida pelo Espírito Santo.`,
                    destaqueExegese: 'Logiken latreian (λογικὴν λατρείαν) em Romanos 12:1: "culto racional, espiritual e consagrado", oferecendo o próprio corpo em sacrifício vivo, santo e agradável a Deus.',
                    pontosChave: [
                        'Combate à religiosidade mecânica e apego a formalismos estéreis',
                        'O culto como ambiente sobrenatural de salvação e libertação de almas',
                        'A fidelidade nos mínimos detalhes como passaporte para o crescimento no Reino',
                        'Convicção inabalável do galardão eterno conferido pelo Sumo Pastor'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'O que significa a inspiração "verbal e plenária" segundo a Declaração de Fé da CGADB?',
                    opcoes: [
                        'Que Deus inspirou apenas pensamentos gerais, permitindo erros na redação das palavras.',
                        'Que a inspiração divina estendeu-se a cada palavra dos manuscritos originais e abrange com igual autoridade todos os 66 livros da Bíblia.',
                        'Que apenas o Novo Testamento e os quatro Evangelhos possuem inspiração infalível.',
                        'Que a Bíblia contém a Palavra de Deus misturada com mitos e lendas humanas.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A CGADB ensina que a inspiração é verbal (as próprias palavras escolhidas sob a ação do Espírito Santo) e plenária (completa em toda a extensão dos 66 livros canônicos).'
                },
                {
                    pergunta: 'Segundo a obra "Obreiro de Valor" de Abrahão Cipriano e 2 Timóteo 2:15, qual a atitude central do obreiro em relação ao culto e ao manejo da Bíblia?',
                    opcoes: [
                        'Exercer o ministério apenas por formalismo de aparência sem compromisso com a transformação de vidas.',
                        'Buscar autopromoção pública através de sermões pomposos e inovadores.',
                        'Manejar com retidão a verdade (orthotomeo), viver o culto racional com santidade e servir com zelo no templo sem se envergonhar do Evangelho.',
                        'Abandonar o estudo bíblico e apoiar-se exclusivamente na experiência humana.'
                    ],
                    respostaCorreta: 2,
                    explicacao: 'O obreiro de valor maneja retamente a verdade bíblica, rejeita o formalismo vazio e serve com fidelidade e santidade comprovada perante Deus e a igreja.'
                }
            ]
        }]
    },
    {
        id: 'aux_02',
        nivelId: 'auxiliar',
        titulo: 'Módulo 2: O Caráter Santo, a Vida Familiar & A Ética do Obreiro de Valor',
        capituloCGADB: 'Capítulo 10 - A Salvação & Capítulo 24 - A Família (com subsídios de Abrahão Cipriano)',
        cargaHoraria: 16,
        ementa: 'A doutrina da santificação bíblica em suas dimensões posicional, progressiva e final. A pureza moral nos tempos da hiperconectividade. O governo do lar cristão como primeiro altar e pré-requisito indispensável para a liderança eclesiástica (1 Tm 3:4-5). A ética cristã na gestão das finanças, na honradez no comércio e no testemunho perante a sociedade conforme "Obreiro de Valor" do Pr. Abrahão Cipriano.',
        trabalhoSugerido: 'Escrever um ensaio dissertativo de 3 páginas abordando "A Família do Obreiro como Laboratório do Ministério", articulando os textos de Efésios 5:22-33, 1 Timóteo 3:4-5 e os capítulos de Ética Ministerial de "Obreiro de Valor".',
        licoes: [{
            id: 'lic_aux_02',
            numero: 1,
            titulo: 'Santidade Pessoal, Integridade Moral e o Sacerdócio do Lar Cristão',
            introducao: 'Nas Assembleias de Deus, a santificação não é um acessório facultativo nem um mero código de regras externas, mas a própria essência da vida no Espírito Santo. O pastor Abrahão Cipriano adverte enfaticamente em "Obreiro de Valor" que o maior sermão de um obreiro é pregado pelo seu próprio caráter e pela estabilidade piedosa da sua família. Antes de subir ao púlpito ou trajar a farda ministerial, o obreiro precisa ser consagrado dentro do seu próprio lar, amando sua esposa sacrificialmente e governando seus filhos no temor do Senhor.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 10 e 24), a salvação em Cristo produz regeneração e exige uma vida de santificação contínua (Hb 12:14; 1 Pe 1:15-16). A família foi instituída por Deus no Éden e o casamento cristão é heterossexual, monogâmico, indissolúvel e sagrado. O obreiro de valor não tolera a hipocrisia e mantém coerência absoluta entre a vida privada e o ministério público.',
            referenciasBiblicas: ['1 Tessalonicenses 4:3-7', 'Hebreus 12:14', '1 Pedro 1:15-16', 'Efésios 5:22-33', '1 Timóteo 3:4-5', 'Malaquias 2:14-16', 'Provérbios 4:23'],
            aplicacaoPratica: 'O auxiliar deve manter altar de culto doméstico diário em família, fugir de toda a aparência do mal na internet e nas redes sociais, recusar conversas imorais no ambiente de trabalho secular e ser rigorosamente honesto em todas as suas dívidas e compromissos civis.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Tríplice Dimensão da Santificação na Doutrina Pentecostal',
                    conteudo: `A soteriologia bíblica abraçada pelas Assembleias de Deus ensina que a santificação opera em três dimensões coordenadas pela graça:
1) **Santificação Posicional ou Inicial**: Ocorre no exato instante em que o pecador crê em Cristo, sendo justificado e separado judicialmente para pertencer exclusivamente a Deus (1 Co 6:11).
2) **Santificação Progressiva ou Prática**: É o processo dinâmico e contínuo vivenciado pelo crente ao longo de toda a sua peregrinação terrestre. Mediante a ação iluminadora da Palavra de Deus e o poder interior do Espírito Santo, o crente mortifica as inclinações da carne e reveste-se do fruto do Espírito (Gl 5:22-23; 2 Co 3:18).
3) **Santificação Final ou Glorificação**: O ápice escatológico quando, no Arrebatamento da Igreja, receberemos um corpo glorificado incorruptível, livres para sempre da própria presença do pecado (1 Jo 3:2; Fp 3:20-21).

O obreiro de valor compreende que não há unção duradoura sem pureza de vida. Ninguém pode manter a comunhão com o Deus Todo-Poderoso se alimentar o pecado no quarto secreto.`,
                    destaqueExegese: 'Hagiasmos (ἁγιασμός): consagração moral ativa, pureza de coração e mente, dedicação irrevogável ao serviço sagrado do Deus Santo.',
                    pontosChave: [
                        'Santificação posicional: justificados pelo sangue do Cordeiro',
                        'Santificação progressiva: guerra diária contra a carne e o mundo',
                        'Santificação final: glorificação corpórea na Segunda Vinda',
                        'Sem santificação ninguém verá o Senhor (Hebreus 12:14)'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. Pureza Sexual, Vigilância Digital e a Guarda do Coração',
                    conteudo: `Em uma época assolada pelo secularismo e pela proliferação de pornografia e imoralidade na internet, o obreiro do Senhor precisa erguer muralhas espirituais de vigilância. As Escrituras ordenam em 1 Tessalonicenses 4:3-4: "Porque esta é a vontade de Deus, a vossa santificação: que vos abstenhais da prostituição; que cada um de vós saiba possuir o seu vaso em santificação e honra".

Em "Obreiro de Valor", o Pr. Abrahão Cipriano alerta com veemência para as ciladas digitais: o uso imprudente de mensagens privadas com pessoas do sexo oposto, o consumo de conteúdos imorais e a perda de tempo em entretenimentos frívolos que entorpecem a sensibilidade do Espírito Santo.

O auxiliar de trabalho deve praticar o pacto de Jó com seus olhos (Jó 31:1) e guardar o seu coração com toda a diligência (Pv 4:23), ciente de que as quedas morais públicas sempre começam na negligência secreta da oração e na concessão aos pequenos pecados de estimação.`,
                    destaqueExegese: 'Porneia (πορνεία): qualquer ato ou prática sexual ilícita fora dos santos laços do matrimônio bíblico monogâmico.',
                    pontosChave: [
                        'Abstenção radical de toda imoralidade e pornografia',
                        'Cuidado extremo nas redes sociais e comunicações privadas',
                        'Pacto de pureza nos olhos, pensamentos e desejos',
                        'Prestação de contas e transparência espiritual com o mentor'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. O Sacerdócio Familiar: O Lar como o Primeiro Altar do Obreiro',
                    conteudo: `O apóstolo Paulo estabelece em 1 Timóteo 3:4-5 um critério intransponível para qualquer candidato ao ministério: "Que governe bem a sua própria casa, tendo seus filhos em sujeição, com toda a modéstia (pois se alguém não sabe governar a sua própria casa, de que modo cuidará da igreja de Deus?)".

Abrahão Cipriano sublinha que o lar é a oficina onde o obreiro é forjado e testado. A esposa do obreiro não é sua serva, mas sua companheira de herança da graça (1 Pe 3:7), a quem ele deve amar sacrificialmente assim como Cristo amou a Igreja e Se entregou por ela (Ef 5:25).

O obreiro de valor lidera sua família pelo exemplo de ternura, diálogo, culto doméstico e provisão digna. Filhos rebeldes e revoltados por causa do abandono paterno em nome do "trabalho da igreja" revelam uma inversão perigosa de prioridades espirituais. Deus instituiu a família antes de instituir o tabernáculo e a igreja local.`,
                    destaqueExegese: 'Proistamenon (προϊστάμενον): liderar, presidir e proteger com autoridade afetuosa e cuidado paternal responsável.',
                    pontosChave: [
                        'Prioridade divina inegociável: Deus, Família e Ministério',
                        'Culto doméstico bíblico e oração fervorosa no lar',
                        'Amor sacrificial e respeito incondicional pela esposa',
                        'Educação e discipulado dos filhos no temor do Senhor'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. Mordomia Cristã, Integridade Financeira e Honradez Civil',
                    conteudo: `A mordomia cristã ensina que Deus é o Criador e legítimo Dono de todas as coisas (Sl 24:1), sendo o homem apenas um administrador encarregado de prestar contas detalhadas. A Declaração de Fé da CGADB afirma a contemporaneidade e a santidade da entrega dos dízimos (a décima parte das rendas) e das ofertas voluntárias e generosas como ato de adoração ao Senhor (Ml 3:10; 2 Co 9:7).

Como orienta o Pr. Abrahão Cipriano, o obreiro não pode ser negligente em suas finanças pessoais. Não deve contrair dívidas irresponsáveis, emitir cheques sem provisão de fundos ou manchar seu nome nos órgãos de proteção ao crédito no comércio. Um obreiro com nome sujo na praça desonra o Evangelho e perde a autoridade moral para aconselhar e pregar no púlpito.

A honestidade do obreiro abrange a devolução pontual de dízimos, a declaração fidedigna de tributos perante o Estado (Rm 13:7) e a transparência absoluta em qualquer quantia monetária que passe por suas mãos na igreja.`,
                    destaqueExegese: 'Oikonomos (οἰκονόμος): administrador de bens alheios que deve ser achado fiel e irrepreensível em todas as contas.',
                    pontosChave: [
                        'Fidelidade bíblica nos dízimos e ofertas generosas',
                        'Orçamento familiar planejado sem desperdícios ou vaidades',
                        'Nome limpo no comércio civil e honradez em todas as transações',
                        'Testemunho exemplar como cidadão cumpridor de seus deveres'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. Mansidão, Lealdade à Liderança e Testemunho Social',
                    conteudo: `O perfil do obreiro de valor desenhado por Abrahão Cipriano culmina na sua capacidade de conviver em harmonia com seus irmãos de fé e com as autoridades constituídas da igreja. O auxiliar de trabalho não pode ser contencioso, brigão, fofoqueiro ou invejoso das oportunidades alheias (Tt 3:2; Tg 3:14-17).

A lealdade ao pastor presidente e ao corpo ministerial não significa subserviência cega ao pecado, mas respeito sincero à autoridade espiritual estabelecida por Deus para o governo da congregação (Hb 13:17). O obreiro maduro resolve divergências com mansidão e em particular (Mt 18:15-17), jamais promovendo murmuração, facções ou motins nos corredores do templo.

Seu testemunho perante os não crentes ("os de fora", 1 Tm 3:7) deve ser reluzente como luz nas trevas. Seja na vizinhança, na fábrica ou no escritório secular, todos devem reconhecer nele um servo humilde, pontual, trabalhador e irrepreensível do Senhor Jesus.`,
                    destaqueExegese: 'Marturia kalen (μαρτυρίαν καλὴν): excelente reputação pública, atestada e confirmada inclusive pelos observadores não convertidos.',
                    pontosChave: [
                        'Espírito pacificador e mansidão no trato com todos',
                        'Lealdade pastoral santa contra facções e murmurações',
                        'Testemunho irrepreensível no ambiente de trabalho secular',
                        'O obreiro de valor é carta viva de Cristo conhecida por todos'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Por que o apóstolo Paulo afirma em 1 Timóteo 3:5 que governar bem a própria casa é condição obrigatória para o obreiro?',
                    opcoes: [
                        'Porque o lar é o laboratório prático do ministério espiritual; quem não sabe cuidar com amor e ordem da sua própria família não tem capacidade espiritual de pastorear a Igreja de Deus.',
                        'Apenas por uma exigência cultural da cidade de Éfeso sem validade para os dias atuais.',
                        'Para garantir que os familiares do obreiro ocupem cargos administrativos remunerados na igreja.',
                        'Porque os filhos do obreiro são obrigados a cantar no coral desde a infância.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'A família é a base e o teste primário da liderança cristã. A incapacidade de liderar a própria casa desqualifica o indivíduo para a supervisão eclesiástica.'
                },
                {
                    pergunta: 'Segundo a Declaração de Fé da CGADB e o livro "Obreiro de Valor", como o obreiro deve conduzir suas finanças pessoais e seu testemunho civil?',
                    opcoes: [
                        'Pode acumular dívidas impagáveis desde que continue ofertando nos cultos.',
                        'Deve viver com modéstia, fidelidade nos dízimos, honradez irrepreensível no comércio e cumprimento rigoroso de seus deveres cívicos.',
                        'Não precisa prestar contas a ninguém sobre suas transações materiais.',
                        'Deve terceirizar o sustento do lar exclusivamente para as doações da igreja local.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O obreiro de valor mantém testemunho público irrepreensível, fidelidade nas primícias ao Senhor e honradez em todos os seus compromissos no comércio.'
                }
            ]
        }]
    },
    {
        id: 'aux_03',
        nivelId: 'auxiliar',
        titulo: 'Módulo 3: Recepção, Portaria, Protocolo & Zelo Litúrgico do Santuário',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & A Reverência no Altar ("Obreiro de Valor")',
        cargaHoraria: 16,
        ementa: 'A teologia bíblica dos porteiros levíticos e guardiões do santuário. A função ministerial da recepção cristã sem acepção de pessoas (Tiago 2). Protocolo eclesiástico, acolhimento solene de visitantes e autoridades. Segurança espiritual e preservação da atmosfera reverente do culto pentecostal conforme o manual de boas práticas do obreiro de valor.',
        trabalhoSugerido: 'Elaborar um Manual Prático de Recepção e Portaria do Santuário, contendo fluxogramas de acolhimento a visitantes, plano de assistência a idosos e procedimento de segurança espiritual durante os apelos de salvação.',
        licoes: [{
            id: 'lic_aux_03',
            numero: 1,
            titulo: 'Os Porteiros do Senhor, a Hospitalidade Cristã e a Guarda dos Átrios Santos',
            introducao: 'No Antigo Testamento, os porteiros levitas (1 Crônicas 9:19; 26:1-19) não eram meros executores de serviços braçais, mas ministros consagrados encarregados de guardar os limites santos do Tabernáculo e do Templo contra qualquer profanação. No Novo Testamento, essa nobreza se expressa na recepção acolhedora, na vigilância contínua e na hospitalidade que reflete a graça do Senhor Jesus. Como ensina o Pr. Abrahão Cipriano em "Obreiro de Valor", a portaria é a porta de entrada da Casa de Deus, onde a primeira impressão de amor, organização e reverência é gravada na alma do visitante.',
            fundamentacaoDoutrinaria: 'Segundo a Declaração de Fé da CGADB (Capítulo 11), a Igreja local reúne-se em assembleia solene para adoração a Deus, edificação mútua dos santos e evangelização dos perdidos. O culto deve ser conduzido com ordem, decência e júbilo santo (1 Co 14:40), cabendo aos oficiais e auxiliares zelar pela integridade espiritual e física de todo o recinto sagrado.',
            referenciasBiblicas: ['1 Crônicas 9:19-27', 'Salmo 84:10', 'Tiago 2:1-9', 'Romanos 12:13', 'Hebreus 13:2', '1 Pedro 4:9-10', '1 Coríntios 14:40'],
            aplicacaoPratica: 'O auxiliar deve posicionar-se na portaria com vestimenta sóbria e postura ereta, oferecendo bíblias, hinários e folhetos aos visitantes com afabilidade sincera, auxiliando idosos nos degraus e zelando pelo silêncio santo durante a oração e a pregação.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Nobreza Bíblica dos Porteiros Levitas no Templo',
                    conteudo: `As Escrituras Sagradas dedicam capítulos inteiros para registrar a genealogia e a escala de serviço dos porteiros do Templo de Jerusalém. O Salmo 84:10 imortaliza o sentimento de um servo apaixonado pela Casa do Senhor: "Porque vale mais um dia nos teus átrios do que mil em outra parte. Preferiria estar à porta da Casa do meu Deus a habitar nas tendas da impiedade".

Em 1 Crônicas 9:27, a Bíblia relata que os porteiros pernoitavam ao redor da Casa de Deus porque tinham o encargo da guarda e eram responsáveis por abrir as portas a cada manhã. Esse ofício exigia fidelidade, coragem, vigilância e discernimento para não permitir que pessoas cerimonialmente impuras ou invasores contaminassem os vasos e as ofertas sagradas.

O auxiliar de trabalho nas Assembleias de Deus herda essa sagrada tradição. Servir na portaria não é um castigo ou um degrau inferior de desprezo, mas um ofício de honra e primeira linha de proteção e acolhimento do rebanho de Cristo.`,
                    destaqueExegese: 'Shoel (שׁוֹעֵר): guardião de honra e confiança estabelecido às portas sagradas para garantir a santidade dos acessos ao santuário.',
                    pontosChave: [
                        'Fundamento bíblico veterotestamentário dos porteiros consagrados',
                        'A alegria santa de servir nos átrios do Senhor (Salmo 84:10)',
                        'Guarda responsável e abertura pontual do templo',
                        'O serviço na porta como privilégio espiritual de alto valor'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. Acolhimento Inclusivo e Rejeição Absoluta da Acepção de Pessoas',
                    conteudo: `O apóstolo Tiago dirige uma advertência contundente à igreja em Tiago 2:1-4: "Meus irmãos, não tenhais a fé de nosso Senhor Jesus Cristo, Senhor da glória, em acepção de pessoas. Se entrar na vossa reunião algum homem com anéis de ouro no dedo, em trajes luxuosos, e entrar também um pobre em trajes rotos, e tratardes com deferência o que veste o traje luxuoso... porventura não fizestes distinção entre vós mesmos?".

O Pr. Abrahão Cipriano enfatiza em "Obreiro de Valor" que o auxiliar de recepção deve refletir o coração amoroso de Cristo. O morador de rua descalço que entra à procura de alívio e a autoridade pública que visita o templo devem ser recebidos com o mesmo respeito e carinho cristão.

A hospitalidade (philoxenia - amor ao estrangeiro) exige atenção ativa: conduzir a pessoa até um assento confortável, oferecer água se necessário, fornecer folhetos com a programação semanal da igreja e orientar discretamente a localização de banheiros e saídas de emergência.`,
                    destaqueExegese: 'Prosopolempsia (προσωπολημψία): acepção de pessoas, discriminação preconceituosa baseada em aparência externa, classe social ou etnia.',
                    pontosChave: [
                        'Amor incondicional a todos os que cruzam as portas da igreja',
                        'Repúdio total ao favoritismo ou desprezo social (Tiago 2)',
                        'Hospitalidade cristã sincera e calorosa (Philoxenia)',
                        'Atenção prioritária a idosos, gestantes e pessoas com deficiência'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. Vigilância Espiritual, Discrição e Segurança no Templo',
                    conteudo: `A igreja local é um campo de batalha espiritual. Durante os cultos públicos, pessoas perturbadas por forças opressoras, indivíduos mal-intencionados ou pessoas sob crises emocionais graves podem adentrar o templo.

O obreiro de valor não entra em pânico, não faz escândalos e não chama a atenção do público desnecessariamente. Ele atua com prudência de serpente e mansidão de pomba (Mt 10:16). Se alguém entrar embriagado ou manifestando perturbação espiritual, o auxiliar, acompanhado de outro obreiro em oração, deve aproximar-se com calma, conduzir a pessoa com carinho e firmeza para a sala de oração e intercessão pastoral, permitindo que a congregação continue ouvindo a pregação da Palavra em paz.

A vigilância do auxiliar também abrange a proteção física: atenção a crianças desacompanhadas nos pátios, fiscalização dos portões de entrada e prevenção de acidentes na nave do templo.`,
                    destaqueExegese: 'Sophronismos (σωφρονισμός): mente sóbria, autocontrole sereno, discernimento equilibrado em situações de crise.',
                    pontosChave: [
                        'Vigilância espiritual contínua com espírito intercessor',
                        'Discrição e serenidade diante de perturbações no culto',
                        'Condução amorosa de necessitados para a sala de oração pastoral',
                        'Zelo pela integridade física de crianças e famílias no recinto'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. Auxílio Litúrgico ao Dirigente, Ofertório e Santa Ceia',
                    conteudo: `O Auxiliar de Trabalho é o braço direito do dirigente do culto e dos diáconos. Em "Obreiro de Valor", o Pr. Abrahão Cipriano lista os cuidados litúrgicos indispensáveis:
- **Água no Púlpito**: Copo limpo e jarra abastecida antes do início do culto.
- **Microfones e Hinários**: Testar equipamentos com antecedência e disponibilizar Harpas Cristãs aos visitantes.
- **Recolhimento dos Dízimos e Ofertas**: Posicionar-se com postura solene, segurar as salvas/sacolas com dignidade, caminhar em passos sincronizados sem pressa e entregar o recolhimento com transparência e segurança na tesouraria da igreja.
- **Apoio na Santa Ceia**: Manter-se a postos para auxiliar o corpo diaconal na reposição de bandejas de cálices e recolhimento respeitoso dos cálices vazios.`,
                    destaqueExegese: 'Huperetes (ὑπηρέτης): servo sob ordens, auxiliar dedicado que executa a vontade do líder com prontidão e lealdade.',
                    pontosChave: [
                        'Prontidão em atender aos gestos discretos do pastor dirigente',
                        'Zelo sagrado na condução das salvas de dízimos e ofertas',
                        'Sincronia e solenidade no apoio aos diáconos na Santa Ceia',
                        'Guarda respeitosa dos instrumentos sagrados de louvor e ministração'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. Fechamento do Templo, Inspeção Final e Relatório Pastoral',
                    conteudo: `O ministério do auxiliar de trabalho não termina com a oração da bênção apostólica. Enquanto os crentes confraternizam e se despedem, o auxiliar:
1) Circula pela nave do templo recolhendo bíblias, casacos ou pertences esquecidos, catalogando-os no setor de achados e perdidos;
2) Verifica se todas as torneiras, sanitários, luzes, ventiladores e aparelhos de ar-condicionado foram desligados, evitando desperdício financeiro para a congregação;
3) Confere o trancamento seguro de todas as portas, portões e janelas do santuário;
4) Reporta ao presbítero ou pastor encarregado qualquer incidente ocorrido durante a noite.

Essa mordomia meticulosa agrada ao coração de Deus e consolida o obreiro como um servo maduro, digno de confiança e pronto para futuras consagrações.`,
                    destaqueExegese: 'Pistotes (πιστότης): fidelidade inquebrantável e lealdade comprovada em todas as tarefas conferidas.',
                    pontosChave: [
                        'Inspeção pós-culto minuciosa de todo o prédio da igreja',
                        'Economia de energia, água e preservação do patrimônio eclesiástico',
                        'Segurança absoluta no fechamento do templo sagrado',
                        'Relatório de ocorrências repassado prontamente ao pastor'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual a orientação do apóstolo Tiago (Tg 2:1-4) sobre a recepção de visitantes com diferentes condições financeiras na igreja?',
                    opcoes: [
                        'Reservar os melhores bancos exclusivamente para autoridades e doadores ricos.',
                        'Tratar a todos com idêntico amor cristão e dignidade, recusando qualquer forma de acepção ou discriminação preconceituosa.',
                        'Não permitir a entrada de pessoas de classe social humilde no santuário.',
                        'Cobrar ingressos na porta do templo para manter os custos da congregação.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A acepção de pessoas é pecado frontal contra a lei real do amor de Cristo. O templo do Senhor é casa de oração para todos os povos.'
                },
                {
                    pergunta: 'De acordo com os ensinamentos de "Obreiro de Valor" de Abrahão Cipriano, qual o procedimento do obreiro ao lidar com manifestações espirituais ou perturbações no culto?',
                    opcoes: [
                        'Gritar pelo microfone e interromper a mensagem do pastor imediatamente.',
                        'Agir com serenidade, mansidão e prudência, conduzindo a pessoa em oração discreta para a sala pastoral sem gerar tumulto na nave do templo.',
                        'Expulsar a pessoa violentamente para a rua.',
                        'Ignorar a situação e continuar mexendo no celular.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O obreiro de valor preserva a reverência do culto e socorre o aflito com amor, prudência e discrição na sala de intercessão pastoral.'
                }
            ]
        }]
    },
    {
        id: 'aux_04',
        nivelId: 'auxiliar',
        titulo: 'Módulo 4: Evangelismo Pessoal, Discipulado & A Visitação Pastoral',
        capituloCGADB: 'Capítulo 10 - A Salvação & Capítulo 11 - A Igreja de Deus',
        cargaHoraria: 16,
        ementa: 'A Grande Comissão dada por Cristo a todos os santos (Mt 28:18-20). Métodos práticos de evangelismo pessoal nas ruas, praças, presídios e hospitais. O acolhimento e o discipulado de novos convertidos na Escola Bíblica Dominical. Princípios e cuidados éticos na visitação domiciliar e aos enfermos segundo o livro "Obreiro de Valor".',
        trabalhoSugerido: 'Elaborar um Roteiro de Visitação Domiciliar Cristã e um Plano de Discipulado Inicial em 4 Lições para Novos Convertidos, com base nos Capítulos 10 e 11 da Declaração de Fé da CGADB.',
        licoes: [{
            id: 'lic_aux_04',
            numero: 1,
            titulo: 'O Fogo Evangelístico, o Amor pelas Almas Perdidas e a Prática do Discipulado',
            introducao: 'A Igreja das Assembleias de Deus nasceu e expandiu-se com um poderoso dinamismo evangelístico. O obreiro de valor não se limita a atuar dentro das quatro paredes do templo, mas possui um coração que queima de compaixão pelas almas perdidas que caminham para a condenação eterna. Como ressalta o Pr. Abrahão Cipriano em sua obra, o obreiro que perdeu a paixão por ganhar almas perdeu a própria essência de sua vocação.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 10 e 11), a salvação em Cristo Jesus é uma dádiva da graça soberana de Deus oferecida gratuitamente a todos os seres humanos mediante a fé, o arrependimento e a regeneração pelo Espírito Santo. A Grande Comissão é uma ordem irrevogável para a Igreja proclamar o Evangelho a toda criatura.',
            referenciasBiblicas: ['Mateus 28:18-20', 'Marcos 16:15-18', 'Atos 1:8', 'Romanos 1:16', 'Provérbios 11:30', '2 Timóteo 4:2-5', 'João 4:35-36'],
            aplicacaoPratica: 'O auxiliar deve participar ativamente dos cultos ao ar livre, carregar folhetos evangelísticos sempre consigo, aprender a apresentar o plano da salvação em poucos minutos com a Bíblia aberta e integrar com zelo os novos convertidos nas classes de discipulado da EBD.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Imperativo da Grande Comissão e o Fogo Missionário',
                    conteudo: `Antes de ascender glorioso aos céus, o Senhor Jesus Cristo outorgou à Sua Igreja o mandato supremo: "Ide por todo o mundo, pregai o evangelho a toda criatura" (Mc 16:15) e "Fazei discípulos de todas as nações" (Mt 28:19). O imperativo não é uma sugestão negociável, mas uma ordem soberana do Rei da Glória.

O pentecostalismo clássico das Assembleias de Deus distingue-se pelo batismo no Espírito Santo como dotação de poder para testemunhar com intrepidez (At 1:8). O Espírito Santo não é concedido para mera exaltação pessoal ou sensacionalismo, mas para que o crente seja uma testemunha viva da ressurreição de Cristo.

Em "Obreiro de Valor", o Pr. Abrahão Cipriano desafia o obreiro a examinar a temperatura do seu coração: quem não chora pelos perdidos e não busca oportunidades diárias para falar de Jesus no trabalho, na vizinhança e no transporte coletivo está em perigoso declínio espiritual.`,
                    destaqueExegese: 'Martyres (μάρτυρες) em Atos 1:8: testemunhas oculares e convictas, dispostas inclusive a sofrer e dar a vida pela veracidade do Evangelho.',
                    pontosChave: [
                        'A Grande Comissão como missão prioritária e permanente da Igreja',
                        'O poder do Espírito Santo direcionado à evangelização eficaz',
                        'O amor pelas almas como termômetro da espiritualidade do obreiro',
                        'A urgência da colheita antes da Segunda Vinda de Cristo'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. Métodos Bíblicos de Evangelismo Pessoal e Abordagem Cristã',
                    conteudo: `O evangelismo pessoal é a proclamação da mensagem redentora de indivíduo para indivíduo, adaptada à realidade de quem ouve, a exemplo de Jesus com a mulher samaritana (Jo 4) e de Filipe com o eunuco etíope (At 8).

Abrahão Cipriano orienta em "Obreiro de Valor" algumas regras de ouro para o evangelista eficaz:
1) **Oração Prévia**: Depender da convicção operada pelo Espírito Santo (Jo 16:8);
2) **Abordagem Respeitosa**: Jamais atacar a religião alheia ou ridicularizar imagens e crenças, mas exaltar a Pessoa sublime de Jesus Cristo e a suficiência de Seu sacrifício;
3) **Uso Preciso da Bíblia**: Apresentar os 4 passos da Salvação (Universalidade do Pecado em Rm 3:23; Condenação em Rm 6:23; Amor Providencial em Jo 3:16 e Rm 5:8; Confissão salvadora em Rm 10:9-10);
4) **Folhetos de Qualidade**: Distribuir folhetos bem impressos, limpos e com o endereço e horários de culto da igreja local carimbados com clareza.`,
                    destaqueExegese: 'Euangelizo (εὐαγγελίζω): anunciar as boas novas da redenção em Cristo Jesus com júbilo e clareza.',
                    pontosChave: [
                        'Abordagem com amor, mansidão e respeito sem debates estéreis',
                        'Exaltação exclusiva de Cristo crucificado e ressurreto',
                        'Domínio exegético do Plano da Salvação nas Escrituras',
                        'Distribuição organizada e estratégica de literatura evangelística'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. Acolhimento e Discipulado Efetivo do Novo Convertido',
                    conteudo: `Ganhar a alma para Cristo na decisão pública é apenas o primeiro passo do processo de reprodução espiritual; o mandamento de Jesus foi fazer discípulos e ensiná-los a guardar tudo quanto Ele ordenou (Mt 28:19-20).

Um dos maiores dramas da igreja contemporânea é a perda de novos convertidos pela porta dos fundos por falta de acompanhamento fraterno. Em "Obreiro de Valor", ensina-se que o obreiro deve ser como um pai espiritual amoroso (1 Ts 2:7-8, 11).

Logo após a decisão no culto, o auxiliar de trabalho deve:
- Preencher a ficha cadastral do novo convertido com nome, endereço e telefone corretos;
- Presentear o irmão com uma Bíblia e a primeira lição de novos crentes;
- Conduzi-lo à classe de discipulado da Escola Bíblica Dominical (EBD);
- Realizar um contato por telefone ou mensagem nas primeiras 48 horas para orar com ele.`,
                    destaqueExegese: 'Matheteuo (μαθητεύω): formar discípulos, educar no estilo de vida de Cristo, acompanhar até a maturidade espiritual.',
                    pontosChave: [
                        'O discipulado como continuação inseparável da evangelização',
                        'Acolhimento com ternura fraternal e integração imediata na EBD',
                        'Acompanhamento nos primeiros passos da fé e da renúncia ao mundo',
                        'Preparo dos novos decididos para o Batismo nas Águas por imersão'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. Princípios e Ética Sagrada na Visitação aos Lares e Enfermos',
                    conteudo: `A visitação pastoral e diaconal é um dos ministérios mais confortadores e poderosos da igreja de Deus. Em Tiago 1:27, a Palavra declara: "A religião pura e imaculada para com Deus, o Pai, é esta: Visitar os órfãos e as viúvas nas suas tribulações e guardar-se da corrupção do mundo".

O Pr. Abrahão Cipriano estabelece diretrizes éticas fundamentais em "Obreiro de Valor":
- **Nunca visitar sozinho**: O obreiro deve ir acompanhado de sua esposa ou de outro irmão do ministério, especialmente ao visitar irmãs ou lares onde o cônjuge não seja crente, evitando escândalos (1 Ts 5:22);
- **Horário e Duração Adequados**: Respeitar o repouso da família; visitas não devem ultrapassar 20 a 30 minutos, a menos que haja solicitação pastoral expressa;
- **Foco Espiritual**: Não utilizar a visita para conversas seculares frívolas, fofocas eclesiásticas ou murmurações. Ler um texto bíblico encorajador, ministrar paz à casa (Lc 10:5-6) e interceder com fervor pelas necessidades da família.`,
                    destaqueExegese: 'Episkeptomai (ἐπισκέπτομαι): visitar com o propósito de cuidar, inspecionar amorosamente, socorrer e levar alívio celestial.',
                    pontosChave: [
                        'A visitação como expressão autêntica do amor e pastoreio de Cristo',
                        'Prudência: visitas sempre em dupla ministerial para resguardo moral',
                        'Discrição, brevidade e foco exclusivo na Palavra e na oração',
                        'Unção e conforto aos enfermos segundo as Escrituras'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. O Fruto Permanente e o Compromisso com a Seara',
                    conteudo: `O Senhor Jesus asseverou em João 15:16: "Não me escolhestes vós a mim, mas eu vos escolhi a vós, e vos nomeei, para que vades e deis fruto, e o vosso fruto permaneça". O valor de um obreiro diante do Senhor não se mede pela quantidade de aplausos recebidos, mas pela permanência dos frutos espirituais gerados sob seu ministério.

Ao atuar no evangelismo, no discipulado e na visitação piedosa, o Auxiliar de Trabalho desenvolve sensibilidade pastoral, aprende a ouvir as dores do rebanho e adquire autoridade espiritual genuína.

Como conclui Abrahão Cipriano em "Obreiro de Valor", o obreiro que semeia com lágrimas e dedicação colherá com cânticos de júbilo (Sl 126:5-6), apresentando diante do Tribunal de Cristo almas preciosas salvas pela graça.`,
                    destaqueExegese: 'Karpos menon (καρπὸς μένων): fruto que resiste ao tempo, às tempestades e ao fogo da provação divina.',
                    pontosChave: [
                        'Vocação para produzir frutos permanentes no Reino de Deus',
                        'Desenvolvimento da empatia e da compaixão pastoral pelas ovelhas',
                        'A recompensa gloriosa do semeador fiel na eternidade',
                        'Consagração total da vida ao avivamento da igreja local'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Segundo as orientações de ética ministerial do livro "Obreiro de Valor", quais os cuidados indispensáveis na visitação a lares e enfermos?',
                    opcoes: [
                        'Ir sozinho sem avisar a liderança e prolongar a visita por várias horas debatendo política.',
                        'Ir acompanhado (em dupla de obreiros ou com a esposa), manter brevidade (20-30 min), respeitar o lar e focar na leitura da Bíblia e na oração da fé.',
                        'Usar o momento da visita para criticar as decisões da liderança da igreja.',
                        'Cobrar valores monetários para realizar a oração pelos doentes.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A visitação cristã exige santidade, resguardo ético (visitas em dupla), pontualidade, prudência e foco exclusivo na ministração da paz e da Palavra de Deus.'
                },
                {
                    pergunta: 'Por que o discipulado do novo convertido é considerado continuação indispensável da evangelização na doutrina da CGADB?',
                    opcoes: [
                        'Porque a ordem de Jesus em Mateus 28:19 é fazer discípulos e ensiná-los a guardar a Palavra, evitando a perda de novos crentes e promovendo a maturidade na fé.',
                        'Apenas para aumentar o número de pessoas cadastradas na tesouraria.',
                        'Para impedir que o novo convertido estude teologia.',
                        'Porque sem o discipulado a pessoa não pode frequentar os cultos públicos.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'O discipulado consolida a fé do novo crente, nutre-o com a sã doutrina da EBD e prepara-o para o batismo em águas e o serviço no Reino.'
                }
            ]
        }]
    },
    {
        id: 'aux_05',
        nivelId: 'auxiliar',
        titulo: 'Módulo 5: Eclesiologia, Liturgia Pentecostal & A Ceia do Senhor',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Capítulo 14 - A Ceia do Senhor',
        cargaHoraria: 16,
        ementa: 'A natureza teológica da Igreja de Cristo como Corpo místico e Assembleia dos Santos. As duas ordenanças do Senhor: O Batismo em Águas por imersão (Cap. 13) e a Santa Ceia do Senhor (Cap. 14). A reverência solene na preparação da mesa, os elementos (pão e vinho/suco da videira), o exame de consciência e o apoio do corpo de auxiliares aos diáconos e presbíteros conforme "Obreiro de Valor".',
        trabalhoSugerido: 'Escrever uma dissertação teológica de 3 páginas sobre o significado comemorativo e escatológico da Santa Ceia (1 Co 11:23-34) e o papel prático e reverente do corpo de oficiais na celebração memorial.',
        licoes: [{
            id: 'lic_aux_05',
            numero: 1,
            titulo: 'O Corpo de Cristo, as Santas Ordenanças e a Solenidade da Mesa do Senhor',
            introducao: 'A Igreja do Deus Vivo não é um clube recreativo ou uma corporação humana de interesses terrenos, mas a noiva de Cristo, coluna e firmeza da verdade (1 Tm 3:15). Cristo deixou para Sua Igreja duas ordenanças perpétuas: o Batismo em Águas exclusivamente por imersão e a Santa Ceia do Senhor. O pastor Abrahão Cipriano ressalta em "Obreiro de Valor" que a celebração da Santa Ceia é o momento mais solene, profundo e sagrado do calendário eclesiástico, exigindo de todos os obreiros uma postura de santidade, passos sincronizados e temor comovente.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé das Assembleias de Deus (CGADB/CPAD, Capítulos 11, 13 e 14), a Santa Ceia é uma ordenança comemorativa, memorial e profética do sacrifício de Cristo na cruz e de Sua iminente Segunda Vinda. Não é um sacrifício repetido (rejeição da transubstanciação e consubstanciação), mas um ato de santa comunhão dos santos que deve ser recebido com autoexame espiritual sincero.',
            referenciasBiblicas: ['1 Coríntios 11:23-34', 'Mateus 26:26-29', 'Lucas 22:14-20', 'Atos 2:42-46', '1 Coríntios 10:16-17', '1 Timóteo 3:15', 'Efésios 4:1-6'],
            aplicacaoPratica: 'O auxiliar deve preparar previamente os cálices e as toalhas da mesa junto com o corpo de diáconos, orientar os fiéis com respeito durante o momento solene de distribuição e recolher os cálices com passos discretos e reverentes.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Natureza Espiritual da Igreja e as Duas Ordenanças de Cristo',
                    conteudo: `A Eclesiologia pentecostal ensina que a Igreja de Cristo manifesta-se de duas formas:
1) **A Igreja Universal e Invisível**: Formada por todos os crentes verdadeiramente regenerados pelo sangue de Jesus em todas as épocas e lugares da terra;
2) **A Igreja Local e Visível**: A comunidade reunida geograficamente em assembleias locais para adoração, comunhão, estudo da Palavra e proclamação do Evangelho.

O Senhor Jesus estabeleceu duas ordenanças litúrgicas para a Sua Igreja:
- **O Batismo em Águas (CGADB Cap. 13)**: Celebrado exclusivamente por imersão em nome do Pai, do Filho e do Espírito Santo, como testemunho público da morte para o pecado e ressurreição para uma nova vida em Deus;
- **A Santa Ceia do Senhor (CGADB Cap. 14)**: Celebração regular da comunhão e da memória da morte expiatória de Jesus até que Ele volte.`,
                    destaqueExegese: 'Ekklesia (ἐκκλησία): os "chamados para fora" do mundo de trevas para formar o povo exclusivo e sacerdotal de Deus.',
                    pontosChave: [
                        'A Igreja como Corpo de Cristo, Templo do Espírito e Família de Deus',
                        'Batismo em Águas por imersão total como declaração pública de fé',
                        'A Santa Ceia como mandamento perpétuo de comunhão e memória',
                        'A centralidade de Cristo em toda a liturgia assembleiana'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. A Teologia da Ceia do Senhor: Memória, Comunhão e Profecia',
                    conteudo: `A Declaração de Fé da CGADB estabelece os três pilares da Santa Ceia do Senhor com base em 1 Coríntios 11:23-26:
1) **Dimensão Memorial (Passado)**: "Fazei isto em memória de mim" (v. 24). Olhamos para a cruz do Calvário e recordamos o corpo chagado de Jesus e Seu sangue inocente derramado para pagar nossa dívida eterna;
2) **Dimensão de Comunhão (Presente)**: "Sendo nós muitos, somos um só pão e um só corpo" (1 Co 10:17). A Ceia celebra a unidade fraternal dos salvos, sem espaço para mágoas, divisões ou ressentimentos entre irmãos;
3) **Dimensão Escatológica e Profética (Futuro)**: "Anunciais a morte do Senhor, até que ele venha" (v. 26). A cada celebração, a Igreja reafirma com júbilo inabalável a certeza do Arrebatamento e das Bodas do Cordeiro nos céus.`,
                    destaqueExegese: 'Anamnesis (ἀνάμνησις): memorial ativo e consciente que torna presente na memória da fé a eficácia eterna do sacrifício de Cristo.',
                    pontosChave: [
                        'Memorial da cruz: gratidão eterna pelo sacrifício vicário de Cristo',
                        'Comunhão santa: reconciliação sincera e perdão mútuo no Corpo',
                        'Expectativa escatológica: certeza do breve retorno do Senhor Jesus',
                        'Rejeição da transubstanciação católica e do simbolismo puramente vazio'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. O Autoexame Espiritual e a Advertência Paulina em 1 Co 11',
                    conteudo: `O apóstolo Paulo exorta a igreja em Corinto com palavras de solene gravidade em 1 Coríntios 11:28-29: "Examine-se, pois, o homem a si mesmo, e assim coma deste pão e beba deste cálice. Porque o que come e bebe indignamente, come e bebe para si condenação, não discernindo o corpo do Senhor".

O Pr. Abrahão Cipriano salienta em "Obreiro de Valor" que participar indignamente não significa ser uma pessoa perfeita (pois somos salvos pela graça), mas participar com atitude desrespeitosa, em pecado deliberado não confessado, ou alimentando ódio e inimizade contra o irmão.

O obreiro de valor é o primeiro a dobrar os joelhos em autoexame profundo, confessando qualquer deslize a Deus e buscando reconciliação com o próximo antes de estender as mãos para os santos elementos da mesa.`,
                    destaqueExegese: 'Dokimazeto (δοκιμαζέτω): examinar-se a si mesmo rigorosamente, como quem prova um metal precioso no fogo para retirar a escória.',
                    pontosChave: [
                        'O autoexame íntimo como dever espiritual antes da Ceia',
                        'O perigo espiritual de participar com desrespeito ou coração endurecido',
                        'A Ceia como mesa de restauração, arrependimento e graça aos contritos',
                        'O testemunho de paz e perdão cultivado por todo o corpo de obreiros'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. Protocolo e Apoio Prático na Distribuição da Santa Ceia',
                    conteudo: `Em "Obreiro de Valor", o Pr. Abrahão Cipriano descreve detalhadamente o protocolo de reverência que deve guiar os oficiais e auxiliares durante o culto de Santa Ceia:
- **Organização Prévia**: As toalhas alvas, as bandejas de cálices de suco da videira e os pães asmos devem ser preparados com rigorosa higiene, luvas e profunda oração no anexo do templo;
- **Ato de Distribuição**: Os presbíteros e diáconos partem e servem os elementos sob a supervisão do pastor presidente, enquanto os auxiliares dão suporte logístico nos corredores, garantindo que nenhum membro em plena comunhão seja esquecido;
- **Postura Corporal**: Movimentos suaves, passos cadenciados, sem conversas paralelas, mantendo os olhos nos fiéis e o coração em clamor pelo mover do Espírito Santo;
- **Recolhimento dos Cálices**: Manusear os recipientes de recolha com serenidade e respeito, evitando ruídos que quebrem a atmosfera de adoração e contrição.`,
                    destaqueExegese: 'Hagiotetos (ἁγιότητος): solenidade sagrada que permeia todo o serviço realizado em torno da mesa do Senhor.',
                    pontosChave: [
                        'Higiene impecável e oração na preparação dos santos elementos',
                        'Harmonia e sincronismo respeitoso na circulação pelas naves do templo',
                        'Apoio discreto para que todos os membros em comunhão sejam atendidos',
                        'Recolha silenciosa e digna que preserva a reverência da adoração'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. A Conclusão do Grau de Auxiliar e o Preparo para o Diaconato',
                    conteudo: `Ao concluir os 5 módulos de estudo da Escola de Formação de Obreiros GIPP, o Auxiliar de Trabalho demonstra maturidade doutrinária, compreensão das 24 doutrinas da Declaração de Fé da CGADB e assimilação prática dos princípios éticos de "Obreiro de Valor" do Pr. Abrahão Cipriano.

O candidato aprovado pelo pastor, com as horas de estágio supervisionado cumpridas no templo e nos lares, recebe o testemunho positivo da igreja e está pronto para continuar servindo com excelência no reino de Deus, aguardando no tempo do Senhor sua eventual indicação e consagração ao Santo Diaconato.

Como recorda o autor de Hebreus 6:10: "Porque Deus não é injusto para se esquecer da vossa obra e do trabalho do amor que, para com o seu nome, mostrastes, enquanto servistes aos santos e ainda servis".`,
                    destaqueExegese: 'Axios (ἀξίως): andar e servir de modo digno da vocação com que fomos chamados pelo Senhor (Efésios 4:1).',
                    pontosChave: [
                        'Conclusão satisfatória da fundamentação bíblica e doutrinária',
                        'Aprovação pelo testemunho prático da igreja e do pastor presidente',
                        'Prontidão para novos desafios ministeriais e avanço ao Diaconato',
                        'Fidelidade inquebrantável ao Senhor da Glória até o fim'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Quais são as três dimensões temporais e teológicas da Santa Ceia segundo a Declaração de Fé da CGADB e 1 Coríntios 11:23-26?',
                    opcoes: [
                        'Passado (Memorial da Cruz), Presente (Comunhão dos Santos) e Futuro (Profecia da Segunda Vinda de Cristo até que Ele venha).',
                        'Criação do Mundo, Dilúvio de Noé e Torre de Babel.',
                        'Nascimento de Moisés, Reinado de Davi e Cativeiro Babilônico.',
                        'Revolução Industrial, Idade Média e Século XXI.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'A Santa Ceia aponta para a morte de Jesus no passado, a comunhão do Corpo no presente e a esperança bendita da Sua volta gloriosa no futuro.'
                },
                {
                    pergunta: 'Conforme a obra "Obreiro de Valor" de Abrahão Cipriano, qual deve ser a postura dos oficiais e auxiliares durante o culto e a celebração da Santa Ceia?',
                    opcoes: [
                        'Conversar descontraidamente pelos corredores e utilizar redes sociais.',
                        'Manter profunda reverência, higiene rigorosa na preparação dos elementos, passos sincronizados e oração fervorosa pelo rebanho.',
                        'Interromper a celebração para fazer cobranças financeiras aos membros.',
                        'Impedir que a congregação cante louvores a Deus.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A Santa Ceia exige a mais alta reverência litúrgica, pureza moral, passos discretos e sincronizados e atmosfera de profunda adoração e temor a Deus.'
                }
            ]
        }]
    }
];
