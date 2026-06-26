import React, { useState, useEffect, useContext } from 'react';
import { 
  Heart, Users, GraduationCap, Calendar, TrendingUp, ClipboardList, 
  CheckCircle, AlertCircle, MapPin, Activity, FileText, Search, Plus, 
  Edit, Trash2, Clock, BookOpen, HeartHandshake, RefreshCw, Sparkles, 
  ChevronRight, ArrowRight, User, BookOpenText, MessageCircle, Send, Award, FileBadge
} from 'lucide-react';
import { ChurchContext, ConfirmModal } from '../App';

interface Familia {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  statusEspiritual: 'ativa' | 'nova_convertida' | 'discipulado' | 'crise' | 'restaurada';
  membros: {
    membroId?: string; // id do cadastro geral se houver
    nome: string;
    idade: number;
    parentesco: string; // Pai, Mãe, Filho, Avô, etc.
    estadoCivil: string;
    batizado: boolean;
    discipulado: boolean;
    necessidadeEspecial: string;
  }[];
  historicoEventos: string[];
  notasPastorais: string[];
}

interface LiderFamilia {
  id: string;
  nome: string;
  funcao: 'geral' | 'casais' | 'jovens' | 'pais_filhos' | 'crise' | 'aconselhamento';
  formacao: string;
  telefone: string;
  familiasCuidado: string[]; // IDs de familias
  relatoriosAtividades: string[];
}

interface EventoFamilia {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'retiro' | 'encontro' | 'culto' | 'conferencia';
  data: string;
  horario: string;
  local: string;
  capacidade: number;
  inscritos: string[]; // lista de nomes/famílias inscritas
  presencaRegistrada: boolean;
  feedback: { autor: string; nota: number; comentario: string }[];
}

interface TreinamentoFamilia {
  id: string;
  titulo: string;
  objetivo: string;
  conteudo: string;
  baseBiblica: string;
  instrutor: string;
  cargaHoraria: number;
  participantes: { nome: string; concluido: boolean; certificadoEmitido?: boolean }[];
}

interface Aconselhamento {
  id: string;
  familiaId: string;
  mentorId: string;
  data: string;
  tema: string;
  notasConfidenciais: string;
  proximosPassos: string[];
  status: 'em_andamento' | 'concluido';
}

interface MaterialDevocional {
  id: string;
  titulo: string;
  tipo: 'devocional' | 'apostila' | 'video' | 'podcast';
  autor: string;
  referenciaBiblica: string;
  publicoAlvo: 'casais' | 'jovens' | 'pais' | 'geral';
  link: string;
}

const ModuleFamilia: React.FC = () => {
  const { db, addToast, callGeminiAI, user, setPrintMode, setPrintData, setPreviewOpen } = useContext(ChurchContext);
  const churchName = db?.igreja?.nome || 'Assembleia de Deus';
  const dbMembros = db?.membros || [];

  const [tab, setTab] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Custom delete confirmation modal state
  const [deleteConfirmInfo, setDeleteConfirmInfo] = useState<{
    type: 'familia' | 'lider' | 'evento' | 'treinamento';
    id: string;
  } | null>(null);

  // ----------------------------------------
  // ESTADOS DE CARGA / ARMAZENAMENTO LOCAL
  // ----------------------------------------
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [lideres, setLideres] = useState<LiderFamilia[]>([]);
  const [eventos, setEventos] = useState<EventoFamilia[]>([]);
  const [treinamentos, setTreinamentos] = useState<TreinamentoFamilia[]>([]);
  const [aconselhamentos, setAconselhamentos] = useState<Aconselhamento[]>([]);
  const [materiais, setMateriais] = useState<MaterialDevocional[]>([]);

  // Inicialização com dados padrão ricos baseados em cadastro de membros se houver
  useEffect(() => {
    const localFam = localStorage.getItem('mf_familias');
    const localLid = localStorage.getItem('mf_lideres');
    const localEve = localStorage.getItem('mf_eventos');
    const localTre = localStorage.getItem('mf_treinamentos');
    const localAco = localStorage.getItem('mf_aconselhamentos');
    const localMat = localStorage.getItem('mf_materiais');

    if (localFam) setFamilias(JSON.parse(localFam));
    else {
      // Criação de famílias iniciais simuladas a partir de dbMembros ou dados mock qualificados
      const defaultFam: Familia[] = [
        {
          id: 'fam_1',
          nome: 'Família Silva Oliveira',
          endereco: 'Rua das Oliveiras, 120 - Sede',
          telefone: '(11) 98765-4321',
          statusEspiritual: 'ativa',
          membros: [
            { nome: 'Carlos Oliveira', idade: 45, parentesco: 'Pai (Cabeça do Lar)', estadoCivil: 'Casado', batizado: true, discipulado: true, necessidadeEspecial: '' },
            { nome: 'Eliana Silva Oliveira', idade: 42, parentesco: 'Mãe', estadoCivil: 'Casado', batizado: true, discipulado: true, necessidadeEspecial: '' },
            { nome: 'Lucas Silva Oliveira', idade: 16, parentesco: 'Filho', estadoCivil: 'Solteiro', batizado: true, discipulado: false, necessidadeEspecial: '' },
            { nome: 'Beatriz Silva Oliveira', idade: 9, parentesco: 'Filha', estadoCivil: 'Solteira', batizado: false, discipulado: false, necessidadeEspecial: '' }
          ],
          historicoEventos: ['Encontro de Casais 2025', 'Culto do Lar Geral'],
          notasPastorais: ['Família bem integrada nas atividades. Lucas está na liderança de adolescentes.']
        },
        {
          id: 'fam_2',
          nome: 'Família Santos Pereira',
          endereco: 'Av. Paulista, 2040 - Ap 42',
          telefone: '(11) 99888-1122',
          statusEspiritual: 'crise',
          membros: [
            { nome: 'Ricardo Pereira', idade: 38, parentesco: 'Pai', estadoCivil: 'Casado', batizado: true, discipulado: false, necessidadeEspecial: '' },
            { nome: 'Mariana Santos Pereira', idade: 36, parentesco: 'Mãe', estadoCivil: 'Casado', batizado: true, discipulado: true, necessidadeEspecial: '' },
            { nome: 'Sofia Santos Pereira', idade: 6, parentesco: 'Filha', estadoCivil: 'Solteira', batizado: false, discipulado: false, necessidadeEspecial: '' }
          ],
          historicoEventos: ['Culto da Família'],
          notasPastorais: ['Passando por crise financeira e conjugal. Necessita de visitas frequentes e mentoria de casais.']
        },
        {
          id: 'fam_3',
          nome: 'Família Albuquerque Costa',
          endereco: 'Alameda Lorena, 450 - Jardins',
          telefone: '(11) 97766-5544',
          statusEspiritual: 'nova_convertida',
          membros: [
            { nome: 'Fernando Costa', idade: 29, parentesco: 'Pai', estadoCivil: 'Casado', batizado: false, discipulado: true, necessidadeEspecial: '' },
            { nome: 'Juliana Albuquerque', idade: 27, parentesco: 'Mãe', estadoCivil: 'Casado', batizado: false, discipulado: true, necessidadeEspecial: '' }
          ],
          historicoEventos: [],
          notasPastorais: ['Novos convertidos integrados pelo evangelismo de rua. Iniciando curso de batismo.']
        }
      ];
      setFamilias(defaultFam);
      localStorage.setItem('mf_familias', JSON.stringify(defaultFam));
    }

    if (localLid) setLideres(JSON.parse(localLid));
    else {
      const defaultLid: LiderFamilia[] = [
        { id: 'lid_1', nome: 'Pr. Marcos Souza & Pra. Ester', funcao: 'geral', formacao: 'Bacharel em Teologia (FAETAD) & Psicologia', telefone: '(11) 91111-2222', familiasCuidado: ['fam_1', 'fam_2'], relatoriosAtividades: ['Planejamento Anual Concluído', 'Sessão com conselho de casais'] },
        { id: 'lid_2', nome: 'Ev. Roberto Silva & Ir. Ruth', funcao: 'crise', formacao: 'Capelania e Aconselhamento Pastoral', telefone: '(11) 93333-4444', familiasCuidado: ['fam_2'], relatoriosAtividades: ['Visitas emergenciais realizadas no lar do Ricardo Pereira'] },
        { id: 'lid_3', nome: 'Pb. André Costa & Ir. Clara', funcao: 'casais', formacao: `Curso de Especialização da Família ${db?.igreja?.nome || 'Convenção'}`, telefone: '(11) 95555-6666', familiasCuidado: ['fam_3'], relatoriosAtividades: ['Mentoria inicial com casal Fernando e Juliana'] }
      ];
      setLideres(defaultLid);
      localStorage.setItem('mf_lideres', JSON.stringify(defaultLid));
    }

    if (localEve) {
      const parsed = JSON.parse(localEve);
      const mapped = parsed.map((e: any) => {
        if (e.titulo === 'Conferência de Famílias CGADB 2026' || e.titulo?.startsWith('Conferência de Famílias') || e.titulo?.startsWith('CONFERÊNCIA DE FAMÍLIAS')) {
          return { ...e, titulo: `CONFERÊNCIA DE FAMÍLIAS (${db?.igreja?.nome || 'Igreja Sede'})` };
        }
        return e;
      });
      setEventos(mapped);
    } else {
      const defaultEve: EventoFamilia[] = [
        { id: 'eve_1', titulo: `CONFERÊNCIA DE FAMÍLIAS (${db?.igreja?.nome || 'Igreja Sede'})`, descricao: 'Grande encontro de edificação para toda a igreja sede e filiais.', tipo: 'conferencia', data: '2026-08-15', horario: '19:00', local: 'Templo Sede', capacidade: 500, inscritos: ['Família Silva Oliveira', 'Família Albuquerque Costa'], presencaRegistrada: true, feedback: [{ autor: 'Carlos Oliveira', nota: 5, comentario: 'Edificação extraordinária para meu lar!' }] },
        { id: 'eve_2', titulo: 'Retiro de Casais Aliançados', descricao: 'Fim de semana focado no fortalecimento conjugal conforme Efésios 5.', tipo: 'retiro', data: '2026-10-12', horario: '08:00', local: 'Chácara Peniel', capacidade: 40, inscritos: ['Família Silva Oliveira'], presencaRegistrada: false, feedback: [] }
      ];
      setEventos(defaultEve);
      localStorage.setItem('mf_eventos', JSON.stringify(defaultEve));
    }

    if (localTre) setTreinamentos(JSON.parse(localTre));
    else {
      const defaultTre: TreinamentoFamilia[] = [
        { id: 'tre_1', titulo: 'Curso de Noivos & Recém-Casados', objetivo: 'Preparar solteiros e firmar casais novos nas colunas bíblicas tradicionais.', conteudo: 'Comunicação mansa, resolução de conflitos, sexualidade santa e mordomia.', baseBiblica: 'Efésios 5:22-33, Tito 2:3-5', instrutor: 'Pr. Marcos Souza', cargaHoraria: 12, participantes: [{ nome: 'Fernando Costa', concluido: true, certificadoEmitido: true }, { nome: 'Juliana Albuquerque', concluido: true, certificadoEmitido: true }] },
        { id: 'tre_2', titulo: 'Mordomia Financeira e Orçamento do Lar', objetivo: 'Capacitar famílias para a prosperidade bíblica e controle de dívidas.', conteudo: 'Trabalho, honestidade, dízimos, ofertas, reserva e corte de supérfluos.', baseBiblica: 'Provérbios 22:7, Malaquias 3:10', instrutor: 'Pb. André Costa', cargaHoraria: 6, participantes: [{ nome: 'Ricardo Pereira', concluido: false }] }
      ];
      setTreinamentos(defaultTre);
      localStorage.setItem('mf_treinamentos', JSON.stringify(defaultTre));
    }

    if (localAco) setAconselhamentos(JSON.parse(localAco));
    else {
      const defaultAco: Aconselhamento[] = [
        { id: 'aco_1', familiaId: 'fam_2', mentorId: 'lid_2', data: '2026-06-10', tema: 'Resgate Conjugal e Planejamento Econômico', notasConfidenciais: 'Casal demonstrou cansaço espiritual. Foram orientados a fazer oração conjunta diária e cortar dívidas de cartão de crédito.', proximosPassos: ['Realizar culto doméstico 2x por semana', 'Participar do curso de Finanças da igreja'], status: 'em_andamento' }
      ];
      setAconselhamentos(defaultAco);
      localStorage.setItem('mf_aconselhamentos', JSON.stringify(defaultAco));
    }

    if (localMat) setMateriais(JSON.parse(localMat));
    else {
      const defaultMat: MaterialDevocional[] = [
        { id: 'mat_1', titulo: 'Guia Prático do Altar Familiar (Culto Doméstico)', tipo: 'devocional', autor: `Comissão de Família ${db?.igreja?.nome || 'Igreja'}`, referenciaBiblica: 'Josué 24:15', publicoAlvo: 'geral', link: '#' },
        { id: 'mat_2', titulo: 'Os 5 Pilares do Lar Assembleiano', tipo: 'apostila', autor: 'Pr. Marcos Souza', referenciaBiblica: 'Provérbios 22:6, Efésios 5', publicoAlvo: 'casais', link: '#' }
      ];
      setMateriais(defaultMat);
      localStorage.setItem('mf_materiais', JSON.stringify(defaultMat));
    }
  }, [db?.igreja?.nome]);

  // Helpers para persistência rápida
  const saveFamilias = (data: Familia[]) => {
    setFamilias(data);
    localStorage.setItem('mf_familias', JSON.stringify(data));
  };
  const saveLideres = (data: LiderFamilia[]) => {
    setLideres(data);
    localStorage.setItem('mf_lideres', JSON.stringify(data));
  };
  const saveEventos = (data: EventoFamilia[]) => {
    setEventos(data);
    localStorage.setItem('mf_eventos', JSON.stringify(data));
  };
  const saveTreinamentos = (data: TreinamentoFamilia[]) => {
    setTreinamentos(data);
    localStorage.setItem('mf_treinamentos', JSON.stringify(data));
  };
  const saveAconselhamentos = (data: Aconselhamento[]) => {
    setAconselhamentos(data);
    localStorage.setItem('mf_aconselhamentos', JSON.stringify(data));
  };
  const saveMateriais = (data: MaterialDevocional[]) => {
    setMateriais(data);
    localStorage.setItem('mf_materiais', JSON.stringify(data));
  };

  // ----------------------------------------
  // FORMULÁRIOS & CRIAÇÃO (MODAIS SIMPLIFICADOS)
  // ----------------------------------------
  const [showFamModal, setShowFamModal] = useState(false);
  const [editingFam, setEditingFam] = useState<Familia | null>(null);
  const [famNome, setFamNome] = useState('');
  const [famEndereco, setFamEndereco] = useState('');
  const [famTelefone, setFamTelefone] = useState('');
  const [famStatus, setFamStatus] = useState<Familia['statusEspiritual']>('ativa');
  const [famMembros, setFamMembros] = useState<Familia['membros']>([]);

  // Campos para novo membro da família no modal
  const [newMembNome, setNewMembNome] = useState('');
  const [newMembIdade, setNewMembIdade] = useState('');
  const [newMembParentesco, setNewMembParentesco] = useState('Filho');
  const [newMembEstadoCivil, setNewMembEstadoCivil] = useState('Solteiro');
  const [newMembBatizado, setNewMembBatizado] = useState(false);
  const [newMembDiscipulado, setNewMembDiscipulado] = useState(false);
  const [selectedMembroGeralId, setSelectedMembroGeralId] = useState('');

  const handleOpenFamModal = (fam: Familia | null = null) => {
    if (fam) {
      setEditingFam(fam);
      setFamNome(fam.nome);
      setFamEndereco(fam.endereco);
      setFamTelefone(fam.telefone);
      setFamStatus(fam.statusEspiritual);
      setFamMembros(fam.membros);
    } else {
      setEditingFam(null);
      setFamNome('');
      setFamEndereco('');
      setFamTelefone('');
      setFamStatus('ativa');
      setFamMembros([]);
    }
    setNewMembNome('');
    setNewMembIdade('');
    setNewMembParentesco('Filho');
    setNewMembEstadoCivil('Solteiro');
    setNewMembBatizado(false);
    setNewMembDiscipulado(false);
    setSelectedMembroGeralId('');
    setShowFamModal(true);
  };

  const handleAddMembroToFamList = () => {
    let finalNome = newMembNome;
    let finalIdade = Number(newMembIdade) || 0;
    let finalEstado = newMembEstadoCivil;
    let finalBatizado = newMembBatizado;
    let finalDiscipulado = newMembDiscipulado;

    if (selectedMembroGeralId) {
      const original = dbMembros.find((m: any) => m.id === selectedMembroGeralId);
      if (original) {
        finalNome = original.nome;
        finalEstado = original.estado_civil || 'Solteiro';
        finalBatizado = original.batizado === 'Sim' || original.batizado === true;
        // Calcular idade simples baseada na data de nascimento se houver
        if (original.data_nascimento) {
          const birthYear = new Date(original.data_nascimento).getFullYear();
          finalIdade = new Date().getFullYear() - birthYear;
        }
      }
    }

    if (!finalNome.trim()) {
      if (addToast) addToast('Digite o nome ou selecione um membro do cadastro geral.', 'warning');
      return;
    }

    const item: Familia['membros'][0] = {
      membroId: selectedMembroGeralId || undefined,
      nome: finalNome,
      idade: finalIdade,
      parentesco: newMembParentesco,
      estadoCivil: finalEstado,
      batizado: finalBatizado,
      discipulado: finalDiscipulado,
      necessidadeEspecial: ''
    };

    setFamMembros([...famMembros, item]);
    setNewMembNome('');
    setNewMembIdade('');
    setSelectedMembroGeralId('');
    if (addToast) addToast('Membro adicionado ao núcleo familiar.', 'success');
  };

  const handleSaveFam = () => {
    if (!famNome.trim()) {
      if (addToast) addToast('O nome da família é obrigatório.', 'warning');
      return;
    }

    if (editingFam) {
      const atualizadas = familias.map(f => {
        if (f.id === editingFam.id) {
          return {
            ...f,
            nome: famNome,
            endereco: famEndereco,
            telefone: famTelefone,
            statusEspiritual: famStatus,
            membros: famMembros
          };
        }
        return f;
      });
      saveFamilias(atualizadas);
      if (addToast) addToast('Dados do núcleo familiar atualizados.', 'success');
    } else {
      const nova: Familia = {
        id: 'fam_' + Date.now(),
        nome: famNome,
        endereco: famEndereco,
        telefone: famTelefone,
        statusEspiritual: famStatus,
        membros: famMembros,
        historicoEventos: [],
        notasPastorais: []
      };
      saveFamilias([...familias, nova]);
      if (addToast) addToast('Novo núcleo familiar cadastrado com sucesso!', 'success');
    }
    setShowFamModal(false);
  };

  const handleDeleteFam = (id: string) => {
    setDeleteConfirmInfo({ type: 'familia', id });
  };

  const handleExecuteDelete = () => {
    if (!deleteConfirmInfo) return;
    const { type, id } = deleteConfirmInfo;
    if (type === 'familia') {
      saveFamilias(familias.filter(f => f.id !== id));
      if (addToast) addToast('Família removida.', 'success');
    } else if (type === 'lider') {
      saveLideres(lideres.filter(l => l.id !== id));
      if (addToast) addToast('Coordenação removida.', 'success');
    } else if (type === 'evento') {
      saveEventos(eventos.filter(e => e.id !== id));
      if (addToast) addToast('Evento pastoral removido.', 'success');
    } else if (type === 'treinamento') {
      saveTreinamentos(treinamentos.filter(t => t.id !== id));
      if (addToast) addToast('Curso removido.', 'success');
    }
    setDeleteConfirmInfo(null);
  };

  // ----------------------------------------
  // OUTROS MODAIS SIMPLIFICADOS (COORDENAÇÃO, EVENTOS, CURSOS)
  // ----------------------------------------
  const [showLidModal, setShowLidModal] = useState(false);
  const [lidNome, setLidNome] = useState('');
  const [lidFuncao, setLidFuncao] = useState<LiderFamilia['funcao']>('geral');
  const [lidFormacao, setLidFormacao] = useState('');
  const [lidTelefone, setLidTelefone] = useState('');

  const handleSaveLid = () => {
    if (!lidNome.trim()) {
      if (addToast) addToast('O nome do coordenador é obrigatório.', 'warning');
      return;
    }
    const novo: LiderFamilia = {
      id: 'lid_' + Date.now(),
      nome: lidNome,
      funcao: lidFuncao,
      formacao: lidFormacao,
      telefone: lidTelefone,
      familiasCuidado: [],
      relatoriosAtividades: ['Início de atividade cadastrada no painel.']
    };
    saveLideres([...lideres, novo]);
    setShowLidModal(false);
    if (addToast) addToast('Coordenador/Mentor adicionado.', 'success');
  };

  const [showEveModal, setShowEveModal] = useState(false);
  const [eveTitulo, setEveTitulo] = useState('');
  const [eveDesc, setEveDesc] = useState('');
  const [eveTipo, setEveTipo] = useState<EventoFamilia['tipo']>('culto');
  const [eveData, setEveData] = useState('');
  const [eveLocal, setEveLocal] = useState('');
  const [eveCapac, setEveCapac] = useState(100);

  const handleSaveEve = () => {
    if (!eveTitulo.trim() || !eveData) {
      if (addToast) addToast('Título e data são obrigatórios.', 'warning');
      return;
    }
    const novo: EventoFamilia = {
      id: 'eve_' + Date.now(),
      titulo: eveTitulo,
      descricao: eveDesc,
      tipo: eveTipo,
      data: eveData,
      horario: '19:30',
      local: eveLocal,
      capacidade: Number(eveCapac) || 100,
      inscritos: [],
      presencaRegistrada: false,
      feedback: []
    };
    saveEventos([...eventos, novo]);
    setShowEveModal(false);
    if (addToast) addToast('Evento pastoral criado com sucesso.', 'success');
  };

  const [showCurModal, setShowCurModal] = useState(false);
  const [curTitulo, setCurTitulo] = useState('');
  const [curObjetivo, setCurObjetivo] = useState('');
  const [curBase, setCurBase] = useState('');
  const [curInstrutor, setCurInstrutor] = useState('');
  const [curCarga, setCurCarga] = useState(8);

  const handleSaveCur = () => {
    if (!curTitulo.trim()) {
      if (addToast) addToast('O título do curso/treinamento é obrigatório.', 'warning');
      return;
    }
    const novo: TreinamentoFamilia = {
      id: 'tre_' + Date.now(),
      titulo: curTitulo,
      objetivo: curObjetivo,
      conteudo: 'Apostilas, dinâmicas e fórum familiar de partilha.',
      baseBiblica: curBase,
      instrutor: curInstrutor,
      cargaHoraria: Number(curCarga) || 8,
      participantes: []
    };
    saveTreinamentos([...treinamentos, novo]);
    setShowCurModal(false);
    if (addToast) addToast('Curso de capacitação cadastrado.', 'success');
  };

  // ----------------------------------------
  // ACONSELHAMENTOS & INTEGRAÇÃO COM IA PASTORAL
  // ----------------------------------------
  const [showAcoModal, setShowAcoModal] = useState(false);
  const [acoFamId, setAcoFamId] = useState('');
  const [acoLidId, setAcoLidId] = useState('');
  const [acoTema, setAcoTema] = useState('');
  const [acoNotas, setAcoNotas] = useState('');
  const [selectedAcoForIA, setSelectedAcoForIA] = useState<Aconselhamento | null>(null);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResponse, setIaResponse] = useState('');

  const handleSaveAco = () => {
    if (!acoFamId || !acoTema.trim()) {
      if (addToast) addToast('Selecione a família e digite o tema.', 'warning');
      return;
    }
    const novo: Aconselhamento = {
      id: 'aco_' + Date.now(),
      familiaId: acoFamId,
      mentorId: acoLidId || 'lid_1',
      data: new Date().toISOString().split('T')[0],
      tema: acoTema,
      notasConfidenciais: acoNotas,
      proximosPassos: ['Realizar leitura mútua orientada no lar.'],
      status: 'em_andamento'
    };
    saveAconselhamentos([...aconselhamentos, novo]);
    setShowAcoModal(false);
    setAcoFamId('');
    setAcoTema('');
    setAcoNotas('');
    if (addToast) addToast('Sessão de aconselhamento iniciada.', 'success');
  };

  const handleIAStrategy = async (aco: Aconselhamento) => {
    setSelectedAcoForIA(aco);
    setIaLoading(true);
    setIaResponse('');
    const fam = familias.find(f => f.id === aco.familiaId);
    const lider = lideres.find(l => l.id === aco.mentorId);

    const prompt = `Aconselhamento de Família com IA Pastoral (Doutrina ${churchName}).
    Família: ${fam?.nome || 'Não informada'}
    Tema da Crise/Aconselhamento: ${aco.tema}
    Anotações Pastorais Confidenciais: ${aco.notasConfidenciais}
    Coordenador/Mentor: ${lider?.nome || 'Pastor Local'}

    Por favor, elabore uma estratégia teológica pentecostal clássica focada em reconciliação, cura e edificação espiritual. Inclua:
    1. Três referências exegéticas (com versículo e aplicação direta para o casal ou pais).
    2. Duas tarefas práticas para realizar em casa (dever de casa para crescimento do altar familiar).
    3. Uma proposta de mentoria de acompanhamento pastoral.
    Formate o texto de forma pastoral, direta, sem jargões excessivos de TI ou programação, focando estritamente na edificação cristã.`;

    try {
      const response = await callGeminiAI(prompt);
      setIaResponse(response);
    } catch (err) {
      setIaResponse('Ocorreu um erro ao consultar a IA Pastoral. Tente novamente mais tarde.');
    } finally {
      setIaLoading(false);
    }
  };

  // ----------------------------------------
  // GERADOR DE CULTO DOMÉSTICO (DEVOCIONAIS COM IA)
  // ----------------------------------------
  const [devTheme, setDevTheme] = useState<string>('gratidao');
  const [devProfile, setDevProfile] = useState<string>('casal_filhos_pequenos');
  const [devGenerating, setDevGenerating] = useState(false);
  const [devResult, setDevResult] = useState<any>(null);
  const [devError, setDevError] = useState<string | null>(null);

  const handleGenerateDevotional = async () => {
    setDevGenerating(true);
    setDevError(null);
    setDevResult(null);

    const themes: Record<string, string> = {
      gratidao: 'Gratidão em Tempos de Crise (Altar de Adoração)',
      perdao: 'O Perdão como Restaurador do Lar (Reconciliação e Unidade)',
      criacao_filhos: 'Instruindo os Filhos no Caminho do Senhor (Educação Bíblica, Provérbios 22:6)',
      financas: 'Mordomia Financeira e Unidade Conjugal (Fidelidade nos Dízimos e Ofertas)',
      culto_domestico: 'O Altar de Oração da Família (Culto Doméstico e Intercessão)',
      comunicacao: 'Comunicação Mansa e Edificante no Casamento (Colossenses 4:6)'
    };

    const profiles: Record<string, string> = {
      casal_filhos_pequenos: 'Casal com filhos pequenos (fase da infância e alfabetização)',
      casal_filhos_adolescentes: 'Casal com filhos adolescentes e jovens (fase da juventude e pressões escolares)',
      recem_casados: 'Recém-casados (primeiros anos de aliança e ajustes)',
      casados_longa_data: 'Casal maduro / Casados de longa data (fase do ninho vazio)',
      pais_solo: 'Mãe/Pai solo criando filhos sob os preceitos cristãos assembleianos'
    };

    const prompt = `Como um experiente Pastor e Conselheiro de Família de ${churchName}, crie um roteiro oficial, pedagógico e inspirador para o Culto Doméstico em Família.
    
    TEMA PRINCIPAL: ${themes[devTheme]}
    PERFIL DA FAMÍLIA: ${profiles[devProfile]}
    
    Por favor, retorne os dados no formato JSON EXCLUSIVAMENTE, sem markdown externo, para que eu possa renderizar diretamente na tela. O JSON deve conter os seguintes campos:
    {
      "titulo_devocional": "Título forte e acolhedor para o altar",
      "leitura_biblica": "Referência bíblica exata (ex: Josué 24:14-15) e o texto completo do principal versículo",
      "quebra_gelo": "Uma brincadeira ou pergunta simples e rápida para iniciar com descontração",
      "explicacao_teologica": "Explicação teológica breve e didática (2 parágrafos) alinhada com o capítulo 24 da Declaração de Fé de ${churchName}",
      "pergunta_dialogo": "Uma pergunta profunda para todos os familiares responderem na mesa",
      "oracao_proposta": "Direcionamento e motivos específicos de oração para a família de mãos dadas",
      "desafio_pratico": "Um desafio prático de amor para aplicar durante a semana"
    }`;

    try {
      const responseText = await callGeminiAI(prompt);
      // Limpar possíveis blocos de código ```json no início/fim
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      const data = JSON.parse(cleanText.trim());
      setDevResult(data);
      if (addToast) addToast('Roteiro de Culto Doméstico gerado com sucesso!', 'success');
    } catch (err: any) {
      console.error(err);
      setDevError('Não foi possível gerar um JSON estruturado. Tente gerar novamente ou escolha outro tema.');
    } finally {
      setDevGenerating(false);
    }
  };

  // ----------------------------------------
  // CAPÍTULO 24 DA CGADB - QUIZ DOUTRINÁRIO
  // ----------------------------------------
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleQuizAnswer = (questionIndex: number, optionLetter: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionLetter
    });
  };

  const handleQuizSubmit = () => {
    let score = 0;
    if (selectedAnswers[1] === 'A') score += 50;
    if (selectedAnswers[2] === 'C') score += 50;
    setQuizScore(score);
    setQuizSubmitted(true);
    if (addToast) addToast(`Quiz Concluído! Pontuação: ${score}%`, 'success');
  };

  // Filtro de Famílias
  const filteredFamilias = familias.filter(f => 
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.membros.some(m => m.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header do Módulo */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 rounded-[2rem] p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10">
          <Heart size={300} />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Doutrina e Fortalecimento de Lares</span>
          <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
            <Heart className="animate-pulse" /> Ministério da Família e Casais
          </h1>
          <p className="text-xs text-white/80 max-w-2xl font-bold uppercase tracking-wider">
            Alinhado ao Capítulo 24 da Declaração de Fé de {churchName}. Agrupamento familiar automático, mentoria de casais, altar doméstico interativo e IA Pastoral.
          </p>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
        {[
          { id: 1, label: 'Painel Geral', icon: Activity },
          { id: 2, label: 'Núcleos Familiares', icon: Users },
          { id: 3, label: 'Coordenação e Mentores', icon: HeartHandshake },
          { id: 4, label: 'Encontros e Retiros', icon: Calendar },
          { id: 5, label: 'Cursos e Certificações', icon: GraduationCap },
          { id: 6, label: 'IA Pastoral & Aconselhamento', icon: Sparkles },
          { id: 7, label: 'Culto Doméstico (IA)', icon: BookOpenText },
          { id: 8, label: 'Capítulo 24 (Apostila & Quiz)', icon: FileText }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-250 ${
                tab === t.id 
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/10' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-800'
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ----------------------------------------------------
          TAB 1: PAINEL GERAL (DASHBOARD)
          ---------------------------------------------------- */}
      {tab === 1 && (
        <div className="space-y-6">
          {/* Bento Grid de Indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Famílias Ativas</span>
              <p className="text-3xl font-black text-slate-800">{familias.filter(f=>f.statusEspiritual==='ativa'||f.statusEspiritual==='restaurada').length}</p>
              <span className="text-[9px] text-emerald-600 font-bold uppercase">Lar estruturado e integrado</span>
              <Heart className="absolute right-4 bottom-4 text-rose-100 -z-0" size={48} />
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Em Acompanhamento / Crise</span>
              <p className="text-3xl font-black text-rose-600">{familias.filter(f=>f.statusEspiritual==='crise').length}</p>
              <span className="text-[9px] text-rose-500 font-bold uppercase">Necessitam de visita urgente</span>
              <AlertCircle className="absolute right-4 bottom-4 text-rose-50/80 -z-0" size={48} />
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Novos Convertidos (Lares)</span>
              <p className="text-3xl font-black text-indigo-600">{familias.filter(f=>f.statusEspiritual==='nova_convertida').length}</p>
              <span className="text-[9px] text-indigo-500 font-bold uppercase">Em processo de discipulado</span>
              <Users className="absolute right-4 bottom-4 text-indigo-50/80 -z-0" size={48} />
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-2 relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mentores Ativos</span>
              <p className="text-3xl font-black text-slate-800">{lideres.length}</p>
              <span className="text-[9px] text-slate-500 font-bold uppercase">Casais capacitados para mentoria</span>
              <HeartHandshake className="absolute right-4 bottom-4 text-slate-100 -z-0" size={48} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monitoramento de Crises e Visitas Prioritárias */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2rem] p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2">
                  <Activity size={16} className="text-rose-500" />
                  Lares em Alerta / Visitas Prioritárias
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Acompanhamento e cuidado preventivo para evitar divórcios e fraturas familiares.</p>
              </div>

              <div className="space-y-3">
                {familias.filter(f=>f.statusEspiritual==='crise').length > 0 ? (
                  familias.filter(f=>f.statusEspiritual==='crise').map(fam => (
                    <div key={fam.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-rose-50/30 border border-rose-100 p-4 rounded-2xl">
                      <div>
                        <h3 className="text-xs font-black text-slate-800 uppercase">{fam.nome}</h3>
                        <p className="text-[10px] text-slate-500 font-bold">Contato: {fam.telefone} | Endereço: {fam.endereco}</p>
                        <p className="text-[11px] text-rose-700 italic font-medium mt-1">"{fam.notasPastorais[0] || 'Nenhuma nota informada'}"</p>
                      </div>
                      <button 
                        onClick={() => { setTab(6); setAcoFamId(fam.id); setShowAcoModal(true); }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-wider rounded-lg transition-all"
                      >
                        Iniciar Aconselhamento
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold">
                    <CheckCircle className="text-emerald-500 mx-auto mb-2" size={24} />
                    Glória a Deus! Nenhum lar registrado em crise aguda no momento.
                  </div>
                )}
              </div>
            </div>

            {/* Frentes Doutrinárias - Base Teológica */}
            <div className="bg-indigo-950 text-white rounded-[2rem] p-6 space-y-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 opacity-5">
                <BookOpen size={180} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">Pilares Doutrinários da Família</h3>
              <div className="space-y-4 text-xs">
                <div className="border-l-2 border-rose-500 pl-3">
                  <span className="font-black uppercase text-[10px] text-rose-400">Sacerdócio do Lar</span>
                  <p className="text-white/80 mt-0.5">O homem como cabeça e sacerdote do lar, conduzindo a esposa e filhos na santidade das Escrituras.</p>
                  <span className="text-[9px] font-black uppercase text-indigo-300">— Josué 24:15</span>
                </div>
                <div className="border-l-2 border-indigo-400 pl-3">
                  <span className="font-black uppercase text-[10px] text-indigo-300">Aliança Indissolúvel</span>
                  <p className="text-white/80 mt-0.5">Defesa intransigente do casamento monogâmico tradicional e rejeição do divórcio consensual leviano.</p>
                  <span className="text-[9px] font-black uppercase text-indigo-300">— Efésios 5:31</span>
                </div>
                <div className="border-l-2 border-emerald-400 pl-3">
                  <span className="font-black uppercase text-[10px] text-emerald-300">Instrução Religiosa Infantil</span>
                  <p className="text-white/80 mt-0.5">Dever indelegável dos pais em discipular os filhos no temor do Senhor e na obediência.</p>
                  <span className="text-[9px] font-black uppercase text-indigo-300">— Provérbios 22:6</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: CADASTRO E VÍNCULO FAMILIAR (FAMÍLIAS)
          ---------------------------------------------------- */}
      {tab === 2 && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-base font-black text-slate-800 uppercase flex items-center gap-2">
                  <Users size={18} className="text-rose-500" />
                  Famílias e Núcleos Familiares
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase">Criação de perfis familiares agrupando membros. Cada lar possui uma jornada espiritual própria.</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Buscar família ou membro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400"
                  />
                </div>
                <button 
                  onClick={() => handleOpenFamModal(null)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1 transition-all"
                >
                  <Plus size={14} /> Cadastrar Família
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFamilias.map(fam => {
                const statusStyles = {
                  ativa: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  nova_convertida: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                  discipulado: 'bg-blue-50 text-blue-700 border-blue-100',
                  crise: 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse',
                  restaurada: 'bg-amber-50 text-amber-700 border-amber-100'
                };

                const statusLabel = {
                  ativa: 'Lar Ativo / Saudável',
                  nova_convertida: 'Lar Novo Convertido',
                  discipulado: 'Em Discipulado do Lar',
                  crise: 'Crise / Atenção Especial',
                  restaurada: 'Lar Restaurado (Glória a Deus)'
                };

                return (
                  <div key={fam.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-[2rem] p-5 space-y-4 transition-all">
                    <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase">{fam.nome}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{fam.membros.length} integrantes vinculados</p>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${statusStyles[fam.statusEspiritual]}`}>
                        {statusLabel[fam.statusEspiritual]}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Membros do Lar:</span>
                      <ul className="space-y-1">
                        {fam.membros.map((memb, idx) => (
                          <li key={idx} className="flex justify-between items-center text-xs text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                            <div>
                              <span className="font-bold text-slate-800">{memb.nome}</span>
                              <span className="text-[9px] text-slate-400 font-bold block">{memb.parentesco} • {memb.idade} anos</span>
                            </div>
                            <div className="flex gap-1.5">
                              {memb.batizado && <span className="bg-blue-50 border border-blue-100 text-blue-600 font-black text-[8px] uppercase px-1 rounded">BAT</span>}
                              {memb.discipulado && <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 font-black text-[8px] uppercase px-1 rounded">DISC</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-50/50 p-3 rounded-2xl space-y-1 border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato & Endereço:</p>
                      <p className="font-bold text-slate-700">{fam.telefone}</p>
                      <p className="text-[11px] leading-relaxed text-slate-500">{fam.endereco}</p>
                    </div>

                    <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-100">
                      <button 
                        onClick={() => handleDeleteFam(fam.id)}
                        className="text-rose-400 hover:text-rose-600 font-bold text-xs p-1"
                        title="Deletar Família"
                      >
                        <Trash2 size={15} />
                      </button>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setTab(6); setAcoFamId(fam.id); setShowAcoModal(true); }}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all"
                        >
                          Pastorar
                        </button>
                        <button 
                          onClick={() => handleOpenFamModal(fam)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all"
                        >
                          Editar Lar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CADASTRO/EDIÇÃO DE FAMÍLIA */}
      {showFamModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800 uppercase flex items-center gap-2">
                <Heart className="text-rose-500" size={18} />
                {editingFam ? 'Editar Núcleo Familiar' : 'Novo Cadastro de Família'}
              </h3>
              <button onClick={() => setShowFamModal(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nome da Família (Ex: Família Souza):</label>
                  <input 
                    type="text" 
                    value={famNome}
                    onChange={(e) => setFamNome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400"
                    placeholder="Família Santos..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Status Espiritual:</label>
                  <select 
                    value={famStatus}
                    onChange={(e) => setFamStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400"
                  >
                    <option value="ativa">Ativa e Saudável</option>
                    <option value="nova_convertida">Nova Convertida</option>
                    <option value="discipulado">Em Discipulado</option>
                    <option value="crise">Em Crise / Alerta Pastoral</option>
                    <option value="restaurada">Lar Restaurado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Endereço da Família:</label>
                  <input 
                    type="text" 
                    value={famEndereco}
                    onChange={(e) => setFamEndereco(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400"
                    placeholder="Rua, Número, Bairro..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Telefone Principal (WhatsApp):</label>
                  <input 
                    type="text" 
                    value={famTelefone}
                    onChange={(e) => setFamTelefone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {/* VINCULAR INTEGRANTES DA FAMÍLIA */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Membros do Núcleo Familiar</span>
                
                {/* Lista Atual */}
                <div className="space-y-1.5">
                  {famMembros.map((m, i) => (
                    <div key={i} className="flex justify-between items-center text-xs bg-white border border-slate-200 px-3 py-2 rounded-xl">
                      <div>
                        <span className="font-bold text-slate-800">{m.nome}</span>
                        <span className="text-[9px] text-slate-400 font-bold block">{m.parentesco} • {m.idade} anos • {m.estadoCivil}</span>
                      </div>
                      <button 
                        onClick={() => setFamMembros(famMembros.filter((_, idx) => idx !== i))}
                        className="text-rose-500 hover:text-rose-700 font-bold"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                  {famMembros.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">Nenhum integrante vinculado ainda. Adicione abaixo.</p>
                  )}
                </div>

                {/* Adicionar Integrante */}
                <div className="border-t border-slate-200/60 pt-4 space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Vincular Novo Integrante</span>
                  
                  {/* Seletor Integrado com Cadastro de Membros */}
                  {dbMembros.length > 0 && (
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Buscar no Cadastro Geral de Membros da Igreja:</label>
                      <select 
                        value={selectedMembroGeralId}
                        onChange={(e) => setSelectedMembroGeralId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400"
                      >
                        <option value="">-- Selecione do Rol de Membros da Igreja --</option>
                        {dbMembros.map((m: any) => (
                          <option key={m.id} value={m.id}>{m.nome} ({m.estado_civil || 'Solteiro'})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!selectedMembroGeralId && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Nome Completo:</label>
                        <input 
                          type="text" 
                          value={newMembNome}
                          onChange={(e) => setNewMembNome(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400"
                          placeholder="Nome do integrante..."
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Idade:</label>
                        <input 
                          type="number" 
                          value={newMembIdade}
                          onChange={(e) => setNewMembIdade(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400"
                          placeholder="Idade do integrante..."
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Parentesco no Lar:</label>
                      <select 
                        value={newMembParentesco}
                        onChange={(e) => setNewMembParentesco(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="Pai (Cabeça do Lar)">Pai (Cabeça do Lar)</option>
                        <option value="Mãe">Mãe</option>
                        <option value="Filho">Filho</option>
                        <option value="Filha">Filha</option>
                        <option value="Avô">Avô</option>
                        <option value="Avó">Avó</option>
                        <option value="Tio/Tia">Tio/Tia</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Estado Civil:</label>
                      <select 
                        value={newMembEstadoCivil}
                        onChange={(e) => setNewMembEstadoCivil(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="Casado">Casado</option>
                        <option value="Solteiro">Solteiro</option>
                        <option value="Noivo">Noivo</option>
                        <option value="Divorciado">Divorciado</option>
                        <option value="Viúvo">Viúvo</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                        <input type="checkbox" checked={newMembBatizado} onChange={(e)=>setNewMembBatizado(e.target.checked)} />
                        Batizado?
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                        <input type="checkbox" checked={newMembDiscipulado} onChange={(e)=>setNewMembDiscipulado(e.target.checked)} />
                        Discipulado?
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={handleAddMembroToFamList}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Vincular ao Lar
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowFamModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveFam}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-rose-600/10"
              >
                Salvar Família
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 3: COORDENAÇÃO E MENTORES (LIDERANÇAS)
          ---------------------------------------------------- */}
      {tab === 3 && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-base font-black text-slate-800 uppercase flex items-center gap-2">
                  <HeartHandshake size={18} className="text-rose-500" />
                  Coordenação e Líderes por Área
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase">Casais capacitados e mentores pastorais encarregados de acompanhar frentes ativas de cuidado.</p>
              </div>
              <button 
                onClick={() => {
                  setLidNome('');
                  setLidFuncao('geral');
                  setLidFormacao('');
                  setLidTelefone('');
                  setShowLidModal(true);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1"
              >
                <Plus size={14} /> Adicionar Mentor/Líder
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lideres.map(lid => {
                const funcLabels = {
                  geral: 'Líder Geral do Ministério',
                  casais: 'Coord. Casais & Noivos',
                  jovens: 'Coord. Jovens e Namoro',
                  pais_filhos: 'Coord. Pais e Filhos',
                  crise: 'Apoio Conjugal em Crise',
                  aconselhamento: 'Mentoria & Aconselhamento'
                };

                return (
                  <div key={lid.id} className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-[2rem] p-5 space-y-4 transition-all">
                    <div>
                      <span className="text-[9px] font-black uppercase text-rose-600 tracking-widest bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
                        {funcLabels[lid.funcao]}
                      </span>
                      <h3 className="text-sm font-black text-slate-800 uppercase mt-2.5">{lid.nome}</h3>
                    </div>

                    <div className="text-xs space-y-2 text-slate-600">
                      <p><strong>Formação Teológica/Apoio:</strong> {lid.formacao}</p>
                      <p><strong>Contato:</strong> {lid.telefone}</p>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl p-3 text-xs space-y-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Frentes de Trabalho / Relatórios:</span>
                      <ul className="space-y-1">
                        {lid.relatoriosAtividades.map((rel, idx) => (
                          <li key={idx} className="text-slate-500 list-disc list-inside">{rel}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                      <button 
                        onClick={() => {
                          setDeleteConfirmInfo({ type: 'lider', id: lid.id });
                        }}
                        className="text-rose-400 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Famílias sob cuidado: {lid.familiasCuidado.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL COORDENADOR */}
      {showLidModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 max-w-md w-full p-6 space-y-6 shadow-2xl animate-entrance">
            <h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2 border-b border-slate-100 pb-3">
              <HeartHandshake className="text-rose-500" size={18} />
              Novo Mentor / Coordenador
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nome do Casal ou Líder:</label>
                <input 
                  type="text" 
                  value={lidNome}
                  onChange={(e)=>setLidNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  placeholder="Ex: Pr. Marcos Souza & Pra. Ester"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Frente de Atuação / Função:</label>
                <select 
                  value={lidFuncao}
                  onChange={(e)=>setLidFuncao(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="geral">Coordenação Geral do Ministério</option>
                  <option value="casais">Curso de Casais & Noivos</option>
                  <option value="jovens">Corte, Namoro & Noivado</option>
                  <option value="pais_filhos">Pais & Filhos (Educação Infantil)</option>
                  <option value="crise">Acompanhamento e Resgate em Crises</option>
                  <option value="aconselhamento">Geral / Mentoria Eclesiástica</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Formação / Qualificação:</label>
                <input 
                  type="text" 
                  value={lidFormacao}
                  onChange={(e)=>setLidFormacao(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  placeholder="Ex: Seminário de Família, Psicólogo, Teólogo..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">WhatsApp de Contato:</label>
                <input 
                  type="text" 
                  value={lidTelefone}
                  onChange={(e)=>setLidTelefone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button onClick={()=>setShowLidModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl">Cancelar</button>
              <button onClick={handleSaveLid} className="px-4 py-2 bg-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-xl">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 4: EVENTOS E RETIROS (ENCONTROS DA FAMÍLIA)
          ---------------------------------------------------- */}
      {tab === 4 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-base font-black text-slate-800 uppercase flex items-center gap-2">
                  <Calendar size={18} className="text-rose-500" />
                  Agenda de Encontros, Cultos e Retiros da Família
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase">Planejamento e engajamento da família cristã em retiros, congressos e cultos festivos.</p>
              </div>
              <button 
                onClick={()=>{
                  setEveTitulo('');
                  setEveDesc('');
                  setEveTipo('culto');
                  setEveData('');
                  setEveLocal('');
                  setShowEveModal(true);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1"
              >
                <Plus size={14} /> Novo Evento Familiar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventos.map(eve => {
                const typeLabels = {
                  retiro: 'Retiro Espiritual',
                  encontro: 'Encontro de Casais',
                  culto: 'Culto da Família',
                  conferencia: 'Conferência Pastoral'
                };

                return (
                  <div key={eve.id} className="bg-slate-50 border border-slate-200 rounded-[2rem] p-5 space-y-4">
                    <div className="flex justify-between items-start gap-2 border-b border-slate-200/60 pb-3">
                      <div>
                        <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-full">
                          {typeLabels[eve.tipo]}
                        </span>
                        <h3 className="text-sm font-black text-slate-800 uppercase mt-2">{eve.titulo}</h3>
                      </div>
                      <span className="text-xs text-indigo-700 font-bold uppercase bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
                        {eve.data.split('-').reverse().join('/')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{eve.descricao}</p>

                    <div className="grid grid-cols-2 gap-4 text-xs bg-white border border-slate-100 rounded-2xl p-3">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Local do Encontro:</p>
                        <p className="font-bold text-slate-700 flex items-center gap-1 mt-0.5"><MapPin size={12} className="text-rose-500" /> {eve.local}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Capacidade Máxima:</p>
                        <p className="font-bold text-slate-700 mt-0.5">{eve.capacidade} Casais / Vagas</p>
                      </div>
                    </div>

                    {/* Lista de Inscritos */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Inscrições Realizadas ({eve.inscritos.length}):</span>
                      {eve.inscritos.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {eve.inscritos.map((ins, idx) => (
                            <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg">
                              {ins}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">Nenhuma família inscrita no painel ainda.</p>
                      )}
                    </div>

                    {/* Feedbacks dos participantes */}
                    {eve.feedback.length > 0 && (
                      <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1">
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">Depoimento e Avaliação:</span>
                        {eve.feedback.map((f, i) => (
                          <p key={i} className="text-[11px] text-slate-600 italic">
                            <strong>"{f.comentario}"</strong> — {f.autor} ({'★'.repeat(f.nota)})
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                      <button 
                        onClick={() => {
                          setDeleteConfirmInfo({ type: 'evento', id: eve.id });
                        }}
                        className="text-rose-400 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="flex gap-2">
                        {/* Formulário Simples de Inscrição */}
                        <select 
                          onChange={(e) => {
                            if (e.target.value) {
                              const novasInscr = [...eve.inscritos, e.target.value];
                              const atualizados = eventos.map(ev => ev.id === eve.id ? { ...ev, inscritos: novasInscr } : ev);
                              saveEventos(atualizados);
                              if (addToast) addToast('Família inscrita com sucesso!', 'success');
                            }
                          }}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 focus:outline-none"
                        >
                          <option value="">+ Inscrever Família</option>
                          {familias.map(f => (
                            <option key={f.id} value={f.nome}>{f.nome}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EVENTO */}
      {showEveModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 max-w-md w-full p-6 space-y-6 shadow-2xl animate-entrance">
            <h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="text-rose-500" size={18} />
              Criar Novo Evento Familiar
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Título do Evento:</label>
                <input 
                  type="text" 
                  value={eveTitulo} 
                  onChange={(e)=>setEveTitulo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  placeholder="Encontro de Casais..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tipo de Evento:</label>
                <select 
                  value={eveTipo} 
                  onChange={(e)=>setEveTipo(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="culto">Culto da Família no Templo</option>
                  <option value="retiro">Retiro Espiritual / Chácara</option>
                  <option value="encontro">Encontro de Casais (Salão)</option>
                  <option value="conferencia">Conferência Doutrinária</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Data:</label>
                <input 
                  type="date" 
                  value={eveData} 
                  onChange={(e)=>setEveData(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Local / Endereço:</label>
                <input 
                  type="text" 
                  value={eveLocal} 
                  onChange={(e)=>setEveLocal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  placeholder="Ex: Templo Sede ou Chácara Peniel"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Capacidade (Casais/Inscritos):</label>
                <input 
                  type="number" 
                  value={eveCapac} 
                  onChange={(e)=>setEveCapac(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Descrição Breve:</label>
                <textarea 
                  value={eveDesc} 
                  onChange={(e)=>setEveDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none h-20"
                  placeholder="Objetivos espirituais e preparativos..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button onClick={()=>setShowEveModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl">Cancelar</button>
              <button onClick={handleSaveEve} className="px-4 py-2 bg-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-xl">Criar</button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 5: CURSOS E TREINAMENTOS
          ---------------------------------------------------- */}
      {tab === 5 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-base font-black text-slate-800 uppercase flex items-center gap-2">
                  <GraduationCap size={18} className="text-rose-500" />
                  Cursos de Formação Familiar e Certificados
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase">Cursos de capacitação de noivos, recém-casados e educação bíblica de filhos sob alinhamento tradicional.</p>
              </div>
              <button 
                onClick={()=>{
                  setCurTitulo('');
                  setCurObjetivo('');
                  setCurBase('');
                  setCurInstrutor('');
                  setShowCurModal(true);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1"
              >
                <Plus size={14} /> Novo Curso
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {treinamentos.map(tre => (
                <div key={tre.id} className="bg-slate-50 border border-slate-200 rounded-[2rem] p-5 space-y-4">
                  <div className="flex justify-between items-start gap-2 border-b border-slate-200/60 pb-3">
                    <div>
                      <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        Capacitação Eclesiástica
                      </span>
                      <h3 className="text-sm font-black text-slate-800 uppercase mt-2">{tre.titulo}</h3>
                    </div>
                    <span className="text-xs text-emerald-700 font-black bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl">
                      {tre.cargaHoraria} Horas
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium"><strong>Objetivo:</strong> {tre.objetivo}</p>

                  <div className="grid grid-cols-2 gap-4 text-xs bg-white border border-slate-100 rounded-2xl p-3">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Ministrante / Professor:</p>
                      <p className="font-bold text-slate-700 mt-0.5">{tre.instrutor}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Bases Bíblicas:</p>
                      <p className="font-bold text-rose-600 mt-0.5">{tre.baseBiblica}</p>
                    </div>
                  </div>

                  {/* Alunos / Participantes */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Alunos & Certificação Digital ({tre.participantes.length}):</span>
                    {tre.participantes.length > 0 ? (
                      <div className="space-y-1.5">
                        {tre.participantes.map((part, index) => (
                          <div key={index} className="flex justify-between items-center text-xs bg-white border border-slate-100 px-3 py-2 rounded-xl">
                            <span className="font-bold text-slate-800">{part.nome}</span>
                            <div className="flex items-center gap-2">
                              {part.concluido ? (
                                <>
                                  <span className="text-emerald-600 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                    <CheckCircle size={10} /> Concluído
                                  </span>
                                  <button 
                                    onClick={() => {
                                      const atualizados = tre.participantes.map((p, idx) => idx === index ? { ...p, certificadoEmitido: true } : p);
                                      const atualTreinamentos = treinamentos.map(t => t.id === tre.id ? { ...t, participantes: atualizados } : t);
                                      saveTreinamentos(atualTreinamentos);
                                      if (addToast) addToast(`Certificado Digital emitido para ${part.nome}!`, 'success');
                                    }}
                                    className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${
                                      part.certificadoEmitido 
                                        ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                        : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'
                                    }`}
                                  >
                                    {part.certificadoEmitido ? '✔ Certificado Emitido' : 'Emitir Certificado'}
                                  </button>
                                </>
                              ) : (
                                <button 
                                  onClick={() => {
                                    const atualizados = tre.participantes.map((p, idx) => idx === index ? { ...p, concluido: true } : p);
                                    const atualTreinamentos = treinamentos.map(t => t.id === tre.id ? { ...t, participantes: atualizados } : t);
                                    saveTreinamentos(atualTreinamentos);
                                    if (addToast) addToast(`Parabéns! ${part.nome} concluiu o curso.`, 'success');
                                  }}
                                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-[9px] uppercase tracking-wider rounded-md"
                                >
                                  Marcar Conclusão
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Nenhum matriculado registrado no painel.</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                    <button 
                      onClick={() => {
                        setDeleteConfirmInfo({ type: 'treinamento', id: tre.id });
                      }}
                      className="text-rose-400 hover:text-rose-600"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="flex gap-2">
                      <select 
                        onChange={(e) => {
                          if (e.target.value) {
                            const novosPart = [...tre.participantes, { nome: e.target.value, concluido: false }];
                            const atualizados = treinamentos.map(t => t.id === tre.id ? { ...t, participantes: novosPart } : t);
                            saveTreinamentos(atualizados);
                            if (addToast) addToast(`${e.target.value} matriculado no curso!`, 'success');
                          }
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="">+ Matricular Aluno</option>
                        {familias.flatMap(f=>f.membros).map((m, idx) => (
                          <option key={idx} value={m.nome}>{m.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CURSO */}
      {showCurModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 max-w-md w-full p-6 space-y-6 shadow-2xl animate-entrance">
            <h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="text-rose-500" size={18} />
              Criar Novo Curso Pastoral
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Título do Curso:</label>
                <input 
                  type="text" 
                  value={curTitulo} 
                  onChange={(e)=>setCurTitulo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  placeholder="Ex: Curso de Noivos e Namorados..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Objetivo Espiritual:</label>
                <input 
                  type="text" 
                  value={curObjetivo} 
                  onChange={(e)=>setCurObjetivo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  placeholder="Ex: Fundamentar o casamento na doutrina clássica..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Bases Bíblicas Associadas:</label>
                <input 
                  type="text" 
                  value={curBase} 
                  onChange={(e)=>setCurBase(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  placeholder="Ex: Efésios 5:22-33, Tito 2"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Instrutor Responsável:</label>
                <input 
                  type="text" 
                  value={curInstrutor} 
                  onChange={(e)=>setCurInstrutor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  placeholder="Pastor ou Obreiro Qualificado..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Carga Horária (Aulas / Horas):</label>
                <input 
                  type="number" 
                  value={curCarga} 
                  onChange={(e)=>setCurCarga(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button onClick={()=>setShowCurModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl">Cancelar</button>
              <button onClick={handleSaveCur} className="px-4 py-2 bg-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-xl">Criar</button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 6: ACONSELHAMENTO, MENTORIA & IA PASTORAL
          ---------------------------------------------------- */}
      {tab === 6 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-base font-black text-slate-800 uppercase flex items-center gap-2">
                  <Sparkles size={18} className="text-rose-500" />
                  Mentoria Eclesiástica, Prontuário Confidencial & IA Pastoral
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase">Sessões de mentoria e acompanhamento. Use nossa IA baseada na Declaração de Fé de {churchName} para guiar estratégias de reconciliação.</p>
              </div>
              <button 
                onClick={()=>{
                  setAcoFamId('');
                  setAcoTema('');
                  setAcoNotas('');
                  setShowAcoModal(true);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1"
              >
                <Plus size={14} /> Nova Sessão de Aconselhamento
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Sessões Ativas */}
              <div className="lg:col-span-1 space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sessões de Aconselhamento:</span>
                <div className="space-y-3">
                  {aconselhamentos.map(aco => {
                    const fam = familias.find(f => f.id === aco.familiaId);
                    return (
                      <div 
                        key={aco.id} 
                        onClick={() => handleIAStrategy(aco)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          selectedAcoForIA?.id === aco.id 
                            ? 'bg-rose-50/40 border-rose-300' 
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-black text-slate-800 uppercase">{fam?.nome || 'Família'}</h4>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            aco.status === 'em_andamento' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {aco.status === 'em_andamento' ? 'Ativo' : 'Concluído'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-bold mt-1.5">{aco.tema}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">Sessão em: {aco.data.split('-').reverse().join('/')}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detalhes / Estratégia de Apoio com IA */}
              <div className="lg:col-span-2 space-y-4">
                {selectedAcoForIA ? (
                  <div className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-0.5 rounded-full">Prontuário de Mentoria</span>
                      <h3 className="text-base font-black text-slate-800 uppercase mt-2">Família: {familias.find(f => f.id === selectedAcoForIA.familiaId)?.nome}</h3>
                      <p className="text-xs font-bold text-indigo-700 mt-1 uppercase">Tema Pastoral: {selectedAcoForIA.tema}</p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Notas Confidenciais do Conselheiro:</span>
                      <p className="text-slate-600 font-medium whitespace-pre-line">{selectedAcoForIA.notasConfidenciais || 'Nenhuma anotação confidencial cadastrada.'}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-4">
                      <div className="flex justify-between items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                          <Sparkles size={15} className="text-rose-500" />
                          Estratégia de Intervenção Espiritual (IA)
                        </span>
                        <div className="flex gap-2">
                          {iaResponse && (
                            <button
                              type="button"
                              onClick={() => {
                                setPrintData({
                                  aco: selectedAcoForIA,
                                  strategy: iaResponse,
                                  familia: familias.find(f => f.id === selectedAcoForIA.familiaId),
                                  lider: lideres.find(l => l.id === selectedAcoForIA.mentorId),
                                  igreja: db.igreja
                                });
                                setPrintMode('rel_ia_aconselhamento');
                                setPreviewOpen(true);
                              }}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 font-black text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <FileText size={11} /> Imprimir / PDF
                            </button>
                          )}
                          <button 
                            onClick={() => handleIAStrategy(selectedAcoForIA)}
                            disabled={iaLoading}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-black text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 transition-all"
                          >
                            <RefreshCw size={11} className={iaLoading ? 'animate-spin' : ''} /> Recalcular Estratégia
                          </button>
                        </div>
                      </div>

                      {iaLoading ? (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                          <RefreshCw size={24} className="animate-spin text-rose-500 mx-auto" />
                          <p className="text-xs font-bold text-slate-600">IA Pastoral elaborando roteiro exegético de restauração familiar...</p>
                        </div>
                      ) : iaResponse ? (
                        <div className="bg-rose-50/15 border border-rose-100/50 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                          {iaResponse}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Clique em "Recalcular Estratégia" acima para obter orientações, versículos exegéticos aplicados e deveres de casa formulados por inteligência artificial e alinhados à teologia assembleiana.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-50/40 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
                    <Sparkles className="text-rose-300 animate-pulse mb-3" size={36} />
                    <p className="text-xs font-black text-slate-600">Nenhum prontuário de mentoria selecionado</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mt-1">Selecione uma das sessões à esquerda ou clique em "Nova Sessão" para monitorar crises e obter orientações teológicas assistidas via IA.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO ACONSELHAMENTO */}
      {showAcoModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 max-w-md w-full p-6 space-y-6 shadow-2xl animate-entrance">
            <h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="text-rose-500" size={18} />
              Iniciar Nova Mentoria de Família
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Selecione a Família Acompanhada:</label>
                <select 
                  value={acoFamId} 
                  onChange={(e)=>setAcoFamId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="">-- Escolher Núcleo Familiar --</option>
                  {familias.map(f => (
                    <option key={f.id} value={f.id}>{f.nome} (Status: {f.statusEspiritual})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Mentor Responsável (Líder/Pastor):</label>
                <select 
                  value={acoLidId} 
                  onChange={(e)=>setAcoLidId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  {lideres.map(l => (
                    <option key={l.id} value={l.id}>{l.nome} ({l.funcao})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tema ou Conflito Principal:</label>
                <input 
                  type="text" 
                  value={acoTema} 
                  onChange={(e)=>setAcoTema(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  placeholder="Ex: Falta de comunicação mansa ou crise financeira..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Notas Pastorais Confidenciais (Serão lidas apenas por você e pela IA):</label>
                <textarea 
                  value={acoNotas} 
                  onChange={(e)=>setAcoNotas(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none h-24"
                  placeholder="Descreva detalhes, impressões e o histórico das visitas para que a IA possa elaborar estratégias exegéticas de crescimento do lar..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button onClick={()=>setShowAcoModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl">Cancelar</button>
              <button onClick={handleSaveAco} className="px-4 py-2 bg-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-xl">Iniciar Sessão</button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 7: CULTO DOMÉSTICO (DEVOCIONAIS COM IA)
          ---------------------------------------------------- */}
      {tab === 7 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Sparkles size={18} className="text-rose-500" />
                  Gerador de Roteiros de Culto Doméstico & Altar no Lar
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase">Crie guias bíblicos para edificar o altar de adoração no lar da família com base em sua configuração familiar.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Painel de Configuração */}
              <div className="lg:col-span-1 bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-4">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Configuração do Devocional</h3>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tema Principal do Altar:</label>
                  <select 
                    value={devTheme}
                    onChange={(e) => setDevTheme(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400"
                  >
                    <option value="gratidao">Gratidão em Tempos de Crise</option>
                    <option value="perdao">O Perdão como Restaurador do Lar</option>
                    <option value="criacao_filhos">Instruindo os Filhos no Caminho do Senhor</option>
                    <option value="financas">Mordomia Financeira e Unidade Conjugal</option>
                    <option value="culto_domestico">O Altar de Oração da Família (Culto Doméstico)</option>
                    <option value="comunicacao">Comunicação Mansa e Edificante no Casamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Perfil e Ajuste Familiar:</label>
                  <select 
                    value={devProfile}
                    onChange={(e) => setDevProfile(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-rose-400"
                  >
                    <option value="casal_filhos_pequenos">Casal com filhos pequenos (infância)</option>
                    <option value="casal_filhos_adolescentes">Casal com filhos adolescentes (juventude)</option>
                    <option value="recem_casados">Recém-casados (primeiros anos de aliança)</option>
                    <option value="casados_longa_data">Casal maduro / Casados de longa data</option>
                    <option value="pais_solo">Mãe/Pai solo criando filhos sob preceitos cristãos</option>
                  </select>
                </div>

                <button 
                  onClick={handleGenerateDevotional}
                  disabled={devGenerating}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-black text-xs rounded-xl shadow-md shadow-rose-600/10 flex items-center justify-center gap-1.5 transition-all"
                >
                  {devGenerating ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" /> Gerando Altar da Família...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} /> Gerar Roteiro Oficial
                    </>
                  )}
                </button>

                {devError && (
                  <p className="text-[10px] font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">{devError}</p>
                )}
              </div>

              {/* Exibição do Roteiro Gerado */}
              <div className="lg:col-span-2">
                {devResult && devResult.titulo_devocional ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
                    <div className="border-b border-slate-100 pb-4 flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-0.5 rounded-full">Roteiro de Culto Doméstico</span>
                        <h3 className="text-base font-black text-slate-800 uppercase mt-2">{devResult.titulo_devocional}</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">Guia adaptado para: <strong className="text-slate-600 uppercase">{devProfile.replace(/_/g, ' ')}</strong></p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPrintData({
                            devResult,
                            devProfile,
                            igreja: db.igreja
                          });
                          setPrintMode('rel_ia_culto_domestico');
                          setPreviewOpen(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 font-black text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap self-center"
                      >
                        <FileText size={11} /> Imprimir / PDF
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-rose-50/15 border border-rose-100/30 rounded-2xl">
                        <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider block mb-1">Leitura Bíblica Recomendada:</span>
                        <p className="text-xs font-black text-slate-700 italic">{devResult.leitura_biblica}</p>
                      </div>

                      <div className="p-4 bg-indigo-50/15 border border-indigo-100/30 rounded-2xl">
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider block mb-1">Quebra-Gelo / Atividade Inicial:</span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{devResult.quebra_gelo}</p>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50 border border-slate-100/80 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Breve Mensagem e Aplicação Doutrinária:</span>
                      <p className="font-medium whitespace-pre-line">{devResult.explicacao_teologica}</p>
                    </div>

                    <div className="p-4 bg-purple-50/15 border border-purple-100/30 rounded-2xl text-xs text-slate-600">
                      <span className="text-[9px] font-black text-purple-700 uppercase block mb-1">Pergunta para Diálogo:</span>
                      <p className="font-medium">{devResult.pergunta_dialogo}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50/15 border border-emerald-100/30 rounded-2xl text-xs text-slate-600">
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider block mb-1">Motivo e Oração sugerida:</span>
                        <p className="font-medium">{devResult.oracao_proposta}</p>
                      </div>

                      <div className="p-4 bg-amber-50/15 border border-amber-100/30 rounded-2xl text-xs text-slate-600">
                        <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider block mb-1">Desafio Prático da Semana:</span>
                        <p className="font-medium">{devResult.desafio_pratico}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-50/40 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
                    <Sparkles className="text-rose-300 animate-pulse mb-3" size={36} />
                    <p className="text-xs font-black text-slate-600">Nenhum roteiro gerado ainda</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mt-1">Configure o tema e o perfil familiar no painel ao lado e clique em "Gerar Roteiro Oficial" para receber as orientações pedagógicas pastorais via IA.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 8: DOUTRINA & CAPÍTULO 24 ({churchName}) - APOSTILA DE ESTUDO
          ---------------------------------------------------- */}
      {tab === 8 && (
        <div className="space-y-6">
          {/* Apostila Principal */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xs p-8 max-w-4xl mx-auto space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1 rounded-full">
                Declaração de Fé de {churchName} • Capítulo 24
              </span>
              <h1 className="text-2xl font-black text-slate-800 uppercase mt-3">A Família na Visão Pentecostal Clássica</h1>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">Material Didático e de Estudo da Universidade Teológica.</p>
            </div>

            {/* 1. Título do Módulo e Tema */}
            <div className="space-y-2">
              <h2 className="text-sm font-black text-rose-600 uppercase tracking-wider">1. Introdução Histórica e de Princípios</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                A família é a instituição divinamente concebida e estabelecida por Deus antes de qualquer outra organização social ou civil. Criada no Éden com a união entre um homem e uma mulher originais, ela serve como o núcleo primário para a santidade, comunhão e expansão do Reino de Deus. 
                As Assembleias de Deus no Brasil historicamente preservam a literalidade desta aliança, repelindo movimentos pós-modernos de secularização e fragilização do matrimônio.
              </p>
            </div>

            {/* 2. Fundamentação Doutrinária */}
            <div className="space-y-2">
              <h2 className="text-sm font-black text-rose-600 uppercase tracking-wider">2. Fundamentação Doutrinária Assembleiana</h2>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed font-medium">
                <strong>O que a denominação ensina oficialmente:</strong> Conforme o Capítulo 24 da Declaração de Fé de {churchName}, o casamento é uma aliança monogâmica, heterossexual e indissolúvel até a morte de um dos cônjuges. Rejeitamos qualquer relativização dos papéis divinamente ordenados, sustentando a submissão mútua e o amor sacrificial do marido, que reflete a união entre Cristo e a Igreja. A dissolução injustificada da aliança é combatida pastoralmente em favor da reconciliação mansa.
              </div>
            </div>

            {/* 3. Referências Bíblicas */}
            <div className="space-y-2">
              <h2 className="text-sm font-black text-rose-600 uppercase tracking-wider">3. Referências Bíblicas Exegéticas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-rose-50/15 border border-rose-100/30 rounded-2xl">
                  <p className="font-bold text-rose-700">Efésios 5:22-25</p>
                  <p className="text-slate-600 italic mt-1">"Vós, mulheres, sujeitai-vos a vossos maridos, como ao Senhor... Vós, maridos, amai vossas mulheres, como também Cristo amou a igreja, e a si mesmo se entregou por ela."</p>
                </div>
                <div className="p-3.5 bg-rose-50/15 border border-rose-100/30 rounded-2xl">
                  <p className="font-bold text-rose-700">Provérbios 22:6</p>
                  <p className="text-slate-600 italic mt-1">"Educa a criança no caminho em que deve andar; e até quando envelhecer não se desviará dele."</p>
                </div>
              </div>
            </div>

            {/* 4. Aplicação Prática */}
            <div className="space-y-2">
              <h2 className="text-sm font-black text-rose-600 uppercase tracking-wider">4. Aplicação Prática Pastoral</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                O obreiro e membro assembleiano aplicam esta doutrina promovendo de forma prática o culto doméstico familiar semanal, mantendo conversação irrepreensível, prestando socorro imediato a lares em discórdia, e ensinando os filhos a guardarem a ortodoxia pentecostal face às influências secularistas.
              </p>
            </div>

            {/* 5. Validação (Quiz de fixação) */}
            <div className="border-t border-slate-200/80 pt-6 space-y-6">
              <div className="flex items-center gap-2">
                <FileBadge size={18} className="text-indigo-600" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Questionário de Validação de Aprendizado</h3>
              </div>

              <div className="space-y-6">
                {/* Pergunta 1 */}
                <div className="space-y-2 bg-slate-50 border border-slate-200/60 p-5 rounded-2xl">
                  <p className="text-xs font-black text-slate-800 uppercase">Questão 1: De acordo com a Declaração de Fé de {churchName} (Capítulo 24), qual o papel sacerdotal primordial do homem no lar?</p>
                  <div className="space-y-2 text-xs">
                    {[
                      { l: 'A', t: 'Conduzir a família em oração e santidade como cabeça e sacerdote do lar, refletindo o amor de Cristo pela Igreja.' },
                      { l: 'B', t: 'Apenas ser o mantenedor financeiro sem envolvimento na instrução religiosa dos filhos.' },
                      { l: 'C', t: 'Exercer soberania autoritária sem necessidade de amar sacrificialmente a esposa.' }
                    ].map(opt => (
                      <label key={opt.l} className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-100 hover:border-slate-300 cursor-pointer">
                        <input 
                          type="radio" 
                          name="q1" 
                          checked={selectedAnswers[1] === opt.l}
                          disabled={quizSubmitted}
                          onChange={() => handleQuizAnswer(1, opt.l)} 
                        />
                        <span className="font-bold text-slate-800">{opt.l})</span>
                        <span className="text-slate-600 font-medium">{opt.t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pergunta 2 */}
                <div className="space-y-2 bg-slate-50 border border-slate-200/60 p-5 rounded-2xl">
                  <p className="text-xs font-black text-slate-800 uppercase">Questão 2: Qual a visão assembleiana clássica sobre o divórcio consensual leviano?</p>
                  <div className="space-y-2 text-xs">
                    {[
                      { l: 'A', t: 'É aceito sem restrições em qualquer dificuldade de convivência.' },
                      { l: 'B', t: 'O casamento não possui caráter permanente diante das transformações da modernidade.' },
                      { l: 'C', t: 'É rejeitado de forma absoluta, pois o casamento é uma aliança monogâmica, heterossexual e indissolúvel consagrada por Deus.' }
                    ].map(opt => (
                      <label key={opt.l} className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-100 hover:border-slate-300 cursor-pointer">
                        <input 
                          type="radio" 
                          name="q2" 
                          checked={selectedAnswers[2] === opt.l}
                          disabled={quizSubmitted}
                          onChange={() => handleQuizAnswer(2, opt.l)} 
                        />
                        <span className="font-bold text-slate-800">{opt.l})</span>
                        <span className="text-slate-600 font-medium">{opt.t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Envio do Quiz */}
                {!quizSubmitted ? (
                  <button 
                    onClick={handleQuizSubmit}
                    disabled={!selectedAnswers[1] || !selectedAnswers[2]}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10"
                  >
                    Enviar Respostas para Correção
                  </button>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl space-y-2 text-xs">
                    <p className="font-black text-sm">✓ Questionário Concluído!</p>
                    <p className="font-bold">Sua pontuação: <strong className="text-emerald-800 text-base">{quizScore}%</strong> ({quizScore === 100 ? 'Excelente! Conhecimento Doutrinário Perfeito.' : 'Revise a apostila e tente novamente.'})</p>
                    <button 
                      onClick={() => {
                        setSelectedAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="mt-2 text-[10px] font-black uppercase text-indigo-700 hover:underline"
                    >
                      Refazer Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteConfirmInfo && (
        <ConfirmModal
          isOpen={!!deleteConfirmInfo}
          onClose={() => setDeleteConfirmInfo(null)}
          title={
            deleteConfirmInfo.type === 'familia' ? 'Remover Família' :
            deleteConfirmInfo.type === 'lider' ? 'Excluir Coordenação' :
            deleteConfirmInfo.type === 'evento' ? 'Remover Evento' :
            deleteConfirmInfo.type === 'treinamento' ? 'Remover Curso' :
            'Excluir Registro'
          }
          message={
            deleteConfirmInfo.type === 'familia' ? 'Deseja realmente remover esta família e todo o histórico dela do sistema?' :
            deleteConfirmInfo.type === 'lider' ? 'Deseja realmente remover este coordenador/líder do ministério da família?' :
            deleteConfirmInfo.type === 'evento' ? 'Deseja realmente excluir este evento pastoral do histórico?' :
            deleteConfirmInfo.type === 'treinamento' ? 'Deseja realmente excluir este curso de capacitação de casais?' :
            'Deseja realmente excluir este registro permanentemente?'
          }
          onConfirm={handleExecuteDelete}
          onCancel={() => setDeleteConfirmInfo(null)}
        />
      )}
    </div>
  );
};

export default ModuleFamilia;
