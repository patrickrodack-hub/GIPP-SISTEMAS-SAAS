import React, { useState, useMemo, useRef, useContext } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Award, Shield, FileText, Printer, Download, User, Calendar, 
  Building2, CheckCircle2, ChevronRight, Plus, Trash2, Edit3, 
  Landmark, BookOpen, Clock, HeartHandshake, Check, AlertCircle, 
  Search, ExternalLink, X, Save
} from 'lucide-react';
import { ChurchContext, formatDateLocal, formatCPF } from '../App';

interface OrdenacaoItem {
  id: string;
  cargo: string;
  data: string;
  ministro_ordenante: string;
  convencao: string;
  igreja_local: string;
  livro_ata: string;
  folha_ata: string;
  numero_ata: string;
  status: 'homologado' | 'em_analise' | 'reconhecido';
}

interface CargoExercidoItem {
  id: string;
  funcao: string;
  congregacao: string;
  data_inicio: string;
  data_fim: string;
  atual: boolean;
  portaria_nomeacao?: string;
}

interface FormacaoItem {
  id: string;
  curso: string;
  instituicao: string;
  ano_conclusao: string;
  grau: string;
}

interface ProntuarioMinisterialProps {
  initialMembroId?: string;
  onClose?: () => void;
}

export const ProntuarioMinisterial: React.FC<ProntuarioMinisterialProps> = ({
  initialMembroId,
  onClose
}) => {
  const { db, user, dbFirestore, appId, setDoc, doc, addToast, logAction } = useContext(ChurchContext);
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Lista de membros para seleção
  const membrosList = useMemo(() => {
    return (db.membros || []).sort((a: any, b: any) => 
      (a.nome || '').localeCompare(b.nome || '', 'pt-BR')
    );
  }, [db.membros]);

  const [selectedMembroId, setSelectedMembroId] = useState<string>(
    initialMembroId || (membrosList[0]?.id || '')
  );
  const [searchMembro, setSearchMembro] = useState('');

  // Membro ativo selecionado
  const currentMembro = useMemo(() => {
    return (db.membros || []).find((m: any) => m.id === selectedMembroId) || membrosList[0] || null;
  }, [selectedMembroId, db.membros, membrosList]);

  // Estados locais para edição dos campos ministeriais
  const [dadosMinisteriais, setDadosMinisteriais] = useState({
    convencao_filiada: '',
    registro_convencao: '',
    validade_credencial: '',
    pastor_ordenante: '',
    data_batismo_aguas: '',
    local_batismo_aguas: '',
    data_batismo_espirito_santo: '',
    local_batismo_espirito_santo: '',
    status_canônico: 'Regular / Plena Comunhão',
    observacoes_eticas: ''
  });

  const [ordenacoes, setOrdenacoes] = useState<OrdenacaoItem[]>([]);
  const [cargosExercidos, setCargosExercidos] = useState<CargoExercidoItem[]>([]);
  const [formacoes, setFormacoes] = useState<FormacaoItem[]>([]);

  // Modais de inclusão rápida
  const [modalNovaOrdenacao, setModalNovaOrdenacao] = useState(false);
  const [novaOrdenacao, setNovaOrdenacao] = useState<Partial<OrdenacaoItem>>({
    cargo: 'Diácono',
    data: new Date().toISOString().split('T')[0],
    ministro_ordenante: '',
    convencao: 'CGADB / Convenção Estadual',
    igreja_local: db.igreja?.nome || 'Templo Sede',
    livro_ata: '01',
    folha_ata: '12',
    numero_ata: '',
    status: 'homologado'
  });

  const [modalNovoCargo, setModalNovoCargo] = useState(false);
  const [novoCargo, setNovoCargo] = useState<Partial<CargoExercidoItem>>({
    funcao: 'Dirigente de Congregação',
    congregacao: 'Templo Sede',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    atual: true,
    portaria_nomeacao: ''
  });

  const [modalNovaFormacao, setModalNovaFormacao] = useState(false);
  const [novaFormacao, setNovaFormacao] = useState<Partial<FormacaoItem>>({
    curso: 'Curso Básico em Teologia',
    instituicao: 'EETAD / CPAD',
    ano_conclusao: new Date().getFullYear().toString(),
    grau: 'Básico'
  });

  // Atualizar estados quando o membro selecionado mudar
  React.useEffect(() => {
    if (currentMembro) {
      setDadosMinisteriais({
        convencao_filiada: currentMembro.convencao_filiada || db.igreja?.convencao || 'CGADB / Convenção Estadual',
        registro_convencao: currentMembro.registro_convencao || currentMembro.numero_registro || '',
        validade_credencial: currentMembro.validade_credencial || '',
        pastor_ordenante: currentMembro.pastor_ordenante || '',
        data_batismo_aguas: currentMembro.data_batismo || '',
        local_batismo_aguas: currentMembro.local_batismo || db.igreja?.cidade || '',
        data_batismo_espirito_santo: currentMembro.data_batismo_espirito_santo || '',
        local_batismo_espirito_santo: currentMembro.local_batismo_espirito_santo || '',
        status_canônico: currentMembro.status_canonico || 'Regular / Plena Comunhão',
        observacoes_eticas: currentMembro.observacoes_eticas || ''
      });

      // Se o membro tiver ordenações salvas, usar; senão, sintetizar do histórico básico se existir
      if (Array.isArray(currentMembro.ordenacoes_ministeriais) && currentMembro.ordenacoes_ministeriais.length > 0) {
        setOrdenacoes(currentMembro.ordenacoes_ministeriais);
      } else if (Array.isArray(currentMembro.historico_eclesiastico) && currentMembro.historico_eclesiastico.length > 0) {
        const mapped: OrdenacaoItem[] = currentMembro.historico_eclesiastico.map((h: any, idx: number) => ({
          id: h.id || `ord_${idx}`,
          cargo: h.cargo_alvo || h.tipo || 'Consagração',
          data: h.data || '',
          ministro_ordenante: h.responsavel || '',
          convencao: 'CGADB',
          igreja_local: db.igreja?.nome || 'Templo Sede',
          livro_ata: '01',
          folha_ata: '01',
          numero_ata: h.ata || '',
          status: 'homologado'
        }));
        setOrdenacoes(mapped);
      } else {
        // Inicialização padrão com o cargo atual do membro
        const dataBase = currentMembro.data_admissao || currentMembro.data_batismo || '2020-01-01';
        setOrdenacoes([
          {
            id: 'ord_1',
            cargo: currentMembro.cargo || 'Membro em Comunhão',
            data: dataBase,
            ministro_ordenante: db.igreja?.pastor_presidente || 'Pastor Local',
            convencao: 'CGADB / Convenção Estadual',
            igreja_local: db.igreja?.nome || 'Templo Sede',
            livro_ata: '01',
            folha_ata: '01',
            numero_ata: '001',
            status: 'homologado'
          }
        ]);
      }

      if (Array.isArray(currentMembro.cargos_exercidos)) {
        setCargosExercidos(currentMembro.cargos_exercidos);
      } else {
        setCargosExercidos([]);
      }

      if (Array.isArray(currentMembro.formacoes_teologicas)) {
        setFormacoes(currentMembro.formacoes_teologicas);
      } else {
        setFormacoes([]);
      }
    }
  }, [currentMembro, db.igreja]);

  // Salvar no Firebase Firestore
  const handleSaveProntuario = async () => {
    if (!currentMembro?.id) return;
    setIsSaving(true);
    addToast("Salvando prontuário ministerial...", "info");

    try {
      const payload = {
        convencao_filiada: dadosMinisteriais.convencao_filiada,
        registro_convencao: dadosMinisteriais.registro_convencao,
        validade_credencial: dadosMinisteriais.validade_credencial,
        pastor_ordenante: dadosMinisteriais.pastor_ordenante,
        data_batismo: dadosMinisteriais.data_batismo_aguas,
        data_batismo_espirito_santo: dadosMinisteriais.data_batismo_espirito_santo,
        status_canonico: dadosMinisteriais.status_canônico,
        observacoes_eticas: dadosMinisteriais.observacoes_eticas,
        ordenacoes_ministeriais: ordenacoes,
        cargos_exercidos: cargosExercidos,
        formacoes_teologicas: formacoes
      };

      await setDoc(
        doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'membros', currentMembro.id),
        payload,
        { merge: true }
      );

      logAction('PRONTUARIO_UPDATE', `Atualizou prontuário ministerial de ${currentMembro.nome}`, 'membros', currentMembro.id);
      addToast("Prontuário Ministerial atualizado com sucesso no banco de dados!", "success");
    } catch (err: any) {
      console.error(err);
      addToast("Erro ao salvar prontuário ministerial.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Adicionar Ordenação
  const handleAddOrdenacao = () => {
    if (!novaOrdenacao.cargo || !novaOrdenacao.data) {
      addToast("Preencha cargo e data da ordenação.", "warning");
      return;
    }
    const item: OrdenacaoItem = {
      id: `ord_${Date.now()}`,
      cargo: novaOrdenacao.cargo || 'Diácono',
      data: novaOrdenacao.data || '',
      ministro_ordenante: novaOrdenacao.ministro_ordenante || '',
      convencao: novaOrdenacao.convencao || 'CGADB',
      igreja_local: novaOrdenacao.igreja_local || '',
      livro_ata: novaOrdenacao.livro_ata || '01',
      folha_ata: novaOrdenacao.folha_ata || '01',
      numero_ata: novaOrdenacao.numero_ata || '',
      status: (novaOrdenacao.status as any) || 'homologado'
    };
    setOrdenacoes(prev => [...prev, item].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()));
    setModalNovaOrdenacao(false);
    setNovaOrdenacao({
      cargo: 'Presbítero',
      data: new Date().toISOString().split('T')[0],
      ministro_ordenante: '',
      convencao: 'CGADB / Convenção Estadual',
      igreja_local: db.igreja?.nome || 'Templo Sede',
      livro_ata: '01',
      folha_ata: '01',
      numero_ata: '',
      status: 'homologado'
    });
    addToast("Ordenação adicionada à linha do tempo!", "success");
  };

  // Adicionar Cargo Exercido
  const handleAddCargo = () => {
    if (!novoCargo.funcao || !novoCargo.data_inicio) {
      addToast("Preencha a função e a data de início.", "warning");
      return;
    }
    const item: CargoExercidoItem = {
      id: `cgo_${Date.now()}`,
      funcao: novoCargo.funcao || 'Dirigente de Congregação',
      congregacao: novoCargo.congregacao || 'Templo Sede',
      data_inicio: novoCargo.data_inicio || '',
      data_fim: novoCargo.atual ? '' : (novoCargo.data_fim || ''),
      atual: Boolean(novoCargo.atual),
      portaria_nomeacao: novoCargo.portaria_nomeacao || ''
    };
    setCargosExercidos(prev => [...prev, item]);
    setModalNovoCargo(false);
    addToast("Cargo exercido registrado no histórico!", "success");
  };

  // Adicionar Formação Teológica
  const handleAddFormacao = () => {
    if (!novaFormacao.curso) {
      addToast("Informe o nome do curso teológico.", "warning");
      return;
    }
    const item: FormacaoItem = {
      id: `form_${Date.now()}`,
      curso: novaFormacao.curso || '',
      instituicao: novaFormacao.instituicao || 'EETAD / CPAD',
      ano_conclusao: novaFormacao.ano_conclusao || '',
      grau: novaFormacao.grau || 'Básico'
    };
    setFormacoes(prev => [...prev, item]);
    setModalNovaFormacao(false);
    addToast("Qualificação teológica registrada!", "success");
  };

  // Exportar Certidão em PDF
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    addToast("Compilando Prontuário Ministerial Oficial em PDF...", "info");

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const safeNome = (currentMembro?.nome || 'ministro').toLowerCase().replace(/[^a-z0-9]/g, '_');
      pdf.save(`prontuario_ministerial_${safeNome}.pdf`);

      addToast("Prontuário Ministerial exportado com sucesso!", "success");
    } catch (err: any) {
      console.error(err);
      addToast("Erro ao exportar PDF.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredMembros = useMemo(() => {
    if (!searchMembro.trim()) return membrosList.slice(0, 10);
    return membrosList.filter((m: any) => 
      (m.nome || '').toLowerCase().includes(searchMembro.toLowerCase()) || 
      (m.cpf || '').includes(searchMembro)
    ).slice(0, 10);
  }, [membrosList, searchMembro]);

  return (
    <div className="space-y-6">
      {/* PAINEL DE CONTROLE ADMINISTRATIVO (Não sai na impressão física) */}
      <div className="print:hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-md shadow-amber-500/20">
              <Award size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                Prontuário Histórico Ministerial
                <span className="bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Carreira Eclesiástica CGADB
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Registro canônico de ordenações, filiação convencional, atas de consagração e cargos pastorais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={16} /> Imprimir
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={16} /> {isExporting ? 'Gerando PDF...' : 'Certidão em PDF'}
            </button>
            <button
              onClick={handleSaveProntuario}
              disabled={isSaving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Voltar
              </button>
            )}
          </div>
        </div>

        {/* SELETOR DO MEMBRO/OBREIRO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User size={13} className="text-amber-600" /> Selecionar Obreiro / Ministro
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchMembro}
                  onChange={(e) => setSearchMembro(e.target.value)}
                  placeholder="Buscar ministro por nome ou CPF..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <select
                value={selectedMembroId}
                onChange={(e) => setSelectedMembroId(e.target.value)}
                className="w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                {filteredMembros.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} — {m.cargo || 'Membro'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Landmark size={13} className="text-amber-600" /> Filiação Convencional
            </label>
            <input
              type="text"
              value={dadosMinisteriais.convencao_filiada}
              onChange={(e) => setDadosMinisteriais({ ...dadosMinisteriais, convencao_filiada: e.target.value })}
              placeholder="Ex: CGADB / COMADESPE / CONFRADESTO"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* CAMPOS RÁPIDOS DE CADASTRO CANÔNICO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Nº Registro / Credencial CGADB</label>
            <input
              type="text"
              value={dadosMinisteriais.registro_convencao}
              onChange={(e) => setDadosMinisteriais({ ...dadosMinisteriais, registro_convencao: e.target.value })}
              placeholder="Ex: CGADB-45892"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Validade da Credencial</label>
            <input
              type="date"
              value={dadosMinisteriais.validade_credencial}
              onChange={(e) => setDadosMinisteriais({ ...dadosMinisteriais, validade_credencial: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Batismo em Águas (Data)</label>
            <input
              type="date"
              value={dadosMinisteriais.data_batismo_aguas}
              onChange={(e) => setDadosMinisteriais({ ...dadosMinisteriais, data_batismo_aguas: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Batismo no Espírito Santo</label>
            <input
              type="date"
              value={dadosMinisteriais.data_batismo_espirito_santo}
              onChange={(e) => setDadosMinisteriais({ ...dadosMinisteriais, data_batismo_espirito_santo: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold"
            />
          </div>
        </div>

        {/* BOTÕES PARA ADICIONAR ITENS À CARREIRA */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => setModalNovaOrdenacao(true)}
            className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-amber-900 dark:text-amber-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} /> + Adicionar Ordenação / Consagração
          </button>
          <button
            onClick={() => setModalNovoCargo(true)}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 text-indigo-900 dark:text-indigo-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} /> + Registrar Cargo Exercido
          </button>
          <button
            onClick={() => setModalNovaFormacao(true)}
            className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} /> + Adicionar Formação Teológica
          </button>
        </div>
      </div>

      {/* DOCUMENTO FORMAL: CERTIDÃO CANÔNICA E PRONTUÁRIO TIMBRADO A4 */}
      <div className="flex justify-center p-2 sm:p-4">
        <div
          ref={printRef}
          className="bg-white text-slate-900 w-full max-w-4xl p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl print:shadow-none print:border-none print:p-0 space-y-6 font-sans"
          style={{ minHeight: '297mm' }}
        >
          {/* CABEÇALHO OFICIAL */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black shadow-inner shrink-0">
                  <Award size={36} />
                </div>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    {db.igreja?.nome || 'IGREJA EVANGÉLICA ASSEMBLEIA DE DEUS'}
                  </h1>
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Conselho Geral de Ministros e Doutrina • {dadosMinisteriais.convencao_filiada || 'CGADB'}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    CNPJ: <strong className="text-slate-800">{db.igreja?.cnpj || '00.000.000/0001-00'}</strong> • {db.igreja?.cidade || 'Município'}-{db.igreja?.uf || 'UF'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-300 inline-block text-center">
                  <span className="block text-[9px] font-black uppercase text-amber-700 tracking-widest">Matrícula Ministerial</span>
                  <span className="text-sm font-mono font-black text-slate-900">{dadosMinisteriais.registro_convencao || 'REG-PENDENTE'}</span>
                  <span className="block text-[8px] font-bold uppercase text-slate-500">CGADB / CPAD</span>
                </div>
              </div>
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-2xl">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900">
              Prontuário Histórico Ministerial & Carreira Eclesiástica
            </h2>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">
              Certidão Canônica de Consagração, Ordenação e Desempenho Pastoral
            </p>
          </div>

          {/* QUADRO 1: QUALIFICAÇÃO DO MINISTRO */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>1. Qualificação Canônica do Obreiro</span>
              <span className="text-emerald-700 font-bold text-[10px] uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {dadosMinisteriais.status_canônico}
              </span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Foto se houver */}
              <div className="w-24 h-28 rounded-2xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {currentMembro?.foto ? (
                  <img src={currentMembro.foto} alt={currentMembro.nome} className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-slate-300" />
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Nome do Ministro</span>
                  <span className="font-black text-slate-900 text-sm uppercase">{currentMembro?.nome || 'NOME DO MINISTRO'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">CPF</span>
                  <span className="font-mono font-bold text-slate-900">
                    {currentMembro?.cpf ? formatCPF(currentMembro.cpf) : 'Não cadastrado'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Cargo Atual</span>
                  <span className="font-black text-amber-800 uppercase text-xs">
                    {currentMembro?.cargo || 'Ministro'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Convenção Vinculada</span>
                  <span className="font-bold text-slate-900">{dadosMinisteriais.convencao_filiada}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Validade da Credencial</span>
                  <span className="font-bold text-slate-900">
                    {dadosMinisteriais.validade_credencial ? formatDateLocal(dadosMinisteriais.validade_credencial) : 'Indeterminada'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Batismo em Águas</span>
                  <span className="font-bold text-slate-900">
                    {dadosMinisteriais.data_batismo_aguas ? formatDateLocal(dadosMinisteriais.data_batismo_aguas) : 'Registrado'}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Batismo no Espírito Santo (Evidência das Línguas)</span>
                  <span className="font-bold text-slate-900">
                    {dadosMinisteriais.data_batismo_espirito_santo ? formatDateLocal(dadosMinisteriais.data_batismo_espirito_santo) : 'Confirmado na Fé Pentecostal (Cap. 19)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QUADRO 2: LINHA DO TEMPO DE ORDENAÇÕES E CONSAGRAÇÕES */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Award size={14} className="text-amber-700" />
                2. Histórico Canônico de Consagrações e Ordenações (Linha de Sucessão Eclesiástica)
              </h3>
              <span className="text-[9px] font-bold text-slate-500 uppercase">{ordenacoes.length} registros</span>
            </div>

            <div className="p-4 space-y-4">
              {ordenacoes.length === 0 ? (
                <p className="text-center py-4 text-xs text-slate-400 italic">Nenhum registro de ordenação cadastrado.</p>
              ) : (
                <div className="relative pl-6 border-l-2 border-amber-400 space-y-4">
                  {ordenacoes.map((ord, idx) => (
                    <div key={ord.id || idx} className="relative group">
                      {/* Marcador na Linha do Tempo */}
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-amber-600 shadow-sm flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                      </div>

                      <div className="bg-slate-50/80 hover:bg-slate-50 p-3 rounded-xl border border-slate-200 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm uppercase">{ord.cargo}</span>
                            <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded uppercase">
                              {ord.status}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-600">
                            Data: <strong>{formatDateLocal(ord.data)}</strong>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 mt-2">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase block font-bold">Ministro Ordenante</span>
                            <span className="font-bold text-slate-800">{ord.ministro_ordenante || 'Mesa Diretora'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase block font-bold">Convenção / Igreja</span>
                            <span className="font-bold text-slate-800">{ord.convencao} • {ord.igreja_local}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase block font-bold">Assentamento / Registro</span>
                            <span className="font-mono text-slate-800">Livro {ord.livro_ata}, Fls. {ord.folha_ata}, Ata {ord.numero_ata || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Botão de Excluir Registro (apenas na interface) */}
                        <div className="print:hidden flex justify-end mt-2">
                          <button
                            onClick={() => setOrdenacoes(prev => prev.filter(o => o.id !== ord.id))}
                            className="text-rose-500 hover:text-rose-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={12} /> Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* QUADRO 3: CARGOS E FUNÇÕES EXERCIDAS NO MINISTÉRIO */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Building2 size={14} className="text-indigo-700" />
                3. Histórico de Designações e Cargos Eclesiásticos Exercidos
              </h3>
              <span className="text-[9px] font-bold text-slate-500 uppercase">{cargosExercidos.length} funções</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-500 font-black uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-4">Função / Cargo</th>
                    <th className="py-2.5 px-4">Congregação / Setor</th>
                    <th className="py-2.5 px-4">Período</th>
                    <th className="py-2.5 px-4">Portaria / Ato</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="print:hidden py-2.5 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cargosExercidos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                        Nenhuma função pastoral anterior arquivada.
                      </td>
                    </tr>
                  ) : (
                    cargosExercidos.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="py-2 px-4 font-bold text-slate-800">{c.funcao}</td>
                        <td className="py-2 px-4 text-slate-600">{c.congregacao}</td>
                        <td className="py-2 px-4 font-mono text-slate-600">
                          {formatDateLocal(c.data_inicio)} até {c.atual ? 'Atualidade' : formatDateLocal(c.data_fim)}
                        </td>
                        <td className="py-2 px-4 font-mono text-slate-500">{c.portaria_nomeacao || '-'}</td>
                        <td className="py-2 px-4 text-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${c.atual ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {c.atual ? 'Em Exercício' : 'Concluído'}
                          </span>
                        </td>
                        <td className="print:hidden py-2 px-4 text-right">
                          <button
                            onClick={() => setCargosExercidos(prev => prev.filter(x => x.id !== c.id))}
                            className="text-rose-500 hover:text-rose-700 font-bold text-[10px] cursor-pointer"
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

          {/* QUADRO 4: FORMAÇÃO TEOLÓGICA & QUALIFICAÇÕES */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-emerald-700" />
                4. Preparação e Formação Teológica Oficial
              </span>
              <span className="text-[9px] text-slate-500 uppercase font-bold">{formacoes.length} cursos</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {formacoes.length === 0 ? (
                <p className="text-slate-400 italic col-span-2 text-center py-2">Nenhuma formação cadastrada.</p>
              ) : (
                formacoes.map((f) => (
                  <div key={f.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-800">{f.curso}</p>
                      <p className="text-[10px] text-slate-500">{f.instituicao} • Conclusão: {f.ano_conclusao} ({f.grau})</p>
                    </div>
                    <button
                      onClick={() => setFormacoes(prev => prev.filter(x => x.id !== f.id))}
                      className="print:hidden text-rose-400 hover:text-rose-600 ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* QUADRO 5: TERMO CANÔNICO DE FÉ E ASSINATURAS */}
          <div className="pt-6 border-t border-slate-200 space-y-6">
            <p className="text-[10px] text-slate-600 leading-relaxed text-justify">
              Certificamos, em conformidade com as <strong>Sagradas Escrituras</strong> e com os <strong>24 capítulos da Declaração de Fé das Assembleias de Deus no Brasil (CGADB / CPAD)</strong>, que o ministro acima nominado se encontra devidamente examinado perante o Conselho de Ética e Ministério, professando a sã doutrina pentecostal clássica, batismo por imersão, batismo com o Espírito Santo e santa conduta moral e familiar irrepreensível (1Tm 3:1-7; Tt 1:5-9).
            </p>

            <div className="grid grid-cols-2 gap-8 text-center pt-8">
              <div className="border-t border-slate-400 pt-2">
                <p className="font-black text-xs uppercase text-slate-800">
                  {db.igreja?.pastor_presidente || 'PASTOR PRESIDENTE'}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Presidente do Ministério / Convenção</p>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <p className="font-black text-xs uppercase text-slate-800">
                  SECRETÁRIO DO CONSELHO MINISTERIAL
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Comissão de Exame e Ordenação Eclesiástica</p>
              </div>
            </div>

            <div className="text-center text-[9px] font-mono text-slate-400 pt-2">
              Prontuário gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')} • Sistema Integrado GIPP • Autenticação CGADB
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: NOVA ORDENAÇÃO */}
      {modalNovaOrdenacao && (
        <div className="fixed inset-0 bg-slate-900/60 z-[12000] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl animate-entrance">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-800 dark:text-white text-base flex items-center gap-2">
                <Award size={18} className="text-amber-600" /> Nova Ordenação / Consagração
              </h3>
              <button onClick={() => setModalNovaOrdenacao(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Cargo Ordenado</label>
                  <select
                    value={novaOrdenacao.cargo}
                    onChange={e => setNovaOrdenacao({ ...novaOrdenacao, cargo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                  >
                    <option value="Auxiliar de Trabalho">Auxiliar de Trabalho / Cooperador</option>
                    <option value="Diácono">Diácono</option>
                    <option value="Presbítero">Presbítero</option>
                    <option value="Evangelista">Evangelista</option>
                    <option value="Missionário">Missionário</option>
                    <option value="Pastor">Pastor</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Data da Ordenação</label>
                  <input
                    type="date"
                    value={novaOrdenacao.data}
                    onChange={e => setNovaOrdenacao({ ...novaOrdenacao, data: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Pastor Ordenante / Ministro que impôs as mãos</label>
                <input
                  type="text"
                  value={novaOrdenacao.ministro_ordenante}
                  onChange={e => setNovaOrdenacao({ ...novaOrdenacao, ministro_ordenante: e.target.value })}
                  placeholder="Ex: Pr. Geraldo de Souza (CGADB 12450)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Livro</label>
                  <input
                    type="text"
                    value={novaOrdenacao.livro_ata}
                    onChange={e => setNovaOrdenacao({ ...novaOrdenacao, livro_ata: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Folha</label>
                  <input
                    type="text"
                    value={novaOrdenacao.folha_ata}
                    onChange={e => setNovaOrdenacao({ ...novaOrdenacao, folha_ata: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Nº Ata</label>
                  <input
                    type="text"
                    value={novaOrdenacao.numero_ata}
                    onChange={e => setNovaOrdenacao({ ...novaOrdenacao, numero_ata: e.target.value })}
                    placeholder="Ex: 142/2024"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setModalNovaOrdenacao(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddOrdenacao}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
              >
                Salvar Ordenação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO CARGO EXERCIDO */}
      {modalNovoCargo && (
        <div className="fixed inset-0 bg-slate-900/60 z-[12000] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl animate-entrance">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-800 dark:text-white text-base flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" /> Registrar Função / Cargo Pastoral
              </h3>
              <button onClick={() => setModalNovoCargo(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Função Pastoral</label>
                <input
                  type="text"
                  value={novoCargo.funcao}
                  onChange={e => setNovoCargo({ ...novoCargo, funcao: e.target.value })}
                  placeholder="Ex: Dirigente de Congregação, Superintendente EBD..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Local / Congregação</label>
                <input
                  type="text"
                  value={novoCargo.congregacao}
                  onChange={e => setNovoCargo({ ...novoCargo, congregacao: e.target.value })}
                  placeholder="Ex: Congregação Betel, Templo Sede..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Data Início</label>
                  <input
                    type="date"
                    value={novoCargo.data_inicio}
                    onChange={e => setNovoCargo({ ...novoCargo, data_inicio: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Data Fim</label>
                  <input
                    type="date"
                    disabled={novoCargo.atual}
                    value={novoCargo.data_fim}
                    onChange={e => setNovoCargo({ ...novoCargo, data_fim: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk_atual"
                  checked={novoCargo.atual}
                  onChange={e => setNovoCargo({ ...novoCargo, atual: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="chk_atual" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Atualmente exercendo esta função
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setModalNovoCargo(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCargo}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
              >
                Salvar Cargo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA FORMAÇÃO TEOLÓGICA */}
      {modalNovaFormacao && (
        <div className="fixed inset-0 bg-slate-900/60 z-[12000] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl animate-entrance">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-800 dark:text-white text-base flex items-center gap-2">
                <BookOpen size={18} className="text-emerald-600" /> Qualificação Teológica
              </h3>
              <button onClick={() => setModalNovaFormacao(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Nome do Curso</label>
                <input
                  type="text"
                  value={novaFormacao.curso}
                  onChange={e => setNovaFormacao({ ...novaFormacao, curso: e.target.value })}
                  placeholder="Ex: Curso Médio em Teologia, Bacharel em Teologia..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Instituição</label>
                  <input
                    type="text"
                    value={novaFormacao.instituicao}
                    onChange={e => setNovaFormacao({ ...novaFormacao, instituicao: e.target.value })}
                    placeholder="Ex: EETAD, FAETEL, CPAD..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Ano de Conclusão</label>
                  <input
                    type="text"
                    value={novaFormacao.ano_conclusao}
                    onChange={e => setNovaFormacao({ ...novaFormacao, ano_conclusao: e.target.value })}
                    placeholder="Ex: 2023"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setModalNovaFormacao(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddFormacao}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
              >
                Salvar Formação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
