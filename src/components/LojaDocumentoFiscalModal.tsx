import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Printer, X, MessageCircle, Mail, Download, Share2, CheckCircle2, 
  Building2, User, Phone, MapPin, Calendar, Clock, ShoppingBag, 
  ShieldCheck, QrCode, Copy, Check, FileText, Send, AlertCircle, Sparkles
} from 'lucide-react';
import { PedidoLoja } from '../data/lojaVirtualData';
import { InteractiveWindow } from './InteractiveWindow';
import { Button } from '../utils/sharedHelpers';

export interface LojaDocumentoFiscalModalProps {
  pedido: PedidoLoja;
  tipoDocumento?: 'nota_fiscal' | 'pedido_compra';
  igreja?: any;
  isMemberPortal?: boolean;
  onClose: () => void;
  onUpdateStatus?: (pedido: PedidoLoja) => void;
}

export default function LojaDocumentoFiscalModal({
  pedido,
  tipoDocumento = 'nota_fiscal',
  igreja,
  isMemberPortal = false,
  onClose,
  onUpdateStatus
}: LojaDocumentoFiscalModalProps) {
  // Se for o portal do membro e o pagamento ainda não foi confirmado, forçar sempre para pedido de compra
  const initialDocType = isMemberPortal && pedido.status_pagamento !== 'pago' ? 'pedido_compra' : tipoDocumento;
  const [docType, setDocType] = useState<'nota_fiscal' | 'pedido_compra'>(initialDocType);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Dados da Igreja
  const churchName = igreja?.nome || 'Igreja Evangélica Assembleia de Deus';
  const churchCnpj = igreja?.cnpj || '12.345.678/0001-90';
  const churchAddress = `${igreja?.endereco || 'Rua Principal, 100'} - ${igreja?.bairro || 'Centro'}`;
  const churchCity = `${igreja?.cidade || 'Cidade'} / ${igreja?.uf || 'UF'} - CEP: ${igreja?.cep || '00000-000'}`;
  const churchPhone = igreja?.telefone || igreja?.whatsapp || '(11) 99999-9999';
  const churchEmail = igreja?.email || 'secretaria@igreja.org.br';
  const churchPastor = igreja?.pastor_presidente || igreja?.pastor || 'Pr. Presidente';
  const churchLogo = igreja?.logo || '';

  // Geração de Chave de Acesso Única de 44 dígitos / Código de Autenticação
  const rawIdNumber = String(pedido.id || pedido.numero_pedido).replace(/\D/g, '').padEnd(12, '7');
  const chaveAcesso = `352609${churchCnpj.replace(/\D/g, '').padStart(14, '0').slice(0, 14)}55001${rawIdNumber.slice(0, 9)}100${Math.floor(100000 + Math.random() * 899999)}4`;
  const chaveFormatada = chaveAcesso.match(/.{1,4}/g)?.join(' ') || chaveAcesso;

  const dataEmissao = new Date(pedido.data_pedido).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const totalQtdItens = pedido.itens.reduce((acc, item) => acc + item.quantidade, 0);

  // QR Code URL
  const qrValidationUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    `COMPROVANTE OFICIAL LOJA DA IGREJA\nIgreja: ${churchName}\nPedido: #${pedido.numero_pedido}\nCliente: ${pedido.cliente_nome}\nCPF: ${pedido.cliente_cpf || 'Não informado'}\nTotal: R$ ${pedido.valor_total.toFixed(2)}\nStatus Pagamento: ${pedido.status_pagamento.toUpperCase()}\nChave: ${chaveAcesso}`
  )}&color=0f172a&bgcolor=ffffff`;

  // Função para acionar a impressão com layout otimizado
  const handlePrint = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>${docType === 'nota_fiscal' ? 'Documento Auxiliar de Venda / Cupom' : 'Pedido de Compra'} - #${pedido.numero_pedido}</title>
          <style>
            @page {
              size: A4;
              margin: 10mm 12mm 10mm 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #fff;
              margin: 0;
              padding: 10px;
              font-size: 11px;
              line-height: 1.4;
            }
            .header-table {
              width: 100%;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .title-doc {
              font-size: 16px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #0f172a;
              margin: 0;
            }
            .subtitle-doc {
              font-size: 10px;
              color: #475569;
              font-weight: bold;
              text-transform: uppercase;
            }
            .badge-status {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 900;
              text-transform: uppercase;
              border: 1px solid #cbd5e1;
            }
            .badge-pago {
              background: #ecfdf5;
              color: #065f46;
              border-color: #a7f3d0;
            }
            .badge-pendente {
              background: #fffbeb;
              color: #92400e;
              border-color: #fde68a;
            }
            .section-box {
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 8px 10px;
              margin-bottom: 10px;
              background: #fafafa;
            }
            .section-title {
              font-size: 10px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #475569;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 3px;
              margin-bottom: 6px;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            .grid-3 {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 8px;
            }
            table.items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 6px;
              margin-bottom: 10px;
            }
            table.items-table th {
              background: #0f172a;
              color: #fff;
              font-size: 9px;
              text-transform: uppercase;
              font-weight: 800;
              padding: 6px 8px;
              text-align: left;
              border: 1px solid #0f172a;
            }
            table.items-table td {
              border: 1px solid #cbd5e1;
              padding: 6px 8px;
              font-size: 10px;
            }
            table.items-table tr:nth-child(even) td {
              background: #f8fafc;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
            .font-bold { font-weight: bold; }
            .font-black { font-weight: 900; }
            .totals-box {
              float: right;
              width: 280px;
              border: 1px solid #0f172a;
              border-radius: 6px;
              padding: 8px 12px;
              background: #f8fafc;
              margin-bottom: 15px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 2px 0;
              font-size: 11px;
            }
            .totals-final {
              border-top: 1.5px solid #0f172a;
              margin-top: 4px;
              padding-top: 4px;
              font-size: 14px;
              font-weight: 900;
            }
            .clear { clear: both; }
            .qr-auth-box {
              border: 1px dashed #64748b;
              border-radius: 6px;
              padding: 8px;
              display: flex;
              align-items: center;
              gap: 12px;
              background: #fff;
              margin-top: 10px;
            }
            .legal-footer {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px solid #e2e8f0;
              font-size: 9px;
              color: #64748b;
              text-align: center;
              line-height: 1.3;
            }
            .sig-table {
              width: 100%;
              margin-top: 30px;
            }
            .sig-line {
              border-top: 1px solid #475569;
              width: 80%;
              margin: 0 auto;
              text-align: center;
              padding-top: 4px;
              font-size: 10px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Envio por WhatsApp
  const handleSendWhatsApp = () => {
    const rawTel = (pedido.cliente_telefone || '').replace(/\D/g, '');
    const num = rawTel.length >= 10 ? (rawTel.startsWith('55') ? rawTel : `55${rawTel}`) : '';

    const itensTexto = pedido.itens
      .map(i => `• ${i.quantidade}x ${i.nome} - R$ ${i.subtotal.toFixed(2)}`)
      .join('\n');

    const msg = `🧾 *${docType === 'nota_fiscal' ? 'DOCUMENTO / RECIBO DE COMPRA' : 'PEDIDO DE COMPRA'} - ${churchName.toUpperCase()}*\n\n` +
      `Olá, *${pedido.cliente_nome}*!\n` +
      `Segue a confirmação do seu pedido na Livraria e Loja da Igreja:\n\n` +
      `📌 *Número do Pedido:* #${pedido.numero_pedido}\n` +
      `📅 *Data da Compra:* ${dataEmissao}\n` +
      `💳 *Forma de Pagamento:* ${pedido.forma_pagamento.toUpperCase()}\n` +
      `✅ *Status do Pagamento:* ${pedido.status_pagamento === 'pago' ? 'PAGO / CONFIRMADO' : 'PENDENTE NA RETIRADA'}\n` +
      `📦 *Status da Entrega:* ${pedido.status_entrega.toUpperCase()}\n` +
      `📍 *Local de Retirada:* ${pedido.local_retirada}\n\n` +
      `🛒 *Itens Adquiridos:*\n${itensTexto}\n\n` +
      `💰 *VALOR TOTAL:* R$ ${pedido.valor_total.toFixed(2)}\n\n` +
      `🔑 *Chave de Autenticação:* ${chaveAcesso}\n\n` +
      `Você também pode visualizar este documento no seu Portal de Membro.\n` +
      `Que Deus abençoe ricamente! 🙏`;

    const url = num
      ? `https://api.whatsapp.com/send?phone=${num}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank');
  };

  // Envio por E-mail
  const handleSendEmail = () => {
    const recipient = pedido.cliente_email || '';
    const subject = encodeURIComponent(`${docType === 'nota_fiscal' ? 'Nota / Recibo de Compra' : 'Pedido de Compra'} #${pedido.numero_pedido} - ${churchName}`);
    
    const itensTexto = pedido.itens
      .map(i => `${i.quantidade}x ${i.nome} - R$ ${i.subtotal.toFixed(2)}`)
      .join('\n');

    const body = encodeURIComponent(
      `Prezado(a) ${pedido.cliente_nome},\n\n` +
      `Agradecemos pela sua compra na Loja da ${churchName}.\n\n` +
      `DETALHES DO PEDIDO:\n` +
      `Número: #${pedido.numero_pedido}\n` +
      `Data: ${dataEmissao}\n` +
      `Status do Pagamento: ${pedido.status_pagamento.toUpperCase()}\n` +
      `Local de Retirada: ${pedido.local_retirada}\n\n` +
      `ITENS:\n${itensTexto}\n\n` +
      `TOTAL: R$ ${pedido.valor_total.toFixed(2)}\n` +
      `CHAVE DIGITAL: ${chaveAcesso}\n\n` +
      `Atenciosamente,\n` +
      `${churchName}\n` +
      `Secretaria e Loja Virtual`
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(chaveAcesso);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return createPortal(
    <InteractiveWindow
      id={`loja_documento_fiscal_${pedido.id || pedido.numero_pedido}`}
      title={docType === 'nota_fiscal' ? `Documento Fiscal / Recibo: Pedido #${pedido.numero_pedido}` : `Pedido de Compra: #${pedido.numero_pedido}`}
      subtitle={`${churchName} • ${pedido.cliente_nome}`}
      icon={FileText}
      headerBg="from-slate-900 via-indigo-950 to-slate-900"
      onClose={onClose}
      defaultWidth={880}
      defaultHeight={820}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Seletor de Tipo de Documento */}
            {(!isMemberPortal || pedido.status_pagamento === 'pago') ? (
              <div className="inline-flex rounded-xl bg-slate-150 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setDocType('nota_fiscal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    docType === 'nota_fiscal'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60'
                  }`}
                >
                  Nota Fiscal / Recibo
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('pedido_compra')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    docType === 'pedido_compra'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60'
                  }`}
                >
                  Pedido de Compra
                </button>
              </div>
            ) : (
              <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Printer size={14} className="text-indigo-600" />
                <span>Pedido de Compra Oficial</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Enviar comprovante formatado via WhatsApp"
            >
              <MessageCircle size={15} /> WhatsApp
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Enviar comprovante por e-mail"
            >
              <Mail size={15} /> E-mail
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Printer size={16} /> Imprimir / PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 rounded-xl cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* BARRA DE FERRAMENTAS SUPERIOR / STATUS */}
        <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-slate-50 dark:from-slate-800/80 dark:to-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
              <FileText size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-800 dark:text-white">
                  {docType === 'nota_fiscal' ? 'Documento Auxiliar de Venda (DAV / Recibo Oficial)' : 'Guia Oficial do Pedido de Compra'}
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  pedido.status_pagamento === 'pago'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                }`}>
                  {pedido.status_pagamento === 'pago' ? '✅ Pago & Quitado' : '⏳ Pagamento Pendente'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Chave de Controle: {chaveAcesso.slice(0, 20)}...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyKey}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Copiar chave completa de autenticação"
            >
              {copiedKey ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedKey ? 'Chave Copiada!' : 'Copiar Chave'}</span>
            </button>
          </div>
        </div>

        {/* ALERTA DE LIBERAÇÃO DE NOTA FISCAL APÓS CONFIRMAÇÃO DE PAGAMENTO */}
        {isMemberPortal && pedido.status_pagamento !== 'pago' && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Nota Fiscal Quitada em Processamento</strong>
              <span>
                Este documento é a sua <strong>Guia Oficial de Pedido de Compra</strong>. A <strong>Nota Fiscal / Recibo Quitado</strong> será disponibilizada automaticamente no seu portal assim que a loja da igreja confirmar o recebimento do pagamento.
              </span>
            </div>
          </div>
        )}

        {/* CONTAINER DO DOCUMENTO FISCAL (RENDERIZÁVEL E IMPRIMÍVEL) */}
        <div className="bg-white text-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm font-sans" ref={printAreaRef}>
          {/* CABEÇALHO TIMBRADO DA IGREJA */}
          <table className="w-full border-b-2 border-slate-900 pb-3 mb-4 header-table">
            <tbody>
              <tr>
                <td className="w-16 align-top pr-4">
                  {churchLogo ? (
                    <img 
                      src={churchLogo} 
                      alt="Logo Igreja" 
                      className="w-14 h-14 object-contain rounded-lg border border-slate-200 p-0.5" 
                    />
                  ) : (
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                      <Building2 size={26} />
                    </div>
                  )}
                </td>
                <td className="align-top">
                  <h2 className="text-base font-black uppercase text-slate-900 leading-tight">
                    {churchName}
                  </h2>
                  <p className="text-[11px] text-slate-600 font-bold mt-0.5">
                    CNPJ: <span className="font-mono text-slate-900 font-black">{churchCnpj}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    {churchAddress} • {churchCity}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Contato: {churchPhone} • {churchEmail}
                  </p>
                </td>
                <td className="w-64 text-right align-top pl-4">
                  <div className="border-2 border-slate-900 rounded-xl p-2.5 bg-slate-50 text-right">
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 block">
                      {docType === 'nota_fiscal' ? 'DOCUMENTO AUXILIAR DE VENDA' : 'PEDIDO OFICIAL DE COMPRA'}
                    </span>
                    <span className="text-sm font-black font-mono text-slate-900 block">
                      Nº {pedido.numero_pedido}
                    </span>
                    <span className="text-[9px] text-slate-500 block font-mono">
                      SÉRIE: 001 • FOLHA: 1/1
                    </span>
                    <div className="mt-1 pt-1 border-t border-slate-200">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        pedido.status_pagamento === 'pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {pedido.status_pagamento === 'pago' ? 'QUITADO / PAGO' : 'PAGAMENTO PENDENTE'}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* CHAVE DE ACESSO & PROTOCOLO */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg mb-3 flex flex-col md:flex-row md:items-center justify-between text-[10px] gap-2">
            <div>
              <span className="font-black uppercase text-slate-500 block text-[9px]">Chave de Acesso / Código de Autenticação Digital</span>
              <span className="font-mono font-bold text-slate-900 tracking-wider break-all">{chaveFormatada}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-black uppercase text-slate-500 block text-[9px]">Data / Hora de Emissão</span>
              <span className="font-bold text-slate-900">{dataEmissao}</span>
            </div>
          </div>

          {/* DADOS DO COMPRADOR / DESTINATÁRIO */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 mb-3 space-y-2">
            <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <User size={13} className="text-indigo-600" />
                Destinatário / Comprador
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Perfil: <strong className="text-slate-800">{pedido.tipo_cliente === 'membro' ? 'Membro da Igreja' : 'Visitante / Externo'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Nome / Razão Social:</span>
                <strong className="text-slate-900 text-xs block">{pedido.cliente_nome}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">CPF / Documento:</span>
                <span className="font-mono font-bold text-slate-900">{pedido.cliente_cpf || 'Não informado / Isento'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">WhatsApp / Telefone:</span>
                <span className="font-bold text-slate-900">{pedido.cliente_telefone}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1 border-t border-slate-200/60">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Local Indicado para Retirada / Entrega:</span>
                <strong className="text-indigo-900 font-bold">{pedido.local_retirada}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">E-mail do Cliente:</span>
                <span className="text-slate-700">{pedido.cliente_email || 'Não informado'}</span>
              </div>
            </div>

            {pedido.observacoes && (
              <div className="pt-1 border-t border-slate-200/60 text-[10px] text-slate-600">
                <strong className="text-slate-700">Observações do Comprador:</strong> {pedido.observacoes}
              </div>
            )}
          </div>

          {/* TABELA DE PRODUTOS / ITENS */}
          <div className="mb-3">
            <div className="border-b border-slate-200 pb-1 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <ShoppingBag size={13} className="text-indigo-600" />
                Dados dos Produtos / Itens Adquiridos
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                {pedido.itens.length} {pedido.itens.length === 1 ? 'item' : 'itens'} • {totalQtdItens} volumes
              </span>
            </div>

            <table className="w-full border-collapse items-table text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[9px] uppercase">
                  <th className="p-2 border border-slate-900 w-10 text-center">#</th>
                  <th className="p-2 border border-slate-900 w-24">Código/SKU</th>
                  <th className="p-2 border border-slate-900">Descrição do Produto / Obra</th>
                  <th className="p-2 border border-slate-900 w-16 text-center">Qtd.</th>
                  <th className="p-2 border border-slate-900 w-24 text-right">Vlr. Unit. (R$)</th>
                  <th className="p-2 border border-slate-900 w-24 text-right">Subtotal (R$)</th>
                </tr>
              </thead>
              <tbody className="text-[10px]">
                {pedido.itens.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="p-2 border border-slate-200 text-center font-mono font-bold text-slate-400">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="p-2 border border-slate-200 font-mono text-slate-600">
                      {item.produto_id.toUpperCase().slice(0, 10)}
                    </td>
                    <td className="p-2 border border-slate-200">
                      <strong className="text-slate-900 block">{item.nome}</strong>
                    </td>
                    <td className="p-2 border border-slate-200 text-center font-bold">
                      {item.quantidade}
                    </td>
                    <td className="p-2 border border-slate-200 text-right font-mono">
                      {item.preco_unitario.toFixed(2)}
                    </td>
                    <td className="p-2 border border-slate-200 text-right font-mono font-bold text-slate-900">
                      {item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALIZADORES E FORMA DE PAGAMENTO */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
            {/* Informações de Pagamento */}
            <div className="flex-1 border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2 text-[10px]">
              <span className="text-[9px] font-black uppercase text-slate-500 block border-b border-slate-200 pb-1">
                Condições de Pagamento & Liquidação
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Meio de Pagamento:</span>
                  <strong className="uppercase text-slate-900">
                    {pedido.forma_pagamento === 'pix' ? 'PIX Instantâneo' :
                     pedido.forma_pagamento === 'cartao_retirada' ? 'Cartão de Débito/Crédito' :
                     'Dinheiro na Retirada'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Situação da Conta:</span>
                  <strong className={pedido.status_pagamento === 'pago' ? 'text-emerald-700 font-black' : 'text-amber-700 font-black'}>
                    {pedido.status_pagamento === 'pago' ? 'QUITADO NO SISTEMA' : 'AGUARDANDO PAGAMENTO'}
                  </strong>
                </div>
              </div>
              {pedido.data_pagamento_confirmado && (
                <p className="text-[9px] text-slate-500 font-mono">
                  Quitação confirmada em: {new Date(pedido.data_pagamento_confirmado).toLocaleString('pt-BR')}
                  {pedido.responsavel_pagamento ? ` (Operador: ${pedido.responsavel_pagamento})` : ''}
                </p>
              )}
            </div>

            {/* Quadro de Valores Totais */}
            <div className="w-full sm:w-72 border-2 border-slate-900 rounded-lg p-3 bg-slate-50 space-y-1.5 text-xs shrink-0">
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Subtotal dos Produtos:</span>
                <span className="font-mono font-bold">R$ {pedido.valor_total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Taxa de Entrega / Balcão:</span>
                <span className="text-emerald-700 font-bold">R$ 0,00 (Grátis)</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Descontos Aplicados:</span>
                <span className="font-mono">R$ 0,00</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                <span>VALOR TOTAL:</span>
                <span className="font-mono text-base text-emerald-800 font-black">
                  R$ {pedido.valor_total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* QR CODE DE VALIDAÇÃO E AUTENTICIDADE */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white flex flex-col sm:flex-row items-center gap-4 text-xs">
            <img
              src={qrValidationUrl}
              alt="QR Code de Validação"
              className="w-20 h-20 object-contain border border-slate-200 rounded-lg p-1 bg-white shrink-0"
            />
            <div className="space-y-1 text-slate-600 text-[10px]">
              <strong className="text-slate-900 block uppercase text-[11px]">
                Autenticidade e Verificação Digital da Igreja
              </strong>
              <p className="leading-relaxed">
                Este documento pode ser conferido a qualquer momento apontando a câmera do celular para o QR Code acima ou consultando o número <strong>#{pedido.numero_pedido}</strong> no Portal do Membro.
              </p>
              <p className="text-[9px] text-slate-400 font-mono">
                Hash de Segurança: {chaveAcesso}
              </p>
            </div>
          </div>

          {/* RODAPÉ LEGAL / IMUNIDADE TRIBUTÁRIA / ASSINATURAS */}
          <div className="mt-4 pt-3 border-t border-slate-200 text-center space-y-2 text-[9px] text-slate-500">
            <p className="leading-tight">
              <strong>Imunidade Constitucional e Tributária:</strong> Venda de artigos religiosos, literaturas e materiais eclesiásticos sem fins lucrativos, com resultado financeiro integralmente revertido na manutenção do templo, atividades de assistência social e expansão do Evangelho (Art. 150, Inciso VI, Alínea 'b' da Constituição Federal do Brasil).
            </p>
            <p className="text-[8px] text-slate-400">
              Sistema GIPP Eclesiástico • Loja Virtual & Livraria Integrada • Impresso em {new Date().toLocaleString('pt-BR')}
            </p>
          </div>

          {/* LINHAS DE ASSINATURA EM CASO DE RETIRADA FÍSICA NO TEMPLO */}
          <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-dashed border-slate-300 text-center text-[10px]">
            <div>
              <div className="border-t border-slate-800 pt-1.5 font-bold text-slate-800">
                Responsável pelo Balcão / Loja da Igreja
              </div>
              <span className="text-[9px] text-slate-400">Assinatura / Visto de Conferência</span>
            </div>
            <div>
              <div className="border-t border-slate-800 pt-1.5 font-bold text-slate-800">
                {pedido.cliente_nome}
              </div>
              <span className="text-[9px] text-slate-400">Assinatura do Membro / Comprador</span>
            </div>
          </div>
        </div>
      </div>
    </InteractiveWindow>,
    document.body
  );
}
