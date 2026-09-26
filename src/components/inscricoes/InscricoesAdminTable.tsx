import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Filter, Download, Plus, Trash2, Edit3, 
  CheckCircle, XCircle, Clock, DollarSign, QrCode, Printer, 
  FileSpreadsheet, FileText, ChevronDown, Check, X, Phone, Mail,
  Calendar, Eye
} from 'lucide-react';
import { 
  EventoItem, InscricaoItem, StatusInscricao, StatusPagamento,
  generateEventCheckinToken 
} from '../../data/eventosInscricoesData';

interface InscricoesAdminTableProps {
  inscricoes: InscricaoItem[];
  eventos: EventoItem[];
  membros: any[];
  selectedEventoFilter?: string;
  onSelectEventoFilter: (eventoId: string) => void;
  onSaveInscricao: (inscricao: InscricaoItem) => void;
  onDeleteInscricao: (inscricaoId: string) => void;
  onTogglePagamento: (inscricaoId: string) => void;
  onTogglePresenca: (inscricaoId: string) => void;
  onOpenQrModal: (inscricao: InscricaoItem) => void;
}

export const InscricoesAdminTable: React.FC<InscricoesAdminTableProps> = ({
  inscricoes,
  eventos,
  membros,
  selectedEventoFilter,
  onSelectEventoFilter,
  onSaveInscricao,
  onDeleteInscricao,
  onTogglePagamento,
  onTogglePresenca,
  onOpenQrModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [pagamentoFilter, setPagamentoFilter] = useState<string>('todos');
  const [presencaFilter, setPresencaFilter] = useState<string>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInscricao, setEditingInscricao] = useState<InscricaoItem | null>(null);

  // Form states for manual registration
  const [eventoId, setEventoId] = useState('');
  const [membroId, setMembroId] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [tipoParticipante, setTipoParticipante] = useState<'membro' | 'visitante' | 'convidado'>('membro');
  const [status, setStatus] = useState<StatusInscricao>('confirmado');
  const [statusPagamento, setStatusPagamento] = useState<StatusPagamento>('pago');
  const [valorPago, setValorPago] = useState<number>(0);
  const [formaPagamento, setFormaPagamento] = useState<'pix' | 'cartao' | 'dinheiro' | 'isento'>('pix');
  const [observacoes, setObservacoes] = useState('');

  const activeEvento = useMemo(() => {
    return eventos.find((e) => e.id === selectedEventoFilter);
  }, [eventos, selectedEventoFilter]);

  const openCreateModal = () => {
    setEditingInscricao(null);
    setEventoId(selectedEventoFilter && selectedEventoFilter !== 'todos' ? selectedEventoFilter : eventos[0]?.id || '');
    setMembroId('');
    setNome('');
    setEmail('');
    setTelefone('');
    setCpf('');
    setTipoParticipante('membro');
    setStatus('confirmado');
    const evt = eventos.find((e) => e.id === (selectedEventoFilter || eventos[0]?.id));
    if (evt && evt.valorInscricao > 0) {
      setStatusPagamento('nao_pago');
      setValorPago(evt.valorInscricao);
      setFormaPagamento('pix');
    } else {
      setStatusPagamento('isento');
      setValorPago(0);
      setFormaPagamento('isento');
    }
    setObservacoes('');
    setModalOpen(true);
  };

  const openEditModal = (ins: InscricaoItem) => {
    setEditingInscricao(ins);
    setEventoId(ins.eventoId);
    setMembroId(ins.membroId || '');
    setNome(ins.nome);
    setEmail(ins.email);
    setTelefone(ins.telefone);
    setCpf(ins.cpf || '');
    setTipoParticipante(ins.tipoParticipante);
    setStatus(ins.status);
    setStatusPagamento(ins.statusPagamento);
    setValorPago(ins.valorPago || 0);
    setFormaPagamento(ins.formaPagamento || 'pix');
    setObservacoes(ins.observacoes || '');
    setModalOpen(true);
  };

  const handleSelectMembro = (mId: string) => {
    setMembroId(mId);
    if (!mId) return;
    const found = membros.find((m) => String(m.id) === String(mId));
    if (found) {
      setNome(found.nome || '');
      setEmail(found.email || '');
      setTelefone(found.telefone || found.celular || found.whatsapp || '');
      setCpf(found.cpf || '');
      setTipoParticipante('membro');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !eventoId) return;

    const insId = editingInscricao ? editingInscricao.id : `ins_${Date.now()}`;
    const token = editingInscricao?.qrCodeToken || generateEventCheckinToken(eventoId, insId);

    const payload: InscricaoItem = {
      id: insId,
      eventoId,
      membroId: membroId || undefined,
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      cpf: cpf.trim() || undefined,
      tipoParticipante,
      dataInscricao: editingInscricao ? editingInscricao.dataInscricao : new Date().toISOString(),
      status,
      statusPagamento,
      valorPago: Number(valorPago) || 0,
      formaPagamento,
      qrCodeToken: token,
      presente: editingInscricao ? editingInscricao.presente : false,
      checkInEm: editingInscricao ? editingInscricao.checkInEm : undefined,
      observacoes: observacoes.trim() || undefined,
    };

    onSaveInscricao(payload);
    setModalOpen(false);
  };

  // Filter list
  const filteredInscricoes = inscricoes.filter((ins) => {
    const matchesSearch = 
      ins.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.telefone.includes(searchTerm) ||
      (ins.cpf && ins.cpf.includes(searchTerm)) ||
      ins.qrCodeToken.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvento = !selectedEventoFilter || selectedEventoFilter === 'todos' || ins.eventoId === selectedEventoFilter;
    const matchesStatus = statusFilter === 'todos' || ins.status === statusFilter;
    const matchesPagamento = pagamentoFilter === 'todos' || ins.statusPagamento === pagamentoFilter;
    const matchesPresenca = 
      presencaFilter === 'todos' || 
      (presencaFilter === 'presente' && ins.presente) || 
      (presencaFilter === 'ausente' && !ins.presente);

    return matchesSearch && matchesEvento && matchesStatus && matchesPagamento && matchesPresenca;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Nome', 'Evento', 'E-mail', 'Telefone', 'CPF', 'Status', 'Pagamento', 'Valor Pago', 'Presença', 'Horário Check-in', 'Código Check-in'];
    const rows = filteredInscricoes.map((ins) => {
      const ev = eventos.find((e) => e.id === ins.eventoId);
      return [
        `"${ins.nome}"`,
        `"${ev ? ev.nome : ins.eventoId}"`,
        `"${ins.email || ''}"`,
        `"${ins.telefone || ''}"`,
        `"${ins.cpf || ''}"`,
        `"${ins.status}"`,
        `"${ins.statusPagamento}"`,
        `"${ins.valorPago || 0}"`,
        `"${ins.presente ? 'PRESENTE' : 'AUSENTE'}"`,
        `"${ins.checkInEm ? new Date(ins.checkInEm).toLocaleTimeString('pt-BR') : ''}"`,
        `"${ins.qrCodeToken}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_inscricoes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Print/PDF
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Inscritos e Presença</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 25px; color: #1e293b; }
          h1 { margin-bottom: 4px; font-size: 20px; font-weight: 800; color: #0f172a; }
          p { margin-top: 0; font-size: 13px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background-color: #f1f5f9; text-align: left; padding: 8px 10px; border-bottom: 2px solid #cbd5e1; font-weight: 700; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .badge-presente { background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          .badge-ausente { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          .badge-pago { background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          .footer { margin-top: 30px; font-size: 11px; text-align: right; color: #94a3b8; }
        </style>
      </head>
      <body>
        <h1>Relatório Oficial de Inscritos no Evento</h1>
        <p>Evento: <strong>${activeEvento ? activeEvento.nome : 'Todos os Eventos'}</strong> | Emitido em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        <p>Total de Registros: <strong>${filteredInscricoes.length}</strong> | Presentes: <strong>${filteredInscricoes.filter(i => i.presente).length}</strong> | Ausentes: <strong>${filteredInscricoes.filter(i => !i.presente).length}</strong></p>
        
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nome do Inscrito</th>
              <th>Contato</th>
              <th>Status</th>
              <th>Pagamento</th>
              <th>Presença</th>
              <th>Horário</th>
              <th>Código QR</th>
            </tr>
          </thead>
          <tbody>
            ${filteredInscricoes.map((ins, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${ins.nome}</strong></td>
                <td>${ins.telefone || ins.email || '---'}</td>
                <td>${ins.status.toUpperCase()}</td>
                <td><span class="badge-pago">${ins.statusPagamento.toUpperCase()}</span></td>
                <td><span class="${ins.presente ? 'badge-presente' : 'badge-ausente'}">${ins.presente ? 'PRESENTE' : 'AUSENTE'}</span></td>
                <td>${ins.checkInEm ? new Date(ins.checkInEm).toLocaleTimeString('pt-BR') : '---'}</td>
                <td style="font-family: monospace; font-size: 10px;">${ins.qrCodeToken}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">Sistema GIPP - Gestão Integrada Pastoral & Eclesiástica</div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por nome, email, tel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
          </div>

          {/* Event Filter */}
          <select
            value={selectedEventoFilter || 'todos'}
            onChange={(e) => onSelectEventoFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 truncate"
          >
            <option value="todos">Todos os Eventos ({eventos.length})</option>
            {eventos.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.nome}
              </option>
            ))}
          </select>

          {/* Pagamento Filter */}
          <select
            value={pagamentoFilter}
            onChange={(e) => setPagamentoFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          >
            <option value="todos">Todos os Pagamentos</option>
            <option value="pago">Pago</option>
            <option value="nao_pago">Não Pago</option>
            <option value="isento">Isento</option>
          </select>

          {/* Presença Filter */}
          <select
            value={presencaFilter}
            onChange={(e) => setPresencaFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          >
            <option value="todos">Todas as Presenças</option>
            <option value="presente">Apenas Presentes</option>
            <option value="ausente">Apenas Ausentes</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Exportar para Excel / Planilha CSV"
          >
            <FileSpreadsheet size={16} />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-violet-500/20 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>Nova Inscrição</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inscritos Totais</p>
            <p className="text-xl font-black text-slate-800">{filteredInscricoes.length}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Presentes (Check-in)</p>
            <p className="text-xl font-black text-emerald-600">
              {filteredInscricoes.filter((i) => i.presente).length}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle size={18} />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pagamentos Confirmados</p>
            <p className="text-xl font-black text-indigo-600">
              {filteredInscricoes.filter((i) => i.statusPagamento === 'pago' || i.statusPagamento === 'isento').length}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aguardando Pagamento</p>
            <p className="text-xl font-black text-amber-600">
              {filteredInscricoes.filter((i) => i.statusPagamento === 'nao_pago').length}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Table of Registrations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Participante / Membro</th>
                <th className="py-3 px-4">Evento</th>
                <th className="py-3 px-4">Contato (WhatsApp / E-mail)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Pagamento</th>
                <th className="py-3 px-4 text-center">Presença</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInscricoes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhuma inscrição localizada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredInscricoes.map((ins) => {
                  const evt = eventos.find((e) => e.id === ins.eventoId);
                  return (
                    <tr key={ins.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Nome */}
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold uppercase text-xs shrink-0">
                            {ins.nome.slice(0, 2)}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-800">{ins.nome}</span>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                              <span className="uppercase">{ins.tipoParticipante}</span>
                              {ins.cpf && <span>• CPF: {ins.cpf}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Evento */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        <span className="line-clamp-1 max-w-[200px]" title={evt?.nome}>
                          {evt?.nome || 'Evento'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {evt?.dataInicio ? new Date(evt.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
                        </span>
                      </td>

                      {/* Contato */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="space-y-0.5">
                          {ins.telefone && (
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                              <Phone size={12} className="text-emerald-500 shrink-0" />
                              <span>{ins.telefone}</span>
                            </div>
                          )}
                          {ins.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <Mail size={12} className="text-blue-500 shrink-0" />
                              <span className="truncate max-w-[160px]">{ins.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            ins.status === 'confirmado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ins.status === 'pendente'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ins.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Pagamento Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onTogglePagamento(ins.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all hover:scale-105 ${
                            ins.statusPagamento === 'pago'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : ins.statusPagamento === 'isento'
                              ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                          title="Clique para alternar o status do pagamento"
                        >
                          {ins.statusPagamento === 'pago' ? (
                            <>
                              <Check size={12} />
                              <span>PAGO</span>
                            </>
                          ) : ins.statusPagamento === 'isento' ? (
                            <>
                              <Check size={12} />
                              <span>ISENTO</span>
                            </>
                          ) : (
                            <>
                              <X size={12} />
                              <span>NÃO PAGO</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Presença Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onTogglePresenca(ins.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all hover:scale-105 ${
                            ins.presente
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Clique para alternar presença (Check-in)"
                        >
                          {ins.presente ? (
                            <>
                              <CheckCircle size={12} />
                              <span>PRESENTE</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              <span>AUSENTE</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenQrModal(ins)}
                            className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                            title="Ver Credencial / QR Code"
                          >
                            <QrCode size={16} />
                          </button>

                          <button
                            onClick={() => openEditModal(ins)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar dados"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() => onDeleteInscricao(ins.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Excluir inscrição"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova / Editar Inscrição */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingInscricao ? 'Editar Inscrição' : 'Cadastrar Inscrição Manual'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inscreva um membro já cadastrado ou registre um participante avulso.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-4">
              {/* Evento */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Evento Alvo *
                </label>
                <select
                  required
                  value={eventoId}
                  onChange={(e) => setEventoId(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                >
                  {eventos.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.nome} ({evt.valorInscricao === 0 ? 'Gratuito' : `R$ ${evt.valorInscricao.toFixed(2)}`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Puxar do Cadastro de Membros */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Importar do Cadastro de Membros (Opcional)
                </label>
                <select
                  value={membroId}
                  onChange={(e) => handleSelectMembro(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                >
                  <option value="">-- Selecionar Membro Cadastrado --</option>
                  {membros.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} {m.cargo ? `(${m.cargo})` : ''} - {m.telefone || m.email || ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nome & Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome do participante"
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tipo
                  </label>
                  <select
                    value={tipoParticipante}
                    onChange={(e) => setTipoParticipante(e.target.value as any)}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  >
                    <option value="membro">Membro</option>
                    <option value="visitante">Visitante</option>
                    <option value="convidado">Convidado</option>
                  </select>
                </div>
              </div>

              {/* Contatos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 90000-0000"
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Pagamento e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status da Inscrição
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusInscricao)}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="confirmado">Confirmado</option>
                    <option value="pendente">Pendente</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="lista_espera">Lista de Espera</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Pagamento
                  </label>
                  <select
                    value={statusPagamento}
                    onChange={(e) => setStatusPagamento(e.target.value as StatusPagamento)}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="pago">Pago</option>
                    <option value="nao_pago">Não Pago</option>
                    <option value="isento">Isento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Valor Pago (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={valorPago}
                    onChange={(e) => setValorPago(Number(e.target.value))}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-500/20 active:scale-95 transition-all"
                >
                  {editingInscricao ? 'Salvar Inscrição' : 'Confirmar Inscrição'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
