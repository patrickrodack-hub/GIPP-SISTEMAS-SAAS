const fs = require('fs');
const file = 'src/components/ModuleUsuarios.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add to Comunicação & IA Pastoral
content = content.replace(
  "{ id: 'access_manual', label: 'Manual do Usuário GIPP' }",
  "{ id: 'access_manual', label: 'Manual do Usuário GIPP' },\n      { id: 'access_interativo', label: 'Módulo Interativo & Gamificação' }"
);

// Add to roles
content = content.replace(
  "'access_membros', 'access_visitantes', 'access_igreja', 'access_celulas', 'access_ministerios', 'access_sec_agenda', 'access_sec_certificados', 'access_ebd', 'access_revistas_interativas', 'access_salinha_kids', 'access_gestao_cursos', 'access_ia', 'access_boletim', 'access_sec_relatorios', 'access_missoes', 'access_manual', 'access_amparo_legal', 'access_registro_software', 'access_frotas'",
  "'access_membros', 'access_visitantes', 'access_igreja', 'access_celulas', 'access_ministerios', 'access_sec_agenda', 'access_sec_certificados', 'access_ebd', 'access_revistas_interativas', 'access_salinha_kids', 'access_gestao_cursos', 'access_ia', 'access_boletim', 'access_sec_relatorios', 'access_missoes', 'access_manual', 'access_amparo_legal', 'access_registro_software', 'access_frotas', 'access_interativo'"
);

content = content.replace(
  "'access_membros', 'access_visitantes', 'access_igreja', 'access_celulas', 'access_sec_agenda', 'access_sec_certificados', 'access_ebd', 'access_revistas_interativas', 'access_salinha_kids', 'access_gestao_cursos', 'access_boletim', 'access_sec_relatorios', 'access_manual', 'access_amparo_legal', 'access_registro_software'",
  "'access_membros', 'access_visitantes', 'access_igreja', 'access_celulas', 'access_sec_agenda', 'access_sec_certificados', 'access_ebd', 'access_revistas_interativas', 'access_salinha_kids', 'access_gestao_cursos', 'access_boletim', 'access_sec_relatorios', 'access_manual', 'access_amparo_legal', 'access_registro_software', 'access_interativo'"
);

content = content.replace(
  "'access_sec_agenda', 'access_ebd', 'access_revistas_interativas', 'access_gestao_cursos', 'access_manual'",
  "'access_sec_agenda', 'access_ebd', 'access_revistas_interativas', 'access_gestao_cursos', 'access_manual', 'access_interativo'"
);

content = content.replace(
  "'access_membros', 'access_visitantes', 'access_igreja', 'access_patrimonio', 'access_celulas', 'access_sec_agenda', 'access_sec_certificados', 'access_ebd', 'access_revistas_interativas', 'access_salinha_kids', 'access_gestao_cursos', 'access_boletim', 'access_midia', 'access_sec_relatorios', 'access_fin_entradas', 'access_fin_saidas', 'access_fin_analise', 'access_fin_carnes', 'access_fin_cadastros', 'access_config_sistema', 'access_config_visual', 'access_config_backup', 'access_auditoria', 'access_lixeira', 'access_manual', 'access_amparo_legal', 'access_registro_software', 'access_frotas'",
  "'access_membros', 'access_visitantes', 'access_igreja', 'access_patrimonio', 'access_celulas', 'access_sec_agenda', 'access_sec_certificados', 'access_ebd', 'access_revistas_interativas', 'access_salinha_kids', 'access_gestao_cursos', 'access_boletim', 'access_midia', 'access_sec_relatorios', 'access_fin_entradas', 'access_fin_saidas', 'access_fin_analise', 'access_fin_carnes', 'access_fin_cadastros', 'access_config_sistema', 'access_config_visual', 'access_config_backup', 'access_auditoria', 'access_lixeira', 'access_manual', 'access_amparo_legal', 'access_registro_software', 'access_frotas', 'access_interativo'"
);

fs.writeFileSync(file, content);
