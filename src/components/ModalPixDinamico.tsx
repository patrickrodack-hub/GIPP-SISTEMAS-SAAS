import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  QrCode, Copy, Check, AlertCircle, RefreshCw, X, ShieldCheck, 
  Sparkles, CheckCircle2, Clock, Zap, ArrowRight, Printer
} from 'lucide-react';

export interface ModalPixDinamicoProps {
  isOpen: boolean;
  onClose: () => void;
  valor: number;
  descricao?: string;
  categoria?: 'dizimo' | 'oferta' | 'loja' | 'carne' | 'ebd' | 'geral';
  membroId?: string;
  membroNome?: string;
  referenciaId?: string;
  chavePix?: string;
  beneficiario?: string;
  cidade?: string;
  appId?: string;
  onSuccess?: (paymentData: { txid: string; valor: number; comprovante: string; paidAt: string }) => void;
}

export const ModalPixDinamico: React.FC<ModalPixDinamicoProps> = ({
  isOpen,
  onClose,
  valor,
  descricao = 'Contribuição eclesiástica',
  categoria = 'geral',
  membroId,
  membroNome,
  referenciaId,
  chavePix,
  beneficiario,
  cidade,
  appId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{
    txid: string;
    payload: string;
    qrCodeBase64: string;
    provider: string;
    vencimento: string;
  } | null>(null);
  
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'RECEIVED' | 'FAILED'>('PENDING');
  const [comprovante, setComprovante] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 min
  
  const pollIntervalRef = useRef<any>(null);

  // 1. Gera a cobrança ao abrir o modal
  useEffect(() => {
    if (!isOpen || valor <= 0) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setPaymentStatus('PENDING');
    setComprovante(null);
    setCopied(false);
    setTimeLeft(1800);

    const gerarCobranca = async () => {
      try {
        const resp = await fetch('/api/financeiro/pix/gerar-cobranca', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            valor,
            descricao,
            categoria,
            membroId,
            membroNome,
            referenciaId,
            chavePix,
            beneficiario,
            cidade,
            appId
          })
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || `Erro ${resp.status} ao gerar cobrança.`);
        }

        const data = await resp.json();
        if (isMounted) {
          if (data.success) {
            setPixData({
              txid: data.txid,
              payload: data.payload,
              qrCodeBase64: data.qrCodeBase64,
              provider: data.provider || 'PIX Dinâmico BACEN',
              vencimento: data.vencimento
            });
          } else {
            throw new Error(data.error || 'Falha ao processar QR Code.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Não foi possível gerar a cobrança instantânea.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    gerarCobranca();

    return () => {
      isMounted = false;
    };
  }, [isOpen, valor, descricao, categoria, chavePix, beneficiario]);

  // 2. Polling contínuo de verificação de baixa instantânea
  useEffect(() => {
    if (!pixData?.txid || paymentStatus !== 'PENDING' || !isOpen) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const resp = await fetch(`/api/financeiro/pix/status/${pixData.txid}`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && (data.status === 'RECEIVED' || data.status === 'CONFIRMED')) {
            setPaymentStatus('RECEIVED');
            const compId = data.comprovante || `PIX-${Date.now().toString().slice(-6)}`;
            setComprovante(compId);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

            // Dispara callback de sucesso
            if (onSuccess) {
              onSuccess({
                txid: pixData.txid,
                valor,
                comprovante: compId,
                paidAt: data.paidAt || new Date().toISOString()
              });
            }
          }
        }
      } catch (e) {
        // Silencioso no polling
      }
    }, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [pixData?.txid, paymentStatus, isOpen, valor, onSuccess]);

  // Timer regressivo de 30 min
  useEffect(() => {
    if (!isOpen || paymentStatus !== 'PENDING') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, paymentStatus]);

  // Copia o código Copia e Cola
  const handleCopy = () => {
    if (!pixData?.payload) return;
    navigator.clipboard.writeText(pixData.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Simulação de pagamento instantâneo para testes / sandbox
  const handleSimularPagamento = async () => {
    if (!pixData?.txid || simulating) return;
    setSimulating(true);
    try {
      const resp = await fetch(`/api/financeiro/pix/simular-pagamento/${pixData.txid}`, {
        method: 'POST'
      });
      const data = await resp.json();
      if (data.success) {
        setPaymentStatus('RECEIVED');
        const compId = data.comprovante || `SIMULA-${Date.now()}`;
        setComprovante(compId);
        if (onSuccess) {
          onSuccess({
            txid: pixData.txid,
            valor,
            comprovante: compId,
            paidAt: data.paidAt || new Date().toISOString()
          });
        }
      }
    } catch (err: any) {
      alert("Erro ao simular: " + err.message);
    } finally {
      setSimulating(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] bg-slate-950/85 backdrop-blur-sm overflow-y-auto p-3 sm:p-5 flex justify-center items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget && paymentStatus !== 'RECEIVED') onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto transition-all">
        
        {/* Top Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <QrCode size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                PIX Dinâmico Instantâneo
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  Ao Vivo
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{descricao}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh] flex flex-col items-center text-center">

          {/* Loading State */}
          {loading && (
            <div className="py-16 flex flex-col items-center gap-3">
              <RefreshCw size={36} className="text-teal-600 dark:text-teal-400 animate-spin" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Gerando cobrança PIX oficial com QR Code...</p>
              <p className="text-xs text-slate-400">Calculando assinatura de segurança e hash bancário</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="py-10 flex flex-col items-center gap-3">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-900">
                <AlertCircle size={32} />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white">Não foi possível gerar a cobrança</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all"
              >
                Fechar
              </button>
            </div>
          )}

          {/* SUCESSO - PAGAMENTO RECEBIDO */}
          {!loading && !error && paymentStatus === 'RECEIVED' && (
            <div className="py-6 flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={44} className="animate-bounce" />
              </div>
              
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
                  Pagamento Confirmado
                </span>
                <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-2">
                  R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Baixa automática realizada com sucesso no caixa da igreja!
                </p>
              </div>

              {/* Comprovante Box */}
              <div className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-left space-y-2 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Autenticação Bancária:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{comprovante || pixData?.txid}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Data e Horário:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{new Date().toLocaleString('pt-BR')}</span>
                </div>
                {membroNome && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Contribuinte / Aluno:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{membroNome}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Destinatário:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{beneficiario || 'Igreja Sede'}</span>
                </div>
              </div>

              <div className="flex gap-3 w-full mt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={16} /> Concluir e Voltar
                </button>
              </div>
            </div>
          )}

          {/* AGUARDANDO PAGAMENTO (QR CODE + COPIA E COLA) */}
          {!loading && !error && paymentStatus === 'PENDING' && pixData && (
            <div className="w-full flex flex-col items-center space-y-4">
              
              {/* Valor em destaque */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor a transferir</p>
                <div className="text-3xl font-black text-teal-600 dark:text-teal-400 tracking-tight">
                  R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* QR Code Card */}
              <div className="relative p-4 bg-white dark:bg-white rounded-2xl shadow-md border-2 border-teal-500/30 flex flex-col items-center">
                <img 
                  src={pixData.qrCodeBase64} 
                  alt="QR Code PIX Dinâmico" 
                  className="w-56 h-56 object-contain"
                />
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <ShieldCheck size={14} className="text-teal-600" />
                  PIX Banco Central do Brasil (EMVCo)
                </div>
              </div>

              {/* Status de Escuta Ao Vivo */}
              <div className="w-full flex items-center justify-between px-4 py-2.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                  </span>
                  <span className="font-bold text-teal-800 dark:text-teal-200">
                    Aguardando confirmação bancária...
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                  <Clock size={12} />
                  <span>{timeFormatted}</span>
                </div>
              </div>

              {/* Copia e Cola Field */}
              <div className="w-full space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Código Copia e Cola (BRCode)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixData.payload}
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 select-all truncate outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`px-4 py-2.5 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                      copied 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* Beneficiário e Info */}
              <div className="text-left w-full text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-0.5">
                <p><strong>Destinatário:</strong> {beneficiario || 'Igreja Sede'}</p>
                <p><strong>Identificador:</strong> <span className="font-mono">{pixData.txid}</span></p>
                <p><strong>Provedor:</strong> {pixData.provider}</p>
              </div>

              {/* Sandbox Simulator Action for Testing */}
              <div className="w-full pt-1">
                <button
                  type="button"
                  onClick={handleSimularPagamento}
                  disabled={simulating}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  <Zap size={14} className="text-amber-500" />
                  {simulating ? "Verificando liquidação..." : "Simular Pagamento Imediato (Demonstração / Teste)"}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
};
