import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { 
    Button, FormInput, FormSelect, formatDateLocal, getTodayDate, 
    resizeImageAndCompress, copyToClipboard, playMenuSound, playNotificationSound
} from '../utils/sharedHelpers';
import { ChurchContext } from '../context/ChurchContext';
import { 
    GraduationCap, BookOpen, CheckCircle, Clock, Award, Shield, 
    Users, FileText, CheckCircle2, XCircle, AlertCircle, Plus, 
    Search, Filter, ChevronRight, ChevronLeft, Upload, Camera, 
    Printer, Sparkles, HelpCircle, Star, MessageSquare, Send,
    UserCheck, BookCheck, ShieldAlert, FileCheck, Check, 
    RefreshCw, Layers, ArrowLeft, Eye, Edit3, Trash2, Smartphone,
    Calendar, DollarSign, QrCode, Bell, BarChart2, CheckSquare,
    MessageCircle, UserPlus, FileDown, Download, Share2, ClipboardList,
    TrendingUp, AlertTriangle, Play, Pause, ListFilter
} from 'lucide-react';
import { 
    collection, doc, setDoc, addDoc, getDocs, onSnapshot, query, updateDoc 
} from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import { 
    NIVEIS_MINISTERIAIS, DISCIPLINAS_CURRICULARES, 
    MOCK_CANDIDATOS_INICIAIS, MOCK_REGISTROS_ESTAGIO, 
    MOCK_TRABALHOS_ACADEMICOS, MOCK_SESSOES_MENTORIA,
    MOCK_TURMAS_INICIAIS, MOCK_TUTORES_INICIAIS,
    MOCK_ENCONTROS_INICIAIS, MOCK_FINANCEIRO_INICIAIS,
    MOCK_AVISOS_INICIAIS, MOCK_BANCO_QUESTOES_INICIAIS,
    MOCK_PROVAS_CUSTOMIZADAS_INICIAIS,
    CandidatoObreiro, RegistroEstagio, TrabalhoAcademico, SessaoMentoria,
    DisciplinaObreiro, LicaoObreiro, TurmaFormacao, TutorFormacao,
    EncontroAula, FinanceiroCandidato, AvisoTurma, QuestaoBanco,
    ProvaCustomizada
} from '../data/ModuleFormacaoObreirosData';
import { TabTurmasCronograma } from './formacao/TabTurmasCronograma';
import { TabTutoresDocentes } from './formacao/TabTutoresDocentes';
import { TabFrequenciaEncontros } from './formacao/TabFrequenciaEncontros';
import { TabFinanceiroFormacao } from './formacao/TabFinanceiroFormacao';
import { TabAvisosLembretes } from './formacao/TabAvisosLembretes';
import { TabAnalyticsAtaTurma } from './formacao/TabAnalyticsAtaTurma';
import { TabBancoQuestoesProvas } from './formacao/TabBancoQuestoesProvas';
import { TabDossiePastoral } from './formacao/TabDossiePastoral';
import { TabDocumentosOficiais } from './formacao/TabDocumentosOficiais';
import { TabEstagioSupervisionado } from './formacao/TabEstagioSupervisionado';
import { BibleReferenceModal } from './BibleReferenceModal';

interface ModuleFormacaoObreirosProps {
    initialViewMode?: 'coordenador' | 'candidato';
    candidateUser?: any;
}

export default function ModuleFormacaoObreiros({ initialViewMode = 'coordenador', candidateUser }: ModuleFormacaoObreirosProps) {
    const { 
        db, user, addToast, setPrintMode, setPrintData, setPreviewOpen, 
        dbFirestore, appId, logAction 
    } = useContext(ChurchContext);

    // ==========================================
    // ESTADO DA JANELA / MODAL DE REFERÊNCIA BÍBLICA
    // ==========================================
    const [bibleModalOpen, setBibleModalOpen] = useState(false);
    const [bibleModalQuery, setBibleModalQuery] = useState('');

    const handleOpenBibleRef = (refQuery: string) => {
        setBibleModalQuery(refQuery);
        setBibleModalOpen(true);
    };

    // ==========================================
    // ESTADOS PRINCIPAIS DE NAVEGAÇÃO & VISÃO
    // ==========================================
    const [viewMode, setViewMode] = useState<'coordenador' | 'candidato'>(initialViewMode || (candidateUser ? 'candidato' : 'coordenador'));
    const [activeTab, setActiveTab] = useState<
        | 'dashboard' 
        | 'dossie'
        | 'documentos'
        | 'turmas' 
        | 'tutores' 
        | 'frequencia' 
        | 'financeiro' 
        | 'avisos' 
        | 'relatorios_lms' 
        | 'banco_questoes' 
        | 'teoria' 
        | 'provas' 
        | 'trabalhos' 
        | 'estagio' 
        | 'mentoria' 
        | 'workflow'
    >('dashboard');
    const [selectedNivelId, setSelectedNivelId] = useState<'auxiliar' | 'diacono' | 'presbitero' | 'evangelista' | 'pastor'>('diacono');
    const [selectedCandidatoId, setSelectedCandidatoId] = useState<string>('cand_001');

    // Ref e rolagem suave das abas
    const tabsScrollRef = useRef<HTMLDivElement>(null);
    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsScrollRef.current) {
            const scrollAmount = direction === 'left' ? -280 : 280;
            tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Estados de Leitura Teórica e Apostilas Paginadas (5 páginas)
    const [selectedDisciplina, setSelectedDisciplina] = useState<DisciplinaObreiro | null>(null);
    const [selectedLicao, setSelectedLicao] = useState<LicaoObreiro | null>(null);
    const [activePageIndex, setActivePageIndex] = useState<number>(0);
    const [modoLeituraContinua, setModoLeituraContinua] = useState<boolean>(false);
    const [fontScale, setFontScale] = useState<'normal' | 'large'>('normal');
    const [licoesConcluidas, setLicoesConcluidas] = useState<string[]>([]);
    const [quizRespostas, setQuizRespostas] = useState<Record<number, number>>({});
    const [quizFinalizado, setQuizFinalizado] = useState(false);

    // Estados de Provas
    const [showProvaModal, setShowProvaModal] = useState(false);
    const [notaForm, setNotaForm] = useState({ nota: '9.0', feedback: '' });
    const [editingTrabalhoId, setEditingTrabalhoId] = useState<string | null>(null);

    // Estados de Estágio Prático
    const [showNovoEstagioModal, setShowNovoEstagioModal] = useState(false);
    const [estagioForm, setEstagioForm] = useState({
        tipoAtividade: 'santa_ceia',
        titulo: '',
        descricao: '',
        dataAtividade: getTodayDate(),
        horas: 4,
        local: 'Templo Sede',
        fotoComprovante: ''
    });

    // Estados de Trabalho Acadêmico
    const [showNovoTrabalhoModal, setShowNovoTrabalhoModal] = useState(false);
    const [trabalhoForm, setTrabalhoForm] = useState({
        disciplinaId: '',
        titulo: '',
        conteudoTexto: ''
    });

    // Estados de Mentoria
    const [showNovaMentoriaModal, setShowNovaMentoriaModal] = useState(false);
    const [showNovoCandidatoModal, setShowNovoCandidatoModal] = useState(false);
    const [selectedMembroCandidatoId, setSelectedMembroCandidatoId] = useState('');
    const [formNovoCandidato, setFormNovoCandidato] = useState({
        nome: '',
        cpf: '',
        telefone: '',
        email: '',
        cargoAtual: 'Membro',
        congregacaoNome: 'Sede Principal',
        nivelPretendido: 'diacono' as 'auxiliar' | 'diacono' | 'presbitero' | 'evangelista' | 'pastor',
        mentorNome: 'Pr. Carlos Eduardo'
    });
    const [mentoriaForm, setMentoriaForm] = useState({
        temaAbordado: '',
        pontosFortes: '',
        pontosDesenvolver: '',
        avaliacaoCaraterVidaFamiliar: 'Excelente',
        avaliacaoFidelidadeDoutrinaria: 'Excelente',
        parecerGeral: '',
        recomendadoConsagracao: true
    });

    // Busca e Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroNivel, setFiltroNivel] = useState('todos');

    // ==========================================
    // CANDIDATO PADRÃO DE SEGURANÇA
    // ==========================================
    const DEFAULT_CANDIDATO: CandidatoObreiro = useMemo(() => ({
        id: 'cand_001',
        nome: 'Candidato a Obreiro',
        cpf: '000.000.000-00',
        telefone: '(11) 99999-9999',
        email: 'candidato@igreja.com',
        nivelAtual: 'Membro',
        nivelPretendido: 'diacono',
        dataIngresso: '2026-01-01',
        statusTrilha: 'cursando',
        progressoTeorico: 0,
        mediaProvas: 8.5,
        horasEstagioCumpridas: 0,
        trabalhosEntregues: 0,
        totalTrabalhosExigidos: 4,
        workflowStatus: {
            teoriaConcluida: false,
            provasAprovadas: false,
            trabalhosAprovados: false,
            estagioHomologado: false,
            mentoriaAprovada: false,
            entrevistaPastor: false,
            aprovadoAssembleia: false,
        }
    }), []);

    // ==========================================
    // DADOS PERSISTIDOS COM FALLBACK SEED
    // ==========================================
    const [candidatos, setCandidatos] = useState<CandidatoObreiro[]>(MOCK_CANDIDATOS_INICIAIS);
    const [estagios, setEstagios] = useState<RegistroEstagio[]>(MOCK_REGISTROS_ESTAGIO);
    const [trabalhos, setTrabalhos] = useState<TrabalhoAcademico[]>(MOCK_TRABALHOS_ACADEMICOS);
    const [mentorias, setMentorias] = useState<SessaoMentoria[]>(MOCK_SESSOES_MENTORIA);
    
    // Estados LMS (Melhorias 1 a 7)
    const [turmas, setTurmas] = useState<TurmaFormacao[]>(MOCK_TURMAS_INICIAIS);
    const [tutores, setTutores] = useState<TutorFormacao[]>(MOCK_TUTORES_INICIAIS);
    const [encontros, setEncontros] = useState<EncontroAula[]>(MOCK_ENCONTROS_INICIAIS);
    const [financeiroList, setFinanceiroList] = useState<FinanceiroCandidato[]>(MOCK_FINANCEIRO_INICIAIS);
    const [avisos, setAvisos] = useState<AvisoTurma[]>(MOCK_AVISOS_INICIAIS);
    const [bancoQuestoes, setBancoQuestoes] = useState<QuestaoBanco[]>(MOCK_BANCO_QUESTOES_INICIAIS);
    const [provasCustomizadas, setProvasCustomizadas] = useState<ProvaCustomizada[]>(MOCK_PROVAS_CUSTOMIZADAS_INICIAIS);
    const [loadingData, setLoadingData] = useState(false);

    // Carregar do Firestore com sanitização estrita
    useEffect(() => {
        if (!dbFirestore || !appId) return;

        // Candidatos
        const unsubCand = onSnapshot(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_candidatos'), (snap) => {
            if (!snap.empty) {
                const list: CandidatoObreiro[] = [];
                snap.forEach(d => {
                    const data = d.data();
                    if (data) {
                        list.push({
                            ...DEFAULT_CANDIDATO,
                            id: d.id,
                            ...data,
                            nome: data.nome || 'Candidato',
                            nivelPretendido: data.nivelPretendido || 'diacono',
                            statusTrilha: data.statusTrilha || 'cursando',
                            progressoTeorico: typeof data.progressoTeorico === 'number' ? data.progressoTeorico : 0,
                            mediaProvas: typeof data.mediaProvas === 'number' ? data.mediaProvas : 8.5,
                            workflowStatus: {
                                ...DEFAULT_CANDIDATO.workflowStatus,
                                ...(data.workflowStatus || {})
                            }
                        } as CandidatoObreiro);
                    }
                });
                if (list.length > 0) setCandidatos(list);
            }
        });

        // Estágios
        const unsubEst = onSnapshot(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_estagios'), (snap) => {
            if (!snap.empty) {
                const list: RegistroEstagio[] = [];
                snap.forEach(d => list.push({ id: d.id, ...d.data() } as RegistroEstagio));
                if (list.length > 0) setEstagios(list);
            }
        });

        // Trabalhos
        const unsubTrab = onSnapshot(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_trabalhos'), (snap) => {
            if (!snap.empty) {
                const list: TrabalhoAcademico[] = [];
                snap.forEach(d => list.push({ id: d.id, ...d.data() } as TrabalhoAcademico));
                if (list.length > 0) setTrabalhos(list);
            }
        });

        // Mentorias
        const unsubMent = onSnapshot(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_mentorias'), (snap) => {
            if (!snap.empty) {
                const list: SessaoMentoria[] = [];
                snap.forEach(d => list.push({ id: d.id, ...d.data() } as SessaoMentoria));
                if (list.length > 0) setMentorias(list);
            }
        });

        // Turmas LMS
        const unsubTurmas = onSnapshot(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_turmas'), (snap) => {
            if (!snap.empty) {
                const list: TurmaFormacao[] = [];
                snap.forEach(d => list.push({ id: d.id, ...d.data() } as TurmaFormacao));
                if (list.length > 0) setTurmas(list);
            }
        });

        // Tutores LMS
        const unsubTutores = onSnapshot(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_tutores'), (snap) => {
            if (!snap.empty) {
                const list: TutorFormacao[] = [];
                snap.forEach(d => list.push({ id: d.id, ...d.data() } as TutorFormacao));
                if (list.length > 0) setTutores(list);
            }
        });

        // Encontros LMS
        const unsubEnc = onSnapshot(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_encontros'), (snap) => {
            if (!snap.empty) {
                const list: EncontroAula[] = [];
                snap.forEach(d => list.push({ id: d.id, ...d.data() } as EncontroAula));
                if (list.length > 0) setEncontros(list);
            }
        });

        // Financeiro LMS
        const unsubFin = onSnapshot(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_financeiro'), (snap) => {
            if (!snap.empty) {
                const list: FinanceiroCandidato[] = [];
                snap.forEach(d => list.push({ id: d.id, ...d.data() } as FinanceiroCandidato));
                if (list.length > 0) setFinanceiroList(list);
            }
        });

        // Avisos LMS
        const unsubAvisos = onSnapshot(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_avisos'), (snap) => {
            if (!snap.empty) {
                const list: AvisoTurma[] = [];
                snap.forEach(d => list.push({ id: d.id, ...d.data() } as AvisoTurma));
                if (list.length > 0) setAvisos(list);
            }
        });

        // Banco de Questões
        const unsubQuestoes = onSnapshot(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_banco_questoes'), (snap) => {
            if (!snap.empty) {
                const list: QuestaoBanco[] = [];
                snap.forEach(d => list.push({ id: d.id, ...d.data() } as QuestaoBanco));
                if (list.length > 0) setBancoQuestoes(list);
            }
        });

        // Provas Customizadas
        const unsubProvas = onSnapshot(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_provas_customizadas'), (snap) => {
            if (!snap.empty) {
                const list: ProvaCustomizada[] = [];
                snap.forEach(d => list.push({ id: d.id, ...d.data() } as ProvaCustomizada));
                if (list.length > 0) setProvasCustomizadas(list);
            }
        });

        return () => {
            unsubCand();
            unsubEst();
            unsubTrab();
            unsubMent();
            unsubTurmas();
            unsubTutores();
            unsubEnc();
            unsubFin();
            unsubAvisos();
            unsubQuestoes();
            unsubProvas();
        };
    }, [dbFirestore, appId, DEFAULT_CANDIDATO]);

    // Candidato atualmente focado com total proteção
    const candidatoAtivo: CandidatoObreiro = useMemo(() => {
        const found = (candidatos || []).find(c => c && c.id === selectedCandidatoId) || (candidatos && candidatos[0]) || MOCK_CANDIDATOS_INICIAIS[0] || DEFAULT_CANDIDATO;
        return {
            ...DEFAULT_CANDIDATO,
            ...found,
            nome: found?.nome || 'Candidato a Obreiro',
            nivelPretendido: (found?.nivelPretendido || 'diacono') as 'auxiliar' | 'diacono' | 'presbitero' | 'evangelista' | 'pastor',
            statusTrilha: found?.statusTrilha || 'cursando',
            progressoTeorico: typeof found?.progressoTeorico === 'number' ? found.progressoTeorico : 0,
            mediaProvas: typeof found?.mediaProvas === 'number' ? found.mediaProvas : 8.5,
            workflowStatus: {
                ...DEFAULT_CANDIDATO.workflowStatus,
                ...(found?.workflowStatus || {})
            }
        };
    }, [candidatos, selectedCandidatoId, DEFAULT_CANDIDATO]);

    // Nível atual selecionado
    const nivelAtivo = useMemo(() => {
        return NIVEIS_MINISTERIAIS.find(n => n.id === selectedNivelId) || NIVEIS_MINISTERIAIS[1];
    }, [selectedNivelId]);

    // Disciplinas do nível selecionado
    const disciplinasDoNivel = useMemo(() => {
        return DISCIPLINAS_CURRICULARES.filter(d => d.nivelId === selectedNivelId);
    }, [selectedNivelId]);

    // Estágios do candidato selecionado
    const estagiosDoCandidato = useMemo(() => {
        return estagios.filter(e => e.candidatoId === candidatoAtivo.id);
    }, [estagios, candidatoAtivo]);

    // Total de Horas Aprovadas
    const totalHorasAprovadas = useMemo(() => {
        return estagiosDoCandidato
            .filter(e => e.status === 'aprovado')
            .reduce((acc, curr) => acc + (Number(curr.horas) || 0), 0);
    }, [estagiosDoCandidato]);

    // Trabalhos do candidato selecionado
    const trabalhosDoCandidato = useMemo(() => {
        return trabalhos.filter(t => t.candidatoId === candidatoAtivo.id);
    }, [trabalhos, candidatoAtivo]);

    // Mentorias do candidato selecionado
    const mentoriasDoCandidato = useMemo(() => {
        return mentorias.filter(m => m.candidatoId === candidatoAtivo.id);
    }, [mentorias, candidatoAtivo]);

    // ==========================================
    // AÇÕES MANUAIS DE GESTÃO (SALVAR/APROVAR)
    // ==========================================

    // Aprovar / Rejeitar Estágio Prático Manualmente
    const handleAprovarEstagio = async (estagioId: string, novoStatus: 'aprovado' | 'rejeitado') => {
        try {
            const avaliadorNome = user?.nome || 'Pastor Supervisor';
            const updated = {
                status: novoStatus,
                avaliadorId: user?.id || 'pastor',
                avaliadorNome,
                dataAvaliacao: getTodayDate()
            };

            // Atualização no Firestore
            if (dbFirestore && appId) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_estagios', estagioId), updated, { merge: true });
            }

            // Atualização local de fallback
            setEstagios(prev => prev.map(e => e.id === estagioId ? { ...e, ...updated } : e));
            addToast(`Estágio ${novoStatus === 'aprovado' ? 'Aprovado' : 'Rejeitado'} com sucesso!`, 'success');
            logAction('VALIDAÇÃO', `Pastor ${avaliadorNome} alterou status do estágio ${estagioId} para ${novoStatus}`, 'formacao_estagios', estagioId);
        } catch (error) {
            console.error(error);
            addToast("Erro ao atualizar estágio.", "error");
        }
    };

    // Submeter Novo Registro de Estágio Prático (Mobile-First)
    const handleCriarEstagio = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!estagioForm.titulo) {
            addToast("Informe o título da atividade prática.", "error");
            return;
        }

        try {
            const novoEstagio: RegistroEstagio = {
                id: `est_${Date.now()}`,
                candidatoId: candidatoAtivo.id,
                candidatoNome: candidatoAtivo.nome,
                nivelId: candidatoAtivo.nivelPretendido,
                tipoAtividade: estagioForm.tipoAtividade as any,
                titulo: estagioForm.titulo,
                descricao: estagioForm.descricao,
                dataAtividade: estagioForm.dataAtividade,
                horas: Number(estagioForm.horas) || 1,
                local: estagioForm.local,
                fotoComprovante: estagioForm.fotoComprovante,
                status: 'pendente'
            };

            if (dbFirestore && appId) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_estagios', novoEstagio.id), novoEstagio);
            }

            setEstagios(prev => [novoEstagio, ...prev]);
            setShowNovoEstagioModal(false);
            setEstagioForm({
                tipoAtividade: 'santa_ceia',
                titulo: '',
                descricao: '',
                dataAtividade: getTodayDate(),
                horas: 4,
                local: 'Templo Sede',
                fotoComprovante: ''
            });
            addToast("Atividade prática registrada! Aguardando homologação manual do pastor.", "success");
            logAction('CADASTRO', `Candidato ${candidatoAtivo.nome} submeteu relatório de estágio: ${novoEstagio.titulo}`, 'formacao_estagios', novoEstagio.id);
        } catch (err) {
            console.error(err);
            addToast("Erro ao registrar estágio.", "error");
        }
    };

    // Submeter Trabalho Acadêmico
    const handleCriarTrabalho = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trabalhoForm.titulo || !trabalhoForm.conteudoTexto) {
            addToast("Preencha título e conteúdo do trabalho.", "error");
            return;
        }

        const disc = disciplinasDoNivel.find(d => d.id === trabalhoForm.disciplinaId) || disciplinasDoNivel[0];

        try {
            const novoTrab: TrabalhoAcademico = {
                id: `trab_${Date.now()}`,
                candidatoId: candidatoAtivo.id,
                candidatoNome: candidatoAtivo.nome,
                disciplinaId: disc ? disc.id : 'geral',
                disciplinaTitulo: disc ? disc.titulo : 'Teologia Geral',
                titulo: trabalhoForm.titulo,
                conteudoTexto: trabalhoForm.conteudoTexto,
                dataEnvio: getTodayDate(),
                status: 'pendente'
            };

            if (dbFirestore && appId) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_trabalhos', novoTrab.id), novoTrab);
            }

            setTrabalhos(prev => [novoTrab, ...prev]);
            setShowNovoTrabalhoModal(false);
            setTrabalhoForm({ disciplinaId: '', titulo: '', conteudoTexto: '' });
            addToast("Trabalho acadêmico enviado para análise pastoral!", "success");
            logAction('CADASTRO', `Candidato ${candidatoAtivo.nome} entregou trabalho acadêmico: ${novoTrab.titulo}`, 'formacao_trabalhos', novoTrab.id);
        } catch (err) {
            console.error(err);
            addToast("Erro ao submeter trabalho.", "error");
        }
    };

    // Avaliar Trabalho Acadêmico com Nota e Parecer Pastoral Manual
    const handleAvaliarTrabalho = async () => {
        if (!editingTrabalhoId) return;
        try {
            const notaNum = parseFloat(notaForm.nota) || 0;
            const updated = {
                status: (notaNum >= 7.0 ? 'aprovado' : 'necessita_revisao') as any,
                nota: notaNum,
                feedbackPastor: notaForm.feedback || 'Avaliado de acordo com as diretrizes teológicas da CPAD.',
                avaliadorNome: user?.nome || 'Pastor Examinador',
                dataAvaliacao: getTodayDate()
            };

            if (dbFirestore && appId) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_trabalhos', editingTrabalhoId), updated, { merge: true });
            }

            setTrabalhos(prev => prev.map(t => t.id === editingTrabalhoId ? { ...t, ...updated } : t));
            setEditingTrabalhoId(null);
            setNotaForm({ nota: '9.0', feedback: '' });
            addToast("Avaliação do trabalho registrada com sucesso!", "success");
            logAction('AVALIAÇÃO', `Pastor atribuiu nota ${notaNum} ao trabalho ${editingTrabalhoId}`, 'formacao_trabalhos', editingTrabalhoId);
        } catch (err) {
            console.error(err);
            addToast("Erro ao avaliar trabalho.", "error");
        }
    };

    // Registrar Sessão de Mentoria Pastoral
    const handleCriarMentoria = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mentoriaForm.temaAbordado || !mentoriaForm.parecerGeral) {
            addToast("Preencha o tema e o parecer pastoral.", "error");
            return;
        }

        try {
            const novaMent: SessaoMentoria = {
                id: `ment_${Date.now()}`,
                candidatoId: candidatoAtivo.id,
                candidatoNome: candidatoAtivo.nome,
                mentorId: user?.id || 'pastor',
                mentorNome: user?.nome || 'Pastor Mentor',
                dataSessao: getTodayDate(),
                temaAbordado: mentoriaForm.temaAbordado,
                pontosFortes: mentoriaForm.pontosFortes,
                pontosDesenvolver: mentoriaForm.pontosDesenvolver,
                avaliacaoCaraterVidaFamiliar: mentoriaForm.avaliacaoCaraterVidaFamiliar as any,
                avaliacaoFidelidadeDoutrinaria: mentoriaForm.avaliacaoFidelidadeDoutrinaria as any,
                parecerGeral: mentoriaForm.parecerGeral,
                recomendadoConsagracao: mentoriaForm.recomendadoConsagracao
            };

            if (dbFirestore && appId) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_mentorias', novaMent.id), novaMent);
            }

            setMentorias(prev => [novaMent, ...prev]);
            setShowNovaMentoriaModal(false);
            setMentoriaForm({
                temaAbordado: '',
                pontosFortes: '',
                pontosDesenvolver: '',
                avaliacaoCaraterVidaFamiliar: 'Excelente',
                avaliacaoFidelidadeDoutrinaria: 'Excelente',
                parecerGeral: '',
                recomendadoConsagracao: true
            });
            addToast("Sessão de mentoria pastoral registrada com sigilo santo!", "success");
            logAction('MENTORIA', `Pastor registrou parecer de mentoria para ${candidatoAtivo.nome}`, 'formacao_mentorias', novaMent.id);
        } catch (err) {
            console.error(err);
            addToast("Erro ao registrar mentoria.", "error");
        }
    };

    // Atualizar Etapa do Workflow de Consagração Manualmente
    const handleToggleWorkflowStep = async (stepKey: keyof CandidatoObreiro['workflowStatus']) => {
        try {
            const currentVal = candidatoAtivo.workflowStatus[stepKey];
            const updatedWorkflow = {
                ...candidatoAtivo.workflowStatus,
                [stepKey]: !currentVal
            };

            // Recalcular status geral da trilha
            const todosAprovados = Object.values(updatedWorkflow).every(v => v === true);
            const novoStatusTrilha = todosAprovados ? 'pronto_consagracao' : 'cursando';

            const updatedCand = {
                workflowStatus: updatedWorkflow,
                statusTrilha: novoStatusTrilha
            };

            if (dbFirestore && appId) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_candidatos', candidatoAtivo.id), updatedCand, { merge: true });
            }

            setCandidatos(prev => prev.map(c => c.id === candidatoAtivo.id ? { ...c, ...updatedCand } : c));
            addToast(`Etapa "${stepKey}" atualizada manualmente.`, "success");
            logAction('WORKFLOW', `Pastor alterou etapa ${stepKey} do candidato ${candidatoAtivo.nome} para ${!currentVal}`, 'formacao_candidatos', candidatoAtivo.id);
        } catch (err) {
            console.error(err);
            addToast("Erro ao atualizar workflow.", "error");
        }
    };

    // Salvar Dossiê Canônico de Idoneidade (1 Tm 3 e Tito 1)
    const handleSalvarDossieCanonico = async (candidatoId: string, dossieData: CandidatoObreiro['dossieCanonico']) => {
        try {
            const updated = {
                dossieCanonico: dossieData
            };

            if (dbFirestore && appId) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_candidatos', candidatoId), updated, { merge: true });
            }

            setCandidatos(prev => prev.map(c => c.id === candidatoId ? { ...c, ...updated } : c));
            addToast("Dossiê Canônico de Idoneidade Ministerial salvo com sucesso!", "success");
            logAction('DOSSIE_CANONICO', `Pastor salvou parecer e dossiê pastoral para ${candidatoAtivo.nome}`, 'formacao_candidatos', candidatoId);
        } catch (err) {
            console.error(err);
            addToast("Erro ao salvar dossiê canônico.", "error");
        }
    };

    // Efetivar Consagração Oficial no Cadastro de Membros da Igreja
    const handleEfetivarConsagracaoNoCadastro = async (candidato: CandidatoObreiro) => {
        try {
            const novoCargo = nivelAtivo.nome.toUpperCase();
            const dataHoje = getTodayDate();

            // 1. Atualizar o candidato na formação de obreiros para "consagrado"
            const updatedCand: Partial<CandidatoObreiro> = {
                statusTrilha: 'consagrado',
                workflowStatus: {
                    teoriaConcluida: true,
                    provasAprovadas: true,
                    trabalhosAprovados: true,
                    estagioHomologado: true,
                    mentoriaAprovada: true,
                    entrevistaPastor: true,
                    aprovadoAssembleia: true
                },
                dossieCanonico: {
                    ...(candidato.dossieCanonico || {} as any),
                    dataConsagracaoOficial: dataHoje,
                    aprovadoPresbiterio: true
                }
            };

            if (dbFirestore && appId) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_candidatos', candidato.id), updatedCand, { merge: true });
            }
            setCandidatos(prev => prev.map(c => c.id === candidato.id ? { ...c, ...updatedCand } : c));

            // 2. Se houver vínculo de membroId ou correspondência na base de membros da igreja
            let targetMembroId = candidato.membroId;
            if (!targetMembroId && db?.membros && db.membros.length > 0) {
                const match = db.membros.find((m: any) => 
                    (candidato.cpf && m.cpf && m.cpf === candidato.cpf) ||
                    (m.nome && m.nome.toLowerCase().trim() === candidato.nome.toLowerCase().trim())
                );
                if (match) {
                    targetMembroId = match.id;
                }
            }

            if (targetMembroId && dbFirestore && appId) {
                const updatedMembro = {
                    cargo: novoCargo,
                    data_consagracao: dataHoje,
                    ultima_atualizacao: new Date().toISOString()
                };

                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', targetMembroId), updatedMembro, { merge: true });
            }

            addToast(`Obreiro(a) ${candidato.nome} CONSAGRADO(A) com sucesso! Cargo atualizado para ${novoCargo} no rol de membros.`, "success");
            logAction('CONSAGRACAO_EFETIVADA', `Consagração solene de ${candidato.nome} para ${novoCargo} homologada no sistema`, 'membros', targetMembroId || candidato.id);
        } catch (err) {
            console.error("Erro ao efetivar consagração:", err);
            addToast("Erro ao atualizar o rol de membros.", "error");
        }
    };

    // Criar / Matricular Novo Candidato a partir da base real de membros
    const handleCriarCandidato = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formNovoCandidato.nome.trim()) {
            addToast("Informe o nome do candidato a obreiro.", "error");
            return;
        }

        try {
            const novoCandidato: CandidatoObreiro = {
                id: `cand_${Date.now()}`,
                membroId: selectedMembroCandidatoId || undefined,
                nome: formNovoCandidato.nome,
                cpf: formNovoCandidato.cpf || '000.000.000-00',
                telefone: formNovoCandidato.telefone || '(11) 99999-9999',
                email: formNovoCandidato.email || 'obreiro@igreja.org.br',
                cargoAtual: formNovoCandidato.cargoAtual || 'Membro',
                congregacaoNome: formNovoCandidato.congregacaoNome || db?.igreja?.nome || 'Sede Principal',
                nivelAtual: formNovoCandidato.cargoAtual || 'Membro',
                nivelPretendido: formNovoCandidato.nivelPretendido,
                mentorNome: formNovoCandidato.mentorNome || 'Pr. Carlos Eduardo',
                dataIngresso: getTodayDate(),
                statusTrilha: 'cursando',
                progressoTeorico: 0,
                mediaProvas: 8.0,
                horasEstagioCumpridas: 0,
                trabalhosEntregues: 0,
                totalTrabalhosExigidos: 4,
                workflowStatus: {
                    teoriaConcluida: false,
                    provasAprovadas: false,
                    trabalhosAprovados: false,
                    estagioHomologado: false,
                    mentoriaAprovada: false,
                    entrevistaPastor: false,
                    aprovadoAssembleia: false
                }
            };

            if (dbFirestore && appId) {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_candidatos', novoCandidato.id), novoCandidato);
            }

            setCandidatos(prev => [novoCandidato, ...prev]);
            setSelectedCandidatoId(novoCandidato.id);
            setSelectedNivelId(novoCandidato.nivelPretendido);
            setShowNovoCandidatoModal(false);
            setFormNovoCandidato({
                nome: '',
                cpf: '',
                telefone: '',
                email: '',
                cargoAtual: 'Membro',
                congregacaoNome: db?.igreja?.nome || 'Sede Principal',
                nivelPretendido: 'diacono',
                mentorNome: 'Pr. Carlos Eduardo'
            });
            setSelectedMembroCandidatoId('');
            addToast(`Obreiro(a) ${novoCandidato.nome} matriculado com sucesso na Formação de Obreiros!`, "success");
            logAction('MATRICULA_OBREIRO', `Membro ${novoCandidato.nome} ingressou na formação para ${novoCandidato.nivelPretendido}`, 'formacao_candidatos', novoCandidato.id);
        } catch (err) {
            console.error(err);
            addToast("Erro ao matricular candidato.", "error");
        }
    };

    // Upload de Foto de Comprovante de Estágio com Compressão
    const handleUploadFotoEstagio = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            const rawBase64 = ev.target?.result as string;
            if (rawBase64) {
                const compressed = await resizeImageAndCompress(rawBase64, 800, 800, 0.7);
                setEstagioForm(prev => ({ ...prev, fotoComprovante: compressed }));
                addToast("Foto do estágio carregada com sucesso!", "success");
            }
        };
        reader.readAsDataURL(file);
    };

    // Efeito para auto-selecionar candidato quando acedido pelo Portal do Membro
    useEffect(() => {
        const targetUser = candidateUser || user;
        if (targetUser && candidatos && candidatos.length > 0) {
            const match = candidatos.find(c => 
                (c.id && (c.id === targetUser.id || c.id === targetUser.membro_id)) ||
                (c.email && targetUser.email && c.email.toLowerCase() === targetUser.email.toLowerCase()) ||
                (c.cpf && targetUser.cpf && c.cpf === targetUser.cpf) ||
                (c.nome && targetUser.nome && c.nome.toLowerCase().trim() === targetUser.nome.toLowerCase().trim())
            );
            if (match) {
                setSelectedCandidatoId(match.id);
                if (match.nivelPretendido) {
                    setSelectedNivelId(match.nivelPretendido);
                }
            }
        }
    }, [candidateUser, user, candidatos]);

    // Gerador de Apostila Teológica Completa em PDF (CGADB / CPAD)
    const gerarApostilaPDF = (disciplina: DisciplinaObreiro, licao?: LicaoObreiro) => {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageHeight = 297;
            const pageWidth = 210;
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);

            let currentY = 20;

            // Barra decorativa superior
            doc.setFillColor(16, 185, 129);
            doc.rect(0, 0, pageWidth, 8, 'F');

            // Cabeçalho Institucional
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(15);
            doc.setTextColor(15, 23, 42);
            doc.text((db.igreja?.nome || 'ASSEMBLEIA DE DEUS').toUpperCase(), margin, currentY);
            currentY += 6;

            doc.setFontSize(9.5);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text('UNIVERSIDADE TEOLÓGICA & ESCOLA DE FORMAÇÃO DE OBREIROS (GIPP / CGADB)', margin, currentY);
            currentY += 8;

            doc.setDrawColor(226, 232, 240);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 8;

            // Título da Disciplina & Módulo
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(16, 185, 129);
            doc.text(disciplina.titulo.toUpperCase(), margin, currentY);
            currentY += 6;

            doc.setFontSize(9.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text(`GRAU: ${nivelAtivo.nome.toUpperCase()}  |  ${disciplina.capituloCGADB}  |  CARGA: ${disciplina.cargaHoraria}H/AULA`, margin, currentY);
            currentY += 6;

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            const ementaSplit = doc.splitTextToSize(`Ementa Curricular: ${disciplina.ementa}`, contentWidth);
            doc.text(ementaSplit, margin, currentY);
            currentY += (ementaSplit.length * 4.2) + 6;

            const licoesParaImprimir = licao ? [licao] : disciplina.licoes;

            licoesParaImprimir.forEach((lic) => {
                if (currentY > pageHeight - 50) {
                    doc.addPage();
                    currentY = 20;
                }

                doc.setFillColor(241, 245, 249);
                doc.roundedRect(margin, currentY, contentWidth, 11, 2, 2, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10.5);
                doc.setTextColor(15, 23, 42);
                doc.text(`LIÇÃO ${lic.numero}: ${lic.titulo.toUpperCase()}`, margin + 4, currentY + 7.5);
                currentY += 16;

                // Renderiza as 5 Páginas Exegéticas
                if (lic.paginas && lic.paginas.length > 0) {
                    lic.paginas.forEach((pag) => {
                        if (currentY > pageHeight - 55) {
                            doc.addPage();
                            currentY = 20;
                        }

                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(9.5);
                        doc.setTextColor(16, 185, 129);
                        doc.text(`Página ${pag.numero}: ${pag.subtitulo}`, margin, currentY);
                        currentY += 5.5;

                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(8.5);
                        doc.setTextColor(51, 65, 85);
                        const splitText = doc.splitTextToSize(pag.conteudo, contentWidth);
                        doc.text(splitText, margin, currentY);
                        currentY += (splitText.length * 4.2) + 4;

                        if (pag.destaqueExegese) {
                            if (currentY > pageHeight - 40) {
                                doc.addPage();
                                currentY = 20;
                            }
                            doc.setFillColor(254, 243, 199);
                            doc.setDrawColor(245, 158, 11);
                            const exegeseSplit = doc.splitTextToSize(`Exegese Doutrinária: ${pag.destaqueExegese}`, contentWidth - 8);
                            const boxHeight = (exegeseSplit.length * 4.0) + 5;
                            doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD');
                            doc.setFont('helvetica', 'italic');
                            doc.setFontSize(8);
                            doc.setTextColor(146, 64, 14);
                            doc.text(exegeseSplit, margin + 4, currentY + 4.5);
                            currentY += boxHeight + 5;
                        }

                        if (pag.pontosChave && pag.pontosChave.length > 0) {
                            if (currentY > pageHeight - 35) {
                                doc.addPage();
                                currentY = 20;
                            }
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(8.5);
                            doc.setTextColor(15, 23, 42);
                            doc.text('Pontos-Chave Dogmáticos:', margin, currentY);
                            currentY += 4.5;
                            doc.setFont('helvetica', 'normal');
                            doc.setFontSize(8);
                            pag.pontosChave.forEach(pt => {
                                const ptSplit = doc.splitTextToSize(`• ${pt}`, contentWidth - 4);
                                doc.text(ptSplit, margin + 2, currentY);
                                currentY += (ptSplit.length * 3.8);
                            });
                            currentY += 3;
                        }
                    });
                } else {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8.5);
                    doc.setTextColor(51, 65, 85);
                    const introSplit = doc.splitTextToSize(lic.introducao, contentWidth);
                    doc.text(introSplit, margin, currentY);
                    currentY += (introSplit.length * 4.2) + 5;
                }

                // Referências Bíblicas
                if (lic.referenciasBiblicas && lic.referenciasBiblicas.length > 0) {
                    if (currentY > pageHeight - 35) {
                        doc.addPage();
                        currentY = 20;
                    }
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(8.5);
                    doc.setTextColor(15, 23, 42);
                    doc.text('Referências Bíblicas Fundamentais:', margin, currentY);
                    currentY += 4.5;
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8);
                    const refsText = lic.referenciasBiblicas.join(' • ');
                    const refsSplit = doc.splitTextToSize(refsText, contentWidth);
                    doc.text(refsSplit, margin, currentY);
                    currentY += (refsSplit.length * 3.8) + 4;
                }

                // Quiz de Fixação
                if (lic.quiz && lic.quiz.length > 0) {
                    if (currentY > pageHeight - 55) {
                        doc.addPage();
                        currentY = 20;
                    }
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(9.5);
                    doc.setTextColor(15, 23, 42);
                    doc.text('Perguntas de Fixação Dogmática & Validação:', margin, currentY);
                    currentY += 5.5;

                    lic.quiz.forEach((q, qIdx) => {
                        if (currentY > pageHeight - 40) {
                            doc.addPage();
                            currentY = 20;
                        }
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(8.5);
                        doc.setTextColor(30, 41, 59);
                        const qSplit = doc.splitTextToSize(`${qIdx + 1}. ${q.pergunta}`, contentWidth);
                        doc.text(qSplit, margin, currentY);
                        currentY += (qSplit.length * 4.0) + 2;

                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(8);
                        q.opcoes.forEach((opc, opcIdx) => {
                            const opcSplit = doc.splitTextToSize(`[  ] ${String.fromCharCode(65 + opcIdx)}) ${opc}`, contentWidth - 4);
                            doc.text(opcSplit, margin + 4, currentY);
                            currentY += (opcSplit.length * 3.8);
                        });
                        currentY += 3;
                    });
                }
            });

            // Numeração de páginas
            const totalPages = doc.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.5);
                doc.setTextColor(148, 163, 184);
                doc.text(`Universidade Teológica GIPP / CGADB • Página ${i} de ${totalPages} • Aluno(a): ${candidatoAtivo.nome}`, margin, pageHeight - 8);
            }

            const cleanFileName = `Apostila_${disciplina.titulo.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.pdf`;
            doc.save(cleanFileName);
            addToast("Apostila Teológica (PDF) gerada com sucesso!", "success");
        } catch (err) {
            console.error("Erro ao gerar PDF da apostila:", err);
            addToast("Erro ao gerar o PDF da apostila.", "error");
        }
    };

    // Gerar e Imprimir Certificado Oficial de Consagração / Diploma Formativo / Credencial Oficial
    const handleImprimirCertificadoOuAta = (tipo: 'certificado' | 'ata' | 'credencial') => {
        const docHash = `GIPP-ORD-${candidatoAtivo.nivelPretendido.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
        const membroVinculado = (db.membros || []).find(m => m.id === candidatoAtivo.membroId || m.nome?.toLowerCase() === candidatoAtivo.nome?.toLowerCase()) || {};
        
        const finalData = {
            igreja: db.igreja || {
                nome: 'Assembleia de Deus — Ministério do Belém',
                cidade: 'São Paulo',
                uf: 'SP',
                pastor: db.igreja?.pastor_presidente || user?.nome || 'Pastor Presidente',
                pastor_presidente: db.igreja?.pastor_presidente || user?.nome || 'Pastor Presidente'
            },
            membro: { 
                id: candidatoAtivo.membroId || candidatoAtivo.id,
                nome: candidatoAtivo.nome, 
                cargo: nivelAtivo.nome.toUpperCase(),
                cpf: candidatoAtivo.cpf || membroVinculado.cpf || '---',
                numero_registro: membroVinculado.numero_registro || `OBR-${candidatoAtivo.id.substring(candidatoAtivo.id.length - 4).toUpperCase()}`,
                data_nascimento: (candidatoAtivo as any).dataNascimento || membroVinculado.data_nascimento || '',
                data_batismo: membroVinculado.data_batismo || '',
                data_admissao: membroVinculado.data_admissao || '',
                nome_pai: membroVinculado.nome_pai || '',
                nome_mae: membroVinculado.nome_mae || '',
                foto: candidatoAtivo.foto || membroVinculado.foto || '',
                congregacao: candidatoAtivo.congregacaoNome || membroVinculado.congregacao || db.igreja?.nome || 'Sede'
            },
            membros: [{
                id: candidatoAtivo.membroId || candidatoAtivo.id,
                nome: candidatoAtivo.nome, 
                cargo: nivelAtivo.nome.toUpperCase(),
                cpf: candidatoAtivo.cpf || membroVinculado.cpf || '---',
                numero_registro: membroVinculado.numero_registro || `OBR-${candidatoAtivo.id.substring(candidatoAtivo.id.length - 4).toUpperCase()}`,
                data_nascimento: (candidatoAtivo as any).dataNascimento || membroVinculado.data_nascimento || '',
                data_batismo: membroVinculado.data_batismo || '',
                data_admissao: membroVinculado.data_admissao || '',
                nome_pai: membroVinculado.nome_pai || '',
                nome_mae: membroVinculado.nome_mae || '',
                foto: candidatoAtivo.foto || membroVinculado.foto || '',
                congregacao: candidatoAtivo.congregacaoNome || membroVinculado.congregacao || db.igreja?.nome || 'Sede'
            }],
            candidato: candidatoAtivo,
            nivel: nivelAtivo,
            extra: { 
                cargo: nivelAtivo.nome.toUpperCase(), 
                nivel: nivelAtivo.nome,
                curso: `Escola de Formação de Obreiros - Nível ${nivelAtivo.nome}`,
                nome_curso: `Curso de Formação Ministerial (${nivelAtivo.sigla})`,
                titular: candidatoAtivo.nome,
                cpf: candidatoAtivo.cpf || membroVinculado.cpf || '---',
                numero_registro: membroVinculado.numero_registro || `OBR-${candidatoAtivo.id.substring(candidatoAtivo.id.length - 4).toUpperCase()}`,
                docHash: docHash,
                horasEstagio: totalHorasAprovadas,
                mediaFinal: (candidatoAtivo.mediaProvas || 9.0).toFixed(1)
            },
            dataConsagracao: formatDateLocal(getTodayDate()),
            pastorPresidente: db.igreja?.pastor_presidente || db.igreja?.pastor || user?.nome || 'Pastor Presidente',
            docHash: docHash,
            horasEstagio: totalHorasAprovadas,
            mediaFinal: candidatoAtivo.mediaProvas || 9.0
        };

        setPrintData(finalData);
        if (tipo === 'certificado') {
            setPrintMode('cert_consagracao');
        } else if (tipo === 'credencial') {
            setPrintMode('carteirinha');
        } else {
            setPrintMode('secretaria_livro_atas');
        }
        setPreviewOpen(true);
        logAction('EMISSÃO', `Gerou documento de ${tipo} para o candidato ${candidatoAtivo.nome}`, 'formacao_obreiros', docHash);
    };

    // ==========================================
    // HANDLERS LMS (GESTÃO DE CURSOS 1 A 7)
    // ==========================================
    const handleSalvarTurma = async (turmaData: Partial<TurmaFormacao>) => {
        if (!turmaData.id) return;
        const exists = turmas.some(t => t.id === turmaData.id);
        const updatedList = exists 
            ? turmas.map(t => t.id === turmaData.id ? { ...t, ...turmaData } as TurmaFormacao : t)
            : [...turmas, turmaData as TurmaFormacao];
        setTurmas(updatedList);

        if (dbFirestore && appId) {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_turmas', turmaData.id), turmaData, { merge: true });
            } catch (err) {
                console.error("Erro ao salvar turma:", err);
            }
        }
    };

    const handleExcluirTurma = async (turmaId: string) => {
        setTurmas(prev => prev.filter(t => t.id !== turmaId));
    };

    const handleMatricularAluno = async (turmaId: string, candidatoId: string) => {
        const turma = turmas.find(t => t.id === turmaId);
        if (!turma) return;
        const jaMatriculado = turma.alunosIds?.includes(candidatoId);
        const newAlunos = jaMatriculado 
            ? (turma.alunosIds || []).filter(id => id !== candidatoId)
            : [...(turma.alunosIds || []), candidatoId];
        
        await handleSalvarTurma({ ...turma, alunosIds: newAlunos });
        addToast(jaMatriculado ? "Matrícula desvinculada." : "Aluno matriculado com sucesso na turma!", "success");
    };

    const handleSalvarTutor = async (tutor: TutorFormacao) => {
        const exists = tutores.some(t => t.id === tutor.id);
        const updatedList = exists
            ? tutores.map(t => t.id === tutor.id ? tutor : t)
            : [...tutores, tutor];
        setTutores(updatedList);

        if (dbFirestore && appId) {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_tutores', tutor.id), tutor, { merge: true });
            } catch (err) {
                console.error("Erro ao salvar tutor:", err);
            }
        }
    };

    const handleAvaliarTrabalhoRapido = async (trabalhoId: string, nota: number, feedback: string) => {
        const updatedTrabs = trabalhos.map(t => {
            if (t.id === trabalhoId) {
                return {
                    ...t,
                    status: (nota >= 7 ? 'aprovado' : 'reprovado') as any,
                    nota,
                    feedbackTutor: feedback,
                    dataAvaliacao: getTodayDate()
                };
            }
            return t;
        });
        setTrabalhos(updatedTrabs);
        addToast(`Trabalho avaliado com nota ${nota.toFixed(1)}!`, "success");
    };

    const handleAprovarEstagioRapido = async (estagioId: string, status: 'aprovado' | 'rejeitado') => {
        const updated = estagios.map(e => e.id === estagioId ? { ...e, status } : e);
        setEstagios(updated);
        addToast(status === 'aprovado' ? "Horas de estágio aprovadas no diário!" : "Estágio devolvido para ajuste.", "info");
    };

    const handleSalvarEncontro = async (encontro: EncontroAula) => {
        const exists = encontros.some(e => e.id === encontro.id);
        const updated = exists ? encontros.map(e => e.id === encontro.id ? encontro : e) : [...encontros, encontro];
        setEncontros(updated);

        if (dbFirestore && appId) {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_encontros', encontro.id), encontro, { merge: true });
            } catch (err) {
                console.error("Erro ao salvar encontro:", err);
            }
        }
    };

    const handleAtualizarPresenca = async (encontroId: string, alunoId: string, presente: boolean) => {
        const updated = encontros.map(enc => {
            if (enc.id === encontroId) {
                const lista = enc.presencas || [];
                const existPres = lista.find(p => p.candidatoId === alunoId);
                let novaLista;
                if (existPres) {
                    novaLista = lista.map(p => p.candidatoId === alunoId ? { ...p, presente } : p);
                } else {
                    novaLista = [...lista, { candidatoId: alunoId, presente }];
                }
                return { ...enc, presencas: novaLista };
            }
            return enc;
        });
        setEncontros(updated);
    };

    const handleSalvarRegistroFinanceiro = async (reg: FinanceiroCandidato) => {
        const exists = financeiroList.some(f => f.id === reg.id);
        const updated = exists ? financeiroList.map(f => f.id === reg.id ? reg : f) : [...financeiroList, reg];
        setFinanceiroList(updated);

        if (dbFirestore && appId) {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_financeiro', reg.id), reg, { merge: true });
            } catch (err) {
                console.error("Erro ao salvar registro financeiro:", err);
            }
        }
    };

    const handleSalvarAviso = async (aviso: AvisoTurma) => {
        const exists = avisos.some(a => a.id === aviso.id);
        const updated = exists ? avisos.map(a => a.id === aviso.id ? aviso : a) : [aviso, ...avisos];
        setAvisos(updated);

        if (dbFirestore && appId) {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_avisos', aviso.id), aviso, { merge: true });
            } catch (err) {
                console.error("Erro ao salvar aviso:", err);
            }
        }
    };

    const handleSalvarQuestao = async (questao: QuestaoBanco) => {
        const exists = bancoQuestoes.some(q => q.id === questao.id);
        const updated = exists ? bancoQuestoes.map(q => q.id === questao.id ? questao : q) : [...bancoQuestoes, questao];
        setBancoQuestoes(updated);

        if (dbFirestore && appId) {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_banco_questoes', questao.id), questao, { merge: true });
            } catch (err) {
                console.error("Erro ao salvar questão:", err);
            }
        }
    };

    const handleSalvarProva = async (prova: ProvaCustomizada) => {
        const exists = provasCustomizadas.some(p => p.id === prova.id);
        const updated = exists ? provasCustomizadas.map(p => p.id === prova.id ? prova : p) : [...provasCustomizadas, prova];
        setProvasCustomizadas(updated);

        if (dbFirestore && appId) {
            try {
                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_provas_customizadas', prova.id), prova, { merge: true });
            } catch (err) {
                console.error("Erro ao salvar prova:", err);
            }
        }
    };

    return (
        <div className="h-full flex flex-col space-y-4 font-sans animate-fadeIn select-none text-slate-800 dark:text-slate-100">
            
            {/* ========================================== */}
            {/* HEADER PRINCIPAL & CHANGER DE VISÃO        */}
            {/* ========================================== */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                Universidade Teológica & Formação de Obreiros
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                CGADB / CPAD • LMS GIPP
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Gestão de turmas, cronogramas, tutores, frequência presencial, financeiro, banco dogmático e emissão de atas.
                        </p>
                    </div>
                </div>

                {/* Perfil Switcher (Coordenador / Pastor vs. Obreiro Candidato) */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setViewMode('coordenador')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            viewMode === 'coordenador'
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                    >
                        <Award size={14} />
                        <span>Visão Pastoral / Gestão LMS</span>
                    </button>
                    <button
                        onClick={() => setViewMode('candidato')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            viewMode === 'candidato'
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                    >
                        <Users size={14} />
                        <span>Visão do Aluno / Obreiro</span>
                    </button>
                </div>
            </div>

            {/* ========================================== */}
            {/* SELEÇÃO DO NÍVEL MINISTERIAL (CARDS)       */}
            {/* ========================================== */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {NIVEIS_MINISTERIAIS.map((n) => {
                    const isSelected = selectedNivelId === n.id;
                    return (
                        <button
                            key={n.id}
                            onClick={() => setSelectedNivelId(n.id)}
                            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                                isSelected
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                    isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                    {n.sigla} • Grau {n.grau}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                    {n.horasEstagioObrigatorias}h Estágio
                                </span>
                            </div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {n.nome}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {n.descricao}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* ========================================== */}
            {/* BARRA DE NAVEGAÇÃO POR ABAS COM ROLAGEM    */}
            {/* ========================================== */}
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                {/* Botão de Rolar para a Esquerda */}
                <button
                    type="button"
                    onClick={() => scrollTabs('left')}
                    className="shrink-0 p-2 mr-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs transition-all hover:scale-105 active:scale-95 z-10 flex items-center justify-center cursor-pointer"
                    title="Rolar abas para a esquerda"
                    aria-label="Rolar abas para a esquerda"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Container de Abas com Rolagem Horizontal Visível */}
                <div 
                    ref={tabsScrollRef}
                    className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar scroll-smooth focus:outline-none"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {[
                        { id: 'dashboard', label: 'Painel Geral', icon: Layers },
                        { id: 'dossie', label: 'Dossiê Canônico (1 Tm 3)', icon: Shield },
                        { id: 'documentos', label: 'Diplomas & Atas Oficiais', icon: Award },
                        { id: 'estagio', label: 'Estágio do Altar', icon: Clock },
                        { id: 'turmas', label: '1. Turmas & Cronograma', icon: Calendar },
                        { id: 'tutores', label: '2. Docentes & Fila Correção', icon: BookCheck },
                        { id: 'frequencia', label: '3. Diário & QR Code', icon: QrCode },
                        { id: 'financeiro', label: '4. Financeiro & Taxas', icon: DollarSign },
                        { id: 'avisos', label: '5. Mural & WhatsApp', icon: Bell },
                        { id: 'relatorios_lms', label: '6. Analytics & Ata PDF', icon: BarChart2 },
                        { id: 'banco_questoes', label: '7. Banco & Provas', icon: HelpCircle },
                        { id: 'teoria', label: 'Apostilas & Aulas', icon: BookOpen },
                        { id: 'provas', label: 'Provas & Notas', icon: CheckSquare },
                        { id: 'trabalhos', label: 'Trabalhos Acadêmicos', icon: FileText },
                        { id: 'mentoria', label: 'Mentoria Pastoral', icon: UserCheck },
                        { id: 'workflow', label: 'Consagração Final', icon: CheckCircle2 }
                    ].map(tab => {
                        const IconComp = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={(e) => {
                                    setActiveTab(tab.id as any);
                                    setSelectedDisciplina(null);
                                    setSelectedLicao(null);
                                    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                }}
                                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer border ${
                                    isActive
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-600/20'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                            >
                                <IconComp size={15} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Botão de Rolar para a Direita */}
                <button
                    type="button"
                    onClick={() => scrollTabs('right')}
                    className="shrink-0 p-2 ml-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs transition-all hover:scale-105 active:scale-95 z-10 flex items-center justify-center cursor-pointer"
                    title="Rolar abas para a direita"
                    aria-label="Rolar abas para a direita"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* ========================================== */}
            {/* SELETOR RÁPIDO DE CANDIDATO ATIVO          */}
            {/* ========================================== */}
            {viewMode === 'coordenador' && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {(candidatoAtivo?.nome || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 dark:text-white">{candidatoAtivo?.nome || 'Candidato'}</span>
                                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                                    Candidato a {(candidatoAtivo?.nivelPretendido || 'diacono').toUpperCase()}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-500">Mentor: {candidatoAtivo?.mentorNome || 'Não atribuído'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500">Mudar Candidato:</span>
                        <select
                            value={selectedCandidatoId}
                            onChange={(e) => setSelectedCandidatoId(e.target.value)}
                            className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-slate-800 dark:text-slate-100"
                        >
                            {(candidatos || []).map(c => (
                                <option key={c?.id || Math.random()} value={c?.id}>
                                    {c?.nome || 'Candidato'} ({(c?.nivelPretendido || 'diacono').toUpperCase()})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* CONTEÚDO DINÂMICO DAS ABAS LMS & TRILHA    */}
            {/* ========================================== */}

            {/* --- MELHORIA 1: TURMAS & CRONOGRAMAS --- */}
            {activeTab === 'turmas' && (
                <TabTurmasCronograma
                    turmas={turmas}
                    candidatos={candidatos}
                    tutores={tutores}
                    onSalvarTurma={handleSalvarTurma}
                    onExcluirTurma={handleExcluirTurma}
                    onMatricularAluno={handleMatricularAluno}
                    addToast={addToast}
                />
            )}

            {/* --- MELHORIA 2: TUTORES & FILA DE CORREÇÃO --- */}
            {activeTab === 'tutores' && (
                <TabTutoresDocentes
                    tutores={tutores}
                    trabalhos={trabalhos}
                    trabalhosPendentes={trabalhos}
                    estagios={estagios}
                    estagiosPendentes={estagios}
                    candidatos={candidatos}
                    disciplinas={DISCIPLINAS_CURRICULARES}
                    onSalvarTutor={handleSalvarTutor}
                    onAvaliarTrabalho={handleAvaliarTrabalhoRapido}
                    onAvaliarTrabalhoRapido={handleAvaliarTrabalhoRapido}
                    onAprovarEstagio={handleAprovarEstagioRapido}
                    onAprovarEstagioRapido={handleAprovarEstagioRapido}
                    addToast={addToast}
                />
            )}

            {/* --- MELHORIA 3: FREQUÊNCIA & QR CODE --- */}
            {activeTab === 'frequencia' && (
                <TabFrequenciaEncontros
                    turmas={turmas}
                    encontros={encontros}
                    candidatos={candidatos}
                    disciplinas={DISCIPLINAS_CURRICULARES}
                    onSalvarEncontro={handleSalvarEncontro}
                    onAtualizarPresenca={handleAtualizarPresenca}
                    addToast={addToast}
                />
            )}

            {/* --- MELHORIA 4: FINANCEIRO & TAXAS --- */}
            {activeTab === 'financeiro' && (
                <TabFinanceiroFormacao
                    financeiroList={financeiroList}
                    candidatos={candidatos}
                    turmas={turmas}
                    onSalvarRegistro={handleSalvarRegistroFinanceiro}
                    addToast={addToast}
                />
            )}

            {/* --- MELHORIA 5: MURAL DE AVISOS & WHATSAPP --- */}
            {activeTab === 'avisos' && (
                <TabAvisosLembretes
                    avisos={avisos}
                    turmas={turmas}
                    candidatos={candidatos}
                    userLogado={user}
                    onSalvarAviso={handleSalvarAviso}
                    addToast={addToast}
                />
            )}

            {/* --- MELHORIA 6: ANALYTICS & ATA DA TURMA --- */}
            {activeTab === 'relatorios_lms' && (
                <TabAnalyticsAtaTurma
                    turmas={turmas}
                    candidatos={candidatos}
                    disciplinas={DISCIPLINAS_CURRICULARES}
                    dbIgreja={db?.igreja}
                    userLogado={user}
                    addToast={addToast}
                />
            )}

            {/* --- MELHORIA 7: BANCO DE QUESTÕES & PROVAS --- */}
            {activeTab === 'banco_questoes' && (
                <TabBancoQuestoesProvas
                    bancoQuestoes={bancoQuestoes}
                    provasCustomizadas={provasCustomizadas}
                    onSalvarQuestao={handleSalvarQuestao}
                    onSalvarProva={handleSalvarProva}
                    dbIgreja={db?.igreja}
                    addToast={addToast}
                />
            )}

            {/* ========================================== */}
            {/* SELETOR RÁPIDO DE CANDIDATO ATIVO          */}
            {/* ========================================== */}
            {viewMode === 'coordenador' && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {(candidatoAtivo?.nome || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 dark:text-white">{candidatoAtivo?.nome || 'Candidato'}</span>
                                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                                    Candidato a {(candidatoAtivo?.nivelPretendido || 'diacono').toUpperCase()}
                                </span>
                                {candidatoAtivo?.membroId && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                                        Membro Vinculado
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-500">Mentor: {candidatoAtivo?.mentorNome || 'Não atribuído'} • {candidatoAtivo?.congregacaoNome || db?.igreja?.nome || 'Igreja Sede'}</p>
                        </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500">Candidato Ativo:</span>
                            <select
                                value={selectedCandidatoId}
                                onChange={(e) => {
                                    const cId = e.target.value;
                                    setSelectedCandidatoId(cId);
                                    const cand = (candidatos || []).find(c => c.id === cId);
                                    if (cand?.nivelPretendido) {
                                        setSelectedNivelId(cand.nivelPretendido);
                                    }
                                }}
                                className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-slate-800 dark:text-slate-100 max-w-[220px] truncate"
                            >
                                {(candidatos || []).map(c => (
                                    <option key={c?.id || Math.random()} value={c?.id}>
                                        {c?.nome || 'Candidato'} ({(c?.nivelPretendido || 'diacono').toUpperCase()})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => setShowNovoCandidatoModal(true)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                            title="Inscrever Membro da Igreja na Formação"
                        >
                            <Plus size={14} />
                            <span>Novo Obreiro / Membro</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* CONTEÚDO DINÂMICO DAS ABAS                 */}
            {/* ========================================== */}

            {/* --- ABA 1: DASHBOARD & FICHA DO CANDIDATO --- */}
            {activeTab === 'dashboard' && (
                <div className="space-y-4">
                    {/* Status Geral / Métricas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                            <span className="text-[10px] font-black uppercase text-slate-400">Progresso Teórico</span>
                            <div className="flex items-baseline justify-between mt-1">
                                <span className="text-2xl font-black text-slate-900 dark:text-white">{candidatoAtivo?.progressoTeorico ?? 0}%</span>
                                <BookOpen size={18} className="text-emerald-500" />
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${candidatoAtivo?.progressoTeorico ?? 0}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                            <span className="text-[10px] font-black uppercase text-slate-400">Média em Provas</span>
                            <div className="flex items-baseline justify-between mt-1">
                                <span className="text-2xl font-black text-slate-900 dark:text-white">{(candidatoAtivo?.mediaProvas ?? 8.5).toFixed(1)} / 10</span>
                                <Award size={18} className="text-amber-500" />
                            </div>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-3">Mínimo exigido: 7.0</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                            <span className="text-[10px] font-black uppercase text-slate-400">Horas de Estágio</span>
                            <div className="flex items-baseline justify-between mt-1">
                                <span className="text-2xl font-black text-slate-900 dark:text-white">
                                    {totalHorasAprovadas} / {nivelAtivo?.horasEstagioObrigatorias || 20}h
                                </span>
                                <Clock size={18} className="text-sky-500" />
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                                <div 
                                    className="bg-sky-500 h-full rounded-full" 
                                    style={{ width: `${Math.min(100, (totalHorasAprovadas / (nivelAtivo?.horasEstagioObrigatorias || 20)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                            <span className="text-[10px] font-black uppercase text-slate-400">Status da Ordenação</span>
                            <div className="flex items-baseline justify-between mt-1">
                                <span className="text-lg font-black text-slate-900 dark:text-white uppercase truncate">
                                    {(candidatoAtivo?.statusTrilha || 'cursando').replace('_', ' ')}
                                </span>
                                <CheckCircle2 size={18} className="text-emerald-500" />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-3">Gestão estritamente manual</p>
                        </div>
                    </div>

                    {/* Ficha Dogmática & Requisitos Paulinos */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Requisitos Gerais do Cargo */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Shield size={18} className="text-emerald-600" />
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                        Critérios de Aptidão Ministerial ({nivelAtivo.nome})
                                    </h3>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 font-mono">1 Tm 3 / Tt 1</span>
                            </div>

                            <ul className="space-y-2.5">
                                {nivelAtivo.requisitosGerais.map((req, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                                        <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Textos Bíblicos Exegéticos:</span>
                                {nivelAtivo.referenciasBiblicas.map((ref, idx) => (
                                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                        {ref}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Ações Rápidas Pastorais */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">
                                    Ações Eclesiásticas
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                    Emissão de atas e homologações do processo preparatório para a reunião de obreiros.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => handleImprimirCertificadoOuAta('ata')}
                                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                                >
                                    <Printer size={14} />
                                    <span>Emitir Ata de Indicação</span>
                                </button>
                                <button
                                    onClick={() => handleImprimirCertificadoOuAta('certificado')}
                                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                                >
                                    <Award size={14} />
                                    <span>Certificado de Consagração</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ABA 2: APOSTILAS & AULAS TEÓRICAS (LEITOR CGADB) --- */}
            {activeTab === 'teoria' && (
                <div className="space-y-4">
                    {!selectedLicao ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {disciplinasDoNivel.map((disc) => (
                                <div
                                    key={disc.id}
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                {disc.capituloCGADB}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400">
                                                {disc.cargaHoraria}h/aula
                                            </span>
                                        </div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                                            {disc.titulo}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                            {disc.ementa}
                                        </p>
                                    </div>

                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                                        <span className="text-[10px] font-black uppercase text-slate-400">Lições Doutrinárias:</span>
                                        {disc.licoes.map((lic) => (
                                            <button
                                                key={lic.id}
                                                onClick={() => {
                                                    setSelectedDisciplina(disc);
                                                    setSelectedLicao(lic);
                                                    setQuizRespostas({});
                                                    setQuizFinalizado(false);
                                                }}
                                                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-left transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-lg bg-emerald-600/10 text-emerald-600 font-black text-xs flex items-center justify-center shrink-0">
                                                        {lic.numero}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                                        {lic.titulo}
                                                    </span>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Leitor Completo da Lição com 5 Páginas Exegéticas */
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-4xl mx-auto">
                            {/* Top Bar do Leitor Teológico */}
                            <div className="flex flex-wrap items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800 gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedLicao(null);
                                        setActivePageIndex(0);
                                        setQuizFinalizado(false);
                                        setQuizRespostas({});
                                    }}
                                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                                >
                                    <ArrowLeft size={16} />
                                    <span>Voltar para Lista de Disciplinas</span>
                                </button>
                                
                                <div className="flex items-center flex-wrap gap-2">
                                    {/* Botão de Tamanho da Fonte */}
                                    <button
                                        onClick={() => setFontScale(prev => prev === 'normal' ? 'large' : 'normal')}
                                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                        title="Alternar tamanho da fonte para leitura confortável"
                                    >
                                        <span className="font-serif font-black">{fontScale === 'normal' ? 'A+' : 'A-'}</span>
                                        <span className="hidden sm:inline">{fontScale === 'normal' ? 'Ampliar' : 'Padrão'}</span>
                                    </button>

                                    {/* Alternar Modo Paginado / Contínuo */}
                                    <button
                                        onClick={() => setModoLeituraContinua(prev => !prev)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                            modoLeituraContinua
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                                        }`}
                                    >
                                        <Layers size={14} />
                                        <span>{modoLeituraContinua ? 'Modo Contínuo' : 'Modo Paginado (5 Págs)'}</span>
                                    </button>

                                    {/* Baixar Apostila PDF */}
                                    {selectedDisciplina && (
                                        <button
                                            onClick={() => gerarApostilaPDF(selectedDisciplina, selectedLicao)}
                                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                                        >
                                            <Printer size={14} />
                                            <span>Baixar Apostila (PDF)</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Cabeçalho Dogmático da Lição */}
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        Lição {selectedLicao.numero} de {selectedDisciplina?.licoes.length || 1}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        {selectedDisciplina?.capituloCGADB || 'Declaração de Fé CGADB / CPAD'}
                                    </span>
                                    {licoesConcluidas.includes(selectedLicao.id) && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center gap-1">
                                            <CheckCircle2 size={11} /> Concluída
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                    {selectedLicao.titulo}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Módulo Curricular: <strong className="text-slate-800 dark:text-slate-200">{selectedDisciplina?.titulo}</strong> • Grau: <strong className="text-emerald-600 dark:text-emerald-400">{nivelAtivo.nome}</strong>
                                </p>
                            </div>

                            {/* Stepper / Tabs das 5 Páginas Exegéticas */}
                            {(!modoLeituraContinua && selectedLicao.paginas && selectedLicao.paginas.length > 0) && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
                                        <span>Progresso da Leitura:</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-black">
                                            Página {activePageIndex + 1} de {selectedLicao.paginas.length} ({(Math.round(((activePageIndex + 1) / selectedLicao.paginas.length) * 100))}%)
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/70 rounded-2xl">
                                        {selectedLicao.paginas.map((pag, idx) => {
                                            const isActive = activePageIndex === idx;
                                            const isDone = activePageIndex > idx;
                                            return (
                                                <button
                                                    key={pag.numero}
                                                    onClick={() => setActivePageIndex(idx)}
                                                    className={`py-2 px-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                                        isActive
                                                            ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-black shadow-xs border border-emerald-500/30'
                                                            : isDone
                                                                ? 'text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/10'
                                                                : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-900/50'
                                                    }`}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                                        {isDone ? <CheckCircle2 size={11} className="text-emerald-500" /> : `Pág ${pag.numero}`}
                                                    </span>
                                                    <span className="text-[9px] truncate max-w-full font-medium hidden md:inline opacity-80">
                                                        {pag.subtitulo.split(':')[0] || `Parte ${pag.numero}`}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Conteúdo de Estudo da Lição */}
                            <div className="space-y-6">
                                {modoLeituraContinua ? (
                                    /* Modo Contínuo - Exibe todas as 5 páginas sequencialmente */
                                    <div className="space-y-8">
                                        {selectedLicao.paginas && selectedLicao.paginas.length > 0 ? (
                                            selectedLicao.paginas.map((pag) => (
                                                <div key={pag.numero} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
                                                    <div className="flex items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-700">
                                                        <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                                                            {pag.numero}
                                                        </span>
                                                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                                                            {pag.subtitulo}
                                                        </h3>
                                                    </div>
                                                    
                                                    <div className={`space-y-3 font-serif leading-relaxed text-slate-700 dark:text-slate-200 ${fontScale === 'large' ? 'text-base' : 'text-xs md:text-sm'}`}>
                                                        {pag.conteudo.split('\n\n').map((paragraph, pIdx) => (
                                                            <p key={pIdx} className="text-justify">{paragraph}</p>
                                                        ))}
                                                    </div>

                                                    {pag.destaqueExegese && (
                                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                                                📜 Exegese Teológica Doutrinária
                                                            </span>
                                                            <p className="text-xs md:text-sm italic font-serif text-amber-900 dark:text-amber-200 leading-relaxed">
                                                                "{pag.destaqueExegese}"
                                                            </p>
                                                        </div>
                                                    )}

                                                    {pag.pontosChave && pag.pontosChave.length > 0 && (
                                                        <div className="space-y-2 pt-2">
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                                                Pontos-Chave Dogmáticos:
                                                            </span>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {pag.pontosChave.map((ponto, ptIdx) => (
                                                                    <div key={ptIdx} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2">
                                                                        <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                                                                        <span>{ponto}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            /* Fallback caso não haja páginas paginadas */
                                            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
                                                <div className="text-xs md:text-sm font-serif leading-relaxed text-slate-700 dark:text-slate-200">
                                                    {selectedLicao.introducao}
                                                </div>
                                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs md:text-sm font-serif text-slate-800 dark:text-slate-100">
                                                    {selectedLicao.fundamentacaoDoutrinaria}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Modo Paginado - Exibe 1 página por vez com alta profundidade */
                                    <div className="space-y-5">
                                        {(() => {
                                            const paginas = selectedLicao.paginas || [];
                                            const paginaAtual = paginas[activePageIndex] || {
                                                numero: 1,
                                                subtitulo: 'Introdução & Fundamentação',
                                                conteudo: `${selectedLicao.introducao}\n\n${selectedLicao.fundamentacaoDoutrinaria}`,
                                                destaqueExegese: selectedLicao.fundamentacaoDoutrinaria,
                                                pontosChave: selectedLicao.referenciasBiblicas
                                            };

                                            return (
                                                <div className="p-6 md:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-5">
                                                    {/* Header da Página */}
                                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4 border-slate-200 dark:border-slate-700">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                                                {paginaAtual.numero}
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                                                                    Página {paginaAtual.numero} de {paginas.length || 5}
                                                                </span>
                                                                <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                                                                    {paginaAtual.subtitulo}
                                                                </h3>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Conteúdo Textual Exegético */}
                                                    <div className={`space-y-4 font-serif leading-relaxed text-slate-700 dark:text-slate-200 ${fontScale === 'large' ? 'text-base md:text-lg' : 'text-xs md:text-sm'}`}>
                                                        {paginaAtual.conteudo.split('\n\n').map((paragrafo, pIdx) => (
                                                            <p key={pIdx} className="text-justify indent-4">{paragrafo}</p>
                                                        ))}
                                                    </div>

                                                    {/* Box Destaque Exegético */}
                                                    {paginaAtual.destaqueExegese && (
                                                        <div className="p-4 md:p-5 rounded-2xl bg-amber-500/10 border-l-4 border-amber-500 space-y-2">
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                                                                📜 Exegese Doutrinária CGADB / CPAD
                                                            </span>
                                                            <p className="text-xs md:text-sm italic font-serif text-amber-950 dark:text-amber-100 leading-relaxed">
                                                                "{paginaAtual.destaqueExegese}"
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Pontos-Chave da Página */}
                                                    {paginaAtual.pontosChave && paginaAtual.pontosChave.length > 0 && (
                                                        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                                                Síntese & Pontos de Fixação Doutrinária:
                                                            </span>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {paginaAtual.pontosChave.map((pt, ptIdx) => (
                                                                    <div key={ptIdx} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                                                                        <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                                                            {ptIdx + 1}
                                                                        </span>
                                                                        <span>{pt}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Controles de Navegação da Página */}
                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                                                        <button
                                                            disabled={activePageIndex === 0}
                                                            onClick={() => setActivePageIndex(prev => Math.max(0, prev - 1))}
                                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                                activePageIndex === 0
                                                                    ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800'
                                                                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs'
                                                            }`}
                                                        >
                                                            <ChevronLeft size={14} />
                                                            <span>Página Anterior</span>
                                                        </button>

                                                        <div className="flex items-center gap-1.5">
                                                            {paginas.map((_, pIdx) => (
                                                                <button
                                                                    key={pIdx}
                                                                    onClick={() => setActivePageIndex(pIdx)}
                                                                    className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                                                                        activePageIndex === pIdx
                                                                            ? 'bg-emerald-600 text-white shadow-xs'
                                                                            : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                                                                    }`}
                                                                >
                                                                    {pIdx + 1}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {activePageIndex < paginas.length - 1 ? (
                                                            <button
                                                                onClick={() => setActivePageIndex(prev => Math.min(paginas.length - 1, prev + 1))}
                                                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                                            >
                                                                <span>Próxima Página</span>
                                                                <ChevronRight size={14} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    const quizElem = document.getElementById('secao-quiz-fixacao');
                                                                    if (quizElem) quizElem.scrollIntoView({ behavior: 'smooth' });
                                                                }}
                                                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs animate-pulse"
                                                            >
                                                                <span>Fazer Quiz de Fixação</span>
                                                                <HelpCircle size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Referências Bíblicas Exegéticas */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                            Textos Bíblicos Exegéticos Fundamentais:
                                        </span>
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                            Clique para ler o texto sagrado e exegese
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedLicao.referenciasBiblicas.map((ref, idx) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => handleOpenBibleRef(ref)}
                                                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs group"
                                            >
                                                <BookOpen size={13} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                                                <span>{ref}</span>
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded ml-1 font-semibold">
                                                    Abrir Texto & Exegese
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Aplicação Prática no Ministério */}
                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                                        Aplicação Pastoral & Ministério no Templo / Sociedade:
                                    </span>
                                    <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                                        {selectedLicao.aplicacaoPratica}
                                    </p>
                                </div>

                                {/* Quiz de Fixação Dogmática */}
                                <div id="secao-quiz-fixacao" className="border-t pt-6 border-slate-100 dark:border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                                                <HelpCircle size={18} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                                    Validação & Questionário de Fixação Dogmática
                                                </h3>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    Responda às questões oficiais para registrar a conclusão deste módulo em seu histórico
                                                </p>
                                            </div>
                                        </div>

                                        {quizFinalizado && (
                                            <div className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                Avaliação Finalizada
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {selectedLicao.quiz.map((q, qIdx) => (
                                            <div key={qIdx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                                                <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white flex items-start gap-2">
                                                    <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                                        {qIdx + 1}
                                                    </span>
                                                    <span>{q.pergunta}</span>
                                                </p>
                                                <div className="space-y-2 pt-1">
                                                    {q.opcoes.map((opc, opcIdx) => {
                                                        const isChecked = quizRespostas[qIdx] === opcIdx;
                                                        const isCorrect = q.respostaCorreta === opcIdx;
                                                        return (
                                                            <button
                                                                key={opcIdx}
                                                                disabled={quizFinalizado}
                                                                onClick={() => setQuizRespostas(prev => ({ ...prev, [qIdx]: opcIdx }))}
                                                                className={`w-full p-3 rounded-xl text-xs text-left transition-all border flex items-start gap-3 cursor-pointer ${
                                                                    quizFinalizado
                                                                        ? isCorrect
                                                                            ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                                                                            : isChecked
                                                                                ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200'
                                                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                                                                        : isChecked
                                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                                                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                                                }`}
                                                            >
                                                                <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                                                    isChecked ? 'bg-emerald-600 text-white border-emerald-600' : 'text-slate-500'
                                                                }`}>
                                                                    {String.fromCharCode(65 + opcIdx)}
                                                                </span>
                                                                <span className="flex-1">{opc}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {quizFinalizado && (
                                                    <div className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl mt-2 flex items-start gap-2">
                                                        <span className="text-emerald-600 font-bold shrink-0">💡 Explicação Teológica:</span>
                                                        <span>{q.explicacao}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {!quizFinalizado ? (
                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                onClick={async () => {
                                                    const totalPerguntas = selectedLicao.quiz.length;
                                                    const totalRespondidas = Object.keys(quizRespostas).length;
                                                    if (totalRespondidas < totalPerguntas) {
                                                        addToast("Por favor, responda todas as questões antes de validar.", "warning");
                                                        return;
                                                    }

                                                    let acertos = 0;
                                                    selectedLicao.quiz.forEach((q, idx) => {
                                                        if (quizRespostas[idx] === q.respostaCorreta) acertos++;
                                                    });

                                                    const percentual = Math.round((acertos / totalPerguntas) * 100);
                                                    setQuizFinalizado(true);

                                                    if (percentual >= 50) {
                                                        if (!licoesConcluidas.includes(selectedLicao.id)) {
                                                            setLicoesConcluidas(prev => [...prev, selectedLicao.id]);
                                                        }

                                                        // Atualizar progresso do candidato
                                                        const novoProgresso = Math.min(100, Math.round((candidatoAtivo.progressoTeorico || 0) + 15));
                                                        const novaMedia = Number((((candidatoAtivo.mediaProvas || 8.5) + (acertos / totalPerguntas * 10)) / 2).toFixed(1));

                                                        const updated = {
                                                            progressoTeorico: novoProgresso,
                                                            mediaProvas: novaMedia,
                                                            workflowStatus: {
                                                                ...candidatoAtivo.workflowStatus,
                                                                teoriaConcluida: novoProgresso >= 80
                                                            }
                                                        };

                                                        // Salvar no Firestore se disponível
                                                        if (dbFirestore && appId && candidatoAtivo.id) {
                                                            try {
                                                                await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'formacao_candidatos', candidatoAtivo.id), updated, { merge: true });
                                                            } catch (err) {
                                                                console.warn("Aviso ao salvar progresso:", err);
                                                            }
                                                        }

                                                        addToast(`Parabéns! Você acertou ${acertos}/${totalPerguntas} (${percentual}%). Lição concluída!`, "success");
                                                    } else {
                                                        addToast(`Você acertou ${acertos}/${totalPerguntas} (${percentual}%). Revise os textos e tente novamente!`, "warning");
                                                    }
                                                }}
                                                className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
                                            >
                                                <CheckCircle2 size={16} />
                                                <span>Verificar Respostas e Concluir Lição</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                onClick={() => {
                                                    setQuizFinalizado(false);
                                                    setQuizRespostas({});
                                                }}
                                                className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer flex items-center gap-2"
                                            >
                                                <RefreshCw size={14} />
                                                <span>Refazer Questionário</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedLicao(null);
                                                    setActivePageIndex(0);
                                                }}
                                                className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all cursor-pointer shadow-xs flex items-center gap-2"
                                            >
                                                <span>Avançar para Próxima Lição</span>
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- ABA 3: PROVAS & AVALIAÇÕES TEOLÓGICAS --- */}
            {activeTab === 'provas' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                    Avaliações Formativas de {candidatoAtivo?.nome || 'Candidato'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Notas atribuídas manualmente pelo pastor ou mentor após arguição e prova escrita.
                                </p>
                            </div>
                            <span className="text-xs font-black px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Média Atual: {(candidatoAtivo?.mediaProvas ?? 8.5).toFixed(1)}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {disciplinasDoNivel.map((disc, idx) => (
                                <div
                                    key={disc.id}
                                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3"
                                >
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                                            Módulo {idx + 1} • {disc.capituloCGADB}
                                        </span>
                                        <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                                            {disc.titulo}
                                        </h4>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Nota Manual</span>
                                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                                {(candidatoAtivo?.mediaProvas ?? 8.5).toFixed(1)} / 10
                                            </span>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                            Aprovado
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- ABA 4: TRABALHOS ACADÊMICOS & RESENHAS --- */}
            {activeTab === 'trabalhos' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                Trabalhos Acadêmicos & Artigos Pastorais
                            </h3>
                            <p className="text-xs text-slate-500">
                                Submissão de ensaios, exegeses e projetos com revisão pastoral obrigatória.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowNovoTrabalhoModal(true)}
                            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                        >
                            <Plus size={16} />
                            <span>Entregar Novo Trabalho</span>
                        </button>
                    </div>

                    {/* Lista de Trabalhos */}
                    <div className="space-y-3">
                        {trabalhosDoCandidato.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                                Nenhum trabalho acadêmico submetido por este candidato até o momento.
                            </div>
                        ) : (
                            trabalhosDoCandidato.map((trab) => (
                                <div
                                    key={trab.id}
                                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                                        <div>
                                            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                                                {trab.disciplinaTitulo}
                                            </span>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                                {trab.titulo}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                trab.status === 'aprovado'
                                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                    : trab.status === 'necessita_revisao'
                                                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                            }`}>
                                                {trab.status.replace('_', ' ')}
                                            </span>
                                            {trab.nota && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                    Nota: {trab.nota.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        {trab.conteudoTexto}
                                    </p>

                                    {/* Feedback Pastoral */}
                                    {trab.feedbackPastor && (
                                        <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                            <strong>Parecer Pastoral ({trab.avaliadorNome || 'Pastor'}):</strong> {trab.feedbackPastor}
                                        </div>
                                    )}

                                    {/* Botão de Avaliação Pastoral Manual */}
                                    {viewMode === 'coordenador' && (
                                        <div className="pt-2 flex justify-end">
                                            <button
                                                onClick={() => {
                                                    setEditingTrabalhoId(trab.id);
                                                    setNotaForm({ nota: trab.nota ? String(trab.nota) : '9.0', feedback: trab.feedbackPastor || '' });
                                                }}
                                                className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                            >
                                                <Edit3 size={14} />
                                                <span>Avaliar / Corrigir Manualmente</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* --- ABA: DOSSIÊ CANÔNICO & PARECER DE IDONEIDADE (1 TM 3 E TITO 1) --- */}
            {activeTab === 'dossie' && (
                <TabDossiePastoral
                    candidato={candidatoAtivo}
                    nivel={nivelAtivo}
                    onSalvarDossie={handleSalvarDossieCanonico}
                    onEfetivarConsagracaoNoCadastro={handleEfetivarConsagracaoNoCadastro}
                    pastorNome={db?.igreja?.pastorPresidente || user?.nome || 'Pastor Presidente'}
                    isCoordenador={viewMode === 'coordenador'}
                />
            )}

            {/* --- ABA: DOCUMENTOS OFICIAIS, DIPLOMAS, HISTÓRICO & ATAS --- */}
            {activeTab === 'documentos' && (
                <TabDocumentosOficiais
                    candidato={candidatoAtivo}
                    nivel={nivelAtivo}
                    disciplinas={disciplinasDoNivel}
                    estagios={estagios}
                    trabalhos={trabalhos}
                    turma={turmas[0]}
                    igrejaNome={db?.igreja?.nome || 'Assembleia de Deus — Ministério do Belém'}
                    pastorPresidenteNome={db?.igreja?.pastorPresidente || user?.nome || 'Pastor Presidente'}
                    onImprimirCertificado={() => handleImprimirCertificadoOuAta('certificado')}
                    onImprimirCredencial={() => handleImprimirCertificadoOuAta('credencial')}
                    onImprimirAta={() => handleImprimirCertificadoOuAta('ata')}
                    addToast={addToast}
                />
            )}

            {/* --- ABA 5: ESTÁGIO PRÁTICO MINISTERIAL & CHECKLIST DO ALTAR --- */}
            {activeTab === 'estagio' && (
                <TabEstagioSupervisionado
                    candidato={candidatoAtivo}
                    nivel={nivelAtivo}
                    estagios={estagios}
                    onAbrirNovoEstagioModal={() => setShowNovoEstagioModal(true)}
                    onAprovarEstagio={handleAprovarEstagio}
                    isCoordenador={viewMode === 'coordenador'}
                />
            )}

            {/* --- ABA 6: MENTORIA MINISTERIAL & CARÁTER --- */}
            {activeTab === 'mentoria' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                Acompanhamento & Mentoria Ministerial
                            </h3>
                            <p className="text-xs text-slate-500">
                                Avaliação de testemunho santo, maturidade e vida devocional familiar.
                            </p>
                        </div>
                        {viewMode === 'coordenador' && (
                            <button
                                onClick={() => setShowNovaMentoriaModal(true)}
                                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                            >
                                <Plus size={16} />
                                <span>Registrar Parecer de Mentoria</span>
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {mentoriasDoCandidato.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                                Nenhuma sessão de mentoria registrada para este obreiro.
                            </div>
                        ) : (
                            mentoriasDoCandidato.map((ment) => (
                                <div
                                    key={ment.id}
                                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                                        <div>
                                            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                                                Sessão em {formatDateLocal(ment.dataSessao)} • Mentor: {ment.mentorNome}
                                            </span>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                                {ment.temaAbordado}
                                            </h4>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                            ment.recomendadoConsagracao
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                        }`}>
                                            {ment.recomendadoConsagracao ? 'Recomendado à Consagração' : 'Em Observação'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                            <strong className="text-emerald-600 block mb-1">Pontos Fortes & Vocação:</strong>
                                            <p className="text-slate-600 dark:text-slate-300">{ment.pontosFortes}</p>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                            <strong className="text-amber-600 block mb-1">Pontos a Desenvolver:</strong>
                                            <p className="text-slate-600 dark:text-slate-300">{ment.pontosDesenvolver}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-700 dark:text-slate-200">
                                        <strong>Parecer Geral Confidencial:</strong> {ment.parecerGeral}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* --- ABA 7: WORKFLOW DE CONSAGRAÇÃO (ADMINISTRATIVO) --- */}
            {activeTab === 'workflow' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                    Pipeline de Homologação & Consagração
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Checklist canônico das 7 etapas necessárias para ordenação ao Santo Ministério.
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500 text-white">
                                Candidato: {candidatoAtivo?.nome || 'Candidato'}
                            </span>
                        </div>

                        {/* As 7 Etapas do Workflow */}
                        <div className="space-y-3">
                            {[
                                { key: 'teoriaConcluida', label: '1. Conclusão Integral da Grade Teórica', desc: 'Aprovação em todas as matérias dogmáticas da CPAD/CGADB.' },
                                { key: 'provasAprovadas', label: '2. Média Geral de Avaliações (≥ 7.0)', desc: 'Desempenho aprovado nas provas e arguições doutrinárias.' },
                                { key: 'trabalhosAprovados', label: '3. Homologação dos Trabalhos Acadêmicos', desc: 'Entrega e aprovação das resenhas pastorais pelo corpo docente.' },
                                { key: 'estagioHomologado', label: '4. Cumprimento Integral de Horas de Estágio', desc: 'Horas práticas aprovadas e validadas no templo local.' },
                                { key: 'mentoriaAprovada', label: '5. Parecer Favorável da Mentoria Pastoral', desc: 'Reconhecimento de caráter ilibado (1 Timóteo 3).' },
                                { key: 'entrevistaPastor', label: '6. Entrevista com o Pastor Presidente', desc: 'Arguição pastoral final sobre chamada vocacional e lealdade.' },
                                { key: 'aprovadoAssembleia', label: '7. Homologação na Reunião de Obreiros / Assembleia', desc: 'Aprovação solene pelo corpo ministerial da igreja.' }
                            ].map((step, idx) => {
                                const isChecked = Boolean((candidatoAtivo?.workflowStatus as any)?.[step.key]);
                                return (
                                    <div
                                        key={step.key}
                                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                                            isChecked
                                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-80'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                                isChecked ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                                            }`}>
                                                {isChecked ? <Check size={14} /> : idx + 1}
                                            </span>
                                            <div>
                                                <h4 className="text-xs md:text-sm font-black">{step.label}</h4>
                                                <p className="text-[11px] opacity-75">{step.desc}</p>
                                            </div>
                                        </div>

                                        {viewMode === 'coordenador' && (
                                            <button
                                                onClick={() => handleToggleWorkflowStep(step.key as any)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                    isChecked
                                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white'
                                                }`}
                                            >
                                                {isChecked ? 'Homologado' : 'Aprovar Etapa'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Botão de Finalização da Consagração */}
                        <div className="border-t pt-4 border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={() => handleImprimirCertificadoOuAta('certificado')}
                                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 hover:opacity-95 transition-all cursor-pointer"
                            >
                                <Award size={16} />
                                <span>Emitir Certificado Oficial de Consagração</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* MODAIS AUXILIARES                          */}
            {/* ========================================== */}

            {/* Modal: Registrar Novo Estágio Prático */}
            {showNovoEstagioModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Registrar Atividade de Estágio</h3>
                            <button onClick={() => setShowNovoEstagioModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleCriarEstagio} className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Tipo de Atividade</label>
                                <select
                                    value={estagioForm.tipoAtividade}
                                    onChange={(e) => setEstagioForm(prev => ({ ...prev, tipoAtividade: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                                >
                                    <option value="santa_ceia">Apoio e Serviço na Santa Ceia</option>
                                    <option value="visita_enfermos">Visitação aos Enfermos (Tiago 5)</option>
                                    <option value="portaria_acolhimento">Portaria & Acolhimento</option>
                                    <option value="culto_direcao">Direção de Culto / Leitura Bíblica</option>
                                    <option value="evangelismo">Evangelismo & Cruzada de Rua</option>
                                    <option value="acao_social">Assistência e Ação Social</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Título Resumido</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Apoio na distribuição dos cálices..."
                                    value={estagioForm.titulo}
                                    onChange={(e) => setEstagioForm(prev => ({ ...prev, titulo: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Horas Dedicadas</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="12"
                                        value={estagioForm.horas}
                                        onChange={(e) => setEstagioForm(prev => ({ ...prev, horas: Number(e.target.value) }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Data da Ação</label>
                                    <input
                                        type="date"
                                        value={estagioForm.dataAtividade}
                                        onChange={(e) => setEstagioForm(prev => ({ ...prev, dataAtividade: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Local Realizado</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Templo Sede / Hospital..."
                                    value={estagioForm.local}
                                    onChange={(e) => setEstagioForm(prev => ({ ...prev, local: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Relatório Descritivo</label>
                                <textarea
                                    rows={3}
                                    placeholder="Descreva a atividade prática realizada com fidelidade..."
                                    value={estagioForm.descricao}
                                    onChange={(e) => setEstagioForm(prev => ({ ...prev, descricao: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Comprovante em Foto (Opcional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUploadFotoEstagio}
                                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-600 cursor-pointer"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md mt-4 cursor-pointer"
                            >
                                Enviar para Validação Pastoral
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Entregar Novo Trabalho Acadêmico */}
            {showNovoTrabalhoModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Submeter Trabalho Acadêmico</h3>
                            <button onClick={() => setShowNovoTrabalhoModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleCriarTrabalho} className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Disciplina Correspondente</label>
                                <select
                                    value={trabalhoForm.disciplinaId}
                                    onChange={(e) => setTrabalhoForm(prev => ({ ...prev, disciplinaId: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                                >
                                    {disciplinasDoNivel.map(d => (
                                        <option key={d.id} value={d.id}>{d.titulo}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Título do Artigo / Resenha</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Análise pastoral sobre o zelo litúrgico..."
                                    value={trabalhoForm.titulo}
                                    onChange={(e) => setTrabalhoForm(prev => ({ ...prev, titulo: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Conteúdo do Trabalho</label>
                                <textarea
                                    rows={6}
                                    placeholder="Redija o trabalho acadêmico com rigor bíblico e citações das Escrituras..."
                                    value={trabalhoForm.conteudoTexto}
                                    onChange={(e) => setTrabalhoForm(prev => ({ ...prev, conteudoTexto: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-serif"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md mt-4 cursor-pointer"
                            >
                                Enviar Trabalho ao Corpo Docente
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Avaliação Manual de Trabalho (Coordenador) */}
            {editingTrabalhoId && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Avaliação Manual do Trabalho</h3>
                            <button onClick={() => setEditingTrabalhoId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Nota Atribuída (0 a 10)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={notaForm.nota}
                                    onChange={(e) => setNotaForm(prev => ({ ...prev, nota: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Parecer & Feedback Pastoral</label>
                                <textarea
                                    rows={4}
                                    placeholder="Escreva as orientações pastorais para o aluno..."
                                    value={notaForm.feedback}
                                    onChange={(e) => setNotaForm(prev => ({ ...prev, feedback: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <button
                                onClick={handleAvaliarTrabalho}
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md mt-4 cursor-pointer"
                            >
                                Registrar Nota e Parecer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Registrar Sessão de Mentoria */}
            {showNovaMentoriaModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Registrar Mentoria Pastoral</h3>
                            <button onClick={() => setShowNovaMentoriaModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleCriarMentoria} className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Tema Principal da Conversa</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Vida devocional, família e lealdade ministerial..."
                                    value={mentoriaForm.temaAbordado}
                                    onChange={(e) => setMentoriaForm(prev => ({ ...prev, temaAbordado: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Pontos Fortes Observados</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Dedicação à oração, pontualidade..."
                                    value={mentoriaForm.pontosFortes}
                                    onChange={(e) => setMentoriaForm(prev => ({ ...prev, pontosFortes: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Pontos a Desenvolver</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Estudo mais aprofundado de hermenêutica..."
                                    value={mentoriaForm.pontosDesenvolver}
                                    onChange={(e) => setMentoriaForm(prev => ({ ...prev, pontosDesenvolver: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Parecer Geral Confidencial</label>
                                <textarea
                                    rows={3}
                                    placeholder="Parecer do pastor sobre a prontidão do candidato..."
                                    value={mentoriaForm.parecerGeral}
                                    onChange={(e) => setMentoriaForm(prev => ({ ...prev, parecerGeral: e.target.value }))}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="recConsag"
                                    checked={mentoriaForm.recomendadoConsagracao}
                                    onChange={(e) => setMentoriaForm(prev => ({ ...prev, recomendadoConsagracao: e.target.checked }))}
                                    className="w-4 h-4 rounded text-emerald-600"
                                />
                                <label htmlFor="recConsag" className="font-bold text-slate-800 dark:text-slate-200">
                                    Recomendo para a Consagração Ministerial
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md mt-4 cursor-pointer"
                            >
                                Salvar Ata de Mentoria
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Matricular Novo Obreiro / Membro da Igreja */}
            {showNovoCandidatoModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                    Matricular Membro na Formação de Obreiros
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Integração direta com o cadastro de membros e histórico da igreja.
                                </p>
                            </div>
                            <button onClick={() => setShowNovoCandidatoModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleCriarCandidato} className="space-y-3.5 text-xs">
                            {/* Seleção do Membro Real */}
                            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                                <label className="font-black text-emerald-800 dark:text-emerald-300 block">
                                    1. Selecione o Membro na Base Geral da Igreja:
                                </label>
                                <select
                                    value={selectedMembroCandidatoId}
                                    onChange={(e) => {
                                        const mId = e.target.value;
                                        setSelectedMembroCandidatoId(mId);
                                        if (!mId) return;
                                        const membro = (db?.membros || []).find((m: any) => m.id === mId);
                                        if (membro) {
                                            setFormNovoCandidato({
                                                nome: membro.nome || '',
                                                cpf: membro.cpf || '',
                                                telefone: membro.telefone || '',
                                                email: membro.email || '',
                                                cargoAtual: membro.cargo || 'Membro',
                                                congregacaoNome: membro.congregacao || db?.igreja?.nome || 'Sede Principal',
                                                nivelPretendido: 'diacono',
                                                mentorNome: 'Pr. Carlos Eduardo'
                                            });
                                        }
                                    }}
                                    className="w-full p-2.5 rounded-xl border border-emerald-500/30 bg-white dark:bg-slate-800 font-bold outline-none text-slate-800 dark:text-slate-100 text-xs"
                                >
                                    <option value="">-- Selecione o membro cadastrado ou preencha avulso --</option>
                                    {(db?.membros || []).map((m: any) => (
                                        <option key={m.id} value={m.id}>
                                            {m.nome} — {m.cargo || 'Membro'} ({m.congregacao || 'Sede'} • {m.telefone || 'S/ Tel'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Nome Completo do Candidato</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Irmão Samuel Barbosa"
                                        value={formNovoCandidato.nome}
                                        onChange={(e) => setFormNovoCandidato(p => ({ ...p, nome: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-bold text-slate-800 dark:text-slate-100"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">CPF</label>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00"
                                        value={formNovoCandidato.cpf}
                                        onChange={(e) => setFormNovoCandidato(p => ({ ...p, cpf: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        placeholder="(11) 99999-9999"
                                        value={formNovoCandidato.telefone}
                                        onChange={(e) => setFormNovoCandidato(p => ({ ...p, telefone: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Cargo Atual na Igreja</label>
                                    <input
                                        type="text"
                                        value={formNovoCandidato.cargoAtual}
                                        onChange={(e) => setFormNovoCandidato(p => ({ ...p, cargoAtual: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Nível Pretendido na Formação</label>
                                    <select
                                        value={formNovoCandidato.nivelPretendido}
                                        onChange={(e) => setFormNovoCandidato(p => ({ ...p, nivelPretendido: e.target.value as any }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                                    >
                                        {NIVEIS_MINISTERIAIS.map(n => (
                                            <option key={n.id} value={n.id}>{n.nome}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Congregação / Polo</label>
                                    <input
                                        type="text"
                                        value={formNovoCandidato.congregacaoNome}
                                        onChange={(e) => setFormNovoCandidato(p => ({ ...p, congregacaoNome: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Pastor / Mentor Responsável</label>
                                    <input
                                        type="text"
                                        list="listaMentoresSugestao"
                                        value={formNovoCandidato.mentorNome}
                                        onChange={(e) => setFormNovoCandidato(p => ({ ...p, mentorNome: e.target.value }))}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-bold"
                                    />
                                    <datalist id="listaMentoresSugestao">
                                        {(tutores || []).map(t => (
                                            <option key={t.id} value={t.nome}>{t.cargo}</option>
                                        ))}
                                        {(db?.membros || []).filter((m: any) => m.cargo && m.cargo.includes('Pastor')).map((m: any) => (
                                            <option key={m.id} value={m.nome}>{m.cargo}</option>
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md mt-4 cursor-pointer flex items-center justify-center gap-2"
                            >
                                <GraduationCap size={16} />
                                <span>Efetivar Matrícula do Obreiro</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Texto Bíblico Sagrado e Exegese */}
            <BibleReferenceModal
                isOpen={bibleModalOpen}
                referenceQuery={bibleModalQuery}
                onClose={() => setBibleModalOpen(false)}
            />

        </div>
    );
}
