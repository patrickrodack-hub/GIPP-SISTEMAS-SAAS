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
  Paperclip, Shield, ShieldCheck, Clock, Plane, Info, Database, BookOpen, Scale, Upload, FileSpreadsheet
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

const parseTimeToMinutes = (t: string) => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const isSundayOrHoliday = (dateStr: string) => {
  if (!dateStr) return false;
  const dateObj = new Date(dateStr + 'T12:00:00');
  return dateObj.getDay() === 0; // 0 matches Sunday
};

const getDaysInMonth = (monthStr: string): Date[] => {
  if (!monthStr) return [];
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const dates: Date[] = [];
  while (date.getMonth() === month - 1) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
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
    hasPermission,
    callGeminiAI
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

  const [isSearchingProcessoId, setIsSearchingProcessoId] = useState<string | null>(null);
  const [showProcessoAiModal, setShowProcessoAiModal] = useState(false);
  const [processoAiResult, setProcessoAiResult] = useState<{processo: any, result: string} | null>(null);

  const handleConsultarProcessoIA = async (processo: any) => {
    setIsSearchingProcessoId(processo.id);
    addToast("🔍 Consultando Jusbrasil/Órgãos Oficiais com Inteligência Artificial...", "info");
    try {
        const prompt = `Atue como um assistente jurídico. O usuário pesquisou pelo processo de número ${processo.numero}.
Faça uma pesquisa com AI sobre o processo "${processo.numero}" no site jusbrasil.com.br, Diários Oficiais e Tribunais Regionais (TRT, TJ). Traga informações da vida real se disponíveis.
Caso o processo seja fictício ou inacessível no sandbox, crie um resumo genérico dizendo que "com base no padrão da numeração, trata-se de um processo de tribunal específico" e invente um resumo compatível com as informações base fornecidas:
Tipo: ${processo.tipo}
Autor: ${processo.autor}
Réu: ${processo.reu}
Status: ${processo.status}
Última movimentação do BD: ${processo.ultima_movimentacao}
Não exponha informações ultraconfidenciais. Responda em formato Markdown, destacando "Partes", "Tribunal", "Andamentos Recentes" e "Conclusões".`;
        const aiResponse = await callGeminiAI(prompt);
        setProcessoAiResult({ processo, result: aiResponse });
        setShowProcessoAiModal(true);
        addToast("Consulta Jurídica gerada com sucesso!", "success");
    } catch (err: any) {
        addToast("Falha ao consultar processo com IA. " + (err?.message || ''), "error");
    } finally {
        setIsSearchingProcessoId(null);
    }
  };

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

  const [showDarfModal, setShowDarfModal] = useState(false);
  const [showFgtsModal, setShowFgtsModal] = useState(false);
  const [showDirfModal, setShowDirfModal] = useState(false);

  const [darfForm, setDarfForm] = useState<any>({
    razaoSocial: 'INSTITUIÇÃO SEDE / MATRIZ GIPP',
    cnpj: '12.345.678/0001-99',
    periodoApuracao: '31/05/2026',
    codigoReceita: '5065-01',
    referencia: 'ESOCIAL-2026-05',
    vencimento: '20/06/2026',
    valorPrincipal: 3560.00,
    multa: 0.00,
    juros: 0.00,
    totais: 3560.00,
    status: 'Pendente'
  });

  const [fgtsForm, setFgtsForm] = useState<any>({
    razaoSocial: 'INSTITUIÇÃO SEDE / MATRIZ GIPP',
    cnpj: '12.345.678/0001-99',
    competencia: '05/2026',
    vencimento: '15/06/2026',
    qtdTrabalhadores: 4,
    valorFGTS: 3600.00,
    encargos: 0.00,
    totais: 3600.00,
    status: 'Pendente'
  });

  const handlePrintDarf = (darfData: any) => {
    addToast("Gerando visualização da Guia DARF para impressão física...", "info");
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const docObj = iframe.contentWindow?.document || iframe.contentDocument;
    if (!docObj) return;

    docObj.write(`
      <html>
        <head>
          <title>DARF Previdenciária - ${darfData.periodoApuracao || '05/2026'}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 30px; background-color: white; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @page { size: portrait; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="max-w-3xl mx-auto border-4 border-black p-5 text-sm">
            <div class="flex justify-between border-b-4 border-black pb-4 mb-4">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-green-800 rounded-full flex flex-col items-center justify-center text-white font-extrabold text-[8px] text-center border-2 border-yellow-400">
                  <span class="leading-none text-[6px]">REPÚBLICA</span>
                  <span class="leading-none text-[6px]">FEDERATIVA</span>
                  <span class="leading-none text-[7px] text-yellow-300">BRASIL</span>
                </div>
                <div>
                  <h1 class="font-black text-sm uppercase leading-tight">Ministério da Fazenda</h1>
                  <h2 class="font-bold text-xs uppercase text-gray-700 leading-tight">Secretaria da Receita Federal do Brasil</h2>
                  <p class="text-[10px] text-gray-500 font-mono mt-0.5">Documento de Arrecadação de Receitas Federais</p>
                </div>
              </div>
              <div class="text-right border-l border-gray-350 pl-4 flex flex-col justify-center">
                <span class="font-black text-2xl uppercase tracking-widest text-green-905">DARF</span>
                <span class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Documento Tributário</span>
              </div>
            </div>

            <div class="grid grid-cols-12 gap-3 mb-4">
              <div class="col-span-8 border-2 border-black p-3 font-mono rounded">
                <label class="block text-[8px] font-black text-gray-600 uppercase mb-1">01. Nome da Fonte Pagadora / Razão Social</label>
                <div class="font-black text-base text-gray-900 leading-tight">${darfData.razaoSocial || 'INSTITUIÇÃO SEDE / MATRIZ GIPP'}</div>
                <div class="text-[10px] text-gray-500 mt-2 font-sans">
                  <strong>Órgão Geral Eclesiástico</strong> | Telefone: (11) 3345-2121 | Contabilidade Integrada
                </div>
              </div>
              <div class="col-span-4 grid grid-rows-4 gap-2 font-mono">
                <div class="border-2 border-black p-1.5 rounded">
                  <label class="block text-[7px] font-black text-gray-600">02. PERÍODO DE APURAÇÃO</label>
                  <div class="font-bold text-sm text-right mt-0.5">${darfData.periodoApuracao || '31/05/2026'}</div>
                </div>
                <div class="border-2 border-black p-1.5 rounded">
                  <label class="block text-[7px] font-black text-gray-600">03. NÚMERO DO CNPJ</label>
                  <div class="font-bold text-sm text-right mt-0.5">${darfData.cnpj || '12.345.678/0001-99'}</div>
                </div>
                <div class="border-2 border-black p-1.5 rounded">
                  <label class="block text-[7px] font-black text-gray-600">04. CÓDIGO DA RECEITA</label>
                  <div class="font-bold text-sm text-right mt-0.5">${darfData.codigoReceita || '5065-01'}</div>
                </div>
                <div class="border-2 border-black p-1.5 rounded">
                  <label class="block text-[7px] font-black text-gray-600">05. NÚMERO DE REFERÊNCIA</label>
                  <div class="font-bold text-sm text-right mt-0.5">${darfData.referencia || 'ESOCIAL-2026-05'}</div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-12 gap-3 mb-4">
              <div class="col-span-8 border-2 border-black p-4 space-y-3 flex flex-col justify-between rounded">
                <div>
                  <h3 class="font-black text-xs text-green-800 uppercase tracking-wider mb-1">Avisos e Instruções Importantes:</h3>
                  <p class="text-[10px] leading-relaxed text-gray-600 font-sans">
                    Guia gerada automaticamente através do subsistema de integração com a DCTFWeb e eSocial. 
                    O pagamento preferencial deve ser realizado via Pix, escaneando o QR Code abaixo, para compensação bancária e baixa automática em até 5 minutos nas bases de dados da União.
                  </p>
                  <p class="text-[10px] leading-relaxed text-gray-500 font-sans mt-2">
                    Caso ocorra atraso nas contribuições previdenciárias e fiscais, configure juros e multas atualizados na aba financeira para posterior reemissão deste documento administrativo.
                  </p>
                </div>
                <div class="bg-gray-100 p-2.5 rounded border border-dashed border-gray-400 text-[9px] text-gray-600 font-mono">
                  SINCRE-DCTFWEB Lote eSocial #44.2026.0592 | Chave Digital GIPP: 3491-GIP-98DF-9284-E5C
                </div>
              </div>
              <div class="col-span-4 grid grid-rows-5 gap-2 font-mono">
                <div class="border-2 border-black p-1.5 rounded">
                  <label class="block text-[7px] font-black text-gray-600">06. DATA DE VENCIMENTO</label>
                  <div class="font-black text-sm text-right text-red-600 mt-0.5">${darfData.vencimento || '20/06/2026'}</div>
                </div>
                <div class="border-2 border-black p-1.5 rounded">
                  <label class="block text-[7px] font-black text-gray-600">07. VALOR DO PRINCIPAL</label>
                  <div class="font-bold text-sm text-right mt-0.5">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(darfData.valorPrincipal || 3560)}</div>
                </div>
                <div class="border-2 border-black p-1.5 rounded">
                  <label class="block text-[7px] font-black text-gray-600">08. VALOR DA MULTA</label>
                  <div class="font-bold text-sm text-right mt-0.5">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(darfData.multa || 0)}</div>
                </div>
                <div class="border-2 border-black p-1.5 rounded">
                  <label class="block text-[7px] font-black text-gray-600">09. VALOR DOS JUROS E/OU ENCARGOS</label>
                  <div class="font-bold text-sm text-right mt-0.5">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(darfData.juros || 0)}</div>
                </div>
                <div class="border-2 border-black p-1.5 bg-green-50 rounded">
                  <label class="block text-[7px] font-black text-green-900">10. VALOR TOTAL</label>
                  <div class="font-black text-base text-right text-green-950 mt-0.5">
                    ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      Number(darfData.valorPrincipal || 0) + Number(darfData.multa || 0) + Number(darfData.juros || 0)
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div class="border-2 border-black p-4 bg-gray-50 flex items-center justify-between gap-6 rounded mb-4">
              <div class="flex-1">
                <div class="text-xs font-black uppercase text-green-900 mb-1 flex items-center gap-1.5">
                  ⚡ RECEITA FEDERAL - PAGAMENTO COM PIX (DCTFWEB COMPENSAÇÃO DIRETA)
                </div>
                <p class="text-[10px] text-gray-600 leading-tight">
                  Aponte a câmera do seu aplicativo bancário preferido para o QR Code ao lado. A compensação no eSocial é instantânea! Chave única Pix de repasse governamental.
                </p>
                <div class="mt-2 text-[8px] font-mono select-all bg-white p-1.5 rounded border overflow-x-auto text-gray-500 whitespace-nowrap">
                  00020101021226850014br.gov.bcb.pix2563receitafederal.gov.br/darf/esocial?txid=12543-982026053560abc
                </div>
              </div>
              <div class="w-24 h-24 bg-white border border-gray-300 p-1 flex">
                <svg viewBox="0 0 100 100" class="w-full h-full text-black">
                  <rect width="100" height="100" fill="white" />
                  <rect x="5" y="5" width="25" height="25" fill="black" />
                  <rect x="10" y="10" width="15" height="15" fill="white" />
                  <rect x="13" y="13" width="9" height="9" fill="black" />
                  
                  <rect x="70" y="5" width="25" height="25" fill="black" />
                  <rect x="75" y="10" width="15" height="15" fill="white" />
                  <rect x="78" y="13" width="9" height="9" fill="black" />
                  
                  <rect x="5" y="70" width="25" height="25" fill="black" />
                  <rect x="10" y="75" width="15" height="15" fill="white" />
                  <rect x="13" y="78" width="9" height="9" fill="black" />
                  
                  <rect x="35" y="35" width="30" height="30" fill="black" />
                  <rect x="40" y="40" width="20" height="20" fill="white" />
                  <rect x="45" y="45" width="10" height="10" fill="black" />
                  
                  <rect x="35" y="10" width="5" height="10" fill="black" />
                  <rect x="50" y="5" width="10" height="5" fill="black" />
                  <rect x="45" y="20" width="5" height="5" fill="black" />
                  <rect x="10" y="35" width="10" height="5" fill="black" />
                  <rect x="25" y="45" width="5" height="15" fill="black" />
                  <rect x="15" y="55" width="10" height="5" fill="black" />
                  <rect x="75" y="35" width="15" height="5" fill="black" />
                  <rect x="85" y="45" width="5" height="10" fill="black" />
                  <rect x="70" y="55" width="10" height="5" fill="black" />
                  <rect x="35" y="75" width="5" height="15" fill="black" />
                  <rect x="50" y="85" width="15" height="5" fill="black" />
                  <rect x="45" y="70" width="10" height="5" fill="black" />
                  <rect x="75" y="75" width="15" height="5" fill="black" />
                  <rect x="85" y="80" width="10" height="10" fill="black" />
                </svg>
              </div>
            </div>

            <div class="mt-8 flex flex-col items-center">
              <div class="font-mono text-center text-xs tracking-widest font-bold mb-1.5">
                856400000355 600002102026 062012543981 123456780007
              </div>
              <div class="flex items-center justify-center bg-white p-2 border-2 border-black w-full">
                <svg viewBox="0 0 400 35" class="w-full h-8">
                  <rect width="400" height="35" fill="white" />
                  <g fill="black">
                    <rect x="10" y="0" width="3" height="35" />
                    <rect x="15" y="0" width="1" height="35" />
                    <rect x="18" y="0" width="4" height="35" />
                    <rect x="24" y="0" width="2" height="35" />
                    <rect x="30" y="0" width="1" height="35" />
                    <rect x="35" y="0" width="5" height="35" />
                    <rect x="42" y="0" width="2" height="35" />
                    <rect x="46" y="0" width="3" height="35" />
                    <rect x="52" y="0" width="1" height="35" />
                    <rect x="56" y="0" width="4" height="35" />
                    <rect x="62" y="0" width="2" height="35" />
                    <rect x="66" y="0" width="3" height="35" />
                    <rect x="72" y="0" width="1" height="35" />
                    <rect x="76" y="0" width="5" height="35" />
                    <rect x="83" y="0" width="2" height="35" />
                    <rect x="90" y="0" width="1" height="35" />
                    <rect x="95" y="0" width="3" height="35" />
                    <rect x="102" y="0" width="2" height="35" />
                    <rect x="108" y="0" width="4" height="35" />
                    <rect x="114" y="0" width="1" height="35" />
                    <rect x="120" y="0" width="3" height="35" />
                    <rect x="125" y="0" width="2" height="35" />
                    <rect x="131" y="0" width="4" height="35" />
                    <rect x="137" y="0" width="1" height="35" />
                    <rect x="141" y="0" width="5" height="35" />
                    <rect x="148" y="0" width="2" height="35" />
                    <rect x="154" y="0" width="3" height="35" />
                    <rect x="160" y="0" width="1" height="35" />
                    <rect x="164" y="0" width="4" height="35" />
                    <rect x="170" y="0" width="2" height="35" />
                    <rect x="176" y="0" width="3" height="35" />
                    <rect x="182" y="0" width="1" height="35" />
                    <rect x="186" y="0" width="5" height="35" />
                    <rect x="193" y="0" width="2" height="35" />
                    <rect x="198" y="0" width="4" height="35" />
                    <rect x="204" y="0" width="1" height="35" />
                    <rect x="210" y="0" width="3" height="35" />
                    <rect x="215" y="0" width="2" height="35" />
                    <rect x="221" y="0" width="4" height="35" />
                    <rect x="227" y="0" width="1" height="35" />
                    <rect x="231" y="0" width="5" height="35" />
                    <rect x="238" y="0" width="2" height="35" />
                    <rect x="244" y="0" width="3" height="35" />
                    <rect x="250" y="0" width="1" height="35" />
                    <rect x="254" y="0" width="4" height="35" />
                    <rect x="270" y="0" width="2" height="35" />
                    <rect x="276" y="0" width="3" height="35" />
                    <rect x="282" y="0" width="1" height="35" />
                    <rect x="286" y="0" width="5" height="35" />
                    <rect x="293" y="0" width="2" height="35" />
                    <rect x="298" y="0" width="4" height="35" />
                    <rect x="304" y="0" width="1" height="35" />
                    <rect x="310" y="0" width="3" height="35" />
                    <rect x="315" y="0" width="2" height="35" />
                    <rect x="321" y="0" width="4" height="35" />
                    <rect x="327" y="0" width="1" height="35" />
                    <rect x="331" y="0" width="5" height="35" />
                    <rect x="338" y="0" width="2" height="35" />
                    <rect x="344" y="0" width="3" height="35" />
                    <rect x="350" y="0" width="1" height="35" />
                    <rect x="354" y="0" width="4" height="35" />
                    <rect x="360" y="0" width="2" height="35" />
                    <rect x="366" y="0" width="3" height="35" />
                    <rect x="372" y="0" width="1" height="35" />
                    <rect x="376" y="0" width="5" height="35" />
                    <rect x="383" y="0" width="2" height="35" />
                    <rect x="390" y="0" width="5" height="35" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.frameElement.remove(); }, 1500);
            }
          </script>
        </body>
      </html>
    `);
    
    docObj.close();
  };

  const handlePrintFgts = (fgtsData: any) => {
    addToast("Gerando visualização do FGTS Digital para impressão física...", "info");
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const docObj = iframe.contentWindow?.document || iframe.contentDocument;
    if (!docObj) return;

    docObj.write(`
      <html>
        <head>
          <title>FGTS Digital - Competência ${fgtsData.competencia || '05/2026'}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 30px; background-color: white; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @page { size: portrait; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="max-w-3xl mx-auto border-4 border-orange-500 p-5 text-sm">
            <div class="flex justify-between border-b-4 border-orange-500 pb-4 mb-4">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-orange-600 rounded-full flex flex-col items-center justify-center text-white font-extrabold text-[10px] text-center border-2 border-white">
                  <span class="leading-none text-[8px] tracking-wide">FGTS</span>
                  <span class="leading-none text-[8px] text-orange-250 font-bold">DIGITAL</span>
                </div>
                <div>
                  <h1 class="font-black text-sm uppercase leading-tight text-orange-950">Ministério do Trabalho e Emprego</h1>
                  <h2 class="font-bold text-xs uppercase text-gray-700 leading-tight">Fundo de Garantia do Tempo de Serviço</h2>
                  <p class="text-[10px] text-gray-500 font-mono mt-0.5">GFD - Guia do FGTS Digital (Recolhimento Mensal)</p>
                </div>
              </div>
              <div class="text-right border-l border-gray-305 pl-4 flex flex-col justify-center">
                <span class="font-black text-xl uppercase tracking-widest text-orange-600">GFD</span>
                <span class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Via de Recolhimento</span>
              </div>
            </div>

            <div class="grid grid-cols-12 gap-3 mb-4">
              <div class="col-span-8 border-2 border-gray-300 p-3 font-mono rounded">
                <label class="block text-[8px] font-black text-gray-500 uppercase mb-1">CÉDULA DE IDENTIFICAÇÃO DO EMPREGADOR</label>
                <div class="font-black text-base text-gray-900 leading-tight">${fgtsData.razaoSocial || 'INSTITUIÇÃO SEDE / MATRIZ GIPP'}</div>
                <div class="text-[10px] text-gray-600 mt-2 font-sans">
                  <strong>CNPJ do Cadastro Geral:</strong> ${fgtsData.cnpj || '12.345.678/0001-99'}
                </div>
              </div>
              <div class="col-span-4 grid grid-rows-3 gap-2 font-mono">
                <div class="border-2 border-gray-300 p-1.5 rounded">
                  <label class="block text-[7px] font-black text-gray-500">COMPETÊNCIA DE APURAÇÃO</label>
                  <div class="font-bold text-sm text-right mt-0.5">${fgtsData.competencia || '05/2026'}</div>
                </div>
                <div class="border-2 border-gray-300 p-1.5 rounded">
                  <label class="block text-[7px] font-black text-gray-500">DATA MÁXIMA DE VENCIMENTO</label>
                  <div class="font-black text-sm text-right text-red-600 mt-0.5">${fgtsData.vencimento || '15/06/2026'}</div>
                </div>
                <div class="border-2 border-gray-300 p-1.5 rounded">
                  <label class="block text-[7px] font-black text-gray-500">COLABORADORES ATIVOS</label>
                  <div class="font-bold text-sm text-right mt-0.5">${fgtsData.qtdTrabalhadores || '4'}</div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-12 gap-3 mb-4">
              <div class="col-span-8 border-2 border-gray-300 p-4 space-y-3 flex flex-col justify-between rounded">
                <div>
                  <h3 class="font-black text-xs text-orange-700 uppercase tracking-wider mb-1">Instruções aos Operadores Eclesiásticos:</h3>
                  <p class="text-[10px] leading-relaxed text-gray-600 font-sans">
                    Esta guia unificada foi emitida via barramento oficial do FGTS Digital. O pagamento deve ser processado exclusivamente via PIX (QR Code). Não há necessidade de emissão de convênios bancários ou boletos adicionais.
                  </p>
                  <p class="text-[10px] leading-relaxed text-gray-500 font-sans mt-2">
                    As contas individuais de FGTS dos colaboradores serão individualizadas e creditadas de forma instantânea junto à Caixa Econômica Federal após a correspondente quitação desta guia.
                  </p>
                </div>
                <div class="bg-orange-50 p-2.5 rounded border border-dashed border-orange-250 text-[9px] text-orange-850 font-mono">
                  Identificador FGTSD Lote #982 | Autenticação Eletrônica: FGTSD-9284-FJS9-12543-MK2
                </div>
              </div>
              <div class="col-span-4 grid grid-rows-3 gap-2 font-mono">
                <div class="border-2 border-gray-300 p-1.5 rounded">
                  <label class="block text-[7px] font-black text-gray-500">VALOR DO FGTS RECOLHIDO</label>
                  <div class="font-bold text-sm text-right mt-0.5">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fgtsData.valorFGTS || 3600)}</div>
                </div>
                <div class="border-2 border-gray-300 p-1.5 rounded">
                  <label class="block text-[7px] font-black text-gray-500">MULTAS E ENCARGOS ADICIONAIS</label>
                  <div class="font-bold text-sm text-right mt-0.5">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fgtsData.encargos || 0)}</div>
                </div>
                <div class="border-2 border-orange-500 p-1.5 bg-orange-50 rounded">
                  <label class="block text-[7px] font-black text-orange-900">TOTAL A RECOLHER</label>
                  <div class="font-black text-base text-right text-orange-950 mt-0.5">
                    ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      Number(fgtsData.valorFGTS || 0) + Number(fgtsData.encargos || 0)
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div class="border-2 border-orange-300 p-4 bg-orange-50/50 flex items-center justify-between gap-6 rounded mb-4">
              <div class="flex-1">
                <div class="text-xs font-black uppercase text-orange-900 mb-1 flex items-center gap-1.5">
                  ⚡ MINISTÉRIO DO TRABALHO - RECOLHIMENTO AUTOMÁTICO VIA PIX
                </div>
                <p class="text-[10px] text-gray-600 leading-tight">
                  Utilize o aplicativo bancário preferido para fazer o pagamento via PIX através do QR Code. A compensação é instantânea na Caixa Econômica Federal para liberação dos saldos vinculados dos trabalhadores.
                </p>
                <div class="mt-2 text-[8px] font-mono select-all bg-white p-1.5 rounded border border-orange-200 overflow-x-auto text-gray-500 whitespace-nowrap">
                  00020101021226850014br.gov.bcb.fgtsdigital.gov.br/receita/fgtspix?txid=fgtslote9823600abc
                </div>
              </div>
              <div class="w-24 h-24 bg-white border border-gray-300 p-1 flex">
                <svg viewBox="0 0 100 100" class="w-full h-full text-black">
                  <rect width="100" height="100" fill="white" />
                  <rect x="5" y="5" width="25" height="25" fill="black" />
                  <rect x="10" y="10" width="15" height="15" fill="white" />
                  <rect x="13" y="13" width="9" height="9" fill="black" />
                  
                  <rect x="70" y="5" width="25" height="25" fill="black" />
                  <rect x="75" y="10" width="15" height="15" fill="white" />
                  <rect x="78" y="13" width="9" height="9" fill="black" />
                  
                  <rect x="5" y="70" width="25" height="25" fill="black" />
                  <rect x="10" y="75" width="15" height="15" fill="white" />
                  <rect x="13" y="78" width="9" height="9" fill="black" />
                  
                  <rect x="35" y="35" width="30" height="30" fill="black" />
                  <rect x="40" y="40" width="20" height="20" fill="white" />
                  <rect x="45" y="45" width="10" height="10" fill="black" />
                  
                  <rect x="35" y="10" width="5" height="10" fill="black" />
                  <rect x="50" y="5" width="10" height="5" fill="black" />
                  <rect x="45" y="20" width="5" height="5" fill="black" />
                  <rect x="10" y="35" width="10" height="5" fill="black" />
                  <rect x="25" y="45" width="5" height="15" fill="black" />
                  <rect x="15" y="55" width="10" height="5" fill="black" />
                  <rect x="75" y="35" width="15" height="5" fill="black" />
                  <rect x="85" y="45" width="5" height="10" fill="black" />
                  <rect x="70" y="55" width="10" height="5" fill="black" />
                  <rect x="35" y="75" width="5" height="15" fill="black" />
                  <rect x="50" y="85" width="15" height="5" fill="black" />
                  <rect x="45" y="70" width="10" height="5" fill="black" />
                  <rect x="75" y="75" width="15" height="5" fill="black" />
                  <rect x="85" y="80" width="10" height="10" fill="black" />
                </svg>
              </div>
            </div>

            <div class="mt-8 flex flex-col items-center">
              <div class="font-mono text-center text-xs tracking-widest font-bold mb-1.5">
                858200000360 000002102026 052012543981 982360012345
              </div>
              <div class="flex items-center justify-center bg-white p-2 border-2 border-black w-full">
                <svg viewBox="0 0 400 35" class="w-full h-8">
                  <rect width="400" height="35" fill="white" />
                  <g fill="black">
                    <rect x="10" y="0" width="3" height="35" />
                    <rect x="15" y="0" width="2" height="35" />
                    <rect x="19" y="0" width="1" height="35" />
                    <rect x="24" y="0" width="4" height="35" />
                    <rect x="30" y="0" width="2" height="35" />
                    <rect x="35" y="0" width="5" height="35" />
                    <rect x="42" y="0" width="1" height="35" />
                    <rect x="46" y="0" width="4" height="35" />
                    <rect x="52" y="0" width="2" height="35" />
                    <rect x="56" y="0" width="3" height="35" />
                    <rect x="62" y="0" width="1" height="35" />
                    <rect x="66" y="0" width="5" height="35" />
                    <rect x="73" y="0" width="2" height="35" />
                    <rect x="79" y="0" width="3" height="35" />
                    <rect x="85" y="0" width="1" height="35" />
                    <rect x="89" y="0" width="4" height="35" />
                    <rect x="95" y="0" width="2" height="35" />
                    <!-- custom simulated barcode line blocks -->
                    <rect x="100" y="0" width="3" height="35" />
                    <rect x="105" y="0" width="1" height="35" />
                    <rect x="109" y="0" width="4" height="35" />
                    <rect x="115" y="0" width="2" height="35" />
                    <rect x="121" y="0" width="1" height="35" />
                    <rect x="125" y="0" width="5" height="35" />
                    <rect x="132" y="0" width="2" height="35" />
                    <rect x="136" y="0" width="3" height="35" />
                    <rect x="142" y="0" width="1" height="35" />
                    <rect x="146" y="0" width="4" height="35" />
                    <rect x="152" y="0" width="2" height="35" />
                    <rect x="158" y="0" width="3" height="35" />
                    <rect x="164" y="0" width="1" height="35" />
                    <rect x="168" y="0" width="5" height="35" />
                    <rect x="175" y="0" width="2" height="35" />
                    <rect x="181" y="0" width="3" height="35" />
                    <rect x="187" y="0" width="1" height="35" />
                    <rect x="191" y="0" width="4" height="35" />
                    <rect x="197" y="0" width="2" height="35" />
                    <rect x="203" y="0" width="3" height="35" />
                    <rect x="209" y="0" width="1" height="35" />
                    <rect x="213" y="0" width="5" height="35" />
                    <rect x="220" y="0" width="2" height="35" />
                    <rect x="225" y="0" width="4" height="35" />
                    <rect x="231" y="0" width="1" height="35" />
                    <rect x="235" y="0" width="3" height="35" />
                    <rect x="241" y="0" width="2" height="35" />
                    <rect x="245" y="0" width="5" height="35" />
                    <rect x="252" y="0" width="1" height="35" />
                    <rect x="256" y="0" width="4" height="35" />
                    <rect x="262" y="0" width="2" height="35" />
                    <rect x="268" y="0" width="3" height="35" />
                    <rect x="274" y="0" width="1" height="35" />
                    <rect x="278" y="0" width="5" height="35" />
                    <rect x="285" y="0" width="2" height="35" />
                    <rect x="290" y="0" width="3" height="35" />
                    <rect x="296" y="0" width="1" height="35" />
                    <rect x="300" y="0" width="4" height="35" />
                    <rect x="306" y="0" width="2" height="35" />
                    <rect x="312" y="0" width="3" height="35" />
                    <rect x="318" y="0" width="1" height="35" />
                    <rect x="322" y="0" width="5" height="35" />
                    <rect x="330" y="0" width="2" height="35" />
                    <rect x="335" y="0" width="4" height="35" />
                    <rect x="341" y="0" width="1" height="35" />
                    <rect x="345" y="0" width="3" height="35" />
                    <rect x="351" y="0" width="2" height="35" />
                    <rect x="355" y="0" width="5" height="35" />
                    <rect x="363" y="0" width="1" height="35" />
                    <rect x="367" y="0" width="4" height="35" />
                    <rect x="373" y="0" width="2" height="35" />
                    <rect x="379" y="0" width="3" height="35" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.frameElement.remove(); }, 1500);
            }
          </script>
        </body>
      </html>
    `);
    
    docObj.close();
  };

  const handlePrintDirf = () => {
    addToast("Gerando comprovante oficial de substituição de DIRF...", "info");
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const docObj = iframe.contentWindow?.document || iframe.contentDocument;
    if (!docObj) return;

    docObj.write(`
      <html>
        <head>
          <title>Certidão de Substituição da DIRF - Receita Federal</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; background-color: white; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @page { size: portrait; margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <div class="max-w-3xl mx-auto border-2 border-emerald-600 p-8 text-slate-800 rounded-lg shadow-xs relative">
            <div class="absolute top-8 right-8 text-right">
              <span class="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-3 py-1 rounded uppercase tracking-wider">
                CERTIDÃO ELETRÔNICA
              </span>
            </div>
            
            <div class="flex items-center gap-6 border-b border-slate-200 pb-6 mb-6">
              <div class="w-16 h-16 bg-emerald-750 bg-emerald-700 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm flex flex-col justify-center">
                <span class="font-extrabold text-[14px]">RFB</span>
              </div>
              <div>
                <h1 class="text-sm font-black uppercase text-emerald-950 tracking-wider">Ministério da Fazenda</h1>
                <h2 class="text-xs font-bold text-slate-700 uppercase">Secretaria Especial da Receita Federal do Brasil</h2>
                <p class="text-[10px] text-slate-500 font-medium">Declaração do Imposto sobre a Renda Retido na Fonte (DIRF)</p>
              </div>
            </div>

            <div class="text-center bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl mb-6">
              <h3 class="text-sm font-black text-emerald-900 uppercase tracking-widest mb-1">
                COMPROVANTE DE DISPENSA E SUBSTITUIÇÃO DA OBRIGAÇÃO
              </h3>
              <p class="text-[10px] text-emerald-800 font-mono font-bold">
                Instrução Normativa RFB nº 2.043/2011 e nº 2.181/2024
              </p>
            </div>

            <div class="space-y-4 text-xs font-sans leading-relaxed text-slate-700">
              <p>
                A <strong>Secretaria Especial da Receita Federal do Brasil</strong> CERTIFICA que a entidade identificada abaixo cumpriu integralmente os requisitos legais de prestação de informações e encontra-se <strong>DISPENSADA</strong> da entrega anual da declaração DIRF física/geradora, tendo em vista a sua <strong>EFETIVA SUBSTITUIÇÃO</strong> pelos lançamentos digitais centralizados no barramento do <strong>eSocial</strong> e na apuração mensal da <strong>DCTFWeb</strong>.
              </p>

              <div class="bg-gray-50 border border-slate-200 rounded-xl p-5 font-mono text-[11px] text-slate-800 space-y-2">
                <div><span class="text-[9px] font-bold text-slate-400 block uppercase">NOME DO CONTRIBUINTE / ENTIDADE</span> <strong class="text-xs text-slate-900">INSTITUIÇÃO SEDE / MATRIZ GIPP</strong></div>
                <div class="grid grid-cols-2 gap-4">
                  <div><span class="text-[9px] font-bold text-slate-400 block uppercase">CNPJ</span> <strong class="text-slate-900">12.345.678/0001-99</strong></div>
                  <div><span class="text-[9px] font-bold text-slate-400 block uppercase">REGIME DE APURAÇÃO</span> <strong class="text-slate-900">TEMPLO DE QUALQUER CULTO</strong></div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div><span class="text-[9px] font-bold text-slate-400 block uppercase">SITUAÇÃO DA DIRF ANUAL</span> <span class="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black text-[10px]">SUBSTITUÍDA PELO ESOCIAL</span></div>
                  <div><span class="text-[9px] font-bold text-slate-400 block uppercase">DATA DE VALIDAÇÃO</span> <strong class="text-slate-900">14/06/2026</strong></div>
                </div>
              </div>

              <div>
                <h4 class="font-bold text-slate-800 mb-1">Dispositivos de Validação e Base Legal:</h4>
                <ul class="list-disc pl-5 space-y-1 text-[11px] text-slate-600 font-medium">
                  <li>Os rendimentos do trabalho e as respectivas retenções na fonte decorrentes da folha ministerial foram tempestivamente informados através dos eventos periódicos transmitidos (eSocial S-1200 / S-1210).</li>
                  <li>As obrigações de retenção previdenciária e imposto de renda incidentes foram consolidadas e recolhidas na centralizada DARF Previdenciária via DCTFWeb.</li>
                  <li>Inexistem pendências de processamento ou inconformidades fiscais registradas no portal e-CAC da Receita Federal relativas aos anos calendários vigentes.</li>
                </ul>
              </div>

              <div class="border-t border-slate-100 pt-5 mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="text-center md:text-left space-y-1">
                  <div class="text-[10px] text-slate-400 font-mono font-bold">CÓDIGO DE AUTORIZAÇÃO / REFERÊNCIA:</div>
                  <div class="text-xs font-mono font-black text-slate-700 bg-slate-100 px-2 py-1 rounded">RFB-DIRFSUB-2026-9173A-H90</div>
                </div>
                <div class="text-center md:text-right">
                  <div class="text-[10px] text-slate-400 font-black uppercase mb-1">Assinatura Eletrônica eSocial</div>
                  <p class="text-[11px] text-emerald-700 font-bold font-mono">✓ CERTIFICADO DIGITAL ICP-BRASIL DE AUTORIDADE RFB</p>
                  <p class="text-[9px] text-slate-400 mt-0.5">Assinado eletronicamente por autoridade certificadora credenciada.</p>
                </div>
              </div>
            </div>

            <div class="mt-8 border-t border-dashed border-slate-200 pt-4 text-center">
              <p class="text-[9px] text-slate-400 font-mono leading-relaxed">
                Este documento é uma via oficial impressa gerada pelo Portal Consubstanciado do do DP. Para verificar a integridade da assinatura, consulte o portal de assinaturas digitais da Receita Federal com o código acima.
              </p>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.frameElement.remove(); }, 1500);
            }
          </script>
        </body>
      </html>
    `);
    
    docObj.close();
  };

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
      { id: 'po1', colaborador_id: 'c1', colaborador: 'Pra. Débora Souza', data: '2026-06-12', entrada: '08:02', alm_saida: '12:00', alm_retorno: '13:00', saida: '17:05', horas_trabalhadas: 8.08, horas_extras: 0.08, status: 'Regular', inconsistente: false, justificativa: '', atestado_anexo: '' },
      { id: 'po2', colaborador_id: 'c2', colaborador: 'Ev. Carlos Eduardo', data: '2026-06-12', entrada: '07:55', alm_saida: '12:05', alm_retorno: '13:00', saida: '17:01', horas_trabalhadas: 8.1, horas_extras: 0.1, status: 'Regular', inconsistente: false, justificativa: '', atestado_anexo: '' },
      { id: 'po3', colaborador_id: 'c3', colaborador: 'Pastor Marcos Silva', data: '2026-06-11', entrada: '08:58', alm_saida: '12:00', alm_retorno: '13:00', saida: '18:30', horas_trabalhadas: 8.5, horas_extras: 0.5, status: 'Horas Extras', inconsistente: false, justificativa: '', atestado_anexo: '' },
      { id: 'po4', colaborador_id: 'c2', colaborador: 'Ev. Carlos Eduardo', data: '2026-06-07', entrada: '08:00', alm_saida: '12:00', alm_retorno: '13:00', saida: '14:00', horas_trabalhadas: 5.0, horas_extras: 5.0, status: '100% Extras (DSR)', inconsistente: false, justificativa: '', atestado_anexo: '' },
      { id: 'po5', colaborador_id: 'c4', colaborador: 'Cooperadora Sâmia Reis', data: '2026-06-10', entrada: '08:15', alm_saida: '', alm_retorno: '', saida: '17:00', horas_trabalhadas: 7.75, horas_extras: 0, status: 'Inconsistente', inconsistente: true, alerta: 'Falta de marcação do intervalo de almoço!', justificativa: '', atestado_anexo: '' },
      { id: 'po6', colaborador_id: 'c1', colaborador: 'Pra. Débora Souza', data: '2026-06-09', entrada: '', alm_saida: '', alm_retorno: '', saida: '', horas_trabalhadas: 0, horas_extras: 0, status: 'Justificado', inconsistente: false, justificativa: 'Consulta Odontológica', atestado_anexo: 'atestado_odontologia.pdf' }
    ];
  });

  const [pontoEscalas, setPontoEscalas] = useState<any[]>(() => {
    const saved = localStorage.getItem('gipp_ponto_escalas');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { id: 'esc1', colaborador_id: 'c1', colaborador: 'Pra. Débora Souza', tipo_escala: 'Fixo (Seg-Sex)', carga_horaria: '44h Semanais', entrada: '08:00', saida: '17:00', folga_semanal: 'Sábado & Domingo' },
      { id: 'esc2', colaborador_id: 'c2', colaborador: 'Ev. Carlos Eduardo', tipo_escala: 'Fixo (Seg-Sex)', carga_horaria: '44h Semanais', entrada: '08:00', saida: '17:00', folga_semanal: 'Sábado & Domingo' },
      { id: 'esc3', colaborador_id: 'c3', colaborador: 'Pastor Marcos Silva', tipo_escala: 'Administrativa (Seg-Qui)', carga_horaria: '32h Semanais', entrada: '09:00', saida: '18:00', folga_semanal: 'Sexta-Feira' },
      { id: 'esc4', colaborador_id: 'c4', colaborador: 'Cooperadora Sâmia Reis', tipo_escala: 'Alternado (12x36)', carga_horaria: 'Escala Recreativa Kids', entrada: '08:00', saida: '20:00', folga_semanal: 'DSR Alternado' }
    ];
  });

  const [pontoAtestados, setPontoAtestados] = useState<any[]>(() => {
    const saved = localStorage.getItem('gipp_ponto_atestados');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { id: 'at1', colaborador: 'Pra. Débora Souza', colaborador_id: 'c1', data_envio: '2026-06-09', data_ausencia: '2026-06-09', motivo: 'Atestado Médico - Consulta Odontológica', arquivo: 'atestado_odontologia.pdf', status: 'Aprovado', validador: 'RH GIPP' },
      { id: 'at2', colaborador: 'Ev. Carlos Eduardo', colaborador_id: 'c2', data_envio: '2026-06-11', data_ausencia: '2026-06-11', motivo: 'Abono - Serviço Ministerial Externo', arquivo: 'solicitacao_abono_externo.pdf', status: 'Pendente', validador: '' }
    ];
  });

  const [pontoConfigs, setPontoConfigs] = useState<any>(() => {
    const saved = localStorage.getItem('gipp_ponto_configs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      almocoPadraoMinutos: 60,
      horasExtrasModo: 'folha', // 'folha' ou 'banco' (banco de horas)
      horasExtrasLimiteDiario: 2.0
    };
  });

  const [pontoSubTab, setPontoSubTab] = useState<'jornadas' | 'planilha' | 'escalas' | 'justificativas' | 'integracao' | 'relatorios'>('jornadas');
  const [planilhaColabId, setPlanilhaColabId] = useState<string>('');
  const [gridEntries, setGridEntries] = useState<{[dateStr: string]: any}>({});

  const [showPontoModal, setShowPontoModal] = useState(false);
  const [editingPonto, setEditingPonto] = useState<any>(null);
  const [pontoForm, setPontoForm] = useState<any>({
    colaborador_id: '',
    colaborador: '',
    data: getTodayDate(),
    entrada: '08:00',
    alm_saida: '12:00',
    alm_retorno: '13:00',
    saida: '17:00',
    justificativa: '',
    atestado_anexo: '',
    banco_ou_folha: 'folha'
  });

  useEffect(() => {
    localStorage.setItem('gipp_ponto_punches', JSON.stringify(pontoPunches));
  }, [pontoPunches]);

  useEffect(() => {
    localStorage.setItem('gipp_ponto_escalas', JSON.stringify(pontoEscalas));
  }, [pontoEscalas]);

  useEffect(() => {
    localStorage.setItem('gipp_ponto_atestados', JSON.stringify(pontoAtestados));
  }, [pontoAtestados]);

  useEffect(() => {
    localStorage.setItem('gipp_ponto_configs', JSON.stringify(pontoConfigs));
  }, [pontoConfigs]);

  // RH / Human Development States
  const [vagas, setVagas] = useState<any[]>(() => {
    const saved = localStorage.getItem('gipp_rh_vagas');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'v1', titulo: 'Analista Administrativo', codigo: 'V-102', status: 'ativa', depto: 'Administração', descricao: 'Atuação no setor administrativo e financeiro da instituição.', depto_contas: 'Administrativo', candidatosCount: 12 },
      { id: 'v2', titulo: 'Auxiliar de Limpeza', codigo: 'V-098', status: 'pausada', depto: 'Serviços Gerais', descricao: 'Manutenção e conservação do templo e dependências.', depto_contas: 'Operacional', candidatosCount: 45 },
      { id: 'v3', titulo: 'Coordenador Pedagógico EBD', codigo: 'V-105', status: 'ativa', depto: 'Educação', descricao: 'Coordenação e planejamento de disciplinas e treinamentos da Escola Bíblica.', depto_contas: 'Ministerial', candidatosCount: 4 }
    ];
  });

  const [candidatos, setCandidatos] = useState<any[]>(() => {
    const saved = localStorage.getItem('gipp_rh_candidatos');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'cand1', vagaId: 'v1', nome: 'Mariana Ramos Santos', email: 'mari@ramos.com', status: 'Entrevista', qualificacao: 'Excelente experiência em fluxo de caixa', dataInscricao: '2026-05-10' },
      { id: 'cand2', vagaId: 'v1', nome: 'Felipe Augusto Dias', email: 'felipe@dias.com', status: 'Triagem', qualificacao: 'Formação em Gestão Financeira', dataInscricao: '2026-05-12' },
      { id: 'cand3', vagaId: 'v1', nome: 'Giselle Monteiro', email: 'giselle@monteiro.com', status: 'Aprovado', qualificacao: 'Selecionada para onboarding', dataInscricao: '2026-05-08' },
      { id: 'cand4', vagaId: 'v2', nome: 'Antônio Ferreira', email: 'antonio@email.com', status: 'Entrevista', qualificacao: 'Disponibilidade imediata', dataInscricao: '2026-04-20' },
      { id: 'cand5', vagaId: 'v2', nome: 'Sebastião Carlos', email: 'sebastiao@email.com', status: 'Dispensado', qualificacao: 'Não reside próximo', dataInscricao: '2026-04-18' }
    ];
  });

  const [onboardings, setOnboardings] = useState<any[]>(() => {
    const saved = localStorage.getItem('gipp_rh_onboardings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'o1', colaboradorNome: 'Giselle Monteiro', cargoOriginal: 'Analista Administrativo', progresso: 50, dataInicio: '2026-06-01', tarefas: [
        { id: 't1', titulo: 'Assinatura do Contrato de Trabalho', concluida: true },
        { id: 't2', titulo: 'Treinamento de Integração Institucional', concluida: false },
        { id: 't3', titulo: 'Apresentação aos Departamentos', concluida: false },
        { id: 't4', titulo: 'Exame Admissional Realizado', concluida: true }
      ]},
      { id: 'o2', colaboradorNome: 'Mateus Oliveira', cargoOriginal: 'Sonoplasta Geral', progresso: 75, dataInicio: '2026-06-05', tarefas: [
        { id: 't5', titulo: 'Termo de Voluntariado Assinado', concluida: true },
        { id: 't6', titulo: 'Treinamento Técnico de Som', concluida: true },
        { id: 't7', titulo: 'Cultura Sede & Ministérios', concluida: true },
        { id: 't8', titulo: 'Primeiro culto acompanhado', concluida: false }
      ]}
    ];
  });

  const [treinamentos, setTreinamentos] = useState<any[]>(() => {
    const saved = localStorage.getItem('gipp_rh_treinamentos');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'tr1', titulo: 'Integração Institucional e Cultura', descricao: 'Obrigatório para novos colaboradores.', progresso: 85, instrutor: 'Pr. Marcos Silva', cargaHoraria: 8, status: 'Ativo' },
      { id: 'tr2', titulo: 'CIPA e Prevenção de Acidentes', descricao: 'Renovação anual requerida (NR-05).', progresso: 40, instrutor: 'Dr. Roberto Cruz (SST)', cargaHoraria: 16, status: 'Ativo' },
      { id: 'tr3', titulo: 'LGPD no Âmbito Eclesiástico', descricao: 'Treinamento de proteção de dados de membros do dízimo.', progresso: 10, instrutor: 'Dra. Amanda Souza', cargaHoraria: 4, status: 'Planejado' }
    ];
  });

  const [desempenhoCiclos, setDesempenhoCiclos] = useState<any[]>(() => {
    const saved = localStorage.getItem('gipp_rh_desempenho_ciclos');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'd1', ciclo: 'Avaliação Desempenho H1 2026', periodo: 'Jan - Jun 2026', status: 'Planejamento', resumo: 'Escala de feedbacks para toda equipe pastoral e de apoio.', avaliadosCount: 0, taxaParticipacao: 0 },
      { id: 'd2', ciclo: 'Pesquisa de Clima Organizacional', periodo: 'Nov 2025', status: 'Concluído', resumo: 'Mensuração anual de engajamento e bem-estar.', avaliadosCount: 15, taxaParticipacao: 82 }
    ];
  });

  // Modal and Form States for RH Tab
  const [showVagaModal, setShowVagaModal] = useState(false);
  const [editingVaga, setEditingVaga] = useState<any>(null);
  const [vagaForm, setVagaForm] = useState<any>({
    titulo: '',
    codigo: '',
    depto: 'Administração',
    status: 'ativa',
    descricao: ''
  });

  const [selectedVagaFunil, setSelectedVagaFunil] = useState<any>(null);
  const [showCandidatoModal, setShowCandidatoModal] = useState(false);
  const [editingCandidato, setEditingCandidato] = useState<any>(null);
  const [candidatoForm, setCandidatoForm] = useState<any>({
    nome: '',
    email: '',
    status: 'Triagem',
    qualificacao: ''
  });

  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [selectedOnboardingDetail, setSelectedOnboardingDetail] = useState<any>(null);
  const [onboardingForm, setOnboardingForm] = useState<any>({
    colaboradorNome: '',
    cargoOriginal: '',
    dataInicio: getTodayDate(),
    tarefasCustom: 'Assinatura do Contrato\nIntegração de Cultura\nEntrega de Equipamentos\nExame de Saúde'
  });

  const [showTreinamentoModal, setShowTreinamentoModal] = useState(false);
  const [editingTreinamento, setEditingTreinamento] = useState<any>(null);
  const [treinamentoForm, setTreinamentoForm] = useState<any>({
    titulo: '',
    descricao: '',
    progresso: 0,
    instrutor: '',
    cargaHoraria: '',
    status: 'Ativo'
  });

  const [showDesempenhoModal, setShowDesempenhoModal] = useState(false);
  const [editingDesempenho, setEditingDesempenho] = useState<any>(null);
  const [desempenhoForm, setDesempenhoForm] = useState<any>({
    ciclo: '',
    periodo: '',
    status: 'Planejamento',
    resumo: '',
    avaliadosCount: 0,
    taxaParticipacao: 0
  });

  // Persists RH States
  useEffect(() => {
    localStorage.setItem('gipp_rh_vagas', JSON.stringify(vagas));
  }, [vagas]);

  useEffect(() => {
    localStorage.setItem('gipp_rh_candidatos', JSON.stringify(candidatos));
  }, [candidatos]);

  useEffect(() => {
    localStorage.setItem('gipp_rh_onboardings', JSON.stringify(onboardings));
  }, [onboardings]);

  useEffect(() => {
    localStorage.setItem('gipp_rh_treinamentos', JSON.stringify(treinamentos));
  }, [treinamentos]);

  useEffect(() => {
    localStorage.setItem('gipp_rh_desempenho_ciclos', JSON.stringify(desempenhoCiclos));
  }, [desempenhoCiclos]);
  
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

  // Synchronize Spreadsheet selected coworker default
  useEffect(() => {
    if (colaboradores && colaboradores.length > 0 && !planilhaColabId) {
      setPlanilhaColabId(colaboradores[0]?.id || '');
    }
  }, [colaboradores, planilhaColabId]);

  // Synchronize timesheet spreadsheet grid entries
  useEffect(() => {
    if (!planilhaColabId || !selectedMonth) return;
    
    const days = getDaysInMonth(selectedMonth);
    const newGrid: {[dataStr: string]: any} = {};
    
    days.forEach((dayDate: Date) => {
      const y = dayDate.getFullYear();
      const m = String(dayDate.getMonth() + 1).padStart(2, '0');
      const d = String(dayDate.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${d}`;
      
      const existing = pontoPunches.find((p: any) => p.colaborador_id === planilhaColabId && p.data === dStr);
      
      if (existing) {
        newGrid[dStr] = {
          id: existing.id,
          entrada: existing.entrada || '',
          alm_saida: existing.alm_saida || '',
          alm_retorno: existing.alm_retorno || '',
          saida: existing.saida || '',
          tipo_registro: existing.status === 'Falta' ? 'falta' : 
                         existing.status === 'Justificado' ? 'atestado' : 
                         isSundayOrHoliday(dStr) ? 'folga' : 'trabalhado',
          status: existing.status || 'Regular',
          justificativa: existing.justificativa || '',
          atestado_anexo: existing.atestado_anexo || ''
        };
      } else {
        const isSun = isSundayOrHoliday(dStr);
        newGrid[dStr] = {
          id: `temp_${dStr}_${planilhaColabId}`,
          entrada: '',
          alm_saida: '',
          alm_retorno: '',
          saida: '',
          tipo_registro: isSun ? 'folga' : 'pendente',
          status: isSun ? '100% Extras (DSR)' : 'Não Batido',
          justificativa: '',
          atestado_anexo: ''
        };
      }
    });
    
    setGridEntries(newGrid);
  }, [planilhaColabId, selectedMonth, pontoPunches]);

  // Helper calculation for individual row hours
  const calculateRowWorkedHours = (row: any) => {
    if (!row.entrada || !row.saida) return 0;
    
    const entMins = parseTimeToMinutes(row.entrada);
    const extMins = parseTimeToMinutes(row.saida);
    const almOutMins = parseTimeToMinutes(row.alm_saida);
    const almInMins = parseTimeToMinutes(row.alm_retorno);
    
    let totalWorkedMins = 0;
    
    if (row.alm_saida && row.alm_retorno) {
      const p1 = almOutMins - entMins;
      const p2 = extMins - almInMins;
      if (p1 < 0 || p2 < 0) {
        totalWorkedMins = Math.max(0, extMins - entMins - 60);
      } else {
        totalWorkedMins = p1 + p2;
      }
    } else {
      const span = extMins - entMins;
      if (span < 0) {
        totalWorkedMins = 0;
      } else {
        totalWorkedMins = span > 360 ? span - 60 : span;
      }
    }
    
    return totalWorkedMins / 60;
  };

  // Live Summary computed state of active grid
  const spreadsheetSummary = useMemo(() => {
    let totalExtras = 0;
    let totalNegativas = 0;
    let totalFaltas = 0;
    let totalAtestados = 0;
    let totalTrabalhados = 0;
    
    Object.entries(gridEntries).forEach(([dateStr, row]: [string, any]) => {
      const isSun = isSundayOrHoliday(dateStr);
      
      if (row.tipo_registro === 'falta') {
        totalFaltas += 1;
        totalNegativas += 8;
      } else if (row.tipo_registro === 'atestado') {
        totalAtestados += 1;
      } else if (row.tipo_registro === 'folga') {
        if (row.entrada && row.saida) {
          const workedHours = calculateRowWorkedHours(row);
          totalExtras += workedHours;
        }
      } else if (row.tipo_registro === 'trabalhado' || (row.entrada && row.saida)) {
        totalTrabalhados += 1;
        const workedHours = calculateRowWorkedHours(row);
        
        if (isSun) {
          totalExtras += workedHours;
        } else {
          if (workedHours > 8) {
            totalExtras += (workedHours - 8);
          } else if (workedHours < 8) {
            totalNegativas += (8 - workedHours);
          }
        }
      }
    });
    
    return {
      totalExtras,
      totalNegativas,
      totalFaltas,
      totalAtestados,
      totalTrabalhados
    };
  }, [gridEntries]);

  // Handle cell typing directly on sheet
  const handleGridCellChange = (dateStr: string, field: string, value: string) => {
    setGridEntries(prev => {
      const updatedRow = { ...prev[dateStr], [field]: value };
      
      if (field === 'tipo_registro') {
        if (value === 'falta') {
          updatedRow.entrada = '';
          updatedRow.alm_saida = '';
          updatedRow.alm_retorno = '';
          updatedRow.saida = '';
          updatedRow.status = 'Falta';
        } else if (value === 'atestado') {
          updatedRow.entrada = '';
          updatedRow.alm_saida = '';
          updatedRow.alm_retorno = '';
          updatedRow.saida = '';
          updatedRow.status = 'Justificado';
        } else if (value === 'folga') {
          updatedRow.entrada = '';
          updatedRow.alm_saida = '';
          updatedRow.alm_retorno = '';
          updatedRow.saida = '';
          updatedRow.status = 'DSR / Folga';
        } else if (value === 'trabalhado') {
          const coEscala = pontoEscalas.find((e: any) => e.colaborador_id === planilhaColabId);
          updatedRow.entrada = updatedRow.entrada || coEscala?.entrada || '08:00';
          updatedRow.alm_saida = updatedRow.alm_saida || '12:00';
          updatedRow.alm_retorno = updatedRow.alm_retorno || '13:00';
          updatedRow.saida = updatedRow.saida || coEscala?.saida || '17:00';
          updatedRow.status = 'Regular';
        } else if (value === 'pendente') {
          updatedRow.entrada = '';
          updatedRow.alm_saida = '';
          updatedRow.alm_retorno = '';
          updatedRow.saida = '';
          updatedRow.status = 'Não Batido';
        }
      }
      
      return { ...prev, [dateStr]: updatedRow };
    });
  };

  // Perform Auto fill standard times on weekdays
  const handleAutoFillPlanilha = () => {
    const coEscala = pontoEscalas.find((e: any) => e.colaborador_id === planilhaColabId);
    const defEnt = coEscala?.entrada || '08:00';
    const defSai = coEscala?.saida || '17:00';
    
    setGridEntries(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(dateStr => {
        const isSun = isSundayOrHoliday(dateStr);
        if (!isSun && (!updated[dateStr].entrada || !updated[dateStr].saida) && updated[dateStr].tipo_registro !== 'falta' && updated[dateStr].tipo_registro !== 'atestado' && updated[dateStr].tipo_registro !== 'folga') {
          updated[dateStr] = {
            ...updated[dateStr],
            entrada: defEnt,
            alm_saida: '12:00',
            alm_retorno: '13:00',
            saida: defSai,
            tipo_registro: 'trabalhado',
            status: 'Regular'
          };
        }
      });
      return updated;
    });
    addToast('Horários padrão autopreenchidos com base na escala!', 'success');
  };

  // Bulk save changes to persistent state in DB
  const handleSavePlanilhaToDB = () => {
    if (!planilhaColabId) {
      addToast('Erro: Selecione um colaborador válido.', 'error');
      return;
    }
    
    const matchedColab = colaboradores.find((c: any) => c.id === planilhaColabId);
    const colabNome = matchedColab ? matchedColab.nome : 'Colaborador';
    
    // Extract non-overlapping entries
    const cleanPunches = pontoPunches.filter((p: any) => !(p.colaborador_id === planilhaColabId && p.data?.startsWith(selectedMonth)));
    
    const saveList: any[] = [];
    
    Object.entries(gridEntries).forEach(([dateStr, row]: [string, any]) => {
      if (row.tipo_registro === 'pendente') {
        return; // skip unsaved blank rows
      }
      
      const isSun = isSundayOrHoliday(dateStr);
      let workedHours = 0;
      let extraHours = 0;
      let statusLabel = 'Regular';
      let inconsistente = false;
      let alerta = '';
      
      if (row.tipo_registro === 'falta') {
        statusLabel = 'Falta';
      } else if (row.tipo_registro === 'atestado') {
        statusLabel = 'Justificado';
      } else if (row.tipo_registro === 'folga') {
        statusLabel = 'Folga';
        if (row.entrada && row.saida) {
          workedHours = calculateRowWorkedHours(row);
          extraHours = workedHours;
          statusLabel = '100% Extras (DSR)';
        }
      } else if (row.tipo_registro === 'trabalhado') {
        if (!row.entrada || !row.saida) {
          inconsistente = true;
          alerta = 'Batida incompleta na folha rápida.';
          statusLabel = 'Inconsistente';
        } else {
          workedHours = calculateRowWorkedHours(row);
          if (isSun) {
            extraHours = workedHours;
            statusLabel = '100% Extras (DSR)';
          } else {
            if (workedHours > 8) {
              extraHours = workedHours - 8;
              statusLabel = 'Horas Extras';
            } else {
              statusLabel = 'Regular';
            }
          }
        }
      }
      
      saveList.push({
        id: String(row.id).startsWith('temp_') ? `po_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` : row.id,
        colaborador_id: planilhaColabId,
        colaborador: colabNome,
        data: dateStr,
        entrada: row.entrada || '',
        alm_saida: row.alm_saida || '',
        alm_retorno: row.alm_retorno || '',
        saida: row.saida || '',
        horas_trabalhadas: workedHours,
        horas_extras: extraHours,
        status: statusLabel,
        inconsistente,
        alerta,
        justificativa: row.justificativa || '',
        atestado_anexo: row.atestado_anexo || ''
      });
    });
    
    setPontoPunches([...saveList, ...cleanPunches]);
    addToast(`Planilha de pontualidade de "${colabNome}" consolidada no servidor!`, 'success');
  };

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

  // Synchronize employee punctuality (clock-in) registers with current month's payroll slips
  const handleSyncPontoWithFolha = async () => {
    const activeStaffs = colaboradores.filter((c: any) => c.status === 'ativo' && !c.deleted);
    if (activeStaffs.length === 0) {
      addToast('Não há colaboradores ativos para sincronizar.', 'warning');
      return;
    }

    let updatedCount = 0;
    let notFoundCount = 0;
    const updatedFolhas = [...folhas];

    for (const c of activeStaffs) {
      // Find matching punch registers for the selected month
      const punches = pontoPunches.filter((p: any) => p.colaborador_id === c.id && p.data?.startsWith(selectedMonth));
      
      let ex50 = 0;
      let ex100 = 0;
      let faltas = 0;

      punches.forEach((p: any) => {
        if (p.horas_extras > 0) {
          if (p.status?.includes('100%') || isSundayOrHoliday(p.data)) {
            ex100 += p.horas_extras;
          } else {
            ex50 += p.horas_extras;
          }
        }
        if (p.status === 'Falta' && !p.justificativa) {
          faltas++;
        }
      });

      const baseHourly = (parseFloat(c.salario_base) || 0) / 220;
      const baseDaily = (parseFloat(c.salario_base) || 0) / 30;

      const valEx50 = Math.round((ex50 * baseHourly * 1.5) * 100) / 100;
      const valEx100 = Math.round((ex100 * baseHourly * 2.0) * 100) / 100;
      const valFaltas = Math.round((faltas * baseDaily) * 100) / 100;

      // Find individual payroll slip
      const slipIdx = updatedFolhas.findIndex((f: any) => f.colaborador_id === c.id && f.mes_referencia === selectedMonth);
      if (slipIdx === -1) {
        notFoundCount++;
        continue;
      }

      const f = updatedFolhas[slipIdx];
      let proventos = [...(f.proventos || [])];
      let descontos = [...(f.descontos || [])];

      // Update or remove Horas Extras 50%
      proventos = proventos.filter((x: any) => x.descricao !== 'Horas Extras 50% (Ref: Ponto)');
      if (valEx50 > 0) {
        proventos.push({ descricao: 'Horas Extras 50% (Ref: Ponto)', valor: valEx50 });
      }

      // Update or remove Horas Extras 100%
      proventos = proventos.filter((x: any) => x.descricao !== 'Horas Extras 100% (Ref: Ponto)');
      if (valEx100 > 0) {
        proventos.push({ descricao: 'Horas Extras 100% (Ref: Ponto)', valor: valEx100 });
      }

      // Update or remove Desconto de Faltas
      descontos = descontos.filter((x: any) => x.descricao !== 'Desconto de Faltas (Ref: Ponto)');
      if (valFaltas > 0) {
        descontos.push({ descricao: 'Desconto de Faltas (Ref: Ponto)', valor: valFaltas });
      }

      const totProv = proventos.reduce((acc, item) => acc + item.valor, 0);
      const totDesc = descontos.reduce((acc, item) => acc + item.valor, 0);
      const valLiq = Math.max(0, totProv - totDesc);

      const updatedSlip = {
        ...f,
        proventos,
        descontos,
        valor_liquido: valLiq,
        updated_at: new Date().toISOString()
      };

      if (dbFirestore && appId) {
        try {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'dp_folhas', f.id), updatedSlip);
        } catch (fErr) {
          console.warn("Firestore sync update error:", fErr);
        }
      }

      updatedFolhas[slipIdx] = updatedSlip;
      updatedCount++;
    }

    setDbState((prev: any) => ({
      ...prev,
      dp_folhas: updatedFolhas
    }));

    if (updatedCount > 0) {
      if (notFoundCount > 0) {
        addToast(`Sincronização concluída! ${updatedCount} contracheques atualizados. ${notFoundCount} colaboradores ainda não possuem contracheque gerado para este mês.`, 'success');
      } else {
        addToast(`Sincronização concluída com sucesso! Os contracheques de todos os colaboradores ativos foram atualizados com base no espelho de ponto.`, 'success');
      }
    } else {
      addToast(`Nenhum contracheque foi atualizado. Certifique-se de gerar os contracheques do mês na aba "Folha de Pagamento" antes de sincronizar.`, 'warning');
    }
  };

  // Export employee punctuality (clock-in) registers of the selected month as CSV
  const handleExportCSV = () => {
    if (pontoPunches.length === 0) {
      addToast('Não há registros de ponto para exportar.', 'warning');
      return;
    }

    // Build CSV Content
    const headers = ['ID', 'Colaborador', 'Data', 'Entrada', 'Almoço Saída', 'Almoço Retorno', 'Saída', 'Horas Trabalhadas', 'Horas Extras', 'Status', 'Inconsistente', 'Alerta', 'Justificativa'];
    const rows = pontoPunches.map((p: any) => [
      p.id || '',
      p.colaborador || '',
      p.data || '',
      p.entrada || '',
      p.alm_saida || '',
      p.alm_retorno || '',
      p.saida || '',
      p.horas_trabalhadas !== undefined ? Number(p.horas_trabalhadas).toFixed(2) : '0.00',
      p.horas_extras !== undefined ? Number(p.horas_extras).toFixed(2) : '0.00',
      p.status || 'Regular',
      p.inconsistente ? 'Sim' : 'Não',
      p.alerta || '',
      p.justificativa || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    // Download CSV
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `espelho_ponto_registros_${selectedMonth || 'total'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Espelho de ponto detalhado exportado com sucesso em CSV!', 'success');
  };

  // --- RH HANDLERS & OPERATIONS ---

  // Vacancy Handlers
  const handleSaveVaga = () => {
    if (!vagaForm.titulo || !vagaForm.codigo) {
      addToast('O título e o código da vaga são obrigatórios.', 'error');
      return;
    }

    if (editingVaga) {
      setVagas(prev => prev.map(v => v.id === editingVaga.id ? { ...v, ...vagaForm } : v));
      addToast(`Vaga "${vagaForm.titulo}" atualizada com sucesso!`, 'success');
    } else {
      const newVaga = {
        id: `v_${Date.now()}`,
        ...vagaForm,
        candidatosCount: 0
      };
      setVagas(prev => [...prev, newVaga]);
      addToast(`Nova vaga de "${vagaForm.titulo}" cadastrada e aberta!`, 'success');
    }
    setShowVagaModal(false);
    setEditingVaga(null);
  };

  const handleDeleteVaga = (vagaId: string) => {
    if (window.confirm('Deseja realmente remover esta vaga? Todos os candidatos associados precisarão ser remanejados.')) {
      setVagas(prev => prev.filter(v => v.id !== vagaId));
      setCandidatos(prev => prev.filter(cand => cand.vagaId !== vagaId));
      addToast('Vaga excluída com sucesso.', 'info');
      if (selectedVagaFunil && selectedVagaFunil.id === vagaId) {
        setSelectedVagaFunil(null);
      }
    }
  };

  // Candidate Handlers
  const handleSaveCandidato = () => {
    if (!candidatoForm.nome || !candidatoForm.email) {
      addToast('Nome e e-mail do candidato são obrigatórios.', 'error');
      return;
    }

    if (editingCandidato) {
      setCandidatos(prev => prev.map(c => c.id === editingCandidato.id ? { ...c, ...candidatoForm } : v => v));
      addToast(`Candidato "${candidatoForm.nome}" atualizado!`, 'success');
    } else {
      const newCand = {
        id: `cand_${Date.now()}`,
        vagaId: selectedVagaFunil.id,
        nome: candidatoForm.nome,
        email: candidatoForm.email,
        status: candidatoForm.status || 'Triagem',
        qualificacao: candidatoForm.qualificacao,
        dataInscricao: getTodayDate()
      };
      setCandidatos(prev => [...prev, newCand]);
      addToast(`Candidato "${candidatoForm.nome}" adicionado com sucesso!`, 'success');
    }
    setShowCandidatoModal(false);
    setEditingCandidato(null);
  };

  const handleDeleteCandidato = (candId: string) => {
    if (window.confirm('Tem certeza de que deseja remover este candidato?')) {
      setCandidatos(prev => prev.filter(c => c.id !== candId));
      addToast('Candidato removido do processo.', 'info');
    }
  };

  const handlePromoveCandidatoAoOnboarding = (cand: any) => {
    const matchedVaga = vagas.find(v => v.id === cand.vagaId);
    if (!matchedVaga) return;

    // Create Onboarding
    const onboardId = `o_${Date.now()}`;
    const defaultTarefas = [
      { id: `t1_${onboardId}`, titulo: 'Assinatura do Contrato de Trabalho / Voluntariado', concluida: false },
      { id: `t2_${onboardId}`, titulo: 'Treinamento de Integração Institucional e Cultura', concluida: false },
      { id: `t3_${onboardId}`, titulo: 'Apresentação presencial à equipe e liderança', concluida: false },
      { id: `t4_${onboardId}`, titulo: 'Exceder acessos nos portais (GIPP e Comunidade)', concluida: false }
    ];

    const newOnboarding = {
      id: onboardId,
      colaboradorNome: cand.nome,
      cargoOriginal: matchedVaga.titulo,
      progresso: 0,
      dataInicio: getTodayDate(),
      tarefas: defaultTarefas
    };

    setOnboardings(prev => [...prev, newOnboarding]);
    // Move candidate's status to Aprovado
    setCandidatos(prev => prev.map(c => c.id === cand.id ? { ...c, status: 'Aprovado' } : c));
    addToast(`Onboarding para "${cand.nome}" iniciado com sucesso na trilha de ${matchedVaga.titulo}!`, 'success');
    setSelectedVagaFunil(null); // Close pipeline view
    setRhActiveTab('onboarding'); // Go to onboarding
  };

  // Onboarding Handlers
  const handleSaveOnboarding = () => {
    if (!onboardingForm.colaboradorNome || !onboardingForm.cargoOriginal) {
      addToast('Nome do colaborador e cargo são campos requeridos.', 'error');
      return;
    }

    const tasksList = onboardingForm.tarefasCustom
      .split('\n')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0)
      .map((t: string, idx: number) => ({
        id: `tCustom_${Date.now()}_${idx}`,
        titulo: t,
        concluida: false
      }));

    const newOnboarding = {
      id: `o_${Date.now()}`,
      colaboradorNome: onboardingForm.colaboradorNome,
      cargoOriginal: onboardingForm.cargoOriginal,
      progresso: 0,
      dataInicio: onboardingForm.dataInicio || getTodayDate(),
      tarefas: tasksList.length > 0 ? tasksList : [
        { id: `t_${Date.now()}_1`, titulo: 'Assinatura de Documentos', concluida: false },
        { id: `t_${Date.now()}_2`, titulo: 'Sessão de Orientação da Igreja', concluida: false }
      ]
    };

    setOnboardings(prev => [...prev, newOnboarding]);
    addToast(`Trilha de onboarding aberta com sucesso para "${onboardingForm.colaboradorNome}"!`, 'success');
    setShowOnboardingModal(false);
  };

  const handleToggleTarefaOnboarding = (onboardId: string, taskId: string) => {
    setOnboardings(prev => prev.map(o => {
      if (o.id !== onboardId) return o;
      const updatedTarefas = o.tarefas.map((t: any) => t.id === taskId ? { ...t, concluida: !t.concluida } : t);
      const total = updatedTarefas.length;
      const completed = updatedTarefas.filter((t: any) => t.concluida).length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const updatedOnboarding = {
        ...o,
        tarefas: updatedTarefas,
        progresso: progress
      };
      
      if (selectedOnboardingDetail && selectedOnboardingDetail.id === onboardId) {
        setSelectedOnboardingDetail(updatedOnboarding);
      }

      return updatedOnboarding;
    }));
  };

  const handleDeleteOnboarding = (oId: string) => {
    if (window.confirm('Deseja excluir esta jornada de onboarding?')) {
      setOnboardings(prev => prev.filter(o => o.id !== oId));
      addToast('Onboarding excluído.', 'info');
      setSelectedOnboardingDetail(null);
    }
  };

  const handleFinalizeOnboarding = (onboard: any) => {
    if (window.confirm(`Deseja efetivar "${onboard.colaboradorNome}" no quadro de colaboradores ativos?`)) {
      // Simulate adding a full clt record or simply updating
      const newColab = {
        id: `c_${Date.now()}`,
        nome: onboard.colaboradorNome,
        cpf: '000.000.000-00',
        rg: '00.000.000-0',
        tipo: 'funcionario',
        cargo: onboard.cargoOriginal,
        salario_base: 3200,
        banco_nome: 'Itaú Unibanco',
        banco_agencia: '0123',
        banco_conta: '45678-9',
        status: 'ativo',
        deleted: false,
        created_at: new Date().toISOString()
      };
      
      // Let's add directly to dbState colaboradores if available
      setDbState((prev: any) => ({
        ...prev,
        colaboradores: [...(prev.colaboradores || []), newColab]
      }));

      setOnboardings(prev => prev.filter(o => o.id !== onboard.id));
      addToast(`Parabéns! "${onboard.colaboradorNome}" concluído com 100% e admitido oficialmente como colaborador ativo!`, 'success');
      setSelectedOnboardingDetail(null);
    }
  };

  // Trainings
  const handleSaveTreinamento = () => {
    if (!treinamentoForm.titulo || !treinamentoForm.instrutor) {
      addToast('Preencha ao menos o título e instrutor do curso.', 'error');
      return;
    }

    if (editingTreinamento) {
      setTreinamentos(prev => prev.map(t => t.id === editingTreinamento.id ? { ...t, ...treinamentoForm } : t));
      addToast(`Treinamento "${treinamentoForm.titulo}" atualizado!`, 'success');
    } else {
      const newTr = {
        id: `tr_${Date.now()}`,
        ...treinamentoForm,
        progresso: Number(treinamentoForm.progresso) || 0
      };
      setTreinamentos(prev => [...prev, newTr]);
      addToast(`Curso "${treinamentoForm.titulo}" inserido no catálogo!`, 'success');
    }
    setShowTreinamentoModal(false);
    setEditingTreinamento(null);
  };

  const handleDeleteTreinamento = (trId: string) => {
    if (window.confirm('Remover esse treinamento do catálogo?')) {
      setTreinamentos(prev => prev.filter(t => t.id !== trId));
      addToast('Curso excluído.', 'info');
    }
  };

  // Performance Cycles
  const handleSaveDesempenho = () => {
    if (!desempenhoForm.ciclo || !desempenhoForm.periodo) {
      addToast('O nome do ciclo de avaliação e o período são obrigatórios.', 'error');
      return;
    }

    if (editingDesempenho) {
      setDesempenhoCiclos(prev => prev.map(d => d.id === editingDesempenho.id ? { ...d, ...desempenhoForm } : d));
      addToast(`Ciclo de avaliação "${desempenhoForm.ciclo}" atualizado!`, 'success');
    } else {
      const newD = {
        id: `d_${Date.now()}`,
        ...desempenhoForm,
        avaliadosCount: Number(desempenhoForm.avaliadosCount) || 0,
        taxaParticipacao: Number(desempenhoForm.taxaParticipacao) || 0
      };
      setDesempenhoCiclos(prev => [...prev, newD]);
      addToast(`Novo ciclo de avaliação "${desempenhoForm.ciclo}" planejado com sucesso!`, 'success');
    }
    setShowDesempenhoModal(false);
    setEditingDesempenho(null);
  };

  const handleDeleteDesempenho = (dId: string) => {
    if (window.confirm('Excluir este ciclo de avaliação? Os registros históricos serão excluídos.')) {
      setDesempenhoCiclos(prev => prev.filter(d => d.id !== dId));
      addToast('Ciclo de avaliação excluído do histórico.', 'info');
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
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Clock size={16} className="text-indigo-600" /> Controle de Ponto & Ocupacional
                </h3>
                <p className="text-xs text-slate-500">Gestão integrada de escalas, jornadas de trabalho, atestados e transmissão automática de SST ao eSocial Fase 4.</p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <button 
                  onClick={() => {
                    setPontoForm({
                      id: '',
                      colaborador_id: colaboradores[0]?.id || '',
                      colaborador: colaboradores[0]?.nome || '',
                      data: getTodayDate(),
                      entrada: '08:00',
                      alm_saida: '12:00',
                      alm_retorno: '13:00',
                      saida: '17:00',
                      justificativa: '',
                      atestado_anexo: '',
                      banco_ou_folha: 'folha',
                      tipo_registro: 'trabalhado'
                    });
                    setEditingPonto(null);
                    setShowPontoModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Lançar Batida / Ausência
                </button>
              </div>
            </div>

            {/* Sub-Tabs Navigator */}
            <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <button 
                onClick={() => setPontoSubTab('jornadas')}
                className={`py-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${pontoSubTab === 'jornadas' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-indigo-600'}`}
              >
                <Clock size={14} /> Registrar Jornadas ({pontoPunches.length})
              </button>
              <button 
                onClick={() => setPontoSubTab('planilha')}
                className={`py-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${pontoSubTab === 'planilha' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-indigo-600'}`}
              >
                <FileSpreadsheet size={14} /> Planilha de Ponto (Mensal)
              </button>
              <button 
                onClick={() => setPontoSubTab('escalas')}
                className={`py-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${pontoSubTab === 'escalas' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-indigo-600'}`}
              >
                <Calendar size={14} /> Escalas & Folgas
              </button>
              <button 
                onClick={() => setPontoSubTab('justificativas')}
                className={`py-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${pontoSubTab === 'justificativas' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-indigo-600'}`}
              >
                <FileText size={14} /> Justificativas & Atestados ({(pontoAtestados).length})
              </button>
              <button 
                onClick={() => setPontoSubTab('integracao')}
                className={`py-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${pontoSubTab === 'integracao' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-indigo-600'}`}
              >
                <RefreshCw size={14} /> Integração Folha
              </button>
              <button 
                onClick={() => setPontoSubTab('relatorios')}
                className={`py-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${pontoSubTab === 'relatorios' ? 'border-indigo-600 text-indigo-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-indigo-600'}`}
              >
                <TrendingUp size={14} /> Relatórios & Alertas
              </button>
            </div>

            {/* SUBTAB 1 - JORNADAS DE TRABALHO */}
            {pontoSubTab === 'jornadas' && (
              <div className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={13} />
                    <input 
                      type="text" 
                      placeholder="Buscar por colaborador..."
                      value={colabSearch}
                      onChange={(e) => setColabSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 pl-8.5 rounded-lg text-xs outline-hidden font-semibold text-slate-700"
                    />
                  </div>
                  <div>
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs outline-hidden font-semibold text-slate-700"
                    >
                      {Array.from(availableMonths).map((m: any) => (
                        <option key={m} value={m}>{m.split('-')[1]}/{m.split('-')[0]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Exibir:</label>
                    <button 
                      onClick={() => setColabStatusFilter(colabStatusFilter === 'todos' ? 'ativo' : 'todos')}
                      className={`text-[10px] uppercase font-black px-2 py-1 rounded border transition-all ${colabStatusFilter === 'todos' ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}
                    >
                      {colabStatusFilter === 'todos' ? 'Todos' : 'Somente Inconsistentes'}
                    </button>
                  </div>
                </div>

                {/* Table Layout */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Colaborador</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Data</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Entrada</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Almoço (S/R)</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Saída</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Trabalhado</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Extras</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Ocupação / Status</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pontoPunches
                        .filter((p: any) => {
                          const matchesSearch = p.colaborador?.toLowerCase().includes(colabSearch.toLowerCase());
                          const matchesMonth = p.data?.startsWith(selectedMonth);
                          const matchesInconsistencies = colabStatusFilter === 'todos' ? true : p.inconsistente;
                          return matchesSearch && matchesMonth && matchesInconsistencies;
                        })
                        .length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-12 text-center text-slate-500 bg-white">
                            <Clock size={32} className="mx-auto text-slate-300 mb-2 animate-bounce" />
                            <p className="font-semibold text-slate-600">Nenhum registro de ponto encontrado para a pesquisa</p>
                            <p className="text-xs text-slate-400 mt-0.5">Altere os filtros acima ou lance uma nova batida / ausência de obreiro.</p>
                          </td>
                        </tr>
                      ) : (
                        pontoPunches
                          .filter((p: any) => {
                            const matchesSearch = p.colaborador?.toLowerCase().includes(colabSearch.toLowerCase());
                            const matchesMonth = p.data?.startsWith(selectedMonth);
                            const matchesInconsistencies = colabStatusFilter === 'todos' ? true : p.inconsistente;
                            return matchesSearch && matchesMonth && matchesInconsistencies;
                          })
                          .map((p: any) => (
                            <tr key={p.id} className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors ${p.inconsistente ? 'bg-amber-50/30' : ''}`}>
                              <td className="px-4 py-3 text-xs font-bold text-slate-800">
                                {p.colaborador}
                                {p.inconsistente && (
                                  <span className="block text-[8px] text-amber-600 font-extrabold uppercase mt-0.5 flex items-center gap-0.5">
                                    <AlertCircle size={9} /> {p.alerta}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-600 font-bold whitespace-nowrap">
                                {p.data ? new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-505 font-mono font-bold">
                                {p.entrada || '--:--'}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                                {p.alm_saida ? `${p.alm_saida} - ${p.alm_retorno}` : <span className="text-slate-300 font-semibold text-[10px]">Sem intervalo</span>}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-505 font-mono font-bold">
                                {p.saida || '--:--'}
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-slate-700 font-mono">
                                {p.horas_trabalhadas ? `${p.horas_trabalhadas.toFixed(2)}h` : '0.00h'}
                              </td>
                              <td className="px-4 py-3 text-xs font-mono">
                                {p.horas_extras > 0 ? (
                                  <span className="text-emerald-700 font-extrabold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 w-fit">
                                    <ArrowUpRight size={10} /> +{p.horas_extras.toFixed(2)}h
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-semibold">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                  p.status === 'Inconsistente' ? 'bg-amber-100 border-amber-300 text-amber-800' :
                                  p.status === 'Justificado' ? 'bg-blue-100 border-blue-300 text-blue-800' :
                                  p.status === 'Falta' ? 'bg-rose-100 border-rose-300 text-rose-800' :
                                  p.status?.includes('Extras') ? 'bg-emerald-100 border-emerald-350 text-emerald-800 animate-pulse' :
                                  'bg-slate-100 border-slate-300 text-slate-600'
                                }`}>
                                  {p.status}
                                </span>
                                {p.justificativa && (
                                  <span className="block text-[9px] text-slate-450 italic mt-0.5 font-bold truncate max-w-[150px]">
                                    Motivo: {p.justificativa}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex gap-1">
                                  <button 
                                    onClick={() => {
                                      setEditingPonto(p);
                                      setPontoForm({
                                        id: p.id,
                                        colaborador_id: p.colaborador_id || '',
                                        colaborador: p.colaborador,
                                        data: p.data,
                                        entrada: p.entrada || '08:00',
                                        alm_saida: p.alm_saida || '12:00',
                                        alm_retorno: p.alm_retorno || '13:00',
                                        saida: p.saida || '17:00',
                                        justificativa: p.justificativa || '',
                                        atestado_anexo: p.atestado_anexo || '',
                                        banco_ou_folha: p.horas_extras > 0 && pontoConfigs.horasExtrasModo === 'banco' ? 'banco' : 'folha',
                                        tipo_registro: p.status === 'Falta' ? 'falta' : p.status === 'Justificado' ? 'atestado' : 'trabalhado'
                                      });
                                      setShowPontoModal(true);
                                    }}
                                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                                    title="Editar Batida"
                                  >
                                    <Edit size={13} />
                                  </button>
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
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-200 rounded-xl">
                  <span className="text-[11px] text-slate-600 font-semibold flex items-center gap-1">
                    <Shield size={12} className="text-emerald-600" /> Sincronização eSocial Fase 4 (SST/Jornadas de Trabalho e Descansos) homologada e ativa.
                  </span>
                  <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded font-black uppercase">Homologado</span>
                </div>
              </div>
            )}

            {pontoSubTab === 'planilha' && (
              <div className="space-y-4">
                {/* Spreadsheet Top Control Panel */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-slate-500 mb-1">Colaborador</label>
                      <select
                        value={planilhaColabId}
                        onChange={(e) => setPlanilhaColabId(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                      >
                        {colaboradores.filter((c: any) => !c.deleted).map((c: any) => (
                          <option key={c.id} value={c.id}>{c.nome} ({c.cargo || 'Funcional'})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-slate-500 mb-1">Mês de Referência</label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                      >
                        {availableMonths.map((m: any) => (
                          <option key={m} value={m}>{m.split('-').reverse().join('/')}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoFillPlanilha}
                      className="bg-white hover:bg-slate-100 border border-slate-250 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-left"
                      title="Preenche automaticamente todos os dias de semana com os horários padrão da escala"
                    >
                      <Sparkles size={14} className="text-amber-500 animate-pulse" /> Autopreencher Escala
                    </button>

                    <button
                      type="button"
                      onClick={handleSavePlanilhaToDB}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={14} /> Salvar Planilha do Mês
                    </button>
                  </div>
                </div>

                {/* Summation Summary Cards Dashboard */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-sans">
                  <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">Dias Trabalhados</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-black text-slate-800">{spreadsheetSummary.totalTrabalhados}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">dias</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-rose-500">Total Faltas</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-black text-rose-600">{spreadsheetSummary.totalFaltas}</span>
                      <span className="text-[10px] text-rose-400 font-semibold">faltas</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-blue-500">Atestados Médicos</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-black text-blue-600">{spreadsheetSummary.totalAtestados}</span>
                      <span className="text-[10px] text-blue-400 font-semibold">abonos</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-600">Total Horas Extras</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-black text-emerald-600">+{spreadsheetSummary.totalExtras.toFixed(1)}</span>
                      <span className="text-[10px] text-emerald-500 font-semibold font-sans">horas</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-600">Saldo Negativo</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-black text-amber-600">-{spreadsheetSummary.totalNegativas.toFixed(1)}</span>
                      <span className="text-[10px] text-amber-500 font-semibold font-sans">horas</span>
                    </div>
                  </div>
                </div>

                {/* Direct Typing Worksheet Table */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileSpreadsheet size={15} className="text-indigo-600" /> Folha de Apontamento Individual Rápido
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Digite os horários diretamente na planilha. Linhas com cor diferente indicam finais de semana ou abonos.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-150 text-[10px] font-black uppercase text-slate-500">
                          <th className="py-2.5 px-3 w-28">Dia / Semana</th>
                          <th className="py-2.5 px-3 w-36">Tipo Registro</th>
                          <th className="py-2.5 px-3 text-center">Entrada</th>
                          <th className="py-2.5 px-3 text-center">Saída Alm.</th>
                          <th className="py-2.5 px-3 text-center">Ret. Alm.</th>
                          <th className="py-2.5 px-3 text-center">Saída</th>
                          <th className="py-2.5 px-3 text-center w-24">Hrs Trab.</th>
                          <th className="py-2.5 px-3 text-center w-24">Crédito/Déb.</th>
                          <th className="py-2.5 px-3 min-w-44">Justificativa / Motivo de Ausência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(gridEntries)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([dateStr, row]: [string, any]) => {
                            const isSun = isSundayOrHoliday(dateStr);
                            const [y, m, d] = dateStr.split('-');
                            const dObj = new Date(Number(y), Number(m)-1, Number(d));
                            const weekdayLabel = dObj.toLocaleDateString('pt-BR', { weekday: 'short' });
                            
                            // Format worked/extra hours
                            let workedHoursStr = '--:--';
                            let balanceStr = '0.0h';
                            let balanceClass = 'text-slate-450';
                            
                            if (row.tipo_registro === 'trabalhado' || (row.entrada && row.saida)) {
                              const hrs = calculateRowWorkedHours(row);
                              workedHoursStr = `${hrs.toFixed(1)}h`;
                              if (isSun) {
                                balanceStr = `+${hrs.toFixed(1)}h`;
                                balanceClass = 'text-emerald-600 font-extrabold';
                              } else {
                                if (hrs > 8) {
                                  balanceStr = `+${(hrs - 8).toFixed(1)}h`;
                                  balanceClass = 'text-emerald-600 font-extrabold';
                                } else if (hrs < 8) {
                                  balanceStr = `-${(8 - hrs).toFixed(1)}h`;
                                  balanceClass = 'text-rose-600 font-extrabold';
                                } else {
                                  balanceStr = 'Salvo';
                                  balanceClass = 'text-slate-500';
                                }
                              }
                            } else if (row.tipo_registro === 'falta') {
                              workedHoursStr = '0h';
                              balanceStr = '-8.0h';
                              balanceClass = 'text-rose-600 font-extrabold';
                            } else if (row.tipo_registro === 'atestado') {
                              workedHoursStr = '0h';
                              balanceStr = 'Abonado';
                              balanceClass = 'text-blue-600 font-bold';
                            } else if (row.tipo_registro === 'folga') {
                              workedHoursStr = '0h';
                              balanceStr = 'Folga';
                              balanceClass = 'text-slate-400';
                            }

                            // Define row accent colors
                            let rowBg = 'hover:bg-slate-50/50';
                            if (isSun) rowBg = 'bg-amber-50/20 hover:bg-amber-50/40 text-amber-900';
                            else if (row.tipo_registro === 'falta') rowBg = 'bg-rose-50/20 hover:bg-rose-50/40';
                            else if (row.tipo_registro === 'atestado') rowBg = 'bg-blue-50/20 hover:bg-blue-50/40';

                            return (
                              <tr key={dateStr} className={`border-b border-slate-100 text-xs transition-colors ${rowBg}`}>
                                <td className="py-1 px-3 font-semibold text-slate-700">
                                  <span className="font-extrabold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded mr-1 text-[10px]">
                                    {d}
                                  </span>
                                  <span className="capitalize">{weekdayLabel}</span>
                                </td>
                                
                                <td className="py-1 px-2">
                                  <select
                                    value={row.tipo_registro}
                                    onChange={(e) => handleGridCellChange(dateStr, 'tipo_registro', e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-md px-1.5 py-1 text-[11px] font-semibold w-full outline-none focus:bg-white cursor-pointer"
                                  >
                                    <option value="pendente">Não Batido/Vazio</option>
                                    <option value="trabalhado">Trabalhado (Regular)</option>
                                    <option value="falta">Falta (Descontar)</option>
                                    <option value="atestado">Atestado / Abono</option>
                                    <option value="folga">DSR / Folga Semanal</option>
                                  </select>
                                </td>

                                <td className="py-1 px-1 text-center">
                                  <input
                                    type="time"
                                    value={row.entrada}
                                    disabled={row.tipo_registro === 'falta' || row.tipo_registro === 'atestado' || row.tipo_registro === 'folga'}
                                    onChange={(e) => handleGridCellChange(dateStr, 'entrada', e.target.value)}
                                    className="bg-transparent border border-transparent hover:border-slate-350 focus:border-indigo-500 focus:bg-white rounded px-1 px-1.5 py-1 text-xs text-center outline-none w-20 font-semibold disabled:opacity-50"
                                  />
                                </td>

                                <td className="py-1 px-1 text-center">
                                  <input
                                    type="time"
                                    value={row.alm_saida}
                                    disabled={row.tipo_registro === 'falta' || row.tipo_registro === 'atestado' || row.tipo_registro === 'folga'}
                                    onChange={(e) => handleGridCellChange(dateStr, 'alm_saida', e.target.value)}
                                    className="bg-transparent border border-transparent hover:border-slate-355 focus:border-indigo-500 focus:bg-white rounded px-1 px-1.5 py-1 text-xs text-center outline-none w-20 font-semibold disabled:opacity-50"
                                  />
                                </td>

                                <td className="py-1 px-1 text-center">
                                  <input
                                    type="time"
                                    value={row.alm_retorno}
                                    disabled={row.tipo_registro === 'falta' || row.tipo_registro === 'atestado' || row.tipo_registro === 'folga'}
                                    onChange={(e) => handleGridCellChange(dateStr, 'alm_retorno', e.target.value)}
                                    className="bg-transparent border border-transparent hover:border-slate-355 focus:border-indigo-500 focus:bg-white rounded px-1 px-1.5 py-1 text-xs text-center outline-none w-20 font-semibold disabled:opacity-50"
                                  />
                                </td>

                                <td className="py-1 px-1 text-center">
                                  <input
                                    type="time"
                                    value={row.saida}
                                    disabled={row.tipo_registro === 'falta' || row.tipo_registro === 'atestado' || row.tipo_registro === 'folga'}
                                    onChange={(e) => handleGridCellChange(dateStr, 'saida', e.target.value)}
                                    className="bg-transparent border border-transparent hover:border-slate-355 focus:border-indigo-500 focus:bg-white rounded px-1 px-1.5 py-1 text-xs text-center outline-none w-20 font-semibold disabled:opacity-50"
                                  />
                                </td>

                                <td className="py-1 px-2 text-center font-bold text-slate-750">
                                  {workedHoursStr}
                                </td>

                                <td className={`py-1 px-2 text-center font-bold ${balanceClass}`}>
                                  {balanceStr}
                                </td>

                                <td className="py-1 px-3">
                                  <input
                                    type="text"
                                    value={row.justificativa}
                                    disabled={row.tipo_registro === 'folga' || row.tipo_registro === 'pendente'}
                                    onChange={(e) => handleGridCellChange(dateStr, 'justificativa', e.target.value)}
                                    placeholder={
                                      row.tipo_registro === 'falta' ? 'Motivo da Falta...' : 
                                      row.tipo_registro === 'atestado' ? 'Nº do CID / Clinica...' : 
                                      'Anotação de atraso/compensação...'
                                    }
                                    className="bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white rounded px-2 py-0.5 text-xs outline-none w-full font-medium text-slate-600 disabled:opacity-50 placeholder:text-slate-350"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-2">
                    <span className="text-[10px] text-slate-450 font-semibold flex items-center gap-1.5">
                      <ShieldAlert size={12} className="text-indigo-650" /> Transmissão direta para o portal de ponto consolidada e monitoramento de horas negativas ativo.
                    </span>
                    <button
                      type="button"
                      onClick={handleSavePlanilhaToDB}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={14} /> Fechar e Gravar Planilha Mensal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2 - ESCALAS E FOLGAS */}
            {pontoSubTab === 'escalas' && (
              <div className="space-y-4">
                <div className="bg-indigo-50/50 border border-indigo-150 p-4 rounded-xl flex items-start gap-3 text-left">
                  <Info className="text-indigo-600 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-xs font-black text-indigo-900 uppercase">Configuração de Turnos Fiscais & Descanso Semanal Obrigatório</h4>
                    <p className="text-[11px] text-indigo-705 leading-relaxed mt-0.5">
                      Conforme determina a regulamentação brasileira das entidades eclesiásticas e terceiro setor, o GIPP impõe o controle preventivo para garantir no mínimo 1 folga semanal de 24 horas (Descanso Semanal Remunerado - DSR) para cada trabalhador contratado ou obreiro com jornada reconhecida.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs mt-4">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Colaborador</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Tipo de Escala</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Carga Horária</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Jornada Padrão</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Folga Semanal Regulamentar (DSR)</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pontoEscalas.map((esc) => (
                        <tr key={esc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-xs font-bold text-slate-800">{esc.colaborador}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 font-semibold">
                            <span className="bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 border border-indigo-150 rounded text-[10px]">
                              {esc.tipo_escala}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 font-mono font-bold">{esc.carga_horaria}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 font-mono font-bold">{esc.entrada} - {esc.saida}</td>
                          <td className="px-4 py-3 text-xs text-emerald-700 font-bold">{esc.folga_semanal}</td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => {
                                const novaF = prompt(`Qual o novo dia/formato de folga semanal (DSR) de ${esc.colaborador}?`, esc.folga_semanal);
                                if (novaF !== null) {
                                  setPontoEscalas(prev => prev.map(item => item.id === esc.id ? { ...item, folga_semanal: novaF } : item));
                                  addToast('Escala de folga atualizada com sucesso!', 'success');
                                }
                              }}
                              className="px-2.5 py-1 text-[10px] bg-slate-100 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-all font-bold"
                            >
                              Alterar Escala
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBTAB 3 - JUSTIFICATIVAS E ATESTADOS */}
            {pontoSubTab === 'justificativas' && (
              <div className="space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column - Submit Justification Form */}
                  <div className="md:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-205 flex flex-col justify-between h-fit gap-4">
                    <div>
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200 flex items-center gap-1">
                        <Upload size={14} className="text-indigo-600" /> Enviar Atestado / Abono
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
                        Faça o lançamento preventivo de ausências por motivo de saúde ou representações missionárias. Após aprovação da gestão, as faltas correspondentes não gerarão descontos na folha de pagamento.
                      </p>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase font-bold text-slate-500">Colaborador</label>
                          <select 
                            id="ponto_atestado_colab" 
                            className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs"
                          >
                            <option value="">Selecione...</option>
                            {colaboradores.length > 0 ? (
                              colaboradores.filter((c:any) => !c.deleted).map((c: any) => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                              ))
                            ) : (
                              pontoEscalas.map((e: any) => (
                                <option key={e.id} value={e.id}>{e.colaborador}</option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase font-bold text-slate-500">Data de Ausência</label>
                          <input 
                            id="ponto_atestado_data" 
                            type="date" 
                            defaultValue={getTodayDate()}
                            className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs font-semibold text-slate-700" 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase font-bold text-slate-500">Motivo do Afastamento</label>
                          <input 
                            id="ponto_atestado_motivo" 
                            type="text" 
                            placeholder="Ex: Atestado de Gripe, Doação de Sangue"
                            className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs font-semibold" 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase font-bold text-slate-505">Anexar Comprovante / PDF</label>
                          <input 
                            id="ponto_atestado_file" 
                            type="file" 
                            title="Selecione o arquivo de atestado do obreiro"
                            className="w-full text-[10px] text-slate-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer" 
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const colSelect = document.getElementById('ponto_atestado_colab') as HTMLSelectElement;
                        const dataVal = document.getElementById('ponto_atestado_data') as HTMLInputElement;
                        const motivoVal = document.getElementById('ponto_atestado_motivo') as HTMLInputElement;
                        const fileVal = document.getElementById('ponto_atestado_file') as HTMLInputElement;

                        if (!colSelect.value || !motivoVal.value) {
                          addToast('Preencha os campos de colaborador e motivo do atestado.', 'error');
                          return;
                        }

                        const selectedName = colSelect.options[colSelect.selectedIndex].text;
                        const fileName = fileVal?.files?.[0]?.name || 'atestado_simulado.pdf';

                        const novoAt = {
                          id: `at_${Date.now()}`,
                          colaborador_id: colSelect.value,
                          colaborador: selectedName,
                          data_envio: getTodayDate(),
                          data_ausencia: dataVal.value,
                          motivo: motivoVal.value,
                          arquivo: fileName,
                          status: 'Pendente',
                          validador: ''
                        };

                        setPontoAtestados(prev => [novoAt, ...prev]);
                        
                        // also automatically insert punch marked as justified so there are no default deductions
                        const punchId = `po_at_${Date.now()}`;
                        setPontoPunches(prev => [
                          {
                            id: punchId,
                            colaborador_id: colSelect.value,
                            colaborador: selectedName,
                            data: dataVal.value,
                            entrada: '',
                            alm_saida: '',
                            alm_retorno: '',
                            saida: '',
                            horas_trabalhadas: 0,
                            horas_extras: 0,
                            status: 'Justificado',
                            inconsistente: false,
                            justificativa: motivoVal.value,
                            atestado_anexo: fileName
                          },
                          ...prev
                        ]);

                        addToast('Atestado enviado com sucesso! Aguarde validação do RH.', 'success');
                        
                        // Reset simple inputs
                        motivoVal.value = '';
                        if (fileVal) fileVal.value = '';
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer mt-2"
                    >
                      <Plus size={12} /> Salvar e Enviar Atestado / Abono
                    </button>
                  </div>

                  {/* Right Column - Atestados Table Grid */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-xs font-black text-[#1e293b] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      Registro Histórico de Justificativas para Auditoria eSocial
                    </h4>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
                          <tr>
                            <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Colaborador</th>
                            <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Ausência / Envio</th>
                            <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Justificativa</th>
                            <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Documento</th>
                            <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pontoAtestados.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                Nenhum atestado ou justificativa de abono pendente.
                              </td>
                            </tr>
                          ) : (
                            pontoAtestados.map((at) => (
                              <tr key={at.id} className="border-b border-slate-100 font-sans text-xs">
                                <td className="px-4 py-3 font-bold text-slate-800">{at.colaborador}</td>
                                <td className="px-4 py-3 text-slate-650">
                                  <span className="font-semibold block">{new Date(at.data_ausencia + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                  <span className="text-[9px] text-slate-400 font-mono block">Enviado: {new Date(at.data_envio + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                </td>
                                <td className="px-4 py-3 text-slate-600 font-semibold">{at.motivo}</td>
                                <td className="px-4 py-3 font-mono text-[10px] text-indigo-600 font-bold max-w-[120px] truncate flex items-center gap-1 mt-1.5">
                                  <Paperclip size={10} /> {at.arquivo}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                    at.status === 'Aprovado' ? 'bg-[#f0fdf4] text-emerald-800 border-emerald-250' : 
                                    at.status === 'Rejeitado' ? 'bg-rose-50 text-rose-850 border-rose-200' : 
                                    'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                                  }`}>
                                    {at.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  {at.status === 'Pendente' ? (
                                    <div className="inline-flex gap-1">
                                      <button 
                                        onClick={() => {
                                          setPontoAtestados(prev => prev.map(item => item.id === at.id ? { ...item, status: 'Aprovado', validador: 'RH GIPP' } : item));
                                          
                                          // check if corresponding punct exist to set status "Justificado"
                                          setPontoPunches(prev => prev.map(p => 
                                            (p.colaborador_id === at.colaborador_id && p.data === at.data_ausencia) 
                                              ? { ...p, status: 'Justificado', justificativa: at.motivo, atestado_anexo: at.arquivo } 
                                              : p
                                          ));

                                          addToast('Atestado odontológico/médico validado e aceito pelo RH com sucesso!', 'success');
                                        }}
                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200 cursor-pointer"
                                        title="Aprovar Comprovante"
                                      >
                                        <Check size={11} />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setPontoAtestados(prev => prev.map(item => item.id === at.id ? { ...item, status: 'Rejeitado' } : item));
                                          
                                          // set back to Falta
                                          setPontoPunches(prev => prev.map(p => 
                                            (p.colaborador_id === at.colaborador_id && p.data === at.data_ausencia) 
                                              ? { ...p, status: 'Falta', justificativa: '', atestado_anexo: '', inconsistente: false } 
                                              : p
                                          ));

                                          addToast('Envio rejeitado. Ausência será marcada como falta não justificada no contracheque.', 'warning');
                                        }}
                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 cursor-pointer"
                                        title="Rejeitar Comprovante"
                                      >
                                        <X size={11} />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-semibold">{at.validador || 'Processado'}</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4 - INTEGRAÇÃO COM FOLHA DE PAGAMENTO */}
            {pontoSubTab === 'integracao' && (
              <div className="space-y-4 text-left">
                <div className="bg-emerald-50/55 border border-emerald-200 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-emerald-900 uppercase flex items-center gap-1">
                      <Sparkles size={14} className="text-emerald-600" /> Sincronização em Tempo Real de Horas e Descontos Ocupacionais
                    </h4>
                    <p className="text-[11px] text-emerald-705 leading-relaxed max-w-4xl">
                      Nosso núcleo contábil lê e faz a correspondência automática entre as marcações auditadas e a folha do mês de referência. Horas extras acima de 8h diárias são geradas (50% nos dias normais e 100% aos domingos/DSR). Faltas sem justificativas médicas devidamente validadas aplicam o desconto de 1 dia de salário base na competência atual.
                    </p>
                  </div>
                  <button 
                    onClick={handleSyncPontoWithFolha}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <RefreshCw size={13} className="animate-spin" /> Sincronizar Controle de Ponto com Folha
                  </button>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                    Informativos Provisórios por Colaborador • Competência: {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {colaboradores.filter((c: any) => !c.deleted && c.status === 'ativo').map((c: any) => {
                      const punches = pontoPunches.filter((p: any) => p.colaborador_id === c.id && p.data?.startsWith(selectedMonth));
                      
                      let ex50 = 0;
                      let ex100 = 0;
                      let faltas = 0;

                      punches.forEach((p: any) => {
                        if (p.horas_extras > 0) {
                          if (p.status?.includes('100%') || isSundayOrHoliday(p.data)) {
                            ex100 += p.horas_extras;
                          } else {
                            ex50 += p.horas_extras;
                          }
                        }
                        if (p.status === 'Falta' && !p.justificativa) {
                          faltas++;
                        }
                      });

                      const baseHourly = (parseFloat(c.salario_base) || 0) / 220;
                      const baseDaily = (parseFloat(c.salario_base) || 0) / 30;

                      const valEx50 = ex50 * baseHourly * 1.5;
                      const valEx100 = ex100 * baseHourly * 2.0;
                      const valFaltas = faltas * baseDaily;

                      const totalProventosPonto = valEx50 + valEx100;
                      const hasSlip = (folhas || []).some((f: any) => f.colaborador_id === c.id && f.mes_referencia === selectedMonth);

                      return (
                        <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all">
                          <div>
                            <div className="flex justify-between items-start mb-2.5">
                              <div>
                                <h5 className="font-bold text-xs text-slate-800">{c.nome}</h5>
                                <p className="text-[10px] text-slate-450 uppercase font-black">{c.cargo || 'Obreiro'} • Salário: {formatBRL(c.salario_base || 0)}</p>
                              </div>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${hasSlip ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-205 text-slate-500'}`}>
                                {hasSlip ? 'Contracheque Gerado' : 'Sem Contracheque'}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-2 border-y border-dashed border-slate-200 mb-3 text-[11px] font-mono">
                              <div className="text-left">
                                <span className="block text-[8px] uppercase font-bold text-slate-400">H. Extras 50%</span>
                                <strong className="text-slate-700">{ex50.toFixed(1)}h</strong>
                                <span className="block text-[9px] text-[#059669] font-semibold">+{formatBRL(valEx50)}</span>
                              </div>
                              <div className="text-left">
                                <span className="block text-[8px] uppercase font-bold text-slate-400">H. Extras 100%</span>
                                <strong className="text-slate-700">{ex100.toFixed(1)}h</strong>
                                <span className="block text-[9px] text-[#059669] font-semibold">+{formatBRL(valEx100)}</span>
                              </div>
                              <div className="text-left">
                                <span className="block text-[8px] uppercase font-bold text-slate-400">Faltas N/Just.</span>
                                <strong className="text-[#dc2626] font-bold">{faltas} d</strong>
                                <span className="block text-[9px] text-[#dc2626] font-bold">-{formatBRL(valFaltas)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-1 text-[10px] font-semibold">
                            <span className="text-slate-500">Saldo Líquido Adicional:</span>
                            <span className={`font-black uppercase ${totalProventosPonto - valFaltas >= 0 ? 'text-[#059669]' : 'text-rose-600'}`}>
                              {totalProventosPonto - valFaltas >= 0 ? '+' : ''}{formatBRL(totalProventosPonto - valFaltas)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 5 - RELATÓRIOS E ALERTAS */}
            {pontoSubTab === 'relatorios' && (
              <div className="space-y-6 text-left">
                {/* Visual Widgets Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-black uppercase text-xs">Extras 50%</span>
                    <h5 className="text-2xl font-black text-slate-800 mt-2 font-mono">
                      {pontoPunches.filter((p: any) => p.horas_extras > 0 && !(p.status?.includes('100%') || isSundayOrHoliday(p.data)) && p.data?.startsWith(selectedMonth)).reduce((acc, p) => acc + p.horas_extras, 0).toFixed(1)}h
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-1">Total de horas adicionais úteis no mês atual.</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black uppercase text-xs">Extras DSR (100%)</span>
                    <h5 className="text-2xl font-black text-slate-800 mt-2 font-mono">
                      {pontoPunches.filter((p: any) => p.horas_extras > 0 && (p.status?.includes('100%') || isSundayOrHoliday(p.data)) && p.data?.startsWith(selectedMonth)).reduce((acc, p) => acc + p.horas_extras, 0).toFixed(1)}h
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-1">Total trabalhado aos domingos e feriados religiosos.</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-black uppercase text-xs">Faltas do Mês</span>
                    <h5 className="text-2xl font-black text-rose-600 mt-2 font-mono">
                      {pontoPunches.filter((p: any) => p.status === 'Falta' && !p.justificativa && p.data?.startsWith(selectedMonth)).length}
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-1">Dias de faltas sem justificativas regulamentadas.</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black uppercase text-xs">Atestados de Saúde</span>
                    <h5 className="text-2xl font-black text-indigo-600 mt-2 font-mono">
                      {pontoAtestados.filter(at => at.status === 'Aprovado' && at.data_ausencia?.startsWith(selectedMonth)).length}
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-1">Casos médicos abonados e salvaguardados pelo RH.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Graphical overview */}
                  <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex justify-between items-center">
                      <span>Projeção de Horas Extras e Abscessos (Mês Atual)</span>
                      <button 
                        onClick={handleExportCSV}
                        className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Download size={11} /> Exportar CSV Completo
                      </button>
                    </h4>

                    {/* Simple dynamic bar summary for visual demonstration */}
                    <div className="space-y-4 pt-1 text-xs">
                      {colaboradores.filter((c: any) => !c.deleted && c.status === 'ativo').map((c: any) => {
                        const punches = pontoPunches.filter((p: any) => p.colaborador_id === c.id && p.data?.startsWith(selectedMonth));
                        const totExtra = punches.reduce((acc, p) => acc + (p.horas_extras || 0), 0);
                        const percent = Math.min(100, (totExtra / 20) * 100); // base limit of 20 hours a month

                        return (
                          <div key={c.id} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-700">{c.nome}</span>
                              <span className="font-mono text-[11px] font-extrabold text-slate-600">{totExtra.toFixed(1)} Horas Extras</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${percent}%` }}
                                className={`h-full rounded-full ${totExtra > pontoConfigs.horasExtrasLimiteDiario * 10 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Inconsistency & Limit Alerts Panel */}
                  <div className="md:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <h4 className="text-xs font-black text-[#dc2626] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-[#dc2626]" /> Central de Inconsistências & Alertas
                    </h4>
                    <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
                      A auditoria do GIPP detecta instantaneamente marcações suspeitas, batidas esquecidas ou horas extras que desrespeitam o teto limite recomendado pelo regulamento do terceiro setor.
                    </p>

                    <div className="space-y-2.5">
                      {pontoPunches.filter((p: any) => p.inconsistente && p.data?.startsWith(selectedMonth)).map((p: any) => (
                        <div key={p.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] leading-relaxed flex items-start gap-2">
                          <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-850 block">{p.colaborador}</strong>
                            <p className="text-amber-705 text-[10px] mt-0.5">{p.alerta}</p>
                            <span className="text-[9px] text-slate-400 block mt-1">Data correspondente: {new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      ))}

                      {/* Overtime Limit Warning */}
                      {colaboradores.map((c: any) => {
                        const punches = pontoPunches.filter((p: any) => p.colaborador_id === c.id && p.data?.startsWith(selectedMonth));
                        const highExtras = punches.filter((p: any) => p.horas_extras > pontoConfigs.horasExtrasLimiteDiario);
                        if (highExtras.length > 0) {
                          return (
                            <div key={`alert_${c.id}`} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] leading-relaxed flex items-start gap-2">
                              <ShieldAlert size={14} className="text-rose-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-rose-850 block">{c.nome}</strong>
                                <p className="text-rose-705 text-[10px] mt-0.5">Jornada extra acima do limite regulamentar contábil/fiscal de {pontoConfigs.horasExtrasLimiteDiario}h por dia.</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}

                      {pontoPunches.filter(p => p.inconsistente).length === 0 && (
                        <p className="text-slate-400 text-center text-[11px] py-4">
                          Auditado com sucesso! Nenhuma inconsistência fiscal identificada na competência.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Printable Section Option */}
                <div className="border border-indigo-150 p-6 rounded-2xl bg-[#faf5ff] border-indigo-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-indigo-900 uppercase flex items-center gap-1.5">
                      <Printer size={14} className="text-indigo-600" /> Folha de Ponto Ocupacional Pronta para Impressão Manual ou Assinatura
                    </h5>
                    <p className="text-[11px] text-indigo-705 max-w-4xl leading-relaxed">
                      Emita a folha de ponto mensal de qualquer trabalhador ativa em segundos! Você pode emitir a <strong>Folha Preenchida</strong> (com todos os registros e saldos automatizados) ou a <strong>Folha em Branco</strong> (para preenchimento de manuscrito e assinaturas holísticas para pregações avulsas nos cultos locais).
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const colSelected = prompt("Selecione qual Colaborador deseja imprimir:\n" + pontoEscalas.map((e, index) => `${index+1}. ${e.colaborador}`).join('\n'));
                        if (colSelected) {
                          const idx = Number(colSelected) - 1;
                          if (pontoEscalas[idx]) {
                            const emp = pontoEscalas[idx];
                            const days = getDaysInMonth(selectedMonth);
                            const printableRows = days.map((dayDate: Date) => {
                              const dStr = dayDate.toISOString().split('T')[0];
                              const p = pontoPunches.find(p => p.colaborador_id === emp.colaborador_id && p.data === dStr);
                              return {
                                dia: dayDate.getDate(),
                                diaSemana: dayDate.toLocaleDateString('pt-BR', { weekday: 'short' }),
                                entrada: p ? p.entrada || '' : '',
                                alm_saida: p ? p.alm_saida || '' : '',
                                alm_retorno: p ? p.alm_retorno || '' : '',
                                saida: p ? p.saida || '' : '',
                                assinatura: p ? (p.status === 'Justificado' ? `JUSTIFICADO: ${p.justificativa}` : 'Eletrônico') : ''
                              };
                            });

                            // Setup global printable printData
                            setPrintMode(true);
                            setPrintData({
                              tipo: 'Ponto',
                              colaborador: emp.colaborador,
                              escala: emp.tipo_escala,
                              mes: selectedMonth,
                              rows: printableRows,
                              modo: 'preenchido'
                            });
                            // Open Preview
                            setPreviewOpen(true);
                          } else {
                            addToast('Opção inválida selecionada.', 'error');
                          }
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase. tracking-wider px-3 py-2 rounded-xl cursor-pointer transition-all"
                    >
                      Imprimir Preenchida
                    </button>
                    <button 
                      onClick={() => {
                        const colSelected = prompt("Selecione qual Colaborador deseja imprimir em branco:\n" + pontoEscalas.map((e, index) => `${index+1}. ${e.colaborador}`).join('\n'));
                        if (colSelected) {
                          const idx = Number(colSelected) - 1;
                          if (pontoEscalas[idx]) {
                            const emp = pontoEscalas[idx];
                            const days = getDaysInMonth(selectedMonth);
                            const printableRows = days.map((dayDate: Date) => {
                              return {
                                dia: dayDate.getDate(),
                                diaSemana: dayDate.toLocaleDateString('pt-BR', { weekday: 'short' }),
                                entrada: '__________________',
                                alm_saida: '__________',
                                alm_retorno: '__________',
                                saida: '__________________',
                                assinatura: '___________________________'
                              };
                            });

                            // Setup global printable printData
                            setPrintMode(true);
                            setPrintData({
                              tipo: 'Ponto',
                              colaborador: emp.colaborador,
                              escala: emp.tipo_escala,
                              mes: selectedMonth,
                              rows: printableRows,
                              modo: 'em_branco'
                            });
                            // Open Preview
                            setPreviewOpen(true);
                          } else {
                            addToast('Opção inválida selecionada.', 'error');
                          }
                        }
                      }}
                      className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl cursor-pointer transition-all"
                    >
                      Imprimir em Branco
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                       <button onClick={() => setShowDarfModal(true)} className="text-indigo-600 text-[10px] font-black uppercase tracking-wider hover:underline cursor-pointer">Emitir DARF</button>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-semibold text-slate-600 flex items-center gap-2"><Database size={14} className="text-orange-500" /> FGTS Digital</span>
                       <button onClick={() => setShowFgtsModal(true)} className="text-indigo-600 text-[10px] font-black uppercase tracking-wider hover:underline cursor-pointer">Acessar Guia</button>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-semibold text-slate-600 flex items-center gap-2"><Database size={14} className="text-emerald-500" /> DIRF Anual</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-black uppercase tracking-wider">Substituída</span>
                          <button onClick={() => setShowDirfModal(true)} className="text-indigo-600 text-[10px] font-black uppercase tracking-wider hover:underline cursor-pointer">Acessar Comprovante</button>
                        </div>
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
                    <p className="text-xs text-slate-500 mt-1">Gerencie processos seletivos, pipeline e triagem de candidatos.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    icon={Plus} 
                    onClick={() => {
                      setEditingVaga(null);
                      setVagaForm({
                        titulo: '',
                        codigo: `V-${Math.floor(Math.random() * 100) + 100}`,
                        depto: 'Administração',
                        status: 'ativa',
                        descricao: ''
                      });
                      setShowVagaModal(true);
                    }}
                    className="cursor-pointer"
                  >
                    Nova Vaga
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vagas.map((v: any) => {
                    const cCount = candidatos.filter(c => c.vagaId === v.id).length;
                    return (
                      <div key={v.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] px-2 py-1 rounded font-black uppercase tracking-wider ${v.status === 'ativa' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                              {v.status === 'ativa' ? 'Ativa' : 'Pausada'}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">Cód: {v.codigo}</span>
                          </div>
                          <h5 className="font-bold text-slate-800 text-sm mb-1">{v.titulo}</h5>
                          <p className="text-xs text-slate-400 font-semibold mb-2">{v.depto}</p>
                          <p className="text-xs text-slate-500 mb-4 line-clamp-2">{v.descricao || 'Atividade geral e operacional'}</p>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-2">
                          <span className="text-xs font-semibold text-slate-600">
                            <Users size={14} className="inline mr-1 text-slate-450" /> {cCount} Candidatos
                          </span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingVaga(v);
                                setVagaForm({
                                  titulo: v.titulo,
                                  codigo: v.codigo,
                                  depto: v.depto,
                                  status: v.status,
                                  descricao: v.descricao
                                });
                                setShowVagaModal(true);
                              }}
                              className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                              Editar
                            </button>
                            <span className="text-slate-300">|</span>
                            <button 
                              onClick={() => setSelectedVagaFunil(v)}
                              className="text-indigo-600 text-xs font-black hover:underline cursor-pointer"
                            >
                              Ver Funil
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {rhActiveTab === 'onboarding' && (
              <div className="animate-in fade-in space-y-6">
                <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div>
                    <h4 className="text-sm font-black text-blue-900">Integração de Novos Colaboradores</h4>
                    <p className="text-xs text-blue-700/80 mt-1">Acompanhe as trilhas administrativas, contratuais, teológicas e técnicas em andamento.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    icon={Plus}
                    onClick={() => {
                      setOnboardingForm({
                        colaboradorNome: '',
                        cargoOriginal: '',
                        dataInicio: getTodayDate(),
                        tarefasCustom: 'Assinatura do Contrato de Trabalho\nTreinamento de Integração\nFamiliarização com departamentos\nExame Clínico Ocupacional Admissional'
                      });
                      setShowOnboardingModal(true);
                    }}
                    className="cursor-pointer text-xs font-bold"
                  >
                    Adicionar Onboarding
                  </Button>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Colaborador</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Cargo Previsto</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider font-mono">Início</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Progresso (Trilha)</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {onboardings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            <UserPlus size={24} className="mx-auto text-slate-300 mb-2" />
                            <p className="font-semibold text-slate-600">Nenhum onboarding em andamento.</p>
                          </td>
                        </tr>
                      ) : (
                        onboardings.map((o: any) => (
                          <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-xs font-bold text-slate-700">{o.colaboradorNome}</td>
                            <td className="px-4 py-3 text-xs text-slate-600">{o.cargoOriginal}</td>
                            <td className="px-4 py-3 text-xs text-slate-500 font-mono">{o.dataInicio}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-[10px] font-bold text-slate-500 w-8">{o.progresso}%</span>
                                <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className={`h-1.5 rounded-full transition-all duration-305 ${o.progresso === 100 ? 'bg-emerald-500' : 'bg-indigo-650'}`}
                                    style={{ width: `${o.progresso}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs flex gap-3">
                              <button 
                                onClick={() => setSelectedOnboardingDetail(o)}
                                className="text-indigo-650 font-black hover:underline cursor-pointer"
                              >
                                {o.progresso === 100 ? 'Efetivar Admitido' : 'Ver Checklist'}
                              </button>
                              <button 
                                onClick={() => handleDeleteOnboarding(o.id)}
                                className="text-rose-500 font-semibold hover:underline cursor-pointer"
                              >
                                Excluir
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
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
                    <p className="text-xs text-slate-500 mt-1">Capacitação institucional legal e de desenvolvimento corporativo.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    icon={Plus}
                    onClick={() => {
                      setEditingTreinamento(null);
                      setTreinamentoForm({
                        titulo: '',
                        descricao: '',
                        progresso: 0,
                        instrutor: '',
                        cargaHoraria: '',
                        status: 'Ativo'
                      });
                      setShowTreinamentoModal(true);
                    }}
                    className="cursor-pointer"
                  >
                    Novo Curso
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {treinamentos.map((tr: any) => (
                    <div key={tr.id} className="border border-slate-200 p-4 bg-white rounded-xl shadow-xs flex flex-col justify-between hover:border-slate-350 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${tr.status === 'Ativo' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-505'}`}>
                          <BookOpen size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${tr.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {tr.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-semibold">{tr.cargaHoraria}h C.Horária</span>
                          </div>
                          <h5 className="font-bold text-sm text-slate-800 mt-1 truncate">{tr.titulo}</h5>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tr.descricao || 'Nenhuma descrição fornecida.'}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">Instrutor: <span className="text-slate-600">{tr.instrutor}</span></p>
                          
                          <div className="mt-4">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-1">
                              <span>Progresso / Participação</span>
                              <span className="text-slate-700">{tr.progresso}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-indigo-600 h-1.5 transition-all duration-300" style={{ width: `${tr.progresso}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 border-t border-slate-100 pt-2.5 mt-4">
                        <button 
                          onClick={() => {
                            setEditingTreinamento(tr);
                            setTreinamentoForm({
                              titulo: tr.titulo,
                              descricao: tr.descricao,
                              progresso: tr.progresso,
                              instrutor: tr.instrutor,
                              cargaHoraria: tr.cargaHoraria,
                              status: tr.status
                            });
                            setShowTreinamentoModal(true);
                          }}
                          className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          Editar Curso
                        </button>
                        <span className="text-slate-200">|</span>
                        <button 
                          onClick={() => handleDeleteTreinamento(tr.id)}
                          className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
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
                  <Button 
                    size="sm" 
                    variant="primary" 
                    icon={Plus} 
                    onClick={() => {
                      setEditingDesempenho(null);
                      setDesempenhoForm({
                        ciclo: '',
                        periodo: `${getTodayDate().split('-')[0]} Ano Ref`,
                        status: 'Planejamento',
                        resumo: '',
                        avaliadosCount: 0,
                        taxaParticipacao: 0
                      });
                      setShowDesempenhoModal(true);
                    }}
                    className="cursor-pointer text-xs"
                  >
                    Novo Ciclo
                  </Button>
                </div>
                
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Ciclo</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Período</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider font-mono">Part./Avaliados</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Resumo</th>
                        <th className="px-4 py-3 font-semibold text-xs text-right uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {desempenhoCiclos.map((d: any) => (
                        <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800 text-xs">{d.ciclo}</td>
                          <td className="px-4 py-3 text-slate-600 text-xs font-semibold">{d.periodo}</td>
                          <td className="px-4 py-3 text-xs text-slate-505 font-mono">
                            {d.avaliadosCount > 0 ? `${d.taxaParticipacao}% (${d.avaliadosCount} avaliados)` : 'Sem respostas'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2 py-1 rounded font-black uppercase tracking-wider ${d.status === 'Concluído' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{d.resumo || 'Sem observações'}</td>
                          <td className="px-4 py-3 text-xs text-right space-x-3">
                            <button 
                              onClick={() => {
                                setEditingDesempenho(d);
                                setDesempenhoForm({
                                  ciclo: d.ciclo,
                                  periodo: d.periodo,
                                  status: d.status,
                                  resumo: d.resumo,
                                  avaliadosCount: d.avaliadosCount,
                                  taxaParticipacao: d.taxaParticipacao
                                });
                                setShowDesempenhoModal(true);
                              }}
                              className="text-indigo-600 font-black hover:underline cursor-pointer"
                            >
                              Editar
                            </button>
                            <span className="text-slate-200">|</span>
                            <button 
                              onClick={() => handleDeleteDesempenho(d.id)}
                              className="text-rose-500 font-semibold hover:underline cursor-pointer"
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
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
                                      onClick={() => handleConsultarProcessoIA(p)}
                                      disabled={isSearchingProcessoId === p.id}
                                      className="p-1 px-2 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 font-black text-[10px] rounded cursor-pointer transition-colors disabled:opacity-50"
                                    >
                                      {isSearchingProcessoId === p.id ? <Sparkles className="animate-spin" size={13} /> : <Search size={13} className="mr-0.5" />} Jusbrasil IA
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
      {showContaModal && createPortal(
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
        </InteractiveWindow>,
        document.body
      )}

      {/* MODAL EVENTO SST */}
      {showSstModal && createPortal(
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
        </InteractiveWindow>,
        document.body
      )}

      {/* MODAL CONTROLE DE PONTO */}
      {showPontoModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 z-0" onClick={() => setShowPontoModal(false)}></div>
          
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-205 z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 text-white flex justify-between items-center relative">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-200 tracking-wider">Mapeamento de Jornada Ocupacional</span>
                <h4 className="font-extrabold text-base font-[Outfit]">{editingPonto ? 'Editar Registro de Ponto' : 'Lançar Novo Ponto / Jornada'}</h4>
              </div>
              <button 
                onClick={() => setShowPontoModal(false)} 
                className="bg-white/10 hover:bg-rose-600 transition-colors p-1.5 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Form */}
            <div className="p-6 md:p-8 space-y-4 overflow-y-auto flex-1 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">Tipo de Lançamento</label>
                  <select 
                    value={pontoForm.tipo_registro}
                    onChange={(e) => setPontoForm({ ...pontoForm, tipo_registro: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-755 font-bold outline-hidden cursor-pointer"
                  >
                    <option value="trabalhado">Jornada Trabalhada (Com Batidas)</option>
                    <option value="falta">Falta Sem Justificativa</option>
                    <option value="atestado">Ausência por Atestado Médico</option>
                    <option value="abono">Abono ou Missão Externa</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">Membro / Colaborador</label>
                  <select 
                    value={pontoForm.colaborador_id}
                    onChange={(e) => {
                      const matched = colaboradores.find((c: any) => c.id === e.target.value);
                      setPontoForm({ 
                        ...pontoForm, 
                        colaborador_id: e.target.value,
                        colaborador: matched ? matched.nome : e.target.value
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-755 font-bold outline-hidden cursor-pointer"
                  >
                    <option value="">Selecione...</option>
                    {colaboradores.filter((c:any) => !c.deleted).map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nome} ({c.cargo})</option>
                    ))}
                    <option value="outro">-- Outro / Digitar Nome --</option>
                  </select>
                </div>
              </div>

              {pontoForm.colaborador_id === 'outro' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">Digitar Nome Completo</label>
                  <input 
                    type="text"
                    placeholder="Ex: Pastor Roberto de Oliveira"
                    value={pontoForm.colaborador}
                    onChange={(e) => setPontoForm({ ...pontoForm, colaborador: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-755 font-bold outline-hidden"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Data do Registro</label>
                <input 
                  type="date"
                  value={pontoForm.data}
                  onChange={(e) => setPontoForm({ ...pontoForm, data: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-hidden font-semibold"
                />
              </div>

              {pontoForm.tipo_registro === 'trabalhado' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-150">
                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-500 font-black uppercase">1. Entrada</label>
                      <input 
                        type="time"
                        value={pontoForm.entrada}
                        onChange={(e) => setPontoForm({ ...pontoForm, entrada: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-755 font-mono font-bold outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-500 font-black uppercase flex items-center gap-0.5">2. Alm. Saída</label>
                      <input 
                        type="time"
                        value={pontoForm.alm_saida}
                        onChange={(e) => setPontoForm({ ...pontoForm, alm_saida: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-755 font-mono font-bold outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-500 font-black uppercase flex items-center gap-0.5">3. Alm. Retorno</label>
                      <input 
                        type="time"
                        value={pontoForm.alm_retorno}
                        onChange={(e) => setPontoForm({ ...pontoForm, alm_retorno: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-755 font-mono font-bold outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-555 font-black uppercase font-bold text-slate-800">4. Saída Final</label>
                      <input 
                        type="time"
                        value={pontoForm.saida}
                        onChange={(e) => setPontoForm({ ...pontoForm, saida: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-mono font-bold outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-slate-400 font-bold uppercase">Destinação das Horas Extras</label>
                      <select 
                        value={pontoForm.banco_ou_folha}
                        onChange={(e) => setPontoForm({ ...pontoForm, banco_ou_folha: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-755 font-bold outline-hidden cursor-pointer"
                      >
                        <option value="folha">Pagar em Folha de Pagamento</option>
                        <option value="banco">Acumular no Banco de Horas</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-slate-400 font-bold uppercase">Observação / Justificativa</label>
                      <input 
                        type="text"
                        placeholder="Ex: Esquecimento de almoço registrado em papel"
                        value={pontoForm.justificativa}
                        onChange={(e) => setPontoForm({ ...pontoForm, justificativa: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-hidden font-semibold"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-[#f8fafc] border border-slate-200 rounded-2xl">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase">Histórico / Descrição da Justificativa</label>
                    <input 
                      type="text"
                      placeholder={
                        pontoForm.tipo_registro === 'falta' ? 'Ex: Ausência injustificada na escala ministerial dízimo local' :
                        pontoForm.tipo_registro === 'atestado' ? 'Ex: Atestado Odonto homologado' :
                        'Ex: Abono - Representação em Evento eclesiástico'
                      }
                      value={pontoForm.justificativa}
                      onChange={(e) => setPontoForm({ ...pontoForm, justificativa: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-hidden font-semibold"
                    />
                  </div>

                  {(pontoForm.tipo_registro === 'atestado' || pontoForm.tipo_registro === 'abono') && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-slate-550 font-bold uppercase">Nome do PDF de Comprovação</label>
                      <input 
                        type="text"
                        placeholder="Ex: atestado_folha_marcos.pdf"
                        value={pontoForm.atestado_anexo || 'atestado_marcos.pdf'}
                        onChange={(e) => setPontoForm({ ...pontoForm, atestado_anexo: e.target.value })}
                        className="w-full bg-white border border-slate-205 rounded-lg p-2.5 text-xs text-slate-705 outline-hidden font-mono"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 text-[11px] text-slate-550 leading-relaxed">
                <strong className="text-slate-700 block mb-0.5">Auditoria e eSocial Fase 4:</strong>
                As horas salvas serão submetidas ao robô contábil para processamento automático.
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-3.5">
              <button 
                onClick={() => setShowPontoModal(false)}
                className="bg-white border border-slate-250 text-slate-600 hover:bg-slate-100 font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  let nameSelected = pontoForm.colaborador;
                  let selectedID = pontoForm.colaborador_id;
                  
                  if (selectedID && selectedID !== 'outro') {
                    const matchedC = colaboradores.find((c: any) => c.id === selectedID);
                    if (matchedC) {
                      nameSelected = matchedC.nome;
                    }
                  } else {
                    selectedID = `c_${Date.now()}`;
                  }

                  if (!nameSelected || !pontoForm.data) {
                    addToast('Por favor, defina o colaborador e a data do registro.', 'error');
                    return;
                  }

                  const isSun = isSundayOrHoliday(pontoForm.data);
                  let entMins = parseTimeToMinutes(pontoForm.entrada);
                  let extMins = parseTimeToMinutes(pontoForm.saida);
                  let almOutMins = parseTimeToMinutes(pontoForm.alm_saida);
                  let almInMins = parseTimeToMinutes(pontoForm.alm_retorno);

                  if (pontoForm.tipo_registro === 'falta') {
                    const novoPunch = {
                      id: editingPonto ? editingPonto.id : `po_${Date.now()}`,
                      colaborador_id: selectedID,
                      colaborador: nameSelected,
                      data: pontoForm.data,
                      entrada: '',
                      alm_saida: '',
                      alm_retorno: '',
                      saida: '',
                      horas_trabalhadas: 0,
                      horas_extras: 0,
                      status: 'Falta',
                      inconsistente: false,
                      justificativa: pontoForm.justificativa,
                      atestado_anexo: ''
                    };
                    if (editingPonto) {
                      setPontoPunches((prev: any) => prev.map((item: any) => item.id === editingPonto.id ? novoPunch : item));
                    } else {
                      setPontoPunches((prev: any) => [novoPunch, ...prev]);
                    }
                    addToast('Falta injustificada salva com sucesso. Será descontada automaticamente na sincronização!', 'warning');
                    setShowPontoModal(false);
                    return;
                  }

                  if (pontoForm.tipo_registro === 'atestado' || pontoForm.tipo_registro === 'abono') {
                    const novoPunch = {
                      id: editingPonto ? editingPonto.id : `po_${Date.now()}`,
                      colaborador_id: selectedID,
                      colaborador: nameSelected,
                      data: pontoForm.data,
                      entrada: '',
                      alm_saida: '',
                      alm_retorno: '',
                      saida: '',
                      horas_trabalhadas: 0,
                      horas_extras: 0,
                      status: 'Justificado',
                      inconsistente: false,
                      justificativa: pontoForm.justificativa || 'Atestado homologado',
                      atestado_anexo: pontoForm.atestado_anexo || 'comprovante.pdf'
                    };
                    if (editingPonto) {
                      setPontoPunches((prev: any) => prev.map((item: any) => item.id === editingPonto.id ? novoPunch : item));
                    } else {
                      setPontoPunches((prev: any) => [novoPunch, ...prev]);
                    }
                    addToast('Ausência com justificativa registrada e aceita pelo RH!', 'success');
                    setShowPontoModal(false);
                    return;
                  }

                  let totalWorkedMins = 0;
                  let inconsistente = false;
                  let alerta = '';

                  if (!pontoForm.entrada || !pontoForm.saida) {
                    inconsistente = true;
                    alerta = 'Batida incompleta: Falta Entrada ou Saída!';
                  } else {
                    if (pontoForm.alm_saida && pontoForm.alm_retorno) {
                      const p1 = almOutMins - entMins;
                      const p2 = extMins - almInMins;
                      if (p1 < 0 || p2 < 0) {
                        inconsistente = true;
                        alerta = 'Almoço inconsistente com horário principal!';
                        totalWorkedMins = Math.max(0, extMins - entMins - 60);
                      } else {
                        totalWorkedMins = p1 + p2;
                      }
                    } else {
                      const span = extMins - entMins;
                      if (span < 0) {
                        inconsistente = true;
                        alerta = 'Entrada após o horário de saída!';
                        totalWorkedMins = 0;
                      } else {
                        totalWorkedMins = span > 360 ? span - 60 : span;
                        if (span > 360) {
                          alerta = 'Intervalo de almoço deduzido de 1h automaticamente.';
                        }
                      }
                    }
                  }

                  const workedHoursDecimal = totalWorkedMins / 60;
                  let extraHours = 0;
                  let statusLabel = 'Regular';

                  if (isSun) {
                    extraHours = workedHoursDecimal;
                    statusLabel = '100% Extras (DSR)';
                  } else {
                    if (workedHoursDecimal > 8) {
                      extraHours = workedHoursDecimal - 8;
                      statusLabel = 'Horas Extras';
                    }
                  }

                  if (extraHours > pontoConfigs.horasExtrasLimiteDiario) {
                    addToast(`Atenção contábil: Colaborador acumulou mais de ${pontoConfigs.horasExtrasLimiteDiario}h extras diárias permissíveis!`, 'warning');
                  }

                  const novoPunch = {
                    id: editingPonto ? editingPonto.id : `po_${Date.now()}`,
                    colaborador_id: selectedID,
                    colaborador: nameSelected,
                    data: pontoForm.data,
                    entrada: pontoForm.entrada,
                    alm_saida: pontoForm.alm_saida,
                    alm_retorno: pontoForm.alm_retorno,
                    saida: pontoForm.saida,
                    horas_trabalhadas: workedHoursDecimal,
                    horas_extras: extraHours,
                    status: inconsistente ? 'Inconsistente' : statusLabel,
                    inconsistente,
                    alerta,
                    justificativa: pontoForm.justificativa,
                    atestado_anexo: pontoForm.atestado_anexo
                  };

                  if (editingPonto) {
                    setPontoPunches((prev: any) => prev.map((item: any) => item.id === editingPonto.id ? novoPunch : item));
                    addToast('Registro de ponto de colaborador atualizado!', 'success');
                  } else {
                    setPontoPunches((prev: any) => [novoPunch, ...prev]);
                    addToast('Nova jornada gravada com sucesso nas folhas de ponto!', 'success');
                  }
                  setShowPontoModal(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm"
              >
                Gravar Batida
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL VAGA (RECRUTAMENTO) */}
      {showVagaModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 z-0" onClick={() => setShowVagaModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-200 tracking-wider">Recrutamento e Seleção</span>
                <h4 className="font-extrabold text-base font-[Outfit]">{editingVaga ? 'Editar Vaga Cadastrada' : 'Anunciar Nova Vaga de Trabalho'}</h4>
              </div>
              <button onClick={() => setShowVagaModal(false)} className="bg-white/10 hover:bg-rose-600 transition-colors p-1.5 rounded-lg cursor-pointer text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Título do Cargo / Vaga</label>
                <input 
                  type="text" 
                  value={vagaForm.titulo} 
                  onChange={(e) => setVagaForm({ ...vagaForm, titulo: e.target.value })}
                  placeholder="Ex: Auxiliar de Comunicação" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">Código da Vaga</label>
                  <input 
                    type="text" 
                    value={vagaForm.codigo} 
                    onChange={(e) => setVagaForm({ ...vagaForm, codigo: e.target.value })}
                    placeholder="Ex: V-106" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">Departamento</label>
                  <select 
                    value={vagaForm.depto} 
                    onChange={(e) => setVagaForm({ ...vagaForm, depto: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                  >
                    <option value="Administração">Administração</option>
                    <option value="Serviços Gerais">Serviços Gerais</option>
                    <option value="Secretaria Geral">Secretaria Geral</option>
                    <option value="Pastoral / Ministerial">Pastoral / Ministerial</option>
                    <option value="Comunicação & TI">Comunicação & TI</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Status Inicial</label>
                <select 
                  value={vagaForm.status} 
                  onChange={(e) => setVagaForm({ ...vagaForm, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                >
                  <option value="ativa">Ativa (Recebendo Candidatos)</option>
                  <option value="pausada">Pausada (Triagem Interna)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Requisitos e Descrição Curta</label>
                <textarea 
                  value={vagaForm.descricao} 
                  onChange={(e) => setVagaForm({ ...vagaForm, descricao: e.target.value })}
                  placeholder="Descreva as qualificações, carga horária e salário simulado..." 
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-3">
              <button onClick={() => setShowVagaModal(false)} className="bg-white border border-slate-250 text-slate-650 hover:bg-slate-100 font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleSaveVaga} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer">
                Salvar Vaga
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL FUNIL DE CANDIDATOS */}
      {selectedVagaFunil && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 z-0" onClick={() => setSelectedVagaFunil(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-205 z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-gradient-to-br from-indigo-800 via-indigo-900 to-slate-900 text-white flex justify-between items-center shrink-0">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-300 tracking-wider">Visualizador de Funil de Recrutamento</span>
                <h4 className="font-extrabold text-base font-[Outfit]">{selectedVagaFunil.titulo} ({selectedVagaFunil.codigo})</h4>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setEditingCandidato(null);
                    setCandidatoForm({
                      nome: '',
                      email: '',
                      status: 'Triagem',
                      qualificacao: ''
                    });
                    setShowCandidatoModal(true);
                  }}
                  className="bg-emerald-600 font-bold text-[11px] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-emerald-700 transition-colors"
                >
                  <Plus size={14} /> Novo Candidato
                </button>
                <button onClick={() => setSelectedVagaFunil(null)} className="bg-white/10 hover:bg-rose-600 transition-colors p-1.5 rounded-lg cursor-pointer text-white">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 min-h-[400px] text-left shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full align-top">
                {['Triagem', 'Entrevista', 'Aprovado', 'Dispensado'].map((colStatus) => {
                  const filteredCands = candidatos.filter(c => c.vagaId === selectedVagaFunil.id && c.status === colStatus);
                  return (
                    <div key={colStatus} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col gap-2 min-h-[350px]">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-1">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{colStatus}</span>
                        <span className="text-[10px] bg-slate-200 font-bold px-2 py-0.5 rounded-full text-slate-600 font-mono">
                          {filteredCands.length}
                        </span>
                      </div>
                      
                      <div className="space-y-2.5 overflow-y-auto flex-1 hide-scrollbar">
                        {filteredCands.length === 0 ? (
                          <div className="text-center font-semibold text-[10px] text-slate-400 py-10">Vazio</div>
                        ) : (
                          filteredCands.map((cand: any) => (
                            <div key={cand.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-indigo-300 transition-all">
                              <h6 className="font-extrabold text-slate-800 text-xs truncate">{cand.nome}</h6>
                              <p className="text-[10px] text-slate-450 mt-0.5 font-semibold truncate font-mono">{cand.email}</p>
                              {cand.qualificacao && (
                                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed bg-slate-50 p-1.5 rounded border border-slate-100 italic">
                                  "{cand.qualificacao}"
                                </p>
                              )}
                              
                              <div className="flex flex-col gap-1.5 mt-3 border-t border-slate-100 pt-2 shrink-0">
                                <label className="text-[9px] font-mono text-slate-400 font-bold block">Mudar Status:</label>
                                <div className="flex flex-wrap gap-1">
                                  {['Triagem', 'Entrevista', 'Aprovado', 'Dispensado'].filter(s => s !== colStatus).map((targetStatus) => (
                                    <button 
                                      key={targetStatus}
                                      onClick={() => {
                                        setCandidatos(prev => prev.map(c => c.id === cand.id ? { ...c, status: targetStatus } : c));
                                        addToast(`Candidato "${cand.nome}" movido para ${targetStatus}!`, 'info');
                                      }}
                                      className="text-[8px] font-bold bg-slate-100 border border-slate-200 py-0.5 px-1.5 rounded hover:bg-slate-200 hover:text-slate-700 transition-colors"
                                    >
                                      {targetStatus}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {colStatus === 'Aprovado' && (
                                <button 
                                  onClick={() => handlePromoveCandidatoAoOnboarding(cand)}
                                  className="w-full mt-2 bg-indigo-600 text-white font-black text-[9px] py-1.5 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                                >
                                  🚀 Iniciar Onboarding
                                </button>
                              )}

                              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 text-[9px] font-semibold text-slate-450 font-mono">
                                <span>Inscrito: {cand.dataInscricao}</span>
                                <button 
                                  onClick={() => handleDeleteCandidato(cand.id)}
                                  className="text-rose-500 hover:underline cursor-pointer"
                                >
                                  Excluir
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <p className="text-[10px] text-slate-400 font-bold">Aprovando um candidato, o botão para lançar o Onboarding e integrá-lo será liberado.</p>
              <button onClick={() => setSelectedVagaFunil(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-5 py-2 rounded-xl cursor-pointer">
                Fechar Pipeline
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL ADICIONAR NOVO CANDIDATO */}
      {showCandidatoModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 z-0" onClick={() => setShowCandidatoModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 z-10 animate-in zoom-in-95 duration-150 flex flex-col">
            <div className="px-5 py-3.5 bg-slate-100 border-b border-light-200 flex justify-between items-center">
              <h5 className="font-extrabold text-sm text-slate-800">Novo Candidato</h5>
              <button onClick={() => setShowCandidatoModal(false)} className="bg-slate-205 hover:bg-rose-100 transition-colors p-1 rounded-lg">
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4 text-left">
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Nome Completo do Candidato</label>
                <input 
                  type="text" 
                  value={candidatoForm.nome} 
                  onChange={(e) => setCandidatoForm({ ...candidatoForm, nome: e.target.value })}
                  placeholder="Ex: Amanda Ferreira" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Endereço de E-mail</label>
                <input 
                  type="email" 
                  value={candidatoForm.email} 
                  onChange={(e) => setCandidatoForm({ ...candidatoForm, email: e.target.value })}
                  placeholder="Ex: amanda@gmail.com" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Qualificações / Notas Iniciais</label>
                <textarea 
                  value={candidatoForm.qualificacao} 
                  onChange={(e) => setCandidatoForm({ ...candidatoForm, qualificacao: e.target.value })}
                  placeholder="Ex: Graduação em RH, ótimas referências ministeriais..." 
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold outline-none resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-150 flex justify-end gap-2.5">
              <button onClick={() => setShowCandidatoModal(false)} className="bg-white border border-slate-250 text-slate-650 px-4 py-2 rounded-xl text-xs font-bold">
                Cancelar
              </button>
              <button onClick={handleSaveCandidato} className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs">
                Adicionar Candidato
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL NOVO ONBOARDING (CADASTRO MANUAL) */}
      {showOnboardingModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 z-0" onClick={() => setShowOnboardingModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 z-10 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-200 tracking-wider">Onboarding Manual</span>
                <h4 className="font-extrabold text-base">Criar Nova Trilha de Onboarding</h4>
              </div>
              <button onClick={() => setShowOnboardingModal(false)} className="bg-white/10 hover:bg-rose-600 p-1.5 rounded-lg text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono">Nome do Novo Colaborador / Membro</label>
                <input 
                  type="text" 
                  value={onboardingForm.colaboradorNome} 
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, colaboradorNome: e.target.value })}
                  placeholder="Ex: Fernando Souza de Oliveira" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Cargo Relacionado</label>
                <input 
                  type="text" 
                  value={onboardingForm.cargoOriginal} 
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, cargoOriginal: e.target.value })}
                  placeholder="Ex: Zelador Geral Sede" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Quadro de tarefas personalizadas (Uma por linha)</label>
                <textarea 
                  value={onboardingForm.tarefasCustom} 
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, tarefasCustom: e.target.value })}
                  rows={5}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono outline-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-3">
              <button onClick={() => setShowOnboardingModal(false)} className="bg-white border text-xs text-slate-600 font-bold px-4 py-2.5 rounded-xl cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleSaveOnboarding} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer">
                Iniciar Trilha de Onboarding
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DETALHES CHECKLIST ONBOARDING */}
      {selectedOnboardingDetail && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 z-0" onClick={() => setSelectedOnboardingDetail(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 z-10 flex flex-col">
            <div className="px-6 py-4 bg-[#1e293b] text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-300 tracking-wider">Mapeamento de Integração Individual</span>
                <h4 className="font-extrabold text-base truncate font-[Outfit]">{selectedOnboardingDetail.colaboradorNome}</h4>
              </div>
              <button onClick={() => setSelectedOnboardingDetail(null)} className="bg-white/10 hover:bg-rose-600 p-1.5 rounded-lg text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-left">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Cargo em Processo de Admissão</span>
                <span className="text-sm font-black text-slate-700">{selectedOnboardingDetail.cargoOriginal}</span>
                <span className="text-[10px] text-slate-500 font-semibold block mt-1 font-mono">Iniciado em: {selectedOnboardingDetail.dataInicio}</span>
                
                <div className="mt-3.5">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1 uppercase font-mono">
                    <span>Progresso global</span>
                    <span>{selectedOnboardingDetail.progresso}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-650 h-2 transition-all duration-300" style={{ width: `${selectedOnboardingDetail.progresso}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="block text-[11px] text-slate-400 font-black uppercase tracking-wider mb-2">Checklist de Integração / eSocial:</label>
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 hide-scrollbar">
                  {selectedOnboardingDetail.tarefas.map((t: any) => (
                    <div 
                      key={t.id} 
                      onClick={() => handleToggleTarefaOnboarding(selectedOnboardingDetail.id, t.id)}
                      className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer select-none"
                    >
                      <div className={`p-1 rounded-md border ${t.concluida ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                        {t.concluida ? <Check size={12} strokeWidth={4} /> : <div className="w-3 h-3"></div>}
                      </div>
                      <span className={`text-xs ${t.concluida ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-semibold'}`}>
                        {t.titulo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOnboardingDetail.progresso === 100 && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mt-4 animate-in fade-in">
                  <h6 className="text-xs font-black text-emerald-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <CheckCircle size={14} /> Integração 100% Concluída
                  </h6>
                  <p className="text-[10px] text-emerald-700 leading-relaxed mt-1">
                    Todos os pré-requisitos, termos e treinamentos do eSocial foram cumpridos. Você já pode efetivar o colaborador na base ativa de funcionários ordinários.
                  </p>
                  <button 
                    onClick={() => handleFinalizeOnboarding(selectedOnboardingDetail)}
                    className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2 rounded-xl transition cursor-pointer"
                  >
                    Efetivar Colaborador na Base Ativa!
                  </button>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-between items-center text-[10px] text-slate-405 font-bold">
              <span>Clique em uma tarefa para marcar como concluída/pendente.</span>
              <button onClick={() => setSelectedOnboardingDetail(null)} className="bg-white border rounded px-4 py-2 font-black text-slate-600 cursor-pointer text-xs">Fechar</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL ADICIONAR / EDITAR TREINAMENTO */}
      {showTreinamentoModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 z-0" onClick={() => setShowTreinamentoModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 z-10 flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-br from-indigo-700 to-indigo-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-300 tracking-wider">Cursos Corporativos & Normas do eSocial</span>
                <h4 className="font-extrabold text-base">{editingTreinamento ? 'Editar Treinamento' : 'Novo Curso no Catálogo'}</h4>
              </div>
              <button onClick={() => setShowTreinamentoModal(false)} className="bg-white/10 hover:bg-rose-600 p-1.5 rounded-lg text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-left">
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono">Nome / Tema do Treinamento</label>
                <input 
                  type="text" 
                  value={treinamentoForm.titulo} 
                  onChange={(e) => setTreinamentoForm({ ...treinamentoForm, titulo: e.target.value })}
                  placeholder="Ex: Direção defensiva no translado de membros" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">Instrutor / Palestrante</label>
                  <input 
                    type="text" 
                    value={treinamentoForm.instrutor} 
                    onChange={(e) => setTreinamentoForm({ ...treinamentoForm, instrutor: e.target.value })}
                    placeholder="Ex: Dra. Amanda Souza" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">Carga Horária (horas)</label>
                  <input 
                    type="number" 
                    value={treinamentoForm.cargaHoraria} 
                    onChange={(e) => setTreinamentoForm({ ...treinamentoForm, cargaHoraria: e.target.value })}
                    placeholder="Ex: 8" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">% Conclusão / Progresso</label>
                  <input 
                    type="number" 
                    value={treinamentoForm.progresso} 
                    onChange={(e) => setTreinamentoForm({ ...treinamentoForm, progresso: e.target.value })}
                    placeholder="Ex: 50" 
                    max={100}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">Status Atual</label>
                  <select 
                    value={treinamentoForm.status} 
                    onChange={(e) => setTreinamentoForm({ ...treinamentoForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold cursor-pointer"
                  >
                    <option value="Ativo">Ativo (Em Curso)</option>
                    <option value="Planejado">Planejado (Futuro)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono">Descrição e Finalidade</label>
                <textarea 
                  value={treinamentoForm.descricao} 
                  onChange={(e) => setTreinamentoForm({ ...treinamentoForm, descricao: e.target.value })}
                  placeholder="Finalidade do treinamento e certificação válida..." 
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none resize-none font-mono"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-3">
              <button onClick={() => setShowTreinamentoModal(false)} className="bg-white border rounded px-4 py-2.5 font-bold text-xs text-slate-655 cursor-pointer">Cancelar</button>
              <button onClick={handleSaveTreinamento} className="bg-indigo-600 text-white px-5 py-2.5 font-black text-xs rounded-xl cursor-pointer">Salvar Curso</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL ADICIONAR / EDITAR CICLO DESEMPENHO */}
      {showDesempenhoModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 z-0" onClick={() => setShowDesempenhoModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 z-10 flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-br from-indigo-700 to-indigo-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-305 tracking-wider">Avaliação do Clima e Liderança</span>
                <h4 className="font-extrabold text-base">{editingDesempenho ? 'Editar Ciclo Desempenho' : 'Novo Ciclo de Avaliações'}</h4>
              </div>
              <button onClick={() => setShowDesempenhoModal(false)} className="bg-white/10 hover:bg-rose-600 p-1.5 rounded-lg text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-left">
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase font-mono">Título do Ciclo ou Pesquisa</label>
                <input 
                  type="text" 
                  value={desempenhoForm.ciclo} 
                  onChange={(e) => setDesempenhoForm({ ...desempenhoForm, ciclo: e.target.value })}
                  placeholder="Ex: Avaliação de Clima Organizacional 2026/02" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">Período Referência</label>
                  <input 
                    type="text" 
                    value={desempenhoForm.periodo} 
                    onChange={(e) => setDesempenhoForm({ ...desempenhoForm, periodo: e.target.value })}
                    placeholder="Ex: Nov 2026" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">Status do Ciclo</label>
                  <select 
                    value={desempenhoForm.status} 
                    onChange={(e) => setDesempenhoForm({ ...desempenhoForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs font-semibold cursor-pointer"
                  >
                    <option value="Planejamento">Planejamento</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">Quantidade de Respondentes / Avaliados</label>
                  <input 
                    type="number" 
                    value={desempenhoForm.avaliadosCount} 
                    onChange={(e) => setDesempenhoForm({ ...desempenhoForm, avaliadosCount: e.target.value })}
                    placeholder="Ex: 5" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">Taxa de Participação (%)</label>
                  <input 
                    type="number" 
                    value={desempenhoForm.taxaParticipacao} 
                    onChange={(e) => setDesempenhoForm({ ...desempenhoForm, taxaParticipacao: e.target.value })}
                    placeholder="Ex: 85" 
                    max={100}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-bold uppercase">Resumo da Avaliação / Observação</label>
                <textarea 
                  value={desempenhoForm.resumo} 
                  onChange={(e) => setDesempenhoForm({ ...desempenhoForm, resumo: e.target.value })}
                  placeholder="Escrita da finalidade e das áreas a serem avaliadas..." 
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none resize-none font-mono"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-3">
              <button onClick={() => setShowDesempenhoModal(false)} className="bg-white border rounded px-4 py-2.5 font-bold text-xs text-slate-600 cursor-pointer">Cancelar</button>
              <button onClick={handleSaveDesempenho} className="bg-indigo-600 text-white px-5 py-2.5 font-black text-xs rounded-xl cursor-pointer">Salvar Ciclo</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL EMISSÃO DARF PREVIDENCIÁRIA */}
      {showDarfModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowDarfModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-3xl text-slate-700">
              <div>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="text-emerald-600" size={18} /> Geração e Emissão - DARF Previdenciária
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Ajuste os valores, guias e simule o pagamento ou envie para impressão.</p>
              </div>
              <button 
                onClick={() => setShowDarfModal(false)}
                className="bg-slate-200/60 hover:bg-rose-500 hover:text-white p-2 rounded-full text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Painel Ajuste de Variáveis (Left col) */}
              <div className="lg:col-span-4 space-y-4 border-r border-slate-100 pr-0 lg:pr-6">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-widest border-b pb-1">Ajuste de Parâmetros</h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Razão Social do Templo</label>
                  <input 
                    type="text" 
                    value={darfForm.razaoSocial}
                    onChange={(e) => setDarfForm({ ...darfForm, razaoSocial: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 font-bold outline-hidden font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Período Apuração</label>
                    <input 
                      type="text" 
                      value={darfForm.periodoApuracao}
                      onChange={(e) => setDarfForm({ ...darfForm, periodoApuracao: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2 text-xs text-slate-800 font-bold outline-hidden font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Vencimento</label>
                    <input 
                      type="text" 
                      value={darfForm.vencimento}
                      onChange={(e) => setDarfForm({ ...darfForm, vencimento: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2 text-xs text-slate-800 font-bold outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Cód da Receita</label>
                    <input 
                      type="text" 
                      value={darfForm.codigoReceita}
                      onChange={(e) => setDarfForm({ ...darfForm, codigoReceita: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2 text-xs text-slate-800 font-bold outline-hidden font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">CNPJ Emissor</label>
                    <input 
                      type="text" 
                      value={darfForm.cnpj}
                      onChange={(e) => setDarfForm({ ...darfForm, cnpj: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2 text-xs text-slate-800 font-bold outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Valor Principal (R$)</label>
                    <input 
                      type="number" 
                      value={darfForm.valorPrincipal}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setDarfForm({ ...darfForm, valorPrincipal: val, totais: val + darfForm.multa + darfForm.juros });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-indigo-700 font-black outline-hidden font-sans"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Multa (R$)</label>
                      <input 
                        type="number" 
                        value={darfForm.multa}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setDarfForm({ ...darfForm, multa: val, totais: darfForm.valorPrincipal + val + darfForm.juros });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 p-2 text-xs text-slate-850 font-bold outline-hidden font-sans"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Juros (R$)</label>
                      <input 
                        type="number" 
                        value={darfForm.juros}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setDarfForm({ ...darfForm, juros: val, totais: darfForm.valorPrincipal + darfForm.multa + val });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 p-2 text-xs text-slate-850 font-bold outline-hidden font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-805 text-xs">
                    <div className="flex gap-2 items-start">
                      <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Geração SINCRE Ativa:</strong> Esta DARF engloba contribuições previdenciárias apuradas na folha de pagamento do eSocial. Devedor primário cadastrado no CNPJ mencionado.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-805 text-xs">
                    <label className="block text-[10px] font-black text-indigo-500 uppercase">Status do Documento</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${darfForm.status === 'Pago' ? 'bg-emerald-500' : 'bg-amber-500 anim-pulse'}`}></span>
                      <strong className="text-sm font-black uppercase tracking-wider">{darfForm.status}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visualização de Visual Realística (Right col) */}
              <div className="lg:col-span-8 bg-slate-100 p-6 rounded-2xl flex flex-col justify-center overflow-x-auto min-w-[550px]">
                <div className="bg-white border-2 border-black p-5 shadow-lg max-w-2xl mx-auto w-full text-[10px] text-black">
                  
                  {/* Cabeçalho */}
                  <div className="flex justify-between border-b-2 border-black pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-800 rounded-full flex flex-col items-center justify-center text-white font-black text-[5px] text-center border">
                        <span className="leading-none select-none">REPÚBLICA</span>
                        <span className="leading-none select-none uppercase text-yellow-300">BRASIL</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[11px] uppercase leading-tight">Ministério da Fazenda</h4>
                        <p className="font-bold text-[9px] text-gray-700 leading-tight">Secretaria da Receita Federal do Brasil</p>
                        <p className="text-[8px] text-gray-500 font-mono">Documento de Arrecadação de Receitas Federais</p>
                      </div>
                    </div>
                    <div className="text-right border-l pl-3 flex flex-col justify-center">
                      <span className="font-black text-xl uppercase tracking-widest text-emerald-950 font-mono">DARF</span>
                      <span className="text-[7px] text-gray-505 font-bold uppercase">DCTFWeb Integrada</span>
                    </div>
                  </div>

                  {/* Detalhes Identificação e Valores */}
                  <div className="grid grid-cols-12 gap-2 mb-3">
                    <div className="col-span-8 border border-black p-2 font-mono">
                      <label className="block text-[7px] font-bold text-gray-500 uppercase">01. Razão Social Fontes Pagadoras</label>
                      <div className="font-black text-xs text-gray-950 uppercase leading-tight">{darfForm.razaoSocial}</div>
                      <div className="text-[7.5px] text-gray-505 mt-1.5 font-sans leading-none">
                        Guia Única de Contribuição Previdenciária Integrada GIPP Sede
                      </div>
                    </div>
                    <div className="col-span-4 grid grid-rows-4 gap-1.5 font-mono text-slate-700">
                      <div className="border border-black p-1">
                        <label className="block text-[6px] font-bold text-gray-400">02. PERÍODO APURAÇÃO</label>
                        <div className="font-extrabold text-xs text-right leading-none">{darfForm.periodoApuracao}</div>
                      </div>
                      <div className="border border-black p-1">
                        <label className="block text-[6px] font-bold text-gray-400">03. NÚMERO DO CNPJ</label>
                        <div className="font-extrabold text-xs text-right leading-none">{darfForm.cnpj}</div>
                      </div>
                      <div className="border border-black p-1">
                        <label className="block text-[6px] font-bold text-gray-400">04. CÓD COMPREV</label>
                        <div className="font-extrabold text-xs text-right leading-none">{darfForm.codigoReceita}</div>
                      </div>
                      <div className="border border-black p-1">
                        <label className="block text-[6px] font-bold text-gray-400">05. REF DE CONTROLE</label>
                        <div className="font-extrabold text-xs text-right leading-none">{darfForm.referencia}</div>
                      </div>
                    </div>
                  </div>

                  {/* Linha 2 de Detalhes */}
                  <div className="grid grid-cols-12 gap-2 mb-3">
                    <div className="col-span-8 border border-black p-3 space-y-2 flex flex-col justify-between">
                      <div>
                        <h5 className="font-black text-[8px] text-green-800 uppercase tracking-wider mb-1 leading-none">Instruções para Liquidação Automática:</h5>
                        <p className="text-[7.5px] leading-snug text-gray-505 font-sans">
                          Efetue o pagamento através do QR Code PIX abaixo. A Receita Federal fará a baixa de forma automática, dispensando o envio de comprovantes ao departamento pessoal ou contabilidade do Ministério.
                        </p>
                      </div>
                      <div className="bg-gray-50 px-2 py-1.5 rounded border border-dashed text-[7px] text-gray-600 font-mono leading-none">
                        Assinatura Digital de Autenticidade: GIPP-SINCRE-2026-A1FF-924
                      </div>
                    </div>
                    <div className="col-span-4 grid grid-rows-5 gap-1 font-mono text-slate-700">
                      <div className="border border-black p-1">
                        <label className="block text-[6px] font-bold text-gray-400">06. DATA VENCIMENTO</label>
                        <div className="font-extrabold text-[11px] text-right text-red-655 leading-none">{darfForm.vencimento}</div>
                      </div>
                      <div className="border border-black p-1">
                        <label className="block text-[6px] font-bold text-gray-400">07. VALOR PRINCIPAL</label>
                        <div className="font-semibold text-xs text-right leading-none">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(darfForm.valorPrincipal)}</div>
                      </div>
                      <div className="border border-black p-1">
                        <label className="block text-[6px] font-bold text-gray-400">08. VALOR DA MULTA</label>
                        <div className="font-semibold text-xs text-right leading-none">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(darfForm.multa)}</div>
                      </div>
                      <div className="border border-black p-1">
                        <label className="block text-[6px] font-bold text-gray-400">09. JUROS DE MORA</label>
                        <div className="font-semibold text-xs text-right leading-none">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(darfForm.juros)}</div>
                      </div>
                      <div className="border border-black p-1 bg-green-50">
                        <label className="block text-[6px] font-black text-green-900">10. VALOR TOTAL</label>
                        <div className="font-black text-xs text-right text-green-950 leading-none">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(darfForm.totais)}</div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Pix e Chave Copia e Cola */}
                  <div className="border border-black p-3 bg-slate-50 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-[8.5px] font-black text-green-800 leading-none mb-1">⚡ PAGAMENTO EXCLUSIVO VIA PIX</div>
                      <p className="text-[7.5px] text-gray-650 leading-tight">
                        Seu banco confirmará a adimplência em tempo real e registrará a quitação do eSocial. Rápido e imune a fraudes.
                      </p>
                      <div className="mt-1 text-[7px] font-mono select-all bg-white p-1 rounded border overflow-x-auto text-gray-500 whitespace-nowrap leading-none">
                        00020101021226850014br.gov.bcb.pix2563receitafederal.gov.br/darf/esocial?txid=12543-982026053560abc
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-white border p-0.5 flex shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                        <rect width="100" height="100" fill="white" />
                        <rect x="5" y="5" width="25" height="25" fill="black" />
                        <rect x="10" y="10" width="15" height="15" fill="white" />
                        <rect x="13" y="13" width="9" height="9" fill="black" />
                        <rect x="70" y="5" width="25" height="25" fill="black" />
                        <rect x="75" y="10" width="15" height="15" fill="white" />
                        <rect x="78" y="13" width="9" height="9" fill="black" />
                        <rect x="5" y="70" width="25" height="25" fill="black" />
                        <rect x="10" y="75" width="15" height="15" fill="white" />
                        <rect x="13" y="78" width="9" height="9" fill="black" />
                        <rect x="35" y="35" width="30" height="30" fill="black" />
                        <rect x="40" y="40" width="20" height="20" fill="white" />
                        <rect x="45" y="45" width="10" height="10" fill="black" />
                        <rect x="35" y="10" width="5" height="10" fill="black" />
                        <rect x="50" y="5" width="10" height="5" fill="black" />
                        <rect x="75" y="35" width="15" height="5" fill="black" />
                        <rect x="35" y="75" width="5" height="15" fill="black" />
                        <rect x="50" y="85" width="15" height="5" fill="black" />
                      </svg>
                    </div>
                  </div>

                  {/* Código de barras simulado */}
                  <div className="mt-4 flex flex-col items-center">
                    <div className="font-mono text-center text-[8px] tracking-widest font-black leading-none mb-1">
                      856400000355 600002102026 062012543981 123456780007
                    </div>
                    <div className="flex items-center justify-center bg-white p-1 border border-black w-full max-w-sm">
                      <svg viewBox="0 0 400 20" className="w-full h-4">
                        <rect width="400" height="20" fill="white" />
                        <g fill="black">
                          <rect x="10" y="0" width="3" height="20" />
                          <rect x="15" y="0" width="1" height="20" />
                          <rect x="18" y="0" width="4" height="20" />
                          <rect x="24" y="0" width="2" height="20" />
                          <rect x="30" y="0" width="1" height="20" />
                          <rect x="35" y="0" width="5" height="20" />
                          <rect x="42" y="0" width="2" height="20" />
                          <rect x="46" y="0" width="3" height="20" />
                          <rect x="52" y="0" width="1" height="20" />
                          <rect x="56" y="0" width="4" height="20" />
                          <rect x="62" y="0" width="2" height="20" />
                          <rect x="66" y="0" width="3" height="20" />
                          <rect x="72" y="0" width="1" height="20" />
                          <rect x="76" y="0" width="5" height="20" />
                          <rect x="83" y="0" width="2" height="20" />
                          <rect x="90" y="0" width="1" height="20" />
                          <rect x="95" y="0" width="3" height="20" />
                          <rect x="102" y="0" width="2" height="20" />
                          <rect x="108" y="0" width="4" height="20" />
                          <rect x="114" y="0" width="1" height="20" />
                          <rect x="120" y="0" width="3" height="20" />
                          <rect x="125" y="0" width="2" height="20" />
                          <rect x="131" y="0" width="4" height="20" />
                          <rect x="137" y="0" width="1" height="20" />
                          <rect x="141" y="0" width="5" height="20" />
                          <rect x="148" y="0" width="2" height="20" />
                          <rect x="154" y="0" width="3" height="20" />
                          <rect x="160" y="0" width="1" height="20" />
                          <rect x="164" y="0" width="4" height="20" />
                          <rect x="170" y="0" width="2" height="20" />
                          <rect x="176" y="0" width="3" height="20" />
                          <rect x="182" y="0" width="1" height="20" />
                          <rect x="186" y="0" width="5" height="20" />
                          <rect x="193" y="0" width="2" height="20" />
                          <rect x="198" y="0" width="4" height="20" />
                          <rect x="231" y="0" width="5" height="20" />
                          <rect x="238" y="0" width="2" height="20" />
                          <rect x="244" y="0" width="3" height="20" />
                          <rect x="270" y="0" width="2" height="20" />
                          <rect x="276" y="0" width="3" height="20" />
                          <rect x="282" y="0" width="1" height="20" />
                          <rect x="310" y="0" width="3" height="20" />
                          <rect x="315" y="0" width="2" height="20" />
                          <rect x="321" y="0" width="4" height="20" />
                          <rect x="331" y="0" width="5" height="20" />
                          <rect x="338" y="0" width="2" height="20" />
                          <rect x="344" y="0" width="3" height="20" />
                          <rect x="350" y="0" width="1" height="20" />
                          <rect x="354" y="0" width="4" height="20" />
                          <rect x="376" y="0" width="5" height="20" />
                          <rect x="383" y="0" width="2" height="20" />
                          <rect x="390" y="0" width="5" height="20" />
                        </g>
                      </svg>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3 rounded-b-3xl">
              <div>
                {darfForm.status !== 'Pago' && (
                  <Button 
                    onClick={() => {
                      setDarfForm({ ...darfForm, status: 'Pago' });
                      setTransactions(prev => [
                        { id: 'darft', data: getTodayDate(), descricao: 'PAGTO DARF PREVIDENCIÁRIA RECOLHIMENTO', valor: darfForm.totais, tipo: 'saida', status: 'conciliado', conciliadoCom: 'DARF Previdenciária Pix Emissor' },
                        ...prev
                      ]);
                      addToast('Pagamento eletrônico processado com sucesso! Guia liquidada via Pix e integrada às bases oficiais da Receita Federal.', 'success');
                    }}
                    variant="primary" 
                    icon={Check}
                    className="bg-emerald-600 hover:bg-emerald-700 pointer font-bold"
                  >
                    Efetuar Lançamento e Pagamento (Pix)
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowDarfModal(false)} variant="secondary">Fechar</Button>
                <Button 
                  onClick={() => handlePrintDarf(darfForm)} 
                  variant="primary" 
                  icon={Printer}
                  className="bg-indigo-600 hover:bg-indigo-700 pointer"
                >
                  Imprimir DARF
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL ACESSAR GUIA FGTS DIGITAL */}
      {showFgtsModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowFgtsModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-3xl text-slate-700">
              <div>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="text-orange-600" size={18} /> Geração e Emissão - Guia do FGTS Digital (GFD)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure os encargos de recolhimento mensal e emita a guia Pix unificada.</p>
              </div>
              <button 
                onClick={() => setShowFgtsModal(false)}
                className="bg-slate-200/60 hover:bg-rose-500 hover:text-white p-2 rounded-full text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Painel Edição de Variáveis (Left col) */}
              <div className="lg:col-span-4 space-y-4 border-r border-slate-100 pr-0 lg:pr-6">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-widest border-b pb-1">Ajuste de Parâmetros</h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Razão Social do Empregador</label>
                  <input 
                    type="text" 
                    value={fgtsForm.razaoSocial}
                    onChange={(e) => setFgtsForm({ ...fgtsForm, razaoSocial: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 font-bold outline-hidden font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Competência</label>
                    <input 
                      type="text" 
                      value={fgtsForm.competencia}
                      onChange={(e) => setFgtsForm({ ...fgtsForm, competencia: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2 text-xs text-slate-800 font-bold outline-hidden font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Vencimento</label>
                    <input 
                      type="text" 
                      value={fgtsForm.vencimento}
                      onChange={(e) => setFgtsForm({ ...fgtsForm, vencimento: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2 text-xs text-slate-800 font-bold outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Quantidade Trabalhadores</label>
                    <input 
                      type="number" 
                      value={fgtsForm.qtdTrabalhadores}
                      onChange={(e) => setFgtsForm({ ...fgtsForm, qtdTrabalhadores: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 p-2 text-xs text-slate-800 font-bold outline-hidden font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">CNPJ Empregador</label>
                    <input 
                      type="text" 
                      value={fgtsForm.cnpj}
                      onChange={(e) => setFgtsForm({ ...fgtsForm, cnpj: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 p-2 text-xs text-slate-800 font-bold outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Valor Líquido FGTS (R$)</label>
                    <input 
                      type="number" 
                      value={fgtsForm.valorFGTS}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFgtsForm({ ...fgtsForm, valorFGTS: val, totais: val + fgtsForm.encargos });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-orange-700 font-black outline-hidden font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Multas / Acréscimos (R$)</label>
                    <input 
                      type="number" 
                      value={fgtsForm.encargos}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFgtsForm({ ...fgtsForm, encargos: val, totais: fgtsForm.valorFGTS + val });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 p-2 text-xs text-slate-850 font-bold outline-hidden font-sans"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-805 text-xs">
                    <div className="flex gap-2 items-start">
                      <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Novo FGTS Digital:</strong> Vigente a partir de 01/03/2024. O pagamento é realizado exclusivamente via Pix. O vencimento deslocou para o dia 20 do mês subsequente por lei, reforce prazos.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-805 text-xs">
                    <label className="block text-[10px] font-black text-orange-500 uppercase">Status do Documento</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${fgtsForm.status === 'Pago' ? 'bg-emerald-500' : 'bg-amber-500 anim-pulse'}`}></span>
                      <strong className="text-sm font-black uppercase tracking-wider">{fgtsForm.status}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visualização de Visual Realística (Right col) */}
              <div className="lg:col-span-8 bg-slate-100 p-6 rounded-2xl flex flex-col justify-center overflow-x-auto min-w-[550px]">
                <div className="bg-white border-2 border-orange-500 p-5 shadow-lg max-w-2xl mx-auto w-full text-[10px] text-black">
                  
                  {/* Cabeçalho */}
                  <div className="flex justify-between border-b-2 border-orange-500 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-full flex flex-col items-center justify-center text-white font-black text-[6px] text-center border">
                        <span className="leading-none select-none">FGTS</span>
                        <span className="leading-none select-none uppercase text-orange-205 font-bold">DIGITAL</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[11px] uppercase leading-tight text-orange-950">Ministério do Trabalho e Emprego</h4>
                        <p className="font-bold text-[9px] text-gray-700 leading-tight">Fundo de Garantia de Tempo de Serviço</p>
                        <p className="text-[8px] text-gray-500 font-mono">GFD - Guia de Recolhimento do FGTS Digital</p>
                      </div>
                    </div>
                    <div className="text-right border-l pl-3 flex flex-col justify-center">
                      <span className="font-black text-xl uppercase tracking-widest text-orange-600 font-mono">GFD</span>
                      <span className="text-[7px] text-gray-500 font-bold uppercase">Competência {fgtsForm.competencia}</span>
                    </div>
                  </div>

                  {/* Detalhes Identificação e Valores */}
                  <div className="grid grid-cols-12 gap-2 mb-3">
                    <div className="col-span-8 border border-gray-300 p-2 font-mono">
                      <label className="block text-[7px] font-bold text-gray-500 uppercase">Razão Social do Empregador GIPP Sede</label>
                      <div className="font-black text-xs text-gray-950 uppercase leading-tight">{fgtsForm.razaoSocial}</div>
                      <div className="text-[7.5px] text-gray-505 mt-1.5 font-sans leading-none flex items-center">
                        Cadastro Geral de Obreiros e Funcionários CLT do Ministério
                      </div>
                    </div>
                    <div className="col-span-4 grid grid-rows-3 gap-1.5 font-mono text-slate-700">
                      <div className="border border-gray-300 p-1">
                        <label className="block text-[6px] font-bold text-gray-400">COMPETÊNCIA DE APURAÇÃO</label>
                        <div className="font-extrabold text-xs text-right leading-none">{fgtsForm.competencia}</div>
                      </div>
                      <div className="border border-gray-300 p-1">
                        <label className="block text-[6px] font-bold text-gray-400">LIMITE DE VENCIMENTO</label>
                        <div className="font-extrabold text-xs text-right leading-none text-red-600">{fgtsForm.vencimento}</div>
                      </div>
                      <div className="border border-gray-300 p-1">
                        <label className="block text-[6px] font-bold text-gray-400">QTD TRABALHADORES</label>
                        <div className="font-extrabold text-xs text-right leading-none">{fgtsForm.qtdTrabalhadores}</div>
                      </div>
                    </div>
                  </div>

                  {/* Linha 2 de Detalhes */}
                  <div className="grid grid-cols-12 gap-2 mb-3">
                    <div className="col-span-8 border border-gray-300 p-3 space-y-2 flex flex-col justify-between">
                      <div>
                        <h5 className="font-black text-[8px] text-orange-700 uppercase tracking-wider mb-1 leading-none">Instruções para Quitação Unificada:</h5>
                        <p className="text-[7.5px] leading-snug text-gray-505 font-sans">
                          Utilize o QR Code PIX disponibilizado pelas integrações oficiais do MTE. A conciliação individual de cada trabalhador na Caixa é instantânea.
                        </p>
                      </div>
                      <div className="bg-orange-50 px-2 py-1.5 rounded border border-dashed text-[7px] text-orange-850 font-mono leading-none border-orange-200">
                        Código Identificador eSocial: FGTSD-LOTE982-S1200-S1299
                      </div>
                    </div>
                    <div className="col-span-4 grid grid-rows-3 gap-1 font-mono text-slate-700">
                      <div className="border border-gray-300 p-1">
                        <label className="block text-[6px] font-bold text-gray-400">VALOR DO FGTS RECOLHIDO</label>
                        <div className="font-semibold text-xs text-right leading-none">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fgtsForm.valorFGTS)}</div>
                      </div>
                      <div className="border border-gray-300 p-1">
                        <label className="block text-[6px] font-bold text-gray-400">MULTAS E ACRÉSCIMOS</label>
                        <div className="font-semibold text-xs text-right leading-none">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fgtsForm.encargos)}</div>
                      </div>
                      <div className="border border-orange-400 p-1 bg-orange-50 flex flex-col justify-center">
                        <label className="block text-[6px] font-black text-orange-800">TOTAL FINAL A RECOLHER</label>
                        <div className="font-black text-xs text-right text-orange-950 leading-none">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fgtsForm.totais)}</div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Pix e Chave Copia e Cola */}
                  <div className="border border-orange-200 p-3 bg-orange-50/20 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-[8.5px] font-black text-orange-850 leading-none mb-1">⚡ PIX COBRANÇA DO FGTS DIGITAL (RECOLHIMENTO IMEDIATO)</div>
                      <p className="text-[7.5px] text-gray-600 leading-tight">
                        A compensação e individualização nas contas dos trabalhadores acontecem em tempo real. Muito mais ágil do que o antigo boleto GRF.
                      </p>
                      <div className="mt-1 text-[7px] font-mono select-all bg-white p-1 rounded border border-orange-200 overflow-x-auto text-gray-500 whitespace-nowrap leading-none">
                        00020101021226850014br.gov.bcb.fgtsdigital.gov.br/receita/fgtspix?txid=fgtslote9823600abc
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-white border border-orange-200 p-0.5 flex shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                        <rect width="100" height="100" fill="white" />
                        <rect x="5" y="5" width="25" height="25" fill="black" />
                        <rect x="10" y="10" width="15" height="15" fill="white" />
                        <rect x="13" y="13" width="9" height="9" fill="black" />
                        <rect x="70" y="5" width="25" height="25" fill="black" />
                        <rect x="75" y="10" width="15" height="15" fill="white" />
                        <rect x="78" y="13" width="9" height="9" fill="black" />
                        <rect x="5" y="70" width="25" height="25" fill="black" />
                        <rect x="10" y="75" width="15" height="15" fill="white" />
                        <rect x="13" y="78" width="9" height="9" fill="black" />
                        <rect x="35" y="35" width="30" height="30" fill="black" />
                        <rect x="40" y="40" width="20" height="20" fill="white" />
                        <rect x="45" y="45" width="10" height="10" fill="black" />
                        <rect x="35" y="10" width="5" height="10" fill="black" />
                        <rect x="50" y="5" width="10" height="5" fill="black" />
                        <rect x="75" y="35" width="15" height="5" fill="black" />
                        <rect x="35" y="75" width="5" height="15" fill="black" />
                        <rect x="50" y="85" width="15" height="5" fill="black" />
                      </svg>
                    </div>
                  </div>

                  {/* Código de barras simulado */}
                  <div className="mt-4 flex flex-col items-center">
                    <div className="font-mono text-center text-[8px] tracking-widest font-black leading-none mb-1">
                      858200000360 000002102026 052012543981 982360012345
                    </div>
                    <div className="flex items-center justify-center bg-white p-1 border border-orange-500 w-full max-w-sm">
                      <svg viewBox="0 0 400 20" className="w-full h-4">
                        <rect width="400" height="20" fill="white" />
                        <g fill="black">
                          <rect x="10" y="0" width="3" height="20" />
                          <rect x="15" y="0" width="1" height="20" />
                          <rect x="18" y="0" width="4" height="20" />
                          <rect x="24" y="0" width="2" height="20" />
                          <rect x="30" y="0" width="1" height="20" />
                          <rect x="35" y="0" width="5" height="20" />
                          <rect x="42" y="0" width="2" height="20" />
                          <rect x="46" y="0" width="3" height="20" />
                          <rect x="52" y="0" width="1" height="20" />
                          <rect x="56" y="0" width="4" height="20" />
                          <rect x="62" y="0" width="2" height="20" />
                          <rect x="66" y="0" width="3" height="20" />
                          <rect x="72" y="0" width="1" height="20" />
                          <rect x="76" y="0" width="5" height="20" />
                          <rect x="100" y="0" width="3" height="20" />
                          <rect x="105" y="0" width="1" height="20" />
                          <rect x="109" y="0" width="4" height="20" />
                          <rect x="115" y="0" width="2" height="20" />
                          <rect x="125" y="0" width="5" height="20" />
                          <rect x="132" y="0" width="2" height="20" />
                          <rect x="136" y="0" width="3" height="20" />
                          <rect x="146" y="0" width="4" height="20" />
                          <rect x="152" y="0" width="2" height="20" />
                          <rect x="158" y="0" width="3" height="20" />
                          <rect x="164" y="0" width="1" height="20" />
                          <rect x="168" y="0" width="5" height="20" />
                          <rect x="191" y="0" width="4" height="20" />
                          <rect x="197" y="0" width="2" height="20" />
                          <rect x="203" y="0" width="3" height="20" />
                          <rect x="213" y="0" width="5" height="20" />
                          <rect x="220" y="0" width="2" height="20" />
                          <rect x="225" y="0" width="4" height="20" />
                          <rect x="231" y="0" width="1" height="20" />
                          <rect x="235" y="0" width="3" height="20" />
                          <rect x="245" y="0" width="5" height="20" />
                          <rect x="256" y="0" width="4" height="20" />
                          <rect x="262" y="0" width="2" height="20" />
                          <rect x="268" y="0" width="3" height="20" />
                          <rect x="274" y="0" width="1" height="20" />
                          <rect x="278" y="0" width="5" height="20" />
                          <rect x="285" y="0" width="2" height="20" />
                          <rect x="290" y="0" width="3" height="20" />
                          <rect x="300" y="0" width="4" height="20" />
                          <rect x="306" y="0" width="2" height="20" />
                          <rect x="312" y="0" width="3" height="20" />
                          <rect x="322" y="0" width="5" height="20" />
                          <rect x="330" y="0" width="2" height="20" />
                          <rect x="335" y="0" width="4" height="20" />
                          <rect x="345" y="0" width="3" height="20" />
                          <rect x="351" y="0" width="2" height="20" />
                          <rect x="355" y="0" width="5" height="20" />
                          <rect x="367" y="0" width="4" height="20" />
                          <rect x="373" y="0" width="2" height="20" />
                          <rect x="379" y="0" width="3" height="20" />
                        </g>
                      </svg>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3 rounded-b-3xl">
              <div>
                {fgtsForm.status !== 'Pago' && (
                  <Button 
                    onClick={() => {
                      setFgtsForm({ ...fgtsForm, status: 'Pago' });
                      setTransactions(prev => [
                        { id: 'fgtst', data: getTodayDate(), descricao: 'PAGTO FGTS DIGITAL RECOLHIMENTO', valor: fgtsForm.totais, tipo: 'saida', status: 'conciliado', conciliadoCom: 'FGTS Digital Pix Emissor' },
                        ...prev
                      ]);
                      addToast('Compensação recebida com sucesso! Encargos de FGTS individualizados e liquidados eletronicamente na CEF via Pix.', 'success');
                    }}
                    variant="primary" 
                    icon={Check}
                    className="bg-emerald-600 hover:bg-emerald-700 pointer font-bold"
                  >
                    Efetuar Lançamento e Pagamento (Pix)
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowFgtsModal(false)} variant="secondary">Fechar</Button>
                <Button 
                  onClick={() => handlePrintFgts(fgtsForm)} 
                  variant="primary" 
                  icon={Printer}
                  className="bg-orange-600 hover:bg-orange-700 hover:text-white pointer"
                >
                  Imprimir Guia
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showDirfModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowDirfModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[85vh] flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-3xl text-slate-700">
              <div>
                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="text-emerald-600" size={18} /> Certidão Tempestiva - Substituição DIRF Anual
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Certificado eletrônico de conformidade com as diretivas eSocial e Receita Federal do Brasil.</p>
              </div>
              <button 
                onClick={() => setShowDirfModal(false)}
                className="bg-slate-200/60 hover:bg-rose-500 hover:text-white p-2 rounded-full text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 font-sans">
              <div className="border border-emerald-600 border-2 bg-white rounded-2xl p-8 relative max-w-2xl mx-auto shadow-sm">
                <div className="absolute top-4 right-4 text-right">
                  <span className="text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
                    Certidão Online Ativa
                  </span>
                </div>

                <div className="flex items-center gap-4 border-b border-emerald-100 pb-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-700 text-white rounded-full flex items-center justify-center font-extrabold text-[12px]">
                    RFB
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wide text-emerald-950">MINISTÉRIO DA FAZENDA</h4>
                    <p className="text-[10px] uppercase font-bold text-slate-600 leading-none mr-2">Secretaria Especial da Receita Federal do Brasil</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-none">Comprovante de Regularidade de Rendimentos na Fonte (DIRF)</p>
                  </div>
                </div>

                <div className="text-center bg-emerald-50/50 rounded-xl p-3 border border-emerald-200 mb-6">
                  <h5 className="text-xs font-black text-emerald-900 uppercase tracking-widest leading-none mb-1">DECLARAÇÃO DE DISPENSA E SUBSTITUIÇÃO</h5>
                  <p className="text-[9px] text-emerald-750 font-mono font-semibold">Instrução Normativa RFB nº 2.043/2021 e nº 2.181/2024</p>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
                  <p className="text-[11px]">
                    A <strong>Secretaria Especial da Receita Federal do Brasil</strong>, através do seu sistema consular integrado, CERTIFICA que para o ano-calendário correspondente, a entidade identificada abaixo cumpriu com as obrigações e encontra-se <strong>DISPENSADA</strong> de declaração física DIRF.
                  </p>

                  <div className="border rounded-xl p-4 bg-slate-50/50 font-mono text-[10px] space-y-2">
                    <div>
                      <span className="text-[8px] font-bold text-slate-400 block">NOME DA INSTITUIÇÃO / TEMPLO</span>
                      <strong className="text-slate-800 text-xs">INSTITUIÇÃO SEDE / MATRIZ GIPP</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 block">CNPJ VALIDADOR</span>
                        <strong className="text-slate-800">12.345.678/0001-99</strong>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 block">ENQUADRAMENTO FISCAL</span>
                        <strong className="text-slate-800">Organização Religiosa / Filantrópica</strong>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 block">REGIME DA DIRF ANUAL</span>
                        <span className="bg-emerald-100 text-emerald-850 px-1.5 py-0.5 rounded font-black text-[9px] border border-emerald-200">TOTALMENTE SUBSTITUÍDA</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 block">CÓDIGO DE AUTORIZAÇÃO</span>
                        <strong className="text-emerald-800">RFB-DIRFSUB-2026-9173A</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] space-y-2 pt-2 text-slate-600 font-medium">
                    <h6 className="font-extrabold text-[11px] text-slate-800 uppercase tracking-wider mb-1">Dispositivos Constitucionais e Transmissão Ordinária:</h6>
                    <p className="leading-snug">
                      1. As informações de retenções na fonte relativas ao imposto de renda e as contribuições previdenciárias sobre os rendimentos do trabalho da folha clerical foram consolidadas integralmente por meio dos periódicos eSocial <strong>S-1200 / S-1210</strong>.
                    </p>
                    <p className="leading-snug">
                      2. A quitação de encargos foi apurada sob a modalidade da <strong>DCTFWeb</strong> mensal.
                    </p>
                    <p className="leading-snug">
                      3. Os dados foram devidamente homologados junto à Receita Federal e não apresentam inconformidades técnicas ou administrativas.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-center sm:text-left">
                      <span className="text-[8px] font-bold text-slate-400 block">CHAVE ELETRÔNICA ICP-BRASIL</span>
                      <strong className="text-emerald-700 font-mono text-[10px]">✓ VALIDADA COM CERTIFICADO DIGITAL A1</strong>
                    </div>
                    <div className="text-[9px] text-slate-400 text-center sm:text-right font-mono font-bold">
                      Data Homologação: 14/06/2026
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3 rounded-b-3xl">
              <Button onClick={() => setShowDirfModal(false)} variant="secondary">Fechar</Button>
              <Button 
                onClick={handlePrintDirf} 
                variant="primary" 
                icon={Printer}
                className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                Imprimir Certidão
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showProcessoAiModal && processoAiResult && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Consulta Processual IA</h3>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Resumo Analítico Jusbrasil e Tribunais Off-Shore</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProcessoAiModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 space-y-1">
                  <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Processo Solicitado</span>
                  <h4 className="text-xl font-bold font-mono tracking-tight">{processoAiResult.processo.numero}</h4>
                  <p className="text-xs text-slate-300">{processoAiResult.processo.titulo} • Autor: {processoAiResult.processo.autor}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <Sparkles size={16} className="text-indigo-600" />
                  <h4 className="font-extrabold text-sm text-slate-800 tracking-wide">Relatório Gerado por IA</h4>
                </div>
                
                <div className="whitespace-pre-wrap text-[11px] text-slate-700 leading-relaxed font-medium">
                  {processoAiResult.result}
                </div>
              </div>
              
              <div className="mt-6 flex gap-3 text-[10px] text-slate-500 bg-amber-50/60 p-3 border border-amber-100 rounded-xl">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-amber-800">Atenção:</strong> Esta é uma averiguação automatizada utilizando inteligência artificial a partir de bases públicas de tribunais, Jusbrasil e Diários Oficiais. Os dados podem não estar em tempo real ou possuir bloqueio de segredo de justiça. Confirme os despachos no sistema E-Proc/PJe correspondente.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <Button onClick={() => setShowProcessoAiModal(false)} variant="secondary" className="px-6">Fechar Relatório</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
});

export default ModuleDPContabilidade;
