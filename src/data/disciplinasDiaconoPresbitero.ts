import { DisciplinaObreiro } from './ModuleFormacaoObreirosData';

export const DISCIPLINAS_DIACONO_PRESBITERO: DisciplinaObreiro[] = [
    // =========================================================================
    // NÍVEL 2: DIÁCONO (5 MÓDULOS COMPLETOS DE ALTA DENSIDADE TEOLÓGICA)
    // Alinhamento: Declaração de Fé CGADB/CPAD & Livro "Obreiro de Valor" (Pr. Abrahão Cipriano)
    // =========================================================================
    {
        id: 'dc_01',
        nivelId: 'diacono',
        titulo: 'Módulo 1: A Diaconia Neotestamentária, Origem em Atos 6 & Os Requisitos Paulinos',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Obreiro de Valor (Abrahão Cipriano)',
        cargaHoraria: 20,
        ementa: 'A instituição eclesiástica dos Sete em Atos 6 para o serviço das mesas e a preservação do ministério apostólico da oração e da Palavra. A exegese minuciosa dos requisitos morais, espirituais, familiares e vocacionais de 1 Timóteo 3:8-13. A pureza de caráter, a honestidade no falar (não de língua dobre) e a integridade financeira do diácono de valor segundo o Pr. Abrahão Cipriano.',
        trabalhoSugerido: 'Elaborar um ensaio exegético e pastoral de 3 páginas analisando as três qualificações essenciais de Atos 6:3 (Boa Reputação, Plenitude do Espírito e Sabedoria) e sua aplicação prática no ministério diaconal contemporâneo.',
        licoes: [{
            id: 'lic_dc_01',
            numero: 1,
            titulo: 'Os Sete Homens de Boa Reputação, o Ministério de Socorro e as Qualificações de 1 Timóteo 3',
            introducao: 'O diaconato cristão nasceu no seio da igreja primitiva em Jerusalém em resposta a uma crise de crescimento e equidade social: a murmuração dos judeus helenistas contra os hebreus porque suas viúvas estavam sendo desassistidas na distribuição diária (Atos 6:1-7). Os apóstolos propuseram a consagração de servos aprovados para que os líderes principais pudessem dedicar-se sem interrupção à oração contínua e ao ministério da Palavra. Como ensina com maestria o Pr. Abrahão Cipriano em "Obreiro de Valor", o diácono é o ministro do serviço abnegado, das mãos estendidas aos aflitos e da guarda da harmonia interna da congregação.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé das Assembleias de Deus (CGADB/CPAD, Capítulo 11), o diaconato é um ofício ministerial bíblico e permanente na igreja local, instituído pelo Espírito Santo para o exercício da beneficência, do socorro aos santos e da assistência litúrgica nos cultos e sacramentos. Em perfeita harmonia com "Obreiro de Valor", o diácono deve possuir reputação ilibada, viver cheio do Espírito Santo e governar sua casa com santidade e amor.',
            referenciasBiblicas: ['Atos 6:1-7', '1 Timóteo 3:8-13', 'Romanos 16:1-2', 'Filipenses 1:1', 'Mateus 20:26-28', 'Gálatas 5:13'],
            aplicacaoPratica: 'O diácono deve administrar os recursos de assistência social com integridade e sabedoria, visitar famílias carentes e viúvas sem alarde, manter lealdade absoluta ao pastor presidente, falar sempre a verdade sem dissimulação e liderar pelo exemplo irrepreensível de serviço voluntário.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Contexto Histórico e a Crise Social em Atos 6',
                    conteudo: `A igreja apostólica em Jerusalém experimentava um crescimento numérico vertiginoso sob o derramamento pentecostal. Contudo, a expansão trouxe tensões culturais e administrativas: os judeus de língua grega (helenistas) queixavam-se de que suas viúvas eram preteridas na distribuição alimentar diária em favor das viúvas de língua hebraica/aramaica.

Os doze apóstolos convocaram a multidão dos discípulos e proferiram uma declaração seminal de governo eclesiástico: "Não é razoável que nós deixemos a palavra de Deus e sirvamos às mesas" (At 6:2). A solução divina não foi extinguir a assistência social nem sobrecarregar os apóstolos até a exaustão espiritual, mas instituir uma nova ordem de servos consagrados.

Em "Obreiro de Valor", o Pr. Abrahão Cipriano salienta que a diaconia não é um trabalho subalterno ou desprezível, mas uma trincheira espiritual indispensável para preservar o ministério da oração e do ensino da congregação.`,
                    destaqueExegese: 'Diakonein trapezais (διακονεῖν τραπέζαις): servir às mesas, administrar recursos materiais e gerir a assistência com zelo e justiça.',
                    pontosChave: [
                        'Crescimento da igreja acompanhado de organização ministerial eclesiástica',
                        'Preservação da primazia da oração e do ministério da Palavra para o pastorado',
                        'A diaconia como ministério de honra, socorro prático e justiça social',
                        'A imposição de mãos dos apóstolos após a oração solene da comunidade'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. As Três Qualificações Fundamentais de Atos 6:3',
                    conteudo: `O colégio apostólico não buscou homens influentes pela riqueza econômica ou eloquência oratória, mas estabeleceu três critérios espirituais inegociáveis:
1) **Boa Reputação (Martyroumenous)**: Homens cujo testemunho de vida fosse atestado publicamente tanto dentro da igreja quanto perante os não convertidos da sociedade civil;
2) **Cheios do Espírito Santo (Pleres Pneumatos)**: Homens regenerados e batizados no Espírito Santo, cuja conduta evidenciasse a presença operante do Fruto do Espírito (Gl 5:22-23);
3) **Cheios de Sabedoria (Pleres Sophias)**: Prudência celestial, equilíbrio emocional e discernimento prático para administrar bens, resolver conflitos interpessoais e lidar com pessoas em vulnerabilidade extrema.

Abrahão Cipriano destaca em "Obreiro de Valor" que quando homens com essas qualificações assumem a diaconia, o resultado é multiplicação e paz: "E crescia a palavra de Deus, e em Jerusalém se multiplicava muito o número dos discípulos" (At 6:7).`,
                    destaqueExegese: 'Martyroumenous (μαρτυρουμένους): indivíduos recomendados por um histórico comprovado de retidão moral e fidelidade.',
                    pontosChave: [
                        'Reputação ilibada e atestada pela comunidade dos crentes',
                        'Plenitude do Espírito Santo como motor da ação diaconal',
                        'Sabedoria divina e equilíbrio para gerenciar crises e recursos',
                        'Multiplicação do Evangelho como consequência de uma liderança saudável'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. A Exegese Paulina das Qualificações do Diácono em 1 Timóteo 3:8-13',
                    conteudo: `O apóstolo Paulo dedica instruções precisas a Timóteo sobre o caráter do corpo diaconal:
- **Honestos (Semnous)**: Homens dignos, sérios, honrados e de conduta venerável;
- **Não de Língua Dobre (Me Dilogous)**: Homens que não sejam falsos ou dissimulados, que não digam uma coisa a um irmão e o oposto a outro para agradar conveniências carnais;
- **Não Dados a Muito Vinho (Me Oino Pollo Prosechontas)**: Total sobriedade e abstinência de bebidas inebriantes e vícios que entorpeçam o juízo moral;
- **Não Cobiçosos de Torpe Ganância (Me Aischrokerdeis)**: Honestidade financeira inatacável, incapazes de desviar recursos da igreja ou agir por amor ao dinheiro;
- **Guardando o Mistério da Fé com a Consciência Pura**: Firmeza inabalável na sã doutrina da Declaração de Fé da CGADB aliada a uma vida sem hipocrisia;
- **Primeiro Experimentados (Dokimazesthosan Proton)**: Homens provados no tempo, cuja fidelidade foi comprovada antes da ordenação solene.`,
                    destaqueExegese: 'Dilogous (διλόγους): homem de fala bifurcada; hipócrita que semeia intrigas e diz palavras contraditórias para manipular pessoas.',
                    pontosChave: [
                        'Semnos: gravidade respeitosa e dignidade de conduta cristã',
                        'Veracidade incondicional no falar e combate frontal à fofoca',
                        'Integridade financeira e repúdio a qualquer avareza ou corrupção',
                        'Comprovação prévia do caráter através de um estágio aprovado'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. O Lar do Diácono, a Monogamia e o Ministério das Diaconisas',
                    conteudo: `Em 1 Timóteo 3:12, o apóstolo afirma: "Os diáconos sejam maridos de uma só mulher e governem bem a seus filhos e suas próprias casas". O matrimônio do diácono deve ser monogâmico, heterossexual, pautado na fidelidade mútua e na liderança espiritual amorosa.

Em 1 Timóteo 3:11 e Romanos 16:1-2, o texto bíblico reconhece a atuação abençoada das mulheres consagradas: "Recomendo-vos a nossa irmã Febe, que serve na igreja que está em Cencréia". Nas Assembleias de Deus, as diaconisas exercem um ministério de valor inestimável no acolhimento a mulheres, preparação do batistério feminino, visitação maternal e assistência aos necessitados.

O Pr. Abrahão Cipriano enfatiza que a esposa do diácono deve ser igualmente santa, não maldizente (me diabolous), sóbria e fiel em tudo, sendo parceira inseparável do ministério do marido.`,
                    destaqueExegese: 'Mias gunaikos andres (μιᾶς γυναικὸς ἄνδρες): homem devotado com fidelidade exclusiva e amor sacrificial à sua única esposa.',
                    pontosChave: [
                        'Casamento cristão modelo e testemunho irrepreensível no lar',
                        'O ministério sublime das diaconisas na história da igreja e na atualidade',
                        'A esposa do obreiro como cooperadora santa e não maldizente',
                        'Educação dos filhos no caminho do Senhor'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. A Promessa de Galardão e a Firmeza da Fé (1 Timóteo 3:13)',
                    conteudo: `Paulo encerra as instruções sobre o diaconato com uma promessa inspiradora em 1 Timóteo 3:13: "Porque os que servirem bem como diáconos adquirirão para si uma boa posição e muita confiança na fé que há em Cristo Jesus".

O termo grego bathmon kalon alude a um degrau elevado de respeito moral e autoridade espiritual conferido por Deus perante a congregação. Aquele que serve aos santos com humildade de servo de Cristo ganha autoridade no mundo espiritual e intrepidez inabalável no anúncio da fé.

Como sintetiza o Pr. Abrahão Cipriano em "Obreiro de Valor", o verdadeiro valor do diácono não está na farda ou na placa do templo, mas na toalha de servo com a qual ele lava os pés dos seus irmãos, refletindo o exemplo de Jesus Cristo que veio para servir e dar Sua vida em resgate de muitos.`,
                    destaqueExegese: 'Bathmon kalon (βαθμὸν καλόν): uma posição eclesiástica sólida, respeitável e honrada perante Deus e a Igreja.',
                    pontosChave: [
                        'Galardão celestial e respeito honroso concedido aos servos fiéis',
                        'Crescimento em intrepidez espiritual e autoridade no orar e pregar',
                        'A essência do ministério cristão fundamentada na toalha de servo de Jesus',
                        'Consagração diária para manter o vaso puro nas mãos do Senhor'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Quais os três requisitos fundamentais exigidos pelos apóstolos em Atos 6:3 para a escolha dos primeiros diáconos?',
                    opcoes: [
                        'Status socioeconômico elevado, graduação acadêmica secular e parentesco com líderes.',
                        'Boa reputação pública, plenitude do Espírito Santo e sabedoria prática divina.',
                        'Eloquência oratória teatral e capacidade de atrair multidões com entretenimento.',
                        'Idade mínima de 60 anos e posse de propriedades rurais.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Atos 6:3 exige testemunho irrepreensível (boa reputação), poder pentecostal interior (cheios do Espírito) e discernimento espiritual prudente (cheios de sabedoria).'
                },
                {
                    pergunta: 'O que o apóstolo Paulo condena ao exigir que os diáconos não sejam "de língua dobre" (dilogos em 1 Timóteo 3:8)?',
                    opcoes: [
                        'O falar em outras línguas pelo Espírito Santo.',
                        'A falsidade, a dissimulação e a fofoca de dizer uma coisa a alguém e o oposto a outro para manipular conveniências.',
                        'O ato de pregar sermões em dois idiomas diferentes.',
                        'O sotaque regional no falar cotidiano.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Dilogos condena a hipocrisia de quem possui palavra dúplice, semeando intrigas e falando falsidades conforme a conveniência.'
                }
            ]
        }]
    },
    {
        id: 'dc_02',
        nivelId: 'diacono',
        titulo: 'Módulo 2: Liturgia da Santa Ceia, Batismo nas Águas & Ofícios Sacramentais',
        capituloCGADB: 'Capítulo 12 - O Batismo em Águas & Capítulo 14 - A Ceia do Senhor',
        cargaHoraria: 20,
        ementa: 'A teologia bíblica e a execução litúrgica das duas ordenanças perpétuas de Cristo: O Batismo em Águas por imersão total (CGADB Cap. 12) e a celebração da Santa Ceia do Senhor (CGADB Cap. 14). A logística e a solenidade do batistério. A ministração da Santa Ceia nos lares para irmãos enfermos e acamados segundo as orientações de "Obreiro de Valor".',
        trabalhoSugerido: 'Elaborar um Manual de Procedimentos Litúrgicos do Diaconato para o Culto de Batismo em Águas e o Culto de Santa Ceia do Senhor, detalhando a logística de preparação, execução e atendimento pastoral.',
        licoes: [{
            id: 'lic_dc_02',
            numero: 1,
            titulo: 'A Sacralidade das Ordenanças de Cristo e o Apoio Diaconal no Batismo e na Ceia',
            introducao: 'O Senhor Jesus ordenou à Sua Igreja dois memoriais sagrados que atravessam as dispensações: o Batismo em Águas como proclamação pública do sepultamento da velha criatura e da ressurreição em Cristo (Rm 6:3-4), e a Santa Ceia como contínua celebração do sacrifício do Calvário até o Seu retorno glorioso (1 Co 11:26). O Pr. Abrahão Cipriano ensina em "Obreiro de Valor" que o diácono é o guardião litúrgico desses momentos supremos, operando nos bastidores e no altar com solenidade, reverência e atenção aos mínimos detalhes.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 12 e 14), o batismo é ministrado exclusivamente por imersão completa em águas correntes ou batistério, em nome do Pai, do Filho e do Espírito Santo, aos que verdadeiramente se arrependeram de seus pecados. A Santa Ceia é o memorial da redenção participado por crentes em plena comunhão espiritual.',
            referenciasBiblicas: ['Mateus 28:19', 'Romanos 6:3-5', '1 Coríntios 11:23-34', 'Marcos 16:16', 'Atos 8:36-39', '1 Coríntios 10:16-17'],
            aplicacaoPratica: 'O diácono deve inspecionar as condições do batistério, recepcionar e apoiar com dignidade os candidatos ao batismo, liderar a preparação dos cálices e do pão asmo na Ceia e acompanhar os pastores na ministração da Ceia domiciliar aos irmãos enfermos.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Teologia do Batismo por Imersão Total (Baptizo)',
                    conteudo: `A palavra grega empregada no Novo Testamento para o batismo é baptizo (βαπτίζω), cujo significado literal e histórico é mergulhar, submergir completamente ou cobrir com água. A Declaração de Fé da CGADB rejeita categoricamente o batismo por aspersão (derramamento de gotas) e o pedobatismo (batismo de recém-nascidos), fundamentando que o rito exige consciência moral, fé pessoal e arrependimento prévio (Mc 16:16; At 2:38).

Ao descer às águas do batistério, o candidato simboliza a sua morte e sepultamento com Cristo; ao emergir das águas, proclama que ressuscitou para viver uma nova vida regenerada pelo Espírito Santo (Rm 6:4).

O diácono participa desse marco espiritual histórico na vida de cada irmão, cuidando para que tudo ocorra com a máxima dignidade espiritual.`,
                    destaqueExegese: 'Synetaphemen (συνετάφημεν) em Romanos 6:4: "fomos sepultados juntamente com Ele pelo batismo na morte", selando o fim da soberania do pecado.',
                    pontosChave: [
                        'Imersão total como fidelidade hermenêutica ao grego bíblico',
                        'Exigência bíblica inegociável de fé e arrependimento prévio',
                        'O batismo como confissão pública e sepultamento do velho homem',
                        'A fórmula trinitária ordenada por Jesus: Pai, Filho e Espírito Santo'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. Logística, Organização e Segurança no Culto Batismal',
                    conteudo: `Em "Obreiro de Valor", o Pr. Abrahão Cipriano delineia as responsabilidades práticas do corpo de diáconos e diaconisas no dia do batismo em águas:
- **Inspeção do Tanque**: Abastecer com água limpa em volume adequado, verificar a firmeza do corrimão e das escadas antiderrapantes e conferir a temperatura da água;
- **Roupões e Vestimentas**: Distribuir vestes batismais alvas e opacas, com tecidos adequados que não fiquem transparentes ao contato com a água, preservando a modéstia cristã;
- **Auxílio no Tanque**: Dois diáconos posicionam-se estrategicamente dentro ou nas margens do tanque para amparar o pastor oficiante e garantir a segurança do candidato na entrada e na saída;
- **Acolhimento com Toalhas**: As diaconisas e auxiliares envolvem os novos batizados com toalhas secas e os conduzem aos vestiários em perfeita ordem.`,
                    destaqueExegese: 'Eutaktos (εὐτάκτως): com ordem excelente, disciplina e planejamento que honram o santuário de Deus.',
                    pontosChave: [
                        'Inspeção prévia minuciosa das instalações do batistério',
                        'Preservação incondicional do decoro e da modéstia nas vestes',
                        'Apoio físico firme ao pastor e aos candidatos de todas as idades',
                        'Alegria santa e atmosfera de avivamento pentecostal no batismo'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. A Celebração da Santa Ceia do Senhor e a Distribuição Eucarística',
                    conteudo: `A Santa Ceia é a ordenança que reúne a família da fé para celebrar a redenção. O diácono desempenha um papel central na administração do culto de Ceia:
- **Preparação da Mesa**: As toalhas de linho alvo, os pães asmos (sem fermento) partidos com decência e as bandejas com os cálices de suco da videira são higienizados e cobertos com o véu sagrado;
- **Momento da Oração e Distribuição**: Sob a ordem do pastor presidente, os presbíteros e diáconos avançam para a mesa. Após a oração de consagração e a bênção de gratidão, os diáconos distribuem os elementos aos irmãos sentados na nave, mantendo alinhamento solene e reverente;
- **Atenção aos Participantes**: Garantir que nenhum irmão em plena comunhão seja ignorado, incluindo os oficiais que estão servindo e os músicos do grupo de louvor.`,
                    destaqueExegese: 'Koinonia tou somatos tou Christou (κοινωνία τοῦ σώματος τοῦ Χριστοῦ) em 1 Co 10:16: a comunhão sagrada e profunda no corpo de Cristo.',
                    pontosChave: [
                        'Preparação pura e reverente dos elementos da mesa',
                        'Alinhamento e passos sincronizados durante a distribuição',
                        'Inclusão respeitosa de todos os membros aptos da assembleia',
                        'Atmosfera de adoração, contrição e júbilo santo'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. A Ceia Domiciliar e Hospitalar aos Irmãos Acamados',
                    conteudo: `Muitos santos veteranos, enfermos crônicos e idosos que foram colunas da igreja durante décadas encontram-se impossibilitados fisicamente de comparecer ao templo. O ministério diaconal estende a mesa da comunhão até os seus leitos.

Abrahão Cipriano ensina em "Obreiro de Valor" como realizar a Ceia domiciliar:
1) Agendar previamente com a família em horário de descanso confortável para o enfermo;
2) Portar o estojo de Ceia devidamente higienizado com toalha alva, cálices selados e o pão;
3) Ler uma passagem reconfortante da Palavra de Deus (Sl 23; Jo 14; 1 Co 11);
4) Ministrar a Ceia com oração de gratidão e, se solicitado, ungir o enfermo com óleo em nome do Senhor (Tg 5:14);
5) Não sobrecarregar a casa com visitas demoradas, encerrando o momento com a bênção da paz.`,
                    destaqueExegese: 'Paraklesis (παράκλησις): consolação e encorajamento aos abatidos pela dor física e pela solidão.',
                    pontosChave: [
                        'Cuidado pastoral e inclusão dos membros idosos e acamados',
                        'Uso de estojo litúrgico consagrado e higienizado',
                        'Leitura da Palavra e oração fervorosa da fé com unção',
                        'Testemunho de amor da igreja que jamais abandona suas ovelhas'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. O Diácono como Sentinela da Unidade Eclesiástica',
                    conteudo: `Em Efésios 4:3, a Escritura ordena: "Procurando guardar a unidade do Espírito pelo vínculo da paz". Em torno da mesa do Senhor e das águas batismais, toda a congregação proclama que é um só corpo, sob um só Senhor, uma só fé e um só batismo.

O diácono de valor atua como um pacificador ativo. Quando detecta mágoas, divisões ou intrigas entre membros, não toma partido faccioso, mas busca reconciliar os irmãos no espírito do Evangelho de Cristo (Mt 5:9, 23-24).

Ele entende que a celebração da Santa Ceia sem a vivência do amor fraternal torna o culto hipócrita e atrai juízo espiritual. Portanto, seu ministério promove a paz, a pureza e a fidelidade doutrinária inabalável.`,
                    destaqueExegese: 'Syndesmos tes eirenes (σύνδεσμος τῆς εἰρήνης): o elo indestrutível da paz de Cristo que une os crentes em um só coração.',
                    pontosChave: [
                        'Guarda da unidade do Espírito e da paz na comunidade',
                        'Atuação como embaixador do perdão e da reconciliação mútua',
                        'Defesa da santidade da congregação diante do Senhor',
                        'Fidelidade inabalável aos compromissos da vocação cristã'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Por que a Declaração de Fé da CGADB rejeita o batismo de bebês (pedobatismo) e a aspersão?',
                    opcoes: [
                        'Porque a palavra grega baptizo exige imersão total e as Escrituras exigem fé consciente e arrependimento prévio dos pecados, o que um recém-nascido não pode exercer.',
                        'Por ser um método mais demorado de celebração litúrgica.',
                        'Porque as crianças não são amadas por Deus no Novo Testamento.',
                        'Por razões meramente financeiras e administrativas.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'O Novo Testamento estabelece que o batismo por imersão é para aqueles que creram e se arrependeram pessoalmente de seus pecados (Mc 16:16).'
                },
                {
                    pergunta: 'De acordo com as diretrizes pastorais de "Obreiro de Valor", qual a conduta ao ministrar a Santa Ceia domiciliar a um irmão acamado?',
                    opcoes: [
                        'Fazer uma visita longa de várias horas para debater assuntos seculares e pedir doações.',
                        'Agendar previamente, usar estojo litúrgico com higiene, ler a Palavra, orar com fé e ministrar os elementos com amor e serenidade.',
                        'Proibir que a família do enfermo participe da oração.',
                        'Cobrar uma taxa pastoral para realizar a visita ao leito.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A Santa Ceia domiciliar deve ser solene, higiênica, edificante, respeitosa com o descanso do enfermo e focada na comunhão e na oração da fé.'
                }
            ]
        }]
    },
    {
        id: 'dc_03',
        nivelId: 'diacono',
        titulo: 'Módulo 3: Ação Social, Capelania Hospitalar & Visitação aos Enfermos',
        capituloCGADB: 'Capítulo 21 - A Cura Divina & Capítulo 11 - A Igreja de Deus',
        cargaHoraria: 20,
        ementa: 'A teologia bíblica da misericórdia cristã e do socorro aos órfãos e viúvas (Tiago 1:27). Princípios de triagem sigilosa de famílias vulneráveis e arrecadação de alimentos. Protocolo de capelania hospitalar e visitação a leitos de UTI segundo as normas sanitárias e a ética ministerial de "Obreiro de Valor". A oração da fé pela cura divina dos enfermos (Tg 5:14-16).',
        trabalhoSugerido: 'Desenvolver um Projeto de Assistência Social e Capelania Integrada para a congregação, contendo ficha de triagem sigilosa de cestas básicas e roteiro ético de oração em ambientes hospitalares.',
        licoes: [{
            id: 'lic_dc_03',
            numero: 1,
            titulo: 'A Religião Pura, o Socorro aos Necessitados e o Ministério de Cura Divina',
            introducao: 'Em Tiago 1:27, as Escrituras estabelecem o padrão áureo da espiritualidade cristã autêntica: "A religião pura e imaculada para com Deus, o Pai, é esta: Visitar os órfãos e as viúvas nas suas tribulações e guardar-se da corrupção do mundo". Como ensina o Pr. Abrahão Cipriano em "Obreiro de Valor", o diaconato é o coração compassivo da igreja batendo em favor dos aflitos, dos desempregados, dos órfãos e dos que jazem em leitos de dor.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 11 e 21), a Igreja de Cristo é convocada a manifestar o amor prático de Deus através de obras de caridade sincera, e crê na contemporaneidade da Cura Divina como promessa operada pelo poder soberano de Deus em resposta à oração da fé.',
            referenciasBiblicas: ['Tiago 1:27', 'Tiago 5:14-16', 'Mateus 25:35-40', 'Gálatas 2:10', 'Provérbios 19:17', 'Isaías 53:4-5', 'Marcos 16:17-18'],
            aplicacaoPratica: 'O diácono deve organizar campanhas de alimentos com transparência, cadastrar famílias carentes sem expô-las a humilhações públicas, visitar hospitais com respeito às normas de biossegurança e interceder com fé inabalável pela recuperação dos enfermos.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Teologia da Compaixão e o Julgamento das Nações em Mateus 25',
                    conteudo: `O Senhor Jesus Cristo identificou-Se de maneira profunda com os desamparados da terra: "Porque tive fome, e destes-me de comer; tive sede, e destes-me de beber; era estrangeiro, e hospedastes-me; estava nu, e vestistes-me; adoeci, e visitastes-me; estive na prisão, e fostes ver-me... Em verdade vos digo que, quando a um destes meus pequeninos irmãos o fizestes, a mim o fizestes" (Mt 25:35-36, 40).

A ação social da igreja assembleiana não se confunde com ativismo partidário, nem com assistencialismo paternalista que gera dependência. É um ato de culto vivo e gratidão a Jesus Cristo.

Em "Obreiro de Valor", o Pr. Abrahão Cipriano afirma que um ministério que fecha os olhos para a fome do seu próprio irmão de congregação está com a espiritualidade apodrecida diante do Altíssimo (1 Jo 3:17-18).`,
                    destaqueExegese: 'Eleemosune (ἐλεημοσύνη): socorro misericordioso e espontâneo motivado pelo amor divino sem esperar retorno.',
                    pontosChave: [
                        'Cristo presente na pessoa dos necessitados e vulneráveis',
                        'Ação social bíblica como expressão genuína da fé cristã',
                        'Diferença entre filantropia secular e misericórdia cristã no Espírito',
                        'Responsabilidade prioritária com os domésticos da fé (Gálatas 6:10)'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. Triagem Sigilosa e Preservação da Dignidade Humana',
                    conteudo: `Ao recolher e distribuir mantimentos e recursos de emergência, o corpo diaconal deve seguir rigorosos princípios de ética e discrição cristã:
1) **Sigilo Absoluto**: Jamais divulgar nomes de famílias beneficiadas nos púlpitos ou em grupos de mensagens;
2) **Proibição de Fotos Sensacionalistas**: É abominável perante o Evangelho fotografar pessoas recebendo cestas básicas para postar em redes sociais em busca de curtidas ou autopromoção (Mt 6:1-4: "Não saiba a tua mão esquerda o que faz a tua direita");
3) **Visita com Discernimento**: Entregar a provisão diretamente na residência da família, aproveitando para orar, aconselhar e verificar se há necessidades de recolocação profissional ou assistência médica.`,
                    destaqueExegese: 'Aletheia kai agape (ἀλήθεια καὶ ἀγάπη): agir com verdade, transparência e amor que cobre a nudez do irmão sem constrangimento.',
                    pontosChave: [
                        'Preservação rigorosa da dignidade da pessoa assistida',
                        'Rejeição total ao sensacionalismo midiático com a dor alheia',
                        'Critérios justos e transparentes na triagem e distribuição',
                        'Apoio integral com discipulado e estímulo ao trabalho digno'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. Capelania Hospitalar: Protocolo Ético e Biossegurança',
                    conteudo: `A visitação hospitalar exige que o obreiro combine fervor pentecostal com sabedoria, higiene e respeito às normas médicas institucionais:
- **Respeito às Regras da Casa**: Identificar-se na portaria com credencial ministerial, respeitar os horários de visitação e solicitar permissão prévia da equipe de enfermagem antes de entrar no leito;
- **Higienização Rigorosa**: Lavar as mãos com água e sabão e utilizar álcool em gel 70% antes e depois de tocar o enfermo, usando máscara e avental em setores de isolamento e UTI;
- **Discrição no Quarto**: Não sentar na cama do paciente, não mexer em sondas ou aparelhos médicos, falar em tom de voz sereno e não discutir diagnósticos médicos ou prognósticos desanimadores;
- **Brevidade da Oração**: Visitas hospitalares devem durar entre 5 e 10 minutos no quarto e no máximo 2 a 3 minutos em UTI, focando em palavras de esperança bíblica e oração fervorosa pela intervenção de Deus.`,
                    destaqueExegese: 'Episkeptomai (ἐπισκέπτομαι): visitar com cuidado carinhoso, atenção médica espiritual e ânimo consolador.',
                    pontosChave: [
                        'Credenciamento ético e respeito às normas dos hospitais',
                        'Biossegurança e assepsia para não transmitir infecções hospitalares',
                        'Visitas curtas, objetivas, silenciosas e cheias de fé',
                        'Palavras de consolo que apontam para o Médico dos Médicos'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. A Doutrina da Cura Divina e a Oração da Fé em Tiago 5',
                    conteudo: `A Declaração de Fé da CGADB (Capítulo 21) afirma que a Cura Divina é um benefício providenciado na expiação do Calvário: "Verdadeiramente, ele tomou sobre si as nossas enfermidades e as nossas dores levou sobre si" (Is 53:4; Mt 8:16-17). Deus cura soberanamente mediante a oração, sem anular o uso da medicina e dos recursos científicos criados pela sabedoria humana.

Em Tiago 5:14-15, o Espírito Santo instrui: "Está alguém entre vós doente? Chame os presbíteros da igreja, e orem sobre ele, ungindo-o com azeite em nome do Senhor; e a oração da fé salvará o doente, e o Senhor o levantará; e, se houver cometido pecados, ser-lhe-ão perdoados".

O diácono acompanha os presbíteros e pastores, atuando como cooperador fervoroso na intercessão da fé.`,
                    destaqueExegese: 'Euche tes pisteos (εὐχὴ τῆς πίστεως): a oração nascida da fé viva e inabalável que confia na soberania e no poder de Deus para restaurar o enfermo.',
                    pontosChave: [
                        'A Cura Divina providenciada no sacrifício vicário de Cristo',
                        'A oração da fé em conjunto com o presbitério da igreja',
                        'O azeite como símbolo bíblico consagrado do Espírito Santo',
                        'Reconhecimento da soberania divina e gratidão pela ciência médica'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. Apoio e Consolação a Famílias Enlutadas',
                    conteudo: `Um dos momentos mais dolorosos do pastoreio ocorre diante da morte de um ente querido. O diácono de valor sabe como portar-se nos velórios e sepultamentos:
- Comparecer com traje sóbrio e conduta discreta;
- Não proferir frases vazias de autoajuda ou tentar justificar a morte com conjecturas humanas;
- Estar presente com abraço fraterno, oração de consolo e disposição prática para providenciar água, transporte ou suporte logístico à família enlutada;
- Proclamar com serenidade a bendita esperança cristã da Ressurreição dos Mortos e do reencontro eterno com Cristo no Arrebatamento (1 Ts 4:13-18).`,
                    destaqueExegese: 'Parakaleite allelous (παρακαλεῖτε ἀλλήλους) em 1 Ts 4:18: "consolai-vos uns aos outros com estas palavras" de esperança gloriosa.',
                    pontosChave: [
                        'Presença consoladora e solidária nos momentos de luto profundo',
                        'Suporte prático, logístico e espiritual aos familiares',
                        'Proclamação bíblica da vitória de Cristo sobre a morte',
                        'A esperança bendita da ressurreição corpórea dos salvos'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'De acordo com Mateus 6:1-4 e os princípios de "Obreiro de Valor", como o corpo de diáconos deve proceder na distribuição de alimentos e socorro aos necessitados?',
                    opcoes: [
                        'Fotografar os beneficiários e publicar nas redes sociais para promover a liderança.',
                        'Agir com sigilo absoluto, preservando a honra e a dignidade das famílias sem qualquer sensacionalismo ou exposição pública.',
                        'Exigir que as pessoas necessitadas façam trabalhos pesados antes de receber a cesta.',
                        'Distribuir alimentos apenas para pessoas que tenham parentesco com a diretoria.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A Bíblia ensina que a beneficência deve ser feita em segredo diante de Deus, resguardando a integridade e dignidade dos irmãos assistidos.'
                },
                {
                    pergunta: 'Quais as regras fundamentais de conduta do obreiro na capelania hospitalar?',
                    opcoes: [
                        'Fazer orações longas e barulhentas no corredor da UTI e mexer nos equipamentos médicos.',
                        'Respeitar as normas do hospital, higienizar rigorosamente as mãos, manter visitas breves (5-10 min) e focar em palavras bíblicas de fé e oração pela cura divina.',
                        'Discutir com os médicos sobre o tratamento científico receitado.',
                        'Levar alimentos pesados para os pacientes internados sem autorização da enfermagem.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A capelania hospitalar exige prudência, assepsia rigorosa, respeito às equipes de saúde e orações breves e fervorosas de fé.'
                }
            ]
        }]
    },
    {
        id: 'dc_04',
        nivelId: 'diacono',
        titulo: 'Módulo 4: Ética Ministerial, Lealdade & Gestão de Conflitos no Rebanho',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Capítulo 20 - Os Frutos e Dons',
        cargaHoraria: 20,
        ementa: 'A ética do obreiro aprovado nas relações interpessoais e no trato com a liderança constituída. O pecado e o veneno da murmuração, da facção e da insubmissão à luz das Escrituras e de "Obreiro de Valor" (Pr. Abrahão Cipriano). O sigilo ministerial absoluto no aconselhamento. Princípios bíblicos para mediação e resolução pacífica de conflitos internos na congregação (Mateus 18:15-17).',
        trabalhoSugerido: 'Escrever uma dissertação crítica de 3 páginas sobre "A Lealdade Cristã vs. A Rebelião Ministerial: O Caso de Corá, Datã e Abirão (Nm 16) e a Ética do Obreiro de Valor", à luz do texto de Hebreus 13:17.',
        licoes: [{
            id: 'lic_dc_04',
            numero: 1,
            titulo: 'A Honra Ministerial, a Lealdade ao Pastorado e o Combate à Rebelião',
            introducao: 'Nenhum ministério sobrevive sem ordem, respeito à autoridade delegada e lealdade fraternal. O pastor Abrahão Cipriano dedica capítulos de profunda contundência em "Obreiro de Valor" para advertir contra os perigos espirituais que rondam o coração do obreiro: o orgulho ministerial, a inveja das oportunidades alheias, o espírito de facção e o terrível veneno da insubordinação. O diácono de valor não é um crítico de plantão que conspira nos cantos da igreja, mas um cooperador fiel que sustenta os braços do pastor presidente em oração e submissão santa.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 11), a Igreja de Deus possui um governo representativo e pastoral instituído pelo Espírito Santo (At 20:28; Hb 13:17). A lealdade aos pastores e presbíteros é preceito bíblico inegociável, desde que estejam alinhados com a Palavra de Deus.',
            referenciasBiblicas: ['Hebreus 13:17', 'Números 16:1-35', '1 Tessalonicenses 5:12-13', 'Mateus 18:15-17', 'Romanos 16:17-18', 'Tiago 3:13-18', 'Provérbios 6:16-19'],
            aplicacaoPratica: 'O diácono deve honrar a liderança da igreja em público e em particular, cortar prontamente qualquer conversa de murmuração ou intriga, preservar o sigilo das reuniões de obreiros e buscar a reconciliação bíblica diante de mal-entendidos.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Princípio da Autoridade Espiritual e a Submissão Bíblica (Hb 13:17)',
                    conteudo: `O autor da Carta aos Hebreus instrui a congregação com clareza cristalina em Hebreus 13:17: "Obedecei a vossos pastores e sujeitai-vos a eles; porque velam por vossas almas, como aqueles que hão de dar conta delas; para que o façam com alegria e não gemendo, porque isso não vos seria útil".

O pastor local foi posto pelo Espírito Santo como anjo da igreja para apascentar o rebanho e responderá perante o Tribunal de Cristo por cada ovelha. O diácono não foi consagrado para ser oponente político do pastor, mas seu escudeiro e auxiliador de confiança.

Em "Obreiro de Valor", o Pr. Abrahão Cipriano enfatiza que quem não sabe obedecer jamais estará apto para liderar. A autoridade espiritual só flui legitimamente sobre aqueles que vivem sob autoridade.`,
                    destaqueExegese: 'Peithesthe (πείθεσθε): deixar-se convencer com confiança, seguir a orientação com coração voluntário e respeito sincero.',
                    pontosChave: [
                        'Autoridade pastoral como delegação sagrada do Espírito Santo',
                        'Submissão bíblica voluntária em prol da harmonia do rebanho',
                        'A responsabilidade solene do pastor na prestação de contas a Deus',
                        'O perigo espiritual de fazer o pastor liderar gemendo de tristeza'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. A Tragédia da Rebelião: A Lição de Corá, Datã e Abirão (Nm 16)',
                    conteudo: `A rebelião de Corá, Datã e Abirão contra a liderança de Moisés e Arão constitui uma das advertências mais severas do Antigo Testamento. Corá era levita e desfrutava de grande honra nos serviços do Tabernáculo, mas foi consumido pela inveja e pelo desejo desordenado do sacerdócio, inflamando 250 líderes de renome contra a liderança instituída por Deus.

O juízo divino foi imediato e aterrador: a terra abriu a sua boca e engoliu os rebeldes vivos com suas tendas, e o fogo desceu do Senhor consumindo os 250 homens insubordinados (Nm 16:31-35).

Como adverte o Pr. Abrahão Cipriano, o espírito de murmuração e rebelião contamina a congregação como lepra. O obreiro de valor repreende o murmurador e não se assenta na roda dos escarnecedores.`,
                    destaqueExegese: 'Qorach (קֹרַח): a audácia carnal que desafia a ordem divina e atrai ruína sobre a família e o ministério.',
                    pontosChave: [
                        'A gravidade do pecado de rebelião e facção na Casa de Deus',
                        'A inveja e a ambição desordenada como raízes da queda ministerial',
                        'O dever de blindar o coração contra queixas e insatisfações carnais',
                        'A defesa intransigente da unidade do ministério local'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. Sigilo Ministerial e Discrição Absoluta no Trato com Ovelhas',
                    conteudo: `Durante o exercício do diaconato, o obreiro toma conhecimento de situações íntimas, problemas conjugais graves, dores familiares e confissões de membros em momentos de choro e vulnerabilidade.

O sigilo pastoral e ministerial é uma cláusula pétrea inquebrantável. Trair a confiança de uma ovelha compartilhando suas dores com a esposa, amigos ou em grupos de conversas é pecado gravíssimo de indiscrição e desonra espiritual.

Em "Obreiro de Valor", ensina-se que a boca do obreiro deve ser um sepulcro para os segredos alheios. Quando a situação demandar intervenção disciplinar ou acompanhamento especializado, o assunto deve ser encaminhado exclusivamente e em particular ao pastor presidente da congregação.`,
                    destaqueExegese: 'Hekomythos (ἐχεμυθία): capacidade de guardar silêncio estrito, discrição sagrada e fidelidade na confiança recebida.',
                    pontosChave: [
                        'Sigilo absoluto sobre confissões e problemas íntimos das ovelhas',
                        'Repúdio total à quebra de sigilo ministerial em conversas domésticas',
                        'Encaminhamento responsável de casos graves exclusivamente ao pastor',
                        'Preservação da reputação das famílias e da paz do rebanho'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. Resolução Bíblica de Conflitos segundo Mateus 18:15-17',
                    conteudo: `O Senhor Jesus Cristo deixou um roteiro infalível em 3 passos para resolver desavenças entre irmãos:
1) **Passo Pessoal e Sigiloso (v. 15)**: "Se teu irmão pecar contra ti, vai e repreende-o entre ti e ele só; se te ouvir, ganhaste a teu irmão". Nunca expor o problema em público antes de procurar o irmão em particular;
2) **Passo com Testemunhas (v. 16)**: Se ele não ouvir, levar uma ou duas testemunhas espirituais e maduras para que toda palavra se confirme;
3) **Passo Eclesiástico (v. 17)**: Se persistir na dureza, levar à igreja/liderança pastoral.

O obreiro de valor aplica esse método em sua própria vida e orienta os membros a não utilizarem redes sociais para desabafos ou ataques que escandalizam o Evangelho.`,
                    destaqueExegese: 'Elenxon auton metaxy sou kai autou monou (ἔλεγξον αὐτὸν μεταξὺ σοῦ καὶ αὐτοῦ μόνου): tratar e esclarecer a questão em particular, preservando a intimidade.',
                    pontosChave: [
                        'Princípio bíblico de resolução de conflitos face a face e em particular',
                        'Proibição de alimentar fofocas, indiretas ou exposições na internet',
                        'Busca incansável pela reconciliação e restauração da comunhão',
                        'A paz de Cristo como árbitro supremo em nossos corações'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. A Maturidade Emocional e Espiritual do Diácono de Valor',
                    conteudo: `Servir na linha de frente da igreja expõe o diácono a críticas injustas, incompreensões e momentos de cansaço físico e mental. O obreiro imaturo melindra-se facilmente, abandona suas escalas de serviço por qualquer ofensa e guarda ressentimentos amargos no peito.

O diácono de valor, contudo, é forjado na têmpera de Cristo: possui couro duro para suportar as afrontas e coração mole para perdoar e amar sem limites. Ele não busca os aplausos dos homens, porque sua recompensa vem do Senhor Todo-Poderoso.

Como sintetiza Abrahão Cipriano, a grandeza de um líder mede-se pela sua capacidade de suportar o peso das dores alheias sem perder a doçura e a mansidão do Espírito Santo.`,
                    destaqueExegese: 'Makrothumia (μακροθυμία): paciência longânime, capacidade de suportar injúrias com fortaleza sem buscar vingança.',
                    pontosChave: [
                        'Superação de melindres infantis e desenvolvimento da maturidade',
                        'Perdão irrestrito e guarda da mente contra amarguras (Hb 12:15)',
                        'Foco exclusivo na aprovação de Deus e na glória de Cristo',
                        'Perseverança firme no cumprimento dos deveres ministeriais'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual o procedimento bíblico ordenado por Jesus em Mateus 18:15 para resolver uma desavença entre irmãos na igreja?',
                    opcoes: [
                        'Publicar um desabafo nas redes sociais com indiretas para que todos tomem conhecimento.',
                        'Procurar o irmão em particular (entre ti e ele só), com espírito manso, para esclarecer a questão e restaurar a comunhão.',
                        'Abandonar a igreja imediatamente e criar uma nova congregação dissidente.',
                        'Falar mal do irmão para outros membros antes de conversar com ele.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Jesus ensina que qualquer desavença deve ser tratada pessoalmente e em segredo no primeiro passo, evitando escândalos e visando a reconciliação.'
                },
                {
                    pergunta: 'O que o livro "Obreiro de Valor" de Abrahão Cipriano ensina sobre o sigilo pastoral e ministerial do diácono?',
                    opcoes: [
                        'Que é permitido contar os segredos das ovelhas para os amigos durante as refeições.',
                        'Que o sigilo ministerial é sagrado e inquebrantável; quebrar a confidencialidade das ovelhas é pecado grave de indiscrição e desonra espiritual.',
                        'Que todas as confissões devem ser gravadas e publicadas em boletins informativos.',
                        'Que o obreiro não precisa manter discrição sobre os problemas da igreja.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O sigilo pastoral resguarda a intimidade dos irmãos, a honra da liderança e a dignidade do ministério de Cristo.'
                }
            ]
        }]
    },
    {
        id: 'dc_05',
        nivelId: 'diacono',
        titulo: 'Módulo 5: Administração Eclesiástica, Mordomia dos Dízimos & Patrimônio',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Capítulo 10 - A Salvação',
        cargaHoraria: 20,
        ementa: 'A gestão material e financeira da igreja local com base nos princípios bíblicos da mordomia cristã. A teologia dos dízimos e ofertas sagradas. A integridade no recolhimento, contagem, conferência e guarda dos valores monetários do templo. A manutenção e conservação do patrimônio eclesiástico como ato de adoração segundo as diretrizes de "Obreiro de Valor". Preparação final para o Presbitério.',
        trabalhoSugerido: 'Elaborar um Relatório Padrão de Prestação de Contas da Tesouraria Local e um Plano Anual de Manutenção Preventiva do Templo Sede e Congregações.',
        licoes: [{
            id: 'lic_dc_05',
            numero: 1,
            titulo: 'A Mordomia dos Recursos Santos, a Contabilidade Fiel e o Cuidado com a Casa de Deus',
            introducao: 'A igreja do Deus Vivo movimenta recursos materiais e financeiros para o sustento de missionários, manutenção de templos, socorro a famílias carentes e suporte ao ministério da Palavra. Cada moeda entregue no gazofilácio é fruto do suor e da consagração santa do povo de Deus. Por essa razão, a administração eclesiástica exige do diácono e dos oficiais uma honestidade incorruptível, transparência documental e temor de Deus. Como ensina o Pr. Abrahão Cipriano em "Obreiro de Valor", o obreiro que não é fiel no trato com o dinheiro sagrado torna-se tropeço para a fé de muitos e atrai para si a desaprovação do Senhor.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 11), a Igreja local administra seus bens móveis e imóveis através de diretorias idôneas e conselhos fiscais eleitos conforme os estatutos canônicos, prestando contas regulares a Deus e à assembleia dos membros. O dízimo é santo ao Senhor (Ml 3:10; 2 Co 8:20-21).',
            referenciasBiblicas: ['2 Coríntios 8:20-21', 'Malaquias 3:10', 'Lucas 16:10-12', '1 Crônicas 29:14-17', 'Neemias 13:13', '1 Timóteo 6:9-10'],
            aplicacaoPratica: 'O diácono deve realizar a contagem de dízimos e ofertas sempre em comissão de no mínimo duas pessoas, assinar os envelopes e termos de conferência com exatidão e zelar pela conservação física e segurança das instalações da congregação.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Transparência Financeira Paulina em 2 Coríntios 8:20-21',
                    conteudo: `Ao organizar a grande coleta humanitária para os santos necessitados da Judeia, o apóstolo Paulo estabeleceu uma regra de ouro para a administração dos recursos da igreja: "Evitando que alguém nos vitupere por causa desta generosa abundância que por nós é administrada; pois zelamos o que é honesto, não só diante do Senhor, mas também diante dos homens" (2 Co 8:20-21).

Paulo não transportou os valores sozinho, mas nomeou uma comissão de irmãos de reputação comprovada para acompanhá-lo. O obreiro de valor nunca realiza contagem de ofertas sozinho a portas fechadas, para que não haja a menor suspeita ou brecha para calúnias.

A integridade do diácono deve ser transparente e verificável por qualquer auditoria fiscal ou eclesiástica.`,
                    destaqueExegese: 'Pronooumen kala (προνοοῦμεν καλά): planejar com antecedência e zelo minucioso o que é nobre, honesto e irrepreensível perante a sociedade.',
                    pontosChave: [
                        'Transparência financeira diante de Deus e dos homens',
                        'Contagem e conferência de valores sempre em comissão ministerial',
                        'Prevenção contra calúnias e escândalos no trato do dinheiro sagrado',
                        'Prestação de contas regular e idônea perante a liderança e a igreja'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. A Doutrina dos Dízimos e Ofertas na Teologia Bíblica',
                    conteudo: `A entrega dos dízimos (a décima parte das rendas) e das ofertas voluntárias e alçadas é preceito bíblico que antecede a Lei Mosaica (Gn 14:20; 28:22), foi ratificado na Lei (Lv 27:30; Ml 3:10) e confirmado pelo próprio Senhor Jesus Cristo no Novo Testamento (Mt 23:23: "devíeis fazer estas coisas, sem omitir aquelas").

Os recursos arrecadados não pertencem aos obreiros de forma pessoal, mas são consagrados ao Senhor para:
- O sustento integral de pastores e obreiros do campo (1 Co 9:14; 1 Tm 5:17-18);
- O envio e manutenção de missionários transculturais;
- A assistência social aos órfãos, viúvas e pobres da comunidade;
- A compra de terrenos, construção e conservação dos templos do Senhor.`,
                    destaqueExegese: 'Kodesh la-Adonai (קֹדֶשׁ לַיהוָה) em Levítico 27:30: "é santo ao Senhor", pertencendo exclusivamente ao Criador de todas as coisas.',
                    pontosChave: [
                        'Dízimo como ordenança bíblica de adoração, fé e gratidão a Deus',
                        'Ofertas generosas entregues com alegria santa e voluntária (2 Co 9:7)',
                        'Destinação sagrada dos recursos: missões, pastoreio e beneficência',
                        'O obreiro como primeiro exemplo inquestionável de fidelidade dizimista'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. Procedimento Operacional de Recolha e Guarda de Valores',
                    conteudo: `Em "Obreiro de Valor", o Pr. Abrahão Cipriano detalha o protocolo seguro para a equipe de tesouraria e diaconato:
1) **Durante o Ofertório**: As salvas são recolhidas por diáconos e auxiliares sob o olhar solene da congregação;
2) **Condução Segura**: Ao término do recolhimento, os recipientes são lacrados e conduzidos imediatamente para a sala da tesouraria por no mínimo dois obreiros escalados;
3) **Abertura e Conferência**: Abertura dos envelopes com registro imediato dos valores na planilha ou sistema de gestão, separando dinheiro em espécie, comprovantes PIX e cheques;
4) **Fechamento e Assinatura**: O termo de conferência é assinado pelos conferentes e pelo tesoureiro de plantão;
5) **Depósito em Conta**: O numerário é depositado em conta bancária oficial da igreja com brevidade, evitando o acúmulo perigoso de dinheiro no templo.`,
                    destaqueExegese: 'Gaza (γάζα): o tesouro sagrado confiado a homens dignos e de moral inabalável.',
                    pontosChave: [
                        'Protocolo rigoroso de recolha, contagem e conferência conjunta',
                        'Registro eletrônico fidedigno no sistema da igreja',
                        'Assinatura e responsabilidade compartilhada da comissão de tesouraria',
                        'Segurança bancária contra assaltos e sinistros'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. Zeladoria, Manutenção Preventiva e Conservação do Patrimônio',
                    conteudo: `O zelo pela estrutura física do templo é uma extensão direta da reverência que devotamos a Deus. O rei Joás destacou-se na história sagrada ao convocar os sacerdotes e levitas para reparar todas as fendas e estragos da Casa do Senhor (2 Reis 12:4-15).

O corpo diaconal lidera a manutenção preventiva da congregação:
- Inspecionar telhados, calhas e infiltrações antes do período de chuvas;
- Verificar a manutenção periódica de geradores, climatizadores e extintores de incêndio (dentro do prazo de validade);
- Fiscalizar o estado das cadeiras, bebedouros e sanitários, assegurando higiene impecável aos santos;
- Promover mutirões de pintura e conservação com a cooperação alegre dos membros.`,
                    destaqueExegese: 'Bédeq habáyit (בֶּדֶק הַבַּיִת) em 2 Rs 12:5: reparar as fendas e fissuras do edifício sagrado para que resplandeça em beleza e honra.',
                    pontosChave: [
                        'A manutenção do templo como dever de honra perante Deus',
                        'Prevenção de acidentes e conformidade com normas do Corpo de Bombeiros',
                        'Higiene impecável em todas as dependências da igreja',
                        'Mordomia sustentável do patrimônio adquirido com as ofertas dos crentes'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese do Grau Diaconal e Preparo Espiritual para o Presbitério',
                    conteudo: `Ao cumprir com honra, retidão e temor de Deus todas as lições teóricas e as 60 horas de estágio supervisionado do Diaconato, o obreiro comprova seu valor e fidelidade na Casa de Deus.

O diácono aprovado adquiriu para si o "bathmon kalon" prometido por Paulo em 1 Timóteo 3:13: uma posição sólida, autoridade moral inquestionável e muita intrepidez na fé em Cristo Jesus.

Ele está pronto para continuar servindo na diaconia ou, se aprouver ao Senhor e ao pastor presidente, ser indicado e examinado para ascender ao grau de Presbítero da Igreja, onde será chamado a supervisionar a sã doutrina, ungir os enfermos e pastorear as ovelhas do rebanho com o cajado do Evangelho.`,
                    destaqueExegese: 'Dokimazo (δοκιμάζω): aprovado após teste e escrutínio rigoroso, apto para maiores responsabilidades no Reino.',
                    pontosChave: [
                        'Conclusão brilhante da formação diaconal nos 5 módulos',
                        'Testemunho público de humildade, serviço e zelo pelo Altar',
                        'Prontidão espiritual e teológica para novos passos ministeriais',
                        'Glória exclusiva ao Senhor Jesus Cristo, o Sumo Pastor das nossas almas'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Por que o apóstolo Paulo exigiu em 2 Coríntios 8:20-21 que a administração financeira das ofertas da igreja fosse feita em comissão por homens aprovados?',
                    opcoes: [
                        'Para garantir que os recursos fossem gastos em banquetes seculares.',
                        'Para evitar qualquer calúnia ou suspeita, zelando pelo que é honesto não apenas diante de Deus, mas também perante a sociedade civil.',
                        'Porque Paulo não confiava em nenhum crente da igreja de Corinto.',
                        'Apenas por uma exigência das leis do Império Romano.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A comissão financeira assegura total transparência, lisura e proteção da reputação dos líderes e do Evangelho diante do mundo.'
                },
                {
                    pergunta: 'Segundo a Bíblia e o livro "Obreiro de Valor" de Abrahão Cipriano, qual deve ser o procedimento da contagem de ofertas e dízimos no templo?',
                    opcoes: [
                        'O obreiro deve contar sozinho em sua própria casa e ficar com uma porcentagem.',
                        'A contagem deve ser realizada em comissão de pelo menos dois obreiros, com conferência imediata, registro em sistema e assinatura conjunta do termo de responsabilidade.',
                        'Não é necessário contar as ofertas nem fazer registros na tesouraria.',
                        'Entregar todo o dinheiro diretamente aos visitantes que estiverem na recepção.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A contagem conjunta e o registro fidedigno em sistema oficial garantem transparência absoluta, honestidade e temor de Deus na administração eclesiástica.'
                }
            ]
        }]
    }
];
