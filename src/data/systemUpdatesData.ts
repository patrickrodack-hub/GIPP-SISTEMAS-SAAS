/**
 * GIPP - Central de Atualizações e Registro de Novidades do Sistema (Changelog / Release Notes)
 * Armazena a versão corrente do ecossistema e o histórico detalhado de cada atualização.
 */

export interface SystemUpdateHighlight {
  iconName: 'music' | 'book' | 'shield' | 'sparkles' | 'database' | 'cpu' | 'bell' | 'tv' | 'check';
  title: string;
  description: string;
  badge?: string;
  color?: string;
}

export interface SystemUpdateCategory {
  category: string;
  iconName: string;
  items: string[];
}

export interface SystemUpdate {
  version: string;
  buildCode: string;
  releaseDate: string;
  badge: string;
  title: string;
  summary: string;
  highlights: SystemUpdateHighlight[];
  categories: SystemUpdateCategory[];
}

/** Versão oficial ativa em produção */
export const SYSTEM_CURRENT_VERSION = '14.0.0';
export const SYSTEM_CURRENT_BUILD = '2026.10.26.2';

/** Histórico cronológico das atualizações (mais recente no topo) */
export const SYSTEM_UPDATES_HISTORY: SystemUpdate[] = [
  {
    version: '14.0.0',
    buildCode: '2026.10.26.2',
    releaseDate: 'Outubro de 2026',
    badge: 'Versão Oficial Atual',
    title: 'GIPP v14.0.0 Ultimate Platinum v19 • Repertório Integral, EBD Exegética & Central de Updates',
    summary: 'A versão 14.0.0 consolida o maior avanço em ministério musical e pedagógico do GIPP: cifras 100% integrais sem cortes, lições completas de EBD com metadados editoriais oficiais, janela interativa de atualizações e auditoria SaaS em tempo real.',
    highlights: [
      {
        iconName: 'music',
        title: 'Repertório & Cifras 100% Integrais',
        description: 'Todas as canções cristãs e hinos da Harpa Cristã agora contam com acordes e letras completas do início ao fim: introdução, versos, pré-refrão, refrão, ponte e finalização. Zero músicas cortadas pela metade.',
        badge: 'Louvor & Harpa',
        color: 'from-amber-500 to-rose-500'
      },
      {
        iconName: 'book',
        title: 'Revista EBD com Metadados & Exegese Sólida',
        description: 'Novo cadastro completo da lição: título da revista, trimestre, turma, editora, data, número da lição e imagem da capa (online ou do computador). Conteúdo com profundidade exegética e sustentação bíblica.',
        badge: 'Ensino & EBD',
        color: 'from-emerald-500 to-teal-500'
      },
      {
        iconName: 'bell',
        title: 'Janela Automática de Novidades (Update)',
        description: 'Sempre que o sistema for atualizado, os usuários recebem uma janela explicativa com tudo o que mudou logo após o login. Uma vez fechada, não incomoda mais até a próxima atualização.',
        badge: 'Novo Recurso',
        color: 'from-indigo-500 to-purple-500'
      },
      {
        iconName: 'shield',
        title: 'Auditoria SaaS de Aparelhos em Tempo Real',
        description: 'Telemetria e auditoria autêntica de computadores, smartphones e tablets conectados sem simulações, com resolução de IP público e geolocalização física do operador.',
        badge: 'Segurança',
        color: 'from-blue-500 to-cyan-500'
      }
    ],
    categories: [
      {
        category: 'Ministério de Louvor & Repertório',
        iconName: 'music',
        items: [
          'Correção e expansão definitiva das canções: todas as estrofes, pontes e refrões incluídos sem abreviações.',
          'Atualização retroativa em cache: canções salvas anteriormente em versões resumidas são automaticamente restauradas na íntegra.',
          'Prompt aprimorado de inteligência artificial com teto de tokens estendido (8192) e proibição absoluta de encerramento precoce.',
          'Transposição harmônica (+/- semitons), capotraste dinâmico e auto-scroll fluido compatíveis com todas as seções da cifra.'
        ]
      },
      {
        category: 'Escola Bíblica Dominical (EBD)',
        iconName: 'book',
        items: [
          'Novos campos estruturados: Título da Revista, Trimestre, Turma, Subtítulo, Editora, Número e Título da Lição, Data da Lição.',
          'Importação de capa da lição direto do seu computador com corte/compressão rápida ou busca online.',
          'Geração e edição de lições ricas em teologia, histórico, fundamentação bíblica e aplicação prática para a vida diária.',
          'Perguntas de validação e fixação no final da lição para professores e alunos.'
        ]
      },
      {
        category: 'Experiência do Usuário & Plataforma',
        iconName: 'sparkles',
        items: [
          'Janela interativa de novidades da atualização disparada automaticamente no login para usuários que ainda não a visualizaram.',
          'Persistência local e inteligente: o aviso é exibido apenas uma vez por atualização, respeitando o foco de trabalho do operador.',
          'Otimizações de performance no carregamento de módulos e consumo de memória.',
          'Elevação do ecossistema para GIPP v13.1.0 Ultimate Platinum.'
        ]
      }
    ]
  },
  {
    version: '13.0.0',
    buildCode: '2026.10.15.1',
    releaseDate: 'Outubro de 2026',
    badge: 'Versão Anterior',
    title: 'Auditoria SaaS de Aparelhos, E-books Teológicos CGADB e Consolidação Ministerial',
    summary: 'Implementação de telemetria autêntica de rede, auditoria de hardware, integração com a Declaração de Fé das Assembleias de Deus e suporte a e-books interativos.',
    highlights: [
      {
        iconName: 'shield',
        title: 'Auditoria de Hardware SaaS',
        description: 'Detecção real de sistemas operacionais, sessões ativas e proteção de acessos concorrentes.',
        badge: 'Segurança'
      },
      {
        iconName: 'book',
        title: 'Universidade Teológica Dogmática',
        description: '24 capítulos da Declaração de Fé da CPAD/CGADB integrados à matriz curricular.',
        badge: 'Teologia'
      }
    ],
    categories: [
      {
        category: 'Teologia & Formação',
        iconName: 'book',
        items: [
          'Módulos Básico, Médio e Avançado com fundamentação pentecostal clássica.',
          'Quiz avaliativo com emissão de certificados.'
        ]
      }
    ]
  }
];

/**
 * Obtém a versão e dados da atualização mais recente
 */
export function getLatestSystemUpdate(): SystemUpdate {
  return SYSTEM_UPDATES_HISTORY[0];
}

/**
 * Verifica se o usuário atual já visualizou a atualização corrente.
 * Retorna true caso ainda NÃO tenha visualizado (necessário exibir a janela).
 */
export function shouldShowUpdateModal(userId?: string | null): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const latest = getLatestSystemUpdate();
    const userKey = userId ? String(userId) : 'default_operator';
    
    // Verifica por chave específica de versão do usuário
    const seenKey = `gipp_seen_update_${userKey}_v${latest.version}`;
    const alreadySeen = localStorage.getItem(seenKey);
    
    if (alreadySeen === 'true') {
      return false;
    }

    // Verifica também o registro global do navegador nesta máquina
    const deviceSeenKey = `gipp_device_seen_update_v${latest.version}`;
    const deviceSeen = localStorage.getItem(deviceSeenKey);
    if (deviceSeen === 'true') {
      return false;
    }

    return true;
  } catch (e) {
    console.warn('Erro ao verificar status de atualização:', e);
    return false;
  }
}

/**
 * Marca a atualização corrente como lida/visualizada pelo usuário.
 */
export function markUpdateAsSeen(userId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const latest = getLatestSystemUpdate();
    const userKey = userId ? String(userId) : 'default_operator';
    
    // Grava para o usuário
    localStorage.setItem(`gipp_seen_update_${userKey}_v${latest.version}`, 'true');
    localStorage.setItem(`gipp_last_seen_version_${userKey}`, latest.version);
    
    // Grava também para o navegador/aparelho
    localStorage.setItem(`gipp_device_seen_update_v${latest.version}`, 'true');
    localStorage.setItem('gipp_device_last_seen_version', latest.version);
  } catch (e) {
    console.warn('Erro ao gravar confirmação de atualização:', e);
  }
}
