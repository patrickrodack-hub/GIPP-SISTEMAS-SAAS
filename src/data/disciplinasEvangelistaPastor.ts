import { DisciplinaObreiro } from './ModuleFormacaoObreirosData';

export const DISCIPLINAS_EVANGELISTA_PASTOR: DisciplinaObreiro[] = [
    // =========================================================================
    // NÍVEL 4: EVANGELISTA (5 MÓDULOS COMPLETOS)
    // =========================================================================
    {
        id: 'ev_01',
        nivelId: 'evangelista',
        titulo: 'Módulo 1: Missiologia Pentecostal & Plantação de Igrejas',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Capítulo 19 - O Batismo no Espírito',
        cargaHoraria: 28,
        ementa: 'A teologia bíblica de missões urbanas e transculturais. O dinamismo do movimento pentecostal brasileiro. Metodologia prática para abertura de congregações e evangelismo de massa.',
        trabalhoSugerido: 'Elaborar um projeto estratégico de evangelismo e implantação de uma nova congregação em um bairro não alcançado.',
        licoes: [{
            id: 'lic_ev_01',
            numero: 1,
            titulo: 'O Fogo Missionário e a Expansão do Reino de Deus',
            introducao: 'O ministério do evangelista é essencialmente dinâmico, pioneiro e desbravador. Ele arde pela salvação dos perdidos e pela expansão territorial da Igreja de Jesus Cristo.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 11 e 19), a igreja é uma comunidade eminentemente missionária, cuja força motriz é o poder do Espírito Santo derramado em Pentecostes.',
            referenciasBiblicas: ['Atos 1:8', 'Atos 8:4-8', 'Romanos 15:20-21', 'Efésios 4:11-12', 'Mateus 24:14'],
            aplicacaoPratica: 'O evangelista deve liderar cruzadas de salvação, evangelismo ao ar livre, cultos relâmpago e organizar grupos de pioneirismo para abrir novos campos missionários.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Chamado Específico do Evangelista (Ef 4:11)',
                    conteudo: 'Cristo concedeu uns para apóstolos, outros para profetas, outros para evangelistas, outros para pastores e doutores. O evangelista é o mensageiro especial do Evangelho (euangelistes), com graça singular para atrair almas a Cristo e confrontar as trevas.',
                    destaqueExegese: 'Euangelistes (εὐαγγελιστής): proclamador oficial das Boas-Novas de Salvação.',
                    pontosChave: ['Dom ministerial concedido por Cristo', 'Coração inflamado pelas almas perdidas', 'Capacidade de colheita espiritual rápida']
                },
                {
                    numero: 2,
                    subtitulo: '2. O Modelo de Filipe em Samaria e no Deserto (Atos 8)',
                    conteudo: 'Filipe é o modelo bíblico: pregava a multidões em Samaria com milagres e expulsão de demônios, mas também descia obediente ao deserto para evangelizar uma única pessoa (o eunuco etíope).',
                    destaqueExegese: 'Kerusso (κηρύσσω): proclamar com autoridade celestial o Senhorio de Jesus.',
                    pontosChave: ['Pregação em massa com sinais', 'Sensibilidade para o evangelismo individual', 'Submissão irrestrita à voz do Espírito']
                },
                {
                    numero: 3,
                    subtitulo: '3. Estratégia de Plantação de Igrejas Locais',
                    conteudo: 'Abertura de novos trabalhos exige: 1) Pesquisa demográfica espiritual e oração de intercessão no bairro; 2) Pontos de pregação em lares (células); 3) Realização de cruzadas de impactos; 4) Discipulado dos primeiros convertidos e formalização da congregação.',
                    destaqueExegese: 'Oikodome (οἰκοδομή): edificação estruturada e plantio firme do corpo local de Cristo.',
                    pontosChave: ['Mapeamento espiritual e intercessão', 'Pontos de pregação residenciais', 'Consolidação e autonomia da congregação']
                },
                {
                    numero: 4,
                    subtitulo: '4. Cruzadas ao Ar Livre e Evangelismo Urbano',
                    conteudo: 'A utilização de praças, tendas e sistemas de som móveis para alcançar os marginalizados. Parcerias com ações sociais, distribuição de alimentos e atendimento médico como ponte para a pregação da Palavra.',
                    destaqueExegese: 'Splanchnizomai (σπλαγχνίζομαι): mover-se de íntima compaixão pelas multidões desamparadas.',
                    pontosChave: ['Evangelismo dinâmico nas ruas', 'Ação social combinada com a Palavra', 'Oração pública com poder pentecostal']
                },
                {
                    numero: 5,
                    subtitulo: '5. O Apoio a Missões Nacionais e Mundiais',
                    conteudo: 'O evangelista mantém acesa a chama missionária da igreja local, incentivando a adoção de missionários em tribos indígenas, sertão nordestino e países da Janela 10/40.',
                    destaqueExegese: 'Apostello (ἀποστέλλω): enviar em missão oficial sob o comando do Senhor.',
                    pontosChave: ['Conscientização missionária da igreja', 'Sustento fiel aos missionários no campo', 'Amor transcultural pelas nações']
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual o perfil bíblico do evangelista demonstrado na vida de Filipe em Atos 8?',
                    opcoes: [
                        'Focar apenas em grandes auditórios recusando-se a falar com pessoas simples.',
                        'Pregar a multidões com sinais espirituais e ter sensibilidade para evangelizar individualmente sob a direção do Espírito.',
                        'Abandonar a sã doutrina para agradar ouvintes.',
                        'Vender orações e unções milagrosas.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Filipe ministrou tanto a grandes multidões em Samaria quanto a um único homem no caminho de Gaza.'
                },
                {
                    pergunta: 'Qual o papel fundamental da oração e da intercessão na plantação de uma nova igreja?',
                    opcoes: [
                        'Não tem relevância prática, pois o que importa é o marketing.',
                        'Desbaratar as fortalezas das trevas e preparar o solo espiritual dos corações para receberem a semente da Palavra.',
                        'Apenas preencher o tempo do culto.',
                        'Substituir a necessidade de pregar o Evangelho.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A batalha espiritual e a oração intercessória abrem as portas espirituais da cidade para a colheita.'
                }
            ]
        }]
    },
    {
        id: 'ev_02',
        nivelId: 'evangelista',
        titulo: 'Módulo 2: Apologética Bíblica & Defesa da Fé Cristã',
        capituloCGADB: 'Capítulo 1 - As Sagradas Escrituras & Capítulo 2 - O Único Deus',
        cargaHoraria: 28,
        ementa: 'A defesa racional e bíblica da fé (1 Pe 3:15; Judas 1:3). Refutação de seitas contemporâneas (Testemunhas de Jeová, Mormonismo, Espiritismo, Teologia da Prosperidade e Relativismo Moral).',
        trabalhoSugerido: 'Elaborar um quadro comparativo entre as doutrinas centrais do Cristianismo Bíblico e os erros teológicos de duas seitas modernas.',
        licoes: [{
            id: 'lic_ev_02',
            numero: 1,
            titulo: 'Batalhando pela Fé que uma vez foi dada aos Santos',
            introducao: 'Em tempos de apostasia generalizada e sincretismo religioso, o evangelista deve estar preparado para responder a todo aquele que pedir a razão da esperança cristã com mansidão e temor.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 1 e 2), as doutrinas da Trindade, da Deidade de Cristo, da Salvação pela Graça e da Inerrância Bíblica são inegociáveis.',
            referenciasBiblicas: ['1 Pedro 3:15', 'Judas 1:3', '2 Coríntios 10:4-5', 'Tito 1:9', 'Gálatas 1:8-9'],
            aplicacaoPratica: 'O evangelista deve capacitar a mocidade e a liderança a responder dúvidas intelectuais e proteger as famílias contra literaturas heréticas e ideologias anticristãs.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Mandato da Apologética Bíblica (1 Pe 3:15)',
                    conteudo: 'A apologética não significa brigar ou ofender, mas apresentar uma defesa fundamentada e lógica da verdade revelada. Pedro ordena: "Estai sempre preparados para responder com mansidão e temor a qualquer que vos pedir a razão da esperança que há em vós".',
                    destaqueExegese: 'Apologia (ἀπολογία): discurso de defesa verbal consistente e ordenado perante um tribunal.',
                    pontosChave: ['Defesa com inteligência e mansidão', 'A Bíblia como escudo inexpugnável', 'Respeito ao interlocutor sem negociar a verdade']
                },
                {
                    numero: 2,
                    subtitulo: '2. As Quatro Características das Seitas Pseudocristãs',
                    conteudo: 'Toda seita apresenta: 1) Adição às Escrituras (livros extras considerados inspirados); 2) Subtração da Deidade de Jesus (rebaixando Cristo a anjo ou criatura); 3) Multiplicação dos requisitos de salvação (salvação por obras da organização); 4) Divisão da lealdade dos crentes.',
                    destaqueExegese: 'Hairesis (αἵρεσις): escolha facciosa que se desvia do corpo unificado da verdade bíblica.',
                    pontosChave: ['Identificação dos 4 erros clássicos', 'Ataque à pessoa de Cristo', 'Monopólio sectário da salvação']
                },
                {
                    numero: 3,
                    subtitulo: '3. Refutação do Espiritismo e Reencarnação',
                    conteudo: 'A Bíblia rejeita categoricamente a reencarnação e a comunicação com os mortos. Hebreus 9:27 é categórico: "Aos homens está ordenado morrerem uma vez, vindo depois disso o juízo". A necromancia é abominação ao Senhor (Dt 18:10-12).',
                    destaqueExegese: 'Hapax (ἅπαξ): "uma única vez", de forma irrevogável e definitiva.',
                    pontosChave: ['Morte física única e juízo', 'Inexistência de reencarnação', 'Origem demoníaca das falsas manifestações mediúnicas']
                },
                {
                    numero: 4,
                    subtitulo: '4. Combate à Teologia da Prosperidade e Confissão Positiva',
                    conteudo: 'O evangelho da prosperidade perverte a graça ao transformar Deus em servo das vontades humanas e a fé em moeda de troca mercantilista. O verdadeiro Evangelho é o da Cruz, do arrependimento e do discipulado sacrificial (Lc 9:23).',
                    destaqueExegese: 'Aischrokerdes (αἰσχροκερδής): torpe ganância que mercantiliza a fé sagrada.',
                    pontosChave: ['Rejeição à venda de bênçãos', 'Centralidade da Cruz e do arrependimento', 'Graça soberana e incondicional de Deus']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese: A Supremacia da Revelação em Cristo',
                    conteudo: 'Nenhum anjo do céu ou revelação extra-bíblica pode alterar o Evangelho de Cristo (Gl 1:8). O evangelista apoia sua fé na rocha inabalável das Escrituras e conduz os indagadores aos pés do Salvador.',
                    destaqueExegese: 'Anathema (ἀνάθεμα): separado para juízo e maldição divina por perverter o Evangelho.',
                    pontosChave: ['Fidelidade doutrinária inegociável', 'Amor fraternal pelos enganados', 'Convicção inabalável na verdade']
                }
            ],
            quiz: [
                {
                    pergunta: 'O que declara Hebreus 9:27 em oposição direta à doutrina da reencarnação?',
                    opcoes: [
                        'Que os seres humanos voltam à terra muitas vezes para evoluir espiritualmente.',
                        'Que aos homens está ordenado morrerem uma só vez, vindo depois disso o juízo de Deus.',
                        'Que não existe vida após a morte.',
                        'Que todos serão salvos automaticamente.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A Bíblia declara que a morte terrena ocorre uma única vez, seguida imediatamente pelo juízo eterno.'
                },
                {
                    pergunta: 'Qual a postura bíblica exigida em 1 Pedro 3:15 ao defender a fé cristã?',
                    opcoes: [
                        'Agredir verbalmente as pessoas que discordam de nós.',
                        'Responder com mansidão, respeito, reverência e sólido embasamento bíblico.',
                        'Permanecer calado e fingir que concorda com qualquer erro.',
                        'Usar violência física para impor a doutrina.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A apologética cristã deve ser conduzida com mansidão, preparo intelectual e reverência santa.'
                }
            ]
        }]
    },
    {
        id: 'ev_03',
        nivelId: 'evangelista',
        titulo: 'Módulo 3: Soteriologia Bíblica & A Mensagem da Cruz',
        capituloCGADB: 'Capítulo 7 - A Queda da Humanidade, Capítulo 9 - O Pecado & Capítulo 10 - A Salvação',
        cargaHoraria: 28,
        ementa: 'A origem do pecado e a depravação humana. A expiação ilimitada em Cristo Jesus. Justificação pela fé, regeneração, santificação e a certeza da salvação.',
        trabalhoSugerido: 'Escrever uma monografia bíblica sobre a Graça Preveniente e a responsabilidade humana na salvação segundo a Declaração de Fé da CGADB.',
        licoes: [{
            id: 'lic_ev_03',
            numero: 1,
            titulo: 'A Redenção em Cristo e a Graça Acessível a Todos',
            introducao: 'O coração da pregação evangelística é a mensagem da Cruz. Compreender a Soteriologia arminiana-pentecostal é essencial para proclamar com convicção que Deus quer que todos os homens se salvem (1 Tm 2:4).',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 7, 9 e 10), o pecado causou a morte espiritual do homem, mas pela graça de Deus a expiação de Cristo é suficiente para o mundo inteiro e eficaz para os que creem.',
            referenciasBiblicas: ['João 3:16', 'Romanos 3:21-26', 'Tito 2:11', '1 Timóteo 2:3-6', 'Efésios 2:8-10'],
            aplicacaoPratica: 'O evangelista prega com a certeza de que nenhum ser humano está além do alcance da graça de Deus, chamando todos os ouvintes ao arrependimento imediato.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Queda e a Corrupção Universal do Pecado',
                    conteudo: 'Pela desobediência de Adão, o pecado entrou no mundo e com ele a morte física e espiritual (Rm 5:12). O ser humano perdeu a comunhão original com o Criador, tornando-se incapaz de salvar a si mesmo por seus próprios méritos ou obras.',
                    destaqueExegese: 'Hamartia (ἁμαρτία): errar o alvo da santidade e dos padrões divinos.',
                    pontosChave: ['Queda histórica literal no Éden', 'Morte espiritual de toda a humanidade', 'Necessidade absoluta de um Salvador']
                },
                {
                    numero: 2,
                    subtitulo: '2. A Expiação Ilimitada e a Graça Preveniente',
                    conteudo: 'As Assembleias de Deus creem que Jesus morreu por todos os pecadores sem exceção (1 Jo 2:2; Hb 2:9). Pela graça preveniente do Espírito Santo, Deus capacita a vontade humana a responder livremente ao convite da fé.',
                    destaqueExegese: 'Charis (χάρις): o favor imerecido e amoroso de Deus derramado sobre pecadores indignos.',
                    pontosChave: ['Cristo morreu por todos', 'Graça preveniente habilitadora', 'Rejeição à expiação limitada']
                },
                {
                    numero: 3,
                    subtitulo: '3. A Justificação pela Fé e a Regeneração (Novo Nascimento)',
                    conteudo: 'A justificação é o ato judicial de Deus pelo qual Ele declara justo o pecador arrependido, imputando-lhe a justiça perfeita de Cristo (Rm 5:1). A regeneração é o milagre interior do novo nascimento operado pelo Espírito Santo (Jo 3:3-5; Tt 3:5).',
                    destaqueExegese: 'Dikaioo (δικαιόω): declarar legalmente absolvido e justificado perante o tribunal divino.',
                    pontosChave: ['Justificação pela fé exclusiva', 'Imputação da justiça de Cristo', 'Regeneração e novo coração']
                },
                {
                    numero: 4,
                    subtitulo: '4. A Santificação Contínua e a Perseverança na Fé',
                    conteudo: 'A salvação é mantida pela permanência na fé em Cristo. As Escrituras advertem contra o pecado voluntário e a apostasia (Hb 3:12-14; 10:26-29), incentivando os salvos a perseverarem vigilantes até o fim.',
                    destaqueExegese: 'Hupomone (ὑπομονή): perseverança firme e inabalável sob as provações da vida.',
                    pontosChave: ['Perseverança vigilante na graça', 'Advertência bíblica contra a apostasia', 'Firmeza e certeza da salvação em Cristo']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese e o Apelo Evangelístico Eficaz',
                    conteudo: 'O sermão do evangelista sempre culmina no apelo claro e pungente: o tempo da salvação é hoje (2 Co 6:2). A mensagem da cruz continua sendo o poder de Deus para salvação de todo aquele que crê.',
                    destaqueExegese: 'Dynamis theou (δύναμις θεοῦ) em 1 Co 1:18: o dinamismo onipotente da Cruz de Cristo.',
                    pontosChave: ['Urgência do apelo evangelístico', 'Poder transformador da Cruz', 'Colheita abundante para o Senhor']
                }
            ],
            quiz: [
                {
                    pergunta: 'O que ensina a Declaração de Fé da CGADB sobre a abrangência da morte expiatória de Cristo?',
                    opcoes: [
                        'Que Jesus morreu apenas por um grupo seleto de pessoas pré-determinadas.',
                        'Que Cristo morreu vicariamente por todos os seres humanos, tornando a salvação acessível a qualquer um que se arrependa e creia.',
                        'Que a morte de Jesus não teve valor salvífico.',
                        'Que todos já nascem salvos automaticamente.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A teologia assembleiana professa a expiação ilimitada: Cristo morreu por todos (1 Jo 2:2; 1 Tm 2:4-6).'
                },
                {
                    pergunta: 'O que é a Justificação bíblica na doutrina da salvação?',
                    opcoes: [
                        'Uma desculpa humana para continuar pecando.',
                        'O ato soberano e judicial de Deus que declara o crente justo diante dEle com base na justiça e no sangue de Cristo.',
                        'O pagamento em dinheiro de indulgências.',
                        'Um ritual realizado no leito de morte.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A justificação é o veredito divino que absolve o pecador e o declara posicionado em justiça mediante a fé em Jesus.'
                }
            ]
        }]
    },
    {
        id: 'ev_04',
        nivelId: 'evangelista',
        titulo: 'Módulo 4: Antropologia & Hamartiologia Bíblica',
        capituloCGADB: 'Capítulo 7 - A Criação e Queda & Capítulo 8 - Os Anjos',
        cargaHoraria: 28,
        ementa: 'A criação do ser humano como ato imediato de Deus (Gênesis 1-2). A rejeição radical do evolucionismo e das ideologias secularistas. A origem do pecado no querubim ungido (Ezequiel 28).',
        trabalhoSugerido: 'Elaborar uma refutação teológica e exegética do evolucionismo teísta com base no texto hebraico de Gênesis 1 e 2.',
        licoes: [{
            id: 'lic_ev_04',
            numero: 1,
            titulo: 'A Criação Imediata do Homem e a Realidade do Mundo Espiritual',
            introducao: 'As Escrituras ensinam com clareza cristalina que o ser humano não é fruto de processos evolucionistas cegos, mas obra-prima direta das mãos do Deus Todo-Poderoso, dotado de dignidade e responsabilidade moral.',
            fundamentacaoDoutrinaria: 'Segundo a Declaração de Fé da CGADB (Capítulos 7 e 8), cremos na criação do homem de forma imediata (Gênesis 1:26-27), rejeitando categoricamente o evolucionismo em todas as suas variantes.',
            referenciasBiblicas: ['Gênesis 1:26-28', 'Gênesis 2:7', 'Salmo 139:13-16', 'Ezequiel 28:12-19', 'Isaías 14:12-15'],
            aplicacaoPratica: 'O evangelista deve combater as filosofias materialistas nas universidades e escolas, reafirmando a dignidade humana, a santidade da vida desde a concepção e a realidade da guerra espiritual.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Criação Imediata: Bara e Yatsar em Gênesis',
                    conteudo: 'Deus criou o homem do pó da terra e soprou em suas narinas o fôlego da vida (Gn 2:7). Não houve transmutação de espécies nem ancestrais primatas. O ser humano foi feito à imagem (tselem) e semelhança (demuth) de Deus.',
                    destaqueExegese: 'Bara (בָּרָא): criar algo novo a partir do nada; Yatsar (יָצַר): moldar com desígnio soberano.',
                    pontosChave: ['Criação especial direta', 'Homem e mulher criados por Deus', 'Rejeição do evolucionismo ateu e teísta']
                },
                {
                    numero: 2,
                    subtitulo: '2. A Tricotomia Bíblica: Espírito, Alma e Corpo',
                    conteudo: '1 Tessalonicenses 5:23 declara: "E o mesmo Deus de paz vos santifique em tudo; e todo o vosso espírito, alma e corpo sejam plenamente conservados irrepreensíveis para a vinda de nosso Senhor Jesus Cristo". O homem é um ser tricotômico integral.',
                    destaqueExegese: 'Pneuma (espírito), Psyche (alma) e Soma (corpo físico).',
                    pontosChave: ['Espírito: comunhão com Deus', 'Alma: intelecto, sentimentos e vontade', 'Corpo: templo do Espírito Santo']
                },
                {
                    numero: 3,
                    subtitulo: '3. A Origem e a Queda de Satanás',
                    conteudo: 'O pecado não se originou no homem, mas no mundo celestial através da soberba de Lúcifer, o querubim ungido protetor (Ez 28:14-17; Is 14:12-14), que desejou ser igual a Deus e foi expulso com a terça parte dos anjos caídos.',
                    destaqueExegese: 'Helel ben-Shachar (הֵילֵל בֶּן-שָׁחַר): o astro brilhante que caiu por causa da soberba.',
                    pontosChave: ['Queda angelical pela soberba', 'Origem primordial do pecado', 'Realidade dos demônios e potestades']
                },
                {
                    numero: 4,
                    subtitulo: '4. A Armadura de Deus e a Batalha Espiritual Bíblica',
                    conteudo: 'Nossa luta não é contra a carne e o sangue, mas contra os principados e potestades das trevas (Ef 6:10-18). O obreiro combate com as armas espirituais da oração fervorosa, jejum, Palavra e o Nome de Jesus.',
                    destaqueExegese: 'Panoplia (πανοπλία): a armadura defensiva e ofensiva completa do soldado de Cristo.',
                    pontosChave: ['Espada do Espírito que é a Palavra', 'Escudo da fé inabalável', 'Vitória consumada no Calvário']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese: A Vitória Final da Raça Redimida',
                    conteudo: 'Em Cristo, o último Adão (1 Co 15:45), o ser humano redimido é elevado a uma posição superior à dos anjos, tornando-se herdeiro de Deus e coerdeiro com Cristo para reinar eternamente.',
                    destaqueExegese: 'Sunkleronomoi (συγκληρονόμοι): coerdeiros de todos os tesouros do Reino com o Filho.',
                    pontosChave: ['Restauração da imagem de Deus', 'Destino eterno de glória', 'Triunfo final da justiça divina']
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual a posição oficial da Declaração de Fé da CGADB sobre as teorias da evolução das espécies?',
                    opcoes: [
                        'Aceita plenamente o evolucionismo como verdade indiscutível.',
                        'Rejeita absolutamente qualquer forma de evolucionismo, afirmando a criação imediata do homem por Deus conforme Gênesis 1 e 2.',
                        'Deixa a questão em aberto como opcional.',
                        'Ensina que o homem descende de extraterrestres.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A CGADB professa a criação imediata e especial do ser humano por Deus, rejeitando o evolucionismo.'
                },
                {
                    pergunta: 'O que causou a queda original do querubim ungido segundo Ezequiel 28 e Isaías 14?',
                    opcoes: [
                        'Falta de recursos materiais.',
                        'A soberba e o orgulho do seu coração ao desejar igualar-se a Deus.',
                        'Um erro dos outros anjos.',
                        'Fraqueza física involuntária.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O orgulho e a presunção de querer ser igual ao Altíssimo geraram o pecado primordial de Lúcifer.'
                }
            ]
        }]
    },
    {
        id: 'ev_05',
        nivelId: 'evangelista',
        titulo: 'Módulo 5: Escatologia Bíblica & O Arrebatamento da Igreja',
        capituloCGADB: 'Capítulo 22 - A Segunda Vinda de Cristo & Capítulo 23 - O Milênio e o Juízo',
        cargaHoraria: 28,
        ementa: 'A doutrina das últimas coisas. O arrebatamento pré-tribulacionista e iminente da Igreja. O Tribunal de Cristo, as Bodas do Cordeiro e a Grande Tribulação.',
        trabalhoSugerido: 'Elaborar uma linha do tempo escatológica detalhada segundo o modelo pré-milenista dispensacionalista clássico da CGADB.',
        licoes: [{
            id: 'lic_ev_05',
            numero: 1,
            titulo: 'O Som da Trombeta e a Bendita Esperança dos Santos',
            introducao: 'A mensagem escatológica é o grande combustível do ardor missionário assembleiano: "Maranata! Ora vem, Senhor Jesus!". O evangelista prega a urgência do arrebatamento para despertar a igreja do sono da mornidão.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 22 e 23), a Segunda Vinda de Cristo dar-se-á em duas fases distintas: a primeira, invisível ao mundo para arrebatar a Igreja antes da Grande Tribulação (pré-tribulacionismo); a segunda, visível com a Igreja em glória para estabelecer o Milênio literal.',
            referenciasBiblicas: ['1 Tessalonicenses 4:13-18', '1 Coríntios 15:51-54', 'Tito 2:13', 'Apocalipse 3:10', 'Mateus 24:36-44'],
            aplicacaoPratica: 'O evangelista deve convocar a igreja a viver em constante prontidão, santidade e vigilância, pois o arrebatamento pode acontecer a qualquer fração de segundo.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Distinção entre as Duas Fases da Segunda Vinda',
                    conteudo: 'Fase 1 (Arrebatamento): Cristo vem nos ares PARA a Sua Igreja, de forma repentina e invisível ao mundo incrédulo (1 Ts 4:16-17). Fase 2 (Manifestação em Glória): Sete anos depois, Cristo vem à terra COM a Sua Igreja e os anjos, pisando no Monte das Oliveiras para julgar as nações (Zc 14:4; Ap 19:11-16).',
                    destaqueExegese: 'Harpazo (ἁρπάζω): arrebatar subitamente com força irresistível.',
                    pontosChave: ['Arrebatamento secreto e glorioso', 'Manifestação pública visível 7 anos depois', 'Pré-tribulacionismo assembleiano clássico']
                },
                {
                    numero: 2,
                    subtitulo: '2. A Ressurreição dos Mortos em Cristo e a Transformação dos Vivos',
                    conteudo: 'Ao soar da última trombeta, os mortos em Cristo ressuscitarão primeiro com corpos incorruptíveis e glorificados. Em seguida, nós, os que estivermos vivos, seremos transformados em um piscar de olhos (1 Co 15:52).',
                    destaqueExegese: 'Atomo (ἄτομος) e rhipe ophthalmou (ῥιπῇ ὀφθαλμοῦ): na menor fração indivisível de tempo.',
                    pontosChave: ['Corpos glorificados imortais', 'Transformação instantânea dos vivos', 'Encontro com o Senhor nos ares']
                },
                {
                    numero: 3,
                    subtitulo: '3. O Tribunal de Cristo e a Distribuição de Galardões',
                    conteudo: 'Enquanto a terra passará pela Grande Tribulação, a Igreja comparecerá diante do Tribunal de Cristo (Bema) nos céus. Não se trata de julgamento de condenação eterna, mas de exame das obras e entrega de coroas e galardões aos servos fiéis (2 Co 5:10; 1 Co 3:12-15).',
                    destaqueExegese: 'Bema (βῆμα): o tribunal dos vencedores nos jogos olímpicos da antiguidade.',
                    pontosChave: ['Tribunal exclusivo para os salvos', 'Fogo que prova a qualidade das obras', 'Coroas imperecíveis de galardão']
                },
                {
                    numero: 4,
                    subtitulo: '4. As Bodas do Cordeiro na Glória Celestial',
                    conteudo: 'A celebração nupcial entre Cristo e Sua Noiva lavada e remida pelo sangue. As vestimentas de linho finíssimo e resplandecente representam os atos de justiça dos santos (Ap 19:7-9).',
                    destaqueExegese: 'Gamos tou Arniou (γάμος τοῦ Ἀρνίου): a festa eterna de núpcias do Noivo com Sua Igreja.',
                    pontosChave: ['A Igreja como noiva imaculada', 'Celebração celestial durante a tribulação', 'Comunhão perfeita face a face com Jesus']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese: A Esperança Purificadora da Igreja',
                    conteudo: '1 João 3:3 declara que todo aquele que tem essa esperança em Cristo purifica a si mesmo, assim como Ele é puro. A expectativa do arrebatamento santifica a vida do crente e impulsiona o evangelismo urgente.',
                    destaqueExegese: 'Maranatha (מרנא תא): O Senhor vem! O grito triunfante dos primeiros cristãos.',
                    pontosChave: ['Santificação pessoal pela esperança', 'Urgência na salvação de familiares', 'Consolo mútuo nas tribulações']
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual a doutrina oficial da CGADB quanto ao momento do Arrebatamento da Igreja em relação à Grande Tribulação?',
                    opcoes: [
                        'Pós-tribulacionismo (a igreja passa por todos os flagelos da Besta).',
                        'Pré-tribulacionismo (a igreja é arrebatada antes do início da Grande Tribulação).',
                        'Alegorismo (não haverá arrebatamento real).',
                        'Reencarnação dos santos na terra.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A Declaração de Fé da CGADB ensina que a Igreja será guardada da hora da provação mediante o Arrebatamento Pré-Tribulacionista.'
                },
                {
                    pergunta: 'Qual a finalidade do Tribunal de Cristo (Bema) nos céus para os salvos (2 Co 5:10)?',
                    opcoes: [
                        'Decidir quem vai para o inferno.',
                        'Avaliar as obras dos crentes para a concessão de recompensas e galardões eternos.',
                        'Punir fisicamente os santos.',
                        'Cobrar dívidas financeiras pendentes.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O Tribunal de Cristo não é para condenação, mas para recompensa e galardão das obras dos salvos.'
                }
            ]
        }]
    },
    {
        id: 'ev_04',
        nivelId: 'evangelista',
        titulo: 'Módulo 4: Apologética Pentecostal, Seitas e Heresias',
        capituloCGADB: 'Capítulo 1 - As Sagradas Escrituras & Capítulo 4 - A Divindade de Cristo',
        cargaHoraria: 28,
        ementa: 'Defesa racional e bíblica da fé cristã ortodoxa. Análise das seitas pseudocristãs, heresias históricas e contemporâneas, e o confronto com o secularismo e relativismo moral moderno.',
        trabalhoSugerido: 'Elaborar um guia apologético prático de refutação bíblica às heresias antitrinitárias e pseudocristãs.',
        licoes: [{
            id: 'lic_ev_04',
            numero: 1,
            titulo: 'A Defesa da Fé Cristã e o Combate aos Falsos Ensinos',
            introducao: 'O evangelista pentecostal não apenas proclama o Evangelho aos perdidos, mas é também um sentinela da verdade, chamado para batalhar pela fé que uma vez foi dada aos santos (Jd 1:3).',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 1 e 4), a Bíblia é a única autoridade infalível de fé e prática, e Jesus Cristo é plenamente Deus e homem, rejeitando qualquer distorção dogmática.',
            referenciasBiblicas: ['1 Pedro 3:15', 'Judas 1:3', '2 Coríntios 10:4-5', 'Tito 1:9', '1 João 4:1-3'],
            aplicacaoPratica: 'O obreiro deve saber responder com mansidão e temor a qualquer opositor, desmascarando sofismas nas redes sociais e nas ruas com autoridade bíblica.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Mandato Bíblico da Apologética (1 Pe 3:15)',
                    conteudo: 'A palavra grega apologia significa defesa jurídica fundamentada. O cristão deve estar sempre preparado para apresentar razões lógicas e bíblicas da sua esperança perante questionamentos ateístas ou heréticos.',
                    destaqueExegese: 'Apologia (ἀπολογία): discurso de defesa bem articulado e fundamentado na verdade.',
                    pontosChave: ['Mandato apostólico a todos os crentes', 'Mansidão e reverência no debate', 'Firmeza doutrinária inegociável']
                },
                {
                    numero: 2,
                    subtitulo: '2. Refutação das Seitas Pseudocristãs',
                    conteudo: 'Identificação dos quatro erros fundamentais das seitas: 1) Adicionam fontes de revelação humana além da Bíblia; 2) Subtraem da divindade de Jesus Cristo; 3) Multiplicam os requisitos para a salvação (legalismo); 4) Dividem a lealdade dos crentes centralizando no líder da seita.',
                    destaqueExegese: 'Hairesis (αἵρεσις): facção dissidente que corrompe o dogma salvífico fundamental.',
                    pontosChave: ['Exclusividade das Escrituras Sagradas', 'Divindade e humanidade perfeitas de Cristo', 'Salvação pela graça mediante a fé']
                },
                {
                    numero: 3,
                    subtitulo: '3. O Confronto com o Relativismo e Pós-Modernismo',
                    conteudo: 'A sociedade contemporânea rejeita a verdade absoluta. O evangelista deve demonstrar que a verdade moral e cósmica emana do Deus imutável e que Jesus é o único Caminho, a Verdade e a Vida (Jo 14:6).',
                    destaqueExegese: 'Aletheia (ἀλήθεια): a verdade objetiva, real e imutável revelada por Deus.',
                    pontosChave: ['Rejeição do relativismo moral', 'Cristo como Verdade encarnada', 'Coerência existencial e intelectual da fé']
                },
                {
                    numero: 4,
                    subtitulo: '4. Proteção do Rebanho contra o Sincretismo e Espiritismo',
                    conteudo: 'Combate ao espiritismo, reencarnacionismo e práticas ocultistas à luz de Hebreus 9:27 ("aos homens está ordenado morrerem uma vez, vindo depois disso o juízo").',
                    destaqueExegese: 'Pharmakeia (φαρμακεία): feitiçaria, manipulação espiritual oculta e mediunismo.',
                    pontosChave: ['Impossibilidade bíblica da reencarnação', 'Ressurreição corporal dos mortos', 'Libertação pelo sangue de Jesus']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese: A Apologética com Amor e Poder do Espírito',
                    conteudo: 'O verdadeiro apologista não busca humilhar o interlocutor, mas resgatar almas enganadas pelo inimigo. O conhecimento apologético aliado ao poder pentecostal opera convicção de pecado e transformação.',
                    destaqueExegese: 'Splagchnizomai: compaixão profunda que conduz o evangelista a resgatar os cativos do erro.',
                    pontosChave: ['Amor incondicional ao próximo enganado', 'Oração e jejum para quebrar cegueira espiritual', 'Testemunho de vida irrepreensível']
                }
            ],
            quiz: [
                {
                    pergunta: 'O que significa etimologicamente o termo grego Apologia no contexto teológico de 1 Pedro 3:15?',
                    opcoes: [
                        'Pedir desculpas por ser crente.',
                        'Defesa verbal fundamentada e articulada da fé com mansidão e respeito.',
                        'Atacar fisicamente quem não concorda com a igreja.',
                        'Criar novas doutrinas humanas.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Apologia vem do grego e significa defesa estruturada e justificação racional da fé cristã perante os homens.'
                },
                {
                    pergunta: 'Qual a posição da Declaração de Fé da CGADB quanto ao espiritismo e reencarnação?',
                    opcoes: [
                        'Aceita como compatível com os ensinos de Cristo.',
                        'Rejeita categoricamente à luz de Hb 9:27, ensinando a morte única e a ressurreição final.',
                        'Afirma que a reencarnação é opcional para cada crente.',
                        'Considera uma metáfora poética válida.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A Bíblia e a CGADB rejeitam absolutamente o reencarnacionismo, afirmando que ao homem está ordenado morrer uma só vez, seguindo-se o juízo divino.'
                }
            ]
        }]
    },
    {
        id: 'ev_05',
        nivelId: 'evangelista',
        titulo: 'Módulo 5: Teologia da Cura Divina e Batalha Espiritual Bíblica',
        capituloCGADB: 'Capítulo 21 - A Cura Divina & Capítulo 6 - O Espírito Santo',
        cargaHoraria: 28,
        ementa: 'Fundamentos bíblicos da Cura Divina baseada na expiação vicária de Cristo em Isaías 53:4-5. A autoridade do Nome de Jesus, imposição de mãos, libertação de oprimidos e discernimento de espíritos.',
        trabalhoSugerido: 'Redigir um ensaio teológico sobre a atualidade dos dons de curar e a práxis pentecostal de oração pelos enfermos.',
        licoes: [{
            id: 'lic_ev_05',
            numero: 1,
            titulo: 'O Poder Redentor na Cura dos Enfermos e Libertação',
            introducao: 'A cura divina é um distintivo central do pentecostalismo clássico. Cremos que Jesus Cristo cura os enfermos hoje da mesma forma como fazia na Galileia, operando milagres pelo poder do Seu Nome.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 21), a cura divina foi provida na expiação de Cristo no Calvário e continua sendo ministrada pelo Espírito Santo mediante a oração da fé.',
            referenciasBiblicas: ['Isaías 53:4-5', 'Mateus 8:16-17', 'Marcos 16:17-18', 'Tiago 5:14-16', 'Lucas 10:19'],
            aplicacaoPratica: 'O obreiro deve orar com fé pelos doentes nos hospitais, lares e cultos, ministrando o óleo da unção e repreendendo espíritos malignos no Nome de Jesus.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Provisão da Cura na Expiação (Isaías 53:4-5)',
                    conteudo: 'O profeta Isaías vislumbrou que o Messias carregaria sobre Si as nossas enfermidades e dores, e pelas Suas pisaduras fomos sarados. Em Mateus 8:17, o evangelista aplica essa profecia diretamente às curas físicas realizadas por Jesus.',
                    destaqueExegese: 'Rapha (רָפָא): curar, restaurar a integridade física, emocional e espiritual.',
                    pontosChave: ['Cura provida no sacrifício vicário', 'Aplicação neotestamentária clara', 'Salvação integral do ser humano']
                },
                {
                    numero: 2,
                    subtitulo: '2. Os Sinais que Acompanham os que Creem (Marcos 16:17-18)',
                    conteudo: 'Na Grande Comissão, Jesus outorgou autoridade à Sua Igreja: "Em meu nome expulsarão demônios; falarão novas línguas... e porão as mãos sobre os enfermos e os curarão". Os milagres chancelam a pregação da Palavra.',
                    destaqueExegese: 'Semeion (σημεῖον): sinal miraculoso que atesta a autenticidade da mensagem divina.',
                    pontosChave: ['Autoridade no Nome de Jesus', 'Imposição de mãos com fé', 'Confirmação do Evangelho aos incrédulos']
                },
                {
                    numero: 3,
                    subtitulo: '3. A Prescrição Pastoral de Tiago 5:14-16',
                    conteudo: 'Tiago instrui: "Está alguém entre vós doente? Chame os presbíteros da igreja, e orem sobre ele, ungindo-o com azeite em nome do Senhor; e a oração da fé salvará o doente, e o Senhor o levantará".',
                    destaqueExegese: 'Euche tes pisteos (εὐχὴ τῆς πίστεως): a oração confiante e fervorosa da fé inabalável.',
                    pontosChave: ['Chamado aos presbíteros e pastores', 'Unção bíblica com azeite', 'Confissão de faltas e comunhão']
                },
                {
                    numero: 4,
                    subtitulo: '4. Batalha Espiritual Bíblica vs. Modismos',
                    conteudo: 'A batalha espiritual legítima baseia-se em Efésios 6:10-18 (a armadura de Deus). Rejeitamos modismos heréticos como mapeamento espiritual fetichista, quebra de maldições hereditárias para crentes em Cristo ou pactos comerciais com Deus.',
                    destaqueExegese: 'Panoplia (πανοπλία): a armadura defensiva completa concedida por Deus ao crente.',
                    pontosChave: ['Armadura de Deus em Efésios 6', 'Vitória consumada no Calvário', 'Rejeição de aberrações teológicas']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese: A Esperança da Plena Redenção do Corpo',
                    conteudo: 'Embora experimentemos curas miraculosas no presente como antegosto do Reino, a cura plena e definitiva ocorrerá na ressurreição dos mortos, quando este corpo corruptível se revestir da imortalidade gloriosa (1 Co 15:53).',
                    destaqueExegese: 'Apolytrosis tou somatos (ἀπολύτρωσις τοῦ σώματος): a redenção e glorificação final do nosso corpo.',
                    pontosChave: ['Curas presentes como penhor do Reino', 'Soberania de Deus na cura', 'Glorificação final no arrebatamento']
                }
            ],
            quiz: [
                {
                    pergunta: 'Em qual passagem profética do Antigo Testamento está fundamentada a provisão da Cura Divina na expiação vicária de Cristo?',
                    opcoes: [
                        'Gênesis 3:15.',
                        'Isaías 53:4-5 (confirmado em Mateus 8:16-17).',
                        'Ezequiel 37:1-10.',
                        'Jonas 2:9.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Isaías 53:4-5 profetiza que Cristo levou as nossas enfermidades e dores, fundamento teológico reafirmado em Mateus 8:17 e 1 Pedro 2:24.'
                },
                {
                    pergunta: 'Segundo Tiago 5:14-15, qual a conduta orientada quando um crente adoece na igreja?',
                    opcoes: [
                        'Desistir da fé e procurar médiuns espíritas.',
                        'Chamar os presbíteros da igreja para orarem sobre ele, ungindo-o com azeite em nome do Senhor.',
                        'Fazer promessas financeiras para comprar a bênção.',
                        'Ficar em isolamento total sem oração.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Tiago prescreve a oração da fé ministrada pelos presbíteros com a unção em nome do Senhor Jesus.'
                }
            ]
        }]
    },

    // =========================================================================
    // NÍVEL 5: PASTOR (5 MÓDULOS COMPLETOS)
    // =========================================================================
    {
        id: 'pr_01',
        nivelId: 'pastor',
        titulo: 'Módulo 1: Teologia Pastoral & Apascentamento do Rebanho',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Capítulo 20 - Os Dons Ministeriais',
        cargaHoraria: 32,
        ementa: 'A vocação e o cajado pastoral segundo Jeremias 3:15 e 1 Pedro 5:1-4. A solidão da liderança, o autocuidado emocional, a oração sacerdotal e a proteção das ovelhas contra lobos vorazes.',
        trabalhoSugerido: 'Elaborar um tratado pastoral sobre a liderança servidora de Cristo versus o autoritarismo eclesiástico.',
        licoes: [{
            id: 'lic_pr_01',
            numero: 1,
            titulo: 'O Pastor segundo o Coração de Deus e o Modelo de Cristo',
            introducao: 'O pastorado é o mais elevado encargo de apascentamento na igreja de Deus. O verdadeiro pastor não é um executivo de empresas nem um senhor despótico, mas um pai espiritual que dá a sua vida pelas ovelhas.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 11 e 20), o ministério pastoral é um dom supremo concedido por Cristo ressurreto para governar, ensinar e alimentar o rebanho de Deus.',
            referenciasBiblicas: ['Jeremias 3:15', 'João 10:11-16', '1 Pedro 5:1-4', 'Atos 20:28-31', 'Hebreus 13:17'],
            aplicacaoPratica: 'O pastor deve visitar os lares, chorar com os que choram, discernir ensinamentos falsos e liderar com integridade inquestionável, amando até as ovelhas mais difíceis.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Chamado Soberano e o Peso da Responsabilidade',
                    conteudo: 'Em Jeremias 3:15, Deus promete: "E dar-vos-ei pastores segundo o meu coração, os quais vos apascentarão com ciência e com inteligência". O pastor prestará contas no Tribunal de Deus por cada alma que esteve sob seu cajado (Hb 13:17).',
                    destaqueExegese: 'Poimen (ποιμήν): o pastor que guia, protege e nutre o rebanho com amor sacrificial.',
                    pontosChave: ['Vocação irrevogável de Deus', 'Apascentar com sabedoria bíblica', 'Prestação solene de contas ao Sumo Pastor']
                },
                {
                    numero: 2,
                    subtitulo: '2. As Quatro Admoestações de 1 Pedro 5:1-4',
                    conteudo: 'Pedro instrui os pastores: 1) Pastorear espontaneamente e não por obrigação; 2) Não por torpe ganância, mas de boa vontade; 3) Não como dominadores sobre a herança de Deus, mas servindo de exemplo ao rebanho; 4) Foco na coroa de glória prometida por Cristo.',
                    destaqueExegese: 'Katakyrieuo (κατακυριεύω): tiranizar ou exercer domínio ditatorial sobre as ovelhas.',
                    pontosChave: ['Liderança pelo exemplo santo', 'Rejeição categórica do autoritarismo', 'Desapego financeiro e generosidade']
                },
                {
                    numero: 3,
                    subtitulo: '3. A Defesa do Rebanho contra os Lobos Vorazes (Atos 20:28-30)',
                    conteudo: 'Paulo advertiu os anciãos de Éfeso que, após sua partida, entrariam no meio deles lobos cruéis que não poupariam o rebanho, proferindo coisas perversas para atrair discípulos. O pastor deve brandir o cajado da sã doutrina.',
                    destaqueExegese: 'Lykoi bareis (λύκοι βαρεῖς): lobos vorazes, predadores espirituais perigosos.',
                    pontosChave: ['Vigilância doutrinária incansável', 'Discernimento de falsos mestres', 'Proteção aos membros vulneráveis']
                },
                {
                    numero: 4,
                    subtitulo: '4. A Saúde Emocional, Familiar e o Combate ao Burnout Pastoral',
                    conteudo: 'O pastor não é de ferro. Ele precisa de tempo de descanso com sua esposa e filhos, lazer sadio e mentoria espiritual para não sucumbir à depressão, exaustão física ou crises conjugais.',
                    destaqueExegese: 'Sabbath (שַׁבָּת): o princípio divino do repouso restaurador do corpo e da mente.',
                    pontosChave: ['Prioridade da família pastoral', 'Descanso semanal obrigatório', 'Companheirismo e oração entre pares']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese e a Coroa da Glória no Retorno de Cristo',
                    conteudo: 'Quando se manifestar o Sumo Pastor (Archipoimen), os pastores fiéis receberão a coroa imurchível da glória. O valor de um ministério não se mede por aplausos terrenos, mas pela aprovação final do Cordeiro.',
                    destaqueExegese: 'Archipoimen (ἀρχιποίμην): o Príncipe e Supremo Pastor de toda a Igreja Universal.',
                    pontosChave: ['Aprovação divina como meta suprema', 'Recompensa que nunca perde o brilho', 'Fidelidade pastoral até o fim']
                }
            ],
            quiz: [
                {
                    pergunta: 'Como o apóstolo Pedro ordena que os pastores governem a igreja em 1 Pedro 5:2-3?',
                    opcoes: [
                        'Como ditadores arrogantes que impõem sua vontade pela força e cobranças financeiras.',
                        'Não por constrangimento ou ganância, nem como dominadores, mas servindo de exemplo voluntário ao rebanho.',
                        'Delegando tudo a pessoas estranhas sem se envolver.',
                        'Buscando honrarias e cargos políticos seculares.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O governo pastoral bíblico é exercido pelo exemplo, pelo amor e pela humildade de servo.'
                },
                {
                    pergunta: 'Qual a advertência solene de Paulo aos pastores em Atos 20:28?',
                    opcoes: [
                        'Cuidar apenas de construir prédios luxuosos.',
                        'Olhar por si mesmos e por todo o rebanho sobre o qual o Espírito Santo os constituiu bispos, para apascentar a igreja que Cristo resgatou com Seu próprio sangue.',
                        'Abandonar as ovelhas fracas para focar nos ricos.',
                        'Evitar pregar sobre o pecado.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A igreja foi comprada com o sangue de Deus em Cristo, exigindo vigilância extrema do pastor.'
                }
            ]
        }]
    },
    {
        id: 'pr_02',
        nivelId: 'pastor',
        titulo: 'Módulo 2: Eclesiologia Clássica & Governança da CGADB',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus',
        cargaHoraria: 32,
        ementa: 'A estrutura estatutária e regimental das Assembleias de Deus. As Convenções Estaduais e a CGADB. Relações com o poder civil, imunidade tributária, atas notariais e direito eclesiástico.',
        trabalhoSugerido: 'Elaborar uma minuta completa de Ata de Assembleia Geral Extraordinária para reforma de estatuto social da igreja local.',
        licoes: [{
            id: 'lic_pr_02',
            numero: 1,
            titulo: 'A Igreja Local e a Comunhão Fraternal Convencional',
            introducao: 'O pastor presidente precisa unir a unção espiritual à competência jurídica e administrativa. Administrar uma congregação exige cumprimento rigoroso das leis civis brasileiras e dos estatutos da denominação.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 11), a igreja é autônoma em sua gestão local, mantendo laços fraternais, doutrinários e cooperativos com a Convenção Estadual e Nacional (CGADB).',
            referenciasBiblicas: ['1 Coríntios 14:40', 'Atos 15:1-31', 'Romanos 13:1-7', '2 Coríntios 8:20-21', 'Tito 1:5'],
            aplicacaoPratica: 'O pastor deve manter em dia o CNPJ da igreja, atas registradas em cartório de registro civil de pessoas jurídicas, livros contábeis auditados e certidões negativas perante o fisco.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Concílio de Jerusalém como Modelo de Convenção (Atos 15)',
                    conteudo: 'Quando surgiu grave controvérsia doutrinária sobre a circuncisão dos gentios, os apóstolos e presbíteros reuniram-se em concílio em Jerusalém para deliberar sob a guia do Espírito Santo. Esse é o fundamento bíblico para as Assembleias Gerais e Convenções.',
                    destaqueExegese: 'Dogmata (δόγματα) em At 16:4: decretos e diretrizes eclesiásticas consensuais para a paz das igrejas.',
                    pontosChave: ['Deliberação colegiada fraterna', 'Direção soberana do Espírito Santo', 'Unidade doutrinária preservada']
                },
                {
                    numero: 2,
                    subtitulo: '2. A Estrutura Organizacional: Ministério Local, Campo e Filiais',
                    conteudo: 'O modelo assembleiano tradicional opera no sistema de Campo Eclesiástico (Igreja Sede e congregações filiadas). O Pastor Presidente responde legal e espiritualmente pelo patrimônio unificado e pela escala dos obreiros.',
                    destaqueExegese: 'Oikonomia (οἰκονομία): administração santa, justa e ordenada da Casa de Deus.',
                    pontosChave: ['Igreja sede e congregações integradas', 'Patrimônio institucional protegido', 'Rodízio e consagração de oficiais']
                },
                {
                    numero: 3,
                    subtitulo: '3. Conformidade Jurídica e Direito Canônico/Eclesiástico',
                    conteudo: 'A igreja deve ter: Estatuto Social registrado, Ata de Eleição da Diretoria vigente, Livro de Presença de Membros, Livro de Registro de Casamentos Religiosos com Efeito Civil e respeito estrito ao Código Civil Brasileiro.',
                    destaqueExegese: 'Cumprir as exigências da lei dos homens para que o Evangelho seja honrado (Rm 13:7).',
                    pontosChave: ['Estatuto Social atualizado', 'Atas cartorárias tempestivas', 'Imunidade tributária constitucional assegurada']
                },
                {
                    numero: 4,
                    subtitulo: '4. Condução de Assembleias Gerais Ordinárias e Extraordinárias',
                    conteudo: 'O pastor deve presidir a mesa diretora com serenidade e imparcialidade, seguindo a ordem do dia, garantindo direito à voz aos membros em comunhão e registrando votações com exatidão matemática.',
                    destaqueExegese: 'Boule (βουλή): conselho deliberativo conduzido com temor e prudência.',
                    pontosChave: ['Edital de convocação nos prazos legais', 'Quórum estatutário respeitado', 'Votações transparentes e pacíficas']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese e Relação com a Convenção Geral (CGADB)',
                    conteudo: 'O pastor assembleiano mantém sua credencial ativa perante a CGADB, participa das assembleias convencionais, apoia a CPAD (editora oficial) e zela pelo ensino puro e padronizado em todas as congregações.',
                    destaqueExegese: 'Koinonoi (κοινωνοί): parceiros e companheiros de ministério na mesma vocação celestial.',
                    pontosChave: ['Comunhão com a CGADB', 'Adoção exclusiva da literatura CPAD', 'Fortalecimento da denominação nacional']
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual o fundamento bíblico no Novo Testamento para a realização de reuniões convencionais entre líderes (Atos 15)?',
                    opcoes: [
                        'O Concílio apostólico de Jerusalém para resolver questões doutrinárias e estabelecer a paz.',
                        'A formação de partidos políticos partidários.',
                        'A cobrança de taxas financeiras obrigatórias dos crentes.',
                        'A proibição de viagens missionárias.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'Atos 15 registra o primeiro concílio eclesiástico para preservar a unidade da doutrina e da comunhão.'
                },
                {
                    pergunta: 'Por que é indispensável registrar as atas de assembleia da igreja em cartório civil?',
                    opcoes: [
                        'Apenas para gastar dinheiro com taxas.',
                        'Para conferir validade jurídica aos atos da diretoria, representar a igreja perante bancos/fisco e proteger o patrimônio institucional de Deus.',
                        'Porque a Bíblia proíbe ter fé sem documentos.',
                        'Para transformar a igreja em empresa comercial com fins lucrativos.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O registro em cartório cumpre o Código Civil, confere publicidade e resguarda juridicamente a instituição.'
                }
            ]
        }]
    },
    {
        id: 'pr_03',
        nivelId: 'pastor',
        titulo: 'Módulo 3: Escatologia Bíblica II: O Milênio, Juízo Final & Nova Jerusalém',
        capituloCGADB: 'Capítulo 23 - O Milênio, o Juízo Final e o Estado Eterno',
        cargaHoraria: 32,
        ementa: 'A Batalha do Armagedom e a Segunda Vinda visível com a Igreja. O reinado milenar literal de Cristo na terra. A revolta final de Gogue e Magogue, o Grande Trono Branco e o Novo Céu e Nova Terra.',
        trabalhoSugerido: 'Elaborar uma exegese comparativa entre o Tribunal de Cristo (Bema) e o Grande Trono Branco (Juízo Final de Apocalipse 20).',
        licoes: [{
            id: 'lic_pr_03',
            numero: 1,
            titulo: 'O Triunfo Eterno do Cordeiro e o Novo Céu e Nova Terra',
            introducao: 'A história humana não terminará em um holocausto nuclear aleatório nem no triunfo das trevas. A soberania de Deus culminará no reinado de Cristo, na destruição final de Satanás e na bem-aventurança eterna dos remidos na Nova Jerusalém.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 23), cremos no Milênio literal de mil anos de paz e justiça na terra com Cristo reinando em Jerusalém, no Juízo Final diante do Grande Trono Branco e na eternidade com Deus.',
            referenciasBiblicas: ['Apocalipse 19:11-21', 'Apocalipse 20:1-15', 'Apocalipse 21:1-8', 'Isaías 11:1-9', '1 Coríntios 15:24-28'],
            aplicacaoPratica: 'O pastor deve proclamar a vitória escatológica de Cristo para confortar a igreja nas aflições deste mundo, mantendo os olhos do rebanho fixos na Pátria Celestial.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Segunda Vinda Visível e a Derrota da Besta (Ap 19)',
                    conteudo: 'Ao fim da Grande Tribulação, os céus se abrirão e Cristo descerá montado em um cavalo branco com os exércitos celestiais (a Igreja glorificada). A Besta e o Falso Profeta serão lançados vivos no Lago de Fogo e Satanás será amarrado por mil anos no Abismo.',
                    destaqueExegese: 'Basileus basileon kai Kyrios kyrion: Rei dos Reis e Senhor dos Senhores gravado em Sua coxa.',
                    pontosChave: ['Vitória fulminante sobre o Anticristo', 'Prisão de Satanás por mil anos', 'Libertação do remanescente de Israel']
                },
                {
                    numero: 2,
                    subtitulo: '2. O Milênio Literal de Cristo sobre a Terra (Ap 20:1-6)',
                    conteudo: 'As Assembleias de Deus são pré-milenistas. Cristo reinará visivelmente a partir de Jerusalém por 1000 anos literais. A terra experimentará paz universal, restauração da natureza (o lobo habitará com o cordeiro - Is 11:6) e justiça sem corrupção.',
                    destaqueExegese: 'Chilia ete (χίλια ἔτη): mil anos literais descritos seis vezes consecutivas em Apocalipse 20.',
                    pontosChave: ['Reinado teocrático literal de Jesus', 'Paz ecológica e política mundial', 'A Igreja reinando com Cristo']
                },
                {
                    numero: 3,
                    subtitulo: '3. A Soltura de Satanás e a Rebelião Final de Gogue e Magogue',
                    conteudo: 'Ao término dos mil anos, Satanás será solto por um pouco de tempo para provar a humanidade nascida durante o Milênio. Uma rebelião final cercará Jerusalém, mas fogo descerá dos céus e consumirá os rebeldes. O diabo será lançado eternamente no Lago de Fogo.',
                    destaqueExegese: 'Gehenna / Limne tou pyros: o Lago de Fogo e Enxofre de tormento eterno sem fim.',
                    pontosChave: ['Incorrigibilidade do coração rebelde', 'Fogo consumidor dos céus', 'Condenação final e definitiva de Satanás']
                },
                {
                    numero: 4,
                    subtitulo: '4. O Juízo do Grande Trono Branco (Ap 20:11-15)',
                    conteudo: 'A terra e o céu fugirão diante da majestade de Deus. Todos os mortos ímpios de todas as eras ressuscitarão para serem julgados segundo as suas obras registradas nos livros. Aquele cujo nome não for achado no Livro da Vida será lançado no Lago de Fogo (a segunda morte).',
                    destaqueExegese: 'Biblion tes zoes (βιβλίον τῆς ζωῆς): o Livro da Vida dos redimidos pelo sangue de Cristo.',
                    pontosChave: ['Ressurreição dos ímpios', 'Juízo justo sem favoritismo', 'A realidade terrível da Segunda Morte']
                },
                {
                    numero: 5,
                    subtitulo: '5. O Novo Céu, Nova Terra e a Nova Jerusalém (Ap 21-22)',
                    conteudo: 'Deus fará novas todas as coisas. A Nova Jerusalém descerá dos céus adornada. Deus habitará para sempre com os homens; não haverá mais morte, nem pranto, nem dor, porque as primeiras coisas passaram (Ap 21:4). O Senhor reinará pelos séculos dos séculos!',
                    destaqueExegese: 'Kainos (καινός): novo em qualidade gloriosa, radiante e incorruptível.',
                    pontosChave: ['Comunhão eterna face a face com Deus', 'Fim de toda dor, lágrima e morte', 'Glória incomparável para sempre']
                }
            ],
            quiz: [
                {
                    pergunta: 'O que acontecerá no Juízo do Grande Trono Branco de Apocalipse 20:11-15?',
                    opcoes: [
                        'Os ímpios que rejeitaram a Deus ressuscitarão para serem julgados com base nas suas obras e no Livro da Vida.',
                        'Será uma festa de comemoração política.',
                        'Os crentes serão julgados para perderem a salvação.',
                        'Ninguém será condenado.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'O Grande Trono Branco é o juízo final dos mortos sem Cristo que ressurgem na segunda ressurreição.'
                },
                {
                    pergunta: 'Qual a promessa consoladora descrita em Apocalipse 21:4 sobre o estado eterno?',
                    opcoes: [
                        'Que haverá sofrimento eterno para os salvos.',
                        'Que Deus enxugará de seus olhos toda a lágrima; e não haverá mais morte, nem pranto, nem clamor, nem dor.',
                        'Que a terra será destruída para sempre sem nada novo no lugar.',
                        'Que os crentes se transformarão em anjos com harpas.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Apocalipse 21:4 declara o fim perpétuo do sofrimento, do luto e da dor na presença do Deus Santo.'
                }
            ]
        }]
    },
    {
        id: 'pr_04',
        nivelId: 'pastor',
        titulo: 'Módulo 4: Aconselhamento Conjugal Avançado & Defesa da Família Tradicional',
        capituloCGADB: 'Capítulo 24 - A Família',
        cargaHoraria: 32,
        ementa: 'A teologia da família bíblica. O casamento heterossexual e monogâmico perante Deus. Conflitos conjugais complexos, infidelidade, perdão e preservação moral das crianças.',
        trabalhoSugerido: 'Elaborar um curso intensivo de noivos com 6 palestras fundamentadas em Efésios 5 e 1 Coríntios 7.',
        licoes: [{
            id: 'lic_pr_04',
            numero: 1,
            titulo: 'O Santuário da Família e a Preservação dos Valores Bíblicos',
            introducao: 'A família foi a primeira instituição criada por Deus no Éden antes mesmo do Estado e da Igreja. O pastor presidente é o principal guardião da integridade matrimonial e moral das famílias da igreja.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 24), o casamento é a união santa, monogâmica e indissolúvel entre um homem e uma mulher, sendo a família a base primordial da sociedade cristã.',
            referenciasBiblicas: ['Gênesis 2:21-24', 'Mateus 19:4-6', 'Efésios 5:22-33', '1 Pedro 3:1-7', 'Malaquias 2:14-16'],
            aplicacaoPratica: 'O pastor deve promover seminários de casais, aconselhar com firmeza bíblica e proteger os jovens e crianças contra as investidas das ideologias secularistas anticristãs.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Casamento no Princípio Criacional (Gn 2:24)',
                    conteudo: 'Jesus confirmou em Mateus 19:4-5 que Deus "no princípio os fez macho e fêmea". Por isso deixará o homem a seu pai e sua mãe e se unirá à sua mulher, e serão os dois uma só carne. O casamento é uma aliança irrevogável diante do Altíssimo.',
                    destaqueExegese: 'Basar echad (בָּשָׂר אֶחָד): uma só carne, fusão espiritual, emocional e física total.',
                    pontosChave: ['Heterossexualidade bíblica original', 'Monogamia perpétua', 'Aliança santa indissolúvel']
                },
                {
                    numero: 2,
                    subtitulo: '2. Os Papéis Bíblicos no Casamento (Efésios 5)',
                    conteudo: 'O marido é a cabeça do lar com a responsabilidade de amar sacrificialmente sua esposa como Cristo amou a Igreja. A esposa deve respeitar e submeter-se voluntariamente ao marido no Senhor. O abuso e a violência doméstica são pecados hediondos.',
                    destaqueExegese: 'Agapao (ἀγαπάω): amor incondicional que se doa até à morte pelo cônjuge.',
                    pontosChave: ['Liderança amorosa e protetora do marido', 'Submissão e respeito mútuo da esposa', 'Repúdio total a qualquer violência física ou verbal']
                },
                {
                    numero: 3,
                    subtitulo: '3. Aconselhamento Pastoral em Casos de Infidelidade e Crise',
                    conteudo: 'Diante do adultério, o pastor busca a reconciliação e o perdão genuíno quando há arrependimento profundo. O processo de restauração da confiança exige tempo, transparência total e acompanhamento espiritual minucioso.',
                    destaqueExegese: 'Aphiemi (ἀφίημι): perdoar cancelando a dívida e liberando a alma para a cura.',
                    pontosChave: ['Arrependimento profundo e confissão', 'Perdão e restauração da aliança', 'Cuidado com as feridas emocionais']
                },
                {
                    numero: 4,
                    subtitulo: '4. A Educação Cristã dos Filhos e o Discipulado do Lar',
                    conteudo: 'Deuteronômio 6 e Efésios 6:4 ensinam que os pais são os primeiros sacerdotes dos filhos. A igreja apoia os pais com a Escola Dominical, mas a formação de caráter espiritual começa nos joelhos de oração do lar.',
                    destaqueExegese: 'Paideia kai nouthesia Kyriou: instrução formativa e disciplina amorosa do Senhor.',
                    pontosChave: ['Culto doméstico diário', 'Exemplo vivo de integridade dos pais', 'Blindagem contra as influências do mundo']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese: A Família Forte Gera uma Igreja Inabalável',
                    conteudo: 'A igreja nunca será mais forte do que as famílias que a compõem. O pastor que prioriza e salva os lares está garantindo a continuidade da tocha do Evangelho para as próximas gerações.',
                    destaqueExegese: 'Oikos (οἶκος): a casa, a família, o templo vivo de adoração ao Senhor.',
                    pontosChave: ['Família como alicerce da igreja', 'Defesa intransigente da pureza moral', 'Vitória espiritual das gerações vindouras']
                }
            ],
            quiz: [
                {
                    pergunta: 'Como Jesus definiu o casamento bíblico em Mateus 19:4-6?',
                    opcoes: [
                        'Um contrato temporário que pode ser desfeito por qualquer motivo banal.',
                        'A união permanente e sagrada entre um homem e uma mulher instituída por Deus desde o princípio.',
                        'Uma convenção social sem relevância para a salvação.',
                        'Uma exigência exclusiva do Antigo Testamento.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Jesus reafirmou o padrão criacional do Éden: um homem e uma mulher unidos como uma só carne diante de Deus.'
                },
                {
                    pergunta: 'Qual o dever do marido cristão em relação à sua esposa segundo Efésios 5:25?',
                    opcoes: [
                        'Oprimi-la e tratá-la com aspereza e desprezo.',
                        'Amar a sua esposa, como também Cristo amou a igreja e a si mesmo se entregou por ela.',
                        'Ignorar suas necessidades emocionais.',
                        'Trabalhar sem jamais falar com a família.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O modelo de amor do marido é o sacrifício supremo de Cristo pela Sua noiva, a Igreja.'
                }
            ]
        }]
    },
    {
        id: 'pr_05',
        nivelId: 'pastor',
        titulo: 'Módulo 5: Gestão Financeira Eclesiástica com Santidade & Transparência',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Capítulo 14 - O Culto a Deus',
        cargaHoraria: 32,
        ementa: 'A doutrina bíblica dos dízimos e ofertas generosas. A administração financeira santa e transparente. O Conselho Fiscal, prestações de contas, auditoria e blindagem moral da liderança.',
        trabalhoSugerido: 'Elaborar um regimento interno para o Conselho Fiscal da igreja local com formulários padrão de prestação de contas mensal.',
        licoes: [{
            id: 'lic_pr_05',
            numero: 1,
            titulo: 'A Mordomia Sagrada dos Recursos da Casa de Deus',
            introducao: 'O dinheiro na igreja não é profano quando administrado com mãos limpas, temor do Senhor e transparência total. O pastor deve ser irrepreensível na gestão dos dízimos e ofertas sagradas do povo de Deus.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 11 e 14), os dízimos e ofertas pertencem ao Senhor e destinam-se ao sustento do ministério, manutenção do culto, assistência social e missões.',
            referenciasBiblicas: ['Malaquias 3:10', '2 Coríntios 8:20-21', '1 Coríntios 16:1-3', '1 Timóteo 3:3', '1 Crônicas 29:14'],
            aplicacaoPratica: 'O pastor deve instituir um Conselho Fiscal atuante, nunca mexer sozinho nas sacolas de dízimo e apresentar balancetes mensais aprovados pela congregação.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Fundamento Bíblico dos Dízimos e Ofertas',
                    conteudo: 'O dízimo antecede a Lei Mosaica (Abraão deu o dízimo a Melquisedeque em Gn 14) e foi confirmado por Jesus em Mateus 23:23 ("devíeis fazer estas coisas sem omitir aquelas"). É a décima parte da renda entregue para o sustento da Casa do Senhor.',
                    destaqueExegese: 'Maaser (מַעֲשֵׂר): décima parte consagrada ao Senhor com alegria e fidelidade.',
                    pontosChave: ['Princípio anterior à Lei', 'Confirmado por Jesus Cristo', 'Mantenedor da obra de Deus e das missões']
                },
                {
                    numero: 2,
                    subtitulo: '2. A Transparência Paulina em 2 Coríntios 8:20-21',
                    conteudo: 'Paulo declarou: "Evitando que alguém nos vitupere por esta abundância que por nós é administrada; pois zelamos o que é honesto, não só diante do Senhor, mas também diante dos homens". A igreja deve prestar contas claras.',
                    destaqueExegese: 'Pronoeo kala (προνοέω καλά): prover o que é nobre, honrado e irrepreensível perante todos.',
                    pontosChave: ['Prestação de contas periódica', 'Comissão independente de tesouraria', 'Zero espaço para suspeitas']
                },
                {
                    numero: 3,
                    subtitulo: '3. A Função do Conselho Fiscal Independente',
                    conteudo: 'O Conselho Fiscal é composto por membros idôneos eleitos pela Assembleia Geral que examinam mensalmente extratos bancários, notas fiscais, recibos de despesas e conciliam as entradas.',
                    destaqueExegese: 'Dokimos (δόκιμος): obreiros provados e aprovados pela sua integridade ética e moral.',
                    pontosChave: ['Auditoria mensal dos balancetes', 'Conferência de notas fiscais válidas', 'Emissão de parecer escrito anual']
                },
                {
                    numero: 4,
                    subtitulo: '4. Planejamento Orçamentário e Reserva de Contingência',
                    conteudo: 'A igreja deve ter um orçamento anual balanceado: 1) Sustento pastoral digno; 2) Verba missionária fixa; 3) Manutenção e melhorias prediais; 4) Ação social e beneficência; 5) Fundo de reserva para emergências.',
                    destaqueExegese: 'Oikonomos phronimos (οἰκονόμος φρόνιμος): o mordomo prudente e sábio do Senhor.',
                    pontosChave: ['Orçamento planejado', 'Investimento maciço em missões', 'Equilíbrio e sustentabilidade financeira']
                },
                {
                    numero: 5,
                    subtitulo: '5. Síntese e a Coroa do Mordomo Fiel',
                    conteudo: 'O pastor que governa a igreja com fidelidade financeira, doutrina bíblica e amor pelas almas deixará um legado imortal. Ao final da jornada, ouvirá do Mestre: "Bem está, servo bom e fiel; sobre o pouco foste fiel, sobre muito te colocarei; entra no gozo do teu Senhor" (Mt 25:21).',
                    destaqueExegese: 'Eu, doule agathe kai piste: "Muito bem, servo excelente e confiável!".',
                    pontosChave: ['Integridade financeira inabalável', 'Legado de honra para a posteridade', 'Aprovação celestial eterna']
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual o princípio ensinado pelo apóstolo Paulo em 2 Coríntios 8:21 na administração das finanças da igreja?',
                    opcoes: [
                        'Manter todos os gastos em segredo absoluto sem nunca mostrar recibos.',
                        'Zelar pelo que é honesto e transparente, não só diante do Senhor, mas também diante dos homens.',
                        'Usar o dinheiro sagrado para enriquecimento pessoal ilícito.',
                        'Não aceitar doações de pessoas humildes.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'Paulo ensina a necessidade da transparência pública e prestação de contas irrepreensível perante Deus e a sociedade.'
                },
                {
                    pergunta: 'Qual o papel fundamental do Conselho Fiscal eleito pela igreja local?',
                    opcoes: [
                        'Mudar a doutrina bíblica da denominação.',
                        'Examinar os balancetes, extratos bancários e notas fiscais para emitir parecer transparente à Assembleia.',
                        'Assumir o púlpito e demitir os pastores sem assembleia.',
                        'Cobrar ingressos na porta dos cultos.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O Conselho Fiscal fiscaliza com rigor técnico e independência a conformidade de todas as receitas e despesas.'
                }
            ]
        }]
    }
];
