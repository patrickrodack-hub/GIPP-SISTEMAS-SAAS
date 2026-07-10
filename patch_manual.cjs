const fs = require('fs');
const file = 'src/components/ModuleManualUsuario.tsx';
let content = fs.readFileSync(file, 'utf8');

const newModule = `
  {
    id: 'gamificacao',
    title: 'Módulo Interativo & Gamificação',
    icon: Gamepad2,
    description: 'Manual de operação dos recursos interativos e minigames.',
    topics: [
      {
        subtitle: 'Tetris & Show do Cristão',
        content: 'O sistema possui módulos de lazer construtivo. O Tetris clássico estimula o foco, enquanto o Show do Cristão trabalha conhecimentos teológicos baseados na Declaração de Fé (CPAD/CGADB). Para jogar, acesse o "Portal do Membro" e abra a opção "Interatividade".'
      },
      {
        subtitle: 'Sistema de Pontuação & Score',
        content: 'Ambos os jogos salvam o recorde atual do usuário. No Show do Cristão, a tabela de pontuação é formatada em "Pts" e a listagem dinâmica centraliza e destaca o nível exato em que o usuário se encontra na partida atual.'
      },
      {
        subtitle: 'Painel Direcional Móvel',
        content: 'Em dispositivos móveis (ou ativado pelo botão Layout no desktop), um painel direcional surge na tela. Este painel flutuante pode ser arrastado livremente clicando/segurando a aba "Painel Direcional" para melhor ergonomia de cada usuário.'
      }
    ]
  },
`;

content = content.replace("  // MATRIZ DE RECURSOS SAAS (v6.5.0)", newModule + "  // MATRIZ DE RECURSOS SAAS (v6.5.0)");
content = content.replace("import {", "import { Gamepad2,");

fs.writeFileSync(file, content);
