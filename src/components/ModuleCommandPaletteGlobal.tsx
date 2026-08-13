import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Command,
  ArrowRight,
  BookOpen,
  Users,
  DollarSign,
  FileText,
  ShieldCheck,
  Activity,
  Sparkles,
  Zap
} from 'lucide-react';
import { ChurchContext } from '../App';

export default function ModuleCommandPaletteGlobal() {
  const context = useContext(ChurchContext) as any;
  const { setView, addToast } = context || {};

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const comandos = [
    { id: 'dashboard', label: 'Painel Principal / Visão Geral', categoria: 'Módulos' },
    { id: 'cad_membro', label: 'Cadastro & Ficha de Membros', categoria: 'Secretaria' },
    { id: 'fin_entrada', label: 'Lançamento de Dízimos & Ofertas', categoria: 'Finanças' },
    { id: 'documentos_express', label: 'Emissão de Cartas & Atestados', categoria: 'Secretaria' },
    { id: 'grid_office', label: 'Excel Grid & Mala Direta Word', categoria: 'Suíte Office' },
    { id: 'lancamento_teclado', label: 'Caixa Express (Numpad)', categoria: 'Operador' },
    { id: 'audit_logs', label: 'Trilha de Auditoria (Logs)', categoria: 'Dev & Suporte' },
    { id: 'telemetria_health', label: 'Monitor de Saúde e Telemetria', categoria: 'Dev & Suporte' }
  ];

  const filtered = comandos.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.categoria.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (id: string) => {
    setView(id);
    setIsOpen(false);
    addToast(`Navegado para o módulo "${id}" via Command Palette!`, 'info');
  };

  return (
    <>
      {/* Botão Fixo de Acesso Rápido na Tela */}
      <div className="p-4 max-w-7xl mx-auto flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Command size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Central de Busca Global & Palette de Comandos</h3>
            <p className="text-xs text-slate-400">Pressione <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-purple-300 font-mono">Ctrl + K</kbd> ou clique para pesquisar em todo o sistema.</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
        >
          <Search size={15} /> Abrir busca (Ctrl + K)
        </button>
      </div>

      {/* Modal Command Palette */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-slate-900 text-white w-full max-w-2xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden space-y-2 p-4"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-950 rounded-2xl border border-slate-800">
                <Search size={20} className="text-purple-400" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="O que você deseja fazer? (Ex: Membros, Dízimos, Auditoria...)"
                  className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-500"
                />
                <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-1 p-2">
                {filtered.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-500 font-bold">Nenhum resultado encontrado para "{query}"</p>
                ) : (
                  filtered.map(cmd => (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd.id)}
                      className="w-full p-3.5 rounded-2xl hover:bg-purple-600/20 hover:border-purple-500/40 border border-transparent flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {cmd.categoria}
                        </span>
                        <span className="text-xs font-black text-slate-200 group-hover:text-white">{cmd.label}</span>
                      </div>
                      <ArrowRight size={16} className="text-slate-500 group-hover:text-purple-400 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
