const fs = require('fs');

const data = fs.readFileSync('src/data/ModuleTeologiaData.tsx', 'utf8');

const newModule = `    {
        id: 'declaracao_fe_cpad',
        title: 'Declaração de Fé da CPAD / CGADB',
        description: 'Estudo oficial e sistemático da Declaração de Fé das Assembleias de Deus, elaborada pela CGADB e publicada pela CPAD, estruturada em seus 24 capítulos fundamentais.',
        icon: BookOpen,
        color: 'red',
        lessons: [
            {
                title: 'A Base: Escrituras, Deus Pai e a Trindade (Cap. 1 a 3)',
                readingTime: '20 min',
                pages: [
                    {
                        pageTitle: 'Capítulo 1 - As Sagradas Escrituras',
                        subtitle: 'A Bíblia é a nossa única regra inerrante de fé e prática.',
                        text: (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-slate-800">1. Introdução</h2>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    A Declaração de Fé inicia-se com a doutrina basilar de todas as outras: a Bibliologia. Cremos na <strong>inspiração divina verbal e plenária da Bíblia Sagrada</strong>.
                                </p>
                                <h2 className="text-xl font-bold mb-4 text-slate-800 mt-6">2. Fundamentação Doutrinária</h2>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    A Bíblia contém 66 livros canônicos. É inerrante, completa e infalível, revelando o poder de Deus e a suficiência de Cristo (João 10.35, 2 Timóteo 3.16). 
                                </p>
                                <h2 className="text-xl font-bold mb-4 text-slate-800 mt-6">3. Referências Bíblicas</h2>
                                <ul className="list-disc pl-5 space-y-2 text-slate-700">
                                    <li><strong>2 Timóteo 3.16-17:</strong> "Toda a Escritura é inspirada por Deus e útil..."</li>
                                    <li><strong>2 Pedro 1.21:</strong> "...homens santos de Deus falaram inspirados pelo Espírito Santo."</li>
                                </ul>
                            </div>
                        )
                    },
                    {
                        pageTitle: 'Capítulo 2 e 3 - Sobre Deus e a Trindade',
                        subtitle: 'O monoteísmo bíblico e o mistério Trinitário.',
                        text: (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-slate-800">1. Fundamentação Doutrinária</h2>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    Deus é o Supremo Ser, Criador do Céu e da Terra, único e verdadeiro. Possui atributos incomunicáveis (onipresença, onisciência, onipotência, imutabilidade) e comunicáveis (amor, justiça, santidade).
                                </p>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    A <strong>Santíssima Trindade</strong> consiste em um só Deus subsistente eternamente em três pessoas distintas: o Pai, o Filho e o Espírito Santo. Iguais em poder, glória e majestade, e distintas em função. Rejeitamos o unicismo, unitarismo e o triteísmo.
                                </p>
                                <h2 className="text-xl font-bold mb-4 text-slate-800 mt-6">2. Aplicação Prática</h2>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    Devemos adorar a um único Deus, submetendo-nos à Vontade do Pai, imitando o caráter do Filho, sob a capacitação e poder do Espírito Santo em nosso dia a dia.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Cristologia e Pneumatologia (Cap. 4 a 6)',
                readingTime: '25 min',
                pages: [
                    {
                        pageTitle: 'Capítulo 4 e 5 - Identidade e Obras de Cristo',
                        subtitle: 'Plenamente Deus, Plenamente Homem.',
                        text: (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-slate-800">1. Fundamentação Doutrinária</h2>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    O Senhor Jesus Cristo é o Filho Unigênito de Deus, possuindo duas naturezas inconfundíveis: a divina e a humana. Cremos no seu <strong>nascimento virginal</strong>, em sua vida impecável, em sua morte substitutiva (vicária) e expiatória.
                                </p>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    As obras de Cristo culminam na sua <strong>ressurreição corporal</strong> ao terceiro dia, em sua ascensão aos céus e sua intercessão contínua como Sumo Sacerdote à destra de Deus Pai.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: 'Capítulo 6 - Sobre o Espírito Santo',
                        subtitle: 'O Consolador e Mestre da Igreja.',
                        text: (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-slate-800">1. O Espírito Santo na Doutrina</h2>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    A terceira Pessoa da Trindade, o Espírito Santo, é Deus. Ele convence o mundo do pecado, da justiça e do juízo. Possui intelecto, vontade e emoções, relacionando-se pessoalmente conosco (At 5.3,4).
                                </p>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    Seus símbolos bíblicos incluem: Vento, Fogo, Água, Óleo e Pomba, indicando purificação, renovo, capacitação e paz (Lc 3.16).
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Antropologia, Pecado e Salvação (Cap. 7 a 10)',
                readingTime: '30 min',
                pages: [
                    {
                        pageTitle: 'Capítulo 7 a 9 - O Homem, Criaturas Espirituais e O Pecado',
                        subtitle: 'A coroa da criação e sua queda universal.',
                        text: (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-slate-800">1. A Constituição e a Queda</h2>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    O homem foi criado à imagem e semelhança de Deus (Gn 1.27) por ato imediato (negamos o evolucionismo cego). É um ser tricotômico: espírito, alma e corpo (1 Ts 5.23).
                                </p>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    As criaturas espirituais incluem anjos (eleitos e decaídos). O Pecado original resultou na corrupção total do gênero humano, destituindo-o da glória de Deus e trazendo a condenação (Rm 3.23).
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: 'Capítulo 10 - Sobre a Salvação',
                        subtitle: 'Pela Graça, por meio da Fé.',
                        text: (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-slate-800">1. Fundamentação Doutrinária</h2>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    A salvação compreende a Justificação, a Regeneração e a Santificação, conduzindo à Glorificação (Ef 2.8). O favor imerecido de Deus (a Graça) é oferecido universalmente, acessível mediante a fé em Jesus e arrependimento.
                                </p>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    Nós rejeitamos a doutrina da "uma vez salvo, salvo para sempre" incondicional, crendo que a salvação exige preservação e perseverança (Hb 3.12).
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Eclesiologia, Ordenanças e Ministério (Cap. 11 a 18)',
                readingTime: '30 min',
                pages: [
                    {
                        pageTitle: 'A Igreja, o Batismo e a Ceia',
                        subtitle: 'Instituições divinas no mundo.',
                        text: (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-slate-800">A Igreja e suas Ordenanças</h2>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    A Igreja é a assembleia universal dos santos (Cap 11). É fundamentada em Cristo e governada bíblicamente (Cap 14) através de Pastores, Presbíteros, Diáconos e Obreiros.
                                </p>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    Mantemos duas <strong>Ordenanças (Cap 12 e 13)</strong>: O Batismo em Águas, exclusivamente por <strong>imersão</strong> e apenas para crentes conscientes; e a Ceia do Senhor, como memorial e comunhão.
                                </p>
                            </div>
                        )
                    },
                    {
                        pageTitle: 'Adoração, Estado e Lei',
                        subtitle: 'Nosso relacionamento social e civil.',
                        text: (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-slate-800">Nossa conduta pública</h2>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    A verdadeira Adoração (Cap 15) não contém idolatria. Apoiamos a submissão civil ao Estado (Cap 16), com exceção das ordens que ferem a Lei de Deus. A Lei (Cap 17) e os Dez Mandamentos (Cap 18) guiam o caráter moral cristão, embora não estejamos debaixo do peso da lei cerimonial.
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Pentecostalismo: Batismo no Espírito, Dons e Cura (Cap. 19 a 21)',
                readingTime: '25 min',
                pages: [
                    {
                        pageTitle: 'O Distintivo Pentecostal',
                        subtitle: 'Revestimento de Poder e Curas Atuais.',
                        text: (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-slate-800">Doutrinas do Espírito e Fé Ativa</h2>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    Cremos, segundo os capítulos 19 e 20 da Declaração de Fé da CPAD, no <strong>Batismo no Espírito Santo</strong> subsequente à salvação, tendo como evidência física inicial o falar em outras línguas (glossolalia).
                                </p>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    Cremos na atualidade e relevância dos Dons Espirituais (1 Co 12) e na <strong>Cura Divina (Cap 21)</strong>, disponível na expiação mediante a oração de fé (Tiago 5.14).
                                </p>
                            </div>
                        )
                    }
                ]
            },
            {
                title: 'Escatologia e a Instituição Familiar (Cap. 22 a 24)',
                readingTime: '20 min',
                pages: [
                    {
                        pageTitle: 'Os Finais dos Tempos e a Família',
                        subtitle: 'A bendita Esperança da Igreja.',
                        text: (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-slate-800">Escatologia (Cap 22 e 23)</h2>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    A Segunda Vinda de Cristo dar-se-á em duas etapas: O <strong>Arrebatamento da Igreja</strong> (invisível, pré-tribulacionista) e, após 7 anos, a Manifestação gloriosa.
                                </p>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    Cremos no Milênio literal, no Juízo Final diante do Grande Trono Branco para os ímpios, e no Estado Eterno de Novos Céus e Nova Terra para os salvos.
                                </p>
                                <h2 className="text-xl font-bold mb-4 text-slate-800 mt-6">A Família (Cap 24)</h2>
                                <p className="mb-4 text-slate-700 leading-relaxed">
                                    A família é uma instituição divina indispensável, composta pelo casamento monogâmico e heterossexual. Rejeitamos e condenamos à luz das Escrituras a dissolução sem fundamento bíblico e relações pecaminosas condenadas na Palavra de Deus.
                                </p>
                            </div>
                        )
                    }
                ]
            }
        ],
        quiz: [
            {
                question: 'Segundo a Declaração de Fé da CPAD/CGADB, como é identificado o Batismo no Espírito Santo?',
                options: [
                    'Um título simbólico sem evidências materiais, exclusivo à conversão inicial.',
                    'Um batismo em águas onde o candidato recebe os dons espirituais.',
                    'Um revestimento de poder para a vida vitoriosa e o serviço, com evidência inicial de falar em línguas.',
                    'Uma doutrina abolida ao final do primeiro século da Era Cristã (Cessacionismo).'
                ],
                correctIndex: 2,
                explanation: 'A Declaração de Fé expressa nitidamente a crença no Batismo no Espírito Santo, subsequente ou simultâneo à salvação, concedendo virtude espiritual com a evidência inicial da glossolalia (falar em novas línguas).'
            },
            {
                question: 'Qual é o entendimento escatológico defendido na Declaração de Fé da CGADB/CPAD?',
                options: [
                    'Arrebatamento pré-tribulacionista (a Igreja será removida antes da Grande Tribulação).',
                    'Amilenarismo clássico, onde não há 1.000 anos reais de governo de Cristo.',
                    'A Igreja passará por toda a Grande Tribulação, e depois ascenderá com Cristo.',
                    'A Vinda de Cristo é unicamente alegórica em nossos corações.'
                ],
                correctIndex: 0,
                explanation: 'Cremos na segunda vinda em duas fases: a primeira invisível (para os Seus), o Arrebatamento antes da ira da Grande Tribulação, e a segunda fase visível e com Seus santos.'
            },
            {
                question: 'Sobre a Salvação, o que nossa Declaração de Fé (Cap. 10) expõe explicitamente?',
                options: [
                    'Que o ser humano não pode perder a salvação (Uma vez salvo, salvo para sempre).',
                    'Que a salvação só está disponível para um grupo de eleitos irresistíveis, e o sacrifício de Jesus foi limitado.',
                    'Que o livre arbítrio não existe desde o pecado original de Adão.',
                    'Que a salvação é para todas as pessoas, gratuita pela graça, mas requer preservação; podendo haver perda caso o crente apostate da fé.'
                ],
                correctIndex: 3,
                explanation: 'Cremos que Cristo morreu pela redenção de todo o mundo. A salvação é para quem recebe a Cristo por fé, devendo zelar por ela; rejeitamos o "uma vez salvo, salvo para sempre" se a pessoa rejeitar ativamente a Cristo e voltar ao pecado consciente sem arrependimento.'
            }
        ]
    }
`;

const insertIndex = data.lastIndexOf('];');
if (insertIndex > -1) {
    const output = data.slice(0, insertIndex) + (data.charAt(insertIndex - 1) === ',' || data.charAt(insertIndex - 2) === ',' ? '' : ',') + '\n' + newModule + '\n' + data.slice(insertIndex);
    fs.writeFileSync('src/data/ModuleTeologiaData.tsx', output, 'utf8');
    console.log("Patched successfully with lastIndexOf");
} else {
    console.error("Could not find array end");
}
