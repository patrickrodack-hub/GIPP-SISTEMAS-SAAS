import React, { useState, useEffect, useContext, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import { InteractiveWindow } from './InteractiveWindow';
import jsPDF from 'jspdf';
import { ChurchContext, Button, FormInput, FormSelect } from '../App';
import { 
  Users, DollarSign, Briefcase, Calendar, Building2, Printer, 
  FileText, CheckCircle, TrendingUp, Plus, Trash2, Edit, Search, 
  CreditCard, ArrowUpRight, ArrowDownRight, HelpCircle, Download, 
  UserCheck, Percent, ShieldAlert, Sparkles, RefreshCw, X, ChevronRight, ChevronDown, Check, AlertCircle, Eye, UserPlus,
  Paperclip, Shield, Clock, Plane, Info, Database, BookOpen, Scale, Upload, FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, PieChart, Pie, Cell, Tooltip as RechartsTooltip
} from 'recharts';

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ModuleDPContabilidade = memo(() => {
  const { 
    db, 
    setDbState, 
    addToast, 
    setPrintMode, 
    setPrintData, 
    setPreviewOpen, 
    user,
    dbFirestore,
    appId,
    addDoc,
    setDoc,
    doc,
    collection,
    deleteDoc,
    hasPermission
  } = useContext<any>(ChurchContext);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'colaboradores' | 'folha' | 'relatorios' | 'ponto' | 'ferias' | 'esocial' | 'rh' | 'juridico'>('dashboard');
  const [rhActiveTab, setRhActiveTab] = useState<'recrutamento' | 'onboarding' | 'treinamento' | 'desempenho'>('recrutamento');
  
  // Contabilidade states
  const [contabActiveTab, setContabActiveTab] = useState<'relatorios' | 'conciliacao' | 'postings' | 'contas'>('relatorios');
  const [isReconciling, setIsReconciling] = useState(false);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [searchTrans, setSearchTrans] = useState('');
  const [filterTransStatus, setFilterTransStatus] = useState<'todos' | 'conciliado' | 'pendente'>('todos');
  const [transactions, setTransactions] = useState<any[]>([
    { id: 't1', data: '2026-06-05', descricao: 'PAGTO FOLHA SALARIAL COMPLETA', valor: 45000, tipo: 'saida', status: 'pendente', conciliadoCom: 'Folha de Pagamento - Jun/2026' },
    { id: 't2', data: '2026-06-06', descricao: 'PAGTO ADIANTAMENTO FORNECEDOR ABC', valor: 2350, tipo: 'saida', status: 'conciliado', conciliadoCom: 'Lançamento Contábil #2431' },
    { id: 't3', data: '2026-06-08', descricao: 'DOC RECEBIDO CONGREGAÇÃO CENTRO', valor: 8500, tipo: 'entrada', status: 'conciliado', conciliadoCom: 'Dízimo Congregacional Centro' },
    { id: 't4', data: '2026-06-10', descricao: 'TRANSF ENCARGOS FGTS DIGITAL', valor: 3600, tipo: 'saida', status: 'pendente', conciliadoCom: 'FGTS Digital Lote #982' },
    { id: 't5', data: '2026-06-11', descricao: 'REEMBOLSO TAXA CARTÓRIO CONTRATO', valor: 120, tipo: 'saida', status: 'pendente', conciliadoCom: '' }
  ]);
  
  // Juridico states
  const [juridicoActiveTab, setJuridicoActiveTab] = useState<'contratos' | 'processos' | 'base_juridica'>('contratos');
  const [contratoSearch, setContratoSearch] = useState('');
  const [contratoStatusFilter, setContratoStatusFilter] = useState<'todos' | 'ativo' | 'rascunho' | 'vencido'>('todos');
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [editingContrato, setEditingContrato] = useState<any>(null);
  
  const [contratoForm, setContratoForm] = useState<any>({
    colaborador_id: '',
    titulo: '',
    tipo: 'Contrato de Trabalho CLT',
    data_inicio: '',
    data_fim: '',
    valor: 0,
    status: 'ativo',
    clausulas: 'Cláusula 1ª - Das Atividades e Responsabilidades...\nCláusula 2ª - Do Horário de Trabalho...\nCláusula 3ª - Do Sigilo e Confidencialidade...',
    assinado_digital: true
  });

  const [processoSearch, setProcessoSearch] = useState('');
  const [showProcessoModal, setShowProcessoModal] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState<any>(null);
  const [processoForm, setProcessoForm] = useState<any>({
    colaborador_id: '',
    numero: '',
    tipo: 'trabalhista',
    titulo: '',
    autor: '',
    reu: 'Instituição Sede / Matriz',
    data_entrada: '',
    status: 'andamento',
    descricao: '',
    ultima_movimentacao: '',
    proxima_audiencia: '',
    valor_causa: 0
  });

  const [contratos, setContratos] = useState<any[]>(() => {
    const saved = localStorage.getItem('gipp_dp_contratos');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { id: 'c1', colaborador_id: '', titulo: 'Contrato de Admissão CLT Geral', tipo: 'Contrato de Trabalho CLT', data_inicio: '2025-01-15', data_fim: '', valor: 3500, status: 'ativo', assinado_digital: true, clausulas: 'Cláusula 1ª: Das Atividades profissionais...' },
      { id: 'c2', colaborador_id: '', titulo: 'Prestação de Serviço de Assessoria de TI', tipo: 'Contrato de Prestação de Serviço', data_inicio: '2026-02-01', data_fim: '2027-02-01', valor: 4500, status: 'ativo', assinado_digital: true, clausulas: 'Cláusula de prestação continuada de suporte de informática...' },
      { id: 'c3', colaborador_id: '', titulo: 'Termo de Adesão ao Trabalho Voluntário Eclesiástico', tipo: 'Termo de Voluntariado', data_inicio: '2026-03-10', data_fim: '2026-09-10', valor: 0, status: 'ativo', assinado_digital: true, clausulas: 'Termo de voluntariado e assistência social...' }
    ];
  });

  const [processos, setProcessos] = useState<any[]>(() => {
    const saved = localStorage.getItem('gipp_dp_processos');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { id: 'p1', colaborador_id: '', numero: '0010245-89.2026.5.02.0001', tipo: 'trabalhista', titulo: 'Ajuste de Horas Extras - Sindicato', autor: 'Carlos Eduardo', reu: 'Instituição Sede / Matriz', data_entrada: '2026-04-10', status: 'andamento', descricao: 'Discussão de horas de jornada externa.', ultima_movimentacao: 'Audiência inicial designada.', proxima_audiencia: '2026-09-15 13:30', valor_causa: 12000 }
    ];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('gipp_dp_contratos', JSON.stringify(contratos));
  }, [contratos]);

  useEffect(() => {
    localStorage.setItem('gipp_dp_processos', JSON.stringify(processos));
  }, [processos]);

  // Accounting and SST states for Fase 4
  const [planoDeContas, setPlanoDeContas] = useState<any[]>(() => {
    const saved = localStorage.getItem('gipp_dp_plano_contas');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { id: 'acc1', codigo: '1.1.01.001', nome: 'Caixa Geral da Sede', grupo: 'Ativo Circulante', tipo: 'Devedora', saldo: 14250.75, status: 'ativo' },
      { id: 'acc2', codigo: '1.1.01.002', nome: 'Banco Itaú - Conta dízimos', grupo: 'Ativo Circulante', tipo: 'Devedora', saldo: 85450.20, status: 'ativo' },
      { id: 'acc3', codigo: '1.2.01.001', nome: 'Templo Sede (Imóvel Sede)', grupo: 'Ativo Não Circulante', tipo: 'Devedora', saldo: 1500000.00, status: 'ativo' },
      { id: 'acc4', codigo: '2.1.01.001', nome: 'Salários e Prebendas a Pagar', grupo: 'Passivo Circulante', tipo: 'Credora', saldo: 45000.00, status: 'ativo' },
      { id: 'acc5', codigo: '2.1.01.002', nome: 'INSS e Encargos a Recolher', grupo: 'Passivo Circulante', tipo: 'Credora', saldo: 3560.00, status: 'ativo' },
      { id: 'acc6', codigo: '3.1.01.001', nome: 'Receitas de Dízimos', grupo: 'Receita Operacional', tipo: 'Credora', saldo: 125400.00, status: 'ativo' },
      { id: 'acc7', codigo: '3.1.01.002', nome: 'Receitas de Ofertas de Missões', grupo: 'Receita Operacional', tipo: 'Credora', saldo: 18750.00, status: 'ativo' },
      { id: 'acc8', codigo: '4.1.01.001', nome: 'Despesas com Pessoal CLT', grupo: 'Despesa Operacional', tipo: 'Devedora', saldo: 41250.00, status: 'ativo' },
      { id: 'acc9', codigo: '4.1.01.002', nome: 'Prebendas Pastorais Sede', grupo: 'Despesa Operacional', tipo: 'Devedora', saldo: 18000.00, status: 'ativo' },
      { id: 'acc10', codigo: '4.1.02.001', nome: 'Despesas com Água, Luz e Energia', grupo: 'Gastos Administrativos', tipo: 'Devedora', saldo: 4250.30, status: 'ativo' }
    ];
  });

  const [contaSearch, setContaSearch] = useState('');
  const [contaGroupFilter, setContaGroupFilter] = useState('todos');
  const [showContaModal, setShowContaModal] = useState(false);
  const [editingConta, setEditingConta] = useState<any>(null);
  const [contaForm, setContaForm] = useState<any>({
    codigo: '',
    nome: '',
    grupo: 'Ativo Circulante',
    tipo: 'Devedora',
    saldo: 0,
    status: 'ativo'
  });

  const [sstExames, setSstExames] = useState<any[]>(() => {
    const saved = localStorage.getItem('gipp_sst_exames');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { id: 'sst1', colaborador: 'Pra. Débora Souza', tipo: 'Admissional', data: '2025-06-10', resultado: 'Apto', status: 'transmitido', evento: 'S-2220', riscos: 'Ausência de riscos nocivos', medico: 'Dr. Roberto Cruz - CRM/SP 123456' },
      { id: 'sst2', colaborador: 'Ev. Carlos Eduardo', tipo: 'Periódico', data: '2026-05-20', resultado: 'Apto', status: 'transmitido', evento: 'S-2220', riscos: 'Ausência de riscos nocivos', medico: 'Dr. Roberto Cruz - CRM/SP 123456' }
    ];
  });

  const [showSstModal, setShowSstModal] = useState(false);
  const [sstForm, setSstForm] = useState<any>({
    colaborador: '',
    tipo: 'Admissional',
    data: '',
    resultado: 'Apto',
    evento: 'S-2220',
    riscos: 'Ausência de riscos nocivos identificados (LTCAT)',
    medico: 'Dr. Roberto Cruz - CRM/SP 123456'
  });

  useEffect(() => {
    localStorage.setItem('gipp_dp_plano_contas', JSON.stringify(planoDeContas));
  }, [planoDeContas]);

  useEffect(() => {
    localStorage.setItem('gipp_sst_exames', JSON.stringify(sstExames));
  }, [sstExames]);

  const [pontoPunches, setPontoPunches] = useState<any[]>(() => {
    const saved = localStorage.getItem('gipp_ponto_punches');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { id: 'po1', colaborador: 'Pra. Débora Souza', data: '2026-06-12', entrada: '08:02', saida: '17:05', horas: '08:03 (Regular)', status: 'Regular' },
      { id: 'po2', colaborador: 'Ev. Carlos Eduardo', data: '2026-06-12', entrada: '07:55', saida: '17:01', horas: '08:06 (Regular)', status: 'Regular' },
      { id: 'po3', colaborador: 'Pastor Marcos Silva', data: '2026-06-11', entrada: '09:00', saida: '18:00', horas: '08:00 (Regular)', status: 'Regular' }
    ];
  });

  const [showPontoModal, setShowPontoModal] = useState(false);
  const [pontoForm, setPontoForm] = useState<any>({
    colaborador: '',
    data: getTodayDate(),
    entrada: '08:00',
    saida: '17:00',
    horas: '08:00'
  });

  useEffect(() => {
    localStorage.setItem('gipp_ponto_punches', JSON.stringify(pontoPunches));
  }, [pontoPunches]);
  
  // State for references
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${mm}`;
  });
  
  // Searches and Filters
  const [colabSearch, setColabSearch] = useState('');
  const [colabTypeFilter, setColabTypeFilter] = useState<'todos' | 'funcionario' | 'colaborador' | 'prestador' | 'pastor'>('todos');
  const [colabStatusFilter, setColabStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('ativo');

  // Form states
  const [showColabModal, setShowColabModal] = useState(false);
  const [editingColab, setEditingColab] = useState<any>(null);
  const [colabToDelete, setColabToDelete] = useState<any | null>(null);
  const [colabForm, setColabForm] = useState<any>({
    nome: '',
    cpf: '',
    rg: '',
    tipo: 'funcionario',
    cargo: '',
    admissao: '',
    demissao: '',
    salario_base: 0,
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: 'corrente',
    pix: '',
    inss: true,
    irpf: false,
    status: 'ativo',
    congregacao_id: 'sede',
    telefone: '',
    email: '',
    observacao: '',
    igreja_origem: '',
    pastor_presidente: '',
    carta_recomendacao: 'Sim',
    funcoes_anteriores: '',
    ministerios_ativos: '',
    perfil_acesso: 'visualizador_comum',
    documentos: [],
    beneficio_auxilio_moradia: 0,
    beneficio_vale_transporte: 0,
    beneficio_vale_refeicao: 0,
    beneficio_ajuda_custo: 0,
    beneficio_plano_saude: 0,
    ferias_lista: [],
    historico_salarial: []
  });

  // Import from Members list states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSearch, setImportSearch] = useState('');

  // Individual Pay Slip Custom Additions/Deductions states in editing mode
  const [expandedSlipId, setExpandedSlipId] = useState<string | null>(null);

  // States for Analytical Payroll Report
  const [folhaReportType, setFolhaReportType] = useState<'mensal' | 'trimestral' | 'anual' | 'periodo'>('mensal');
  const [folhaReportYear, setFolhaReportYear] = useState(() => new Date().getFullYear().toString());
  const [folhaReportMonth, setFolhaReportMonth] = useState(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [folhaReportQuarter, setFolhaReportQuarter] = useState<'1' | '2' | '3' | '4'>('1');
  const [folhaReportStartMonth, setFolhaReportStartMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-01`;
  });
  const [folhaReportEndMonth, setFolhaReportEndMonth] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${today.getFullYear()}-${mm}`;
  });
  const [showInAppFolhaPreview, setShowInAppFolhaPreview] = useState(false);

  // Active DP lists
  const colaboradores = useMemo(() => db.dp_colaboradores || [], [db.dp_colaboradores]);
  const folhas = useMemo(() => db.dp_folhas || [], [db.dp_folhas]);
  const congregacoes = useMemo(() => db.congregacoes || [], [db.congregacoes]);
  const membrosGerais = useMemo(() => db.membros || [], [db.membros]);

  // Compute filtered pay slips for the Analytical report
  const filteredFolhasForReport = useMemo(() => {
    const activeStaffs = colaboradores.filter((c: any) => !c.deleted);
    const activeStaffsMap = new Map<string, any>(activeStaffs.map((c: any) => [c.id, c]));

    const filtered = (db.dp_folhas || []).filter((f: any) => {
      if (f.deleted) return false;
      const ref = f.mes_referencia;
      if (!ref) return false;

      const c: any = activeStaffsMap.get(f.colaborador_id);
      if (!c) return false;

      if (folhaReportType === 'mensal') {
        return ref === `${folhaReportYear}-${folhaReportMonth}`;
      } else if (folhaReportType === 'trimestral') {
        const year = ref.substring(0, 4);
        const month = ref.substring(5, 7);
        if (year !== folhaReportYear) return false;
        
        if (folhaReportQuarter === '1') {
          return month === '01' || month === '02' || month === '03';
        } else if (folhaReportQuarter === '2') {
          return month === '04' || month === '05' || month === '06';
        } else if (folhaReportQuarter === '3') {
          return month === '07' || month === '08' || month === '09';
        } else if (folhaReportQuarter === '4') {
          return month === '10' || month === '11' || month === '12';
        }
      } else if (folhaReportType === 'anual') {
        return ref.startsWith(`${folhaReportYear}-`);
      } else if (folhaReportType === 'periodo') {
        return ref >= folhaReportStartMonth && ref <= folhaReportEndMonth;
      }
      return false;
    });

    return filtered.map((f: any) => {
      const colab = activeStaffsMap.get(f.colaborador_id);
      return {
        ...f,
        colaborador_nome: colab ? colab.nome : 'Desconhecido',
        colaborador_cpf: colab ? colab.cpf : '',
        colaborador_tipo: colab ? colab.tipo : 'funcionario',
        colaborador_cargo: colab ? colab.cargo : ''
      };
    }).sort((a: any, b: any) => {
      if (a.mes_referencia !== b.mes_referencia) {
        return a.mes_referencia.localeCompare(b.mes_referencia);
      }
      return a.colaborador_nome.localeCompare(b.colaborador_nome);
    });
  }, [db.dp_folhas, colaboradores, folhaReportType, folhaReportYear, folhaReportMonth, folhaReportQuarter, folhaReportStartMonth, folhaReportEndMonth]);

  // Months listing for payroll select
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    // Default current month and past few months
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      months.add(`${d.getFullYear()}-${mm}`);
    }
    folhas.forEach((f: any) => {
      if (f.mes_referencia) months.add(f.mes_referencia);
    });
    return Array.from(months).sort().reverse();
  }, [folhas]);

  // Helper: Format values to BRLcurrency
  const formatBRL = (val: any) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed)) return 'R$ 0,00';
    return parsed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getCongregacaoNome = (id: string) => {
    if (!id || id === 'sede') return 'SEDE';
    const c = congregacoes.find((item: any) => item.id === id);
    return c ? c.nome.toUpperCase() : 'SEDE';
  };

  // Safe Text utils
  const safeText = (text: any, fallback = '-') => {
    if (text === null || text === undefined || text === '') return fallback;
    return String(text);
  };

  // --- SAVE/EDIT COLABORADOR ---
  const handleSaveColaborador = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!colabForm.nome.trim()) {
      addToast('O Nome do colaborador é obrigatório.', 'error');
      return;
    }

    try {
      const payload = {
        ...colabForm,
        salario_base: parseFloat(colabForm.salario_base) || 0
      };

      let updatedList = [];
      const isNew = !editingColab?.id;

      if (isNew) {
        const generatedId = `colab_${Date.now()}`;
        // Create an initial salary entry if a salary is set
        const initialSal = parseFloat(colabForm.salario_base) || 0;
        const initialHistory = initialSal > 0 ? [{
          id: `adj_${Date.now()}`,
          data: new Date().toISOString().split('T')[0],
          anterior: 0,
          novo: initialSal,
          motivo: 'Salário inicial contratado'
        }] : [];
        
        const newRecord = { 
          ...payload, 
          id: generatedId, 
          created_at: new Date().toISOString(),
          historico_salarial: initialHistory
        };
        
        // Firestore save if online
        if (dbFirestore && appId) {
          try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dp_colaboradores', generatedId), newRecord);
          } catch (fErr) {
            console.warn("Firestore error saving dp_colaboradores:", fErr);
          }
        }
        
        updatedList = [...colaboradores, newRecord];
        addToast('Colaborador cadastrado com sucesso!', 'success');
      } else {
        // Salary change tracking
        const oldSal = parseFloat(editingColab.salario_base) || 0;
        const newSal = parseFloat(payload.salario_base) || 0;
        if (oldSal !== newSal) {
          const updatedHist = [...(colabForm.historico_salarial || [])];
          updatedHist.push({
            id: `adj_${Date.now()}`,
            data: new Date().toISOString().split('T')[0],
            anterior: oldSal,
            novo: newSal,
            motivo: 'Ajuste ou readequação de base salarial/prebenda'
          });
          payload.historico_salarial = updatedHist;
        }

        const updatedRecord = { ...payload, id: editingColab.id, updated_at: new Date().toISOString() };
        
        if (dbFirestore && appId) {
          try {
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dp_colaboradores', editingColab.id), updatedRecord, { merge: true });
          } catch (fErr) {
            console.warn("Firestore error updating dp_colaboradores:", fErr);
          }
        }

        updatedList = colaboradores.map((c: any) => c.id === editingColab.id ? updatedRecord : c);
        addToast('Cadastro de colaborador atualizado.', 'success');
      }

      setDbState((prev: any) => ({
        ...prev,
        dp_colaboradores: updatedList
      }));

      setShowColabModal(false);
      setEditingColab(null);
    } catch (err: any) {
      addToast(`Erro ao salvar colaborador: ${err.message}`, 'error');
    }
  };  // safeConfirm to bypass blocked window.confirm in sandboxed iframes
  const safeConfirm = (message: string): boolean => {
    try {
      return window.confirm(message);
    } catch (e) {
      // In iframes, return true so the user is not locked out of actions
      return true;
    }
  };

  // --- AUTOMATED DEMO STAFF GENERATION FOR PROMPT TESTING ---
  const handleGenerateDemoColaboradores = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const demolist = [
      {
        id: `colab_demo_1_${Date.now()}`,
        nome: 'Pr. Roberto Alencar',
        cpf: '123.456.789-00',
        rg: '12.345.678-9',
        tipo: 'pastor',
        cargo: 'Pastor Titular',
        admissao: '2024-01-10',
        salario_base: 4500,
        banco: 'Banco do Brasil',
        agencia: '1234-x',
        conta: '98765-4',
        tipo_conta: 'corrente',
        pix: '12345678900',
        inss: true,
        irpf: true,
        status: 'ativo',
        congregacao_id: 'sede',
        telefone: '(11) 98888-7777',
        email: 'pr.roberto@igreja.org',
        observacao: 'Líder espiritual principal da igreja sede.',
        igreja_origem: 'AD Belém - Sede SP',
        pastor_presidente: 'Pr. José Wellington',
        carta_recomendacao: 'Sim',
        funcoes_anteriores: 'Evangelista da Congregação Setorial, Coordenador de Jovens Estaduais',
        ministerios_ativos: 'Conselho Consultivo, Ministério de Casais e Ensino Teológico',
        perfil_acesso: 'admin',
        documentos: [
          { id: 'doc1', nome: 'Ata_Nomeacao_Pastoral_2024.pdf', data: '2024-01-10', tipo: 'Ata de Nomeação' },
          { id: 'doc2', nome: 'Carta_de_Recomendacao_Assinada.pdf', data: '2023-12-15', tipo: 'Carta de Recomendação' }
        ],
        created_at: new Date().toISOString()
      },
      {
        id: `colab_demo_2_${Date.now()}`,
        nome: 'Débora Souza',
        cpf: '987.654.321-11',
        rg: '98.765.432-1',
        tipo: 'funcionario',
        cargo: 'Secretária Administrativa',
        admissao: '2024-05-15',
        salario_base: 2400,
        banco: 'Itaú',
        agencia: '0345',
        conta: '12345-6',
        tipo_conta: 'corrente',
        pix: 'deborasouza@gmail.com',
        inss: true,
        irpf: false,
        status: 'ativo',
        congregacao_id: 'sede',
        telefone: '(11) 97777-6666',
        email: 'debora@igreja.org',
        observacao: 'Responsável pelas atas, registros de membros e secretaria geral.',
        igreja_origem: 'Igreja Presbiteriana Central',
        pastor_presidente: 'Rev. Marcos Silva',
        carta_recomendacao: 'Sim',
        funcoes_anteriores: 'Secretária das Escolas Bíblicas de Férias (IPB)',
        ministerios_ativos: 'Superintendente EBD Infantil, Comissão Editorial do Boletim',
        perfil_acesso: 'tesoureiro_dp',
        documentos: [
          { id: 'doc3', nome: 'Contrato_Trabalho_CLT_Assinado.pdf', data: '2024-05-15', tipo: 'Contrato de Trabalho' },
          { id: 'doc4', nome: 'Exame_Admissional_Apto.pdf', data: '2024-05-12', tipo: 'Exame Médico' }
        ],
        created_at: new Date().toISOString()
      },
      {
        id: `colab_demo_3_${Date.now()}`,
        nome: 'Carlos Eduardo',
        cpf: '456.789.123-22',
        rg: '45.678.912-3',
        tipo: 'prestador',
        cargo: 'Sonoplasta e Mídia',
        admissao: '2024-08-01',
        salario_base: 1800,
        banco: '',
        agencia: '',
        conta: '',
        tipo_conta: 'corrente',
        pix: 'carlosedu@pix.com',
        inss: false,
        irpf: false,
        status: 'ativo',
        congregacao_id: 'sede',
        telefone: '(11) 96666-5555',
        email: 'carlos.midia@igreja.org',
        observacao: 'Suporte técnico de som, iluminação e transmissões online.',
        igreja_origem: 'Igreja Batista Fonte de Vida',
        pastor_presidente: 'Pr. Arthur Mendes',
        carta_recomendacao: 'Em Trânsito',
        funcoes_anteriores: 'Coordenador Operacional de Tecnologia e Live Streaming',
        ministerios_ativos: 'Líder Técnico do Ministério de Mídia / Transmissões',
        perfil_acesso: 'visualizador_comum',
        documentos: [
          { id: 'doc5', nome: 'Contrato_Prestacao_Servico_SLA_Assinado.pdf', data: '2024-08-01', tipo: 'Contrato de Prestação' }
        ],
        created_at: new Date().toISOString()
      }
    ];

    let updatedList = [...colaboradores];
    for (const record of demolist) {
      if (dbFirestore && appId) {
        try {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dp_colaboradores', record.id), record);
        } catch (fErr) {
          console.warn("Firestore error saving demo colab:", fErr);
        }
      }
      updatedList.push(record);
    }

    setDbState((prev: any) => ({
      ...prev,
      dp_colaboradores: updatedList
    }));

    addToast('3 Colaboradores de Exemplo (Pastor, Secretária e Sonoplasta) com dados eclesiásticos completos criados com sucesso!', 'success');
  };

  // Delete Colaborador - Abre o Modal Customizado de Confirmação
  const handleDeleteColaborador = (colabId: string, name: string) => {
    const colab = colaboradores.find((c: any) => c.id === colabId) || (db.trash?.dp_colaboradores || []).find((c: any) => c.id === colabId);
    setColabToDelete(colab || { id: colabId, nome: name });
  };

  // Executa o envio para a lixeira ({ deleted: true })
  const confirmDeleteColaborador = async () => {
    if (!colabToDelete) return;
    const { id: colabId, nome: name } = colabToDelete;

    try {
      if (dbFirestore && appId) {
        try {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dp_colaboradores', colabId), { deleted: true }, { merge: true });
        } catch (fErr) {
          console.warn("Firestore error deleting dp_colaborador:", fErr);
        }
      }

      setDbState((prev: any) => ({
        ...prev,
        dp_colaboradores: colaboradores.filter((c: any) => c.id !== colabId)
      }));

      addToast(`Colaborador "${name}" enviado para a Lixeira com sucesso.`, 'success');
    } catch (err: any) {
      addToast(`Erro ao enviar para lixeira: ${err.message}`, 'error');
    } finally {
      setColabToDelete(null);
    }
  };

  // Restaurar colaborador da lixeira ({ deleted: false })
  const handleRestoreColaborador = async (colabId: string, name: string) => {
    try {
      if (dbFirestore && appId) {
        try {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dp_colaboradores', colabId), { deleted: false }, { merge: true });
        } catch (fErr) {
          console.warn("Firestore error restoring dp_colaborador:", fErr);
        }
      }

      setDbState((prev: any) => {
        const itemInTrash = (prev.trash?.dp_colaboradores || []).find((c: any) => c.id === colabId);
        const updatedTrash = (prev.trash?.dp_colaboradores || []).filter((c: any) => c.id !== colabId);
        const restoredItem = itemInTrash ? { ...itemInTrash, deleted: false } : null;
        
        return {
          ...prev,
          dp_colaboradores: restoredItem 
            ? [...(prev.dp_colaboradores || []).filter((x: any) => x.id !== colabId), restoredItem]
            : prev.dp_colaboradores,
          trash: {
            ...prev.trash,
            dp_colaboradores: updatedTrash
          }
        };
      });

      addToast(`Colaborador "${name}" restaurado com sucesso!`, 'success');
    } catch (err: any) {
      addToast(`Erro ao restaurar: ${err.message}`, 'error');
    }
  };

  // Exclusão definitiva da lixeira
  const handlePermanentDeleteColaborador = async (colabId: string, name: string) => {
    if (!safeConfirm(`🚨 ATENÇÃO EXTREMA: Deseja realmente excluir permanentemente "${name}" da lixeira? Esta ação não possui desfazer.`)) {
      return;
    }

    try {
      if (dbFirestore && appId) {
        try {
          await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dp_colaboradores', colabId));
        } catch (fErr) {
          console.warn("Firestore error permanent deleting dp_colaborador:", fErr);
        }
      }

      setDbState((prev: any) => ({
        ...prev,
        trash: {
          ...prev.trash,
          dp_colaboradores: (prev.trash?.dp_colaboradores || []).filter((c: any) => c.id !== colabId)
        }
      }));

      addToast(`Colaborador "${name}" excluído definitivamente.`, 'success');
    } catch (err: any) {
      addToast(`Erro ao excluir permanentemente: ${err.message}`, 'error');
    }
  };

  // --- MEMBER INTEGRATION IMPORT ---
  const handleImportMember = (memb: any) => {
    setColabForm({
      nome: memb.nome || '',
      cpf: memb.cpf || '',
      rg: memb.rg || '',
      tipo: memb.cargo?.toLowerCase().includes('pastor') ? 'pastor' : 'funcionario',
      cargo: memb.cargo || '',
      admissao: memb.data_admissao || new Date().toISOString().split('T')[0],
      demissao: '',
      salario_base: 1412.00, // Salário mínimo default para preencher
      banco: '',
      agencia: '',
      conta: '',
      tipo_conta: 'corrente',
      pix: memb.chave_pix || memb.cpf || memb.telefone || '',
      inss: true,
      irpf: false,
      status: 'ativo',
      congregacao_id: memb.congregacao_id || 'sede',
      telefone: memb.telefone || '',
      email: memb.email || '',
      observacao: `Importado do cadastro de membros gerais (Membro ID: ${memb.id})`
    });

    setEditingColab(null);
    setShowImportModal(false);
    setShowColabModal(true);
    addToast('Dados do membro carregados! Defina o salário, dados bancários e salve.', 'info');
  };

  // Non-imported registered members filter helper
  const nonImportedMembers = useMemo(() => {
    const colabCpfs = new Set(colaboradores.map((c: any) => c.cpf?.replace(/\D/g, '')));
    const colabNames = new Set(colaboradores.map((c: any) => c.nome?.trim().toLowerCase()));
    
    return membrosGerais.filter((m: any) => {
      if (m.deleted) return false;
      const mCpfClean = m.cpf?.replace(/\D/g, '');
      const mNameClean = m.nome?.trim().toLowerCase();
      
      const alreadyLinked = (mCpfClean && colabCpfs.has(mCpfClean)) || colabNames.has(mNameClean);
      if (alreadyLinked) return false;

      if (!importSearch.trim()) return true;
      return (
        m.nome?.toLowerCase().includes(importSearch.toLowerCase()) ||
        m.cpf?.includes(importSearch) ||
        m.cargo?.toLowerCase().includes(importSearch.toLowerCase())
      );
    });
  }, [membrosGerais, colaboradores, importSearch]);


  // --- GENERATE ALL SLIPS (PAYROLL) FOR SELECT MONTH ---
  const handleGeneratePayroll = async () => {
    const activeStaffs = colaboradores.filter((c: any) => c.status === 'ativo' && !c.deleted);
    if (activeStaffs.length === 0) {
      addToast('Não há colaboradores ATIVOS cadastrados para gerar folha de pagamento.', 'warning');
      return;
    }

    if (!safeConfirm(`Deseja gerar a folha de pagamento para todos os ${activeStaffs.length} colaboradores ativos no mês ${selectedMonth}?`)) {
      return;
    }

    let countSaved = 0;
    let countExisted = 0;
    const updatedFolhas = [...folhas];

    for (const c of activeStaffs) {
      // Check if slip exists for this colleague this month
      const exists = folhas.find((f: any) => f.colaborador_id === c.id && f.mes_referencia === selectedMonth);
      if (exists) {
        countExisted++;
        continue;
      }

      // Calculate default simple tax estimations
      // Clerics (Pastors) have simplified Prebenda without traditional CLT INSS unless checked, Prestadores have separate retention
      const sal = parseFloat(c.salario_base) || 0;
      const proventos = [
        { 
          descricao: c.tipo === 'pastor' ? 'Prebenda Pastoral / Sustento' : 'Salário Base', 
          valor: sal 
        }
      ];

      // Auto-inject benefits configured in profile
      if (c.beneficio_auxilio_moradia && parseFloat(c.beneficio_auxilio_moradia) > 0) {
        proventos.push({ descricao: 'Auxílio Moradia (Eclesiástico)', valor: parseFloat(c.beneficio_auxilio_moradia) });
      }
      if (c.beneficio_vale_transporte && parseFloat(c.beneficio_vale_transporte) > 0) {
        proventos.push({ descricao: 'Vale Transporte (VT)', valor: parseFloat(c.beneficio_vale_transporte) });
      }
      if (c.beneficio_vale_refeicao && parseFloat(c.beneficio_vale_refeicao) > 0) {
        proventos.push({ descricao: 'Vale Refeição (VR)', valor: parseFloat(c.beneficio_vale_refeicao) });
      }
      if (c.beneficio_ajuda_custo && parseFloat(c.beneficio_ajuda_custo) > 0) {
        proventos.push({ descricao: 'Ajuda de Custo Ministerial', valor: parseFloat(c.beneficio_ajuda_custo) });
      }
      if (c.beneficio_plano_saude && parseFloat(c.beneficio_plano_saude) > 0) {
        proventos.push({ descricao: 'Cota de Plano de Saúde', valor: parseFloat(c.beneficio_plano_saude) });
      }

      const descontos = [];
      
      // Automatic INSS mock estimate (e.g. simplified Flat rate of 8% for simulation, if checked, maximum CLT thresholds can apply, let's keep simple 9%)
      if (c.inss && sal > 0) {
        const inssVal = Math.round((sal * 0.09) * 100) / 100;
        descontos.push({ descricao: 'INSS Estimado', valor: inssVal });
      }

      // Automatic IRRF mock estimate
      if (c.irpf && sal > 2259.20) {
        // Simple scale deduction (flat 7.5% as visual demonstration)
        const irrfVal = Math.round((sal * 0.075) * 100) / 100;
        descontos.push({ descricao: 'IRRF Retido', valor: irrfVal });
      }

      const totProv = proventos.reduce((acc, cr) => acc + cr.valor, 0);
      const totDesc = descontos.reduce((acc, cr) => acc + cr.valor, 0);
      const valLiq = Math.max(0, totProv - totDesc);

      const slipId = `slip_${Date.now()}_${c.id}`;
      const newSlip = {
        id: slipId,
        colaborador_id: c.id,
        mes_referencia: selectedMonth,
        data_pagamento: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().split('T')[0], // Quinta dia útil approx
        proventos,
        descontos,
        valor_liquido: valLiq,
        status: 'rascunho',
        observacoes: `Folha de pagamento gerada automaticamente baseada no salário de ${c.nome}.`,
        created_at: new Date().toISOString()
      };

      // save to firebase
      if (dbFirestore && appId) {
        try {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dp_folhas', slipId), newSlip);
        } catch (fErr) {
          console.warn("Firestore save dp_folhas error:", fErr);
        }
      }

      updatedFolhas.push(newSlip);
      countSaved++;
    }

    setDbState((prev: any) => ({
      ...prev,
      dp_folhas: updatedFolhas
    }));

    if (countSaved > 0) {
      addToast(`${countSaved} contracheques gerados com sucesso para ${selectedMonth}. ${countExisted > 0 ? `(${countExisted} já existiam)` : ''}`, 'success');
    } else {
      addToast(`Todos os contracheques para os colaboradores ativos já estavam gerados no mês ${selectedMonth}.`, 'info');
    }
  };

  // Delete Individual Pay slip
  const handleDeleteSlip = async (slipId: string) => {
    if (!safeConfirm("Deseja realmente excluir este holerite/contra-cheque?")) {
      return;
    }

    try {
      if (dbFirestore && appId) {
        try {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dp_folhas', slipId), { deleted: true }, { merge: true });
        } catch (fErr) {
          console.warn("Firestore error deleting slip:", fErr);
        }
      }

      setDbState((prev: any) => ({
        ...prev,
        dp_folhas: folhas.filter((f: any) => f.id !== slipId)
      }));

      addToast('Recibo de pagamento excluído.', 'success');
    } catch (err: any) {
      addToast(`Erro ao remover recibo: ${err.message}`, 'error');
    }
  };

  // Change individual slip pay status with direct financial Integration (Outflow)
  const toggleSlipStatus = async (slip: any) => {
    const nextStatus = slip.status === 'pago' ? 'rascunho' : 'pago';
    try {
      const colab = colaboradores.find((c: any) => c.id === slip.colaborador_id);
      const colabNome = colab ? colab.nome : 'Colaborador';
      const congregacaoId = colab?.congregacao_id || 'sede';
      
      const novaSaidaValue = parseFloat(slip.valor_liquido) || 0;
      
      // Let's configure the outlays (saída) metadata
      const novaSaida = {
        tipo: 'saida',
        valor: novaSaidaValue,
        categoria: colab?.tipo === 'pastor' ? 'Prebenda Clerical' : 'Salários e Encargos',
        descricao: `Pagamento de Folha - ${colabNome} - Ref. ${slip.mes_referencia}`,
        especificacao: `Recibo de folha de pagamento administrativa • Tipo de Vínculo: ${colab?.tipo?.toUpperCase() || 'COLABORADOR'}. Proventos: ${formatBRL(slip.proventos?.reduce((acc: number, item: any) => acc + item.valor, 0))}, Descontos: ${formatBRL(slip.descontos?.reduce((acc: number, item: any) => acc + item.valor, 0))}`,
        data_competencia: new Date().toISOString().split('T')[0],
        data_vencimento: new Date().toISOString().split('T')[0],
        data_pagamento: new Date().toISOString().split('T')[0],
        forma_pagamento: colab?.pix ? 'PIX' : (colab?.banco ? 'Transferência' : 'Dinheiro'),
        status: 'pago',
        conciliado: false,
        congregacao_id: congregacaoId,
        created_at: new Date().toISOString()
      };

      let financeiroRefId = slip.financeiro_id || '';

      if (dbFirestore && appId) {
        if (nextStatus === 'pago') {
          if (!financeiroRefId) {
            // Write new cash outflow to Central Ledger
            const finRef = await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro'), novaSaida);
            financeiroRefId = finRef.id;

            // Generate System-wide audit logs
            await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'auditoria_logs'), {
              acao: 'CRIAÇÃO',
              descricao: `Folha de pagamento de ${colabNome} (Ref ${slip.mes_referencia}) confirmada e integrada no financeiro do sistema no valor de ${formatBRL(novaSaidaValue)}`,
              usuario_email: user?.email || 'sistema_dp',
              usuario_nome: user?.nome || 'Departamento Pessoal',
              origem: 'departamento_pessoal',
              documento_id: finRef.id,
              created_at: new Date().toISOString()
            });
          } else {
            // Update exist finance item
            await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', financeiroRefId), novaSaida, { merge: true });
          }
        } else {
          // If reverted back to drafts: delete the associated expense
          if (financeiroRefId) {
            try {
              await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', financeiroRefId));
              
              // Generate audit logs for deleted expense
              await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'auditoria_logs'), {
                acao: 'EXCLUSÃO',
                descricao: `Integração financeira removida por reverter folha de pagamento de ${colabNome} (Ref ${slip.mes_referencia}) para rascunho`,
                usuario_email: user?.email || 'sistema_dp',
                usuario_nome: user?.nome || 'Departamento Pessoal',
                origem: 'departamento_pessoal',
                documento_id: financeiroRefId,
                created_at: new Date().toISOString()
              });
            } catch (errDel) {
              console.warn("Could not delete from financeiro collection:", errDel);
            }
            financeiroRefId = '';
          }
        }
      } else {
        // Fallback for local simulation mode to enable testing financial module creation instantly
        if (nextStatus === 'pago') {
          if (!financeiroRefId) {
            financeiroRefId = `fin_dp_${Date.now()}_${slip.id}`;
          }
        } else {
          financeiroRefId = '';
        }
      }

      // Consolidate states
      const updated = { 
        ...slip, 
        status: nextStatus, 
        financeiro_id: financeiroRefId,
        data_pagamento: nextStatus === 'pago' ? new Date().toISOString().split('T')[0] : '',
        updated_at: new Date().toISOString() 
      };

      if (dbFirestore && appId) {
        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dp_folhas', slip.id), updated, { merge: true });
      }

      setDbState((prev: any) => {
        const updatedFolhas = (prev.dp_folhas || []).map((f: any) => f.id === slip.id ? updated : f);
        let updatedFinanceiro = [...(prev.financeiro || [])];

        if (nextStatus === 'pago') {
          const index = updatedFinanceiro.findIndex((f: any) => f.id === financeiroRefId);
          const financialValue = { ...novaSaida, id: financeiroRefId };
          if (index > -1) {
            updatedFinanceiro[index] = financialValue;
          } else {
            updatedFinanceiro.unshift(financialValue);
          }
        } else {
          updatedFinanceiro = updatedFinanceiro.filter((f: any) => f.id !== slip.financeiro_id);
        }

        return {
          ...prev,
          dp_folhas: updatedFolhas,
          financeiro: updatedFinanceiro
        };
      });

      addToast(`Status do contracheque alterado para: ${nextStatus.toUpperCase()} e integrado com sucesso!`, 'success');
    } catch (err: any) {
      addToast(`Erro ao alterar status: ${err.message}`, 'error');
    }
  };

  // Add Item (Provento / Desconto) dynamically inside an expanded Pay Slip, auto syncing paid values with finance
  const handleAddSlipItem = async (slipId: string, type: 'provento' | 'desconto', desc: string, val: number) => {
    if (!desc.trim()) {
      addToast('Insira uma descrição válida.', 'warning');
      return;
    }
    if (val <= 0) {
      addToast('O valor deve ser maior que zero.', 'warning');
      return;
    }

    const targetSlip = folhas.find((f: any) => f.id === slipId);
    if (!targetSlip) return;

    try {
      const provs = [...(targetSlip.proventos || [])];
      const descs = [...(targetSlip.descontos || [])];

      if (type === 'provento') {
        provs.push({ descricao: desc, valor: val });
      } else {
        descs.push({ descricao: desc, valor: val });
      }

      const totProv = provs.reduce((acc, cr) => acc + cr.valor, 0);
      const totDesc = descs.reduce((acc, cr) => acc + cr.valor, 0);
      const valLiq = Math.max(0, totProv - totDesc);

      const updated = {
        ...targetSlip,
        proventos: provs,
        descontos: descs,
        valor_liquido: valLiq,
        updated_at: new Date().toISOString()
      };

      const colab = colaboradores.find((c: any) => c.id === targetSlip.colaborador_id);
      const colabNome = colab ? colab.nome : 'Colaborador';
      
      if (dbFirestore && appId) {
        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dp_folhas', slipId), updated, { merge: true });

        // Update financial item live if already paid!
        if (targetSlip.status === 'pago' && targetSlip.financeiro_id) {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', targetSlip.financeiro_id), {
            valor: valLiq,
            especificacao: `Recibo de folha de pagamento administrativa • Tipo de Vínculo: ${colab?.tipo?.toUpperCase() || 'COLABORADOR'}. Proventos: ${formatBRL(totProv)}, Descontos: ${formatBRL(totDesc)}`,
            updated_at: new Date().toISOString()
          }, { merge: true });
        }
      }

      setDbState((prev: any) => {
        const updatedFolhas = prev.dp_folhas.map((f: any) => f.id === slipId ? updated : f);
        let updatedFinanceiro = [...(prev.financeiro || [])];

        if (targetSlip.status === 'pago' && targetSlip.financeiro_id) {
          updatedFinanceiro = updatedFinanceiro.map((f: any) => f.id === targetSlip.financeiro_id ? {
            ...f,
            valor: valLiq,
            especificacao: `Recibo de folha de pagamento administrativa • Tipo de Vínculo: ${colab?.tipo?.toUpperCase() || 'COLABORADOR'}. Proventos: ${formatBRL(totProv)}, Descontos: ${formatBRL(totDesc)}`
          } : f);
        }

        return {
          ...prev,
          dp_folhas: updatedFolhas,
          financeiro: updatedFinanceiro
        };
      });

      addToast('Lançamento adicionado ao contracheque.', 'success');
    } catch (err: any) {
      addToast(`Erro ao adicionar lançamento: ${err.message}`, 'error');
    }
  };

  // Remove Item (Provento / Desconto) from Expanded Pay slip, auto syncing with finance
  const handleRemoveSlipItem = async (slipId: string, type: 'provento' | 'desconto', index: number) => {
    const targetSlip = folhas.find((f: any) => f.id === slipId);
    if (!targetSlip) return;

    try {
      const provs = [...(targetSlip.proventos || [])];
      const descs = [...(targetSlip.descontos || [])];

      if (type === 'provento') {
        provs.splice(index, 1);
      } else {
        descs.splice(index, 1);
      }

      const totProv = provs.reduce((acc, cr) => acc + cr.valor, 0);
      const totDesc = descs.reduce((acc, cr) => acc + cr.valor, 0);
      const valLiq = Math.max(0, totProv - totDesc);

      const updated = {
        ...targetSlip,
        proventos: provs,
        descontos: descs,
        valor_liquido: valLiq,
        updated_at: new Date().toISOString()
      };

      const colab = colaboradores.find((c: any) => c.id === targetSlip.colaborador_id);

      if (dbFirestore && appId) {
        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dp_folhas', slipId), updated, { merge: true });

        // Update financial item live if already paid!
        if (targetSlip.status === 'pago' && targetSlip.financeiro_id) {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', targetSlip.financeiro_id), {
            valor: valLiq,
            especificacao: `Recibo de folha de pagamento administrativa • Tipo de Vínculo: ${colab?.tipo?.toUpperCase() || 'COLABORADOR'}. Proventos: ${formatBRL(totProv)}, Descontos: ${formatBRL(totDesc)}`,
            updated_at: new Date().toISOString()
          }, { merge: true });
        }
      }

      setDbState((prev: any) => {
        const updatedFolhas = prev.dp_folhas.map((f: any) => f.id === slipId ? updated : f);
        let updatedFinanceiro = [...(prev.financeiro || [])];

        if (targetSlip.status === 'pago' && targetSlip.financeiro_id) {
          updatedFinanceiro = updatedFinanceiro.map((f: any) => f.id === targetSlip.financeiro_id ? {
            ...f,
            valor: valLiq,
            especificacao: `Recibo de folha de pagamento administrativa • Tipo de Vínculo: ${colab?.tipo?.toUpperCase() || 'COLABORADOR'}. Proventos: ${formatBRL(totProv)}, Descontos: ${formatBRL(totDesc)}`
          } : f);
        }

        return {
          ...prev,
          dp_folhas: updatedFolhas,
          financeiro: updatedFinanceiro
        };
      });

      addToast('Lançamento removido do contracheque.', 'info');
    } catch (err: any) {
      addToast('Erro ao remover lançamento.', 'error');
    }
  };

  // --- PRINT CONTRACHEQUE ---
  const handlePrintSlip = (slip: any, colab: any) => {
    if (!colab) {
      addToast('Colaborador associado não encontrado para impressão.', 'error');
      return;
    }

    setPrintData({
      slip,
      colaborador: colab,
      igreja: db.igreja,
      mesReferenciaExtenso: new Date(slip.mes_referencia + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    });
    setPrintMode('dp_contracheque');
    setPreviewOpen(true);
  };

  // --- NATIVE VECTOR PDF EXPORT DOWNLOAD ---
  const handleDownloadPDF = (slip: any, colab: any) => {
    if (!colab) {
      addToast('Colaborador associado não encontrado para download.', 'error');
      return;
    }

    try {
      const docPdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const igreja = db.igreja || {};
      const numMes = slip.mes_referencia;
      const dateParts = numMes.split('-');
      const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, 15);
      const mesReferenciaExtenso = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

      const totProventos = (slip.proventos || []).reduce((acc: number, item: any) => acc + item.valor, 0);
      const totDescontos = (slip.descontos || []).reduce((acc: number, item: any) => acc + item.valor, 0);
      const valorLiquido = slip.valor_liquido || 0;

      // Outer borders
      docPdf.setDrawColor(40, 40, 40);
      docPdf.setLineWidth(0.5);
      docPdf.rect(10, 10, 190, 135);
      docPdf.setLineWidth(0.1);
      docPdf.rect(11, 11, 188, 133);

      // Title Banner block
      docPdf.setFillColor(240, 243, 246);
      docPdf.rect(12, 12, 186, 18, 'F');
      
      docPdf.setFont('Helvetica', 'bold');
      docPdf.setFontSize(10);
      docPdf.setTextColor(30, 41, 59);
      docPdf.text(igreja.nome?.toUpperCase() || "IGREJA SEDE PRINCIPAL", 15, 17);
      
      docPdf.setFont('Helvetica', 'normal');
      docPdf.setFontSize(7.5);
      docPdf.setTextColor(100, 110, 120);
      docPdf.text(`CNPJ: ${igreja.cnpj || "00.000.000/0001-00"}`, 15, 21);
      docPdf.text(igreja.endereco || "Endereco nao cadastrado", 15, 25);

      docPdf.setFont('Helvetica', 'bold');
      docPdf.setFontSize(9);
      docPdf.setTextColor(79, 70, 229); // Indigo-600 colored text label
      docPdf.text("RECIBO DE PAGAMENTO", 140, 17);
      
      docPdf.setFont('Helvetica', 'bold');
      docPdf.setFontSize(8);
      docPdf.setTextColor(40, 40, 40);
      docPdf.text(`REF: ${mesReferenciaExtenso}`, 140, 21);
      
      docPdf.setFont('Helvetica', 'normal');
      docPdf.setFontSize(7);
      docPdf.setTextColor(120, 120, 120);
      docPdf.text(`Status: ${slip.status?.toUpperCase() || 'RASCUNHO'}`, 140, 25);

      docPdf.setDrawColor(200, 200, 200);
      docPdf.line(12, 32, 198, 32);

      // Collaborador Card
      docPdf.setFillColor(248, 250, 252);
      docPdf.rect(12, 34, 186, 17, 'F');
      docPdf.setDrawColor(226, 232, 240);
      docPdf.rect(12, 34, 186, 17);

      docPdf.setFontSize(7);
      docPdf.setTextColor(120, 120, 120);
      docPdf.text("Colaborador:", 15, 38);
      docPdf.text("CPF/RG:", 115, 38);
      docPdf.text("Funcao:", 155, 38);

      docPdf.text("Admissao:", 15, 47);
      docPdf.text("Dados de Pagamento:", 55, 47);
      docPdf.text("Vinculo:", 155, 47);

      docPdf.setFont('Helvetica', 'bold');
      docPdf.setFontSize(8.5);
      docPdf.setTextColor(30, 41, 59);
      docPdf.text(colab.nome?.toUpperCase() || "", 15, 42);
      docPdf.text(`${colab.cpf || '-'} / ${colab.rg || '-'}`, 115, 42);
      docPdf.text(colab.cargo?.toUpperCase() || "-", 155, 42);

      const paymentInfoStr = colab.banco ? `BANCO: ${colab.banco} AG: ${colab.agencia || ''} C: ${colab.conta || ''} ${colab.pix ? `| PIX: ${colab.pix}` : ''}` : (colab.pix ? `PIX: ${colab.pix}` : 'CAIXA FISICO / DINHEIRO');
      const vinculoText = colab.tipo === 'pastor' ? 'Prebenda Clerical' : colab.tipo === 'funcionario' ? 'CLT' : colab.tipo === 'prestador' ? 'Prestador' : 'Colaborador';

      docPdf.text(colab.admissao || '-', 15, 51);
      docPdf.setFontSize(7.5);
      docPdf.text(paymentInfoStr.toUpperCase().substring(0, 52), 55, 51);
      docPdf.text(vinculoText.toUpperCase(), 155, 51);

      // Ledger Table
      docPdf.setFillColor(15, 23, 42);
      docPdf.rect(12, 54, 186, 6, 'F');
      docPdf.setFont('Helvetica', 'bold');
      docPdf.setFontSize(7);
      docPdf.setTextColor(255, 255, 255);
      docPdf.text("Cod.", 14, 58);
      docPdf.text("Descricao do Lancamento", 30, 58);
      docPdf.text("Ref.", 115, 58);
      docPdf.text("Proventos (+)", 145, 58);
      docPdf.text("Descontos (-)", 175, 58);

      let currentY = 60;
      docPdf.setTextColor(51, 65, 85);
      docPdf.setFont('Helvetica', 'normal');
      docPdf.setFontSize(7.5);

      const items: any[] = [];
      (slip.proventos || []).forEach((p: any, i: number) => {
        items.push({ cod: `10${i}`, desc: p.descricao, ref: '30 dias', prov: p.valor, descnt: null });
      });
      (slip.descontos || []).forEach((d: any, i: number) => {
        items.push({ cod: `20${i}`, desc: d.descricao, ref: colab.tipo === 'pastor' ? 'Clero' : 'CLT', prov: null, descnt: d.valor });
      });

      while (items.length < 5) {
        items.push({ cod: '', desc: '', ref: '', prov: null, descnt: null });
      }

      items.forEach((item) => {
        docPdf.setDrawColor(241, 245, 249);
        docPdf.line(12, currentY + 5, 198, currentY + 5);

        docPdf.setDrawColor(226, 232, 240);
        docPdf.line(26, currentY, 26, currentY + 5);
        docPdf.line(110, currentY, 110, currentY + 5);
        docPdf.line(135, currentY, 135, currentY + 5);
        docPdf.line(165, currentY, 165, currentY + 5);

        if (item.cod) {
          docPdf.setFont('Courier', 'normal');
          docPdf.setFontSize(7);
          docPdf.text(item.cod, 15, currentY + 3.5);
          docPdf.setFont('Helvetica', 'bold');
          docPdf.setFontSize(7.5);
          docPdf.text(item.desc, 30, currentY + 3.5);
          docPdf.setFont('Helvetica', 'normal');
          docPdf.text(item.ref, 115, currentY + 3.5);
          
          if (item.prov !== null) {
            docPdf.text(`R$ ${item.prov.toFixed(2)}`, 142, currentY + 3.5);
          } else {
            docPdf.text("-", 145, currentY + 3.5);
          }

          if (item.descnt !== null) {
            docPdf.setFont('Helvetica', 'bold');
            docPdf.setTextColor(190, 24, 74);
            docPdf.text(`R$ ${item.descnt.toFixed(2)}`, 172, currentY + 3.5);
            docPdf.setTextColor(51, 65, 85);
            docPdf.setFont('Helvetica', 'normal');
          } else {
            docPdf.text("-", 175, currentY + 3.5);
          }
        }
        
        currentY += 5;
      });

      docPdf.setDrawColor(71, 85, 105);
      docPdf.rect(12, currentY + 1, 186, 7);
      
      docPdf.setFont('Helvetica', 'bold');
      docPdf.setFontSize(7.5);
      docPdf.text(`Total Proventos: R$ ${totProventos.toFixed(2)}`, 15, currentY + 5.5);
      docPdf.setTextColor(190, 24, 74);
      docPdf.text(`Total Descontos: R$ ${totDescontos.toFixed(2)}`, 85, currentY + 5.5);
      
      docPdf.setFillColor(241, 245, 249);
      docPdf.rect(150, currentY + 1.1, 47.9, 6.8, 'F');
      
      docPdf.setTextColor(15, 23, 42);
      docPdf.setFontSize(8);
      docPdf.text(`Liquido: R$ ${valorLiquido.toFixed(2)}`, 154, currentY + 5.5);

      const declY = currentY + 12;
      docPdf.setFont('Helvetica', 'normal');
      docPdf.setFontSize(6.5);
      docPdf.setTextColor(100, 110, 120);
      
      const statement = `Declaro ter recebido de ${igreja.nome || "IGREJA ADVENTISTA"} a importancia liquida discriminada neste recibo de pagamento administrativo, para a qual dou plena e irrevogavel quitacao.`;
      const splitStatement = docPdf.splitTextToSize(statement, 85);
      docPdf.text(splitStatement, 15, declY);

      docPdf.line(15, declY + 18, 90, declY + 18);
      docPdf.setFont('Helvetica', 'bold');
      docPdf.text("Assinatura do Colaborador / Cooperador", 23, declY + 21);

      const payDate = slip.data_pagamento ? new Date(slip.data_pagamento + 'T12:00:00').toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
      docPdf.setFont('Helvetica', 'bold');
      docPdf.text(`Data de Pagamento: ${payDate}`, 115, declY);
      docPdf.setFont('Helvetica', 'normal');
      docPdf.setFontSize(6);
      docPdf.text("Gerado eletronicamente via Modulo Eclesiastico DP / Contabil", 115, declY + 3);

      docPdf.setDrawColor(180, 180, 180);
      docPdf.line(115, declY + 18, 190, declY + 18);
      docPdf.setFont('Helvetica', 'bold');
      docPdf.setFontSize(6.5);
      docPdf.text("Assinatura do Responsavel (Tesouraria)", 123, declY + 21);

      const cleanName = colab.nome?.toLowerCase().replace(/\s+/g, '_') || 'colaborador';
      docPdf.save(`contracheque_${cleanName}_${slip.mes_referencia}.pdf`);
      addToast("Contracheque exportado em PDF com sucesso!", "success");
    } catch (e: any) {
      console.error(e);
      addToast(`Erro ao gerar PDF: ${e.message}`, 'error');
    }
  };

  // --- BATCH PRINT ALL SLIPS FOR THE CHOSEN REFERENCE MONTH ---
  const handlePrintBatch = () => {
    if (currentMonthSlips.length === 0) {
      addToast('Não há contracheques gerados neste mês para impressão em lote.', 'warning');
      return;
    }
    
    setPrintData({
      slips: currentMonthSlips,
      colaboradores,
      igreja: db.igreja,
      selectedMonth,
      mesReferenciaExtenso: new Date(selectedMonth + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    });
    setPrintMode('dp_contracheque_lote');
    setPreviewOpen(true);
  };

  // --- DOWNLOAD ALL MONTHLY SLIPS CONSOLIDATED INTO A SINGLE PDF FILE ---
  const handleDownloadBatchPDF = () => {
    if (currentMonthSlips.length === 0) {
      addToast('Não há contracheques gerados para baixar em lote.', 'warning');
      return;
    }

    try {
      const docPdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const igreja = db.igreja || {};
      const numMes = selectedMonth;
      const dateParts = numMes.split('-');
      const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, 15);
      const mesReferenciaExtenso = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

      let pagesCount = 0;

      currentMonthSlips.forEach((slip: any) => {
        const colab = colaboradores.find((c: any) => c.id === slip.colaborador_id);
        if (!colab) return;

        if (pagesCount > 0) {
          docPdf.addPage();
        }
        pagesCount++;

        const totProventos = (slip.proventos || []).reduce((acc: number, item: any) => acc + item.valor, 0);
        const totDescontos = (slip.descontos || []).reduce((acc: number, item: any) => acc + item.valor, 0);
        const valorLiquido = slip.valor_liquido || 0;

        // Outer borders
        docPdf.setDrawColor(40, 40, 40);
        docPdf.setLineWidth(0.5);
        docPdf.rect(10, 10, 190, 135);
        docPdf.setLineWidth(0.1);
        docPdf.rect(11, 11, 188, 133);

        // Title Banner block
        docPdf.setFillColor(240, 243, 246);
        docPdf.rect(12, 12, 186, 18, 'F');
        
        docPdf.setFont('Helvetica', 'bold');
        docPdf.setFontSize(10);
        docPdf.setTextColor(30, 41, 59);
        docPdf.text(igreja.nome?.toUpperCase() || "IGREJA SEDE PRINCIPAL", 15, 17);
        
        docPdf.setFont('Helvetica', 'normal');
        docPdf.setFontSize(7.5);
        docPdf.setTextColor(100, 110, 120);
        docPdf.text(`CNPJ: ${igreja.cnpj || "00.000.000/0001-00"}`, 15, 21);
        docPdf.text(igreja.endereco || "Endereco nao cadastrado", 15, 25);

        docPdf.setFont('Helvetica', 'bold');
        docPdf.setFontSize(9);
        docPdf.setTextColor(79, 70, 229); // Indigo-600 colored text label
        docPdf.text("RECIBO DE PAGAMENTO", 140, 17);
        
        docPdf.setFont('Helvetica', 'bold');
        docPdf.setFontSize(8);
        docPdf.setTextColor(40, 40, 40);
        docPdf.text(`REF: ${mesReferenciaExtenso}`, 140, 21);
        
        docPdf.setFont('Helvetica', 'normal');
        docPdf.setFontSize(7);
        docPdf.setTextColor(120, 120, 120);
        docPdf.text(`Status: ${slip.status?.toUpperCase() || 'RASCUNHO'}`, 140, 25);

        docPdf.setDrawColor(200, 200, 200);
        docPdf.line(12, 32, 198, 32);

        // Collaborador Card
        docPdf.setFillColor(248, 250, 252);
        docPdf.rect(12, 34, 186, 17, 'F');
        docPdf.setDrawColor(226, 232, 240);
        docPdf.rect(12, 34, 186, 17);

        docPdf.setFontSize(7);
        docPdf.setTextColor(120, 120, 120);
        docPdf.text("Colaborador:", 15, 38);
        docPdf.text("CPF/RG:", 115, 38);
        docPdf.text("Funcao:", 155, 38);

        docPdf.text("Admissao:", 15, 47);
        docPdf.text("Dados de Pagamento:", 55, 47);
        docPdf.text("Vinculo:", 155, 47);

        docPdf.setFont('Helvetica', 'bold');
        docPdf.setFontSize(8.5);
        docPdf.setTextColor(30, 41, 59);
        docPdf.text(colab.nome?.toUpperCase() || "", 15, 42);
        docPdf.text(`${colab.cpf || '-'} / ${colab.rg || '-'}`, 115, 42);
        docPdf.text(colab.cargo?.toUpperCase() || "-", 155, 42);

        const paymentInfoStr = colab.banco ? `BANCO: ${colab.banco} AG: ${colab.agencia || ''} C: ${colab.conta || ''} ${colab.pix ? `| PIX: ${colab.pix}` : ''}` : (colab.pix ? `PIX: ${colab.pix}` : 'CAIXA FISICO / DINHEIRO');
        const vinculoText = colab.tipo === 'pastor' ? 'Prebenda Clerical' : colab.tipo === 'funcionario' ? 'CLT' : colab.tipo === 'prestador' ? 'Prestador' : 'Colaborador';

        docPdf.text(colab.admissao || '-', 15, 51);
        docPdf.setFontSize(7.5);
        docPdf.text(paymentInfoStr.toUpperCase().substring(0, 52), 55, 51);
        docPdf.text(vinculoText.toUpperCase(), 155, 51);

        // Ledger Table
        docPdf.setFillColor(15, 23, 42);
        docPdf.rect(12, 54, 186, 6, 'F');
        docPdf.setFont('Helvetica', 'bold');
        docPdf.setFontSize(7);
        docPdf.setTextColor(255, 255, 255);
        docPdf.text("Cod.", 14, 58);
        docPdf.text("Descricao do Lancamento", 30, 58);
        docPdf.text("Ref.", 115, 58);
        docPdf.text("Proventos (+)", 145, 58);
        docPdf.text("Descontos (-)", 175, 58);

        let currentY = 60;
        docPdf.setTextColor(51, 65, 85);
        docPdf.setFont('Helvetica', 'normal');
        docPdf.setFontSize(7.5);

        const items: any[] = [];
        (slip.proventos || []).forEach((p: any, i: number) => {
          items.push({ cod: `10${i}`, desc: p.descricao, ref: '30 dias', prov: p.valor, descnt: null });
        });
        (slip.descontos || []).forEach((d: any, i: number) => {
          items.push({ cod: `20${i}`, desc: d.descricao, ref: colab.tipo === 'pastor' ? 'Clero' : 'CLT', prov: null, descnt: d.valor });
        });

        while (items.length < 5) {
          items.push({ cod: '', desc: '', ref: '', prov: null, descnt: null });
        }

        items.forEach((item) => {
          docPdf.setDrawColor(241, 245, 249);
          docPdf.line(12, currentY + 5, 198, currentY + 5);

          docPdf.setDrawColor(226, 232, 240);
          docPdf.line(26, currentY, 26, currentY + 5);
          docPdf.line(110, currentY, 110, currentY + 5);
          docPdf.line(135, currentY, 135, currentY + 5);
          docPdf.line(165, currentY, 165, currentY + 5);

          if (item.cod) {
            docPdf.setFont('Courier', 'normal');
            docPdf.setFontSize(7);
            docPdf.text(item.cod, 15, currentY + 3.5);
            docPdf.setFont('Helvetica', 'bold');
            docPdf.setFontSize(7.5);
            docPdf.text(item.desc, 30, currentY + 3.5);
            docPdf.setFont('Helvetica', 'normal');
            docPdf.text(item.ref, 115, currentY + 3.5);
            
            if (item.prov !== null) {
              docPdf.text(`R$ ${item.prov.toFixed(2)}`, 142, currentY + 3.5);
            } else {
              docPdf.text("-", 145, currentY + 3.5);
            }

            if (item.descnt !== null) {
              docPdf.setFont('Helvetica', 'bold');
              docPdf.setTextColor(190, 24, 74);
              docPdf.text(`R$ ${item.descnt.toFixed(2)}`, 172, currentY + 3.5);
              docPdf.setTextColor(51, 65, 85);
              docPdf.setFont('Helvetica', 'normal');
            } else {
              docPdf.text("-", 175, currentY + 3.5);
            }
          }
          currentY += 5;
        });

        docPdf.setDrawColor(71, 85, 105);
        docPdf.rect(12, currentY + 1, 186, 7);
        
        docPdf.setFont('Helvetica', 'bold');
        docPdf.setFontSize(7.5);
        docPdf.text(`Total Proventos: R$ ${totProventos.toFixed(2)}`, 15, currentY + 5.5);
        docPdf.setTextColor(190, 24, 74);
        docPdf.text(`Total Descontos: R$ ${totDescontos.toFixed(2)}`, 85, currentY + 5.5);
        
        docPdf.setFillColor(241, 245, 249);
        docPdf.rect(150, currentY + 1.1, 47.9, 6.8, 'F');
        
        docPdf.setTextColor(15, 23, 42);
        docPdf.setFontSize(8);
        docPdf.text(`Liquido: R$ ${valorLiquido.toFixed(2)}`, 154, currentY + 5.5);

        const declY = currentY + 12;
        docPdf.setFont('Helvetica', 'normal');
        docPdf.setFontSize(6.5);
        docPdf.setTextColor(100, 110, 120);
        
        const statement = `Declaro ter recebido de ${igreja.nome || "IGREJA ADVENTISTA"} a importancia liquida discriminada neste recibo de pagamento administrativo, para a qual dou plena e irrevogavel quitacao.`;
        const splitStatement = docPdf.splitTextToSize(statement, 85);
        docPdf.text(splitStatement, 15, declY);

        docPdf.line(15, declY + 18, 90, declY + 18);
        docPdf.setFont('Helvetica', 'bold');
        docPdf.text("Assinatura do Colaborador / Cooperador", 23, declY + 21);

        const payDate = slip.data_pagamento ? new Date(slip.data_pagamento + 'T12:00:00').toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
        docPdf.setFont('Helvetica', 'bold');
        docPdf.text(`Data de Pagamento: ${payDate}`, 115, declY);
        docPdf.setFont('Helvetica', 'normal');
        docPdf.setFontSize(6);
        docPdf.text("Gerado eletronicamente via Modulo Eclesiastico DP / Contabil", 115, declY + 3);

        docPdf.setDrawColor(180, 180, 180);
        docPdf.line(115, declY + 18, 190, declY + 18);
        docPdf.setFont('Helvetica', 'bold');
        docPdf.setFontSize(6.5);
        docPdf.text("Assinatura do Responsavel (Tesouraria)", 123, declY + 21);
      });

      if (pagesCount === 0) {
        addToast('Nenhum colaborador elegível para exportação.', 'warning');
        return;
      }

      docPdf.save(`lote_contracheques_${selectedMonth}.pdf`);
      addToast(`Lote com ${pagesCount} contracheques exportado em PDF com sucesso!`, 'success');
    } catch (e: any) {
      console.error(e);
      addToast(`Erro ao exportar PDF em lote: ${e.message}`, 'error');
    }
  };

  // --- FILTERED LIST FOR COLABORADORES TAB ---
  const filteredColaboradores = useMemo(() => {
    const listToFilter = colabStatusFilter === 'lixeira'
      ? (db.trash?.dp_colaboradores || [])
      : colaboradores;

    return listToFilter.filter((c: any) => {
      // Normal flow excludes deleted items
      if (colabStatusFilter !== 'lixeira' && c.deleted) return false;
      
      const matchSearch = 
        c.nome?.toLowerCase().includes(colabSearch.toLowerCase()) ||
        c.cpf?.includes(colabSearch) ||
        c.cargo?.toLowerCase().includes(colabSearch.toLowerCase());
      
      const matchType = colabTypeFilter === 'todos' || c.tipo === colabTypeFilter;
      const matchStatus = colabStatusFilter === 'lixeira' || colabStatusFilter === 'todos' || c.status === colabStatusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [colaboradores, db.trash?.dp_colaboradores, colabSearch, colabTypeFilter, colabStatusFilter]);

  // --- FILTERED PAYROLL SLIPS FOR REFERENCE MONTH ---
  const currentMonthSlips = useMemo(() => {
    return folhas.filter((f: any) => f.mes_referencia === selectedMonth && !f.deleted)
      .map((f: any) => {
        const staff = colaboradores.find((c: any) => c.id === f.colaborador_id);
        return {
          ...f,
          colaborador: staff
        };
      });
  }, [folhas, selectedMonth, colaboradores]);


  // --- CALCULATORS FOR THE PORTAL ---
  const stats = useMemo(() => {
    const activeStaff = colaboradores.filter((c: any) => c.status === 'ativo' && !c.deleted);
    const slipSum = currentMonthSlips.reduce((acc, f) => acc + (f.deleted ? 0 : f.valor_liquido), 0);
    const pendingSum = currentMonthSlips.filter(f => f.status === 'rascunho').reduce((acc, f) => acc + f.valor_liquido, 0);
    const paidSum = currentMonthSlips.filter(f => f.status === 'pago').reduce((acc, f) => acc + f.valor_liquido, 0);
    
    const countClerigos = activeStaff.filter(c => c.tipo === 'pastor').length;
    const countClt = activeStaff.filter(c => c.tipo === 'funcionario').length;
    const countPrestador = activeStaff.filter(c => c.tipo === 'prestador').length;
    const countOutros = activeStaff.filter(c => c.tipo === 'colaborador').length;

    return {
      activeStaffCount: activeStaff.length,
      totalPayrollCost: slipSum,
      pendingPayrollCost: pendingSum,
      paidPayrollCost: paidSum,
      countClerigos,
      countClt,
      countPrestador,
      countOutros,
      avgSalary: activeStaff.length > 0 ? (activeStaff.reduce((acc, c) => acc + (parseFloat(c.salario_base) || 0), 0) / activeStaff.length) : 0
    };
  }, [colaboradores, currentMonthSlips]);

  // --- RECHARTS CHART DATA ---
  const chartTypeData = useMemo(() => {
    const dataGroup = {
      'CLT / CLT Estagiário': 0,
      'Prebenda Clero': 0,
      'Prestadores (Serviço)': 0,
      'Outros Colaboradores': 0
    };

    colaboradores.filter((c: any) => c.status === 'ativo' && !c.deleted).forEach((c: any) => {
      const sal = parseFloat(c.salario_base) || 0;
      if (c.tipo === 'funcionario') dataGroup['CLT / CLT Estagiário'] += sal;
      else if (c.tipo === 'pastor') dataGroup['Prebenda Clero'] += sal;
      else if (c.tipo === 'prestador') dataGroup['Prestadores (Serviço)'] += sal;
      else dataGroup['Outros Colaboradores'] += sal;
    });

    return Object.entries(dataGroup).map(([key, value]) => ({
      nome: key,
      'Gasto Mensal Estimado': value
    }));
  }, [colaboradores]);

  const chartCongregacaoData = useMemo(() => {
    const dataGroup: { [key: string]: number } = {};
    colaboradores.filter((c: any) => c.status === 'ativo' && !c.deleted).forEach((c: any) => {
      const sal = parseFloat(c.salario_base) || 0;
      const cNome = getCongregacaoNome(c.congregacao_id || 'sede');
      dataGroup[cNome] = (dataGroup[cNome] || 0) + sal;
    });

    return Object.entries(dataGroup).map(([name, value]) => ({
      name,
      value
    }));
  }, [colaboradores, congregacoes]);

  // --- EVOLUÇÃO ANUAL DE GASTOS COM PESSOAL (PREBENDA VS SALÁRIOS) ---
  const chartAnualData = useMemo(() => {
    const currentYear = selectedMonth ? (selectedMonth.split('-')[0] || new Date().getFullYear().toString()) : new Date().getFullYear().toString();
    const meses = [
      { key: '01', nome: 'Jan' },
      { key: '02', nome: 'Fev' },
      { key: '03', nome: 'Mar' },
      { key: '04', nome: 'Abr' },
      { key: '05', nome: 'Mai' },
      { key: '06', nome: 'Jun' },
      { key: '07', nome: 'Jul' },
      { key: '08', nome: 'Ago' },
      { key: '09', nome: 'Set' },
      { key: '10', nome: 'Out' },
      { key: '11', nome: 'Nov' },
      { key: '12', nome: 'Dez' }
    ];

    return meses.map(m => {
      const monthStr = `${currentYear}-${m.key}`;
      const slipsInMonth = (folhas || []).filter((f: any) => f.mes_referencia === monthStr && !f.deleted);
      
      let prebendaVal = 0;
      let salariosVal = 0;

      slipsInMonth.forEach((f: any) => {
        const colab = colaboradores.find((c: any) => c.id === f.colaborador_id);
        const isPrebenda = colab ? colab.tipo === 'pastor' : false;
        const val = parseFloat(f.valor_liquido) || 0;
        
        if (isPrebenda) {
          prebendaVal += val;
        } else {
          salariosVal += val;
        }
      });

      return {
        mes: m.nome,
        'Prebendas Clero': prebendaVal,
        'Salários e Encargos': salariosVal,
        'Total Consolidated': prebendaVal + salariosVal
      };
    });
  }, [folhas, colaboradores, selectedMonth]);

  // Handle open editor to create colaborador
  const openCreateColaborador = () => {
    setColabForm({
      nome: '',
      cpf: '',
      rg: '',
      tipo: 'funcionario',
      cargo: '',
      admissao: new Date().toISOString().split('T')[0],
      demissao: '',
      salario_base: 0,
      banco: '',
      agencia: '',
      conta: '',
      tipo_conta: 'corrente',
      pix: '',
      inss: true,
      irpf: false,
      status: 'ativo',
      congregacao_id: 'sede',
      telefone: '',
      email: '',
      observacao: '',
      igreja_origem: '',
      pastor_presidente: '',
      carta_recomendacao: 'Sim',
      funcoes_anteriores: '',
      ministerios_ativos: '',
      perfil_acesso: 'visualizador_comum',
      documentos: [],
      beneficio_auxilio_moradia: 0,
      beneficio_vale_transporte: 0,
      beneficio_vale_refeicao: 0,
      beneficio_ajuda_custo: 0,
      beneficio_plano_saude: 0,
      ferias_lista: [],
      historico_salarial: []
    });
    setEditingColab(null);
    setModalSubTab('contrato');
    setShowColabModal(true);
  };

  // Handle edit colaborador
  const openEditColaborador = (colab: any) => {
    setColabForm({
      nome: colab.nome || '',
      cpf: colab.cpf || '',
      rg: colab.rg || '',
      tipo: colab.tipo || 'funcionario',
      cargo: colab.cargo || '',
      admissao: colab.admissao || '',
      demissao: colab.demissao || '',
      salario_base: colab.salario_base || 0,
      banco: colab.banco || '',
      agencia: colab.agencia || '',
      conta: colab.conta || '',
      tipo_conta: colab.tipo_conta || 'corrente',
      pix: colab.pix || '',
      inss: colab.inss ?? true,
      irpf: colab.irpf ?? false,
      status: colab.status || 'ativo',
      congregacao_id: colab.congregacao_id || 'sede',
      telefone: colab.telefone || '',
      email: colab.email || '',
      observacao: colab.observacao || '',
      igreja_origem: colab.igreja_origem || '',
      pastor_presidente: colab.pastor_presidente || '',
      carta_recomendacao: colab.carta_recomendacao || 'Sim',
      funcoes_anteriores: colab.funcoes_anteriores || '',
      ministerios_ativos: colab.ministerios_ativos || '',
      perfil_acesso: colab.perfil_acesso || 'visualizador_comum',
      documentos: colab.documentos || [],
      beneficio_auxilio_moradia: colab.beneficio_auxilio_moradia || 0,
      beneficio_vale_transporte: colab.beneficio_vale_transporte || 0,
      beneficio_vale_refeicao: colab.beneficio_vale_refeicao || 0,
      beneficio_ajuda_custo: colab.beneficio_ajuda_custo || 0,
      beneficio_plano_saude: colab.beneficio_plano_saude || 0,
      ferias_lista: colab.ferias_lista || [],
      historico_salarial: colab.historico_salarial || []
    });
    setEditingColab(colab);
    setModalSubTab('contrato');
    setShowColabModal(true);
  };

  // Inner list editor elements state
  const [newAddDesc, setNewAddDesc] = useState('');
  const [newAddValue, setNewAddValue] = useState('');
  const [tempDocName, setTempDocName] = useState('');
  const [tempDocType, setTempDocType] = useState('Contrato');
  const [modalSubTab, setModalSubTab] = useState<'contrato' | 'banco' | 'igreja' | 'documentos' | 'beneficios' | 'ferias' | 'historico_salarial'>('contrato');
  const [tempVacationStart, setTempVacationStart] = useState('');
  const [tempVacationEnd, setTempVacationEnd] = useState('');
  const [tempVacationType, setTempVacationType] = useState('Férias CLT');

  // Print system helper for general tables
  const handlePrintReports = (reportType: string) => {
    const activeStaffs = colaboradores.filter((c: any) => c.status === 'ativo' && !c.deleted);
    setPrintData({
      reportType,
      colaboradores: activeStaffs,
      folhas: currentMonthSlips,
      selectedMonth,
      igreja: db.igreja,
      congregacoes
    });
    setPrintMode('dp_funcionarios_lista');
    setPreviewOpen(true);
  };

  // Print system helper for Analytical Payroll Report
  const handlePrintAnalitico = () => {
    setPrintData({
      reportType: 'folha_analitica',
      folhas: filteredFolhasForReport,
      reportParams: {
        tipo: folhaReportType,
        ano: folhaReportYear,
        mes: folhaReportMonth,
        trimestre: folhaReportQuarter,
        inicio: folhaReportStartMonth,
        fim: folhaReportEndMonth
      },
      igreja: db.igreja,
      congregacoes
    });
    setPrintMode('dp_funcionarios_lista');
    setPreviewOpen(true);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-entrance">
      {/* HEADER CONTROLE CORPORATIVO */}
      <div className="flex justify-between items-center bg-white/45 backdrop-blur-md p-6 rounded-2.5xl border border-white/60 shadow-sm flex-wrap gap-4">
        <div>
          <span className="text-[10px] bg-indigo-100/70 border border-indigo-200 text-indigo-700 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            Módulo Corporativo
          </span>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mt-2">
            <Building2 className="text-indigo-600" size={24} /> Departamento Pessoal & Contabilidade
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Controle de funcionários, prestadores, clero, folha de pagamento e emissão de contra-cheques profissionais.
          </p>
        </div>
        
        {/* TAB CONTROLS NAVIGATION */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner overflow-x-auto whitespace-nowrap hide-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0 ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-600'}`}
          >
            <TrendingUp size={14} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('colaboradores')} 
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0 ${activeTab === 'colaboradores' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-600'}`}
          >
            <Users size={14} /> Colaboradores ({colaboradores.filter((c: any) => !c.deleted).length})
          </button>
          <button 
            onClick={() => setActiveTab('ponto')} 
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0 ${activeTab === 'ponto' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-600'}`}
          >
            <Clock size={14} /> Controle de Ponto
          </button>
          <button 
            onClick={() => setActiveTab('ferias')} 
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0 ${activeTab === 'ferias' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-600'}`}
          >
            <Plane size={14} /> Férias & Licenças
          </button>
          <button 
            onClick={() => setActiveTab('folha')} 
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0 ${activeTab === 'folha' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-600'}`}
          >
            <CreditCard size={14} /> Folha Pagamento
          </button>
          <button 
            onClick={() => setActiveTab('esocial')} 
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0 ${activeTab === 'esocial' ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-200' : 'text-slate-600 hover:text-emerald-600'}`}
          >
            <Shield size={14} /> eSocial / Obrigações
          </button>
          <button 
            onClick={() => setActiveTab('rh')} 
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0 ${activeTab === 'rh' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-600'}`}
          >
            <UserPlus size={14} /> Recursos Humanos
          </button>
          <button 
            onClick={() => setActiveTab('relatorios')} 
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0 ${activeTab === 'relatorios' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-600'}`}
          >
            <FileText size={14} /> Contabilidade & Relatórios
          </button>
          <button 
            onClick={() => setActiveTab('juridico')} 
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0 ${activeTab === 'juridico' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-600'}`}
          >
            <Scale size={14} /> Módulo Jurídico
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TABS */}
      
      {/* 1. DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-entrance">
          
          {/* STATS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Membro CLT / Funcionários</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.countClt} <span className="text-xs text-slate-400 font-normal">Ativos</span></h3>
                <p className="text-[10px] text-emerald-600 font-bold mt-1.5">Ficha e base integrada</p>
              </div>
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                <Users size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Líderes Religiosos (Pastores)</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.countClerigos} <span className="text-xs text-slate-400 font-normal">Clérigos</span></h3>
                <p className="text-[10px] text-indigo-600 font-bold mt-1.5">Sustento (Prebenda)</p>
              </div>
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Building2 size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Folha de Pagamento Líquida</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{formatBRL(stats.totalPayrollCost)}</h3>
                <p className="text-[10px] text-slate-500 font-medium mt-1.5">Total para: {selectedMonth}</p>
              </div>
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Custos Removidos / Inativos</p>
                <h3 className="text-xl font-black text-slate-800 mt-1">{colaboradores.filter((c: any) => c.status === 'inativo' || c.deleted).length}</h3>
                <p className="text-[10px] text-rose-500 font-bold mt-1.5">Afastados/Desligados</p>
              </div>
              <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl">
                <ShieldAlert size={22} />
              </div>
            </div>

          </div>

          {/* HR METRICS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-5 rounded-2xl shadow-xs text-white">
              <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Taxa de Turnover (Anual)</p>
              <h3 className="text-2xl font-black mt-1">4.2%</h3>
              <p className="text-[10px] text-indigo-100 mt-1.5 flex items-center gap-1"><ArrowDownRight size={12} /> -1.2% em relação ao ano anterior</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Custo Médio de Admissão</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">R$ 1.250<span className="text-xs text-slate-400 font-normal">,00</span></h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1.5">Acumulado do exercício</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Índice de Engajamento</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">82%</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1.5">Pesquisa de clima (H1 2026)</p>
            </div>
          </div>

          {/* SECONDARY GRAPHICS AND ACCORDIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 bg-white p-6 rounded-2.5xl border border-slate-200/85 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp size={16} className="text-indigo-600"/> Gastos Mensais por Tipo de Colaborador (Base Salarial)
              </h4>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartTypeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="nome" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `R$${val}`} tickLine={false}/>
                    <RechartsTooltip formatter={(val: any) => formatBRL(val)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="Gasto Mensal Estimado" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-2.5xl border border-slate-200/85 shadow-sm flex flex-col justify-between">
              <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 size={16} className="text-indigo-600"/> Divisão por Congregação
              </h4>
              <div className="h-44 flex items-center justify-center relative mt-4">
                {colaboradores.filter((c: any) => c.status === 'ativo' && !c.deleted).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartCongregacaoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartCongregacaoData.map((entry, index) => {
                          const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
                          return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                        })}
                      </Pie>
                      <RechartsTooltip formatter={(val: any) => formatBRL(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-xs text-slate-400 italic">Nenhum dado cadastrado</span>
                )}
                <div className="absolute flex flex-col items-center">
                  <span className="text-xs font-bold text-slate-400">Total Base</span>
                  <span className="text-sm font-black text-slate-700">R$ {colaboradores.filter((c: any) => c.status === 'ativo' && !c.deleted).reduce((acc: number, cur: any) => acc + (parseFloat(cur.salario_base) || 0), 0).toFixed(0)}</span>
                </div>
              </div>

              {/* LIST LEGEND */}
              <div className="border-t border-slate-100 pt-3 space-y-2 mt-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Balanço do Referencial</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span> Total Pago:</span>
                  <strong className="text-emerald-600">{formatBRL(stats.paidPayrollCost)}</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span> Pendentes/Rascunho:</span>
                  <strong className="text-amber-600">{formatBRL(stats.pendingPayrollCost)}</strong>
                </div>
              </div>
            </div>

          </div>

          {/* HISTÓRICO ANUAL E COMPARATIVO DE EXTRATOS DE DP */}
          <div className="bg-white p-6 rounded-2.5xl border border-slate-200/85 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                  <TrendingUp size={16} className="text-indigo-600"/> Histórico Mensal de DP (Prebendas vs. Salários CLT/Serviços)
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Evolução dos gastos de folha de pagamento consolidados acumulados do clero e administrativos</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100/50 text-indigo-700 text-[10px] font-black rounded-lg">
                EXERCÍCIO {selectedMonth ? selectedMonth.split('-')[0] : new Date().getFullYear()}
              </span>
            </div>
            
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartAnualData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `R$ ${val}`} tickLine={false}/>
                  <RechartsTooltip formatter={(val: any) => formatBRL(val)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="Prebendas Clero" stroke="#6366f1" strokeWidth={3.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Salários e Encargos" stroke="#10b981" strokeWidth={3.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Total Consolidated" name="Total Geral da Folha" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-2.5xl border border-indigo-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-indigo-900">Integração Eclesiástica Contábil Direta!</h4>
                <p className="text-xs text-indigo-700/85 mt-1">
                  Seus membros cadastrados na congregação podem ser convertidos em funcionários ou líderes de forma automatizada com 1 clique. Além disso, as prebendas ministeriais são classificadas como obrigações religiosas dedutíveis em conformidade legal.
                </p>
              </div>
            </div>
            <button 
              onClick={() => { setShowImportModal(true); }} 
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-transform active:scale-95"
            >
              <UserPlus size={15} /> Importar Membro Geral
            </button>
          </div>
        </div>
      )}

      {/* 2. COLABORADORES DIRECTORY TAB */}
      {activeTab === 'colaboradores' && (
        <div className="space-y-4 animate-entrance">
          
          {/* SEARCH & ADD ACTIONS */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            
            <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/50">
              <Search className="text-slate-400 shrink-0" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome, CPF ou cargo administrativo..." 
                value={colabSearch}
                onChange={(e) => setColabSearch(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-transparent outline-hidden focus:ring-0" 
              />
              {colabSearch && (
                <button onClick={() => setColabSearch('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select 
                value={colabTypeFilter}
                onChange={(e: any) => setColabTypeFilter(e.target.value)}
                className="bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 cursor-pointer outline-hidden"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="funcionario">Membros CLT</option>
                <option value="colaborador">Pró-Labore / Voluntários</option>
                <option value="prestador">Prestador de Serviços</option>
                <option value="pastor">Clero / Pastor Pres.</option>
              </select>

              <select 
                value={colabStatusFilter}
                onChange={(e: any) => setColabStatusFilter(e.target.value)}
                className="bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 cursor-pointer outline-hidden focus:border-indigo-500"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
                <option value="lixeira">♻️ Lixeira (Excluídos)</option>
              </select>

              <button 
                onClick={openCreateColaborador}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors"
              >
                <Plus size={14} /> Novo Cadastro
              </button>
            </div>

          </div>

          {/* GRID OF COLLABORATORS */}
          {filteredColaboradores.length === 0 ? (
            <div className="bg-white/55 text-center p-12 rounded-2.5xl border border-dashed border-slate-300 space-y-4">
              <div>
                <Users size={36} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-bold">Nenhum colaborador encontrado com os filtros selecionados.</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
                <button 
                  onClick={openCreateColaborador} 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black cursor-pointer shadow-xs transition-colors"
                >
                  ➕ Cadastrar o Primeiro Colaborador
                </button>
                <button 
                  onClick={handleGenerateDemoColaboradores} 
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-black cursor-pointer transition-colors"
                >
                  ✨ Criar Colaboradores de Exemplo
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredColaboradores.map((c: any) => {
                const isDeletedSec = colabStatusFilter === 'lixeira' || c.deleted;
                const typeStyle = 
                  isDeletedSec ? { color: 'text-slate-500 bg-slate-100 border-slate-200', label: '♻️ Lixeira (Excluído)' } :
                  c.tipo === 'pastor' ? { color: 'text-rose-600 bg-rose-50 border-rose-100', label: 'Pastoral / Prebenda' } :
                  c.tipo === 'funcionario' ? { color: 'text-blue-600 bg-blue-50 border-blue-100', label: 'Funcionario CLT' } :
                  c.tipo === 'prestador' ? { color: 'text-amber-700 bg-amber-50 border-amber-100', label: 'Prestador de Serviço' } :
                  { color: 'text-slate-600 bg-slate-50 border-slate-100', label: 'Colaborador Orgânico' };

                const todayStr = new Date().toISOString().split('T')[0];
                const activeVacation = (c.ferias_lista || []).find((v: any) => todayStr >= v.inicio && todayStr <= v.fim);

                return (
                  <div key={c.id} className={`bg-white p-5 rounded-2xl border shadow-xs flex flex-col justify-between hover:border-slate-350 transition-colors group ${isDeletedSec ? 'border-dashed border-slate-300 opacity-90' : 'border-slate-200/80'}`}>
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`inline-block text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${typeStyle.color}`}>
                            {typeStyle.label}
                          </span>
                          <h4 className="text-sm font-black text-slate-800 mt-2 block break-all">
                            {c.nome}
                          </h4>
                          {activeVacation && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[8px] font-black uppercase tracking-wider animate-pulse">
                              🌴 {activeVacation.tipo}
                            </span>
                          )}
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            {safeText(c.cargo, 'Sem Função')} • {getCongregacaoNome(c.congregacao_id)}
                          </p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isDeletedSec ? 'bg-slate-100 text-slate-500' : c.status === 'ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                          {isDeletedSec ? 'Excluído' : c.status}
                        </span>
                      </div>

                      <div className="border-t border-slate-100 mt-4 pt-3 grid grid-cols-2 gap-x-2 gap-y-3.5 text-xs font-semibold">
                        <div>
                          <span className="block text-[9px] text-slate-400 font-bold uppercase">Base Salarial / Subsídio</span>
                          <span className="font-extrabold text-slate-700">{formatBRL(c.salario_base)}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-slate-400 font-bold uppercase">Documento CPF</span>
                          <span className="font-mono text-slate-600">{safeText(c.cpf, 'N/A')}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-slate-400 font-bold uppercase">Admissão</span>
                          <span className="text-slate-600">{c.admissao ? new Date(c.admissao + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-slate-400 font-bold uppercase">Recolhimentos</span>
                          <span className="text-slate-500">
                            {c.inss ? 'INSS Sim ' : ''}{c.irpf ? 'IRRF Sim ' : ''}{!c.inss && !c.irpf ? 'Isento' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Eclesiastical and Corporate Additional Badges */}
                      {(c.igreja_origem || (c.documentos && c.documentos.length > 0)) && (
                        <div className="border-t border-slate-100 mt-3 pt-2.5 flex items-center justify-between text-[10px] text-slate-550 font-bold">
                          <span className="truncate max-w-[170px]" title={c.igreja_origem ? `Origem: ${c.igreja_origem}` : ''}>
                            {c.igreja_origem ? `⛪ ${c.igreja_origem}` : '⛪ Igreja Local'}
                          </span>
                          {c.documentos && c.documentos.length > 0 && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 rounded-full text-indigo-650 shrink-0 select-none">
                              <Paperclip size={10} /> {c.documentos.length} {c.documentos.length === 1 ? 'anexo' : 'anexos'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between items-center bg-slate-50/50 -mx-5 -mb-5 p-4 rounded-b-2xl">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        {c.pix ? `PIX: ${c.pix.slice(0,18)}...` : 'Pix Não cadastrado'}
                      </div>
                      <div className="flex gap-1.5 opacity-100 sm:opacity-80 group-hover:opacity-100 transition-opacity">
                        {isDeletedSec ? (
                          <>
                            <button 
                              onClick={() => handleRestoreColaborador(c.id, c.nome)}
                              className="p-1 px-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <RefreshCw size={11} /> Restaurar
                            </button>
                            <button 
                              onClick={() => handlePermanentDeleteColaborador(c.id, c.nome)}
                              className="p-1 px-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-150 rounded-lg text-xs cursor-pointer transition-colors"
                              title="Excluir Permanentemente"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => openEditColaborador(c)}
                              className="p-1 px-2.5 bg-white text-indigo-500 hover:bg-indigo-50 border border-slate-200 rounded-lg text-[10px] font-black flex items-center gap-0.5 cursor-pointer"
                            >
                              <Edit size={12} /> Editar
                            </button>
                            <button 
                              onClick={() => handleDeleteColaborador(c.id, c.nome)}
                              className="p-1 px-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 rounded-lg text-xs cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 3. FOLHA DE PAGAMENTO TAB */}
      {activeTab === 'folha' && (
        <div className="space-y-4 animate-entrance">
          
          {/* REFERENCE MONTH & ACTION CONTROLS */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-5 bg-white rounded-2.5xl border border-slate-200/80 shadow-xs gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <Calendar className="text-indigo-600 stroke-[2.5]" size={20} />
              <div>
                <label className="block text-[9px] text-slate-400 font-black uppercase tracking-wider">Mês de Referência Contábil</label>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent border-0 text-md font-black text-slate-755 p-0 pr-6 outline-hidden cursor-pointer focus:ring-0 select-clean"
                >
                  {availableMonths.map((m) => {
                    const parts = m.split('-');
                    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 15);
                    const label = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
                    return <option key={m} value={m}>{label}</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={handleGeneratePayroll}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/15 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
              >
                <Sparkles size={14} /> Gerar Folha do Mês
              </button>

              {currentMonthSlips.length > 0 && (
                <>
                  <button 
                    onClick={handlePrintBatch}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                    title="Imprimir todos os contracheques do mês selecionado em lote"
                  >
                    <Printer size={14} /> Imprimir Lote
                  </button>
                  <button 
                    onClick={handleDownloadBatchPDF}
                    className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-205 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                    title="Fazer download de um único PDF contendo todos os contracheques deste mês"
                  >
                    <Download size={14} /> Download Lote (PDF)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* LIST OF GENERATED PAY SLIPS */}
          {currentMonthSlips.length === 0 ? (
            <div className="space-y-6">
              <div className="bg-white text-center p-10 rounded-2.5xl border border-shadow-sm border-slate-200/90 shadow-sm space-y-4">
                <div className="mx-auto w-12 h-12 bg-indigo-50 border border-indigo-100 flex items-center justify-center rounded-2xl text-indigo-600">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Nenhum contracheque foi gerado para {selectedMonth}</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    A folha de pagamento deste mês ainda não existe. Você pode gerá-la de forma consolidada para todos os colaboradores ativos abaixo.
                  </p>
                </div>

                {colaboradores.filter((c: any) => c.status === 'ativo' && !c.deleted).length > 0 ? (
                  <div className="space-y-3 max-w-xl mx-auto pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-600 text-left">
                      📋 Colaboradores Ativos Elegíveis para Geração ({colaboradores.filter((c: any) => c.status === 'ativo' && !c.deleted).length}):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                      {colaboradores.filter((c: any) => c.status === 'ativo' && !c.deleted).map((c: any) => (
                        <div key={c.id} className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-extrabold text-slate-700 truncate">{c.nome}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{c.cargo || 'Cargo não cadastrado'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={handleGeneratePayroll} 
                      className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs cursor-pointer shadow-md inline-block transition-transform active:scale-95"
                    >
                      🚀 Gerar Folha de Pagamento do Mês
                    </button>
                  </div>
                ) : (
                  <div className="p-5 bg-amber-50/50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-3 max-w-md mx-auto">
                    <p className="font-extrabold flex items-center justify-center gap-1.5 text-amber-800">
                      <AlertCircle size={15} /> Nenhum colaborador ATIVO encontrado!
                    </p>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Para gerar a folha de pagamento, você precisa ter colaboradores cadastrados e ativos no sistema (p. ex., Pastor, Secretária, etc.).
                    </p>
                    <div className="pt-2 flex flex-col gap-2.5">
                      <button 
                        onClick={handleGenerateDemoColaboradores} 
                        className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[11px] cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1"
                      >
                        ✨ Instanciar 3 Colaboradores de Demonstração
                      </button>
                      <button 
                        onClick={() => setActiveTab('colaboradores')} 
                        className="w-full px-4 py-2 bg-white border border-amber-250 text-amber-800 hover:bg-amber-50 font-black rounded-xl text-[11px] cursor-pointer"
                      >
                        Ir para Cadastro de Colaboradores
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">Contracheques Gerados ({currentMonthSlips.length})</span>
              
              {currentMonthSlips.map((f: any) => {
                const isExpanded = expandedSlipId === f.id;
                const totProventos = (f.proventos || []).reduce((acc: number, item: any) => acc + item.valor, 0);
                const totDescontos = (f.descontos || []).reduce((acc: number, item: any) => acc + item.valor, 0);

                return (
                  <div key={f.id} className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden hover:border-slate-300 transition-colors">
                    
                    {/* ACCORDION BAR ROW */}
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setExpandedSlipId(isExpanded ? null : f.id)} 
                          className="p-1 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
                        >
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-black text-slate-755">{safeText(f.colaborador?.nome, 'Colaborador não encontrado')}</h5>
                            {f.colaborador?.tipo === 'pastor' && (
                              <span className="text-[8px] bg-rose-50 text-rose-500 border border-rose-100 font-black tracking-widest uppercase px-1.5 py-0.5 rounded">Clero</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                            {safeText(f.colaborador?.cargo, 'Cargo')} • {getCongregacaoNome(f.colaborador?.congregacao_id)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs">
                        <div>
                          <span className="block text-[8px] text-slate-400 font-bold uppercase">Proventos (+)</span>
                          <span className="font-extrabold text-emerald-600">{formatBRL(totProventos)}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 font-bold uppercase">Descontos (-)</span>
                          <span className="font-extrabold text-rose-500">{formatBRL(totDescontos)}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-slate-400 font-bold uppercase">Líquido Recebido</span>
                          <span className="font-black text-slate-850 bg-slate-50 px-2 py-0.5 rounded shadow-inner inline-block">{formatBRL(f.valor_liquido)}</span>
                        </div>
                        <div className="flex flex-col justify-center items-start">
                          <button 
                            onClick={() => toggleSlipStatus(f)}
                            className={`px-2.5 py-1 text-[9px] font-black uppercase rounded cursor-pointer transition-all hover:scale-105 active:scale-95 ${f.status === 'pago' ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-red-50 border border-red-100 text-red-600'}`}
                            title="Clique para confirmar pagamento e enviar ao financeiro"
                          >
                            ● {f.status === 'pago' ? 'PAGO' : 'RASCUNHO'}
                          </button>
                          {f.status === 'pago' && (
                            <span className="text-[8px] text-emerald-600 font-extrabold flex items-center gap-0.5 mt-1 animate-pulse">
                              <Check size={9} className="stroke-[3.5]" /> Integrado Fin.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end md:self-auto">
                        <button 
                          onClick={() => handleDownloadPDF(f, f.colaborador)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Fazer download do PDF profissional"
                        >
                          <Download size={13} /> Baixar PDF
                        </button>
                        <button 
                          onClick={() => handlePrintSlip(f, f.colaborador)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-xl text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Printer size={13} className="text-slate-500" /> Contra-Cheque
                        </button>
                        <button 
                          onClick={() => handleDeleteSlip(f.id)}
                          className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                    </div>

                    {/* EXPANDED ENTRY EDITOR TABLE */}
                    {isExpanded && (
                      <div className="border-t border-slate-150 p-5 bg-slate-50/70 space-y-4 animate-entrance">
                        <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                          <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1">
                            <Edit size={12} /> Detalhamento de Lançamentos Contábeis
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">Ref: {selectedMonth}</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          
                          {/* 1. PROVENTOS SECTION */}
                          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Proventos (Vantagens/Ganhos)</span>
                            
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="text-[9px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                  <th className="py-2">Descrição Lançamento</th>
                                  <th className="py-2 text-right">Valor</th>
                                  <th className="py-2 text-center w-12">Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(f.proventos || []).length === 0 ? (
                                  <tr>
                                    <td colSpan={3} className="py-4 text-center text-[11px] text-slate-400 italic">Nenhum provento cadastrado</td>
                                  </tr>
                                ) : (
                                  (f.proventos || []).map((p: any, idx: number) => (
                                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                                      <td className="py-2 text-slate-700 font-extrabold">{p.descricao}</td>
                                      <td className="py-2 text-right font-semibold text-slate-700">{formatBRL(p.valor)}</td>
                                      <td className="py-2 text-center">
                                        <button 
                                          onClick={() => handleRemoveSlipItem(f.id, 'provento', idx)}
                                          className="p-1 hover:bg-rose-50 text-rose-500 rounded-md cursor-pointer"
                                        >
                                          <X size={12} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* 2. DESCONTOS SECTION */}
                          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block">Descontos (Retenções/Deduções)</span>
                            
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="text-[9px] text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                  <th className="py-2">Descrição Lançamento</th>
                                  <th className="py-2 text-right">Valor</th>
                                  <th className="py-2 text-center w-12">Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(f.descontos || []).length === 0 ? (
                                  <tr>
                                    <td colSpan={3} className="py-4 text-center text-[11px] text-slate-400 italic">Nenhum desconto cadastrado</td>
                                  </tr>
                                ) : (
                                  (f.descontos || []).map((d: any, idx: number) => (
                                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                                      <td className="py-2 text-slate-650 font-extrabold">{d.descricao}</td>
                                      <td className="py-2 text-right font-semibold text-rose-500">{formatBRL(d.valor)}</td>
                                      <td className="py-2 text-center">
                                        <button 
                                          onClick={() => handleRemoveSlipItem(f.id, 'desconto', idx)}
                                          className="p-1 hover:bg-rose-50 text-rose-500 rounded-md cursor-pointer"
                                        >
                                          <X size={12} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>

                        </div>

                        {/* ADD QUICK LAUNCH FORM */}
                        <div className="bg-white/80 p-4 rounded-xl border border-slate-250/60 shadow-xs flex flex-col md:flex-row items-end gap-3.5">
                          <div className="flex-1 space-y-1.5 w-full">
                            <label className="block text-[9px] text-slate-400 font-bold uppercase">Novo Lançamento Rápido</label>
                            <input 
                              type="text" 
                              placeholder="Ex: Gratificação, Horas Extras, Adiantamento, Faltas..." 
                              value={newAddDesc}
                              onChange={(e) => setNewAddDesc(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-hidden"
                            />
                          </div>
                          
                          <div className="w-full md:w-36 space-y-1.5">
                            <label className="block text-[9px] text-slate-400 font-bold uppercase">Valor (R$)</label>
                            <input 
                              type="number" 
                              step="0.01" 
                              placeholder="150,00" 
                              value={newAddValue}
                              onChange={(e) => setNewAddValue(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-hidden"
                            />
                          </div>

                          <div className="flex gap-2 w-full md:w-auto">
                            <button 
                              onClick={() => {
                                handleAddSlipItem(f.id, 'provento', newAddDesc, parseFloat(newAddValue) || 0);
                                setNewAddDesc('');
                                setNewAddValue('');
                              }}
                              className="flex-1 md:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black whitespace-nowrap cursor-pointer transition-colors"
                            >
                              + Provento (Soma)
                            </button>
                            <button 
                              onClick={() => {
                                handleAddSlipItem(f.id, 'desconto', newAddDesc, parseFloat(newAddValue) || 0);
                                setNewAddDesc('');
                                setNewAddValue('');
                              }}
                              className="flex-1 md:flex-initial px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black whitespace-nowrap cursor-pointer transition-colors"
                            >
                              + Desconto (Subtrai)
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 4. REPORTS TAB */}
      {activeTab === 'relatorios' && (
        <div className="space-y-6 animate-entrance">
          <div className="bg-white p-6 rounded-2.5xl border border-slate-200/80 shadow-xs">
            
            {/* Contabilidade inner tabs */}
            <div className="flex border-b border-slate-200 mb-6 space-x-6 overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setContabActiveTab('relatorios')}
                className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${contabActiveTab === 'relatorios' ? 'border-indigo-600 text-indigo-705' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Relatórios do DP
              </button>
              <button 
                onClick={() => setContabActiveTab('conciliacao')}
                className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${contabActiveTab === 'conciliacao' ? 'border-indigo-600 text-indigo-750' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Conciliação Bancária
              </button>
              <button 
                onClick={() => setContabActiveTab('postings')}
                className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${contabActiveTab === 'postings' ? 'border-indigo-600 text-indigo-750' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Lançamentos & Obrigações Fiscais
              </button>
              <button 
                onClick={() => setContabActiveTab('contas')}
                className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${contabActiveTab === 'contas' ? 'border-indigo-600 text-indigo-750' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Plano de Contas Eclesiástico
              </button>
            </div>

            {contabActiveTab === 'relatorios' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-1 border-b border-slate-100 pb-2">
                      <Printer size={18} className="text-indigo-600" /> Emissão de Relatórios Oficiais do Departamento Pessoal
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Consolide os gastos de funcionários e liderança religiosa para fins de conciliação bancária, fechamentos de contabilidade ou emissão de balanços.
                    </p>
                  </div>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:border-slate-350 transition-colors">
                <div>
                  <span className="p-2.5 bg-blue-100 text-blue-600 rounded-xl inline-block mb-3.5 shadow-sm">
                    <Users size={20} />
                  </span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">RELAÇÃO GERAL DE COLABORADORES</h4>
                  <p className="text-[11px] text-slate-500 mt-2">
                     Lista completa de funcionários ativos, prestadores, clérigos, contendo cargo, CPF, data de admissão e base salarial associada.
                  </p>
                </div>
                <button 
                  onClick={() => handlePrintReports('colaboradores_lista')}
                  className="mt-6 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-250 font-bold rounded-xl text-xs text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors w-full"
                >
                  <Printer size={14} className="text-slate-500" /> Imprimir Quadro Geral
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:border-slate-350 transition-colors">
                <div>
                  <span className="p-2.5 bg-rose-100 text-rose-600 rounded-xl inline-block mb-3.5 shadow-sm">
                    <Building2 size={20} />
                  </span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">QUADRO CLERO (PREBENDAS DO MÊS)</h4>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Focalizado no sustentáculo pastoral e eclesiástico. Útil para declarações de isenções e controle de prebendas do conselho de administração.
                  </p>
                </div>
                <button 
                  onClick={() => handlePrintReports('prebendas_clero')}
                  className="mt-6 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-250 font-bold rounded-xl text-xs text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors w-full"
                >
                  <Printer size={14} className="text-slate-500" /> Imprimir Relatório Clero
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:border-slate-350 transition-colors">
                <div>
                  <span className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl inline-block mb-3.5 shadow-sm">
                    <Building2 size={20} />
                  </span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">DEMONSTRATIVO POR FILIAL CONGREGADO</h4>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Consolidação agregada de gastos de pessoal organizados por Congregação / Sub-divisões, ideal para tesourarias setoriais.
                  </p>
                </div>
                <button 
                  onClick={() => handlePrintReports('consolidado_congregacao')}
                  className="mt-6 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-250 font-bold rounded-xl text-xs text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors w-full"
                >
                  <Printer size={14} className="text-slate-500" /> Imprimir Dividido por Filial
                </button>
              </div>

              {/* CARTÃO 4: RELATÓRIO DE FOLHA ANALÍTICA DE FECHAMENTO */}
              <div className="bg-indigo-50/20 border border-indigo-150 p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:border-indigo-300/80 transition-colors">
                <div>
                  <span className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl inline-block mb-3.5 shadow-sm">
                    <FileText size={20} />
                  </span>
                  <h4 className="text-xs font-black text-indigo-850 uppercase tracking-wider">RELATÓRIO DE FOLHA ANALÍTICA</h4>
                  <p className="text-[11px] text-slate-500 mt-1 pb-3 border-b border-indigo-100/40">
                    Consolide em lote dízimos, deduções de INSS, IRRF e valores líquidos integrados para fechamentos mensais, trimestrais ou anuais.
                  </p>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3.5">
                    {/* Period selection inputs */}
                    <div className="md:col-span-12 space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Filtro Temporal de Fechamento</label>
                      <div className="grid grid-cols-4 gap-1 bg-slate-105 p-1 rounded-xl border border-slate-200">
                        {(['mensal', 'trimestral', 'anual', 'periodo'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setFolhaReportType(t);
                              setShowInAppFolhaPreview(true);
                            }}
                            className={`px-1.5 py-1 text-center text-[9px] font-bold rounded-lg transition-all capitalize select-none cursor-pointer ${
                              folhaReportType === t 
                                ? 'bg-indigo-600 text-white shadow-xs' 
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {t === 'periodo' ? 'Lote Livre' : t === 'mensal' ? 'Mensal' : t === 'trimestral' ? 'Trimestral' : 'Anual'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Param Details */}
                    <div className="md:col-span-12 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-2 gap-2 text-left">
                        {folhaReportType === 'mensal' && (
                          <>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase text-slate-500">Mês</label>
                              <select 
                                value={folhaReportMonth}
                                onChange={(e) => {
                                  setFolhaReportMonth(e.target.value);
                                  setShowInAppFolhaPreview(true);
                                }}
                                className="w-full text-[11px] bg-white border border-slate-250 p-1 font-bold rounded text-slate-700 shadow-xs"
                              >
                                {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                                  <option key={m} value={m}>{new Date(2026, parseInt(m)-1, 1).toLocaleDateString('pt-BR', {month: 'long'}).toUpperCase()}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase text-slate-500">Ano</label>
                              <input 
                                type="number" 
                                value={folhaReportYear}
                                onChange={(e) => {
                                  setFolhaReportYear(e.target.value);
                                  setShowInAppFolhaPreview(true);
                                }}
                                className="w-full text-[11px] bg-white border border-slate-250 p-1 font-bold rounded text-slate-700 shadow-xs text-center"
                                min="2020"
                                max="2035"
                              />
                            </div>
                          </>
                        )}

                        {folhaReportType === 'trimestral' && (
                          <>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase text-slate-500">Trimestre</label>
                              <select 
                                value={folhaReportQuarter}
                                onChange={(e) => {
                                  setFolhaReportQuarter(e.target.value as any);
                                  setShowInAppFolhaPreview(true);
                                }}
                                className="w-full text-[11px] bg-white border border-slate-250 p-1 font-bold rounded text-slate-700 shadow-xs"
                              >
                                <option value="1">1º Trimestre (Jan-Mar)</option>
                                <option value="2">2º Trimestre (Abr-Jun)</option>
                                <option value="3">3º Trimestre (Jul-Set)</option>
                                <option value="4">4º Trimestre (Out-Dez)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase text-slate-500">Ano</label>
                              <input 
                                type="number" 
                                value={folhaReportYear}
                                onChange={(e) => {
                                  setFolhaReportYear(e.target.value);
                                  setShowInAppFolhaPreview(true);
                                }}
                                className="w-full text-[11px] bg-white border border-slate-250 p-1 font-bold rounded text-slate-700 shadow-xs text-center"
                                min="2020"
                                max="2035"
                              />
                            </div>
                          </>
                        )}

                        {folhaReportType === 'anual' && (
                          <div className="col-span-2 space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-500">Exercício Anual</label>
                            <input 
                              type="number" 
                              value={folhaReportYear}
                              onChange={(e) => {
                                setFolhaReportYear(e.target.value);
                                setShowInAppFolhaPreview(true);
                              }}
                              className="w-full text-[11px] bg-white border border-slate-250 p-1 font-bold rounded text-slate-700 shadow-xs text-center font-bold"
                              min="2020"
                              max="2035"
                            />
                          </div>
                        )}

                        {folhaReportType === 'periodo' && (
                          <>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase text-slate-500">Início Ref.</label>
                              <input 
                                type="month" 
                                value={folhaReportStartMonth}
                                onChange={(e) => {
                                  setFolhaReportStartMonth(e.target.value);
                                  setShowInAppFolhaPreview(true);
                                }}
                                className="w-full text-[11px] bg-white border border-slate-250 p-0.5 px-2 font-bold rounded text-slate-700 shadow-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase text-slate-500">Fim Ref.</label>
                              <input 
                                type="month" 
                                value={folhaReportEndMonth}
                                onChange={(e) => {
                                  setFolhaReportEndMonth(e.target.value);
                                  setShowInAppFolhaPreview(true);
                                }}
                                className="w-full text-[11px] bg-white border border-slate-250 p-0.5 px-2 font-bold rounded text-slate-700 shadow-xs"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-2 font-bold flex items-center gap-1">
                        <CheckCircle size={10} className="text-emerald-500" />
                        <span>Contratos do lote: <strong className="text-indigo-600 font-extrabold">{filteredFolhasForReport.length} folhas registradas</strong>.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-200/65 flex gap-2 justify-end">
                  <button 
                    onClick={() => setShowInAppFolhaPreview(!showInAppFolhaPreview)}
                    className="px-3 py-1.5 border border-indigo-200 hover:bg-indigo-50 font-black rounded-xl text-[11px] text-indigo-750 flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                  >
                    <Eye size={12} /> {showInAppFolhaPreview ? 'Ocultar Visualização' : 'Conferir na Tela'}
                  </button>
                  <button 
                    onClick={handlePrintAnalitico}
                    className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-750 text-white font-black rounded-xl text-[11px] flex items-center gap-1 cursor-pointer shadow-sm shadow-indigo-500/10 transition-all"
                  >
                    <Printer size={12} /> Imprimir Folha Analítica
                  </button>
                </div>
              </div>

            </div>

            {/* LIVE IN-APP PREVIEW OF ANALYTICAL PAYROLL */}
            {showInAppFolhaPreview && (
              <div className="mt-8 border-t border-slate-200/80 pt-6 animate-entrance">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={16} className="text-indigo-500 animate-pulse" /> Quadro Analítico Consolidado (Visualizador Rápido)
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Confira os dízimos, incentivos sacerdotais, repasses previdenciários e salários líquidos antes de enviar à impressora.
                    </p>
                  </div>
                  <button
                    onClick={handlePrintAnalitico}
                    className="px-3 py-1.5 bg-indigo-600/10 border border-indigo-600/25 font-bold rounded-lg text-[10px] text-indigo-700 hover:bg-indigo-600/20 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Printer size={12} /> Imprimir Lote Filtrado ({filteredFolhasForReport.length})
                  </button>
                </div>

                {filteredFolhasForReport.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white scrollbar-thin">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black select-none uppercase text-[8px] tracking-widest">
                          <th className="p-3">Colaborador / Cargo</th>
                          <th className="p-3 text-center">Ref.</th>
                          <th className="p-3 text-right">Salário Base</th>
                          <th className="p-3 text-right">Proventos (Vantagens)</th>
                          <th className="p-3 text-right">INSS Estimado</th>
                          <th className="p-3 text-right">IRRF Retido</th>
                          <th className="p-3 text-right">Outros Descontos</th>
                          <th className="p-3 text-right font-black text-indigo-700 bg-indigo-50/20">Líquido Pago</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFolhasForReport.map((slip: any) => {
                          const base = parseFloat(slip.salario_base || 0) || 0;
                          const totProventos = (slip.proventos || []).reduce((acc: number, p: any) => acc + (parseFloat(p.valor) || 0), 0);
                          
                          // Find INSS and IRRF inside descontos
                          const inss = (slip.descontos || []).find((d: any) => d.descricao?.includes('INSS'));
                          const inssVal = inss ? (parseFloat(inss.valor) || 0) : 0;
                          
                          const irrf = (slip.descontos || []).find((d: any) => d.descricao?.includes('IRRF') || d.descricao?.includes('IRPF'));
                          const irrfVal = irrf ? (parseFloat(irrf.valor) || 0) : 0;
                          
                          const totDescontos = (slip.descontos || []).reduce((acc: number, d: any) => acc + (parseFloat(d.valor) || 0), 0);
                          const outrosDescVal = Math.max(0, totDescontos - inssVal - irrfVal);
                          const liquido = parseFloat(slip.valor_liquido || 0) || 0;

                          return (
                            <tr key={slip.id} className="border-b border-slate-150/80 hover:bg-slate-50 font-medium">
                              <td className="p-3 text-slate-800">
                                <div className="font-extrabold">{slip.colaborador_nome}</div>
                                <div className="text-[9px] text-slate-400 uppercase font-black">{slip.colaborador_tipo === 'pastor' ? 'Prebenda' : 'CLT'} • {slip.colaborador_cargo || 'Vínculo'}</div>
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-slate-650">{slip.mes_referencia}</td>
                              <td className="p-3 text-right font-mono text-slate-600">{formatBRL(base)}</td>
                              <td className="p-3 text-right font-mono text-emerald-700 font-bold">+{formatBRL(totProventos)}</td>
                              <td className="p-3 text-right font-mono text-rose-500 font-bold">-{formatBRL(inssVal)}</td>
                              <td className="p-3 text-right font-mono text-rose-500 font-bold">-{formatBRL(irrfVal)}</td>
                              <td className="p-3 text-right font-mono text-rose-450">-{formatBRL(outrosDescVal)}</td>
                              <td className="p-3 text-right font-mono font-black text-indigo-700 bg-indigo-50/20">{formatBRL(liquido)}</td>
                            </tr>
                          );
                        })}
                        {/* Totals Row */}
                        <tr className="bg-slate-50/85 font-black border-t border-slate-300 text-slate-900 shadow-sm leading-6">
                          <td colSpan={2} className="p-3.5 text-right uppercase tracking-widest text-[8px] text-slate-500 font-black">Totais do Lote:</td>
                          <td className="p-3.5 text-right font-mono">
                            {formatBRL(filteredFolhasForReport.reduce((acc, f: any) => acc + (parseFloat(f.salario_base || 0) || 0), 0))}
                          </td>
                          <td className="p-3.5 text-right font-mono text-emerald-800 font-black">
                            +{formatBRL(filteredFolhasForReport.reduce((acc, f: any) => {
                              const prov = (f.proventos || []).reduce((pAcc: number, p: any) => pAcc + (parseFloat(p.valor) || 0), 0);
                              return acc + prov;
                            }, 0))}
                          </td>
                          <td className="p-3.5 text-right font-mono text-rose-700 font-black">
                            -{formatBRL(filteredFolhasForReport.reduce((acc, f: any) => {
                              const inss = (f.descontos || []).find((d: any) => d.descricao?.includes('INSS'));
                              return acc + (inss ? (parseFloat(inss.valor) || 0) : 0);
                            }, 0))}
                          </td>
                          <td className="p-3.5 text-right font-mono text-rose-700 font-black">
                            -{formatBRL(filteredFolhasForReport.reduce((acc, f: any) => {
                              const irrf = (f.descontos || []).find((d: any) => d.descricao?.includes('IRRF') || d.descricao?.includes('IRPF'));
                              return acc + (irrf ? (parseFloat(irrf.valor) || 0) : 0);
                            }, 0))}
                          </td>
                          <td className="p-3.5 text-right font-mono text-rose-600 font-black">
                            -{formatBRL(filteredFolhasForReport.reduce((acc, f: any) => {
                              const totalD = (f.descontos || []).reduce((dAcc: number, d: any) => dAcc + (parseFloat(d.valor) || 0), 0);
                              const inss = (f.descontos || []).find((d: any) => d.descricao?.includes('INSS'));
                              const inssVal = inss ? (parseFloat(inss.valor) || 0) : 0;
                              const irrf = (f.descontos || []).find((d: any) => d.descricao?.includes('IRRF') || d.descricao?.includes('IRPF'));
                              const irrfVal = irrf ? (parseFloat(irrf.valor) || 0) : 0;
                              return acc + Math.max(0, totalD - inssVal - irrfVal);
                            }, 0))}
                          </td>
                          <td className="p-3.5 text-right font-mono text-xs text-indigo-900 bg-indigo-100/40">
                            {formatBRL(filteredFolhasForReport.reduce((acc, f: any) => acc + (parseFloat(f.valor_liquido || 0) || 0), 0))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white mt-1">
                    <AlertCircle className="mx-auto text-slate-350 mb-2" size={24} />
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nenhum contra-cheque localizado para o lote e intervalo informados.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

            {/* 4b. CONCILIAÇÃO BANCÁRIA SUB-TAB */}
            {contabActiveTab === 'conciliacao' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-black text-sm text-slate-800 flex items-center gap-2">
                        <RefreshCw size={16} className={`text-indigo-600 ${isReconciling ? 'animate-spin' : ''}`} /> Importação e Conciliação de Extratos
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Carregue arquivos de extrato bancário (.OFX, .CSV) para cruzar automaticamente com pagamentos de folha de DP, encargos sociais e lançamentos da igreja.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    {!importedFileName ? (
                      <div 
                        onClick={() => {
                          setIsReconciling(true);
                          setImportedFileName('extrato_mensal_banco_itau_junho2026.ofx');
                          setTimeout(() => {
                            setIsReconciling(false);
                            addToast('Extrato importado! 5 transações reconciliadas automaticamente com o DP e encargos.', 'success');
                            setTransactions(prev => prev.map(t => ({ ...t, status: 'conciliado', conciliadoCom: t.conciliadoCom || 'Localizado automaticamente via cruzamento de dados' })));
                          }, 1500);
                        }}
                        className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer bg-white transition-all hover:bg-slate-50/50"
                      >
                        <Upload size={32} className="mx-auto text-slate-400 mb-2 animate-bounce" />
                        <h5 className="font-bold text-xs text-slate-700">Arraste ou clique para carregar o extrato (.OFX, .CSV)</h5>
                        <p className="text-[10px] text-slate-400 mt-1">Conecta instantaneamente com as contas bancárias cadastradas</p>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            <FileSpreadsheet size={20} />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-slate-800">{importedFileName}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">OFX Importado com Sucesso • 5 Lançamentos</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setIsReconciling(true);
                              setTimeout(() => {
                                setIsReconciling(false);
                                addToast('Regras de amarração de CNPJ aplicadas. Conciliação concluída!', 'success');
                              }, 1000);
                            }}
                            className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider rounded-lg shadow-sm border border-indigo-500 cursor-pointer transition-colors"
                          >
                            Reconciliar Novamente
                          </button>
                          <button 
                            onClick={() => {
                              setImportedFileName(null);
                              setTransactions([
                                { id: 't1', data: '2026-06-05', descricao: 'PAGTO FOLHA SALARIAL COMPLETA', valor: 45000, tipo: 'saida', status: 'pendente', conciliadoCom: 'Folha de Pagamento - Jun/2026' },
                                { id: 't2', data: '2026-06-06', descricao: 'PAGTO ADIANTAMENTO FORNECEDOR ABC', valor: 2350, tipo: 'saida', status: 'conciliado', conciliadoCom: 'Lançamento Contábil #2431' },
                                { id: 't3', data: '2026-06-08', descricao: 'DOC RECEBIDO CONGREGAÇÃO CENTRO', valor: 8500, tipo: 'entrada', status: 'conciliado', conciliadoCom: 'Dízimo Congregacional Centro' },
                                { id: 't4', data: '2026-06-10', descricao: 'TRANSF ENCARGOS FGTS DIGITAL', valor: 3600, tipo: 'saida', status: 'pendente', conciliadoCom: 'FGTS Digital Lote #982' },
                                { id: 't5', data: '2026-06-11', descricao: 'REEMBOLSO TAXA CARTÓRIO CONTRATO', valor: 120, tipo: 'saida', status: 'pendente', conciliadoCom: '' }
                              ]);
                              addToast('Arquivo de extrato removido.', 'info');
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-lg cursor-pointer transition-colors"
                          >
                            Limpar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isReconciling && (
                  <div className="flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <div className="text-center space-y-2">
                      <RefreshCw className="mx-auto text-indigo-500 animate-spin" size={24} />
                      <p className="text-xs font-bold text-slate-600">Cruzando dados bancários com as folhas salariais de DP...</p>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                      <input 
                        type="text"
                        placeholder="Buscar transação..."
                        value={searchTrans}
                        onChange={(e) => setSearchTrans(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 outline-hidden focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Filtrar:</span>
                      <select 
                        value={filterTransStatus}
                        onChange={(e: any) => setFilterTransStatus(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 font-semibold outline-hidden cursor-pointer"
                      >
                        <option value="todos">Todos os Lançamentos</option>
                        <option value="conciliado">Conciliados (Ok)</option>
                        <option value="pendente">Pendentes (Revisão)</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Data</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Descrição do Extrato</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Valor</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Vínculo Contábil ou DP</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions
                          .filter(t => {
                            if (searchTrans && !t.descricao.toLowerCase().includes(searchTrans.toLowerCase())) return false;
                            if (filterTransStatus !== 'todos' && t.status !== filterTransStatus) return false;
                            return true;
                          })
                          .map((t) => (
                            <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-xs text-slate-500 font-medium">
                                {new Date(t.data).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-slate-700">
                                {t.descricao}
                              </td>
                              <td className={`px-4 py-3 text-xs font-black text-right font-mono ${t.tipo === 'entrada' ? 'text-emerald-650' : 'text-slate-800'}`}>
                                {t.tipo === 'entrada' ? '+' : '-'}{formatBRL(t.valor)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${t.status === 'conciliado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-250/60'}`}>
                                  {t.status === 'conciliado' ? 'Conciliado' : 'Pendente'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-600">
                                {t.conciliadoCom ? (
                                  <span className="flex items-center gap-1 text-slate-650">
                                    <CheckCircle size={12} className="text-emerald-500" /> {t.conciliadoCom}
                                  </span>
                                ) : (
                                  <span className="text-slate-450 italic">Vínculo não identificado</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {t.status === 'pendente' ? (
                                  <button 
                                    onClick={() => {
                                      setTransactions(prev => prev.map(item => item.id === t.id ? { ...item, status: 'conciliado', conciliadoCom: 'Conciliado manualmente pelo usuário' } : item));
                                      addToast('Transação reconciliada com sucesso!', 'success');
                                    }}
                                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-black rounded-md cursor-pointer transition-colors"
                                  >
                                    Conciliar
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      setTransactions(prev => prev.map(item => item.id === t.id ? { ...item, status: 'pendente', conciliadoCom: '' } : item));
                                      addToast('Desfeito vínculo contábil da transação.', 'info');
                                    }}
                                    className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-[10px] font-bold rounded-md cursor-pointer transition-colors"
                                  >
                                    Desfazer
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 4c. LANÇAMENTOS AUTOMÁTICOS & FISCAL */}
            {contabActiveTab === 'postings' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Ledger entries mapping */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <div>
                      <h4 className="font-black text-xs text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-1.5">
                        <Database size={15} className="text-indigo-600" /> Razonete / Lançamentos Contábeis Automáticos do DP
                      </h4>
                      <p className="text-xs text-slate-450 mt-1">
                        Lançamentos gerados a partir do processamento da Folha e Benefícios de modo integrado com a contabilidade geral.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      <div className="p-3 border border-slate-150 rounded-lg bg-slate-50/50 flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-black tracking-wider uppercase">Lançamento #L-9811</span>
                          <h5 className="text-xs font-bold text-slate-800 mt-1">Provisão de Folha de Pagamento CLP</h5>
                          <p className="text-[10px] text-slate-400">D: Despesa com Pessoal (Resultado)<br />C: Salários a Pagar (Passivo)</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-700">{formatBRL(45000)}</span>
                          <p className="text-[10px] text-emerald-600 font-bold mt-1">Sincronizado</p>
                        </div>
                      </div>

                      <div className="p-3 border border-slate-150 rounded-lg bg-slate-50/50 flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-black tracking-wider uppercase">Lançamento #L-9812</span>
                          <h5 className="text-xs font-bold text-slate-800 mt-1">Retenção de Encargos - INSS</h5>
                          <p className="text-[10px] text-slate-400">D: Salários a Pagar (Passivo)<br />C: INSS a Recolher (Passivo)</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-700">{formatBRL(3560)}</span>
                          <p className="text-[10px] text-emerald-600 font-bold mt-1">Sincronizado</p>
                        </div>
                      </div>

                      <div className="p-3 border border-slate-150 rounded-lg bg-slate-50/50 flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-black tracking-wider uppercase">RH ↔ DP Integração</span>
                          <h5 className="text-xs font-bold text-slate-800 mt-1">Ajuste de Salário & Promoções</h5>
                          <p className="text-[10px] text-slate-400">D: Provisões para Promoção / Ajustes<br />C: Reservas Especiais (Passivo)</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-700">{formatBRL(1800)}</span>
                          <p className="text-[10px] text-indigo-600 font-bold mt-1">Vinculado (RH)</p>
                        </div>
                      </div>

                      <div className="p-3 border border-slate-150 rounded-lg bg-slate-50/50 flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-black tracking-wider uppercase">Lançamento #L-9813</span>
                          <h5 className="text-xs font-bold text-slate-800 mt-1">Vale Transporte e Benefícios</h5>
                          <p className="text-[10px] text-slate-400">D: Custos com Benefícios (Resultado)<br />C: Caixa/Bancos (Ativo)</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-700">{formatBRL(1250)}</span>
                          <p className="text-[10px] text-emerald-600 font-bold mt-1">Sincronizado</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax obligations alerts / compliance */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <div>
                      <h4 className="font-black text-xs text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-1.5">
                        <ShieldAlert size={15} className="text-amber-500" /> Obrigações Fiscais & Calendário Federal
                      </h4>
                      <p className="text-xs text-slate-450 mt-1">
                        Acompanhe as transmissões obrigatórias federais integradas.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 border border-red-150 rounded-xl flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-red-900">DCTFWeb Previdenciária</h5>
                          <p className="text-[10px] text-red-700 mt-0.5 font-semibold">Vence no dia 15 do próximo mês. Realize o fechamento do período no eSocial!</p>
                          <button 
                            onClick={() => addToast('Fechamento consolidado transmitido ao eCac com sucesso.', 'success')}
                            className="mt-2 text-[9px] font-black uppercase text-red-700 bg-red-100 border border-red-200 px-2 py-1 rounded hover:bg-red-200 cursor-pointer"
                          >
                            Transmitir Apuração
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                        <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-800">SPED EFD-Reinf</h5>
                          <p className="text-[10px] text-slate-450 mt-0.5">Retenções na fonte (IR, CSLL, PIS/Cofins) transmitidas.</p>
                          <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">Recibo: 2.193.123-11</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                        <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-800">Declaração Coletiva do Clero</h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">Integrada automaticamente com a DIRF anual previdenciária.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4d. PLANO DE CONTAS SUB-TAB */}
            {contabActiveTab === 'contas' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-black text-sm text-slate-800 flex items-center gap-2">
                        <Scale size={16} className="text-indigo-600" /> Plano de Contas & Estruturação Contábil
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Gerencie a classificação oficial do caixa, dízimos, ofertas, despesas ministeriais e encargos sociais. Mantém o GIPP 100% em conformidade com as regras contábeis do Terceiro Setor e eSocial.
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        setEditingConta(null);
                        setContaForm({
                          codigo: '',
                          nome: '',
                          grupo: 'Ativo Circulante',
                          tipo: 'Devedora',
                          saldo: 0,
                          status: 'ativo'
                        });
                        setShowContaModal(true);
                      }}
                      variant="primary" 
                      size="sm" 
                      icon={Plus}
                      className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                    >
                      Nova Conta Contábil
                    </Button>
                  </div>
                </div>

                {/* Account Balances Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                    <h5 className="text-[10px] uppercase font-bold text-blue-800 tracking-wider mb-1">Ativo Circulante (Disponível)</h5>
                    <p className="font-black text-lg text-blue-900">
                      {formatBRL(planoDeContas.filter(c => c.grupo === 'Ativo Circulante' && c.status === 'ativo').reduce((sum, c) => sum + (parseFloat(c.saldo) || 0), 0))}
                    </p>
                    <span className="text-[9px] text-blue-600 font-semibold mt-0.5 block">Liquidez imediata (Caixa/Bancos)</span>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                    <h5 className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider mb-1">Receitas Acumuladas</h5>
                    <p className="font-black text-lg text-emerald-900">
                      {formatBRL(planoDeContas.filter(c => c.grupo === 'Receita Operacional' && c.status === 'ativo').reduce((sum, c) => sum + (parseFloat(c.saldo) || 0), 0))}
                    </p>
                    <span className="text-[9px] text-emerald-600 font-semibold mt-0.5 block">Dízimos, Ofertas e Doações</span>
                  </div>

                  <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl">
                    <h5 className="text-[10px] uppercase font-bold text-red-800 tracking-wider mb-1">Despesas Operacionais</h5>
                    <p className="font-black text-lg text-red-900">
                      {formatBRL(planoDeContas.filter(c => (c.grupo === 'Despesa Operacional' || c.grupo === 'Gastos Administrativos') && c.status === 'ativo').reduce((sum, c) => sum + (parseFloat(c.saldo) || 0), 0))}
                    </p>
                    <span className="text-[9px] text-red-650 font-semibold mt-0.5 block">Salários, Encargos e Custo Sede</span>
                  </div>

                  <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
                    <h5 className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider mb-1">Superávit Consolidado</h5>
                    <p className="font-black text-lg text-indigo-900">
                      {formatBRL(
                        planoDeContas.filter(c => c.grupo === 'Receita Operacional' && c.status === 'ativo').reduce((sum, c) => sum + (parseFloat(c.saldo) || 0), 0) -
                        planoDeContas.filter(c => (c.grupo === 'Despesa Operacional' || c.grupo === 'Gastos Administrativos' || c.grupo === 'Passivo Circulante') && c.status === 'ativo').reduce((sum, c) => sum + (parseFloat(c.saldo) || 0), 0)
                      )}
                    </p>
                    <span className="text-[9px] text-indigo-600 font-semibold mt-0.5 block">Resultado eclesiástico do período</span>
                  </div>
                </div>

                {/* Filter and accounts table */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                      <input 
                        type="text"
                        placeholder="Buscar conta por código ou nome..."
                        value={contaSearch}
                        onChange={(e) => setContaSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 outline-hidden focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Grupo:</span>
                      <select 
                        value={contaGroupFilter}
                        onChange={(e: any) => setContaGroupFilter(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 font-semibold outline-hidden cursor-pointer"
                      >
                        <option value="todos">Todos os Grupos</option>
                        <option value="Ativo Circulante">Ativo Circulante</option>
                        <option value="Ativo Não Circulante">Ativo Não Circulante</option>
                        <option value="Passivo Circulante">Passivo Circulante</option>
                        <option value="Receita Operacional">Receita Operacional</option>
                        <option value="Despesa Operacional">Despesa Operacional</option>
                        <option value="Gastos Administrativos">Gastos Administrativos</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider w-28">Código</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Nome da Conta</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Grupo</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center">Natureza</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Saldo Atual</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center w-28">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planoDeContas
                          .filter(c => {
                            if (contaSearch && !c.nome.toLowerCase().includes(contaSearch.toLowerCase()) && !c.codigo.includes(contaSearch)) return false;
                            if (contaGroupFilter !== 'todos' && c.grupo !== contaGroupFilter) return false;
                            return true;
                          })
                          .sort((a, b) => a.codigo.localeCompare(b.codigo))
                          .map((c) => {
                            let groupColor = 'bg-slate-100 text-slate-700';
                            if (c.codigo.startsWith('1/1') || c.codigo.startsWith('1.')) groupColor = 'bg-blue-100 text-blue-900 border border-blue-200';
                            else if (c.codigo.startsWith('2.')) groupColor = 'bg-amber-100 text-amber-900 border border-amber-200';
                            else if (c.codigo.startsWith('3.')) groupColor = 'bg-emerald-100 text-emerald-950 border border-emerald-300';
                            else if (c.codigo.startsWith('4.')) groupColor = 'bg-rose-100 text-rose-900 border border-rose-200';

                            return (
                              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 text-xs font-mono font-black">
                                  <span className={`px-2 py-0.5 rounded text-[10px] ${groupColor}`}>
                                    {c.codigo}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs font-bold text-slate-800">
                                  {c.nome}
                                </td>
                                <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                                  {c.grupo}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${c.tipo === 'Devedora' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {c.tipo}
                                  </span>
                                </td>
                                <td className={`px-4 py-3 text-xs font-black text-right font-mono ${c.grupo.includes('Receita') ? 'text-emerald-700' : c.grupo.includes('Despesa') ? 'text-rose-650' : 'text-slate-800'}`}>
                                  {formatBRL(c.saldo)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${c.status === 'ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
                                    {c.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center flex justify-center gap-1.5">
                                  <button 
                                    onClick={() => {
                                      setEditingConta(c);
                                      setContaForm({ ...c });
                                      setShowContaModal(true);
                                    }}
                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md cursor-pointer transition-colors"
                                    title="Editar Conta"
                                  >
                                    <Edit size={13} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm(`Confirma a exclusão da conta contábil "${c.codigo} - ${c.nome}"?`)) {
                                        setPlanoDeContas(prev => prev.filter(item => item.id !== c.id));
                                        addToast('Conta contábil excluída com sucesso!', 'success');
                                      }
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
                                    title="Excluir Conta"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. TAB PONTO */}
      {activeTab === 'ponto' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-1 mb-1 border-b border-slate-100 pb-2">
                  <Clock size={16} className="text-indigo-600" /> Controle de Ponto
                </h3>
                <p className="text-xs text-slate-500">Gestão de jornada de trabalho para pastores, missionários e funcionários.</p>
              </div>
              <Button 
                onClick={() => {
                  setPontoForm({
                    colaborador: '',
                    data: getTodayDate(),
                    entrada: '08:00',
                    saida: '17:00',
                    horas: '08:00'
                  });
                  setShowPontoModal(true);
                }} 
                variant="primary" 
                size="sm" 
                icon={Plus}
                className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs cursor-pointer"
              >
                Informar Ponto Avulso
              </Button>
            </div>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-4 shadow-xs">
               <table className="w-full text-sm text-left">
                 <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
                   <tr>
                     <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Colaborador</th>
                     <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Data</th>
                     <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Entrada</th>
                     <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Saída</th>
                     <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Horas / Saldo</th>
                     <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Ações</th>
                   </tr>
                 </thead>
                 <tbody>
                   {pontoPunches.length === 0 ? (
                     <tr>
                       <td colSpan={6} className="px-4 py-12 text-center text-slate-500 bg-white">
                         <Clock size={32} className="mx-auto text-slate-300 mb-2" />
                         <p className="font-semibold text-slate-600">Nenhum registro de ponto encontrado</p>
                       </td>
                     </tr>
                   ) : (
                     pontoPunches.map((p) => (
                       <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                         <td className="px-4 py-3 text-xs font-bold text-slate-800">{p.colaborador}</td>
                         <td className="px-4 py-3 text-xs text-slate-600 font-semibold">
                           {p.data ? new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                         </td>
                         <td className="px-4 py-3 text-xs text-slate-500 font-mono font-bold">{p.entrada}</td>
                         <td className="px-4 py-3 text-xs text-slate-500 font-mono font-bold">{p.saida || '--:--'}</td>
                         <td className="px-4 py-3 text-xs font-extrabold text-indigo-700 font-mono">{p.horas}</td>
                         <td className="px-4 py-3">
                           <button 
                             onClick={() => {
                               setPontoPunches(prev => prev.filter(item => item.id !== p.id));
                               addToast('Registro de ponto removido!', 'info');
                             }}
                             className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer transition-colors"
                             title="Remover Registro"
                           >
                             <Trash2 size={13} />
                           </button>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
            </div>

            <div className="mt-4 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-center justify-between text-xs text-[#166534] font-semibold">
              <span>Sincronização 100% ativa com o eSocial Fase 4 (SST/Jornadas)</span>
              <span className="text-[9px] bg-[#15803d] text-white px-2 py-0.5 rounded font-black uppercase">Homologado</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB FÉRIAS E LICENÇAS */}
      {activeTab === 'ferias' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-1 mb-1 border-b border-slate-100 pb-2">
                  <Plane size={16} className="text-indigo-600" /> Férias e Afastamentos
                </h3>
                <p className="text-xs text-slate-500">Acompanhamento de períodos aquisitivos, programação e emissão de recibo de férias.</p>
              </div>
              <Button onClick={() => addToast('O agendamento de férias será habilitado automaticamente ao completar o período aquisitivo de 12 meses', 'info')} variant="primary" size="sm" icon={Plus}>
                Programar Férias
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex items-center gap-4">
                 <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
                   <Calendar size={24} />
                 </div>
                 <div>
                   <h4 className="font-semibold text-amber-800 text-[10px] uppercase tracking-wider mb-1">A Vencer / Vencidas</h4>
                   <p className="font-black text-xl text-amber-600">0</p>
                 </div>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4">
                 <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                   <Plane size={24} />
                 </div>
                 <div>
                   <h4 className="font-semibold text-emerald-800 text-[10px] uppercase tracking-wider mb-1">Em Gozo de Férias</h4>
                   <p className="font-black text-xl text-emerald-600">0</p>
                 </div>
              </div>
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center gap-4">
                 <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                   <Briefcase size={24} />
                 </div>
                 <div>
                   <h4 className="font-semibold text-blue-800 text-[10px] uppercase tracking-wider mb-1">Licenças e Afastamentos</h4>
                   <p className="font-black text-xl text-blue-600">0</p>
                 </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden mt-2 shadow-xs">
               <table className="w-full text-sm text-left">
                 <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
                   <tr>
                     <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Colaborador</th>
                     <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Tipo</th>
                     <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Período Aquisitivo</th>
                     <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Período de Gozo</th>
                     <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
                     <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Ações</th>
                   </tr>
                 </thead>
                 <tbody>
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500 bg-white">
                        <Plane size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">Sem programações de férias ou afastamentos atuais</p>
                      </td>
                    </tr>
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB ESOCIAL E COMPLIANCE */}
      {activeTab === 'esocial' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-200/80">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-sm font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1 mb-1 border-b border-emerald-100 pb-2">
                  <Shield size={16} className="text-emerald-600" /> Compliance e eSocial
                </h3>
                <p className="text-xs text-emerald-600/80">Painel de mensageria e transmissão dos eventos e obrigações trabalhistas.</p>
              </div>
              <Button onClick={() => addToast('Geração de lote S-1200 / S-1299 simulada com sucesso. Os recibos foram assinados.', 'success')} variant="primary" size="sm" icon={RefreshCw} className="bg-emerald-600 hover:bg-emerald-700">
                Transmissão Lote
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="border border-slate-200 p-5 rounded-2xl shadow-xs bg-slate-50/50">
                  <h4 className="font-black text-xs text-slate-700 mb-4 border-b border-slate-200 pb-2 uppercase tracking-wide">Eventos Periódicos (Folha Mensal)</h4>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-semibold text-slate-600">S-1200 - Remuneração de Trabalhadores</span>
                       <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-black uppercase tracking-wider shadow-sm border border-emerald-200">Enviado</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-semibold text-slate-600">S-1210 - Pagamentos de Rendimentos</span>
                       <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-black uppercase tracking-wider shadow-sm border border-emerald-200">Enviado</span>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-semibold text-slate-600">S-1299 - Fechamento dos Eventos</span>
                       <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-black uppercase tracking-wider shadow-sm border border-amber-200">Pendente</span>
                     </div>
                  </div>
               </div>
               
               <div className="border border-slate-200 p-5 rounded-2xl shadow-xs bg-slate-50/50">
                  <h4 className="font-black text-xs text-slate-700 mb-4 border-b border-slate-200 pb-2 uppercase tracking-wide">Integrações Oficiais (Guias/Encargos)</h4>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-semibold text-slate-600 flex items-center gap-2"><Database size={14} className="text-blue-500" /> DCTFWeb</span>
                       <button className="text-indigo-600 text-[10px] font-black uppercase tracking-wider hover:underline cursor-pointer">Emitir DARF</button>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-semibold text-slate-600 flex items-center gap-2"><Database size={14} className="text-orange-500" /> FGTS Digital</span>
                       <button className="text-indigo-600 text-[10px] font-black uppercase tracking-wider hover:underline cursor-pointer">Acessar Guia</button>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-semibold text-slate-600 flex items-center gap-2"><Database size={14} className="text-emerald-500" /> DIRF Anual</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Substituída</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* eSocial Fase 4 - Segurança e Saúde do Trabalho (SST) */}
            <div className="mt-6 border border-emerald-250 rounded-2xl p-6 bg-emerald-50/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-100 pb-3 mb-4 gap-3">
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-emerald-600" /> eSocial Fase 4: SST (Saúde & Segurança do Trabalho)
                  </h4>
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                    Controle obrigatório de exames ocupacionais (ASO), Riscos Ambientais (LTCAT) e comunicação de acidentes (CAT).
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setSstForm({
                      colaborador: '',
                      tipo: 'Admissional',
                      data: getTodayDate(),
                      resultado: 'Apto',
                      evento: 'S-2220',
                      riscos: 'Ausência de riscos nocivos identificados (LTCAT)',
                      medico: 'Dr. Roberto Cruz - CRM/SP 123456'
                    });
                    setShowSstModal(true);
                  }}
                  variant="primary" 
                  size="sm" 
                  icon={Plus}
                  className="bg-emerald-600 hover:bg-emerald-700 border-0 text-xs shadow-sm cursor-pointer"
                >
                  Novo Registro / Evento SST
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Event descriptions */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                      <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-black font-mono">S-2210</span> Comunicação de Acidente de Trabalho (CAT)
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                      Deve ser enviado em até 1 dia útil após o acidente. Em caso de óbito, o envio deve ser imediato.
                    </p>
                    <button
                      onClick={() => {
                        setSstForm({
                          colaborador: '',
                          tipo: 'Comunicação de CAT',
                          data: getTodayDate(),
                          resultado: 'Notificado',
                          evento: 'S-2210',
                          riscos: 'Acidente de trajeto ou ocupacional registrado',
                          medico: 'Dr. Roberto Cruz - CRM/SP 123456'
                        });
                        setShowSstModal(true);
                      }}
                      className="mt-2 text-[9px] font-black uppercase text-indigo-650 hover:underline cursor-pointer"
                    >
                      Registrar CAT →
                    </button>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                      <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-black font-mono">S-2220</span> Monitoramento da Saúde do Trabalhador
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                      Envio de exames Admissionais, Periódicos, Demissionais, Mudança de Função e Retorno ao Trabalho.
                    </p>
                    <button
                      onClick={() => {
                        setSstForm({
                          colaborador: '',
                          tipo: 'Periódico',
                          data: getTodayDate(),
                          resultado: 'Apto',
                          evento: 'S-2220',
                          riscos: 'Ausência de riscos nocivos',
                          medico: 'Dr. Roberto Cruz - CRM/SP 123456'
                        });
                        setShowSstModal(true);
                      }}
                      className="mt-2 text-[9px] font-black uppercase text-indigo-650 hover:underline cursor-pointer"
                    >
                      Registrar ASO / Exame →
                    </button>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                      <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-black font-mono">S-2240</span> Condições Ambientais do Trabalho (LTCAT)
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                      Informa a exposição a agentes nocivos químicos, físicos, biológicos ou associação de agentes.
                    </p>
                    <button
                      onClick={() => {
                        setSstForm({
                          colaborador: 'Consolidado da Sede',
                          tipo: 'Avaliação de Risco (LTCAT)',
                          data: getTodayDate(),
                          resultado: 'Conforme',
                          evento: 'S-2240',
                          riscos: 'Ausência de exposição a agentes nocivos conforme LTCAT/PGR anual',
                          medico: 'Dr. Roberto Cruz - Eng. de Segurança'
                        });
                        setShowSstModal(true);
                      }}
                      className="mt-2 text-[9px] font-black uppercase text-indigo-650 hover:underline cursor-pointer"
                    >
                      Atualizar Agentes Nocivos →
                    </button>
                  </div>
                </div>

                {/* History of exams/SST events sent */}
                <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
                      Eventos e Exames SST Transmitidos ao eSocial
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left col-span-12">
                        <thead className="bg-[#f8fafc] border-b border-slate-250 text-slate-600">
                          <tr>
                            <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider">Colaborador</th>
                            <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider">Tipo / Evento</th>
                            <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider">Data</th>
                            <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider text-center">Resultado</th>
                            <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider text-center">Status</th>
                            <th className="px-3 py-2 font-bold text-[10px] uppercase tracking-wider text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sstExames.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-3 py-8 text-center text-slate-400 italic text-[11px]">
                                Nenhum evento SST cadastrado ou pendente de transmissão.
                              </td>
                            </tr>
                          ) : (
                            sstExames.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-3 py-2 max-w-[150px] truncate">
                                  <div className="font-bold text-slate-800 text-xs">{item.colaborador || 'Funcionário Geral'}</div>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-1 text-slate-650 font-semibold text-[11px]">
                                    <span className="bg-slate-100 text-slate-600 text-[8px] px-1 py-0.5 rounded font-black font-mono">{item.evento}</span>
                                    {item.tipo}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-xs text-slate-500 font-medium">
                                  {item.data ? new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td className="px-3 py-2 text-center text-xs font-black text-slate-705">
                                  {item.resultado}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${item.status === 'transmitido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-105' : 'bg-amber-50 text-amber-700'}`}>
                                    {item.status === 'transmitido' ? 'Transmitido' : 'Pendente'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center flex justify-center gap-1">
                                  {item.status === 'pendente' && (
                                    <button 
                                      onClick={() => {
                                        setSstExames(prev => prev.map(x => x.id === item.id ? { ...x, status: 'transmitido' } : x));
                                        addToast(`Evento ${item.evento} de SST transmitido com sucesso assinado por A1!`, 'success');
                                      }}
                                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] rounded-md uppercase tracking-wider cursor-pointer transition-colors border-0 animate-pulse"
                                    >
                                      Transmitir
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => {
                                      setSstExames(prev => prev.filter(x => x.id !== item.id));
                                      addToast('Evento SST excluído localmente.', 'info');
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                                    title="Excluir Ocupacional"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between col-span-12 w-full">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Consórcio de SST ativo com Clínicas Conveniadas</span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-black uppercase">XML automático via API</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex bg-blue-50 border border-blue-100 p-4 rounded-xl gap-3">
              <Info className="text-blue-500 shrink-0" size={20} />
              <p className="text-xs text-blue-800 leading-relaxed font-semibold">
                O envio do eSocial deve ocorrer até o dia 15 do mês subsequente (folha), enquanto a DCTFWeb para emissão da DARF Previdenciária também vence no dia 15. A transmissão efetiva em ambiente de produção requer que o certificado digital modelo A1 esteja corretamente atrelado na área de <strong className="font-black hover:underline cursor-pointer">Configurações Gerais</strong> do sistema.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* 8. TAB RH */}
      {activeTab === 'rh' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-1 mb-1 border-b border-slate-100 pb-2">
                  <UserPlus size={16} className="text-indigo-600" /> Desenvolvimento Humano / RH
                </h3>
                <p className="text-xs text-slate-500">Recrutamento, avaliações de desempenho, onboarding e treinamentos.</p>
              </div>
            </div>
            
            {/* Inner Tabs for RH */}
            <div className="flex border-b border-slate-200 mb-6 space-x-6 overflow-x-auto hide-scrollbar">
               <button 
                 onClick={() => setRhActiveTab('recrutamento')}
                 className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${rhActiveTab === 'recrutamento' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
               >
                 Recrutamento
               </button>
               <button 
                 onClick={() => setRhActiveTab('onboarding')}
                 className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${rhActiveTab === 'onboarding' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
               >
                 Onboarding
               </button>
               <button 
                 onClick={() => setRhActiveTab('treinamento')}
                 className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${rhActiveTab === 'treinamento' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
               >
                 Treinamentos
               </button>
               <button 
                 onClick={() => setRhActiveTab('desempenho')}
                 className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${rhActiveTab === 'desempenho' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
               >
                 Desempenho
               </button>
            </div>

            {rhActiveTab === 'recrutamento' && (
              <div className="animate-in fade-in space-y-6">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Vagas Abertas</h4>
                    <p className="text-xs text-slate-500 mt-1">Gerencie processos seletivos e candidatos.</p>
                  </div>
                  <Button variant="primary" size="sm" icon={Plus}>Nova Vaga</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-black uppercase tracking-wider">Ativa</span>
                      <span className="text-xs text-slate-400 font-semibold">Cód: V-102</span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm mb-1">Analista Administrativo</h5>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">Atuação no setor administrativo e financeiro da instituição.</p>
                    <div className="flex justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs font-semibold text-slate-600"><Users size={14} className="inline mr-1 text-slate-400" /> 12 Candidatos</span>
                      <button className="text-indigo-600 text-xs font-black hover:underline cursor-pointer">Ver Funil</button>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-black uppercase tracking-wider">Pausada</span>
                      <span className="text-xs text-slate-400 font-semibold">Cód: V-098</span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm mb-1">Auxiliar de Limpeza</h5>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">Manutenção e conservação do templo e dependências.</p>
                    <div className="flex justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs font-semibold text-slate-600"><Users size={14} className="inline mr-1 text-slate-400" /> 45 Candidatos</span>
                      <button className="text-indigo-600 text-xs font-black hover:underline cursor-pointer">Ver Funil</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {rhActiveTab === 'onboarding' && (
              <div className="animate-in fade-in space-y-6">
                <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div>
                    <h4 className="text-sm font-black text-blue-900">Integração de Novos Colaboradores</h4>
                    <p className="text-xs text-blue-700/80 mt-1">Acompanhe as trilhas de admissão em andamento.</p>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Colaborador</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Cargo</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Progresso (Trilha)</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          <UserPlus size={24} className="mx-auto text-slate-300 mb-2" />
                          <p className="font-semibold text-slate-600">Nenhum onboarding em andamento</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {rhActiveTab === 'treinamento' && (
              <div className="animate-in fade-in space-y-6">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Catálogo de Treinamentos</h4>
                    <p className="text-xs text-slate-500 mt-1">Capacitação institucional legal e de desenvolvimento.</p>
                  </div>
                  <Button variant="primary" size="sm" icon={Plus}>Novo Curso</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 border border-slate-200 p-4 rounded-xl shadow-xs">
                    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">Integração Institucional e Cultura</h5>
                      <p className="text-xs text-slate-500 mt-0.5">Obrigatório para novos colaboradores.</p>
                      <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 w-[85%]"></div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">85% Concluído pela equipe</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border border-slate-200 p-4 rounded-xl shadow-xs">
                    <div className="bg-orange-100 text-orange-600 p-3 rounded-xl">
                      <ShieldAlert size={24} />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">CIPA e Prevenção de Acidentes</h5>
                      <p className="text-xs text-slate-500 mt-0.5">Renovação anual requerida (NR-05).</p>
                      <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-orange-500 h-1.5 w-[40%]"></div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">40% Faltam realizar</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {rhActiveTab === 'desempenho' && (
              <div className="animate-in fade-in space-y-6">
                <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md shrink-0">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-900">Integração RH ↔ DP Ativa</h4>
                      <p className="text-xs text-emerald-700/85 mt-1">
                        Os resultados dos ciclos de avaliação já podem gerar sugestões automáticas de reajuste salarial ou promoção diretamente para a aprovação na folha do Departamento Pessoal.
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 whitespace-nowrap">
                    Configurar Regras
                  </Button>
                </div>
                
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Ciclo</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Período</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Resumo</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 text-xs">Avaliação Desempenho H1</td>
                        <td className="px-4 py-3 text-slate-600 text-xs">Jan - Jun 2026</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-black uppercase tracking-wider">Planejamento</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">0 avaliados</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800 text-xs">Pesquisa de Clima Organizacional</td>
                        <td className="px-4 py-3 text-slate-600 text-xs">Nov 2025</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-black uppercase tracking-wider">Concluído</span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex items-center gap-2">
                             <span className="font-bold text-slate-700">82% Engajamento</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* 9. JURÍDICO & COMPLIANCE TAB */}
      {activeTab === 'juridico' && (
        <div className="space-y-6 animate-entrance">
          <div className="bg-white p-6 rounded-2.5xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 mb-6">
              <div>
                <span className="text-[10px] bg-indigo-100/70 border border-indigo-200 text-indigo-700 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Compliance & Jurídico
                </span>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mt-2">
                  <Scale className="text-indigo-600" size={22} /> Controle de Contratos & Contencioso Trabalhista
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Gerenciamento preventivo e estratégico de contratos de trabalho, termos de voluntariado, termos clericais e acompanhamento de processos judiciais de RH.
                </p>
              </div>

              {/* Quick statistics for Juridico */}
              <div className="flex gap-4">
                <div className="bg-slate-50 p-2.5 px-4 rounded-xl border border-slate-150">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Contratos Vigentes</span>
                  <span className="text-sm font-black text-slate-700">{contratos.filter(c => c.status === 'ativo').length} ativos</span>
                </div>
                <div className="bg-amber-50 p-2.5 px-4 rounded-xl border border-amber-150">
                  <span className="text-[9px] text-amber-500 font-bold uppercase block">Processos Ativos</span>
                  <span className="text-sm font-black text-amber-700">{processos.filter(p => p.status === 'andamento').length} em curso</span>
                </div>
              </div>
            </div>

            {/* Inner Subtabs */}
            <div className="flex border-b border-slate-200 mb-6 space-x-6 overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setJuridicoActiveTab('contratos')}
                className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${juridicoActiveTab === 'contratos' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Contratos & Termos Aditivos
              </button>
              <button 
                onClick={() => setJuridicoActiveTab('processos')}
                className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${juridicoActiveTab === 'processos' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Processos & Demandas Judiciais
              </button>
              <button 
                onClick={() => setJuridicoActiveTab('base_juridica')}
                className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${juridicoActiveTab === 'base_juridica' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Base de Apoio Jurídico & Prevenção
              </button>
            </div>

            {/* 9a. SUBTAB CONTRATOS & TERMOS */}
            {juridicoActiveTab === 'contratos' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                      <input 
                        type="text"
                        placeholder="Buscar contrato ou colaborador..."
                        value={contratoSearch}
                        onChange={(e) => setContratoSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 outline-hidden"
                      />
                    </div>
                    <select
                      value={contratoStatusFilter}
                      onChange={(e: any) => setContratoStatusFilter(e.target.value)}
                      className="bg-white border border-slate-205 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 font-semibold cursor-pointer outline-hidden"
                    >
                      <option value="todos">Todos os Status</option>
                      <option value="ativo">Vigente / Ativo</option>
                      <option value="rascunho">Minuta / Rascunho</option>
                      <option value="vencido">Vencido / Expirado</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => {
                      setEditingContrato(null);
                      setContratoForm({
                        colaborador_id: '',
                        titulo: '',
                        tipo: 'Contrato de Trabalho CLT',
                        data_inicio: '',
                        data_fim: '',
                        valor: 0,
                        status: 'ativo',
                        clausulas: 'Cláusula 1ª - Das Atividades e Responsabilidades...\nCláusula 2ª - Do Horário de Trabalho...\nCláusula 3ª - Do Sigilo e Confidencialidade...',
                        assinado_digital: true
                      });
                      setShowContratoModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg cursor-pointer flex items-center justify-center gap-2 shadow-sm border border-indigo-500 transition-colors"
                  >
                    <Plus size={14} /> Novo Contrato / Termo
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Título do Termo</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Tipo</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Colaborador / Parte</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Início Vigência</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right font-mono">Valor</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center">Assinatura Digital</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contratos
                          .filter(c => {
                            const term = contratoSearch.toLowerCase();
                            const colab = colaboradores.find(col => col.id === c.colaborador_id);
                            const colabNome = colab ? colab.nome.toLowerCase() : '';
                            const matchesSearch = c.titulo.toLowerCase().includes(term) || colabNome.includes(term) || c.tipo.toLowerCase().includes(term);
                            const matchesStatus = contratoStatusFilter === 'todos' || c.status === contratoStatusFilter;
                            return matchesSearch && matchesStatus;
                          })
                          .map((c) => {
                            const linkedColab = colaboradores.find(col => col.id === c.colaborador_id);
                            return (
                              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-800 text-xs">
                                  {c.titulo}
                                </td>
                                <td className="px-4 py-3 text-slate-650 text-xs font-semibold">
                                  {c.tipo}
                                </td>
                                <td className="px-4 py-3 text-xs">
                                  {linkedColab ? (
                                    <div className="flex flex-col">
                                      <span className="font-bold text-indigo-650">{linkedColab.nome}</span>
                                      <span className="text-[10px] text-slate-450 uppercase">{linkedColab.cargo || 'Funcionário'}</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 italic">Termo Geral / Coletivo</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-slate-600 text-xs font-mono">
                                  {c.data_inicio ? new Date(c.data_inicio).toLocaleDateString('pt-BR') : '-'}
                                  {c.data_fim && ` até ${new Date(c.data_fim).toLocaleDateString('pt-BR')}`}
                                </td>
                                <td className="px-4 py-3 text-right text-slate-700 font-mono text-xs font-black">
                                  {c.valor > 0 ? formatBRL(c.valor) : <span className="text-slate-400 px-2 py-0.5 bg-slate-50 border border-slate-150 rounded text-[9px]">ISENTO</span>}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-wider ${
                                    c.status === 'ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250/50' : 
                                    c.status === 'rascunho' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                                    'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}>
                                    {c.status === 'ativo' ? 'Vigente' : c.status === 'rascunho' ? 'Rascunho' : 'Expirado'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {c.assinado_digital ? (
                                    <span className="text-xs text-emerald-605 font-bold flex items-center justify-center gap-1">
                                      <CheckCircle size={12} /> Assinado por Token ICP
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400">Assinatura Manual</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-1.5 justify-center">
                                    <button 
                                      onClick={() => {
                                        setEditingContrato(c);
                                        setContratoForm({ ...c });
                                        setShowContratoModal(true);
                                      }}
                                      className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-black text-[10px] rounded cursor-pointer transition-colors"
                                    >
                                      Editar
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const confirmed = window.confirm('Tem certeza que deseja excluir esse termo contratual?');
                                        if (confirmed) {
                                          setContratos(prev => prev.filter(item => item.id !== c.id));
                                          addToast('Contrato excluído com sucesso!', 'warning');
                                        }
                                      }}
                                      className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        }
                        {contratos.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-400 italic text-xs">
                              Nenhum contrato cadastrado ou localizado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 9b. SUBTAB PROCESSOS JUDICIAIS / TRABALHISTAS */}
            {juridicoActiveTab === 'processos' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Visual Alert Banner for upcoming Hearings */}
                {processos.filter(p => p.status === 'andamento' && p.proxima_audiencia).length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
                    <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">Agenda de Audiências Trabalhistas</h4>
                      <p className="text-xs text-slate-650 mt-1">
                        Há audiências agendadas na Justiça do Trabalho. Mantenha os prepostos instruídos e os documentos de contra-cheque, folha de ponto e Admissão arquivados e disponíveis.
                      </p>
                      
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {processos
                          .filter(p => p.status === 'andamento' && p.proxima_audiencia)
                          .map((p, ix) => (
                            <span key={p.id || ix} className="text-[10px] bg-white border border-amber-250 text-slate-700 px-3 py-1 rounded-md font-bold">
                              🔍 Proc. {p.numero} - Audiência de Instrução: <b className="text-amber-700">{p.proxima_audiencia}</b>
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                    <input 
                      type="text"
                      placeholder="Filtrar processos por número ou autor..."
                      value={processoSearch}
                      onChange={(e) => setProcessoSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 outline-hidden"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      setEditingProcesso(null);
                      setProcessoForm({
                        colaborador_id: '',
                        numero: '',
                        tipo: 'trabalhista',
                        titulo: '',
                        autor: '',
                        reu: 'Instituição Sede / Matriz',
                        data_entrada: '',
                        status: 'andamento',
                        descricao: '',
                        ultima_movimentacao: '',
                        proxima_audiencia: '',
                        valor_causa: 0
                      });
                      setShowProcessoModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black rounded-lg cursor-pointer flex items-center justify-center gap-2 shadow-sm border border-indigo-550 transition-colors"
                  >
                    <Plus size={14} /> Cadastrar Processo Trabalhista / Cível
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">ID / Número Processo CNJ</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Tipo/Objeto</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Autor da Causa</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Data Distribuição</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Última Movimentação</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Valor Causa</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                          <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processos
                          .filter(p => {
                            const term = processoSearch.toLowerCase();
                            return p.numero.toLowerCase().includes(term) || p.titulo.toLowerCase().includes(term) || p.autor.toLowerCase().includes(term);
                          })
                          .map((p) => {
                            return (
                              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 text-xs font-black text-slate-800 font-mono">
                                  {p.numero}
                                </td>
                                <td className="px-4 py-3 text-xs">
                                  <div className="font-bold text-slate-705">{p.titulo}</div>
                                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{p.tipo === 'trabalhista' ? 'Trabalhista' : p.tipo === 'civel' ? 'Cível' : 'Outros'}</div>
                                </td>
                                <td className="px-4 py-3 text-xs font-semibold text-indigo-900">
                                  {p.autor}
                                </td>
                                <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                                  {p.data_entrada ? new Date(p.data_entrada).toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td className="px-4 py-3 text-slate-600 text-xs">
                                  <div className="line-clamp-1 italic text-slate-550 font-medium">"{p.ultima_movimentacao || 'Lançado no sistema'}"</div>
                                  {p.proxima_audiencia && <div className="text-[10px] text-amber-600 font-black mt-0.5">Audiência: {p.proxima_audiencia}</div>}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-slate-705">
                                  {formatBRL(p.valor_causa)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${
                                    p.status === 'andamento' ? 'bg-amber-50 text-amber-700 border border-amber-250/65' : 
                                    p.status === 'acordo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                                    'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  }`}>
                                    {p.status === 'andamento' ? 'Instrução' : p.status === 'acordo' ? 'Conciliado' : 'Arquivado'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-1.5 justify-center">
                                    <button 
                                      onClick={() => {
                                        setEditingProcesso(p);
                                        setProcessoForm({ ...p });
                                        setShowProcessoModal(true);
                                      }}
                                      className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-black text-[10px] rounded cursor-pointer transition-colors"
                                    >
                                      Editar
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const confirmed = window.confirm('Excluir ficha processual do sistema?');
                                        if (confirmed) {
                                          setProcessos(prev => prev.filter(item => item.id !== p.id));
                                          addToast('Ficha processual excluída!', 'info');
                                        }
                                      }}
                                      className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        }
                        {processos.length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-400 italic text-xs">
                              Nenhum processo judicial cadastrado ou em andamento.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 9c. SUBTAB BASE JURÍDICA &apoio */}
            {juridicoActiveTab === 'base_juridica' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:shadow-md transition-all">
                    <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl inline-block mb-3 border border-blue-150">
                      <BookOpen size={18} />
                    </span>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Contratos Admissão CLT</h4>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      A admissão sob regime CLT exige a assinatura da Carteira de Trabalho Digital até o dia anterior ao início do serviço. Sempre verifique as convenções coletivas de salários mínimos profissionais e pisos locais.
                    </p>
                    <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex justify-between items-center text-[10px] text-indigo-600 font-extrabold uppercase">
                      <span>Art. 29 CLT Compliance</span>
                      <span className="text-slate-450 text-[9px] font-semibold">Atualizado eSocial</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:shadow-md transition-all">
                    <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl inline-block mb-3 border border-emerald-150">
                      <UserCheck size={18} />
                    </span>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Lei do Trabalho Voluntário</h4>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Conforme a Lei nº 9.608/98, o trabalho voluntário eclesiástico deve possuir um Termo de Adesão assinado com regras rígidas, sob pena de restar caracterizado vínculo de trabalho de emprego convencional com multas severas.
                    </p>
                    <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex justify-between items-center text-[10px] text-emerald-600 font-extrabold uppercase">
                      <span>Lei Geral 9.608/1998</span>
                      <span className="text-slate-450 text-[9px] font-semibold">Modelo Voluntariado</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:shadow-md transition-all col-span-1 md:col-span-2 lg:col-span-1">
                    <span className="p-2.5 bg-pink-50 text-pink-600 rounded-xl inline-block mb-3 border border-pink-150">
                      <Shield size={18} />
                    </span>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Imunidades do Clero / eSocial</h4>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      O ministro de confissão religiosa (pastores, padres, clérigos) é segurado obrigatório da Previdência Social mas é isento de encargos patronais previdenciários e cota de 20%, desde que a atividade seja estritamente sacerdotal.
                    </p>
                    <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex justify-between items-center text-[10px] text-pink-600 font-extrabold uppercase">
                      <span>eSocial Categoria Código 701</span>
                      <span className="text-slate-450 text-[9px] font-semibold">Clero & Estatutos</span>
                    </div>
                  </div>

                </div>

                <div className="bg-indigo-50/55 border border-indigo-150 rounded-xl p-5">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Info size={16} className="text-indigo-600" /> Diretriz de Boas Práticas Preventivas GIPP
                  </h4>
                  <ul className="text-[11px] text-slate-600 space-y-2 list-disc pl-4 leading-relaxed font-medium">
                    <li>Sempre colha a folha de ponto mensalmente por canais biométricos, folha física assinada ou sistema digital autorizado pelo MTE (Portaria 671).</li>
                    <li>O controle integrado de pagamento no DP exporta e cruza dados das horas trabalhadas, protegendo o patrimônio corporativo contra questionamentos em 100% de precisão jurídica.</li>
                    <li>Acordos judiciais amigáveis e homologações devem ser arquivados em conjunto com a ficha cadastral do eSocial do colaborador correspondente para consolidação na DCTFWeb.</li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- MODAL ADD / EDIT COLABORADOR --- */}
      {showColabModal && createPortal(
        <InteractiveWindow
          id="generic_modal_colaborador"
          title={editingColab ? 'Editar Colaborador' : 'Novo Colaborador / Funcionário'}
          subtitle={editingColab ? 'Gestão Integrada Corporativa e Eclesiástica' : 'Nível Profissional • Cadastro Geral'}
          onClose={() => setShowColabModal(false)}
          icon={Users}
          headerBg="from-indigo-600 via-blue-600 to-indigo-800"
          defaultWidth={780}
          defaultHeight={690}
          footer={
            <div className="flex justify-between items-center w-full">
              <div className="text-[10px] text-slate-400 font-extrabold uppercase select-none">
                {colabForm.tipo === 'pastor' ? '✨ Regime Clerical Isento de Cota Patronal' : '💼 Regime Geral Cadastral'}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowColabModal(false)}
                  className="border border-white/60 bg-white/40 hover:bg-white cursor-pointer text-xs"
                >
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => handleSaveColaborador()}
                  className="shadow-indigo-505/45 cursor-pointer flex items-center gap-2 text-xs"
                >
                  Guardar Cadastro
                </Button>
              </div>
            </div>
          }
        >
          {/* Modal Tab Headers */}
          <div className="flex border-b border-slate-200/80 mb-5 pb-0.5 overflow-x-auto gap-1 select-none scrollbar-none">
            <button
              type="button"
              onClick={() => setModalSubTab('contrato')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                modalSubTab === 'contrato'
                  ? 'border-indigo-650 text-indigo-650'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase size={14} /> Contrato & Pessoal
            </button>
            <button
              type="button"
              onClick={() => setModalSubTab('banco')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                modalSubTab === 'banco'
                  ? 'border-indigo-650 text-indigo-650'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard size={14} /> Bancos & Impostos
            </button>
            <button
              type="button"
              onClick={() => setModalSubTab('igreja')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                modalSubTab === 'igreja'
                  ? 'border-indigo-650 text-indigo-650'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 size={14} /> Aspectos Eclesiásticos
            </button>
            <button
              type="button"
              onClick={() => setModalSubTab('documentos')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                modalSubTab === 'documentos'
                  ? 'border-indigo-650 text-indigo-650'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Paperclip size={14} /> Anexos ({(colabForm.documentos || []).length})
            </button>
            <button
              type="button"
              onClick={() => setModalSubTab('beneficios')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                modalSubTab === 'beneficios'
                  ? 'border-indigo-650 text-indigo-650'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles size={14} className="text-amber-500" /> Benefícios Recorrentes
            </button>
            <button
              type="button"
              onClick={() => setModalSubTab('ferias')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                modalSubTab === 'ferias'
                  ? 'border-indigo-650 text-indigo-650'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar size={14} className="text-emerald-500" /> Férias & Afastamentos
            </button>
            <button
              type="button"
              onClick={() => setModalSubTab('historico_salarial')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                modalSubTab === 'historico_salarial'
                  ? 'border-indigo-650 text-indigo-650'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp size={14} className="text-indigo-500" /> Auditoria Salarial
            </button>
          </div>

          <form onSubmit={handleSaveColaborador} className="space-y-5 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin pb-4">
            
            {/* SUB-TAB 1: CONTRATO & DADOS PESSOAIS */}
            {modalSubTab === 'contrato' && (
              <div className="space-y-4 animate-entrance">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  <FormInput 
                    label="Nome Completo" 
                    value={colabForm.nome} 
                    onChange={(val: any) => setColabForm({...colabForm, nome: val})} 
                    placeholder="Nome do colaborador ou ministro" 
                    required 
                  />

                  <FormSelect 
                    label="Tipo de Vínculo Contratual" 
                    value={colabForm.tipo} 
                    onChange={(val: any) => setColabForm({...colabForm, tipo: val})} 
                    options={[
                      { value: 'funcionario', label: 'CLT (Funcionário sob as Leis CLT)' },
                      { value: 'pastor', label: 'Clero / Pastor Titular (Acordo Cooperativo de Prebenda)' },
                      { value: 'prestador', label: 'Prestador de Serviço Terceirizado (Recibo / NFS-e)' },
                      { value: 'colaborador', label: 'Colaborador Orgânico / Pró-Labore Geral' }
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                  <FormInput 
                    label="CPF" 
                    value={colabForm.cpf} 
                    onChange={(val: any) => setColabForm({...colabForm, cpf: val})} 
                    placeholder="Ex: 000.000.000-00" 
                  />

                  <FormInput 
                    label="Identidade RG" 
                    value={colabForm.rg} 
                    onChange={(val: any) => setColabForm({...colabForm, rg: val})} 
                    placeholder="Identidade Profissional ou RG" 
                  />

                  <FormInput 
                    label={colabForm.tipo === 'pastor' ? 'Prebenda Ministerial Básica (R$)' : 'Salário Base (R$)'} 
                    type="number" 
                    step="0.01" 
                    value={colabForm.salario_base} 
                    onChange={(val: any) => setColabForm({...colabForm, salario_base: val})} 
                    placeholder="0.00" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                  <FormInput 
                    label="Função ou Cargo Atribuído" 
                    value={colabForm.cargo} 
                    onChange={(val: any) => setColabForm({...colabForm, cargo: val})} 
                    placeholder="Ex: Pastor Residente, Secretária..." 
                  />

                  <FormInput 
                    label="Data de Nomeação/Admissão" 
                    type="date" 
                    value={colabForm.admissao} 
                    onChange={(val: any) => setColabForm({...colabForm, admissao: val})} 
                  />

                  <FormSelect 
                    label="Filial / Congregação Designada" 
                    value={colabForm.congregacao_id} 
                    onChange={(val: any) => setColabForm({...colabForm, congregacao_id: val})} 
                    options={[
                      { value: 'sede', label: 'Sede Geral' },
                      ...congregacoes.map((cg: any) => ({ value: cg.id, label: cg.nome.toUpperCase() }))
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  <FormInput 
                    label="Telefone / Celular corporativo" 
                    value={colabForm.telefone} 
                    onChange={(val: any) => setColabForm({...colabForm, telefone: val})} 
                    placeholder="(00) 00000-0000" 
                  />

                  <FormInput 
                    label="E-mail funcional" 
                    type="email" 
                    preserveCase 
                    value={colabForm.email} 
                    onChange={(val: any) => setColabForm({...colabForm, email: val})} 
                    placeholder="exemplo@igreja.org" 
                  />
                </div>
              </div>
            )}

            {/* SUB-TAB 2: BANCO & RECOLHIMENTOS */}
            {modalSubTab === 'banco' && (
              <div className="space-y-4 animate-entrance">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 space-y-4">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                    <CreditCard size={14} className="text-slate-500" /> Detalhes de Pagamento Bancário
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput 
                      label="Instituição Bancária" 
                      placeholder="Ex: Itaú, Nu, BB" 
                      value={colabForm.banco} 
                      onChange={(val: any) => setColabForm({...colabForm, banco: val})}
                      className="!mb-0"
                    />
                    <FormInput 
                      label="Agência" 
                      placeholder="Agência s/ d" 
                      value={colabForm.agencia} 
                      onChange={(val: any) => setColabForm({...colabForm, agencia: val})}
                      className="!mb-0"
                    />
                    <FormInput 
                      label="Conta com Dígito" 
                      placeholder="Ex: 12345-6" 
                      value={colabForm.conta} 
                      onChange={(val: any) => setColabForm({...colabForm, conta: val})}
                      className="!mb-0"
                    />
                    <FormInput 
                      label="Chave Transacional PIX" 
                      placeholder="CPF, celular, e-mail..." 
                      value={colabForm.pix} 
                      onChange={(val: any) => setColabForm({...colabForm, pix: val})}
                      className="!mb-0"
                    />
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 space-y-3">
                  <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle size={14} /> Regime e Isenções Contábeis
                  </p>
                  
                  <div className="flex gap-6 items-center flex-wrap pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group/chk select-none">
                      <input 
                        type="checkbox" 
                        id="chk_inss" 
                        checked={colabForm.inss} 
                        onChange={(e) => setColabForm({...colabForm, inss: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500/20 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-650 group-hover/chk:text-indigo-600 transition-colors">
                        Reter recolhimento previdenciário (INSS) na Folha
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer group/chk select-none">
                      <input 
                        type="checkbox" 
                        id="chk_irpf" 
                        checked={colabForm.irpf} 
                        onChange={(e) => setColabForm({...colabForm, irpf: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500/20 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-650 group-hover/chk:text-indigo-600 transition-colors">
                        Sujeito à retenção de imposto na fonte (IRRF / CLT)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Observações Gerais de Vínculo</label>
                  <textarea 
                    rows={2}
                    value={colabForm.observacao} 
                    onChange={(e) => setColabForm({...colabForm, observacao: e.target.value})}
                    placeholder="Instruções de contratação, acordos de bônus, convênios..."
                    className="input-futuristic w-full rounded-2xl p-3 text-xs font-bold text-slate-700 outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* SUB-TAB 3: ASPECTOS ECLESIÁSTICOS */}
            {modalSubTab === 'igreja' && (
              <div className="space-y-4 animate-entrance">
                <div className="bg-amber-50/40 p-4 border border-amber-200/50 rounded-2xl">
                  <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                    📝 <strong>Ficha Eclesiástica Complementar:</strong> Para pastores, clérigos e voluntários com funções ministeriais na igreja, registre as informações de origem e status ministerial local de acordo com governança do ministério de capelania.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  <FormInput 
                    label="Igreja / Ministério de Origem" 
                    value={colabForm.igreja_origem} 
                    onChange={(val: any) => setColabForm({...colabForm, igreja_origem: val})} 
                    placeholder="Ex: Assembleia de Deus Sede, IPB, etc." 
                  />

                  <FormInput 
                    label="Pastor Presidente de Origem" 
                    value={colabForm.pastor_presidente} 
                    onChange={(val: any) => setColabForm({...colabForm, pastor_presidente: val})} 
                    placeholder="Nome da autoridade pastoral de recomendação" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  <FormSelect 
                    label="Carta de Recomendação Regularizada?" 
                    value={colabForm.carta_recomendacao} 
                    onChange={(val: any) => setColabForm({...colabForm, carta_recomendacao: val})} 
                    options={[
                      { value: 'Sim', label: 'Sim - Atendida e arquivada na secretaria' },
                      { value: 'Não', label: 'Não Possui' },
                      { value: 'Em Trânsito', label: 'Em Trânsito / Solicitação efetuada' }
                    ]}
                  />

                  <FormInput 
                    label="Ministérios Ativos na Igreja Local" 
                    value={colabForm.ministerios_ativos} 
                    onChange={(val: any) => setColabForm({...colabForm, ministerios_ativos: val})} 
                    placeholder="Ex: Louvor e Adoração, Escola Dominical, Ação Social" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Histórico de Funções Eclesiásticas Anteriores</label>
                  <textarea 
                    rows={3}
                    value={colabForm.funcoes_anteriores} 
                    onChange={(e) => setColabForm({...colabForm, funcoes_anteriores: e.target.value})}
                    placeholder="Liderança de mocidade, diaconato, ministração de salas teológicas, pastoreio de filiais anteriores..."
                    className="input-futuristic w-full rounded-2xl p-3 text-xs font-bold text-slate-700 outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* SUB-TAB 4: GESTÃO CORPORATIVA & DOCUMENTOS */}
            {modalSubTab === 'documentos' && (
              <div className="space-y-5 animate-entrance">
                
                {/* PERFIL DE ACESSO */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Shield size={14} className="text-indigo-600" /> Perfil de Acesso no Sistema Corporativo
                  </label>
                  <FormSelect 
                    label="Nível / Perfil de Autenticação" 
                    value={colabForm.perfil_acesso} 
                    onChange={(val: any) => setColabForm({...colabForm, perfil_acesso: val})} 
                    options={[
                      { value: 'admin', label: 'Administrador Completo (Acesso irrestrito a RH, Contatos e Folha)' },
                      { value: 'tesoureiro_dp', label: 'Tesoureiro de DP / Operador Financeiro da Folha' },
                      { value: 'visualizador_comum', label: 'Visualizador Comum / Leitura de holerites e contatos simples' }
                    ]}
                  />
                </div>

                {/* ANEXOS / DOCUMENTOS */}
                <div className="space-y-3.5">
                  <h4 className="text-[11px] font-black text-indigo-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-indigo-100 pb-2">
                    <Paperclip size={14} /> Anexar Contratos, recomendação e identificações
                  </h4>

                  {/* Attachment Form */}
                  <div className="p-4 bg-indigo-50/20 border border-indigo-100/50 rounded-2xl space-y-3">
                    <p className="text-[10px] text-slate-500 font-bold">
                      Selecione arquivos ou digite a referência oficial do arquivo físico guardado na secretaria:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <FormInput 
                        label="Nome Fantasia do Arquivo" 
                        placeholder="Ex: Contrato_Trabalho_Roberto.pdf" 
                        value={tempDocName}
                        onChange={(val: any) => setTempDocName(val)}
                        className="!mb-0"
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Categoria</label>
                          <select
                            value={tempDocType}
                            onChange={(e) => setTempDocType(e.target.value)}
                            className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs font-bold text-slate-700 outline-hidden focus:border-indigo-500"
                          >
                            <option value="Contrato de Trabalho">Contrato de Trabalho</option>
                            <option value="Carta de Recomendação">Carta de Recomendação</option>
                            <option value="Documento de Identidade">Documento de Identidade</option>
                            <option value="Ata de Posse / Nomeação">Ata de Posse / Nomeação</option>
                            <option value="Exame Médico Admissional">Exame Médico Admissional</option>
                            <option value="Ficha Cadastral Impressa">Ficha Cadastral Impressa</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!tempDocName.trim()) {
                              addToast('Digite o nome do documento para simular o anexo.', 'error');
                              return;
                            }
                            const formattedName = tempDocName.trim().endsWith('.pdf') ? tempDocName.trim() : `${tempDocName.trim()}.pdf`;
                            const newDoc = {
                              id: `doc_${Date.now()}`,
                              nome: formattedName,
                              data: new Date().toISOString().split('T')[0],
                              tipo: tempDocType
                            };
                            setColabForm({
                              ...colabForm,
                              documentos: [...(colabForm.documentos || []), newDoc]
                            });
                            setTempDocName('');
                            addToast(`Documento "${formattedName}" anexado com sucesso!`, 'success');
                          }}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 shadow-lg shadow-indigo-600/20 active:translate-y-px transition-all"
                        >
                          Anexar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Loaded attachments list */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Documentos Arquivados ({(colabForm.documentos || []).length})</label>
                    {(colabForm.documentos || []).length === 0 ? (
                      <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <p className="text-[11px] text-slate-405 font-bold">Nenhum documento anexado a este colaborador ainda.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                        {(colabForm.documentos || []).map((docFile: any) => (
                          <div key={docFile.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText size={16} className="text-indigo-600 shrink-0" />
                              <div className="overflow-hidden">
                                <p className="text-xs font-black text-slate-700 truncate">{docFile.nome}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{docFile.tipo} • {docFile.data}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setColabForm({
                                  ...colabForm,
                                  documentos: (colabForm.documentos || []).filter((d: any) => d.id !== docFile.id)
                                });
                                addToast('Anexo removido.', 'info');
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-55 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Remover Anexo"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 5: BENEFÍCIOS RECORRENTES */}
            {modalSubTab === 'beneficios' && (
              <div className="space-y-4 animate-entrance">
                <div className="p-4 bg-amber-50/40 border border-amber-200/50 rounded-2xl flex items-start gap-3">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-200 rounded-xl text-amber-650 shrink-0 select-none">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider mb-1">
                      Gestão de Benefícios Recorrentes
                    </h4>
                    <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                      Os valores fixados aqui serão ativados e adicionados como <strong>proventos adicionais automáticos</strong> toda vez que você gerar a folha de pagamento de um mês para este colaborador.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2.5xl space-y-4">
                  <div className="border-b border-slate-205 pb-2 mb-2">
                    <h5 className="text-[10px] font-black text-slate-400 shortcut-label uppercase tracking-widest">Plano Mensal de Adições & Benefícios</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                    <FormInput 
                      label="Auxílio Moradia Clerical / Habitação (R$)" 
                      placeholder="Valor fixo mensal" 
                      value={colabForm.beneficio_auxilio_moradia || ''}
                      onChange={(val: any) => setColabForm({...colabForm, beneficio_auxilio_moradia: val})}
                    />
                    <FormInput 
                      label="Vale Transporte (VT) Pago (R$)" 
                      placeholder="Valor fixo mensal" 
                      value={colabForm.beneficio_vale_transporte || ''}
                      onChange={(val: any) => setColabForm({...colabForm, beneficio_vale_transporte: val})}
                    />
                    <FormInput 
                      label="Vale Refeição / Alimentação (VR/VA) (R$)" 
                      placeholder="Valor fixo mensal" 
                      value={colabForm.beneficio_vale_refeicao || ''}
                      onChange={(val: any) => setColabForm({...colabForm, beneficio_vale_refeicao: val})}
                    />
                    <FormInput 
                      label="Ajuda de Custo Ministerial / Social (R$)" 
                      placeholder="Valor fixo mensal" 
                      value={colabForm.beneficio_ajuda_custo || ''}
                      onChange={(val: any) => setColabForm({...colabForm, beneficio_ajuda_custo: val})}
                    />
                    <div className="md:col-span-2">
                      <FormInput 
                        label="Cota de Plano de Saúde ou Subsídio Médico (R$)" 
                        placeholder="Valor fixo mensal" 
                        value={colabForm.beneficio_plano_saude || ''}
                        onChange={(val: any) => setColabForm({...colabForm, beneficio_plano_saude: val})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 6: FÉRIAS & AFASTAMENTOS */}
            {modalSubTab === 'ferias' && (
              <div className="space-y-4 animate-entrance">
                <div className="p-4 bg-emerald-50/40 border border-emerald-200/55 rounded-2xl flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-200 rounded-xl text-emerald-650 shrink-0 select-none">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">
                      Escalas de Férias e Licenças
                    </h4>
                    <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                      Gerencie e agende os períodos de recesso e afastamento remunerado ou especial. Colaboradores ativamente afastados exibirão um status visual na listagem principal.
                    </p>
                  </div>
                </div>

                {/* Form to insert quick holiday/leave */}
                <div className="p-4 bg-white border border-slate-205 rounded-2xl space-y-3 shadow-inner bg-slate-50/10">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 flex justify-between items-center">
                    <span>Agendar Nova Vigência</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Data de Início</label>
                      <input 
                        type="date" 
                        value={tempVacationStart}
                        onChange={(e) => setTempVacationStart(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 md:p-2.5 text-xs font-bold text-slate-700 outline-hidden focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Data de Término</label>
                      <input 
                        type="date" 
                        value={tempVacationEnd}
                        onChange={(e) => setTempVacationEnd(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 md:p-2.5 text-xs font-bold text-slate-700 outline-hidden focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Tipo de Vigência</label>
                      <select
                        value={tempVacationType}
                        onChange={(e) => setTempVacationType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-705 outline-hidden focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Férias Regulares">Férias Regulares</option>
                        <option value="Recesso Pastoral">Recesso Pastoral</option>
                        <option value="Licença Comunidade">Licença Comunidade</option>
                        <option value="Licença Saúde">Licença Saúde</option>
                        <option value="Licença Maternidade/Paternidade">Licença Maternidade/Paternidade</option>
                        <option value="Licença de Casamento (Gala)">Licença de Casamento (Gala)</option>
                        <option value="Afastamento sem Remuneração">Afastamento sem Vencimento</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!tempVacationStart || !tempVacationEnd) {
                          addToast('As datas de vigência são obrigatórias.', 'warning');
                          return;
                        }
                        if (new Date(tempVacationStart) > new Date(tempVacationEnd)) {
                          addToast('A data de término não pode ser anterior ao início.', 'error');
                          return;
                        }
                        const newVac = {
                          id: `vac_${Date.now()}`,
                          inicio: tempVacationStart,
                          fim: tempVacationEnd,
                          tipo: tempVacationType,
                          criado: new Date().toISOString().split('T')[0]
                        };
                        setColabForm({
                          ...colabForm,
                          ferias_lista: [...(colabForm.ferias_lista || []), newVac]
                        });
                        setTempVacationStart('');
                        setTempVacationEnd('');
                        addToast(`Período de "${tempVacationType}" registrado na lista! Lembre-se de salvar a ficha.`, 'success');
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/10 cursor-pointer transition-colors"
                    >
                      Registrar Vigência
                    </button>
                  </div>
                </div>

                {/* List vacation history */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Períodos na Ficha ({(colabForm.ferias_lista || []).length})</label>
                  {(colabForm.ferias_lista || []).length === 0 ? (
                    <div className="text-center p-6 border border-dashed border-slate-205 rounded-2xl bg-slate-50/40">
                      <p className="text-[11px] text-slate-400 font-bold">Nenhum recesso ou afastamento agendado para o colaborador.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                      {[...(colabForm.ferias_lista || [])].reverse().map((vac: any) => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const isActive = todayStr >= vac.inicio && todayStr <= vac.fim;
                        const isPast = todayStr > vac.fim;
                        return (
                          <div key={vac.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`p-2.5 rounded-xl ${isActive ? 'bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100 animate-pulse' : isPast ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50/60 text-indigo-700'}`}>
                                <Calendar size={14} />
                              </div>
                              <div className="overflow-hidden">
                                <span className={`inline-block text-[8px] font-black px-1.5 py-0.2 rounded uppercase mb-0.5 ${isActive ? 'bg-emerald-100 text-emerald-800' : isPast ? 'bg-slate-200 text-slate-500' : 'bg-indigo-50 text-indigo-700'}`}>
                                  {isActive ? '🌴 Ativo Agora' : isPast ? 'Arquivado / Passado' : 'Agendado'}
                                </span>
                                <p className="text-xs font-black text-slate-700 truncate">{vac.tipo}</p>
                                <p className="text-[10px] text-slate-400 font-black">
                                  {new Date(vac.inicio + 'T12:00:00').toLocaleDateString('pt-BR')} &rarr; {new Date(vac.fim + 'T12:00:00').toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setColabForm({
                                  ...colabForm,
                                  ferias_lista: (colabForm.ferias_lista || []).filter((v: any) => v.id !== vac.id)
                                });
                                addToast('Vigência deletada da ficha.', 'info');
                              }}
                              className="p-1 px-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Remover Período"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 7: HISTÓRICO SALARIAL / AUDITORIA */}
            {modalSubTab === 'historico_salarial' && (
              <div className="space-y-4 animate-entrance">
                <div className="p-4 bg-indigo-50/40 border border-indigo-200/50 rounded-2xl flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-500/10 border border-indigo-200 rounded-xl text-indigo-650 shrink-0 select-none">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                      Linha do Tempo de Revisão Salarial (Auditoria)
                    </h4>
                    <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                      Painel automatizado de conformidade. Registros automáticos e transparentes são gerados para auditoria fiscal sempre que a base salarial sofrer alteração na ficha principal.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Histórico de Alterações de Salário ({(colabForm.historico_salarial || []).length})</label>
                  {(colabForm.historico_salarial || []).length === 0 ? (
                    <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 animate-entrance">
                      <p className="text-[11px] text-slate-400 font-bold">Nenhum evento de reajuste detectado. O salário atual representa o valor de contratação.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl bg-white divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
                      {[...(colabForm.historico_salarial || [])].reverse().map((hist: any, index: number) => {
                        const percent = hist.anterior > 0 ? ((hist.novo - hist.anterior) / hist.anterior) * 100 : 0;
                        return (
                          <div key={hist.id || index} className="p-3.5 hover:bg-slate-50/40 transition-colors flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-indigo-650 font-black font-mono">
                                {hist.data ? new Date(hist.data + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                              </p>
                              <p className="text-xs font-black text-slate-700 mt-0.5">{hist.motivo}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold mt-1">
                                <span>De: {formatBRL(hist.anterior)}</span>
                                <span className="text-slate-350">&rarr;</span>
                                <span className="text-emerald-600 font-extrabold">Para: {formatBRL(hist.novo)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              {percent > 0 ? (
                                <span className="inline-block text-[10px] font-black bg-emerald-50 border border-emerald-250 text-emerald-700 px-2.5 py-0.5 rounded-lg">
                                  +{percent.toFixed(1)}% Ajuste
                                </span>
                              ) : percent < 0 ? (
                                <span className="inline-block text-[10px] font-black bg-rose-50 border border-rose-220 text-rose-700 px-2.5 py-0.5 rounded-lg">
                                  {percent.toFixed(1)}% Redução
                                </span>
                              ) : (
                                <span className="inline-block text-[10px] font-black bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-0.5 rounded-lg">
                                  Registrado
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

          </form>
        </InteractiveWindow>,
        document.body
      )}


      {/* --- INTEGRADO IMPORT FROM REGISTERED MEMBERS MODAL --- */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-entrance">
          <div className="bg-white rounded-3xl border border-slate-250 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="bg-indigo-600 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-1.5">
                <UserCheck size={18} />
                <h3 className="font-black text-sm uppercase tracking-wider">Importar Cooperador de Membros</h3>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-indigo-50 border-b border-indigo-100 text-xs text-indigo-700 leading-relaxed shrink-0">
              Esta aba lista membros batizados da igreja ou cargos eclesiásticos que ainda não são cooperadores no Departamento Pessoal. Clique em qualquer registro para carregar seus dados no formulário automaticamente.
            </div>

            <div className="p-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <Search size={14} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome ou cargo do membro geral..." 
                  value={importSearch}
                  onChange={(e) => setImportSearch(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-transparent outline-hidden"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {nonImportedMembers.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 italic">
                  Nenhum membro passível para conversão foi localizado com a consulta do filtro.
                </div>
              ) : (
                nonImportedMembers.map((m: any) => (
                  <div 
                    key={m.id} 
                    onClick={() => handleImportMember(m)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl cursor-pointer flex justify-between items-center transition-colors group"
                  >
                    <div>
                      <h4 className="text-xs font-black text-slate-700 group-hover:text-indigo-600 transition-colors">{m.nome}</h4>
                      <p className="text-[10px] text-slate-400 uppercase mt-0.5 font-bold">
                        {m.cargo || 'Membro Comum'} • CPF: {safeText(m.cpf, 'Sem CPF')}
                      </p>
                    </div>
                    <span className="text-[10px] bg-white border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-500 font-extrabold px-3 py-1 rounded-lg">
                      Importar
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right shrink-0">
              <button 
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-slate-205 hover:bg-slate-300 text-xs text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Fechar Painel
              </button>
            </div>

          </div>
        </div>
      )}


      {/* --- CONFIRM DELETE COLABORADOR / ENVIAR HISTÓRICO PARA LIXEIRA --- */}
      {colabToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4 animate-entrance">
          <div className="bg-white rounded-3xl border border-slate-250 shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="bg-rose-600 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-1.5">
                <Trash2 size={18} />
                <h3 className="font-black text-sm uppercase tracking-wider font-sans">Confirmar Exclusão</h3>
              </div>
              <button 
                type="button"
                onClick={() => setColabToDelete(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-center">
              <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-black text-slate-800">Enviar para a Lixeira?</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Deseja realmente mover o colaborador <strong className="text-rose-600 font-black">{colabToDelete.nome}</strong> para a lixeira?
                </p>
                <p className="text-[10px] text-slate-400 font-bold bg-slate-50/70 py-1.5 px-3 rounded-lg border border-slate-100">
                  Esta ação desativará o colaborador e o ocultará do painel principal, mas você poderá restaurá-lo a qualquer momento aplicando o filtro de Lixeira.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
              <button 
                type="button"
                onClick={() => setColabToDelete(null)}
                className="px-4 py-2 bg-white border border-slate-250 hover:bg-slate-50 text-xs text-slate-600 font-bold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={confirmDeleteColaborador}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl cursor-pointer shadow-lg shadow-rose-600/20 active:translate-y-px transition-all"
              >
                Sim, Enviar para Lixeira
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ADD / EDIT CONTRATO JURIDICO --- */}
      {showContratoModal && createPortal(
        <InteractiveWindow
          id="modal_contrato_juridico"
          title={editingContrato ? 'Editar Termo Contratual' : 'Elaborar Novo Contrato de Pessoal'}
          subtitle="Compliance Geral e Regulamento Trabalhista CLT & Voluntariado"
          onClose={() => setShowContratoModal(false)}
          icon={Scale}
          headerBg="from-indigo-650 via-indigo-700 to-indigo-850"
          defaultWidth={700}
          defaultHeight={620}
          footer={
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                * Assegura validade jurídica aos arquivos de DP
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowContratoModal(false)}
                  className="border border-slate-200 bg-white cursor-pointer text-xs"
                >
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    if (!contratoForm.titulo) {
                      addToast('Insira o título ou objeto do contrato!', 'error');
                      return;
                    }
                    if (editingContrato) {
                      setContratos(prev => prev.map(item => item.id === editingContrato.id ? { ...item, ...contratoForm } : item));
                      addToast('Contrato alterado com sucesso!', 'success');
                    } else {
                      const newId = 'c_' + Math.random().toString(36).substr(2, 9);
                      setContratos(prev => [{ id: newId, ...contratoForm }, ...prev]);
                      addToast('Ficha de Contrato criada com sucesso!', 'success');
                    }
                    setShowContratoModal(false);
                  }}
                  className="shadow-sm cursor-pointer flex items-center gap-2 text-xs"
                >
                  Confirmar e Salvar
                </Button>
              </div>
            </div>
          }
        >
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Objeto / Título do Contrato</label>
                <input 
                  type="text"
                  placeholder="Ex: Contrato Admissão CLT, Prorrogação de Horas..."
                  value={contratoForm.titulo}
                  onChange={(e) => setContratoForm({ ...contratoForm, titulo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs text-slate-700 outline-hidden font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Tipo de Contrato / Termo</label>
                <select
                  value={contratoForm.tipo}
                  onChange={(e) => setContratoForm({ ...contratoForm, tipo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs text-slate-650 font-semibold cursor-pointer outline-hidden"
                >
                  <option value="Contrato de Trabalho CLT">Contrato de Trabalho CLT</option>
                  <option value="Contrato de Prestação de Serviço">Contrato de Prestação de Serviço</option>
                  <option value="Termo de Voluntariado">Termo de Voluntariado (Lei 9.608)</option>
                  <option value="Termo de Compromisso de Estágio">Termo de Compromisso de Estágio</option>
                  <option value="Acordo Coletivo de Trabalho">Acordo Coletivo de Trabalho</option>
                  <option value="Estatuto de Ministro Religioso">Estatuto de Ministro Religioso (Clero)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Vincular Colaborador do DP (Opcional)</label>
                <select
                  value={contratoForm.colaborador_id}
                  onChange={(e) => setContratoForm({ ...contratoForm, colaborador_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs text-slate-650 font-semibold cursor-pointer outline-hidden"
                >
                  <option value="">--- Nenhum (Termo Geral / Coletivo) ---</option>
                  {colaboradores.map((col: any) => (
                    <option key={col.id} value={col.id}>{col.nome} ({col.cargo || 'DP'})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Valor Mensal / Global (BRL)</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  value={contratoForm.valor || ''}
                  onChange={(e) => setContratoForm({ ...contratoForm, valor: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs text-slate-705 font-mono outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Início do Termo</label>
                <input 
                  type="date"
                  value={contratoForm.data_inicio}
                  onChange={(e) => setContratoForm({ ...contratoForm, data_inicio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs text-slate-700 outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Fim do Termo (Opcional)</label>
                <input 
                  type="date"
                  value={contratoForm.data_fim || ''}
                  onChange={(e) => setContratoForm({ ...contratoForm, data_fim: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs text-slate-700 outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Status Atual</label>
                <select
                  value={contratoForm.status}
                  onChange={(e) => setContratoForm({ ...contratoForm, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs text-slate-650 font-bold cursor-pointer outline-hidden"
                >
                  <option value="ativo">Vigente / Ativo</option>
                  <option value="rascunho">Minuta / Rascunho</option>
                  <option value="vencido">Cancelado / Expirado</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 py-1">
              <input 
                type="checkbox"
                id="check_assinado_digital"
                checked={contratoForm.assinado_digital}
                onChange={(e) => setContratoForm({ ...contratoForm, assinado_digital: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-slate-305 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="check_assinado_digital" className="text-xs font-semibold text-slate-600 outline-hidden cursor-pointer select-none">
                Este contrato foi assinado digitalmente por Token ICP / Assinatura Web?
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-400 font-bold uppercase">Cláusulas e Termos Legais</label>
              <textarea 
                rows={4}
                value={contratoForm.clausulas}
                onChange={(e) => setContratoForm({ ...contratoForm, clausulas: e.target.value })}
                className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs text-slate-700 outline-hidden font-mono leading-relaxed"
                placeholder="Insira as cláusulas contratuais correspondentes de amparo..."
              />
            </div>
          </div>
        </InteractiveWindow>,
        document.body
      )}

      {/* --- MODAL ADD / EDIT PROCESSO TRABALHISTA/CIVEL --- */}
      {showProcessoModal && createPortal(
        <InteractiveWindow
          id="modal_processo_juridico"
          title={editingProcesso ? 'Editar Ficha Processual' : 'Cadastrar Processo / Contencioso Trabalhista'}
          subtitle="Controle Integrado de Demandas Judiciais e Prevenção de Passivos"
          onClose={() => setShowProcessoModal(false)}
          icon={Scale}
          headerBg="from-rose-650 via-rose-700 to-rose-850"
          defaultWidth={700}
          defaultHeight={620}
          footer={
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] text-rose-500 font-black uppercase">
                ⚠️ Mantenha os históricos atualizados para a DCTFWeb
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowProcessoModal(false)}
                  className="border border-slate-200 bg-white cursor-pointer text-xs"
                >
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    if (!processoForm.numero || !processoForm.titulo) {
                      addToast('Insira número único e o título do processo!', 'error');
                      return;
                    }
                    if (editingProcesso) {
                      setProcessos(prev => prev.map(item => item.id === editingProcesso.id ? { ...item, ...processoForm } : item));
                      addToast('Ficha de processo alterada!', 'success');
                    } else {
                      const newId = 'p_' + Math.random().toString(36).substr(2, 9);
                      setProcessos(prev => [{ id: newId, ...processoForm }, ...prev]);
                      addToast('Andamento de Processo criado com sucesso!', 'success');
                    }
                    setShowProcessoModal(false);
                  }}
                  className="shadow-sm cursor-pointer flex items-center gap-2 text-xs bg-rose-600 border border-rose-500 hover:bg-rose-700"
                >
                  Salvar Ficha Processual
                </Button>
              </div>
            </div>
          }
        >
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Número Único do Processo (CNJ)</label>
                <input 
                  type="text"
                  placeholder="Ex: 0010245-89.2026.5.02.0001"
                  value={processoForm.numero}
                  onChange={(e) => setProcessoForm({ ...processoForm, numero: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs text-slate-700 outline-hidden font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Objeto Principal da Ação</label>
                <input 
                  type="text"
                  placeholder="Ex: Horas Extras, Equiparação Salarial..."
                  value={processoForm.titulo}
                  onChange={(e) => setProcessoForm({ ...processoForm, titulo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs text-slate-700 outline-hidden font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Autor da Causa (Reclamante)</label>
                <input 
                  type="text"
                  placeholder="Ex: Nome do Funcionário ou Orgão Fiscal"
                  value={processoForm.autor}
                  onChange={(e) => setProcessoForm({ ...processoForm, autor: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs text-indigo-900 outline-hidden font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Réu da Causa (Reclamado)</label>
                <input 
                  type="text"
                  placeholder="Ex: Instituição Sede / Matriz"
                  value={processoForm.reu}
                  onChange={(e) => setProcessoForm({ ...processoForm, reu: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs text-slate-700 outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Tipo de Processo</label>
                <select
                  value={processoForm.tipo}
                  onChange={(e) => setProcessoForm({ ...processoForm, tipo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs text-slate-650 font-semibold cursor-pointer outline-hidden"
                >
                  <option value="trabalhista">Justiça do Trabalho</option>
                  <option value="civel">Justiça Comum / Cível</option>
                  <option value="tributario">Administrativo / Tributário</option>
                  <option value="outros">Outros Juízos</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Valor da Causa (BRL)</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  value={processoForm.valor_causa || ''}
                  onChange={(e) => setProcessoForm({ ...processoForm, valor_causa: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs text-slate-705 font-mono outline-hidden font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Status do Andamento</label>
                <select
                  value={processoForm.status}
                  onChange={(e) => setProcessoForm({ ...processoForm, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs text-slate-650 font-bold cursor-pointer outline-hidden"
                >
                  <option value="andamento">Fase de Instrução / Em Curso</option>
                  <option value="acordo">Fechado em Acordo / Conciliação</option>
                  <option value="arquivado">Julgado / Concluído e Arquivado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Data de Distribuição</label>
                <input 
                  type="date"
                  value={processoForm.data_entrada}
                  onChange={(e) => setProcessoForm({ ...processoForm, data_entrada: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs text-slate-700 outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Próxima Audiência (Data/Hora)</label>
                <input 
                  type="text"
                  placeholder="Ex: 15/09/2026 13:30 (Opcional)"
                  value={processoForm.proxima_audiencia}
                  onChange={(e) => setProcessoForm({ ...processoForm, proxima_audiencia: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs text-amber-700 outline-hidden font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-400 font-bold uppercase">Última Movimentação Relevante</label>
              <input 
                type="text"
                placeholder="Ex: Audiência de instrução designada para..."
                value={processoForm.ultima_movimentacao}
                onChange={(e) => setProcessoForm({ ...processoForm, ultima_movimentacao: e.target.value })}
                className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs text-slate-700 outline-hidden font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-400 font-bold uppercase">Histórico e Observações</label>
              <textarea 
                rows={3}
                value={processoForm.descricao}
                onChange={(e) => setProcessoForm({ ...processoForm, descricao: e.target.value })}
                className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs text-slate-700 outline-hidden font-semibold leading-relaxed"
                placeholder="Insira detalhes adicionais do andamento processual, prepostos ou advogados..."
              />
            </div>
          </div>
        </InteractiveWindow>,
        document.body
      )}

      {/* MODAL PLANO DE CONTAS */}
      {showContaModal && (
        <InteractiveWindow
          title={editingConta ? "Editar Conta Contábil" : "Nova Conta Contábil"}
          onClose={() => setShowContaModal(false)}
          onSave={() => {
            if (!contaForm.codigo || !contaForm.nome) {
              addToast('Por favor, preencha o código e o nome da conta contábil.', 'error');
              return;
            }
            if (editingConta) {
              setPlanoDeContas(prev => prev.map(item => item.id === editingConta.id ? { ...item, ...contaForm } : item));
              addToast('Conta contábil atualizada com sucesso!', 'success');
            } else {
              const novaObj = {
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
                ...contaForm
              };
              setPlanoDeContas(prev => [...prev, novaObj]);
              addToast('Conta contábil cadastrada com sucesso!', 'success');
            }
            setShowContaModal(false);
          }}
          saveLabel={editingConta ? "Salvar Alterações" : "Adicionar Conta"}
        >
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Código de Classificação (Estrutural)</label>
                <input 
                  type="text"
                  placeholder="Ex: 1.1.01.002"
                  value={contaForm.codigo}
                  onChange={(e) => setContaForm({ ...contaForm, codigo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-705 font-mono outline-hidden font-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Grupo de Contas</label>
                <select
                  value={contaForm.grupo}
                  onChange={(e) => setContaForm({ ...contaForm, grupo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-650 font-bold cursor-pointer outline-hidden"
                >
                  <option value="Ativo Circulante">Ativo Circulante</option>
                  <option value="Ativo Não Circulante">Ativo Não Circulante</option>
                  <option value="Passivo Circulante">Passivo Circulante</option>
                  <option value="Receita Operacional">Receita Operacional</option>
                  <option value="Despesa Operacional">Despesa Operacional</option>
                  <option value="Gastos Administrativos">Gastos Administrativos</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-400 font-bold uppercase">Nome da Conta Contábil</label>
              <input 
                type="text"
                placeholder="Ex: Caixa Geral da Sede / Dízimos e Ofertas"
                value={contaForm.nome}
                onChange={(e) => setContaForm({ ...contaForm, nome: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-755 font-bold outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Natureza do Saldo</label>
                <select
                  value={contaForm.tipo}
                  onChange={(e) => setContaForm({ ...contaForm, tipo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-650 font-semibold cursor-pointer outline-hidden"
                >
                  <option value="Devedora">Devedora</option>
                  <option value="Credora">Credora</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Saldo Atual (BRL)</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  value={contaForm.saldo || ''}
                  onChange={(e) => setContaForm({ ...contaForm, saldo: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-705 font-mono outline-hidden font-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Estado de Funcionamento</label>
                <select
                  value={contaForm.status}
                  onChange={(e) => setContaForm({ ...contaForm, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-650 font-bold cursor-pointer outline-hidden"
                >
                  <option value="ativo">Conta Ativa (Disponível)</option>
                  <option value="inativo">Conta Inativa (Ocultar)</option>
                </select>
              </div>
            </div>
          </div>
        </InteractiveWindow>
      )}

      {/* MODAL EVENTO SST */}
      {showSstModal && (
        <InteractiveWindow
          title="Emitir Registro de Saúde e Segurança (eSocial)"
          onClose={() => setShowSstModal(false)}
          onSave={() => {
            if (!sstForm.colaborador || !sstForm.tipo) {
              addToast('Selecione ou insira o nome do colaborador e o tipo de exame.', 'error');
              return;
            }
            const novoObj = {
              id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
              status: 'pendente',
              ...sstForm
            };
            setSstExames(prev => [novoObj, ...prev]);
            addToast('Registro de Saúde Ocupacional inserido na fila de envios.', 'success');
            setShowSstModal(false);
          }}
          saveLabel="Adicionar na Fila"
        >
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-400 font-bold uppercase">Nome do Colaborador / Sede</label>
              <input 
                type="text"
                placeholder="Ex: Pastor Marcos Silva ou 'Consolidado da Sede'"
                value={sstForm.colaborador}
                onChange={(e) => setSstForm({ ...sstForm, colaborador: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-755 font-bold outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Tipo de Atendimento / Evento</label>
                <select
                  value={sstForm.tipo}
                  onChange={(e) => {
                    const val = e.target.value;
                    let ev = 'S-2220';
                    let r = 'Ausência de riscos';
                    if (val.includes('CAT')) { ev = 'S-2210'; r = 'Acidente registrado'; }
                    else if (val.includes('LTCAT')) { ev = 'S-2240'; r = 'Fatores de risco detalhados no LTCAT'; }
                    setSstForm({ ...sstForm, tipo: val, evento: ev, riscos: r });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-650 font-bold cursor-pointer outline-hidden"
                >
                  <option value="Admissional">Exame Admissional (ASO)</option>
                  <option value="Periódico">Exame Periódico (ASO)</option>
                  <option value="Demissional">Exame Demissional (ASO)</option>
                  <option value="Mudança de Função">Retorno ao Trabalho / Função</option>
                  <option value="Comunicação de CAT">Comunicação de CAT (Acidente S-2210)</option>
                  <option value="Avaliação de Risco (LTCAT)">Atualização LTCAT / Agentes Nocivos (S-2240)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Código do Evento eSocial</label>
                <input 
                  type="text"
                  readOnly
                  disabled
                  value={sstForm.evento}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-500 font-bold font-mono outline-hidden select-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Data do Resultado / Exame</label>
                <input 
                  type="date"
                  value={sstForm.data}
                  onChange={(e) => setSstForm({ ...sstForm, data: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-hidden font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Resultado do Exame / Status</label>
                <select
                  value={sstForm.resultado}
                  onChange={(e) => setSstForm({ ...sstForm, resultado: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-650 font-bold cursor-pointer outline-hidden"
                >
                  <option value="Apto">Apto (Saúde Ocupacional OK)</option>
                  <option value="Inapto">Inapto (Restrições Detectadas)</option>
                  <option value="Conforme">Conforme (Inspeção Ambiental)</option>
                  <option value="Notificado">Notificado (Evento CAT Aberto)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Médico Examinador ou Responsável</label>
                <input 
                  type="text"
                  placeholder="Ex: Dr. Roberto Cruz - CRM/SP 123456"
                  value={sstForm.medico}
                  onChange={(e) => setSstForm({ ...sstForm, medico: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-755 font-bold outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-400 font-bold uppercase">Descrição da Causa / Agentes Nocivos Detalhados</label>
              <textarea 
                rows={2}
                value={sstForm.riscos}
                onChange={(e) => setSstForm({ ...sstForm, riscos: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-hidden font-medium leading-relaxed"
                placeholder="Insira os agentes identificados (químicos, físicos, biológicos) ou causa do acidente..."
              />
            </div>
          </div>
        </InteractiveWindow>
      )}

      {/* MODAL CONTROLE DE PONTO */}
      {showPontoModal && (
        <InteractiveWindow
          title="Informar Registro de Ponto Avulso"
          onClose={() => setShowPontoModal(false)}
          onSave={() => {
            if (!pontoForm.colaborador || !pontoForm.data) {
              addToast('Por favor, preencha o colaborador e a data do ponto.', 'error');
              return;
            }
            // Calculate a beautiful hours string based on entrance/exit
            const ent = pontoForm.entrada || "08:00";
            const sai = pontoForm.saida || "17:00";
            const [h1, m1] = ent.split(':').map(Number);
            const [h2, m2] = sai.split(':').map(Number);
            let diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (diffMins < 0) diffMins += 24 * 60; // handle wrap around
            // subtract 1 hour for lunch if shift is larger than 6 hours
            if (diffMins > 360) diffMins -= 60;
            const diffHoursDecimal = diffMins / 60;
            const formattedHours = `${String(Math.floor(diffHoursDecimal)).padStart(2, '0')}:${String(Math.round((diffHoursDecimal % 1) * 60)).padStart(2, '0')} (Regular)`;

            const novoObj = {
              id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
              colaborador: pontoForm.colaborador,
              data: pontoForm.data,
              entrada: ent,
              saida: sai,
              horas: formattedHours,
              status: 'Regular'
            };
            setPontoPunches(prev => [novoObj, ...prev]);
            addToast('Registro de ponto e jornada salvo e enviado ao eSocial Fase 4!', 'success');
            setShowPontoModal(false);
          }}
          saveLabel="Salvar Registro"
        >
          <div className="space-y-4 py-2 text-left">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-slate-400 font-bold uppercase">Nome do Colaborador (Obreiro, Pastor, Funcionário)</label>
              <input 
                type="text"
                placeholder="Ex: Pastor Marcos Silva ou Pra. Débora Souza"
                value={pontoForm.colaborador}
                onChange={(e) => setPontoForm({ ...pontoForm, colaborador: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-755 font-bold outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Data do Ponto</label>
                <input 
                  type="date"
                  value={pontoForm.data}
                  onChange={(e) => setPontoForm({ ...pontoForm, data: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-hidden font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Hora de Entrada</label>
                <input 
                  type="time"
                  value={pontoForm.entrada}
                  onChange={(e) => setPontoForm({ ...pontoForm, entrada: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-705 font-mono outline-hidden font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Hora de Saída</label>
                <input 
                  type="time"
                  value={pontoForm.saida}
                  onChange={(e) => setPontoForm({ ...pontoForm, saida: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-705 font-mono outline-hidden font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-[11px] text-slate-550 leading-relaxed">
              <strong className="text-slate-700 block mb-0.5">Nota de Conformidade:</strong>
              As horas de jornada informadas acima serão automaticamente auditadas com o layout do eSocial Fase 4 (SST/Jornadas de Trabalho e Descansos) gerando as assinaturas fiscais A1 necessárias.
            </div>
          </div>
        </InteractiveWindow>
      )}

    </div>
  );
});

export default ModuleDPContabilidade;
