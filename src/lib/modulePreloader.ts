// src/lib/modulePreloader.ts - Gerenciador de Pré-carregamento Inteligente de Módulos para Ultra-Velocidade
type ModuleLoader = () => Promise<any>;

const MODULE_IMPORT_MAP: Record<string, ModuleLoader> = {
  'cad_membro': () => import('../components/ModuleMembros'),
  'fin_entrada': () => import('../components/ModuleFinanceiro'),
  'fin_saida': () => import('../components/ModuleFinanceiro'),
  'fin_dre': () => import('../components/ModuleFinanceiro'),
  'secretaria_integrada': () => import('../components/ModuleSecretariaIntegrada'),
  'cad_departamento': () => import('../components/ModuleMinisterios'),
  'ministerio_louvor': () => import('../components/ModuleMinisterios'),
  'ministerio_midia': () => import('../components/ModuleMinisterios'),
  'secretaria_ebd': () => import('../components/ModuleEBD'),
  'curso_teologia': () => import('../components/ModuleTeologia'),
  'formacao_obreiros': () => import('../components/ModuleFormacaoObreiros'),
  'biblia': () => import('../components/ModuleBiblia'),
  'loja_virtual': () => import('../components/ModuleLojaVirtualAdmin'),
  'relatorios': () => import('../components/ModuleRelatorios'),
  'salinha_kids': () => import('../components/ModuleSalinhaKids'),
  'gestao_cursos': () => import('../components/ModuleGestaoCursos'),
  'boletim': () => import('../components/ModuleBoletim'),
  'cad_igreja': () => import('../components/ModuleIgreja'),
  'cad_patrimonio': () => import('../components/ModulePatrimonio'),
  'controle_frotas': () => import('../components/ModuleFrotas'),
  'cad_celula': () => import('../components/ModuleCelulas'),
  'visitantes': () => import('../components/ModuleVisitantes'),
  'cad_usuario': () => import('../components/ModuleUsuarios'),
  'acessos_portal': () => import('../components/ModuleAcessosPortal'),
  'ministerio_familia': () => import('../components/ModuleFamilia'),
  'secretaria_livro_atas': () => import('../components/ModuleLivroAtas'),
  'secretaria_certificados': () => import('../components/ModuleCertificados'),
  'carteirinha_studio': () => import('../components/ModuleCarteirinha'),
  'credencial_lote': () => import('../components/ModuleCredencial'),
  'missoes_painel': () => import('../components/ModuleMissoes'),
  'rede_social': () => import('../components/ModuleRedeSocial'),
  'interativo': () => import('../components/ModuleInterativo'),
  'docs_editor': () => import('../components/ModuleGippDocs'),
  'sheets_editor': () => import('../components/ModuleGippPlanilhas'),
  'google_sheets': () => import('../components/ModuleGoogleSheets'),
  'google_docs': () => import('../components/ModuleGoogleDocs'),
  'google_tasks': () => import('../components/ModuleGoogleTasks'),
  'google_calendar': () => import('../components/ModuleGoogleCalendar'),
  'gmail_oficial': () => import('../components/ModuleGmail'),
  'google_forms': () => import('../components/ModuleGoogleForms'),
  'google_classroom': () => import('../components/ModuleGoogleClassroom'),
  'google_meet': () => import('../components/ModuleGoogleMeet'),
  'assistente_ai': () => import('../components/ModuleAssistenteAI'),
  'dp_contabilidade': () => import('../components/ModuleDPContabilidade'),
  'fin_conciliacao': () => import('../components/ModuleConciliacaoBancaria'),
  'fin_carnes': () => import('../components/ModuleCarnes'),
  'fin_utilitarios': () => import('../components/ModuleUtilitarios'),
  'config_backup': () => import('../components/ModuleBackup'),
  'auditoria': () => import('../components/ModuleAuditoria'),
  'lixeira': () => import('../components/ModuleLixeira'),
  'sobre': () => import('../components/ModuleSobre'),
  'manual': () => import('../components/ModuleManualUsuario'),
  'amparo_legal': () => import('../components/ModuleAmparoLegal'),
  'registro_software': () => import('../components/ModuleRegistroSoftware'),
  'portal_pastor': () => import('../components/ModulePortalPastor'),
  'portal_tesoureiro': () => import('../components/ModulePortalTesoureiro'),
  'desenvolvedor': () => import('../components/ModuleDesenvolvedor'),
  'config_visual': () => import('../components/ModuleConfigVisual'),
  'config_sistema': () => import('../components/ModuleConfiguracoesGerais'),
  'mensagens_lote': () => import('../components/ModuleMensagensLote'),
  'qr_checkin': () => import('../components/ModuleQrCheckin'),
  'marketing_social': () => import('../components/ModuleMarketingSocial'),
  'suporte_dev': () => import('../components/ModuleDevSuporte'),
  'email_interno': () => import('../components/ModuleEmailAdmin'),
  'changelog': () => import('../components/ModuleChangelog'),
};

const preloadedSet = new Set<string>();
let isBackgroundPreloadRunning = false;

/**
 * Pré-carrega um módulo específico sob demanda (ex: ao passar o mouse sobre o menu/ícone)
 */
export function preloadModule(moduleId: string): void {
  if (!moduleId || preloadedSet.has(moduleId)) return;
  const loader = MODULE_IMPORT_MAP[moduleId];
  if (loader) {
    preloadedSet.add(moduleId);
    loader().catch(() => {
      // Se falhar (ex: rede instável), permite nova tentativa posterior
      preloadedSet.delete(moduleId);
    });
  }
}

/**
 * Inicia o pré-carregamento em segundo plano durante o tempo ocioso do navegador
 * Prioriza os módulos mais acessados da igreja (Secretaria, Membros, Financeiro, Mídia, Teologia)
 */
export function startBackgroundModulePreload(): void {
  if (typeof window === 'undefined' || isBackgroundPreloadRunning) return;
  isBackgroundPreloadRunning = true;

  // Lista com ordem de prioridade de uso
  const priorityKeys = [
    'cad_membro',
    'fin_entrada',
    'fin_saida',
    'secretaria_integrada',
    'ministerio_midia',
    'ministerio_louvor',
    'secretaria_ebd',
    'curso_teologia',
    'biblia',
    'loja_virtual',
    'relatorios',
    'config_sistema',
    'config_visual',
    'boletim',
    'cad_patrimonio',
    'visitantes',
    'cad_departamento',
    'secretaria_certificados',
    'carteirinha_studio',
    'docs_editor',
    'sheets_editor',
    'assistente_ai',
    'fin_dre',
    'fin_conciliacao',
    'mensagens_lote',
    'portal_pastor',
    'sobre',
    'manual'
  ];

  // Restante dos módulos
  const remainingKeys = Object.keys(MODULE_IMPORT_MAP).filter(k => !priorityKeys.includes(k));
  const fullQueue = [...priorityKeys, ...remainingKeys];

  let queueIndex = 0;

  const processNextChunk = () => {
    if (queueIndex >= fullQueue.length) return;
    const currentKey = fullQueue[queueIndex++];
    
    if (!preloadedSet.has(currentKey)) {
      preloadModule(currentKey);
    }

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        setTimeout(processNextChunk, 80);
      }, { timeout: 1500 });
    } else {
      setTimeout(processNextChunk, 100);
    }
  };

  // Dá um respiro inicial de 1.2s para priorizar a renderização limpa da tela inicial
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      setTimeout(processNextChunk, 800);
    }, { timeout: 2500 });
  } else {
    setTimeout(processNextChunk, 1200);
  }
}
