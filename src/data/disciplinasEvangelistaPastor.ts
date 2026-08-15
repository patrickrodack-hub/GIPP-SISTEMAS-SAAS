import { DisciplinaObreiro } from './ModuleFormacaoObreirosData';

export const DISCIPLINAS_EVANGELISTA_PASTOR: DisciplinaObreiro[] = [
    // =========================================================================
    // NÍVEL 4: EVANGELISTA (5 MÓDULOS DE ALTA DENSIDADE MISSIOLÓGICA E APOLOGÉTICA)
    // Alinhamento: Declaração de Fé CGADB/CPAD & Livro "Obreiro de Valor" (Pr. Abrahão Cipriano)
    // =========================================================================
    {
        id: 'ev_01',
        nivelId: 'evangelista',
        titulo: 'Módulo 1: Missiologia Pentecostal, Plantação de Igrejas & Evangelismo Urbano',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Capítulo 19 - O Batismo no Espírito Santo',
        cargaHoraria: 28,
        ementa: 'A teologia bíblica de missões urbanas, nacionais e transculturais. O dinamismo do movimento pentecostal clássico na expansão de fronteiras eclesiásticas. O perfil neotestamentário do evangelista em Efésios 4:11 e Atos 8 (Filipe). Metodologia prática para abertura de novas congregações, cruzadas ao ar livre e evangelismo de massa sem apelo comercial segundo "Obreiro de Valor" (Pr. Abrahão Cipriano).',
        trabalhoSugerido: 'Elaborar um Projeto Estratégico de Plantação de Igreja em um bairro não alcançado, incluindo mapeamento espiritual, plano de cultos em lares (células), cronograma de cruzada evangelística e programa de discipulado de 3 meses.',
        licoes: [{
            id: 'lic_ev_01',
            numero: 1,
            titulo: 'O Fogo Missionário, a Vocação do Evangelista e a Expansão do Reino de Deus',
            introducao: 'O ministério do evangelista é essencialmente dinâmico, itinerante, pioneiro e desbravador. Ele arde pela salvação dos perdidos e pela expansão territorial da Igreja de Jesus Cristo. Como ensina o Pr. Abrahão Cipriano em "Obreiro de Valor", o verdadeiro evangelista não é aquele que busca plateias confortáveis para vender livros ou cobrar cachês exorbitantes, mas o homem comissionado pelo Espírito Santo que desce às periferias, praças e aldeias com a sandália do Evangelho nos pés e lágrimas de compaixão nos olhos pelas almas que caminham para o abismo.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 11 e 19), a Igreja de Deus é por natureza uma comunidade eminentemente missionária. A força motriz da evangelização pentecostal é o revestimento de poder decorrente do Batismo no Espírito Santo (At 1:8), que capacita o crente com autoridade sobrenatural para pregar a mensagem da cruz com sinais que confirmam a Palavra.',
            referenciasBiblicas: ['Atos 1:8', 'Atos 8:4-40', 'Romanos 15:20-21', 'Efésios 4:11-12', 'Mateus 24:14', '2 Timóteo 4:5', 'Marcos 16:15-20'],
            aplicacaoPratica: 'O evangelista deve organizar e liderar cruzadas evangelísticas ao ar livre, pontos de pregação em lares, evangelismo em presídios e hospitais, mobilizar os jovens da congregação para impactos públicos e apoiar ativamente o sustento de missionários transculturais.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Dom Ministerial do Evangelista em Efésios 4:11',
                    conteudo: `Em Efésios 4:11, o apóstolo Paulo afirma que Cristo ressurreto concedeu dons ministeriais específicos à Igreja: "E ele mesmo deu uns para apóstolos, e outros para profetas, e outros para evangelistas, e outros para pastores e doutores".

O termo grego euangelistes (εὐαγγελιστής) refere-se ao mensageiro oficial das Boas-Novas de salvação. Diferente do pastor local que tem a incumbência de apascentar, nutrir e guardar o rebanho fixo, o evangelista é o "pescador em alto mar", dotado de uma unção especial para quebrar a dureza do coração dos pecadores, colher almas em abundância e incendiar a congregação com paixão missionária.

Em "Obreiro de Valor", o Pr. Abrahão Cipriano enfatiza que o evangelista deve manter comunhão e submissão estrita ao pastor da igreja local, jamais agindo como um agente rebelde e independente que divide o rebanho.`,
                    destaqueExegese: 'Euangelistes (εὐαγγελιστής): arauto e proclamador oficial das Boas-Novas da redenção consumada na cruz.',
                    pontosChave: [
                        'Dom ministerial soberano concedido por Cristo ressurreto',
                        'Coração que queima de compaixão pelas almas não salvas',
                        'Colheita espiritual abundante e despertar missionário da igreja',
                        'Submissão e harmonia santa com o pastorado local'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. O Modelo Bíblico de Filipe em Atos dos Apóstolos (Atos 8)',
                    conteudo: `O diácono e evangelista Filipe é o padrão bíblico supremo para todo obreiro evangelista:
1) **Ministério de Massa em Samaria (At 8:5-8)**: Filipe desceu a Samaria e proclamava a Cristo; as multidões ouviam unânimes, os espíritos imundos saíam clamando em alta voz e muitos paralíticos eram curados, enchendo a cidade de grande júbilo;
2) **Sensibilidade e Obediência no Deserto de Gaza (At 8:26-39)**: Sob a ordem de um anjo do Senhor, Filipe deixou o avivamento em Samaria e foi a uma estrada deserta para evangelizar uma única pessoa — o eunuco etíope —, batizando-o nas águas após expor o profeta Isaías.

Como observa Abrahão Cipriano, o evangelista de valor dá o mesmo valor sagrado a um auditório de dez mil pessoas quanto a uma alma solitária no banco de uma praça.`,
                    destaqueExegese: 'Keruxai ton Christon (κηρῦξαι τὸν Χριστόν) em Atos 8:5: proclamar publicamente com autoridade que Jesus é o Messias Salvador.',
                    pontosChave: [
                        'Poder sobrenatural e curas acompanhando a proclamação da cruz',
                        'Prontidão instantânea para obedecer à voz do Espírito Santo',
                        'Evangelismo pessoal minucioso com a Bíblia aberta',
                        'Foco exclusivo na glória de Cristo, sem autopromoção'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. Metodologia Prática para Implantação de Novas Congregações',
                    conteudo: `A plantação de congregações é a estratégia mais eficaz para expandir o Reino de Deus. O evangelista lidera esse processo em 4 etapas:
1) **Mapeamento Espiritual e Intercessão Prévia**: Caminhar pelo bairro-alvo em oração e jejum, identificando fortalezas espirituais e carências sociais;
2) **Pontos de Pregação nos Lares (Cultos Residenciais)**: Abrir a casa de uma família receptiva para reuniões semanais de oração e estudo bíblico simples;
3) **Cruzada de Impacto e Ação Social**: Realizar evento evangelístico com louvor, distribuição de alimentos e atendimento social para acolher a vizinhança;
4) **Discipulado e Consolidação**: Conduzir os decididos às águas do batismo e organizar a congregação com presbíteros e diáconos sob a supervisão da Igreja Sede.`,
                    destaqueExegese: 'Oikodomeo (οἰκοδομέω): edificar, levantar uma casa espiritual firme e alicerçada na rocha.',
                    pontosChave: [
                        'Intercessão estratégica e quebra de barreiras espirituais no bairro',
                        'A força dos cultos domiciliares na atração de vizinhos',
                        'Evangelismo contextualizado e acolhimento dos novos convertidos',
                        'Consolidação estrutural e transição harmoniosa para a liderança pastoral'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. Cruzadas ao Ar Livre, Evangelismo de Rua e Resguardo Ético',
                    conteudo: `As Assembleias de Deus possuem uma tradição gloriosa de cultos ao ar livre em praças públicas, feiras e esquinas movimentadas.

Em "Obreiro de Valor", o Pr. Abrahão Cipriano delineia diretrizes éticas e práticas inegociáveis:
- **Respeito às Leis do Silêncio e Licenciamento Municipal**: Obter autorização da prefeitura e órgãos competentes antes de instalar palanques de som em vias públicas;
- **Mensagem Objetiva e Cristocêntrica**: Em praças públicas, as pessoas estão em trânsito; a mensagem deve ser curta, contundente, bíblica e focada no amor de Cristo e no arrependimento;
- **Proibição de Mercantilismo**: É pecado abominável usar cruzadas evangelísticas para comercializar unções milagrosas, vender "amuletos espirituais" ou explorar a fé do povo pobre;
- **Equipe de Intercessão e Discipulado**: Ter dezenas de conselheiros treinados prontos para acolher cada pessoa que erguer a mão no apelo.`,
                    destaqueExegese: 'Kerygma (κήρυγμα): a proclamação pura e autêntica do Evangelho da graça de Deus.',
                    pontosChave: [
                        'Cruzadas ao ar livre com legalidade e respeito à cidadania',
                        'Pregação contundente focada na expiação da cruz e salvação',
                        'Repúdio total ao comércio da fé e à exploração mercenária',
                        'Equipe de recepção e cadastramento ágil dos novos decididos'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. Missiologia Transcultural e o Sustento aos Campos Missionários',
                    conteudo: `O evangelista é o embaixador do despertamento missionário da igreja local. A Declaração de Fé da CGADB afirma a obrigação solene da Igreja de alcançar os povos não alcançados (Janela 10/40, tribos indígenas e comunidades ribeirinhas).

O obreiro de valor não apenas prega sobre missões, mas:
- Promove a realização de Conferências Missionárias anuais na congregação;
- Ensina e conscientiza os membros sobre a entrega de ofertas missionárias específicas;
- Mantém contato e oração constante pelos missionários enviados ao campo, zelando para que recebam sustento digno e pontual (Fp 4:14-18);
- Desperta vocações entre os jovens para o envio ao seminário teológico e missiológico.`,
                    destaqueExegese: 'Apostello (ἀποστέλλω): enviar com autoridade eissionária e mandato celestial para uma tarefa específica.',
                    pontosChave: [
                        'Compromisso inalienável com a evangelização mundial transcultural',
                        'Sustento financeiro digno e oração fervorosa pelos missionários',
                        'Conferências missionárias para despertar novas gerações',
                        'A urgência da proclamação antes da Segunda Vinda de Cristo'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual a atitude bíblica e ética do evangelista demonstrada por Filipe em Atos 8 e reiterada no livro "Obreiro de Valor"?',
                    opcoes: [
                        'Buscar autopromoção, cobrar taxas por ministração e desprezar os pequenos trabalhos.',
                        'Pregar a Cristo com autoridade, poder e curas, tanto em grandes multidões quanto a uma alma solitária no deserto, com humildade e desapego material.',
                        'Abandonar a sã doutrina para agradar os governantes da cidade.',
                        'Criar um ministério independente sem prestar contas à sua igreja sede.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O evangelista de valor é humilde, guiado pelo Espírito Santo, desapegado de riquezas terrenas e prega a mensagem da cruz onde quer que o Senhor o envie.'
                },
                {
                    pergunta: 'Segundo a Declaração de Fé da CGADB (Capítulo 19) e Atos 1:8, qual a finalidade primordial do Batismo no Espírito Santo?',
                    opcoes: [
                        'Conceder poder e autoridade espiritual aos crentes para testemunharem de Cristo com intrepidez até os confins da terra.',
                        'Tornar o crente superior aos outros membros da igreja.',
                        'Garantir enriquecimento e sucesso empresarial imediato.',
                        'Substituir a necessidade de estudar a Bíblia Sagrada.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'O revestimento de poder do Espírito Santo em Atos 1:8 visa exclusivamente capacitar a Igreja com dinamismo e coragem para a evangelização mundial.'
                }
            ]
        }]
    },
    {
        id: 'ev_02',
        nivelId: 'evangelista',
        titulo: 'Módulo 2: Apologética Bíblica, Heresiologia & Defesa da Sã Doutrina',
        capituloCGADB: 'Capítulo 1 - As Sagradas Escrituras & Capítulo 2 - O Único Deus Verdadeiro',
        cargaHoraria: 28,
        ementa: 'A fundamentação bíblica da defesa da fé cristã em 1 Pedro 3:15 e Judas 1:3 (Apologia). Refutação teológica e exegética das principais seitas e heresias modernas: Testemunhas de Jeová (arianismo contemporâneo), Mormonismo (politeísmo), Espiritismo e Reencarnação (antropologia herética), Unicismo / Jesus Só (modalismo) e Teologia da Prosperidade (antropocentrismo mercenário) segundo a CGADB e "Obreiro de Valor".',
        trabalhoSugerido: 'Elaborar um Manual Apologético de Bolso para Obreiros contendo 10 versículos-chave com exegese para refutar o arianismo e o unicismo no trabalho de evangelização de rua.',
        licoes: [{
            id: 'lic_ev_02',
            numero: 1,
            titulo: 'Batalhando pela Fé dos Santos, a Apologética Bíblica e a Refutação de Seitas',
            introducao: 'Em um mundo marcado pelo relativismo pós-moderno, pelo sincretismo religioso e pelo avanço agressivo de seitas pseudocristãs, o evangelista precisa ser um apologista capacitado. Em 1 Pedro 3:15, o Espírito Santo ordena: "Estai sempre preparados para responder com mansidão e temor a qualquer que vos pedir a razão da esperança que há em vós". Como ensina o Pr. Abrahão Cipriano em "Obreiro de Valor", o obreiro que não sabe refutar a mentira não tem condições de firmar os novos decididos na verdade eterna de Deus.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 1 e 2), as doutrinas da Inerrância Bíblica, da Santíssima Trindade, da Plena Deidade e Humanidade de Cristo, da Salvação Exclusiva pela Graça mediante a Fé e da Morte Única seguida de Juízo (Hb 9:27) são inegociáveis e formam o cânon da ortodoxia cristã.',
            referenciasBiblicas: ['1 Pedro 3:15', 'Judas 1:3-4', '2 Coríntios 10:4-5', 'Tito 1:9-11', 'Gálatas 1:6-9', 'Hebreus 9:27', '2 João 1:9-11'],
            aplicacaoPratica: 'O evangelista deve utilizar argumentos bíblicos claros e exegéticos ao ser abordado por adeptos de seitas nas ruas e lares, dialogando com mansidão e respeito, sem perder a firmeza e refutando os erros dogmáticos com o texto original da Palavra de Deus.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Mandato da Apologética Bíblica em 1 Pedro 3:15 e Judas 3',
                    conteudo: `O termo grego apologia (ἀπολογία) não significa pedir desculpas, mas apresentar uma defesa fundamentada, articulada e lógica perante um tribunal ou auditório.

As Escrituras exigem duas atitudes inseparáveis na prática apologética:
1) **Prontidão Intelectual e Teológica**: Estar sempre preparado com argumentos bíblicos sólidos;
2) **Postura Moral e Mansidão (Prautes kai Phobos)**: Defender a verdade com mansidão, humildade e temor reverente a Deus, sem arrogância pessoal, agressividade ou ofensas que fecham as portas do coração do interlocutor.

Em Judas 1:3, somos intimados a "batalhar com afinco pela fé que uma vez foi entregue aos santos", protegendo o Evangelho contra deturpações heréticas.`,
                    destaqueExegese: 'Apologia (ἀπολογία): defesa racional e jurídica consistente da verdade do Evangelho.',
                    pontosChave: [
                        'O dever cristão de apresentar a razão da esperança com clareza',
                        'A mansidão e o amor fraternal como armas da persuasão espiritual',
                        'A batalha pela fé pura entregue uma vez por todas no cânon bíblico',
                        'Rejeição da soberba acadêmica e do espírito de contenda vazia'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. Refutação ao Arianismo Moderno (Testemunhas de Jeová)',
                    conteudo: `A seita fundada por Charles Taze Russell revive a antiga heresia de Ário (século IV), negando a deidade de Jesus Cristo e afirmando que Ele é uma criatura (o arcanjo Miguel) e que o Espírito Santo é uma força impessoal.

**Refutação Bíblica e Exegética da CGADB**:
- Em João 1:1, o texto grego declara: "kai Theos en ho Logos" (e o Verbo era Deus), atestando a deidade plena do Filho;
- Em João 20:28, Tomé confessa Jesus como "Meu Senhor e meu Deus" (Ho Kyrios mou kai ho Theos mou), confissão aceita e elogiada por Jesus;
- Em Isaías 9:6, o Messias prometido é chamado de "Deus Forte, Pai da Eternidade, Príncipe da Paz";
- Em Colossenses 2:9, Paulo assevera que em Cristo habita corporalmente toda a plenitude da divindade.`,
                    destaqueExegese: 'Theos en ho Logos (Θεὸς ἦν ὁ Λόγος): o Verbo possuía a mesma substância e natureza divina que o Pai desde a eternidade.',
                    pontosChave: [
                        'Jesus Cristo é o Deus Todo-Poderoso eterno e incriado (Ap 1:8)',
                        'O Espírito Santo é a Terceira Pessoa Divina e não uma energia cósmica',
                        'Ressurreição física corpórea de Cristo com Seu corpo imortal',
                        'A salvação pela graça através da fé, sem méritos humanos'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. Refutação ao Espiritismo, Reencarnacionismo e Necromancia',
                    conteudo: `A doutrina espírita codificada por Allan Kardec ensina a reencarnação sucessiva das almas para autoevolução moral, a comunicação com espíritos dos mortos (necromancia) e a negação da expiação substitutiva de Cristo na cruz.

**Refutação Bíblica da CGADB**:
- **A Morte Única**: Hebreus 9:27 afirma categoricamente: "E, como aos homens está ordenado morrerem uma só vez, vindo, depois disso, o juízo";
- **A Proibição da Consulta aos Mortos**: Deuteronômio 18:10-12 declara abominação ao Senhor a consulta a adivinhos, necromantes ou espíritos de mortos;
- **A Parábola do Rico e Lázaro (Lc 16:19-31)**: Jesus revela que após a morte não há reencarnação nem retorno à terra, mas fixação imediata do destino eterno no céu (consolo) ou no inferno (tormento).`,
                    destaqueExegese: 'Hapax apothanein (ἅπαξ ἀποθανεῖν) em Hebreus 9:27: morrer uma única e irrepetível vez.',
                    pontosChave: [
                        'Morte única seguida irrevogavelmente do Juízo Divino',
                        'Rejeição absoluta de qualquer reencarnação ou evolução pós-morte',
                        'As supostas comunicações mediúnicas como manifestações de demônios enganadores (2 Co 11:14)',
                        'A expiação vicária de Cristo como único caminho de reconciliação'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. Refutação à Teologia da Prosperidade e ao Mercantilismo Gospel',
                    conteudo: `Nas últimas décadas, proliferou nos meios neopentecostais a chamada "Teologia da Prosperidade" (Confissão Positiva / Evangelho da Ganância), que ensina que o crente nunca deve adoecer ou passar por necessidades financeiras, e que Deus é obrigado a enriquecer quem fizer "pactos financeiros" e "doações de sacrifício".

Em "Obreiro de Valor", o Pr. Abrahão Cipriano denuncia com santa indignação esse mercantilismo profano:
- Reduz o Deus Soberano a um servo obediente aos decretos humanos;
- Transforma a fé salvadora em uma ferramenta egoísta de barganha material;
- Despreza a teologia bíblica do sofrimento e da cruz (Fp 1:29; 2 Tm 3:12; 2 Co 12:7-10);
- O apóstolo Paulo adverte em 1 Timóteo 6:9-10 que "o amor ao dinheiro é a raiz de toda a espécie de males".`,
                    destaqueExegese: 'Aischrokerdeia (αἰσχροκέρδεια): ganância torpe e vergonhosa que comercializa as coisas sagradas de Deus.',
                    pontosChave: [
                        'O Evangelho é salvação do pecado e vida eterna, não comércio mundano',
                        'A soberania absoluta de Deus sobre as circunstâncias terrenas',
                        'O valor do contentamento cristão e da fidelidade na escassez (Fp 4:11-13)',
                        'Condenação apostólica dos falsos mestres que fazem dos crentes mercadoria (2 Pe 2:3)'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. O Resgate Amoroso dos Cativos pelo Poder da Palavra e Oração',
                    conteudo: `O propósito supremo da Apologética Pentecostal não é humilhar intelectualmente os membros de seitas, vencer debates acadêmicos de forma soberba ou destruir o interlocutor, mas resgatar almas preciosas cegadas pelo deus deste século (2 Co 4:4).

Em 2 Timóteo 2:24-26, Paulo resume o espírito do obreiro de valor: "E ao servo do Senhor não convém contender, mas, sim, ser manso para com todos, apto para ensinar, sofredor; instruindo com mansidão os que resistem, a ver se, porventura, Deus lhes dará arrependimento para conhecerem a verdade e tornarem a despertar, desvencilhando-se dos laços do diabo".

O evangelista alia a fundamentação doutrinária com o clamor intercessório de joelhos dobrados.`,
                    destaqueExegese: 'Ananephosin (ἀνανήψωσιν) em 2 Timóteo 2:26: recobrar os sentidos, despertar da embriaguez do erro espiritual para a sobriedade da verdade.',
                    pontosChave: [
                        'Amor genuíno e compaixão pelas pessoas enganadas pelas seitas',
                        'Oração de libertação e quebra da cegueira espiritual',
                        'Instrução bíblica paciente e acolhimento dos que renunciam ao erro',
                        'Glorificação exclusiva a Cristo Jesus, o Caminho, a Verdade e a Vida'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Como a Declaração de Fé da CGADB e Hebreus 9:27 refutam a doutrina da reencarnação ensinada pelo espiritismo?',
                    opcoes: [
                        'Afirmando que o homem vive várias vidas na terra até se tornar perfeito.',
                        'Ensinando que ao homem está ordenado morrer uma só vez, seguindo-se o juízo de Deus, não havendo reencarnação ou retorno à terra.',
                        'Aceitando a reencarnação como uma metáfora bíblica válida.',
                        'Dizendo que apenas pessoas ricas não reencarnam.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A Bíblia ensina a singularidade da vida biológica humana e a definitividade do destino eterno estabelecido após a morte única.'
                },
                {
                    pergunta: 'Segundo o livro "Obreiro de Valor" de Abrahão Cipriano e 1 Timóteo 6:9-10, por que a Teologia da Prosperidade é considerada um desvio herético?',
                    opcoes: [
                        'Porque ensina que a fé cristã é um instrumento de ganância material e barganha financeira com Deus, desprezando a cruz e a soberania divina.',
                        'Porque incentiva a leitura regular da Bíblia Sagrada.',
                        'Porque ensina a fidelidade nos dízimos e ofertas generosas.',
                        'Porque proíbe as pessoas de trabalharem honestamente.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'A teologia da prosperidade distorce o Evangelho da graça em mercantilismo antropocêntrico que busca riquezas terrenas em vez da santificação e do Reino de Deus.'
                }
            ]
        }]
    },
    {
        id: 'ev_03',
        nivelId: 'evangelista',
        titulo: 'Módulo 3: O Ministério Itinerante, Avivamento Pentecostal & Cruzadas de Milagres',
        capituloCGADB: 'Capítulo 19 - O Batismo no Espírito Santo & Capítulo 20 - Os Dons Espirituais',
        cargaHoraria: 28,
        ementa: 'A dinâmica e os desafios espirituais do ministério itinerante do evangelista. A preservação da família, a administração do tempo e a honra pastoral nas igrejas anfitriãs. O clamor por avivamento genuíno que gera quebrantamento, salvação e curas sobrenaturais sem apelos emocionais baratos conforme "Obreiro de Valor" (Pr. Abrahão Cipriano).',
        trabalhoSugerido: 'Elaborar um Roteiro de Cruzada Evangelística de 3 Noites com plano de oração matutina, esboço de sermões cristocêntricos e protocolo de encaminhamento de decisões para as congregações locais.',
        licoes: [{
            id: 'lic_ev_03',
            numero: 1,
            titulo: 'O Avivamento Genuíno, a Intrepidez no Púlpito e a Ética na Itinerância',
            introducao: 'O evangelista itinerante é convocado para ministrar em dezenas de campos, congregações e convenções. Contudo, a itinerância ministerial traz grandes perigos morais e espirituais: a solidão nas viagens, o risco da vaidade diante dos aplausos e a negligência da própria família. Como adverte solenemente o Pr. Abrahão Cipriano em "Obreiro de Valor", o verdadeiro avivalista pentecostal não é um artista gospel que busca fama ou cachês, mas uma tocha viva de Deus que incendeia as igrejas com a Palavra e o fogo do Espírito, mantendo pureza moral inquestionável.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 19 e 20), o verdadeiro avivamento operado pelo Espírito Santo produz arrependimento profundo de pecados, restauração da comunhão fraterna, fome da Palavra de Deus e poderosa operação dos dons espirituais para a glorificação exclusiva de Jesus Cristo.',
            referenciasBiblicas: ['Habacuque 3:2', 'Salmo 85:6', 'Atos 4:29-31', '1 Coríntios 9:16-18', '2 Coríntios 11:23-28', 'Atos 19:11-12'],
            aplicacaoPratica: 'O evangelista itinerante deve honrar os pastores das igrejas que o recebem, nunca exigir exigências financeiras extravagantes, manter contato diário com sua esposa e filhos durante viagens e pregar o Evangelho com paixão e lágrimas.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Natureza Bíblica do Avivamento Pentecostal Genuíno',
                    conteudo: `O profeta Habacuque orou no século VII a.C.: "Ouvi, Senhor, a tua palavra e temi; aviva, ó Senhor, a tua obra no meio dos anos, no meio dos anos a notifica; na ira lembra-te da misericórdia" (Hc 3:2).

O avivamento espiritual bíblico não se resume a movimentos exteriores barulhentos ou agitações corporais passageiras. Ele caracteriza-se por:
1) **Quebrantamento e Abandono do Pecado**: Choro sincero de arrependimento e restituição de danos morais;
2) **Restauração do Amor pela Bíblia**: Retorno entusiasmado à leitura devocional e às classes de EBD;
3) **Salvação em Massa de Pecadores**: Vidas transformadas que abandonam o vício, o crime e a feitiçaria;
4) **Multiplicação das Vocações Missionárias**: Jovens e obreiros consagrando-se integralmente para a Seara do Mestre.`,
                    destaqueExegese: 'Chayah (חָיָה) em Hc 3:2: reviver, restaurar à vida o que estava morto ou desfalecido pelo desânimo.',
                    pontosChave: [
                        'Avivamento como obra soberana do Espírito Santo na história',
                        'Arrependimento profundo de pecados como marca indispensável',
                        'Amor apaixonado pela oração e pela exposição bíblica',
                        'Impacto transformador na sociedade e na congregação'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. Ética na Itinerância e Relacionamento com os Pastores Locais',
                    conteudo: `Em "Obreiro de Valor", o Pr. Abrahão Cipriano instrui com rigor o evangelista sobre sua conduta ao visitar outras igrejas:
- **Respeito Absoluto à Autoridade do Pastor Anfitrião**: O evangelista é um hóspede espiritual; jamais deve desafiar as diretrizes litúrgicas da congregação anfitriã ou emitir opiniões sobre a administração local;
- **Proibição de Cobrança de Cachês**: Pregar o Evangelho não é comércio de shows. O evangelista deve receber a oferta voluntária de amor que a igreja lhe conceder com gratidão e humildade (1 Co 9:18), sem estipular tabelas financeiras constrangedoras;
- **Pontualidade e Conduta no Púlpito**: Respeitar rigorosamente o horário determinado pelo dirigente do culto e não usar o microfone para promoções comerciais particulares.`,
                    destaqueExegese: 'Adapanon theso to euangelion (ἀδάπανον θήσω τὸ εὐαγγέλιον) em 1 Co 9:18: pregar o Evangelho gratuitamente, sem ser pesado a ninguém.',
                    pontosChave: [
                        'Honra e respeito incondicional à liderança pastoral local',
                        'Rejeição irrevogável da mercantilização e cobrança de cachês gospel',
                        'Humildade de servo em todas as ministrações públicas',
                        'Edificação da igreja anfitriã com o pão puro da Palavra'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. A Guarda da Família e a Vigilância Moral nas Viagens',
                    conteudo: `O ministério itinerante afasta temporariamente o obreiro de sua residência, expondo-o a perigosas ciladas morais: hotéis isolados, solidão afetiva e assédio de admiradores eufóricos.

Abrahão Cipriano estabelece muralhas de proteção:
1) **Comunicação Contínua**: Falar diariamente com a esposa e os filhos por telefone ou vídeo, prestando contas de sua rotina e localização;
2) **Fuga da Solidão Perigosa**: Evitar jantares a sós com pessoas do sexo oposto e recusar caronas privadas desacompanhado;
3) **Prioridade do Lar**: O evangelista não deve passar meses consecutivos longe de casa. O pastoreio e o amor à sua própria família precedem qualquer agenda de viagens externas (1 Tm 3:4-5).`,
                    destaqueExegese: 'Phyge ten porneian (φεῦγε τὴν πορνείαν) em 1 Co 6:18: fugir ativamente da imoralidade sexual como José fugiu da mulher de Potifar.',
                    pontosChave: [
                        'Prestação de contas diária e comunhão estreita com a esposa',
                        'Prudência moral extrema em hotéis e transportes em viagens',
                        'Equilíbrio entre a agenda itinerante e o cuidado com os filhos',
                        'A santidade como escudo protetor do ministério de Deus'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. A Operação de Sinais, Prodígios e Curas nas Cruzadas',
                    conteudo: `Em Romanos 15:18-19, o apóstolo Paulo testemunha que Cristo operou através dele "por palavras e por obras, pelo poder dos sinais e prodígios, no poder do Espírito de Deus".

O evangelista pentecostal crê na atualidade dos milagres físicos, curas de cegos, restauração de paralíticos e libertação de espíritos malignos durante a pregação da Palavra.

Contudo, como alerta "Obreiro de Valor", os milagres não são o fim em si mesmos, mas placas de sinalização que apontam para o Salvador Jesus Cristo. O pregador nunca deve atribuir o poder à sua pessoa, nem criar teatralizações artificiais ou manipular enfermos com encenações fraudulentas que envergonham o Santo Nome de Deus.`,
                    destaqueExegese: 'Semeia kai terata (σημεῖα καὶ τέρατα): sinais miraculosos e maravilhas concedidos por Deus para autenticar a mensagem do Evangelho.',
                    pontosChave: [
                        'Fé viva na operação contemporânea de milagres e curas',
                        'Rejeição total de teatralizações, fraudes e sensacionalismo',
                        'Toda a glória e honra direcionadas exclusivamente a Jesus Cristo',
                        'O milagre supremo: a regeneração e salvação da alma do pecador'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. O Encaminhamento e a Consolidação dos Frutos nas Igrejas Locais',
                    conteudo: `O ministério do evangelista atinge seu propósito quando as almas decididas são imediatamente integradas no rebanho local:
- Ao término do apelo, os decididos devem ser conduzidos à sala de aconselhamento onde conselheiros locais preenchem suas fichas e oram com eles;
- O evangelista entrega todas as fichas de decisão diretamente nas mãos do pastor local e dos professores de novos convertidos da congregação;
- Assegura-se que a colheita seja devidamente alimentada com o ensino da Palavra e acompanhada até o Batismo nas Águas.

O evangelista de valor é aquele cujo fruto permanece e glorifica o Pai que está nos céus (Jo 15:8, 16).`,
                    destaqueExegese: 'Synago (συνάγω): recolher a colheita e reuni-la com segurança no celeiro de Deus (a igreja local).',
                    pontosChave: [
                        'Trabalho articulado entre o evangelista e a equipe local de discipulado',
                        'Preenchimento meticuloso de fichas cadastrais e oração pastoral imediata',
                        'Integração dos novos crentes nas classes de EBD e cultos de doutrina',
                        'Frutos duradouros que resistem ao teste do tempo'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Segundo as diretrizes de ética e conduta ministerial de "Obreiro de Valor" de Abrahão Cipriano, como o evangelista itinerante deve conduzir suas viagens e finanças?',
                    opcoes: [
                        'Exigir antecipadamente cachês milionários e hospedagem de luxo.',
                        'Honrar o pastor anfitrião, respeitar o tempo litúrgico, receber com gratidão a oferta de amor voluntária sem fixar tabelas comerciais e manter vigilância moral no lar.',
                        'Criticar publicamente a denominação que o convidou durante a mensagem.',
                        'Abandonar o contato com a própria família durante as viagens.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O evangelista de valor serve com desapego material, integridade no lar, respeito à liderança anfitriã e total temor de Deus.'
                },
                {
                    pergunta: 'Qual a principal evidência do verdadeiro avivamento bíblico segundo a Declaração de Fé da CGADB?',
                    opcoes: [
                        'Apenas barulho e desordem litúrgica sem conversão.',
                        'Arrependimento profundo de pecados, restauração moral, fome da Palavra de Deus, salvação de almas e operação de dons espirituais com santidade.',
                        'Aumento dos lucros da tesouraria através de vendas de amuletos.',
                        'A proibição de cultos de oração.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O autêntico avivamento pentecostal transforma vidas pelo poder do Espírito Santo, gerando santidade e adoração cristocêntrica.'
                }
            ]
        }]
    },
    {
        id: 'ev_04',
        nivelId: 'evangelista',
        titulo: 'Módulo 4: Aconselhamento Evangelístico, Dependência Química & Capelania Carcerária',
        capituloCGADB: 'Capítulo 10 - A Salvação & Capítulo 11 - A Igreja de Deus',
        cargaHoraria: 28,
        ementa: 'O acolhimento e a abordagem pastoral aos marginalizados da sociedade: moradores de rua, dependentes químicos, encarcerados e jovens em conflito com a lei. Protocolo de capelania prisional e visitação a presídios. A criação e o suporte a centros de recuperação cristãos (Desafio Jovem). A ética do resgate de almas segundo "Obreiro de Valor".',
        trabalhoSugerido: 'Elaborar um Plano de Ação para Capelania Prisional e Resgate de Dependentes Químicos, com etapas de desintoxicação espiritual, apoio familiar e reinserção social e eclesiástica.',
        licoes: [{
            id: 'lic_ev_04',
            numero: 1,
            titulo: 'O Resgate dos Marginalizados, a Capelania Prisional e a Libertação em Cristo',
            introducao: 'O Evangelho de Cristo é o poder de Deus para a salvação de todo aquele que crê (Rm 1:16), capaz de resgatar o pecador do mais profundo poço da degradação moral e do crime. O evangelista é o mensageiro da misericórdia que penetra nas prisões, cracolândias e favelas para proclamar libertação aos cativos (Lc 4:18). Como ensina o Pr. Abrahão Cipriano em "Obreiro de Valor", o obreiro que tem nojo do marginalizado não conhece o coração de Jesus, que Se assentou à mesa com publicanos e pecadores para salvá-los.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 10 e 11), a salvação em Cristo é universalmente acessível e opera a regeneração total do homem mais vil, transformando o criminoso em cidadão do Reino e nova criatura (2 Co 5:17). A Igreja tem a obrigação sagrada de visitar os encarcerados (Mt 25:36).',
            referenciasBiblicas: ['Lucas 4:18-19', 'Mateus 25:36-40', 'Hebreus 13:3', '2 Coríntios 5:17', 'Salmo 107:10-16', 'Lucas 15:1-7', 'João 8:36'],
            aplicacaoPratica: 'O evangelista deve obter credenciamento legal junto às secretarias de administração penitenciária, visitar pavilhões carcerários com folhetos e bíblias, apoiar centros de recuperação cristãos de dependentes químicos e acompanhar a reinserção social de ex-detentos na igreja.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Teologia da Libertação dos Cativos em Lucas 4:18-19',
                    conteudo: `Na sinagoga de Nazaré, o Senhor Jesus Cristo inaugurou Seu ministério público lendo o profeta Isaías: "O Espírito do Senhor é sobre mim, pois que me ungiu para evangelizar os pobres. Enviou-me a curar os quebrantados do coração, a pregar redenção aos cativos, e restauração da vista aos cegos, a pôr em liberdade os oprimidos, a anunciar o ano aceitável do Senhor" (Lc 4:18-19).

O evangelista pentecostal herda essa unção profética de misericórdia. O mundo descarta o viciado em drogas e o encarcerado como escória irrecuperável; o Evangelho, contudo, enxerga neles almas pelas quais o sangue precioso de Cristo foi vertido no Gólgota.

Em "Obreiro de Valor", ensina-se que não existe caso perdido para o poder do Nome de Jesus.`,
                    destaqueExegese: 'Aphesin (ἄφεσιν) em Lc 4:18: soltura, libertação completa da prisão da culpa e do pecado, remissão total.',
                    pontosChave: [
                        'O mandato de Cristo em favor dos oprimidos e encarcerados',
                        'O poder transformador da regeneração operada pelo Espírito Santo',
                        'A rejeição ao preconceito e à indiferença social farisaica',
                        'O amor incondicional que estende as mãos aos caídos'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. Protocolo Ético e Jurídico de Capelania Prisional',
                    conteudo: `A atuação em presídios e penitenciárias de segurança máxima exige que o obreiro combine zelo evangelístico com rigoroso cumprimento das normas estatais:
- **Credenciamento Oficial**: Obter autorização prévia da Direção do Presídio e da Secretaria de Segurança Pública;
- **Respeito Estrito às Normas de Segurança**: Não ingressar com celulares, armas, ferramentas ou objetos proibidos nos pavilhões carcerários;
- **Proibição de Leva e Traz**: O evangelista nunca deve aceitar transportar cartas, recados ou dinheiro de detentos para o exterior e vice-versa, mantendo foco exclusivo na ministração espiritual;
- **Mensagem de Esperança e Arrependimento**: Pregar a Cristo crucificado, o perdão dos pecados e a reconciliação com Deus e com as famílias ofendidas.`,
                    destaqueExegese: 'Mymneskesthe ton desmion (μιμνῄσκεσθε τῶν δεσμίων) em Hb 13:3: "Lembrai-vos dos presos, como se estivésseis presos com eles".',
                    pontosChave: [
                        'Cumprimento rigoroso dos protocolos de segurança dos presídios',
                        'Neutralidade absoluta: nenhuma intermediação de mensagens ilegais',
                        'Distribuição de Bíblias, Novos Testamentos e folhetos de estudo',
                        'Cultos carcerários marcados por oração, lágrimas e batismos'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. Acolhimento e Recuperação de Dependentes Químicos (Centros de Recuperação)',
                    conteudo: `O avanço das drogas sintéticas e do crack destrói lares inteiros. As Assembleias de Deus foram pioneiras no Brasil com o trabalho de comunidades terapêuticas cristãs (como o Desafio Jovem).

Em "Obreiro de Valor", o Pr. Abrahão Cipriano destaca o tripé da recuperação cristã:
1) **Tratamento Espiritual (Jesusoterapia)**: Oração diária, estudo bíblico metódico, louvor e quebra das cadeias de dependência pelo poder do Espírito Santo;
2) **Laborterapia e Disciplina**: Trabalho manual produtivo, hortas, oficinas profissionalizantes e rotina diária saudável que restauram a dignidade do trabalho;
3) **Apoio Psicológico e Médico**: Parcerias com médicos, psiquiatras e assistentes sociais para desintoxicação física segura.`,
                    destaqueExegese: 'Eleutheria (ἐλευθερία) em João 8:36: "Se o Filho vos libertar, verdadeiramente sereis livres".',
                    pontosChave: [
                        'Oração e desintoxicação espiritual no poder de Cristo',
                        'Laborterapia e reconstrução do senso de responsabilidade e trabalho',
                        'Apoio multiprofissional médico e respeito aos direitos humanos',
                        'Restauração completa da dignidade do ex-dependente'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. A Reintegração Social, Familiar e Eclesiástica do Convertido',
                    conteudo: `A prova do sucesso do trabalho de resgate é a reinserção do novo convertido na sociedade e na congregação local:
- **Restauração Familiar**: Promover o perdão e a reconciliação entre o ex-detento e seus pais, esposa e filhos;
- **Acolhimento Caloroso na Igreja**: A congregação local deve receber o irmão sem desconfianças farisaicas ou olhares de reprovação, integrando-o nas classes de discipulado e nas atividades de serviço diaconal;
- **Capacitação Profissional e Emprego**: Ajudar o irmão a obter recolocação profissional honesta no mercado de trabalho.`,
                    destaqueExegese: 'Kaine ktisis (καινὴ κτίσις) em 2 Co 5:17: nova criação; as coisas velhas já passaram; eis que tudo se fez novo.',
                    pontosChave: [
                        'Reconciliação e restauração dos vínculos afetivos familiares',
                        'Acolhimento fraterno e sem preconceito na congregação',
                        'Apoio prático para obtenção de trabalho digno e honesto',
                        'O testemunho vivo da graça transformadora do Senhor'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. A Síntese do Ministério do Evangelista e o Preparo Pastoral',
                    conteudo: `Ao concluir os 5 módulos da Formação de Evangelistas da Universidade Teológica GIPP, o obreiro comprova maturidade doutrinária perante a CGADB, zelo missionário inabalável, conduta moral ilibada e domínio prático das ferramentas de proclamação do Evangelho.

Com as horas de estágio cumpridas em cruzadas, presídios e cultos ao ar livre, o evangelista recebe a credencial de ministro do Evangelho e está capacitado para exercer com honra e autoridade seu ofício profético no Corpo de Cristo.

Como exorta Paulo em 2 Timóteo 4:5: "Tu, porém, sê sóbrio em tudo, sofre as aflições, faze a obra de um evangelista, cumpre o teu ministério".`,
                    destaqueExegese: 'Plerophoreson ten diakonian sou (πληροφόρησον τὴν διακονίαν σου): cumpre cabalmente, plenamente e com perfeição o teu ministério sagrado.',
                    pontosChave: [
                        'Conclusão com excelência da formação teórico-prática de evangelista',
                        'Compromisso perpétuo com a colheita de almas para o Reino',
                        'Reconhecimento e ordenação pelas Convenções Estaduais e CGADB',
                        'A expectativa da coroa de glória na volta do Senhor Jesus'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Segundo a recomendação ética e jurídica de capelania prisional no livro "Obreiro de Valor", como o evangelista deve proceder dentro dos presídios?',
                    opcoes: [
                        'Entrar com celulares e transportar cartas e encomendas sigilosas dos detentos para fora.',
                        'Cumprir rigorosamente os protocolos de segurança oficiais, respeitar as autoridades penitenciárias, não fazer leva e traz de mensagens materiais e pregar exclusivamente a Palavra de Deus.',
                        'Incentivar motins contra a administração carcerária.',
                        'Cobrar dinheiro dos familiares dos presos para fazer orações.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A capelania carcerária exige respeito às leis, lisura moral inabalável e foco estritamente espiritual no perdão e na salvação em Cristo.'
                },
                {
                    pergunta: 'Qual o fundamento teológico central para acolher ex-dependentes químicos e ex-detentos na igreja local (2 Coríntios 5:17)?',
                    opcoes: [
                        'Que eles devem permanecer isolados para sempre sem participar da comunhão.',
                        'Que em Cristo qualquer pecador regenerado torna-se uma nova criação (kaine ktisis), cujas coisas velhas passaram e tudo se fez novo pelo poder da graça.',
                        'Que a igreja só aceita pessoas que nunca cometeram erros civis no passado.',
                        'Que a salvação depende do histórico policial da pessoa.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A regeneração pelo Espírito Santo transforma radicalmente o pecador, fazendo dele nova criatura e membro honrado do Corpo de Cristo.'
                }
            ]
        }]
    },
    {
        id: 'ev_05',
        nivelId: 'evangelista',
        titulo: 'Módulo 5: Teologia da Cura Divina, Batalha Espiritual & Libertação',
        capituloCGADB: 'Capítulo 21 - A Cura Divina & Capítulo 6 - O Espírito Santo',
        cargaHoraria: 28,
        ementa: 'A doutrina bíblica da Cura Divina na expiação vicária de Cristo (Isaías 53:4-5; Mateus 8:16-17). A autoridade do Nome de Jesus na expulsão de demônios e libertação de oprimidos espirituais. A Batalha Espiritual segundo a armadura de Deus (Efésios 6:10-18) contra os modismos antibíblicos contemporâneos (quebra de maldições hereditárias, mapeamento místico). A unção dos enfermos com óleo segundo Tiago 5 e "Obreiro de Valor".',
        trabalhoSugerido: 'Elaborar uma monografia teológica de 4 páginas analisando a base expiatória da Cura Divina em Isaías 53 e refutando as heresias da Batalha Espiritual Neopentecostal à luz da Declaração de Fé da CGADB.',
        licoes: [{
            id: 'lic_ev_05',
            numero: 1,
            titulo: 'O Nome de Jesus, a Autoridade sobre as Trevas e a Promessa da Cura Divina',
            introducao: 'O pentecostalismo clássico das Assembleias de Deus sempre creu e experimentou a manifestação do poder de Deus na cura de enfermidades físicas e na libertação de almas aprisionadas pelas forças demoníacas. Como ensina com autoridade o Pr. Abrahão Cipriano em "Obreiro de Valor", a autoridade do obreiro não provém de gritos teatrais, rituais mágicos ou fórmulas humanas, mas de uma vida de oração, jejum, santidade de caráter e fé inabalável no Nome de Jesus Cristo, diante de Quem todo joelho deve se dobrar.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 21), a Cura Divina foi provida na expiação de Cristo no Calvário e continua contemporânea e operante pela ação do Espírito Santo em resposta à oração da fé. Cremos que Jesus Cristo outorgou à Sua Igreja autoridade espiritual para repreender espíritos malignos em Seu Nome (Mc 16:17-18; Lc 10:19).',
            referenciasBiblicas: ['Isaías 53:4-5', 'Mateus 8:16-17', 'Marcos 16:17-18', 'Lucas 10:19', 'Efésios 6:10-18', 'Tiago 5:14-16', '1 Pedro 2:24'],
            aplicacaoPratica: 'O evangelista deve orar com intrepidez e fé pelos enfermos nos cultos, hospitais e lares, ministrar libertação com serenidade e autoridade sem espetacularização, e vestir diariamente a armadura de Deus em oração e vigilância.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Base Expiatória da Cura Divina em Isaías 53:4-5 e Mateus 8:17',
                    conteudo: `O profeta Isaías contemplou no Espírito a obra vicária do Servo do Senhor: "Verdadeiramente, ele tomou sobre si as nossas enfermidades e as nossas dores levou sobre si... e pelas suas pisaduras fomos sarados" (Is 53:4-5).

O Espírito Santo inspirou o apóstolo Mateus a aplicar esse texto profético diretamente às curas físicas operadas por Cristo em Seu ministério terreno: "Para que se cumprisse o que fora dito pelo profeta Isaías, que diz: Ele tomou sobre si as nossas enfermidades e levou as nossas doenças" (Mt 8:17).

A salvação providenciada em Cristo é integral: alcança o espírito, a alma e o corpo do homem. Embora a plenitude da redenção física ocorra na ressurreição no Arrebatamento, o crente desfruta das bênçãos da cura divina no tempo presente como penhor da vitória da cruz.`,
                    destaqueExegese: 'Nasa kai sabal (נָשָׂא / סָבַל) em Isaías 53:4: carregar e suportar sacrificialmente o fardo alheio, expiando na própria carne.',
                    pontosChave: [
                        'A cura física como benefício providenciado no Calvário',
                        'Aplicação neotestamentária inspirada e inequívoca em Mateus 8:17',
                        'Salvação integral do ser humano: espírito, alma e corpo',
                        'A soberania de Deus que cura conforme a Sua perfeita vontade'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. A Autoridade do Nome de Jesus sobre as Potestades das Trevas',
                    conteudo: `Na Grande Comissão de Marcos 16:17, o Senhor asseverou: "E estes sinais seguirão aos que crerem: Em meu nome expulsarão os demônios; falarão novas línguas". Em Lucas 10:19, Ele declara: "Eis que vos dou poder para pisar serpentes, e escorpiões, e toda a força do Inimigo, e nada vos fará dano algum".

A autoridade espiritual outorgada por Jesus é real e sobrenatural:
- O obreiro não negocia com espíritos malignos nem realiza entrevistas sensacionalistas com demônios para satisfazer curiosidades públicas;
- O obreiro de valor repreende o espírito das trevas no Nome de Jesus com ordem firme, autoridade serena e em oração, ordenando que saia sem machucar a pessoa;
- Após a libertação, ministra a Palavra e conduz a pessoa aos braços de Cristo para que a casa espiritual permaneça cheia do Espírito Santo (Mt 12:43-45).`,
                    destaqueExegese: 'Exousia (ἐξουσία) em Lucas 10:19: autoridade delegada legal e soberana por Cristo para governar e vencer o reino das trevas.',
                    pontosChave: [
                        'Autoridade real delegada por Cristo a todos os santos',
                        'Proibição de diálogos e espetáculos circenses com demônios',
                        'Ordem firme de libertação respaldada no Nome de Jesus',
                        'Necessidade urgente de preencher o libertado com o Espírito e a Palavra'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. A Armadura de Deus e a Batalha Espiritual Bíblica (Efésios 6:10-18)',
                    conteudo: `O apóstolo Paulo adverte a igreja em Efésios 6:12: "Porque não temos que lutar contra a carne e o sangue, mas, sim, contra os principados, contra as potestades, contra os príncipes das trevas deste século, contra as hostes espirituais da maldade, nos lugares celestiais".

A batalha espiritual bíblica não se trava com objetos mágicos, amuletos, rosas ungidas ou sal grosso (práticas sincretistas abomináveis), mas com a Armadura Espiritual de Deus:
1) **Cinto da Verdade**: Vida íntegra e sem hipocrisia;
2) **Couraça da Justiça**: Justificação e retidão moral de conduta;
3) **Calçado do Evangelho da Paz**: Prontidão constante para anunciar a reconciliação;
4) **Escudo da Fé**: Para apagar todos os dardos inflamados do maligno;
5) **Capacete da Salvação**: Proteção da mente com a certeza da vida eterna;
6) **Espada do Espírito**: A Palavra viva de Deus na boca do crente;
7) **Oração Contínua no Espírito**: Intercessão incessante pelos santos.`,
                    destaqueExegese: 'Panoplia tou Theou (πανοπλία τοῦ Θεοῦ): a armadura defensiva e ofensiva completa e indestrutível forjada pelo próprio Deus.',
                    pontosChave: [
                        'Luta espiritual travada no âmbito invisível contra potestades',
                        'As 7 peças da Armadura de Deus em Efésios 6',
                        'Rejeição radical de objetos mágicos, fetiches e sincretismos no Altar',
                        'A vitória assegurada pela fidelidade à Palavra e oração contínua'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. Refutação aos Modismos Heréticos da Batalha Espiritual Neopentecostal',
                    conteudo: `A Declaração de Fé da CGADB rejeita enfaticamente vários modismos estranhos à revelação bíblica que surgiram no cenário neopentecostal:
- **Quebra de Maldições Hereditárias para Crentes**: O crente regenerado em Cristo já foi resgatado da maldição da Lei (Gl 3:13; 2 Co 5:17). Nenhuma maldição genealógica tem poder sobre quem está lavado pelo sangue do Cordeiro;
- **Mapeamento Espiritual Místico**: A ideia antibíblica de que demônios têm nomes secretos que precisam ser descobertos por revelações extrabíblicas antes de serem expulsos;
- **Atos Proféticos Teatrais**: Marchas de oração para "consagrar territórios" através de derramamento de óleo em postes ou aspersão de sal em fronteiras de cidades. A terra é conquistada para Cristo pela pregação do Evangelho e pelo testemunho santo dos crentes.`,
                    destaqueExegese: 'Exegorasen hemas ek tes kataras (ἐξηγόρασεν ἡμᾶς ἐκ τῆς κατάρας) em Gl 3:13: "Cristo nos resgatou da maldição da lei, fazendo-se maldição por nós".',
                    pontosChave: [
                        'Libertação definitiva de maldições no sangue da cruz',
                        'Rejeição de teorias de demônios territoriais invencíveis',
                        'A suficiência absoluta do sacrifício de Jesus Cristo',
                        'A pregação da Palavra como único instrumento bíblico de transformação de cidades'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. A Unção dos Enfermos e a Consolação Pastoral em Tiago 5',
                    conteudo: `Em Tiago 5:14-16, a Palavra estabelece a prática pastoral da oração pelos doentes:
"Está alguém entre vós doente? Chame os presbíteros da igreja, e orem sobre ele, ungindo-o com azeite em nome do Senhor; e a oração da fé salvará o doente, e o Senhor o levantará; e, se houver cometido pecados, ser-lhe-ão perdoados".

O azeite de oliva utilizado não possui propriedades mágicas em si mesmo, mas é o símbolo bíblico sagrado da presença e do poder curador do Espírito Santo. O milagre não decorre do elemento físico, mas da soberania de Deus operando através da oração da fé em Nome de Jesus.

Como conclui Abrahão Cipriano em "Obreiro de Valor", o obreiro ora com fé incondicional pela cura, mas submete-se sempre com reverência aos desígnios soberanos e eternos do Deus Altíssimo.`,
                    destaqueExegese: 'Aleipsantes elaio en to onomati tou Kyriou (ἀλείψαντες ἐλαίῳ ἐν τῷ ὀνόματι τοῦ Κυρίου): ungindo com óleo em nome soberano do Senhor.',
                    pontosChave: [
                        'Prática bíblica permanente da unção com óleo pelos presbíteros',
                        'O azeite como símbolo do Espírito e a oração da fé como instrumento',
                        'Perdão de pecados e restauração da saúde física e espiritual',
                        'Descanso na soberana vontade e sabedoria perfeita de Deus'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Em qual passagem profética veterotestamentária está fundamentada a base expiatória da Cura Divina segundo a CGADB e Mateus 8:17?',
                    opcoes: [
                        'Gênesis 3:15.',
                        'Isaías 53:4-5 ("Verdadeiramente Ele tomou sobre Si as nossas enfermidades e as nossas dores levou sobre Si").',
                        'Ezequiel 37:1-14.',
                        'Jonas 2:1-9.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Isaías 53:4-5 é a base profética da expiação vicária que inclui a provisão da cura física e libertação, confirmada em Mateus 8:16-17.'
                },
                {
                    pergunta: 'Por que a Declaração de Fé da CGADB e o livro "Obreiro de Valor" rejeitam a doutrina da "Quebra de Maldições Hereditárias" para crentes em Jesus?',
                    opcoes: [
                        'Porque segundo Gálatas 3:13 e 2 Coríntios 5:17, o crente em Cristo já foi totalmente resgatado da maldição da Lei na cruz e tornou-se nova criatura, livre de qualquer condenação herdada.',
                        'Porque as maldições são mais fortes que o sangue de Jesus.',
                        'Porque a Bíblia ensina que o crente deve pagar sacrifícios em dinheiro para se libertar.',
                        'Porque o diabo é mais poderoso que a Igreja.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'Cristo quitou toda a dívida na cruz; quem está em Cristo é nova criatura e nenhuma maldição do passado tem poder sobre ele.'
                }
            ]
        }]
    },

    // =========================================================================
    // NÍVEL 5: PASTOR (5 MÓDULOS DE ALTA DENSIDADE PASTORAL E GOVERNANÇA CGADB)
    // Alinhamento: Declaração de Fé CGADB/CPAD & Livro "Obreiro de Valor" (Pr. Abrahão Cipriano)
    // =========================================================================
    {
        id: 'pr_01',
        nivelId: 'pastor',
        titulo: 'Módulo 1: Teologia Pastoral, Vocação Sacerdotal & Apascentamento do Rebanho',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Capítulo 20 - Os Dons Ministeriais',
        cargaHoraria: 32,
        ementa: 'A teologia bíblica do pastorado segundo Jeremias 3:15, João 10 e 1 Pedro 5:1-4. A nobreza e o peso da chamada pastoral. A liderança servidora de Cristo versus o autoritarismo eclesiástico despótico. O autocuidado emocional e espiritual do pastor, prevenção ao esgotamento (Burnout) e o governo sacerdotal do lar conforme a magna obra "Obreiro de Valor" do Pr. Abrahão Cipriano.',
        trabalhoSugerido: 'Elaborar um Tratado de Teologia Pastoral de 4 páginas analisando "As Quatro Proibições Apostólicas aos Pastores em 1 Pedro 5:1-4 e o Modelo do Bom Pastor de João 10", com aplicações práticas para o pastor presidente contemporâneo.',
        licoes: [{
            id: 'lic_pr_01',
            numero: 1,
            titulo: 'O Pastor segundo o Coração de Deus, o Cajado de Amor e a Liderança Servidora',
            introducao: 'O pastorado cristão é o encargo mais elevado, sublime e solene de apascentamento no Corpo de Cristo. O verdadeiro pastor não é um executivo empresarial frio, nem um coronel despótico que tiraniza a congregação, mas um pai espiritual ungido que dá a própria vida pelas ovelhas. Em Jeremias 3:15, o Deus Todo-Poderoso promete: "E dar-vos-ei pastores segundo o meu coração, os quais vos apascentarão com ciência e com inteligência". Como ensina comoventemente o Pr. Abrahão Cipriano em "Obreiro de Valor", o valor de um pastor diante de Deus não é medido pelo luxo de seu gabinete ou pelo número de placas de seu ministério, mas pelo amor sacrificial com que ele cuida dos pequeninos da grei.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé das Assembleias de Deus (CGADB/CPAD, Capítulos 11 e 20), o pastorado é um dom ministerial de governo e ensino concedido soberanamente por Cristo ressurreto para guiar, alimentar e proteger o rebanho comprado com o Seu próprio sangue (At 20:28; Ef 4:11; Hb 13:17).',
            referenciasBiblicas: ['Jeremias 3:15', 'João 10:11-18', '1 Pedro 5:1-4', 'Atos 20:28-32', 'Hebreus 13:17', '1 Timóteo 3:1-7', 'Ezequiel 34:1-16'],
            aplicacaoPratica: 'O pastor presidente deve dedicar-se à oração diária e ao estudo profundo das Escrituras, visitar as ovelhas em suas aflições, manter gabinete de aconselhamento com integridade inquestionável, governar com mansidão e transparência e proteger o rebanho contra falsos ensinos e lobos vorazes.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Chamado Soberano e a Responsabilidade Solene em Hebreus 13:17',
                    conteudo: `O autor de Hebreus registra uma advertência que deveria estremecer a alma de todo líder eclesiástico: "Obedecei a vossos pastores e sujeitai-vos a eles; porque velam por vossas almas, como aqueles que hão de dar conta delas; para que o façam com alegria e não gemendo, porque isso não vos seria útil" (Hb 13:17).

O pastor não prestará contas apenas de sua própria vida moral, mas terá que responder diante do Tribunal de Cristo por cada ovelha que esteve debaixo de seu cajado. A vocação pastoral é divina e irrevogável: ninguém toma para si essa honra, senão o chamado por Deus como Arão (Hb 5:4).

Em "Obreiro de Valor", o Pr. Abrahão Cipriano destaca que o pastor é um vigia noturno que perde o sono intercedendo pelas crises e dores do seu povo.`,
                    destaqueExegese: 'Agrypnousin hyper ton psychon hymon (ἀγρυπνοῦσιν ὑπὲρ τῶν ψυχῶν ὑμῶν): vigiar sem dormir, passar noites em sentinela constante pelas almas.',
                    pontosChave: [
                        'Vocação divina santa e irrevogável concedida por Deus',
                        'Prestação de contas detalhada no Tribunal de Cristo por cada ovelha',
                        'Vigilância e intercessão noturna em favor da congregação',
                        'A autoridade pastoral legitimada pelo amor sacrificial e temor divino'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. As Quatro Admoestações Pastorais de 1 Pedro 5:1-4',
                    conteudo: `O apóstolo Pedro dirige-se aos pastores com quatro ordenanças apostólicas inegociáveis:
1) **Voluntariedade contra Obrigação**: "Apascentai o rebanho de Deus que está entre vós, tendo cuidado dele, não por força, mas voluntariamente, segundo Deus" (v. 2);
2) **Desapego Financeiro contra Torpe Ganância**: "Não por torpe ganância, mas de ânimo pronto" (v. 2). O pastor não pode ser mercenário que tosa a lã das ovelhas para enriquecer pessoalmente;
3) **Liderança por Exemplo contra Domínio Tirânico**: "Nem como tendo domínio sobre a herança de Deus, mas servindo de exemplo ao rebanho" (v. 3). Rejeição categórica de qualquer coronelismo ou autoritarismo eclesiástico;
4) **Expectativa do Galardão Celestial**: "E, quando aparecer o Sumo Pastor, alcançareis a incorruptível coroa de glória" (v. 4).`,
                    destaqueExegese: 'Katakyrieuontes ton kleron (κατακυριεύοντες τῶν κλήρων): tiranizar ou agir como dono despótico sobre a propriedade exclusiva de Deus.',
                    pontosChave: [
                        'Pastoreio voluntário nascido do amor genuíno às ovelhas',
                        'Desapego material e condenação de qualquer exploração financeira',
                        'Liderança exemplar e humilde em vez de coerção e domínio tirânico',
                        'A bendita esperança da coroa de glória conferida por Cristo'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. A Defesa do Rebanho contra Lobos Cruéis (Atos 20:28-31)',
                    conteudo: `Em seu discurso de despedida aos anciãos de Éfeso em Mileto, o apóstolo Paulo proferiu lágrimas e advertências solenes: "Olhai, pois, por vós e por todo o rebanho sobre que o Espírito Santo vos constituiu bispos, para apascentardes a igreja de Deus, que ele resgatou com seu próprio sangue. Porque eu sei isto: que, depois da minha partida, entrarão no meio de vós lobos cruéis, que não pouparão o rebanho" (At 20:28-29).

O pastor é o sentinela e protetor doutrinário. Os lobos vorazes apresentam-se disfarçados de pregadores inovadores, trazendo heresias de perdição, sementes de rebelião e divisões carnais.

O pastor de valor brande o cajado da sã doutrina da Declaração de Fé da CGADB, confronta o erro com autoridade espiritual e resguarda as ovelhas frágeis contra o veneno do engano.`,
                    destaqueExegese: 'Lykoi bareis (λύκοι βαρεῖς): predadores ferozes, vorazes e implacáveis que atacam o rebanho para destruí-lo.',
                    pontosChave: [
                        'A igreja como herança sagrada comprada pelo sangue de Deus em Cristo',
                        'Vigilância contínua contra predadores e falsos mestres heréticos',
                        'O cajado pastoral para defender e corrigir os desvios doutrinários',
                        'Fidelidade inabalável à sã doutrina bíblica assembleiana'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. A Saúde Emocional, Prevenção do Burnout e o Sacerdócio do Lar',
                    conteudo: `O pastor não é um super-homem impassível. As pressões do ministério, as críticas injustas, a ingratidão de liderados e a carga emocional dos aconselhamentos podem levar ao esgotamento físico e mental extremo (Síndrome de Burnout).

Em "Obreiro de Valor", o Pr. Abrahão Cipriano adverte enfaticamente que o pastor precisa:
- **Respeitar o Princípio Bíblico do Repouso (Sabbath)**: Ter um dia semanal de descanso sagrado sem atendimento a crises corriqueiras;
- **Cultivar o Amor Conjugal e Familiar**: A esposa do pastor é sua maior ajudadora e seus filhos são seu primeiro rebanho. Se o pastor perder sua família em nome da igreja, terá falhado no teste principal de 1 Timóteo 3:5;
- **Mentoria e Aconselhamento Pastoral**: Ter mentores espirituais maduros e confiáveis com quem possa abrir o coração e desabafar sem receios;
- **Alimentação Saudável e Atividade Física**: Cuidar do templo do Espírito Santo (1 Co 6:19-20).`,
                    destaqueExegese: 'Proistamenon tou idiou oikou (προϊστάμενον τοῦ ἰδίου οἴκου): liderar e governar com excelência o seu próprio lar.',
                    pontosChave: [
                        'Prevenção contra o esgotamento emocional e estresse ministerial crônico',
                        'Prioridade inegociável do casamento e dos filhos sobre a agenda externa',
                        'Descanso físico e mental regular como princípio divino bíblico',
                        'Humildade para receber mentoria espiritual e prestar contas'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. A Recompensa Eterna no Retorno do Sumo Pastor (1 Pedro 5:4)',
                    conteudo: `O apóstolo Pedro encerra a visão pastoral com uma promessa radiante: "E, quando aparecer o Sumo Pastor (Archipoimen), alcançareis a incorruptível coroa de glória".

O pastor de valor não busca honrarias efêmeras da política terrena, nem títulos pomposos de grandeza humana. Sua alma está ancorada na certeza de que o Senhor Jesus Cristo viu cada lágrima derramada na madrugada, cada visita realizada na favela, cada ovelha consolada no leito de morte e cada sacrifício anônimo feito pela Igreja.

No grande Dia da Revelação de Cristo, ele ouvirá dos lábios sagrados do Rei da Glória: "Bem está, servo bom e fiel. Sobre o pouco foste fiel, sobre muito te colocarei; entra no gozo do teu Senhor" (Mt 25:21).`,
                    destaqueExegese: 'Archipoimen (ἀρχιποίμην): o Príncipe, Soberano e Supremo Pastor de toda a Igreja de Deus.',
                    pontosChave: [
                        'Aprovação final de Cristo como o único alvo supremo do pastorado',
                        'A coroa incorruptível de glória que jamais murcha ou perde o brilho',
                        'Consolo celestial para todas as renúncias feitas por amor à grei',
                        'Fidelidade santa e inquebrantável até o último suspiro da vida'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Como o apóstolo Pedro ordena que os pastores governem o rebanho de Deus em 1 Pedro 5:2-3 e no livro "Obreiro de Valor"?',
                    opcoes: [
                        'Como chefes autoritários e dominadores que usam a igreja para enriquecer com torpe ganância.',
                        'Apascentando voluntariamente com amor, sem torpe ganância, nem como dominadores sobre a herança de Deus, mas servindo de exemplo vivo à grei.',
                        'Delegando o pastoreio a pessoas não consagradas e focando em política secular.',
                        'Cobrando ingressos para as orações e expulsando os crentes pobres.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O modelo pastoral de Cristo e Pedro é baseado no exemplo de servo, na voluntariedade do amor e na rejeição ao mercantilismo e ao autoritarismo.'
                },
                {
                    pergunta: 'Por que o governo da própria casa e a saúde familiar são pré-requisitos intransponíveis para o pastor segundo 1 Timóteo 3:4-5?',
                    opcoes: [
                        'Porque se alguém não sabe cuidar com sabedoria, ternura e santidade de sua própria família, não terá capacidade espiritual de pastorear a Igreja do Deus Vivo.',
                        'Apenas por uma tradição jurídica da sociedade civil brasileira.',
                        'Para garantir que os familiares ocupem cargos remunerados na diretoria.',
                        'Não há qualquer exigência bíblica sobre a família do pastor.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'A família do pastor é seu primeiro altar e o laboratório prático de sua autoridade espiritual e capacidade de liderança no Reino de Deus.'
                }
            ]
        }]
    },
    {
        id: 'pr_02',
        nivelId: 'pastor',
        titulo: 'Módulo 2: Eclesiologia Clássica, Governança da CGADB & Direito Eclesiástico',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Estatuto Geral da CGADB',
        cargaHoraria: 32,
        ementa: 'A estrutura institucional e jurídica das Assembleias de Deus no Brasil. O modelo de Campo Eclesiástico, congregações filiadas e ministérios locais. As Convenções Estaduais e a Convenção Geral (CGADB). Direito Eclesiástico e conformidade com o Código Civil Brasileiro: Estatuto Social, Atas de Eleição Notariais, Conselho Fiscal, Imunidade Tributária Constitucional e gestão patrimonial segundo a ética do Pr. Abrahão Cipriano.',
        trabalhoSugerido: 'Elaborar uma Minuta Completa de Estatuto Social de Igreja Evangélica e um Modelo de Ata Notarial de Assembleia Geral Ordinária de Prestação de Contas Anual e Posse de Diretoria.',
        licoes: [{
            id: 'lic_pr_02',
            numero: 1,
            titulo: 'A Igreja Local, a Governança Institucional e a Comunhão Convencional da CGADB',
            introducao: 'O pastor presidente precisa ser um homem cheio do Espírito Santo e, simultaneamente, um administrador eclesiástico diligente, prudente e instruído nas leis vigentes. A Igreja de Cristo possui personalidade jurídica de direito privado e atua no mundo secular como organização religiosa, devendo obedecer rigorosamente à Constituição Federal e ao Código Civil Brasileiro. Como ensina o Pr. Abrahão Cipriano em "Obreiro de Valor", o desleixo documental, a falta de atas cartorárias e a negligência fiscal na gestão da igreja constituem escândalo vergonhoso que desonra o Evangelho e expõe o patrimônio sagrado do povo de Deus a graves riscos jurídicos.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 11), a Igreja local é autônoma em sua administração interna, mantendo laços fraternais, doutrinários e cooperativos com a Convenção Estadual e a CGADB. A ordem institucional decorre do mandamento apostólico de 1 Coríntios 14:40: "Faça-se tudo decentemente e com ordem".',
            referenciasBiblicas: ['1 Coríntios 14:40', 'Atos 15:1-35', 'Romanos 13:1-7', '2 Coríntios 8:20-21', 'Tito 1:5', 'Êxodo 18:13-26', 'Provérbios 27:23'],
            aplicacaoPratica: 'O pastor presidente deve manter o Estatuto Social registrado no Cartório de Registro Civil de Pessoas Jurídicas, realizar assembleias ordinárias anuais de prestação de contas com parecer do Conselho Fiscal, manter livros de atas e membros atualizados e garantir certidões negativas de débito perante a Receita Federal.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Concílio Apostólico de Jerusalém (Atos 15) como Raiz da Convenção',
                    conteudo: `Quando surgiu uma controvérsia de grandes proporções em Antioquia sobre a circuncisão e a inclusão dos gentios, a igreja local não agiu de forma isolacionista ou arrogante, mas enviou Paulo e Barnabé a Jerusalém para consultar os apóstolos e presbíteros em concílio solene (At 15:1-6).

Após ouvir os testemunhos de Pedro, Paulo e Barnabé, Tiago presidiu a deliberação bíblica fundamentada no profeta Amós, e o concílio emitiu decretos de paz sob a unção divina: "Pareceu bem ao Espírito Santo e a nós" (At 15:28).

Esse evento bíblico histórico estabelece o fundamento neotestamentário para a criação das Convenções Regionais, Estaduais e Nacionais (CGADB), que zelam pela unidade dogmática, ordenação ministerial e paz eclesiástica entre os ministérios.`,
                    destaqueExegese: 'Dogmata ta kekrimena hypo ton apostolon (δόγματα τὰ κεκριμένα ὑπὸ τῶν ἀποστόλων) em Atos 16:4: resoluções consensuais e decretos doutrinários aprovados para guarda de todas as igrejas.',
                    pontosChave: [
                        'Concílio de Jerusalém como precedente bíblico das convenções gerais',
                        'Deliberação colegiada guiada soberanamente pelo Espírito Santo',
                        'Unidade doutrinária nacional mantida através da CGADB',
                        'Resolução pacífica de conflitos dogmáticos e disciplinares'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. A Estrutura Organizacional do Campo Eclesiástico Assembleiano',
                    conteudo: `O modelo tradicional e predominante das Assembleias de Deus no Brasil opera no sistema de Campo Eclesiástico Unificado:
- **Igreja Sede (Matriz)**: Centro administrativo, doutrinário e financeiro do campo, onde reside o Pastor Presidente e reúne-se a diretoria executiva estatutária;
- **Congregações e Subcongregações (Filiais)**: Espalhadas pelos bairros urbanos e distritos rurais, dirigidas por presbíteros ou evangelistas designados pelo pastor presidente;
- **Patrimônio Unificado**: Todos os imóveis, templos, terrenos e veículos são escriturados e registrados em nome da pessoa jurídica da Igreja Sede, garantindo que congregações não sofram desvios particulares ou cismas facciosos.`,
                    destaqueExegese: 'Oikonomia tou Theou (οἰκονομία τοῦ Θεοῦ): administração, mordomia prudente e governança ordenada da Casa de Deus.',
                    pontosChave: [
                        'Sistema de Campo Eclesiástico com Igreja Sede e congregações integradas',
                        'Unificação patrimonial em nome da pessoa jurídica institucional',
                        'Rodízio e supervisão ministerial fraterna dos dirigentes de congregação',
                        'Fortalecimento financeiro coletivo para abertura de novas obras'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. Conformidade com o Código Civil Brasileiro e Direito Canônico',
                    conteudo: `Para atuar legalmente na sociedade civil brasileira (Artigo 44 do Código Civil), a igreja local deve possuir:
1) **Estatuto Social Aprovado em Assembleia Geral e Registrado em Cartório de Registro Civil de Pessoas Jurídicas (RCPJ)**;
2) **CNPJ Ativo perante a Receita Federal do Brasil** com Classificação Nacional de Atividades Econômicas (CNAE 94.91-0-00);
3) **Ata Notarial de Eleição e Posse da Diretoria Executiva** devidamente averbada dentro do prazo de mandato estatutário;
4) **Livro de Registro de Casamentos Religiosos com Efeito Civil** e termos padronizados;
5) **Imunidade Tributária Constitucional (Art. 150, VI, b da CF/88)** devidamente declarada e respeitada sobre impostos incidentes sobre templos de qualquer culto.`,
                    destaqueExegese: 'Apodote ta Kaisaros Kaisari kai ta tou Theou to Theo (ἀπόδοτε τὰ Καίσαρος Καίσαρι καὶ τὰ τοῦ Θεοῦ τῷ Θεῷ) em Mt 22:21: dar a César o que é de César e a Deus o que é de Deus.',
                    pontosChave: [
                        'Estatuto Social e regulamentos internos devidamente registrados',
                        'CNPJ e obrigações acessórias fiscais (DCTFWeb, ECF) rigorosamente em dia',
                        'Ata notarial com vigência legal para representação bancária e judicial',
                        'Proteção da imunidade tributária constitucional assegurada aos templos'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. Condução de Assembleias Gerais e o Papel do Conselho Fiscal',
                    conteudo: `Em "Obreiro de Valor", o Pr. Abrahão Cipriano instrui sobre a solenidade da gestão democrática-espiritual nas Assembleias Gerais:
- **Edital de Convocação Tempestivo**: Publicação do edital de convocação com no mínimo 15 a 30 dias de antecedência no mural do templo e leitura nos cultos públicos, com pauta expressa;
- **Quórum Estatutário**: Verificação de quórum de membros em plena comunhão antes do início das deliberações;
- **Parecer Prévio do Conselho Fiscal**: Apresentação detalhada dos balancetes contábeis, extratos bancários e notas fiscais de despesas pelo tesoureiro, acompanhados de parecer formal assinado pelos membros eleitos do Conselho Fiscal;
- **Aprovação de Contas**: Votação transparente e lavratura da ata fidedigna assinada pela mesa diretora.`,
                    destaqueExegese: 'Boule kai gnosis (βουλὴ καὶ γνῶσις): deliberação sensata e conhecimento transparente compartilhados com os santos.',
                    pontosChave: [
                        'Convocação de assembleias com prazos e editais rigorosamente legais',
                        'Atuação independente e minuciosa do Conselho Fiscal da igreja',
                        'Transparência contábil total perante a membresia em comunhão',
                        'Lavratura e averbação imediata das atas em cartório'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. A Fidelidade à CGADB e o Fortalecimento da Escola Bíblica CPAD',
                    conteudo: `A comunhão com a Convenção Geral das Assembleias de Deus no Brasil (CGADB) expressa a unidade histórica do movimento pentecostal fundado por Gunnar Vingren e Daniel Berg em 1911.

O pastor presidente assembleiano de valor:
- Mantém sua inscrição e credenciamento convencional ativos perante a Mesa Diretora da CGADB e sua Convenção Estadual;
- Adota exclusivamente a literatura oficial das Lições Bíblicas publicadas pela Casa Publicadora das Assembleias de Deus (CPAD) em todas as classes de EBD do campo;
- Participa com fidelidade das Assembleias Gerais Ordinárias e apoia a Secretaria Nacional de Missões (SENAMI).

Essa aliança fortalece a denominação nacional, blinda a doutrina contra modismos seculares e preserva a identidade pentecostal clássica para as futuras gerações.`,
                    destaqueExegese: 'Koinonoi en to Euangelio (κοινωνοὶ ἐν τῷ εὐαγγελίῳ) em Fp 1:5: cooperadores unidos na comunhão e avanço do Evangelho.',
                    pontosChave: [
                        'Comunhão convencional e fidelidade aos estatutos da CGADB',
                        'Padronização do ensino doutrinário através das revistas oficiais da CPAD',
                        'Apoio integrado a projetos nacionais de missões e ação social',
                        'Preservação da memória histórica e da herança pentecostal no Brasil'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual a exigência do Código Civil Brasileiro (Art. 44) e dos estatutos da CGADB para a representação jurídica e bancária regular da igreja local?',
                    opcoes: [
                        'Não há necessidade de qualquer documento ou registro legal.',
                        'Possuir Estatuto Social registrado em Cartório de Registro Civil de Pessoas Jurídicas, CNPJ ativo e Ata de Eleição da Diretoria devidamente averbada dentro do prazo de mandato.',
                        'Apenas ter uma placa de fachada no prédio do templo.',
                        'Registrar a igreja como empresa comercial de lucro privado.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A regularidade jurídica, cartorária e fiscal é indispensável para dar validade aos atos da igreja, proteger o patrimônio institucional e cumprir as leis civis.'
                },
                {
                    pergunta: 'Segundo a história bíblica de Atos 15 e os princípios de "Obreiro de Valor", qual a importância das reuniões convencionais da CGADB para as igrejas locais?',
                    opcoes: [
                        'Preservar a unidade dogmática da fé pentecostal, promover a comunhão fraternal entre pastores e deliberar sobre a missão nacional e mundial da Igreja.',
                        'Impedir que novos membros sejam batizados nas congregações.',
                        'Cobrar taxas comerciais particulares dos fiéis.',
                        'Transformar a fé em partidos políticos seculares.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'As convenções da CGADB promovem a unidade doutrinária nacional, o socorro mútuo entre ministérios e o avanço coordenado da obra de Deus no Brasil e no mundo.'
                }
            ]
        }]
    },
    {
        id: 'pr_03',
        nivelId: 'pastor',
        titulo: 'Módulo 3: Escatologia Bíblica Avançada: A Grande Tribulação, Milênio & Estado Eterno',
        capituloCGADB: 'Capítulo 22 - A Segunda Vinda de Cristo & Capítulo 23 - O Milênio, o Juízo Final e o Estado Eterno',
        cargaHoraria: 32,
        ementa: 'A escatologia dispensacionalista clássica das Assembleias de Deus em nível aprofundado. A cronologia dos eventos proféticos: O Arrebatamento Pré-Tribulacionista, a Septuagésima Semana de Daniel (Grande Tribulação de 7 anos), o governo global do Anticristo e do Falso Profeta, os 144.000 selados e as Duas Testemunhas. A Batalha do Armagedom e a Segunda Vinda de Cristo em Glória com Seus Santos. O Reino Milenar literal de mil anos em Jerusalém, o Juízo Final no Grande Trono Branco e a Nova Jerusalém no Novo Céu e Nova Terra segundo a Declaração de Fé da CGADB e "Obreiro de Valor".',
        trabalhoSugerido: 'Elaborar uma Monografia Escatológica Exegética de 5 páginas analisando a distinção profética entre a Igreja e Israel, a iminência do Arrebatamento e a literalidade do Milênio à luz dos Capítulos 22 e 23 da Declaração de Fé da CGADB.',
        licoes: [{
            id: 'lic_pr_03',
            numero: 1,
            titulo: 'O Panorama Profético dos Últimos Dias, o Triunfo de Cristo e a Nova Jerusalém',
            introducao: 'A Escatologia não é um enigma insolúvel para alimentar especulações fantasiosas, mas a revelação bendita do triunfo consumado de Deus sobre o mal, o pecado e a morte. A história deste mundo não caminhará para o caos cego ou destruição sem sentido, mas para a majestosa manifestação do Reino de Deus em Cristo Jesus. Como ensina com autoridade profética o Pr. Abrahão Cipriano em "Obreiro de Valor", o pastor assembleiano deve pregar com insistência as profecias escatológicas para despertar o rebanho do sono da negligência, consolando os corações e preparando a Noiva de Cristo em vestes alvas para o encontro com o Noivo.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 22 e 23), cremos no Arrebatamento pré-tribulacionista da Igreja, na ressurreição corpórea dos justos, no Tribunal de Cristo e Bodas do Cordeiro nos céus durante os 7 anos de Grande Tribulação na terra, na Segunda Vinda visível de Cristo em Glória, no Milênio literal de mil anos de justiça na terra com Cristo reinando a partir de Jerusalém, na derrota final de Satanás e no Juízo Final perante o Grande Trono Branco seguido da eternidade com Deus nos Novos Céus e Nova Terra.',
            referenciasBiblicas: ['Apocalipse 19:11-21', 'Apocalipse 20:1-15', 'Apocalipse 21:1-8', 'Daniel 9:24-27', '1 Tessalonicenses 4:13-18', 'Zacarias 14:1-9', 'Isaías 65:17-25'],
            aplicacaoPratica: 'O pastor deve ministrar séries de mensagens escatológicas fundamentadas nas Escrituras e na revista da CPAD, exortar a congregação à pureza de vida e oração diária, e consolar famílias enlutadas com a bendita certeza da ressurreição corporal e da eternidade na Nova Jerusalém.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Septuagésima Semana de Daniel e o Cenário da Grande Tribulação',
                    conteudo: `A profecia das 70 semanas revelada pelo arcanjo Gabriel em Daniel 9:24-27 é a chave cronológica da escatologia bíblica:
- 69 semanas proféticas (483 anos) transcorreram desde a ordem para reconstruir Jerusalém (Artaxerxes, 445 a.C.) até a morte do Messias Príncipe na cruz;
- O relógio profético pausou com a criação da Igreja no Pentecostes (Dispensação da Graça);
- A 70ª Semana de Daniel (período de 7 anos) terá início imediatamente após o Arrebatamento da Igreja, quando o Anticristo (o governante global das nações) firmar uma aliança política e religiosa de sete anos com a nação de Israel;
- Na metade da semana (após 3 anos e meio), o Anticristo quebrará o pacto, assentará no Templo reconstruído em Jerusalém exigindo adoração como Deus (a Abominação da Desolação - 2 Ts 2:3-4) e desencadeará a Grande Tribulação sob as taças da ira divina (Ap 6-18).`,
                    destaqueExegese: 'Hebdomas (ἑβδομάς) / Shavua (שָׁבוּעַ): semana profética de anos (7 anos literais).',
                    pontosChave: [
                        'Distinção dispensacional bíblica entre os planos de Deus para a Igreja e Israel',
                        'A 70ª Semana de Daniel como tempo da angústia de Jacó (Jeremias 30:7)',
                        'A manifestação do Homem do Pecado (Anticristo) e o Falso Profeta',
                        'A Noiva de Cristo preservada da ira vindoura nos céus'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. O Tribunal de Cristo (Bema) e as Bodas do Cordeiro no Céu',
                    conteudo: `Enquanto a terra estiver sob os juízos apocalípticos dos selos, trombetas e taças, a Igreja arrebatada e glorificada comparecerá nos céus perante o Tribunal de Cristo (Bema):
- **Finalidade do Julgamento do Bema (2 Co 5:10; 1 Co 3:11-15)**: Não é para condenação eterna (pois os salvos já foram justificados da culpa do pecado), mas para avaliação minuciosa das obras e concessão de galardões (ouro, prata e pedras preciosas);
- **As Bodas do Cordeiro (Ap 19:7-9)**: A celebração nupcial eterna e gloriosa de Cristo com Sua Igreja vestida de linho finíssimo, puro e resplandecente, que são as justiças dos santos.

Como ensina Abrahão Cipriano em "Obreiro de Valor", o obreiro fiel que labutou na terra receberá das mãos de Cristo a sua justa e imperecível recompensa.`,
                    destaqueExegese: 'Bema tou Christou (βῆμα τοῦ Χριστοῦ): tribunal desportivo de premiação onde os vencedores da corrida da fé recebem seus galardões e coroas.',
                    pontosChave: [
                        'O Bema como julgamento de recompensas e méritos espirituais dos salvos',
                        'Fogo purificador que prova a qualidade e motivação do ministério',
                        'As Bodas celestiais do Cordeiro com a Noiva redimida',
                        'Júbilo e adoração eterna diante do trono do Todo-Poderoso'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. A Segunda Vinda de Cristo em Glória e o Armagedom (Ap 19)',
                    conteudo: `No auge da Grande Tribulação, quando os exércitos das nações confederadas pelo Anticristo cercarem Jerusalém para destruir a nação judaica (Zc 14:1-3), os céus se abrirão:
- Cristo descerá visivelmente montado em um cavalo branco, chamado Fiel e Verdadeiro, tendo em Sua coxa escrito o Nome: REI DOS REIS E SENHOR DOS SENHORES (Ap 19:11-16);
- Os exércitos celestiais — a Igreja glorificada e os anjos — descerão juntamente com Ele;
- Seus pés tocarão o Monte das Oliveiras, que se fenderá pelo meio (Zc 14:4);
- Na Batalha do Armagedom, Cristo aniquilará os exércitos inimigos com o sopro de Sua boca; a Besta e o Falso Profeta serão lançados vivos no Lago de Fogo (Ap 19:20), e Satanás será amarrado por mil anos no Abismo com uma grande corrente (Ap 20:1-3).`,
                    destaqueExegese: 'Epiphaneia tes parousias (ἐπιφάνεια τῆς παρουσίας) em 2 Ts 2:8: a manifestação pública resplandecente da Vinda gloriosa do Senhor.',
                    pontosChave: [
                        'Segunda Vinda pública, corporal e visível a todo olho humano (Ap 1:7)',
                        'A descida gloriosa de Cristo sobre o Monte das Oliveiras em Jerusalém',
                        'Vitória esmagadora no Armagedom e prisão milenar de Satanás',
                        'Conversão e reconhecimento do Messias pelo remanescente de Israel (Zc 12:10)'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. O Reino Milenar Literal de Cristo na Terra (Apocalipse 20:1-6)',
                    conteudo: `A Declaração de Fé da CGADB sustenta firmemente a doutrina do Milênio literal de 1000 anos sobre a terra governado por Cristo a partir de Jerusalém com a Sua Igreja:
- **Paz Global e Justiça Perfeita**: Não haverá guerras nem corrupção política; as nações converterão suas espadas em enxadas (Mq 4:3; Is 11:1-5);
- **Harmonia na Natureza**: A criação animal será pacificada; o lobo e o cordeiro pastarão juntos, o leopardo se deitará com o cabrito e a criança brincará na cova da serpente (Is 11:6-9; 65:25);
- **Longevidade Humana Restaurada**: Quem morrer com cem anos será considerado jovem (Is 65:20);
- **A Revolta Final de Gogue e Magogue**: Ao fim dos mil anos, Satanás será solto por um pouco de tempo para testar os nascidos no Milênio; os rebeldes serão consumidos por fogo descido do céu, e o diabo será lançado para todo o sempre no Lago de Fogo e Enxofre (Ap 20:7-10).`,
                    destaqueExegese: 'Chilia ete (χίλια ἔτη): mil anos literais mencionados seis vezes consecutivas no capítulo 20 de Apocalipse.',
                    pontosChave: [
                        'Governo teocrático literal e universal de Jesus Cristo a partir de Sião',
                        'Restauração da ordem biológica e paz cósmica na criação de Deus',
                        'A Igreja reinando como reis e sacerdotes juntamente com Cristo',
                        'Derrota final e definitiva de Satanás lançado no Lago de Fogo eterno'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. O Grande Trono Branco, o Juízo Final e os Novos Céus e Nova Terra',
                    conteudo: `Após a destruição de Satanás, o cenário cósmico culmina no Juízo Final:
- **O Grande Trono Branco (Ap 20:11-15)**: Todos os ímpios mortos de todas as eras ressuscitarão corporalmente para julgamento diante do Deus Santo. Os livros das obras e o Livro da Vida serão abertos; aquele cujo nome não for achado escrito no Livro da Vida será lançado no Lago de Fogo (a Segunda Morte);
- **Novos Céus e Nova Terra (Ap 21-22)**: A criação anterior passa e Deus estabelece a Nova Jerusalém celestial. "E Deus limpará de seus olhos toda lágrima, e não haverá mais morte, nem pranto, nem clamor, nem dor, porque já as primeiras coisas são passadas" (Ap 21:4);
- **A Comunhão Eterna**: Os salvos verão a face de Deus e reinarão pelos séculos dos séculos (Ap 22:4-5).`,
                    destaqueExegese: 'Kainos ouranos kai kaine ge (καινὸς οὐρανὸς καὶ καινὴ γῆ): céu novo e terra nova de natureza fresca, gloriosa e eterna.',
                    pontosChave: [
                        'Ressurreição dos ímpios e condenação irrevogável no Grande Trono Branco',
                        'O fim definitivo da morte, da dor, da enfermidade e do pecado',
                        'A Nova Jerusalém descendo dos céus ataviada como Noiva para seu Esposo',
                        'A habitação perpétua e radiante dos santos na presença do Cordeiro'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Segundo a cronologia profética da Declaração de Fé da CGADB (Capítulos 22 e 23), qual a diferença essencial entre o Tribunal de Cristo (Bema) e o Grande Trono Branco?',
                    opcoes: [
                        'O Tribunal de Cristo (Bema) é nos céus para galardoamento das obras dos salvos arrebatados; o Grande Trono Branco é o julgamento final de condenação de todos os ímpios após o Milênio.',
                        'Não há nenhuma diferença, ambos são para condenar os crentes ao inferno.',
                        'O Tribunal de Cristo ocorre na terra e o Grande Trono Branco é apenas para os anjos caídos.',
                        'São apenas mitos babilônicos sem base bíblica.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'O Bema é o tribunal de recompensas celestiais para a Noiva de Cristo, enquanto o Grande Trono Branco é o julgamento final irrevogável dos ímpios que rejeitaram a Deus.'
                },
                {
                    pergunta: 'O que as Escrituras profetizam em Isaías 11 e Apocalipse 20 sobre o Reino Milenar de Cristo na terra?',
                    opcoes: [
                        'Que será um período de mil anos de tirania demoníaca e guerras nucleares.',
                        'Que Cristo reinará visivelmente por mil anos em Jerusalém em perfeita paz, com restauração da criação da natureza e justiça universal com Sua Igreja.',
                        'Que o Milênio já acabou na Idade Média.',
                        'Que apenas os animais habitarão a terra sem a presença humana.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O pré-milenismo clássico ensina o cumprimento literal de mil anos de paz e justiça messiânica terrena governados pelo Rei Jesus.'
                }
            ]
        }]
    },
    {
        id: 'pr_04',
        nivelId: 'pastor',
        titulo: 'Módulo 4: Aconselhamento Pastoral Avançado, Família & Casamentos em Crise',
        capituloCGADB: 'Capítulo 24 - A Família & Capítulo 10 - A Salvação',
        cargaHoraria: 32,
        ementa: 'A teologia bíblica da aliança matrimonial indissolúvel (Gênesis 2:24; Malaquias 2:14-16; Mateus 19:3-9). Protocolo avançado de mediação em crises conjugais, infidelidade, vícios e violência doméstica. O papel do pastor no acolhimento de divorciados e viúvos. Discipulado de pais e educação de filhos em tempos de relativismo cultural segundo as diretrizes de "Obreiro de Valor" (Pr. Abrahão Cipriano).',
        trabalhoSugerido: 'Elaborar um Manual de Aconselhamento Pré-Matrimonial em 6 Sessões Estruturadas (Comunicação, Finanças, Intimidade Sexual Bíblica, Papéis no Lar, Vida Devocional e Relacionamento com Sogros).',
        licoes: [{
            id: 'lic_pr_04',
            numero: 1,
            titulo: 'O Matrimônio como Aliança Sagrada, a Cura dos Lares e a Restauração da Família',
            introducao: 'A família é a primeira e mais importante instituição criada por Deus na face da terra, estabelecida no Jardim do Éden antes do tabernáculo, do sacerdócio e da própria igreja local. O casamento cristão é uma aliança santa, monogâmica, heterossexual e indissolúvel entre um homem e uma mulher. Diante da investida furiosa do secularismo contra o modelo bíblico da família, o pastor presidente deve levantar-se como um conselheiro sábio e guardião dos lares. Como ensina com mestria o Pr. Abrahão Cipriano em "Obreiro de Valor", o pastor que restaura um casamento em crise está resgatando o futuro da igreja e salvando gerações para a glória de Deus.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 24), o casamento foi instituído por Deus e é monogâmico, heterossexual e indissolúvel até que a morte os separe (Mt 19:4-6; Rm 7:2). A união conjugal reflete o mistério da união sagrada entre Cristo e a Sua Igreja (Ef 5:31-32).',
            referenciasBiblicas: ['Gênesis 2:18-25', 'Malaquias 2:14-16', 'Mateus 19:3-9', 'Efésios 5:22-33', '1 Pedro 3:1-7', '1 Coríntios 7:1-16', 'Colossenses 3:18-21'],
            aplicacaoPratica: 'O pastor deve ministrar cursos obrigatórios de noivos na congregação, realizar atendimentos de casais com sabedoria, sigilo e paciência, combater o divórcio com o ministério da reconciliação bíblica e defender os princípios inegociáveis da família tradicional cristã.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Criação Divina da Família e a Sacralidade da Aliança Matrimonial',
                    conteudo: `Em Gênesis 2:24, o Criador estabeleceu a fórmula original e perpétua do matrimônio: "Portanto, deixará o varão o seu pai e a sua mãe e apegar-se-á à sua mulher, e serão ambos uma carne".

Essa declaração estabelece os quatro pilares do casamento bíblico:
1) **Prioridade (Deixará pai e mãe)**: O novo núcleo familiar adquire autonomia afetiva e financeira sobre as famílias de origem;
2) **Permanência (Apegar-se-á)**: O verbo hebraico dabaq significa colar ou fundir de modo inseparável com aliança sagrada;
3) **Heterossexualidade e Monogamia (O varão à sua mulher)**: A união exclusiva entre um homem e uma mulher;
4) **Unidade Íntima (Uma só carne)**: Comunhão espiritual, emocional e intimidade sexual pura dentro do matrimônio.

Em "Obreiro de Valor", o Pr. Abrahão Cipriano lembra que o divórcio não constava no plano original de Deus (Mt 19:8).`,
                    destaqueExegese: 'Dabaq (דָּבַק) em Gn 2:24: apegar-se com lealdade inabalável, soldar-se como uma só substância.',
                    pontosChave: [
                        'A família como instituição divina pré-queda inviolável',
                        'A aliança matrimonial selada na presença de Deus (Malaquias 2:14)',
                        'Heterossexualidade e monogamia como padrão bíblico perpétuo',
                        'A unidade integral: espiritual, psicológica e corporal'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. Os Papéis Bíblicos no Casamento: Efésios 5 e 1 Pedro 3',
                    conteudo: `A Eclesiologia paulina e petrina estabelece a harmonia no lar através de papéis complementares e não competitivos:
- **O Papel do Marido**: Amar sua esposa sacrificialmente assim como Cristo amou a Igreja e Se entregou por ela (Ef 5:25). O marido não é um tirano doméstico, mas o líder servo e protetor que honra sua mulher como "vaso mais frágil e co-herdeira da graça da vida" (1 Pe 3:7);
- **O Papel da Esposa**: Submeter-se e respeitar o marido no temor do Senhor (Ef 5:22; Tt 2:4-5), sendo a sábia construtora do lar (Pv 14:1) e companheira fiel;
- **A Intimidade Conjugal (1 Co 7:3-5)**: O dever conjugal recíproco praticado com amor e respeito mútuo, sem chantagens emocionais ou egoísmo.`,
                    destaqueExegese: 'Heauton paredoken hyper autes (ἑαυτὸν παρέδωκεν ὑπὲρ αὐτῆς) em Ef 5:25: o marido entrega sua própria vida sacrificialmente pela esposa.',
                    pontosChave: [
                        'Liderança sacrificial do marido espelhada no amor de Cristo',
                        'Submissão santa e cooperação afetuosa da esposa no Senhor',
                        'Pureza e respeito pleno na vida íntima matrimonial',
                        'O casamento cristão como sermão vivo de Cristo ao mundo'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. Protocolo de Mediação Pastoral em Casamentos em Crise Extrema',
                    conteudo: `Quando casais chegam ao gabinete pastoral à beira da ruptura ou sob o impacto de adultério e traição, o pastor presidente deve conduzir a mediação em etapas:
1) **Atendimento em Sessões Individuais Iniciais**: Ouvir as mágoas de cada cônjuge separadamente para desarmar a agressividade e diagnosticar os problemas reais;
2) **Confronto Bíblico do Pecado**: Chamar o cônjuge infractor ao arrependimento profundo e confissão sincera de seus erros;
3) **Ministração do Perdão Incondicional**: Ensinar que o perdão bíblico é uma decisão da vontade baseada na cruz e não um sentimento passageiro (Cl 3:13);
4) **Plano Prático de Reconstrução da Confiança**: Estabelecer regras de transparência total (senhas de celulares abertas, horários rigorosos de chegada, fim de amizades suspeitas e culto doméstico diário).`,
                    destaqueExegese: 'Charizomenoi heautois (χαριζόμενοι ἑαυτοῖς) em Cl 3:13: perdoando-se mutuamente com a mesma graça com que Cristo nos perdoou.',
                    pontosChave: [
                        'Escuta pastoral imparcial e paciente em sessões estruturadas',
                        'Confrontação amorosa do pecado e busca pelo arrependimento',
                        'O poder do perdão como chave para restaurar laços rompidos',
                        'Medidas práticas de prestação de contas para reconstruir a confiança'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. Proteção contra a Violência Doméstica e Casos Jurídicos Complexos',
                    conteudo: `O pastor de valor nunca confunde mansidão cristã com tolerância à violência doméstica física ou psicológica.

Diretrizes éticas e jurídicas inegociáveis:
- **Tolerância Zero à Agressão Física**: Se uma mulher estiver sendo agredida fisicamente pelo cônjuge, o pastor deve priorizar a preservação da integridade física dela e de seus filhos, orientando a separação física temporária de corpos e o cumprimento da Lei Maria da Penha perante as autoridades civis (Rm 13:1-4);
- **Tratamento de Vícios Ocultos**: Acompanhamento severo de problemas com álcool, drogas ou vício em pornografia digital com suporte espiritual e médico;
- **Acolhimento aos Divorciados**: Aconselhar com amor pastoral os membros divorciados, acolhendo-os no seio da igreja sem condenações hipócritas.`,
                    destaqueExegese: 'Miso gar apostolen (מִסֹּא גָּרֶשׁ) em Malaquias 2:16: "Pois o Senhor, Deus de Israel, diz que odeia o divórcio e o cobrir as vestes de violência".',
                    pontosChave: [
                        'Preservação incondicional da vida e integridade física da mulher e dos filhos',
                        'Cumprimento rigoroso da lei civil contra a violência doméstica',
                        'Tratamento de vícios e compulsões com disciplina e terapia bíblica',
                        'Acolhimento compassivo de pessoas em sofrimento conjugal'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. A Educação Cristã dos Filhos na Sociedade Contemporânea',
                    conteudo: `O apóstolo Paulo adverte em Efésios 6:4: "E vós, pais, não provoqueis a ira a vossos filhos, mas criai-os na doutrina e admoestação do Senhor".

O pastor deve ensinar aos pais da igreja como blindar seus filhos contra a ideologia de gênero, a erotização precoce na internet e o ateísmo secular:
- **Resgatar o Culto Doméstico**: 15 minutos diários de leitura bíblica e oração em família;
- **Diálogo e Afeto**: Ouvir as dúvidas dos filhos com paciência sem julgamentos precipitados;
- **Controle dos Dispositivos Digitais**: Estabelecer regras claras para uso de celulares, redes sociais e jogos eletrônicos;
- **Exemplo Prático**: Filhos seguem os passos dos pais quando veem coerência entre o que é pregado no púlpito e vivido na intimidade do lar.`,
                    destaqueExegese: 'Paideia kai nouthesia Kyriou (παιδείᾳ καὶ νουθεσίᾳ Κυρίου): disciplina formativa e admoestação amorosa fundamentadas no Senhor.',
                    pontosChave: [
                        'O lar como primeira escola teológica e centro de discipulado dos filhos',
                        'Culto doméstico bíblico como altar de proteção espiritual da família',
                        'Vigilância ativa contra a contaminação moral do entretenimento mundano',
                        'O testemunho de integridade e afeto dos pais como maior herança'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Como a Declaração de Fé da CGADB (Capítulo 24) e as Escrituras definem a instituição sagrada do casamento?',
                    opcoes: [
                        'Um contrato civil temporário que pode ser dissolvido por qualquer motivo fútil.',
                        'Uma aliança santa, monogâmica, heterossexual e indissolúvel instituída por Deus entre um homem e uma mulher até que a morte os separe.',
                        'Uma invenção social moderna sem fundamento divino.',
                        'Uma união facultativa onde cada cônjuge vive de forma independente.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A doutrina bíblica e a CGADB ensinam que o casamento foi instituído por Deus no Éden como união santa, heterossexual, monogâmica e indissolúvel.'
                },
                {
                    pergunta: 'Segundo as instruções do livro "Obreiro de Valor" de Abrahão Cipriano, qual deve ser a postura do pastor diante de casos de violência doméstica grave no lar de membros?',
                    opcoes: [
                        'Obrigar a mulher a permanecer no local da agressão sob ameaça de disciplina eclesiástica.',
                        'Priorizar a segurança física e a vida da vítima e dos filhos, orientando o afastamento cautelar e o cumprimento das leis de proteção civil, sem tolerar a violência.',
                        'Ignorar a situação por se tratar de problema particular de casal.',
                        'Expulsar a mulher da congregação.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O pastor zela pela vida e segurança dos vulneráveis, apoiando o cumprimento das leis civis e reprovando energicamente qualquer agressão física.'
                }
            ]
        }]
    },
    {
        id: 'pr_05',
        nivelId: 'pastor',
        titulo: 'Módulo 5: Liturgia Pastoral dos Sacramentos, Ordenação Ministerial & Ética Pastoral',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus, Capítulo 12 - O Batismo & Capítulo 14 - A Ceia',
        cargaHoraria: 32,
        ementa: 'A execução litúrgica e teológica dos ofícios sacerdotais solenes: Celebração de Casamentos Religiosos com Efeito Civil, Ministração da Ceia do Senhor e do Batismo em Águas, Cerimônias Fúnebres, Dedicação de Crianças ao Senhor e Imposição de Mãos na Ordenação de Obreiros e Pastores. O Código de Ética Pastoral da CGADB e a consagração final segundo "Obreiro de Valor" (Pr. Abrahão Cipriano).',
        trabalhoSugerido: 'Elaborar um Manual Litúrgico Pastoral Completo contendo os roteiros de cerimônia de Casamento Religioso com Efeito Civil, Ofício Fúnebre e Cerimonial Solene de Ordenação de Presbíteros e Pastores.',
        licoes: [{
            id: 'lic_pr_05',
            numero: 1,
            titulo: 'A Liturgia Sagrada dos Sacramentos, a Imposição de Mãos e a Consagração ao Pastorado',
            introducao: 'O pastor presidente é o ministro plenipotenciário do Evangelho encarregado de oficiar os momentos mais solenes da vida humana e eclesiástica: desde a dedicação de um recém-nascido no altar, o batismo nas águas, a união matrimonial, a administração dos santos elementos da Ceia, até o consolo na beira da sepultura e a sagrada ordenação de novos ministros da Palavra. Em "Obreiro de Valor", o Pr. Abrahão Cipriano coroa sua obra instruindo o pastor a portar-se com solenidade majestosa, postura irrepreensível e temor reverente diante do Deus Todo-Poderoso em cada ato litúrgico.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 11, 12, 14 e 20), as ordenanças e cerimônias eclesiásticas são atos sagrados ministrados por pastores e presbíteros legalmente ordenados pela imposição de mãos do presbitério da Convenção (1 Tm 4:14; 2 Tm 1:6; Tt 1:5).',
            referenciasBiblicas: ['1 Timóteo 4:14', '2 Timóteo 1:6', 'Tito 1:5', '1 Coríntios 11:23-34', 'Mateus 28:19', 'Marcos 10:13-16', '1 Tessalonicenses 4:13-18'],
            aplicacaoPratica: 'O pastor deve conduzir todas as celebrações eclesiásticas com pontualidade, vestes talares ou trajes formais dignos, dicção respeitosa, estrito cumprimento das leis civis nos casamentos e vida consagrada em contínua santificação.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Casamento Religioso com Efeito Civil: Rito e Conformidade Notarial',
                    conteudo: `A celebração do matrimônio evangélico perante o Estado Brasileiro é regida pela Lei Federal nº 1.110/1950 e pelo Artigo 1.515 do Código Civil.

Roteiro litúrgico e jurídico indispensável para o Pastor Presidente:
1) **Conferência Prévia da Certidão de Habilitação**: O pastor só pode celebrar o casamento religioso com efeito civil se os noivos apresentarem com antecedência a Certidão de Habilitação emitida pelo Cartório de Registro Civil;
2) **Entrada e Mensagem Bíblica**: Entrada solene dos noivos com louvores cristãos, leitura de Efésios 5 ou 1 Coríntios 13 e mensagem pastoral bíblica sobre a aliança eterna;
3) **Os Votos Matrimoniais e a Troca de Alianças**: Consentimento público perante Deus e as testemunhas;
4) **A Bênção Matrimonial**: Oração de joelhos no altar abençoando o novo lar;
5) **Assinatura do Termo Religioso com Efeito Civil**: Assinatura imediata do pastor oficiante, dos nubentes e de no mínimo duas testemunhas idôneas para registro cartorário dentro do prazo de 90 dias.`,
                    destaqueExegese: 'Hous ho Theos synezeyxen anthropos me chorizeto (οὓς ὁ Θεὸς συνέζευξεν ἄνθρωπος μὴ χωριζέτω) em Mt 19:6: "O que Deus ajuntou não o separe o homem".',
                    pontosChave: [
                        'Cumprimento rigoroso das normas da Lei de Registros Públicos',
                        'Solenidade e pureza litúrgica na cerimônia do matrimônio',
                        'Votos matrimoniais sagrados proferidos diante de Deus e da igreja',
                        'Assinatura e averbação do termo de efeito civil em cartório'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. A Liturgia Solene da Ceia do Senhor e do Batismo em Águas',
                    conteudo: `Como ministro oficiante principal, o pastor presidente lidera as duas santas ordenanças de Cristo:
- **No Culto de Santa Ceia**:
  - Ministrar a leitura inspirada de 1 Coríntios 11:23-34;
  - Convidar a congregação ao autoexame de consciência e arrependimento;
  - Conduzir a oração de gratidão e consagração do pão e do cálice;
  - Liderar o colégio de presbíteros e diáconos na distribuição solene e ordenada;
  - Ministrar a comunhão simultânea e encerrar com cânticos de júbilo e gratidão.
- **No Culto de Batismo em Águas**:
  - Tomar a confissão pública de fé de cada candidato;
  - Pronunciar com autoridade a fórmula trinitária: "Sob a tua profissão de fé no Senhor Jesus Cristo, eu te batizo em nome do Pai, e do Filho, e do Espírito Santo" (Mt 28:19), submergindo o candidato completamente nas águas.`,
                    destaqueExegese: 'En to onomati tou Patros kai tou Huiou kai tou Hagiou Pneumatos: a fórmula trinitária infalível instituída por Jesus Cristo.',
                    pontosChave: [
                        'Autoridade pastoral e solenidade na mesa sagrada da comunhão',
                        'Condução do autoexame espiritual com base nas Escrituras',
                        'Imersão total nas águas em fidelidade ao mandamento apostólico',
                        'Atmosfera de avivamento, lágrimas e poder pentecostal'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. A Apresentação de Crianças e o Ofício Fúnebre Cristão',
                    conteudo: `O pastor é a voz de bênção no início da vida e a voz de consolo no encerramento da jornada terrena:
- **Dedicação de Crianças (Apresentação ao Senhor)**: As Assembleias de Deus não batizam bebês, mas seguem o exemplo de Jesus em Marcos 10:13-16 e Lucas 2:22. O pastor toma a criança nos braços no altar, intercede com a igreja e profere a bênção sacerdotal de Arão sobre os pais e a criança (Nm 6:24-26);
- **Ofício Fúnebre Cristão (Culto de Consolo)**:
  - Falar com serenidade, afeto e esperança;
  - Não bajular o falecido com discursos falsos nem especular sobre seu destino eterno;
  - Proclamar a vitória de Cristo sobre o aguilhão da morte (1 Co 15:55-57) e a bendita certeza da ressurreição no Arrebatamento (1 Ts 4:13-18);
  - Fazer apelo evangelístico aos familiares e amigos não crentes presentes no velório.`,
                    destaqueExegese: 'Phtheiro eis aphtharsian (φθείρω εἰς ἀφθαρσίαν) em 1 Co 15:42: o que é semeado em corrupção ressuscitará em incorruptibilidade gloriosa.',
                    pontosChave: [
                        'Dedicação bíblica de crianças no altar com bênção sacerdotal',
                        'Consolo pastoral cheio de esperança às famílias enlutadas',
                        'Proclamação inabalável da ressurreição corporal dos salvos',
                        'Evangelização incisiva aos presentes nos ofícios fúnebres'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. A Cerimônia Solene de Ordenação Ministerial e Imposição de Mãos',
                    conteudo: `A ordenação de novos ministros (Presbíteros, Evangelistas e Pastores) é o ápice do governo eclesiástico das Assembleias de Deus (CGADB):
- **Exame Prévio de Doutrina e Caráter**: O candidato é previamente aprovado no Conselho de Doutrina e Ética da Convenção, com histórico comprovado de fidelidade e testemunho civil irrepreensível;
- **Ato Litúrgico de Ordenação**:
  - O candidato e sua esposa ajoelham-se perante o altar do Senhor;
  - O colégio de pastores e a Mesa Diretora da Convenção impõem solenemente as mãos sobre a cabeça do ordenando (1 Tm 4:14; 2 Tm 1:6);
  - Ora-se com clamor pelo derramamento de unção e capacitação do Espírito Santo;
  - O pastor presidente entrega a Bíblia Sagrada e o certificado ministerial de Pastor da CGADB.`,
                    destaqueExegese: 'Epitheseos ton cheiron tou presbyteriou (ἐπιθέσεως τῶν χειρῶν τοῦ πρεσβυτερίου) em 1 Tm 4:14: a imposição solene de mãos do presbitério.',
                    pontosChave: [
                        'Aprovação canônica e escrutínio ético rigoroso pela Convenção',
                        'Imposição de mãos como transmissão de reconhecimento de autoridade',
                        'Clamor profético pelo revestimento ministerial do Espírito',
                        'A Bíblia Sagrada entregue como espada e cajado perpétuo'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. O Código de Ética Pastoral da CGADB e a Conclusão do Magistério Teológico',
                    conteudo: `O Pr. Abrahão Cipriano encerra "Obreiro de Valor" lembrando que o ministério pastoral é uma corrida de perseverança até o fim. O pastor ordenado assume o compromisso solene perante Deus e a CGADB de:
- Viver em santidade pessoal, fidelidade matrimonial inquebrantável e sobriedade;
- Rejeitar o amor ao dinheiro e a corrupção financeira em todas as suas formas;
- Defender a Declaração de Fé das Assembleias de Deus e a sã doutrina bíblica;
- Amar e apascentar as ovelhas de Cristo com paciência, doçura e autoridade santa.

Ao concluir com êxito os 5 níveis da Escola de Formação de Obreiros da Universidade Teológica GIPP (Auxiliar, Diácono, Presbítero, Evangelista e Pastor), o servo de Deus atinge a plenitude de sua capacitação teológica, pronto para conduzir o rebanho do Senhor aos pastos verdejantes da eternidade!`,
                    destaqueExegese: 'Ton dromon teteleka, ten pistin tetereka (τὸν δρόμον τετέλεκα, τὴν πίστιν τετήρηκα) em 2 Timóteo 4:7: "Completei a carreira, guardei a fé".',
                    pontosChave: [
                        'Conclusão triunfal de todo o currículo teológico ministerial GIPP',
                        'Subscrição do Código de Ética Pastoral da CGADB',
                        'Fidelidade inegociável ao Senhor Jesus Cristo até a volta celestial',
                        'A glória perpétua atribuída exclusivamente ao Rei dos Reis e Senhor dos Senhores'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Quais os requisitos jurídicos indispensáveis para que o pastor realize um casamento religioso com efeito civil de acordo com a legislação brasileira?',
                    opcoes: [
                        'Realizar a cerimônia sem qualquer documento e não assinar atas.',
                        'Exigir previamente a Certidão de Habilitação do Cartório de Registro Civil, celebrar o ato conforme o rito religioso, colher assinaturas no termo oficial e providenciar o registro cartorário dentro do prazo legal.',
                        'Cobrar valores monetários sem autorização dos noivos.',
                        'Realizar casamentos secretos sem testemunhas.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O casamento religioso com efeito civil exige prévia habilitação cartorária, celebração com testemunhas e formalização notarial tempestiva.'
                },
                {
                    pergunta: 'Segundo 1 Timóteo 4:14, Tito 1:5 e o livro "Obreiro de Valor" de Abrahão Cipriano, qual o significado bíblico da cerimônia de ordenação com imposição de mãos?',
                    opcoes: [
                        'Uma festa social sem valor espiritual.',
                        'O ato solene e bíblico de reconhecimento, consagração e transmissão de autoridade pastoral pelo presbitério com oração de unção do Espírito Santo.',
                        'A concessão de um título de nobreza imperial terrena.',
                        'Um ritual mágico que perdoa todos os pecados passados e futuros.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A ordenação ministerial com imposição de mãos sela o reconhecimento público do chamado de Deus pelo presbitério e confere autoridade eclesiástica para o pastoreio.'
                }
            ]
        }]
    }
];
