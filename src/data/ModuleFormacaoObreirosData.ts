// ============================================================================
// BASE DE DADOS DOUTRINÁRIA E CURRICULAR: FORMAÇÃO DE OBREIROS (GIPP)
// Alinhamento Rigoroso: 24 Capítulos da Declaração de Fé CGADB / CPAD
// Padrão: 5 Graus Ministeriais x 5 Módulos Completos com 5 Páginas Exegéticas
// ============================================================================

import { TODAS_DISCIPLINAS_CURRICULARES } from './disciplinasMasterData';

export interface PaginaApostila {
    numero: number;
    subtitulo: string;
    conteudo: string;
    destaqueExegese?: string;
    pontosChave?: string[];
}

export interface QuizQuestao {
    pergunta: string;
    opcoes: string[];
    respostaCorreta: number;
    explicacao: string;
}

export interface LicaoObreiro {
    id: string;
    numero: number;
    titulo: string;
    introducao: string;
    fundamentacaoDoutrinaria: string;
    referenciasBiblicas: string[];
    aplicacaoPratica: string;
    paginas: PaginaApostila[];
    quiz: QuizQuestao[];
}

export interface DisciplinaObreiro {
    id: string;
    nivelId: 'auxiliar' | 'diacono' | 'presbitero' | 'evangelista' | 'pastor';
    titulo: string;
    capituloCGADB: string;
    cargaHoraria: number;
    ementa: string;
    trabalhoSugerido: string;
    licoes: LicaoObreiro[];
}

export interface NivelMinisterial {
    id: 'auxiliar' | 'diacono' | 'presbitero' | 'evangelista' | 'pastor';
    nome: string;
    sigla: string;
    descricao: string;
    grau: number;
    horasEstagioObrigatorias: number;
    cor: string;
    iconeNome: string;
    requisitosGerais: string[];
    referenciasBiblicas: string[];
}

export interface CandidatoObreiro {
    id: string;
    membroId?: string; // Vínculo com a base real de membros do sistema (db.membros)
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    foto?: string;
    cargoAtual?: string;
    congregacaoNome?: string;
    dataBatismo?: string;
    nivelAtual: string;
    nivelPretendido: 'auxiliar' | 'diacono' | 'presbitero' | 'evangelista' | 'pastor';
    dataIngresso: string;
    mentorId?: string;
    mentorNome?: string;
    statusTrilha: 'cursando' | 'em_revisao' | 'aprovado_estagio' | 'pronto_consagracao' | 'consagrado';
    progressoTeorico: number;
    mediaProvas: number;
    horasEstagioCumpridas: number;
    trabalhosEntregues: number;
    totalTrabalhosExigidos: number;
    workflowStatus: {
        teoriaConcluida: boolean;
        provasAprovadas: boolean;
        trabalhosAprovados: boolean;
        estagioHomologado: boolean;
        mentoriaAprovada: boolean;
        entrevistaPastor: boolean;
        aprovadoAssembleia: boolean;
    };
    observacoesPastorais?: string;
    // Dossiê Canônico de Idoneidade (1 Tm 3 e Tito 1)
    dossieCanonico?: {
        irrepreensivel: boolean;
        esposoUmaMulher: boolean;
        vigilanteSobrio: boolean;
        hospitaleiro: boolean;
        aptoParaEnsinar: boolean;
        naoDadoAoVinho: boolean;
        naoViolento: boolean;
        moderadoPacifico: boolean;
        naoCobicadorTorpeGanancia: boolean;
        governaBemSuaCasa: boolean;
        naoNeofito: boolean;
        bomTestemunhoDosDeFora: boolean;
        dizimistaFiel: boolean;
        frequenciaCultosDoutrina: boolean;
        parecerPastorPresidente?: string;
        pastorPresidenteNome?: string;
        dataParecer?: string;
        aprovadoPresbiterio?: boolean;
        dataConsagracaoOficial?: string;
        numeroRegistroConvenio?: string;
    };
}

export interface RegistroEstagio {
    id: string;
    candidatoId: string;
    candidatoNome: string;
    nivelId: string;
    tipoAtividade: 'portaria_acolhimento' | 'santa_ceia' | 'visita_enfermos' | 'evangelismo' | 'ebd_auxiliar' | 'culto_direcao' | 'acao_social' | 'oracao_intercessao' | 'assistencia_pastoral';
    titulo: string;
    descricao: string;
    dataAtividade: string;
    horas: number;
    local: string;
    fotoComprovante?: string;
    status: 'pendente' | 'aprovado' | 'rejeitado';
    avaliadorId?: string;
    avaliadorNome?: string;
    parecerAvaliador?: string;
    dataAvaliacao?: string;
}

export interface TrabalhoAcademico {
    id: string;
    candidatoId: string;
    candidatoNome: string;
    disciplinaId: string;
    disciplinaTitulo: string;
    titulo: string;
    conteudoTexto: string;
    arquivoUrl?: string;
    dataEnvio: string;
    status: 'pendente' | 'em_analise' | 'aprovado' | 'necessita_revisao';
    nota?: number;
    feedbackPastor?: string;
    avaliadorNome?: string;
    dataAvaliacao?: string;
}

export interface SessaoMentoria {
    id: string;
    candidatoId: string;
    candidatoNome: string;
    mentorId: string;
    mentorNome: string;
    dataSessao: string;
    temaAbordado: string;
    pontosFortes: string;
    pontosDesenvolver: string;
    avaliacaoCaraterVidaFamiliar: 'Excelente' | 'Bom' | 'Em Observação' | 'Insatisfatório';
    avaliacaoFidelidadeDoutrinaria: 'Excelente' | 'Bom' | 'Em Observação' | 'Insatisfatório';
    parecerGeral: string;
    recomendadoConsagracao: boolean;
}

// ============================================================================
// NOVAS INTERFACES DE GESTÃO DE CAPACITAÇÃO (LMS / COORDENAÇÃO DE ENSINO)
// ============================================================================

export interface TurmaFormacao {
    id: string;
    nome: string;
    nivelMinisterial: 'auxiliar' | 'diacono' | 'presbitero' | 'evangelista' | 'pastor';
    anoLetivo: string;
    dataInicio: string;
    dataTermino: string;
    tutorResponsavelId: string;
    tutorResponsavelNome: string;
    vagas: number;
    alunosIds: string[];
    status: 'aberta' | 'em_andamento' | 'concluida' | 'cancelada';
    cronograma: {
        moduloId: string;
        moduloTitulo: string;
        dataLimite: string;
        peso: number;
    }[];
    localEncontros?: string;
    horarioAulas?: string;
}

export interface TutorFormacao {
    id: string;
    membroId?: string; // Vínculo com membro/obreiro real da igreja
    professorId?: string; // Vínculo com professor EBD/cursos
    nome: string;
    cargo: string;
    especialidade: string;
    telefone: string;
    email: string;
    status: 'ativo' | 'inativo';
    turmasAtribuidas: string[];
    totalCorrecoes: number;
}

export interface EncontroAula {
    id: string;
    turmaId: string;
    turmaNome: string;
    data: string;
    tema: string;
    professorNome: string;
    modalidade: 'presencial' | 'online' | 'hibrido';
    presencas: Record<string, 'presente' | 'ausente' | 'justificado'>;
    observacoes?: string;
    qrCodeToken?: string;
}

export interface FinanceiroCandidato {
    id: string;
    candidatoId: string;
    candidatoNome: string;
    turmaId: string;
    turmaNome: string;
    taxaMatricula: { valor: number; pago: boolean; data?: string; forma?: string };
    taxaMaterial: { valor: number; pago: boolean; data?: string; forma?: string };
    taxaFormatura: { valor: number; pago: boolean; data?: string; forma?: string };
    statusGeral: 'em_dia' | 'pendente' | 'isento';
    observacoes?: string;
}

export interface AvisoTurma {
    id: string;
    turmaId: string;
    turmaNome: string;
    titulo: string;
    mensagem: string;
    dataPublicacao: string;
    autorNome: string;
    fixado: boolean;
    urgencia: 'normal' | 'alta' | 'urgente';
}

export interface QuestaoBanco {
    id: string;
    nivelId: 'auxiliar' | 'diacono' | 'presbitero' | 'evangelista' | 'pastor';
    disciplinaId: string;
    disciplinaTitulo: string;
    enunciado: string;
    opcoes: string[];
    respostaCorreta: number;
    explicacao: string;
    tipo: 'multipla_escolha' | 'dissertativa';
    dificuldade: 'facil' | 'medio' | 'avancado';
    criadoPor: string;
    dataCriacao: string;
}

export interface ProvaCustomizada {
    id: string;
    titulo: string;
    turmaId: string;
    nivelId: 'auxiliar' | 'diacono' | 'presbitero' | 'evangelista' | 'pastor';
    questoesIds: string[];
    notaMinima: number;
    tempoMinutos: number;
    dataAplicacao: string;
    status: 'rascunho' | 'agendada' | 'aplicada';
}

export const NIVEIS_MINISTERIAIS: NivelMinisterial[] = [
    {
        id: 'auxiliar',
        nome: 'Auxiliar de Trabalho',
        sigla: 'AUX',
        grau: 1,
        horasEstagioObrigatorias: 40,
        cor: 'from-blue-600 to-sky-600',
        iconeNome: 'Shield',
        descricao: 'Iniciação ministerial pentecostal focada no zelo pelo templo, acolhimento ao rebanho, intercessão e assistência nos cultos.',
        requisitosGerais: [
            'Membro em plena comunhão há pelo menos 1 ano',
            'Batizado nas águas por imersão e testemunho irrepreensível',
            'Fidelidade nos dízimos e ofertas ao Senhor',
            'Assiduidade aos cultos públicos e Escola Bíblica Dominical'
        ],
        referenciasBiblicas: ['1 Crônicas 9:19-27', 'Salmos 84:10', 'Colossenses 3:23-24']
    },
    {
        id: 'diacono',
        nome: 'Diácono',
        sigla: 'DC',
        grau: 2,
        horasEstagioObrigatorias: 60,
        cor: 'from-amber-600 to-orange-600',
        iconeNome: 'HeartHandshake',
        descricao: 'Ministério de socorro e serviço consagrado, com ênfase na distribuição da Santa Ceia, ação social aos necessitados e visitação.',
        requisitosGerais: [
            'Exercício aprovado como Auxiliar de Trabalho por tempo hábil',
            'Cumprimento estrito dos requisitos paulinos de 1 Timóteo 3:8-13',
            'Homem de uma só mulher, governando bem sua casa',
            'Cheio do Espírito Santo, de sabedoria e de boa reputação (Atos 6:3)'
        ],
        referenciasBiblicas: ['Atos 6:1-7', '1 Timóteo 3:8-13', 'Romanos 16:1-2']
    },
    {
        id: 'presbitero',
        nome: 'Presbítero',
        sigla: 'PB',
        grau: 3,
        horasEstagioObrigatorias: 80,
        cor: 'from-emerald-600 to-teal-700',
        iconeNome: 'BookOpenCheck',
        descricao: 'Liderança eclesiástica de supervisão doutrinária, unção dos enfermos, ensino da Palavra e pastoreio auxiliar de congregações.',
        requisitosGerais: [
            'Experiência comprovada no diaconato ou liderança de departamentos',
            'Requisitos morais e espirituais de Tito 1:5-9 e 1 Timóteo 3:1-7',
            'Apto para ensinar a sã doutrina e refutar os contradizentes',
            'Vida conjugal e familiar modelo para a igreja'
        ],
        referenciasBiblicas: ['Tito 1:5-9', '1 Pedro 5:1-4', 'Tiago 5:14-15', '1 Timóteo 5:17']
    },
    {
        id: 'evangelista',
        nome: 'Evangelista',
        sigla: 'EV',
        grau: 4,
        horasEstagioObrigatorias: 100,
        cor: 'from-purple-600 to-indigo-700',
        iconeNome: 'Megaphone',
        descricao: 'Ministério itinerante e kerigmático dedicado à proclamação do Evangelho, abertura de novos campos, missões e cruzadas.',
        requisitosGerais: [
            'Vocação evangelística notória com frutos comprovados na salvação de vidas',
            'Conhecimento bíblico sólido em Apologética e Missiologia',
            'Reconhecimento pelo Ministério Local e Convenção Regional (CGADB)',
            'Disponibilidade para viagens missionárias e plantação de igrejas'
        ],
        referenciasBiblicas: ['Efésios 4:11', '2 Timóteo 4:5', 'Atos 21:8', 'Atos 8:5-12']
    },
    {
        id: 'pastor',
        nome: 'Pastor',
        sigla: 'PR',
        grau: 5,
        horasEstagioObrigatorias: 120,
        cor: 'from-rose-700 to-red-800',
        iconeNome: 'Award',
        descricao: 'Apascentamento supremo do rebanho, administração dos sacramentos (Batismo e Santa Ceia), governo eclesiástico e consagração.',
        requisitosGerais: [
            'Chamado ministerial inquestionável e provado no fogo das tribulações',
            'Domínio integral da Declaração de Fé das Assembleias de Deus',
            'Maturidade espiritual plena, prudência e integridade inabalável',
            'Homologação formal em Convenção Estadual e CGADB'
        ],
        referenciasBiblicas: ['Jeremias 3:15', 'João 21:15-17', 'Atos 20:28', '1 Pedro 5:1-4', 'Hebreus 13:17']
    }
];

export const DISCIPLINAS_CURRICULARES: DisciplinaObreiro[] = TODAS_DISCIPLINAS_CURRICULARES;

export const CANDIDATOS_EXEMPLO: CandidatoObreiro[] = [
    {
        id: 'cand_01',
        nome: 'Irmão Lucas Gabriel da Silva',
        cpf: '123.456.789-00',
        telefone: '(11) 98765-4321',
        email: 'lucas.silva@igreja.org.br',
        nivelAtual: 'Auxiliar de Trabalho',
        nivelPretendido: 'diacono',
        dataIngresso: '2025-01-10',
        mentorId: 'ment_01',
        mentorNome: 'Pr. Carlos Eduardo (Pastor Presidente)',
        statusTrilha: 'cursando',
        progressoTeorico: 80,
        mediaProvas: 9.4,
        horasEstagioCumpridas: 48,
        trabalhosEntregues: 4,
        totalTrabalhosExigidos: 5,
        workflowStatus: {
            teoriaConcluida: true,
            provasAprovadas: true,
            trabalhosAprovados: true,
            estagioHomologado: false,
            mentoriaAprovada: true,
            entrevistaPastor: false,
            aprovadoAssembleia: false
        },
        observacoesPastorais: 'Candidato demonstrando grande zelo na mesa da Santa Ceia e na assistência aos enfermos. Família exemplar.'
    },
    {
        id: 'cand_02',
        nome: 'Diácono Marcos Vinícius Ferreira',
        cpf: '234.567.890-11',
        telefone: '(11) 97654-3210',
        email: 'marcos.ferreira@igreja.org.br',
        nivelAtual: 'Diácono',
        nivelPretendido: 'presbitero',
        dataIngresso: '2024-08-15',
        mentorId: 'ment_02',
        mentorNome: 'Pr. Josué Mendes (Vice-Presidente)',
        statusTrilha: 'aprovado_estagio',
        progressoTeorico: 100,
        mediaProvas: 9.8,
        horasEstagioCumpridas: 84,
        trabalhosEntregues: 5,
        totalTrabalhosExigidos: 5,
        workflowStatus: {
            teoriaConcluida: true,
            provasAprovadas: true,
            trabalhosAprovados: true,
            estagioHomologado: true,
            mentoriaAprovada: true,
            entrevistaPastor: true,
            aprovadoAssembleia: false
        },
        observacoesPastorais: 'Apto para o presbitério. Excelente exposição na EBD e conduta moral irrepreensível.'
    },
    {
        id: 'cand_03',
        nome: 'Presbítero Daniel Albuquerque Santos',
        cpf: '345.678.901-22',
        telefone: '(11) 96543-2109',
        email: 'daniel.santos@igreja.org.br',
        nivelAtual: 'Presbítero',
        nivelPretendido: 'evangelista',
        dataIngresso: '2024-03-01',
        mentorId: 'ment_01',
        mentorNome: 'Pr. Carlos Eduardo (Pastor Presidente)',
        statusTrilha: 'pronto_consagracao',
        progressoTeorico: 100,
        mediaProvas: 9.9,
        horasEstagioCumpridas: 105,
        trabalhosEntregues: 5,
        totalTrabalhosExigidos: 5,
        workflowStatus: {
            teoriaConcluida: true,
            provasAprovadas: true,
            trabalhosAprovados: true,
            estagioHomologado: true,
            mentoriaAprovada: true,
            entrevistaPastor: true,
            aprovadoAssembleia: true
        },
        observacoesPastorais: 'Homologado por unanimidade em Assembleia Geral da Igreja. Pronto para a imposição de mãos na Convenção Estadual.'
    }
];

export const ESTAGIOS_EXEMPLO: RegistroEstagio[] = [
    {
        id: 'est_01',
        candidatoId: 'cand_01',
        candidatoNome: 'Irmão Lucas Gabriel da Silva',
        nivelId: 'diacono',
        tipoAtividade: 'santa_ceia',
        titulo: 'Auxílio e Distribuição da Santa Ceia do Senhor',
        descricao: 'Preparação dos cálices e bandejas de pão asmo junto ao corpo diaconal. Distribuição solene na nave principal e recolha dos cálices.',
        dataAtividade: '2026-08-02',
        horas: 4,
        local: 'Templo Sede',
        status: 'aprovado',
        avaliadorId: 'ment_01',
        avaliadorNome: 'Pr. Carlos Eduardo',
        parecerAvaliador: 'Excelente postura, passos sincronizados e profunda reverência.',
        dataAvaliacao: '2026-08-03'
    },
    {
        id: 'est_02',
        candidatoId: 'cand_01',
        candidatoNome: 'Irmão Lucas Gabriel da Silva',
        nivelId: 'diacono',
        tipoAtividade: 'visita_enfermos',
        titulo: 'Visita Hospitalar e Oração com Unção de Enfermos',
        descricao: 'Acompanhamento do presbitério no Hospital Regional. Oração breve com unção e leitura de Tiago 5:14 com irmão internado.',
        dataAtividade: '2026-08-08',
        horas: 3,
        local: 'Hospital Geral Regional',
        status: 'aprovado',
        avaliadorId: 'ment_01',
        avaliadorNome: 'Pr. Carlos Eduardo',
        parecerAvaliador: 'Muito prudente, respeitou todas as normas da UTI e transmitiu fé.',
        dataAvaliacao: '2026-08-09'
    }
];

export const TRABALHOS_EXEMPLO: TrabalhoAcademico[] = [
    {
        id: 'trab_01',
        candidatoId: 'cand_01',
        candidatoNome: 'Irmão Lucas Gabriel da Silva',
        disciplinaId: 'dc_01',
        disciplinaTitulo: 'Módulo 1: Diaconia Bíblica & Origem Histórica em Atos 6',
        titulo: 'Ensaio Exegético sobre as Quatro Qualificações de Atos 6:3',
        conteudoTexto: 'O serviço diaconal exige uma síntese indispensável entre o testemunho público irrepreensível (martyroumenous), a plenitude do Espírito Santo e a sabedoria prática...',
        dataEnvio: '2026-07-28',
        status: 'aprovado',
        nota: 9.5,
        feedbackPastor: 'Trabalho de excelente fundamentação bíblica e fidelidade à Declaração de Fé da CGADB.',
        avaliadorNome: 'Pr. Carlos Eduardo',
        dataAvaliacao: '2026-07-30'
    }
];

export const MENTORIAS_EXEMPLO: SessaoMentoria[] = [
    {
        id: 'ment_sess_01',
        candidatoId: 'cand_01',
        candidatoNome: 'Irmão Lucas Gabriel da Silva',
        mentorId: 'ment_01',
        mentorNome: 'Pr. Carlos Eduardo (Pastor Presidente)',
        dataSessao: '2026-08-05',
        temaAbordado: 'Vida Conjugal, Fidelidade nos Dízimos e Prudência nas Redes Sociais',
        pontosFortes: 'Homem de oração, pontual, fiel e leal ao ministério local.',
        pontosDesenvolver: 'Aprimorar a desenvoltura na leitura pública da Bíblia.',
        avaliacaoCaraterVidaFamiliar: 'Excelente',
        avaliacaoFidelidadeDoutrinaria: 'Excelente',
        parecerGeral: 'Candidato vocacionado e maduro. Recomendado com entusiasmo para o Diaconato.',
        recomendadoConsagracao: true
    }
];

// Aliases para compatibilidade
export const MOCK_CANDIDATOS_INICIAIS = CANDIDATOS_EXEMPLO;
export const MOCK_REGISTROS_ESTAGIO = ESTAGIOS_EXEMPLO;
export const MOCK_TRABALHOS_ACADEMICOS = TRABALHOS_EXEMPLO;
export const MOCK_SESSOES_MENTORIA = MENTORIAS_EXEMPLO;

// ============================================================================
// DADOS MOCK INICIAIS DE GESTÃO DE CAPACITAÇÃO (1 A 7)
// ============================================================================

export const TURMAS_EXEMPLO: TurmaFormacao[] = [
    {
        id: 'turma_dc_2026_1',
        nome: 'Turma de Formação Diaconal 2026.1 (Santo Estêvão)',
        nivelMinisterial: 'diacono',
        anoLetivo: '2026/1',
        dataInicio: '2026-02-01',
        dataTermino: '2026-08-30',
        tutorResponsavelId: 'tut_01',
        tutorResponsavelNome: 'Pr. Carlos Eduardo (Pastor Presidente)',
        vagas: 20,
        alunosIds: ['cand_01', 'cand_001'],
        status: 'em_andamento',
        localEncontros: 'Auditório Anexo do Templo Sede',
        horarioAulas: 'Sábados das 14h às 17h',
        cronograma: [
            { moduloId: 'dc_01', moduloTitulo: 'Módulo 1: Diaconia Bíblica & Origem Histórica em Atos 6', dataLimite: '2026-03-15', peso: 2 },
            { moduloId: 'dc_02', moduloTitulo: 'Módulo 2: Requisitos Morais, Familiares e Espirituais de 1 Timóteo 3', dataLimite: '2026-04-15', peso: 2 },
            { moduloId: 'dc_03', moduloTitulo: 'Módulo 3: O Serviço Solene na Mesa do Senhor e Elementos Sagrados', dataLimite: '2026-05-15', peso: 2 },
            { moduloId: 'dc_04', moduloTitulo: 'Módulo 4: Ação Social, Visitação aos Enfermos e Socorro aos Órfãos e Viúvas', dataLimite: '2026-06-15', peso: 2 },
            { moduloId: 'dc_05', moduloTitulo: 'Módulo 5: Ética Diaconal, Submissão Ministerial e Mordomia', dataLimite: '2026-07-15', peso: 2 }
        ]
    },
    {
        id: 'turma_pb_2026_1',
        nome: 'Turma de Presbíteros & Liderança Eclesiástica 2026 (Barnabé)',
        nivelMinisterial: 'presbitero',
        anoLetivo: '2026/1',
        dataInicio: '2026-01-15',
        dataTermino: '2026-09-15',
        tutorResponsavelId: 'tut_02',
        tutorResponsavelNome: 'Pr. Josué Mendes (Vice-Presidente)',
        vagas: 15,
        alunosIds: ['cand_02'],
        status: 'em_andamento',
        localEncontros: 'Sala Teológica 01',
        horarioAulas: 'Quintas-feiras das 19h30 às 22h',
        cronograma: [
            { moduloId: 'pb_01', moduloTitulo: 'Módulo 1: Teontologia & Trindade: A Doutrina de Deus', dataLimite: '2026-02-28', peso: 2 },
            { moduloId: 'pb_02', moduloTitulo: 'Módulo 2: Cristologia e Soteriologia: A Supremacia de Cristo', dataLimite: '2026-04-10', peso: 2 },
            { moduloId: 'pb_03', moduloTitulo: 'Módulo 3: Governo Eclesiástico, Colegiado Presbiteral e Gestão de Conflitos', dataLimite: '2026-05-20', peso: 2 },
            { moduloId: 'pb_04', moduloTitulo: 'Módulo 4: Unção dos Enfermos, Aconselhamento Pastoral e Intercessão', dataLimite: '2026-06-30', peso: 2 },
            { moduloId: 'pb_05', moduloTitulo: 'Módulo 5: Apascentamento do Rebanho, Discipulado e Supervisão Congregacional', dataLimite: '2026-08-10', peso: 2 }
        ]
    }
];

export const TUTORES_EXEMPLO: TutorFormacao[] = [
    {
        id: 'tut_01',
        nome: 'Pr. Carlos Eduardo',
        cargo: 'Pastor Presidente (Doutor em Teologia Bíblica)',
        especialidade: 'Eclesiologia, Ética Pastoral e Ordenação',
        telefone: '(11) 98888-1111',
        email: 'pr.carlos@igreja.org.br',
        status: 'ativo',
        turmasAtribuidas: ['turma_dc_2026_1'],
        totalCorrecoes: 28
    },
    {
        id: 'tut_02',
        nome: 'Pr. Josué Mendes',
        cargo: 'Vice-Presidente & Mestre em Hermenêutica',
        especialidade: 'Teontologia, Cristologia e Línguas Bíblicas',
        telefone: '(11) 98888-2222',
        email: 'pr.josue@igreja.org.br',
        status: 'ativo',
        turmasAtribuidas: ['turma_pb_2026_1'],
        totalCorrecoes: 19
    },
    {
        id: 'tut_03',
        nome: 'Ev. Marcos Antônio',
        cargo: 'Evangelista & Coordenador de Missões',
        especialidade: 'Missiologia, Apologética e Evangelismo Urbano',
        telefone: '(11) 98888-3333',
        email: 'ev.marcos@igreja.org.br',
        status: 'ativo',
        turmasAtribuidas: [],
        totalCorrecoes: 12
    }
];

export const ENCONTROS_EXEMPLO: EncontroAula[] = [
    {
        id: 'enc_01',
        turmaId: 'turma_dc_2026_1',
        turmaNome: 'Turma de Formação Diaconal 2026.1 (Santo Estêvão)',
        data: '2026-08-01',
        tema: 'Aula Magna: A Reverência no Altar e o Serviço da Ceia',
        professorNome: 'Pr. Carlos Eduardo',
        modalidade: 'presencial',
        presencas: {
            'cand_01': 'presente',
            'cand_001': 'presente'
        },
        observacoes: 'Participação com alto engajamento dos aspirantes ao diaconato.',
        qrCodeToken: 'GIPP-EBD-ENC-20260801-DC'
    },
    {
        id: 'enc_02',
        turmaId: 'turma_dc_2026_1',
        turmaNome: 'Turma de Formação Diaconal 2026.1 (Santo Estêvão)',
        data: '2026-08-08',
        tema: 'Oficina Prática: Visitas a Enfermos nos Hospitais e Asilos',
        professorNome: 'Pr. Carlos Eduardo',
        modalidade: 'hibrido',
        presencas: {
            'cand_01': 'presente',
            'cand_001': 'justificado'
        },
        observacoes: 'Simulação prática com avaliação de conduta e oração pelos enfermos.',
        qrCodeToken: 'GIPP-EBD-ENC-20260808-DC'
    }
];

export const FINANCEIRO_EXEMPLO: FinanceiroCandidato[] = [
    {
        id: 'fin_01',
        candidatoId: 'cand_01',
        candidatoNome: 'Irmão Lucas Gabriel da Silva',
        turmaId: 'turma_dc_2026_1',
        turmaNome: 'Turma de Formação Diaconal 2026.1',
        taxaMatricula: { valor: 50.00, pago: true, data: '2026-01-20', forma: 'PIX' },
        taxaMaterial: { valor: 80.00, pago: true, data: '2026-02-05', forma: 'Cartão de Débito' },
        taxaFormatura: { valor: 120.00, pago: false },
        statusGeral: 'em_dia',
        observacoes: 'Matrícula e apostilas impressas quitadas. Taxa de consagração e certificado com vencimento no mês final.'
    },
    {
        id: 'fin_02',
        candidatoId: 'cand_02',
        candidatoNome: 'Diácono Marcos Vinícius Ferreira',
        turmaId: 'turma_pb_2026_1',
        turmaNome: 'Turma de Presbíteros 2026',
        taxaMatricula: { valor: 60.00, pago: true, data: '2026-01-10', forma: 'PIX' },
        taxaMaterial: { valor: 90.00, pago: true, data: '2026-01-10', forma: 'PIX' },
        taxaFormatura: { valor: 150.00, pago: true, data: '2026-08-01', forma: 'PIX' },
        statusGeral: 'em_dia',
        observacoes: 'Taxas 100% quitadas com comprovantes arquivados na tesouraria.'
    }
];

export const AVISOS_EXEMPLO: AvisoTurma[] = [
    {
        id: 'aviso_01',
        turmaId: 'turma_dc_2026_1',
        turmaNome: 'Turma de Formação Diaconal 2026.1',
        titulo: '📅 Data Limite para Envio do Relatório de Estágio da Santa Ceia',
        mensagem: 'Caros aspirantes ao Diaconato, informamos que o envio da ficha de estágio prático da última Santa Ceia deve ser submetido até o dia 25 deste mês pelo portal do aluno.',
        dataPublicacao: '2026-08-10',
        autorNome: 'Coordenação Pedagógica / Pr. Carlos Eduardo',
        fixado: true,
        urgencia: 'alta'
    },
    {
        id: 'aviso_02',
        turmaId: 'turma_dc_2026_1',
        turmaNome: 'Turma de Formação Diaconal 2026.1',
        titulo: '📖 Simulado Geral CPAD Agendado para o Próximo Sábado',
        mensagem: 'Todos os alunos realizarão o Simulado de Fixação Doutrinária contendo 10 questões dos Capítulos 11 a 14 da Declaração de Fé. Estejam em oração e revisem os módulos.',
        dataPublicacao: '2026-08-12',
        autorNome: 'Secretaria de Ensino',
        fixado: false,
        urgencia: 'normal'
    }
];

export const BANCO_QUESTOES_EXEMPLO: QuestaoBanco[] = [
    {
        id: 'qb_01',
        nivelId: 'diacono',
        disciplinaId: 'dc_01',
        disciplinaTitulo: 'Módulo 1: Diaconia Bíblica & Origem Histórica em Atos 6',
        enunciado: 'Segundo Atos 6:3 e a Declaração de Fé da CGADB, quais são os três requisitos basilares exigidos para a escolha dos primeiros diáconos na Igreja Primitiva?',
        opcoes: [
            'Boa reputação (testemunho irrepreensível), cheios do Espírito Santo e de sabedoria prática.',
            'Alto poder aquisitivo, fluência em grego e eloquência oratória pública.',
            'Idade superior a 50 anos, cargo político e posse de terras na Judeia.',
            'Exclusivamente ser parente consanguíneo de um dos doze apóstolos.'
        ],
        respostaCorreta: 0,
        explicacao: 'Atos 6:3 registra: "Escolhei, pois, irmãos, dentre vós, sete varões de boa reputação, cheios do Espírito Santo e de sabedoria, aos quais constituamos sobre este importante negócio."',
        tipo: 'multipla_escolha',
        dificuldade: 'facil',
        criadoPor: 'Pr. Carlos Eduardo',
        dataCriacao: '2026-06-01'
    },
    {
        id: 'qb_02',
        nivelId: 'diacono',
        disciplinaId: 'dc_03',
        disciplinaTitulo: 'Módulo 3: O Serviço Solene na Mesa do Senhor',
        enunciado: 'Qual é a posição oficial pentecostal clássica da CGADB quanto à Ceia do Senhor em relação aos elementos e à sua natureza espiritual?',
        opcoes: [
            'Transubstanciação literal dos elementos no corpo físico e sangue de Cristo.',
            'Memorial sagrado e celebração de comunhão espiritual pela fé na presença viva de Jesus.',
            'Um mero almoço de confraternização secular desprovido de solenidade.',
            'Consubstanciação luterana com presença física coexistente no pão.'
        ],
        respostaCorreta: 1,
        explicacao: 'A Declaração de Fé das Assembleias de Deus ensina que a Ceia é uma ordenança de caráter memorial e espiritual, celebrando o sacrifício vicário de Cristo até que Ele venha (1 Co 11:23-26).',
        tipo: 'multipla_escolha',
        dificuldade: 'medio',
        criadoPor: 'Pr. Carlos Eduardo',
        dataCriacao: '2026-06-05'
    },
    {
        id: 'qb_03',
        nivelId: 'presbitero',
        disciplinaId: 'pb_01',
        disciplinaTitulo: 'Módulo 1: Teontologia & Trindade',
        enunciado: 'Qual heresia antiga afirmava que o Pai, o Filho e o Espírito Santo seriam apenas três "modos" ou máscaras temporárias de uma única pessoa divina, sendo terminantemente refutada pela ortodoxia trinitária?',
        opcoes: [
            'Modalismo / Sabelianismo',
            'Pelagianismo',
            'Nestorianismo',
            'Apolinarianismo'
        ],
        respostaCorreta: 0,
        explicacao: 'O Modalismo ou Sabelianismo negava a subsistência eterna de três pessoas distintas na Trindade, heresia combatida e condenada pelos concílios e pela doutrina bíblica.',
        tipo: 'multipla_escolha',
        dificuldade: 'avancado',
        criadoPor: 'Pr. Josué Mendes',
        dataCriacao: '2026-06-10'
    }
];

export const PROVAS_CUSTOMIZADAS_EXEMPLO: ProvaCustomizada[] = [
    {
        id: 'prova_custom_01',
        titulo: 'Exame Oficial de Qualificação Diaconal (1º Semestre 2026)',
        turmaId: 'turma_dc_2026_1',
        nivelId: 'diacono',
        questoesIds: ['qb_01', 'qb_02'],
        notaMinima: 7.0,
        tempoMinutos: 60,
        dataAplicacao: '2026-08-20',
        status: 'agendada'
    }
];

export const MOCK_TURMAS_INICIAIS = TURMAS_EXEMPLO;
export const MOCK_TUTORES_INICIAIS = TUTORES_EXEMPLO;
export const MOCK_ENCONTROS_INICIAIS = ENCONTROS_EXEMPLO;
export const MOCK_FINANCEIRO_INICIAIS = FINANCEIRO_EXEMPLO;
export const MOCK_AVISOS_INICIAIS = AVISOS_EXEMPLO;
export const MOCK_BANCO_QUESTOES_INICIAIS = BANCO_QUESTOES_EXEMPLO;
export const MOCK_PROVAS_CUSTOMIZADAS_INICIAIS = PROVAS_CUSTOMIZADAS_EXEMPLO;


