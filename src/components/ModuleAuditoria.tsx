import React, { useState, useContext, memo } from 'react';
import { 
  ShieldCheck, Check, GitBranch, ArrowUpCircle, ArrowDownCircle, User, Clock, 
  X, AlertCircle, FileText, Landmark, Calendar, Badge, Info, CheckCircle2, AlertTriangle
} from 'lucide-react';

import {
  ChurchContext, GenericTable, Button
} from '../App';

// Helper to check and retrieve diff array
const getDiffFields = (tipoItem: string, antes: any, depois: any) => {
  const fieldsToCompare = tipoItem === 'financeiro' 
      ? ['descricao', 'valor', 'tipo', 'status', 'data_vencimento', 'data_competencia', 'categoria', 'forma_pagamento', 'obs']
      : ['nome', 'email', 'telefone', 'cargo', 'status', 'data_nascimento', 'cpf', 'congregacao_id', 'sexo', 'estado_civil', 'bairro'];
      
  const diffs: { field: string; antesVal: any; depoisVal: any; changed: boolean }[] = [];
  
  const keys = Array.from(new Set([
      ...fieldsToCompare, 
      ...Object.keys(antes || {}), 
      ...Object.keys(depois || {})
  ])).filter(k => !['id', 'historico', 'alteracoes', 'created_at', 'deleted', '_collection_key', '_type_label', 'foto', 'logo', 'comprovante'].includes(k));

  keys.forEach(k => {
      const aVal = antes ? antes[k] : undefined;
      const dVal = depois ? depois[k] : undefined;
      
      let isDifferent = false;
      if (typeof aVal === 'number' && typeof dVal === 'number') {
          isDifferent = aVal !== dVal;
      } else {
          isDifferent = String(aVal || '') !== String(dVal || '');
      }
      
      if (aVal !== undefined || dVal !== undefined) {
          diffs.push({
              field: k,
              antesVal: aVal,
              depoisVal: dVal,
              changed: isDifferent
          });
      }
  });
  
  return diffs;
};

// Simple parser for legacy details strings if direct data is missing
const parseDetailsForDiff = (detalhes: string, liveItem: any) => {
  let antes = liveItem ? { ...liveItem } : {};
  let depois = liveItem ? { ...liveItem } : {};
  
  if (!detalhes) return { antes, depois };
  
  const valorMatch = detalhes.match(/Valor alterado de R\$\s*([\d.,]+)\s*para R\$\s*([\d.,]+)/i);
  if (valorMatch) {
      antes.valor = parseFloat(valorMatch[1].replace('.', '').replace(',', '.'));
      depois.valor = parseFloat(valorMatch[2].replace('.', '').replace(',', '.'));
  }
  
  const statusMatch = detalhes.match(/Status alterado de ["']?([^"']+)["']?\s*para\s*["']?([^"']+)["']?/i);
  if (statusMatch) {
      antes.status = statusMatch[1].toLowerCase();
      depois.status = statusMatch[2].toLowerCase();
  }
  
  const descMatch = detalhes.match(/Descrição alterada de ["']?([^"']+)["']?\s*para\s*["']?([^"']+)["']?/i);
  if (descMatch) {
      antes.descricao = descMatch[1];
      depois.descricao = descMatch[2];
  }
  
  return { antes, depois };
};

// Exporting component
const ModuleAuditoria = memo(() => {
    const { db } = useContext(ChurchContext);
    const [selectedLog, setSelectedLog] = useState<any | null>(null);
    
    // Sort logs from most recent to oldest
    const logsOrdenados = [...(db.auditoria || [])].sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime());

    const findLiveItem = (tipoItem: string, id: string) => {
        if (!id) return null;
        if (tipoItem === 'financeiro') {
            return db.financeiro?.find((f: any) => f.id === id);
        }
        if (tipoItem === 'membros') {
            return db.membros?.find((m: any) => m.id === id);
        }
        return null;
    };

    const handleShowDiff = (log: any) => {
        setSelectedLog(log);
    };

    const columns = [
        { header: 'Data/Hora', key: 'data_hora', render: l => { const d = new Date(l.data_hora); return <div className="text-xs"><b>{d.toLocaleDateString('pt-BR')}</b><br/><span className="text-slate-400">{d.toLocaleTimeString('pt-BR')}</span></div>; } },
        { header: 'Usuário', key: 'usuario_nome', render: l => <span className="font-bold text-slate-700 uppercase">{l.usuario_nome}</span> },
        { header: 'Ação', key: 'acao', render: l => {
            const colors = {
                'CRIAÇÃO': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                'EDIÇÃO': 'bg-blue-100 text-blue-700 border-blue-200',
                'EXCLUSÃO_LÓGICA': 'bg-amber-100 text-amber-700 border-amber-200',
                'RESTAURAÇÃO': 'bg-indigo-100 text-indigo-700 border-indigo-200',
                'EXCLUSÃO_PERMANENTE': 'bg-rose-100 text-rose-700 border-rose-200',
                'BAIXA_FINANCEIRA': 'bg-teal-100 text-teal-700 border-teal-200',
                'BAIXA_CARNE': 'bg-teal-100 text-teal-700 border-teal-200',
                'LOGIN': 'bg-slate-100 text-slate-700 border-slate-200'
            };
            return <span className={`text-[10px] font-black px-2 py-1 rounded-md border shadow-sm uppercase ${colors[l.acao] || 'bg-slate-100 text-slate-700'}`}>{l.acao.replace('_', ' ')}</span>;
        } },
        { header: 'Módulo/Tabela', key: 'tipo_item', render: l => <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">{l.tipo_item}</span> },
        { header: 'Detalhes', key: 'detalhes', render: l => <span className="text-sm text-slate-600 font-medium">{l.detalhes}</span> }
    ];

    // Compute diff data for the modal
    const diffData = React.useMemo(() => {
        if (!selectedLog) return null;
        
        let antes = selectedLog.dados_antes;
        let depois = selectedLog.dados_depois;
        
        // If data properties are missing, try to locate live item and parse details description
        if (!antes && !depois) {
            const liveItem = findLiveItem(selectedLog.tipo_item, selectedLog.item_id);
            if (selectedLog.acao === 'CRIAÇÃO') {
                depois = liveItem || {};
                antes = null;
            } else if (selectedLog.acao === 'EDIÇÃO') {
                const parsed = parseDetailsForDiff(selectedLog.detalhes, liveItem);
                antes = parsed.antes;
                depois = parsed.depois;
            } else if (selectedLog.acao.includes('EXCLUSÃO')) {
                antes = liveItem || {};
                depois = null;
            }
        }

        const fields = getDiffFields(selectedLog.tipo_item, antes, depois);
        return {
            antes,
            depois,
            fields
        };
    }, [selectedLog, db]);

    return (
        <div className="h-full flex flex-col space-y-6 animate-entrance">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-800 rounded-2xl text-white shadow-sm"><ShieldCheck size={28}/></div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Auditoria & Logs</h2>
                    <p className="text-sm text-slate-500 font-medium">Rastreamento de atividades e alterações de dados no sistema.</p>
                </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
                <GenericTable 
                    title="" 
                    type="auditoria" 
                    data={logsOrdenados} 
                    columns={columns} 
                    customActions={(l) => {
                        const canShowDiff = l.tipo_item === 'membros' || l.tipo_item === 'financeiro';
                        if (!canShowDiff) return null;
                        return (
                            <Button 
                                onClick={() => handleShowDiff(l)} 
                                variant="secondary" 
                                className="flex items-center gap-1 py-1.5 px-3 text-xs font-black shadow-sm"
                                title="Ver Alterações Detalhadas"
                            >
                                <GitBranch size={14} className="text-indigo-600"/> DIFF
                            </Button>
                        );
                    }} 
                    showDeleted={true} 
                />
            </div>

            {/* Visual Diff Checker Modal */}
            {selectedLog && diffData && (
                <div className="fixed inset-0 bg-slate-900/80 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-up border border-slate-100">
                        {/* Modal Header */}
                        <div className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center relative">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-xl text-indigo-400">
                                    <GitBranch size={22}/>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-wide">Visualizador de Alterações</h3>
                                    <p className="text-[10px] text-slate-400 font-mono">ID do Registro: {selectedLog.item_id || 'N/A'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedLog(null)} 
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                            >
                                <X size={20}/>
                            </button>
                        </div>

                        {/* Log Metadata Header */}
                        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div className="space-y-1">
                                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Ação Executada</span>
                                <span className="font-extrabold text-slate-800 text-sm uppercase">{selectedLog.acao.replace('_', ' ')}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Operador</span>
                                <span className="font-bold text-slate-700 flex items-center gap-1 text-sm">
                                    <User size={14} className="text-slate-400" /> {selectedLog.usuario_nome}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Data & Hora</span>
                                <span className="font-bold text-slate-700 flex items-center gap-1 text-sm">
                                    <Clock size={14} className="text-slate-400" /> {new Date(selectedLog.data_hora).toLocaleString('pt-BR')}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">Tabela / Módulo</span>
                                <span className="font-extrabold text-indigo-650 bg-indigo-50 border border-indigo-100/50 py-0.5 px-2 rounded-md text-[11px] uppercase tracking-wider inline-block">
                                    {selectedLog.tipo_item}
                                </span>
                            </div>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Short Summary Description */}
                            <div className="flex items-start gap-3 bg-indigo-50/40 border border-indigo-100/30 rounded-2xl p-4">
                                <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                                <div className="space-y-1 text-xs">
                                    <span className="font-black text-indigo-900 uppercase tracking-wide block">Descrição Sumária:</span>
                                    <p className="text-slate-600 font-medium leading-relaxed">{selectedLog.detalhes}</p>
                                </div>
                            </div>

                            {/* Diff Table */}
                            <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-white shadow-sm">
                                <div className="bg-slate-100/85 border-b border-slate-200/60 px-4 py-3 grid grid-cols-3 gap-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                    <div>Campo / Propriedade</div>
                                    <div>Estado Anterior</div>
                                    <div>Novo Estado</div>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {diffData.fields.map((fieldObj, i) => {
                                        const { field, antesVal, depoisVal, changed } = fieldObj;
                                        
                                        // Display labels for cleaner UI
                                        const displayField = field.replace('_', ' ').replace('id', 'ID').toUpperCase();
                                        
                                        // Format value based on field type
                                        const formatVal = (v: any) => {
                                            if (v === null || v === undefined || v === '') {
                                                return <span className="text-slate-350 font-medium italic">Vazio</span>;
                                            }
                                            if (typeof v === 'boolean') {
                                                return v ? 'SIM' : 'NÃO';
                                            }
                                            if (field === 'valor') {
                                                return `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                                            }
                                            return String(v);
                                        };

                                        return (
                                            <div 
                                                key={i} 
                                                className={`px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center text-xs transition-colors ${
                                                    changed ? 'bg-amber-50/20' : ''
                                                }`}
                                            >
                                                {/* Field Name */}
                                                <div className="font-bold text-slate-500 flex items-center gap-1.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${changed ? 'bg-amber-500' : 'bg-slate-300'}`}></span>
                                                    {displayField}
                                                </div>

                                                {/* Estado Anterior (Red highlight if changed) */}
                                                <div className="font-medium">
                                                    {changed ? (
                                                        <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-100 text-rose-700 px-2 py-1 rounded-lg font-bold line-through">
                                                            <ArrowDownCircle size={12} className="shrink-0" /> {formatVal(antesVal)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-600">{formatVal(antesVal)}</span>
                                                    )}
                                                </div>

                                                {/* Estado Novo (Green highlight if changed) */}
                                                <div className="font-medium">
                                                    {changed ? (
                                                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-bold">
                                                            <ArrowUpCircle size={12} className="shrink-0" /> {formatVal(depoisVal)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-600">{formatVal(depoisVal)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {diffData.fields.length === 0 && (
                                        <div className="p-6 text-center text-xs text-slate-500 italic">
                                            Nenhum campo estrutural foi modificado neste evento.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                Sistema de Integridade GIPP Ativo
                            </div>
                            <Button onClick={() => setSelectedLog(null)} variant="secondary" className="py-2 px-5 text-xs font-black uppercase rounded-xl">
                                Fechar Painel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default ModuleAuditoria;
