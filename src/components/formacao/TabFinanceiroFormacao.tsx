import React, { useState } from 'react';
import { 
    DollarSign, CheckCircle2, AlertCircle, Plus, Receipt, 
    CreditCard, Calendar, Check, X, ShieldAlert, ArrowUpRight, Clock
} from 'lucide-react';
import { FinanceiroCandidato, TurmaFormacao, CandidatoObreiro } from '../../data/ModuleFormacaoObreirosData';
import { formatDateLocal, getTodayDate } from '../../utils/sharedHelpers';

interface TabFinanceiroFormacaoProps {
    financeiroList?: FinanceiroCandidato[];
    turmas?: TurmaFormacao[];
    candidatos?: CandidatoObreiro[];
    onSalvarRegistro?: (registro: FinanceiroCandidato) => void;
    onSalvarRegistroFinanceiro?: (registro: FinanceiroCandidato) => void;
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TabFinanceiroFormacao: React.FC<TabFinanceiroFormacaoProps> = ({
    financeiroList = [],
    turmas = [],
    candidatos = [],
    onSalvarRegistro,
    onSalvarRegistroFinanceiro,
    addToast
}) => {
    const listaFinanceiro = financeiroList || [];
    const listaTurmas = turmas || [];
    const listaCandidatos = candidatos || [];

    const handleSalvar = onSalvarRegistro || onSalvarRegistroFinanceiro || (() => {});
    const [selectedTurmaId, setSelectedTurmaId] = useState<string>(listaTurmas[0]?.id || '');
    const [pagamentoModalItem, setPagamentoModalItem] = useState<{
        registro: FinanceiroCandidato;
        tipoTaxa: 'matricula' | 'material' | 'formatura';
    } | null>(null);

    const [formaPagamento, setFormaPagamento] = useState('PIX');

    const activeTurma = listaTurmas.find(t => t.id === selectedTurmaId) || listaTurmas[0];
    const registrosDaTurma = listaFinanceiro.filter(f => f && f.turmaId === activeTurma?.id);

    // Métricas financeiras
    let totalArrecadado = 0;
    let totalPendente = 0;

    registrosDaTurma.forEach(r => {
        if (r.taxaMatricula.pago) totalArrecadado += r.taxaMatricula.valor;
        else totalPendente += r.taxaMatricula.valor;

        if (r.taxaMaterial.pago) totalArrecadado += r.taxaMaterial.valor;
        else totalPendente += r.taxaMaterial.valor;

        if (r.taxaFormatura.pago) totalArrecadado += r.taxaFormatura.valor;
        else totalPendente += r.taxaFormatura.valor;
    });

    const handleConfirmarBaixa = () => {
        if (!pagamentoModalItem) return;
        const { registro, tipoTaxa } = pagamentoModalItem;

        const updated: FinanceiroCandidato = { ...registro };
        const dataHoje = getTodayDate();

        if (tipoTaxa === 'matricula') {
            updated.taxaMatricula = { ...updated.taxaMatricula, pago: true, data: dataHoje, forma: formaPagamento };
        } else if (tipoTaxa === 'material') {
            updated.taxaMaterial = { ...updated.taxaMaterial, pago: true, data: dataHoje, forma: formaPagamento };
        } else if (tipoTaxa === 'formatura') {
            updated.taxaFormatura = { ...updated.taxaFormatura, pago: true, data: dataHoje, forma: formaPagamento };
        }

        // Verifica se tudo foi quitado
        if (updated.taxaMatricula.pago && updated.taxaMaterial.pago && updated.taxaFormatura.pago) {
            updated.statusGeral = 'em_dia';
        }

        handleSalvar(updated);
        setPagamentoModalItem(null);
        addToast("Pagamento baixado com sucesso no módulo financeiro!", "success");
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            Gestão Financeira & Taxas de Formação
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Controle opcional de taxa de matrícula, material didático impresso e taxa de consagração ministerial.
                    </p>
                </div>

                <select
                    value={selectedTurmaId}
                    onChange={(e) => setSelectedTurmaId(e.target.value)}
                    className="text-xs font-bold py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-slate-800 dark:text-slate-100"
                >
                    {turmas.map(t => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                </select>
            </div>

            {/* Cards de Métricas Financeiras */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400">Total Arrecadado</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-black text-emerald-600">R$ {totalArrecadado.toFixed(2)}</span>
                        <Receipt size={18} className="text-emerald-500" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Valores confirmados no caixa</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400">Valores a Receber</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-black text-amber-600">R$ {totalPendente.toFixed(2)}</span>
                        <Clock size={18} className="text-amber-500" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Apostilas e taxas de formatura pendentes</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400">Taxa de Adimplência</span>
                    <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                            {totalArrecadado + totalPendente > 0 
                                ? Math.round((totalArrecadado / (totalArrecadado + totalPendente)) * 100) 
                                : 100}%
                        </span>
                        <CheckCircle2 size={18} className="text-sky-500" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Saúde financeira da turma</p>
                </div>
            </div>

            {/* Tabela de Alunos e Taxas */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black uppercase text-slate-400">
                        Status Financeiro Individual por Aluno ({registrosDaTurma.length})
                    </h3>
                </div>

                {registrosDaTurma.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-2xl border-slate-200 dark:border-slate-800">
                        Nenhum registro financeiro encontrado para esta turma.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {registrosDaTurma.map(reg => (
                            <div key={reg.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-slate-900 dark:text-white text-sm">{reg.candidatoNome}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                            reg.statusGeral === 'em_dia'
                                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'
                                                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600'
                                        }`}>
                                            {reg.statusGeral.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{reg.observacoes || 'Sem observações'}</p>
                                </div>

                                {/* As 3 Taxas */}
                                <div className="grid grid-cols-3 gap-2 shrink-0">
                                    {/* Matrícula */}
                                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Matrícula</span>
                                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                                            R$ {reg.taxaMatricula.valor.toFixed(2)}
                                        </span>
                                        <div className="mt-1.5">
                                            {reg.taxaMatricula.pago ? (
                                                <span className="text-[9px] font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                                                    <Check size={11} /> Pago
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setPagamentoModalItem({ registro: reg, tipoTaxa: 'matricula' })}
                                                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] transition-all cursor-pointer"
                                                >
                                                    Baixar
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Material */}
                                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Apostilas</span>
                                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                                            R$ {reg.taxaMaterial.valor.toFixed(2)}
                                        </span>
                                        <div className="mt-1.5">
                                            {reg.taxaMaterial.pago ? (
                                                <span className="text-[9px] font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                                                    <Check size={11} /> Pago
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setPagamentoModalItem({ registro: reg, tipoTaxa: 'material' })}
                                                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] transition-all cursor-pointer"
                                                >
                                                    Baixar
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Formatura / Consagração */}
                                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Formatura</span>
                                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                                            R$ {reg.taxaFormatura.valor.toFixed(2)}
                                        </span>
                                        <div className="mt-1.5">
                                            {reg.taxaFormatura.pago ? (
                                                <span className="text-[9px] font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                                                    <Check size={11} /> Pago
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setPagamentoModalItem({ registro: reg, tipoTaxa: 'formatura' })}
                                                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] transition-all cursor-pointer"
                                                >
                                                    Baixar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: Baixar Pagamento */}
            {pagamentoModalItem && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">Registrar Pagamento</h3>
                                <p className="text-[11px] text-slate-500">Aluno: {pagamentoModalItem.registro.candidatoNome}</p>
                            </div>
                            <button onClick={() => setPagamentoModalItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-center">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Taxa a Quitar</span>
                                <span className="text-base font-black text-emerald-700 dark:text-emerald-300 capitalize">
                                    {pagamentoModalItem.tipoTaxa}
                                </span>
                            </div>

                            <div>
                                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Forma de Pagamento</label>
                                <select
                                    value={formaPagamento}
                                    onChange={(e) => setFormaPagamento(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                                >
                                    <option value="PIX">PIX Direto na Conta da Igreja</option>
                                    <option value="Dinheiro">Dinheiro em Espécie (Secretaria)</option>
                                    <option value="Cartão de Débito">Cartão de Débito</option>
                                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                                    <option value="Boleto">Boleto Bancário</option>
                                </select>
                            </div>

                            <button
                                onClick={handleConfirmarBaixa}
                                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md mt-4 cursor-pointer"
                            >
                                Confirmar Recebimento & Baixar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
