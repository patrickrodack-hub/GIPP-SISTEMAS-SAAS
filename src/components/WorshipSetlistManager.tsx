import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, Calendar, Clock, Music, Users, Sparkles, Mic, Edit, Trash2, 
  Share2, Printer, Play, CheckCircle2, Clock3, AlertCircle, 
  ArrowUp, ArrowDown, ChevronRight, Search, FileText, Check, Copy, X,
  Save, List, Layers, ShieldCheck, HeartHandshake, UserCheck
} from 'lucide-react';
import { 
  SetlistCulto, SetlistMusicaItem, SetlistMusicoEscalado, 
  MusicaRepertorio, MOMENTOS_LITURGICOS, FUNCOES_LOUVOR, 
  TIPOS_CULTO_PADRAO 
} from '../data/repertorioData';
import { WorshipLiveReader } from './WorshipLiveReader';
import { InteractiveWindow } from './InteractiveWindow';
import { Button, FormInput, FormSelect } from '../utils/sharedHelpers';

interface WorshipSetlistManagerProps {
  setlists: SetlistCulto[];
  musicas: MusicaRepertorio[];
  musicosCadastrados: any[];
  membrosIgreja: any[];
  onSaveSetlist: (setlist: SetlistCulto) => Promise<void>;
  onDeleteSetlist: (id: string) => Promise<void>;
  addToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const WorshipSetlistManager: React.FC<WorshipSetlistManagerProps> = ({
  setlists,
  musicas,
  musicosCadastrados,
  membrosIgreja,
  onSaveSetlist,
  onDeleteSetlist,
  addToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [activeLiveSetlist, setActiveLiveSetlist] = useState<SetlistCulto | null>(null);
  const [editingSetlistId, setEditingSetlistId] = useState<string | null>(null);
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);
  const [viewDetailSetlist, setViewDetailSetlist] = useState<SetlistCulto | null>(null);
  const [formTab, setFormTab] = useState<'geral' | 'equipe' | 'setlist' | 'todas'>('todas');

  // Form State
  const [formData, setFormData] = useState<Partial<SetlistCulto>>({
    titulo: '',
    data: new Date().toISOString().split('T')[0],
    horario: '19:00',
    tipo_culto: TIPOS_CULTO_PADRAO[0],
    tema_devocional: '',
    lider_nome: '',
    equipe_escalada: [],
    itens: [],
    observacoes_gerais: '',
    tempo_total_estimado: 0
  });

  // Temporary selectors for adding song or musician to current form
  const [selectedCatalogSongId, setSelectedCatalogSongId] = useState('');
  const [selectedMembroId, setSelectedMembroId] = useState('');
  const [selectedFuncao, setSelectedFuncao] = useState(FUNCOES_LOUVOR[0]);

  // Recalculate total estimated time
  const calculateTotalMinutes = (items: SetlistMusicaItem[]) => {
    return items.reduce((acc, item) => acc + (Number(item.duracao_minutos) || 5), 0);
  };

  const handleOpenNew = () => {
    setEditingSetlistId(null);
    setFormTab('todas');
    setFormData({
      titulo: 'Culto de Celebração e Louvor Congregacional',
      data: new Date().toISOString().split('T')[0],
      horario: '19:00',
      tipo_culto: TIPOS_CULTO_PADRAO[0],
      tema_devocional: '',
      lider_nome: '',
      equipe_escalada: [],
      itens: [],
      observacoes_gerais: 'Chegada para passagem de som 45 minutos antes do culto.',
      tempo_total_estimado: 0
    });
    setShowEditorModal(true);
  };

  const handleOpenEdit = (sl: SetlistCulto) => {
    setEditingSetlistId(sl.id);
    setFormTab('todas');
    setFormData({
      ...sl,
      equipe_escalada: [...(sl.equipe_escalada || [])],
      itens: [...(sl.itens || [])]
    });
    setShowEditorModal(true);
  };

  // Add song to current setlist form
  const handleAddSongToSetlist = () => {
    if (!selectedCatalogSongId) {
      addToast('Selecione uma música do repertório.', 'warning');
      return;
    }

    const song = musicas.find(m => m.id === selectedCatalogSongId);
    if (!song) return;

    const currentItems = formData.itens || [];
    const newItem: SetlistMusicaItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ordem: currentItems.length + 1,
      musica_id: song.id,
      titulo: song.titulo,
      artista: song.artista || 'Consagrado',
      tom_original: song.tom || 'G',
      tom_culto: song.tom || 'G',
      ministro_vocal: formData.lider_nome || '',
      bpm: song.bpm || '72',
      ritmo: song.ritmo || 'Worship',
      momento_liturgico: currentItems.length === 0 ? 'Júbilo / Celebração' : 'Adoração / Ministração',
      notas_arranjo: '',
      duracao_minutos: 5
    };

    const updated = [...currentItems, newItem];
    setFormData(prev => ({
      ...prev,
      itens: updated,
      tempo_total_estimado: calculateTotalMinutes(updated)
    }));
    setSelectedCatalogSongId('');
  };

  // Move song up/down in setlist
  const handleMoveSong = (index: number, direction: 'up' | 'down') => {
    const items = [...(formData.itens || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    // renumber ordens
    const reordered = items.map((it, idx) => ({ ...it, ordem: idx + 1 }));
    setFormData(prev => ({ ...prev, itens: reordered }));
  };

  const handleRemoveSong = (id: string) => {
    const filtered = (formData.itens || []).filter(it => it.id !== id);
    const reordered = filtered.map((it, idx) => ({ ...it, ordem: idx + 1 }));
    setFormData(prev => ({
      ...prev,
      itens: reordered,
      tempo_total_estimado: calculateTotalMinutes(reordered)
    }));
  };

  const handleUpdateSongItem = (id: string, field: keyof SetlistMusicaItem, value: any) => {
    const updated = (formData.itens || []).map(it => {
      if (it.id === id) {
        return { ...it, [field]: value };
      }
      return it;
    });
    setFormData(prev => ({
      ...prev,
      itens: updated,
      tempo_total_estimado: calculateTotalMinutes(updated)
    }));
  };

  // Add musician to current setlist
  const handleAddMusician = () => {
    if (!selectedMembroId) {
      addToast('Selecione um integrante para escalar.', 'warning');
      return;
    }

    const membro = membrosIgreja.find(m => m.id === selectedMembroId);
    const nome = membro?.nome || 'Membro';

    const newMusico: SetlistMusicoEscalado = {
      membro_id: selectedMembroId,
      nome,
      funcao: selectedFuncao,
      status: 'pendente'
    };

    setFormData(prev => ({
      ...prev,
      equipe_escalada: [...(prev.equipe_escalada || []), newMusico]
    }));
    setSelectedMembroId('');
  };

  const handleRemoveMusician = (index: number) => {
    const updated = [...(formData.equipe_escalada || [])];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, equipe_escalada: updated }));
  };

  const handleMusicianStatusChange = (index: number, status: 'confirmado' | 'pendente' | 'indisponivel') => {
    const updated = [...(formData.equipe_escalada || [])];
    updated[index] = { ...updated[index], status };
    setFormData(prev => ({ ...prev, equipe_escalada: updated }));
  };

  // Save full setlist
  const handleSave = async () => {
    if (!formData.titulo?.trim()) {
      addToast('Digite o título do culto.', 'warning');
      return;
    }
    if (!formData.data) {
      addToast('Selecione a data do culto.', 'warning');
      return;
    }

    const targetId = editingSetlistId || `setlist_${Date.now()}`;
    const payload: SetlistCulto = {
      id: targetId,
      titulo: formData.titulo.trim(),
      data: formData.data,
      horario: formData.horario || '19:00',
      tipo_culto: formData.tipo_culto || TIPOS_CULTO_PADRAO[0],
      tema_devocional: formData.tema_devocional || '',
      lider_nome: formData.lider_nome || '',
      equipe_escalada: formData.equipe_escalada || [],
      itens: formData.itens || [],
      observacoes_gerais: formData.observacoes_gerais || '',
      tempo_total_estimado: calculateTotalMinutes(formData.itens || []),
      created_at: formData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await onSaveSetlist(payload);
    setShowEditorModal(false);
    setEditingSetlistId(null);
  };

  // Share Setlist to WhatsApp
  const handleShareWhatsApp = (sl: SetlistCulto) => {
    const dateFormatted = sl.data.split('-').reverse().join('/');
    const confirmedCount = (sl.equipe_escalada || []).filter(e => e.status === 'confirmado').length;

    let text = `🎼 *SETLIST & ESCALA DO CULTO*\n`;
    text += `🏛️ *${sl.titulo}*\n`;
    text += `📅 *Data:* ${dateFormatted} às ${sl.horario}h\n`;
    text += `🏷️ *Ocasião:* ${sl.tipo_culto}\n`;
    if (sl.tema_devocional) text += `📖 *Texto/Tema:* ${sl.tema_devocional}\n`;
    if (sl.lider_nome) text += `🎤 *Líder do Louvor:* ${sl.lider_nome}\n`;

    text += `\n👥 *EQUIPE ESCALADA (${confirmedCount}/${sl.equipe_escalada?.length || 0} confirmados):*\n`;
    sl.equipe_escalada?.forEach(e => {
      const icon = e.status === 'confirmado' ? '✅' : e.status === 'indisponivel' ? '❌' : '⏳';
      text += `• ${e.nome} - *${e.funcao}* (${icon} ${e.status})\n`;
    });

    text += `\n🎵 *ORDEM DO LOUVOR (SETLIST):*\n`;
    sl.itens?.forEach(item => {
      text += `${item.ordem}º. *${item.titulo}* - ${item.artista}\n`;
      text += `    🔑 *Tom:* ${item.tom_culto}${item.tom_culto !== item.tom_original ? ` (orig: ${item.tom_original})` : ''} | ⏱ *BPM:* ${item.bpm || '70'}\n`;
      if (item.momento_liturgico) text += `    ✨ *Momento:* ${item.momento_liturgico}\n`;
      if (item.ministro_vocal) text += `    🎤 *Vocal:* ${item.ministro_vocal}\n`;
      if (item.notas_arranjo) text += `    💡 *Arranjo:* ${item.notas_arranjo}\n`;
      text += `\n`;
    });

    if (sl.tempo_total_estimado) {
      text += `⏱ *Tempo total estimado:* ~${sl.tempo_total_estimado} minutos\n`;
    }
    if (sl.observacoes_gerais) {
      text += `\n📌 *Observações gerais:* ${sl.observacoes_gerais}\n`;
    }

    text += `\n_“Tudo quanto tem fôlego louve ao Senhor. Louvai ao Senhor!” (Sl 150:6)_`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      addToast('Roteiro copiado para a área de transferência!', 'success');
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Print Cuesheet for audio, projection and pulpit
  const handlePrintCuesheet = (sl: SetlistCulto) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast('Permita pop-ups para visualizar a impressão.', 'warning');
      return;
    }

    const dateFormatted = sl.data.split('-').reverse().join('/');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Roteiro de Palco - ${sl.titulo}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; line-height: 1.4; }
          h1 { font-size: 20px; font-weight: 900; margin: 0 0 4px 0; color: #0f172a; }
          .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
          .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #f1f5f9; color: #334155; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th { text-align: left; background: #f8fafc; padding: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
          td { padding: 10px 8px; font-size: 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
          .key { font-weight: 900; color: #b45309; font-family: monospace; font-size: 13px; }
          .team-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 16px; font-size: 11px; }
          .team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 6px; }
          .footer { margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>🎼 ${sl.titulo}</h1>
            <div class="meta">
              <strong>Data:</strong> ${dateFormatted} às ${sl.horario}h &nbsp;|&nbsp; 
              <strong>Tipo:</strong> ${sl.tipo_culto} &nbsp;|&nbsp; 
              <strong>Líder:</strong> ${sl.lider_nome || 'Equipe de Louvor'}
            </div>
            ${sl.tema_devocional ? `<div class="meta"><strong>Texto/Tema:</strong> ${sl.tema_devocional}</div>` : ''}
          </div>
          <div style="text-align: right;">
            <div class="badge">⏱ Total Estimado: ~${sl.tempo_total_estimado || 20} min</div>
          </div>
        </div>

        <div class="team-box">
          <strong>👥 ESCALA DE MÚSICOS & OPERADORES:</strong>
          <div class="team-grid">
            ${(sl.equipe_escalada || []).map(m => `
              <div><strong>${m.funcao}:</strong> ${m.nome}</div>
            `).join('')}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Música & Artista</th>
              <th style="width: 70px;">Tom</th>
              <th style="width: 60px;">BPM</th>
              <th>Momento Litúrgico</th>
              <th>Ministro / Vocal</th>
              <th>Diretrizes de Arranjo</th>
            </tr>
          </thead>
          <tbody>
            ${(sl.itens || []).map(it => `
              <tr>
                <td style="font-weight: bold; color: #64748b;">${it.ordem}</td>
                <td>
                  <strong>${it.titulo}</strong>
                  <div style="font-size: 10px; color: #64748b;">${it.artista}</div>
                </td>
                <td class="key">${it.tom_culto || it.tom_original}</td>
                <td style="font-family: monospace;">${it.bpm || '-'}</td>
                <td><span class="badge">${it.momento_liturgico || '-'}</span></td>
                <td><strong>${it.ministro_vocal || '-'}</strong></td>
                <td style="font-size: 11px; color: #475569;">${it.notas_arranjo || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${sl.observacoes_gerais ? `
          <div style="margin-top: 16px; font-size: 11px; background: #fffbeb; border: 1px solid #fef3c7; padding: 8px; border-radius: 6px;">
            <strong>📌 Observações:</strong> ${sl.observacoes_gerais}
          </div>
        ` : ''}

        <div class="footer">
          Departamento de Louvor & Adoração • Gerado pelo Sistema GIPP • "Louvai a Deus com júbilo"
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Filtered setlists list
  const filteredSetlists = setlists.filter(sl => {
    const matchSearch = searchTerm === '' || 
      sl.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sl.tema_devocional && sl.tema_devocional.toLowerCase().includes(searchTerm.toLowerCase())) ||
      sl.itens.some(it => it.titulo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchTipo = filterTipo === 'todos' || sl.tipo_culto === filterTipo;
    return matchSearch && matchTipo;
  });

  return (
    <div className="space-y-6">
      {/* ACTION BAR & HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-2">
            <span>🎼 Setlists & Agenda dos Cultos</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {setlists.length}
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize o repertório dos cultos com ordem, tons específicos, momentos litúrgicos e confirmação de presença dos músicos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <Plus size={16} /> Nova Setlist / Culto
        </button>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-150 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por culto, hino da setlist ou tema bíblico..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value)}
            className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 outline-none"
          >
            <option value="todos">Todos os Tipos de Culto</option>
            {TIPOS_CULTO_PADRAO.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SETLISTS CARDS LIST */}
      <div className="space-y-4">
        {filteredSetlists.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-150 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Music size={28} />
            </div>
            <h5 className="font-extrabold text-slate-800 text-base">Nenhuma Setlist encontrada</h5>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Crie a escala do próximo culto com as canções ordenadas, tons ajustados para cada ministro e escala de levitas.
            </p>
            <button
              onClick={handleOpenNew}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700"
            >
              Criar Primeira Setlist
            </button>
          </div>
        ) : (
          filteredSetlists.map(sl => {
            const dateFormatted = sl.data.split('-').reverse().join('/');
            const confirmedCount = (sl.equipe_escalada || []).filter(e => e.status === 'confirmado').length;
            const totalEscalados = sl.equipe_escalada?.length || 0;

            return (
              <div
                key={sl.id}
                className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Top Row: Service Title, Badges & Quick Action Buttons */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1">
                        <Calendar size={13} /> {dateFormatted} às {sl.horario}h
                      </span>
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                        {sl.tipo_culto}
                      </span>
                      {sl.tempo_total_estimado ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          ⏱ ~{sl.tempo_total_estimado} min
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{sl.titulo}</h3>
                    {sl.tema_devocional && (
                      <p className="text-xs text-slate-500 font-semibold italic">
                        📖 {sl.tema_devocional}
                      </p>
                    )}
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() => setActiveLiveSetlist(sl)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer"
                      title="Abrir Cifras em Modo Culto / Tela Cheia"
                    >
                      <Play size={14} fill="currentColor" /> Tocar Setlist
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(sl)}
                      className="flex items-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-xs rounded-xl transition"
                      title="Compartilhar no WhatsApp"
                    >
                      <Share2 size={14} /> WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrintCuesheet(sl)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
                      title="Imprimir Roteiro de Palco / Áudio"
                    >
                      <Printer size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(sl)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
                      title="Editar Setlist"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirmId(sl.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Excluir Setlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Middle Content: Setlist Songs Sequence & Musician Agenda */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Songs Sequence (8 cols) */}
                  <div className="lg:col-span-8 space-y-2">
                    <div className="flex justify-between items-center text-xs font-black uppercase text-slate-400 tracking-wider">
                      <span>Ordem das Canções ({sl.itens.length})</span>
                      {sl.lider_nome && (
                        <span className="text-indigo-700 font-bold normal-case">
                          Ministro: {sl.lider_nome}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {sl.itens.map((it, idx) => (
                        <div
                          key={it.id || idx}
                          className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-150 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {it.ordem || idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-slate-900">{it.titulo}</span>
                                <span className="text-xs text-slate-500">({it.artista})</span>
                                {it.momento_liturgico && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-violet-100 text-violet-800">
                                    {it.momento_liturgico}
                                  </span>
                                )}
                              </div>
                              {it.notas_arranjo && (
                                <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                                  💡 {it.notas_arranjo}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <span className="text-xs font-black font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                              Tom: {it.tom_culto}
                              {it.tom_culto !== it.tom_original && (
                                <span className="text-[10px] text-amber-700 font-normal ml-1">
                                  (orig: {it.tom_original})
                                </span>
                              )}
                            </span>
                            {it.bpm && (
                              <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                                {it.bpm} BPM
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Musician Schedule & Attendance (4 cols) */}
                  <div className="lg:col-span-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-150 space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Users size={14} className="text-indigo-600" />
                        Agenda dos Músicos
                      </h5>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {confirmedCount}/{totalEscalados} Confirmados
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {sl.equipe_escalada && sl.equipe_escalada.length > 0 ? (
                        sl.equipe_escalada.map((musico, mIdx) => (
                          <div
                            key={mIdx}
                            className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                          >
                            <div className="truncate pr-2">
                              <span className="font-bold text-slate-800 block truncate">{musico.nome}</span>
                              <span className="text-[10px] text-slate-500 font-medium">{musico.funcao}</span>
                            </div>

                            <div className="shrink-0 flex items-center gap-1">
                              {musico.status === 'confirmado' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 size={11} /> Confirmado
                                </span>
                              )}
                              {musico.status === 'pendente' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                  <Clock3 size={11} /> Pendente
                                </span>
                              )}
                              {musico.status === 'indisponivel' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                  <AlertCircle size={11} /> Ausente
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 italic text-xs text-center py-2">
                          Nenhum músico escalado ainda.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: CREATE / EDIT SETLIST & AGENDA (PADRÃO FORMULÁRIO DE MEMBRO) */}
      {showEditorModal && createPortal(
        <InteractiveWindow
          id="worship_setlist_editor_window"
          title={formData.titulo || (editingSetlistId ? 'Editar Setlist & Agenda' : 'Nova Setlist de Culto')}
          subtitle={`${editingSetlistId ? 'Editando Programação' : 'Nova Programação'} • Ministério de Louvor & Cultos`}
          onClose={() => setShowEditorModal(false)}
          icon={Music}
          headerBg="from-indigo-600 via-purple-600 to-indigo-800"
          defaultWidth={880}
          defaultHeight={760}
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-slate-500 font-bold hidden sm:flex items-center gap-2">
                <span>Total Estimado:</span>
                <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                  ⏱ ~{calculateTotalMinutes(formData.itens || [])} min
                </span>
                <span>•</span>
                <span>{formData.equipe_escalada?.length || 0} na escala</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="ghost"
                  onClick={() => setShowEditorModal(false)}
                  className="border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  className="shadow-indigo-500/30 cursor-pointer flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black"
                >
                  <Save size={16} /> Salvar Setlist
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6 text-left p-1 pb-4">
            {/* Navegação de Abas do Formulário (Padrão Cadastro de Membro) */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
              <button
                type="button"
                onClick={() => setFormTab('geral')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  formTab === 'geral'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                }`}
              >
                <Calendar size={14} /> 1. Culto & Informações
              </button>
              <button
                type="button"
                onClick={() => setFormTab('equipe')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  formTab === 'equipe'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                }`}
              >
                <Users size={14} /> 2. Agenda & Escala ({formData.equipe_escalada?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setFormTab('setlist')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  formTab === 'setlist'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                }`}
              >
                <Music size={14} /> 3. Músicas da Setlist ({formData.itens?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setFormTab('todas')}
                className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  formTab === 'todas'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                }`}
                title="Visualizar todas as seções corridas"
              >
                <List size={14} /> Todas
              </button>
            </div>

            {/* SEÇÃO 1: INFORMAÇÕES DO CULTO */}
            {(formTab === 'geral' || formTab === 'todas') && (
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={16} className="text-indigo-600" /> 1. Informações do Culto
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FormInput
                      label="Título do Culto"
                      value={formData.titulo || ''}
                      onChange={(v: string) => setFormData({ ...formData, titulo: v })}
                      placeholder="Ex: Culto de Celebração e Louvor Congregacional"
                      required
                      preserveCase
                      className="!mb-0"
                    />
                  </div>
                  <div>
                    <FormSelect
                      label="Tipo de Culto"
                      value={formData.tipo_culto || TIPOS_CULTO_PADRAO[0]}
                      onChange={(v: string) => setFormData({ ...formData, tipo_culto: v })}
                      options={TIPOS_CULTO_PADRAO}
                      required
                      className="!mb-0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <FormInput
                      label="Data do Culto"
                      type="date"
                      value={formData.data || ''}
                      onChange={(v: string) => setFormData({ ...formData, data: v })}
                      required
                      className="!mb-0"
                    />
                  </div>
                  <div>
                    <FormInput
                      label="Horário"
                      type="time"
                      value={formData.horario || '19:00'}
                      onChange={(v: string) => setFormData({ ...formData, horario: v })}
                      required
                      className="!mb-0"
                    />
                  </div>
                  <div>
                    <FormInput
                      label="Líder do Louvor / Ministro"
                      value={formData.lider_nome || ''}
                      onChange={(v: string) => setFormData({ ...formData, lider_nome: v })}
                      placeholder="Ex: Missionária Sarah (Ministra de Louvor)"
                      preserveCase
                      className="!mb-0"
                    />
                  </div>
                </div>

                <div>
                  <FormInput
                    label="Tema Devocional / Texto Bíblico"
                    value={formData.tema_devocional || ''}
                    onChange={(v: string) => setFormData({ ...formData, tema_devocional: v })}
                    placeholder="Ex: Salmo 100 - Celebrai com júbilo ao Senhor todas as terras"
                    preserveCase
                    className="!mb-0"
                  />
                </div>
              </div>
            )}

            {/* SEÇÃO 2: AGENDA DOS MÚSICOS & EQUIPE */}
            {(formTab === 'equipe' || formTab === 'todas') && (
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h4 className="text-sm font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                    <Users size={16} className="text-indigo-600" /> 2. Agenda dos Músicos & Equipe ({formData.equipe_escalada?.length || 0})
                  </h4>
                  {formData.equipe_escalada && formData.equipe_escalada.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {formData.equipe_escalada.filter(e => e.status === 'confirmado').length} Confirmados
                      </span>
                      {formData.equipe_escalada.some(e => e.status === 'pendente') && (
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                          {formData.equipe_escalada.filter(e => e.status === 'pendente').length} Pendentes
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Seletor para Escalar Músico */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="md:col-span-6">
                    <select
                      value={selectedMembroId}
                      onChange={e => setSelectedMembroId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">-- Selecione o Levita / Membro --</option>
                      {membrosIgreja.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.nome} ({m.funcao || m.cargo || 'Membro'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <select
                      value={selectedFuncao}
                      onChange={e => setSelectedFuncao(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {FUNCOES_LOUVOR.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      onClick={handleAddMusician}
                      variant="primary"
                      className="w-full h-full py-2.5 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Escalar
                    </Button>
                  </div>
                </div>

                {/* Grade de Músicos Escalados */}
                {(!formData.equipe_escalada || formData.equipe_escalada.length === 0) ? (
                  <div className="bg-white/60 rounded-xl p-6 text-center border border-dashed border-indigo-200">
                    <p className="text-xs text-indigo-900/60 font-medium">Nenhum levita ou músico escalado para este culto ainda. Use o seletor acima para adicionar a equipe.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {formData.equipe_escalada.map((musico, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs gap-3 shadow-2xs hover:border-indigo-200 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs shrink-0">
                            {musico.nome?.charAt(0) || 'L'}
                          </div>
                          <div className="truncate">
                            <strong className="text-slate-800 block truncate text-xs font-bold">{musico.nome}</strong>
                            <span className="text-[11px] text-indigo-600 font-semibold truncate block">{musico.funcao}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <select
                            value={musico.status}
                            onChange={e => handleMusicianStatusChange(idx, e.target.value as any)}
                            className={`text-[11px] font-black rounded-lg px-2.5 py-1 border transition-all cursor-pointer outline-none ${
                              musico.status === 'confirmado'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : musico.status === 'indisponivel'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <option value="confirmado">✓ Confirmado</option>
                            <option value="pendente">⏳ Pendente</option>
                            <option value="indisponivel">✕ Ausente</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleRemoveMusician(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remover da escala"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 3: MÚSICAS DA SETLIST */}
            {(formTab === 'setlist' || formTab === 'todas') && (
              <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200/70 shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                    <Music size={16} className="text-amber-700" /> 3. Músicas da Setlist ({formData.itens?.length || 0})
                  </h4>
                  <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300/80 px-2.5 py-1 rounded-lg">
                    Total: ~{calculateTotalMinutes(formData.itens || [])} min
                  </span>
                </div>

                {/* Seletor para Adicionar Música */}
                <div className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                  <select
                    value={selectedCatalogSongId}
                    onChange={e => setSelectedCatalogSongId(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">-- Escolha uma música do repertório cadastrado --</option>
                    {musicas.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.titulo} - {m.artista} (Tom original: {m.tom || 'G'})
                      </option>
                    ))}
                  </select>

                  <Button
                    type="button"
                    onClick={handleAddSongToSetlist}
                    variant="primary"
                    className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl shrink-0 cursor-pointer"
                  >
                    + Adicionar à Setlist
                  </Button>
                </div>

                {/* Lista Ordenada de Músicas */}
                {(!formData.itens || formData.itens.length === 0) ? (
                  <div className="bg-white/60 rounded-xl p-6 text-center border border-dashed border-amber-200">
                    <p className="text-xs text-amber-900/60 font-medium">Nenhuma música adicionada à setlist deste culto ainda. Escolha no catálogo acima.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.itens.map((it, idx) => (
                      <div
                        key={it.id || idx}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-indigo-200 transition-all"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <h6 className="font-extrabold text-sm text-slate-900 leading-tight">{it.titulo}</h6>
                              <p className="text-xs text-slate-500 font-semibold">{it.artista}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSong(idx, 'up')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 transition-colors cursor-pointer"
                              title="Subir ordem"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === (formData.itens?.length || 0) - 1}
                              onClick={() => handleMoveSong(idx, 'down')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 transition-colors cursor-pointer"
                              title="Descer ordem"
                            >
                              <ArrowDown size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSong(it.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 ml-1 transition-colors cursor-pointer"
                              title="Remover música da setlist"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Parâmetros Musicais da Faixa */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                              Tom do Culto
                            </label>
                            <input
                              type="text"
                              value={it.tom_culto}
                              onChange={e => handleUpdateSongItem(it.id, 'tom_culto', e.target.value.toUpperCase())}
                              className="w-full text-xs font-black text-amber-950 bg-amber-50 border border-amber-300 rounded-xl px-2.5 py-2 uppercase text-center focus:ring-2 focus:ring-amber-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                              Momento Litúrgico
                            </label>
                            <select
                              value={it.momento_liturgico || MOMENTOS_LITURGICOS[0]}
                              onChange={e => handleUpdateSongItem(it.id, 'momento_liturgico', e.target.value)}
                              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                              {MOMENTOS_LITURGICOS.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                              Ministro / Vocal
                            </label>
                            <input
                              type="text"
                              value={it.ministro_vocal || ''}
                              onChange={e => handleUpdateSongItem(it.id, 'ministro_vocal', e.target.value)}
                              placeholder="Quem sola/puxa"
                              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                              BPM
                            </label>
                            <input
                              type="number"
                              value={it.bpm || ''}
                              onChange={e => handleUpdateSongItem(it.id, 'bpm', e.target.value)}
                              className="w-full text-xs font-mono font-black text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                              Duração (min)
                            </label>
                            <input
                              type="number"
                              value={it.duracao_minutos || 5}
                              onChange={e => handleUpdateSongItem(it.id, 'duracao_minutos', Number(e.target.value))}
                              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-center outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                            Diretrizes de Arranjo & Transição
                          </label>
                          <input
                            type="text"
                            value={it.notas_arranjo || ''}
                            onChange={e => handleUpdateSongItem(it.id, 'notas_arranjo', e.target.value)}
                            placeholder="Ex: Começa no teclado e voz; emenda na próxima em D"
                            className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO 4: OBSERVAÇÕES GERAIS, TRAJE & PASSAGEM DE SOM */}
            {(formTab === 'geral' || formTab === 'todas') && (
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-slate-500" /> 4. Observações Gerais, Traje & Passagem de Som
                </h4>
                <textarea
                  value={formData.observacoes_gerais || ''}
                  onChange={e => setFormData({ ...formData, observacoes_gerais: e.target.value })}
                  placeholder="Instruções para a equipe de som, projeção, horário de chegada dos músicos, ensaio prévio, etc."
                  className="w-full h-24 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl p-3.5 outline-none resize-none font-medium focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            )}
          </div>
        </InteractiveWindow>,
        document.body
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {showDeleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-rose-100 space-y-4">
            <h4 className="text-base font-black text-slate-900">Excluir Setlist?</h4>
            <p className="text-xs text-slate-500">
              Tem certeza que deseja excluir esta programação de louvor e agenda de culto? Esta ação não poderá ser desfeita.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await onDeleteSetlist(showDeleteConfirmId);
                  setShowDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE SETLIST READER FULLSCREEN MODAL */}
      {activeLiveSetlist && (
        <WorshipLiveReader
          setlist={activeLiveSetlist}
          allMusicas={musicas}
          onClose={() => setActiveLiveSetlist(null)}
        />
      )}
    </div>
  );
};
