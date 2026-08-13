import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  QrCode,
  Copy,
  Check,
  Send,
  Download,
  FileText,
  DollarSign,
  Heart,
  Calendar,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt,
  UserCheck,
  Building,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { ChurchContext } from '../App';

export default function ModuleGippPay() {
  const context = useContext(ChurchContext) as any;
  const { db, addToast, user, addDoc, collection, dbFirestore, appId } = context || {};

  const [activeTab, setActiveTab] = useState<'checkout' | 'extrato' | 'recorrente'>('checkout');
  const [tipoContribui, setTipoContribui] = useState<'Dízimo' | 'Oferta' | 'Missões' | 'Construção' | 'Outros'>('Dízimo');
  const [nomeDizimista, setNomeDizimista] = useState(user?.nome || '');
  const [whatsappDizimista, setWhatsappDizimista] = useState('');
  const [valor, setValor] = useState('100,00');
  const [metodo, setMetodo] = useState<'pix' | 'cartao'>('pix');
  const [qrCodeGerado, setQrCodeGerado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reciboVisual, setReciboVisual] = useState<any | null>(null);

  // MOCK EMV Pix Code
  const pixCopiaCola = `00020126580014BR.GOV.BCB.PIX0136d8f8d223-1022-4a11-b0e1-gipppay9999520400005303986540${valor.replace(',', '.')}5802BR5925IGREJA EVANGELICA GIPP6009SAO PAULO62070503***63041A2B`;

  const handleGerarPix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valor || parseFloat(valor.replace(',', '.')) <= 0) {
      addToast('Informe um valor válido para contribuição.', 'error');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setQrCodeGerado(true);
      setIsProcessing(false);
      addToast('QR Code Pix gerado instantaneamente com chave transacional!', 'success');
    }, 600);
  };

  const handleConfirmarPagamento = async () => {
    setIsProcessing(true);
    try {
      const numericVal = parseFloat(valor.replace(',', '.'));
      const novoLancamento = {
        data: new Date().toISOString().split('T')[0],
        tipo: 'Receita',
        categoria: tipoContribui,
        descricao: `${tipoContribui} via GIPP Pay - ${nomeDizimista || 'Anônimo'}`,
        valor: numericVal,
        dizimista: nomeDizimista || 'Dizimista / Doador',
        formaPagamento: 'PIX (GIPP Pay)',
        status: 'Pago',
        transacaoId: `TX-GIPP-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString()
      };

      if (addDoc && dbFirestore && appId) {
        await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'financeiro'), novoLancamento);
      }

      setReciboVisual(novoLancamento);
      setQrCodeGerado(false);
      addToast('Contribuição processada e lançada na tesouraria!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro ao registrar transação.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopiaCola);
    setCopiado(true);
    addToast('Chave Copia e Cola copiada para a área de transferência!', 'info');
    setTimeout(() => setCopiado(false), 3000);
  };

  const sendReciboWhatsApp = () => {
    if (!reciboVisual) return;
    const cleanPhone = whatsappDizimista.replace(/\D/g, '');
    const text = encodeURIComponent(
      `*RECIBO DE CONTRIBUIÇÃO - GIPP PAY*\n\n` +
      `🏛️ *Igreja:* GIPP Eclesiástico\n` +
      `👤 *Contribuinte:* ${reciboVisual.dizimista}\n` +
      `🏷️ *Tipo:* ${reciboVisual.categoria}\n` +
      `💰 *Valor:* R$ ${reciboVisual.valor.toFixed(2)}\n` +
      `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n` +
      `🔑 *ID Transação:* ${reciboVisual.transacaoId}\n\n` +
      `"Cada um contribua segundo propôs no seu coração... porque Deus ama ao que dá com alegria." (2 Co 9:7)\n\n Que Deus abençoe grandemente!`
    );
    window.open(`https://wa.me/55${cleanPhone || '11999999999'}?text=${text}`, '_blank');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/20">
            <Zap size={32} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                GIPP Pay • Módulo Financeiro Digital
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Terminal GIPP Pay & Checkout
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Plataforma integrada de contribuição transacional (Pix Dinâmico, Dízimos, Ofertas e Assinatura Recorrente) com <strong className="text-blue-400">conciliação contábil automática</strong> e recibo no WhatsApp.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 md:flex-none ${
              activeTab === 'checkout' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode size={15} /> Contribuição Instantânea
          </button>
          <button
            onClick={() => setActiveTab('recorrente')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 md:flex-none ${
              activeTab === 'recorrente' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar size={15} /> Dízimo Recorrente
          </button>
        </div>
      </div>

      {activeTab === 'checkout' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <h2 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Wallet className="text-blue-400" size={20} /> Dados da Contribuição
            </h2>

            <form onSubmit={handleGerarPix} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-2">Finalidade do Recurso *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Dízimo', 'Oferta', 'Missões', 'Construção', 'Outros'] as const).map(tipo => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoContribui(tipo)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        tipoContribui === tipo
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Nome do Doador / Dizimista</label>
                  <input
                    type="text"
                    value={nomeDizimista}
                    onChange={e => setNomeDizimista(e.target.value)}
                    placeholder="Nome completo (ou anônimo)"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">WhatsApp para Recibo</label>
                  <input
                    type="text"
                    value={whatsappDizimista}
                    onChange={e => setWhatsappDizimista(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Valor da Oferta / Dízimo (R$) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 font-black text-slate-400 text-base">R$</span>
                  <input
                    type="text"
                    required
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    placeholder="00,00"
                    className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-lg font-black text-emerald-400 outline-none focus:border-emerald-500"
                  />
                </div>
                {/* Preset quick buttons */}
                <div className="flex items-center gap-2 mt-2">
                  {['20,00', '50,00', '100,00', '250,00', '500,00'].map(valPreset => (
                    <button
                      key={valPreset}
                      type="button"
                      onClick={() => setValor(valPreset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700"
                    >
                      + R$ {valPreset}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? 'Gerando Chave Transacional...' : <><QrCode size={18} /> Gerar Pix Dinâmico GIPP Pay</>}
              </button>
            </form>
          </div>

          {/* Right Display: Generated QR Code or Receipt */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col items-center justify-center text-center space-y-6 min-h-[420px]">
            {reciboVisual ? (
              <div className="w-full space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Lançamento Confirmado
                  </span>
                  <h3 className="text-xl font-black text-white mt-2">Recibo de Contribuição Emitido</h3>
                  <p className="text-xs text-slate-400 mt-1">Transação {reciboVisual.transacaoId}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Contribuinte:</span>
                    <strong className="text-white font-bold">{reciboVisual.dizimista}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Categoria:</span>
                    <strong className="text-blue-400 font-bold">{reciboVisual.categoria}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valor Pago:</span>
                    <strong className="text-emerald-400 font-black text-sm">R$ {reciboVisual.valor.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={sendReciboWhatsApp}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={15} /> Enviar WhatsApp
                  </button>
                  <button
                    onClick={() => setReciboVisual(null)}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Nova Oferta
                  </button>
                </div>
              </div>
            ) : qrCodeGerado ? (
              <div className="w-full space-y-4 animate-fadeIn">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Aguardando Pagamento
                </span>

                <div className="p-4 bg-white rounded-3xl shadow-2xl inline-block mx-auto border-4 border-blue-500/30">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCopiaCola)}`}
                    alt="QR Code Pix GIPP Pay"
                    className="w-44 h-44 object-contain"
                  />
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-medium">Abra o app do seu banco e escaneie a imagem acima</p>
                  <p className="text-lg font-black text-emerald-400 mt-1">R$ {valor}</p>
                </div>

                <div className="w-full space-y-2">
                  <button
                    onClick={handleCopyPix}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiado ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    {copiado ? 'Copiado para Área de Transferência!' : 'Copiar Pix Copia e Cola'}
                  </button>

                  <button
                    onClick={handleConfirmarPagamento}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={16} /> Simular Confirmação Instantânea
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-12">
                <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 text-slate-600 inline-block">
                  <QrCode size={48} />
                </div>
                <h3 className="text-base font-bold text-slate-300">Terminal GIPP Pay Pronto</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Preencha o valor e o dízimo ao lado para gerar o QR Code Pix com emissão automática de recibo.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'recorrente' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Calendar className="text-blue-400" size={20} /> Contribuição Recorrente Programada
              </h2>
              <p className="text-xs text-slate-400">Assinatura mensal de mantenedores de missões e dízimo agendado</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              ● Sistema Ativo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Plano Fiel Mantenedor</span>
              <h3 className="text-xl font-black text-white">R$ 50,00 <span className="text-xs font-normal text-slate-400">/mês</span></h3>
              <p className="text-xs text-slate-400">Destinado a projetos missionários e obra social da igreja local.</p>
              <button
                onClick={() => addToast('Assinatura recorrente programada com sucesso!', 'success')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                Ativar Recorrência
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-blue-500/40 relative space-y-3">
              <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded-md shadow-sm">
                Mais Utilizado
              </span>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Dízimo Mensal Programado</span>
              <h3 className="text-xl font-black text-white">Valor Flexível</h3>
              <p className="text-xs text-slate-400">Receba lembrete discreto no WhatsApp no dia do seu pagamento com chave Pix pronta.</p>
              <button
                onClick={() => addToast('Lembrete de dízimo programado ativado!', 'success')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                Agendar no WhatsApp
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Mantenedor de Templo</span>
              <h3 className="text-xl font-black text-white">R$ 200,00 <span className="text-xs font-normal text-slate-400">/mês</span></h3>
              <p className="text-xs text-slate-400">Fundo especial para reforma, expansão e equipamentos do templo.</p>
              <button
                onClick={() => addToast('Assinatura de mantenedor registrada!', 'success')}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                Ativar Recorrência
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
