import React from 'react';
import { BookOpen, FileText, Globe, Sparkles, Flame, Church, Clock } from 'lucide-react';

export interface LessonPage {
    pageTitle: string;
    subtitle?: string;
    text: React.ReactNode;
}

export interface Lesson {
    title: string;
    readingTime: string;
    pages: LessonPage[];
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

export interface ModuleData {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    lessons: Lesson[];
    quiz: QuizQuestion[];
}

export const MODULES_TEOLOGIA: ModuleData[] = [
    {
        id: 'teontologia',
        title: 'Teontologia e Trindade (Cap. 2 e 3)',
        description: 'Fundamentação doutrinária sobre a existência do Único Deus Verdadeiro e o mistério da Santíssima Trindade nos ensinos da CGADB.',
        icon: Flame,
        color: 'orange',
        lessons: [
            {
                title: 'O Ser de Deus e Seu Caráter Trinitário',
                readingTime: '60 min de leitura',
                pages: [
                    {
                        pageTitle: "Introdução",
                        subtitle: "Visão geral e histórica do assunto",
                        text: (
                            <div className="space-y-4">
                                <p>A <strong>Teontologia</strong> é o estudo teológico sobre o próprio ser de Deus. Ao longo da história da Igreja, afirmar quem Deus é sempre foi o ponto de partida de toda ortodoxia. Historicamente, a igreja enfrentou heresias terríveis (como o Arianismo, que negava a divindade de Cristo, e o Modalismo, que negava a distinção das Pessoas divinas). Em face disso, a tradição pentecostal clássica firma-se sobre o teísmo bíblico e o dogma da Trindade: existe um só Deus vivo e verdadeiro, manifestando-se eternamente em três Pessoas distintas: Pai, Filho e Espírito Santo.</p>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Fundamentação Doutrinária",
                        subtitle: "Declaração de Fé da CGADB (Capítulos 2 e 3)",
                        text: (
                            <div className="space-y-4">
                                <p>A doutrina oficial das Assembleias de Deus no Brasil, estruturada nos <strong>Capítulos 2 (Teontologia)</strong> e <strong>3 (A Santíssima Trindade)</strong> de sua Declaração de Fé, ensina que:</p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li>Cremos em um só Deus, eternamente subsistente em três pessoas: o Pai, o Filho e o Espírito Santo.</li>
                                    <li>Deus é Espírito, infinito, eterno, imutável em Seu ser, sabedoria, poder, santidade, justiça, bondade e verdade. Ele é o Criador de todas as coisas visíveis e invisíveis.</li>
                                    <li>Rejeitamos todo tipo de politeísmo, panteísmo ou deísmo. As três Pessoas da Trindade são coiguais, coeternas e consubstanciais (da mesma essência divina).</li>
                                </ul>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Referências Bíblicas",
                        subtitle: "Principais versículos exegéticos que embasam o ensino",
                        text: (
                            <div className="space-y-4">
                                <p>O ensino ortodoxo sobre Deus e a Trindade repousa nas seguintes evidências exegéticas das Sagradas Escrituras:</p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li><strong>Deuteronômio 6:4:</strong> "Ouve, Israel, o Senhor nosso Deus é o único Senhor." (A base inegociável do monoteísmo ético).</li>
                                    <li><strong>Mateus 28:19:</strong> "Ide, ensinai todas as nações, batizando-as em nome do Pai, e do Filho, e do Espírito Santo." (A união das três pessoas divinas no mesmo NOME singular).</li>
                                    <li><strong>2 Coríntios 13:14:</strong> "A graça do Senhor Jesus Cristo, e o amor de Deus, e a comunhão do Espírito Santo seja com todos vós. Amém." (A bênção apostólica tríplice).</li>
                                    <li><strong>Gênesis 1:26:</strong> "E disse Deus: Façamos o homem à nossa imagem, conforme a nossa semelhança." (A pluralidade na divindade subentendida na criação).</li>
                                </ul>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Aplicação Prática",
                        subtitle: "A Teontologia e Trindade na vida do cristão pentecostal",
                        text: (
                            <div className="space-y-4">
                                <p>Como o obreiro ou membro aplica esse ensinamento na vida cristã em nossa universidade e comunidade?</p>
                                <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl">
                                    <h4 className="font-bold text-orange-900 mb-1">Na Adoração:</h4>
                                    <p className="text-orange-800 text-sm">Em primeiro lugar, nossa adoração se torna riquíssima. Adoramos ao Pai pelo seu amor provedor, rendemos ação de graças ao Filho por Sua obra expiatória na cruz, e buscamos a comunhão íntima e o batismo com o Espírito Santo, que habita em nós hoje vivificando a igreja.</p>
                                </div>
                                <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl">
                                    <h4 className="font-bold text-orange-900 mb-1">Na Comunhão (Koinonia):</h4>
                                    <p className="text-orange-800 text-sm">A Trindade ensina o conceito perfeito de relacionamento e amor. Deus não é um ser solitário no universo que precisou criar o homem para deixar de ser sozinho. Ele já desfrutava de perfeito amor eterno entre as Pessoas da Trindade! Assim, somos chamados a viver essa mesma união, refletindo o amor de Deus em nossos arraiais.</p>
                                </div>
                            </div>
                        )
                    }
                ]
            }
        ],
        quiz: [
            {
                question: 'Qual heresia antiga negava o mistério da Trindade, afirmando erroneamente que Deus seria apenas uma pessoa manifestando-se como "papéis" diferentes na história (Pai no VT, Filho no NT e Espírito na Igreja)?',
                options: [
                    'Arianismo.',
                    'Modalismo (ou Sabelianismo).',
                    'Agnosticismo.',
                    'Gnosticismo.'
                ],
                correctIndex: 1
            },
            {
                question: 'Segundo o ensino ortodoxo da CGADB, a relação ontológica (de ser) entre o Pai, o Filho e o Espírito Santo é que eles são:',
                options: [
                    'Coiguais, coeternos e consubstanciais, compondo o único Deus verdadeiro.',
                    'Deuses distintos e separados com níveis diferentes de poder eterno.',
                    'Meros títulos humanos atribuídos a líderes carismáticos para representar virtudes divinas.',
                    'Partes fragmentadas da divindade onde cada um detém 33,3% da essência divina.'
                ],
                correctIndex: 0
            }
        ]
    },
    {
        id: 'intro_teologia',
        title: 'Introdução à Teologia',
        description: 'Fundamentos epistemológicos, definição acadêmica, importância prática e métodos científicos de estudo teológico.',
        icon: Globe,
        color: 'indigo',
        lessons: [
            {
                title: 'O que é Teologia: Definições e Origem',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "Etimologia e Conceituação Filológica",
                        subtitle: "Página 1: As raízes do termo Theos-Logos",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    O termo <strong>Teologia</strong> é uma herança direta do pensamento helênico clássico, composto por dois radicais de altíssima relevância semântica: <em>Theos</em> (Deus) e <em>Logos</em> (Razão, Discurso, Estudo, Tratado ordenado). Filologicamente, refere-se à ciência ou discurso racional a respeito do divino.
                                </p>
                                <p>
                                    O termo foi empregado primeiramente fora do ambiente bíblico, por pensadores como Platão (em <em>A República</em>) para descrever a narrativa mitopoética sobre os deuses gregos, e posteriormente por Aristóteles, que classificou a teologia como a mais sublime das ciências teóricas, identificando-a como a "filosofia primeira" ou metafísica que investiga o Ser Incriado e Absoluto.
                                </p>
                                <p>
                                    No seio cristão primitivo, as expressões teológicas foram purificadas do politeísmo e da pura especulação racionalista, tornando-se a sistematização da verdade divina revelada, unindo a rigorosa busca intelectual ao fervor espiritual.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Teologia e Revelação: Geral vs. Especial",
                        subtitle: "Página 2: Como o Transcendente se comunica com a criação",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A teologia cristã parte do pressuposto axiomático de que Deus existe e decidiu se revelar ativamente à humanidade. Sem a auto-revelação do Criador, qualquer esforço intelectual seria puramente especulativo e inútil. Dividimos didaticamente a revelação em duas vertentes axiomáticas:
                                </p>
                                <div className="p-4 bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl">
                                    <h4 className="font-bold text-slate-800 mb-1">Revelação Geral (Natural):</h4>
                                    <p className="text-slate-600 text-sm">
                                        Manifesta através da criação do universo físico, do ordenamento cosmos, da história e do senso moral intrínseco de cada ser humano (consciência). Como afirma no Salmo 19:1: "Os céus proclamam a glória de Deus". É uma revelação universal, suficiente para que o homem admita o Criador, porém insuficiente para a redenção.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 border-l-4 border-indigo-600 rounded-r-xl">
                                    <h4 className="font-bold text-slate-800 mb-1">Revelação Especial (Sobrenatural):</h4>
                                    <p className="text-slate-600 text-sm">
                                        Fornecida através de atos divinos decisivos e miraculosos na história, culminando na encarnação de Jesus Cristo (O Verbo Vivo) e no registro fidedigno das Escrituras Sagradas (O Verbo Escrito). É pessoal, focada na graça salvífica e detalha a reconciliação do ser humano com Deus.
                                    </p>
                                </div>
                            </div>
                        )
                    },
                    {
                        pageTitle: "A Teologia como Ciência e Disciplina Acadêmica",
                        subtitle: "Página 3: A Rainha das Ciências (Regina Scientiarum)",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Durante o período escolástico medieval, com o advento das primeiras grandes universidades europeias (como as de Paris, Oxford e Bolonha), a teologia recebeu a alcunha de <strong>"Rainha das Ciências"</strong>. Sob as formulações de pensadores como Tomás de Aquino, argumentava-se que todas as demais disciplinas do saber secular (geografia, biologia, física, astronomia) serviam como auxiliares no entendimento das obras de Deus.
                                </p>
                                <p>
                                    Como ciência, a Teologia possui um <em>objeto de estudo</em> claro (Deus e Sua relação com o cosmos), um <em>corpo lógico de premissas</em> (extraídas da Palavra) e um <em>método investigativo racional</em>. Difere das ciências empíricas porque seu ponto de partida não é a observação em laboratório, mas a revelação inabalável fornecida pelas Escrituras Sagradas.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: "A Crítica Iluminista e a Secularização",
                        subtitle: "Página 4: O questionamento da dogmática moderna",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Com a chegada da Idade Moderna e o Iluminismo, o estatuto científico da teologia passou a sofrer ataques severos por parte do racionalismo antropocêntrico. Críticos afirmavam que a teologia repousava sobre pressupostos dogmáticos intransponíveis (fé) que não poderiam ser provados usando os passos rígidos do ceticismo empírico.
                                </p>
                                <p>
                                    Em resposta, a academia teológica robustece suas bases provando que até mesmo as ciências naturais dependem de pressupostos metafísicos intransponíveis (como a ordem lógica no universo, a fidedignidade da mente humana e a constância matemática). Portanto, a teologia permanece como ciência perfeitamente cabível ao intelecto, estruturando com lucidez o que a fé confessa.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: "As Definições Patrísticas e Reformadas",
                        subtitle: "Página 5: Agostinho, Aquino e Calvino sobre a Teologia",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Para amparar nossa formação de maneira acadêmica, devemos consultar os gigantes da fé que guiaram a ortodoxia ao longo dos séculos:
                                </p>
                                <blockquote className="p-4 border-l-4 italic border-indigo-400 bg-slate-50 text-slate-700">
                                    "Fides quaerens intellectum — A fé que busca o intelecto." <br />
                                    <span className="block text-xs font-bold mt-1 text-slate-500">— Santo Anselmo de Cantuária</span>
                                </blockquote>
                                <p>
                                    Santo Agostinho de Hipona definia a teologia como "o discurso ou o raciocínio a respeito de Deus". João Calvino iniciava sua monumental <em>Instituição da Religião Cristã</em> destacando que quase toda a soma da nossa sabedoria consiste em duas partes: o conhecimento de Deus e o conhecimento de nós mesmos. Ambas as definições demonstram que a teologia é de cunho eminentemente existencial e prático.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Fé e Razão (Fides et Ratio)",
                        subtitle: "Página 6: Harmonia ou Fracasso Intelectual?",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Existe um antigo dilema sobre a relação de compatibilidade entre as faculdades intelectuais humanas (Razão) e a dotação de confiança espiritual (Fé). No pensamento cristão histórico, eles não são antagônicos, mas sim duas asas através das quais o espírito humano se eleva à contemplação da verdade soberana.
                                </p>
                                <p>
                                    A razão serve para analisar os termos da revelação, para estruturar as conexões lógicas e para articular e defender os dogmas bíblicos contra incoerências críticas. Contudo, a razão humana é finita e deteriorada pela queda (noética do pecado), necessitando da iluminação da fé inspirada pelo Espírito Santo para absorver e crer nos mistérios profundos que transcendem o empirismo materialista.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: "O Perigo da Arrogância Intelectual",
                        subtitle: "Página 7: O equilíbrio espiritual e acadêmico",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Nas palavras conceituadas do grande apóstolo Paulo à igreja de Corinto: "A ciência infla, mas o amor edifica" (1 Coríntios 8:1). O conhecimento teológico desconectado do amor prático e da unção gera farisaísmo, debos e debates estéreis que destroem as congregações.
                                </p>
                                <p>
                                    O verdadeiro obreiro deve aliar a dedicação intelectual exaustiva (como um fiel estudante da academia teológica) com o exercício contínuo dos joelhos nos chãos. A teologia sadia gera humildade perante a infinitude impenetrável de Deus e a profunda pequenez humana.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Teologia Pactual do IBADEP",
                        subtitle: "Página 8: O legado do ensino cristão pentecostal",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Adotando a tradição sólida do <strong>IBADEP</strong> (Instituto Bíblico da Assembleia de Deus no Estado do Paraná), a teologia é compreendida como ferramenta indispensável para o obreiro de valor. O curso do IBADEP molda homens e mulheres com o entendimento bíblico conservador, focado no sacerdócio universal dos crentes, na centralidade das Escrituras e na viva atuação do Espírito Santo na contemporaneidade.
                                </p>
                                <p>
                                    Esta universidade se compromete a entregar esse altíssimo rigor acadêmico, preparando pastores, professores da EBD, evangelistas e missionários para responder com destreza as aflições e questionamentos intelectuais de nossa geração.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: "A Teologia Bíblica vs. Teologia Dogmática",
                        subtitle: "Página 9: Compreendendo distinções cruciais",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Indispensável para o aluno universitário é saber distinguir as atuações das esferas teológicas:
                                </p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li><strong>Teologia Bíblica:</strong> Traça a evolução histórica de um tema ou doutrina ao longo das Escrituras progressivamente (ex: como a ideia do templo evolui de Gênesis ao Apocalipse).</li>
                                    <li><strong>Teologia Dogmática:</strong> Estuda as declarações e credos oficiais estabelecidos formalmente por uma denominação ou concílio da igreja no caminhar do tempo histórico.</li>
                                </ul>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Síntese Prática do Capítulo",
                        subtitle: "Página 10: Conclusão do Módulo de Introdução",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Concluímos este primeiro capítulo com a certeza de que a Teologia constitui a espinha dorsal intelectual da Igreja de Cristo. Ela é o trilho sobre o qual o trem da espiritualidade vigorosa e fiel se desloca com segurança, sem descarrilar para as heresias ou misticismos infundados.
                                </p>
                                <p>
                                    Agora que você concluiu o estudo acadêmico das primeiras 10 páginas deste capítulo, proceda para a resolução dos questionários e tarefas complementares para sedimentar seus conhecimentos antes de emitir sua carga horária.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Importância e Necessidade de Teologizar',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "A Defesa da Verdade: Apologética",
                        subtitle: "Página 1: O obreiro perante a sociedade",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A necessidade primária da teologia reside na sua capacidade apologética. O termo grego <em>apologia</em> descreve a defesa verbal formal em um tribunal de justiça. Perante uma sociedade culturalmente secularizada e pluralista, o obreiro necessita estar equipado para "dar a razão da esperança que há nele" (1 Pedro 3:15).
                                </p>
                                <p>
                                    A teologia apologética não serve para discutir com arrogância, mas para desmanchar sofismas intelectuais e restabelecer a verdade bíblica sob bases históricas, arqueológicas e filosoficamente robustas.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Combate Ativo às Heresias",
                        subtitle: "Página 2: Preservação do rebanho de Deus",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Historicamente, quase todos os livros do Novo Testamento foram redigidos com o fim explícito de rebater heresias doutrinárias (como o gnosticismo incipiente ou o judaísmo legalista). Sem instrução doutrinária aprofundada, os membros estão sujeitos a serem "rebatidos por ventos variados de doutrina" (Efésios 4:14).
                                </p>
                                <p>
                                    A teologia robusta age como um anticorpo espiritual na vida comunitária da igreja, conferindo discernimento crítico para vetar aberrações litúrgicas e novidades teológicas perniciosas sem fundamento bíblico.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Sã Doutrina e Ortodoxia",
                        subtitle: "Página 3: O conceito de sã doutrina",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    No grego do NT, a sã doutrina é qualificada como <em>Hygianousa Didaskalia</em>, que carrega o significado literal de "instrução saudável ou curativa". A teologia bíblica confere saúde espiritual à mente e ao caráter dos santos.
                                </p>
                                <p>
                                    A ortodoxia (reta opinião/crença) anda atada inescapavelmente com a ortopraxias (reta conduta de vida). Um rebanho instruído na verdadeira teologia desenvolve casamentos equilibrados, integridade profissional na sociedade e dedicação intensa às obras de misericórdia.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Estudo Acadêmico Prático",
                        subtitle: "Página 4: O papel pastoral no ensino",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    O pastor não detém apenas o chamado para apascentar os necessitados e pregar no púlpito; ele tem a vocação primária e divina de ser um Mestre. O obreiro aprovado deve dominar com destreza os fundamentos da palavra para aconselhar casais em crise, liderar a mocidade e dar amparo aos intelectuais de sua paróquia.
                                </p>
                                <p>
                                    A teologia liberta a mente de visões supersticiosas e medos irracionais, firmando a esperança em um Deus onipotente cujo amor e soberania já foram provados na cruz.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Sintetizando Conhecimentos acadêmicos",
                        subtitle: "Página 5: Obreiros irrepreensíveis",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Nas palavras do currículo clássico de obreiros do IBADEP, a preparação doutrinária confere ao líder uma autoridade moral intocável. Quando a congregação percebe que o ensinamento emitido do púlpito possui raiz profunda nas escrituras, coerência lógica e vida espiritual real, a rebeldia murcha e abre-se espaço para o genuíno avivamento pentecostal.
                                </p>
                                <p>
                                    Prossiga exercitando as anotações do estudante e avance na leitura para dominar de vez os trilhos hermenêuticos do próximo capítulo.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Métodos de Estudo Teológico: Ciências Auxiliares',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "Exegese vs. Eisegese: O Divisor de Águas",
                        subtitle: "Página 1: Extraindo ou inserindo dogmas no texto",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Na prática investigativa teológica, duas atitudes hermenêuticas opostas definem o resultado moral do estudo:
                                </p>
                                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl">
                                    <h4 className="font-bold text-emerald-900 mb-1">A. Exegese (Do grego exegeomai - Extrair):</h4>
                                    <p className="text-emerald-800 text-sm">
                                        É o método humilde no qual o teólogo investiga os termos, as línguas originais e o contexto histórico de um versículo para extrair EXATAMENTE o que o autor inspirado pretendia ensinar aos seus leitores originais. É a bússola da fidelidade bíblica.
                                    </p>
                                </div>
                                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl">
                                    <h4 className="font-bold text-rose-900 mb-1">B. Eisegese (Inserir para dentro):</h4>
                                    <p className="text-rose-800 text-sm">
                                        É o vício metodológico terrível onde o preletor aproxima-se do texto sagrado já munido de premissas particulares ou dogmas culturais, manipulando ou distorcendo os versos para que estes forçosamente concordem com sua tese pessoal. É o berço original de quase todas as heresias.
                                    </p>
                                </div>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Hermenêutica e Seus Cânones de Interpretação",
                        subtitle: "Página 2: A ciência da decodificação textual",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A hermenêutica é a engrenagem ou ciência normativa que dita o manual de regras lógicas a serem observadas para interpretar o texto bíblico com justiça moral. Listamos as principais leis áureas da hermenêutica acadêmica:
                                </p>
                                <ul className="list-decimal pl-6 space-y-3">
                                    <li><strong>O princípio do Contexto:</strong> Um versículo bíblico nunca deve ser isolado. Deve ser lido considerando no contexto imediato (o capítulo) e o global (todo o livro e a inteira Escritura).</li>
                                    <li><strong>A Escritura interpreta a própria Escritura:</strong> Versos obscuros ou de difícil digestão devem ser traduzidos e iluminados à luz das passagens límpidas e de fácil interpretação.</li>
                                    <li><strong>A Intencionalidade do Autor:</strong> Devemos buscar elucidar o contexto sócio-político, a cultura e os destinatários originais para afastar os riscos de anacronismo conceitual.</li>
                                </ul>
                            </div>
                        )
                    },
                    {
                        pageTitle: "As Línguas Originais: Hebraico, Aramaico e Grego",
                        subtitle: "Página 3: As ferramentas linguísticas de fundamentação",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    O Antigo Testamento foi redigido quase inteiramente no Hebraico antigo (caracterizado por sua riqueza pictórica e concreta) com breves porções em Aramaico (em Esdras e Daniel). O Novo Testamento foi redigido no Grego Koiné (o idioma comum e comercial do império romano do primeiro século), louvado internacionalmente por sua incrível exatidão filosófica, riqueza verbal e lógica gramatical fina.
                                </p>
                                <p>
                                    Conhecer ou utilizar bons dicionários lexicais nestas línguas capacita o estudante teólogo a decifrar as matizes ocultas em traduções rústicas, como o valor exato de palavras como <em>Agape</em> (amor sacrificial e incondicional) em contraste com <em>Phileo</em> (afeição de amizade).
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'A Divisão Clássica da Teologia Sistemática',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "As Grandes Divisões Estruturais",
                        subtitle: "Página 1: Mapeando os compartimentos do saber divino",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A Teologia Sistemática subdivide-se didaticamente em várias matérias complementares essenciais para o obreiro acadêmico. Enumeramos e conceituamos as principais esferas:
                                </p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li><strong>Bibliologia:</strong> Investiga a revelação, inspiração, autenticidade, história de preservação do texto bíblico e o estabelecimento do cânon oficial dos livros sagrados.</li>
                                    <li><strong>Teontologia (ou Teologia Própria):</strong> Estuda o Deus Pai, Sua existência metafísica inquestionável, Sua natureza trinitária e Seus divinos atributos comunicáveis e incomunicáveis.</li>
                                    <li><strong>Antropologia Teológica:</strong> Dedica-se à investigação da criação do ser humano à imagem e semelhança de Deus, sua constituição e seu trágico momento de desobediência (Queda).</li>
                                </ul>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Hamartiologia e Soteriologia",
                        subtitle: "Página 2: O pecado e o grandioso plano da salvação",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A sequência sistemática conduz o estudante da trágica debilidade humana à redenção divina em glória:
                                </p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li><strong>Hamartiologia:</strong> Estuda as origens cósmicas do pecado através da rebelião de Lúcifer, a queda do Éden, e o terrível contágio espiritual que assolou a humanidade inteira.</li>
                                    <li><strong>Soteriologia:</strong> O maravilhoso estudo da salvação concedida pela livre e incomparável graça do Pai, abordando temas profundos como arrependimento, regeneração, fé salvífica, justificação jurídica perante os tribunais de Deus, e a glorificação final eterna.</li>
                                </ul>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Teologia Prática e Espiritualidade de Oração',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "A Teologia como Práxis Pastoral",
                        subtitle: "Página 1: Vivenciando o altar e a assistência comunitária",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Não existe espaço na academia de Deus para um conhecimento meramente especulativo ou cerebral. O fim último de toda teologia cristã é de cunho eminentemente prático e existencial.
                                </p>
                                <p>
                                    A Teologia Prática se debruça sobre a oratória bíblica sagrada (Homilética / Pregação), a condução litúrgica nos cultos da comunidade local, a educação cristã de crianças e adultos da Escola Dominical (EBD) e o aconselhamento de casais e enfermos em desespero existencial. Ela garante que a verdade doutrinária seja expressa com amor, empatia e de forma curadora na vida real das ovelhas de Cristo.
                                </p>
                            </div>
                        )
                    }
                ]
            }
        ],
        quiz: [
            {
                question: 'Filologicamente, de quais radicais gregos origina-se o termo "Teologia"?',
                options: [
                    'Theos (Deus) e Logos (Estudo, razão).',
                    'Terra (Mundo) e Graphein (Escrita).',
                    'Soter (Salvação) e Nomos (Lei).',
                    'Ekklesia (Assembleia) e Koinonia (Comunhão).'
                ],
                correctIndex: 0
            },
            {
                question: 'Como se conceitua a "Revelação Geral" ou Natural divina no cosmos?',
                options: [
                    'É a manifestação de Deus especificamente através das línguas originais.',
                    'A comunicação divina realizada através da criação visível, natureza e moralidade biológica.',
                    'Os tratados formulados por Lutero e Calvino no início da Reforma.',
                    'As profecias litúrgicas emitidas no altar no decorrer do culto contemporâneo.'
                ],
                correctIndex: 1
            }
        ]
    },
    {
        id: 'bibliologia',
        title: 'Bibliologia (Doutrina da Bíblia)',
        description: 'Investigação profunda sobre a formação do texto bíblico: Inspiração divina, manuscritologia antiga, a regra do cânon e regras exegéticas.',
        icon: FileText,
        color: 'sky',
        lessons: [
            {
                title: 'Teopneustia: A Inspiração Divina e Autenticidade',
                readingTime: '40 min de leitura',
                pages: [
                    {
                        pageTitle: "O Fenômeno da Inspiração Divina",
                        subtitle: "Página 1: Compreendendo o sopro do Onipotente",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A doutrina fundamental que atesta a natureza divina das Escrituras Sagradas repousa inteiramente sobre o conceito de <strong>Teopneustia</strong> ou inspiração verbal e plenária. No original grego de 2 Timóteo 3:16, a palavra utilizada pelo apóstolo Paulo é <em>Theopneustos</em>, cuja tradução literal significa "soprada por Deus".
                                </p>
                                <p>
                                    Não se trata de mera inspiração artística de poetas ou romancistas, mas da ação sobrenatural direta do Espírito Santo incidindo de modo impenetrável sobre a mente e as faculdades humanas dos escritores bíblicos. Deus supervisionou completamente a escolha das palavras para que transmitissem com fidedignidade absoluta a revelação divina, sem de forma alguma anular a idiossincrasia (estilo, cultura e temperamento) de cada autor bíblico.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: "Visões Equivocadas da Inspiração",
                        subtitle: "Página 2: Desmascarando desvios dogmáticos modernos",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Para o estudante universitário de teologia, é imperativo catalogar e reprovar as teorias heréticas ou errôneas sobre o modo como a Bíblia foi inspirada:
                                </p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li><strong>Teoria do Ditado Mecânico:</strong> Afirma erroneamente que os escritores bíblicos atuaram como simples robôs ou amanuenses sem vontade própria, ditados passivamente por uma voz celestial. Essa teoria desmorona ao analisarmos os linguajares distintos e matizes rústicas usadas por pastores de ovelhas (Amós) em contraste com legisladores letrados (Moisés ou Paulo).</li>
                                    <li><strong>Teoria da Inspiração Dinâmica (ou Parcial):</strong> Sustenta nocivamente de que apenas as áreas morais ou espirituais da Bíblia foram inspiradas, enquanto as porções históricas, científicas e geográficas estariam sujeitas a furos ou falhas intelectuais dos escritores. A ortodoxia bíblica rejeita esse conceito, mantendo a crença na inspiração verbal (que abrange cada letra) e plenária (todas as partes integradas).</li>
                                </ul>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Inerrância e Autoridade Escrita',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "A Rocha Inabalável da Inerrância",
                        subtitle: "Página 1: Livre de erros em todas as asserções",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A <strong>Inerrância Bíblica</strong> é o dogma teológico histórico que afirma que as Escrituras Sagradas, nos seus manuscritos autógrafos originais, estão totalmente livres de erros cognitivos, equívocos teológicos, contradições históricas ou mentiras em tudo o que elas declaram ou asseveram.
                                </p>
                                <p>
                                    Dessa forma, sustentamos a veracidade milenar da Bíblia não apenas em temas espirituais subjetivos, mas em dados históricos, arqueológicos e cronológicos contidos em suas narrativas ricas. Se houvesse erro objetivo ou mentira em dados históricos simples contidos na Bíblia, sua integridade quanto a milagres transcendentes (como a ressurreição corpórea de Jesus) seria irremediavelmente contestada e desmoronaria.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Formação do Cânon Sagrado: Os 66 Livros',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "O Conceito do Cânon e Seus Critérios",
                        subtitle: "Página 1: A vara de medir oficial da verdade",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A palavra <strong>Cânon</strong> deriva de um termo hebraico/grego antigo (<em>kaneh</em> ou <em>kanon</em>) que representava uma vara de medição usada em obras civis. Teologicamente, passou a demarcar o rolo oficial de documentos ou cartas reconhecidas pela Igreja Primitiva como inspiradas pelo Espírito Santo e normativas para fé e conduta.
                                </p>
                                <p>
                                    Dividimos o cânon protestante clássico em exatamente 66 livros imutáveis: 39 do Antigo Testamento (reafirmando as escrituras sagradas dos judeus - a Tanakh) e 27 do Novo Testamento, vetando a inclusão de apócrifos medievais que contradizem dogmas de fé explícitos.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Crítica Textual e Manuscritologia Antiga',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "História de Copistas e Transmissão",
                        subtitle: "Página 1: Do papiro antigo à imprensa moderna",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Não temos em nosso poder os escritos autógrafos de próprio punho redigidos por Moisés, Davi ou o apóstolo Paulo. O que a academia internacional bíblica manipula hoje são cópias meticulosas feitas por gerações dedicadas de copistas (Scribas judeus chamados Masoretas) ou monges medievais dedicados.
                                </p>
                                <p>
                                    A ciência da <strong>Crítica Textual (ou Baixa Crítica)</strong> existe exatamente para depurar e comparar as dezenas de milhares de manuscritos antigos colecionados e catalogados (como os Manuscritos do Mar Morto / Qumran ou o Codex Sinaiticas), provando de modo incontestável que o teor substancial foi inteiramente preservado por Deus através das eras, sem nenhuma perda de doutrina de fé.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Práticas de Hermenêutica Aplicada',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "Lógica e Princípios de Interpretação Exegética",
                        subtitle: "Página 1: Regras do Obreiro Científico",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Para praticar uma exegese brilhante no preparo de sermões pastorais, devemos observar rigorosamente os passos metodológicos aprimorados pelo IBADEP:
                                </p>
                                <ul className="list-decimal pl-6 space-y-3">
                                    <li><strong>Análise Gramatical:</strong> Estudar os sujeitos, os modos verbais e a sintaxe lógica no original ou em excelentes traduções críticas.</li>
                                    <li><strong>Análise Histórico-Geográfica:</strong> Compreender a situação política, economia, as pressões civis vivenciadas pelo povo que residia na época (ex: quem reinava em Judá durante as profecias de Isaías ou Jeremias).</li>
                                    <li><strong>O princípio do Tipo Literário:</strong> Jamais leia uma poesia parabólica do livro de Jó ou um canto metáfora de Cantares de Salomão com a rigidez literal que se lê um tratado jurídico do livro de Romanos escrito por Paulo.</li>
                                </ul>
                            </div>
                        )
                    }
                ]
            }
        ],
        quiz: [
            {
                question: 'O termo grego de 2 Timóteo 3:16 que atesta a Teopneustia das escrituras significa literalmente:',
                options: [
                    'Inventada por homens santos.',
                    'Delineada por reis de Judá.',
                    'Soprada por Deus (Divinamente inspirada).',
                    'Aprovada pelos concílios ecumênicos antigos.'
                ],
                correctIndex: 2
            },
            {
                question: 'Quantos livros compõem o cânon bíblico oficial nas igrejas evangélicas protestantes?',
                options: [
                    '73 livros divididos entre profetas.',
                    '66 livros (39 do Antigo e 27 do Novo Testamento).',
                    '80 livros contendo escritos apócrifos intertestamentários.',
                    '150 salmos integrados a manuscritos.'
                ],
                correctIndex: 1
            }
        ]
    },
    {
        id: 'cristologia',
        title: 'Cristologia (Estudo de Cristo)',
        description: 'Investigação exaustiva e bíblica sobre a transcendência preexistente, encarnação misteriosa, ministérios de ofício e vitória redentora na Cruz.',
        icon: Sparkles,
        color: 'amber',
        lessons: [
            {
                title: 'A Pessoa de Cristo: Natureza Dupla',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "A União Hipostática e as Duas Naturezas",
                        subtitle: "Página 1: A encarnação do Deus Trino",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    As Escrituras do Novo Testamento atestam categoricamente o maior paradoxo teológico da história: o Eterno e Absoluto Criador vestiu-se com carne humana. Jesus de Nazaré é plenamente homem e plenamente Deus, uma realidade intocável que a academia define como <strong>União Hipostática</strong>.
                                </p>
                                <p>
                                    Esta formulação foi lapidada e solidificada no histórico Concílio Ecumênico de Calcedônia (451 d.C.), refutando de vez as heresias do Arianismo (que negava o aspecto divino), o Docetismo (que negava o aspecto de corpo humano de carne) e o Nestorianismo (que separava Jesus em duas pessoas distintas). Nós declaramos que Jesus possui duas naturezas perfeitamente alinhadas, sem fusão confusa, sem divisão desrespeitosa e sem separação, na Pessoa eterna do Filho de Deus.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'O Ministério Terreno e Sinais Messias',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "O Sermão do Monte e o Reino Inaugurado",
                        subtitle: "Página 1: O código moral do Reino",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    O ministério pastoral de Jesus de Nazaré foi focado primordialmente na inauguração real e interna da soberania de Deus no espírito dos seres humanos. No Sermão do Monte (Mateus 5 a 7), Jesus resgata o real valor intrínseco da Lei de Moisés e expõe uma ética espiritual incomparável que excede em muito a retidão fria e formalista expressa pelos escribas e fariseus hipócritas daquela época.
                                </p>
                                <p>
                                    Ao operar milagres espetaculares (como curar cegos e surdos, acalmar tempestades, multiplicar alimentos para milhares de necessitados e ressuscitar mortos), Jesus fornecia credenciais históricas e objetivas inquestionáveis que certificavam que o Messias profetizado no Antigo Testamento de fato havia chegado na história.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Morte Expiatória Substitutiva e Descida',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "A Expiação Penal Substitutiva na Cruz",
                        subtitle: "Página 1: A satisfação da Ira Divina",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A morte humilhante de Jesus na cruz não representou de forma alguma um fracasso de cunho sócio-político ou o fim trágico de um mero mártir social idealista. Tratou-se do acontecimento cósmico redentor previamente arquitetado nos conselhos eternos da Trindade antes da fundação de todo o universo visível.
                                </p>
                                <p>
                                    A teologia reformada e conservadora pentecostal assevera que na cruz ocorreu a <strong>Expiação Substitutiva</strong>: Jesus Cristo, sendo inteiramente isento de culpa moral ou pessoal, autodeclarou-se como o Substituto do ser humano sob a Ira e Justiça Divina, arrebatando sobre Si o castigo de morte e a condenação absoluta das nossas ofensas para conceder-nos a herança da paz.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'A Ressurreição Física e Ascensão em Glória',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "O Túmulo Vazio e a Vitória sobre o Inferno",
                        subtitle: "Página 1: A ressurreição corporal gloriosa",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A pedra angular fática do cristianismo histórico e da esperança eterna repousa sobre a ressurreição física e corpórea de Jesus de Nazaré de dentro do sepulcro escavado da rocha, ao terceiro dia. Se Cristo não tivesse ressuscitado, toda a nossa teologia, nossa pregação no altar e nossa fé seriam estéreis e sem qualquer proveito (1 Coríntios 15:14).
                                </p>
                                <p>
                                    Jesus ressuscitou não como um fantasma ou ectoplasma subjetivo espiritual, mas munido de um corpo físico tangível e transformado em imortalidade e resplendor glorioso (Corpo Glorificado), demonstrando de forma definitiva que o veneno da morte, o império das trevas ocultas e o inferno foram de forma inquestionável anulados e vencidos.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'O Cristo Exaltado à Destra do Pai',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "O Tríplice Ofício de Cristo",
                        subtitle: "Página 1: Profeta, Sacerdote e Rei",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A atividade celestial contemporânea de Jesus de Nazaré é de extrema reverência doutrinária para a saúde da Igreja Viva. Ele subiu e reassentou-se à destra do Pai (Ascensão e Sessão), operando nos termos cósmicos nos termos da majestade e exercendo com soberania o <strong>Tríplice Ofício</strong>:
                                </p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li><strong>O Supremo Profeta:</strong> Por possuir e proclamar a revelação cabal, completa e perfeita de Deus à humanidade nas eras decorridas.</li>
                                    <li><strong>O Grande Sumo Sacerdote:</strong> Por ter oferecido Seu próprio sangue de valor eterno no santuário celestial e por viver constantemente para interceder judicialmente em favor de cada crente.</li>
                                    <li><strong>O Rei Soberano:</strong> Que possui todo o poder e jurisdição nos céus e na terra, aguardando o momento predestinado de colocar todos Seus inimigos sob Seus pés gloriosos.</li>
                                </ul>
                            </div>
                        )
                    }
                ]
            }
        ],
        quiz: [
            {
                question: 'O Concílio de Calcedônia (451 d.C.) ratificou de forma inabalável as duas naturezas de Jesus Cristo sob qual título dogmático?',
                options: [
                    'União Ecumênica Trinitária.',
                    'União Hipostática (100% Deus e 100% Homem).',
                    'Teoria do Ditado Espiritual.',
                    'Filosofia do Obreiro Pleno.'
                ],
                correctIndex: 1
            },
            {
                question: 'Segundo os Capítulos 4 e 5 da Declaração de Fé da CGADB, a morte de Jesus Cristo na cruz do Calvário é ensinada oficialmente como:',
                options: [
                    'Um mero acidente político da história judaica antiga sem efeitos eternos.',
                    'Uma morte vicária (substitutiva) e expiatória para a eterna redenção dos crentes.',
                    'Um ato simbólico destinado apenas a demonstrar pacifismo e fraternidade cívica.',
                    'Uma ilusão corporal ou representação teatral sem sofrimento físico verdadeiro.'
                ],
                correctIndex: 1
            }
        ]
    },
    {
        id: 'pneumatologia',
        title: 'Pneumatologia',
        description: 'Manual sistemático da Pneumatologia: Personalidade de Pneuma Hagion, Batismo no Espírito, os dons carismáticos e a unção litúrgica.',
        icon: Flame,
        color: 'rose',
        lessons: [
            {
                title: 'Deidade e Personalidade do Espírito Santo',
                readingTime: '40 min de leitura',
                pages: [
                    {
                        pageTitle: "O Espírito Santo como deidade Pessoal",
                        subtitle: "Página 1: Muito mais que um sopro impessoal do vento",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Na Pneumatologia reformada e pentecostal (influenciada pelos conceitos acadêmicos rigorosos do IBADEP), asseveramos energicamente que o Espírito Santo de Deus não é uma força invisível cósmica rústica ou uma mera "emanação elétrica" emitida passivamente pelo Deus Pai Supremo.
                                </p>
                                <p>
                                    Em termos ontológicos, Ele é a Terceira Pessoa da Santíssima Trindade, perfeitamente co-igual e co-eterno em Divindade, Glória, Soberania e Atributos Metas ao Pai e ao Filho. Ele possui as três qualidades irrefutáveis de uma personalidade ativa humana e espiritual: Ele manifesta Intelecto (capaz de sondar e conhecer as profundezas da Mente de Deus), demonstra Emoção (passível de se entristecer com nossas rebeldias nos altares) e possui Vontade (distribuindo livremente Seus carismas conforme Lhe apraz).
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'O Espírito Santo na Antiga e Nova Aliança',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "A Transição da Operação do Espírito",
                        subtitle: "Página 1: Do derramar temporário à habitação ininterrupta",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Há uma nítida e fundamental transição na maneira como o Espírito Santo atuou no Antigo Testamento em paralelo com as revelações no Novo Testamento:
                                </p>
                                <p>
                                    Na antiga dispensação da lei mosaica, a operação de Deus pelo Espírito ocorria de forma temporária e intermitente, vindo especificamente sobre indivíduos selados para tarefas de extrema importância (reis como Davi ou profetas como Eliseu). Já na Nova Aliança, inaugurada de vez sob a erupção avivada em Atos 2, ocorre a habitação ininterrupta (Inhabitação) do Espírito no espírito físico de cada alma que de verdade se converte e recebe a regeneração da Cruz. Ele sela e passa a utilizar a pessoa como Seu templo indestrutível.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'O Batismo no Espírito Santo e Promessa',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "O Avivamento Pentecostal de Atos a Azusa Street",
                        subtitle: "Página 1: Vestuário de Poder Celeste para Altar",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Na teodiceia e dogmática de raiz pentecostal clássica da Assembleia de Deus / IBADEP, o <strong>Batismo no Espírito Santo</strong> é conceituado como um maravilhoso revestimento sobrenatural de autoridade para pregar o Evangelho com ousadia moral indestrutível. Trata-se de um acontecimento espiritual perfeitamente distinto da Regeneração de Salvação.
                                </p>
                                <p>
                                    A evidência inicial física inegociável deste batismo glorioso é o falar em outras línguas incompreensíveis dadas soberanamente por Deus (Glóssolalia), abrindo caminho para o desenvolvimento de uma vida de oração incomparável e a operação profética de sinais e dons sobrenaturais divinos.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Dons do Espírito versus Frutos de Caráter',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "O Equilíbrio Absoluto entre Poder e Caráter Santo",
                        subtitle: "Página 1: Obreiros aprovados sem tropeços morais",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    O obreiro universitário necessita dominar a distinção ontológica fundamental entre os dons sobrenaturais e o frutificar moral:
                                </p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li><strong>Dons Espirituais (Carismas):</strong> São ferramentas celestiais de autoridade conferidas gratuitamente por Deus para eficiência pastoral prática (Dons de revelação, dons de milagre, dons de linguagem inspirada). Eles revelam a autoridade de Deus em ação comunitária.</li>
                                    <li><strong>O Fruto do Espírito (Gálatas 5):</strong> Revela de forma incontestável a saúde e santidade moral incorporados no caráter íntimo do crente (amor, paz, domínio próprio, honestidade). Os dons expressam o QUE fomos capacitados a operar; o fruto demonstra QUEM espiritualmente de fato nós nos tornamos sob a Cruz. Estudo no IBADEP prioriza o caráter sobre o barulho puramente exterior.</li>
                                </ul>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'A Atuação do Paracleto na Igreja',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "O Ajudador Supremo e Nosso Guia na Liturgia",
                        subtitle: "Página 1: Conduzindo a adoração com unção genuína",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A palavra de valor definitivo usada por Jesus de Nazaré para nos legar o Espírito Santo foi o termo grego <strong>Parakletos</strong>, cuja tradução em seu valor geográfico-militar descreve o "Ajudador ou Advogado conclamado a colocar-se passo a passo ao nosso lado nas batalhas".
                                </p>
                                <p>
                                    É o Espírito Santo quem gerencia com autoridade espiritual a liturgia virtuosa na igreja local, quem desvenda os olhos mentais e ilumina a mente do pastor no momento do sermão, sela de forma permanente a segurança dos crentes remidos e convence com autoridade irrevogável o ímpio de seus terríveis pecados existenciais.
                                </p>
                            </div>
                        )
                    }
                ]
            }
        ],
        quiz: [
            {
                question: 'No seio da teologia e dogmática pentecostal, qual a evidência física inicial oficial do Batismo no Espírito Santo?',
                options: [
                    'O desenvolvimento intelectual filosófico avançado.',
                    'A aquisição de cargos hierárquicos e administrativos na igreja.',
                    'O falar em outras línguas dadas pelo Espírito Santo (Glosolalia).',
                    'O silêncio absoluto no decorrer da liturgia.'
                ],
                correctIndex: 2
            },
            {
                question: 'Qual a correta definição da personalidade do Espírito Santo segundo o Capítulo 6 da Declaração de Fé da CGADB?',
                options: [
                    'O Espírito Santo é uma força ativa impessoal ou energia cósmica de Deus.',
                    'O Espírito Santo é a Terceira Pessoa da Santíssima Trindade, possuindo personalidade divina própria, intelecto, sentimento e vontade.',
                    'O Espírito Santo é uma emanação passageira de poder que surgiu apenas no Novo Testamento.',
                    'O Espírito Santo é um anjo de alta patente que atua como mensageiro nas igrejas.'
                ],
                correctIndex: 1
            }
        ]
    },
    {
        id: 'eclesiologia',
        title: 'Eclesiologia (Doutrina da Igreja)',
        description: 'Mapeamento teológico da Igreja: Natureza de Ekklesia, os cargos de governo bíblico, as ordenanças da Ceia e Batismo, e a vocação missionária.',
        icon: Church,
        color: 'emerald',
        lessons: [
            {
                title: 'Origem e Natureza Espiritual da Igreja',
                readingTime: '40 min de leitura',
                pages: [
                    {
                        pageTitle: "O Significado de Ekklesia e o Povo Eleito",
                        subtitle: "Página 1: Não as paredes, mas os convocados do Sangue",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A Igreja de Jesus Cristo não constitui sob hipótese alguma um prédio físico erigido de cimento, tijolos e adereços ornamentais. A palavra do original grego clássico que define a igreja no NT é <strong>Ekklesia</strong>, composta pelo prefixo <em>Ek</em> (para fora) e <em>Klesis</em> (chamamento, convocação oficial). Literalmente, descreve a "assembleia dos chamados voluntária e irrevogavelmente para fora".
                                </p>
                                <p>
                                    É o Corpo Místico vivo de Cristo agindo na terra, a Noiva virgem eleita aguardando o glorioso enlaçe do Cordeiro, de onde emana a autoridade santa concedida para manifestar o amor na história da humanidade caída.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Estruturação, Liderança e Ofício Eclesiástico',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "O Governo Bíblico: Presbíteros, Pastores e Diáconos",
                        subtitle: "Página 1: A harmonia que protege a sã doutrina",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Para afastar anarquias administrativas ou tiranias desrespeitosas em sua igreja congregação, o Espírito Santo legou de modo explícito nas Escrituras os degraus de ofício ministerial estruturado. 
                                </p>
                                <p>
                                    Nós estudamos e amparamos a tripla e orgânica estrutura bíblica: os Diáconos (vocacionados para o serviço assistencial generoso das mesas e beneficência prática), os Presbíteros ou Pastores (incumbidos do governo moral maduro, da vigilância pastoral amorosa e da pregação da sã doutrina nos púlpitos) e os Mestres (dedicados ao ensino lúcido nas universidades teológicas da fé).
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Duas Ordenanças Sagradas da Fé',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "Batismo por Imersão e Mesa de Comunhão",
                        subtitle: "Página 1: Os símbolos tangíveis instituídos por Jesus",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    No protestantismo ortodoxo e pentecostal raiz, rejeitamos os excessos sacramentais do catolicismo romano medieval e estabelecemos as duas únicas ordenanças litúrgicas instituídas diretamente e especificamente pela boca do próprio Jesus de Nazaré:
                                </p>
                                <ul className="list-decimal pl-6 space-y-3">
                                    <li><strong>O Batismo nas Águas por Imersão Completa:</strong> Símbolo definitivo exterior público indicando a união fática do crente morto com a morte do Calvário e ressuscitado misticamente com Cristo em resplendor de nova vida. Requer idade de discernimento cognitivo moral completo.</li>
                                    <li><strong>A Santa Ceia do Senhor:</strong> Memorial permanente de comunhão onde pão e vinho traduzem respectivamente Seu corpo rasgado e Seu sangue vertido na Cruz. Nós cremos na Consubstanciação espiritual — Jesus está verdadeiramente presente de modo espiritual alimentando a alma dos crentes que se examinam antes de participar da mesa santa.</li>
                                </ul>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'A Vocação Missionária e Cruzadas Mundiais',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "O Imperativo Supremo do Ide",
                        subtitle: "Página 1: Conquistando corações nos confins do globo",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    O fim existencial de toda a igreja viva instalada na história se conecta diretamente à realização da Grande Comissão legada em Mateus 28:19: "Ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, do Filho e do Espírito Santo".
                                </p>
                                <p>
                                    A Missiologia nos recorda que uma igreja destituída de vocação missionária, que não envia obreiros, que não financia evangelização local e mundial e que apenas se encapsula em debates dogmáticos internos confortáveis em seus templos luxuosos, já fracassou flagrantemente em seu propósito celestial primário.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'A Igreja e os Desafios de Secularização modernos',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "Sal da Terra sem Perder o Sabor",
                        subtitle: "Página 1: Enfrentando o relativismo moral de frente",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A grande ameaça contemporânea à integridade da Igreja não se limita a perseguições sangrentas civis vindas de regimes totalitários. O veneno mais perigoso atua de forma discreta do lado de dentro: a <strong>Secularização</strong> moral e litúrgica.
                                </p>
                                <p>
                                    Obreiros de valor (nos moldes de preparo do IBADEP) devem vetar a diluição de ensinos sérios nos altares, recusando a adoção de técnicas de marketing de autoajuda vazias para atrair públicos sem conversão moral sincera. Devemos ser sal que preserva e luz que expõe as chagas sociais e morais, sem mendigar a aprovação pecaminosa do mundo cultural.
                                </p>
                            </div>
                        )
                    }
                ]
            }
        ],
        quiz: [
            {
                question: 'Quais as duas únicas ordenanças litúrgicas oficiais da fé instituídas formalmente por Jesus nas escrituras protestantes?',
                options: [
                    'A Confissão pública aos sacerdotes e Coroinhas de altar.',
                    'Os Dízimos do templo e a Consagração de presbíteros voluntários.',
                    'O Batismo por imersão nas águas e a Santa Ceia do Senhor.',
                    'A lavagem exterior cerimonial dos pés dos diáconos.'
                ],
                correctIndex: 2
            },
            {
                question: 'De acordo com o Capítulo 12 da Declaração de Fé da CGADB, a forma correta e oficial para a celebração do batismo em águas é:',
                options: [
                    'Exclusivamente por aspersão de pequenas gotas de água sobre a testa.',
                    'Por infusão de copos de água vertidos sobre a cabeça do candidato.',
                    'Exclusivamente por imersão (submersão completa) do corpo em águas límpidas.',
                    'Através de um batismo místico espiritual puramente mental sem uso de água.'
                ],
                correctIndex: 2
            }
        ]
    },
    {
        id: 'escatologia',
        title: 'Escatologia (Estudo do Apocalipse)',
        description: 'Sistemática das últimas coisas: Análise hermenêutica de escatologia, arrebatamento pré-tribulacionista, juízo eterno e Novos Céus e Terra.',
        icon: Clock,
        color: 'violet',
        lessons: [
            {
                title: 'Sistemas Escatológicos e Abordagens',
                readingTime: '40 min de leitura',
                pages: [
                    {
                        pageTitle: "As Abordagens Hermenêuticas do Apocalipse",
                        subtitle: "Página 1: Preterismo, Futurismo, Historicismo e Idealismo",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A Escatologia (do grego <em>Eschatos</em> - Últimas Coisas e <em>Logos</em> - Estudo) é a disciplina fascinante que cataloga o ensino profético sobre a consumação dos séculos e a linha final de salvação da história cósmica. Para interpretar o livro do Apocalipse e Mateus 24, a academia mundial debate quatro grandes óculos de leitura teológica:
                                </p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li><strong>Preterismo:</strong> Afirma de modo radical que quase todas as profecias do Apocalipse já foram concluídas integralmente no primeiro século, na quebra do templo por Tito no ano 70 d.C.</li>
                                    <li><strong>Futurismo:</strong> Sustenta que a maciça maioria do teor profético (capítulos 4 a 22) aguarda sua consumação drástica literal em eventos de cunho cósmico que se descortinarão no futuro iminente da história. É o óculos de leitura central do pentecostalismo.</li>
                                    <li><strong>Idealismo:</strong> Enxerga no texto sagrado apenas uma formidável e bela metáfora poética representando a luta perene do bem divino contra o mal, sem nenhum compromisso factual com datas literais históricas.</li>
                                </ul>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'O Arrebatamento Pré-Tribulacionista',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "A Harpa de Deus e a Bendita Esperança",
                        subtitle: "Página 1: O espetacular recolhimento invisível da Noiva",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    Na teodiceia e escatologia clássica professada pela nossa Universidade e adotada nos manuais rigorosos do IBADEP/Assembleia de Deus, a <strong>Parousia</strong> (Segunda Vinda) ocorre em duas etapas perfeitamente distintas da dispensação:
                                </p>
                                <p>
                                    A primeira etapa constitui o <strong>Arrebatamento de Glória</strong>: um acontecimento invisível e repentino ("em um abrir e fechar de olhos" - 1 Coríntios 15:52) onde Jesus recolhe nos ares do firmamento Sua Noiva Eleita (a Igreja de remidos vivos e ressuscitados de dentro dos jazigos), poupando-os de passar pelos sete terríveis anos do derramar da ira do Cordeiro na grande tribulação que assolará o resto do mundo rebelde remanescente.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'A Vinda em Glória e a Grande Tribulação',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "A Revelação Visível do Rei com Seus Santos",
                        subtitle: "Página 1: Todo olho O avistará nas nuvens",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A segunda etapa da escatologia clássica futurista descreve a <strong>Vinda Corporal em Glória</strong> de Jesus de Nazaré de dentro do céu aberto. Ele não vem mais de maneira mansa em jumento ou na humildade da estrela de Belém; Ele desce revestido de esplendor militar cósmico indescritível montando um corcel de glória, acompanhado por exércitos dos santos arrebatados.
                                </p>
                                <p>
                                    Seu pé glorioso tocará literais degraus do Monte das Oliveiras, desmantelando as forças políticas mundiais hostis agregadas sob a liderança satânica do Anticristo na mítica batalha do Armagedom, de onde erigirá o governo de paz de mil anos sobre as nações restauradas da terra (Milenarismo).
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'O Julgamento Final e Grande Trono Branco',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "A Consumação da Justiça de Deus no Cosmos",
                        subtitle: "Página 1: Livros abertos perante a Santidade Suprema",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    O encerramento do Milênio de paz divino abre passagem para a mais solene das cerimônias teológicas descritas na Bíblia Sagrada: o juízo absoluto perante o <strong>Grande Trono Branco</strong> (Apocalipse 20:11).
                                </p>
                                <p>
                                    Nesta Solene Audiência de Deus de valor definitivo, todos os mortos de todas as eras históricas que rejeitaram com rebeldia a graça da Cruz serão corporalmente ressuscitados para irem ao encontro com a justiça intocável de Deus. Os livros de histórico terrestre serão examinados e cada indivíduo sem o nome cravado no Livro da Vida do Cordeiro será irreversivelmente sentenciado à separação consciente perpétua no Lago de Fogo. Recebe o nome bíblico de Segunda Morte.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Novos Céus, Nova Terra e Eternidade',
                readingTime: '45 min de leitura',
                pages: [
                    {
                        pageTitle: "A Morada dos Remidos na Cidade Celestial",
                        subtitle: "Página 1: Nenhum pranto ou rastro de dor",
                        text: (
                            <div className="space-y-4">
                                <p>
                                    A escatologia cristã não se encerra sob o tom terrível de fogo ou julgamento do trono. A nota final, definitiva e infinitamente melodiosa é descrita em Apocalipse 21 e 22: a inauguração dos <strong>Novos Céus e Nova Terra</strong>.
                                </p>
                                <p>
                                    Deus destruirá permanentemente toda mancha residual de pecado contida no tecido do universo visível e unirá o céu e a terra em casamento indestrutível na descida da gloriosa Nova Jerusalém. Não existirá dor existencial, enfermidades oncológicas, pranto fúnebre ou morte. Os redimidos contemplarão face a face a Trindade em eterna e transbordante comunhão de amor, reinando nos séculos dos séculos invisíveis em júbilo e santidade irrestrita. Maranata! Ora vem Senhor Jesus!
                                </p>
                            </div>
                        )
                    }
                ]
            }
        ],
        quiz: [
            {
                question: 'No Futurismo Bíblico adotado pelos currículos do IBADEP/Assembleia de Deus, sob qual característica é definido o Arrebatamento?',
                options: [
                    'Um evento meramente espiritual na mente filosófica dos crentes.',
                    'A volta corporal e pública de Cristo descendo na época de Jerusalém de Roma.',
                    'O recolhimento invisível e repentino da Noiva (Igreja) antes da Grande Tribulação.',
                    'A morte natural fúnebre de todos os pastores do concílio militar.'
                ],
                correctIndex: 2
            },
            {
                question: 'O que o Capítulo 22 da Declaração de Fé da CGADB ensina sobre a Segunda Vinda de Cristo em relação ao Milênio literal?',
                options: [
                    'O Milênio é apenas uma metáfora poética e Cristo não reinará corporalmente na terra.',
                    'Cristo voltará corporalmente antes do Milênio (Pré-milenarismo) para reinar literalmente mil anos sobre a terra.',
                    'O Milênio já foi inaugurado pela Igreja medieval e Cristo voltará apenas no fim do mundo.',
                    'O Milênio ocorrerá inteiramente no céu sem qualquer relação com o planeta Terra.'
                ],
                correctIndex: 1
            }
        ]
    }
];
