import { DisciplinaObreiro } from './ModuleFormacaoObreirosData';

export const DISCIPLINAS_CURRICULARES: DisciplinaObreiro[] = [
    // =========================================================================
    // NÍVEL 1: AUXILIAR DE TRABALHO (5 MÓDULOS COMPLETOS)
    // =========================================================================
    {
        id: 'aux_01',
        nivelId: 'auxiliar',
        titulo: 'Módulo 1: Fundamentos da Bibliologia & O Obreiro Aprovado',
        capituloCGADB: 'Capítulo 1 - As Sagradas Escrituras',
        cargaHoraria: 16,
        ementa: 'Inspiração verbal e plenária da Bíblia. A inerrância, autoridade e suficiência das Escrituras Sagradas. O perfil do obreiro aprovado perante Deus e a igreja.',
        trabalhoSugerido: 'Elaborar uma resenha de 2 páginas sobre a inerrância bíblica com base em 2 Timóteo 3:16-17 e a Declaração de Fé da CGADB (Cap. 1).',
        licoes: [{
            id: 'lic_aux_01',
            numero: 1,
            titulo: 'A Autoridade Suprema das Escrituras e o Zelo do Auxiliar',
            introducao: 'O ministério cristão no ambiente pentecostal assembleiano fundamenta-se na convicção inegociável de que a Bíblia Sagrada é a inspirada, inerrante e infalível Palavra de Deus. Nenhum obreiro pode servir com eficácia se não submeter sua mente, conduta e prática litúrgica à autoridade das Escrituras.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé das Assembleias de Deus (CGADB/CPAD, Capítulo 1), cremos na inspiração verbal e plenária da Bíblia, sendo ela a única regra infalível de fé e conduta para a vida cristã e o ministério.',
            referenciasBiblicas: ['2 Timóteo 3:16-17', '2 Pedro 1:20-21', 'Salmo 119:105', '2 Timóteo 2:15', 'Josué 1:8'],
            aplicacaoPratica: 'O Auxiliar de Trabalho deve cultivar uma disciplina diária de leitura e meditação bíblica. Antes de recepcionar pessoas ou servir no templo, deve alimentar seu espírito com a Verdade para agir com prudência e mansidão.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Inspiração Verbal e Plenária da Bíblia',
                    conteudo: 'A doutrina da inspiração verbal e plenária ensina que o Espírito Santo capacitou e moveu os autores sagrados de modo que cada palavra redigida no texto original refletisse com exatidão a vontade divina, sem anular a personalidade e o estilo de cada escritor (2 Pe 1:21). "Verbal" significa que a inspiração abrange as próprias palavras, não apenas ideias genéricas; "plenária" atesta que todas as partes das Escrituras, do Gênesis ao Apocalipse, são igualmente inspiradas por Deus.',
                    destaqueExegese: 'O termo grego theopneustos (θεόπνευστος) em 2 Tm 3:16 significa literalmente "soprado por Deus", indicando a origem divina primordial do texto sagrado.',
                    pontosChave: ['Inspiração divina total', 'Inerrância nos manuscritos originais', 'Regra exclusiva de fé e prática']
                },
                {
                    numero: 2,
                    subtitulo: '2. A Inerrância e Infalibilidade das Escrituras',
                    conteudo: 'A Declaração de Fé da CGADB rejeita qualquer forma de relativismo ou teologia liberal. A Bíblia não contém erros em seus ensinamentos doutrinários, morais, espirituais e históricos. Como servos da Casa de Deus, os auxiliares devem defender a integridade do cânon bíblico composto por 66 livros (39 no Antigo Testamento e 27 no Novo Testamento), rejeitando categoricamente os livros apócrifos.',
                    destaqueExegese: 'Jesus declarou em João 10:35 que "a Escritura não pode ser anulada" (grego: luthenai - rompida, destruída).',
                    pontosChave: ['66 livros canônicos inspirados', 'Rejeição categórica de apócrifos', 'Autoridade superior a tradições humanas']
                },
                {
                    numero: 3,
                    subtitulo: '3. O Obreiro Aprovado e o Manejo da Verdade (2 Tm 2:15)',
                    conteudo: 'O apóstolo Paulo orienta a Timóteo: "Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade". O verbo grego orthotomeo significa "cortar em linha reta", aludindo ao trabalho minucioso de abrir estradas retas ou tecer tendas sem desvios. O auxiliar deve estudar as lições da Escola Bíblica Dominical (EBD) com esmero.',
                    destaqueExegese: 'Orthotomeo (ὀρθοτομέω): cortar reto, traçar sem distorção, interpretar com fidelidade exegética.',
                    pontosChave: ['Estudo diligente e oração', 'Vida coerente com o ensinamento', 'Não se envergonhar do Evangelho']
                },
                {
                    numero: 4,
                    subtitulo: '4. Postura Litúrgica e Discrição no Culto',
                    conteudo: 'O Auxiliar de Trabalho é o guardião da atmosfera de reverência no templo. Ele deve estar atento às necessidades do pastor presidente, organizar os assentos, acolher visitantes com cordialidade e zelar pelo silêncio durante a ministração da Palavra. Sua conduta visual, postura solene e prontidão refletem a santidade do culto cristão (1 Co 14:40).',
                    destaqueExegese: 'Euschemonos (εὐσχημόνως) e Taxin (τάξιν) em 1 Co 14:40 exigem decência harmoniosa e ordem militar espiritual.',
                    pontosChave: ['Pontualidade (30 min antes)', 'Acolhimento com amor e respeito', 'Zelo pelo decoro e reverência']
                },
                {
                    numero: 5,
                    subtitulo: '5. Avaliação Espiritual e Conclusão do Módulo',
                    conteudo: 'Servir a Deus como auxiliar é um privilégio que pavimenta o futuro ministerial. Quem é fiel no pouco sobre o muito será colocado (Lc 16:10). A perseverança silenciosa, a humildade e a submissão aos líderes constituem o alicerce indispensável para qualquer consagração ulterior nas Assembleias de Deus.',
                    destaqueExegese: 'Pistos (πιστός) em Lucas 16:10: digno de confiança absoluta nos menores detalhes do santuário.',
                    pontosChave: ['Fidelidade nas pequenas coisas', 'Submissão pastoral santa', 'Crescimento espiritual contínuo']
                }
            ],
            quiz: [
                {
                    pergunta: 'O que significa a inspiração "verbal e plenária" segundo a Declaração de Fé da CGADB?',
                    opcoes: [
                        'Que Deus inspirou apenas as ideias gerais dos autores.',
                        'Que a inspiração estende-se a cada palavra dos manuscritos originais e abrange todos os 66 livros da Bíblia.',
                        'Que apenas o Novo Testamento é infalível.',
                        'Que a Bíblia possui erros científicos, mas não espirituais.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A CGADB ensina que a inspiração é verbal (as próprias palavras) e plenária (completa em toda a Escritura).'
                },
                {
                    pergunta: 'Qual o significado do termo "orthotomeo" em 2 Timóteo 2:15?',
                    opcoes: [
                        'Fazer discursos eloquentes no púlpito.',
                        'Cortar reto, interpretando e transmitindo a Palavra da Verdade com exatidão e sem desvios.',
                        'Criticar outras denominações publicamente.',
                        'Buscar aprovação de autoridades civis.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Orthotomeo significa cortar em linha reta, manejando e interpretando a verdade bíblica sem distorções.'
                }
            ]
        }]
    },
    {
        id: 'aux_02',
        nivelId: 'auxiliar',
        titulo: 'Módulo 2: O Caráter Santo e a Vida Familiar do Obreiro',
        capituloCGADB: 'Capítulo 10 - A Salvação & Capítulo 24 - A Família',
        cargaHoraria: 16,
        ementa: 'A santificação como condição indispensável para o serviço divino. A moralidade cristã, a integridade financeira e a conduta familiar irrepreensível segundo 1 Timóteo 3.',
        trabalhoSugerido: 'Escrever uma síntese bíblica sobre a santificação prática na era digital e a liderança do lar cristão.',
        licoes: [{
            id: 'lic_aux_02',
            numero: 1,
            titulo: 'Santidade Pessoal, Testemunho Social e Governo do Lar',
            introducao: 'Nas Assembleias de Deus, a santificação não é um acessório opcional, mas o imperativo categórico de Deus para todo aquele que professa a fé e deseja servir ao Senhor no altar.',
            fundamentacaoDoutrinaria: 'Segundo a Declaração de Fé (Capítulo 10 e 24), a santificação é posicional, progressiva e final, exigindo separação do pecado e consagração integral a Deus. O casamento cristão é heterossexual, monogâmico e indissolúvel.',
            referenciasBiblicas: ['1 Tessalonicenses 4:3-7', 'Hebreus 12:14', '1 Pedro 1:15-16', 'Efésios 5:22-33', '1 Timóteo 3:4-5'],
            aplicacaoPratica: 'O auxiliar deve manter uma vida conjugal exemplar, honrando sua esposa, educando seus filhos no temor do Senhor e guardando sua mente e olhos da impureza mundana.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. As Três Dimensões da Santificação Bíblica',
                    conteudo: 'A santificação na teologia pentecostal clássica possui três aspectos essenciais: Posicional (ocorre no momento da conversão e justificação), Progressiva (o processo diário de purificação pelo Espírito Santo e pela Palavra) e Final ou Glorificação (quando formos transformados na Segunda Vinda de Cristo). O obreiro vive a santificação prática todos os dias.',
                    destaqueExegese: 'Hagiasmos (ἁγιασμός): separação radical do pecado e dedicação exclusiva ao propósito sagrado de Deus.',
                    pontosChave: ['Santificação posicional e progressiva', 'Necessidade de vigilância e oração', 'Sem santidade ninguém verá o Senhor']
                },
                {
                    numero: 2,
                    subtitulo: '2. A Pureza Moral e o Uso Santo da Mente',
                    conteudo: 'Em um mundo hipersexualizado, o auxiliar de trabalho é chamado a ser modelo de castidade e modéstia. As Escrituras advertem solenemente em 1 Tessalonicenses 4:3: "Porque esta é a vontade de Deus, a vossa santificação: que vos abstenhais da prostituição". Isso inclui vigilância rigorosa no uso de redes sociais, pornografia, conversas frívolas e companhias nocivas.',
                    destaqueExegese: 'Porneia (πορνεία): qualquer relação sexual fora do sagrado vínculo matrimonial.',
                    pontosChave: ['Guarda do coração e dos olhos', 'Modéstia no trajar e no falar', 'Transparência no ambiente digital']
                },
                {
                    numero: 3,
                    subtitulo: '3. A Família do Obreiro como Primeiro Altar',
                    conteudo: 'Quem não governa bem a sua própria casa não tem condições espirituais de cuidar da igreja de Deus (1 Tm 3:5). O lar do obreiro deve ser um santuário de oração, onde o culto doméstico é celebrado com regularidade e o amor mútuo é cultivado com ternura.',
                    destaqueExegese: 'Proistamenon (προϊστάμενον) em 1 Tm 3:4: presidir com autoridade amorosa, liderar pelo exemplo protetor.',
                    pontosChave: ['Culto doméstico constante', 'Amor sacrificial pela esposa', 'Educação cristã dos filhos']
                },
                {
                    numero: 4,
                    subtitulo: '4. Integridade Financeira e Mordomia Cristã',
                    conteudo: 'O obreiro deve ser exemplo inabalável de fidelidade nos dízimos e ofertas generosas (Ml 3:10). Não pode ter dívidas escandalosas no comércio, honrando seus compromissos civis para que o Evangelho não seja difamado.',
                    destaqueExegese: 'Oikonomos (οἰκονόμος): mordomo fiel que presta contas rigorosas ao Dono de todas as coisas.',
                    pontosChave: ['Dízimo santo e voluntário', 'Honradez no comércio civil', 'Prestação de contas transparente']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese e Diretrizes Práticas de Conduta',
                    conteudo: 'A vida do auxiliar de trabalho é um sermão vivo perante os vizinhos, colegas de trabalho e membros da congregação. A reputação do obreiro é o maior patrimônio do ministério local.',
                    destaqueExegese: 'Marturia (μαρτυρία): bom testemunho público comprovado por todos os observadores.',
                    pontosChave: ['Bom testemunho com os de fora', 'Mansidão em conflitos', 'Lealdade à liderança eclesiástica']
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual a definição de santificação progressiva na teologia da CGADB?',
                    opcoes: [
                        'Uma experiência instantânea onde a pessoa nunca mais comete erros.',
                        'O processo contínuo de crescimento espiritual e purificação pelo Espírito Santo e pela Palavra ao longo de toda a vida.',
                        'Uma doutrina aplicável apenas a pastores de convenção.',
                        'A crença de que as obras humanas substituem a graça.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A santificação progressiva é o aperfeiçoamento diário do crente mediante a oração, a Palavra e o Espírito Santo.'
                },
                {
                    pergunta: 'Por que o governo da própria casa é pré-requisito indispensável para o obreiro (1 Tm 3:5)?',
                    opcoes: [
                        'Porque o lar é o laboratório prático do ministério espiritual.',
                        'Para garantir que todos os filhos sejam músicos.',
                        'Apenas por tradição social sem respaldo apostólico.',
                        'Para evitar despesas financeiras com a igreja.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'Se alguém não sabe cuidar da sua própria família, como poderá pastorear ou cuidar da Igreja de Deus?'
                }
            ]
        }]
    },
    {
        id: 'aux_03',
        nivelId: 'auxiliar',
        titulo: 'Módulo 3: Recepção, Portaria & Zelo Litúrgico do Santuário',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus',
        cargaHoraria: 16,
        ementa: 'A teologia da portaria no Antigo e Novo Testamento. O ofício de acolhimento aos santos, segurança no templo, protocolo eclesiástico e auxílio no púlpito.',
        trabalhoSugerido: 'Elaborar um manual prático de recepção cristã para a equipe de portaria da igreja local.',
        licoes: [{
            id: 'lic_aux_03',
            numero: 1,
            titulo: 'Os Porteiros do Senhor e o Cuidado com a Casa de Oração',
            introducao: 'No Antigo Testamento, os porteiros levitas (1 Cr 9:19) tinham o encargo sagrado de guardar os átrios do Senhor e impedir a entrada de qualquer profanação. No culto assembleiano, a portaria é o cartão de visitas da graça divina.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 11), o culto deve ser celebrado com solenidade, reverência e júbilo santo, cabendo aos oficiais zelar pela decência e ordem.',
            referenciasBiblicas: ['1 Crônicas 9:19-27', 'Salmo 84:10', 'Lucas 10:5-6', 'Romanos 12:13', 'Hebreus 13:2'],
            aplicacaoPratica: 'O auxiliar deve recepcionar cada visitante com sorriso afável, folheto evangelístico e orientação segura, sabendo acomodar idosos, mães com crianças e portadores de necessidades especiais.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A História Sagrada dos Porteiros Levitas',
                    conteudo: 'Nas Escrituras, os porteiros não eram meros vigilantes, mas ministros levíticos designados pelo próprio Deus para guardar os limites santos do Tabernáculo e do Templo. O salmista declara no Salmo 84:10: "Preferiria estar à porta da casa do meu Deus a habitar nas tendas da perversidade".',
                    destaqueExegese: 'Shoel (שׁוֹעֵר): guardião consagrado das portas sagradas que vigiava a entrada dos sacrifícios.',
                    pontosChave: ['Vocação bíblica nobre', 'Guarda dos recintos santos', 'Alegria em servir na porta']
                },
                {
                    numero: 2,
                    subtitulo: '2. Protocolo de Acolhimento e Hospitalidade Cristã',
                    conteudo: 'A primeira impressão que um visitante tem da igreja decorre do acolhimento na portaria. O auxiliar deve tratar a todos com igualdade, sem acepção de pessoas (Tg 2:1-4), oferecendo água, bíblias avulsas e direcionamento aos assentos.',
                    destaqueExegese: 'Philoxenia (φιλοξενία): amor afetuoso aos forasteiros e visitantes desconhecidos.',
                    pontosChave: ['Sem acepção de pessoas', 'Cordialidade cristã autêntica', 'Apoio a mães e idosos']
                },
                {
                    numero: 3,
                    subtitulo: '3. Vigilância Espiritual e Segurança do Rebanho',
                    conteudo: 'O templo é local de oração, mas atrai pessoas em momentos de vulnerabilidade ou perturbação espiritual. O auxiliar deve permanecer em espírito de oração, identificando qualquer anomalia sem causar alarde ou constrangimento.',
                    destaqueExegese: 'Gregoreo (γρηγορέω): vigiar atentamente com mente alerta e olhos espirituais abertos.',
                    pontosChave: ['Vigilância discreta', 'Pronto socorro a emergências', 'Preservação da paz no culto']
                },
                {
                    numero: 4,
                    subtitulo: '4. Auxílio no Púlpito e Liturgia Sagrada',
                    conteudo: 'Durante o culto, o auxiliar de trabalho atende às demandas do dirigente: fornecer água ao pregador, apoiar os músicos, organizar a recolha de dízimos e ofertas com sacolas transparentes e recolher envelopes de consagração.',
                    destaqueExegese: 'Diakonia prática nos bastidores do santuário.',
                    pontosChave: ['Atenção aos gestos do dirigente', 'Discrição absoluta ao caminhar', 'Zelo pelos instrumentos sagrados']
                },
                {
                    numero: 5,
                    subtitulo: '5. Conclusão e Relatório de Ocorrências',
                    conteudo: 'Após o término do culto, o trabalho do auxiliar continua: verificar se objetos foram esquecidos, desligar luzes e climatizadores, conferir o fechamento de portas e relatar ao pastor supervisor qualquer incidente relevante.',
                    destaqueExegese: 'Zelos (ζῆλος): fervor consagrado que não cansa de cuidar da Casa do Senhor.',
                    pontosChave: ['Fechamento seguro do templo', 'Achados e perdidos organizados', 'Comunicação pontual com o pastor']
                }
            ],
            quiz: [
                {
                    pergunta: 'O que ensina Tiago 2:1-4 quanto ao acolhimento de visitantes no templo?',
                    opcoes: [
                        'Dar prioridade apenas a pessoas ricas e influentes.',
                        'Tratar a todos com dignidade e amor santo, sem fazer qualquer acepção de pessoas.',
                        'Proibir a entrada de pessoas simples.',
                        'Cobrar taxa de entrada no santuário.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A fé em Cristo é incompatível com o favoritismo social ou econômico.'
                },
                {
                    pergunta: 'Qual a postura correta do auxiliar durante a pregação da Palavra?',
                    opcoes: [
                        'Conversar na porta do templo distraidamente.',
                        'Permanecer vigilante em oração, zelando pela ordem sem perturbar a ministração.',
                        'Sair do templo para resolver pendências particulares.',
                        'Interromper o pregador para fazer avisos.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O auxiliar deve manter postura solene, vigilante e em oração contínua.'
                }
            ]
        }]
    },
    {
        id: 'aux_04',
        nivelId: 'auxiliar',
        titulo: 'Módulo 4: Evangelismo Pessoal, Discipulado & Visitação',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Capítulo 10 - A Salvação',
        cargaHoraria: 16,
        ementa: 'A Grande Comissão no cotidiano da igreja local. Métodos práticos de evangelismo pessoal, distribuição de folhetos, acolhimento de novos decididos e visitação domiciliar.',
        trabalhoSugerido: 'Relatar uma experiência prática de evangelismo pessoal com preenchimento de ficha de novo decidido.',
        licoes: [{
            id: 'lic_aux_04',
            numero: 1,
            titulo: 'O Obreiro como Pescador de Almas e Discipulador Fiel',
            introducao: 'As Assembleias de Deus nasceram sob o fogo do evangelismo pentecostal de praça pública e visitas de casa em casa. O auxiliar de trabalho é o braço móvel do evangelho na comunidade.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 10 e 11), a salvação é oferecida gratuitamente a todos os seres humanos por meio da fé em Jesus Cristo, incumbindo à igreja a proclamação universal das Boas-Novas.',
            referenciasBiblicas: ['Mateus 28:19-20', 'Marcos 16:15', 'Atos 1:8', 'Provérbios 11:30', 'Romanos 10:14-17'],
            aplicacaoPratica: 'O obreiro deve portar folhetos evangelísticos, estar apto a apresentar o Plano de Salvação em quatro passos bíblicos e acompanhar novos convertidos na Escola Bíblica Dominical.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Mandato Imperativo da Grande Comissão',
                    conteudo: 'Jesus não fez da evangelização uma sugestão facultativa, mas uma ordem soberana: "Ide por todo o mundo, pregai o evangelho a toda criatura" (Mc 16:15). O auxiliar de trabalho deve ter paixão fervorosa pelas almas perdidas.',
                    destaqueExegese: 'Poreuthentes (πορευθέντες) em Mt 28:19: "indo", isto é, no fluxo contínuo do seu viver diário.',
                    pontosChave: ['Mandato apostólico irrecusável', 'Amor pelas almas que perecem', 'Dependência do Espírito Santo']
                },
                {
                    numero: 2,
                    subtitulo: '2. O Plano de Salvação em 4 Passos Bíblicos',
                    conteudo: 'Para evangelizar com clareza doutrinária: 1) O Amor de Deus e Seu propósito (Jo 3:16); 2) O problema do pecado e a separação espiritual (Rm 3:23; 6:23); 3) A solução divina em Jesus Cristo (Rm 5:8; 1 Co 15:3-4); 4) A decisão de arrependimento e fé (Jo 1:12; Rm 10:9-10).',
                    destaqueExegese: 'Metanoia (μετάνοια): mudança radical de mente e direção moral em relação a Deus.',
                    pontosChave: ['Universalidade do pecado', 'Morte vicária de Cristo', 'Necessidade de conversão genuína']
                },
                {
                    numero: 3,
                    subtitulo: '3. Acolhimento e Consolidação do Novo Convertido',
                    conteudo: 'Não basta que a pessoa levante as mãos no apelo do culto; ela precisa ser abraçada, cadastrada na Secretaria e matriculada na classe de Novos Convertidos da EBD para ser discipulada nas doutrinas básicas.',
                    destaqueExegese: 'Matheteuo (μαθητεύω): formar discípulos submissos aos ensinos do Mestre.',
                    pontosChave: ['Ficha de decisão preenchida com zelo', 'Primeira visita em 48 horas', 'Integração na Escola Dominical']
                },
                {
                    numero: 4,
                    subtitulo: '4. Princípios Éticos da Visitação aos Lares',
                    conteudo: 'Ao visitar lares, o auxiliar deve ir sempre em duplas (Lc 10:1), ser pontual, breve (no máximo 30 a 40 minutos), não se envolver em fofocas ou conflitos familiares e focar na leitura bíblica e oração fervorosa.',
                    destaqueExegese: 'Eirene (εἰρήνη): proclamar a bênção da paz de Cristo sobre cada casa.',
                    pontosChave: ['Visita em duplas fraternas', 'Breve e edificante', 'Oração com unção e autoridade']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese e Desafio Missionário Local',
                    conteudo: 'A vitalidade da igreja local é medida pelo número de batismos nas águas resultantes do evangelismo pessoal. O auxiliar é a vanguarda desse exército de salvadores de vidas.',
                    destaqueExegese: 'Kerygma (κήρυγμα): proclamação pública do evangelho da salvação.',
                    pontosChave: ['Foco na frutificação eterna', 'Oração pelos enfermos', 'Batismo em águas como alvo']
                }
            ],
            quiz: [
                {
                    pergunta: 'Quais os 4 passos elementares do Plano de Salvação bíblico?',
                    opcoes: [
                        'Prosperidade material, cura corporal, batismo em línguas e cargos na igreja.',
                        'Amor de Deus, Realidade do Pecado, Solução em Cristo e Decisão de Arrependimento e Fé.',
                        'Moralismo humano, caridade social, filiação eclesiástica e dízimos.',
                        'Regras alimentares, guarda de dias santos, rituais e misticismo.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O Plano de Salvação bíblico enfatiza a graça de Deus, o pecado humano, a cruz de Cristo e a resposta de fé.'
                },
                {
                    pergunta: 'Por que as visitas aos lares devem ser realizadas preferencialmente em duplas (Lc 10:1)?',
                    opcoes: [
                        'Para dividir as despesas de transporte apenas.',
                        'Para garantir apoio mútuo, segurança espiritual, testemunho irrepreensível e respaldo bíblico.',
                        'Para fiscalizar os bens materiais dos irmãos.',
                        'Porque é proibido orar sozinho.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Jesus enviou os discípulos de dois em dois para mútuo encorajamento e testemunho transparente.'
                }
            ]
        }]
    },
    {
        id: 'aux_05',
        nivelId: 'auxiliar',
        titulo: 'Módulo 5: Auxílio na Santa Ceia & Reverência Sacramental',
        capituloCGADB: 'Capítulo 13 - A Ceia do Senhor & Capítulo 14 - O Culto a Deus',
        cargaHoraria: 16,
        ementa: 'O significado memorial e de comunhão da Santa Ceia. O papel prático do auxiliar na organização das bandejas, pão, cálices e recolha com reverência e temor.',
        trabalhoSugerido: 'Redigir uma dissertação sobre 1 Coríntios 11:23-32 explicando o exame de consciência e a comunhão.',
        licoes: [{
            id: 'lic_aux_05',
            numero: 1,
            titulo: 'O Memorial da Cruz e o Serviço Sagrado à Mesa do Senhor',
            introducao: 'A Santa Ceia é a ordenança mais solene deixada pelo Senhor Jesus Cristo à Sua Igreja. Auxiliar os pastores e diáconos na ministração dos elementos exige pureza de mãos e santidade de coração.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 13), a Ceia do Senhor é uma ordenança comemorativa e de comunhão, não um sacrifício repetido, celebrando a morte vicária de Cristo até que Ele venha.',
            referenciasBiblicas: ['1 Coríntios 11:23-32', 'Mateus 26:26-29', 'Lucas 22:19-20', '1 Coríntios 10:16-17'],
            aplicacaoPratica: 'O auxiliar deve lavar as mãos, alinhar as toalhas da mesa, conferir a distribuição dos cálices e do pão asmo, e servir o povo com reverência, passos firmes e postura de oração contínua.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Instituição Sagrada e o Sentido Memorial',
                    conteudo: 'Na noite em que foi traído, o Senhor tomou o pão e o cálice estabelecendo a Nova Aliança no Seu sangue. A doutrina pentecostal rejeita a transubstanciação católica e a consubstanciação luterana, afirmando o valor memorial, espiritual e de comunhão viva dos crentes com Cristo.',
                    destaqueExegese: 'Anamnesis (ἀνάμνησις): recordação ativa e viva que traz ao presente a eficácia redentora da Cruz.',
                    pontosChave: ['Ordenança perpétua da igreja', 'Memorial da morte expiatória', 'Proclamação da Segunda Vinda']
                },
                {
                    numero: 2,
                    subtitulo: '2. Os Elementos da Ceia: Pão e Suco da Videira',
                    conteudo: 'O pão sem fermento tipifica a pureza e a santidade do corpo de Cristo entregue na cruz. O fruto da videira representa o precioso sangue da aliança derramado para remissão dos pecados de muitos.',
                    destaqueExegese: 'Koinonia (κοινωνία) em 1 Co 10:16: comunhão íntima e compartilhamento da vida com Cristo.',
                    pontosChave: ['Pão asmo como símbolo da pureza', 'Cálice como símbolo do sangue derramado', 'Unidade do corpo de Cristo']
                },
                {
                    numero: 3,
                    subtitulo: '3. A Preparação Prática da Mesa e dos Utensílios',
                    conteudo: 'Antes do culto de Santa Ceia, o auxiliar apoia a equipe de diaconisas e diáconos: esterilizar bandejas, encher os cálices individuais com higiene estrita, cobrir a mesa com tecido alvo e manter reserva de elementos.',
                    destaqueExegese: 'Hieros (ἱερός): separar e tratar com veneração o que pertence ao culto de Deus.',
                    pontosChave: ['Higiene rigorosa e assepsia', 'Toalhas limpas e alvas', 'Contagem prévia dos participantes']
                },
                {
                    numero: 4,
                    subtitulo: '4. A Liturgia de Distribuição e Recolha no Templo',
                    conteudo: 'Durante o momento solene, os obreiros descem aos corredores em filas sincronizadas. O auxiliar zela para que nenhuma pessoa em plena comunhão seja ignorada e recolhe os cálices usados com rapidez silenciosa.',
                    destaqueExegese: 'Eutaktos (εὐτάκτως): movimentar-se com ordem solene e compostura eclesiástica.',
                    pontosChave: ['Sincronismo e passos solenes', 'Atenção aos membros nas galerias', 'Recolha discreta dos cálices']
                },
                {
                    numero: 5,
                    subtitulo: '5. O Autoexame e a Ceia dos Enfermos',
                    conteudo: 'O obreiro nunca deve servir a mesa em pecado ou contenda (1 Co 11:28). Ao término da celebração no templo, os obreiros acompanham o pastor na visitação aos enfermos e idosos impossibilitados de comparecer, levando a Santa Ceia aos lares e hospitais.',
                    destaqueExegese: 'Dokimazeto (δοκιμαζέτω): examinar a si mesmo minuciosamente diante da santidade de Deus.',
                    pontosChave: ['Autoexame espiritual sincero', 'Levar a Ceia aos enfermos acamados', 'Glorificação a Deus']
                }
            ],
            quiz: [
                {
                    pergunta: 'O que ensina a Declaração de Fé da CGADB sobre a natureza da Ceia do Senhor?',
                    opcoes: [
                        'Que os elementos se transformam fisicamente no corpo literal de Jesus (transubstanciação).',
                        'Que é uma ordenança comemorativa e de comunhão que proclama a morte do Senhor até que Ele venha.',
                        'Que a Ceia deve ser tomada apenas uma vez na vida.',
                        'Que a Ceia perdoa pecados automaticamente sem necessidade de arrependimento.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A CGADB ensina que a Ceia é memorial e celebrativa da Nova Aliança no sangue de Cristo.'
                },
                {
                    pergunta: 'Qual o dever do crente antes de participar da Mesa do Senhor (1 Co 11:28)?',
                    opcoes: [
                        'Criticar a vida dos irmãos presentes.',
                        'Examinar-se a si mesmo, confessando seus pecados e buscando a comunhão e a santificação.',
                        'Apresentar comprovante de doação financeira.',
                        'Fazer voto de silêncio por um mês.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O apóstolo Paulo ordena que cada um examine a si mesmo antes de comer do pão e beber do cálice.'
                }
            ]
        }]
    }
];
