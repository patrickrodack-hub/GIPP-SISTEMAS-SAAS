const fs = require('fs');
const file = 'src/components/ModuleManualUsuario.tsx';
let content = fs.readFileSync(file, 'utf8');

const newModule = `
  {
    id: 'revistas_interativas',
    title: 'Revistas Interativas IA',
    icon: BookOpen,
    description: 'Gestor dinâmico de revistas de estudo teológico para EBD em PDF e Canvas Híbrido.',
    topics: [
      {
        subtitle: 'Criação & IA',
        content: 'Este módulo permite a autoria e distribuição em massa de Revistas Interativas da EBD (com foco em publicações trimestrais da CPAD ou publicações autorais de currículos teológicos próprios). Os usuários podem utilizar a Inteligência Artificial Gemini integrada ao sistema para geração 100% autônoma e guiada de lições, devocionais diárias, aplicações didáticas e questionários baseados estritamente na Declaração de Fé em conformidade.'
      },
      {
        subtitle: 'Modo Leitura & Zoom HD',
        content: 'Totalmente responsivo: as lições se adaptam para uso em celulares, tablets ou Smart TVs durante projeções nas classes (suporte ao modo tela cheia). Os usuários interagem por meio do virar de páginas sonorizado real e uso do motor "Zoom In e Maximize HD".'
      },
      {
        subtitle: 'Exportação Dinâmica & Offline',
        content: 'Disponibilidade total do recurso "Gerar E-Book de Revista em PDF A4", onde as matrizes editoradas geram uma revista virtual padronizada na identidade visual da EBD e convertem vetores (HD Spooler) prontos para impressão em gráfica local.'
      }
    ]
  },
`;

content = content.replace("  // MATRIZ DE RECURSOS SAAS (v6.5.0)", newModule + "  // MATRIZ DE RECURSOS SAAS (v6.5.0)");

fs.writeFileSync(file, content);
