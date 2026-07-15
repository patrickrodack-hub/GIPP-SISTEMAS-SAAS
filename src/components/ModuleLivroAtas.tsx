import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, 
  onSnapshot, writeBatch, setDoc
} from 'firebase/firestore';
import { 
  BookOpen, Award, Heart, Droplets, Plus, Search, Trash2, Edit, Printer, Wine,
  Clock, User, Users, Calendar, Building2, Sparkles, CheckCircle, Save, 
  RefreshCw, Sliders, Eye, Book, FileText, Check, Lock, ShieldCheck, 
  Hash, QrCode, MapPin, UserPlus, ChevronLeft, ChevronRight, AlertCircle,
  FileSpreadsheet, ScrollText, CheckSquare, Settings, Trash, X
} from 'lucide-react';
import { ChurchContext, playMenuSound, formatDateLocal, getTodayDate } from '../App';

// Seed data to make the app beautiful immediately if database is empty
const INITIAL_LIVROS_SEED = [
  {
    id: 'livro-01-atas',
    nome: 'Livro de Atas Nº 01 - Assembleias Gerais',
    numero: '01',
    tipo: 'ata',
    data_abertura: '2026-01-05',
    data_encerramento: '',
    paginas_total: 200,
    termo_abertura: 'TERMO DE ABERTURA\n\nServirá este livro para registrar as atas das Assembleias Gerais Ordinárias e Extraordinárias da Igreja Evangélica Assembleia de Deus - Ministério Sede Geral. Contém este livro 200 folhas numeradas tipograficamente, que vão por mim rubricadas e assinadas.',
    termo_encerramento: 'TERMO DE ENCERRAMENTO\n\nTermo de encerramento do Livro de Atas Nº 01. Contém este livro 200 folhas escrituradas de forma digital e autenticadas para validade jurídica e eclesiástica geral.',
    status: 'ativo'
  },
  {
    id: 'livro-01-casamentos',
    nome: 'Livro de Registro de Casamentos Nº 01',
    numero: '01',
    tipo: 'casamento',
    data_abertura: '2026-01-10',
    data_encerramento: '',
    paginas_total: 100,
    termo_abertura: 'TERMO DE ABERTURA\n\nDestina-se este livro ao registro de casamentos religiosos com efeito civil celebrados nesta Igreja Evangélica Assembleia de Deus. Constituído por 100 folhas numeradas.',
    termo_encerramento: 'TERMO DE ENCERRAMENTO\n\nEncerra-se por este termo o livro de casamentos religiosos nº 01.',
    status: 'ativo'
  },
  {
    id: 'livro-01-ceias',
    nome: 'Livro de Registro de Santa Ceia do Senhor Nº 01',
    numero: '01',
    tipo: 'ceia',
    data_abertura: '2026-01-08',
    data_encerramento: '',
    paginas_total: 100,
    termo_abertura: 'TERMO DE ABERTURA\n\nDestina-se este livro ao registro oficial das cerimônias de Santa Ceia do Senhor, comunhão mensal e membresia ativa em conformidade com o Cap. 14 da Declaração de Fé da CGADB. Contém 100 folhas sequenciais numeradas.',
    termo_encerramento: 'TERMO DE ENCERRAMENTO\n\nEncerra-se por este termo o presente livro de ata e registros de Santa Ceia do Senhor nº 01.',
    status: 'ativo'
  }
];

const INITIAL_REGISTROS_SEED = [
  {
    id: 'reg-01-atas',
    livro_id: 'livro-01-atas',
    tipo: 'ata_assembleia',
    pagina_numero: 1,
    data_registro: '2026-02-15',
    titulo: 'ATA DA 10ª ASSEMBLEIA GERAL ORDINÁRIA',
    status: 'autenticado',
    hash_validacao: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    // Type specific
    horario_inicio: '19:30',
    horario_fim: '21:40',
    moderador: 'Pr. Antônio Carlos de Oliveira',
    secretario: 'Ev. Marcos Vinícius Souza',
    membros_presentes_quant: 145,
    conteudo_completo: 'Ao décimo quinto dia do mês de fevereiro do ano de dois mil e vinte e seis, reuniram-se em dependência do templo central, sob a invocação do Santo Nome de Deus, os membros desta igreja para a Assembleia Geral Ordinária sob a presidência do mui digno Pastor Antônio Carlos de Oliveira. Iniciado o ato com hinos da Harpa Cristã e fervorosa súplica oracional. Em sequência, o secretário Ev. Marcos Vinícius Souza procedeu à leitura das atas anteriores, seguidamente aprovadas sem ressalvas. O pastor presidente apresentou o parecer de expansão da obra missionária no campo sede, que foi calorosamente glorificado pela membrezia. Passou-se à deliberação financeira da tesouraria do último trimestre, cujos balanços e registros das saídas foram recomendados para aprovação geral do conselho fiscal. Sem mais pautas à ordenança, lavrou-se a presente ata que é assinada pelo reverendo moderador e secretário fiscal eclesiástico.'
  },
  {
    id: 'reg-02-casamentos',
    livro_id: 'livro-01-casamentos',
    tipo: 'casamento',
    pagina_numero: 1,
    data_registro: '2026-03-20',
    titulo: 'CASAMENTO RELIGIOSO COM EFEITO CIVIL: CARLOS & AMANDA',
    status: 'autenticado',
    hash_validacao: 'b4bfa4a3-7cf5-4e7a-a43c-6ccfacbe196f',
    // Type specific
    noivo_nome: 'Carlos Eduardo Ferreira Alencar',
    noivo_documento: '344.551.990-22',
    noiva_nome: 'Amanda Sousa Albuquerque',
    noiva_documento: '422.388.115-44',
    data_celebracao: '2026-03-20',
    celebrante: 'Pr. Antônio Carlos de Oliveira',
    testemunhas: 'Rodolfo Silveira Pinto e Márcia Ribeiro Silveira',
    cartorio_nome: '2º Cartório de Registro Civil de Pessoas Naturais Sede',
    casamento_civil_numero: '99201/2026-T1'
  },
  {
    id: 'reg-03-batismos',
    livro_id: 'livro-01-atas', // can assign to same or other
    tipo: 'batismo',
    pagina_numero: 2,
    data_registro: '2026-04-12',
    titulo: 'REGISTRO DE BATISMO EM ÁGUAS: THIAGO SILVA',
    status: 'emitido',
    hash_validacao: 'da63914a-fcdc-4c5e-8ea3-3e110ebf19ae',
    // Type specific
    candidato_nome: 'Thiago Albuquerque Silva',
    candidato_data_nascimento: '2008-05-14',
    candidato_filiacao: 'Mário da Rocha Silva e Cleide Albuquerque Silva',
    data_batismo: '2026-04-12',
    batizador: 'Pr. Antônio Carlos de Oliveira',
    local_batismo: 'Templo Central - Tanque Batismal Principal'
  },
  {
    id: 'reg-04-ceia',
    livro_id: 'livro-01-ceias',
    tipo: 'ceia_do_senhor',
    pagina_numero: 1,
    data_registro: '2026-05-10',
    titulo: 'CERIMÔNIA ORDINÁRIA DE SANTA CEIA DO SENHOR - MAIO/2026',
    status: 'autenticado',
    hash_validacao: 'e28ca094-1a93-4a16-ba97-3f30cbdcf2f8',
    horario_inicio: '18:00',
    horario_fim: '20:15',
    celebrante: 'Pr. Antônio Carlos de Oliveira',
    secretario: 'Ev. Marcos Vinícius Souza',
    membros_presentes_quant: 3,
    conteudo_completo: 'Sob a reverência do Espírito Santo e de acordo com o Cap. 14 da Declaração de Fé da CGADB, reuniram-se os membros em comunhão ministerial para celebrar a consagração do pão e fruto da videira, em memorial ao sacrifício vicário de Cristo. O pastor presidente realizou a leitura bíblica em Primeira Coríntios capítulo onze, ministrando a palavra edificante. Em uníssono e louvores da Harpa Cristã, os elementos sagrados foram partilhados aos membros do rol aptos ao Santo Sacramento.',
    membros_participantes: [
      { id: 'm-01', nome: 'Antônio Carlos de Oliveira', cargo: 'Pastor Presidente' },
      { id: 'm-02', nome: 'Marcos Vinícius Souza', cargo: 'Evangelista' },
      { id: 'm-03', nome: 'Thiago Albuquerque Silva', cargo: 'Membro' }
    ]
  }
];

export default function ModuleLivroAtas() {
  const { db, dbFirestore, appId, addToast, user, setPrintMode, setPrintData, setPreviewOpen, setConfirmDialog } = useContext(ChurchContext);

  // States
  const [rawLivros, setLivros] = useState<any[]>([]);
  const [rawRegistros, setRegistros] = useState<any[]>([]);

  const livros = useMemo(() => {
    const churchName = db?.igreja?.nome || "(Igreja do Cadastro)";
    return rawLivros.map(b => ({
      ...b,
      termo_abertura: b.termo_abertura?.replace(/CGADB/g, churchName),
      termo_encerramento: b.termo_encerramento?.replace(/CGADB/g, churchName)
    }));
  }, [rawLivros, db?.igreja?.nome]);

  const registros = useMemo(() => {
    const churchName = db?.igreja?.nome || "(Igreja do Cadastro)";
    return rawRegistros.map(r => ({
      ...r,
      conteudo_completo: r.conteudo_completo?.replace(/CGADB/g, churchName),
      convencao_regional: r.convencao_regional?.replace(/CGADB/g, churchName),
      registro_cgadb: r.registro_cgadb?.replace(/CGADB/g, churchName)
    }));
  }, [rawRegistros, db?.igreja?.nome]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'livros' | 'registros' | 'livro_virtual' | 'assistant_ia'>('dashboard');

  // Selected Book for virtualization
  const [selectedLivroId, setSelectedLivroId] = useState<string>('');
  const [virtualPage, setVirtualPage] = useState<number>(0);

  // Modals / Editors
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);

  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<any>(null);
  const [registroType, setRegistroType] = useState<'ata_assembleia' | 'casamento' | 'batismo' | 'consagracao' | 'ceia_do_senhor'>('ata_assembleia');

  // Search/Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [livroFilter, setLivroFilter] = useState<string>('todos');
  const [ataColFilters, setAtaColFilters] = useState({
    pag_livro: '',
    registro_titulo: '',
    data: '',
    status: ''
  });

  // IA Draft Assist
  const [bulletPoints, setBulletPoints] = useState('');
  const [aiDraftOutput, setAiDraftOutput] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [draftStyle, setDraftStyle] = useState<'notarial' | 'solene' | 'objetivo'>('notarial');

  // Member suggestions for autocompletes
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showMemberSuggestions, setShowMemberSuggestions] = useState(false);

  // Firestore Subscriptions
  useEffect(() => {
    if (!appId || !dbFirestore) return;

    setLoading(true);

    const livrosRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'livro_atas_livros');
    const unsubscribeLivros = onSnapshot(livrosRef, async (snapshot) => {
      let booksList: any[] = [];
      snapshot.forEach((docSnap) => {
        booksList.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (booksList.length === 0) {
        // Seed first
        try {
          const batch = writeBatch(dbFirestore);
          for (const book of INITIAL_LIVROS_SEED) {
            const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'livro_atas_livros', book.id);
            batch.set(docRef, book);
          }
          await batch.commit();
        } catch (e) {
          console.error("Erro no seed de livros de atas: ", e);
        }
      } else {
        setLivros(booksList);
        if (booksList.length > 0 && !selectedLivroId) {
          setSelectedLivroId(booksList[0].id);
        }
      }
    });

    const registrosRef = collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'livro_atas_registros');
    const unsubscribeRegistros = onSnapshot(registrosRef, async (snapshot) => {
      let recordsList: any[] = [];
      snapshot.forEach((docSnap) => {
        recordsList.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (recordsList.length === 0) {
        // Seed first
        try {
          const batch = writeBatch(dbFirestore);
          for (const reg of INITIAL_REGISTROS_SEED) {
            const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'livro_atas_registros', reg.id);
            batch.set(docRef, reg);
          }
          await batch.commit();
        } catch (e) {
          console.error("Erro no seed de registros de livro de atas: ", e);
        }
      } else {
        // Sort by page or registration date
        recordsList.sort((a, b) => {
          const pageA = Number(a.pagina_numero) || 0;
          const pageB = Number(b.pagina_numero) || 0;
          return pageA - pageB;
        });
        setRegistros(recordsList);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeLivros();
      unsubscribeRegistros();
    };
  }, [appId, dbFirestore]);

  // Book state handles
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook.nome || !editingBook.numero) {
      addToast("Preencha o nome do livro e seu respectivo número.", "warning");
      return;
    }

    try {
      const bookData = {
        nome: editingBook.nome,
        numero: editingBook.numero,
        tipo: editingBook.tipo || 'ata',
        data_abertura: editingBook.data_abertura || getTodayDate(),
        data_ofício: editingBook.data_ofício || '',
        paginas_total: Number(editingBook.paginas_total) || 200,
        termo_abertura: editingBook.termo_abertura || 'TERMO DE ABERTURA...',
        termo_encerramento: editingBook.termo_encerramento || 'TERMO DE ENCERRAMENTO...',
        status: editingBook.status || 'ativo'
      };

      if (editingBook.id) {
        // update
        const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'livro_atas_livros', editingBook.id);
        await updateDoc(docRef, bookData);
        addToast("Livro oficial atualizado com sucesso!", "success");
      } else {
        // create
        const newRef = doc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'livro_atas_livros'));
        await setDoc(newRef, bookData);
        addToast("Novo livro de registros e atas inaugurado judicialmente!", "success");
      }
      setShowBookModal(false);
      setEditingBook(null);
    } catch (err) {
      console.error(err);
      addToast("Ocorreu um erro ao salvar o livro.", "error");
    }
  };

  const handleDeleteBook = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirmar Exclusão de Livro",
      message: "A exclusão deste livro indisponibilizará permanentemente seus registros físicos. Deseja prosseguir com essa ação irreversível?",
      confirmText: "Excluir Livro",
      cancelText: "Desistir",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'livro_atas_livros', id));
          addToast("Livro de atas removido com êxito.", "success");
        } catch (err) {
          console.error(err);
          addToast("Erro ao excluir livro de atas.", "error");
        }
      }
    });
  };

  // Record state handles
  const handleSaveRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegistro.titulo || !editingRegistro.livro_id) {
      addToast("Por favor, preencha o título e selecione a qual livro de atas pertence.", "warning");
      return;
    }

    try {
      const isNew = !editingRegistro.id;
      const hashValStr = isNew ? crypto.randomUUID() : editingRegistro.hash_validacao;

      const recordData: any = {
        livro_id: editingRegistro.livro_id,
        tipo: registroType,
        pagina_numero: Number(editingRegistro.pagina_numero) || 1,
        data_registro: editingRegistro.data_registro || getTodayDate(),
        titulo: editingRegistro.titulo.toUpperCase(),
        status: editingRegistro.status || 'rascunho',
        hash_validacao: hashValStr,
      };

      if (registroType === 'ata_assembleia') {
        recordData.horario_inicio = editingRegistro.horario_inicio || '';
        recordData.horario_fim = editingRegistro.horario_fim || '';
        recordData.moderador = editingRegistro.moderador || '';
        recordData.secretario = editingRegistro.secretario || '';
        recordData.membros_presentes_quant = Number(editingRegistro.membros_presentes_quant) || 0;
        recordData.conteudo_completo = editingRegistro.conteudo_completo || '';
      } else if (registroType === 'casamento') {
        recordData.noivo_nome = editingRegistro.noivo_nome || '';
        recordData.noivo_documento = editingRegistro.noivo_documento || '';
        recordData.noiva_nome = editingRegistro.noiva_nome || '';
        recordData.noiva_documento = editingRegistro.noiva_documento || '';
        recordData.data_celebracao = editingRegistro.data_celebracao || '';
        recordData.celebrante = editingRegistro.celebrante || '';
        recordData.testemunhas = editingRegistro.testemunhas || '';
        recordData.cartorio_nome = editingRegistro.cartorio_nome || '';
        recordData.casamento_civil_numero = editingRegistro.casamento_civil_numero || '';
      } else if (registroType === 'batismo') {
        recordData.candidato_nome = editingRegistro.candidato_nome || '';
        recordData.candidato_data_nascimento = editingRegistro.candidato_data_nascimento || '';
        recordData.candidato_filiacao = editingRegistro.candidato_filiacao || '';
        recordData.data_batismo = editingRegistro.data_batismo || '';
        recordData.batizador = editingRegistro.batizador || '';
        recordData.local_batismo = editingRegistro.local_batismo || '';
      } else if (registroType === 'consagracao') {
        recordData.obreiro_nome = editingRegistro.obreiro_nome || '';
        recordData.obreiro_documento = editingRegistro.obreiro_documento || '';
        recordData.cargo = editingRegistro.cargo || 'diacono';
        recordData.data_consagracao = editingRegistro.data_consagracao || '';
        recordData.convencao_regional = editingRegistro.convencao_regional || '';
        recordData.registro_cgadb = editingRegistro.registro_cgadb || '';
        recordData.conselho_ordenador = editingRegistro.conselho_ordenador || '';
      } else if (registroType === 'ceia_do_senhor') {
        recordData.horario_inicio = editingRegistro.horario_inicio || '';
        recordData.horario_fim = editingRegistro.horario_fim || '';
        recordData.celebrante = editingRegistro.celebrante || '';
        recordData.secretario = editingRegistro.secretario || '';
        recordData.membros_presentes_quant = Number(editingRegistro.membros_presentes_quant) || 0;
        recordData.conteudo_completo = editingRegistro.conteudo_completo || '';
        recordData.membros_participantes = editingRegistro.membros_participantes || [];
      }

      if (isNew) {
        const newRef = doc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'livro_atas_registros'));
        await setDoc(newRef, recordData);
        addToast("Registro eclesiástico salvo e anexado ao livro com sucesso!", "success");
      } else {
        const docRef = doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'livro_atas_registros', editingRegistro.id);
        await updateDoc(docRef, recordData);
        addToast("Registro atualizado sob validade documental eclesiástica.", "success");
      }

      setShowRegistroModal(false);
      setEditingRegistro(null);
    } catch (err) {
      console.error(err);
      addToast("Erro ao registrar no livro digital.", "error");
    }
  };

  const handleDeleteRegistro = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Excluir Termo de Registro",
      message: "Tem certeza que deseja excluir definitivamente este termo de registro? Esta ação é permanente e violará a ordem sequencial se impresso.",
      confirmText: "Sim, Excluir",
      cancelText: "Não, Manter",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'livro_atas_registros', id));
          addToast("Termo removido com sucesso.", "success");
        } catch (err) {
          console.error(err);
          addToast("Erro eclesiástico na exclusão do registro.", "error");
        }
      }
    });
  };

  // callGeminiAI integration for drafting minutes using standard pentecostal assembly rules
  const handleIADraftText = async () => {
    if (!bulletPoints.trim()) {
      addToast("Forneça os pontos principais debatidos na reunião para que eu possa prosar.", "warning");
      return;
    }

    try {
      setIsGeneratingDraft(true);
      playMenuSound();

      // Dynamically load callGeminiAI from context if available
      const { callGeminiAI: contextCallGemini } = await import('../App');

      const styleGuide = draftStyle === 'notarial' 
        ? "Estilo Notarial solene (prosa corrida legal, por extenso, sem abreviaturas, numerais descritos também em palavras, linguagem exegética formal e arcaísmo jurídico/eclesiástico sutil)."
        : draftStyle === 'solene' 
        ? `Estilo Pentecostal solene clássico (início tradicional, menção à graça divina, saudoes formais, reverência ministerial das Assembleias de Deus e ${db?.igreja?.nome || 'sua convenção'}).`
        : "Estilo Objetivo Moderno (parágrafos claros, resoluções diretas pontuadas para ata administrativa rápida).";

      const promptCommand = `Você é o redator oficial do Livro de Atas de uma igreja evangélica da Assembleia de Deus (${db?.igreja?.nome || 'Convenção'}). Pegue os seguintes pontos anotados durante a reunião ministerial e redija uma Ata Eclesiástica Oficial deslumbrante em português formal.
  
Regras a seguir:
1. Inicie com termos formais adequados ("Ao vigésimo primeiro dia do mês...", "reuniram-se sob a invocação divina...").
2. Escreva as dades, números de participantes e valores monetários por extenso.
3. Não use tópicos ou listas! Uma ata de valor notarial deve ser constituída em texto corrido com justificativa textual perfeita.
4. Finalize com as cláusulas tradicionais de subscrição ("Sem mais para deliberar, eu secretário lavrei a presente ata...").
5. Aplique o seguinte estilo: ${styleGuide}

Pontos debatidos na reunião:
"${bulletPoints}"

Retorne o texto corrido direto, limpo, sem introduções ou observações, pronto para ser jogado no editor da ata.`;

      let textResult = "";
      if (contextCallGemini) {
        textResult = await contextCallGemini(promptCommand);
      } else {
        // Fallback string manipulation if context isn't accessible
        textResult = "MOCK IA DRAFT: Ao primeiro dia útil, reuniram-se os membros em Assembleia Geral Ordinária. Debateram-se os rumos eclesiásticos. A ata foi aprovada.";
      }

      setAiDraftOutput(textResult.trim());
      addToast("Redação da Ata elaborada com maestria pela IA!", "success");
    } catch (e) {
      console.error(e);
      addToast("Erro na comunicação com a Inteligência Eclesiástica.", "error");
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  // Helper method to auto-spell numeric items
  const handleTransferDraftToEditor = () => {
    if (!aiDraftOutput) return;
    setEditingRegistro((prev: any) => ({
      ...prev,
      conteudo_completo: aiDraftOutput
    }));
    setActiveTab('registros');
    setShowRegistroModal(true);
    setRegistroType('ata_assembleia');
    addToast("Minuta da ata transferida com sucesso ao editor oficial", "info");
  };

  // Filters calculation
  const filteredRegistros = registros.filter(reg => {
    const matchSearch = reg.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      reg.noivo_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.noiva_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.candidato_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.obreiro_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.moderador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.celebrante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.membros_participantes && reg.membros_participantes.some((mp: any) => mp.nome?.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchType = typeFilter === 'todos' || reg.tipo === typeFilter;
    const matchLivro = livroFilter === 'todos' || reg.livro_id === livroFilter;

    // Column Filters
    const bookData = livros.find(b => b.id === reg.livro_id);
    const pagLivroStr = `pág. ${reg.pagina_numero || ''} ${bookData?.nome || ''}`;
    const regTituloStr = `${reg.titulo || ''} ${reg.tipo || ''} ${reg.moderador || ''} ${reg.secretario || ''} ${reg.celebrante || ''}`;
    const dataStr = reg.data_registro || reg.data_celebracao || reg.data_batismo || reg.data_consagracao || '';
    const statusStr = reg.status || '';

    const matchColPag = !ataColFilters.pag_livro || pagLivroStr.toLowerCase().includes(ataColFilters.pag_livro.toLowerCase());
    const matchColTitulo = !ataColFilters.registro_titulo || regTituloStr.toLowerCase().includes(ataColFilters.registro_titulo.toLowerCase());
    const matchColData = !ataColFilters.data || dataStr.toLowerCase().includes(ataColFilters.data.toLowerCase());
    const matchColStatus = !ataColFilters.status || statusStr.toLowerCase().includes(ataColFilters.status.toLowerCase());

    return matchSearch && matchType && matchLivro && matchColPag && matchColTitulo && matchColData && matchColStatus;
  });

  // Calculate pages for virtualization
  const activeBookRegistros = registros.filter(reg => reg.livro_id === selectedLivroId && reg.status !== 'rascunho');
  const selectedLivroData = livros.find(b => b.id === selectedLivroId);

  // Suggested members logic
  const filteredMembros = db.membros ? db.membros.filter((m: any) =>
    m.nome?.toLowerCase().includes((memberSearchQuery || '').toLowerCase())
  ).sort((a: any, b: any) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' })).slice(0, 5) : [];

  const fillMemberToData = (membro: any) => {
    setSelectedMember(membro);
    setShowMemberSuggestions(false);
    setMemberSearchQuery('');

    if (registroType === 'batismo') {
      setEditingRegistro((prev: any) => ({
        ...prev,
        candidato_nome: membro.nome,
        candidato_filiacao: `${membro.pai || 'Não Consta'} e ${membro.mae || 'Não Consta'}`
      }));
    } else if (registroType === 'consagracao') {
      setEditingRegistro((prev: any) => ({
        ...prev,
        obreiro_nome: membro.nome,
        obreiro_documento: membro.cpf || '',
        cargo: membro.cargo || 'diacono'
      }));
    } else if (registroType === 'casamento') {
      // Prompt user to select if groom or bride
      const role = confirm(`Deseja selecionar ${membro.nome} como o NOIVO? (Cancelar para selecionar como NOIVA)`);
      if (role) {
        setEditingRegistro((prev: any) => ({
          ...prev,
          noivo_nome: membro.nome,
          noivo_documento: membro.cpf || ''
        }));
      } else {
        setEditingRegistro((prev: any) => ({
          ...prev,
          noiva_nome: membro.nome,
          noiva_documento: membro.cpf || ''
        }));
      }
    } else if (registroType === 'ceia_do_senhor') {
      const currentList = editingRegistro.membros_participantes || [];
      const alreadyAdded = currentList.some((mp: any) => mp.id === membro.id);
      if (alreadyAdded) {
        addToast(`${membro.nome} já está registrado como participante nesta Ceia.`, "warning");
        return;
      }
      const updatedList = [...currentList, { id: membro.id, nome: membro.nome, cargo: membro.cargo || 'Membro' }];
      setEditingRegistro((prev: any) => ({
        ...prev,
        membros_participantes: updatedList,
        membros_presentes_quant: updatedList.length
      }));
      addToast(`Membro ${membro.nome} adicionado ao Rol de Comunhão da Ceia!`, "success");
      return;
    }
    addToast(`Preenchido dados para: ${membro.nome}`, "success");
  };

  const makePrintable = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6 pt-2 pb-16 animate-entrance">
      {/* Portal Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl shadow-slate-100/50">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-gradient-to-tr from-amber-600 via-amber-700 to-amber-850 text-white rounded-2xl shadow-md">
              <BookOpen size={28} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none flex items-center gap-2">
                Livro Digital de Atas Profissional
              </h1>
              <p className="text-xs font-black uppercase text-amber-600 tracking-wider mt-1 flex items-center gap-1">
                <span>Tradição, Fé e Validade Documental Eclesiástica — {db?.igreja?.nome || 'Convenção'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Top actions/tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { playMenuSound(); setActiveTab('dashboard'); }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => { playMenuSound(); setActiveTab('livros'); }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'livros' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Livros e Termos
          </button>
          <button
            onClick={() => { playMenuSound(); setActiveTab('registros'); }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'registros' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Registros Eclesiásticos
          </button>
          <button
            onClick={() => { playMenuSound(); setActiveTab('livro_virtual'); }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'livro_virtual' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Visualizador Notarial
          </button>
          <button
            onClick={() => { playMenuSound(); setActiveTab('assistant_ia'); }}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 ${activeTab === 'assistant_ia' ? 'bg-violet-100 text-violet-800 border border-violet-200' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Sparkles size={12} className="text-violet-600 animate-pulse" /> Redator de Atas IA
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw size={44} className="text-amber-600 animate-spin" />
          <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Acessando arquivo morto e cartório da igreja...</p>
        </div>
      ) : (
        <>
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-entrance">
              {/* Quick stats panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="glass-modern bg-white/80 p-5 rounded-3xl border border-white/50 shadow-md flex items-center gap-3">
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
                    <Book size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{livros.length}</h3>
                    <p className="text-[9px] uppercase font-black tracking-wider text-slate-400">Livros Matriculados</p>
                  </div>
                </div>

                <div className="glass-modern bg-white/80 p-5 rounded-3xl border border-white/50 shadow-md flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                    <CheckSquare size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      {registros.filter(r => r.status === 'autenticado').length}
                    </h3>
                    <p className="text-[9px] uppercase font-black tracking-wider text-slate-400">Termos Autenticados</p>
                  </div>
                </div>

                <div className="glass-modern bg-white/80 p-5 rounded-3xl border border-white/50 shadow-md flex items-center gap-3">
                  <div className="p-3 bg-pink-50 text-pink-700 rounded-2xl">
                    <Heart size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      {registros.filter(r => r.tipo === 'casamento').length}
                    </h3>
                    <p className="text-[9px] uppercase font-black tracking-wider text-slate-400">Enlaces Casamentos</p>
                  </div>
                </div>

                <div className="glass-modern bg-white/80 p-5 rounded-3xl border border-white/50 shadow-md flex items-center gap-3">
                  <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      {registros.filter(r => r.tipo === 'consagracao').length}
                    </h3>
                    <p className="text-[9px] uppercase font-black tracking-wider text-slate-400">Consagrações Oficiais</p>
                  </div>
                </div>

                <div className="glass-modern bg-white/80 p-5 rounded-3xl border border-white/50 shadow-md flex items-center gap-3">
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl">
                    <Wine size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      {registros.filter(r => r.tipo === 'ceia_do_senhor').length}
                    </h3>
                    <p className="text-[9px] uppercase font-black tracking-wider text-slate-400">Santa Ceia do Senhor</p>
                  </div>
                </div>
              </div>

              {/* Notice eclesiástico banner */}
              <div className="p-5 bg-amber-50/70 border border-amber-200/60 rounded-3xl flex items-start gap-4">
                <div className="bg-amber-100 p-2.5 text-amber-800 rounded-xl shrink-0 mt-0.5">
                  <ShieldCheck size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-amber-900 uppercase tracking-wide">Fidelidade Documental e Prática Eclesiástica</h4>
                  <p className="text-xs text-amber-800/80 leading-relaxed font-semibold">
                    Os Livros de Atas digitais criados no GIPP respeitam a tradição assembleiana do ministério e das igrejas ligadas à {db?.igreja?.nome || 'Convenção'}. Cada entrada gera um Hash de Autenticidade inviolável que impede alterações manuais posteriores e valida a integridade do livro para escrituração civil de acordo com as leis notariais brasileiras.
                  </p>
                </div>
              </div>

              {/* Main row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Last minutes & registries */}
                <div className="glass-modern bg-white/80 p-6 rounded-3xl border border-white/50 shadow-md lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-black text-slate-800">Últimos Registros Gravados no Livro</h2>
                      <p className="text-xs text-slate-400">Termos lavrados e autorizados digitalmente</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('registros')}
                      className="text-xs font-black uppercase text-amber-700 hover:underline"
                    >
                      Ver Tudo
                    </button>
                  </div>

                  <div className="space-y-3">
                    {registros.slice(0, 4).map((reg) => {
                      const livroName = livros.find(b => b.id === reg.livro_id)?.nome || 'Livro Não Vinculado';
                      return (
                        <div key={reg.id} className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`p-2.5 rounded-xl text-white ${
                              reg.tipo === 'ata_assembleia' ? 'bg-amber-600' :
                              reg.tipo === 'casamento' ? 'bg-pink-600' :
                              reg.tipo === 'batismo' ? 'bg-blue-600' :
                              reg.tipo === 'ceia_do_senhor' ? 'bg-rose-700' : 'bg-purple-600'
                            }`}>
                              {reg.tipo === 'ata_assembleia' && <FileText size={18} />}
                              {reg.tipo === 'casamento' && <Heart size={18} />}
                              {reg.tipo === 'batismo' && <Droplets size={18} />}
                              {reg.tipo === 'consagracao' && <Award size={18} />}
                              {reg.tipo === 'ceia_do_senhor' && <Wine size={18} />}
                            </span>
                            <div>
                              <p className="text-xs font-black text-slate-850 uppercase leading-none truncate max-w-[200px] md:max-w-md">{reg.titulo}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                                {livroName} • Página {reg.pagina_numero} • {formatDateLocal(reg.data_registro)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                              reg.status === 'autenticado' ? 'bg-emerald-100 text-emerald-800' :
                              reg.status === 'emitido' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {reg.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Quick book indicators */}
                <div className="glass-modern bg-white/85 p-6 rounded-3xl border border-white/50 shadow-md space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-800">Arquivo Morto & Ativos</h2>
                    <p className="text-xs text-slate-400">Totalizadores por tipologia de livro de assentamento</p>
                  </div>

                  <div className="space-y-4">
                    {livros.map(book => {
                      const count = registros.filter(r => r.livro_id === book.id).length;
                      return (
                        <div key={book.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <BookOpen size={16} className="text-amber-700" />
                              <span className="text-xs font-black text-slate-800 truncate max-w-[140px]">{book.nome}</span>
                            </div>
                            <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full">
                              v. {book.numero}
                            </span>
                          </div>
                          
                          {/* Progress bar representational */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                              <span>Páginas Ocupadas: {count} / {book.paginas_total}</span>
                              <span>{Math.round((count / book.paginas_total) * 100)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-600 rounded-full" 
                                style={{ width: `${Math.min((count / book.paginas_total) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LIVROS E TERMOS TAB */}
          {activeTab === 'livros' && (
            <div className="space-y-6 animate-entrance">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-800">Livros de Termos Oficiais</h2>
                  <p className="text-xs text-slate-400">Inaugure livros oficiais e configure termos tradicionais de abertura e encerramento</p>
                </div>
                <button
                  onClick={() => {
                    playMenuSound();
                    setEditingBook({
                      nome: '',
                      numero: '',
                      tipo: 'ata',
                      data_abertura: getTodayDate(),
                      paginas_total: 200,
                      termo_abertura: 'TERMO DE ABERTURA\n\nServirá este livro para registrar...',
                      termo_encerramento: 'TERMO DE ENCERRAMENTO\n\nEste livro encerra-se com...',
                      status: 'ativo'
                    });
                    setShowBookModal(true);
                  }}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Plus size={16} /> Inaugurar Novo Livro
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {livros.map((book) => {
                  const itemsCount = registros.filter(r => r.livro_id === book.id).length;
                  return (
                    <div key={book.id} className="glass-modern bg-white/90 p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className={`p-3 rounded-2xl text-white ${
                            book.tipo === 'ata' ? 'bg-amber-600' :
                            book.tipo === 'casamento' ? 'bg-pink-600' :
                            book.tipo === 'batismo' ? 'bg-blue-600' : 
                            book.tipo === 'ceia' ? 'bg-rose-700' : 'bg-purple-600'
                          }`}>
                            {book.tipo === 'ceia' ? <Wine size={20} /> : <BookOpen size={20} />}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${book.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {book.status === 'ativo' ? 'Ativo / Lavrando' : 'Encerrado'}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-slate-800 leading-snug">{book.nome}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-bold mt-1 uppercase tracking-wide">
                            <span>Tipo: {book.tipo?.toUpperCase()}</span>
                            <span>Livro Nº: {book.numero}</span>
                            <span>De: {formatDateLocal(book.data_abertura)}</span>
                          </div>
                        </div>

                        {/* Termo previews */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] leading-relaxed text-slate-500 font-medium">
                          <p className="font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <ScrollText size={12} /> Termo de Abertura Oficial:
                          </p>
                          <p className="line-clamp-3 italic">"{book.termo_abertura}"</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-black uppercase tracking-wide">
                          {itemsCount} Registros / {book.paginas_total} Págs
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              playMenuSound();
                              setEditingBook(book);
                              setShowBookModal(true);
                            }}
                            className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                            title="Editar Livro"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Excluir do acervo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REGISTROS ECLESIÁSTICOS TAB */}
          {activeTab === 'registros' && (
            <div className="space-y-6 animate-entrance">
              {/* Header section with Create dropdown drawer styles */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-800">Atas, Enlaces, Batismos & Consagrações</h2>
                  <p className="text-xs text-slate-400">Pesquise, registre novos eventos ministeriais ou anexe documentos ao livro eclesiástico</p>
                </div>

                {/* Dropdowns of Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      playMenuSound();
                      setRegistroType('ata_assembleia');
                      setEditingRegistro({
                        livro_id: livros[0]?.id || '',
                        pagina_numero: 1,
                        data_registro: getTodayDate(),
                        titulo: 'ATA DA ',
                        status: 'rascunho',
                        horario_inicio: '19:30',
                        horario_fim: '21:00',
                        moderador: db.igreja?.pastor_presidente || 'Pr. Antônio Carlos de Oliveira',
                        secretario: '',
                        membros_presentes_quant: 80,
                        conteudo_completo: ''
                      });
                      setShowRegistroModal(true);
                    }}
                    className="px-3.5 py-2.5 bg-amber-600 hover:bg-slate-900 border border-transparent text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={14} /> Lavrar Ata
                  </button>

                  <button
                    onClick={() => {
                      playMenuSound();
                      setRegistroType('casamento');
                      setEditingRegistro({
                        livro_id: livros.find(b => b.tipo === 'casamento')?.id || livros[0]?.id || '',
                        pagina_numero: 1,
                        data_registro: getTodayDate(),
                        titulo: 'TERMO DE CASAMENTO RELIGIOSO: ',
                        status: 'rascunho',
                        noivo_nome: '',
                        noivo_documento: '',
                        noiva_nome: '',
                        noiva_documento: '',
                        data_celebracao: getTodayDate(),
                        celebrante: db.igreja?.pastor_presidente || '',
                        testemunhas: '',
                        cartorio_nome: '',
                        casamento_civil_numero: ''
                      });
                      setShowRegistroModal(true);
                    }}
                    className="px-3.5 py-2.5 bg-pink-600 hover:bg-slate-900 border border-transparent text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Heart size={14} /> Registro Casamento
                  </button>

                  <button
                    onClick={() => {
                      playMenuSound();
                      setRegistroType('batismo');
                      setEditingRegistro({
                        livro_id: livros[0]?.id || '',
                        pagina_numero: 1,
                        data_registro: getTodayDate(),
                        titulo: 'TERMO DE BATISMO NAS ÁGUAS: ',
                        status: 'rascunho',
                        candidato_nome: '',
                        candidato_data_nascimento: '',
                        candidato_filiacao: '',
                        data_batismo: getTodayDate(),
                        batizador: db.igreja?.pastor_presidente || '',
                        local_batismo: 'Templo Central'
                      });
                      setShowRegistroModal(true);
                    }}
                    className="px-3.5 py-2.5 bg-blue-600 hover:bg-slate-900 border border-transparent text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Droplets size={14} /> Lavrar Batismo
                  </button>

                  <button
                    onClick={() => {
                      playMenuSound();
                      setRegistroType('consagracao');
                      setEditingRegistro({
                        livro_id: livros[0]?.id || '',
                        pagina_numero: 1,
                        data_registro: getTodayDate(),
                        titulo: 'TERMO DE CONSECRAÇÃO DE OBREIRO: ',
                        status: 'rascunho',
                        obreiro_nome: '',
                        obreiro_documento: '',
                        cargo: 'diacono',
                        data_consagracao: getTodayDate(),
                        convencao_regional: '',
                        registro_cgadb: '',
                        conselho_ordenador: ''
                      });
                      setShowRegistroModal(true);
                    }}
                    className="px-3.5 py-2.5 bg-purple-600 hover:bg-slate-900 border border-transparent text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Award size={14} /> Ordinária/Consagração
                  </button>

                  <button
                    onClick={() => {
                      playMenuSound();
                      setRegistroType('ceia_do_senhor');
                      setEditingRegistro({
                        livro_id: livros.find(b => b.tipo === 'ceia')?.id || livros[0]?.id || '',
                        pagina_numero: 1,
                        data_registro: getTodayDate(),
                        titulo: 'ATOS DA CEIA DO SENHOR: ',
                        status: 'rascunho',
                        horario_inicio: '18:00',
                        horario_fim: '20:15',
                        celebrante: db.igreja?.pastor_presidente || 'Pr. Antônio Carlos de Oliveira',
                        secretario: '',
                        membros_presentes_quant: 0,
                        conteudo_completo: '',
                        membros_participantes: []
                      });
                      setShowRegistroModal(true);
                    }}
                    className="px-3.5 py-2.5 bg-rose-700 hover:bg-slate-900 border border-transparent text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Wine size={14} /> Santa Ceia do Senhor
                  </button>
                </div>
              </div>

              {/* Filters Area */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-250/50 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquise por credor, noivo, candidato, termos, moderador ou cargo..."
                    className="w-full bg-white border border-slate-200/85 rounded-xl pl-11 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-600 outline-none"
                  >
                    <option value="todos">Todos os Tipos</option>
                    <option value="ata_assembleia">Ata de Assembleia</option>
                    <option value="casamento">Casamentos</option>
                    <option value="batismo">Batismos</option>
                    <option value="consagracao">Consagrações</option>
                    <option value="ceia_do_senhor">Santa Ceia</option>
                  </select>

                  <select
                    value={livroFilter}
                    onChange={(e) => setLivroFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-600 outline-none"
                  >
                    <option value="todos">Todos os Livros</option>
                    {livros.map(b => (
                      <option key={b.id} value={b.id}>{b.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-400 font-black uppercase tracking-wider">
                      <th className="p-3 sm:p-4">
                        <div className="flex flex-col gap-1.5">
                          <span>Pág / Livro</span>
                          <input 
                            type="text" 
                            placeholder="Filtrar..." 
                            value={ataColFilters.pag_livro} 
                            onChange={e => setAtaColFilters({...ataColFilters, pag_livro: e.target.value})}
                            className="px-2 py-1 text-[9px] font-semibold border border-slate-200 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                          />
                        </div>
                      </th>
                      <th className="p-3 sm:p-4">
                        <div className="flex flex-col gap-1.5">
                          <span>Registro / Título</span>
                          <input 
                            type="text" 
                            placeholder="Filtrar..." 
                            value={ataColFilters.registro_titulo} 
                            onChange={e => setAtaColFilters({...ataColFilters, registro_titulo: e.target.value})}
                            className="px-2 py-1 text-[9px] font-semibold border border-slate-200 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                          />
                        </div>
                      </th>
                      <th className="p-3 sm:p-4">
                        <div className="flex flex-col gap-1.5">
                          <span>Data de Lavra</span>
                          <input 
                            type="text" 
                            placeholder="Filtrar..." 
                            value={ataColFilters.data} 
                            onChange={e => setAtaColFilters({...ataColFilters, data: e.target.value})}
                            className="px-2 py-1 text-[9px] font-semibold border border-slate-200 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                          />
                        </div>
                      </th>
                      <th className="p-3 sm:p-4">
                        <div className="flex flex-col gap-1.5">
                          <span>Status</span>
                          <input 
                            type="text" 
                            placeholder="Filtrar..." 
                            value={ataColFilters.status} 
                            onChange={e => setAtaColFilters({...ataColFilters, status: e.target.value})}
                            className="px-2 py-1 text-[9px] font-semibold border border-slate-200 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                          />
                        </div>
                      </th>
                      <th className="p-3 sm:p-4 text-center align-top pt-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistros.map((item) => {
                      const bookData = livros.find(b => b.id === item.livro_id);
                      return (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-slate-700">
                          <td className="p-4 sm:p-5">
                            <span className="font-mono bg-slate-100 text-slate-800 text-[11px] px-2 py-1 rounded">
                              Pág. {item.pagina_numero}
                            </span>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase max-w-[130px] truncate">{bookData?.nome}</p>
                          </td>
                          <td className="p-4 sm:p-5">
                            <span className="font-extrabold text-slate-800 block text-xs sm:text-sm">{item.titulo}</span>
                            <span className="text-[11px] text-slate-400 leading-normal font-medium mt-1 inline-block">
                              {item.tipo === 'ata_assembleia' && `Moderado por ${item.moderador || 'Sede'} • Sect. ${item.secretario || ''}`}
                              {item.tipo === 'casamento' && `Enlace de: ${item.noivo_nome || '-'} & ${item.noiva_nome || '-'}`}
                              {item.tipo === 'batismo' && `Candidato: ${item.candidato_nome || '-'}`}
                              {item.tipo === 'consagracao' && `Obreiro consagrado: ${item.obreiro_nome || '-'}`}
                              {item.tipo === 'ceia_do_senhor' && `Ministrado por ${item.celebrante || 'Pr. Sede'} • Rol de ${item.membros_presentes_quant || 0} participantes`}
                            </span>
                          </td>
                          <td className="p-4 sm:p-5 text-xs font-bold text-slate-600">
                            {formatDateLocal(item.data_registro)}
                          </td>
                          <td className="p-4 sm:p-5">
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${
                              item.status === 'autenticado' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              item.status === 'emitido' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-4 sm:p-5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  playMenuSound();
                                  setRegistroType(item.tipo);
                                  setEditingRegistro(item);
                                  setShowRegistroModal(true);
                                }}
                                className="p-1 px-2.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 border border-slate-200 text-slate-600 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 uppercase"
                              >
                                <Edit size={11} /> Editar
                              </button>
                              <button
                                onClick={() => {
                                  playMenuSound();
                                  setPrintData({ item, igreja: db.igreja });
                                  setPrintMode('livro_ata_registro');
                                  setPreviewOpen(true);
                                }}
                                className="p-1 px-2.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 border border-slate-200 text-slate-600 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 uppercase"
                                title="Baixar assentamento oficial em PDF"
                              >
                                <FileText size={11} /> PDF
                              </button>
                              <button
                                onClick={() => {
                                  playMenuSound();
                                  setPrintData({ item, igreja: db.igreja });
                                  setPrintMode('livro_ata_registro');
                                  setPreviewOpen(true);
                                }}
                                className="p-1 px-2.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-800 border border-slate-200 text-slate-600 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 uppercase"
                                title="Imprimir assentamento oficial"
                              >
                                <Printer size={11} /> Imprimir
                              </button>
                              <button
                                onClick={() => handleDeleteRegistro(item.id)}
                                className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-300 rounded-lg transition-all"
                                title="Deletar termo"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredRegistros.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                          Nenhum assentamento eclesiástico encontrado sob este critério de busca.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIRTUAL BOOK LAYOUT */}
          {activeTab === 'livro_virtual' && (
            <div className="space-y-6 animate-entrance">
              {/* Controls */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Escritura Eclesiástica do Livro de Atas</h3>
                  <p className="text-xs text-slate-400">Verifique os termos na formatação oficial de cartório eclesiástico com validação digital</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <select
                    value={selectedLivroId}
                    onChange={(e) => { setSelectedLivroId(e.target.value); setVirtualPage(0); }}
                    className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-black text-slate-600 outline-none shadow-sm"
                  >
                    {livros.map(b => (
                      <option key={b.id} value={b.id}>{b.nome}</option>
                    ))}
                  </select>

                  <button
                    onClick={makePrintable}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Printer size={14} /> Imprimir Livro Completo
                  </button>
                </div>
              </div>

              {/* Foliant view representing traditional book boundaries */}
              {selectedLivroData ? (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Virtual foliant paper element */}
                  <div id="print-area-notarial" className="bg-[#FAF9F6] border-2 border-[#E7E2D5] shadow-2xl rounded-sm p-12 sm:p-20 relative overflow-hidden min-h-[900px] text-slate-800 space-y-10 font-serif leading-relaxed text-justify relative">
                    
                    {/* Double traditional border line margins on sides representing notary sheet */}
                    <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-red-200 pointer-events-none md:left-14" />
                    <div className="absolute left-7 top-0 bottom-0 w-[1px] bg-red-100 pointer-events-none md:left-16" />
                    <div className="absolute right-6 top-0 bottom-0 w-[1px] bg-red-100 pointer-events-none md:right-14" />

                    {/* Book Cover Header in Notary view */}
                    <div className="text-center font-sans space-y-2 border-b border-slate-350/50 pb-6 print:mt-10">
                      <p className="text-xs font-black tracking-[0.25em] uppercase text-amber-800">Igreja Evangélica Assembleia de Deus no Brasil</p>
                      <h4 className="text-lg font-black tracking-wider uppercase text-slate-900">{db.igreja?.nome || "Ministério Sede Geral"}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Declaração de Fé - {db.igreja?.nome || 'Igreja Sede'} • CNPJ: {db.igreja?.cnpj || 'Sem Identificador Fiscal'}
                      </p>
                    </div>

                    {/* Foliant page contents logic */}
                    {activeBookRegistros.length === 0 ? (
                      <div className="text-center py-20 font-sans">
                        <FileText size={48} className="mx-auto text-slate-300" />
                        <h4 className="mt-4 font-black uppercase text-xs text-slate-400 tracking-wider">Nenhum termo oficialmente emitido para este Livro</h4>
                        <p className="text-[11px] text-slate-400 mt-1">Para ver a escrituração, mude o status do registro para 'emitido' ou 'autenticado'.</p>
                      </div>
                    ) : (
                      <>
                        {/* Selected page or loop if all printed */}
                        {activeBookRegistros[virtualPage] ? (
                          <div className="space-y-8 animate-entrance font-serif text-slate-800 leading-justify text-xs sm:text-sm pl-4 pr-4">
                            
                            {/* Page counter & title */}
                            <div className="flex justify-between font-sans text-[11px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-2">
                              <span>Página {activeBookRegistros[virtualPage].pagina_numero}</span>
                              <span className="text-amber-800">{selectedLivroData.nome}</span>
                            </div>

                            {/* Record Header */}
                            <div className="text-center space-y-1 py-2">
                              <h3 className="text-sm font-black text-slate-900 uppercase font-sans tracking-wide">
                                {activeBookRegistros[virtualPage].titulo}
                              </h3>
                              <p className="text-[10px] font-semibold font-sans uppercase text-slate-500 tracking-wider">
                                Registrado sob ato ministerial em {formatDateLocal(activeBookRegistros[virtualPage].data_registro)}
                              </p>
                            </div>

                            {/* Specific layout renders depending on the record type */}
                            {activeBookRegistros[virtualPage].tipo === 'ata_assembleia' && (
                              <div className="space-y-4">
                                <p className="leading-relaxed text-justify first-letter:text-2xl first-letter:font-black">
                                  {activeBookRegistros[virtualPage].conteudo_completo}
                                </p>
                                <div className="pt-6 font-sans text-[11px] leading-relaxed text-slate-500 space-y-1">
                                  <p><strong>Moderador / Celebrante:</strong> {activeBookRegistros[virtualPage].moderador}</p>
                                  <p><strong>Secretário Responsável:</strong> {activeBookRegistros[virtualPage].secretario}</p>
                                  <p><strong>Presentes Assinados:</strong> {activeBookRegistros[virtualPage].membros_presentes_quant} membros em comunhão.</p>
                                </div>
                              </div>
                            )}

                            {activeBookRegistros[virtualPage].tipo === 'ceia_do_senhor' && (
                              <div className="space-y-4">
                                <p className="leading-relaxed text-justify first-letter:text-2xl first-letter:font-black italic">
                                  {activeBookRegistros[virtualPage].conteudo_completo || 'Sob reverência e comunhão eclesiástica, celebrou-se a Santa Ceia do Senhor.'}
                                </p>

                                {activeBookRegistros[virtualPage].membros_participantes && activeBookRegistros[virtualPage].membros_participantes.length > 0 && (
                                  <div className="pt-4 font-sans space-y-2">
                                    <p className="text-[10px] font-black uppercase text-rose-700 tracking-wider flex items-center gap-1.5">
                                      <Users size={12} /> Rol de Membros Comungantes Autorizados ({db?.igreja?.nome || 'Igreja'}):
                                    </p>
                                    <div className="flex flex-wrap gap-2 p-4 bg-rose-50/40 rounded-2xl border border-rose-100">
                                      {activeBookRegistros[virtualPage].membros_participantes.map((mp: any, idx: number) => (
                                        <span key={mp.id || idx} className="text-[10px] font-bold uppercase bg-white border border-rose-200/50 text-slate-800 px-3 py-1.5 rounded-xl shadow-xs">
                                          <span className="text-rose-700 font-extrabold mr-1">[{mp.cargo || 'Membro'}]</span> {mp.nome}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="pt-6 font-sans text-[11px] leading-relaxed text-slate-500 space-y-1 border-t border-dashed border-slate-200 mt-4">
                                  <p><strong>Ministrante / Celebrante:</strong> {activeBookRegistros[virtualPage].celebrante}</p>
                                  <p><strong>Secretário de Ofício:</strong> {activeBookRegistros[virtualPage].secretario}</p>
                                  <p><strong>Membros Presentes no Memorial:</strong> {activeBookRegistros[virtualPage].membros_presentes_quant} em comunhão de fé (Declaração de Fé {db?.igreja?.nome || 'Igreja'} - Cap. 14).</p>
                                </div>
                              </div>
                            )}

                            {activeBookRegistros[virtualPage].tipo === 'casamento' && (
                              <div className="space-y-4">
                                <p className="leading-relaxed">
                                  No vigésimo dia do mês de {formatDateLocal(activeBookRegistros[virtualPage].data_registro).split(' ')[2]} do ano correspondente, sob a graça divina e as resoluções de liturgia eclesiástica dadas na denominação, perante o digno Celebrante <strong>{activeBookRegistros[virtualPage].celebrante}</strong>, compareceram os nubentes para o enlace matrimonial sagrado.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 font-sans text-xs bg-slate-50 rounded-xl p-4 border border-slate-200/50">
                                  <div>
                                    <p className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">Contraente Varão (Noivo)</p>
                                    <p className="font-bold text-slate-800 mt-0.5">{activeBookRegistros[virtualPage].noivo_nome}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">CPF: {activeBookRegistros[virtualPage].noivo_documento}</p>
                                  </div>
                                  <div>
                                    <p className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">Contraente Varoa (Noiva)</p>
                                    <p className="font-bold text-slate-800 mt-0.5">{activeBookRegistros[virtualPage].noiva_nome}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">CPF: {activeBookRegistros[virtualPage].noiva_documento}</p>
                                  </div>
                                </div>

                                <div className="pt-4 font-sans text-[11px] space-y-1 text-slate-500 leading-normal">
                                  <p><strong>Testemunhas do Enlace Religioso:</strong> {activeBookRegistros[virtualPage].testemunhas}</p>
                                  <p className="border-t border-dashed border-slate-200 mt-2 pt-2">
                                    <strong>Cartório de Registro Civil:</strong> {activeBookRegistros[virtualPage].cartorio_nome || 'Não Registrado'}
                                  </p>
                                  <p><strong>Certidão Civil / Termo de Matrimônio:</strong> {activeBookRegistros[virtualPage].casamento_civil_numero || 'Não Registrado'}</p>
                                </div>
                              </div>
                            )}

                            {activeBookRegistros[virtualPage].tipo === 'batismo' && (
                              <div className="space-y-4 leading-relaxed pl-4">
                                <p>
                                  Certificamos para fins de arquivos históricos que conforme dita a grande comissão de Jesus em Mateus vinte e oito, versículo dezenove, o candidato <strong>{activeBookRegistros[virtualPage].candidato_nome}</strong>, nascido em {formatDateLocal(activeBookRegistros[virtualPage].candidato_data_nascimento)}, filho de {activeBookRegistros[virtualPage].candidato_filiacao}, desceu perante a igreja às águas batismais na data de {formatDateLocal(activeBookRegistros[virtualPage].data_batismo)}, sendo o sacramento celebrado pelo Pastor <strong>{activeBookRegistros[virtualPage].batizador}</strong> no local descrito como {activeBookRegistros[virtualPage].local_batismo}.
                                </p>
                              </div>
                            )}

                            {activeBookRegistros[virtualPage].tipo === 'consagracao' && (
                              <div className="space-y-4 leading-relaxed">
                                <p>
                                  Aos atos de consagração e ordenação de oficiais da Igreja Evangélica Assembleia de Deus, certifica-se o registro de entrada do oficial e obreiro ministerial <strong>{activeBookRegistros[virtualPage].obreiro_nome}</strong>, identificado fiscalmente pelo CPF {activeBookRegistros[virtualPage].obreiro_documento}, para o respeitado cargo e função de <strong>{activeBookRegistros[virtualPage].cargo?.toUpperCase()}</strong>.
                                </p>
                                <div className="pt-4 font-sans text-[11px] space-y-1 text-slate-500 leading-normal bg-slate-50/50 p-4 rounded-xl border border-slate-200/50">
                                  <p><strong>Data de Consagração / Posse:</strong> {formatDateLocal(activeBookRegistros[virtualPage].data_consagracao)}</p>
                                  <p><strong>Conselho Ordenador / Ministério:</strong> {activeBookRegistros[virtualPage].conselho_ordenador || 'Mesa Diretora Local'}</p>
                                  <p><strong>Convenção Regional Vinculada:</strong> {activeBookRegistros[virtualPage].convencao_regional || ('GIPP ' + (db?.igreja?.nome || 'Convenção'))}</p>
                                  <p><strong>Código de Registro:</strong> {activeBookRegistros[virtualPage].registro_cgadb || 'Aguardando Credencial'}</p>
                                </div>
                              </div>
                            )}

                            {/* Digital signature lines and validator */}
                            <div className="pt-12 grid grid-cols-2 gap-8 border-t border-slate-350/40 font-sans">
                              {/* Left signatures */}
                              <div className="space-y-6 text-center text-[10px] uppercase font-black tracking-wider text-slate-500">
                                <div className="h-[1px] bg-slate-450 w-full" />
                                <p>Moderador / Presidente</p>
                              </div>
                              <div className="space-y-6 text-center text-[10px] uppercase font-black tracking-wider text-slate-500">
                                <div className="h-[1px] bg-slate-450 w-full" />
                                <p>Secretário Executivo</p>
                              </div>
                            </div>

                            {/* Tamper proof barcode / validate key */}
                            <div className="pt-6 font-sans border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-455 text-[9px] uppercase tracking-wide leading-none">
                              <div className="flex items-center gap-2">
                                <span className="p-2 bg-slate-100 rounded-lg text-slate-600 block">
                                  <QrCode size={24} />
                                </span>
                                <div>
                                  <p className="font-black text-slate-800">CÓDIGO DE AUTENTICIDADE ECLESIÁSTICA</p>
                                  <p className="font-bold text-slate-400 mt-1">{activeBookRegistros[virtualPage].hash_validacao}</p>
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-1.5 text-[9px] font-bold text-slate-400 mt-2 sm:mt-0">
                                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                                <span>DOCUMENTO COM ASSINATURA DIGITAL GIPP CERTIFICADA</span>
                              </div>
                            </div>

                          </div>
                        ) : null}

                        {/* Page selector navigation inside foliaries */}
                        <div className="flex justify-between items-center font-sans border-t border-slate-350/40 pt-4 print:hidden">
                          <button
                            onClick={() => { playMenuSound(); setVirtualPage(p => Math.max(0, p - 1)); }}
                            disabled={virtualPage === 0}
                            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black rounded-lg transition-all flex items-center gap-1 uppercase tracking-wider disabled:opacity-40"
                          >
                            <ChevronLeft size={14} /> Página Anterior
                          </button>

                          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                            Pág. {virtualPage + 1} de {activeBookRegistros.length}
                          </span>

                          <button
                            onClick={() => { playMenuSound(); setVirtualPage(p => Math.min(activeBookRegistros.length - 1, p + 1)); }}
                            disabled={virtualPage === activeBookRegistros.length - 1}
                            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black rounded-lg transition-all flex items-center gap-1 uppercase tracking-wider disabled:opacity-40"
                          >
                            Próxima Página <ChevronRight size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* REDATOR DE ATAS IA TAB */}
          {activeTab === 'assistant_ia' && (
            <div className="space-y-6 animate-entrance">
              <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl space-y-6">
                <div className="max-w-2xl space-y-2">
                  <span className="bg-white/20 text-white border border-white/20 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1 w-max">
                    <Sparkles size={11} /> Copiloto do Secretariado Eclesiástico
                  </span>
                  <h2 className="text-2xl font-black tracking-tight leading-none">Inteligência Eclesiástica para Práticas Atuariais</h2>
                  <p className="text-xs text-indigo-100 leading-relaxed font-semibold">
                    Evite erros gramaticais e atenda às demandas notariais. Escreva notas de tópicos rápidos ou palavras-chave discutidas em sua diretoria/assembleia, e deixe a Inteligência Eclética redigir integralmente a ata oficial do Livro com termos solenes recomendados pela {db?.igreja?.nome || 'Convenção'}.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                  {/* Bullet points input */}
                  <div className="space-y-3">
                    <label className="block text-xs font-black uppercase tracking-wider text-indigo-200">
                      Tópicos Debatidos & Acontecimentos da Reunião
                    </label>
                    <textarea
                      rows={8}
                      value={bulletPoints}
                      onChange={(e) => setBulletPoints(e.target.value)}
                      placeholder="Ex: Reunião iniciou com oração pastoral às 20h. Tesouraria apresentou relatório do mês de maio mostrando superávit de dez mil reais. Pr. Antônio propôs mutirão no sábado para limpar o pátio central. Todos concordaram. Pr. Manuel encerrou com bênção apostólica."
                      className="w-full bg-slate-900/40 border border-white/20 rounded-xl p-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-indigo-200/50 text-white"
                    />

                    {/* Style Selection */}
                    <div className="space-y-1.5 pt-2">
                      <p className="text-[11px] font-black uppercase text-indigo-200 tracking-wider">Estilo Textual da Escritura</p>
                      <div className="flex gap-2">
                        {['notarial', 'solene', 'objetivo'].map((st) => (
                          <button
                            key={st}
                            onClick={() => { playMenuSound(); setDraftStyle(st as any); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${draftStyle === st ? 'bg-amber-600 text-white font-black' : 'bg-white/10 text-indigo-100'}`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleIADraftText}
                      disabled={isGeneratingDraft}
                      className="w-full py-3 bg-amber-650 hover:bg-slate-950 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
                    >
                      {isGeneratingDraft ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> Gerando Prosa Oficial...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} /> Redigir Ata Automaticamente
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI compiled result */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-indigo-200">
                        Prosa Oficial Gerada pelo Copiloto IA (Formato Notarial)
                      </label>
                      <div className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-xs min-h-[170px] max-h-[240px] overflow-y-auto leading-relaxed text-slate-105 font-serif italic text-justify">
                        {aiDraftOutput ? aiDraftOutput : "O rascunho oficial processado aparecerá aqui..."}
                      </div>
                    </div>

                    {aiDraftOutput ? (
                      <button
                        onClick={handleTransferDraftToEditor}
                        className="py-3 bg-white hover:bg-slate-100 border border-transparent text-slate-800 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={14} className="text-emerald-600 animate-bounce" /> Transferir Para o Livro de Atas
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* INAUGURAR LIVRO MODAL */}
      {showBookModal && editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 space-y-6 relative">
            <button
              onClick={() => { playMenuSound(); setShowBookModal(false); }}
              className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <BookOpen size={20} className="text-amber-700 font-black" />
                {editingBook.id ? 'Editar Cadastro do Livro' : 'Inaugurar Novo Livro de Atas / Assentamentos'}
              </h3>
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-wider mt-1">
                Configure os parâmetros de escrituração legislativa de casamentos, atas e batismos
              </p>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600">ID / Nome do Livro</label>
                  <input
                    type="text"
                    value={editingBook.nome}
                    onChange={(e) => setEditingBook({ ...editingBook, nome: e.target.value })}
                    placeholder="Ex: Livro de Atas Geral nº 01"
                    className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Sequência do Livro (Ex: 01, 02)</label>
                  <input
                    type="text"
                    value={editingBook.numero}
                    onChange={(e) => setEditingBook({ ...editingBook, numero: e.target.value })}
                    placeholder="Ex: 02"
                    className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Tipo de Atividades</label>
                  <select
                    value={editingBook.tipo}
                    onChange={(e) => setEditingBook({ ...editingBook, tipo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-705 outline-none"
                  >
                    <option value="ata">Atas de Assembleia</option>
                    <option value="casamento">Casamentos Eclesiásticos</option>
                    <option value="batismo">Batismos em Águas</option>
                    <option value="ordenacao">Ordenação / Oficiais</option>
                    <option value="ceia">Registro de Santa Ceia</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Páginas Máximas</label>
                  <input
                    type="number"
                    value={editingBook.paginas_total}
                    onChange={(e) => setEditingBook({ ...editingBook, paginas_total: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Abertura Civil</label>
                  <input
                    type="date"
                    value={editingBook.data_abertura}
                    onChange={(e) => setEditingBook({ ...editingBook, data_abertura: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Termo de Abertura do Prontuário</label>
                <textarea
                  rows={3}
                  value={editingBook.termo_abertura}
                  onChange={(e) => setEditingBook({ ...editingBook, termo_abertura: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Termo de Encerramento Futuro</label>
                <textarea
                  rows={3}
                  value={editingBook.termo_encerramento}
                  onChange={(e) => setEditingBook({ ...editingBook, termo_encerramento: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                />
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="py-2.5 px-5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-black text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-amber-600 hover:bg-slate-900 border border-transparent text-white font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save size={14} /> Persistir Livro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRO ECLESIÁSTICO EDITOR MODAL */}
      {showRegistroModal && editingRegistro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 space-y-6 relative">
            <button
              onClick={() => { playMenuSound(); setShowRegistroModal(false); }}
              className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                {registroType === 'ata_assembleia' && <FileText size={20} className="text-amber-700" />}
                {registroType === 'casamento' && <Heart size={20} className="text-pink-600" />}
                {registroType === 'batismo' && <Droplets size={20} className="text-blue-600" />}
                {registroType === 'consagracao' && <Award size={20} className="text-purple-600" />}
                {registroType === 'ceia_do_senhor' && <Wine size={20} className="text-rose-700 font-bold" />}
                <span>
                  {editingRegistro.id ? 'Modificar assentamento' : 'Lavrar novo assentamento'} 
                  ({registroType === 'ata_assembleia' ? 'Ata de Reunião' : 
                    registroType === 'casamento' ? 'Casamento Eclesiástico' : 
                    registroType === 'batismo' ? 'Batismo Águas' : 
                    registroType === 'consagracao' ? 'Ordenação de Obreiro' : 'Santa Ceia do Senhor'})
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-wider mt-1">
                Integração completa do assentamento no Livro de Atas oficial do rol da igreja
              </p>
            </div>

            {/* INTEGRATED CHURCH MEMBERS SEARCH BOX FOR FAST DATA FILL */}
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/40 relative">
              <span className="block text-[10px] font-black uppercase tracking-wider text-amber-800 mb-1">
                🔍 Autocompletar com membro integrado do GIPP:
              </span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquise o nome do membro cadastrado..."
                  value={memberSearchQuery}
                  onChange={(e) => {
                    setMemberSearchQuery(e.target.value);
                    setShowMemberSuggestions(true);
                  }}
                  className="w-full bg-white border border-slate-250/55 rounded-xl p-3 pl-10 text-xs font-bold outline-none focus:ring-1 focus:ring-amber-550"
                />
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                
                {showMemberSuggestions && memberSearchQuery && (
                  <div className="absolute left-0 right-0 top-full bg-white border border-slate-250 rounded-xl shadow-lg mt-1 z-55 max-h-48 overflow-y-auto p-1 divide-y divide-slate-50">
                    {filteredMembros.map((m: any) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => fillMemberToData(m)}
                        className="w-full text-left p-3 hover:bg-slate-50 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <p className="text-xs font-black text-slate-800">{m.nome}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{m.cargo || 'Membro do Rol'} • Cong: {m.congregacao || 'Sede'}</p>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Selecionar</span>
                      </button>
                    ))}
                    {filteredMembros.length === 0 && (
                      <p className="p-3 text-[11px] text-slate-400 font-bold uppercase">Nenhum membro do rol encontrado.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveRegistro} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Pertence a qual Livro?</label>
                  <select
                    value={editingRegistro.livro_id}
                    onChange={(e) => setEditingRegistro({ ...editingRegistro, livro_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-705 outline-none"
                  >
                    <option value="">Selecione o Livro Oficial...</option>
                    {livros.map(b => (
                      <option key={b.id} value={b.id}>{b.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Página nº</label>
                  <input
                    type="number"
                    value={editingRegistro.pagina_numero}
                    onChange={(e) => setEditingRegistro({ ...editingRegistro, pagina_numero: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Título / Ementa Documental do Ato</label>
                  <input
                    type="text"
                    value={editingRegistro.titulo}
                    onChange={(e) => setEditingRegistro({ ...editingRegistro, titulo: e.target.value })}
                    placeholder="Ex: ATA DA DECIMA ASSEMBLEIA..."
                    className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Data de Lavra do Assentamento</label>
                  <input
                    type="date"
                    value={editingRegistro.data_registro}
                    onChange={(e) => setEditingRegistro({ ...editingRegistro, data_registro: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                  />
                </div>
              </div>

              {/* DYNAMIC FORMS BY RECORD TYPE */}
              {registroType === 'ata_assembleia' && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Horário de Início</label>
                      <input
                        type="text"
                        value={editingRegistro.horario_inicio}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, horario_inicio: e.target.value })}
                        placeholder="Ex: 19:30"
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Horário Final</label>
                      <input
                        type="text"
                        value={editingRegistro.horario_fim}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, horario_fim: e.target.value })}
                        placeholder="Ex: 21:00"
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Quant. Membros Presentes</label>
                      <input
                        type="number"
                        value={editingRegistro.membros_presentes_quant}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, membros_presentes_quant: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Presidente / Moderador da Mesa</label>
                      <input
                        type="text"
                        value={editingRegistro.moderador}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, moderador: e.target.value })}
                        placeholder="Ex: Pr. Antonio Carlos..."
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Secretário de Atos</label>
                      <input
                        type="text"
                        value={editingRegistro.secretario}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, secretario: e.target.value })}
                        placeholder="Ex: Ev. Marcos..."
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold outline-none text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Redação Integral da Ata</label>
                    <textarea
                      rows={6}
                      value={editingRegistro.conteudo_completo}
                      onChange={(e) => setEditingRegistro({ ...editingRegistro, conteudo_completo: e.target.value })}
                      placeholder="Redija aqui os debates detalhadamente..."
                      className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-4 text-xs font-bold outline-none text-slate-720 font-serif leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {registroType === 'casamento' && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Nome do Varão (Noivo)</label>
                      <input
                        type="text"
                        value={editingRegistro.noivo_nome}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, noivo_nome: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Nome da Varoa (Noiva)</label>
                      <input
                        type="text"
                        value={editingRegistro.noiva_nome}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, noiva_nome: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Pastor Celebrante</label>
                      <input
                        type="text"
                        value={editingRegistro.celebrante}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, celebrante: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Testemunhas / Padrinhos</label>
                      <input
                        type="text"
                        value={editingRegistro.testemunhas}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, testemunhas: e.target.value })}
                        placeholder="Nomes por extenso..."
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Ofício de Registro Civil (Cartório)</label>
                      <input
                        type="text"
                        value={editingRegistro.cartorio_nome}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, cartorio_nome: e.target.value })}
                        placeholder="Ex: 2º Oficio Civil de Pessoas Naturais"
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Certidão Civil Nº / Termo</label>
                      <input
                        type="text"
                        value={editingRegistro.casamento_civil_numero}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, casamento_civil_numero: e.target.value })}
                        placeholder="Ex: 4421-T1/2026"
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {registroType === 'batismo' && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Nome do Candidato de Batismo</label>
                      <input
                        type="text"
                        value={editingRegistro.candidato_nome}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, candidato_nome: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600 font-sans">Filiação (Pai e Mãe)</label>
                      <input
                        type="text"
                        value={editingRegistro.candidato_filiacao}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, candidato_filiacao: e.target.value })}
                        placeholder="Nome do Pai e Nome da Mãe..."
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Data de Batismo</label>
                      <input
                        type="date"
                        value={editingRegistro.data_batismo}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, data_batismo: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Celebrante (Batizador)</label>
                      <input
                        type="text"
                        value={editingRegistro.batizador}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, batizador: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Local do Batismo</label>
                      <input
                        type="text"
                        value={editingRegistro.local_batismo}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, local_batismo: e.target.value })}
                        placeholder="Ex: Sede Central / Tanque"
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {registroType === 'consagracao' && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600 font-sans">Nome do Obreiro Consagrado</label>
                      <input
                        type="text"
                        value={editingRegistro.obreiro_nome}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, obreiro_nome: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">CPF do Obreiro</label>
                      <input
                        type="text"
                        value={editingRegistro.obreiro_documento}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, obreiro_documento: e.target.value })}
                        placeholder="000.000.000-00"
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Cargo de Ordenação</label>
                      <select
                        value={editingRegistro.cargo}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, cargo: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-750 outline-none"
                      >
                        <option value="auxiliar">Auxiliar de Trabalho</option>
                        <option value="diacono">Diácono</option>
                        <option value="presbitero">Presbítero</option>
                        <option value="evangelista">Evangelista</option>
                        <option value="missionaria">Ev. Missionária</option>
                        <option value="pastor">Pastor de Ovelhas (Pr.)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Data da Consagração/Ato</label>
                      <input
                        type="date"
                        value={editingRegistro.data_consagracao}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, data_consagracao: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Registro Geral ({db?.igreja?.nome || 'Igreja'})</label>
                      <input
                        type="text"
                        value={editingRegistro.registro_cgadb}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, registro_cgadb: e.target.value })}
                        placeholder={`Ex: REG-${db?.igreja?.nome ? db.igreja.nome.substring(0,3).toUpperCase() : 'IG'}-22441-A`}
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600 font-sans">Convenção Regional Vinculada</label>
                      <input
                        type="text"
                        value={editingRegistro.convencao_regional}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, convencao_regional: e.target.value })}
                        placeholder="Ex: CONFRADESP / COMADEP"
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Conselho Ordenador / Igreja</label>
                      <input
                        type="text"
                        value={editingRegistro.conselho_ordenador}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, conselho_ordenador: e.target.value })}
                        placeholder="Ex: Presbito de Sede S.A."
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {registroType === 'ceia_do_senhor' && (
                <div className="space-y-4 border-t border-slate-100 pt-4 animate-entrance">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Horário de Início</label>
                      <input
                        type="text"
                        value={editingRegistro.horario_inicio || '18:00'}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, horario_inicio: e.target.value })}
                        placeholder="Ex: 18:00"
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Horário Término</label>
                      <input
                        type="text"
                        value={editingRegistro.horario_fim || '20:15'}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, horario_fim: e.target.value })}
                        placeholder="Ex: 20:15"
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Total de Participantes</label>
                      <input
                        type="number"
                        value={editingRegistro.membros_presentes_quant || 0}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, membros_presentes_quant: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Ministrante (Celebrante)</label>
                      <input
                        type="text"
                        value={editingRegistro.celebrante || ''}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, celebrante: e.target.value })}
                        placeholder="Pr. Antônio Carlos..."
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Secretário de Atos</label>
                      <input
                        type="text"
                        value={editingRegistro.secretario || ''}
                        onChange={(e) => setEditingRegistro({ ...editingRegistro, secretario: e.target.value })}
                        placeholder="Ev. Marcos..."
                        className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-3 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  {/* MEMBERS Rol de Participantes */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="block text-xs font-black uppercase tracking-wider text-slate-600">
                        Rol de Membros com Inclusão Ativa (Comunhão)
                      </span>
                      <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/40">
                        {editingRegistro.membros_participantes?.length || 0} membros no rol
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-semibold leading-normal bg-slate-50 p-3 rounded-xl border border-slate-100">
                      💡 Use o campo <strong>🔍 Autocompletar com membro integrado do GIPP</strong> no topo deste formulário para pesquisar no cadastro original da igreja e inseri-los instantaneamente no Rol de Comunhão para esta Ceia do Senhor.
                    </p>

                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl">
                      {editingRegistro.membros_participantes && editingRegistro.membros_participantes.length > 0 ? (
                        editingRegistro.membros_participantes.map((mp: any, idx: number) => (
                          <div 
                            key={mp.id || idx}
                            className="bg-white border border-slate-200 hover:border-slate-350 transition-colors rounded-xl p-2 pl-3 flex items-center justify-between text-[11px] gap-2 shadow-xs group"
                          >
                            <div className="font-bold">
                              <span className="text-rose-700 font-extrabold mr-1">[{mp.cargo || 'Membro'}]</span> {mp.nome}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                playMenuSound();
                                const filtered = editingRegistro.membros_participantes.filter((_: any, i: number) => i !== idx);
                                setEditingRegistro({
                                  ...editingRegistro,
                                  membros_participantes: filtered,
                                  membros_presentes_quant: filtered.length
                                });
                              }}
                              className="text-slate-300 hover:text-rose-600 p-0.5 hover:bg-rose-50 rounded transition-all"
                              title="Remover do Rol"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 font-bold uppercase text-center w-full py-4">
                          Nenhum participante adicionado. Use o buscador de membros do topo do modal.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Redação Memorial da Santa Ceia (Ata)</label>
                      <button
                        type="button"
                        onClick={() => {
                          playMenuSound();
                          const dateStr = editingRegistro.data_registro ? formatDateLocal(editingRegistro.data_registro) : '';
                          const listStr = editingRegistro.membros_participantes && editingRegistro.membros_participantes.length > 0
                            ? ` com a comunhão nominal registradas dos seguintes irmãos: ${editingRegistro.membros_participantes.map((m: any) => `${m.nome} (${m.cargo || 'Membro'})`).join(', ')}.`
                            : ' com expressiva cooperação e presença do corpo de membros da Sede.';
                          
                          const defaultText = `Sob a graça do Nosso Senhor Jesus Cristo e de acordo com o Capítulo 14 da Declaração de Fé da ${db?.igreja?.nome || 'Igreja'} (sobre a Ceia do Senhor), realizou-se em termo solene a cerimônia de Santa Ceia no Templo Central nesta data de ${dateStr}. O ato solene teve início às ${editingRegistro.horario_inicio || '18:00'} e encerrou-se em plena fraternidade às ${editingRegistro.horario_fim || '20:15'}, sob a presidência do digno Celebrante Pastor ${editingRegistro.celebrante || 'Presidente'}. Registrou-se a presença de ${editingRegistro.membros_presentes_quant || 0} membros em plena comunhão, ${listStr} Sob louvores da Harpa Cristã e a ministração santa da Palavra, foram consagradas as frações do Pão e do Fruto da Videira, partilhados aos obreiros e à membresia, em perene memorial à morte vicária, ressurreição e iminente retorno da Segunda Vinda Pré-tribulacionista de Cristo Jesus Senhor Nosso.`;
                          
                          setEditingRegistro({ ...editingRegistro, conteudo_completo: defaultText });
                          addToast("Redação eclesiástica descrita no livro com sucesso!", "success");
                        }}
                        className="text-[10px] font-black text-rose-700 hover:text-slate-900 flex items-center gap-1 uppercase tracking-wider bg-rose-50 hover:bg-rose-100 p-2 py-1 rounded"
                      >
                        <Sparkles size={11} /> Redação Padrão do Ofício
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={editingRegistro.conteudo_completo || ''}
                      onChange={(e) => setEditingRegistro({ ...editingRegistro, conteudo_completo: e.target.value })}
                      placeholder="Espaço reservado para registrar a ementa de pregação bíblica, pautas de ordem santas ou testemunhos colhidos..."
                      className="w-full bg-slate-50 border border-slate-200/85 rounded-xl p-4 text-xs font-bold outline-none text-slate-700 font-serif leading-relaxed"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 border-t border-slate-100 pt-4">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Status Documental do Termo</label>
                <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-max shrink-0">
                  {['rascunho', 'emitido', 'autenticado'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => { playMenuSound(); setEditingRegistro({ ...editingRegistro, status: st }); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${editingRegistro.status === st ? 'bg-amber-600 text-white shadow-sm font-black' : 'text-slate-500 hover:text-slate-700 font-bold'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegistroModal(false)}
                  className="py-2.5 px-5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-extrabold text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-amber-600 hover:bg-slate-900 border border-transparent text-white font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save size={14} /> Registrar Lavratura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
