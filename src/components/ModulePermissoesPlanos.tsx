import React, { useState, useContext, useMemo } from 'react';
import { 
  Shield, Check, X, AlertTriangle, Layers, Award, Sparkles, CheckCircle2, 
  ExternalLink, Phone, FileSignature, ArrowRight, Sliders, RefreshCw,
  Search, Filter, Lock, Unlock, HelpCircle, ChevronRight, Info, Printer
} from 'lucide-react';
import { ChurchContext } from '../context/ChurchContext';

interface ModuleItem {
  id: string;
  label: string;
  desc: string;
  category: string;
}

const ALL_SYSTEM_MODULES: ModuleItem[] = [
  // Administrativo & Cadastros
  { id: 'cad_membro', label: 'Rol de Membros & Fichas Ministeriais', desc: 'Gestão cadastral completa, emissão de ficha e histórico eclesiástico.', category: 'Administrativo' },
  { id: 'visitantes', label: 'CRM de Visitantes & Consolidação', desc: 'Acolhimento, relatórios e acompanhamento de visitantes.', category: 'Administrativo' },
  { id: 'cad_igreja', label: 'Igreja Sede, Filiais & Congregações', desc: 'Multi-igrejas, sedes distritais e contas bancárias vinculadas.', category: 'Administrativo' },
  { id: 'cad_patrimonio', label: 'Patrimônio & Bens Eclesiásticos', desc: 'Controle de bens móveis, imóveis e inventário anual timbrado.', category: 'Administrativo' },
  { id: 'controle_frotas', label: 'Controle de Frotas & Veículos', desc: 'Gestão de vans, ônibus, manutenções preventivas e motoristas.', category: 'Administrativo' },
  { id: 'cad_celula', label: 'Células & Pequenos Grupos', desc: 'Supervisão de líderes, anfitriões, redes e relatórios semanais.', category: 'Administrativo' },
  { id: 'cad_departamento', label: 'Departamentos & Ministérios Gerais', desc: 'Criação e acompanhamento de diretorias departamentais.', category: 'Administrativo' },
  { id: 'loja_virtual', label: 'Loja Virtual Eclesiástica & Retaguarda', desc: 'Catálogo de artigos, sacola, checkout, DAV fiscal e pedidos.', category: 'Administrativo' },

  // Segurança & Acessos
  { id: 'cad_usuario', label: 'Usuários & Permissões do Sistema', desc: 'Matriz granular de operadores, nível Master vs Restrito.', category: 'Segurança' },
  { id: 'acessos_portal', label: 'Acessos & Permissões do Portal do Membro', desc: 'Mapeamento de funções administrativas e permissões personalizadas.', category: 'Segurança' },
  { id: 'permissoes_planos', label: 'Gestão de Permissões de Planos SaaS', desc: 'Painel de controle de recursos e ativação de módulos por plano.', category: 'Segurança' },
  { id: 'auditoria', label: 'Auditoria & Logs de Segurança', desc: 'Rastreabilidade com histórico de modificações e IPs conectados.', category: 'Segurança' },
  { id: 'auditoria_aparelhos', label: 'Auditoria de Aparelhos SaaS & Telemetria Real', desc: 'Identificação contínua de hardware, IP real, geolocalização e canais push criptografados (100% Real).', category: 'Segurança' },
  { id: 'lixeira', label: 'Lixeira Virtual do Sistema', desc: 'Recuperação segura de registros deletados acidentalmente.', category: 'Segurança' },
  { id: 'config_backup', label: 'Backup Geral (Local & Nuvem)', desc: 'Exportação e restauração total de dados e configurações.', category: 'Segurança' },

  // Ministérios & Cuidado
  { id: 'ministerio_louvor', label: 'Ministério de Louvor, Repertório & Cifras Interativas', desc: 'Repertório musical, pastas litúrgicas, cifras com transposição harmônica, capotraste inteligente, auto-scroll, cursor de foco, metrônomo e leitor de culto ao vivo.', category: 'Ministérios' },
  { id: 'ministerio_midia', label: 'Ministério de Mídia & Transmissão', desc: 'Equipamentos, escalas de câmeras, som e biblioteca de artes.', category: 'Ministérios' },
  { id: 'ministerio_familia', label: 'Ministério da Família & Gabinete', desc: 'Aconselhamento matrimonial, cursos de noivos e visitas.', category: 'Ministérios' },
  { id: 'salinha_kids', label: 'Salinha Kids & Berçário com Check-in', desc: 'Segurança com PIN secreto, etiquetas de segurança e crachás.', category: 'Ministérios' },
  { id: 'missoes_painel', label: 'Departamento de Missões & Projetos', desc: 'Acompanhamento de missionários no campo, relatórios e sustento.', category: 'Ministérios' },

  // Financeiro & Tesouraria
  { id: 'fin_entrada', label: 'Receitas (Dízimos & Ofertas)', desc: 'Lançamento com PIX dinâmico, comprovantes e envelopes por culto.', category: 'Financeiro' },
  { id: 'fin_saida', label: 'Despesas & Pagamentos a Fornecedores', desc: 'Contas a pagar, anexos de notas fiscais e centros de custo.', category: 'Financeiro' },
  { id: 'fin_dre', label: 'DRE Gerencial, Balancete & Livro Caixa', desc: 'Demonstrativos contábeis mensais para conselho fiscal da igreja.', category: 'Financeiro' },
  { id: 'fin_conciliacao', label: 'Conciliação Bancária & DDA Boletos', desc: 'Conferência de extrato OFX e cruzamento bancário.', category: 'Financeiro' },
  { id: 'fin_carnes', label: 'Carnês de Dizimistas & Campanhas de Fé', desc: 'Geração de carnês com código de barras, PIX e controle de parcelas.', category: 'Financeiro' },
  { id: 'fin_utilitarios', label: 'Fornecedores & Centros de Custo', desc: 'Bases financeiras e parametrização contábil.', category: 'Financeiro' },
  { id: 'dp_contabilidade', label: 'Departamento Pessoal & RH da Igreja', desc: 'Folhas de pagamento, controle de encargos e recibos salariais.', category: 'Financeiro' },

  // Secretaria & Relatórios
  { id: 'secretaria_integrada', label: 'Secretaria & Agenda Oficial de Cultos', desc: 'Quadro geral de tarefas, reuniões de diretoria e contatos.', category: 'Secretaria' },
  { id: 'secretaria_livro_atas', label: 'Livro Oficial de Atas Registradas', desc: 'Lavratura digital de atas de assembleias gerais e posse de diretoria.', category: 'Secretaria' },
  { id: 'secretaria_certificados', label: 'Emissão de Certificados com Timbre', desc: 'Batismo, apresentação de crianças, consagração e casamentos.', category: 'Secretaria' },
  { id: 'carteirinha_studio', label: 'Estúdio de Carteirinhas & Credenciais', desc: 'Geração de credenciais PVC com QR Code e foto digital.', category: 'Secretaria' },
  { id: 'credencial_lote', label: 'Emissão de Credenciais em Lote', desc: 'Processamento simultâneo para convenções e obreiros do campo.', category: 'Secretaria' },
  { id: 'relatorios', label: 'Central de Relatórios Estatísticos (PDF)', desc: 'Mapas de crescimento, frequência e dados eclesiásticos consolidados.', category: 'Secretaria' },

  // Ensino & Capacitações
  { id: 'secretaria_ebd', label: 'Gestão da Escola Dominical (EBD)', desc: 'Turmas, chamada dominical, ofertas da classe e controle de revistas.', category: 'Ensino' },
  { id: 'gestao_cursos', label: 'EAD & Cursos de Capacitação Online', desc: 'Plataforma de ensino ministerial com videoaulas e questionários.', category: 'Ensino' },
  { id: 'curso_teologia', label: 'Universidade Teológica Básica GIPP', desc: '24 capítulos alinhados à Declaração de Fé CGADB/CPAD com avaliação.', category: 'Ensino' },
  { id: 'formacao_obreiros', label: 'Formação Ministerial de Obreiros', desc: 'Apostilas oficiais para diáconos, presbíteros e evangelistas.', category: 'Ensino' },
  { id: 'biblia', label: 'Bíblia de Estudos & Consulta Integrada', desc: 'Textos sagrados, referências cruzadas e concordância.', category: 'Ensino' },

  // Google Workspace
  { id: 'google_meet', label: 'Google Meet (Salas Virtuais de Oração)', desc: 'Videoconferências para estudos bíblicos e reuniões pastorais.', category: 'Google Workspace' },
  { id: 'google_sheets', label: 'Google Sheets (Planilhas em Nuvem)', desc: 'Tabelas sincronizadas oficialmente na conta Google da igreja.', category: 'Google Workspace' },
  { id: 'google_docs', label: 'Google Docs (Documentos & Ofícios)', desc: 'Ofícios e correspondências na nuvem oficial.', category: 'Google Workspace' },
  { id: 'google_tasks', label: 'Google Tasks (Metas da Liderança)', desc: 'Organização de pendências da congregação sincronizadas.', category: 'Google Workspace' },
  { id: 'google_calendar', label: 'Google Calendar (Agenda Unificada)', desc: 'Sincronização de datas de eventos nos smartphones.', category: 'Google Workspace' },
  { id: 'gmail_oficial', label: 'Gmail Eclesiástico Oficial', desc: 'Caixa postal oficial da congregação.', category: 'Google Workspace' },
  { id: 'google_forms', label: 'Google Forms (Enquetes & Formulários)', desc: 'Criação e gestão de cadastros públicos no Drive.', category: 'Google Workspace' },
  { id: 'google_classroom', label: 'Google Classroom (Salas de Aula EAD)', desc: 'Discipulado e classes teológicas estruturadas.', category: 'Google Workspace' },

  // Comunicação & Escritório
  { id: 'rede_social', label: 'Estúdio de Artes & Mídia', desc: 'Criação de banners para redes sociais e templates oficiais.', category: 'Comunicação' },
  { id: 'boletim', label: 'Boletim Semanal & Noticiário Eclesiástico', desc: 'Informativo dominical com liturgia e anúncios da semana.', category: 'Comunicação' },
  { id: 'email_interno', label: 'Webmail & Mensagens Internas GIPP', desc: 'Comunicação corporativa direta entre os líderes da igreja.', category: 'Comunicação' },
  { id: 'assistente_ai', label: 'Assistente Pastoral com Inteligência Artificial', desc: 'Geração de sermões, esboços, cartas e orientações pastorais.', category: 'Comunicação' },
  { id: 'access_interativo', label: 'Módulo Interativo & Desafios Bíblicos', desc: 'Gamificação para jovens e adolescentes com quiz e medalhas.', category: 'Comunicação' },
  { id: 'docs_editor', label: 'GIPP DOCs (Editor de Documentos)', desc: 'Processador de textos integrado para cartas ministeriais.', category: 'Comunicação' },
  { id: 'sheets_editor', label: 'GIPP Planilhas (Planilhas Eletrônicas)', desc: 'Manipulação de planilhas locais com suporte a fórmulas.', category: 'Comunicação' }
];

export const ModulePermissoesPlanos = () => {
  const { db, setDoc, doc, dbFirestore, appId, addToast, user } = useContext(ChurchContext);
  const isMaster = user?.nivel === 'master' || user?.id === 'dev' || user?.id === 'admin-master';

  const currentPlan = (db.igreja?.plano || 'avancado').toLowerCase();
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'matriz' | 'meu_plano' | 'upgrade'>('matriz');

  const planosConfig = useMemo(() => {
    const defaultPlanos: Record<string, string[]> = {
      basico: [
        'dashboard', 'cad_igreja', 'cad_membro', 'visitantes', 'cad_usuario', 'acessos_portal', 
        'permissoes_planos', 'secretaria_integrada', 'secretaria_livro_atas', 'sobre', 'changelog', 
        'assistente_ai', 'salinha_kids', 'config_visual', 'config_sistema', 'manual', 'amparo_legal', 
        'registro_software', 'ministerio_familia', 'access_interativo', 'loja_virtual', 'auditoria_aparelhos',
        'docs_editor', 'sheets_editor', 'google_meet', 'google_sheets', 'google_docs', 'google_tasks', 
        'google_calendar', 'gmail_oficial', 'google_forms', 'google_classroom'
      ],
      standard: [
        'dashboard', 'cad_igreja', 'cad_membro', 'visitantes', 'cad_usuario', 'acessos_portal', 
        'permissoes_planos', 'secretaria_integrada', 'secretaria_livro_atas', 'sobre', 'changelog', 
        'assistente_ai', 'cad_celula', 'fin_entrada', 'fin_saida', 'fin_dre', 'fin_carnes', 
        'fin_utilitarios', 'secretaria_certificados', 'carteirinha_studio', 'grid', 'credencial_lote', 
        'relatorios', 'salinha_kids', 'config_visual', 'config_sistema', 'manual', 'amparo_legal', 
        'registro_software', 'dp_contabilidade', 'controle_frotas', 'curso_teologia', 'formacao_obreiros', 
        'ministerio_familia', 'access_interativo', 'loja_virtual', 'ministerio_louvor', 'auditoria_aparelhos',
        'docs_editor', 'sheets_editor', 'google_meet', 'google_sheets', 'google_docs', 'google_tasks', 
        'google_calendar', 'gmail_oficial', 'google_forms', 'google_classroom'
      ],
      avancado: [
        'dashboard', 'changelog', 'sobre', 'cad_membro', 'visitantes', 'cad_igreja', 'cad_patrimonio', 
        'controle_frotas', 'cad_celula', 'cad_usuario', 'acessos_portal', 'permissoes_planos', 
        'cad_departamento', 'ministerio_louvor', 'ministerio_midia', 'fin_entrada', 'fin_saida', 
        'fin_dre', 'fin_conciliacao', 'fin_carnes', 'fin_utilitarios', 'boletim', 'biblia', 
        'assistente_ai', 'email_interno', 'secretaria_integrada', 'secretaria_livro_atas', 
        'secretaria_certificados', 'carteirinha_studio', 'grid', 'credencial_lote', 'secretaria_ebd', 
        'gestao_cursos', 'curso_teologia', 'formacao_obreiros', 'missoes_painel', 'rede_social', 
        'relatorios', 'config_backup', 'auditoria', 'auditoria_aparelhos', 'lixeira', 'salinha_kids', 'config_visual', 
        'config_sistema', 'manual', 'amparo_legal', 'registro_software', 'dp_contabilidade', 
        'ministerio_familia', 'access_interativo', 'loja_virtual',
        'docs_editor', 'sheets_editor', 'google_meet', 'google_sheets', 'google_docs', 'google_tasks', 
        'google_calendar', 'gmail_oficial', 'google_forms', 'google_classroom'
      ]
    };

    if (db.igreja?.planos_config) {
      return {
        basico: db.igreja.planos_config.basico || defaultPlanos.basico,
        standard: db.igreja.planos_config.standard || defaultPlanos.standard,
        avancado: db.igreja.planos_config.avancado || defaultPlanos.avancado
      };
    }
    return defaultPlanos;
  }, [db.igreja?.planos_config]);

  const planosValores = db.igreja?.planos_valores || {
    basico: 69,
    standard: 129,
    avancado: 197
  };

  const categories = useMemo(() => {
    const list = Array.from(new Set(ALL_SYSTEM_MODULES.map(m => m.category)));
    return ['todos', ...list];
  }, []);

  const filteredModules = useMemo(() => {
    return ALL_SYSTEM_MODULES.filter(m => {
      const matchCat = selectedCategory === 'todos' || m.category === selectedCategory;
      const matchQuery = searchQuery.trim() === '' || 
        m.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handlePrintMatrix = () => {
    window.print();
  };

  const planTitles: Record<string, { title: string; color: string; bg: string; border: string; desc: string }> = {
    basico: {
      title: 'Plano Básico',
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      desc: 'Ideal para congregações em fase inicial e pequenas frentes missionárias.'
    },
    standard: {
      title: 'Plano Standard',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      desc: 'Solução completa para igrejas locais com fluxo financeiro e escola bíblica.'
    },
    avancado: {
      title: 'Plano Avançado (Platinum)',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      desc: 'Pacote total com 100% dos recursos, integrações em nuvem e governança.'
    }
  };

  const currentPlanMeta = planTitles[currentPlan] || planTitles.avancado;

  return (
    <div id="module-permissoes-planos-container" className="p-4 md:p-8 max-w-7xl mx-auto animate-fadeIn space-y-6">
      
      {/* Header do Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Layers size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Permissões de Planos SaaS</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                GIPP v13.0.0
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Governança central, controle de cotas e matriz de ativação de recursos por assinatura.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-print-plan-matrix"
            onClick={handlePrintMatrix}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer size={15} />
            Imprimir Matriz
          </button>
          
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 ${currentPlanMeta.bg} ${currentPlanMeta.border}`}>
            <Award size={18} className={currentPlanMeta.color} />
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block leading-tight">Plano Ativo</span>
              <span className={`text-xs font-black ${currentPlanMeta.color}`}>{currentPlanMeta.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          id="tab-btn-matriz"
          onClick={() => setActiveTab('matriz')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'matriz' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={16} />
          Matriz Completa dos Planos
        </button>
        <button
          id="tab-btn-meu-plano"
          onClick={() => setActiveTab('meu_plano')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'meu_plano' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield size={16} />
          Recursos Liberados para Minha Igreja
        </button>
        <button
          id="tab-btn-upgrade"
          onClick={() => setActiveTab('upgrade')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'upgrade' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles size={16} />
          Comparativo & Upgrade de Assinatura
        </button>
      </div>

      {/* ABA 1: MATRIZ COMPLETA DE MÓDULOS */}
      {activeTab === 'matriz' && (
        <div className="space-y-6">
          {/* Filtros e Barra de Pesquisa */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-search-plan-modules"
                type="text"
                placeholder="Pesquisar funcionalidade ou módulo..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Categoria:</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat === 'todos' ? 'Todos os Módulos' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tabela da Matriz */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-bold">
                    <th className="p-4 w-5/12">Funcionalidade / Módulo</th>
                    <th className="p-4 w-2/12">Categoria</th>
                    <th className="p-4 w-1/12 text-center bg-slate-800">
                      BÁSICO
                      <span className="block text-[9px] font-mono text-slate-400 font-normal">R$ {planosValores.basico}/mês</span>
                    </th>
                    <th className="p-4 w-2/12 text-center bg-indigo-900/80">
                      STANDARD
                      <span className="block text-[9px] font-mono text-indigo-300 font-normal">R$ {planosValores.standard}/mês</span>
                    </th>
                    <th className="p-4 w-2/12 text-center bg-amber-900/80">
                      AVANÇADO
                      <span className="block text-[9px] font-mono text-amber-300 font-normal">R$ {planosValores.avancado}/mês</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredModules.map((mod, idx) => {
                    const hasBasico = planosConfig.basico.includes(mod.id);
                    const hasStandard = planosConfig.standard.includes(mod.id);
                    const hasAvancado = planosConfig.avancado.includes(mod.id);

                    return (
                      <tr key={mod.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-4">
                          <span className="font-extrabold text-slate-800 block text-xs md:text-sm">{mod.label}</span>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">{mod.desc}</p>
                          <span className="text-[9px] font-mono text-slate-400 mt-1 inline-block">chave: {mod.id}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            {mod.category}
                          </span>
                        </td>
                        <td className="p-4 text-center bg-slate-50/30">
                          {hasBasico ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
                              <Check size={16} strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-300">
                              <X size={14} strokeWidth={2.5} />
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center bg-indigo-50/20">
                          {hasStandard ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
                              <Check size={16} strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-300">
                              <X size={14} strokeWidth={2.5} />
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center bg-amber-50/20">
                          {hasAvancado ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
                              <Check size={16} strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-300">
                              <X size={14} strokeWidth={2.5} />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-2">
              <span>Mostrando <strong>{filteredModules.length}</strong> de {ALL_SYSTEM_MODULES.length} módulos eclesiásticos certificados.</span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Módulo incluso no plano
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block ml-2"></span> Não disponível
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: RECURSOS DO MEU PLANO */}
      {activeTab === 'meu_plano' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 text-indigo-300 border border-white/10">
                Identificação Institucional
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {db.igreja?.nome || "Igreja Local Cadastrada"}
              </h2>
              <p className="text-sm text-indigo-200 leading-relaxed font-medium">
                Sua instituição está atualmente operando sob o <strong>{currentPlanMeta.title}</strong> com {planosConfig[currentPlan]?.length || ALL_SYSTEM_MODULES.length} funcionalidades ativas e sincronização contínua na nuvem.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                  <span className="text-white/60 block text-[10px] uppercase font-bold">CNPJ / Registro</span>
                  <span className="font-mono font-bold text-white">{db.igreja?.cnpj || "Não cadastrado"}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                  <span className="text-white/60 block text-[10px] uppercase font-bold">Investimento Mensal</span>
                  <span className="font-mono font-bold text-white">R$ {planosValores[currentPlan] || 197},00</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                  <span className="text-white/60 block text-[10px] uppercase font-bold">Versão do Sistema</span>
                  <span className="font-mono font-bold text-emerald-400">v13.0.0 Platinum v18</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_SYSTEM_MODULES.map(mod => {
              const isIncluded = planosConfig[currentPlan]?.includes(mod.id);
              return (
                <div 
                  key={mod.id} 
                  className={`p-5 rounded-2xl border transition-all ${
                    isIncluded 
                      ? 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs' 
                      : 'bg-slate-50/70 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                      {mod.category}
                    </span>
                    {isIncluded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check size={12} strokeWidth={3} /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                        <Lock size={12} /> Bloqueado
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm">{mod.label}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{mod.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 3: COMPARATIVO & UPGRADE */}
      {activeTab === 'upgrade' && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 py-4">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Expanda os Horizontes do Ministério
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              Escolha o Pacote Ideal para Sua Igreja
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Todos os planos contam com suporte eclesiástico dedicado, banco de dados criptografado e atualizações contínuas de novos recursos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CARD BÁSICO */}
            <div className={`bg-white rounded-3xl p-6 border-2 flex flex-col justify-between shadow-sm relative transition-all ${
              currentPlan === 'basico' ? 'border-sky-500 ring-4 ring-sky-50' : 'border-slate-200 hover:border-slate-300'
            }`}>
              {currentPlan === 'basico' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  Plano Atual
                </span>
              )}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800">Plano Básico</h3>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-sky-50 text-sky-700 border border-sky-200">Essencial</span>
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900">R$ {planosValores.basico}</span>
                  <span className="text-xs text-slate-400 font-semibold"> /mês</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Atende a congregações em implantação que necessitam de cadastro de membros, atas e emissão de notas e carteirinhas.
                </p>
                <div className="border-t border-slate-100 pt-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Cadastro de Membros & Fichas Ministeriais</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Secretaria & Livro Digital de Atas</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Salinha Kids com Check-in Seguro</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Loja Virtual & Emissão Fiscal / DAV</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Suíte Google Workspace Integrada</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <X size={14} className="text-slate-300 shrink-0" />
                    <span className="line-through">DRE Gerencial & Conciliação Bancária</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <X size={14} className="text-slate-300 shrink-0" />
                    <span className="line-through">Capacitações EAD & Teologia Básica</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href={`https://wa.me/5511987654321?text=Olá! Gostaria de migrar para o Plano Básico no sistema GIPP da igreja ${encodeURIComponent(db.igreja?.nome || '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Phone size={14} /> Falar com Consultor
                </a>
              </div>
            </div>

            {/* CARD STANDARD */}
            <div className={`bg-white rounded-3xl p-6 border-2 flex flex-col justify-between shadow-sm relative transition-all ${
              currentPlan === 'standard' ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-200 hover:border-slate-300'
            }`}>
              {currentPlan === 'standard' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  Plano Atual
                </span>
              )}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800">Plano Standard</h3>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">Recomendado</span>
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900">R$ {planosValores.standard}</span>
                  <span className="text-xs text-slate-400 font-semibold"> /mês</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Ideal para igrejas com tesouraria ativa, departamentos, células, emissão de carnês e escola bíblica regular.
                </p>
                <div className="border-t border-slate-100 pt-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Todos os recursos do Plano Básico</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Tesouraria Completa (Entradas, Saídas & DRE)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Carnês de Dizimistas & Campanhas de Fé</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Células, Grupos & Frotas de Veículos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Estudo de Teologia Básico (CGADB / CPAD)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>Carteirinhas PVC & Credenciais em Lote</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <X size={14} className="text-slate-300 shrink-0" />
                    <span className="line-through">Missões no Campo & Cursos EAD Avançados</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href={`https://wa.me/5511987654321?text=Olá! Gostaria de migrar para o Plano Standard no sistema GIPP da igreja ${encodeURIComponent(db.igreja?.nome || '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  <Sparkles size={14} /> Quero o Plano Standard
                </a>
              </div>
            </div>

            {/* CARD AVANÇADO */}
            <div className={`bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-3xl p-6 border-2 flex flex-col justify-between shadow-xl relative transition-all ${
              currentPlan === 'avancado' ? 'border-amber-400 ring-4 ring-amber-400/20' : 'border-indigo-500/40'
            }`}>
              {currentPlan === 'avancado' ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  Plano Ativo (Platinum)
                </span>
              ) : (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  Mais Completo
                </span>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white">Plano Avançado</h3>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">Platinum v18</span>
                </div>
                <div>
                  <span className="text-3xl font-black text-white">R$ {planosValores.avancado}</span>
                  <span className="text-xs text-indigo-300 font-semibold"> /mês</span>
                </div>
                <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                  Experiência ilimitada para sedes de ministério, campos convencionais e igrejas que demandam controle pleno e governança.
                </p>
                <div className="border-t border-white/10 pt-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>100% dos Módulos do Sistema Liberados</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Plataforma EAD & Cursos de Formação Obreiros</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Conciliação Bancária com DDA & Leitor OFX</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Gestão de Missões & Sustento de Missionários</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Ministério de Louvor com Pastas Musicais & Cifras</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Backup Total Automático em Nuvem & Local</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>Suporte Prioritário VIP com SLA Reduzido</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href={`https://wa.me/5511987654321?text=Olá! Gostaria de migrar para o Plano Avançado Platinum no sistema GIPP da igreja ${encodeURIComponent(db.igreja?.nome || '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Award size={14} /> Ativar Plano Avançado Platinum
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ModulePermissoesPlanos;
