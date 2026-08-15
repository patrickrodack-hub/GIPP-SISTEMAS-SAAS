import { DisciplinaObreiro } from './ModuleFormacaoObreirosData';

export const DISCIPLINAS_DIACONO_PRESBITERO: DisciplinaObreiro[] = [
    // =========================================================================
    // NÍVEL 2: DIÁCONO (5 MÓDULOS COMPLETOS)
    // =========================================================================
    {
        id: 'dc_01',
        nivelId: 'diacono',
        titulo: 'Módulo 1: Diaconia Bíblica & Origem Histórica em Atos 6',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus',
        cargaHoraria: 20,
        ementa: 'A instituição dos Sete em Jerusalém. As qualificações espirituais do diácono segundo 1 Timóteo 3:8-13. A distinção entre diaconia de mesa e o ministério da Palavra.',
        trabalhoSugerido: 'Elaborar um ensaio exegético sobre os requisitos de Atos 6:3 e sua aplicação aos diáconos contemporâneos.',
        licoes: [{
            id: 'lic_dc_01',
            numero: 1,
            titulo: 'Os Sete Homens de Boa Reputação e o Modelo Apostólico',
            introducao: 'O diaconato neotestamentário nasceu para resolver uma crise de assistência às viúvas em Jerusalém, preservando a dedicação dos apóstolos à oração e ao ministério da Palavra.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 11), o diaconato é um ministério de socorro e serviço consagrado instituído pelo Espírito Santo na igreja apostólica.',
            referenciasBiblicas: ['Atos 6:1-7', '1 Timóteo 3:8-13', 'Romanos 16:1-2', 'Filipenses 1:1'],
            aplicacaoPratica: 'O diácono deve administrar os recursos de assistência social com integridade e sabedoria, visitando famílias carentes e desonerando o pastor presidente.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Contexto Histórico da Eleição dos Sete em Atos 6',
                    conteudo: 'Com o rápido crescimento da igreja primitiva, surgiu murmuração entre os judeus helenistas contra os hebreus porque suas viúvas estavam sendo esquecidas na distribuição diária. Os apóstolos propuseram a escolha de homens qualificados para cuidar desse serviço vital.',
                    destaqueExegese: 'Diakonein trapezais (διακονεῖν τραπέζαις): servir às mesas, administrar socorro material e financeiro.',
                    pontosChave: ['Crescimento com organização', 'Cuidado com os necessitados', 'Harmonia no corpo de Cristo']
                },
                {
                    numero: 2,
                    subtitulo: '2. As Quatro Qualificações de Atos 6:3',
                    conteudo: 'Os candidatos precisavam ter: 1) Boa reputação perante a igreja e a sociedade; 2) Ser cheios do Espírito Santo; 3) Ser cheios de sabedoria prática; 4) Disponibilidade comprovada para o trabalho.',
                    destaqueExegese: 'Martyroumenous (μαρτυρουμένους): homens recomendados pelo testemunho público e notório.',
                    pontosChave: ['Reputação sem manchas', 'Plenitude pentecostal', 'Sabedoria e discernimento']
                },
                {
                    numero: 3,
                    subtitulo: '3. As Qualificações Paulinas em 1 Timóteo 3:8-13',
                    conteudo: 'Paulo exige que os diáconos sejam honestos, não de língua dobre, não dados a muito vinho, não cobiçosos de torpe ganância, guardando o mistério da fé com a consciência pura, primeiro experimentados e homens de uma só mulher.',
                    destaqueExegese: 'Dilogous (διλόγους): não dizer uma coisa a alguém e o oposto a outro; ser homem de palavra firme.',
                    pontosChave: ['Veracidade e retidão na fala', 'Honestidade financeira absoluta', 'Vida conjugal monogâmica e santa']
                },
                {
                    numero: 4,
                    subtitulo: '4. A Diaconisa e o Papel Feminino no Serviço Sagrado',
                    conteudo: 'Em Romanos 16:1, Paulo recomenda a irmã Febe, diaconisa da igreja em Cencréia. O corpo de diaconisas nas Assembleias de Deus presta um serviço inestimável no auxílio às irmãs, na Santa Ceia e na visitação maternal.',
                    destaqueExegese: 'Prostatis (προστάτις) em Rm 16:2: benfeitora generosa, protetora e auxiliadora de muitos.',
                    pontosChave: ['Ministério abençoado de Febe', 'Zelo no auxílio às famílias', 'Cooperação com o ministério local']
                },
                {
                    numero: 5,
                    subtitulo: '5. A Promessa de Galardão e Firmeza Espiritual',
                    conteudo: '1 Timóteo 3:13 promete: "Porque os que servirem bem como diáconos adquirirão para si uma boa posição e muita confiança na fé que há em Cristo Jesus". O serviço fiel eleva o obreiro em graça perante o Senhor.',
                    destaqueExegese: 'Bathmon kalon (βαθμὸν καλόν): uma posição honrosa, sólida e respeitável diante de Deus e dos homens.',
                    pontosChave: ['Galardão divino aos servos', 'Crescimento em intrepidez', 'Firmeza doutrinária inabalável']
                }
            ],
            quiz: [
                {
                    pergunta: 'Quais os três requisitos fundamentais exigidos pelos apóstolos em Atos 6:3?',
                    opcoes: [
                        'Riqueza financeira, escolaridade superior e influência política.',
                        'Boa reputação, plenitude do Espírito Santo e sabedoria.',
                        'Parentesco com os apóstolos e dotes oratórios.',
                        'Idade avançada e posse de propriedades.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Atos 6:3 exige homens de boa reputação, cheios do Espírito Santo e de sabedoria.'
                },
                {
                    pergunta: 'O que significa a proibição de ser "de língua dobre" (dilogos) em 1 Tm 3:8?',
                    opcoes: [
                        'Não poder falar línguas estrangeiras.',
                        'Não ser hipócrita ou falso, falando a verdade sem contradições ou fofocas.',
                        'Falar apenas sussurrando.',
                        'Pregar sermões muito longos.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Dilogos refere-se à pessoa dissimulada que diz uma coisa para um e muda de discurso com outro.'
                }
            ]
        }]
    },
    {
        id: 'dc_02',
        nivelId: 'diacono',
        titulo: 'Módulo 2: Liturgia da Santa Ceia & Batismo em Águas por Imersão',
        capituloCGADB: 'Capítulo 12 - O Batismo em Águas & Capítulo 13 - A Ceia do Senhor',
        cargaHoraria: 20,
        ementa: 'A teologia das duas ordenanças bíblicas. O papel direto do diácono no tanque batismal e na distribuição solene da Ceia do Senhor.',
        trabalhoSugerido: 'Elaborar um guia passo a passo da preparação e execução do Batismo em Águas e do culto de Santa Ceia.',
        licoes: [{
            id: 'lic_dc_02',
            numero: 1,
            titulo: 'As Duas Ordenanças do Senhor Jesus Cristo',
            introducao: 'Jesus instituiu duas ordenanças fundamentais para Sua Igreja: o Batismo em Águas como rito de iniciação pública da fé e a Santa Ceia como rito contínuo de comunhão e memorial da expiação.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 12 e 13), o batismo é realizado exclusivamente por imersão em nome do Pai, do Filho e do Espírito Santo, e a Ceia é celebrada em memória da morte de Cristo.',
            referenciasBiblicas: ['Mateus 28:19', 'Romanos 6:3-5', '1 Coríntios 11:23-26', 'Atos 8:36-38'],
            aplicacaoPratica: 'O diácono é o responsável por preparar a água do batistério, auxiliar os candidatos antes e depois da imersão com toalhas e roupões, e zelar pela solenidade de ambos os momentos.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Batismo em Águas por Imersão Total',
                    conteudo: 'A palavra grega baptizo significa mergulhar ou imergir completamente. As Assembleias de Deus não praticam batismo por aspersão nem batismo infantil, exigindo prévia profissão de fé e arrependimento dos pecados (Mt 28:19; At 2:38).',
                    destaqueExegese: 'Baptizo (βαπτίζω): imersão completa, sepultamento e ressurreição simbólica com Cristo.',
                    pontosChave: ['Imersão completa nas águas', 'Fórmula trinitária bíblica', 'Apenas para crentes arrependidos']
                },
                {
                    numero: 2,
                    subtitulo: '2. O Significado Teológico de Romanos 6:3-4',
                    conteudo: 'O batismo representa a identificação pública do crente com a morte, sepultamento e ressurreição de Jesus Cristo. Ao descer às águas, o crente sepulta a velha vida pecaminosa; ao sair das águas, levanta-se para andar em novidade de vida.',
                    destaqueExegese: 'Kainoteti zoes (καινότητι ζωῆς): novidade de vida regenerada e santificada pelo Espírito.',
                    pontosChave: ['Sepultamento do velho homem', 'Ressurreição para nova vida', 'Testemunho público irrevogável']
                },
                {
                    numero: 3,
                    subtitulo: '3. Logística e Segurança no Tanque Batismal',
                    conteudo: 'O diácono deve verificar a temperatura e pureza da água, a estabilidade das escadas do batistério, a organização das vestimentas adequadas para os candidatos e o apoio firme aos pastores durante a imersão.',
                    destaqueExegese: 'Zelo pela dignidade de um momento sagrado e inesquecível.',
                    pontosChave: ['Segurança no batistério', 'Roupas apropriadas e discretas', 'Apoio firme na entrada e saída']
                },
                {
                    numero: 4,
                    subtitulo: '4. A Condução Solene da Mesa da Santa Ceia',
                    conteudo: 'O diácono lidera a equipe de auxiliares na distribuição do pão e do cálice, mantendo alinhamento perfeito, expressão de adoração e rapidez solene para que toda a congregação participe unida.',
                    destaqueExegese: 'Proskuneo (προσκυνέω): atitude de adoração profunda diante do memorial da Cruz.',
                    pontosChave: ['Distribuição harmoniosa', 'Zelo na contagem dos participantes', 'Ordem exemplar em todo o templo']
                },
                {
                    numero: 5,
                    subtitulo: '5. A Ceia Domiciliar aos Irmãos Acamados',
                    conteudo: 'Uma das mais nobres funções diaconais é acompanhar os pastores e presbíteros aos lares de irmãos idosos e enfermos para ministrar a Santa Ceia, levando consolação bíblica e oração com unção de azeite.',
                    destaqueExegese: 'Paraklesis (παράκλησις): consolação e encorajamento aos abatidos pelo sofrimento.',
                    pontosChave: ['Visita com reverência e amor', 'Comunhão estendida aos lares', 'Oração e consolo pastoral']
                }
            ],
            quiz: [
                {
                    pergunta: 'Por que as Assembleias de Deus praticam o batismo exclusivamente por imersão?',
                    opcoes: [
                        'Porque a palavra grega baptizo significa imergir/mergulhar, simbolizando sepultamento e ressurreição com Cristo.',
                        'Por ser mais rápido que a aspersão.',
                        'Por razões culturais modernas sem base no Novo Testamento.',
                        'Apenas por exigência legal do estatuto civil.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'O termo baptizo significa mergulhar completamente, e a imersão reflete o sepultamento e ressurreição em Romanos 6:3-4.'
                },
                {
                    pergunta: 'Qual a fórmula batismal ordenada por Jesus em Mateus 28:19?',
                    opcoes: [
                        'Em nome de um santo padroeiro.',
                        'Em nome do Pai, e do Filho, e do Espírito Santo.',
                        'Apenas em nome da denominação local.',
                        'Sem menção a qualquer nome.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Jesus ordenou batizar em nome da Trindade: Pai, Filho e Espírito Santo.'
                }
            ]
        }]
    },
    {
        id: 'dc_03',
        nivelId: 'diacono',
        titulo: 'Módulo 3: Ação Social da Igreja & Visitação Hospitalar',
        capituloCGADB: 'Capítulo 21 - A Cura Divina & Capítulo 11 - A Igreja de Deus',
        cargaHoraria: 20,
        ementa: 'A assistência aos necessitados como expressão da fé bíblica (Tiago 1:27). Princípios de visitação hospitalar, apoio a famílias enlutadas e oração pelos enfermos.',
        trabalhoSugerido: 'Apresentar um plano de ação social para a congregação incluindo arrecadação de cestas básicas e triagem de famílias.',
        licoes: [{
            id: 'lic_dc_03',
            numero: 1,
            titulo: 'A Religião Pura e o Ministério da Misericórdia',
            introducao: 'Tiago 1:27 define a religião pura e imaculada perante Deus: visitar os órfãos e as viúvas nas suas tribulações e guardar-se incontaminado do mundo.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 11 e 21), a igreja tem a obrigação moral e bíblica de socorrer os necessitados e orar com fé pela cura divina dos enfermos.',
            referenciasBiblicas: ['Tiago 1:27', 'Tiago 5:14-16', 'Mateus 25:35-40', 'Gálatas 2:10', 'Provérbios 19:17'],
            aplicacaoPratica: 'O diácono deve realizar triagem carinhosa das famílias carentes da igreja, entregar cestas básicas com discrição e visitar hospitais respeitando as normas sanitárias.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Teologia da Misericórdia e Socorro aos Pobres',
                    conteudo: 'No julgamento das nações em Mateus 25, Jesus declara: "Em verdade vos digo que, quando a um destes meus pequeninos irmãos o fizestes, a mim o fizestes". O serviço social da igreja não é assistencialismo político, mas adoração prática a Cristo.',
                    destaqueExegese: 'Eleemosune (ἐλεημοσύνη): atos de compaixão e misericórdia motivados pelo amor de Deus.',
                    pontosChave: ['Cristo nos pequeninos', 'Misericórdia como dever sagrado', 'Socorro integral ao ser humano']
                },
                {
                    numero: 2,
                    subtitulo: '2. Triagem e Distribuição Sigilosa de Alimentos',
                    conteudo: 'A distribuição de cestas básicas deve preservar a honra e a dignidade do irmão necessitado. Não se deve expor ninguém em fotos vexatórias em redes sociais para autopromoção.',
                    destaqueExegese: 'Mt 6:3: "Não saiba a tua mão esquerda o que faz a tua direita".',
                    pontosChave: ['Sigilo e preservação da dignidade', 'Critério justo de distribuição', 'Acompanhamento do sustento']
                },
                {
                    numero: 3,
                    subtitulo: '3. Protocolo de Capelania e Visitação Hospitalar',
                    conteudo: 'Ao visitar enfermos em hospitais: 1) Respeitar horários e normas da instituição; 2) Fazer orações breves (1 a 2 minutos); 3) Não discutir diagnósticos médicos; 4) Higienizar as mãos com álcool; 5) Transmitir ânimo, paz e esperança bíblica.',
                    destaqueExegese: 'Episkeptomai (ἐπισκέπτομαι): visitar com cuidado solícito e intenção de aliviar a dor.',
                    pontosChave: ['Respeito às regras do hospital', 'Oração breve e de fé', 'Consolação sem julgamentos']
                },
                {
                    numero: 4,
                    subtitulo: '4. A Oração da Fé e a Cura Divina (Tiago 5:14-15)',
                    conteudo: 'A Declaração de Fé da CGADB crê na atualidade dos milagres e da cura divina. O diácono acompanha os presbíteros na unção com óleo em nome do Senhor, orando com fé pelo restabelecimento da saúde.',
                    destaqueExegese: 'Deesis (δέησις) eficaz: oração fervorosa que move o coração compassivo de Deus.',
                    pontosChave: ['Unção com azeite pelos presbíteros', 'Fé na soberania de Deus', 'Perdão e restauração da alma']
                },
                {
                    numero: 5,
                    subtitulo: '5. Ministério de Apoio no Luto e Sepultamentos',
                    conteudo: 'Nos momentos de perda de um ente querido, o diácono presta suporte logístico à família: organização do velório, recepção dos irmãos, providência de transporte e leitura de textos de consolo da ressurreição (1 Ts 4:13-18).',
                    destaqueExegese: 'Sumpatheo (συμπαθέω): chorar com os que choram e compartilhar da dor alheia.',
                    pontosChave: ['Presença amiga no velório', 'Esperança viva da ressurreição', 'Amparo espiritual aos enlutados']
                }
            ],
            quiz: [
                {
                    pergunta: 'Como deve ser feita a entrega de auxílio social segundo o ensinamento de Jesus (Mt 6:3-4)?',
                    opcoes: [
                        'Com divulgação em massa para autopromoção dos doadores.',
                        'Com discrição e sigilo santo, preservando a dignidade do necessitado.',
                        'Cobrando juros futuros das famílias atendidas.',
                        'Exigindo votos políticos em troca do alimento.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Jesus ensinou a fazer o bem em secreto para honrar exclusivamente a Deus.'
                },
                {
                    pergunta: 'Qual a orientação correta para visitação de enfermos em ambiente hospitalar?',
                    opcoes: [
                        'Fazer orações longas e barulhentas contrariando as ordens médicas.',
                        'Ser breve, respeitar horários e regras sanitárias, ministrando fé, paz e consolação bíblica.',
                        'Criticar os tratamentos prescritos pelos médicos.',
                        'Levar muitas pessoas de uma só vez para dentro da UTI.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A visita hospitalar deve ser prudente, breve, respeitosa das normas e cheia de fé.'
                }
            ]
        }]
    },
    {
        id: 'dc_04',
        nivelId: 'diacono',
        titulo: 'Módulo 4: Administração Patrimonial & Zelo pelo Templo',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Capítulo 14 - O Culto a Deus',
        cargaHoraria: 20,
        ementa: 'A mordomia sobre o patrimônio físico eclesiástico. Segurança predial, manutenção preventiva, preservação dos instrumentos e conformidade legal.',
        trabalhoSugerido: 'Elaborar uma lista de checagem mensal de manutenção preventiva e segurança para o templo local.',
        licoes: [{
            id: 'lic_dc_04',
            numero: 1,
            titulo: 'A Casa de Deus como Lugar de Paz e Ordem',
            introducao: 'Deus é Deus de ordem e não de confusão (1 Co 14:33). O cuidado com o edifício do templo e seus equipamentos é parte integrante do culto racional e da boa mordomia cristã.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 11 e 14), o patrimônio da igreja pertence a Deus e é administrado pela liderança em benefício do culto e da expansão do Reino.',
            referenciasBiblicas: ['1 Coríntios 14:40', 'Ageu 1:4-8', '2 Crônicas 24:4-14', 'Lucas 16:1-2'],
            aplicacaoPratica: 'O diácono deve inspecionar extintores de incêndio, saídas de emergência, equipamentos de som, banheiros e climatização, garantindo conforto e segurança aos adoradores.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Princípio Bíblico da Manutenção do Santuário',
                    conteudo: 'No reinado de Joás (2 Cr 24), o rei ordenou aos sacerdotes e levitas que recolhessem fundos para reparar todas as fendas da Casa do Senhor. Negligenciar o templo físico revela descuido espiritual.',
                    destaqueExegese: 'Bedeq (בֶּדֶק): reparo diligente das fendas e restauração da solidez da estrutura.',
                    pontosChave: ['Zelo pela conservação do templo', 'Manutenção contínua e preventiva', 'Decoro em todas as dependências']
                },
                {
                    numero: 2,
                    subtitulo: '2. Segurança Predial e Prevenção de Sinistros',
                    conteudo: 'A igreja deve cumprir todas as normas legais de segurança: rotas de fuga desobstruídas, sinalização de emergência visível, extintores dentro do prazo de validade e instalações elétricas devidamente aterradas.',
                    destaqueExegese: 'Prudência cristã que preserva vidas e evita tragédias.',
                    pontosChave: ['Rotas de fuga sempre livres', 'Extintores revisados e sinalizados', 'Quadros elétricos protegidos']
                },
                {
                    numero: 3,
                    subtitulo: '3. Mordomia dos Equipamentos de Som e Multimídia',
                    conteudo: 'Microfones, cabos, projetores e instrumentos musicais são adquiridos com dízimos e ofertas sagradas. Devem ser operados com perícia, guardados em locais seguros e mantidos limpos.',
                    destaqueExegese: 'Keli (כְּלִי): vasos e utensílios sagrados consagrados ao serviço do Senhor.',
                    pontosChave: ['Manuseio cuidadoso dos microfones', 'Armazenamento adequado', 'Treinamento de operadores']
                },
                {
                    numero: 4,
                    subtitulo: '4. Higiene e Acessibilidade nas Instalações',
                    conteudo: 'Os sanitários da igreja devem estar impecavelmente limpos e providos de sabonete e papel toalha. O templo deve oferecer rampas de acesso para cadeirantes e assentos preferenciais para idosos.',
                    destaqueExegese: 'Katharos (καθαρός): limpeza física que reflete a pureza do ambiente sagrado.',
                    pontosChave: ['Sanitários higienizados', 'Acessibilidade universal', 'Conforto térmico e acústico']
                },
                {
                    numero: 5,
                    subtitulo: '5. Gestão de Chaves e Fechamento do Templo',
                    conteudo: 'O diácono de escala é responsável pela abertura pontual e pelo fechamento seguro do imóvel, checando janelas, trincos, alarmes e desligamento de aparelhos de ar-condicionado.',
                    destaqueExegese: 'Pistis (πίστις): fidelidade de quem cuida dos bens de outrem como se fossem seus.',
                    pontosChave: ['Abertura 1 hora antes do culto', 'Fechamento minucioso pós-culto', 'Economia consciente de energia']
                }
            ],
            quiz: [
                {
                    pergunta: 'Por que o cuidado com o templo físico é dever ministerial do diácono?',
                    opcoes: [
                        'Porque Deus é Deus de ordem e a boa conservação reflete o temor do Senhor e a mordomia dos dízimos.',
                        'Para poder alugar o templo para festas seculares.',
                        'Apenas para valorização imobiliária financeira.',
                        'Porque a Bíblia proíbe reformas estruturais.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'A manutenção do templo glorifica a Deus e garante dignidade e segurança aos santos reunidos.'
                },
                {
                    pergunta: 'Qual norma de segurança básica nunca deve ser violada no templo?',
                    opcoes: [
                        'Manter as saídas de emergência trancadas com correntes durante o culto.',
                        'Manter rotas de fuga e portas de saída totalmente desobstruídas e sinalizadas.',
                        'Desativar extintores de incêndio.',
                        'Ignorar fios elétricos desencapados.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Rotas de fuga e saídas devem estar sempre livres e acessíveis em caso de qualquer evacuação.'
                }
            ]
        }]
    },
    {
        id: 'dc_05',
        nivelId: 'diacono',
        titulo: 'Módulo 5: Ética Ministerial, Fidelidade & Submissão Pastoral',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Capítulo 24 - A Família',
        cargaHoraria: 20,
        ementa: 'A hierarquia eclesiástica bíblica. O princípio da honra pastoral (1 Tm 5:17). A discrição nos assuntos confidenciais e a resolução santa de conflitos.',
        trabalhoSugerido: 'Escrever uma resenha sobre a lealdade ministerial com base no relacionamento entre Davi e Jônatas e as advertências de Números 12.',
        licoes: [{
            id: 'lic_dc_05',
            numero: 1,
            titulo: 'A Honra Ministerial e a Preservação da Unidade',
            introducao: 'Nenhum ministério sobrevive sem lealdade e submissão à liderança estabelecida por Deus. A insubordinação e a murmuração foram severamente punidas no deserto e destroem igrejas locais.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 11), os membros e oficiais devem respeitar e honrar os pastores que os presidem no Senhor, obedecendo às suas orientações doutrinárias e pastorais.',
            referenciasBiblicas: ['Hebreus 13:17', '1 Timóteo 5:17-19', '1 Tessalonicenses 5:12-13', 'Números 12:1-10', 'Salmo 133:1'],
            aplicacaoPratica: 'O diácono deve defender a integridade e honra do seu pastor presidente, jamais participar de panelinhas ou críticas de corredores, e manter sigilo absoluto sobre aconselhamentos.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Princípio Bíblico da Submissão Pastoral (Hb 13:17)',
                    conteudo: 'As Escrituras ordenam: "Obedecei a vossos pastores e sujeitai-vos a eles; porque velam por vossas almas, como aqueles que hão de dar conta delas; para que o façam com alegria e não gemendo". A autoridade pastoral é delegada por Cristo.',
                    destaqueExegese: 'Peithesthe (πείθεσθε): confiar e deixar-se guiar voluntariamente por amor e respeito.',
                    pontosChave: ['Submissão voluntária e bíblica', 'O pastor dará contas a Deus', 'Facilitar o trabalho da liderança']
                },
                {
                    numero: 2,
                    subtitulo: '2. A Gravidade Espiritual da Murmuração e Rebelião',
                    conteudo: 'A história de Miriã e Arão em Números 12 e a rebelião de Corá em Números 16 demonstram que criticar a liderança constituída por Deus atrai juízo severo. O diácono deve ser promotor de paz.',
                    destaqueExegese: 'Gongysmos (γογγυσμός): murmuração sussurrada que semeia divisão e discórdia.',
                    pontosChave: ['Rejeição total à murmuração', 'Não ouvir fofocas sobre obreiros', 'Resolver dúvidas em particular']
                },
                {
                    numero: 3,
                    subtitulo: '3. A Honra Dobrada aos Presbíteros e Pastores',
                    conteudo: '1 Timóteo 5:17 prescreve que os pastores que governam bem sejam tidos por dignos de duplicada honra, especialmente os que trabalham na pregação e no ensino da Palavra.',
                    destaqueExegese: 'Diples times (διπλῆς τιμῆς): honra dobrada, abrangendo respeito espiritual e dignidade material.',
                    pontosChave: ['Respeito ao chamado do pastor', 'Cuidado com suas necessidades', 'Oração diária pela família pastoral']
                },
                {
                    numero: 4,
                    subtitulo: '4. Sigilo Ético e Confidencialidade Ministerial',
                    conteudo: 'Ao acompanhar os pastores em visitas ou presenciar situações delicadas de membros, o diácono deve guardar segredo absoluto. Revelar confidências é pecado e destrói o ministério.',
                    destaqueExegese: 'Krupton (κρυπτόν): guardar no recôndito da alma o que foi confiado em oração.',
                    pontosChave: ['Sigilo inviolável', 'Discrição absoluta no falar', 'Confiança inabalável da liderança']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese e Coroação da Formação Diaconal',
                    conteudo: 'O diaconato bem exercido é a melhor escola para futuros presbíteros e pastores. A humildade no servir e a fidelidade inegociável produzem frutos que permanecem para a eternidade.',
                    destaqueExegese: 'Doulos (δοῦλος): servo por amor que encontra sua maior glória em agradar ao Mestre.',
                    pontosChave: ['Humildade inalterável', 'Amor sacrificial pela igreja', 'Preparação contínua para o Reino']
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual a ordem apostólica em Hebreus 13:17 a respeito da liderança pastoral?',
                    opcoes: [
                        'Desobedecer sempre que houver discordâncias de gosto pessoal.',
                        'Obedecer e sujeitar-se aos pastores que velam pelas almas, para que sirvam com alegria.',
                        'Concorrer com o pastor na liderança do rebanho.',
                        'Submeter os pastores a julgamentos públicos mensais.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A Bíblia ordena obediência e submissão aos líderes que velam pelas almas no Senhor.'
                },
                {
                    pergunta: 'O que o diácono deve fazer caso alguém venha lhe falar mal do pastor presidente?',
                    opcoes: [
                        'Concordar e espalhar a informação para mais irmãos.',
                        'Repreender a fofoca com mansidão, defender a liderança e orientar a pessoa a conversar diretamente com o pastor.',
                        'Criar um grupo anônimo de mensagens para criticar o pastor.',
                        'Abandonar a congregação imediatamente.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O obreiro leal não dá ouvidos à murmuração e orienta a reconciliação segundo Mateus 18.'
                }
            ]
        }]
    }
];
