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
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    foto?: string;
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

