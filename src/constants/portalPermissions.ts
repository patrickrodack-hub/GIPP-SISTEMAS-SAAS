// Constantes de Mapeamento do Portal de Membros por Função Administrativa
export const DEFAULT_PORTAL_PERMISSIONS: Record<string, string[]> = {
    'NENHUMA': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_frequencia', 'portal_carteirinha'],
    'PASTOR PRESIDENTE': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_email', 'portal_agenda', 'portal_tarefas', 'portal_financas', 'portal_ebd', 'portal_cursos', 'portal_candidato', 'portal_frequencia', 'portal_salinha_kids', 'portal_carteirinha', 'portal_pastor', 'portal_repertorio'],
    'PASTOR AUXILIAR': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_email', 'portal_agenda', 'portal_tarefas', 'portal_financas', 'portal_ebd', 'portal_cursos', 'portal_candidato', 'portal_frequencia', 'portal_salinha_kids', 'portal_carteirinha', 'portal_pastor', 'portal_repertorio'],
    'COORDENADOR': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_email', 'portal_agenda', 'portal_tarefas', 'portal_cursos', 'portal_candidato', 'portal_frequencia', 'portal_salinha_kids', 'portal_carteirinha'],
    'SUPERINTENDENTE': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_email', 'portal_agenda', 'portal_ebd', 'portal_cursos', 'portal_candidato', 'portal_frequencia', 'portal_salinha_kids', 'portal_carteirinha'],
    'SECRETARIO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_email', 'portal_agenda', 'portal_frequencia', 'portal_cursos', 'portal_candidato', 'portal_salinha_kids', 'portal_carteirinha'],
    'TESOUREIRO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_financas', 'portal_candidato', 'portal_salinha_kids', 'portal_carteirinha', 'portal_tesoureiro'],
    'CONTADOR': ['portal_home', 'portal_mural', 'portal_financas', 'portal_candidato', 'portal_carteirinha', 'portal_tesoureiro'],
    'ADMINISTRADOR': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_email', 'portal_agenda', 'portal_tarefas', 'portal_financas', 'portal_ebd', 'portal_cursos', 'portal_candidato', 'portal_frequencia', 'portal_salinha_kids', 'portal_carteirinha', 'portal_pastor', 'portal_tesoureiro', 'portal_repertorio'],
    'ADVOGADO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_candidato', 'portal_carteirinha'],
    'GERENTE': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_email', 'portal_agenda', 'portal_tarefas', 'portal_financas', 'portal_candidato', 'portal_salinha_kids', 'portal_carteirinha'],
    'COMUNICACAO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_email', 'portal_agenda', 'portal_tarefas', 'portal_cursos', 'portal_candidato', 'portal_salinha_kids', 'portal_carteirinha'],
    'DISCIPULADOR': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_email', 'portal_agenda', 'portal_tarefas', 'portal_cursos', 'portal_candidato', 'portal_frequencia', 'portal_salinha_kids', 'portal_carteirinha'],
    'LIDER_CELULA': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_frequencia', 'portal_candidato', 'portal_carteirinha'],
    'LIDER': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_frequencia', 'portal_candidato', 'portal_carteirinha'],
    'PROFESSOR': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_ebd', 'portal_cursos', 'portal_frequencia', 'portal_candidato', 'portal_salinha_kids', 'portal_carteirinha'],
    'PROFESSOR_EBD': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_ebd', 'portal_cursos', 'portal_frequencia', 'portal_candidato', 'portal_salinha_kids', 'portal_carteirinha'],
    'MONITOR': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_ebd', 'portal_frequencia', 'portal_candidato', 'portal_salinha_kids', 'portal_carteirinha'],
    'RECEPCAO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_frequencia', 'portal_carteirinha'],
    'PORTARIA': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_frequencia', 'portal_carteirinha'],
    'SOM': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha'],
    'MIDIA': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha'],
    'LOUVOR': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha', 'portal_repertorio'],
    'MUSICO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha', 'portal_repertorio'],
    'CANTO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha', 'portal_repertorio'],
    'INFANTIL': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_salinha_kids', 'portal_candidato', 'portal_carteirinha'],
    'DIACONATO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha'],
    'ZELEADOR': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha'],
    'LIMPEZA': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha'],
    'COZINHA': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha'],
    'MANUTENCAO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha'],
    'SEGURANCA': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha'],
    'OBREIRO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha'],
    'EVANGELISTA': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_cursos', 'portal_candidato', 'portal_frequencia', 'portal_carteirinha'],
    'MISSIONARIO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_cursos', 'portal_candidato', 'portal_frequencia', 'portal_carteirinha'],
    'PRESBITERO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_cursos', 'portal_candidato', 'portal_frequencia', 'portal_carteirinha'],
    'DIACONO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha'],
    'COOPERADOR': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha'],
    'MEMBRO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_candidato', 'portal_carteirinha'],
    'VISITANTE': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_carteirinha'],
    'CONGREGADO': ['portal_home', 'portal_mural', 'portal_informativo', 'portal_biblia', 'portal_agenda', 'portal_carteirinha'],
};

/**
 * Retorna uma lista de funções administrativas atribuídas ao membro/usuário.
 * Suporta tanto o array `funcoes_administrativas` quanto string única ou concatenada `funcao_administrativa`.
 */
export function getMemberFuncoesAdm(userOrMember: any): string[] {
    if (!userOrMember) return [];
    
    // 1. Array explícito de funções
    if (Array.isArray(userOrMember.funcoes_administrativas) && userOrMember.funcoes_administrativas.length > 0) {
        const list = userOrMember.funcoes_administrativas
            .map((f: any) => String(f).trim().toUpperCase())
            .filter((f: string) => f && f !== 'NENHUMA');
        if (list.length > 0) return Array.from(new Set(list));
    }
    
    // 2. String legada ou concatenada (ex: 'TESOUREIRO, MUSICO' ou 'TESOUREIRO / MUSICO')
    const raw = userOrMember.funcao_administrativa || userOrMember.funcao;
    if (typeof raw === 'string' && raw.trim() && raw.trim().toUpperCase() !== 'NENHUMA') {
        const list = raw
            .split(/[,/|;]+/)
            .map((f: string) => f.trim().toUpperCase())
            .filter((f: string) => f && f !== 'NENHUMA');
        if (list.length > 0) return Array.from(new Set(list));
    }
    
    return [];
}

/**
 * Retorna todos os módulos liberados para o membro no portal, unindo as permissões
 * de todas as suas funções administrativas caso possua múltiplas.
 */
export function getMemberPortalAllowedModules(
    member: any, 
    portalAcessosFuncao: Record<string, string[]> = {}
): string[] {
    const roles = getMemberFuncoesAdm(member);
    
    if (roles.length === 0) {
        return portalAcessosFuncao['NENHUMA'] || DEFAULT_PORTAL_PERMISSIONS['NENHUMA'] || [];
    }
    
    const modulesSet = new Set<string>();
    
    // Módulos base de todo membro
    const baseModules = portalAcessosFuncao['NENHUMA'] || DEFAULT_PORTAL_PERMISSIONS['NENHUMA'] || [];
    baseModules.forEach(m => modulesSet.add(m));
    
    // Módulos de cada uma das funções administrativas atribuídas
    roles.forEach(role => {
        const roleModules = portalAcessosFuncao[role] || DEFAULT_PORTAL_PERMISSIONS[role] || [];
        roleModules.forEach(m => modulesSet.add(m));
    });
    
    return Array.from(modulesSet);
}
