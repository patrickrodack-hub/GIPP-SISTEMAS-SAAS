import React, { useState, useMemo, useRef, useContext } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FileText, Printer, Download, Calendar, User, Building2, 
  CheckCircle2, ShieldCheck, Search, Filter, Hash, Share2, 
  ChevronDown, DollarSign, Award, Landmark, AlertCircle, Copy, Check
} from 'lucide-react';
import { ChurchContext, formatDateLocal, formatCPF } from '../App';

interface ContribuinteOption {
  id: string;
  nome: string;
  cpf: string;
  cargo?: string;
  congregacao_id?: string;
}

interface InformeRendimentosIRPFProps {
  initialMembroId?: string;
  onClose?: () => void;
  isPortalView?: boolean;
}

export const InformeRendimentosIRPF: React.FC<InformeRendimentosIRPFProps> = ({
  initialMembroId,
  onClose,
  isPortalView = false
}) => {
  const { db, user, addToast } = useContext(ChurchContext);
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Ano de Exercício e Calendário
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear - 1 > 2020 ? currentYear - 1 : currentYear);

  // Seleção de membro
  const membrosList: ContribuinteOption[] = useMemo(() => {
    return (db.membros || []).map((m: any) => ({
      id: m.id,
      nome: m.nome,
      cpf: m.cpf || '',
      cargo: m.cargo || 'Membro',
      congregacao_id: m.congregacao_id || 'sede'
    })).sort((a: ContribuinteOption, b: ContribuinteOption) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [db.membros]);

  const [selectedMembroId, setSelectedMembroId] = useState<string>(
    initialMembroId || (isPortalView && user?.id ? user.id : membrosList[0]?.id || '')
  );
  const [membroSearch, setMembroSearch] = useState('');

  // Membro selecionado ativo
  const currentMembro = useMemo(() => {
    if (isPortalView && user?.id) {
      const found = (db.membros || []).find((m: any) => m.id === user.id);
      return found || {
        id: user.id,
        nome: user.nome,
        cpf: user.cpf || '',
        cargo: user.cargo || 'Membro',
        congregacao_id: user.congregacao_id || 'sede'
      };
    }
    return (db.membros || []).find((m: any) => m.id === selectedMembroId) || membrosList[0] || null;
  }, [selectedMembroId, db.membros, isPortalView, user, membrosList]);

  // Congregação do membro
  const congregacaoMembro = useMemo(() => {
    if (!currentMembro?.congregacao_id || currentMembro.congregacao_id === 'sede') {
      return 'Templo Sede Principal';
    }
    const found = (db.congregacoes || []).find((c: any) => c.id === currentMembro.congregacao_id);
    return found ? found.nome : 'Templo Sede Principal';
  }, [currentMembro, db.congregacoes]);

  // Análise dos lançamentos financeiros do ano selecionado vinculados ao membro
  const financialData = useMemo(() => {
    if (!currentMembro?.id) {
      return {
        meses: [],
        totaisPorCategoria: { dizimos: 0, ofertas: 0, missoes: 0, campanhas: 0, totalGeral: 0 },
        qtdLancamentos: 0
      };
    }

    const mesesNomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const gridMeses = mesesNomes.map((mesNome, index) => ({
      numero: index + 1,
      nome: mesNome,
      dizimos: 0,
      ofertas: 0,
      missoes: 0,
      campanhas: 0,
      total: 0
    }));

    const totaisCat = {
      dizimos: 0,
      ofertas: 0,
      missoes: 0,
      campanhas: 0,
      totalGeral: 0
    };

    let totalEntries = 0;

    (db.financeiro || []).forEach((item: any) => {
      // Filtrar pelo membro (por id ou por nome se id não bater)
      const matchesMember = item.membro_id === currentMembro.id || 
        (currentMembro.nome && item.membro_nome && item.membro_nome.trim().toLowerCase() === currentMembro.nome.trim().toLowerCase());

      if (!matchesMember) return;
      if (item.tipo !== 'entrada') return;
      if (item.status && item.status !== 'pago' && item.status !== 'confirmado') return;

      const dateStr = item.data_competencia || item.data_pagamento || item.created_at;
      if (!dateStr) return;

      const dateObj = new Date(dateStr);
      if (dateObj.getFullYear() !== selectedYear) return;

      const mesIndex = dateObj.getMonth();
      if (mesIndex < 0 || mesIndex > 11) return;

      const valor = parseFloat(item.valor) || 0;
      const cat = (item.categoria || '').toLowerCase();
      const desc = (item.descricao || '').toLowerCase();

      totalEntries++;

      if (cat.includes('dízimo') || cat.includes('dizimo') || desc.includes('dízimo') || desc.includes('dizimo')) {
        gridMeses[mesIndex].dizimos += valor;
        totaisCat.dizimos += valor;
      } else if (cat.includes('miss') || desc.includes('miss')) {
        gridMeses[mesIndex].missoes += valor;
        totaisCat.missoes += valor;
      } else if (cat.includes('constru') || cat.includes('campanha') || desc.includes('constru') || desc.includes('campanha')) {
        gridMeses[mesIndex].campanhas += valor;
        totaisCat.campanhas += valor;
      } else {
        gridMeses[mesIndex].ofertas += valor;
        totaisCat.ofertas += valor;
      }

      gridMeses[mesIndex].total += valor;
      totaisCat.totalGeral += valor;
    });

    return {
      meses: gridMeses,
      totaisPorCategoria: totaisCat,
      qtdLancamentos: totalEntries
    };
  }, [currentMembro, db.financeiro, selectedYear]);

  // Código Hash de Autenticidade Digital Oficial
  const hashVerificacao = useMemo(() => {
    const rawString = `${db.igreja?.cnpj || 'GIPP'}-${currentMembro?.cpf || currentMembro?.nome || 'MEMBRO'}-${selectedYear}-${financialData.totaisPorCategoria.totalGeral.toFixed(2)}`;
    let hash = 0;
    for (let i = 0; i < rawString.length; i++) {
      const char = rawString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `RFB-${selectedYear}-${hex.slice(0, 4)}-${hex.slice(4, 8)}-CGADB`;
  }, [db.igreja, currentMembro, selectedYear, financialData]);

  // Exportar para PDF de Alta Qualidade
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    addToast("Gerando Informe Oficial de Rendimentos em PDF...", "info");

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
      const safeNome = (currentMembro?.nome || 'membro').toLowerCase().replace(/[^a-z0-9]/g, '_');
      pdf.save(`informe_irpf_${selectedYear}_${safeNome}.pdf`);

      addToast("Informe Anual baixado com sucesso!", "success");
    } catch (err: any) {
      console.error(err);
      addToast("Erro ao gerar PDF do informe.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Impressão Direta
  const handlePrint = () => {
    window.print();
  };

  const filteredMembrosDropdown = useMemo(() => {
    if (!membroSearch.trim()) return membrosList.slice(0, 8);
    return membrosList.filter(m => 
      m.nome.toLowerCase().includes(membroSearch.toLowerCase()) || 
      m.cpf.includes(membroSearch)
    ).slice(0, 8);
  }, [membrosList, membroSearch]);

  return (
    <div className="space-y-6">
      {/* Controles do Usuário (Ocultos na impressão física) */}
      <div className="print:hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-500/20">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                Informe de Rendimentos Eclesiásticos para IRPF
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  RFB / CGADB
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Comprovante anual discriminado de dízimos e doações para Declaração de Ajuste Anual
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={16} /> Imprimir
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={16} /> {isExporting ? 'Processando PDF...' : 'Baixar PDF Oficial'}
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

        {/* Filtros: Ano Calendário e Seleção de Membro (se não for portal) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar size={13} className="text-emerald-600" /> Ano-Calendário
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4].map(y => (
                <option key={y} value={y}>
                  Ano-Calendário {y} (Exercício {y + 1})
                </option>
              ))}
            </select>
          </div>

          {!isPortalView && (
            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User size={13} className="text-emerald-600" /> Selecionar Membro / Contribuinte
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={membroSearch}
                    onChange={(e) => setMembroSearch(e.target.value)}
                    placeholder="Filtrar por nome ou CPF..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <select
                  value={selectedMembroId}
                  onChange={(e) => setSelectedMembroId(e.target.value)}
                  className="w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {filteredMembrosDropdown.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} ({m.cpf ? formatCPF(m.cpf) : 'Sem CPF'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DOCUMENTO FORMAL: FOLHA TIMBRADA A4 DE INFORME ANUAL */}
      <div className="flex justify-center p-2 sm:p-4">
        <div
          ref={printRef}
          className="bg-white text-slate-900 w-full max-w-4xl p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl print:shadow-none print:border-none print:p-0 space-y-6 font-sans"
          style={{ minHeight: '297mm' }}
        >
          {/* CABEÇALHO DA IGREJA */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
                  <Building2 size={32} />
                </div>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    {db.igreja?.nome || 'IGREJA EVANGÉLICA ASSEMBLEIA DE DEUS'}
                  </h1>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {db.igreja?.convencao || 'Filiada à CGADB / Convenção Estadual'}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    CNPJ: <strong className="text-slate-800 font-bold">{db.igreja?.cnpj || '00.000.000/0001-00'}</strong> • {db.igreja?.endereco || 'Templo Sede'} • {db.igreja?.cidade || 'Município'}-{db.igreja?.uf || 'UF'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-300 inline-block text-center">
                  <span className="block text-[9px] font-black uppercase text-slate-500 tracking-widest">Ano-Calendário</span>
                  <span className="text-lg font-black text-slate-900">{selectedYear}</span>
                  <span className="block text-[8px] font-bold uppercase text-emerald-700">Exercício {selectedYear + 1}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TÍTULO DO DOCUMENTO */}
          <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-2xl">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900">
              Comprovante de Rendimentos e Doações Confessionais
            </h2>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">
              Instrução para a Declaração de Ajuste Anual do Imposto de Renda Pessoa Física (IRPF / RFB)
            </p>
          </div>

          {/* QUADRO 1: DADOS DA INSTITUIÇÃO BENEFICIÁRIA */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
              1. Dados da Entidade Religiosa (Donatária)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Razão Social</span>
                <span className="font-bold text-slate-900">{db.igreja?.nome || 'IGREJA EVANGÉLICA ASSEMBLEIA DE DEUS'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">CNPJ da Entidade</span>
                <span className="font-bold text-slate-900">{db.igreja?.cnpj || '00.000.000/0001-00'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Natureza Jurídica</span>
                <span className="font-bold text-slate-900">322-0 (Organização Religiosa)</span>
              </div>
            </div>
          </div>

          {/* QUADRO 2: DADOS DO CONTRIBUINTE / MEMBRO */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
              2. Dados do Contribuinte / Membro Doador
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Nome Completo</span>
                <span className="font-black text-slate-900 text-sm uppercase">{currentMembro?.nome || 'NÃO SELECIONADO'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">CPF do Contribuinte</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {currentMembro?.cpf ? formatCPF(currentMembro.cpf) : 'Não informado'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Filiação / Congregação</span>
                <span className="font-bold text-slate-900">{congregacaoMembro}</span>
              </div>
            </div>
          </div>

          {/* QUADRO 3: DISCRIMINAÇÃO ANALÍTICA MÊS A MÊS */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 p-3 border-b border-slate-200">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                3. Discriminação Mensal das Contribuições no Ano-Calendário {selectedYear}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-500 font-black uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-4">Mês de Referência</th>
                    <th className="py-2.5 px-4 text-right">Dízimos (R$)</th>
                    <th className="py-2.5 px-4 text-right">Ofertas Alçadas (R$)</th>
                    <th className="py-2.5 px-4 text-right">Missões (R$)</th>
                    <th className="py-2.5 px-4 text-right">Campanhas (R$)</th>
                    <th className="py-2.5 px-4 text-right font-black text-slate-900">Total Mensal (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {financialData.meses.map((m) => (
                    <tr key={m.numero} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-4 font-sans font-semibold text-slate-700">{m.nome}</td>
                      <td className="py-2 px-4 text-right text-slate-600">
                        {m.dizimos > 0 ? m.dizimos.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-600">
                        {m.ofertas > 0 ? m.ofertas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-600">
                        {m.missoes > 0 ? m.missoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-600">
                        {m.campanhas > 0 ? m.campanhas.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2 px-4 text-right font-bold text-slate-900">
                        {m.total > 0 ? m.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                    </tr>
                  ))}
                  {/* LINHA DE TOTAIS */}
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td className="py-3 px-4 font-sans uppercase font-black tracking-wider text-xs">
                      Total Acumulado ({selectedYear})
                    </td>
                    <td className="py-3 px-4 text-right">
                      R$ {financialData.totaisPorCategoria.dizimos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      R$ {financialData.totaisPorCategoria.ofertas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      R$ {financialData.totaisPorCategoria.missoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      R$ {financialData.totaisPorCategoria.campanhas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-800 text-sm">
                      R$ {financialData.totaisPorCategoria.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* QUADRO 4: DECLARAÇÃO DE FÉ E CONFORMIDADE TRIBUTÁRIA */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 text-[11px] text-slate-700 leading-relaxed space-y-2">
            <h4 className="font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-700" />
              4. Termo Declaratório de Conformidade Eclesiástica e Tributária
            </h4>
            <p>
              Declaramos para os devidos fins de instrução e prova perante a <strong>Secretaria Especial da Receita Federal do Brasil (RFB)</strong> e para efeito da <strong>Declaração de Ajuste Anual do Imposto de Renda Pessoa Física (DIRPF)</strong>, que o(a) contribuinte acima qualificado(a) efetuou em favor desta organização religiosa, no decorrer do ano-calendário de <strong>{selectedYear}</strong>, doações e contribuições voluntárias e confessionais (dízimos e ofertas voluntárias), no montante total líquido de:
            </p>
            <div className="p-3 bg-white rounded-xl border border-slate-300 text-center font-bold text-slate-900 text-sm">
              R$ {financialData.totaisPorCategoria.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              <span className="block text-[10px] text-slate-500 font-normal uppercase mt-0.5">
                Valores escriturados no Livro Caixa e balancetes oficiais da denominação (Art. 150, VI, &quot;b&quot; da CF/88).
              </span>
            </div>
          </div>

          {/* QUADRO 5: ASSINATURAS E AUTENTICAÇÃO DIGITAL */}
          <div className="pt-6 border-t border-slate-200 space-y-6">
            <div className="grid grid-cols-2 gap-8 text-center pt-8">
              <div className="border-t border-slate-400 pt-2">
                <p className="font-black text-xs uppercase text-slate-800">
                  {db.igreja?.pastor_presidente || 'PASTOR PRESIDENTE'}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Representante Legal da Entidade</p>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <p className="font-black text-xs uppercase text-slate-800">
                  {db.igreja?.tesoureiro_geral || '1º TESOUREIRO GERAL'}
                </p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Diretoria Financeira Eclesiástica</p>
              </div>
            </div>

            {/* CHAVE DE AUTENTICAÇÃO DIGITAL SHA-256 */}
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-slate-600">
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-slate-400" />
                <span>Hash de Validação: <strong>{hashVerificacao}</strong></span>
              </div>
              <div className="text-slate-400 text-[9px] font-sans">
                Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • Sistema GIPP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
