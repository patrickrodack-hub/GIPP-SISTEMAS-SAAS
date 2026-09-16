import React, { useState, useMemo, useContext, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Building2, DollarSign, ArrowUpRight, CheckCircle2, AlertTriangle, 
  Clock, FileText, Upload, Plus, Download, Printer, Filter, 
  Search, Globe, ShieldCheck, Check, X, ChevronRight, Eye,
  RefreshCw, Landmark, ArrowDownCircle, ArrowUpCircle, Sparkles
} from 'lucide-react';
import { ChurchContext } from '../context/ChurchContext';

export interface RemessaFilial {
  id: string;
  congregacao_id: string;
  congregacao_nome: string;
  mes_referencia: string; // YYYY-MM
  data_fechamento: string;
  dizimos_arrecadados: number;
  ofertas_arrecadadas: number;
  outras_receitas: number;
  total_bruto: number;
  percentual_retencao_local: number; // Ex: 30%
  valor_retencao_local: number;
  percentual_missoes: number; // Ex: 10%
  valor_cota_missoes: number;
  valor_cota_sede: number;
  remessa_liquida_sede: number;
  comprovante_url?: string;
  status: 'pendente' | 'enviada' | 'homologada' | 'divergencia';
  observacoes?: string;
  observacoes_sede?: string;
  homologado_por?: string;
  homologado_em?: string;
  tx_id?: string;
}

export const ModuloRemessasCongregacoes: React.FC = () => {
  const { db, setDoc, doc, dbFirestore, appId, addToast, user, logAction, setConfirmDialog } = useContext(ChurchContext);

  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const [selectedMes, setSelectedMes] = useState<string>(currentYearMonth);
  const [filterCongregacao, setFilterCongregacao] = useState<string>('todas');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const [viewingRemessa, setViewingRemessa] = useState<RemessaFilial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Lista de Congregações
  const congregacoes = useMemo(() => db.congregacoes || [], [db.congregacoes]);

  // Lista de Remessas salvas no DB (ou simuladas com persistência)
  const remessas: RemessaFilial[] = useMemo(() => {
    return (db.remessas_congregações || db.remessas || []).sort(
      (a: any, b: any) => (b.mes_referencia || '').localeCompare(a.mes_referencia || '')
    );
  }, [db.remessas_congregações, db.remessas]);

  // Form State para Nova Remessa da Filial
  const [form, setForm] = useState({
    congregacao_id: user?.congregacao_id || (congregacoes[0]?.id || 'filial_1'),
    mes_referencia: currentYearMonth,
    dizimos_arrecadados: '',
    ofertas_arrecadadas: '',
    outras_receitas: '',
    percentual_retencao_local: 30, // 30% padrão
    percentual_missoes: 10, // 10% padrão
    comprovante_url: '',
    observacoes: ''
  });

  // Cálculos dinâmicos em tempo real do formulário
  const formCalculos = useMemo(() => {
    const dizimos = parseFloat(form.dizimos_arrecadados) || 0;
    const ofertas = parseFloat(form.ofertas_arrecadadas) || 0;
    const outras = parseFloat(form.outras_receitas) || 0;
    const totalBruto = dizimos + ofertas + outras;

    const valorRetencaoLocal = (totalBruto * form.percentual_retencao_local) / 100;
    const valorCotaMissoes = (totalBruto * form.percentual_missoes) / 100;
    // O valor líquido que vai para a Sede é o Total Bruto menos o que fica na congregação
    const remessaLiquida = Math.max(0, totalBruto - valorRetencaoLocal);

    return {
      totalBruto,
      valorRetencaoLocal,
      valorCotaMissoes,
      remessaLiquida
    };
  }, [form]);

  // Remessas filtradas
  const remessasFiltradas = useMemo(() => {
    return remessas.filter((r) => {
      const matchMes = selectedMes ? r.mes_referencia === selectedMes : true;
      const matchCong = filterCongregacao === 'todas' ? true : r.congregacao_id === filterCongregacao;
      const matchStatus = filterStatus === 'todos' ? true : r.status === filterStatus;
      return matchMes && matchCong && matchStatus;
    });
  }, [remessas, selectedMes, filterCongregacao, filterStatus]);

  // Totais do Painel da Sede no mês selecionado
  const consolidadosMes = useMemo(() => {
    let arrecadadoBruto = 0;
    let retencaoFiliais = 0;
    let fundoMissoes = 0;
    let remessasHomologadas = 0;
    let remessasPendentes = 0;

    remessasFiltradas.forEach((r) => {
      arrecadadoBruto += r.total_bruto || 0;
      retencaoFiliais += r.valor_retencao_local || 0;
      fundoMissoes += r.valor_cota_missoes || 0;
      if (r.status === 'homologada') {
        remessasHomologadas += r.remessa_liquida_sede || 0;
      } else {
        remessasPendentes += r.remessa_liquida_sede || 0;
      }
    });

    return {
      arrecadadoBruto,
      retencaoFiliais,
      fundoMissoes,
      remessasHomologadas,
      remessasPendentes,
      totalRemessasPrevistas: remessasHomologadas + remessasPendentes
    };
  }, [remessasFiltradas]);

  // Enviar Nova Remessa (Filial -> Sede)
  const handleCriarRemessa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formCalculos.totalBruto <= 0) {
      return addToast('Informe valores válidos arrecadados na congregação.', 'warning');
    }

    const congObj = congregacoes.find((c: any) => c.id === form.congregacao_id);
    const congNome = congObj?.nome || 'Congregação Filial';

    setIsSubmitting(true);
    try {
      const remessaId = 'REM-' + Date.now().toString(36).toUpperCase();
      const novaRemessa: RemessaFilial = {
        id: remessaId,
        congregacao_id: form.congregacao_id,
        congregacao_nome: congNome,
        mes_referencia: form.mes_referencia,
        data_fechamento: new Date().toISOString().split('T')[0],
        dizimos_arrecadados: parseFloat(form.dizimos_arrecadados) || 0,
        ofertas_arrecadadas: parseFloat(form.ofertas_arrecadadas) || 0,
        outras_receitas: parseFloat(form.outras_receitas) || 0,
        total_bruto: formCalculos.totalBruto,
        percentual_retencao_local: form.percentual_retencao_local,
        valor_retencao_local: formCalculos.valorRetencaoLocal,
        percentual_missoes: form.percentual_missoes,
        valor_cota_missoes: formCalculos.valorCotaMissoes,
        valor_cota_sede: formCalculos.remessaLiquida - formCalculos.valorCotaMissoes,
        remessa_liquida_sede: formCalculos.remessaLiquida,
        comprovante_url: form.comprovante_url,
        status: 'enviada',
        observacoes: form.observacoes,
        tx_id: 'TX-' + Math.random().toString(36).substring(2, 9).toUpperCase()
      };

      await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'remessas_congregações', remessaId), novaRemessa);
      
      logAction(
        'REMESSA_ENVIADA',
        `Remessa da congregação ${congNome} de R$ ${formCalculos.remessaLiquida.toFixed(2)} referente a ${form.mes_referencia} enviada para a Sede.`,
        'financeiro',
        'remessas'
      );

      addToast(`Fechamento da congregação ${congNome} enviado com sucesso para a Sede!`, 'success');
      setActiveModal(false);
      setForm({
        congregacao_id: congregacoes[0]?.id || '',
        mes_referencia: currentYearMonth,
        dizimos_arrecadados: '',
        ofertas_arrecadadas: '',
        outras_receitas: '',
        percentual_retencao_local: 30,
        percentual_missoes: 10,
        comprovante_url: '',
        observacoes: ''
      });
    } catch (err) {
      console.error(err);
      addToast('Erro ao gravar remessa no servidor.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Homologar Remessa com 1 clique (Ação da Tesouraria Geral da Sede)
  const handleHomologarRemessa = (remessa: RemessaFilial) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Homologar e Lançar no Caixa Geral',
      message: `Deseja confirmar o recebimento da remessa de R$ ${remessa.remessa_liquida_sede.toFixed(2)} da congregação "${remessa.congregacao_nome}" e lançar a entrada automaticamente no Caixa Geral da Sede?`,
      confirmText: 'Homologar & Lançar',
      cancelText: 'Cancelar',
      variant: 'primary',
      onConfirm: async () => {
        try {
          const hoje = new Date().toISOString().split('T')[0];
          
          // 1. Atualizar status da remessa
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'remessas_congregações', remessa.id), {
            ...remessa,
            status: 'homologada',
            homologado_por: user?.nome || 'Tesoureiro Geral',
            homologado_em: hoje
          }, { merge: true });

          // 2. Criar entrada automática no Financeiro Geral da Sede
          const entradaFinanceiroId = 'LAN-REM-' + Date.now();
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro', entradaFinanceiroId), {
            id: entradaFinanceiroId,
            tipo: 'entrada',
            categoria: 'Remessa de Congregação',
            descricao: `Remessa Eclesiástica Mensal - ${remessa.congregacao_nome} (${remessa.mes_referencia})`,
            valor: remessa.remessa_liquida_sede,
            data_competencia: hoje,
            data_pagamento: hoje,
            forma_pagamento: 'Transferência Bancária / PIX',
            status: 'pago',
            conciliado: true,
            congregacao_id: remessa.congregacao_id,
            remessa_id: remessa.id,
            cota_missoes_embutida: remessa.valor_cota_missoes,
            created_at: new Date().toISOString()
          });

          // 3. Log de auditoria
          logAction(
            'REMESSA_HOMOLOGADA',
            `Tesouraria homologou remessa de ${remessa.congregacao_nome} no valor de R$ ${remessa.remessa_liquida_sede.toFixed(2)}. Entrada gerada no Caixa Central.`,
            'financeiro',
            'homologacao'
          );

          addToast(`Remessa de ${remessa.congregacao_nome} homologada com sucesso no Caixa Central!`, 'success');
        } catch (err) {
          console.error(err);
          addToast('Erro ao homologar remessa.', 'error');
        }
      }
    });
  };

  // Recibo de Quitação em PDF para a Filial
  const reciboRef = useRef<HTMLDivElement>(null);
  const [generatingRecibo, setGeneratingRecibo] = useState(false);

  const handlePrintRecibo = async (r: RemessaFilial) => {
    setViewingRemessa(r);
    setTimeout(async () => {
      if (!reciboRef.current) return;
      setGeneratingRecibo(true);
      try {
        const canvas = await html2canvas(reciboRef.current, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Recibo_Quitacao_Remessa_${r.congregacao_nome.replace(/\s+/g, '_')}_${r.mes_referencia}.pdf`);
        addToast('Recibo de quitação gerado com sucesso!', 'success');
      } catch (e) {
        console.error(e);
        addToast('Erro ao gerar recibo.', 'error');
      } finally {
        setGeneratingRecibo(false);
      }
    }, 400);
  };

  return (
    <div id="modulo_remessas_congregacoes" className="space-y-6 animate-entrance">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0">
            <Landmark size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                Remessas de Congregações & Cotas Estatutárias
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Hierarquia Eclesiástica
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Controle de fechamento financeiro de filiais, retenção local de custeio, cota de missões e remessa líquida à Sede.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveModal(true)}
          className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Lançar Prestação de Contas da Filial</span>
        </button>
      </div>

      {/* Métricas Consolidadas do Mês */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrecadação Bruta das Filiais</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1">
            R$ {consolidadosMes.arrecadadoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Dízimos e ofertas arrecadados nos templos</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Retenção Local Autorizada</p>
          <h3 className="text-2xl font-black text-amber-700 mt-1">
            R$ {consolidadosMes.retencaoFiliais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-amber-600 mt-0.5">Permanece no caixa filial para custeio imediato</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
            <Globe size={12} /> Cota Estatutária Missões (10%)
          </p>
          <h3 className="text-2xl font-black text-blue-700 mt-1">
            R$ {consolidadosMes.fundoMissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-blue-600 mt-0.5">Destinado à Secretaria de Missões (SEMAD/SENAMI)</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-5 rounded-2xl text-white shadow-md shadow-emerald-600/20">
          <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Remessas Homologadas (Sede)</p>
          <h3 className="text-2xl font-black text-white mt-1">
            R$ {consolidadosMes.remessasHomologadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-emerald-200 mt-0.5">
            Pendentes: R$ {consolidadosMes.remessasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filtros da Tabela */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mês de Referência</label>
            <input
              type="month"
              value={selectedMes}
              onChange={(e) => setSelectedMes(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Congregação</label>
            <select
              value={filterCongregacao}
              onChange={(e) => setFilterCongregacao(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="todas">Todas as Congregações</option>
              {congregacoes.map((c: any) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="enviada">Enviada (Aguardando)</option>
              <option value="homologada">Homologada (Caixa Sede)</option>
              <option value="divergencia">Com Divergência</option>
            </select>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-slate-500">
            Mostrando {remessasFiltradas.length} remessa(s) de filial
          </span>
        </div>
      </div>

      {/* Tabela de Remessas */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {remessasFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
            <h4 className="text-base font-bold text-slate-700">Nenhuma prestação de contas no filtro</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Clique em "Lançar Prestação de Contas da Filial" para registrar o fechamento mensal da congregação.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Congregação</th>
                  <th className="py-3.5 px-4">Mês Ref.</th>
                  <th className="py-3.5 px-4 text-right">Arrecadado Bruto</th>
                  <th className="py-3.5 px-4 text-right">Retenção Local</th>
                  <th className="py-3.5 px-4 text-right">Cota Missões (10%)</th>
                  <th className="py-3.5 px-4 text-right font-black text-slate-700">Remessa Sede</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Ações da Sede</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {remessasFiltradas.map((remessa) => (
                  <tr key={remessa.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                      <Building2 size={15} className="text-slate-400 shrink-0" />
                      <div>
                        <span>{remessa.congregacao_nome}</span>
                        <p className="text-[10px] text-slate-400 font-normal">Fechado em {remessa.data_fechamento}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      {remessa.mes_referencia}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                      R$ {remessa.total_bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-amber-600">
                      R$ {remessa.valor_retencao_local.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <span className="text-[9px] text-slate-400 ml-1">({remessa.percentual_retencao_local}%)</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-blue-600">
                      R$ {remessa.valor_cota_missoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                      R$ {remessa.remessa_liquida_sede.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {remessa.status === 'homologada' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> Homologada
                        </span>
                      ) : remessa.status === 'divergencia' ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1">
                          <AlertTriangle size={12} /> Divergência
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1">
                          <Clock size={12} /> Aguardando Sede
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {remessa.status !== 'homologada' && (
                          <button
                            onClick={() => handleHomologarRemessa(remessa)}
                            title="Homologar e Lançar no Caixa Central"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-all font-bold text-[11px] flex items-center gap-1 border border-emerald-200 cursor-pointer"
                          >
                            <Check size={13} />
                            <span>Homologar</span>
                          </button>
                        )}

                        <button
                          onClick={() => handlePrintRecibo(remessa)}
                          title="Gerar Recibo de Quitação em PDF"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all border border-slate-200 cursor-pointer"
                        >
                          <Printer size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: LANÇAR PRESTAÇÃO DE CONTAS / REMESSA */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  Fechamento & Remessa de Congregação Filial
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Preencha a arrecadação da congregação. O sistema calcula as cotas e a remessa líquida.
                </p>
              </div>
              <button
                onClick={() => setActiveModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCriarRemessa} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Congregação Filial *
                  </label>
                  <select
                    value={form.congregacao_id}
                    onChange={(e) => setForm({ ...form, congregacao_id: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
                  >
                    {congregacoes.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Mês de Competência *
                  </label>
                  <input
                    type="month"
                    required
                    value={form.mes_referencia}
                    onChange={(e) => setForm({ ...form, mes_referencia: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Valores Arrecadados */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={14} className="text-emerald-600" />
                  Arrecadação Local Realizada
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                      Dízimos do Mês (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0,00"
                      value={form.dizimos_arrecadados}
                      onChange={(e) => setForm({ ...form, dizimos_arrecadados: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                      Ofertas de Cultos (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={form.ofertas_arrecadadas}
                      onChange={(e) => setForm({ ...form, ofertas_arrecadadas: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                      Outras Receitas (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={form.outras_receitas}
                      onChange={(e) => setForm({ ...form, outras_receitas: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs font-bold">
                  <span className="text-slate-500">Total Bruto Arrecadado:</span>
                  <span className="text-slate-900 font-black text-sm">
                    R$ {formCalculos.totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Cotas Estatutárias e Repasse */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                <p className="text-[11px] font-black text-emerald-950 uppercase tracking-wider">
                  Cálculo Oficial de Cotas & Remessa à Sede
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                      Retenção Local de Custeio
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.percentual_retencao_local}
                        onChange={(e) => setForm({ ...form, percentual_retencao_local: Number(e.target.value) })}
                        className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 text-center"
                      />
                      <span className="font-bold text-slate-500">%</span>
                      <span className="text-[11px] font-black text-amber-700 ml-auto">
                        R$ {formCalculos.valorRetencaoLocal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">
                      Cota de Missões (SEMAD)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.percentual_missoes}
                        onChange={(e) => setForm({ ...form, percentual_missoes: Number(e.target.value) })}
                        className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 text-center"
                      />
                      <span className="font-bold text-slate-500">%</span>
                      <span className="text-[11px] font-black text-blue-700 ml-auto">
                        R$ {formCalculos.valorCotaMissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-600 text-white p-3.5 rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-emerald-100">
                      Remessa Líquida Obrigatória para a Sede
                    </p>
                    <p className="text-[11px] text-emerald-200">(Total Bruto $-$ Retenção Local)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white">
                      R$ {formCalculos.remessaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Observações / Justificativas do Dirigente
                </label>
                <textarea
                  rows={2}
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  placeholder="Ex: Despesa extra autorizada com conserto do telhado no templo da filial..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500 resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Enviar Remessa p/ Sede</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECIBO DE QUITAÇÃO EM A4 (ESCONDIDO/RENDERIZADO SOB DEMANDA) */}
      {viewingRemessa && (
        <div style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}>
          <div
            ref={reciboRef}
            className="w-[794px] bg-white text-slate-900 p-12 font-serif border border-slate-300"
            style={{ minHeight: '1123px' }}
          >
            <div className="border-b-4 border-slate-900 pb-6 mb-8 text-center font-sans">
              <h1 className="text-2xl font-black uppercase text-slate-950">
                {db.igreja?.nome || 'IGREJA EVANGÉLICA ASSEMBLEIA DE DEUS'}
              </h1>
              <p className="text-xs uppercase font-bold text-slate-600 mt-1">
                TESOURARIA GERAL DO CAMPO • CNPJ: {db.igreja?.cnpj || '12.345.678/0001-90'}
              </p>
              <div className="mt-4 inline-block bg-slate-100 py-1.5 px-6 rounded border border-slate-300">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">
                  RECIBO OFICIAL DE QUITAÇÃO DE REMESSA ECLESIÁSTICA
                </h2>
              </div>
            </div>

            <div className="space-y-6 text-sm leading-relaxed text-justify font-sans">
              <p>
                A Tesouraria Geral do Campo declara e dá plena e irrevogável quitação à congregação 
                <strong> {viewingRemessa.congregacao_nome.toUpperCase()}</strong> pelo recebimento da prestação de contas 
                e remessa líquida referente à competência de <strong>{viewingRemessa.mes_referencia}</strong>.
              </p>

              <table className="w-full border-collapse border border-slate-300 text-xs my-6">
                <tbody>
                  <tr className="bg-slate-100 font-bold">
                    <td className="border border-slate-300 p-2.5">Arrecadação Bruta Total da Congregação:</td>
                    <td className="border border-slate-300 p-2.5 text-right font-black">
                      R$ {viewingRemessa.total_bruto.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2.5 text-slate-600">
                      (-) Retenção Local de Custeio do Templo ({viewingRemessa.percentual_retencao_local}%):
                    </td>
                    <td className="border border-slate-300 p-2.5 text-right font-bold text-amber-700">
                      R$ {viewingRemessa.valor_retencao_local.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2.5 text-slate-600">
                      (i) Cota Estatutária Destinada a Missões (SEMAD - {viewingRemessa.percentual_missoes}%):
                    </td>
                    <td className="border border-slate-300 p-2.5 text-right font-bold text-blue-700">
                      R$ {viewingRemessa.valor_cota_missoes.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-bold">
                    <td className="border border-slate-800 p-3 uppercase">
                      (=) VALOR TOTAL DA REMESSA LÍQUIDA RECEBIDA PELA SEDE:
                    </td>
                    <td className="border border-slate-800 p-3 text-right text-base text-amber-300 font-black">
                      R$ {viewingRemessa.remessa_liquida_sede.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <p className="text-xs text-slate-600">
                Os valores foram devidamente conferidos, auditados e integrados ao Livro Caixa Central da Sede 
                sob o comprovante eletrônico de homologação <strong>{viewingRemessa.tx_id || viewingRemessa.id}</strong>.
              </p>

              <div className="pt-16 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-b border-slate-800 w-full mb-1"></div>
                  <p className="font-bold uppercase text-slate-900">Tesoureiro Geral da Sede</p>
                  <p className="text-[10px] text-slate-500">Tesouraria Central do Campo</p>
                </div>
                <div>
                  <div className="border-b border-slate-800 w-full mb-1"></div>
                  <p className="font-bold uppercase text-slate-900">Pastor Presidente do Campo</p>
                  <p className="text-[10px] text-slate-500">Visto Pastoral</p>
                </div>
              </div>

              <div className="text-center pt-8 text-[9px] text-slate-400 font-mono">
                Emitido via Sistema GIPP Eclesiástico em {new Date().toLocaleDateString('pt-BR')} • Via da Filial
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuloRemessasCongregacoes;
