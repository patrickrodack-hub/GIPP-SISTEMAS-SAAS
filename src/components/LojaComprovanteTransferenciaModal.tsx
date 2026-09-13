import React, { useRef } from 'react';
import { 
  Building2, Printer, CheckCircle2, ArrowRight, DollarSign, Calendar, 
  User, ShieldCheck, FileText, X, Landmark, Receipt
} from 'lucide-react';
import { TransferenciaCaixaLoja } from '../data/lojaVirtualData';
import { InteractiveWindow } from './InteractiveWindow';

interface LojaComprovanteTransferenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferencia: TransferenciaCaixaLoja | null;
  igrejaData?: any;
}

export default function LojaComprovanteTransferenciaModal({
  isOpen,
  onClose,
  transferencia,
  igrejaData
}: LojaComprovanteTransferenciaModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transferencia) return null;

  const handlePrint = () => {
    window.print();
  };

  const churchName = igrejaData?.nome || 'IGREJA EVANGÉLICA ASSEMBLEIA DE DEUS';
  const churchCnpj = igrejaData?.cnpj || '12.345.678/0001-90';
  const churchAddress = `${igrejaData?.endereco || 'Rua das Oliveiras, 123'} - ${igrejaData?.cidade || 'São Paulo'}/${igrejaData?.uf || 'SP'}`;
  const churchPhone = igrejaData?.telefone || '(11) 98765-4321';

  return (
    <InteractiveWindow
      isOpen={isOpen}
      onClose={onClose}
      title={`Comprovante de Transferência - ${transferencia.numero_comprovante}`}
      icon={<Receipt className="w-5 h-5 text-emerald-500" />}
      windowId={`comprovante-transferencia-${transferencia.id}`}
      defaultWidth={760}
      defaultHeight={820}
    >
      <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 overflow-y-auto">
        {/* Barra de Ações do Topo */}
        <div className="flex items-center justify-between gap-3 mb-4 print:hidden bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Repasse Registrado no Financeiro da Igreja
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer size={15} /> Imprimir Comprovante
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ÁREA DO DOCUMENTO IMPRESSO / VISUALIZADO */}
        <div 
          ref={printRef}
          className="bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-200/90 max-w-2xl mx-auto w-full relative print:p-0 print:shadow-none print:border-none print:m-0"
        >
          {/* Marca d'água de confirmação */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Landmark size={400} />
          </div>

          {/* CABEÇALHO TIMBRADO DA IGREJA */}
          <div className="border-b-2 border-slate-800 pb-5 mb-6 text-center relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black shadow-sm">
                <Building2 size={22} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  {churchName}
                </h1>
                <p className="text-[11px] font-semibold text-slate-600">
                  DEPARTAMENTO DE TESOURARIA & LIVRARIA / LOJA VIRTUAL
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              CNPJ: {churchCnpj} | {churchAddress} | Fone: {churchPhone}
            </p>
          </div>

          {/* TÍTULO DO COMPROVANTE */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h2 className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                  Comprovante de Repasse de Caixa
                </h2>
                <p className="text-[10px] text-emerald-700 font-medium">
                  Transferência de Saldo da Loja Virtual para a Tesouraria Geral
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Nº Documento</span>
              <span className="text-xs font-black text-slate-900 font-mono">
                {transferencia.numero_comprovante}
              </span>
            </div>
          </div>

          {/* VALOR EM DESTAQUE */}
          <div className="border border-slate-200 rounded-2xl p-5 mb-6 bg-gradient-to-br from-slate-50 to-white text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
              Valor Total Transferido e Creditado
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono tracking-tight">
              R$ {transferencia.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
              Status: Entrada Confirmada no Caixa da Igreja
            </span>
          </div>

          {/* DETALHAMENTO DA TRANSAÇÃO */}
          <div className="space-y-3 mb-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Origem do Saldo</span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Caixa da Loja Virtual & Livraria
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Destino na Igreja</span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  {transferencia.destino_conta}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Data e Hora da Operação</span>
                <p className="font-semibold text-slate-800">
                  {new Date(transferencia.data_transferencia).toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Forma de Repasse</span>
                <p className="font-semibold text-slate-800 uppercase">
                  {transferencia.forma_transferencia === 'transferencia_interna' ? 'Transferência Interna entre Caixas' : transferencia.forma_transferencia.toUpperCase()}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Classificação Financeira</span>
                <p className="font-semibold text-slate-800">
                  {transferencia.categoria_financeiro}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Operador / Responsável</span>
                <p className="font-semibold text-slate-800">
                  {transferencia.responsavel_nome}
                </p>
              </div>
            </div>

            {/* Balanço do Caixa da Loja */}
            <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Saldo do Caixa Loja Anterior</span>
                <span className="font-bold text-slate-700 font-mono">
                  R$ {transferencia.saldo_anterior.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Saldo Remanescente no Caixa Loja</span>
                <span className="font-bold text-emerald-700 font-mono">
                  R$ {transferencia.saldo_posterior.toFixed(2)}
                </span>
              </div>
            </div>

            {transferencia.observacoes && (
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
                <span className="text-[10px] font-bold text-amber-900 uppercase block mb-0.5">Observações / Finalidade:</span>
                <p className="text-slate-700 italic">
                  {transferencia.observacoes}
                </p>
              </div>
            )}
          </div>

          {/* DECLARAÇÃO DE AUDITORIA */}
          <p className="text-[10px] text-slate-500 text-justify leading-relaxed mb-8">
            Declaramos para os devidos fins contábeis e de prestação de contas que o valor discriminado neste comprovante foi integralmente repassado do caixa de receitas comerciais da Loja Virtual e creditado como Entrada de Receita na Tesouraria Geral da Igreja, sob fiscalização da diretoria eclesiástica.
          </p>

          {/* ASSINATURAS */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center">
            <div>
              <div className="border-b border-slate-400 mb-1.5 w-4/5 mx-auto" />
              <p className="text-[11px] font-bold text-slate-800">{transferencia.responsavel_nome}</p>
              <p className="text-[9px] text-slate-500 uppercase">Responsável pela Loja Virtual</p>
            </div>

            <div>
              <div className="border-b border-slate-400 mb-1.5 w-4/5 mx-auto" />
              <p className="text-[11px] font-bold text-slate-800">{igrejaData?.tesoureiro1 || 'Tesouraria Geral'}</p>
              <p className="text-[9px] text-slate-500 uppercase">Recebido na Tesouraria da Igreja</p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[9px] text-slate-400">
            Documento gerado eletronicamente em {new Date().toLocaleString('pt-BR')} • Sistema Integrado de Gestão Eclesiástica GIPP
          </div>
        </div>
      </div>
    </InteractiveWindow>
  );
}
