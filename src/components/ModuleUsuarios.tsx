import React, { useState, useEffect, useContext, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Shield, Search, Plus, Edit, Trash2, Loader2, Check, X, Info, 
  MapPin, User, Key, Users, BookOpen, Layers, Lock, AlertTriangle, ArrowUpDown
} from 'lucide-react';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { ChurchContext } from '../App';

// Categorias organizadas de permissão (com os novos módulos manual e gestao_cursos)
const CATEGORIAS_PERMISSOES = [
  {
    titulo: "Administrativo & Cadastros",
    desc: "Cadastro de pessoas, filiais, logística e redes de apoio",
    icon: Users,
    opcoes: [
      { id: 'access_membros', label: 'Membros (Rol & Ficha)' },
      { id: 'access_visitantes', label: 'Visitantes & CRM' },
      { id: 'access_igreja', label: 'Sede & Congregações' },
      { id: 'access_patrimonio', label: 'Patrimônio & Bens' },
      { id: 'access_celulas', label: 'Células & Redes' },
      { id: 'access_ministerios', label: 'Ministérios & Deptos' },
      { id: 'access_frotas', label: 'Controle de Frotas' }
    ]
  },
  {
    titulo: "Financeiro & Tesouraria",
    desc: "Controle de dízimos, carnês, saídas e relatórios DRE",
    icon: Layers,
    opcoes: [
      { id: 'access_fin_entradas', label: 'Receitas (Entradas)' },
      { id: 'access_fin_saidas', label: 'Despesas (Saídas)' },
      { id: 'access_fin_analise', label: 'DRE & Conciliações' },
      { id: 'access_fin_carnes', label: 'Carnês & Campanhas' },
      { id: 'access_fin_cadastros', label: 'Fornecedores & C. Custo' }
    ]
  },
  {
    titulo: "Secretaria, Relatórios & Cursos",
    desc: "Secretaria Geral, EBD, Capacitações EAD, Teologia e Missões",
    icon: BookOpen,
    opcoes: [
      { id: 'access_sec_agenda', label: 'Agenda & Atividades' },
      { id: 'access_sec_certificados', label: 'Certificados & Credenciais' },
      { id: 'access_sec_relatorios', label: 'Emissão de Relatórios' },
      { id: 'access_ebd', label: 'Escola Bíblica (EBD) - Turmas/Chamadas' },
      { id: 'access_salinha_kids', label: 'Salinha Kids (Check-In)' },
      { id: 'access_gestao_cursos', label: 'Capacitações EAD (Cursos)' },
      { id: 'access_teologia', label: 'Universidade Teológica GIPP' },
      { id: 'access_missoes', label: 'Departamento de Missões' }
    ]
  },
  {
    titulo: "Comunicação & IA Pastoral",
    desc: "Estúdio de artes, boletins digitais e inteligência artificial",
    icon: Shield,
    opcoes: [
      { id: 'access_midia', label: 'Estúdio de Artes & Mídia' },
      { id: 'access_boletim', label: 'Boletim Semanal' },
      { id: 'access_email', label: 'Webmail Integrado' },
      { id: 'access_ia', label: 'Assistente Pastoral IA' },
      { id: 'access_manual', label: 'Manual do Usuário GIPP' },
      { id: 'access_interativo', label: 'Módulo Interativo & Gamificação' }
    ]
  },
  {
    titulo: "Configurações Globais & Proteção",
    desc: "Ajustes de sistema, governança, auditoria, proteção jurídica e amparos",
    icon: Lock,
    opcoes: [
      { id: 'access_config_sistema', label: 'Ajustes Administrativos' },
      { id: 'access_config_visual', label: 'Personalização de Temas' },
      { id: 'access_config_backup', label: 'Backup Geral de Dados' },
      { id: 'access_auditoria', label: 'Auditoria & Logs' },
      { id: 'access_lixeira', label: 'Lixeira do Sistema' },
      { id: 'access_amparo_legal', label: 'Amparo Constitucional' },
      { id: 'access_registro_software', label: 'Registro do Software' }
    ]
  }
];

const ModuleUsuarios = memo(() => {
  const { db, dbFirestore, appId, addToast, logAction, user, setConfirmDialog } = useContext(ChurchContext);

  // Estados locais para pesquisa e filtragem
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNivel, setFilterNivel] = useState('all');
  const [filterCongregacao, setFilterCongregacao] = useState('all');
  const [userColFilters, setUserColFilters] = useState({
    nome: '',
    nivel: '',
    congregacao: '',
    permissoes: ''
  });

  // Estados locais para o Modal de Edição/Criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const [formData, setFormData] = useState<any>({
    nome: '',
    usuario: '',
    senha: '',
    congregacao_id: 'sede',
    nivel: 'restrito',
    funcao_administrativa: '',
    permissoes: [],
    bloqueado: false
  });

  // Filtra operadores válidos (excluindo os excluídos logicamente)
  const usersList = useMemo(() => {
    if (!db.usuarios) return [];
    return db.usuarios.filter((u: any) => !u.deleted);
  }, [db.usuarios]);

  // Aplica filtros de pesquisa, nível e congregação
  const filteredUsers = useMemo(() => {
    return usersList.filter((u: any) => {
      const matchSearch = 
        u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.usuario?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchNivel = filterNivel === 'all' ? true : u.nivel === filterNivel;
      
      const matchCong = filterCongregacao === 'all' 
        ? true 
        : (filterCongregacao === 'sede' ? (!u.congregacao_id || u.congregacao_id === 'sede') : u.congregacao_id === filterCongregacao);

      // Column filters
      const congName = u.congregacao_id === 'sede' || !u.congregacao_id
        ? 'Sede Principal'
        : db.congregacoes?.find((c: any) => c.id === u.congregacao_id)?.nome || 'Outra';

      const matchColNome = !userColFilters.nome || 
        (u.nome || '').toLowerCase().includes(userColFilters.nome.toLowerCase()) ||
        (u.usuario || '').toLowerCase().includes(userColFilters.nome.toLowerCase());
      
      const matchColNivel = !userColFilters.nivel || 
        (u.nivel || '').toLowerCase().includes(userColFilters.nivel.toLowerCase());
      
      const matchColCong = !userColFilters.congregacao || 
        congName.toLowerCase().includes(userColFilters.congregacao.toLowerCase());

      const permissoesStr = Array.isArray(u.permissoes) ? u.permissoes.join(', ') : '';
      const matchColPerm = !userColFilters.permissoes || 
        permissoesStr.toLowerCase().includes(userColFilters.permissoes.toLowerCase()) ||
        (u.nivel === 'master' && 'todos tudo irrestrito'.includes(userColFilters.permissoes.toLowerCase()));

      return matchSearch && matchNivel && matchCong && matchColNome && matchColNivel && matchColCong && matchColPerm;
    });
  }, [usersList, searchTerm, filterNivel, filterCongregacao, userColFilters, db.congregacoes]);

  // Abre form para adicionar usuário
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      nome: '',
      usuario: '',
      senha: '',
      congregacao_id: 'sede',
      nivel: 'restrito',
      funcao_administrativa: '',
      permissoes: ['access_manual'], // padrão ativa o manual do usuário
      bloqueado: false
    });
    setIsModalOpen(true);
  };

  // Abre form para editar usuário
  const handleOpenEdit = (operator: any) => {
    setEditingUser(operator);
    setFormData({
      nome: operator.nome || '',
      usuario: operator.usuario || '',
      senha: operator.senha || '',
      congregacao_id: operator.congregacao_id || 'sede',
      nivel: operator.nivel || 'restrito',
      funcao_administrativa: operator.funcao_administrativa || '',
      permissoes: Array.isArray(operator.permissoes) ? [...operator.permissoes] : [],
      bloqueado: !!operator.bloqueado
    });
    setIsModalOpen(true);
  };

  // Preenche permissões recomendadas de acordo com a função escolhida
  const handleFuncaoChange = (val: string) => {
    let perms = [...(formData.permissoes || [])];
    if (val === 'PASTOR PRESIDENTE' || val === 'PASTOR AUXILIAR') {
      perms = ['access_membros', 'access_visitantes', 'access_igreja', 'access_celulas', 'access_ministerios', 'access_sec_agenda', 'access_sec_certificados', 'access_ebd', 'access_salinha_kids', 'access_gestao_cursos', 'access_ia', 'access_boletim', 'access_sec_relatorios', 'access_missoes', 'access_manual', 'access_amparo_legal', 'access_registro_software', 'access_frotas', 'access_interativo'];
    } else if (val === 'SECRETARIO') {
      perms = ['access_membros', 'access_visitantes', 'access_igreja', 'access_celulas', 'access_sec_agenda', 'access_sec_certificados', 'access_ebd', 'access_salinha_kids', 'access_gestao_cursos', 'access_boletim', 'access_sec_relatorios', 'access_manual', 'access_amparo_legal', 'access_registro_software', 'access_interativo'];
    } else if (val === 'TESOUREIRO' || val === 'CONTADOR') {
      perms = ['access_fin_entradas', 'access_fin_saidas', 'access_fin_analise', 'access_fin_carnes', 'access_fin_cadastros', 'access_sec_relatorios', 'access_manual'];
    } else if (val === 'ADMINISTRADOR') {
      perms = ['access_membros', 'access_visitantes', 'access_igreja', 'access_patrimonio', 'access_celulas', 'access_sec_agenda', 'access_sec_certificados', 'access_ebd', 'access_salinha_kids', 'access_gestao_cursos', 'access_boletim', 'access_midia', 'access_sec_relatorios', 'access_fin_entradas', 'access_fin_saidas', 'access_fin_analise', 'access_fin_carnes', 'access_fin_cadastros', 'access_config_sistema', 'access_config_visual', 'access_config_backup', 'access_auditoria', 'access_lixeira', 'access_manual', 'access_amparo_legal', 'access_registro_software', 'access_frotas', 'access_interativo'];
    } else if (val === 'ADVOGADO') {
      perms = ['access_igreja', 'access_patrimonio', 'access_sec_relatorios', 'access_manual', 'access_amparo_legal', 'access_registro_software'];
    } else if (val === 'LIDER DE DEPARTAMENTO') {
      perms = ['access_ministerios', 'access_sec_agenda', 'access_manual'];
    } else if (val === 'AUXILIAR') {
      perms = ['access_sec_agenda', 'access_ebd', 'access_gestao_cursos', 'access_manual', 'access_interativo'];
    }
    setFormData({ ...formData, funcao_administrativa: val, permissoes: perms });
  };

  // Liga/desliga permissão individual
  const handleTogglePermission = (id: string) => {
    const current = formData.permissoes || [];
    const updated = current.includes(id) ? current.filter((item: string) => item !== id) : [...current, id];
    setFormData({ ...formData, permissoes: updated });
  };

  // Seleciona tudo de um grupo
  const handleSelectAllGroup = (cat: any) => {
    const current = formData.permissoes || [];
    const grpIds = cat.opcoes.map((o: any) => o.id);
    const filtered = current.filter((id: string) => !grpIds.includes(id));
    setFormData({ ...formData, permissoes: [...filtered, ...grpIds] });
  };

  // Limpa tudo de um grupo
  const handleClearGroup = (cat: any) => {
    const current = formData.permissoes || [];
    const grpIds = cat.opcoes.map((o: any) => o.id);
    setFormData({ ...formData, permissoes: current.filter((id: string) => !grpIds.includes(id)) });
  };

  // Deleta usuário (Exclusão lógica marcando deleted: true!)
  const handleDeleteUser = (uId: string, uName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Desativar Operador",
      message: `Tem certeza que deseja bloquear e remover o acesso do usuário "${uName}"? Esta ação é imediata.`,
      onConfirm: async () => {
        try {
          await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'usuarios', uId), { deleted: true }, { merge: true });
          logAction('EXCLUSÃO_USUARIO', `Desativou o operador: ${uName}`, 'usuarios', uId);
          addToast(`Operador ${uName} foi desativado com sucesso.`, "success");
        } catch (err) {
          addToast("Erro ao desativar o usuário no servidor.", "error");
        }
      }
    });
  };

  // Submissão do Formulário de Usuário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) return addToast("Preencha o Nome Completo.", "warning");
    if (!formData.usuario.trim()) return addToast("Preencha o Usuário (Login).", "warning");
    if (!formData.senha.trim()) return addToast("Preencha a Senha de Acesso.", "warning");

    // Validação preventiva de Login Duplicado
    const cleanLogin = formData.usuario.trim().toLowerCase();
    const isLoginUsed = usersList.some((u: any) => 
      u.usuario?.trim().toLowerCase() === cleanLogin && 
      u.id !== editingUser?.id
    );
    if (isLoginUsed) {
      return addToast(`Erro: O login de usuário "${formData.usuario}" já está em uso por outro operador!`, "error");
    }

    setIsSaving(true);
    try {
      const payload = {
        nome: formData.nome.trim(),
        usuario: formData.usuario.trim(),
        senha: formData.senha.trim(),
        congregacao_id: formData.congregacao_id,
        nivel: formData.nivel,
        funcao_administrativa: formData.funcao_administrativa,
        permissoes: formData.nivel === 'master' ? [] : formData.permissoes,
        bloqueado: !!formData.bloqueado,
        updatedAt: new Date().toISOString()
      };

      if (editingUser) {
        // Atualiza operador existente
        await setDoc(doc(dbFirestore, 'artifacts', appId, 'public', 'data', 'usuarios', editingUser.id), payload, { merge: true });
        logAction('EDICAO_USUARIO', `Atualizou regras de acesso para o operador: ${payload.nome}`, 'usuarios', editingUser.id);
        addToast("Operador atualizado com sucesso!", "success");
      } else {
        // Cria novo operador
        const newDocRef = await addDoc(collection(dbFirestore, 'artifacts', appId, 'public', 'data', 'usuarios'), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        logAction('CRIACAO_USUARIO', `Cadastrou o novo operador: ${payload.nome}`, 'usuarios', newDocRef.id);
        addToast("Novo operador cadastrado com sucesso!", "success");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast("Erro ao salvar operador. Verifique sua conexão.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-entrance">
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-4 bg-white/50 p-4 rounded-3xl border border-slate-100 shadow-xs">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-500/20"><Shield size={28}/></div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Usuários & Níveis</h2>
            <p className="text-xs text-slate-500 font-bold mt-0.5 uppercase tracking-wider">Gestão e refinamento de permissões do sistema</p>
          </div>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all scale-100 hover:scale-102"
        >
          <Plus size={18}/> Novo Operador
        </button>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-200/80 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[280px]">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar operadores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400 bg-slate-50/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={filterNivel}
            onChange={(e) => setFilterNivel(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold bg-white text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-2xs"
          >
            <option value="all">Nível: Todos</option>
            <option value="master">Nível: MASTER (Irrestrito)</option>
            <option value="restrito">Nível: RESTRITO (Modulado)</option>
          </select>

          <select 
            value={filterCongregacao}
            onChange={(e) => setFilterCongregacao(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold bg-white text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-2xs"
          >
            <option value="all">Congregação: Todas</option>
            <option value="sede">Sede Principal</option>
            {db.congregacoes?.filter((c: any) => !c.deleted).map((c: any) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Listagem de Operadores */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        {filteredUsers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <Shield size={48} className="text-slate-300 mb-4 animate-bounce" />
            <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider">Nenhum Operador Encontrado</h4>
            <p className="text-xs text-slate-400 mt-2">Experimente ajustar seus termos de busca ou filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    <div className="flex flex-col gap-1.5">
                      <span>Nome do Operador / Login</span>
                      <input 
                        type="text" 
                        placeholder="Filtrar..." 
                        value={userColFilters.nome} 
                        onChange={e => setUserColFilters({...userColFilters, nome: e.target.value})}
                        className="px-2 py-1 text-[10px] font-bold border border-slate-200 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                      />
                    </div>
                  </th>
                  <th className="p-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    <div className="flex flex-col gap-1.5">
                      <span>Nível</span>
                      <input 
                        type="text" 
                        placeholder="Filtrar..." 
                        value={userColFilters.nivel} 
                        onChange={e => setUserColFilters({...userColFilters, nivel: e.target.value})}
                        className="px-2 py-1 text-[10px] font-bold border border-slate-200 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                      />
                    </div>
                  </th>
                  <th className="p-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    <div className="flex flex-col gap-1.5">
                      <span>Filial / Congregação</span>
                      <input 
                        type="text" 
                        placeholder="Filtrar..." 
                        value={userColFilters.congregacao} 
                        onChange={e => setUserColFilters({...userColFilters, congregacao: e.target.value})}
                        className="px-2 py-1 text-[10px] font-bold border border-slate-200 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                      />
                    </div>
                  </th>
                  <th className="p-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    <div className="flex flex-col gap-1.5">
                      <span>Permissões Habilitadas</span>
                      <input 
                        type="text" 
                        placeholder="Filtrar..." 
                        value={userColFilters.permissoes} 
                        onChange={e => setUserColFilters({...userColFilters, permissoes: e.target.value})}
                        className="px-2 py-1 text-[10px] font-bold border border-slate-200 rounded bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full"
                      />
                    </div>
                  </th>
                  <th className="p-3 text-xs font-extrabold uppercase tracking-wider text-slate-500 text-right align-top pt-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((operator: any) => {
                  const congName = operator.congregacao_id === 'sede' || !operator.congregacao_id
                    ? 'Sede Principal'
                    : db.congregacoes?.find((c: any) => c.id === operator.congregacao_id)?.nome || 'Outra';

                  return (
                    <tr key={operator.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs border border-slate-200">
                            {operator.nome?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-slate-800 flex items-center gap-2 leading-tight">
                              {operator.nome}
                              {operator.bloqueado && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 font-black text-[8px] uppercase tracking-wider animate-pulse">
                                  BLOQUEADO
                                </span>
                              )}
                            </span>
                            <span className="text-xs font-mono text-slate-400 block mt-0.5">@{operator.usuario}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {operator.nivel === 'master' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                            MASTER
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-[10px] font-black text-amber-700 uppercase tracking-wider">
                            RESTRITO
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs font-black text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-indigo-500 shrink-0"/> {congName}
                        </span>
                      </td>
                      <td className="p-4">
                        {operator.nivel === 'master' ? (
                          <span className="text-xs text-indigo-600 font-extrabold uppercase tracking-wide flex items-center gap-1">
                            Acesso Pleno (Geral)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-bold">
                            <b>{operator.permissoes?.length || 0} de 31</b> módulos concedidos
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button 
                            onClick={() => handleOpenEdit(operator)}
                            className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all font-bold"
                            title="Editar Operador"
                          >
                            <Edit size={16}/>
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(operator.id, operator.nome)}
                            className="p-2.5 rounded-xl border border-slate-200 hover:border-rose-400 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 transition-all"
                            title="Desativar Operador"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL COGNITIVO CUSTOMIZADO: EDIÇÃO & PERMISSÕES EM GRID */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg animate-entrance print:hidden">
          <div className="glass-modern rounded-[2.5rem] shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col h-[90vh] ring-1 ring-white/40 border-0">
            
            {/* Modal Header inside gradient wrapper */}
            <div className="p-6 sm:p-8 flex justify-between items-start relative overflow-hidden shrink-0 shadow-lg border-b border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 bg-[length:200%_200%] animate-pulse-glow"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.15] mix-blend-overlay pointer-events-none"></div>
              <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_90deg_at_50%_50%,rgba(0,0,0,0)_50%,rgba(255,255,255,0.15)_100%)] animate-spin mix-blend-overlay pointer-events-none" style={{ animationDuration: '10s' }}></div>
              <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
              <div className="relative z-10 flex items-center gap-4 sm:gap-6 w-full font-sans">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-xl rounded-[1.2rem] shadow-[0_0_25px_rgba(255,255,255,0.15)] border-y border-white/40 border-x border-white/10 flex items-center justify-center text-white transform -rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-110 shrink-0 group relative">
                  <div className="absolute inset-0 rounded-[1.2rem] bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Shield size={36} className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] relative z-10 sm:w-10 sm:h-10 text-white"/>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] font-black text-white/80 uppercase tracking-[0.4em] mb-1.5 drop-shadow-md">
                    Segurança & Controle • <span className="text-white/60">GIPP Operadores</span>
                  </p>
                  <h3 className="font-extrabold text-2xl sm:text-3xl tracking-tight leading-none drop-shadow-2xl font-[Outfit] text-white">
                    {editingUser ? 'Atualizar Operador' : 'Novo Operador de Acesso'}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="bg-black/30 hover:bg-rose-500 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl text-white/70 hover:text-white transition-all duration-300 shadow-lg border border-white/10 relative z-10 group shrink-0 ml-3 hover:scale-110 cursor-pointer"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300"/>
              </button>
            </div>

            {/* Modal Content Board */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/80 backdrop-blur-md">
              
              <form onSubmit={handleSubmit} id="operator-form" className="space-y-6">
                
                {/* Form Inputs Grid */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Informações de Credenciais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><User size={13} className="text-indigo-500"/> Nome Completo</label>
                      <input 
                        type="text"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full px-4 py-3 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/25"
                        placeholder="Ex: João da Silva"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><User size={13} className="text-indigo-500"/> Usuário (Login)</label>
                      <input 
                        type="text"
                        required
                        value={formData.usuario}
                        onChange={(e) => setFormData({ ...formData, usuario: e.target.value.toLowerCase().replace(/\s/g, "") })}
                        className="w-full px-4 py-3 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/25"
                        placeholder="Ex: joaosilva"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Key size={13} className="text-indigo-500"/> Senha de Acesso</label>
                      <input 
                        type={user?.id === 'dev' ? "text" : "password"}
                        required
                        value={formData.senha}
                        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                        className="w-full px-4 py-3 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-slate-50/25"
                        placeholder="Ex: d123m456"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><MapPin size={13} className="text-indigo-500"/> Congregação</label>
                      <select 
                        value={formData.congregacao_id}
                        onChange={(e) => setFormData({ ...formData, congregacao_id: e.target.value })}
                        className="w-full px-4 py-3 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all bg-slate-50/25"
                      >
                        <option value="sede">Sede Principal</option>
                        {db.congregacoes?.filter((c: any) => !c.deleted).map((c: any) => (
                          <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* Campo de Status da Conta */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-extrabold text-slate-750">Status de Operabilidade da Conta</h5>
                      <p className="text-[10px] text-slate-400 font-medium">Se bloqueado, o operador perderá o acesso instantaneamente às credenciais e painéis do GIPP.</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={!!formData.bloqueado}
                        onChange={(e) => setFormData({ ...formData, bloqueado: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                      <span className="ms-3 text-xs font-black uppercase tracking-wider text-slate-700">
                        {formData.bloqueado ? (
                          <span className="text-rose-600">BLOQUEADO</span>
                        ) : (
                          <span className="text-emerald-600">ATIVO (PERMITIDO)</span>
                        )}
                      </span>
                    </label>
                  </div>

                </div>

                {/* Níveis de Segurança */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Nível de Permissão Fundamental</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    
                    <label className={`flex items-start gap-4 p-5 rounded-2xl cursor-pointer border transition-all ${formData.nivel === 'master' ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                      <input 
                        type="radio" 
                        name="nivel" 
                        value="master" 
                        checked={formData.nivel === 'master'} 
                        onChange={() => setFormData({ ...formData, nivel: 'master', funcao_administrativa: '' })}
                        className="mt-1 accent-indigo-600 scale-110"
                      />
                      <div>
                        <span className="font-extrabold text-sm text-slate-800 block leading-none mb-1">Nível MASTER</span>
                        <span className="text-xs text-slate-400 leading-tight block font-medium">Acesso total e irrestrito ao sistema. Ignora as caixas de seleção de permissão abaixo.</span>
                      </div>
                    </label>

                    <label className={`flex items-start gap-4 p-5 rounded-2xl cursor-pointer border transition-all ${formData.nivel === 'restrito' ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                      <input 
                        type="radio" 
                        name="nivel" 
                        value="restrito" 
                        checked={formData.nivel === 'restrito'} 
                        onChange={() => setFormData({ ...formData, nivel: 'restrito' })}
                        className="mt-1 accent-indigo-600 scale-110"
                      />
                      <div>
                        <span className="font-extrabold text-sm text-slate-800 block leading-none mb-1">Nível RESTRITO (Modulado)</span>
                        <span className="text-xs text-slate-400 leading-tight block font-medium">As restrições de menu e operações serão baseadas estritamente nas caixas de seleção marcadas abaixo.</span>
                      </div>
                    </label>

                  </div>

                  {formData.nivel === 'restrito' && (
                    <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h5 className="text-xs font-black text-indigo-700 uppercase tracking-widest">Módulo de Governança Administrativa</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-bold">Importe um conjunto recomendado de permissões ao selecionar uma governança administrativa:</p>
                      </div>
                      <select 
                        value={formData.funcao_administrativa}
                        onChange={(e) => handleFuncaoChange(e.target.value)}
                        className="border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-2xs"
                      >
                        <option value="">Nenhuma (Personalizado do Zero)</option>
                        <option value="PASTOR PRESIDENTE">Operador: Pastor Presidente / Auxiliar</option>
                        <option value="SECRETARIO">Operador: Secretário Geral</option>
                        <option value="TESOUREIRO">Operador: Tesoureiro / Contador / Auditor</option>
                        <option value="ADMINISTRADOR">Operador: Administrador Geral</option>
                        <option value="ADVOGADO">Operador: Jurídico / Advogado</option>
                        <option value="LIDER DE DEPARTAMENTO">Operador: Líder de Ministério</option>
                        <option value="AUXILIAR">Operador: Auxiliar / Apoio Voluntário</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Grid das Permissões (Exibido apenas em nível restrito!) */}
                {formData.nivel === 'master' ? (
                  <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
                    <Info size={24} className="text-indigo-500 shrink-0"/>
                    <div>
                      <h4 className="font-black text-indigo-800 text-sm uppercase tracking-widest mb-1">Acesso Irrestrito Ativado</h4>
                      <p className="text-xs text-indigo-705 leading-relaxed font-semibold">Os operadores pertencentes ao nível <b>MASTER</b> têm permissão irrestrita para visualizar dados e gerir registros em todos os módulos e filiais.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Lock size={16} className="text-indigo-500"/>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Painel Modular de Permissões de Acesso (31 Módulos)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                      {CATEGORIAS_PERMISSOES.map((cat, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-full hover:border-slate-300 transition-all">
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><cat.icon size={18}/></div>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-800 tracking-tight">{cat.titulo}</h4>
                                <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">{cat.desc}</p>
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button 
                                type="button" 
                                onClick={() => handleSelectAllGroup(cat)} 
                                className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors border border-indigo-100/30"
                              >
                                Tudo
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleClearGroup(cat)} 
                                className="text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200/30"
                              >
                                Limpar
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                            {cat.opcoes.map(opt => {
                              const isChecked = formData.permissoes?.includes(opt.id);
                              return (
                                <label 
                                  key={opt.id} 
                                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border text-slate-700 hover:text-slate-900 ${isChecked ? 'bg-indigo-50/30 border-indigo-200/70 shadow-xs' : 'bg-white border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/50'}`}
                                >
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' : 'bg-white border-slate-300'}`}>
                                    {isChecked && <Check size={12} strokeWidth={3}/>}
                                  </div>
                                  <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={isChecked || false}
                                    onChange={() => handleTogglePermission(opt.id)}
                                  />
                                  <span className="text-xs font-bold leading-tight select-none">{opt.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </form>

            </div>

            {/* Modal Actions Footer */}
            <div className="bg-white/60 backdrop-blur-md border-t border-slate-250/50 px-8 py-5 flex items-center justify-between shrink-0 rounded-b-[2.5rem]">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              
              <button 
                type="submit" 
                form="operator-form"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all scale-100 hover:scale-102 cursor-pointer"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Check size={16}/>} 
                {isSaving ? 'A salvar configurações...' : 'Salvar Regras de Acesso'}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
});

export default ModuleUsuarios;
