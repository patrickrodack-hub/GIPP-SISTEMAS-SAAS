const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
lines[3508] = "                     { titulo: \"Comunicação, Mídia & IA\", opcoes: [ { id: 'access_midia', label: 'Estúdio GIPP (Artes e Redes Sociais)' }, { id: 'access_boletim', label: 'Gestão do Boletim Digital' }, { id: 'access_email', label: 'Webmail Direto (Caixa de Entrada)' }, { id: 'access_ia', label: 'Assistente Pastoral IA' }, { id: 'access_interativo', label: 'Módulo Interativo & Gamificação' } ] },";
fs.writeFileSync('src/App.tsx', lines.join('\n'));
