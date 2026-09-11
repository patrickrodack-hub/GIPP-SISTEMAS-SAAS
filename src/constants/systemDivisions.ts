import React from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  ClipboardList,
  HeartHandshake,
  GraduationCap,
  Globe,
  Palette,
  Sparkles,
  Settings,
  FolderKanban,
  Code,
  LucideIcon
} from 'lucide-react';

export const isDeveloperUser = (user: any): boolean => {
  if (!user) return false;
  return Boolean(
    user.id === 'dev' ||
    user.nivel === 'dev' ||
    (typeof user.usuario === 'string' && user.usuario.toUpperCase() === 'PATRICK PESSOA') ||
    (typeof user.nome === 'string' && user.nome.toUpperCase() === 'PATRICK PESSOA')
  );
};

export interface SystemDivisionDef {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: LucideIcon;
  color: string;
  badgeBg: string;
  modules: string[];
}

export const SYSTEM_DIVISIONS: SystemDivisionDef[] = [
  {
    id: 'principal',
    name: 'Visão Geral & Início',
    shortName: 'Início',
    description: 'Painel geral, manuais e visão panorâmica da congregação',
    icon: LayoutDashboard,
    color: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    modules: ['dashboard', 'manual', 'amparo_legal', 'registro_software', 'changelog', 'sobre']
  },
  {
    id: 'administrativo',
    name: 'Administrativo & Cadastros',
    shortName: 'Administrativo',
    description: 'Gestão de membros, congregações, frotas e patrimônio',
    icon: Users,
    color: '#818cf8',
    badgeBg: 'rgba(129, 140, 248, 0.15)',
    modules: ['cad_membro', 'visitantes', 'cad_igreja', 'cad_patrimonio', 'controle_frotas', 'cad_celula', 'cad_usuario', 'acessos_portal']
  },
  {
    id: 'financeiro',
    name: 'Financeiro, RH & Tesouraria',
    shortName: 'Financeiro',
    description: 'Entradas, despesas, balancetes, conciliação e folha RH',
    icon: DollarSign,
    color: '#34d399',
    badgeBg: 'rgba(52, 211, 153, 0.15)',
    modules: ['fin_entrada', 'fin_saida', 'fin_dre', 'fin_conciliacao', 'fin_carnes', 'fin_utilitarios', 'dp_contabilidade']
  },
  {
    id: 'secretaria',
    name: 'Secretaria Eclesiástica',
    shortName: 'Secretaria',
    description: 'Atas, certificados, relatórios em PDF, bíblia e tarefas',
    icon: ClipboardList,
    color: '#fbbf24',
    badgeBg: 'rgba(251, 191, 36, 0.15)',
    modules: ['secretaria_integrada', 'secretaria_livro_atas', 'secretaria_certificados', 'relatorios', 'boletim', 'biblia', 'email_interno']
  },
  {
    id: 'ministerios',
    name: 'Ministérios & Cuidado Eclesiástico',
    shortName: 'Ministérios',
    description: 'Louvor, mídia local, família, salinha kids e missões',
    icon: HeartHandshake,
    color: '#f472b6',
    badgeBg: 'rgba(244, 114, 182, 0.15)',
    modules: ['cad_departamento', 'ministerio_louvor', 'ministerio_midia', 'ministerio_familia', 'salinha_kids', 'missoes_painel']
  },
  {
    id: 'ensino',
    name: 'Ensino, Teologia & EBD',
    shortName: 'Ensino / EBD',
    description: 'Escola Dominical, Teologia CGADB/CPAD e EAD de obreiros',
    icon: GraduationCap,
    color: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    modules: ['secretaria_ebd', 'curso_teologia', 'formacao_obreiros', 'gestao_cursos']
  },
  {
    id: 'google',
    name: 'Google Workspace Integrado',
    shortName: 'Google',
    description: 'Meet, Docs, Sheets, Forms, Calendar, Classroom e Gmail',
    icon: Globe,
    color: '#60a5fa',
    badgeBg: 'rgba(96, 165, 250, 0.15)',
    modules: ['google_meet', 'google_sheets', 'google_docs', 'google_tasks', 'google_calendar', 'gmail_oficial', 'google_forms', 'google_classroom']
  },
  {
    id: 'midia',
    name: 'Mídia, Artes & Produtividade',
    shortName: 'Mídia & Artes',
    description: 'GIPP DOCs, Planilhas, estúdio de artes e carteirinhas',
    icon: Palette,
    color: '#c084fc',
    badgeBg: 'rgba(192, 132, 252, 0.15)',
    modules: ['docs_editor', 'sheets_editor', 'carteirinha_studio', 'rede_social', 'interativo', 'credencial_lote', 'mensagens_lote', 'qr_checkin']
  },
  {
    id: 'pastoral',
    name: 'Área Pastoral & Inteligência Artificial',
    shortName: 'Pastoral & IA',
    description: 'Gabinete pastoral, aconselhamento e pastoral IA',
    icon: Sparkles,
    color: '#a855f7',
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    modules: ['portal_pastor', 'assistente_ai']
  },
  {
    id: 'sistema',
    name: 'Sistema, Governança & Suporte',
    shortName: 'Sistema',
    description: 'Configurações globais, visual, backup, auditoria e lixeira',
    icon: Settings,
    color: '#94a3b8',
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    modules: ['config_sistema', 'config_visual', 'config_backup', 'auditoria', 'lixeira', 'suporte_dev']
  },
  {
    id: 'desenvolvedor',
    name: 'Desenvolvedor & Engenharia (Master)',
    shortName: 'Desenvolvedor',
    description: 'Painel Master SaaS, telemetria e ferramentas exclusivas do desenvolvedor',
    icon: Code,
    color: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    modules: ['desenvolvedor', 'marketing_social']
  }
];

/**
 * Returns divisions available to the current user.
 * The 'desenvolvedor' division is strictly exclusive to the developer.
 */
export function getAvailableDivisions(user?: any): SystemDivisionDef[] {
  if (isDeveloperUser(user)) {
    return SYSTEM_DIVISIONS;
  }
  return SYSTEM_DIVISIONS.filter(div => div.id !== 'desenvolvedor');
}

// Fallback division for any module that is not explicitly in the list above
export const FALLBACK_DIVISION: SystemDivisionDef = {
  id: 'outros',
  name: 'Módulos Adicionais',
  shortName: 'Outros',
  description: 'Módulos complementares do ecossistema GIPP',
  icon: FolderKanban,
  color: '#0284c7',
  badgeBg: 'rgba(2, 132, 199, 0.15)',
  modules: []
};

/**
 * Returns the division for a specific module ID.
 */
export function getDivisionForModule(moduleId: string): SystemDivisionDef {
  const found = SYSTEM_DIVISIONS.find(div => div.modules.includes(moduleId));
  return found || FALLBACK_DIVISION;
}

export interface BaseModuleItem {
  id: string;
  label?: string;
  icon?: any;
  [key: string]: any;
}

/**
 * Groups an array of module items by their system division.
 * Returns an array of division groups with their matching modules.
 * Strictly prevents the 'desenvolvedor' division and modules from appearing for non-developers.
 */
export function groupModulesByDivision<T extends BaseModuleItem>(
  modules: T[],
  user?: any
): Array<{ division: SystemDivisionDef; items: T[] }> {
  const isDev = isDeveloperUser(user);
  const activeDivisions = isDev 
    ? SYSTEM_DIVISIONS 
    : SYSTEM_DIVISIONS.filter(div => div.id !== 'desenvolvedor');

  const map = new Map<string, { division: SystemDivisionDef; items: T[] }>();

  activeDivisions.forEach(div => {
    map.set(div.id, { division: div, items: [] });
  });

  const fallbackGroup: { division: SystemDivisionDef; items: T[] } = {
    division: FALLBACK_DIVISION,
    items: []
  };

  modules.forEach(mod => {
    // If not developer, strictly discard 'desenvolvedor'
    if (!isDev && mod.id === 'desenvolvedor') {
      return;
    }

    const div = getDivisionForModule(mod.id);
    if (!isDev && div.id === 'desenvolvedor') {
      return;
    }

    if (map.has(div.id)) {
      map.get(div.id)!.items.push(mod);
    } else {
      fallbackGroup.items.push(mod);
    }
  });

  const result: Array<{ division: SystemDivisionDef; items: T[] }> = [];

  activeDivisions.forEach(div => {
    const group = map.get(div.id);
    if (group && group.items.length > 0) {
      result.push(group);
    }
  });

  if (fallbackGroup.items.length > 0) {
    result.push(fallbackGroup);
  }

  return result;
}
