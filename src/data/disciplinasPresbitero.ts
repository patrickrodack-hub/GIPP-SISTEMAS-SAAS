import { DisciplinaObreiro } from './ModuleFormacaoObreirosData';

export const DISCIPLINAS_PRESBITERO: DisciplinaObreiro[] = [
    // =========================================================================
    // NÍVEL 3: PRESBÍTERO (5 MÓDULOS DE ALTA DENSIDADE TEOLÓGICA E PASTORAL)
    // Alinhamento: Declaração de Fé CGADB/CPAD & Livro "Obreiro de Valor" (Pr. Abrahão Cipriano)
    // =========================================================================
    {
        id: 'pb_01',
        nivelId: 'presbitero',
        titulo: 'Módulo 1: Teontologia, Trindade, Cristologia & Defesa da Ortodoxia',
        capituloCGADB: 'Capítulo 2 - O Único Deus Verdadeiro, Capítulo 3 - A Santíssima Trindade & Capítulos 4 e 5 - O Senhor Jesus Cristo',
        cargaHoraria: 24,
        ementa: 'A doutrina de Deus e Seus atributos incomunicáveis (asseidade, eternidade, onipresença, onisciência, onipotência, imutabilidade) e comunicáveis (santidade, justiça, amor, misericórdia). A unidade essencial da Deidade em três Pessoas coeternas, coiguais e consubstanciais. A união hipostática e as duas naturezas de Cristo. A refutação apologética do unicismo moderno (movimento Jesus Só), arianismo e modalismo à luz da Declaração de Fé da CGADB e dos princípios de "Obreiro de Valor" do Pr. Abrahão Cipriano.',
        trabalhoSugerido: 'Elaborar um artigo teológico de 3 páginas refutando o unicismo moderno e o modalismo sabeliano, demonstrando exegeticamente o batismo trinitário (Mt 28:19) e a consubstancialidade de Cristo (Jo 1:1; Cl 2:9) perante a Declaração de Fé da CGADB.',
        licoes: [{
            id: 'lic_pb_01',
            numero: 1,
            titulo: 'O Deus Triúno, a Encarnação do Verbo Eterno e o Papel do Presbítero como Guardião da Sã Doutrina',
            introducao: 'O presbítero (presbyteros / episkopos) é o supervisor doutrinário e pastor cooperador da igreja local. Ele não pode ser um neófito inexperiente, mas um mestre arraigado nos fundamentos dogmáticos da fé para proteger o rebanho contra as heresias cristológicas, o liberalismo teológico e o sincretismo religioso. Como enfatiza o Pr. Abrahão Cipriano em "Obreiro de Valor", o presbítero é a sentinela do púlpito e do Altar, cuja missão inegociável é defender com intrepidez e zelo sagrado a fé que uma vez foi entregue aos santos (Jd 1:3).',
            fundamentacaoDoutrinaria: 'Segundo a Declaração de Fé das Assembleias de Deus (CGADB/CPAD, Capítulos 2, 3, 4 e 5), há um só Deus vivo, pessoal, infinito e verdadeiro, Criador e Sustentador de todas as coisas, que subsiste eternamente em três Pessoas distintas, consubstanciais e coeternas: o Pai, o Filho e o Espírito Santo. Jesus Cristo é verdadeiramente Deus e verdadeiramente Homem (União Hipostática), nascido de uma virgem, morto vicariamente na cruz, ressurreto corporalmente ao terceiro dia e exaltado soberanamente nos céus.',
            referenciasBiblicas: ['Deuteronômio 6:4', 'Mateus 28:19', 'João 1:1-14', 'Filipenses 2:5-11', 'Colossenses 2:9', '1 Timóteo 3:16', 'Tito 1:9'],
            aplicacaoPratica: 'O presbítero deve ensinar com autoridade e clareza pedagógica nas classes de Escola Bíblica Dominical, nos cultos de doutrina e nos aconselhamentos pastorais, corrigindo com mansidão e precisão bíblica interpretações desviadas que negam a Trindade ou a divindade absoluta de Cristo.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Monoteísmo Trinitário e os Atributos Divinos Inegociáveis',
                    conteudo: `A fé assembleiana repousa sobre a revelação monoteísta bíblica: "Ouve, Israel, o Senhor nosso Deus é o único Senhor" (Dt 6:4 - Shema Yisrael). Contudo, a Escritura revela que essa unidade divina não é uma unidade matemática solitária (yachid), mas uma unidade composta e relacional (echad), manifesta na eterna comunhão trinitária.

Deus é infinito em Seus atributos:
- **Atributos Incomunicáveis**: Asseidade (existe por Si mesmo), Eternidade (sem princípio nem fim), Imutabilidade (não muda em Seu ser e propósitos), Onipresença (presente em todo o cosmos), Onisciência (conhece todas as coisas passadas, presentes e futuras) e Onipotência (todo o poder Lhe pertence);
- **Atributos Comunicáveis**: Santidade absoluta, Justiça infalível, Amor ágape, Misericórdia, Bondade e Verdade.

Em "Obreiro de Valor", o Pr. Abrahão Cipriano lembra que o conhecimento dos atributos de Deus não é mero exercício intelectual, mas o combustível da verdadeira adoração que humilha o orgulho humano no pó.`,
                    destaqueExegese: 'Echad (אֶחָד) em Dt 6:4 expressa unidade composta (como homem e mulher que se tornam "uma só carne" em Gn 2:24), contrastando com yachid (unidade solitária absoluta).',
                    pontosChave: [
                        'Monoteísmo trinitário bíblico revelado progressivamente',
                        'Atributos incomunicáveis e soberania absoluta do Criador',
                        'Atributos comunicáveis refletidos na santificação do crente',
                        'A adoração pura em espírito e em verdade'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. A Santíssima Trindade: Três Pessoas Coeternas e Consubstanciais',
                    conteudo: `A Declaração de Fé da CGADB (Capítulo 3) rejeita tanto o triteísmo (crença herética em três deuses distintos) quanto o modalismo/unicismo (heresia sabeliana que afirma que Deus é uma única pessoa que se manifesta sob diferentes "máscaras" temporais).

Na Trindade Bíblica:
1) O Pai é Deus, o Filho é Deus e o Espírito Santo é Deus;
2) O Pai não é o Filho, o Filho não é o Espírito Santo, e o Espírito Santo não é o Pai;
3) Há uma só essência divina (ousia) compartilhada igualmente por três Pessoas distintas (hypostaseis).

Essa distinção relacional fica evidente no batismo de Jesus no rio Jordão (Mt 3:16-17), onde o Filho é imerso nas águas, o Espírito Santo desce visivelmente em forma corpórea de pomba e a voz do Pai ecoa desde os céus: "Este é o meu Filho amado, em quem me comprazo".`,
                    destaqueExegese: 'Hypostasis (ὑπόστασις): subsistência pessoal real e eterna de cada uma das três Pessoas na única substância divina (homoousios).',
                    pontosChave: [
                        'Coeternidade, consubstancialidade e coigualdade das três Pessoas',
                        'Refutação bíblica e histórica do sabelianismo e unicismo ("Jesus Só")',
                        'A fórmula batismal trinitária irrevogável ordenada em Mateus 28:19',
                        'A bênção apostólica trinitária de 2 Coríntios 13:13'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. A Cristologia Pentecostal e a União Hipostática (Theanthropos)',
                    conteudo: `O Senhor Jesus Cristo não foi uma criatura exaltada (contra o arianismo das Testemunhas de Jeová) nem um espírito sem carne real (contra o docetismo e o gnosticismo). Ele é o Verbo Eterno que Se fez carne e habitou entre nós (Jo 1:1, 14).

A Cristologia ortodoxa confessada pelas Assembleias de Deus sustenta a União Hipostática: em Cristo Jesus coexistem perfeitamente duas naturezas — a Divina Plena e a Humana Perfeita —, unidas de modo inseparável, inconfundível, indivisível e imutável em uma única Pessoa Divina para sempre.

Como ensina o Pr. Abrahão Cipriano em "Obreiro de Valor", Cristo é o perfeito Mediador entre Deus e os homens (1 Tm 2:5) porque somente Aquele que é plenamente Deus pode satisfazer a justiça divina infinita, e somente Aquele que é plenamente Homem sem pecado podia morrer no lugar da humanidade culpada.`,
                    destaqueExegese: 'Theanthropos (θεάνθρωπος): o Deus-Homem. Colossenses 2:9 declara: "Porque nele habita corporalmente toda a plenitude da divindade".',
                    pontosChave: [
                        'Deidade plena e eterna: Ele é o Todo-Poderoso (Apocalipse 1:8)',
                        'Humanidade real gerada pelo Espírito Santo no ventre virginal de Maria',
                        'Impecabilidade absoluta de Cristo em pensamentos, palavras e obras',
                        'Único Mediador e Advogado dos salvos junto ao Pai'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. A Morte Vicária, Sepultamento e Ressurreição Corporal Literal',
                    conteudo: `A soteriologia bíblica culmina na obra redentora consumada no Gólgota. A morte de Jesus não foi um acidente político ou um martírio trágico, mas o plano voluntário e soberano da redenção divina (Is 53:10; Jo 10:17-18).

Sua morte foi:
- **Expiatória**: Cancelou a culpa do pecado e removeu a condenação;
- **Propiciatória**: Aplacou a justa e santa ira de Deus contra a desobediência humana (Rm 3:25; 1 Jo 2:2);
- **Substitutiva/Vicária**: Ele morreu em nosso lugar ("o justo pelos injustos", 1 Pe 3:18);
- **Redentora**: Pagou o resgate infinito pelo Seu próprio sangue precioso.

Ao terceiro dia, Cristo ressuscitou corporalmente dos mortos. Seu túmulo está eternamente vazio, e Ele foi visto por mais de quinhentas testemunhas oculares (1 Co 15:3-6).`,
                    destaqueExegese: 'Hilasmos (ἱλασμός): sacrifício propiciatório que satisfaz a justiça de Deus e reconcilia o pecador arrependido.',
                    pontosChave: [
                        'Morte vicária e propiciação completa no Calvário',
                        'Ressurreição física corpórea ao terceiro dia garantindo nossa justificação',
                        'Vitória definitiva sobre Satanás, o pecado e o aguilhão da morte',
                        'O túmulo vazio como garantia inabalável da ressurreição dos crentes'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. A Exaltação Soberana, o Sumo Sacerdócio e o Presbítero como Mestre',
                    conteudo: `Após Sua ressurreição, o Senhor Jesus ascendeu aos céus de forma visível e assentou-Se à destra da Majestade nas alturas (Hb 1:3; Fp 2:9-11). Ali, Ele exerce Seu sacerdócio perpétuo e intercede continuamente por nós (Hb 7:25).

Em Tito 1:9, o apóstolo Paulo define a responsabilidade solene do presbítero: "Retendo firme a fiel palavra, que é conforme a doutrina, para que seja poderoso, tanto para admoestar com a sã doutrina como para convencer os contradizentes".

Como adverte o Pr. Abrahão Cipriano em "Obreiro de Valor", o presbítero não pode ser omisso diante de falsos ensinos introduzidos no rebanho. Com brandura, firmeza e Bíblia aberta, ele deve desmascarar a heresia e conduzir as ovelhas às águas tranquilas e às pastagens verdejantes da revelação divina.`,
                    destaqueExegese: 'Antechomenon tes kata ten didachen pistou logou (ἀντεχόμενον τοῦ κατὰ τὴν διδαχὴν πιστοῦ λόγου): agarrar-se com unhas e dentes à fiel Palavra.',
                    pontosChave: [
                        'Exaltação de Cristo e intercessão contínua no Santo dos Santos celestial',
                        'O presbítero como defensor intrépido da sã doutrina (Tito 1:9)',
                        'Refutação de modismos e heresias com fundamentação bíblica sólida',
                        'Pastoreio doutrinário que edifica a fé da congregação'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Como a Declaração de Fé da CGADB define a doutrina da Santíssima Trindade?',
                    opcoes: [
                        'A crença em três deuses independentes que dividem o governo do universo.',
                        'A crença em um só Deus vivo e verdadeiro que subsiste eternamente em três Pessoas distintas, consubstanciais e coeternas: o Pai, o Filho e o Espírito Santo.',
                        'Uma única pessoa divina que trocou de máscara no decorrer da história.',
                        'Uma teoria filosófica criada nos concílios medievais sem respaldo nas Escrituras.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A ortodoxia bíblica pentecostal confessa um só Deus em três Pessoas coiguais e coeternas em substância e glória.'
                },
                {
                    pergunta: 'O que ensina a União Hipostática e Colossenses 2:9 sobre a natureza de Jesus Cristo?',
                    opcoes: [
                        'Que Jesus era apenas um homem iluminado que se tornou divino após o batismo.',
                        'A união inseparável e perfeita da divindade plena e da humanidade real sem pecado em uma única Pessoa Divina.',
                        'Que Jesus não possuía corpo físico real, sendo apenas um fantasma celestial.',
                        'Que Sua humanidade anulou completamente a Sua divindade na terra.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A União Hipostática afirma que Cristo é 100% Deus e 100% Homem, habitando nEle corporalmente toda a plenitude da divindade.'
                }
            ]
        }]
    },
    {
        id: 'pb_02',
        nivelId: 'presbitero',
        titulo: 'Módulo 2: Pneumatologia Pentecostal, Batismo no Espírito & A Prática dos Dons',
        capituloCGADB: 'Capítulo 6 - O Espírito Santo, Capítulo 19 - O Batismo no Espírito Santo & Capítulo 20 - Os Dons do Espírito Santo',
        cargaHoraria: 24,
        ementa: 'A personalidade e plena divindade do Espírito Santo. O Batismo no Espírito Santo como revestimento de poder (At 1:8) e experiência subsequente e distinta da regeneração, com a evidência física inicial das línguas (glossolalia). A classificação exegética dos nove dons espirituais (1 Co 12:4-11). Regras bíblicas para o exercício e julgamento dos dons proféticos no culto (1 Co 14). A condução pentecostal do culto com fervor e decência segundo "Obreiro de Valor" (Pr. Abrahão Cipriano).',
        trabalhoSugerido: 'Elaborar uma defesa teológica e exegética de 3 páginas contra o cessacionismo moderno, fundamentando a atualidade dos 9 dons espirituais com base em Atos 2:38-39 e 1 Coríntios 12 e 14.',
        licoes: [{
            id: 'lic_pb_02',
            numero: 1,
            titulo: 'O Avivamento Pentecostal, a Evidência das Línguas e a Operação dos Dons Espirituais',
            introducao: 'O distintivo fundamental e inconfundível das Assembleias de Deus em todo o mundo é a sua viva identidade pentecostal clássica. O presbítero é um líder que não apenas crê teoricamente no Espírito Santo, mas vive sob a plenitude do Seu fogo purificador. Em "Obreiro de Valor", o Pr. Abrahão Cipriano adverte que a igreja que apaga o Espírito definha em formalismo frio e esterilidade espiritual, enquanto a liderança que negligencia a ordem bíblica abre as portas para o fanatismo e as falsificações da carne. O presbítero de valor une o fogo sagrado do avivamento com o freio santo da Palavra de Deus.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 6, 19 e 20), o Espírito Santo é a terceira Pessoa da Santíssima Trindade, coigual ao Pai e ao Filho. O Batismo no Espírito Santo é um dom concedido por Jesus Cristo a todos os crentes regenerados, cuja evidência física inicial inegociável é o falar em outras línguas conforme o Espírito concede. Os dons espirituais são contemporâneos e essenciais para a edificação do Corpo de Cristo.',
            referenciasBiblicas: ['Atos 1:8', 'Atos 2:1-4, 38-39', 'Atos 10:44-46', 'Atos 19:1-6', '1 Coríntios 12:1-11', '1 Coríntios 14:1-40', 'Efésios 5:18'],
            aplicacaoPratica: 'O presbítero deve manter uma vida fervorosa de oração e vigílias, incentivar a congregação e os jovens a buscarem o batismo no Espírito Santo com línguas, discernir e julgar manifestações proféticas à luz da Bíblia e conduzir o culto pentecostal com poder, ordem e júbilo santo.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. A Personalidade e Plena Deidade do Espírito Santo',
                    conteudo: `O Espírito Santo não é uma energia cósmica impessoal, uma força magnética ou mera influência positiva, mas uma Pessoa Divina que subsiste eternamente com o Pai e o Filho.

As Escrituras atestam os três elementos constitutivos da Sua personalidade:
- **Intelecto**: Ele esquadrinha as profundezas de Deus e ensina todas as coisas (1 Co 2:10-11; Jo 14:26);
- **Emoção/Afetividade**: Ele Se entristece com o pecado e ama os santos (Ef 4:30; Rm 15:30);
- **Vontade Soberana**: Ele distribui os dons a cada um como Lhe apraz e dirige as viagens missionárias (1 Co 12:11; At 16:6-7).

Como destaca Abrahão Cipriano em "Obreiro de Valor", o obreiro deve cultivar comunhão íntima com o Espírito Santo (2 Co 13:13), jamais tratando-O como um instrumento manipulável para interesses pessoais.`,
                    destaqueExegese: 'Parakletos (παράκλητος) em João 14:16: Aquele chamado para caminhar ao lado, Consolador divino, Advogado de defesa, Conselheiro e Guia infalível.',
                    pontosChave: [
                        'Personalidade divina com mente, vontade soberana e emoção santa',
                        'Atributos de deidade plena adorados na Santíssima Trindade',
                        'O perigo espiritual de entristecer (Ef 4:30) ou apagar o Espírito (1 Ts 5:19)',
                        'Comunhão diária através da oração e da obediência à Palavra'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. O Batismo no Espírito Santo: Subsequência e Evidência Inicial',
                    conteudo: `Na teologia bíblica lucana (Evangelho de Lucas e Atos), o Batismo no Espírito Santo é uma experiência espiritual distinta e subsequente à regeneração/salvação:
- Os samaritanos creram e foram batizados em águas por Filipe, mas receberam o Espírito Santo dias depois com a imposição de mãos de Pedro e João (At 8:12-17);
- Os discípulos em Éfeso já eram crentes, mas foram batizados no Espírito quando Paulo lhes impôs as mãos (At 19:1-6).

A Declaração de Fé da CGADB estabelece categoricamente que a **evidência física inicial** indispensável dessa dotação de poder é o falar em outras línguas (glossolalia) nunca antes aprendidas pelo crente (At 2:4; 10:45-46).

O propósito primordial dessa bênção não é o deleite egoísta, mas o poder sobrenatural para proclamar o Evangelho de Cristo até os confins da terra (At 1:8).`,
                    destaqueExegese: 'Dynamis (δύναμις) em Atos 1:8: poder sobrenatural divino dinâmico e explosivo para vencer as trevas e ser testemunha de Cristo.',
                    pontosChave: [
                        'Distinção clara entre a habitação regeneradora e o batismo com poder',
                        'Glossolalia como evidência física inicial bíblica e histórica',
                        'Propósito supremo: intrepidez e autoridade na evangelização das almas',
                        'Promessa universal para todos quantos o Senhor nosso Deus chamar (At 2:39)'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. A Classificação Exegética dos Nove Dons Espirituais (1 Co 12)',
                    conteudo: `Em 1 Coríntios 12:7-11, o apóstolo Paulo elenca nove dons sobrenaturais (charismata) distribuídos pelo Espírito Santo para a edificação da Igreja, tradicionalmente organizados em três grupos:

1) **Dons de Revelação (Capacidade de Saber Sobrenaturalmente)**:
   - *Palavra da Sabedoria*: Revelação de propósitos e diretrizes divinas para situações específicas;
   - *Palavra da Ciência*: Revelação de fatos passados ou presentes ocultos à mente humana;
   - *Discernimento de Espíritos*: Capacidade de identificar a origem de uma manifestação (Espírito de Deus, espírito humano ou espírito demoníaco).

2) **Dons de Poder (Capacidade de Agir Sobrenaturalmente)**:
   - *Fé Sobrenatural*: Confiança inabalável para milagres extraordinários;
   - *Dons de Curar*: Restauração física de enfermidades sem meios naturais;
   - *Operação de Maravilhas*: Intervenções soberanas que suspendem leis naturais.

3) **Dons de Inspiração/Voz (Capacidade de Falar Sobrenaturalmente)**:
   - *Profecia*: Mensagem inspirada em idioma conhecido para edificação, exortação e consolação (1 Co 14:3);
   - *Variedade de Línguas*: Línguas para ministração pública no culto;
   - *Interpretação de Línguas*: Tradução da mensagem falada em línguas públicas.`,
                    destaqueExegese: 'Charismata (χαρίσματα): dádivas imerecidas da graça, distribuídas soberanamente conforme a vontade do Espírito para a utilidade da Igreja.',
                    pontosChave: [
                        'Classificação tríplice: Revelação, Poder e Inspiração Vocal',
                        'Finalidade exclusiva: a edificação da igreja e glorificação de Cristo',
                        'Rejeição ao cessacionismo que nega a contemporaneidade dos dons',
                        'A soberania do Espírito na distribuição e operação dos carismas'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. Regras Bíblicas para o Julgamento da Profecia e Ordem no Culto',
                    conteudo: `O apóstolo Paulo estabelece diretrizes precisas para evitar abusos e desordem no exercício dos dons vocais em 1 Coríntios 14:26-33:
- **Limite Numérico**: No máximo dois ou três profetas devem falar por culto, e sucessivamente (v. 27, 29);
- **Julgamento Obrigatório**: "Falem dois ou três profetas, e os outros julguem" (v. 29). Nenhuma profecia humana é infalível ou tem autoridade superior ou igual à Bíblia Sagrada;
- **Controle Moral do Profeta**: "Os espíritos dos profetas estão sujeitos aos profetas" (v. 32). Não se aceita desculpa de "estar descontrolado" para cometer desordem;
- **Variedade de Línguas no Culto**: Se não houver intérprete, a manifestação deve ser silenciosa entre o crente e Deus (v. 28).

Em "Obreiro de Valor", o Pr. Abrahão Cipriano orienta o presbítero a discernir com coragem: profecias manipuladoras, buscas de "revelações para casamento" ou adivinhações mercenárias devem ser severamente repreendidas.`,
                    destaqueExegese: 'Diakrino (διακρίνω): discernir, analisar minuciosamente e pesar criticamente cada profecia sob o crivo das Escrituras.',
                    pontosChave: [
                        'A Bíblia como autoridade máxima e padrão inegociável de julgamento',
                        'Limite e ordem nos dons vocais para edificação de toda a assembleia',
                        'Autocontrole e domínio próprio do crente em todas as manifestações',
                        'Combate intransigente ao misticismo espúrio e profetadas carnais'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. A Condução Pentecostal do Culto: Fogo Sagrado sem Desordem',
                    conteudo: `1 Coríntios 14:40 estabelece a máxima da liturgia apostólica: "Faça-se tudo decentemente e com ordem".

O presbítero de valor não teme o clamor pentecostal, o derramamento de lágrimas, a glorificação a Deus e as orações ferventes pelas madrugadas. Ele sabe que a presença manifesta de Deus traz salvação de pecadores, curas miraculosas e quebrantamento genuíno.

Ao mesmo tempo, ele não permite que o culto de adoração degenere em gritaria carnal descontrolada, exibicionismo corporal grotesco ou heresias no altar. A verdadeira unção produz santidade, reverência, reverência pelo púlpito e adoração cristocêntrica.`,
                    destaqueExegese: 'Euschemonos kai kata taxin (εὐσχημόνως καὶ κατὰ τάξιν): com decência majestosa, dignidade nobre e ordem disciplinada como um exército santo.',
                    pontosChave: [
                        'Harmonia sublime entre fervor pentecostal genuíno e reverência sagrada',
                        'Rejeição ao formalismo frio e ao emocionalismo histérico sem fruto',
                        'A centralidade da proclamação da Palavra no mover do Espírito',
                        'O presbítero como condutor espiritual equilibrado do rebanho'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual a evidência física inicial do Batismo no Espírito Santo segundo a Declaração de Fé da CGADB?',
                    opcoes: [
                        'Apenas sentir arrepios emocionais passageiros.',
                        'O falar em outras línguas (glossolalia) conforme o Espírito Santo concede a expressão, atestado em Atos 2:4, 10:46 e 19:6.',
                        'A conquista imediata de enriquecimento financeiro.',
                        'O recebimento de um cargo diretivo na congregação.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A teologia pentecostal clássica fundamenta que o falar em línguas espirituais é o sinal exterior e inicial da dotação de poder pentecostal.'
                },
                {
                    pergunta: 'Segundo 1 Coríntios 14:29 e o livro "Obreiro de Valor" de Abrahão Cipriano, como a igreja e o presbitério devem tratar as manifestações proféticas no culto?',
                    opcoes: [
                        'Aceitar toda profecia cegamente como se fosse um novo capítulo da Bíblia.',
                        'Permitir que falem dois ou três profetas sucessivamente, e os outros julguem e examinem a mensagem à luz da autoridade suprema das Sagradas Escrituras.',
                        'Proibir qualquer manifestação de dons espirituais e extinguir as orações.',
                        'Permitir que dezenas de pessoas profetizem ao mesmo tempo gerando comoção desordenada.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'As profecias devem ser limitadas e julgadas criticamente pela liderança à luz da Bíblia Sagrada, que é a infalível regra de fé.'
                }
            ]
        }]
    },
    {
        id: 'pb_03',
        nivelId: 'presbitero',
        titulo: 'Módulo 3: Homilética Sagrada, Hermenêutica Expositiva & A Arte da Pregação',
        capituloCGADB: 'Capítulo 1 - As Sagradas Escrituras & Capítulo 14 - O Culto a Deus',
        cargaHoraria: 24,
        ementa: 'A teologia bíblica da proclamação do Evangelho (Kerygma). Princípios fundamentais de interpretação bíblica histórico-gramatical e exegese contextual. Tipos estruturais de sermão: Temático, Textual e Expositivo. A arquitetura homilética: tema, introdução cativante, proposição, divisões lógicas com transições, ilustrações e apelo pastoral. A unção do Espírito Santo aliada ao preparo e à ética de púlpito segundo "Obreiro de Valor".',
        trabalhoSugerido: 'Elaborar um Esboço Completo de Sermão Expositivo sobre Romanos 8:1-11, contendo contextualização histórica, exegese do grego original, 3 divisões estruturadas e aplicação pastoral para a congregação.',
        licoes: [{
            id: 'lic_pb_03',
            numero: 1,
            titulo: 'O Púlpito Consagrado, a Exposição Fiel das Escrituras e a Homilética Bíblica',
            introducao: 'O ministério da pregação é o momento mais solene do culto cristão. Pregar o Evangelho não é contar piadas, narrar anedotas vazias ou fazer discursos de autoajuda humanista, mas expor com fidelidade cirúrgica a Palavra eterna do Deus Todo-Poderoso. Em "Obreiro de Valor", o Pr. Abrahão Cipriano declara que o púlpito não é trampolim para vaidade pessoal nem palanque político, mas o Altar onde o pão da vida deve ser repartido com temor, intrepidez e unção do Espírito Santo.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 1 e 14), a pregação fiel da Palavra de Deus é o elemento culminante da adoração comunitária. O pregador deve manejar retamente a verdade (2 Tm 2:15) e pregar a tempo e fora de tempo (2 Tm 4:2), alimentando o rebanho com o genuíno leite da sã doutrina.',
            referenciasBiblicas: ['2 Timóteo 4:1-5', 'Neemias 8:8', '1 Coríntios 2:1-5', 'Tito 2:1', 'Lucas 24:27', 'Romanos 10:14-17', 'Isaías 55:10-11'],
            aplicacaoPratica: 'O presbítero deve preparar seus sermões com antecedência rigorosa através de oração, estudo do grego/hebraico e consulta a bons comentários teológicos, utilizando linguagem acessível, postura digna e aplicando o texto aos desafios éticos e espirituais dos ouvintes.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. Hermenêutica Bíblica: A Diferença entre Exegese e Eisegese',
                    conteudo: `A hermenêutica bíblica estabelece as regras e princípios de interpretação do texto bíblico. A regra magna afirma que "o texto deve ser interpretado em seu contexto histórico, gramatical e teológico original".

Há dois caminhos opostos diante do pregador:
1) **Exegese (ek-hegeomai - tirar para fora)**: O intérprete humilde investiga o texto com ferramentas linguísticas e contextuais para extrair exatamente o que o Espírito Santo e o autor bíblico desejaram comunicar aos seus primeiros destinatários;
2) **Eisegese (eis-hegeomai - colocar para dentro)**: O pregador negligente projeta suas próprias opiniões, preconceitos, caprichos ou ideologias humanas para dentro do texto, distorcendo o sentido das Escrituras para justificar seus argumentos particulares.

Em "Obreiro de Valor", o Pr. Abrahão Cipriano adverte que a eisegese é adultério hermenêutico que enfraquece a congregação e atrai a severa censura de Deus.`,
                    destaqueExegese: 'Orthotomeo (ὀρθοτομέω) em 2 Tm 2:15: cortar em linha reta, traçar com precisão cirúrgica a mensagem da verdade.',
                    pontosChave: [
                        'Exegese histórico-gramatical como dever de fidelidade do pregador',
                        'Rejeição radical da eisegese e das alegorizações fantasiosas',
                        'A Bíblia interpreta a própria Bíblia (analogia da fé)',
                        'Investigação do autor original, contexto histórico e destinatários'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. Os Três Métodos Estruturais de Sermão na Homilética',
                    conteudo: `A Homilética é a disciplina teológica que ensina a arte e a técnica de preparar e pregar mensagens bíblicas eficazes. Os três modelos clássicos são:

1) **Sermão Temático**: O tema ou proposição é formulado primeiro, e suas divisões principais são desenvolvidas a partir de múltiplos textos bíblicos correlatos espalhados pelo cânon;
2) **Sermão Textual**: As divisões principais são extraídas diretamente das frases e palavras de um pequeno texto ou versículo bíblico específico (1 a 2 versículos);
3) **Sermão Expositivo**: O pregador seleciona uma perícope mais longa (um parágrafo ou capítulo) e extrai tanto a ideia central quanto todos os tópicos e sub-tópicos do fluxo de pensamento do próprio texto.

O sermão expositivo é o método mais recomendado pela tradição pastoral para nutrir solidamente a igreja e protegê-la contra heresias.`,
                    destaqueExegese: 'Homilia (ὁμιλία): discurso pedagógico, instrução fraterna que ilumina a mente e aquece o coração com a Palavra.',
                    pontosChave: [
                        'Sermão Temático: clareza doutrinária com ampla fundamentação bíblica',
                        'Sermão Textual: foco concentrado na força de um versículo específico',
                        'Sermão Expositivo: o ápice da maturidade e alimentação bíblica do rebanho',
                        'Domínio das técnicas homiléticas para comunicação clara e persuasiva'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. A Arquitetura Homilética: Do Tema ao Apelo Pastoral',
                    conteudo: `Um sermão bem estruturado assemelha-se a um edifício harmonioso construído em 5 etapas interligadas:
1) **Título Atraente e Bíblico**: Desperta o interesse sem ser sensacionalista ou vulgar;
2) **Introdução Cativante**: Conquista a atenção nos primeiros 3 a 5 minutos, estabelece o problema existencial e conecta a congregação à passagem sagrada;
3) **Proposição ou Ideia Central (Big Idea)**: Uma frase clara e memorável que resume toda a tese do sermão;
4) **Corpo do Sermão (Divisões e Transições)**: De 2 a 4 pontos lógicos com base exegética, enriquecidos com ilustrações breves e aplicações contemporâneas;
5) **Conclusão e Apelo**: Recapitulação dinâmica que confronta o ouvinte a uma tomada de decisão prática diante de Deus.`,
                    destaqueExegese: 'Keryx (κῆρυξ): o arauto oficial que proclama com lealdade inabalável os decretos soberanos do Rei.',
                    pontosChave: [
                        'Estrutura lógica que facilita a compreensão e memorização dos fiéis',
                        'Introdução que conecta a realidade humana ao Texto Divino',
                        'Transições suaves e ilustrações puras que clareiam a verdade',
                        'Conclusão incisiva que conduz ao arrependimento e adoração'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. A Dependência Absoluta da Unção do Espírito Santo (1 Co 2:1-5)',
                    conteudo: `O apóstolo Paulo confessa aos coríntios em 1 Coríntios 2:4: "A minha palavra e a minha pregação não consistiram em palavras persuasivas de sabedoria humana, mas em demonstração do Espírito e de poder; para que a vossa fé não se apoiasse em sabedoria dos homens, mas no poder de Deus".

A mais refinada técnica homilética e a erudição acadêmica mais brilhante são absolutamente mortas se faltar a unção viva do Espírito Santo. Por outro lado, o desprezo pelo estudo bíblico sob a desculpa de que "o Espírito falará na hora" é negligência e preguiça pecaminosa.

O presbítero de valor une as duas dimensões: estuda arduamente como se tudo dependesse do seu preparo, e dobra os joelhos em oração como se tudo dependesse exclusivamente de Deus.`,
                    destaqueExegese: 'Apodeixis pneumatos kai dynameos (ἀπόδειξις πνεύματος καὶ δυνάμεως): demonstração incontestável do poder sobrenatural de Deus que convence o pecador.',
                    pontosChave: [
                        'A oração fervorosa como fundamento de todo sermão ungido',
                        'Rejeição ao intelectualismo estéril e ao comodismo preguiçoso',
                        'O pregador como instrumento humilde nas mãos do Espírito',
                        'A transformação e convicção de vidas operadas pelo Senhor'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. Ética no Púlpito, Dicção e Decoro Pastoral',
                    conteudo: `Em "Obreiro de Valor", o Pr. Abrahão Cipriano detalha a conduta ética indispensável para quem sobe ao púlpito do Senhor:
- **Respeito ao Tempo**: Cumprir rigorosamente o horário determinado pelo pastor da igreja, sem estender-se abusivamente até cansar a congregação;
- **Proibição de Desabafos**: O púlpito nunca deve ser utilizado para mandar "indiretas", atacar desafetos pessoais ou expor problemas administrativos internos;
- **Linguagem Santa**: Rejeitar piadas vulgares, gírias mundanas e maneirismos teatrais grotescos;
- **Cuidados Físicos**: Postura ereta, contato visual afetuoso com toda a congregação, controle da intensidade vocal e uso correto do microfone sem gritaria ensurdecedora.`,
                    destaqueExegese: 'Hieroprepes (ἱεροπρεπής) em Tito 2:3: conduta santa, digna e honrada que reflete a santidade de Deus.',
                    pontosChave: [
                        'Pontualidade e obediência aos limites de tempo litúrgicos',
                        'Pureza absoluta de linguagem e rejeição ao sensacionalismo',
                        'Uso solene do púlpito exclusivamente para a glória de Cristo',
                        'Testemunho irrepreensível dentro e fora do templo'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Qual a diferença crucial entre Exegese e Eisegese no preparo da mensagem bíblica?',
                    opcoes: [
                        'Exegese extrai o sentido original do texto bíblico através de pesquisa histórico-gramatical; Eisegese projeta ideias e opiniões humanas estranhas para dentro do texto.',
                        'Exegese é o sermão pregado aos domingos; Eisegese é o estudo na EBD.',
                        'Não existe nenhuma diferença entre os dois termos teológicos.',
                        'Exegese é proibida pela Declaração de Fé da CGADB.'
                    ],
                    respostaCorreta: 0,
                    explicacao: 'A exegese busca retirar o sentido original do autor bíblico, enquanto a eisegese insere interpretações forçadas do leitor no texto.'
                },
                {
                    pergunta: 'Segundo as instruções de ética ministerial do livro "Obreiro de Valor", qual a atitude correta do pregador no púlpito?',
                    opcoes: [
                        'Utilizar o microfone para mandar indiretas e atacar desafetos pessoais.',
                        'Gritar descontroladamente por horas além do tempo permitido pelo pastor.',
                        'Pregar a Palavra com sobriedade, postura digna, respeito ao tempo estabelecido, dependência do Espírito Santo e sem piadas vulgares.',
                        'Fazer discursos políticos partidários durante o culto de adoração.'
                    ],
                    respostaCorreta: 2,
                    explicacao: 'O púlpito sagrado exige reverência, compromisso com a exposição bíblica pura, amor pelas almas e respeito ao tempo litúrgico.'
                }
            ]
        }]
    },
    {
        id: 'pb_04',
        nivelId: 'presbitero',
        titulo: 'Módulo 4: Governo Eclesiástico, Disciplina Bíblica & Liderança Restauradora',
        capituloCGADB: 'Capítulo 11 - A Igreja de Deus & Obreiro de Valor (Abrahão Cipriano)',
        cargaHoraria: 24,
        ementa: 'O modelo de governo eclesiástico representativo e colegiado nas Assembleias de Deus (CGADB, Convenções Estaduais e Ministérios Locais). Princípios neotestamentários de disciplina eclesiástica: propósitos correcionais, preventivos e restauradores (Mateus 18, 1 Coríntios 5 e Gálatas 6). A condução de reuniões ministeriais de obreiros com sabedoria, justiça e sigilo segundo "Obreiro de Valor".',
        trabalhoSugerido: 'Elaborar um Roteiro Pastoral de Aconselhamento e Restauração de Membro sob Disciplina, fundamentado na exegese de Gálatas 6:1-2 e 2 Coríntios 2:5-11.',
        licoes: [{
            id: 'lic_pb_04',
            numero: 1,
            titulo: 'O Presbitério, a Ordem Eclesiástica e a Prática Santa da Disciplina Restauradora',
            introducao: 'A autoridade no Reino de Deus não é exercida como tirania autocrática nem como anarquia populista, mas como pastoreio sacrificial segundo o coração de Deus (Jr 3:15; 1 Pe 5:1-4). O presbítero é chamado a cooperar no governo da igreja local, atuando com imparcialidade, equilíbrio emocional e profunda misericórdia. Como ensina o Pr. Abrahão Cipriano em "Obreiro de Valor", a disciplina eclesiástica bíblica nunca visa a destruição ou a humilhação do pecador, mas a preservação da pureza da Igreja de Cristo e o resgate da alma caída através do arrependimento genuíno.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulo 11), a Igreja local é dotada de autoridade delegada por Cristo para ordenar o culto, administrar ordenanças e aplicar a disciplina bíblica aos membros que persistirem em pecado deliberado, visando sempre a restauração do faltoso (Mt 18:15-18; 1 Co 5:1-13; Gl 6:1-2).',
            referenciasBiblicas: ['Gálatas 6:1-2', '1 Coríntios 5:1-13', '2 Coríntios 2:5-11', '1 Timóteo 5:19-21', 'Mateus 18:15-18', 'Tito 3:10-11', '1 Pedro 5:1-4'],
            aplicacaoPratica: 'O presbítero deve conduzir os processos disciplinares sem parcialidade nem favoritismo, manter sigilo absoluto sobre os motivos de afastamento ministerial e acompanhar o irmão disciplinado com visitas regulares, oração e instrução pastoral para que retorne à plena comunhão.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. O Governo Eclesiástico das Assembleias de Deus no Brasil',
                    conteudo: `O modelo de governo adotado pelas Assembleias de Deus no Brasil (CGADB) combina elementos episcopais (liderança pastoral forte sob o Pastor Presidente), presbiterais (colegiado ministerial composto por pastores, evangelistas e presbíteros) e congregacionais (deliberação de assuntos maiores pela assembleia geral dos membros).

Nessa estrutura:
- **Pastor Presidente**: Responsável pelo pastoreio geral, representação civil e direcionamento doutrinário da igreja campo;
- **Presbitério Local**: Corpo de oficiais que auxilia no governo das congregações, na supervisão do ensino bíblico, na unção dos enfermos e na condução dos cultos;
- **Convenções Estaduais e CGADB**: Instâncias conciliatórias superiores que zelam pela unidade doutrinária nacional, envio de missionários e ordenação de ministros.

Em "Obreiro de Valor", o Pr. Abrahão Cipriano enfatiza que a autoridade do presbítero decorre de sua submissão fiel à hierarquia eclesiástica e de seu exemplo moral impecável.`,
                    destaqueExegese: 'Presbyteros (πρεσβύτερος): ancião maduro e venerável; Episkopos (ἐπίσκοπος): superintendente ou supervisor do rebanho.',
                    pontosChave: [
                        'Estrutura equilibrada: liderança pastoral e representação colegiada',
                        'O presbítero como auxiliar direto do pastor presidente na congregação',
                        'Respeito aos estatutos canônicos e regimentos internos',
                        'A unidade ministerial como segredo do crescimento do Reino'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. A Tríplice Finalidade da Disciplina Eclesiástica Bíblica',
                    conteudo: `A disciplina na Casa de Deus é um ato de amor paternal que reflete a santidade do próprio Deus (Hb 12:5-11). Ela cumpre três propósitos fundamentais:
1) **Finalidade Restauradora (Redentora)**: Resgatar o pecador do laço do diabo, conduzindo-o ao arrependimento profundo e à salvação eterna da sua alma (1 Co 5:5; Gl 6:1);
2) **Finalidade Preventiva (Pedagógica)**: Preservar a congregação do contágio do pecado deliberado, advertindo a todos sobre a gravidade da desobediência ("para que também os outros tenham temor", 1 Tm 5:20);
3) **Finalidade Vindicatória (Testemunho)**: Defender a santidade e a honra do Santo Nome do Senhor e o testemunho público do Evangelho perante a sociedade civil (Rm 2:24).

O obreiro de valor não aplica disciplina por ódio ou vingança, mas com lágrimas nos olhos e coração transbordante de compaixão.`,
                    destaqueExegese: 'Katartizo (καταρτίζω) em Gálatas 6:1: restaurar, consertar com delicadeza, como um médico que recoloca um osso fraturado no lugar com perícia e ternura.',
                    pontosChave: [
                        'Propósito primordial: resgate e reconciliação da alma caída',
                        'Proteção da pureza e imunidade espiritual da igreja local',
                        'Zelo pelo testemunho público do Nome do Senhor perante os ímpios',
                        'A disciplina ministrada com espírito de mansidão e autoexame'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. Processamento Bíblico de Acusações contra Obreiros (1 Tm 5:19-21)',
                    conteudo: `O apóstolo Paulo estabelece diretrizes jurídicas e morais rigorosas para proteger a liderança contra intrigas em 1 Timóteo 5:19: "Não aceites acusação contra o presbítero, senão sob o depoimento de duas ou três testemunhas".

Abrahão Cipriano instrui em "Obreiro de Valor" as regras para tratar denúncias:
- **Rejeição a Denúncias Anônimas**: A liderança não deve acolher cartas anônimas ou boatos de corredores;
- **Investigação Sigilosa**: O pastor presidente e a comissão de ética ouvem reservadamente o acusador e o acusado em sessões separadas;
- **Imparcialidade Absoluta**: "Conjuro-te diante de Deus... que guardes estas coisas sem acepção de pessoas, nada fazendo com parcialidade" (1 Tm 5:21). O rigor bíblico aplica-se igualmente a obreiros influentes ou principiantes.`,
                    destaqueExegese: 'Choris proskriseos (χωρὶς προσκρίσεως): sem preconceito, sem julgamento antecipado, com neutralidade de justiça santa.',
                    pontosChave: [
                        'Exigência bíblica de provas e testemunhas idôneas',
                        'Repúdio incondicional a boatarias, calúnias e fofocas ministeriais',
                        'Imparcialidade e equidade de tratamento a todos os obreiros',
                        'Preservação do sigilo processual para não causar escândalo indevido'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. O Acompanhamento Pastoral durante o Período Disciplinar',
                    conteudo: `Um erro gravíssimo em muitas igrejas é afastar o membro em pecado e abandoná-lo ao esquecimento e à solidão, empurrando-o para os braços do mundo.

O verdadeiro ministério pastoral acompanha a ovelha faltosa:
- Agendar visitas periódicas de presbíteros para orar, aconselhar e ler a Bíblia;
- Incentivar a presença contínua nos cultos públicos como ouvinte no auditório, para que a Palavra continue operando regeneração em sua alma;
- Orientar o cumprimento de medidas restauradoras (reparação de danos financeiros, reconciliação conjugal, afastamento de más companhias);
- Quando houver frutos dignos de arrependimento comprovados no tempo, reabilitar publicamente o irmão com amor e abraço fraterno, confirmando-lhe o amor de Cristo (2 Co 2:7-8).`,
                    destaqueExegese: 'Kyrôsai agapen (κυρῶσαι ἀγάπην) em 2 Co 2:8: confirmar, ratificar publicamente e solenemente o amor reconciliador da Igreja.',
                    pontosChave: [
                        'Acompanhamento fraterno contínuo durante a disciplina',
                        'Incentivo à assiduidade nos cultos sob a ministração da Palavra',
                        'Exigência de frutos genuínos de arrependimento (Lucas 3:8)',
                        'Reconciliação e acolhimento solene ao término do processo'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. Condução de Reuniões Ministeriais e Liderança Pacificadora',
                    conteudo: `As reuniões de obreiros presididas pelo pastor e secretariadas pelo presbitério são momentos vitais de alinhamento espiritual e administrativo.

Em "Obreiro de Valor", o Pr. Abrahão Cipriano ensina os princípios para reuniões frutíferas:
1) **Atmosfera de Oração**: Iniciar sempre com louvores da Harpa Cristã e clamor fervoroso pela direção divina;
2) **Pauta Clara**: Discussão objetiva de temas doutrinários, escalas, eventos e relatórios de membros;
3) **Liberdade com Respeito**: Permitir que os irmãos se manifestem em tom fraterno e sereno, evitando discussões exaltadas ou debates agressivos;
4) **Unidade nas Decisões**: Uma vez votada e aprovada a decisão pelo colegiado e pelo pastor, todos os obreiros devem defendê-la com lealdade perante a congregação.`,
                    destaqueExegese: 'Homoioi kai sympsychoi (ὅμοιοι καὶ σύμψυχοι) em Filipenses 2:2: vivendo no mesmo sentimento, unânimes em um só coração e propósito.',
                    pontosChave: [
                        'Reuniões de obreiros marcadas por oração, santidade e ordem',
                        'Diálogo respeitoso e livre de agressividade ou disputas de poder',
                        'Lealdade incondicional às decisões coletivas aprovadas',
                        'O presbítero como promotor constante da unidade ministerial'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'Segundo Gálatas 6:1 e a doutrina da CGADB, qual o objetivo supremo da disciplina bíblica na igreja local?',
                    opcoes: [
                        'Humilhar e envergonhar o faltoso publicamente para expulsá-lo da denominação.',
                        'Restaurar o irmão caído com espírito de mansidão, preservando a pureza da Igreja e reconduzindo-o ao arrependimento e à salvação.',
                        'Cobrar multas em dinheiro para a tesouraria da congregação.',
                        'Garantir que apenas a liderança tome conhecimento do ocorrido para acobertar o pecado.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A disciplina cristã é restauradora (katartizo), visando resgatar o pecador com amor, mansidão e temor de Deus.'
                },
                {
                    pergunta: 'Qual a exigência explícita de 1 Timóteo 5:19 para o acolhimento de denúncias contra presbíteros e líderes da igreja?',
                    opcoes: [
                        'Acolher qualquer postagem anônima na internet sem averiguar.',
                        'Apenas aceitar a acusação sob o depoimento idôneo de duas ou três testemunhas comprovadas, julgando com imparcialidade absoluta.',
                        'Ignorar todas as acusações para proteger a liderança mesmo em caso de crimes.',
                        'Resolver o problema através de um duelo público no púlpito.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A Bíblia exige rigor jurídico e moral de 2 ou 3 testemunhas para evitar que acusações caluniosas e injustas destruam reputações de líderes.'
                }
            ]
        }]
    },
    {
        id: 'pb_05',
        nivelId: 'presbitero',
        titulo: 'Módulo 5: Aconselhamento Pastoral, Família & Escatologia Bíblica Pentecostal',
        capituloCGADB: 'Capítulo 22 - A Segunda Vinda de Cristo, Capítulo 23 - O Milênio e o Juízo Final & Capítulo 24 - A Família',
        cargaHoraria: 24,
        ementa: 'Princípios e ética do aconselhamento pastoral bíblico: terapia da alma fundamentada nas Escrituras. Aconselhamento pré-nupcial, resolução de crises conjugais e acolhimento em depressão e luto. A escatologia dispensacionalista pré-tribulacionista das Assembleias de Deus: O Arrebatamento iminente da Igreja, o Tribunal de Cristo, as Bodas do Cordeiro, a Grande Tribulação, a Segunda Vinda em Glória, o Milênio literal e o Grande Trono Branco segundo "Obreiro de Valor". Preparação para a unção ministerial.',
        trabalhoSugerido: 'Elaborar um Quadro Comparativo Escatológico detalhando os eventos cronológicos proféticos (Arrebatamento vs. Segunda Vinda em Glória) fundamentado nos Capítulos 22 e 23 da Declaração de Fé da CGADB.',
        licoes: [{
            id: 'lic_pb_05',
            numero: 1,
            titulo: 'O Aconselhamento Espiritual das Famílias e a Esperança Bendita do Arrebatamento',
            introducao: 'O ministério presbiteral atinge sua mais alta densidade pastoral no gabinete de aconselhamento e na vigilância escatológica. As famílias contemporâneas enfrentam ataques sem precedentes contra o casamento e a formação dos filhos. Ao mesmo tempo, os sinais dos tempos e o cumprimento das profecias apontam para a iminência da volta de Jesus. Como ensina comoventemente o Pr. Abrahão Cipriano em "Obreiro de Valor", o presbítero é um médico das almas que cura feridas com o bálsamo do Evangelho, mantendo os olhos fitos no céu à espera do toque da trombeta de Deus.',
            fundamentacaoDoutrinaria: 'Conforme a Declaração de Fé da CGADB (Capítulos 22, 23 e 24), o casamento cristão é uma aliança santa indissolúvel entre homem e mulher. A Igreja aguarda com ardente expectativa o Arrebatamento pré-tribulacionista, pessoal e invisível aos olhos do mundo antes da Grande Tribulação de 7 anos, seguido pela Vinda de Cristo em Glória, o Milênio literal na terra e o Juízo Final perante o Grande Trono Branco.',
            referenciasBiblicas: ['1 Tessalonicenses 4:13-18', '1 Coríntios 15:51-54', 'Mateus 24:36-44', 'Apocalipse 19:11-21', 'Apocalipse 20:1-15', 'Efésios 5:22-33', 'Tiago 5:14-16'],
            aplicacaoPratica: 'O presbítero deve conduzir aconselhamentos com oração, sigilo estrito e fidelidade bíblica, visitar casais em crise, ministrar a unção com óleo aos enfermos nos lares e pregar com fervor a esperança do Arrebatamento da Igreja para manter o rebanho vigilante e em santidade.',
            paginas: [
                {
                    numero: 1,
                    subtitulo: '1. Fundamentos e Ética do Aconselhamento Pastoral Bíblico',
                    conteudo: `O aconselhamento pastoral não é uma sessão de psicanálise secular nem um tribunal de condenação, mas um ministério bíblico de pastoreio que busca a cura das feridas da alma através da luz das Escrituras e do poder restaurador do Espírito Santo.

Diretrizes indispensáveis estabelecidas por Abrahão Cipriano em "Obreiro de Valor":
1) **Suficiência das Escrituras**: A Palavra de Deus é a fonte infalível para diagnosticar as raízes do pecado e indicar o caminho do arrependimento e da paz;
2) **Prudência no Aconselhamento Feminino**: O presbítero nunca deve atender mulheres sozinho a portas fechadas. O gabinete deve possuir visores de vidro ou estar na presença da esposa do obreiro, resguardando o testemunho moral contra qualquer suspeita (1 Ts 5:22);
3) **Ouvir com Empatia e Paciência**: Saber ouvir a dor antes de falar, sem interrupções precipitadas ou julgamentos frios;
4) **Oração e Dependência do Espírito**: Encerrar cada sessão com oração fervorosa de entrega e consolação.`,
                    destaqueExegese: 'Noutheteo (νουθετέω): aconselhar com amor pastoral, instruir com ternura e advertir fraternalmente à luz da Palavra.',
                    pontosChave: [
                        'A Bíblia como recurso supremo para cura e libertação da alma',
                        'Resguardo moral inegociável nos atendimentos pastorais',
                        'Empatia sincera, escuta ativa e sigilo absoluto garantido',
                        'Oração da fé e restauração espiritual operadas por Cristo'
                    ]
                },
                {
                    numero: 2,
                    subtitulo: '2. Aconselhamento Familiar, Matrimônio e a Batalha dos Lares',
                    conteudo: `A Declaração de Fé da CGADB (Capítulo 24) reafirma a sacralidade do matrimônio bíblico heterossexual e monogâmico. Diante da escalada do divórcio e dos conflitos domésticos, o presbítero deve atuar como mediador da graça:
- **Papel do Marido**: Amar a esposa com amor sacrificial autodoativo como Cristo amou a Igreja, tratando-a como vaso mais frágil e co-herdeira da graça (Ef 5:25; 1 Pe 3:7);
- **Papel da Esposa**: Respeitar e cooperar com o marido em submissão bíblica mútua e santa no temor de Deus (Ef 5:22-24);
- **Criação dos Filhos**: Criá-los na disciplina e admoestação do Senhor (Ef 6:4), sem irritá-los com grosserias ou abandono afetivo;
- **Preservação da Aliança**: Combater o divórcio incentivando o perdão incondicional, o diálogo diário e o resgate da vida de oração conjugal.`,
                    destaqueExegese: 'Agape kai phobos (ἀγάπη καὶ φόβος) em Efésios 5: amor sacrificial incondicional e respeito reverente que sustentam o casamento cristão.',
                    pontosChave: [
                        'Indissolubilidade da aliança matrimonial no plano de Deus',
                        'Restauração de casamentos através do perdão e da comunicação bíblica',
                        'Educação e discipulado dos filhos no caminho do Senhor',
                        'O lar do obreiro como modelo visível de piedade para o rebanho'
                    ]
                },
                {
                    numero: 3,
                    subtitulo: '3. A Escatologia Bíblica e o Arrebatamento Pré-Tribulacionista',
                    conteudo: `A escatologia assembleiana é pré-milenista e pré-tribulacionista, fundamentada no entendimento literal e dispensacional das profecias bíblicas:

1) **O Arrebatamento da Igreja (Parousia / Harpazo)**:
   - Evento iminente e sem sinais prévios obrigatórios que ocorrerá em um abrir e fechar de olhos (1 Co 15:51-52);
   - O Senhor descerá nos ares com alarido, voz de arcanjo e trombeta de Deus (1 Ts 4:16);
   - Os mortos em Cristo ressuscitarão primeiro com corpos imortais glorificados;
   - Os crentes vivos serão transformados e arrebatados juntos nas nuvens para o encontro com o Senhor nos ares (1 Ts 4:17);
   - A Igreja é preservada da ira vindoura da Grande Tribulação (1 Ts 1:10; 5:9; Ap 3:10).

2) **Eventos no Céu durante a Grande Tribulação na Terra**:
   - O Tribunal de Cristo (Bema) para galardoamento das obras dos salvos (2 Co 5:10; 1 Co 3:12-15);
   - As Bodas do Cordeiro, a festa nupcial eterna de Cristo com Sua Noiva lavada e remida (Ap 19:7-9).`,
                    destaqueExegese: 'Harpazo (ἁρπάζω) em 1 Tessalonicenses 4:17: arrebatar com força irresistível e rapidez súbita, resgatando a Noiva de Cristo.',
                    pontosChave: [
                        'Iminência e certeza absoluta do Arrebatamento dos salvos',
                        'Ressurreição corpórea dos justos e glorificação dos santos vivos',
                        'O Tribunal de Cristo como julgamento de recompensas e galardões',
                        'A Noiva de Cristo nas Bodas celestiais do Cordeiro'
                    ]
                },
                {
                    numero: 4,
                    subtitulo: '4. A Segunda Vinda em Glória, o Milênio Literal e o Grande Trono Branco',
                    conteudo: `Após os 7 anos de Grande Tribulação na terra sob o domínio do Anticristo e do Falso Profeta, ocorrerá a Segunda Vinda de Cristo em Glória (Epiphaneia):
- **A Manifestação Visível**: Todo o olho O verá (Ap 1:7; Zc 14:4). Cristo desce corporalmente com Sua Igreja glorificada sobre o Monte das Oliveiras;
- **A Batalha do Armagedom**: O Senhor derrota as nações rebeldes com o sopro de Sua boca e lança a Besta e o Falso Profeta no Lago de Fogo (Ap 19:19-20); Satanás é amarrado por mil anos no abismo (Ap 20:1-3);
- **O Milênio Literal**: Reino messiânico de mil anos de paz, justiça e prosperidade sobre a terra governado por Cristo a partir de Jerusalém (Is 11; Ap 20:4-6);
- **O Grande Trono Branco**: Julgamento final de todos os ímpios de todas as eras que rejeitaram a Deus, sendo lançados no Lago de Fogo eterno (Ap 20:11-15);
- **Novos Céus e Nova Terra**: A habitação eterna e perfeita dos santos com Deus (Ap 21-22).`,
                    destaqueExegese: 'Epiphaneia tes doxes (ἐπιφάνεια τῆς δόξης) em Tito 2:13: a manifestação pública, resplandecente e gloriosa do nosso grande Deus e Salvador Jesus Cristo.',
                    pontosChave: [
                        'Segunda Vinda pública e visível de Cristo com os Seus santos',
                        'Derrota definitiva das forças das trevas no Armagedom',
                        'O Milênio como cumprimento literal das promessas divinas à terra',
                        'O Juízo Final e a eternidade gloriosa na Nova Jerusalém'
                    ]
                },
                {
                    numero: 5,
                    subtitulo: '5. A Vigília Escatológica do Presbítero e a Consagração Final',
                    conteudo: `Em "Obreiro de Valor", o Pr. Abrahão Cipriano conclui sua magna obra convocando o obreiro a viver com as vestes alvas e o azeite transbordando sobre a cabeça (Ec 9:8). O presbítero que crê na breve volta de Cristo não se apega às vaidades deste mundo corrupto, mas investe sua vida no pastoreio fiel e na salvação de multidões.

Ao completar com êxito os 5 módulos da Escola de Obreiros GIPP, o candidato a Presbítero demonstra:
- Fidelidade doutrinária inegociável à Declaração de Fé da CGADB;
- Excelência homilética e sabedoria no manejo da Palavra de Deus;
- Caráter aprovado, vida familiar exemplar e ética pastoral irrepreensível;
- Cumprimento integral do estágio supervisionado de 80 horas no púlpito, lares e visitas com a unção do azeite.

Ele está pronto para receber a imposição de mãos dos ministros e ser apresentado à congregação como um verdadeiro Presbítero da Casa de Deus!`,
                    destaqueExegese: 'Maranatha (μαραναθά) em 1 Co 16:22: "O nosso Senhor vem!", o clamor triunfante de toda a Igreja de Cristo.',
                    pontosChave: [
                        'Vigilância diária e santidade em antecipação à volta do Senhor',
                        'Conclusão com louvor da jornada de formação teológica e prática',
                        'Aprovação canônica e imposição solene de mãos do pastorado',
                        'A coroa incorruptível de glória reservada pelo Sumo Pastor (1 Pe 5:4)'
                    ]
                }
            ],
            quiz: [
                {
                    pergunta: 'De acordo com a Declaração de Fé da CGADB (Capítulo 22) e 1 Tessalonicenses 4:16-17, o que acontecerá no Arrebatamento da Igreja?',
                    opcoes: [
                        'A Igreja passará por todos os sofrimentos da Grande Tribulação na terra sob o Anticristo.',
                        'Jesus descerá nos ares, os mortos em Cristo ressuscitarão incorruptíveis e os salvos vivos serão transformados e arrebatados para encontrar o Senhor nos ares antes da Grande Tribulação.',
                        'O Arrebatamento é apenas uma metáfora poética sem cumprimento literal.',
                        'Apenas os anjos serão arrebatados para os céus.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'A CGADB ensina a bendita esperança do Arrebatamento pré-tribulacionista, pessoal e iminente da Noiva de Cristo antes da ira da Grande Tribulação.'
                },
                {
                    pergunta: 'Segundo as orientações de ética pastoral do livro "Obreiro de Valor", qual o cuidado mandatório no aconselhamento a pessoas do sexo oposto?',
                    opcoes: [
                        'Atender sozinho a portas trancadas em locais isolados no período noturno.',
                        'Nunca atender sozinho a portas fechadas; utilizar gabinetes com visão transparente ou contar com a presença discreta da esposa do obreiro, resguardando o testemunho moral.',
                        'Gravar o atendimento e divulgar o áudio no grupo de jovens.',
                        'Cobrar consultas particulares das ovelhas.'
                    ],
                    respostaCorreta: 1,
                    explicacao: 'O obreiro de valor resguarda o seu testemunho contra calúnias e ciladas espirituais, mantendo total transparência e discrição cristã nos aconselhamentos.'
                }
            ]
        }]
    }
];
